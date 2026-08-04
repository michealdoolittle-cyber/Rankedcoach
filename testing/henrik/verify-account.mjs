#!/usr/bin/env node
"use strict";

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..");

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    riotId: "",
    region: "na",
    count: 10,
    start: 0,
    baseUrl: process.env.HENRIK_BASE_URL || "https://www.rankedcoach.gg",
    storedProfilePath: "",
    storedRawVersion: 2
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--riot-id" || arg === "--riotId") options.riotId = argv[++index] || "";
    else if (arg === "--region") options.region = argv[++index] || options.region;
    else if (arg === "--count") options.count = Number(argv[++index]) || options.count;
    else if (arg === "--start") options.start = Number(argv[++index]) || options.start;
    else if (arg === "--base" || arg === "--base-url") options.baseUrl = argv[++index] || options.baseUrl;
    else if (arg === "--stored-profile" || arg === "--profile-file") options.storedProfilePath = argv[++index] || "";
    else if (arg === "--stored-raw-version") options.storedRawVersion = Number(argv[++index]) || options.storedRawVersion;
    else if (!arg.startsWith("--") && !options.riotId) options.riotId = arg;
  }
  options.riotId = options.riotId || process.env.RANKEDCOACH_VERIFY_RIOT_ID || "";
  options.region = String(options.region || "na").trim().toLowerCase();
  options.count = Math.max(1, Math.min(100, Math.floor(Number(options.count) || 10)));
  options.start = Math.max(0, Math.min(1000, Math.floor(Number(options.start) || 0)));
  options.baseUrl = String(options.baseUrl || "https://www.rankedcoach.gg").replace(/\/$/, "");
  options.storedProfilePath = String(options.storedProfilePath || "").trim();
  options.storedRawVersion = Math.max(1, Math.floor(Number(options.storedRawVersion) || 2));
  return options;
}

function loadBrowserScript(relativePath) {
  const source = fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
  vm.runInThisContext(source, { filename: relativePath });
}

async function postJson(baseUrl, route, body) {
  let response;
  let payload = {};
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(`${baseUrl}${route}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    payload = await response.json().catch(() => ({}));
    if (response.ok || ![408, 429, 500, 502, 503, 504].includes(response.status)) break;
    await new Promise(resolve => setTimeout(resolve, 650 * (attempt + 1)));
  }
  if (!response?.ok || payload?.ok === false) {
    const error = new Error(`${route} failed: ${payload?.error || response?.status || "unknown"}`);
    error.status = response?.status || 0;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function getV4Match(payload = {}) {
  return payload?.data?.metadata?.match_id ? payload.data : payload;
}

function cleanString(value = "") {
  return String(value ?? "").trim();
}

function getRawPlayer(match = {}, puuid = "") {
  const target = cleanString(puuid).toLowerCase();
  return (Array.isArray(match?.players) ? match.players : [])
    .find(player => cleanString(player?.puuid).toLowerCase() === target) || null;
}

function getRawTeam(match = {}, teamId = "") {
  const target = cleanString(teamId);
  return (Array.isArray(match?.teams) ? match.teams : [])
    .find(team => cleanString(team?.team_id || team?.teamId) === target) || null;
}

function readNumber(value, fallback = NaN) {
  if (value === null || value === undefined || String(value).trim?.() === "") return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function closeEnough(actual, expected, tolerance = 0.01) {
  if (!Number.isFinite(Number(actual)) && !Number.isFinite(Number(expected))) return true;
  return Math.abs(Number(actual) - Number(expected)) <= tolerance;
}

function expectedActLabel(season = {}) {
  const label = cleanString(season?.short || season?.id || season?.name || "");
  const match = label.toLowerCase().match(/^e(\d+)a(\d+)$/)
    || label.toLowerCase().match(/^episode\s+(\d+)\s+act\s+(\d+)$/);
  if (!match) return label;
  const episode = Number(match[1]);
  const act = Number(match[2]);
  return episode <= 9
    ? `Episode ${episode} Act ${act}`
    : `Season ${episode + 2015} Act ${act}`;
}

function isExpectedRankedPerformanceMatch(match = {}) {
  const queue = match?.metadata?.queue || {};
  const id = cleanString(queue?.id || match?.metadata?.mode || "").toLowerCase();
  const name = cleanString(queue?.name || "").toLowerCase();
  return id === "competitive" || name === "competitive";
}

function computeExpectedCore(rawPayload = {}, puuid = "") {
  const match = getV4Match(rawPayload);
  const player = getRawPlayer(match, puuid);
  if (!player) throw new Error(`Tracked player ${puuid} missing from ${match?.metadata?.match_id || "match"}`);
  const team = getRawTeam(match, player.team_id);
  const rounds = readNumber(team?.rounds?.won, 0) + readNumber(team?.rounds?.lost, 0);
  const stats = player.stats || {};
  const shots = readNumber(stats.headshots, 0) + readNumber(stats.bodyshots, 0) + readNumber(stats.legshots, 0);
  return {
    id: cleanString(match?.metadata?.match_id),
    queueRanked: isExpectedRankedPerformanceMatch(match),
    season: cleanString(match?.metadata?.season?.id || match?.metadata?.season?.short),
    act: expectedActLabel(match?.metadata?.season),
    map: cleanString(match?.metadata?.map?.name),
    agent: cleanString(player?.agent?.name),
    result: team?.won === true ? "win" : team?.won === false ? "loss" : "unknown",
    kills: readNumber(stats.kills, 0),
    deaths: readNumber(stats.deaths, 0),
    assists: readNumber(stats.assists, 0),
    acs: rounds ? readNumber(stats.score, 0) / rounds : 0,
    adr: rounds ? readNumber(stats.damage?.dealt, 0) / rounds : 0,
    hsPercent: shots ? (readNumber(stats.headshots, 0) / shots) * 100 : 0
  };
}

function manualKastFromRecord(record = {}) {
  const me = cleanString(record?.trackedPlayer?.puuid);
  const teammates = new Set(record?.trackedPlayer?.teammatePuuids || []);
  const rounds = Array.isArray(record?.roundByRound) ? record.roundByRound : [];
  let qualifyingRounds = 0;
  rounds.forEach(round => {
    const kills = Array.isArray(round?.kills) ? round.kills : [];
    const gotKill = kills.some(kill => cleanString(kill.killer) === me);
    const gotAssist = kills.some(kill => (kill.assistants || []).map(cleanString).includes(me));
    const death = kills.find(kill => cleanString(kill.victim) === me);
    const survived = !death;
    const traded = Boolean(death && kills.some(kill => (
      teammates.has(cleanString(kill.killer))
      && cleanString(kill.victim) === cleanString(death.killer)
      && readNumber(kill.roundTime, -1) - readNumber(death.roundTime, -1) >= 0
      && readNumber(kill.roundTime, -1) - readNumber(death.roundTime, -1) <= 5000
    )));
    if (gotKill || gotAssist || survived || traded) qualifyingRounds += 1;
  });
  return {
    qualifyingRounds,
    totalRounds: rounds.length,
    percentage: rounds.length ? (qualifyingRounds / rounds.length) * 100 : NaN
  };
}

function trackedWeaponLabels(record = {}) {
  const me = cleanString(record?.trackedPlayer?.puuid);
  return (Array.isArray(record?.roundByRound) ? record.roundByRound : [])
    .flatMap(round => Array.isArray(round?.kills) ? round.kills : [])
    .filter(kill => cleanString(kill?.killer) === me)
    .map(kill => ({
      weapon: cleanString(kill?.weapon),
      weaponId: cleanString(kill?.weaponId),
      weaponType: cleanString(kill?.weaponType)
    }))
    // Ability eliminations are intentionally not part of a gun-label check.
    // The match report's weapon section only counts actual weapon kills.
    .filter(entry => entry.weaponType === "Weapon")
    .filter(entry => entry.weapon || entry.weaponId);
}

function getStoredProfileMatchId(match = {}) {
  return cleanString(match?.matchId || match?.id || match?.metadata?.matchId || match?.matchRecord?.id);
}

function getStoredProfileRecord(match = {}) {
  return match?.matchRecord && typeof match.matchRecord === "object" ? match.matchRecord : match;
}

function loadStoredProfileSnapshot(filePath, riotId = "") {
  if (!filePath) return null;
  const parsed = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
  const candidates = Array.isArray(parsed)
    ? parsed
    : (Array.isArray(parsed?.profiles) ? parsed.profiles : [parsed]);
  const normalizedRiotId = cleanString(riotId).toLowerCase();
  const profile = candidates.find(entry => cleanString(entry?.riotId).toLowerCase() === normalizedRiotId)
    || candidates.find(entry => Array.isArray(entry?.matches));
  if (!profile || !Array.isArray(profile.matches)) {
    throw new Error(`No profile with stored matches was found in ${filePath}`);
  }
  return profile;
}

function verifyStoredProfileSnapshot(reporter, profile, expectedMatches, options) {
  if (!profile) {
    console.log("SKIP stored-profile persistence verification (pass --stored-profile <exported-profile.json> to inspect an actual saved account).");
    return;
  }
  const storedById = new Map((profile.matches || []).map(match => [getStoredProfileMatchId(match), match]));
  reporter.check(
    "stored profile raw-rehydrate version",
    Number(profile?.storedRawRehydrateVersion) >= options.storedRawVersion
      && Number(profile?.storedRawRehydrateMatchCount) === (profile.matches || []).length,
    `v${profile?.storedRawRehydrateVersion || 0}, ${profile?.storedRawRehydrateMatchCount || 0}/${(profile.matches || []).length} matches confirmed`
  );
  expectedMatches.forEach(expected => {
    const stored = storedById.get(expected.id);
    const record = getStoredProfileRecord(stored);
    reporter.check(`stored match ${expected.id} exists`, Boolean(stored));
    if (!stored) return;
    reporter.check(
      `stored match ${expected.id} raw payload`,
      Boolean(record?.rawHenrikPayload) && record?.rawPayloadComplete === true,
      record?.rawPayloadComplete === true ? "complete V4 payload retained" : "missing or incomplete payload"
    );
    reporter.check(
      `stored match ${expected.id} raw-rehydrate version`,
      Number(record?.storedRawRehydrateVersion) >= options.storedRawVersion,
      `v${record?.storedRawRehydrateVersion || 0}`
    );
    reporter.check(
      `stored match ${expected.id} HS%`,
      closeEnough(record?.stats?.hsPercent ?? stored?.hsPercent, expected.hsPercent),
      `${Number(record?.stats?.hsPercent ?? stored?.hsPercent).toFixed(2)} vs ${expected.hsPercent.toFixed(2)}`
    );
  });
}

function looksLikeRawUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanString(value));
}

function createReporter() {
  const rows = [];
  return {
    check(name, pass, details = "") {
      rows.push({ name, pass: Boolean(pass), details });
    },
    print() {
      rows.forEach(row => {
        const status = row.pass ? "PASS" : "FAIL";
        console.log(`${status} ${row.name}${row.details ? ` — ${row.details}` : ""}`);
      });
      const failed = rows.filter(row => !row.pass);
      console.log(`\n${failed.length ? "FAILED" : "PASSED"} ${rows.length - failed.length}/${rows.length} checks.`);
      return failed.length;
    }
  };
}

async function fetchRawMatches({ baseUrl, puuid, region, count, start }) {
  const matches = [];
  for (let offset = 0; offset < count; offset += 10) {
    const pageCount = Math.min(10, count - offset);
    const payload = await postJson(baseUrl, "/api/henrik/matches", {
      puuid,
      region,
      count: pageCount,
      start: start + offset
    });
    const pageMatches = Array.isArray(payload?.data) ? payload.data : [];
    matches.push(...pageMatches);
    if (pageMatches.length < pageCount) break;
  }
  return matches;
}

async function main() {
  const options = parseArgs();
  if (!options.riotId || !options.riotId.includes("#")) {
    throw new Error("Usage: node testing/henrik/verify-account.mjs Name#Tag [--region na] [--count 20] [--base https://www.rankedcoach.gg] [--stored-profile exported-profile.json]");
  }

  loadBrowserScript("public/schema/match-record.js");
  loadBrowserScript("public/analytics/round-metrics.js");
  loadBrowserScript("public/integrations/riot-sync.js");

  const reporter = createReporter();
  const accountPayload = await postJson(options.baseUrl, "/api/henrik/account", { riotId: options.riotId });
  const account = accountPayload?.data || accountPayload;
  const puuid = cleanString(account?.puuid);
  reporter.check("account PUUID resolved", Boolean(puuid), `${options.riotId} -> ${puuid || "missing"}`);

  const rawMatches = await fetchRawMatches({ ...options, puuid });
  const expectedMatches = rawMatches.map(match => computeExpectedCore(match, puuid));
  const expectedRanked = expectedMatches.filter(match => match.queueRanked);
  reporter.check("live Henrik page returned matches", rawMatches.length > 0, `${rawMatches.length} retained competitive matches checked`);
  reporter.check("ranked queue filter", expectedRanked.length === expectedMatches.length, `${expectedRanked.length}/${expectedMatches.length} are competitive`);

  const actualPull = await globalThis.RankedCoachRiotSync.pullMatches({
    riotId: options.riotId,
    puuid,
    region: options.region,
    historyLimit: options.count,
    historyStart: options.start,
    includeKnownMatches: true,
    // This is the production sync path: it combines V4 aggregate data with
    // Henrik Raw round snapshots. Verifying it catches loss of the retained
    // V4 payload that a V4-only normalization test cannot see.
    hydrateRoundData: true,
    baseUrl: options.baseUrl,
    waitForRetry: () => {}
  });
  const actualRecords = Array.isArray(actualPull?.records) ? actualPull.records : [];
  const actualById = new Map(actualRecords.map(record => [cleanString(record?.id || record?.legacyMatchId), record]));
  reporter.check("app sync mapped same ranked matches", actualRecords.length === expectedRanked.length, `${actualRecords.length}/${expectedRanked.length} records`);

  const actualAggregateKast = globalThis.RankedCoachRoundMetrics.aggregateMatchKast(actualRecords);
  let manualKastRounds = 0;
  let manualKastQualifying = 0;

  expectedRanked.forEach((expected) => {
    const record = actualById.get(expected.id);
    reporter.check(`match ${expected.id} exists`, Boolean(record), expected.agent || "");
    if (!record) return;

    reporter.check(`match ${expected.id} result`, record.result === expected.result, `${record.result} vs ${expected.result}`);
    reporter.check(`match ${expected.id} agent`, record.agent === expected.agent, `${record.agent} vs ${expected.agent}`);
    reporter.check(`match ${expected.id} map`, record.map === expected.map, `${record.map} vs ${expected.map}`);
    reporter.check(`match ${expected.id} season id`, cleanString(record.season) === expected.season, `${record.season} vs ${expected.season}`);
    reporter.check(`match ${expected.id} act label`, cleanString(record.act) === expected.act, `${record.act} vs ${expected.act}`);
    reporter.check(`match ${expected.id} kills`, readNumber(record.stats?.kills) === expected.kills, `${record.stats?.kills} vs ${expected.kills}`);
    reporter.check(`match ${expected.id} deaths`, readNumber(record.stats?.deaths) === expected.deaths, `${record.stats?.deaths} vs ${expected.deaths}`);
    reporter.check(`match ${expected.id} assists`, readNumber(record.stats?.assists) === expected.assists, `${record.stats?.assists} vs ${expected.assists}`);
    reporter.check(`match ${expected.id} ACS`, closeEnough(record.stats?.acs, expected.acs), `${Number(record.stats?.acs).toFixed(2)} vs ${expected.acs.toFixed(2)}`);
    reporter.check(`match ${expected.id} ADR`, closeEnough(record.stats?.adr, expected.adr), `${Number(record.stats?.adr).toFixed(2)} vs ${expected.adr.toFixed(2)}`);
    reporter.check(`match ${expected.id} HS%`, closeEnough(record.stats?.hsPercent, expected.hsPercent), `${Number(record.stats?.hsPercent).toFixed(2)} vs ${expected.hsPercent.toFixed(2)}`);
    reporter.check(
      `match ${expected.id} retained raw payload`,
      Boolean(record?.rawHenrikPayload) && record?.rawPayloadComplete === true,
      record?.rawPayloadComplete === true ? "complete V4 payload retained through hydrated sync" : "payload missing or incomplete"
    );

    const manualKast = manualKastFromRecord(record);
    const appKast = globalThis.RankedCoachRoundMetrics.computeMatchKast(record);
    manualKastRounds += manualKast.totalRounds;
    manualKastQualifying += manualKast.qualifyingRounds;
    reporter.check(
      `match ${expected.id} KAST`,
      closeEnough(appKast?.overall?.percentage, manualKast.percentage),
      `${Number(appKast?.overall?.percentage).toFixed(2)} vs manual ${Number(manualKast.percentage).toFixed(2)}`
    );

    const badWeaponLabels = trackedWeaponLabels(record)
      .filter(entry => !entry.weapon || looksLikeRawUuid(entry.weapon) || (entry.weaponId && entry.weapon === entry.weaponId));
    reporter.check(
      `match ${expected.id} weapon-name resolution`,
      badWeaponLabels.length === 0,
      badWeaponLabels.length ? JSON.stringify(badWeaponLabels.slice(0, 3)) : "tracked kill weapons are readable"
    );
  });

  const manualAggregateKast = manualKastRounds ? (manualKastQualifying / manualKastRounds) * 100 : NaN;
  reporter.check(
    "aggregate KAST",
    closeEnough(actualAggregateKast?.overall?.percentage, manualAggregateKast),
    `${Number(actualAggregateKast?.overall?.percentage).toFixed(2)} vs manual ${Number(manualAggregateKast).toFixed(2)}`
  );

  const storedProfile = loadStoredProfileSnapshot(options.storedProfilePath, options.riotId);
  verifyStoredProfileSnapshot(reporter, storedProfile, expectedRanked, options);

  const failures = reporter.print();
  if (failures) process.exitCode = 1;
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
