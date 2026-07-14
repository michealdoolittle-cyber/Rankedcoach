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

function supabaseStub() {
  const cloudProfile = {
    id: "cloud-profile",
    name: "Cloud Canonical",
    accountName: "Cloud Player",
    region: "NA",
    riotId: "",
    themeKey: "radiant-focus",
    profileBorder: "hex",
    matches: []
  };
  const cloudLog = {
    id: "cloud-log-1",
    profileId: "cloud-profile",
    source: "manual",
    createdAt: "2026-07-13T14:00:00.000Z",
    agent: "Sova",
    map: "Haven",
    focus: "Information Gathering",
    rating: 4,
    notes: "Cloud reflection"
  };
  return `
    globalThis.__cloudWrites = [];
    globalThis.supabase = {
      createClient() {
        const user = { id: "cross-device-user", email: "sync@example.com", user_metadata: { account_name: "Cloud Player" } };
        const appState = ${JSON.stringify({
          user_id: "cross-device-user",
          active_profile_id: "cloud-profile",
          profiles_json: [cloudProfile],
          log_entries_json: [cloudLog],
          theme_builder_json: {},
          theme_builder_ui_json: {}
        })};
        function query(table) {
          return {
            table,
            select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, in() { return this; },
            update() { return this; }, delete() { return this; },
            maybeSingle() {
              if (table === "vip_app_state") return new Promise(resolve => setTimeout(() => resolve({ data: appState, error: null }), 900));
              return Promise.resolve({ data: null, error: null });
            },
            single() { return Promise.resolve({ data: null, error: null }); },
            upsert(payload) {
              const rows = Array.isArray(payload) ? payload : [payload];
              globalThis.__cloudWrites.push({ table, rows: structuredClone(rows) });
              return Promise.resolve({ data: null, error: null });
            },
            insert() { return Promise.resolve({ data: null, error: null }); },
            then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); }
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

async function openDevice(browser, { staleLocal = false } = {}) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => consoleErrors.push(error.message));
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
  await page.addInitScript(hasStaleLocal => {
    localStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "account");
    if (!hasStaleLocal) return;
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
  }, staleLocal);
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
    activeId: localStorage.getItem("valtracker_active_profile_id")
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
    console.log("Cross-device persistence passed: delayed cloud hydration wins over stale local state on both devices without an early overwrite.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
