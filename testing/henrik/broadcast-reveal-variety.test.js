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

assert.ok(app.includes('const BROADCAST_BURST_VARIANTS = Object.freeze(["confetti", "rank"]);'), "Broadcast burst variants must be reduced to confetti and rank only.");
assert.ok(css.includes(".broadcast-particle--confetti"), "Confetti particle CSS must remain.");
assert.ok(css.includes(".broadcast-particle--rank"), "Rank particle CSS must remain.");
assert.ok(css.includes("@keyframes broadcastParticleBurst"), "Shared confetti/rank radial keyframes must remain.");
assert.ok(css.includes("@keyframes broadcastRankBurst"), "Rank keyframes must remain.");
assert.ok(app.includes("function renderBroadcastRadialParticles"), "Shared radial renderer must remain for confetti and rank.");
assert.ok(app.includes("RankedCoachBroadcastDebug"), "A debug hook must exist so QA can force the remaining burst variants.");
assert.ok(app.includes("BROADCAST_BURST_VARIANTS.filter(variant => variant !== \"rank\")"), "No-rank fallback must still exclude rank from the random pool.");
assert.ok(app.includes("getBroadcastCinematicTarget"), "Broad page targets must still be redirected to the cinematic target.");

[
  "ember",
  "lightning",
  "bullet",
  "smoke",
  "bubble",
  "ice"
].forEach(variant => {
  assert.ok(!css.includes(`.broadcast-particle--${variant}`), `Removed variant CSS should not remain: ${variant}`);
  assert.ok(!css.includes(`body.broadcast-preview-force-motion .broadcast-particle--${variant}`), `Removed variant preview override should not remain: ${variant}`);
});

[
  "BROADCAST_BULLET_HOLE_ASSET",
  "createBroadcastLightningBoltElement",
  "renderBroadcastEmberParticles",
  "renderBroadcastBubbleParticles",
  "renderBroadcastSmokeParticles",
  "renderBroadcastBulletImpacts",
  "renderBroadcastLightningBolts",
  "renderBroadcastIceShatter",
  "createBroadcastScatteredPoints",
  "setBroadcastParticleFrame",
  "flashBroadcastBurstAnchor"
].forEach(name => {
  assert.ok(!app.includes(name), `Removed broadcast helper/render path should not remain: ${name}`);
});

[
  "broadcastEmberBurst",
  "broadcastEmberAshReveal",
  "broadcastEmberBurnLine",
  "broadcastLightningArc",
  "broadcastBulletHoleBurst",
  "broadcastSmokeFlow",
  "broadcastBubbleFloat",
  "broadcastIceSheetCrack",
  "broadcastIceCrackLines",
  "broadcastIceShard",
  "broadcastTargetFlash",
  "broadcast-lightning-svg",
  "broadcast-lightning-core",
  "broadcast-lightning-glow",
  "broadcast-burst-frame-flash"
].forEach(name => {
  assert.ok(!css.includes(name), `Removed broadcast CSS/keyframe should not remain: ${name}`);
});

[
  `variant === "ember"`,
  `variant === "bubble"`,
  `variant === "smoke"`,
  `variant === "bullet"`,
  `variant === "lightning"`,
  `variant === "ice"`
].forEach(branch => {
  assert.ok(!app.includes(branch), `particleBurst must not branch to removed variant: ${branch}`);
});

assert.ok(!fs.existsSync(bulletAsset), "Bullet-hole broadcast asset should be deleted.");

console.log("Broadcast reveal variety passed: only confetti and rank burst variants remain.");
