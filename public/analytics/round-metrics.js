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
    computeMatchKast,
    aggregateMatchKast
  });
})();
