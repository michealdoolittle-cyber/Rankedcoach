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

  assert.equal(v4Record.act, "Episode 11 Act 3");
  assert.equal(legacyRecord.act, "Episode 11 Act 3");
  assert.equal(legacyRecord.metadata.act, "Episode 11 Act 3");
  assert.equal(v4Kast.overall.qualifyingRounds, 17);
  assert.equal(v4Kast.overall.totalRounds, 22);
  assert.equal(Math.round(v4Kast.overall.percentage), 77);
  assert.equal(v4Kast.overall.tradeSavedRounds, 3);

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

  console.log("Known v4 and Raw match passed: Episode 11 Act 3, 17/22 KAST (77%), 3 trade-window saves.");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
