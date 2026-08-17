"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41932;
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
      const file = path.resolve(root, `.${relative}`);
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

async function boot(page) {
  await page.route(/.*@supabase\/supabase-js@2.*/, route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
  await page.addInitScript(() => {
    globalThis.__RANKEDCOACH_TEST_HOOKS__ = true;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("rankedcoach_guest_choice_seen_v1", "1");
    localStorage.setItem("rankedcoach_daily_entrance_seen_v1", JSON.stringify({
      date: "2099-01-01",
      seenPages: ["home", "logging", "stats", "insights", "library"]
    }));
  });
  await page.goto(`http://127.0.0.1:${port}/index.html?mobileBottomPadding=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 20000 });
  await page.waitForFunction(() => document.documentElement.classList.contains("is-mobile-layout") && document.body.classList.contains("is-mobile-layout"), null, { timeout: 10000 });
  await page.waitForFunction(() => Boolean(globalThis.RankedCoachTestHooks), null, { timeout: 10000 });
}

async function measureMobilePage(page, pageName) {
  await page.evaluate(name => {
    globalThis.RankedCoachTestHooks.activatePageForTest(name);
    document.querySelectorAll(".modal-overlay,.modal-backdrop,#guestChoiceModal,#dailyEntranceOverlay,#dailyWarmupModal,#weeklyFocusModal,#lensModal,#matchSummaryModal,#goalRankModal").forEach(element => {
      element.hidden = true;
      element.classList.remove("show", "active", "is-active", "is-opening", "visible");
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("pointer-events", "none", "important");
    });
    document.body.classList.remove("has-active-modal", "mobile-modal-open", "modal-open", "has-modal-open");
  }, pageName);
  await page.waitForTimeout(180);
  return page.evaluate(() => {
    const scrollRoot = document.querySelector(".app-root");
    const active = document.querySelector(".page.active");
    const bottomNav = document.querySelector(".app-header");
    if (!scrollRoot || !active) throw new Error("Missing active mobile page shell");
    scrollRoot.scrollTop = 0;
    const rootRect = scrollRoot.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const visibleChildren = Array.from(active.children || []).filter(child => {
      const style = getComputedStyle(child);
      return style.display !== "none" && style.visibility !== "hidden";
    });
    const childBottom = visibleChildren.length
      ? Math.max(...visibleChildren.map(child => child.getBoundingClientRect().bottom))
      : activeRect.bottom;
    const contentBottom = childBottom - rootRect.top + scrollRoot.scrollTop;
    const rootStyles = getComputedStyle(scrollRoot);
    const pageStyles = getComputedStyle(active);
    const navRect = bottomNav?.getBoundingClientRect?.();
    return {
      pageId: active.id,
      rootScrollHeight: scrollRoot.scrollHeight,
      rootClientHeight: scrollRoot.clientHeight,
      contentBottom,
      bottomGap: Math.round(scrollRoot.scrollHeight - contentBottom),
      rootPaddingBottom: Number.parseFloat(rootStyles.paddingBottom || "0") || 0,
      pagePaddingBottom: Number.parseFloat(pageStyles.paddingBottom || "0") || 0,
      navHeight: navRect?.height || 0
    };
  });
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
    userAgent: "Mozilla/5.0 (Linux; Android 11; SM-G980F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36"
  });
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", error => pageErrors.push(error.message));

  try {
    await boot(page);
    const measurements = [];
    for (const pageName of ["home", "logging", "stats", "insights", "library"]) {
      measurements.push(await measureMobilePage(page, pageName));
    }

    measurements.forEach(measure => {
      assert.ok(measure.rootPaddingBottom >= 70, `${measure.pageId} should keep bottom-nav clearance on .app-root.`);
      assert.ok(measure.pagePaddingBottom <= 35, `${measure.pageId} should not duplicate bottom-nav clearance on .page.active.`);
      const contentIsShorterThanViewport = measure.contentBottom <= measure.rootClientHeight + measure.rootPaddingBottom + 8;
      if (!contentIsShorterThanViewport) {
        assert.ok(measure.bottomGap <= measure.rootPaddingBottom + 45, `${measure.pageId} bottom gap should be a single nav clearance, not a doubled ~208px zone: ${JSON.stringify(measure)}`);
      }
    });

    await page.evaluate(() => {
      globalThis.RankedCoachTestHooks.activatePageForTest("home");
      document.querySelector(".app-root").scrollTop = 0;
      const modal = document.getElementById("goalRankModal");
      if (modal) {
        modal.hidden = false;
        modal.style.removeProperty("display");
        modal.style.removeProperty("pointer-events");
      }
    });
    const beforeWidgetScroll = await page.evaluate(() => document.querySelector(".app-root")?.scrollTop || 0);
    await page.locator("#goalRRWidget").click({ force: true });
    await page.waitForTimeout(120);
    const afterWidgetScroll = await page.evaluate(() => document.querySelector(".app-root")?.scrollTop || 0);
    assert.ok(Math.abs(afterWidgetScroll - beforeWidgetScroll) <= 4, `Goal-rank widget should not push the mobile page scroll. Before=${beforeWidgetScroll}, after=${afterWidgetScroll}`);
    const triggerState = await page.evaluate(() => {
      const trigger = document.getElementById("goalRankCustomTrigger");
      const menu = document.getElementById("goalRankCustomMenu");
      const rect = trigger?.getBoundingClientRect?.();
      const style = trigger ? getComputedStyle(trigger) : null;
      return {
        visible: Boolean(trigger && rect?.width && rect?.height && style?.display !== "none" && style?.visibility !== "hidden"),
        menuOpen: Boolean(menu && !menu.hidden)
      };
    });
    if (triggerState.visible) {
      const beforeTriggerScroll = await page.evaluate(() => document.querySelector(".app-root")?.scrollTop || 0);
      await page.locator("#goalRankCustomTrigger").click({ timeout: 5000 });
      await page.waitForTimeout(120);
      const afterTriggerScroll = await page.evaluate(() => document.querySelector(".app-root")?.scrollTop || 0);
      assert.ok(Math.abs(afterTriggerScroll - beforeTriggerScroll) <= 4, `Goal-rank custom trigger should not push the mobile page scroll. Before=${beforeTriggerScroll}, after=${afterTriggerScroll}`);
    }

    assert.deepEqual(consoleErrors, [], "No console errors should occur.");
    assert.deepEqual(pageErrors, [], "No page errors should occur.");
    console.log(JSON.stringify({ ok: true, measurements, goalWidgetScroll: { before: beforeWidgetScroll, after: afterWidgetScroll }, triggerState }, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
