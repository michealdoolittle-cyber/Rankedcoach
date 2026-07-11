"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const vm = require("node:vm");
const { chromium } = require("../visual-audit/node_modules/playwright");

const repoRoot = path.resolve(__dirname, "..", "..");
const publicRoot = path.join(repoRoot, "public");
const apiBaseUrl = String(process.env.HENRIK_BASE_URL || "https://www.rankedcoach.gg").replace(/\/$/, "");
const puuid = "fdc507ce-cd41-5236-8962-fce4ac427e12";
const port = 41784;
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function loadBrowserScript(relativePath) {
  const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  vm.runInThisContext(source, { filename: relativePath });
}

async function postJson(route, body) {
  const response = await fetch(`${apiBaseUrl}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  assert.equal(response.ok, true, `${route} failed: ${payload.error || response.status}`);
  return payload;
}

async function loadRetainedProfileMatches() {
  const parsedMatches = [];
  for (let start = 0; start < 100; start += 10) {
    const payload = await postJson("/api/henrik/matches", { puuid, region: "na", count: 10, start });
    const page = Array.isArray(payload?.data) ? payload.data : [];
    parsedMatches.push(...page);
    if (page.length < 10) break;
  }

  const mmrPayload = await postJson("/api/henrik/mmr-history", { puuid, region: "na", size: 100, page: 1 });
  const mmrByMatchId = new Map((mmrPayload?.data || []).map(snapshot => [snapshot.match_id, snapshot]));
  return parsedMatches.map(match => {
    const record = globalThis.RankedCoachMatchRecord.fromHenrikV4Match(match, {
      puuid,
      mmrSnapshot: mmrByMatchId.get(match?.metadata?.match_id)
    });
    return globalThis.RankedCoachMatchRecord.toLegacyMatch(record);
  });
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath === "/") relativePath = "/index.html";
      const filePath = path.join(publicRoot, relativePath);
      if (!filePath.startsWith(publicRoot)) {
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
        response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  loadBrowserScript("public/schema/match-record.js");
  loadBrowserScript("public/analytics/round-metrics.js");
  const matches = await loadRetainedProfileMatches();
  const acts = [...new Set(matches.map(match => match.act).filter(Boolean))];
  const allRoundMetrics = globalThis.RankedCoachRoundMetrics.aggregateMatchRoundMetrics(matches);

  assert.equal(matches.length, 86);
  assert.equal(acts.length, 8);
  assert.equal(allRoundMetrics.matches, 86);
  assert.equal(allRoundMetrics.totalRounds, 1796);
  assert.equal(allRoundMetrics.kills2K, 247);
  assert.equal(allRoundMetrics.kills3K, 64);
  assert.equal(allRoundMetrics.kills4K, 11);
  assert.equal(allRoundMetrics.clutchRounds, 138);
  assert.ok(allRoundMetrics.tradeReceivedRate > 0);
  assert.ok(allRoundMetrics.tradeGivenRate > 0);
  assert.ok(allRoundMetrics.damage.standardDeviation > 0);
  acts.forEach(act => {
    const actMatches = matches.filter(match => match.act === act);
    assert.equal(globalThis.RankedCoachRoundMetrics.aggregateMatchRoundMetrics(actMatches).matches, actMatches.length);
  });

  const serializedBytes = Buffer.byteLength(JSON.stringify(matches));
  assert.ok(serializedBytes < 5 * 1024 * 1024, `Retained profile payload is too large: ${serializedBytes} bytes`);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleIssues = [];
  page.on("console", message => {
    if (message.type() === "error") consoleIssues.push(message.text());
  });
  page.on("pageerror", error => consoleIssues.push(error.message));

  await page.addInitScript(({ matches, puuid }) => {
    const profileId = "henrik-full-surface-test";
    localStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", profileId);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
      id: profileId,
      name: "GoopyWetDiaper",
      puuid,
      importSource: "henrik",
      lastSyncSource: "henrik",
      lastSyncAt: new Date().toISOString(),
      startingRR: 99999,
      matches
    }]));
  }, { matches, puuid });

  try {
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);

    assert.equal(await page.locator("#navCurrentTierText").innerText(), "Diamond 2");
    assert.equal(await page.locator("#profileRankIcon").getAttribute("alt"), "Diamond 2");

    await page.click('.nav-btn[data-page="stats"]');
    await page.waitForTimeout(500);
    const seasonOptions = await page.locator("#statsActSelector option").allTextContents();
    assert.deepEqual(seasonOptions, acts);
    assert.ok(seasonOptions.includes("Episode 11 Act 3"));
    assert.ok(seasonOptions.includes("Episode 8 Act 3"));

    await page.selectOption("#statsActSelector", { label: "Episode 10 Act 6" });
    await page.waitForTimeout(600);
    const statsDebug = await page.evaluate(() => ({
      selectedAct: document.getElementById("statsActSelector")?.value,
      agentRows: document.querySelectorAll("#statsAgentsList .stats-agent-mini-card").length,
      activeAgentRows: document.querySelectorAll("#statsAgentsList .stats-agent-mini-card:not([disabled])").length,
      agentsText: document.getElementById("statsAgentsList")?.innerText || "",
      mapsText: document.getElementById("statsMapsList")?.innerText || ""
    }));
    assert.notEqual(await page.locator("#statsPeakRankText").innerText(), "Radiant");
    assert.ok(statsDebug.activeAgentRows > 0, JSON.stringify(statsDebug));
    assert.ok(await page.locator("#statsMapsList .stats-map-card:not([disabled])").count() > 0);
    assert.ok(await page.locator("#statsWeaponsList button:not([disabled])").count() > 0);

    await page.click('.nav-btn[data-page="insights"]');
    await page.waitForTimeout(500);
    const insightText = await page.locator("#insightsList").innerText();
    assert.match(insightText, /Trade Support Split|Damage Consistency|Clutch Closing|Multi-Kill Impact/);
    assert.doesNotMatch(insightText, /No Match History Yet/);

    await page.click('.nav-btn[data-page="home"]');
    await page.click('.graph-btn[data-size="all"]');
    await page.waitForTimeout(7000);
    assert.match(await page.locator("#rrChartDataStatus").innerText(), /2 of 86 retained matches have verified RR snapshots/);
    assert.ok(await page.locator("#chartRow .segment").count() > 0);
    await page.click('.graph-btn[data-size="5"]');
    await page.waitForTimeout(1200);
    assert.match(await page.locator("#rrChartDataStatus").innerText(), /1 of 32 retained matches have verified RR snapshots/);
    assert.equal(await page.locator(".rr-hit").count(), 1);
    assert.equal(await page.locator(".rr-hit").last().getAttribute("data-rank-label"), "Diamond 2");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false);
    assert.deepEqual(consoleIssues, []);

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobileIssues = [];
    mobileContext.on("page", mobilePage => {
      mobilePage.on("console", message => {
        if (message.type() === "error") mobileIssues.push(message.text());
      });
      mobilePage.on("pageerror", error => mobileIssues.push(error.message));
    });
    await mobileContext.addInitScript(({ matches, puuid }) => {
      if (!/^https?:$/.test(location.protocol)) return;
      const profileId = "henrik-full-mobile-test";
      localStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profileId);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: profileId,
        name: "GoopyWetDiaper",
        puuid,
        importSource: "henrik",
        lastSyncSource: "henrik",
        lastSyncAt: new Date().toISOString(),
        startingRR: 99999,
        matches
      }]));
    }, { matches, puuid });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await mobilePage.waitForTimeout(1400);
    assert.equal(await mobilePage.locator("#navCurrentTierText").innerText(), "Diamond 2");
    assert.equal(await mobilePage.locator("#mobileHeaderProfileBtn .mobile-header-rank-icon").getAttribute("alt"), "Diamond 2");
    const avatarRect = await mobilePage.locator("#mobileHeaderProfileBtn .mobile-header-avatar-img").boundingBox();
    const rankRect = await mobilePage.locator("#mobileHeaderProfileBtn .mobile-header-rank-icon").boundingBox();
    assert.ok(rankRect.x > avatarRect.x + (avatarRect.width / 2));
    assert.ok(rankRect.y > avatarRect.y + (avatarRect.height / 2));

    await mobilePage.click('[data-mobile-page="stats"]');
    await mobilePage.click("#statsActMobileTrigger");
    await mobilePage.click('[data-stats-act-option="Episode 10 Act 6"]');
    await mobilePage.waitForTimeout(600);
    assert.equal(await mobilePage.locator("#statsActSelector option").count(), 8);
    assert.ok(await mobilePage.locator("#statsAgentsList .stats-agent-row.stats-select-card").count() > 0);
    assert.ok(await mobilePage.locator("#statsMapsList .stats-map-card:not([disabled])").count() > 0);
    assert.ok(await mobilePage.locator("#statsWeaponsList .stats-weapon-tile:not([disabled])").count() > 0);

    await mobilePage.click('[data-mobile-page="insights"]');
    await mobilePage.waitForTimeout(500);
    assert.match(await mobilePage.locator("#insightsList").textContent(), /Trade Support Split|Damage Consistency|Clutch Closing|Multi-Kill Impact/);
    assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false);
    assert.deepEqual(mobileIssues, []);
    await mobileContext.close();

    console.log(`Henrik app surface check passed: ${matches.length} matches, ${acts.length} acts, ${allRoundMetrics.totalRounds} rounds, desktop/mobile Stats/Insights/RR/rank all populated.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
