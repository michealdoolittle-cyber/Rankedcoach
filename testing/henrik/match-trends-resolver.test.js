"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const coachingRulesSource = fs.readFileSync(path.join(repoRoot, "public", "analytics", "coaching-rules.js"), "utf8");
const resolverPath = path.join(repoRoot, "public", "analytics", "match-trends-resolver.js");
const resolverSource = fs.readFileSync(resolverPath, "utf8");

vm.runInThisContext(coachingRulesSource, { filename: "public/analytics/coaching-rules.js" });
vm.runInThisContext(resolverSource, { filename: "public/analytics/match-trends-resolver.js" });

const resolver = globalThis.RankedCoachMatchTrendsResolver;
assert.ok(resolver?.resolveMatchTrends, "Match Trends Resolver should publish resolveMatchTrends().");
assert.doesNotMatch(resolver.resolveMatchTrends.toString(), /\.logs\b|\blogs\b/i, "Resolver must not inspect reflection data.");
assert.doesNotMatch(resolverSource, /\.logs\b|\blogs\b/i, "Resolver module must stay stats-only by construction.");

function makeMatch(index, overrides = {}) {
  return {
    result: index < 4 ? "loss" : "win",
    agent: "Sova",
    role: "Initiator",
    map: "Ascent",
    kills: index < 4 ? 9 : 18,
    deaths: index < 4 ? 15 : 10,
    assists: index < 4 ? 2 : 8,
    acs: index < 4 ? 165 : 245,
    adr: index < 4 ? 110 : 165,
    hs: index < 4 ? 18 : 30,
    ...overrides
  };
}

const ascentSovaMatches = Array.from({ length: 8 }, (_item, index) => makeMatch(index));
const havenJettMatches = Array.from({ length: 8 }, (_item, index) => makeMatch(index, {
  result: index < 4 ? "win" : "loss",
  agent: "Jett",
  role: "Duelist",
  map: "Haven",
  kills: index < 4 ? 18 : 11,
  deaths: index < 4 ? 11 : 15,
  assists: index < 4 ? 4 : 2,
  acs: index < 4 ? 250 : 175,
  adr: index < 4 ? 170 : 120,
  hs: index < 4 ? 28 : 20
}));

const context = {
  overview: {
    matchesPlayed: 16,
    winrate: 50,
    kd: 1.05,
    acs: 208,
    hs: 24,
    fullBuyWinRate: 68,
    lightBuyWinRate: 42,
    ecoWinRate: 28
  },
  agents: [
    { agent: "Sova", role: "Initiator", matchesPlayed: 8, matchesWon: 4, matchesLost: 4, winrate: 50, kd: 1.16, acs: 205, hs: 24, assists: 40 },
    { agent: "Jett", role: "Duelist", matchesPlayed: 8, matchesWon: 4, matchesLost: 4, winrate: 50, kd: 1.13, acs: 212, hs: 24, assists: 24 }
  ],
  maps: [
    { map: "Ascent", matchesPlayed: 8, matchesWon: 4, matchesLost: 4, winrate: 50, kd: 1.16, acs: 205, adr: 138 },
    { map: "Haven", matchesPlayed: 8, matchesWon: 4, matchesLost: 4, winrate: 50, kd: 1.13, acs: 212, adr: 145 }
  ],
  roles: [
    { role: "Initiator", matchesPlayed: 8, matchesWon: 4, matchesLost: 4, winrate: 50, kd: 1.16, acs: 205, hs: 24, assists: 40, deaths: 100 },
    { role: "Duelist", matchesPlayed: 8, matchesWon: 4, matchesLost: 4, winrate: 50, kd: 1.13, acs: 212, hs: 24, assists: 24, deaths: 104 }
  ],
  matches: [...ascentSovaMatches, ...havenJettMatches],
  rankComparison: {
    metrics: {
      winRate: { label: "Win rate", shortLabel: "WR", value: 50, benchmark: 50, direction: "near" },
      kd: { label: "Kill/death ratio", shortLabel: "K/D", value: 1.05, benchmark: 1.03, direction: "near" },
      acs: { label: "Average combat score", shortLabel: "ACS", value: 208, benchmark: 219, direction: "below" },
      hsPercent: { label: "Headshot percentage", shortLabel: "HS%", value: 24, benchmark: 25.2, direction: "near" }
    }
  },
  economy: {
    pistolOpportunities: 8,
    pistolWinRate: 75,
    postPistolOpportunities: 6,
    postPistolWinRate: 33
  },
  weapons: {
    rounds: 180,
    shares: { rifle: 66, pistol: 18 },
    families: [{ typeKey: "rifle", label: "Rifle", rounds: 120, winrate: 56 }]
  }
};

const cards = resolver.resolveMatchTrends(context);

assert.ok(cards.length > 0, "Resolver should emit anchored cards.");
assert.ok(cards.some(card => card.sliceType === "agent"), "Expected an agent-slice card.");
assert.ok(cards.some(card => card.sliceType === "map"), "Expected a map-slice card.");
assert.ok(cards.some(card => card.sliceType === "economy"), "Expected an economy-slice card.");
assert.equal(cards.some(card => card.sliceType === "role" && card.metricKey === "winRate" && card.tone === "up"), false, "Agent win-rate card should suppress redundant broader role win-rate card.");

cards.forEach((card) => {
  const visibleLine = `${card.value || ""} ${card.preview || ""} ${card.detail || ""}`;
  assert.match(visibleLine, /vs|anchored|rank average|baseline/i, `Card ${card.id} must show an anchor.`);
  assert.ok(card.benchmark, `Card ${card.id} needs benchmark copy.`);
  assert.ok(Array.isArray(card.proofItems) && card.proofItems.length >= 3, `Card ${card.id} needs proof items.`);
  assert.doesNotMatch(`${card.title} ${card.preview} ${card.why} ${card.action} ${card.detail}`, /\bGold\b|\bPlatinum\b|\bDiamond\b|points|check back|keep playing (the same )?(agent|role)/i);
});

console.log(`match-trends-resolver: ${cards.length} anchored cards`);
