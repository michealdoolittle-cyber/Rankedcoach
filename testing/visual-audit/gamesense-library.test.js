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
    await desktop.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await dismissWarmup(desktop);
    await desktop.locator('.nav-btn[data-page="library"]').waitFor({ state: "visible", timeout: 10000 });

    assert.equal(await desktop.locator('.nav-btn[data-page]').count(), 5);
    const desktopNavState = await desktop.locator('.nav-btn[data-page="library"]').evaluate(button => ({
      htmlClass: document.documentElement.className,
      bodyClass: document.body.className,
      display: getComputedStyle(button).display,
      visibility: getComputedStyle(button).visibility,
      opacity: getComputedStyle(button).opacity,
      style: button.getAttribute("style"),
      animations: button.getAnimations().map(animation => ({ playState: animation.playState, currentTime: animation.currentTime, effect: animation.effect?.getComputedTiming?.() })),
      rect: button.getBoundingClientRect().toJSON(),
      parentRect: button.parentElement.getBoundingClientRect().toJSON(),
      ancestors: [button.parentElement, button.parentElement?.parentElement, button.closest(".app-header"), button.closest(".app")].filter(Boolean).map(element => ({ className: element.className, display: getComputedStyle(element).display, visibility: getComputedStyle(element).visibility, opacity: getComputedStyle(element).opacity })),
      matchingRules: [...document.styleSheets].flatMap(sheet => {
        try { return [...sheet.cssRules]; } catch (_error) { return []; }
      }).filter(rule => rule.selectorText && rule.style?.visibility && (() => { try { return button.matches(rule.selectorText); } catch (_error) { return false; } })()).map(rule => ({ selector: rule.selectorText, visibility: rule.style.visibility }))
    }));
    assert.ok(desktopNavState.rect.width > 0 && desktopNavState.rect.height > 0 && desktopNavState.rect.right <= desktopNavState.parentRect.right + 1, JSON.stringify(desktopNavState));
    assert.equal(await desktop.locator('.nav-btn[data-page="library"]').isVisible(), true, JSON.stringify(desktopNavState));
    const desktopControlSizes = await desktop.evaluate(() => ({
      logo: document.querySelector(".nav-left .logo-img")?.getBoundingClientRect().height || 0,
      nav: document.querySelector(".nav-left .nav-btn")?.getBoundingClientRect().height || 0,
      right: document.querySelector("#profileSyncBtn")?.getBoundingClientRect().height || 0,
      navFont: Number.parseFloat(getComputedStyle(document.querySelector(".nav-left .nav-btn")).fontSize)
    }));
    assert.ok(desktopControlSizes.logo >= 40 && desktopControlSizes.nav >= 40 && desktopControlSizes.navFont >= 10, JSON.stringify(desktopControlSizes));
    assert.ok(Math.abs(desktopControlSizes.logo - desktopControlSizes.right) <= 2 && Math.abs(desktopControlSizes.nav - desktopControlSizes.right) <= 2, JSON.stringify(desktopControlSizes));
    await desktop.click('.nav-btn[data-page="library"]');
    await desktop.locator("#page-library.active").waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-topic-card").count(), 3);
    assert.match(await desktop.locator(".gamesense-season-scope").innerText(), /Active Season.*Season 2026 Act 4.*Patch 13\.00/is);
    assert.equal(await desktop.locator(".gamesense-topic-collage").count(), 3);
    assert.equal(await desktop.locator("#page-library").getByText(/Round Plan|Role Read|Gunfight Plan/).count(), 0);
    assert.equal(await desktop.locator(".gamesense-topic-card strong").evaluateAll(headings => headings.every(heading => getComputedStyle(heading).textAlign === "center")), true);
    await desktop.click('[data-gamesense-topic="maps"]');
    assert.equal(await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').count(), 3);
    assert.equal(await desktop.locator('.gamesense-map-entry-card').evaluateAll(cards => cards.every(card => getComputedStyle(card, "::after").backgroundImage.includes("/assets/library/maps"))), true);
    await desktop.click('[data-gamesense-item="bind"]');
    assert.equal(await desktop.locator(".gamesense-note-block").count(), 2);
    assert.equal(await desktop.locator(".gamesense-note-block").first().locator("li").count(), 3);
    assert.equal(await desktop.locator(".gamesense-tactical-stage img").count(), 1);
    assert.equal(await desktop.locator(".gamesense-callout").count(), 10);
    const bindSitePositions = await desktop.locator(".gamesense-callout").evaluateAll(markers => Object.fromEntries(markers.map(marker => [marker.textContent.trim(), Number.parseFloat(marker.style.getPropertyValue("--callout-x"))])));
    assert.ok(bindSitePositions["A Site"] > 65 && bindSitePositions["B Site"] < 40, JSON.stringify(bindSitePositions));
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 0);
    assert.match(await desktop.locator(".gamesense-comp-unavailable").innerText(), /outside.*competitive rotation.*no current/is);
    assert.equal(await desktop.locator(".gamesense-role-result").count(), 0);
    assert.equal(await desktop.locator(".gamesense-map-view-tabs button").count(), 2);
    assert.equal(await desktop.locator(".gamesense-map-heading strong").evaluate(heading => getComputedStyle(heading).textAlign), "left");
    await desktop.click('[data-gamesense-map-view="plants"]');
    assert.equal(await desktop.locator(".gamesense-callout.gamesense-plant-marker").count(), 5);
    assert.equal(await desktop.locator(".gamesense-plant-legend > div").count(), 5);
    assert.match(await desktop.locator(".gamesense-plant-legend").innerText(), /N\/A.*outside the active competitive rotation/is);
    await desktop.click('[data-gamesense-map-view="locations"]');
    await desktop.click('[data-gamesense-map-zoom="in"]');
    assert.ok(Number.parseInt(await desktop.locator("[data-gamesense-map-zoom-value]").innerText(), 10) > 100);
    const desktopMapViewport = desktop.locator("[data-gamesense-map-viewport]");
    const desktopMapBox = await desktopMapViewport.boundingBox();
    await desktop.mouse.move(desktopMapBox.x + desktopMapBox.width * .62, desktopMapBox.y + desktopMapBox.height * .5);
    await desktop.mouse.down();
    await desktop.mouse.move(desktopMapBox.x + desktopMapBox.width * .42, desktopMapBox.y + desktopMapBox.height * .5, { steps: 5 });
    await desktop.mouse.up();
    assert.ok(await desktopMapViewport.evaluate(viewport => viewport.scrollLeft > 0));
    await desktop.click('[data-gamesense-map-zoom="reset"]');
    await desktop.waitForTimeout(100);
    const desktopFit = await desktopMapViewport.evaluate(viewport => {
      const stage = viewport.querySelector("[data-gamesense-map-stage]");
      const viewportRect = viewport.getBoundingClientRect();
      const stageRect = stage.getBoundingClientRect();
      return {
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        scrollWidth: viewport.scrollWidth,
        clientWidth: viewport.clientWidth,
        stageTop: stageRect.top,
        stageBottom: stageRect.bottom,
        viewportTop: viewportRect.top,
        viewportBottom: viewportRect.bottom
      };
    });
    assert.ok(desktopFit.scrollWidth <= desktopFit.clientWidth + 1 && desktopFit.scrollLeft === 0 && desktopFit.scrollTop === 0, JSON.stringify(desktopFit));
    assert.ok(desktopFit.stageTop >= desktopFit.viewportTop - 1 && desktopFit.stageBottom <= desktopFit.viewportBottom + 1, JSON.stringify(desktopFit));
    const desktopMapOrder = await desktop.evaluate(() => {
      const detail = document.querySelector(".gamesense-detail-grid");
      const map = document.querySelector(".gamesense-tactical-card");
      return Boolean(detail && map && (detail.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    assert.equal(desktopMapOrder, true);
    const desktopScroll = await desktop.locator("#page-library").evaluate(page => {
      page.scrollTop = page.scrollHeight;
      return { clientHeight: page.clientHeight, scrollHeight: page.scrollHeight, scrollTop: page.scrollTop, overflowY: getComputedStyle(page).overflowY };
    });
    assert.ok(desktopScroll.scrollHeight > desktopScroll.clientHeight && desktopScroll.scrollTop > 0 && desktopScroll.overflowY === "auto", JSON.stringify(desktopScroll));
    await desktop.locator("#page-library").evaluate(page => { page.scrollTop = 0; });
    await desktop.click(".gamesense-role-menu summary");
    await desktop.click('[data-gamesense-role="Controller"]');
    assert.match(await desktop.locator(".gamesense-role-result").innerText(), /A Heaven|Lamps/i);
    await desktop.locator(".gamesense-tactical-card").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-marked.png") });
    assert.match(await desktop.locator(".gamesense-patch").innerText(), /Patch 13\.00/i);
    assert.equal(await desktop.locator(".gamesense-lineups a").count(), 2);
    await desktop.screenshot({ path: path.join(__dirname, "tmp", "gamesense-desktop.png"), fullPage: true });
    const renderedText = (await desktop.locator("#page-library").innerText()).toLowerCase();
    assert.equal(renderedText.includes("woohoojin"), false);
    assert.equal(renderedText.includes("dopai"), false);
    assert.equal(renderedText.includes("zleague"), false);
    assert.equal(renderedText.includes("youtube.com"), false);
    assert.equal(renderedText.includes("stairs"), false);
    assert.equal(renderedText.includes("use an illustrated lineup database"), false);
    assert.equal(renderedText.includes("entries in this first field guide"), false);
    const exactMapContent = await desktop.evaluate(() => {
      const bind = globalThis.RankedCoachGamesenseMaps.find(map => map.id === "bind");
      const rendered = [...document.querySelectorAll(".gamesense-detail-grid > .gamesense-note-block:first-child li")].map(item => item.textContent.trim());
      return { expected: bind.macro.defense, rendered };
    });
    assert.deepEqual(exactMapContent.rendered, exactMapContent.expected);

    await desktop.click('[data-gamesense-back="maps"]');
    await desktop.click('[data-gamesense-item="breeze"]');
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 3);
    assert.equal(await desktop.locator(".gamesense-comp-agents img").count(), 15);
    assert.match(await desktop.locator(".gamesense-comp-option").first().innerText(), /56\.9%.*4,639 games/is);
    await desktop.waitForFunction(() => [...document.querySelectorAll(".gamesense-comp-agents img")].every(image => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
    assert.equal(await desktop.locator(".gamesense-comp-agents img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
    await desktop.locator("[data-gamesense-comp-agent]").first().click();
    assert.match(await desktop.locator(".gamesense-comp-agent-read").innerText(), /B.*stronger.*defensive success/is);

    await desktop.click('.nav-btn[data-page="stats"]');
    await desktop.click('[data-gamesense-open="agents"]');
    await desktop.locator("#page-library.active").waitFor({ state: "visible" });
    assert.equal(await desktop.locator('.gamesense-entry-grid-agents [data-gamesense-item]').count(), 6);
    assert.equal(await desktop.locator('.gamesense-agent-entry-card img').count(), 6);
    await desktop.click('[data-gamesense-item="jett"]');
    await desktop.waitForTimeout(400);
    assert.equal(await desktop.locator("[data-gamesense-ability]").count(), 4);
    assert.equal(await desktop.locator(".gamesense-ability-panel").count(), 1);
    await desktop.click('[data-gamesense-ability="cloudburst"]');
    assert.match(await desktop.locator(".gamesense-ability-panel").innerText(), /2\.5 seconds/i);
    await desktop.waitForTimeout(2200);
    assert.match(await desktop.locator(".gamesense-agent-rate").innerText(), /29\.6%.*(?:↓|down).*0\.1/is);
    assert.equal(await desktop.locator(".gamesense-map-fit-item").count(), 3);
    assert.match(await desktop.locator(".gamesense-map-fit-item").first().innerText(), /pick.*win/is);
    await desktop.locator(".gamesense-selector-section").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-ability.png") });
    assert.equal((await desktop.locator("#page-library").innerText()).includes("First Slice"), false);

    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons"));
    assert.equal(await desktop.locator('.gamesense-entry-grid-weapons [data-gamesense-item]').count(), 6);
    assert.ok(await desktop.locator('.gamesense-weapon-entry-card img').count() >= 15);
    assert.match(await desktop.locator('[data-gamesense-item="precision"]').innerText(), /Light Rifles/i);
    await desktop.click('[data-gamesense-item="rifles"]');
    assert.equal(await desktop.locator("[data-gamesense-weapon]").count(), 2);
    await desktop.click('[data-gamesense-weapon="phantom"]');
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /2900 credits/i);
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /21\.2%/i);
    assert.ok(await desktop.locator(".gamesense-damage-table [role=row]").count() >= 3);
    await desktop.locator(".gamesense-selector-section").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-detail.png") });
    await desktop.click('.nav-btn[data-page="library"]');
    assert.equal(await desktop.locator(".gamesense-topic-card").count(), 3);
    assert.equal(await desktop.locator(".lens-modal-close").count(), 0);

    await desktop.click('.nav-btn[data-page="logging"]');
    await desktop.click("#loggingTrainingMenuBtn");
    await desktop.locator("#dailyWarmupModal.active").waitFor({ state: "visible" });
    assert.equal(await desktop.locator("[data-warmup-info]").count(), 11);
    const drill = desktop.locator('[data-warmup-drill="head-tracking"]');
    await drill.locator("[data-warmup-info]").click();
    assert.equal(await drill.locator(".daily-warmup-info-detail li").count(), 3);
    assert.equal(await drill.getAttribute("aria-pressed"), "false");
    const drone = desktop.locator('[data-warmup-drill="drone-target-switching"]');
    await drone.locator("[data-warmup-info]").click();
    assert.match(await drone.locator(".daily-warmup-info-detail").innerText(), /infinite ammo off/i);
    assert.match(await drone.locator(".daily-warmup-info-detail").innerText(), /without releasing/i);
    const spray = desktop.locator('[data-warmup-drill="spray-control-dummy"]');
    await spray.locator("[data-warmup-info]").click();
    assert.match(await spray.locator(".daily-warmup-info-detail").innerText(), /large range-finder target dummy/i);
    assert.match(await spray.locator(".daily-warmup-info-detail").innerText(), /accuracy by bullets hitting/i);
    await desktop.close();

    const mobile = await browser.newPage({ viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true });
    await mobile.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await seed(mobile, "gamesense-mobile");
    await mobile.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(mobile);
    await mobile.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await dismissWarmup(mobile);
    assert.equal(await mobile.locator(".mobile-bottom-page-btn").count(), 5);
    await dismissWarmup(mobile);
    await mobile.click('.mobile-bottom-page-btn[data-mobile-page="library"]');
    await mobile.locator("#page-library.is-current-page").waitFor({ state: "visible" });
    assert.equal(await mobile.locator(".gamesense-topic-card").count(), 3);
    await mobile.click('[data-gamesense-topic="maps"]');
    await mobile.click('[data-gamesense-item="bind"]');
    assert.equal(await mobile.locator(".gamesense-tactical-stage img").isVisible(), true);
    assert.equal(await mobile.locator(".gamesense-callout").count(), 10);
    assert.equal(await mobile.locator(".gamesense-map-plan").count(), 2);
    assert.equal(await mobile.locator(".gamesense-map-plan[open]").count(), 0);
    await mobile.locator(".gamesense-map-plan summary").first().click();
    assert.equal(await mobile.locator(".gamesense-map-plan[open]").count(), 1);
    await mobile.locator('[data-gamesense-map-zoom="in"]').click();
    const zoomState = await mobile.locator("[data-gamesense-map-viewport]").evaluate(viewport => ({
      zoom: getComputedStyle(viewport.querySelector("[data-gamesense-map-stage]")).getPropertyValue("--map-zoom"),
      mapWidth: getComputedStyle(viewport.querySelector("[data-gamesense-map-stage]")).getPropertyValue("--map-width"),
      stageWidth: getComputedStyle(viewport.querySelector("[data-gamesense-map-stage]")).width,
      inline: viewport.querySelector("[data-gamesense-map-stage]").getAttribute("style"),
      scrollWidth: viewport.scrollWidth,
      clientWidth: viewport.clientWidth
    }));
    assert.ok(Number.parseFloat(zoomState.zoom) > 1 && zoomState.scrollWidth > zoomState.clientWidth, JSON.stringify(zoomState));
    const viewportBox = await mobile.locator("[data-gamesense-map-viewport]").boundingBox();
    const mobilePan = await mobile.locator("[data-gamesense-map-viewport]").evaluate((viewport, box) => {
      const startX = box.x + box.width * .7;
      const startY = box.y + box.height * .45;
      viewport.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 41, pointerType: "touch", clientX: startX, clientY: startY }));
      viewport.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 41, pointerType: "touch", clientX: startX - 70, clientY: startY }));
      viewport.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 41, pointerType: "touch", clientX: startX - 70, clientY: startY }));
      return viewport.scrollLeft;
    }, viewportBox);
    assert.ok(mobilePan > 0, `expected touch pan to move the map, received ${mobilePan}`);
    await mobile.locator('[data-gamesense-map-view="plants"]').click();
    assert.equal(await mobile.locator(".gamesense-plant-legend").isVisible(), true);
    const mobileMapOrder = await mobile.evaluate(() => {
      const detail = document.querySelector(".gamesense-detail-grid");
      const map = document.querySelector(".gamesense-tactical-card");
      return Boolean(detail && map && (detail.compareDocumentPosition(map) & Node.DOCUMENT_POSITION_FOLLOWING));
    });
    assert.equal(mobileMapOrder, true);
    const mobileScroll = await mobile.evaluate(() => {
      const candidates = [document.documentElement, document.body, document.querySelector(".app-scale-wrap"), document.querySelector(".app-root"), document.querySelector(".app")].filter(Boolean);
      const scrollOwner = candidates.find(element => element.scrollHeight > element.clientHeight + 1 && ["auto", "scroll"].includes(getComputedStyle(element).overflowY));
      if (scrollOwner) scrollOwner.scrollTop = scrollOwner.scrollHeight;
      const tactical = document.querySelector(".gamesense-tactical-scroll");
      return {
        owner: scrollOwner ? scrollOwner.className || scrollOwner.tagName : "missing",
        clientHeight: scrollOwner?.clientHeight || 0,
        scrollHeight: scrollOwner?.scrollHeight || 0,
        scrollTop: scrollOwner?.scrollTop || 0,
        overflowY: scrollOwner ? getComputedStyle(scrollOwner).overflowY : "missing",
        candidates: candidates.map(element => ({ name: element.className || element.tagName, clientHeight: element.clientHeight, scrollHeight: element.scrollHeight, overflowY: getComputedStyle(element).overflowY })),
        tacticalOverflowY: tactical ? getComputedStyle(tactical).overflowY : "missing"
      };
    });
    assert.ok(mobileScroll.scrollHeight > mobileScroll.clientHeight && mobileScroll.scrollTop > 0 && mobileScroll.overflowY === "auto", JSON.stringify(mobileScroll));
    assert.equal(mobileScroll.tacticalOverflowY, "auto", JSON.stringify(mobileScroll));
    await mobile.evaluate(() => {
      [document.documentElement, document.body, document.querySelector(".app-scale-wrap"), document.querySelector(".app-root"), document.querySelector(".app")].filter(Boolean).forEach(element => { element.scrollTop = 0; });
    });
    const mobileMetrics = await mobile.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      labels: [...document.querySelectorAll(".mobile-bottom-page-btn")].map(button => ({ text: button.textContent.trim(), top: button.getBoundingClientRect().top, width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height, whiteSpace: getComputedStyle(button).whiteSpace }))
    }));
    assert.equal(mobileMetrics.overflow, false, JSON.stringify(mobileMetrics));
    assert.ok(mobileMetrics.labels.every(label => label.height >= 44 && label.width > 0 && label.whiteSpace === "nowrap"), JSON.stringify(mobileMetrics));
    assert.equal(new Set(mobileMetrics.labels.map(label => Math.round(label.top))).size, 1, JSON.stringify(mobileMetrics));
    await mobile.click('.mobile-bottom-page-btn[data-mobile-page="library"]');
    assert.equal(await mobile.locator(".gamesense-topic-card").count(), 3);
    await mobile.waitForTimeout(3000);
    await mobile.screenshot({ path: path.join(__dirname, "tmp", "gamesense-mobile-360x740.png"), fullPage: true });
    await mobile.close();

    console.log("Gamesense Library checks passed: page scrolling, bottom tactical maps, centered headings, clean topic labels, equal desktop nav sizing, visual galleries, role notes, agent abilities, weapon analysis, attribution guard, and 360x740 containment.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
