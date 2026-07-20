const http = require("http");
const fs = require("fs");
const path = require("path");
const assert = require("node:assert/strict");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..", "public");
const OUT = path.resolve(__dirname, "output", "daily-entrance");
const PORT = 41779;
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4"
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url.startsWith("/api/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {} }));
        return;
      }
      if (url === "/") url = "/index.html";
      const file = path.join(ROOT, url);
      if (!file.startsWith(ROOT)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    }).listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function restoredSessionSupabaseStub() {
  const profile = {
    id: "daily-motion-profile",
    name: "Daily Motion",
    accountName: "Daily Motion",
    region: "NA",
    riotId: "",
    matches: []
  };
  const appState = {
    user_id: "daily-motion-user",
    active_profile_id: profile.id,
    profiles_json: [profile],
    log_entries_json: [],
    theme_builder_json: {},
    theme_builder_ui_json: {}
  };
  return `
    globalThis.supabase = {
      createClient() {
        const user = { id: "daily-motion-user", email: "motion@example.com", user_metadata: { account_name: "Daily Motion" } };
        const appState = ${JSON.stringify(appState)};
        function query(table) {
          return {
            select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, in() { return this; },
            update() { return this; }, delete() { return this; }, insert() { return this; },
            maybeSingle() {
              if (table === "vip_app_state") return new Promise(resolve => setTimeout(() => resolve({ data: appState, error: null }), 240));
              return Promise.resolve({ data: null, error: null });
            },
            single() { return Promise.resolve({ data: null, error: null }); },
            upsert() { return Promise.resolve({ data: null, error: null }); },
            then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); }
          };
        }
        return {
          auth: {
            getSession: async () => ({ data: { session: { user } }, error: null }),
            getUser: async () => ({ data: { user }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", { user }), 40);
              return { data: { subscription: { unsubscribe() {} } } };
            },
            signOut: async () => ({ error: null }),
            mfa: {
              getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal1" } }),
              listFactors: async () => ({ data: { all: [] } })
            }
          },
          from: query,
          functions: { invoke: async () => ({ data: null, error: null }) }
        };
      }
    };
  `;
}

async function runNaturalRestoredSession(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const issues = [];
  page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
  page.on("console", message => {
    if (["error", "warning"].includes(message.type())) issues.push(`[${message.type()}] ${message.text()}`);
  });
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
    contentType: "text/javascript",
    body: restoredSessionSupabaseStub()
  }));
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "account");
    window.__dailyNaturalBoot = { firstActive: null };
    document.addEventListener("DOMContentLoaded", () => {
      const timer = window.setInterval(() => {
        if (window.__dailyNaturalBoot.firstActive || !document.body?.classList.contains("daily-entrance-motion-active")) return;
        const overlay = document.getElementById("loginInitOverlay");
        const warmup = document.getElementById("dailyWarmupModal");
        window.__dailyNaturalBoot.firstActive = {
          at: performance.now(),
          overlayAriaHidden: overlay?.getAttribute("aria-hidden") || "",
          overlayClasses: overlay?.className || "",
          overlayDisplay: overlay ? getComputedStyle(overlay).display : "missing",
          warmupAriaHidden: warmup?.getAttribute("aria-hidden") || "",
          warmupClasses: warmup?.className || "",
          controller: window.RankedCoachDailyEntrance?.getState?.() || null
        };
        window.clearInterval(timer);
      }, 4);
    }, { once: true });
  });

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.__dailyNaturalBoot?.firstActive, null, { timeout: 15000 });
  const trace = await page.evaluate(() => ({
    ...window.__dailyNaturalBoot.firstActive,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    currentOverlayAriaHidden: document.getElementById("loginInitOverlay")?.getAttribute("aria-hidden") || "",
    motionIds: document.getAnimations().map(animation => String(animation.id || "")).filter(id => id.startsWith("rankedcoach-daily-"))
  }));
  assert.equal(trace.reducedMotion, false, `The natural trigger audit cannot run with reduced motion enabled: ${JSON.stringify(trace)}`);
  assert.equal(trace.controller?.identity, "daily-motion-user", `The restored account identity did not reach the controller: ${JSON.stringify(trace)}`);
  assert.equal(trace.controller?.activePage, "home", `The Home sequence did not start naturally: ${JSON.stringify(trace)}`);
  assert.equal(trace.overlayAriaHidden, "true", `Daily motion started behind the restoring-session overlay: ${JSON.stringify(trace)}`);
  assert.doesNotMatch(trace.overlayClasses, /\bis-closing\b|\bactive\b/, `Daily motion started during the overlay transition: ${JSON.stringify(trace)}`);
  assert.equal(trace.warmupAriaHidden, "true", `Daily motion started behind the warm-up modal: ${JSON.stringify(trace)}`);
  assert.doesNotMatch(trace.warmupClasses, /\bis-opening\b|\bis-closing\b|\bactive\b/, `Daily motion started during the warm-up transition: ${JSON.stringify(trace)}`);
  assert.ok(trace.motionIds.length > 0, `The natural Home sequence did not create a visible animation: ${JSON.stringify(trace)}`);
  assert.deepEqual(issues, [], `Natural restored-session boot emitted browser issues: ${JSON.stringify(issues)}`);
  await page.waitForTimeout(320);
  const visibleSequence = await page.evaluate(() => ({
    activePage: window.RankedCoachDailyEntrance?.getState?.().activePage || "",
    warmupAriaHidden: document.getElementById("dailyWarmupModal")?.getAttribute("aria-hidden") || "",
    warmupClasses: document.getElementById("dailyWarmupModal")?.className || ""
  }));
  assert.equal(visibleSequence.activePage, "home", `The natural Home sequence ended before its visual checkpoint: ${JSON.stringify(visibleSequence)}`);
  assert.equal(visibleSequence.warmupAriaHidden, "true", `The warm-up modal covered the active Home sequence: ${JSON.stringify(visibleSequence)}`);
  assert.doesNotMatch(visibleSequence.warmupClasses, /\bis-opening\b|\bis-closing\b|\bactive\b/, `The warm-up modal transitioned over the active Home sequence: ${JSON.stringify(visibleSequence)}`);
  await page.screenshot({ path: path.join(OUT, "natural-restored-session-home.png") });
  await page.evaluate(() => window.RankedCoachDailyEntrance?.skipAll?.());
  await context.close();
  return { ...trace, visibleSequence };
}

async function hideBlockingUi(page) {
  await page.evaluate(() => {
    const dismissBlockingUi = () => {
      ["authModal", "loginInitOverlay", "appLoadingVeil", "dailyWarmupModal"].forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        const blockingClasses = ["active", "open", "is-visible"];
        if (blockingClasses.some((className) => element.classList.contains(className))) {
          element.classList.remove(...blockingClasses);
        }
        element.hidden = true;
        element.style.setProperty("display", "none", "important");
      });
      const bodyBlockingClasses = [
        "has-active-modal",
        "mobile-modal-open",
        "modal-open",
        "profile-cleanup-active"
      ];
      if (bodyBlockingClasses.some((className) => document.body.classList.contains(className))) {
        document.body.classList.remove(...bodyBlockingClasses);
      }
    };
    dismissBlockingUi();
    if (!window.__dailyEntranceAuditModalGuard) {
      window.__dailyEntranceAuditModalGuard = true;
      const observer = new MutationObserver(dismissBlockingUi);
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"]
      });
      ["authModal", "loginInitOverlay", "appLoadingVeil", "dailyWarmupModal"].forEach((id) => {
        const element = document.getElementById(id);
        if (element) observer.observe(element, { attributes: true, attributeFilter: ["class"] });
      });
    }
    document.documentElement.classList.remove("app-booting");
  });
}

async function installMotionRecorder(page) {
  await page.evaluate(() => {
    if (!window.__dailyMotionRecorderInstalled) {
      window.__dailyMotionRecorderInstalled = true;
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (...args) {
        let kind = "";
        let index = -1;
        if (this.matches?.(".weekly-focus-card")) kind = "home-weekly-parent";
        else if (this.matches?.(".improvement-card")) kind = "home-improvement-parent";
        else if (this.closest?.("#weeklyFocusSummary")) {
          kind = "home-weekly-pill";
          index = [...document.querySelectorAll("#weeklyFocusSummary > *")].indexOf(this);
        } else if (this.closest?.("#timelineGrid")) {
          kind = "home-improvement-pill";
          index = [...document.querySelectorAll("#timelineGrid > *")].indexOf(this);
        } else if (this.matches?.(".gamesense-hero")) kind = "library-hero";
        else if (this.matches?.(".gamesense-season-scope")) kind = "library-scope";
        else if (this.matches?.(".gamesense-topic-card")) {
          kind = "library-topic-card";
          index = [...document.querySelectorAll(".gamesense-topic-grid > .gamesense-topic-card")].indexOf(this);
        }
        if (kind) window.__dailyMotionEvents.push({ kind, index, at: performance.now() });
        return animate.apply(this, args);
      };
    }
    window.__dailyMotionEvents = [];
  });
}

function assertOrderedIndices(events, label) {
  assert.ok(events.length >= 2, `${label} did not record enough staggered children: ${JSON.stringify(events)}`);
  const indices = events.map(event => event.index);
  assert.deepEqual(indices, [...indices].sort((left, right) => left - right), `${label} did not animate in DOM order: ${JSON.stringify(events)}`);
  assert.equal(new Set(indices).size, indices.length, `${label} animated a child more than once: ${JSON.stringify(events)}`);
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const issues = [];
  page.on("pageerror", (error) => issues.push(`[pageerror] ${error.message}`));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) issues.push(`[${message.type()}] ${message.text()}`);
  });
  await page.addInitScript(() => {
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    Object.keys(localStorage)
      .filter((key) => key.startsWith("rankedcoach_daily_entrance_v1:"))
      .forEach((key) => localStorage.removeItem(key));
  });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => {
    const veil = document.getElementById("appLoadingVeil");
    return !document.body.classList.contains("profile-cleanup-active")
      && !veil?.classList.contains("is-visible")
      && veil?.getAttribute("aria-hidden") !== "false";
  }, null, { timeout: 15000 });
  await page.waitForFunction(() => !document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 8000 }).catch(() => {});
  await hideBlockingUi(page);
  await installMotionRecorder(page);

  await page.evaluate(() => {
    const controller = window.RankedCoachDailyEntrance;
    if (!controller.getState().ready) controller.setSessionReady({ userId: "guest" });
    controller.skipAll();
    controller.resetToday();
    controller.activatePage("home");
  });
  await page.waitForFunction(() => document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 3000 });
  await page.waitForTimeout(90);

  const midState = await page.evaluate(() => ({
    bodyActive: document.body.classList.contains("daily-entrance-motion-active"),
    activePage: window.RankedCoachDailyEntrance.getState().activePage,
    motionCount: document.getAnimations().filter((animation) => String(animation.id || "").startsWith("rankedcoach-daily-")).length,
    controller: window.RankedCoachDailyEntrance.getState(),
    homeClass: document.getElementById("page-home")?.className || "",
    htmlClass: document.documentElement.className,
    bodyClass: document.body.className,
    reduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    activeMobileNav: document.querySelector(".mobile-bottom-page-btn.active")?.getAttribute("data-mobile-page") || "",
    activeDesktopNav: document.querySelector(".nav-btn.active")?.getAttribute("data-page") || ""
  }));
  if (!midState.bodyActive || midState.activePage !== "home" || midState.motionCount < 1) {
    throw new Error(`Home entrance did not enter its active phase: ${JSON.stringify(midState)}`);
  }
  await page.screenshot({ path: path.join(OUT, `${viewport.width}-home-mid.png`) });

  let homeSequenceProof = null;
  if (viewport.width >= 1000) {
    await page.waitForFunction(() => {
      const events = window.__dailyMotionEvents || [];
      return events.some(event => event.kind === "home-weekly-parent")
        && events.some(event => event.kind === "home-improvement-parent")
        && events.filter(event => event.kind === "home-weekly-pill").length >= 2
        && events.filter(event => event.kind === "home-improvement-pill").length >= 2;
    }, null, { timeout: 3500 });
    homeSequenceProof = await page.evaluate(() => {
      const events = window.__dailyMotionEvents || [];
      return {
        weeklyParent: events.find(event => event.kind === "home-weekly-parent"),
        improvementParent: events.find(event => event.kind === "home-improvement-parent"),
        weeklyPills: events.filter(event => event.kind === "home-weekly-pill"),
        improvementPills: events.filter(event => event.kind === "home-improvement-pill")
      };
    });
    assert.ok(
      Math.abs(homeSequenceProof.weeklyParent.at - homeSequenceProof.improvementParent.at) <= 60,
      `Home parent cards did not enter together: ${JSON.stringify(homeSequenceProof)}`
    );
    assertOrderedIndices(homeSequenceProof.weeklyPills, "Weekly Focus pills");
    assertOrderedIndices(homeSequenceProof.improvementPills, "Recent Improvement pills");
    await page.screenshot({ path: path.join(OUT, `${viewport.width}-home-pill-stagger.png`) });
  }

  await page.mouse.click(Math.max(10, viewport.width - 16), Math.min(viewport.height - 140, 500));
  await page.waitForTimeout(100);
  const skipped = await page.evaluate(() => window.RankedCoachDailyEntrance.getState());
  if (!skipped.daily?.skipped || skipped.activePage) {
    throw new Error(`Trusted tap did not skip the daily sequence: ${JSON.stringify(skipped)}`);
  }

  await page.evaluate(() => {
    const selector = document.body.classList.contains("is-mobile-layout")
      ? ".mobile-bottom-page-btn[data-mobile-page='stats']"
      : ".nav-btn[data-page='stats']";
    document.querySelector(selector)?.click();
  });
  await page.waitForTimeout(250);
  const skipPersisted = await page.evaluate(() => window.RankedCoachDailyEntrance.getState());
  if (!skipPersisted.daily?.skipped || skipPersisted.activePage) {
    throw new Error(`Daily skip did not persist across navigation: ${JSON.stringify(skipPersisted)}`);
  }

  await page.evaluate((auditRadiant) => {
    const controller = window.RankedCoachDailyEntrance;
    window.__dailyMotionEvents = [];
    if (auditRadiant) {
      const rankText = document.getElementById("statsPeakRankText");
      const rankIcon = document.getElementById("statsPeakRankIcon");
      if (rankText) rankText.textContent = "Radiant";
      if (rankIcon) {
        rankIcon.src = "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/radiant_rank.png";
        rankIcon.alt = "Radiant";
      }
      window.__dailyRankAuditStartedAt = performance.now();
    }
    controller.resetToday();
    controller.activatePage("stats");
  }, viewport.width >= 1000);
  await page.waitForFunction(() => window.RankedCoachDailyEntrance.getState().activePage === "stats", null, { timeout: 3000 });
  let statsRankProof = null;
  if (viewport.width >= 1000) {
    await page.waitForFunction(() => document.getElementById("statsPeakRankText")?.textContent?.trim() === "Iron 1", null, { timeout: 1000 });
    statsRankProof = await page.evaluate(() => ({
      startedAt: window.__dailyRankAuditStartedAt,
      ironOneAt: performance.now(),
      firstLabel: document.getElementById("statsPeakRankText")?.textContent?.trim() || "",
      firstIconAlt: document.getElementById("statsPeakRankIcon")?.alt || ""
    }));
    assert.equal(statsRankProof.firstIconAlt, "Iron 1", `The rank icon did not start at Iron 1: ${JSON.stringify(statsRankProof)}`);
  }
  await page.waitForTimeout(90);
  const statsMid = await page.evaluate(() => window.RankedCoachDailyEntrance.getState());
  if (statsMid.activePage !== "stats") {
    throw new Error(`Stats entrance did not start: ${JSON.stringify(statsMid)}`);
  }
  await page.screenshot({ path: path.join(OUT, `${viewport.width}-stats-mid.png`) });
  if (viewport.width >= 1000) {
    await page.waitForFunction(() => document.getElementById("statsPeakRankText")?.textContent?.trim() === "Radiant", null, { timeout: 4500 });
    statsRankProof = await page.evaluate((proof) => ({
      ...proof,
      completedAt: performance.now(),
      elapsed: performance.now() - window.__dailyRankAuditStartedAt,
      finalLabel: document.getElementById("statsPeakRankText")?.textContent?.trim() || "",
      finalIconAlt: document.getElementById("statsPeakRankIcon")?.alt || ""
    }), statsRankProof);
    assert.ok(statsRankProof.elapsed <= 4200, `Radiant rank count-up exceeded four seconds: ${JSON.stringify(statsRankProof)}`);
    assert.equal(statsRankProof.finalIconAlt, "Radiant", `The rank icon did not finish at Radiant: ${JSON.stringify(statsRankProof)}`);
  }
  await page.evaluate(() => window.RankedCoachDailyEntrance.skipAll());

  const pageStarts = {};
  let librarySequenceProof = null;
  for (const pageId of ["logging", "insights", "library"]) {
    await page.evaluate((nextPageId) => {
      const controller = window.RankedCoachDailyEntrance;
      window.__dailyMotionEvents = [];
      controller.resetToday();
      const selector = document.body.classList.contains("is-mobile-layout")
        ? `.mobile-bottom-page-btn[data-mobile-page='${nextPageId}']`
        : `.nav-btn[data-page='${nextPageId}']`;
      document.querySelector(selector)?.click();
    }, pageId);
    await page.waitForFunction(
      (nextPageId) => window.RankedCoachDailyEntrance.getState().activePage === nextPageId,
      pageId,
      { timeout: 4000 }
    );
    await page.waitForTimeout(90);
    pageStarts[pageId] = await page.evaluate((nextPageId) => ({
      activePage: window.RankedCoachDailyEntrance.getState().activePage,
      animationCount: document.getAnimations()
        .filter((animation) => String(animation.id || "").startsWith("rankedcoach-daily-"))
        .length,
      pageVisible: getComputedStyle(document.getElementById(`page-${nextPageId}`)).opacity !== "0"
    }), pageId);
    if (pageStarts[pageId].activePage !== pageId || pageStarts[pageId].animationCount < 1 || !pageStarts[pageId].pageVisible) {
      throw new Error(`${pageId} entrance did not start cleanly: ${JSON.stringify(pageStarts[pageId])}`);
    }
    if (pageId === "library") {
      await page.waitForFunction(() => (window.__dailyMotionEvents || []).filter(event => event.kind === "library-topic-card").length >= 3, null, { timeout: 3500 });
      librarySequenceProof = await page.evaluate(() => {
        const events = window.__dailyMotionEvents || [];
        return {
          hero: events.find(event => event.kind === "library-hero"),
          scope: events.find(event => event.kind === "library-scope"),
          cards: events.filter(event => event.kind === "library-topic-card")
        };
      });
      assert.ok(librarySequenceProof.hero && librarySequenceProof.scope, `Library hero or scope animation was missing: ${JSON.stringify(librarySequenceProof)}`);
      assert.ok(librarySequenceProof.hero.at < librarySequenceProof.scope.at, `Library scope did not follow the hero: ${JSON.stringify(librarySequenceProof)}`);
      assert.ok(librarySequenceProof.scope.at < librarySequenceProof.cards[0].at, `Library cards did not follow the scope: ${JSON.stringify(librarySequenceProof)}`);
      assertOrderedIndices(librarySequenceProof.cards, "Library topic cards");
      await page.screenshot({ path: path.join(OUT, `${viewport.width}-library-grid-stagger.png`) });
    }
    await page.evaluate(() => window.RankedCoachDailyEntrance.skipAll());
  }

  await page.evaluate(() => {
    const controller = window.RankedCoachDailyEntrance;
    controller.resetToday();
    const selector = document.body.classList.contains("is-mobile-layout")
      ? ".mobile-bottom-page-btn[data-mobile-page='home']"
      : ".nav-btn[data-page='home']";
    document.querySelector(selector)?.click();
  });
  await page.mouse.click(Math.max(10, viewport.width - 18), 180);
  await page.waitForTimeout(120);
  const pendingSkip = await page.evaluate(() => window.RankedCoachDailyEntrance.getState());
  if (!pendingSkip.daily?.skipped || pendingSkip.activePage) {
    throw new Error(`Tap during the pending phase did not skip the day: ${JSON.stringify(pendingSkip)}`);
  }

  await page.evaluate(() => {
    const controller = window.RankedCoachDailyEntrance;
    controller.resetToday();
    controller.activatePage("home");
  });
  await page.waitForFunction(() => window.RankedCoachDailyEntrance.getState().activePage === "home", null, { timeout: 4000 });
  await page.waitForFunction(() => {
    const state = window.RankedCoachDailyEntrance.getState();
    return !state.activePage && state.daily?.seenPages?.includes("home");
  }, null, { timeout: 10000 });
  const completedState = await page.evaluate(() => ({
    controller: window.RankedCoachDailyEntrance.getState(),
    pageOpacity: getComputedStyle(document.getElementById("page-home")).opacity
  }));
  if (completedState.pageOpacity === "0" || completedState.controller.pendingPages !== 0) {
    throw new Error(`Home did not restore its final presentation: ${JSON.stringify(completedState)}`);
  }
  await page.evaluate(() => window.RankedCoachDailyEntrance.activatePage("home"));
  await page.waitForTimeout(500);
  const replayBlocked = await page.evaluate(() => !window.RankedCoachDailyEntrance.getState().activePage);
  if (!replayBlocked) throw new Error("A completed page replayed again on the same day.");

  const result = {
    viewport,
    midState,
    homeSequenceProof,
    skipped: skipped.daily?.skipped === true,
    skipPersisted: skipPersisted.daily?.skipped === true && !skipPersisted.activePage,
    statsStarted: statsMid.activePage === "stats",
    statsRankProof,
    pageStarts,
    librarySequenceProof,
    pendingSkip: pendingSkip.daily?.skipped === true && !pendingSkip.activePage,
    completed: completedState.controller.daily?.seenPages?.includes("home") === true,
    replayBlocked,
    issues
  };
  await context.close();
  return result;
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const naturalRestoredSession = await runNaturalRestoredSession(browser);
    const results = [];
    results.push(await runViewport(browser, { width: 390, height: 844 }));
    results.push(await runViewport(browser, { width: 1440, height: 900 }));
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ naturalRestoredSession, results }, null, 2));
    console.log(JSON.stringify({ naturalRestoredSession, results }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
