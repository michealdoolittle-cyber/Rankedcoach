"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41823;
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

function todayIsoAt(minutesOffset = 0) {
  const date = new Date();
  date.setHours(12, minutesOffset, 0, 0);
  return date.toISOString();
}

function seedUnrankedSessionProfile() {
  const todayIsoAt = (minutesOffset = 0) => {
    const date = new Date();
    date.setHours(12, minutesOffset, 0, 0);
    return date.toISOString();
  };
  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();
  const matches = [0, 1].map(index => ({
    id: `act4-unranked-session-${index + 1}`,
    matchId: `act4-unranked-session-${index + 1}`,
    source: "henrik_sync",
    importSource: "henrik",
    lastSyncSource: "henrik",
    // Regression guard: createdAt can be stale/local-cache metadata. Home
    // session scope must use the provider playedAt value first.
    createdAt: "2026-07-30T20:00:00.000Z",
    rr: null,
    rrVerified: false,
    rank: "Unrated",
    result: index === 0 ? "loss" : "win",
    agent: index === 0 ? "Sova" : "Skye",
    map: index === 0 ? "Summit" : "Lotus",
    kills: index === 0 ? 12 : 18,
    deaths: index === 0 ? 15 : 10,
    assists: index === 0 ? 6 : 8,
    acs: index === 0 ? 178 : 244,
    hsPercent: index === 0 ? 18 : 22,
    act: "Season 2026 Act 4",
    metadata: {
      matchId: `act4-unranked-session-${index + 1}`,
      source: "henrik_sync",
      playedAt: todayIsoAt(index),
      result: index === 0 ? "loss" : "win",
      agent: index === 0 ? "Sova" : "Skye",
      mapName: index === 0 ? "Summit" : "Lotus",
      rank: "Unrated",
      rrVerified: false,
      act: "Season 2026 Act 4"
    },
    matchRecord: {
      source: "henrik_sync",
      playedAt: todayIsoAt(index),
      act: "Season 2026 Act 4",
      rank: { rank: "Unrated", rr: null, rrDelta: null, verified: false },
      stats: {
        kills: index === 0 ? 12 : 18,
        deaths: index === 0 ? 15 : 10,
        assists: index === 0 ? 6 : 8,
        acs: index === 0 ? 178 : 244,
        adr: index === 0 ? 132 : 166,
        hsPercent: index === 0 ? 18 : 22
      }
    }
  }));

  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", "unranked-home-regression");
  localStorage.setItem(`valtracker_daily_warmup_prompt_v1:unranked-home-regression`, todayKey);
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
    id: "unranked-home-regression",
    name: "Unranked Home Regression",
    accountName: "Unranked Home Regression",
    importSource: "henrik",
    lastSyncSource: "henrik",
    // Regression guard: stale analytics must not hide newer retained matches
    // from the Home chart or latest impact meter.
    trackerAnalytics: {
      currentAct: "Season 2026 Act 3",
      acts: ["Season 2026 Act 3", "Season 2026 Act 4"]
    },
    matches
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
    await page.addInitScript(seedUnrankedSessionProfile);
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
      await page.click("#dailyWarmupSkip");
    }
    await page.locator("#chartRow svg").waitFor({ state: "visible", timeout: 15000 });
    await page.waitForFunction(() => document.querySelectorAll("#chartRow .rr-hit").length === 2, null, { timeout: 15000 }).catch(async error => {
      const debug = await page.evaluate(() => ({
        hits: document.querySelectorAll("#chartRow .rr-hit").length,
        segments: document.querySelectorAll("#chartRow .segment").length,
        status: document.getElementById("rrChartDataStatus")?.textContent?.trim() || "",
        impact: document.querySelector("#impactScoreLabel strong")?.textContent?.trim() || "",
        loginHidden: document.getElementById("loginInitOverlay")?.getAttribute("aria-hidden") || "",
        authClass: document.getElementById("authModal")?.className || "",
        profileJson: localStorage.getItem("valtracker_profiles_v1") || ""
      }));
      console.error("Home unranked regression debug:", JSON.stringify(debug).slice(0, 1600));
      throw error;
    });
    await page.waitForTimeout(300);

    const home = await page.evaluate(() => ({
      hits: document.querySelectorAll("#chartRow .rr-hit").length,
      segments: document.querySelectorAll("#chartRow .segment").length,
      status: document.getElementById("rrChartDataStatus")?.textContent?.trim() || "",
      impact: document.querySelector("#impactScoreLabel strong")?.textContent?.trim() || "",
      impactPill: document.getElementById("impactRolePill")?.textContent?.trim() || "",
      matchMeta: document.getElementById("rrMatchMeta")?.textContent?.trim() || ""
    }));

    assert.equal(home.hits, 2, `today's unranked retained matches should draw as chart hits: ${JSON.stringify(home)}`);
    assert.equal(home.segments, 2, `today's unranked retained matches should draw flat 0-RR segments: ${JSON.stringify(home)}`);
    assert.match(home.status, /Match stats are available for 2 retained matches|2 of 2 retained matches/i);
    assert.match(home.impact, /^[1-9]\d?%$|^100%$/, `latest impact score should be calculated from match stats: ${JSON.stringify(home)}`);
    assert.match(home.impactPill, /Latest Initiator Report/i);
    assert.match(home.matchMeta, /Skye|Lotus|RR unavailable/i);
    assert.deepEqual(issues, []);

    console.log("Home unranked session regression passed: Act 4 unranked matches draw at 0 RR and latest impact renders.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
