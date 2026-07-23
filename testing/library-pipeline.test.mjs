import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
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
  for (const [slug, count] of Object.entries(expected)) {
    const draft = await readDraft("map", slug);
    assert.equal(draft.callouts.length, count);
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

test("baked label maps suppress the second dynamic label layer", async () => {
  const source = await readFile(path.join(ROOT, "public", "library", "gamesense-library.js"), "utf8");
  assert.match(source, /map\.calloutLabelsBakedIn\s*\?\s*\[\]/);
  for (const [slug, count] of Object.entries({ bind: 24, breeze: 23 })) {
    const svg = await readFile(path.join(ROOT, "public", "assets", "library", "maps", `${slug}-layout-labeled.svg`), "utf8");
    assert.equal((svg.match(/<circle /g) || []).length, count);
    assert.equal((svg.match(/<text /g) || []).length, count);
  }
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
