import { escapeHtml, formatDate, percent, ratio, whole } from "../model/utils.js";

function statTile(label, value, sub = "") {
  return `
    <div class="stat-tile">
      <span>${escapeHtml(label)}</span>
      <strong class="metric-value">${escapeHtml(value)}</strong>
      ${sub ? `<small>${escapeHtml(sub)}</small>` : ""}
    </div>
  `;
}

export function renderOverview(model = {}) {
  const overview = model.overview || {};
  const accountName = model.riotId || model.account?.name || "Synced account";
  const lastSync = model.syncedAt ? formatDate(model.syncedAt) : "Not synced";
  const sampleLabel = model.context?.sample?.label || "No sample";
  const rankSource = model.records?.some(record => record.rank?.verified) ? "verified RR snapshots" : "match stats only";
  return `
    <section class="card review-section overview-card" aria-labelledby="overviewTitle">
      <div class="rank-badge" aria-label="Current rank">${escapeHtml((model.currentRank || "UR").slice(0, 2).toUpperCase())}</div>
      <div>
        <p class="eyebrow">Review overview</p>
        <h2 id="overviewTitle">${escapeHtml(accountName)}</h2>
        <p class="muted">
          ${whole(overview.matchesPlayed || 0)} retained competitive ${overview.matchesPlayed === 1 ? "match" : "matches"} ·
          ${escapeHtml(model.currentRank || "Unranked")} · ${escapeHtml(sampleLabel)}
        </p>
        <p class="muted">Last synced ${escapeHtml(lastSync)}. RR chart uses ${escapeHtml(rankSource)}.</p>
      </div>
      <div class="overview-stats" aria-label="Season stat snapshot">
        ${statTile("Win rate", percent(overview.winRate), `${whole(overview.wins || 0)}W / ${whole(overview.losses || 0)}L`)}
        ${statTile("K/D", ratio(overview.kd), `${whole(overview.kills || 0)} kills`)}
        ${statTile("ACS", whole(overview.acs), `${whole(overview.adr)} ADR`)}
        ${statTile("HS%", percent(overview.hs), "retained shots")}
        ${statTile("KAST", percent(overview.overallKAST), "round data")}
        ${statTile("RR", whole(overview.rrTotal || 0), "verified total")}
      </div>
    </section>
  `;
}
