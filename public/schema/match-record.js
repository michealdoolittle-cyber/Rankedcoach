(function () {
  "use strict";

  const SCHEMA_VERSION = 1;
  const SOURCE_VALUES = new Set(["manual", "tracker_screenshot", "riot_sync", "demo", "legacy"]);
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
      rank: {
        rank: cleanString(overrides.rank?.rank),
        rr: readNumber(overrides.rank?.rr),
        rrDelta: readNumber(overrides.rank?.rrDelta),
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
      rank: {
        rank: match.rank || metadata.rank,
        rr: match.rrTotal ?? match.rr,
        rrDelta: match.rr,
        peakRank: match.peakRank,
        peakRR: match.peakRR
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
      source: "riot_sync",
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
      rank: {
        rank: match.rank,
        rr: match.rr,
        rrDelta: match.rrDelta
      },
      confidence: { overall: "high", fields: {} },
      pendingVerification: false,
      legacyMatchId: match.matchId || match.id
    });
  }

  function toLegacyMatch(record = {}) {
    const normalized = record?.schemaVersion === SCHEMA_VERSION ? record : emptyRecord(record);
    const matchId = normalized.legacyMatchId || normalized.id;
    return {
      id: matchId,
      matchId,
      source: normalized.source,
      manual: normalized.source === "manual",
      pendingVerification: normalized.pendingVerification,
      rr: readNumber(normalized.rank.rrDelta, 0),
      rrTotal: readNumber(normalized.rank.rr),
      result: normalized.result,
      createdAt: normalized.playedAt || normalized.createdAt,
      agent: normalized.agent || "Unknown",
      map: normalized.map || "Unknown",
      matchRecord: normalized,
      metadata: {
        id: matchId,
        matchId,
        manualLogId: normalized.manualLogId || undefined,
        agent: normalized.agent || "Unknown",
        mapName: normalized.map || "Unknown",
        result: normalized.result,
        playedAt: normalized.playedAt || normalized.createdAt,
        source: normalized.source
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
    toLegacyMatch,
    getRuntimeRecords,
    normalizeResult,
    readNumber
  });
})();
