(function () {
  "use strict";

  const RIOT_SYNC_FEATURE_FLAG = false;

  function isEnabled() {
    return Boolean(RIOT_SYNC_FEATURE_FLAG && globalThis.RANKEDCOACH_FEATURES?.riotSync === true);
  }

  function getStatus() {
    return {
      enabled: isEnabled(),
      reason: isEnabled() ? "enabled" : "riot_sync_feature_flag_off"
    };
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

  async function pullMatches() {
    return {
      enabled: false,
      reason: "riot_sync_feature_flag_off",
      records: []
    };
  }

  globalThis.RankedCoachRiotSync = Object.freeze({
    RIOT_SYNC_FEATURE_FLAG,
    isEnabled,
    getStatus,
    createRsoAuthorizationUrl,
    mapRiotMatch,
    pullMatches
  });
})();
