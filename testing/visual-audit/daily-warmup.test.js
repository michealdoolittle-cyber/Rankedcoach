"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

require(path.resolve(__dirname, "..", "..", "public", "analytics", "warmup-correlation.js"));

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41784;
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
      const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
      if (pathname === "/api/henrik/matches" && request.method === "POST") {
        let body = "";
        request.on("data", chunk => { body += chunk; });
        request.on("end", () => {
          const parsed = JSON.parse(body || "{}");
          const data = parsed.mode === "deathmatch" ? [{
            metadata: {
              match_id: "11111111-1111-4111-8111-111111111111",
              started_at: new Date().toISOString()
            }
          }] : [];
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ data }));
        });
        return;
      }
      let relativePath = pathname === "/" ? "/index.html" : pathname;
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

async function seedProfile(page, id) {
  await page.addInitScript(({ id }) => {
    const firstGame = new Date(Date.now() - (3 * 60 * 60 * 1000));
    const lastGame = new Date(Date.now() - (2 * 60 * 60 * 1000));
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", id);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
      id,
      name: "Warmup Test",
      accountName: "Warmup Test",
      region: "NA",
      puuid: "22222222-2222-4222-8222-222222222222",
      matches: [{
        id: "ranked-baseline",
        source: "henrik",
        result: "win",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }]
    }]));
    localStorage.setItem("valtracker_log_entries_v2:guest", JSON.stringify([
      {
        id: "training-last-game",
        matchId: "training-last-match",
        profileId: id,
        source: "henrik-match-placeholder",
        isMatchPlaceholder: true,
        isPlayerAuthored: false,
        createdAt: lastGame.toISOString(),
        result: "loss",
        rr: -14,
        agent: "Sova",
        role: "Initiator",
        map: "Haven",
        notes: ""
      },
      {
        id: "training-first-game",
        matchId: "training-first-match",
        profileId: id,
        source: "henrik-match-placeholder",
        isMatchPlaceholder: true,
        isPlayerAuthored: false,
        createdAt: firstGame.toISOString(),
        result: "win",
        rr: 18,
        agent: "Jett",
        role: "Duelist",
        map: "Ascent",
        notes: ""
      }
    ]));
  }, { id });
}

async function submitManualReflection(page, { agent, focus, map, rating, mood, notes }) {
  await page.evaluate(agentName => {
    const display = document.getElementById("logAgentDisplay");
    if (display) display.dataset.agent = agentName;
  }, agent);
  await page.selectOption("#logFocusSelect", focus);
  await page.fill("#logMap", map);
  await page.click(`#logRatingRow [data-rating="${rating}"]`);
  await page.click(`#logMoodRow [data-mood="${mood}"]`);
  await page.click('#logTeamCommsRow [data-team-comms="3"]');
  await page.click('#logSelfCommsRow [data-self-comms="3"]');
  await page.fill("#logNotes", notes);
  await page.click("#logSaveBtn");
  await page.waitForFunction(expectedNotes => {
    const entries = JSON.parse(localStorage.getItem("valtracker_log_entries_v2:guest") || "[]");
    return entries.some(entry => entry.notes === expectedNotes);
  }, notes);
  return page.evaluate(expectedNotes => {
    const entries = JSON.parse(localStorage.getItem("valtracker_log_entries_v2:guest") || "[]");
    return entries.find(entry => entry.notes === expectedNotes)?.id || "";
  }, notes);
}

function buildCorrelationFixture(daysPerGroup = 7) {
  const warmupLog = [];
  const matches = [];
  for (let index = 0; index < daysPerGroup * 2; index += 1) {
    const date = new Date(2026, 5, 1 + index);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const warmed = index < daysPerGroup;
    warmupLog.push({
      date: key,
      status: warmed ? "completed" : "skipped",
      drillsSelected: warmed ? ["easy-bots-flicking"] : [],
      skipped: !warmed
    });
    const matchCount = 2;
    for (let matchIndex = 0; matchIndex < matchCount; matchIndex += 1) {
      matches.push({
        createdAt: new Date(2026, 5, 1 + index, 12, matchIndex).toISOString(),
        result: warmed || matchIndex === 0 ? "win" : "loss",
        acs: warmed ? 225 : 195,
        roundMetrics: { overall: { percentage: warmed ? 74 : 68 } }
      });
    }
  }
  return { warmupLog, matches };
}

async function run() {
  const correlation = globalThis.RankedCoachWarmupCorrelation;
  assert.equal(correlation.compute(buildCorrelationFixture(3)).ready, false);
  const readyCorrelation = correlation.compute(buildCorrelationFixture(7));
  assert.equal(readyCorrelation.ready, true);
  assert.equal(readyCorrelation.direction, "positive");
  assert.equal(correlation.isWarmupComplete({ skipped: true, dmTdmAutoVerified: true }), true);

  const appSource = fs.readFileSync(path.join(root, "app.js"), "utf8");
  assert.doesNotMatch(appSource, /Riot API|Riot Match History/);
  assert.match(appSource, /selectCardVariant\?\.\("winStreak"/);
  assert.match(appSource, /selectCardVariant\?\.\("lossStreak"/);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  fs.mkdirSync(path.join(__dirname, "tmp"), { recursive: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
      contentType: "text/javascript",
      body: supabaseStub()
    }));
    await seedProfile(page, "daily-warmup-desktop");
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.locator("#dailyWarmupModal.active").waitFor({ state: "visible", timeout: 5000 });
    await page.waitForTimeout(350);
    assert.equal(await page.locator("#dailyWarmupModal .daily-warmup-card").evaluate(element => getComputedStyle(element).opacity), "1");
    const expectedDrills = [
      "Weapon Choice",
      "Burst Peeking",
      "Burst Peeking w/ Strafe",
      "Tap Fire Rhythm Training",
      "Easy Bots Flicking",
      "Medium Bots Flicking",
      "Hard Bots Flicking",
      "Head Tracking",
      "Head Tracking w/ Strafe",
      "Drone Target Switching",
      "Spray Control Target Dummy"
    ];
    assert.deepEqual(await page.locator("[data-warmup-drill] .daily-warmup-drill-copy strong").allTextContents(), expectedDrills);
    assert.equal(await page.locator("[data-warmup-drill] .daily-warmup-select-indicator").count(), expectedDrills.length);
    assert.equal(await page.locator(".daily-warmup-postgame").isVisible(), false);
    assert.equal(await page.locator(".daily-warmup-postgame-links a").count(), 2);
    const rankedMatchCountBefore = await page.evaluate(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.matches?.length || 0);

    const weaponChoice = page.locator('[data-warmup-drill="weapon-choice"]');
    const unselectedStyle = await weaponChoice.evaluate(element => ({
      border: getComputedStyle(element).borderColor,
      background: getComputedStyle(element).backgroundImage
    }));
    await weaponChoice.click();
    await page.waitForTimeout(220);
    const selectedStyle = await weaponChoice.evaluate(element => ({
      selected: element.classList.contains("is-selected"),
      border: getComputedStyle(element).borderColor,
      background: getComputedStyle(element).backgroundImage,
      checkOpacity: getComputedStyle(element.querySelector(".daily-warmup-select-indicator"), "::after").opacity,
      checkColor: getComputedStyle(element.querySelector(".daily-warmup-select-indicator"), "::after").borderLeftColor
    }));
    assert.equal(selectedStyle.selected, true);
    assert.notEqual(selectedStyle.border, unselectedStyle.border);
    assert.notEqual(selectedStyle.background, unselectedStyle.background);
    assert.ok(Number(selectedStyle.checkOpacity) >= 0.85, selectedStyle.checkOpacity);
    assert.match(selectedStyle.checkColor, /52, 211, 153|34, 197, 94|22, 163, 74/);

    for (const drill of ["burst-peeking", "head-tracking", "drone-target-switching"]) {
      await page.click(`[data-warmup-drill="${drill}"]`);
    }
    await page.click('[data-warmup-drill="spray-control-dummy"]');
    assert.equal(await page.locator("[data-warmup-drill].is-selected").count(), 4);
    await page.fill("#dailyWarmupWeapon", "Vandal");
    await page.screenshot({ path: path.join(__dirname, "tmp", "daily-warmup-desktop.png"), fullPage: true });
    await page.check("#dailyWarmupDmTdm");
    await page.click("#dailyWarmupSave");
    await page.waitForFunction(() => {
      const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
      return profiles[0]?.warmupLog?.[0]?.dmTdmAutoVerified === true;
    });

    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]);
    assert.equal(saved.matches.length, rankedMatchCountBefore, "DM verification must not change ranked match history");
    assert.equal(saved.matches.some(match => String(match?.id || match?.matchId || "") === "11111111-1111-4111-8111-111111111111"), false);
    assert.equal(saved.warmupLog.length, 1);
    assert.equal(saved.warmupLog[0].drillsSelected.length, 4);
    assert.equal(saved.warmupLog[0].weapon, "Vandal");
    assert.equal(saved.warmupLog[0].rangeDrillsSelfReported, true);
    assert.equal(saved.warmupLog[0].dmTdmSelfReported, true);
    assert.equal(saved.warmupLog[0].dmTdmAutoVerified, true);
    assert.equal(saved.lastWarmupPromptDate, saved.warmupLog[0].date);

    await page.locator('.nav-btn[data-page="logging"]').click();
    await page.waitForFunction(() => document.getElementById("page-logging")?.classList.contains("active"));
    assert.equal(await page.locator("#loggingTrainingMenuTitle").innerText(), "POST-GAME AIM TRAINING");
    const warmupGameId = await submitManualReflection(page, {
      agent: "Jett",
      focus: "Aim",
      map: "Ascent",
      rating: 4,
      mood: "Fun",
      notes: "First manual game after today's warm-up."
    });
    const aimTrainingGameId = await submitManualReflection(page, {
      agent: "Sova",
      focus: "Positioning",
      map: "Haven",
      rating: 5,
      mood: "Focused",
      notes: "Second manual game before post-game aim training."
    });
    assert.ok(warmupGameId);
    assert.ok(aimTrainingGameId);
    assert.notEqual(warmupGameId, aimTrainingGameId);
    await page.waitForFunction(expectedId => {
      const profile = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0];
      return profile?.warmupLog?.[0]?.warmupLogEntryId === expectedId;
    }, warmupGameId);
    const warmupMarkerDebug = await page.evaluate(expectedId => ({
      expectedId,
      profile: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.warmupLog?.[0],
      storedEntries: JSON.parse(localStorage.getItem("valtracker_log_entries_v2:guest") || "[]").map(entry => ({ id: entry.id, profileId: entry.profileId, createdAt: entry.createdAt })),
      renderedEntries: [...document.querySelectorAll(".log-entry")].map(entry => ({ id: entry.dataset.logEntryId, warmup: Boolean(entry.querySelector(".log-training-fire")) }))
    }), warmupGameId);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-fire`).count(), 1, JSON.stringify(warmupMarkerDebug));
    assert.equal(await page.locator('.log-entry[data-log-entry-id="training-first-game"] .log-training-fire').count(), 0);
    await page.click("#loggingTrainingMenuBtn");
    await page.locator('#dailyWarmupModal.active[data-training-mode="postgame"]').waitFor({ state: "visible" });
    assert.equal(await page.locator("#dailyWarmupGrid").isVisible(), false);
    assert.equal(await page.locator(".daily-warmup-postgame").isVisible(), true);
    await page.locator(".daily-warmup-postgame").screenshot({ path: path.join(__dirname, "tmp", "daily-warmup-postgame-desktop.png") });
    assert.equal(await page.locator("#dailyWarmupPostgameCommit").isEnabled(), true);
    await page.click("#dailyWarmupPostgameCommit");
    await page.waitForFunction(() => {
      const profile = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0];
      return profile?.warmupLog?.[0]?.postGameAimTrainingCommitted === true;
    });

    const trainingRecord = await page.evaluate(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.warmupLog?.[0]);
    assert.equal(trainingRecord.warmupLogEntryId, warmupGameId);
    assert.equal(trainingRecord.postGameLogEntryId, aimTrainingGameId);
    await page.waitForTimeout(3000);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-fire`).count(), 1);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-crosshair`).count(), 0);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${aimTrainingGameId}"] .log-training-crosshair`).count(), 1);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${aimTrainingGameId}"] .log-training-fire`).count(), 0);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-fire`).getAttribute("title"), "Edit");
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${aimTrainingGameId}"] .log-training-crosshair`).getAttribute("title"), "Edit");
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-fire`).evaluate(button => button.parentElement?.classList.contains("log-header")), true);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${aimTrainingGameId}"] .log-training-crosshair`).evaluate(button => button.parentElement?.classList.contains("log-header")), true);
    await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-fire`).hover();
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-fire`).evaluate(button => getComputedStyle(button, "::after").content), '"Edit"');
    await page.locator("#loggingTrainingMenuBtn").screenshot({ path: path.join(__dirname, "tmp", "daily-training-form-button-desktop.png") });
    await page.locator(".logging-feed-card").screenshot({ path: path.join(__dirname, "tmp", "daily-training-feed-icons-desktop.png") });

    await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-training-fire`).click();
    await page.locator('#dailyWarmupModal.active[data-training-mode="warmup"]').waitFor({ state: "visible" });
    assert.equal(await page.locator('[data-warmup-drill="weapon-choice"]').getAttribute("aria-pressed"), "true");
    await page.click("#dailyWarmupClose");
    await page.locator(`.log-entry[data-log-entry-id="${aimTrainingGameId}"] .log-training-crosshair`).click();
    await page.locator('#dailyWarmupModal.active[data-training-mode="postgame"]').waitFor({ state: "visible" });
    assert.equal(await page.locator("#dailyWarmupPostgameCommit").getAttribute("aria-pressed"), "true");
    await page.click("#dailyWarmupPostgameCommit");
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.warmupLog?.[0]?.postGameAimTrainingCommitted === false);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${aimTrainingGameId}"] .log-training-crosshair`).count(), 0);
    await page.click("#loggingTrainingMenuBtn");
    await page.locator('#dailyWarmupModal.active[data-training-mode="postgame"]').waitFor({ state: "visible" });
    await page.click("#dailyWarmupPostgameCommit");
    await page.waitForFunction(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.warmupLog?.[0]?.postGameAimTrainingCommitted === true);
    assert.equal(await page.locator(`.log-entry[data-log-entry-id="${aimTrainingGameId}"] .log-training-crosshair`).count(), 1);

    await page.locator(`.log-entry[data-log-entry-id="${warmupGameId}"] .log-edit-btn`).click();
    assert.equal(await page.locator("#logMap").inputValue(), "Ascent");
    assert.equal(await page.locator("#logNotes").inputValue(), "First manual game after today's warm-up.");
    assert.equal(await page.locator("#page-logging").getAttribute("data-mobile-logging-view"), "form");

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1400);
    const reloadState = await page.evaluate(() => ({
      profiles: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]").map(profile => ({
        id: profile.id,
        lastWarmupPromptDate: profile.lastWarmupPromptDate,
        warmupDates: (profile.warmupLog || []).map(entry => entry.date)
      })),
      activeProfileId: localStorage.getItem("valtracker_active_profile_id"),
      modalActive: document.getElementById("dailyWarmupModal")?.classList.contains("active")
    }));
    assert.equal(reloadState.modalActive, false, JSON.stringify(reloadState));
    await page.close();

    const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await mobile.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
      contentType: "text/javascript",
      body: supabaseStub()
    }));
    await seedProfile(mobile, "daily-warmup-mobile");
    await mobile.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await mobile.locator("#dailyWarmupModal.active").waitFor({ state: "visible", timeout: 5000 });
    await mobile.waitForTimeout(350);
    const mobileWarmupHeader = await mobile.locator(".daily-warmup-header").evaluate(header => {
      const headerRect = header.getBoundingClientRect();
      const closeRect = document.getElementById("dailyWarmupClose").getBoundingClientRect();
      return { headerTop: headerRect.top, closeTop: closeRect.top, closeRight: closeRect.right, viewportWidth: innerWidth };
    });
    assert.ok(mobileWarmupHeader.headerTop >= 0 && mobileWarmupHeader.closeTop >= 0 && mobileWarmupHeader.closeRight <= mobileWarmupHeader.viewportWidth, JSON.stringify(mobileWarmupHeader));
    assert.equal(await mobile.locator("#dailyWarmupClose").isVisible(), true);
    await mobile.click('[data-warmup-drill="burst-peeking-strafe"]');
    await mobile.click('[data-warmup-drill="tap-fire-rhythm"]');
    await mobile.waitForTimeout(220);
    await mobile.screenshot({ path: path.join(__dirname, "tmp", "daily-warmup-mobile.png"), fullPage: true });
    assert.equal(await mobile.locator("[data-warmup-drill].is-selected").count(), 2);
    assert.equal(await mobile.locator(".daily-warmup-postgame").isVisible(), false);
    await mobile.click("#dailyWarmupSkip");
    const skipped = await mobile.evaluate(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]);
    assert.equal(skipped.warmupLog[0].skipped, true);
    assert.equal(skipped.lastWarmupPromptDate, skipped.warmupLog[0].date);
    await mobile.click('[data-mobile-page="logging"]');
    await mobile.waitForFunction(() => document.getElementById("page-logging")?.classList.contains("is-current-page"));
    await mobile.waitForTimeout(3000);
    await mobile.locator("#loggingTrainingMenuBtn").screenshot({ path: path.join(__dirname, "tmp", "daily-training-form-button-mobile.png") });
    await mobile.click("#loggingTrainingMenuBtn");
    await mobile.locator('#dailyWarmupModal.active[data-training-mode="warmup"]').waitFor({ state: "visible" });
    await mobile.click('[data-warmup-drill="head-tracking"]');
    await mobile.click("#dailyWarmupSave");
    const mobileTrainingGameId = await submitManualReflection(mobile, {
      agent: "Jett",
      focus: "Crosshair Discipline",
      map: "Ascent",
      rating: 4,
      mood: "Focused",
      notes: "Mobile manual game after warm-up."
    });
    assert.ok(mobileTrainingGameId);
    await mobile.click("#loggingTrainingMenuBtn");
    await mobile.locator('#dailyWarmupModal.active[data-training-mode="postgame"]').waitFor({ state: "visible" });
    await mobile.locator(".daily-warmup-postgame").screenshot({ path: path.join(__dirname, "tmp", "daily-warmup-postgame-mobile.png") });
    assert.equal(await mobile.locator("#dailyWarmupGrid").isVisible(), false);
    await mobile.click("#dailyWarmupPostgameCommit");
    await mobile.waitForFunction(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.warmupLog?.[0]?.postGameAimTrainingCommitted === true);
    await mobile.click('[data-mobile-logging-view="feed"]');
    await mobile.waitForTimeout(3000);
    assert.equal(await mobile.locator(`.log-entry[data-log-entry-id="${mobileTrainingGameId}"] .log-training-fire`).count(), 1);
    assert.equal(await mobile.locator(`.log-entry[data-log-entry-id="${mobileTrainingGameId}"] .log-training-crosshair`).count(), 1);
    await mobile.locator(".logging-feed-card").screenshot({ path: path.join(__dirname, "tmp", "daily-training-feed-icons-mobile.png") });
    await mobile.close();

    console.log("Daily training checks passed: form access, warm-up/post-game modes, first/linked-last feed markers, editable reflections, persistence, Henrik isolation, and mobile layout.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
