(function () {
  "use strict";

  const RIOT_SYNC_FEATURE_FLAG = false;
  const HENRIK_SYNC_FEATURE_FLAG = true;

  function isEnabled() {
    return Boolean(RIOT_SYNC_FEATURE_FLAG && globalThis.RANKEDCOACH_FEATURES?.riotSync === true);
  }

  function getStatus() {
    return {
      enabled: isEnabled(),
      reason: isEnabled() ? "enabled" : "riot_sync_feature_flag_off"
    };
  }

  function isHenrikEnabled() {
    return HENRIK_SYNC_FEATURE_FLAG;
  }

  function createRsoAuthorizationUrl(options = {}) {
    if (!isEnabled()) return { enabled: false, reason: "riot_sync_feature_flag_off" };
    const url = new URL("https://auth.riotgames.com/authorize");
    url.searchParams.set("client_id", options.clientId || "");
    url.searchParams.set("redirect_uri", options.redirectUri || "");
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", options.scope || "openid offline_access");
    url.searchParams.set("state", options.state || "");
    return { enabled: true, url: url.toString() };
  }

  function mapRiotMatch(match = {}, context = {}) {
    if (!globalThis.RankedCoachMatchRecord?.fromRiotMatch) {
      throw new Error("Match Record adapter is required before Riot sync can map data.");
    }
    return globalThis.RankedCoachMatchRecord.fromRiotMatch(match, context);
  }

  function mapHenrikRawMatch(match = {}, context = {}) {
    if (!globalThis.RankedCoachMatchRecord?.fromHenrikRawMatch) {
      throw new Error("Match Record adapter is required before Henrik sync can map data.");
    }
    return globalThis.RankedCoachMatchRecord.fromHenrikRawMatch(match, context);
  }

  function mapHenrikV4Match(match = {}, context = {}) {
    if (!globalThis.RankedCoachMatchRecord?.fromHenrikV4Match) {
      throw new Error("Match Record adapter is required before Henrik sync can map data.");
    }
    return globalThis.RankedCoachMatchRecord.fromHenrikV4Match(match, context);
  }

  function createSyncRequestError(message, details = {}) {
    const error = new Error(String(message || "Match sync failed."));
    error.name = "RiotSyncRequestError";
    error.code = String(details.code || "henrik_request_failed");
    error.status = Number(details.status) || 0;
    error.retryable = Boolean(details.retryable);
    return error;
  }

  function isTransientSyncError(error) {
    const status = Number(error?.status) || 0;
    const code = String(error?.code || "").toLowerCase();
    return Boolean(
      error?.retryable
      || status === 408
      || status === 429
      || status >= 500
      || [
        "henrik_408",
        "henrik_429",
        "henrik_500",
        "henrik_502",
        "henrik_503",
        "henrik_504",
        "henrik_timeout",
        "henrik_unavailable"
      ].includes(code)
    );
  }

  function waitForRetry(delayMs = 0, options = {}, context = {}) {
    if (typeof options.waitForRetry === "function") {
      return Promise.resolve(options.waitForRetry(delayMs, context));
    }
    return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(delayMs) || 0)));
  }

  async function requestJson(path, body, options = {}) {
    const baseUrl = String(options.baseUrl || "").replace(/\/$/, "");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || 50000);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw createSyncRequestError(payload?.error || `Match sync failed (${response.status}).`, {
          code: payload?.code || `henrik_${response.status}`,
          status: response.status,
          retryable: [408, 429].includes(response.status) || response.status >= 500
        });
      }
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw createSyncRequestError("Match sync timed out.", {
          code: "henrik_timeout",
          status: 504,
          retryable: true
        });
      }
      if (error?.code || error?.status) throw error;
      if (error instanceof TypeError) {
        throw createSyncRequestError(error?.message || "Match sync could not connect.", {
          code: "henrik_unavailable",
          status: 502,
          retryable: true
        });
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async function requestJsonWithRetry(path, body, options = {}) {
    const requestOptions = {
      ...options,
      timeoutMs: Math.max(1000, Number(options.matchTimeoutMs || options.timeoutMs) || 15000)
    };
    const retryDelaysMs = Array.isArray(options.matchRetryDelaysMs)
      ? options.matchRetryDelaysMs.map(value => Math.max(0, Number(value) || 0))
      : [750, 1500];
    let attempt = 0;
    while (true) {
      try {
        return await requestJson(path, body, requestOptions);
      } catch (error) {
        const delayMs = retryDelaysMs[attempt];
        if (!isTransientSyncError(error) || delayMs === undefined) {
          error.attempts = attempt + 1;
          throw error;
        }
        attempt += 1;
        await waitForRetry(delayMs, options, { attempt, error, path, body });
      }
    }
  }

  function getParsedMatchId(match = {}) {
    return String(match?.metadata?.match_id || match?.metadata?.matchid || match?.matchId || "").trim();
  }

  function getParsedMatchStartedAt(match = {}) {
    return String(
      match?.metadata?.started_at
      || match?.metadata?.game_start
      || match?.metadata?.game_start_patched
      || match?.started_at
      || ""
    ).trim();
  }

  async function checkWarmupMatches(options = {}) {
    if (!isHenrikEnabled()) return { enabled: false, matches: [], failures: [] };
    const puuid = String(options.puuid || "").trim();
    const region = String(options.region || "na").trim().toLowerCase();
    if (!puuid) return { enabled: true, matches: [], failures: [{ mode: "all", error: "No linked Henrik profile." }] };
    const modes = Array.isArray(options.modes) && options.modes.length
      ? options.modes
      : ["deathmatch", "teamdeathmatch"];
    const settled = await Promise.allSettled(modes.map(async mode => {
      const payload = await requestJson("/api/henrik/matches", {
        puuid,
        region,
        mode,
        count: Math.min(10, Math.max(1, Number(options.count) || 10)),
        start: 0
      }, options);
      return (Array.isArray(payload?.data) ? payload.data : []).map(match => ({
        id: getParsedMatchId(match),
        mode,
        playedAt: getParsedMatchStartedAt(match)
      }));
    }));
    const matches = [];
    const failures = [];
    settled.forEach((result, index) => {
      if (result.status === "fulfilled") matches.push(...result.value);
      else failures.push({ mode: modes[index], error: result.reason?.message || "Warm-up match check failed." });
    });
    return {
      enabled: true,
      matches: [...new Map(matches.filter(match => match.id || match.playedAt).map(match => [`${match.mode}:${match.id || match.playedAt}`, match])).values()],
      failures
    };
  }

  function getMmrSnapshotMatchId(snapshot = {}) {
    return String(snapshot?.match_id || snapshot?.matchId || "").trim();
  }

  function isVerifiedMmrSnapshot(snapshot = {}) {
    const hasNumber = value => value !== null
      && value !== undefined
      && String(value).trim() !== ""
      && Number.isFinite(Number(value));
    return Number(snapshot?.tier?.id) > 0
      && hasNumber(snapshot?.rr)
      && hasNumber(snapshot?.last_change);
  }

  function enrichLegacyMatchesWithMmr(matchList = [], mmrHistory = []) {
    const snapshots = new Map(
      (Array.isArray(mmrHistory) ? mmrHistory : [])
        .map(snapshot => [getMmrSnapshotMatchId(snapshot), snapshot])
        .filter(([matchId]) => matchId)
    );

    return (Array.isArray(matchList) ? matchList : []).map(match => {
      const source = String(match?.source || match?.metadata?.source || "").toLowerCase();
      if (source !== "henrik_sync") return match;
      const matchId = String(match?.matchId || match?.id || match?.metadata?.matchId || "").trim();
      const snapshot = snapshots.get(matchId);
      if (!snapshot) return match;
      const verified = isVerifiedMmrSnapshot(snapshot);
      const rankPatch = verified ? {
        rank: String(snapshot?.tier?.name || match?.rank || match?.matchRecord?.rank?.rank || "").trim() || null,
        rr: Number(snapshot.rr),
        rrDelta: Number(snapshot.last_change),
        elo: Number.isFinite(Number(snapshot.elo)) ? Number(snapshot.elo) : null,
        verified: true,
        source: "henrik-stored-mmr-v2",
        capturedAt: snapshot.date || null
      } : {
        ...(match?.matchRecord?.rank || {}),
        rr: null,
        rrDelta: null,
        elo: null,
        verified: false,
        source: null,
        capturedAt: null
      };
      return {
        ...match,
        rr: null,
        verifiedRrDelta: verified ? rankPatch.rrDelta : null,
        rrTotal: verified ? rankPatch.rr : null,
        rrVerified: verified,
        rank: rankPatch.rank || match?.rank || null,
        rankElo: rankPatch.elo,
        rankDataSource: rankPatch.source,
        rankCapturedAt: rankPatch.capturedAt,
        matchRecord: match?.matchRecord ? {
          ...match.matchRecord,
          rank: rankPatch
        } : match?.matchRecord,
        metadata: {
          ...(match?.metadata || {}),
          rank: rankPatch.rank || match?.metadata?.rank || null,
          rrVerified: verified,
          rankElo: rankPatch.elo,
          rankDataSource: rankPatch.source,
          rankCapturedAt: rankPatch.capturedAt
        }
      };
    });
  }

  async function pullMatches(options = {}) {
    if (!isHenrikEnabled()) {
      return { enabled: false, reason: "henrik_sync_feature_flag_off", records: [] };
    }

    const riotId = String(options.riotId || "").trim();
    const region = String(options.region || "na").trim().toLowerCase();
    const historyLimit = Math.min(100, Math.max(1, Number(options.historyLimit) || Number(options.count) || 10));
    const historyStart = Math.min(1000, Math.max(0, Math.floor(Number(options.historyStart) || 0)));
    const pageSize = Math.min(10, historyLimit);
    let puuid = String(options.puuid || "").trim();
    let account = null;

    if (!puuid) {
      if (!riotId) throw new Error("Set Riot ID first.");
      const accountPayload = await requestJson("/api/henrik/account", { riotId }, options);
      account = accountPayload?.data || accountPayload;
      puuid = String(account?.puuid || "").trim();
      if (!puuid) throw new Error("Henrik did not return a PUUID for this Riot ID.");
    }

    const mmrHistoryPromise = requestJson("/api/henrik/mmr-history", {
      puuid,
      region,
      size: 100,
      page: 1
    }, options).catch(error => ({ data: [], error: error?.message || "MMR history unavailable." }));

    const parsedMatches = [];
    let historyExhausted = false;
    let matchSyncError = null;
    for (let offset = 0; offset < historyLimit; offset += pageSize) {
      const start = historyStart + offset;
      const count = Math.min(pageSize, historyLimit - offset);
      let matchesPayload;
      try {
        matchesPayload = await requestJsonWithRetry("/api/henrik/matches", { puuid, region, count, start }, options);
      } catch (error) {
        matchSyncError = {
          code: String(error?.code || "henrik_request_failed"),
          status: Number(error?.status) || 0,
          message: error?.message || "Match history is temporarily unavailable.",
          retryable: isTransientSyncError(error),
          attempts: Number(error?.attempts) || 1,
          start,
          count
        };
        break;
      }
      const pageMatches = Array.isArray(matchesPayload?.data) ? matchesPayload.data : [];
      parsedMatches.push(...pageMatches);
      if (pageMatches.length < count) {
        historyExhausted = true;
        break;
      }
    }
    const mmrPayload = await mmrHistoryPromise;
    const mmrHistory = Array.isArray(mmrPayload?.data) ? mmrPayload.data : [];
    const mmrByMatchId = new Map(mmrHistory.map(snapshot => [getMmrSnapshotMatchId(snapshot), snapshot]));
    const knownMatchIds = new Set((options.knownMatchIds || []).map(value => String(value || "").trim()).filter(Boolean));
    const refreshMatchIds = new Set((options.refreshMatchIds || []).map(value => String(value || "").trim()).filter(Boolean));
    const pendingMatches = parsedMatches.filter(match => {
      const matchId = getParsedMatchId(match);
      return matchId && (!knownMatchIds.has(matchId) || refreshMatchIds.has(matchId));
    });
    const records = [];
    const failures = matchSyncError ? [{ stage: "matches", ...matchSyncError }] : [];

    for (const parsedMatch of pendingMatches) {
      const matchId = getParsedMatchId(parsedMatch);
      try {
        records.push(mapHenrikV4Match(parsedMatch, {
          puuid,
          mmrSnapshot: mmrByMatchId.get(matchId) || null
        }));
      } catch (error) {
        failures.push({ matchId, error: error?.message || "Match mapping failed." });
      }
    }

    if (pendingMatches.length && !records.length) {
      throw new Error(failures[0]?.error || "Recent competitive matches could not be loaded.");
    }

    return {
      enabled: true,
      provider: "henrik",
      puuid,
      account,
      records,
      failures,
      checked: parsedMatches.length,
      newMatches: records.length,
      historyLimit,
      historyStart,
      historyExhausted,
      historyWindowComplete: historyExhausted && !matchSyncError,
      mmrHistory,
      mmrHistoryError: mmrPayload?.error || "",
      matchSyncError
    };
  }

  globalThis.RankedCoachRiotSync = Object.freeze({
    RIOT_SYNC_FEATURE_FLAG,
    HENRIK_SYNC_FEATURE_FLAG,
    isEnabled,
    isHenrikEnabled,
    getStatus,
    createRsoAuthorizationUrl,
    mapRiotMatch,
    mapHenrikRawMatch,
    mapHenrikV4Match,
    enrichLegacyMatchesWithMmr,
    checkWarmupMatches,
    pullMatches
  });
})();
