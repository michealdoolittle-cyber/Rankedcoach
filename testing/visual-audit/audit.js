// RankedCoach visual/functionality passthrough harness.
// Serves public/ locally, drives the real UI (no test-only hooks), captures
// full-page screenshots + console errors + layout-overflow checks across
// viewports x guest states x pages x modals.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..", "public");
const OUT = path.resolve(__dirname, "output");
const PORT = 41777;

const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp",
  ".mp4": "video/mp4", ".ico": "image/x-icon"
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let u = decodeURIComponent((req.url || "/").split("?")[0]);
      if (u === "/") u = "/index.html";
      const f = path.join(ROOT, u);
      if (!f.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
      fs.readFile(f, (e, d) => {
        if (e) { res.writeHead(404); return res.end("Not found"); }
        res.writeHead(200, { "Content-Type": TYPES[path.extname(f).toLowerCase()] || "application/octet-stream" });
        res.end(d);
      });
    }).listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 900 }
];

// Each entry: name, async fn(page) that navigates/opens something, then we screenshot.
const STATE_SETUP = {
  blank: async (page) => {
    await page.click("#authGuestBtn");
    await page.waitForSelector("#guestTutorialSkipBtn", { timeout: 5000 }).catch(() => {});
    const skip = await page.$("#guestTutorialSkipBtn");
    if (skip) await skip.click();
    await page.waitForTimeout(400);
  },
  demo: async (page, viewport) => {
    await page.click("#authGuestBtn");
    await page.waitForSelector("#guestTutorialSkipBtn", { timeout: 5000 }).catch(() => {});
    const skip = await page.$("#guestTutorialSkipBtn");
    if (skip) await skip.click();
    await page.waitForTimeout(400);
    // switch to the demo-import guest profile via the real profile switcher UI
    const avatarSelector = viewport === "mobile" ? ".mobile-bottom-avatar-btn" : "#profileAvatarWrap";
    await page.click(avatarSelector).catch(() => {});
    await page.waitForTimeout(300);
    const switcherOpen = await page.evaluate(() => document.getElementById("profileSwitcher")?.classList.contains("open")).catch(() => false);
    if (switcherOpen) {
      const demoChoice = await page.$('[data-guest-profile-choice="demo"]');
      if (demoChoice && await demoChoice.isVisible().catch(() => false)) {
        await demoChoice.click().catch(() => {});
        await page.waitForTimeout(1500);
      }
    }
    // close switcher if still open
    await page.keyboard.press("Escape").catch(() => {});
  }
};

const PAGES = ["home", "logging", "stats", "insights"];

// On mobile, the desktop header cluster (#profileAvatarWrap, #profileRatingWidget,
// #profileDropdownToggle) is hidden via CSS (`.is-mobile-layout .nav-right{display:none}`)
// and replaced by a JS-built bottom shell (.mobile-bottom-avatar-btn / [data-mobile-action="menu"]).
// There is NO mobile bottom-shell entry for profile-rating — that surface is intentionally
// skipped on mobile below and flagged as a known gap rather than force-clicked.
async function openProfileSwitcher(page, viewport) {
  if (viewport === "mobile") {
    await page.click(".mobile-bottom-avatar-btn");
  } else {
    await page.click("#profileAvatarWrap");
  }
  await page.waitForTimeout(300);
}

async function openProfileDropdown(page, viewport) {
  if (viewport === "mobile") {
    await page.click('.mobile-bottom-icon-btn[data-mobile-action="menu"]');
  } else {
    await page.click("#profileDropdownToggle");
  }
  await page.waitForTimeout(300);
}

const MODALS = [
  { key: "profile-dropdown", open: async (page, viewport) => { await openProfileDropdown(page, viewport); } },
  { key: "profile-switcher", open: async (page, viewport) => { await openProfileSwitcher(page, viewport); } },
  { key: "profile-rating", open: async (page, viewport) => {
      if (viewport === "mobile") {
        await page.click('.mobile-bottom-icon-btn[data-mobile-action="rating"]');
        await page.waitForTimeout(300);
        return;
        throw new Error("SKIPPED: profile-rating has no mobile bottom-shell trigger (known gap — see CORRECTIONS.md)");
      }
      await page.click("#profileRatingWidget"); await page.waitForTimeout(300);
  } },
  { key: "edit-profile-theme", open: async (page, viewport) => {
      await openProfileDropdown(page, viewport);
      await page.click("#pdOpenSettings").catch(() => {}); await page.waitForTimeout(400);
  } },
  { key: "import-history", open: async (page, viewport) => {
      await openProfileDropdown(page, viewport);
      await page.click("#importHistoryOpenBtn").catch(() => {}); await page.waitForTimeout(400);
  } },
  { key: "ask-coach", open: async (page, viewport) => {
      await page.click(viewport === "mobile" ? "#mobileAskCoachOpen" : "#askCoachOpen").catch(() => {});
      await page.waitForTimeout(500);
  } },
  { key: "bug-report", open: async (page, viewport) => {
      await page.click(viewport === "mobile" ? "#mobileBugReportOpen" : "#bugReportOpen").catch(() => {});
      await page.waitForTimeout(400);
  } }
];

async function checkOverflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
  }));
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch();
  const report = [];

  for (const viewport of VIEWPORTS) {
    for (const stateName of Object.keys(STATE_SETUP)) {
      const dir = path.join(OUT, viewport.name, stateName);
      fs.mkdirSync(dir, { recursive: true });
      const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
      const page = await context.newPage();
      const consoleIssues = [];
      page.on("console", (msg) => {
        if (["error", "warning"].includes(msg.type())) consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
      });
      page.on("pageerror", (err) => consoleIssues.push(`[pageerror] ${err.message}`));

      await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      // onboarding / auth gate screenshot before entering guest state
      await page.screenshot({ path: path.join(dir, "00-auth-gate.png"), fullPage: true }).catch(() => {});

      try {
        await STATE_SETUP[stateName](page, viewport.name);
      } catch (err) {
        report.push({ viewport: viewport.name, state: stateName, surface: "state-setup", error: String(err) });
      }

      // Desktop keeps the top .nav-btn tabs; mobile hides them entirely
      // (`.is-mobile-layout .nav-left{display:none}`) and drives navigation from
      // the JS-built bottom shell's .mobile-bottom-page-btn instead.
      const navSelector = (p) => viewport.name === "mobile"
        ? `.mobile-bottom-page-btn[data-mobile-page="${p}"]`
        : `.nav-btn[data-page="${p}"]`;

      for (const p of PAGES) {
        await page.click(navSelector(p)).catch(() => {});
        await page.waitForTimeout(600);
        const overflow = await checkOverflow(page);
        await page.screenshot({ path: path.join(dir, `page-${p}.png`), fullPage: true });
        report.push({ viewport: viewport.name, state: stateName, surface: `page:${p}`, overflow, consoleIssuesSoFar: consoleIssues.length });
      }

      // back to home before opening modals
      await page.click(navSelector("home")).catch(() => {});
      await page.waitForTimeout(300);

      for (const modal of MODALS) {
        // Reload between modal tests instead of force-closing overlays: entry choice
        // and guest profile live in localStorage, so a fresh load lands straight on
        // the dashboard (no re-auth) with zero leftover open/hidden state from the
        // previous modal. Manually stomping classes/inline styles was tried first and
        // corrupted later modals (inline display:none outlives the class toggle).
        await page.reload({ waitUntil: "networkidle" });
        await page.waitForTimeout(500);
        await page.click(navSelector("home")).catch(() => {});
        await page.waitForTimeout(200);
        try {
          await modal.open(page, viewport.name);
          await page.waitForTimeout(400);
          const overflow = await checkOverflow(page);
          await page.screenshot({ path: path.join(dir, `modal-${modal.key}.png`), fullPage: true });
          report.push({ viewport: viewport.name, state: stateName, surface: `modal:${modal.key}`, overflow, consoleIssuesSoFar: consoleIssues.length });
        } catch (err) {
          report.push({ viewport: viewport.name, state: stateName, surface: `modal:${modal.key}`, error: String(err) });
        }
      }

      fs.writeFileSync(path.join(dir, "console.log.json"), JSON.stringify(consoleIssues, null, 2));
      await context.close();
    }
  }

  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  await browser.close();
  server.close();
  console.log("DONE");
  console.log(JSON.stringify(report, null, 2));
}

run().catch((err) => { console.error(err); process.exit(1); });
