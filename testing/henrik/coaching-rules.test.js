"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const source = fs.readFileSync(path.join(repoRoot, "public", "analytics", "coaching-rules.js"), "utf8");
const humanRules = fs.readFileSync(path.join(repoRoot, "docs", "COACHING-LANGUAGE-RULES.md"), "utf8");
vm.runInThisContext(source, { filename: "public/analytics/coaching-rules.js" });

const engine = globalThis.RankedCoachCoachingRules;
const coverage = engine.getCoverage();
assert.equal(coverage.total, 30);
assert.deepEqual(coverage.categories, {
  maps: 5,
  agents: 5,
  weapons: 5,
  utility: 5,
  teamwork: 5,
  communication: 5
});
assert.ok(coverage.active >= 18);
assert.ok(coverage.blocked >= 1);
engine.RULES.forEach(rule => {
  assert.match(humanRules, new RegExp(`^${rule.sourceRule}\\.`, "m"), `Missing source rule ${rule.sourceRule}`);
});

const context = {
  sample: {
    matchCount: 12,
    logCount: 6,
    label: "Developing sample",
    explanation: "This is a developing read from 12 matches and 6 logs."
  },
  overview: {
    matchesPlayed: 12,
    kd: 1.16,
    winrate: 40,
    hs: 18,
    overallKAST: 61,
    tradeGivenRate: 18,
    tradeReceivedRate: 42,
    damageCoefficientOfVariation: 0.55,
    killsPerMatch: 14
  },
  maps: [
    { map: "Ascent", matchesPlayed: 4, winrate: 25 },
    { map: "Haven", matchesPlayed: 4, winrate: 25 },
    { map: "Lotus", matchesPlayed: 4, winrate: 50 }
  ],
  agents: [
    { agent: "Sova", role: "initiator", matchesPlayed: 6, assists: 12, kd: 1.02 },
    { agent: "Jett", role: "duelist", matchesPlayed: 6, assists: 18, kd: 1.1 }
  ],
  roles: [
    { role: "initiator", matchesPlayed: 6, winrate: 50, deaths: 72 },
    { role: "duelist", matchesPlayed: 6, winrate: 30, deaths: 90 }
  ],
  rankComparison: { metrics: { hsPercent: { direction: "below", benchmark: 24 } } },
  roundSignals: { tradeGivenOpportunities: 30, tradeReceivedOpportunities: 25 },
  currentRole: "initiator",
  advanced: { firstBloodRoundRate: 6 },
  matches: Array.from({ length: 12 }, (_item, index) => ({
    map: ["Ascent", "Haven", "Lotus"][index % 3],
    agent: index % 2 ? "Sova" : "Jett",
    result: index < 5 ? "win" : "loss"
  })),
  weapons: {
    rounds: 120,
    shares: { rifle: 68, sniper: 8, shotgun: 4 },
    families: [{ typeKey: "rifle", rounds: 82, winrate: 42 }]
  },
  utility: { timingAvailable: false, knownRounds: 100, castsPerRound: 1.8 },
  economy: { pistolOpportunities: 8, pistolWinRate: 62.5, postPistolOpportunities: 5, postPistolWinRate: 20 },
  logs: { count: 6, commsEnabledRate: 50, negativeMoodRate: 50, communicationMentions: 3 }
};

const matches = engine.matchRules(context, { maxResults: 8 });
assert.ok(matches.some(match => match.coachingRuleId === "individual-output-team-gap"));
assert.ok(matches.some(match => match.coachingRuleId === "comms-trade-correlation"));
assert.ok(matches.some(match => match.coachingRuleId === "post-pistol-conversion"));
assert.equal(matches.some(match => match.coachingRuleId === "utility-timing"), false);
matches.forEach(match => {
  assert.ok(match.action);
  assert.ok(match.sampleNote);
  assert.equal(typeof match.coachingRuleNumber, "number");
});

const lowData = engine.matchRules({ ...context, sample: { matchCount: 2, logCount: 1 } }, { maxResults: 8 });
assert.deepEqual(lowData, []);

console.log(`Coaching rules passed: ${coverage.total} sourced rules, ${coverage.active} active matchers, low-data suppression preserved.`);
