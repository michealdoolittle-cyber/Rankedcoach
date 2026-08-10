"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41931;

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
      if (pathname.startsWith("/api/content/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {}, sections: [] }));
        return;
      }
      const filePath = path.join(root, pathname === "/" ? "index.html" : pathname);
      if (!filePath.startsWith(root)) return response.writeHead(403).end("Forbidden");
      fs.readFile(filePath, (error, data) => {
        response.writeHead(error ? 404 : 200, {
          "Content-Type": error ? "text/plain" : ({ ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png" }[path.extname(filePath)] || "text/html")
        });
        response.end(error ? "Not found" : data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleIssues = [];
  page.on("console", message => { if (message.type() === "error") consoleIssues.push(message.text()); });
  page.on("pageerror", error => consoleIssues.push(error.message));
  try {
    await page.addInitScript(() => {
      const profileId = "rank-marker-intro-order";
      const now = Date.now();
      const ranks = ["Gold 1", "Gold 1", "Gold 1", "Gold 2", "Gold 2", "Gold 2", "Gold 3", "Gold 3", "Gold 3", "Platinum 1", "Platinum 1", "Platinum 1"];
      const rankRr = [20, 52, 94, 12, 46, 88, 14, 48, 91, 9, 43, 70];
      const rankDeltas = [20, 32, 42, 18, 34, 42, 26, 34, 43, 18, 34, 27];
      const matches = ranks.map((rank, index) => {
        const playedAt = new Date(now - ((ranks.length - index) * 60000)).toISOString();
        return {
        id: `intro-order-${index + 1}`,
        matchId: `intro-order-${index + 1}`,
        source: "henrik_sync",
        createdAt: playedAt,
        result: "win",
        agent: "Sova",
        map: "Ascent",
        kills: 18,
        deaths: 12,
        assists: 6,
        rank,
        rrTotal: rankRr[index],
        verifiedRrDelta: rankDeltas[index],
        rrVerified: true,
        metadata: { source: "henrik_sync", playedAt, rank, rrTotal: rankRr[index], rrVerified: true },
        matchRecord: { id: `intro-order-${index + 1}`, source: "henrik_sync", playedAt, rank: { rank, rr: rankRr[index], rrDelta: rankDeltas[index], verified: true } }
      };
      });
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profileId);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: profileId,
        name: "Rank marker timing",
        region: "NA",
        importSource: "henrik",
        lastWarmupPromptDate: new Date().toISOString().slice(0, 10),
        matches
      }]));
      localStorage.setItem("valtracker_logs_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v2:guest", "[]");
    });

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelectorAll("#chartControls .graph-btn[data-size='10']").length === 1, null, { timeout: 20000 });
    await page.evaluate(() => {
      globalThis.RankedCoachDailyEntrance?.skipAll?.();
      document.querySelectorAll(".lens-modal-overlay, .app-loading-veil, #dailyWarmupModal").forEach(element => {
        element.classList.remove("active");
        element.style.setProperty("display", "none", "important");
      });
    });
    await page.locator("#chartControls .graph-btn[data-size='10']").click({ force: true });
    await page.waitForTimeout(80);
    const introState = await page.evaluate(() => {
      const chart = document.getElementById("chartRow");
      return {
        active: chart?.classList.contains("chart-intro-active") || false,
        hits: chart?.querySelectorAll(".rr-hit").length || 0,
        rankChanges: [...(chart?.querySelectorAll(".rr-hit") || [])].map(hit => ({ index: hit.dataset.matchIndex, rankChange: hit.dataset.rankChange, rank: hit.dataset.rankLabel, rr: hit.dataset.rankRr })),
        markers: chart?.querySelectorAll(".chart-rank-marker[data-intro-reveal-delay]").length || 0,
        selected: document.querySelector("#chartControls .graph-btn.active")?.getAttribute("data-size") || "",
        disabled: document.querySelector("#chartControls .graph-btn[data-size='10']")?.disabled || false
      };
    });
    assert.equal(introState.selected, "10", JSON.stringify(introState));
    assert.equal(introState.active, true, JSON.stringify(introState));
    assert.ok(introState.markers >= 2, JSON.stringify(introState));

    await page.waitForTimeout(130);
    const beforeSegmentsReachMarkers = await page.evaluate(() => [...document.querySelectorAll("#chartRow .chart-rank-marker[data-intro-reveal-delay]")].map(marker => {
      const style = getComputedStyle(marker);
      return {
        delay: Number(marker.dataset.introRevealDelay || 0),
        revealed: marker.dataset.introRevealed === "true",
        opacity: Number(style.opacity || 0),
        visibility: style.visibility
      };
    }));
    assert.ok(beforeSegmentsReachMarkers.length >= 2, JSON.stringify(beforeSegmentsReachMarkers));
    assert.ok(beforeSegmentsReachMarkers.every(marker => !marker.revealed && marker.opacity === 0 && marker.visibility === "hidden"), JSON.stringify(beforeSegmentsReachMarkers));

    const firstRevealDelay = Math.min(...beforeSegmentsReachMarkers.map(marker => marker.delay));
    await page.waitForTimeout(firstRevealDelay + 320);
    const afterFirstSegment = await page.evaluate(() => [...document.querySelectorAll("#chartRow .chart-rank-marker[data-intro-reveal-delay]")].map(marker => ({
      delay: Number(marker.dataset.introRevealDelay || 0),
      revealed: marker.dataset.introRevealed === "true",
      opacity: Number(getComputedStyle(marker).opacity || 0)
    })));
    assert.ok(afterFirstSegment.some(marker => marker.revealed && marker.opacity > 0), JSON.stringify(afterFirstSegment));
    assert.ok(afterFirstSegment.some(marker => !marker.revealed), `rank icons must remain hidden until their own segment finishes: ${JSON.stringify(afterFirstSegment)}`);

    const finalRevealDelay = Math.max(...afterFirstSegment.map(marker => marker.delay));
    await page.waitForTimeout(Math.max(0, finalRevealDelay - firstRevealDelay) + 400);
    const afterAllSegments = await page.evaluate(() => [...document.querySelectorAll("#chartRow .chart-rank-marker[data-intro-reveal-delay]")].map(marker => ({
      revealed: marker.dataset.introRevealed === "true",
      visible: getComputedStyle(marker).visibility === "visible" && Number(getComputedStyle(marker).opacity || 0) > 0
    })));
    assert.ok(afterAllSegments.every(marker => marker.revealed && marker.visible), JSON.stringify(afterAllSegments));
    assert.deepEqual(consoleIssues, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Rank markers stay hidden until their matching chart segments finish drawing.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
