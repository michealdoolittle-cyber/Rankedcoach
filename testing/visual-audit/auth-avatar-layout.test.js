"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..", "..", "public");
const port = 41783;
const types = {
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
      let relativePath = decodeURIComponent((request.url || "/").split("?")[0]);
      if (relativePath === "/") relativePath = "/index.html";
      const filePath = path.join(root, relativePath);
      if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
      }
      fs.readFile(filePath, (error, data) => {
        if (error) {
          response.writeHead(404);
          response.end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": types[path.extname(filePath)] || "application/octet-stream" });
        response.end(data);
      });
    });
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

function getRect(page, selector) {
  return page.locator(selector).evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  });
}

async function seedAvatarProfile(page, profileBorder, profileBorderRotate) {
  await page.addInitScript(({ profileBorder, profileBorderRotate }) => {
    const profileId = "profile-avatar-layout";
    localStorage.setItem("valtracker_entry_choice_v1", "guest");
    localStorage.setItem("valtracker_active_profile_id", profileId);
    localStorage.setItem("valtracker_profiles_v1", JSON.stringify([{
      id: profileId,
      name: "Avatar Layout Test",
      profileBorder,
      profileBorderColor: "gold",
      profileBorderRotate,
      importSource: "henrik",
      lastSyncSource: "henrik",
      startingRR: 99999,
      matches: [{
        id: "verified-diamond-match",
        matchId: "verified-diamond-match",
        source: "henrik_sync",
        rank: "Diamond 2",
        rrTotal: 54,
        verifiedRrDelta: 17,
        rrVerified: true,
        result: "win",
        createdAt: "2026-07-09T12:00:00Z",
        agent: "Killjoy",
        map: "Haven",
        metadata: {
          source: "henrik_sync",
          rank: "Diamond 2",
          rrVerified: true,
          playedAt: "2026-07-09T12:00:00Z"
        }
      }]
    }]));
  }, { profileBorder, profileBorderRotate });
}

async function run() {
  const server = await startServer();
  const browser = await chromium.launch({ headless: true });
  const mobile = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };

  try {
    const authPage = await browser.newPage(mobile);
    await authPage.addInitScript(() => localStorage.clear());
    await authPage.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
    await authPage.waitForTimeout(500);
    const modalBefore = await getRect(authPage, "#authModal .auth-modal-card");
    const inputBefore = await getRect(authPage, "#authPassword");
    await authPage.click('[data-password-target="authPassword"]');
    const modalAfter = await getRect(authPage, "#authModal .auth-modal-card");
    const inputAfter = await getRect(authPage, "#authPassword");
    assert.deepEqual(modalAfter, modalBefore);
    assert.deepEqual(inputAfter, inputBefore);
    assert.equal(await authPage.locator("#authPassword").getAttribute("type"), "text");
    await authPage.close();

    for (const profile of [
      { profileBorder: "notched", profileBorderRotate: false },
      { profileBorder: "diamond", profileBorderRotate: true }
    ]) {
      const page = await browser.newPage(mobile);
      await seedAvatarProfile(page, profile.profileBorder, profile.profileBorderRotate);
      await page.goto(`http://127.0.0.1:${port}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(650);

      const button = await getRect(page, "#mobileHeaderProfileBtn");
      const frame = await getRect(page, "#mobileHeaderProfileBtn .rc-mobile-avatar-frame");
      const image = await getRect(page, "#mobileHeaderProfileBtn .mobile-header-avatar-img");
      const rankIcon = await getRect(page, "#mobileHeaderProfileBtn .mobile-header-rank-icon");
      const mainAnimation = await page.locator("#mobileHeaderProfileBtn .rc-mobile-frame-main").evaluate(element => getComputedStyle(element).animationName);

      assert.equal(button.width, 52);
      assert.equal(button.height, 52);
      assert.equal(frame.width, 62);
      assert.equal(frame.height, 62);
      assert.equal(image.width, 38);
      assert.equal(image.height, 38);
      assert.ok(frame.x < image.x && frame.y < image.y);
      assert.ok(rankIcon.x > image.x + (image.width / 2));
      assert.ok(rankIcon.y > image.y + (image.height / 2));
      assert.equal(documentWidthOverflow(await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }))), 0);
      if (profile.profileBorderRotate) {
        assert.notEqual(mainAnimation, "none");
        assert.equal(await page.locator("#mobileHeaderProfileBtn .mobile-header-rank-icon").getAttribute("alt"), "Diamond 2");
        assert.equal(await page.locator("#navCurrentTierText").innerText(), "Diamond 2");
      } else {
        assert.equal(mainAnimation, "none");
      }
      await page.close();
    }

    console.log("Auth and avatar layout check passed: password reveal is stable and mobile frames fully cover the avatar.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

function documentWidthOverflow({ scrollWidth, clientWidth }) {
  return Math.max(0, scrollWidth - clientWidth);
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
