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
      if (relativePath === "/api/content/playlist") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ patchLabel: "13.01", patchTag: "", newThisWeek: 0, items: [] }));
        return;
      }
      if (relativePath === "/api/content/skin-media") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ matches: {} }));
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
      const todayKey = new Date().toISOString().slice(0, 10);
      const matches = Array.from({ length: 25 }, (_item, index) => ({
        id: `retained-${index}`,
        matchId: `retained-${index}`,
        source: "henrik_sync",
        rank: "Diamond 2",
        rrTotal: 54,
        result: index % 2 ? "loss" : "win",
        season: index === 24 ? "season-2026-act-4" : "season-2026-act-3",
        act: index === 24 ? "Season 2026 Act 4" : "Season 2026 Act 3",
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
            trackedPlayer: { puuid: "qol-test-puuid", teammatePuuids: ["ally-puuid"], opponentPuuids: ["enemy-puuid", "enemy-puuid-2", "enemy-puuid-3"] },
            roundByRound: [{
              roundNum: 1,
              side: "attack",
              won: index < 1,
              roundCeremony: "CeremonyCloser",
              damageDealt: 120,
              kills: [{
                killer: "enemy-puuid",
                victim: "ally-puuid",
                roundTime: 500
              }, {
                killer: "qol-test-puuid",
                victim: "enemy-puuid",
                roundTime: 1000
              }, ...(index < 1 ? [{
                killer: "qol-test-puuid",
                victim: "enemy-puuid-2",
                roundTime: 1500
              }, {
                killer: "qol-test-puuid",
                victim: "enemy-puuid-3",
                roundTime: 2000
              }] : [{
                killer: "qol-test-puuid",
                victim: "enemy-puuid-2",
                roundTime: 1500
              }, {
                killer: "enemy-puuid-3",
                victim: "qol-test-puuid",
                roundTime: 2000
              }])]
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
          season: index === 24 ? "season-2026-act-4" : "season-2026-act-3",
          act: index === 24 ? "Season 2026 Act 4" : "Season 2026 Act 3",
          demoAct: index === 24 ? "Season 2026 Act 4" : "Season 2026 Act 3",
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
        lastWarmupPromptDate: todayKey,
        goalRank: "Gold 1",
        startingRR: 0,
        matches,
        trackerAnalytics: { currentAct: "Season 2026 Act 4", acts: ["Season 2026 Act 4", "Season 2026 Act 3"] }
      }]));
      localStorage.setItem(`valtracker_daily_warmup_prompt_v1:${profileId}`, todayKey);
      localStorage.setItem("valtracker_logs_v1", "[]");
    });

    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);
    await page.click("#dailyWarmupSkip").catch(() => {});
    await page.evaluate(() => {
      ["authModal", "loginInitOverlay", "dailyWarmupModal"].forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        element.classList.remove("active");
        element.setAttribute("aria-hidden", "true");
      });
      document.body.classList.remove("modal-open", "is-modal-open");
    });

    const focusOptions = await page.locator("#logFocusSelect option").evaluateAll(options => options.map(option => option.value));
    // Fixed coaching categories plus the manual-only General and Other paths.
    assert.equal(focusOptions.length, 13, JSON.stringify(focusOptions));
    assert.equal(new Set(focusOptions).size, focusOptions.length, JSON.stringify(focusOptions));
    assert.deepEqual(focusOptions, [
      "",
      "Crosshair Placement",
      "Trading",
      "Movement",
      "Utility Usage",
      "Map Awareness",
      "Credit/Ult Economy",
      "Communication",
      "Discipline",
      "Map Strategy",
      "Behavior Composure",
      "General",
      "Other"
    ]);

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
    await page.locator("#profileRatingWidget").evaluate(button => button.click());
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
    await page.locator("#profileRatingWidget").evaluate(button => button.click());
    await page.evaluate(() => {
      ["authModal", "loginInitOverlay", "dailyWarmupModal", "profileRatingModal"].forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        element.classList.remove("active");
        element.setAttribute("aria-hidden", "true");
      });
      document.body.classList.remove("modal-open", "is-modal-open");
    });

    // The Compass description is an alternate reading view: opening it must
    // replace the score pills/radar rather than squeeze text above them.
    const compassToggle = page.locator("#compassDescriptionToggle");
    await compassToggle.waitFor({ state: "visible" });
    await compassToggle.evaluate(button => button.click());
    const compassDescriptionView = await page.locator(".compass-summary-shell").evaluate(shell => {
      const top = shell.querySelector(".compass-summary-top-shell");
      const bottom = shell.querySelector(".compass-summary-bottom-shell");
      const description = shell.querySelector("#compassProfileDescription");
      return {
        expanded: shell.classList.contains("is-expanded"),
        topDisplay: getComputedStyle(top).display,
        bottomDisplay: getComputedStyle(bottom).display,
        descriptionDisplay: getComputedStyle(description).display,
        topHeight: top.getBoundingClientRect().height,
        shellHeight: shell.getBoundingClientRect().height
      };
    });
    assert.equal(compassDescriptionView.expanded, true, JSON.stringify(compassDescriptionView));
    assert.equal(compassDescriptionView.bottomDisplay, "none", JSON.stringify(compassDescriptionView));
    assert.equal(compassDescriptionView.descriptionDisplay, "block", JSON.stringify(compassDescriptionView));
    assert.ok(compassDescriptionView.topHeight >= compassDescriptionView.shellHeight * .9, JSON.stringify(compassDescriptionView));
    await compassToggle.evaluate(button => button.click());
    assert.equal(await compassToggle.getAttribute("aria-expanded"), "false");

    await page.locator("#impactRolePill").evaluate(button => button.click());
    await page.locator("#lensModalOverlay.active").waitFor({ state: "visible" });
    assert.equal((await page.locator("#lensModalWeightingTitle").textContent()).trim(), "Score Category Weights");
    assert.equal((await page.locator("#lensModalStatsTitle").textContent()).trim(), "Impact Category Scores");
    assert.equal(await page.locator("#lensWeightingToggle").getAttribute("aria-expanded"), "false");
    assert.equal(await page.locator("#lensWeightingBlock").isHidden(), true);
    await page.locator("#lensWeightingToggle").click();
    assert.equal(await page.locator("#lensWeightingToggle").getAttribute("aria-expanded"), "true");
    assert.equal(await page.locator("#lensWeightingBlock").isVisible(), true);
    assert.equal(await page.locator("#impactOpportunityTab").evaluate(button => button.parentElement?.classList.contains("lens-modal-subtitle-row")), true);
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
    await page.waitForTimeout(450);
    const opportunityGeometry = await page.locator("#impactOpportunityPullout").evaluate(pullout => {
      const panel = pullout.querySelector(".impact-opportunity-panel").getBoundingClientRect();
      const modal = pullout.closest(".impact-report-modal").getBoundingClientRect();
      const header = pullout.querySelector(".impact-opportunity-head").getBoundingClientRect();
      const close = pullout.querySelector("#impactOpportunityClose").getBoundingClientRect();
      return { panel: panel.toJSON(), modal: modal.toJSON(), header: header.toJSON(), close: close.toJSON(), viewport: { width: innerWidth, height: innerHeight } };
    });
    assert.ok(opportunityGeometry.panel.left >= 0 && opportunityGeometry.panel.right <= opportunityGeometry.viewport.width && opportunityGeometry.panel.top >= 0 && opportunityGeometry.panel.bottom <= opportunityGeometry.viewport.height, JSON.stringify(opportunityGeometry));
    assert.ok(Math.abs((opportunityGeometry.close.top + opportunityGeometry.close.bottom) / 2 - (opportunityGeometry.header.top + opportunityGeometry.header.bottom) / 2) <= 1, JSON.stringify(opportunityGeometry));
    fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
    await page.locator("#lensModalOverlay .impact-report-modal").screenshot({ path: path.join(__dirname, "tmp", "qol-impact-score-opportunities.png") });
    await page.locator("#impactOpportunityClose").click();
    assert.equal(await page.locator("#impactOpportunityTab").getAttribute("aria-expanded"), "false");
    assert.equal(await page.locator("#impactOpportunityClose").isHidden(), true);
    await page.locator("#lensModalOverlay").click({ position: { x: 2, y: 2 } });
    await page.locator("#lensModalOverlay").waitFor({ state: "hidden" });

    await page.locator('.graph-btn[data-size="all"]').click();
    await page.waitForTimeout(350);
    const axisTitle = await page.locator(".chart-axis-title").textContent();
    assert.match(axisTitle, /Games from Today's session|Games from Season 2026 Act 4|Matches since Jun 1, 2026/i);
    const lifetimeLabels = await page.locator(".chart-lifetime-date-label").allTextContents();
    if (/Matches since Jun 1, 2026/i.test(axisTitle || "")) {
      assert.deepEqual(lifetimeLabels, ["Jun 1, 2026", "Jun 25, 2026"]);
    } else {
      assert.deepEqual(lifetimeLabels, []);
    }
    const lifetimeRankIcons = await page.locator("#chartRow .chart-rank-axis-icon").evaluateAll(groups => groups.map(group => ({
      label: group.getAttribute("aria-label"),
      href: group.querySelector("image")?.getAttribute("href") || ""
    })));
    if (/Matches since Jun 1, 2026/i.test(axisTitle || "")) {
      assert.ok(lifetimeRankIcons.length >= 3, JSON.stringify(lifetimeRankIcons));
      assert.ok(lifetimeRankIcons.some(icon => /Diamond/i.test(icon.label) && icon.href), JSON.stringify(lifetimeRankIcons));
    }
    const lifetimeRankIconBoxes = await page.locator("#chartRow .chart-rank-axis-icon image").evaluateAll(images => images.map(image => image.getBoundingClientRect()).sort((left, right) => left.top - right.top).map(rect => ({ top: rect.top, bottom: rect.bottom, height: rect.height })));
    if (lifetimeRankIconBoxes.length) {
      assert.ok(lifetimeRankIconBoxes.every((box, index) => index === 0 || box.top >= lifetimeRankIconBoxes[index - 1].bottom - 1), JSON.stringify(lifetimeRankIconBoxes));
    }
    if (/Matches since Jun 1, 2026/i.test(axisTitle || "")) {
      assert.match(await page.locator("#chartRow .chart-season-boundary").first().textContent(), /V26\s*A2/is);
    }

    const chartGeometry = await page.locator(".rr-chart-card").evaluate(card => {
      const chartWrap = card.querySelector(".home-chart-wrap").getBoundingClientRect();
      const title = card.querySelector(".chart-axis-title").getBoundingClientRect();
      const legend = card.querySelector(".chart-axis-legend").getBoundingClientRect();
      const dateTicks = [...card.querySelectorAll(".chart-lifetime-date-label")]
        .map(element => element.getBoundingClientRect());
      const footer = document.getElementById("siteFooter").getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return {
        tickBottom: dateTicks.length ? Math.max(...dateTicks.map(rect => rect.bottom)) : null,
        titleTop: title.top,
        titleBottom: title.bottom,
        legendTop: legend.top,
        legendBottom: legend.bottom,
        wrapBottom: chartWrap.bottom,
        cardBottom: cardRect.bottom,
        footerTop: footer.top
      };
    });
    if (chartGeometry.tickBottom !== null) {
      assert.ok(chartGeometry.tickBottom < chartGeometry.titleTop, JSON.stringify(chartGeometry));
    }
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
    assert.deepEqual(desktopPageMotion, { direction: "forward", outgoing: false, incoming: true });
    await page.waitForTimeout(650);
    assert.equal(await page.locator("#statKAST").count(), 1);
    assert.equal(await page.locator("#statACS").count(), 1);
    assert.equal(await page.locator("#statMatchesPlayed").count(), 1);
    assert.match(await page.locator("#statsHistoryBoundaryNote").innerText(), /Riot's upstream match-history feed.*active retention limit of roughly 2 years.*available history begins Jun 1, 2026/is);
    const breakdownVisuals = await page.locator("#statsBreakdown").evaluate(container => ({
      cards: container.querySelectorAll(".stats-breakdown-cardlet").length,
      visuals: container.querySelectorAll(".stats-data-visual,.stats-confidence-visual,.coaching-category-visual").length
    }));
    assert.ok(breakdownVisuals.cards > 0 && breakdownVisuals.visuals === breakdownVisuals.cards, JSON.stringify(breakdownVisuals));
    const roleStatContext = await page.locator("#page-stats .stats-role-pill:not(.is-empty)").first().evaluate(pill => ({
      divider: Boolean(pill.querySelector(".stats-role-pill-divider")),
      games: pill.querySelector(".stats-role-pill-games")?.textContent || ""
    }));
    assert.equal(roleStatContext.divider, true, JSON.stringify(roleStatContext));
    assert.match(roleStatContext.games, /\d+\s*games?/i);
    assert.ok(await page.locator("#page-stats .stats-map-games").count() > 0);
    const statsMapPoolState = await page.locator("#statsMapsList").evaluate(container => {
      const cards = [...container.querySelectorAll(".stats-map-card")];
      return {
        total: cards.length,
        active: cards.filter(card => card.dataset.activePool === "true").map(card => card.querySelector(".stats-main-text")?.textContent?.trim()),
        out: cards.filter(card => card.dataset.activePool === "false").map(card => card.querySelector(".stats-main-text")?.textContent?.trim()),
        outNoDataTags: cards.filter(card => card.dataset.activePool === "false" && card.querySelector(".stats-map-no-data-tag")).length,
        outBadges: cards.filter(card => card.querySelector(".stats-map-out-badge")).length,
        outNamesCentered: cards.filter(card => card.dataset.activePool === "false").every(card => {
          const cardRect = card.getBoundingClientRect();
          const label = card.querySelector(".stats-map-out-name")?.getBoundingClientRect();
          return label && Math.abs((label.left + label.right) / 2 - (cardRect.left + cardRect.right) / 2) <= 2;
        }),
        summitImage: cards.find(card => card.querySelector(".stats-main-text")?.textContent?.trim() === "Summit")?.querySelector(".stats-map-image")?.getAttribute("src") || "",
        activeNoDataTags: cards.filter(card => card.dataset.activePool === "true" && card.dataset.hasData === "false" && card.querySelector(".stats-map-no-data-tag")).length,
        excludedCrosses: cards.filter(card => card.dataset.activePool === "false" && card.querySelector(".stats-map-excluded-x")).length,
        resultLineDetails: cards.filter(card => card.dataset.activePool === "true" && card.dataset.hasData === "true").map(card => {
          const cardRect = card.getBoundingClientRect();
          const line = card.querySelector(".stats-map-result-line")?.getBoundingClientRect();
          const children = [...card.querySelectorAll(".stats-map-result-line > *")].map(item => item.getBoundingClientRect());
          return {
            map: card.querySelector(".stats-main-text")?.textContent?.trim(),
            card: cardRect.toJSON(),
            line: line?.toJSON(),
            children: children.map(child => child.toJSON()),
            display: line ? getComputedStyle(card.querySelector(".stats-map-result-line")).display : ""
          };
        }),
        resultLineCentered: cards.filter(card => card.dataset.activePool === "true" && card.dataset.hasData === "true").every(card => {
          const cardRect = card.getBoundingClientRect();
          const children = [...card.querySelectorAll(".stats-map-result-line > *")].map(item => item.getBoundingClientRect());
          if (children.length !== 2) return false;
          const groupLeft = Math.min(...children.map(child => child.left));
          const groupRight = Math.max(...children.map(child => child.right));
          return children.every(child => child.left >= cardRect.left - 1 && child.right <= cardRect.right + 1)
            && Math.abs((groupLeft + groupRight) / 2 - (cardRect.left + cardRect.right) / 2) <= 5;
        })
      };
    });
    assert.equal(statsMapPoolState.total, 13, JSON.stringify(statsMapPoolState));
    assert.deepEqual([...statsMapPoolState.active].sort(), ["Ascent", "Breeze", "Haven", "Lotus", "Split", "Summit", "Sunset"]);
    assert.deepEqual([...statsMapPoolState.out].sort(), ["Abyss", "Bind", "Corrode", "Fracture", "Icebox", "Pearl"]);
    assert.equal(statsMapPoolState.outNoDataTags, 0, JSON.stringify(statsMapPoolState));
    assert.equal(statsMapPoolState.outBadges, 0, JSON.stringify(statsMapPoolState));
    assert.equal(statsMapPoolState.outNamesCentered, true, JSON.stringify(statsMapPoolState));
    assert.match(statsMapPoolState.summitImage, /\/assets\/library\/maps\/thumbs\/summit\.jpg$/i);
    assert.ok(statsMapPoolState.activeNoDataTags >= 1, JSON.stringify(statsMapPoolState));
    assert.equal(statsMapPoolState.excludedCrosses, 6, JSON.stringify(statsMapPoolState));
    assert.equal(statsMapPoolState.resultLineCentered, true, JSON.stringify(statsMapPoolState));
    assert.ok(await page.locator("#page-stats .stats-trend-context .trend-signal-media").count() > 0);
    const trendImages = page.locator("#page-stats .stats-trend-context .trend-signal-media.has-image img");
    assert.ok(await trendImages.count() > 0);
    await page.waitForFunction(() => [...document.querySelectorAll("#page-stats .stats-trend-context .trend-signal-media.has-image img")]
      .every(image => image.complete && image.naturalWidth > 0));
    const trendImageState = await trendImages.evaluateAll(images => images.map(image => ({
      src: image.currentSrc || image.src,
      width: image.naturalWidth,
      height: image.naturalHeight,
      visible: image.getBoundingClientRect().width > 0 && image.getBoundingClientRect().height > 0,
      display: getComputedStyle(image).display,
      visibility: getComputedStyle(image).visibility,
      opacity: Number(getComputedStyle(image).opacity),
      transform: getComputedStyle(image).transform,
      clipPath: getComputedStyle(image).clipPath,
      renderedWidth: image.getBoundingClientRect().width,
      renderedHeight: image.getBoundingClientRect().height
    })));
    assert.ok(trendImageState.every(image => image.src && image.width > 0 && image.height > 0 && image.visible && image.display !== "none" && image.visibility !== "hidden" && image.opacity > 0 && image.transform === "none" && image.clipPath === "none" && image.renderedWidth >= 20 && image.renderedHeight >= 20), JSON.stringify(trendImageState));
    const summaryGrid = await page.locator("#page-stats .stats-summary-grid").evaluate(grid => ({
      columns: getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length,
      rows: new Set([...grid.children].map(child => Math.round(child.getBoundingClientRect().top))).size,
      items: grid.children.length
    }));
    assert.equal(summaryGrid.columns, 3, JSON.stringify(summaryGrid));
    assert.equal(summaryGrid.rows, 2, JSON.stringify(summaryGrid));
    assert.equal(summaryGrid.items, 6, JSON.stringify(summaryGrid));
    assert.equal(await page.locator("#statsActMobileValue").innerText(), "Season 2026 Act 4");
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
      assert.ok(card.height >= 260, JSON.stringify(statsLayoutGeometry));
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
    assert.ok(lowerStatsContent.agentVisible >= Math.min(4, lowerStatsContent.agentTotal), JSON.stringify(lowerStatsContent));
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
    await page.selectOption("#statsActSelector", { label: "Season 2026 Act 3" }, { force: true });
    await page.waitForTimeout(350);
    // A selected season is an over-time chart scope, not only today's session.
    // The fixture has 24 retained Act 3 matches (none from today), so the
    // 10-match chart must still be available and render the latest ten.
    await page.locator('.nav-btn[data-page="home"]').click();
    await page.waitForTimeout(350);
    const seasonalWindowControls = await page.locator('.graph-btn[data-size="10"]').evaluate(button => ({
      disabled: button.disabled,
      title: button.title,
      matchCount: document.querySelectorAll("#chartRow .rr-dot, #chartRow .final-end").length
    }));
    assert.equal(seasonalWindowControls.disabled, false, JSON.stringify(seasonalWindowControls));
    assert.equal(seasonalWindowControls.title, "", JSON.stringify(seasonalWindowControls));
    await page.locator('.graph-btn[data-size="10"]').click();
    await page.waitForTimeout(350);
    const selectedSeasonChart = await page.locator("#chartRow").evaluate(chart => ({
      dots: chart.querySelectorAll(".rr-dot, .final-end").length,
      axisTitle: chart.closest(".rr-chart-card")?.querySelector(".chart-axis-title")?.textContent?.trim() || ""
    }));
    assert.equal(selectedSeasonChart.dots, 10, JSON.stringify(selectedSeasonChart));
    assert.match(selectedSeasonChart.axisTitle, /Season 2026 Act 3/i, JSON.stringify(selectedSeasonChart));
    await page.locator('.nav-btn[data-page="stats"]').click();
    await page.waitForTimeout(200);
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
    assert.ok(compactStatsGeometry.trendDetails.every(item => item.bottom <= item.cardBottom + 1 && item.lineClamp === "4" && item.overflow === "hidden" && item.textOverflow === "clip" && item.fontWeight <= 500), JSON.stringify(compactStatsGeometry));
    assert.ok(compactStatsGeometry.fineStatWeights.length > 0 && compactStatsGeometry.fineStatWeights.every(weight => weight <= 500), JSON.stringify(compactStatsGeometry));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-compact-desktop-stats.png"), fullPage: true });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(150);
    await page.locator('[data-page="insights"]').click();
    await page.waitForTimeout(250);
    const priorityTitleColor = await page.locator("#insightFocusTitle").evaluate(title => ({
      title: getComputedStyle(title).color,
      copy: getComputedStyle(document.getElementById("insightFocusWhy")).color
    }));
    assert.notEqual(priorityTitleColor.title, priorityTitleColor.copy, JSON.stringify(priorityTitleColor));
    const unavailableLossRead = page.locator('.weekly-focus-pill[data-weekly-key="losses"]');
    await unavailableLossRead.waitFor({ state: "attached", timeout: 10000 });
    assert.equal(await unavailableLossRead.isDisabled(), true);
    assert.equal(await page.locator('.weekly-focus-pill[data-weekly-key="tilt"]').count(), 0);
    const insightVisuals = await page.locator("#insightsList").evaluate(container => ({
      cards: container.querySelectorAll(".insight-card:not(.insight-empty)").length,
      visuals: container.querySelectorAll(".insight-card:not(.insight-empty) .coaching-category-visual").length
    }));
    assert.ok(insightVisuals.cards > 0, JSON.stringify(insightVisuals));
    assert.equal(insightVisuals.visuals, insightVisuals.cards, JSON.stringify(insightVisuals));
    const clutchInsight = page.locator("#insightsList .insight-card-clutch-closing");
    const clutchDiagnostics = await page.evaluate(() => {
      const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
      return {
        rounds: globalThis.RankedCoachRoundMetrics?.aggregateMatchRoundMetrics?.(profiles[0]?.matches || []),
        titles: [...document.querySelectorAll("#insightsList .insight-title")].map(element => element.textContent)
      };
    });
    assert.equal(await clutchInsight.count(), 1, JSON.stringify(clutchDiagnostics));
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
    assert.ok(Math.abs(clutchGeometry.titleLeft - clutchGeometry.expectedTextLeft) <= 2, JSON.stringify(clutchGeometry));
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
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-desktop-insight-filters.png"), fullPage: true });

    await page.locator("#profileDropdownToggle").click();
    await page.locator("#pdAccountSupportBtn").click();
    await page.locator("#accountSupportModal.active").waitFor({ state: "visible" });
    // The close control remains in the DOM for accessibility, but this modal
    // intentionally uses its backdrop dismissal affordance instead of showing
    // a duplicate visible close button.
    const supportCloseControl = page.locator("#accountSupportModal .lens-modal-close");
    assert.equal(await supportCloseControl.count(), 1);
    assert.equal(await supportCloseControl.evaluate(control => getComputedStyle(control).display), "none");
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
    await page.waitForFunction(() => {
      const modal = document.getElementById("accountSupportModal");
      const backdrop = getComputedStyle(modal).backdropFilter || getComputedStyle(modal).webkitBackdropFilter;
      return Number.parseFloat(backdrop.match(/blur\(([\d.]+)px\)/)?.[1] || "0") < 12;
    });
    const closingBackdrop = await page.locator("#accountSupportModal").evaluate(modal => getComputedStyle(modal).backdropFilter || getComputedStyle(modal).webkitBackdropFilter);
    const closingBlur = Number.parseFloat(closingBackdrop.match(/blur\(([\d.]+)px\)/)?.[1] || "0");
    assert.ok(closingBlur < 12, closingBackdrop);
    await page.waitForFunction(() => document.getElementById("accountSupportModal")?.getAttribute("aria-hidden") === "true");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.click("#dailyWarmupSkip").catch(() => {});
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="stats"]').click();
    await page.waitForFunction(() => document.getElementById("page-stats")?.classList.contains("is-current-page"));
    await page.waitForTimeout(400);
    assert.equal(await page.locator("#page-stats .stats-season-title").evaluate(title => getComputedStyle(title).textAlign), "center");
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
    const mobileTrendImages = page.locator("#page-stats #statsPerformanceChart .stats-trend-card.is-mobile-trend-active .stats-trend-context .trend-signal-media.has-image img");
    for (let index = 0; index < 6 && await mobileTrendImages.count() === 0; index += 1) {
      await page.locator('[data-mobile-trend-step="1"]').click();
      await page.waitForTimeout(80);
    }
    await mobileTrendImages.first().waitFor({ state: "visible" });
    const mobileTrendImageState = await mobileTrendImages.evaluateAll(images => images.map(image => {
      const rect = image.getBoundingClientRect();
      const style = getComputedStyle(image);
      return { loaded: image.complete && image.naturalWidth > 0, rect: rect.toJSON(), display: style.display, visibility: style.visibility, opacity: Number(style.opacity), transform: style.transform, clipPath: style.clipPath };
    }));
    assert.ok(mobileTrendImageState.length > 0 && mobileTrendImageState.every(image => image.loaded && image.rect.width >= 20 && image.rect.height >= 20 && image.display !== "none" && image.visibility !== "hidden" && image.opacity > 0 && image.transform === "none" && image.clipPath === "none"), JSON.stringify(mobileTrendImageState));
    await page.locator("#page-stats #statsPerformanceChart .stats-trend-card.is-mobile-trend-active").screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-recent-trend-icon.png") });
    const roleProgressLabels = await page.locator("#statsRoleProgressRow .stats-role-pill-label").allInnerTexts();
    assert.deepEqual([...roleProgressLabels].sort(), ["Controller", "Duelist", "Initiator", "Sentinel"].sort());
    const roleProgressLabelFit = await page.locator("#statsRoleProgressRow .stats-role-pill-label").evaluateAll(labels => labels.map(label => ({
      text: label.textContent.trim(),
      width: label.getBoundingClientRect().width,
      scrollWidth: label.scrollWidth,
      overflow: getComputedStyle(label).overflow,
      fontFamily: getComputedStyle(label).fontFamily
    })));
    assert.ok(roleProgressLabelFit.every(label => label.text.length >= 7 && label.scrollWidth <= Math.ceil(label.width) + 1 && /IBM Plex Mono|Roboto Condensed/i.test(label.fontFamily)), JSON.stringify(roleProgressLabelFit));
    await page.locator("#statsRoleProgressRow").screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-role-progress-labels.png") });
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="home"]').click();
    await page.waitForFunction(() => document.getElementById("page-home")?.classList.contains("is-current-page"));
    const mobileRrType = await page.evaluate(() => ({
      next: getComputedStyle(document.querySelector("#nextRRWidget #navNextTierText")).fontSize,
      goal: getComputedStyle(document.querySelector("#goalRRWidget #navGoalTierText")).fontSize
    }));
    assert.equal(mobileRrType.goal, mobileRrType.next, JSON.stringify(mobileRrType));
    await page.locator("#chartRow").scrollIntoViewIfNeeded();
    await page.locator('.graph-btn[data-size="5"]').click();
    const tooltipScrollState = await page.evaluate(async () => {
      const tooltip = document.getElementById("chartTooltip");
      const header = document.querySelector(".app-header").getBoundingClientRect();
      tooltip.style.position = "fixed";
      tooltip.style.top = `${header.bottom + 18}px`;
      tooltip.style.left = "50%";
      tooltip.style.visibility = "visible";
      tooltip.style.opacity = "1";
      window.dispatchEvent(new Event("scroll"));
      document.getElementById("chartRow")?.dispatchEvent(new Event("scroll", { bubbles: true }));
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const rect = tooltip.getBoundingClientRect();
      return {
        visibility: tooltip.style.visibility,
        opacity: tooltip.style.opacity,
        overlapsHeader: rect.bottom > header.top && rect.top < header.bottom
      };
    });
    assert.equal(tooltipScrollState.visibility, "visible", JSON.stringify(tooltipScrollState));
    assert.equal(tooltipScrollState.opacity, "1", JSON.stringify(tooltipScrollState));
    assert.equal(tooltipScrollState.overlapsHeader, false, JSON.stringify(tooltipScrollState));
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="logging"]').click();
    await page.waitForFunction(() => document.getElementById("page-logging")?.classList.contains("is-current-page"));
    await page.locator('[data-mobile-logging-view="feed"]').click();
    await page.waitForTimeout(150);
    await page.evaluate(() => document.body.classList.add("theme-readable"));
    await page.locator("#logCalendarTrigger").click();
    const calendarState = await page.locator("#logCalendarPopover").evaluate(popover => {
      const card = popover.closest(".logging-feed-card") || document.querySelector(".logging-feed-card");
      const rect = popover.getBoundingClientRect();
      const style = getComputedStyle(popover);
      const cardAfter = card ? getComputedStyle(card, "::after") : { zIndex: "0" };
      return {
        hidden: popover.hidden,
        cardOpen: card.classList.contains("is-calendar-open"),
        width: rect.width,
        height: rect.height,
        display: style.display,
        visibility: style.visibility,
        popoverZ: Number(style.zIndex),
        cardAfterZ: Number(cardAfter.zIndex),
        cardAfterPointerEvents: cardAfter.pointerEvents
      };
    });
    assert.equal(calendarState.hidden, false, JSON.stringify(calendarState));
    assert.equal(calendarState.cardOpen, true, JSON.stringify(calendarState));
    assert.ok(calendarState.width > 0 && calendarState.height > 0 && calendarState.display !== "none" && calendarState.visibility !== "hidden", JSON.stringify(calendarState));
    assert.ok(calendarState.popoverZ > calendarState.cardAfterZ && calendarState.cardAfterPointerEvents === "none", JSON.stringify(calendarState));
    await page.locator("#logCalendarPopover").screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-calendar-popover.png") });
    await page.locator("#logCalendarTrigger").click();
    await page.evaluate(() => document.body.classList.remove("theme-readable"));
    await page.locator('.mobile-bottom-page-btn[data-mobile-page="home"]').click();
    await page.waitForFunction(() => document.getElementById("page-home")?.classList.contains("is-current-page"));
    assert.match(await page.locator(".weekly-focus-card > .card-header .card-pill").innerText(), /Week of\s+\S/i);
    const weeklyConfidenceGeometry = await page.locator(".weekly-focus-pill:not(.is-disabled)").evaluateAll(pills => pills.map(pill => {
      const heading = pill.querySelector(".weekly-focus-key")?.getBoundingClientRect();
      const confidence = pill.querySelector(".weekly-focus-confidence")?.getBoundingClientRect();
      const headingRow = pill.querySelector(".weekly-focus-pill-head");
      const card = pill.getBoundingClientRect();
      return {
        card: card.toJSON(),
        heading: heading?.toJSON() || null,
        confidence: confidence?.toJSON() || null,
        sameHeadingRow: Boolean(headingRow && heading?.width && headingRow.contains(pill.querySelector(".weekly-focus-confidence"))),
        overlaps: Boolean(heading && confidence && heading.left < confidence.right && heading.right > confidence.left && heading.top < confidence.bottom && heading.bottom > confidence.top)
      };
    }));
    assert.ok(weeklyConfidenceGeometry.length > 0 && weeklyConfidenceGeometry.every(item => item.heading && item.confidence && item.sameHeadingRow && !item.overlaps && item.confidence.left >= item.card.left - 1 && item.confidence.right <= item.card.right + 1), JSON.stringify(weeklyConfidenceGeometry));
    await page.locator(".weekly-focus-card").screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-weekly-confidence.png") });
    const mobileTimelineGeometry = await page.locator("#timelineGrid .timeline-pill").evaluateAll(pills => pills.map(pill => {
      const card = pill.getBoundingClientRect();
      const label = pill.querySelector(".timeline-pill-label").getBoundingClientRect();
      const metric = pill.querySelector(".timeline-pill-metric").getBoundingClientRect();
      const value = pill.querySelector(".timeline-pill-value").getBoundingClientRect();
      const delta = pill.querySelector(".timeline-pill-delta").getBoundingClientRect();
      const role = pill.querySelector(".coaching-role-badge")?.getBoundingClientRect() || null;
      return {
        card: card.toJSON(),
        label: label.toJSON(),
        metric: metric.toJSON(),
        value: value.toJSON(),
        delta: delta.toJSON(),
        role: role?.toJSON() || null
      };
    }));
    assert.ok(mobileTimelineGeometry.length === 4, JSON.stringify(mobileTimelineGeometry));
    mobileTimelineGeometry.forEach(item => {
      assert.ok(item.label.left >= item.card.left && item.label.right <= item.metric.left + 1, JSON.stringify(item));
      assert.ok(item.value.right <= item.delta.left + 1, JSON.stringify(item));
      assert.ok(!item.role || (item.metric.right <= item.role.left + 1 && item.role.right <= item.card.right + 1), JSON.stringify(item));
    });
    await page.locator("#impactRolePill").click();
    await page.locator("#lensModalOverlay.active").waitFor({ state: "visible" });
    assert.equal(await page.locator(".impact-opportunity-panel").isVisible(), false);
    await page.locator("#impactOpportunityTab").click();
    await page.locator(".impact-opportunity-panel").waitFor({ state: "visible" });
    await page.waitForTimeout(450);
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
      const seasonLabels = [...card.querySelectorAll(".chart-season-boundary text")].map(label => {
        const rect = label.getBoundingClientRect();
        return { ...rect.toJSON(), lane: label.closest(".chart-season-boundary")?.dataset?.labelLane || "" };
      });
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
        rankLabels: rankLabels.map(rect => ({ left: rect.left, right: rect.right })),
        seasonLabels
      };
    });
    assert.ok(mobileLifetimeGeometry.titleBottom < mobileLifetimeGeometry.legendTop, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.legendBottom < mobileLifetimeGeometry.controlsTop, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.rankLabels.length >= 3, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.rankLabels.every(rect => rect.left >= mobileLifetimeGeometry.cardLeft - 1 && rect.right <= mobileLifetimeGeometry.cardRight + 1), JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.chartWidth >= mobileLifetimeGeometry.cardRight - mobileLifetimeGeometry.cardLeft - 12, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.plotWidth >= mobileLifetimeGeometry.svgWidth * .82, JSON.stringify(mobileLifetimeGeometry));
    assert.ok(mobileLifetimeGeometry.seasonLabels.every((label, index, labels) => labels.slice(index + 1).every(other => (
      label.right <= other.left || other.right <= label.left || label.bottom <= other.top || other.bottom <= label.top
    ))), JSON.stringify(mobileLifetimeGeometry.seasonLabels));
    await page.screenshot({ path: path.join(__dirname, "tmp", "qol-mobile-lifetime-rank-chart.png"), fullPage: true });

    await page.locator('.graph-btn[data-size="5"]').click();
    await page.waitForTimeout(350);
    const mobileYAxisGeometry = await page.locator(".rr-chart-card").evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const labels = [...card.querySelectorAll('#chartRow svg text[text-anchor="end"]')].map(label => label.getBoundingClientRect().toJSON());
      return { card: cardRect.toJSON(), labels };
    });
    assert.ok(mobileYAxisGeometry.labels.length >= 5, JSON.stringify(mobileYAxisGeometry));
    assert.ok(mobileYAxisGeometry.labels.every(label => label.left >= mobileYAxisGeometry.card.left - 1), JSON.stringify(mobileYAxisGeometry));

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
