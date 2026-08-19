import { renderOverview } from "./overview.js";
import { renderPerformanceOverTime } from "./performance.js";
import { renderRRTrend } from "./rr-chart.js";
import { renderCoachSummary } from "./coach-summary.js";
import { renderCompassBreakdown } from "./compass.js";
import { renderLastFive, renderHistory } from "./match-list.js";
import { renderBreakdowns } from "./breakdowns.js";

export function renderReview(root, model) {
  if (!root) return;
  if (!model?.records?.length) {
    root.innerHTML = `
      <section class="card empty-state">
        <h2>Sync a Riot account to start Review.</h2>
        <p>Review will fill with real retained competitive matches: performance trends, RR movement, Compass breakdown, recent matches, and entity-specific reads.</p>
      </section>
    `;
    return;
  }
  root.innerHTML = `
    <div class="review-grid">
      ${renderCoachSummary(model)}
      ${renderOverview(model)}
      ${renderPerformanceOverTime(model)}
      ${renderRRTrend(model)}
      ${renderCompassBreakdown(model)}
      ${renderLastFive(model)}
    </div>
    ${renderBreakdowns(model)}
  `;
}

export function renderHistoryPage(root, model, filters = {}) {
  if (!root) return;
  if (!model?.records?.length) {
    root.innerHTML = `
      <section class="card empty-state">
        <h2>No match history loaded.</h2>
        <p>Sync an account first; then this page becomes the full scrollable match log with map, agent, and result filters.</p>
      </section>
    `;
    return;
  }
  root.innerHTML = renderHistory(model, filters);
}
