"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41847;
const outDir = path.resolve(__dirname, "test-results", "theming-animation-stats-polish");
const types = {
  ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relative = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relative === "/") relative = "/index.html";
      const file = path.join(root, relative);
      if (!file.startsWith(root)) return response.writeHead(403).end("Forbidden");
      fs.readFile(file, (error, data) => {
        if (error) return response.writeHead(404).end("Not found");
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `globalThis.supabase={createClient(){const q={select(){return this},eq(){return this},order(){return this},limit(){return this},maybeSingle:async()=>({data:null,error:null}),then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};return{auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}}),onAuthStateChange(callback){setTimeout(()=>callback("INITIAL_SESSION",null),0);return{data:{subscription:{unsubscribe(){}}}}}},from(){return Object.create(q)}}}};`;
}

function makeMatch(index, { season, act, agent, role, map, result, acs, hs }) {
  const playedAt = `2026-08-${String(index + 1).padStart(2, "0")}T16:00:00.000Z`;
  const kills = result === "win" ? 18 + index : 10 + index;
  const deaths = result === "win" ? 10 : 17;
  return {
    id: `theme-stats-${index}`, matchId: `theme-stats-${index}`, source: "henrik_sync", playedAt, createdAt: playedAt,
    season, seasonId: season, act, agent, role, map, result, kills, deaths, assists: 5, acs, adr: Math.max(80, acs - 55), hsPercent: hs,
    queue: { id: "competitive", name: "Competitive", modeType: "Standard" }, rr: result === "win" ? 18 : -16, verifiedRrDelta: result === "win" ? 18 : -16, rrVerified: true,
    metadata: { matchId: `theme-stats-${index}`, source: "henrik_sync", playedAt, season, seasonId: season, act, agent, mapName: map, result, queue: { id: "competitive", name: "Competitive", modeType: "Standard" } }
  };
}

function buildProfileFixture() {
  const currentSeason = "season-test-current";
  const previousSeason = "season-test-previous";
  const current = [
    makeMatch(7, { season: currentSeason, act: "Season 2026 Act 4", agent: "Sova", role: "Initiator", map: "Haven", result: "win", acs: 190, hs: 21 }),
    makeMatch(8, { season: currentSeason, act: "Season 2026 Act 4", agent: "Sova", role: "Initiator", map: "Lotus", result: "loss", acs: 155, hs: 18 }),
    makeMatch(9, { season: currentSeason, act: "Season 2026 Act 4", agent: "Skye", role: "Initiator", map: "Sunset", result: "win", acs: 244, hs: 32 }),
    makeMatch(10, { season: currentSeason, act: "Season 2026 Act 4", agent: "Jett", role: "Duelist", map: "Ascent", result: "loss", acs: 168, hs: 19 }),
    makeMatch(11, { season: currentSeason, act: "Season 2026 Act 4", agent: "Jett", role: "Duelist", map: "Breeze", result: "win", acs: 271, hs: 37 })
  ];
  const previous = [
    makeMatch(5, { season: previousSeason, act: "Season 2026 Act 3", agent: "Omen", role: "Controller", map: "Bind", result: "win", acs: 204, hs: 25 }),
    makeMatch(6, { season: previousSeason, act: "Season 2026 Act 3", agent: "Viper", role: "Controller", map: "Pearl", result: "loss", acs: 112, hs: 11 })
  ];
  return {
    id: "theme-stats-profile", name: "Theme Stats", accountName: "Theme Stats", riotId: "", isGuest: true,
    importSource: "", lastSyncSource: "", trackerAnalytics: { currentAct: "Season 2026 Act 4", acts: ["Season 2026 Act 4", "Season 2026 Act 3"] },
    matches: [...previous, ...current]
  };
}

async function openStats(page) {
  await page.goto(`http://127.0.0.1:${port}/index.html?themingStats=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
  await page.evaluate(() => {
    // The production guest tutorial intentionally replaces local profile data
    // with its own demo. Restore the fixture after app startup so this audit
    // exercises the selected-season renderer, not the tutorial fixture.
    const fixture = globalThis.__RC_THEME_STATS_FIXTURE__;
    localStorage.setItem("valtracker_active_profile_id", fixture.id);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([fixture]));
    globalThis.RankedCoachTestHooks.loadProfileFixture(fixture);
  });
  await page.evaluate(() => {
    document.querySelectorAll(".modal-overlay,.modal-backdrop,#guestChoiceModal,#dailyEntranceOverlay,#matchSummaryModal").forEach(element => {
      element.style.setProperty("display", "none", "important");
      element.classList.remove("show", "is-active", "active");
    });
    document.body.classList.remove("has-active-modal", "mobile-modal-open");
  });
  await page.locator('.nav-btn[data-page="stats"]').click({ force: true });
  await page.waitForSelector("#statsMapsList .stats-map-card", { state: "attached", timeout: 15000 });
  await page.waitForTimeout(250);
}

async function clickVisibleCenter(page, selector) {
  const locator = page.locator(selector);
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  assert.ok(box && box.width > 2 && box.height > 2, `expected an on-screen target for ${selector}`);
  const targetCheck = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      pointerEvents: getComputedStyle(element).pointerEvents,
      pagePointerEvents: getComputedStyle(document.getElementById("page-stats")).pointerEvents,
      parentPointerEvents: getComputedStyle(element.parentElement).pointerEvents,
      hitInsideTarget: !!hit && (hit === element || element.contains(hit)),
      hit: hit?.className || hit?.id || hit?.tagName || "none"
    };
  });
  assert.equal(targetCheck.pointerEvents, "auto", `target must accept pointer input: ${selector} ${JSON.stringify(targetCheck)}`);
  assert.equal(targetCheck.hitInsideTarget, true, `target center must not be obscured: ${selector} ${JSON.stringify(targetCheck)}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(45);
  await page.mouse.up();
  await page.waitForTimeout(0);
  return { box, targetCheck };
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  const issues = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1024 } });
    page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error" && !/Failed to load resource/i.test(message.text())) issues.push(`[console] ${message.text()}`);
    });
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await page.addInitScript(() => { globalThis.__RANKEDCOACH_TEST_HOOKS__ = true; });
    await page.addInitScript((profile) => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("rankedcoach_guest_choice_seen_v1", "1");
      localStorage.setItem("rankedcoach_daily_entrance_seen_v1", JSON.stringify({ date: "2099-01-01", seenPages: ["home", "logging", "stats", "insights", "library"] }));
      localStorage.setItem("valtracker_active_profile_id", profile.id);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
      globalThis.__RC_THEME_STATS_FIXTURE__ = profile;
    }, buildProfileFixture());
    await openStats(page);

    const mapSnapshot = await page.evaluate(() => ({
      count: document.querySelectorAll("#statsMapsList .stats-map-card").length,
      activeCount: [...document.querySelectorAll("#statsMapsList .stats-map-card")].filter(card => card.dataset.activePool === "true").length,
      lockedCount: [...document.querySelectorAll("#statsMapsList .stats-map-card")].filter(card => card.dataset.activePool === "false" && card.disabled).length,
      outOfSeasonNames: [...document.querySelectorAll("#statsMapsList .stats-map-card[data-active-pool='false'] .stats-map-out-name")].map(node => node.textContent.trim()),
      names: [...document.querySelectorAll("#statsMapsList .stats-map-card .stats-main-text")].map(node => node.textContent.trim()),
      columns: getComputedStyle(document.getElementById("statsMapsList")).gridTemplateColumns.split(" ").length
    }));
    assert.equal(mapSnapshot.count, 13, `selected season should show every map preview: ${JSON.stringify(mapSnapshot)}`);
    assert.ok(mapSnapshot.activeCount > 0 && mapSnapshot.lockedCount > 0, `active and off-season map states should both be represented: ${JSON.stringify(mapSnapshot)}`);
    assert.equal(mapSnapshot.activeCount + mapSnapshot.lockedCount, 13, `off-season maps must be locked instead of removed: ${JSON.stringify(mapSnapshot)}`);
    assert.equal(mapSnapshot.columns, 4, `desktop map grid must be 4 compact columns: ${JSON.stringify(mapSnapshot)}`);

    const selector = page.locator("#statsActSelector");
    const options = await selector.locator("option").evaluateAll(nodes => nodes.map(node => ({ value: node.value, text: node.textContent.trim() })));
    if (options.length < 2) {
      const diagnostics = await page.evaluate(() => ({
        profile: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0] || null,
        activeProfile: window.activeProfileId || null,
        profileMatches: window.profiles?.[0]?.matches?.length || null,
        computed: window.RankedCoachTestHooks ? "hooks-ready" : "no-hooks"
      }));
      console.log("season diagnostics", JSON.stringify(diagnostics));
    }
    assert.ok(options.length >= 2, `two seasons should be selectable: ${JSON.stringify(options)}`);
    const currentNames = mapSnapshot.names.join("|");
    await selector.selectOption(options[1].value, { force: true });
    await page.waitForTimeout(250);
    const selectedSeasonAfterChange = await selector.inputValue();
    const alternateNames = await page.locator("#statsMapsList .stats-main-text").allTextContents();
    assert.equal(alternateNames.length, 13, "season selection should keep all map previews rendered");
    assert.equal(selectedSeasonAfterChange, options[1].value, "season selection must accept the alternate season");
    await selector.selectOption(options[0].value, { force: true });
    await page.waitForTimeout(250);

    const summaryEntries = await page.evaluate(() => globalThis.RankedCoachTestHooks.getStatsSummaryTrendEntries("acs"));
    assert.equal(summaryEntries.length, 5, `summary source must be restricted to the selected season: ${JSON.stringify(summaryEntries)}`);
    const summaryClick = await clickVisibleCenter(page, '.stats-summary-trend-trigger[data-stats-summary-metric="acs"]');
    await page.waitForTimeout(120);
    const postSummaryClick = await page.evaluate(() => ({
      modalClasses: document.getElementById("lensModal")?.className,
      modalDisplay: getComputedStyle(document.getElementById("lensModal")).display
    }));
    assert.ok(/active|is-opening/.test(postSummaryClick.modalClasses || ""), `summary tile physical click did not open its modal: ${JSON.stringify({ postSummaryClick, summaryClick })}`);
    await page.waitForSelector("#lensModal.active .stats-summary-trend-chart", { timeout: 6000 });
    const summarySnapshot = await page.evaluate(() => ({
      title: document.getElementById("lensModalTitleSecondary")?.textContent?.trim(),
      bars: document.querySelectorAll(".stats-summary-trend-point").length,
      high: document.querySelector(".stats-summary-trend-y-axis span")?.textContent?.trim(),
      opening: document.getElementById("lensModal")?.classList.contains("is-opening") || false,
      transform: getComputedStyle(document.querySelector("#lensModal .lens-modal")).transform,
      filter: getComputedStyle(document.querySelector("#lensModal .lens-modal")).filter
    }));
    assert.equal(summarySnapshot.title, "ACS Trend");
    assert.equal(summarySnapshot.bars, 5, `summary trend must include all selected-season matches: ${JSON.stringify(summarySnapshot)}`);
    assert.equal(summarySnapshot.high, "271", `Y scale should use recorded season high: ${JSON.stringify(summarySnapshot)}`);
    assert.equal(summarySnapshot.filter, "none", `modal must resolve sharp, not blurred: ${JSON.stringify(summarySnapshot)}`);
    await page.locator("#lensModal").screenshot({ path: path.join(outDir, "stats-summary-trend.png") });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);

    await clickVisibleCenter(page, '.stats-role-pill[role="button"].role-initiator');
    await page.waitForSelector("#lensModal.active .stats-role-history-row", { timeout: 6000 });
    const roleSnapshot = await page.evaluate(() => ({
      title: document.getElementById("lensModalTitleSecondary")?.textContent?.trim(),
      wins: document.querySelectorAll(".stats-role-history-row.is-win").length,
      losses: document.querySelectorAll(".stats-role-history-row.is-loss").length,
      rows: document.querySelectorAll(".stats-role-history-row").length
    }));
    assert.equal(roleSnapshot.title, "Initiator Match History");
    assert.equal(roleSnapshot.rows, 3);
    assert.equal(roleSnapshot.wins, 2);
    assert.equal(roleSnapshot.losses, 1);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);

    const weighted = await page.evaluate(() => globalThis.RankedCoachTestHooks.rankWeaponEntriesByEvidence([
      { weapon: "One round miracle", rounds: 1, conversionPct: 100 },
      { weapon: "Repeatable rifle", rounds: 8, conversionPct: 60 }
    ], "conversionPct"));
    assert.equal(weighted[0].weapon, "Repeatable rifle", `confidence weighting should keep 1-round 100% below an established 60% weapon: ${JSON.stringify(weighted)}`);

    await page.evaluate(() => globalThis.RankedCoachTestHooks.requestAutoFit());
    await page.waitForTimeout(110);
    const beforePatchNoteMutation = await page.evaluate(() => globalThis.RankedCoachTestHooks.getAutoFitScheduleCount());
    await page.evaluate(() => {
      const note = document.createElement("p");
      note.textContent = "Unrelated patch-note hydration";
      document.getElementById("page-library").appendChild(note);
    });
    await page.waitForTimeout(340);
    const afterPatchNoteMutation = await page.evaluate(() => globalThis.RankedCoachTestHooks.getAutoFitScheduleCount());
    assert.equal(afterPatchNoteMutation, beforePatchNoteMutation, "ordinary Library hydration must not re-run global text fitting");

    await page.locator('.nav-btn[data-page="insights"]').click({ force: true });
    await page.waitForSelector("#insightsList .insight-card", { timeout: 10000 });
    await page.evaluate(() => {
      document.documentElement.style.setProperty("--accent", "#22d3ee");
      document.documentElement.style.setProperty("--accent-2", "#a78bfa");
      document.documentElement.style.setProperty("--theme-glow", "#22d3ee");
    });
    const insight = page.locator("#insightsList .insight-card").first();
    await insight.hover();
    const themedHover = await insight.evaluate(element => getComputedStyle(element).borderColor);
    assert.ok(!/255, 70, 85/.test(themedHover), `insight hover must use the selected theme accent, not fixed Riot red: ${themedHover}`);
    const navStyle = await page.locator('.nav-btn[data-page="stats"]').evaluate(element => ({
      animation: getComputedStyle(element).animationName,
      background: getComputedStyle(element).backgroundImage
    }));
    assert.notEqual(navStyle.animation, "none", `nav buttons need an entrance animation: ${JSON.stringify(navStyle)}`);
    assert.deepEqual(issues, [], `console errors during theming/stats audit: ${JSON.stringify(issues, null, 2)}`);
    console.log("Theming, animation, map grid, weighted weapon ranking, and stats drill-down audit passed.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
