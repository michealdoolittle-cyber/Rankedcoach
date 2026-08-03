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
      if (url === "/api/content/playlist") {
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify({ patchLabel: "13.01", patchTag: "", newThisWeek: 0, items: [] }));
      }
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
    const rankedCoachProfileSyncUser = {
      id: "profile-sync-user",
      email: "profile-sync@example.com",
      user_metadata: { account_name: "ProfileSync" },
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
            getSession: async () => ({ data: { session: { user: rankedCoachProfileSyncUser } }, error: null }),
            getUser: async () => ({ data: { user: rankedCoachProfileSyncUser }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", { user: rankedCoachProfileSyncUser }), 0);
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
  const localNoon = new Date();
  localNoon.setHours(12, 0, 0, 0);
  return {
    metadata: {
      match_id: `profile-sync-${index}`,
      started_at: new Date(localNoon.getTime() - index * 60000).toISOString(),
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
  const failedResponses = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", error => consoleErrors.push(error.message));
    page.on("response", response => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await page.route("**/api/henrik/health", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, configured: true }) }));
    await page.route("**/api/henrik/account", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { puuid, name: "Workflow", tag: "TEST" } }) }));
    await page.route("**/api/henrik/mmr-history-live", route => route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [{ account: { puuid }, history: [{ match_id: "profile-sync-0", tier: { id: 19, name: "Diamond 2" }, rr: 66, last_change: 25, elo: 1666, date: new Date().toISOString() }] }] })
    }));
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
      localStorage.setItem("valtracker_entry_choice_v1", "auth");
    });

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    assert.match(await page.locator("#loginInitProgressPercent").textContent(), /^\d+%$/);
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
    assert.match(await page.locator("#appLoadingCopy").innerText(), /^“.+”$/);
    assert.match(await page.locator("#appLoadingSource").innerText(), /^—\s+\S+/);
    assert.match(await page.locator("#appLoadingTitle").innerText(), /Building your profile/i);
    assert.equal(await page.locator("#appLoadingProgress").getAttribute("role"), "progressbar");
    assert.match(await page.locator("#appLoadingPercent").innerText(), /^\d+%$/);
    await page.waitForFunction(() => Number.parseInt(document.getElementById("appLoadingPercent")?.textContent || "0", 10) >= 18);
    const loadingProgress = await page.locator("#appLoadingProgress").evaluate(progress => ({
      value: Number(progress.getAttribute("aria-valuenow")),
      fillWidth: progress.querySelector("#appLoadingProgressBar")?.getBoundingClientRect().width || 0,
      trackWidth: progress.getBoundingClientRect().width
    }));
    assert.ok(loadingProgress.value >= 18 && loadingProgress.value <= 100 && loadingProgress.fillWidth > 0 && loadingProgress.fillWidth <= loadingProgress.trackWidth, JSON.stringify(loadingProgress));
    assert.ok(Math.abs(loadingProgress.fillWidth - (loadingProgress.trackWidth * loadingProgress.value / 100)) <= 2, JSON.stringify(loadingProgress));
    fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, "tmp", "profile-first-sync-progress.png"), fullPage: true });
    await page.waitForFunction(() => document.getElementById("appLoadingVeil")?.getAttribute("aria-hidden") === "true", null, { timeout: 30000 });
    assert.equal((await page.locator("#appLoadingPercent").textContent()).trim(), "100%");
    assert.equal(await page.locator("#appLoadingProgress").getAttribute("aria-valuenow"), "100");

    const state = await page.evaluate(() => {
      const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
      const profile = profiles.find(item => item.name === "Workflow Test");
      const logKey = Object.keys(localStorage)
        .filter(key => key.startsWith("valtracker_log_entries_v2:"))
        .find(key => key !== "valtracker_log_entries_v2:guest") || "valtracker_log_entries_v2:guest";
      const logs = JSON.parse(localStorage.getItem(logKey) || "[]");
      const latestLog = logs.find(entry => entry.matchId === "profile-sync-0");
      return {
        logKey,
        profile: profile && { matchCount: profile.matches.length, cursor: profile.henrikHistoryCursor, complete: Boolean(profile.henrikHistoryBackfillCompleteAt), dailySync: profile.lastDailyProfileSyncDate },
        latestLog: latestLog && { rr: latestLog.rr, agent: latestLog.agent, map: latestLog.map },
        formAgent: document.getElementById("logAgentDisplay")?.textContent?.trim(),
        formMap: document.getElementById("logMap")?.value
      };
    });
    assert.deepEqual(state.profile && { matchCount: state.profile.matchCount, cursor: state.profile.cursor, complete: state.profile.complete }, { matchCount: 100, cursor: 100, complete: true }, JSON.stringify(matchStarts));
    assert.ok(state.profile.dailySync);
    assert.deepEqual(state.latestLog, { rr: 25, agent: "Sova", map: "Breeze" });
    assert.match(state.formAgent || "", /Sova/i);
    assert.equal(state.formMap, "Breeze");
    assert.equal(matchRequests, 11);
    assert.deepEqual(consoleErrors, [], JSON.stringify(failedResponses));
    if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) await page.click("#dailyWarmupSkip");
    await page.click('.nav-btn[data-page="home"]');
    await page.waitForFunction(() => document.getElementById("totalGames")?.textContent?.trim() === "100");
    const homeData = await page.evaluate(() => ({
      wins: document.getElementById("winsCount")?.textContent?.trim(),
      losses: document.getElementById("lossCount")?.textContent?.trim(),
      games: document.getElementById("totalGames")?.textContent?.trim(),
      impact: document.getElementById("impactScoreLabel")?.textContent?.trim(),
      timeline: [...document.querySelectorAll("#timelineGrid .timeline-pill")].map(item => item.textContent.trim()),
      chartStatus: document.getElementById("rrChartDataStatus")?.textContent?.trim(),
      latestDot: Boolean(document.querySelector('.rr-hit[data-match-id="profile-sync-0"]'))
    }));
    assert.deepEqual({ wins: homeData.wins, losses: homeData.losses, games: homeData.games }, { wins: "100", losses: "0", games: "100" });
    assert.match(homeData.impact || "", /^(?:\d+|--)%$/);
    assert.equal(homeData.timeline.some(item => /Loading\.\.\./i.test(item)), false, JSON.stringify(homeData.timeline));
    assert.match(homeData.chartStatus || "", /1 of 100 retained matches have verified RR snapshots/i);
    assert.equal(homeData.latestDot, true);
    assert.equal(await page.locator('.rr-hit[data-match-id="profile-sync-0"]').getAttribute("data-match-id"), "profile-sync-0");
    fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
    if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) await page.click("#dailyWarmupSkip");
    await page.click('.nav-btn[data-page="logging"]');
    await page.locator("#page-logging.active").waitFor({ state: "visible" });
    await page.selectOption("#logFocusSelect", "Map Awareness", { force: true });
    await page.waitForFunction(() => document.getElementById("logFocusCustomValue")?.textContent?.trim() === "Map Awareness");
    const focusFit = await page.locator("#logFocusCustomTrigger").evaluate(trigger => ({ clientWidth: trigger.clientWidth, scrollWidth: trigger.scrollWidth }));
    assert.ok(focusFit.scrollWidth <= focusFit.clientWidth + 1, JSON.stringify(focusFit));
    await page.locator("#page-logging .logging-form").screenshot({ path: path.join(__dirname, "tmp", "profile-sync-prefill.png") });
    await page.click('.nav-btn[data-page="stats"]');
    await page.waitForTimeout(700);
    const peakCard = page.locator("#statsActSelector").locator("xpath=ancestor::div[contains(@class,'stats-proof-card')]");
    await peakCard.screenshot({ path: path.join(__dirname, "tmp", "peak-progress-desktop.png") });
    const statsPlacement = await peakCard.evaluate(card => {
      const rank = card.querySelector(".stats-proof-rank-row").getBoundingClientRect();
      const selectorElement = card.querySelector(".stats-summary-selector-bottom");
      const selector = selectorElement.getBoundingClientRect();
      const layout = card.querySelector(".stats-peak-layout").getBoundingClientRect();
      const bounds = card.getBoundingClientRect();
      const selectorStyle = getComputedStyle(selectorElement);
      const mainGrid = document.querySelector("#page-stats .stats-main-grid").getBoundingClientRect();
      return { rankBottom: rank.bottom, rankRight: rank.right, selectorTop: selector.top, selectorLeft: selector.left, selectorHeight: selector.height, selectorDisplay: selectorStyle.display, selectorVisibility: selectorStyle.visibility, selectorOpacity: selectorStyle.opacity, cardTop: bounds.top, cardBottom: bounds.bottom, layoutTop: layout.top, layoutBottom: layout.bottom, cardRight: bounds.right, selectorRight: selector.right, mainGridTop: mainGrid.top };
    });
    assert.ok(statsPlacement.selectorLeft >= statsPlacement.rankRight - 1 || statsPlacement.selectorTop >= statsPlacement.rankBottom - 1, JSON.stringify(statsPlacement));
    assert.ok(statsPlacement.selectorHeight >= 30 && statsPlacement.selectorTop < statsPlacement.cardBottom, JSON.stringify(statsPlacement));
    assert.equal(statsPlacement.selectorVisibility, "visible", JSON.stringify(statsPlacement));
    assert.notEqual(statsPlacement.selectorOpacity, "0", JSON.stringify(statsPlacement));
    assert.ok(statsPlacement.mainGridTop >= statsPlacement.cardBottom - 1, JSON.stringify(statsPlacement));
    assert.ok(Math.abs(statsPlacement.cardRight - statsPlacement.selectorRight) <= 24, JSON.stringify(statsPlacement));
    console.log("Profile sync workflow passed: retained backfill, verified RR, form prefill, scoreboard, impact, improvement timeline, and chart detail all use imported match data.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
