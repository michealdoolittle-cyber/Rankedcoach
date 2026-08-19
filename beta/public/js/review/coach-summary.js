import { escapeHtml } from "../model/utils.js";
import { getPriorityInsight } from "../model/insights.js";
import { button } from "../components/ui.js";

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
        ${button({ label: "Open Insight Detail", variant: "secondary", action: "open-insight-detail" })}
      </div>
    </section>
  `;
}
