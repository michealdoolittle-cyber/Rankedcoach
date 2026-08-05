(function () {
  "use strict";

  function clean(value = "") {
    return String(value ?? "").trim();
  }

  function buildScopedMatchRowId(userId, profileId, matchId) {
    const user = clean(userId);
    const profile = clean(profileId) || "default";
    const match = clean(matchId);
    if (!user || !match) return "";
    return `${user}:${profile}:${match}`;
  }

  function buildMatchArchiveRowId(userId, profileId, matchId, riotMatchId = "") {
    const user = clean(userId);
    const riotMatch = clean(riotMatchId).toLowerCase();
    if (user && riotMatch) {
      return `${user}:riot:${riotMatch}`;
    }
    return buildScopedMatchRowId(userId, profileId, matchId);
  }

  function dedupeRowsById(rows = []) {
    const unique = new Map();
    (Array.isArray(rows) ? rows : []).forEach(row => {
      const id = clean(row?.id);
      if (!id) return;
      unique.set(id, { ...row, id });
    });
    return [...unique.values()];
  }

  function chunkRows(rows = [], size = 6) {
    const chunkSize = Math.max(1, Math.floor(Number(size) || 6));
    const source = Array.isArray(rows) ? rows : [];
    const chunks = [];
    for (let index = 0; index < source.length; index += chunkSize) {
      chunks.push(source.slice(index, index + chunkSize));
    }
    return chunks;
  }

  function getProfileIdentity(profile = {}) {
    const puuid = clean(profile?.puuid).toLowerCase();
    if (puuid) return `puuid:${puuid}`;
    const riotId = clean(profile?.riotId).replace(/\s+/g, "").toLowerCase();
    if (riotId) return `riot:${clean(profile?.region || "na").toLowerCase()}:${riotId}`;
    return `id:${clean(profile?.id)}`;
  }

  function mergeUniqueRecords(left = [], right = [], getKey = item => clean(item?.id)) {
    const merged = new Map();
    [...(Array.isArray(left) ? left : []), ...(Array.isArray(right) ? right : [])].forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      const key = getKey(item) || `record:${index}`;
      merged.set(key, item);
    });
    return [...merged.values()];
  }

  // Playlist watch history deliberately retains only a canonical media identity
  // and the time it was watched. Keep it bounded so a long-lived profile
  // cannot recreate the local-storage quota issue that match history once had.
  const MAX_WATCHED_PLAYLIST_VIDEOS = 1000;
  // A complete Henrik V4 match can be several hundred KB. Retaining every raw
  // payload in localStorage makes a normal 100-match account exceed the browser
  // quota, which then forces the all-or-nothing emergency compaction path. Keep
  // the newest raw payloads locally for immediate offline re-derive while the
  // complete archive remains durable in cloud match_snapshots.
  const LOCAL_RAW_PAYLOAD_BUDGET_BYTES = 3 * 1024 * 1024;

  function normalizeWatchedPlaylistVideos(records = []) {
    const source = Array.isArray(records) ? records : [];
    const byId = new Map();
    source.forEach(record => {
      if (!record || typeof record !== "object") return;
      const id = clean(record.id);
      const watchedAt = clean(record.watchedAt);
      if (!/^(?:youtube|twitch):[A-Za-z0-9_-]{1,128}$/.test(id)) return;
      if (!Number.isFinite(Date.parse(watchedAt))) return;
      const normalized = { id, watchedAt: new Date(watchedAt).toISOString() };
      const existing = byId.get(id);
      if (!existing || Date.parse(normalized.watchedAt) > Date.parse(existing.watchedAt)) {
        byId.set(id, normalized);
      }
    });
    return [...byId.values()]
      .sort((left, right) => Date.parse(left.watchedAt) - Date.parse(right.watchedAt))
      .slice(-MAX_WATCHED_PLAYLIST_VIDEOS);
  }

  function mergeWatchedPlaylistVideos(left = [], right = []) {
    return normalizeWatchedPlaylistVideos([
      ...(Array.isArray(left) ? left : []),
      ...(Array.isArray(right) ? right : [])
    ]);
  }

  function consolidateProfiles(source = [], preferredId = "") {
    const profiles = [];
    const byIdentity = new Map();
    const idMap = {};
    (Array.isArray(source) ? source : []).forEach(profile => {
      if (!profile || typeof profile !== "object") return;
      const identity = getProfileIdentity(profile);
      const existingIndex = byIdentity.get(identity);
      if (existingIndex === undefined) {
        byIdentity.set(identity, profiles.length);
        profiles.push({ ...profile });
        idMap[clean(profile.id)] = clean(profile.id);
        return;
      }
      const existing = profiles[existingIndex];
      const preferIncoming = clean(profile.id) === clean(preferredId);
      const canonical = preferIncoming ? profile : existing;
      const secondary = preferIncoming ? existing : profile;
      const merged = {
        ...secondary,
        ...canonical,
        id: clean(canonical.id) || clean(secondary.id),
        matches: mergeUniqueRecords(secondary.matches, canonical.matches, match => clean(match?.matchId || match?.id || match?.metadata?.matchId)),
        warmupLog: mergeUniqueRecords(secondary.warmupLog, canonical.warmupLog, entry => clean(entry?.date || entry?.id)),
        watchedPlaylistVideos: mergeWatchedPlaylistVideos(
          secondary.watchedPlaylistVideos,
          canonical.watchedPlaylistVideos
        )
      };
      profiles[existingIndex] = merged;
      idMap[clean(existing.id)] = merged.id;
      idMap[clean(profile.id)] = merged.id;
    });
    return {
      profiles,
      activeProfileId: idMap[clean(preferredId)] || clean(preferredId) || clean(profiles[0]?.id),
      idMap
    };
  }

  function compactMatchForLocalCache(match = {}, level = 1) {
    if (!match || typeof match !== "object") return match;
    const compact = { ...match };
    const canonical = match.matchRecord && typeof match.matchRecord === "object"
      ? { ...match.matchRecord }
      : null;

    // The canonical matchRecord is the single raw-payload owner. Older cached
    // legacy rows may have duplicated the same Henrik payload at top level,
    // which turns localStorage fallback saves into quota trouble for no benefit.
    delete compact.rawHenrikPayload;

    // The legacy match shape already carries the projected round metrics used by
    // the UI. Keeping the canonical round list here stores the same rounds twice.
    if (canonical) {
      delete canonical.roundByRound;
      compact.matchRecord = canonical;
    }

    if (level >= 2) {
      delete compact.matchRecord;
      delete compact.segments;
      delete compact.raw;
      delete compact.rawMatch;
      delete compact.sourcePayload;
    }

    return compact;
  }

  function compactProfilesForLocalCache(source = [], level = 1) {
    const compactProfiles = (Array.isArray(source) ? source : []).map(profile => {
      if (!profile || typeof profile !== "object") return profile;
      const compact = { ...profile };
      if (level >= 3) {
        compact.matches = [];
      } else {
        compact.matches = (Array.isArray(profile.matches) ? profile.matches : [])
          .map(match => compactMatchForLocalCache(match, level));
      }
      return compact;
    });

    if (level !== 1) return compactProfiles;

    // Apply one budget across every cached profile, preserving the most-recent
    // raw payloads rather than depending on localStorage to reject an oversized
    // write. Normalized match data remains available for the whole archive.
    const rawCandidates = [];
    compactProfiles.forEach(profile => {
      (Array.isArray(profile?.matches) ? profile.matches : []).forEach(match => {
        const rawPayload = match?.matchRecord?.rawHenrikPayload;
        if (!rawPayload || typeof rawPayload !== "object") return;
        const playedAt = Date.parse(
          match?.metadata?.playedAt
          || match?.matchRecord?.playedAt
          || match?.playedAt
          || match?.createdAt
          || 0
        ) || 0;
        rawCandidates.push({ match, rawPayload, playedAt });
      });
    });

    let remainingBytes = LOCAL_RAW_PAYLOAD_BUDGET_BYTES;
    rawCandidates
      .sort((left, right) => right.playedAt - left.playedAt)
      .forEach(({ match, rawPayload }) => {
        const payloadBytes = measureJsonPayloadBytes(rawPayload);
        if (payloadBytes > 0 && payloadBytes <= remainingBytes) {
          remainingBytes -= payloadBytes;
          return;
        }
        delete match.matchRecord.rawHenrikPayload;
        match.rawPayloadCachedLocally = false;
      });

    return compactProfiles;
  }

  // Cloud account state is only the lightweight account/profile shell. Match
  // rows live in match_snapshots, so keeping full match payloads here duplicates
  // Henrik raw payloads and can make a single vip_app_state upsert too large.
  function compactProfilesForCloudAccountState(source = []) {
    return compactProfilesForLocalCache(source, 3);
  }

  function measureJsonPayloadBytes(value) {
    let json = "";
    try {
      json = JSON.stringify(value ?? null);
    } catch (_error) {
      return 0;
    }
    if (typeof TextEncoder === "function") {
      try {
        return new TextEncoder().encode(json).length;
      } catch (_error) {
        return json.length;
      }
    }
    return json.length;
  }

  globalThis.RankedCoachPersistencePolicy = Object.freeze({
    buildScopedMatchRowId,
    buildMatchArchiveRowId,
    dedupeRowsById,
    chunkRows,
    consolidateProfiles,
    normalizeWatchedPlaylistVideos,
    mergeWatchedPlaylistVideos,
    compactMatchForLocalCache,
    compactProfilesForLocalCache,
    compactProfilesForCloudAccountState,
    measureJsonPayloadBytes
  });
})();
