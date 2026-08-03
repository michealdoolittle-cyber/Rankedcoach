"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41817;
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath.startsWith("/api/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {} }));
        return;
      }
      if (relativePath === "/") relativePath = "/index.html";
      const filePath = path.join(root, relativePath);
      if (!filePath.startsWith(root)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404).end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function seedGuestProfile({ riotId = "" } = {}) {
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", "guest-profile");
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
    id: "guest-profile",
    name: "Guest",
    accountName: "Guest",
    riotId,
    region: "NA",
    matches: riotId ? [{
      id: "guest-imported-match",
      matchId: "guest-imported-match",
      source: "henrik_sync",
      importSource: "henrik",
      lastSyncSource: "henrik",
      createdAt: "2026-08-03T12:00:00.000Z",
      result: "win",
      agent: "Jett",
      map: "Ascent",
      kills: 18,
      deaths: 12,
      assists: 3
    }] : []
  }]));
}

async function openPage(browser, initScript = "") {
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });
  const issues = [];
  page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
  page.on("console", message => {
    const text = message.text();
    if (message.type() === "error" && !/Failed to load resource: net::ERR_(?:CONNECTION_CLOSED|ABORTED)/i.test(text)) {
      issues.push(`[console] ${text}`);
    }
  });
  if (initScript) await page.addInitScript({ content: initScript });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(globalThis.RankedCoachSyncDiagnostics?.getMode), null, { timeout: 15000 });
  return { page, issues };
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    {
      const { page, issues } = await openPage(browser);
      await page.waitForSelector("#authModal.active #authGuestBtn", { timeout: 15000 });
      await page.evaluate(() => document.getElementById("authGuestBtn")?.click());
      await page.waitForSelector("#guestTutorialChoiceModal.active", { timeout: 15000 });
      await page.evaluate(() => document.getElementById("guestTutorialSkipBtn")?.click());
      await page.waitForFunction(() => {
        const profile = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0] || {};
        return Array.isArray(profile.matches) && profile.matches.length >= 700;
      }, null, { timeout: 15000 });
      const demoState = await page.evaluate(() => ({
        entryChoice: localStorage.getItem("valtracker_entry_choice_v1"),
        activeAuth: document.getElementById("authModal")?.classList.contains("active") || false,
        matchCount: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.matches?.length || 0
      }));
      assert.equal(demoState.entryChoice, "guest", "guest tutorial skip should keep guest mode");
      assert.equal(demoState.activeAuth, false, "guest tutorial skip should close auth");
      assert.ok(demoState.matchCount >= 700, `guest demo should load built-in matches: ${JSON.stringify(demoState)}`);
      assert.deepEqual(issues, [], "guest tutorial demo path should not emit console/page errors");
      await page.close();
    }

    {
      const { page, issues } = await openPage(browser, `(${seedGuestProfile.toString()})({ riotId: "" });`);
      await page.evaluate(() => document.getElementById("profileAddBtn")?.click());
      await page.waitForSelector("#authModal.active .auth-intent-message", { timeout: 15000 });
      const gate = await page.evaluate(() => ({
        authActive: document.getElementById("authModal")?.classList.contains("active") || false,
        riotActive: document.getElementById("riotModal")?.classList.contains("active") || false,
        profileAddOpen: document.getElementById("profileAddMenu")?.classList.contains("is-open") || false,
        message: document.querySelector("#authModal .auth-intent-message")?.textContent || "",
        pending: JSON.parse(sessionStorage.getItem("rankedcoach_pending_post_auth_action_v1") || "null")
      }));
      assert.equal(gate.authActive, true, "guest profile-add should open auth");
      assert.equal(gate.riotActive, false, "guest profile-add should not open Riot modal");
      assert.equal(gate.profileAddOpen, false, "guest profile-add should not open the real profile add menu");
      assert.match(gate.message, /free RankedCoach account/i, "guest profile-add should explain account requirement");
      assert.equal(gate.pending?.type, "profile-add", "guest profile-add should resume after auth");
      assert.deepEqual(issues, [], "guest profile-add gate should not emit console/page errors");
      await page.close();
    }

    {
      const { page, issues } = await openPage(browser, `(${seedGuestProfile.toString()})({ riotId: "GuestLinked#NA1" });`);
      await page.waitForSelector("#authModal.active .auth-intent-message", { timeout: 15000 });
      const migrationPrompt = await page.evaluate(() => ({
        authActive: document.getElementById("authModal")?.classList.contains("active") || false,
        message: document.querySelector("#authModal .auth-intent-message")?.textContent || "",
        diagnostics: globalThis.RankedCoachSyncDiagnostics.getMode(),
        pending: JSON.parse(sessionStorage.getItem("rankedcoach_pending_post_auth_action_v1") || "null")
      }));
      assert.equal(migrationPrompt.authActive, true, "existing guest Riot profile should be prompted to sign in");
      assert.match(migrationPrompt.message, /sync.*desktop.*mobile/i, "migration prompt should explain cross-device sync");
      assert.equal(migrationPrompt.diagnostics.mode, "guest", "migration prompt should still report guest mode before auth");
      assert.equal(migrationPrompt.diagnostics.crossDeviceSyncRequiresSignIn, true, "guest Riot profile should require sign-in");
      assert.equal(migrationPrompt.pending?.type, "sync-existing-riot", "existing guest Riot profile should resume sync after auth");
      assert.deepEqual(issues, [], "guest migration prompt should not emit console/page errors");
      await page.close();
    }

    console.log("Guest mode tutorial-only smoke passed.");
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
