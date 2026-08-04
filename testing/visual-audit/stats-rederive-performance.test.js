"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41833;
const puuid = "perf-test-puuid";
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
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath.startsWith("/api/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {}, data: [] }));
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
        response.writeHead(200, { "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function makeRawPayload(id, index) {
  const started = new Date(Date.UTC(2026, 7, 3, 16, index % 60, 0)).toISOString();
  return {
    data: {
      metadata: {
        match_id: id,
        started_at: started,
        season: { id: "season-2026-act-4", short: "E11A4" },
        map: { name: index % 2 ? "Lotus" : "Haven" },
        queue: { id: "competitive", name: "Competitive", mode_type: "Standard" }
      },
      players: [{
        puuid,
        team_id: "Blue",
        agent: { name: index % 2 ? "Sova" : "Skye", id: "initiator-agent-id" },
        tier: { id: 18, name: "Platinum 3" },
        stats: {
          kills: 12 + (index % 9),
          deaths: 8 + (index % 7),
          assists: 4,
          score: 4200,
          damage: { dealt: 2600 },
          headshots: 5,
          bodyshots: 14,
          legshots: 1
        },
        behavior: {}
      }],
      teams: [
        { team_id: "Blue", won: index % 3 !== 0, rounds: { won: index % 3 !== 0 ? 13 : 9, lost: index % 3 !== 0 ? 9 : 13 } },
        { team_id: "Red", won: index % 3 === 0, rounds: { won: index % 3 === 0 ? 13 : 9, lost: index % 3 === 0 ? 9 : 13 } }
      ],
      rounds: [{
        id: 0,
        winning_team: "Blue",
        stats: [{
          player: { puuid },
          economy: { weapon: { id: "vandal", name: "Vandal", type: "Rifle" }, loadout_value: 3900 },
          stats: { score: 200 },
          damage_events: [{ damage: 120 }],
          ability_casts: {}
        }]
      }],
      kills: []
    }
  };
}

function makeCurrentMatch(index) {
  const id = `perf-current-${index}`;
  const rawHenrikPayload = makeRawPayload(id, index);
  const playedAt = rawHenrikPayload.data.metadata.started_at;
  const result = index % 3 !== 0 ? "win" : "loss";
  const kills = 12 + (index % 9);
  const deaths = 8 + (index % 7);
  const hsPercent = 25;
  return {
    id,
    matchId: id,
    source: "henrik_sync",
    createdAt: playedAt,
    playedAt,
    season: "season-2026-act-4",
    act: "Season 2026 Act 4",
    agent: index % 2 ? "Sova" : "Skye",
    role: "Initiator",
    map: index % 2 ? "Lotus" : "Haven",
    result,
    kills,
    deaths,
    assists: 4,
    acs: 190 + (index % 60),
    adr: 130 + (index % 45),
    hsPercent,
    queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
    storedRawRehydrateVersion: 2,
    storedRawRehydrateCheckedAt: "2026-08-03T00:00:00.000Z",
    metadata: {
      matchId: id,
      source: "henrik_sync",
      playedAt,
      season: "season-2026-act-4",
      act: "Season 2026 Act 4",
      agent: index % 2 ? "Sova" : "Skye",
      mapName: index % 2 ? "Lotus" : "Haven",
      result,
      queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
      storedRawRehydrateVersion: 2,
      storedRawRehydrateCheckedAt: "2026-08-03T00:00:00.000Z"
    },
    matchRecord: {
      schemaVersion: 3,
      id,
      source: "henrik_sync",
      playedAt,
      createdAt: playedAt,
      season: "season-2026-act-4",
      act: "Season 2026 Act 4",
      agent: index % 2 ? "Sova" : "Skye",
      role: "Initiator",
      map: index % 2 ? "Lotus" : "Haven",
      result,
      queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
      stats: { kills, deaths, assists: 4, acs: 190 + (index % 60), adr: 130 + (index % 45), hsPercent },
      trackedPlayer: { puuid, teamId: "Blue", competitiveTier: 18 },
      roundByRound: [],
      rank: { rank: "Platinum 3", rr: 50, rrDelta: result === "win" ? 16 : -15, verified: true },
      rawHenrikPayload,
      rawPayloadComplete: true,
      storedRawRehydrateVersion: 2,
      storedRawRehydrateCheckedAt: "2026-08-03T00:00:00.000Z",
      importMeta: { storedRawRehydrateVersion: 2, storedRawRehydrateCheckedAt: "2026-08-03T00:00:00.000Z" }
    }
  };
}

function makeStaleMatch() {
  const id = "perf-stale-needs-rederive";
  const rawHenrikPayload = makeRawPayload(id, 999);
  return {
    ...makeCurrentMatch(999),
    id,
    matchId: id,
    hsPercent: null,
    queue: {},
    storedRawRehydrateVersion: 0,
    storedRawRehydrateCheckedAt: "",
    metadata: {
      matchId: id,
      source: "henrik_sync",
      playedAt: rawHenrikPayload.data.metadata.started_at,
      season: "season-2026-act-4",
      act: "Season 2026 Act 4",
      agent: "Sova",
      mapName: "Lotus",
      result: "win",
      storedRawRehydrateVersion: 0,
      storedRawRehydrateCheckedAt: ""
    },
    matchRecord: {
      ...makeCurrentMatch(999).matchRecord,
      id,
      stats: { ...makeCurrentMatch(999).matchRecord.stats, hsPercent: null },
      queue: { id: null, name: null, modeType: null },
      rawHenrikPayload,
      storedRawRehydrateVersion: 0,
      storedRawRehydrateCheckedAt: "",
      importMeta: {}
    }
  };
}

function buildLargeProfile() {
  const matches = Array.from({ length: 420 }, (_item, index) => makeCurrentMatch(index));
  matches.push(makeStaleMatch());
  return {
    id: "stats-rederive-perf",
    name: "Stats Rehydrate Perf",
    accountName: "Stats Rehydrate Perf",
    riotId: "",
    puuid,
    region: "NA",
    importSource: "henrik",
    lastSyncSource: "henrik",
    storedRawRehydrateVersion: 0,
    trackerAnalytics: {
      currentAct: "Season 2026 Act 4",
      acts: ["Season 2026 Act 4"]
    },
    matches
  };
}

function seedLargeProfile(profile) {
  window.__rankedCoachEnablePerfTestHooks = true;
  window.__rankedCoachRawRehydrateEvents = [];
  window.__rankedCoachRawRehydrateProbe = payload => window.__rankedCoachRawRehydrateEvents.push(payload);
  localStorage.clear();
  sessionStorage.clear();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", "stats-rederive-perf");
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
}

async function dismissBlockingOverlays(page) {
  await page.evaluate(() => {
    for (const id of ["authModal", "loginInitOverlay", "dailyWarmupModal"]) {
      const modal = document.getElementById(id);
      if (!modal) continue;
      modal.classList.remove("active", "is-opening", "is-closing");
      modal.setAttribute("aria-hidden", "true");
      if (id !== "loginInitOverlay") modal.hidden = true;
    }
    document.documentElement.classList.remove("app-booting");
    document.body?.classList.remove("modal-open", "app-loading-active", "daily-warmup-open");
  });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  const issues = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error" && !/Failed to load resource: net::ERR_(?:CONNECTION_CLOSED|ABORTED)/i.test(message.text())) {
        issues.push(`[console] ${message.text()}`);
      }
    });
    await page.addInitScript(seedLargeProfile, buildLargeProfile());
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await dismissBlockingOverlays(page);
    const startupEvents = await page.evaluate(() => window.__rankedCoachRawRehydrateEvents.slice());
    assert.equal(
      startupEvents.filter(event => event.phase === "complete").length,
      1,
      `Profile-load migration should catch the single stale record before Stats reads it: ${JSON.stringify(startupEvents)}`
    );
    await page.evaluate(() => { window.__rankedCoachRawRehydrateEvents = []; });
    await page.evaluate(() => window.RankedCoachStatsPipelinePerf?.resetCounters?.());

    const firstStatsOpenMs = await page.evaluate(async () => {
      const start = performance.now();
      document.querySelector('.nav-btn[data-page="stats"]')?.click();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return performance.now() - start;
    });
    await page.waitForSelector("#statsRoleProgressRow .stats-role-pill", { timeout: 15000 });
    const firstStatsCounters = await page.evaluate(() => window.RankedCoachStatsPipelinePerf?.snapshot?.() || {});

    for (let i = 0; i < 3; i += 1) {
      await dismissBlockingOverlays(page);
      await page.click('.nav-btn[data-page="home"]');
      await page.waitForTimeout(80);
      await dismissBlockingOverlays(page);
      await page.click('.nav-btn[data-page="stats"]');
      await page.waitForSelector("#statsRoleProgressRow .stats-role-pill", { timeout: 15000 });
    }

    const renderPathEvents = await page.evaluate(() => window.__rankedCoachRawRehydrateEvents.slice());
    const repeatedStatsCounters = await page.evaluate(() => window.RankedCoachStatsPipelinePerf?.snapshot?.() || {});
    assert.equal(renderPathEvents.length, 0, `Stats render path must not rederive stored raw payloads: ${JSON.stringify(renderPathEvents)}`);
    assert.ok(firstStatsOpenMs < 1800, `Stats page should open quickly against a 421-match profile, saw ${firstStatsOpenMs.toFixed(1)}ms`);
    assert.ok(
      repeatedStatsCounters.playerModelComputes <= firstStatsCounters.playerModelComputes + 1,
      `Repeated Stats opens should reuse the memoized player model: ${JSON.stringify({ firstStatsCounters, repeatedStatsCounters })}`
    );
    assert.ok(
      repeatedStatsCounters.scopedComputes <= firstStatsCounters.scopedComputes + 1,
      `Repeated Stats opens should reuse scoped stats data: ${JSON.stringify({ firstStatsCounters, repeatedStatsCounters })}`
    );

    const explicitResult = await page.evaluate(() => {
      window.__rankedCoachRawRehydrateEvents = [];
      window.__rankedCoachExplicitProgress = [];
      return window.RankedCoachPerfTestHooks.prepareActiveProfileStoredRawRehydrate({
        onProgress: progress => window.__rankedCoachExplicitProgress.push(progress)
      });
    });
    const explicitEvents = await page.evaluate(() => window.__rankedCoachRawRehydrateEvents.slice());
    const explicitProgress = await page.evaluate(() => window.__rankedCoachExplicitProgress.slice());
    assert.equal(
      explicitResult.rederived,
      0,
      `Explicit migration should no-op after the profile-load migration has completed: ${JSON.stringify({
        rederived: explicitResult.rederived,
        changed: explicitResult.changed,
        checked: explicitResult.checked,
        matchCount: explicitResult.matches?.length,
        progress: explicitProgress
      })}`
    );
    assert.equal(explicitEvents.filter(event => event.phase === "complete").length, 0, JSON.stringify(explicitEvents));
    assert.deepEqual(explicitProgress, []);
    assert.equal(await page.evaluate(() => window.RankedCoachPerfTestHooks.getActiveProfileStoredRawVersion()), 2);

    await page.evaluate(() => { window.__rankedCoachRawRehydrateEvents = []; });
    await dismissBlockingOverlays(page);
    await page.click('.nav-btn[data-page="home"]');
    await page.waitForTimeout(80);
    await dismissBlockingOverlays(page);
    await page.click('.nav-btn[data-page="stats"]');
    await page.waitForSelector("#statsRoleProgressRow .stats-role-pill", { timeout: 15000 });
    assert.equal(await page.evaluate(() => window.__rankedCoachRawRehydrateEvents.length), 0, "Stats should stay read-only after explicit migration too");

    const versionInvalidation = await page.evaluate(() => {
      const profile = window.RankedCoachPerfTestHooks.getActiveProfileForStoredRawTest();
      profile.storedRawRehydrateVersion = 1;
      return window.RankedCoachPerfTestHooks.prepareActiveProfileStoredRawRehydrate();
    });
    assert.equal(versionInvalidation.skipped, false, "A raw-rehydrate version bump must invalidate the profile confirmation cache.");
    assert.equal(await page.evaluate(() => window.RankedCoachPerfTestHooks.getActiveProfileStoredRawVersion()), 2);

    const missingPayloadResult = await page.evaluate(() => {
      const profile = window.RankedCoachPerfTestHooks.getActiveProfileForStoredRawTest();
      const copied = JSON.parse(JSON.stringify(profile.matches[0]));
      copied.id = "perf-missing-stored-payload";
      copied.matchId = copied.id;
      copied.metadata.matchId = copied.id;
      copied.matchRecord.id = copied.id;
      copied.matchRecord.legacyMatchId = copied.id;
      delete copied.matchRecord.rawHenrikPayload;
      copied.matchRecord.rawPayloadComplete = false;
      copied.matchRecord.storedRawRehydrateVersion = 0;
      copied.matchRecord.importMeta = {};
      profile.matches.push(copied);
      return window.RankedCoachPerfTestHooks.prepareActiveProfileStoredRawRehydrate();
    });
    assert.equal(missingPayloadResult.fetchMatchIds.includes("perf-missing-stored-payload"), true,
      `Records without a stored raw payload must be routed to Henrik backfill: ${JSON.stringify(missingPayloadResult)}`);
    assert.notEqual(await page.evaluate(() => window.RankedCoachPerfTestHooks.getActiveProfileStoredRawVersion()), 2,
      "A profile with a missing raw payload must not be stamped as fully rehydrated.");

    const boundedBackfill = await page.evaluate(() => {
      const profile = window.RankedCoachPerfTestHooks.getActiveProfileForStoredRawTest();
      const template = JSON.parse(JSON.stringify(profile.matches[1]));
      profile.matches = Array.from({ length: 200 }, (_item, index) => {
        const id = `hs-backfill-${String(index).padStart(3, "0")}`;
        const match = JSON.parse(JSON.stringify(template));
        match.id = id;
        match.matchId = id;
        match.hsPercent = null;
        match.metadata.matchId = id;
        match.matchRecord.id = id;
        match.matchRecord.legacyMatchId = id;
        match.matchRecord.stats.hsPercent = null;
        match.matchRecord.importMeta = {};
        return match;
      });
      profile.matchBackfillScanVersion = 0;
      profile.matchBackfillScanMatchCount = 0;
      profile.matchBackfillScanCompleteAt = "";
      profile.matchBackfillRefreshCursor = 0;
      const first = window.RankedCoachPerfTestHooks.buildActiveProfileMatchRefreshPlan({ limit: 16 });
      const second = window.RankedCoachPerfTestHooks.buildActiveProfileMatchRefreshPlan({ limit: 16 });
      const firstBatchSet = new Set(first.refreshMatchIds);
      const nextExpectedId = first.candidateIds[16];
      profile.matches.forEach(match => {
        match.hsPercent = 25;
        match.matchRecord.stats.hsPercent = 25;
      });
      const completed = window.RankedCoachPerfTestHooks.prepareActiveProfileMatchBackfillScan();
      const skipped = window.RankedCoachPerfTestHooks.prepareActiveProfileMatchBackfillScan();
      profile.matchBackfillScanVersion = 0;
      const versionInvalidated = window.RankedCoachPerfTestHooks.prepareActiveProfileMatchBackfillScan();
      const added = JSON.parse(JSON.stringify(profile.matches[0]));
      added.id = "hs-backfill-newly-added";
      added.matchId = added.id;
      added.metadata.matchId = added.id;
      added.matchRecord.id = added.id;
      added.matchRecord.legacyMatchId = added.id;
      profile.matches.push(added);
      const countInvalidated = window.RankedCoachPerfTestHooks.prepareActiveProfileMatchBackfillScan();
      const completePlan = window.RankedCoachPerfTestHooks.buildActiveProfileMatchRefreshPlan({ limit: 16 });
      return {
        first,
        second,
        overlap: second.refreshMatchIds.filter(id => firstBatchSet.has(id)),
        nextExpectedId,
        completed,
        skipped,
        versionInvalidated,
        countInvalidated,
        completePlan
      };
    });
    assert.equal(boundedBackfill.first.inspection.hsMatchIds.length, 200, JSON.stringify(boundedBackfill.first));
    assert.equal(boundedBackfill.first.refreshMatchIds.length, 16, JSON.stringify(boundedBackfill.first));
    assert.equal(boundedBackfill.second.refreshMatchIds.length, 16, JSON.stringify(boundedBackfill.second));
    assert.deepEqual(boundedBackfill.overlap, [], `A capped backfill must rotate instead of repeating the same batch: ${JSON.stringify(boundedBackfill)}`);
    assert.equal(boundedBackfill.second.refreshMatchIds.includes(boundedBackfill.nextExpectedId), true,
      `The first match excluded by the cap must be selected on the next sync: ${JSON.stringify(boundedBackfill)}`);
    assert.equal(boundedBackfill.completed.checked, 200, JSON.stringify(boundedBackfill.completed));
    assert.equal(boundedBackfill.completed.needsBackfill, false, JSON.stringify(boundedBackfill.completed));
    assert.equal(boundedBackfill.skipped.skipped, true, JSON.stringify(boundedBackfill.skipped));
    assert.equal(boundedBackfill.skipped.checked, 0, JSON.stringify(boundedBackfill.skipped));
    assert.equal(boundedBackfill.versionInvalidated.skipped, false, JSON.stringify(boundedBackfill.versionInvalidated));
    assert.equal(boundedBackfill.versionInvalidated.checked, 200, JSON.stringify(boundedBackfill.versionInvalidated));
    assert.equal(boundedBackfill.countInvalidated.skipped, false, JSON.stringify(boundedBackfill.countInvalidated));
    assert.equal(boundedBackfill.countInvalidated.checked, 201, JSON.stringify(boundedBackfill.countInvalidated));
    assert.deepEqual(boundedBackfill.completePlan.refreshMatchIds, [], JSON.stringify(boundedBackfill.completePlan));
    assert.deepEqual(issues, []);

    console.log(`Stats rederive performance passed: profile load rehydrated 1 stale record, repeated Stats opens did 0 raw rehydrates, first open ${firstStatsOpenMs.toFixed(1)}ms, repeat migration no-opped, no-payload records were routed to Henrik backfill, and the combined refresh queue capped/rotated 200 HS backfills.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
