import { escapeHtml } from "../model/utils.js";
import { getPriorityInsight } from "../model/insights.js";

export function renderCoachSummary(model = {}) {
  const insight = getPriorityInsight(model);
  return `
    <section class="card review-section coach-summary" aria-labelledby="coachSummaryTitle">
      <div>
        <p class="eyebrow">Coach summary</p>
        <h2 id="coachSummaryTitle">${escapeHtml(insight.title)}</h2>
        <p class="muted">${escapeHtml(insight.preview || insight.action || "")}</p>
      </div>
      <div class="coach-actions">
        <span class="pill ${escapeHtml(insight.tone || "warn")}">${escapeHtml(insight.focus || "Priority")}</span>
        <button class="secondary-btn" type="button" data-action="open-insight-detail">Open Insight Detail</button>
      </div>
    </section>
  `;
}
