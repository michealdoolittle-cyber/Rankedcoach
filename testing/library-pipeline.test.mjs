import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import {
  DRAFT_ROOT,
  ROOT,
  canPromote,
  loadLibraryState
} from "../scripts/library-pipeline-core.mjs";
import { diffLibraryEntitySnapshots } from "../worker/content-automation.mjs";

async function readDraft(category, slug) {
  return JSON.parse(await readFile(path.join(DRAFT_ROOT, `${category}-${slug}.json`), "utf8"));
}

test("full current roster is represented by governed drafts", async () => {
  const state = await loadLibraryState();
  const weapons = (state.reference.weapons || []).flatMap(group => group.weapons || []);
  assert.equal(state.reference.agents.length, 29);
  assert.equal(state.maps.length, 13);
  assert.equal(weapons.length, 19);
  assert.equal(new Set(state.reference.agents.map(agent => agent.id)).size, 29);
  assert.equal(new Set(state.maps.map(map => map.id)).size, 13);
  assert.equal(new Set(weapons.map(weapon => weapon.id)).size, 19);
});

test("Raze is one authored entity with canonical abilities", async () => {
  const state = await loadLibraryState();
  const razes = state.reference.agents.filter(agent => agent.id === "raze");
  assert.equal(razes.length, 1);
  assert.match(razes[0].fundamentals[0], /Boom Bot and Paint Shells/);
  assert.equal(razes[0].abilities.length, 4);
  assert.deepEqual(new Set(razes[0].abilities.map(ability => ability.name)), new Set([
    "Boom Bot", "Blast Pack", "Paint Shells", "Showstopper"
  ]));
});

test("Bind, Breeze, and Split have complete governed callouts", async () => {
  const expected = { bind: 24, breeze: 23, split: 24 };
  const authoredState = await loadLibraryState({ includePromoted: false });
  const promotedState = await loadLibraryState();
  for (const [slug, count] of Object.entries(expected)) {
    const draft = await readDraft("map", slug);
    const authored = authoredState.maps.find(map => map.id === slug);
    const promoted = promotedState.maps.find(map => map.id === slug);
    assert.equal(draft.callouts.length, count);
    assert.equal(authored.callouts.length, count);
    assert.equal(promoted.callouts.length, count);
    assert.deepEqual(promoted.callouts, draft.callouts);
    assert.equal(draft.calloutLabelsBakedIn, true);
    assert.equal(draft._fieldMeta.callouts.positions._tier, "canonical");
    assert.equal(draft._fieldMeta.callouts.labels._tier, "synthesized");
    assert.equal(draft._fieldMeta.callouts.positions.approved, true);
    assert.equal(draft._fieldMeta.callouts.labels._sources.length, 3);
  }
  const bind = await readDraft("map", "bind");
  assert.equal(bind.callouts.find(item => item.sourceLabel === "A Bath").label, "A Showers");
  assert.equal(bind.callouts.find(item => item.sourceLabel === "B Window").label, "B Hookah");
});

test("corrected baseline reset is logged, locked, and tied to one final batch", async () => {
  const reset = JSON.parse(await readFile(path.join(DRAFT_ROOT, "baseline-reset-2026-07-24.json"), "utf8"));
  const marker = JSON.parse(await readFile(path.join(DRAFT_ROOT, ".baseline-promotion-complete.json"), "utf8"));
  assert.equal(reset.directive, "notes/promotion-sequencing-bug-2026-07-24.md");
  assert.equal(reset.archivedMarker.completedAt, "2026-07-23T19:15:24.047Z");
  assert.equal(marker.directive, reset.directive);
  assert.equal(marker.resetLog, "public/library/_drafts/baseline-reset-2026-07-24.json");
  assert.equal(marker.promotedEntities, 61);
  assert.equal(marker.batch.draftCount, 61);
  assert.equal(marker.batch.oldestGeneratedAt, marker.batch.newestGeneratedAt);
  assert.match(marker.batch.sha256, /^[a-f0-9]{64}$/);

  const retry = spawnSync(process.execPath, [
    "scripts/promote-library-drafts.mjs",
    "--baseline",
    "--skip-notify"
  ], {
    cwd: ROOT,
    encoding: "utf8"
  });
  assert.notEqual(retry.status, 0);
  assert.match(`${retry.stdout}\n${retry.stderr}`, /one-time baseline auto-promotion has already been used/i);
});

test("governed Library source scripts share a current cache key", async () => {
  const index = await readFile(path.join(ROOT, "public", "index.html"), "utf8");
  const files = ["gamesense-maps", "gamesense-reference", "gamesense-promoted", "gamesense-vstats-reference"];
  const versions = files.map(file => {
    const match = index.match(new RegExp(`library/${file}\\.js\\?v=([^"']+)`));
    assert.ok(match?.[1], `${file} needs a cache key`);
    return match[1];
  });
  assert.equal(new Set(versions).size, 1, `Library source cache keys drifted: ${versions.join(", ")}`);
});

test("baked label maps suppress the second dynamic label layer", async () => {
  const source = await readFile(path.join(ROOT, "public", "library", "gamesense-library.js"), "utf8");
  assert.match(source, /map\.calloutLabelsBakedIn\s*\?\s*\[\]/);
  for (const [slug, count] of Object.entries({ bind: 24, breeze: 23 })) {
    const svg = await readFile(path.join(ROOT, "public", "assets", "library", "maps", `${slug}-layout-labeled.svg`), "utf8");
    assert.equal((svg.match(/<circle /g) || []).length, count);
    assert.equal((svg.match(/<text /g) || []).length, count);
  }
});

test("plant guidance never presents a site-centre placeholder as a named plant", async () => {
  const state = await loadLibraryState();
  const genericLabels = state.maps.flatMap(map => (map.plantSpots || [])
    .filter(spot => /^[ABC]\s+Site$/i.test(String(spot?.label || "")))
    .map(spot => `${map.id}:${spot.label}`));
  assert.deepEqual(genericLabels, []);

  const sourceLimitedMaps = ["abyss", "ascent", "corrode", "fracture", "haven", "icebox", "lotus", "pearl", "summit", "sunset"];
  for (const id of sourceLimitedMaps) {
    const map = state.maps.find(item => item.id === id);
    assert.deepEqual(map?.plantSpots || [], [], `${id} must not draw an unsourced marker`);
    assert.match(String(map?.plantRateNote || ""), /source-verified|Dignitas/i, `${id} must explain the honest plant-location state`);
  }
  assert.match(state.maps.find(map => map.id === "ascent")?.plantRateNote || "", /A Dice.*B Market/i);
  assert.match(state.maps.find(map => map.id === "haven")?.plantRateNote || "", /A Default.*C Long/i);
  assert.match(state.maps.find(map => map.id === "icebox")?.plantRateNote || "", /A Generator.*B Top/i);
});

test("a reviewed flat map layout survives the generated layout override", async () => {
  const [mapsSource, promotedSource, overrideSource, generatorSource] = await Promise.all([
    readFile(path.join(ROOT, "public", "library", "gamesense-maps.js"), "utf8"),
    readFile(path.join(ROOT, "public", "library", "gamesense-promoted.js"), "utf8"),
    readFile(path.join(ROOT, "public", "library", "gamesense-map-layout-overrides.js"), "utf8"),
    readFile(path.join(ROOT, "scripts", "build-official-map-layouts.mjs"), "utf8")
  ]);
  const sandbox = {};
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(mapsSource, sandbox, { filename: "gamesense-maps.js" });
  vm.runInContext(promotedSource, sandbox, { filename: "gamesense-promoted.js" });
  vm.runInContext(overrideSource, sandbox, { filename: "gamesense-map-layout-overrides.js" });

  const split = sandbox.RankedCoachGamesenseMaps.find(map => map.id === "split");
  assert.equal(split.layoutImage, "/assets/library/maps/split-layout-trn.png");
  assert.match(generatorSource, /function isHandVerifiedFlatLayout\(/);
  assert.match(generatorSource, /if \(!preserveFlatLayout\) \{/);
  assert.match(generatorSource, /preserveFlatLayout \? \{\} : \{ layoutImage:/);
});

test("new weapon entities append once, then merge after promotion", async () => {
  const bandit = await readDraft("weapon", "bandit");
  assert.equal(bandit._meta.groupId, "sidearms");
  assert.equal(bandit.cost, 600);
  assert.equal(bandit.damageRanges.length, 3);
  const state = await loadLibraryState();
  const sidearms = state.reference.weapons.find(group => group.id === "sidearms");
  const alreadyPromoted = sidearms.weapons.some(weapon => weapon.id === "bandit");
  assert.equal(bandit._meta.operation, alreadyPromoted ? "merge" : "append");
});

test("synthesized promotion requires approval and three sources", () => {
  assert.equal(canPromote({ _tier: "canonical", approved: true, _sources: [] }), true);
  assert.equal(canPromote({ _tier: "synthesized", approved: false, _sources: ["a", "b", "c"] }), false);
  assert.equal(canPromote({ _tier: "synthesized", approved: true, _sources: ["a", "b"] }), false);
  assert.equal(canPromote({ _tier: "synthesized", approved: true, _sources: ["a", "b", "c"] }), true);
});

test("entity diff detects additions, removals, and canonical changes", () => {
  const previous = {
    agents: [{ uuid: "a", label: "Alpha", fingerprint: "1" }],
    maps: [{ uuid: "m", label: "Map", fingerprint: "1" }],
    weapons: [{ uuid: "w", label: "Weapon", fingerprint: "1" }]
  };
  const current = {
    agents: [{ uuid: "a", label: "Alpha", fingerprint: "2" }, { uuid: "b", label: "Beta", fingerprint: "1" }],
    maps: [],
    weapons: [{ uuid: "w", label: "Weapon", fingerprint: "1" }]
  };
  const diff = diffLibraryEntitySnapshots(previous, current);
  assert.deepEqual(diff.agents.added.map(item => item.uuid), ["b"]);
  assert.deepEqual(diff.agents.changed.map(item => item.uuid), ["a"]);
  assert.deepEqual(diff.maps.removed.map(item => item.uuid), ["m"]);
  assert.equal(diff.weapons.changed.length, 0);
});

test("the retired encyclopedia entry point cannot write live content", async () => {
  const source = await readFile(path.join(ROOT, "scripts", "generate-gamesense-encyclopedia.mjs"), "utf8");
  assert.doesNotMatch(source, /const\s+mapGuides|writeFile\s*\(/);
  assert.match(source, /generate-library-drafts\.mjs/);
});
