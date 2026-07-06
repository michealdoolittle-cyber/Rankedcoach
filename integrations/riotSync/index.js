const RIOT_SYNC_FEATURE_FLAG = false;

function isRiotSyncEnabled(flags = {}) {
  return Boolean(RIOT_SYNC_FEATURE_FLAG && flags.riotSync === true);
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

async function pullRiotMatches() {
  return {
    enabled: false,
    reason: "riot_sync_feature_flag_off",
    records: []
  };
}

module.exports = {
  RIOT_SYNC_FEATURE_FLAG,
  isRiotSyncEnabled,
  createRsoAuthorizationUrl,
  mapRiotMatchToCanonicalRecord,
  pullRiotMatches
};
