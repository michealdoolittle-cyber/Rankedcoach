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
  ["prism-refraction", "prism-turn", "themePrismKaleidoscope"],
  ["storm-voltage", "lightning-strike", "themeLightningStrike"],
  ["jetstream-wind", "wind-flow", "themeWindFlow"],
  ["void-ink", "ink-bloom", "themeInkBloom"],
  ["echo-sonar", "sonar-pulse", "themeSonarPulse"],
  ["neon-eq", "sound-wave", "themeSoundWave"],
  ["victory-confetti", "confetti-pop", "themeConfettiPop"],
  ["aurora-rift", "aurora-rift", "themeAuroraRift"],
  ["neon-rain", "neon-rain", "themeNeonRain"],
  ["ember-dragon", "ember-dragon", "themeEmberDragon"],
  ["gravity-well", "gravity-well", "themeGravityWell"],
  ["holo-grid", "holo-grid", "themeHoloGrid"],
  ["toxic-sludge", "toxic-sludge", "themeToxicSludge"],
  ["eclipse-corona", "eclipse-corona", "themeEclipseCorona"],
  ["data-stream", "data-stream", "themeDataStream"],
  ["crystal-bloom", "crystal-bloom", "themeCrystalBloom"],
  ["comet-trail", "comet-trail", "themeCometTrail"]
];

assert.equal(PREMIUM_THEMES.length, 25);
assert.equal(new Set(PREMIUM_THEMES.map(theme => theme.id)).size, PREMIUM_THEMES.length);
assert.equal(getPremiumThemesForProfile().every(theme => theme.locked && theme.accessState === "locked"), true);
assert.equal(getPremiumThemesForProfile({ subscription: { tier: "premium" } }).every(theme => !theme.locked && theme.accessState === "available"), true);

const publicApp = fs.readFileSync(path.resolve(__dirname, "../../public/app.js"), "utf8");
const publicCss = fs.readFileSync(path.resolve(__dirname, "../../public/app.css"), "utf8");
const browserCatalog = fs.readFileSync(path.resolve(__dirname, "../../public/themes/premium-themes.js"), "utf8");

function cssBlock(name) {
  const marker = `@keyframes ${name}`;
  const start = publicCss.indexOf(marker);
  assert.notEqual(start, -1, `${name} keyframes are missing`);
  const next = publicCss.indexOf("@keyframes ", start + marker.length);
  return publicCss.slice(start, next === -1 ? publicCss.length : next);
}

const neonRainMotion = cssBlock("themeNeonRain");
assert.doesNotMatch(neonRainMotion, /background-position|translate3d|120px 900px/, "Neon Rain should animate individual SVG particles, not slide a whole sheet");

const stormStrikeMotion = cssBlock("themeLightningStrike");
const stormTrailMotion = cssBlock("themeStormVoltage");
assert.doesNotMatch(`${stormStrikeMotion}\n${stormTrailMotion}`, /background-position|translate3d|120% 52%|140% -40%/, "Storm Voltage should draw individual bolt strokes, not slide a whole sheet");

const neonRainSvg = fs.readFileSync(path.resolve(__dirname, "../../public/assets/themes/neon-rain.svg"), "utf8");
assert.ok((neonRainSvg.match(/animateTransform/g) || []).length >= 18, "Neon Rain needs many independently animated rain particles");
assert.ok((neonRainSvg.match(/begin="-?\./g) || []).length >= 10, "Neon Rain particles need staggered timing, not one synced sheet");

const stormVoltageSvg = fs.readFileSync(path.resolve(__dirname, "../../public/assets/themes/storm-voltage.svg"), "utf8");
assert.ok((stormVoltageSvg.match(/stroke-dashoffset/g) || []).length >= 9, "Storm Voltage needs drawn bolt strokes and trails");
assert.ok((stormVoltageSvg.match(/begin="-/g) || []).length >= 6, "Storm Voltage bolts need staggered random-feeling strike timing");

function themeSvg(id) {
  return fs.readFileSync(path.resolve(__dirname, `../../public/assets/themes/${id}.svg`), "utf8");
}

const internallyAnimatedThemes = {
  "astral-galaxy": [/animateTransform[\s\S]*rotate/, /attributeName="opacity"/],
  "abyssal-tide": [/animateTransform[\s\S]*rotate/, /attributeName="d"/, /feTurbulence[\s\S]*<animate/],
  "spectral-fog": [/animateTransform[\s\S]*translate/, /feTurbulence[\s\S]*<animate/],
  "cryo-fractal": [/stroke-dashoffset/, /attributeName="opacity"/],
  "solar-magma": [/feTurbulence[\s\S]*<animate/, /attributeName="r"/],
  "prism-refraction": [/animateTransform[\s\S]*rotate/, /attributeName="r"/],
  "jetstream-wind": [/animateTransform[\s\S]*translate/],
  "void-ink": [/animateTransform[\s\S]*rotate/, /stroke-dasharray/, /attributeName="r"/],
  "echo-sonar": [/animateTransform[\s\S]*rotate/, /attributeName="r"/, /attributeName="opacity"/],
  "victory-confetti": [/animateTransform[\s\S]*translate/, /additive="sum"/],
  "aurora-rift": [/attributeName="d"/, /stroke-dasharray/],
  "data-stream": [/text[\s\S]*attributeName="opacity"/, /stroke-dashoffset/]
};

for (const [id, patterns] of Object.entries(internallyAnimatedThemes)) {
  const svg = themeSvg(id);
  assert.ok((svg.match(/<animate/g) || []).length >= 2 || (svg.match(/<animateTransform/g) || []).length >= 2, `${id} needs internal SVG animation, not only CSS ambience`);
  for (const pattern of patterns) {
    assert.match(svg, pattern, `${id} is missing expected internal animation detail ${pattern}`);
  }
}

for (const keyframe of [
  "themeMilkyWaySpin", "themeWaterWhirlpool", "themeFogField", "themeCryoFracture", "themeSolarFlow",
  "themePrismKaleidoscope", "themeWindFlow", "themeInkBloom", "themeSonarPulse", "themeConfettiPop",
  "themeAuroraRift", "themeDataStream"
]) {
  assert.doesNotMatch(cssBlock(keyframe), /background-position|translate3d|transform:[^;}]*rotate\(/, `${keyframe} should not fake animation by sliding or rotating a whole texture`);
}

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
      if (url === "/api/content/playlist") {
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify({ items: [], liveStreams: [], newIn24Hours: 0 }));
      }
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
          backgroundImage: before.backgroundImage,
          nav: (() => {
            const header = document.querySelector(".app-header");
            const headerBefore = getComputedStyle(header, "::before");
            return {
              backgroundImage: getComputedStyle(header).backgroundImage,
              animation: getComputedStyle(header).animationName,
              beforeImage: headerBefore.backgroundImage,
              beforeAnimation: headerBefore.animationName,
              beforeOpacity: headerBefore.opacity
            };
          })()
        };
      });
      assert.equal(state.theme, id);
      assert.match(state.animation, new RegExp(animation));
      assert.ok(state.duration > 0 && state.playState === "running", JSON.stringify(state));
      assert.match(`${state.pattern} ${state.backgroundImage}`, new RegExp(`/assets/themes/${id}\\.svg`));
      assert.equal(state.nav.backgroundImage, "none", JSON.stringify(state.nav));
      assert.equal(state.nav.animation, "none", JSON.stringify(state.nav));
      assert.equal(state.nav.beforeImage, "none", JSON.stringify(state.nav));
      assert.equal(state.nav.beforeAnimation, "none", JSON.stringify(state.nav));
      assert.equal(Number.parseFloat(state.nav.beforeOpacity), 0, JSON.stringify(state.nav));
      await page.locator("#accountLoadingOverlay").waitFor({ state: "hidden", timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(350);
      if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) {
        await page.locator("#dailyWarmupSkip").click({ force: true }).catch(() => {});
        await page.locator("#dailyWarmupModal.active").waitFor({ state: "hidden", timeout: 1200 }).catch(async () => {
          await page.locator("#dailyWarmupModal").evaluate(modal => {
            modal.classList.remove("active", "is-opening", "is-closing");
            modal.style.display = "none";
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
          });
        });
      }
      if (index === 0) {
        const legacyNavIsolation = await page.evaluate(activeTheme => {
          const header = document.querySelector(".app-header");
          document.body.style.setProperty("--reaver-modal-art", "none", "important");
          document.body.style.setProperty("--reaver-shell-large", "none", "important");
          const states = ["ion", "reaver"].map(theme => {
            document.body.dataset.theme = theme;
            return {
              theme,
              backgroundImage: getComputedStyle(header).backgroundImage,
              animation: getComputedStyle(header).animationName,
              beforeImage: getComputedStyle(header, "::before").backgroundImage,
              beforeOpacity: getComputedStyle(header, "::before").opacity
            };
          });
          document.body.dataset.theme = activeTheme;
          document.body.style.removeProperty("--reaver-modal-art");
          document.body.style.removeProperty("--reaver-shell-large");
          return states;
        }, id);
        assert.ok(legacyNavIsolation.every(nav => nav.backgroundImage === "none" && nav.animation === "none" && nav.beforeImage === "none" && Number.parseFloat(nav.beforeOpacity) === 0), JSON.stringify(legacyNavIsolation));
        if (await page.locator("#dailyWarmupModal.active").isVisible().catch(() => false)) await page.locator("#dailyWarmupSkip").click();
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
        await page.click("#profileDropdownToggle");
        await page.click("#pdOpenSettings");
        await page.locator("#editProfileModal.active").waitFor({ state: "visible" });
        await page.locator('[data-profile-panel="theme"].is-active').waitFor({ state: "visible" });
        const desktopPager = await page.locator("#editProfileThemeGallery").evaluate(gallery => ({
          dots: [...gallery.querySelectorAll("[data-theme-gallery-page]")].map(button => ({
            page: button.dataset.themeGalleryPage,
            selected: button.getAttribute("aria-selected"),
            text: button.textContent.trim(),
            background: getComputedStyle(button).backgroundImage,
            boxShadow: getComputedStyle(button).boxShadow
          })),
          visibleCards: [...gallery.querySelectorAll("[data-theme-card]")].map(card => card.dataset.themeCard),
          activeCard: (() => {
            const card = gallery.querySelector("[data-theme-card].is-active");
            return card ? {
              id: card.dataset.themeCard,
              boxShadow: getComputedStyle(card).boxShadow,
              badge: getComputedStyle(card, "::after").content
            } : null;
          })()
        }));
        assert.deepEqual(desktopPager.dots.map(dot => dot.page), ["dark", "light", "animated"], JSON.stringify(desktopPager));
        assert.equal(desktopPager.dots.find(dot => dot.page === "animated")?.selected, "true", JSON.stringify(desktopPager));
        assert.match(desktopPager.dots.find(dot => dot.page === "animated")?.background || "", /linear-gradient/, JSON.stringify(desktopPager));
        assert.match(desktopPager.dots.find(dot => dot.page === "animated")?.boxShadow || "", /rgb|color/, JSON.stringify(desktopPager));
        assert.match(desktopPager.activeCard?.boxShadow || "", /rgb|color/, JSON.stringify(desktopPager));
        assert.match(desktopPager.activeCard?.badge || "", /SELECTED/, JSON.stringify(desktopPager));
        assert.ok(desktopPager.visibleCards.includes("tactical-matrix") && desktopPager.visibleCards.includes("comet-trail"), JSON.stringify(desktopPager));
        await page.click('[data-theme-gallery-page="light"]');
        const lightPager = await page.locator("#editProfileThemeGallery").evaluate(gallery => ({
          selected: gallery.querySelector('[data-theme-gallery-page="light"]')?.getAttribute("aria-selected"),
          cards: [...gallery.querySelectorAll("[data-theme-card]")].map(card => card.dataset.themeCard)
        }));
        assert.equal(lightPager.selected, "true", JSON.stringify(lightPager));
        assert.ok(lightPager.cards.includes("fluorescent-white") && lightPager.cards.every(id => !id.includes("tactical-matrix")), JSON.stringify(lightPager));
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(250);
        const viewport = page.locator("[data-theme-gallery-viewport]");
        const box = await viewport.boundingBox();
        assert.ok(box, "Theme gallery viewport needs a touch target");
        await viewport.evaluate((element, metrics) => {
          element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, clientX: metrics.startX, clientY: metrics.startY }));
          element.dispatchEvent(new MouseEvent("mouseup", { bubbles: true, clientX: metrics.endX, clientY: metrics.endY }));
        }, {
          startX: box.x + box.width * .76,
          startY: box.y + box.height / 2,
          endX: box.x + box.width * .22,
          endY: box.y + box.height / 2 + 4
        });
        await page.waitForTimeout(150);
        assert.equal(await page.locator('[data-theme-gallery-page="animated"]').getAttribute("aria-selected"), "true");
        await page.screenshot({ path: path.join(screenshotDir, "theme-gallery-dot-pages-mobile.png") });
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.locator("#editProfileModal").evaluate(modal => modal.classList.remove("active"));
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
    console.log("Premium theme checks passed: twenty-three textured animated presets, grouped theme selector pages, mobile swipe, neutral navigation isolation, distinct motion, entitlement states, reduced-motion fallback, live QA theme application, and zero browser errors.");
  } finally {
    await browser.close();
    server.close();
  }
}

runBrowserCheck().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
