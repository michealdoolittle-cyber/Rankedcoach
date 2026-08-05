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
    // Raw match payloads are substantially heavier than summary history. Keep
    // a modest, bounded pool so a backlog does not serialize into minutes of
    // waiting, without overwhelming Henrik or the Worker.
    return Math.max(1, Math.min(8, Math.floor(Number.isFinite(requested) ? requested : 6)));
  }

  function getRawHydrationTimeoutMs(options = {}) {
    const requested = Number(options.rawMatchTimeoutMs ?? options.rawHydrationTimeoutMs);
    // A historical round payload is optional: preserve the aggregate V4 record
    // when it is slow rather than holding the entire sync for 50 seconds.
    return Math.max(3000, Math.min(10000, Number.isFinite(requested) ? requested : 9000));
  }

  function getRawHydrationRetryDelays(options = {}) {
    if (Array.isArray(options.rawMatchRetryDelaysMs)) return options.rawMatchRetryDelaysMs;
    // One short retry handles brief 429/5xx responses without multiplying the
    // delay of a full historical batch.
    return [450];
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

  async function hydrateStoredHenrikMatch(descriptor = {}, context = {}) {
    const matchId = getStoredRefreshMatchId(descriptor);
    const record = getStoredRefreshRecord(descriptor);
    const fallbackRecord = {
      ...record,
      id: record?.id || matchId,
      matchId: record?.matchId || matchId
    };
    const localContext = getStoredRefreshRankContext(record);
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
        failure: {
          matchId,
          stage: "raw-round-data",
          error: error?.message || "Round detail could not be loaded."
        },
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
          failure: {
            matchId,
            stage: "raw-round-data",
            error: error?.message || "Round detail could not be loaded."
          }
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
    let nextIndex = 0;
    const workerCount = Math.min(source.length, getRawHydrationConcurrency(context.options));

    async function worker() {
      while (nextIndex < source.length) {
        const index = nextIndex;
        nextIndex += 1;
        hydrated[index] = await hydratePendingHenrikMatch(source[index], context);
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
      const accountPayload = await requestJson("/api/henrik/account", { riotId }, options);
      account = accountPayload?.data || accountPayload;
      puuid = String(account?.puuid || "").trim();
      if (!puuid) throw new Error("Henrik did not return a PUUID for this Riot ID.");
    }

    const mmrHistoryPromise = Promise.allSettled([
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
    for (let offset = 0; offset < historyLimit; offset += pageSize) {
      const start = historyStart + offset;
      const count = Math.min(pageSize, historyLimit - offset);
      fetchedStarts.add(start);
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
    const hydratedPendingMatches = await hydratePendingHenrikMatches(hydrationQueue, {
      puuid,
      region,
      mmrByMatchId,
      hydrateRoundData,
      rawMatchTimeoutMs,
      rawMatchRetryDelaysMs,
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
