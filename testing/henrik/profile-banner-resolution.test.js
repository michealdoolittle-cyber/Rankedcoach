"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const assetDir = path.join(root, "public", "assets", "profile-banners", "upscaled");

const staticBannerUuids = [...app.matchAll(/media\.valorant-api\.com\/playercards\/([0-9a-f-]{36})\/wideart\.png/gi)]
  .map(match => match[1].toLowerCase());
const uniqueBannerUuids = [...new Set(staticBannerUuids)];

assert.ok(uniqueBannerUuids.length >= 30, `Expected at least 30 curated official banners, found ${uniqueBannerUuids.length}.`);
assert.ok(app.includes("PROFILE_BANNER_UPSCALED_ASSET_BASE"), "Banner high-res path must use local upscaled wide-art assets.");
assert.doesNotMatch(app, /getValorantPlayerCardLargeArtUrl/);
assert.doesNotMatch(app, /return\s+uuid\s+\?\s+getValorantPlayerCardLargeArtUrl/);

for (const uuid of uniqueBannerUuids) {
  const assetPath = path.join(assetDir, `${uuid}.jpg`);
  assert.ok(fs.existsSync(assetPath), `Missing upscaled banner asset for ${uuid}`);
  const data = fs.readFileSync(assetPath);
  assert.equal(data[0], 0xff, `${assetPath} is not a JPEG file.`);
  assert.equal(data[1], 0xd8, `${assetPath} is not a JPEG file.`);

  let offset = 2;
  let width = 0;
  let height = 0;
  while (offset < data.length) {
    if (data[offset] !== 0xff) break;
    const marker = data[offset + 1];
    const length = data.readUInt16BE(offset + 2);
    if (marker >= 0xc0 && marker <= 0xc3) {
      height = data.readUInt16BE(offset + 5);
      width = data.readUInt16BE(offset + 7);
      break;
    }
    offset += 2 + length;
  }
  assert.ok(width >= 3616, `${assetPath} should be wide enough for 1080p+ banner strips.`);
  assert.ok(height >= 1024, `${assetPath} should be tall enough for 1080p+ banner strips.`);
  assert.ok(Math.abs((width / height) - (452 / 128)) < 0.02, `${assetPath} must retain Valorant wide-art banner aspect ratio.`);
}

console.log(`Profile banner resolution passed: ${uniqueBannerUuids.length} local high-res wide-art assets are wired, and largeart is not used for banner strips.`);
