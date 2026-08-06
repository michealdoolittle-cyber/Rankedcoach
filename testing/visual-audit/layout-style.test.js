const assert = require("assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41791;
const missingRequests = [];
const allLayoutStyles = ["honeycomb", "chevronscan", "aperturecut", "hazardedge", "diamondfacet", "bladewedge", "ribbonbanner", "monolithslab", "pixeldialog", "spearhead", "cargocrate", "battleplate", "steelrivetframe", "prismrim", "hazardrim"];
const allLayoutTextures = ["carbonweave", "circuitplate", "topocontour", "frostfracture", "blueprintgrid", "brushedplate", "hexarmor", "chainmesh", "thermalvision", "wovencable", "rustpatina", "frostedglass"];
const requestedLayoutStyles = String(process.env.LAYOUT_STYLE_FILTER || "")
  .split(",")
  .map(value => value.trim())
  .filter(Boolean);
const layoutStyles = requestedLayoutStyles.length
  ? allLayoutStyles.filter(style => requestedLayoutStyles.includes(style))
  : allLayoutStyles;
const phaseTwoSurfaces = Object.freeze({
  home: [
    ".loadout-card", ".compass-panel", ".rr-card", ".rr-chart-card",
    ".weekly-focus-card", ".improvement-card", ".weekly-focus-confidence"
  ],
  stats: [
    ".stats-summary-card", ".stats-performance-card", ".stats-breakdown-card",
    ".stats-maps-card", ".stats-agents-card", ".stats-weapons-card",
    ".stats-trend-tone"
  ],
  insights: [
    ".insight-action-hero", ".insight-card", ".trend-content.open",
    ".insight-tag", ".insight-meta-pill", ".insight-source", ".trend-signal-tone"
  ],
  logging: [
    ".logging-card", ".logging-feed-card", ".logging-hero",
    ".logging-form > .logging-row > .logging-pill", "#logQuickMenu", "#logNotes", ".log-feed-footnote"
  ]
});
const phaseTwoLibraryStates = Object.freeze([
  { id: "gallery", selectors: [".gamesense-hero", ".gamesense-season-scope"] },
  { id: "maps-gallery", open: ["maps", ""], selectors: [".gamesense-gallery-head"] },
  {
    id: "map-detail",
    open: ["maps", "breeze"],
    selectors: [".gamesense-detail-head", ".gamesense-patch", ".gamesense-tips-hub", ".gamesense-weapon-suggestions", ".gamesense-comp-card"],
    excluded: [".gamesense-weapon-suggestion-grid"]
  },
  {
    id: "agent-detail",
    open: ["agents", "omen"],
    selectors: [".gamesense-agent-hero", ".gamesense-patch", ".gamesense-selector-section", ".gamesense-map-fit"],
    excluded: [
      ".gamesense-agent-hero > div:nth-child(2) > section",
      ".gamesense-agent-lore-history > div",
      ".gamesense-selector-section > article",
      ".gamesense-selector-section > article > dl",
      ".gamesense-selector-section > article > .gamesense-fact-read",
      ".gamesense-map-fit-grid",
      ".gamesense-map-fit-item"
    ]
  },
  {
    id: "weapon-detail",
    open: ["weapons", "rifles"],
    weapon: "phantom",
    selectors: [".gamesense-weapon-panel", ".gamesense-patch", ".gamesense-selector-section", ".gamesense-collection-archive"],
    excluded: [
      ".gamesense-selector-section > article",
      ".gamesense-selector-section > article > dl",
      ".gamesense-selector-section > article .gamesense-weapon-guidance section"
    ]
  }
]);
const realContentExtremes = Object.freeze({
  home: {
    ".impact-card": { short: "Latest Duelist Report", long: "Latest Controller Report" },
    shortLabel: "Aim",
    longLabel: "Focus Category",
    shortTitle: "Aim",
    longTitle: "Discipline Compass Category",
    shortBody: "Aim is strongest.",
    longBody: "Discipline compass category is currently the lowest pillar in your profile."
  },
  stats: {
    shortLabel: "ADR",
    longLabel: "Damage / Round",
    shortTitle: "No data",
    longTitle: "Season 2026 Act 3 Competitive Performance",
    shortBody: "No match sample yet.",
    longBody: "Ranked match history is available from May 28, 2024. Earlier matches are not retained by the current data source."
  },
  insights: {
    shortLabel: "Watch",
    longLabel: "Medium Confidence",
    shortTitle: "Clutch Closing",
    longTitle: "Map Preparation Gap and Clutch Closing",
    shortBody: "Close the final duel.",
    longBody: "These are rounds where your timing and last-fight choice decided whether the advantage actually closed."
  },
  logging: {
    ".manual-match-panel": { short: "RR", long: "Rounds Lost" },
    shortLabel: "Saved",
    longLabel: "Crosshair Placement",
    shortTitle: "Match Reflection",
    longTitle: "Post-Game Competitive Reflection",
    shortBody: "Review the opening duel.",
    longBody: "Review the opening duel, utility timing, and final-round decision before the next competitive queue."
  },
  library: {
    shortLabel: "Aim",
    longLabel: "Active Season Plant Share",
    shortTitle: "Maps",
    longTitle: "Current Competitive Compositions",
    shortBody: "Attack and defense notes.",
    longBody: "Attack, defense, role notes, current compositions, and marked tactical layouts."
  }
});
const surfaceContentExtremes = Object.freeze({
  home: {
    ".role-filter-btn": { short: "All", long: "Controller" },
    "#spinAgentBtn.small-btn": { short: "Spin", long: "Reroll Loadout" },
    "#compassDescriptionToggle.compass-description-toggle": { short: "Details", long: "Hide Coach Description" },
    ".graph-btn": { short: "Act", long: "Lifetime" },
    "#timelineCycleBtn.timeline-cycle-btn": { short: "Act", long: "All Seasons" },
    ".weekly-focus-confidence": { short: "High", long: "Some proof" }
  },
  stats: {
    ".stats-summary-card": { short: "Iron 1", long: "Ascendant 3" },
    ".stats-proof-card": { short: "Iron 1", long: "Ascendant 3" },
    ".stats-role-progress-card": { short: "Duelist", long: "Controller" },
    ".stats-performance-card": { short: "Trends", long: "Recent Match Trends" },
    ".stats-breakdown-card": { short: "Patterns", long: "Match Patterns" },
    ".stats-maps-card": { short: "Maps", long: "Map Stats" },
    ".stats-agents-card": { short: "Agents", long: "Agent Stats" },
    ".stats-weapons-card": { short: "Weapons", long: "Weapon Stats" },
    "button[data-gamesense-open]": { short: "Learn Maps", long: "Learn Weapons" },
    "#statsActMobileTrigger": { short: "V26 A1", long: "Season 2026 Act 3" },
    ".stats-season-title": { short: "V26 A1", long: "Season 2026 Act 3" },
    ".stats-trend-tone": { short: "Watch", long: "Needs Work" }
  },
  insights: {
    ".insight-action-hero": { short: "Protect this read.", long: "Protect the clearest adjustment before your next ranked block." },
    ".insight-card": { short: "Hold the trade.", long: "Your retained rounds keep pointing back to the same late-fight choice." },
    ".insight-filter-btn": { short: "All", long: "Needs Work" },
    ".insight-tag": { short: "Good", long: "Needs Work" },
    ".insight-meta-pill": { short: "High", long: "Focus Category: Crosshair Placement" },
    ".insight-source": { short: "Riot", long: "Henrik Round History" },
    ".trend-signal-tone": { short: "Watch", long: "Strength" }
  },
  logging: {
    "#loggingTrainingMenuBtn.logging-training-menu-btn": { short: "Training", long: "Aim Training" },
    ".logging-chip": { short: "0", long: "5" },
    ".logging-quick-chip": { short: "AFK(s)", long: "Good defense half performance" },
    ".logging-quick-toggle": { short: "Add", long: "Quick Add" },
    ".logging-quick-close": { short: "Done", long: "Done" },
    "#logCalendarTrigger.logging-calendar-trigger": { short: "Today", long: "Wednesday, July 16" },
    "#logAgentBrowseBtn.agent-select-symbol": { short: "Agent", long: "Browse Agents" },
    "#logSaveBtn.small-btn": { short: "Save", long: "Save Reflection" }
  },
  library: {
    ".gamesense-back": { short: "Back", long: "Back To Library" },
    ".gamesense-map-view-tabs button": { short: "Map", long: "Plant Spots" },
    ".gamesense-tips-tabs button": { short: "Tips", long: "Defense Tips" },
    ".gamesense-comp-role-tabs button": { short: "All", long: "Controller" },
    ".gamesense-collection-filters button": { short: "All", long: "Exclusive Edition" },
    ".gamesense-patch": { short: "Patch 13.0", long: "Active Season | Patch 13.00" },
    ".gamesense-plant-preview-toggle": { short: "+", long: "−" }
  }
});

function weaponSkinApiStub() {
  const tiers = [
    "12683d76-48d7-84a3-4e09-6985794f0445",
    "0cebb8be-46d7-c12a-d306-e9907bfc5a25",
    "60bca009-4182-7998-dee7-b8a2558dc369"
  ];
  return JSON.stringify({
    status: 200,
    data: {
      displayName: "Phantom",
      skins: ["Aemondir", "Reaver", "Bound"].map((name, index) => ({
        uuid: `phase-two-skin-${index}`,
        displayName: `${name} Phantom`,
        contentTierUuid: tiers[index],
        displayIcon: `http://127.0.0.1:${port}/assets/weapons/phantom.png?skin=${index}`,
        chromas: [0, 1, 2, 3].map(view => ({
          uuid: `phase-two-skin-${index}-variant-${view}`,
          displayName: `${name} Phantom Variant ${view + 1}`,
          fullRender: `http://127.0.0.1:${port}/assets/weapons/phantom.png?preview=${index}&view=${view}`,
          swatch: `http://127.0.0.1:${port}/assets/weapons/phantom.png?swatch=${index}&view=${view}`,
          streamedVideo: `https://media.valorant-api.com/videos/phantom-${index}-${view}.mp4`
        })),
        levels: [1, 2, 3, 4].map(level => ({
          uuid: `phase-two-skin-${index}-level-${level}`,
          displayName: `${name} Level ${level}`,
          streamedVideo: `https://media.valorant-api.com/videos/phantom-${index}-level-${level}.mp4`
        }))
      }))
    }
  });
}

function escapeMarkup(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/api/henrik/health") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ ok: true, status: "healthy" }));
        return;
      }
      if (url === "/api/content/playlist") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], liveStreams: [], newIn24Hours: 0 }));
        return;
      }
      if (url === "/api/content/patch-notes") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({
          title: "VALORANT Patch Notes 13.02",
          label: "Patch 13.02",
          effectiveDate: "2026-07-28T13:00:00.000Z",
          sourceUrl: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-02/",
          bullets: ["Bug fixes, agent tuning, and competitive updates from Riot's official patch feed."],
          sections: []
        }));
        return;
      }
      if (url === "/api/content/knowledge") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ updatedAt: null, items: [] }));
        return;
      }
      if (url === "/api/content/skin-media") {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ matches: {} }));
        return;
      }
      if (url === "/") url = "/index.html";
      const file = path.join(root, url);
      if (!file.startsWith(root)) { response.writeHead(403); return response.end("Forbidden"); }
      fs.readFile(file, (error, data) => {
        if (error) {
          missingRequests.push(url);
          response.writeHead(404);
          return response.end("Not found");
        }
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

async function dismissVisibleWarmup(page) {
  if (!await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) return;
  await page.click("#dailyWarmupSkip");
  await page.locator("#dailyWarmupModal").waitFor({ state: "hidden", timeout: 5000 });
}

async function dismissWarmup(page) {
  await page.waitForTimeout(700);
  await dismissVisibleWarmup(page);
}

async function boot(page) {
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
  await dismissWarmup(page);
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
  await dismissWarmup(page);
  await page.evaluate(() => window.RankedCoachDailyEntrance?.skipAll?.());
  await page.waitForFunction(() => !document.body.classList.contains("daily-entrance-motion-active"), null, { timeout: 5000 });
}

async function activateCoveragePage(page, pageKey) {
  await dismissVisibleWarmup(page);
  const button = page.locator(`.nav-btn[data-page="${pageKey}"]`);
  await button.waitFor({ state: "visible", timeout: 10000 });
  await button.click();
  await page.locator(`#page-${pageKey}.active`).waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(80);
}

async function ensureLoggingFormSurface(page) {
  const viewport = page.viewportSize();
  if (!viewport || viewport.width <= 820) return;
  const launcher = page.locator('[data-logging-desktop-launch="postmatch"]');
  if (!await launcher.isVisible().catch(() => false)) return;
  await page.locator("#logFeed .log-edit-btn").first().click({ force: true });
  await page.waitForFunction(() => document.getElementById("page-logging")?.dataset.loggingDesktopView === "form");
  await page.locator(".logging-hero").waitFor({ state: "visible", timeout: 5000 });
}

async function waitForViewportScale(page, width, height) {
  await page.waitForFunction(({ width: expectedWidth, height: expectedHeight }) => {
    const root = getComputedStyle(document.documentElement);
    return Math.abs(Number.parseFloat(root.getPropertyValue("--app-base-width")) - expectedWidth) < 1
      && Math.abs(Number.parseFloat(root.getPropertyValue("--app-base-height")) - expectedHeight) < 1;
  }, { width, height }, { timeout: 5000 });
}

async function setCoverageLayoutStyle(page, style) {
  await page.evaluate(nextStyle => {
    document.body.dataset.layoutStyle = nextStyle;
  }, style);
  await page.waitForTimeout(80);
}

async function setCoverageTheme(page, mode = "default") {
  await page.evaluate(nextMode => {
    const palettes = {
      default: { card: "#0b1220", card2: "#0f172a", text: "#e6eef8", muted: "#94a3b8", accent: "#ff4655", accent2: "#f97316" },
      omen: { card: "#090a1a", card2: "#151129", text: "#f5f3ff", muted: "#c4b5fd", accent: "#8b5cf6", accent2: "#06b6d4" }
    };
    const palette = palettes[nextMode];
    const root = document.documentElement;
    root.style.setProperty("--card", palette.card);
    root.style.setProperty("--card-2", palette.card2);
    root.style.setProperty("--text", palette.text);
    root.style.setProperty("--muted", palette.muted);
    root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--accent-2", palette.accent2);
  }, mode);
  await page.waitForTimeout(30);
}

async function makeSurfaceVisible(page, selector) {
  const count = await page.locator(selector).count();
  assert.ok(count > 0, `Missing Phase 2 surface: ${selector}`);
  await page.locator(selector).first().evaluate(target => {
    const changes = [];
    let current = target;
    while (current instanceof HTMLElement && !current.classList.contains("page")) {
      if (current instanceof HTMLDetailsElement && !current.open) {
        changes.push({ element: current, detailsOpen: false });
        current.open = true;
      }
      const computed = getComputedStyle(current);
      if (current.hidden || computed.display === "none" || computed.visibility === "hidden") {
        changes.push({ element: current, hidden: current.hidden, display: current.style.display, visibility: current.style.visibility });
        current.hidden = false;
        if (computed.display === "none") current.style.display = current.tagName === "BUTTON" ? "inline-flex" : "block";
        if (computed.visibility === "hidden") current.style.visibility = "visible";
      }
      current = current.parentElement;
    }
    globalThis.__layoutPhaseTwoVisibilityRestore = changes;
  });
}

async function restoreSurfaceVisibility(page) {
  await page.evaluate(() => {
    (globalThis.__layoutPhaseTwoVisibilityRestore || []).reverse().forEach(change => {
      if (Object.prototype.hasOwnProperty.call(change, "detailsOpen")) {
        change.element.open = change.detailsOpen;
        return;
      }
      change.element.hidden = change.hidden;
      change.element.style.display = change.display;
      change.element.style.visibility = change.visibility;
    });
    globalThis.__layoutPhaseTwoVisibilityRestore = [];
  });
}

function isTransientSurfaceRenderError(error) {
  const message = String(error?.message || error || "");
  return /(?:element is not attached|element was detached|element is not stable|not stable|execution context was destroyed)/i.test(message);
}

async function resolveStableSurface(page, selector, { retries = 2, timeout = 5000 } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      // This page can rerender the feed after its parent becomes active. Resolve
      // the surface only after that render rather than carrying an old element
      // handle into scrollIntoViewIfNeeded.
      await makeSurfaceVisible(page, selector);
      const locator = page.locator(`${selector}:visible`).first();
      await locator.waitFor({ state: "visible", timeout });
      await locator.scrollIntoViewIfNeeded({ timeout });
      await locator.evaluate(async target => {
        if (!target.isConnected) throw new Error("surface element was detached during capture setup");
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (!target.isConnected) throw new Error("surface element was detached before capture");
        const rect = target.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) throw new Error("surface element has no stable painted bounds");
      });
      return locator;
    } catch (error) {
      lastError = error;
      // A retry must start from the real DOM state, including any temporary
      // visibility adjustment made for the previous, now-detached surface.
      await restoreSurfaceVisibility(page).catch(() => {});
      if (!isTransientSurfaceRenderError(error) || attempt === retries) throw error;
      await page.waitForTimeout(60 * (attempt + 1));
    }
  }
  throw lastError;
}

async function restoreSurfaceText(page) {
  await page.evaluate(() => {
    const restore = globalThis.__layoutPhaseTwoTextRestore;
    if (!restore?.leaf) {
      globalThis.__layoutPhaseTwoTextRestore = null;
      return;
    }
    const leaf = restore.leaf;
    // If a rerender detached this element, its injected text left with the
    // detached DOM node. Never let a failed locator action prevent cleanup of
    // a still-connected leaf.
    if (leaf.isConnected) {
      leaf.textContent = restore.text;
      if (restore.value != null && (leaf instanceof HTMLInputElement || leaf instanceof HTMLTextAreaElement)) {
        leaf.value = restore.value;
      }
      if (restore.fitSize) leaf.style.setProperty("--tb-auto-fit-font-size", restore.fitSize);
      else leaf.style.removeProperty("--tb-auto-fit-font-size");
      if (restore.fitAttribute == null) leaf.removeAttribute("data-tb-auto-fit");
      else leaf.setAttribute("data-tb-auto-fit", restore.fitAttribute);
      if (restore.fitBase == null) delete leaf.dataset.tbAutoFitBaseFontSize;
      else leaf.dataset.tbAutoFitBaseFontSize = restore.fitBase;
    }
    globalThis.__layoutPhaseTwoTextRestore = null;
  });
}

async function captureSurfaceExtremeAttempt(page, pageKey, selector, mode, style) {
  const locator = await resolveStableSurface(page, selector);
  const extremes = realContentExtremes[pageKey];
  await locator.evaluate((target, options) => {
    if (options.frameOnly) {
      globalThis.__layoutPhaseTwoTextRestore = { leaf: null, frameOnly: true };
      return;
    }
    const selectors = [
      ".card-sub", ".insight-preview", ".trend-signal-detail", ".logging-hero-text", ".logging-live-meta",
      ".stats-sub-text", ".stats-breakdown-detail", ".gamesense-entry-copy small", ".gamesense-note-block p",
      "p", "small", "h4", "h3", "h2", "strong", "span"
    ];
    const candidates = selectors.flatMap(selectorValue => [...target.querySelectorAll(selectorValue)]);
    const uniqueCandidates = [...new Set(candidates)];
    const targetRect = target.getBoundingClientRect();
    let leaf = uniqueCandidates.find(candidate => {
      const text = String(candidate.textContent || "").replace(/\s+/g, " ").trim();
      const rect = candidate.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      return /[A-Za-z0-9]/.test(text)
        && !candidate.closest(".chart-row,.impact-bar-outer,.impact-bar-fill,.impact-bar-shell,#compassSvg,.compass-bar-track,.compass-bar-fill,.coach-readiness-mini-bar,.coach-readiness-locked-bar,.profile-rating-meter,.profile-cleanup-meter,.stats-data-visual,.stats-confidence-visual")
        && rect.width > 2
        && rect.height > 2
        && centerX >= targetRect.left
        && centerX <= targetRect.right
        && centerY >= targetRect.top
        && centerY <= targetRect.bottom;
    });
    if (!leaf) leaf = target;
    const className = String(leaf.className || "");
    const originalText = String(leaf.textContent || "").replace(/\s+/g, " ").trim();
    const bodyCopy = leaf.matches("p,small") || /(sub|text|detail|preview|notes|meta|copy)/i.test(className);
    const compactLabel = /(label|kicker|pill|tag|badge|value)/i.test(className);
    const numericValue = /^[+\-]?\d[\d\s.,%/+\-]*$/.test(originalText);
    const contentKind = bodyCopy ? "Body" : compactLabel ? "Label" : "Title";
    const numericExtreme = originalText.includes("%")
      ? (options.mode === "short" ? "0%" : "100%")
      : originalText.includes("/")
        ? (options.mode === "short" ? "0/100" : "100/100")
        : (options.mode === "short" ? "0" : "100");
    const nextContent = options.surfaceExtremes?.[options.mode] || (numericValue
      ? numericExtreme
      : options.extremes[`${options.mode}${contentKind}`]);
    globalThis.__layoutPhaseTwoTextRestore = {
      leaf,
      text: leaf.textContent,
      value: leaf instanceof HTMLInputElement || leaf instanceof HTMLTextAreaElement ? leaf.value : null,
      fitSize: leaf.style.getPropertyValue("--tb-auto-fit-font-size"),
      fitAttribute: leaf.getAttribute("data-tb-auto-fit"),
      fitBase: leaf.dataset.tbAutoFitBaseFontSize
    };
    if (leaf instanceof HTMLInputElement || leaf instanceof HTMLTextAreaElement) leaf.value = nextContent;
    else leaf.textContent = nextContent;
  }, {
    extremes,
    mode,
    frameOnly: selector === ".trend-content.open",
    surfaceExtremes: surfaceContentExtremes[pageKey]?.[selector] || null
  });
  await page.waitForTimeout(80);
  const metrics = await locator.evaluate(target => {
    const restore = globalThis.__layoutPhaseTwoTextRestore;
    const leaf = restore?.leaf || target;
    const frameOnly = Boolean(restore?.frameOnly);
    const targetRect = target.getBoundingClientRect();
    const leafRect = leaf.getBoundingClientRect();
    const computed = getComputedStyle(target);
    const leafComputed = getComputedStyle(leaf);
    const formControl = leaf instanceof HTMLInputElement || leaf instanceof HTMLTextAreaElement || leaf instanceof HTMLSelectElement;
    const leafIsRendered = leafRect.width > 2 && leafRect.height > 2;
    const clipsLeafX = ["hidden", "clip", "scroll", "auto"].includes(leafComputed.overflowX);
    const clipsLeafY = ["hidden", "clip", "scroll", "auto"].includes(leafComputed.overflowY);
    const ancestors = [];
    let ancestor = target.parentElement;
    while (ancestor instanceof HTMLElement && ancestors.length < 8) {
      const ancestorRect = ancestor.getBoundingClientRect();
      const ancestorStyle = getComputedStyle(ancestor);
      ancestors.push({
        tag: ancestor.tagName,
        id: ancestor.id,
        className: ancestor.className,
        rect: ancestorRect.toJSON(),
        display: ancestorStyle.display,
        gridRows: ancestorStyle.gridTemplateRows,
        padding: ancestorStyle.padding,
        overflow: ancestorStyle.overflow
      });
      ancestor = ancestor.parentElement;
    }
    return {
      target: targetRect.toJSON(),
      leaf: leafRect.toJSON(),
      textOverflowX: !frameOnly && !formControl && clipsLeafX && leaf.scrollWidth > leaf.clientWidth + 2,
      textOverflowY: !frameOnly && !formControl && clipsLeafY && leaf.scrollHeight > leaf.clientHeight + 2,
      leafScrollWidth: leaf.scrollWidth,
      leafClientWidth: leaf.clientWidth,
      leafScrollHeight: leaf.scrollHeight,
      leafClientHeight: leaf.clientHeight,
      outsideTarget: !frameOnly && leafIsRendered && (leafRect.left < targetRect.left - 1 || leafRect.right > targetRect.right + 1 || leafRect.top < targetRect.top - 1 || leafRect.bottom > targetRect.bottom + 1),
      clip: computed.clipPath,
      borderWidth: computed.borderTopWidth,
      background: computed.backgroundImage || computed.backgroundColor,
      fontSize: leafComputed.fontSize,
      fitted: leaf.getAttribute("data-tb-auto-fit") === "1",
      leafTag: leaf.tagName,
      leafClass: leaf.className,
      originalText: String(restore?.text || "").replace(/\s+/g, " ").trim(),
      ancestors
    };
  });
  assert.equal(metrics.textOverflowX, false, `${style}/${pageKey}/${selector}/${mode} text overflow X: ${JSON.stringify(metrics)}`);
  assert.equal(metrics.textOverflowY, false, `${style}/${pageKey}/${selector}/${mode} text overflow Y: ${JSON.stringify(metrics)}`);
  assert.equal(metrics.outsideTarget, false, `${style}/${pageKey}/${selector}/${mode} content outside frame: ${JSON.stringify(metrics)}`);
  assert.notEqual(metrics.borderWidth, "0px", `${style}/${pageKey}/${selector}/${mode} missing frame treatment`);
  let image;
  try {
    image = await locator.screenshot({ type: "jpeg", quality: 58 });
  } catch (error) {
    throw new Error(`${style}/${pageKey}/${selector}/${mode} screenshot failed: ${error.message}`);
  }
  return { label: `${pageKey} · ${selector} · ${mode}`, image: image.toString("base64"), metrics };
}

async function captureSurfaceExtreme(page, pageKey, selector, mode, style, { retries = 2 } = {}) {
  let lastError = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    let shouldRetry = false;
    try {
      return await captureSurfaceExtremeAttempt(page, pageKey, selector, mode, style);
    } catch (error) {
      lastError = error;
      if (!isTransientSurfaceRenderError(error) || attempt === retries) throw error;
      shouldRetry = true;
    } finally {
      // The capture mutates one leaf to exercise text fit. This finally block
      // runs after every screenshot/evaluate error as well as successful
      // captures, so the next surface always starts from the real UI state.
      await restoreSurfaceText(page).catch(() => {});
      await restoreSurfaceVisibility(page).catch(() => {});
    }
    if (shouldRetry) await page.waitForTimeout(60 * (attempt + 1));
  }
  throw lastError;
}

async function captureSurfaceSet(page, pageKey, selectors, style, tiles) {
  for (const selector of selectors) {
    for (const mode of ["short", "long"]) {
      try {
        tiles.push(await captureSurfaceExtreme(page, pageKey, selector, mode, style));
      } catch (error) {
        throw new Error(`${style}/${pageKey}/${selector}/${mode}: ${error.message}`);
      }
    }
  }
}

async function getLayoutStyleSignatures(page, selectors) {
  return page.evaluate(selectorList => selectorList.map(selector => {
    const element = document.querySelector(selector);
    if (!(element instanceof HTMLElement)) return { selector, missing: true };
    const computed = getComputedStyle(element);
    return {
      selector,
      clipPath: computed.clipPath,
      borderTop: `${computed.borderTopWidth}|${computed.borderTopStyle}|${computed.borderTopColor}`,
      borderLeft: `${computed.borderLeftWidth}|${computed.borderLeftStyle}|${computed.borderLeftColor}`,
      background: `${computed.backgroundImage}|${computed.backgroundColor}`,
      boxShadow: computed.boxShadow,
      padding: computed.padding
    };
  }), selectors);
}

async function assertLayoutStyleExclusions(page, selectors, style) {
  if (!selectors.length) return;
  const missing = await page.evaluate(selectorList => selectorList.filter(selector => !document.querySelector(selector)), selectors);
  assert.deepEqual(missing, [], `${style} missing exclusion fixtures: ${missing.join(", ")}`);
  await page.evaluate(() => { delete document.body.dataset.layoutStyle; });
  await page.waitForTimeout(80);
  const nativeSignatures = await getLayoutStyleSignatures(page, selectors);
  await page.evaluate(nextStyle => { document.body.dataset.layoutStyle = nextStyle; }, style);
  await page.waitForTimeout(80);
  const styledSignatures = await getLayoutStyleSignatures(page, selectors);
  assert.deepEqual(styledSignatures, nativeSignatures, `${style} changed an explicitly excluded inner surface`);
}

async function assertTagSemanticColors(page, selectors, style, { allowEmpty = false } = {}) {
  const existing = await page.evaluate(selectorList => selectorList.filter(selector => document.querySelector(selector)), selectors);
  if (allowEmpty && existing.length === 0) return;
  assert.ok(existing.length > 0, `${style} did not render any expected semantic tags`);
  await page.evaluate(() => { delete document.body.dataset.layoutStyle; });
  await page.waitForTimeout(50);
  const nativeColors = await page.evaluate(selectorList => selectorList.map(selector => ({
    selector,
    colors: [...document.querySelectorAll(selector)].slice(0, 6).map(element => getComputedStyle(element).color)
  })), existing);
  await page.evaluate(nextStyle => { document.body.dataset.layoutStyle = nextStyle; }, style);
  await page.waitForTimeout(50);
  const styledColors = await page.evaluate(selectorList => selectorList.map(selector => ({
    selector,
    colors: [...document.querySelectorAll(selector)].slice(0, 6).map(element => getComputedStyle(element).color)
  })), existing);
  if (allowEmpty && styledColors.some(entry => entry.colors.length === 0)) return;
  assert.deepEqual(styledColors, nativeColors, `${style} replaced semantic tag colors`);
}

async function ensureLayoutTagFixtures(page, pageKey) {
  await page.evaluate(key => {
    const definitions = {
      home: [
        { selector: ".weekly-focus-confidence", className: "weekly-focus-confidence confidence-high", text: "Strong proof" }
      ],
      stats: [
        { selector: ".stats-trend-tone", className: "stats-trend-tone", text: "Watch", parentClass: "stats-trend-card stats-trend-warn" }
      ],
      insights: [
        { selector: ".insight-tag", className: "insight-tag", text: "GOOD", parentClass: "insight-card insight-good" },
        { selector: ".insight-meta-pill", className: "insight-meta-pill tone-warn", text: "Strong proof" },
        { selector: ".insight-source", className: "insight-source", text: "Henrik Round History" },
        { selector: ".trend-signal-tone", className: "trend-signal-tone", text: "Watch", parentClass: "trend-signal-card tone-warn" }
      ]
    };
    const missing = (definitions[key] || []).filter(definition => ![...document.querySelectorAll(definition.selector)].some(element => {
      const rect = element.getBoundingClientRect();
      const computed = getComputedStyle(element);
      return rect.width > 2 && rect.height > 2 && computed.display !== "none" && computed.visibility !== "hidden" && Number.parseFloat(computed.opacity || "1") > 0;
    }));
    if (!missing.length) return;
    const pageElement = document.getElementById(`page-${key}`);
    if (!pageElement) return;
    let host = pageElement.querySelector(`[data-layout-tag-fixtures="${key}"]`);
    if (!host) {
      host = document.createElement("div");
      host.dataset.layoutTagFixtures = key;
      host.style.cssText = "position:fixed;left:24px;top:110px;z-index:9998;display:flex;align-items:center;gap:10px;padding:8px;background:var(--card);";
      pageElement.appendChild(host);
    }
    missing.forEach(definition => {
      const tag = document.createElement("span");
      tag.className = definition.className;
      tag.textContent = definition.text;
      if (definition.parentClass) {
        const parent = document.createElement("div");
        parent.className = definition.parentClass;
        parent.appendChild(tag);
        host.appendChild(parent);
      } else {
        host.appendChild(tag);
      }
    });
  }, pageKey);
}

async function assertStatsTrendTextVisible(page, style) {
  const cards = await page.locator("#page-stats .stats-trend-card").evaluateAll(elements => elements.map(card => {
    const cardRect = card.getBoundingClientRect();
    const measure = selector => {
      const element = card.querySelector(selector);
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      const computed = getComputedStyle(element);
      return {
        selector,
        text: String(element.textContent || "").replace(/\s+/g, " ").trim(),
        rect: rect.toJSON(),
        lineHeight: Number.parseFloat(computed.lineHeight || "0"),
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight
      };
    };
    return {
      card: cardRect.toJSON(),
      parts: [
        measure(".stats-trend-head"),
        measure(".stats-main-text"),
        measure(".stats-sub-text"),
        measure(".stats-trend-detail")
      ].filter(Boolean)
    };
  }));
  assert.ok(cards.length >= 6, `${style} did not render the complete Stats trend grid`);
  cards.forEach((entry, cardIndex) => {
    entry.parts.forEach(part => {
      const minimumVisibleHeight = Math.max(8, Math.min(12, (part.lineHeight || 10) * 0.78));
      assert.ok(part.rect.height >= minimumVisibleHeight, `${style} Stats trend ${cardIndex + 1} collapsed ${part.selector}: ${JSON.stringify(entry)}`);
      assert.ok(part.rect.top >= entry.card.top - 1 && part.rect.bottom <= entry.card.bottom + 1, `${style} Stats trend ${cardIndex + 1} clipped ${part.selector}: ${JSON.stringify(entry)}`);
    });
  });
}

async function assertHomeLoadoutAndCompassGeometry(page, style) {
  await page.locator("#agentFrame").evaluate(frame => {
    const reveal = frame.querySelector(".agent-reveal-art");
    if (!reveal) return;
    frame.dataset.agent = "jett";
    frame.classList.add("agent-selected", "duelist");
    [frame, reveal].forEach(element => {
      element.style.setProperty("--agent-art-x", "13px");
      element.style.setProperty("--agent-art-y", "16px");
      element.style.setProperty("--agent-art-scale", ".91");
    });
    if (!reveal.querySelector("img")) {
      reveal.innerHTML = '<img alt="Jett selected art" src="/assets/library/agents/jett/portrait.png">';
    }
  });
  await page.waitForFunction(() => {
    const image = document.querySelector("#agentFrame .agent-reveal-art img");
    return Boolean(image?.complete && image.naturalWidth > 0);
  }, null, { timeout: 10000 });
  const geometry = await page.locator("#page-home").evaluate(home => {
    const rect = element => element?.getBoundingClientRect().toJSON() || null;
    const loadout = home.querySelector(".loadout-card");
    const frame = home.querySelector("#agentFrame");
    const frameCell = frame?.parentElement;
    const selectedArtClip = frame?.querySelector(".agent-reveal-art");
    const selectedArt = frame?.querySelector(".agent-reveal-art img");
    const scoreboard = home.querySelector(".rr-card .scoreboard");
    const impact = home.querySelector(".rr-card .impact-card");
    const impactPill = home.querySelector(".rr-card #impactRolePill");
    const impactBar = home.querySelector(".rr-card .impact-bar-outer");
    const impactMeter = home.querySelector(".rr-card .impact-meter");
    const impactFill = home.querySelector(".rr-card #impactBarFill");
    const impactCaption = home.querySelector(".rr-card .impact-meter-caption");
    const impactStyle = impact ? getComputedStyle(impact) : null;
    const impactBarStyle = impactBar ? getComputedStyle(impactBar) : null;
    const impactTrackStyle = impactBar ? getComputedStyle(impactBar, "::after") : null;
    const paddingLeft = Number.parseFloat(impactStyle?.paddingLeft || "0") || 0;
    const paddingRight = Number.parseFloat(impactStyle?.paddingRight || "0") || 0;
    const trackLeft = Number.parseFloat(impactTrackStyle?.left || "0") || 0;
    const trackRight = Number.parseFloat(impactTrackStyle?.right || "0") || 0;
    const compass = home.querySelector(".compass-panel");
    const compassParts = [
      ".compass-main",
      ".compass-summary-shell",
      ".compass-summary-body",
      ".compass-cards-grid",
      ".compass-svg-wrap",
      "#compassSvg"
    ].map(selector => ({ selector, rect: rect(compass?.querySelector(selector)) })).filter(entry => entry.rect);
    return {
      loadout: rect(loadout),
      frame: rect(frame),
      frameCell: rect(frameCell),
      selectedArtClip: rect(selectedArtClip),
      selectedArt: rect(selectedArt),
      selectedArtStyle: selectedArt ? {
        transform: getComputedStyle(selectedArt).transform,
        x: getComputedStyle(selectedArt).getPropertyValue("--agent-art-x").trim(),
        y: getComputedStyle(selectedArt).getPropertyValue("--agent-art-y").trim(),
        scale: getComputedStyle(selectedArt).getPropertyValue("--agent-art-scale").trim(),
        clipOverflow: getComputedStyle(selectedArtClip).overflow
      } : null,
      scoreboard: rect(scoreboard),
      impact: rect(impact),
      impactPill: rect(impactPill),
      impactBar: rect(impactBar),
      impactMeter: rect(impactMeter),
      impactFill: rect(impactFill),
      impactCaption: rect(impactCaption),
      impactContentWidth: Math.max(0, (impact?.clientWidth || 0) - paddingLeft - paddingRight),
      impactTrackWidth: Math.max(0, (impactBar?.clientWidth || 0) - trackLeft - trackRight),
      impactBarTransform: impactBarStyle?.transform || "",
      mobile: window.matchMedia("(max-width: 820px)").matches,
      compass: rect(compass),
      compassParts,
      compassOverflow: compass ? {
        horizontal: compass.scrollWidth > compass.clientWidth + 1,
        vertical: compass.scrollHeight > compass.clientHeight + 1
      } : null
    };
  });
  const contains = (outer, inner) => outer && inner
    && inner.left >= outer.left - 1
    && inner.right <= outer.right + 1
    && inner.top >= outer.top - 1
    && inner.bottom <= outer.bottom + 1;
  assert.ok(contains(geometry.loadout, geometry.frame), `${style} agent frame escaped its shaped loadout card: ${JSON.stringify(geometry)}`);
  assert.ok(contains(geometry.frameCell, geometry.frame), `${style} agent frame exceeded its grid cell: ${JSON.stringify(geometry)}`);
  assert.ok(contains(geometry.frame, geometry.selectedArtClip), `${style} selected-art clip escaped its frame: ${JSON.stringify(geometry)}`);
  assert.equal(geometry.selectedArtStyle?.clipOverflow, "hidden", `${style} selected-art clip no longer contains authored crop offsets: ${JSON.stringify(geometry)}`);
  assert.ok(geometry.selectedArt?.width > 0 && geometry.selectedArt?.height > 0, `${style} selected Jett art did not render: ${JSON.stringify(geometry)}`);
  assert.equal(geometry.selectedArtStyle?.x, "13px", `${style} selected Jett X crop offset was lost: ${JSON.stringify(geometry)}`);
  assert.equal(geometry.selectedArtStyle?.y, "16px", `${style} selected Jett Y crop offset was lost: ${JSON.stringify(geometry)}`);
  assert.equal(geometry.selectedArtStyle?.scale, ".91", `${style} selected Jett scale crop was lost: ${JSON.stringify(geometry)}`);
  assert.notEqual(geometry.selectedArtStyle?.transform, "none", `${style} selected Jett transform was removed: ${JSON.stringify(geometry)}`);
  assert.ok(
    Math.abs((geometry.selectedArt.left + geometry.selectedArt.right - geometry.frame.left - geometry.frame.right) / 2) <= Math.max(24, geometry.frame.width * .2)
      && Math.abs((geometry.selectedArt.top + geometry.selectedArt.bottom - geometry.frame.top - geometry.frame.bottom) / 2) <= Math.max(24, geometry.frame.height * .2),
    `${style} selected Jett art is not centred around its authored crop offset: ${JSON.stringify(geometry)}`
  );
  assert.ok(contains(geometry.impact, geometry.impactPill), `${style} role-impact pill escaped its card: ${JSON.stringify(geometry)}`);
  assert.ok(contains(geometry.impact, geometry.impactBar), `${style} role-impact bar escaped its card: ${JSON.stringify(geometry)}`);
  assert.ok(contains(geometry.impactBar, geometry.impactMeter), `${style} role-impact meter escaped its bar: ${JSON.stringify(geometry)}`);
  assert.ok(contains(geometry.impactBar, geometry.impactFill), `${style} role-impact fill escaped its bar: ${JSON.stringify(geometry)}`);
  assert.ok(contains(geometry.impact, geometry.impactCaption), `${style} role-impact caption escaped its card: ${JSON.stringify(geometry)}`);
  assert.equal(geometry.impactBarTransform, "none", `${style} role-impact bar was visually scaled after grid layout: ${JSON.stringify(geometry)}`);
  if (!geometry.mobile) {
    assert.ok(
      Math.abs(geometry.scoreboard.height - geometry.impact.height) <= 2,
      `${style} role-impact card no longer matches the scoreboard height: ${JSON.stringify(geometry)}`
    );
    assert.ok(
      geometry.impactBar.height >= geometry.impact.height * .6,
      `${style} role-impact bar does not use the card's available height: ${JSON.stringify(geometry)}`
    );
    assert.ok(
      geometry.impactPill.width >= geometry.impactContentWidth - 1
        && geometry.impactBar.width >= geometry.impactContentWidth - 1
        && geometry.impactCaption.width >= geometry.impactContentWidth - 1,
      `${style} role-impact content does not stretch across the card's usable width: ${JSON.stringify(geometry)}`
    );
    assert.ok(
      geometry.impactTrackWidth >= Math.max(24, Math.min(52, geometry.impactBar.width * .4)),
      `${style} role-impact outlined meter remains too narrow for its bar: ${JSON.stringify(geometry)}`
    );
  }
  assert.ok(geometry.compassParts.length >= 6, `${style} did not render the compass geometry: ${JSON.stringify(geometry)}`);
  geometry.compassParts.forEach(part => {
    assert.ok(contains(geometry.compass, part.rect), `${style} compass ${part.selector} escaped its shaped card: ${JSON.stringify(geometry)}`);
  });
  assert.equal(geometry.compassOverflow?.horizontal, false, `${style} compass has horizontal overflow: ${JSON.stringify(geometry)}`);
  assert.equal(geometry.compassOverflow?.vertical, false, `${style} compass has vertical overflow: ${JSON.stringify(geometry)}`);
}

async function assertHomeChartFlow(page, label, { requireReachableDesktop = false } = {}) {
  const geometry = await page.locator("#page-home").evaluate((home, requireReachable) => {
    const rect = element => element?.getBoundingClientRect().toJSON() || null;
    const layout = home.querySelector(".home-layout");
    const chart = home.querySelector(".rr-chart-card");
    const chartLayout = chart?.querySelector(".rr-chart-layout");
    const chartWrap = chart?.querySelector(".home-chart-wrap");
    const chartRow = chart?.querySelector("#chartRow");
    const beforeScrollTop = home.scrollTop;
    const before = {
      home: rect(home),
      layout: rect(layout),
      chart: rect(chart),
      chartLayout: rect(chartLayout),
      chartWrap: rect(chartWrap),
      chartRow: rect(chartRow),
      scrollHeight: home.scrollHeight,
      clientHeight: home.clientHeight,
      overflowY: getComputedStyle(home).overflowY
    };
    let atChart = null;
    if (requireReachable && home.scrollHeight > home.clientHeight + 1) {
      const chartTopInScrollSpace = chart.getBoundingClientRect().top - home.getBoundingClientRect().top + home.scrollTop;
      const maxScrollTop = home.scrollHeight - home.clientHeight;
      home.scrollTop = Math.min(maxScrollTop, Math.max(0, chartTopInScrollSpace - 8));
      atChart = { chart: rect(chart), home: rect(home), scrollTop: home.scrollTop };
    }
    home.scrollTop = beforeScrollTop;
    return { before, atChart };
  }, requireReachableDesktop);
  const contains = (outer, inner) => outer && inner
    && inner.left >= outer.left - 1
    && inner.right <= outer.right + 1
    && inner.top >= outer.top - 1
    && inner.bottom <= outer.bottom + 1;
  const containsVertically = (outer, inner) => outer && inner
    && inner.top >= outer.top - 1
    && inner.bottom <= outer.bottom + 1;
  assert.ok(contains(geometry.before.layout, geometry.before.chart), `${label} chart card escaped the Home grid: ${JSON.stringify(geometry)}`);
  assert.ok(contains(geometry.before.chart, geometry.before.chartLayout), `${label} chart layout escaped the chart card: ${JSON.stringify(geometry)}`);
  // Mobile deliberately lets the graph bleed horizontally through some shaped
  // card edges while its controls remain inset in .rr-chart-layout. Its
  // vertical bounds must still remain inside the card.
  assert.ok(containsVertically(geometry.before.chart, geometry.before.chartWrap), `${label} chart canvas wrapper escaped the chart card vertically: ${JSON.stringify(geometry)}`);
  assert.ok(containsVertically(geometry.before.chart, geometry.before.chartRow), `${label} chart SVG row escaped the chart card vertically: ${JSON.stringify(geometry)}`);
  if (geometry.atChart) {
    assert.ok(contains(geometry.atChart.home, geometry.atChart.chart), `${label} chart card cannot be reached by the Home page scroll: ${JSON.stringify(geometry)}`);
  }
}

async function writeCoverageContactSheet(browser, style, tiles) {
  const review = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  await review.setContent(`<!doctype html><meta charset="utf-8"><style>
    body{margin:0;padding:20px;background:#060b14;color:#eef5ff;font:13px/1.35 system-ui,sans-serif}
    h1{margin:0 0 16px;font:800 24px/1 system-ui,sans-serif;text-transform:uppercase}
    main{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:start}
    article{display:grid;gap:7px;min-width:0;padding:9px;border:1px solid #334155;border-radius:8px;background:#0f172a}
    strong{min-height:34px;overflow-wrap:anywhere;color:#cbd5e1;font-size:11px}
    img{display:block;width:100%;height:210px;object-fit:contain;object-position:top center;background:#020617}
  </style><h1>${escapeMarkup(style)} · Phase 2 short/long surface review</h1><main>${tiles.map(tile => `<article><strong>${escapeMarkup(tile.label)}</strong><img src="data:image/jpeg;base64,${tile.image}" alt=""></article>`).join("")}</main>`);
  await review.screenshot({ path: path.join(__dirname, "tmp", `layout-style-phase2-${style}.png`), fullPage: true });
  await review.close();
}

async function runPhaseTwoCoverage(page, browser) {
  const themeColorSignatures = [];
  for (const style of layoutStyles) {
    const tiles = [];
    await setCoverageLayoutStyle(page, style);
    await setCoverageTheme(page, "default");
    await activateCoveragePage(page, "home");
    await ensureLayoutTagFixtures(page, "home");
    const defaultSignature = await page.evaluate(() => [".weekly-focus-card", ".weekly-focus-confidence"].map(selector => {
      const computed = getComputedStyle(document.querySelector(selector));
      return `${computed.backgroundImage}|${computed.backgroundColor}|${computed.borderTopColor}`;
    }).join("||"));
    await setCoverageTheme(page, "omen");
    const omenSignature = await page.evaluate(() => [".weekly-focus-card", ".weekly-focus-confidence"].map(selector => {
      const computed = getComputedStyle(document.querySelector(selector));
      return `${computed.backgroundImage}|${computed.backgroundColor}|${computed.borderTopColor}`;
    }).join("||"));
    assert.notEqual(omenSignature, defaultSignature, `${style} did not follow the active theme variables`);
    themeColorSignatures.push({ style, defaultSignature, omenSignature });
    await setCoverageTheme(page, "default");

    await assertTagSemanticColors(page, [".weekly-focus-confidence"], style);
    await captureSurfaceSet(page, "home", phaseTwoSurfaces.home, style, tiles);
    await activateCoveragePage(page, "stats");
    await ensureLayoutTagFixtures(page, "stats");
    await assertLayoutStyleExclusions(page, [
      "#statsPerformanceChart",
      "#statsPerformanceChart .stats-trend-card",
      "#statsBreakdown",
      "#statsBreakdown .stats-breakdown-cardlet"
    ], style);
    await assertTagSemanticColors(page, [".stats-trend-tone"], style);
    await assertStatsTrendTextVisible(page, style);
    await captureSurfaceSet(page, "stats", phaseTwoSurfaces.stats, style, tiles);
    await activateCoveragePage(page, "insights");
    await ensureLayoutTagFixtures(page, "insights");
    if (!await page.locator(".insight-source").count()) {
      await page.locator(".insight-card").first().click();
      await page.waitForTimeout(100);
    }
    if (!await page.locator(".trend-content.open").count()) {
      await page.locator(".insight-trend-row").first().click();
      await page.locator(".trend-content.open").first().waitFor({ state: "attached", timeout: 5000 });
    }
    await assertLayoutStyleExclusions(page, [
      ".insight-focus-detail",
      "#insightsList",
      ".insight-trend-row",
      ".trend-signal-card"
    ], style);
    await assertTagSemanticColors(page, [".insight-tag", ".insight-meta-pill", ".insight-source", ".trend-signal-tone"], style);
    await captureSurfaceSet(page, "insights", phaseTwoSurfaces.insights, style, tiles);
    await activateCoveragePage(page, "logging");
    await ensureLoggingFormSurface(page);
    await captureSurfaceSet(page, "logging", phaseTwoSurfaces.logging, style, tiles);
    await activateCoveragePage(page, "library");
    await page.evaluate(() => globalThis.RankedCoachGamesenseLibrary.reset());
    await page.waitForTimeout(50);
    for (const state of phaseTwoLibraryStates) {
      if (state.open) {
        await page.evaluate(args => globalThis.RankedCoachGamesenseLibrary.open(...args), state.open);
        await page.locator(state.selectors[0]).first().waitFor({ state: "attached", timeout: 10000 });
        await page.waitForTimeout(80);
      }
      if (state.weapon) {
        await page.locator(`[data-gamesense-weapon="${state.weapon}"]`).click();
        await page.locator(".gamesense-collection-card").first().waitFor({ state: "visible", timeout: 10000 });
      }
      if (state.plants) {
        await page.locator('[data-gamesense-map-view="plants"]').click();
        await page.locator(".gamesense-plant-preview-toggle").first().waitFor({ state: "visible", timeout: 10000 });
      }
      if (state.skinPreview) {
        const preview = page.locator('[data-gamesense-collection-preview][data-preview-name="Aemondir"]').first();
        await preview.waitFor({ state: "visible", timeout: 10000 });
        await preview.click();
        await page.locator(".gamesense-skin-preview-card").waitFor({ state: "visible", timeout: 10000 });
      }
      if (state.excluded) await assertLayoutStyleExclusions(page, state.excluded, style);
      if (await page.locator(".gamesense-patch").count()) {
        await assertTagSemanticColors(page, [".gamesense-patch"], style, { allowEmpty: true });
      }
      await captureSurfaceSet(page, "library", state.selectors, style, tiles);
      if (state.skinPreview) {
        await page.keyboard.press("Escape");
        await page.locator(".gamesense-skin-preview-overlay").waitFor({ state: "detached", timeout: 5000 });
      }
    }
    await writeCoverageContactSheet(browser, style, tiles);
  }
  assert.equal(themeColorSignatures.length, layoutStyles.length);
  await page.evaluate(() => {
    document.body.dataset.layoutStyle = "honeycomb";
  });
  await setCoverageTheme(page, "default");
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const errors = [];
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("console", message => {
      if (message.type() !== "error") return;
      const location = message.location();
      errors.push(`console: ${message.text()}${location?.url ? ` @ ${location.url}` : ""}`);
    });
    page.on("pageerror", error => errors.push(`page: ${error.message}`));
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
    const layoutPuuid = "layout-style-test-puuid";
    await page.route("**/api/henrik/health", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, configured: true }) }));
    await page.route("**/api/henrik/account", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: { puuid: layoutPuuid, name: "LayoutOne", tag: "NA1" } }) }));
    await page.route("**/api/henrik/mmr-history-live", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [{ account: { puuid: layoutPuuid }, history: [] }] }) }));
    await page.route("**/api/henrik/mmr-history", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) }));
    await page.route("**/api/henrik/matches", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, data: [] }) }));
    await page.route("https://fonts.googleapis.com/**", route => route.fulfill({ contentType: "text/css", body: "" }));
    await page.route("https://fonts.gstatic.com/**", route => route.abort());
    await page.route("https://valorant-api.com/v1/weapons/**", route => route.fulfill({ contentType: "application/json", body: weaponSkinApiStub() }));
    await page.route("https://media.valorant-api.com/contenttiers/**", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="#fff" d="M12 1 23 12 12 23 1 12z"/></svg>' }));
    await page.route("https://media.valorant-api.com/videos/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await page.route("https://valorant.dyn.riotcdn.net/**", route => route.fulfill({ contentType: "video/mp4", body: "" }));
    await page.route("https://sketchfab.com/models/**/embed**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Interactive 3D model</title>" }));
    await page.route("https://www.youtube-nocookie.com/embed/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Bundle showcase</title>" }));
    await page.addInitScript(() => {
      if (sessionStorage.getItem("layout-test-seeded") === "true") return;
      const createdAt = new Date().toISOString();
      const match = {
        id: "layout-pending-match",
        matchId: "layout-pending-match",
        source: "henrik",
        createdAt,
        agent: "Sova",
        role: "Initiator",
        map: "Ascent",
        result: "win",
        metadata: { matchId: "layout-pending-match", agent: "Sova", map: "Ascent", result: "win" }
      };
      const pendingReflection = {
        id: "ranked-match-log:layout-one:layout-pending-match",
        matchId: "layout-pending-match",
        profileId: "layout-one",
        source: "henrik-match-placeholder",
        isMatchPlaceholder: true,
        isPlayerAuthored: false,
        createdAt,
        agent: "Sova",
        role: "Initiator",
        map: "Ascent",
        focus: "",
        result: "win",
        notes: ""
      };
      const profiles = [
        { id: "layout-one", name: "Layout One", accountName: "Guest", riotId: "", region: "NA", matches: [match], themeKey: "default", bannerStyle: "rc-redline", lastWarmupPromptDate: new Date().toISOString().slice(0, 10) },
        { id: "layout-two", name: "Layout Two", accountName: "Guest", riotId: "", region: "NA", matches: [], themeKey: "default", lastWarmupPromptDate: new Date().toISOString().slice(0, 10) }
      ];
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", "layout-one");
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify(profiles));
      localStorage.setItem("valtracker_log_entries_v2:guest", JSON.stringify([pendingReflection]));
      localStorage.setItem("valtracker_log_entries_v1", JSON.stringify([pendingReflection]));
      localStorage.setItem("valtracker_logs_v1", JSON.stringify([pendingReflection]));
      sessionStorage.setItem("layout-test-seeded", "true");
    });
    await page.addInitScript(() => {
      const profileId = new URLSearchParams(location.search).get("profile");
      if (profileId) localStorage.setItem("valtracker_active_profile_id", profileId);
    });
    await boot(page);
    // This suite audits layout surfaces. Its guest fixture deliberately has no
    // authenticated Supabase session, so keep an unrelated auth prompt from
    // intercepting the settings control being exercised below.
    await page.evaluate(() => {
      const authModal = document.getElementById("authModal");
      if (!authModal) return;
      authModal.classList.remove("active", "is-opening", "is-closing");
      authModal.hidden = true;
      authModal.setAttribute("aria-hidden", "true");
      authModal.style.setProperty("display", "none", "important");
      document.body.classList.remove("has-active-modal", "mobile-modal-open");
    });

    assert.equal(await page.locator("body").getAttribute("data-layout-shape"), null);
    assert.equal(await page.locator("body").getAttribute("data-layout-texture"), null);
    assert.equal(await page.locator("body").getAttribute("data-layout-font-active"), null);
    assert.equal(await page.locator(".app-header").getAttribute("data-profile-banner"), "rc-redline");
    const defaultFocus = await page.locator(".weekly-focus-card").evaluate(card => ({ clip: getComputedStyle(card).clipPath, font: getComputedStyle(card.querySelector(".card-title")).fontFamily }));
    const defaultCopyFont = await page.locator(".weekly-focus-card .card-sub").evaluate(copy => getComputedStyle(copy).fontFamily);
    const defaultTagPixels = await page.locator(".weekly-focus-confidence").first().screenshot();
    assert.equal(defaultFocus.clip, "none");

    await page.click("#profileDropdownToggle");
    await page.click("#pdOpenSettings");
    await page.waitForTimeout(450);
    const assertProfileTextCentered = async viewportLabel => {
      const profileState = await page.locator("#editProfileModal").evaluate(modal => ({
        alignment: [...modal.querySelectorAll(
          ".lens-modal-title,.profile-edit-tab,.profile-edit-panel-title,.profile-edit-panel-copy,.theme-card-name,.theme-card-copy"
        )].filter(element => element.getClientRects().length).map(element => ({
          text: element.textContent.trim().slice(0, 48),
          align: getComputedStyle(element).textAlign
        })),
        themeNames: [...modal.querySelectorAll(".theme-card-name")].filter(element => element.getClientRects().length).map(element => {
          const card = element.closest(".theme-card").getBoundingClientRect();
          const name = element.getBoundingClientRect();
          return { text: element.textContent.trim(), centerDelta: Math.abs((name.left + name.width / 2) - (card.left + card.width / 2)) };
        })
      }));
      const { alignment, themeNames } = profileState;
      assert.ok(alignment.length > 8, `${viewportLabel}: ${JSON.stringify(alignment)}`);
      assert.ok(alignment.every(item => item.align === "center"), `${viewportLabel}: ${JSON.stringify(alignment.filter(item => item.align !== "center"))}`);
      assert.ok(themeNames.length > 6 && themeNames.every(item => item.centerDelta <= 2), `${viewportLabel}: ${JSON.stringify(themeNames)}`);
    };
    await assertProfileTextCentered("desktop profile editor");
    await page.locator("#editProfileModal .profile-edit-shell").screenshot({ path: path.join(__dirname, "tmp", "profile-editor-centered-desktop.png") });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    await assertProfileTextCentered("mobile profile editor");
    await page.locator("#editProfileModal .profile-edit-shell").screenshot({ path: path.join(__dirname, "tmp", "profile-editor-centered-mobile.png") });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(250);
    await page.click('[data-profile-tab="layoutStyle"]');
    const assertPreviewCoverage = async (selector, viewportLabel) => {
      const coverage = await page.locator(selector).first().evaluate(card => {
        const outerCard = card.getBoundingClientRect();
        const preview = card.querySelector(".layout-style-preview").getBoundingClientRect();
        const previewCard = card.querySelector(".layout-style-preview-card").getBoundingClientRect();
        return { outerCard: outerCard.toJSON(), preview: preview.toJSON(), previewCard: previewCard.toJSON() };
      });
      assert.ok(Math.abs(coverage.outerCard.width - coverage.preview.width) <= 2, `${viewportLabel}: ${JSON.stringify(coverage)}`);
      assert.ok(Math.abs(coverage.preview.width - coverage.previewCard.width) <= 2, `${viewportLabel}: ${JSON.stringify(coverage)}`);
      assert.ok(Math.abs(coverage.preview.height - coverage.previewCard.height) <= 2, `${viewportLabel}: ${JSON.stringify(coverage)}`);
    };
    await assertPreviewCoverage("[data-layout-shape-card]", "desktop shape preview");
    await assertPreviewCoverage("[data-layout-texture-card]", "desktop texture preview");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    await assertPreviewCoverage("[data-layout-shape-card]", "mobile shape preview");
    await page.locator('[data-profile-panel="layoutStyle"]').screenshot({ path: path.join(__dirname, "tmp", "layout-style-gallery-mobile-shapes.png") });
    await page.click('[data-layout-style-mobile-tab="textures"]');
    await assertPreviewCoverage("[data-layout-texture-card]", "mobile texture preview");
    await page.locator('[data-profile-panel="layoutStyle"]').screenshot({ path: path.join(__dirname, "tmp", "layout-style-gallery-mobile-textures.png") });
    await page.click('[data-layout-style-mobile-tab="shapes"]');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(250);
    assert.equal(await page.locator("[data-layout-shape-card]").count(), allLayoutStyles.length + 1);
    assert.equal(await page.locator("[data-layout-texture-card]").count(), allLayoutTextures.length + 1);
    assert.equal(await page.locator('[data-layout-shape-card="scopevignette"]').count(), 0);
    await page.click('[data-layout-shape-card="default"]');
    await page.click('[data-layout-texture-card="default"]');
    assert.equal(await page.locator("body").getAttribute("data-layout-shape"), null);
    assert.equal(await page.locator("body").getAttribute("data-layout-texture"), null);
    await page.locator("#editProfileModal").evaluate(modal => { modal.style.visibility = "hidden"; });
    const defaultTagPixelsAfter = await page.locator(".weekly-focus-confidence").first().screenshot();
    await page.locator("#editProfileModal").evaluate(modal => { modal.style.visibility = ""; });
    assert.equal(defaultTagPixelsAfter.equals(defaultTagPixels), true, "Default Layout changed tag pixels");
    await page.setViewportSize({ width: 1365, height: 768 });
    await waitForViewportScale(page, 1365, 768);
    await page.waitForTimeout(80);
    await page.evaluate(() => document.querySelector("#page-insights .trend-content")?.classList.add("open"));
    const excludedBefore = await page.evaluate(() => ({
      navClip: getComputedStyle(document.querySelector(".app-header")).clipPath,
      navBackground: getComputedStyle(document.querySelector(".app-header")).backgroundImage,
      chartClip: getComputedStyle(document.querySelector(".chart-row")).clipPath,
      chartBackground: getComputedStyle(document.querySelector(".chart-row")).backgroundImage,
      impactCard: (() => {
        const style = getComputedStyle(document.querySelector(".rr-card .impact-card"));
        return {
          clip: style.clipPath,
          background: style.backgroundImage,
          border: style.border,
          borderRadius: style.borderRadius,
          boxShadow: style.boxShadow,
          padding: style.padding,
          font: style.fontFamily
        };
      })(),
      statsSummaryRight: (() => {
        const style = getComputedStyle(document.querySelector("#page-stats .stats-summary-right > .stats-proof-row"));
        return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
      })(),
      statsProof: (() => {
        const style = getComputedStyle(document.querySelector("#page-stats .stats-proof-card"));
        return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
      })(),
      statsRoleProgress: (() => {
        const style = getComputedStyle(document.querySelector("#page-stats .stats-role-progress-card"));
        return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
      })(),
      insightActionHero: (() => {
        const style = getComputedStyle(document.querySelector("#page-insights .insight-action-hero"));
        return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
      })(),
      insightsList: (() => {
        const style = getComputedStyle(document.querySelector("#insightsList"));
        return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
      })(),
      openTrendContent: (() => {
        const style = getComputedStyle(document.querySelector("#page-insights .trend-content.open"));
        return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
      })(),
      impactClip: getComputedStyle(document.querySelector(".impact-bar-outer")).clipPath,
      impactBackground: getComputedStyle(document.querySelector(".impact-bar-outer")).backgroundImage,
      radarClip: getComputedStyle(document.querySelector("#compassSvg")).clipPath,
      radarBackground: getComputedStyle(document.querySelector("#compassSvg")).backgroundImage,
      meterClip: getComputedStyle(document.querySelector(".compass-bar-track")).clipPath,
      meterBackground: getComputedStyle(document.querySelector(".compass-bar-track")).backgroundImage,
      compactControls: [
        ".role-filter-btn",
        "#spinAgentBtn.small-btn",
        "#compassDescriptionToggle.compass-description-toggle",
        ".graph-btn",
        "#timelineCycleBtn.timeline-cycle-btn"
      ].map(selector => {
        const control = document.querySelector(selector);
        const style = getComputedStyle(control);
        return { selector, clip: style.clipPath, padding: style.padding, borderLeftWidth: style.borderLeftWidth, background: style.backgroundImage };
      })
    }));
    await assertHomeLoadoutAndCompassGeometry(page, "default desktop");
    await assertHomeChartFlow(page, "default desktop", { requireReachableDesktop: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await waitForViewportScale(page, 390, 844);
    await page.waitForTimeout(80);
    await assertHomeLoadoutAndCompassGeometry(page, "default mobile");
    await assertHomeChartFlow(page, "default mobile");
    await page.setViewportSize({ width: 1365, height: 768 });
    await waitForViewportScale(page, 1365, 768);
    await page.waitForTimeout(80);
    for (const style of layoutStyles) {
      await page.click(`[data-layout-shape-card="${style}"]`);
      await page.waitForTimeout(80);
      assert.equal(await page.locator("body").getAttribute("data-layout-shape"), style);
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
        chartClip: getComputedStyle(document.querySelector(".chart-row")).clipPath,
        chartBackground: getComputedStyle(document.querySelector(".chart-row")).backgroundImage,
        impactCard: (() => {
          const style = getComputedStyle(document.querySelector(".rr-card .impact-card"));
          return {
            clip: style.clipPath,
            background: style.backgroundImage,
            border: style.border,
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow,
            padding: style.padding,
            font: style.fontFamily
          };
        })(),
        statsSummaryRight: (() => {
          const style = getComputedStyle(document.querySelector("#page-stats .stats-summary-right > .stats-proof-row"));
          return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
        })(),
        statsProof: (() => {
          const style = getComputedStyle(document.querySelector("#page-stats .stats-proof-card"));
          return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
        })(),
        statsRoleProgress: (() => {
          const style = getComputedStyle(document.querySelector("#page-stats .stats-role-progress-card"));
          return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
        })(),
        insightActionHero: (() => {
          const style = getComputedStyle(document.querySelector("#page-insights .insight-action-hero"));
          return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
        })(),
        insightsList: (() => {
          const style = getComputedStyle(document.querySelector("#insightsList"));
          return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
        })(),
        openTrendContent: (() => {
          const style = getComputedStyle(document.querySelector("#page-insights .trend-content.open"));
          return { clip: style.clipPath, background: style.backgroundImage, border: style.border, borderRadius: style.borderRadius, boxShadow: style.boxShadow, padding: style.padding, font: style.fontFamily };
        })(),
        impactClip: getComputedStyle(document.querySelector(".impact-bar-outer")).clipPath,
        impactBackground: getComputedStyle(document.querySelector(".impact-bar-outer")).backgroundImage,
        radarClip: getComputedStyle(document.querySelector("#compassSvg")).clipPath,
        radarBackground: getComputedStyle(document.querySelector("#compassSvg")).backgroundImage,
        meterClip: getComputedStyle(document.querySelector(".compass-bar-track")).clipPath,
        meterBackground: getComputedStyle(document.querySelector(".compass-bar-track")).backgroundImage,
        compactControls: [
          ".role-filter-btn",
          "#spinAgentBtn.small-btn",
          "#compassDescriptionToggle.compass-description-toggle",
          ".graph-btn",
          "#timelineCycleBtn.timeline-cycle-btn"
        ].map(selector => {
          const control = document.querySelector(selector);
          const style = getComputedStyle(control);
          return { selector, clip: style.clipPath, padding: style.padding, borderLeftWidth: style.borderLeftWidth, background: style.backgroundImage };
        })
      }));
      assert.deepEqual(excludedAfter, excludedBefore, `${style} changed an excluded surface`);
      await assertHomeLoadoutAndCompassGeometry(page, `${style} desktop`);
      await assertHomeChartFlow(page, `${style} desktop`, { requireReachableDesktop: true });
      await page.setViewportSize({ width: 390, height: 844 });
      await waitForViewportScale(page, 390, 844);
      await page.waitForTimeout(80);
      await assertHomeLoadoutAndCompassGeometry(page, `${style} mobile`);
      await assertHomeChartFlow(page, `${style} mobile`);
      await page.setViewportSize({ width: 1365, height: 768 });
      await waitForViewportScale(page, 1365, 768);
      await page.waitForTimeout(80);
    }
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(180);
    await page.click('[data-layout-shape-card="honeycomb"]');
    await page.click('[data-layout-texture-card="rustpatina"]');
    assert.equal(await page.locator("body").getAttribute("data-layout-shape"), "honeycomb");
    assert.equal(await page.locator("body").getAttribute("data-layout-texture"), "rustpatina");
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
    assert.equal(saved.layoutShape, "honeycomb");
    assert.equal(saved.layoutTexture, "rustpatina");
    assert.equal(saved.layoutStyle, "honeycomb");
    assert.equal(saved.layoutStyleCustomFont, false);
    assert.equal(saved.layoutFont, "ibmplexmono");

    await page.reload({ waitUntil: "domcontentloaded" });
    await dismissWarmup(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    assert.equal(await page.locator("body").getAttribute("data-layout-shape"), "honeycomb");
    assert.equal(await page.locator("body").getAttribute("data-layout-texture"), "rustpatina");
    assert.equal(await page.locator("body").getAttribute("data-layout-font"), "ibmplexmono");

    if (process.env.LAYOUT_STYLE_SKIP_PHASE_TWO !== "1") {
      await runPhaseTwoCoverage(page, browser);
    }

    await page.goto(`http://127.0.0.1:${port}/?profile=layout-two`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    assert.equal(await page.evaluate(() => localStorage.getItem("valtracker_active_profile_id")), "layout-two");
    assert.equal(await page.locator("body").getAttribute("data-layout-shape"), null);
    assert.equal(await page.locator("body").getAttribute("data-layout-texture"), null);
    assert.equal(await page.locator("body").getAttribute("data-layout-font-active"), null);
    await page.click("#profileDropdownToggle");
    await page.click("#pdOpenSettings");
    await page.click('[data-profile-tab="layoutStyle"]');
    await page.click('[data-layout-shape-card="diamondfacet"]');
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
    assert.equal(await page.locator("body").getAttribute("data-layout-shape"), "diamondfacet");
    await page.locator("#editProfileModal").evaluate(modal => modal.style.display = "none");

    await page.goto(`http://127.0.0.1:${port}/?profile=layout-one`, { waitUntil: "domcontentloaded" });
    await dismissWarmup(page);
    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
    assert.equal(await page.locator("body").getAttribute("data-layout-shape"), "honeycomb");
    assert.equal(await page.locator("body").getAttribute("data-layout-texture"), "rustpatina");
    assert.equal(await page.locator(".app-header").getAttribute("data-profile-banner"), "rc-redline");
    assert.deepEqual(errors, [], `missing local requests: ${JSON.stringify(missingRequests)}`);
    assert.deepEqual(missingRequests, []);
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
