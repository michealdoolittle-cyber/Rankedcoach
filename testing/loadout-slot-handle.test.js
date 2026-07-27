"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const indexSource = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const cssSource = fs.readFileSync(path.join(root, "public", "app.css"), "utf8");

const spinButton = indexSource.match(/<button id="spinAgentBtn"[\s\S]*?<\/button>/)?.[0] || "";

assert.match(spinButton, /id="loadoutSlotHandle"/);
assert.match(spinButton, /class="loadout-slot-handle-arm"/);
assert.equal((spinButton.match(/<button\b/gi) || []).length, 1);
assert.match(appSource, /function animateLoadoutSlotHandle\(duration = spinDuration\)/);
assert.match(appSource, /animateLoadoutSlotHandle\(spinDuration\)/);
assert.match(appSource, /animateLoadoutSlotHandle\(700\)/);
assert.match(cssSource, /#spinAgentBtn \.loadout-slot-handle \{/);
assert.match(cssSource, /@keyframes loadoutSlotHandlePull/);
assert.match(cssSource, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?loadout-slot-handle-arm\.is-pulling/);

console.log("Loadout slot handle uses the existing spin control and follows each reel duration.");
