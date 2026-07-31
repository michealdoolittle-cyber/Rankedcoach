"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "public", "app.css"), "utf8");
const bulletAsset = path.join(root, "public", "assets", "broadcast", "bullet-hole.png");

[
  "Locked In",
  "Locked N' Loaded",
  "Match Ready",
  "Loadout Locked",
  "Zeroed In",
  "Dialed In",
  "Flow-State Prepped"
].forEach(line => {
  assert.ok(app.includes(`"${line}"`), `Missing roll reveal stamp line: ${line}`);
});

[
  "confetti",
  "ember",
  "rank",
  "lightning",
  "bullet",
  "smoke",
  "bubble"
].forEach(variant => {
  assert.ok(app.includes(`"${variant}"`), `Missing broadcast burst variant in app.js: ${variant}`);
  assert.ok(css.includes(`broadcast-particle--${variant}`), `Missing broadcast particle CSS for ${variant}`);
});

assert.ok(app.includes("getBroadcastRollStampText()"), "Roll reveal must use randomized stamp copy.");
assert.ok(app.includes("BROADCAST_BULLET_HOLE_ASSET"), "Bullet-hole burst asset must be wired.");
assert.ok(fs.existsSync(bulletAsset), "Bullet-hole broadcast asset is missing.");

const png = fs.readFileSync(bulletAsset);
assert.equal(png[0], 0x89, "Bullet-hole asset must be a PNG.");
assert.equal(png[1], 0x50, "Bullet-hole asset must be a PNG.");

console.log("Broadcast reveal variety passed: randomized roll copy and burst variants are wired.");
