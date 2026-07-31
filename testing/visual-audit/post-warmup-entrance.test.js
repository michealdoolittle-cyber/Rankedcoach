"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..", "public");
const PORT = 41917;
const TYPES = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4"
};

function json(response, payload) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let pathname = decodeURIComponent((request.url || "/").split("?")[0]);
      if (pathname === "/api/content/playlist") return json(response, { items: [] });
      if (pathname === "/api/content/knowledge") return json(response, { items: [] });
      if (pathname === "/api/content/skin-media") return json(response, { matches: {} });
      if (pathname === "/api/content/player-cards") return json(response, { data: [] });
      if (pathname === "/api/content/patch-notes") return json(response, { title: "Patch", bullets: [], sections: [] });
      if (pathname === "/api/henrik/matches" && request.method === "POST") return json(response, { data: [] });
      if (pathname === "/") pathname = "/index.html";
      const filePath = path.join(ROOT, pathname);
      if (!filePath.startsWith(ROOT)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, body) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        response.end(body);
      });
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `
    window.supabase = {
      createClient() {
        return {
          auth: {
            getSession: async () => ({ data: { session: null } }),
            getUser: async () => ({ data: { user: null } }),
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

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
      contentType: "text/javascript",
      body: supabaseStub()
    }));
    await page.addInitScript(() => {
      const id = "warmup-entrance-regression";
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", id);
      localStorage.setItem("rankedcoach_daily_entrance_v2:guest", JSON.stringify({
        date: key,
        skipped: false,
        seenPages: ["home"],
        seenSections: []
      }));
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id,
        name: "Warmup Entrance",
        accountName: "Warmup Entrance",
        region: "NA",
        matches: [],
        accessibility: { motionMode: "standard" }
      }]));
    });

    await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
    await page.locator("#dailyWarmupModal.active").waitFor({ state: "visible", timeout: 6000 });
    assert.equal(await page.evaluate(() => document.body.classList.contains("daily-entrance-motion-active")), false, "Home entrance should not play before the warm-up prompt is resolved.");
    await page.click('[data-warmup-drill="burst-peeking"]');
    await page.click("#dailyWarmupSave");
    await page.locator("#dailyWarmupModal").waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
    await page.waitForFunction(() => document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 2400 });
    const replayState = await page.evaluate(() => window.RankedCoachDailyEntrance?.getState?.());
    assert.equal(replayState?.activePage, "home", "Warm-up completion should replay the Home entrance even if Home was marked seen earlier today.");

    await page.waitForFunction(() => !document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 9000 });
    await page.click("#compassCardAim");
    await page.locator("#lensModalOverlay.active").waitFor({ state: "visible", timeout: 3000 });
    assert.equal((await page.locator("#lensModalStatsTitle").textContent()).trim(), "Aim Category Scores");
    assert.equal(errors.length, 0, `console/page errors:\n${errors.join("\n")}`);
    console.log("Post warm-up entrance regression passed.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
