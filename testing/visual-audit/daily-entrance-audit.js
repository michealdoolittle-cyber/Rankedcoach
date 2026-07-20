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

function guestSupabaseStub() {
  return `
    globalThis.supabase = {
      createClient() {
        function query() {
          return {
            select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, in() { return this; },
            update() { return this; }, delete() { return this; }, insert() { return this; },
            maybeSingle() { return Promise.resolve({ data: null, error: null }); },
            single() { return Promise.resolve({ data: null, error: null }); },
            upsert() { return Promise.resolve({ data: null, error: null }); },
            then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); }
          };
        }
        return {
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", null), 20);
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

async function runNaturalGuestSession(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const issues = [];
  page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
  page.on("console", message => {
    if (["error", "warning"].includes(message.type())) issues.push(`[${message.type()}] ${message.text()}`);
  });
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
    contentType: "text/javascript",
    body: guestSupabaseStub()
  }));
  await page.addInitScript(() => localStorage.clear());
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.locator("#authGuestBtn").waitFor({ state: "visible", timeout: 15000 });
  await page.locator("#authGuestBtn").click();
  await page.locator("#guestTutorialSkipBtn").waitFor({ state: "visible", timeout: 3000 });
  await page.locator("#guestTutorialSkipBtn").click();

  await page.waitForFunction(() => {
    const warmup = document.getElementById("dailyWarmupModal");
    const state = window.RankedCoachDailyEntrance?.getState?.();
    return state?.prepared
      && state.identity === "guest"
      && warmup?.classList.contains("active")
      && warmup.getAttribute("aria-hidden") === "false";
  }, null, { timeout: 15000 });
  const gate = await page.evaluate(() => ({
    controller: window.RankedCoachDailyEntrance?.getState?.() || null,
    pageOpacity: getComputedStyle(document.getElementById("page-home")).opacity,
    pagePointerEvents: getComputedStyle(document.getElementById("page-home")).pointerEvents
  }));
  assert.equal(gate.controller?.ready, false, `Guest motion became ready before warm-up: ${JSON.stringify(gate)}`);
  assert.equal(gate.pageOpacity, "0", `Guest Home was visible behind warm-up: ${JSON.stringify(gate)}`);
  assert.equal(gate.pagePointerEvents, "none", `Guest Home remained interactive behind warm-up: ${JSON.stringify(gate)}`);

  await page.locator("#dailyWarmupSkip").click();
  await page.waitForFunction(() => {
    const warmup = document.getElementById("dailyWarmupModal");
    return warmup?.getAttribute("aria-hidden") === "true"
      && !warmup.classList.contains("active")
      && !warmup.classList.contains("is-closing");
  }, null, { timeout: 4000 });
  const blankStage = await page.evaluate(() => ({
    controller: window.RankedCoachDailyEntrance?.getState?.() || null,
    pageOpacity: getComputedStyle(document.getElementById("page-home")).opacity,
    tooltipOpacity: getComputedStyle(document.getElementById("chartTooltip")).opacity
  }));
  assert.equal(blankStage.controller?.daily?.skipped, false, `Guest warm-up tap skipped entrance: ${JSON.stringify(blankStage)}`);
  assert.equal(blankStage.pageOpacity, "0", `Guest Home flashed before entrance: ${JSON.stringify(blankStage)}`);
  assert.equal(blankStage.tooltipOpacity, "0", `Guest RR tooltip leaked onto the blank stage: ${JSON.stringify(blankStage)}`);
  await page.screenshot({ path: path.join(OUT, "natural-guest-mobile-blank.png") });

  await page.waitForFunction(() => document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 4000 });
  await page.waitForTimeout(520);
  const visibleSequence = await page.evaluate(() => ({
    controller: window.RankedCoachDailyEntrance?.getState?.() || null,
    pageOpacity: getComputedStyle(document.getElementById("page-home")).opacity,
    motionIds: document.getAnimations().map(animation => String(animation.id || "")).filter(id => id.startsWith("rankedcoach-daily-"))
  }));
  assert.equal(visibleSequence.controller?.activePage, "home", `Guest Home entrance did not start: ${JSON.stringify(visibleSequence)}`);
  assert.notEqual(visibleSequence.pageOpacity, "0", `Guest Home stayed blank after motion started: ${JSON.stringify(visibleSequence)}`);
  assert.ok(visibleSequence.motionIds.length > 0, `Guest Home created no visible animation: ${JSON.stringify(visibleSequence)}`);
  await page.screenshot({ path: path.join(OUT, "natural-guest-mobile-home.png") });
  await page.waitForFunction(() => {
    const state = window.RankedCoachDailyEntrance?.getState?.();
    return !state?.activePage && state?.daily?.seenPages?.includes("home");
  }, null, { timeout: 12000 });
  assert.deepEqual(issues, [], `Natural guest boot emitted browser issues: ${JSON.stringify(issues)}`);
  await context.close();
  return { gate, blankStage, visibleSequence };
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
  });

  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const warmup = document.getElementById("dailyWarmupModal");
    const state = window.RankedCoachDailyEntrance?.getState?.();
    return state?.prepared
      && state.identity === "daily-motion-user"
      && warmup?.classList.contains("active")
      && warmup.getAttribute("aria-hidden") === "false";
  }, null, { timeout: 15000 });
  const gate = await page.evaluate(() => ({
    controller: window.RankedCoachDailyEntrance?.getState?.() || null,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    pageOpacity: getComputedStyle(document.getElementById("page-home")).opacity,
    pagePointerEvents: getComputedStyle(document.getElementById("page-home")).pointerEvents,
    warmupAriaHidden: document.getElementById("dailyWarmupModal")?.getAttribute("aria-hidden") || "",
    warmupClasses: document.getElementById("dailyWarmupModal")?.className || "",
    motionIds: document.getAnimations().map(animation => String(animation.id || "")).filter(id => id.startsWith("rankedcoach-daily-"))
  }));
  assert.equal(gate.reducedMotion, false, `The natural trigger audit cannot run with reduced motion enabled: ${JSON.stringify(gate)}`);
  assert.equal(gate.controller?.ready, false, `Daily motion became ready before warm-up was resolved: ${JSON.stringify(gate)}`);
  assert.equal(gate.controller?.activePage, "", `Daily motion started behind warm-up: ${JSON.stringify(gate)}`);
  assert.equal(gate.pageOpacity, "0", `Home was visible behind warm-up instead of being staged: ${JSON.stringify(gate)}`);
  assert.equal(gate.pagePointerEvents, "none", `The staged Home page remained interactive: ${JSON.stringify(gate)}`);
  assert.equal(gate.motionIds.length, 0, `Motion ran behind warm-up: ${JSON.stringify(gate)}`);
  await page.screenshot({ path: path.join(OUT, "natural-restored-session-warmup.png") });

  await page.locator("#dailyWarmupSkip").click();
  await page.waitForFunction(() => {
    const warmup = document.getElementById("dailyWarmupModal");
    return warmup?.getAttribute("aria-hidden") === "true"
      && !warmup.classList.contains("active")
      && !warmup.classList.contains("is-closing");
  }, null, { timeout: 4000 });
  const blankStage = await page.evaluate(() => ({
    controller: window.RankedCoachDailyEntrance?.getState?.() || null,
    pageOpacity: getComputedStyle(document.getElementById("page-home")).opacity,
    tooltipOpacity: getComputedStyle(document.getElementById("chartTooltip")).opacity
  }));
  assert.equal(blankStage.controller?.daily?.skipped, false, `Warm-up dismissal skipped entrance motion: ${JSON.stringify(blankStage)}`);
  assert.equal(blankStage.pageOpacity, "0", `Home flashed before its entrance sequence: ${JSON.stringify(blankStage)}`);
  assert.equal(blankStage.tooltipOpacity, "0", `The RR tooltip leaked onto the blank stage: ${JSON.stringify(blankStage)}`);
  await page.screenshot({ path: path.join(OUT, "natural-restored-session-blank.png") });

  await page.waitForFunction(() => document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 4000 });
  await page.waitForFunction(() => document.getAnimations().some(animation => String(animation.id || "").startsWith("rankedcoach-daily-")), null, { timeout: 2000 });
  await page.waitForTimeout(420);
  const visibleSequence = await page.evaluate(() => ({
    controller: window.RankedCoachDailyEntrance?.getState?.() || null,
    pageOpacity: getComputedStyle(document.getElementById("page-home")).opacity,
    motionIds: document.getAnimations().map(animation => String(animation.id || "")).filter(id => id.startsWith("rankedcoach-daily-"))
  }));
  assert.equal(visibleSequence.controller?.activePage, "home", `The natural Home sequence did not start: ${JSON.stringify(visibleSequence)}`);
  assert.notEqual(visibleSequence.pageOpacity, "0", `Home stayed hidden after motion began: ${JSON.stringify(visibleSequence)}`);
  assert.ok(visibleSequence.motionIds.length > 0, `The natural Home sequence created no visible animation: ${JSON.stringify(visibleSequence)}`);
  await page.screenshot({ path: path.join(OUT, "natural-restored-session-home.png") });
  await page.waitForFunction(() => {
    const state = window.RankedCoachDailyEntrance?.getState?.();
    return !state?.activePage && state?.daily?.seenPages?.includes("home");
  }, null, { timeout: 12000 });
  assert.deepEqual(issues, [], `Natural restored-session boot emitted browser issues: ${JSON.stringify(issues)}`);
  await context.close();
  return { gate, blankStage, visibleSequence };
}

async function runForceReplayReducedMotionSession(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const issues = [];
  page.on("pageerror", (error) => issues.push(`[pageerror] ${error.message}`));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) issues.push(`[${message.type()}] ${message.text()}`);
  });
  await page.addInitScript(() => {
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    Object.keys(localStorage)
      .filter((key) => key.startsWith("rankedcoach_daily_entrance_v1:") || key.startsWith("rankedcoach_daily_entrance_v2:"))
      .forEach((key) => localStorage.removeItem(key));
  });
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
  await hideBlockingUi(page);
  await page.waitForFunction(() => Boolean(window.RankedCoachDailyEntrance?.getState?.()), null, { timeout: 10000 });
  const result = await page.evaluate(() => {
    const controller = window.RankedCoachDailyEntrance;
    controller.setForceReplay(true);
    controller.setSessionReady({ userId: "guest" });
    controller.resetToday();
    controller.activatePage("home");
    return {
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      forceReplay: controller.getState().forceReplay,
      state: controller.getState(),
      bodyActive: document.body.classList.contains("daily-entrance-motion-active"),
      animationCount: document.getAnimations().filter((animation) => String(animation.id || "").startsWith("rankedcoach-daily-")).length
    };
  });
  await page.waitForTimeout(500);
  const afterDelay = await page.evaluate(() => ({
    state: window.RankedCoachDailyEntrance.getState(),
    bodyActive: document.body.classList.contains("daily-entrance-motion-active"),
    animationCount: document.getAnimations().filter((animation) => String(animation.id || "").startsWith("rankedcoach-daily-")).length
  }));
  await context.close();
  assert.equal(result.reducedMotion, true, `Reduced-motion emulation did not apply: ${JSON.stringify(result)}`);
  assert.equal(result.forceReplay, true, `Force replay did not enable under reduced motion: ${JSON.stringify(result)}`);
  assert.equal(afterDelay.bodyActive, false, `Force replay overrode reduced motion: ${JSON.stringify({ result, afterDelay })}`);
  assert.equal(afterDelay.animationCount, 0, `Reduced motion still left entrance animations running: ${JSON.stringify(afterDelay)}`);
  assert.deepEqual(issues, [], `Reduced-motion force-replay boot emitted browser issues: ${JSON.stringify(issues)}`);
  return { result, afterDelay };
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
      .filter((key) => key.startsWith("rankedcoach_daily_entrance_v1:") || key.startsWith("rankedcoach_daily_entrance_v2:"))
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
  await page.waitForFunction(() => {
    const state = window.RankedCoachDailyEntrance.getState();
    return !state.activePage && state.daily?.seenPages?.includes("stats");
  }, null, { timeout: 12000 });
  const statsCompleted = await page.evaluate(() => ({
    state: window.RankedCoachDailyEntrance.getState(),
    pageOpacity: getComputedStyle(document.getElementById("page-stats")).opacity,
    pagePointerEvents: getComputedStyle(document.getElementById("page-stats")).pointerEvents
  }));
  assert.equal(statsCompleted.pageOpacity, "1", `Stats stayed hidden after its entrance: ${JSON.stringify(statsCompleted)}`);
  assert.notEqual(statsCompleted.pagePointerEvents, "none", `Stats stayed noninteractive after its entrance: ${JSON.stringify(statsCompleted)}`);
  await page.screenshot({ path: path.join(OUT, `${viewport.width}-stats-complete.png`) });

  const pageStarts = {};
  const pageCompletions = {};
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
    await page.screenshot({ path: path.join(OUT, `${viewport.width}-${pageId}-mid.png`) });
    if (pageId === "logging" || pageId === "insights") {
      await page.waitForTimeout(1050);
      await page.screenshot({ path: path.join(OUT, `${viewport.width}-${pageId}-stagger.png`) });
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
    await page.waitForFunction((completedPageId) => {
      const state = window.RankedCoachDailyEntrance.getState();
      return !state.activePage && state.daily?.seenPages?.includes(completedPageId);
    }, pageId, { timeout: 12000 });
    pageCompletions[pageId] = await page.evaluate((completedPageId) => ({
      state: window.RankedCoachDailyEntrance.getState(),
      pageOpacity: getComputedStyle(document.getElementById(`page-${completedPageId}`)).opacity,
      pagePointerEvents: getComputedStyle(document.getElementById(`page-${completedPageId}`)).pointerEvents,
      dailyAnimations: document.getAnimations()
        .filter((animation) => String(animation.id || "").startsWith("rankedcoach-daily-"))
        .length
    }), pageId);
    assert.equal(pageCompletions[pageId].pageOpacity, "1", `${pageId} stayed hidden after its entrance.`);
    assert.notEqual(pageCompletions[pageId].pagePointerEvents, "none", `${pageId} stayed noninteractive after its entrance.`);
    assert.equal(pageCompletions[pageId].dailyAnimations, 0, `${pageId} left entrance animations running after completion.`);
    await page.screenshot({ path: path.join(OUT, `${viewport.width}-${pageId}-complete.png`) });
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

  const forceReplay = await page.evaluate(async () => {
    const controller = window.RankedCoachDailyEntrance;
    const beforeSeenPages = [...(controller.getState().daily?.seenPages || [])];
    const enabledReturn = controller.setForceReplay(true);
    controller.activatePage("home");
    return {
      beforeSeenPages,
      enabledReturn,
      forceReplay: controller.getState().forceReplay,
      persisted: localStorage.getItem("rankedcoach_daily_entrance_force_replay") === "1"
    };
  });
  assert.equal(forceReplay.enabledReturn, true, "setForceReplay(true) should return true");
  assert.equal(forceReplay.forceReplay, true, "force replay did not update controller state");
  assert.equal(forceReplay.persisted, true, "force replay did not persist to localStorage");
  await page.waitForFunction(() => window.RankedCoachDailyEntrance.getState().activePage === "home", null, { timeout: 4000 });
  await page.waitForFunction(() => {
    const state = window.RankedCoachDailyEntrance.getState();
    return !state.activePage && state.forceReplay === true;
  }, null, { timeout: 10000 });
  const forceReplayCompleted = await page.evaluate((beforeSeenPages) => {
    const state = window.RankedCoachDailyEntrance.getState();
    return {
      forceReplay: state.forceReplay,
      seenPagesUnchanged: JSON.stringify(state.daily?.seenPages || []) === JSON.stringify(beforeSeenPages),
      daily: state.daily
    };
  }, forceReplay.beforeSeenPages);
  assert.equal(forceReplayCompleted.forceReplay, true, "force replay turned off after replay");
  assert.equal(forceReplayCompleted.seenPagesUnchanged, true, `force replay wrote seenPages: ${JSON.stringify(forceReplayCompleted.daily)}`);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.RankedCoachDailyEntrance?.getState?.().ready), null, { timeout: 10000 });
  const persistedForceReplay = await page.evaluate(() => window.RankedCoachDailyEntrance.getState().forceReplay);
  assert.equal(persistedForceReplay, true, "force replay did not survive reload");
  await page.waitForFunction(() => window.RankedCoachDailyEntrance.getState().activePage === "home", null, { timeout: 5000 });
  await page.waitForFunction(() => !window.RankedCoachDailyEntrance.getState().activePage, null, { timeout: 10000 });
  const disabledForceReplay = await page.evaluate(() => {
    const controller = window.RankedCoachDailyEntrance;
    const disabledReturn = controller.setForceReplay(false);
    controller.resetToday();
    controller.activatePage("home");
    return {
      disabledReturn,
      forceReplay: controller.getState().forceReplay,
      persisted: localStorage.getItem("rankedcoach_daily_entrance_force_replay") === "1"
    };
  });
  assert.equal(disabledForceReplay.disabledReturn, false, "setForceReplay(false) should return false");
  assert.equal(disabledForceReplay.forceReplay, false, "force replay did not update state when disabled");
  assert.equal(disabledForceReplay.persisted, false, "force replay localStorage flag was not removed");
  await page.waitForFunction(() => window.RankedCoachDailyEntrance.getState().activePage === "home", null, { timeout: 4000 });
  await page.waitForFunction(() => {
    const state = window.RankedCoachDailyEntrance.getState();
    return !state.activePage && state.daily?.seenPages?.includes("home");
  }, null, { timeout: 10000 });
  await page.evaluate(() => window.RankedCoachDailyEntrance.activatePage("home"));
  await page.waitForTimeout(500);
  const replayBlockedAfterDisable = await page.evaluate(() => !window.RankedCoachDailyEntrance.getState().activePage);
  if (!replayBlockedAfterDisable) throw new Error("A completed page replayed after force replay was disabled.");

  const result = {
    viewport,
    midState,
    homeSequenceProof,
    skipped: skipped.daily?.skipped === true,
    skipPersisted: skipPersisted.daily?.skipped === true && !skipPersisted.activePage,
    statsStarted: statsMid.activePage === "stats",
    statsRankProof,
    statsCompleted,
    pageStarts,
    pageCompletions,
    librarySequenceProof,
    pendingSkip: pendingSkip.daily?.skipped === true && !pendingSkip.activePage,
    completed: completedState.controller.daily?.seenPages?.includes("home") === true,
    replayBlocked,
    forceReplay: forceReplayCompleted.forceReplay === true,
    forceReplayPersisted: persistedForceReplay === true,
    forceReplayDisabled: replayBlockedAfterDisable,
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
    const naturalGuestSession = await runNaturalGuestSession(browser);
    const forceReplayReducedMotionSession = await runForceReplayReducedMotionSession(browser);
    const results = [];
    results.push(await runViewport(browser, { width: 390, height: 844 }));
    results.push(await runViewport(browser, { width: 1440, height: 900 }));
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify({ naturalRestoredSession, naturalGuestSession, forceReplayReducedMotionSession, results }, null, 2));
    console.log(JSON.stringify({ naturalRestoredSession, naturalGuestSession, forceReplayReducedMotionSession, results }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
