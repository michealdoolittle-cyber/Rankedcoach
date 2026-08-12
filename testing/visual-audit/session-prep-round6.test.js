"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41826;
const outDir = path.resolve(__dirname, "test-results", "session-prep-round6");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".ico": "image/x-icon"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/") url = "/index.html";
      const file = path.join(root, url);
      if (!file.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `globalThis.supabase={createClient(){const q={select(){return this},eq(){return this},order(){return this},limit(){return this},maybeSingle:async()=>({data:null,error:null}),then(resolve){return Promise.resolve({data:[],error:null}).then(resolve)}};return{auth:{getSession:async()=>({data:{session:null}}),getUser:async()=>({data:{user:null}}),onAuthStateChange(callback){setTimeout(()=>callback("INITIAL_SESSION",null),0);return{data:{subscription:{unsubscribe(){}}}}}},from(){return Object.create(q)}}}};`;
}

function approx(actual, expected, tolerance, message) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message}: got ${actual}, expected ${expected}±${tolerance}`);
}

async function seedPage(page, themeKey) {
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
  await page.addInitScript(theme => {
    localStorage.clear();
    localStorage.setItem("rankedcoach_guest_choice_seen_v1", "1");
    localStorage.setItem("rankedcoach_daily_entrance_seen_v1", JSON.stringify({ date: "2099-01-01", seenPages: ["home", "logging", "stats", "insights", "library"] }));
    localStorage.setItem("rankedcoach_profile_theme_snapshot_v1", JSON.stringify({
      themeKey: theme,
      colors: { base: "#050814", base2: "#08111f", accent: "#22d3ee", accent2: "#a78bfa" }
    }));
    localStorage.setItem("rankedcoach_active_theme_v1", theme);
    localStorage.setItem("rankedcoach_layout_style_v1", theme === "honeycomb" ? "honeycomb" : "default");
  }, themeKey);
}

async function settleHome(page, variantName) {
  await page.goto(`http://127.0.0.1:${port}/index.html?sessionPrepRound6=${Date.now()}-${variantName}`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForSelector("#page-home", { timeout: 20000 });
  await page.evaluate(() => {
    document.documentElement.classList.remove("app-booting");
    document.querySelectorAll(".modal-overlay,.modal-backdrop,#guestChoiceModal,#dailyEntranceOverlay,#matchSummaryModal").forEach(element => {
      element.style.setProperty("display", "none", "important");
      element.classList.remove("show", "is-active", "active");
    });
    document.body.classList.remove("has-active-modal", "mobile-modal-open");
  });
  await page.waitForTimeout(1200);
}

async function forceSelectedJett(page) {
  await page.locator("#agentFrame").evaluate(frame => {
    const reveal = frame.querySelector(".agent-reveal-art");
    frame.dataset.agent = "jett";
    frame.classList.add("agent-selected", "duelist");
    [frame, reveal].forEach(element => {
      if (!element) return;
      element.style.setProperty("--agent-art-x", "13px");
      element.style.setProperty("--agent-art-y", "16px");
      element.style.setProperty("--agent-art-scale", ".91");
    });
    if (reveal && !reveal.querySelector("img")) {
      reveal.innerHTML = '<img alt="Jett selected art" src="/assets/library/agents/jett/portrait.png">';
    }
  });
  await page.waitForFunction(() => {
    const image = document.querySelector("#agentFrame .agent-reveal-art img");
    return Boolean(image?.complete && image.naturalWidth > 0);
  }, null, { timeout: 10000 });
}

async function inspectLoadout(page) {
  return page.locator(".loadout-card").evaluate(card => {
    const rect = element => element?.getBoundingClientRect().toJSON() || null;
    const main = card.querySelector(".home-loadout-main");
    const roles = card.querySelector(".role-filter-row");
    const spin = card.querySelector("#spinAgentBtn");
    const frame = card.querySelector("#agentFrame");
    const info = card.querySelector(".home-loadout-info");
    const image = frame?.querySelector(".agent-reveal-art img");
    const style = element => element ? getComputedStyle(element) : null;
    const rows = style(main)?.gridTemplateRows.split(" ").map(value => Number.parseFloat(value)) || [];
    const rowTotal = rows.reduce((sum, value) => sum + value, 0);
    return {
      card: rect(card),
      main: rect(main),
      roles: rect(roles),
      spin: rect(spin),
      frame: rect(frame),
      info: rect(info),
      areas: style(main)?.gridTemplateAreas || "",
      columns: style(main)?.gridTemplateColumns || "",
      rows: style(main)?.gridTemplateRows || "",
      columnGap: style(main)?.columnGap || "",
      rowGap: style(main)?.rowGap || "",
      rowPercent: rows.map(value => Number((value / rowTotal * 100).toFixed(2))),
      spinAspect: style(spin)?.aspectRatio || "",
      imageFit: style(image)?.objectFit || "",
      imageTransform: style(image)?.transform || "",
      frameBoxShadow: style(frame)?.boxShadow || "",
      frameFilter: style(frame)?.filter || "",
      selectedAgent: card.querySelector("#agentName")?.textContent?.trim() || ""
    };
  });
}

function validateLoadout(data, label) {
  assert.match(data.areas, /spin reel/, `${label} should use the round-6 spin-left / reel-right layout: ${JSON.stringify(data)}`);
  assert.equal(data.spinAspect, "auto", `${label} spin button must not force a square aspect ratio: ${JSON.stringify(data)}`);
  approx(data.spin.height, data.frame.height, 2, `${label} spin/frame height parity`);
  approx(data.spin.width, data.frame.width, Math.max(4, data.main.width * 0.04), `${label} spin/frame 50/50 width split`);
  assert.ok(data.spin.left < data.frame.left, `${label} spin button should be left of the agent frame: ${JSON.stringify(data)}`);
  const gap = data.frame.left - data.spin.right;
  assert.ok(gap >= 10 && gap <= 18, `${label} spin/frame gap should be about 14px, got ${gap}: ${JSON.stringify(data)}`);
  assert.equal(data.imageFit, "contain", `${label} selected agent image must be contained, not cropped: ${JSON.stringify(data)}`);
  assert.notEqual(data.imageTransform, "none", `${label} selected agent crop transform was lost: ${JSON.stringify(data)}`);
  assert.equal(data.frameBoxShadow, "none", `${label} agent frame glow must be removed: ${JSON.stringify(data)}`);
  assert.equal(data.frameFilter, "none", `${label} agent frame filter glow must be removed: ${JSON.stringify(data)}`);
  approx(data.rowPercent[0], 30.42, 1.2, `${label} roles row percentage`);
  approx(data.rowPercent[1], 40.04, 1.2, `${label} middle row percentage`);
  approx(data.rowPercent[2], 29.54, 1.2, `${label} info row percentage`);
}

async function runVariant(browser, variant) {
  const context = await browser.newContext({
    viewport: { width: variant.width, height: variant.height },
    deviceScaleFactor: variant.mobile ? 2 : 1,
    isMobile: variant.mobile,
    hasTouch: variant.mobile
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", error => consoleErrors.push(error.message));

  await seedPage(page, variant.theme);
  await settleHome(page, variant.name);
  await forceSelectedJett(page);
  const before = await inspectLoadout(page);
  validateLoadout(before, `${variant.name} before roll`);
  await page.locator(".loadout-card").screenshot({ path: path.join(outDir, `${variant.name}-before-roll.png`) });

  await page.locator("#spinAgentBtn").evaluate(button => button.click());
  await page.waitForFunction(() => document.querySelector("#agentReel")?.classList.contains("reel-spinning"), null, { timeout: 3000 }).catch(() => {});
  await page.waitForFunction(() => !document.querySelector("#agentReel")?.classList.contains("reel-spinning"), null, { timeout: 15000 });
  await page.waitForFunction(() => !document.querySelector(".premium-moment-overlay.is-active, .premium-moment-overlay.has-broadcast"), null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(300);

  const after = await inspectLoadout(page);
  validateLoadout(after, `${variant.name} after roll`);
  approx(after.card.width, before.card.width, 1.5, `${variant.name} card width should stay stable after roll`);
  approx(after.card.height, before.card.height, 1.5, `${variant.name} card height should stay stable after roll`);
  assert.ok(after.selectedAgent && after.selectedAgent !== "-", `${variant.name} real roll did not select an agent: ${JSON.stringify(after)}`);
  await page.locator(".loadout-card").screenshot({ path: path.join(outDir, `${variant.name}-after-roll.png`) });

  await context.close();
  return {
    variant: variant.name,
    before: { card: before.card, main: before.main, rows: before.rows, rowPercent: before.rowPercent, columns: before.columns, areas: before.areas, imageFit: before.imageFit, frameBoxShadow: before.frameBoxShadow },
    after: { card: after.card, main: after.main, rows: after.rows, rowPercent: after.rowPercent, columns: after.columns, areas: after.areas, imageFit: after.imageFit, frameBoxShadow: after.frameBoxShadow, selectedAgent: after.selectedAgent },
    consoleErrors
  };
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const variants = [
      { name: "desktop-default", width: 1440, height: 900, mobile: false, theme: "default" },
      { name: "desktop-honeycomb", width: 1440, height: 900, mobile: false, theme: "honeycomb" },
      { name: "mobile-default", width: 390, height: 844, mobile: true, theme: "default" },
      { name: "mobile-honeycomb", width: 390, height: 844, mobile: true, theme: "honeycomb" }
    ];
    const results = [];
    for (const variant of variants) results.push(await runVariant(browser, variant));
    const errors = results.flatMap(result => result.consoleErrors.map(error => `${result.variant}: ${error}`));
    assert.deepEqual(errors, [], `Console errors during round-6 loadout audit: ${JSON.stringify(errors, null, 2)}`);
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
