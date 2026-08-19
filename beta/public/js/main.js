import "./vendor/bootstrap.js";
import { syncHenrikAccount } from "./services/henrik.js";
import { loadState, saveState } from "./state/store.js";
import { buildPlayerModel } from "./model/player-model.js";
import { renderReview, renderHistoryPage } from "./review/review-page.js";
import { openInsightDetail, closeModal } from "./review/insight-modal.js";
import { renderLearn } from "./learn/learn-page.js";
import { getLearnLibrary } from "./learn/library-data.js";
import { openLessonModal } from "./learn/lesson-modal.js";

const els = {
  nav: [...document.querySelectorAll(".nav-tab")],
  panels: [...document.querySelectorAll("[data-page-panel]")],
  reviewRoot: document.getElementById("reviewRoot"),
  historyRoot: document.getElementById("historyRoot"),
  learnRoot: document.getElementById("learnRoot"),
  modalRoot: document.getElementById("modalRoot"),
  syncForm: document.getElementById("syncForm"),
  syncStatus: document.getElementById("syncStatus"),
  riotIdInput: document.getElementById("riotIdInput"),
  regionInput: document.getElementById("regionInput"),
  syncSubmit: document.getElementById("syncSubmit")
};

const app = {
  page: "review",
  snapshot: loadState(),
  model: null,
  historyFilters: {},
  learnState: { query: "", category: "", model: null }
};

if (app.snapshot) {
  app.model = buildPlayerModel(app.snapshot);
  app.learnState.model = app.model;
  els.riotIdInput.value = app.snapshot.riotId || "";
  els.regionInput.value = app.snapshot.region || "na";
  setStatus(`Loaded cached beta sync: ${app.snapshot.rawMatches?.length || 0} matches.`);
}

function setStatus(message, tone = "") {
  if (!els.syncStatus) return;
  els.syncStatus.textContent = message;
  els.syncStatus.dataset.tone = tone;
}

function setPage(page) {
  app.page = page;
  els.nav.forEach(button => button.classList.toggle("is-active", button.dataset.page === page));
  els.panels.forEach(panel => panel.classList.toggle("is-active", panel.dataset.pagePanel === page));
  render();
}

function render() {
  renderReview(els.reviewRoot, app.model);
  renderHistoryPage(els.historyRoot, app.model, app.historyFilters);
  app.learnState.model = app.model;
  renderLearn(els.learnRoot, app.learnState);
}

els.nav.forEach(button => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

els.syncForm?.addEventListener("submit", async event => {
  event.preventDefault();
  els.syncSubmit.disabled = true;
  try {
    const snapshot = await syncHenrikAccount({
      riotId: els.riotIdInput.value,
      region: els.regionInput.value,
      pages: 4,
      pageSize: 10
    }, message => setStatus(message));
    app.snapshot = snapshot;
    app.model = buildPlayerModel(snapshot);
    saveState(snapshot);
    setStatus(`Synced ${app.model.records.length} competitive matches for ${snapshot.riotId}.`, "good");
    render();
  } catch (error) {
    setStatus(error?.message || "Sync failed.", "bad");
  } finally {
    els.syncSubmit.disabled = false;
  }
});

document.addEventListener("click", event => {
  const closeTarget = event.target.closest("[data-modal-close]");
  if (closeTarget) {
    closeModal(els.modalRoot);
    return;
  }
  const insightButton = event.target.closest("[data-action='open-insight-detail']");
  if (insightButton) {
    openInsightDetail(els.modalRoot, app.model || {});
    return;
  }
  const lessonButton = event.target.closest("[data-lesson-id]");
  if (lessonButton) {
    const lesson = getLearnLibrary().items.find(item => item.id === lessonButton.dataset.lessonId);
    openLessonModal(els.modalRoot, lesson);
    renderLearn(els.learnRoot, app.learnState);
    return;
  }
  const categoryButton = event.target.closest("[data-learn-category]");
  if (categoryButton) {
    const selected = categoryButton.dataset.learnCategory;
    app.learnState.category = app.learnState.category === selected ? "" : selected;
    renderLearn(els.learnRoot, app.learnState);
  }
});

document.addEventListener("change", event => {
  const filter = event.target.closest("[data-history-filter]");
  if (!filter) return;
  app.historyFilters[filter.dataset.historyFilter] = filter.value;
  renderHistoryPage(els.historyRoot, app.model, app.historyFilters);
});

document.addEventListener("input", event => {
  if (event.target.id !== "learnSearch") return;
  app.learnState.query = event.target.value;
  renderLearn(els.learnRoot, app.learnState);
  const input = document.getElementById("learnSearch");
  input?.focus();
  input?.setSelectionRange?.(app.learnState.query.length, app.learnState.query.length);
});

render();
