(function () {
  "use strict";

  const SCHEMA_VERSION = 2;
  const SOURCE_VALUES = new Set(["manual", "tracker_screenshot", "riot_sync", "henrik_sync", "demo", "legacy"]);
  const RESULT_VALUES = new Set(["win", "loss", "draw", "unknown"]);

  function uuid() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `match-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function cleanString(value, fallback = null) {
    const text = String(value ?? "").trim();
    return text || fallback;
  }

  function readNumber(value, fallback = null) {
    if (value === null || value === undefined || String(value).trim?.() === "") return fallback;
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function normalizeSource(value) {
    const source = cleanString(value, "legacy").toLowerCase();
    return SOURCE_VALUES.has(source) ? source : "legacy";
  }

  function normalizeResult(value) {
    const text = cleanString(value, "unknown").toLowerCase();
    if (["won", "victory", "w"].includes(text)) return "win";
    if (["lost", "defeat", "l"].includes(text)) return "loss";
    return RESULT_VALUES.has(text) ? text : "unknown";
  }

  function formatHenrikActLabel(value = "") {
    const shortCode = cleanString(value, "").toLowerCase();
    const match = shortCode.match(/^e(\d+)a(\d+)$/);
    return match ? `Episode ${Number(match[1])} Act ${Number(match[2])}` : cleanString(value);
  }

  function normalizeConfidence(value, fallback = "unknown") {
    const text = cleanString(value, fallback).toLowerCase();
    return ["high", "medium", "low", "unknown"].includes(text) ? text : fallback;
  }

  function confidenceMap(fields = {}, overall = "unknown") {
    const output = {};
    Object.entries(fields || {}).forEach(([key, value]) => {
      output[key] = normalizeConfidence(value);
    });
    return {
      overall: normalizeConfidence(overall),
      fields: output
    };
  }

  function cleanStringArray(values = []) {
    return Array.from(new Set((Array.isArray(values) ? values : []).map(value => cleanString(value)).filter(Boolean)));
  }

  function copyPlainObject(value = {}) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, item]));
  }

  function normalizeKillEvent(kill = {}) {
    return {
      killer: cleanString(kill.killer),
      victim: cleanString(kill.victim),
      assistants: cleanStringArray(kill.assistants),
      roundTime: readNumber(kill.roundTime)
    };
  }

  function normalizeEconomy(economy = {}) {
    return {
      loadoutValue: readNumber(economy.loadoutValue),
      weapon: cleanString(economy.weapon),
      armor: cleanString(economy.armor),
      remaining: readNumber(economy.remaining),
      spent: readNumber(economy.spent)
    };
  }

  function normalizeUtilityCasts(casts = {}) {
    return {
      grenade: readNumber(casts.grenade, 0),
      ability1: readNumber(casts.ability1 ?? casts.ability_1, 0),
      ability2: readNumber(casts.ability2 ?? casts.ability_2, 0),
      ultimate: readNumber(casts.ultimate, 0)
    };
  }

  function normalizeRoundEntry(round = {}, index = 0) {
    return {
      roundIndex: readNumber(round.roundIndex, index),
      roundNum: readNumber(round.roundNum, index + 1),
      side: ["attack", "defense"].includes(round.side) ? round.side : null,
      sideSource: cleanString(round.sideSource),
      attackingTeam: cleanString(round.attackingTeam),
      winningTeam: cleanString(round.winningTeam),
      won: Boolean(round.won),
      roundResult: cleanString(round.roundResult),
      roundResultCode: cleanString(round.roundResultCode),
      roundCeremony: cleanString(round.roundCeremony),
      bombPlanter: cleanString(round.bombPlanter),
      bombDefuser: cleanString(round.bombDefuser),
      playerEconomy: normalizeEconomy(round.playerEconomy),
      utilityCasts: normalizeUtilityCasts(round.utilityCasts),
      playerScore: readNumber(round.playerScore),
      damageDealt: readNumber(round.damageDealt, 0),
      wasAfk: Boolean(round.wasAfk),
      wasPenalized: Boolean(round.wasPenalized),
      stayedInSpawn: Boolean(round.stayedInSpawn),
      kills: (Array.isArray(round.kills) ? round.kills : []).map(normalizeKillEvent)
    };
  }

  function emptyRecord(overrides = {}) {
    const createdAt = cleanString(overrides.createdAt, nowISO());
    const playedAt = cleanString(overrides.playedAt, createdAt);
    return {
      schemaVersion: SCHEMA_VERSION,
      id: cleanString(overrides.id, uuid()),
      source: normalizeSource(overrides.source),
      createdAt,
      playedAt,
      season: cleanString(overrides.season),
      act: cleanString(overrides.act),
      matchNumber: readNumber(overrides.matchNumber),
      agent: cleanString(overrides.agent),
      role: cleanString(overrides.role),
      map: cleanString(overrides.map),
      result: normalizeResult(overrides.result),
      stats: {
        kills: readNumber(overrides.stats?.kills),
        deaths: readNumber(overrides.stats?.deaths),
        assists: readNumber(overrides.stats?.assists),
        acs: readNumber(overrides.stats?.acs),
        adr: readNumber(overrides.stats?.adr),
        hsPercent: readNumber(overrides.stats?.hsPercent),
        kdaText: cleanString(overrides.stats?.kdaText),
        scoreText: cleanString(overrides.stats?.scoreText)
      },
      rounds: {
        won: readNumber(overrides.rounds?.won),
        lost: readNumber(overrides.rounds?.lost)
      },
      trackedPlayer: {
        puuid: cleanString(overrides.trackedPlayer?.puuid),
        teamId: cleanString(overrides.trackedPlayer?.teamId),
        agentId: cleanString(overrides.trackedPlayer?.agentId),
        competitiveTier: readNumber(overrides.trackedPlayer?.competitiveTier),
        teammatePuuids: cleanStringArray(overrides.trackedPlayer?.teammatePuuids),
        behaviorFactors: copyPlainObject(overrides.trackedPlayer?.behaviorFactors)
      },
      roundByRound: (Array.isArray(overrides.roundByRound) ? overrides.roundByRound : []).map(normalizeRoundEntry),
      advanced: copyPlainObject(overrides.advanced),
      rank: {
        rank: cleanString(overrides.rank?.rank),
        rr: readNumber(overrides.rank?.rr),
        rrDelta: readNumber(overrides.rank?.rrDelta),
        elo: readNumber(overrides.rank?.elo),
        verified: overrides.rank?.verified === true,
        source: cleanString(overrides.rank?.source),
        capturedAt: cleanString(overrides.rank?.capturedAt),
        peakRank: cleanString(overrides.rank?.peakRank),
        peakRR: readNumber(overrides.rank?.peakRR)
      },
      reflection: {
        focus: cleanString(overrides.reflection?.focus),
        mood: cleanString(overrides.reflection?.mood),
        rating: readNumber(overrides.reflection?.rating),
        teamComms: readNumber(overrides.reflection?.teamComms),
        selfComms: readNumber(overrides.reflection?.selfComms),
        notes: cleanString(overrides.reflection?.notes),
        warmup: Boolean(overrides.reflection?.warmup)
      },
      confidence: confidenceMap(overrides.confidence?.fields, overrides.confidence?.overall),
      pendingVerification: Boolean(overrides.pendingVerification),
      importMeta: {
        imageId: cleanString(overrides.importMeta?.imageId),
        imageName: cleanString(overrides.importMeta?.imageName),
        screenshotType: cleanString(overrides.importMeta?.screenshotType),
        parseWarnings: Array.isArray(overrides.importMeta?.parseWarnings) ? overrides.importMeta.parseWarnings.slice() : [],
        rawText: cleanString(overrides.importMeta?.rawText)
      },
      legacyMatchId: cleanString(overrides.legacyMatchId),
      manualLogId: cleanString(overrides.manualLogId)
    };
  }

  function fromManualLogEntry(entry = {}) {
    const manual = entry.manualReport || entry.manual || {};
    const createdAt = cleanString(entry.createdAt, nowISO());
    return emptyRecord({
      id: cleanString(entry.matchId || entry.manualMatchId, `manual-${entry.id || uuid()}`),
      source: "manual",
      createdAt,
      playedAt: createdAt,
      agent: cleanString(entry.agent),
      role: cleanString(entry.role),
      map: cleanString(entry.map),
      result: manual.result,
      stats: {
        kills: manual.kills,
        deaths: manual.deaths,
        assists: manual.assists,
        acs: manual.acs,
        adr: manual.adr,
        hsPercent: manual.hs
      },
      rounds: {
        won: manual.roundsWon,
        lost: manual.roundsLost
      },
      rank: {
        rrDelta: manual.rr
      },
      reflection: {
        focus: entry.focus,
        mood: entry.mood,
        rating: entry.rating,
        teamComms: entry.teamComms,
        selfComms: entry.selfComms,
        notes: entry.notes,
        warmup: entry.warmup
      },
      confidence: {
        overall: "high",
        fields: {
          agent: entry.agent ? "high" : "unknown",
          map: entry.map ? "high" : "unknown",
          result: manual.result ? "high" : "unknown",
          stats: "medium",
          reflection: "high"
        }
      },
      pendingVerification: true,
      manualLogId: entry.id,
      legacyMatchId: entry.matchId || entry.manualMatchId
    });
  }

  function fromLegacyMatch(match = {}) {
    const metadata = match.metadata || {};
    const stats = match.segments?.[0]?.stats || {};
    const canonical = match.matchRecord || {};
    return emptyRecord({
      id: match.id || match.matchId || metadata.matchId || metadata.id,
      source: match.source || metadata.source || (match.manual ? "manual" : "legacy"),
      createdAt: match.createdAt || metadata.playedAt,
      playedAt: metadata.playedAt || match.createdAt,
      season: match.season || metadata.season,
      act: match.act || metadata.act,
      matchNumber: match.matchNumber || metadata.matchNumber,
      agent: metadata.agent || match.agent,
      map: metadata.mapName || match.map,
      result: metadata.result || match.result,
      stats: {
        kills: stats.kills?.value ?? match.kills,
        deaths: stats.deaths?.value ?? match.deaths,
        assists: stats.assists?.value ?? match.assists,
        acs: stats.scorePerRound?.value ?? match.acs,
        adr: stats.damagePerRound?.value ?? match.adr,
        hsPercent: stats.headshotsPercentage?.value ?? match.hs
      },
      rounds: {
        won: match.advanced?.roundsWon ?? match.manualReport?.roundsWon,
        lost: match.advanced?.roundsLost ?? match.manualReport?.roundsLost
      },
      trackedPlayer: canonical.trackedPlayer || match.trackedPlayer,
      roundByRound: canonical.roundByRound || match.roundByRound,
      advanced: canonical.advanced || match.advanced,
      rank: {
        rank: match.rank || metadata.rank || canonical.rank?.rank,
        rr: match.rrTotal ?? canonical.rank?.rr ?? match.rr,
        rrDelta: match.verifiedRrDelta ?? canonical.rank?.rrDelta ?? match.rr,
        elo: match.rankElo ?? metadata.rankElo ?? canonical.rank?.elo,
        verified: match.rrVerified === true || metadata.rrVerified === true || canonical.rank?.verified === true,
        source: match.rankDataSource || metadata.rankDataSource || canonical.rank?.source,
        capturedAt: match.rankCapturedAt || metadata.rankCapturedAt || canonical.rank?.capturedAt,
        peakRank: match.peakRank || canonical.rank?.peakRank,
        peakRR: match.peakRR ?? canonical.rank?.peakRR
      },
      confidence: match.matchRecord?.confidence || { overall: "high", fields: {} },
      pendingVerification: Boolean(match.pendingVerification),
      manualLogId: metadata.manualLogId || match.manualLogId,
      legacyMatchId: match.matchId || match.id
    });
  }

  function fromTrackerOcrMatch(match = {}, context = {}) {
    return emptyRecord({
      id: match.id || `tracker-ocr-${uuid()}`,
      source: "tracker_screenshot",
      createdAt: context.createdAt || nowISO(),
      playedAt: match.playedAt || context.playedAt || nowISO(),
      season: context.season || match.season,
      act: context.act || match.act,
      agent: match.agent,
      map: match.map,
      result: match.result,
      stats: {
        kills: match.kills,
        deaths: match.deaths,
        assists: match.assists,
        acs: match.acs,
        adr: match.adr,
        hsPercent: match.hsPercent,
        kdaText: match.kdaText,
        scoreText: match.scoreText
      },
      rank: {
        rank: match.rank || context.rank,
        rr: match.rr ?? context.rr,
        rrDelta: match.rrDelta,
        peakRank: context.peakRank,
        peakRR: context.peakRR
      },
      confidence: match.confidence || { overall: "low", fields: {} },
      pendingVerification: true,
      importMeta: {
        imageId: context.imageId,
        imageName: context.imageName,
        screenshotType: context.screenshotType || "recent_matches",
        parseWarnings: match.parseWarnings || [],
        rawText: context.rawText
      }
    });
  }

  function fromRiotMatch(match = {}, context = {}) {
    return emptyRecord({
      id: match.id || match.matchId,
      source: match.source || "riot_sync",
      createdAt: match.createdAt || match.playedAt || nowISO(),
      playedAt: match.playedAt || match.createdAt || nowISO(),
      season: context.season || match.season,
      act: context.act || match.act,
      agent: match.agent,
      role: match.role,
      map: match.map || match.mapName,
      result: match.result,
      stats: {
        kills: match.kills,
        deaths: match.deaths,
        assists: match.assists,
        acs: match.acs,
        adr: match.adr,
        hsPercent: match.hsPercent ?? match.hs
      },
      rounds: {
        won: match.roundsWon,
        lost: match.roundsLost
      },
      trackedPlayer: match.trackedPlayer,
      roundByRound: match.roundByRound,
      rank: {
        rank: match.rank,
        rr: match.rr,
        rrDelta: match.rrDelta,
        elo: match.rankElo,
        verified: match.rrVerified === true,
        source: match.rankDataSource,
        capturedAt: match.rankCapturedAt
      },
      confidence: { overall: "high", fields: {} },
      pendingVerification: false,
      legacyMatchId: match.matchId || match.id
    });
  }

  function getRawMatchData(payload = {}) {
    return payload?.data?.matchInfo ? payload.data : payload;
  }

  function getParsedMatchData(payload = {}) {
    return payload?.data?.metadata ? payload.data : payload;
  }

  function getTeamForSubject(teamBySubject, subject) {
    return cleanString(teamBySubject.get(cleanString(subject)));
  }

  function getOtherTeam(teamIds, teamId) {
    return teamIds.find(candidate => candidate !== teamId) || null;
  }

  function getRoundEvidenceAttackingTeam(round, teamBySubject, teamIds) {
    const planterTeam = getTeamForSubject(teamBySubject, round?.bombPlanter);
    if (planterTeam) return { teamId: planterTeam, source: "bomb_planter" };
    const defuserTeam = getTeamForSubject(teamBySubject, round?.bombDefuser);
    if (defuserTeam) return { teamId: getOtherTeam(teamIds, defuserTeam), source: "bomb_defuser" };
    return null;
  }

  function inferInitialAttackingTeam(rounds, teamBySubject, teamIds) {
    for (const round of rounds.slice(0, 12)) {
      const evidence = getRoundEvidenceAttackingTeam(round, teamBySubject, teamIds);
      if (evidence?.teamId) return evidence.teamId;
    }
    return teamIds.includes("Red") ? "Red" : teamIds[0] || null;
  }

  function getRoundAttackingTeam(round, index, teamBySubject, teamIds, initialAttackingTeam) {
    const evidence = getRoundEvidenceAttackingTeam(round, teamBySubject, teamIds);
    if (evidence?.teamId) return evidence;
    if (index < 12) return { teamId: initialAttackingTeam, source: "regulation_order" };
    if (index < 24) return { teamId: getOtherTeam(teamIds, initialAttackingTeam), source: "regulation_order" };
    const overtimeOffset = index - 24;
    return {
      teamId: overtimeOffset % 2 === 0 ? initialAttackingTeam : getOtherTeam(teamIds, initialAttackingTeam),
      source: "overtime_order"
    };
  }

  function fromHenrikRawMatch(rawPayload = {}, context = {}) {
    const raw = getRawMatchData(rawPayload);
    const parsed = getParsedMatchData(context.parsedMatch || {});
    const puuid = cleanString(context.puuid);
    if (!puuid) throw new Error("Henrik match mapping requires the tracked player's PUUID.");

    const players = Array.isArray(raw.players) ? raw.players : [];
    const player = players.find(entry => cleanString(entry?.subject) === puuid);
    if (!player) throw new Error("Tracked player was not found in the Henrik Raw match.");

    const parsedPlayers = Array.isArray(parsed?.players?.all_players) ? parsed.players.all_players : [];
    const parsedPlayer = parsedPlayers.find(entry => cleanString(entry?.puuid) === puuid) || {};
    const teamBySubject = new Map(players.map(entry => [cleanString(entry?.subject), cleanString(entry?.teamId)]));
    const teamIds = cleanStringArray(players.map(entry => entry?.teamId));
    const trackedTeam = cleanString(player.teamId);
    const teammatePuuids = players
      .filter(entry => cleanString(entry?.teamId) === trackedTeam && cleanString(entry?.subject) !== puuid)
      .map(entry => entry.subject);
    const rawRounds = Array.isArray(raw.roundResults) ? raw.roundResults : [];
    const initialAttackingTeam = inferInitialAttackingTeam(rawRounds, teamBySubject, teamIds);

    const roundByRound = rawRounds.map((round, index) => {
      const playerRound = (Array.isArray(round?.playerStats) ? round.playerStats : [])
        .find(entry => cleanString(entry?.subject) === puuid) || {};
      const economy = (Array.isArray(round?.playerEconomies) ? round.playerEconomies : [])
        .find(entry => cleanString(entry?.subject) === puuid) || playerRound.economy || {};
      const kills = (Array.isArray(round?.playerStats) ? round.playerStats : [])
        .flatMap(entry => Array.isArray(entry?.kills) ? entry.kills : []);
      const side = getRoundAttackingTeam(round, index, teamBySubject, teamIds, initialAttackingTeam);
      return {
        roundIndex: index,
        roundNum: readNumber(round?.roundNum, index) + 1,
        side: side.teamId === trackedTeam ? "attack" : "defense",
        sideSource: side.source,
        attackingTeam: side.teamId,
        winningTeam: round?.winningTeam,
        won: cleanString(round?.winningTeam) === trackedTeam,
        roundResult: round?.roundResult,
        roundResultCode: round?.roundResultCode,
        roundCeremony: round?.roundCeremony,
        bombPlanter: round?.bombPlanter,
        bombDefuser: round?.bombDefuser,
        playerEconomy: economy,
        utilityCasts: playerRound.abilityCasts || playerRound.ability_casts,
        playerScore: playerRound.score,
        damageDealt: (Array.isArray(playerRound.damage) ? playerRound.damage : [])
          .reduce((total, item) => total + (readNumber(item?.damage, 0) || 0), 0),
        wasAfk: playerRound.wasAfk,
        wasPenalized: playerRound.wasPenalized,
        stayedInSpawn: playerRound.stayedInSpawn,
        kills
      };
    });

    const team = (Array.isArray(raw.teams) ? raw.teams : []).find(entry => cleanString(entry?.teamId) === trackedTeam) || {};
    const roundsPlayed = readNumber(player.stats?.roundsPlayed, rawRounds.length) || rawRounds.length || 1;
    const totalDamage = (Array.isArray(player.roundDamage) ? player.roundDamage : [])
      .reduce((total, item) => total + (readNumber(item?.damage, 0) || 0), 0);
    const parsedStats = parsedPlayer.stats || {};
    const totalShots = [parsedStats.headshots, parsedStats.bodyshots, parsedStats.legshots]
      .reduce((total, value) => total + (readNumber(value, 0) || 0), 0);
    const roundsWon = readNumber(team.roundsWon, 0) || 0;
    const roundsLost = Math.max(0, readNumber(team.roundsPlayed, rawRounds.length) - roundsWon);

    return fromRiotMatch({
      id: raw.matchInfo?.matchId,
      matchId: raw.matchInfo?.matchId,
      source: "henrik_sync",
      createdAt: raw.matchInfo?.gameStartMillis ? new Date(raw.matchInfo.gameStartMillis).toISOString() : nowISO(),
      playedAt: raw.matchInfo?.gameStartMillis ? new Date(raw.matchInfo.gameStartMillis).toISOString() : nowISO(),
      season: raw.matchInfo?.seasonId,
      agent: context.agent || parsedPlayer.character || player.characterId,
      role: context.role,
      map: context.map || parsed.metadata?.map || raw.matchInfo?.mapId,
      result: team.won === true ? "win" : team.won === false ? "loss" : "unknown",
      kills: player.stats?.kills,
      deaths: player.stats?.deaths,
      assists: player.stats?.assists,
      acs: readNumber(player.stats?.score, 0) / roundsPlayed,
      adr: totalDamage / roundsPlayed,
      hsPercent: totalShots ? ((readNumber(parsedStats.headshots, 0) || 0) / totalShots) * 100 : null,
      roundsWon,
      roundsLost,
      rank: context.rank || parsedPlayer.currenttier_patched,
      rr: context.rr,
      rrDelta: context.rrDelta,
      trackedPlayer: {
        puuid,
        teamId: trackedTeam,
        agentId: player.characterId,
        competitiveTier: player.competitiveTier,
        teammatePuuids,
        behaviorFactors: player.behaviorFactors
      },
      roundByRound
    }, context);
  }

  function getV4PlayerId(player = {}) {
    return cleanString(player?.puuid || player);
  }

  function getV4PlayerTeam(player = {}) {
    return cleanString(player?.team || player?.team_id);
  }

  function normalizeV4Kill(kill = {}) {
    return {
      killer: getV4PlayerId(kill.killer),
      victim: getV4PlayerId(kill.victim),
      assistants: (Array.isArray(kill.assistants) ? kill.assistants : []).map(getV4PlayerId).filter(Boolean),
      roundTime: readNumber(kill.time_in_round_in_ms)
    };
  }

  function getV4RoundAttackingTeam(round = {}, index = 0, teamIds = [], initialAttackingTeam = null) {
    const planterTeam = getV4PlayerTeam(round.plant?.player);
    if (planterTeam) return { teamId: planterTeam, source: "bomb_planter" };
    const defuserTeam = getV4PlayerTeam(round.defuse?.player);
    if (defuserTeam) return { teamId: getOtherTeam(teamIds, defuserTeam), source: "bomb_defuser" };
    if (index < 12) return { teamId: initialAttackingTeam, source: "regulation_order" };
    if (index < 24) return { teamId: getOtherTeam(teamIds, initialAttackingTeam), source: "regulation_order" };
    return {
      teamId: (index - 24) % 2 === 0 ? initialAttackingTeam : getOtherTeam(teamIds, initialAttackingTeam),
      source: "overtime_order"
    };
  }

  function inferV4InitialAttackingTeam(rounds = [], teamIds = []) {
    for (const round of rounds.slice(0, 12)) {
      const planterTeam = getV4PlayerTeam(round?.plant?.player);
      if (planterTeam) return planterTeam;
      const defuserTeam = getV4PlayerTeam(round?.defuse?.player);
      if (defuserTeam) return getOtherTeam(teamIds, defuserTeam);
    }
    return teamIds.includes("Red") ? "Red" : teamIds[0] || null;
  }

  function fromHenrikV4Match(payload = {}, context = {}) {
    const match = payload?.data?.metadata?.match_id ? payload.data : payload;
    const puuid = cleanString(context.puuid);
    if (!puuid) throw new Error("Henrik match mapping requires the tracked player's PUUID.");

    const players = Array.isArray(match.players) ? match.players : [];
    const player = players.find(entry => getV4PlayerId(entry) === puuid);
    if (!player) throw new Error("Tracked player was not found in the Henrik match.");

    const trackedTeam = cleanString(player.team_id);
    const teamIds = cleanStringArray((Array.isArray(match.teams) ? match.teams : []).map(team => team?.team_id));
    const teammatePuuids = players
      .filter(entry => cleanString(entry?.team_id) === trackedTeam && getV4PlayerId(entry) !== puuid)
      .map(getV4PlayerId)
      .filter(Boolean);
    const rounds = Array.isArray(match.rounds) ? match.rounds : [];
    const kills = Array.isArray(match.kills) ? match.kills : [];
    const initialAttackingTeam = inferV4InitialAttackingTeam(rounds, teamIds);
    const roundByRound = rounds.map((round, index) => {
      const playerRound = (Array.isArray(round?.stats) ? round.stats : [])
        .find(entry => getV4PlayerId(entry?.player) === puuid) || {};
      const attack = getV4RoundAttackingTeam(round, index, teamIds, initialAttackingTeam);
      const economy = playerRound.economy || {};
      return {
        roundIndex: index,
        roundNum: readNumber(round?.id, index) + 1,
        side: attack.teamId === trackedTeam ? "attack" : "defense",
        sideSource: attack.source,
        attackingTeam: attack.teamId,
        winningTeam: round?.winning_team,
        won: cleanString(round?.winning_team) === trackedTeam,
        roundResult: round?.result,
        roundCeremony: round?.ceremony,
        bombPlanter: getV4PlayerId(round?.plant?.player),
        bombDefuser: getV4PlayerId(round?.defuse?.player),
        playerEconomy: {
          loadoutValue: economy.loadout_value,
          weapon: economy.weapon?.name,
          armor: economy.armor?.name,
          remaining: economy.remaining
        },
        utilityCasts: playerRound.ability_casts,
        playerScore: playerRound.stats?.score,
        damageDealt: (Array.isArray(playerRound.damage_events) ? playerRound.damage_events : [])
          .reduce((total, event) => total + (readNumber(event?.damage, 0) || 0), 0),
        wasAfk: playerRound.was_afk,
        wasPenalized: playerRound.received_penalty,
        stayedInSpawn: playerRound.stayed_in_spawn,
        kills: kills.filter(kill => readNumber(kill?.round) === index).map(normalizeV4Kill)
      };
    });

    const team = (Array.isArray(match.teams) ? match.teams : [])
      .find(entry => cleanString(entry?.team_id) === trackedTeam) || {};
    const roundsPlayed = rounds.length || (readNumber(team.rounds?.won, 0) || 0) + (readNumber(team.rounds?.lost, 0) || 0) || 1;
    const stats = player.stats || {};
    const totalShots = [stats.headshots, stats.bodyshots, stats.legshots]
      .reduce((total, value) => total + (readNumber(value, 0) || 0), 0);
    const seasonShort = cleanString(match.metadata?.season?.short);
    const mmrSnapshot = context?.mmrSnapshot && typeof context.mmrSnapshot === "object"
      ? context.mmrSnapshot
      : null;
    const snapshotTierId = readNumber(mmrSnapshot?.tier?.id, 0);
    const snapshotRR = readNumber(mmrSnapshot?.rr);
    const snapshotDelta = readNumber(mmrSnapshot?.last_change);
    const hasVerifiedRR = Boolean(snapshotTierId > 0 && snapshotRR !== null && snapshotDelta !== null);

    return fromRiotMatch({
      id: match.metadata?.match_id,
      matchId: match.metadata?.match_id,
      source: "henrik_sync",
      createdAt: match.metadata?.started_at,
      playedAt: match.metadata?.started_at,
      season: match.metadata?.season?.id,
      act: formatHenrikActLabel(seasonShort),
      agent: player.agent?.name,
      map: match.metadata?.map?.name,
      result: team.won === true ? "win" : team.won === false ? "loss" : "unknown",
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      acs: readNumber(stats.score, 0) / roundsPlayed,
      adr: readNumber(stats.damage?.dealt, 0) / roundsPlayed,
      hsPercent: totalShots ? ((readNumber(stats.headshots, 0) || 0) / totalShots) * 100 : null,
      roundsWon: team.rounds?.won,
      roundsLost: team.rounds?.lost,
      rank: hasVerifiedRR ? mmrSnapshot?.tier?.name : player.tier?.name,
      rr: hasVerifiedRR ? snapshotRR : null,
      rrDelta: hasVerifiedRR ? snapshotDelta : null,
      rankElo: hasVerifiedRR ? readNumber(mmrSnapshot?.elo) : null,
      rrVerified: hasVerifiedRR,
      rankDataSource: hasVerifiedRR ? "henrik-stored-mmr-v2" : null,
      rankCapturedAt: hasVerifiedRR ? mmrSnapshot?.date : null,
      trackedPlayer: {
        puuid,
        teamId: trackedTeam,
        agentId: player.agent?.id,
        competitiveTier: player.tier?.id,
        teammatePuuids,
        behaviorFactors: player.behavior
      },
      roundByRound
    }, context);
  }

  function toLegacyMatch(record = {}) {
    const normalized = record?.schemaVersion === SCHEMA_VERSION ? record : emptyRecord(record);
    const matchId = normalized.legacyMatchId || normalized.id;
    const projectedAdvanced = globalThis.RankedCoachRoundMetrics?.deriveAdvancedContextFromRoundByRound?.(normalized) || {};
    const projectedRoundMetrics = globalThis.RankedCoachRoundMetrics?.computeMatchRoundMetrics?.(normalized) || null;
    return {
      id: matchId,
      matchId,
      source: normalized.source,
      season: normalized.season,
      act: normalized.act,
      manual: normalized.source === "manual",
      pendingVerification: normalized.pendingVerification,
      rr: normalized.source === "henrik_sync" ? null : readNumber(normalized.rank.rrDelta),
      verifiedRrDelta: normalized.rank.verified === true ? readNumber(normalized.rank.rrDelta) : null,
      rrTotal: readNumber(normalized.rank.rr),
      rrVerified: normalized.rank.verified === true,
      rank: normalized.rank.rank,
      rankElo: readNumber(normalized.rank.elo),
      rankDataSource: normalized.rank.source,
      rankCapturedAt: normalized.rank.capturedAt,
      result: normalized.result,
      createdAt: normalized.playedAt || normalized.createdAt,
      agent: normalized.agent || "Unknown",
      map: normalized.map || "Unknown",
      matchRecord: normalized,
      roundMetrics: projectedRoundMetrics,
      metadata: {
        id: matchId,
        matchId,
        manualLogId: normalized.manualLogId || undefined,
        agent: normalized.agent || "Unknown",
        mapName: normalized.map || "Unknown",
        result: normalized.result,
        playedAt: normalized.playedAt || normalized.createdAt,
        source: normalized.source,
        season: normalized.season,
        act: normalized.act,
        rank: normalized.rank.rank,
        rrVerified: normalized.rank.verified === true,
        rankElo: readNumber(normalized.rank.elo),
        rankDataSource: normalized.rank.source,
        rankCapturedAt: normalized.rank.capturedAt
      },
      segments: [{
        type: "overview",
        stats: {
          kills: { value: readNumber(normalized.stats.kills, 0) },
          deaths: { value: readNumber(normalized.stats.deaths, 0) },
          assists: { value: readNumber(normalized.stats.assists, 0) },
          scorePerRound: { value: readNumber(normalized.stats.acs, 0) },
          damagePerRound: { value: readNumber(normalized.stats.adr, 0) },
          headshotsPercentage: { value: readNumber(normalized.stats.hsPercent, 0) }
        }
      }],
      manualReport: normalized.source === "manual" ? {
        result: normalized.result,
        rr: readNumber(normalized.rank.rrDelta, 0),
        roundsWon: normalized.rounds.won,
        roundsLost: normalized.rounds.lost,
        kills: readNumber(normalized.stats.kills, 0),
        deaths: readNumber(normalized.stats.deaths, 0),
        assists: readNumber(normalized.stats.assists, 0),
        acs: readNumber(normalized.stats.acs, 0),
        adr: readNumber(normalized.stats.adr, 0),
        hs: readNumber(normalized.stats.hsPercent, 0),
        pendingVerification: normalized.pendingVerification
      } : undefined,
      advanced: {
        ...(normalized.advanced || {}),
        ...projectedAdvanced,
        manual: normalized.source === "manual",
        roundsWon: normalized.rounds.won,
        roundsLost: normalized.rounds.lost
      }
    };
  }

  function getRuntimeRecords({ matches = [], logEntries = [], profile = null } = {}) {
    const sourceMatches = Array.isArray(profile?.matches) && profile.matches.length ? profile.matches : matches;
    const records = sourceMatches.map(fromLegacyMatch);
    const manualLogRecords = (logEntries || [])
      .filter(entry => entry?.manualReport || entry?.manual)
      .map(fromManualLogEntry);
    const seen = new Set(records.map(record => record.id));
    manualLogRecords.forEach(record => {
      if (!seen.has(record.id)) records.push(record);
    });
    return records;
  }

  globalThis.RankedCoachMatchRecord = Object.freeze({
    SCHEMA_VERSION,
    emptyRecord,
    fromManualLogEntry,
    fromLegacyMatch,
    fromTrackerOcrMatch,
    fromRiotMatch,
    fromHenrikRawMatch,
    fromHenrikV4Match,
    formatHenrikActLabel,
    toLegacyMatch,
    getRuntimeRecords,
    normalizeResult,
    readNumber
  });
})();
