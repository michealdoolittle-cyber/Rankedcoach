const assert = require("assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41791;

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/") url = "/index.html";
      const file = path.join(root, url);
      if (!file.startsWith(root)) { response.writeHead(403); return response.end("Forbidden"); }
      fs.readFile(file, (error, data) => {
        if (error) { response.writeHead(404); return response.end("Not found"); }
        const type = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" }[path.extname(file).toLowerCase()] || "application/octet-stream";
        response.writeHead(200, { "Content-Type": type });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `globalThis.supabase={createClient(){const query={select(){return this},eq(){return this},order(){return this},limit(){return this},maybeSingle:async()=>({data:null,error:null}),single:async()=>({data:null,error:null}),then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)},upsert:async()=>({data:null,error:null}),insert:async()=>({data:null,error:null}),update(){return this},delete(){return this}};return{auth:{getSession:async()=>({data:{session:null},error:null}),getUser:async()=>({data:{user:null},error:null}),onAuthStateChange(callback){setTimeout(()=>callback("INITIAL_SESSION",null),0);return{data:{subscription:{unsubscribe(){}}}}},signOut:async()=>({error:null})},from(){return Object.create(query)},functions:{invoke:async()=>({data:null,error:null})}}}};`;
}

async function dismissWarmup(page) {
  await page.waitForTimeout(700);
  if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) await page.click("#dailyWarmupSkip");
}

async function boot(page) {
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
  await dismissWarmup(page);
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
  await dismissWarmup(page);
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("console", message => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
    page.on("pageerror", error => errors.push(`page: ${error.message}`));
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await page.route("https://fonts.googleapis.com/**", route => route.fulfill({ contentType: "text/css", body: "" }));
    await page.route("https://fonts.gstatic.com/**", route => route.abort());
    await page.addInitScript(() => {
      if (sessionStorage.getItem("layout-test-seeded") === "true") return;
      const profiles = [
        { id: "layout-one", name: "Layout One", accountName: "Guest", riotId: "LayoutOne#NA1", region: "NA", matches: [], themeKey: "default", bannerStyle: "rc-redline" },
        { id: "layout-two", name: "Layout Two", accountName: "Guest", riotId: "LayoutTwo#NA2", region: "NA", matches: [], themeKey: "default" }
      ];
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", "layout-one");
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify(profiles));
      sessionStorage.setItem("layout-test-seeded", "true");
    });
    await page.addInitScript(() => {
      const profileId = new URLSearchParams(location.search).get("profile");
      if (profileId) localStorage.setItem("valtracker_active_profile_id", profileId);
    });
    await boot(page);

    assert.equal(await page.locator("body").getAttribute("data-layout-style"), null);
    assert.equal(await page.locator("body").getAttribute("data-layout-font-active"), null);
    assert.equal(await page.locator(".app-header").getAttribute("data-profile-banner"), "rc-redline");
    const defaultFocus = await page.locator(".weekly-focus-card").evaluate(card => ({ clip: getComputedStyle(card).clipPath, font: getComputedStyle(card.querySelector(".card-title")).fontFamily }));
    const defaultCopyFont = await page.locator(".weekly-focus-card .card-sub").evaluate(copy => getComputedStyle(copy).fontFamily);
    assert.equal(defaultFocus.clip, "none");

    await page.click("#profileDropdownToggle");
    await page.click("#pdOpenSettings");
    await page.click('[data-profile-tab="layoutStyle"]');
    assert.equal(await page.locator("[data-layout-style-card]").count(), 11);
    const excludedBefore = await page.evaluate(() => ({
      navClip: getComputedStyle(document.querySelector(".app-header")).clipPath,
      navBackground: getComputedStyle(document.querySelector(".app-header")).backgroundImage,
      chartClip: getComputedStyle(document.querySelector(".rr-chart-card")).clipPath,
      chartBackground: getComputedStyle(document.querySelector(".rr-chart-card")).backgroundImage
    }));
    for (const style of ["honeycomb", "chevronscan", "aperturecut", "scopevignette", "hazardedge", "diamondfacet", "bladewedge", "ribbonbanner", "monolithslab", "pixeldialog"]) {
      await page.click(`[data-layout-style-card="${style}"]`);
      assert.equal(await page.locator("body").getAttribute("data-layout-style"), style);
      const bounds = await page.locator(".weekly-focus-card").evaluate(card => {
        const cardRect = card.getBoundingClientRect();
        const content = [...card.querySelectorAll(".card-title,.card-sub,.card-pill,.weekly-focus-pill")]
          .map(element => element.getBoundingClientRect())
          .find(rect => rect.width > 0 && rect.height > 0);
        return {
          card: cardRect.toJSON(),
          content: content?.toJSON() || null,
          horizontalOverflow: card.scrollWidth > card.clientWidth + 1,
          verticalOverflow: card.scrollHeight > card.clientHeight + 1
        };
      });
      assert.equal(bounds.horizontalOverflow, false, `${style}: ${JSON.stringify(bounds)}`);
      assert.ok(bounds.content && bounds.content.left >= bounds.card.left - 1 && bounds.content.right <= bounds.card.right + 1 && bounds.content.top >= bounds.card.top - 1 && bounds.content.bottom <= bounds.card.bottom + 1, `${style}: ${JSON.stringify(bounds)}`);
      const excludedAfter = await page.evaluate(() => ({
        navClip: getComputedStyle(document.querySelector(".app-header")).clipPath,
        navBackground: getComputedStyle(document.querySelector(".app-header")).backgroundImage,
        chartClip: getComputedStyle(document.querySelector(".rr-chart-card")).clipPath,
        chartBackground: getComputedStyle(document.querySelector(".rr-chart-card")).backgroundImage
      }));
      assert.deepEqual(excludedAfter, excludedBefore, `${style} changed an excluded surface`);
    }
    await page.click('[data-layout-style-card="honeycomb"]');
    assert.equal(await page.locator("body").getAttribute("data-layout-style"), "honeycomb");
    assert.equal(await page.locator("body").getAttribute("data-layout-font-active"), "true");
    assert.notEqual(await page.locator(".weekly-focus-card").evaluate(card => getComputedStyle(card).clipPath), "none");
    assert.match(await page.locator(".weekly-focus-card .card-title").evaluate(title => getComputedStyle(title).fontFamily), /Orbitron/i);
    assert.equal(await page.locator(".app-header").getAttribute("data-profile-banner"), "rc-redline");

    await page.uncheck("#editProfileLayoutStyleFontToggle");
    assert.equal(await page.locator("body").getAttribute("data-layout-font-active"), null);
    await page.selectOption("#editProfileLayoutFont", "ibmplexmono");
    assert.equal(await page.locator("body").getAttribute("data-layout-font"), "ibmplexmono");
    assert.match(await page.locator(".weekly-focus-card .card-title").evaluate(title => getComputedStyle(title).fontFamily), /IBM Plex Mono/i);
    assert.equal(await page.locator(".weekly-focus-card .card-sub").evaluate(copy => getComputedStyle(copy).fontFamily), defaultCopyFont);
    await page.locator('[data-profile-panel="layoutStyle"]').screenshot({ path: path.join(__dirname, "tmp", "layout-style-gallery-desktop.png") });
    await page.click("#editProfileSave");
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(__dirname, "tmp", "layout-style-honeycomb-home.png"), fullPage: true });

    const savedProfiles = await page.evaluate(() => JSON.parse(localStorage.getItem("valtracker_profiles_v1")));
    assert.equal(savedProfiles.length, 2, JSON.stringify(savedProfiles.map(profile => ({ id: profile.id, themeKey: profile.themeKey }))));
    const saved = savedProfiles.find(profile => profile.id === "layout-one");
    assert.equal(saved.layoutStyle, "honeycomb");
    assert.equal(saved.layoutStyleCustomFont, false);
    assert.equal(saved.layoutFont, "ibmplexmono");

    await page.reload({ waitUntil: "domcontentloaded" });
    await dismissWarmup(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    assert.equal(await page.locator("body").getAttribute("data-layout-style"), "honeycomb");
    assert.equal(await page.locator("body").getAttribute("data-layout-font"), "ibmplexmono");

    await page.goto(`http://127.0.0.1:${port}/?profile=layout-two`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    assert.equal(await page.locator("#profileRiotId").innerText(), "LayoutTwo\n#NA2");
    assert.equal(await page.locator("body").getAttribute("data-layout-style"), null);
    assert.equal(await page.locator("body").getAttribute("data-layout-font-active"), null);
    await page.click("#profileDropdownToggle");
    await page.click("#pdOpenSettings");
    await page.click('[data-profile-tab="layoutStyle"]');
    await page.click('[data-layout-style-card="diamondfacet"]');
    await page.evaluate(() => {
      document.body.dataset.theme = "omen-night";
      const root = document.documentElement;
      root.style.setProperty("--card", "#090a1a");
      root.style.setProperty("--card-2", "#151129");
      root.style.setProperty("--text", "#f5f3ff");
      root.style.setProperty("--muted", "#c4b5fd");
      root.style.setProperty("--accent", "#8b5cf6");
      root.style.setProperty("--accent-2", "#06b6d4");
    });
    assert.equal(await page.locator("body").getAttribute("data-theme"), "omen-night");
    assert.equal(await page.locator("body").getAttribute("data-layout-style"), "diamondfacet");
    await page.locator("#editProfileModal").evaluate(modal => modal.style.display = "none");

    await page.goto(`http://127.0.0.1:${port}/?profile=layout-one`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    assert.equal(await page.locator("body").getAttribute("data-layout-style"), "honeycomb");
    assert.equal(await page.locator(".app-header").getAttribute("data-profile-banner"), "rc-redline");
    assert.deepEqual(errors, []);
    console.log("layout style persistence and scope checks passed");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
