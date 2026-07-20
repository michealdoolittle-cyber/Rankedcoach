const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const {
  port,
  startServer,
  supabaseStub,
  seed,
  dismissWarmup
} = require("./gamesense-library.test.js");

const OUT = path.resolve(__dirname, "output", "runtime-performance");
const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64"
);
const RETIRED_ASSETS = [
  "agent-effects-data.js",
  "sandbox-fx.engine.js",
  "sandbox-fx.primitives.js"
];
const PAGE_IDS = ["home", "logging", "stats", "insights", "library"];

async function installPageStubs(page) {
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
    contentType: "text/javascript",
    body: supabaseStub()
  }));
  await page.route(/https:\/\/raw\.githubusercontent\.com\/michealdoolittle-cyber\/images\/main\/icons\/[^/?]+_rank\.png(?:\?.*)?$/i, route => route.fulfill({
    contentType: "image/png",
    body: PIXEL_PNG
  }));
  await page.addInitScript(() => {
    window.__rankedCoachRuntimeLongTasks = [];
    window.__rankedCoachRuntimeLongFrames = [];
    try {
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          window.__rankedCoachRuntimeLongTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
            attribution: Array.from(entry.attribution || []).map(item => ({
              name: item.name || "",
              containerType: item.containerType || "",
              containerName: item.containerName || "",
              containerId: item.containerId || "",
              containerSrc: item.containerSrc || ""
            })),
            phase: window.__rankedCoachRuntimePhase || "unmarked"
          });
        });
      }).observe({ type: "longtask", buffered: true });
    } catch (_error) {
      // Long Task timing is optional in older browser engines.
    }
    try {
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          window.__rankedCoachRuntimeLongFrames.push({
            startTime: entry.startTime,
            duration: entry.duration,
            blockingDuration: entry.blockingDuration,
            renderStart: entry.renderStart,
            styleAndLayoutStart: entry.styleAndLayoutStart,
            scripts: Array.from(entry.scripts || []).map(script => ({
              duration: script.duration,
              invoker: script.invoker || "",
              invokerType: script.invokerType || "",
              sourceURL: script.sourceURL || "",
              sourceFunctionName: script.sourceFunctionName || "",
              sourceCharPosition: script.sourceCharPosition || 0
            }))
          });
        });
      }).observe({ type: "long-animation-frame", buffered: true });
    } catch (_error) {
      // Long Animation Frame timing is optional in older browser engines.
    }
  });
}

async function waitForApp(page) {
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  await dismissWarmup(page);
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
  await dismissWarmup(page);
  await page.waitForFunction(() => Boolean(window.RankedCoachDailyEntrance?.getState?.().ready), null, { timeout: 10000 });
  await page.evaluate(() => window.RankedCoachDailyEntrance.skipAll());
  await page.waitForFunction(() => !document.body.classList.contains("daily-entrance-motion-active"));
}

async function exerciseAnimatedRuntime(page, viewport) {
  const mobile = viewport.width < 700;
  const themeClass = mobile ? "theme-glint-sweep" : "theme-aurora-rift";
  const motionTarget = mobile ? "#page-home .card" : ".app-root";
  const pseudo = "::before";

  await page.evaluate(({ nextThemeClass }) => {
    [...document.body.classList]
      .filter(className => className.startsWith("theme-"))
      .forEach(className => document.body.classList.remove(className));
    document.body.classList.add(nextThemeClass);
    window.__rankedCoachRuntimeLongTasks = [];
    window.__rankedCoachRuntimeLongFrames = [];
    window.__rankedCoachRuntimePhase = "entrance-replay";
    const controller = window.RankedCoachDailyEntrance;
    controller.resetToday();
    controller.activatePage("home");
  }, { nextThemeClass: themeClass });
  await page.waitForFunction(() => window.RankedCoachDailyEntrance.getState().activePage === "home", null, { timeout: 4000 });

  const pausedTheme = await page.locator(motionTarget).first().evaluate((element, pseudoElement) => ({
    animationName: getComputedStyle(element, pseudoElement).animationName,
    animationPlayState: getComputedStyle(element, pseudoElement).animationPlayState
  }), pseudo);
  assert.notEqual(pausedTheme.animationName, "none", `${themeClass} did not expose its animated layer.`);
  assert.match(pausedTheme.animationPlayState, /paused/, `${themeClass} kept competing with the entrance: ${JSON.stringify(pausedTheme)}`);

  await page.mouse.click(Math.max(12, viewport.width - 20), Math.min(180, viewport.height - 80));
  await page.waitForFunction(() => !document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 2000 });
  const resumedTheme = await page.locator(motionTarget).first().evaluate((element, pseudoElement) => ({
    animationName: getComputedStyle(element, pseudoElement).animationName,
    animationPlayState: getComputedStyle(element, pseudoElement).animationPlayState
  }), pseudo);
  assert.match(resumedTheme.animationPlayState, /running/, `${themeClass} did not resume after the entrance: ${JSON.stringify(resumedTheme)}`);

  const navigation = await page.evaluate(async ({ ids, isMobile }) => {
    window.__rankedCoachRuntimePhase = "rapid-navigation";
    const results = [];
    const nextPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    for (let cycle = 0; cycle < 3; cycle += 1) {
      for (const id of ids) {
        window.__rankedCoachRuntimePhase = `nav-${cycle + 1}-${id}`;
        const selector = isMobile
          ? `.mobile-bottom-page-btn[data-mobile-page='${id}']`
          : `.nav-btn[data-page='${id}']`;
        const button = document.querySelector(selector);
        const startedAt = performance.now();
        button?.click();
        const dispatchedAt = performance.now();
        await nextPaint();
        const activeElement = isMobile
          ? document.querySelector(".page.is-current-page")
          : document.querySelector(".page.active:not(.exiting)");
        results.push({
          id,
          cycle: cycle + 1,
          startedAt,
          dispatchElapsed: dispatchedAt - startedAt,
          elapsed: performance.now() - startedAt,
          activePage: activeElement?.id?.replace(/^page-/, "") || ""
        });
      }
    }
    return results;
  }, { ids: PAGE_IDS, isMobile: mobile });
  navigation.forEach(result => {
    assert.equal(result.activePage, result.id, `Rapid navigation missed ${result.id}: ${JSON.stringify(result)}`);
    assert.ok(result.elapsed < 180, `Navigation to ${result.id} missed two responsive frames: ${JSON.stringify(result)}`);
  });

  const framePacing = await page.evaluate(() => new Promise(resolve => {
    window.__rankedCoachRuntimePhase = "frame-pacing";
    const deltas = [];
    let first = null;
    let previous = null;
    const sample = timestamp => {
      if (first === null) first = timestamp;
      if (previous !== null) deltas.push(timestamp - previous);
      previous = timestamp;
      if (timestamp - first >= 1400) {
        const ordered = [...deltas].sort((a, b) => a - b);
        resolve({
          frames: deltas.length,
          max: Math.max(0, ...deltas),
          p95: ordered[Math.max(0, Math.ceil(ordered.length * .95) - 1)] || 0
        });
        return;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }));
  assert.ok(framePacing.frames >= 55, `Animated ${viewport.width}px runtime dropped too many frames: ${JSON.stringify(framePacing)}`);
  assert.ok(framePacing.p95 < 45, `Animated ${viewport.width}px runtime has unstable frame pacing: ${JSON.stringify(framePacing)}`);

  const runtime = await page.evaluate(() => {
    window.__rankedCoachRuntimePhase = "final-assertions";
    window.applyAgentFx?.("Jett");
    return {
      longTasks: (window.__rankedCoachRuntimeLongTasks || []).filter(task => task.duration >= 100),
      longFrames: (window.__rankedCoachRuntimeLongFrames || []).filter(frame => frame.duration >= 100),
      sandboxEngine: typeof window.SandboxFxEngine,
      sandboxScaffold: Boolean(document.getElementById("sandboxFxScaffold")),
      agentFxLayers: document.querySelectorAll("#agentFxBehind, #agentFxFront").length,
      staticAgentEngine: document.getElementById("agentFrame")?.dataset.fxEngine || ""
    };
  });
  assert.equal(runtime.sandboxEngine, "undefined");
  assert.equal(runtime.sandboxScaffold, false);
  assert.equal(runtime.agentFxLayers, 0);
  assert.ok(["", "none"].includes(runtime.staticAgentEngine), `Unexpected agent FX engine returned: ${runtime.staticAgentEngine}`);
  assert.deepEqual(runtime.longTasks, [], `Post-load runtime produced 100ms+ tasks: ${JSON.stringify({ longTasks: runtime.longTasks, longFrames: runtime.longFrames, navigation })}`);

  await page.screenshot({
    path: path.join(OUT, `${viewport.width}-animated-runtime.png`),
    fullPage: false
  });
  return { themeClass, pausedTheme, resumedTheme, navigation, framePacing, runtime };
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const report = [];
    for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 900 }]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const requestedUrls = [];
      const issues = [];
      page.on("request", request => requestedUrls.push(request.url()));
      page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
      page.on("console", message => {
        if (["error", "warning"].includes(message.type())) issues.push(`[${message.type()}] ${message.text()}`);
      });
      await installPageStubs(page);
      await seed(page, `runtime-${viewport.width}`);
      await waitForApp(page);
      const proof = await exerciseAnimatedRuntime(page, viewport);
      const retiredRequests = requestedUrls.filter(url => RETIRED_ASSETS.some(asset => url.includes(asset)));
      assert.deepEqual(retiredRequests, [], `Retired production assets were requested: ${JSON.stringify(retiredRequests)}`);
      assert.deepEqual(issues, [], `Runtime console issues at ${viewport.width}px: ${JSON.stringify(issues)}`);
      report.push({ viewport, retiredRequests, issues, ...proof });
      await context.close();
    }
    fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
