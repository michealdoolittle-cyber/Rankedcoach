"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41789;
const puuid = "62a85dd7-1b17-4f45-9941-9fab4e32f820";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/") url = "/index.html";
      const file = path.join(root, url);
      if (!file.startsWith(root)) {
        response.writeHead(403);
        return response.end("Forbidden");
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          response.writeHead(404);
          return response.end("Not found");
        }
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `
    const rankedCoachRiotSyncUser = {
      id: "riot-sync-user",
      email: "riot-sync@example.com",
      user_metadata: { account_name: "RiotSync" },
      app_metadata: {}
    };
    globalThis.supabase = {
      createClient() {
        const query = {
          select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
          then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
          upsert: async () => ({ data: null, error: null }), insert: async () => ({ data: null, error: null }),
          update() { return this; }, delete() { return this; }
        };
        return {
          auth: {
            getSession: async () => ({ data: { session: { user: rankedCoachRiotSyncUser } }, error: null }),
            getUser: async () => ({ data: { user: rankedCoachRiotSyncUser }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", { user: rankedCoachRiotSyncUser }), 0);
              return { data: { subscription: { unsubscribe() {} } } };
            },
            signOut: async () => ({ error: null })
          },
          from() { return Object.create(query); },
          functions: { invoke: async () => ({ data: null, error: null }) }
        };
      }
    };
  `;
}

async function dismissWarmup(page) {
  await page.waitForTimeout(900);
  if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
    await page.click("#dailyWarmupSkip");
  }
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ args: ["--host-resolver-rules=MAP rankedcoach.test 127.0.0.1"] });
  let failureMode = true;
  let accountRequests = 0;
  let competitiveMatchRequests = 0;
  const dialogs = [];
  const consoleErrors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("dialog", async dialog => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", error => consoleErrors.push(error.message));
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await page.route("**/api/henrik/health", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, configured: true }) }));
    await page.route("**/api/henrik/account", route => {
      accountRequests += 1;
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { puuid, name: "Subroza", tag: "RULT" } }) });
    });
    await page.route("**/api/henrik/mmr-history-live", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(failureMode ? { ok: false, error: "Riot's data provider is busy right now. Try again shortly.", code: "henrik_429", status: 429, retryable: true } : { ok: true, data: [{ account: { puuid }, history: [] }] })
    }));
    await page.route("**/api/henrik/mmr-history", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(failureMode ? { ok: false, error: "Riot's data provider is busy right now. Try again shortly.", code: "henrik_429", status: 429, retryable: true } : { ok: true, data: [] })
    }));
    await page.route("**/api/henrik/matches", async route => {
      const body = JSON.parse(route.request().postData() || "{}");
      if (!body.mode || body.mode === "competitive") competitiveMatchRequests += 1;
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(failureMode
          ? { ok: false, error: "Riot's data provider is busy right now. Try again shortly.", code: "henrik_429", status: 429, retryable: true }
          : { ok: true, data: [] })
      });
    });
    await page.addInitScript(() => {
      const profile = {
        id: "riot-rate-limit-test",
        name: "Riot Sync Test",
        accountName: "Riot Sync Test",
        riotId: "Subroza#RULT",
        region: "NA",
        puuid: "",
        matches: [],
        henrikHistoryBackfillVersion: 2,
        henrikHistoryBackfillCompleteAt: "2026-07-13T00:00:00.000Z"
      };
      localStorage.setItem("valtracker_entry_choice_v1", "auth");
      localStorage.setItem("valtracker_active_profile_id", profile.id);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
    });

    await page.goto(`http://rankedcoach.test:${port}`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await page.locator("#profileSyncBtn").waitFor({ state: "visible" });
    const accountRequestsBeforeManualSync = accountRequests;
    const competitiveRequestsBeforeManualSync = competitiveMatchRequests;
    await page.click("#profileSyncBtn");
    const toast = page.locator(".app-toast.is-visible").filter({ hasText: "Riot's data provider is busy right now" });
    await toast.waitFor({ state: "visible", timeout: 12000 }).catch(async error => {
      const diagnostics = await page.evaluate(() => ({
        syncTitle: document.getElementById("profileSyncBtn")?.title || "",
        syncDisabled: Boolean(document.getElementById("profileSyncBtn")?.disabled),
        toasts: [...document.querySelectorAll(".app-toast")].map(item => item.textContent.trim()),
        profile: (() => {
          const profile = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0] || {};
          return { id: profile.id, riotId: profile.riotId, puuid: profile.puuid, matchCount: profile.matches?.length || 0, lastSyncErrorCode: profile.lastSyncErrorCode || "" };
        })()
      }));
      console.error(JSON.stringify({ accountRequests, competitiveMatchRequests, dialogs, consoleErrors, diagnostics }, null, 2));
      throw error;
    });
    const toastText = await toast.innerText();
    assert.match(toastText, /Riot sync paused.*try again in a minute/is);
    assert.doesNotMatch(toastText, /headers of the response|rate limit exceeded/i);
    fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
    await toast.screenshot({ path: path.join(__dirname, "tmp", "riot-sync-rate-limit-toast.png") });
    assert.deepEqual(dialogs, []);
    assert.equal(accountRequests, accountRequestsBeforeManualSync || 1);
    assert.equal(competitiveMatchRequests, competitiveRequestsBeforeManualSync + 3);
    assert.deepEqual(consoleErrors, []);

    const storedAfterFailure = await page.evaluate(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]);
    assert.equal(storedAfterFailure.puuid, puuid);
    assert.equal(storedAfterFailure.lastSyncErrorCode, "henrik_429");
    assert.ok(storedAfterFailure.lastSyncErrorAt);

    failureMode = false;
    const competitiveRequestsAfterFailure = competitiveMatchRequests;
    await dismissWarmup(page);
    await page.click("#profileSyncBtn");
    await page.waitForFunction(() => {
      const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
      return Boolean(profiles[0]?.lastSyncAt && !profiles[0]?.lastSyncErrorCode);
    }, null, { timeout: 12000 });
    await page.waitForTimeout(300);
    assert.equal(accountRequests, 1, "The saved PUUID should prevent a second account lookup.");
    assert.equal(competitiveMatchRequests, competitiveRequestsAfterFailure + 1);
    assert.ok(dialogs.some(message => /already up to date/i.test(message)), JSON.stringify(dialogs));

    console.log("Riot sync browser check passed: friendly toast, no raw alert, persisted PUUID, no repeated account lookup, and zero console errors.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
