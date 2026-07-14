"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
for (const file of [
  "public/schema/match-record.js",
  "public/integrations/riot-sync.js",
  "public/data/log-policy.js"
]) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}

const puuid = "placement-player";
const payload = {
  metadata: {
    match_id: "placement-match-1",
    started_at: "2026-07-13T12:00:00.000Z",
    season: { id: "season-2026-a4", short: "e26a4" },
    map: { name: "Haven" }
  },
  players: [{
    puuid,
    team_id: "Blue",
    agent: { id: "sova", name: "Sova" },
    tier: { id: 0, name: "Unrated" },
    stats: { kills: 19, deaths: 15, assists: 8, score: 5100, damage: { dealt: 3300 }, headshots: 11, bodyshots: 25, legshots: 2 }
  }],
  teams: [
    { team_id: "Blue", won: true, rounds: { won: 13, lost: 10 } },
    { team_id: "Red", won: false, rounds: { won: 10, lost: 13 } }
  ],
  rounds: Array.from({ length: 23 }, (_item, index) => ({ id: index, winning_team: index < 13 ? "Blue" : "Red", stats: [] })),
  kills: []
};

const canonical = globalThis.RankedCoachMatchRecord.fromHenrikV4Match(payload, { puuid });
const legacy = globalThis.RankedCoachMatchRecord.toLegacyMatch(canonical);
assert.equal(canonical.isPlacementMatch, true);
assert.equal(legacy.isPlacementMatch, true);
assert.equal(legacy.rrVerified, false);
assert.equal(legacy.result, "win");
assert.deepEqual([legacy.segments[0].stats.kills.value, legacy.segments[0].stats.deaths.value, legacy.segments[0].stats.assists.value], [19, 15, 8]);

const enrichedUnverified = globalThis.RankedCoachRiotSync.enrichLegacyMatchesWithMmr([legacy], [])[0];
assert.equal(enrichedUnverified.isPlacementMatch, true);
assert.equal(enrichedUnverified.metadata.isPlacementMatch, true);
assert.equal(enrichedUnverified.matchRecord.isPlacementMatch, true);
assert.equal(enrichedUnverified.rrVerified, false);

const placeholder = globalThis.RankedCoachLogPolicy.createMatchPlaceholder({
  id: legacy.id,
  createdAt: legacy.createdAt,
  result: legacy.result,
  isPlacementMatch: legacy.isPlacementMatch,
  agent: legacy.agent,
  map: legacy.map
}, "profile-1");
assert.equal(placeholder.isPlacementMatch, true);

const enrichedRanked = globalThis.RankedCoachRiotSync.enrichLegacyMatchesWithMmr([legacy], [{
  match_id: legacy.id,
  tier: { id: 18, name: "Diamond 1" },
  rr: 28,
  last_change: 18,
  elo: 1528,
  date: "2026-07-13T12:30:00.000Z"
}])[0];
assert.equal(enrichedRanked.isPlacementMatch, false);
assert.equal(enrichedRanked.rrVerified, true);
assert.equal(enrichedRanked.verifiedRrDelta, 18);

console.log("Placement match checks passed: tier 0 is distinct from missing RR while result and combat stats remain intact.");
