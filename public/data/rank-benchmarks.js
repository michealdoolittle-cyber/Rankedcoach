(function () {
  "use strict";

  const SOURCE = Object.freeze({
    name: "Tracker.gg + UpForge aggregate",
    asOf: "2026-08-18",
    sampleSize: null,
    provisional: true,
    captureMethod: "manual public-page capture",
    url: "https://tracker.gg/valorant"
  });

  const RANK_BENCHMARKS = Object.freeze({
    iron: Object.freeze({ hsPercent: 11, acs: 207, kd: 0.90, winRate: 60 }),
    bronze: Object.freeze({ hsPercent: 17.3, acs: 204, kd: 0.89, winRate: 40 }),
    silver: Object.freeze({ hsPercent: 21.2, acs: 212, kd: 0.97, winRate: 40 }),
    gold: Object.freeze({ hsPercent: 22.8, acs: 213, kd: 1.03, winRate: 50 }),
    platinum: Object.freeze({ hsPercent: 25.2, acs: 219, kd: 1.03, winRate: 50 }),
    diamond: Object.freeze({ hsPercent: 27.1, acs: 211, kd: 1.01, winRate: 50 }),
    ascendant: Object.freeze({ hsPercent: 24.6, acs: 213, kd: 1.01, winRate: 50 })
  });

  const METRIC_META = Object.freeze({
    winRate: Object.freeze({ label: "Win rate", shortLabel: "WR", format: "percent" }),
    hsPercent: Object.freeze({ label: "Headshot percentage", shortLabel: "HS%", format: "percent" }),
    acs: Object.freeze({ label: "Average combat score", shortLabel: "ACS", format: "number" }),
    kd: Object.freeze({ label: "Kill/death ratio", shortLabel: "K/D", format: "ratio" })
  });

  function getRankKey(rankLabel = "") {
    const key = String(rankLabel || "").trim().toLowerCase().split(/\s+/)[0];
    return Object.prototype.hasOwnProperty.call(RANK_BENCHMARKS, key) ? key : null;
  }

  function compareValue(value, benchmark, meta) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || !Number.isFinite(benchmark)) return null;
    const relativeDelta = benchmark ? (numericValue - benchmark) / benchmark : 0;
    return {
      ...meta,
      value: numericValue,
      benchmark,
      delta: numericValue - benchmark,
      relativeDelta,
      direction: relativeDelta >= 0.05 ? "above" : relativeDelta <= -0.05 ? "below" : "near"
    };
  }

  function compareRankMetrics(rankLabel, values = {}) {
    const rankKey = getRankKey(rankLabel);
    if (!rankKey) return null;
    const benchmark = RANK_BENCHMARKS[rankKey];
    const metrics = Object.fromEntries(
      Object.keys(METRIC_META).map(key => [key, compareValue(values[key], benchmark[key], METRIC_META[key])])
    );
    return {
      rankKey,
      rankLabel: rankKey.charAt(0).toUpperCase() + rankKey.slice(1),
      benchmark,
      metrics,
      source: SOURCE
    };
  }

  globalThis.RankedCoachRankBenchmarks = Object.freeze({
    SOURCE,
    RANK_BENCHMARKS,
    getRankKey,
    compareRankMetrics
  });
})();
