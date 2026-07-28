"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");
const roundMetrics = fs.readFileSync(path.join(root, "public", "analytics", "round-metrics.js"), "utf8");
const schema = fs.readFileSync(path.join(root, "public", "schema", "match-record.js"), "utf8");
const layoutCss = fs.readFileSync(path.join(root, "public", "layout-styles.css"), "utf8");

const focusBlock = app.match(/const focusesList = \[([\s\S]*?)\n\];/)?.[1] || "";
const focusCategories = [...focusBlock.matchAll(/"([^"]+)"/g)].map(match => match[1]);
for (const required of [
  "First Contact", "Angle Discipline", "Spacing", "Pacing", "Objective Play",
  "Map Preparation", "Role Teamwork", "Damage Output", "Multi-Kill Conversion",
  "Clutch Discipline", "Self Comms", "Weapon Pattern"
]) {
  assert.ok(focusCategories.includes(required), `${required} must be in the shared Logging focus list`);
}
assert.match(app, /syncLogFocusSelectOptions\(\);\s*setupLogFocusCustomDropdown\(\);/);

assert.match(schema, /opponentPuuids/);
assert.match(roundMetrics, /aliveAllies\.size === 1/);
assert.match(roundMetrics, /clutchKills >= 2/);
assert.doesNotMatch(roundMetrics, /ceremony\.toLowerCase\(\)\.includes\("closer"\)/);

assert.match(html, /id="lensModalStatsTitle">Score Values<\/h3>[\s\S]*id="impactOpportunityTab"/);
assert.match(app, /weightingTitle\.textContent = "Why This Score Changed"/);
assert.match(app, /statsTitle\.textContent = "What Moved This Score"/);

assert.doesNotMatch(app, /scopevignette/);
assert.doesNotMatch(layoutCss, /scopevignette/);
assert.match(app, /available: Boolean\(weeklyMapLossStreak\)/);
assert.match(app, /gamesUsed: weeklyMapLossStreak/);
assert.match(app, /COACHING_COPY_STRUCTURAL_KEYS/);
assert.match(app, /disabled aria-disabled=/);
assert.match(app, /lightBuyWeapons/);
assert.match(app, /firstDeathMultiKillRate/);

console.log(`Coaching language guardrails passed: ${focusCategories.length} shared focus categories, evidence rules, true clutch logic, and UI exclusions are wired.`);
