(function () {
  "use strict";

  const SCHEMA_VERSION = 3;
  const SOURCE_VALUES = new Set(["manual", "tracker_screenshot", "riot_sync", "henrik_sync", "demo", "legacy"]);
  const RESULT_VALUES = new Set(["win", "loss", "draw", "unknown"]);
  const VALORANT_WEAPON_UUID_LABELS = Object.freeze({
    "29a0cfab-485b-f5d5-779a-b59f85e204a8": "Classic",
    "42da8ccc-40d5-affc-beec-15aa47b42eda": "Shorty",
    "44d4e95c-4157-0037-81b2-17841bf2e8e3": "Frenzy",
    "1baa85b4-4c70-1284-64bb-6481dfc3bb4e": "Ghost",
    "e336c6b8-418d-9340-d77f-7a9e4cfe0702": "Sheriff",
    "f7e1b454-4ad4-1063-ec0a-159e56b58941": "Stinger",
    "462080d1-4035-2937-7c09-27aa2a5c27a7": "Spectre",
    "910be174-449b-c412-ab22-d0873436b21b": "Bucky",
    "ec845bf4-4f79-ddda-a3da-0db3774b2794": "Judge",
    "ae3de142-4d85-2547-dd26-4e90bed35cf7": "Bulldog",
    "4ade7faa-4cf1-8376-95ef-39884480959b": "Guardian",
    "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c": "Outlaw",
    "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a": "Phantom",
    "9c82e19d-4575-0200-1a81-3eacf00cf872": "Vandal",
    "55d8a0f4-4274-ca67-fe2c-06ab45efdf58": "Ares",
    "63e6c2b6-4a8e-869c-3d4c-e38355226584": "Odin",
    "c4883e50-4494-202c-3ec3-6b8a9284f00b": "Marshal",
    "a03b24d3-4319-996d-0f8c-94bbfba1dfc7": "Operator",
    // Agent weapons are reported by the raw match feed as weapon UUIDs too.
    // Keep them readable rather than exposing their internal equip IDs.
    "856d9a7e-4b06-dc37-15dc-9d809c37cb90": "Headhunter",
    "2f59173c-4bed-b6c3-2191-dea9b58be9c7": "Melee"
  });
  const VALORANT_WEAPON_NAME_LABELS = Object.freeze(Object.fromEntries(
    Object.values(VALORANT_WEAPON_UUID_LABELS).map(label => [label.toLowerCase().replace(/[^a-z0-9]+/g, ""), label])
  ));
  const HENRIK_DAMAGE_SLOT_LABELS = Object.freeze({
    ability1: "Ability 1",
    ability2: "Ability 2",
    grenadeability: "Signature Ability",
    signatureability: "Signature Ability",
    ultimate: "Ultimate",
    melee: "Melee"
  });

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

  function normalizeLookupKey(value = "") {
    return cleanString(value, "")?.toLowerCase().replace(/[^a-z0-9]+/g, "") || "";
  }

  function looksLikeRawUuid(value = "") {
    return /^[0-9a-f-]{24,}$/i.test(String(value || "").trim());
  }

  function resolveKillWeaponLabel(...candidates) {
    for (const candidate of candidates) {
      const text = cleanString(candidate, "");
      if (!text) continue;
      const lower = text.toLowerCase();
      if (VALORANT_WEAPON_UUID_LABELS[lower]) return VALORANT_WEAPON_UUID_LABELS[lower];
      const normalized = normalizeLookupKey(text);
      if (HENRIK_DAMAGE_SLOT_LABELS[normalized]) return HENRIK_DAMAGE_SLOT_LABELS[normalized];
      if (VALORANT_WEAPON_NAME_LABELS[normalized]) return VALORANT_WEAPON_NAME_LABELS[normalized];
      if (!looksLikeRawUuid(text)) return text;
    }
    return "";
  }

  function resolveKillWeaponType(rawType = "", weaponName = "", weaponId = "") {
    const type = cleanString(rawType, "");
    if (type) return type;
    const normalizedId = normalizeLookupKey(weaponId);
    const normalizedName = normalizeLookupKey(weaponName);
    if (HENRIK_DAMAGE_SLOT_LABELS[normalizedId] || HENRIK_DAMAGE_SLOT_LABELS[normalizedName]) return "Ability";
    if (weaponName || weaponId) return "Weapon";
    return "";
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

  function normalizeQueueInfo(...sources) {
    const output = {
      id: null,
      name: null,
      modeType: null
    };
    sources.forEach((source) => {
      if (!source) return;
      if (typeof source === "string") {
        output.id ||= cleanString(source);
        return;
      }
      if (typeof source !== "object") return;
      output.id ||= cleanString(source.id || source.queueId || source.queueID || source.mode || source.modeId || source.uuid);
      output.name ||= cleanString(source.name || source.queueName || source.displayName || source.localizedName);
      output.modeType ||= cleanString(source.modeType || source.mode_type || source.queueModeType || source.type);
    });
    return output;
  }

  function formatHenrikActLabel(value = "") {
    const label = cleanString(value, "");
    const normalized = label.toLowerCase();
    const match = normalized.match(/^e(\d+)a(\d+)$/)
      || normalized.match(/^episode\s+(\d+)\s+act\s+(\d+)$/);
    if (!match) return label;
    const episode = Number(match[1]);
    const act = Number(match[2]);
    return episode <= 9
      ? `Episode ${episode} Act ${act}`
      : `Season ${episode + 2015} Act ${act}`;
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

  function cloneJsonValue(value) {
    if (value === null || value === undefined) return null;
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error) {
      console.warn?.("Unable to clone raw Henrik payload", error);
      return null;
    }
  }

  function getHenrikV4MatchData(payload = {}) {
    return payload?.data?.metadata?.match_id ? payload.data : payload;
  }

  function assessHenrikV4PayloadCompleteness(payload = {}, puuid = "") {
    const match = getHenrikV4MatchData(payload);
    const trackedPuuid = cleanString(puuid);
    const players = Array.isArray(match?.players) ? match.players : [];
    const player = players.find(entry => getV4PlayerId(entry) === trackedPuuid) || null;
    const stats = player?.stats || {};
    const missing = [];
    const requireNumber = (label, value) => {
      if (readNumber(value) === null) missing.push(label);
    };

    if (!match?.metadata?.match_id) missing.push("metadata.match_id");
    if (!trackedPuuid) missing.push("context.puuid");
    if (!player) missing.push("players.trackedPlayer");
    requireNumber("stats.kills", stats.kills);
    requireNumber("stats.deaths", stats.deaths);
    requireNumber("stats.assists", stats.assists);
    requireNumber("stats.score", stats.score);
    requireNumber("stats.damage.dealt", stats.damage?.dealt);
    requireNumber("stats.headshots", stats.headshots);
    requireNumber("stats.bodyshots", stats.bodyshots);
    requireNumber("stats.legshots", stats.legshots);
    if (!Array.isArray(match?.rounds) || !match.rounds.length) missing.push("rounds");

    return {
      complete: missing.length === 0,
      missing,
      checkedAt: nowISO(),
      source: "henrik-v4"
    };
  }

  function isHenrikV4PayloadComplete(payload = {}, puuid = "") {
    return assessHenrikV4PayloadCompleteness(payload, puuid).complete === true;
  }

  function normalizeParticipantId(value) {
    if (value && typeof value === "object") {
      return cleanString(
        value.puuid
        || value.subject
        || value.id
        || value.uuid
        || value.playerId
        || value.player_id
      );
    }
    return cleanString(value);
  }

  function normalizeKillEvent(kill = {}) {
    const weapon = kill.weapon && typeof kill.weapon === "object" ? kill.weapon : {};
    const finishingDamage = kill.finishingDamage && typeof kill.finishingDamage === "object" ? kill.finishingDamage : {};
    const weaponId = cleanString(
      kill.weaponId
      || weapon.id
      || weapon.uuid
      || (finishingDamage.damageType === "Weapon" || finishingDamage.damageType === "Ability" ? finishingDamage.damageItem : "")
    );
    const resolvedWeaponName = resolveKillWeaponLabel(
      kill.weaponName,
      kill.damageWeapon,
      weapon.name,
      weapon.displayName,
      finishingDamage.damageItemName,
      typeof kill.weapon === "string" ? kill.weapon : "",
      weaponId
    );
    const weaponType = resolveKillWeaponType(kill.weaponType || weapon.type || finishingDamage.damageType, resolvedWeaponName, weaponId);
    // Never surface an internal equip UUID as a player-facing weapon name.
    // Keep an unrecognised real weapon explicit until its canonical label can
    // be added, rather than guessing at what it was.
    const weaponName = resolvedWeaponName || (weaponType === "Weapon" && weaponId ? "Unidentified weapon" : "");
    return {
      killer: normalizeParticipantId(kill.killer || kill.killerPuuid || kill.killer_puuid || kill.killerId || kill.killer_id),
      victim: normalizeParticipantId(kill.victim || kill.victimPuuid || kill.victim_puuid || kill.victimId || kill.victim_id),
      assistants: cleanStringArray((Array.isArray(kill.assistants) ? kill.assistants : []).map(normalizeParticipantId)),
      roundTime: readNumber(kill.roundTime),
      weapon: weaponName,
      weaponId,
      weaponType,
      secondaryFireMode: Boolean(kill.secondaryFireMode ?? kill.secondary_fire_mode ?? finishingDamage.isSecondaryFireMode)
    };
  }

  function normalizeEconomy(economy = {}) {
    const weapon = economy?.weapon;
    const weaponDetails = weapon && typeof weapon === "object" ? weapon : {};
    return {
      loadoutValue: readNumber(economy.loadoutValue),
      // Henrik V4 supplies a weapon object while older Raw payloads may use a
      // label or UUID. Preserve one canonical readable label for both paths;
      // String(object) used to leave "[object Object]" here, which made every
      // round fall into the app's "Other" weapon bucket.
      weapon: resolveKillWeaponLabel(
        weaponDetails.name,
        weaponDetails.displayName,
        weaponDetails.id,
        weaponDetails.uuid,
        typeof weapon === "string" ? weapon : ""
      ),
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

  function getUtilityCastCount(casts = {}) {
    return Object.values(normalizeUtilityCasts(casts))
      .reduce((total, value) => total + (Number(value) || 0), 0);
  }

  function normalizeCombatantEconomies(entries = []) {
    return (Array.isArray(entries) ? entries : []).map(entry => ({
      subject: cleanString(entry?.subject),
      teamId: cleanString(entry?.teamId),
      loadoutValue: readNumber(entry?.loadoutValue)
    })).filter(entry => entry.subject && entry.teamId && entry.loadoutValue !== null);
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
      combatantEconomies: normalizeCombatantEconomies(round.combatantEconomies),
      utilityCasts: normalizeUtilityCasts(round.utilityCasts),
      teammateUtilityCasts: readNumber(round.teammateUtilityCasts, 0),
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
    const queue = normalizeQueueInfo(
      overrides.queue,
      overrides.metadata?.queue,
      {
        id: overrides.queueId || overrides.queueID || overrides.mode || overrides.modeId,
        name: overrides.queueName,
        modeType: overrides.queueModeType || overrides.modeType
      }
    );
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
      queue,
      result: normalizeResult(overrides.result),
      isPlacementMatch: overrides.isPlacementMatch === true,
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
        opponentPuuids: cleanStringArray(overrides.trackedPlayer?.opponentPuuids),
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
      rawHenrikPayload: cloneJsonValue(overrides.rawHenrikPayload),
      rawPayloadComplete: overrides.rawPayloadComplete === true,
      rawPayloadStoredAt: cleanString(overrides.rawPayloadStoredAt),
      rawPayloadCompleteness: copyPlainObject(overrides.rawPayloadCompleteness),
      rawPayloadBackfillUnavailable: overrides.rawPayloadBackfillUnavailable === true,
      rawPayloadBackfillCheckedAt: cleanString(overrides.rawPayloadBackfillCheckedAt),
      storedRawRehydrateVersion: readNumber(
        overrides.storedRawRehydrateVersion
        ?? overrides.importMeta?.storedRawRehydrateVersion
        ?? overrides.importMeta?.rawPayloadRehydrateVersion
      ),
      storedRawRehydrateCheckedAt: cleanString(
        overrides.storedRawRehydrateCheckedAt
        ?? overrides.importMeta?.storedRawRehydrateCheckedAt
      ),
      importMeta: {
        imageId: cleanString(overrides.importMeta?.imageId),
        imageName: cleanString(overrides.importMeta?.imageName),
        screenshotType: cleanString(overrides.importMeta?.screenshotType),
        parseWarnings: Array.isArray(overrides.importMeta?.parseWarnings) ? overrides.importMeta.parseWarnings.slice() : [],
        rawText: cleanString(overrides.importMeta?.rawText),
        storedRawRehydrateVersion: readNumber(
          overrides.importMeta?.storedRawRehydrateVersion
          ?? overrides.storedRawRehydrateVersion
          ?? overrides.importMeta?.rawPayloadRehydrateVersion
        ),
        storedRawRehydrateCheckedAt: cleanString(
          overrides.importMeta?.storedRawRehydrateCheckedAt
          ?? overrides.storedRawRehydrateCheckedAt
        ),
        rawPayloadRederivedAt: cleanString(overrides.importMeta?.rawPayloadRederivedAt)
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
      queue: canonical.queue || match.queue || metadata.queue || {
        id: canonical.queueId || match.queueId || match.queueID || metadata.queueId || metadata.queueID || canonical.mode || match.mode || metadata.mode,
        name: canonical.queueName || match.queueName || metadata.queueName,
        modeType: canonical.queueModeType || match.queueModeType || metadata.queueModeType || canonical.modeType || match.modeType || metadata.modeType
      },
      isPlacementMatch: match.isPlacementMatch === true
        || metadata.isPlacementMatch === true
        || canonical.isPlacementMatch === true,
      stats: {
        kills: stats.kills?.value ?? match.kills,
        deaths: stats.deaths?.value ?? match.deaths,
        assists: stats.assists?.value ?? match.assists,
        acs: stats.scorePerRound?.value ?? match.acs,
        adr: stats.damagePerRound?.value ?? match.adr,
        hsPercent: stats.headshotsPercentage?.value ?? match.hsPercent ?? match.hs
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
      rawHenrikPayload: match.rawHenrikPayload || canonical.rawHenrikPayload,
      rawPayloadComplete: match.rawPayloadComplete === true || canonical.rawPayloadComplete === true,
      rawPayloadStoredAt: match.rawPayloadStoredAt || canonical.rawPayloadStoredAt,
      rawPayloadCompleteness: match.rawPayloadCompleteness || canonical.rawPayloadCompleteness,
      rawPayloadBackfillUnavailable: match.rawPayloadBackfillUnavailable === true || canonical.rawPayloadBackfillUnavailable === true || metadata.rawPayloadBackfillUnavailable === true,
      rawPayloadBackfillCheckedAt: match.rawPayloadBackfillCheckedAt || canonical.rawPayloadBackfillCheckedAt || metadata.rawPayloadBackfillCheckedAt,
      storedRawRehydrateVersion: canonical.storedRawRehydrateVersion
        ?? match.storedRawRehydrateVersion
        ?? metadata.storedRawRehydrateVersion
        ?? canonical.importMeta?.storedRawRehydrateVersion
        ?? match.importMeta?.storedRawRehydrateVersion,
      storedRawRehydrateCheckedAt: canonical.storedRawRehydrateCheckedAt
        ?? match.storedRawRehydrateCheckedAt
        ?? metadata.storedRawRehydrateCheckedAt
        ?? canonical.importMeta?.storedRawRehydrateCheckedAt
        ?? match.importMeta?.storedRawRehydrateCheckedAt,
      importMeta: {
        ...(canonical.importMeta || {}),
        ...(match.importMeta || {}),
        storedRawRehydrateVersion: canonical.storedRawRehydrateVersion
          ?? match.storedRawRehydrateVersion
          ?? metadata.storedRawRehydrateVersion
          ?? canonical.importMeta?.storedRawRehydrateVersion
          ?? match.importMeta?.storedRawRehydrateVersion,
        storedRawRehydrateCheckedAt: canonical.storedRawRehydrateCheckedAt
          ?? match.storedRawRehydrateCheckedAt
          ?? metadata.storedRawRehydrateCheckedAt
          ?? canonical.importMeta?.storedRawRehydrateCheckedAt
          ?? match.importMeta?.storedRawRehydrateCheckedAt
      },
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
      isPlacementMatch: match.isPlacementMatch === true,
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
      queue: match.queue || match.metadata?.queue || {
        id: match.queueId || match.queueID || match.mode || match.modeId,
        name: match.queueName,
        modeType: match.queueModeType || match.modeType
      },
      result: match.result,
      isPlacementMatch: match.isPlacementMatch === true,
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
      rawHenrikPayload: match.rawHenrikPayload,
      rawPayloadComplete: match.rawPayloadComplete === true,
      rawPayloadStoredAt: match.rawPayloadStoredAt,
      rawPayloadCompleteness: match.rawPayloadCompleteness,
      rawPayloadBackfillUnavailable: match.rawPayloadBackfillUnavailable === true,
      rawPayloadBackfillCheckedAt: match.rawPayloadBackfillCheckedAt,
      storedRawRehydrateVersion: match.storedRawRehydrateVersion ?? match.importMeta?.storedRawRehydrateVersion,
      storedRawRehydrateCheckedAt: match.storedRawRehydrateCheckedAt ?? match.importMeta?.storedRawRehydrateCheckedAt,
      importMeta: match.importMeta,
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

    // Henrik V4 returns `players` as an array.  The older parsed response used
    // `players.all_players`; accept it too so a raw-round hydration never drops
    // the aggregate shot-location fields supplied by the paired V4 payload.
    const parsedPlayers = Array.isArray(parsed?.players)
      ? parsed.players
      : (Array.isArray(parsed?.players?.all_players) ? parsed.players.all_players : []);
    const parsedPlayer = parsedPlayers.find(entry => cleanString(entry?.puuid) === puuid) || {};
    const teamBySubject = new Map(players.map(entry => [cleanString(entry?.subject), cleanString(entry?.teamId)]));
    const teamIds = cleanStringArray(players.map(entry => entry?.teamId));
    const trackedTeam = cleanString(player.teamId);
    const teammatePuuids = players
      .filter(entry => cleanString(entry?.teamId) === trackedTeam && cleanString(entry?.subject) !== puuid)
      .map(entry => entry.subject);
    const opponentPuuids = players
      .filter(entry => cleanString(entry?.teamId) && cleanString(entry?.teamId) !== trackedTeam)
      .map(entry => entry.subject);
    const rawRounds = Array.isArray(raw.roundResults) ? raw.roundResults : [];
    const initialAttackingTeam = inferInitialAttackingTeam(rawRounds, teamBySubject, teamIds);

    const roundByRound = rawRounds.map((round, index) => {
      const playerStats = Array.isArray(round?.playerStats) ? round.playerStats : [];
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
        combatantEconomies: (Array.isArray(round?.playerEconomies) ? round.playerEconomies : []).map(entry => ({
          subject: entry?.subject,
          teamId: teamBySubject.get(cleanString(entry?.subject)),
          loadoutValue: entry?.loadoutValue
        })),
        utilityCasts: playerRound.abilityCasts || playerRound.ability_casts,
        teammateUtilityCasts: playerStats
          .filter(entry => teammatePuuids.includes(cleanString(entry?.subject)))
          .reduce((total, entry) => total + getUtilityCastCount(entry?.abilityCasts || entry?.ability_casts), 0),
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
    // The Raw endpoint supplies detailed round snapshots, while the V4 match
    // payload is the canonical source for aggregate player stats and can be
    // re-derived offline. Keep that V4 payload when both paths are used.
    const storedV4Payload = context.parsedMatch && typeof context.parsedMatch === "object"
      ? cloneJsonValue(context.parsedMatch)
      : null;
    const rawPayloadCompleteness = storedV4Payload
      ? assessHenrikV4PayloadCompleteness(storedV4Payload, puuid)
      : { complete: false, missing: ["parsed-match-payload"], checkedAt: nowISO(), source: "henrik-v4" };

    return fromRiotMatch({
      id: raw.matchInfo?.matchId,
      matchId: raw.matchInfo?.matchId,
      source: "henrik_sync",
      createdAt: raw.matchInfo?.gameStartMillis ? new Date(raw.matchInfo.gameStartMillis).toISOString() : nowISO(),
      playedAt: raw.matchInfo?.gameStartMillis ? new Date(raw.matchInfo.gameStartMillis).toISOString() : nowISO(),
      season: parsed.metadata?.season?.id || raw.matchInfo?.seasonId,
      act: formatHenrikActLabel(parsed.metadata?.season?.short),
      agent: context.agent || parsedPlayer.character || player.characterId,
      role: context.role,
      map: context.map || parsed.metadata?.map || raw.matchInfo?.mapId,
      queue: parsed.metadata?.queue || {
        id: raw.matchInfo?.queueID || raw.matchInfo?.queueId || parsed.metadata?.mode
      },
      result: team.won === true ? "win" : team.won === false ? "loss" : "unknown",
      kills: player.stats?.kills,
      deaths: player.stats?.deaths,
      assists: player.stats?.assists,
      acs: readNumber(player.stats?.score) === null ? null : readNumber(player.stats?.score) / roundsPlayed,
      adr: totalDamage / roundsPlayed,
      hsPercent: totalShots ? ((readNumber(parsedStats.headshots, 0) || 0) / totalShots) * 100 : null,
      roundsWon,
      roundsLost,
      rank: context.rank || parsedPlayer.currenttier_patched,
      rr: context.rr,
      rrDelta: context.rrDelta,
      rankElo: context.rankElo,
      rrVerified: context.rrVerified === true,
      rankDataSource: context.rankDataSource,
      rankCapturedAt: context.rankCapturedAt,
      isPlacementMatch: context.isPlacementMatch === true,
      trackedPlayer: {
        puuid,
        teamId: trackedTeam,
        agentId: player.characterId,
        competitiveTier: player.competitiveTier,
        teammatePuuids,
        opponentPuuids,
        behaviorFactors: player.behaviorFactors
      },
      roundByRound,
      rawHenrikPayload: storedV4Payload,
      rawPayloadComplete: rawPayloadCompleteness.complete === true,
      rawPayloadStoredAt: nowISO(),
      rawPayloadCompleteness
    }, context);
  }

  function getV4PlayerId(player = {}) {
    return cleanString(player?.puuid || player);
  }

  function getV4PlayerTeam(player = {}) {
    return cleanString(player?.team || player?.team_id);
  }

  function normalizeV4Kill(kill = {}) {
    const weapon = kill.weapon && typeof kill.weapon === "object" ? kill.weapon : {};
    const weaponId = cleanString(weapon.id || weapon.uuid);
    const weaponName = resolveKillWeaponLabel(weapon.name, weapon.displayName, weaponId);
    return {
      killer: getV4PlayerId(kill.killer),
      victim: getV4PlayerId(kill.victim),
      assistants: (Array.isArray(kill.assistants) ? kill.assistants : []).map(getV4PlayerId).filter(Boolean),
      roundTime: readNumber(kill.time_in_round_in_ms),
      weapon: weaponName,
      weaponId,
      weaponType: resolveKillWeaponType(weapon.type, weaponName, weaponId),
      secondaryFireMode: Boolean(kill.secondary_fire_mode)
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
    const match = getHenrikV4MatchData(payload);
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
    const opponentPuuids = players
      .filter(entry => cleanString(entry?.team_id) && cleanString(entry?.team_id) !== trackedTeam)
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
    const snapshotSource = cleanString(mmrSnapshot?.rankedCoachSource) || "henrik-stored-mmr-v2";
    const playerTierId = readNumber(player.tier?.id);
    // Completion here means the match can safely enter profile/stat flows.
    // Shot-location/HS data may arrive later through the v3 stale-record
    // backfill path, so do not block placement handling on hsPercent.
    const hasCompletedMatchData = (team.won === true || team.won === false)
      && rounds.length > 0
      && readNumber(stats.kills) !== null
      && readNumber(stats.deaths) !== null
      && readNumber(stats.assists) !== null;
    const isPlacementMatch = playerTierId === 0 && hasCompletedMatchData;
    const rawPayloadCompleteness = assessHenrikV4PayloadCompleteness(payload, puuid);

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
      queue: {
        id: match.metadata?.queue?.id,
        name: match.metadata?.queue?.name,
        modeType: match.metadata?.queue?.mode_type
      },
      result: team.won === true ? "win" : team.won === false ? "loss" : "unknown",
      isPlacementMatch,
      kills: stats.kills,
      deaths: stats.deaths,
      assists: stats.assists,
      acs: readNumber(stats.score) === null ? null : readNumber(stats.score) / roundsPlayed,
      adr: readNumber(stats.damage?.dealt, 0) / roundsPlayed,
      hsPercent: totalShots ? ((readNumber(stats.headshots, 0) || 0) / totalShots) * 100 : null,
      roundsWon: team.rounds?.won,
      roundsLost: team.rounds?.lost,
      rank: hasVerifiedRR ? mmrSnapshot?.tier?.name : player.tier?.name,
      rr: hasVerifiedRR ? snapshotRR : null,
      rrDelta: hasVerifiedRR ? snapshotDelta : null,
      rankElo: hasVerifiedRR ? readNumber(mmrSnapshot?.elo) : null,
      rrVerified: hasVerifiedRR,
      rankDataSource: hasVerifiedRR ? snapshotSource : null,
      rankCapturedAt: hasVerifiedRR ? mmrSnapshot?.date : null,
      trackedPlayer: {
        puuid,
        teamId: trackedTeam,
        agentId: player.agent?.id,
        competitiveTier: player.tier?.id,
        teammatePuuids,
        opponentPuuids,
        behaviorFactors: player.behavior
      },
      roundByRound,
      rawHenrikPayload: cloneJsonValue(payload),
      rawPayloadComplete: rawPayloadCompleteness.complete === true,
      rawPayloadStoredAt: nowISO(),
      rawPayloadCompleteness
    }, context);
  }

  function getStoredRawHenrikPayload(record = {}) {
    return record?.rawHenrikPayload || record?.matchRecord?.rawHenrikPayload || null;
  }

  function rederiveFromStoredRawHenrikPayload(record = {}, context = {}) {
    const existing = record?.schemaVersion === SCHEMA_VERSION ? record : fromLegacyMatch(record);
    const rawPayload = getStoredRawHenrikPayload(existing);
    const puuid = cleanString(context.puuid || existing.trackedPlayer?.puuid);
    if (!rawPayload || !puuid) return existing;

    const derived = fromHenrikV4Match(rawPayload, { ...context, puuid });
    return emptyRecord({
      ...existing,
      ...derived,
      id: existing.id || derived.id,
      legacyMatchId: existing.legacyMatchId || derived.legacyMatchId || derived.id,
      matchNumber: existing.matchNumber ?? derived.matchNumber,
      rank: {
        ...(derived.rank || {}),
        ...(existing.rank || {})
      },
      reflection: existing.reflection,
      manualLogId: existing.manualLogId,
      importMeta: {
        ...(existing.importMeta || {}),
        ...(derived.importMeta || {}),
        rawPayloadRederivedAt: nowISO()
      },
      rawHenrikPayload: cloneJsonValue(rawPayload),
      rawPayloadComplete: derived.rawPayloadComplete === true,
      rawPayloadStoredAt: existing.rawPayloadStoredAt || derived.rawPayloadStoredAt,
      rawPayloadCompleteness: derived.rawPayloadCompleteness
    });
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
      isPlacementMatch: normalized.isPlacementMatch === true,
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
      queue: normalized.queue,
      queueId: normalized.queue?.id,
      queueName: normalized.queue?.name,
      queueModeType: normalized.queue?.modeType,
      matchRecord: normalized,
      rawPayloadComplete: normalized.rawPayloadComplete === true,
      rawPayloadStoredAt: normalized.rawPayloadStoredAt,
      rawPayloadCompleteness: normalized.rawPayloadCompleteness,
      rawPayloadBackfillUnavailable: normalized.rawPayloadBackfillUnavailable === true,
      rawPayloadBackfillCheckedAt: normalized.rawPayloadBackfillCheckedAt,
      storedRawRehydrateVersion: normalized.storedRawRehydrateVersion,
      storedRawRehydrateCheckedAt: normalized.storedRawRehydrateCheckedAt,
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
        queue: normalized.queue,
        queueId: normalized.queue?.id,
        queueName: normalized.queue?.name,
        queueModeType: normalized.queue?.modeType,
        isPlacementMatch: normalized.isPlacementMatch === true,
        rank: normalized.rank.rank,
        rrVerified: normalized.rank.verified === true,
        rankElo: readNumber(normalized.rank.elo),
        rankDataSource: normalized.rank.source,
        rankCapturedAt: normalized.rank.capturedAt,
        rawPayloadBackfillUnavailable: normalized.rawPayloadBackfillUnavailable === true,
        rawPayloadBackfillCheckedAt: normalized.rawPayloadBackfillCheckedAt,
        storedRawRehydrateVersion: normalized.storedRawRehydrateVersion,
        storedRawRehydrateCheckedAt: normalized.storedRawRehydrateCheckedAt
      },
      segments: [{
        type: "overview",
        stats: {
          kills: { value: readNumber(normalized.stats.kills, 0) },
          deaths: { value: readNumber(normalized.stats.deaths, 0) },
          assists: { value: readNumber(normalized.stats.assists, 0) },
          scorePerRound: { value: readNumber(normalized.stats.acs, 0) },
          damagePerRound: { value: readNumber(normalized.stats.adr, 0) },
          headshotsPercentage: { value: readNumber(normalized.stats.hsPercent) }
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
    getStoredRawHenrikPayload,
    isHenrikV4PayloadComplete,
    rederiveFromStoredRawHenrikPayload,
    formatHenrikActLabel,
    toLegacyMatch,
    getRuntimeRecords,
    normalizeResult,
    readNumber
  });
})();
