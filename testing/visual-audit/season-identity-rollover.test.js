"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41831;
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath.startsWith("/api/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {}, data: [] }));
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
        response.writeHead(200, { "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function seedSeasonRolloverProfile() {
  const makeMatch = ({
    id,
    agent,
    role,
    result,
    season,
    playedAt,
    source = "henrik_sync",
    isPlacementMatch = false
  }) => ({
    id,
    matchId: id,
    source,
    createdAt: playedAt,
    playedAt,
    season,
    act: "Season 2099 Act 1",
    agent,
    role,
    map: "Lotus",
    result,
    kills: result === "win" ? 18 : 8,
    deaths: result === "win" ? 8 : 18,
    assists: 5,
    acs: result === "win" ? 240 : 120,
    adr: result === "win" ? 155 : 90,
    hsPercent: 25,
    queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
    isPlacementMatch,
    rr: isPlacementMatch ? null : (result === "win" ? 18 : -16),
    verifiedRrDelta: isPlacementMatch ? null : (result === "win" ? 18 : -16),
    rrVerified: !isPlacementMatch,
    metadata: {
      matchId: id,
      source,
      playedAt,
      season,
      act: "Season 2099 Act 1",
      agent,
      mapName: "Lotus",
      result,
      queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
      isPlacementMatch
    },
    matchRecord: {
      schemaVersion: 3,
      id,
      source,
      playedAt,
      createdAt: playedAt,
      season,
      act: "Season 2099 Act 1",
      agent,
      role,
      map: "Lotus",
      result,
      queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
      isPlacementMatch,
      stats: { kills: result === "win" ? 18 : 8, deaths: result === "win" ? 8 : 18, assists: 5, acs: result === "win" ? 240 : 120, adr: result === "win" ? 155 : 90, hsPercent: 25 },
      rank: { rank: isPlacementMatch ? "Unranked" : "Platinum 3", rr: isPlacementMatch ? null : 50, rrDelta: isPlacementMatch ? null : (result === "win" ? 18 : -16), verified: !isPlacementMatch }
    }
  });

  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", "season-rollover");
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
    id: "season-rollover",
    name: "Season Rollover",
    accountName: "Season Rollover",
    riotId: "Season#ID",
    importSource: "henrik",
    lastSyncSource: "henrik",
    trackerAnalytics: {
      currentAct: "Season 2026 Act 4",
      acts: ["Season 2026 Act 4"]
    },
    matches: [
      makeMatch({
        id: "old-same-label-controller-loss",
        agent: "Harbor",
        role: "Controller",
        result: "loss",
        season: "season-previous-real-id",
        playedAt: "2026-07-20T16:00:00.000Z"
      }),
      makeMatch({
        id: "current-placement-initiator-win",
        agent: "Fade",
        role: "Initiator",
        result: "win",
        season: "season-current-real-id",
        playedAt: "2026-08-03T16:05:00.000Z",
        isPlacementMatch: true
      }),
      makeMatch({
        id: "current-sova-initiator-win",
        agent: "Sova",
        role: "Initiator",
        result: "win",
        season: "season-current-real-id",
        playedAt: "2026-08-03T16:10:00.000Z"
      }),
      makeMatch({
        id: "tutorial_demo_same_real_id_duelist_loss",
        agent: "Phoenix",
        role: "Duelist",
        result: "loss",
        season: "season-current-real-id",
        playedAt: "2026-08-03T16:15:00.000Z",
        source: "demo-fixture"
      })
    ]
  }]));
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  const issues = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error" && !/Failed to load resource: net::ERR_(?:CONNECTION_CLOSED|ABORTED)/i.test(message.text())) {
        issues.push(`[console] ${message.text()}`);
      }
    });
    await page.addInitScript(seedSeasonRolloverProfile);
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
      await page.click("#dailyWarmupSkip");
    }
    await page.click('.nav-btn[data-page="stats"]');
    await page.waitForSelector("#statsRoleProgressRow .stats-role-pill", { timeout: 15000 });
    await page.waitForTimeout(300);

    const result = await page.evaluate(() => {
      const roles = {};
      document.querySelectorAll("#statsRoleProgressRow .stats-role-pill").forEach((pill) => {
        const label = pill.querySelector(".stats-role-pill-label")?.textContent?.trim()?.toLowerCase() || "";
        roles[label] = {
          games: pill.querySelector(".stats-role-pill-games strong")?.textContent?.trim() || "",
          percent: pill.querySelector(".stats-role-pill-percent")?.textContent?.trim() || ""
        };
      });
      return {
        roles,
        statWinrate: document.getElementById("statWinrate")?.textContent?.trim() || "",
        selectorValue: document.getElementById("statsActSelector")?.value || "",
        selectorOptions: [...document.querySelectorAll("#statsActSelector option")].map(option => ({
          value: option.value,
          label: option.textContent.trim()
        }))
      };
    });

    assert.equal(result.selectorValue, "season:season-current-real-id", `newest real match season id should be selected: ${JSON.stringify(result)}`);
    assert.ok(result.selectorOptions.some(option => option.value === "season:season-previous-real-id"), `older same-label season id should remain selectable separately: ${JSON.stringify(result)}`);
    assert.equal(result.roles.initiator?.games, "2", `current season should include both RR-verified and placement competitive matches: ${JSON.stringify(result)}`);
    assert.equal(result.roles.initiator?.percent, "100%", `current season initiator wins should stay at 100%: ${JSON.stringify(result)}`);
    assert.equal(result.roles.controller?.games, "--", `older same-label season must not be counted by label collision: ${JSON.stringify(result)}`);
    assert.equal(result.roles.duelist?.games, "--", `demo fixture with matching real season id must not collide: ${JSON.stringify(result)}`);
    assert.equal(result.statWinrate, "100%", `summary winrate should use current season id only: ${JSON.stringify(result)}`);
    assert.deepEqual(issues, []);

    console.log("Season identity rollover passed: current season uses newest Riot season id, placement matches count, same-label older seasons and demo fixtures stay out.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
