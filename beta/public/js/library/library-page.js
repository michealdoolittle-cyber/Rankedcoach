import { button, card, cardHeader, stateBlock } from "../components/ui.js";
import { getLearnLibrary, renderLessonCard, searchLessons } from "../learn/library-data.js";
import { escapeHtml, normalizeKey, plural } from "../model/utils.js";
import { getAgentAsset, getMapAsset } from "../model/player-model.js";

const LIBRARY_VIEWS = [
  ["home", "Overview"],
  ["lineups", "Lineups"],
  ["routines", "Routines"],
  ["notes", "Notes"],
  ["collections", "Collections"],
  ["saved", "Watch Later"]
];

function sampleLineups() {
  return (globalThis.RankedCoachGamesenseMaps || []).slice(0, 10).map(map => ({
    id: `lineup-${normalizeKey(map.label)}`,
    title: `${map.label} quick lineups`,
    map: map.label,
    tags: ["Plant", "Retake", "Ranked"],
    image: getMapAsset(map.label),
    steps: [
      "Confirm spike path before leaving spawn.",
      "Pair the lineup with a teammate holding contact.",
      "Leave early if the post-plant loses space."
    ]
  }));
}

function sampleRoutines(model = {}) {
  const safeModel = model || {};
  const agents = (safeModel.agents || []).slice(0, 4);
  const base = agents.length ? agents : [{ agent: "Jett", role: "Duelist" }, { agent: "Sova", role: "Initiator" }];
  return base.map((item, index) => ({
    id: `routine-${normalizeKey(item.agent)}-${index}`,
    title: `${item.agent} pre-queue routine`,
    subtitle: `${item.role || "Role"} warm-up`,
    image: getAgentAsset(item.agent),
    steps: ["Two minutes crosshair placement", "One utility reminder", "One ranked focus cue"]
  }));
}

function getCounts(model = {}, appState = {}) {
  const safeModel = model || {};
  const safeState = appState || {};
  const learn = getLearnLibrary();
  return {
    lineups: sampleLineups().length,
    routines: sampleRoutines(safeModel).length,
    notes: safeState.libraryNotes?.length || 0,
    collections: safeState.collections?.length || 2,
    saved: safeState.savedLessons?.length || 0,
    lessons: learn.items.length
  };
}

function renderLibraryNav(view = "home") {
  return `
    <nav class="section-subnav" aria-label="Library sections">
      ${LIBRARY_VIEWS.map(([key, label]) => button({
        label,
        variant: view === key ? "primary" : "secondary",
        attrs: `data-library-view="${escapeHtml(key)}" aria-pressed="${view === key ? "true" : "false"}"`
      })).join("")}
    </nav>
  `;
}

function renderHome(model = {}, appState = {}) {
  const counts = getCounts(model, appState);
  const cards = [
    ["lineups", "Lineups", counts.lineups, "Map utility and plant plans saved for fast lookup."],
    ["routines", "Routines", counts.routines, "Warm-up and post-match training templates."],
    ["notes", "Notes", counts.notes, "Personal notes and dossier edits."],
    ["collections", "Custom Collections", counts.collections, "Grouped concepts, lineups, and reminders."],
    ["saved", "Watch Later", counts.saved, "Lessons saved from Review and Learn."]
  ].map(([key, title, count, body]) => card({
    eyebrow: plural(count, "item"),
    title,
    body: `<p>${escapeHtml(body)}</p>`,
    footer: button({ label: "Open", variant: "tertiary", attrs: `data-library-view="${escapeHtml(key)}"` }),
    className: "library-summary-card"
  })).join("");
  return `
    <section class="library-hero rc-card">
      ${cardHeader("Library", "Your saved coaching shelf.", `<span class="pill">${counts.lessons} learnable references</span>`)}
      <p class="muted">Lineups, routines, saved lessons, notes, and custom collections live here. The beta starts with local data and a small durable schema for user-saved items.</p>
    </section>
    <div class="library-summary-grid">${cards}</div>
  `;
}

function renderLineups() {
  const rows = sampleLineups().map(item => `
    <article class="library-lineup-card">
      <img src="${escapeHtml(item.image)}" alt="">
      <div>
        <p class="rc-eyebrow">${escapeHtml(item.map)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.steps[0])}</p>
        <div class="recent-list">${item.tags.map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join("")}</div>
      </div>
      ${button({ label: "Open Detail", variant: "secondary", action: "open-lineup-detail", attrs: `data-lineup-id="${escapeHtml(item.id)}"` })}
    </article>
  `).join("");
  return `<section class="rc-card library-section">${cardHeader("Lineups", "Utility plans and plant reminders.")}<div class="library-list">${rows}</div></section>`;
}

function renderRoutines(model = {}) {
  const rows = sampleRoutines(model).map(item => `
    <article class="library-routine-card">
      <img src="${escapeHtml(item.image)}" alt="">
      <div>
        <p class="rc-eyebrow">${escapeHtml(item.subtitle)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <ol>${item.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
      </div>
    </article>
  `).join("");
  return `<section class="rc-card library-section">${cardHeader("Routines", "Repeatable pre/post-match work.")}<div class="library-card-grid">${rows}</div></section>`;
}

function renderNotes(appState = {}) {
  const notes = appState.libraryNotes || [];
  return `
    <section class="rc-card library-section">
      ${cardHeader("Notes", "Private beta notes.", button({ label: "New Note", variant: "primary", action: "library-new-note" }))}
      ${notes.length ? `<div class="library-list">${notes.map(note => `<article class="note-row"><strong>${escapeHtml(note.title)}</strong><p>${escapeHtml(note.body)}</p></article>`).join("")}</div>` : stateBlock({ title: "No notes yet.", message: "Save a lesson or create a note from here when you want a personal reference." })}
    </section>
  `;
}

function renderCollections(appState = {}) {
  const collections = appState.collections || [
    { title: "Ranked queue reset", count: 4 },
    { title: "Map day prep", count: 6 }
  ];
  return `
    <section class="rc-card library-section">
      ${cardHeader("Custom Collections", "Group anything you want to revisit.", button({ label: "Create Collection", variant: "primary", action: "library-create-collection" }))}
      <div class="library-summary-grid">${collections.map(item => card({ eyebrow: plural(item.count || 0, "saved item"), title: item.title, body: "<p>Collection detail/editor route placeholder is wired for the beta shell.</p>" })).join("")}</div>
    </section>
  `;
}

function renderSaved(appState = {}) {
  const learn = getLearnLibrary();
  const savedIds = new Set(appState.savedLessons || []);
  const saved = learn.items.filter(item => savedIds.has(item.id)).slice(0, 24);
  const fallback = searchLessons(learn.items, "", "Concepts").slice(0, 8);
  return `
    <section class="rc-card library-section">
      ${cardHeader("Watch Later", "Saved lessons and topics.")}
      <div class="topic-grid">${(saved.length ? saved : fallback).map(renderLessonCard).join("")}</div>
    </section>
  `;
}

export function renderLibrary(root, model, appState = {}) {
  if (!root) return;
  const view = appState.libraryView || "home";
  const content = view === "lineups" ? renderLineups(model)
    : view === "routines" ? renderRoutines(model)
      : view === "notes" ? renderNotes(appState)
        : view === "collections" ? renderCollections(appState)
          : view === "saved" ? renderSaved(appState)
            : renderHome(model, appState);
  root.innerHTML = `
    <div class="library-layout">
      ${renderLibraryNav(view)}
      ${content}
    </div>
  `;
}

export function openLineupModal(modalRoot, lineupId = "") {
  if (!modalRoot) return;
  const lineup = sampleLineups().find(item => item.id === lineupId) || sampleLineups()[0];
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card lineup-modal" role="dialog" aria-modal="true" aria-labelledby="lineupTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">${escapeHtml(lineup.map)}</p>
            <h2 id="lineupTitle">${escapeHtml(lineup.title)}</h2>
          </div>
          ${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}
        </header>
        <div class="modal-body lineup-detail-grid">
          <img src="${escapeHtml(lineup.image)}" alt="">
          <div>
            <h3>Steps</h3>
            <ol>${lineup.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
            <div class="choice-row">
              ${button({ label: "Copy", variant: "secondary", action: "copy-lineup" })}
              ${button({ label: "Share", variant: "secondary", action: "share-lineup" })}
              ${button({ label: "Edit", variant: "primary", action: "edit-lineup" })}
              ${button({ label: "Add to Collection", variant: "secondary", action: "add-lineup-collection" })}
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
