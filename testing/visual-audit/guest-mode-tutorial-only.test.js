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
      await page.evaluate(() => document.querySelector('.nav-btn[data-page="library"]')?.click());
      await page.waitForFunction(() => document.querySelectorAll("#gamesenseLibraryView .gamesense-topic-card").length >= 5, null, { timeout: 10000 });
      const libraryNavState = await page.evaluate(() => ({
        active: document.getElementById("page-library")?.classList.contains("active") || false,
        topicCards: document.querySelectorAll("#gamesenseLibraryView .gamesense-topic-card").length,
        heading: document.querySelector("#gamesenseLibraryView")?.textContent || ""
      }));
      assert.equal(libraryNavState.active, true, "normal Library nav click should activate the Library page");
      assert.ok(libraryNavState.topicCards >= 5, `normal Library nav click should render topic cards: ${JSON.stringify(libraryNavState)}`);
      assert.match(libraryNavState.heading, /Open dossier/i, "normal Library nav click should render the dossier topic surface");
      assert.deepEqual(issues, [], "guest tutorial demo path should not emit console/page errors");
      await page.close();
    }

    {
      const { page, issues } = await openPage(browser);
      await page.waitForSelector("#authModal.active #authGuestBtn", { timeout: 15000 });
      await page.evaluate(() => document.getElementById("authGuestBtn")?.click());
      await page.waitForSelector("#guestTutorialChoiceModal.active", { timeout: 15000 });
      await page.evaluate(() => document.getElementById("guestTutorialStartBtn")?.click());
      await page.waitForSelector("#appTutorialOverlay.active", { timeout: 15000 });
      await page.waitForSelector("#appTutorialTitle:text(\"Start with the top bar\")", { timeout: 15000 });
      const tutorialState = await page.evaluate(() => ({
        copy: document.getElementById("appTutorialCopy")?.textContent || "",
        count: document.getElementById("appTutorialCount")?.textContent || "",
        warmupActive: document.getElementById("dailyWarmupModal")?.classList.contains("active") || false,
        homePending: document.getElementById("page-home")?.classList.contains("daily-entrance-page-pending") || false,
        homeOpacity: getComputedStyle(document.getElementById("page-home")).opacity
      }));
      assert.equal(tutorialState.count, "1 / 33", "tutorial should start on slide 1");
      assert.match(tutorialState.copy, /bug report tool/i, "slide 1 should mention the bug report tool");
      assert.match(tutorialState.copy, /Ask Coach chatbot/i, "slide 1 should mention Ask Coach chatbot");
      assert.equal(tutorialState.warmupActive, false, "warmup should not open over the tutorial start");
      assert.equal(tutorialState.homePending, false, "tutorial start should release daily entrance pending page");
      assert.equal(tutorialState.homeOpacity, "1", "tutorial start should not leave the Home page invisible");
      for (let i = 0; i < 4; i += 1) {
        await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      }
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "5 / 33", null, { timeout: 8000 });
      const slideFiveCopy = await page.evaluate(() => document.getElementById("appTutorialCopy")?.textContent || "");
      assert.equal(
        slideFiveCopy,
        "These reads compare recent match trends against the active match window. They are meant to show what is improving the most.",
        "slide 5 should use the requested improvement wording"
      );
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "6 / 33", null, { timeout: 8000 });
      const slideSixCopy = await page.evaluate(() => document.getElementById("appTutorialCopy")?.textContent || "");
      assert.equal(
        slideSixCopy,
        "Use this section to select the map you are queued for, choose your role, spin for your agent, and receive a short term focus before the game begins.",
        "slide 6 should use the requested loadout wording"
      );
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "7 / 33", null, { timeout: 8000 });
      const slideSevenCopy = await page.evaluate(() => document.getElementById("appTutorialCopy")?.textContent || "");
      assert.equal(
        slideSevenCopy,
        "The compass compares Aim, Game Sense, Teamwork, and Discipline from your available match data and logs so you can spot your strongest category and the area you are weaker in.",
        "slide 7 should use the requested compass wording"
      );
      for (let i = 0; i < 3; i += 1) {
        await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      }
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "10 / 33", null, { timeout: 10000 });
      const loggingLauncher = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        visible: Boolean(document.querySelector("#loggingDesktopLauncher")?.getBoundingClientRect()?.height),
        copy: document.getElementById("appTutorialCopy")?.textContent || ""
      }));
      assert.equal(loggingLauncher.title, "Logging opens with choices", "slide 10 should introduce the Logging launcher");
      assert.equal(loggingLauncher.visible, true, "Logging launcher should be visible for its tutorial step");
      assert.match(loggingLauncher.copy, /Warm-Up before queueing/i, "Logging launcher copy should explain warm-up first");
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "11 / 33", null, { timeout: 10000 });
      const warmupTileState = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        visible: Boolean(document.querySelector(".logging-launch-tile-warmup")?.getBoundingClientRect()?.height)
      }));
      assert.equal(warmupTileState.title, "Warm-Up tile", "slide 11 should highlight Warm-Up");
      assert.equal(warmupTileState.visible, true, "Warm-Up tile should be visible for its tutorial step");
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "12 / 33", null, { timeout: 10000 });
      const postMatchTileState = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        visible: Boolean(document.querySelector(".logging-launch-tile-postmatch")?.getBoundingClientRect()?.height)
      }));
      assert.equal(postMatchTileState.title, "Post-Match Training tile", "slide 12 should highlight Post-Match Training");
      assert.equal(postMatchTileState.visible, true, "Post-Match Training tile should be visible for its tutorial step");
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "13 / 33", null, { timeout: 10000 });
      const exitStepState = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        matchModalActive: document.getElementById("matchSummaryModal")?.classList.contains("active") || false,
        embeddedVisible: Boolean(document.querySelector("#loggingLauncherEmbedded .daily-warmup-card")?.getBoundingClientRect()?.height),
        closeVisible: Boolean(document.querySelector("#loggingLauncherEmbedded #dailyWarmupSkip")?.getBoundingClientRect()?.height)
      }));
      assert.equal(exitStepState.title, "Exit back to the launcher", "slide 13 should explain returning from embedded experiences");
      assert.equal(exitStepState.matchModalActive, false, "match report should not be active for the embedded-exit step");
      assert.equal(exitStepState.embeddedVisible, true, "embedded warm-up should be visible for the exit tutorial step");
      assert.equal(exitStepState.closeVisible, true, "embedded warm-up Close control should be visible for the exit tutorial step");
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "14 / 33", null, { timeout: 10000 });
      await page.waitForSelector("#matchSummaryModal.active .match-summary-modal", { timeout: 10000 });
      const matchReportState = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        modalActive: document.getElementById("matchSummaryModal")?.classList.contains("active") || false,
        reportTitle: document.getElementById("matchSummaryTitle")?.textContent || ""
      }));
      assert.equal(matchReportState.title, "Match report", "slide 14 should highlight the match report");
      assert.equal(matchReportState.modalActive, true, "match report modal should be active for its tutorial step");
      assert.match(matchReportState.reportTitle, / on /i, "match report should render real report content");
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "15 / 33", null, { timeout: 10000 });
      const loggingFormState = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        formVisible: Boolean(document.querySelector(".logging-form")?.getBoundingClientRect()?.height),
        embeddedVisible: Boolean(document.querySelector("#loggingLauncherEmbedded .daily-warmup-card")?.getBoundingClientRect()?.height),
        copy: document.getElementById("appTutorialCopy")?.textContent || ""
      }));
      assert.equal(loggingFormState.title, "Logging form", "slide 15 should return to the Logging form");
      assert.equal(loggingFormState.formVisible, true, "Logging form should be visible for its tutorial step");
      assert.equal(loggingFormState.embeddedVisible, false, "embedded warm-up should be restored before the form step");
      assert.match(loggingFormState.copy, /synced match is ready/i, "Logging form copy should no longer imply it is the first Logging view");
      for (let i = 0; i < 4; i += 1) {
        await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      }
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "19 / 33", null, { timeout: 10000 });
      const slideNineteenCopy = await page.evaluate(() => document.getElementById("appTutorialCopy")?.textContent || "");
      assert.equal(
        slideNineteenCopy,
        "The summary card shows the current season stat snapshot, peak progress, selected season window, and role winrate. The stat cards, peak progress, and role cards can be selected to pull up relevant info and graphs for each of them respectively.",
        "stats overview slide should use the requested stats overview wording"
      );
      const midTourRestart = await page.evaluate(() => {
        const restart = document.getElementById("appTutorialRestart");
        return {
          hidden: restart?.hidden ?? false,
          ariaHidden: restart?.getAttribute("aria-hidden") || "",
          display: restart ? getComputedStyle(restart).display : ""
        };
      });
      assert.equal(midTourRestart.hidden, true, "non-final slides should not expose Start over");
      assert.equal(midTourRestart.ariaHidden, "true", "non-final Start over should be aria-hidden");
      assert.equal(midTourRestart.display, "none", "non-final Start over should not be visible");
      for (let i = 0; i < 6; i += 1) {
        await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      }
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "25 / 33", null, { timeout: 10000 });
      const slideTwentyFive = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        copy: document.getElementById("appTutorialCopy")?.textContent || ""
      }));
      assert.equal(slideTwentyFive.title, "Main Focus", "Main Focus should come before Important Insights after the Insights reorder");
      assert.equal(slideTwentyFive.copy, "This is the one thing RankedCoach thinks is most worth working on next.", "Main Focus should keep the requested copy");
      await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "26 / 33", null, { timeout: 10000 });
      const slideTwentySix = await page.evaluate(() => ({
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        copy: document.getElementById("appTutorialCopy")?.textContent || ""
      }));
      assert.equal(slideTwentySix.title, "Important Insights", "Important Insights should follow Main Focus after the Insights reorder");
      assert.equal(slideTwentySix.copy, "These reads are most likely to matter right now. Use the filters to split problems, watch items, and strengths.", "Important Insights should keep the requested copy");
      for (let i = 0; i < 2; i += 1) {
        await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
      }
      await page.waitForFunction(() => document.getElementById("appTutorialCount")?.textContent === "28 / 33", null, { timeout: 10000 });
      await page.waitForFunction(() => document.querySelectorAll("#gamesenseLibraryView .gamesense-topic-card").length >= 5, null, { timeout: 10000 });
      const libraryOverviewState = await page.evaluate(() => ({
        active: document.getElementById("page-library")?.classList.contains("active") || false,
        title: document.getElementById("appTutorialTitle")?.textContent || "",
        topicCards: document.querySelectorAll("#gamesenseLibraryView .gamesense-topic-card").length,
        visibleCopy: document.querySelector("#gamesenseLibraryView")?.textContent || ""
      }));
      assert.equal(libraryOverviewState.active, true, "Library overview slide should activate the Library page");
      assert.equal(libraryOverviewState.title, "GameSense Library", "Library overview slide should introduce the Library");
      assert.ok(libraryOverviewState.topicCards >= 5, `Library overview slide should render topic cards: ${JSON.stringify(libraryOverviewState)}`);
      assert.match(libraryOverviewState.visibleCopy, /Open dossier/i, "Library overview slide should show the dossier overview instead of an empty page");
      const librarySlideChecks = [
        { count: "29 / 33", title: "Agent dossiers", selector: ".gamesense-agents-gallery-head", copy: /role expectations/i },
        { count: "30 / 33", title: "Weapon dossiers", selector: ".gamesense-weapons-gallery-head", copy: /damage ranges/i },
        { count: "31 / 33", title: "Playlist library", selector: ".gamesense-playlist-filters", copy: /trusted coaching videos/i },
        { count: "32 / 33", title: "Crosshair library", selector: ".gamesense-crosshair-panel", copy: /pro and community codes/i },
        { count: "33 / 33", title: "Patch notes", selector: ".gamesense-patch-notes-feed", copy: /official VALORANT patch notes/i }
      ];
      for (const check of librarySlideChecks) {
        await page.evaluate(() => document.getElementById("appTutorialNext")?.click());
        await page.waitForFunction(expected => document.getElementById("appTutorialCount")?.textContent === expected, check.count, { timeout: 10000 });
        await page.waitForSelector(check.selector, { timeout: 10000 });
        const libraryStepState = await page.evaluate(selector => ({
          title: document.getElementById("appTutorialTitle")?.textContent || "",
          copy: document.getElementById("appTutorialCopy")?.textContent || "",
          visible: Boolean(document.querySelector(selector)?.getBoundingClientRect()?.height),
          restartHidden: document.getElementById("appTutorialRestart")?.hidden ?? true
        }), check.selector);
        assert.equal(libraryStepState.title, check.title, `${check.count} should be ${check.title}`);
        assert.match(libraryStepState.copy, check.copy, `${check.title} should use the requested Library walkthrough copy`);
        assert.equal(libraryStepState.visible, true, `${check.title} should highlight real Library content`);
        assert.equal(libraryStepState.restartHidden, check.count !== "33 / 33", "Start over should only appear on the final slide");
      }
      const finalRestart = await page.evaluate(() => {
        const restart = document.getElementById("appTutorialRestart");
        return {
          hidden: restart?.hidden ?? true,
          ariaHidden: restart?.getAttribute("aria-hidden") || "",
          display: restart ? getComputedStyle(restart).display : ""
        };
      });
      assert.equal(finalRestart.hidden, false, "final slide should expose Start over");
      assert.equal(finalRestart.ariaHidden, "false", "final slide Start over should be announced");
      assert.notEqual(finalRestart.display, "none", "final slide Start over should be visible");
      assert.deepEqual(issues, [], "guest tutorial start path should not emit console/page errors");
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
