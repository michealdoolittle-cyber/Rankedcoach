const RIOT_SYNC_FEATURE_FLAG = false;
const HENRIK_SYNC_FEATURE_FLAG = true;

function isRiotSyncEnabled(flags = {}) {
  return Boolean(RIOT_SYNC_FEATURE_FLAG && flags.riotSync === true);
}

function isHenrikSyncEnabled() {
  return HENRIK_SYNC_FEATURE_FLAG;
}

function createRsoAuthorizationUrl({ clientId, redirectUri, state, scope = "openid offline_access" } = {}, flags = {}) {
  if (!isRiotSyncEnabled(flags)) {
    return { enabled: false, reason: "riot_sync_feature_flag_off" };
  }
  const url = new URL("https://auth.riotgames.com/authorize");
  url.searchParams.set("client_id", clientId || "");
  url.searchParams.set("redirect_uri", redirectUri || "");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state || "");
  return { enabled: true, url: url.toString() };
}

function mapRiotMatchToCanonicalRecord(match, context = {}, matchRecordAdapter = globalThis.RankedCoachMatchRecord) {
  if (!matchRecordAdapter?.fromRiotMatch) {
    throw new Error("Match Record adapter is required before Riot sync can map data.");
  }
  return matchRecordAdapter.fromRiotMatch(match, context);
}

function mapHenrikMatchToCanonicalRecord(match, context = {}, matchRecordAdapter = globalThis.RankedCoachMatchRecord) {
  if (!matchRecordAdapter?.fromHenrikV4Match) {
    throw new Error("Match Record adapter is required before Henrik sync can map data.");
  }
  return matchRecordAdapter.fromHenrikV4Match(match, context);
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
      matchRecord: match?.matchRecord ? { ...match.matchRecord, rank: rankPatch } : match?.matchRecord,
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

async function pullRiotMatches(options = {}, matchRecordAdapter = globalThis.RankedCoachMatchRecord) {
  if (!isHenrikSyncEnabled()) {
    return { enabled: false, reason: "henrik_sync_feature_flag_off", records: [] };
  }
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const baseUrl = String(options.baseUrl || "").replace(/\/$/, "");
  const requestJson = async (path, body) => {
    const response = await fetchImpl(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || `Match sync failed (${response.status}).`);
    return payload;
  };
  const region = String(options.region || "na").toLowerCase();
  const historyLimit = Math.min(100, Math.max(1, Number(options.historyLimit) || Number(options.count) || 10));
  const historyStart = Math.min(1000, Math.max(0, Math.floor(Number(options.historyStart) || 0)));
  const pageSize = Math.min(10, historyLimit);
  const known = new Set((options.knownMatchIds || []).map(String));
  const refresh = new Set((options.refreshMatchIds || []).map(String));
  const includeKnownMatches = options.includeKnownMatches === true;
  let puuid = String(options.puuid || "").trim();
  let account = null;
  if (!puuid) {
    const accountPayload = await requestJson("/api/henrik/account", { riotId: options.riotId });
    account = accountPayload?.data || accountPayload;
    puuid = String(account?.puuid || "").trim();
  }
  if (!puuid) throw new Error("Henrik did not return a PUUID for this Riot ID.");
  const mmrHistoryPromise = requestJson("/api/henrik/mmr-history", { puuid, region, size: 100, page: 1 })
    .catch(error => ({ data: [], error: error?.message || "MMR history unavailable." }));
  const parsedMatches = [];
  const fetchedStarts = new Set();
  let historyExhausted = false;
  for (let offset = 0; offset < historyLimit; offset += pageSize) {
    const start = historyStart + offset;
    const count = Math.min(pageSize, historyLimit - offset);
    fetchedStarts.add(start);
    const matchesPayload = await requestJson("/api/henrik/matches", { puuid, region, count, start });
    const pageMatches = Array.isArray(matchesPayload?.data) ? matchesPayload.data : [];
    parsedMatches.push(...pageMatches);
    if (pageMatches.length < count) {
      historyExhausted = true;
      break;
    }
  }
  const parsedMatchIds = () => new Set(parsedMatches
    .map(match => String(match?.metadata?.match_id || match?.metadata?.matchid || ""))
    .filter(Boolean));
  let unresolvedRefreshMatchIds = [...refresh].filter(matchId => !parsedMatchIds().has(matchId));
  let refreshSearchChecked = 0;
  let refreshSearchComplete = unresolvedRefreshMatchIds.length === 0;
  const refreshSearchFailures = [];
  if (unresolvedRefreshMatchIds.length && options.searchRefreshMatchIds !== false) {
    const targetIds = new Set(unresolvedRefreshMatchIds);
    const refreshSearchLimit = Math.min(
      1000,
      Math.max(historyStart + historyLimit, Math.floor(Number(options.refreshSearchLimit) || 1000))
    );
    for (let start = 0; start < refreshSearchLimit && targetIds.size; start += pageSize) {
      if (fetchedStarts.has(start)) continue;
      fetchedStarts.add(start);
      refreshSearchChecked += pageSize;
      try {
        const matchesPayload = await requestJson("/api/henrik/matches", { puuid, region, count: pageSize, start });
        const pageMatches = Array.isArray(matchesPayload?.data) ? matchesPayload.data : [];
        pageMatches.forEach(match => {
          const matchId = String(match?.metadata?.match_id || match?.metadata?.matchid || "");
          if (targetIds.has(matchId)) {
            parsedMatches.push(match);
            targetIds.delete(matchId);
          }
        });
        if (pageMatches.length < pageSize) {
          refreshSearchComplete = true;
          break;
        }
      } catch (error) {
        refreshSearchFailures.push({
          stage: "weapon-backfill-search",
          error: error?.message || "Weapon backfill history search failed.",
          start,
          count: pageSize
        });
        break;
      }
    }
    unresolvedRefreshMatchIds = [...targetIds];
    refreshSearchComplete = refreshSearchComplete
      || unresolvedRefreshMatchIds.length === 0
      || (refreshSearchChecked > 0 && !refreshSearchFailures.length);
  }
  const mmrPayload = await mmrHistoryPromise;
  const mmrHistory = Array.isArray(mmrPayload?.data) ? mmrPayload.data : [];
  const mmrByMatchId = new Map(mmrHistory.map(snapshot => [getMmrSnapshotMatchId(snapshot), snapshot]));
  const records = [];
  const failures = [...refreshSearchFailures];
  for (const parsedMatch of parsedMatches) {
    const matchId = String(parsedMatch?.metadata?.match_id || parsedMatch?.metadata?.matchid || "");
    if (!matchId || (known.has(matchId) && !refresh.has(matchId) && !includeKnownMatches)) continue;
    try {
      records.push(mapHenrikMatchToCanonicalRecord(parsedMatch, {
        puuid,
        mmrSnapshot: mmrByMatchId.get(matchId) || null
      }, matchRecordAdapter));
    } catch (error) {
      failures.push({ matchId, error: error?.message || "Match mapping failed." });
    }
  }
  if (failures.length && !records.length) throw new Error(failures[0].error);
  return {
    enabled: true,
    provider: "henrik",
    puuid,
    account,
    records,
    failures,
    checked: parsedMatches.length,
    historyLimit,
    historyStart,
    historyExhausted,
    historyWindowComplete: historyExhausted,
    refreshMatchIds: [...refresh],
    unresolvedRefreshMatchIds,
    refreshSearchChecked,
    refreshSearchComplete,
    mmrHistory,
    mmrHistoryError: mmrPayload?.error || ""
  };
}

module.exports = {
  RIOT_SYNC_FEATURE_FLAG,
  HENRIK_SYNC_FEATURE_FLAG,
  isRiotSyncEnabled,
  isHenrikSyncEnabled,
  createRsoAuthorizationUrl,
  mapRiotMatchToCanonicalRecord,
  mapHenrikMatchToCanonicalRecord,
  enrichLegacyMatchesWithMmr,
  pullRiotMatches
};
