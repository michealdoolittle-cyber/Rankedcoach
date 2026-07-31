"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "..");
const reference = fs.readFileSync(path.join(root, "public", "library", "gamesense-reference.js"), "utf8");
const collections = fs.readFileSync(path.join(root, "public", "library", "gamesense-collections.js"), "utf8");
const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");

assert.match(reference, /melee:\s*\{[\s\S]*libraryOnly:\s*true[\s\S]*meleeDamage:\s*\[/);
assert.match(reference, /\{\s*id:\s*"melee",\s*label:\s*"Melee"[\s\S]*weaponIds:\s*\["melee"\]/);
assert.match(collections, /Melee:\s*"2f59173c-4bed-b6c3-2191-dea9b58be9c7"/);

const usageBlock = reference.match(/const currentWeaponUsage = \{([\s\S]*?)\n  \};/)?.[1] || "";
const conversionBlock = reference.match(/const currentWeaponKillConversion = \{([\s\S]*?)\n  \};/)?.[1] || "";
assert.doesNotMatch(usageBlock, /\bmelee\b/i, "Melee must not be added to competitive weapon usage data.");
assert.doesNotMatch(conversionBlock, /\bmelee\b/i, "Melee must not be added to competitive weapon conversion data.");

const statsWeaponFamiliesBlock = app.match(/const STATS_WEAPON_FAMILIES = \[([\s\S]*?)\n\];/)?.[1] || "";
assert.ok(statsWeaponFamiliesBlock, "Stats weapon family list must stay explicit and auditable.");
assert.doesNotMatch(statsWeaponFamiliesBlock, /\bmelee\b/i, "Melee must not render in Stats weapon surfaces.");

console.log("Melee library isolation passed: Library-only data and skin UUID are wired without Stats/economy leakage.");
