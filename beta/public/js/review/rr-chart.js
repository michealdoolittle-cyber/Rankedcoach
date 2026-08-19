import { escapeHtml, finite, number, whole } from "../model/utils.js";

function buildSeries(records = []) {
  let total = 0;
  return records.slice().reverse().map((record, index) => {
    total += number(record.rank?.rrDelta, 0);
    return {
      index: index + 1,
      total,
      delta: record.rank?.rrDelta,
      rank: record.rank?.rank || "Unranked",
      label: `Match ${index + 1}`
    };
  });
}

export function renderRRTrend(model = {}) {
  const series = buildSeries(model.records || []);
  const width = 720;
  const height = 260;
  const pad = 34;
  const values = series.map(point => point.total).concat([0]);
  const min = Math.min(...values, -25);
  const max = Math.max(...values, 25);
  const span = Math.max(1, max - min);
  const x = index => series.length <= 1 ? width - pad : pad + (index / (series.length - 1)) * (width - pad * 2);
  const y = value => height - pad - ((value - min) / span) * (height - pad * 2);
  const points = series.map((point, index) => `${x(index)},${y(point.total)}`).join(" ");
  const zeroY = y(0);
  const tickValues = [max, Math.round((max + min) / 2), min];
  const dots = series.map((point, index) => `
    <g>
      <circle cx="${x(index)}" cy="${y(point.total)}" r="5" fill="var(--yellow)" />
      <text x="${x(index)}" y="${height - 8}" text-anchor="middle">${point.index}</text>
      <title>${escapeHtml(point.label)} · ${escapeHtml(point.rank)} · ${finite(point.delta) ? `${whole(point.delta)} RR` : "RR unavailable"}</title>
    </g>
  `).join("");

  return `
    <section class="card review-section rr-chart" aria-labelledby="rrTitle">
      <p class="eyebrow">RR trend</p>
      <h3 id="rrTitle">Verified rank movement</h3>
      <svg role="img" aria-label="RR trend across imported matches" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <line x1="${pad}" x2="${width - pad}" y1="${zeroY}" y2="${zeroY}" stroke="rgba(40,232,132,.65)" stroke-width="2" />
        ${tickValues.map(value => `<text x="4" y="${y(value) + 4}">${whole(value)}</text>`).join("")}
        <polyline points="${points}" fill="none" stroke="var(--yellow)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
        ${dots}
      </svg>
      <p class="muted">${series.length ? `${series.length} imported matches shown. Missing RR stays flat at 0 until a verified snapshot exists.` : "No RR points available yet."}</p>
    </section>
  `;
}
