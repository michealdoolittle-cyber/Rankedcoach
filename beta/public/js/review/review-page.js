import { button, card, cardHeader, stateBlock } from "../components/ui.js";
import { getPriorityInsight } from "../model/insights.js";
import { escapeHtml, formatDate, normalizeKey, percent, ratio, whole } from "../model/utils.js";
import { renderOverview } from "./overview.js";
import { renderPerformanceOverTime } from "./performance.js";
import { renderRRTrend } from "./rr-chart.js";
import { renderCoachSummary } from "./coach-summary.js";
import { renderCompassBreakdown } from "./compass.js";
import { renderLastFive, renderHistory } from "./match-list.js";
import { renderBreakdowns } from "./breakdowns.js";

const REVIEW_TABS = [
  ["performance", "Performance"],
  ["timeline", "Timeline"],
  ["insights", "Insights"],
  ["reflections", "Reflection Matches"],
  ["all-matches", "All Matches"],
  ["stats", "Stats"]
];

function tabNav(active = "performance") {
  return `
    <nav class="section-subnav review-tabs" aria-label="Review tabs">
      ${REVIEW_TABS.map(([key, label]) => button({
        label,
        variant: key === active ? "primary" : "secondary",
        attrs: `data-review-tab="${escapeHtml(key)}" aria-pressed="${key === active ? "true" : "false"}"`
      })).join("")}
    </nav>
  `;
}

function renderPerformance(model = {}) {
  return `
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

function renderTimeline(model = {}, state = {}) {
  const category = state.reviewCategory || "";
  const pillars = model.pillars || [];
  const selected = category ? normalizeKey(category) : "";
  const filtered = selected
    ? (model.records || []).filter(record => normalizeKey(record.role).includes(selected) || normalizeKey(record.agent).includes(selected) || normalizeKey(record.map).includes(selected))
    : (model.records || []);
  const markers = filtered.slice().reverse().map(record => `
    <button class="timeline-marker ${record.result === "win" ? "is-win" : "is-loss"}" type="button" data-match-id="${escapeHtml(record.id)}">
      <span>Match ${whole(record.matchIndex)}</span>
      <strong>${escapeHtml(record.agent || "Unknown")} · ${escapeHtml(record.map || "Unknown")}</strong>
      <small>${escapeHtml(formatDate(record.playedAt))} · ${escapeHtml(record.result || "unknown")} · ${whole(record.stats?.kills)} / ${whole(record.stats?.deaths)} / ${whole(record.stats?.assists)}</small>
    </button>
  `).join("");
  return `
    <section class="rc-card review-route-section">
      ${cardHeader("Timeline", "Match markers and category movement.", `<select data-review-category-filter aria-label="Timeline category"><option value="">All categories</option>${pillars.map(pillar => `<option value="${escapeHtml(pillar.key)}" ${normalizeKey(pillar.key) === selected ? "selected" : ""}>${escapeHtml(pillar.label)}</option>`).join("")}</select>`)}
      <div class="timeline-route-grid">
        ${pillars.map(pillar => `
          <button class="timeline-category ${normalizeKey(pillar.key) === selected ? "is-active" : ""}" type="button" data-review-tab="timeline" data-review-category="${escapeHtml(pillar.key)}">
            <span>${escapeHtml(pillar.label)}</span>
            <strong>${whole(pillar.score)}/100</strong>
            <small>${escapeHtml(pillar.trend || "Stable")} · ${escapeHtml(pillar.reference || "current window")}</small>
          </button>
        `).join("")}
      </div>
      <div class="timeline-marker-list">${markers || "<p class=\"muted\">No matches for this filter yet.</p>"}</div>
    </section>
  `;
}

function renderInsights(model = {}) {
  const cards = [...(model.ruleCards || []), ...(model.trendCards || [])];
  const priority = getPriorityInsight(model);
  const rows = (cards.length ? cards : [priority]).slice(0, 16).map((item, index) => `
    <article class="insight-row">
      <span class="pill ${escapeHtml(item.type || item.tone || "warn")}">${escapeHtml(item.status || item.type || item.tone || "Watch")}</span>
      <div>
        <h3>${escapeHtml(item.title || `Insight ${index + 1}`)}</h3>
        <p>${escapeHtml(item.preview || item.action || item.why || "No detail available yet.")}</p>
      </div>
      <div class="insight-row-meta">
        <strong>${whole(item.priority || item.confidence || 50)}</strong>
        <small>impact/confidence</small>
      </div>
      ${button({ label: "Open", variant: "secondary", action: "open-insight-detail" })}
    </article>
  `).join("");
  return `
    <section class="rc-card review-route-section">
      ${cardHeader("Insights", "Prioritized reads from synced data.")}
      <div class="insight-list">${rows}</div>
    </section>
  `;
}

function reflectionRows(appState = {}) {
  const reflections = appState.reflections || [];
  return reflections.map((item, index) => `
    <article class="history-row reflection-row">
      <div>
        <strong>Reflection ${index + 1} · ${escapeHtml(item.map || "Unknown map")}</strong>
        <p class="muted">${escapeHtml(item.agent || "Unknown")} · ${escapeHtml(item.focus || "No focus")} · ${escapeHtml(formatDate(item.playedAt || item.createdAt))}</p>
      </div>
      <div>
        <span class="pill ${item.result === "win" ? "good" : item.result === "loss" ? "bad" : "warn"}">${escapeHtml(item.result || "unknown")}</span>
        <p>${escapeHtml(item.feeling || "No mood")} · ${escapeHtml(item.rating || "No rating")}</p>
      </div>
      ${button({ label: "Open Detail", variant: "secondary", attrs: `data-reflection-id="${escapeHtml(item.id)}"` })}
    </article>
  `).join("");
}

function renderReflections(appState = {}) {
  const rows = reflectionRows(appState);
  return `
    <section class="rc-card review-route-section">
      ${cardHeader("Reflection Matches", "Matches with saved self-review.", button({ label: "Log Match", variant: "primary", attrs: `data-page-jump="log-match"` }))}
      ${rows ? `<div class="history-list">${rows}</div>` : stateBlock({ title: "No reflections yet.", message: "Use Log Match and keep 'Save to Reflection Matches' on to build this list." })}
    </section>
  `;
}

function renderStatsTab(model = {}) {
  const overview = model.overview || {};
  const statCards = [
    ["Matches", whole(overview.matchesPlayed || 0), "retained competitive"],
    ["Win rate", percent(overview.winRate), `${whole(overview.wins || 0)} wins`],
    ["K/D", ratio(overview.kd), `${whole(overview.kills || 0)} kills`],
    ["ACS", whole(overview.acs), "combat score"],
    ["HS%", percent(overview.hs), "shot sample"],
    ["KAST", percent(overview.overallKAST), "round impact"]
  ].map(([label, value, sub]) => `
    <button class="stat-tile stat-route-tile" type="button" data-review-stat="${escapeHtml(label)}">
      <span>${escapeHtml(label)}</span>
      <strong class="metric-value">${escapeHtml(value)}</strong>
      <small>${escapeHtml(sub)}</small>
    </button>
  `).join("");
  return `
    <section class="rc-card review-route-section">
      ${cardHeader("Stats", "Overview, weapons, agents, and maps.")}
      <div class="stats-route-grid">${statCards}</div>
      ${renderBreakdowns(model)}
    </section>
  `;
}

function renderEmpty(activeTab = "performance") {
  return `
    ${tabNav(activeTab)}
    ${stateBlock({
      title: "Sync a Riot account to start Review.",
      message: "Review will fill with real retained competitive matches: performance trends, RR movement, Compass breakdown, recent matches, and entity-specific reads."
    })}
  `;
}

export function renderReview(root, model, state = {}) {
  if (!root) return;
  const activeTab = state.reviewTab || "performance";
  if (!model?.records?.length) {
    root.innerHTML = renderEmpty(activeTab);
    return;
  }
  const body = activeTab === "timeline" ? renderTimeline(model, state)
    : activeTab === "insights" ? renderInsights(model)
      : activeTab === "reflections" ? renderReflections(state)
        : activeTab === "all-matches" ? renderHistory(model, state.historyFilters || {})
          : activeTab === "stats" ? renderStatsTab(model)
            : renderPerformance(model);
  root.innerHTML = `${tabNav(activeTab)}${body}`;
}

export function renderHistoryPage(root, model, filters = {}) {
  if (!root) return;
  if (!model?.records?.length) {
    root.innerHTML = stateBlock({
      title: "No match history loaded.",
      message: "Sync an account first; then this page becomes the full scrollable match log with map, agent, and result filters."
    });
    return;
  }
  root.innerHTML = renderHistory(model, filters);
}
