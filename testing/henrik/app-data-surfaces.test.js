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
  let response;
  let payload = {};
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(`${apiBaseUrl}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    payload = await response.json().catch(() => ({}));
    if (response.ok || ![429, 502, 503, 504].includes(response.status)) break;
    await new Promise(resolve => setTimeout(resolve, 750 * (attempt + 1)));
  }
  assert.equal(response?.ok, true, `${route} failed: ${payload.error || response?.status}`);
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

  const [liveMmrPayload, storedMmrPayload] = await Promise.all([
    postJson("/api/henrik/mmr-history-live", { puuid, region: "na" }),
    postJson("/api/henrik/mmr-history", { puuid, region: "na", size: 100, page: 1 })
  ]);
  const mmrHistory = globalThis.RankedCoachRiotSync.mergeMmrHistories(storedMmrPayload, liveMmrPayload);
  const mmrByMatchId = new Map(mmrHistory.map(snapshot => [snapshot.match_id, snapshot]));
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

function getLatestMeaningfulRankLabel(matches = []) {
  const ranked = matches
    .slice()
    .sort((left, right) => new Date(right?.createdAt || right?.metadata?.playedAt || 0).getTime() - new Date(left?.createdAt || left?.metadata?.playedAt || 0).getTime())
    .find(match => {
      const label = String(match?.rank || match?.metadata?.rank || "").trim();
      return label && !/^unrated$/i.test(label);
    });
  return String(ranked?.rank || ranked?.metadata?.rank || "Unrated").trim() || "Unrated";
}

async function run() {
  loadBrowserScript("public/schema/match-record.js");
  loadBrowserScript("public/analytics/round-metrics.js");
  loadBrowserScript("public/integrations/riot-sync.js");
  loadBrowserScript("public/data/persistence-policy.js");
  const matches = await loadRetainedProfileMatches();
  const acts = [...new Set(matches.map(match => match.act).filter(Boolean))];
  const allRoundMetrics = globalThis.RankedCoachRoundMetrics.aggregateMatchRoundMetrics(matches);
  const expectedCurrentRankLabel = getLatestMeaningfulRankLabel(matches);

  // This is a live retained-history smoke test. The account can add matches over
  // time, so assert the known floor plus internal consistency instead of pinning
  // to one historic snapshot forever.
  assert.ok(matches.length >= 86, `expected at least the retained baseline, got ${matches.length}`);
  assert.ok(acts.length >= 8, `expected retained matches across at least 8 acts, got ${acts.length}`);
  assert.equal(allRoundMetrics.matches, matches.length);
  assert.ok(allRoundMetrics.totalRounds >= 1796, `expected retained rounds to meet baseline, got ${allRoundMetrics.totalRounds}`);
  assert.ok(allRoundMetrics.kills2K >= 247, `expected 2K count to meet baseline, got ${allRoundMetrics.kills2K}`);
  assert.ok(allRoundMetrics.kills3K >= 64, `expected 3K count to meet baseline, got ${allRoundMetrics.kills3K}`);
  assert.ok(allRoundMetrics.kills4K >= 11, `expected 4K count to meet baseline, got ${allRoundMetrics.kills4K}`);
  assert.equal(allRoundMetrics.clutchDefinition, "1vX multi-kill");
  assert.ok(allRoundMetrics.clutchRounds >= allRoundMetrics.clutchWins);
  assert.ok(allRoundMetrics.clutchRounds <= 138, "Verified 1vX opportunities cannot exceed the old ceremony-based count");
  assert.ok(allRoundMetrics.tradeReceivedRate > 0);
  assert.ok(allRoundMetrics.tradeGivenRate > 0);
  assert.ok(allRoundMetrics.damage.standardDeviation > 0);
  acts.forEach(act => {
    const actMatches = matches.filter(match => match.act === act);
    assert.equal(globalThis.RankedCoachRoundMetrics.aggregateMatchRoundMetrics(actMatches).matches, actMatches.length);
  });

  const buildSurfaceProfile = id => ({
    id,
    name: "GoopyWetDiaper",
    puuid,
    importSource: "henrik",
    lastSyncSource: "henrik",
    lastSyncAt: new Date().toISOString(),
    startingRR: 99999,
    trackerAnalytics: { currentAct: "Episode 10 Act 6", acts: ["Episode 10 Act 6", "Episode 11 Act 3"] },
    matches
  });
  const compactedProfiles = globalThis.RankedCoachPersistencePolicy.compactProfilesForLocalCache([
    buildSurfaceProfile("live-retained-profile")
  ], 1);
  const serializedBytes = Buffer.byteLength(JSON.stringify(compactedProfiles));
  assert.ok(serializedBytes < 5 * 1024 * 1024, `Compacted retained profile payload is too large: ${serializedBytes} bytes`);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const consoleIssues = [];
  page.on("console", message => {
    if (message.type() === "error") consoleIssues.push(message.text());
  });
  page.on("pageerror", error => consoleIssues.push(error.message));

  const desktopProfiles = globalThis.RankedCoachPersistencePolicy.compactProfilesForLocalCache([
    buildSurfaceProfile("henrik-full-surface-test")
  ], 1);
  const mobileProfiles = globalThis.RankedCoachPersistencePolicy.compactProfilesForLocalCache([
    buildSurfaceProfile("henrik-full-mobile-test")
  ], 1);

  await page.addInitScript(({ profiles }) => {
    const profileId = "henrik-full-surface-test";
    localStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", profileId);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify(profiles));
  }, { profiles: desktopProfiles });

  try {
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);

    if (await page.locator("#dailyWarmupModal.active").count()) {
      await page.locator("#dailyWarmupSkip").click();
      await page.waitForTimeout(250);
    }

    assert.equal(await page.locator("#navCurrentTierText").innerText(), expectedCurrentRankLabel);
    assert.equal(await page.locator("#profileRankIcon").getAttribute("alt"), expectedCurrentRankLabel);

    await page.click('.nav-btn[data-page="stats"]');
    await page.waitForTimeout(500);
    const seasonOptions = await page.locator("#statsActSelector option").allTextContents();
    assert.deepEqual(seasonOptions.slice().sort(), acts.slice().sort());
    assert.ok(seasonOptions.includes("Season 2026 Act 3"));
    assert.ok(seasonOptions.includes("Season 2025 Act 2"));
    assert.ok(seasonOptions.includes("Episode 8 Act 3"));
    assert.equal(seasonOptions.some(label => /Episode 1[01]/.test(label)), false);
    assert.match(await page.locator("#statsHistoryBoundaryNote").innerText(), /May 28, 2024/);

    await page.selectOption("#statsActSelector", { label: "Season 2025 Act 6" }, { force: true });
    await page.waitForTimeout(600);
    const statsDebug = await page.evaluate(() => ({
      selectedAct: document.getElementById("statsActSelector")?.value,
      overview: ["statKD", "statWinrate", "statADR", "statHS"].map(id => document.getElementById(id)?.textContent || ""),
      agentRows: document.querySelectorAll("#statsAgentsList .stats-agent-mini-card").length,
      activeAgentRows: document.querySelectorAll("#statsAgentsList .stats-agent-mini-card:not([disabled])").length,
      activeAgents: [...document.querySelectorAll("#statsAgentsList .stats-agent-mini-card:not([disabled])")].map(card => card.textContent.trim()),
      activeMaps: [...document.querySelectorAll("#statsMapsList .stats-map-card:not([disabled])")].map(card => card.textContent.trim()),
      agentsText: document.getElementById("statsAgentsList")?.innerText || "",
      mapsText: document.getElementById("statsMapsList")?.innerText || ""
    }));
    assert.notEqual(await page.locator("#statsPeakRankText").innerText(), "--");
    assert.ok(statsDebug.activeAgentRows > 0, JSON.stringify(statsDebug));
    assert.ok(await page.locator("#statsMapsList .stats-map-card:not([disabled])").count() > 0);
    assert.ok(await page.locator("#statsWeaponsList button:not([disabled])").count() > 0);

    const season2025Act5Value = await page.locator('#statsActSelector option', { hasText: "Season 2025 Act 5" }).evaluate(option => option.value);
    await page.selectOption("#statsActSelector", season2025Act5Value, { force: true });
    await page.waitForTimeout(600);
    const comparisonStats = await page.evaluate(() => ({
      selectedAct: document.getElementById("statsActSelector")?.value,
      overview: ["statKD", "statWinrate", "statADR", "statHS"].map(id => document.getElementById(id)?.textContent || ""),
      activeAgents: [...document.querySelectorAll("#statsAgentsList .stats-agent-mini-card:not([disabled])")].map(card => card.textContent.trim()),
      activeMaps: [...document.querySelectorAll("#statsMapsList .stats-map-card:not([disabled])")].map(card => card.textContent.trim())
    }));
    assert.equal(comparisonStats.selectedAct, season2025Act5Value);
    assert.notDeepEqual(comparisonStats.overview, statsDebug.overview);
    assert.notDeepEqual(comparisonStats.activeAgents, statsDebug.activeAgents);
    assert.notDeepEqual(comparisonStats.activeMaps, statsDebug.activeMaps);
    await page.selectOption("#statsActSelector", { label: "Season 2025 Act 6" }, { force: true });
    await page.waitForTimeout(600);

    await page.click('.nav-btn[data-page="insights"]');
    await page.waitForTimeout(500);
    const insightText = await page.locator("#insightsList").innerText();
    assert.match(insightText, /Trade Support Split|Damage Consistency|Clutch Closing|Multi-Kill Impact/);
    assert.doesNotMatch(insightText, /No Match History Yet/);
    assert.ok(await page.locator("#insightsList [data-coaching-rule]").count() > 0, "No governed coaching rule reached the real-data insight pool.");

    await page.click('.nav-btn[data-page="home"]');
    await page.click('.graph-btn[data-size="all"]');
    await page.waitForTimeout(7000);
    assert.match(await page.locator("#rrChartDataStatus").innerText(), /retained matches.*(?:verified RR snapshots|rank snapshots)|retained matches include rank snapshots/i);
    assert.match(await page.locator("#rrChartDataStatus").innerText(), /without estimating missing RR gains or losses/i);
    assert.ok(await page.locator("#chartRow .segment").count() > 0);
    await page.click('.graph-btn[data-size="5"]');
    await page.waitForTimeout(1200);
    const recentHitCount = await page.locator(".rr-hit").count();
    if (recentHitCount > 0) {
      assert.notEqual(await page.locator(".rr-hit").last().getAttribute("data-rank-label"), "");
    } else {
      assert.match(await page.locator("#rrChartDataStatus").innerText(), /today|current session|No RR movement|retained matches.*(?:RR|rank) snapshots?|rank snapshot/i);
    }
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
    await mobileContext.addInitScript(({ profiles }) => {
      if (!/^https?:$/.test(location.protocol)) return;
      const profileId = "henrik-full-mobile-test";
      localStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profileId);
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      localStorage.setItem(`valtracker_daily_warmup_prompt_v1:${profileId}`, dateKey);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify(profiles));
    }, { profiles: mobileProfiles });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await mobilePage.waitForTimeout(1400);
    assert.equal(await mobilePage.locator("#navCurrentTierText").innerText(), expectedCurrentRankLabel);
    assert.equal(await mobilePage.locator("#mobileHeaderProfileBtn .mobile-header-rank-icon").getAttribute("alt"), expectedCurrentRankLabel);
    const avatarRect = await mobilePage.locator("#mobileHeaderProfileBtn .mobile-header-avatar-img").boundingBox();
    const rankRect = await mobilePage.locator("#mobileHeaderProfileBtn .mobile-header-rank-icon").boundingBox();
    assert.ok(rankRect.x > avatarRect.x + (avatarRect.width / 2));
    assert.ok(rankRect.y > avatarRect.y + (avatarRect.height / 2));

    if (await mobilePage.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
      await mobilePage.click("#dailyWarmupSkip");
      await mobilePage.locator("#dailyWarmupModal.active").waitFor({ state: "hidden" });
    }
    await mobilePage.click('[data-mobile-page="stats"]');
    await mobilePage.click("#statsActMobileTrigger");
    await mobilePage.click('[data-stats-act-option="Season 2025 Act 6"]');
    await mobilePage.waitForTimeout(600);
    assert.equal(await mobilePage.locator("#statsActSelector option").count(), acts.length);
    assert.match(await mobilePage.locator("#statsHistoryBoundaryNote").innerText(), /May 28, 2024/);
    assert.ok(await mobilePage.locator("#statsAgentsList .stats-agent-row.stats-select-card").count() > 0);
    assert.ok(await mobilePage.locator("#statsMapsList .stats-map-card:not([disabled])").count() > 0);
    assert.ok(await mobilePage.locator("#statsWeaponsList .stats-weapon-tile:not([disabled])").count() > 0);

    await mobilePage.click('[data-mobile-page="insights"]');
    await mobilePage.waitForTimeout(500);
    assert.match(await mobilePage.locator("#insightsList").textContent(), /Trade Support Split|Damage Consistency|Clutch Closing|Multi-Kill Impact/);
    assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), false);
    assert.deepEqual(mobileIssues, []);
    await mobileContext.close();

    const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await guestContext.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", "manual-empty-profile");
      const now = new Date();
      const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      localStorage.setItem("valtracker_daily_warmup_prompt_v1:manual-empty-profile", dateKey);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: "manual-empty-profile",
        name: "Manual Empty Profile",
        importSource: "manual",
        matches: []
      }]));
    });
    const guestPage = await guestContext.newPage();
    await guestPage.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await guestPage.waitForTimeout(700);
    await guestPage.waitForFunction(() => document.getElementById("loginInitOverlay")?.getAttribute("aria-hidden") === "true", null, { timeout: 15000 });
    await guestPage.click('[data-mobile-page="stats"]');
    assert.equal(await guestPage.locator("#statsHistoryBoundaryNote").isHidden(), true);
    await guestPage.click('[data-mobile-page="insights"]');
    assert.ok(await guestPage.locator("#insightsList .insight-card").count() > 0);
    await guestContext.close();

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
