"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");

function loadBrowserScript(relativePath) {
  const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  vm.runInThisContext(source, { filename: relativePath });
}

loadBrowserScript("public/analytics/round-metrics.js");
loadBrowserScript("public/data/rank-benchmarks.js");

const me = "player-me";
const teammate = "player-teammate";
const enemy = "player-enemy";
const record = {
  id: "formula-fixture",
  trackedPlayer: {
    puuid: me,
    teammatePuuids: [teammate]
  },
  roundByRound: [
    { roundNum: 1, side: "attack", kills: [] },
    {
      roundNum: 2,
      side: "attack",
      kills: [
        { killer: enemy, victim: me, assistants: [], roundTime: 40000 },
        { killer: teammate, victim: enemy, assistants: [], roundTime: 44999 }
      ]
    },
    {
      roundNum: 3,
      side: "defense",
      kills: [
        { killer: enemy, victim: me, assistants: [], roundTime: 30000 },
        { killer: teammate, victim: enemy, assistants: [], roundTime: 35001 }
      ]
    },
    {
      roundNum: 4,
      side: "defense",
      kills: [{ killer: teammate, victim: enemy, assistants: [me], roundTime: 22000 }]
    }
  ]
};

const match = globalThis.RankedCoachRoundMetrics.computeMatchKast(record);
assert.equal(match.overall.qualifyingRounds, 3);
assert.equal(match.overall.totalRounds, 4);
assert.equal(match.overall.percentage, 75);
assert.equal(match.overall.tradeSavedRounds, 1);
assert.equal(match.overall.tradeOnlyRounds, 1);
assert.equal(match.attack.percentage, 100);
assert.equal(match.defense.percentage, 50);

const aggregate = globalThis.RankedCoachRoundMetrics.aggregateMatchKast([record, record]);
assert.equal(aggregate.matches, 2);
assert.equal(aggregate.overall.qualifyingRounds, 6);
assert.equal(aggregate.overall.totalRounds, 8);
assert.equal(aggregate.overall.percentage, 75);

const signalRecord = {
  id: "round-signal-fixture",
  trackedPlayer: {
    puuid: me,
    teammatePuuids: [teammate],
    opponentPuuids: ["enemy-a", "enemy-b", "enemy-c", "enemy-d", "enemy-e"],
    behaviorFactors: { afkRounds: 1, stayedInSpawnRounds: 1 }
  },
  roundByRound: [
    {
      roundNum: 1,
      side: "attack",
      won: true,
      roundCeremony: "CeremonyCloser",
      damageDealt: 100,
      wasAfk: true,
      kills: [
        { killer: "enemy-a", victim: teammate, assistants: [], roundTime: 1000 },
        { killer: me, victim: "enemy-a", assistants: [], roundTime: 3000 },
        { killer: me, victim: "enemy-b", assistants: [], roundTime: 5000 },
        { killer: me, victim: "enemy-c", assistants: [], roundTime: 7000 },
        { killer: me, victim: "enemy-d", assistants: [], roundTime: 9000 },
        { killer: me, victim: "enemy-e", assistants: [], roundTime: 11000 }
      ]
    },
    {
      roundNum: 2,
      side: "defense",
      won: false,
      roundCeremony: "CeremonyDefault",
      damageDealt: 300,
      stayedInSpawn: true,
      kills: []
    }
  ]
};
const signals = globalThis.RankedCoachRoundMetrics.computeMatchRoundMetrics(signalRecord);
assert.equal(signals.clutchRounds, 1);
assert.equal(signals.clutchWins, 1);
assert.equal(signals.clutchDefinition, "1vX multi-kill");
assert.equal(signals.multiKills.kills5K, 1);
assert.equal(signals.trade.givenOpportunities, 1);
assert.equal(signals.trade.givenRounds, 1);
assert.equal(signals.damage.mean, 200);
assert.equal(signals.damage.standardDeviation, 100);
assert.equal(signals.discipline.afkRounds, 1);
assert.equal(signals.discipline.stayedInSpawnRounds, 1);
assert.equal(signals.discipline.affected, true);

const falseCloser = globalThis.RankedCoachRoundMetrics.computeMatchRoundMetrics({
  id: "false-closer-fixture",
  trackedPlayer: {
    puuid: me,
    teammatePuuids: [teammate],
    opponentPuuids: ["enemy-a", "enemy-b"]
  },
  roundByRound: [{
    roundNum: 1,
    side: "attack",
    won: true,
    roundCeremony: "CeremonyCloser",
    kills: [
      { killer: teammate, victim: "enemy-a", assistants: [], roundTime: 1000 },
      { killer: me, victim: "enemy-b", assistants: [], roundTime: 3000 }
    ]
  }]
});
assert.equal(falseCloser.clutchRounds, 0);
assert.equal(falseCloser.clutchWins, 0);

const situationalRecord = {
  id: "situational-fixture",
  agent: "Jett",
  map: "Breeze",
  trackedPlayer: {
    puuid: me,
    teammatePuuids: [teammate]
  },
  roundByRound: [
    {
      roundNum: 1,
      playerEconomy: { loadoutValue: 1200 },
      combatantEconomies: [{ subject: enemy, teamId: "enemy", loadoutValue: 3400 }],
      teammateUtilityCasts: 0,
      kills: [{ killer: enemy, victim: me, roundTime: 8000 }]
    },
    {
      roundNum: 2,
      playerEconomy: { loadoutValue: 3500 },
      combatantEconomies: [{ subject: enemy, teamId: "enemy", loadoutValue: 3100 }],
      teammateUtilityCasts: 2,
      kills: [
        { killer: enemy, victim: me, roundTime: 12000 },
        { killer: teammate, victim: enemy, roundTime: 14000 }
      ]
    }
  ]
};
const situationalFlags = globalThis.RankedCoachRoundMetrics.deriveSituationalCoachingFlags(situationalRecord);
assert.deepEqual(situationalFlags.map(flag => flag.pattern), [
  "untraded-death",
  "economy-mismatched-engagement",
  "early-entry-before-utility"
]);
assert.ok(situationalFlags.every(flag => flag.agent === "Jett" && flag.map === "Breeze" && flag.matchId === "situational-fixture"));
assert.equal(globalThis.RankedCoachRoundMetrics.computeMatchRoundMetrics(situationalRecord).situationalFlags.length, 3);

const gold = globalThis.RankedCoachRankBenchmarks.compareRankMetrics("Gold 2", {
  hsPercent: 22.7,
  acs: 213,
  kd: 1.03
});
assert.equal(gold.rankKey, "gold");
assert.equal(gold.metrics.hsPercent.direction, "near");
assert.equal(gold.source.provisional, true);
assert.equal(globalThis.RankedCoachRankBenchmarks.compareRankMetrics("Radiant", {}), null);
assert.equal(globalThis.RankedCoachRankBenchmarks.compareRankMetrics("Immortal 3", {}), null);

console.log("Henrik formula checks passed: KAST, clutch/ace, discipline, trades, situational flags, damage variance, and benchmark gaps preserved.");
