import { pillarIcon } from "../components/ui.js";
import { escapeHtml, whole } from "../model/utils.js";

function point(cx, cy, radius, angle, value) {
  const scaled = radius * Math.max(0, Math.min(100, Number(value) || 0)) / 100;
  return {
    x: cx + Math.cos(angle) * scaled,
    y: cy + Math.sin(angle) * scaled
  };
}

function angleAt(index, total) {
  return -Math.PI / 2 + (Math.PI * 2 * index) / Math.max(1, total);
}

export function renderCompassBreakdown(model = {}) {
  const pillars = model.pillars || [];
  const size = 320;
  const center = size / 2;
  const radius = 112;
  const angles = pillars.map((_, index) => angleAt(index, pillars.length || 5));
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
      <strong>${pillarIcon(pillar.key)}${escapeHtml(pillar.label)} · ${whole(pillar.score)}/100</strong>
      <p>${escapeHtml(pillar.driver || "No driver stat available yet.")}</p>
      <small>${escapeHtml(pillar.trend || "Stable")} · ${escapeHtml(pillar.reference || "current window")}</small>
    </article>
  `).join("");
  return `
    <section class="rc-card review-section compass-card" aria-labelledby="compassTitle">
      <p class="eyebrow">Compass breakdown</p>
      <h3 id="compassTitle">Mechanics · Mental · Game Sense · Teamwork · Discipline</h3>
      <p class="muted">The full Compass reads five coaching pillars. Smaller Play surfaces may abbreviate Mechanics as Aim, but Review keeps the full model visible.</p>
      <div class="compass-layout">
        <div class="compass-chart">
          <svg role="img" aria-label="Compass pillar radar" viewBox="0 0 ${size} ${size}">
            ${[1, 0.75, 0.5, 0.25].map(scale => `<polygon points="${angles.map(angle => {
              const ring = point(center, center, radius * scale, angle, 100);
              return `${ring.x},${ring.y}`;
            }).join(" ")}" fill="none" stroke="rgba(148,163,184,.22)" />`).join("")}
            ${axes}
            <polygon points="${polygon}" fill="rgba(53,242,255,.22)" stroke="var(--rc-review)" stroke-width="4" />
          </svg>
        </div>
        <div class="compass-details">${details}</div>
      </div>
    </section>
  `;
}
