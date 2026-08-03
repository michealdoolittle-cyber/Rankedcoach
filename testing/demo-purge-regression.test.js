"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const appSource = fs.readFileSync(path.resolve(__dirname, "..", "public", "app.js"), "utf8");
const start = appSource.indexOf("function isPlaceholderStatsActLabel");
const end = appSource.indexOf("function computePeakProfileProgress", start);

assert.notEqual(start, -1, "season/demo helper block should exist in app.js");
assert.notEqual(end, -1, "demo fixture helper block should be extractable");

const context = {
  normalizeValorantSeasonLabel(value = "") {
    return String(value || "").trim();
  }
};

vm.createContext(context);
vm.runInContext(`${appSource.slice(start, end)}
this.helpers = { isDemoFixtureMatch, purgeDemoFixtureMatches, getMatchSeasonLabel, getMatchSeasonKey, isHenrikSyncMatch };`, context, {
  filename: "public/app.js demo helpers"
});

const { isDemoFixtureMatch, purgeDemoFixtureMatches, getMatchSeasonLabel, getMatchSeasonKey } = context.helpers;

const realHenrikWithLegacyDemoAct = {
  id: "real-match-1",
  source: "henrik_sync",
  metadata: {
    source: "henrik_sync",
    demoAct: "Demo Season",
    act: "Season 2026 Act 4"
  }
};
const sourceDemo = { id: "demo-match-1", source: "demo-fixture", season: "season-2026-act-4", metadata: { demoAct: "Demo Season" } };
const idDemo = { id: "tutorial_demo_opening", metadata: { act: "Season 2026 Act 4" } };
const legacyDemoActOnly = { id: "old-real-looking-match", metadata: { demoAct: "Demo Season", act: "Season 2026 Act 4" } };

assert.equal(isDemoFixtureMatch(realHenrikWithLegacyDemoAct), false, "Henrik sync matches must never be purged as demos");
assert.equal(getMatchSeasonLabel(realHenrikWithLegacyDemoAct), "Season 2026 Act 4", "real matches with stray demoAct should use their real act label");
assert.equal(isDemoFixtureMatch(sourceDemo), true, "explicit demo fixture source should still be recognized");
assert.equal(getMatchSeasonKey(sourceDemo), "demo-season:demo season", "demo fixtures must namespace season identity so they cannot collide with Riot season ids");
assert.equal(isDemoFixtureMatch(idDemo), true, "tutorial demo IDs should still be recognized");
assert.equal(isDemoFixtureMatch(legacyDemoActOnly), false, "bare demoAct metadata is not enough to mark a match as demo");

const kept = purgeDemoFixtureMatches([realHenrikWithLegacyDemoAct, sourceDemo, idDemo, legacyDemoActOnly]);
assert.deepEqual(kept.map(match => match.id), ["real-match-1", "old-real-looking-match"]);

console.log("Demo purge regression checks passed: Henrik sync data survives stray demoAct metadata.");
