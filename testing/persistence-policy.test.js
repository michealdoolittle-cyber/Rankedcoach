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
assert.equal(policy.buildMatchArchiveRowId("user-a", "profile-1", "match-1", "RIOT-MATCH-1"), "user-a:riot:riot-match-1");
assert.equal(policy.buildMatchArchiveRowId("user-a", "profile-2", "match-1", "RIOT-MATCH-1"), "user-a:riot:riot-match-1");
assert.equal(policy.buildMatchArchiveRowId("user-a", "profile-2", "manual-1", ""), "user-a:profile-2:manual-1");

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

const compacted = policy.compactProfilesForLocalCache([{
  id: "profile-with-history",
  matches: [{
    id: "match-1",
    roundMetrics: [{ round: 1, won: true }],
    matchRecord: {
      rank: { rank: "Diamond 2", rr: 64 },
      roundByRound: [{ round: 1, kills: [{ weapon: "Vandal" }] }]
    }
  }]
}], 1);
assert.deepEqual(compacted[0].matches[0].roundMetrics, [{ round: 1, won: true }]);
assert.deepEqual(compacted[0].matches[0].matchRecord.rank, { rank: "Diamond 2", rr: 64 });
assert.equal("roundByRound" in compacted[0].matches[0].matchRecord, false);
assert.equal(compacted[0].matches.length, 1);
assert.equal(policy.compactProfilesForLocalCache(compacted, 3)[0].matches.length, 0);

console.log("Persistence policy checks passed: scoped IDs, archive IDs, row deduplication, bounded batches, profile consolidation, and compact local caches.");
