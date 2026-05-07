function jsonResponse(payload, init = {}) {
  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  return new Response(JSON.stringify(payload), {
    ...init,
    headers
  });
}

function safeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function nowISO() {
  return new Date().toISOString();
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

async function riotFetch(apiKey, region, pathname) {
  if (!apiKey) {
    throw new Error("Server Riot API key is not configured");
  }

  const response = await fetch(`https://${region}.api.riotgames.com${pathname}`, {
    headers: {
      "X-Riot-Token": apiKey
    }
  });

  if (response.status === 429) {
    throw new Error("Riot API rate limited");
  }

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Riot API ${response.status}: ${text}`);
  }

  return response.json();
}

async function getPuuidFromRiotId(apiKey, region, riotId) {
  const { gameName, tagLine } = parseRiotId(riotId);

  if (!gameName || !tagLine) {
    throw new Error("Invalid Riot ID");
  }

  const payload = await riotFetch(
    apiKey,
    region,
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`
  );

  return payload?.puuid || "";
}

async function getMatchIds(apiKey, region, puuid, count = 10) {
  const payload = await riotFetch(
    apiKey,
    region,
    `/val/match/v1/matchlists/by-puuid/${encodeURIComponent(puuid)}?size=${count}`
  );

  return Array.isArray(payload?.history)
    ? payload.history.map(item => item.matchId).filter(Boolean)
    : [];
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
  const player = players.find(entry => entry.puuid === puuid);

  if (!player) {
    return null;
  }

  const stats = player.stats || {};
  const team = player.teamId;
  const teams = match.teams || match.matchInfo?.teams || [];
  const teamData = teams.find(entry => entry.teamId === team);
  const rounds = match.roundResults || match.matchInfo?.roundResults || [];
  const won = teamData?.won === true;

  return {
    id: match.matchId || match.matchInfo?.matchId || `${puuid}-${match.gameStartMillis || Date.now()}`,
    matchId: match.matchId || match.matchInfo?.matchId || "",
    result: won ? "win" : "loss",
    rr: won ? 18 : -16,
    createdAt: match.gameStartMillis ? new Date(match.gameStartMillis).toISOString() : nowISO(),
    metadata: {
      result: won ? "win" : "loss",
      mapName: match.mapId || match.matchInfo?.mapId || "Unknown",
      agent: player.characterId?.split("::").pop() || "Unknown",
      playedAt: match.gameStartMillis ? new Date(match.gameStartMillis).toISOString() : nowISO()
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
            value: stats.headshots && stats.kills ? (stats.headshots / stats.kills) * 100 : 0
          }
        }
      }
    ]
  };
}

async function importRiotMatches({ apiKey, riotId, region, count }) {
  const normalizedRegion = normalizeRiotRegion(region);
  const normalizedCount = Math.min(20, Math.max(1, Number(count || 10)));
  const puuid = await getPuuidFromRiotId(apiKey, normalizedRegion, riotId);
  const matchIds = await getMatchIds(apiKey, normalizedRegion, puuid, normalizedCount);

  if (!matchIds.length) {
    return {
      matches: [],
      count: 0,
      riotId,
      region: normalizedRegion
    };
  }

  const matchResults = await Promise.allSettled(
    matchIds.map(matchId => riotFetch(apiKey, normalizedRegion, `/val/match/v1/matches/${encodeURIComponent(matchId)}`))
  );

  const matches = matchResults
    .filter(result => result.status === "fulfilled")
    .map(result => result.value)
    .filter(match => isCompetitiveMatch(match))
    .map(match => normalizeMatchRecord(match, puuid))
    .filter(Boolean);

  return {
    matches,
    count: matches.length,
    riotId,
    region: normalizedRegion
  };
}

export {
  importRiotMatches,
  jsonResponse
};
