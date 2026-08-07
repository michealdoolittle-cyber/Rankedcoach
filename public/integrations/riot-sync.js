(function () {
  "use strict";

  const RIOT_SYNC_FEATURE_FLAG = false;
  const HENRIK_SYNC_FEATURE_FLAG = true;
  const HENRIK_LIVE_MMR_SOURCE = "henrik-live-mmr-v2";
  const HENRIK_STORED_MMR_SOURCE = "henrik-stored-mmr-v2";

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

  function getRawHydrationConcurrency(options = {}) {
    const requested = Number(options.rawHydrationConcurrency ?? options.rawMatchConcurrency);
    // Raw match payloads are substantially heavier than summary history. The
    // live first-history audit demonstrated that six simultaneous raw calls
    // can trip Henrik's 429 bucket for an otherwise healthy public account.
    // Two in flight is still concurrent, while leaving enough provider headroom
    // for rank/history work and the user's next sync.
    return Math.max(1, Math.min(4, Math.floor(Number.isFinite(requested) ? requested : 2)));
  }

  function getRawHydrationTimeoutMs(options = {}) {
    const requested = Number(options.rawMatchTimeoutMs ?? options.rawHydrationTimeoutMs);
    // A historical round payload is optional: preserve the aggregate V4 record
    // when it is slow rather than holding the entire sync for 50 seconds.
    return Math.max(3000, Math.min(10000, Number.isFinite(requested) ? requested : 9000));
  }

  function getRawHydrationRetryDelays(options = {}) {
    if (Array.isArray(options.rawMatchRetryDelaysMs)) return options.rawMatchRetryDelaysMs;
    // Space retries enough to let Henrik's short provider bucket recover.
    // A raw payload is optional, so the circuit still keeps a sustained outage
    // from blocking the summary record or the visible dashboard.
    return [800, 1600];
  }

  function getHistoryPageConcurrency(options = {}) {
    const requested = Number(options.historyPageConcurrency);
    // Summary pages are light, but they share the same upstream quota as raw
    // payloads. A two-request pool removes the old serial bottleneck without
    // turning a new-account history import into a rate-limit burst.
    return Math.max(1, Math.min(4, Math.floor(Number.isFinite(requested) ? requested : 2)));
  }

  function emitSyncProgress(options = {}, progress = {}) {
    if (typeof options.onProgress !== "function") return;
    try {
      options.onProgress({
        ...progress,
        message: String(progress?.message || "Checking Riot data…")
      });
    } catch (_error) {
      // Progress reporting is strictly observational. A UI callback must
      // never make a valid Henrik sync fail.
    }
  }

  function emitSyncRequest(options = {}, request = {}) {
    if (typeof options.onRequest !== "function") return;
    try {
      options.onRequest({ ...request });
    } catch (_error) {
      // Diagnostics are optional and must not alter the sync path.
    }
  }

  function getStoredRefreshMatchId(item = {}) {
    return String(
      item?.matchId
      || item?.id
      || item?.record?.id
      || item?.record?.matchId
      || item?.record?.legacyMatchId
      || ""
    ).trim();
  }

  function getStoredRefreshRecord(item = {}) {
    const candidate = item?.record || item?.matchRecord || item;
    if (candidate?.schemaVersion) return candidate;
    if (candidate?.matchRecord?.schemaVersion) return candidate.matchRecord;
    return candidate && typeof candidate === "object" ? candidate : {};
  }

  function getStoredRefreshV4Payload(record = {}) {
    const candidate = record?.rawHenrikPayload || record?.matchRecord?.rawHenrikPayload || null;
    const data = candidate?.data && typeof candidate.data === "object" ? candidate.data : candidate;
    return data?.metadata?.match_id && Array.isArray(data?.players) ? candidate : null;
  }

  function getStoredRefreshRankContext(record = {}) {
    const rank = record?.rank && typeof record.rank === "object" ? record.rank : {};
    return {
      rank: rank.rank || record?.rankLabel || record?.tier || "",
      rr: rank.rr ?? record?.rrTotal ?? null,
      rrDelta: rank.rrDelta ?? record?.verifiedRrDelta ?? record?.rr ?? null,
      rankElo: rank.elo ?? record?.rankElo ?? null,
      rrVerified: rank.verified === true || record?.rrVerified === true,
      rankDataSource: rank.source || record?.rankDataSource || "",
      rankCapturedAt: rank.capturedAt || record?.rankCapturedAt || "",
      isPlacementMatch: record?.isPlacementMatch === true
    };
  }

  function createRawHydrationFailure(matchId = "", error = null, options = {}) {
    const skipped = options.skipped === true;
    const circuit = options.circuit || {};
    return {
      matchId,
      stage: "raw-round-data",
      error: skipped
        ? "Optional round detail was skipped after the data provider became temporarily unavailable."
        : error?.message || "Round detail could not be loaded.",
      code: String(error?.code || circuit?.code || (skipped ? "raw_hydration_circuit_open" : "henrik_request_failed")),
      status: Number(error?.status || circuit?.status) || 0,
      retryable: skipped || isTransientSyncError(error),
      skipped
    };
  }

  function shouldOpenRawHydrationCircuit(failure = {}) {
    return failure?.stage === "raw-round-data"
      && failure?.skipped !== true
      && isTransientSyncError(failure);
  }

  async function hydrateStoredHenrikMatch(descriptor = {}, context = {}) {
    const matchId = getStoredRefreshMatchId(descriptor);
    const record = getStoredRefreshRecord(descriptor);
    const fallbackRecord = {
      ...record,
      id: record?.id || matchId,
      matchId: record?.matchId || matchId
    };
    const localContext = getStoredRefreshRankContext(record);
    if (context.rawHydrationCircuit?.open) {
      return {
        record: fallbackRecord,
        failure: createRawHydrationFailure(matchId, null, {
          skipped: true,
          circuit: context.rawHydrationCircuit
        }),
        directRawSucceeded: false
      };
    }
    try {
      if (!context.hydrateRoundData) {
        return { record: fallbackRecord, failure: null, directRawSucceeded: false };
      }
      const rawPayload = await requestJsonWithRetry("/api/henrik/raw", { matchId, region: context.region }, {
        ...context.options,
        matchTimeoutMs: context.rawMatchTimeoutMs,
        matchRetryDelaysMs: context.rawMatchRetryDelaysMs
      });
      return {
        record: mapHenrikRawMatch(rawPayload, {
          puuid: context.puuid,
          // Raw round payloads do not contain all V4 aggregate fields. Reuse a
          // previously stored V4 response when available; otherwise preserve
          // the verified local context rather than re-paging the history API.
          parsedMatch: getStoredRefreshV4Payload(record) || {},
          agent: record?.agent || "",
          role: record?.role || "",
          map: record?.map || "",
          ...localContext
        }),
        failure: null,
        directRawSucceeded: true
      };
    } catch (error) {
      return {
        record: fallbackRecord,
        failure: createRawHydrationFailure(matchId, error),
        directRawSucceeded: false
      };
    }
  }

  async function hydratePendingHenrikMatch(parsedMatch = {}, context = {}) {
    if (parsedMatch?.__rankedCoachStoredRefresh === true) {
      return hydrateStoredHenrikMatch(parsedMatch, context);
    }
    const matchId = getParsedMatchId(parsedMatch);
    try {
      const v4Record = mapHenrikV4Match(parsedMatch, {
        puuid: context.puuid,
        mmrSnapshot: context.mmrByMatchId?.get(matchId) || null
      });
      if (!context.hydrateRoundData) return { record: v4Record, failure: null };
      if (context.rawHydrationCircuit?.open) {
        return {
          record: v4Record,
          failure: createRawHydrationFailure(matchId, null, {
            skipped: true,
            circuit: context.rawHydrationCircuit
          })
        };
      }

      try {
        const rawPayload = await requestJsonWithRetry("/api/henrik/raw", { matchId, region: context.region }, {
          ...context.options,
          matchTimeoutMs: context.rawMatchTimeoutMs,
          matchRetryDelaysMs: context.rawMatchRetryDelaysMs
        });
        return {
          record: mapHenrikRawMatch(rawPayload, {
            puuid: context.puuid,
            parsedMatch,
            agent: v4Record.agent,
            role: v4Record.role,
            map: v4Record.map,
            rank: v4Record.rank?.rank,
            rr: v4Record.rank?.rr,
            rrDelta: v4Record.rank?.rrDelta,
            rankElo: v4Record.rank?.elo,
            rrVerified: v4Record.rank?.verified === true,
            rankDataSource: v4Record.rank?.source,
            rankCapturedAt: v4Record.rank?.capturedAt,
            isPlacementMatch: v4Record.isPlacementMatch === true
          }),
          failure: null
        };
      } catch (error) {
        return {
          record: v4Record,
          failure: createRawHydrationFailure(matchId, error)
        };
      }
    } catch (error) {
      return {
        record: null,
        failure: { matchId, error: error?.message || "Match mapping failed." }
      };
    }
  }

  async function hydratePendingHenrikMatches(pendingMatches = [], context = {}) {
    const source = Array.isArray(pendingMatches) ? pendingMatches : [];
    const hydrated = new Array(source.length);
    const rawHydrationCircuit = context.rawHydrationCircuit || {
      open: false,
      code: "",
      status: 0,
      message: "",
      matchId: ""
    };
    let nextIndex = 0;
    let completed = 0;
    const workerCount = Math.min(source.length, getRawHydrationConcurrency(context.options));

    async function worker() {
      while (nextIndex < source.length) {
        const index = nextIndex;
        nextIndex += 1;
        emitSyncProgress(context.options, {
          stage: "raw-match",
          completed,
          total: source.length,
          percent: source.length ? Math.round((completed / source.length) * 100) : 100,
          message: `Fetching match details — ${Math.min(source.length, completed + 1)} of ${source.length}`
        });
        const result = await hydratePendingHenrikMatch(source[index], {
          ...context,
          rawHydrationCircuit
        });
        hydrated[index] = result;
        completed += 1;
        emitSyncProgress(context.options, {
          stage: "raw-match",
          completed,
          total: source.length,
          percent: source.length ? Math.round((completed / source.length) * 100) : 100,
          message: `Fetching match details — ${completed} of ${source.length}`
        });
        if (!rawHydrationCircuit.open && shouldOpenRawHydrationCircuit(result?.failure)) {
          rawHydrationCircuit.open = true;
          rawHydrationCircuit.code = String(result.failure.code || "henrik_request_failed");
          rawHydrationCircuit.status = Number(result.failure.status) || 0;
          rawHydrationCircuit.message = String(result.failure.error || "");
          rawHydrationCircuit.matchId = String(result.failure.matchId || "");
        }
      }
    }

    await Promise.all(Array.from({ length: workerCount }, () => worker()));
    return hydrated;
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
    const startedAt = Date.now();
    emitSyncRequest(options, {
      phase: "start",
      path,
      body: { ...(body || {}) },
      startedAt
    });
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
        signal: controller.signal
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || payload?.ok === false) {
        const status = Number(payload?.status) || response.status;
        throw createSyncRequestError(payload?.error || `Match sync failed (${response.status}).`, {
          code: payload?.code || `henrik_${status}`,
          status,
          retryable: Boolean(payload?.retryable) || [408, 429].includes(status) || status >= 500
        });
      }
      emitSyncRequest(options, {
        phase: "end",
        path,
        body: { ...(body || {}) },
        startedAt,
        durationMs: Date.now() - startedAt,
        httpStatus: Number(response.status) || 0,
        providerStatus: Number(payload?.status) || Number(response.status) || 0,
        ok: true
      });
      return payload;
    } catch (error) {
      emitSyncRequest(options, {
        phase: "end",
        path,
        body: { ...(body || {}) },
        startedAt,
        durationMs: Date.now() - startedAt,
        httpStatus: Number(error?.status) || 0,
        providerStatus: Number(error?.status) || 0,
        ok: false,
        code: String(error?.code || "henrik_request_failed"),
        error: String(error?.message || "Match sync failed.")
      });
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
        emitSyncProgress(options, {
          stage: "retry",
          path,
          attempt,
          maxAttempts: retryDelaysMs.length,
          percent: 0,
          message: `Waiting on Henrik — retry ${attempt} of ${retryDelaysMs.length}`,
          detail: `${path} returned ${Number(error?.status) || "a temporary error"}; retrying now.`
        });
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

  function normalizeMmrHistory(payload = {}, rankedCoachSource = HENRIK_STORED_MMR_SOURCE) {
    const data = payload?.data;
    let snapshots = [];
    if (Array.isArray(data)) {
      snapshots = data.some(item => Array.isArray(item?.history))
        ? data.flatMap(item => Array.isArray(item?.history) ? item.history : [])
        : data;
    } else if (Array.isArray(data?.history)) {
      snapshots = data.history;
    } else if (Array.isArray(payload?.history)) {
      snapshots = payload.history;
    }
    return snapshots
      .filter(snapshot => snapshot && getMmrSnapshotMatchId(snapshot))
      .map(snapshot => ({ ...snapshot, rankedCoachSource }));
  }

  function mergeMmrHistories(storedPayload = {}, livePayload = {}) {
    const byMatchId = new Map();
    normalizeMmrHistory(storedPayload, HENRIK_STORED_MMR_SOURCE)
      .forEach(snapshot => byMatchId.set(getMmrSnapshotMatchId(snapshot), snapshot));
    normalizeMmrHistory(livePayload, HENRIK_LIVE_MMR_SOURCE)
      .forEach(snapshot => byMatchId.set(getMmrSnapshotMatchId(snapshot), snapshot));
    return [...byMatchId.values()];
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
      const completedResult = ["win", "loss"].includes(String(match?.result || match?.metadata?.result || "").toLowerCase());
      const hasRoundData = Array.isArray(match?.matchRecord?.roundByRound)
        ? match.matchRecord.roundByRound.length > 0
        : Number(match?.advanced?.roundsWon || 0) + Number(match?.advanced?.roundsLost || 0) > 0;
      const isPlacementMatch = match?.isPlacementMatch === true
        || match?.metadata?.isPlacementMatch === true
        || match?.matchRecord?.isPlacementMatch === true
        || (Number(match?.matchRecord?.trackedPlayer?.competitiveTier) === 0 && completedResult && hasRoundData);
      const snapshot = snapshots.get(matchId);
      if (!snapshot) {
        const alreadyVerified = match?.rrVerified === true
          && match?.verifiedRrDelta !== null
          && match?.verifiedRrDelta !== undefined
          && Number.isFinite(Number(match.verifiedRrDelta));
        return {
          ...match,
          rr: alreadyVerified ? Number(match.verifiedRrDelta) : null,
          verifiedRrDelta: alreadyVerified ? Number(match.verifiedRrDelta) : null,
          rrVerified: alreadyVerified,
          isPlacementMatch,
          matchRecord: match?.matchRecord ? { ...match.matchRecord, isPlacementMatch } : match?.matchRecord,
          metadata: { ...(match?.metadata || {}), isPlacementMatch }
        };
      }
      const verified = isVerifiedMmrSnapshot(snapshot);
      const rankPatch = verified ? {
        rank: String(snapshot?.tier?.name || match?.rank || match?.matchRecord?.rank?.rank || "").trim() || null,
        rr: Number(snapshot.rr),
        rrDelta: Number(snapshot.last_change),
        elo: Number.isFinite(Number(snapshot.elo)) ? Number(snapshot.elo) : null,
        verified: true,
        source: String(snapshot?.rankedCoachSource || HENRIK_STORED_MMR_SOURCE).trim(),
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
        // A Henrik MMR snapshot is the only RR delta we can prove belongs
        // to this match. Never substitute a result-based estimate here.
        rr: verified ? rankPatch.rrDelta : null,
        verifiedRrDelta: verified ? rankPatch.rrDelta : null,
        rrTotal: verified ? rankPatch.rr : null,
        rrVerified: verified,
        isPlacementMatch: verified ? false : isPlacementMatch,
        rank: rankPatch.rank || match?.rank || null,
        rankElo: rankPatch.elo,
        rankDataSource: rankPatch.source,
        rankCapturedAt: rankPatch.capturedAt,
        matchRecord: match?.matchRecord ? {
          ...match.matchRecord,
          isPlacementMatch: verified ? false : isPlacementMatch,
          rank: rankPatch
        } : match?.matchRecord,
        metadata: {
          ...(match?.metadata || {}),
          isPlacementMatch: verified ? false : isPlacementMatch,
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
    const knownMatchIds = new Set((options.knownMatchIds || []).map(value => String(value || "").trim()).filter(Boolean));
    const refreshMatchIds = new Set((options.refreshMatchIds || []).map(value => String(value || "").trim()).filter(Boolean));
    const storedRefreshById = new Map(
      (Array.isArray(options.refreshMatchRecords) ? options.refreshMatchRecords : [])
        .map(item => [getStoredRefreshMatchId(item), item])
        .filter(([matchId]) => Boolean(matchId))
    );
    const includeKnownMatches = options.includeKnownMatches === true;
    let puuid = String(options.puuid || "").trim();
    let account = null;

    if (!puuid) {
      if (!riotId) throw new Error("Set Riot ID first.");
      emitSyncProgress(options, {
        stage: "account",
        percent: 4,
        message: "Resolving your Riot account…"
      });
      const accountPayload = await requestJson("/api/henrik/account", { riotId }, options);
      account = accountPayload?.data || accountPayload;
      puuid = String(account?.puuid || "").trim();
      if (!puuid) throw new Error("Henrik did not return a PUUID for this Riot ID.");
    }

    emitSyncProgress(options, {
      stage: "mmr-history",
      percent: 8,
      message: "Checking rank history…"
    });
    const mmrHistoryPromise = options.fetchMmrHistory === false
      ? Promise.resolve([
        { status: "fulfilled", value: { data: [] } },
        { status: "fulfilled", value: { data: [] } }
      ])
      : Promise.allSettled([
        requestJsonWithRetry("/api/henrik/mmr-history-live", { puuid, region }, options),
        requestJsonWithRetry("/api/henrik/mmr-history", {
          puuid,
          region,
          size: 100,
          page: 1
        }, options)
      ]);

    const parsedMatches = [];
    const fetchedStarts = new Set();
    const refreshSearchFailures = [];
    let historyExhausted = false;
    let matchSyncError = null;
    const historyPagePlan = Array.from({ length: Math.ceil(historyLimit / pageSize) }, (_value, index) => {
      const offset = index * pageSize;
      return {
        page: index + 1,
        start: historyStart + offset,
        count: Math.min(pageSize, historyLimit - offset)
      };
    });
    const historyPageResults = new Array(historyPagePlan.length);
    const fetchHistoryPage = async (descriptor) => {
      fetchedStarts.add(descriptor.start);
      emitSyncProgress(options, {
        stage: "match-history",
        page: descriptor.page,
        totalPages: historyPagePlan.length,
        percent: historyPagePlan.length ? Math.round(((descriptor.page - 1) / historyPagePlan.length) * 62) : 62,
        message: `Checking match history — page ${descriptor.page} of ${historyPagePlan.length}`
      });
      try {
        const payload = await requestJsonWithRetry("/api/henrik/matches", {
          puuid,
          region,
          count: descriptor.count,
          start: descriptor.start
        }, options);
        const pageMatches = Array.isArray(payload?.data) ? payload.data : [];
        emitSyncProgress(options, {
          stage: "match-history",
          page: descriptor.page,
          totalPages: historyPagePlan.length,
          percent: historyPagePlan.length ? Math.round((descriptor.page / historyPagePlan.length) * 62) : 62,
          message: `Checking match history — page ${descriptor.page} of ${historyPagePlan.length}`
        });
        return { ...descriptor, pageMatches };
      } catch (error) {
        return { ...descriptor, pageMatches: [], error };
      }
    };

    // Fetch the first page alone so an empty or short recent history avoids a
    // needless burst. Once it is full, later fixed-size pages are independent
    // and can safely use a small bounded pool rather than serializing ten
    // network round trips during a retained-history backfill.
    if (historyPagePlan.length) {
      historyPageResults[0] = await fetchHistoryPage(historyPagePlan[0]);
      const first = historyPageResults[0];
      if (!first?.error && first.pageMatches.length >= first.count) {
        // Keep the final page as a confirmation request. The API commonly
        // ends on that page; requesting it only after the preceding pool is
        // full preserves the old short-page stop behavior instead of issuing
        // an unnecessary final request after history has already ended.
        const finalPageIndex = historyPagePlan.length - 1;
        let nextHistoryPage = 1;
        const workerCount = Math.min(
          Math.max(0, finalPageIndex - nextHistoryPage),
          getHistoryPageConcurrency(options)
        );
        const worker = async () => {
          while (nextHistoryPage < finalPageIndex) {
            const pageIndex = nextHistoryPage;
            nextHistoryPage += 1;
            historyPageResults[pageIndex] = await fetchHistoryPage(historyPagePlan[pageIndex]);
          }
        };
        if (workerCount) {
          await Promise.all(Array.from({ length: workerCount }, () => worker()));
        }
        const knownFullHistory = historyPageResults
          .slice(0, finalPageIndex)
          .every(result => result && !result.error && result.pageMatches.length >= result.count);
        if (finalPageIndex > 0 && knownFullHistory) {
          historyPageResults[finalPageIndex] = await fetchHistoryPage(historyPagePlan[finalPageIndex]);
        }
      }
    }

    for (const result of historyPageResults.filter(Boolean)) {
      if (result.error) {
        matchSyncError = {
          code: String(result.error?.code || "henrik_request_failed"),
          status: Number(result.error?.status) || 0,
          message: result.error?.message || "Match history is temporarily unavailable.",
          retryable: isTransientSyncError(result.error),
          attempts: Number(result.error?.attempts) || 1,
          start: result.start,
          count: result.count
        };
        break;
      }
      parsedMatches.push(...result.pageMatches);
      if (result.pageMatches.length < result.count) {
        historyExhausted = true;
        break;
      }
    }

    const parsedMatchIds = () => new Set(parsedMatches.map(getParsedMatchId).filter(Boolean));
    // Backfill candidates are already canonical local records. Do not page
    // through Henrik's history merely to rediscover their ids before calling
    // the raw endpoint; that made a 16-record batch fan into ~10 sequential
    // /matches calls on long histories. A just-fetched V4 summary remains the
    // preferred source when it is already in the initial history window.
    const directStoredRefreshIds = new Set(
      [...refreshMatchIds].filter(matchId => storedRefreshById.has(matchId) && !parsedMatchIds().has(matchId))
    );
    let unresolvedRefreshMatchIds = [...refreshMatchIds].filter(matchId => (
      !parsedMatchIds().has(matchId) && !directStoredRefreshIds.has(matchId)
    ));
    let refreshSearchChecked = 0;
    let refreshSearchComplete = unresolvedRefreshMatchIds.length === 0;
    if (unresolvedRefreshMatchIds.length && options.searchRefreshMatchIds !== false) {
      const targetIds = new Set(unresolvedRefreshMatchIds);
      const refreshSearchLimit = Math.min(
        1000,
        Math.max(
          historyStart + historyLimit,
          Math.floor(Number(options.refreshSearchLimit) || 1000)
        )
      );
      for (let start = 0; start < refreshSearchLimit && targetIds.size; start += pageSize) {
        if (fetchedStarts.has(start)) continue;
        fetchedStarts.add(start);
        refreshSearchChecked += pageSize;
        let matchesPayload;
        try {
          matchesPayload = await requestJsonWithRetry("/api/henrik/matches", { puuid, region, count: pageSize, start }, options);
        } catch (error) {
          refreshSearchFailures.push({
            stage: "weapon-backfill-search",
            code: String(error?.code || "henrik_request_failed"),
            status: Number(error?.status) || 0,
            error: error?.message || "Weapon backfill history search failed.",
            retryable: isTransientSyncError(error),
            start,
            count: pageSize
          });
          break;
        }
        const pageMatches = Array.isArray(matchesPayload?.data) ? matchesPayload.data : [];
        pageMatches.forEach(match => {
          const matchId = getParsedMatchId(match);
          if (targetIds.has(matchId)) {
            parsedMatches.push(match);
            targetIds.delete(matchId);
          }
        });
        if (pageMatches.length < pageSize) {
          refreshSearchComplete = true;
          break;
        }
      }
      unresolvedRefreshMatchIds = [...targetIds];
      refreshSearchComplete = refreshSearchComplete
        || unresolvedRefreshMatchIds.length === 0
        || (refreshSearchChecked > 0 && !refreshSearchFailures.length);
    }
    const [liveMmrResult, storedMmrResult] = await mmrHistoryPromise;
    const liveMmrPayload = liveMmrResult.status === "fulfilled" ? liveMmrResult.value : { data: [] };
    const storedMmrPayload = storedMmrResult.status === "fulfilled" ? storedMmrResult.value : { data: [] };
    const mmrHistory = mergeMmrHistories(storedMmrPayload, liveMmrPayload);
    const mmrHistoryErrors = {
      live: liveMmrResult.status === "rejected"
        ? liveMmrResult.reason?.message || "Live MMR history unavailable."
        : "",
      stored: storedMmrResult.status === "rejected"
        ? storedMmrResult.reason?.message || "Stored MMR history unavailable."
        : ""
    };
    const mmrByMatchId = new Map(mmrHistory.map(snapshot => [getMmrSnapshotMatchId(snapshot), snapshot]));
    const hydrateRoundData = options.hydrateRoundData === true;
    const pendingMatches = parsedMatches.filter(match => {
      const matchId = getParsedMatchId(match);
      return matchId && (includeKnownMatches || !knownMatchIds.has(matchId) || refreshMatchIds.has(matchId));
    });
    const directStoredRefreshes = [...directStoredRefreshIds]
      .map(matchId => storedRefreshById.get(matchId))
      .filter(Boolean)
      .map(item => ({
        __rankedCoachStoredRefresh: true,
        matchId: getStoredRefreshMatchId(item),
        record: getStoredRefreshRecord(item)
      }));
    const hydrationQueue = [...pendingMatches, ...directStoredRefreshes];
    const records = [];
    const failures = [
      ...refreshSearchFailures,
      ...(matchSyncError ? [{ stage: "matches", ...matchSyncError }] : [])
    ];
    const rawHydrationConcurrency = getRawHydrationConcurrency(options);
    const rawMatchTimeoutMs = getRawHydrationTimeoutMs(options);
    const rawMatchRetryDelaysMs = getRawHydrationRetryDelays(options);
    const rawHydrationCircuit = {
      open: false,
      code: "",
      status: 0,
      message: "",
      matchId: ""
    };
    const hydratedPendingMatches = await hydratePendingHenrikMatches(hydrationQueue, {
      puuid,
      region,
      mmrByMatchId,
      hydrateRoundData,
      rawMatchTimeoutMs,
      rawMatchRetryDelaysMs,
      rawHydrationCircuit,
      options
    });
    const directRefreshSucceededMatchIds = [];
    hydratedPendingMatches.forEach(result => {
      if (result?.record) records.push(result.record);
      if (result?.failure) failures.push(result.failure);
      if (result?.directRawSucceeded && result?.record) {
        const matchId = String(result.record?.id || result.record?.matchId || "").trim();
        if (matchId) directRefreshSucceededMatchIds.push(matchId);
      }
    });

    if (hydrationQueue.length && !records.length) {
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
      refreshMatchIds: [...refreshMatchIds],
      directRefreshMatchIds: [...directStoredRefreshIds],
      directRefreshSucceededMatchIds: [...new Set(directRefreshSucceededMatchIds)],
      unresolvedRefreshMatchIds,
      refreshSearchChecked,
      refreshSearchComplete,
      rawHydrationConcurrency: hydrateRoundData ? rawHydrationConcurrency : 0,
      rawMatchTimeoutMs: hydrateRoundData ? rawMatchTimeoutMs : 0,
      rawHydrationCircuit: {
        opened: rawHydrationCircuit.open === true,
        code: rawHydrationCircuit.code,
        status: rawHydrationCircuit.status,
        skipped: failures.filter(failure => failure?.skipped === true).length
      },
      mmrHistory,
      mmrHistoryError: Object.entries(mmrHistoryErrors)
        .filter(([, message]) => message)
        .map(([source, message]) => `${source}: ${message}`)
        .join(" "),
      mmrHistoryErrors,
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
    normalizeMmrHistory,
    mergeMmrHistories,
    enrichLegacyMatchesWithMmr,
    checkWarmupMatches,
    pullMatches
  });
})();
