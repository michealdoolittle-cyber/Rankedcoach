"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41791;
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath.startsWith("/api/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {} }));
        return;
      }
      if (relativePath === "/") relativePath = "/index.html";
      const filePath = path.join(root, relativePath);
      if (!filePath.startsWith(root)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404).end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function seedProfile() {
  const profileId = "coaching-evidence-regression";
  const roleFixtures = [
    { agent: "Jett", role: "Duelist", map: "Ascent" },
    { agent: "Sova", role: "Initiator", map: "Haven" },
    { agent: "Omen", role: "Controller", map: "Bind" },
    { agent: "Chamber", role: "Sentinel", map: "Split" }
  ];
  const matches = Array.from({ length: 12 }, (_item, index) => {
    const playedAt = new Date(Date.now() - ((11 - index) * 86_400_000));
    playedAt.setHours(12, 0, 0, 0);
    const createdAt = playedAt.toISOString();
    return {
    id: `evidence-match-${index}`,
    matchId: `evidence-match-${index}`,
    source: "henrik_sync",
    rank: "Diamond 2",
    rrTotal: 40 + index,
    rrChange: index % 2 ? -14 : 18,
    result: index % 2 ? "loss" : "win",
    kills: 14 + (index % 5),
    deaths: 13 + (index % 4),
    assists: 4 + (index % 3),
    acs: 190 + index,
    agent: roleFixtures[index % roleFixtures.length].agent,
    role: roleFixtures[index % roleFixtures.length].role,
    map: roleFixtures[index % roleFixtures.length].map,
    act: "Season 2026 Act 4",
    createdAt,
    metadata: {
      source: "henrik_sync",
      rank: "Diamond 2",
      rrTotal: 40 + index,
      agent: roleFixtures[index % roleFixtures.length].agent,
      role: roleFixtures[index % roleFixtures.length].role,
      map: roleFixtures[index % roleFixtures.length].map,
      mapName: roleFixtures[index % roleFixtures.length].map,
      act: "Season 2026 Act 4",
      playedAt: createdAt
    }
  };
  });
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", profileId);
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
    id: profileId,
    name: "Evidence Test",
    riotId: "EvidenceTest#NA1",
    region: "NA",
    importSource: "henrik",
    lastSyncSource: "henrik",
    // This test exercises evidence modals; mark today's warm-up prompt as seen so
    // the asynchronous daily prompt cannot cover the pills under test mid-run.
    lastWarmupPromptDate: new Date().toISOString().slice(0, 10),
    matches,
    trackerAnalytics: { currentAct: "Season 2026 Act 4", acts: ["Season 2026 Act 4"] }
  }]));
  localStorage.setItem("valtracker_logs_v1", JSON.stringify(matches.slice(0, 6).map((match, index) => ({
    id: `evidence-log-${index}`,
    profileId,
    matchId: match.matchId,
    agent: match.agent,
    map: match.map,
    focusCategory: index % 2 ? "Movement" : "Crosshair Placement",
    selfRating: 3 + (index % 2),
    teamComms: 3,
    selfComms: 3,
    createdAt: match.createdAt
  }))));
}

async function dismissStartupUi(page) {
  await page.locator("#dailyWarmupSkip").click().catch(() => {});
  await page.evaluate(() => {
    window.RankedCoachDailyEntrance?.skipAll?.();
    ["authModal", "loginInitOverlay", "appLoadingVeil", "dailyWarmupModal"].forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;
      element.classList.remove("active", "open", "is-visible");
      element.hidden = true;
      element.style.setProperty("display", "none", "important");
    });
    document.documentElement.classList.remove("app-booting");
    document.body.classList.remove("profile-cleanup-active", "mobile-modal-open", "modal-open", "has-active-modal");
  });
}

async function verifyViewport(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const issues = [];
  page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
  page.on("console", message => {
    if (message.type() === "error") issues.push(`[console] ${message.text()}`);
  });
  await page.addInitScript(() => { globalThis.__RANKEDCOACH_TEST_HOOKS__ = true; });
  await page.addInitScript(seedProfile);
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("#weeklyFocusSummary .weekly-focus-pill:not(.is-disabled)"), null, { timeout: 15000 });
  await dismissStartupUi(page);

  const roleInterpretations = await page.evaluate(() => {
    const hook = globalThis.RankedCoachTestHooks?.getCoachingInterpretation;
    const roles = [
      ["Duelist", "Jett"],
      ["Initiator", "Sova"],
      ["Controller", "Omen"],
      ["Sentinel", "Chamber"]
    ].map(([role, agent]) => ({
      role,
      agent,
      result: hook?.({ role, agent, map: "Ascent", sampleSize: 6, kd: 1.1 })
    }));
    return {
      roles,
      equalEvidence: [
        hook?.({ matches: 8, winrate: 60, candidateType: "agent" })?.evidence?.score,
        hook?.({ matches: 8, winrate: 60, candidateType: "map" })?.evidence?.score,
        hook?.({ matches: 8, winrate: 60, candidateType: "role" })?.evidence?.score
      ],
      pairing: hook?.({ usage: 58, winRate: 64, unit: "rounds", subject: "Vandal" })?.pairing
    };
  });
  assert.match(roleInterpretations.roles[0]?.result?.fight?.read || "", /first contact/i);
  assert.match(roleInterpretations.roles[1]?.result?.fight?.read || "", /information first/i);
  assert.match(roleInterpretations.roles[2]?.result?.fight?.read || "", /utility to make the first fight easier/i);
  assert.match(roleInterpretations.roles[3]?.result?.fight?.read || "", /setup advantage/i);
  assert.deepEqual(roleInterpretations.equalEvidence, [60, 60, 60], JSON.stringify(roleInterpretations));
  assert.equal(roleInterpretations.pairing?.usageLabel, "Used in 58% of tracked rounds");
  assert.equal(roleInterpretations.pairing?.winRateLabel, "Won 64% of those rounds");

  await page.locator("#weeklyFocusSummary .weekly-focus-pill:not(.is-disabled)").first().click({ force: true });
  await page.locator("#weeklyFocusModal.active").waitFor({ state: "visible" });
  assert.match(await page.locator("#weeklyFocusModalContent .timeline-insight-card-title").first().innerText(), /^games used$/i);
  assert.equal(await page.locator("#weeklyFocusModalContent .coaching-games-used-list").count(), 1);
  await page.locator("#weeklyFocusModal").click({ position: { x: 2, y: 2 } });
  await page.locator("#weeklyFocusModal").waitFor({ state: "hidden" });

  await page.locator("#timelineGrid .timeline-pill:not(.is-loading):not(.is-disabled)").first().click({ force: true });
  await page.locator("#timelineStatsModal.active").waitFor({ state: "visible" });
  assert.match(await page.locator("#timelineStatsList .timeline-insight-card-title").nth(1).innerText(), /^games used$/i);
  assert.equal(await page.locator("#timelineStatsList .coaching-games-used-list").count(), 1);
  await page.locator("#timelineStatsModal").click({ position: { x: 2, y: 2 } });
  await page.locator("#timelineStatsModal").waitFor({ state: "hidden" });

  assert.deepEqual(issues, []);
  await context.close();
  return viewport;
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const viewports = [];
    viewports.push(await verifyViewport(browser, { width: 1366, height: 768 }));
    viewports.push(await verifyViewport(browser, { width: 390, height: 844 }));
    console.log(`Coaching evidence modals passed at ${viewports.map(viewport => `${viewport.width}x${viewport.height}`).join(" and ")}.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
