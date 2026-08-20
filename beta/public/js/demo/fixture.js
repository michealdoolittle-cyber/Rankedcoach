const DEMO_PUUID = "demo-player-puuid";
const TEAM = "Blue";
const ENEMY = "Red";

const MATCHES = [
  { id: "demo-match-014", daysAgo: 0, agent: "Jett", map: "Ascent", role: "Duelist", result: "win", score: [13, 8], rank: "Ascendant 2", rr: 72, delta: 23, kills: 22, deaths: 14, assists: 5, acs: 258, damage: 3450, hs: 24, body: 62, legs: 14, weapon: "Vandal" },
  { id: "demo-match-013", daysAgo: 2, agent: "Omen", map: "Lotus", role: "Controller", result: "loss", score: [10, 13], rank: "Ascendant 1", rr: 49, delta: -18, kills: 15, deaths: 18, assists: 9, acs: 181, damage: 2920, hs: 18, body: 58, legs: 18, weapon: "Phantom" },
  { id: "demo-match-012", daysAgo: 4, agent: "Skye", map: "Split", role: "Initiator", result: "win", score: [13, 11], rank: "Ascendant 1", rr: 67, delta: 19, kills: 18, deaths: 16, assists: 14, acs: 214, damage: 3224, hs: 20, body: 70, legs: 16, weapon: "Vandal" },
  { id: "demo-match-011", daysAgo: 7, agent: "Killjoy", map: "Sunset", role: "Sentinel", result: "win", score: [13, 9], rank: "Ascendant 1", rr: 48, delta: 17, kills: 16, deaths: 13, assists: 7, acs: 194, damage: 2846, hs: 16, body: 61, legs: 18, weapon: "Phantom" },
  { id: "demo-match-010", daysAgo: 10, agent: "Raze", map: "Bind", role: "Duelist", result: "loss", score: [11, 13], rank: "Diamond 3", rr: 31, delta: -16, kills: 21, deaths: 21, assists: 4, acs: 232, damage: 3310, hs: 14, body: 66, legs: 20, weapon: "Vandal" },
  { id: "demo-match-009", daysAgo: 13, agent: "Sova", map: "Haven", role: "Initiator", result: "win", score: [13, 7], rank: "Diamond 3", rr: 47, delta: 20, kills: 17, deaths: 10, assists: 16, acs: 221, damage: 3040, hs: 21, body: 62, legs: 13, weapon: "Guardian" },
  { id: "demo-match-008", daysAgo: 16, agent: "Chamber", map: "Breeze", role: "Sentinel", result: "loss", score: [8, 13], rank: "Diamond 3", rr: 27, delta: -17, kills: 14, deaths: 18, assists: 3, acs: 176, damage: 2450, hs: 23, body: 47, legs: 16, weapon: "Operator" },
  { id: "demo-match-007", daysAgo: 19, agent: "Astra", map: "Pearl", role: "Controller", result: "win", score: [14, 12], rank: "Diamond 3", rr: 44, delta: 18, kills: 16, deaths: 17, assists: 13, acs: 188, damage: 2990, hs: 17, body: 65, legs: 19, weapon: "Phantom" },
  { id: "demo-match-006", daysAgo: 22, agent: "Fade", map: "Fracture", role: "Initiator", result: "loss", score: [9, 13], rank: "Diamond 2", rr: 26, delta: -14, kills: 13, deaths: 16, assists: 12, acs: 172, damage: 2440, hs: 12, body: 52, legs: 17, weapon: "Vandal" },
  { id: "demo-match-005", daysAgo: 25, agent: "Cypher", map: "Icebox", role: "Sentinel", result: "win", score: [13, 10], rank: "Diamond 2", rr: 40, delta: 22, kills: 19, deaths: 14, assists: 6, acs: 236, damage: 3333, hs: 22, body: 59, legs: 15, weapon: "Phantom" },
  { id: "demo-match-004", daysAgo: 28, agent: "Phoenix", map: "Lotus", role: "Duelist", result: "win", score: [13, 5], rank: "Diamond 2", rr: 18, delta: 24, kills: 24, deaths: 9, assists: 4, acs: 301, damage: 4020, hs: 26, body: 54, legs: 12, weapon: "Vandal" },
  { id: "demo-match-003", daysAgo: 31, agent: "Viper", map: "Breeze", role: "Controller", result: "loss", score: [11, 13], rank: "Diamond 1", rr: 94, delta: -15, kills: 14, deaths: 17, assists: 11, acs: 179, damage: 2740, hs: 15, body: 60, legs: 15, weapon: "Phantom" }
];

function isoDaysAgo(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(20, 20, 0, 0);
  return date.toISOString();
}

function makePlayers(match) {
  const teamIds = [TEAM, ENEMY];
  const demoPlayer = {
    puuid: DEMO_PUUID,
    team_id: TEAM,
    agent: { name: match.agent, id: match.agent.toLowerCase() },
    tier: { id: 24, name: match.rank },
    stats: {
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      score: match.acs * (match.score[0] + match.score[1]),
      damage: { dealt: match.damage },
      headshots: match.hs,
      bodyshots: match.body,
      legshots: match.legs
    }
  };
  const teammates = Array.from({ length: 4 }, (_, index) => ({
    puuid: `demo-team-${index + 1}`,
    team_id: TEAM,
    agent: { name: ["Sage", "Sova", "Omen", "Raze"][index] },
    tier: { id: 24, name: match.rank },
    stats: { kills: 10 + index, deaths: 11 + index, assists: 4 + index, score: 3200, damage: { dealt: 2200 }, headshots: 9, bodyshots: 32, legshots: 8 }
  }));
  const enemies = Array.from({ length: 5 }, (_, index) => ({
    puuid: `demo-enemy-${index + 1}`,
    team_id: ENEMY,
    agent: { name: ["Reyna", "Jett", "Brimstone", "Killjoy", "Breach"][index] },
    tier: { id: 24, name: match.rank },
    stats: { kills: 9 + index, deaths: 12 + index, assists: 3 + index, score: 3000, damage: { dealt: 2100 }, headshots: 8, bodyshots: 31, legshots: 7 }
  }));
  return [demoPlayer, ...teammates, ...enemies].filter(player => teamIds.includes(player.team_id));
}

function roundWinner(match, roundIndex) {
  const won = match.result === "win";
  const playerWins = match.score[0];
  if (roundIndex < playerWins) return won ? TEAM : ENEMY;
  return won ? ENEMY : TEAM;
}

function roundEconomy(match, roundIndex) {
  const pistol = roundIndex === 0 || roundIndex === 12;
  const bonus = roundIndex === 2 || roundIndex === 14;
  const weapon = pistol ? "Classic" : bonus ? "Spectre" : match.weapon;
  const loadout = pistol ? 800 : bonus ? 2450 : ["Vandal", "Phantom", "Operator", "Odin"].includes(weapon) ? 4700 : 3300;
  return {
    loadout_value: loadout,
    weapon: { name: weapon },
    armor: { name: pistol ? "Light Shields" : "Heavy Shields" },
    remaining: Math.max(200, 9000 - loadout - roundIndex * 35)
  };
}

function makeRounds(match) {
  const roundCount = match.score[0] + match.score[1];
  return Array.from({ length: roundCount }, (_, index) => {
    const winningTeam = roundWinner(match, index);
    return {
      id: index,
      winning_team: winningTeam,
      result: index === 0 || index === 12 ? "Pistol" : index === 2 || index === 14 ? "Bonus" : "Eliminated",
      ceremony: winningTeam === TEAM && index % 4 === 0 ? "Thrifty" : "",
      stats: [{
        player: { puuid: DEMO_PUUID },
        economy: roundEconomy(match, index),
        ability_casts: { grenade_casts: index % 3, ability1_casts: 1, ability2_casts: index % 2, ultimate_casts: index === 16 ? 1 : 0 },
        stats: { score: match.acs },
        damage_events: [{ damage: Math.round(match.damage / roundCount) }],
        was_afk: false,
        stayed_in_spawn: false
      }]
    };
  });
}

function makeKills(match) {
  const kills = [];
  const roundCount = match.score[0] + match.score[1];
  for (let index = 0; index < match.kills; index += 1) {
    kills.push({
      round: index % roundCount,
      killer: { puuid: DEMO_PUUID },
      victim: { puuid: `demo-enemy-${(index % 5) + 1}` },
      weapon: { name: index % 7 === 0 ? "Sheriff" : index % 5 === 0 ? "Classic" : match.weapon, type: "Weapon" }
    });
  }
  for (let index = 0; index < match.deaths; index += 1) {
    kills.push({
      round: index % roundCount,
      killer: { puuid: `demo-enemy-${(index % 5) + 1}` },
      victim: { puuid: DEMO_PUUID },
      weapon: { name: index % 4 === 0 ? "Vandal" : "Phantom", type: "Weapon" }
    });
  }
  return kills;
}

function makeRawMatch(match) {
  return {
    data: {
      metadata: {
        match_id: match.id,
        started_at: isoDaysAgo(match.daysAgo),
        season: { id: "e10a4-demo", short: "V26 A4", name: "Season 2026 Act 4" },
        map: { name: match.map },
        queue: { id: "competitive", name: "Competitive", mode_type: "competitive" }
      },
      players: makePlayers(match),
      teams: [
        { team_id: TEAM, won: match.result === "win", rounds: { won: match.score[0], lost: match.score[1] } },
        { team_id: ENEMY, won: match.result === "loss", rounds: { won: match.score[1], lost: match.score[0] } }
      ],
      rounds: makeRounds(match),
      kills: makeKills(match)
    }
  };
}

export function createDemoSnapshot() {
  const rawMatches = MATCHES.map(makeRawMatch);
  return {
    riotId: "DemoPlayer#RC",
    region: "na",
    puuid: DEMO_PUUID,
    syncedAt: new Date().toISOString(),
    account: { name: "DemoPlayer", tag: "RC" },
    rawMatches,
    mmrHistory: MATCHES.map(match => ({
      match_id: match.id,
      tier: { id: 24, name: match.rank },
      rr: match.rr,
      last_change: match.delta,
      elo: 1850 + match.rr,
      date: isoDaysAgo(match.daysAgo),
      rankedCoachSource: "demo-fixture"
    }))
  };
}

export function createDemoAppState(model = {}, current = {}) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const latest = MATCHES[0];
  return {
    ...current,
    demoMode: true,
    focusMode: "auto",
    playStatsPage: 0,
    dailyFocus: {
      key: todayKey,
      mode: "auto",
      index: 1
    },
    loadout: {
      role: "Duelist",
      agent: "Jett",
      map: "Ascent",
      state: "idle",
      spinStep: "",
      assignment: null,
      startedAt: ""
    },
    logDraft: {
      result: latest.result,
      rrBefore: latest.rr - latest.delta,
      rrAfter: latest.rr,
      map: latest.map,
      agent: latest.agent,
      role: latest.role,
      mode: "Competitive",
      mood: 4,
      performanceScore: 76,
      selfComms: 68,
      teamComms: 62,
      adherence: 82,
      notes: "Demo review: traded the first fight cleanly and kept the mid-round plan simple."
    },
    focusQueue: (model.pillars || []).slice(0, 4).map((pillar, index) => ({
      id: `demo-focus-${pillar.key || index}`,
      category: pillar.label,
      title: index === 0 ? "Win the first honest fight" : `${pillar.label} cleanup`,
      evidence: pillar.driver || `${pillar.label} is tracking at ${Math.round(pillar.score || 0)}/100.`,
      why: "This keeps one short-term job visible before queueing.",
      how: index === 0 ? "Pair the first contact with utility or a teammate before chasing the next duel." : `Pick one ${String(pillar.label || "focus").toLowerCase()} habit and repeat it for the next block.`,
      priority: index === 0 ? "High" : "Medium",
      confidence: 92 - index * 7,
      impact: index === 0 ? "High" : "Medium"
    })),
    reflections: [
      {
        id: "demo-reflection-1",
        createdAt: new Date().toISOString(),
        playedAt: new Date().toISOString(),
        result: "win",
        rrDelta: 23,
        map: "Ascent",
        agent: "Jett",
        role: "Duelist",
        focus: "Win the first honest fight",
        adherence: 78,
        rating: 4,
        feeling: "Locked In"
      }
    ]
  };
}
