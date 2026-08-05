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

  function getPendingLoadoutFocusForMatch(match = {}, pendingLoadoutRoll = null) {
    const focus = clean(pendingLoadoutRoll?.focus);
    if (!focus) return "";
    if (!isSameAgent(pendingLoadoutRoll?.agent, match?.agent)) return "";
    // A new roll must never be attached to an older synced match merely
    // because the player chose the same agent again later in the day.
    return isOnOrAfterPendingLoadoutRoll(match, pendingLoadoutRoll) ? focus : "";
  }

  function createMatchPlaceholder(match = {}, profileId = "", options = {}) {
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
      isPlacementMatch: match.isPlacementMatch === true,
      rr: match.rr !== null && match.rr !== undefined && match.rr !== "" && Number.isFinite(Number(match.rr))
        ? Number(match.rr)
        : null,
      roleImpact: match.roleImpact && typeof match.roleImpact === "object" ? { ...match.roleImpact } : null,
      agent: clean(match.agent),
      role: clean(match.role),
      map: clean(match.map),
      focus: getPendingLoadoutFocusForMatch(match, options?.pendingLoadoutRoll),
      rating: null,
      mood: "",
      tilt: "",
      teamComms: null,
      selfComms: null,
      notes: "",
      warmup: false
    };
  }

  function getTimestamp(value = "") {
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  function isOnOrAfterPendingLoadoutRoll(entry = {}, pendingLoadoutRoll = null) {
    const rollTime = getTimestamp(pendingLoadoutRoll?.createdAt);
    const entryTime = getTimestamp(entry?.createdAt);
    if (rollTime === null || entryTime === null) return false;
    // Match the app's existing one-second grace period. Henrik and the client
    // can serialize the same event with slightly different millisecond values.
    return entryTime >= rollTime - 1000;
  }

  function isSameAgent(left = "", right = "") {
    return clean(left).toLowerCase() === clean(right).toLowerCase();
  }

  function syncMatchPlaceholders(entries = [], matches = [], profileId = "", options = {}) {
    const ownerProfileId = clean(profileId);
    const existing = Array.isArray(entries) ? entries.filter(Boolean) : [];
    const pendingLoadoutRoll = options?.pendingLoadoutRoll || null;
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
        isPlacementMatch: match.isPlacementMatch === true,
        rr: verifiedRr,
        roleImpact: match.roleImpact && typeof match.roleImpact === "object" ? { ...match.roleImpact } : entry.roleImpact || null,
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
    // A roll is a plan for the next matching game only.  Determine that game
    // before iterating so a same-agent double-header cannot inherit one roll
    // twice merely because Henrik returned both records in one sync.
    const pendingFocusMatchId = clean(pendingLoadoutRoll?.focus)
      ? (Array.isArray(matches) ? matches : [])
        .filter(match => {
          const matchId = clean(match?.matchId || match?.id);
          return matchId
            && !linkedMatchIds.has(matchId)
            && isSameAgent(pendingLoadoutRoll?.agent, match?.agent)
            && isOnOrAfterPendingLoadoutRoll(match, pendingLoadoutRoll);
        })
        .sort((left, right) => (getTimestamp(left?.createdAt) || Infinity) - (getTimestamp(right?.createdAt) || Infinity))[0]
      : null;
    const pendingFocusMatchIdValue = clean(pendingFocusMatchId?.matchId || pendingFocusMatchId?.id);
    let consumedPendingLoadoutRollMatchId = "";

    (Array.isArray(matches) ? matches : []).forEach(match => {
      const matchId = clean(match?.matchId || match?.id);
      if (!matchId || linkedMatchIds.has(matchId)) return;
      const placeholder = createMatchPlaceholder(match, ownerProfileId, {
        pendingLoadoutRoll: matchId === pendingFocusMatchIdValue ? pendingLoadoutRoll : null
      });
      if (!placeholder) return;

      linkedMatchIds.add(matchId);
      additions.push(placeholder);
      if (placeholder.focus) consumedPendingLoadoutRollMatchId = matchId;
    });

    return {
      entries: [...updatedEntries, ...additions],
      added: additions.length,
      consumedPendingLoadoutRollMatchId
    };
  }

  globalThis.RankedCoachLogPolicy = Object.freeze({
    PLACEHOLDER_SOURCE,
    isSyntheticDemoLog,
    isMatchPlaceholder,
    isPlayerAuthored,
    sanitizeLogEntries,
    createMatchPlaceholder,
    isOnOrAfterPendingLoadoutRoll,
    getPendingLoadoutFocusForMatch,
    syncMatchPlaceholders
  });
})();
