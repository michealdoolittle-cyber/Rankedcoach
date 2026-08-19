import { button, card, cardHeader, stateBlock } from "../components/ui.js";
import { escapeHtml, percent, whole } from "../model/utils.js";

const PIPELINES = [
  {
    id: "competitor",
    label: "Competitor",
    tier: "Free",
    text: "Sharper ranked actions, direct focus queue, less narration."
  },
  {
    id: "analyst",
    label: "Analyst",
    tier: "Pro",
    text: "More evidence windows, trend comparisons, and breakdown detail."
  },
  {
    id: "grinder",
    label: "Grinder",
    tier: "Free",
    text: "Fast daily repetition with simple next-match cues."
  },
  {
    id: "strategist",
    label: "Strategist",
    tier: "Elite",
    text: "Map/role planning, library-first suggestions, and deeper prep."
  },
  {
    id: "challenger",
    label: "Challenger",
    tier: "Pro",
    text: "Aggressive improvement targets and shorter feedback loops."
  }
];

const PALETTES = [
  ["obsidian", "Obsidian", "#8b5cf6", "#4fd1b5"],
  ["neo-mint", "Neo Mint", "#4fd1b5", "#60a5fa"],
  ["sunset", "Sunset", "#ff4e68", "#f5c451"],
  ["aurora", "Aurora", "#60a5fa", "#a78bfa"],
  ["rosewood", "Rosewood", "#fb7185", "#f9a8d4"],
  ["monochrome", "Monochrome", "#f6f8fc", "#7c889c"]
];

const SETTINGS_TABS = [
  ["pipeline", "Pipeline"],
  ["visual", "Visual"],
  ["profile", "Profile"],
  ["notifications", "Notifications"],
  ["integrations", "Integrations"],
  ["billing", "Billing"]
];

function renderSettingsNav(active = "pipeline") {
  return `
    <nav class="section-subnav settings-nav" aria-label="Settings tabs">
      ${SETTINGS_TABS.map(([key, label]) => button({
        label,
        variant: key === active ? "primary" : "secondary",
        attrs: `data-settings-tab="${escapeHtml(key)}" aria-pressed="${key === active ? "true" : "false"}"`
      })).join("")}
    </nav>
  `;
}

function renderPipeline(model = {}, appState = {}) {
  const selected = appState.pipeline || "competitor";
  const previewTabs = ["Overview", "Focus", "Insights", "Stats"];
  const overview = model.overview || {};
  return `
    <section class="settings-grid">
      <div class="settings-main rc-card">
        ${cardHeader("Pipeline", "Choose how RankedCoach talks to you.")}
        <div class="pipeline-grid">
          ${PIPELINES.map(item => `
            <label class="pipeline-card ${item.id === selected ? "is-active" : ""} ${item.tier !== "Free" ? "is-locked plan-pro" : ""}">
              <input type="radio" name="pipeline" value="${escapeHtml(item.id)}" data-pipeline-choice ${item.id === selected ? "checked" : ""}>
              <span class="pill ${item.tier === "Free" ? "good" : "warn"}">${escapeHtml(item.tier)}</span>
              <strong>${escapeHtml(item.label)}</strong>
              <p>${escapeHtml(item.text)}</p>
            </label>
          `).join("")}
        </div>
      </div>
      <aside class="settings-preview rc-card">
        ${cardHeader("Live Preview", `${escapeHtml(model.riotId || "No account")} · ${escapeHtml(selected)}`)}
        <div class="local-tabs">${previewTabs.map((tab, index) => `<button class="nav-tab ${index === 0 ? "is-active" : ""}" type="button">${escapeHtml(tab)}</button>`).join("")}</div>
        <div class="preview-panel">
          <strong>${percent(overview.winRate)} winrate · ${whole(overview.matchesPlayed || 0)} matches</strong>
          <p class="muted">This panel previews real current values under the selected pipeline. Locked presets show the preview without applying gated controls.</p>
        </div>
      </aside>
      <section class="settings-builder rc-card">
        ${cardHeader("Custom Pipeline Builder", "Five-step beta shell.")}
        <ol class="builder-steps">
          <li>Drag-rank focus areas</li>
          <li>Choose priorities</li>
          <li>Pick data depth</li>
          <li>Select delivery style</li>
          <li>Name and save</li>
        </ol>
        <div class="locked-row">
          <span class="pill warn">Crown · locked preview</span>
          <p>Locked controls open the plan modal without erasing your draft.</p>
        </div>
      </section>
    </section>
  `;
}

function palettePreview(appState = {}) {
  const selected = appState.palette || "obsidian";
  return `
    <div class="palette-grid">
      ${PALETTES.map(([id, label, primary, secondary]) => `
        <button class="palette-card ${id === selected ? "is-active" : ""}" type="button" data-palette-choice="${escapeHtml(id)}" style="--swatch-a:${primary};--swatch-b:${secondary}">
          <span></span>
          <strong>${escapeHtml(label)}</strong>
        </button>
      `).join("")}
    </div>
  `;
}

function renderVisual(model = {}, appState = {}) {
  const density = appState.density || "balanced";
  return `
    <section class="visual-layout">
      <nav class="visual-sticky" aria-label="Visual customization sections">
        ${["Theme & Colors", "Icons", "Graphics & Avatars", "Typography", "Layout Density", "Motion & Effects", "Backgrounds", "Preview & Apply"].map((item, index) => `<a href="#visual-${index}">${escapeHtml(item)}</a>`).join("")}
      </nav>
      <div class="visual-panels">
        <section id="visual-0" class="settings-panel rc-card">${cardHeader("Theme & Colors", "Six semantic-safe palettes.")}${palettePreview(appState)}</section>
        <section id="visual-1" class="settings-panel rc-card">${cardHeader("Icons", "Icon pack switcher.")}<div class="choice-row">${["Minimal", "Tactical", "Outline", "Neon", "Valorant-inspired"].map(item => button({ label: item, variant: "secondary", attrs: `data-icon-pack="${escapeHtml(item)}"` })).join("")}</div></section>
        <section id="visual-2" class="settings-panel rc-card">${cardHeader("Graphics & Avatars", "Agent, rank, UI graphics, and avatar controls.")}<div class="choice-row">${["Agent Style", "Rank Style", "UI Graphics", "Avatars"].map(item => `<span class="pill">${escapeHtml(item)}</span>`).join("")}</div></section>
        <section id="visual-3" class="settings-panel rc-card">${cardHeader("Typography", "Saved globally only when applied.")}<div class="field-grid two"><label>Text scale<select data-visual-field="textScale"><option>Default</option><option>Large</option><option>Compact</option></select></label><label>Stat number style<select data-visual-field="statStyle"><option>Bold</option><option>Condensed</option><option>Monospace</option></select></label></div></section>
        <section id="visual-4" class="settings-panel rc-card">${cardHeader("Layout Density", "Always free.")}<div class="choice-row">${["comfortable", "balanced", "compact"].map(item => button({ label: item, variant: density === item ? "primary" : "secondary", attrs: `data-density-choice="${escapeHtml(item)}"` })).join("")}</div></section>
        <section id="visual-5" class="settings-panel rc-card">${cardHeader("Motion & Effects", "Accessibility remains free.")}<label class="toggle-row"><input type="checkbox" data-motion-reduce ${appState.reduceMotion ? "checked" : ""}> Reduce Motion</label><label class="toggle-row"><input type="checkbox" data-motion-effects ${appState.motionEffects === false ? "" : "checked"}> Motion Effects</label></section>
        <section id="visual-6" class="settings-panel rc-card">${cardHeader("Backgrounds", "Dark Gradient, Subtle Pattern, Matrix Grid, or Custom Image.")}<div class="choice-row">${["Dark Gradient", "Subtle Pattern", "Matrix Grid", "Custom Image"].map(item => button({ label: item, variant: "secondary", attrs: `data-background-choice="${escapeHtml(item)}"` })).join("")}</div></section>
        <section id="visual-7" class="settings-panel rc-card">${cardHeader("Preview & Apply", "Today's Focus / RR / Compass mini-preview.")}<div class="preview-strip">${card({ eyebrow: "Focus", title: "Cleaner next cue", body: "<p>Preview of coaching copy.</p>" })}${card({ eyebrow: "RR", title: `${whole(model.overview?.rrTotal || 0)} RR`, body: "<p>Semantic colors remain fixed.</p>" })}${card({ eyebrow: "Compass", title: `${whole(model.pillars?.[0]?.score || 0)}/100`, body: "<p>Token-driven preview.</p>" })}</div></section>
      </div>
      <div class="settings-savebar">
        <span class="pill warn">Unsaved beta preview</span>
        ${button({ label: "Reset", variant: "tertiary", action: "visual-reset" })}
        ${button({ label: "Discard", variant: "secondary", action: "visual-discard" })}
        ${button({ label: "Save Visuals", variant: "primary", action: "visual-save" })}
      </div>
    </section>
  `;
}

function renderPlaceholder(tab = "profile") {
  const labels = {
    profile: "Profile settings",
    notifications: "Notification settings",
    integrations: "Integration settings",
    billing: "Billing and plans"
  };
  return stateBlock({
    kind: "locked",
    title: labels[tab] || "Settings",
    message: "This destination is routed and reachable in beta. The full control set is intentionally scoped after Pipeline and Visual."
  });
}

export function renderSettings(root, model, appState = {}) {
  if (!root) return;
  const tab = appState.settingsTab || "pipeline";
  const body = tab === "visual" ? renderVisual(model || {}, appState)
    : tab === "pipeline" ? renderPipeline(model || {}, appState)
      : renderPlaceholder(tab);
  root.innerHTML = `
    <div class="settings-layout">
      ${renderSettingsNav(tab)}
      ${body}
    </div>
  `;
}

export function openPlanModal(modalRoot, tier = "Pro") {
  if (!modalRoot) return;
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="planModalTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">Cosmetic entitlement</p>
            <h2 id="planModalTitle">${escapeHtml(tier)} preview</h2>
          </div>
          ${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}
        </header>
        <div class="modal-body">
          <p>Premium controls preview without applying locked values. Server/config verification still owns real access control.</p>
          <div class="pricing-grid">
            ${["Free", "Pro", "Elite"].map(plan => card({ eyebrow: plan === tier ? "Selected" : "Plan", title: plan, body: "<p>Feature comparison placeholder wired for beta pricing table.</p>", variant: "pricing" })).join("")}
          </div>
        </div>
      </section>
    </div>
  `;
}
