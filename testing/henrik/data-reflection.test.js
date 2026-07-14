"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const apiBaseUrl = String(process.env.HENRIK_BASE_URL || "https://www.rankedcoach.gg").replace(/\/$/, "");
const puuid = "fdc507ce-cd41-5236-8962-fce4ac427e12";
const starts = [0, 40, 80];

function loadBrowserScript(relativePath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"), { filename: relativePath });
}

async function postJson(route, body) {
  let response;
  let payload = {};
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(`${apiBaseUrl}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    payload = await response.json().catch(() => ({}));
    if (response.ok || ![429, 502, 503, 504].includes(response.status)) break;
    await new Promise(resolve => setTimeout(resolve, 750 * (attempt + 1)));
  }
  assert.equal(response.ok, true, `${route} failed: ${payload.error || response.status}`);
  return payload;
}

function closeEnough(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(Number(actual) - Number(expected)) <= tolerance, `${actual} != ${expected}`);
}

function manualKast(record) {
  const me = record.trackedPlayer.puuid;
  const teammates = new Set(record.trackedPlayer.teammatePuuids);
  let counted = 0;
  record.roundByRound.forEach(round => {
    const kills = round.kills || [];
    const gotKill = kills.some(kill => kill.killer === me);
    const gotAssist = kills.some(kill => (kill.assistants || []).includes(me));
    const death = kills.find(kill => kill.victim === me);
    const survived = !death;
    const traded = Boolean(death && kills.some(kill => teammates.has(kill.killer)
      && kill.victim === death.killer
      && Number(kill.roundTime) - Number(death.roundTime) >= 0
      && Number(kill.roundTime) - Number(death.roundTime) <= 5000));
    if (gotKill || gotAssist || survived || traded) counted += 1;
  });
  return record.roundByRound.length ? counted / record.roundByRound.length * 100 : 0;
}

(async () => {
  loadBrowserScript("public/schema/match-record.js");
  loadBrowserScript("public/analytics/round-metrics.js");
  loadBrowserScript("public/integrations/riot-sync.js");
  const checked = [];

  const [liveMmrPayload, storedMmrPayload] = await Promise.all([
    postJson("/api/henrik/mmr-history-live", { puuid, region: "na" }),
    postJson("/api/henrik/mmr-history", { puuid, region: "na", size: 100, page: 1 })
  ]);
  const liveMmrHistory = globalThis.RankedCoachRiotSync.normalizeMmrHistory(
    liveMmrPayload,
    "henrik-live-mmr-v2"
  );
  const mergedMmrHistory = globalThis.RankedCoachRiotSync.mergeMmrHistories(
    storedMmrPayload,
    liveMmrPayload
  );
  const mergedMmrByMatchId = new Map(mergedMmrHistory.map(snapshot => [snapshot.match_id, snapshot]));
  const liveVerified = liveMmrHistory.filter(snapshot => Number(snapshot?.tier?.id) > 0
    && Number.isFinite(Number(snapshot?.rr))
    && Number.isFinite(Number(snapshot?.last_change)));
  assert.ok(liveVerified.length >= 3, `Expected at least 3 verified live MMR snapshots, found ${liveVerified.length}`);
  liveMmrHistory.forEach(snapshot => {
    assert.equal(mergedMmrByMatchId.get(snapshot.match_id)?.rankedCoachSource, "henrik-live-mmr-v2");
  });

  for (const start of starts) {
    const payload = await postJson("/api/henrik/matches", { puuid, region: "na", count: 1, start });
    const rawMatch = payload.data?.[0];
    assert.ok(rawMatch, `No retained match at offset ${start}`);
    const rawPlayer = rawMatch.players.find(player => player.puuid === puuid);
    const rawTeam = rawMatch.teams.find(team => team.team_id === rawPlayer.team_id);
    const rounds = Number(rawTeam.rounds.won) + Number(rawTeam.rounds.lost);
    const shots = Number(rawPlayer.stats.headshots) + Number(rawPlayer.stats.bodyshots) + Number(rawPlayer.stats.legshots);
    const record = globalThis.RankedCoachMatchRecord.fromHenrikV4Match(rawMatch, { puuid });
    const legacy = globalThis.RankedCoachMatchRecord.toLegacyMatch(record);
    const kast = globalThis.RankedCoachRoundMetrics.computeMatchKast(record);

    assert.equal(record.id, rawMatch.metadata.match_id);
    assert.equal(record.agent, rawPlayer.agent.name);
    assert.equal(record.map, rawMatch.metadata.map.name);
    assert.equal(record.result, rawTeam.won ? "win" : "loss");
    assert.equal(record.stats.kills, rawPlayer.stats.kills);
    assert.equal(record.stats.deaths, rawPlayer.stats.deaths);
    assert.equal(record.stats.assists, rawPlayer.stats.assists);
    closeEnough(record.stats.acs, rawPlayer.stats.score / rounds);
    closeEnough(record.stats.adr, rawPlayer.stats.damage.dealt / rounds);
    closeEnough(record.stats.hsPercent, shots ? rawPlayer.stats.headshots / shots * 100 : 0);
    closeEnough(kast.overall.percentage, manualKast(record));
    assert.equal(legacy.segments[0].stats.kills.value, rawPlayer.stats.kills);
    assert.equal(legacy.metadata.result, rawTeam.won ? "win" : "loss");
    assert.notEqual(String(record.act), "");
    checked.push({ id: record.id, act: record.act, kast: Math.round(kast.overall.percentage) });
  }

  const rrSnapshots = liveVerified.slice(0, 3);
  const rrMatches = rrSnapshots.map(snapshot => ({
    id: snapshot.match_id,
    matchId: snapshot.match_id,
    source: "henrik_sync",
    metadata: { matchId: snapshot.match_id, source: "henrik_sync" }
  }));
  const rrEnriched = globalThis.RankedCoachRiotSync.enrichLegacyMatchesWithMmr(rrMatches, mergedMmrHistory);
  const rrChecked = [];
  let rawConfirmed = 0;
  for (let index = 0; index < rrSnapshots.length; index += 1) {
    const snapshot = rrSnapshots[index];
    const rawPayload = await postJson("/api/henrik/raw", { matchId: snapshot.match_id, region: "na" });
    if (rawPayload?.data?.matchInfo?.matchId) {
      assert.equal(rawPayload.data.matchInfo.matchId, snapshot.match_id);
      rawConfirmed += 1;
    } else {
      assert.equal(rawPayload?.data?.error, true, `Unexpected raw response for ${snapshot.match_id}`);
    }
    assert.equal(rrEnriched[index].rrVerified, true);
    assert.equal(rrEnriched[index].rrTotal, Number(snapshot.rr));
    assert.equal(rrEnriched[index].rr, Number(snapshot.last_change));
    assert.equal(rrEnriched[index].verifiedRrDelta, Number(snapshot.last_change));
    assert.equal(rrEnriched[index].rankDataSource, "henrik-live-mmr-v2");
    rrChecked.push(snapshot.match_id);
  }

  assert.equal(new Set(checked.map(match => match.act)).size, 3);
  assert.equal(rrChecked.length, 3);
  assert.ok(rawConfirmed >= 1, "Expected at least one live MMR match to remain available through Henrik Raw");
  console.log(`Henrik data reflection passed for offsets ${starts.join("/")} plus ${rrChecked.length} live RR snapshots: match stats, season, RR totals, and RR deltas agree.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
