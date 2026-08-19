// RankedCoach Beta worker — serves beta.rankedcoach.gg only.
//
// Deliberately self-contained: this file does NOT import from or modify
// ../../worker/index.js (the production worker). It imports the same
// underlying API handler modules from ../../functions/api/* so the beta
// frontend runs against real, shared backend logic (Henrik sync, content
// automation) without duplicating that logic or touching production files.
//
// Deliberately excluded: no `scheduled()` export, no cron triggers in
// wrangler.beta.toml. The content-automation/knowledge-pipeline cron jobs
// already run on the production worker against the shared CONTENT_AUTOMATION
// KV namespace — running them a second time here would risk duplicate
// writes/generation runs against that same shared store.
import {
  onRequestGet as getHenrikHealth,
  onRequestOptions as optionsHenrikHealth
} from "../../functions/api/henrik/health.js";
import {
  onRequestOptions as optionsHenrikAccount,
  onRequestPost as postHenrikAccount
} from "../../functions/api/henrik/account.js";
import {
  onRequestOptions as optionsHenrikMatches,
  onRequestPost as postHenrikMatches
} from "../../functions/api/henrik/matches.js";
import {
  onRequestOptions as optionsHenrikMmrHistory,
  onRequestPost as postHenrikMmrHistory
} from "../../functions/api/henrik/mmr-history.js";
import {
  onRequestOptions as optionsHenrikLiveMmrHistory,
  onRequestPost as postHenrikLiveMmrHistory
} from "../../functions/api/henrik/mmr-history-live.js";
import {
  onRequestOptions as optionsHenrikRaw,
  onRequestPost as postHenrikRaw
} from "../../functions/api/henrik/raw.js";

const API_ROUTES = new Map([
  ["GET /api/henrik/health", getHenrikHealth],
  ["OPTIONS /api/henrik/health", optionsHenrikHealth],
  ["POST /api/henrik/account", postHenrikAccount],
  ["OPTIONS /api/henrik/account", optionsHenrikAccount],
  ["POST /api/henrik/matches", postHenrikMatches],
  ["OPTIONS /api/henrik/matches", optionsHenrikMatches],
  ["POST /api/henrik/mmr-history", postHenrikMmrHistory],
  ["OPTIONS /api/henrik/mmr-history", optionsHenrikMmrHistory],
  ["POST /api/henrik/mmr-history-live", postHenrikLiveMmrHistory],
  ["OPTIONS /api/henrik/mmr-history-live", optionsHenrikLiveMmrHistory],
  ["POST /api/henrik/raw", postHenrikRaw],
  ["OPTIONS /api/henrik/raw", optionsHenrikRaw]
]);

function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(payload), { ...init, headers });
}

function createPagesContext(request, env, executionContext) {
  return {
    request,
    env,
    params: {},
    data: {},
    waitUntil: executionContext.waitUntil.bind(executionContext),
    passThroughOnException: executionContext.passThroughOnException.bind(executionContext)
  };
}

async function handleApiRequest(request, env, executionContext) {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    if (request.method === "OPTIONS") return new Response(null, { status: 204 });
    if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    return jsonResponse({ ok: true, runtime: "cloudflare-worker", app: "rankedcoach-beta" });
  }

  if (url.pathname.startsWith("/api/henrik/") && request.method === "POST") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) {
      return jsonResponse({ error: "Cross-origin Henrik requests are not allowed." }, { status: 403 });
    }
  }

  const handler = API_ROUTES.get(`${request.method} ${url.pathname}`);
  if (!handler) {
    return jsonResponse({ error: "API route not found" }, { status: 404 });
  }

  try {
    return await handler(createPagesContext(request, env, executionContext));
  } catch (error) {
    console.error("Beta API route failed", request.method, url.pathname, error);
    return jsonResponse({ error: "API request failed" }, { status: 500 });
  }
}

export default {
  async fetch(request, env, executionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env, executionContext);
    }
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("Content-Type") || "";
    const isHtml = contentType.includes("text/html") || url.pathname === "/" || url.pathname.endsWith(".html");
    if (!isHtml) return response;
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store, max-age=0, must-revalidate");
    headers.set("Pragma", "no-cache");
    headers.set("Expires", "0");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
