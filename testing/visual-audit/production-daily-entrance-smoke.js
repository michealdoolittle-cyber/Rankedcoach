const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.RANKEDCOACH_URL || "https://www.rankedcoach.gg/";
const OUT = path.resolve(__dirname, "output", "production-daily-entrance");
const PAGE_IDS = ["home", "logging", "stats", "insights", "library"];

function installMotionRecorder(context, entryMode) {
  return context.addInitScript(({ mode }) => {
    localStorage.clear();
    if (mode === "returning-empty") {
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
    }

    window.__productionEntranceEvents = [];
    const nativeAnimate = Element.prototype.animate;
    const parentSelectors = [
      [".weekly-focus-card", "home-weekly"],
      [".improvement-card", "home-improvement"],
      [".home-middle-row", "home-middle"],
      [".rr-chart-card", "home-chart"],
      [".logging-card", "logging-form"],
      [".logging-feed-card", "logging-feed"],
      [".stats-summary-card", "stats-summary"],
      [".stats-performance-card", "stats-trends"],
      [".stats-breakdown-card", "stats-patterns"],
      [".stats-agents-card", "stats-agents"],
      [".stats-maps-card", "stats-maps"],
      [".stats-weapons-card", "stats-weapons"],
      [".insights-action-card", "insights-focus"],
      [".insights-top-card", "insights-priority"],
      [".insights-trends-card", "insights-trends"],
      [".gamesense-hero", "library-hero"],
      [".gamesense-season-scope", "library-scope"],
      [".gamesense-topic-card", "library-topic"]
    ];

    Element.prototype.animate = function (...args) {
      const match = parentSelectors.find(([selector]) => this.matches?.(selector));
      if (match) {
        const rect = this.getBoundingClientRect();
        window.__productionEntranceEvents.push({
          kind: match[1],
          page: this.closest?.(".page")?.id?.replace(/^page-/, "") || "",
          top: Math.round(rect.top),
          left: Math.round(rect.left),
          at: performance.now()
        });
      }
      return nativeAnimate.apply(this, args);
    };
  }, { mode: entryMode });
}

function getExpectedMinimum(pageId) {
  return ({ home: 4, logging: 1, stats: 3, insights: 3, library: 3 })[pageId] || 1;
}

function assertMobileDescending(events, pageId) {
  const ordered = events
    .filter(event => event.page === pageId)
    .sort((left, right) => left.at - right.at);
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if ((current.at - previous.at) <= 45) continue;
    assert.ok(
      current.top >= previous.top - 4,
      `${pageId} animated upward instead of descending: ${JSON.stringify(ordered)}`
    );
  }
}

async function waitForWarmupGate(page) {
  await page.waitForFunction(() => {
    const state = window.RankedCoachDailyEntrance?.getState?.();
    const modal = document.getElementById("dailyWarmupModal");
    return state?.prepared
      && !state.ready
      && modal?.classList.contains("active")
      && modal.getAttribute("aria-hidden") === "false";
  }, null, { timeout: 30000 });

  const gate = await page.evaluate(() => ({
    state: window.RankedCoachDailyEntrance.getState(),
    opacity: getComputedStyle(document.getElementById("page-home")).opacity,
    pointerEvents: getComputedStyle(document.getElementById("page-home")).pointerEvents,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }));
  assert.equal(gate.reducedMotion, false);
  assert.equal(gate.opacity, "0", `Home leaked behind warm-up: ${JSON.stringify(gate)}`);
  assert.equal(gate.pointerEvents, "none", `Home remained interactive behind warm-up: ${JSON.stringify(gate)}`);
  assert.equal(gate.state.activePage, "", `Entrance started behind warm-up: ${JSON.stringify(gate)}`);
  return gate;
}

async function completePageEntrance(page, pageId, label, mobile) {
  await page.waitForFunction((expectedPage) => {
    const state = window.RankedCoachDailyEntrance?.getState?.();
    return state?.activePage === expectedPage
      && document.body.classList.contains("daily-entrance-motion-active")
      && document.getAnimations().some(animation => String(animation.id || "").startsWith("rankedcoach-daily-"));
  }, pageId, { timeout: 8000 });

  await page.waitForTimeout(330);
  await page.screenshot({ path: path.join(OUT, `${label}-${pageId}-mid.png`) });

  await page.waitForFunction((expectedPage) => {
    const state = window.RankedCoachDailyEntrance?.getState?.();
    return !state?.activePage && state?.daily?.seenPages?.includes(expectedPage);
  }, pageId, { timeout: 22000 });

  const proof = await page.evaluate((expectedPage) => ({
    state: window.RankedCoachDailyEntrance.getState(),
    opacity: getComputedStyle(document.getElementById(`page-${expectedPage}`)).opacity,
    pointerEvents: getComputedStyle(document.getElementById(`page-${expectedPage}`)).pointerEvents,
    events: window.__productionEntranceEvents.filter(event => event.page === expectedPage)
  }), pageId);
  assert.equal(proof.opacity, "1", `${pageId} stayed hidden after entrance.`);
  assert.notEqual(proof.pointerEvents, "none", `${pageId} stayed noninteractive after entrance.`);
  assert.ok(
    proof.events.length >= getExpectedMinimum(pageId),
    `${pageId} did not animate enough parent sections: ${JSON.stringify(proof.events)}`
  );
  if (mobile) assertMobileDescending(proof.events, pageId);
  return proof;
}

async function openFreshDemoGuest(page) {
  await page.locator("#authGuestBtn").waitFor({ state: "visible", timeout: 20000 });
  await page.locator("#authGuestBtn").click();
  await page.locator("#guestTutorialSkipBtn").waitFor({ state: "visible", timeout: 5000 });
  await page.locator("#guestTutorialSkipBtn").click();
}

async function runSession(browser, config) {
  const context = await browser.newContext({ viewport: config.viewport });
  await installMotionRecorder(context, config.entryMode);
  const page = await context.newPage();
  const issues = [];
  const failedResponses = [];
  page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
  page.on("console", message => {
    if (["error", "warning"].includes(message.type())) issues.push(`[${message.type()}] ${message.text()}`);
  });
  page.on("response", response => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  if (config.entryMode === "fresh-demo") await openFreshDemoGuest(page);
  const gate = await waitForWarmupGate(page);
  await page.screenshot({ path: path.join(OUT, `${config.label}-warmup-gate.png`) });

  const totalGamesBefore = Number(await page.locator("#totalGames").textContent().catch(() => "0")) || 0;
  if (config.entryMode === "returning-empty") assert.equal(totalGamesBefore, 0, "Returning empty guest unexpectedly received demo matches.");
  if (config.entryMode === "fresh-demo") assert.ok(totalGamesBefore > 0, "Fresh demo guest did not import built-in matches.");

  await page.evaluate(() => { window.__productionEntranceEvents = []; });
  await page.locator("#dailyWarmupSkip").click();
  const home = await completePageEntrance(page, "home", config.label, config.viewport.width < 700);

  const pages = { home };
  for (const pageId of PAGE_IDS.slice(1)) {
    await page.evaluate(() => { window.__productionEntranceEvents = []; });
    const selector = config.viewport.width < 700
      ? `.mobile-bottom-page-btn[data-mobile-page="${pageId}"]`
      : `.nav-btn[data-page="${pageId}"]`;
    await page.locator(selector).click();
    pages[pageId] = await completePageEntrance(page, pageId, config.label, config.viewport.width < 700);
  }

  await page.evaluate(() => {
    const controller = window.RankedCoachDailyEntrance;
    controller.resetToday();
    window.__productionEntranceEvents = [];
  });
  const homeSelector = config.viewport.width < 700
    ? '.mobile-bottom-page-btn[data-mobile-page="home"]'
    : '.nav-btn[data-page="home"]';
  await page.locator(homeSelector).click();
  await page.waitForFunction(() => window.RankedCoachDailyEntrance?.getState?.().activePage === "home", null, { timeout: 8000 });
  await page.mouse.click(2, Math.round(config.viewport.height / 2));
  await page.waitForFunction(() => window.RankedCoachDailyEntrance?.getState?.().daily?.skipped === true, null, { timeout: 3000 });
  const skip = await page.evaluate(() => {
    const dailyAnimations = document.getAnimations()
      .filter(animation => String(animation.id || "").startsWith("rankedcoach-daily-"));
    return {
      state: window.RankedCoachDailyEntrance.getState(),
      activeAnimations: dailyAnimations.length,
      animationStates: dailyAnimations.map(animation => ({
        id: animation.id,
        playState: animation.playState,
        target: animation.effect?.target?.className || animation.effect?.target?.id || ""
      })),
      pendingPages: document.querySelectorAll(".daily-entrance-page-pending").length,
      homeOpacity: getComputedStyle(document.getElementById("page-home")).opacity,
      homePointerEvents: getComputedStyle(document.getElementById("page-home")).pointerEvents
    };
  });
  assert.equal(skip.state.activePage, "");
  assert.equal(skip.activeAnimations, 0, JSON.stringify(skip.animationStates));
  assert.equal(skip.pendingPages, 0);
  assert.notEqual(skip.homeOpacity, "0");
  assert.notEqual(skip.homePointerEvents, "none");

  await page.screenshot({ path: path.join(OUT, `${config.label}-skip-complete.png`) });
  assert.deepEqual(issues, [], `${config.label} console issues: ${JSON.stringify(issues)}`);
  assert.deepEqual(failedResponses, [], `${config.label} HTTP failures: ${JSON.stringify(failedResponses)}`);
  await context.close();
  return { config, gate, totalGamesBefore, pages, skip, issues, failedResponses };
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    const report = [];
    report.push(await runSession(browser, {
      label: "desktop-empty-guest",
      entryMode: "returning-empty",
      viewport: { width: 1440, height: 900 }
    }));
    report.push(await runSession(browser, {
      label: "mobile-demo-guest",
      entryMode: "fresh-demo",
      viewport: { width: 390, height: 844 }
    }));
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
