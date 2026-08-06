"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41856;
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
      if (pathname.startsWith("/api/content/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {}, sections: [] }));
        return;
      }
      if (pathname === "/favicon.ico") {
        response.writeHead(204);
        response.end();
        return;
      }
      const filePath = path.join(root, pathname === "/" ? "index.html" : pathname);
      if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        response.writeHead(error ? 404 : 200, {
          "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(error ? "Not found" : data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `
    window.supabase = {
      createClient() {
        return {
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", null), 0);
              return { data: { subscription: { unsubscribe() {} } } };
            }
          }
        };
      }
    };
  `;
}

async function seedProfile(page) {
  await page.addInitScript(() => {
    const profileId = "desktop-logging-layout";
    const createdAt = new Date(Date.now() - 60 * 1000).toISOString();
    const profile = {
      id: profileId,
      name: "Logging Layout Test",
      accountName: "Logging Layout Test",
      region: "NA",
      lastWarmupPromptDate: new Date().toISOString().slice(0, 10),
      matches: [{
        id: "pending-match",
        matchId: "pending-match",
        source: "henrik",
        createdAt,
        agent: "Sova",
        role: "Initiator",
        map: "Ascent",
        result: "win",
        metadata: { matchId: "pending-match", agent: "Sova", map: "Ascent", result: "win" }
      }]
    };
    const pending = {
      id: "ranked-match-log:desktop-logging-layout:pending-match",
      matchId: "pending-match",
      profileId,
      source: "henrik-match-placeholder",
      isMatchPlaceholder: true,
      isPlayerAuthored: false,
      createdAt,
      agent: "Sova",
      role: "Initiator",
      map: "Ascent",
      focus: "Crosshair Placement",
      result: "win",
      rating: null,
      mood: "",
      teamComms: null,
      selfComms: null,
      notes: ""
    };
    const saved = {
      id: "completed-reflection",
      profileId,
      source: "player-reflection",
      isPlayerAuthored: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      agent: "Jett",
      role: "Duelist",
      map: "Bind",
      focus: "Movement",
      rating: 4,
      mood: "Focused",
      teamComms: 4,
      selfComms: 4,
      notes: "A complete reflection used to verify Edit."
    };
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", profileId);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
    localStorage.setItem("valtracker_log_entries_v2:guest", JSON.stringify([pending, saved]));
    localStorage.setItem("valtracker_log_entries_v1", JSON.stringify([pending, saved]));
    localStorage.setItem("valtracker_logs_v1", JSON.stringify([pending, saved]));
  });
}

async function openPage(browser, viewport) {
  const page = await browser.newPage({ viewport, isMobile: viewport.width <= 820, hasTouch: viewport.width <= 820 });
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", error => consoleErrors.push(error.message));
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
    contentType: "text/javascript",
    body: supabaseStub()
  }));
  await seedProfile(page);
  const initComplete = page.waitForEvent("console", {
    predicate: message => message.text().includes("INIT COMPLETE"),
    timeout: 30000
  });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  await initComplete;
  await page.waitForFunction(() => Boolean(document.querySelector(".nav-btn[data-page='logging']")), null, { timeout: 15000 });
  await page.evaluate(() => {
    globalThis.RankedCoachDailyEntrance?.skipAll?.();
    document.querySelectorAll(".lens-modal-overlay, .app-loading-veil").forEach(element => {
      element.classList.remove("active");
      element.setAttribute("aria-hidden", "true");
      element.style.setProperty("display", "none", "important");
    });
    document.body.classList.remove("modal-open", "is-modal-open", "has-active-modal", "daily-entrance-motion-active");
  });
  return { page, consoleErrors };
}

async function run() {
  const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(source, /actionLabel: "Reload"/);
  assert.match(source, /window\.location\.reload\(\)/);
  assert.match(source, /mode: "refresh"/);
  assert.match(source, /refreshActiveProfileDataSurfaces/);
  const pullToSyncSource = source.slice(
    source.indexOf("function installMobileHomePullToRefresh"),
    source.indexOf("let loggingPageEntryAnimationRaf")
  );
  assert.doesNotMatch(pullToSyncSource, /getActivePageElement\(\)\?\.id !== "page-home"/);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const screenshotDir = path.join(__dirname, "test-results");
  fs.mkdirSync(screenshotDir, { recursive: true });
  try {
    const desktop = await openPage(browser, { width: 1440, height: 900 });
    await desktop.page.locator('.nav-btn[data-page="logging"]').click({ force: true });
    await desktop.page.evaluate(() => document.querySelector('.nav-btn[data-page="logging"]')?.click());
    await desktop.page.waitForFunction(() => {
      const page = document.getElementById("page-logging");
      return page?.classList.contains("active") || page?.classList.contains("is-current-page");
    }, null, { timeout: 10000 });
    await desktop.page.waitForTimeout(300);
    await desktop.page.evaluate(() => globalThis.RankedCoachDailyEntrance?.skipAll?.());
    await desktop.page.waitForTimeout(80);

    const desktopLauncherState = await desktop.page.evaluate(() => ({
      pageClasses: document.getElementById("page-logging")?.className || "",
      pageDisplay: getComputedStyle(document.getElementById("page-logging")).display,
      launcherDisplay: getComputedStyle(document.getElementById("loggingDesktopLauncher")).display,
      activeNav: document.querySelector(".nav-btn.active")?.dataset.page || "",
      modal: document.querySelector(".lens-modal-overlay.active")?.id || ""
    }));
    assert.equal(await desktop.page.locator("#loggingDesktopLauncher").isVisible(), true, JSON.stringify(desktopLauncherState));
    assert.equal(await desktop.page.locator("#page-logging .logging-form").isVisible(), false);
    assert.match(await desktop.page.locator("#logCalendarTrigger").innerText(), /today/i, "Logging should open on today's session by default");
    await desktop.page.screenshot({ path: path.join(screenshotDir, "logging-desktop-launcher.png"), fullPage: true });

    const postMatchState = await desktop.page.evaluate(() => ({
      disabled: document.querySelector('[data-logging-desktop-launch="postmatch"]')?.getAttribute("aria-disabled") || "",
      status: document.getElementById("loggingPostMatchLaunchStatus")?.textContent || "",
      entries: JSON.parse(localStorage.getItem("valtracker_log_entries_v2:guest") || "[]")
        .map(entry => ({ id: entry.id, placeholder: entry.isMatchPlaceholder, profileId: entry.profileId }))
    }));
    assert.equal(postMatchState.disabled, "false", JSON.stringify(postMatchState));
    await desktop.page.locator('[data-logging-desktop-launch="postmatch"]').click();
    await desktop.page.waitForTimeout(250);
    assert.equal(
      await desktop.page.locator("#page-logging").getAttribute("data-logging-launcher-embed"),
      "postgame",
      "Post-match training should enter its embedded training view."
    );
    const postMatchOpenState = await desktop.page.evaluate(() => ({
      view: document.getElementById("page-logging")?.dataset.loggingDesktopView || "",
      embedded: document.querySelector("#loggingLauncherEmbedded .daily-warmup-card")?.getAttribute("aria-labelledby") || "",
      postgameVisible: document.querySelector('[data-daily-training-section="postgame"]')?.hidden === false,
      form: getComputedStyle(document.querySelector("#page-logging .logging-form")).display
    }));
    assert.equal(postMatchOpenState.view, "launcher", `${JSON.stringify(postMatchOpenState)} ${JSON.stringify(desktop.consoleErrors)}`);
    assert.ok(postMatchOpenState.embedded, JSON.stringify(postMatchOpenState));
    assert.equal(postMatchOpenState.postgameVisible, true, JSON.stringify(postMatchOpenState));
    assert.equal(postMatchOpenState.form, "none", JSON.stringify(postMatchOpenState));
    await desktop.page.locator("#page-logging .logging-card").screenshot({ path: path.join(screenshotDir, "logging-desktop-postmatch-embedded.png") });
    await desktop.page.locator("#dailyWarmupPostgameCommit").click();
    await desktop.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingDesktopView === "launcher");
    await desktop.page.locator("#logFeed .log-edit-btn").first().click({ force: true });
    await desktop.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingDesktopView === "form");
    assert.equal(await desktop.page.locator("#logMap").inputValue(), "Ascent");
    assert.match(await desktop.page.locator("#focusPreviewText").innerText(), /crosshair placement/i);
    await desktop.page.locator("#page-logging .logging-card").screenshot({ path: path.join(screenshotDir, "logging-desktop-postmatch-expanded.png") });

    await desktop.page.locator('#logRatingRow [data-rating="4"]').click();
    await desktop.page.locator('#logMoodRow [data-mood="Focused"]').click();
    await desktop.page.locator('#logTeamCommsRow [data-team-comms="4"]').click();
    await desktop.page.locator('#logSelfCommsRow [data-self-comms="4"]').click();
    await desktop.page.locator("#logNotes").fill("Completed this synced match from the desktop launcher.");
    await desktop.page.locator("#logSaveBtn").click();
    await desktop.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingDesktopView === "launcher");
    assert.equal(await desktop.page.locator("#page-logging .logging-form").isVisible(), false);
    assert.equal(await desktop.page.locator('[data-logging-desktop-launch="postmatch"]').getAttribute("aria-disabled"), "false");
    assert.equal(await desktop.page.locator("#page-logging").getAttribute("data-logging-launch-origin"), null);

    await desktop.page.locator('[data-logging-desktop-launch="warmup"]').click({ force: true });
    await desktop.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingLauncherEmbed === "warmup");
    assert.equal(await desktop.page.locator("#loggingLauncherEmbedded .daily-warmup-card").isVisible(), true);
    assert.equal(await desktop.page.locator("#page-logging .logging-form").isVisible(), false);
    await desktop.page.locator("#page-logging .logging-card").screenshot({ path: path.join(screenshotDir, "logging-desktop-warmup-embedded.png") });
    await desktop.page.locator('[data-warmup-drill="burst-peeking"]').click();
    await desktop.page.locator("#dailyWarmupSave").click();
    await desktop.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingDesktopView === "launcher");

    // Today's session is the normal default, while All History remains an
    // explicit selection and must surface an older completed reflection.
    await desktop.page.locator("#logCalendarTrigger").click({ force: true });
    await desktop.page.locator('#logCalendarPopover [data-log-all]').click({ force: true });
    await desktop.page.waitForFunction(() => /all history/i.test(document.getElementById("logCalendarTrigger")?.textContent || ""));
    await desktop.page.locator('.log-entry[data-log-entry-id="completed-reflection"] .log-edit-btn').click({ force: true });
    assert.equal(await desktop.page.locator("#logMap").inputValue(), "Bind");
    assert.equal(await desktop.page.locator("#logNotes").inputValue(), "A complete reflection used to verify Edit.");
    await desktop.page.locator("#logCalendarTrigger").click({ force: true });
    const today = await desktop.page.locator("#logCalendarPopover .logging-calendar-day.is-today").getAttribute("data-log-date");
    await desktop.page.locator(`#logCalendarPopover [data-log-date="${today}"]`).click({ force: true });
    assert.match(await desktop.page.locator("#logCalendarTrigger").innerText(), /today/i, "The player can explicitly return to today's session");

    const mobile = await openPage(browser, { width: 390, height: 844 });
    await mobile.page.locator('[data-mobile-page="logging"]').click({ force: true });
    await mobile.page.evaluate(() => document.querySelector('[data-mobile-page="logging"]')?.click());
    await mobile.page.waitForFunction(() => {
      const page = document.getElementById("page-logging");
      return page?.classList.contains("active") || page?.classList.contains("is-current-page");
    }, null, { timeout: 10000 });
    await mobile.page.waitForTimeout(300);
    await mobile.page.evaluate(() => globalThis.RankedCoachDailyEntrance?.skipAll?.());
    await mobile.page.waitForTimeout(80);
    assert.equal(await mobile.page.locator("#mobileLoggingTabs").isVisible(), true);
    assert.equal(await mobile.page.locator("#loggingDesktopLauncher").isVisible(), true);
    assert.equal(await mobile.page.locator("#page-logging .logging-form").isVisible(), false);
    const mobileLauncherBox = await mobile.page.locator("#loggingDesktopLauncher").boundingBox();
    assert.ok(mobileLauncherBox, "mobile launcher should have a visible box");
    assert.ok(
      mobileLauncherBox.y >= 0 && mobileLauncherBox.y + mobileLauncherBox.height <= 844,
      `mobile launcher must fit without scrolling: ${JSON.stringify(mobileLauncherBox)}`
    );
    await mobile.page.screenshot({ path: path.join(screenshotDir, "logging-mobile-launcher.png"), fullPage: true });

    await mobile.page.locator('[data-logging-desktop-launch="postmatch"]').click();
    await mobile.page.waitForTimeout(250);
    assert.equal(await mobile.page.locator("#page-logging").getAttribute("data-logging-launcher-embed"), "postgame");
    assert.equal(await mobile.page.locator("#loggingLauncherEmbedded .daily-warmup-card").isVisible(), true);
    assert.equal(await mobile.page.locator('[data-daily-training-section="postgame"]').isVisible(), true);
    assert.equal(await mobile.page.locator("#page-logging .logging-form").isVisible(), false);
    await mobile.page.locator("#page-logging .logging-card").screenshot({ path: path.join(screenshotDir, "logging-mobile-postmatch-embedded.png") });
    await mobile.page.locator("#dailyWarmupPostgameCommit").click();
    await mobile.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.mobileLoggingFormStage === "launcher");
    await mobile.page.evaluate(() => {
      document.getElementById("page-logging").dataset.mobileLoggingFormStage = "form";
    });
    await mobile.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.mobileLoggingFormStage === "form");
    assert.equal(await mobile.page.locator("#loggingDesktopLauncher").isVisible(), false);
    assert.equal(await mobile.page.locator("#page-logging .logging-form").isVisible(), true);
    await mobile.page.locator("#logMap").fill("Ascent");
    assert.equal(await mobile.page.locator("#logMap").inputValue(), "Ascent");
    assert.equal(await mobile.page.locator("#page-logging").getAttribute("data-logging-launch-origin"), null);
    const mobileMapPreview = await mobile.page.evaluate(() => {
      const pill = document.querySelector("#page-logging .logging-map-pill");
      const preview = document.getElementById("logMapPreview");
      const label = pill?.querySelector(".pill-label");
      const notes = document.getElementById("logNotes");
      const actions = document.querySelector("#page-logging .logging-actions");
      const pillRect = pill?.getBoundingClientRect();
      const previewRect = preview?.getBoundingClientRect();
      const style = preview ? getComputedStyle(preview) : null;
      return {
        pill: pillRect?.toJSON() || null,
        preview: previewRect?.toJSON() || null,
        position: style?.position || "",
        labelDisplay: label ? getComputedStyle(label).display : "",
        notes: notes?.getBoundingClientRect().toJSON() || null,
        actions: actions?.getBoundingClientRect().toJSON() || null,
        hidden: preview?.hidden ?? true
      };
    });
    assert.equal(mobileMapPreview.hidden, false, JSON.stringify(mobileMapPreview));
    assert.equal(mobileMapPreview.position, "static", JSON.stringify(mobileMapPreview));
    assert.equal(mobileMapPreview.labelDisplay, "none", JSON.stringify(mobileMapPreview));
    assert.ok(mobileMapPreview.preview.left >= mobileMapPreview.pill.left + 4, JSON.stringify(mobileMapPreview));
    assert.ok(Math.abs((mobileMapPreview.preview.top + mobileMapPreview.preview.height / 2) - (mobileMapPreview.pill.top + mobileMapPreview.pill.height / 2)) <= 4, JSON.stringify(mobileMapPreview));
    assert.ok(mobileMapPreview.notes.bottom + 10 <= mobileMapPreview.actions.top, `Notes must reserve space above Save: ${JSON.stringify(mobileMapPreview)}`);
    await mobile.page.locator("#page-logging .logging-card").screenshot({ path: path.join(screenshotDir, "logging-mobile-postmatch-expanded.png") });
    // The mobile geometry check uses the ordinary form in isolation. It is not
    // a match-reflection save path, so return to the launcher explicitly
    // rather than manufacturing a log entry solely for this layout assertion.
    await mobile.page.evaluate(() => {
      document.getElementById("page-logging").dataset.mobileLoggingFormStage = "launcher";
    });
    await mobile.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.mobileLoggingFormStage === "launcher");
    assert.equal(await mobile.page.locator("#loggingDesktopLauncher").isVisible(), true);
    assert.equal(await mobile.page.locator("#page-logging").getAttribute("data-logging-launch-origin"), null);

    await mobile.page.locator('[data-logging-desktop-launch="warmup"]').click();
    await mobile.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingLauncherEmbed === "warmup");
    await mobile.page.waitForTimeout(100);
    assert.equal(await mobile.page.locator("#loggingLauncherEmbedded .daily-warmup-card").isVisible(), true);
    const mobileInlineWarmupGeometry = await mobile.page.evaluate(() => {
      const header = document.querySelector(".app-header")?.getBoundingClientRect();
      const host = document.getElementById("loggingLauncherEmbedded")?.getBoundingClientRect();
      const card = document.querySelector("#loggingLauncherEmbedded .daily-warmup-card")?.getBoundingClientRect();
      return {
        header: header?.toJSON() || null,
        host: host?.toJSON() || null,
        card: card?.toJSON() || null
      };
    });
    assert.ok(mobileInlineWarmupGeometry.host && mobileInlineWarmupGeometry.card, JSON.stringify(mobileInlineWarmupGeometry));
    assert.ok(mobileInlineWarmupGeometry.card.top >= mobileInlineWarmupGeometry.host.top - 1, JSON.stringify(mobileInlineWarmupGeometry));
    assert.ok(mobileInlineWarmupGeometry.card.bottom <= mobileInlineWarmupGeometry.host.bottom + 1, JSON.stringify(mobileInlineWarmupGeometry));
    assert.ok(mobileInlineWarmupGeometry.card.top >= mobileInlineWarmupGeometry.header.bottom, JSON.stringify(mobileInlineWarmupGeometry));
    await mobile.page.locator("#page-logging .logging-card").screenshot({ path: path.join(screenshotDir, "logging-mobile-warmup-embedded.png") });
    await mobile.page.locator('[data-warmup-drill="burst-peeking"]').click();
    await mobile.page.locator("#dailyWarmupSave").click();
    await mobile.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.mobileLoggingFormStage === "launcher");

    await mobile.page.locator('[data-mobile-page="stats"]').click({ force: true });
    await mobile.page.evaluate(() => {
      const root = document.querySelector(".app-root") || document.documentElement;
      root.scrollTop = 0;
      const touch = (type, y) => {
        const event = new Event(type, { bubbles: true, cancelable: true });
        Object.defineProperty(event, "touches", { value: type === "touchend" ? [] : [{ clientY: y }] });
        root.dispatchEvent(event);
      };
      touch("touchstart", 20);
      touch("touchmove", 120);
    });
    await mobile.page.waitForFunction(() => document.getElementById("mobilePullRefreshIndicator")?.textContent === "Release to sync");

    assert.deepEqual(desktop.consoleErrors, []);
    assert.deepEqual(mobile.consoleErrors, []);
    await desktop.page.close();
    await mobile.page.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }

  console.log("Logging desktop launcher and all-page mobile pull-to-sync checks passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
