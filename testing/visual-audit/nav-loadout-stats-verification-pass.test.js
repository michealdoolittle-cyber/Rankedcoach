"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41868;
const outDir = path.resolve(__dirname, "test-results", "nav-loadout-stats-verification-pass");
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
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

function makeMatch(index, overrides = {}) {
  const absolute = 1330 + (index * 18) + (overrides.rrDelta || 0);
  const tier = absolute >= 1500 ? "Diamond 1" : absolute >= 1400 ? "Platinum 3" : "Platinum 2";
  const playedAt = `2026-08-${String(index + 1).padStart(2, "0")}T16:00:00.000Z`;
  const result = overrides.result || (index % 3 === 1 ? "loss" : "win");
  const rrDelta = result === "win" ? 18 : -15;
  const kills = overrides.kills ?? (result === "win" ? 18 + index : 10 + index);
  const deaths = overrides.deaths ?? (result === "win" ? 10 + (index % 3) : 17);
  const agent = overrides.agent || ["Sova", "Skye", "Jett", "Chamber", "Omen", "Reyna"][index % 6];
  const role = overrides.role || ({ Sova: "initiator", Skye: "initiator", Jett: "duelist", Chamber: "sentinel", Omen: "controller", Reyna: "duelist" }[agent] || "duelist");
  const map = overrides.map || ["Haven", "Lotus", "Sunset", "Ascent", "Breeze"][index % 5];
  const weaponCycle = ["Vandal", "Phantom", "Ghost", "Sheriff", "Spectre"];
  const sideCycle = ["attack", "attack", "defense", "defense"];
  const match = {
    id: `nav-loadout-match-${index}`,
    matchId: `nav-loadout-match-${index}`,
    source: "henrik_sync",
    createdAt: playedAt,
    playedAt,
    season: "season-2026-act-4",
    seasonId: "season-2026-act-4",
    act: "Season 2026 Act 4",
    agent,
    role,
    map,
    result,
    kills,
    deaths,
    assists: 4 + (index % 4),
    acs: overrides.acs ?? (150 + (index * 11)),
    adr: overrides.adr ?? (100 + (index * 4)),
    hsPercent: overrides.hs ?? (18 + (index % 6)),
    queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
    rank: tier,
    rrTotal: absolute % 100,
    rr: rrDelta,
    verifiedRrDelta: rrDelta,
    rrVerified: true,
    metadata: { matchId: `nav-loadout-match-${index}`, source: "henrik_sync", playedAt, season: "season-2026-act-4", seasonId: "season-2026-act-4", act: "Season 2026 Act 4", agent, mapName: map, result, rank: tier, queue: { id: "competitive", name: "Competitive", modeType: "Standard" } },
    matchRecord: { playedAt, source: "henrik_sync", rank: { rank: tier, rr: absolute % 100, rrDelta, verified: true }, trackedPlayer: { competitiveTier: 17 } },
    advanced: {
      rounds: Array.from({ length: 6 }, (_value, roundIndex) => ({
        round: roundIndex + 1,
        side: sideCycle[roundIndex % sideCycle.length],
        weapon: weaponCycle[(index + roundIndex) % weaponCycle.length],
        buyType: roundIndex === 0 ? "pistol" : (roundIndex % 3 === 0 ? "full-buy" : "light-buy"),
        roundWon: result === "win" ? roundIndex % 2 === 0 : roundIndex % 3 === 0
      }))
    }
  };
  return match;
}

function buildProfileFixture() {
  return {
    id: "nav-loadout-profile",
    name: "Nav Loadout Stats",
    accountName: "Nav Loadout Stats",
    isGuest: true,
    importSource: "henrik_sync",
    lastSyncSource: "henrik_sync",
    trackerAnalytics: { currentAct: "Season 2026 Act 4", acts: ["Season 2026 Act 4"] },
    loadoutMap: "Breeze",
    matches: [
      makeMatch(0, { agent: "Sova", role: "initiator", map: "Haven", result: "win", acs: 172, hs: 21 }),
      makeMatch(1, { agent: "Skye", role: "initiator", map: "Lotus", result: "loss", acs: 151, hs: 18 }),
      makeMatch(2, { agent: "Sova", role: "initiator", map: "Sunset", result: "win", acs: 221, hs: 29 }),
      makeMatch(3, { agent: "Jett", role: "duelist", map: "Ascent", result: "loss", acs: 164, hs: 17 }),
      makeMatch(4, { agent: "Chamber", role: "sentinel", map: "Breeze", result: "win", acs: 247, hs: 33 }),
      makeMatch(5, { agent: "Omen", role: "controller", map: "Haven", result: "loss", acs: 118, hs: 14 }),
      makeMatch(6, { agent: "Reyna", role: "duelist", map: "Breeze", result: "win", acs: 276, hs: 39 })
    ]
  };
}

async function bootPage(page) {
  await page.goto(`http://127.0.0.1:${port}/index.html?navLoadoutStats=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 20000 });
  await page.evaluate(() => {
    const fixture = globalThis.__RC_NAV_LOADOUT_STATS_FIXTURE__;
    localStorage.setItem("valtracker_active_profile_id", fixture.id);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([fixture]));
    localStorage.setItem("valtracker_daily_warmup_prompt_v1:nav-loadout-profile", new Date().toISOString().slice(0, 10));
    globalThis.RankedCoachTestHooks.loadProfileFixture(fixture);
    window.clearTimeout?.(window.dailyWarmupPromptTimer);
    document.querySelectorAll(".modal-overlay,.modal-backdrop,.lens-modal-overlay,#guestChoiceModal,#dailyEntranceOverlay,#dailyWarmupModal,#weeklyFocusModal,#lensModal,#matchSummaryModal").forEach(element => {
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("pointer-events", "none", "important");
      element.hidden = true;
      element.classList.remove("show", "is-active", "active", "is-opening", "is-closing", "visible");
      element.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("has-active-modal", "mobile-modal-open");
  });
  await page.waitForTimeout(250);
}

async function hoverSnapshot(page, selector) {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  await page.mouse.move(4, 4);
  await page.waitForTimeout(40);
  const before = await locator.evaluate(element => ({
    background: (getComputedStyle(element).backgroundImage && getComputedStyle(element).backgroundImage !== "none") ? getComputedStyle(element).backgroundImage : getComputedStyle(element).backgroundColor,
    animation: getComputedStyle(element).animationName,
    transform: getComputedStyle(element).transform,
    boxShadow: getComputedStyle(element).boxShadow
  }));
  const box = await locator.boundingBox();
  assert.ok(box && box.width > 0 && box.height > 0, `hover target must be visible: ${selector}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(120);
  const after = await locator.evaluate(element => ({
    background: (getComputedStyle(element).backgroundImage && getComputedStyle(element).backgroundImage !== "none") ? getComputedStyle(element).backgroundImage : getComputedStyle(element).backgroundColor,
    animation: getComputedStyle(element).animationName,
    transform: getComputedStyle(element).transform,
    boxShadow: getComputedStyle(element).boxShadow,
    hover: element.matches(":hover"),
    hit: (() => {
      const rect = element.getBoundingClientRect();
      const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return target?.id || target?.className || target?.tagName || "";
    })()
  }));
  return { before, after };
}

async function clickAndWaitModal(page, selector, modalContentSelector) {
  await page.locator(selector).first().scrollIntoViewIfNeeded();
  await page.locator(selector).first().click({ force: true });
  await page.waitForSelector(modalContentSelector, { timeout: 8000 });
}

async function closeLensModals(page) {
  const fullClose = page.locator('#lensModalOverlay.active #lensModalClose');
  if (await fullClose.count()) {
    await fullClose.first().click({ force: true });
  }
  const compactClose = page.locator('#lensModal.active #lensModalCloseSecondary');
  if (await compactClose.count()) {
    await compactClose.first().click({ force: true });
  }
  await page.waitForTimeout(250);
}

async function forceClearModals(page) {
  await page.evaluate(() => {
    document.querySelectorAll('#lensModalOverlay,#lensModal,#dailyWarmupModal,.lens-modal-overlay,.modal-overlay,.modal-backdrop').forEach(element => {
      element.classList.remove('active', 'show', 'is-active', 'is-opening', 'is-closing', 'visible');
      element.style.display = 'none';
      element.style.pointerEvents = 'none';
      element.hidden = true;
      element.setAttribute('aria-hidden', 'true');
    });
    document.body.classList.remove('has-active-modal', 'mobile-modal-open');
  });
  await page.waitForTimeout(150);
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  const issues = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
    page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error" && !/Failed to load resource/i.test(message.text())) issues.push(`[console] ${message.text()}`);
    });
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await page.addInitScript(() => { globalThis.__RANKEDCOACH_TEST_HOOKS__ = true; });
    await page.addInitScript(profile => {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("rankedcoach_guest_choice_seen_v1", "1");
      localStorage.setItem("rankedcoach_daily_entrance_seen_v1", JSON.stringify({ date: "2099-01-01", seenPages: ["home", "logging", "stats", "insights", "library"] }));
      localStorage.setItem("valtracker_active_profile_id", profile.id);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
      globalThis.__RC_NAV_LOADOUT_STATS_FIXTURE__ = profile;
    }, buildProfileFixture());

    await bootPage(page);

    const navSelectors = [
      '.nav-btn[data-page="home"]',
      '#profileSyncBtn',
      '#bugReportOpen',
      '#askCoachOpen',
      '#profileDropdownToggle'
    ];
    const navResults = [];
    for (const selector of navSelectors) {
      const result = await hoverSnapshot(page, selector);
      assert.notEqual(result.after.animation, "none", `${selector} should have a real pop animation`);
      assert.notEqual(result.after.background, result.before.background, `${selector} should gain a gray/themed hover background: ${JSON.stringify(result)}`);
      navResults.push({ selector, animation: result.after.animation, changedBackground: result.after.background !== result.before.background });
    }
    const navClip = await page.evaluate(() => {
      const left = document.querySelector(".nav-left")?.getBoundingClientRect();
      const buttons = [...document.querySelectorAll(".nav-left .nav-btn")].map(button => button.getBoundingClientRect());
      return { left, inside: buttons.every(box => box.left >= left.left - 1 && box.right <= left.right + 1 && box.top >= left.top - 1 && box.bottom <= left.bottom + 1) };
    });
    assert.equal(navClip.inside, true, `nav-left buttons must not clip: ${JSON.stringify(navClip)}`);

    await page.locator('.nav-btn[data-page="home"]').click({ force: true });
    await page.waitForTimeout(250);
    const loadout = await page.evaluate(() => {
      const rect = selector => {
        const box = document.querySelector(selector)?.getBoundingClientRect();
        return box ? { x: box.x, y: box.y, width: box.width, height: box.height, bottom: box.bottom, right: box.right } : null;
      };
      const roles = rect('#roleButtons');
      const spin = rect('#spinAgentBtn');
      const frame = rect('#agentFrame');
      const info = rect('.home-loadout-info');
      const roleButtons = [...document.querySelectorAll('#roleButtons .role-filter-btn')].map(button => {
        const box = button.getBoundingClientRect();
        return { width: box.width, height: box.height, delta: Math.abs(box.width - box.height) };
      });
      return {
        roles, spin, frame, info, roleButtons,
        gapRolesToSpin: Math.round(spin.y - roles.bottom),
        gapMiddleToInfo: Math.round(info.y - Math.max(spin.bottom, frame.bottom)),
        loadoutTransform: getComputedStyle(document.querySelector('.loadout-card')).transform
      };
    });
    assert.ok(loadout.roleButtons.every(button => button.delta <= 1.25), `role buttons must be square: ${JSON.stringify(loadout.roleButtons)}`);
    assert.ok(Math.abs(loadout.gapRolesToSpin - 7) <= 1, `roles-to-spin gap should be 7px: ${JSON.stringify(loadout)}`);
    assert.ok(Math.abs(loadout.gapMiddleToInfo - 7) <= 1, `middle-to-info gap should be 7px: ${JSON.stringify(loadout)}`);
    await page.mouse.move(4, 4);
    await page.waitForTimeout(40);
    const loadoutHoverBefore = await page.locator('#page-home .home-middle-row > .loadout-card').evaluate(element => ({
      transform: getComputedStyle(element).transform,
      boxShadow: getComputedStyle(element).boxShadow
    }));
    const spinBox = await page.locator('#spinAgentBtn').boundingBox();
    assert.ok(spinBox && spinBox.width > 0 && spinBox.height > 0, 'spin button should be visible for loadout hover check');
    await page.mouse.move(spinBox.x + spinBox.width / 2, spinBox.y + spinBox.height / 2);
    await page.waitForTimeout(120);
    const loadoutHoverAfter = await page.locator('#page-home .home-middle-row > .loadout-card').evaluate(element => ({
      transform: getComputedStyle(element).transform,
      boxShadow: getComputedStyle(element).boxShadow,
      hover: element.matches(':hover'),
      childHover: element.matches(':has(#spinAgentBtn:hover)'),
      spinHover: document.querySelector('#spinAgentBtn')?.matches(':hover'),
      hit: (() => {
        const box = document.querySelector('#spinAgentBtn')?.getBoundingClientRect();
        const target = box ? document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2) : null;
        return target ? { id: target.id || '', className: String(target.className || ''), tag: target.tagName } : null;
      })()
    }));
    assert.equal(loadoutHoverAfter.transform, loadoutHoverBefore.transform, `loadout parent must not pop on hover: ${JSON.stringify({ before: loadoutHoverBefore, after: loadoutHoverAfter })}`);
    assert.notEqual(loadoutHoverAfter.boxShadow, loadoutHoverBefore.boxShadow, `loadout parent should still gain themed hover glow: ${JSON.stringify({ before: loadoutHoverBefore, after: loadoutHoverAfter })}`);

    const topMapAgents = await page.evaluate(() => ({
      expected: (() => {
        const eligible = new Set(["Chamber", "Clove", "Iso", "Jett", "KAY/O", "Neon", "Reyna", "Sova", "Viper"].map(agent => agent.toLowerCase().replace(/[^a-z0-9]/g, "")));
        const map = (globalThis.RankedCoachGamesenseMaps || []).find(entry => String(entry?.label || entry?.name || entry?.id || "").toLowerCase() === "breeze");
        return Object.entries(map?.highRankPickRates || {})
          .map(([agent, rate]) => ({ agent, rate: Number(rate), key: String(agent).toLowerCase().replace(/[^a-z0-9]/g, "") }))
          .filter(entry => Number.isFinite(entry.rate) && entry.rate > 0 && eligible.has(entry.key))
          .sort((left, right) => right.rate - left.rate || left.agent.localeCompare(right.agent))
          .slice(0, 4)
          .map(entry => ["Chamber", "Clove", "Iso", "Jett", "KAY/O", "Neon", "Reyna", "Sova", "Viper"].find(agent => agent.toLowerCase().replace(/[^a-z0-9]/g, "") === entry.key));
      })(),
      top: globalThis.RankedCoachLoadoutRoll.getTopMapAgents("Breeze", ["Chamber", "Clove", "Iso", "Jett", "KAY/O", "Neon", "Reyna", "Sova", "Viper"]),
      weighted: globalThis.RankedCoachLoadoutRoll.getWeightedAgents(["Chamber", "Clove", "Iso", "Jett", "KAY/O", "Neon", "Reyna", "Sova", "Viper"], "Breeze").map(entry => entry.agent)
    }));
    assert.deepEqual(topMapAgents.top, topMapAgents.expected, `Breeze top-four pool should match highRankPickRates: ${JSON.stringify(topMapAgents)}`);
    assert.deepEqual(topMapAgents.weighted, topMapAgents.top, `weighted roll candidates should be restricted to map top-four: ${JSON.stringify(topMapAgents)}`);
    await page.locator('#page-home .home-middle-row > .loadout-card').screenshot({ path: path.join(outDir, 'loadout-card.png') });

    await clickAndWaitModal(page, '#compassCardAim', '#lensModalOverlay.active #lensStatsList');
    const compassModalTitle = await page.locator('#lensModalOverlay.active #lensModalTitle').innerText();
    assert.ok(/Aim|Score|Review|Breakdown/i.test(compassModalTitle), `compass card should open lens modal, got ${compassModalTitle}`);
    await forceClearModals(page);

    await page.locator('.nav-btn[data-page="stats"]').click({ force: true });
    await page.waitForSelector('#statsMapsList .stats-map-card', { timeout: 10000 });
    await page.waitForTimeout(250);
    await clickAndWaitModal(page, '.stats-summary-trend-trigger[data-stats-summary-metric="acs"]', '.stats-summary-trend-chart');
    const trendAxis = await page.evaluate(() => ({
      yTicks: document.querySelectorAll('.stats-summary-trend-y-axis span').length,
      gridlines: document.querySelectorAll('.stats-summary-trend-gridline').length,
      bars: document.querySelectorAll('.stats-summary-trend-point').length
    }));
    assert.ok(trendAxis.yTicks > 2, `stats summary trend needs more than two y-axis ticks: ${JSON.stringify(trendAxis)}`);
    assert.ok(trendAxis.gridlines > 2, `stats summary trend needs gridlines: ${JSON.stringify(trendAxis)}`);
    await page.locator('#lensModal.active > .lens-modal').screenshot({ path: path.join(outDir, 'stats-summary-trend.png') });
    await closeLensModals(page);

    await clickAndWaitModal(page, '.stats-role-pill[role="button"].role-initiator', '.stats-role-history-row');
    const roleHistory = await page.evaluate(() => ({
      rows: document.querySelectorAll('.stats-role-history-row').length,
      iconBeforeName: [...document.querySelectorAll('.stats-role-history-agent')].every(row => row.firstElementChild?.tagName === 'IMG' && row.lastElementChild?.textContent?.trim())
    }));
    assert.ok(roleHistory.rows >= 2, `role history should render multiple rows: ${JSON.stringify(roleHistory)}`);
    assert.equal(roleHistory.iconBeforeName, true, `role history needs agent icon before name text: ${JSON.stringify(roleHistory)}`);
    await page.locator('#lensModal.active > .lens-modal').screenshot({ path: path.join(outDir, 'role-history.png') });
    await closeLensModals(page);

    const trendCards = await page.locator('#statsPerformanceChart .stats-trend-card').count();
    assert.ok(trendCards > 0, 'recent match trend cards should exist');
    for (let index = 0; index < Math.min(3, trendCards); index += 1) {
      await page.locator('#statsPerformanceChart .stats-trend-card').nth(index).click({ force: true });
      await page.waitForSelector('#lensModal.active #lensStatsListSecondary', { timeout: 6000 });
      await closeLensModals(page);
    }

    const hoverTargets = await page.evaluate(() => {
      const selectors = [
        '#statsActSelector',
        '#statsAgentsList .stats-agent-mini-card:not([disabled])',
        '#statsAgentsList .stats-agent-row:not([disabled])',
        '#statsWeaponsList .stats-weapon-tile.has-data:not([disabled])',
        '#statsWeaponsList .stats-desktop-weapon-tile:not([disabled])',
        '#statsWeaponsList .stats-desktop-weapon-family-card:not([disabled])',
        '#statsWeaponsList .stats-weapon-family-row.has-data:not([disabled])'
      ];
      return selectors.filter(selector => {
        const element = document.querySelector(selector);
        if (!element) return false;
        const box = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      }).slice(0, 3);
    });
    assert.ok(hoverTargets.length >= 2, `expected visible stats hover targets, got ${JSON.stringify(hoverTargets)}`);
    const hoverResults = [];
    for (const selector of hoverTargets) {
      const result = await hoverSnapshot(page, selector);
      const changed = result.after.background !== result.before.background
        || result.after.boxShadow !== result.before.boxShadow
        || result.after.transform !== result.before.transform;
      assert.equal(changed, true, `${selector} should gain hover fill/glow: ${JSON.stringify(result)}`);
      hoverResults.push({
        selector,
        changedBackground: result.after.background !== result.before.background,
        changedShadow: result.after.boxShadow !== result.before.boxShadow,
        changedTransform: result.after.transform !== result.before.transform
      });
    }

    await page.locator('#statsPeakRankIcon').click({ force: true });
    await page.waitForSelector('#lensModal.active .stats-lifetime-rank-chart', { timeout: 8000 });
    const lifetime = await page.evaluate(() => {
      const chart = document.querySelector('.stats-lifetime-rank-chart');
      const box = chart.getBoundingClientRect();
      return {
        width: box.width,
        viewport: window.innerWidth,
        dataPoints: document.querySelectorAll('.stats-lifetime-rank-dot').length,
        rankMarkers: document.querySelectorAll('.stats-lifetime-rank-marker').length
      };
    });
    assert.ok(lifetime.width >= lifetime.viewport * 0.78, `lifetime chart should be full-width: ${JSON.stringify(lifetime)}`);
    assert.ok(lifetime.rankMarkers > 0 && lifetime.rankMarkers < lifetime.dataPoints, `only rank changes should get rank markers: ${JSON.stringify(lifetime)}`);
    await page.locator('#lensModal.active > .lens-modal').screenshot({ path: path.join(outDir, 'lifetime-rank-chart.png') });
    await forceClearModals(page);

    await page.screenshot({ path: path.join(outDir, 'stats-page-final.png'), fullPage: true });
    assert.deepEqual(issues, [], `console errors during nav/loadout/stats pass: ${JSON.stringify(issues, null, 2)}`);
    console.log(JSON.stringify({
      navResults,
      navClip,
      loadout,
      topMapAgents,
      trendAxis,
      roleHistory,
      trendCardsClicked: Math.min(3, trendCards),
      hoverResults,
      lifetime
    }, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
