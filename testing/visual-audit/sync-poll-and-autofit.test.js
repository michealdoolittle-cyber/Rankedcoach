"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41927;
const contentTypes = {
  ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp"
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
      const filePath = path.join(root, pathname === "/" ? "index.html" : pathname);
      if (!filePath.startsWith(root)) return response.writeHead(403).end("Forbidden");
      fs.readFile(filePath, (error, data) => {
        response.writeHead(error ? 404 : 200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
        response.end(error ? "Not found" : data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function anonymousSupabaseStub() {
  return `
    globalThis.supabase = { createClient() {
      return {
        auth: {
          getSession: async () => ({ data: { session: null }, error: null }),
          getUser: async () => ({ data: { user: null }, error: null }),
          onAuthStateChange(callback) {
            setTimeout(() => callback("INITIAL_SESSION", null), 0);
            return { data: { subscription: { unsubscribe() {} } } };
          }
        },
        from() { return { select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: null, error: null }) }; }
      };
    }};
  `;
}

async function run() {
  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.match(appSource, /persistentAccountRevisionPollPromise/);
  assert.match(appSource, /ACCOUNT_STATE_REVISION_POLL_MS/);
  assert.match(appSource, /mutationTouchesAutoFitText/);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const issues = [];
  page.on("console", message => { if (message.type() === "error") issues.push(message.text()); });
  page.on("pageerror", error => issues.push(error.message));
  try {
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
      contentType: "text/javascript", body: anonymousSupabaseStub()
    }));
    await page.route(`http://127.0.0.1:${port}/?rankedcoach-update-check=*`, route => route.fulfill({
      contentType: "text/html", body: '<script src="app.js?v=round4-new-build"></script>'
    }));
    await page.addInitScript(() => {
      const profile = {
        id: "round4-autofit", name: "Round 4", accountName: "Round 4", region: "NA",
        themeKey: "royal-purple", layoutShape: "honeycomb", layoutTexture: "default", matches: []
      };
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profile.id);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
      localStorage.setItem("valtracker_log_entries_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v2:guest", "[]");
      globalThis.__RANKEDCOACH_TEST_HOOKS__ = true;
    });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.dataset.layoutShape === "honeycomb", null, { timeout: 15000 });
    await page.evaluate(() => globalThis.RankedCoachDailyEntrance?.skipAll?.());
    // Let the app's own page/chart entrance work settle before measuring
    // background mutations. The regression begins after a settled page, not
    // while its first render is still intentionally assembling content.
    await page.waitForTimeout(2200);

    const autoFitSetup = await page.evaluate(() => {
      const target = document.querySelector("#page-home .compass-panel :is(strong,p,span)");
      return { target: Boolean(target), baseline: globalThis.RankedCoachTestHooks?.getAutoFitScheduleCount?.() };
    });
    assert.equal(autoFitSetup.target, true, "a settled layout-style text target is required for the mutation scope test");
    assert.equal(typeof autoFitSetup.baseline, "number");

    // These are the three real late mutations that were re-fitting settled
    // copy: toast, decorative animation DOM, and an update-check completion.
    await page.evaluate(() => globalThis.RankedCoachTestHooks.showToast("Round 4 toast", { durationMs: 800 }));
    await page.waitForTimeout(280);
    const afterToast = await page.evaluate(() => globalThis.RankedCoachTestHooks.getAutoFitScheduleCount());

    await page.evaluate(() => {
      const decorative = document.createElement("div");
      decorative.className = "round4-decorative-animation";
      document.body.appendChild(decorative);
      decorative.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 120 });
    });
    await page.waitForTimeout(280);
    const afterAnimation = await page.evaluate(() => globalThis.RankedCoachTestHooks.getAutoFitScheduleCount());

    await page.evaluate(() => globalThis.RankedCoachTestHooks.checkForAppUpdate({ force: true }));
    await page.waitForTimeout(300);
    const afterUpdate = await page.evaluate(() => globalThis.RankedCoachTestHooks.getAutoFitScheduleCount());
    const incidentalScope = await page.evaluate(() => {
      const selector = globalThis.RankedCoachTestHooks.getAutoFitSelector();
      const toast = document.querySelector("#appToastStack");
      const decorative = document.querySelector(".round4-decorative-animation");
      return {
        toastMatches: Boolean(toast?.matches(selector) || toast?.closest(selector) || toast?.querySelector(selector)),
        animationMatches: Boolean(decorative?.matches(selector) || decorative?.closest(selector) || decorative?.querySelector(selector))
      };
    });
    assert.deepEqual(incidentalScope, { toastMatches: false, animationMatches: false }, JSON.stringify(incidentalScope));
    assert.deepEqual({ afterToast, afterAnimation, afterUpdate }, {
      afterToast: autoFitSetup.baseline,
      afterAnimation: autoFitSetup.baseline,
      afterUpdate: autoFitSetup.baseline
    });

    // The initial observer deliberately disconnects once the layout has
    // settled. Even a late content mutation does not resize the dashboard;
    // genuine layout/style work requests a new fit explicitly instead.
    const targetMutationCalls = await page.evaluate(async () => {
      const target = document.querySelector("#page-home .compass-panel :is(strong,p,span)");
      target.append(document.createTextNode(" verified"));
      await new Promise(resolve => setTimeout(resolve, 260));
      return globalThis.RankedCoachTestHooks.getAutoFitScheduleCount();
    });
    assert.equal(targetMutationCalls, autoFitSetup.baseline, `settled copy must not re-fit from late DOM changes: ${targetMutationCalls}`);
    const explicitRefitCalls = await page.evaluate(async () => {
      globalThis.RankedCoachTestHooks.requestAutoFit();
      await new Promise(resolve => setTimeout(resolve, 260));
      return globalThis.RankedCoachTestHooks.getAutoFitScheduleCount();
    });
    assert.ok(explicitRefitCalls > autoFitSetup.baseline, `explicit layout work must still queue a fit: ${explicitRefitCalls}`);

    const pollResult = await page.evaluate(async () => {
      let reads = 0;
      const client = {
        from() {
          return {
            select() { return this; },
            eq() { return this; },
            async maybeSingle() {
              reads += 1;
              await new Promise(resolve => setTimeout(resolve, 40));
              return { data: { updated_at: "2026-08-07T18:00:00.000Z" }, error: null };
            }
          };
        }
      };
      const hooks = globalThis.RankedCoachTestHooks;
      hooks.configureRevisionPoll({ user: { id: "round4-poll-user" }, client, saving: true });
      const nativeSetTimeout = window.setTimeout;
      const delays = [];
      window.setTimeout = function (callback, delay, ...args) {
        delays.push(Number(delay));
        return nativeSetTimeout(callback, delay, ...args);
      };
      await Promise.all(Array.from({ length: 12 }, () => hooks.pollRevision()));
      const saving = { reads, retryCount: delays.filter(delay => delay === hooks.getRevisionPollDelay()).length };
      hooks.clearRevisionPollRetry();
      hooks.configureRevisionPoll({ user: { id: "round4-poll-user" }, client, saving: false });
      await Promise.all([hooks.pollRevision(), hooks.pollRevision()]);
      window.setTimeout = nativeSetTimeout;
      return { saving, readsAfterConcurrentPoll: reads };
    });
    assert.deepEqual(pollResult.saving, { reads: 0, retryCount: 1 }, JSON.stringify(pollResult));
    assert.equal(pollResult.readsAfterConcurrentPoll, 1, JSON.stringify(pollResult));
    assert.deepEqual(issues, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Revision polling stays bounded and incidental DOM updates no longer re-fit settled layout text.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
