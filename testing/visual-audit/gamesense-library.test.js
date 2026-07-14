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
    const browserErrors = [];
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    desktop.on("console", message => { if (message.type() === "error") browserErrors.push(`desktop console: ${message.text()}`); });
    desktop.on("pageerror", error => browserErrors.push(`desktop page: ${error.message}`));
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
    await desktop.waitForTimeout(700);
    assert.equal(await desktop.locator(".gamesense-topic-card").count(), 3);
    assert.equal(await desktop.locator(".gamesense-topic-card").evaluateAll(cards => cards.every(card => card.getBoundingClientRect().height >= 380)), true);
    assert.equal(await desktop.locator(".gamesense-topic-number").count(), 0);
    assert.match(await desktop.locator(".gamesense-season-scope").innerText(), /Active Season.*Season 2026 Act 4.*Patch 13\.00/is);
    assert.equal(await desktop.locator(".gamesense-topic-collage").count(), 3);
    assert.deepEqual(await desktop.locator('[data-gamesense-topic="weapons"] .gamesense-topic-collage img').evaluateAll(images => images.map(image => image.src.includes("media.valorant-api.com/weapons/"))), [true, true, true]);
    await desktop.waitForFunction(() => [...document.querySelectorAll('[data-gamesense-topic="weapons"] .gamesense-topic-collage img')].every(image => image.complete && image.naturalWidth > 0));
    assert.equal(await desktop.locator('[data-gamesense-topic="weapons"] img[src*="weapons-dossier-v2"]').count(), 0);
    const weaponTopicArt = await desktop.locator('[data-gamesense-topic="weapons"]').evaluate(card => {
      const title = card.querySelector(":scope > strong").getBoundingClientRect();
      const action = card.querySelector(".gamesense-topic-action").getBoundingClientRect();
      const images = [...card.querySelectorAll(".gamesense-topic-collage img")];
      return { titleTop: title.top, actionBottom: action.bottom, titleMarginTop: parseFloat(getComputedStyle(card.querySelector(":scope > strong")).marginTop), imageBottom: Math.max(...images.map(image => image.getBoundingClientRect().bottom)), filters: images.map(image => getComputedStyle(image).filter) };
    });
    assert.ok(weaponTopicArt.imageBottom <= weaponTopicArt.titleTop && weaponTopicArt.filters.every(filter => filter.includes("grayscale")), JSON.stringify(weaponTopicArt));
    assert.ok(weaponTopicArt.actionBottom <= weaponTopicArt.titleTop && Math.abs(weaponTopicArt.titleMarginTop - 31) <= 1, JSON.stringify(weaponTopicArt));
    await desktop.locator('[data-gamesense-topic="weapons"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapons-topic-desktop.png") });
    assert.equal(await desktop.getByText("Reference Room", { exact: true }).count(), 0);
    assert.equal(await desktop.locator("#page-library").getByText(/Round Plan|Role Read|Gunfight Plan/).count(), 0);
    assert.equal(await desktop.locator(".gamesense-topic-card strong").evaluateAll(headings => headings.every(heading => getComputedStyle(heading).textAlign === "center")), true);
    await desktop.click('[data-gamesense-topic="maps"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').count(), 3);
    assert.equal(await desktop.locator('.gamesense-map-entry-card').evaluateAll(cards => cards.every(card => getComputedStyle(card, "::after").backgroundImage.includes("/assets/library/maps"))), true);
    assert.deepEqual(await desktop.locator('.gamesense-map-entry-card').allInnerTexts(), ["BIND\nOUT OF SEASON", "BREEZE", "SPLIT"]);
    const outOfSeasonMap = desktop.locator('.gamesense-map-entry-card.is-out-of-season');
    assert.equal(await outOfSeasonMap.count(), 1);
    assert.equal(await outOfSeasonMap.isEnabled(), true);
    assert.match(await outOfSeasonMap.evaluate(card => getComputedStyle(card).filter), /grayscale/);
    const mapGalleryAlignment = await desktop.locator('.gamesense-map-entry-card').evaluateAll(cards => cards.map(card => {
      const cardRect = card.getBoundingClientRect();
      const title = card.querySelector(".gamesense-map-card-copy strong").getBoundingClientRect();
      const status = card.querySelector(".gamesense-map-season-status");
      return {
        titleCenterDelta: Math.abs((title.left + title.right) / 2 - (cardRect.left + cardRect.right) / 2),
        titleVerticalDelta: Math.abs((title.top + title.bottom) / 2 - (cardRect.top + cardRect.bottom) / 2),
        status: status ? { color: getComputedStyle(status).color, fontSize: parseFloat(getComputedStyle(status).fontSize) } : null
      };
    }));
    assert.ok(mapGalleryAlignment.every(card => card.titleCenterDelta <= 2 && card.titleVerticalDelta <= 24), JSON.stringify(mapGalleryAlignment));
    assert.deepEqual(mapGalleryAlignment[0].status, { color: "rgb(203, 213, 225)", fontSize: 20 });
    await desktop.click('[data-gamesense-item="bind"]');
    await desktop.locator(".gamesense-tips-hub").waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-tips-hub").count(), 1);
    assert.equal(await desktop.locator("[data-gamesense-tip-view]").count(), 4);
    assert.equal(await desktop.locator("[data-gamesense-role]").count(), 5);
    assert.equal(await desktop.locator('.gamesense-tip-grid .gamesense-tip').count(), 2);
    assert.equal(await desktop.locator(".gamesense-tactical-stage img").count(), 1);
    assert.equal(await desktop.locator(".gamesense-callout").count(), 10);
    const bindSitePositions = await desktop.locator(".gamesense-callout").evaluateAll(markers => Object.fromEntries(markers.map(marker => [marker.textContent.trim(), Number.parseFloat(marker.style.getPropertyValue("--callout-x"))])));
    assert.ok(bindSitePositions["A Site"] > 65 && bindSitePositions["B Site"] < 40, JSON.stringify(bindSitePositions));
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 0);
    assert.match(await desktop.locator(".gamesense-comp-unavailable").innerText(), /outside Tracker Network.*rolling Competitive.*no current/is);
    assert.match(await desktop.locator(".gamesense-map-detail-head").innerText(), /Bind.*Out of Season/is);
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion").count(), 5);
    assert.equal(await desktop.locator(".gamesense-round-conversion.is-unavailable").count(), 5);
    assert.match(await desktop.locator(".gamesense-weapon-suggestions").textContent(), /Round conversion percent: unavailable.*outside the active-season Competitive sample/is);
    assert.equal(await desktop.locator(".gamesense-role-result").count(), 0);
    assert.equal(await desktop.locator(".gamesense-map-view-tabs button").count(), 2);
    assert.equal(await desktop.locator(".gamesense-map-view-tabs button").evaluateAll(buttons => buttons.every(button => getComputedStyle(button).textAlign === "center")), true);
    assert.equal(await desktop.locator(".gamesense-map-heading strong").evaluate(heading => getComputedStyle(heading).textAlign), "left");
    await desktop.click('[data-gamesense-map-view="plants"]');
    await desktop.locator(".gamesense-callout.gamesense-plant-marker").first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-callout.gamesense-plant-marker").count(), 5);
    assert.equal(await desktop.locator(".gamesense-plant-legend > div").count(), 5);
    assert.match(await desktop.locator(".gamesense-plant-legend").innerText(), /N\/A.*outside the active competitive rotation/is);
    await desktop.click('[data-gamesense-map-view="locations"]');
    await desktop.locator('[data-gamesense-map-view="locations"].active').waitFor({ state: "visible" });
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
    assert.equal(await desktop.locator(".gamesense-role-lens-menu").getAttribute("open"), null);
    assert.equal(await desktop.locator(".gamesense-role-lens-menu summary").innerText().then(text => /All roles/i.test(text)), true);
    await desktop.click(".gamesense-role-lens-menu summary");
    await desktop.click('[data-gamesense-role="Controller"]');
    await desktop.locator('[data-gamesense-role="Controller"].active').waitFor({ state: "attached" });
    assert.match(await desktop.locator(".gamesense-role-lens-menu summary").innerText(), /Controller/i);
    await desktop.click('[data-gamesense-tip-view="sites"]');
    await desktop.locator('[data-gamesense-tip-view="sites"].active').waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-tips-panel").innerText(), /Controller lens.*A Heaven|A Heaven.*Controller lens/is);
    assert.ok(await desktop.locator(".gamesense-tip.is-role-tip").count() >= 1);
    await desktop.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    await desktop.locator(".gamesense-tips-hub").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-tips-desktop.png") });
    await desktop.locator(".gamesense-tactical-card").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-marked.png") });
    assert.match(await desktop.locator(".gamesense-patch").innerText(), /Patch 13\.00/i);
    assert.equal(await desktop.locator(".gamesense-lineups a").count(), 2);
    assert.equal(await desktop.locator(".gamesense-lineups a img").count(), 2);
    await desktop.screenshot({ path: path.join(__dirname, "tmp", "gamesense-desktop.png"), fullPage: true });
    const renderedText = (await desktop.locator("#page-library").innerText()).toLowerCase();
    assert.equal(renderedText.includes("woohoojin"), false);
    assert.equal(renderedText.includes("dopai"), false);
    assert.equal(renderedText.includes("zleague"), false);
    assert.equal(renderedText.includes("youtube.com"), false);
    assert.equal(renderedText.includes("stairs"), false);
    assert.equal(renderedText.includes("use an illustrated lineup database"), false);
    assert.equal(renderedText.includes("entries in this first field guide"), false);
    await desktop.click(".gamesense-role-lens-menu summary");
    await desktop.click('[data-gamesense-role="all"]');
    await desktop.locator('[data-gamesense-role="all"].active').waitFor({ state: "attached" });
    await desktop.click('[data-gamesense-tip-view="defense"]');
    await desktop.locator('[data-gamesense-tip-view="defense"].active').waitFor({ state: "visible" });
    const exactMapContent = await desktop.evaluate(() => {
      const bind = globalThis.RankedCoachGamesenseMaps.find(map => map.id === "bind");
      const rendered = [...document.querySelectorAll(".gamesense-tip-grid .gamesense-tip p")].map(item => item.textContent.trim());
      return { expected: bind.macro.defense, rendered };
    });
    assert.deepEqual(exactMapContent.rendered, exactMapContent.expected);

    await desktop.click('[data-gamesense-back="maps"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    await desktop.click('[data-gamesense-item="breeze"]');
    await desktop.locator(".gamesense-comp-option").first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 3);
    assert.equal(await desktop.locator(".gamesense-comp-agents img").count(), 15);
    assert.match(await desktop.locator(".gamesense-comp-card").innerText(), /All ranks.*Primary reference.*Strong alternative.*Alternate look/is);
    assert.match(await desktop.locator(".gamesense-comp-source").innerText(), /individual-agent strength.*blended all-rank Competitive sample.*not measured five-agent lineup win rates.*not Ascendant\+ specific/is);
    assert.equal(await desktop.locator(".gamesense-comp-winrate").count(), 0);
    assert.doesNotMatch(await desktop.locator(".gamesense-comp-card").innerText(), /\d+\.\d+% win rate|\d{1,3}(?:,\d{3})+ games|strongest measured compositions/i);
    assert.deepEqual(await desktop.locator(".gamesense-comp-reference-label").allInnerTexts(), ["PRIMARY REFERENCE", "STRONG ALTERNATIVE", "ALTERNATE LOOK"]);
    assert.equal(await desktop.locator(".gamesense-comp-composition").count(), 0);
    assert.equal(await desktop.locator(".gamesense-comp-makeup i").count(), 15);
    const compPresentation = await desktop.locator(".gamesense-comp-option").first().evaluate(option => {
      const line = option.querySelector(".gamesense-comp-line").getBoundingClientRect();
      const agents = option.querySelector(".gamesense-comp-agents").getBoundingClientRect();
      const makeup = option.querySelector(".gamesense-comp-makeup").getBoundingClientRect();
      const buttons = [...option.querySelectorAll(".gamesense-comp-agents button")].map(button => ({
        role: button.dataset.roleTone,
        background: getComputedStyle(button).backgroundImage,
        border: getComputedStyle(button).borderColor
      }));
      const icons = [...option.querySelectorAll(".gamesense-comp-makeup i")].map(icon => ({
        role: icon.dataset.roleTone,
        mask: getComputedStyle(icon, "::before").webkitMaskImage || getComputedStyle(icon, "::before").maskImage,
        color: getComputedStyle(icon, "::before").backgroundColor
      }));
      return { line: line.toJSON(), agents: agents.toJSON(), makeup: makeup.toJSON(), buttons, icons };
    });
    assert.ok(compPresentation.agents.right <= compPresentation.makeup.left + 1 && compPresentation.makeup.right <= compPresentation.line.right + 1, JSON.stringify(compPresentation));
    assert.ok(compPresentation.buttons.every(button => button.background.includes("linear-gradient") && button.role), JSON.stringify(compPresentation));
    assert.ok(compPresentation.icons.every(icon => icon.mask !== "none" && icon.color !== "rgba(0, 0, 0, 0)"), JSON.stringify(compPresentation));
    await desktop.waitForFunction(() => [...document.querySelectorAll(".gamesense-comp-agents img")].every(image => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
    await desktop.waitForTimeout(120);
    await desktop.locator(".gamesense-comp-list").screenshot({ path: path.join(__dirname, "tmp", "gamesense-current-comps-desktop.png") });
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion").count(), 5);
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion summary img").count(), 5);
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion[open]").count(), 0);
    await desktop.locator(".gamesense-weapon-suggestion").first().locator("summary").click();
    assert.match(await desktop.locator(".gamesense-weapon-suggestion").first().innerText(), /kills per round|average damage/i);
    assert.match(await desktop.locator(".gamesense-weapon-suggestion").first().innerText(), /Combined round conversion percent: 50\.87%.*Second rifle Vandal: 50\.41% round conversion percent/is);
    assert.doesNotMatch(await desktop.locator(".gamesense-weapon-suggestion").first().innerText(), /A Main|B Main|Mid Nest/i);
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion").first().locator(".gamesense-weapon-suggestion-detail > :first-child").getAttribute("class"), "gamesense-round-conversion");
    await desktop.locator(".gamesense-weapon-suggestion").nth(1).locator("summary").click();
    assert.deepEqual(
      await desktop.locator(".gamesense-weapon-suggestion").nth(1).locator(".gamesense-weapon-suggestion-detail > *").evaluateAll(items => items.slice(0, 4).map(item => item.className)),
      ["gamesense-round-conversion", "gamesense-conversion-read", "gamesense-weapon-evidence", "gamesense-weapon-context"]
    );
    assert.deepEqual(await desktop.locator(".gamesense-weapon-side").allInnerTexts(), ["DEF", "DEF"]);
    const desktopWeaponSuggestion = await desktop.locator(".gamesense-weapon-suggestion").first().locator("summary").evaluate(summary => {
      const image = summary.querySelector("img").getBoundingClientRect();
      const fit = summary.querySelector(".gamesense-weapon-fit").getBoundingClientRect();
      const toggle = summary.querySelector(".gamesense-weapon-suggestion-art i").getBoundingClientRect();
      return { image: image.toJSON(), fit: fit.toJSON(), toggle: toggle.toJSON() };
    });
    assert.ok(desktopWeaponSuggestion.fit.bottom <= desktopWeaponSuggestion.image.top + 1, JSON.stringify(desktopWeaponSuggestion));
    assert.ok(Math.abs((desktopWeaponSuggestion.toggle.top + desktopWeaponSuggestion.toggle.height / 2) - (desktopWeaponSuggestion.image.top + desktopWeaponSuggestion.image.height / 2)) <= 3, JSON.stringify(desktopWeaponSuggestion));
    assert.match(await desktop.locator(".gamesense-weapon-source").innerText(), /vstats.*active-season.*Blitz/is);
    const sideSpecificWeapons = await desktop.evaluate(() => globalThis.RankedCoachGamesenseMaps.find(map => map.id === "breeze").weaponSuggestions.filter(item => item.side));
    assert.ok(sideSpecificWeapons.every(item => item.side === "DEF" && /^On defense,/i.test(item.note)), JSON.stringify(sideSpecificWeapons));
    await desktop.locator(".gamesense-weapon-suggestions").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-weapons-desktop.png") });
    const suggestionCategories = await desktop.evaluate(() => globalThis.RankedCoachGamesenseMaps.find(map => map.id === "breeze").weaponSuggestions.map(item => item.category));
    assert.equal(new Set(suggestionCategories).size, suggestionCategories.length);
    assert.ok(suggestionCategories.includes("pistol"));
    assert.ok(suggestionCategories.includes("shotgun"));
    await desktop.waitForFunction(() => [...document.querySelectorAll(".gamesense-comp-agents img")].every(image => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
    assert.equal(await desktop.locator(".gamesense-comp-agents img").evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0)), true);
    assert.equal(await desktop.locator(".gamesense-comp-agents button").evaluateAll(buttons => buttons.every(button => getComputedStyle(button, "::before").backgroundImage !== "none" || getComputedStyle(button, "::before").backgroundColor !== "rgba(0, 0, 0, 0)")), true);
    await desktop.locator(".gamesense-comp-agents img").first().evaluate(image => { window.__rankedCoachCompImageNode = image; });
    await desktop.locator("[data-gamesense-comp-agent]").first().click();
    await desktop.locator(".gamesense-comp-agent-read").waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-comp-agent-read").innerText(), /Chamber.*Trademark/is);
    await desktop.locator("[data-gamesense-comp-agent]").nth(1).click();
    assert.equal(await desktop.locator(".gamesense-comp-agents img").first().evaluate(image => window.__rankedCoachCompImageNode === image && image.isConnected), true);
    assert.equal(await desktop.locator(".gamesense-comp-agent-read").count(), 1);

    await desktop.click('[data-gamesense-back="maps"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    await desktop.click('[data-gamesense-item="split"]');
    await desktop.locator(".gamesense-tactical-stage img").waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-tactical-stage img").getAttribute("src"), /split-layout-trn\.png/);
    const splitSitePositions = await desktop.locator(".gamesense-callout").evaluateAll(markers => Object.fromEntries(markers.map(marker => [marker.textContent.trim(), Number.parseFloat(marker.style.getPropertyValue("--callout-x"))])));
    assert.ok(splitSitePositions["A Site"] > 75 && splitSitePositions["B Site"] < 20, JSON.stringify(splitSitePositions));

    await desktop.click('.nav-btn[data-page="stats"]');
    await desktop.click('[data-gamesense-open="agents"]');
    await desktop.locator("#page-library.active").waitFor({ state: "visible" });
    await desktop.locator('.gamesense-entry-grid-agents [data-gamesense-item]').first().waitFor({ state: "visible" });
    await desktop.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    assert.equal(await desktop.locator('.gamesense-entry-grid-agents [data-gamesense-item]').count(), 6);
    assert.equal(await desktop.locator('.gamesense-agent-entry-card img').count(), 6);
    const desktopAgentTile = await desktop.locator(".gamesense-agent-entry-card").first().evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const index = card.querySelector(".gamesense-entry-index").getBoundingClientRect();
      const image = card.querySelector("img").getBoundingClientRect();
      const name = card.querySelector(".gamesense-entry-copy strong").getBoundingClientRect();
      const hidden = [...card.querySelectorAll("small,.gamesense-entry-copy > span")].every(item => getComputedStyle(item).display === "none");
      return { card: cardRect.toJSON(), index: index.toJSON(), image: image.toJSON(), name: name.toJSON(), hidden };
    });
    assert.ok(desktopAgentTile.index.left > desktopAgentTile.card.left + desktopAgentTile.card.width / 2, JSON.stringify(desktopAgentTile));
    assert.ok(desktopAgentTile.image.left <= desktopAgentTile.card.left + 2 && desktopAgentTile.image.bottom >= desktopAgentTile.card.bottom - 2, JSON.stringify(desktopAgentTile));
    assert.ok(desktopAgentTile.name.left > desktopAgentTile.card.left + desktopAgentTile.card.width / 2 && desktopAgentTile.hidden, JSON.stringify(desktopAgentTile));
    await desktop.locator(".gamesense-entry-grid-agents").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-gallery-desktop.png") });
    await desktop.click('[data-gamesense-item="jett"]');
    await desktop.waitForTimeout(400);
    const agentHeader = await desktop.locator(".gamesense-agent-detail-head").evaluate(header => {
      const patch = header.querySelector(".gamesense-patch").getBoundingClientRect();
      const back = header.querySelector(".gamesense-back").getBoundingClientRect();
      return { patch: patch.toJSON(), back: back.toJSON() };
    });
    assert.ok(agentHeader.patch.bottom <= agentHeader.back.top + 1 && Math.abs(agentHeader.patch.right - agentHeader.back.right) <= 2, JSON.stringify(agentHeader));
    assert.match(await desktop.locator(".gamesense-agent-hero").innerText(), /Agent Fundamentals.*Tailwind.*Lore and History.*South Korea.*Gameplay history/is);
    assert.doesNotMatch(await desktop.locator(".gamesense-agent-facts").innerText(), /Global pick rate/i);
    assert.equal(await desktop.locator(".gamesense-agent-rate-label").evaluate(label => getComputedStyle(label).color), "rgb(246, 196, 83)");
    const fundamentalSpacing = await desktop.locator(".gamesense-agent-hero .gamesense-note-block:not(.gamesense-agent-facts) ul").evaluate(list => ({
      gap: Number.parseFloat(getComputedStyle(list).rowGap),
      distribution: getComputedStyle(list).alignContent
    }));
    assert.ok(fundamentalSpacing.gap >= 18 && fundamentalSpacing.distribution === "space-evenly", JSON.stringify(fundamentalSpacing));
    assert.match(await desktop.locator(".gamesense-agent-portrait-wrap").evaluate(panel => getComputedStyle(panel).backgroundImage), /radial-gradient/i);
    const desktopAgentPortrait = await desktop.locator(".gamesense-agent-portrait-wrap").evaluate(panel => {
      const image = panel.querySelector(":scope > img");
      return { ratio: image.getBoundingClientRect().height / panel.getBoundingClientRect().height, fit: getComputedStyle(image).objectFit };
    });
    assert.ok(desktopAgentPortrait.fit === "cover" && Math.abs(desktopAgentPortrait.ratio - .95) <= .02, JSON.stringify(desktopAgentPortrait));
    const agentPatchOrder = await desktop.locator(".gamesense-agent-facts .gamesense-patch-history li > span").allInnerTexts();
    assert.deepEqual(agentPatchOrder, [...agentPatchOrder].sort((left, right) => Number.parseFloat(right.replace(/[^\d.]/g, "")) - Number.parseFloat(left.replace(/[^\d.]/g, ""))));
    await desktop.locator(".gamesense-agent-hero").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-fundamentals-desktop.png") });
    assert.equal(await desktop.locator("[data-gamesense-ability]").count(), 4);
    assert.equal(await desktop.locator(".gamesense-ability-panel").count(), 1);
    await desktop.click('[data-gamesense-ability="cloudburst"]');
    assert.equal(await desktop.locator("html").getAttribute("data-gamesense-transition"), null);
    await desktop.locator('[data-gamesense-ability="cloudburst"].active').waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-ability-panel").innerText(), /2\.5 seconds/i);
    assert.equal(await desktop.locator('[data-gamesense-ability="cloudburst"].active').count(), 1);
    assert.match(await desktop.locator('[data-gamesense-ability="cloudburst"]').evaluate(button => getComputedStyle(button, "::after").content), /Selected/i);
    await desktop.waitForTimeout(2200);
    assert.match(await desktop.locator(".gamesense-agent-rate").innerText(), /Global Pick Rate.*10\.3%.*Rank #1.*Tracker Network.*Past two weeks/is);
    assert.equal(await desktop.locator(".gamesense-map-fit-item").count(), 3);
    assert.match(await desktop.locator(".gamesense-map-fit-item").first().innerText(), /pick.*win/is);
    const mapFitGeometry = await desktop.locator(".gamesense-map-fit-item").evaluateAll(cards => cards.map(card => {
      const cardWidth = card.getBoundingClientRect().width;
      const pillGrid = card.querySelector(":scope > div");
      const pills = [...pillGrid.querySelectorAll(":scope > strong")].map(item => item.getBoundingClientRect().width);
      const name = card.querySelector(":scope > span").getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      return { tag: card.tagName, cardWidth, pills, nameTopOffset: name.top - cardRect.top, nameLeftOffset: name.left - cardRect.left, cardJustifyItems: getComputedStyle(card).justifyItems, pillGrid: { width: pillGrid.getBoundingClientRect().width, computedWidth: getComputedStyle(pillGrid).width, justifySelf: getComputedStyle(pillGrid).justifySelf, display: getComputedStyle(pillGrid).display } };
    }));
    assert.equal(mapFitGeometry[0].tag, "BUTTON");
    assert.ok(mapFitGeometry.every(card => card.pills.every(width => width >= card.cardWidth * .4)), JSON.stringify(mapFitGeometry));
    assert.ok(mapFitGeometry.every(card => card.nameTopOffset <= 15 && card.nameLeftOffset <= 15), JSON.stringify(mapFitGeometry));
    await desktop.locator(".gamesense-map-fit").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-map-fit-desktop.png") });
    await desktop.locator(".gamesense-selector-section").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-ability.png") });
    assert.equal((await desktop.locator("#page-library").innerText()).includes("First Slice"), false);

    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons"));
    await desktop.locator('.gamesense-entry-grid-weapons [data-gamesense-item]').first().waitFor({ state: "visible" });
    await desktop.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    assert.equal(await desktop.locator('.gamesense-entry-grid-weapons [data-gamesense-item]').count(), 6);
    assert.ok(await desktop.locator('.gamesense-weapon-entry-card img').count() >= 15);
    assert.match(await desktop.locator('[data-gamesense-item="precision"]').innerText(), /Light Rifles/i);
    const centeredWeaponArt = await desktop.locator('[data-gamesense-item="precision"],[data-gamesense-item="snipers"]').evaluateAll(cards => cards.map(card => {
      const art = card.querySelector(".gamesense-weapon-card-art").getBoundingClientRect();
      const images = [...card.querySelectorAll(".gamesense-weapon-card-art img")].map(image => image.getBoundingClientRect());
      const groupLeft = Math.min(...images.map(image => image.left));
      const groupRight = Math.max(...images.map(image => image.right));
      return { count: images.length, delta: Math.abs((groupLeft + groupRight) / 2 - (art.left + art.right) / 2) };
    }));
    assert.deepEqual(centeredWeaponArt.map(item => item.count), [2, 3]);
    assert.ok(centeredWeaponArt.every(item => item.delta <= 3), JSON.stringify(centeredWeaponArt));
    const weaponTileOrder = await desktop.locator('.gamesense-weapon-entry-card').evaluateAll(cards => cards.map(card => {
      const cardRect = card.getBoundingClientRect();
      const title = card.querySelector(".gamesense-weapon-entry-title").getBoundingClientRect();
      const art = card.querySelector(".gamesense-weapon-card-art").getBoundingClientRect();
      const listing = card.querySelector(".gamesense-entry-copy small").getBoundingClientRect();
      const index = card.querySelector(".gamesense-entry-index").getBoundingClientRect();
      return { cardTop: cardRect.top, titleBottom: title.bottom, artTop: art.top, artBottom: art.bottom, listingTop: listing.top, indexTop: index.top };
    }));
    assert.ok(weaponTileOrder.every(card => card.titleBottom <= card.artTop + 1 && card.artBottom <= card.listingTop + 1 && card.indexTop < card.cardTop), JSON.stringify(weaponTileOrder));
    await desktop.locator(".gamesense-entry-grid-weapons").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-gallery-desktop.png") });
    await desktop.click('[data-gamesense-item="rifles"]');
    await desktop.locator(".gamesense-weapon-panel").waitFor({ state: "visible" });
    assert.equal(await desktop.locator("[data-gamesense-weapon]").count(), 2);
    assert.equal(await desktop.getByText("Fight Plan", { exact: true }).count(), 0);
    assert.equal(await desktop.getByText("Economy Read", { exact: true }).count(), 0);
    await desktop.click('[data-gamesense-weapon="phantom"]');
    assert.equal(await desktop.locator("html").getAttribute("data-gamesense-transition"), null);
    await desktop.locator('[data-gamesense-weapon="phantom"].active').waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /2900 credits/i);
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /21\.2%/i);
    assert.match(await desktop.locator(".gamesense-global-rate").innerText(), /Global usage.*Global kill conversion 1\.03 K\/D.*Global round conversion Economy-filtered/is);
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /When to use it.*How to use it.*Patch history/is);
    assert.match(await desktop.locator(".gamesense-weapon-panel-art").evaluate(panel => getComputedStyle(panel).backgroundImage), /radial-gradient/i);
    assert.equal(await desktop.locator('[data-gamesense-weapon="phantom"].active').count(), 1);
    assert.match(await desktop.locator('[data-gamesense-weapon="phantom"]').evaluate(button => getComputedStyle(button, "::after").content), /Selected/i);
    await desktop.locator(".gamesense-weapon-history summary").click();
    assert.ok(await desktop.locator(".gamesense-weapon-history li").count() >= 2);
    const weaponPatchOrder = await desktop.locator(".gamesense-weapon-history li > span").allInnerTexts();
    assert.deepEqual(weaponPatchOrder, [...weaponPatchOrder].sort((left, right) => Number.parseFloat(right.replace(/[^\d.]/g, "")) - Number.parseFloat(left.replace(/[^\d.]/g, ""))));
    await desktop.locator(".gamesense-weapon-guidance").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-guidance-desktop.png") });
    await desktop.locator(".gamesense-weapon-history").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-history-desktop.png") });
    assert.ok(await desktop.locator(".gamesense-damage-table [role=row]").count() >= 3);
    const contentCoverage = await desktop.evaluate(() => {
      const reference = globalThis.RankedCoachGamesenseReference;
      return {
        agents: reference.agents.every(agent => agent.fundamentals.length >= 3 && agent.lore.length >= 2 && agent.patchHistory.length >= 2),
        weapons: reference.weapons.flatMap(group => group.weapons).every(weapon => weapon.whenToUse.length >= 2 && weapon.howToUse.length >= 2 && weapon.patchHistory.length >= 1)
      };
    });
    assert.deepEqual(contentCoverage, { agents: true, weapons: true });
    await desktop.locator(".gamesense-selector-section").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-detail.png") });
    await desktop.click('.nav-btn[data-page="library"]');
    await desktop.locator(".gamesense-topic-card").first().waitFor({ state: "visible" });
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
    mobile.on("console", message => { if (message.type() === "error") browserErrors.push(`mobile console: ${message.text()}`); });
    mobile.on("pageerror", error => browserErrors.push(`mobile page: ${error.message}`));
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
    await mobile.waitForTimeout(700);
    assert.equal(await mobile.locator(".gamesense-topic-card").count(), 3);
    await mobile.waitForFunction(() => [...document.querySelectorAll('[data-gamesense-topic="weapons"] .gamesense-topic-collage img')].every(image => image.complete && image.naturalWidth > 0));
    const mobileWeaponTopicArt = await mobile.locator('[data-gamesense-topic="weapons"]').evaluate(card => {
      const title = card.querySelector(":scope > strong").getBoundingClientRect();
      const images = [...card.querySelectorAll(".gamesense-topic-collage img")].map(image => image.getBoundingClientRect());
      return { titleTop: title.top, imageBottom: Math.max(...images.map(image => image.bottom)) };
    });
    assert.ok(mobileWeaponTopicArt.imageBottom <= mobileWeaponTopicArt.titleTop, JSON.stringify(mobileWeaponTopicArt));
    await mobile.locator('[data-gamesense-topic="weapons"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapons-topic-mobile.png") });
    assert.equal(await mobile.locator(".gamesense-topic-number").count(), 0);
    await mobile.click('[data-gamesense-topic="maps"]');
    await mobile.waitForFunction(() => document.documentElement.dataset.gamesenseTransition === "forward");
    await mobile.click('[data-gamesense-item="bind"]');
    await mobile.waitForTimeout(360);
    assert.equal(await mobile.locator(".gamesense-tactical-stage img").isVisible(), true);
    assert.equal(await mobile.locator(".gamesense-callout").count(), 10);
    assert.equal(await mobile.locator(".gamesense-tips-hub").count(), 1);
    assert.equal(await mobile.locator("[data-gamesense-tip-view]").count(), 4);
    assert.equal(await mobile.locator('[data-gamesense-tip-view="attack"].active').count(), 1);
    await mobile.locator(".gamesense-tips-hub").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-tips-mobile.png") });
    const mapHeaderOrder = await mobile.locator(".gamesense-map-detail-head").evaluate(header => {
      const back = header.querySelector(".gamesense-back").getBoundingClientRect();
      const patch = header.querySelector(".gamesense-patch").getBoundingClientRect();
      const title = header.querySelector("h2").getBoundingClientRect();
      return { backTop: back.top, patchTop: patch.top, titleLeft: title.left, headerLeft: header.getBoundingClientRect().left };
    });
    assert.ok(mapHeaderOrder.patchTop < mapHeaderOrder.backTop && mapHeaderOrder.titleLeft <= mapHeaderOrder.headerLeft + 20, JSON.stringify(mapHeaderOrder));
    await mobile.locator(".gamesense-map-detail-head").evaluate(header => header.scrollIntoView({ block: "center" }));
    await mobile.waitForTimeout(100);
    await mobile.locator(".gamesense-map-detail-head").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-header-mobile.png") });
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
    await mobile.locator('[data-gamesense-map-zoom="reset"]').click();
    await mobile.locator("[data-gamesense-map-viewport]").scrollIntoViewIfNeeded();
    const mobileCdp = await mobile.context().newCDPSession(mobile);
    const fitScrollStart = await mobile.evaluate(() => {
      const candidates = [document.documentElement, document.body, document.querySelector(".app-scale-wrap"), document.querySelector(".app-root"), document.querySelector(".app")].filter(Boolean);
      const owner = candidates.find(element => element.scrollHeight > element.clientHeight + 1 && ["auto", "scroll"].includes(getComputedStyle(element).overflowY));
      if (owner) owner.scrollTop = Math.max(0, owner.scrollTop - 80);
      const viewport = document.querySelector("[data-gamesense-map-viewport]");
      return { scrollTop: owner?.scrollTop || 0, touchAction: getComputedStyle(viewport).touchAction, overflowY: getComputedStyle(viewport).overflowY };
    });
    const fitMapBox = await mobile.locator("[data-gamesense-map-viewport]").boundingBox();
    const fitTouchX = fitMapBox.x + fitMapBox.width * .5;
    const fitTouchY = fitMapBox.y + fitMapBox.height * .6;
    await mobileCdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: fitTouchX, y: fitTouchY }] });
    await mobileCdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: fitTouchX, y: fitTouchY - 90 }] });
    await mobileCdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await mobile.waitForTimeout(150);
    const fitScrollEnd = await mobile.evaluate(() => {
      const candidates = [document.documentElement, document.body, document.querySelector(".app-scale-wrap"), document.querySelector(".app-root"), document.querySelector(".app")].filter(Boolean);
      const owner = candidates.find(element => element.scrollHeight > element.clientHeight + 1 && ["auto", "scroll"].includes(getComputedStyle(element).overflowY));
      return owner?.scrollTop || 0;
    });
    assert.equal(fitScrollStart.touchAction, "pan-y", JSON.stringify(fitScrollStart));
    assert.equal(fitScrollStart.overflowY, "hidden", JSON.stringify(fitScrollStart));
    assert.ok(fitScrollEnd > fitScrollStart.scrollTop, JSON.stringify({ fitScrollStart, fitScrollEnd }));
    const pinchZoom = await mobile.locator("[data-gamesense-map-viewport]").evaluate(viewport => {
      const rect = viewport.getBoundingClientRect();
      const y = rect.top + rect.height / 2;
      const left = rect.left + rect.width / 2 - 30;
      const right = rect.left + rect.width / 2 + 30;
      const fire = (type, pointerId, x) => viewport.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerId, pointerType: "touch", clientX: x, clientY: y }));
      fire("pointerdown", 51, left);
      fire("pointerdown", 52, right);
      fire("pointermove", 51, left - 35);
      fire("pointermove", 52, right + 35);
      fire("pointerup", 51, left - 35);
      fire("pointerup", 52, right + 35);
      return Number.parseFloat(getComputedStyle(viewport.querySelector("[data-gamesense-map-stage]")).getPropertyValue("--map-zoom"));
    });
    assert.ok(pinchZoom > 1, `expected pinch zoom above 1, received ${pinchZoom}`);
    const ownedMapBox = await mobile.locator("[data-gamesense-map-viewport]").boundingBox();
    const ownedY = ownedMapBox.y + ownedMapBox.height * .5;
    await mobileCdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: ownedMapBox.x + ownedMapBox.width * .72, y: ownedY }] });
    await mobile.waitForTimeout(220);
    await mobileCdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: ownedMapBox.x + ownedMapBox.width * .28, y: ownedY }] });
    await mobileCdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    assert.equal(await mobile.locator("#page-library").getAttribute("class").then(value => value.includes("is-current-page")), true);
    await mobile.locator('[data-gamesense-map-view="plants"]').click();
    await mobile.waitForTimeout(360);
    await mobile.locator('[data-gamesense-map-zoom="reset"]').click();
    assert.equal(await mobile.locator(".gamesense-plant-legend").isVisible(), true);
    const markerBadges = await mobile.locator(".gamesense-plant-marker b").evaluateAll(items => items.map(item => {
      const rect = item.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, visible: rect.width > 0 && rect.height > 0 };
    }));
    assert.ok(markerBadges.every(item => item.visible), JSON.stringify(markerBadges));
    assert.ok(markerBadges.every((item, index) => markerBadges.every((other, otherIndex) => index === otherIndex || item.right <= other.left || item.left >= other.right || item.bottom <= other.top || item.top >= other.bottom)), JSON.stringify(markerBadges));
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
    assert.equal(mobileScroll.tacticalOverflowY, "hidden", JSON.stringify(mobileScroll));
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

    await mobile.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("maps", "breeze"));
    await mobile.locator(".gamesense-comp-option").first().waitFor({ state: "visible" });
    const mobileWeaponSuggestion = await mobile.locator(".gamesense-weapon-suggestion").first().locator("summary").evaluate(summary => {
      const top = summary.querySelector(".gamesense-weapon-suggestion-top").getBoundingClientRect();
      const fit = summary.querySelector(".gamesense-weapon-fit").getBoundingClientRect();
      const side = summary.querySelector(".gamesense-weapon-side")?.getBoundingClientRect() || null;
      const image = summary.querySelector("img").getBoundingClientRect();
      const toggle = summary.querySelector(".gamesense-weapon-suggestion-art i").getBoundingClientRect();
      return { top: top.toJSON(), fit: fit.toJSON(), side: side?.toJSON() || null, toggle: toggle.toJSON(), image: image.toJSON(), summary: summary.getBoundingClientRect().toJSON() };
    });
    assert.ok(mobileWeaponSuggestion.image.top >= mobileWeaponSuggestion.top.bottom && mobileWeaponSuggestion.fit.bottom <= mobileWeaponSuggestion.image.top + 1, JSON.stringify(mobileWeaponSuggestion));
    assert.ok(Math.abs((mobileWeaponSuggestion.toggle.top + mobileWeaponSuggestion.toggle.height / 2) - (mobileWeaponSuggestion.image.top + mobileWeaponSuggestion.image.height / 2)) <= 3, JSON.stringify(mobileWeaponSuggestion));
    await mobile.locator(".gamesense-weapon-suggestions").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-weapons-mobile.png") });
    await mobile.locator("[data-gamesense-comp-agent]").first().click();
    await mobile.waitForTimeout(500);
    const compReadPosition = await mobile.locator(".gamesense-comp-agent-read").evaluate(read => {
      const rect = read.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, viewport: innerHeight };
    });
    assert.ok(compReadPosition.top >= 0 && compReadPosition.bottom <= compReadPosition.viewport, JSON.stringify(compReadPosition));

    await mobile.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("agents"));
    await mobile.locator(".gamesense-agent-entry-card").first().waitFor({ state: "visible" });
    await mobile.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    const mobileAgentTile = await mobile.locator(".gamesense-agent-entry-card").first().evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const index = card.querySelector(".gamesense-entry-index").getBoundingClientRect();
      const image = card.querySelector("img").getBoundingClientRect();
      const name = card.querySelector(".gamesense-entry-copy strong").getBoundingClientRect();
      const hidden = [...card.querySelectorAll("small,.gamesense-entry-copy > span")].every(item => getComputedStyle(item).display === "none");
      return { card: cardRect.toJSON(), index: index.toJSON(), image: image.toJSON(), name: name.toJSON(), hidden };
    });
    assert.ok(mobileAgentTile.index.left > mobileAgentTile.card.left + mobileAgentTile.card.width / 2, JSON.stringify(mobileAgentTile));
    assert.ok(mobileAgentTile.image.left <= mobileAgentTile.card.left + 2 && mobileAgentTile.image.bottom >= mobileAgentTile.card.bottom - 2, JSON.stringify(mobileAgentTile));
    assert.ok(mobileAgentTile.name.left > mobileAgentTile.card.left + mobileAgentTile.card.width / 2 && mobileAgentTile.hidden, JSON.stringify(mobileAgentTile));
    await mobile.locator(".gamesense-entry-grid-agents").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-gallery-mobile.png") });
    await mobile.locator(".gamesense-agent-entry-card").first().click();
    await mobile.locator(".gamesense-agent-rate").waitFor({ state: "visible" });
    await mobile.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    const mobileAgentDetail = await mobile.evaluate(() => {
      const rate = document.querySelector(".gamesense-agent-rate").getBoundingClientRect();
      const art = document.querySelector(".gamesense-agent-portrait-wrap > img").getBoundingClientRect();
      const fieldGuide = document.querySelector(".gamesense-agent-detail-head > div:first-child > span").getBoundingClientRect();
      const active = document.querySelector(".gamesense-agent-detail-actions .gamesense-patch").getBoundingClientRect();
      const back = document.querySelector(".gamesense-agent-detail-actions .gamesense-back").getBoundingClientRect();
      const abilityHeading = document.querySelector(".gamesense-selector-section .gamesense-section-heading strong");
      return { gap: art.top - rate.bottom, activeBottom: active.bottom, backTop: back.top, fieldGuideLeft: fieldGuide.left, activeLeft: active.left, fieldGuideCenterY: fieldGuide.top + fieldGuide.height / 2, activeCenterY: active.top + active.height / 2, abilityAlign: getComputedStyle(abilityHeading).textAlign };
    });
    assert.ok(mobileAgentDetail.gap <= 12 && mobileAgentDetail.activeBottom <= mobileAgentDetail.backTop + 1 && mobileAgentDetail.fieldGuideLeft < mobileAgentDetail.activeLeft && Math.abs(mobileAgentDetail.fieldGuideCenterY - mobileAgentDetail.activeCenterY) <= 4 && mobileAgentDetail.abilityAlign === "left", JSON.stringify(mobileAgentDetail));
    await mobile.locator(".gamesense-agent-detail-head").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-header-mobile.png") });

    await mobile.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons"));
    await mobile.locator(".gamesense-weapon-entry-card").first().waitFor({ state: "visible" });
    await mobile.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    const mobileWeaponTile = await mobile.locator(".gamesense-weapon-entry-card").first().evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const index = card.querySelector(".gamesense-entry-index").getBoundingClientRect();
      const art = card.querySelector(".gamesense-weapon-card-art").getBoundingClientRect();
      const images = [...card.querySelectorAll(".gamesense-weapon-card-art img")].map(image => image.getBoundingClientRect());
      const groupLeft = Math.min(...images.map(image => image.left));
      const groupRight = Math.max(...images.map(image => image.right));
      return { card: cardRect.toJSON(), index: index.toJSON(), art: art.toJSON(), count: images.length, groupCenter: (groupLeft + groupRight) / 2 };
    });
    assert.ok(mobileWeaponTile.index.left > mobileWeaponTile.card.left + mobileWeaponTile.card.width / 2, JSON.stringify(mobileWeaponTile));
    assert.ok(mobileWeaponTile.count === 2 && Math.abs(mobileWeaponTile.groupCenter - (mobileWeaponTile.card.left + mobileWeaponTile.card.width / 2)) <= 3, JSON.stringify(mobileWeaponTile));
    await mobile.locator(".gamesense-entry-grid-weapons").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-gallery-mobile.png") });
    await mobile.locator(".gamesense-weapon-entry-card").first().click();
    await mobile.locator(".gamesense-weapon-detail-head").waitFor({ state: "visible" });
    await mobile.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    const mobileWeaponHeader = await mobile.locator(".gamesense-weapon-detail-head").evaluate(header => {
      const label = header.querySelector(":scope > div:first-child > span").getBoundingClientRect();
      const title = header.querySelector("h2").getBoundingClientRect();
      const patch = header.querySelector(".gamesense-patch").getBoundingClientRect();
      const back = header.querySelector(".gamesense-back").getBoundingClientRect();
      return { label: label.toJSON(), title: title.toJSON(), patch: patch.toJSON(), back: back.toJSON(), header: header.getBoundingClientRect().toJSON() };
    });
    assert.ok(mobileWeaponHeader.label.left <= mobileWeaponHeader.header.left + 20 && mobileWeaponHeader.title.left <= mobileWeaponHeader.header.left + 20, JSON.stringify(mobileWeaponHeader));
    assert.ok(Math.abs((mobileWeaponHeader.label.top + mobileWeaponHeader.label.height / 2) - (mobileWeaponHeader.patch.top + mobileWeaponHeader.patch.height / 2)) <= 4, JSON.stringify(mobileWeaponHeader));
    assert.ok(mobileWeaponHeader.patch.bottom <= mobileWeaponHeader.back.top + 1, JSON.stringify(mobileWeaponHeader));
    assert.match(await mobile.locator(".gamesense-weapon-detail-head").innerText(), /Weapon Dossier.*Rifles.*As of Patch 13\.00.*Back to weapons/is);
    await mobile.locator(".gamesense-weapon-detail-head").evaluate(header => header.scrollIntoView({ block: "center" }));
    await mobile.waitForTimeout(100);
    await mobile.locator(".gamesense-weapon-detail-head").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-header-mobile.png") });
    await mobile.click('.mobile-bottom-page-btn[data-mobile-page="library"]');
    await mobile.locator(".gamesense-topic-card").first().waitFor({ state: "visible" });
    assert.equal(await mobile.locator(".gamesense-topic-card").count(), 3);
    await mobile.waitForTimeout(3000);
    await mobile.screenshot({ path: path.join(__dirname, "tmp", "gamesense-mobile-360x740.png"), fullPage: true });
    await mobile.close();

    assert.deepEqual(browserErrors, []);
    console.log("Gamesense Library checks passed: page scrolling, bottom tactical maps, centered headings, real weapon art, role-colored comps, lore/history, weapon guidance, stable selected-state transitions, attribution guard, and 360x740 containment.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
