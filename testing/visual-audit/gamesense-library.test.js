const assert = require("assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41787;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };

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
  return `
    globalThis.supabase = {
      createClient() {
        const query = {
          select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null }),
          then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
          upsert: async () => ({ data: null, error: null }), insert: async () => ({ data: null, error: null }),
          update() { return this; }, delete() { return this; }
        };
        return {
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", null), 0);
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

async function seed(page, profileId) {
  await page.addInitScript(id => {
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", id);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{ id, name: "Library Test", accountName: "Library Test", region: "NA", matches: [] }]));
  }, profileId);
}

async function dismissWarmup(page) {
  await page.waitForTimeout(1000);
  if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
    await page.click("#dailyWarmupSkip");
  }
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktop.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await seed(desktop, "gamesense-desktop");
    await desktop.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(desktop);

    assert.equal(await desktop.locator('.nav-btn[data-page]').count(), 5);
    const desktopNavState = await desktop.locator('.nav-btn[data-page="library"]').evaluate(button => ({
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      display: getComputedStyle(button).display,
      visibility: getComputedStyle(button).visibility,
      opacity: getComputedStyle(button).opacity,
      rect: button.getBoundingClientRect().toJSON(),
      parentRect: button.parentElement.getBoundingClientRect().toJSON(),
      ancestors: [button.parentElement, button.parentElement?.parentElement, button.closest(".app-header"), button.closest(".app")].filter(Boolean).map(element => ({ className: element.className, display: getComputedStyle(element).display, visibility: getComputedStyle(element).visibility, opacity: getComputedStyle(element).opacity })),
      matchingRules: [...document.styleSheets].flatMap(sheet => {
        try { return [...sheet.cssRules]; } catch (_error) { return []; }
      }).filter(rule => rule.selectorText && rule.style?.visibility && (() => { try { return button.matches(rule.selectorText); } catch (_error) { return false; } })()).map(rule => ({ selector: rule.selectorText, visibility: rule.style.visibility }))
    }));
    assert.ok(desktopNavState.rect.width > 0 && desktopNavState.rect.height > 0 && desktopNavState.rect.right <= desktopNavState.parentRect.right + 1, JSON.stringify(desktopNavState));
    assert.equal(await desktop.locator('.nav-btn[data-page="library"]').isVisible(), true, JSON.stringify(desktopNavState));
    await desktop.click('.nav-btn[data-page="library"]');
    await desktop.locator("#page-library.active").waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-topic-card").count(), 3);
    await desktop.click('[data-gamesense-topic="maps"]');
    assert.equal(await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').count(), 3);
    await desktop.click('[data-gamesense-item="bind"]');
    assert.equal(await desktop.locator(".gamesense-note-block").count(), 2);
    assert.equal(await desktop.locator(".gamesense-note-block").first().locator("li").count(), 3);
    assert.match(await desktop.locator(".gamesense-patch").innerText(), /Patch 12\.10/i);
    assert.equal(await desktop.locator(".gamesense-lineups a").count(), 2);
    await desktop.screenshot({ path: path.join(__dirname, "tmp", "gamesense-desktop.png"), fullPage: true });
    const renderedText = (await desktop.locator("#page-library").innerText()).toLowerCase();
    assert.equal(renderedText.includes("woohoojin"), false);
    assert.equal(renderedText.includes("dopai"), false);
    assert.equal(renderedText.includes("zleague"), false);
    assert.equal(renderedText.includes("youtube.com"), false);
    const exactMapContent = await desktop.evaluate(() => {
      const bind = globalThis.RankedCoachGamesenseMaps.find(map => map.id === "bind");
      const rendered = [...document.querySelectorAll(".gamesense-note-block:first-of-type li")].map(item => item.textContent.trim());
      return { expected: bind.macro.defense, rendered };
    });
    assert.deepEqual(exactMapContent.rendered, exactMapContent.expected);

    await desktop.click('.nav-btn[data-page="stats"]');
    await desktop.click('[data-gamesense-open="agents"]');
    await desktop.locator("#page-library.active").waitFor({ state: "visible" });
    assert.equal(await desktop.locator('.gamesense-entry-grid-agents [data-gamesense-item]').count(), 6);

    await desktop.click('.nav-btn[data-page="logging"]');
    await desktop.click("#loggingTrainingMenuBtn");
    await desktop.locator("#dailyWarmupModal.active").waitFor({ state: "visible" });
    assert.equal(await desktop.locator("[data-warmup-info]").count(), 11);
    const drill = desktop.locator('[data-warmup-drill="head-tracking"]');
    await drill.locator("[data-warmup-info]").click();
    assert.equal(await drill.locator(".daily-warmup-info-detail li").count(), 3);
    assert.equal(await drill.getAttribute("aria-pressed"), "false");
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
    await mobile.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await seed(mobile, "gamesense-mobile");
    await mobile.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(mobile);
    assert.equal(await mobile.locator(".mobile-bottom-page-btn").count(), 5);
    await dismissWarmup(mobile);
    await mobile.click('.mobile-bottom-page-btn[data-mobile-page="library"]');
    await mobile.locator("#page-library.is-current-page").waitFor({ state: "visible" });
    assert.equal(await mobile.locator(".gamesense-topic-card").count(), 3);
    const mobileMetrics = await mobile.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      labels: [...document.querySelectorAll(".mobile-bottom-page-btn")].map(button => ({ text: button.textContent.trim(), top: button.getBoundingClientRect().top, width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height, whiteSpace: getComputedStyle(button).whiteSpace }))
    }));
    assert.equal(mobileMetrics.overflow, false, JSON.stringify(mobileMetrics));
    assert.ok(mobileMetrics.labels.every(label => label.height >= 44 && label.width > 0 && label.whiteSpace === "nowrap"), JSON.stringify(mobileMetrics));
    assert.equal(new Set(mobileMetrics.labels.map(label => Math.round(label.top))).size, 1, JSON.stringify(mobileMetrics));
    await mobile.waitForTimeout(3000);
    await mobile.screenshot({ path: path.join(__dirname, "tmp", "gamesense-mobile-360x740.png"), fullPage: true });
    await mobile.close();

    console.log("Gamesense Library checks passed: five-tab navigation, exact map copy, curated references, contextual entry, warm-up details, attribution guard, and 360x740 containment.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
