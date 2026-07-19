const assert = require("assert/strict");
const path = require("path");
const { chromium } = require("playwright");
const {
  port,
  startServer,
  supabaseStub,
  weaponSkinApiStub,
  seed,
  dismissWarmup
} = require("./gamesense-library.test.js");

async function preparePage(browser, name, options) {
  const page = await browser.newPage(options);
  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: supabaseStub() }));
  await page.route("https://valorant-api.com/v1/weapons/**", route => route.fulfill({ contentType: "application/json", body: weaponSkinApiStub(route.request().url()) }));
  await page.route("https://media.valorant-api.com/contenttiers/**", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="#fff" d="M12 1 23 12 12 23 1 12z"/></svg>' }));
  await seed(page, name);
  await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
  await dismissWarmup(page);
  await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
  await dismissWarmup(page);
  return page;
}

async function openClassicDossier(page, mobile) {
  const nav = mobile
    ? page.locator('.mobile-bottom-page-btn[data-mobile-page="library"]')
    : page.locator('.nav-btn[data-page="library"]');
  await nav.waitFor({ state: "visible", timeout: 10000 });
  await nav.click();
  await page.locator("#page-library.active").waitFor({ state: "visible" });
  await page.locator('[data-gamesense-topic="weapons"]').click();
  await page.locator('.gamesense-entry-grid-weapons [data-gamesense-item="sidearms"]').click();
  await page.locator('[data-gamesense-weapon="classic"]').click();
  await page.locator('[data-gamesense-weapon="classic"].active').waitFor({ state: "visible" });

  const panelText = await page.locator(".gamesense-weapon-panel").innerText();
  assert.match(panelText, /do not sleep on the alt-fire.*close, sudden right-click fight.*full three-shot burst.*headshot plus one body shot/is);
  assert.doesNotMatch(panelText, /pellet/i);
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const desktop = await preparePage(browser, "sidearms-desktop", { viewport: { width: 1440, height: 900 } });
    await openClassicDossier(desktop, false);
    await desktop.locator(".gamesense-weapon-guidance").screenshot({ path: path.join(__dirname, "tmp", "gamesense-sidearms-classic-desktop.png") });
    await desktop.close();

    const mobile = await preparePage(browser, "sidearms-mobile", { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await openClassicDossier(mobile, true);
    await mobile.locator(".gamesense-weapon-guidance").screenshot({ path: path.join(__dirname, "tmp", "gamesense-sidearms-classic-mobile.png") });
    await mobile.close();

    console.log("Gamesense Sidearms rendered-copy checks passed on desktop and mobile.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
