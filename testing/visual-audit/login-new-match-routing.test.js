"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41844;
const puuid = "route-new-match-player";
const user = { id: "route-new-match-user", email: "route@example.com", user_metadata: { account_name: "Route Test" } };
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function json(response, payload = {}) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url.startsWith("/api/content/")) return json(response, { items: [], matches: {}, sections: [] });
      if (url === "/favicon.ico") return response.end();
      const relative = url === "/" ? "/index.html" : url;
      const file = path.join(root, relative);
      if (!file.startsWith(root)) return response.writeHead(403).end("Forbidden");
      fs.readFile(file, (error, data) => {
        if (error) return response.writeHead(404).end("Not found");
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `
    globalThis.supabase = {
      createClient() {
        function query(table) {
          return {
            table,
            select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, in() { return this; },
            update() { return this; }, delete() { return this; },
            maybeSingle() { return Promise.resolve({ data: table === "vip_app_state" ? globalThis.__routingRemoteState : null, error: null }); },
            upsert(payload) { if (table === "vip_app_state") globalThis.__routingRemoteState = { ...globalThis.__routingRemoteState, ...(Array.isArray(payload) ? payload[0] : payload) }; return Promise.resolve({ data: null, error: null }); },
            insert() { return Promise.resolve({ data: null, error: null }); },
            then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); }
          };
        }
        return {
          auth: {
            getSession: async () => ({ data: { session: { user: ${JSON.stringify(user)} } }, error: null }),
            getUser: async () => ({ data: { user: ${JSON.stringify(user)} }, error: null }),
            onAuthStateChange(callback) { setTimeout(() => callback("INITIAL_SESSION", { user: ${JSON.stringify(user)} }), 0); return { data: { subscription: { unsubscribe() {} } } }; },
            signOut: async () => ({ error: null }),
            mfa: { getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal1" } }), listFactors: async () => ({ data: { all: [] } }) }
          },
          from: query,
          functions: { invoke: async () => ({ data: null, error: null }) }
        };
      }
    };
  `;
}

function v4Match() {
  return {
    metadata: {
      match_id: "login-route-match-1",
      started_at: new Date(Date.now() - 60000).toISOString(),
      season: { id: "season-2026-a4", short: "e26a4" },
      map: { name: "Ascent" }
    },
    players: [{
      puuid,
      team_id: "Blue",
      agent: { id: "sova-id", name: "Sova" },
      tier: { id: 18, name: "Platinum 3" },
      stats: { kills: 18, deaths: 12, assists: 8, score: 4800, damage: { dealt: 3200 }, headshots: 14, bodyshots: 20, legshots: 2 }
    }],
    teams: [{ team_id: "Blue", won: true, rounds: { won: 13, lost: 8 } }, { team_id: "Red", won: false, rounds: { won: 8, lost: 13 } }],
    rounds: [],
    kills: []
  };
}

async function openSignedInPage(browser, remoteState) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => consoleErrors.push(error.message));
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
  await page.route("**/api/henrik/health", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, configured: true }) }));
  await page.route("**/api/henrik/account", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { puuid, name: "Route", tag: "TEST" } }) }));
  await page.route("**/api/henrik/mmr-history-live", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ account: { puuid }, history: [{ match_id: "login-route-match-1", tier: { id: 18, name: "Platinum 3" }, rr: 58, last_change: 18, date: new Date().toISOString() }] }] }) }));
  await page.route("**/api/henrik/mmr-history", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [{ match_id: "login-route-match-1", tier: { id: 18, name: "Platinum 3" }, rr: 58, last_change: 18, date: new Date().toISOString() }] }) }));
  await page.route("**/api/henrik/matches", route => {
    const body = JSON.parse(route.request().postData() || "{}");
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: Number(body.start) === 0 ? [v4Match()] : [] }) });
  });
  await page.route("**/api/henrik/raw", route => {
    const body = JSON.parse(route.request().postData() || "{}");
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: { matchInfo: { matchId: body.matchId }, players: [] } }) });
  });
  await page.addInitScript(({ state }) => {
    localStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "auth");
    globalThis.__routingRemoteState = state;
  }, { state: remoteState });
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.getElementById("loginInitOverlay")?.getAttribute("aria-hidden") === "true", null, { timeout: 30000 });
  return { page, consoleErrors };
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const initialProfile = {
      id: "login-route-profile",
      name: "Route Test",
      accountName: "Route Test",
      riotId: "Route#TEST",
      region: "NA",
      puuid,
      lastWarmupPromptDate: todayKey(),
      matches: []
    };
    const imported = await openSignedInPage(browser, {
      user_id: user.id,
      active_profile_id: initialProfile.id,
      profiles_json: [initialProfile],
      log_entries_json: [],
      theme_builder_json: {},
      theme_builder_ui_json: {},
      updated_at: "2026-08-04T12:00:00.000Z"
    });
    await imported.page.waitForFunction(() => document.getElementById("page-logging")?.classList.contains("active"), null, { timeout: 15000 });
    const importedState = await imported.page.evaluate(() => ({
      page: document.querySelector(".page.active")?.id || "",
      map: document.getElementById("logMap")?.value || "",
      agent: document.getElementById("logAgentDisplay")?.getAttribute("data-agent") || "",
      profiles: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]")
    }));
    assert.equal(importedState.page, "page-logging");
    assert.equal(importedState.map, "Ascent");
    assert.equal(importedState.agent, "Sova");
    assert.deepEqual(imported.consoleErrors, []);
    await imported.page.close();

    const retainedProfile = importedState.profiles.find(profile => profile.id === initialProfile.id);
    const noNew = await openSignedInPage(browser, {
      user_id: user.id,
      active_profile_id: initialProfile.id,
      profiles_json: [retainedProfile],
      log_entries_json: [],
      theme_builder_json: {},
      theme_builder_ui_json: {},
      updated_at: "2026-08-04T12:02:00.000Z"
    });
    await noNew.page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await noNew.page.waitForTimeout(500);
    assert.equal(await noNew.page.evaluate(() => document.querySelector(".page.active")?.id || ""), "page-home", "no-new-match login must preserve the default active page");
    assert.deepEqual(noNew.consoleErrors, []);
    await noNew.page.close();
    console.log("Login new-match routing passed: a genuine import opens its prepared Logging reflection, while a no-new-match login stays on Home.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
