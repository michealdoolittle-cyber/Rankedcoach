const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const repoRoot = path.resolve(__dirname, "..", "..");
const publicRoot = path.join(repoRoot, "public");
const draftRoot = path.join(publicRoot, "library", "_drafts");
const screenshotRoot = path.join(draftRoot, "screenshots");
const planPath = path.join(draftRoot, "_promotion-plan.json");
const phaseArg = process.argv.findIndex(value => value === "--phase");
const phase = phaseArg >= 0 ? process.argv[phaseArg + 1] : "";
const onlyArg = process.argv.findIndex(value => value === "--only");
const only = onlyArg >= 0 ? process.argv[onlyArg + 1] : "";
const includeAllDrafts = process.argv.includes("--all");
const port = 41788;

if (!["before", "after"].includes(phase)) {
  throw new Error("Usage: node testing/visual-audit/library-draft-screenshots.js --phase before|after");
}

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      let url = decodeURIComponent((request.url || "/").split("?")[0]);
      if (url === "/") url = "/index.html";
      if (url.startsWith("/api/")) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end("{}");
        return;
      }
      const file = path.resolve(publicRoot, `.${url}`);
      if (!file.startsWith(publicRoot)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(file, (error, data) => {
        if (error) {
          // Before the first promotion, the governed overlay does not exist.
          // Serve an empty script so screenshot capture remains console-clean.
          if (url === "/library/gamesense-promoted.js") {
            response.writeHead(200, { "Content-Type": "text/javascript" });
            response.end("");
            return;
          }
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": contentTypes[path.extname(file).toLowerCase()] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function seedScript() {
  const profile = {
    id: "library-review",
    name: "Library Review",
    accountName: "Library Review",
    region: "NA",
    matches: []
  };
  return ({ profile }) => {
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", profile.id);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
    localStorage.setItem(`valtracker_daily_warmup_prompt_v1:${profile.id}`, JSON.stringify({
      date: new Date().toISOString().slice(0, 10),
      state: "skipped"
    }));
  };
}

async function dismissWarmup(page) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const dismissed = await page.evaluate(() => {
      const modal = document.querySelector("#dailyWarmupModal");
      const skip = document.querySelector("#dailyWarmupSkip");
      if (!modal?.classList.contains("active") || !skip) return false;
      skip.click();
      return true;
    }).catch(() => false);
    if (dismissed) {
      await page.waitForTimeout(100);
      return;
    }
    await page.waitForTimeout(125);
  }
}

async function openEntity(page, entry) {
  await page.evaluate(() => {
    const control = [...document.querySelectorAll('[data-page="library"]')].find(element => element.offsetParent !== null);
    if (!control) throw new Error("No visible Library navigation control");
    control.click();
  });
  await page.waitForTimeout(100);
  await dismissWarmup(page);
  const topic = entry.category === "map" ? "maps" : `${entry.category}s`;
  await page.evaluate(topicId => {
    const control = document.querySelector(`[data-gamesense-topic="${topicId}"]`);
    if (!control) throw new Error(`No Library topic control for ${topicId}`);
    control.click();
  }, topic);
  await page.waitForTimeout(100);
  if (entry.category === "weapon") {
    const draft = JSON.parse(fs.readFileSync(path.join(draftRoot, `weapon-${entry.slug}.json`), "utf8"));
    const groupId = draft._meta.groupId;
    const group = page.locator(`[data-gamesense-item="${groupId}"]`).first();
    if (!(await group.count())) throw new Error(`No weapon group card found for ${entry.slug} (${groupId})`);
    await group.evaluate(element => element.click());
    await page.waitForTimeout(100);
    const weapon = page.locator(`[data-gamesense-weapon="${entry.slug}"]`).first();
    if (await weapon.count()) {
      await weapon.evaluate(element => element.click());
      await page.waitForTimeout(100);
    }
    return;
  }
  let item = page.locator(`[data-gamesense-item="${entry.slug}"]`).first();
  if (!(await item.count()) && entry.category === "map") {
    await page.evaluate(() => document.querySelector('[data-gamesense-map-season="out"]')?.click());
    await page.waitForTimeout(100);
    item = page.locator(`[data-gamesense-item="${entry.slug}"]`).first();
  }
  if (!(await item.count())) {
    const visibleItems = await page.locator("[data-gamesense-item]").evaluateAll(nodes => nodes.map(node => node.getAttribute("data-gamesense-item")));
    throw new Error(`No Library card found for ${entry.category}:${entry.slug}; rendered=${visibleItems.join(",") || "none"}`);
  }
  await item.evaluate(element => element.click());
  await page.waitForTimeout(100);
}

async function screenshotEntity(page, entry) {
  const selectors = entry.category === "map"
    ? [".gamesense-tactical-card", ".gamesense-map-detail-head", "#gamesenseLibraryView"]
    : entry.category === "agent"
      ? [".gamesense-selector-section", ".gamesense-agent-detail-head", "#gamesenseLibraryView"]
      : [".gamesense-fact-panel", ".gamesense-weapon-detail-head", "#gamesenseLibraryView"];
  let target = null;
  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    if (await locator.isVisible().catch(() => false)) {
      target = locator;
      break;
    }
  }
  if (!target) throw new Error(`No visible review surface found for ${entry.category}:${entry.slug}`);
  await target.scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    const images = [...document.images].filter(image => image.getBoundingClientRect().width > 0);
    await Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise(resolve => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
      setTimeout(resolve, 1800);
    })));
  });
  await target.screenshot({
    path: path.join(screenshotRoot, `${entry.slug}-${phase}.png`),
    animations: "disabled",
    timeout: 10_000
  });
}

(async () => {
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  if (includeAllDrafts) {
    plan.changedEntities = fs.readdirSync(draftRoot)
      .filter(file => /^(agent|map|weapon)-.+\.json$/i.test(file))
      .sort()
      .map(file => {
        const draft = JSON.parse(fs.readFileSync(path.join(draftRoot, file), "utf8"));
        return {
          category: draft._meta.category,
          slug: draft._meta.slug,
          entityName: draft._meta.entityName,
          changedFields: Object.keys(draft._fieldMeta || {})
        };
      });
  }
  fs.mkdirSync(screenshotRoot, { recursive: true });
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(5_000);
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.addInitScript(seedScript(), {
    profile: {
      id: "library-review",
      name: "Library Review",
      accountName: "Library Review",
      region: "NA",
      matches: []
    }
  });
  try {
    await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(350);
    await dismissWarmup(page);
    const entries = (plan.changedEntities || []).filter(entry => !only || `${entry.category}:${entry.slug}` === only || entry.slug === only);
    let captured = 0;
    const failures = [];
    for (const entry of entries) {
      try {
        await openEntity(page, entry);
        await screenshotEntity(page, entry);
        captured += 1;
        console.log(`Captured ${phase}: ${entry.category}:${entry.slug}`);
      } catch (error) {
        failures.push(`${entry.category}:${entry.slug}: ${error.message}`);
        console.error(`Screenshot ${phase} failed for ${entry.category}:${entry.slug}: ${error.message}`);
      }
    }
    if (failures.length) throw new Error(`${failures.length} screenshot(s) failed: ${failures.join(" | ")}`);
    if (errors.length) throw new Error(`Browser errors: ${[...new Set(errors)].join(" | ")}`);
    console.log(`Captured ${phase} screenshots for ${captured} planned Library entities.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
