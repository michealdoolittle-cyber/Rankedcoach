"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const baseUrl = String(process.env.HENRIK_BASE_URL || "http://127.0.0.1:8788").replace(/\/$/, "");
const matchId = "145aceda-cda0-47ce-a177-0eae09a9fd06";
const puuid = "fdc507ce-cd41-5236-8962-fce4ac427e12";

function loadBrowserScript(relativePath) {
  const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  vm.runInThisContext(source, { filename: relativePath });
}

async function postJson(route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  assert.equal(response.ok, true, `${route} failed: ${payload.error || response.status}`);
  return payload;
}

async function main() {
  loadBrowserScript("public/schema/match-record.js");
  loadBrowserScript("public/analytics/round-metrics.js");

  const history = await postJson("/api/henrik/matches", { puuid, region: "na", count: 10, start: 0 });
  const parsedMatch = (Array.isArray(history?.data) ? history.data : [])
    .find(match => match?.metadata?.match_id === matchId);
  assert.ok(parsedMatch, "Known match was not returned by the first v4 history page.");
  const v4Record = globalThis.RankedCoachMatchRecord.fromHenrikV4Match(parsedMatch, { puuid });
  const v4Kast = globalThis.RankedCoachRoundMetrics.computeMatchKast(v4Record);
  const legacyRecord = globalThis.RankedCoachMatchRecord.toLegacyMatch(v4Record);
  const v4RoundMetrics = globalThis.RankedCoachRoundMetrics.computeMatchRoundMetrics(v4Record);

  assert.equal(globalThis.RankedCoachMatchRecord.formatHenrikActLabel("e9a3"), "Episode 9 Act 3");
  assert.equal(globalThis.RankedCoachMatchRecord.formatHenrikActLabel("e10a1"), "Season 2025 Act 1");
  assert.equal(globalThis.RankedCoachMatchRecord.formatHenrikActLabel("Episode 11 Act 3"), "Season 2026 Act 3");
  assert.equal(v4Record.act, "Season 2026 Act 3");
  assert.equal(legacyRecord.act, "Season 2026 Act 3");
  assert.equal(legacyRecord.metadata.act, "Season 2026 Act 3");
  assert.equal(v4Record.isPlacementMatch, true);
  assert.equal(legacyRecord.isPlacementMatch, true);
  assert.equal(legacyRecord.metadata.isPlacementMatch, true);
  assert.equal(v4Kast.overall.qualifyingRounds, 17);
  assert.equal(v4Kast.overall.totalRounds, 22);
  assert.equal(Math.round(v4Kast.overall.percentage), 77);
  assert.equal(v4Kast.overall.tradeSavedRounds, 3);
  assert.equal(legacyRecord.advanced.rounds.length, 22);
  assert.equal(legacyRecord.advanced.attack.roundsPlayed, 12);
  assert.equal(legacyRecord.advanced.attack.roundsWon, 8);
  assert.equal(legacyRecord.advanced.attack.firstBloods, 1);
  assert.equal(legacyRecord.advanced.attack.kast, 75);
  assert.equal(legacyRecord.advanced.defense.roundsPlayed, 10);
  assert.equal(legacyRecord.advanced.defense.firstDeaths, 2);
  assert.equal(legacyRecord.advanced.defense.kast, 80);
  assert.equal(legacyRecord.advanced.rounds.filter(round => round.buyType === "eco").length, 4);
  assert.equal(legacyRecord.advanced.rounds.filter(round => round.buyType === "light").length, 1);
  assert.equal(legacyRecord.advanced.rounds.filter(round => round.buyType === "full").length, 17);
  assert.equal(legacyRecord.advanced.utilityTimingAvailable, false);
  assert.equal(v4RoundMetrics.ceremonyCounts.CeremonyCloser, 3);
  assert.equal(v4RoundMetrics.ceremonyCounts.CeremonyFlawless, 1);
  assert.equal(v4RoundMetrics.multiKills.kills2K, 4);
  assert.equal(v4RoundMetrics.trade.receivedRounds, 3);
  assert.equal(v4RoundMetrics.trade.givenRounds, 3);
  assert.equal(Math.round(v4RoundMetrics.damage.standardDeviation), 124);
  assert.equal(v4RoundMetrics.discipline.affected, false);

  const oversizedRecord = structuredClone(v4Record);
  oversizedRecord.roundByRound[0].kills[0].gameTime = 12345;
  oversizedRecord.roundByRound[0].kills[0].finishingDamage = { damageItem: "Vandal", damageType: "Weapon" };
  const compactRecord = globalThis.RankedCoachMatchRecord.emptyRecord(oversizedRecord);
  assert.equal("gameTime" in compactRecord.roundByRound[0].kills[0], false);
  assert.equal("finishingDamage" in compactRecord.roundByRound[0].kills[0], false);

  const rawMatch = await postJson("/api/henrik/raw", { matchId, region: "na" });
  const record = globalThis.RankedCoachMatchRecord.fromHenrikRawMatch(rawMatch, { puuid });
  const kast = globalThis.RankedCoachRoundMetrics.computeMatchKast(record);

  assert.equal(record.id, matchId);
  assert.equal(record.roundByRound.length, 22);
  assert.equal(record.stats.kills, 13);
  assert.equal(record.stats.deaths, 12);
  assert.equal(record.stats.assists, 6);
  assert.equal(kast.overall.qualifyingRounds, 17);
  assert.equal(kast.overall.totalRounds, 22);
  assert.equal(Math.round(kast.overall.percentage), 77);
  assert.equal(kast.overall.tradeSavedRounds, 3);

  console.log("Known v4 and Raw match passed: advanced economy/opening projection, 17/22 KAST, ceremonies, multi-kills, trades, and damage variance.");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
