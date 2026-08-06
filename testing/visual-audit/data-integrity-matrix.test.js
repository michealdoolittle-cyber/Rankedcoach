"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const {
  CURRENT_ACT,
  TRACKED_PUUID,
  UNMAPPED_WEAPON_UUID,
  fixtureDefinitions,
  createProfileForFixture
} = require("../fixtures/data-integrity-fixtures");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41832;
const mimeTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath.startsWith("/api/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ data: [], items: [], matches: {}, videos: [] }));
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
        response.writeHead(200, {
          "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function seedProfile(profile) {
  localStorage.clear();
  sessionStorage.clear();
  const todayKey = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  })();
  localStorage.setItem("valtracker_entry_choice_v1", "guest");
  localStorage.setItem("valtracker_active_profile_id", profile.id);
  localStorage.setItem(`valtracker_daily_warmup_prompt_v1:${profile.id}`, todayKey);
  localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
}

function passFail(actual, expected) {
  if (expected instanceof RegExp) return expected.test(String(actual || ""));
  return Object.is(String(actual), String(expected));
}

function addMatrixResult(rows, { fixture, surface, fact, expected, actual }) {
  const pass = passFail(actual, expected);
  rows.push({
    fixture,
    surface,
    fact,
    expected: expected instanceof RegExp ? expected.toString() : expected,
    actual,
    result: pass ? "PASS" : "FAIL"
  });
  return pass;
}

async function openSeededPage(browser, fixture, issues) {
  const profile = createProfileForFixture(fixture);
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
  page.on("pageerror", error => issues.push(`[${fixture.id}] [pageerror] ${error.message}`));
  page.on("console", message => {
    const text = message.text();
    if (
      message.type() === "error"
      && !/Failed to load resource: net::ERR_(?:CONNECTION_CLOSED|ABORTED|CERT_AUTHORITY_INVALID)/i.test(text)
    ) {
      issues.push(`[${fixture.id}] [console] ${text}`);
    }
  });
  await page.addInitScript(seedProfile, profile);
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 20000 });
  if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
    await page.click("#dailyWarmupSkip");
  }
  await dismissFixtureBlockingModals(page);
  return page;
}

async function dismissFixtureBlockingModals(page) {
  await page.evaluate(() => {
    ["authModal", "loginInitOverlay", "dailyWarmupModal"].forEach(id => {
      const element = document.getElementById(id);
      if (!element) return;
      element.classList.remove("active");
      element.setAttribute("aria-hidden", "true");
    });
    document.body.classList.remove("modal-open", "is-modal-open");
  });
}

async function gotoStats(page) {
  await page.click('.nav-btn[data-page="stats"]');
  await page.waitForSelector("#statHS", { timeout: 15000 });
  await page.waitForSelector("#statsRoleProgressRow .stats-role-pill", { timeout: 15000 });
  await page.waitForTimeout(1500);
}

async function readStatsSurface(page) {
  return page.evaluate(() => {
    const roleProgress = {};
    document.querySelectorAll("#statsRoleProgressRow .stats-role-pill").forEach(pill => {
      const label = pill.querySelector(".stats-role-pill-label")?.textContent?.trim()?.toLowerCase() || "";
      roleProgress[label] = {
        games: pill.querySelector(".stats-role-pill-games strong")?.textContent?.trim() || "",
        winRate: pill.querySelector(".stats-role-pill-percent")?.textContent?.trim() || ""
      };
    });
    const agentCards = {};
    document.querySelectorAll("#statsAgentsList .stats-agent-mini-card").forEach(card => {
      const label = card.querySelector("strong")?.textContent?.trim()?.toLowerCase()
        || card.textContent?.trim()?.toLowerCase()
        || "";
      if (!label) return;
      agentCards[label] = {
        disabled: card.disabled === true,
        text: card.textContent?.replace(/\s+/g, " ").trim() || ""
      };
    });
    const mapCards = {};
    document.querySelectorAll("#statsMapsList .stats-map-card").forEach(card => {
      const label = card.querySelector(".stats-map-name, strong")?.textContent?.trim()?.toLowerCase()
        || card.textContent?.trim()?.toLowerCase()
        || "";
      if (!label) return;
      mapCards[label] = card.textContent?.replace(/\s+/g, " ").trim() || "";
    });
    return {
      summary: {
        kd: document.getElementById("statKD")?.textContent?.trim() || "",
        winRate: document.getElementById("statWinrate")?.textContent?.trim() || "",
        kast: document.getElementById("statKAST")?.textContent?.trim() || "",
        acs: document.getElementById("statACS")?.textContent?.trim() || "",
        matchesPlayed: document.getElementById("statMatchesPlayed")?.textContent?.trim() || "",
        hs: document.getElementById("statHS")?.textContent?.trim() || ""
      },
      roleProgress,
      agentCards,
      mapCards
    };
  });
}

async function readHomeChartSurface(page) {
  await page.click('.nav-btn[data-page="home"]');
  await page.waitForSelector("#chartRow", { timeout: 15000 });
  await page.waitForTimeout(250);
  return page.evaluate(() => ({
    hits: document.querySelectorAll("#chartRow .rr-hit").length,
    segments: document.querySelectorAll("#chartRow .segment").length,
    status: document.getElementById("rrChartDataStatus")?.textContent?.trim() || "",
    impact: document.querySelector("#impactScoreLabel strong")?.textContent?.trim() || ""
  }));
}

async function readLoggingFeedSurface(page) {
  await page.click('.nav-btn[data-page="logging"]');
  await page.waitForSelector("#logFeed", { timeout: 15000 });
  await page.waitForTimeout(250);
  return page.evaluate(() => ({
    trigger: document.getElementById("logCalendarTrigger")?.textContent?.trim() || "",
    label: document.querySelector("#page-logging .logging-session-label")?.textContent?.trim() || "",
    entries: document.querySelectorAll("#logFeed .log-entry").length,
    footnote: document.querySelector("#logFeed .log-feed-footnote")?.textContent?.replace(/\s+/g, " ").trim() || ""
  }));
}

async function openAndReadMatchSummary(page, fixture) {
  await dismissFixtureBlockingModals(page);
  const opened = await page.evaluate(match => {
    return globalThis.RankedCoachMatchSummary?.open?.(match, { source: "data-integrity-matrix" }) === true;
  }, fixture.primaryMatch);
  assert.equal(opened, true, `${fixture.id}: match summary should open`);
  await page.waitForSelector("#matchSummaryModal .match-summary-content", { timeout: 15000 });
  await page.waitForTimeout(150);

  const stats = await page.evaluate(() => {
    const readStat = key => document
      .querySelector(`#matchSummaryModal [data-match-summary-stat="${key}"] .timeline-pill-value`)
      ?.textContent?.trim() || "";
    const kast = document
      .querySelector('#matchSummaryModal [data-match-summary-stat="kast"] .timeline-pill-value')
      ?.textContent?.trim() || "";
    return {
      acs: readStat("acs"),
      hs: readStat("hs"),
      kast
    };
  });

  const authoritative = await page.evaluate(({ match, puuid }) => {
    const hasFiniteNumber = value => value !== null
      && value !== undefined
      && String(value).trim?.() !== ""
      && Number.isFinite(Number(value));
    const recordApi = globalThis.RankedCoachMatchRecord;
    const record = match?.matchRecord || match;
    const rederived = recordApi?.rederiveFromStoredRawHenrikPayload?.(record, { puuid }) || record;
    const canonical = recordApi?.emptyRecord?.(rederived) || rederived;
    const kast = globalThis.RankedCoachRoundMetrics?.computeMatchKast?.(canonical)?.overall?.percentage;
    return {
      hs: hasFiniteNumber(canonical?.stats?.hsPercent) ? `${Math.round(Number(canonical.stats.hsPercent))}%` : "--",
      acs: hasFiniteNumber(canonical?.stats?.acs) ? String(Math.round(Number(canonical.stats.acs))) : "--",
      queueId: String(canonical?.queue?.id || ""),
      kast: hasFiniteNumber(kast) ? `${Math.round(Number(kast))}%` : "--"
    };
  }, { match: fixture.primaryMatch, puuid: TRACKED_PUUID });

  await page.click('#matchSummaryModal [data-match-summary-tab="weapons"]');
  await page.waitForSelector('#matchSummaryModal [data-match-summary-panel="weapons"]:not([hidden])', { timeout: 5000 });
  const weapons = await page.evaluate(() => ({
    text: document.querySelector('#matchSummaryModal [data-match-summary-panel="weapons"]')?.textContent?.replace(/\s+/g, " ").trim() || "",
    rows: [...document.querySelectorAll("#matchSummaryModal .match-summary-weapon-row")].map(row => row.textContent?.replace(/\s+/g, " ").trim() || "")
  }));

  return { stats, authoritative, weapons };
}

async function readStoredProfile(page) {
  return page.evaluate(() => {
    const hasFiniteNumber = value => value !== null
      && value !== undefined
      && String(value).trim?.() !== ""
      && Number.isFinite(Number(value));
    const clean = value => String(value || "").trim().toLowerCase();
    const isDemoMatch = match => {
      const sources = [
        match?.source,
        match?.importSource,
        match?.lastSyncSource,
        match?.metadata?.source,
        match?.matchRecord?.source,
        match?.metadata?.demoAct,
        match?.matchRecord?.importMeta?.fixture && clean(match?.source).includes("demo") ? "demo" : ""
      ].map(clean).join(" ");
      return sources.includes("demo");
    };
    const getQueueInfo = match => {
      const record = match?.matchRecord || {};
      const metadata = match?.metadata || {};
      const recordQueue = record?.queue || {};
      const metadataQueue = metadata?.queue || {};
      const topQueue = match?.queue || {};
      return {
        id: clean(recordQueue?.id || record?.queueId || metadataQueue?.id || metadata?.queueId || topQueue?.id || match?.queueId || ""),
        name: clean(recordQueue?.name || record?.queueName || metadataQueue?.name || metadata?.queueName || topQueue?.name || match?.queueName || "")
      };
    };
    const isRankedPerformanceMatch = match => {
      if (isDemoMatch(match)) return false;
      const queue = getQueueInfo(match);
      if (!queue.id && !queue.name) return true;
      return queue.id === "competitive" || queue.id === "ranked" || queue.name === "competitive" || queue.name === "ranked";
    };
    const parseJson = raw => {
      try {
        return raw ? JSON.parse(raw) : [];
      } catch (_error) {
        return [];
      }
    };
    const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
    const profile = profiles[0] || {};
    const logEntries = Object.keys(localStorage)
      .filter(key => key.startsWith("valtracker_log_entries_v2:"))
      .flatMap(key => parseJson(localStorage.getItem(key)));
    return {
      profileId: profile.id || "",
      matches: (profile.matches || []).map(match => ({
        id: match.id || match.matchId,
        ranked: isRankedPerformanceMatch(match),
        source: match.source || match.metadata?.source || match.matchRecord?.source,
        queueId: match.queue?.id || match.queueId || match.metadata?.queue?.id || match.matchRecord?.queue?.id || "",
        hsPercent: hasFiniteNumber(match.matchRecord?.stats?.hsPercent)
          ? Number(match.matchRecord.stats.hsPercent)
          : hasFiniteNumber(match.hsPercent)
            ? Number(match.hsPercent)
            : null,
        rawPayloadRederivedAt: match.metadata?.rawPayloadRederivedAt || match.matchRecord?.importMeta?.rawPayloadRederivedAt || ""
      })),
      logs: logEntries.map(entry => ({
        id: entry?.id || "",
        matchId: entry?.matchId || entry?.riotMatchId || "",
        profileId: entry?.profileId || "",
        source: entry?.source || "",
        isMatchPlaceholder: entry?.isMatchPlaceholder === true,
        isPlayerAuthored: entry?.isPlayerAuthored === true
      }))
    };
  });
}

async function assertFixture(page, fixture, rows) {
  await gotoStats(page);
  const statsSurface = await readStatsSurface(page);

  addMatrixResult(rows, {
    fixture: fixture.id,
    surface: "Stats summary",
    fact: "HS %",
    expected: fixture.expected.statsHs,
    actual: statsSurface.summary.hs
  });

  if (fixture.expected.summaryWinRate) {
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Stats summary",
      fact: "Ranked-only win rate",
      expected: fixture.expected.summaryWinRate,
      actual: statsSurface.summary.winRate
    });
  }

  if (fixture.expected.role) {
    const role = statsSurface.roleProgress[fixture.expected.role] || {};
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Stats role progress",
      fact: `${fixture.expected.role} game count`,
      expected: fixture.expected.roleGames,
      actual: role.games
    });
    if (fixture.expected.roleWinRate) {
      addMatrixResult(rows, {
        fixture: fixture.id,
        surface: "Stats role progress",
        fact: `${fixture.expected.role} win rate`,
        expected: fixture.expected.roleWinRate,
        actual: role.winRate
      });
    }
  }

  if (fixture.expected.excludedRole) {
    const role = statsSurface.roleProgress[fixture.expected.excludedRole] || {};
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Stats role progress",
      fact: `${fixture.expected.excludedRole} exclusion`,
      expected: fixture.expected.excludedRoleGames,
      actual: role.games || ""
    });
  }

  if (fixture.expected.homeChartHits) {
    const homeChart = await readHomeChartSurface(page);
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Home RR chart",
      fact: "retained match hit count",
      expected: String(fixture.expected.homeChartHits),
      actual: String(homeChart.hits)
    });
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Home RR chart",
      fact: "placement/unranked disclosure",
      expected: fixture.expected.homeChartStatus,
      actual: `${homeChart.status} ${homeChart.impact}`
    });
  }

  const stored = await readStoredProfile(page);
  const rankedMatchIds = stored.matches
    .filter(match => match.ranked)
    .map(match => String(match.id || "").trim())
    .filter(Boolean)
    .sort();
  const logMatchIds = stored.logs
    .filter(entry => !stored.profileId || String(entry.profileId || "") === String(stored.profileId))
    .map(entry => String(entry.matchId || "").trim())
    .filter(Boolean)
    .sort();
  const missingLogs = rankedMatchIds.filter(matchId => !logMatchIds.includes(matchId));
  const extraLogs = logMatchIds.filter(matchId => !rankedMatchIds.includes(matchId));
  const duplicateLogs = logMatchIds.filter((matchId, index) => logMatchIds.indexOf(matchId) !== index);
  addMatrixResult(rows, {
    fixture: fixture.id,
    surface: "Stats vs Logging parity",
    fact: "ranked match IDs have exactly one Logging entry path",
    expected: "0 missing / 0 extra / 0 duplicates",
    actual: `${missingLogs.length} missing / ${extraLogs.length} extra / ${duplicateLogs.length} duplicates`
  });

  const loggingFeed = await readLoggingFeedSurface(page);
  addMatrixResult(rows, {
    fixture: fixture.id,
    surface: "Logging feed",
    fact: "default scope",
    // The session journal opens on today by design; older entries remain
    // reachable through the explicit All History picker.
    expected: /^Today\s*\//,
    actual: loggingFeed.trigger
  });
  addMatrixResult(rows, {
    fixture: fixture.id,
    surface: "Logging feed",
    fact: "visible ranked match log count",
    expected: String(rankedMatchIds.length),
    actual: String(loggingFeed.entries)
  });

  const summary = await openAndReadMatchSummary(page, fixture);
  if (fixture.expected.matchSummary?.acs) {
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Match Summary / Stats tab",
      fact: "ACS",
      expected: summary.authoritative.acs,
      actual: summary.stats.acs
    });
  }
  if (fixture.expected.matchSummary?.hs) {
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Match Summary / Stats tab",
      fact: "HS %",
      expected: summary.authoritative.hs,
      actual: summary.stats.hs
    });
  }
  addMatrixResult(rows, {
    fixture: fixture.id,
    surface: "Match Summary / Stats tab",
    fact: "KAST",
    expected: summary.authoritative.kast,
    actual: summary.stats.kast
  });

  if (fixture.expected.forbiddenText) {
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Match Summary / Weapons tab",
      fact: "No bare unmapped UUID",
      expected: "false",
      actual: String(summary.weapons.text.includes(fixture.expected.forbiddenText))
    });
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Match Summary / Weapons tab",
      fact: "Friendly unmapped weapon fallback",
      expected: fixture.expected.fallbackWeaponText,
      actual: summary.weapons.rows.find(row => row.includes("Weapon deadbeef"))?.match(/Weapon deadbeef/)?.[0] || ""
    });
  }

  if (fixture.expected.rederivedQueueId) {
    const storedMatch = stored.matches.find(match => match.id === fixture.primaryMatch.id || match.id === fixture.primaryMatch.matchId) || stored.matches[0] || {};
    const storedHs = storedMatch.hsPercent !== null
      && storedMatch.hsPercent !== undefined
      && String(storedMatch.hsPercent).trim?.() !== ""
      && Number.isFinite(Number(storedMatch.hsPercent))
      ? String(Math.round(Number(storedMatch.hsPercent)))
      : "";
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Profile storage rederive",
      fact: "queue id",
      expected: fixture.expected.rederivedQueueId,
      actual: storedMatch.queueId
    });
    addMatrixResult(rows, {
      fixture: fixture.id,
      surface: "Profile storage rederive",
      fact: "HS %",
      expected: "33",
      actual: storedHs
    });
  }
}

function proveNegativeControl(rows) {
  const wouldPass = passFail("0%", "--");
  assert.equal(wouldPass, false, "negative control should prove missing-HS coercion to 0% would fail");
  rows.push({
    fixture: "negative-control",
    surface: "Matrix assertion engine",
    fact: "Missing HS coerced to 0% is caught",
    expected: "--",
    actual: "0%",
    result: "PASS (caught deliberate bad value)"
  });
}

async function run() {
  assert.ok(
    fixtureDefinitions.length >= 8,
    "canonical fixture set should cover the eight required edge cases"
  );
  assert.equal(getTodayKey().length, 10, "test harness should compute daily warmup key");

  const server = await startServer();
  const browser = await chromium.launch();
  const rows = [];
  const issues = [];
  try {
    for (const fixture of fixtureDefinitions) {
      const page = await openSeededPage(browser, fixture, issues);
      try {
        await assertFixture(page, fixture, rows);
      } finally {
        await page.close();
      }
    }
    proveNegativeControl(rows);

    const failures = rows.filter(row => row.result === "FAIL");
    console.table(rows);
    assert.deepEqual(issues, [], `Browser console/page errors should stay clean:\n${issues.join("\n")}`);
    assert.equal(failures.length, 0, `Data integrity matrix failures:\n${JSON.stringify(failures, null, 2)}`);
    console.log(`Data integrity matrix passed for ${fixtureDefinitions.length} fixtures across ${rows.length} surface assertions (${CURRENT_ACT}).`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
