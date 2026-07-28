import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const libraryFiles = [
  "gamesense-maps.js",
  "gamesense-reference.js",
  "gamesense-encyclopedia.js",
  "gamesense-promoted.js",
  "gamesense-map-layout-overrides.js",
  "gamesense-official-media.js",
  "gamesense-vstats-reference.js"
].map(file => path.join(root, "public", "library", file));

const economyForCategory = Object.freeze({
  rifle: "full_eco",
  sniper: "full_eco",
  shotgun: "full_eco",
  pistol: "pistol",
  eco: "2nd_lost"
});

const referenceSuggestions = Object.freeze([
  { weapon: "Vandal", category: "rifle" },
  { weapon: "Operator", category: "sniper" },
  { weapon: "Judge", category: "shotgun" },
  { weapon: "Ghost", category: "pistol" }
]);

function loadLibraryMaps() {
  const context = vm.createContext({ console });
  context.globalThis = context;
  for (const file of libraryFiles) {
    vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
  }
  return context.RankedCoachGamesenseMaps;
}

test("every map weapon recommendation resolves to a retained, verifiable conversion", () => {
  const maps = loadLibraryMaps();
  assert.equal(maps.length, 13, "the dossier must retain all 13 map references");

  for (const map of maps) {
    const reference = map.weaponConversionReference;
    assert.ok(reference?.source?.weaponUrl?.startsWith("https://www.vstats.gg/statistics/"), `${map.id} must retain its VStats weapon source URL`);
    const suggestions = map.weaponSuggestions?.length ? map.weaponSuggestions : referenceSuggestions;
    for (const suggestion of suggestions) {
      const requestedEconomy = economyForCategory[suggestion.category];
      assert.ok(requestedEconomy, `${map.id}/${suggestion.weapon} needs an explicit economy scope`);
      const weaponMetrics = reference.metrics?.[suggestion.weapon];
      const metric = weaponMetrics?.[requestedEconomy] || weaponMetrics?.unknown;
      assert.ok(metric, `${map.id}/${suggestion.weapon} has no measured ${requestedEconomy} or explicit all-round fallback`);
      assert.ok(Number.isFinite(metric.value) && metric.value >= 0 && metric.value <= 100, `${map.id}/${suggestion.weapon} has an invalid conversion value`);
      assert.ok(Number.isFinite(metric.rounds) && metric.rounds > 0, `${map.id}/${suggestion.weapon} has no observed round sample`);
    }
  }
});
