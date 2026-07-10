export type MatchRecordSource = "manual" | "tracker_screenshot" | "riot_sync" | "henrik_sync" | "demo" | "legacy";

export type MatchRecordResult = "win" | "loss" | "draw" | "unknown";

export type MatchRecordConfidence = "high" | "medium" | "low" | "unknown";

export interface MatchRecordConfidenceMap {
  overall: MatchRecordConfidence;
  fields: Record<string, MatchRecordConfidence>;
}

export interface MatchRecordStats {
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  acs: number | null;
  adr: number | null;
  hsPercent: number | null;
  kdaText: string | null;
  scoreText: string | null;
}

export interface MatchRecordRounds {
  won: number | null;
  lost: number | null;
}

export interface MatchRecordTrackedPlayer {
  puuid: string | null;
  teamId: string | null;
  agentId: string | null;
  competitiveTier: number | null;
  teammatePuuids: string[];
  behaviorFactors: Record<string, unknown>;
}

export interface MatchRecordKillEvent {
  killer: string | null;
  victim: string | null;
  assistants: string[];
  roundTime: number | null;
  gameTime: number | null;
  finishingDamage: {
    damageType: string | null;
    damageItem: string | null;
    isSecondaryFireMode: boolean;
  };
}

export interface MatchRecordRound {
  roundIndex: number;
  roundNum: number;
  side: "attack" | "defense" | null;
  sideSource: string | null;
  attackingTeam: string | null;
  winningTeam: string | null;
  won: boolean;
  roundResult: string | null;
  roundResultCode: string | null;
  roundCeremony: string | null;
  bombPlanter: string | null;
  bombDefuser: string | null;
  playerEconomy: {
    loadoutValue: number | null;
    weapon: string | null;
    armor: string | null;
    remaining: number | null;
    spent: number | null;
  };
  playerScore: number | null;
  damageDealt: number | null;
  wasAfk: boolean;
  wasPenalized: boolean;
  stayedInSpawn: boolean;
  kills: MatchRecordKillEvent[];
}

export interface MatchRecordRankSnapshot {
  rank: string | null;
  rr: number | null;
  rrDelta: number | null;
  peakRank: string | null;
  peakRR: number | null;
}

export interface MatchRecordReflection {
  focus: string | null;
  mood: string | null;
  rating: number | null;
  teamComms: number | null;
  selfComms: number | null;
  notes: string | null;
  warmup: boolean;
}

export interface MatchRecordImportMeta {
  imageId?: string | null;
  imageName?: string | null;
  screenshotType?: "season_overview" | "recent_matches" | "unknown" | null;
  parseWarnings?: string[];
  rawText?: string | null;
}

export interface MatchRecord {
  schemaVersion: 2;
  id: string;
  source: MatchRecordSource;
  createdAt: string;
  playedAt: string;
  season: string | null;
  act: string | null;
  matchNumber: number | null;
  agent: string | null;
  role: string | null;
  map: string | null;
  result: MatchRecordResult;
  stats: MatchRecordStats;
  rounds: MatchRecordRounds;
  trackedPlayer: MatchRecordTrackedPlayer;
  roundByRound: MatchRecordRound[];
  rank: MatchRecordRankSnapshot;
  reflection: MatchRecordReflection;
  confidence: MatchRecordConfidenceMap;
  pendingVerification: boolean;
  importMeta: MatchRecordImportMeta;
  legacyMatchId: string | null;
  manualLogId: string | null;
}

export const MATCH_RECORD_SCHEMA_VERSION = 2;
