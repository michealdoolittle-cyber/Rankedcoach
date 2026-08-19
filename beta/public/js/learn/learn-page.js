import { escapeHtml } from "../model/utils.js";
import { getLearnLibrary, renderLessonCard, searchLessons } from "./library-data.js";
import { loadRecentLearn } from "../state/store.js";

const CATEGORY_META = {
  Maps: {
    subtitle: "Attack, defense, plant, and rotation reads",
    style: "linear-gradient(145deg, rgba(53,242,255,.18), rgba(255,211,77,.08))"
  },
  Agents: {
    subtitle: "Ability purpose, fundamentals, and role habits",
    style: "linear-gradient(145deg, rgba(167,139,250,.22), rgba(53,242,255,.08))"
  },
  Weapons: {
    subtitle: "Fight ranges, economy, damage, and weapon identity",
    style: "linear-gradient(145deg, rgba(255,211,77,.2), rgba(255,78,104,.08))"
  },
  Concepts: {
    subtitle: "Core habits RankedCoach can connect to Review",
    style: "linear-gradient(145deg, rgba(40,232,132,.18), rgba(53,242,255,.08))"
  }
};

export function renderLearn(root, state = {}) {
  if (!root) return;
  const library = getLearnLibrary();
  const query = state.query || "";
  const category = state.category || "";
  const results = searchLessons(library.items, query, category).slice(0, 28);
  const recommended = buildRecommendations(library.items, state.model).slice(0, 8);
  const recent = loadRecentLearn();
  const categoryTiles = Object.keys(CATEGORY_META).map(key => `
    <button class="category-tile ${category === key ? "is-active" : ""}" type="button" data-learn-category="${escapeHtml(key)}" style="--tile-bg:${CATEGORY_META[key].style}">
      <span class="pill">${library.byCategory[key]?.length || 0} lessons</span>
      <strong>${escapeHtml(key)}</strong>
      <p>${escapeHtml(CATEGORY_META[key].subtitle)}</p>
    </button>
  `).join("");
  root.innerHTML = `
    <div class="learn-layout">
      <section class="card learn-hero" aria-labelledby="learnTitle">
        <div>
          <p class="eyebrow">Learn</p>
          <h2 id="learnTitle">Concepts that connect back to your Review.</h2>
          <p class="muted">Search the beta lesson archive or open a category. Lessons are copied from the isolated beta vendor data, not production app runtime code.</p>
        </div>
        <label class="learn-search">
          Search lessons
          <input id="learnSearch" value="${escapeHtml(query)}" placeholder="Try Ascent mid, Tailwind, Vandal, trading...">
        </label>
      </section>
      <section class="learn-section">
        <div class="category-grid">${categoryTiles}</div>
      </section>
      <section class="card learn-section">
        <h3>${category ? `${escapeHtml(category)} lessons` : "Popular topics"}</h3>
        <div class="topic-grid">${results.map(renderLessonCard).join("") || "<p class=\"muted\">No lessons matched that search.</p>"}</div>
      </section>
      <section class="card learn-section">
        <h3>Recommended for you</h3>
        <div class="topic-grid">${recommended.map(renderLessonCard).join("") || "<p class=\"muted\">Sync an account to personalize recommendations.</p>"}</div>
      </section>
      <section class="card learn-section">
        <h3>Recently viewed</h3>
        <div class="recent-list">${recent.map(item => `<span class="pill">${escapeHtml(item.title)}</span>`).join("") || "<span class=\"muted\">Open a lesson to build this list.</span>"}</div>
      </section>
    </div>
  `;
}

export function buildRecommendations(items = [], model = {}) {
  const weakest = (model?.pillars || []).slice().sort((a, b) => (a.score || 0) - (b.score || 0))[0];
  const terms = new Set([weakest?.label, weakest?.statKey, ...(model?.maps || []).slice(0, 2).map(item => item.map), ...(model?.agents || []).slice(0, 2).map(item => item.agent)].filter(Boolean).map(term => String(term).toLowerCase()));
  if (!terms.size) return items.filter(item => item.category === "Concepts");
  return items.filter(item => {
    const haystack = `${item.title} ${item.summary} ${item.overview}`.toLowerCase();
    return [...terms].some(term => haystack.includes(term));
  });
}
