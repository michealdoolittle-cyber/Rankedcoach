import {
  onRequestGet as getRiotHealth,
  onRequestOptions as optionsRiotHealth
} from "../functions/api/riot/health.js";
import {
  onRequestOptions as optionsRiotImport,
  onRequestPost as postRiotImport
} from "../functions/api/riot/import-matches.js";
import {
  onRequestGet as getDemoImport,
  onRequestOptions as optionsDemoImport
} from "../functions/api/demo/import-example.js";
import {
  onRequestGet as getOverlaySnapshot,
  onRequestOptions as optionsOverlaySnapshot,
  onRequestPost as postOverlaySnapshot
} from "../functions/api/dev/overlay-snapshot.js";
import {
  onRequestGet as getThemeSnapshot,
  onRequestOptions as optionsThemeSnapshot,
  onRequestPost as postThemeSnapshot
} from "../functions/api/dev/theme-snapshot.js";
import {
  onRequestGet as getHenrikHealth,
  onRequestOptions as optionsHenrikHealth
} from "../functions/api/henrik/health.js";
import {
  onRequestOptions as optionsHenrikAccount,
  onRequestPost as postHenrikAccount
} from "../functions/api/henrik/account.js";
import {
  onRequestOptions as optionsHenrikMatches,
  onRequestPost as postHenrikMatches
} from "../functions/api/henrik/matches.js";
import {
  onRequestOptions as optionsHenrikMmrHistory,
  onRequestPost as postHenrikMmrHistory
} from "../functions/api/henrik/mmr-history.js";
import {
  onRequestOptions as optionsHenrikLiveMmrHistory,
  onRequestPost as postHenrikLiveMmrHistory
} from "../functions/api/henrik/mmr-history-live.js";
import {
  onRequestOptions as optionsHenrikRaw,
  onRequestPost as postHenrikRaw
} from "../functions/api/henrik/raw.js";
import {
  handlePlaylistRequest,
  handleSkinMediaRequest,
  runPatchContentAutomation
} from "./content-automation.mjs";

const API_ROUTES = new Map([
  ["GET /api/riot/health", getRiotHealth],
  ["OPTIONS /api/riot/health", optionsRiotHealth],
  ["POST /api/riot/import-matches", postRiotImport],
  ["OPTIONS /api/riot/import-matches", optionsRiotImport],
  ["GET /api/demo/import-example", getDemoImport],
  ["OPTIONS /api/demo/import-example", optionsDemoImport],
  ["GET /api/dev/overlay-snapshot", getOverlaySnapshot],
  ["POST /api/dev/overlay-snapshot", postOverlaySnapshot],
  ["OPTIONS /api/dev/overlay-snapshot", optionsOverlaySnapshot],
  ["GET /api/dev/theme-snapshot", getThemeSnapshot],
  ["POST /api/dev/theme-snapshot", postThemeSnapshot],
  ["OPTIONS /api/dev/theme-snapshot", optionsThemeSnapshot],
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
    if (request.method !== "GET") {
      return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    }
    return jsonResponse({ ok: true, runtime: "cloudflare-worker" });
  }

  if (url.pathname.startsWith("/api/henrik/") && request.method === "POST") {
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) {
      return jsonResponse({ error: "Cross-origin Henrik requests are not allowed." }, { status: 403 });
    }
  }

  if (url.pathname === "/api/content/playlist") {
    if (request.method !== "GET") return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    try {
      return jsonResponse(await handlePlaylistRequest(env));
    } catch (error) {
      console.error("Playlist content request failed", error);
      return jsonResponse({ error: "Featured playlist is temporarily unavailable." }, { status: 502 });
    }
  }

  if (url.pathname === "/api/content/skin-media") {
    if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, { status: 405 });
    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) return jsonResponse({ error: "Cross-origin content requests are not allowed." }, { status: 403 });
    try {
      return jsonResponse(await handleSkinMediaRequest(request, env));
    } catch (error) {
      console.error("Skin media request failed", error);
      return jsonResponse({ error: "Skin media lookup is temporarily unavailable." }, { status: 502 });
    }
  }

  const handler = API_ROUTES.get(`${request.method} ${url.pathname}`);
  if (!handler) {
    return jsonResponse({ error: "API route not found" }, { status: 404 });
  }

  try {
    return await handler(createPagesContext(request, env, executionContext));
  } catch (error) {
    console.error("API route failed", request.method, url.pathname, error);
    return jsonResponse({ error: "API request failed" }, { status: 500 });
  }
}

export default {
  async fetch(request, env, executionContext) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(request, env, executionContext);
    }
    return env.ASSETS.fetch(request);
  },

  scheduled(_controller, env, executionContext) {
    executionContext.waitUntil(runPatchContentAutomation(env));
  }
};
