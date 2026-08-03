"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const schemaSource = fs.readFileSync(path.resolve(__dirname, "..", "public", "schema", "match-record.js"), "utf8");
const context = {
  console,
  Date,
  Math,
  JSON,
  structuredClone,
  globalThis: {}
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(schemaSource, context, { filename: "public/schema/match-record.js" });

const MatchRecord = context.RankedCoachMatchRecord;
assert.ok(MatchRecord, "RankedCoachMatchRecord should be exposed");

const puuid = "tracked-puuid";
const classicUuid = "29a0cfab-485b-f5d5-779a-b59f85e204a8";
const henrikPayload = {
  data: {
    metadata: {
      match_id: "raw-henrik-match-1",
      started_at: "2026-08-03T01:23:45.000Z",
      season: { id: "season-2026-act-4", short: "E11A4" },
      map: { name: "Lotus" }
    },
    players: [
      {
        puuid,
        team_id: "Blue",
        agent: { name: "Skye", id: "skye-agent-id" },
        tier: { id: 0, name: "Unranked" },
        stats: {
          kills: 2,
          deaths: 1,
          assists: 3,
          score: 4800,
          damage: { dealt: 2600 },
          headshots: 4,
          bodyshots: 8,
          legshots: 0
        },
        behavior: {}
      },
      {
        puuid: "enemy-puuid",
        team_id: "Red",
        agent: { name: "Jett" },
        tier: { id: 15, name: "Platinum 3" },
        stats: { kills: 1, deaths: 2, assists: 0, score: 3200, damage: { dealt: 900 }, headshots: 1, bodyshots: 4, legshots: 1 }
      }
    ],
    teams: [
      { team_id: "Blue", won: true, rounds: { won: 13, lost: 7 } },
      { team_id: "Red", won: false, rounds: { won: 7, lost: 13 } }
    ],
    rounds: [
      {
        id: 0,
        winning_team: "Blue",
        stats: [{
          player: { puuid },
          economy: {
            weapon: { id: classicUuid, name: "Classic", type: "Sidearm" },
            armor: { name: "Light Shields" },
            loadout_value: 800,
            remaining: 100
          },
          stats: { score: 240 },
          damage_events: [{ damage: 120 }],
          ability_casts: {}
        }]
      },
      {
        id: 1,
        winning_team: "Blue",
        stats: [{
          player: { puuid },
          economy: {
            weapon: { id: "vandal-uuid", name: "Vandal", type: "Rifle" },
            armor: { name: "Heavy Shields" },
            loadout_value: 3900,
            remaining: 500
          },
          stats: { score: 240 },
          damage_events: [{ damage: 140 }],
          ability_casts: {}
        }]
      }
    ],
    kills: [
      { round: 0, killer: { puuid }, victim: { puuid: "enemy-puuid" }, weapon: { id: classicUuid, name: "Classic", type: "Sidearm" } },
      { round: 1, killer: { puuid }, victim: { puuid: "enemy-puuid" }, weapon: { id: "vandal-uuid", name: "Vandal", type: "Rifle" } }
    ]
  }
};

const record = MatchRecord.fromHenrikV4Match(henrikPayload, { puuid });
assert.equal(record.source, "henrik_sync");
assert.deepEqual(record.rawHenrikPayload, henrikPayload, "raw Henrik payload should be stored intact");
assert.equal(record.rawPayloadComplete, true, "complete raw payload should be marked complete");
assert.equal(Math.round(record.stats.hsPercent), 33, "HS percent should be derived from shot-location stats");

const staleRecord = {
  ...record,
  stats: { ...record.stats, hsPercent: null },
  rawHenrikPayload: record.rawHenrikPayload
};
const rederived = MatchRecord.rederiveFromStoredRawHenrikPayload(staleRecord, { puuid });
assert.equal(Math.round(rederived.stats.hsPercent), 33, "rederive should recover HS from stored raw payload without a network fetch");
assert.equal(rederived.rawPayloadComplete, true);

const legacy = MatchRecord.toLegacyMatch(MatchRecord.emptyRecord({
  source: "henrik_sync",
  id: "null-hs-match",
  matchId: "null-hs-match",
  stats: { kills: 1, deaths: 1, assists: 0, acs: 100, adr: 100, hsPercent: null }
}));
assert.equal(legacy.segments[0].stats.headshotsPercentage.value, null, "null HS should stay null, not Number(null) => 0");

console.log("Raw Henrik payload storage and headshot rederive checks passed.");
