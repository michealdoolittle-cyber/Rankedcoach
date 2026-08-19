import { escapeHtml } from "../model/utils.js";
import { rememberLearnItem } from "../state/store.js";

export function openLessonModal(modalRoot, lesson) {
  if (!modalRoot || !lesson) return;
  rememberLearnItem(lesson);
  const examples = (lesson.examples || []).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  const mistakes = (lesson.mistakes || []).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="lessonModalTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">${escapeHtml(lesson.category)} · ${escapeHtml(lesson.type)}</p>
            <h2 id="lessonModalTitle">${escapeHtml(lesson.title)}</h2>
          </div>
          <button class="secondary-btn modal-close" type="button" data-modal-close>Close</button>
        </header>
        <div class="modal-body">
          <section class="detail-block">
            <h3>Overview</h3>
            <p>${escapeHtml(lesson.overview || lesson.summary || "")}</p>
          </section>
          <section class="detail-block">
            <h3>Examples</h3>
            <ul>${examples || "<li>Apply this when the match state gives you the same cue.</li>"}</ul>
          </section>
          <section class="detail-block">
            <h3>Common mistakes</h3>
            <ul>${mistakes || "<li>Forcing the idea without map control, teammate timing, or utility support.</li>"}</ul>
          </section>
          <button class="secondary-btn" type="button" disabled title="Play phase is not part of beta Phase 1 yet.">Add to Focus · coming with Play</button>
        </div>
      </section>
    </div>
  `;
}
