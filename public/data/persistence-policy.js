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

  globalThis.RankedCoachPersistencePolicy = Object.freeze({
    buildScopedMatchRowId,
    dedupeRowsById,
    chunkRows
  });
})();
