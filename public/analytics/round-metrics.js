(function () {
  "use strict";

  const TRADE_WINDOW_MS = 5000;

  function asCanonicalRecord(match = {}) {
    if (match?.roundByRound && match?.trackedPlayer) return match;
    if (match?.matchRecord?.roundByRound) return match.matchRecord;
    return null;
  }

  function evaluateKastRound(round = {}, trackedPlayer = {}) {
    const puuid = String(trackedPlayer?.puuid || "").trim();
    const teammatePuuids = new Set((trackedPlayer?.teammatePuuids || []).map(String));
    const kills = Array.isArray(round?.kills) ? round.kills : [];
    const gotKill = kills.some(kill => String(kill?.killer || "") === puuid);
    const gotAssist = kills.some(kill =>
      (Array.isArray(kill?.assistants) ? kill.assistants : []).some(assistant => String(assistant) === puuid)
    );
    const myDeath = kills.find(kill => String(kill?.victim || "") === puuid) || null;
    const survived = !myDeath;
    const deathTime = Number(myDeath?.roundTime);
    const traded = Boolean(myDeath && kills.some(kill => {
      const tradeTime = Number(kill?.roundTime);
      const elapsed = tradeTime - deathTime;
      return teammatePuuids.has(String(kill?.killer || ""))
        && String(kill?.victim || "") === String(myDeath?.killer || "")
        && Number.isFinite(elapsed)
        && elapsed >= 0
        && elapsed <= TRADE_WINDOW_MS;
    }));
    const counts = gotKill || gotAssist || survived || traded;
    const tradeSaved = traded;
    const tradeOnly = traded && !gotKill && !gotAssist && !survived;

    return {
      roundNum: Number(round?.roundNum) || null,
      side: round?.side === "attack" || round?.side === "defense" ? round.side : null,
      gotKill,
      gotAssist,
      survived,
      traded,
      tradeSaved,
      tradeOnly,
      counts,
      deathTime: Number.isFinite(deathTime) ? deathTime : null
    };
  }

  function summarizeEvaluations(evaluations = []) {
    const totalRounds = evaluations.length;
    const qualifyingRounds = evaluations.filter(round => round.counts).length;
    return {
      totalRounds,
      qualifyingRounds,
      percentage: totalRounds ? (qualifyingRounds / totalRounds) * 100 : null,
      tradeRounds: evaluations.filter(round => round.traded).length,
      tradeSavedRounds: evaluations.filter(round => round.tradeSaved).length,
      tradeOnlyRounds: evaluations.filter(round => round.tradeOnly).length
    };
  }

  function classifyLoadoutValue(value) {
    const loadoutValue = Number(value);
    if (!Number.isFinite(loadoutValue)) return "unknown";
    if (loadoutValue < 2000) return "eco";
    if (loadoutValue < 3500) return "light";
    return "full";
  }

  function getFirstKill(round = {}) {
    return (Array.isArray(round.kills) ? round.kills : [])
      .filter(kill => Number.isFinite(Number(kill?.roundTime)))
      .slice()
      .sort((a, b) => Number(a.roundTime) - Number(b.roundTime))[0] || null;
  }

  function getUtilityCastCount(round = {}) {
    return Object.values(round?.utilityCasts || {})
      .reduce((total, value) => total + (Number.isFinite(Number(value)) ? Number(value) : 0), 0);
  }

  function summarizeSide(rounds = [], evaluations = [], side = null) {
    const sideRounds = side ? rounds.filter(round => round?.side === side) : rounds.slice();
    const sideEvaluations = side ? evaluations.filter(round => round?.side === side) : evaluations.slice();
    const damage = sideRounds.map(round => Number(round?.damageDealt)).filter(Number.isFinite);
    return {
      roundsPlayed: sideRounds.length,
      roundsWon: sideRounds.filter(round => round?.won === true).length,
      firstBloods: sideEvaluations.filter(round => round?.gotFirstBlood).length,
      firstDeaths: sideEvaluations.filter(round => round?.wasFirstDeath).length,
      kast: summarizeEvaluations(sideEvaluations).percentage,
      damagePerRound: damage.length ? damage.reduce((sum, value) => sum + value, 0) / damage.length : null,
      kills: sideEvaluations.reduce((sum, round) => sum + Number(round?.killCount || 0), 0)
    };
  }

  function getRoundEvaluations(record = {}) {
    const rounds = Array.isArray(record?.roundByRound) ? record.roundByRound : [];
    const puuid = String(record?.trackedPlayer?.puuid || "").trim();
    return rounds.map(round => {
      const kast = evaluateKastRound(round, record.trackedPlayer);
      const firstKill = getFirstKill(round);
      const killCount = (Array.isArray(round?.kills) ? round.kills : [])
        .filter(kill => String(kill?.killer || "") === puuid).length;
      return {
        ...kast,
        gotFirstBlood: String(firstKill?.killer || "") === puuid,
        wasFirstDeath: String(firstKill?.victim || "") === puuid,
        killCount
      };
    });
  }

  function deriveAdvancedContextFromRoundByRound(match = {}) {
    const record = asCanonicalRecord(match) || match;
    if (!record?.trackedPlayer?.puuid || !Array.isArray(record?.roundByRound) || !record.roundByRound.length) return {};
    const rounds = record.roundByRound;
    const evaluations = getRoundEvaluations(record);
    const puuid = String(record.trackedPlayer.puuid);
    const projectedRounds = rounds.map((round, index) => {
      const firstKill = getFirstKill(round);
      const evaluation = evaluations[index];
      const utilityCastCount = getUtilityCastCount(round);
      return {
        round: Number(round?.roundNum) || index + 1,
        roundNum: Number(round?.roundNum) || index + 1,
        side: round?.side || null,
        buyType: classifyLoadoutValue(round?.playerEconomy?.loadoutValue),
        loadoutValue: Number.isFinite(Number(round?.playerEconomy?.loadoutValue)) ? Number(round.playerEconomy.loadoutValue) : null,
        spent: Number.isFinite(Number(round?.playerEconomy?.spent)) ? Number(round.playerEconomy.spent) : null,
        weapon: round?.playerEconomy?.weapon || null,
        roundWon: round?.won === true,
        killCount: Number(evaluation?.killCount) || 0,
        utilityCasts: { ...(round?.utilityCasts || {}) },
        utilityCastCount,
        utilityPattern: utilityCastCount ? "timing-unavailable" : "no-utility-recorded",
        firstEvent: String(firstKill?.killer || "") === puuid
          ? "first-blood"
          : String(firstKill?.victim || "") === puuid
            ? "first-death"
            : "other",
        damageDealt: Number(round?.damageDealt) || 0,
        roundCeremony: round?.roundCeremony || null,
        kastCounted: evaluation?.counts === true
      };
    });

    return {
      attack: summarizeSide(rounds, evaluations, "attack"),
      defense: summarizeSide(rounds, evaluations, "defense"),
      rounds: projectedRounds,
      utilityTimingAvailable: false
    };
  }

  function calculateStandardDeviation(values = []) {
    const numbers = values.map(Number).filter(Number.isFinite);
    if (!numbers.length) return { mean: null, standardDeviation: null, coefficientOfVariation: null };
    const mean = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    const variance = numbers.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numbers.length;
    const standardDeviation = Math.sqrt(variance);
    return {
      mean,
      standardDeviation,
      coefficientOfVariation: mean > 0 ? standardDeviation / mean : null
    };
  }

  function getEconomyEntry(round = {}, subject = "") {
    const normalizedSubject = String(subject || "").trim();
    return (Array.isArray(round?.combatantEconomies) ? round.combatantEconomies : [])
      .find(entry => String(entry?.subject || "").trim() === normalizedSubject) || null;
  }

  // These flags retain only the minimum structured evidence needed for a
  // possible coaching callout. Utility timing is intentionally not inferred.
  function deriveSituationalCoachingFlags(match = {}) {
    const record = asCanonicalRecord(match);
    if (!record?.trackedPlayer?.puuid || !Array.isArray(record?.roundByRound)) return [];

    const puuid = String(record.trackedPlayer.puuid);
    const teammatePuuids = new Set((record.trackedPlayer.teammatePuuids || []).map(String));
    const matchId = String(record.id || record.legacyMatchId || "").trim() || null;
    const agent = String(record.agent || "").trim() || null;
    const map = String(record.map || "").trim() || null;
    const flags = [];

    record.roundByRound.forEach((round, index) => {
      const kills = Array.isArray(round?.kills) ? round.kills : [];
      const death = kills.find(kill => String(kill?.victim || "") === puuid) || null;
      const deathTime = Number(death?.roundTime);
      const killer = String(death?.killer || "").trim();
      if (!death || !killer || !Number.isFinite(deathTime)) return;

      const base = {
        matchId,
        agent,
        map,
        round: Number.isFinite(Number(round?.roundNum)) ? Number(round.roundNum) : index + 1,
        timestampMs: deathTime
      };
      const traded = kills.some(kill => {
        const elapsed = Number(kill?.roundTime) - deathTime;
        return teammatePuuids.has(String(kill?.killer || ""))
          && String(kill?.victim || "") === killer
          && Number.isFinite(elapsed)
          && elapsed >= 0
          && elapsed <= TRADE_WINDOW_MS;
      });
      if (!traded) flags.push({ ...base, pattern: "untraded-death" });

      const playerLoadout = Number(round?.playerEconomy?.loadoutValue);
      const killerLoadout = Number(getEconomyEntry(round, killer)?.loadoutValue);
      if (Number.isFinite(playerLoadout) && Number.isFinite(killerLoadout) && killerLoadout - playerLoadout >= 1600) {
        flags.push({ ...base, pattern: "economy-mismatched-engagement" });
      }

      const teammateUtilityCasts = Number(round?.teammateUtilityCasts);
      if (deathTime <= 10000 && Number.isFinite(teammateUtilityCasts) && teammateUtilityCasts === 0) {
        flags.push({ ...base, pattern: "early-entry-before-utility" });
      }
    });

    return flags;
  }

  function computeMatchRoundMetrics(match = {}) {
    if (match?.roundMetrics?.totalRounds && match?.matchRecord?.roundByRound) return match.roundMetrics;
    const record = asCanonicalRecord(match);
    if (!record?.trackedPlayer?.puuid || !Array.isArray(record?.roundByRound) || !record.roundByRound.length) return null;
    const puuid = String(record.trackedPlayer.puuid);
    const teammatePuuids = new Set((record.trackedPlayer.teammatePuuids || []).map(String));
    const opponentPuuids = new Set((record.trackedPlayer.opponentPuuids || []).map(String));
    const evaluations = getRoundEvaluations(record);
    const ceremonyCounts = {};
    const multiKills = { kills2K: 0, kills3K: 0, kills4K: 0, kills5K: 0 };
    let clutchRounds = 0;
    let clutchWins = 0;
    let tradeGivenOpportunities = 0;
    let tradeGivenRounds = 0;

    record.roundByRound.forEach((round, index) => {
      const ceremony = String(round?.roundCeremony || "Unknown");
      ceremonyCounts[ceremony] = (ceremonyCounts[ceremony] || 0) + 1;
      const kills = Array.isArray(round?.kills) ? round.kills : [];
      const playerKills = kills.filter(kill => String(kill?.killer || "") === puuid);
      const count = playerKills.length;
      if (count === 2) multiKills.kills2K += 1;
      else if (count === 3) multiKills.kills3K += 1;
      else if (count === 4) multiKills.kills4K += 1;
      else if (count >= 5) multiKills.kills5K += 1;

      // A clutch opportunity is a real 1vX state with at least two opponents alive.
      // CeremonyCloser and a final kill are not enough evidence: both can occur in
      // ordinary late rounds where teammates are still alive.
      if (teammatePuuids.size && opponentPuuids.size >= 2) {
        const aliveAllies = new Set([puuid, ...teammatePuuids]);
        const aliveOpponents = new Set(opponentPuuids);
        let clutchStarted = false;
        let clutchKills = 0;
        kills
          .filter(kill => Number.isFinite(Number(kill?.roundTime)))
          .slice()
          .sort((a, b) => Number(a.roundTime) - Number(b.roundTime))
          .forEach((kill) => {
            const victim = String(kill?.victim || "");
            if (aliveAllies.has(victim)) aliveAllies.delete(victim);
            if (aliveOpponents.has(victim)) aliveOpponents.delete(victim);
            if (!clutchStarted && aliveAllies.size === 1 && aliveAllies.has(puuid) && aliveOpponents.size >= 2) {
              clutchStarted = true;
            }
            if (clutchStarted && String(kill?.killer || "") === puuid && opponentPuuids.has(victim)) {
              clutchKills += 1;
            }
          });
        if (clutchStarted && clutchKills >= 2) {
          clutchRounds += 1;
          if (round?.won === true && aliveAllies.has(puuid)) clutchWins += 1;
        }
      }

      const teammateDeaths = kills.filter(kill => teammatePuuids.has(String(kill?.victim || "")));
      let gaveTradeThisRound = false;
      if (teammateDeaths.length) tradeGivenOpportunities += 1;
      teammateDeaths.forEach(death => {
        const deathTime = Number(death?.roundTime);
        const traded = kills.some(kill => {
          const elapsed = Number(kill?.roundTime) - deathTime;
          return String(kill?.killer || "") === puuid
            && String(kill?.victim || "") === String(death?.killer || "")
            && Number.isFinite(elapsed)
            && elapsed >= 0
            && elapsed <= TRADE_WINDOW_MS;
        });
        if (traded) gaveTradeThisRound = true;
      });
      if (gaveTradeThisRound) tradeGivenRounds += 1;
    });

    const kast = computeMatchKast(record);
    const damage = calculateStandardDeviation(record.roundByRound.map(round => round?.damageDealt));
    const behavior = record.trackedPlayer.behaviorFactors || {};
    const afkRounds = Math.max(
      record.roundByRound.filter(round => round?.wasAfk === true).length,
      Number(behavior.afkRounds ?? behavior.afk_rounds) || 0
    );
    const stayedInSpawnRounds = Math.max(
      record.roundByRound.filter(round => round?.stayedInSpawn === true).length,
      Number(behavior.stayedInSpawnRounds ?? behavior.stayed_in_spawn_rounds) || 0
    );
    const deaths = evaluations.filter(round => round?.deathTime !== null).length;

    return {
      matchId: record.id || record.legacyMatchId || null,
      totalRounds: record.roundByRound.length,
      roundsWon: record.roundByRound.filter(round => round?.won === true).length,
      ceremonyCounts,
      clutchRounds,
      clutchWins,
      clutchDefinition: "1vX multi-kill",
      clutchConversionRate: clutchRounds ? (clutchWins / clutchRounds) * 100 : null,
      multiKills,
      trade: {
        receivedOpportunities: deaths,
        receivedRounds: Number(kast?.overall?.tradeSavedRounds) || 0,
        receivedRate: deaths ? ((Number(kast?.overall?.tradeSavedRounds) || 0) / deaths) * 100 : null,
        givenOpportunities: tradeGivenOpportunities,
        givenRounds: tradeGivenRounds,
        givenRate: tradeGivenOpportunities ? (tradeGivenRounds / tradeGivenOpportunities) * 100 : null
      },
      damage,
      discipline: {
        afkRounds,
        stayedInSpawnRounds,
        friendlyFireOutgoing: Number(behavior.friendlyFireOutgoing ?? behavior.friendly_fire_outgoing) || 0,
        affected: afkRounds > 0 || stayedInSpawnRounds > 0
      },
      situationalFlags: deriveSituationalCoachingFlags(record),
      kast
    };
  }

  function aggregateMatchRoundMetrics(matches = []) {
    const matchMetrics = (Array.isArray(matches) ? matches : []).map(computeMatchRoundMetrics).filter(Boolean);
    const totals = {
      totalRounds: 0,
      roundsWon: 0,
      clutchRounds: 0,
      clutchWins: 0,
      kills2K: 0,
      kills3K: 0,
      kills4K: 0,
      kills5K: 0,
      tradeReceivedOpportunities: 0,
      tradeReceivedRounds: 0,
      tradeGivenOpportunities: 0,
      tradeGivenRounds: 0,
      afkRounds: 0,
      stayedInSpawnRounds: 0
    };
    const ceremonyCounts = {};
    matchMetrics.forEach(metric => {
      Object.keys(totals).forEach(key => {
        const source = {
          tradeReceivedOpportunities: metric.trade.receivedOpportunities,
          tradeReceivedRounds: metric.trade.receivedRounds,
          tradeGivenOpportunities: metric.trade.givenOpportunities,
          tradeGivenRounds: metric.trade.givenRounds,
          afkRounds: metric.discipline.afkRounds,
          stayedInSpawnRounds: metric.discipline.stayedInSpawnRounds,
          ...metric.multiKills,
          ...metric
        };
        totals[key] += Number(source[key]) || 0;
      });
      Object.entries(metric.ceremonyCounts).forEach(([key, value]) => {
        ceremonyCounts[key] = (ceremonyCounts[key] || 0) + Number(value || 0);
      });
    });
    const records = matchMetrics.map(metric => asCanonicalRecord((matches || []).find(match => {
      const record = asCanonicalRecord(match);
      return String(record?.id || record?.legacyMatchId || "") === String(metric.matchId || "");
    }))).filter(Boolean);
    const damage = calculateStandardDeviation(records.flatMap(record => record.roundByRound.map(round => round?.damageDealt)));
    const affectedMatches = matchMetrics.filter(metric => metric.discipline.affected).length;
    return {
      matches: matchMetrics.length,
      ...totals,
      ceremonyCounts,
      clutchConversionRate: totals.clutchRounds ? (totals.clutchWins / totals.clutchRounds) * 100 : null,
      clutchDefinition: "1vX multi-kill",
      multiKillRounds: totals.kills2K + totals.kills3K + totals.kills4K + totals.kills5K,
      tradeReceivedRate: totals.tradeReceivedOpportunities ? (totals.tradeReceivedRounds / totals.tradeReceivedOpportunities) * 100 : null,
      tradeGivenRate: totals.tradeGivenOpportunities ? (totals.tradeGivenRounds / totals.tradeGivenOpportunities) * 100 : null,
      damage,
      discipline: {
        affectedMatches,
        afkRounds: totals.afkRounds,
        stayedInSpawnRounds: totals.stayedInSpawnRounds
      },
      matchMetrics
    };
  }

  function computeMatchKast(match = {}) {
    const record = asCanonicalRecord(match);
    if (!record?.trackedPlayer?.puuid || !Array.isArray(record?.roundByRound) || !record.roundByRound.length) {
      return null;
    }
    const rounds = record.roundByRound.map(round => evaluateKastRound(round, record.trackedPlayer));
    return {
      matchId: record.id || record.legacyMatchId || null,
      overall: summarizeEvaluations(rounds),
      attack: summarizeEvaluations(rounds.filter(round => round.side === "attack")),
      defense: summarizeEvaluations(rounds.filter(round => round.side === "defense")),
      rounds
    };
  }

  function aggregateMatchKast(matches = []) {
    const matchMetrics = (Array.isArray(matches) ? matches : []).map(computeMatchKast).filter(Boolean);
    const rounds = matchMetrics.flatMap(match => match.rounds);
    return {
      matches: matchMetrics.length,
      overall: summarizeEvaluations(rounds),
      attack: summarizeEvaluations(rounds.filter(round => round.side === "attack")),
      defense: summarizeEvaluations(rounds.filter(round => round.side === "defense")),
      rounds,
      matchMetrics
    };
  }

  globalThis.RankedCoachRoundMetrics = Object.freeze({
    TRADE_WINDOW_MS,
    evaluateKastRound,
    classifyLoadoutValue,
    deriveAdvancedContextFromRoundByRound,
    deriveSituationalCoachingFlags,
    computeMatchKast,
    aggregateMatchKast,
    computeMatchRoundMetrics,
    aggregateMatchRoundMetrics
  });
})();
