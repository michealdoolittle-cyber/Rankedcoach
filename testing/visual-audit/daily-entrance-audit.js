const http = require("http");
const fs = require("fs");
const path = require("path");
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

  await page.evaluate(() => {
    const controller = window.RankedCoachDailyEntrance;
    controller.resetToday();
    controller.activatePage("stats");
  });
  await page.waitForFunction(() => window.RankedCoachDailyEntrance.getState().activePage === "stats", null, { timeout: 3000 });
  await page.waitForTimeout(90);
  const statsMid = await page.evaluate(() => window.RankedCoachDailyEntrance.getState());
  if (statsMid.activePage !== "stats") {
    throw new Error(`Stats entrance did not start: ${JSON.stringify(statsMid)}`);
  }
  await page.screenshot({ path: path.join(OUT, `${viewport.width}-stats-mid.png`) });
  await page.evaluate(() => window.RankedCoachDailyEntrance.skipAll());

  const pageStarts = {};
  for (const pageId of ["logging", "insights", "library"]) {
    await page.evaluate((nextPageId) => {
      const controller = window.RankedCoachDailyEntrance;
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
    skipped: skipped.daily?.skipped === true,
    skipPersisted: skipPersisted.daily?.skipped === true && !skipPersisted.activePage,
    statsStarted: statsMid.activePage === "stats",
    pageStarts,
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
    const results = [];
    results.push(await runViewport(browser, { width: 390, height: 844 }));
    results.push(await runViewport(browser, { width: 1440, height: 900 }));
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
