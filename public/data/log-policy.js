(function () {
  "use strict";

  const PLACEHOLDER_SOURCE = "henrik-match-placeholder";

  function clean(value = "") {
    return String(value ?? "").trim();
  }

  function isSyntheticDemoLog(entry = {}) {
    const source = clean(entry.source).toLowerCase();
    return source.includes("demo")
      || Boolean(clean(entry.demoAct))
      || Boolean(clean(entry.metadata?.demoAct));
  }

  function isMatchPlaceholder(entry = {}) {
    return entry.isMatchPlaceholder === true || clean(entry.source) === PLACEHOLDER_SOURCE;
  }

  function isPlayerAuthored(entry = {}) {
    if (isSyntheticDemoLog(entry)) return false;
    if (isMatchPlaceholder(entry)) return entry.isPlayerAuthored === true;
    return true;
  }

  function sanitizeLogEntries(entries = [], options = {}) {
    const signedIn = options.signedIn === true;
    const profileId = clean(options.profileId);
    const seen = new Set();
    return (Array.isArray(entries) ? entries : [])
      .filter(entry => entry && typeof entry === "object")
      .filter(entry => !signedIn || !isSyntheticDemoLog(entry))
      .map(entry => {
        const id = clean(entry.id);
        if (!id || seen.has(id)) return null;
        seen.add(id);
        return {
          ...entry,
          id,
          profileId: clean(entry.profileId) || profileId
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
  }

  function createMatchPlaceholder(match = {}, profileId = "") {
    const matchId = clean(match.matchId || match.id);
    const ownerProfileId = clean(profileId);
    if (!matchId) return null;
    return {
      id: `ranked-match-log:${ownerProfileId || "default"}:${matchId}`,
      matchId,
      profileId: ownerProfileId,
      source: PLACEHOLDER_SOURCE,
      isMatchPlaceholder: true,
      isPlayerAuthored: false,
      lockedOutcome: true,
      createdAt: clean(match.createdAt) || new Date().toISOString(),
      result: clean(match.result).toLowerCase() || "unknown",
      rr: match.rr !== null && match.rr !== undefined && match.rr !== "" && Number.isFinite(Number(match.rr))
        ? Number(match.rr)
        : null,
      agent: clean(match.agent),
      role: clean(match.role),
      map: clean(match.map),
      focus: "",
      rating: null,
      mood: "",
      tilt: "",
      teamComms: null,
      selfComms: null,
      notes: "",
      warmup: false
    };
  }

  function syncMatchPlaceholders(entries = [], matches = [], profileId = "") {
    const ownerProfileId = clean(profileId);
    const existing = Array.isArray(entries) ? entries.filter(Boolean) : [];
    const matchesById = new Map(
      (Array.isArray(matches) ? matches : [])
        .map(match => [clean(match?.matchId || match?.id), match])
        .filter(([matchId]) => matchId)
    );
    const updatedEntries = existing.map(entry => {
      if (!isMatchPlaceholder(entry) || (ownerProfileId && clean(entry.profileId) !== ownerProfileId)) return entry;
      const match = matchesById.get(clean(entry.matchId || entry.riotMatchId));
      if (!match) return entry;
      const verifiedRr = match.rr !== null && match.rr !== undefined && match.rr !== "" && Number.isFinite(Number(match.rr))
        ? Number(match.rr)
        : null;
      return {
        ...entry,
        result: clean(match.result).toLowerCase() || entry.result,
        rr: verifiedRr,
        agent: clean(match.agent) || entry.agent,
        role: clean(match.role) || entry.role,
        map: clean(match.map) || entry.map
      };
    });
    const linkedMatchIds = new Set(
      updatedEntries
        .filter(entry => !ownerProfileId || clean(entry.profileId) === ownerProfileId)
        .map(entry => clean(entry.matchId || entry.riotMatchId))
        .filter(Boolean)
    );
    const additions = [];

    (Array.isArray(matches) ? matches : []).forEach(match => {
      const matchId = clean(match?.matchId || match?.id);
      if (!matchId || linkedMatchIds.has(matchId)) return;
      const placeholder = createMatchPlaceholder(match, ownerProfileId);
      if (!placeholder) return;
      linkedMatchIds.add(matchId);
      additions.push(placeholder);
    });

    return {
      entries: [...updatedEntries, ...additions],
      added: additions.length
    };
  }

  globalThis.RankedCoachLogPolicy = Object.freeze({
    PLACEHOLDER_SOURCE,
    isSyntheticDemoLog,
    isMatchPlaceholder,
    isPlayerAuthored,
    sanitizeLogEntries,
    createMatchPlaceholder,
    syncMatchPlaceholders
  });
})();
