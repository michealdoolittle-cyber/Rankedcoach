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
        warmupLog: mergeUniqueRecords(secondary.warmupLog, canonical.warmupLog, entry => clean(entry?.date || entry?.id))
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

  globalThis.RankedCoachPersistencePolicy = Object.freeze({
    buildScopedMatchRowId,
    dedupeRowsById,
    chunkRows,
    consolidateProfiles
  });
})();
