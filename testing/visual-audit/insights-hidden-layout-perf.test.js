"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41931;
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

async function populateInsightCards(page) {
  await page.evaluate(() => {
    const container = document.getElementById("insightsList");
    if (!container) throw new Error("Missing #insightsList");
    container.classList.remove("has-open-card", "is-scrollable");
    container.removeAttribute("style");
    container.innerHTML = Array.from({ length: 5 }, (_, index) => `
      <article class="insight-card ${index === 0 ? "open" : ""}">
        <div class="insight-card-head">
          <span class="insight-badge">Needs Work</span>
          <strong>Hidden layout guard ${index + 1}</strong>
        </div>
        <p>This synthetic card gives the overflow measurement enough real height to lock the visible Insights list.</p>
      </article>
    `).join("");
  });
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 3840, height: 2160 } });
  const consoleMessages = [];
  const pageErrors = [];

  page.on("console", message => {
    consoleMessages.push({ type: message.type(), text: message.text(), location: message.location() });
  });
  page.on("pageerror", error => pageErrors.push(error.message));
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

  try {
    await page.goto(`http://127.0.0.1:${port}/index.html?insightsHiddenPerf=${Date.now()}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 20000 });
    await page.waitForFunction(() => Boolean(globalThis.RankedCoachTestHooks), null, { timeout: 10000 });

    await page.evaluate(() => globalThis.RankedCoachTestHooks.activatePageForTest("home"));
    await populateInsightCards(page);
    await page.evaluate(() => globalThis.RankedCoachTestHooks.scheduleInsightListOverflowForTest());
    await page.waitForTimeout(180);

    const hiddenState = await page.evaluate(() => globalThis.RankedCoachTestHooks.getInsightsListOverflowState());
    assert.equal(hiddenState.activePage, "page-home", "Home should be active while hidden Insights sizing is requested.");
    assert.equal(hiddenState.isScrollable, false, "Hidden Insights list should not lock scroll state.");
    assert.equal(hiddenState.height, "", "Hidden Insights list should not receive a measured height.");

    await page.evaluate(() => globalThis.RankedCoachTestHooks.activatePageForTest("insights"));
    await page.waitForFunction(() => globalThis.RankedCoachTestHooks.getInsightsListOverflowState().activePage === "page-insights");
    await populateInsightCards(page);
    await page.evaluate(() => globalThis.RankedCoachTestHooks.scheduleInsightListOverflowForTest());
    await page.waitForTimeout(220);

    const visibleState = await page.evaluate(() => globalThis.RankedCoachTestHooks.getInsightsListOverflowState());
    assert.equal(visibleState.activePage, "page-insights", "Insights should be active for the visible measurement pass.");
    assert.equal(visibleState.isScrollable, true, "Visible Insights list should still lock overflow when enough cards exist.");
    assert.match(visibleState.height, /^\d+px$/, "Visible Insights list should receive a measured pixel height.");
    assert.equal(visibleState.overflowY, "scroll", "Visible Insights list should keep its scroll affordance.");

    const hiddenLayoutWarnings = consoleMessages
      .filter(message => /Rendering was performed in a subtree hidden by content-visibility/i.test(message.text));
    assert.deepEqual(hiddenLayoutWarnings, [], "No hidden content-visibility layout warnings should be emitted.");
    assert.deepEqual(pageErrors, [], "No page errors should be emitted.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
