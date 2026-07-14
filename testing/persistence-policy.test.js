"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.resolve(__dirname, "..", "public", "data", "persistence-policy.js"),
  "utf8"
);
vm.runInThisContext(source, { filename: "public/data/persistence-policy.js" });

const policy = globalThis.RankedCoachPersistencePolicy;
const firstId = policy.buildScopedMatchRowId("user-a", "profile-1", "match-1");
const secondId = policy.buildScopedMatchRowId("user-b", "profile-1", "match-1");
const thirdId = policy.buildScopedMatchRowId("user-a", "profile-2", "match-1");
assert.equal(firstId, "user-a:profile-1:match-1");
assert.notEqual(firstId, secondId);
assert.notEqual(firstId, thirdId);

const deduped = policy.dedupeRowsById([
  { id: firstId, value: 1 },
  { id: firstId, value: 2 },
  { id: secondId, value: 3 }
]);
assert.equal(deduped.length, 2);
assert.equal(deduped[0].value, 2);
assert.deepEqual(policy.chunkRows(Array.from({ length: 14 }, (_item, id) => ({ id })), 6).map(batch => batch.length), [6, 6, 2]);

const consolidated = policy.consolidateProfiles([{
  id: "device-a",
  puuid: "shared-puuid",
  name: "Old Device Copy",
  matches: [{ id: "match-a" }],
  warmupLog: [{ date: "2026-07-12", drillsSelected: ["bots"] }]
}, {
  id: "cloud-active",
  puuid: "shared-puuid",
  name: "Cloud Canonical",
  matches: [{ id: "match-b" }],
  warmupLog: [{ date: "2026-07-13", drillsSelected: ["strafe"] }]
}], "cloud-active");
assert.equal(consolidated.profiles.length, 1);
assert.equal(consolidated.profiles[0].id, "cloud-active");
assert.equal(consolidated.profiles[0].name, "Cloud Canonical");
assert.deepEqual(consolidated.profiles[0].matches.map(match => match.id), ["match-a", "match-b"]);
assert.deepEqual(consolidated.profiles[0].warmupLog.map(entry => entry.date), ["2026-07-12", "2026-07-13"]);
assert.equal(consolidated.idMap["device-a"], "cloud-active");

console.log("Persistence policy checks passed: scoped IDs, row deduplication, bounded batches, and cross-device profile consolidation.");
