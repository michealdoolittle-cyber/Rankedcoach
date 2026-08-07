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
      const svg = hit?.closest("svg");
      const marker = svg?.querySelector(`.chart-rank-marker[data-match-index="${hit?.dataset.matchIndex}"]`);
      const dot = svg?.querySelector(`.rr-dot[data-match-index="${hit?.dataset.matchIndex}"], .final-end[data-match-index="${hit?.dataset.matchIndex}"]`);
      const dotX = Number(dot?.getAttribute("cx"));
      const dotY = Number(dot?.getAttribute("cy"));
      const markerCircle = marker?.querySelector("circle");
      return {
        dotX, dotY,
        markerX: Number(markerCircle?.getAttribute("cx")),
        markerY: Number(markerCircle?.getAttribute("cy")),
        rankChange: hit?.dataset.rankChange || ""
      };
    });
    assert.equal(geometry.rankChange, "true", JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.markerX - geometry.dotX) < .01, `mobile marker must remain centred below its rank dot: ${JSON.stringify(geometry)}`);
    assert.ok(geometry.markerY > geometry.dotY, `mobile marker must sit below its rank dot: ${JSON.stringify(geometry)}`);

    await page.locator("#chartRow .rr-hit").last().click({ force: true });
    await page.waitForTimeout(120);
    const newestSelection = await page.evaluate(() => {
      const tooltip = document.getElementById("chartTooltip");
      const summary = document.getElementById("chartSelectionSummary");
      const style = tooltip ? getComputedStyle(tooltip) : null;
      const summaryStyle = summary ? getComputedStyle(summary) : null;
      return {
        floatingVisible: Boolean(tooltip && style?.visibility !== "hidden" && Number(style?.opacity || 0) > 0),
        summaryVisible: Boolean(summary && summaryStyle?.display !== "none"),
        text: summary?.textContent || ""
      };
    });
    assert.equal(newestSelection.floatingVisible, false, `mobile must not use a floating RR tooltip: ${JSON.stringify(newestSelection)}`);
    assert.equal(newestSelection.summaryVisible, true, `newest RR dot should show the fixed summary row: ${JSON.stringify(newestSelection)}`);
    assert.match(newestSelection.text, /^\+16 RR$/i, JSON.stringify(newestSelection));

    await page.locator("#chartRow .rr-hit").first().click({ force: true });
    await page.waitForTimeout(120);
    const earlierSelection = await page.evaluate(() => {
      const tooltip = document.getElementById("chartTooltip");
      const summary = document.getElementById("chartSelectionSummary");
      const style = tooltip ? getComputedStyle(tooltip) : null;
      const summaryStyle = summary ? getComputedStyle(summary) : null;
      return {
        floatingVisible: Boolean(tooltip && style?.visibility !== "hidden" && Number(style?.opacity || 0) > 0),
        summaryVisible: Boolean(summary && summaryStyle?.display !== "none"),
        text: summary?.textContent || ""
      };
    });
    assert.equal(earlierSelection.floatingVisible, false, `mobile must not restore a floating tooltip: ${JSON.stringify(earlierSelection)}`);
    assert.equal(earlierSelection.summaryVisible, true, `earlier RR dot should update the fixed summary row: ${JSON.stringify(earlierSelection)}`);
    assert.match(earlierSelection.text, /^\+14 RR$/i, JSON.stringify(earlierSelection));
    const selectedGeometry = await page.evaluate(() => {
      const hit = [...document.querySelectorAll("#chartRow .rr-hit")].at(-1);
      const marker = hit?.closest("svg")?.querySelector(`.chart-rank-marker[data-match-index="${hit?.dataset.matchIndex}"]`);
      const markerCircle = marker?.querySelector("circle");
      return {
        markerX: Number(markerCircle?.getAttribute("cx")),
        markerY: Number(markerCircle?.getAttribute("cy"))
      };
    });
    assert.deepEqual(selectedGeometry, {
      markerX: geometry.markerX,
      markerY: geometry.markerY
    }, `selecting the newest dot must not reposition its rank marker: ${JSON.stringify({ geometry, selectedGeometry })}`);

    // Desktop folds the selected promotion crest into the tooltip and flips
    // the newest-dot tooltip to the left instead of allowing a second marker
    // or the tooltip itself to collide with the chart edge.
    const seed = await page.evaluate(() => ({
      profiles: localStorage.getItem("valtracker_profiles_v1"),
      activeProfileId: localStorage.getItem("valtracker_active_profile_id"),
      entryChoice: localStorage.getItem("valtracker_entry_choice_v1")
    }));
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    desktop.on("console", message => { if (message.type() === "error") consoleIssues.push(message.text()); });
    desktop.on("pageerror", error => consoleIssues.push(error.message));
    await desktop.addInitScript(saved => {
      localStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", saved.entryChoice || "guest");
      localStorage.setItem("valtracker_active_profile_id", saved.activeProfileId || "");
      localStorage.setItem("valtracker_profiles_v1", saved.profiles || "[]");
      localStorage.setItem("valtracker_logs_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v2:guest", "[]");
    }, seed);
    await desktop.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await desktop.waitForFunction(() => document.querySelectorAll("#chartRow .rr-hit").length >= 3, null, { timeout: 20000 });
    await desktop.evaluate(() => {
      globalThis.RankedCoachDailyEntrance?.skipAll?.();
      document.querySelectorAll(".lens-modal-overlay, .app-loading-veil, #dailyWarmupModal").forEach(element => {
        element.classList.remove("active");
        element.setAttribute("aria-hidden", "true");
        element.style.setProperty("display", "none", "important");
      });
      document.body.classList.remove("modal-open", "is-modal-open", "has-active-modal", "daily-entrance-motion-active");
    });
    await desktop.waitForTimeout(3200);
    await desktop.locator("#chartRow .rr-hit").last().click({ force: true });
    await desktop.waitForTimeout(120);
    const desktopTooltip = await desktop.evaluate(() => {
      const hit = [...document.querySelectorAll("#chartRow .rr-hit")].at(-1);
      const svg = hit?.closest("svg");
      const tooltip = document.getElementById("chartTooltip");
      const marker = svg?.querySelector(`.chart-rank-marker[data-match-index="${hit?.dataset.matchIndex}"]`);
      const tooltipStyle = tooltip ? getComputedStyle(tooltip) : null;
      const tooltipBounds = tooltip?.getBoundingClientRect();
      const chartBounds = svg?.getBoundingClientRect();
      const dotBounds = hit?.getBoundingClientRect();
      return {
        visible: Boolean(tooltip && tooltipStyle?.visibility !== "hidden" && Number(tooltipStyle?.opacity || 0) > 0),
        hasMergedIcon: Boolean(tooltip?.querySelector(".chart-tooltip-rank-icon")),
        markerHidden: marker ? getComputedStyle(marker).visibility === "hidden" : false,
        flipsLeft: Boolean(tooltipBounds && dotBounds && tooltipBounds.right <= dotBounds.left),
        contained: Boolean(tooltipBounds && chartBounds && tooltipBounds.left >= chartBounds.left - 1 && tooltipBounds.right <= chartBounds.right + 1)
      };
    });
    assert.deepEqual(desktopTooltip, {
      visible: true,
      hasMergedIcon: true,
      markerHidden: true,
      flipsLeft: true,
      contained: true
    }, JSON.stringify(desktopTooltip));
    const desktopTooltipText = await desktop.locator("#chartTooltip").innerText();
    assert.equal(desktopTooltipText.trim(), "+16 RR", desktopTooltipText);

    // Dismissing the tooltip outside the chart must restore the rank marker.
    // This matches the real click-off interaction rather than calling the
    // cleanup helper directly.
    await desktop.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await desktop.waitForTimeout(120);
    const dismissedMarker = await desktop.evaluate(() => {
      const hit = [...document.querySelectorAll("#chartRow .rr-hit")].at(-1);
      const marker = hit?.closest("svg")?.querySelector(`.chart-rank-marker[data-match-index="${hit?.dataset.matchIndex}"]`);
      const style = marker ? getComputedStyle(marker) : null;
      return {
        exists: Boolean(marker),
        visible: Boolean(marker && style?.visibility !== "hidden" && Number(style?.opacity || 0) > 0),
        integrated: marker?.classList.contains("is-tooltip-integrated") || false
      };
    });
    assert.deepEqual(dismissedMarker, { exists: true, visible: true, integrated: false }, JSON.stringify(dismissedMarker));
    assert.equal(await desktop.locator("#chartTooltip").evaluate(node => getComputedStyle(node).visibility), "hidden");

    // Regression path from production: choose one promotion, dismiss it,
    // choose another, dismiss it, then return to the first. A marker used to
    // stay hidden because only the older `is-tooltip-paired` class was reset;
    // the tooltip also read its crest from that hidden presentation node.
    // Both crests must persist through the real click-off flow.
    const rankHits = desktop.locator('#chartRow .rr-hit[data-rank-change="true"]');
    await rankHits.first().click({ force: true });
    await desktop.waitForTimeout(120);
    await desktop.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await desktop.waitForTimeout(120);
    await rankHits.last().click({ force: true });
    await desktop.waitForTimeout(120);
    await desktop.evaluate(() => document.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true })));
    await desktop.waitForTimeout(120);
    await rankHits.first().click({ force: true });
    await desktop.waitForTimeout(120);
    const reselection = await desktop.evaluate(() => {
      const hits = [...document.querySelectorAll("#chartRow .rr-hit")]
        .filter(hit => hit.dataset.rankChange === "true");
      const svg = hits[0]?.closest("svg");
      const markers = hits.map(hit => {
        const marker = svg?.querySelector(`.chart-rank-marker[data-match-index="${hit.dataset.matchIndex}"]`);
        const style = marker ? getComputedStyle(marker) : null;
        return {
          icon: hit.dataset.rankIcon || "",
          visible: Boolean(marker && style?.visibility !== "hidden" && Number(style?.opacity || 0) > 0),
          integrated: marker?.classList.contains("is-tooltip-integrated") || false
        };
      });
      return {
        tooltipIcon: document.querySelector("#chartTooltip .chart-tooltip-rank-icon")?.getAttribute("src") || "",
        markers
      };
    });
    assert.ok(reselection.tooltipIcon, `reselected rank tooltip must retain its crest: ${JSON.stringify(reselection)}`);
    assert.ok(reselection.markers.every(marker => marker.icon), `each rank-change hit must retain immutable icon data: ${JSON.stringify(reselection)}`);
    assert.equal(reselection.markers[0].integrated, true, JSON.stringify(reselection));
    assert.equal(reselection.markers[0].visible, false, JSON.stringify(reselection));
    assert.equal(reselection.markers.at(-1).visible, true, `previously selected marker must be restored after click-off: ${JSON.stringify(reselection)}`);
    await desktop.close();
    assert.deepEqual(consoleIssues, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Rank-change icons and markers persist through mobile, desktop, dismissal, and re-selection.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
