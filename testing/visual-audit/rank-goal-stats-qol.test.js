"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41785;
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
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

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    await page.addInitScript(() => {
      const profileId = "qol-regression-profile";
      const matches = Array.from({ length: 25 }, (_item, index) => ({
        id: `retained-${index}`,
        matchId: `retained-${index}`,
        source: "henrik_sync",
        rank: "Diamond 2",
        rrTotal: 54,
        result: index % 2 ? "loss" : "win",
        kills: 16,
        deaths: 14,
        assists: 5,
        agent: "Killjoy",
        map: "Haven",
        createdAt: `2026-06-${String((index % 25) + 1).padStart(2, "0")}T12:00:00Z`,
        metadata: {
          source: "henrik_sync",
          rank: "Diamond 2",
          rrTotal: 54,
          agent: "Killjoy",
          map: "Haven",
          mapName: "Haven",
          demoAct: "Season 2026 Act 2",
          playedAt: `2026-06-${String((index % 25) + 1).padStart(2, "0")}T12:00:00Z`
        }
      }));
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profileId);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: profileId,
        name: "Main",
        riotId: "GoopyWetDiaperWithAVeryLongName#GOOPYLONGTAG",
        region: "NA",
        puuid: "qol-test-puuid",
        importSource: "henrik",
        lastSyncSource: "henrik",
        goalRank: "Gold 1",
        startingRR: 0,
        matches,
        trackerAnalytics: { currentAct: "Season 2026 Act 3", acts: ["Season 2026 Act 3", "Season 2026 Act 2"] }
      }]));
      localStorage.setItem("valtracker_logs_v1", "[]");
    });

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);

    assert.equal(await page.locator("#navGoalTargetIcon").getAttribute("alt"), "Diamond 3");
    const storedGoal = await page.evaluate(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.goalRank);
    assert.equal(storedGoal, "Diamond 3");

    const profileIdentity = await page.locator("#profileRiotId").evaluate(element => {
      const name = element.querySelector(".profile-riot-name").getBoundingClientRect();
      const tag = element.querySelector(".profile-riot-tag").getBoundingClientRect();
      return { nameBottom: name.bottom, tagTop: tag.top, text: element.innerText };
    });
    assert.ok(profileIdentity.tagTop >= profileIdentity.nameBottom - 1, JSON.stringify(profileIdentity));
    assert.match(profileIdentity.text, /#GOOPYLONGTAG/);

    const rating = Number((await page.locator("#profileRatingValue").innerText()).replace("%", ""));
    assert.ok(rating > 0 && rating < 100, `expected partial readiness, received ${rating}%`);
    await page.locator("#profileRatingWidget").click();
    const unlockState = await page.locator("#profileRatingUnlocks .coach-readiness-unlock").evaluateAll(items => items.map(item => ({
      complete: item.classList.contains("is-complete"),
      text: item.innerText
    })));
    assert.deepEqual(unlockState.map(item => item.complete), [true, false, false, false]);
    assert.match(unlockState[1].text, /0\/5 season/);
    assert.match(unlockState[2].text, /0\/10 season/);
    assert.match(unlockState[3].text, /0\/10 season.*0\/5 logs/s);
    assert.doesNotMatch(await page.locator("#profileRatingCopy").innerText(), /undefined/i);
    await page.locator("#profileRatingWidget").click();

    const chartGeometry = await page.locator(".rr-chart-card").evaluate(card => {
      const chartWrap = card.querySelector(".home-chart-wrap").getBoundingClientRect();
      const title = card.querySelector(".chart-axis-title").getBoundingClientRect();
      const legend = card.querySelector(".chart-axis-legend").getBoundingClientRect();
      const numericTicks = [...card.querySelectorAll("#chartRow svg > text")]
        .filter(element => /^\d+$/.test(String(element.textContent || "").trim()))
        .map(element => element.getBoundingClientRect());
      const footer = document.getElementById("siteFooter").getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return {
        tickBottom: Math.max(...numericTicks.map(rect => rect.bottom)),
        titleTop: title.top,
        titleBottom: title.bottom,
        legendTop: legend.top,
        legendBottom: legend.bottom,
        wrapBottom: chartWrap.bottom,
        cardBottom: cardRect.bottom,
        footerTop: footer.top
      };
    });
    assert.ok(chartGeometry.tickBottom < chartGeometry.titleTop, JSON.stringify(chartGeometry));
    assert.ok(chartGeometry.titleBottom < chartGeometry.legendTop, JSON.stringify(chartGeometry));
    assert.ok(chartGeometry.legendBottom <= chartGeometry.wrapBottom + 1, JSON.stringify(chartGeometry));
    assert.ok(chartGeometry.cardBottom < chartGeometry.footerTop, JSON.stringify(chartGeometry));
    fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-desktop-chart-spacing.png"), fullPage: true });

    await page.locator('[data-page="stats"]').click();
    await page.waitForTimeout(250);
    const proofContainment = await page.locator("#page-stats .stats-proof-card").evaluate(card => {
      const parent = card.getBoundingClientRect();
      return [".stats-proof-card-head", ".stats-history-boundary-note", ".stats-proof-rank-row", ".stats-proof-note"].map(selector => {
        const rect = card.querySelector(selector).getBoundingClientRect();
        return { selector, top: rect.top, bottom: rect.bottom, parentTop: parent.top, parentBottom: parent.bottom };
      });
    });
    proofContainment.forEach(item => {
      assert.ok(item.top >= item.parentTop - 1 && item.bottom <= item.parentBottom + 1, JSON.stringify(item));
    });
    assert.ok(proofContainment[0].bottom <= proofContainment[1].top, JSON.stringify(proofContainment));
    assert.ok(proofContainment[1].bottom <= proofContainment[2].top, JSON.stringify(proofContainment));
    assert.ok(proofContainment[1].bottom <= proofContainment[3].top, JSON.stringify(proofContainment));
    await page.locator("#page-stats .stats-proof-card").screenshot({ path: path.join(__dirname, "tmp", "qol-desktop-stats-proof-card.png") });
    const trigger = page.locator("#statsActMobileTrigger");
    assert.equal(await trigger.isVisible(), true);
    const triggerRadius = parseFloat(await trigger.evaluate(element => getComputedStyle(element).borderTopLeftRadius));
    assert.ok(triggerRadius >= 10);
    await trigger.click();
    const panel = page.locator("#statsActMobileMenu .stats-act-mobile-menu-panel");
    assert.equal(await panel.isVisible(), true);
    const panelMetrics = await panel.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return { radius: parseFloat(getComputedStyle(element).borderTopLeftRadius), left: rect.left, right: rect.right, viewport: innerWidth };
    });
    assert.ok(panelMetrics.radius >= 12);
    assert.ok(panelMetrics.left >= 0 && panelMetrics.right <= panelMetrics.viewport);
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-desktop-season-menu.png"), fullPage: true });

    await page.locator(".stats-act-mobile-menu-close").click();
    await page.locator('[data-page="insights"]').click();
    await page.waitForTimeout(250);
    const filterState = await page.locator(".insight-filter-btn").evaluateAll(buttons => buttons.map(button => ({ filter: button.dataset.filter, disabled: button.disabled })));
    assert.equal(filterState.find(item => item.filter === "all")?.disabled, false);
    assert.ok(filterState.some(item => item.filter !== "all" && item.disabled), JSON.stringify(filterState));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-desktop-insight-filters.png"), fullPage: true });

    console.log("Goal, readiness gates, chart spacing, Stats containment, rounded season selector, long Riot ID, and empty insight-filter checks passed.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
