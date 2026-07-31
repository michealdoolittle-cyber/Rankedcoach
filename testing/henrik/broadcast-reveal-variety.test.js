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

[
  "renderBroadcastRadialParticles",
  "renderBroadcastEmberParticles",
  "renderBroadcastBubbleParticles",
  "renderBroadcastSmokeParticles",
  "renderBroadcastBulletImpacts",
  "renderBroadcastLightningBolts",
  "createBroadcastLightningBoltElement"
].forEach(fn => {
  assert.ok(app.includes(`function ${fn}`), `Missing per-variant broadcast renderer: ${fn}`);
});

[
  `variant === "ember"`,
  `variant === "bubble"`,
  `variant === "smoke"`,
  `variant === "bullet"`,
  `variant === "lightning"`
].forEach(branch => {
  assert.ok(app.includes(branch), `particleBurst must branch per variant: ${branch}`);
});

assert.ok(app.includes("RankedCoachBroadcastDebug"), "A debug hook must exist so QA can force each burst variant.");
assert.ok(css.includes(".broadcast-lightning-core"), "Lightning must render as an SVG bolt, not a plain bar.");
assert.ok(css.includes("broadcastTargetFlash"), "Lightning must flash the target frame.");

function extractBlock(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Missing CSS block: ${marker}`);
  const end = source.indexOf("\n}", start);
  assert.notEqual(end, -1, `Unable to read CSS block: ${marker}`);
  return source.slice(start, end);
}

assert.ok(extractBlock(css, "@keyframes broadcastEmberBurst").includes("--ember-y"), "Embers must rise with their own Y path.");
assert.ok(extractBlock(css, "@keyframes broadcastSmokeFlow").includes("--smoke-y"), "Smoke must billow with its own Y path.");
assert.ok(extractBlock(css, "@keyframes broadcastBubbleFloat").includes("--bubble-y"), "Bubbles must float with their own Y path.");
assert.ok(!extractBlock(css, "@keyframes broadcastBulletHoleBurst").includes("--burst-x"), "Bullet holes must not use the shared radial burst vector.");

const png = fs.readFileSync(bulletAsset);
assert.equal(png[0], 0x89, "Bullet-hole asset must be a PNG.");
assert.equal(png[1], 0x50, "Bullet-hole asset must be a PNG.");

console.log("Broadcast reveal variety passed: randomized roll copy and per-variant burst choreography are wired.");
