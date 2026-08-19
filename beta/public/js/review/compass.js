import { escapeHtml, whole } from "../model/utils.js";

function point(cx, cy, radius, angle, value) {
  const scaled = radius * Math.max(0, Math.min(100, Number(value) || 0)) / 100;
  return {
    x: cx + Math.cos(angle) * scaled,
    y: cy + Math.sin(angle) * scaled
  };
}

export function renderCompassBreakdown(model = {}) {
  const pillars = model.pillars || [];
  const size = 320;
  const center = size / 2;
  const radius = 112;
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  const polygon = pillars.map((pillar, index) => {
    const p = point(center, center, radius, angles[index] ?? 0, pillar.score);
    return `${p.x},${p.y}`;
  }).join(" ");
  const axes = pillars.map((pillar, index) => {
    const angle = angles[index] ?? 0;
    const end = point(center, center, radius, angle, 100);
    const label = point(center, center, radius + 28, angle, 100);
    return `
      <line x1="${center}" y1="${center}" x2="${end.x}" y2="${end.y}" stroke="rgba(148,163,184,.35)" />
      <text x="${label.x}" y="${label.y}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(pillar.label)}</text>
    `;
  }).join("");
  const details = pillars.map(pillar => `
    <article class="pillar-detail">
      <strong>${escapeHtml(pillar.label)} · ${whole(pillar.score)}/100</strong>
      <p>${escapeHtml(pillar.driver || "No driver stat available yet.")}</p>
      <small>${escapeHtml(pillar.trend || "Stable")} · ${escapeHtml(pillar.reference || "current window")}</small>
    </article>
  `).join("");
  return `
    <section class="rc-card review-section compass-card" aria-labelledby="compassTitle">
      <p class="eyebrow">Compass breakdown</p>
      <h3 id="compassTitle">Aim · Game Sense · Teamwork · Discipline</h3>
      <p class="muted">This build keeps the production four-pillar Compass while using the beta visual shell.</p>
      <div class="compass-layout">
        <div class="compass-chart">
          <svg role="img" aria-label="Compass pillar radar" viewBox="0 0 ${size} ${size}">
            <polygon points="${center},${center - radius} ${center + radius},${center} ${center},${center + radius} ${center - radius},${center}" fill="rgba(53,242,255,.08)" stroke="rgba(148,163,184,.32)" />
            ${axes}
            <polygon points="${polygon}" fill="rgba(53,242,255,.22)" stroke="var(--rc-review)" stroke-width="4" />
          </svg>
        </div>
        <div class="compass-details">${details}</div>
      </div>
    </section>
  `;
}
