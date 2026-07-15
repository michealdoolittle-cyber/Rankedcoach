const assert = require("assert/strict");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");
const { PREMIUM_THEMES, getPremiumThemesForProfile } = require("../../themes/premiumThemes");

const expected = [
  ["tactical-matrix", "grid-drift", "themeGridDrift"],
  ["astral-galaxy", "star-drift", "themeMilkyWaySpin"],
  ["abyssal-tide", "water-flow", "themeWaterWhirlpool"],
  ["spectral-fog", "fog-drift", "themeFogField"],
  ["cryo-fractal", "fractal-shift", "themeCryoFracture"],
  ["solar-magma", "solar-flow", "themeSolarFlow"],
  ["prism-refraction", "prism-turn", "themePrismKaleidoscope"]
];

assert.equal(PREMIUM_THEMES.length, 9);
assert.equal(new Set(PREMIUM_THEMES.map(theme => theme.id)).size, PREMIUM_THEMES.length);
assert.equal(getPremiumThemesForProfile().every(theme => theme.locked && theme.accessState === "locked"), true);
assert.equal(getPremiumThemesForProfile({ subscription: { tier: "premium" } }).every(theme => !theme.locked && theme.accessState === "available"), true);

const publicApp = fs.readFileSync(path.resolve(__dirname, "../../public/app.js"), "utf8");
const publicCss = fs.readFileSync(path.resolve(__dirname, "../../public/app.css"), "utf8");
const browserCatalog = fs.readFileSync(path.resolve(__dirname, "../../public/themes/premium-themes.js"), "utf8");

for (const [id, motion, animation] of expected) {
  const theme = PREMIUM_THEMES.find(item => item.id === id);
  assert.ok(theme, `missing ${id}`);
  assert.equal(theme.signatureMotion.name, motion);
  assert.match(theme.colors.accent, /^#[0-9a-f]{6}$/i);
  assert.match(theme.colors.accent2, /^#[0-9a-f]{6}$/i);
  assert.notEqual(theme.colors.accent, theme.colors.accent2);
  assert.ok(publicApp.includes(`createProfileTheme("${id}"`), `${id} is not wired into the profile theme gallery`);
  assert.ok(browserCatalog.includes(`id: "${id}"`), `${id} is missing from the browser premium catalog`);
  assert.ok(publicCss.includes(`body.theme-${motion}`), `${motion} has no visual motion rule`);
  assert.ok(publicCss.includes(`animation:${animation}`), `${id} is missing its distinct motion keyframe`);
  assert.ok(publicApp.includes(`pattern: "url('/assets/themes/${id}.svg')"`), `${id} is not wired to its SVG texture`);
  const svgPath = path.resolve(__dirname, `../../public/assets/themes/${id}.svg`);
  assert.equal(fs.existsSync(svgPath), true, `${id} SVG texture is missing`);
  assert.match(fs.readFileSync(svgPath, "utf8"), /<svg[\s>]/i, `${id} texture is not SVG`);
}

assert.match(publicCss, /prefers-reduced-motion:reduce[\s\S]*theme-grid-drift[\s\S]*animation:none !important/);

const publicRoot = path.resolve(__dirname, "../../public");
const port = 41791;
const contentTypes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/") url = "/index.html";
      const file = path.join(publicRoot, url);
      fs.readFile(file, (error, data) => {
        if (error) { response.writeHead(404); return response.end("Not found"); }
        response.writeHead(200, { "Content-Type": contentTypes[path.extname(file)] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function qaSupabaseStub() {
  const user = { id: "premium-qa", email: "michealdoolittle@gmail.com" };
  const session = { user, access_token: "qa-token" };
  return `
    globalThis.supabase = {
      createClient() {
        const query = {
          select() { return this; }, eq() { return this; }, order() { return this; }, limit() { return this; },
          maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }),
          then(resolve) { return Promise.resolve({ data: [], error: null }).then(resolve); },
          upsert: async () => ({ data: null, error: null }), insert: async () => ({ data: null, error: null }),
          update() { return this; }, delete() { return this; }
        };
        return {
          auth: {
            getSession: async () => ({ data: { session: ${JSON.stringify(session)} }, error: null }),
            getUser: async () => ({ data: { user: ${JSON.stringify(user)} }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", ${JSON.stringify(session)}), 0);
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

async function runBrowserCheck() {
  const server = await startServer();
  const browser = await chromium.launch();
  try {
    const errors = [];
    const screenshotDir = path.resolve(__dirname, "tmp");
    fs.mkdirSync(screenshotDir, { recursive: true });
    for (const [index, [id, motion, animation]] of expected.entries()) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      page.on("console", message => { if (message.type() === "error") errors.push(`${id} console: ${message.text()}`); });
      page.on("pageerror", error => errors.push(`${id} page: ${error.message}`));
      await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({ contentType: "text/javascript", body: qaSupabaseStub() }));
      await page.addInitScript(themeId => {
        const profile = { id: `premium-theme-${themeId}`, name: "Theme QA", accountName: "Theme QA", region: "NA", matches: [], themeKey: themeId };
        localStorage.setItem("valtracker_entry_choice_v1", "guest");
        localStorage.setItem("valtracker_active_profile_id", profile.id);
        localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
      }, id);
      await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 15000 });
      await page.waitForFunction(({ themeId, motionClass }) => document.body.dataset.theme === themeId && document.body.classList.contains(`theme-${motionClass}`), { themeId: id, motionClass: motion }, { timeout: 15000 });
      const state = await page.evaluate(() => {
        const root = document.querySelector(".app-root");
        const before = getComputedStyle(root, "::before");
        return {
          theme: document.body.dataset.theme,
          animation: before.animationName,
          duration: Number.parseFloat(before.animationDuration),
          playState: before.animationPlayState,
          pattern: getComputedStyle(document.documentElement).getPropertyValue("--theme-bg-pattern"),
          backgroundImage: before.backgroundImage
        };
      });
      assert.equal(state.theme, id);
      assert.match(state.animation, new RegExp(animation));
      assert.ok(state.duration > 0 && state.playState === "running", JSON.stringify(state));
      assert.match(`${state.pattern} ${state.backgroundImage}`, new RegExp(`/assets/themes/${id}\\.svg`));
      await page.locator("#accountLoadingOverlay").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(350);
      if (index === 0) {
        for (const pageName of ["home", "logging", "insights"]) {
          await page.locator(`[data-page="${pageName}"]`).click();
          await page.locator(`#page-${pageName}.active`).waitFor({ state: "visible" });
          const surface = page.locator(`#page-${pageName} .card`).first();
          await surface.waitFor({ state: "visible" });
          assert.match(await surface.evaluate(card => getComputedStyle(card).backdropFilter || getComputedStyle(card).webkitBackdropFilter), /blur\(5px\)/, `${pageName} does not reveal the premium scene texture`);
        }
        await page.locator('[data-page="library"]').click();
        await page.locator("#page-library.active").waitFor({ state: "visible" });
        await page.locator(".gamesense-topic-card").first().waitFor({ state: "visible" });
        await page.waitForTimeout(400);
        assert.equal(await page.locator("#page-library").evaluate(library => getComputedStyle(library).backgroundImage), "none");
      }
      await page.screenshot({ path: path.join(screenshotDir, `premium-theme-${id}.png`) });
      if (index === expected.length - 1) {
        await page.evaluate(() => document.body.classList.add("access-reduced-motion"));
        const reducedMotion = await page.locator(".app-root").evaluate(root => {
          const before = getComputedStyle(root, "::before");
          return { duration: before.animationDuration, iterations: before.animationIterationCount };
        });
        assert.ok(Number.parseFloat(reducedMotion.duration) <= 0.00001, JSON.stringify(reducedMotion));
        assert.equal(reducedMotion.iterations, "1");
      }
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log("Premium theme checks passed: seven textured presets, distinct palettes, entitlement states, reduced-motion fallback, live QA theme application, and zero browser errors.");
  } finally {
    await browser.close();
    server.close();
  }
}

runBrowserCheck().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
