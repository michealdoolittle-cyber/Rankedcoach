import { escapeHtml } from "../model/utils.js";

function normalizeIconKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/%/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PILLAR_ICON_MARKUP = Object.freeze({
  mechanics: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>`,
  aim: `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>`,
  "game-sense": `<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.6"/>`,
  teamwork: `<circle cx="9" cy="9" r="3.4"/><circle cx="16" cy="11" r="3"/><path d="M3.5 19c.7-2.8 2.9-4.4 5.5-4.4s4.8 1.6 5.5 4.4M13.5 19c.5-2.1 2.1-3.3 4-3.3s3.5 1.2 4 3.3"/>`,
  discipline: `<path d="M12 2 20 5v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V5Z"/>`,
  mental: `<rect x="3.2" y="9" width="6.6" height="5" rx="1.2"/><rect x="14.2" y="9" width="6.6" height="5" rx="1.2"/><path d="M9.8 11.5h4.4M3.2 10l-1.7-.6M20.8 10l1.7-.6"/>`
});

const STAT_ICON_MARKUP = Object.freeze({
  "win-rate": `<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"/><path d="M12 13v3M9 20h6M10 20v-2.5c0-.6.4-1 1-1h2c.6 0 1 .4 1 1V20"/>`,
  acs: `<path d="M12 6.5c1.6 2 3 3.6 3 6a3 3 0 0 1-6 0c0-1.3.6-2.1 1-2.9.1 1 .7 1.5 1.2 1.5.6 0 .8-1 .8-1.7 0-.9-.5-1.9 0-2.9Z"/><circle cx="12" cy="12" r="9"/>`,
  kast: `<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>`,
  hs: `<path d="M12 3.5a5.2 5.2 0 0 0-5.2 5.2c0 2.3 1.1 3.6 1.9 4.4v1.4h6.6v-1.4c.8-.8 1.9-2.1 1.9-4.4A5.2 5.2 0 0 0 12 3.5Z"/><circle cx="9.8" cy="8.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.2" cy="8.8" r="1.1" fill="currentColor" stroke="none"/><path d="M9.5 14.7v1.3M12 14.7v1.8M14.5 14.7v1.3"/><circle cx="12" cy="10" r="5" stroke-width="1.3"/><path d="M12 5v3M12 12v3M7 10h3M14 10h3" stroke-width="1.3"/>`,
  matches: `<path d="M4 6h2M4 12h2M4 18h2"/><path d="M9 6h11M9 12h11M9 18h11"/>`
});

function inlineSvg(markup = "", {
  size = 18,
  title = "",
  className = "",
  viewBox = "0 0 24 24",
  attrs = ""
} = {}) {
  if (!markup) return "";
  const titleMarkup = title ? `<title>${escapeHtml(title)}</title>` : "";
  const aria = title ? `role="img" aria-label="${escapeHtml(title)}"` : `aria-hidden="true"`;
  return `<svg class="rc-icon rc-inline-icon ${escapeHtml(className)}" width="${Number(size) || 18}" height="${Number(size) || 18}" viewBox="${escapeHtml(viewBox)}" ${aria} ${attrs}>${titleMarkup}${markup}</svg>`;
}

export function icon(name, { size = 20, title = "", className = "" } = {}) {
  const safeName = escapeHtml(name);
  const titleMarkup = title ? `<title>${escapeHtml(title)}</title>` : "";
  const aria = title ? `role="img" aria-label="${escapeHtml(title)}"` : `aria-hidden="true"`;
  return `<svg class="rc-icon ${escapeHtml(className)}" width="${Number(size) || 20}" height="${Number(size) || 20}" viewBox="0 0 24 24" ${aria}>${titleMarkup}<use href="#outline-${safeName}"></use></svg>`;
}

export function pillarIcon(key = "", { size = 18, className = "" } = {}) {
  const normalized = normalizeIconKey(key).replace(/^aim-mechanics$/, "mechanics");
  const markup = PILLAR_ICON_MARKUP[normalized] || PILLAR_ICON_MARKUP.mechanics;
  return inlineSvg(markup, {
    size,
    className: `pillar-icon pillar-icon--${normalized} ${className}`.trim()
  });
}

export function statIcon(label = "", { size = 16, className = "" } = {}) {
  const key = normalizeIconKey(label);
  if (key === "k-d" || key === "kd") return "";
  const normalized = key === "hs" || key === "hs-percent" ? "hs"
    : key === "matches-total" ? "matches"
      : key;
  const markup = STAT_ICON_MARKUP[normalized];
  return inlineSvg(markup, {
    size,
    className: `stat-icon ${className}`.trim()
  });
}

export function impactPill(value = "Medium", { suffix = "impact", className = "" } = {}) {
  const raw = String(value || "Medium");
  const key = normalizeIconKey(raw);
  const level = key === "high" || key === "positive" ? 3
    : key === "medium" || key === "watch" || key === "setup" ? 2
      : 1;
  const tone = level === 3 ? "high" : level === 2 ? "medium" : "low";
  const bars = [1, 2, 3].map(item => `<span class="${item <= level ? "is-filled" : "is-dim"}"></span>`).join("");
  return `<span class="metric-pill metric-pill--impact metric-pill--${tone} ${escapeHtml(className)}"><span class="impact-bars" aria-hidden="true">${bars}</span><strong>${escapeHtml(raw)}</strong>${suffix ? `<small>${escapeHtml(suffix)}</small>` : ""}</span>`;
}

export function confidencePill(value = 0, { className = "" } = {}) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const dash = ((pct / 100) * 37.7).toFixed(1);
  return `<span class="metric-pill metric-pill--confidence ${escapeHtml(className)}"><svg class="confidence-ring" viewBox="0 0 16 16" aria-hidden="true"><circle class="confidence-ring-bg" cx="8" cy="8" r="6"></circle><circle class="confidence-ring-fill" cx="8" cy="8" r="6" stroke-dasharray="${dash} 37.7"></circle></svg><strong>${pct}%</strong><small>confidence</small></span>`;
}

export function button({
  label = "",
  variant = "secondary",
  action = "",
  attrs = "",
  iconName = "",
  type = "button",
  pressed = false,
  disabled = false,
  className = ""
} = {}) {
  const actionAttr = action ? `data-action="${escapeHtml(action)}"` : "";
  const pressedAttr = pressed ? `aria-pressed="true"` : "";
  const disabledAttr = disabled ? "disabled" : "";
  const iconMarkup = iconName ? icon(iconName) : "";
  return `
    <button class="rc-button rc-button--${escapeHtml(variant)} ${escapeHtml(className)}" type="${escapeHtml(type)}" ${actionAttr} ${attrs} ${pressedAttr} ${disabledAttr}>
      ${iconMarkup}
      ${label ? `<span>${escapeHtml(label)}</span>` : ""}
    </button>
  `;
}

export function card({
  eyebrow = "",
  title = "",
  body = "",
  footer = "",
  variant = "dashboard",
  attrs = "",
  className = "",
  as = "section"
} = {}) {
  const tag = ["article", "section", "div", "aside"].includes(as) ? as : "section";
  const header = eyebrow || title ? `
    <header class="rc-card__head">
      <div>
        ${eyebrow ? `<p class="rc-eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
        ${title ? `<h2>${escapeHtml(title)}</h2>` : ""}
      </div>
    </header>
  ` : "";
  return `
    <${tag} class="rc-card rc-card--${escapeHtml(variant)} ${escapeHtml(className)}" ${attrs}>
      ${header}
      <div class="rc-card__body">${body}</div>
      ${footer ? `<footer class="rc-card__foot">${footer}</footer>` : ""}
    </${tag}>
  `;
}

export function stateBlock({
  kind = "empty",
  title = "",
  message = "",
  action = ""
} = {}) {
  const iconName = kind === "error" ? "help" : kind === "locked" ? "settings" : kind === "loading" ? "loadout" : "review";
  return `
    <div class="rc-state rc-state--${escapeHtml(kind)}" role="${kind === "loading" ? "status" : "note"}">
      ${icon(iconName, { size: 46 })}
      <strong>${escapeHtml(title)}</strong>
      ${message ? `<p>${escapeHtml(message)}</p>` : ""}
      ${action || ""}
    </div>
  `;
}

export function cardHeader(eyebrow = "", title = "", extra = "") {
  return `
    <header class="rc-section-head">
      <div>
        ${eyebrow ? `<p class="rc-eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
        ${title ? `<h2>${escapeHtml(title)}</h2>` : ""}
      </div>
      ${extra || ""}
    </header>
  `;
}
