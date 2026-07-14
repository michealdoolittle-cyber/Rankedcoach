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
    await page.click("#dailyWarmupSkip").catch(() => {});

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
    assert.equal(await page.locator("#profileRatingUnlocks .profile-activity-day").count(), 30);
    await page.locator("#profileRatingWidget").click();

    await page.locator('.graph-btn[data-size="all"]').click();
    await page.waitForTimeout(350);
    assert.match(await page.locator(".chart-axis-title").textContent(), /Matches across all-time rank history/i);
    const lifetimeRankIcons = await page.locator("#chartRow .chart-rank-axis-icon").evaluateAll(groups => groups.map(group => ({
      label: group.getAttribute("aria-label"),
      href: group.querySelector("image")?.getAttribute("href") || ""
    })));
    assert.ok(lifetimeRankIcons.length >= 3, JSON.stringify(lifetimeRankIcons));
    assert.ok(lifetimeRankIcons.some(icon => /Diamond/i.test(icon.label) && icon.href), JSON.stringify(lifetimeRankIcons));

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
    const desktopPageMotion = await page.evaluate(() => ({
      direction: document.body.dataset.pageSlideDirection,
      outgoing: document.getElementById("page-home")?.classList.contains("exiting"),
      incoming: document.getElementById("page-stats")?.classList.contains("active")
    }));
    assert.deepEqual(desktopPageMotion, { direction: "forward", outgoing: true, incoming: true });
    await page.waitForTimeout(250);
    assert.equal(await page.locator("#statFirstBloods").count(), 1);
    assert.equal(await page.locator("#statDamagePerRound").count(), 1);
    const breakdownVisuals = await page.locator("#statsBreakdown").evaluate(container => ({
      cards: container.querySelectorAll(".stats-breakdown-cardlet").length,
      visuals: container.querySelectorAll(".stats-data-visual,.stats-confidence-visual,.coaching-category-visual").length
    }));
    assert.ok(breakdownVisuals.cards > 0 && breakdownVisuals.visuals === breakdownVisuals.cards, JSON.stringify(breakdownVisuals));
    const summaryGrid = await page.locator("#page-stats .stats-summary-grid").evaluate(grid => ({
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length,
      rows: new Set([...grid.children].map(child => Math.round(child.getBoundingClientRect().top))).size,
      items: grid.children.length
    }));
    assert.equal(summaryGrid.columns, 3, JSON.stringify(summaryGrid));
    assert.equal(summaryGrid.rows, 2, JSON.stringify(summaryGrid));
    assert.equal(summaryGrid.items, 6, JSON.stringify(summaryGrid));
    const mapStatCard = page.locator("#page-stats .stats-map-card:not(.is-empty):not(.is-locked)").first();
    if (await mapStatCard.count()) {
      await mapStatCard.hover();
      assert.equal(await mapStatCard.evaluate(card => getComputedStyle(card).transform), "none");
    }
    const proofContainment = await page.locator("#page-stats .stats-proof-card").evaluate(card => {
      const parent = card.getBoundingClientRect();
      const items = [".stats-proof-card-head", ".stats-history-boundary-note", ".stats-proof-rank-row", ".stats-proof-note", ".stats-summary-selector-bottom"].map(selector => {
        const rect = card.querySelector(selector).getBoundingClientRect();
        return { selector, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, parentTop: parent.top, parentRight: parent.right, parentBottom: parent.bottom, parentLeft: parent.left };
      });
      return items;
    });
    proofContainment.forEach(item => {
      assert.ok(item.top >= item.parentTop - 1 && item.bottom <= item.parentBottom + 1 && item.left >= item.parentLeft - 1 && item.right <= item.parentRight + 1, JSON.stringify(item));
    });
    assert.ok(proofContainment[0].bottom <= proofContainment[1].top, JSON.stringify(proofContainment));
    assert.ok(proofContainment[1].bottom <= proofContainment[3].top, JSON.stringify(proofContainment));
    assert.ok(proofContainment[2].right <= proofContainment[4].left + 1 || proofContainment[2].bottom <= proofContainment[4].top + 1, JSON.stringify(proofContainment));
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
    const insightVisuals = await page.locator("#insightsList").evaluate(container => ({
      cards: container.querySelectorAll(".insight-card:not(.insight-empty)").length,
      visuals: container.querySelectorAll(".insight-card:not(.insight-empty) .coaching-category-visual").length
    }));
    assert.ok(insightVisuals.cards > 0, JSON.stringify(insightVisuals));
    assert.equal(insightVisuals.visuals, insightVisuals.cards, JSON.stringify(insightVisuals));
    const firstInsight = page.locator("#insightsList .insight-card:not(.insight-empty)").first();
    await firstInsight.click();
    await page.waitForTimeout(350);
    const expandedInsight = await firstInsight.evaluate(card => {
      const host = card.closest(".insights-top-card");
      const expand = card.querySelector(".insight-expand");
      const cardRect = card.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      return {
        open: card.classList.contains("open"),
        cardBottom: cardRect.bottom,
        hostBottom: hostRect.bottom,
        expandClientHeight: expand.clientHeight,
        expandScrollHeight: expand.scrollHeight,
        overflow: getComputedStyle(card).overflow
      };
    });
    assert.ok(expandedInsight.open && expandedInsight.cardBottom <= expandedInsight.hostBottom + 1, JSON.stringify(expandedInsight));
    assert.ok(expandedInsight.expandScrollHeight <= expandedInsight.expandClientHeight + 1, JSON.stringify(expandedInsight));
    const trendMedia = await page.locator("#page-insights .trend-signal-media").evaluateAll(items => items.map(item => ({
      visible: item.getBoundingClientRect().width > 0 && item.getBoundingClientRect().height > 0,
      populated: Boolean(item.querySelector("img,svg,.trend-signal-media-label"))
    })));
    assert.ok(trendMedia.length > 0 && trendMedia.every(item => item.populated), JSON.stringify(trendMedia));
    assert.ok(trendMedia.some(item => item.visible), JSON.stringify(trendMedia));
    const filterState = await page.locator(".insight-filter-btn").evaluateAll(buttons => buttons.map(button => ({ filter: button.dataset.filter, disabled: button.disabled })));
    assert.equal(filterState.find(item => item.filter === "all")?.disabled, false);
    assert.ok(filterState.some(item => item.filter !== "all" && item.disabled), JSON.stringify(filterState));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-desktop-insight-filters.png"), fullPage: true });

    await page.locator("#profileDropdownToggle").click();
    await page.locator("#pdAccountSupportBtn").click();
    await page.locator("#accountSupportModal.active").waitFor({ state: "visible" });
    assert.equal(await page.locator("#accountSupportModal .lens-modal-close").count(), 0);
    const modalMotion = await page.locator("#accountSupportModal > .lens-modal").evaluate(modal => ({
      duration: getComputedStyle(modal).transitionDuration,
      property: getComputedStyle(modal).transitionProperty
    }));
    assert.match(modalMotion.duration, /0\.32s|320ms/);
    assert.match(modalMotion.property, /transform/);
    await page.waitForTimeout(350);
    const openBackdrop = await page.locator("#accountSupportModal").evaluate(modal => getComputedStyle(modal).backdropFilter || getComputedStyle(modal).webkitBackdropFilter);
    assert.match(openBackdrop, /blur\(12px\)/);
    await page.locator("#accountSupportModal").click({ position: { x: 2, y: 2 } });
    assert.equal(await page.locator("#accountSupportModal").evaluate(modal => modal.classList.contains("is-closing")), true);
    await page.waitForTimeout(180);
    const closingBackdrop = await page.locator("#accountSupportModal").evaluate(modal => getComputedStyle(modal).backdropFilter || getComputedStyle(modal).webkitBackdropFilter);
    const closingBlur = Number.parseFloat(closingBackdrop.match(/blur\(([\d.]+)px\)/)?.[1] || "0");
    assert.ok(closingBlur < 12, closingBackdrop);
    await page.waitForFunction(() => document.getElementById("accountSupportModal")?.getAttribute("aria-hidden") === "true");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.click("#dailyWarmupSkip").catch(() => {});
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="stats"]').click();
    await page.waitForFunction(() => document.getElementById("page-stats")?.getAnimations().some(animation => animation.id === "rankedcoach-page-button-slide"));
    await page.waitForTimeout(400);
    const mobilePeakGeometry = await page.locator("#page-stats .stats-proof-card").evaluate(card => {
      const parent = card.getBoundingClientRect();
      const visual = card.querySelector(".stats-peak-visual").getBoundingClientRect();
      const details = card.querySelector(".stats-peak-details").getBoundingClientRect();
      const selector = card.querySelector(".stats-summary-selector-bottom").getBoundingClientRect();
      return { parent: parent.toJSON(), visual: visual.toJSON(), details: details.toJSON(), selector: selector.toJSON() };
    });
    assert.ok(mobilePeakGeometry.visual.left < mobilePeakGeometry.details.left && mobilePeakGeometry.visual.right <= mobilePeakGeometry.details.left + 1, JSON.stringify(mobilePeakGeometry));
    assert.ok(Math.abs(mobilePeakGeometry.visual.width - mobilePeakGeometry.details.width) <= 12, JSON.stringify(mobilePeakGeometry));
    assert.ok(mobilePeakGeometry.selector.top >= Math.max(mobilePeakGeometry.visual.bottom, mobilePeakGeometry.details.bottom) - 1 && mobilePeakGeometry.selector.bottom <= mobilePeakGeometry.parent.bottom + 1, JSON.stringify(mobilePeakGeometry));
    await page.locator("#page-stats .stats-proof-card").screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-stats-proof-card.png") });
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="home"]').click();
    await page.waitForFunction(() => document.getElementById("page-home")?.classList.contains("is-current-page"));
    await page.locator('.graph-btn[data-size="all"]').click();
    await page.waitForTimeout(350);
    const mobileLifetimeGeometry = await page.locator(".rr-chart-card").evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const title = card.querySelector(".chart-axis-title").getBoundingClientRect();
      const legend = card.querySelector(".chart-axis-legend").getBoundingClientRect();
      const controls = card.querySelector(".graph-controls, .graph-buttons, .rr-graph-controls") || card.querySelector('.graph-btn[data-size="5"]')?.parentElement;
      const controlsRect = controls.getBoundingClientRect();
      const rankLabels = [...card.querySelectorAll(".chart-rank-axis-icon image")].map(label => label.getBoundingClientRect());
      return {
        cardLeft: cardRect.left,
        cardRight: cardRect.right,
        titleBottom: title.bottom,
        legendTop: legend.top,
        legendBottom: legend.bottom,
        controlsTop: controlsRect.top,
        rankLabels: rankLabels.map(rect => ({ left: rect.left, right: rect.right }))
      };
    });
    assert.ok(mobileLifetimeGeometry.titleBottom < mobileLifetimeGeometry.legendTop, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.legendBottom < mobileLifetimeGeometry.controlsTop, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.rankLabels.length >= 3, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.rankLabels.every(rect => rect.left >= mobileLifetimeGeometry.cardLeft - 1 && rect.right <= mobileLifetimeGeometry.cardRight + 1), JSON.stringify(mobileLifetimeGeometry));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-lifetime-rank-chart.png"), fullPage: true });

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
