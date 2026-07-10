"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41779;
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
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath === "/") relativePath = "/index.html";
      const filePath = path.join(root, relativePath);
      if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const consoleErrors = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", error => consoleErrors.push(error.message));

  await page.addInitScript(() => {
    const profileId = "profile-log-test";
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", profileId);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
      id: profileId,
      name: "Log Test",
      accountName: "Guest",
      riotId: "Test#NA1",
      region: "NA",
      importSource: "henrik",
      lastSyncSource: "henrik",
      matches: [{
        id: "match-1",
        matchId: "match-1",
        createdAt: "2026-07-10T12:00:00Z",
        rr: 18,
        result: "win",
        agent: "Sova",
        map: "Haven",
        metadata: { matchId: "match-1", agent: "Sova", mapName: "Haven", result: "win" }
      }]
    }]));
    localStorage.setItem("valtracker_log_entries_v2:guest", JSON.stringify([{
      id: "ranked-match-log:profile-log-test:match-1",
      matchId: "match-1",
      profileId,
      source: "henrik-match-placeholder",
      isMatchPlaceholder: true,
      isPlayerAuthored: false,
      createdAt: "2026-07-10T12:00:00Z",
      result: "win",
      rr: 18,
      agent: "Sova",
      role: "Initiator",
      map: "Haven",
      notes: ""
    }]));
  });

  try {
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "networkidle" });
    await page.click('[data-mobile-page="logging"]');
    await page.click('[data-mobile-logging-view="feed"]');
    const placeholder = page.locator(".log-entry-placeholder");
    await placeholder.waitFor({ state: "visible" });
    assert.match(await placeholder.innerText(), /Add your reflection for this ranked match\./);
    assert.equal(await placeholder.locator(".log-edit-btn").innerText(), "Add Reflection");
    assert.match(await placeholder.innerText(), /Haven/);
    assert.doesNotMatch(await placeholder.innerText(), /undefined|null/);
    await placeholder.locator(".log-edit-btn").click();
    assert.equal(await page.locator("#logMap").inputValue(), "Haven");
    assert.equal(await page.locator("#logAgentDisplay").getAttribute("data-agent"), "Sova");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    assert.equal(overflow, false);
    assert.deepEqual(consoleErrors, []);
    console.log("Log isolation browser check passed: mobile placeholder renders, opens for editing, and has no overflow/errors.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
