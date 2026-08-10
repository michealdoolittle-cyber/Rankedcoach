"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41921;
const contentTypes = {
  ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp"
};
const owner = Object.freeze({
  id: "owner-dossier-editor-test",
  email: "michealdoolittle@gmail.com",
  app_metadata: { role: "owner" },
  user_metadata: { role: "owner", account_name: "Owner test" }
});

async function dismissTransientOverlays(page) {
  await page.evaluate(() => {
    globalThis.RankedCoachDailyEntrance?.skipAll?.();
    document.querySelectorAll(".lens-modal-overlay, .app-loading-veil, #dailyWarmupModal").forEach(element => {
      element.classList.remove("active");
      element.setAttribute("aria-hidden", "true");
      element.style.setProperty("display", "none", "important");
    });
    document.body.classList.remove("modal-open", "is-modal-open", "has-active-modal", "daily-entrance-motion-active");
  });
}

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

function ownerSupabaseStub(user) {
  return `
    const rankedCoachStubUser = ${JSON.stringify(user)};
    globalThis.supabase = {
      createClient() {
        const query = {
          select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
          maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }),
          then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
          upsert: async () => ({ data: null, error: null }), insert: async () => ({ data: null, error: null }),
          update() { return this; }, delete() { return this; }
        };
        const session = { user: rankedCoachStubUser };
        return {
          auth: {
            getSession: async () => ({ data: { session }, error: null }),
            getUser: async () => ({ data: { user: rankedCoachStubUser }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", session), 0);
              return { data: { subscription: { unsubscribe() {} } } };
            },
            signOut: async () => ({ error: null })
          },
          from() { return Object.create(query); },
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
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
      contentType: "text/javascript",
      body: ownerSupabaseStub(owner)
    }));
    await page.addInitScript(() => {
      localStorage.setItem("valtracker_active_profile_id", "owner-dossier-profile");
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
        id: "owner-dossier-profile", name: "Owner dossier", accountName: "Owner test", region: "NA", matches: []
      }]));
      localStorage.setItem("valtracker_logs_v1", "[]");
      localStorage.setItem("valtracker_log_entries_v1", "[]");
      globalThis.RankedCoachGamesenseDossierTextOverrides = {
        agents: { jett: { "fundamentals.0": "Owner-applied Jett narrative." } },
        maps: { bind: { "compSample.note": "Owner-applied Bind composition note." } },
        weapons: {
          vandal: {
            focus: "Owner-applied Vandal focus.",
            roundConversionNotice: "Owner-applied Vandal conversion context."
          }
        }
      };
    });
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => globalThis.RankedCoachAuthBridge?.getUser?.()?.email === "michealdoolittle@gmail.com", null, { timeout: 15000 });
    await dismissTransientOverlays(page);
    await page.locator('.nav-btn[data-page="library"]').click();
    await page.locator("#page-library.active").waitFor({ state: "visible" });

    await page.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("agents", "jett"));
    const agentToggle = page.locator('[data-gamesense-dossier-text-toggle="agents:jett"]');
    await agentToggle.waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    await dismissTransientOverlays(page);
    await agentToggle.click();
    await page.locator('[data-gamesense-dossier-text-field^="agents:jett:"]').first().waitFor({ state: "visible" });
    const agentFields = await page.locator('[data-gamesense-dossier-text-field^="agents:jett:"]').evaluateAll(fields => fields.map(field => field.dataset.gamesenseDossierTextField));
    assert.ok(agentFields.some(field => field.includes(":abilities.")), "Jett needs editable ability fields after its direct toggle.");
    assert.ok(agentFields.some(field => field.includes(":fundamentals.")), `Agent fundamentals must be editable: ${JSON.stringify(agentFields)}`);
    assert.ok(agentFields.some(field => field.includes(":lore.")), `Agent lore must be editable: ${JSON.stringify(agentFields)}`);
    assert.ok(agentFields.some(field => field.includes(":patchHistory.")), `Agent gameplay history must be editable: ${JSON.stringify(agentFields)}`);
    assert.equal(
      await page.locator('[data-gamesense-dossier-text-field="agents:jett:fundamentals.0"]').inputValue(),
      "Owner-applied Jett narrative.",
      "Persisted agent narrative overrides must be applied before the editor renders."
    );

    // Deliberately race an edit-change against two animated navigations. This
    // reproduces the real blur/change-during-view-transition path that used
    // to leave a stale commit callback targeting a superseded Library render.
    const raceResult = await page.evaluate(async () => {
      const field = document.querySelector('[data-gamesense-dossier-text-field="agents:jett:fundamentals.0"]');
      field?.focus();
      globalThis.RankedCoachGamesenseLibrary.open("maps", "bind");
      field?.dispatchEvent(new Event("change", { bubbles: true }));
      globalThis.RankedCoachGamesenseLibrary.open("maps", "ascent");
      await new Promise(resolve => setTimeout(resolve, 420));
      return {
        transition: document.documentElement.dataset.gamesenseTransition || "",
        mapTitle: document.querySelector(".gamesense-map-detail-head h2")?.textContent?.trim() || ""
      };
    });
    assert.equal(raceResult.transition, "", `The final library transition must settle after rapid edit navigation: ${JSON.stringify(raceResult)}`);
    assert.match(raceResult.mapTitle, /Ascent/i, `The final navigation must win the render race: ${JSON.stringify(raceResult)}`);

    // Bind is one of the fully-authored map dossiers. It gives this coverage
    // check every map text surface (macro plans, comps, weapon reads, lineups,
    // and labels) without inventing fields for an un-authored map.
    await page.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("maps", "bind"));
    const mapToggle = page.locator('[data-gamesense-dossier-text-toggle="maps:bind"]');
    await mapToggle.waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    await dismissTransientOverlays(page);
    await mapToggle.click();
    await page.locator('[data-gamesense-dossier-text-field^="maps:bind:"]').first().waitFor({ state: "visible" });
    const mapFields = await page.locator('[data-gamesense-dossier-text-field^="maps:bind:"]').evaluateAll(fields => fields.map(field => field.dataset.gamesenseDossierTextField));
    assert.ok(mapFields.some(field => field.includes(":__tips.attack.")), `Attack/defense map tips must be editable as an exportable collection: ${JSON.stringify(mapFields)}`);
    assert.ok(mapFields.some(field => field.includes(":compSample.note")), `Composition source text must be editable: ${JSON.stringify(mapFields)}`);
    assert.ok(mapFields.some(field => field.includes(":weaponSuggestions.")), `Weapon suggestion detail must be editable: ${JSON.stringify(mapFields)}`);
    assert.ok(mapFields.some(field => field.includes(":lineupLinks.")), `Lineup labels must be editable: ${JSON.stringify(mapFields)}`);
    assert.ok(mapFields.some(field => field.includes(":callouts.")), `Map callout labels must remain editable: ${JSON.stringify(mapFields)}`);
    assert.equal(
      await page.locator('[data-gamesense-dossier-text-field="maps:bind:compSample.note"]').inputValue(),
      "Owner-applied Bind composition note.",
      "Persisted map narrative overrides must be applied before the editor renders."
    );

    // A tip collection can now be curated as a collection, not only edited
    // one string at a time. Use Ascent's empty authored attack tab to verify
    // a new tile, its editable fields, export shape, and removal end to end.
    await page.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("maps", "ascent"));
    const ascentToggle = page.locator('[data-gamesense-dossier-text-toggle="maps:ascent"]');
    await ascentToggle.waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    await ascentToggle.click();
    const tipAdd = page.locator('[data-gamesense-tip-add="ascent"]');
    await tipAdd.waitFor({ state: "visible" });
    await tipAdd.click();
    const newTipLabel = page.locator('[data-gamesense-dossier-text-field="maps:ascent:__tips.attack.0.label"]');
    await newTipLabel.waitFor({ state: "visible" });
    await newTipLabel.fill("Entry timing");
    await newTipLabel.press("Tab");
    await page.waitForFunction(() => document.querySelector('[data-gamesense-dossier-text-field="maps:ascent:__tips.attack.0.label"]')?.value === "Entry timing");
    await page.locator('[data-gamesense-dossier-text-export="maps:ascent"]').click();
    const tipExport = JSON.parse(await page.locator('[data-gamesense-dossier-text-export-output]').inputValue());
    assert.equal(tipExport.maps.ascent["tips.attack"][0].label, "Entry timing", "Added tip collections must export through the established override format.");
    await page.locator('[data-gamesense-tip-delete="ascent"]').click();
    assert.equal(await page.locator('[data-gamesense-tip-delete="ascent"]').count(), 0, "Removing a tip must remove only that tip tile.");

    await page.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons", "rifles"));
    await page.locator('[data-gamesense-weapon="vandal"]').click();
    await page.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    const weaponToggle = page.locator('[data-gamesense-dossier-text-toggle="weapons:vandal"]');
    await weaponToggle.waitFor({ state: "visible" });
    await page.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    await dismissTransientOverlays(page);
    const weaponToken = await weaponToggle.getAttribute("data-gamesense-dossier-text-toggle");
    await weaponToggle.click();
    await page.locator(`[data-gamesense-dossier-text-field^="${weaponToken}:"]`).first().waitFor({ state: "visible" });
    const weaponFields = await page.locator(`[data-gamesense-dossier-text-field^="${weaponToken}:"]`).evaluateAll(fields => fields.map(field => field.dataset.gamesenseDossierTextField));
    assert.ok(weaponFields.some(field => field.includes(":focus")), "The selected weapon needs editable dossier fields after its direct toggle.");
    assert.ok(weaponFields.some(field => field.includes(":whenToUse.")), `Weapon usage notes must be editable: ${JSON.stringify(weaponFields)}`);
    assert.ok(weaponFields.some(field => field.includes(":howToUse.")), `Weapon mechanics notes must be editable: ${JSON.stringify(weaponFields)}`);
    assert.ok(weaponFields.some(field => field.includes(":patchHistory.")), `Weapon history must be editable: ${JSON.stringify(weaponFields)}`);
    assert.ok(weaponFields.some(field => field.includes(":roundConversionNotice")), `Weapon conversion-context copy must be editable: ${JSON.stringify(weaponFields)}`);
    assert.equal(
      await page.locator('[data-gamesense-dossier-text-field="weapons:vandal:focus"]').inputValue(),
      "Owner-applied Vandal focus.",
      "Persisted weapon narrative overrides must be applied before the editor renders."
    );
    assert.equal(
      await page.locator('[data-gamesense-dossier-text-field="weapons:vandal:roundConversionNotice"]').inputValue(),
      "Owner-applied Vandal conversion context.",
      "Weapon notice overrides must be applied before the editor renders."
    );
    assert.deepEqual(issues, []);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Owner map, agent, and weapon dossier text editor coverage works across every authored text section.");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
