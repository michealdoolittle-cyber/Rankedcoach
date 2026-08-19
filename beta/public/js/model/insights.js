import { finite, number, percent, whole } from "./utils.js";

function fallbackInsight(model = {}) {
  const weakest = (model.pillars || []).slice().sort((a, b) => number(a.score) - number(b.score))[0];
  if (!weakest) {
    return {
      title: "Sync a real account to build your first beta read.",
      preview: "Review needs retained competitive match data before it can coach honestly.",
      tone: "warn",
      focus: "Setup",
      why: "No match sample is loaded yet.",
      action: "Enter a Riot ID, sync the account, then open the generated read.",
      proof: []
    };
  }
  return {
    title: `${weakest.label} is the lowest Compass pillar`,
    preview: `${weakest.label} is at ${whole(weakest.score)}/100. ${weakest.driver}`,
    tone: weakest.score >= 70 ? "good" : weakest.score >= 50 ? "warn" : "bad",
    focus: weakest.label,
    why: "The Compass is using the specific stat named below, not a generic lowest-category line.",
    action: `In the next block, make one repeatable ${weakest.label.toLowerCase()} adjustment and compare the next import against this score.`,
    proof: [
      { label: "Compass score", stat: `${whole(weakest.score)}/100`, formula: weakest.reference },
      { label: "Driving stat", stat: weakest.statKey, formula: weakest.driver }
    ]
  };
}

export function getPriorityInsight(model = {}) {
  const trend = (model.trendCards || [])[0];
  if (trend) {
    return {
      title: trend.title || trend.label || "Priority read",
      preview: trend.preview || trend.detail || "",
      tone: trend.type === "good" || trend.tone === "up" ? "good" : "warn",
      focus: trend.focus || trend.category || "Match Trend",
      why: trend.why || trend.detail || "This read is anchored to your own recent matches.",
      action: trend.action || "Play one queue block with a simpler repeatable plan, then compare the next import.",
      proof: Array.isArray(trend.proof) ? trend.proof : [
        { label: "Current", stat: trend.value || trend.currentLabel || "", formula: trend.sourceLabel || "" },
        { label: "Reference", stat: trend.benchmark || trend.baselineLabel || "", formula: trend.why || "" }
      ].filter(item => item.stat || item.formula),
      related: [trend.mediaValue, trend.sliceType, trend.metricKey].filter(Boolean)
    };
  }
  const rule = (model.ruleCards || [])[0];
  if (rule) {
    return {
      title: rule.title,
      preview: rule.preview,
      tone: rule.type === "good" ? "good" : "warn",
      focus: rule.focus || rule.category,
      why: rule.why,
      action: rule.action,
      proof: [
        { label: "What", stat: rule.what, formula: rule.sampleNote || "" },
        { label: "Confidence", stat: rule.confidence || "", formula: rule.sourceRule ? `Language rule ${rule.sourceRule}` : "" }
      ],
      related: [rule.focus, rule.category].filter(Boolean)
    };
  }
  return fallbackInsight(model);
}

export function buildEntityRankLine(entity = {}, metricKey = "winRate", model = {}) {
  const rank = model.rankComparison;
  const meta = globalThis.RankedCoachRankBenchmarks?.METRIC_META?.[metricKey];
  const benchmark = rank?.benchmark?.[metricKey];
  const compareValue = globalThis.RankedCoachRankBenchmarks?.compareValue;
  const value = entity?.[metricKey] ?? entity?.winrate;
  const comparison = compareValue && meta ? compareValue(value, benchmark, meta) : null;
  if (!comparison) return `${finite(value) ? percent(value) : "--"} current`;
  const direction = comparison.direction === "above" ? "above" : comparison.direction === "below" ? "below" : "near";
  const rendered = meta.format === "ratio" ? Number(value).toFixed(2) : meta.format === "number" ? whole(value) : percent(value);
  return `${rendered} · ${direction} ${rank.rankLabel} reference`;
}
