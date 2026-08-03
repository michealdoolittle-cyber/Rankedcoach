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
  warmupLog: [{ date: "2026-07-12", drillsSelected: ["bots"] }],
  watchedPlaylistVideos: [
    { id: "youtube:abcdefghijk", watchedAt: "2026-07-12T14:00:00.000Z" },
    { id: "youtube:lmnopqrstuv", watchedAt: "2026-07-12T15:00:00.000Z" }
  ]
}, {
  id: "cloud-active",
  puuid: "shared-puuid",
  name: "Cloud Canonical",
  matches: [{ id: "match-b" }],
  warmupLog: [{ date: "2026-07-13", drillsSelected: ["strafe"] }],
  watchedPlaylistVideos: [
    { id: "youtube:abcdefghijk", watchedAt: "2026-07-13T16:00:00.000Z" },
    { id: "twitch:123456789", watchedAt: "2026-07-13T17:00:00.000Z" }
  ]
}], "cloud-active");
assert.equal(consolidated.profiles.length, 1);
assert.equal(consolidated.profiles[0].id, "cloud-active");
assert.equal(consolidated.profiles[0].name, "Cloud Canonical");
assert.deepEqual(consolidated.profiles[0].matches.map(match => match.id), ["match-a", "match-b"]);
assert.deepEqual(consolidated.profiles[0].warmupLog.map(entry => entry.date), ["2026-07-12", "2026-07-13"]);
assert.deepEqual(consolidated.profiles[0].watchedPlaylistVideos, [
  { id: "youtube:lmnopqrstuv", watchedAt: "2026-07-12T15:00:00.000Z" },
  { id: "youtube:abcdefghijk", watchedAt: "2026-07-13T16:00:00.000Z" },
  { id: "twitch:123456789", watchedAt: "2026-07-13T17:00:00.000Z" }
]);
assert.equal(consolidated.idMap["device-a"], "cloud-active");

const boundedWatchHistory = policy.normalizeWatchedPlaylistVideos([
  { id: "not-a-canonical-id", watchedAt: "2026-07-12T00:00:00.000Z" },
  ...Array.from({ length: 1005 }, (_item, index) => ({
    id: `youtube:video-${String(index).padStart(4, "0")}`,
    watchedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString()
  }))
]);
assert.equal(boundedWatchHistory.length, 1000);
assert.equal(boundedWatchHistory[0].id, "youtube:video-0005");
assert.equal(boundedWatchHistory.at(-1).id, "youtube:video-1004");

const compacted = policy.compactProfilesForLocalCache([{
  id: "profile-with-history",
  matches: [{
    id: "match-1",
    rawHenrikPayload: { duplicated: true },
    roundMetrics: [{ round: 1, won: true }],
    matchRecord: {
      rank: { rank: "Diamond 2", rr: 64 },
      rawHenrikPayload: { durable: true },
      roundByRound: [{ round: 1, kills: [{ weapon: "Vandal" }] }]
    }
  }]
}], 1);
assert.deepEqual(compacted[0].matches[0].roundMetrics, [{ round: 1, won: true }]);
assert.deepEqual(compacted[0].matches[0].matchRecord.rank, { rank: "Diamond 2", rr: 64 });
assert.equal("rawHenrikPayload" in compacted[0].matches[0], false);
assert.deepEqual(compacted[0].matches[0].matchRecord.rawHenrikPayload, { durable: true });
assert.equal("roundByRound" in compacted[0].matches[0].matchRecord, false);
assert.equal(compacted[0].matches.length, 1);
assert.equal(policy.compactProfilesForLocalCache(compacted, 3)[0].matches.length, 0);

console.log("Persistence policy checks passed: scoped IDs, archive IDs, row deduplication, bounded batches, profile consolidation, and compact local caches.");
