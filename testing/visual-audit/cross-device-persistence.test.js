"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41793;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/") url = "/index.html";
      const file = path.join(root, url);
      if (!file.startsWith(root)) { response.writeHead(403); return response.end("Forbidden"); }
      fs.readFile(file, (error, data) => {
        if (error) { response.writeHead(404); return response.end("Not found"); }
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub(options = {}) {
  const cloudProfile = {
    id: "cloud-profile",
    name: "Cloud Canonical",
    accountName: "Cloud Player",
    region: "NA",
    riotId: "",
    themeKey: "radiant-focus",
    profileBorder: "hex",
    matches: [{
      id: "cloud-match-with-rounds",
      matchId: "cloud-match-with-rounds",
      rank: "Diamond 2",
      rrTotal: 64,
      roundMetrics: [{ round: 1, won: true }],
      matchRecord: {
        rank: { rank: "Diamond 2", rr: 64 },
        roundByRound: Array.from({ length: 28 }, (_item, round) => ({ round, payload: `ROUND_PAYLOAD_MARKER-${round}-${"x".repeat(180)}` }))
      }
    }]
  };
  const cloudLog = {
    id: "cloud-log-1",
    profileId: "cloud-profile",
    source: "manual",
    createdAt: "2026-07-13T14:00:00.000Z",
    agent: "Sova",
    map: "Haven",
    focus: "Map Awareness",
    rating: 4,
    notes: "Cloud reflection"
  };
  const historyLogCount = Math.max(0, Number(options.historyLogCount) || 0);
  const cloudLogs = [
    cloudLog,
    ...Array.from({ length: historyLogCount }, (_item, index) => ({
      ...cloudLog,
      id: `cloud-history-log-${index + 1}`,
      createdAt: new Date(Date.UTC(2026, 6, 1, 12, 0, index)).toISOString(),
      notes: `Historical reflection ${index + 1}`
    }))
  ];
  const failAppStateSave = options.failAppStateSave === true;
  const normalizedRows = options.normalizedRows === true;
  const normalizedProfileRow = {
    user_id: "cross-device-user",
    riot_id: "",
    region: "NA",
    profile_json: cloudProfile
  };
  const normalizedLogRows = cloudLogs.map(log => ({
    id: log.id,
    user_id: "cross-device-user",
    profile_id: cloudProfile.id,
    entry_json: log,
    created_at: log.createdAt
  }));
  const normalizedMatchRow = {
    id: "cross-device-user:riot:cloud-match-with-rounds",
    user_id: "cross-device-user",
    profile_id: cloudProfile.id,
    riot_match_id: "cloud-match-with-rounds",
    match_json: cloudProfile.matches[0],
    played_at: "2026-07-13T14:00:00.000Z"
  };
  return `
    globalThis.__cloudWrites = [];
    globalThis.supabase = {
      createClient() {
        const user = { id: "cross-device-user", email: "sync@example.com", user_metadata: { account_name: "Cloud Player" } };
        globalThis.__cloudAppState = ${JSON.stringify({
          user_id: "cross-device-user",
          active_profile_id: "cloud-profile",
          profiles_json: [cloudProfile],
          log_entries_json: cloudLogs,
          theme_builder_json: {},
          theme_builder_ui_json: {},
          updated_at: "2026-08-04T12:00:00.000Z"
        })};
        function query(table) {
          return {
            table,
            select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, in() { return this; },
            update() { return this; }, delete() { return this; },
            maybeSingle() {
              if (table === "vip_app_state") return new Promise(resolve => setTimeout(() => resolve({ data: globalThis.__cloudAppState, error: null }), 900));
              if (${JSON.stringify(normalizedRows)} && table === "users_profiles") return Promise.resolve({ data: ${JSON.stringify(normalizedProfileRow)}, error: null });
              return Promise.resolve({ data: null, error: null });
            },
            single() { return Promise.resolve({ data: null, error: null }); },
            upsert(payload) {
              const rows = Array.isArray(payload) ? payload : [payload];
              globalThis.__cloudWrites.push({ table, rows: structuredClone(rows) });
              if (table === "vip_app_state" && ${JSON.stringify(failAppStateSave)}) {
                return Promise.resolve({ data: null, error: {
                  name: "PostgrestError",
                  code: "PGRST500",
                  message: "vip_app_state forced test failure",
                  details: "Simulated upstream save failure",
                  hint: "Continue normalized saves",
                  status: 500
                } });
              }
              return Promise.resolve({ data: null, error: null });
            },
            insert() { return Promise.resolve({ data: null, error: null }); },
            then(resolve) {
              const rows = ${JSON.stringify(normalizedRows)}
                ? table === "reflection_logs"
                  ? ${JSON.stringify(normalizedLogRows)}
                  : table === "match_snapshots"
                    ? [${JSON.stringify(normalizedMatchRow)}]
                    : []
                : [];
              return Promise.resolve({ data: rows, error: null }).then(resolve);
            }
          };
        }
        return {
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", { user }), 50);
              return { data: { subscription: { unsubscribe() {} } } };
            },
            signOut: async () => ({ error: null }),
            mfa: {
              getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal1" } }),
              listFactors: async () => ({ data: { all: [] } })
            }
          },
          from: query,
          functions: { invoke: async () => ({ data: null, error: null }) }
        };
      }
    };
  `;
}

async function openDevice(browser, { staleLocal = false, quotaLimited = false, failAppStateSave = false, normalizedRows = false, historyLogCount = 0 } = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => consoleErrors.push(error.message));
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub({ failAppStateSave, normalizedRows, historyLogCount }) }));
  await page.addInitScript(({ hasStaleLocal, quotaLimited }) => {
    localStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "account");
    if (hasStaleLocal) {
      localStorage.setItem("valtracker_active_profile_id", "device-profile");
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: "device-profile",
        name: "Device Local",
        accountName: "Old Device",
        region: "NA",
        matches: []
      }]));
      localStorage.setItem("valtracker_log_entries_v2:cross-device-user", JSON.stringify([{
        id: "device-log",
        profileId: "device-profile",
        createdAt: "2026-07-12T12:00:00.000Z",
        notes: "Device-only stale log"
      }]));
    }
    if (quotaLimited) {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setQuotaLimitedItem(key, value) {
        if (key === "valtracker_profiles_v1" && String(value || "").length > 4200) {
          throw new DOMException("Setting the value exceeded the quota.", "QuotaExceededError");
        }
        return originalSetItem.call(this, key, value);
      };
    }
  }, { hasStaleLocal: staleLocal, quotaLimited });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
    return profiles.some(profile => profile.id === "cloud-profile")
      && document.getElementById("loginInitOverlay")?.getAttribute("aria-hidden") === "true";
  }, null, { timeout: 15000 });
  const state = await page.evaluate(() => ({
    profiles: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]").map(profile => ({ id: profile.id, name: profile.name, themeKey: profile.themeKey, profileBorder: profile.profileBorder })),
    logs: JSON.parse(localStorage.getItem("valtracker_log_entries_v2:cross-device-user") || "[]").map(entry => ({ id: entry.id, profileId: entry.profileId, notes: entry.notes })),
    writes: globalThis.__cloudWrites,
    diagnostics: globalThis.RankedCoachSyncDiagnosticsState,
    activeId: localStorage.getItem("valtracker_active_profile_id"),
    localCacheHasDuplicateRounds: Boolean(JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")[0]?.matches?.[0]?.matchRecord?.roundByRound)
  }));
  return { page, state, consoleErrors };
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const first = await openDevice(browser, { staleLocal: true });
    assert.deepEqual(first.state.profiles, [{ id: "cloud-profile", name: "Cloud Canonical", themeKey: "radiant-focus", profileBorder: "hex" }]);
    assert.deepEqual(first.state.logs, [{ id: "cloud-log-1", profileId: "cloud-profile", notes: "Cloud reflection" }]);
    assert.equal(first.state.activeId, "cloud-profile");
    assert.equal(first.state.writes.some(write => JSON.stringify(write.rows).includes("Device Local")), false, JSON.stringify(first.state.writes));
    assert.equal(first.state.writes.some(write => write.table === "vip_app_state" && JSON.stringify(write.rows).includes("Cloud Canonical")), true);
    assert.deepEqual(first.consoleErrors, []);
    await first.page.close();

    const second = await openDevice(browser);
    assert.deepEqual(second.state.profiles, [{ id: "cloud-profile", name: "Cloud Canonical", themeKey: "radiant-focus", profileBorder: "hex" }]);
    assert.deepEqual(second.state.logs, [{ id: "cloud-log-1", profileId: "cloud-profile", notes: "Cloud reflection" }]);
    assert.equal(second.state.activeId, "cloud-profile");
    assert.deepEqual(second.consoleErrors, []);
    await second.page.close();

    const baseline = await openDevice(browser, { normalizedRows: true });
    assert.equal(baseline.state.writes.some(write => write.table === "reflection_logs"), false, JSON.stringify(baseline.state.writes));
    assert.equal(baseline.state.writes.some(write => write.table === "match_snapshots"), false, JSON.stringify(baseline.state.writes));
    assert.equal(baseline.state.diagnostics.lastBackendSaveMetrics.logRows, 0);
    assert.equal(baseline.state.diagnostics.lastBackendSaveMetrics.matchRows, 0);
    assert.equal(baseline.state.diagnostics.lastBackendSaveMetrics.totalLogRows, 1);
    assert.equal(baseline.state.diagnostics.lastBackendSaveMetrics.totalMatchRows, 1);
    assert.deepEqual(baseline.consoleErrors, []);

    // Realtime is intentionally absent from this fixture. A later remote
    // revision must still reach an already-open device through the lightweight
    // app-state revision poll, without a hard reload.
    await baseline.page.evaluate(() => {
      const current = globalThis.__cloudAppState;
      globalThis.__cloudAppState = {
        ...current,
        updated_at: "2026-08-04T12:01:00.000Z",
        log_entries_json: [...current.log_entries_json, {
          id: "live-revision-warmup",
          profileId: "cloud-profile",
          source: "manual",
          createdAt: "2026-08-04T12:01:00.000Z",
          agent: "Sova",
          map: "Haven",
          focus: "Map Awareness",
          notes: "Warm-up saved from another open device.",
          warmup: true
        }]
      };
    });
    const liveRevisionObserved = await baseline.page.waitForFunction(() => JSON.parse(
      localStorage.getItem("valtracker_log_entries_v2:cross-device-user") || "[]"
    ).some(entry => entry.id === "live-revision-warmup"), null, { timeout: 20000 }).then(() => true).catch(() => false);
    const liveRevisionState = await baseline.page.evaluate(() => ({
      observed: JSON.parse(localStorage.getItem("valtracker_log_entries_v2:cross-device-user") || "[]")
        .some(entry => entry.id === "live-revision-warmup"),
      revision: globalThis.__cloudAppState?.updated_at || "",
      diagnostics: globalThis.RankedCoachSyncDiagnosticsState || null,
      visibility: document.visibilityState
    }));
    assert.equal(liveRevisionObserved && liveRevisionState.observed, true, JSON.stringify(liveRevisionState));
    assert.deepEqual(baseline.consoleErrors, []);

    await baseline.page.evaluate(() => {
      const modal = document.getElementById("dailyWarmupModal");
      if (modal?.classList.contains("active")) document.getElementById("dailyWarmupSkip")?.click();
    });
    await baseline.page.click('[data-page="logging"]');
    await baseline.page.waitForTimeout(300);
    await baseline.page.evaluate(() => globalThis.RankedCoachDailyEntrance?.skipAll?.());
    await baseline.page.evaluate(() => {
      const modal = document.getElementById("dailyWarmupModal");
      if (modal?.classList.contains("active")) document.getElementById("dailyWarmupSkip")?.click();
    });
    await baseline.page.locator("#logCalendarTrigger").click({ force: true });
    await baseline.page.locator('#logCalendarPopover [data-log-all]').click({ force: true });
    await baseline.page.waitForFunction(() => /all history/i.test(document.getElementById("logCalendarTrigger")?.textContent || ""));
    await baseline.page.locator('.log-entry[data-log-entry-id="cloud-log-1"] .log-edit-btn').evaluate(button => button.click());
    await baseline.page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingDesktopView === "form");
    await baseline.page.evaluate(() => {
      document.getElementById("logAgentDisplay").dataset.agent = "Sova";
    });
    await baseline.page.locator("#logFocusSelect").selectOption("Map Awareness", { force: true });
    await baseline.page.fill("#logMap", "Haven");
    await baseline.page.locator('#logRatingRow [data-rating="4"]').evaluate(button => button.click());
    await baseline.page.locator('#logMoodRow [data-mood="Focused"]').evaluate(button => button.click());
    await baseline.page.locator('#logTeamCommsRow [data-team-comms="3"]').evaluate(button => button.click());
    await baseline.page.locator('#logSelfCommsRow [data-self-comms="3"]').evaluate(button => button.click());
    await baseline.page.fill("#logNotes", "Delta persistence test reflection.");
    const writeCountBeforeReflection = await baseline.page.evaluate(() => globalThis.__cloudWrites.length);
    await baseline.page.locator("#logSaveBtn").evaluate(button => button.click());
    try {
      await baseline.page.waitForFunction(start => globalThis.__cloudWrites
        .slice(start)
        .some(write => write.table === "reflection_logs" && write.rows.some(row => row.id === "cloud-log-1")), writeCountBeforeReflection, { timeout: 20000 });
    } catch (error) {
      const saveFailureState = await baseline.page.evaluate(() => ({
        writes: globalThis.__cloudWrites,
        diagnostics: globalThis.RankedCoachSyncDiagnosticsState || null,
        currentForm: {
          view: document.getElementById("page-logging")?.dataset.loggingDesktopView || "",
          agent: document.getElementById("logAgentDisplay")?.dataset.agent || "",
          focus: document.getElementById("logFocusSelect")?.value || "",
          map: document.getElementById("logMap")?.value || "",
          notes: document.getElementById("logNotes")?.value || ""
        }
      }));
      console.error(`Reflection save diagnostics: ${JSON.stringify(saveFailureState)}`);
      error.message += `\nReflection save diagnostics: ${JSON.stringify(saveFailureState)}`;
      throw error;
    }
    const deltaWrites = await baseline.page.evaluate(start => globalThis.__cloudWrites.slice(start), writeCountBeforeReflection);
    const deltaLogWrites = deltaWrites.filter(write => write.table === "reflection_logs");
    assert.equal(deltaLogWrites.length, 1);
    assert.ok(deltaLogWrites[0].rows.length <= 2, JSON.stringify(deltaLogWrites));
    assert.equal(deltaLogWrites[0].rows.some(row => row.id === "cloud-log-1"), true);
    assert.equal(deltaWrites.some(write => write.table === "match_snapshots"), false, JSON.stringify(deltaWrites));
    assert.deepEqual(baseline.consoleErrors, []);
    await baseline.page.close();

    const historicalFeed = await openDevice(browser, { normalizedRows: true, historyLogCount: 240 });
    await historicalFeed.page.click('[data-page="logging"]');
    const historyWarmupSkip = historicalFeed.page.locator("#dailyWarmupSkip");
    if (await historyWarmupSkip.isVisible().catch(() => false)) await historyWarmupSkip.click();
    await historicalFeed.page.locator("#logCalendarTrigger").click({ force: true });
    await historicalFeed.page.locator('#logCalendarPopover [data-log-all]').evaluate(button => button.click());
    await historicalFeed.page.waitForFunction(() => /all history/i.test(document.getElementById("logCalendarTrigger")?.textContent || ""));
    await historicalFeed.page.waitForFunction(() => document.querySelectorAll("#logFeed .log-entry").length === 80, null, { timeout: 10000 });
    const historyFeedState = await historicalFeed.page.evaluate(() => ({
      renderedEntries: document.querySelectorAll("#logFeed .log-entry").length,
      footnote: document.querySelector("#logFeed .log-feed-footnote")?.textContent || "",
      writes: globalThis.__cloudWrites,
      diagnostics: globalThis.RankedCoachSyncDiagnosticsState
    }));
    assert.equal(historyFeedState.renderedEntries, 80);
    assert.match(historyFeedState.footnote, /newest 80 of 241 synced logs/i);
    assert.equal(historyFeedState.writes.some(write => write.table === "reflection_logs"), false);
    assert.equal(historyFeedState.diagnostics.lastBackendSaveMetrics.totalLogRows, 241);
    assert.equal(historyFeedState.diagnostics.lastBackendSaveMetrics.logRows, 0);
    assert.deepEqual(historicalFeed.consoleErrors, []);
    await historicalFeed.page.close();

    const quota = await openDevice(browser, { quotaLimited: true });
    assert.equal(quota.state.localCacheHasDuplicateRounds, false);
    assert.equal(quota.state.writes.some(write => write.table === "vip_app_state" && JSON.stringify(write.rows).includes("ROUND_PAYLOAD_MARKER")), false);
    assert.equal(quota.state.writes.some(write => write.table === "match_snapshots" && JSON.stringify(write.rows).includes("ROUND_PAYLOAD_MARKER")), true);
    assert.deepEqual(quota.consoleErrors, []);
    await quota.page.close();

    const partial = await openDevice(browser, { failAppStateSave: true });
    const partialTables = partial.state.writes.map(write => write.table);
    assert.equal(partialTables.includes("vip_app_state"), true);
    assert.equal(partialTables.includes("users_profiles"), true);
    assert.equal(partialTables.includes("reflection_logs"), true);
    assert.equal(partialTables.includes("match_snapshots"), true);
    assert.equal(partial.state.diagnostics.lastBackendSaveFailures.some(item => item.table === "vip_app_state" && item.status === 500), true);
    assert.deepEqual(partial.consoleErrors, []);
    await partial.page.close();
    console.log("Cross-device persistence passed: cloud hydration wins over stale local state, the live revision fallback updates an already-open device without realtime or reload, no-op saves skip normalized archive writes, one reflection saves one row, large log history renders a bounded feed, quota-limited local caches compact safely, and normalized saves continue after app-state failure.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
