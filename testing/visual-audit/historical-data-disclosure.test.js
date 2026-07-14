const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41788;
const types = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath === "/") relativePath = "/index.html";
      const filePath = path.join(root, relativePath);
      if (!filePath.startsWith(root)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404).end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function makeMatches(prefix, rows) {
  return rows.map(([createdAt, season], index) => ({
    id: `${prefix}-${index}`,
    matchId: `${prefix}-${index}`,
    source: "henrik_sync",
    rank: index < 2 ? "Gold 3" : "Diamond 2",
    rrTotal: 24 + index * 9,
    rrVerified: true,
    verifiedRrDelta: index % 2 ? 17 : -11,
    result: index % 2 ? "win" : "loss",
    kills: 15 + index,
    deaths: 13,
    assists: 6,
    agent: "Sova",
    map: "Haven",
    createdAt,
    metadata: {
      source: "henrik_sync",
      playedAt: createdAt,
      rank: index < 2 ? "Gold 3" : "Diamond 2",
      rrTotal: 24 + index * 9,
      rrVerified: true,
      demoAct: season,
      agent: "Sova",
      mapName: "Haven"
    }
  }));
}

const profiles = [
  {
    id: "history-goopy",
    name: "Goopy",
    riotId: "Goopy#NA1",
    puuid: "history-goopy-puuid",
    importSource: "henrik",
    lastSyncSource: "henrik",
    matches: makeMatches("goopy", [
      ["2024-05-28T12:00:00Z", "Season 2024 Act 3"],
      ["2025-01-07T12:00:00Z", "Season 2025 Act 1"],
      ["2026-01-08T12:00:00Z", "Season 2026 Act 1"],
      ["2026-07-10T12:00:00Z", "Season 2026 Act 4"]
    ]),
    trackerAnalytics: { currentAct: "Season 2026 Act 4", acts: ["Season 2026 Act 4", "Season 2026 Act 1", "Season 2025 Act 1", "Season 2024 Act 3"] }
  },
  {
    id: "history-subroza",
    name: "Subroza",
    riotId: "Subroza#RULT",
    puuid: "history-subroza-puuid",
    importSource: "henrik",
    lastSyncSource: "henrik",
    matches: makeMatches("subroza", [
      ["2023-11-17T12:00:00Z", "Episode 7 Act 3"],
      ["2024-02-12T12:00:00Z", "Episode 8 Act 1"],
      ["2025-03-09T12:00:00Z", "Season 2025 Act 2"],
      ["2026-07-11T12:00:00Z", "Season 2026 Act 4"]
    ]),
    trackerAnalytics: { currentAct: "Season 2026 Act 4", acts: ["Season 2026 Act 4", "Season 2025 Act 2", "Episode 8 Act 1", "Episode 7 Act 3"] }
  }
];

async function seedPage(page, activeProfileId) {
  await page.addInitScript(({ profiles, activeProfileId }) => {
    const requestedProfileId = sessionStorage.getItem("history_test_active_profile") || activeProfileId;
    localStorage.clear();
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", requestedProfileId);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify(profiles));
    localStorage.setItem("valtracker_logs_v1", "[]");
  }, { profiles, activeProfileId });
}

async function dismissWarmup(page) {
  if (await page.locator("#dailyWarmupModal.active").count()) {
    await page.locator("#dailyWarmupSkip").click();
    await page.waitForTimeout(200);
  }
}

async function readDisclosure(page, { mobile = false } = {}) {
  const statsButton = mobile
    ? page.locator('.mobile-bottom-page-btn[data-mobile-page="stats"]')
    : page.locator('.nav-btn[data-page="stats"]');
  await statsButton.click();
  await page.waitForTimeout(350);
  const note = page.locator("#statsHistoryBoundaryNote");
  await note.waitFor({ state: "visible" });
  const notePresentation = await note.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      text: element.textContent,
      fontSize: parseFloat(style.fontSize),
      backgroundColor: style.backgroundColor,
      borderLeftWidth: parseFloat(style.borderLeftWidth)
    };
  });
  assert.ok(notePresentation.fontSize >= 11, JSON.stringify(notePresentation));
  assert.notEqual(notePresentation.backgroundColor, "rgba(0, 0, 0, 0)");
  assert.ok(notePresentation.borderLeftWidth >= 3, JSON.stringify(notePresentation));

  const homeButton = mobile
    ? page.locator('.mobile-bottom-page-btn[data-mobile-page="home"]')
    : page.locator('.nav-btn[data-page="home"]');
  await homeButton.click();
  await page.waitForTimeout(250);
  await page.locator('.graph-btn[data-size="all"]').click();
  await page.waitForTimeout(350);
  const title = String(await page.locator(".chart-axis-title").textContent()).trim();
  const dateLabels = (await page.locator(".chart-lifetime-date-label").allTextContents()).map(text => text.trim());
  assert.doesNotMatch(title, /all-time/i);
  assert.ok(dateLabels.length >= 2, JSON.stringify(dateLabels));
  const verticalSeparation = await page.locator("#chartRow").evaluate(chart => {
    const seasons = [...chart.querySelectorAll(".chart-season-boundary text")].map(element => element.getBoundingClientRect());
    const dates = [...chart.querySelectorAll(".chart-lifetime-date-label")].map(element => element.getBoundingClientRect());
    return {
      latestSeasonBottom: Math.max(...seasons.map(rect => rect.bottom)),
      earliestDateTop: Math.min(...dates.map(rect => rect.top))
    };
  });
  assert.ok(verticalSeparation.latestSeasonBottom < verticalSeparation.earliestDateTop, JSON.stringify(verticalSeparation));
  return { note: notePresentation.text, title, dateLabels };
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const consoleIssues = [];

  try {
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    desktopPage.on("console", message => { if (message.type() === "error") consoleIssues.push(message.text()); });
    desktopPage.on("pageerror", error => consoleIssues.push(error.message));
    await seedPage(desktopPage, "history-goopy");
    await desktopPage.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await desktopPage.waitForTimeout(1200);
    await dismissWarmup(desktopPage);
    const goopyDisclosure = await readDisclosure(desktopPage);
    assert.match(goopyDisclosure.note, /History limit:.*May 28, 2024/i);
    assert.match(goopyDisclosure.title, /Matches since May 28, 2024/i);
    assert.equal(goopyDisclosure.dateLabels[0], "May 28, 2024");
    assert.equal(goopyDisclosure.dateLabels.at(-1), "Jul 10, 2026");

    await desktopPage.evaluate(() => sessionStorage.setItem("history_test_active_profile", "history-subroza"));
    await desktopPage.reload({ waitUntil: "domcontentloaded" });
    await desktopPage.waitForTimeout(1200);
    await dismissWarmup(desktopPage);
    const subrozaDisclosure = await readDisclosure(desktopPage);
    assert.match(subrozaDisclosure.note, /History limit:.*Nov 17, 2023/i);
    assert.match(subrozaDisclosure.title, /Matches since Nov 17, 2023/i);
    assert.equal(subrozaDisclosure.dateLabels[0], "Nov 17, 2023");
    assert.notEqual(subrozaDisclosure.title, goopyDisclosure.title);

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const mobilePage = await mobileContext.newPage();
    mobilePage.on("console", message => { if (message.type() === "error") consoleIssues.push(message.text()); });
    mobilePage.on("pageerror", error => consoleIssues.push(error.message));
    await seedPage(mobilePage, "history-goopy");
    await mobilePage.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await mobilePage.waitForTimeout(1200);
    await dismissWarmup(mobilePage);
    const mobileDisclosure = await readDisclosure(mobilePage, { mobile: true });
    assert.match(mobileDisclosure.title, /Matches since May 28, 2024/i);
    await mobilePage.screenshot({ path: path.join(__dirname, "tmp", "history-disclosure-mobile.png"), fullPage: true });
    await desktopPage.screenshot({ path: path.join(__dirname, "tmp", "history-disclosure-desktop.png"), fullPage: true });

    const termsPage = await desktopContext.newPage();
    termsPage.on("console", message => { if (message.type() === "error") consoleIssues.push(message.text()); });
    termsPage.on("pageerror", error => consoleIssues.push(error.message));
    await termsPage.goto(`http://127.0.0.1:${port}/terms.html`, { waitUntil: "domcontentloaded" });
    const riotTerms = await termsPage.locator("h2", { hasText: "Riot-Related Features" }).locator("+ p").innerText();
    assert.match(riotTerms, /rolling window of roughly the past two years/i);
    assert.match(riotTerms, /varies by account/i);
    assert.match(riotTerms, /does not estimate, extrapolate, or fill in/i);

    assert.deepEqual(consoleIssues, []);
    console.log("Historical disclosure passed: two accounts show distinct retained dates, Stats is prominent, Lifetime uses real dates, season labels remain separated, Terms renders, and browser consoles are clean.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
