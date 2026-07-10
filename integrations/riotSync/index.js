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
  if (!matchRecordAdapter?.fromHenrikRawMatch) {
    throw new Error("Match Record adapter is required before Henrik sync can map data.");
  }
  return matchRecordAdapter.fromHenrikRawMatch(match, context);
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
  const count = Math.min(10, Math.max(1, Number(options.count) || 5));
  let puuid = String(options.puuid || "").trim();
  let account = null;
  if (!puuid) {
    const accountPayload = await requestJson("/api/henrik/account", { riotId: options.riotId });
    account = accountPayload?.data || accountPayload;
    puuid = String(account?.puuid || "").trim();
  }
  if (!puuid) throw new Error("Henrik did not return a PUUID for this Riot ID.");
  const matchesPayload = await requestJson("/api/henrik/matches", { puuid, region, count });
  const parsedMatches = Array.isArray(matchesPayload?.data) ? matchesPayload.data : [];
  const known = new Set((options.knownMatchIds || []).map(String));
  const records = [];
  const failures = [];
  for (const parsedMatch of parsedMatches) {
    const matchId = String(parsedMatch?.metadata?.matchid || parsedMatch?.metadata?.match_id || "");
    if (!matchId || known.has(matchId)) continue;
    try {
      const rawMatch = await requestJson("/api/henrik/raw", { matchId, region });
      records.push(mapHenrikMatchToCanonicalRecord(rawMatch, { puuid, parsedMatch }, matchRecordAdapter));
    } catch (error) {
      failures.push({ matchId, error: error?.message || "Match mapping failed." });
    }
  }
  if (failures.length && !records.length) throw new Error(failures[0].error);
  return { enabled: true, provider: "henrik", puuid, account, records, failures, checked: parsedMatches.length };
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
