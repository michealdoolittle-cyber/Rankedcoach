const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..", "..", "public");
const PORT = 41807;
const TYPES = {
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

function json(res, payload) {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      let url = decodeURIComponent((req.url || "/").split("?")[0]);
      if (url === "/api/content/playlist") return json(res, { patchLabel: "13.01", patchTag: "", newThisWeek: 0, items: [] });
      if (url === "/api/content/knowledge") return json(res, { updatedAt: null, items: [] });
      if (url === "/api/content/skin-media") return json(res, { matches: {} });
      if (url === "/api/content/player-cards") {
        return json(res, {
          cachedAt: "2026-07-30T12:00:00.000Z",
          count: 1,
          data: [{ uuid: "qa", displayName: "QA", wideArt: "/assets/library/maps/thumbs/bind.jpg" }]
        });
      }
      if (url === "/api/content/patch-notes") {
        return json(res, {
          title: "VALORANT Patch Notes 13.02",
          label: "Patch 13.02",
          effectiveDate: "2026-07-28T13:00:00.000Z",
          sourceUrl: "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-02/",
          bullets: ["QA patch note."],
          sections: []
        });
      }
      if (url === "/favicon.ico") {
        res.writeHead(204);
        return res.end();
      }
      if (url === "/") url = "/index.html";
      const file = path.join(ROOT, url);
      if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end("Forbidden");
      }
      fs.readFile(file, (error, body) => {
        if (error) {
          res.writeHead(404);
          return res.end("Not found");
        }
        res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
        res.end(body);
      });
    }).listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function enterGuest(page) {
  await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.locator("#authGuestBtn").click({ timeout: 6000 });
  await page.locator("#guestTutorialSkipBtn").click({ timeout: 4000 }).catch(() => {});
  await page.locator("#dailyWarmupSkip").click({ timeout: 2500 }).catch(() => {});
  await page.waitForTimeout(500);
}

(async () => {
  const server = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await enterGuest(page);
    await page.locator('.nav-btn[data-page="logging"]').click();
    await page.waitForFunction(() => document.getElementById("page-logging")?.classList.contains("active"));

    await page.evaluate(() => {
      const button = document.getElementById("previewLoggingRevealBtn");
      button.hidden = false;
      button.setAttribute("aria-hidden", "false");
      button.click();
    });
    await page.waitForFunction(() => (
      document.querySelectorAll(".logging-preview-entry").length > 0 ||
      document.querySelectorAll(".log-entry-reveal").length > 0
    ), null, { timeout: 2000 });
    assert(await page.locator("#loggingLiveCard.is-synthesizing").count() === 1, "debrief pulse class missing");
    assert(await page.locator("#logSessionCountBadge.is-rolling").count() === 1, "log counter bump class missing");
    await page.waitForTimeout(2800);
    assert(await page.locator(".logging-preview-entry").count() === 0, "temporary preview entry did not clean up");

    await page.evaluate(() => {
      document.body.classList.add("access-reduced-motion");
      document.body.classList.remove("broadcast-preview-force-motion");
      const button = document.getElementById("previewRollRevealBtn");
      button.hidden = false;
      button.setAttribute("aria-hidden", "false");
      button.click();
    });
    await page.waitForTimeout(160);
    const previewForceActive = await page.evaluate(() => document.body.classList.contains("broadcast-preview-force-motion"));
    assert(previewForceActive === false, "reduced motion still enabled broadcast preview force");
    assert(errors.length === 0, `console/page errors:\n${errors.join("\n")}`);
    console.log("Logging engagement smoke passed.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
