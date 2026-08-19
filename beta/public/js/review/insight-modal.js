import { escapeHtml } from "../model/utils.js";
import { getPriorityInsight } from "../model/insights.js";

export function openInsightDetail(modalRoot, model = {}, insight = getPriorityInsight(model)) {
  if (!modalRoot) return;
  const proof = (insight.proof || []).map(item => `
    <article class="detail-block">
      <h3>${escapeHtml(item.label || "Evidence")}</h3>
      <strong>${escapeHtml(item.stat || "")}</strong>
      ${item.formula ? `<p>${escapeHtml(item.formula)}</p>` : ""}
    </article>
  `).join("");
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="insightDetailTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">${escapeHtml(insight.focus || "Insight Detail")}</p>
            <h2 id="insightDetailTitle">${escapeHtml(insight.title || "Insight Detail")}</h2>
          </div>
          <button class="rc-button rc-button--secondary modal-close" type="button" data-modal-close>Close</button>
        </header>
        <div class="modal-body">
          <section class="detail-block">
            <h3>Issue</h3>
            <p>${escapeHtml(insight.preview || "This read needs a larger sample before it becomes specific.")}</p>
          </section>
          <section class="detail-block">
            <h3>Why this matters</h3>
            <p>${escapeHtml(insight.why || "It is tied to a repeated pattern in the retained match sample.")}</p>
          </section>
          <section class="detail-block">
            <h3>How to fix it next block</h3>
            <p>${escapeHtml(insight.action || "Make one simple change, sync again, and compare the next result.")}</p>
          </section>
          <section>
            <p class="eyebrow">Supporting numbers</p>
            <div class="breakdown-list">${proof || "<p class=\"muted\">No extra proof rows available.</p>"}</div>
          </section>
        </div>
      </section>
    </div>
  `;
}

export function closeModal(modalRoot) {
  if (modalRoot) modalRoot.innerHTML = "";
}
