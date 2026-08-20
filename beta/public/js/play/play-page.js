import { button, card, cardHeader, confidencePill, icon, impactPill, pillarIcon, statIcon } from "../components/ui.js";
import { getPriorityInsight } from "../model/insights.js";
import { clamp, escapeHtml, finite, normalizeKey, percent, ratio, whole } from "../model/utils.js";
import { getAgentPortraitAsset } from "../model/player-model.js";

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
const PILLARS = [
  { key: "mechanics", label: "Aim / Mechanics", short: "Aim", cue: "Win the first honest fight" },
  { key: "game-sense", label: "Game Sense", short: "Game Sense", cue: "Read the map before you rotate" },
  { key: "teamwork", label: "Teamwork", short: "Teamwork", cue: "Trade the next contact" },
  { key: "discipline", label: "Discipline", short: "Discipline", cue: "Keep the round clean after first blood" },
  { key: "mental", label: "Mental", short: "Mental", cue: "Reset before the next decision" }
];

const RANK_ICON_FILES = Object.freeze({
  iron1: "iron_1_rank.png",
  iron2: "iron_2_rank.png",
  iron3: "iron_3_rank.png",
  bronze1: "bronze_1_rank.png",
  bronze2: "bronze_2_rank.png",
  bronze3: "bronze_3_rank.png",
  silver1: "silver_1_rank.png",
  silver2: "silver_2_rank.png",
  silver3: "silver_3_rank.png",
  gold1: "gold_1_rank.png",
  gold2: "gold_2_rank.png",
  gold3: "gold_3_rank.png",
  platinum1: "platinum_1_rank.png",
  platinum2: "platinum_2_rank.png",
  platinum3: "platinum_3_rank.png",
  diamond1: "diamond_1_rank.png",
  diamond2: "diamond_2_rank.png",
  diamond3: "diamond_3_rank.png",
  ascendant1: "ascendant_1_rank.png",
  ascendant2: "ascendant_2_rank.png",
  ascendant3: "ascendant_3_rank.png",
  immortal1: "immortal_1_rank.png",
  immortal2: "immortal_2_rank.png",
  immortal3: "immortal_3_rank.png",
  radiant: "radiant_rank.png",
  radiantplus: "radiant_rank.png"
});

const ROLE_ICON_FILES = Object.freeze({
  controller: "role_controller.png",
  duelist: "duelist_role.png",
  initiator: "initiator_role.png",
  sentinel: "sentinel_role.png"
});

const RANK_ORDER = [
  "iron1", "iron2", "iron3",
  "bronze1", "bronze2", "bronze3",
  "silver1", "silver2", "silver3",
  "gold1", "gold2", "gold3",
  "platinum1", "platinum2", "platinum3",
  "diamond1", "diamond2", "diamond3",
  "ascendant1", "ascendant2", "ascendant3",
  "immortal1", "immortal2", "immortal3",
  "radiant"
];

function maps() {
  return Array.isArray(globalThis.RankedCoachGamesenseMaps) ? globalThis.RankedCoachGamesenseMaps : [];
}

function agents() {
  return Array.isArray(globalThis.RankedCoachGamesenseReference?.agents) ? globalThis.RankedCoachGamesenseReference.agents : [];
}

function normalizeLoadout(loadout = {}) {
  return { ...LOADOUT_DEFAULTS, ...(loadout || {}) };
}

function localDayKey(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function dayOrdinal(key = localDayKey()) {
  const [year, month, day] = key.split("-").map(Number);
  return Math.floor(Date.UTC(year || 2026, (month || 1) - 1, day || 1) / 86400000);
}

function roleClass(role = "") {
  return `role-${normalizeKey(role || "unknown")}`;
}

function roleIcon(role = "", size = 48) {
  const key = normalizeKey(role);
  if (key === "controller") return icon("role-controller", { size });
  if (key === "duelist") return icon("role-duelist", { size });
  if (key === "initiator") return icon("role-initiator", { size });
  if (key === "sentinel") return icon("role-sentinel", { size });
  return icon("focus-queue", { size });
}

function getRoleIconUrl(role = "") {
  const file = ROLE_ICON_FILES[normalizeKey(role)];
  return file ? `https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/${file}` : "";
}

function roleIconAsset(role = "", size = 28) {
  const safeRole = escapeHtml(role || "Role");
  const key = normalizeKey(role);
  const url = getRoleIconUrl(role);
  if (!url) return `<span class="role-icon-asset role-${escapeHtml(key || "unknown")}">${roleIcon(role, size)}</span>`;
  return `
    <span class="role-icon-asset role-${escapeHtml(key || "unknown")}" style="--role-size:${Number(size) || 28}px" title="${safeRole}">
      <img src="${escapeHtml(url)}" alt="${safeRole} role" loading="lazy" onerror="this.closest('.role-icon-asset')?.classList.add('is-fallback');this.remove();">
      <span class="role-icon-fallback">${roleIcon(role, size)}</span>
    </span>
  `;
}

function hasMatchData(model = {}) {
  return Array.isArray(model.records) && model.records.length > 0;
}

function emptyFocus() {
  return {
    id: "daily-empty",
    category: "Setup",
    title: "Sync your account to get your first focus.",
    evidence: "RankedCoach needs retained competitive match data before it can coach honestly.",
    why: "No synced match sample is loaded yet.",
    how: "Enter a Riot ID, sync the account, then open the first generated focus.",
    priority: "Setup",
    impact: "Setup",
    confidence: null,
    behaviors: ["Sync an account.", "Import retained competitive matches.", "Review the first generated focus."]
  };
}

function optionList(values = [], selected = "") {
  return values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(value)}</option>`).join("");
}

function getMapByLabel(label = "") {
  const key = normalizeKey(label);
  return maps().find(map => normalizeKey(map.label || map.name || map.id) === key) || null;
}

function cleanPillar(pillar = {}) {
  const meta = PILLARS.find(item => item.key === pillar.key || item.short === pillar.label || item.label === pillar.label)
    || PILLARS.find(item => item.key === normalizeKey(pillar.label))
    || PILLARS[0];
  return {
    ...meta,
    ...pillar,
    label: meta.label,
    short: meta.short,
    score: clamp(Number(pillar.score ?? 0)),
    delta: finite(pillar.delta) ? Number(pillar.delta) : 0
  };
}

function modelPillars(model = {}) {
  const byKey = new Map((model.pillars || []).map(pillar => [pillar.key, pillar]));
  return PILLARS.map(base => cleanPillar({ ...base, ...(byKey.get(base.key) || {}) }));
}

function focusPool(model = {}) {
  if (!hasMatchData(model)) return [];
  return modelPillars(model)
    .slice()
    .sort((a, b) => Number(a.score || 0) - Number(b.score || 0))
    .map((pillar, index) => {
      const confidence = clamp(Math.round(92 - index * 6 - Math.max(0, pillar.score - 65) * 0.15), 58, 96);
      const impact = pillar.score < 58 ? "High" : pillar.score < 74 ? "Medium" : "Watch";
      return {
        id: `daily-${pillar.key}`,
        pillarKey: pillar.key,
        category: pillar.label,
        title: pillar.cue,
        evidence: pillar.driver || `${pillar.short} is tracking at ${whole(pillar.score)}/100 in the active window.`,
        why: "This is the cleanest short-term read from the available match data and reflections.",
        how: `${pillar.cue}. Keep that single job visible for the next queue block.`,
        priority: impact,
        impact,
        confidence,
        score: pillar.score,
        source: pillar.reference || "active match window",
        behaviors: [
          pillar.cue,
          "Say the cue before the barrier drops.",
          "Review the imported match against this one focus only."
        ],
        related: [pillar.short, pillar.statKey, pillar.reference].filter(Boolean)
      };
    });
}

function getDailyFocus(appState = {}, model = {}) {
  if (!hasMatchData(model)) return emptyFocus();
  if (appState.focusMode === "self" && appState.selfChosenFocus?.title) {
    return {
      id: "self-chosen-focus",
      category: appState.selfChosenFocus.category || "Self-Chosen",
      title: appState.selfChosenFocus.title,
      evidence: appState.selfChosenFocus.evidence || "Self-chosen focus for the current queue block.",
      why: "You chose this manually, so RankedCoach keeps it pinned until you return to Auto-Rotate.",
      how: appState.selfChosenFocus.how || "Keep it small enough to verify after the next match.",
      priority: appState.selfChosenFocus.impact || "Medium",
      impact: appState.selfChosenFocus.impact || "Medium",
      confidence: Number(appState.selfChosenFocus.confidence || 80),
      behaviors: [appState.selfChosenFocus.how || "Play the next match around this cue."]
    };
  }
  const pool = focusPool(model);
  const key = localDayKey();
  const stored = appState.dailyFocus || {};
  const index = stored.key === key && finite(stored.index)
    ? clamp(Number(stored.index), 0, Math.max(0, pool.length - 1))
    : dayOrdinal(key) % Math.max(1, pool.length);
  return pool[index] || pool[0] || {
    id: "daily-empty",
    category: "Setup",
    title: "Sync a real account to build a focus.",
    evidence: "No retained competitive match data is loaded yet.",
    why: "RankedCoach needs match data before it can coach honestly.",
    how: "Sync an account or use demo mode to preview the Play flow.",
    priority: "Medium",
    impact: "Medium",
    confidence: 65,
    behaviors: ["Sync an account.", "Review the first generated focus.", "Play one queue block."]
  };
}

export function ensureDailyFocus(appState = {}, model = {}) {
  const key = localDayKey();
  const pool = focusPool(model);
  if (!pool.length) {
    appState.dailyFocus = { key, mode: "empty", index: 0 };
    return getDailyFocus(appState, model);
  }
  if (!appState.dailyFocus || appState.dailyFocus.key !== key || appState.dailyFocus.mode !== (appState.focusMode || "auto")) {
    appState.dailyFocus = {
      key,
      mode: appState.focusMode || "auto",
      index: dayOrdinal(key) % Math.max(1, pool.length)
    };
  }
  return getDailyFocus(appState, model);
}

function firstUsefulMap(model = {}) {
  const fromModel = (model.maps || []).find(item => item.map)?.map;
  const fromPool = maps().find(map => map.inCompetitivePool !== false)?.label;
  return fromModel || fromPool || maps()[0]?.label || "Ascent";
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
  return fromMap || fromModel || fromReference || "Jett";
}

export function getFocusQueue(appState = {}, model = {}) {
  if (!hasMatchData(model)) return [];
  const queue = Array.isArray(appState.focusQueue) ? appState.focusQueue : [];
  if (queue.length) {
    return queue.slice(0, 5).map((item, index) => ({
      confidence: clamp(Number(item.confidence ?? (88 - index * 7)), 45, 98),
      impact: item.impact || item.priority || (index === 0 ? "High" : "Medium"),
      ...item
    }));
  }
  return focusPool(model).slice(0, 5);
}

export function buildLoadoutAssignment(model = {}, appState = {}) {
  const loadout = normalizeLoadout(appState.loadout);
  const map = loadout.map && loadout.map !== "Any Map" ? loadout.map : firstUsefulMap(model);
  const role = loadout.role && loadout.role !== "Any Role" ? loadout.role : firstUsefulRole(model, map);
  const agent = loadout.agent && loadout.agent !== "Any Agent" ? loadout.agent : firstUsefulAgent(role, map, model);
  const focus = ensureDailyFocus(appState, model);
  const mapData = getMapByLabel(map);
  const roleNote = (mapData?.roleNotes?.[role] || [])[0]?.text;
  const mapReminder = roleNote || mapData?.teamplayTips?.[0]?.text || mapData?.siteTips?.[0]?.text || "Win space with one teammate, trade the first real contact, then reset the round plan.";
  return {
    map,
    role,
    agent,
    focusTitle: focus.title,
    focusCategory: focus.category,
    focusText: focus.how || focus.evidence,
    confidence: focus.confidence,
    impact: focus.impact || focus.priority || "Medium",
    mapReminder,
    generatedAt: new Date().toISOString()
  };
}

function getUnratedRankIconUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><defs><radialGradient id="g" cx="50%" cy="42%" r="62%"><stop offset="0" stop-color="#94a3b8"/><stop offset=".7" stop-color="#334155"/><stop offset="1" stop-color="#0f172a"/></radialGradient><filter id="b"><feGaussianBlur stdDeviation="1.2"/></filter></defs><circle cx="48" cy="48" r="40" fill="url(#g)" stroke="#cbd5e1" stroke-width="4" opacity=".72"/><g filter="url(#b)" opacity=".36"><path d="M27 31 48 17l21 14v34L48 79 27 65z" fill="none" stroke="#e5e7eb" stroke-width="5"/></g><text x="48" y="61" text-anchor="middle" font-family="Arial Black,Arial,sans-serif" font-size="44" font-weight="900" fill="#f8fafc">?</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function getRankIconUrl(rank = "") {
  const key = normalizeKey(String(rank || "").replace(/\+/g, " plus")).replace(/-/g, "");
  const file = RANK_ICON_FILES[key];
  return file
    ? `https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/${file}`
    : getUnratedRankIconUrl();
}

function rankAbsoluteRR(rank = "Unranked", rr = null) {
  const key = normalizeKey(String(rank || "").replace(/\+/g, " plus")).replace(/-/g, "");
  const index = RANK_ORDER.indexOf(key);
  if (index < 0 || !finite(rr)) return null;
  return index * 100 + Number(rr);
}

function rankBadge(rank = "Unranked", rr = null, size = "md") {
  const safeRank = escapeHtml(rank || "Unranked");
  return `<span class="rank-badge rank-badge--${escapeHtml(size)}" title="${safeRank}"><img src="${escapeHtml(getRankIconUrl(rank))}" alt="${safeRank} rank">${finite(rr) ? `<small>${whole(rr)}</small>` : ""}</span>`;
}

function currentRank(model = {}) {
  const latest = (model.records || []).find(record => record.rank?.rank);
  return {
    rank: latest?.rank?.rank || model.currentRank || "Unranked",
    rr: finite(latest?.rank?.rr) ? Number(latest.rank.rr) : null,
    delta: finite(latest?.rank?.rrDelta) ? Number(latest.rank.rrDelta) : 0
  };
}

function todayRecords(model = {}) {
  const key = localDayKey();
  return (model.records || []).filter(record => localDayKey(new Date(record.playedAt || Date.now())) === key);
}

function formatDelta(value = 0, suffix = "") {
  if (!finite(value)) return "--";
  const numeric = Number(value);
  return `${numeric >= 0 ? "+" : ""}${whole(numeric)}${suffix}`;
}

function spark(values = [], maxValue = 100, id = "spark") {
  const usable = values.slice(-8).map(Number).filter(Number.isFinite);
  if (!usable.length) return `<svg class="play-spark" viewBox="0 0 100 34" aria-hidden="true"></svg>`;
  const max = Math.max(maxValue, ...usable, 1);
  const points = usable.map((value, index) => {
    const x = usable.length === 1 ? 50 : (index / (usable.length - 1)) * 96 + 2;
    const y = 30 - (clamp(value, 0, max) / max) * 24;
    return `${x},${y}`;
  });
  const pointString = points.join(" ");
  const baseline = 30;
  const fillPoints = `${pointString} 100,${baseline} 0,${baseline}`;
  const valuesWithIndex = usable.map((value, index) => ({ value, index }));
  const peak = valuesWithIndex.reduce((best, item) => item.value > best.value ? item : best, valuesWithIndex[0]);
  const valley = valuesWithIndex.reduce((best, item) => item.value < best.value ? item : best, valuesWithIndex[0]);
  const pointAt = index => {
    const [x, y] = points[index].split(",");
    return { x, y };
  };
  const peakPoint = pointAt(peak.index);
  const valleyPoint = pointAt(valley.index);
  const gradientId = `sparkFill-${normalizeKey(id) || "default"}`;
  return `
    <svg class="play-spark" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor" stop-opacity=".55"/><stop offset="100%" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
      <polygon class="play-spark-fill" points="${fillPoints}" fill="url(#${gradientId})"></polygon>
      <line class="play-spark-baseline" x1="0" y1="${baseline}" x2="100" y2="${baseline}"></line>
      <polyline points="${pointString}"></polyline>
      <circle class="play-spark-peak" cx="${peakPoint.x}" cy="${peakPoint.y}" r="2.4"></circle>
      <circle class="play-spark-valley" cx="${valleyPoint.x}" cy="${valleyPoint.y}" r="1.9"></circle>
    </svg>
  `;
}

function statItems(model = {}) {
  const records = (model.records || []).slice().reverse();
  const overview = model.overview || {};
  const valueSeries = key => records.map(record => Number(record.stats?.[key])).filter(Number.isFinite);
  const latestRank = currentRank(model);
  return [
    { label: "K/D", value: ratio(overview.kd), delta: formatDelta((overview.kd || 0) - 1, ""), series: records.map(record => (record.stats?.kills || 0) / Math.max(1, record.stats?.deaths || 1)), max: 2 },
    { label: "Win Rate", value: percent(overview.winRate), delta: `${whole(overview.wins || 0)}-${whole(overview.losses || 0)}`, series: records.map(record => record.result === "win" ? 100 : 0), max: 100 },
    { label: "ACS", value: whole(overview.acs), delta: "current", series: valueSeries("acs"), max: 340 },
    { label: "KAST", value: percent(overview.overallKAST), delta: "round data", series: records.map(record => record.stats?.kast).filter(Number.isFinite), max: 100 },
    { label: "HS %", value: percent(overview.hs), delta: "shots", series: valueSeries("hsPercent"), max: 55 },
    { label: "ADR", value: whole(overview.adr), delta: "damage", series: valueSeries("adr"), max: 220 },
    { label: "RR", value: finite(latestRank.rr) ? `${whole(latestRank.rr)} RR` : "Unranked", delta: `${latestRank.rank}`, series: records.map(record => record.rank?.rr).filter(Number.isFinite), max: 100 },
    { label: "Matches", value: whole(overview.matchesPlayed || 0), delta: model.currentAct || "Current act", series: records.map((_record, index) => index + 1), max: Math.max(10, records.length) }
  ];
}

function renderStatsStrip(model = {}, appState = {}) {
  const stats = statItems(model);
  const page = clamp(Number(appState.playStatsPage || 0), 0, Math.max(0, stats.length - 5));
  const visible = stats.slice(page, page + 5);
  return `
    <section class="play-stats-strip" aria-label="Game Stats">
      <header>
        <div><p class="rc-eyebrow">Game Stats</p><h2>Active window snapshot</h2></div>
        <div class="play-strip-controls">
          <span>${page + 1}-${Math.min(page + 5, stats.length)} of ${stats.length}</span>
          ${button({ label: "Prev", variant: "icon", action: "stats-page-prev", disabled: page === 0 })}
          ${button({ label: "Next", variant: "icon", action: "stats-page-next", disabled: page + 5 >= stats.length })}
        </div>
      </header>
      <div class="play-stat-row">
        ${visible.map(item => `
          <button class="play-stat-tile" type="button" data-review-tab="stats" data-review-category="${escapeHtml(item.label)}">
            <span class="play-stat-label">${statIcon(item.label)}<span>${escapeHtml(item.label)}</span></span>
            <strong>${escapeHtml(item.value)}</strong>
            <small>${escapeHtml(item.delta)}</small>
            ${spark(item.series, item.max, item.label)}
          </button>
        `).join("")}
      </div>
    </section>
  `;
}

function renderTodayFocus(model = {}, appState = {}) {
  const focus = ensureDailyFocus(appState, model);
  if (!hasMatchData(model)) {
    return `
      <section class="today-focus-panel today-focus-panel--empty">
        <div class="today-focus-main">
          <p class="rc-eyebrow">Today's Focus</p>
          <span class="one-job-label">Setup</span>
          <h2>${escapeHtml(focus.title)}</h2>
          <p>${escapeHtml(focus.evidence)}</p>
          ${button({ label: "Sync Account", variant: "primary", action: "open-sync" })}
        </div>
      </section>
    `;
  }
  const featuredAgent = normalizeLoadout(appState.loadout).assignment?.agent || model.agents?.[0]?.agent || "Jett";
  const agentImage = getAgentPortraitAsset(featuredAgent);
  return `
    <section class="today-focus-panel">
      <div class="today-focus-main">
        <p class="rc-eyebrow">Today's Focus</p>
        <span class="one-job-label">One Job</span>
        <h2>${escapeHtml(focus.title)}</h2>
        <h3>Why this matters</h3>
        <p>${escapeHtml(focus.evidence || "Your focus will sharpen after sync.")}</p>
        ${button({ label: "View Focus Details", variant: "primary", action: "open-focus-detail", attrs: `data-focus-id="${escapeHtml(focus.id || "")}"` })}
      </div>
      <aside class="today-focus-stack" aria-label="Focus confidence and impact">
        ${confidencePill(focus.confidence || 78)}
        ${impactPill(focus.impact || focus.priority || "Medium")}
      </aside>
      <div class="today-focus-art"><div class="agent-art-frame">${agentImage ? `<img src="${escapeHtml(agentImage)}" alt="">` : icon("focus-queue", { size: 98 })}</div></div>
    </section>
  `;
}

function renderOrbitIcon() {
  return `
    <svg class="lp-orbit" viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="var(--rc-brand-strong, var(--rc-brand-hi))"/>
          <stop offset="100%" stop-color="var(--rc-brand-deep)"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-15 32 32)">
        <ellipse class="orbit-ring" cx="32" cy="32" rx="27" ry="11"/>
        <circle class="orbit-star" r="1.6">
          <animateMotion dur="7s" repeatCount="indefinite" path="M 5,32 A 27,11 0 1,1 59,32 A 27,11 0 1,1 5,32"/>
        </circle>
        <circle class="orbit-star" r="1.1" opacity=".75">
          <animateMotion dur="7s" begin="-4.6s" repeatCount="indefinite" path="M 5,32 A 27,11 0 1,1 59,32 A 27,11 0 1,1 5,32"/>
        </circle>
      </g>
      <g transform="rotate(20 32 32)">
        <ellipse class="orbit-ring" cx="32" cy="32" rx="22" ry="9"/>
        <circle class="orbit-star" r="1.3">
          <animateMotion dur="5.2s" begin="-1.8s" repeatCount="indefinite" path="M 10,32 A 22,9 0 1,1 54,32 A 22,9 0 1,1 10,32"/>
        </circle>
      </g>
      <path d="M32 20 43 32 32 44 21 32Z" fill="url(#gemGrad)" stroke="var(--rc-brand-strong, var(--rc-brand-hi))" stroke-width=".6"/>
      <path d="M32 20 37 27 32 32 27 27Z" fill="rgba(255,255,255,.35)"/>
    </svg>
  `;
}

function renderLoadoutMini() {
  return card({
    eyebrow: "Loadout",
    title: "Start a Match",
    className: "play-card loadout-mini-card play-loadout-card",
    body: `
      <div class="loadout-orbit-wrap">${renderOrbitIcon()}</div>
      <p>Open the queue prep flow, roll a focused plan, and carry it into the match.</p>
    `,
    footer: button({ label: "Start A Match", variant: "primary", action: "open-loadout-flow" })
  });
}

function radarPoint(cx, cy, radius, angle, value) {
  const scaled = radius * clamp(Number(value) || 0) / 100;
  return { x: cx + Math.cos(angle) * scaled, y: cy + Math.sin(angle) * scaled };
}

function renderCompassRadar(pillars = [], size = 260) {
  const data = modelPillars({ pillars });
  const center = size / 2;
  const radius = size * 0.34;
  const angles = data.map((_pillar, index) => -Math.PI / 2 + (Math.PI * 2 * index / data.length));
  const rings = [25, 50, 75, 100].map(value => {
    const points = angles.map(angle => radarPoint(center, center, radius, angle, value)).map(point => `${point.x},${point.y}`).join(" ");
    return `<polygon points="${points}" fill="none" />`;
  }).join("");
  const axes = data.map((pillar, index) => {
    const end = radarPoint(center, center, radius, angles[index], 100);
    const label = radarPoint(center, center, radius + 30, angles[index], 100);
    return `<line x1="${center}" y1="${center}" x2="${end.x}" y2="${end.y}" /><text x="${label.x}" y="${label.y}" text-anchor="middle" dominant-baseline="middle">${escapeHtml(pillar.short)}</text>`;
  }).join("");
  const polygon = data.map((pillar, index) => {
    const point = radarPoint(center, center, radius, angles[index], pillar.score);
    return `${point.x},${point.y}`;
  }).join(" ");
  const dots = data.map((pillar, index) => {
    const point = radarPoint(center, center, radius, angles[index], pillar.score);
    return `<circle cx="${point.x}" cy="${point.y}" r="5" class="compass-dot-${index}"><title>${escapeHtml(pillar.label)} ${whole(pillar.score)}/100</title></circle>`;
  }).join("");
  return `<svg class="compass-radar" viewBox="0 0 ${size} ${size}" role="img" aria-label="Five-pillar Compass radar"><g class="compass-grid">${rings}${axes}</g><polygon class="compass-fill" points="${polygon}" />${dots}</svg>`;
}

function renderCompassMini(model = {}) {
  const pillars = modelPillars(model);
  const avg = pillars.reduce((sum, item) => sum + Number(item.score || 0), 0) / Math.max(1, pillars.length);
  const strongest = pillars.slice().sort((a, b) => Number(b.score || 0) - Number(a.score || 0))[0];
  const weakest = pillars.slice().sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0];
  const tiles = pillars.map((pillar, index) => `
    <button class="compass-pillar-tile compact pillar-${index}" type="button" data-review-tab="stats" data-review-category="${escapeHtml(pillar.key)}">
      ${pillarIcon(pillar.key)}
      <span>${escapeHtml(pillar.short)}</span>
      <strong>${whole(pillar.score)}<small>/100</small></strong>
    </button>
  `).join("");
  return card({
    eyebrow: "Compass",
    title: `${whole(avg)}/100 overall`,
    className: "play-card compass-mini-card",
    body: `
      <div class="compass-shell">
        <div class="compass-pillar-grid">${tiles}</div>
        <div class="compass-radar-wrap">${renderCompassRadar(pillars)}</div>
      </div>
      <p class="compass-summary-copy">Strongest: <strong>${escapeHtml(strongest?.short || "—")}</strong>. Needs work: <strong>${escapeHtml(weakest?.short || "—")}</strong>.</p>
    `
  });
}

function renderImprovementTimeline(model = {}) {
  const pillars = modelPillars(model);
  const ordered = pillars
    .slice()
    .sort((a, b) => Number(b.delta || 0) - Number(a.delta || 0))
    .slice(0, 5);
  return card({
    eyebrow: "Improvement Timeline",
    title: "Recent movement by pillar",
    className: "play-card improvement-timeline-card",
    body: `
      <div class="improvement-timeline-grid">
        ${ordered.map((pillar, index) => `
          <button class="improvement-timeline-step pillar-${index}" type="button" data-review-tab="stats" data-review-category="${escapeHtml(pillar.key)}">
            ${pillarIcon(pillar.key)}
            <span>${escapeHtml(pillar.short)}</span>
            <strong>${whole(pillar.score)}<small>/100</small></strong>
            <em class="${Number(pillar.delta || 0) >= 0 ? "semantic-win" : "semantic-loss"}">${formatDelta(pillar.delta || 0)}</em>
          </button>
        `).join("")}
      </div>
    `
  });
}

function renderCurrentRankCard(model = {}) {
  const overview = model.overview || {};
  const rank = currentRank(model);
  const today = todayRecords(model);
  const todayRr = today.reduce((sum, record) => sum + Number(record.rank?.rrDelta || 0), 0);
  const currentRr = finite(rank.rr) ? Number(rank.rr) : 0;
  const latest = (model.records || [])[0] || {};
  const role = latest.role || model.currentRole || model.roles?.[0]?.role || "Unknown";
  const wins = whole(overview.wins || 0);
  const losses = whole(overview.losses || 0);
  const draws = whole(overview.draws || 0);
  return card({
    eyebrow: "Current Rank",
    title: rank.rank || "Unranked",
    className: "play-card rr-mini-card current-rank-card",
    body: `
      <div class="current-rank-layout">
        <div class="current-rank-main">
          ${rankBadge(rank.rank, rank.rr, "lg")}
          <div>
            <span>${escapeHtml(rank.rank || "Unranked")}</span>
            <strong>${finite(rank.rr) ? `${whole(rank.rr)} RR` : "Sync ranked history"}</strong>
          </div>
        </div>
        <div class="rr-progress" aria-label="Progress to next rank"><span style="--fill:${clamp(currentRr)}%"></span></div>
        <div class="current-rank-record">
          <span>Wins <strong class="semantic-win">${wins}</strong></span>
          <span>Losses <strong class="semantic-loss">${losses}</strong></span>
          <span>Draws <strong>${draws}</strong></span>
        </div>
        <div class="current-role-card ${roleClass(role)}">
          <div>${roleIconAsset(role, 24)}<span>Current Role</span><strong>${escapeHtml(role)}</strong></div>
          <div class="current-role-metrics">
            <span>Today <strong>${formatDelta(todayRr, " RR")}</strong></span>
            <span>Last ACS <strong>${finite(latest.stats?.acs) ? whole(latest.stats.acs) : "—"}</strong></span>
          </div>
        </div>
      </div>
    `
  });
}

function renderRRTrendMini(model = {}) {
  const records = (model.records || []).slice(0, 20).reverse();
  const values = records.map((record, index) => {
    const absolute = rankAbsoluteRR(record.rank?.rank, record.rank?.rr);
    return {
      value: finite(absolute) ? Number(absolute) : index,
      date: record.playedAt,
      delta: Number(record.rank?.rrDelta || 0)
    };
  });
  const rawValues = values.map(item => item.value);
  const minValue = rawValues.length ? Math.min(...rawValues) : 0;
  const maxValue = rawValues.length ? Math.max(...rawValues) : 100;
  const yMin = Math.max(0, Math.floor(minValue / 100) * 100);
  const yMax = Math.max(yMin + 100, Math.ceil(maxValue / 100) * 100);
  const plot = { left: 48, right: 252, top: 12, bottom: 72 };
  const x = index => values.length <= 1 ? plot.right : plot.left + (index / (values.length - 1)) * (plot.right - plot.left);
  const y = value => plot.bottom - ((value - yMin) / Math.max(1, yMax - yMin)) * (plot.bottom - plot.top);
  const points = values.map((item, index) => ({ x: x(index), y: y(item.value), value: item.value, date: item.date }));
  const pointString = points.map(point => `${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
  const areaPoints = points.length ? `${pointString} ${plot.right},${plot.bottom} ${plot.left},${plot.bottom}` : "";
  const ticks = [yMax, Math.round((yMax + yMin) / 200) * 100, yMin];
  const dateFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  const dateIndexes = points.length <= 1 ? [0] : [...new Set([0, Math.floor((points.length - 1) / 3), Math.floor((points.length - 1) * 2 / 3), points.length - 1])];
  const peak = points.reduce((best, point) => point.y < best.y ? point : best, points[0] || { x: 0, y: 0 });
  const valley = points.reduce((best, point) => point.y > best.y ? point : best, points[0] || { x: 0, y: 0 });
  const latest = points[points.length - 1];
  const rank = currentRank(model);
  const rawDelta = records.reduce((sum, record) => sum + Number(record.rank?.rrDelta || 0), 0);
  return card({
    eyebrow: "RR Trend",
    title: "Rank line (Last 20 Matches)",
    className: "play-card rr-trend-mini-card",
    body: `
      <div class="rr-trend-titlebar"><span>${rankBadge(rank.rank, rank.rr, "sm")}${finite(latest?.value) ? `${whole(latest.value)} RR` : finite(rank.rr) ? `${whole(rank.rr)} RR` : "Unranked"}</span><strong>${formatDelta(rawDelta, " RR")}</strong></div>
      <svg class="rr-trend-chart" viewBox="0 0 260 96" role="img" aria-label="Last 20 match RR trend">
        <defs><linearGradient id="rrTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--rc-success)" stop-opacity=".48"/><stop offset="100%" stop-color="var(--rc-success)" stop-opacity="0"/></linearGradient></defs>
        ${ticks.map(value => `<g class="rr-grid-line"><text x="4" y="${y(value).toFixed(1)}" dominant-baseline="middle">${whole(value)} RR</text><line x1="${plot.left}" x2="${plot.right}" y1="${y(value).toFixed(1)}" y2="${y(value).toFixed(1)}"></line></g>`).join("")}
        ${areaPoints ? `<polygon class="rr-trend-fill" points="${areaPoints}"></polygon><polyline class="rr-trend-line" points="${pointString}"></polyline>` : ""}
        ${[peak, valley, latest].filter(Boolean).map(point => `<circle class="rr-trend-dot" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="3.1"></circle>`).join("")}
        ${dateIndexes.map(index => {
          const point = points[index];
          const label = point?.date ? dateFormatter.format(new Date(point.date)) : "";
          return `<text class="rr-date-label" x="${x(index).toFixed(1)}" y="91" text-anchor="${index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"}">${escapeHtml(label)}</text>`;
        }).join("")}
      </svg>
    `,
    attrs: `data-review-tab="timeline"`
  });
}

function renderTopInsight(model = {}) {
  const insight = getPriorityInsight(model);
  return card({
    eyebrow: "Top Insight",
    title: insight.title || "No insight yet",
    className: "play-card top-insight-card",
    body: `<p>${escapeHtml(insight.preview || insight.action || "Sync an account to generate the strongest impact read.")}</p><div class="insight-confidence-row">${impactPill(insight.impact || insight.priority || "High")}${confidencePill(insight.confidence || 88)}</div>`,
    footer: button({ label: "View Insight", variant: "secondary", action: "open-insight-detail" })
  });
}

function renderFocusQueueMini(model = {}, appState = {}) {
  const queue = getFocusQueue(appState, model).slice(0, 3);
  if (!queue.length) {
    return card({
      eyebrow: "Focus Queue",
      title: "Sync to build your first queue.",
      className: "play-card focus-queue-mini-card focus-queue-mini-card--empty",
      body: `<p class="empty-copy">Focus Queue needs retained competitive match data before it can rank short-term jobs.</p>`,
      footer: button({ label: "Sync Account", variant: "primary", action: "open-sync" })
    });
  }
  return card({
    eyebrow: "Focus Queue",
    title: "Next jobs",
    className: "play-card focus-queue-mini-card",
    body: `<div class="focus-mini-list">${queue.map((item, index) => `<button type="button" data-action="open-focus-detail" data-focus-id="${escapeHtml(item.id)}"><span class="focus-mini-index">${index + 1}</span><strong>${escapeHtml(item.title)}</strong><span class="focus-mini-metrics">${impactPill(item.impact || item.priority || "Medium")}${confidencePill(item.confidence || 80)}</span></button>`).join("")}</div>`,
    footer: button({ label: "Open", variant: "primary", action: "open-focus-queue-modal" })
  });
}

function renderLastMatchBanner(model = {}, appState = {}) {
  const lastReflection = (appState.reflections || [])[0];
  const lastRecord = (model.records || [])[0];
  const result = lastReflection?.result || lastRecord?.result || "No match";
  const rrDelta = finite(lastReflection?.rrDelta) ? Number(lastReflection.rrDelta) : Number(lastRecord?.rank?.rrDelta || 0);
  const adherence = finite(lastReflection?.adherence)
    ? `${whole(lastReflection.adherence)}%`
    : finite(appState.logDraft?.adherence)
      ? `${whole(appState.logDraft.adherence)}% draft`
      : "Not logged yet";
  const rank = currentRank(model);
  return `
    <section class="last-match-banner">
      <div>
        <p class="rc-eyebrow">Last Match</p>
        <h2>${escapeHtml(result === "win" ? "Win" : result === "loss" ? "Loss" : result === "draw" ? "Draw" : "No imported match yet")} ${rankBadge(rank.rank, rank.rr, "sm")} ${formatDelta(rrDelta, " RR")}</h2>
        <p>Focus adherence: ${escapeHtml(adherence)}</p>
      </div>
      ${button({ label: "All Reflections", variant: "primary", attrs: `data-review-tab="reflections"` })}
    </section>
  `;
}

function renderReferenceRow() {
  const cards = [
    ["Review", "Open match history", "all-reflections", `data-review-tab="all-matches"`],
    ["Library", "Maps, agents, weapons", "map-notes", `data-page-jump="library"`],
    ["Learn", "Training references", "agent-tips", `data-page-jump="learn"`],
    ["Settings", "Customize beta", "settings", `data-page-jump="settings"`]
  ];
  return `<section class="play-reference-row" aria-label="Quick Actions"><header><p class="rc-eyebrow">Quick Actions</p></header>${cards.map(([title, sub, iconName, attrs]) => `<button type="button" ${attrs}>${icon(iconName)}<span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(sub)}</small></span></button>`).join("")}</section>`;
}

export function renderPlayPage(root, model, appState = {}) {
  if (!root) return;
  ensureDailyFocus(appState, model || {});
  root.innerHTML = `
    <div class="play-dashboard">
      <div class="play-raster-grid">
        <div class="play-grid-area play-grid-focus">${renderTodayFocus(model || {}, appState)}</div>
        <div class="play-grid-area play-grid-improvements">${renderImprovementTimeline(model || {})}</div>
        <div class="play-grid-area play-grid-loadout">${renderLoadoutMini()}</div>
        <div class="play-grid-area play-grid-compass">${renderCompassMini(model || {})}</div>
        <div class="play-grid-area play-grid-rank">${renderCurrentRankCard(model || {})}</div>
        <div class="play-grid-area play-grid-rr">${renderRRTrendMini(model || {})}</div>
        <div class="play-grid-area play-grid-insight">${renderTopInsight(model || {})}</div>
        <div class="play-grid-area play-grid-actions">${renderReferenceRow()}</div>
      </div>
    </div>
  `;
}

function renderLoadoutSelect(label, key, selected, options) {
  return `<label class="loadout-flow-select"><span>${escapeHtml(label)}</span><select data-loadout-select="${escapeHtml(key)}">${optionList(options, selected)}</select></label>`;
}

function renderLoadoutFlowSelectors(appState = {}) {
  const loadout = normalizeLoadout(appState.loadout);
  const roleOptions = ["Any Role", ...ROLE_ORDER];
  const agentOptions = ["Any Agent", ...agents().map(agent => agent.label || agent.name || agent.id).filter(Boolean).sort()];
  const mapOptions = ["Any Map", ...maps().map(map => map.label || map.id).filter(Boolean).sort()];
  return `<div class="loadout-flow-selectors">${renderLoadoutSelect("Map", "map", loadout.map, mapOptions)}${renderLoadoutSelect("Role", "role", loadout.role, roleOptions)}${renderLoadoutSelect("Agent", "agent", loadout.agent, agentOptions)}</div>`;
}

function renderFlowSpinner(loadout = {}) {
  return `
    <div class="loadout-flow-spinner" aria-live="polite">
      <svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="60"></circle><path d="M80 18v22M80 120v22M18 80h22M120 80h22M36 36l16 16M108 108l16 16M124 36l-16 16M52 108l-16 16"></path><path class="spinner-blade" d="M80 42 104 80 80 118 56 80Z"></path></svg>
      <strong>${escapeHtml(loadout.spinStep ? `Resolving ${loadout.spinStep}` : "Ready to spin")}</strong>
      <p>Map, role, agent, and short-term focus are being locked together.</p>
    </div>
  `;
}

function renderGeneratedLoadout(loadout = {}) {
  const assignment = loadout.assignment || {};
  const portrait = getAgentPortraitAsset(assignment.agent || "Jett");
  return `
    <div class="loadout-generated-flow">
      <div class="loadout-generated-left">
        <p class="rc-eyebrow">Loadout Ready</p>
        <h2>${escapeHtml(assignment.map || "Map")} / ${escapeHtml(assignment.role || "Role")}</h2>
        <div class="loadout-generated-stat"><span>Agent</span><strong>${escapeHtml(assignment.agent || "Agent")}</strong></div>
        <div class="loadout-generated-stat"><span>Match Focus</span><strong>${escapeHtml(assignment.focusTitle || "Short-term focus")}</strong><p>${escapeHtml(assignment.focusText || "")}</p></div>
        <div class="loadout-generated-meta">${confidencePill(assignment.confidence || 78)}${impactPill(assignment.impact || "Medium")}</div>
        <div class="loadout-flow-actions">${button({ label: "Start Match", variant: "primary", action: "start-match" })}${button({ label: "Spin Again", variant: "secondary", action: "spin-loadout" })}${button({ label: "Exit", variant: "tertiary", action: "exit-loadout-flow" })}</div>
      </div>
      <div class="loadout-portrait-panel"><img src="${escapeHtml(portrait)}" alt="${escapeHtml(assignment.agent || "Agent")}"></div>
    </div>
  `;
}

export function renderLoadoutPage(root, model, appState = {}) {
  if (!root) return;
  const loadout = normalizeLoadout(appState.loadout);
  root.innerHTML = `
    <section class="loadout-flow">
      <header class="loadout-flow-header"><div><p class="rc-eyebrow">Start a Match</p><h1>${loadout.state === "generated" ? "Loadout locked." : loadout.state === "spinning" ? "Spinning..." : "Build the next queue plan."}</h1></div>${button({ label: "Exit", variant: "secondary", action: "exit-loadout-flow" })}</header>
      ${loadout.state === "generated" && loadout.assignment ? renderGeneratedLoadout(loadout) : `<div class="loadout-idle-flow"><div>${renderLoadoutFlowSelectors(appState)}<div class="loadout-flow-actions">${button({ label: "Spin Loadout", variant: "primary", action: "spin-loadout", disabled: loadout.state === "spinning" })}</div></div>${renderFlowSpinner(loadout)}</div>`}
    </section>
  `;
}

function queueCard(item = {}, index = 0) {
  const confidence = clamp(Number(item.confidence || 80));
  return `<article class="focus-queue-card-row"><button class="queue-dismiss" type="button" data-action="queue-remove" data-focus-id="${escapeHtml(item.id)}" aria-label="Dismiss focus">x</button><span class="queue-number">${index + 1}</span><h3>${escapeHtml(item.title)}</h3><div class="focus-card-metrics">${impactPill(item.impact || item.priority || "Medium")}${confidencePill(confidence)}</div><div class="queue-meter"><span style="--fill:${confidence}%"></span></div></article>`;
}

export function renderFocusQueuePage(root, model, appState = {}) {
  if (!root) return;
  const queue = getFocusQueue(appState, model || {}).slice(0, 4);
  if (!queue.length) {
    root.innerHTML = `<section class="focus-queue-page focus-queue-page--empty">${cardHeader("Focus Queue", "Sync a real account to build your first beta read.", button({ label: "Sync Account", variant: "primary", action: "open-sync" }))}<p class="empty-copy">No retained competitive match data is loaded yet, so RankedCoach is not ranking coaching jobs from a fake sample.</p></section>`;
    return;
  }
  root.innerHTML = `<section class="focus-queue-page">${cardHeader("Focus Queue", "Auto-rotated and self-chosen jobs.", button({ label: "Add Focus", variant: "primary", action: "open-add-focus" }))}<div class="focus-queue-mode">${button({ label: "Auto-Rotate", variant: appState.focusMode === "self" ? "secondary" : "primary", action: "focus-mode-auto" })}${button({ label: "Self-Chosen", variant: appState.focusMode === "self" ? "primary" : "secondary", action: "focus-mode-self" })}</div><div class="focus-queue-cards">${queue.map(queueCard).join("")}</div><button class="focus-add-ghost" type="button" data-action="open-add-focus">+ Add Focus to Queue</button></section>`;
}

export function openFocusQueueModal(modalRoot, model, appState = {}) {
  if (!modalRoot) return;
  const queue = getFocusQueue(appState, model || {}).slice(0, 4);
  if (!queue.length) {
    modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-close><section class="modal-card focus-queue-modal" role="dialog" aria-modal="true" aria-labelledby="focusQueueModalTitle"><header class="modal-head"><div><p class="eyebrow">Focus Queue</p><h2 id="focusQueueModalTitle">Sync to build your first queue.</h2></div>${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}</header><div class="modal-body"><p class="empty-copy">RankedCoach needs retained competitive match data before it can prioritize focus jobs honestly.</p>${button({ label: "Sync Account", variant: "primary", action: "open-sync" })}</div></section></div>`;
    return;
  }
  modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-close><section class="modal-card focus-queue-modal" role="dialog" aria-modal="true" aria-labelledby="focusQueueModalTitle"><header class="modal-head"><div><p class="eyebrow">Focus Queue</p><h2 id="focusQueueModalTitle">Next short-term jobs.</h2></div>${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}</header><div class="modal-body"><div class="focus-queue-mode">${button({ label: "Auto-Rotate", variant: appState.focusMode === "self" ? "secondary" : "primary", action: "focus-mode-auto" })}${button({ label: "Self-Chosen", variant: appState.focusMode === "self" ? "primary" : "secondary", action: "focus-mode-self" })}</div><div class="focus-queue-cards">${queue.map(queueCard).join("")}</div><button class="focus-add-ghost" type="button" data-action="open-add-focus">+ Add Focus to Queue</button></div></section></div>`;
}

function renderPillarTiles(model = {}) {
  return `<div class="in-game-pillars">${modelPillars(model).map((pillar, index) => `<button class="in-game-pillar pillar-${index}" type="button" data-review-tab="stats" data-review-category="${escapeHtml(pillar.key)}">${pillarIcon(pillar.key)}<span>${escapeHtml(pillar.short)}</span><strong>${whole(pillar.score)}</strong></button>`).join("")}</div>`;
}

function renderReferenceDetail(kind = "", assignment = {}) {
  if (kind === "agent") return `<h3>${escapeHtml(assignment.agent || "Agent")} tip</h3><p>Use your first utility to help the first contact, not after the fight is already over.</p>`;
  if (kind === "lineups") return `<label class="lineup-search">Search lineups<input placeholder="Search map, agent, or site"></label><p>Lineups stay compact in Play; the full archive lives in Library.</p>`;
  if (kind === "weapons") return `<h3>Weapons</h3><p>Pair the weapon to the fight: rifles for repeatable trades, pistols for close swing timing, and snipers for long punished sightlines.</p>`;
  return `<h3>${escapeHtml(assignment.map || "Map")} notes</h3><p>${escapeHtml(assignment.mapReminder || "Take space with a teammate and keep the spike path simple.")}</p>`;
}

export function renderInGamePage(root, model, appState = {}) {
  if (!root) return;
  const loadout = normalizeLoadout(appState.loadout);
  const assignment = loadout.assignment || buildLoadoutAssignment(model || {}, appState);
  const focus = ensureDailyFocus(appState, model || {});
  const activeReference = appState.inGameReference || "map";
  root.innerHTML = `
    <div class="in-game-stack">
      <section class="in-game-focus-card"><header><div><p class="rc-eyebrow">In-Game Focus</p><h2>${escapeHtml(focus.title)}</h2></div><div class="in-game-focus-meta">${confidencePill(focus.confidence || 78)}${impactPill(focus.impact || "Medium")}</div></header><p>${escapeHtml(focus.how || focus.evidence || "")}</p></section>
      ${renderPillarTiles(model || {})}
      <section class="rc-card rc-card--dashboard focus-checklist-card">${cardHeader("Focus Checklist", "Keep it simple while the match is live.")}<ul class="focus-checklist"><li>Say the focus before pistol and each side swap.</li><li>Use one teammate or one piece of utility before first contact.</li><li>After death, call useful info once, then reset.</li></ul></section>
      <section class="rc-card rc-card--dashboard quick-reference-card">${cardHeader("Quick Reference", "Relevant to this match")}<div class="quick-reference-tabs">${[["map", "Map Notes", "map-notes"], ["agent", "Agent Tips", "agent-tips"], ["lineups", "Lineups", "lineups"], ["weapons", "Weapons", "weapons"]].map(([key, label, iconName]) => `<button class="${activeReference === key ? "is-active" : ""}" type="button" data-action="open-reference" data-reference="${key}">${icon(iconName)}${escapeHtml(label)}</button>`).join("")}</div><div class="quick-reference-body">${renderReferenceDetail(activeReference, assignment)}</div></section>
      ${appState.matchCompleteError ? `<div class="sync-error-strip">${escapeHtml(appState.matchCompleteError)} ${button({ label: "Retry", variant: "secondary", action: "match-complete" })}</div>` : ""}
      <div class="in-game-actions">${button({ label: "Match Complete", variant: "primary", action: "match-complete" })}${button({ label: "Exit", variant: "secondary", action: "exit-in-game" })}</div>
    </div>
  `;
}

function logValue(appState = {}, key = "", fallback = "") {
  return escapeHtml(appState.logDraft?.[key] ?? fallback);
}

function slider(name, key, value = 50, min = 0, max = 100) {
  return `<label class="percent-slider"><span>${escapeHtml(name)} <strong>${whole(value)}%</strong></span><input type="range" min="${min}" max="${max}" value="${escapeHtml(value)}" data-log-field="${escapeHtml(key)}"></label>`;
}

function moodSlider(value = 3) {
  const labels = ["Frustrated", "Rough", "Okay", "Good", "Great"];
  const active = clamp(Number(value || 3), 1, 5);
  return `<label class="percent-slider mood-slider"><span>Mood <strong>${escapeHtml(labels[active - 1] || "Okay")}</strong></span><input type="range" min="1" max="5" value="${active}" data-log-field="mood"><div class="mood-labels">${labels.map((label, index) => `<small class="${index + 1 === active ? "is-active" : ""}">${escapeHtml(label)}</small>`).join("")}</div></label>`;
}

export function renderLogMatchPage(root, model, appState = {}) {
  if (!root) return;
  const assignment = normalizeLoadout(appState.loadout).assignment || {};
  const draft = appState.logDraft || {};
  const activeFocus = ensureDailyFocus(appState, model || {});
  const selectedResult = draft.result || "";
  const resultButton = value => button({ label: value, variant: selectedResult === value.toLowerCase() ? "primary" : "secondary", action: "log-result", attrs: `data-log-result="${value.toLowerCase()}"` });
  root.innerHTML = `
    <form class="log-match-stack" data-log-form>
      <section class="rc-card rc-card--dashboard log-section log-result">${cardHeader("Result", "Win, loss, or draw")}<div class="choice-row">${resultButton("Win")}${resultButton("Loss")}${resultButton("Draw")}</div></section>
      <section class="rc-card rc-card--dashboard log-section log-rr">${cardHeader("RR Change", "Verified from sync when available")}<div class="field-grid two"><label>RR Before<input data-log-field="rrBefore" inputmode="numeric" value="${logValue(appState, "rrBefore", draft.rrBefore || "")}"></label><label>RR After<input data-log-field="rrAfter" inputmode="numeric" value="${logValue(appState, "rrAfter", draft.rrAfter || "")}"></label></div></section>
      <section class="rc-card rc-card--dashboard log-section log-details">${cardHeader("Match Details", "Pulled from the loadout and match sync")}<div class="field-grid two"><label>Mode<select data-log-field="mode"><option value="Competitive">Competitive</option><option value="Premier">Premier</option><option value="Unknown">Unknown</option></select></label><label>Map<input data-log-field="map" value="${logValue(appState, "map", assignment.map || draft.map || "")}"></label><label>Agent<input data-log-field="agent" value="${logValue(appState, "agent", assignment.agent || draft.agent || "")}"></label><label>Role<input data-log-field="role" value="${logValue(appState, "role", assignment.role || draft.role || "")}"></label></div></section>
      <section class="rc-card rc-card--dashboard log-section log-mood">${cardHeader("Mood", "How the match felt")}${moodSlider(draft.mood || 3)}</section>
      <section class="rc-card rc-card--dashboard log-section log-performance">${cardHeader("Personal Performance", "Self-read percentage")}${slider("Performance Score", "performanceScore", draft.performanceScore || 60)}</section>
      <section class="rc-card rc-card--dashboard log-section log-comms">${cardHeader("Comms", "Rate your own comms and the team environment")}<div class="field-grid two">${slider("Self Comms", "selfComms", draft.selfComms || 50)}${slider("Team Comms", "teamComms", draft.teamComms || 50)}</div></section>
      <section class="rc-card rc-card--dashboard log-section log-reflection">${cardHeader("Reflection", "Notes and quick tips")}<label>Notes<textarea data-log-field="notes" maxlength="700" placeholder="What happened? What was your playstyle? Mention intentions here if they matter.">${logValue(appState, "notes")}</textarea></label><div class="typing-tips"><strong>Quick tip:</strong> Keep the note concrete: one round, one habit, one adjustment.</div></section>
      <section class="rc-card rc-card--dashboard log-section log-focus">${cardHeader("Focus Adherence", activeFocus.title)}<p>${escapeHtml(activeFocus.how || activeFocus.evidence || "")}</p>${slider("Focus Adherence", "adherence", draft.adherence || 65)}</section>
      <section class="log-end-strip">${button({ label: "End Match", variant: "primary", action: "save-log-match" })}</section>
    </form>
  `;
}

export function openFocusDetailsModal(modalRoot, model, appState = {}, focusId = "") {
  if (!modalRoot) return;
  const queue = getFocusQueue(appState, model || {});
  const focus = queue.find(item => item.id === focusId) || getDailyFocus(appState, model || {});
  const behaviors = (focus.behaviors || []).map(item => `<li>${escapeHtml(item)}</li>`).join("");
  const related = (focus.related || []).map(item => `<button class="pill" type="button" data-page-jump="learn" data-learn-query="${escapeHtml(item)}">${escapeHtml(item)}</button>`).join("");
  const queueHtml = queue.length
    ? queue.slice(0, 5).map((item, index) => `
        <button class="${item.id === focus.id ? "is-active" : ""}" type="button" data-action="open-focus-detail" data-focus-id="${escapeHtml(item.id)}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.category || "Focus")}</small>
        </button>
      `).join("")
    : `<p class="empty-copy">Sync retained competitive matches to populate the queue.</p>`;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-close><section class="modal-card focus-modal focus-modal--with-queue" role="dialog" aria-modal="true" aria-labelledby="focusModalTitle"><header class="modal-head"><div><p class="eyebrow">${escapeHtml(focus.category || "Focus")} / ${escapeHtml(focus.impact || focus.priority || "Medium")} Impact</p><h2 id="focusModalTitle">${escapeHtml(focus.title)}</h2></div>${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}</header><div class="modal-body focus-detail-layout"><div class="focus-detail-main"><section class="detail-block"><h3>Why this focus?</h3><p>${escapeHtml(focus.why || focus.evidence || "")}</p></section><section class="detail-block"><h3>What to do</h3><ul>${behaviors || "<li>Pick one repeatable habit and check it after the next import.</li>"}</ul></section><section class="detail-block"><h3>Success looks like</h3><p>${escapeHtml(focus.how || "The next match shows one cleaner repeated decision tied to this focus.")}</p></section><section class="detail-block"><h3>Related concepts</h3><div class="recent-list">${related || "<span class=\"muted\">No related concepts yet.</span>"}</div></section></div><aside class="focus-detail-queue"><p class="rc-eyebrow">Focus Queue</p><h3>Next jobs</h3><div>${queueHtml}</div><footer>${button({ label: "Manage Queue", variant: "secondary", attrs: `data-page-jump="focus-queue"` })}</footer></aside></div></section></div>`;
}

export function openAddFocusModal(modalRoot, model) {
  if (!modalRoot) return;
  const recommended = focusPool(model || {}).map(item => `<button class="focus-suggestion" type="button" data-action="queue-add-focus" data-focus-title="${escapeHtml(item.title)}" data-focus-category="${escapeHtml(item.category)}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.category)} / ${escapeHtml(item.impact || "Medium")}</span><p>${escapeHtml(item.evidence || item.how || "")}</p></button>`).join("");
  modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-close><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="addFocusTitle"><header class="modal-head"><div><p class="eyebrow">Focus Queue</p><h2 id="addFocusTitle">Add a focus.</h2></div>${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}</header><div class="modal-body"><div class="focus-suggestion-grid">${recommended}</div><div class="field-grid two"><label>Custom title<input data-custom-focus-field="title" placeholder="Example: Cleaner opening duels"></label><label>Category<input data-custom-focus-field="category" placeholder="Aim / Mechanics"></label></div>${button({ label: "Save Custom Focus", variant: "primary", action: "queue-save-custom" })}</div></section></div>`;
}

export function openLogSavedModal(modalRoot, reflection = {}, model = {}) {
  if (!modalRoot) return;
  const rank = currentRank(model);
  const rrDelta = finite(reflection?.rrDelta) ? Number(reflection.rrDelta) : 0;
  modalRoot.innerHTML = `<div class="modal-backdrop" data-modal-close><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="logSavedTitle"><header class="modal-head"><div><p class="eyebrow">Saved</p><h2 id="logSavedTitle">Match Saved!</h2></div>${button({ label: "Close", variant: "secondary", attrs: "data-modal-close" })}</header><div class="modal-body log-saved-body"><span class="save-check">&#10003;</span><p>RR Change: <strong>${formatDelta(rrDelta, " RR")}</strong></p><div class="rank-saved-pair">${rankBadge(rank.rank, rank.rr, "lg")}<strong>${escapeHtml(rank.rank)} ${finite(rank.rr) ? `${whole(rank.rr)} RR` : ""}</strong></div><div class="choice-row">${button({ label: "View Reflection", variant: "primary", attrs: `data-review-tab="reflections"` })}${button({ label: "Back to Play", variant: "secondary", attrs: `data-page-jump="play"` })}</div></div></section></div>`;
}

export function createReflectionFromDraft(appState = {}) {
  const draft = appState.logDraft || {};
  const assignment = normalizeLoadout(appState.loadout).assignment || {};
  const now = new Date().toISOString();
  const before = Number(draft.rrBefore);
  const after = Number(draft.rrAfter);
  return {
    id: `reflection-${Date.now()}`,
    createdAt: now,
    playedAt: now,
    result: draft.result || "unknown",
    rrDelta: finite(after - before) ? after - before : null,
    map: draft.map || assignment.map || "Unknown",
    agent: draft.agent || assignment.agent || "Unknown",
    role: draft.role || assignment.role || "Unknown",
    focus: assignment.focusTitle || draft.focus || getDailyFocus(appState, {}).title,
    feeling: draft.mood || "",
    rating: draft.performanceScore || "",
    wentWell: draft.notes || "",
    improve: draft.improve || "",
    adherence: draft.adherence || "",
    saveReflection: true
  };
}
