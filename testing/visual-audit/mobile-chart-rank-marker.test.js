"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41906;
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };

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
        response.writeHead(error ? 404 : 200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
        response.end(error ? "Not found" : data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const consoleIssues = [];
  page.on("console", message => { if (message.type() === "error") consoleIssues.push(message.text()); });
  page.on("pageerror", error => consoleIssues.push(error.message));
  try {
    await page.addInitScript(() => {
      const profileId = "mobile-rank-marker";
      const now = Date.now();
      const build = (index, rank, rrTotal, rrDelta, offset) => ({
        id: `rank-marker-${index}`, matchId: `rank-marker-${index}`, source: "henrik_sync",
        createdAt: new Date(now - offset).toISOString(), result: "win", agent: "Sova", map: "Ascent",
        kills: 18, deaths: 12, assists: 6, rank, rrTotal, verifiedRrDelta: rrDelta, rrVerified: true,
        metadata: { source: "henrik_sync", playedAt: new Date(now - offset).toISOString(), rank, rrTotal, rrVerified: true },
        matchRecord: { id: `rank-marker-${index}`, source: "henrik_sync", playedAt: new Date(now - offset).toISOString(), rank: { rank, rr: rrTotal, rrDelta, verified: true } }
      });
      const matches = [
        build(1, "Gold 3", 92, 14, 180000),
        build(2, "Platinum 1", 8, 16, 120000),
        build(3, "Diamond 1", 8, 16, 60000)
      ];
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profileId);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: profileId, name: "Mobile rank marker", region: "NA", importSource: "henrik", lastSyncSource: "henrik_sync",
        lastWarmupPromptDate: new Date().toISOString().slice(0, 10), matches
      }]));
      localStorage.setItem("valtracker_logs_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v2:guest", "[]");
    });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelectorAll("#chartRow .rr-hit").length >= 3, null, { timeout: 20000 });
    await page.evaluate(() => {
      globalThis.RankedCoachDailyEntrance?.skipAll?.();
      document.querySelectorAll(".lens-modal-overlay, .app-loading-veil, #dailyWarmupModal").forEach(element => {
        element.classList.remove("active");
        element.setAttribute("aria-hidden", "true");
        element.style.setProperty("display", "none", "important");
      });
      document.body.classList.remove("modal-open", "is-modal-open", "has-active-modal", "daily-entrance-motion-active");
    });
    // The chart intentionally suppresses selection while its intro sequence
    // is playing. Wait for that short presentation phase to settle.
    await page.waitForTimeout(3200);
    const geometry = await page.evaluate(() => {
      const hit = [...document.querySelectorAll("#chartRow .rr-hit")].at(-1);
      const marker = document.querySelector(`#chartRow .chart-rank-marker[data-match-index="${hit?.dataset.matchIndex}"]`);
      const hitX = Number(hit?.getAttribute("cx"));
      const hitY = Number(hit?.getAttribute("cy"));
      const markerCircle = marker?.querySelector("circle");
      return {
        hitX, hitY,
        markerX: Number(markerCircle?.getAttribute("cx")),
        markerY: Number(markerCircle?.getAttribute("cy")),
        rankChange: hit?.dataset.rankChange || ""
      };
    });
    assert.equal(geometry.rankChange, "true", JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.markerX - geometry.hitX) < .01, `mobile marker must remain centred below its rank dot: ${JSON.stringify(geometry)}`);
    assert.ok(geometry.markerY > geometry.hitY, `mobile marker must sit below its rank dot: ${JSON.stringify(geometry)}`);
    assert.deepEqual(consoleIssues, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Mobile chart rank marker remains anchored to the selected rank-change dot.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
