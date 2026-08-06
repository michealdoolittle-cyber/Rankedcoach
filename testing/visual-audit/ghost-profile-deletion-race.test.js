"use strict";

// Regression: a stale device must not restore a profile another device deleted
// just because it saves an unrelated preference afterwards.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41799;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };
let remoteState = null;
let cleanupEvents = [];

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/__ghost_profile_remote") {
        if (request.method === "GET") {
          response.writeHead(200, { "Content-Type": "application/json" });
          return response.end(JSON.stringify(remoteState));
        }
        let body = "";
        request.on("data", chunk => { body += chunk; });
        request.on("end", () => {
          const payload = JSON.parse(body || "{}");
          if (payload.action === "upsert" && payload.table === "vip_app_state") {
            const row = Array.isArray(payload.payload) ? payload.payload[0] : payload.payload;
            remoteState = { ...remoteState, ...row, updated_at: new Date().toISOString() };
          }
          if (payload.action === "delete") cleanupEvents.push({ table: payload.table, filters: payload.filters || {} });
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ data: payload.action === "delete" ? [] : null, error: null }));
        });
        return;
      }
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
  return `
    globalThis.supabase = {
      createClient() {
        const user = { id: "ghost-profile-user", email: "ghost@example.com", user_metadata: { account_name: "Ghost Test" } };
        const request = (method, payload) => fetch("/__ghost_profile_remote", {
          method,
          headers: { "Content-Type": "application/json" },
          body: payload ? JSON.stringify(payload) : undefined
        }).then(response => response.json());
        function query(table) {
          const filters = {};
          let action = "select";
          return {
            select() { action = "select"; return this; },
            eq(key, value) { filters[key] = value; return this; },
            order() { return this; }, limit() { return this; }, in() { return this; },
            update() { action = "update"; return this; },
            delete() { action = "delete"; return this; },
            maybeSingle() {
              if (table === "vip_app_state") return request("GET").then(data => ({ data, error: null }));
              return Promise.resolve({ data: null, error: null });
            },
            single() { return Promise.resolve({ data: null, error: null }); },
            upsert(payload) {
              return request("POST", { action: "upsert", table, payload });
            },
            insert() { return Promise.resolve({ data: null, error: null }); },
            then(resolve, reject) {
              if (action === "delete") return request("POST", { action, table, filters }).then(resolve, reject);
              return Promise.resolve({ data: [], error: null }).then(resolve, reject);
            }
          };
        }
        return {
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", { user }), 30);
              return { data: { subscription: { unsubscribe() {} } } };
            },
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

async function openDevice(context, errors) {
  const page = await context.newPage();
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelectorAll("#profileList .profile-row").length === 2, null, { timeout: 15000 });
  return page;
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  let deletingContext = null;
  let staleContext = null;
  const errors = [];
  try {
    remoteState = {
      user_id: "ghost-profile-user",
      active_profile_id: "real-profile",
      profiles_json: [
        { id: "real-profile", name: "Real Profile", accountName: "Ghost Test", region: "NA", matches: [] },
        { id: "ghost-profile", name: "Ghost Profile", accountName: "Ghost Test", region: "NA", matches: [] }
      ],
      log_entries_json: [],
      theme_builder_json: {},
      theme_builder_ui_json: {},
      updated_at: "2026-08-06T12:00:00.000Z"
    };
    cleanupEvents = [];
    deletingContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    staleContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const initializeDevice = context => context.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem("valtracker_entry_choice_v1", "account");
    });
    await initializeDevice(deletingContext);
    await initializeDevice(staleContext);

    const deletingDevice = await openDevice(deletingContext, errors);
    const staleDevice = await openDevice(staleContext, errors);

    await deletingDevice.locator(".profile-delete-btn").nth(1).evaluate(button => button.click());
    await deletingDevice.locator(".profile-delete-confirm-remove").evaluate(button => button.click());
    await deletingDevice.waitForFunction(async () => {
      const remote = await fetch("/__ghost_profile_remote").then(response => response.json());
      return Array.isArray(remote?.profiles_json)
        && remote.profiles_json.some(profile => profile?.id === "ghost-profile" && profile.__rankedCoachProfileDeletionTombstone === true);
    }, null, { timeout: 15000 });

    // Simulate an unrelated stale-device preference save by selecting its
    // already-active profile. It still serializes the stale in-memory list.
    await staleDevice.locator(".profile-select-btn").first().evaluate(button => button.click());
    await staleDevice.waitForTimeout(1000);

    const state = await staleDevice.evaluate(() => ({
      localProfiles: JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]").map(profile => profile.id)
    }));
    assert.deepEqual(state.localProfiles, ["real-profile"]);
    assert.equal(remoteState.profiles_json.some(profile => profile?.id === "ghost-profile" && !profile.__rankedCoachProfileDeletionTombstone), false);
    assert.equal(remoteState.profiles_json.some(profile => profile?.id === "ghost-profile" && profile.__rankedCoachProfileDeletionTombstone), true);
    assert.equal(cleanupEvents.filter(event => ["match_snapshots", "reflection_logs"].includes(event.table)).length, 2);
    assert.deepEqual(errors, []);
    console.log("Ghost profile deletion race passed: a stale unrelated save retained the authoritative deletion tombstone and did not restore the profile.");
  } finally {
    await deletingContext?.close();
    await staleContext?.close();
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
