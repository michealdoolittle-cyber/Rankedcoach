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

console.log("Henrik formula checks passed: 3/4 KAST, 1 trade save, benchmark gaps preserved.");
