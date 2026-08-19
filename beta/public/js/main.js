import "./vendor/bootstrap.js";
import { syncHenrikAccount } from "./services/henrik.js";
import { loadAppState, loadState, saveAppState, saveState } from "./state/store.js";
import { buildPlayerModel } from "./model/player-model.js";
import { renderReview, renderHistoryPage } from "./review/review-page.js";
import { openInsightDetail, closeModal } from "./review/insight-modal.js";
import { renderLearn } from "./learn/learn-page.js";
import { getLearnLibrary } from "./learn/library-data.js";
import { openLessonModal } from "./learn/lesson-modal.js";
import {
  buildLoadoutAssignment,
  createReflectionFromDraft,
  getFocusQueue,
  LOADOUT_DEFAULTS,
  openAddFocusModal,
  openFocusDetailsModal,
  openLogSavedModal,
  renderFocusQueuePage,
  renderInGamePage,
  renderLoadoutPage,
  renderLogMatchPage,
  renderPlayPage
} from "./play/play-page.js";
import { openLineupModal, renderLibrary } from "./library/library-page.js";
import { openPlanModal, renderSettings } from "./settings/settings-page.js";

const PAGE_TITLES = {
  play: "Play",
  loadout: "Loadout",
  "focus-queue": "Focus Queue",
  "log-match": "Log Match",
  "in-game": "In-Game",
  review: "Review",
  history: "Match History",
  learn: "Learn",
  library: "Library",
  settings: "Settings",
  help: "Help & Support"
};

const els = {
  nav: [...document.querySelectorAll(".sidebar-item[data-page]")],
  panels: [...document.querySelectorAll("[data-page-panel]")],
  pageTitle: document.getElementById("pageTitle"),
  playRoot: document.getElementById("playRoot"),
  loadoutRoot: document.getElementById("loadoutRoot"),
  focusQueueRoot: document.getElementById("focusQueueRoot"),
  logMatchRoot: document.getElementById("logMatchRoot"),
  inGameRoot: document.getElementById("inGameRoot"),
  reviewRoot: document.getElementById("reviewRoot"),
  historyRoot: document.getElementById("historyRoot"),
  learnRoot: document.getElementById("learnRoot"),
  libraryRoot: document.getElementById("libraryRoot"),
  settingsRoot: document.getElementById("settingsRoot"),
  helpRoot: document.getElementById("helpRoot"),
  modalRoot: document.getElementById("modalRoot"),
  syncForm: document.getElementById("syncForm"),
  syncStatus: document.getElementById("syncStatus"),
  riotIdInput: document.getElementById("riotIdInput"),
  regionInput: document.getElementById("regionInput"),
  syncSubmit: document.getElementById("syncSubmit"),
  sidebarAvatar: document.getElementById("sidebarAvatar"),
  sidebarAccountName: document.getElementById("sidebarAccountName"),
  sidebarAccountMeta: document.getElementById("sidebarAccountMeta")
};

function setSidebarAccount(riotId, meta) {
  if (!els.sidebarAccountName) return;
  const name = String(riotId || "").trim();
  els.sidebarAccountName.textContent = name || "No account synced";
  els.sidebarAccountMeta.textContent = meta || "Sync below to begin";
  els.sidebarAvatar.textContent = name ? name.slice(0, 2).toUpperCase() : "--";
}

const cachedIdentity = loadState();

const app = {
  page: "play",
  snapshot: null,
  model: null,
  appState: {
    reviewTab: "performance",
    reviewCategory: "",
    historyFilters: {},
    libraryView: "home",
    settingsTab: "pipeline",
    learnState: { query: "", category: "", model: null },
    loadout: { ...LOADOUT_DEFAULTS },
    focusQueue: [],
    logDraft: {},
    reflections: [],
    ...(loadAppState() || {})
  }
};

if (!app.appState.learnState) app.appState.learnState = { query: "", category: "", model: null };
if (!app.appState.loadout) app.appState.loadout = { ...LOADOUT_DEFAULTS };
if (!Array.isArray(app.appState.focusQueue)) app.appState.focusQueue = [];
if (!Array.isArray(app.appState.reflections)) app.appState.reflections = [];
if (!app.appState.historyFilters) app.appState.historyFilters = {};

// Only the account identity (riotId/region/puuid) is persisted across reloads.
// Raw match/MMR history is intentionally not stored in localStorage; real
// accounts can exceed the browser quota. Reloads re-sync from Henrik.
if (cachedIdentity) {
  els.riotIdInput.value = cachedIdentity.riotId || "";
  els.regionInput.value = cachedIdentity.region || "na";
  setStatus(`Last synced ${cachedIdentity.riotId || "an account"} — sync again to rebuild beta data.`);
  setSidebarAccount(cachedIdentity.riotId, "Sync again to rebuild beta data");
}

function setStatus(message, tone = "") {
  if (!els.syncStatus) return;
  els.syncStatus.textContent = message;
  els.syncStatus.dataset.tone = tone;
}

function persistAppState() {
  const { learnState, ...rest } = app.appState;
  saveAppState({
    ...rest,
    learnState: {
      query: learnState?.query || "",
      category: learnState?.category || ""
    }
  });
}

function routeFor(page = app.page) {
  if (page === "review") return `#/review/${app.appState.reviewTab || "performance"}`;
  if (page === "library") return `#/library/${app.appState.libraryView || "home"}`;
  if (page === "settings") return `#/settings/${app.appState.settingsTab || "pipeline"}`;
  if (page === "history") return "#/review/all-matches";
  return `#/${page || "play"}`;
}

function parseRoute() {
  const parts = String(location.hash || "#/play").replace(/^#\/?/, "").split("/").filter(Boolean);
  const [head, second] = parts;
  if (head === "review") {
    return { page: "review", reviewTab: second || "performance" };
  }
  if (head === "library") {
    return { page: "library", libraryView: second || "home" };
  }
  if (head === "settings") {
    return { page: "settings", settingsTab: second || "pipeline" };
  }
  if (head && PAGE_TITLES[head]) return { page: head };
  return { page: "play" };
}

function applyRoute(route = parseRoute(), { replace = false } = {}) {
  app.page = route.page || "play";
  if (route.reviewTab) app.appState.reviewTab = route.reviewTab;
  if (route.libraryView) app.appState.libraryView = route.libraryView;
  if (route.settingsTab) app.appState.settingsTab = route.settingsTab;
  if (app.page === "history") {
    app.page = "review";
    app.appState.reviewTab = "all-matches";
  }
  const desired = routeFor(app.page);
  if (replace && location.hash !== desired) {
    history.replaceState(null, "", desired);
  }
  els.nav.forEach(button => button.classList.toggle("is-active", button.dataset.page === app.page));
  els.panels.forEach(panel => panel.classList.toggle("is-active", panel.dataset.pagePanel === app.page));
  if (els.pageTitle) els.pageTitle.textContent = PAGE_TITLES[app.page] || "RankedCoach";
  document.title = `RankedCoach Beta · ${PAGE_TITLES[app.page] || "Play"}`;
  persistAppState();
  render();
}

function navigate(page, options = {}) {
  if (!page) return;
  if (options.reviewTab) app.appState.reviewTab = options.reviewTab;
  if (options.reviewCategory !== undefined) app.appState.reviewCategory = options.reviewCategory;
  if (options.libraryView) app.appState.libraryView = options.libraryView;
  if (options.settingsTab) app.appState.settingsTab = options.settingsTab;
  const next = routeFor(page);
  if (location.hash === next) {
    applyRoute(parseRoute());
  } else {
    location.hash = next;
  }
}

function renderHelp() {
  if (!els.helpRoot) return;
  els.helpRoot.innerHTML = `
    <section class="rc-card review-route-section">
      <header class="rc-section-head">
        <div>
          <p class="rc-eyebrow">Help & Support</p>
          <h2>Beta support destinations.</h2>
        </div>
      </header>
      <div class="stats-route-grid">
        <button class="stat-route-tile" type="button" data-action="open-search"><span>Search</span><strong>Global overlay</strong><small>Keyboard shortcut: /</small></button>
        <button class="stat-route-tile" type="button" data-action="open-notifications"><span>Notifications</span><strong>Right drawer</strong><small>Beta placeholder</small></button>
        <button class="stat-route-tile" type="button" data-action="open-profile-popover"><span>Profile</span><strong>Account switcher</strong><small>Goal rank control</small></button>
        <button class="stat-route-tile" type="button" data-action="sign-out-confirm"><span>Session</span><strong>Sign out</strong><small>Confirmation flow</small></button>
      </div>
    </section>
  `;
}

function render() {
  renderPlayPage(els.playRoot, app.model, app.appState);
  renderLoadoutPage(els.loadoutRoot, app.model, app.appState);
  renderFocusQueuePage(els.focusQueueRoot, app.model, app.appState);
  renderLogMatchPage(els.logMatchRoot, app.model, app.appState);
  renderInGamePage(els.inGameRoot, app.model, app.appState);
  renderReview(els.reviewRoot, app.model, app.appState);
  renderHistoryPage(els.historyRoot, app.model, app.appState.historyFilters || {});
  app.appState.learnState.model = app.model;
  renderLearn(els.learnRoot, app.appState.learnState);
  renderLibrary(els.libraryRoot, app.model, app.appState);
  renderSettings(els.settingsRoot, app.model, app.appState);
  renderHelp();
}

function ensureQueue() {
  const queue = getFocusQueue(app.appState, app.model || {});
  app.appState.focusQueue = queue.slice(0, 5);
  return app.appState.focusQueue;
}

function moveQueueItem(id, direction) {
  const queue = ensureQueue();
  const index = queue.findIndex(item => item.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= queue.length) return;
  [queue[index], queue[nextIndex]] = [queue[nextIndex], queue[index]];
  persistAppState();
  render();
}

async function spinLoadout() {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches || app.appState.reduceMotion;
  const wait = reduceMotion ? 0 : 170;
  app.appState.loadout = { ...LOADOUT_DEFAULTS, ...app.appState.loadout, state: "spinning", spinStep: "map", assignment: null };
  persistAppState();
  render();
  for (const step of ["map", "role", "agent"]) {
    app.appState.loadout.spinStep = step;
    render();
    if (wait) await new Promise(resolve => setTimeout(resolve, wait));
  }
  app.appState.loadout = {
    ...app.appState.loadout,
    state: "generated",
    spinStep: "",
    assignment: buildLoadoutAssignment(app.model || {}, app.appState),
    startedAt: ""
  };
  persistAppState();
  render();
}

function openSimpleModal(kind = "info") {
  const title = kind === "search" ? "Global search"
    : kind === "notifications" ? "Notifications"
      : kind === "profile" ? "Profile popover"
        : kind === "signout" ? "Sign out"
          : "Beta notice";
  const message = kind === "search" ? "The slash-key route is wired; indexed search content is the next implementation layer."
    : kind === "notifications" ? "The right drawer destination is wired for app update, new match, and library update notifications."
      : kind === "profile" ? "Account switcher and goal-rank controls belong here once auth/account data is connected."
        : kind === "signout" ? "Sign-out confirmation is routed here; auth enforcement remains outside this beta shell pass."
          : "This action is wired in the beta shell.";
  els.modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="simpleModalTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">Beta shell</p>
            <h2 id="simpleModalTitle">${title}</h2>
          </div>
          <button class="rc-button rc-button--secondary" type="button" data-modal-close>Close</button>
        </header>
        <div class="modal-body"><p>${message}</p></div>
      </section>
    </div>
  `;
}

els.nav.forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
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
    saveState({
      riotId: snapshot.riotId,
      region: snapshot.region,
      puuid: snapshot.puuid,
      syncedAt: snapshot.syncedAt
    });
    setStatus(`Synced ${app.model.records.length} competitive matches for ${snapshot.riotId}.`, "good");
    setSidebarAccount(snapshot.riotId, `${app.model.records.length} matches · ${snapshot.region.toUpperCase()}`);
    render();
  } catch (error) {
    setStatus(error?.message || "Sync failed.", "bad");
  } finally {
    els.syncSubmit.disabled = false;
  }
});

document.addEventListener("click", event => {
  const closeTarget = event.target.closest("[data-modal-close]");
  if (closeTarget && (event.target === closeTarget || closeTarget.matches("button,[role='button']"))) {
    closeModal(els.modalRoot);
    return;
  }

  const jump = event.target.closest("[data-page-jump]");
  if (jump) {
    if (jump.dataset.learnQuery !== undefined) app.appState.learnState.query = jump.dataset.learnQuery || "";
    if (jump.dataset.libraryView) app.appState.libraryView = jump.dataset.libraryView;
    if (jump.dataset.settingsTab) app.appState.settingsTab = jump.dataset.settingsTab;
    navigate(jump.dataset.pageJump, {
      libraryView: jump.dataset.libraryView,
      settingsTab: jump.dataset.settingsTab
    });
    closeModal(els.modalRoot);
    return;
  }

  const reviewTab = event.target.closest("[data-review-tab]");
  if (reviewTab) {
    navigate("review", {
      reviewTab: reviewTab.dataset.reviewTab,
      reviewCategory: reviewTab.dataset.reviewCategory || app.appState.reviewCategory || ""
    });
    closeModal(els.modalRoot);
    return;
  }

  const libraryView = event.target.closest("[data-library-view]");
  if (libraryView) {
    navigate("library", { libraryView: libraryView.dataset.libraryView || "home" });
    return;
  }

  const settingsTab = event.target.closest("[data-settings-tab]");
  if (settingsTab) {
    navigate("settings", { settingsTab: settingsTab.dataset.settingsTab || "pipeline" });
    return;
  }

  const lessonButton = event.target.closest("[data-lesson-id]");
  if (lessonButton) {
    const lesson = getLearnLibrary().items.find(item => item.id === lessonButton.dataset.lessonId);
    openLessonModal(els.modalRoot, lesson);
    renderLearn(els.learnRoot, app.appState.learnState);
    return;
  }

  const categoryButton = event.target.closest("[data-learn-category]");
  if (categoryButton) {
    const selected = categoryButton.dataset.learnCategory;
    app.appState.learnState.category = app.appState.learnState.category === selected ? "" : selected;
    persistAppState();
    renderLearn(els.learnRoot, app.appState.learnState);
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "open-insight-detail") {
    openInsightDetail(els.modalRoot, app.model || {});
  } else if (action === "open-history") {
    navigate("review", { reviewTab: "all-matches" });
  } else if (action === "spin-loadout") {
    spinLoadout();
  } else if (action === "start-match") {
    app.appState.loadout = { ...LOADOUT_DEFAULTS, ...app.appState.loadout, state: "started", startedAt: new Date().toISOString() };
    persistAppState();
    navigate("in-game");
  } else if (action === "open-in-game") {
    navigate("in-game");
  } else if (action === "end-match-log") {
    navigate("log-match");
  } else if (action === "open-focus-detail") {
    openFocusDetailsModal(els.modalRoot, app.model || {}, app.appState, actionTarget.dataset.focusId || "");
  } else if (action === "open-focus-chooser" || action === "open-add-focus") {
    openAddFocusModal(els.modalRoot, app.model || {}, app.appState);
  } else if (action === "keep-focus" || action === "use-active-focus") {
    ensureQueue();
    closeModal(els.modalRoot);
    render();
  } else if (action === "queue-up") {
    moveQueueItem(actionTarget.dataset.focusId, -1);
  } else if (action === "queue-down") {
    moveQueueItem(actionTarget.dataset.focusId, 1);
  } else if (action === "queue-remove") {
    app.appState.focusQueue = ensureQueue().filter(item => item.id !== actionTarget.dataset.focusId);
    persistAppState();
    render();
  } else if (action === "queue-clear") {
    app.appState.focusQueue = [];
    persistAppState();
    render();
  } else if (action === "queue-add-focus") {
    const queue = ensureQueue().filter(item => item.title !== actionTarget.dataset.focusTitle);
    queue.unshift({
      id: `custom-${Date.now()}`,
      title: actionTarget.dataset.focusTitle || "Custom focus",
      category: actionTarget.dataset.focusCategory || "Custom",
      priority: "Medium",
      evidence: "Added from the beta focus chooser.",
      how: "Use this as your next short-term ranked cue."
    });
    app.appState.focusQueue = queue.slice(0, 5);
    persistAppState();
    closeModal(els.modalRoot);
    navigate("focus-queue");
  } else if (action === "queue-save-custom") {
    const title = els.modalRoot.querySelector("[data-custom-focus-field='title']")?.value?.trim();
    const category = els.modalRoot.querySelector("[data-custom-focus-field='category']")?.value?.trim();
    if (title) {
      app.appState.focusQueue = [{
        id: `custom-${Date.now()}`,
        title,
        category: category || "Custom",
        priority: "Medium",
        evidence: "Custom focus created in beta.",
        how: "Keep it small enough to review after one match."
      }, ...ensureQueue()].slice(0, 5);
      persistAppState();
      closeModal(els.modalRoot);
      navigate("focus-queue");
    }
  } else if (action === "log-result") {
    app.appState.logDraft = { ...(app.appState.logDraft || {}), result: actionTarget.dataset.logResult };
    persistAppState();
    renderLogMatchPage(els.logMatchRoot, app.model, app.appState);
  } else if (action === "log-result-undo") {
    app.appState.logDraft = { ...(app.appState.logDraft || {}), result: "" };
    persistAppState();
    renderLogMatchPage(els.logMatchRoot, app.model, app.appState);
  } else if (action === "save-log-match") {
    const reflection = createReflectionFromDraft(app.appState);
    if (reflection.saveReflection) app.appState.reflections = [reflection, ...(app.appState.reflections || [])].slice(0, 60);
    app.appState.logDraft = {};
    app.appState.loadout = { ...LOADOUT_DEFAULTS, state: "idle" };
    persistAppState();
    render();
    openLogSavedModal(els.modalRoot, reflection.saveReflection ? reflection.id : "");
  } else if (action === "open-lineup-detail") {
    openLineupModal(els.modalRoot, actionTarget.dataset.lineupId);
  } else if (action === "library-new-note") {
    app.appState.libraryNotes = [{ title: "Untitled note", body: "Edit mode is next; this confirms the notes data lane is wired." }, ...(app.appState.libraryNotes || [])];
    persistAppState();
    renderLibrary(els.libraryRoot, app.model, app.appState);
  } else if (action === "library-create-collection") {
    app.appState.collections = [{ title: "New collection", count: 0 }, ...(app.appState.collections || [])];
    persistAppState();
    renderLibrary(els.libraryRoot, app.model, app.appState);
  } else if (action === "visual-save") {
    setStatus("Visual preferences saved in beta.", "good");
    persistAppState();
  } else if (action === "visual-reset" || action === "visual-discard") {
    app.appState.palette = "obsidian";
    app.appState.density = "balanced";
    app.appState.reduceMotion = false;
    persistAppState();
    renderSettings(els.settingsRoot, app.model, app.appState);
  } else if (action === "open-search") {
    openSimpleModal("search");
  } else if (action === "open-notifications") {
    openSimpleModal("notifications");
  } else if (action === "open-profile-popover") {
    openSimpleModal("profile");
  } else if (action === "sign-out-confirm") {
    openSimpleModal("signout");
  } else {
    openSimpleModal("info");
  }
});

document.addEventListener("change", event => {
  const filter = event.target.closest("[data-history-filter]");
  if (filter) {
    app.appState.historyFilters[filter.dataset.historyFilter] = filter.value;
    persistAppState();
    renderReview(els.reviewRoot, app.model, app.appState);
    return;
  }

  const categoryFilter = event.target.closest("[data-review-category-filter]");
  if (categoryFilter) {
    app.appState.reviewCategory = categoryFilter.value;
    persistAppState();
    renderReview(els.reviewRoot, app.model, app.appState);
    return;
  }

  const loadoutSelect = event.target.closest("[data-loadout-select]");
  if (loadoutSelect) {
    app.appState.loadout = {
      ...LOADOUT_DEFAULTS,
      ...(app.appState.loadout || {}),
      [loadoutSelect.dataset.loadoutSelect]: loadoutSelect.value,
      state: app.appState.loadout?.state === "started" ? "started" : "idle",
      assignment: null
    };
    persistAppState();
    render();
    return;
  }

  const logField = event.target.closest("[data-log-field]");
  if (logField) {
    const key = logField.dataset.logField;
    const value = logField.type === "checkbox" ? logField.checked : logField.value;
    app.appState.logDraft = { ...(app.appState.logDraft || {}), [key]: value };
    persistAppState();
    return;
  }

  const pipelineChoice = event.target.closest("[data-pipeline-choice]");
  if (pipelineChoice) {
    app.appState.pipeline = pipelineChoice.value;
    persistAppState();
    renderSettings(els.settingsRoot, app.model, app.appState);
    if (pipelineChoice.closest(".is-locked")) openPlanModal(els.modalRoot, pipelineChoice.closest(".pipeline-card")?.querySelector(".pill")?.textContent || "Pro");
    return;
  }

  const motionReduce = event.target.closest("[data-motion-reduce]");
  if (motionReduce) {
    app.appState.reduceMotion = motionReduce.checked;
    persistAppState();
    return;
  }

  const motionEffects = event.target.closest("[data-motion-effects]");
  if (motionEffects) {
    app.appState.motionEffects = motionEffects.checked;
    persistAppState();
  }
});

document.addEventListener("input", event => {
  const logField = event.target.closest("[data-log-field]");
  if (logField) {
    app.appState.logDraft = { ...(app.appState.logDraft || {}), [logField.dataset.logField]: logField.value };
    persistAppState();
    return;
  }

  if (event.target.id === "learnSearch") {
    app.appState.learnState.query = event.target.value;
    persistAppState();
    renderLearn(els.learnRoot, app.appState.learnState);
    const input = document.getElementById("learnSearch");
    input?.focus();
    input?.setSelectionRange?.(app.appState.learnState.query.length, app.appState.learnState.query.length);
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) {
    event.preventDefault();
    openSimpleModal("search");
  }
});

document.addEventListener("click", event => {
  const palette = event.target.closest("[data-palette-choice]");
  if (palette) {
    app.appState.palette = palette.dataset.paletteChoice;
    persistAppState();
    renderSettings(els.settingsRoot, app.model, app.appState);
  }
  const density = event.target.closest("[data-density-choice]");
  if (density) {
    app.appState.density = density.dataset.densityChoice;
    persistAppState();
    renderSettings(els.settingsRoot, app.model, app.appState);
  }
});

window.addEventListener("hashchange", () => applyRoute(parseRoute()));

applyRoute(parseRoute(), { replace: !location.hash });
