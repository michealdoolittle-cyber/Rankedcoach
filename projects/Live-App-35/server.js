const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;
const RIOT_API_KEY = String(process.env.RIOT_API_KEY || "").trim();
const EXAMPLE_FIXTURE_PATH = path.join(ROOT, "Example-User.JSON");
const THEME_SNAPSHOT_PATH = path.join(ROOT, "tmp", "theme-snapshot.json");
const LEGACY_OVERLAY_SNAPSHOT_PATH = path.join(ROOT, "tmp", "overlay-tuning-snapshot.json");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
  });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function safeNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeDivide(numerator, denominator) {
  const num = Number(numerator);
  const den = Number(denominator);
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return 0;
  return num / den;
}

function nowISO() {
  return new Date().toISOString();
}

function safeInt(value, fallback = 0) {
  return Math.round(safeNumber(value, fallback));
}

function normalizeRiotRegion(input = "") {
  const raw = String(input || "").trim().toLowerCase();

  if (["na", "latam", "br", "americas", "us"].includes(raw)) return "americas";
  if (["eu", "euw", "eune", "tr", "ru", "europe"].includes(raw)) return "europe";
  if (["ap", "kr", "jp", "oce", "asia"].includes(raw)) return "asia";

  return "americas";
}

function parseRiotId(riotId = "") {
  const raw = String(riotId || "").trim();
  const [gameName, tagLine] = raw.split("#");

  return {
    gameName: (gameName || "").trim(),
    tagLine: (tagLine || "").trim()
  };
}

function titleCase(value = "") {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const ROLE_AGENT_ROTATIONS = {
  duelist: ["Jett", "Raze", "Reyna", "Phoenix", "Neon", "Iso"],
  initiator: ["Sova", "Skye", "Fade", "Breach", "Gekko", "Kayo"],
  controller: ["Omen", "Brimstone", "Viper", "Clove", "Astra", "Harbor"],
  sentinel: ["Killjoy", "Cypher", "Sage", "Chamber", "Deadlock", "Vyse"]
};

const AGENT_ROLE_MAP = Object.entries(ROLE_AGENT_ROTATIONS).reduce((map, [role, agents]) => {
  agents.forEach(agent => {
    map[agent] = role;
  });
  return map;
}, {});

const DEMO_MAP_POOL = ["Ascent", "Bind", "Haven", "Split", "Pearl", "Abyss", "Breeze"];

const DEFAULT_ROLE_BASELINES = {
  duelist: {
    killsPerMatch: 21,
    deathsPerMatch: 15,
    assistsPerMatch: 5,
    scorePerRound: 242,
    headshotsPercentage: 23,
    damagePerRound: 158,
    econRating: 71,
    attackRoundsPlayed: 12,
    attackRoundsWon: 7,
    attackFirstBloods: 3,
    attackFirstDeaths: 2,
    attackSurvived: 6,
    attackTraded: 3,
    attackKAST: 71,
    attackDamagePerRound: 164,
    attackKills: 12,
    defenseRoundsPlayed: 12,
    defenseRoundsWon: 5,
    defenseFirstBloods: 2,
    defenseFirstDeaths: 3,
    defenseSurvived: 5,
    defenseTraded: 3,
    defenseKAST: 67,
    defenseDamagePerRound: 149,
    defenseKills: 9
  },
  initiator: {
    killsPerMatch: 17,
    deathsPerMatch: 14,
    assistsPerMatch: 9,
    scorePerRound: 212,
    headshotsPercentage: 21,
    damagePerRound: 146,
    econRating: 73,
    attackRoundsPlayed: 12,
    attackRoundsWon: 7,
    attackFirstBloods: 3,
    attackFirstDeaths: 2,
    attackSurvived: 7,
    attackTraded: 4,
    attackKAST: 75,
    attackDamagePerRound: 151,
    attackKills: 10,
    defenseRoundsPlayed: 12,
    defenseRoundsWon: 6,
    defenseFirstBloods: 2,
    defenseFirstDeaths: 2,
    defenseSurvived: 7,
    defenseTraded: 4,
    defenseKAST: 74,
    defenseDamagePerRound: 143,
    defenseKills: 8
  },
  controller: {
    killsPerMatch: 16,
    deathsPerMatch: 13,
    assistsPerMatch: 8,
    scorePerRound: 205,
    headshotsPercentage: 20,
    damagePerRound: 139,
    econRating: 78,
    attackRoundsPlayed: 12,
    attackRoundsWon: 7,
    attackFirstBloods: 2,
    attackFirstDeaths: 2,
    attackSurvived: 8,
    attackTraded: 4,
    attackKAST: 77,
    attackDamagePerRound: 144,
    attackKills: 8,
    defenseRoundsPlayed: 12,
    defenseRoundsWon: 7,
    defenseFirstBloods: 2,
    defenseFirstDeaths: 2,
    defenseSurvived: 8,
    defenseTraded: 4,
    defenseKAST: 78,
    defenseDamagePerRound: 137,
    defenseKills: 8
  },
  sentinel: {
    killsPerMatch: 17,
    deathsPerMatch: 12,
    assistsPerMatch: 7,
    scorePerRound: 214,
    headshotsPercentage: 22,
    damagePerRound: 145,
    econRating: 76,
    attackRoundsPlayed: 12,
    attackRoundsWon: 6,
    attackFirstBloods: 2,
    attackFirstDeaths: 2,
    attackSurvived: 8,
    attackTraded: 3,
    attackKAST: 74,
    attackDamagePerRound: 141,
    attackKills: 8,
    defenseRoundsPlayed: 12,
    defenseRoundsWon: 7,
    defenseFirstBloods: 2,
    defenseFirstDeaths: 1,
    defenseSurvived: 9,
    defenseTraded: 4,
    defenseKAST: 80,
    defenseDamagePerRound: 148,
    defenseKills: 9
  }
};

function statValue(segment = {}, key, fallback = 0) {
  return safeNumber(segment?.stats?.[key]?.value, fallback);
}

async function readJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  return raw ? JSON.parse(raw) : {};
}

async function riotFetch(region, pathname) {
  if (!RIOT_API_KEY) {
    throw new Error("Server Riot API key is not configured");
  }

  const url = `https://${region}.api.riotgames.com${pathname}`;
  const res = await fetch(url, {
    headers: {
      "X-Riot-Token": RIOT_API_KEY
    }
  });

  if (res.status === 429) {
    throw new Error("Riot API rate limited");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Riot API ${res.status}: ${text}`);
  }

  return res.json();
}

async function getPuuidFromRiotId(region, riotId) {
  const { gameName, tagLine } = parseRiotId(riotId);
  if (!gameName || !tagLine) {
    throw new Error("Invalid Riot ID");
  }

  const data = await riotFetch(
    region,
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );

  return data?.puuid || "";
}

async function getMatchIds(region, puuid, count = 10) {
  const data = await riotFetch(
    region,
    `/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}?size=${count}`
  );

  return Array.isArray(data?.history) ? data.history.map(item => item.matchId).filter(Boolean) : [];
}

async function getMatch(region, matchId) {
  return riotFetch(region, `/val/match/v1/matches/${encodeURIComponent(matchId)}`);
}

function isCompetitiveMatch(match = {}) {
  const candidates = [
    match.queueId,
    match.queueID,
    match.gameMode,
    match.modeName,
    match.matchInfo?.queueId,
    match.matchInfo?.queueID,
    match.matchInfo?.gameMode,
    match.matchInfo?.modeName
  ]
    .filter(Boolean)
    .map(value => String(value).toLowerCase());

  if (!candidates.length) {
    return true;
  }

  return candidates.some(value =>
    value.includes("competitive") ||
    value.includes("ranked") ||
    value === "queue"
  );
}

function normalizeMatchRecord(match = {}, puuid) {
  const players = match.players || match.matchInfo?.players || [];
  const player = players.find(p => p.puuid === puuid);
  if (!player) return null;

  const stats = player.stats || {};
  const team = player.teamId;
  const teams = match.teams || match.matchInfo?.teams || [];
  const teamData = teams.find(t => t.teamId === team);
  const rounds = match.roundResults || match.matchInfo?.roundResults || [];
  const won = teamData?.won === true;

  return {
    id: match.matchId || match.matchInfo?.matchId || `${puuid}-${match.gameStartMillis || Date.now()}`,
    matchId: match.matchId || match.matchInfo?.matchId || "",
    result: won ? "win" : "loss",
    rr: won ? 18 : -16,
    createdAt: match.gameStartMillis
      ? new Date(match.gameStartMillis).toISOString()
      : nowISO(),
    metadata: {
      result: won ? "win" : "loss",
      mapName: match.mapId || match.matchInfo?.mapId || "Unknown",
      agent: player.characterId?.split("::").pop() || "Unknown",
      playedAt: match.gameStartMillis
        ? new Date(match.gameStartMillis).toISOString()
        : nowISO()
    },
    segments: [
      {
        stats: {
          kills: { value: safeNumber(stats.kills) },
          deaths: { value: safeNumber(stats.deaths) },
          assists: { value: safeNumber(stats.assists) },
          scorePerRound: {
            value: safeNumber(stats.score / (rounds.length || 1))
          },
          headshotsPercentage: {
            value: stats.headshots && stats.kills
              ? (stats.headshots / stats.kills) * 100
              : 0
          }
        }
      }
    ]
  };
}

function readExampleFixture() {
  const raw = fs.readFileSync(EXAMPLE_FIXTURE_PATH, "utf8");
  return JSON.parse(raw);
}

function buildDemoAnalytics(fixture = {}) {
  const segments = fixture?.data?.segments || [];
  const season = segments.find(segment => segment.type === "season") || {};
  const currentAct = season?.metadata?.shortName || season?.metadata?.name || "Current Act";
  const roleSegments = segments.filter(segment => segment.type === "agent-role");
  const normalizedRoles = roleSegments
    .map(segment => ({
      role: segment?.metadata?.name || "Unknown",
      matchesPlayed: statValue(segment, "matchesPlayed"),
      matchesWon: statValue(segment, "matchesWon"),
      matchesLost: statValue(segment, "matchesLost"),
      kd: statValue(segment, "kDRatio"),
      adr: statValue(segment, "damagePerRound"),
      damageDeltaPerRound: statValue(segment, "damageDeltaPerRound"),
      hs: statValue(segment, "headshotsPercentage"),
      kast: statValue(segment, "kAST"),
      kills2K: statValue(segment, "kills2K"),
      kills3K: statValue(segment, "kills3K"),
      kills4K: statValue(segment, "kills4K"),
      kills5K: statValue(segment, "kills5K"),
      scorePerRound: statValue(segment, "scorePerRound"),
      imageUrl: segment?.metadata?.imageUrl || ""
    }));
  const roleMap = normalizedRoles.reduce((acc, role) => {
    acc[String(role.role || "").toLowerCase()] = role;
    return acc;
  }, {});
  ["duelist", "initiator", "controller", "sentinel"].forEach(role => {
    if (roleMap[role] && safeNumber(roleMap[role].matchesPlayed) >= 10) return;
    const fallback = DEFAULT_ROLE_BASELINES[role];
    const nextRole = {
      role: titleCase(role),
      matchesPlayed: Math.max(10, safeNumber(roleMap[role]?.matchesPlayed)),
      matchesWon: Math.max(role === "duelist" ? 6 : 5, safeNumber(roleMap[role]?.matchesWon)),
      matchesLost: Math.max(4, safeNumber(roleMap[role]?.matchesLost)),
      kd: safeNumber(roleMap[role]?.kd) || safeDivide(fallback.killsPerMatch, fallback.deathsPerMatch),
      adr: safeNumber(roleMap[role]?.adr) || fallback.damagePerRound,
      hs: safeNumber(roleMap[role]?.hs) || fallback.headshotsPercentage,
      kast: safeNumber(roleMap[role]?.kast) || ((safeNumber(fallback.attackKAST) + safeNumber(fallback.defenseKAST)) / 2),
      scorePerRound: safeNumber(roleMap[role]?.scorePerRound) || fallback.scorePerRound,
      imageUrl: roleMap[role]?.imageUrl || ""
    };

    if (roleMap[role]) {
      const existingIndex = normalizedRoles.findIndex(entry => String(entry?.role || "").toLowerCase() === role);
      if (existingIndex >= 0) normalizedRoles[existingIndex] = nextRole;
    } else {
      normalizedRoles.push(nextRole);
    }
  });

  return {
    source: "example-fixture",
    currentAct,
    acts: [currentAct],
    profile: {
      riotId: fixture?.data?.platformInfo?.platformUserIdentifier || "",
      region: String(fixture?.data?.metadata?.activeShard || "").toUpperCase()
    },
    overview: {
      matchesPlayed: statValue(season, "matchesPlayed"),
      matchesWon: statValue(season, "matchesWon"),
      matchesLost: statValue(season, "matchesLost"),
      roundsPlayed: statValue(season, "roundsPlayed"),
      roundsWon: statValue(season, "roundsWon"),
      roundsWinPct: statValue(season, "roundsWinPct"),
      winrate: statValue(season, "matchesWinPct"),
      kd: statValue(season, "kDRatio"),
      adr: statValue(season, "damagePerRound"),
      damageDeltaPerRound: statValue(season, "damageDeltaPerRound"),
      hs: statValue(season, "headshotsPercentage"),
      econ: statValue(season, "econRating"),
      kast: statValue(season, "kAST"),
      attackKAST: statValue(season, "attackKAST"),
      defenseKAST: statValue(season, "defenseKAST"),
      kills2K: statValue(season, "kills2K"),
      kills3K: statValue(season, "kills3K"),
      kills4K: statValue(season, "kills4K"),
      kills5K: statValue(season, "kills5K")
    },
    maps: segments
      .filter(segment => segment.type === "agent-top-map")
      .map(segment => ({
        map: titleCase(segment?.attributes?.mapKey || "Unknown"),
        agent: segment?.metadata?.name || "Unknown",
        matchesPlayed: statValue(segment, "matchesPlayed"),
        matchesWon: statValue(segment, "matchesWon"),
        matchesLost: statValue(segment, "matchesLost"),
        roundsPlayed: statValue(segment, "roundsPlayed"),
        roundsWon: statValue(segment, "roundsWon"),
        kd: statValue(segment, "kDRatio"),
        adr: statValue(segment, "damagePerRound"),
        hs: statValue(segment, "headshotsPercentage"),
        kast: statValue(segment, "kAST"),
        scorePerRound: statValue(segment, "scorePerRound"),
        attackWinPct: statValue(segment, "attackRoundsWinPct"),
        attackRoundsPlayed: statValue(segment, "attackRoundsPlayed"),
        attackRoundsWon: statValue(segment, "attackRoundsWon"),
        attackFirstBloods: statValue(segment, "attackFirstBloods"),
        attackFirstDeaths: statValue(segment, "attackFirstDeaths"),
        attackSurvived: statValue(segment, "attackSurvived"),
        attackTraded: statValue(segment, "attackTraded"),
        attackKAST: statValue(segment, "attackKAST"),
        attackDamagePerRound: statValue(segment, "attackDamagePerRound"),
        defenseWinPct: statValue(segment, "defenseRoundsWinPct"),
        defenseRoundsPlayed: statValue(segment, "defenseRoundsPlayed"),
        defenseRoundsWon: statValue(segment, "defenseRoundsWon"),
        defenseFirstBloods: statValue(segment, "defenseFirstBloods"),
        defenseFirstDeaths: statValue(segment, "defenseFirstDeaths"),
        defenseSurvived: statValue(segment, "defenseSurvived"),
        defenseTraded: statValue(segment, "defenseTraded"),
        defenseKAST: statValue(segment, "defenseKAST"),
        defenseDamagePerRound: statValue(segment, "defenseDamagePerRound"),
        attackKills: statValue(segment, "attackKills"),
        defenseKills: statValue(segment, "defenseKills"),
        econ: statValue(segment, "econRating")
      })),
    agents: segments
      .filter(segment => segment.type === "agent")
      .map(segment => ({
        agent: segment?.metadata?.name || "Unknown",
        matchesPlayed: statValue(segment, "matchesPlayed"),
        matchesWon: statValue(segment, "matchesWon"),
        matchesLost: statValue(segment, "matchesLost"),
        kd: statValue(segment, "kDRatio"),
        adr: statValue(segment, "damagePerRound"),
        damageDeltaPerRound: statValue(segment, "damageDeltaPerRound"),
        hs: statValue(segment, "headshotsPercentage"),
        kast: statValue(segment, "kAST"),
        econ: statValue(segment, "econRating"),
        scorePerRound: statValue(segment, "scorePerRound"),
        kills: statValue(segment, "kills"),
        deaths: statValue(segment, "deaths"),
        kills2K: statValue(segment, "kills2K"),
        kills3K: statValue(segment, "kills3K"),
        kills4K: statValue(segment, "kills4K"),
        kills5K: statValue(segment, "kills5K")
      })),
    roles: normalizedRoles
  };
}

function buildSyntheticMatchesFromFixture(fixture = {}) {
  const segments = fixture?.data?.segments || [];
  const mapSegments = segments.filter(segment => segment.type === "agent-top-map");
  const roleSegments = segments.filter(segment => segment.type === "agent-role");
  const synthetic = [];
  let gameIndex = 0;
  const matchVariants = [
    { label: "carry", killMult: 1.28, killOffset: 4, deathMult: 0.82, deathOffset: -2, assistMult: 1.05, assistOffset: 1, acsMult: 1.2, acsOffset: 24 },
    { label: "steady", killMult: 1.08, killOffset: 2, deathMult: 0.96, deathOffset: 0, assistMult: 1.12, assistOffset: 1, acsMult: 1.08, acsOffset: 12 },
    { label: "support", killMult: 0.92, killOffset: -1, deathMult: 0.94, deathOffset: -1, assistMult: 1.42, assistOffset: 3, acsMult: 0.94, acsOffset: -4 },
    { label: "scrappy", killMult: 1.02, killOffset: 1, deathMult: 1.12, deathOffset: 2, assistMult: 0.9, assistOffset: 0, acsMult: 0.98, acsOffset: 6 },
    { label: "rough", killMult: 0.78, killOffset: -3, deathMult: 1.24, deathOffset: 3, assistMult: 0.88, assistOffset: -1, acsMult: 0.82, acsOffset: -18 }
  ];

  const clampStat = (value, min, max) => Math.max(min, Math.min(max, safeInt(value)));
  const seededUnit = seed => {
    const raw = Math.sin(seed * 12.9898) * 43758.5453;
    return raw - Math.floor(raw);
  };
  const seedFromMatch = (segmentKey, matchOffset, absoluteIndex, channel) => {
    const keyScore = String(segmentKey || "match")
      .split("")
      .reduce((sum, char, idx) => sum + (char.charCodeAt(0) * (idx + 1)), 0);
    return keyScore + (matchOffset * 37) + (absoluteIndex * 101) + (channel * 503);
  };
  const buildRoundSet = ({ attack = {}, defense = {} } = {}) => {
    const utilitySpend = ["Full Util", "Light Util", "No Util"];
    const firstDeathLane = ["A Main", "Mid", "B Main", "A Link", "C Long"];
    const firstKillLane = ["Site Entry", "Mid Split", "Retake Lane", "Anchor Hold", "Flank"];

    return Array.from({ length: 6 }, (_, roundIndex) => {
      const side = roundIndex < 3 ? "attack" : "defense";
      const sideStats = side === "attack" ? attack : defense;
      const roundsPlayed = Math.max(1, safeNumber(sideStats.roundsPlayed, 12));
      const projectedWins = Math.max(0, Math.min(3, Math.round((safeNumber(sideStats.winPct || safeDivide(safeNumber(sideStats.roundsWon) * 100, roundsPlayed)) / 100) * 3)));
      const projectedFirstBloods = Math.max(0, Math.min(3, Math.round((safeNumber(sideStats.firstBloods) / roundsPlayed) * 3)));
      const projectedFirstDeaths = Math.max(0, Math.min(3, Math.round((safeNumber(sideStats.firstDeaths) / roundsPlayed) * 3)));
      const sideRoundIndex = side === "attack" ? roundIndex : roundIndex - 3;

      return {
        round: roundIndex + 1,
        side,
        roundWon: sideRoundIndex < projectedWins,
        firstEvent: sideRoundIndex < projectedFirstBloods ? "first-blood" : (sideRoundIndex < projectedFirstBloods + projectedFirstDeaths ? "first-death" : "neutral"),
        buyType: roundIndex % 3 === 0 ? "eco" : roundIndex % 3 === 1 ? "light-buy" : "full-buy",
        weapon: roundIndex % 4 === 0 ? "Vandal" : roundIndex % 4 === 1 ? "Phantom" : roundIndex % 4 === 2 ? "Sheriff" : "Spectre",
        utility: utilitySpend[roundIndex % utilitySpend.length],
        firstKillLocation: firstKillLane[roundIndex % firstKillLane.length],
        firstDeathLocation: firstDeathLane[roundIndex % firstDeathLane.length],
        utilityPattern: roundIndex % 2 === 0 ? "Used utility before contact" : "Took first duel before utility"
      };
    });
  };
  const createSyntheticMatch = ({
    key = "match",
    mapName = "Unknown",
    agent = "Jett",
    result = "win",
    variantIndex = 0,
    statSeedIndex = 0,
    base = {}
  } = {}) => {
    const variant = matchVariants[variantIndex % matchVariants.length];
    const playedAt = new Date(Date.now() - (gameIndex * 4.5 * 36e5)).toISOString();
    const killNoise = (seededUnit(seedFromMatch(key, statSeedIndex, gameIndex, 1)) - 0.5) * 8;
    const deathNoise = (seededUnit(seedFromMatch(key, statSeedIndex, gameIndex, 2)) - 0.5) * 6;
    const assistNoise = (seededUnit(seedFromMatch(key, statSeedIndex, gameIndex, 3)) - 0.5) * 5;
    const acsNoise = (seededUnit(seedFromMatch(key, statSeedIndex, gameIndex, 4)) - 0.5) * 36;
    const hsNoise = (seededUnit(seedFromMatch(key, statSeedIndex, gameIndex, 5)) - 0.5) * 8;
    const adrNoise = (seededUnit(seedFromMatch(key, statSeedIndex, gameIndex, 6)) - 0.5) * 28;
    const econNoise = (seededUnit(seedFromMatch(key, statSeedIndex, gameIndex, 7)) - 0.5) * 16;
    const killsValue = clampStat((safeNumber(base.killsPerMatch) * variant.killMult) + variant.killOffset + killNoise, 5, 36);
    const deathsValue = clampStat((safeNumber(base.deathsPerMatch) * variant.deathMult) + variant.deathOffset + deathNoise, 4, 28);
    const assistsValue = clampStat((safeNumber(base.assistsPerMatch) * variant.assistMult) + variant.assistOffset + assistNoise, 0, 18);
    const acsValue = clampStat((safeNumber(base.scorePerRound) * variant.acsMult) + variant.acsOffset + acsNoise, 110, 360);
    const hsValue = clampStat(safeNumber(base.headshotsPercentage) + ((variant.killMult - 1) * 8) + hsNoise, 8, 42);
    const adrValue = clampStat((safeNumber(base.damagePerRound) * variant.acsMult) + variant.acsOffset + adrNoise, 80, 260);
    const econValue = clampStat(safeNumber(base.econRating) + econNoise, 20, 140);
    const rrValue = result === "win"
      ? clampStat(16 + Math.max(0, Math.round((acsValue - 180) / 18)), 16, 28)
      : result === "loss"
        ? -clampStat(14 + Math.max(0, Math.round((180 - acsValue) / 30)), 12, 22)
        : 0;
    const attack = {
      roundsPlayed: safeNumber(base.attackRoundsPlayed, 12),
      roundsWon: safeNumber(base.attackRoundsWon, 6),
      firstBloods: safeNumber(base.attackFirstBloods, 2),
      firstDeaths: safeNumber(base.attackFirstDeaths, 2),
      survived: safeNumber(base.attackSurvived, 6),
      traded: safeNumber(base.attackTraded, 3),
      winPct: safeDivide(safeNumber(base.attackRoundsWon, 6) * 100, safeNumber(base.attackRoundsPlayed, 12)),
      kills: safeNumber(base.attackKills, Math.round(killsValue * 0.55)),
      damagePerRound: safeNumber(base.attackDamagePerRound, adrValue),
      kast: safeNumber(base.attackKAST, 72)
    };
    const defense = {
      roundsPlayed: safeNumber(base.defenseRoundsPlayed, 12),
      roundsWon: safeNumber(base.defenseRoundsWon, 6),
      firstBloods: safeNumber(base.defenseFirstBloods, 2),
      firstDeaths: safeNumber(base.defenseFirstDeaths, 2),
      survived: safeNumber(base.defenseSurvived, 6),
      traded: safeNumber(base.defenseTraded, 3),
      winPct: safeDivide(safeNumber(base.defenseRoundsWon, 6) * 100, safeNumber(base.defenseRoundsPlayed, 12)),
      kills: safeNumber(base.defenseKills, Math.round(killsValue * 0.45)),
      damagePerRound: safeNumber(base.defenseDamagePerRound, adrValue),
      kast: safeNumber(base.defenseKAST, 72)
    };

    const match = {
      id: `demo_${key}_${gameIndex + 1}`,
      rr: rrValue,
      result,
      createdAt: playedAt,
      metadata: {
        result,
        mapName: mapName,
        agent,
        playedAt,
        source: "demo-fixture",
        demoVariant: variant.label
      },
      segments: [
        {
          stats: {
            kills: { value: killsValue },
            deaths: { value: deathsValue },
            assists: { value: assistsValue },
            scorePerRound: { value: acsValue },
            headshotsPercentage: { value: hsValue },
            damagePerRound: { value: adrValue },
            econRating: { value: econValue }
          }
        }
      ],
      advanced: {
        attack,
        defense,
        rounds: buildRoundSet({ attack, defense })
      }
    };

    gameIndex += 1;
    return match;
  };

  mapSegments.forEach(segment => {
    const games = Math.max(0, safeInt(statValue(segment, "matchesPlayed")));
    const wins = Math.min(games, Math.max(0, safeInt(statValue(segment, "matchesWon"))));
    const losses = Math.max(0, games - wins);

    const killsPerMatch = games ? statValue(segment, "kills") / games : 0;
    const deathsPerMatch = games ? statValue(segment, "deaths") / games : 0;
    const assistsPerMatch = games ? statValue(segment, "assists") / games : 0;
    const baseAcs = statValue(segment, "scorePerRound");
    const baseHs = statValue(segment, "headshotsPercentage");
    const baseAdr = statValue(segment, "damagePerRound");
    const baseEcon = statValue(segment, "econRating");

    for (let i = 0; i < games; i += 1) {
      const result = i < wins ? "win" : (i < wins + losses ? "loss" : "draw");
      synthetic.push(createSyntheticMatch({
        key: segment?.attributes?.key || "match",
        mapName: titleCase(segment?.attributes?.mapKey || "Unknown"),
        agent: segment?.metadata?.name || "Unknown",
        result,
        variantIndex: gameIndex,
        statSeedIndex: i,
        base: {
          killsPerMatch,
          deathsPerMatch,
          assistsPerMatch,
          scorePerRound: baseAcs,
          headshotsPercentage: baseHs,
          damagePerRound: baseAdr,
          econRating: baseEcon,
          attackRoundsPlayed: statValue(segment, "attackRoundsPlayed"),
          attackRoundsWon: statValue(segment, "attackRoundsWon"),
          attackFirstBloods: statValue(segment, "attackFirstBloods"),
          attackFirstDeaths: statValue(segment, "attackFirstDeaths"),
          attackSurvived: statValue(segment, "attackSurvived"),
          attackTraded: statValue(segment, "attackTraded"),
          attackKAST: statValue(segment, "attackKAST"),
          attackDamagePerRound: statValue(segment, "attackDamagePerRound"),
          attackKills: statValue(segment, "attackKills"),
          defenseRoundsPlayed: statValue(segment, "defenseRoundsPlayed"),
          defenseRoundsWon: statValue(segment, "defenseRoundsWon"),
          defenseFirstBloods: statValue(segment, "defenseFirstBloods"),
          defenseFirstDeaths: statValue(segment, "defenseFirstDeaths"),
          defenseSurvived: statValue(segment, "defenseSurvived"),
          defenseTraded: statValue(segment, "defenseTraded"),
          defenseKAST: statValue(segment, "defenseKAST"),
          defenseDamagePerRound: statValue(segment, "defenseDamagePerRound"),
          defenseKills: statValue(segment, "defenseKills")
        }
      }));
    }
  });

  const roleCounts = synthetic.reduce((acc, match) => {
    const role = AGENT_ROLE_MAP[match?.metadata?.agent] || "duelist";
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
  const roleSegmentMap = roleSegments.reduce((acc, segment) => {
    acc[String(segment?.metadata?.name || "").toLowerCase()] = segment;
    return acc;
  }, {});

  ["duelist", "initiator", "controller", "sentinel"].forEach(role => {
    const currentCount = roleCounts[role] || 0;
    const needed = Math.max(0, 10 - currentCount);
    const roleSegment = roleSegmentMap[role];
    const fallback = DEFAULT_ROLE_BASELINES[role];
    const base = roleSegment
      ? {
          killsPerMatch: safeDivide(statValue(roleSegment, "kills"), Math.max(1, statValue(roleSegment, "matchesPlayed"))) || fallback.killsPerMatch,
          deathsPerMatch: safeDivide(statValue(roleSegment, "deaths"), Math.max(1, statValue(roleSegment, "matchesPlayed"))) || fallback.deathsPerMatch,
          assistsPerMatch: safeDivide(statValue(roleSegment, "assists"), Math.max(1, statValue(roleSegment, "matchesPlayed"))) || fallback.assistsPerMatch,
          scorePerRound: statValue(roleSegment, "scorePerRound") || fallback.scorePerRound,
          headshotsPercentage: statValue(roleSegment, "headshotsPercentage") || fallback.headshotsPercentage,
          damagePerRound: statValue(roleSegment, "damagePerRound") || fallback.damagePerRound,
          econRating: statValue(roleSegment, "econRating") || fallback.econRating,
          attackRoundsPlayed: fallback.attackRoundsPlayed,
          attackRoundsWon: fallback.attackRoundsWon,
          attackFirstBloods: fallback.attackFirstBloods,
          attackFirstDeaths: fallback.attackFirstDeaths,
          attackSurvived: fallback.attackSurvived,
          attackTraded: fallback.attackTraded,
          attackKAST: fallback.attackKAST,
          attackDamagePerRound: fallback.attackDamagePerRound,
          attackKills: fallback.attackKills,
          defenseRoundsPlayed: fallback.defenseRoundsPlayed,
          defenseRoundsWon: fallback.defenseRoundsWon,
          defenseFirstBloods: fallback.defenseFirstBloods,
          defenseFirstDeaths: fallback.defenseFirstDeaths,
          defenseSurvived: fallback.defenseSurvived,
          defenseTraded: fallback.defenseTraded,
          defenseKAST: fallback.defenseKAST,
          defenseDamagePerRound: fallback.defenseDamagePerRound,
          defenseKills: fallback.defenseKills
        }
      : fallback;

    for (let i = 0; i < needed; i += 1) {
      const agent = ROLE_AGENT_ROTATIONS[role][(currentCount + i) % ROLE_AGENT_ROTATIONS[role].length];
      const result = i % 5 === 4 ? "loss" : "win";
      const mapName = DEMO_MAP_POOL[(gameIndex + i) % DEMO_MAP_POOL.length];
      synthetic.push(createSyntheticMatch({
        key: `${role}_${agent}`,
        mapName,
        agent,
        result,
        variantIndex: currentCount + i,
        statSeedIndex: currentCount + i,
        base
      }));
    }
  });

  return synthetic;
}

async function handleRiotImport(req, res) {
  try {
    const body = await readJsonBody(req);
    const riotId = String(body.riotId || "").trim();
    const region = normalizeRiotRegion(body.region);
    const count = Math.min(20, Math.max(1, Number(body.count || 10)));

    if (!riotId) {
      sendJson(res, 400, { error: "Missing Riot ID" });
      return;
    }

    const puuid = await getPuuidFromRiotId(region, riotId);
    const matchIds = await getMatchIds(region, puuid, count);

    if (!matchIds.length) {
      sendJson(res, 200, { matches: [], count: 0 });
      return;
    }

    const matchResults = await Promise.allSettled(
      matchIds.map(matchId => getMatch(region, matchId))
    );

    const matches = matchResults
      .filter(result => result.status === "fulfilled")
      .map(result => result.value)
      .filter(match => isCompetitiveMatch(match))
      .map(match => normalizeMatchRecord(match, puuid))
      .filter(Boolean);

    sendJson(res, 200, {
      matches,
      count: matches.length,
      riotId,
      region
    });
  } catch (error) {
    console.error("RIOT IMPORT ERROR", error);
    sendJson(res, 500, { error: error.message || "Failed to import Riot matches" });
  }
}

async function handleDemoImport(_req, res) {
  try {
    const fixture = readExampleFixture();
    const matches = buildSyntheticMatchesFromFixture(fixture);
    const analytics = buildDemoAnalytics(fixture);

    sendJson(res, 200, {
      matches,
      analytics,
      count: matches.length,
      source: "demo-fixture",
      riotId: analytics?.profile?.riotId || "",
      region: analytics?.profile?.region || ""
    });
  } catch (error) {
    console.error("DEMO IMPORT ERROR", error);
    sendJson(res, 500, { error: error.message || "Failed to import demo fixture" });
  }
}

async function handleThemeSnapshot(req, res) {
  try {
    const raw = await readRequestBody(req);
    const payload = raw ? JSON.parse(raw) : {};
    const hasSnapshotContent = Boolean(
      payload &&
      typeof payload === "object" &&
      !Array.isArray(payload) &&
      payload.snapshotType === "theme" &&
      (
        Object.keys(payload.themeBuilder?.allThemes || {}).length ||
        Object.keys(payload.themeBuilder?.currentThemeState || {}).length ||
        (Array.isArray(payload.overlayMeasurements) && payload.overlayMeasurements.length)
      )
    );

    if (!hasSnapshotContent) {
      sendJson(res, 400, {
        ok: false,
        error: "Theme snapshot payload was empty or invalid. Existing snapshot was left unchanged."
      });
      return;
    }

    const serialized = JSON.stringify(payload, null, 2);
    fs.mkdirSync(path.dirname(THEME_SNAPSHOT_PATH), { recursive: true });
    fs.writeFileSync(THEME_SNAPSHOT_PATH, serialized);
    if (fs.existsSync(LEGACY_OVERLAY_SNAPSHOT_PATH)) {
      fs.unlinkSync(LEGACY_OVERLAY_SNAPSHOT_PATH);
    }
    sendJson(res, 200, {
      ok: true,
      path: THEME_SNAPSHOT_PATH,
      legacyPath: fs.existsSync(LEGACY_OVERLAY_SNAPSHOT_PATH) ? LEGACY_OVERLAY_SNAPSHOT_PATH : null,
      savedAt: new Date().toISOString()
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error?.message || "Failed to save theme snapshot."
    });
  }
}

function handleThemeSnapshotRead(res) {
  try {
    const snapshotPath = fs.existsSync(THEME_SNAPSHOT_PATH)
      ? THEME_SNAPSHOT_PATH
      : LEGACY_OVERLAY_SNAPSHOT_PATH;

    if (!fs.existsSync(snapshotPath)) {
      sendJson(res, 404, { ok: false, error: "No theme snapshot saved yet." });
      return;
    }

    const raw = fs.readFileSync(snapshotPath, "utf8");
    sendJson(res, 200, {
      ok: true,
      path: snapshotPath,
      snapshot: raw ? JSON.parse(raw) : {}
    });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error?.message || "Failed to read theme snapshot."
    });
  }
}

const handleOverlaySnapshot = handleThemeSnapshot;
const handleOverlaySnapshotRead = handleThemeSnapshotRead;

function serveStatic(req, res, pathname) {
  const target = pathname === "/" ? "/Active-Edit.html" : pathname;
  const resolved = path.normalize(path.join(ROOT, target));

  if (!resolved.startsWith(ROOT)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(resolved, (err, data) => {
    if (err) {
      if (err.code === "ENOENT") {
        sendJson(res, 404, { error: "Not found" });
        return;
      }

      sendJson(res, 500, { error: "Failed to read file" });
      return;
    }

    const ext = path.extname(resolved).toLowerCase();
    res.writeHead(200, {
      "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream"
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    });
    res.end();
    return;
  }

  if (url.pathname === "/api/riot/health" && req.method === "GET") {
    sendJson(res, 200, {
      ok: true,
      configured: Boolean(RIOT_API_KEY)
    });
    return;
  }

  if (url.pathname === "/api/riot/import-matches" && req.method === "POST") {
    await handleRiotImport(req, res);
    return;
  }

  if (url.pathname === "/api/demo/import-example" && req.method === "GET") {
    await handleDemoImport(req, res);
    return;
  }

  if (url.pathname === "/api/dev/theme-snapshot" && req.method === "POST") {
    await handleThemeSnapshot(req, res);
    return;
  }

  if (url.pathname === "/api/dev/theme-snapshot" && req.method === "GET") {
    handleThemeSnapshotRead(res);
    return;
  }

  if (url.pathname === "/api/dev/overlay-snapshot" && req.method === "POST") {
    await handleOverlaySnapshot(req, res);
    return;
  }

  if (url.pathname === "/api/dev/overlay-snapshot" && req.method === "GET") {
    handleOverlaySnapshotRead(res);
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`Live-App server running at http://${HOST}:${PORT}`);
  if (!RIOT_API_KEY) {
    console.warn("RIOT_API_KEY is not set. Riot import routes will fail until configured.");
  }
});
