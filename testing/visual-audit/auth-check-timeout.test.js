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
    globalThis.supabase = {
      createClient() {
        const never = () => new Promise(() => {});
        const quick = value => Promise.resolve(value);
        const empty = { data: null, error: null };
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
              return ${hanging ? "never()" : "quick({ data: { session: null }, error: null })"};
            },
            getUser() {
              globalThis.__authTimeoutCalls.push("getUser");
              return ${hanging ? "never()" : "quick({ data: { user: null }, error: null })"};
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

async function openWithAuthMode(browser, mode) {
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
  await page.addInitScript(() => {
    localStorage.clear();
    window.RANKEDCOACH_AUTH_INIT_TIMEOUT_MS = 120;
    window.RANKEDCOACH_AUTH_ACTION_TIMEOUT_MS = 180;
  });
  const startedAt = Date.now();
  await page.goto(`http://127.0.0.1:${port}/?auth-timeout=${mode}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const overlay = document.getElementById("loginInitOverlay");
    const modal = document.getElementById("authModal");
    const overlayHidden = !overlay
      || overlay.getAttribute("aria-hidden") === "true"
      || !overlay.classList.contains("active");
    return overlayHidden && Boolean(modal?.classList.contains("active"));
  }, null, { timeout: 5000 });
  const result = await page.evaluate(() => ({
    authCalls: globalThis.__authTimeoutCalls || [],
    overlayHidden: (() => {
      const overlay = document.getElementById("loginInitOverlay");
      return !overlay || overlay.getAttribute("aria-hidden") === "true" || !overlay.classList.contains("active");
    })(),
    authModalActive: document.getElementById("authModal")?.classList.contains("active") === true,
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
    assert.ok(hanging.elapsedMs < 5000, `hanging auth should not stall startup: ${hanging.elapsedMs}ms`);
    assert.deepEqual(hanging.errors, []);
    await hanging.page.close();

    const fast = await openWithAuthMode(browser, "fast");
    assert.equal(fast.result.authModalActive, true);
    assert.equal(fast.result.overlayHidden, true);
    assert.equal(/trouble reaching your account/i.test(fast.result.toastText), false);
    assert.ok(fast.elapsedMs < 5000, `fast auth path should stay responsive: ${fast.elapsedMs}ms`);
    assert.deepEqual(fast.errors, []);
    await fast.page.close();
    console.log("Auth timeout regression passed: hanging startup auth degrades to usable local state, fast auth remains clean, and visible timeout messaging appears.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
