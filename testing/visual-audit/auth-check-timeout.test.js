"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41803;
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function json(response, payload = {}) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/api/content/playlist") return json(response, { items: [], videos: [], matches: {} });
      if (url === "/api/content/knowledge") return json(response, { items: [], matches: {} });
      if (url === "/api/content/patch-notes") return json(response, {
        title: "VALORANT Patch Notes 13.02",
        label: "Patch 13.02",
        effectiveDate: "2026-07-28T13:00:00.000Z",
        sourceUrl: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-02/",
        bullets: ["Auth timeout regression fixture."],
        sections: []
      });
      if (url === "/api/content/player-cards") return json(response, { data: [] });
      if (url === "/api/content/skin-media") return json(response, { matches: {} });
      if (url === "/favicon.ico") {
        response.writeHead(204);
        response.end();
        return;
      }
      if (url === "/") url = "/index.html";
      const file = path.join(root, url);
      if (!file.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub(mode = "fast") {
  const hanging = mode === "hanging";
  return `
    globalThis.__authTimeoutCalls = [];
    globalThis.__authCallStacks = [];
    globalThis.__authFetches = [];
    globalThis.__authAbortEvents = [];
    globalThis.__authPendingFetches = 0;
    const __rankedCoachNativeFetch = globalThis.fetch.bind(globalThis);
    globalThis.fetch = (input, init = {}) => {
      const url = String(typeof input === "string" ? input : input?.url || input || "");
      if (url.includes("jqrsjaaxtdxfmpbtrupj.supabase.co/auth/v1/")) {
        globalThis.__authFetches.push({ url, hasSignal: Boolean(init?.signal), aborted: Boolean(init?.signal?.aborted) });
        globalThis.__authPendingFetches += 1;
        return new Promise((resolve, reject) => {
          const finishAbort = () => {
            globalThis.__authPendingFetches = Math.max(0, globalThis.__authPendingFetches - 1);
            globalThis.__authAbortEvents.push({ url, name: init?.signal?.reason?.name || "AbortError" });
            reject(new DOMException("Aborted", "AbortError"));
          };
          if (init?.signal?.aborted) {
            finishAbort();
            return;
          }
          init?.signal?.addEventListener("abort", finishAbort, { once: true });
        });
      }
      return __rankedCoachNativeFetch(input, init);
    };
    globalThis.supabase = {
      createClient(_url, _key, options = {}) {
        const quick = value => Promise.resolve(value);
        const empty = { data: null, error: null };
        const authFetch = options?.global?.fetch || globalThis.fetch;
        const hangingAuthRead = (kind) => authFetch("https://jqrsjaaxtdxfmpbtrupj.supabase.co/auth/v1/" + kind)
          .then(() => ({ data: {}, error: null }));
        function query(table) {
          return {
            table,
            select() { return this; },
            eq() { return this; },
            order() { return this; },
            maybeSingle() { return quick(empty); },
            upsert(payload) {
              return quick({ data: payload, error: null });
            },
            then(resolve) { return quick({ data: [], error: null }).then(resolve); }
          };
        }
        return {
          auth: {
            getSession() {
              globalThis.__authTimeoutCalls.push("getSession");
              globalThis.__authCallStacks.push({ call: "getSession", stack: new Error().stack });
              return ${hanging ? "hangingAuthRead('token')" : "quick({ data: { session: null }, error: null })"};
            },
            getUser() {
              globalThis.__authTimeoutCalls.push("getUser");
              globalThis.__authCallStacks.push({ call: "getUser", stack: new Error().stack });
              return ${hanging ? "hangingAuthRead('user')" : "quick({ data: { user: null }, error: null })"};
            },
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", { user: null }), 0);
              return { data: { subscription: { unsubscribe() {} } } };
            },
            signOut: async () => ({ error: null }),
            mfa: {
              listFactors: async () => ({ data: { all: [] }, error: null }),
              getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null })
            }
          },
          from: query,
          functions: { invoke: async () => ({ data: null, error: null }) }
        };
      }
    };
  `;
}

async function openWithAuthMode(browser, mode, options = {}) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", error => errors.push(error.message));
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
    contentType: "text/javascript",
    body: supabaseStub(mode)
  }));
  await page.addInitScript(({ cachedUser }) => {
    localStorage.clear();
    window.RANKEDCOACH_AUTH_INIT_TIMEOUT_MS = 120;
    window.RANKEDCOACH_AUTH_ACTION_TIMEOUT_MS = 180;
    if (cachedUser) {
      localStorage.setItem("valtracker_entry_choice_v1", "auth");
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: "cached-profile",
        name: "Cached Profile",
        accountName: "Cached Captain",
        riotId: "Cached#NA",
        region: "NA",
        startingRR: 0,
        matches: []
      }]));
      localStorage.setItem("valtracker_active_profile_id", "cached-profile");
      localStorage.setItem("valtracker_log_entries_v2:cached-user-1", JSON.stringify([{
        id: "cached-log-1",
        profileId: "cached-profile",
        agent: "Jett",
        focus: "Movement",
        notes: "Local cached log survives auth outage.",
        createdAt: "2026-08-03T12:00:00.000Z"
      }]));
      localStorage.setItem("sb-jqrsjaaxtdxfmpbtrupj-auth-token", JSON.stringify({
        access_token: "cached-access-token",
        refresh_token: "cached-refresh-token",
        expires_at: 4099680000,
        user: {
          id: "cached-user-1",
          email: "cached@example.com",
          user_metadata: { account_name: "Cached Captain" },
          app_metadata: {}
        }
      }));
    }
  }, { cachedUser: options.cachedUser === true });
  const startedAt = Date.now();
  await page.goto(`http://127.0.0.1:${port}/?auth-timeout=${mode}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(({ cachedUser }) => {
    const overlay = document.getElementById("loginInitOverlay");
    const modal = document.getElementById("authModal");
    const overlayHidden = !overlay
      || overlay.getAttribute("aria-hidden") === "true"
      || !overlay.classList.contains("active");
    if (!overlayHidden) return false;
    if (cachedUser) {
      return globalThis.RankedCoachAuthBridge?.getUser?.()?.id === "cached-user-1"
        && !modal?.classList.contains("active");
    }
    return Boolean(modal?.classList.contains("active"));
  }, { cachedUser: options.cachedUser === true }, { timeout: 5000 });
  await page.waitForFunction(() => (globalThis.__authPendingFetches || 0) === 0, null, { timeout: 1500 }).catch(() => {});
  const result = await page.evaluate(() => ({
    authCalls: globalThis.__authTimeoutCalls || [],
    authCallStacks: globalThis.__authCallStacks || [],
    authFetches: globalThis.__authFetches || [],
    authAbortEvents: globalThis.__authAbortEvents || [],
    authPendingFetches: globalThis.__authPendingFetches || 0,
    currentUserId: globalThis.RankedCoachAuthBridge?.getUser?.()?.id || "",
    overlayHidden: (() => {
      const overlay = document.getElementById("loginInitOverlay");
      return !overlay || overlay.getAttribute("aria-hidden") === "true" || !overlay.classList.contains("active");
    })(),
    authModalActive: document.getElementById("authModal")?.classList.contains("active") === true,
    profileText: document.body.textContent?.replace(/\s+/g, " ").trim() || "",
    toastText: document.getElementById("appToastStack")?.textContent?.replace(/\s+/g, " ").trim() || ""
  }));
  return { page, result, errors, elapsedMs: Date.now() - startedAt };
}

async function run() {
  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.equal(/await\s+supabaseClient\.auth\.get(?:User|Session)\(/.test(appSource), false, "startup auth checks should use the timeout wrapper");

  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const hanging = await openWithAuthMode(browser, "hanging");
    assert.equal(hanging.result.authModalActive, true);
    assert.equal(hanging.result.overlayHidden, true);
    assert.match(hanging.result.toastText, /trouble reaching your account/i);
    assert.ok(hanging.result.authFetches.length >= 1, "hanging auth should attempt a real auth fetch before entering local fallback");
    assert.ok(hanging.result.authFetches.every(fetch => fetch.hasSignal), "auth fetches should receive abort signals");
    assert.ok(hanging.result.authAbortEvents.length >= 1, "timed-out auth fetches should be aborted");
    assert.equal(hanging.result.authPendingFetches, 0, "aborted auth fetches should not stay pending");
    assert.ok(hanging.elapsedMs < 5000, `hanging auth should not stall startup: ${hanging.elapsedMs}ms`);
    assert.deepEqual(hanging.errors, []);
    await hanging.page.close();

    const cached = await openWithAuthMode(browser, "hanging", { cachedUser: true });
    assert.equal(cached.result.overlayHidden, true);
    assert.equal(cached.result.authModalActive, false);
    assert.equal(cached.result.currentUserId, "cached-user-1");
    assert.match(cached.result.profileText, /Cached Captain|Cached Profile/i);
    assert.match(cached.result.toastText, /saved local data/i);
    assert.ok(cached.result.authAbortEvents.length >= 1, "cached outage path should still abort timed-out auth fetches");
    assert.equal(cached.result.authPendingFetches, 0, "cached outage path should leave no zombie auth fetches");
    assert.ok(cached.elapsedMs < 5000, `cached auth fallback should become usable quickly: ${cached.elapsedMs}ms`);
    assert.deepEqual(cached.errors, []);
    await cached.page.close();

    const fast = await openWithAuthMode(browser, "fast");
    assert.equal(fast.result.authModalActive, true);
    assert.equal(fast.result.overlayHidden, true);
    assert.equal(/trouble reaching your account/i.test(fast.result.toastText), false);
    assert.equal(fast.result.authFetches.length, 0, "fast fake auth should not use hanging auth fetches");
    assert.ok(fast.elapsedMs < 5000, `fast auth path should stay responsive: ${fast.elapsedMs}ms`);
    assert.deepEqual(fast.errors, []);
    await fast.page.close();
    console.log("Auth timeout regression passed: timed-out auth fetches abort, cached signed-in users stay local-first, new browsers stay usable, and fast auth remains clean.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
