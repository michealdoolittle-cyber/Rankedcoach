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
      isPlacementMatch: match.isPlacementMatch === true,
      rr: match.rr !== null && match.rr !== undefined && match.rr !== "" && Number.isFinite(Number(match.rr))
        ? Number(match.rr)
        : null,
      roleImpact: match.roleImpact && typeof match.roleImpact === "object" ? { ...match.roleImpact } : null,
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

  function hasLinkedMatch(entry = {}) {
    return Boolean(clean(entry?.matchId || entry?.riotMatchId));
  }

  function isSameAgent(left = "", right = "") {
    return clean(left).toLowerCase() === clean(right).toLowerCase();
  }

  function findPendingLoadoutDraftIndex(entries = [], match = {}, profileId = "", pendingLoadoutRoll = null) {
    const ownerProfileId = clean(profileId);
    const rolledAgent = clean(pendingLoadoutRoll?.agent);
    const matchAgent = clean(match?.agent);
    if (!rolledAgent || !matchAgent || !isSameAgent(rolledAgent, matchAgent)) return -1;
    if (!isOnOrAfterPendingLoadoutRoll(match, pendingLoadoutRoll)) return -1;

    let selectedIndex = -1;
    let selectedTime = -Infinity;
    (Array.isArray(entries) ? entries : []).forEach((entry, index) => {
      if (!entry || typeof entry !== "object") return;
      if (ownerProfileId && clean(entry.profileId) !== ownerProfileId) return;
      if (isMatchPlaceholder(entry) || hasLinkedMatch(entry)) return;
      if (!isSameAgent(entry.agent, matchAgent)) return;
      if (!isOnOrAfterPendingLoadoutRoll(entry, pendingLoadoutRoll)) return;
      const entryTime = getTimestamp(entry.createdAt) || -Infinity;
      if (entryTime > selectedTime) {
        selectedIndex = index;
        selectedTime = entryTime;
      }
    });
    return selectedIndex;
  }

  function mergeMatchPlaceholderIntoDraft(draft = {}, placeholder = {}) {
    const authoredAt = clean(draft.authoredAt) || clean(draft.createdAt) || new Date().toISOString();
    return {
      ...draft,
      matchId: placeholder.matchId,
      riotMatchId: placeholder.matchId,
      profileId: placeholder.profileId || draft.profileId,
      source: PLACEHOLDER_SOURCE,
      isMatchPlaceholder: true,
      isPlayerAuthored: true,
      lockedOutcome: true,
      createdAt: placeholder.createdAt || draft.createdAt,
      authoredAt,
      result: placeholder.result,
      isPlacementMatch: placeholder.isPlacementMatch === true,
      rr: placeholder.rr,
      roleImpact: placeholder.roleImpact || null,
      agent: placeholder.agent || draft.agent,
      role: placeholder.role || draft.role,
      map: placeholder.map || draft.map,
      // Preserve the player-authored reflection exactly as written.
      focus: draft.focus || "",
      rating: draft.rating ?? null,
      mood: draft.mood || "",
      tilt: draft.tilt || "",
      teamComms: draft.teamComms ?? null,
      selfComms: draft.selfComms ?? null,
      notes: draft.notes || "",
      warmup: draft.warmup === true
    };
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
    const reconciledEntryIds = [];
    const additions = [];

    (Array.isArray(matches) ? matches : []).forEach(match => {
      const matchId = clean(match?.matchId || match?.id);
      if (!matchId || linkedMatchIds.has(matchId)) return;
      const placeholder = createMatchPlaceholder(match, ownerProfileId);
      if (!placeholder) return;

      const draftIndex = findPendingLoadoutDraftIndex(updatedEntries, match, ownerProfileId, pendingLoadoutRoll);
      if (draftIndex >= 0) {
        const draft = updatedEntries[draftIndex];
        updatedEntries[draftIndex] = mergeMatchPlaceholderIntoDraft(draft, placeholder);
        linkedMatchIds.add(matchId);
        reconciledEntryIds.push(clean(draft.id));
        return;
      }

      linkedMatchIds.add(matchId);
      additions.push(placeholder);
    });

    return {
      entries: [...updatedEntries, ...additions],
      added: additions.length,
      reconciled: reconciledEntryIds.length,
      reconciledEntryIds
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
    findPendingLoadoutDraftIndex,
    mergeMatchPlaceholderIntoDraft,
    syncMatchPlaceholders
  });
})();
