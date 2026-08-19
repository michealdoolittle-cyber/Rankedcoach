import "../../vendor/schema/match-record.js";
import "../../vendor/analytics/coaching-rules.js";
import "../../vendor/analytics/round-metrics.js";
import "../../vendor/analytics/match-trends-resolver.js";
import "../../vendor/data/rank-benchmarks.js";
import "../../vendor/library/gamesense-maps.js";
import "../../vendor/library/gamesense-reference.js";
import "../../vendor/library/gamesense-promoted.js";
import "../../vendor/library/gamesense-vstats-reference.js";

export function getVendorStatus() {
  return {
    matchRecord: Boolean(globalThis.RankedCoachMatchRecord),
    coachingRules: Boolean(globalThis.RankedCoachCoachingRules),
    roundMetrics: Boolean(globalThis.RankedCoachRoundMetrics),
    matchTrends: Boolean(globalThis.RankedCoachMatchTrendsResolver),
    rankBenchmarks: Boolean(globalThis.RankedCoachRankBenchmarks),
    maps: Array.isArray(globalThis.RankedCoachGamesenseMaps),
    reference: Boolean(globalThis.RankedCoachGamesenseReference)
  };
}
