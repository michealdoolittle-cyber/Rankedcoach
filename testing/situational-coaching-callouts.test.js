"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const librarySource = fs.readFileSync(path.join(root, "public", "library", "gamesense-library.js"), "utf8");

assert.match(appSource, /function renderImpactResearchCallout\(node, \{ match, snapshot, impactScore \} = \{\}\)/);
assert.match(appSource, /if \(impactScore >= 60\) return;/);
assert.match(appSource, /deriveSituationalCoachingFlags/);
assert.match(appSource, /entry\?\.category === "agent-map"[\s\S]*entry\?\.entity[^\n]*expectedEntity/);
assert.doesNotMatch(appSource, /pattern:\s*flags|JSON\.stringify\(flags\)|situationalFlags:\s*flags/);
assert.match(librarySource, /item\.category === "agent-map"[\s\S]*\.split\("\\u00b7"\)[\s\S]*\.includes\(normalizedEntity\)/);
console.log("Situational coaching callout guards passed: low-impact, exact agent-map only, and no detector internals in modal output.");
