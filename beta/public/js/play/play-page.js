import { button, card, cardHeader, icon, stateBlock } from "../components/ui.js";
import { getPriorityInsight } from "../model/insights.js";
import { escapeHtml, finite, formatDate, normalizeKey, percent, ratio, whole } from "../model/utils.js";
import { getAgentAsset, getMapAsset } from "../model/player-model.js";

export const LOADOUT_DEFAULTS = Object.freeze({
  state: "idle",
  role: "Any Role",
  agent: "Any Agent",
  map: "Any Map",
  spinStep: "",
  assignment: null,
  startedAt: ""
});

const ROLE_ORDER = ["Controller", "Duelist", "Initiator", "Sentinel"];
const PILLAR_TO_CATEGORY = {
  aim: "Mechanics",
  "game-sense": "Game Sense",
  teamwork: "Communication",
  discipline: "Discipline"
};

function maps() {
  return Array.isArray(globalThis.RankedCoachGamesenseMaps) ? globalThis.RankedCoachGamesenseMaps : [];
}

function agents() {
  return Array.isArray(globalThis.RankedCoachGamesenseReference?.agents) ? globalThis.RankedCoachGamesenseReference.agents : [];
}

function normalizeLoadout(loadout = {}) {
  return { ...LOADOUT_DEFAULTS, ...(loadout || {}) };
}

function roleClass(role = "") {
  return `role-${normalizeKey(role || "unknown")}`;
}

function roleGlyph(role = "") {
  const key = normalizeKey(role);
  if (key === "controller") return "▲";
  if (key === "duelist") return "✕";
  if (key === "initiator") return "◒";
  if (key === "sentinel") return "▽";
  return "◆";
}

function optionList(values = [], selected = "") {
  return values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
}

function getMapByLabel(label = "") {
  const key = normalizeKey(label);
  return maps().find(map => normalizeKey(map.label || map.id) === key) || null;
}

function getAgentByLabel(label = "") {
  const key = normalizeKey(label);
  return agents().find(agent => normalizeKey(agent.label || agent.name || agent.id) === key) || null;
}

function firstUsefulMap(model = {}) {
  const fromModel = (model.maps || []).find(item => item.map)?.map;
  const fromPool = maps().find(map => map.inCompetitivePool !== false)?.label;
  return fromModel || fromPool || maps()[0]?.label || "Any Map";
}

function firstUsefulRole(model = {}, mapLabel = "") {
  const map = getMapByLabel(mapLabel);
  const ranked = (map?.rolePickRates || [])
    .slice()
    .sort((a, b) => Number(b.mapRate || 0) - Number(a.mapRate || 0));
  return ranked[0]?.role || model.roles?.[0]?.role || ROLE_ORDER[0];
}

function firstUsefulAgent(role = "", mapLabel = "", model = {}) {
  const map = getMapByLabel(mapLabel);
  const ranked = (map?.rolePickRates || [])
    .filter(item => !role || item.role === role)
    .sort((a, b) => Number(b.mapRate || 0) - Number(a.mapRate || 0));
  const fromMap = ranked[0]?.agent;
  const fromModel = (model.agents || []).find(item => !role || item.role === role)?.agent;
  const fromReference = agents().find(agent => !role || agent.role === role)?.label;
  return fromMap || fromModel || fromReference || "Any Agent";
}

function focusFromModel(model = {}) {
  const insight = getPriorityInsight(model);
  const weakest = (model.pillars || []).slice().sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0];
  return {
    id: "model-priority-focus",
    category: PILLAR_TO_CATEGORY[weakest?.key] || insight.focus || "Game Sense",
    title: insight.title || `${weakest?.label || "Focus"} check`,
    evidence: insight.preview || weakest?.driver || "Sync an account to generate a stronger read.",
    why: insight.why || "This is the clearest current read from your available match data.",
    how: insight.action || "Pick one repeatable behavior and compare the next match import against it.",
    priority: weakest?.score < 50 ? "High" : weakest?.score < 70 ? "Medium" : "Low",
    source: weakest?.reference || "current window",
    behaviors: [
      insight.action || "Take one cleaner first decision before you chase the next duel.",
      "Say the cue out loud before the round starts.",
      "Review the next imported match against this one focus only."
    ],
    related: [weakest?.label, insight.focus, weakest?.statKey].filter(Boolean)
  };
}

export function getFocusQueue(appState = {}, model = {}) {
  const queue = Array.isArray(appState.focusQueue) ? appState.focusQueue : [];
  if (queue.length) return queue.slice(0, 5);
  const base = focusFromModel(model);
  const pillars = (model.pillars || []).slice().sort((a, b) => Number(a.score || 0) - Number(b.score || 0));
  const generated = pillars.slice(1, 4).map((pillar, index) => ({
    id: `pillar-${pillar.key}`,
    category: PILLAR_TO_CATEGORY[pillar.key] || pillar.label,
    title: `${pillar.label} cleanup`,
    evidence: pillar.driver || `${pillar.label} is tracking at ${whole(pillar.score)}/100.`,
    why: "The queue keeps short-term practice visible before you queue.",
    how: `Choose one ${pillar.label.toLowerCase()} habit and repeat it for the next block.`,
    priority: index === 0 ? "Medium" : "Low",
    source: pillar.reference || "current window",
    behaviors: [pillar.driver || "Keep this tied to the next match import."],
    related: [pillar.label, pillar.statKey].filter(Boolean)
  }));
  return [base, ...generated].slice(0, 4);
}

export function buildLoadoutAssignment(model = {}, appState = {}) {
  const loadout = normalizeLoadout(appState.loadout);
  const map = loadout.map && loadout.map !== "Any Map" ? loadout.map : firstUsefulMap(model);
  const role = loadout.role && loadout.role !== "Any Role" ? loadout.role : firstUsefulRole(model, map);
  const agent = loadout.agent && loadout.agent !== "Any Agent" ? loadout.agent : firstUsefulAgent(role, map, model);
  const queue = getFocusQueue(appState, model);
  const focus = queue[0] || focusFromModel(model);
  const mapData = getMapByLabel(map);
  const roleNote = (mapData?.roleNotes?.[role] || [])[0]?.text;
  const mapReminder = roleNote || mapData?.teamplayTips?.[0]?.text || mapData?.siteTips?.[0]?.text || "Keep the plan simple: win space, trade cleanly, and reset before the next fight.";
  return {
    map,
    role,
    agent,
    focusTitle: focus.title,
    focusCategory: focus.category,
    focusText: focus.how || focus.evidence,
    mapReminder,
    generatedAt: new Date().toISOString()
  };
}

function renderSelect(label, key, selected, options, leadingIcon = "loadout") {
  return `
    <label class="loadout-select">
      <span>${icon(leadingIcon)} ${escapeHtml(label)}</span>
      <select data-loadout-select="${escapeHtml(key)}">
        ${optionList(options, selected)}
      </select>
    </label>
  `;
}

function renderLoadoutControls(model = {}, appState = {}) {
  const loadout = normalizeLoadout(appState.loadout);
  const roleOptions = ["Any Role", ...ROLE_ORDER];
  const agentOptions = ["Any Agent", ...agents().map(agent => agent.label || agent.name || agent.id).filter(Boolean).sort()];
  const mapOptions = ["Any Map", ...maps().map(map => map.label || map.id).filter(Boolean).sort()];
  return `
    <div class="loadout-select-row">
      ${renderSelect("Role", "role", loadout.role, roleOptions, "focus-queue")}
      ${renderSelect("Agent", "agent", loadout.agent, agentOptions, "review")}
      ${renderSelect("Map", "map", loadout.map, mapOptions, "library")}
    </div>
  `;
}

function renderGeneratedPanel(loadout = {}, compact = false) {
  const assignment = loadout.assignment;
  const spinning = loadout.state === "spinning";
  const step = loadout.spinStep || "";
  if (!assignment && !spinning) {
    return `
      <div class="loadout-idle-panel">
        ${stateBlock({ kind: "empty", title: "Ready to build your next round plan.", message: "Pick any known queue details, then spin for a map-aware role, agent, and focus." })}
      </div>
    `;
  }
  const values = assignment || { role: "Rolling…", agent: "Rolling…", map: "Rolling…", focusText: "Resolving the cleanest short-term focus.", mapReminder: "Map reminder appears after the spin." };
  const agentImage = assignment ? getAgentAsset(values.agent) : "";
  const mapImage = assignment ? getMapAsset(values.map) : "";
  const col = (kind, value, label, image = "") => `
    <div class="loadout-result-col ${spinning && step === kind ? "is-resolving" : ""}">
      <div class="loadout-result-art ${kind === "role" ? roleClass(value) : ""}">
        ${kind === "role" ? `<span>${roleGlyph(value)}</span>` : image ? `<img src="${escapeHtml(image)}" alt="">` : icon(kind === "agent" ? "review" : "library", { size: 48 })}
      </div>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(label)}</small>
    </div>
  `;
  return `
    <div class="loadout-generated-panel ${spinning ? "is-spinning" : ""} ${compact ? "is-compact" : ""}">
      <div class="loadout-result-head">
        <span>Generated coaching assignment</span>
        ${button({ label: "Spin Again", variant: "tertiary", action: "spin-loadout", disabled: spinning })}
      </div>
      <div class="loadout-result-values" aria-live="polite">
        ${col("role", values.role, "Role")}
        <span class="loadout-chevron">${icon("chevron")}</span>
        ${col("agent", values.agent, "Agent", agentImage)}
        <span class="loadout-chevron">${icon("chevron")}</span>
        ${col("map", values.map, "Map", mapImage)}
      </div>
      <div class="loadout-generated-copy">
        <div>
          <p class="rc-eyebrow">Your Focus</p>
          <strong>${escapeHtml(values.focusTitle || values.focusCategory || "Short-term focus")}</strong>
          <p>${escapeHtml(values.focusText || "Keep this tied to the next match import.")}</p>
        </div>
        <div>
          <p class="rc-eyebrow">Map Reminder</p>
          <p>${escapeHtml(values.mapReminder || "Win space with a teammate and trade the first real contact.")}</p>
        </div>
      </div>
    </div>
  `;
}

function renderLoadoutCard(model = {}, appState = {}, { full = false } = {}) {
  const loadout = normalizeLoadout(appState.loadout);
  const spinning = loadout.state === "spinning";
  const started = loadout.state === "started";
  return card({
    eyebrow: "Loadout",
    title: full ? "Generate your next ranked assignment." : "Your next match setup.",
    className: "play-card loadout-card",
    body: `
      ${renderLoadoutControls(model, appState)}
      ${renderGeneratedPanel(loadout, !full)}
    `,
    footer: `
      ${button({ label: loadout.assignment ? "View Details" : "Spin Loadout", variant: loadout.assignment ? "secondary" : "primary", action: loadout.assignment ? "open-focus-detail" : "spin-loadout", disabled: spinning })}
      ${button({ label: started ? "Open In-Game" : "Start Match", variant: "primary", action: started ? "open-in-game" : "start-match", disabled: !loadout.assignment || spinning })}
    `
  });
}

function renderTodayFocus(model = {}, appState = {}) {
  const focus = getFocusQueue(appState, model)[0] || focusFromModel(model);
  return card({
    eyebrow: "Today’s Focus",
    title: focus.title,
    className: "play-card today-focus-card",
    body: `
      <p>${escapeHtml(focus.evidence || "Your active focus will appear here after sync.")}</p>
      <div class="focus-art ${roleClass(focus.category)}">${icon("focus-queue", { size: 72 })}</div>
    `,
    footer: `
      ${button({ label: "View Focus Details", variant: "secondary", action: "open-focus-detail" })}
      ${button({ label: "Change Focus", variant: "tertiary", action: "open-focus-chooser" })}
    `
  });
}

function sparkline(pillar = {}) {
  const base = Math.max(18, Math.min(82, Number(pillar.score || 0)));
  const delta = Number(pillar.delta || 0);
  const start = Math.max(8, Math.min(88, base - delta));
  const mid = Math.max(8, Math.min(88, (base + start) / 2 + (delta >= 0 ? 8 : -8)));
  return `<svg class="mini-spark" viewBox="0 0 100 36" aria-hidden="true"><polyline points="4,${36 - start * .32} 50,${36 - mid * .32} 96,${36 - base * .32}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" /></svg>`;
}

function renderImprovementTimeline(model = {}) {
  const pillars = model.pillars?.length ? model.pillars : focusFromModel(model).related.map(label => ({ label, score: 0, trend: "Pending" }));
  const tiles = pillars.slice(0, 4).map(pillar => `
    <button class="timeline-mini ${Number(pillar.delta || 0) < -3 ? "is-down" : Number(pillar.delta || 0) > 3 ? "is-up" : ""}" type="button" data-review-tab="timeline" data-review-category="${escapeHtml(pillar.key || pillar.label)}">
      <span>${escapeHtml(pillar.label)}</span>
      <strong>${escapeHtml(pillar.trend || "Stable")}</strong>
      <small>${whole(pillar.score)}/100 · ${escapeHtml(pillar.reference || "current window")}</small>
      ${sparkline(pillar)}
    </button>
  `).join("");
  return card({
    eyebrow: "Improvement Timeline",
    title: "What is moving right now.",
    className: "play-card improvement-card",
    body: `<div class="timeline-mini-grid">${tiles}</div>`,
    footer: button({ label: "View Timeline", variant: "tertiary", attrs: `data-review-tab="timeline"` })
  });
}

function renderCompassMini(model = {}) {
  const pillars = model.pillars || [];
  const scores = pillars.map(item => Number(item.score || 0));
  const avg = scores.length ? scores.reduce((sum, value) => sum + value, 0) / scores.length : 0;
  const legend = pillars.map(pillar => `
    <button class="compass-legend" type="button" data-review-tab="stats" data-review-category="${escapeHtml(pillar.key)}">
      <span>${escapeHtml(pillar.label)}</span>
      <strong>${whole(pillar.score)}/100</strong>
    </button>
  `).join("");
  return card({
    eyebrow: "Compass",
    title: `${whole(avg)}/100 overall`,
    className: "play-card compass-mini-card",
    body: `
      <div class="compass-mini-shape" style="--aim:${scores[0] || 0};--sense:${scores[1] || 0};--team:${scores[2] || 0};--disc:${scores[3] || 0};">
        <span>${whole(avg)}</span>
      </div>
      <div class="compass-mini-legend">${legend}</div>
    `
  });
}

function renderRRCard(model = {}) {
  const overview = model.overview || {};
  const rrTotal = Number(overview.rrTotal || 0);
  return card({
    eyebrow: "RR Card",
    title: `${whole(rrTotal)} RR in window`,
    className: "play-card rr-mini-card",
    body: `
      <div class="rr-actions" role="group" aria-label="Manual RR result controls">
        ${button({ label: "Win", variant: "secondary", action: "rr-manual-win", className: "semantic-win" })}
        ${button({ label: "Loss", variant: "secondary", action: "rr-manual-loss", className: "semantic-loss" })}
        ${button({ label: "Draw", variant: "secondary", action: "rr-manual-draw" })}
        ${button({ label: "Undo", variant: "tertiary", action: "rr-manual-undo" })}
      </div>
      <div class="impact-meter" aria-label="Current win rate">
        <span style="--fill:${Math.max(0, Math.min(100, Number(overview.winRate || 0)))}%"></span>
        <strong>${percent(overview.winRate)}</strong>
      </div>
    `,
    footer: button({ label: "View Full", variant: "tertiary", attrs: `data-review-tab="all-matches"` })
  });
}

function compactRrChart(model = {}) {
  const records = (model.records || []).slice().reverse();
  let total = 0;
  const points = records.map((record, index) => {
    total += Number(record.rank?.rrDelta || 0);
    return { x: records.length <= 1 ? 50 : (index / (records.length - 1)) * 100, y: 50 - Math.max(-40, Math.min(40, total)) };
  });
  return `
    <svg class="compact-line-chart" viewBox="0 0 100 82" preserveAspectRatio="none" role="img" aria-label="Compact RR trend">
      <line x1="0" x2="100" y1="50" y2="50" stroke="rgba(74,222,128,.55)" />
      <polyline points="${points.map(point => `${point.x},${point.y}`).join(" ")}" fill="none" stroke="var(--warning)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${points.map(point => `<circle cx="${point.x}" cy="${point.y}" r="2.4" fill="var(--warning)" />`).join("")}
    </svg>
  `;
}

function renderRRTrendMini(model = {}) {
  return card({
    eyebrow: "RR Trend",
    title: "Current window movement.",
    className: "play-card rr-trend-mini-card",
    body: `${compactRrChart(model)}<p class="muted">${whole(model.records?.length || 0)} imported matches. Missing RR remains flat until verified.</p>`,
    attrs: `data-review-tab="timeline"`
  });
}

function renderTopInsight(model = {}) {
  const insight = getPriorityInsight(model);
  return card({
    eyebrow: "Top Insight",
    title: insight.title,
    className: "play-card top-insight-card",
    body: `<p>${escapeHtml(insight.preview || insight.action || "")}</p><span class="pill ${escapeHtml(insight.tone || "warn")}">${escapeHtml(insight.focus || "Priority")}</span>`,
    footer: button({ label: "View Insight", variant: "secondary", action: "open-insight-detail" })
  });
}

export function renderPlayPage(root, model, appState = {}) {
  if (!root) return;
  root.innerHTML = `
    <div class="play-grid">
      <div class="play-area-focus">${renderTodayFocus(model || {}, appState)}</div>
      <div class="play-area-timeline">${renderImprovementTimeline(model || {})}</div>
      <div class="play-area-loadout">${renderLoadoutCard(model || {}, appState)}</div>
      <div class="play-area-compass">${renderCompassMini(model || {})}</div>
      <div class="play-area-rr">${renderRRCard(model || {})}</div>
      <div class="play-area-trend">${renderRRTrendMini(model || {})}</div>
      <div class="play-area-insight">${renderTopInsight(model || {})}</div>
    </div>
  `;
}

export function renderLoadoutPage(root, model, appState = {}) {
  if (!root) return;
  root.innerHTML = `
    <div class="route-shell">
      ${renderLoadoutCard(model || {}, appState, { full: true })}
      ${card({
        eyebrow: "How it rolls",
        title: "Map first, then role, then agent.",
        body: "<p>The beta generator weighs your selected map, high-rank map pick references, and your recent role comfort. It stays honest: if no map is selected, it starts from your most played/current competitive maps.</p>",
        className: "side-explain-card"
      })}
    </div>
  `;
}

function queueRow(item, index, total) {
  return `
    <article class="queue-row ${index === 0 ? "is-active" : ""}" draggable="true" data-focus-id="${escapeHtml(item.id)}">
      <strong class="queue-order">${index + 1}</strong>
      <span class="queue-icon ${roleClass(item.category)}">${icon("focus-queue")}</span>
      <div class="queue-main">
        <button class="queue-title" type="button" data-action="open-focus-detail" data-focus-id="${escapeHtml(item.id)}">${escapeHtml(item.title)}</button>
        <p>${escapeHtml(item.evidence || item.how || "")}</p>
      </div>
      <button class="pill priority-chip" type="button" data-action="toggle-focus-priority" data-focus-id="${escapeHtml(item.id)}">${escapeHtml(item.priority || "Medium")}</button>
      <div class="queue-actions">
        ${button({ label: "", variant: "icon", iconName: "grip", attrs: `aria-label="Drag focus ${index + 1}"` })}
        ${button({ label: "↑", variant: "icon", action: "queue-up", attrs: `data-focus-id="${escapeHtml(item.id)}" aria-label="Move focus up"`, disabled: index === 0 })}
        ${button({ label: "↓", variant: "icon", action: "queue-down", attrs: `data-focus-id="${escapeHtml(item.id)}" aria-label="Move focus down"`, disabled: index >= total - 1 })}
        ${button({ label: "Remove", variant: "tertiary", action: "queue-remove", attrs: `data-focus-id="${escapeHtml(item.id)}"` })}
      </div>
    </article>
  `;
}

export function renderFocusQueuePage(root, model, appState = {}) {
  if (!root) return;
  const queue = getFocusQueue(appState, model || {});
  root.innerHTML = `
    <div class="focus-queue-layout">
      <section class="rc-card rc-card--dashboard focus-queue-card">
        ${cardHeader("Focus Queue", "Short-term practice backlog.", button({ label: "Add Focus", variant: "primary", action: "open-add-focus" }))}
        <div class="queue-list">${queue.map((item, index) => queueRow(item, index, queue.length)).join("")}</div>
        <footer class="rc-card__foot">
          ${button({ label: "Clear Queue", variant: "danger", action: "queue-clear" })}
        </footer>
      </section>
      ${card({
        eyebrow: "Graduation check",
        title: "This improved 14% over 6 matches. Move to next focus?",
        body: "<p>This banner appears when the model sees a measurable enough improvement window. For now it is wired as a beta-visible completion pattern.</p>",
        footer: `${button({ label: "Keep", variant: "secondary", action: "queue-keep" })}${button({ label: "Graduate", variant: "primary", action: "queue-graduate" })}`,
        className: "completion-card"
      })}
    </div>
  `;
}

function logValue(appState = {}, key = "", fallback = "") {
  return escapeHtml(appState.logDraft?.[key] ?? fallback);
}

export function renderLogMatchPage(root, model, appState = {}) {
  if (!root) return;
  const assignment = normalizeLoadout(appState.loadout).assignment || {};
  const activeFocus = getFocusQueue(appState, model || {})[0] || focusFromModel(model || {});
  const selectedResult = appState.logDraft?.result || "";
  const resultButton = value => button({
    label: value,
    variant: selectedResult === value.toLowerCase() ? "primary" : "secondary",
    action: "log-result",
    attrs: `data-log-result="${value.toLowerCase()}"`
  });
  root.innerHTML = `
    <form class="log-grid" data-log-form>
      <section class="rc-card rc-card--dashboard log-result">
        ${cardHeader("Log Match", "Match result")}
        <div class="choice-row">${resultButton("Win")}${resultButton("Loss")}${resultButton("Draw")}${button({ label: "Undo", variant: "tertiary", action: "log-result-undo" })}</div>
      </section>
      <section class="rc-card rc-card--dashboard log-rr">
        ${cardHeader("RR Change", "Before → after")}
        <div class="field-grid two">
          <label>RR Before<input data-log-field="rrBefore" inputmode="numeric" value="${logValue(appState, "rrBefore")}"></label>
          <label>RR After<input data-log-field="rrAfter" inputmode="numeric" value="${logValue(appState, "rrAfter")}"></label>
        </div>
      </section>
      <section class="rc-card rc-card--dashboard log-details">
        ${cardHeader("Match Details", "Known session info")}
        <div class="field-grid two">
          <label>Mode<select data-log-field="mode"><option value="Competitive">Competitive</option><option value="Premier">Premier</option><option value="Unknown">Unknown</option></select></label>
          <label>Map<input data-log-field="map" value="${logValue(appState, "map", assignment.map || "")}"></label>
          <label>Agent<input data-log-field="agent" value="${logValue(appState, "agent", assignment.agent || "")}"></label>
          <label>Role<input data-log-field="role" value="${logValue(appState, "role", assignment.role || "")}"></label>
        </div>
      </section>
      <section class="rc-card rc-card--dashboard log-reflect">
        ${cardHeader("Reflection", "Perception check")}
        <div class="field-grid two">
          <label>Feeling<select data-log-field="feeling"><option value="">Select</option><option>Locked In</option><option>Stable</option><option>Tilted</option><option>Foggy</option></select></label>
          <label>Self rating<input data-log-field="selfRating" inputmode="numeric" value="${logValue(appState, "selfRating")}"></label>
        </div>
        <label>What went well?<textarea data-log-field="wentWell" maxlength="500">${logValue(appState, "wentWell")}</textarea></label>
        <label>What could you improve?<textarea data-log-field="improve" maxlength="500">${logValue(appState, "improve")}</textarea></label>
      </section>
      <section class="rc-card rc-card--dashboard log-focus">
        ${cardHeader("Focus Review", activeFocus.title)}
        <p>${escapeHtml(activeFocus.how || activeFocus.evidence || "")}</p>
        <label>Focus adherence<select data-log-field="adherence"><option value="">Optional</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select></label>
        <label class="toggle-row"><input type="checkbox" data-log-field="saveReflection" ${appState.logDraft?.saveReflection === false ? "" : "checked"}> Save to Reflection Matches</label>
        <div class="save-strip">
          ${button({ label: "Save Match", variant: "primary", action: "save-log-match" })}
        </div>
      </section>
    </form>
  `;
}

export function renderInGamePage(root, model, appState = {}) {
  if (!root) return;
  const loadout = normalizeLoadout(appState.loadout);
  const assignment = loadout.assignment || buildLoadoutAssignment(model || {}, appState);
  root.innerHTML = `
    <div class="in-game-layout">
      <section class="rc-card rc-card--dashboard in-game-head">
        ${cardHeader("In-Game", `${assignment.map || "Map"} · ${assignment.agent || "Agent"} · ${assignment.role || "Role"}`, button({ label: "End Match / Log Result", variant: "primary", action: "end-match-log" }))}
      </section>
      <section class="rc-card rc-card--dashboard one-job-card">
        ${cardHeader("One Job", assignment.focusTitle || "Play the active focus.")}
        <p>${escapeHtml(assignment.focusText || "Keep your next round tied to the active focus.")}</p>
        <div class="choice-row">
          ${button({ label: "Remembered", variant: "secondary", action: "mark-cue-remembered" })}
          ${button({ label: "Hide Until Round End", variant: "tertiary", action: "hide-cue" })}
          ${button({ label: "Open Focus Details", variant: "secondary", action: "open-focus-detail" })}
        </div>
      </section>
      <aside class="rc-card rc-card--dashboard quick-reference-card">
        ${cardHeader("Quick Reference", "Relevant to this loadout")}
        <div class="quick-list">
          <button type="button" data-page-jump="learn" data-learn-query="${escapeHtml(assignment.map || "")}">Map notes for ${escapeHtml(assignment.map || "selected map")}</button>
          <button type="button" data-page-jump="learn" data-learn-query="${escapeHtml(assignment.agent || "")}">Agent tips for ${escapeHtml(assignment.agent || "selected agent")}</button>
          <button type="button" data-page-jump="library" data-library-view="lineups">Lineups</button>
          <button type="button" data-page-jump="learn" data-learn-query="economy">Economy</button>
        </div>
      </aside>
    </div>
  `;
}

export function openFocusDetailsModal(modalRoot, model, appState = {}, focusId = "") {
  if (!modalRoot) return;
  const focus = getFocusQueue(appState, model || {}).find(item => item.id === focusId) || getFocusQueue(appState, model || {})[0] || focusFromModel(model || {});
  const behaviors = (focus.behaviors || []).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  const related = (focus.related || []).map(item => `<button class="pill" type="button" data-page-jump="learn" data-learn-query="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card focus-modal" role="dialog" aria-modal="true" aria-labelledby="focusModalTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">${escapeHtml(focus.category || "Focus")} · ${escapeHtml(focus.priority || "Medium Priority")}</p>
            <h2 id="focusModalTitle">${escapeHtml(focus.title)}</h2>
          </div>
          ${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}
        </header>
        <div class="modal-body">
          <section class="detail-block"><h3>Why this matters</h3><p>${escapeHtml(focus.why || focus.evidence || "")}</p></section>
          <section class="detail-block"><h3>How to fix it</h3><p>${escapeHtml(focus.how || "Keep this simple for the next queue block.")}</p></section>
          <section class="detail-block"><h3>Evidence</h3><p>${escapeHtml(focus.evidence || focus.source || "Current beta model read.")}</p></section>
          <section class="detail-block"><h3>Behaviors</h3><ul>${behaviors || "<li>Pick one repeatable habit and check it after the next import.</li>"}</ul></section>
          <section class="detail-block"><h3>Related concepts</h3><div class="recent-list">${related || "<span class=\"muted\">No related concepts yet.</span>"}</div></section>
        </div>
        <footer class="modal-actions">
          ${button({ label: "Add / Keep in Focus Queue", variant: "secondary", action: "keep-focus", attrs: `data-focus-id="${escapeHtml(focus.id)}"` })}
          ${button({ label: "Use as Active Focus", variant: "primary", action: "use-active-focus", attrs: `data-focus-id="${escapeHtml(focus.id)}"` })}
        </footer>
      </section>
    </div>
  `;
}

export function openAddFocusModal(modalRoot, model, appState = {}) {
  if (!modalRoot) return;
  const recommended = getFocusQueue(appState, model || {}).map(item => `
    <button class="focus-suggestion" type="button" data-action="queue-add-focus" data-focus-title="${escapeHtml(item.title)}" data-focus-category="${escapeHtml(item.category)}">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.category)} · ${escapeHtml(item.priority || "Medium")}</span>
      <p>${escapeHtml(item.evidence || item.how || "")}</p>
    </button>
  `).join("");
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="addFocusTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">Focus Queue</p>
            <h2 id="addFocusTitle">Add a focus.</h2>
          </div>
          ${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}
        </header>
        <div class="modal-body">
          <div class="local-tabs" role="tablist" aria-label="Add focus sources">
            <button class="nav-tab is-active" type="button">Recommended</button>
            <button class="nav-tab" type="button">Insights</button>
            <button class="nav-tab" type="button">Learn Concepts</button>
            <button class="nav-tab" type="button">Custom Focus</button>
          </div>
          <div class="focus-suggestion-grid">${recommended}</div>
          <div class="field-grid two">
            <label>Custom title<input data-custom-focus-field="title" placeholder="Example: Cleaner opening duels"></label>
            <label>Category<input data-custom-focus-field="category" placeholder="Mechanics"></label>
          </div>
          ${button({ label: "Save Custom Focus", variant: "primary", action: "queue-save-custom" })}
        </div>
      </section>
    </div>
  `;
}

export function openLogSavedModal(modalRoot, reflectionId = "") {
  if (!modalRoot) return;
  modalRoot.innerHTML = `
    <div class="modal-backdrop" data-modal-close>
      <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="logSavedTitle">
        <header class="modal-head">
          <div>
            <p class="eyebrow">Saved</p>
            <h2 id="logSavedTitle">Match reflection saved.</h2>
          </div>
          ${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}
        </header>
        <div class="modal-body">
          <p>Choose where you want to go next. The saved match is available in All Matches${reflectionId ? " and Reflection Matches" : ""}.</p>
          <div class="choice-row">
            ${button({ label: "Back to Play", variant: "secondary", attrs: `data-page-jump="play"` })}
            ${button({ label: "View Match", variant: "secondary", attrs: `data-review-tab="all-matches"` })}
            ${reflectionId ? button({ label: "View Reflection", variant: "primary", attrs: `data-review-tab="reflections"` }) : ""}
          </div>
        </div>
      </section>
    </div>
  `;
}

export function createReflectionFromDraft(appState = {}) {
  const draft = appState.logDraft || {};
  const assignment = normalizeLoadout(appState.loadout).assignment || {};
  const now = new Date().toISOString();
  return {
    id: `reflection-${Date.now()}`,
    createdAt: now,
    playedAt: now,
    result: draft.result || "unknown",
    rrDelta: finite(Number(draft.rrAfter) - Number(draft.rrBefore)) ? Number(draft.rrAfter) - Number(draft.rrBefore) : null,
    map: draft.map || assignment.map || "Unknown",
    agent: draft.agent || assignment.agent || "Unknown",
    role: draft.role || assignment.role || "Unknown",
    focus: assignment.focusTitle || draft.focus || "No active focus",
    feeling: draft.feeling || "",
    rating: draft.selfRating || "",
    wentWell: draft.wentWell || "",
    improve: draft.improve || "",
    saveReflection: draft.saveReflection !== false
  };
}
