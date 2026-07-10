const HENRIK_API_ORIGIN = "https://api.henrikdev.xyz";
const VALID_REGIONS = new Set(["na", "latam", "br", "eu", "ap", "kr"]);
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

class HenrikApiError extends Error {
  constructor(message, status = 502, code = "henrik_request_failed") {
    super(message);
    this.name = "HenrikApiError";
    this.status = status;
    this.code = code;
  }
}

function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(JSON.stringify(payload), { ...init, headers });
}

function normalizeRegion(value = "na") {
  const region = String(value || "na").trim().toLowerCase();
  if (!VALID_REGIONS.has(region)) {
    throw new HenrikApiError("Unsupported Valorant region.", 400, "invalid_region");
  }
  return region;
}

function parseRiotId(value = "") {
  const riotId = String(value || "").trim();
  const separator = riotId.lastIndexOf("#");
  const name = separator > 0 ? riotId.slice(0, separator).trim() : "";
  const tag = separator > 0 ? riotId.slice(separator + 1).trim() : "";
  if (!name || !tag || name.length > 32 || tag.length > 16) {
    throw new HenrikApiError("Enter a Riot ID in Name#Tag format.", 400, "invalid_riot_id");
  }
  return { name, tag, riotId: `${name}#${tag}` };
}

function requireUuid(value, label) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!UUID_PATTERN.test(normalized)) {
    throw new HenrikApiError(`Invalid ${label}.`, 400, `invalid_${label.replace(/\s+/g, "_")}`);
  }
  return normalized;
}

function requireApiKey(env = {}) {
  const apiKey = String(env.HENRIKDEV_API_KEY || "").trim();
  if (!apiKey) {
    throw new HenrikApiError("Henrik match sync is not configured yet.", 503, "henrik_not_configured");
  }
  return apiKey;
}

async function readHenrikPayload(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new HenrikApiError("Henrik returned an unreadable response.", 502, "invalid_henrik_response");
  }
}

function mapUpstreamStatus(status = 500) {
  if ([400, 403, 404, 408, 429, 503].includes(status)) return status;
  return status >= 400 && status < 500 ? 400 : 502;
}

async function henrikFetch(apiKey, pathname, options = {}) {
  const response = await fetch(`${HENRIK_API_ORIGIN}${pathname}`, {
    method: options.method || "GET",
    headers: {
      Accept: "application/json",
      Authorization: apiKey,
      ...(options.body ? { "Content-Type": "application/json" } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(options.timeoutMs || 30000)
  }).catch(error => {
    if (error?.name === "TimeoutError") {
      throw new HenrikApiError("Henrik timed out while loading match data.", 504, "henrik_timeout");
    }
    throw new HenrikApiError("Henrik could not be reached.", 502, "henrik_unavailable");
  });

  const payload = await readHenrikPayload(response);
  if (!response.ok) {
    const upstreamMessage = String(payload?.errors?.[0]?.message || payload?.message || payload?.error || "").trim();
    throw new HenrikApiError(
      upstreamMessage || "Henrik could not complete the request.",
      mapUpstreamStatus(response.status),
      `henrik_${response.status}`
    );
  }
  return payload;
}

async function getHenrikAccount(env, riotId) {
  const apiKey = requireApiKey(env);
  const { name, tag } = parseRiotId(riotId);
  return henrikFetch(
    apiKey,
    `/valorant/v2/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`
  );
}

async function getHenrikMatches(env, options = {}) {
  const apiKey = requireApiKey(env);
  const puuid = requireUuid(options.puuid, "puuid");
  const region = normalizeRegion(options.region);
  const count = Math.min(10, Math.max(1, Number(options.count) || 5));
  return henrikFetch(
    apiKey,
    `/valorant/v3/by-puuid/matches/${region}/${encodeURIComponent(puuid)}?mode=competitive&size=${count}`
  );
}

async function getHenrikRawMatch(env, options = {}) {
  const apiKey = requireApiKey(env);
  const matchId = requireUuid(options.matchId, "match id");
  const region = normalizeRegion(options.region);
  return henrikFetch(apiKey, "/valorant/v1/raw", {
    method: "POST",
    body: { type: "matchdetails", value: matchId, region },
    timeoutMs: 45000
  });
}

function henrikErrorResponse(error) {
  const status = Number(error?.status) || 500;
  return jsonResponse(
    {
      ok: false,
      error: error?.message || "Henrik match sync failed.",
      code: error?.code || "henrik_request_failed"
    },
    { status }
  );
}

function optionsResponse() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export {
  HenrikApiError,
  getHenrikAccount,
  getHenrikMatches,
  getHenrikRawMatch,
  henrikErrorResponse,
  jsonResponse,
  optionsResponse,
  parseRiotId,
  requireApiKey
};
