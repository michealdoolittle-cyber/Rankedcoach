"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41813;
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

function buildMatch() {
  const puuid = "feed-layout-player";
  const rounds = Array.from({ length: 15 }, (_item, index) => {
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
    id: "feed-layout-match",
    matchId: "feed-layout-match",
    source: "henrik_sync",
    createdAt: "2026-08-02T20:15:00.000Z",
    result: "win",
    agent: "Sova",
    role: "Initiator",
    map: "Lotus",
    kills: 9,
    deaths: 4,
    assists: 7,
    acs: 231,
    hsPercent: 22,
    rr: 18,
    rrVerified: true,
    metadata: {
      source: "henrik_sync",
      matchId: "feed-layout-match",
      playedAt: "2026-08-02T20:15:00.000Z",
      agent: "Sova",
      role: "Initiator",
      mapName: "Lotus",
      result: "win",
      act: "Season 2026 Act 4"
    },
    matchRecord: {
      schemaVersion: 1,
      id: "feed-layout-match",
      playedAt: "2026-08-02T20:15:00.000Z",
      result: "win",
      agent: "Sova",
      role: "Initiator",
      map: "Lotus",
      trackedPlayer: { puuid },
      stats: { kills: 9, deaths: 4, assists: 7, acs: 231, adr: 152, hsPercent: 22 },
      rank: { rankLabel: "Platinum 3", rrDelta: 18, rrTotal: 52 },
      roundByRound: rounds
    }
  };
}

function seedState() {
  const profileId = "feed-layout-profile";
  const match = buildMatch();
  localStorage.clear();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", profileId);
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
    matches: [match],
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
  await page.locator("#loginInitializationOverlay").evaluate(node => node.remove()).catch(() => {});
  await page.locator("#loadingOverlay").evaluate(node => node.remove()).catch(() => {});
}

async function verifyViewport(browser, viewport, name) {
  const page = await browser.newPage({ viewport });
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
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#page-logging", { state: "attached", timeout: 15000 });
  await Promise.race([initComplete, page.waitForTimeout(7000)]);
  await dismissStartupUi(page);
  const navSelector = viewport.width <= 760 ? '[data-mobile-page="logging"]' : '.nav-btn[data-page="logging"]';
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
  if (viewport.width <= 760) {
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

  await page.evaluate(() => globalThis.RankedCoachBroadcastPreview?.playPostgame?.());
  await page.waitForSelector("#matchSummaryModal.active", { timeout: 15000 });
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
    return style.gridTemplateColumns.split(" ").length;
  });
  assert.ok(ecoChipGrid >= 3, `${name}: round outcomes should split into left/divider/right columns`);

  await page.locator('[data-match-summary-tab="economy"]').click({ force: true });
  await page.evaluate(() => document.querySelector('[data-match-summary-tab="economy"]')?.click());
  await page.waitForSelector('[data-match-summary-panel="economy"]:not([hidden]) .match-summary-credit-diamond', { timeout: 15000 });
  await page.waitForTimeout(700);
  const diamondBefore = await page.locator(".match-summary-credit-diamond").first().boundingBox();
  await page.evaluate(() => document.querySelector(".match-summary-credit-diamond")?.click());
  await page.waitForTimeout(260);
  const diamondAfter = await page.locator(".match-summary-credit-diamond").first().boundingBox();
  assert.deepEqual(
    [Math.round(diamondBefore.x), Math.round(diamondBefore.y), Math.round(diamondBefore.width), Math.round(diamondBefore.height)],
    [Math.round(diamondAfter.x), Math.round(diamondAfter.y), Math.round(diamondAfter.width), Math.round(diamondAfter.height)],
    `${name}: economy diamond should not move when selected`
  );
  const tooltipOpacity = await page.locator(".match-summary-credit-bar.is-tooltip-open").first().evaluate(node => Number(getComputedStyle(node, "::after").opacity));
  assert.ok(tooltipOpacity >= 0.9, `${name}: economy tooltip should open on click`);

  await page.screenshot({ path: path.resolve(__dirname, `match-summary-feed-layout-${name}.png`), fullPage: true });
  assert.deepEqual(issues, [], `${name}: console/page errors should be empty`);
  await page.close();
}

async function run() {
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
