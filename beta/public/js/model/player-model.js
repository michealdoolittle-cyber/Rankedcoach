import { average, byNewest, clamp, finite, normalizeKey, number, safeDivide, winrate } from "./utils.js";

const ROLE_BY_AGENT = {
  astra: "Controller", brimstone: "Controller", clove: "Controller", harbor: "Controller", miks: "Controller", omen: "Controller", viper: "Controller",
  breach: "Initiator", fade: "Initiator", gekko: "Initiator", "kay-o": "Initiator", kayo: "Initiator", skye: "Initiator", sova: "Initiator", tejo: "Initiator",
  chamber: "Sentinel", cypher: "Sentinel", deadlock: "Sentinel", killjoy: "Sentinel", sage: "Sentinel", veto: "Sentinel", vyse: "Sentinel",
  iso: "Duelist", jett: "Duelist", neon: "Duelist", phoenix: "Duelist", raze: "Duelist", reyna: "Duelist", waylay: "Duelist", yoru: "Duelist"
};

const AGENT_PORTRAITS = {
  miks: "/assets/agents-src/01-Miks.png",
  waylay: "/assets/agents-src/02-Waylay.png",
  tejo: "/assets/agents-src/03-Tejo.png",
  veto: "/assets/agents-src/04-Veto.png",
  vyse: "/assets/agents-src/05-Vyse.png",
  deadlock: "/assets/agents-src/06-Deadlock.png",
  killjoy: "/assets/agents-src/07-Killjoy.png",
  raze: "/assets/agents-src/08-Raze.png",
  sage: "/assets/agents-src/09-Sage.png",
  jett: "/assets/agents-src/10-Jett.png",
  viper: "/assets/agents-src/11-Viper.png",
  chamber: "/assets/agents-src/12-Chamber.png",
  clove: "/assets/agents-src/13-Clove.png",
  iso: "/assets/agents-src/14-Iso.png",
  gekko: "/assets/agents-src/15-Gekko.png",
  neon: "/assets/agents-src/16-Neon.png",
  reyna: "/assets/agents-src/17-Reyna.png",
  fade: "/assets/agents-src/18-Fade.png",
  harbor: "/assets/agents-src/19-Harbor.png",
  astra: "/assets/agents-src/20-Astra.png",
  omen: "/assets/agents-src/21-Omen.png",
  cypher: "/assets/agents-src/22-Cypher.png",
  phoenix: "/assets/agents-src/23-Phoenix.png",
  yoru: "/assets/agents-src/24-Yoru.png",
  sova: "/assets/agents-src/25-Sova.png",
  breach: "/assets/agents-src/26-Breach.png",
  skye: "/assets/agents-src/27-Skye.png",
  "kay-o": "/assets/agents-src/28-KAYO.png",
  kayo: "/assets/agents-src/28-KAYO.png",
  brimstone: "/assets/agents-src/29-Brimstone.png"
};

function getRawData(payload = {}) {
  return payload?.data?.metadata?.match_id ? payload.data : payload;
}

function getRawPlayer(match = {}, puuid = "") {
  const target = String(puuid || "").toLowerCase();
  return (Array.isArray(match?.players) ? match.players : [])
    .find(player => String(player?.puuid || "").toLowerCase() === target) || null;
}

function getRawTeam(match = {}, teamId = "") {
  return (Array.isArray(match?.teams) ? match.teams : [])
    .find(team => String(team?.team_id || team?.teamId || "") === String(teamId || "")) || null;
}

function formatActLabel(season = {}) {
  const raw = String(season?.short || season?.id || season?.name || "").trim();
  return globalThis.RankedCoachMatchRecord?.formatHenrikActLabel?.(raw) || raw || "Selected Window";
}

function readRankSnapshot(mmrHistory = [], matchId = "") {
  return (Array.isArray(mmrHistory) ? mmrHistory : [])
    .find(entry => String(entry?.match_id || entry?.matchId || "") === String(matchId || "")) || null;
}

function fallbackRecord(rawPayload = {}, context = {}) {
  const match = getRawData(rawPayload);
  const player = getRawPlayer(match, context.puuid);
  const team = getRawTeam(match, player?.team_id);
  const stats = player?.stats || {};
  const roundsWon = number(team?.rounds?.won, 0);
  const roundsLost = number(team?.rounds?.lost, 0);
  const roundsPlayed = roundsWon + roundsLost;
  const shots = number(stats.headshots, 0) + number(stats.bodyshots, 0) + number(stats.legshots, 0);
  const agent = player?.agent?.name || "Unknown";
  const map = match?.metadata?.map?.name || match?.metadata?.map || "Unknown";
  return {
    id: match?.metadata?.match_id || crypto.randomUUID(),
    playedAt: match?.metadata?.game_start_patched || match?.metadata?.game_start || new Date().toISOString(),
    act: formatActLabel(match?.metadata?.season),
    map,
    agent,
    role: ROLE_BY_AGENT[normalizeKey(agent)] || "Unknown",
    result: team?.won === true ? "win" : team?.won === false ? "loss" : "unknown",
    stats: {
      kills: number(stats.kills, 0),
      deaths: number(stats.deaths, 0),
      assists: number(stats.assists, 0),
      acs: roundsPlayed ? number(stats.score, 0) / roundsPlayed : NaN,
      adr: roundsPlayed ? number(stats.damage?.dealt, 0) / roundsPlayed : NaN,
      hsPercent: shots ? number(stats.headshots, 0) / shots * 100 : NaN
    },
    rounds: { won: roundsWon, lost: roundsLost, played: roundsPlayed },
    trackedPlayer: { puuid: context.puuid },
    roundByRound: []
  };
}

function normalizeRecord(rawPayload = {}, context = {}) {
  const fallback = fallbackRecord(rawPayload, context);
  try {
    const record = globalThis.RankedCoachMatchRecord?.fromHenrikV4Match?.(getRawData(rawPayload), context);
    if (record?.id) {
      return {
        ...fallback,
        ...record,
        map: record.map || fallback.map,
        agent: record.agent || fallback.agent,
        role: record.role || ROLE_BY_AGENT[normalizeKey(record.agent || fallback.agent)] || fallback.role,
        stats: {
          ...fallback.stats,
          ...(record.stats || {})
        },
        rounds: {
          ...fallback.rounds,
          ...(record.rounds || {})
        },
        trackedPlayer: {
          ...fallback.trackedPlayer,
          ...(record.trackedPlayer || {})
        },
        roundByRound: Array.isArray(record.roundByRound) && record.roundByRound.length ? record.roundByRound : fallback.roundByRound
      };
    }
  } catch (_error) {
    // Fall through to the small beta normalizer. The UI will still mark low
    // confidence when round-level data is unavailable.
  }
  return fallback;
}

function attachRank(record = {}, mmrHistory = []) {
  const snapshot = readRankSnapshot(mmrHistory, record.id);
  const tierName = snapshot?.tier?.name || snapshot?.tier_name || snapshot?.rank || record?.rank?.rank || "Unranked";
  const rr = snapshot?.rr ?? record?.rank?.rr ?? null;
  const rrDelta = snapshot?.last_change ?? snapshot?.lastChange ?? record?.rank?.rrDelta ?? null;
  return {
    ...record,
    rank: {
      rank: tierName,
      rr: finite(rr) ? number(rr) : null,
      rrDelta: finite(rrDelta) ? number(rrDelta) : null,
      verified: Boolean(snapshot || record?.rank?.verified)
    }
  };
}

function bucketRecords(records = [], keyGetter) {
  const buckets = new Map();
  records.forEach(record => {
    const key = keyGetter(record);
    if (!key || key === "Unknown") return;
    const bucket = buckets.get(key) || {
      label: key,
      map: key,
      agent: key,
      role: key,
      matches: [],
      matchesPlayed: 0,
      matchesWon: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      acsValues: [],
      adrValues: [],
      hsValues: []
    };
    bucket.matches.push(record);
    bucket.matchesPlayed += 1;
    bucket.matchesWon += record.result === "win" ? 1 : 0;
    bucket.kills += number(record.stats?.kills, 0);
    bucket.deaths += number(record.stats?.deaths, 0);
    bucket.assists += number(record.stats?.assists, 0);
    if (finite(record.stats?.acs)) bucket.acsValues.push(number(record.stats.acs));
    if (finite(record.stats?.adr)) bucket.adrValues.push(number(record.stats.adr));
    if (finite(record.stats?.hsPercent)) bucket.hsValues.push(number(record.stats.hsPercent));
    buckets.set(key, bucket);
  });
  return [...buckets.values()].map(bucket => ({
    ...bucket,
    winRate: winrate(bucket.matches),
    winrate: winrate(bucket.matches),
    kd: safeDivide(bucket.kills, bucket.deaths, bucket.kills),
    acs: average(bucket.acsValues),
    adr: average(bucket.adrValues),
    hsPercent: average(bucket.hsValues),
    hs: average(bucket.hsValues),
    assistsPerMatch: safeDivide(bucket.assists, bucket.matchesPlayed),
    deathsPerMatch: safeDivide(bucket.deaths, bucket.matchesPlayed)
  })).sort((a, b) => b.matchesPlayed - a.matchesPlayed || b.winrate - a.winrate);
}

function buildWeapons(records = []) {
  const kills = new Map();
  const deaths = new Map();
  records.forEach(record => {
    const me = String(record?.trackedPlayer?.puuid || "").toLowerCase();
    (record.roundByRound || []).forEach(round => {
      (round.kills || []).forEach(kill => {
        const label = String(kill?.weapon || kill?.weaponName || kill?.weaponId || "").trim();
        if (!label) return;
        if (!kill?.weaponType || kill.weaponType === "Weapon") {
          if (!me || String(kill?.killer || "").toLowerCase() === me) {
            kills.set(label, (kills.get(label) || 0) + 1);
          }
          if (me && String(kill?.victim || "").toLowerCase() === me) {
            deaths.set(label, (deaths.get(label) || 0) + 1);
          }
        }
      });
    });
  });
  return [...new Set([...kills.keys(), ...deaths.keys()])]
    .map(weapon => {
      const killCount = kills.get(weapon) || 0;
      const deathCount = deaths.get(weapon) || 0;
      return {
        weapon,
        label: weapon,
        kills: killCount,
        deaths: deathCount,
        kd: safeDivide(killCount, deathCount, killCount)
      };
    })
    .sort((a, b) => b.kills - a.kills || a.weapon.localeCompare(b.weapon));
}

function scorePillars(records = [], roundSummary = {}) {
  if (!records.length) {
    return [
      { key: "mechanics", label: "Mechanics", score: 0, driver: "No retained matches are loaded yet.", statKey: "HS%" },
      { key: "mental", label: "Mental", score: 0, driver: "No retained matches are loaded yet.", statKey: "Consistency" },
      { key: "game-sense", label: "Game Sense", score: 0, driver: "No retained matches are loaded yet.", statKey: "Winrate" },
      { key: "teamwork", label: "Teamwork", score: 0, driver: "No retained matches are loaded yet.", statKey: "KAST" },
      { key: "discipline", label: "Discipline", score: 0, driver: "No retained matches are loaded yet.", statKey: "Deaths" }
    ];
  }
  const values = records.map(record => record.stats || {});
  const kd = safeDivide(values.reduce((sum, stat) => sum + number(stat.kills, 0), 0), values.reduce((sum, stat) => sum + number(stat.deaths, 0), 0), 0);
  const acs = average(values.map(stat => stat.acs).filter(finite));
  const hs = average(values.map(stat => stat.hsPercent).filter(finite));
  const win = winrate(records);
  const assists = average(values.map(stat => number(stat.assists, 0)));
  const deaths = average(values.map(stat => number(stat.deaths, 0)));
  const kast = roundSummary?.overall?.percentage;
  const stableDeathScore = clamp(100 - Math.abs(deaths - 14) * 5);
  const mentalScore = Math.round(average([clamp(win), clamp(kd * 42), stableDeathScore]));
  return [
    {
      key: "mechanics",
      label: "Mechanics",
      score: Math.round(average([clamp(hs * 2.5), clamp(kd * 45), clamp(acs / 3)])),
      driver: finite(hs) ? `HS% is ${Math.round(hs)}% across this window.` : `K/D is ${kd.toFixed(2)} across this window.`,
      statKey: finite(hs) ? "HS%" : "K/D"
    },
    {
      key: "mental",
      label: "Mental",
      score: mentalScore,
      driver: "Mental is reading consistency through win rate, K/D stability, and death pressure across the window.",
      statKey: "Consistency"
    },
    {
      key: "game-sense",
      label: "Game Sense",
      score: Math.round(average([clamp(win), clamp(safeDivide(records.filter(match => match.rounds?.won > match.rounds?.lost).length, records.length) * 100)])),
      driver: `${Math.round(win)}% match winrate is the main game-sense anchor here.`,
      statKey: "Winrate"
    },
    {
      key: "teamwork",
      label: "Teamwork",
      score: Math.round(average([clamp(assists * 12), finite(kast) ? clamp(kast) : clamp(assists * 10)])),
      driver: finite(kast) ? `KAST is ${Math.round(kast)}% from retained round data.` : `Assists are ${assists.toFixed(1)} per match.`,
      statKey: finite(kast) ? "KAST" : "Assists"
    },
    {
      key: "discipline",
      label: "Discipline",
      score: Math.round(average([clamp(100 - deaths * 4), clamp(kd * 42)])),
      driver: `${deaths.toFixed(1)} deaths per match is the clearest discipline signal.`,
      statKey: "Deaths"
    }
  ].map(item => ({ ...item, score: clamp(item.score) }));
}

function withTrend(pillars = [], records = []) {
  const sorted = records.slice().sort((a, b) => new Date(a.playedAt) - new Date(b.playedAt));
  const recent = sorted.slice(-5);
  const previous = sorted.slice(-10, -5);
  const recentScores = scorePillars(recent);
  const previousScores = previous.length ? scorePillars(previous) : [];
  return pillars.map(pillar => {
    const recentScore = recentScores.find(item => item.key === pillar.key)?.score ?? pillar.score;
    const previousScore = previousScores.find(item => item.key === pillar.key)?.score;
    const delta = finite(previousScore) ? recentScore - previousScore : 0;
    const tone = delta >= 4 ? "Improving" : delta <= -4 ? "Needs Work" : "Stable";
    return { ...pillar, trend: tone, delta, reference: previous.length ? `recent 5 vs previous ${previous.length}` : "current window only" };
  });
}

export function buildPlayerModel(snapshot = {}) {
  const records = (snapshot.rawMatches || [])
    .map(raw => attachRank(normalizeRecord(raw, { puuid: snapshot.puuid }), snapshot.mmrHistory))
    .sort(byNewest)
    .map((record, index, all) => ({ ...record, matchIndex: all.length - index }));
  const roundSummary = globalThis.RankedCoachRoundMetrics?.aggregateMatchKast?.(records) || {};
  const overview = {
    matchesPlayed: records.length,
    wins: records.filter(record => record.result === "win").length,
    losses: records.filter(record => record.result === "loss").length,
    draws: records.filter(record => record.result === "draw").length,
    winRate: winrate(records),
    winrate: winrate(records),
    kills: records.reduce((sum, record) => sum + number(record.stats?.kills, 0), 0),
    deaths: records.reduce((sum, record) => sum + number(record.stats?.deaths, 0), 0),
    assists: records.reduce((sum, record) => sum + number(record.stats?.assists, 0), 0),
    acs: average(records.map(record => record.stats?.acs).filter(finite)),
    adr: average(records.map(record => record.stats?.adr).filter(finite)),
    hs: average(records.map(record => record.stats?.hsPercent).filter(finite)),
    overallKAST: roundSummary?.overall?.percentage,
    rrTotal: records.reduce((sum, record) => sum + number(record.rank?.rrDelta, 0), 0)
  };
  overview.kd = safeDivide(overview.kills, overview.deaths, overview.kills);
  overview.killsPerMatch = safeDivide(overview.kills, records.length);
  const currentRank = records.find(record => record.rank?.rank)?.rank?.rank || "Unranked";
  const currentAct = records[0]?.act || "This Act";
  const maps = bucketRecords(records, record => record.map).map(row => ({ ...row, map: row.label }));
  const agents = bucketRecords(records, record => record.agent).map(row => ({ ...row, agent: row.label, role: ROLE_BY_AGENT[normalizeKey(row.label)] || records.find(record => record.agent === row.label)?.role || "Unknown" }));
  const roles = bucketRecords(records, record => record.role).map(row => ({ ...row, role: row.label }));
  const rankComparison = globalThis.RankedCoachRankBenchmarks?.compareRankMetrics?.(currentRank, {
    winRate: overview.winRate,
    kd: overview.kd,
    acs: overview.acs,
    hsPercent: overview.hs
  }) || null;
  const context = {
    overview,
    maps,
    agents,
    roles,
    matches: records,
    weapons: { families: [], list: buildWeapons(records) },
    economy: {},
    logs: { count: 0 },
    sample: { matchCount: records.length, label: records.length >= 8 ? "Medium Confidence" : "Low Confidence", explanation: `${records.length} retained competitive matches are loaded.` },
    rankComparison,
    currentRole: roles[0]?.role || ""
  };
  const trendCards = globalThis.RankedCoachMatchTrendsResolver?.resolveMatchTrends?.(context) || [];
  const ruleCards = globalThis.RankedCoachCoachingRules?.matchRules?.(context, { maxResults: 4 }) || [];
  return {
    account: snapshot.account || null,
    riotId: snapshot.riotId || "",
    region: snapshot.region || "na",
    syncedAt: snapshot.syncedAt || "",
    records,
    overview,
    currentRank,
    currentAct,
    maps,
    agents,
    roles,
    weapons: buildWeapons(records),
    pillars: withTrend(scorePillars(records, roundSummary), records),
    trendCards,
    ruleCards,
    rankComparison,
    context
  };
}

export function getMapAsset(mapName = "") {
  const key = normalizeKey(mapName);
  const map = (globalThis.RankedCoachGamesenseMaps || []).find(item => normalizeKey(item.label || item.id) === key);
  return map?.cardImage || `/assets/library/maps/thumbs/${key}.jpg`;
}

export function getAgentAsset(agentName = "") {
  const key = normalizeKey(agentName);
  const agent = (globalThis.RankedCoachGamesenseReference?.agents || []).find(item => normalizeKey(item.label || item.name || item.id) === key);
  return agent?.icon || agent?.image || `/assets/library/agents/${key}/icon.png`;
}

export function getAgentPortraitAsset(agentName = "") {
  const key = normalizeKey(agentName);
  const agent = (globalThis.RankedCoachGamesenseReference?.agents || []).find(item => normalizeKey(item.label || item.name || item.id) === key);
  return AGENT_PORTRAITS[key] || agent?.image || agent?.portrait || getAgentAsset(agentName);
}
