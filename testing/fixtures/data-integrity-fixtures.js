"use strict";

const CURRENT_ACT = "Season 2026 Act 4";
const TRACKED_PUUID = "rankedcoach-integrity-puuid";
const ENEMY_PUUID = "rankedcoach-integrity-enemy";
const TEAMMATE_PUUID = "rankedcoach-integrity-teammate";
const UNMAPPED_WEAPON_UUID = "deadbeef-dead-beef-dead-beefdeadbeef";

const WEAPON_UUIDS = Object.freeze({
  classic: "29a0cfab-485b-f5d5-779a-b59f85e204a8",
  sheriff: "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
  vandal: "9c82e19d-4575-0200-1a81-3eacf00cf872",
  phantom: "ae3de142-4d85-2547-dd26-4e90bed35cf7"
});

function isoAt(minutes = 0) {
  return `2026-08-03T16:${String(minutes).padStart(2, "0")}:00.000Z`;
}

function queueLabel(id = "competitive") {
  const clean = String(id || "").trim().toLowerCase();
  if (clean === "competitive") return { id: "competitive", name: "Competitive", modeType: "Standard" };
  if (clean === "unrated") return { id: "unrated", name: "Unrated", modeType: "Standard" };
  return { id: clean, name: clean ? clean[0].toUpperCase() + clean.slice(1) : "", modeType: "Standard" };
}

function weaponIdentity(name = "Vandal") {
  const key = String(name || "").trim().toLowerCase();
  const uuid = WEAPON_UUIDS[key] || "";
  return { name, id: uuid, type: key === "classic" || key === "sheriff" ? "Sidearm" : "Rifle" };
}

function makeKill(roundIndex, weapon = "Vandal", options = {}) {
  const identity = options.unmapped
    ? { rawName: "", rawId: UNMAPPED_WEAPON_UUID, type: "Rifle" }
    : weaponIdentity(weapon);
  return {
    killer: { puuid: TRACKED_PUUID },
    victim: { puuid: `${ENEMY_PUUID}-${roundIndex}` },
    weapon: options.unmapped ? { id: identity.rawId, uuid: identity.rawId } : identity,
    weaponId: options.unmapped ? identity.rawId : identity.id,
    weaponType: identity.type,
    roundTime: 45000
  };
}

function makeRounds({
  count = 6,
  wins = 4,
  killPattern = [1, 0, 2, 0, 1, 0],
  deathPattern = [0, 1, 0, 0, 1, 0],
  weaponPattern = ["Classic", "Vandal", "Vandal", "Phantom", "Sheriff", "Vandal"],
  unmappedKillRound = null,
  loadoutPattern = [800, 3900, 3900, 4300, 1900, 3900]
} = {}) {
  return Array.from({ length: count }, (_, index) => {
    const weapon = weaponPattern[index % weaponPattern.length] || "Vandal";
    const kills = [];
    for (let i = 0; i < (killPattern[index] || 0); i += 1) {
      kills.push(makeKill(index, weapon, { unmapped: unmappedKillRound === index && i === 0 }));
    }
    if (deathPattern[index]) {
      kills.push({
        killer: { puuid: `${ENEMY_PUUID}-killer-${index}` },
        victim: { puuid: TRACKED_PUUID },
        weapon: weaponIdentity("Vandal"),
        weaponId: WEAPON_UUIDS.vandal,
        weaponType: "Rifle",
        roundTime: 65000
      });
    }
    return {
      roundIndex: index,
      roundNum: index + 1,
      side: index < 3 ? "attack" : "defense",
      winningTeam: index < wins ? "Blue" : "Red",
      won: index < wins,
      roundResult: index === 4 ? "Thrifty" : "",
      playerEconomy: {
        weapon,
        weaponId: WEAPON_UUIDS[String(weapon).toLowerCase()] || "",
        loadoutValue: loadoutPattern[index % loadoutPattern.length],
        remaining: Math.max(0, 3200 - (index * 200))
      },
      kills
    };
  });
}

function expectedHsDisplay(value) {
  return Number.isFinite(Number(value)) ? `${Math.round(Number(value))}%` : "--";
}

function makeMatchRecord(config = {}) {
  const queue = queueLabel(config.queueId || "competitive");
  const id = config.id || `integrity-${config.agent || "skye"}-${config.minutes || 0}`;
  const playedAt = config.playedAt || isoAt(config.minutes || 0);
  const kills = config.kills ?? 12;
  const deaths = config.deaths ?? 8;
  const assists = config.assists ?? 5;
  const acs = config.acs ?? 220;
  const adr = config.adr ?? 150;
  const rounds = config.roundByRound || makeRounds(config.roundOptions);
  const stats = {
    kills,
    deaths,
    assists,
    acs,
    adr,
    hsPercent: Object.prototype.hasOwnProperty.call(config, "hsPercent") ? config.hsPercent : 25
  };
  const record = {
    schemaVersion: 3,
    id,
    legacyMatchId: id,
    source: config.source || "henrik_sync",
    playedAt,
    createdAt: playedAt,
    act: CURRENT_ACT,
    agent: config.agent || "Skye",
    role: config.role || "Initiator",
    map: config.map || "Lotus",
    queue,
    result: config.result || "win",
    isPlacementMatch: config.isPlacementMatch === true,
    stats,
    rank: {
      rank: config.rank || (config.isPlacementMatch ? "Unranked" : "Platinum 3"),
      rr: Object.prototype.hasOwnProperty.call(config, "rr") ? config.rr : 50,
      rrDelta: Object.prototype.hasOwnProperty.call(config, "rrDelta") ? config.rrDelta : 18,
      verified: config.rrVerified !== false && config.isPlacementMatch !== true,
      source: config.rrVerified === false || config.isPlacementMatch ? "" : "fixture",
      capturedAt: playedAt
    },
    rounds: {
      won: rounds.filter(round => round.won).length,
      lost: rounds.filter(round => !round.won).length
    },
    trackedPlayer: {
      puuid: TRACKED_PUUID,
      teamId: "Blue",
      teammatePuuids: [TEAMMATE_PUUID],
      opponentPuuids: [ENEMY_PUUID]
    },
    roundByRound: rounds,
    importMeta: { fixture: true }
  };
  if (config.rawHenrikPayload) {
    record.rawHenrikPayload = config.rawHenrikPayload;
    record.rawPayloadComplete = true;
    record.rawPayloadStoredAt = playedAt;
  }
  return record;
}

function toLegacyMatch(record, overrides = {}) {
  const hsValue = record.stats?.hsPercent;
  const hasHsValue = hsValue !== null
    && hsValue !== undefined
    && String(hsValue).trim?.() !== ""
    && Number.isFinite(Number(hsValue));
  return {
    id: record.legacyMatchId || record.id,
    matchId: record.id,
    source: record.source,
    importSource: record.source,
    lastSyncSource: record.source,
    createdAt: record.playedAt,
    playedAt: record.playedAt,
    act: record.act,
    agent: record.agent,
    role: record.role,
    map: record.map,
    result: record.result,
    kills: record.stats?.kills,
    deaths: record.stats?.deaths,
    assists: record.stats?.assists,
    acs: record.stats?.acs,
    adr: record.stats?.adr,
    hsPercent: hsValue,
    queue: record.queue,
    queueId: record.queue?.id,
    queueName: record.queue?.name,
    queueModeType: record.queue?.modeType,
    isPlacementMatch: record.isPlacementMatch === true,
    rr: record.rank?.verified === true ? record.rank?.rrDelta : null,
    verifiedRrDelta: record.rank?.verified === true ? record.rank?.rrDelta : null,
    rrTotal: record.rank?.rr,
    rrVerified: record.rank?.verified === true,
    rank: record.rank?.rank,
    matchRecord: record,
    rawPayloadComplete: record.rawPayloadComplete === true,
    rawPayloadStoredAt: record.rawPayloadStoredAt,
    metadata: {
      source: record.source,
      matchId: record.id,
      playedAt: record.playedAt,
      act: record.act,
      agent: record.agent,
      mapName: record.map,
      result: record.result,
      queue: record.queue,
      rank: record.rank?.rank,
      rrVerified: record.rank?.verified === true
    },
    segments: [{
      stats: {
        kills: { value: record.stats?.kills },
        deaths: { value: record.stats?.deaths },
        assists: { value: record.stats?.assists },
        combatScore: { value: record.stats?.acs },
        adr: { value: record.stats?.adr },
        headshotsPercentage: { value: hasHsValue ? Number(hsValue) : null }
      }
    }],
    ...overrides
  };
}

function makeHenrikV4Payload({
  id = "integrity-raw-henrik",
  queueId = "competitive",
  agent = "Sova",
  map = "Lotus",
  headshots = 4,
  bodyshots = 8,
  legshots = 0,
  kills = 8,
  deaths = 4,
  assists = 6,
  score = 2400,
  damage = 1800,
  won = true
} = {}) {
  const queue = queueLabel(queueId);
  return {
    data: {
      metadata: {
        match_id: id,
        started_at: isoAt(40),
        season: { id: "season-2026-act-4", short: "V26A4" },
        map: { name: map },
        queue: { id: queue.id, name: queue.name, mode_type: queue.modeType }
      },
      players: [
        {
          puuid: TRACKED_PUUID,
          team_id: "Blue",
          agent: { name: agent, id: `${agent.toLowerCase()}-agent-id` },
          tier: { id: 17, name: "Platinum 3" },
          stats: {
            kills,
            deaths,
            assists,
            score,
            damage: { dealt: damage },
            headshots,
            bodyshots,
            legshots
          },
          behavior: {}
        },
        {
          puuid: ENEMY_PUUID,
          team_id: "Red",
          agent: { name: "Jett" },
          tier: { id: 17, name: "Platinum 3" },
          stats: { kills: deaths, deaths: kills, assists: 0, score: 1500, damage: { dealt: 900 }, headshots: 1, bodyshots: 5, legshots: 0 }
        }
      ],
      teams: [
        { team_id: "Blue", won, rounds: { won: won ? 4 : 2, lost: won ? 2 : 4 } },
        { team_id: "Red", won: !won, rounds: { won: won ? 2 : 4, lost: won ? 4 : 2 } }
      ],
      rounds: makeRounds({ count: 6, wins: won ? 4 : 2 }).map((round, index) => ({
        id: index,
        winning_team: round.won ? "Blue" : "Red",
        stats: [{
          player: { puuid: TRACKED_PUUID },
          economy: {
            weapon: weaponIdentity(round.playerEconomy.weapon),
            armor: { name: index % 2 ? "Heavy Shields" : "Light Shields" },
            loadout_value: round.playerEconomy.loadoutValue,
            remaining: round.playerEconomy.remaining
          },
          stats: { score: 300 },
          damage_events: [{ damage: 150 }],
          ability_casts: {}
        }]
      })),
      kills: makeRounds({ count: 6, wins: won ? 4 : 2 }).flatMap((round, index) =>
        round.kills
          .filter(kill => kill.killer?.puuid === TRACKED_PUUID || kill.victim?.puuid === TRACKED_PUUID)
          .map(kill => ({
            round: index,
            killer: kill.killer,
            victim: kill.victim,
            weapon: kill.weapon
          }))
      )
    }
  };
}

const baselineRecord = makeMatchRecord({
  id: "integrity-baseline-competitive",
  minutes: 1,
  agent: "Skye",
  role: "Initiator",
  map: "Lotus",
  result: "win",
  kills: 14,
  deaths: 10,
  assists: 7,
  acs: 244,
  adr: 155,
  hsPercent: 25
});

const placementRecord = makeMatchRecord({
  id: "integrity-placement-competitive",
  minutes: 2,
  agent: "Sova",
  role: "Initiator",
  map: "Summit",
  result: "loss",
  kills: 9,
  deaths: 13,
  assists: 8,
  acs: 176,
  adr: 122,
  hsPercent: 20,
  isPlacementMatch: true,
  rank: "Unranked",
  rr: null,
  rrDelta: null,
  rrVerified: false
});

const nonCompetitiveRecord = makeMatchRecord({
  id: "integrity-noncompetitive-unrated",
  minutes: 3,
  agent: "Raze",
  role: "Duelist",
  map: "Haven",
  result: "loss",
  queueId: "unrated",
  kills: 30,
  deaths: 1,
  assists: 0,
  acs: 500,
  adr: 310,
  hsPercent: 60
});

const missingHsRecord = makeMatchRecord({
  id: "integrity-missing-hs",
  minutes: 4,
  agent: "Chamber",
  role: "Sentinel",
  map: "Ascent",
  result: "win",
  kills: 11,
  deaths: 9,
  assists: 2,
  acs: 190,
  adr: 130,
  hsPercent: null
});

const zeroHsRecord = makeMatchRecord({
  id: "integrity-zero-hs",
  minutes: 5,
  agent: "Omen",
  role: "Controller",
  map: "Split",
  result: "win",
  kills: 7,
  deaths: 8,
  assists: 9,
  acs: 160,
  adr: 112,
  hsPercent: 0
});

const unmappedWeaponRecord = makeMatchRecord({
  id: "integrity-unmapped-weapon",
  minutes: 6,
  agent: "Fade",
  role: "Initiator",
  map: "Sunset",
  result: "win",
  kills: 4,
  deaths: 2,
  assists: 10,
  acs: 188,
  adr: 125,
  hsPercent: 33,
  roundOptions: {
    count: 4,
    wins: 3,
    killPattern: [1, 0, 1, 0],
    deathPattern: [0, 1, 0, 0],
    unmappedKillRound: 0
  }
});

const demoFixtureRecord = makeMatchRecord({
  id: "tutorial_demo_integrity_stats",
  minutes: 7,
  agent: "Reyna",
  role: "Duelist",
  map: "Breeze",
  result: "win",
  source: "demo-fixture",
  kills: 40,
  deaths: 0,
  assists: 0,
  acs: 650,
  adr: 420,
  hsPercent: 90
});

const staleRawPayload = makeHenrikV4Payload({
  id: "integrity-stale-raw-henrik",
  queueId: "competitive",
  agent: "Sova",
  map: "Lotus",
  headshots: 4,
  bodyshots: 8,
  legshots: 0,
  kills: 8,
  deaths: 4,
  assists: 6,
  score: 2400,
  damage: 1800,
  won: true
});

const stalePreMigrationRecord = makeMatchRecord({
  id: "integrity-stale-raw-henrik",
  minutes: 8,
  agent: "Sova",
  role: "Initiator",
  map: "Lotus",
  result: "win",
  kills: 8,
  deaths: 4,
  assists: 6,
  acs: 400,
  adr: 300,
  hsPercent: null,
  rawHenrikPayload: staleRawPayload
});
stalePreMigrationRecord.queue = { id: null, name: null, modeType: null };

const fixtureDefinitions = Object.freeze([
  {
    id: "baseline-competitive",
    description: "Normal complete competitive match. Baseline for exact stats, KAST/ACS, weapon names, and ranked inclusion.",
    matches: [toLegacyMatch(baselineRecord)],
    primaryMatch: toLegacyMatch(baselineRecord),
    expected: {
      rankedCount: 1,
      statsHs: expectedHsDisplay(25),
      role: "initiator",
      roleGames: "1",
      roleWinRate: "100%",
      matchSummary: { acs: "244", hs: "25%" }
    }
  },
  {
    id: "placement-competitive-no-rr",
    description: "Competitive placement match with no visible RR. Must stay in ranked performance stats while RR remains unavailable.",
    matches: [toLegacyMatch(placementRecord)],
    primaryMatch: toLegacyMatch(placementRecord),
    expected: {
      rankedCount: 1,
      statsHs: expectedHsDisplay(20),
      role: "initiator",
      roleGames: "1",
      roleWinRate: "0%",
      homeChartHits: 1,
      homeChartStatus: /placement|unavailable|0 RR|retained/i,
      matchSummary: { acs: "176", hs: "20%" }
    }
  },
  {
    id: "noncompetitive-exclusion",
    description: "Explicit non-competitive queue beside a real competitive control. Only the competitive control may count in ranked stats.",
    matches: [toLegacyMatch(baselineRecord), toLegacyMatch(nonCompetitiveRecord)],
    primaryMatch: toLegacyMatch(nonCompetitiveRecord),
    expected: {
      rankedCount: 1,
      statsHs: expectedHsDisplay(25),
      excludedRole: "duelist",
      excludedRoleGames: "--",
      summaryWinRate: "100%"
    }
  },
  {
    id: "missing-headshot-data",
    description: "Henrik returned no shot-location fields. Missing HS must show -- and never silently become Number(null) === 0.",
    matches: [toLegacyMatch(missingHsRecord)],
    primaryMatch: toLegacyMatch(missingHsRecord),
    expected: {
      statsHs: "--",
      role: "sentinel",
      roleGames: "1",
      matchSummary: { acs: "190", hs: "--" }
    }
  },
  {
    id: "true-zero-headshot",
    description: "A real 0% HS match. Must show 0%, never --, proving true zero and missing data stay distinct.",
    matches: [toLegacyMatch(zeroHsRecord)],
    primaryMatch: toLegacyMatch(zeroHsRecord),
    expected: {
      statsHs: "0%",
      role: "controller",
      roleGames: "1",
      matchSummary: { acs: "160", hs: "0%" }
    }
  },
  {
    id: "unmapped-weapon-uuid",
    description: "Tracked kill uses an unknown weapon UUID. UI may use a friendly fallback, but must never show the bare UUID.",
    matches: [toLegacyMatch(unmappedWeaponRecord)],
    primaryMatch: toLegacyMatch(unmappedWeaponRecord),
    expected: {
      statsHs: "33%",
      forbiddenText: UNMAPPED_WEAPON_UUID,
      fallbackWeaponText: "Weapon deadbeef"
    }
  },
  {
    id: "demo-fixture-suppression",
    description: "Demo fixture beside a real Henrik match. Demo data must not contaminate real-account season stats.",
    matches: [toLegacyMatch(baselineRecord), toLegacyMatch(demoFixtureRecord)],
    primaryMatch: toLegacyMatch(demoFixtureRecord),
    expected: {
      rankedCount: 1,
      statsHs: expectedHsDisplay(25),
      excludedRole: "duelist",
      excludedRoleGames: "--",
      summaryWinRate: "100%"
    }
  },
  {
    id: "stale-pre-migration-raw-rederive",
    description: "Old stored match has missing HS/queue, but retained raw Henrik payload has the truth. Loader/backfill must repair it.",
    matches: [toLegacyMatch(stalePreMigrationRecord)],
    primaryMatch: toLegacyMatch(stalePreMigrationRecord),
    expected: {
      rankedCount: 1,
      statsHs: "33%",
      role: "initiator",
      roleGames: "1",
      matchSummary: { acs: "400", hs: "33%" },
      rederivedQueueId: "competitive"
    }
  }
]);

function createProfileForFixture(fixture, profileId = `integrity-${fixture.id}`) {
  return {
    id: profileId,
    name: `Integrity ${fixture.id}`,
    accountName: `Integrity ${fixture.id}`,
    riotId: "Integrity#TEST",
    puuid: TRACKED_PUUID,
    region: "NA",
    importSource: "henrik",
    lastSyncSource: "henrik",
    startingRR: 0,
    startingRRDate: "2026-08-03",
    themeKey: "default",
    frameTheme: "default",
    layoutShape: "default",
    layoutTexture: "default",
    avatarAgent: "Killjoy",
    trackerAnalytics: {
      currentAct: CURRENT_ACT,
      acts: [CURRENT_ACT]
    },
    matches: fixture.matches
  };
}

function summarizeFixtureExpectations() {
  return fixtureDefinitions.map(fixture => ({
    id: fixture.id,
    description: fixture.description,
    expected: fixture.expected
  }));
}

module.exports = {
  CURRENT_ACT,
  TRACKED_PUUID,
  UNMAPPED_WEAPON_UUID,
  WEAPON_UUIDS,
  fixtureDefinitions,
  createProfileForFixture,
  makeHenrikV4Payload,
  makeMatchRecord,
  toLegacyMatch,
  summarizeFixtureExpectations
};
