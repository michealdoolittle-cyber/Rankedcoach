import { escapeHtml, percent, ratio, whole } from "../model/utils.js";

function formatMetric(key, value) {
  if (key === "kd") return ratio(value);
  if (key === "acs") return whole(value);
  return percent(value);
}

export function renderPerformanceOverTime(model = {}) {
  const rank = model.rankComparison;
  const metrics = rank?.metrics ? Object.entries(rank.metrics).filter(([, item]) => item) : [];
  const tiles = metrics.length ? metrics.map(([key, item]) => `
    <div class="trend-tile ${item.direction === "above" ? "is-good" : item.direction === "below" ? "is-bad" : "is-neutral"}">
      <span>${escapeHtml(item.shortLabel || key)}</span>
      <strong>${escapeHtml(formatMetric(key, item.value))}</strong>
      <small>${escapeHtml(item.direction)} ${escapeHtml(rank.rankLabel)} reference (${escapeHtml(formatMetric(key, item.benchmark))})</small>
    </div>
  `).join("") : `
    <div class="trend-tile">
      <span>Reference</span>
      <strong>No rank reference yet</strong>
      <small>Sync a ranked snapshot to compare against rank benchmarks.</small>
    </div>
  `;
  return `
    <section class="card review-section" aria-labelledby="performanceTitle">
      <p class="eyebrow">Performance over time</p>
      <h3 id="performanceTitle">Rank-aware stat checks</h3>
      <div class="trend-tile-grid">${tiles}</div>
    </section>
  `;
}
