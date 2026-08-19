import { escapeHtml } from "../model/utils.js";

export function icon(name, { size = 20, title = "", className = "" } = {}) {
  const safeName = escapeHtml(name);
  const titleMarkup = title ? `<title>${escapeHtml(title)}</title>` : "";
  const aria = title ? `role="img" aria-label="${escapeHtml(title)}"` : `aria-hidden="true"`;
  return `<svg class="rc-icon ${escapeHtml(className)}" width="${Number(size) || 20}" height="${Number(size) || 20}" viewBox="0 0 24 24" ${aria}>${titleMarkup}<use href="#outline-${safeName}"></use></svg>`;
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
