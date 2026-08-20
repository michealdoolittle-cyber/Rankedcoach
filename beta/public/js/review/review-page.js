import { button, card, cardHeader, pillarIcon, stateBlock } from "../components/ui.js";
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
            <span>${pillarIcon(pillar.key)}${escapeHtml(pillar.label)}</span>
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

function statTrendSvg(records = []) {
  const sample = records.slice(0, 10).reverse();
  if (!sample.length) return "<p class=\"muted\">No stat trend sample yet.</p>";
  const values = sample.map(record => Number(record.stats?.acs || 0));
  const max = Math.max(220, ...values);
  const points = values.map((value, index) => {
    const x = sample.length === 1 ? 50 : 8 + (index / (sample.length - 1)) * 84;
    const y = 74 - (Math.max(0, value) / max) * 58;
    return `${x},${y}`;
  }).join(" ");
  const bars = values.map((value, index) => {
    const x = sample.length === 1 ? 48 : 7 + (index / (sample.length - 1)) * 84;
    const h = Math.max(3, (Math.max(0, value) / max) * 58);
    return `<rect x="${x}" y="${74 - h}" width="3.5" height="${h}" rx="1.2" />`;
  }).join("");
  return `
    <svg class="stats-trend-chart" viewBox="0 0 100 86" preserveAspectRatio="none" role="img" aria-label="ACS trend for recent matches">
      <g class="stats-trend-grid">
        <line x1="6" y1="16" x2="96" y2="16" />
        <line x1="6" y1="45" x2="96" y2="45" />
        <line x1="6" y1="74" x2="96" y2="74" />
      </g>
      <g class="stats-trend-bars">${bars}</g>
      <polyline class="stats-trend-line" points="${points}" fill="none" />
    </svg>
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
  const roles = (model.roles || []).slice(0, 4).map(role => `
    <button class="stats-role-card" type="button" data-review-category="${escapeHtml(role.role || role.label || "")}" data-review-tab="stats">
      <span>${escapeHtml(role.role || role.label || "Role")}</span>
      <strong>${percent(role.winRate)}</strong>
      <small>${whole(role.matchesPlayed || 0)} games</small>
    </button>
  `).join("");
  const patterns = (model.trendCards || []).slice(0, 4).map(card => `
    <article class="stats-pattern-card">
      <span class="pill ${escapeHtml(card.tone || card.type || "warn")}">${escapeHtml(card.status || card.tone || "Watch")}</span>
      <strong>${escapeHtml(card.title || "Match pattern")}</strong>
      <p>${escapeHtml(card.preview || card.action || "No supporting detail yet.")}</p>
    </article>
  `).join("");
  return `
    <section class="rc-card review-route-section">
      ${cardHeader("Stats", "Overview, weapons, agents, and maps.")}
      <div class="stats-dashboard-grid">
        <section class="stats-summary-panel">
          <div class="stats-route-grid">${statCards}</div>
        </section>
        <section class="stats-peak-panel">
          <p class="rc-eyebrow">Peak Progress</p>
          <strong>${escapeHtml(model.currentRank || "Unranked")}</strong>
          <span>${escapeHtml(model.currentAct || "Current Season")}</span>
          <p class="muted">Rank and RR are shown only when verified by retained match data.</p>
        </section>
        <section class="stats-role-panel">
          <p class="rc-eyebrow">Role Win Rate Progress</p>
          <div class="stats-role-grid">${roles || "<p class=\"muted\">No role sample yet.</p>"}</div>
        </section>
        <section class="stats-trend-panel">
          <p class="rc-eyebrow">Recent Stat Trend</p>
          ${statTrendSvg(model.records || [])}
        </section>
        <section class="stats-pattern-panel">
          <p class="rc-eyebrow">Match Patterns</p>
          <div class="stats-pattern-grid">${patterns || "<p class=\"muted\">No match patterns yet.</p>"}</div>
        </section>
      </div>
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
