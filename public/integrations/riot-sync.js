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
        throw new Error(payload?.error || `Match sync failed (${response.status}).`);
      }
      return payload;
    } catch (error) {
      if (error?.name === "AbortError") throw new Error("Match sync timed out.");
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  function getParsedMatchId(match = {}) {
    return String(match?.metadata?.match_id || match?.metadata?.matchid || match?.matchId || "").trim();
  }

  async function pullMatches(options = {}) {
    if (!isHenrikEnabled()) {
      return { enabled: false, reason: "henrik_sync_feature_flag_off", records: [] };
    }

    const riotId = String(options.riotId || "").trim();
    const region = String(options.region || "na").trim().toLowerCase();
    const historyLimit = Math.min(50, Math.max(1, Number(options.historyLimit) || Number(options.count) || 10));
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

    const parsedMatches = [];
    let historyExhausted = false;
    for (let start = 0; start < historyLimit; start += pageSize) {
      const count = Math.min(pageSize, historyLimit - start);
      const matchesPayload = await requestJson("/api/henrik/matches", { puuid, region, count, start }, options);
      const pageMatches = Array.isArray(matchesPayload?.data) ? matchesPayload.data : [];
      parsedMatches.push(...pageMatches);
      if (pageMatches.length < count) {
        historyExhausted = true;
        break;
      }
    }
    const knownMatchIds = new Set((options.knownMatchIds || []).map(value => String(value || "").trim()).filter(Boolean));
    const refreshMatchIds = new Set((options.refreshMatchIds || []).map(value => String(value || "").trim()).filter(Boolean));
    const pendingMatches = parsedMatches.filter(match => {
      const matchId = getParsedMatchId(match);
      return matchId && (!knownMatchIds.has(matchId) || refreshMatchIds.has(matchId));
    });
    const records = [];
    const failures = [];

    for (const parsedMatch of pendingMatches) {
      const matchId = getParsedMatchId(parsedMatch);
      try {
        records.push(mapHenrikV4Match(parsedMatch, { puuid }));
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
      historyExhausted,
      historyWindowComplete: historyExhausted || parsedMatches.length >= historyLimit
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
    pullMatches
  });
})();
