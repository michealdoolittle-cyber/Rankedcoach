"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41924;
const contentTypes = {
  ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp"
};
const user = Object.freeze({
  id: "theme-handoff-user",
  email: "theme-handoff@example.test",
  app_metadata: {},
  user_metadata: { account_name: "Theme handoff" }
});

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
      if (pathname.startsWith("/api/content/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {}, sections: [] }));
        return;
      }
      const filePath = path.join(root, pathname === "/" ? "index.html" : pathname);
      if (!filePath.startsWith(root)) return response.writeHead(403).end("Forbidden");
      fs.readFile(filePath, (error, data) => {
        response.writeHead(error ? 404 : 200, { "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
        response.end(error ? "Not found" : data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function signedInSupabaseStub(remoteState) {
  return `
    const rcThemeUser = ${JSON.stringify(user)};
    const rcThemeState = ${JSON.stringify(remoteState)};
    const rcDelay = ms => new Promise(resolve => setTimeout(resolve, ms));
    globalThis.supabase = {
      createClient() {
        const queryFor = table => ({
          select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; }, in() { return this; },
          async maybeSingle() {
            if (table === "vip_app_state") {
              await rcDelay(380);
              return { data: rcThemeState, error: null };
            }
            return { data: null, error: null };
          },
          async single() { return this.maybeSingle(); },
          then(resolve, reject) { return Promise.resolve({ data: [], error: null }).then(resolve, reject); },
          async upsert() { return { data: null, error: null }; },
          async insert() { return { data: null, error: null }; },
          update() { return this; }, delete() { return this; }
        });
        const session = { user: rcThemeUser };
        return {
          auth: {
            getSession: async () => ({ data: { session }, error: null }),
            getUser: async () => ({ data: { user: rcThemeUser }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", session), 0);
              return { data: { subscription: { unsubscribe() {} } } };
            },
            signOut: async () => ({ error: null })
          },
          from(table) { return queryFor(table); },
          functions: { invoke: async () => ({ data: null, error: null }) }
        };
      }
    };
  `;
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const issues = [];
  page.on("console", message => { if (message.type() === "error") issues.push(message.text()); });
  page.on("pageerror", error => issues.push(error.message));
  try {
    const remoteProfile = {
      id: "theme-handoff-profile",
      name: "Theme Handoff",
      accountName: "Theme handoff",
      region: "NA",
      themeKey: "royal-purple",
      layoutShape: "honeycomb",
      layoutTexture: "default",
      matches: []
    };
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
      contentType: "text/javascript",
      body: signedInSupabaseStub({
        updated_at: "2026-08-07T12:00:00.000Z",
        active_profile_id: remoteProfile.id,
        profiles_json: [remoteProfile],
        log_entries_json: [],
        theme_builder_json: {},
        theme_builder_ui_json: {}
      })
    }));
    await page.addInitScript(() => {
      const localProfile = {
        id: "theme-handoff-profile",
        name: "Theme Handoff",
        accountName: "Theme handoff",
        region: "NA",
        themeKey: "default",
        layoutShape: "default",
        layoutTexture: "default",
        matches: []
      };
      localStorage.setItem("valtracker_entry_choice_v1", "signed-in");
      localStorage.setItem("valtracker_active_profile_id", localProfile.id);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([localProfile]));
      localStorage.setItem("valtracker_log_entries_v2", "[]");
      globalThis.__signedInThemeSamples = [];
      const sample = () => {
        const root = document.documentElement;
        globalThis.__signedInThemeSamples.push({
          booting: root.classList.contains("app-booting"),
          bodyTheme: document.body?.dataset?.theme || "",
      layout: document.body?.dataset?.layoutShape || ""
        });
        if (globalThis.__signedInThemeSamples.length < 180) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await page.waitForTimeout(120);
    const result = await page.evaluate(() => ({
      theme: document.body.dataset.theme || "",
      samples: globalThis.__signedInThemeSamples || []
    }));
    const firstVisible = result.samples.find(sample => sample.booting === false);
    assert.equal(result.theme, "royal-purple", JSON.stringify(result));
    assert.deepEqual(firstVisible, { booting: false, bodyTheme: "royal-purple", layout: "honeycomb" }, JSON.stringify(result));
    assert.deepEqual(issues, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Signed-in remote theme/layout applies before the boot guard releases.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
