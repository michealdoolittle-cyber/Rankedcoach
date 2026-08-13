"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41869;
const outDir = path.resolve(__dirname, "test-results", "nav-loadout-stats-followup-verified");
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
  const radiantActRR = Number(overrides.radiantActRR);
  const isRadiant = Number.isFinite(radiantActRR);
  const absoluteOverride = Number(overrides.absoluteRr);
  const absolute = isRadiant
    ? 2100 + Math.max(450, radiantActRR)
    : Number.isFinite(absoluteOverride)
      ? absoluteOverride
      : 1330 + (index * 18) + (overrides.rrDelta || 0) + (overrides.seasonBoost || 0);
  const tier = overrides.rank || (isRadiant ? "Radiant" : absolute >= 1500 ? "Diamond 1" : absolute >= 1400 ? "Platinum 3" : "Platinum 2");
  const playedAt = overrides.playedAt || `2026-08-${String(index + 1).padStart(2, "0")}T16:00:00.000Z`;
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
    season: overrides.season || "season-2026-act-4",
    seasonId: overrides.seasonId || overrides.season || "season-2026-act-4",
    act: overrides.act || "Season 2026 Act 4",
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
    rrTotal: isRadiant ? Math.max(450, radiantActRR) : absolute % 100,
    rr: rrDelta,
    verifiedRrDelta: rrDelta,
    rrVerified: true,
    metadata: { matchId: `nav-loadout-match-${index}`, source: "henrik_sync", playedAt, season: overrides.season || "season-2026-act-4", seasonId: overrides.seasonId || overrides.season || "season-2026-act-4", act: overrides.act || "Season 2026 Act 4", agent, mapName: map, result, rank: tier, queue: { id: "competitive", name: "Competitive", modeType: "Standard" } },
    matchRecord: { playedAt, source: "henrik_sync", act: overrides.act || "Season 2026 Act 4", rank: { rank: tier, rr: isRadiant ? Math.max(450, radiantActRR) : absolute % 100, rrDelta, verified: true }, trackedPlayer: { competitiveTier: isRadiant ? 27 : 17 } },
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
      makeMatch(0, { agent: "Sova", role: "initiator", map: "Haven", result: "win", acs: 172, hs: 21, playedAt: "2026-06-01T16:00:00.000Z", act: "Season 2026 Act 2", season: "season-2026-act-2", seasonId: "season-2026-act-2", rank: "Ascendant 3", absoluteRr: 2034 }),
      makeMatch(1, { agent: "Skye", role: "initiator", map: "Lotus", result: "loss", acs: 151, hs: 18, playedAt: "2026-06-02T16:00:00.000Z", act: "Season 2026 Act 2", season: "season-2026-act-2", seasonId: "season-2026-act-2", rank: "Ascendant 3", absoluteRr: 2012 }),
      makeMatch(2, { agent: "Sova", role: "initiator", map: "Sunset", result: "win", acs: 221, hs: 29, playedAt: "2026-07-01T16:00:00.000Z", act: "Season 2026 Act 3", season: "season-2026-act-3", seasonId: "season-2026-act-3", radiantActRR: 512 }),
      makeMatch(3, { agent: "Jett", role: "duelist", map: "Ascent", result: "loss", acs: 164, hs: 17, playedAt: "2026-07-02T16:00:00.000Z", act: "Season 2026 Act 3", season: "season-2026-act-3", seasonId: "season-2026-act-3", seasonBoost: 20 }),
      makeMatch(4, { agent: "Sova", role: "initiator", map: "Breeze", result: "win", acs: 247, hs: 33 }),
      makeMatch(5, { agent: "Omen", role: "controller", map: "Haven", result: "loss", acs: 118, hs: 14 }),
      makeMatch(6, { agent: "Skye", role: "initiator", map: "Breeze", result: "win", acs: 276, hs: 39 })
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
    document.querySelectorAll(".page.daily-entrance-page-pending").forEach(page => page.classList.remove("daily-entrance-page-pending"));
    document.querySelectorAll(".modal-overlay,.modal-backdrop,.lens-modal-overlay,#guestChoiceModal,#dailyEntranceOverlay,#dailyWarmupModal,#weeklyFocusModal,#lensModal,#matchSummaryModal").forEach(element => {
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("pointer-events", "none", "important");
      element.hidden = true;
      element.classList.remove("show", "is-active", "active", "is-opening", "is-closing", "visible");
      element.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("has-active-modal", "mobile-modal-open");
    document.body.classList.add("nav-loadout-stats-test-ready");
    if (!document.getElementById("navLoadoutStatsTestStyle")) {
      const style = document.createElement("style");
      style.id = "navLoadoutStatsTestStyle";
      style.textContent = `
        body.nav-loadout-stats-test-ready #page-home .home-middle-row,
        body.nav-loadout-stats-test-ready #page-home .home-middle-row > *,
        body.nav-loadout-stats-test-ready #page-home .compass-score-card{
          opacity:1 !important;
          visibility:visible !important;
        }
      `;
      document.head.appendChild(style);
    }
  });
  await page.waitForTimeout(250);
}

async function collectHoverEvidence(page, selector) {
  const locator = page.locator(selector).first();
  await locator.scrollIntoViewIfNeeded();
  await page.mouse.move(2, 2);
  await page.waitForTimeout(60);
  const before = await locator.evaluate((element, selectorArg) => {
    const style = getComputedStyle(element);
    const rules = [];
    const selectorNeedles = [
      element.id,
      ...Array.from(element.classList || [])
    ].filter(Boolean);
    const makeNonInteractiveSelector = (selectorText = "") => selectorText
      .replace(/:hover/g, "")
      .replace(/:focus-visible/g, "")
      .replace(/:focus/g, "");
    for (const sheet of Array.from(document.styleSheets)) {
      let cssRules = [];
      try { cssRules = Array.from(sheet.cssRules || []); } catch { continue; }
      for (const rule of cssRules) {
        if (!rule.selectorText || !selectorNeedles.some(needle => rule.selectorText.includes(needle))) continue;
        try {
          if (element.matches(makeNonInteractiveSelector(rule.selectorText))) {
            rules.push({ selector: rule.selectorText, background: rule.style.background || rule.style.backgroundColor || "", css: rule.cssText.slice(0, 260) });
          }
        } catch {}
      }
    }
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      boxShadow: style.boxShadow,
      transform: style.transform,
      matchedRules: rules.slice(-8)
    };
  }, selector);
  const box = await locator.boundingBox();
  assert.ok(box && box.width > 0 && box.height > 0, `${selector} should be visible`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(140);
  const after = await locator.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      backgroundImage: style.backgroundImage,
      boxShadow: style.boxShadow,
      transform: style.transform,
      hover: element.matches(":hover")
    };
  });
  return { selector, before, after };
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
  await page.waitForFunction(() => {
    const full = document.getElementById("lensModalOverlay");
    const compact = document.getElementById("lensModal");
    return !full?.classList.contains("active") && !compact?.classList.contains("active");
  }, null, { timeout: 5000 }).catch(async () => {
    await forceClearModals(page);
  });
  await page.waitForTimeout(120);
}

async function forceClearModals(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.page.daily-entrance-page-pending').forEach(page => page.classList.remove('daily-entrance-page-pending'));
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

async function forceHomeMotionSettled(page) {
  await page.evaluate(() => {
    document.body.classList.add("nav-loadout-stats-test-ready");
    document.querySelectorAll('.page.daily-entrance-page-pending').forEach(page => page.classList.remove('daily-entrance-page-pending'));
    document.querySelectorAll("#page-home .home-middle-row, #page-home .home-middle-row > *, #page-home .compass-score-card, #page-home #compassCardAim").forEach(element => {
      element.style.setProperty("opacity", "1", "important");
      element.style.setProperty("visibility", "visible", "important");
    });
  });
}

async function activateStatsPage(page) {
  const activeStatsPage = await page.evaluate(() => globalThis.RankedCoachTestHooks.activatePageForTest("stats"));
  assert.equal(activeStatsPage, "page-stats", `stats page should activate through real navigation hook, got ${activeStatsPage}`);
  await forceClearModals(page);
  await page.evaluate(() => {
    const statsPage = document.getElementById("page-stats");
    if (!statsPage) return;
    statsPage.classList.remove("daily-entrance-page-pending");
    statsPage.style.removeProperty("opacity");
    statsPage.style.removeProperty("pointer-events");
  });
  await page.waitForSelector('#page-stats.active #statsPerformanceChart .stats-trend-card', { timeout: 10000 });
  await page.waitForTimeout(160);
}

async function selectThemeThroughRealUi(page, themeKey) {
  await page.evaluate(() => {
    const dropdown = document.getElementById("profileDropdown");
    dropdown?.classList.remove("open");
    document.getElementById("profileDropdownToggle")?.click();
    if (!dropdown?.classList.contains("open")) dropdown?.classList.add("open");
  });
  await page.waitForSelector('#profileDropdown.open #pdOpenSettings', { timeout: 5000 });
  await page.locator('#pdOpenSettings').click();
  await page.waitForSelector('#editProfileModal.active #editProfileThemeGallery [data-theme-card]', { timeout: 8000 });
  await page.evaluate(() => {
    const modal = document.getElementById("editProfileModal");
    if (!modal) return;
    modal.hidden = false;
    modal.style.removeProperty("display");
    modal.style.removeProperty("pointer-events");
  });
  const selector = `#editProfileThemeGallery [data-theme-card="${themeKey}"]`;
  await page.waitForFunction(key => Boolean(document.querySelector(`#editProfileThemeGallery [data-theme-card="${CSS.escape(key)}"]`)), themeKey, { timeout: 5000 });
  let clicked = false;
  for (let attempt = 0; attempt < 3 && !clicked; attempt += 1) {
    try {
      await page.locator(selector).first().click({ timeout: 5000 });
      clicked = true;
    } catch (error) {
      if (attempt === 2) throw error;
      await page.waitForTimeout(150);
    }
  }
  await page.waitForFunction(key => {
    const selected = document.querySelector('#editProfileTheme')?.value;
    const active = document.querySelector(`#editProfileThemeGallery [data-theme-card="${CSS.escape(key)}"]`)?.classList.contains('is-active');
    return selected === key && active;
  }, themeKey, { timeout: 5000 });
  const evidence = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const button = document.querySelector('#roleButtons .role-filter-btn[data-role="any"]');
    const buttonStyle = button ? getComputedStyle(button) : null;
    return {
      theme: document.getElementById("editProfileTheme")?.value || "",
      bodyTheme: document.body.dataset.theme || "",
      accent: rootStyle.getPropertyValue("--accent").trim(),
      background: buttonStyle?.backgroundImage || buttonStyle?.backgroundColor || "",
      buttonText: button?.textContent?.trim() || ""
    };
  });
  await page.locator('#editProfileSave').click();
  await page.waitForFunction(() => !document.getElementById("editProfileModal")?.classList.contains("active"), null, { timeout: 5000 });
  await page.waitForFunction(key => document.body.dataset.theme === key, themeKey, { timeout: 5000 });
  evidence.savedBodyTheme = await page.evaluate(() => document.body.dataset.theme || "");
  await forceClearModals(page);
  return evidence;
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
      { label: "home tab", selector: '.nav-btn[data-page="home"]' },
      { label: "sync", selector: '#profileSyncBtn' },
      { label: "bug", selector: '#bugReportOpen' },
      { label: "ask coach", selector: '#askCoachOpen' },
      { label: "settings", selector: '#profileDropdownToggle' },
      { label: "data depth", selector: '#profileRatingWidget' }
    ];
    const navResults = [];
    for (const { label, selector } of navSelectors) {
      const result = await hoverSnapshot(page, selector);
      const changed = result.after.background !== result.before.background
        || result.after.boxShadow !== result.before.boxShadow
        || result.after.transform !== result.before.transform;
      assert.equal(changed, true, `${selector} (${label}) should visibly change on hover: ${JSON.stringify(result)}`);
      navResults.push({
        label,
        selector,
        changedBackground: result.after.background !== result.before.background,
        changedShadow: result.after.boxShadow !== result.before.boxShadow,
        changedTransform: result.after.transform !== result.before.transform
      });
    }
    await page.evaluate(() => {
      const dropdown = document.getElementById("profileDropdown");
      dropdown?.classList.remove("open");
      document.getElementById("profileDropdownToggle")?.click();
      if (!dropdown?.classList.contains("open")) dropdown?.classList.add("open");
    });
    await page.waitForSelector('#profileDropdown.open #pdOpenSettings', { timeout: 5000 });
    const pdOpenSettingsHover = await hoverSnapshot(page, '#pdOpenSettings');
    const pdOpenSettingsChanged = pdOpenSettingsHover.after.background !== pdOpenSettingsHover.before.background
      || pdOpenSettingsHover.after.boxShadow !== pdOpenSettingsHover.before.boxShadow
      || pdOpenSettingsHover.after.transform !== pdOpenSettingsHover.before.transform;
    assert.equal(pdOpenSettingsChanged, true, `#pdOpenSettings should gain hover treatment through the real profile menu: ${JSON.stringify(pdOpenSettingsHover)}`);
    await page.evaluate(() => document.getElementById("profileDropdown")?.classList.remove("open"));

    const navClip = await page.evaluate(() => {
      const appRoot = document.querySelector(".app-root");
      const appScale = document.querySelector(".app-scale-wrap");
      const left = document.querySelector(".nav-left")?.getBoundingClientRect();
      const navLinks = document.querySelector(".nav-links");
      const buttons = [...document.querySelectorAll(".nav-left .nav-btn")].map(button => button.getBoundingClientRect());
      const appRootStyle = appRoot ? getComputedStyle(appRoot) : null;
      const appScaleStyle = appScale ? getComputedStyle(appScale) : null;
      const navLeftStyle = left ? getComputedStyle(document.querySelector(".nav-left")) : null;
      const navLinksStyle = navLinks ? getComputedStyle(navLinks) : null;
      const beforeInside = buttons.every(box => box.left >= left.left - 1 && box.right <= left.right + 1 && box.top >= left.top - 1 && box.bottom <= left.bottom + 1);
      return {
        left,
        appRootOverflow: appRootStyle?.overflow || "",
        appRootOverflowX: appRootStyle?.overflowX || "",
        appRootOverflowY: appRootStyle?.overflowY || "",
        appScaleOverflow: appScaleStyle?.overflow || "",
        navLeftOverflow: navLeftStyle?.overflow || "",
        navLinksOverflow: navLinksStyle?.overflow || "",
        inside: beforeInside,
        buttonCount: buttons.length
      };
    });
    assert.equal(navClip.appRootOverflow, "visible", `desktop app root must allow header pop/glow overflow: ${JSON.stringify(navClip)}`);
    assert.equal(navClip.appScaleOverflow, "visible", `desktop scale wrapper must allow header pop/glow overflow: ${JSON.stringify(navClip)}`);
    assert.equal(navClip.navLeftOverflow, "visible", `desktop nav-left must allow button pop/glow overflow: ${JSON.stringify(navClip)}`);
    assert.equal(navClip.navLinksOverflow, "visible", `desktop nav-links must allow button pop/glow overflow: ${JSON.stringify(navClip)}`);
    assert.equal(navClip.inside, true, `nav-left buttons must not clip: ${JSON.stringify(navClip)}`);
    await page.evaluate(() => {
      document.querySelectorAll(".app-header .nav-btn").forEach((button, index) => {
        button.style.animation = "none";
        void button.offsetWidth;
        button.style.animation = `rc-control-pop .8s cubic-bezier(.2,.84,.24,1) ${index * 35}ms both`;
      });
    });
    await page.waitForTimeout(220);
    const navPopMidFlight = await page.evaluate(() => {
      const header = document.querySelector(".app-header")?.getBoundingClientRect();
      const left = document.querySelector(".nav-left")?.getBoundingClientRect();
      const buttons = [...document.querySelectorAll(".nav-left .nav-btn")].map(button => {
        const box = button.getBoundingClientRect();
        const style = getComputedStyle(button);
        return { width: box.width, height: box.height, transform: style.transform, animationName: style.animationName };
      });
      return {
        header: header ? { width: header.width, height: header.height } : null,
        left: left ? { width: left.width, height: left.height } : null,
        buttons,
        animated: buttons.some(button => button.animationName.includes("rc-control-pop") || button.transform !== "none")
      };
    });
    assert.equal(navPopMidFlight.animated, true, `nav pop animation should be visible mid-flight: ${JSON.stringify(navPopMidFlight)}`);
    await page.locator('.app-header').screenshot({ path: path.join(outDir, 'nav-left-pop-midflight.png') });

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
        spinSquareDelta: spin ? Math.abs(spin.width - spin.height) : null,
        frameSquareDelta: frame ? Math.abs(frame.width - frame.height) : null,
        gapRolesToSpin: Math.round(spin.y - roles.bottom),
        gapMiddleToInfo: Math.round(info.y - Math.max(spin.bottom, frame.bottom)),
        loadoutTransform: getComputedStyle(document.querySelector('.loadout-card')).transform
      };
    });
    assert.ok(loadout.roleButtons.every(button => button.delta <= 1.25), `role buttons must be square: ${JSON.stringify(loadout.roleButtons)}`);
    assert.ok(loadout.spinSquareDelta <= 1.25, `spin button should be square to its height: ${JSON.stringify(loadout.spin)}`);
    assert.ok(loadout.frameSquareDelta <= 1.25, `agent frame should be square to its height: ${JSON.stringify(loadout.frame)}`);
    assert.ok(Math.abs(loadout.gapRolesToSpin - 7) <= 1, `roles-to-spin gap should be 7px: ${JSON.stringify(loadout)}`);
    assert.ok(Math.abs(loadout.gapMiddleToInfo - 7) <= 1, `middle-to-info gap should be 7px: ${JSON.stringify(loadout)}`);
    const mapPicker = await page.evaluate(async () => {
      const trigger = document.getElementById("loadoutMapPicker");
      trigger?.click();
      await new Promise(resolve => setTimeout(resolve, 80));
      const none = document.querySelector(".loadout-map-choice-none");
      const noneTextStyles = [...(none?.querySelectorAll("span,small") || [])].map(node => {
        const style = getComputedStyle(node);
        return {
          tag: node.tagName,
          text: node.textContent.trim(),
          backgroundColor: style.backgroundColor,
          backgroundImage: style.backgroundImage,
          boxShadow: style.boxShadow,
          textShadow: style.textShadow
        };
      });
      const before = {
        display: document.getElementById("loadoutMapDisplay")?.textContent?.trim(),
        selectedClass: trigger?.classList.contains("is-map-selected"),
        noneText: none?.textContent?.replace(/\s+/g, " ").trim(),
        noneTextStyles
      };
      none?.click();
      await new Promise(resolve => setTimeout(resolve, 120));
      return {
        before,
        after: {
          display: document.getElementById("loadoutMapDisplay")?.textContent?.trim(),
          selectedClass: trigger?.classList.contains("is-map-selected"),
          profileMap: globalThis.RankedCoachTestHooks ? JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.loadoutMap : null
        }
      };
    });
    assert.equal(mapPicker.before.display, "Breeze", `fixture should begin with Breeze selected: ${JSON.stringify(mapPicker)}`);
    assert.match(mapPicker.before.noneText || "", /None/i, `None choice should be visible: ${JSON.stringify(mapPicker)}`);
    assert.ok(mapPicker.before.noneTextStyles.every(style => style.backgroundColor === "rgba(0, 0, 0, 0)" && style.backgroundImage === "none" && style.boxShadow === "none" && style.textShadow === "none"), `None option inner text should not carry its own black backing: ${JSON.stringify(mapPicker.before.noneTextStyles)}`);
    assert.equal(mapPicker.after.display, "Any map", `None choice should clear the map picker: ${JSON.stringify(mapPicker)}`);
    assert.equal(mapPicker.after.selectedClass, false, `Map trigger selected styling should clear: ${JSON.stringify(mapPicker)}`);
    await page.locator('#loadoutMapPicker').click({ force: true });
    await page.locator('.loadout-map-choice[data-loadout-map="Breeze"]').click({ force: true });
    await page.waitForTimeout(160);
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
    await forceClearModals(page);
    await page.locator('#page-home .home-middle-row > .loadout-card').screenshot({ path: path.join(outDir, 'loadout-card.png') });

    await forceClearModals(page);
    const activeHomePage = await page.evaluate(() => globalThis.RankedCoachTestHooks.activatePageForTest("home"));
    assert.equal(activeHomePage, "page-home", `home page should activate through test hook, got ${activeHomePage}`);
    await forceHomeMotionSettled(page);
    await page.waitForFunction(() => {
      const element = document.querySelector("#page-home.active #compassCardAim");
      if (!element) return false;
      const box = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden";
    }, null, { timeout: 8000 });
    await page.waitForTimeout(160);
    await clickAndWaitModal(page, '#compassCardAim', '#lensModalOverlay.active #lensStatsList');
    const compassModalTitle = await page.locator('#lensModalOverlay.active #lensModalTitle').innerText();
    assert.ok(/Aim|Score|Review|Breakdown/i.test(compassModalTitle), `compass card should open lens modal, got ${compassModalTitle}`);
    await forceClearModals(page);
    const compassHover = await collectHoverEvidence(page, '#compassCardAim');
    assert.notEqual(
      `${compassHover.after.backgroundColor}|${compassHover.after.backgroundImage}`,
      `${compassHover.before.backgroundColor}|${compassHover.before.backgroundImage}`,
      `compass card hover should change background: ${JSON.stringify(compassHover)}`
    );

    await activateStatsPage(page);
    await page.waitForSelector('#statsMapsList .stats-map-card', { timeout: 10000 });
    const roleHover = await collectHoverEvidence(page, '.stats-role-pill[role="button"].role-initiator');
    assert.notEqual(
      `${roleHover.after.backgroundColor}|${roleHover.after.backgroundImage}`,
      `${roleHover.before.backgroundColor}|${roleHover.before.backgroundImage}`,
      `role win-rate pill hover should change background: ${JSON.stringify(roleHover)}`
    );
    await clickAndWaitModal(page, '.stats-summary-trend-trigger[data-stats-summary-metric="acs"]', '.stats-summary-trend-chart');
    const trendAxis = await page.evaluate(() => ({
      yTicks: document.querySelectorAll('.stats-summary-trend-y-axis span').length,
      gridlines: document.querySelectorAll('.stats-summary-trend-gridline').length,
      bars: document.querySelectorAll('.stats-summary-trend-point').length,
      barsBorderBottom: getComputedStyle(document.querySelector('.stats-summary-trend-bars')).borderBottomWidth,
      scrollbarReserve: (() => {
        const plot = document.querySelector('.stats-summary-trend-plot')?.getBoundingClientRect();
        const bars = document.querySelector('.stats-summary-trend-bars')?.getBoundingClientRect();
        if (!plot || !bars) return null;
        return Math.round(plot.bottom - bars.bottom);
      })(),
      zeroCenterDelta: (() => {
        const spans = [...document.querySelectorAll('.stats-summary-trend-y-axis span')];
        const zero = spans[spans.length - 1]?.getBoundingClientRect();
        const gridline = [...document.querySelectorAll('.stats-summary-trend-gridline')].at(-1)?.getBoundingClientRect();
        if (!zero || !gridline) return null;
        return Math.abs((zero.top + zero.height / 2) - gridline.bottom);
      })()
    }));
    assert.ok(trendAxis.yTicks > 2, `stats summary trend needs more than two y-axis ticks: ${JSON.stringify(trendAxis)}`);
    assert.ok(trendAxis.gridlines > 2, `stats summary trend needs gridlines: ${JSON.stringify(trendAxis)}`);
    assert.equal(trendAxis.barsBorderBottom, "0px", `bar layer should not paint a duplicate baseline through the scrollbar area: ${JSON.stringify(trendAxis)}`);
    assert.ok(trendAxis.scrollbarReserve >= 20, `trend plot should reserve scrollbar space below the baseline: ${JSON.stringify(trendAxis)}`);
    assert.ok(trendAxis.zeroCenterDelta <= 9, `stats summary zero tick should align with x-axis baseline: ${JSON.stringify(trendAxis)}`);
    await page.locator('#lensModal.active > .lens-modal').screenshot({ path: path.join(outDir, 'stats-summary-trend.png') });
    await closeLensModals(page);

    await clickAndWaitModal(page, '.stats-role-pill[role="button"].role-initiator', '.stats-role-history-row');
    const roleHistory = await page.evaluate(() => ({
      rows: document.querySelectorAll('.stats-role-history-row').length,
      labels: [...document.querySelectorAll('.stats-role-history-row strong')].map(node => node.textContent.trim()),
      iconBeforeName: [...document.querySelectorAll('.stats-role-history-agent')].every(row => row.firstElementChild?.tagName === 'IMG' && row.lastElementChild?.textContent?.trim())
    }));
    assert.ok(roleHistory.rows >= 2, `role history should render multiple rows: ${JSON.stringify(roleHistory)}`);
    assert.deepEqual(roleHistory.labels.slice(0, 2), ["Match 3", "Match 1"], `role history should use season-scoped match numbers newest-first: ${JSON.stringify(roleHistory)}`);
    assert.equal(roleHistory.iconBeforeName, true, `role history needs agent icon before name text: ${JSON.stringify(roleHistory)}`);
    await page.locator('#lensModal.active > .lens-modal').screenshot({ path: path.join(outDir, 'role-history.png') });
    await closeLensModals(page);

    const trendCards = await page.locator('#statsPerformanceChart .stats-trend-card').count();
    assert.ok(trendCards > 0, 'recent match trend cards should exist');
    const trendCardBoxes = await page.evaluate(() => {
      const cards = [...document.querySelectorAll('#statsPerformanceChart .stats-trend-card')];
      const boxes = cards.map((card, index) => {
        const rect = card.getBoundingClientRect();
        const target = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
          index,
          text: card.textContent.replace(/\s+/g, " ").trim().slice(0, 80),
          left: rect.left,
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          inert: card.inert,
          ariaHidden: card.getAttribute("aria-hidden"),
          hitTag: target?.tagName || "",
          hitId: target?.id || "",
          hitClass: String(target?.className || ""),
          hitSameCard: target === card || Boolean(target?.closest?.(".stats-trend-card") === card)
        };
      });
      const overlaps = [];
      for (let leftIndex = 0; leftIndex < boxes.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < boxes.length; rightIndex += 1) {
          const left = boxes[leftIndex];
          const right = boxes[rightIndex];
          const overlapX = Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left));
          const overlapY = Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top));
          if (overlapX > 1 && overlapY > 1) overlaps.push({ pair: [left.index, right.index], overlapX, overlapY });
        }
      }
      return { boxes, overlaps };
    });
    assert.equal(trendCardBoxes.overlaps.length, 0, `desktop trend cards should not overlap: ${JSON.stringify(trendCardBoxes)}`);
    assert.ok(trendCardBoxes.boxes.every(box => box.hitSameCard && box.inert === false && box.ariaHidden !== "true"), `desktop trend cards must receive their own center hit target and not be inert: ${JSON.stringify(trendCardBoxes)}`);
    const longTrendCopy = await page.evaluate(() => {
      const detail = document.querySelector('#statsPerformanceChart .stats-trend-card .stats-trend-detail');
      const card = detail?.closest('.stats-trend-card');
      const longText = "Constructed long-copy fixture: this read intentionally spans multiple clauses so the card proves it uses a deliberate clamp instead of slicing the bottom half of the sentence when real coaching language gets longer.";
      if (detail) {
        detail.textContent = longText;
        detail.setAttribute("title", longText);
      }
      const style = detail ? getComputedStyle(detail) : null;
      const detailBox = detail?.getBoundingClientRect();
      const cardBox = card?.getBoundingClientRect();
      return {
        text: detail?.textContent || "",
        title: detail?.getAttribute("title") || "",
        webkitLineClamp: style?.webkitLineClamp || "",
        overflow: style?.overflow || "",
        detailHeight: detailBox?.height || 0,
        detailScrollHeight: detail?.scrollHeight || 0,
        cardHeight: cardBox?.height || 0,
        cardScrollHeight: card?.scrollHeight || 0,
        cardOverflow: card ? getComputedStyle(card).overflow : "",
        detailInsideCard: Boolean(detailBox && cardBox && detailBox.bottom <= cardBox.bottom + 1)
      };
    });
    assert.equal(longTrendCopy.webkitLineClamp, "3", `long trend detail should use an intentional 3-line clamp: ${JSON.stringify(longTrendCopy)}`);
    assert.equal(longTrendCopy.detailInsideCard, true, `long trend detail should not be abruptly cut outside the card: ${JSON.stringify(longTrendCopy)}`);
    assert.ok(longTrendCopy.detailScrollHeight >= longTrendCopy.detailHeight, `constructed detail should remain readable via title while visually clamped: ${JSON.stringify(longTrendCopy)}`);
    await page.locator('#statsPerformanceChart .stats-trend-card').first().screenshot({ path: path.join(outDir, 'stats-trend-long-copy.png') });
    const trendCardModalTitles = [];
    for (let index = 0; index < trendCards; index += 1) {
      await page.locator('#statsPerformanceChart .stats-trend-card').nth(index).scrollIntoViewIfNeeded();
      await page.locator('#statsPerformanceChart .stats-trend-card').nth(index).click({ timeout: 6000 });
      await page.waitForSelector('#lensModal.active #lensStatsListSecondary', { timeout: 6000 });
      trendCardModalTitles.push(await page.locator('#lensModal.active #lensModalTitleSecondary').innerText());
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

    await page.evaluate(() => globalThis.RankedCoachTestHooks.openStatsPeakLifetimeRankChart());
    await page.waitForSelector('#lensModal.active .stats-lifetime-rank-chart', { timeout: 8000 });
    const lifetime = await page.evaluate(() => {
      const chart = document.querySelector('.stats-lifetime-rank-chart');
      const box = chart.getBoundingClientRect();
      return {
        width: box.width,
        viewport: window.innerWidth,
        dataPoints: document.querySelectorAll('.stats-lifetime-rank-dot').length,
        rankMarkers: document.querySelectorAll('.stats-lifetime-rank-marker').length,
        markerTextCount: document.querySelectorAll('.stats-lifetime-rank-marker text').length,
        peakMarkers: document.querySelectorAll('.stats-lifetime-rank-marker.is-peak').length,
        radiantPeakMarkers: document.querySelectorAll('.stats-lifetime-rank-marker.is-peak.is-radiant-peak').length,
        radiantPeakText: document.querySelector('.stats-lifetime-rank-marker.is-peak.is-radiant-peak .stats-lifetime-rank-rr')?.textContent?.trim() || "",
        rankLabels: [...document.querySelectorAll('.stats-lifetime-rank-marker')].map(marker => marker.dataset.rankLabel || ""),
        markerTabindexes: [...document.querySelectorAll('.stats-lifetime-rank-marker')].map(marker => marker.getAttribute("tabindex") || ""),
        markerRoles: [...document.querySelectorAll('.stats-lifetime-rank-marker')].map(marker => marker.getAttribute("role") || ""),
        markerAriaLabels: [...document.querySelectorAll('.stats-lifetime-rank-marker')].map(marker => marker.getAttribute("aria-label") || ""),
        yAxisTextCount: document.querySelectorAll('.stats-lifetime-rank-y-tick text').length,
        xTickLabels: [...document.querySelectorAll('.stats-lifetime-rank-x-tick text')].map(node => node.textContent.trim()),
        rawSeasonKeyLabels: [...document.querySelectorAll('.stats-lifetime-rank-x-tick text')].filter(node => /season[-_]|act[-_]/i.test(node.textContent)).length,
        arrowClasses: document.querySelectorAll('.stats-lifetime-rank-up,.stats-lifetime-rank-down').length
      };
    });
    assert.ok(lifetime.width >= lifetime.viewport * 0.78, `lifetime chart should be full-width: ${JSON.stringify(lifetime)}`);
    assert.equal(lifetime.rankMarkers, lifetime.dataPoints, `seasonal peak chart should mark only plotted season peaks: ${JSON.stringify(lifetime)}`);
    assert.equal(lifetime.markerTextCount, 1, `lifetime chart should only render Radiant peak RR text, not rank-up/down arrow text: ${JSON.stringify(lifetime)}`);
    assert.equal(lifetime.peakMarkers, 1, `highest recorded peak should be uniquely highlighted: ${JSON.stringify(lifetime)}`);
    assert.equal(lifetime.radiantPeakMarkers, 1, `Radiant highest peak should carry the Radiant peak marker class: ${JSON.stringify(lifetime)}`);
    assert.match(lifetime.radiantPeakText, /^512 RR$/, `Radiant peak should show the actual peak RR: ${JSON.stringify(lifetime)}`);
    assert.ok(lifetime.rankLabels.some(label => /Ascendant 3/i.test(label)), `constructed lifetime fixture should include an Ascendant 3 seasonal peak marker: ${JSON.stringify(lifetime)}`);
    assert.ok(lifetime.markerTabindexes.every(value => value === "0"), `rank markers should be keyboard focusable for hover/focus treatment: ${JSON.stringify(lifetime)}`);
    assert.ok(lifetime.markerRoles.every(value => value === "img"), `rank markers should expose readable image semantics while remaining focusable for visual treatment: ${JSON.stringify(lifetime)}`);
    assert.ok(lifetime.markerAriaLabels.some(label => /512 RR/i.test(label)), `Radiant marker aria-label should include the real RR value: ${JSON.stringify(lifetime)}`);
    assert.equal(lifetime.yAxisTextCount, 0, `lifetime y-axis should use rank icons only: ${JSON.stringify(lifetime)}`);
    assert.ok(lifetime.xTickLabels.length >= 3, `lifetime x-axis should show season labels: ${JSON.stringify(lifetime)}`);
    assert.equal(lifetime.rawSeasonKeyLabels, 0, `lifetime x-axis should not expose raw internal season keys: ${JSON.stringify(lifetime)}`);
    assert.equal(lifetime.arrowClasses, 0, `lifetime chart should not keep rank-up/down arrow classes: ${JSON.stringify(lifetime)}`);
    const markerHover = await page.evaluate(async () => {
      const marker = document.querySelector('.stats-lifetime-rank-marker.is-peak');
      const circle = marker?.querySelector('circle');
      if (!marker || !circle) return null;
      const before = {
        stroke: getComputedStyle(circle).stroke,
        strokeWidth: getComputedStyle(circle).strokeWidth,
        filter: getComputedStyle(circle).filter
      };
      marker.focus();
      await new Promise(resolve => setTimeout(resolve, 80));
      const afterFocus = {
        focused: document.activeElement === marker,
        stroke: getComputedStyle(circle).stroke,
        strokeWidth: getComputedStyle(circle).strokeWidth,
        filter: getComputedStyle(circle).filter
      };
      return { before, afterFocus };
    });
    assert.equal(markerHover.afterFocus.focused, true, `peak marker should accept keyboard focus: ${JSON.stringify(markerHover)}`);
    assert.notEqual(markerHover.afterFocus.strokeWidth, markerHover.before.strokeWidth, `peak marker focus should visibly change the marker: ${JSON.stringify(markerHover)}`);
    await page.locator('#lensModal.active > .lens-modal').screenshot({ path: path.join(outDir, 'lifetime-rank-chart.png') });
    await forceClearModals(page);

    await page.locator('.nav-btn[data-page="home"]').click({ force: true });
    await page.waitForTimeout(200);
    const themeChecks = [];
    for (const themeKey of ["serpent-green", "navy-command"]) {
      themeChecks.push(await selectThemeThroughRealUi(page, themeKey));
    }
    assert.notEqual(themeChecks[0].accent, themeChecks[1].accent, `two non-default themes should expose different --accent values: ${JSON.stringify(themeChecks)}`);
    assert.notEqual(themeChecks[0].background, themeChecks[1].background, `ALL button background should respond to theme accent: ${JSON.stringify(themeChecks)}`);

    const agentOpen = await page.evaluate(() => globalThis.RankedCoachTestHooks.openAgentModalForTest());
    assert.equal(agentOpen?.ok, true, `agent modal should open from the gated test hook: ${JSON.stringify(agentOpen)}`);
    await page.waitForSelector('#agentRoleSelect .agent-role-btn.role-duelist', { timeout: 8000 });
    const agentRoleTint = await page.evaluate(() => [...document.querySelectorAll('#agentRoleSelect .agent-role-btn')].map(button => {
      const style = getComputedStyle(button);
      const image = button.querySelector('img');
      return {
        role: button.dataset.role || [...button.classList].find(name => name.startsWith('role-')),
        color: style.color,
        borderColor: style.borderColor,
        filter: image ? getComputedStyle(image).filter : ""
      };
    }));
    assert.ok(agentRoleTint.length >= 4, `agent role selector should expose all role buttons: ${JSON.stringify(agentRoleTint)}`);
    assert.ok(new Set(agentRoleTint.map(entry => entry.color)).size >= 3, `agent role selector icons/text should be role-colored: ${JSON.stringify(agentRoleTint)}`);
    await page.locator('#agentModal .agent-modal-inner').screenshot({ path: path.join(outDir, 'agent-role-selector.png') });
    await forceClearModals(page);
    await page.evaluate(() => {
      const modal = document.getElementById("agentModal");
      if (!modal) return;
      modal.style.setProperty("display", "none", "important");
      modal.style.setProperty("pointer-events", "none", "important");
      modal.hidden = true;
      modal.classList.remove("active", "is-opening", "is-closing", "show", "visible");
      modal.setAttribute("aria-hidden", "true");
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(350);
    const activeMobileHome = await page.evaluate(() => globalThis.RankedCoachTestHooks.activatePageForTest("home"));
    assert.equal(activeMobileHome, "page-home", `mobile home page should activate through test hook, got ${activeMobileHome}`);
    await forceHomeMotionSettled(page);
    const mobileSpinLabel = await page.evaluate(() => {
      const button = document.getElementById("spinAgentBtn");
      const label = button?.querySelector(".spin-loadout-label") || button?.querySelector("span");
      if (button && label) {
        button.style.setProperty("width", "64px", "important");
        button.style.setProperty("min-width", "64px", "important");
        button.style.setProperty("max-width", "64px", "important");
        button.style.setProperty("flex", "0 0 64px", "important");
        label.style.setProperty("width", "46px", "important");
        label.style.setProperty("max-width", "46px", "important");
        label.textContent = "Spin Loadout Again";
      }
      const buttonBox = button?.getBoundingClientRect();
      const labelBox = label?.getBoundingClientRect();
      const style = label ? getComputedStyle(label) : null;
      const numericLineHeight = style ? Number.parseFloat(style.lineHeight) || (Number.parseFloat(style.fontSize) * 0.95) : 0;
      return {
        text: label?.textContent?.trim() || "",
        button: buttonBox ? { left: buttonBox.left, right: buttonBox.right, width: buttonBox.width } : null,
        label: labelBox ? { left: labelBox.left, right: labelBox.right, width: labelBox.width, height: labelBox.height } : null,
        whiteSpace: style?.whiteSpace || "",
        textOverflow: style?.textOverflow || "",
        lineCount: numericLineHeight ? Math.round((labelBox?.height || 0) / numericLineHeight) : 0,
        overflows: Boolean(buttonBox && labelBox && (labelBox.left < buttonBox.left - 1 || labelBox.right > buttonBox.right + 1))
      };
    });
    assert.equal(mobileSpinLabel.whiteSpace, "normal", `mobile spin label should allow wrapping: ${JSON.stringify(mobileSpinLabel)}`);
    assert.equal(mobileSpinLabel.textOverflow, "clip", `mobile spin label should not ellipsis-truncate: ${JSON.stringify(mobileSpinLabel)}`);
    assert.ok(mobileSpinLabel.lineCount >= 2, `constructed mobile spin label should wrap to multiple lines: ${JSON.stringify(mobileSpinLabel)}`);
    assert.equal(mobileSpinLabel.overflows, false, `mobile spin label should remain inside the button: ${JSON.stringify(mobileSpinLabel)}`);
    await page.locator('#spinAgentBtn').screenshot({ path: path.join(outDir, 'mobile-spin-label-wrap.png') });
    const activeMobilePage = await page.evaluate(() => globalThis.RankedCoachTestHooks.activatePageForTest("stats"));
    assert.equal(activeMobilePage, "page-stats", `mobile stats page should activate through test hook, got ${activeMobilePage}`);
    await page.waitForSelector('#statsPerformanceChart .stats-trend-card', { timeout: 10000 });
    const mobileTrends = await page.evaluate(() => {
      const parent = document.querySelector('#statsPerformanceChart');
      const parentBox = parent?.getBoundingClientRect();
      const cards = [...document.querySelectorAll('#statsPerformanceChart .stats-trend-card')].map(card => {
        const box = card.getBoundingClientRect();
        return {
          label: card.textContent.replace(/\s+/g, " ").trim().slice(0, 80),
          width: box.width,
          height: box.height,
          top: box.top,
          bottom: box.bottom,
          clippedByParent: parentBox ? box.bottom > parentBox.bottom + 1 : false
        };
      });
      return { parent: parentBox ? { width: parentBox.width, height: parentBox.height, top: parentBox.top, bottom: parentBox.bottom } : null, cards };
    });
    assert.equal(mobileTrends.cards.length, 6, `mobile trend grid should render all six cards: ${JSON.stringify(mobileTrends)}`);
    assert.ok(mobileTrends.cards.some(card => card.width > 0 && card.height >= 64), `mobile trend carousel should expose at least one full active card: ${JSON.stringify(mobileTrends)}`);
    assert.ok(mobileTrends.cards.filter(card => card.width > 0 && card.height > 0).every(card => card.height >= 64 && !card.clippedByParent), `visible mobile trend cards should not be cut in half: ${JSON.stringify(mobileTrends)}`);
    await page.locator('#statsPerformanceChart').screenshot({ path: path.join(outDir, 'mobile-stats-performance-chart.png') });
    const mobileTrendCardModalTitles = [];
    for (let index = 0; index < mobileTrends.cards.length; index += 1) {
      await page.locator('#statsPerformanceChart .stats-trend-card.is-mobile-trend-active').scrollIntoViewIfNeeded();
      await page.locator('#statsPerformanceChart .stats-trend-card.is-mobile-trend-active').click({ timeout: 6000 });
      await page.waitForSelector('#lensModal.active #lensStatsListSecondary', { timeout: 6000 });
      mobileTrendCardModalTitles.push(await page.locator('#lensModal.active #lensModalTitleSecondary').innerText());
      await closeLensModals(page);
      if (index < mobileTrends.cards.length - 1) {
        await page.locator('#mobileTrendNav [data-mobile-trend-step="1"]').click({ timeout: 5000 });
        await page.waitForTimeout(120);
      }
    }

    await page.screenshot({ path: path.join(outDir, 'stats-page-final.png'), fullPage: true });
    assert.deepEqual(issues, [], `console errors during nav/loadout/stats pass: ${JSON.stringify(issues, null, 2)}`);
    console.log(JSON.stringify({
      navResults,
      pdOpenSettingsHover,
      navClip,
      loadout,
      topMapAgents,
      mapPicker,
      roleHover,
      compassHover,
      trendAxis,
      roleHistory,
      trendCardBoxes,
      trendCardsClicked: trendCards,
      trendCardModalTitles,
      hoverResults,
      lifetime,
      themeChecks,
      agentRoleTint,
      mobileSpinLabel,
      mobileTrends,
      mobileTrendCardModalTitles
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

