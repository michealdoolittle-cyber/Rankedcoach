const assert = require("assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = Number(process.env.RANKEDCOACH_TEST_PORT || 41787);
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };
const pixelPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64");

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/api/content/playlist") {
        // Exercise the Playlist UI with card-sized fixture art. The full map
        // splashes are 1920–3840px wide and make this UI test manufacture a
        // decode stall that production's overview thumbnails deliberately
        // avoid.
        const images = ["thumbs/breeze.jpg", "thumbs/split.jpg", "thumbs/bind.jpg", "thumbs/breeze.jpg", "thumbs/split.jpg", "thumbs/bind.jpg", "thumbs/breeze.jpg"];
        const channels = ["Dopai", "Woohoojin", "Konpeki", "Rooney", "Rem", "Charla7an", "TenZ"];
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify({
          patchLabel: "13.01",
          patchTag: "Patch 13.01 Breakdown Inside",
          newThisWeek: 6,
          newIn24Hours: 6,
          source: "trusted-channel-feeds",
          liveAvailability: { youtube: true, twitch: true },
          liveStreams: [{
            id: "live-stream-1",
            platform: "twitch",
            channel: "Charla7an",
            title: "Radiant ranked coaching",
            viewerCount: 412,
            thumbnail: `http://127.0.0.1:${port}/assets/library/maps/thumbs/bind.jpg`,
            url: "https://www.twitch.tv/charla7an"
          }],
          historicalItems: [
            {
              id: "histmap0001",
              title: "Historical Corrode guide",
              channel: "Archive Coach",
              platform: "youtube",
              sourceType: "owner-curated-research-video",
              topicType: "Map Knowledge",
              targetName: "Corrode",
              thumbnail: `http://127.0.0.1:${port}/assets/library/maps/thumbs/bind.jpg`,
              url: "https://www.youtube.com/watch?v=histmap0001",
              startSeconds: 483,
              archiveOnly: true,
              isLive: false,
              isVod: false,
              isShort: false
            },
            {
              id: "histmap0002",
              title: "Historical Abyss guide",
              channel: "Archive Coach",
              platform: "youtube",
              sourceType: "owner-curated-research-video",
              topicType: "Map Knowledge",
              targetName: "Abyss",
              thumbnail: `http://127.0.0.1:${port}/assets/library/maps/thumbs/breeze.jpg`,
              url: "https://www.youtube.com/watch?v=histmap0002",
              archiveOnly: true,
              isLive: false,
              isVod: false,
              isShort: false
            },
            {
              id: "histagent01",
              title: "Historical Jett guide",
              channel: "Archive Coach",
              platform: "youtube",
              sourceType: "owner-curated-research-video",
              topicType: "Agent",
              targetName: "Jett",
              thumbnail: `http://127.0.0.1:${port}/assets/library/maps/thumbs/split.jpg`,
              url: "https://www.youtube.com/watch?v=histagent01",
              archiveOnly: true,
              isLive: false,
              isVod: false,
              isShort: false
            },
            {
              id: "histrole001",
              title: "Historical Controller guide",
              channel: "Archive Coach",
              platform: "youtube",
              sourceType: "owner-curated-research-video",
              topicType: "Role",
              targetName: "Controller",
              thumbnail: `http://127.0.0.1:${port}/assets/library/maps/thumbs/split.jpg`,
              url: "https://www.youtube.com/watch?v=histrole001",
              archiveOnly: true,
              isLive: false,
              isVod: false,
              isShort: false
            }
          ],
          items: images.map((image, index) => ({
            id: index === 6 ? "d8CXBLRgP-A" : `video${String(index + 1).padStart(6, "0")}`,
            title: ["How to play your role", "Aim routine for ranked", "Breeze map guide", "How to keep calm in ranked", "Yoru buffs in Patch 13.01", "Ranked coaching VOD", "Find your PERFECT Sensitivity and Optimal Settings! | SEN TenZ"][index],
            channel: channels[index],
            platform: index === 5 ? "twitch" : "youtube",
            upstreamId: index === 5 ? "1234567890" : "",
            sourceType: index === 2 ? "youtube-vod" : index === 5 ? "twitch-archive" : index === 6 ? "settings-gear" : "creator-guide",
            topicType: ["Role", "Mechanics", "Map Knowledge", "YT Shorts", "News", "VOD's", "Settings/Gear"][index],
            thumbnail: `http://127.0.0.1:${port}/assets/library/maps/${image}`,
            url: index === 5 ? "https://www.twitch.tv/videos/1234567890" : index === 6 ? "https://www.youtube.com/watch?v=d8CXBLRgP-A" : `https://www.youtube.com/watch?v=video${String(index + 1).padStart(6, "0")}`,
            isNewThisWeek: true,
            isNewIn24Hours: index !== 6,
            isShort: index === 3 || index === 4,
            isVod: index === 2 || index === 5
          }))
        }));
      }
      if (url === "/api/content/skin-media") {
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify({ matches: {} }));
      }
      if (url === "/api/content/knowledge") {
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify({
          updatedAt: null,
          items: [
            { category: "general", entity: "", topic: "General coaching", wording: "General coaching should stay off agent dossiers.", evidence: [] },
            { category: "agent", entity: "Jett", topic: "Jett timing", wording: "Jett-specific utility timing stays with Jett.", evidence: [] }
          ]
        }));
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

const weaponNamesByUuid = Object.freeze({
  "910be174-449b-c412-ab22-d0873436b21b": "Bucky",
  "ae3de142-4d85-2547-dd26-4e90bed35cf7": "Bulldog",
  "29a0cfab-485b-f5d5-779a-b59f85e204a8": "Classic",
  "44d4e95c-4157-0037-81b2-17841bf2e8e3": "Frenzy",
  "1baa85b4-4c70-1284-64bb-6481dfc3bb4e": "Ghost",
  "4ade7faa-4cf1-8376-95ef-39884480959b": "Guardian",
  "ec845bf4-4f79-ddda-a3da-0db3774b2794": "Judge",
  "c4883e50-4494-202c-3ec3-6b8a9284f00b": "Marshal",
  "a03b24d3-4319-996d-0f8c-94bbfba1dfc7": "Operator",
  "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c": "Outlaw",
  "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a": "Phantom",
  "e336c6b8-418d-9340-d77f-7a9e4cfe0702": "Sheriff",
  "42da8ccc-40d5-affc-beec-15aa47b42eda": "Shorty",
  "462080d1-4035-2937-7c09-27aa2a5c27a7": "Spectre",
  "f7e1b454-4ad4-1063-ec0a-159e56b58941": "Stinger",
  "9c82e19d-4575-0200-1a81-3eacf00cf872": "Vandal"
});

function weaponSkinApiStub(url) {
  const uuid = Object.keys(weaponNamesByUuid).find(value => url.includes(value));
  const weaponName = weaponNamesByUuid[uuid] || "Vandal";
  const slug = weaponName.toLowerCase();
  const tiers = [
    "12683d76-48d7-84a3-4e09-6985794f0445",
    "0cebb8be-46d7-c12a-d306-e9907bfc5a25",
    "60bca009-4182-7998-dee7-b8a2558dc369",
    "e046854e-406c-37f4-6607-19a9ba8426fc",
    "411e4a55-4e59-7757-41f0-86a53f101bb5"
  ];
  const defaultCollectionNames = ["Aemondir", "Araxys", "BlastX", "Champions", "Chronovoid", "Evori Dreamwings", "Glitchpop", "Ion", "Kuronami", "Magepunk", "Neptune", "Oni", "Prelude to Chaos", "Prime", "Protocol 781-A", "Radiant Entertainment System", "Reaver", "Recon", "RGX 11z Pro", "Singularity"];
  const collectionNames = weaponName === "Judge"
    ? ["Bound", ...defaultCollectionNames.slice(1)]
    : weaponName === "Vandal"
      ? Array.from({ length: 103 }, (_, index) => defaultCollectionNames[index] || `Archive Collection ${String(index + 1).padStart(3, "0")}`)
      : defaultCollectionNames;
  const variantIndexes = {
    Aemondir: [0, 1, 2],
    Neptune: [0, 1],
    "Prelude to Chaos": [0, 1, 2, 3],
    Reaver: [0, 1, 2, 3],
    "RGX 11z Pro": [0, 1, 2, 3]
  };
  return JSON.stringify({
    status: 200,
    data: {
      displayName: weaponName,
      skins: collectionNames.map((name, index) => ({
        uuid: `${slug}-skin-${index}`,
        displayName: `${name} ${weaponName}`,
        contentTierUuid: name === "Aemondir" ? tiers[2] : tiers[index % tiers.length],
        displayIcon: `http://127.0.0.1:${port}/assets/weapons/${slug}.png?skin=${index}`,
        chromas: (variantIndexes[name] || [0]).map(view => ({
          uuid: `${slug}-skin-${index}-variant-${view}`,
          displayName: `${name} ${weaponName} ${view === 0 ? "Default" : `Variant ${view + 1}`}`,
          fullRender: `http://127.0.0.1:${port}/assets/weapons/${slug}.png?preview=${index}&view=${view}`,
          swatch: `http://127.0.0.1:${port}/assets/weapons/${slug}.png?swatch=${index}&view=${view}`,
          streamedVideo: name === "Reaver" ? "" : `https://media.valorant-api.com/videos/${slug}-${index}-${view}.mp4`
        })),
        levels: (name === "Reaver" ? [1, 2, 3, 4] : [1]).map(level => ({ uuid: `${slug}-skin-${index}-level-${level}`, displayName: `${name} Level ${level}`, streamedVideo: name === "Reaver" ? `https://valorant.dyn.riotcdn.net/x/videos/release-13.00/${slug}-${index}-level-${level}.mp4` : `https://media.valorant-api.com/videos/${slug}-${index}-level-${level}.mp4` }))
      }))
    }
  });
}

async function seed(page, profileId) {
  await page.addInitScript(id => {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", id);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{ id, name: "Library Test", accountName: "Library Test", region: "NA", matches: [] }]));
    // This suite exercises Library rendering, not the once-per-day entrance
    // choreography. Bypass that independent sequence so it cannot leave a
    // newly selected Library page intentionally staged at opacity zero.
    localStorage.setItem("rankedcoach_daily_entrance_v2:guest", JSON.stringify({
      date,
      skipped: true,
      seenPages: [],
      seenSections: []
    }));
  }, profileId);
}

async function stubRankIconPreloads(page) {
  await page.route(/https:\/\/raw\.githubusercontent\.com\/michealdoolittle-cyber\/images\/main\/icons\/[^/?]+_rank\.png(?:\?.*)?$/i, route => {
    route.fulfill({ contentType: "image/png", body: pixelPng });
  });
}

async function dismissWarmup(page) {
  await page.waitForTimeout(1000);
  if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
    await page.click("#dailyWarmupSkip");
  }
}

async function touchWithNaturalDrift(page, locator, delta = { x: 5, y: 3 }) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);
  const box = await locator.boundingBox();
  assert.ok(box, "Touch target must have a rendered bounding box");
  const session = await page.context().newCDPSession(page);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 1, radiusX: 4, radiusY: 4, force: .5 }]
  });
  await session.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + delta.x, y: y + delta.y, id: 1, radiusX: 4, radiusY: 4, force: .5 }]
  });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const browserErrors = [];
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    desktop.on("console", message => { if (message.type() === "error") browserErrors.push(`desktop console: ${message.text()}`); });
    desktop.on("pageerror", error => browserErrors.push(`desktop page: ${error.message}`));
    let delayFirstPlaylistResponse = true;
    await desktop.route("**/api/content/playlist", async route => {
      if (delayFirstPlaylistResponse) {
        delayFirstPlaylistResponse = false;
        await new Promise(resolve => setTimeout(resolve, 2200));
      }
      await route.continue();
    });
    await desktop.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    await desktop.route("https://valorant-api.com/v1/weapons/**", route => route.fulfill({ contentType: "application/json", body: weaponSkinApiStub(route.request().url()) }));
    await desktop.route("https://media.valorant-api.com/contenttiers/**", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="#fff" d="M12 1 23 12 12 23 1 12z"/></svg>' }));
    await desktop.route("https://media.valorant-api.com/videos/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await desktop.route("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await desktop.route("https://valorant.dyn.riotcdn.net/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await desktop.route("https://sketchfab.com/models/**/embed**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Interactive 3D model</title><main>Sketchfab model viewer</main>" }));
    await desktop.route("https://www.youtube-nocookie.com/embed/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Bundle showcase</title>" }));
    await desktop.route(/^https:\/\/player\.twitch\.tv\/\?.*$/i, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Twitch player</title>" }));
    await stubRankIconPreloads(desktop);
    await seed(desktop, "gamesense-desktop");
    await desktop.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(desktop);
    await desktop.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    await dismissWarmup(desktop);
    await desktop.locator('.nav-btn[data-page="library"]').waitFor({ state: "visible", timeout: 10000 });

    assert.equal(await desktop.locator("#logIntentTag").count(), 0, "Logging must not show a fixed intent tag selector.");
    assert.match(await desktop.locator("#logNotes").getAttribute("placeholder"), /What was your playstyle\?/i);

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
    // A category can be chosen before the remote catalog finishes loading.
    // That state must remain a loader, never the false "nothing here" copy.
    await desktop.click('[data-gamesense-topic="playlist"]');
    await desktop.locator(".gamesense-playlist-loading").waitFor({ state: "visible" });
    await desktop.locator('[data-gamesense-playlist-filter="Map Knowledge"]').click();
    assert.equal(await desktop.locator('[data-gamesense-playlist-filter="Map Knowledge"]').getAttribute("aria-selected"), "true");
    assert.equal(await desktop.locator(".gamesense-playlist-loading").count(), 1);
    assert.equal(await desktop.locator(".gamesense-playlist-empty").count(), 0, "A pending Playlist request must not render an empty category.");
    await desktop.locator(".gamesense-playlist-grid .gamesense-video-card").first().waitFor({ state: "visible", timeout: 5000 });
    assert.match(await desktop.locator(".gamesense-playlist-grid").first().innerText(), /Breeze map guide/i);
    await desktop.locator('[data-gamesense-playlist-filter="Home"]').click();
    await desktop.locator(".gamesense-back").click();
    await desktop.locator('[data-gamesense-topic="maps"]').waitFor({ state: "visible" });
    await desktop.waitForTimeout(700);
    assert.equal(await desktop.locator(".gamesense-topic-card").count(), 5);
    assert.equal(await desktop.locator('[data-gamesense-topic="crosshairs"]').count(), 1);
    const topicCardHeights = await desktop.locator(".gamesense-topic-card").evaluateAll(cards => cards.map(card => card.getBoundingClientRect().height));
    assert.ok(topicCardHeights.every(height => height >= 250), JSON.stringify(topicCardHeights));
    const topicAnimations = await desktop.locator(".gamesense-topic-card").evaluateAll(cards => cards.map(card => getComputedStyle(card).animationName));
    assert.ok(topicAnimations.every(name => ["none", "gamesense-rise"].includes(name)), JSON.stringify(topicAnimations));
    const libraryViewAnimations = await desktop.locator(".gamesense-library-view > *").evaluateAll(items => items.map(item => getComputedStyle(item).animationName));
    assert.ok(libraryViewAnimations.every(name => ["none", "gamesense-rise", "gamesense-selected-slide"].includes(name)), JSON.stringify(libraryViewAnimations));
    assert.equal(await desktop.locator(".gamesense-topic-number").count(), 0);
    assert.match(await desktop.locator(".gamesense-season-scope").innerText(), /Active Season.*Season 2026 Act 4.*Patch 13\.00/is);
    assert.equal(await desktop.locator(".gamesense-topic-collage").count(), 5);
    assert.ok(await desktop.locator('[data-gamesense-topic="crosshairs"] .gamesense-crosshair-svg').count() >= 5);
    assert.equal(await desktop.locator('[data-gamesense-topic="maps"] .gamesense-topic-collage img').count(), 13);
    await desktop.waitForFunction(() => [...document.querySelectorAll('[data-gamesense-topic="maps"] .gamesense-topic-collage img')].every(image => image.loading === "eager" && image.fetchPriority === "high" && image.complete && image.naturalWidth > 0));
    const mapOverviewImages = await desktop.locator('[data-gamesense-topic="maps"] .gamesense-topic-collage img').evaluateAll(images => images.map(image => ({
      currentSrc: image.currentSrc,
      fallbackUsed: image.dataset.gamesenseOverviewFallbackUsed || "",
      filter: getComputedStyle(image).filter,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight
    })));
    assert.ok(mapOverviewImages.every(image => /\/assets\/library\/maps\/thumbs\/[a-z-]+\.jpg$/i.test(image.currentSrc)), JSON.stringify(mapOverviewImages));
    assert.ok(mapOverviewImages.every(image => image.fallbackUsed === "" && image.filter === "none" && image.naturalWidth <= 400 && image.naturalHeight <= 240), JSON.stringify(mapOverviewImages));
    await desktop.waitForFunction(() => [...document.querySelectorAll('[data-gamesense-topic="agents"] .gamesense-topic-agent-art')].every(image => image.complete && image.naturalWidth > 0));
    const agentOverviewImages = await desktop.locator('[data-gamesense-topic="agents"] .gamesense-topic-agent-art').evaluateAll(images => images.map(image => ({
      currentSrc: image.currentSrc,
      loading: image.loading,
      fetchPriority: image.fetchPriority,
      complete: image.complete,
      naturalWidth: image.naturalWidth
    })));
    assert.equal(agentOverviewImages.length, 4, JSON.stringify(agentOverviewImages));
    assert.ok(agentOverviewImages.every(image => /\/assets\/library\/agents\/[a-z-]+\/portrait-card\.png$/i.test(image.currentSrc) && image.loading === "eager" && image.fetchPriority === "high" && image.complete && image.naturalWidth > 0 && image.naturalWidth <= 400), JSON.stringify(agentOverviewImages));
    const mapTopicCollageState = await desktop.locator('[data-gamesense-topic="maps"] .gamesense-topic-collage').evaluate(collage => {
      const images = [...collage.querySelectorAll("img")];
      const wide = images[12];
      const wideStyle = getComputedStyle(wide);
      return {
        columns: getComputedStyle(collage).gridTemplateColumns.split(" ").length,
        rows: getComputedStyle(collage).gridTemplateRows.split(" ").length,
        wideColumn: wideStyle.gridColumn,
        wideRow: wideStyle.gridRow
      };
    });
    assert.equal(mapTopicCollageState.columns, 3, JSON.stringify(mapTopicCollageState));
    assert.equal(mapTopicCollageState.rows, 5, JSON.stringify(mapTopicCollageState));
    assert.equal(mapTopicCollageState.wideColumn, "1 / -1", JSON.stringify(mapTopicCollageState));
    assert.match(mapTopicCollageState.wideRow, /^5(?: \/ auto)?$/, JSON.stringify(mapTopicCollageState));
    await desktop.locator('[data-gamesense-topic="maps"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-maps-topic-desktop.png") });
    assert.equal(await desktop.locator('[data-gamesense-topic="weapons"] .gamesense-topic-collage img').count(), 19);
    await desktop.waitForFunction(() => [...document.querySelectorAll('[data-gamesense-topic="weapons"] .gamesense-topic-collage img')].every(image => image.complete && image.naturalWidth > 0));
    assert.equal(await desktop.locator('[data-gamesense-topic="weapons"] .gamesense-topic-collage img').evaluateAll(images => images.every(image => image.src.includes("/assets/weapons/") || image.src.includes("media.valorant-api.com/weapons/"))), true);
    assert.equal(await desktop.locator('[data-gamesense-topic="weapons"] img[src*="weapons-dossier-v2"]').count(), 0);
    const weaponTopicArt = await desktop.locator('[data-gamesense-topic="weapons"]').evaluate(card => {
      const title = card.querySelector(":scope > strong").getBoundingClientRect();
      const action = card.querySelector(".gamesense-topic-action").getBoundingClientRect();
      const copy = card.querySelector(":scope > small").getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const images = [...card.querySelectorAll(".gamesense-topic-collage img")];
      const imageRects = images.map(image => image.getBoundingClientRect().toJSON());
      const cardCenter = (cardRect.left + cardRect.right) / 2;
      return {
        card: cardRect.toJSON(),
        titleTop: title.top,
        titleBottom: title.bottom,
        titleCenterDelta: Math.abs((title.left + title.right) / 2 - cardCenter),
        titleVerticalDelta: Math.abs((title.top + title.bottom) / 2 - (cardRect.top + cardRect.bottom) / 2),
        actionCenterDelta: Math.abs((action.left + action.right) / 2 - cardCenter),
        copyCenterDelta: Math.abs((copy.left + copy.right) / 2 - cardCenter),
        titleColor: getComputedStyle(card.querySelector(":scope > strong")).color,
        actionBottom: action.bottom,
        actionTop: action.top,
        copyBottom: copy.bottom,
        copyTop: copy.top,
        imageRects,
        filters: images.map(image => getComputedStyle(image).filter)
      };
    });
    assert.ok(weaponTopicArt.imageRects.every(image => image.left >= weaponTopicArt.card.left && image.right <= weaponTopicArt.card.right && image.top >= weaponTopicArt.card.top && image.bottom <= weaponTopicArt.card.bottom), JSON.stringify(weaponTopicArt));
    assert.equal(weaponTopicArt.titleColor, "rgb(246, 196, 83)");
    assert.ok(weaponTopicArt.filters.every(filter => filter === "none"), JSON.stringify(weaponTopicArt));
    assert.ok(weaponTopicArt.actionBottom <= weaponTopicArt.titleTop + 1 && weaponTopicArt.titleBottom <= weaponTopicArt.copyTop + 1, JSON.stringify(weaponTopicArt));
    assert.ok(weaponTopicArt.actionTop <= weaponTopicArt.card.top + 32 && weaponTopicArt.titleVerticalDelta <= 12 && weaponTopicArt.card.bottom - weaponTopicArt.copyBottom <= 32, JSON.stringify(weaponTopicArt));
    assert.ok(weaponTopicArt.titleCenterDelta <= 1 && weaponTopicArt.actionCenterDelta <= 1 && weaponTopicArt.copyCenterDelta <= 1, JSON.stringify(weaponTopicArt));
    await desktop.locator('[data-gamesense-topic="weapons"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapons-topic-desktop.png") });
    assert.equal(await desktop.getByText("Reference Room", { exact: true }).count(), 0);
    assert.equal(await desktop.locator("#page-library").getByText(/Round Plan|Role Read|Gunfight Plan/).count(), 0);
    assert.equal(await desktop.locator(".gamesense-topic-card strong").evaluateAll(headings => headings.every(heading => getComputedStyle(heading).textAlign === "center")), true);
    await desktop.locator('[data-gamesense-topic="playlist"] .gamesense-topic-collage img').first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator('[data-gamesense-topic="playlist"] .gamesense-topic-collage img').count(), 4);
    assert.equal(await desktop.locator('[data-gamesense-topic="playlist"] .gamesense-playlist-play').count(), 1);
    assert.equal(await desktop.locator('[data-gamesense-topic="playlist"] .gamesense-playlist-new, [data-gamesense-topic="playlist"] .gamesense-playlist-status').count(), 0);
    const playlistTitleLayout = await desktop.locator('[data-gamesense-topic="playlist"] .gamesense-playlist-title').evaluate(title => {
      const label = title.getBoundingClientRect();
      const play = title.querySelector(".gamesense-playlist-play").getBoundingClientRect();
      return { label: label.toJSON(), play: play.toJSON() };
    });
    assert.ok(playlistTitleLayout.play.left > playlistTitleLayout.label.left + playlistTitleLayout.label.width / 2 && Math.abs((playlistTitleLayout.play.top + playlistTitleLayout.play.height / 2) - (playlistTitleLayout.label.top + playlistTitleLayout.label.height / 2)) <= 2, JSON.stringify(playlistTitleLayout));
    assert.equal(await desktop.locator('[data-gamesense-topic="playlist"] .gamesense-playlist-patch').count(), 0);
    await desktop.locator('[data-gamesense-topic="playlist"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-playlist-topic-default.png") });
    await desktop.evaluate(() => {
      document.body.dataset.layoutShape = "hazardedge";
      document.body.dataset.layoutStyle = "hazardedge";
    });
    await desktop.locator('[data-gamesense-topic="playlist"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-playlist-topic-hazardedge.png") });
    await desktop.evaluate(() => {
      delete document.body.dataset.layoutShape;
      delete document.body.dataset.layoutStyle;
    });
    await desktop.click('[data-gamesense-topic="playlist"]');
    await desktop.locator(".gamesense-playlist-grid .gamesense-video-card").first().waitFor({ state: "visible" });
    await desktop.waitForTimeout(700);
    assert.equal(await desktop.locator(".gamesense-playlist-home > .gamesense-playlist-grid:not(.gamesense-live-grid) .gamesense-video-card").count(), 5);
    assert.doesNotMatch(await desktop.locator(".gamesense-playlist-home > .gamesense-playlist-grid:not(.gamesense-live-grid)").innerText(), /Ranked coaching VOD/i);
    assert.equal(await desktop.locator(".gamesense-playlist-filters button").count(), 14);
    assert.equal(await desktop.locator(".gamesense-playlist-filters button").first().getAttribute("data-gamesense-playlist-filter"), "All");
    assert.equal(await desktop.locator(".gamesense-playlist-filters button").last().getAttribute("data-gamesense-playlist-filter"), "Historical Archive");
    assert.equal(await desktop.locator('[data-gamesense-playlist-filter="Home"] .gamesense-playlist-home-icon').count(), 1);
    const playlistFilterThemeState = await desktop.locator(".gamesense-playlist-filters").evaluate(filters => {
      const active = getComputedStyle(filters.querySelector("button.active"));
      const inactive = getComputedStyle(filters.querySelector("button:not(.active)"));
      return { activeBackground: active.backgroundColor, activeBorder: active.borderColor, inactiveBackground: inactive.backgroundColor, inactiveBorder: inactive.borderColor };
    });
    assert.notEqual(playlistFilterThemeState.activeBackground, playlistFilterThemeState.inactiveBackground, JSON.stringify(playlistFilterThemeState));
    assert.notEqual(playlistFilterThemeState.activeBorder, playlistFilterThemeState.inactiveBorder, JSON.stringify(playlistFilterThemeState));
    assert.match(await desktop.locator(".gamesense-live-card").innerText(), /Charla7an.*412 watching/is);
    assert.equal(await desktop.locator('.gamesense-video-card a[href*="youtube.com/watch"]').count(), 5);
    await desktop.locator(".gamesense-playlist-gallery-head").scrollIntoViewIfNeeded();
    await desktop.screenshot({ path: path.join(__dirname, "tmp", "gamesense-playlist-home-desktop.png") });
    await desktop.locator(".gamesense-live-card [data-gamesense-play-twitch]").click();
    const desktopTwitchEmbed = desktop.locator("#gamesenseMediaOverlay .gamesense-twitch-embed");
    assert.match(await desktopTwitchEmbed.getAttribute("src"), /player\.twitch\.tv\/\?.*parent=127\.0\.0\.1.*autoplay=false.*channel=Charla7an/i);
    assert.equal(await desktopTwitchEmbed.getAttribute("allowfullscreen"), "");
    await desktop.locator("#gamesenseMediaOverlay [data-gamesense-close-media]").click();
    await desktop.locator(".gamesense-playlist-home .gamesense-video-card [data-gamesense-play-video]").first().click();
    const desktopYouTubeEmbed = desktop.locator("#gamesenseMediaOverlay .gamesense-video-embed:not(.gamesense-twitch-embed)");
    assert.match(await desktopYouTubeEmbed.getAttribute("src"), /youtube-nocookie\.com\/embed\/video000001\?.*autoplay=0.*controls=1.*fs=1.*playsinline=1.*rel=0/i);
    assert.match(await desktopYouTubeEmbed.getAttribute("src"), /enablejsapi=1/i, "Playlist players must subscribe to the YouTube playback API before tracking a watch.");
    await desktopYouTubeEmbed.evaluate(frame => {
      window.dispatchEvent(new MessageEvent("message", {
        source: frame.contentWindow,
        origin: "https://www.youtube-nocookie.com",
        data: JSON.stringify({ event: "onStateChange", info: 1 })
      }));
    });
    await desktop.waitForFunction(() => {
      const profiles = JSON.parse(localStorage.getItem("valtracker_profiles_v1") || "[]");
      return profiles.some(profile => profile?.watchedPlaylistVideos?.some(record => record?.id === "youtube:video000001"));
    });
    assert.equal(await desktop.locator('[data-video-id="video000001"] .gamesense-video-watched').count(), 1, "A real YouTube playing event must mark the matching Playlist card watched.");
    const desktopYouTubeHitState = await desktopYouTubeEmbed.evaluate(frame => {
      const rect = frame.getBoundingClientRect();
      return {
        pointerEvents: getComputedStyle(frame).pointerEvents,
        allow: frame.getAttribute("allow"),
        allowFullscreen: frame.hasAttribute("allowfullscreen"),
        hitAtControls: document.elementFromPoint(rect.left + rect.width / 2, rect.bottom - 12) === frame
      };
    });
    assert.equal(desktopYouTubeHitState.pointerEvents, "auto", JSON.stringify(desktopYouTubeHitState));
    assert.equal(desktopYouTubeHitState.allowFullscreen, true, JSON.stringify(desktopYouTubeHitState));
    assert.match(desktopYouTubeHitState.allow, /fullscreen/);
    assert.equal(desktopYouTubeHitState.hitAtControls, true, JSON.stringify(desktopYouTubeHitState));
    await desktop.locator("#gamesenseMediaOverlay .gamesense-media-dialog").screenshot({ path: path.join(__dirname, "tmp", "gamesense-playlist-embeds-desktop.png") });
    await desktop.locator("#gamesenseMediaOverlay [data-gamesense-close-media]").click();
    await desktop.locator('[data-gamesense-playlist-filter="YT Shorts"]').click();
    assert.equal(await desktop.locator(".gamesense-playlist-grid .gamesense-video-card").count(), 1);
    await desktop.locator('[data-gamesense-playlist-filter="News"]').click();
    assert.match(await desktop.locator(".gamesense-playlist-grid").innerText(), /Yoru buffs in Patch 13\.01/i);
    await desktop.locator("[data-gamesense-playlist-filter=\"VOD's\"]").click();
    assert.equal(await desktop.locator(".gamesense-playlist-grid .gamesense-video-card").count(), 2);
    assert.match(await desktop.locator(".gamesense-playlist-grid").innerText(), /Breeze map guide/i);
    assert.match(await desktop.locator(".gamesense-playlist-grid").innerText(), /Ranked coaching VOD/i);
    await desktop.locator('[data-gamesense-playlist-filter="Live"]').click();
    assert.equal(await desktop.locator('[data-gamesense-playlist-filter="Live"]').getAttribute("aria-label"), "Live streams");
    assert.match(await desktop.locator('[data-gamesense-playlist-filter="Live"]').innerText(), /Live\s*🔴/u);
    assert.match(await desktop.locator(".gamesense-playlist-grid").innerText(), /Charla7an.*412 watching/is);
    assert.doesNotMatch(await desktop.locator(".gamesense-playlist-grid").innerText(), /Ranked coaching VOD/i);
    await desktop.locator('[data-gamesense-playlist-filter="Settings/Gear"]').click();
    assert.match(await desktop.locator(".gamesense-playlist-grid").innerText(), /Optimal Settings.*TenZ/is);
    await desktop.locator('[data-gamesense-playlist-filter="Map Knowledge"]').click();
    assert.match(await desktop.locator(".gamesense-playlist-catalog-section.is-historical").innerText(), /Historical (Corrode|Abyss) guide/i);
    const mapKnowledgeAutoplay = desktop.locator('[data-gamesense-playlist-autoplay="Map Knowledge"]');
    assert.equal(await mapKnowledgeAutoplay.getAttribute("aria-pressed"), "false");
    await mapKnowledgeAutoplay.click();
    assert.equal(await desktop.locator('[data-gamesense-playlist-autoplay="Map Knowledge"]').getAttribute("aria-pressed"), "true");
    assert.equal(await desktop.evaluate(() => localStorage.getItem("rankedcoach:playlist-autoplay:map-knowledge")), "true");
    await desktop.locator('.gamesense-video-card[data-gamesense-playlist-category="Map Knowledge"] [data-gamesense-play-video]').first().click();
    const autoplayStartingEmbed = desktop.locator("#gamesenseMediaOverlay .gamesense-video-embed:not(.gamesense-twitch-embed)");
    assert.match(await autoplayStartingEmbed.getAttribute("src"), /video000003\?.*autoplay=0/i);
    await autoplayStartingEmbed.evaluate(frame => {
      window.dispatchEvent(new MessageEvent("message", {
        source: frame.contentWindow,
        origin: "https://www.youtube-nocookie.com",
        data: JSON.stringify({ event: "onStateChange", info: 1 })
      }));
      window.dispatchEvent(new MessageEvent("message", {
        source: frame.contentWindow,
        origin: "https://www.youtube-nocookie.com",
        data: JSON.stringify({ event: "onStateChange", info: 0 })
      }));
    });
    await desktop.waitForFunction(() => /histmap0001\?.*autoplay=1/i.test(document.querySelector("#gamesenseMediaOverlay .gamesense-video-embed")?.getAttribute("src") || ""));
    await desktop.locator("#gamesenseMediaOverlay [data-gamesense-close-media]").click();
    await desktop.locator('[data-gamesense-playlist-filter="Agent"]').click();
    assert.match(await desktop.locator(".gamesense-playlist-catalog-section.is-historical").innerText(), /Historical Jett guide/i);
    await desktop.locator('[data-gamesense-playlist-filter="Role"]').click();
    assert.match(await desktop.locator(".gamesense-playlist-catalog-section.is-historical").innerText(), /Historical Controller guide/i);
    await desktop.locator('[data-gamesense-playlist-filter="Historical Archive"]').click();
    assert.equal(await desktop.locator('[data-gamesense-playlist-filter="Historical Archive"]').getAttribute("aria-selected"), "true");
    assert.equal(await desktop.locator(".gamesense-playlist-historical-group").count(), 4, "Historical guides must remain grouped by their original category and target.");
    await desktop.locator(".gamesense-playlist-historical-group", { hasText: "Corrode" }).locator("summary").click();
    await desktop.locator('[data-video-id="histmap0001"] [data-gamesense-play-video]').click();
    assert.match(await desktop.locator("#gamesenseMediaOverlay .gamesense-video-embed").getAttribute("src"), /start=483/);
    await desktop.locator("#gamesenseMediaOverlay [data-gamesense-close-media]").click();
    await desktop.locator('[data-gamesense-playlist-filter="All"]').click();
    assert.equal(await desktop.locator(".gamesense-playlist-grid .gamesense-video-card").count(), 7, "All must render every Playlist item without filtering.");
    await desktop.locator(".gamesense-back").click();
    await desktop.locator('[data-gamesense-topic="maps"]').waitFor({ state: "visible" });
    await desktop.click('[data-gamesense-topic="maps"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator('[data-gamesense-map-season="all"]').count(), 0);
    assert.equal(await desktop.locator('[data-gamesense-map-season="in"]').getAttribute("aria-selected"), "true");
    assert.equal(await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').count(), 7);
    assert.equal(await desktop.locator('.gamesense-map-entry-card').evaluateAll(cards => cards.every(card => getComputedStyle(card, "::after").backgroundImage !== "none")), true);
    const mapLabels = await desktop.locator('.gamesense-map-card-copy strong').allInnerTexts();
    assert.deepEqual([...mapLabels].sort(), ["ASCENT", "BREEZE", "HAVEN", "LOTUS", "SPLIT", "SUMMIT", "SUNSET"]);
    assert.equal(await desktop.locator('.gamesense-map-card-copy strong').evaluateAll(labels => labels.every(label => getComputedStyle(label).color === "rgb(246, 196, 83)")), true);
    await desktop.click('[data-gamesense-map-season="in"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator('[data-gamesense-map-season="in"]').getAttribute("aria-selected"), "true");
    assert.equal(await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').count(), 7);
    assert.equal(await desktop.locator('.gamesense-map-entry-card:not(.is-out-of-season) .gamesense-map-card-frame').count(), 7);
    assert.equal(await desktop.locator('.gamesense-map-entry-card:not(.is-out-of-season) .gamesense-map-side-marks').count(), 7);
    assert.equal(await desktop.locator('.gamesense-map-entry-card:not(.is-out-of-season) .gamesense-map-side-mark').count(), 14);
    assert.equal(await desktop.locator('.gamesense-map-entry-card:not(.is-out-of-season) .gamesense-map-side-mark.is-attack .gamesense-attack-swords-icon').count(), 7);
    assert.equal(await desktop.locator('.gamesense-map-side-mark.is-attack').first().evaluate(icon => getComputedStyle(icon).color), "rgb(255, 70, 85)");
    assert.equal(await desktop.locator('.gamesense-defense-shield-icon').count(), 7);
    assert.equal(await desktop.locator('.gamesense-defense-shield-half').count(), 7);
    assert.equal(await desktop.locator('.gamesense-defense-shield-split').count(), 7);
    assert.equal(await desktop.locator('.gamesense-map-entry-card.is-out-of-season').count(), 0);
    await desktop.click('[data-gamesense-map-season="out"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator('[data-gamesense-map-season="out"]').getAttribute("aria-selected"), "true");
    assert.equal(await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').count(), 6);
    assert.deepEqual([...await desktop.locator('.gamesense-map-card-copy strong').allInnerTexts()].sort(), ["ABYSS", "BIND", "CORRODE", "FRACTURE", "ICEBOX", "PEARL"]);
    assert.equal(await desktop.locator('.gamesense-map-entry-card.is-out-of-season .gamesense-map-side-marks').count(), 0);
    const outOfSeasonMap = desktop.locator('.gamesense-map-entry-card.is-out-of-season');
    assert.equal(await outOfSeasonMap.count(), 6);
    assert.equal(await outOfSeasonMap.evaluateAll(cards => cards.every(card => !card.disabled)), true);
    assert.equal(await outOfSeasonMap.evaluateAll(cards => cards.every(card => /grayscale/.test(getComputedStyle(card).filter))), true);
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
    assert.equal(await desktop.locator(".gamesense-map-card-copy strong").first().evaluate(title => getComputedStyle(title).color), "rgb(246, 196, 83)");
    await desktop.click('[data-gamesense-item="bind"]');
    await desktop.locator(".gamesense-tips-hub").waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-map-detail-head").evaluate(header => getComputedStyle(header).backgroundImage), /splash\.png/i);
    assert.match(await desktop.locator(".gamesense-map-detail-head").innerText(), /Bind/i);
    assert.match(await desktop.locator(".gamesense-map-detail-head .gamesense-patch").innerText(), /^AS OF V26 ACT 2$/, "An archived act is a seasonal period, not a Patch V26 label.");
    assert.equal(await desktop.locator(".gamesense-tips-hub").count(), 1);
    assert.equal(await desktop.locator("[data-gamesense-tip-view]").count(), 4);
    assert.equal(await desktop.locator("[data-gamesense-role]").count(), 5);
    assert.equal(await desktop.locator('.gamesense-tip-grid .gamesense-tip').count(), 2);
    assert.equal(await desktop.locator(".gamesense-tactical-stage img").count(), 1);
    assert.match(await desktop.locator(".gamesense-tactical-stage img").getAttribute("src"), /bind-layout-labeled\.svg$/);
    assert.equal(await desktop.locator(".gamesense-callout").count(), 0);
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 3, "Retained verified data should populate every map's composition reference.");
    assert.equal(await desktop.locator(".gamesense-comp-unavailable").count(), 0);
    assert.doesNotMatch(await desktop.locator(".gamesense-comp-card").innerText(), /Tracker Network|Data Still In Review/i);
    assert.match(await desktop.locator(".gamesense-map-detail-head").innerText(), /Bind.*Out of Season/is);
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion").count(), 5);
    assert.equal(await desktop.locator(".gamesense-round-conversion.is-unavailable").count(), 0);
    assert.match(await desktop.locator(".gamesense-weapon-suggestions").textContent(), /Round conversion percent uses VStats\.gg Ascendant-to-Radiant V26 Act 2 map and economy sample/i);
    assert.equal(await desktop.locator(".gamesense-role-result").count(), 0);
    assert.equal(await desktop.locator(".gamesense-map-view-tabs button").count(), 3);
    assert.equal(await desktop.locator(".gamesense-map-view-tabs button").evaluateAll(buttons => buttons.every(button => getComputedStyle(button).textAlign === "center")), true);
    assert.equal(await desktop.locator(".gamesense-map-heading strong").evaluate(heading => getComputedStyle(heading).textAlign), "left");
    await desktop.click('[data-gamesense-map-view="plants"]');
    await desktop.locator(".gamesense-callout.gamesense-plant-marker").first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-callout.gamesense-plant-marker").count(), 5);
    assert.equal(await desktop.locator(".gamesense-plant-legend > div").count(), 5);
    assert.equal(await desktop.locator(".gamesense-plant-preview-toggle").count(), 5);
    const bindPlantLegend = await desktop.locator(".gamesense-plant-legend").innerText();
    assert.match(bindPlantLegend, /Plant location reference/i);
    assert.doesNotMatch(bindPlantLegend, /(?:plant share|\d+\.\d+%|N\/A)/i);
    const bindPlantRows = desktop.locator(".gamesense-plant-row");
    await bindPlantRows.first().locator(".gamesense-plant-preview-toggle").click();
    assert.equal(await bindPlantRows.first().locator(".gamesense-plant-preview").isVisible(), true);
    assert.equal(await bindPlantRows.first().locator(".gamesense-plant-preview-toggle").getAttribute("aria-expanded"), "true");
    assert.match(await bindPlantRows.first().locator(".gamesense-plant-preview img").getAttribute("src"), /^https:\/\//);
    await bindPlantRows.nth(1).locator(".gamesense-plant-preview-toggle").click();
    assert.equal(await bindPlantRows.first().locator(".gamesense-plant-preview").isVisible(), false);
    assert.equal(await bindPlantRows.nth(1).locator(".gamesense-plant-preview").isVisible(), true);
    await desktop.click('[data-gamesense-map-view="heatmap"]');
    await desktop.locator('.gamesense-heatmap-stage').waitFor({ state: "visible" });
    assert.equal(await desktop.locator('.gamesense-callout').count(), 0, "The heat map is a standalone visual layer without duplicate tactical markers.");
    assert.match(await desktop.locator('.gamesense-heatmap-stage img').getAttribute("src"), /vstats\.gg\/statistics\/9d85c932-4820-c060-09c3-668636d4df1b\/ALL\/Duality\/heatmaps\/plants_ALL_Plants\.webp$/);
    assert.match(await desktop.locator('.gamesense-heatmap-meta').innerText(), /V26 Act 2/i);
    const heatmapManifest = await desktop.evaluate(() => globalThis.RankedCoachGamesenseHeatmaps);
    assert.deepEqual(Object.keys(heatmapManifest).sort(), ["abyss", "ascent", "bind", "breeze", "corrode", "fracture", "haven", "icebox", "lotus", "pearl", "split", "summit", "sunset"]);
    assert.equal(Object.values(heatmapManifest).filter(entry => entry.image).length, 13);
    assert.match(heatmapManifest.icebox.image, /ac12e9b3-47e6-9599-8fa1-0bb473e5efc7\/ALL\/Port\/heatmaps\/plants_ALL_Plants\.webp$/);
    assert.equal(heatmapManifest.icebox.actLabel, "V25 Act 4");
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
    await desktop.locator(".gamesense-tactical-card").evaluate(node => { window.__rankedCoachTacticalNode = node; });
    await desktop.locator(".gamesense-comp-card").evaluate(node => { window.__rankedCoachCompCardNode = node; });
    await desktop.locator(".gamesense-tips-panel").evaluate(node => { window.__rankedCoachTipsPanelNode = node; });
    await desktop.click(".gamesense-role-lens-menu summary");
    await desktop.click('[data-gamesense-role="Controller"]');
    await desktop.locator('[data-gamesense-role="Controller"].active').waitFor({ state: "attached" });
    assert.equal(await desktop.locator(".gamesense-tactical-card").evaluate(node => window.__rankedCoachTacticalNode === node && node.isConnected), true);
    assert.equal(await desktop.locator(".gamesense-comp-card").evaluate(node => window.__rankedCoachCompCardNode === node && node.isConnected), true);
    assert.equal(await desktop.locator(".gamesense-tips-panel").evaluate(node => window.__rankedCoachTipsPanelNode !== node && !window.__rankedCoachTipsPanelNode.isConnected), true);
    assert.equal(await desktop.locator('[data-gamesense-role="Controller"]').getAttribute("aria-pressed"), "true");
    assert.match(await desktop.locator(".gamesense-role-lens-menu summary").innerText(), /Controller/i);
    await desktop.click('[data-gamesense-tip-view="sites"]');
    await desktop.locator('[data-gamesense-tip-view="sites"].active').waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-tips-panel").innerText(), /Controller lens.*A Lamps \/ U-Haul|A Lamps \/ U-Haul.*Controller lens/is);
    assert.ok(await desktop.locator(".gamesense-tip.is-role-tip").count() >= 1);
    await desktop.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    await desktop.locator(".gamesense-tips-hub").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-tips-desktop.png") });
    await desktop.locator(".gamesense-tactical-card").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-marked.png") });
    assert.match(await desktop.locator(".gamesense-patch").innerText(), /As of V26 Act 2/i);
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
    await desktop.click('[data-gamesense-map-season="in"]');
    await desktop.locator('[data-gamesense-item="breeze"]').waitFor({ state: "visible" });
    await desktop.click('[data-gamesense-item="breeze"]');
    await desktop.locator(".gamesense-comp-option").first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 3);
    assert.equal(await desktop.locator(".gamesense-comp-agents img").count(), 15);
    assert.match(await desktop.locator(".gamesense-comp-card").innerText(), /Ascendant to Radiant.*Patch 13\.00.*Primary role layout.*Secondary role layout.*Alternate role layout/is);
    assert.doesNotMatch(await desktop.locator(".gamesense-comp-card").innerText(), /All ranks|Individual agent strength/i);
    assert.match(await desktop.locator(".gamesense-comp-source").innerText(), /High-rank Competitive selection reference.*same rank window.*observed five-agent structure/is);
    assert.equal(await desktop.locator(".gamesense-comp-patch").innerText(), "PATCH 13.00");
    assert.notEqual(await desktop.locator(".gamesense-comp-patch").evaluate(pill => getComputedStyle(pill).backgroundColor), "rgba(0, 0, 0, 0)");
    assert.equal(await desktop.locator(".gamesense-comp-winrate").count(), 0);
    assert.doesNotMatch(await desktop.locator(".gamesense-comp-card").innerText(), /\d+\.\d+% win rate|\d{1,3}(?:,\d{3})+ games|strongest measured compositions/i);
    assert.deepEqual(await desktop.locator(".gamesense-comp-reference-label").allInnerTexts(), ["PRIMARY ROLE LAYOUT", "SECONDARY ROLE LAYOUT", "ALTERNATE ROLE LAYOUT"]);
    assert.equal(await desktop.locator(".gamesense-comp-composition").count(), 0);
    const compRoleLayouts = await desktop.locator(".gamesense-comp-option").evaluateAll(options => options.map(option => {
      const makeup = option.querySelector(".gamesense-comp-makeup");
      const counts = [...makeup.querySelectorAll(".gamesense-comp-role-stat")].map(stat => ({
        role: stat.querySelector("i").dataset.roleTone,
        count: Number(stat.querySelector("b").textContent.trim()),
        color: getComputedStyle(stat.querySelector("b")).color
      }));
      return { label: makeup.getAttribute("aria-label"), signature: counts.map(item => `${item.role}:${item.count}`).join("|"), total: counts.reduce((sum, item) => sum + item.count, 0), counts };
    }));
    assert.equal(new Set(compRoleLayouts.map(layout => layout.signature)).size, 3, JSON.stringify(compRoleLayouts));
    assert.ok(compRoleLayouts.every(layout => layout.total === 5 && layout.counts.every(item => Number.isInteger(item.count) && item.color === "rgb(246, 196, 83)")), JSON.stringify(compRoleLayouts));
    assert.equal(await desktop.locator(".gamesense-comp-option").first().locator(".gamesense-comp-agent-rate b").count(), 5);
    assert.equal(await desktop.locator(".gamesense-comp-option").first().locator(".gamesense-comp-agent-rate b").evaluateAll(values => values.every(value => /^\d+\.\d+%$/.test(value.textContent.trim()))), true);
    const compPresentation = await desktop.locator(".gamesense-comp-option").first().evaluate(option => {
      const line = option.querySelector(".gamesense-comp-line").getBoundingClientRect();
      const agents = option.querySelector(".gamesense-comp-agents").getBoundingClientRect();
      const summary = option.querySelector(".gamesense-comp-role-summary");
      const makeup = summary.querySelector(".gamesense-comp-makeup").getBoundingClientRect();
      const buttons = [...option.querySelectorAll(".gamesense-comp-agents button")].map(button => ({
        role: button.dataset.roleTone,
        background: getComputedStyle(button).backgroundImage,
        border: getComputedStyle(button).borderColor,
        identity: button.querySelector(".gamesense-comp-agent-identity").getBoundingClientRect().toJSON(),
        rate: button.querySelector(".gamesense-comp-agent-rate").getBoundingClientRect().toJSON()
      }));
      const icons = [...option.querySelectorAll(".gamesense-comp-makeup i")].map(icon => ({
        role: icon.dataset.roleTone,
        mask: getComputedStyle(icon, "::before").webkitMaskImage || getComputedStyle(icon, "::before").maskImage,
        color: getComputedStyle(icon, "::before").backgroundColor
      }));
      return { line: line.toJSON(), agents: agents.toJSON(), summary: summary.getBoundingClientRect().toJSON(), summaryBorder: parseFloat(getComputedStyle(summary).borderTopWidth), makeup: makeup.toJSON(), buttons, icons };
    });
    assert.ok(compPresentation.agents.bottom <= compPresentation.summary.top + 1 && compPresentation.summaryBorder >= 1 && compPresentation.makeup.right <= compPresentation.line.right + 1, JSON.stringify(compPresentation));
    assert.ok(compPresentation.buttons.every(button => button.identity.right < button.rate.left), JSON.stringify(compPresentation));
    assert.ok(compPresentation.buttons.every(button => button.background.includes("linear-gradient") && button.role), JSON.stringify(compPresentation));
    assert.ok(compPresentation.icons.every(icon => icon.mask !== "none" && icon.color !== "rgba(0, 0, 0, 0)"), JSON.stringify(compPresentation));
    const roleExplorer = desktop.locator(".gamesense-comp-pick-explorer");
    assert.equal(await roleExplorer.locator("summary").innerText(), "WANT TO SEE ALL BREEZE AGENT PICKRATES?");
    await roleExplorer.locator("summary").click();
    assert.equal(await roleExplorer.locator("[data-gamesense-comp-role]").count(), 4);
    assert.equal(await roleExplorer.locator('[data-gamesense-comp-role="Controller"]').getAttribute("aria-pressed"), "true");
    const controllerRoleColor = await roleExplorer.locator('[data-gamesense-comp-role="Controller"]').evaluate(button => getComputedStyle(button).backgroundColor);
    const controllerRates = await roleExplorer.locator(".gamesense-comp-pick-row").evaluateAll(rows => rows.map(row => {
      const rates = [...row.querySelectorAll(".gamesense-comp-pick-rates b")].map(item => Number.parseFloat(item.textContent));
      return {
        name: row.querySelector(".gamesense-comp-pick-agent").textContent.trim(),
        map: rates[0],
        global: rates[1],
        comparison: row.querySelector(":scope > em").textContent.trim()
      };
    }));
    assert.ok(controllerRates.length >= 5 && controllerRates.every((item, index) => index === 0 || controllerRates[index - 1].map >= item.map), JSON.stringify(controllerRates));
    assert.ok(controllerRates.every(item => Number.isFinite(item.map) && Number.isFinite(item.global) && /vs global/i.test(item.comparison)), JSON.stringify(controllerRates));
    await roleExplorer.evaluate(node => { window.__rankedCoachRoleExplorerNode = node; });
    await roleExplorer.locator('[data-gamesense-comp-role="Duelist"]').click();
    assert.equal(await roleExplorer.evaluate(node => window.__rankedCoachRoleExplorerNode === node && node.isConnected), true);
    assert.equal(await roleExplorer.locator('[data-gamesense-comp-role="Duelist"]').getAttribute("aria-pressed"), "true");
    const roleExplorerPresentation = await roleExplorer.evaluate(explorer => {
      const active = explorer.querySelector('[data-gamesense-comp-role="Duelist"]');
      const row = explorer.querySelector(".gamesense-comp-pick-row");
      const rate = row.querySelector(".gamesense-comp-pick-rates > span");
      const secondRate = row.querySelector(".gamesense-comp-pick-rates > span + span");
      const number = rate.querySelector("b");
      return {
        activeColor: getComputedStyle(active).backgroundColor,
        agentFontSize: Number.parseFloat(getComputedStyle(row.querySelector(".gamesense-comp-pick-agent")).fontSize),
        numberWeight: Number(getComputedStyle(number).fontWeight),
        separator: Number.parseFloat(getComputedStyle(secondRate).borderLeftWidth)
      };
    });
    assert.notEqual(roleExplorerPresentation.activeColor, controllerRoleColor, JSON.stringify(roleExplorerPresentation));
    assert.ok(roleExplorerPresentation.agentFontSize >= 16 && roleExplorerPresentation.numberWeight <= 700 && roleExplorerPresentation.separator >= 1, JSON.stringify(roleExplorerPresentation));
    assert.equal(await roleExplorer.locator(".gamesense-comp-pick-agent").first().innerText(), "JETT");
    assert.ok(await roleExplorer.locator(".gamesense-comp-pick-agent img").count() >= 5);
    await roleExplorer.locator(".gamesense-comp-pick-agent img").first().scrollIntoViewIfNeeded();
    await desktop.waitForFunction(() => {
      const image = document.querySelector(".gamesense-comp-pick-agent img");
      return Boolean(image?.complete && image.naturalWidth > 0);
    });
    assert.equal(await roleExplorer.locator(".gamesense-comp-pick-agent img").first().evaluate(image => {
      const style = getComputedStyle(image);
      const rect = image.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width >= 18 && rect.height >= 18;
    }), true);
    const desktopPickLayout = await roleExplorer.locator(".gamesense-comp-pick-row").first().evaluate(row => {
      const card = row.getBoundingClientRect();
      const identity = row.querySelector(".gamesense-comp-pick-identity").getBoundingClientRect();
      const rank = row.querySelector(".gamesense-comp-pick-rank").getBoundingClientRect();
      const rates = row.querySelector(".gamesense-comp-pick-rates").getBoundingClientRect();
      const rateColumns = [...row.querySelectorAll(".gamesense-comp-pick-rates > span")].map(item => item.getBoundingClientRect().toJSON());
      return { card: card.toJSON(), identity: identity.toJSON(), rank: rank.toJSON(), rates: rates.toJSON(), rateColumns };
    });
    assert.ok(desktopPickLayout.identity.right < desktopPickLayout.rank.left && desktopPickLayout.rates.left <= desktopPickLayout.card.left + 15 && desktopPickLayout.rates.right >= desktopPickLayout.card.right - 15, JSON.stringify(desktopPickLayout));
    assert.ok(desktopPickLayout.rateColumns.length === 2 && Math.abs(desktopPickLayout.rateColumns[0].width - desktopPickLayout.rateColumns[1].width) <= 1, JSON.stringify(desktopPickLayout));
    await roleExplorer.screenshot({ path: path.join(__dirname, "tmp", "gamesense-role-pick-explorer-desktop.png") });
    await desktop.click('[data-gamesense-map-view="plants"]');
    const desktopPlantMarker = desktop.locator(".gamesense-plant-marker").first();
    const markerBefore = await desktopPlantMarker.evaluate(marker => {
      const markerRect = marker.getBoundingClientRect();
      const stageRect = marker.closest("[data-gamesense-map-stage]").getBoundingClientRect();
      return { marker: markerRect.toJSON(), stageOffset: { left: markerRect.left - stageRect.left, top: markerRect.top - stageRect.top }, hasTextLabel: Boolean(marker.querySelector("b")), transform: getComputedStyle(marker).transform };
    });
    await desktopPlantMarker.hover();
    await desktop.waitForTimeout(480);
    const plantPulse = await desktopPlantMarker.evaluate(marker => ({
      markerAnimation: getComputedStyle(marker).animationName,
      iconAnimation: getComputedStyle(marker.querySelector("i")).animationName,
      hasTextLabel: Boolean(marker.querySelector("b")),
      legendFocused: marker.closest(".gamesense-map-canvas-row").querySelector(".gamesense-plant-legend").classList.contains("has-hotspot-focus"),
      rowPreview: marker.closest(".gamesense-map-canvas-row").querySelector(`.gamesense-plant-legend [data-gamesense-plant-key="${marker.dataset.gamesensePlantKey}"]`).classList.contains("is-hotspot-preview")
    }));
    assert.equal(plantPulse.markerAnimation, "none", JSON.stringify(plantPulse));
    assert.match(plantPulse.iconAnimation, /gamesense-plant-icon-pulse/);
    assert.equal(plantPulse.hasTextLabel, false, JSON.stringify(plantPulse));
    assert.equal(plantPulse.legendFocused && plantPulse.rowPreview, true, JSON.stringify(plantPulse));
    const markerBox = await desktopPlantMarker.boundingBox();
    await desktop.mouse.move(markerBox.x + markerBox.width / 2, markerBox.y + markerBox.height / 2);
    await desktop.mouse.down();
    const markerPressed = await desktopPlantMarker.evaluate(marker => {
      const markerRect = marker.getBoundingClientRect();
      const stageRect = marker.closest("[data-gamesense-map-stage]").getBoundingClientRect();
      return { marker: markerRect.toJSON(), stageOffset: { left: markerRect.left - stageRect.left, top: markerRect.top - stageRect.top }, hasTextLabel: Boolean(marker.querySelector("b")), transform: getComputedStyle(marker).transform };
    });
    await desktop.mouse.up();
    assert.ok(Math.abs(markerPressed.stageOffset.left - markerBefore.stageOffset.left) <= .5 && Math.abs(markerPressed.stageOffset.top - markerBefore.stageOffset.top) <= .5, JSON.stringify({ markerBefore, markerPressed }));
    assert.equal(markerBefore.hasTextLabel || markerPressed.hasTextLabel, false, JSON.stringify({ markerBefore, markerPressed }));
    assert.equal(markerPressed.transform, markerBefore.transform);
    const activePlant = await desktopPlantMarker.evaluate(marker => ({
      active: marker.classList.contains("active"),
      className: marker.className,
      bound: marker.dataset.hotspotBound,
      connected: marker.isConnected,
      rowClass: marker.closest(".gamesense-map-canvas-row")?.querySelector(`.gamesense-plant-legend [data-gamesense-plant-key="${marker.dataset.gamesensePlantKey}"]`)?.className || ""
    }));
    assert.equal(activePlant.active, true, JSON.stringify(activePlant));
    const plantLegendTheme = await desktop.locator(".gamesense-plant-legend").evaluate(legend => {
      const probe = document.createElement("span");
      probe.style.color = getComputedStyle(document.documentElement).getPropertyValue("--theme-accent");
      document.body.appendChild(probe);
      const themeColor = getComputedStyle(probe).color;
      probe.remove();
      return { border: getComputedStyle(legend).borderColor, heading: getComputedStyle(legend.querySelector(":scope > strong")).color, themeColor };
    });
    assert.notEqual(plantLegendTheme.border, "rgba(0, 0, 0, 0)", JSON.stringify(plantLegendTheme));
    assert.equal(plantLegendTheme.heading, plantLegendTheme.themeColor, JSON.stringify(plantLegendTheme));
    const libraryPremiumBackground = await desktop.locator("#page-library").evaluate(page => {
      document.body.classList.add("theme-star-drift");
      const result = { image: getComputedStyle(page).backgroundImage, color: getComputedStyle(page).backgroundColor };
      document.body.classList.remove("theme-star-drift");
      return result;
    });
    assert.equal(libraryPremiumBackground.image, "none", JSON.stringify(libraryPremiumBackground));
    await desktop.click('[data-gamesense-map-view="locations"]');
    await desktop.waitForFunction(() => [...document.querySelectorAll(".gamesense-comp-agents img")].every(image => image.complete && image.naturalWidth > 0), null, { timeout: 15000 });
    await desktop.waitForTimeout(120);
    await desktop.locator(".gamesense-comp-list").screenshot({ path: path.join(__dirname, "tmp", "gamesense-current-comps-desktop.png") });
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion").count(), 5);
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion summary img").count(), 5);
    assert.equal(await desktop.locator(".gamesense-weapon-suggestion[open]").count(), 0);
    await desktop.locator(".gamesense-weapon-suggestion").first().locator("summary").click();
    assert.match(await desktop.locator(".gamesense-weapon-suggestion").first().innerText(), /Full-buy combined round conversion percent: \d+\.\d+%/i);
    assert.match(await desktop.locator(".gamesense-weapon-suggestion").first().innerText(), /Comparable rifle \w+: \d+\.\d+% round conversion percent/i);
    assert.doesNotMatch(await desktop.locator(".gamesense-weapon-suggestion").first().innerText(), /Best locations/i);
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
    assert.match(await desktop.locator(".gamesense-weapon-source").innerText(), /VStats\.gg Ascendant-to-Radiant V26 Act 4 map and economy sample/i);
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
    const selectedCompAgent = await desktop.locator("[data-gamesense-comp-agent]").first().getAttribute("data-gamesense-comp-agent");
    assert.match(await desktop.locator(".gamesense-comp-agent-read").innerText(), new RegExp(selectedCompAgent, "i"));
    assert.equal(await desktop.locator(".gamesense-comp-agent-read.is-revealing").count(), 1);
    assert.deepEqual(await desktop.locator(".gamesense-comp-agent-read .gamesense-comp-read-lineups a span").allInnerTexts(), ["LINEUPSVALORANT", "UPFORGE"]);
    assert.deepEqual(
      await desktop.locator(".gamesense-comp-agent-read .gamesense-comp-read-lineups a").evaluateAll(links => links.map(link => link.href)),
      ["https://lineupsvalorant.com/", "https://upforge.gg/lineups"]
    );
    await desktop.locator("[data-gamesense-comp-agent]").nth(1).click();
    assert.equal(await desktop.locator(".gamesense-comp-agents img").first().evaluate(image => window.__rankedCoachCompImageNode === image && image.isConnected), true);
    assert.equal(await desktop.locator(".gamesense-comp-agent-read").count(), 1);

    await desktop.click('[data-gamesense-back="maps"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    await desktop.click('[data-gamesense-map-season="in"]');
    await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').first().waitFor({ state: "visible" });
    const mapSeasonStatuses = await desktop.locator('.gamesense-entry-grid-maps [data-gamesense-item]').evaluateAll(cards => Object.fromEntries(cards.map(card => [card.dataset.gamesenseItem, card.querySelector(".gamesense-map-season-status")?.textContent.trim() || ""])));
    assert.equal(mapSeasonStatuses.fracture, undefined);
    assert.equal(mapSeasonStatuses.pearl, undefined);
    assert.equal(mapSeasonStatuses.summit, "");
    assert.equal(mapSeasonStatuses.sunset, "");
    await desktop.click('[data-gamesense-item="split"]');
    await desktop.locator(".gamesense-tactical-stage img").waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-tactical-stage img").getAttribute("src"), /split-layout-trn\.png/);
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 3);
    assert.deepEqual(await desktop.locator(".gamesense-comp-reference-label").allInnerTexts(), ["PRIMARY ROLE LAYOUT", "SECONDARY ROLE LAYOUT", "ALTERNATE ROLE LAYOUT"]);
    assert.equal(await desktop.locator(".gamesense-callout").count(), 0);

    await desktop.click('[data-gamesense-back="maps"]');
    await desktop.click('[data-gamesense-item="ascent"]');
    await desktop.locator(".gamesense-tactical-stage img").waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-tactical-stage img").getAttribute("src"), /ascent-layout-labeled\.svg/);
    assert.equal(await desktop.locator(".gamesense-callout").count(), 0, "The standardized labeled tactical image must not duplicate callout text in DOM overlays.");
    assert.equal(await desktop.locator(".gamesense-comp-option").count(), 3, "Retained verified data should also populate Ascent.");
    assert.equal(await desktop.locator(".gamesense-comp-unavailable").count(), 0);
    assert.doesNotMatch(await desktop.locator(".gamesense-tips-hub").innerText(), /Data Still In Review/i, "A verified map cannot present an empty coaching tab as an unverified dossier.");
    assert.match(await desktop.locator(".gamesense-tips-hub").innerText(), /High-rank map reference/i, "An otherwise empty verified coaching tab must explicitly point back to its verified map reference instead of inventing a tip.");
    assert.ok(await desktop.locator(".gamesense-weapon-suggestion").count() > 0, "Weapon suggestions should remain available for Ascent even when a fresh map-specific sample is sparse.");

    await desktop.click('.nav-btn[data-page="stats"]');
    await desktop.click('[data-gamesense-open="agents"]');
    await desktop.locator("#page-library.active").waitFor({ state: "visible" });
    await desktop.locator('.gamesense-entry-grid-agents [data-gamesense-item]').first().waitFor({ state: "visible" });
    await desktop.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    assert.equal(await desktop.locator("[data-gamesense-agent-role-filter]").count(), 5);
    await desktop.click('[data-gamesense-agent-role-filter="sentinel"]');
    assert.equal(await desktop.locator('[data-gamesense-agent-role-filter="sentinel"]').getAttribute("aria-selected"), "true");
    assert.match(await desktop.locator('[data-gamesense-agent-role-filter="sentinel"]').evaluate(button => getComputedStyle(button).backgroundImage), /linear-gradient/i);
    assert.equal(await desktop.locator('[data-gamesense-agent-role-filter="sentinel"]').evaluate(button => getComputedStyle(button).getPropertyValue("--agent-role-color").trim()), "#34d399");
    assert.equal(await desktop.locator('.gamesense-agent-entry-card').evaluateAll(cards => cards.every(card => ["chamber", "cypher", "deadlock", "killjoy", "sage", "vyse", "veto"].includes(card.dataset.gamesenseItem))), true);
    assert.equal(await desktop.locator('.gamesense-agent-entry-card').evaluateAll(cards => cards.every(card => {
      const nameColor = getComputedStyle(card.querySelector(".gamesense-entry-copy strong")).color;
      const indexColor = getComputedStyle(card.querySelector(".gamesense-entry-index")).color;
      return nameColor === "rgb(52, 211, 153)" && indexColor === "rgb(52, 211, 153)";
    })), true);
    await desktop.click('[data-gamesense-agent-role-filter="all"]');
    assert.equal(await desktop.locator('.gamesense-entry-grid-agents [data-gamesense-item]').count(), 29);
    assert.equal(await desktop.locator('.gamesense-agent-entry-card img').count(), 29);
    const deadlockNameBounds = await desktop.locator('[data-gamesense-item="deadlock"]').evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const name = card.querySelector(".gamesense-entry-copy strong");
      const nameRect = name.getBoundingClientRect();
      return { cardRight: cardRect.right, nameRight: nameRect.right, fontSize: Number.parseFloat(getComputedStyle(name).fontSize) };
    });
    assert.ok(deadlockNameBounds.nameRight <= deadlockNameBounds.cardRight + 1, JSON.stringify(deadlockNameBounds));
    const desktopAgentTile = await desktop.locator(".gamesense-agent-entry-card").first().evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const index = card.querySelector(".gamesense-entry-index").getBoundingClientRect();
      const image = card.querySelector("img").getBoundingClientRect();
      const name = card.querySelector(".gamesense-entry-copy strong").getBoundingClientRect();
      const hidden = [...card.querySelectorAll("small,.gamesense-entry-copy > span")].every(item => getComputedStyle(item).display === "none");
      return { card: cardRect.toJSON(), index: index.toJSON(), image: image.toJSON(), name: name.toJSON(), hidden };
    });
    assert.ok(desktopAgentTile.index.left > desktopAgentTile.card.left + desktopAgentTile.card.width / 2, JSON.stringify(desktopAgentTile));
    assert.ok(desktopAgentTile.index.top >= desktopAgentTile.card.top && desktopAgentTile.index.right <= desktopAgentTile.card.right, JSON.stringify(desktopAgentTile));
    assert.ok(desktopAgentTile.image.left <= desktopAgentTile.card.left + 2 && desktopAgentTile.image.bottom >= desktopAgentTile.card.bottom - 2, JSON.stringify(desktopAgentTile));
    assert.ok(desktopAgentTile.name.left >= desktopAgentTile.card.left + desktopAgentTile.card.width / 2 - 1 && desktopAgentTile.hidden, JSON.stringify(desktopAgentTile));
    assert.deepEqual(await desktop.locator(".gamesense-agent-entry-card").first().evaluate(card => ({
      role: card.dataset.roleTone,
      name: getComputedStyle(card.querySelector(".gamesense-entry-copy strong")).color,
      index: getComputedStyle(card.querySelector(".gamesense-entry-index")).color
    })), { role: "controller", name: "rgb(167, 139, 250)", index: "rgb(167, 139, 250)" });
    await desktop.locator(".gamesense-entry-grid-agents").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-gallery-desktop.png") });
    await desktop.click('[data-gamesense-item="jett"]');
    await desktop.waitForTimeout(400);
    await desktop.waitForFunction(() => document.querySelector(".gamesense-knowledge-updates")?.textContent.includes("Jett-specific utility timing stays with Jett."), null, { timeout: 10000 });
    const agentHeader = await desktop.locator(".gamesense-agent-detail-head").evaluate(header => {
      const patch = header.querySelector(".gamesense-patch").getBoundingClientRect();
      const back = header.querySelector(".gamesense-back").getBoundingClientRect();
      return { patch: patch.toJSON(), back: back.toJSON() };
    });
    assert.ok(agentHeader.patch.bottom <= agentHeader.back.top + 1 && Math.abs(agentHeader.patch.right - agentHeader.back.right) <= 2, JSON.stringify(agentHeader));
    assert.match(await desktop.locator(".gamesense-agent-hero").innerText(), /Agent Fundamentals.*Tailwind.*Lore and History.*South Korea.*Gameplay history/is);
    assert.match(await desktop.locator("#gamesenseLibraryView").innerText(), /Jett-specific utility timing stays with Jett/i);
    assert.doesNotMatch(await desktop.locator("#gamesenseLibraryView").innerText(), /General coaching should stay off agent dossiers/i);
    assert.equal(await desktop.locator("#gamesenseLibraryView").getByText("Approved coaching updates", { exact: true }).count(), 0);
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
    const officialAbilityVideoCoverage = await desktop.evaluate(() => {
      return (globalThis.RankedCoachGamesenseReference?.agents || [])
        .flatMap(agent => (agent.abilities || []).map(ability => ({ agent: agent.id, ability: ability.id, src: ability.video?.src || "" })));
    });
    assert.equal(officialAbilityVideoCoverage.length, 121);
    const officialAbilityVideos = officialAbilityVideoCoverage.filter(item => item.src);
    assert.equal(officialAbilityVideos.length, officialAbilityVideoCoverage.length, JSON.stringify(officialAbilityVideoCoverage));
    assert.equal(officialAbilityVideos.every(item => /^https:\/\/cmsassets\.rgpub\.io\/sanity\/files\/dsfx7636\/(?:game_data|news|news_live)\/.+\.mp4\?accountingTag=VAL$/i.test(item.src)), true, JSON.stringify(officialAbilityVideoCoverage));
    assert.deepEqual(officialAbilityVideoCoverage.filter(item => !item.src).map(item => item.ability).sort(), []);
    assert.equal(await desktop.locator("[data-gamesense-ability]").count(), 5);
    assert.equal(await desktop.locator(".gamesense-ability-panel").count(), 1);
    await desktop.locator(".gamesense-agent-portrait-wrap").evaluate(node => { window.__rankedCoachAgentPortraitNode = node; });
    await desktop.locator(".gamesense-map-fit").evaluate(node => { window.__rankedCoachAgentMapFitNode = node; });
    const jettAbilityIds = await desktop.locator("[data-gamesense-ability]").evaluateAll(buttons => buttons.map(button => button.dataset.gamesenseAbility));
    for (const abilityId of jettAbilityIds) {
      await desktop.locator(".gamesense-ability-panel").evaluate(node => { window.__rankedCoachAbilityPanelNode = node; });
      await desktop.click(`[data-gamesense-ability="${abilityId}"]`);
      assert.equal(await desktop.locator(`[data-gamesense-ability="${abilityId}"]`).getAttribute("aria-pressed"), "true");
      assert.equal(await desktop.locator(".gamesense-ability-panel").evaluate(node => window.__rankedCoachAbilityPanelNode !== node && !window.__rankedCoachAbilityPanelNode.isConnected), true);
      assert.equal(await desktop.locator(".gamesense-agent-portrait-wrap").evaluate(node => window.__rankedCoachAgentPortraitNode === node && node.isConnected), true);
      assert.equal(await desktop.locator(".gamesense-map-fit").evaluate(node => window.__rankedCoachAgentMapFitNode === node && node.isConnected), true);
    }
    await desktop.click('[data-gamesense-ability="cloudburst"]');
    assert.equal(await desktop.locator("html").getAttribute("data-gamesense-transition"), null);
    await desktop.locator('[data-gamesense-ability="cloudburst"].active').waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-ability-panel").innerText(), /2\.5 seconds/i);
    assert.equal(await desktop.locator(".gamesense-ability-video").count(), 1);
    assert.match(await desktop.locator(".gamesense-ability-video-player source").getAttribute("src"), /3353597819f0c032d56ff947d9762368b4ee6c6b\.mp4\?accountingTag=VAL/i);
    assert.equal(await desktop.locator(".gamesense-ability-video-player").getAttribute("controls"), "");
    assert.equal(await desktop.locator(".gamesense-ability-video-player").getAttribute("preload"), "metadata");
    assert.equal(await desktop.locator('[data-gamesense-ability="cloudburst"].active').count(), 1);
    assert.match(await desktop.locator('[data-gamesense-ability="cloudburst"]').evaluate(button => getComputedStyle(button, "::after").content), /Selected/i);
    await desktop.waitForTimeout(2200);
    assert.match(await desktop.locator(".gamesense-agent-rate").innerText(), /Global Pick Rate.*73\.7%.*Rank #1.*VStats V26 Act 4.*Ascendant to Radiant/is);
    assert.equal(await desktop.locator(".gamesense-map-fit-item").count(), 3);
    assert.match(await desktop.locator(".gamesense-map-fit-item").first().innerText(), /pick.*win/is);
    const mapFitWinRates = await desktop.locator(".gamesense-map-fit-item").evaluateAll(cards => cards.map(card => Number.parseFloat(card.querySelector(":scope > div > strong:last-child").textContent)));
    assert.ok(mapFitWinRates.every((rate, index) => index === 0 || mapFitWinRates[index - 1] >= rate), JSON.stringify(mapFitWinRates));
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

    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("agents", "omen"));
    await desktop.locator('.gamesense-agent-detail-head h2').getByText("Omen", { exact: true }).waitFor({ state: "visible" });
    await desktop.locator(".gamesense-agent-portrait-wrap").evaluate(node => { window.__rankedCoachOmenPortraitNode = node; });
    const omenAbilityIds = await desktop.locator("[data-gamesense-ability]").evaluateAll(buttons => buttons.map(button => button.dataset.gamesenseAbility));
    assert.equal(omenAbilityIds.length, 4);
    for (const abilityId of omenAbilityIds) {
      await desktop.click(`[data-gamesense-ability="${abilityId}"]`);
      assert.equal(await desktop.locator(`[data-gamesense-ability="${abilityId}"]`).getAttribute("aria-pressed"), "true");
      assert.equal(await desktop.locator(".gamesense-agent-portrait-wrap").evaluate(node => window.__rankedCoachOmenPortraitNode === node && node.isConnected), true);
    }
    assert.equal(await desktop.locator(".gamesense-ability-video").count(), 1);
    assert.match(await desktop.locator(".gamesense-ability-video-player source").getAttribute("src"), /252cf8ad86b6aca6210ba93ea856f52708476eba\.mp4\?accountingTag=VAL/i);

    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("agents", "sova"));
    await desktop.locator('.gamesense-agent-detail-head h2').getByText("Sova", { exact: true }).waitFor({ state: "visible" });
    await desktop.click('[data-gamesense-ability="recon-bolt"]');
    assert.equal(await desktop.locator(".gamesense-ability-video").count(), 1);
    assert.match(await desktop.locator(".gamesense-ability-video-player source").getAttribute("src"), /50f9d870fa2a9b9ba38408eb718ffc06879c11a8\.mp4\?accountingTag=VAL/i);

    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("agents", "reyna"));
    await desktop.locator('.gamesense-agent-detail-head h2').getByText("Reyna", { exact: true }).waitFor({ state: "visible" });
    assert.equal(await desktop.locator("[data-gamesense-ability]").count(), 4);
    assert.match(await desktop.locator(".gamesense-agent-hero").innerText(), /Dismiss.*Empress/is);
    assert.match(await desktop.locator(".gamesense-ability-grid").innerText(), /Devour.*Dismiss.*Leer.*Empress/is);
    assert.match(await desktop.locator(".gamesense-agent-rate").innerText(), /Global Pick Rate.*42\.0%.*VStats V26 Act 4.*Ascendant to Radiant/is);
    assert.ok(await desktop.locator(".gamesense-agent-facts .gamesense-patch-history li").count() >= 2);

    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons"));
    await desktop.locator('.gamesense-entry-grid-weapons [data-gamesense-item]').first().waitFor({ state: "visible" });
    await desktop.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    assert.equal(await desktop.locator('.gamesense-entry-grid-weapons [data-gamesense-item]').count(), 7);
    assert.equal(await desktop.locator('.gamesense-entry-grid-weapons .gamesense-entry-index').count(), 0);
    assert.ok(await desktop.locator('.gamesense-weapon-entry-card img').count() >= 17);
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
      return { cardTop: cardRect.top, titleBottom: title.bottom, artTop: art.top, artBottom: art.bottom, listingTop: listing.top };
    }));
    assert.ok(weaponTileOrder.every(card => card.titleBottom <= card.artTop + 1 && card.artBottom <= card.listingTop + 1), JSON.stringify(weaponTileOrder));
    assert.equal(await desktop.locator(".gamesense-weapon-entry-title").first().evaluate(title => getComputedStyle(title).color), "rgb(246, 196, 83)");
    await desktop.locator(".gamesense-entry-grid-weapons").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-gallery-desktop.png") });
    await desktop.evaluate(() => {
      window.__collectionArchiveBatchSizes = [];
      window.__collectionArchiveObserver = new MutationObserver(records => {
        records.forEach(record => {
          const count = [...record.addedNodes].reduce((total, node) => total
            + (node.nodeType === Node.ELEMENT_NODE ? Number(node.matches?.(".gamesense-collection-card")) + node.querySelectorAll?.(".gamesense-collection-card").length : 0), 0);
          if (count) window.__collectionArchiveBatchSizes.push(count);
        });
      });
      window.__collectionArchiveObserver.observe(document.getElementById("gamesenseLibraryView"), { childList: true, subtree: true });
    });
    await desktop.click('[data-gamesense-item="rifles"]');
    await desktop.locator(".gamesense-weapon-panel").waitFor({ state: "visible" });
    await desktop.waitForFunction(() => document.querySelectorAll(".gamesense-collection-card").length === 103, null, { timeout: 10000 });
    const archiveBatchResult = await desktop.evaluate(() => {
      window.__collectionArchiveObserver?.disconnect();
      return {
        total: document.querySelectorAll(".gamesense-collection-card").length,
        maxBatch: Math.max(0, ...(window.__collectionArchiveBatchSizes || [])),
        declaredTotal: Number(document.querySelector(".gamesense-collection-grid")?.dataset.gamesenseCollectionTotal || 0)
      };
    });
    assert.deepEqual(archiveBatchResult, { total: 103, maxBatch: 24, declaredTotal: 103 });
    assert.equal(await desktop.locator("[data-gamesense-weapon]").count(), 2);
    assert.equal(await desktop.getByText("Fight Plan", { exact: true }).count(), 0);
    assert.equal(await desktop.getByText("Economy Read", { exact: true }).count(), 0);
    await desktop.locator(".gamesense-weapon-grid").evaluate(node => { window.__rankedCoachWeaponGridNode = node; });
    await desktop.locator(".gamesense-section-heading").evaluate(node => { window.__rankedCoachWeaponHeadingNode = node; });
    await desktop.locator(".gamesense-weapon-panel").evaluate(node => { window.__rankedCoachWeaponPanelNode = node; });
    await desktop.click('[data-gamesense-weapon="phantom"]');
    assert.equal(await desktop.locator("html").getAttribute("data-gamesense-transition"), null);
    await desktop.locator('[data-gamesense-weapon="phantom"].active').waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /2900 credits/i);
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /21\.2%/i);
    assert.match(await desktop.locator(".gamesense-global-rate").innerText(), /Global usage.*Global kill conversion 1\.03 K\/D.*Round conversion available by buy type/is);
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /When to use it.*How to use it.*Patch history/is);
    assert.match(await desktop.locator(".gamesense-weapon-panel-art").evaluate(panel => getComputedStyle(panel).backgroundImage), /radial-gradient/i);
    await desktop.waitForFunction(() => document.querySelectorAll(".gamesense-collection-card").length > 14);
    assert.equal(await desktop.locator(".gamesense-collection-card").count(), 20);
    assert.equal(await desktop.locator(".gamesense-collection-card button").count(), 20);
    assert.equal(await desktop.locator("[data-gamesense-collection-open]").count(), 20);
    assert.equal(await desktop.locator(".gamesense-collection-divider").count(), 20);
    assert.match(await desktop.locator(".gamesense-collection-head").innerText(), /Phantom Skin Collection Archive.*20 exact Phantom weapon previews.*official content tier.*not a community review score/is);
    assert.equal(await desktop.locator('.gamesense-collection-card img[alt$="Phantom skin"]').count(), 20);
    assert.equal(await desktop.locator('.gamesense-collection-card[data-gamesense-collection-tier="premium"]').count(), 5);
    assert.equal(await desktop.locator('.gamesense-collection-filters button:not([data-gamesense-collection-filter="all"]) .gamesense-tier-icon').count(), 5);
    assert.equal(await desktop.locator('.gamesense-tier-icon-stack img').count(), 5);
    const desktopAllFilterSpacing = await desktop.locator('[data-gamesense-collection-filter="all"]').evaluate(button => {
      const icon = button.querySelector(".gamesense-tier-icon-stack").getBoundingClientRect();
      const label = button.querySelector(":scope > span:last-child").getBoundingClientRect();
      return { gap: label.left - icon.right };
    });
    assert.ok(desktopAllFilterSpacing.gap >= 8, JSON.stringify(desktopAllFilterSpacing));
    const collectionVideoCoverage = await desktop.evaluate(() => ({
      premium: globalThis.RankedCoachWeaponCollections.getCollectionVideo("Aemondir", "Premium"),
      vct24: globalThis.RankedCoachWeaponCollections.getCollectionVideo("VCT x SEN", "Exclusive"),
      vct25: globalThis.RankedCoachWeaponCollections.getCollectionVideo("VCT25 x SEN", "Exclusive"),
      vct26: globalThis.RankedCoachWeaponCollections.getCollectionVideo("VCT26 x SEN", "Exclusive"),
      noApprovedSource: globalThis.RankedCoachWeaponCollections.getCollectionVideo("Bound", "Deluxe")
    }));
    assert.match(collectionVideoCoverage.premium?.id || "", /^[a-zA-Z0-9_-]{11}$/);
    assert.equal(collectionVideoCoverage.premium?.channel, "Dittozkul");
    assert.match(collectionVideoCoverage.vct24?.id || "", /^[a-zA-Z0-9_-]{11}$/);
    assert.match(collectionVideoCoverage.vct25?.id || "", /^[a-zA-Z0-9_-]{11}$/);
    assert.match(collectionVideoCoverage.vct26?.id || "", /^[a-zA-Z0-9_-]{11}$/);
    assert.ok([collectionVideoCoverage.vct24?.channel, collectionVideoCoverage.vct25?.channel, collectionVideoCoverage.vct26?.channel].every(channel => channel === "VALORANT"));
    assert.equal(collectionVideoCoverage.noApprovedSource, null);
    const reaverVandalVariantModels = await desktop.evaluate(() => [0, 1, 2, 3].map(index => globalThis.RankedCoachWeaponCollections.getSketchfabModel("Reaver", "Vandal", index)?.id || ""));
    assert.deepEqual(reaverVandalVariantModels, [
      "44283975faff461cb97fd7d74cbffc99",
      "7384e642d2944bef8117cf05545a4b33",
      "4a2b2d3a24bc4928b1a20efca88fee19",
      "04f9851ace5c424492c327608b895e2c"
    ]);
    const expandedModelCoverage = await desktop.evaluate(() => [
      ["Prime", "Vandal", 1],
      ["Prime", "Vandal", 3],
      ["Radiant Entertainment System", "Phantom", 0],
      ["Arcane", "Sheriff", 0],
      ["Glitchpop", "Frenzy", 0]
    ].map(([collection, weapon, variant]) => globalThis.RankedCoachWeaponCollections.getSketchfabModel(collection, weapon, variant)?.id || ""));
    assert.deepEqual(expandedModelCoverage, [
      "91e1a01291d741849acd35514cca21b0",
      "bcca9bc0df714df185f019282c1b3cd0",
      "bb334fb114fa4db084c6666e2e09d071",
      "9d817055d22543b8a4a5992f68a35b33",
      "97ed3f185548407db5e4caf18084b2a4"
    ]);
    const roundTwoModelCoverage = await desktop.evaluate(() => [
      ["Rogue", "Vandal", 0],
      ["Neptune", "Vandal", 0],
      ["Neptune", "Vandal", 1],
      ["Sentinels of Light", "Vandal", 0],
      ["Sentinels of Light", "Vandal", 1],
      ["Sentinels of Light", "Vandal", 2],
      ["Sentinels of Light", "Vandal", 3],
      ["Forsaken", "Vandal", 0],
      ["Forsaken", "Vandal", 1],
      ["Gaia's Vengeance", "Vandal", 0],
      ["Gaia's Vengeance", "Vandal", 3],
      ["Prelude to Chaos", "Vandal", 0],
      ["Prelude to Chaos", "Vandal", 2],
      ["Prelude to Chaos", "Vandal", 3],
      ["RGX 11z Pro", "Vandal", 2],
      ["RGX 11z Pro", "Vandal", 3]
    ].map(([collection, weapon, variant]) => globalThis.RankedCoachWeaponCollections.getSketchfabModel(collection, weapon, variant)?.id || ""));
    assert.deepEqual(roundTwoModelCoverage, [
      "44b2d633ea1b44378b200d044788e223",
      "bd272b95723942dbaf1004d2626ec128",
      "b61e3f7bf9c749878beba1d6e01d6a84",
      "7cfb779913a9489f95f7b884dcf0ff05",
      "4cc8e7c1ff4e45a09dcbf7956225352c",
      "198d96cfc1ea48d7a84b038b14c37576",
      "8b4c8ae3fa374b8fb638457184263ef4",
      "d905175d72604c1fad68d90ca44f6324",
      "99f07632e3b243f3bfef2e67b08653e7",
      "dfeddd540e7641bfb0b7128155117a1d",
      "46e6e410115441c182efab311d557532",
      "0dec73e342a54b1bacc9a242fe64d325",
      "bd0f274b21034e039f788bbe6c461757",
      "49fcf7c9b36e4ac2b877fc4f32048071",
      "65d8384673f241938de5c39dff07d200",
      "53259a078e6e4521b1e116e6723f0011"
    ]);
    const roundTwoExcludedModels = await desktop.evaluate(() => [
      globalThis.RankedCoachWeaponCollections.getSketchfabModel("Oni", "Vandal", 0)?.id || "",
      globalThis.RankedCoachWeaponCollections.getSketchfabModel("RGX 11z Pro", "Vandal", 1)?.id || "",
      globalThis.RankedCoachWeaponCollections.getSketchfabModel("RGX 11z Pro", "Vandal", 0)?.id || ""
    ]);
    assert.deepEqual(roundTwoExcludedModels, ["", "", "b1da0d2feb70448fae76769dc7ee01fd"]);
    await desktop.locator(".gamesense-collection-filters").screenshot({ path: path.join(__dirname, "tmp", "gamesense-collection-filters-desktop.png") });
    await desktop.locator('[data-gamesense-collection-filter="premium"]').click();
    assert.equal(await desktop.locator(".gamesense-collection-card:not([hidden])").count(), 5);
    assert.equal(await desktop.locator('[data-gamesense-collection-filter="premium"]').getAttribute("aria-pressed"), "true");
    assert.notEqual(await desktop.locator('[data-gamesense-collection-filter="premium"]').evaluate(button => getComputedStyle(button).boxShadow), "none");
    await desktop.locator('[data-gamesense-collection-filter="all"]').click();
    assert.equal(await desktop.locator(".gamesense-collection-card:not([hidden])").count(), 20);
    assert.equal(await desktop.locator("#logFocusCustomMenu").getAttribute("hidden"), "");
    const inactiveFocusGuard = await desktop.locator("#logFocusCustomTrigger").evaluate(trigger => ({
      pointerEvents: getComputedStyle(trigger).pointerEvents,
      page: trigger.closest(".page")?.id || "missing",
      pageClass: trigger.closest(".page")?.className || "missing",
      pageInert: trigger.closest(".page")?.inert === true
    }));
    assert.equal(inactiveFocusGuard.pointerEvents, "none", JSON.stringify(inactiveFocusGuard));
    assert.equal(inactiveFocusGuard.pageInert, true, JSON.stringify(inactiveFocusGuard));
    const firstCollectionCard = desktop.locator(".gamesense-collection-card[data-gamesense-collection-preview]").first();
    await firstCollectionCard.screenshot({ path: path.join(__dirname, "tmp", "gamesense-collection-card-desktop.png") });
    const desktopCollectionGeometry = await firstCollectionCard.evaluate(card => {
      const art = card.querySelector(".gamesense-collection-art").getBoundingClientRect();
      const copy = card.querySelector(".gamesense-collection-copy").getBoundingClientRect();
      const divider = card.querySelector(".gamesense-collection-divider").getBoundingClientRect();
      return { card: card.getBoundingClientRect().toJSON(), art: art.toJSON(), copy: copy.toJSON(), divider: divider.toJSON() };
    });
    assert.ok(Math.abs(desktopCollectionGeometry.art.top - desktopCollectionGeometry.card.top) <= 2 && Math.abs(desktopCollectionGeometry.art.bottom - desktopCollectionGeometry.card.bottom) <= 2, JSON.stringify(desktopCollectionGeometry));
    assert.ok(desktopCollectionGeometry.copy.left >= desktopCollectionGeometry.divider.left && desktopCollectionGeometry.copy.height >= desktopCollectionGeometry.card.height - 3, JSON.stringify(desktopCollectionGeometry));
    await firstCollectionCard.hover();
    await desktop.waitForTimeout(180);
    assert.ok(Number(await firstCollectionCard.locator(".gamesense-collection-open").evaluate(node => getComputedStyle(node).opacity)) > .9);
    await firstCollectionCard.click();
    await desktop.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
    await desktop.waitForTimeout(250);
    assert.match(await desktop.locator(".gamesense-skin-preview-card").textContent(), /Official Weapon Render.*Aemondir Phantom.*Skin Animation.*used by val-skins.*Dittozkul approved fallback/is);
    assert.equal(await desktop.locator(".gamesense-skin-preview-card.has-secondary-video").count(), 1);
    assert.equal(await desktop.locator(".gamesense-skin-preview-card.has-static-render").count(), 1);
    assert.equal(await desktop.locator("[data-skin-preview-view]").count(), 3);
    assert.equal(await desktop.locator("[data-skin-preview-step]").count(), 0);
    assert.equal(await desktop.locator(".gamesense-skin-variant-swatch").count(), 3);
    assert.match(await desktop.locator("[data-skin-preview-image]").getAttribute("src"), /phantom\.png\?preview=0&view=0/i);
    assert.equal(await desktop.locator(".gamesense-skin-source-preview").count(), 0);
    assert.equal(await desktop.locator('iframe[src*="val-skins.com"]').count(), 0);
    assert.match(await desktop.locator("[data-skin-preview-video]").getAttribute("src"), /phantom-0-level-1\.mp4/i);
    assert.equal(await desktop.locator("[data-skin-preview-video-option]").count(), 4);
    assert.equal(await desktop.locator(".gamesense-skin-variant-index").count(), 0);
    assert.deepEqual(await desktop.locator('.gamesense-skin-option-groups > section:first-child [data-skin-preview-video-option]').allInnerTexts(), ["I"]);
    const upgradeControlLayout = await desktop.locator('.gamesense-skin-option-groups > section:first-child [data-skin-preview-video-option]').first().evaluate(button => ({
      width: button.getBoundingClientRect().width,
      height: button.getBoundingClientRect().height,
      fontSize: parseFloat(getComputedStyle(button).fontSize)
    }));
    assert.ok(upgradeControlLayout.width >= 52 && upgradeControlLayout.height >= 40 && upgradeControlLayout.fontSize >= 13, JSON.stringify(upgradeControlLayout));
    const desktopOptionLayout = await desktop.locator(".gamesense-skin-option-groups > section").evaluateAll(sections => sections.map(section => section.getBoundingClientRect().toJSON()));
    assert.equal(desktopOptionLayout.length, 2);
    assert.ok(Math.abs(desktopOptionLayout[0].top - desktopOptionLayout[1].top) <= 2 && desktopOptionLayout[1].left > desktopOptionLayout[0].left, JSON.stringify(desktopOptionLayout));
    const desktopVariantLayout = await desktop.locator(".gamesense-skin-view-selectors").evaluate(rail => ({
      display: getComputedStyle(rail).display,
      overflowX: getComputedStyle(rail).overflowX,
      clientWidth: rail.clientWidth,
      scrollWidth: rail.scrollWidth,
      previewWidths: [...rail.querySelectorAll("button")].map(button => button.querySelector(".gamesense-skin-variant-thumb").getBoundingClientRect().width)
    }));
    assert.equal(desktopVariantLayout.display, "grid", JSON.stringify(desktopVariantLayout));
    assert.equal(desktopVariantLayout.overflowX, "hidden", JSON.stringify(desktopVariantLayout));
    assert.ok(desktopVariantLayout.scrollWidth <= desktopVariantLayout.clientWidth + 1, JSON.stringify(desktopVariantLayout));
    assert.ok(desktopVariantLayout.previewWidths.every(width => width >= 68), JSON.stringify(desktopVariantLayout));
    assert.equal(await desktop.locator("[data-skin-media-page-button]").count(), 2);
    assert.equal(await desktop.locator('[data-skin-media-page-button="0"]').getAttribute("aria-pressed"), "true");
    assert.equal(await desktop.locator('[data-skin-media-page="1"]').isHidden(), true);
    assert.match(await desktop.locator(".gamesense-skin-video-pane iframe").getAttribute("src"), /youtube-nocookie\.com\/embed\/PT3EC2dgqzs/i);
    const nativeVideoRect = await desktop.locator("[data-skin-preview-video]").evaluate(video => video.getBoundingClientRect().toJSON());
    const desktopPagerAtVideoTop = await desktop.locator(".gamesense-skin-media-pagination").evaluate(pager => {
      const pagerRect = pager.getBoundingClientRect();
      const frameRect = document.querySelector(".gamesense-skin-animation-frame").getBoundingClientRect();
      const videoRect = document.querySelector("[data-skin-preview-video]").getBoundingClientRect();
      return {
        pager: pagerRect.toJSON(),
        frame: frameRect.toJSON(),
        video: videoRect.toJSON(),
        centerDelta: Math.abs((pagerRect.left + pagerRect.width / 2) - (videoRect.left + videoRect.width / 2))
      };
    });
    assert.ok(desktopPagerAtVideoTop.pager.top >= desktopPagerAtVideoTop.frame.top && desktopPagerAtVideoTop.pager.top <= desktopPagerAtVideoTop.video.top + 2, JSON.stringify(desktopPagerAtVideoTop));
    assert.ok(desktopPagerAtVideoTop.centerDelta <= 2, JSON.stringify(desktopPagerAtVideoTop));
    assert.equal(await desktop.locator("[data-skin-orbit-stage], [data-skin-orbit-scene]").count(), 0);
    assert.equal(await desktop.locator('.gamesense-skin-model-stage iframe[src*="sketchfab.com"]').count(), 0);
    await desktop.locator('[data-skin-preview-view="1"]').click();
    assert.match(await desktop.locator("[data-skin-preview-image]").getAttribute("src"), /phantom\.png\?preview=0&view=1/i);
    assert.match(await desktop.locator("[data-skin-preview-video]").getAttribute("src"), /phantom-0-1\.mp4/i);
    assert.equal(await desktop.locator(".gamesense-skin-animation-preview > header [data-skin-preview-video-label]").innerText(), "VARIANT II");
    assert.equal(await desktop.locator('[data-skin-preview-view="1"]').getAttribute("aria-pressed"), "true");
    await desktop.locator('[data-skin-media-page-button="1"]').click();
    assert.equal(await desktop.locator('[data-skin-media-page="0"]').isHidden(), true);
    assert.equal(await desktop.locator('[data-skin-media-page="1"]').isVisible(), true);
    assert.equal(await desktop.locator('[data-skin-media-page-button="1"]').getAttribute("aria-pressed"), "true");
    const bundleVideoRect = await desktop.locator(".gamesense-skin-video-pane iframe").evaluate(frame => frame.getBoundingClientRect().toJSON());
    assert.ok(Math.abs(bundleVideoRect.width - nativeVideoRect.width) <= 2 && Math.abs(bundleVideoRect.height - nativeVideoRect.height) <= 2, JSON.stringify({ nativeVideoRect, bundleVideoRect }));
    await desktop.locator(".gamesense-skin-media-pane").screenshot({ path: path.join(__dirname, "tmp", "gamesense-skin-preview-bundle-desktop.png") });
    await desktop.locator('[data-skin-media-page-button="0"]').click();
    await desktop.locator(".gamesense-skin-preview-card").evaluate(card => { card.scrollTop = 0; });
    await desktop.locator(".gamesense-skin-preview-overlay").screenshot({ path: path.join(__dirname, "tmp", "gamesense-skin-preview-desktop.png") });
    await desktop.mouse.click(2, 2);
    await desktop.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    await desktop.locator('.gamesense-collection-card[data-gamesense-collection-preview][data-preview-name="Reaver"]').click();
    await desktop.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-skin-preview-card.has-static-render").count(), 1);
    assert.match(await desktop.locator("[data-skin-preview-video]").getAttribute("src"), /^https:\/\/valorant\.dyn\.riotcdn\.net\/x\/videos\/release-13\.00\/phantom-16-level-1\.mp4/i);
    const reaverUpgradeRail = await desktop.locator('.gamesense-skin-option-groups > section:first-child > div').evaluate(rail => ({
      overflowX: getComputedStyle(rail).overflowX,
      clientWidth: rail.clientWidth,
      scrollWidth: rail.scrollWidth,
      rows: new Set([...rail.querySelectorAll("button")].map(button => Math.round(button.getBoundingClientRect().top))).size
    }));
    assert.notEqual(reaverUpgradeRail.overflowX, "auto", JSON.stringify(reaverUpgradeRail));
    assert.notEqual(reaverUpgradeRail.overflowX, "scroll", JSON.stringify(reaverUpgradeRail));
    assert.ok(reaverUpgradeRail.scrollWidth <= reaverUpgradeRail.clientWidth + 1, JSON.stringify(reaverUpgradeRail));
    assert.equal(await desktop.locator(".gamesense-skin-variant-index").count(), 0);
    await desktop.locator('[data-skin-preview-view="3"]').click();
    assert.equal(await desktop.locator(".gamesense-skin-preview-card.has-true-model").count(), 1);
    assert.match(await desktop.locator(".gamesense-skin-viewer-pane").innerText(), /True 3D Model.*Reaver Phantom.*Drag to rotate.*MisterM4n.*CC BY 4\.0/is);
    assert.match(await desktop.locator('.gamesense-skin-model-stage iframe').getAttribute("src"), /sketchfab\.com\/models\/399ea10e99b5459cbf892498c7c258fc\/embed/i);
    assert.equal(await desktop.locator("[data-skin-preview-video]").isHidden(), true);
    assert.equal(await desktop.locator("[data-skin-animation-static]").isVisible(), true);
    assert.match(await desktop.locator("[data-skin-animation-static] img").getAttribute("src"), /phantom\.png\?preview=16&view=3/i);
    assert.match(await desktop.locator(".gamesense-skin-animation-preview > header [data-skin-preview-video-detail]").innerText(), /official static render/i);
    await desktop.locator('[data-skin-preview-view="1"]').click();
    assert.equal(await desktop.locator(".gamesense-skin-preview-card.has-static-render").count(), 1);
    assert.equal(await desktop.locator(".gamesense-skin-model-stage iframe").count(), 0);
    assert.match(await desktop.locator("[data-skin-preview-image]").getAttribute("src"), /phantom\.png\?preview=16&view=1/i);
    assert.match(await desktop.locator("[data-skin-animation-static] img").getAttribute("src"), /phantom\.png\?preview=16&view=1/i);
    await desktop.locator('[data-skin-preview-view="3"]').click();
    assert.equal(await desktop.locator("[data-skin-orbit-stage], [data-skin-orbit-scene]").count(), 0);
    await desktop.locator(".gamesense-skin-preview-overlay").screenshot({ path: path.join(__dirname, "tmp", "gamesense-skin-preview-3d-desktop.png") });
    await desktop.mouse.click(2, 2);
    await desktop.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    assert.equal(await desktop.locator('[data-gamesense-weapon="phantom"].active').count(), 1);
    assert.equal(await desktop.locator('[data-gamesense-weapon="phantom"]').getAttribute("aria-pressed"), "true");
    assert.equal(await desktop.locator(".gamesense-weapon-grid").evaluate(node => window.__rankedCoachWeaponGridNode === node && node.isConnected), true);
    assert.equal(await desktop.locator(".gamesense-section-heading").evaluate(node => window.__rankedCoachWeaponHeadingNode === node && node.isConnected), true);
    assert.equal(await desktop.locator(".gamesense-weapon-panel").evaluate(node => window.__rankedCoachWeaponPanelNode !== node && !window.__rankedCoachWeaponPanelNode.isConnected), true);
    assert.match(await desktop.locator('[data-gamesense-weapon="phantom"]').evaluate(button => getComputedStyle(button, "::after").content), /Selected/i);
    await desktop.locator('[data-gamesense-weapon="vandal"]').click();
    await desktop.waitForFunction(() => document.querySelectorAll('.gamesense-collection-card[data-preview-weapon="Vandal"]').length > 14);
    const assertVandalModel = async (collection, variant, modelId) => {
      await desktop.locator(`.gamesense-collection-card[data-preview-weapon="Vandal"][data-preview-name="${collection}"]`).click();
      await desktop.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
      if (variant > 0) await desktop.locator(`[data-skin-preview-view="${variant}"]`).click();
      assert.equal(await desktop.locator(".gamesense-skin-preview-card.has-true-model").count(), 1);
      assert.match(await desktop.locator(".gamesense-skin-model-stage iframe").getAttribute("src"), new RegExp(`${modelId}/embed`, "i"));
      await desktop.mouse.click(2, 2);
      await desktop.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    };
    await assertVandalModel("Neptune", 0, "bd272b95723942dbaf1004d2626ec128");
    await assertVandalModel("Neptune", 1, "b61e3f7bf9c749878beba1d6e01d6a84");
    await assertVandalModel("Prelude to Chaos", 3, "49fcf7c9b36e4ac2b877fc4f32048071");
    await assertVandalModel("RGX 11z Pro", 2, "65d8384673f241938de5c39dff07d200");
    await assertVandalModel("RGX 11z Pro", 3, "53259a078e6e4521b1e116e6723f0011");
    await desktop.locator('[data-gamesense-weapon="phantom"]').click();
    await desktop.locator('[data-gamesense-weapon="phantom"].active').waitFor({ state: "visible" });
    await desktop.locator(".gamesense-weapon-history summary").click();
    assert.ok(await desktop.locator(".gamesense-weapon-history li").count() >= 2);
    const weaponPatchOrder = await desktop.locator(".gamesense-weapon-history li > span").allInnerTexts();
    assert.deepEqual(weaponPatchOrder, [...weaponPatchOrder].sort((left, right) => Number.parseFloat(right.replace(/[^\d.]/g, "")) - Number.parseFloat(left.replace(/[^\d.]/g, ""))));
    await desktop.locator(".gamesense-weapon-guidance").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-guidance-desktop.png") });
    await desktop.locator(".gamesense-weapon-history").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-history-desktop.png") });
    assert.ok(await desktop.locator(".gamesense-damage-target-row").count() >= 2);
    assert.equal(await desktop.locator('.gamesense-damage-target-row img.gamesense-target-dummy[src^="assets/library/target-dummy.svg?"]').count(), await desktop.locator(".gamesense-damage-target-row").count());
    const desktopDamageLineState = await desktop.locator(".gamesense-damage-target").first().evaluate(target => {
      const image = target.querySelector(".gamesense-target-dummy").getBoundingClientRect();
      return ["head", "body", "legs"].map(part => {
        const line = target.querySelector(`.gamesense-damage-line.is-${part}`).getBoundingClientRect();
        const label = target.querySelector(`span.is-${part}`).getBoundingClientRect();
        const lineY = line.top + line.height / 2;
        return {
          part,
          lineStartsInsideDummy: line.left >= image.left - 1 && line.left <= image.right + 1 && lineY >= image.top - 1 && lineY <= image.bottom + 1,
          lineTouchesLabel: line.right >= label.left - 1 && line.right <= label.right + 1,
          verticalDelta: Math.abs(lineY - (label.top + label.height / 2))
        };
      });
    });
    assert.ok(desktopDamageLineState.every(item => item.lineStartsInsideDummy && item.lineTouchesLabel && item.verticalDelta <= 2), JSON.stringify(desktopDamageLineState));
    await desktop.locator(".gamesense-damage-table").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-damage-targets-desktop.png") });
    await desktop.click('[data-gamesense-back="weapons"]');
    await desktop.locator('.gamesense-entry-grid-weapons [data-gamesense-item="sidearms"]').click();
    await desktop.locator('[data-gamesense-weapon="classic"]').click();
    await desktop.locator('[data-gamesense-weapon="classic"].active').waitFor({ state: "visible" });
    assert.match(await desktop.locator(".gamesense-weapon-panel").innerText(), /do not sleep on the alt-fire.*close, sudden right-click fight.*full three-shot burst.*headshot plus one body shot/is);
    assert.doesNotMatch(await desktop.locator(".gamesense-weapon-panel").innerText(), /pellet/i);
    await desktop.locator(".gamesense-weapon-guidance").screenshot({ path: path.join(__dirname, "tmp", "gamesense-sidearms-classic-desktop.png") });
    const contentCoverage = await desktop.evaluate(() => {
      const reference = globalThis.RankedCoachGamesenseReference;
      return {
        agentCount: reference.agents.length,
        agents: reference.agents.every(agent => agent.fundamentals.length >= 3 && agent.lore.length >= 2 && agent.patchHistory.length >= 1),
        abilityCoverage: reference.agents.every(agent => agent.abilities.length >= 4 && agent.abilities.every(ability => {
          const isPassive = /^Passive\b/i.test(ability.slot || "");
          const canonicalIdentity = ability.name && ability.summary;
          const reviewedAbility = ability.stats?.Cost
            && Object.keys(ability.stats).length >= 2
            && ability.purpose
            && ability.setup;
          const honestPassive = isPassive
            && !Object.keys(ability.stats || {}).length
            && !ability.purpose
            && !ability.setup;
          return Boolean(canonicalIdentity && (reviewedAbility || honestPassive));
        })),
        mapCount: globalThis.RankedCoachGamesenseMaps.length,
        mapCoverage: globalThis.RankedCoachGamesenseMaps.every(map => {
          const canonical = map.layoutImage && map.cardImage && map.callouts.length;
          const reviewedGuidance = map.macro?.attack?.length && map.macro?.defense?.length && map.roleNotes;
          const honestReviewHold = map.dataStatus === "in-review"
            && !map.macro?.attack?.length
            && !map.macro?.defense?.length
            && !Object.keys(map.roleNotes || {}).length;
          const verifiedAggregate = map.dataStatus === "verified"
            && Object.keys(map.highRankPickRates || {}).length >= 20
            && Array.isArray(map.metaComps)
            && map.metaComps.length >= 3;
          return Boolean(canonical && (reviewedGuidance || honestReviewHold || verifiedAggregate));
        }),
        weapons: reference.weapons.flatMap(group => group.weapons).every(weapon => {
          const canonical = weapon.label && weapon.image && Number.isFinite(weapon.cost) && weapon.damageRanges?.length;
          const reviewedGuidance = weapon.whenToUse?.length >= 2 && weapon.howToUse?.length >= 2 && weapon.patchHistory?.length >= 1;
          const honestCanonicalFallback = !weapon.whenToUse?.length && !weapon.howToUse?.length && Boolean(weapon.source);
          return Boolean(canonical && (reviewedGuidance || honestCanonicalFallback));
        })
      };
    });
    assert.deepEqual(contentCoverage, { agentCount: 29, agents: true, abilityCoverage: true, mapCount: 13, mapCoverage: true, weapons: true });
    await desktop.locator(".gamesense-selector-section").screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-detail.png") });
    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons", "sidearms"));
    await desktop.locator('[data-gamesense-weapon="sheriff"]').waitFor({ state: "visible" });
    await desktop.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    await desktop.locator(".gamesense-weapon-grid").evaluate(node => { window.__rankedCoachSidearmGridNode = node; });
    for (const weaponId of ["ghost", "sheriff"]) {
      await desktop.click(`[data-gamesense-weapon="${weaponId}"]`);
      assert.equal(await desktop.locator(`[data-gamesense-weapon="${weaponId}"]`).getAttribute("aria-pressed"), "true");
      assert.equal(await desktop.locator(".gamesense-weapon-grid").evaluate(node => window.__rankedCoachSidearmGridNode === node && node.isConnected), true);
    }
    await desktop.click('.nav-btn[data-page="library"]');
    await desktop.locator(".gamesense-topic-card").first().waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-topic-card").count(), 5);
    // Account & Support keeps a close control in the static DOM while its
    // modal is hidden. Library navigation must not expose a stray modal
    // control, rather than assuming none exists anywhere in the document.
    assert.equal(await desktop.locator(".lens-modal-close:visible").count(), 0);

    await desktop.click('.nav-btn[data-page="logging"]');
    await desktop.locator("#page-logging.active").waitFor({ state: "visible" });
    await desktop.locator("#logFocusCustomTrigger").click();
    assert.equal(await desktop.locator("#logFocusCustomMenu").isVisible(), true);
    await desktop.click('.nav-btn[data-page="library"]');
    await desktop.locator("#page-library.active").waitFor({ state: "visible" });
    assert.equal(await desktop.locator("#logFocusCustomMenu").isVisible(), false);
    assert.equal(await desktop.locator("#logFocusCustomTrigger").getAttribute("aria-expanded"), "false");
    assert.equal(await desktop.locator("#logFocusCustomTrigger").evaluate(trigger => getComputedStyle(trigger).pointerEvents), "none");
    await desktop.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons", "shotguns"));
    await desktop.locator('[data-gamesense-weapon="judge"]').click();
    await desktop.waitForFunction(() => document.querySelectorAll('.gamesense-collection-card[data-preview-weapon="Judge"]').length > 14);
    const boundJudge = desktop.locator('.gamesense-collection-card[data-gamesense-collection-preview][data-preview-name="Bound"]');
    await boundJudge.click();
    await desktop.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".gamesense-skin-preview-card.is-primary-only").count(), 1);
    assert.equal(await desktop.locator(".gamesense-skin-preview-card.has-static-render").count(), 1);
    assert.equal(await desktop.locator("[data-skin-preview-view]").count(), 1);
    assert.equal(await desktop.locator("[data-skin-preview-step]").count(), 0);
    assert.equal(await desktop.locator(".gamesense-skin-source-preview iframe").count(), 0);
    assert.equal(await desktop.locator("[data-skin-preview-video]").count(), 1);
    assert.equal(await desktop.locator(".gamesense-skin-video-pane iframe").count(), 0);
    assert.equal(await desktop.locator("#logFocusCustomMenu").isVisible(), false);
    await desktop.mouse.click(2, 2);
    await desktop.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    await desktop.click('.nav-btn[data-page="logging"]');
    await desktop.locator("#page-logging.active").waitFor({ state: "visible" });
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
    await mobile.route("https://valorant-api.com/v1/weapons/**", route => route.fulfill({ contentType: "application/json", body: weaponSkinApiStub(route.request().url()) }));
    await mobile.route("https://media.valorant-api.com/contenttiers/**", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="#fff" d="M12 1 23 12 12 23 1 12z"/></svg>' }));
    await mobile.route("https://media.valorant-api.com/videos/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await mobile.route("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await mobile.route("https://valorant.dyn.riotcdn.net/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await mobile.route("https://sketchfab.com/models/**/embed**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Interactive 3D model</title><main>Sketchfab model viewer</main>" }));
    await mobile.route("https://www.youtube-nocookie.com/embed/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Bundle showcase</title>" }));
    await mobile.route(/^https:\/\/player\.twitch\.tv\/\?.*$/i, route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Twitch player</title>" }));
    await stubRankIconPreloads(mobile);
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
    assert.equal(await mobile.locator(".gamesense-topic-card").count(), 5);
    assert.equal(await mobile.locator('[data-gamesense-topic="crosshairs"]').count(), 1);
    await mobile.waitForFunction(() => [...document.querySelectorAll('[data-gamesense-topic="maps"] .gamesense-topic-collage img')].every(image => image.complete && image.naturalWidth > 0));
    const mobileMapOverviewImages = await mobile.locator('[data-gamesense-topic="maps"] .gamesense-topic-collage img').evaluateAll(images => images.map(image => ({
      currentSrc: image.currentSrc,
      fallbackUsed: image.dataset.gamesenseOverviewFallbackUsed || "",
      filter: getComputedStyle(image).filter,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight
    })));
    assert.equal(mobileMapOverviewImages.length, 13, JSON.stringify(mobileMapOverviewImages));
    assert.ok(mobileMapOverviewImages.every(image => /\/assets\/library\/maps\/thumbs\/[a-z-]+\.jpg$/i.test(image.currentSrc) && image.fallbackUsed === "" && image.filter === "none" && image.naturalWidth <= 400 && image.naturalHeight <= 240), JSON.stringify(mobileMapOverviewImages));
    await mobile.locator('[data-gamesense-topic="maps"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-maps-topic-mobile.png") });
    await mobile.waitForFunction(() => [...document.querySelectorAll('[data-gamesense-topic="weapons"] .gamesense-topic-collage img')].every(image => image.complete && image.naturalWidth > 0));
    await mobile.locator('[data-gamesense-topic="agents"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-agents-topic-mobile.png") });
    assert.equal(await mobile.locator('[data-gamesense-topic="weapons"] .gamesense-topic-collage img').count(), 19);
    const mobileWeaponTopicArt = await mobile.locator('[data-gamesense-topic="weapons"]').evaluate(card => {
      const title = card.querySelector(":scope > strong").getBoundingClientRect();
      const action = card.querySelector(".gamesense-topic-action").getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const images = [...card.querySelectorAll(".gamesense-topic-collage img")].map(image => image.getBoundingClientRect());
      return { card: cardRect.toJSON(), titleTop: title.top, titleColor: getComputedStyle(card.querySelector(":scope > strong")).color, action: action.toJSON(), images: images.map(image => image.toJSON()) };
    });
    assert.ok(mobileWeaponTopicArt.images.every(image => image.left >= mobileWeaponTopicArt.card.left && image.right <= mobileWeaponTopicArt.card.right && image.top >= mobileWeaponTopicArt.card.top && image.bottom <= mobileWeaponTopicArt.card.bottom), JSON.stringify(mobileWeaponTopicArt));
    assert.equal(mobileWeaponTopicArt.titleColor, "rgb(246, 196, 83)");
    assert.ok(mobileWeaponTopicArt.action.bottom <= mobileWeaponTopicArt.titleTop, JSON.stringify(mobileWeaponTopicArt));
    await mobile.locator('[data-gamesense-topic="weapons"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapons-topic-mobile.png") });
    assert.equal(await mobile.locator(".gamesense-topic-number").count(), 0);
    await mobile.click('[data-gamesense-topic="playlist"]');
    await mobile.locator(".gamesense-playlist-home").waitFor({ state: "visible" });
    await mobile.waitForTimeout(700);
    assert.doesNotMatch(await mobile.locator(".gamesense-playlist-home > .gamesense-playlist-grid:not(.gamesense-live-grid)").innerText(), /Ranked coaching VOD/i);
    assert.equal(await mobile.locator(".gamesense-playlist-filters button").count(), 14);
    assert.equal(await mobile.locator(".gamesense-playlist-filters button").first().getAttribute("data-gamesense-playlist-filter"), "All");
    assert.equal(await mobile.locator(".gamesense-playlist-filters button").last().getAttribute("data-gamesense-playlist-filter"), "Historical Archive");
    assert.equal(await mobile.locator('[data-gamesense-playlist-filter="Home"] .gamesense-playlist-home-icon').count(), 1);
    assert.match(await mobile.locator(".gamesense-live-card").innerText(), /Charla7an.*412 watching/is);
    const mobileFilterStrip = mobile.locator(".gamesense-playlist-filters");
    const mobileFilterBox = await mobileFilterStrip.boundingBox();
    await mobileFilterStrip.dispatchEvent("pointerdown", { pointerId: 17, pointerType: "touch", button: 0, buttons: 1, clientX: mobileFilterBox.x + mobileFilterBox.width - 18, clientY: mobileFilterBox.y + mobileFilterBox.height / 2 });
    await mobileFilterStrip.dispatchEvent("pointermove", { pointerId: 17, pointerType: "touch", button: 0, buttons: 1, clientX: mobileFilterBox.x + 38, clientY: mobileFilterBox.y + mobileFilterBox.height / 2 });
    await mobileFilterStrip.dispatchEvent("pointerup", { pointerId: 17, pointerType: "touch", button: 0, buttons: 0, clientX: mobileFilterBox.x + 38, clientY: mobileFilterBox.y + mobileFilterBox.height / 2 });
    const mobilePlaylistFilterScroll = await mobileFilterStrip.evaluate(filters => {
      const style = getComputedStyle(filters);
      return { clientWidth: filters.clientWidth, scrollWidth: filters.scrollWidth, scrollLeft: filters.scrollLeft, overflowX: style.overflowX };
    });
    assert.ok(mobilePlaylistFilterScroll.scrollWidth > mobilePlaylistFilterScroll.clientWidth && mobilePlaylistFilterScroll.scrollLeft > 0 && ["auto", "scroll"].includes(mobilePlaylistFilterScroll.overflowX), JSON.stringify(mobilePlaylistFilterScroll));
    await mobile.waitForTimeout(300);
    await mobile.locator('[data-gamesense-playlist-filter="Home"]').click();
    await mobile.locator(".gamesense-playlist-gallery-head").scrollIntoViewIfNeeded();
    await mobile.screenshot({ path: path.join(__dirname, "tmp", "gamesense-playlist-home-mobile.png") });
    await mobile.locator(".gamesense-playlist-home .gamesense-video-card [data-gamesense-play-video]").first().click();
    const mobileEmbed = mobile.locator("#gamesenseMediaOverlay .gamesense-video-embed:not(.gamesense-twitch-embed)");
    assert.match(await mobileEmbed.getAttribute("src"), /controls=1.*fs=1.*playsinline=1/);
    const mobileEmbedHitState = await mobileEmbed.evaluate(frame => {
      const rect = frame.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        pointerEvents: getComputedStyle(frame).pointerEvents,
        hitAtControls: document.elementFromPoint(rect.left + rect.width / 2, rect.bottom - 12) === frame
      };
    });
    assert.ok(mobileEmbedHitState.width >= 200 && mobileEmbedHitState.height >= 200, JSON.stringify(mobileEmbedHitState));
    assert.equal(mobileEmbedHitState.pointerEvents, "auto", JSON.stringify(mobileEmbedHitState));
    assert.equal(mobileEmbedHitState.hitAtControls, true, JSON.stringify(mobileEmbedHitState));
    await mobile.locator("#gamesenseMediaOverlay [data-gamesense-close-media]").click();
    await mobile.locator(".gamesense-live-card [data-gamesense-play-twitch]").click();
    const mobileTwitchEmbed = mobile.locator("#gamesenseMediaOverlay .gamesense-twitch-embed");
    assert.match(await mobileTwitchEmbed.getAttribute("src"), /player\.twitch\.tv\/\?.*parent=127\.0\.0\.1.*autoplay=false.*channel=Charla7an/i);
    assert.equal(await mobileTwitchEmbed.getAttribute("allowfullscreen"), "");
    const mobileTwitchHitState = await mobileTwitchEmbed.evaluate(frame => {
      const rect = frame.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        pointerEvents: getComputedStyle(frame).pointerEvents,
        hitAtControls: document.elementFromPoint(rect.left + rect.width / 2, rect.bottom - 12) === frame
      };
    });
    assert.ok(mobileTwitchHitState.width >= 280 && mobileTwitchHitState.height >= 150, JSON.stringify(mobileTwitchHitState));
    assert.equal(mobileTwitchHitState.pointerEvents, "auto", JSON.stringify(mobileTwitchHitState));
    assert.equal(mobileTwitchHitState.hitAtControls, true, JSON.stringify(mobileTwitchHitState));
    await mobile.locator("#gamesenseMediaOverlay .gamesense-media-dialog").screenshot({ path: path.join(__dirname, "tmp", "gamesense-playlist-embeds-mobile.png") });
    await mobile.locator("#gamesenseMediaOverlay [data-gamesense-close-media]").click();
    await mobile.locator(".gamesense-back").click();
    await mobile.locator('[data-gamesense-topic="maps"]').waitFor({ state: "visible" });
    await mobile.click('[data-gamesense-topic="maps"]');
    assert.equal(
      await mobile.evaluate(() => document.documentElement.dataset.gamesenseTransition || ""),
      "",
      "Mobile Library navigation must avoid full-page view transitions."
    );
    await mobile.locator('.gamesense-map-entry-card').first().waitFor({ state: "visible" });
    assert.equal(await mobile.locator('[data-gamesense-map-season="all"]').count(), 0);
    assert.equal(await mobile.locator('.gamesense-map-entry-card').count(), 7);
    const mobileMapGallery = await mobile.locator(".gamesense-map-entry-card").evaluateAll(cards => cards.map(card => {
      const cardRect = card.getBoundingClientRect();
      const title = card.querySelector(".gamesense-map-card-copy strong").getBoundingClientRect();
      return {
        centerDelta: Math.abs((title.top + title.bottom) / 2 - (cardRect.top + cardRect.bottom) / 2),
        color: getComputedStyle(card.querySelector(".gamesense-map-card-copy strong")).color
      };
    }));
    assert.ok(mobileMapGallery.every(card => card.centerDelta <= 24 && card.color === "rgb(246, 196, 83)"), JSON.stringify(mobileMapGallery));
    await mobile.locator(".gamesense-entry-grid-maps").screenshot({ path: path.join(__dirname, "tmp", "gamesense-map-gallery-mobile.png") });
    await mobile.click('[data-gamesense-map-season="out"]');
    await mobile.locator('[data-gamesense-item="bind"]').waitFor({ state: "visible" });
    await mobile.click('[data-gamesense-item="bind"]');
    await mobile.waitForTimeout(360);
    assert.equal(await mobile.locator(".gamesense-tactical-stage img").isVisible(), true);
    assert.match(await mobile.locator(".gamesense-tactical-stage img").getAttribute("src"), /bind-layout-labeled\.svg$/);
    assert.equal(await mobile.locator(".gamesense-callout").count(), 0);
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
    await mobile.locator('[data-gamesense-map-zoom="reset"]').evaluate(button => button.click());
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
    assert.equal(fitScrollStart.touchAction, "pan-x pan-y", JSON.stringify(fitScrollStart));
    assert.equal(fitScrollStart.overflowY, "auto", JSON.stringify(fitScrollStart));
    assert.ok(fitScrollEnd >= fitScrollStart.scrollTop, JSON.stringify({ fitScrollStart, fitScrollEnd }));
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
    await mobile.locator('[data-gamesense-map-view="plants"]').evaluate(button => button.click());
    await mobile.waitForTimeout(360);
    await mobile.locator('[data-gamesense-map-zoom="reset"]').evaluate(button => button.click());
    assert.equal(await mobile.locator(".gamesense-plant-legend").count(), 1);
    assert.equal(await mobile.locator(".gamesense-plant-legend").getAttribute("hidden"), null);
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

    if (!await mobile.locator("#page-library").evaluate(page => page.classList.contains("is-current-page"))) {
      await mobile.waitForTimeout(500);
      await mobile.click('.mobile-bottom-page-btn[data-mobile-page="library"]');
      await mobile.locator("#page-library.is-current-page").waitFor({ state: "visible" });
    }
    await mobile.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("maps", "breeze"));
    await mobile.locator(".gamesense-comp-list").scrollIntoViewIfNeeded();
    await mobile.locator(".gamesense-comp-option").first().waitFor({ state: "visible" });
    assert.doesNotMatch(await mobile.locator(".gamesense-comp-list").innerText(), /Individual agent strength/i);
    assert.equal(await mobile.locator(".gamesense-comp-mobile-evidence").count(), 3);
    assert.match(await mobile.locator(".gamesense-comp-mobile-evidence").first().innerText(), /Lineup win rate\s+Not published.*Round conversion\s+Not published/is);
    assert.doesNotMatch(await mobile.locator(".gamesense-comp-mobile-evidence").first().innerText(), /\d+(?:\.\d+)?%/);
    await mobile.locator(".gamesense-comp-list").screenshot({ path: path.join(__dirname, "tmp", "gamesense-current-comps-mobile.png") });
    const mobilePickExplorer = mobile.locator(".gamesense-comp-pick-explorer");
    await mobilePickExplorer.locator("summary").click();
    await mobilePickExplorer.locator('[data-gamesense-comp-role="Duelist"]').click();
    const mobilePickRows = await mobilePickExplorer.locator(".gamesense-comp-pick-row").evaluateAll(rows => rows.map(row => {
      const card = row.getBoundingClientRect();
      const identity = row.querySelector(".gamesense-comp-pick-identity").getBoundingClientRect();
      const rank = row.querySelector(".gamesense-comp-pick-rank").getBoundingClientRect();
      const rates = row.querySelector(".gamesense-comp-pick-rates").getBoundingClientRect();
      const rateColumns = [...row.querySelectorAll(".gamesense-comp-pick-rates > span")].map(item => item.getBoundingClientRect().toJSON());
      return { card: card.toJSON(), children: [...row.children].map(child => child.getBoundingClientRect().toJSON()), identity: identity.toJSON(), rank: rank.toJSON(), rates: rates.toJSON(), rateColumns };
    }));
    assert.ok(mobilePickRows.length > 0 && mobilePickRows.every(row => row.children.every(child => child.left >= row.card.left - 1 && child.right <= row.card.right + 1)), JSON.stringify(mobilePickRows));
    assert.ok(mobilePickRows.every(row => row.identity.right < row.rank.left && row.rates.left <= row.card.left + 13 && row.rates.right >= row.card.right - 13 && row.rateColumns.length === 2 && Math.abs(row.rateColumns[0].width - row.rateColumns[1].width) <= 1), JSON.stringify(mobilePickRows));
    await mobilePickExplorer.screenshot({ path: path.join(__dirname, "tmp", "gamesense-role-pick-explorer-mobile.png") });
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
    await mobile.waitForFunction(() => {
      const read = document.querySelector(".gamesense-comp-agent-read");
      const rect = read?.getBoundingClientRect();
      return Boolean(rect && rect.top >= 0 && rect.bottom <= innerHeight);
    }, null, { timeout: 3000 });
    const compReadPosition = await mobile.locator(".gamesense-comp-agent-read").evaluate(read => {
      const rect = read.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom, viewport: innerHeight };
    });
    assert.ok(compReadPosition.top >= 0 && compReadPosition.bottom <= compReadPosition.viewport, JSON.stringify(compReadPosition));

    await mobile.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("agents"));
    await mobile.locator(".gamesense-agent-entry-card").first().waitFor({ state: "visible" });
    await mobile.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    assert.equal(await mobile.locator("[data-gamesense-agent-role-filter]").count(), 5);
    const mobileRoleColors = { duelist: "#ff4655", controller: "#a78bfa", initiator: "#38bdf8", sentinel: "#34d399" };
    for (const [role, expectedColor] of Object.entries(mobileRoleColors)) {
      const roleButton = mobile.locator(`[data-gamesense-agent-role-filter="${role}"]`);
      await roleButton.click();
      assert.equal(await roleButton.getAttribute("aria-selected"), "true");
      const presentation = await roleButton.evaluate(button => ({
        roleColor: getComputedStyle(button).getPropertyValue("--agent-role-color").trim(),
        background: getComputedStyle(button).backgroundImage
      }));
      assert.equal(presentation.roleColor, expectedColor);
      assert.match(presentation.background, /linear-gradient/i);
    }
    await mobile.locator('[data-gamesense-agent-role-filter="all"]').click();
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
    assert.ok(mobileAgentTile.name.right <= mobileAgentTile.card.right - 10 && mobileAgentTile.hidden, JSON.stringify(mobileAgentTile));
    assert.deepEqual(await mobile.locator(".gamesense-agent-entry-card").first().evaluate(card => ({
      role: card.dataset.roleTone,
      name: getComputedStyle(card.querySelector(".gamesense-entry-copy strong")).color,
      index: getComputedStyle(card.querySelector(".gamesense-entry-index")).color
    })), { role: "controller", name: "rgb(167, 139, 250)", index: "rgb(167, 139, 250)" });
    const mobileDeadlockCard = mobile.locator('[data-gamesense-item="deadlock"]');
    await mobileDeadlockCard.scrollIntoViewIfNeeded();
    await mobile.waitForFunction(() => {
      const image = document.querySelector('[data-gamesense-item="deadlock"] img');
      return Boolean(image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0);
    });
    const mobileDeadlockName = await mobileDeadlockCard.evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const name = card.querySelector(".gamesense-entry-copy strong");
      const rect = name.getBoundingClientRect();
      const image = card.querySelector("img");
      return {
        card: cardRect.toJSON(),
        name: rect.toJSON(),
        fontSize: Number.parseFloat(getComputedStyle(name).fontSize),
        whiteSpace: getComputedStyle(name).whiteSpace,
        imageLoaded: image.complete && image.naturalWidth > 0 && image.naturalHeight > 0
      };
    });
    assert.ok(mobileDeadlockName.imageLoaded && mobileDeadlockName.name.left >= mobileDeadlockName.card.left && mobileDeadlockName.name.right <= mobileDeadlockName.card.right - 10 && mobileDeadlockName.fontSize <= 29, JSON.stringify(mobileDeadlockName));
    await mobileDeadlockCard.screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-deadlock-mobile.png") });
    const longAgentNames = await mobile.locator('[data-gamesense-item="brimstone"],[data-gamesense-item="chamber"]').evaluateAll(cards => cards.map(card => {
      const name = card.querySelector(".gamesense-entry-copy strong");
      const cardRect = card.getBoundingClientRect();
      const nameRect = name.getBoundingClientRect();
      return {
        agent: card.dataset.gamesenseItem,
        card: cardRect.toJSON(),
        name: nameRect.toJSON(),
        clientWidth: name.clientWidth,
        scrollWidth: name.scrollWidth,
        fontSize: Number.parseFloat(getComputedStyle(name).fontSize)
      };
    }));
    assert.ok(longAgentNames.length === 2 && longAgentNames.every(item => item.name.right <= item.card.right - 10 && item.scrollWidth <= item.clientWidth + 1), JSON.stringify(longAgentNames));
    await mobile.locator('[data-gamesense-item="brimstone"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-brimstone-mobile.png") });
    await mobile.locator('[data-gamesense-item="chamber"]').screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-chamber-mobile.png") });
    await mobile.locator(".gamesense-entry-grid-agents").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-gallery-mobile.png") });
    await mobile.locator(".gamesense-agent-entry-card").first().click();
    await mobile.locator(".gamesense-agent-rate").waitFor({ state: "visible" });
    await mobile.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    const mobileAgentDetail = await mobile.evaluate(() => {
      const rate = document.querySelector(".gamesense-agent-rate").getBoundingClientRect();
      const portrait = document.querySelector(".gamesense-agent-portrait-wrap").getBoundingClientRect();
      const art = document.querySelector(".gamesense-agent-portrait-wrap > img").getBoundingClientRect();
      const fieldGuide = document.querySelector(".gamesense-agent-detail-head > div:first-child > span").getBoundingClientRect();
      const active = document.querySelector(".gamesense-agent-detail-actions .gamesense-patch").getBoundingClientRect();
      const back = document.querySelector(".gamesense-agent-detail-actions .gamesense-back").getBoundingClientRect();
      const abilityHeading = document.querySelector(".gamesense-selector-section .gamesense-section-heading strong");
      return { gap: art.top - rate.bottom, portrait: portrait.toJSON(), art: art.toJSON(), artFit: getComputedStyle(document.querySelector(".gamesense-agent-portrait-wrap > img")).objectFit, activeBottom: active.bottom, backTop: back.top, fieldGuideLeft: fieldGuide.left, activeLeft: active.left, fieldGuideCenterY: fieldGuide.top + fieldGuide.height / 2, activeCenterY: active.top + active.height / 2, abilityAlign: getComputedStyle(abilityHeading).textAlign };
    });
    assert.ok(mobileAgentDetail.gap <= 12 && mobileAgentDetail.activeBottom <= mobileAgentDetail.backTop + 1 && mobileAgentDetail.fieldGuideLeft < mobileAgentDetail.activeLeft && Math.abs(mobileAgentDetail.fieldGuideCenterY - mobileAgentDetail.activeCenterY) <= 4 && mobileAgentDetail.abilityAlign === "left", JSON.stringify(mobileAgentDetail));
    assert.ok(mobileAgentDetail.art.height >= 390 && mobileAgentDetail.art.bottom <= mobileAgentDetail.portrait.bottom + 1 && mobileAgentDetail.artFit === "cover", JSON.stringify(mobileAgentDetail));
    await mobile.locator(".gamesense-agent-portrait-wrap").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-portrait-mobile.png") });
    await mobile.locator(".gamesense-agent-detail-head").screenshot({ path: path.join(__dirname, "tmp", "gamesense-agent-header-mobile.png") });

    await mobile.evaluate(() => globalThis.RankedCoachGamesenseLibrary.open("weapons"));
    await mobile.locator(".gamesense-weapon-entry-card").first().waitFor({ state: "visible" });
    await mobile.waitForFunction(() => !document.documentElement.dataset.gamesenseTransition);
    assert.equal(await mobile.locator(".gamesense-entry-grid-weapons .gamesense-entry-index").count(), 0);
    const mobileWeaponTile = await mobile.locator(".gamesense-weapon-entry-card").first().evaluate(card => {
      const cardRect = card.getBoundingClientRect();
      const art = card.querySelector(".gamesense-weapon-card-art").getBoundingClientRect();
      const images = [...card.querySelectorAll(".gamesense-weapon-card-art img")].map(image => image.getBoundingClientRect());
      const groupLeft = Math.min(...images.map(image => image.left));
      const groupRight = Math.max(...images.map(image => image.right));
      return { card: cardRect.toJSON(), art: art.toJSON(), count: images.length, groupCenter: (groupLeft + groupRight) / 2 };
    });
    assert.ok(mobileWeaponTile.count === 2 && Math.abs(mobileWeaponTile.groupCenter - (mobileWeaponTile.card.left + mobileWeaponTile.card.width / 2)) <= 3, JSON.stringify(mobileWeaponTile));
    assert.equal(await mobile.locator(".gamesense-weapon-entry-title").first().evaluate(title => getComputedStyle(title).color), "rgb(246, 196, 83)");
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
    await mobile.locator('[data-gamesense-weapon="phantom"]').click();
    const mobileDamagePager = mobile.locator(".gamesense-damage-table").first();
    const damagePagerState = await mobileDamagePager.evaluate(table => {
      const target = table.querySelector(".gamesense-damage-target").getBoundingClientRect();
      const image = table.querySelector(".gamesense-target-dummy").getBoundingClientRect();
      return {
        dots: table.querySelectorAll("[data-gamesense-damage-range]").length,
        visiblePanels: [...table.querySelectorAll("[data-gamesense-damage-range-panel]")].filter(panel => getComputedStyle(panel).display !== "none").length,
        imageHeightShare: image.height / target.height,
        lineCount: table.querySelectorAll(".gamesense-damage-line").length
      };
    });
    assert.ok(damagePagerState.dots >= 2 && damagePagerState.visiblePanels === 1 && damagePagerState.imageHeightShare >= .88 && damagePagerState.lineCount >= 3, JSON.stringify(damagePagerState));
    await mobileDamagePager.locator('[data-gamesense-damage-range="1"]').click();
    assert.equal(await mobileDamagePager.locator('[data-gamesense-damage-range-panel="1"]').evaluate(panel => getComputedStyle(panel).display !== "none"), true);
    await mobileDamagePager.screenshot({ path: path.join(__dirname, "tmp", "gamesense-weapon-damage-target-mobile.png") });
    await mobile.locator('[data-gamesense-weapon="vandal"]').click();
    await mobile.waitForFunction(() => document.querySelectorAll(".gamesense-collection-card").length > 14);
    assert.equal(await mobile.locator('.gamesense-collection-filters button:not([data-gamesense-collection-filter="all"]) .gamesense-tier-icon').count(), 5);
    const mobileAllFilterSpacing = await mobile.locator('[data-gamesense-collection-filter="all"]').evaluate(button => {
      const icon = button.querySelector(".gamesense-tier-icon-stack").getBoundingClientRect();
      const label = button.querySelector(":scope > span:last-child").getBoundingClientRect();
      return { gap: label.left - icon.right };
    });
    assert.ok(mobileAllFilterSpacing.gap >= 8, JSON.stringify(mobileAllFilterSpacing));
    const mobileBodyTapCard = mobile.locator(".gamesense-collection-card[data-gamesense-collection-preview]").nth(1);
    await touchWithNaturalDrift(mobile, mobileBodyTapCard);
    assert.equal(await mobileBodyTapCard.evaluate(card => card.classList.contains("is-selected")), true);
    assert.equal(await mobile.locator(".gamesense-skin-preview-overlay").count(), 0);
    await touchWithNaturalDrift(mobile, mobileBodyTapCard);
    await mobile.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
    await mobile.mouse.click(2, 2);
    await mobile.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    const mobileKeyboardCard = mobile.locator(".gamesense-collection-card[data-gamesense-collection-preview]").nth(2);
    await mobileKeyboardCard.focus();
    await mobileKeyboardCard.press("Enter");
    assert.equal(await mobileKeyboardCard.evaluate(card => card.classList.contains("is-selected")), true);
    assert.equal(await mobile.locator(".gamesense-skin-preview-overlay").count(), 0);
    await mobileKeyboardCard.press("Enter");
    await mobile.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
    await mobile.mouse.click(2, 2);
    await mobile.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    const firstMobileCollectionCard = mobile.locator(".gamesense-collection-card[data-gamesense-collection-preview]").first();
    await firstMobileCollectionCard.screenshot({ path: path.join(__dirname, "tmp", "gamesense-collection-card-mobile.png") });
    const mobileCollectionGeometry = await firstMobileCollectionCard.evaluate(card => {
      const art = card.querySelector(".gamesense-collection-art").getBoundingClientRect();
      const copyNode = card.querySelector(".gamesense-collection-copy");
      const copy = copyNode.getBoundingClientRect();
      const divider = card.querySelector(".gamesense-collection-divider").getBoundingClientRect();
      return { card: card.getBoundingClientRect().toJSON(), art: art.toJSON(), copy: copy.toJSON(), divider: divider.toJSON(), copyPaddingLeft: parseFloat(getComputedStyle(copyNode).paddingLeft) };
    });
    assert.ok(Math.abs(mobileCollectionGeometry.art.top - mobileCollectionGeometry.card.top) <= 2 && Math.abs(mobileCollectionGeometry.art.bottom - mobileCollectionGeometry.card.bottom) <= 2, JSON.stringify(mobileCollectionGeometry));
    assert.ok(mobileCollectionGeometry.copyPaddingLeft >= 14, JSON.stringify(mobileCollectionGeometry));
    assert.equal(await mobile.locator(".gamesense-skin-preview-overlay").count(), 0);
    await touchWithNaturalDrift(mobile, firstMobileCollectionCard);
    assert.equal(await firstMobileCollectionCard.evaluate(card => card.classList.contains("is-selected")), true);
    assert.equal(await mobile.locator(".gamesense-skin-preview-overlay").count(), 0);
    await mobile.waitForTimeout(180);
    const firstMobileCollectionOpen = firstMobileCollectionCard.locator("[data-gamesense-collection-open]");
    const mobileOpenControl = await firstMobileCollectionOpen.evaluate(button => ({
      height: button.getBoundingClientRect().height,
      opacity: Number(getComputedStyle(button).opacity),
      pointerEvents: getComputedStyle(button).pointerEvents
    }));
    assert.ok(mobileOpenControl.height >= 44 && mobileOpenControl.opacity > .9 && mobileOpenControl.pointerEvents === "auto", JSON.stringify(mobileOpenControl));
    await firstMobileCollectionCard.screenshot({ path: path.join(__dirname, "tmp", "gamesense-collection-card-mobile-selected.png") });
    await touchWithNaturalDrift(mobile, firstMobileCollectionOpen, { x: 2, y: 2 });
    await mobile.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
    await mobile.waitForTimeout(250);
    const mobileOverlayPlacement = await mobile.locator(".gamesense-skin-preview-overlay").evaluate(overlay => {
      const rect = overlay.getBoundingClientRect();
      return {
        position: getComputedStyle(overlay).position,
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        viewportWidth: document.documentElement.clientWidth,
        viewportHeight: document.documentElement.clientHeight,
        ownsViewportCenter: Boolean(document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest?.(".gamesense-skin-preview-overlay"))
      };
    });
    assert.equal(mobileOverlayPlacement.position, "fixed", JSON.stringify(mobileOverlayPlacement));
    assert.ok(Math.abs(mobileOverlayPlacement.top) <= 1 && Math.abs(mobileOverlayPlacement.left) <= 1, JSON.stringify(mobileOverlayPlacement));
    assert.ok(Math.abs(mobileOverlayPlacement.right - mobileOverlayPlacement.viewportWidth) <= 1 && Math.abs(mobileOverlayPlacement.bottom - mobileOverlayPlacement.viewportHeight) <= 1, JSON.stringify(mobileOverlayPlacement));
    assert.equal(mobileOverlayPlacement.ownsViewportCenter, true, JSON.stringify(mobileOverlayPlacement));
    const mobileSkinViewer = await mobile.locator(".gamesense-skin-preview-card").evaluate(card => ({
      width: card.getBoundingClientRect().width,
      viewport: document.documentElement.clientWidth,
      columns: getComputedStyle(card).gridTemplateColumns,
      overflow: card.scrollWidth > card.clientWidth + 1
    }));
    assert.ok(mobileSkinViewer.width <= mobileSkinViewer.viewport && !mobileSkinViewer.overflow, JSON.stringify(mobileSkinViewer));
    assert.equal(mobileSkinViewer.columns.split(" ").length, 1, JSON.stringify(mobileSkinViewer));
    assert.equal(await mobile.locator("[data-skin-preview-view]").count(), 3);
    assert.equal(await mobile.locator("[data-skin-preview-step]").count(), 0);
    assert.equal(await mobile.locator(".gamesense-skin-variant-index").count(), 0);
    assert.equal(await mobile.locator("[data-skin-orbit-stage], [data-skin-orbit-scene]").count(), 0);
    assert.equal(await mobile.locator(".gamesense-skin-model-stage.is-static").count(), 1);
    assert.equal(await mobile.locator("[data-skin-preview-video]").count(), 1);
    assert.equal(await mobile.locator("[data-skin-media-page-button]").count(), 2);
    const mobileNativeVideoRect = await mobile.locator("[data-skin-preview-video]").evaluate(video => video.getBoundingClientRect().toJSON());
    const mobilePagerAtVideoTop = await mobile.locator(".gamesense-skin-media-pagination").evaluate(pager => {
      const pagerRect = pager.getBoundingClientRect();
      const frameRect = document.querySelector(".gamesense-skin-animation-frame").getBoundingClientRect();
      const videoRect = document.querySelector("[data-skin-preview-video]").getBoundingClientRect();
      return {
        pager: pagerRect.toJSON(),
        frame: frameRect.toJSON(),
        video: videoRect.toJSON(),
        centerDelta: Math.abs((pagerRect.left + pagerRect.width / 2) - (videoRect.left + videoRect.width / 2))
      };
    });
    assert.ok(mobilePagerAtVideoTop.pager.top >= mobilePagerAtVideoTop.frame.top && mobilePagerAtVideoTop.pager.top <= mobilePagerAtVideoTop.video.top + 2, JSON.stringify(mobilePagerAtVideoTop));
    assert.ok(mobilePagerAtVideoTop.centerDelta <= 2, JSON.stringify(mobilePagerAtVideoTop));
    await mobile.locator('[data-skin-media-page-button="1"]').click();
    assert.equal(await mobile.locator('[data-skin-media-page="1"]').isVisible(), true);
    const mobileBundleVideoRect = await mobile.locator(".gamesense-skin-video-pane iframe").evaluate(frame => frame.getBoundingClientRect().toJSON());
    assert.ok(Math.abs(mobileBundleVideoRect.width - mobileNativeVideoRect.width) <= 2 && Math.abs(mobileBundleVideoRect.height - mobileNativeVideoRect.height) <= 2, JSON.stringify({ mobileNativeVideoRect, mobileBundleVideoRect }));
    await mobile.locator(".gamesense-skin-media-pane").screenshot({ path: path.join(__dirname, "tmp", "gamesense-skin-preview-bundle-mobile.png") });
    await mobile.locator('[data-skin-media-page-button="0"]').click();
    await mobile.locator('[data-skin-preview-view="1"]').click();
    assert.match(await mobile.locator("[data-skin-preview-image]").getAttribute("src"), /vandal\.png\?preview=0&view=1/i);
    assert.match(await mobile.locator("[data-skin-preview-video]").getAttribute("src"), /vandal-0-1\.mp4/i);
    await mobile.locator(".gamesense-skin-preview-card").evaluate(card => { card.scrollTop = 0; });
    await mobile.locator(".gamesense-skin-preview-overlay").screenshot({ path: path.join(__dirname, "tmp", "gamesense-skin-preview-mobile.png") });
    await mobile.mouse.click(2, 2);
    await mobile.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    const mobileReaverCard = mobile.locator('.gamesense-collection-card[data-gamesense-collection-preview][data-preview-name="Reaver"]');
    await touchWithNaturalDrift(mobile, mobileReaverCard);
    assert.equal(await mobileReaverCard.evaluate(card => card.classList.contains("is-selected")), true);
    assert.equal(await mobile.locator(".gamesense-skin-preview-overlay").count(), 0);
    await touchWithNaturalDrift(mobile, mobileReaverCard.locator("[data-gamesense-collection-open]"), { x: 2, y: 2 });
    await mobile.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
    const mobileUpgradeRail = await mobile.locator('.gamesense-skin-option-groups > section:first-child > div').evaluate(rail => ({
      overflowX: getComputedStyle(rail).overflowX,
      clientWidth: rail.clientWidth,
      scrollWidth: rail.scrollWidth,
      buttonWidths: [...rail.querySelectorAll("button")].map(button => button.getBoundingClientRect().width)
    }));
    assert.equal(mobileUpgradeRail.overflowX, "hidden", JSON.stringify(mobileUpgradeRail));
    assert.ok(mobileUpgradeRail.scrollWidth <= mobileUpgradeRail.clientWidth + 1, JSON.stringify(mobileUpgradeRail));
    assert.ok(mobileUpgradeRail.buttonWidths.every(width => width >= 44), JSON.stringify(mobileUpgradeRail));
    await mobile.locator('[data-skin-preview-view="1"]').click();
    assert.equal(await mobile.locator("[data-skin-preview-video]").isHidden(), true);
    assert.equal(await mobile.locator("[data-skin-animation-static]").isVisible(), true);
    assert.match(await mobile.locator("[data-skin-animation-static] img").getAttribute("src"), /vandal\.png\?preview=16&view=1/i);
    await mobile.mouse.click(2, 2);
    await mobile.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached" });
    await mobile.click('.mobile-bottom-page-btn[data-mobile-page="library"]');
    await mobile.locator(".gamesense-topic-card").first().waitFor({ state: "visible" });
    assert.equal(await mobile.locator(".gamesense-topic-card").count(), 5);
    await mobile.waitForTimeout(3000);
    await mobile.screenshot({ path: path.join(__dirname, "tmp", "gamesense-mobile-360x740.png"), fullPage: true });
    await mobile.close();

    assert.deepEqual(browserErrors, []);
    console.log("Gamesense Library checks passed: page scrolling, bottom tactical maps, centered headings, real weapon art, native skin videos, attributed 3D model embeds, role-colored comps, lore/history, stable selected-state transitions, and 360x740 containment.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

if (require.main === module) {
  run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { port, startServer, supabaseStub, weaponSkinApiStub, seed, dismissWarmup };
