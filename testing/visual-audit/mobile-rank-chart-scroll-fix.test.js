"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41928;
const outDir = path.resolve(__dirname, "test-results", "mobile-rank-chart-scroll-fix");
const types = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relative = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relative === "/") relative = "/index.html";
      const file = path.join(root, relative);
      if (!file.startsWith(root)) return response.writeHead(403).end("Forbidden");
      fs.readFile(file, (error, data) => {
        if (error) return response.writeHead(404).end("Not found");
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

function makeRankMatch(index, overrides = {}) {
  const playedAt = overrides.playedAt || `2026-08-${String(index + 1).padStart(2, "0")}T16:00:00.000Z`;
  const absolute = overrides.absoluteRr ?? (1300 + (index * 80));
  const rank = overrides.rank || "Diamond 1";
  const result = overrides.result || "win";
  const rrDelta = result === "win" ? 18 : -14;
  const season = overrides.season || `season-${2024 + index}-act-${(index % 6) + 1}`;
  const act = overrides.act || `Season ${2024 + index} Act ${(index % 6) + 1}`;
  return {
    id: `mobile-lifetime-rank-${index}`,
    matchId: `mobile-lifetime-rank-${index}`,
    source: "henrik_sync",
    importSource: "henrik_sync",
    createdAt: playedAt,
    playedAt,
    season,
    seasonId: season,
    act,
    rank,
    rrTotal: absolute % 100,
    rr: rrDelta,
    verifiedRrDelta: rrDelta,
    rrVerified: true,
    agent: "Sova",
    role: "initiator",
    map: "Ascent",
    result,
    kills: 18,
    deaths: 12,
    assists: 5,
    acs: 220,
    adr: 145,
    hsPercent: 28,
    queue: { id: "competitive", name: "Competitive", modeType: "Standard" },
    metadata: {
      source: "henrik_sync",
      matchId: `mobile-lifetime-rank-${index}`,
      playedAt,
      season,
      seasonId: season,
      act,
      rank,
      queue: { id: "competitive", name: "Competitive", modeType: "Standard" }
    },
    matchRecord: {
      playedAt,
      source: "henrik_sync",
      act,
      rank: { rank, rr: absolute % 100, rrDelta, verified: true }
    }
  };
}

function buildProfileFixture() {
  return {
    id: "mobile-lifetime-rank-profile",
    name: "Mobile Lifetime Rank",
    accountName: "Mobile Lifetime Rank",
    isGuest: true,
    importSource: "henrik_sync",
    lastSyncSource: "henrik_sync",
    trackerAnalytics: {
      currentAct: "Season 2026 Act 4",
      acts: ["Season 2024 Act 1", "Season 2024 Act 3", "Season 2025 Act 2", "Season 2025 Act 5", "Season 2026 Act 2", "Season 2026 Act 4"]
    },
    matches: [
      makeRankMatch(0, { playedAt: "2024-08-22T10:00:00.000Z", act: "Season 2024 Act 1", season: "season-2024-act-1", rank: "Gold 2", absoluteRr: 1120 }),
      makeRankMatch(1, { playedAt: "2024-12-10T10:00:00.000Z", act: "Season 2024 Act 3", season: "season-2024-act-3", rank: "Platinum 2", absoluteRr: 1438, result: "loss" }),
      makeRankMatch(2, { playedAt: "2025-03-15T10:00:00.000Z", act: "Season 2025 Act 2", season: "season-2025-act-2", rank: "Diamond 1", absoluteRr: 1535 }),
      makeRankMatch(3, { playedAt: "2025-10-03T10:00:00.000Z", act: "Season 2025 Act 5", season: "season-2025-act-5", rank: "Ascendant 1", absoluteRr: 1815 }),
      makeRankMatch(4, { playedAt: "2026-04-02T10:00:00.000Z", act: "Season 2026 Act 2", season: "season-2026-act-2", rank: "Ascendant 3", absoluteRr: 2018, result: "loss" }),
      makeRankMatch(5, { playedAt: "2026-08-17T10:00:00.000Z", act: "Season 2026 Act 4", season: "season-2026-act-4", rank: "Diamond 2", absoluteRr: 1648 })
    ]
  };
}

async function bootMobilePage(page, profile) {
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
  await page.addInitScript(fixture => {
    globalThis.__RANKEDCOACH_TEST_HOOKS__ = true;
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("rankedcoach_guest_choice_seen_v1", "1");
    localStorage.setItem("rankedcoach_daily_entrance_seen_v1", JSON.stringify({ date: "2099-01-01", seenPages: ["home", "logging", "stats", "insights", "library"] }));
    localStorage.setItem("valtracker_active_profile_id", fixture.id);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([fixture]));
  }, profile);
  await page.goto(`http://127.0.0.1:${port}/index.html?mobileLifetimeRank=${Date.now()}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 20000 });
  await page.waitForFunction(() => Boolean(globalThis.RankedCoachTestHooks), null, { timeout: 10000 });
}

async function openLifetimeChart(page, profile) {
  await page.evaluate(fixture => {
    globalThis.RankedCoachTestHooks.loadProfileFixture(fixture);
    globalThis.RankedCoachTestHooks.activatePageForTest("stats");
    document.querySelectorAll(".modal-overlay,.modal-backdrop,#guestChoiceModal,#dailyEntranceOverlay,#dailyWarmupModal,#weeklyFocusModal,#lensModal,#matchSummaryModal").forEach(element => {
      element.hidden = true;
      element.classList.remove("show", "active", "is-active", "is-opening", "visible");
      element.style.setProperty("display", "none", "important");
      element.style.setProperty("pointer-events", "none", "important");
    });
    document.body.classList.remove("has-active-modal", "mobile-modal-open");
    globalThis.RankedCoachTestHooks.openStatsPeakLifetimeRankChart();
  }, profile);
  await page.waitForSelector("#lensModal.active .stats-lifetime-rank-chart-frame", { timeout: 8000 });
}

async function measureStickyAxis(page) {
  return page.evaluate(async () => {
    const frame = document.querySelector(".stats-lifetime-rank-chart-frame");
    const sticky = document.querySelector(".stats-lifetime-rank-y-axis-sticky");
    const stickySvg = document.querySelector(".stats-lifetime-rank-y-axis-chart");
    const wrap = document.querySelector(".stats-lifetime-rank-chart-wrap");
    const chart = document.querySelector(".stats-lifetime-rank-chart");
    const stickyAxis = stickySvg?.querySelector(".stats-lifetime-rank-axis");
    const chartXAxis = chart?.querySelector(".stats-lifetime-rank-axis");
    const toClientPoint = (svg, x, y) => {
      const point = svg.createSVGPoint();
      point.x = Number(x);
      point.y = Number(y);
      return point.matrixTransform(svg.getScreenCTM());
    };
    const stickyLines = [...(stickySvg?.querySelectorAll(".stats-lifetime-rank-y-tick line") || [])];
    const gridLines = [...(chart?.querySelectorAll(".stats-lifetime-rank-y-grid line") || [])];
    const yDeltas = stickyLines.map((line, index) => {
      const grid = gridLines[index];
      if (!grid) return Number.POSITIVE_INFINITY;
      return Math.abs(
        toClientPoint(stickySvg, line.getAttribute("x2"), line.getAttribute("y1")).y
        - toClientPoint(chart, grid.getAttribute("x1"), grid.getAttribute("y1")).y
      );
    });
    const axisLeftStart = toClientPoint(stickySvg, stickyAxis.getAttribute("x1"), stickyAxis.getAttribute("y1")).x;
    const chartAxisLeftStart = toClientPoint(chart, chartXAxis.getAttribute("x1"), chartXAxis.getAttribute("y1")).x;
    const samples = [];
    const maxScroll = Math.max(0, wrap.scrollWidth - wrap.clientWidth);
    for (const scrollLeft of [0, Math.round(maxScroll / 2), maxScroll]) {
      wrap.scrollLeft = scrollLeft;
      await new Promise(requestAnimationFrame);
      samples.push({
        scrollLeft: wrap.scrollLeft,
        stickyLeft: Math.round(sticky.getBoundingClientRect().left),
        axisLeft: Math.round(toClientPoint(stickySvg, stickyAxis.getAttribute("x1"), stickyAxis.getAttribute("y1")).x)
      });
    }
    return {
      build: globalThis.RankedCoachBuild?.id,
      chartDataWidth: frame?.dataset.chartWidth || "",
      chartDataHeight: frame?.dataset.chartHeight || "",
      padLeft: frame?.dataset.padLeft || "",
      stickyHeight: sticky ? Math.round(sticky.getBoundingClientRect().height) : 0,
      stickySvgHeight: stickySvg ? Math.round(stickySvg.getBoundingClientRect().height) : 0,
      chartHeight: chart ? Math.round(chart.getBoundingClientRect().height) : 0,
      chartWidth: chart ? Math.round(chart.getBoundingClientRect().width) : 0,
      axisDeltaAtStart: Math.abs(axisLeftStart - chartAxisLeftStart),
      maxYDelta: yDeltas.length ? Math.max(...yDeltas) : Number.POSITIVE_INFINITY,
      scrollable: wrap ? wrap.scrollWidth > wrap.clientWidth : false,
      fade: sticky ? getComputedStyle(sticky).backgroundImage : "",
      dataPoints: document.querySelectorAll(".stats-lifetime-rank-dot").length,
      samples
    };
  });
}

async function run() {
  fs.mkdirSync(outDir, { recursive: true });
  const profile = buildProfileFixture();
  const server = await startServer();
  const browser = await chromium.launch();
  const issues = [];
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    page.on("pageerror", error => issues.push(`[pageerror] ${error.message}`));
    page.on("console", message => {
      if (message.type() === "error" && !/Failed to load resource/i.test(message.text())) issues.push(`[console] ${message.text()}`);
    });
    await bootMobilePage(page, profile);
    await openLifetimeChart(page, profile);
    const populated = await measureStickyAxis(page);
    assert.equal(populated.build, "20260817-mobile-rank-chart-scroll-01");
    assert.equal(populated.chartDataWidth, "920", `mobile lifetime chart should be built at mobile width: ${JSON.stringify(populated)}`);
    assert.equal(populated.chartDataHeight, "360", `mobile lifetime chart should be built at mobile height: ${JSON.stringify(populated)}`);
    assert.equal(populated.scrollable, true, `mobile lifetime chart should stay horizontally scrollable: ${JSON.stringify(populated)}`);
    assert.equal(populated.dataPoints, 6, `seeded rank history should draw every seasonal peak: ${JSON.stringify(populated)}`);
    assert.ok(populated.stickyHeight === populated.chartHeight && populated.stickySvgHeight === populated.chartHeight, `sticky axis and scrolling SVG should share rendered height: ${JSON.stringify(populated)}`);
    assert.ok(populated.axisDeltaAtStart <= 1, `sticky axis should align horizontally with the scrolling chart axis: ${JSON.stringify(populated)}`);
    assert.ok(populated.maxYDelta <= 1, `sticky rank icons should align with scrolling gridlines: ${JSON.stringify(populated)}`);
    assert.ok(!/68%/.test(populated.fade) && /10px|5px/.test(populated.fade), `sticky fade should be a short trailing-edge mask: ${populated.fade}`);
    assert.ok(populated.samples.every(sample => sample.stickyLeft === populated.samples[0].stickyLeft && sample.axisLeft === populated.samples[0].axisLeft), `sticky Y axis should not move during horizontal scroll: ${JSON.stringify(populated.samples)}`);
    await page.locator("#lensModal.active > .lens-modal").screenshot({ path: path.join(outDir, "mobile-lifetime-rank-sticky-axis.png") });

    await page.evaluate(() => {
      globalThis.RankedCoachTestHooks.loadProfileFixture({ id: "empty-lifetime-rank-profile", name: "Empty Lifetime", accountName: "Empty Lifetime", isGuest: true, matches: [] });
      globalThis.RankedCoachTestHooks.openStatsPeakLifetimeRankChart();
    });
    await page.waitForSelector("#lensModal.active .stats-lifetime-rank-empty", { timeout: 5000 });
    const emptyText = await page.locator("#lensModal.active .stats-lifetime-rank-empty").innerText();
    assert.match(emptyText, /No retained rank snapshots/i);
    assert.deepEqual(issues, [], `console/page errors during mobile rank chart check: ${JSON.stringify(issues, null, 2)}`);
    console.log(JSON.stringify({ populated, emptyText }, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
