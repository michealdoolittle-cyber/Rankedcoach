"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const workspace = path.resolve(__dirname, "..", "..");
const publicRoot = path.join(workspace, "public");
const port = 41858;
const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function startServer() {
  return new Promise(resolve => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
      if (pathname.startsWith("/api/content/")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ items: [], matches: {}, sections: [] }));
        return;
      }
      if (pathname === "/favicon.ico") {
        response.writeHead(204);
        response.end();
        return;
      }
      const filePath = path.join(publicRoot, pathname === "/" ? "index.html" : pathname);
      if (!filePath.startsWith(publicRoot)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        response.writeHead(error ? 404 : 200, {
          "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
        });
        response.end(error ? "Not found" : data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function supabaseStub() {
  return `
    window.supabase = {
      createClient() {
        return {
          auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            getUser: async () => ({ data: { user: null }, error: null }),
            onAuthStateChange(callback) {
              setTimeout(() => callback("INITIAL_SESSION", null), 0);
              return { data: { subscription: { unsubscribe() {} } } };
            }
          }
        };
      }
    };
  `;
}

async function run() {
  const html = fs.readFileSync(path.join(publicRoot, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(publicRoot, "app.js"), "utf8");
  assert.match(html, /rankedcoach_boot_visual_v1/);
  assert.match(html, /--rc-boot-base/);
  assert.match(app, /applyProfileVisuals\?\.\(getActiveProfile\(\)\)/);
  assert.match(app, /loginInitializationThemeSignature/);

  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const consoleErrors = [];
    page.on("console", message => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", error => consoleErrors.push(error.message));
    await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", route => route.fulfill({
      contentType: "text/javascript",
      body: supabaseStub()
    }));
    // Slow the application module long enough to inspect the actual first
    // paint guard. This catches a default-theme flash before app.js starts.
    await page.route(`http://127.0.0.1:${port}/app.js*`, async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.continue();
    });
    await page.addInitScript(() => {
      const profile = {
        id: "theme-first-load-profile",
        name: "Theme First Load",
        accountName: "Theme First Load",
        region: "NA",
        themeKey: "royal-purple",
        layoutShape: "default",
        layoutTexture: "default",
        matches: []
      };
      const snapshot = {
        profileId: profile.id,
        themeKey: "royal-purple",
        colors: {
          base: "#10061f",
          base2: "#241047",
          accent: "#a855f7",
          accent2: "#f0abfc"
        }
      };
      localStorage.setItem("valtracker_entry_choice_v1", "guest");
      localStorage.setItem("valtracker_active_profile_id", profile.id);
      localStorage.setItem("valtracker_profiles_v1", JSON.stringify([profile]));
      localStorage.setItem("rankedcoach_boot_visual_v1", JSON.stringify(snapshot));
      globalThis.__themeFirstLoadSamples = [];
      const sample = () => {
        const root = document.documentElement;
        globalThis.__themeFirstLoadSamples.push({
          bootTheme: root.dataset.bootTheme || "",
          bootBase: getComputedStyle(root).getPropertyValue("--rc-boot-base").trim(),
          appBooting: root.classList.contains("app-booting")
        });
        if (globalThis.__themeFirstLoadSamples.length < 18) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });

    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "commit" });
    await page.waitForFunction(() => document.documentElement.dataset.bootTheme === "royal-purple", null, { timeout: 5000 });
    const beforeApp = await page.evaluate(() => ({
      bootTheme: document.documentElement.dataset.bootTheme,
      bootBase: getComputedStyle(document.documentElement).getPropertyValue("--rc-boot-base").trim(),
      browserThemeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute("content") || "",
      appBooting: document.documentElement.classList.contains("app-booting")
    }));
    assert.deepEqual(beforeApp, { bootTheme: "royal-purple", bootBase: "#10061f", browserThemeColor: "#10061f", appBooting: true });

    await page.waitForFunction(() => !document.documentElement.classList.contains("app-booting"), null, { timeout: 20000 });
    await page.waitForFunction(() => document.body.dataset.theme === "royal-purple", null, { timeout: 10000 });
    const afterApp = await page.evaluate(() => ({
      bodyTheme: document.body.dataset.theme,
      bootTheme: document.documentElement.dataset.bootTheme,
      bootBase: getComputedStyle(document.documentElement).getPropertyValue("--rc-boot-base").trim(),
      samples: globalThis.__themeFirstLoadSamples || []
    }));
    assert.equal(afterApp.bodyTheme, "royal-purple", JSON.stringify(afterApp));
    assert.equal(afterApp.bootTheme, "royal-purple", JSON.stringify(afterApp));
    assert.equal(afterApp.bootBase, "#10061f", JSON.stringify(afterApp));
    assert.ok(afterApp.samples.length > 0, JSON.stringify(afterApp));
    assert.ok(afterApp.samples.every(sample => sample.bootTheme === "royal-purple" && sample.bootBase === "#10061f"), JSON.stringify(afterApp));
    assert.deepEqual(consoleErrors, []);
    await page.close();
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log("Theme first-load visual cache check passed.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
