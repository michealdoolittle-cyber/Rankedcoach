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
  const historyLimit = Math.min(50, Math.max(1, Number(options.historyLimit) || Number(options.count) || 10));
  const pageSize = Math.min(10, historyLimit);
  let puuid = String(options.puuid || "").trim();
  let account = null;
  if (!puuid) {
    const accountPayload = await requestJson("/api/henrik/account", { riotId: options.riotId });
    account = accountPayload?.data || accountPayload;
    puuid = String(account?.puuid || "").trim();
  }
  if (!puuid) throw new Error("Henrik did not return a PUUID for this Riot ID.");
  const parsedMatches = [];
  let historyExhausted = false;
  for (let start = 0; start < historyLimit; start += pageSize) {
    const count = Math.min(pageSize, historyLimit - start);
    const matchesPayload = await requestJson("/api/henrik/matches", { puuid, region, count, start });
    const pageMatches = Array.isArray(matchesPayload?.data) ? matchesPayload.data : [];
    parsedMatches.push(...pageMatches);
    if (pageMatches.length < count) {
      historyExhausted = true;
      break;
    }
  }
  const known = new Set((options.knownMatchIds || []).map(String));
  const refresh = new Set((options.refreshMatchIds || []).map(String));
  const records = [];
  const failures = [];
  for (const parsedMatch of parsedMatches) {
    const matchId = String(parsedMatch?.metadata?.match_id || parsedMatch?.metadata?.matchid || "");
    if (!matchId || (known.has(matchId) && !refresh.has(matchId))) continue;
    try {
      records.push(mapHenrikMatchToCanonicalRecord(parsedMatch, { puuid }, matchRecordAdapter));
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
    historyExhausted,
    historyWindowComplete: historyExhausted || parsedMatches.length >= historyLimit
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
  pullRiotMatches
};
