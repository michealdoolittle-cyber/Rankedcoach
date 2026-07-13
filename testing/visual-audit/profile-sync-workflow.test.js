"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41790;
const puuid = "99999999-9999-4999-8999-999999999999";
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
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", null), 0);
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

function makeMatch(index) {
  return {
    metadata: {
      match_id: `profile-sync-${index}`,
      started_at: new Date(Date.now() - index * 60000).toISOString(),
      season: { id: "season-2026-a4", short: "e26a4" },
      map: { name: index === 0 ? "Breeze" : "Ascent" }
    },
    players: [{
      puuid,
      team_id: "Blue",
      agent: { id: "sova-id", name: index === 0 ? "Sova" : "Jett" },
      tier: { id: 19, name: "Diamond 2" },
      stats: { kills: 20, deaths: 14, assists: 7, score: 5200, damage: { dealt: 3400 }, headshots: 12, bodyshots: 28, legshots: 2 }
    }],
    teams: [{ team_id: "Blue", won: true, rounds: { won: 13, lost: 9 } }, { team_id: "Red", won: false, rounds: { won: 9, lost: 13 } }],
    rounds: [],
    kills: []
  };
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  let matchRequests = 0;
  const matchStarts = [];
  const consoleErrors = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", error => consoleErrors.push(error.message));
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await page.route("**/api/henrik/health", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, configured: true }) }));
    await page.route("**/api/henrik/account", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { puuid, name: "Workflow", tag: "TEST" } }) }));
    await page.route("**/api/henrik/mmr-history", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [{ match_id: "profile-sync-0", tier: { id: 19, name: "Diamond 2" }, rr: 64, last_change: 23, elo: 1664, date: new Date().toISOString() }] })
    }));
    await page.route("**/api/henrik/matches", async route => {
      const body = JSON.parse(route.request().postData() || "{}");
      if (!body.mode || body.mode === "competitive") matchRequests += 1;
      matchStarts.push({ start: body.start, mode: body.mode || "competitive" });
      await new Promise(resolve => setTimeout(resolve, 35));
      const data = body.start < 100
        ? Array.from({ length: Math.min(10, body.count || 10) }, (_item, offset) => makeMatch(body.start + offset))
        : [];
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data }) });
    });
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
    });

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) await page.click("#dailyWarmupSkip");
    await page.click("#profileAvatarWrap");
    await page.locator("#profileAddBtn").waitFor({ state: "visible" });
    await page.click("#profileAddBtn");
    await page.locator("#profileAddMenu.is-open").waitFor({ state: "visible" });
    assert.equal(await page.locator("#profileAddMenu").getAttribute("role"), "dialog");
    await page.fill("#profileAddName", "Workflow Test");
    await page.fill("#profileAddRiotId", "Workflow#TEST");
    await page.selectOption("#profileAddRegion", "NA");
    await page.click(".profile-add-submit");
    await page.locator("#appLoadingVeil.is-visible").waitFor({ state: "visible" });
    assert.match(await page.locator("#appLoadingCopy").innerText(), /Riot account|competitive history/i);
    await page.waitForFunction(() => document.getElementById("appLoadingVeil")?.getAttribute("aria-hidden") === "true", null, { timeout: 30000 });

    const state = await page.evaluate(() => {
      const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
      const profile = profiles.find(item => item.name === "Workflow Test");
      const logs = JSON.parse(localStorage.getItem("valtracker_log_entries_v2:guest") || "[]");
      const latestLog = logs.find(entry => entry.matchId === "profile-sync-0");
      return {
        profile: profile && { matchCount: profile.matches.length, cursor: profile.henrikHistoryCursor, complete: Boolean(profile.henrikHistoryBackfillCompleteAt), dailySync: profile.lastDailyProfileSyncDate },
        latestLog: latestLog && { rr: latestLog.rr, agent: latestLog.agent, map: latestLog.map },
        formAgent: document.getElementById("logAgentDisplay")?.textContent?.trim(),
        formMap: document.getElementById("logMap")?.value
      };
    });
    assert.deepEqual(state.profile && { matchCount: state.profile.matchCount, cursor: state.profile.cursor, complete: state.profile.complete }, { matchCount: 100, cursor: 100, complete: true }, JSON.stringify(matchStarts));
    assert.ok(state.profile.dailySync);
    assert.deepEqual(state.latestLog, { rr: 23, agent: "Sova", map: "Breeze" });
    assert.match(state.formAgent || "", /Sova/i);
    assert.equal(state.formMap, "Breeze");
    assert.equal(matchRequests, 11);
    assert.deepEqual(consoleErrors, []);
    fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
    if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) await page.click("#dailyWarmupSkip");
    await page.click('.nav-btn[data-page="logging"]');
    await page.locator("#page-logging.active").waitFor({ state: "visible" });
    await page.selectOption("#logFocusSelect", "Information Gathering", { force: true });
    await page.waitForFunction(() => document.getElementById("logFocusCustomValue")?.textContent?.trim() === "Information Gathering");
    const focusFit = await page.locator("#logFocusCustomTrigger").evaluate(trigger => ({ clientWidth: trigger.clientWidth, scrollWidth: trigger.scrollWidth }));
    assert.ok(focusFit.scrollWidth <= focusFit.clientWidth + 1, JSON.stringify(focusFit));
    await page.locator("#page-logging .logging-form").screenshot({ path: path.join(__dirname, "tmp", "profile-sync-prefill.png") });
    await page.click('.nav-btn[data-page="stats"]');
    const statsPlacement = await page.locator(".stats-proof-card").evaluate(card => {
      const rank = card.querySelector(".stats-proof-rank-row").getBoundingClientRect();
      const selector = card.querySelector(".stats-summary-selector-bottom").getBoundingClientRect();
      return { rankBottom: rank.bottom, selectorTop: selector.top, cardRight: card.getBoundingClientRect().right, selectorRight: selector.right };
    });
    assert.ok(statsPlacement.selectorTop >= statsPlacement.rankBottom - 1, JSON.stringify(statsPlacement));
    assert.ok(Math.abs(statsPlacement.cardRight - statsPlacement.selectorRight) <= 24, JSON.stringify(statsPlacement));
    console.log("Profile sync workflow passed: compact add menu, loading screen, full retained backfill, verified RR placeholder, and latest-game form prefill.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
