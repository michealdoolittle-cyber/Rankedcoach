"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41794;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/") url = "/index.html";
      const file = path.join(root, url);
      if (!file.startsWith(root)) { response.writeHead(403); return response.end("Forbidden"); }
      fs.readFile(file, (error, data) => {
        if (error) { response.writeHead(404); return response.end("Not found"); }
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `globalThis.supabase={createClient(){const q={select(){return this},eq(){return this},order(){return this},limit(){return this},maybeSingle:async()=>({data:null,error:null}),then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};return{auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}}),onAuthStateChange(callback){setTimeout(()=>callback("INITIAL_SESSION",null),0);return{data:{subscription:{unsubscribe(){}}}}}},from(){return Object.create(q)}}}};`;
}

function rankedMatch(id, createdAt, act, rank, rr, delta) {
  return {
    id,
    matchId: id,
    source: "henrik_sync",
    createdAt,
    act,
    rank,
    rrTotal: rr,
    verifiedRrDelta: delta,
    rr: delta,
    rrVerified: true,
    result: delta >= 0 ? "win" : "loss",
    agent: "Sova",
    map: "Haven",
    metadata: { matchId: id, source: "henrik_sync", act, rank, rrVerified: true, playedAt: createdAt, result: delta >= 0 ? "win" : "loss", agent: "Sova", mapName: "Haven" },
    matchRecord: { rank: { rank, rr, rrDelta: delta, verified: true }, trackedPlayer: { competitiveTier: 18 }, act }
  };
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    const consoleErrors = [];
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", error => consoleErrors.push(error.message));
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await page.addInitScript(({ profile, logs }) => {
      localStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profile.id);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
      localStorage.setItem("valtracker_log_entries_v2:guest", JSON.stringify(logs));
    }, {
      profile: {
        id: "placement-profile",
        name: "Placement Player",
        accountName: "Placement Player",
        region: "NA",
        lastSyncSource: "henrik",
        importSource: "henrik",
        matches: [
          rankedMatch("old-act-ranked", "2026-06-30T12:00:00.000Z", "Season 2026 Act 3", "Diamond 2", 72, 18),
          {
            id: "new-act-placement",
            matchId: "new-act-placement",
            source: "henrik_sync",
            createdAt: "2026-07-01T12:00:00.000Z",
            act: "Season 2026 Act 4",
            rank: "Unrated",
            rr: null,
            rrTotal: null,
            rrVerified: false,
            isPlacementMatch: true,
            result: "win",
            agent: "Jett",
            map: "Breeze",
            metadata: { matchId: "new-act-placement", source: "henrik_sync", act: "Season 2026 Act 4", rank: "Unrated", rrVerified: false, isPlacementMatch: true, playedAt: "2026-07-01T12:00:00.000Z", result: "win", agent: "Jett", mapName: "Breeze" },
            matchRecord: { isPlacementMatch: true, rank: { rank: "Unrated", rr: null, rrDelta: null, verified: false }, trackedPlayer: { competitiveTier: 0 }, act: "Season 2026 Act 4" }
          },
          rankedMatch("new-act-ranked", "2026-07-02T12:00:00.000Z", "Season 2026 Act 4", "Diamond 1", 24, 17)
        ]
      },
      logs: [{
        id: "placement-log",
        matchId: "new-act-placement",
        profileId: "placement-profile",
        source: "henrik-match-placeholder",
        isMatchPlaceholder: true,
        isPlacementMatch: true,
        createdAt: new Date().toISOString(),
        result: "win",
        rr: null,
        agent: "Jett",
        map: "Breeze"
      }]
    });

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await page.locator("#dailyWarmupModal.active").waitFor({ state: "visible", timeout: 10000 });
    await page.click("#dailyWarmupSkip");
    await page.locator("#dailyWarmupModal").waitFor({ state: "hidden" });
    await page.click('.nav-btn[data-page="logging"]');
    await page.locator("#page-logging.active").waitFor({ state: "visible" });
    await page.locator(".log-result-rr-placement").waitFor({ state: "visible" });
    assert.equal(await page.locator(".log-result-rr-placement").innerText(), "Placements");
    assert.equal(await page.locator(".log-result-rr-unverified").count(), 0);

    await page.click('.nav-btn[data-page="home"]');
    if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) await page.click("#dailyWarmupSkip");
    await page.click('.graph-btn[data-size="all"]');
    await page.locator(".chart-season-boundary").first().waitFor({ state: "attached" });
    assert.equal(await page.locator(".chart-season-boundary").count(), 2);
    assert.match(await page.locator('.chart-season-boundary[data-season="Season 2026 Act 3"] text').textContent(), /V26\s*A3/is);
    assert.match(await page.locator('.chart-season-boundary[data-season="Season 2026 Act 4"] text').textContent(), /V26\s*A4/is);
    assert.equal(await page.locator('.chart-season-boundary[data-season="Season 2026 Act 4"]').count(), 1);
    assert.match(await page.locator("#rrChartDataStatus").innerText(), /rank snapshots/i);
    assert.deepEqual(consoleErrors, []);
    console.log("Placement UI passed: the feed distinguishes placements and Lifetime labels each season boundary without plotting Unrated as rank zero.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
