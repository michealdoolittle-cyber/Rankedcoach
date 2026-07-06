export type MatchRecordSource = "manual" | "tracker_screenshot" | "riot_sync" | "demo" | "legacy";

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
  schemaVersion: 1;
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
  rank: MatchRecordRankSnapshot;
  reflection: MatchRecordReflection;
  confidence: MatchRecordConfidenceMap;
  pendingVerification: boolean;
  importMeta: MatchRecordImportMeta;
  legacyMatchId: string | null;
  manualLogId: string | null;
}

export const MATCH_RECORD_SCHEMA_VERSION = 1;
