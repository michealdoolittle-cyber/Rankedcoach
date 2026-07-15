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
  const consoleIssues = [];
  page.on("console", message => {
    if (message.type() === "error") consoleIssues.push(`[console] ${message.text()}`);
  });
  page.on("pageerror", error => consoleIssues.push(`[pageerror] ${error.message}`));

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
        advanced: {
          rounds: Array.from({ length: 4 }, (_round, roundIndex) => ({
            weapon: index % 2 === 0 ? "Vandal" : "Classic",
            roundWon: index % 2 === 0 ? roundIndex < 3 : roundIndex === 0,
            side: roundIndex % 2 === 0 ? "attack" : "defense"
          }))
        },
        ...(index < 3 ? {
          matchRecord: {
            id: `retained-${index}`,
            trackedPlayer: { puuid: "qol-test-puuid", teammatePuuids: [] },
            roundByRound: [{
              roundNum: 1,
              side: "attack",
              won: index < 1,
              roundCeremony: "CeremonyCloser",
              damageDealt: 120,
              kills: [{
                killer: index < 1 ? "qol-test-puuid" : "enemy-puuid",
                victim: index < 1 ? "enemy-puuid" : "qol-test-puuid",
                roundTime: 1000
              }]
            }]
          }
        } : {}),
        createdAt: `2026-06-${String((index % 25) + 1).padStart(2, "0")}T12:00:00Z`,
        metadata: {
          source: "henrik_sync",
          rank: "Diamond 2",
          rrTotal: 54,
          agent: "Killjoy",
          map: "Haven",
          mapName: "Haven",
          demoAct: index === 24 ? "Season 2026 Act 3" : "Season 2026 Act 2",
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
    assert.match(unlockState[1].text, /1\/5 season/);
    assert.match(unlockState[2].text, /1\/10 season/);
    assert.match(unlockState[3].text, /1\/10 season.*0\/5 logs/s);
    assert.doesNotMatch(await page.locator("#profileRatingCopy").innerText(), /undefined/i);
    assert.equal(await page.locator("#profileRatingUnlocks .profile-activity-day").count(), 30);
    await page.locator("#profileRatingWidget").click();

    await page.locator("#impactRolePill").click();
    await page.locator("#lensModalOverlay.active").waitFor({ state: "visible" });
    assert.equal(await page.locator(".impact-opportunity-panel").isVisible(), false);
    assert.equal(await page.locator("#impactOpportunityList .impact-opportunity-item").count(), 3);
    const impactOpportunities = await page.locator("#impactOpportunityList .impact-opportunity-item").evaluateAll(items => items.map(item => ({
      primary: item.classList.contains("is-primary"),
      text: item.textContent,
      current: Number.parseFloat(item.querySelector("dd")?.textContent || "NaN"),
      weight: Number.parseFloat(item.querySelectorAll("dd")[1]?.textContent || "NaN"),
      projected: Number.parseFloat(item.querySelectorAll("dd")[2]?.textContent || "NaN")
    })));
    assert.equal(impactOpportunities[0].primary, true);
    assert.ok(impactOpportunities.every(item => Number.isFinite(item.current) && Number.isFinite(item.weight) && Number.isFinite(item.projected) && /Current.*Weight.*If \+10/is.test(item.text)), JSON.stringify(impactOpportunities));
    assert.ok(impactOpportunities.every(item => Math.abs(item.projected - Math.min(10, 100 - item.current) * item.weight / 100) <= .11), JSON.stringify(impactOpportunities));
    await page.locator("#impactOpportunityTab").click();
    assert.equal(await page.locator("#impactOpportunityTab").getAttribute("aria-expanded"), "true");
    await page.waitForTimeout(350);
    const opportunityGeometry = await page.locator("#impactOpportunityPullout").evaluate(pullout => {
      const panel = pullout.querySelector(".impact-opportunity-panel").getBoundingClientRect();
      const modal = pullout.closest(".impact-report-modal").getBoundingClientRect();
      return { panel: panel.toJSON(), modal: modal.toJSON(), viewport: { width: innerWidth, height: innerHeight } };
    });
    assert.ok(opportunityGeometry.panel.left >= 0 && opportunityGeometry.panel.right <= opportunityGeometry.viewport.width && opportunityGeometry.panel.top >= 0 && opportunityGeometry.panel.bottom <= opportunityGeometry.viewport.height, JSON.stringify(opportunityGeometry));
    await page.locator("#lensModalOverlay").click({ position: { x: 2, y: 2 } });
    await page.locator("#lensModalOverlay").waitFor({ state: "hidden" });

    await page.locator('.graph-btn[data-size="all"]').click();
    await page.waitForTimeout(350);
    assert.match(await page.locator(".chart-axis-title").textContent(), /Matches since Jun 1, 2026/i);
    assert.deepEqual(
      await page.locator(".chart-lifetime-date-label").allTextContents(),
      ["Jun 1, 2026", "Jun 25, 2026"]
    );
    const lifetimeRankIcons = await page.locator("#chartRow .chart-rank-axis-icon").evaluateAll(groups => groups.map(group => ({
      label: group.getAttribute("aria-label"),
      href: group.querySelector("image")?.getAttribute("href") || ""
    })));
    assert.ok(lifetimeRankIcons.length >= 3, JSON.stringify(lifetimeRankIcons));
    assert.ok(lifetimeRankIcons.some(icon => /Diamond/i.test(icon.label) && icon.href), JSON.stringify(lifetimeRankIcons));
    const lifetimeRankIconBoxes = await page.locator("#chartRow .chart-rank-axis-icon image").evaluateAll(images => images.map(image => image.getBoundingClientRect()).sort((left, right) => left.top - right.top).map(rect => ({ top: rect.top, bottom: rect.bottom, height: rect.height })));
    assert.ok(lifetimeRankIconBoxes.every((box, index) => index === 0 || box.top >= lifetimeRankIconBoxes[index - 1].bottom - 1), JSON.stringify(lifetimeRankIconBoxes));
    assert.match(await page.locator("#chartRow .chart-season-boundary").first().textContent(), /V26\s*A2/is);

    const chartGeometry = await page.locator(".rr-chart-card").evaluate(card => {
      const chartWrap = card.querySelector(".home-chart-wrap").getBoundingClientRect();
      const title = card.querySelector(".chart-axis-title").getBoundingClientRect();
      const legend = card.querySelector(".chart-axis-legend").getBoundingClientRect();
      const dateTicks = [...card.querySelectorAll(".chart-lifetime-date-label")]
        .map(element => element.getBoundingClientRect());
      const footer = document.getElementById("siteFooter").getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return {
        tickBottom: Math.max(...dateTicks.map(rect => rect.bottom)),
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
    const homeHudRules = await page.evaluate(() => {
      const card = getComputedStyle(document.querySelector(".weekly-focus-card"));
      const tag = getComputedStyle(document.querySelector(".weekly-focus-card .card-pill"));
      const label = getComputedStyle(document.querySelector(".weekly-focus-card .card-sub"), "::before");
      const chart = getComputedStyle(document.querySelector("#chartRow"));
      const nav = getComputedStyle(document.querySelector('.nav-btn[data-page="home"]'));
      return {
        cardBorder: card.borderTopColor,
        cardGradients: (card.backgroundImage.match(/linear-gradient/g) || []).length,
        tagClip: tag.clipPath,
        tagRadius: tag.borderTopLeftRadius,
        labelTick: label.backgroundImage,
        chartClip: chart.clipPath,
        navClip: nav.clipPath
      };
    });
    assert.equal(homeHudRules.cardBorder, "rgba(0, 0, 0, 0)", JSON.stringify(homeHudRules));
    assert.ok(homeHudRules.cardGradients >= 2 && homeHudRules.tagClip.includes("polygon") && parseFloat(homeHudRules.tagRadius) === 0, JSON.stringify(homeHudRules));
    assert.match(homeHudRules.labelTick, /linear-gradient/);
    assert.equal(homeHudRules.chartClip, "none");
    assert.equal(homeHudRules.navClip, "none");
    await page.locator(".weekly-focus-card").screenshot({ path: path.join(__dirname, "tmp", "hud-home-weekly-focus.png") });

    await page.locator('[data-page="stats"]').click();
    const desktopPageMotion = await page.evaluate(() => ({
      direction: document.body.dataset.pageSlideDirection,
      outgoing: document.getElementById("page-home")?.classList.contains("exiting"),
      incoming: document.getElementById("page-stats")?.classList.contains("active")
    }));
    assert.deepEqual(desktopPageMotion, { direction: "forward", outgoing: true, incoming: true });
    await page.waitForTimeout(650);
    assert.equal(await page.locator("#statFirstBloods").count(), 1);
    assert.equal(await page.locator("#statDamagePerRound").count(), 1);
    assert.match(await page.locator("#statsHistoryBoundaryNote").innerText(), /Riot's upstream match-history feed.*active retention limit of roughly 2 years.*available history begins Jun 1, 2026/is);
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
    const statsHudRules = await page.evaluate(() => {
      const contentCard = getComputedStyle(document.querySelector(".stats-performance-card"));
      const trend = getComputedStyle(document.querySelector(".stats-trend-card"));
      const tag = getComputedStyle(document.querySelector(".stats-trend-tone"));
      const peak = getComputedStyle(document.querySelector(".stats-proof-card"));
      return {
        contentBorder: contentCard.borderTopColor,
        contentGradients: (contentCard.backgroundImage.match(/linear-gradient/g) || []).length,
        trendBorder: trend.borderTopColor,
        tagClip: tag.clipPath,
        peakBorder: peak.borderTopColor,
        peakClip: peak.clipPath
      };
    });
    assert.equal(statsHudRules.contentBorder, "rgba(0, 0, 0, 0)", JSON.stringify(statsHudRules));
    assert.equal(statsHudRules.trendBorder, "rgba(0, 0, 0, 0)", JSON.stringify(statsHudRules));
    assert.ok(statsHudRules.contentGradients >= 2 && statsHudRules.tagClip.includes("polygon"), JSON.stringify(statsHudRules));
    assert.notEqual(statsHudRules.peakBorder, "rgba(0, 0, 0, 0)", JSON.stringify(statsHudRules));
    assert.equal(statsHudRules.peakClip, "none");
    assert.equal(await page.locator("#statsActMobileValue").innerText(), "Season 2026 Act 3");
    const statsLayoutGeometry = await page.locator("#page-stats .stats-layout").evaluate(layout => {
      const summary = layout.querySelector(".stats-summary-card").getBoundingClientRect();
      const summaryContent = layout.querySelector(".stats-summary-layout").getBoundingClientRect();
      const main = layout.querySelector(".stats-main-grid").getBoundingClientRect();
      const icon = layout.querySelector(".stats-proof-rank-icon").getBoundingClientRect();
      const bottomCards = [...layout.querySelectorAll(".stats-maps-card,.stats-agents-card,.stats-weapons-card")].map(card => card.getBoundingClientRect().toJSON());
      return { summary: summary.toJSON(), summaryContent: summaryContent.toJSON(), main: main.toJSON(), icon: icon.toJSON(), bottomCards, viewportHeight: innerHeight, scrollHeight: layout.scrollHeight, clientHeight: layout.clientHeight };
    });
    assert.ok(statsLayoutGeometry.main.top - statsLayoutGeometry.summary.bottom <= 12, JSON.stringify(statsLayoutGeometry));
    assert.ok(statsLayoutGeometry.summary.bottom - statsLayoutGeometry.summaryContent.bottom <= 10, JSON.stringify(statsLayoutGeometry));
    assert.ok(statsLayoutGeometry.summary.height <= 145, JSON.stringify(statsLayoutGeometry));
    assert.ok(statsLayoutGeometry.icon.width >= 50 && statsLayoutGeometry.icon.height >= 50, JSON.stringify(statsLayoutGeometry));
    assert.ok(statsLayoutGeometry.main.bottom <= statsLayoutGeometry.viewportHeight + 1, JSON.stringify(statsLayoutGeometry));
    assert.ok(statsLayoutGeometry.bottomCards.length === 3, JSON.stringify(statsLayoutGeometry));
    statsLayoutGeometry.bottomCards.forEach(card => {
      assert.ok(card.bottom <= statsLayoutGeometry.viewportHeight + 1, JSON.stringify(statsLayoutGeometry));
      assert.ok(card.height >= 390, JSON.stringify(statsLayoutGeometry));
    });
    const lowerStatsContent = await page.locator("#page-stats .stats-main-grid").evaluate(main => {
      const cardBottom = selector => main.querySelector(selector).getBoundingClientRect().bottom;
      const visibleCount = (selector, parentSelector) => {
        const bottom = cardBottom(parentSelector);
        return [...main.querySelectorAll(selector)].filter(item => item.getBoundingClientRect().bottom <= bottom + 1).length;
      };
      return {
        mapTotal: main.querySelectorAll(".stats-map-meta").length,
        mapVisible: visibleCount(".stats-map-meta", ".stats-maps-card"),
        mapImageCoverage: [...main.querySelectorAll(".stats-map-card")].map(card => {
          const cardRect = card.getBoundingClientRect();
          const imageRect = card.querySelector(".stats-map-image").getBoundingClientRect();
          return Math.max(Math.abs(cardRect.left - imageRect.left), Math.abs(cardRect.top - imageRect.top), Math.abs(cardRect.right - imageRect.right), Math.abs(cardRect.bottom - imageRect.bottom));
        }),
        mapMetaCoverage: [...main.querySelectorAll(".stats-map-card")].map(card => {
          const cardRect = card.getBoundingClientRect();
          const meta = card.querySelector(".stats-map-meta");
          const metaRect = meta.getBoundingClientRect();
          return {
            edgeDelta: Math.max(Math.abs(cardRect.left - metaRect.left), Math.abs(cardRect.right - metaRect.right), Math.abs(cardRect.bottom - metaRect.bottom)),
            background: getComputedStyle(meta).backgroundImage
          };
        }),
        agentTotal: main.querySelectorAll(".stats-agent-mini-image").length,
        agentVisible: visibleCount(".stats-agent-mini-image", ".stats-agents-card"),
        weaponTotal: main.querySelectorAll(".stats-weapons-card img").length,
        weaponVisible: visibleCount(".stats-weapons-card img", ".stats-weapons-card")
      };
    });
    assert.ok(lowerStatsContent.mapTotal > 0 && lowerStatsContent.agentTotal > 0 && lowerStatsContent.weaponTotal > 0, JSON.stringify(lowerStatsContent));
    assert.equal(lowerStatsContent.mapVisible, lowerStatsContent.mapTotal, JSON.stringify(lowerStatsContent));
    assert.ok(lowerStatsContent.mapImageCoverage.every(delta => delta <= 2), JSON.stringify(lowerStatsContent));
    assert.ok(lowerStatsContent.mapMetaCoverage.every(item => item.edgeDelta <= 2 && item.background.includes("linear-gradient")), JSON.stringify(lowerStatsContent));
    assert.ok(lowerStatsContent.agentVisible >= 8, JSON.stringify(lowerStatsContent));
    assert.equal(lowerStatsContent.weaponVisible, lowerStatsContent.weaponTotal, JSON.stringify(lowerStatsContent));
    const mapStatCard = page.locator("#page-stats .stats-map-card:not(.is-empty):not(.is-locked)").first();
    if (await mapStatCard.count()) {
      await mapStatCard.hover();
      assert.equal(await mapStatCard.evaluate(card => getComputedStyle(card).transform), "none");
    }
    const proofContainment = await page.locator("#page-stats .stats-proof-card").evaluate(card => {
      const parent = card.getBoundingClientRect();
      const items = [".stats-proof-card-head", ".stats-history-boundary-note", ".stats-proof-rank-row", ".stats-proof-note", ".stats-summary-selector-bottom"].map(selector => {
        const element = card.querySelector(selector);
        const rect = element.getBoundingClientRect();
        return { selector, hidden: getComputedStyle(element).display === "none", top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left, parentTop: parent.top, parentRight: parent.right, parentBottom: parent.bottom, parentLeft: parent.left };
      });
      return items;
    });
    proofContainment.forEach(item => {
      if (item.hidden) return;
      assert.ok(item.top >= item.parentTop - 1 && item.bottom <= item.parentBottom + 1 && item.left >= item.parentLeft - 1 && item.right <= item.parentRight + 1, JSON.stringify(item));
    });
    assert.ok(proofContainment[0].bottom <= proofContainment[1].top, JSON.stringify(proofContainment));
    assert.ok(proofContainment[3].hidden || proofContainment[1].bottom <= proofContainment[3].top + 1, JSON.stringify(proofContainment));
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
    await page.selectOption("#statsActSelector", { label: "Season 2026 Act 2" }, { force: true });
    await page.waitForTimeout(350);
    const weaponFamilyTones = await page.locator(".stats-desktop-weapon-family-meta").evaluateAll(items => items
      .filter(item => !item.textContent.includes("No Data"))
      .map(item => ({
        text: item.textContent.trim(),
        positive: item.classList.contains("stats-value-positive"),
        negative: item.classList.contains("stats-value-negative"),
        color: getComputedStyle(item).color
      })));
    assert.ok(weaponFamilyTones.some(item => item.positive && item.color === "rgb(34, 197, 94)"), JSON.stringify(weaponFamilyTones));
    assert.ok(weaponFamilyTones.some(item => item.negative && item.color === "rgb(255, 91, 105)"), JSON.stringify(weaponFamilyTones));
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(650);
    const compactStatsGeometry = await page.locator("#page-stats .stats-layout").evaluate(layout => ({
      viewportHeight: innerHeight,
      summaryHeight: layout.querySelector(".stats-summary-card").getBoundingClientRect().height,
      bottomCards: [...layout.querySelectorAll(".stats-maps-card,.stats-agents-card,.stats-weapons-card")].map(card => card.getBoundingClientRect().toJSON()),
      mapMeta: [...layout.querySelectorAll(".stats-map-meta")].map(item => item.getBoundingClientRect().toJSON()),
      mapCardBottom: layout.querySelector(".stats-maps-card").getBoundingClientRect().bottom,
      trendDetails: [...layout.querySelectorAll(".stats-trend-detail")].map(detail => {
        const style = getComputedStyle(detail);
        const rect = detail.getBoundingClientRect();
        const card = detail.closest(".stats-trend-card").getBoundingClientRect();
        return { bottom: rect.bottom, cardBottom: card.bottom, lineClamp: style.webkitLineClamp, overflow: style.overflow, textOverflow: style.textOverflow, fontWeight: Number(style.fontWeight) };
      }),
      fineStatWeights: [...layout.querySelectorAll(".stats-map-meta .stats-sub-text,.stats-agent-mini-meta .stats-sub-text,.stats-desktop-weapon-family-meta,.stats-weapon-mini")].map(item => Number(getComputedStyle(item).fontWeight))
    }));
    assert.ok(compactStatsGeometry.summaryHeight <= 130, JSON.stringify(compactStatsGeometry));
    compactStatsGeometry.bottomCards.forEach(card => assert.ok(card.bottom <= compactStatsGeometry.viewportHeight + 1, JSON.stringify(compactStatsGeometry)));
    compactStatsGeometry.mapMeta.forEach(item => assert.ok(item.bottom <= compactStatsGeometry.mapCardBottom + 1, JSON.stringify(compactStatsGeometry)));
    assert.ok(compactStatsGeometry.trendDetails.every(item => item.bottom <= item.cardBottom + 1 && item.lineClamp === "none" && item.overflow === "visible" && item.textOverflow === "clip" && item.fontWeight <= 500), JSON.stringify(compactStatsGeometry));
    assert.ok(compactStatsGeometry.fineStatWeights.length > 0 && compactStatsGeometry.fineStatWeights.every(weight => weight <= 500), JSON.stringify(compactStatsGeometry));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-compact-desktop-stats.png"), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(150);
    await page.locator('[data-page="insights"]').click();
    await page.waitForTimeout(250);
    const insightVisuals = await page.locator("#insightsList").evaluate(container => ({
      cards: container.querySelectorAll(".insight-card:not(.insight-empty)").length,
      visuals: container.querySelectorAll(".insight-card:not(.insight-empty) .coaching-category-visual").length
    }));
    assert.ok(insightVisuals.cards > 0, JSON.stringify(insightVisuals));
    assert.equal(insightVisuals.visuals, insightVisuals.cards, JSON.stringify(insightVisuals));
    const clutchInsight = page.locator("#insightsList .insight-card-clutch-closing");
    assert.equal(await clutchInsight.count(), 1);
    await clutchInsight.evaluate(card => card.scrollIntoView({ block: "start" }));
    const clutchGeometry = await clutchInsight.evaluate(card => {
      const host = card.closest(".insights-top-card");
      const layout = card.closest(".insights-layout");
      const list = card.closest(".insights-list");
      const title = card.querySelector(".insight-title");
      const visual = card.querySelector(".coaching-category-visual");
      const meta = card.querySelector(".insight-meta-row");
      const cardRect = card.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const visualRect = visual.getBoundingClientRect();
      const metaRect = meta.getBoundingClientRect();
      const visibleCardCount = [...list.querySelectorAll(".insight-card:not(.insight-empty)")]
        .map(item => item.getBoundingClientRect())
        .filter(rect => rect.bottom > listRect.top + 1 && rect.top < listRect.bottom - 1).length;
      const mutedProbe = document.createElement("span");
      mutedProbe.style.color = "var(--text-muted, #a8b3c7)";
      document.body.appendChild(mutedProbe);
      const mutedColor = getComputedStyle(mutedProbe).color;
      mutedProbe.remove();
      return {
        cardBottom: cardRect.bottom,
        cardRect: cardRect.toJSON(),
        cardDisplay: getComputedStyle(card).display,
        cardColumns: getComputedStyle(card).gridTemplateColumns,
        cardRows: getComputedStyle(card).gridTemplateRows,
        headerDisplay: getComputedStyle(card.querySelector(".insight-header")).display,
        hostTop: hostRect.top,
        hostBottom: hostRect.bottom,
        hostHeight: hostRect.height,
        layoutBottom: layoutRect.bottom,
        followingCardTops: [...document.querySelectorAll("#page-insights .insights-action-card,#page-insights .insights-trends-card")]
          .map(item => item.getBoundingClientRect().top)
          .filter(top => top > cardRect.top),
        listBottom: listRect.bottom,
        listScrollTop: list.scrollTop,
        listScrollHeight: list.scrollHeight,
        listClientHeight: list.clientHeight,
        listPaddingBottom: getComputedStyle(list).paddingBottom,
        titleLeft: titleRect.left,
        expectedTextLeft: cardRect.left + parseFloat(getComputedStyle(card).paddingLeft),
        titleColor: getComputedStyle(title).color,
        mutedColor,
        visualRight: visualRect.right,
        visualBottom: visualRect.bottom,
        visualTop: visualRect.top,
        visualGridRow: getComputedStyle(visual).gridRow,
        tagCount: card.querySelectorAll(".insight-tag").length,
        metaTop: metaRect.top,
        metaBottom: metaRect.bottom,
        metaGridRow: getComputedStyle(meta).gridRow,
        visibleCardCount,
        transform: getComputedStyle(card).transform
      };
    });
    assert.ok(clutchGeometry.cardBottom <= clutchGeometry.listBottom + 1, JSON.stringify(clutchGeometry));
    assert.ok(Math.abs(clutchGeometry.titleLeft - clutchGeometry.expectedTextLeft) <= 1, JSON.stringify(clutchGeometry));
    assert.equal(clutchGeometry.titleColor, clutchGeometry.mutedColor);
    assert.equal(clutchGeometry.tagCount, 0, JSON.stringify(clutchGeometry));
    assert.ok(clutchGeometry.visualRight <= clutchGeometry.cardRect.right && clutchGeometry.visualTop <= clutchGeometry.metaTop, JSON.stringify(clutchGeometry));
    assert.ok(clutchGeometry.metaTop >= clutchGeometry.visualBottom - 1, JSON.stringify(clutchGeometry));
    assert.ok(clutchGeometry.hostHeight <= 272, JSON.stringify(clutchGeometry));
    assert.equal(clutchGeometry.visibleCardCount, 1, JSON.stringify(clutchGeometry));
    assert.equal(clutchGeometry.transform, "none");
    assert.equal(await clutchInsight.locator(".insight-feedback-row").count(), 0);
    await clutchInsight.screenshot({ path: path.join(__dirname, "tmp", "qol-clutch-closing-card.png") });
    await clutchInsight.hover();
    await page.waitForTimeout(250);
    assert.equal(await clutchInsight.evaluate(card => getComputedStyle(card).transform), "none");
    await clutchInsight.click();
    await page.waitForTimeout(350);
    const expandedInsight = await clutchInsight.evaluate(card => {
      const host = card.closest(".insights-top-card");
      const list = card.closest(".insights-list");
      const expand = card.querySelector(".insight-expand");
      const preview = card.querySelector(".insight-preview");
      const visual = card.querySelector(".coaching-category-visual");
      const title = card.querySelector(".insight-title");
      const meta = card.querySelector(".insight-meta-row");
      const followingCards = [...document.querySelectorAll("#page-insights .insights-action-card,#page-insights .insights-trends-card")];
      const layout = card.closest(".insights-layout");
      const shell = card.closest(".insights-top-shell");
      const cardRect = card.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      const listRect = list.getBoundingClientRect();
      const previewRect = preview.getBoundingClientRect();
      const visualRect = visual.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const metaRect = meta.getBoundingClientRect();
      return {
        open: card.classList.contains("open"),
        cardBottom: cardRect.bottom,
        hostBottom: hostRect.bottom,
        listBottom: listRect.bottom,
        followingCardTops: followingCards
          .map(item => item.getBoundingClientRect().top)
          .filter(top => top > cardRect.top),
        layout: {
          rect: layout.getBoundingClientRect().toJSON(),
          gridTemplateRows: getComputedStyle(layout).gridTemplateRows,
          height: getComputedStyle(layout).height,
          overflow: getComputedStyle(layout).overflow
        },
        shell: {
          rect: shell.getBoundingClientRect().toJSON(),
          height: getComputedStyle(shell).height,
          overflow: getComputedStyle(shell).overflow
        },
        sections: [...layout.children].map(item => ({
          className: item.className,
          rect: item.getBoundingClientRect().toJSON(),
          gridRow: getComputedStyle(item).gridRow,
          height: getComputedStyle(item).height,
          overflow: getComputedStyle(item).overflow
        })),
        cardRect: cardRect.toJSON(),
        hostRect: hostRect.toJSON(),
        listRect: listRect.toJSON(),
        expandDisplay: getComputedStyle(expand).display,
        expandRect: expand.getBoundingClientRect().toJSON(),
        expandBlocks: [...expand.querySelectorAll(".insight-block")].map(block => block.getBoundingClientRect().toJSON()),
        previewDisplay: getComputedStyle(preview).display,
        previewRight: previewRect.right,
        visualLeft: visualRect.left,
        visualRight: visualRect.right,
        visualTop: visualRect.top,
        visualBottom: visualRect.bottom,
        titleLeft: titleRect.left,
        titleBottom: titleRect.bottom,
        tagCount: card.querySelectorAll(".insight-tag").length,
        metaTop: metaRect.top,
        metaBottom: metaRect.bottom,
        cardMidpoint: cardRect.left + cardRect.width / 2,
        borderBottomWidth: parseFloat(getComputedStyle(card).borderBottomWidth),
        borderBottomColor: getComputedStyle(card).borderBottomColor,
        overflow: getComputedStyle(card).overflow
      };
    });
    assert.ok(expandedInsight.open && expandedInsight.cardBottom <= expandedInsight.hostBottom + 1, JSON.stringify(expandedInsight));
    assert.ok(expandedInsight.cardBottom <= expandedInsight.listBottom + 1, JSON.stringify(expandedInsight));
    assert.ok(Math.abs(expandedInsight.cardRect.height - clutchGeometry.cardRect.height) <= 1, JSON.stringify({ clutchGeometry, expandedInsight }));
    assert.ok(expandedInsight.followingCardTops.every(top => expandedInsight.cardBottom + 6 <= top), JSON.stringify(expandedInsight));
    assert.ok(Math.abs(expandedInsight.hostRect.top - clutchGeometry.hostTop) <= 1 && Math.abs(expandedInsight.hostRect.bottom - clutchGeometry.hostBottom) <= 1, JSON.stringify({ clutchGeometry, expandedInsight }));
    assert.ok(expandedInsight.followingCardTops.length === clutchGeometry.followingCardTops.length && expandedInsight.followingCardTops.every((top, index) => Math.abs(top - clutchGeometry.followingCardTops[index]) <= 4), JSON.stringify({ clutchGeometry, expandedInsight }));
    assert.ok(expandedInsight.borderBottomWidth >= 1 && expandedInsight.borderBottomColor !== "rgba(0, 0, 0, 0)", JSON.stringify(expandedInsight));
    assert.equal(expandedInsight.tagCount, 0, JSON.stringify(expandedInsight));
    assert.ok(expandedInsight.titleLeft < expandedInsight.visualLeft && expandedInsight.visualRight <= expandedInsight.cardRect.right, JSON.stringify(expandedInsight));
    assert.ok(expandedInsight.metaTop >= expandedInsight.visualBottom - 1, JSON.stringify(expandedInsight));
    assert.equal(expandedInsight.expandDisplay, "grid");
    assert.equal(expandedInsight.previewDisplay, "none");
    assert.equal(expandedInsight.expandBlocks.length, 3);
    assert.ok(expandedInsight.expandBlocks.every(block => block.left >= expandedInsight.cardRect.left && block.right <= expandedInsight.cardRect.right && block.top >= expandedInsight.cardRect.top && block.bottom <= expandedInsight.cardRect.bottom), JSON.stringify(expandedInsight));
    assert.equal(await clutchInsight.locator(".insight-feedback-row").count(), 0);
    await clutchInsight.screenshot({ path: path.join(__dirname, "tmp", "qol-clutch-closing-expanded.png") });
    const trendMedia = await page.locator("#page-insights .trend-signal-media").evaluateAll(items => items.map(item => ({
      visible: item.getBoundingClientRect().width > 0 && item.getBoundingClientRect().height > 0,
      populated: Boolean(item.querySelector("img,svg,.trend-signal-media-label"))
    })));
    assert.ok(trendMedia.length > 0 && trendMedia.every(item => item.populated), JSON.stringify(trendMedia));
    assert.ok(trendMedia.some(item => item.visible), JSON.stringify(trendMedia));
    const filterState = await page.locator(".insight-filter-btn").evaluateAll(buttons => buttons.map(button => ({ filter: button.dataset.filter, disabled: button.disabled })));
    assert.equal(filterState.find(item => item.filter === "all")?.disabled, false);
    assert.deepEqual(filterState.map(item => item.filter), ["all", "bad", "warn", "good"]);
    const insightHudRules = await page.evaluate(() => {
      const card = getComputedStyle(document.querySelector("#insightsList .insight-card"));
      const filter = getComputedStyle(document.querySelector(".insight-filter-btn"));
      const meta = getComputedStyle(document.querySelector("#insightsList .insight-meta-pill"));
      const label = getComputedStyle(document.querySelector("#insightsList .insight-label"), "::before");
      return {
        cardBorder: card.borderTopColor,
        cardGradients: (card.backgroundImage.match(/linear-gradient/g) || []).length,
        filterClip: filter.clipPath,
        metaClip: meta.clipPath,
        labelTick: label.backgroundImage
      };
    });
    assert.notEqual(insightHudRules.cardBorder, "rgba(0, 0, 0, 0)", JSON.stringify(insightHudRules));
    assert.ok(insightHudRules.cardGradients >= 1 && insightHudRules.filterClip.includes("polygon") && insightHudRules.metaClip.includes("polygon"), JSON.stringify(insightHudRules));
    assert.match(insightHudRules.labelTick, /linear-gradient/);
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
    const openBlur = Number.parseFloat(openBackdrop.match(/blur\(([\d.]+)px\)/)?.[1] || "0");
    assert.ok(openBlur >= 11.9, openBackdrop);
    await page.locator("#accountSupportModal").click({ position: { x: 2, y: 2 } });
    assert.equal(await page.locator("#accountSupportModal").evaluate(modal => modal.classList.contains("is-closing")), true);
    await page.waitForTimeout(180);
    const closingBackdrop = await page.locator("#accountSupportModal").evaluate(modal => getComputedStyle(modal).backdropFilter || getComputedStyle(modal).webkitBackdropFilter);
    const closingBlur = Number.parseFloat(closingBackdrop.match(/blur\(([\d.]+)px\)/)?.[1] || "0");
    assert.ok(closingBlur < 12, closingBackdrop);
    await page.waitForFunction(() => document.getElementById("accountSupportModal")?.getAttribute("aria-hidden") === "true");

    await page.locator('[data-page="logging"]').click();
    await page.waitForTimeout(650);
    const loggingHudRules = await page.evaluate(() => {
      const hero = getComputedStyle(document.querySelector(".logging-hero"));
      const liveTag = getComputedStyle(document.querySelector(".logging-live-pill"));
      const input = getComputedStyle(document.querySelector("#logFocusSelect"));
      return {
        heroBorder: hero.borderTopColor,
        heroGradients: (hero.backgroundImage.match(/linear-gradient/g) || []).length,
        tagClip: liveTag.clipPath,
        inputClip: input.clipPath
      };
    });
    assert.equal(loggingHudRules.heroBorder, "rgba(0, 0, 0, 0)", JSON.stringify(loggingHudRules));
    assert.ok(loggingHudRules.heroGradients >= 2 && loggingHudRules.tagClip.includes("polygon"), JSON.stringify(loggingHudRules));
    assert.equal(loggingHudRules.inputClip, "none");
    await page.locator(".logging-hero").screenshot({ path: path.join(__dirname, "tmp", "hud-logging-session-debrief.png") });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.click("#dailyWarmupSkip").catch(() => {});
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="stats"]').click();
    await page.waitForFunction(() => document.getElementById("page-stats")?.getAnimations().some(animation => animation.id === "rankedcoach-page-button-slide"));
    await page.waitForTimeout(400);
    await page.locator('#mobileStatsTabs [data-mobile-stats-view="maps"]').click();
    await page.waitForTimeout(150);
    const mobileMapCoverage = await page.locator("#page-stats .stats-map-card").evaluateAll(cards => cards.map(card => {
      const cardRect = card.getBoundingClientRect();
      const imageRect = card.querySelector(".stats-map-image").getBoundingClientRect();
      const meta = card.querySelector(".stats-map-meta");
      const metaRect = meta.getBoundingClientRect();
      return {
        imageDelta: Math.max(Math.abs(cardRect.left - imageRect.left), Math.abs(cardRect.top - imageRect.top), Math.abs(cardRect.right - imageRect.right), Math.abs(cardRect.bottom - imageRect.bottom)),
        metaDelta: Math.max(Math.abs(cardRect.left - metaRect.left), Math.abs(cardRect.right - metaRect.right), Math.abs(cardRect.bottom - metaRect.bottom)),
        background: getComputedStyle(meta).backgroundImage
      };
    }));
    assert.ok(mobileMapCoverage.length > 0 && mobileMapCoverage.every(item => item.imageDelta <= 2 && item.metaDelta <= 2 && item.background.includes("linear-gradient")), JSON.stringify(mobileMapCoverage));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-map-fade.png"), fullPage: true });
    const mobilePeakGeometry = await page.locator("#page-stats .stats-proof-card").evaluate(card => {
      const parent = card.getBoundingClientRect();
      const visual = card.querySelector(".stats-peak-visual").getBoundingClientRect();
      const details = card.querySelector(".stats-peak-details").getBoundingClientRect();
      const selector = card.querySelector(".stats-summary-selector-bottom").getBoundingClientRect();
      const rankRow = card.querySelector(".stats-proof-rank-row").getBoundingClientRect();
      const rankIcon = card.querySelector(".stats-proof-rank-icon").getBoundingClientRect();
      return { parent: parent.toJSON(), visual: visual.toJSON(), details: details.toJSON(), selector: selector.toJSON(), rankRow: rankRow.toJSON(), rankIcon: rankIcon.toJSON() };
    });
    assert.ok(mobilePeakGeometry.visual.left < mobilePeakGeometry.details.left && mobilePeakGeometry.visual.right <= mobilePeakGeometry.details.left + 1, JSON.stringify(mobilePeakGeometry));
    assert.ok(Math.abs(mobilePeakGeometry.visual.width - mobilePeakGeometry.details.width) <= 12, JSON.stringify(mobilePeakGeometry));
    assert.ok(mobilePeakGeometry.selector.top >= Math.max(mobilePeakGeometry.visual.bottom, mobilePeakGeometry.details.bottom) - 1 && mobilePeakGeometry.selector.bottom <= mobilePeakGeometry.parent.bottom + 1, JSON.stringify(mobilePeakGeometry));
    assert.ok(mobilePeakGeometry.selector.width >= mobilePeakGeometry.parent.width - 24, JSON.stringify(mobilePeakGeometry));
    assert.ok(mobilePeakGeometry.rankIcon.width >= mobilePeakGeometry.visual.width * .62 && mobilePeakGeometry.rankRow.height >= mobilePeakGeometry.visual.height * .66, JSON.stringify(mobilePeakGeometry));
    const mobileActWidth = await page.locator("#page-stats .stats-act-select-wrap").evaluate(wrap => {
      const parent = wrap.getBoundingClientRect();
      const trigger = wrap.querySelector(".stats-act-mobile-trigger").getBoundingClientRect();
      const value = wrap.querySelector("#statsActMobileValue").getBoundingClientRect();
      return { parent: parent.toJSON(), trigger: trigger.toJSON(), value: value.toJSON() };
    });
    assert.ok(mobileActWidth.trigger.width >= mobileActWidth.parent.width * .94 && mobileActWidth.value.width >= mobileActWidth.trigger.width * .70, JSON.stringify(mobileActWidth));
    await page.locator("#page-stats .stats-proof-card").screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-stats-proof-card.png") });
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="home"]').click();
    await page.waitForFunction(() => document.getElementById("page-home")?.classList.contains("is-current-page"));
    await page.locator("#impactRolePill").click();
    await page.locator("#lensModalOverlay.active").waitFor({ state: "visible" });
    assert.equal(await page.locator(".impact-opportunity-panel").isVisible(), false);
    await page.locator("#impactOpportunityTab").click();
    await page.locator(".impact-opportunity-panel").waitFor({ state: "visible" });
    const mobileOpportunityGeometry = await page.locator(".impact-opportunity-panel").evaluate(panel => {
      const rect = panel.getBoundingClientRect();
      return { rect: rect.toJSON(), viewport: { width: innerWidth, height: innerHeight }, cards: panel.querySelectorAll(".impact-opportunity-item").length };
    });
    assert.ok(mobileOpportunityGeometry.cards === 3 && mobileOpportunityGeometry.rect.left >= 0 && mobileOpportunityGeometry.rect.right <= mobileOpportunityGeometry.viewport.width && mobileOpportunityGeometry.rect.bottom <= mobileOpportunityGeometry.viewport.height, JSON.stringify(mobileOpportunityGeometry));
    await page.locator("#lensModalOverlay").click({ position: { x: 2, y: 2 } });
    await page.locator("#lensModalOverlay").waitFor({ state: "hidden" });
    await page.locator('.graph-btn[data-size="all"]').click();
    await page.waitForTimeout(350);
    const mobileLifetimeGeometry = await page.locator(".rr-chart-card").evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const chartWrap = card.querySelector(".home-chart-wrap").getBoundingClientRect();
      const svg = card.querySelector("#chartRow svg");
      const svgRect = svg.getBoundingClientRect();
      const xAxis = [...svg.querySelectorAll('line[stroke="#94a3b8"]')].find(line => line.getAttribute("y1") === line.getAttribute("y2"));
      const title = card.querySelector(".chart-axis-title").getBoundingClientRect();
      const legend = card.querySelector(".chart-axis-legend").getBoundingClientRect();
      const controls = card.querySelector(".graph-controls, .graph-buttons, .rr-graph-controls") || card.querySelector('.graph-btn[data-size="5"]')?.parentElement;
      const controlsRect = controls.getBoundingClientRect();
      const rankLabels = [...card.querySelectorAll(".chart-rank-axis-icon image")].map(label => label.getBoundingClientRect());
      return {
        cardLeft: cardRect.left,
        cardRight: cardRect.right,
        chartWidth: chartWrap.width,
        svgWidth: svgRect.width,
        plotWidth: xAxis ? Number(xAxis.getAttribute("x2")) - Number(xAxis.getAttribute("x1")) : 0,
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
    assert.ok(mobileLifetimeGeometry.chartWidth >= mobileLifetimeGeometry.cardRight - mobileLifetimeGeometry.cardLeft - 36, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.plotWidth >= mobileLifetimeGeometry.svgWidth * .78, JSON.stringify(mobileLifetimeGeometry));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-lifetime-rank-chart.png"), fullPage: true });

    assert.deepEqual(consoleIssues, []);
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
