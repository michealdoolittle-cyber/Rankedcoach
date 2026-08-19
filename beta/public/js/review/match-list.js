import { escapeHtml, formatDate, percent, ratio, whole } from "../model/utils.js";
import { getAgentAsset, getMapAsset } from "../model/player-model.js";
import { button } from "../components/ui.js";

export function renderLastFive(model = {}) {
  const cards = (model.records || []).slice(0, 5).map(record => `
    <article class="match-mini ${record.result === "win" ? "is-win" : "is-loss"}">
      <span class="pill ${record.result === "win" ? "good" : "bad"}">${escapeHtml(record.result || "unknown")}</span>
      <div class="match-media">
        <img src="${escapeHtml(getAgentAsset(record.agent))}" alt="">
        <div>
          <strong>${escapeHtml(record.agent || "Unknown")}</strong>
          <small>${escapeHtml(record.map || "Unknown map")}</small>
        </div>
      </div>
      <small>${escapeHtml(formatDate(record.playedAt))} · ${whole(record.stats?.kills)} / ${whole(record.stats?.deaths)} / ${whole(record.stats?.assists)}</small>
    </article>
  `).join("");
  return `
    <section class="card review-section" aria-labelledby="lastFiveTitle">
      <div class="review-section-head">
        <div>
          <p class="eyebrow">Last 5 matches</p>
          <h3 id="lastFiveTitle">Recent imported games</h3>
        </div>
        ${button({ label: "View All Matches", variant: "secondary", action: "open-history" })}
      </div>
      <div class="last-match-grid">${cards || "<p class=\"muted\">No matches loaded yet.</p>"}</div>
    </section>
  `;
}

export function renderHistory(model = {}, filters = {}) {
  const maps = [...new Set((model.records || []).map(record => record.map).filter(Boolean))].sort();
  const agents = [...new Set((model.records || []).map(record => record.agent).filter(Boolean))].sort();
  const mapFilter = filters.map || "";
  const agentFilter = filters.agent || "";
  const resultFilter = filters.result || "";
  const rows = (model.records || [])
    .filter(record => !mapFilter || record.map === mapFilter)
    .filter(record => !agentFilter || record.agent === agentFilter)
    .filter(record => !resultFilter || record.result === resultFilter)
    .map(record => `
      <article class="history-row">
        <div class="match-media">
          <img src="${escapeHtml(getMapAsset(record.map))}" alt="">
          <img src="${escapeHtml(getAgentAsset(record.agent))}" alt="">
        </div>
        <div>
          <strong>Match ${whole(record.matchIndex)} · ${escapeHtml(record.map || "Unknown")}</strong>
          <p class="muted">${escapeHtml(record.agent || "Unknown agent")} · ${escapeHtml(record.role || "Unknown role")} · ${escapeHtml(formatDate(record.playedAt))}</p>
        </div>
        <div>
          <span class="pill ${record.result === "win" ? "good" : "bad"}">${escapeHtml(record.result || "unknown")}</span>
          <p>${whole(record.stats?.kills)} / ${whole(record.stats?.deaths)} / ${whole(record.stats?.assists)} · ${ratio(record.stats?.kills / Math.max(1, record.stats?.deaths || 0))} K/D · ${percent(record.stats?.hsPercent)}</p>
        </div>
      </article>
    `).join("");
  return `
    <section class="card review-section" aria-labelledby="historyTitle">
      <p class="eyebrow">Match history</p>
      <h2 id="historyTitle">Scrollable retained matches</h2>
      <div class="history-tools">
        <select data-history-filter="map" aria-label="Filter by map">
          <option value="">All maps</option>
          ${maps.map(map => `<option value="${escapeHtml(map)}" ${map === mapFilter ? "selected" : ""}>${escapeHtml(map)}</option>`).join("")}
        </select>
        <select data-history-filter="agent" aria-label="Filter by agent">
          <option value="">All agents</option>
          ${agents.map(agent => `<option value="${escapeHtml(agent)}" ${agent === agentFilter ? "selected" : ""}>${escapeHtml(agent)}</option>`).join("")}
        </select>
        <select data-history-filter="result" aria-label="Filter by result">
          <option value="">All results</option>
          <option value="win" ${resultFilter === "win" ? "selected" : ""}>Wins</option>
          <option value="loss" ${resultFilter === "loss" ? "selected" : ""}>Losses</option>
        </select>
      </div>
      <div class="history-list">${rows || "<p class=\"muted\">No matches match those filters.</p>"}</div>
    </section>
  `;
}
