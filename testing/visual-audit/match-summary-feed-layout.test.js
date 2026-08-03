"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41813;
const progressLogPath = path.resolve(__dirname, "test-results", "match-summary-smoke-progress.log");
const galaxyS20UserAgent = "Mozilla/5.0 (Linux; Android 13; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function progress(message) {
  const line = `${new Date().toISOString()} ${message}`;
  console.log(message);
  try {
    fs.mkdirSync(path.dirname(progressLogPath), { recursive: true });
    fs.appendFileSync(progressLogPath, `${line}\n`);
  } catch (_error) {
    // Progress logging must never affect the smoke result.
  }
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath.startsWith("/api/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {} }));
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

function buildMatch(overrides = {}) {
  const puuid = "feed-layout-player";
  const matchId = overrides.id || "feed-layout-match";
  const playedAt = overrides.createdAt || "2026-08-02T20:15:00.000Z";
  const acs = overrides.acs ?? 231;
  const kast = overrides.kast ?? 73;
  const roleImpact = overrides.roleImpact ?? 76;
  const hsPercent = overrides.hsPercent ?? 22;
  const rounds = Array.from({ length: overrides.roundsLength || 15 }, (_item, index) => {
    const roundNum = index + 1;
    const won = ![2, 5, 8, 11].includes(roundNum);
    const kills = [];
    if ([1, 3, 4, 7, 10, 12].includes(roundNum)) {
      kills.push({ killer: { puuid }, victim: { puuid: `enemy-${roundNum}` }, weapon: { name: roundNum % 2 ? "Vandal" : "Sheriff" } });
    }
    if ([4, 10].includes(roundNum)) {
      kills.push({ killer: { puuid }, victim: { puuid: `enemy-extra-${roundNum}` }, weapon: { name: "Guardian" } });
    }
    if ([2, 5, 8, 11].includes(roundNum)) {
      kills.push({ killer: { puuid: `enemy-killer-${roundNum}` }, victim: { puuid }, weapon: { name: "Vandal" } });
    }
    return {
      roundNum,
      side: roundNum <= 12 ? "attack" : "defense",
      won,
      playerEconomy: {
        loadoutValue: roundNum > 12 ? 5000 : ([1, 13].includes(roundNum) ? 800 : roundNum % 3 === 0 ? 4100 : 2400),
        remaining: roundNum > 12 ? 5000 : (roundNum % 4) * 350,
        weapon: roundNum % 2 ? "Vandal" : "Sheriff"
      },
      kills
    };
  });
  return {
    id: matchId,
    matchId,
    source: "henrik_sync",
    createdAt: playedAt,
    result: "win",
    agent: "Sova",
    role: "Initiator",
    map: "Lotus",
    kills: 9,
    deaths: 4,
    assists: 7,
    acs,
    hsPercent,
    kast,
    roleImpact,
    rr: 18,
    rrVerified: true,
    metadata: {
      source: "henrik_sync",
      matchId,
      playedAt,
      agent: "Sova",
      role: "Initiator",
      mapName: "Lotus",
      result: "win",
      act: "Season 2026 Act 4"
    },
    matchRecord: {
      schemaVersion: 1,
      id: matchId,
      playedAt,
      result: "win",
      agent: "Sova",
      role: "Initiator",
      map: "Lotus",
      trackedPlayer: { puuid },
      stats: { kills: 9, deaths: 4, assists: 7, acs, adr: overrides.adr ?? 152, hsPercent, kast, roleImpact },
      rank: { rankLabel: "Platinum 3", rrDelta: 18, rrTotal: 52 },
      roundByRound: rounds
    }
  };
}

function seedState() {
  const profileId = "feed-layout-profile";
  const previousLow = buildMatch({
    id: "feed-layout-prev-low",
    createdAt: "2026-07-25T20:15:00.000Z",
    acs: 12,
    adr: 24,
    hsPercent: 4,
    kast: 18,
    roleImpact: 8
  });
  const previousMid = buildMatch({
    id: "feed-layout-prev-mid",
    createdAt: "2026-07-28T20:15:00.000Z",
    acs: 178,
    adr: 118,
    hsPercent: 33,
    kast: 54,
    roleImpact: 51
  });
  const previousNearMax = buildMatch({
    id: "feed-layout-prev-near-max",
    createdAt: "2026-07-31T20:15:00.000Z",
    acs: 338,
    adr: 198,
    hsPercent: 74,
    kast: 92,
    roleImpact: 88
  });
  const match = buildMatch({
    id: "feed-layout-match",
    createdAt: "2026-08-02T20:15:00.000Z",
    acs: 244,
    adr: 152,
    hsPercent: 22,
    kast: 66,
    roleImpact: 76
  });
  localStorage.clear();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", profileId);
  sessionStorage.setItem(`rankedcoach_guest_riot_link_prompt_v1:${profileId}`, "1");
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
    id: profileId,
    name: "Feed Layout",
    accountName: "Feed Layout",
    riotId: "FeedLayout#NA1",
    region: "NA",
    importSource: "henrik",
    lastSyncSource: "henrik",
    themeKey: "default",
    layoutShape: "honeycomb",
    layoutTexture: "carbonweave",
    layoutFont: "default",
    profileBorder: "notched",
    profileBorderColor: "theme",
    matches: [previousLow, previousMid, previousNearMax, match],
    trackerAnalytics: { currentAct: "Season 2026 Act 4", acts: ["Season 2026 Act 4"] }
  }]));
  const logEntries = [{
    id: "feed-layout-log",
    profileId,
    matchId: "feed-layout-match",
    source: "henrik-match-placeholder",
    createdAt: "2026-08-02T20:15:00.000Z",
    result: "win",
    agent: "Sova",
    role: "Initiator",
    map: "Lotus",
    rating: 4,
    mood: "Focused",
    rr: 18,
    roleImpact: { score: 76, roleKey: "initiator" },
    notes: "Long notes regression text. This line should stay readable and must not be covered by the View Report or Edit actions after the feed card is rendered on mobile or desktop."
  }];
  localStorage.setItem("valtracker_log_entries_v2:guest", JSON.stringify(logEntries));
  localStorage.setItem("valtracker_log_entries_v1", JSON.stringify(logEntries));
  localStorage.setItem("valtracker_logs_v1", JSON.stringify(logEntries));
}

async function dismissStartupUi(page) {
  await page.evaluate(() => {
    document.getElementById("loginInitializationOverlay")?.remove();
    document.getElementById("loadingOverlay")?.remove();
  });
}

async function verifyViewport(browser, viewport, name) {
  progress(`[match-summary-smoke] ${name}: starting`);
  const isMobileViewport = viewport.width <= 760;
  const page = await browser.newPage({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: isMobileViewport,
    hasTouch: isMobileViewport,
    deviceScaleFactor: isMobileViewport ? 3 : 1,
    userAgent: isMobileViewport ? galaxyS20UserAgent : undefined
  });
  progress(`[match-summary-smoke] ${name}: page created`);
  const issues = [];
  const logs = [];
  let resolveInitComplete;
  const initComplete = new Promise(resolve => {
    resolveInitComplete = resolve;
  });
  page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
  page.on("console", message => {
    logs.push(`${message.type()}: ${message.text()}`);
    if (message.type() === "error") issues.push(`[console] ${message.text()}`);
    if (message.text().includes("INIT COMPLETE")) resolveInitComplete();
  });
  await page.addInitScript({ content: `const buildMatch = ${buildMatch.toString()};(${seedState.toString()})();` });
  progress(`[match-summary-smoke] ${name}: seed installed`);
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  progress(`[match-summary-smoke] ${name}: domcontentloaded`);
  await page.waitForSelector("#page-logging", { state: "attached", timeout: 15000 });
  progress(`[match-summary-smoke] ${name}: logging page attached`);
  // The full app init choreography can intentionally lag behind DOM readiness.
  // This focused smoke removes startup overlays and verifies the target surfaces
  // directly after #page-logging is attached.
  await dismissStartupUi(page);
  progress(`[match-summary-smoke] ${name}: app loaded`);
  await page.waitForFunction(() => Boolean(globalThis.RankedCoachSyncDiagnostics?.getMode), null, { timeout: 15000 });
  const syncAndBorderState = await page.evaluate((isMobile) => {
    const readTarget = (target) => {
      const frame = target?.querySelector?.('.rc-mobile-avatar-frame[data-mobile-frame="notched"]')
        || target?.querySelector?.(".rc-mobile-avatar-frame");
      const main = frame?.querySelector?.(".rc-mobile-frame-main");
      const glint = frame?.querySelector?.(".rc-mobile-frame-glint");
      const targetStyle = target ? getComputedStyle(target) : null;
      const mainStyle = main ? getComputedStyle(main) : null;
      const glintStyle = glint ? getComputedStyle(glint) : null;
      return {
        targetClassName: target?.className || "",
        hasAnimatedClass: Boolean(target?.classList?.contains("border-animated")),
        hasNotchedClass: Boolean(target?.classList?.contains("border-notched")),
        frame: frame?.getAttribute("data-mobile-frame") || "",
        targetAnimationName: targetStyle?.animationName || "",
        mainAnimationName: mainStyle?.animationName || "",
        glintAnimationName: glintStyle?.animationName || "",
        mainStrokeDasharray: mainStyle?.strokeDasharray || ""
      };
    };
    const profileTarget = document.querySelector(".profile-avatar-ring");
    const mobileHeaderTarget = isMobile ? document.querySelector("#mobileHeaderProfileBtn.mobile-bottom-avatar-btn") : null;
    const mobileBottomTarget = isMobile ? document.querySelector("#mobileBottomShell .mobile-bottom-avatar-btn") : null;
    const mobileTarget = mobileHeaderTarget || mobileBottomTarget;
    const target = mobileTarget || profileTarget;
    return {
      target: readTarget(target),
      profileTarget: readTarget(profileTarget),
      mobileHeaderTarget: readTarget(mobileHeaderTarget),
      mobileBottomTarget: readTarget(mobileBottomTarget),
      diagnostics: globalThis.RankedCoachSyncDiagnostics.getMode()
    };
  }, isMobileViewport);
  assert.equal(syncAndBorderState.diagnostics.mode, "guest", `${name}: seeded session should report guest mode`);
  assert.equal(syncAndBorderState.diagnostics.crossDeviceRealtimeAvailable, false, `${name}: guest mode should not claim cross-device realtime`);
  assert.equal(syncAndBorderState.diagnostics.crossDeviceSyncRequiresSignIn, true, `${name}: guest Riot profile should disclose sign-in requirement`);
  assert.ok(syncAndBorderState.target.hasAnimatedClass, `${name}: notched border should receive .border-animated in live DOM ${JSON.stringify(syncAndBorderState)}`);
  assert.ok(syncAndBorderState.target.hasNotchedClass || syncAndBorderState.target.frame === "notched", `${name}: live profile border should be notched ${JSON.stringify(syncAndBorderState)}`);
  assert.match(syncAndBorderState.target.mainAnimationName, /rcMobileSvgFrame(Sweep|Trace)|rcMobileSvgFrameGlowBeat/, `${name}: visible notched frame stroke should animate ${JSON.stringify(syncAndBorderState)}`);
  assert.match(syncAndBorderState.target.glintAnimationName, /rcMobileSvgFrame(ReverseSweep|Trace)|rcMobileSvgGlintTravel/, `${name}: visible notched frame glint should animate ${JSON.stringify(syncAndBorderState)}`);
  assert.doesNotMatch(syncAndBorderState.target.targetAnimationName, /profileBorder(NotchBreathe|SplitFlicker)/, `${name}: parent avatar should not use old notched/split animation ${JSON.stringify(syncAndBorderState)}`);
  if (isMobileViewport) {
    assert.ok(syncAndBorderState.mobileHeaderTarget.hasAnimatedClass, `${name}: mobile header avatar should receive .border-animated ${JSON.stringify(syncAndBorderState)}`);
    assert.match(syncAndBorderState.mobileHeaderTarget.mainAnimationName, /rcMobileSvgFrame(Sweep|Trace)|rcMobileSvgFrameGlowBeat/, `${name}: mobile header notched SVG frame should animate ${JSON.stringify(syncAndBorderState)}`);
    if (syncAndBorderState.mobileBottomTarget.targetClassName) {
      assert.ok(syncAndBorderState.mobileBottomTarget.hasAnimatedClass, `${name}: mobile bottom-shell avatar should receive .border-animated ${JSON.stringify(syncAndBorderState)}`);
      assert.match(syncAndBorderState.mobileBottomTarget.mainAnimationName, /rcMobileSvgFrame(Sweep|Trace)|rcMobileSvgFrameGlowBeat/, `${name}: mobile bottom-shell notched SVG frame should animate ${JSON.stringify(syncAndBorderState)}`);
    }
  }
  progress(`[match-summary-smoke] ${name}: diagnostics and border checked`);
  const navSelector = isMobileViewport ? '[data-mobile-page="logging"]' : '.nav-btn[data-page="logging"]';
  await page.locator(navSelector).first().click({ force: true });
  await page.evaluate(selector => document.querySelector(selector)?.click(), navSelector);
  await page.waitForFunction(() => document.querySelector("#page-logging")?.classList.contains("is-current-page") || document.querySelector("#page-logging")?.classList.contains("active"), null, { timeout: 15000 }).catch(async error => {
    const debug = await page.evaluate(() => ({
      readyState: document.readyState,
      scriptTags: Array.from(document.scripts).map(script => ({ src: script.src, type: script.type })),
      activePages: Array.from(document.querySelectorAll(".page"))
        .filter(page => page.className.includes("active") || page.className.includes("current"))
        .map(page => ({ id: page.id, className: page.className, hidden: page.hidden, inert: page.hasAttribute("inert") })),
      nav: Array.from(document.querySelectorAll(".nav-btn,[data-mobile-page]"))
        .map(button => ({ text: button.textContent.trim(), page: button.dataset.page || button.dataset.mobilePage || "", className: button.className, navBound: button.dataset.navBound || "" })),
      overlays: Array.from(document.querySelectorAll(".modal.active,#loginInitializationOverlay,#loadingOverlay"))
        .map(node => ({ id: node.id, className: node.className, hidden: node.hidden, display: getComputedStyle(node).display, pointerEvents: getComputedStyle(node).pointerEvents, zIndex: getComputedStyle(node).zIndex }))
    }));
    throw new Error(`${name}: logging navigation did not activate ${JSON.stringify({ debug, logs })}: ${error.message}`);
  });
  if (isMobileViewport) {
    await page.locator('[data-mobile-logging-view="feed"]').click({ force: true });
    await page.evaluate(() => document.querySelector('[data-mobile-logging-view="feed"]')?.click());
  }
  await page.waitForSelector("#logFeed .log-entry", { state: "attached", timeout: 15000 }).catch(() => {});
  if (await page.locator("#logFeed .log-entry").count() === 0) {
    const debug = await page.evaluate(() => ({
      activePage: document.querySelector(".page.is-current-page")?.id || document.querySelector(".page.active")?.id || "",
      activeProfileId: localStorage.getItem("valtracker_active_profile_id"),
      profilesLength: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]").length,
      logsLength: JSON.parse(localStorage.getItem("valtracker_log_entries_v2:guest") || "[]").length,
      logFeedText: document.querySelector("#logFeed")?.textContent?.trim() || ""
    }));
    throw new Error(`${name}: expected seeded log entry, got ${JSON.stringify(debug)}`);
  }

  const feedLayout = await page.locator("#logFeed .log-entry").first().evaluate(entry => {
    const notes = entry.querySelector(".log-notes").getBoundingClientRect();
    const actions = entry.querySelector(".log-actions").getBoundingClientRect();
    const chip = entry.querySelector(".log-role-impact-chip").getBoundingClientRect();
    const header = entry.querySelector(".log-header").getBoundingClientRect();
    return {
      notesBottom: notes.bottom,
      actionsTop: actions.top,
      actionsRight: Math.round(actions.right),
      entryRight: Math.round(entry.getBoundingClientRect().right),
      chipRight: Math.round(chip.right),
      headerRight: Math.round(header.right)
    };
  });
  assert.ok(feedLayout.actionsTop >= feedLayout.notesBottom + 8, `${name}: feed buttons should not cover notes ${JSON.stringify(feedLayout)}`);
  assert.ok(Math.abs(feedLayout.headerRight - feedLayout.actionsRight) <= 18, `${name}: feed buttons should sit bottom-right ${JSON.stringify(feedLayout)}`);
  assert.ok(Math.abs(feedLayout.headerRight - feedLayout.chipRight) <= 28, `${name}: impact chip should be end aligned ${JSON.stringify(feedLayout)}`);
  progress(`[match-summary-smoke] ${name}: feed layout checked`);

  const openedReport = await page.evaluate(() => {
    const profile = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0] || {};
    const match = (profile.matches || []).find(item => item.id === "feed-layout-match");
    return Boolean(globalThis.RankedCoachMatchSummary?.open?.(match));
  });
  assert.equal(openedReport, true, `${name}: seeded match report should open through the app report renderer`);
  await page.waitForSelector("#matchSummaryModal.active", { timeout: 15000 });
  progress(`[match-summary-smoke] ${name}: match report opened`);
  await page.locator('[data-match-summary-tab="weapons"]').click({ force: true });
  await page.evaluate(() => document.querySelector('[data-match-summary-tab="weapons"]')?.click());
  await page.waitForSelector('[data-match-summary-panel="weapons"]:not([hidden]) .match-summary-eco-chip', { timeout: 15000 });
  const weaponsPanelBorder = await page.locator("#matchSummaryModal .match-summary-tab-panel > .match-summary-report-stack").evaluate(node => {
    const style = getComputedStyle(node);
    return {
      borderTopWidth: style.borderTopWidth,
      boxShadow: style.boxShadow,
      background: style.backgroundColor
    };
  });
  assert.equal(weaponsPanelBorder.borderTopWidth, "0px", `${name}: report stack should have no visible border`);

  const ecoChipGrid = await page.locator("#matchSummaryModal .match-summary-eco-chip").first().evaluate(node => {
    const style = getComputedStyle(node);
    return {
      columns: style.gridTemplateColumns.split(" ").length,
      dividers: node.querySelectorAll(":scope > i").length,
      percent: node.querySelector(":scope > em")?.textContent?.trim() || "",
      fraction: node.querySelector(":scope > small")?.textContent?.trim() || ""
    };
  });
  assert.equal(ecoChipGrid.columns, 5, `${name}: round outcomes should split into name/divider/percent/divider/fraction columns`);
  assert.equal(ecoChipGrid.dividers, 2, `${name}: round outcomes should render two dividers`);
  assert.match(ecoChipGrid.percent, /%$/, `${name}: round outcome percent should be its own section`);
  assert.match(ecoChipGrid.fraction, /\d+\/\d+ wins?/, `${name}: round outcome fraction should be its own section`);

  await page.locator('[data-match-summary-tab="stats"]').click({ force: true });
  await page.evaluate(() => document.querySelector('[data-match-summary-tab="stats"]')?.click());
  await page.locator(".match-summary-stat-pill").first().click({ force: true });
  await page.waitForSelector(".match-summary-stat-trend:not([hidden]) .match-summary-stat-bar i", { timeout: 15000 });
  const statChartLayout = await page.locator(".match-summary-stat-trend:not([hidden]) .match-summary-stat-plot").first().evaluate(plot => {
    const graph = plot.querySelector(".match-summary-stat-graph");
    const bars = Array.from(plot.querySelectorAll(".match-summary-stat-bar i")).map(node => node.getBoundingClientRect());
    const label = plot.querySelector(".match-summary-stat-label em")?.getBoundingClientRect();
    const graphRect = graph?.getBoundingClientRect();
    const axisY = graphRect?.bottom || 0;
    const heights = bars.map(rect => Math.round(rect.height));
    return {
      barBottoms: bars.map(rect => rect.bottom),
      axisY,
      labelTop: label?.top || 0,
      heights,
      uniqueHeights: new Set(heights).size,
      barCount: bars.length
    };
  });
  assert.ok(statChartLayout.barCount >= 4, `${name}: stat chart should include small/mid/near-max/current points ${JSON.stringify(statChartLayout)}`);
  assert.ok(statChartLayout.barBottoms.every(bottom => Math.abs(bottom - statChartLayout.axisY) <= 3), `${name}: all stat bars should grow from the x-axis ${JSON.stringify(statChartLayout)}`);
  assert.ok(statChartLayout.labelTop > statChartLayout.axisY + 3, `${name}: x-axis labels should sit below the x-axis ${JSON.stringify(statChartLayout)}`);
  assert.ok(statChartLayout.uniqueHeights >= 3, `${name}: stat bar heights should scale across different values ${JSON.stringify(statChartLayout)}`);
  progress(`[match-summary-smoke] ${name}: stat chart checked`);

  await page.locator('[data-match-summary-tab="economy"]').click({ force: true });
  await page.evaluate(() => document.querySelector('[data-match-summary-tab="economy"]')?.click());
  await page.waitForSelector('[data-match-summary-panel="economy"]:not([hidden]) .match-summary-credit-diamond', { timeout: 15000 });
  await page.waitForTimeout(700);
  const diamondBefore = await page.locator(".match-summary-credit-diamond").first().evaluate(node => {
    const diamond = node.getBoundingClientRect();
    const bar = node.closest(".match-summary-credit-bar")?.getBoundingClientRect();
    return {
      x: Math.round(diamond.left - (bar?.left || 0)),
      y: Math.round(diamond.top - (bar?.top || 0)),
      width: Math.round(diamond.width),
      height: Math.round(diamond.height)
    };
  });
  if (!isMobileViewport) {
    await page.locator(".match-summary-credit-diamond").first().hover();
  }
  await page.evaluate(() => document.querySelector(".match-summary-credit-diamond")?.click());
  await page.waitForTimeout(260);
  const diamondAfter = await page.locator(".match-summary-credit-diamond").first().evaluate(node => {
    const diamond = node.getBoundingClientRect();
    const bar = node.closest(".match-summary-credit-bar")?.getBoundingClientRect();
    return {
      x: Math.round(diamond.left - (bar?.left || 0)),
      y: Math.round(diamond.top - (bar?.top || 0)),
      width: Math.round(diamond.width),
      height: Math.round(diamond.height)
    };
  });
  assert.deepEqual(diamondAfter, diamondBefore, `${name}: economy diamond should not move inside its bar when selected`);
  const tooltipState = await page.locator(".match-summary-credit-bar.is-tooltip-open").first().evaluate(node => {
    const tooltip = getComputedStyle(node, "::after");
    const diamond = node.querySelector(".match-summary-credit-diamond");
    const diamondBeforeStyle = diamond ? getComputedStyle(diamond, "::before") : null;
    return {
      opacity: Number(tooltip.opacity),
      text: tooltip.content || "",
      color: diamondBeforeStyle?.backgroundColor || ""
    };
  });
  const tooltipOpacity = tooltipState.opacity;
  assert.ok(tooltipOpacity >= 0.9, `${name}: economy tooltip should open on click`);
  assert.match(tooltipState.text, /Credits:/, `${name}: economy tooltip should show the credit count`);
  assert.match(tooltipState.color, /168,\s*85,\s*247|a855f7/i, `${name}: selected economy diamond should become purple`);
  progress(`[match-summary-smoke] ${name}: economy checked`);

  await page.screenshot({ path: path.resolve(__dirname, `match-summary-feed-layout-${name}.png`), fullPage: true });
  assert.deepEqual(issues, [], `${name}: console/page errors should be empty`);
  await page.close();
}

async function run() {
  try {
    fs.unlinkSync(progressLogPath);
  } catch (_error) {}
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    await verifyViewport(browser, { width: 1440, height: 900 }, "desktop");
    await verifyViewport(browser, { width: 390, height: 844, isMobile: true }, "mobile");
    console.log("Match summary/feed layout smoke passed.");
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
