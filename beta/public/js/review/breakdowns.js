import { buildEntityRankLine } from "../model/insights.js";
import { escapeHtml, percent, ratio, whole } from "../model/utils.js";
import { getAgentAsset, getMapAsset } from "../model/player-model.js";

function getWeaponAsset(label = "") {
  const wanted = String(label || "").trim().toLowerCase();
  const weapon = (globalThis.RankedCoachGamesenseReference?.weapons || [])
    .flatMap(group => group.weapons || [])
    .find(item => String(item?.label || "").trim().toLowerCase() === wanted);
  return weapon?.image || "";
}

function entityRow(kind, item, model) {
  const label = item.map || item.agent || item.weapon || item.label || "Unknown";
  const image = kind === "agent" ? getAgentAsset(label) : kind === "map" ? getMapAsset(label) : item.image || getWeaponAsset(label);
  const stat = kind === "weapon"
    ? `${whole(item.kills)}K / ${whole(item.deaths)}D · ${ratio(item.kd)} K/D`
    : `${percent(item.winRate)} WR · ${ratio(item.kd)} K/D`;
  const reference = kind === "weapon" ? "round-level kill feed" : buildEntityRankLine(item, "winRate", model);
  return `
    <article class="entity-row">
      <div class="match-media">
        ${image ? `<img src="${escapeHtml(image)}" alt="">` : ""}
        <div>
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(reference)}</span>
        </div>
      </div>
      <strong>${escapeHtml(stat)}</strong>
    </article>
  `;
}

export function renderBreakdowns(model = {}) {
  const maps = (model.maps || []).slice(0, 8).map(item => entityRow("map", item, model)).join("");
  const agents = (model.agents || []).slice(0, 8).map(item => entityRow("agent", item, model)).join("");
  const weapons = (model.weapons || []).slice(0, 8).map(item => entityRow("weapon", item, model)).join("");
  return `
    <section class="breakdown-columns" aria-label="Maps agents and weapons breakdown">
      <div class="card review-section">
        <p class="eyebrow">Maps breakdown</p>
        <h3>Maps by real match sample</h3>
        <div class="breakdown-list">${maps || "<p class=\"muted\">No map data yet.</p>"}</div>
      </div>
      <div class="card review-section">
        <p class="eyebrow">Agents breakdown</p>
        <h3>Agents by role performance</h3>
        <div class="breakdown-list">${agents || "<p class=\"muted\">No agent data yet.</p>"}</div>
      </div>
      <div class="card review-section">
        <p class="eyebrow">Weapons breakdown</p>
        <h3>K/D by weapon evidence</h3>
        <div class="breakdown-list">${weapons || "<p class=\"muted\">No round-level weapon kills yet.</p>"}</div>
      </div>
    </section>
  `;
}
