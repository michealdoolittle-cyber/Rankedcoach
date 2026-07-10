(function () {
  "use strict";

  const SOURCE = Object.freeze({
    name: "UpForge Valorant Stats",
    asOf: "2026-07-10",
    sampleSize: 171,
    provisional: true,
    url: "https://upforge.gg/valorant/stats"
  });

  const RANK_BENCHMARKS = Object.freeze({
    iron: Object.freeze({ hsPercent: 10.5, acs: 205, kd: 0.89 }),
    bronze: Object.freeze({ hsPercent: 18, acs: 206, kd: 0.96 }),
    silver: Object.freeze({ hsPercent: 20.7, acs: 202, kd: 0.95 }),
    gold: Object.freeze({ hsPercent: 22.7, acs: 213, kd: 1.03 }),
    platinum: Object.freeze({ hsPercent: 25.1, acs: 224, kd: 1.04 }),
    diamond: Object.freeze({ hsPercent: 27.4, acs: 212, kd: 1.03 }),
    ascendant: Object.freeze({ hsPercent: 24.5, acs: 213, kd: 1.01 })
  });

  const METRIC_META = Object.freeze({
    hsPercent: Object.freeze({ label: "Headshot percentage", shortLabel: "HS%" }),
    acs: Object.freeze({ label: "Average combat score", shortLabel: "ACS" }),
    kd: Object.freeze({ label: "Kill/death ratio", shortLabel: "K/D" })
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
