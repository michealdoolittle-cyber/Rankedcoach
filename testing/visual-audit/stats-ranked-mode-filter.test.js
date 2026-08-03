"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41824;
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

function seedMixedModeProfile() {
  const makeMatch = ({ id, agent, map, result, queueId, queueName, kills, deaths, assists, acs, adr, hsPercent, season = "season-2026-act-4" }) => ({
    id,
    matchId: id,
    source: "henrik_sync",
    createdAt: "2026-08-03T16:00:00.000Z",
    playedAt: "2026-08-03T16:00:00.000Z",
    season,
    act: "Season 2026 Act 4",
    agent,
    map,
    result,
    kills,
    deaths,
    assists,
    acs,
    adr,
    hsPercent,
    queue: { id: queueId, name: queueName, modeType: "Standard" },
    metadata: {
      matchId: id,
      source: "henrik_sync",
      playedAt: "2026-08-03T16:00:00.000Z",
      season,
      act: "Season 2026 Act 4",
      agent,
      mapName: map,
      result,
      queue: { id: queueId, name: queueName, modeType: "Standard" }
    },
    matchRecord: {
      schemaVersion: 3,
      id,
      source: "henrik_sync",
      playedAt: "2026-08-03T16:00:00.000Z",
      season,
      act: "Season 2026 Act 4",
      agent,
      map,
      result,
      queue: { id: queueId, name: queueName, modeType: "Standard" },
      stats: { kills, deaths, assists, acs, adr, hsPercent },
      rank: { rank: "Platinum 3", rr: 50, rrDelta: result === "win" ? 18 : -14, verified: true }
    }
  });

  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", "stats-ranked-filter");
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
    id: "stats-ranked-filter",
    name: "Stats Ranked Filter",
    accountName: "Stats Ranked Filter",
    importSource: "henrik",
    lastSyncSource: "henrik",
    trackerAnalytics: {
      currentAct: "Season 2026 Act 4",
      acts: ["Season 2026 Act 4"]
    },
    matches: [
      makeMatch({ id: "competitive-sova", agent: "Sova", map: "Lotus", result: "win", queueId: "competitive", queueName: "Competitive", kills: 18, deaths: 10, assists: 8, acs: 244, adr: 155, hsPercent: 22 }),
      makeMatch({ id: "unrated-raze", agent: "Raze", map: "Haven", result: "loss", queueId: "unrated", queueName: "Unrated", kills: 30, deaths: 1, assists: 0, acs: 500, adr: 300, hsPercent: 60 })
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
    await page.addInitScript(seedMixedModeProfile);
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
      const statWinrate = document.getElementById("statWinrate")?.textContent?.trim() || "";
      const sovaCard = [...document.querySelectorAll("#statsAgentsList .stats-agent-mini-card")]
        .find(card => /sova/i.test(card.textContent || ""));
      const razeCard = [...document.querySelectorAll("#statsAgentsList .stats-agent-mini-card")]
        .find(card => /raze/i.test(card.textContent || ""));
      return {
        roles,
        statWinrate,
        sovaDisabled: sovaCard?.disabled ?? null,
        razeDisabled: razeCard?.disabled ?? null,
        razeText: razeCard?.textContent?.replace(/\s+/g, " ").trim() || ""
      };
    });

    assert.equal(result.roles.initiator?.games, "1", `competitive initiator match should count: ${JSON.stringify(result)}`);
    assert.equal(result.roles.initiator?.percent, "100%", `competitive initiator win should show 100%: ${JSON.stringify(result)}`);
    assert.equal(result.roles.duelist?.games, "--", `explicit unrated duelist match should be excluded: ${JSON.stringify(result)}`);
    assert.equal(result.statWinrate, "100%", `summary winrate should ignore explicit unrated loss: ${JSON.stringify(result)}`);
    assert.equal(result.sovaDisabled, false, `competitive Sova card should be selectable: ${JSON.stringify(result)}`);
    assert.equal(result.razeDisabled, true, `unrated Raze card should not be counted/selectable in ranked stats: ${JSON.stringify(result)}`);
    assert.match(result.razeText, /No Data/i);
    assert.deepEqual(issues, []);

    console.log("Stats ranked mode filter passed: explicit non-competitive matches stay out of ranked stats.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
