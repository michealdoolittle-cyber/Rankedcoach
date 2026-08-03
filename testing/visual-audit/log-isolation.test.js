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
    const playedAt = new Date().toISOString();
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
      lastWarmupPromptDate: todayKey,
      matches: [{
        id: "match-1",
        matchId: "match-1",
        source: "henrik_sync",
        act: "Episode 11 Act 3",
        createdAt: playedAt,
        rr: null,
        verifiedRrDelta: 18,
        rrTotal: 50,
        rrVerified: true,
        rank: "Diamond 2",
        result: "win",
        agent: "Sova",
        map: "Haven",
        metadata: { matchId: "match-1", source: "henrik_sync", act: "Episode 11 Act 3", agent: "Sova", mapName: "Haven", result: "win", rrVerified: true }
      }, {
        id: "match-2",
        matchId: "match-2",
        source: "henrik_sync",
        act: "Episode 11 Act 3",
        createdAt: new Date(Date.now() - 60000).toISOString(),
        rr: null,
        verifiedRrDelta: null,
        rrTotal: null,
        rrVerified: false,
        rank: "Diamond 2",
        result: "loss",
        agent: "Jett",
        map: "Bind",
        metadata: { matchId: "match-2", source: "henrik_sync", act: "Episode 11 Act 3", agent: "Jett", mapName: "Bind", result: "loss", rrVerified: false }
      }]
    }]));
    localStorage.setItem("valtracker_log_entries_v2:guest", JSON.stringify([{
      id: "ranked-match-log:profile-log-test:match-1",
      matchId: "match-1",
      profileId,
      source: "henrik-match-placeholder",
      isMatchPlaceholder: true,
      isPlayerAuthored: false,
      createdAt: playedAt,
      result: "win",
      rr: 18,
      agent: "Sova",
      role: "Initiator",
      map: "Haven",
      notes: ""
    }, {
      id: "ranked-match-log:profile-log-test:match-2",
      matchId: "match-2",
      profileId,
      source: "henrik-match-placeholder",
      isMatchPlaceholder: true,
      isPlayerAuthored: false,
      createdAt: new Date(Date.now() - 60000).toISOString(),
      result: "loss",
      rr: null,
      agent: "Jett",
      role: "Duelist",
      map: "Bind",
      notes: ""
    }]));
  });

  try {
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(900);
    await page.click("#dailyWarmupSkip").catch(() => {});
    await page.evaluate(() => {
      ["authModal", "loginInitOverlay", "dailyWarmupModal"].forEach(id => {
        const element = document.getElementById(id);
        if (!element) return;
        element.classList.remove("active", "is-opening");
        element.setAttribute("aria-hidden", "true");
        element.hidden = true;
        element.style.display = "none";
        element.style.pointerEvents = "none";
      });
      document.body.classList.remove("modal-open", "is-modal-open", "has-active-modal", "mobile-modal-open", "daily-entrance-motion-active");
    });
    await page.click('[data-mobile-page="logging"]');
    await page.waitForFunction(() => document.getElementById("page-logging")?.classList.contains("is-current-page"));
    const debriefMeta = await page.locator("#loggingLiveMeta").innerText();
    assert.equal(debriefMeta, "Add a rating, mood, or map to see it here.");
    assert.doesNotMatch(debriefMeta, /null|â|Ã/);
    await page.click('[data-mobile-logging-view="feed"]');
    const placeholder = page.locator(".log-entry-placeholder").first();
    await placeholder.waitFor({ state: "visible" });
    const unverifiedRr = page.locator(".log-result-rr-unverified");
    assert.equal(await unverifiedRr.count(), 1);
    assert.equal(await unverifiedRr.innerText(), "RR unverified");
    assert.ok(await unverifiedRr.evaluate(element => element.classList.contains("log-result-rr-neutral")));
    assert.match(await placeholder.innerText(), /Add your reflection for this ranked match\./);
    assert.equal(await placeholder.locator(".log-edit-btn").innerText(), "Add Reflection");
    assert.match(await placeholder.innerText(), /Haven/);
    assert.doesNotMatch(await placeholder.innerText(), /undefined|null/);
    await placeholder.locator(".log-edit-btn").click();
    assert.equal(await page.locator("#logMap").inputValue(), "Haven");
    assert.equal(await page.locator("#logAgentDisplay").getAttribute("data-agent"), "Sova");
    await page.click('[data-mobile-page="home"]');
    await page.waitForFunction(() => document.getElementById("page-home")?.classList.contains("active"));
    await page.click('.graph-btn[data-size="5"]');
    await page.waitForFunction(() => document.getElementById("rrChartDataStatus")?.textContent?.includes("verified RR snapshots"));
    assert.match(await page.locator("#rrChartDataStatus").innerText(), /1 of 2 retained matches have verified RR snapshots/);
    assert.equal(await page.locator(".rr-hit").last().getAttribute("data-rank-rr"), "50");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    assert.equal(overflow, false);
    assert.deepEqual(consoleErrors, []);
    console.log("Log isolation browser check passed: verified and unverified RR states render honestly with no overflow/errors.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
