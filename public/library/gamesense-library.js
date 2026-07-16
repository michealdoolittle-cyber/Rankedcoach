(function () {
  "use strict";

  const state = { topic: "overview", itemId: "", role: "", detailId: "", mapView: "locations", tipView: "attack", mapZoom: 1, compAgent: "", compRole: "Controller" };
  const collectionLoadErrors = new Map();
  let activeSkinPreview = null;
  let activeSkinViewIndex = 0;
  let activeSkinVideoIndex = 0;
  let activeLibraryTransition = null;
  const topicMeta = {
    maps: { label: "Maps", copy: "Attack, defense, role notes, current comps, and marked tactical layouts." },
    agents: { label: "Agents", copy: "Role expectations, ability facts, costs, timing, and repeatable setups." },
    weapons: { label: "Weapons", copy: "Selectable weapon art, damage ranges, economy, and fight decisions." }
  };
  const agentUuids = Object.freeze({
    astra: "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
    breach: "5f8d3a7f-467b-97f3-062c-13acf203c006",
    brimstone: "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
    chamber: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
    clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
    cypher: "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
    deadlock: "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
    fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
    gekko: "e370fa57-4757-3604-3648-499e1f642d3f",
    harbor: "95b78ed7-4637-86d9-7e41-71ba8c293152",
    iso: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
    jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
    "kay-o": "601dbbe7-43ce-be57-2a40-4abd24953621",
    killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
    miks: "7c8a4701-4de6-9355-b254-e09bc2a34b72",
    neon: "bb2a4828-46eb-8cd1-e765-15848195d751",
    omen: "8e253930-4c05-31dd-1b6c-968525494517",
    phoenix: "eb93336a-449b-9c1b-0a54-a891f7921d69",
    raze: "f94c3b30-42be-e959-889c-5aa313dba261",
    reyna: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
    sage: "569fdd95-4d10-43ab-ca70-79becc718b46",
    skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
    sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
    tejo: "b444168c-4e35-8076-db47-ef9bf368f384",
    veto: "92eeef5d-43b5-1d4a-8d03-b3927a09034b",
    viper: "707eab51-4836-f488-046a-cda6bf494859",
    vyse: "efba5359-4016-a1e5-7626-b1ae76895940",
    waylay: "df1cb487-4902-002e-5c17-d28e83e78588",
    yoru: "7f94d92c-4234-0a36-9646-3a87eb8b5c89"
  });
  const compAgentRoles = Object.freeze({
    chamber: "sentinel", clove: "controller", cypher: "sentinel", fade: "initiator",
    gekko: "initiator", iso: "duelist", jett: "duelist", "kay-o": "initiator", killjoy: "sentinel",
    neon: "duelist", raze: "duelist", reyna: "duelist", sage: "sentinel",
    skye: "initiator", sova: "initiator", viper: "controller"
  });
  const compRoleOrder = Object.freeze(["controller", "duelist", "initiator", "sentinel"]);
  const CLOSE_ROLE_SWAP_DELTA = 1.5;
  const mapUuids = Object.freeze({
    ascent: "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
    breeze: "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
    haven: "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
    lotus: "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
    split: "d960549e-485c-e861-8d71-aa9d1aed12a2",
    sunset: "92584fbe-486a-b1b2-9faa-39b0f486b498"
  });

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function assetSlug(value = "") {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function sortPatchHistoryNewestFirst(history = []) {
    return history.map((item, index) => {
      const match = String(item?.patch || "").match(/(\d+)(?:\.(\d+))?/);
      return {
        item,
        index,
        major: match ? Number(match[1]) : -1,
        minor: match ? Number(match[2] || 0) : -1
      };
    }).sort((left, right) => (
      right.major - left.major
      || right.minor - left.minor
      || left.index - right.index
    )).map(entry => entry.item);
  }

  function getAgentIcon(agent = "") {
    const slug = assetSlug(agent);
    const uuid = agentUuids[slug];
    return uuid
      ? `https://media.valorant-api.com/agents/${uuid}/displayicon.png`
      : `/assets/library/agents/${slug}/icon.png`;
  }

  function getAgentFallbackIcon(agent = "") {
    const uuid = agentUuids[assetSlug(agent)];
    return uuid
      ? `https://media.valorant-api.com/agents/${uuid}/displayicon.png`
      : `https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/silhouettes/${assetSlug(agent)}.png`;
  }

  function getMapArtwork(mapName = "") {
    const slug = assetSlug(mapName);
    const local = getMaps().find(map => map.id === slug)?.cardImage;
    const uuid = mapUuids[slug];
    return local || (uuid ? `https://media.valorant-api.com/maps/${uuid}/splash.png` : "");
  }

  function getTopicCollageImages(topic = "") {
    if (topic === "maps") return ["/assets/library/maps/bind-card.png", "/assets/library/maps/breeze-card.png", "/assets/library/maps/split-card.png"];
    if (topic === "agents") return ["/assets/library/agents/jett/portrait.png", "/assets/library/agents/omen/portrait.png", "/assets/library/agents/sova/portrait.png"];
    return getReference().weapons
      .flatMap(group => Array.isArray(group?.weapons) ? group.weapons : [])
      .map(weapon => weapon?.image)
      .filter(Boolean);
  }

  function getCompAgentPickRate(map, agent = "") {
    const rate = Number(map?.highRankPickRates?.[agent]);
    return Number.isFinite(rate) ? rate : null;
  }

  function getCompRoleSignature(comp = {}) {
    const counts = new Map(compRoleOrder.map(role => [role, 0]));
    (comp.agents || []).forEach(agent => {
      const role = compAgentRoles[assetSlug(agent)];
      if (counts.has(role)) counts.set(role, counts.get(role) + 1);
    });
    return compRoleOrder.map(role => `${role}:${counts.get(role)}`).join("|");
  }

  function areCompRoleSwapsClose(map, reference = {}, candidate = {}) {
    let hasSwap = false;
    for (const role of compRoleOrder) {
      const referenceAgents = (reference.agents || []).filter(agent => compAgentRoles[assetSlug(agent)] === role);
      const candidateAgents = (candidate.agents || []).filter(agent => compAgentRoles[assetSlug(agent)] === role);
      if (referenceAgents.length !== candidateAgents.length) return false;
      const removed = referenceAgents.filter(agent => !candidateAgents.includes(agent));
      const added = candidateAgents.filter(agent => !referenceAgents.includes(agent));
      if (!removed.length && !added.length) continue;
      if (removed.length !== added.length) return false;
      hasSwap = true;
      const removedRates = removed.map(agent => getCompAgentPickRate(map, agent)).sort((left, right) => right - left);
      const addedRates = added.map(agent => getCompAgentPickRate(map, agent)).sort((left, right) => right - left);
      if (removedRates.some(rate => rate === null) || addedRates.some(rate => rate === null)) return false;
      if (removedRates.some((rate, index) => Math.abs(rate - addedRates[index]) > CLOSE_ROLE_SWAP_DELTA)) return false;
    }
    return hasSwap;
  }

  function getCompRoleLayoutReferences(map, comps = []) {
    const references = [];
    const bySignature = new Map();
    comps.filter(comp => Array.isArray(comp?.agents) && comp.agents.length === 5).forEach(comp => {
      const signature = getCompRoleSignature(comp);
      const matching = bySignature.get(signature) || [];
      if (!matching.length || matching.some(reference => areCompRoleSwapsClose(map, reference, comp))) {
        references.push(comp);
        matching.push(comp);
        bySignature.set(signature, matching);
      }
    });
    return references.slice(0, 3);
  }

  function getCompRoleTotals(comp = {}) {
    return compRoleOrder.map(role => {
      const agents = (comp.agents || []).filter(agent => compAgentRoles[assetSlug(agent)] === role);
      return {
        role,
        count: agents.length
      };
    }).filter(item => item.count > 0);
  }

  function getMaps() {
    return Array.isArray(globalThis.RankedCoachGamesenseMaps) ? globalThis.RankedCoachGamesenseMaps : [];
  }

  function getReference() {
    return globalThis.RankedCoachGamesenseReference || { agents: [], weapons: [], warmupDetails: {} };
  }

  function getWeaponCollectionProvider() {
    const provider = globalThis.RankedCoachWeaponCollections;
    return provider && typeof provider.getCached === "function" && typeof provider.loadForWeapon === "function" ? provider : null;
  }

  function getTopicItems(topic) {
    if (topic === "maps") return getMaps();
    return Array.isArray(getReference()[topic]) ? getReference()[topic] : [];
  }

  function renderOverview() {
    const season = getReference().season || {};
    return `
      <div class="gamesense-overview">
        <div class="gamesense-season-scope"><span>Active Season</span><strong>${escapeHtml(season.label || "Active Season")} | Patch ${escapeHtml(season.patch || "Current")}</strong><p>Agent, map, and weapon rates on this page use the active competitive season, not historical profile data.</p></div>
        <div class="gamesense-topic-grid">
          ${Object.entries(topicMeta).map(([key, meta], index) => `
            <button class="gamesense-topic-card" type="button" data-gamesense-topic="${key}" style="--topic-index:${index}">
              <span class="gamesense-topic-collage" aria-hidden="true">${getTopicCollageImages(key).map(src => `<img src="${escapeHtml(src)}" alt="" loading="lazy">`).join("")}</span>
              <strong>${escapeHtml(meta.label)}</strong>
              <small>${escapeHtml(meta.copy)}</small>
              <span class="gamesense-topic-action">Open dossier</span>
            </button>
          `).join("")}
        </div>
      </div>`;
  }

  function renderMapCard(item, index) {
    const isOutOfSeason = item.inCompetitivePool === false;
    return `
      <button class="gamesense-entry-card gamesense-map-entry-card${isOutOfSeason ? " is-out-of-season" : ""}" type="button" data-gamesense-item="${escapeHtml(item.id)}" aria-label="${escapeHtml(item.label)}${isOutOfSeason ? ", out of season" : ""}" style="--entry-index:${index};--map-card-image:url('${escapeHtml(item.cardImage)}')">
        <span class="gamesense-map-card-shade"></span>
        <span class="gamesense-map-card-copy"><strong>${escapeHtml(item.label)}</strong>${isOutOfSeason ? `<small class="gamesense-map-season-status">Out of Season</small>` : ""}</span>
      </button>`;
  }

  function renderAgentCard(item, index) {
    return `
      <button class="gamesense-entry-card gamesense-agent-entry-card" type="button" data-gamesense-item="${escapeHtml(item.id)}" style="--entry-index:${index}">
        <span class="gamesense-entry-index">${String(index + 1).padStart(2, "0")}</span>
        <img src="${escapeHtml(item.portrait)}" alt="" loading="lazy">
        <span class="gamesense-entry-copy"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.role)} | ${escapeHtml(item.maps.join(" / "))}</small><span>Inspect abilities</span></span>
      </button>`;
  }

  function renderWeaponCard(item, index) {
    return `
      <button class="gamesense-entry-card gamesense-weapon-entry-card" type="button" data-gamesense-item="${escapeHtml(item.id)}" style="--entry-index:${index}">
        <span class="gamesense-entry-index">${String(index + 1).padStart(2, "0")}</span>
        <strong class="gamesense-weapon-entry-title">${escapeHtml(item.label)}</strong>
        <span class="gamesense-weapon-card-art">${(item.weapons || []).slice(0, 3).map(weapon => `<img src="${escapeHtml(weapon.image)}" alt="" loading="lazy">`).join("")}</span>
        <span class="gamesense-entry-copy"><small>${escapeHtml(item.examples)} | ${escapeHtml(item.range)}</small><span>Inspect weapons</span></span>
      </button>`;
  }

  function renderGallery(topic) {
    const meta = topicMeta[topic];
    const items = getTopicItems(topic);
    return `
      <div class="gamesense-gallery-head gamesense-${escapeHtml(topic)}-gallery-head">
        <div><strong>${escapeHtml(meta.label)} Library</strong></div>
        <button class="gamesense-back" type="button" data-gamesense-back="overview">Back to topics</button>
      </div>
      <div class="gamesense-entry-grid gamesense-entry-grid-${topic}">
        ${items.map((item, index) => topic === "maps" ? renderMapCard(item, index) : topic === "agents" ? renderAgentCard(item, index) : renderWeaponCard(item, index)).join("")}
      </div>`;
  }

  function renderList(title, items = [], className = "") {
    return `
      <section class="gamesense-note-block ${className}">
        <h3>${escapeHtml(title)}</h3>
        <ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>`;
  }

  function renderMarkedMap(map) {
    const isPlants = state.mapView === "plants";
    const markers = isPlants ? map.plantSpots || [] : map.callouts || [];
    const markerOffsets = [[13, -18], [18, 2], [10, 20], [-22, 15], [-24, -10]];
    return `
      <section class="gamesense-tactical-card">
        <div class="gamesense-section-heading gamesense-map-heading"><span>Marked Tactical Map</span><strong>Map Location Info</strong></div>
        <div class="gamesense-map-view-tabs" role="tablist" aria-label="${escapeHtml(map.label)} tactical map layer">
          <button type="button" data-gamesense-map-view="locations" class="${isPlants ? "" : "active"}" aria-selected="${isPlants ? "false" : "true"}">Map Locations</button>
          <button type="button" data-gamesense-map-view="plants" class="${isPlants ? "active" : ""}" aria-selected="${isPlants ? "true" : "false"}">Spike Plant Hot Spots</button>
        </div>
        <div class="gamesense-map-tools" aria-label="Map zoom controls">
          <button type="button" data-gamesense-map-zoom="out" aria-label="Zoom out">-</button>
          <button type="button" data-gamesense-map-zoom="reset">Fit</button>
          <span data-gamesense-map-zoom-value>${Math.round(state.mapZoom * 100)}%</span>
          <button type="button" data-gamesense-map-zoom="in" aria-label="Zoom in">+</button>
        </div>
        <div class="gamesense-map-canvas-row ${isPlants ? "has-plant-legend" : ""}">
          <div class="gamesense-tactical-scroll ${state.mapZoom > 1 ? "is-zoomed" : ""}" data-gamesense-map-viewport tabindex="0" aria-label="Zoomable ${escapeHtml(map.label)} tactical map">
            <div class="gamesense-tactical-stage" data-gamesense-map-stage style="--map-zoom:${state.mapZoom};--map-width:${state.mapZoom * 100}%">
              <img src="${escapeHtml(map.layoutImage)}" alt="${escapeHtml(map.label)} tactical layout" loading="eager" draggable="false">
              ${markers.map((callout, index) => {
                if (!isPlants) return `<span class="gamesense-callout" style="--callout-x:${Number(callout.x)}%;--callout-y:${Number(callout.y)}%">${escapeHtml(callout.label)}</span>`;
                const siteIndex = markers.slice(0, index).filter(item => item.site === callout.site).length;
                const offset = markerOffsets[siteIndex % markerOffsets.length];
                const direction = callout.site === "B" ? -1 : 1;
                const plantKey = `${callout.site}${callout.number}`;
                return `<button type="button" class="gamesense-callout gamesense-plant-marker" data-gamesense-plant-key="${escapeHtml(plantKey)}" aria-label="Highlight ${escapeHtml(plantKey)} ${escapeHtml(callout.label)}" style="--callout-x:${Number(callout.x)}%;--callout-y:${Number(callout.y)}%;--marker-label-x:${offset[0] * direction}px;--marker-label-y:${offset[1]}px"><i></i><b>${escapeHtml(plantKey)}</b></button>`;
              }).join("")}
            </div>
          </div>
          ${isPlants ? `<aside class="gamesense-plant-legend" aria-label="${escapeHtml(map.label)} plant location rates">
            <strong>Active-season plant share</strong>
            ${(map.plantSpots || []).map(spot => {
              const plantKey = `${spot.site}${spot.number}`;
              return `<div class="gamesense-plant-row" data-gamesense-plant-key="${escapeHtml(plantKey)}">
                <i></i><b>${escapeHtml(plantKey)}</b><em>${spot.rate != null && Number.isFinite(Number(spot.rate)) ? `${Number(spot.rate).toFixed(2)}%` : "N/A"}</em><span>${escapeHtml(spot.label)}</span>
                <button type="button" class="gamesense-plant-preview-toggle" data-gamesense-plant-preview="${escapeHtml(plantKey)}" aria-expanded="false" aria-label="Show ${escapeHtml(plantKey)} in-game plant reference">+</button>
                <section class="gamesense-plant-preview" hidden>
                  ${spot.previewImage ? `<img src="${escapeHtml(spot.previewImage)}" alt="${escapeHtml(spot.previewLabel || spot.label)}" loading="lazy" referrerpolicy="no-referrer">` : `<div class="gamesense-plant-preview-unavailable">No verified in-game image is available for this spot.</div>`}
                  <div><strong>${escapeHtml(spot.previewLabel || spot.label)}</strong>${spot.previewSource ? `<a href="${escapeHtml(spot.previewSource)}" target="_blank" rel="noopener noreferrer">Image source</a>` : ""}</div>
                </section>
              </div>`;
            }).join("")}
            <p>${escapeHtml(map.plantRateNote || "Plant share is unavailable for this map.")}</p>
          </aside>` : ""}
        </div>
      </section>`;
  }

  function getMapTipsViewModel(map) {
    const roles = ["Duelist", "Initiator", "Controller", "Sentinel"];
    const activeRole = roles.includes(state.role) ? state.role : "";
    const categories = [
      { id: "attack", label: "Attack side" },
      { id: "defense", label: "Defense side" },
      { id: "sites", label: "Site-specific" },
      { id: "teamplay", label: "Teamplay strats" }
    ];
    const activeCategory = categories.some(item => item.id === state.tipView) ? state.tipView : "attack";
    const baseTips = activeCategory === "attack"
      ? map.macro?.attack || []
      : activeCategory === "defense"
        ? map.macro?.defense || []
        : activeCategory === "sites"
          ? map.siteTips || []
          : map.teamplayTips || [];
    const roleTips = activeRole
      ? (map.roleNotes?.[activeRole] || []).filter(item => typeof item === "string" || item.category === activeCategory)
      : [];
    const tips = [...baseTips, ...roleTips].filter(item => {
      const tipRoles = Array.isArray(item?.roles) ? item.roles : [];
      return !activeRole || !tipRoles.length || tipRoles.includes(activeRole);
    });
    return { roles, activeRole, categories, activeCategory, roleTips, tips };
  }

  function renderMapTipsPanel(model) {
    const { activeRole, activeCategory, categories, roleTips, tips } = model;
    return `
      <div class="gamesense-tips-panel" role="tabpanel">
        <div><span>${escapeHtml(categories.find(category => category.id === activeCategory)?.label || "Tips")}</span><strong>${activeRole ? `${escapeHtml(activeRole)} lens` : "All-role read"}</strong></div>
        <div class="gamesense-tip-grid">
          ${tips.map(item => {
            const text = typeof item === "string" ? item : item.text;
            const label = typeof item === "string" ? "Round read" : item.label || "Round read";
            const isRoleTip = Boolean(activeRole && roleTips.includes(item));
            return `<article class="gamesense-tip${isRoleTip ? " is-role-tip" : ""}"><span>${escapeHtml(isRoleTip ? activeRole : label)}</span><p>${escapeHtml(text)}</p></article>`;
          }).join("")}
        </div>
      </div>`;
  }

  function renderMapTips(map) {
    const model = getMapTipsViewModel(map);
    const { roles, activeRole, categories, activeCategory } = model;
    return `
      <section class="gamesense-tips-hub${activeRole ? " has-role-filter" : ""}"${activeRole ? ` data-role-tone="${activeRole.toLowerCase()}"` : ""}>
        <div class="gamesense-section-heading gamesense-tips-heading"><span>Tips</span><strong>${escapeHtml(map.label)} round plans</strong></div>
        <div class="gamesense-tips-tabs" role="tablist" aria-label="${escapeHtml(map.label)} tip categories">
          ${categories.map(category => `<button type="button" role="tab" data-gamesense-tip-view="${category.id}" class="${category.id === activeCategory ? "active" : ""}" aria-selected="${category.id === activeCategory}">${category.label}</button>`).join("")}
        </div>
        <details class="gamesense-tips-role-filter gamesense-role-lens-menu">
          <summary><span>Role lens</span><strong${activeRole ? ` data-role-tone="${activeRole.toLowerCase()}"` : ""}>${activeRole ? escapeHtml(activeRole) : "All roles"}</strong><i aria-hidden="true"></i></summary>
          <div class="gamesense-role-options">
            <button type="button" data-gamesense-role="all" class="${activeRole ? "" : "active"}" aria-pressed="${activeRole ? "false" : "true"}">All roles</button>
            ${roles.map(role => `<button type="button" data-gamesense-role="${role}" data-role-tone="${role.toLowerCase()}" class="${role === activeRole ? "active" : ""}" aria-pressed="${role === activeRole}">${role}</button>`).join("")}
          </div>
        </details>
        ${renderMapTipsPanel(model)}
      </section>`;
  }

  function renderWeaponSuggestions(map) {
    const suggestions = Array.isArray(map.weaponSuggestions) ? map.weaponSuggestions : [];
    if (!suggestions.length) return "";
    return `
      <section class="gamesense-weapon-suggestions">
        <div><span>Weapon Suggestions</span><strong>Highest-value choices by buy type</strong></div>
        <p class="gamesense-weapon-source">Round conversion percent uses the vstats active-season Competitive map and economy sample. Kills-per-round and average-damage context uses Blitz Competitive weapon stats.</p>
        <div class="gamesense-weapon-suggestion-grid">${suggestions.map(item => `
          <details class="gamesense-weapon-suggestion">
            <summary>
              <span class="gamesense-weapon-suggestion-top"><span aria-hidden="true"></span><span class="gamesense-weapon-fit">${escapeHtml(item.fit)}</span>${item.side ? `<b class="gamesense-weapon-side">${escapeHtml(item.side)}</b>` : `<span aria-hidden="true"></span>`}</span>
              <span class="gamesense-weapon-suggestion-art"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.weapon)}"><i aria-hidden="true"></i></span>
              <strong class="gamesense-weapon-suggestion-name">${escapeHtml(item.weapon)}</strong>
            </summary>
            <div class="gamesense-weapon-suggestion-detail">
              ${item.roundConversion ? `<section class="gamesense-round-conversion"><strong>${escapeHtml(item.roundConversion.scope)} round conversion percent: ${Number(item.roundConversion.value).toFixed(2)}%</strong><span>${escapeHtml(item.roundConversion.comparisonLabel)} ${escapeHtml(item.roundConversion.comparisonWeapon)}: ${Number(item.roundConversion.comparisonValue).toFixed(2)}% round conversion percent.</span><small>${escapeHtml(item.roundConversion.sample)}</small></section>` : `<section class="gamesense-round-conversion is-unavailable"><strong>Round conversion percent: unavailable</strong><span>${escapeHtml(item.roundConversionUnavailable || "No verified active-season map sample is available.")}</span></section>`}
              ${item.conversion ? `<em class="gamesense-conversion-read">${escapeHtml(item.conversion)}</em>` : ""}
              <p class="gamesense-weapon-evidence">${escapeHtml(item.evidence)}</p>
              <p class="gamesense-weapon-context">${escapeHtml(item.note)}</p>
            </div>
          </details>
        `).join("")}</div>
      </section>`;
  }

  function renderCompRolePickList(map, role = state.compRole) {
    const normalizedRole = ["Controller", "Duelist", "Initiator", "Sentinel"].includes(role) ? role : "Controller";
    const rows = (Array.isArray(map.rolePickRates) ? map.rolePickRates : [])
      .filter(item => item.role === normalizedRole)
      .sort((left, right) => Number(right.mapRate) - Number(left.mapRate));
    return `
      <div class="gamesense-comp-pick-list" data-role-tone="${normalizedRole.toLowerCase()}" role="tabpanel">
        ${rows.map((item, index) => {
          const difference = Number(item.mapRate) - Number(item.globalRate);
          const differenceClass = difference > .005 ? "is-above" : difference < -.005 ? "is-below" : "is-even";
          const differenceLabel = `${difference > 0 ? "+" : ""}${difference.toFixed(2)} pts vs global`;
          return `<article class="gamesense-comp-pick-row">
            <span class="gamesense-comp-pick-rank">${String(index + 1).padStart(2, "0")}</span>
            <img src="${escapeHtml(getAgentIcon(item.agent))}" data-agent-fallback="${escapeHtml(getAgentFallbackIcon(item.agent))}" alt="" loading="lazy">
            <strong>${escapeHtml(item.agent)}</strong>
            <span><b>${Number(item.mapRate).toFixed(2)}%</b><small>${escapeHtml(map.label)} pick</small></span>
            <span><b>${Number(item.globalRate).toFixed(2)}%</b><small>Global pick</small></span>
            <em class="${differenceClass}">${escapeHtml(differenceLabel)}</em>
          </article>`;
        }).join("")}
      </div>`;
  }

  function renderCompRolePickExplorer(map) {
    if (!Array.isArray(map.rolePickRates) || !map.rolePickRates.length) return "";
    const roles = ["Controller", "Duelist", "Initiator", "Sentinel"];
    const activeRole = roles.includes(state.compRole) ? state.compRole : "Controller";
    return `
      <details class="gamesense-comp-pick-explorer">
        <summary>WANT TO SEEALL ${escapeHtml(map.label.toUpperCase())} AGENT PICKRATES?</summary>
        <div class="gamesense-comp-pick-explorer-body">
          <p>Ascendant-to-Radiant Competitive picks from Patch ${escapeHtml(map.compSample?.patchLabel || "current")}. Map share and global share use the same combined patch window.</p>
          <div class="gamesense-comp-role-tabs" role="tablist" aria-label="${escapeHtml(map.label)} agent pick rates by role">
            ${roles.map(role => `<button type="button" data-gamesense-comp-role="${role}" data-role-tone="${role.toLowerCase()}" class="${role === activeRole ? "active" : ""}" aria-pressed="${role === activeRole}">${role}</button>`).join("")}
          </div>
          ${renderCompRolePickList(map, activeRole)}
        </div>
      </details>`;
  }

  function renderComp(map) {
    const rawComps = (Array.isArray(map.metaComps) && map.metaComps.length ? map.metaComps : [map.metaComp]).slice();
    const comps = getCompRoleLayoutReferences(map, rawComps);
    const hasCurrentSample = comps.length > 0;
    const selectedAgent = state.compAgent;
    const selectedInsight = selectedAgent ? map.agentInsights?.[selectedAgent] : "";
    const sample = map.compSample || {};
    const rankLabel = sample.rankLabel || "Ascendant to Radiant";
    const patchLabel = sample.patchLabel || map.metaComp?.patch || getReference().season?.patch || "Current";
    if (!hasCurrentSample) {
      return `
        <section class="gamesense-comp-card gamesense-comp-unavailable">
          <div><span>Current-Season Comps</span><strong class="gamesense-comp-patch">Patch ${escapeHtml(patchLabel)}</strong></div>
          <p>${escapeHtml(map.compStatus || "No verified current-season composition sample is available for this map.")}</p>
        </section>`;
    }
    return `
      <section class="gamesense-comp-card">
        <div><span>Current Competitive Comps</span><span class="gamesense-comp-scope"><b>${escapeHtml(rankLabel)}</b><strong class="gamesense-comp-patch">Patch ${escapeHtml(patchLabel)}</strong></span></div>
        <p class="gamesense-comp-source">${escapeHtml(sample.note || "High-rank Competitive pick shares are used as tactical composition references; no five-agent lineup win rate is claimed.")}</p>
        <div class="gamesense-comp-list">${comps.map((comp, index) => {
          const referenceLabels = ["Primary role layout", "Secondary role layout", "Alternate role layout"];
          const roleTotals = getCompRoleTotals(comp);
          return `
            <article class="gamesense-comp-option">
              <div class="gamesense-comp-rank"><span>#${index + 1}</span><strong><b class="gamesense-comp-reference-label">${escapeHtml(comp.label || referenceLabels[index] || "Tactical reference")}</b></strong></div>
              <div class="gamesense-comp-mobile-evidence" aria-label="Composition evidence availability">
                <span><b>Lineup win rate</b><strong>Not published</strong></span>
                <span><b>Round conversion</b><strong>Not published</strong></span>
              </div>
              <div class="gamesense-comp-line">
              <div class="gamesense-comp-agents">${(comp.agents || []).map(agent => `
                <button type="button" data-gamesense-comp-agent="${escapeHtml(agent)}" data-role-tone="${escapeHtml(compAgentRoles[assetSlug(agent)] || "")}" class="${selectedAgent === agent ? "active" : ""}" aria-pressed="${selectedAgent === agent ? "true" : "false"}">
                  <span class="gamesense-comp-agent-identity"><img src="${escapeHtml(getAgentIcon(agent))}" data-agent-fallback="${escapeHtml(getAgentFallbackIcon(agent))}" alt="" loading="eager"><strong>${escapeHtml(agent)}</strong></span>
                  <span class="gamesense-comp-agent-rate"><b>${getCompAgentPickRate(map, agent) === null ? "N/A" : `${getCompAgentPickRate(map, agent).toFixed(2)}%`}</b><small>${escapeHtml(map.label)} pick</small></span>
                </button>
              `).join("")}</div>
              <div class="gamesense-comp-role-summary">
                <div class="gamesense-comp-role-summary-label"><span>Role layout</span><small>Most common high-rank structure</small></div>
                <div class="gamesense-comp-makeup" role="img" aria-label="${escapeHtml(comp.composition)}">${roleTotals.map(item => `<span class="gamesense-comp-role-stat"><i data-role-tone="${escapeHtml(item.role)}" aria-hidden="true"></i><span><b>${item.count}</b><small>${escapeHtml(item.role)}${item.count === 1 ? "" : "s"}</small></span></span>`).join("")}</div>
              </div>
            </div>
          </article>`;
        }).join("")}</div>
        ${selectedInsight ? `<div class="gamesense-comp-agent-read"><strong>${escapeHtml(selectedAgent)}</strong><p>${escapeHtml(selectedInsight)}</p></div>` : `<p class="gamesense-comp-prompt">Select an agent to see why the pick succeeds on ${escapeHtml(map.label)}.</p>`}
        ${renderCompRolePickExplorer(map)}
      </section>`;
  }

  function getLineupBrand(link = {}) {
    const hostname = (() => {
      try { return new URL(link.url, window.location.href).hostname.toLowerCase(); }
      catch (_error) { return ""; }
    })();
    if (hostname.includes("lineupsvalorant.com")) {
      return { name: "LineupsValorant", logo: "https://lineupsvalorant.com/static/general%20images/icon.png" };
    }
    if (hostname.includes("upforge.gg")) {
      return { name: "UpForge", logo: "https://upforge.gg/images/logo-icon.webp" };
    }
    return { name: link.label || "Lineup site", logo: "" };
  }

  function renderLineupLink(link) {
    const brand = getLineupBrand(link);
    return `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${brand.logo ? `<img src="${escapeHtml(brand.logo)}" alt="">` : ""}<span>${escapeHtml(link.label || brand.name)}</span></a>`;
  }

  function renderMapDetail(map) {
    return `
      <div class="gamesense-detail-head gamesense-map-detail-head">
        <div><span>Map Dossier</span><h2>${escapeHtml(map.label)}</h2>${map.inCompetitivePool === false ? `<small class="gamesense-map-season-status">Out of Season</small>` : ""}</div>
        <div class="gamesense-map-detail-actions"><span class="gamesense-patch">As of Patch ${escapeHtml(map.metaComp?.patch)}</span><button class="gamesense-back" type="button" data-gamesense-back="maps">Back to maps</button></div>
      </div>
      <div class="gamesense-detail-grid">
        ${renderMapTips(map)}
        ${renderComp(map)}
        ${renderWeaponSuggestions(map)}
        <section class="gamesense-lineups">
          <div><span>Find Lineups</span></div>
          <div>${(map.lineupLinks || []).map(renderLineupLink).join("")}</div>
        </section>
      </div>
      ${renderMarkedMap(map)}`;
  }

  function renderStatChips(stats = {}) {
    return `<dl class="gamesense-stat-chips">${Object.entries(stats).map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
  }

  function renderAbilityDetail(agent, ability) {
    if (!ability) return "";
    return `
      <article class="gamesense-fact-panel gamesense-ability-panel">
        <div class="gamesense-fact-panel-head"><img src="${escapeHtml(ability.icon)}" alt=""><div><span>${escapeHtml(ability.slot)}</span><h3>${escapeHtml(ability.name)}</h3></div></div>
        <p>${escapeHtml(ability.summary)}</p>
        ${renderStatChips(ability.stats)}
        <div class="gamesense-fact-read"><section><span>Round purpose</span><p>${escapeHtml(ability.purpose)}</p></section><section><span>Setup and difficulty</span><p>${escapeHtml(ability.setup)}</p></section></div>
      </article>`;
  }

  function renderAgentLoreHistory(agent) {
    const history = sortPatchHistoryNewestFirst(Array.isArray(agent.patchHistory) ? agent.patchHistory : []);
    const lore = Array.isArray(agent.lore) ? agent.lore : [];
    return `
      <section class="gamesense-note-block gamesense-agent-facts gamesense-agent-lore-history">
        <h3>Lore and History</h3>
        <div class="gamesense-agent-fact-list">
          ${lore.map(item => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><p>${escapeHtml(item.note || "")}</p></article>`).join("")}
        </div>
        <details class="gamesense-patch-history">
          <summary>Gameplay history</summary>
          <ol>${history.map(item => `<li><span>Patch ${escapeHtml(item.patch)}</span><p>${escapeHtml(item.note)}</p>${item.source ? `<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">Riot patch notes</a>` : ""}</li>`).join("")}</ol>
        </details>
      </section>`;
  }

  function renderAgentDetail(agent) {
    const abilities = agent.abilities || [];
    const selected = abilities.find(ability => ability.id === state.detailId) || abilities[0];
    return `
      <div class="gamesense-detail-head gamesense-agent-detail-head">
        <div><span>${escapeHtml(agent.role)} Field Guide</span><h2>${escapeHtml(agent.label)}</h2></div>
        <div class="gamesense-agent-detail-actions"><span class="gamesense-patch">Active season</span><button class="gamesense-back" type="button" data-gamesense-back="agents">Back to agents</button></div>
      </div>
      <section class="gamesense-agent-hero">
        <div class="gamesense-agent-portrait-wrap">
          <div class="gamesense-agent-rate">
            <span class="gamesense-agent-rate-label">Global Pick Rate</span>
            <span class="gamesense-agent-rate-value"><strong>${safePercent(agent.pickRate)}</strong><b>Rank #${Number.isFinite(Number(agent.pickRateRank)) ? Number(agent.pickRateRank) : "Unavailable"}</b></span>
            <small>${escapeHtml(agent.sampleLabel || "Tracker Network | Past two weeks")}</small>
          </div>
          <img src="${escapeHtml(agent.portrait)}" alt="${escapeHtml(agent.label)}" loading="eager">
        </div>
        <div>${renderList("Agent Fundamentals", agent.fundamentals)}${renderAgentLoreHistory(agent)}</div>
      </section>
      <section class="gamesense-selector-section">
        <div class="gamesense-section-heading"><span>Ability Analysis</span><strong>Select an ability</strong></div>
        <div class="gamesense-ability-grid">${abilities.map(ability => `
          <button type="button" data-gamesense-ability="${escapeHtml(ability.id)}" class="${ability.id === selected?.id ? "active" : ""}" aria-pressed="${ability.id === selected?.id}"><img src="${escapeHtml(ability.icon)}" alt=""><span>${escapeHtml(ability.name)}</span><small>${escapeHtml(ability.slot)}</small></button>
        `).join("")}</div>
        ${renderAbilityDetail(agent, selected)}
      </section>
      <section class="gamesense-comp-card gamesense-map-fit">
        <div><span>Map Fit</span><strong>Tracker Network | Past two weeks</strong></div>
        <div class="gamesense-map-fit-grid">${agent.maps.slice(0, 3).map(mapName => {
          const normalizedMapName = assetSlug(mapName);
          const map = getMaps().find(item => item.id === normalizedMapName || assetSlug(item.label) === normalizedMapName);
           const winRate = agent.mapWinRates?.[mapName];
          const pickRate = agent.mapPickRates?.[mapName];
          const tagName = map ? "button" : "article";
          const action = map ? ` type="button" data-gamesense-open="maps" data-gamesense-item-target="${escapeHtml(map.id)}"` : "";
          return `<${tagName} class="gamesense-map-fit-item"${action}><img src="${escapeHtml(getMapArtwork(mapName))}" alt="" loading="lazy"><span>${escapeHtml(mapName)}</span><div><strong>${Number.isFinite(Number(pickRate)) ? `${Number(pickRate).toFixed(2)}% pick` : "Pick pending"}</strong><strong>${Number.isFinite(Number(winRate)) ? `${Number(winRate).toFixed(2)}% win` : "Win pending"}</strong></div></${tagName}>`;
        }).join("")}</div>
      </section>`;
  }

  function safePercent(value) {
    return Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : "Pending";
  }

  function renderDamageTable(weapon) {
    return `
      <div class="gamesense-damage-table" role="table" aria-label="${escapeHtml(weapon.label)} damage by range">
        <div role="row"><strong>Range</strong><strong>Head</strong><strong>Body</strong><strong>Legs</strong></div>
        ${(weapon.damageRanges || []).map(range => `<div role="row"><span>${escapeHtml(range.range)}</span><span>${range.head}</span><span>${range.body}</span><span>${range.legs}</span></div>`).join("")}
      </div>`;
  }

  function renderWeaponFact(weapon) {
    if (!weapon) return "";
    return `
      <article class="gamesense-fact-panel gamesense-weapon-panel">
        <div class="gamesense-weapon-panel-art"><img src="${escapeHtml(weapon.image)}" alt="${escapeHtml(weapon.label)}"></div>
        <div class="gamesense-weapon-panel-copy"><span>Weapon Analysis</span><h3>${escapeHtml(weapon.label)}</h3><div class="gamesense-global-rate"><strong>Global usage ${safePercent(weapon.pickRate)}</strong><strong>Global kill conversion ${Number.isFinite(weapon.killConversion) ? `${weapon.killConversion.toFixed(2)} K/D` : "Unavailable"}</strong><strong>Global round conversion ${escapeHtml(weapon.roundConversion || "Unavailable")}</strong></div><p>${escapeHtml(weapon.focus)}</p></div>
        ${renderStatChips({ Cost: `${weapon.cost} credits`, Magazine: `${weapon.magazine}`, "Fire rate": weapon.fireRate, Penetration: weapon.penetration })}
        ${renderDamageTable(weapon)}
        <div class="gamesense-weapon-guidance">
          <section><span>When to use it</span><ul>${(weapon.whenToUse || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <section><span>How to use it</span><ul>${(weapon.howToUse || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
        </div>
        <details class="gamesense-patch-history gamesense-weapon-history">
          <summary>Patch history</summary>
          <ol>${sortPatchHistoryNewestFirst(weapon.patchHistory || []).map(item => `<li><span>${escapeHtml(item.patch.startsWith("Patch") ? item.patch : `Patch ${item.patch}`)}</span><p>${escapeHtml(item.note)}</p>${item.source ? `<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">Riot source</a>` : ""}</li>`).join("")}</ol>
        </details>
      </article>`;
  }

  function renderWeaponCollectionArchive(weapon, collections = null, loadError = "") {
    if (!weapon) return "";
    const tierOrder = new Map(["select", "deluxe", "premium", "exclusive", "ultra"].map((tier, index) => [tier, index]));
    const tierFilters = [...new Map((collections || []).filter(item => item.editionKey).map(item => [item.editionKey, item])).values()]
      .sort((left, right) => (tierOrder.get(left.editionKey) ?? 99) - (tierOrder.get(right.editionKey) ?? 99));
    const count = Array.isArray(collections) ? collections.length : 0;
    return `
      <section class="gamesense-collection-archive" data-gamesense-collection-weapon="${escapeHtml(weapon.id)}">
        <div class="gamesense-collection-head">
          <div><span>Historical Reference</span><h3>${escapeHtml(weapon.label)} Skin Collection Archive</h3></div>
          <p>${count ? `${count} exact ${escapeHtml(weapon.label)} weapon previews.` : `Loading every available ${escapeHtml(weapon.label)} collection.`} Riot edition is the official content tier, not a community review score.</p>
        </div>
        ${loadError ? `<div class="gamesense-collection-status is-error"><strong>Skin archive unavailable.</strong><span>${escapeHtml(loadError)}</span><button type="button" data-gamesense-collection-retry="${escapeHtml(weapon.id)}">Try again</button></div>` : !collections ? `<div class="gamesense-collection-status" aria-live="polite"><span class="gamesense-collection-loader" aria-hidden="true"></span><strong>Loading ${escapeHtml(weapon.label)} collections...</strong></div>` : `
          <div class="gamesense-collection-filters" role="group" aria-label="Filter ${escapeHtml(weapon.label)} collections by Riot edition">
            <button type="button" class="active" data-gamesense-collection-filter="all" aria-pressed="true"><span class="gamesense-tier-icon-stack" aria-hidden="true">${tierFilters.map(item => item.editionIcon ? `<img src="${escapeHtml(item.editionIcon)}" alt="">` : "").join("")}</span><span>All ${count}</span></button>
            ${tierFilters.map(item => `<button type="button" data-gamesense-collection-filter="${escapeHtml(item.editionKey)}" aria-pressed="false">${item.editionIcon ? `<img class="gamesense-tier-icon" src="${escapeHtml(item.editionIcon)}" alt="" aria-hidden="true">` : ""}<span>${escapeHtml(item.edition)}</span></button>`).join("")}
          </div>
          <div class="gamesense-collection-grid">
            ${collections.map(item => `<article class="gamesense-collection-card" data-gamesense-collection-tier="${escapeHtml(item.editionKey)}">
              <button class="gamesense-collection-art" type="button" data-gamesense-collection-preview data-preview-id="${escapeHtml(item.id)}" data-preview-src="${escapeHtml(item.previewImage || item.image)}" data-preview-name="${escapeHtml(item.name)}" data-preview-weapon="${escapeHtml(item.weaponName)}" aria-label="Open ${escapeHtml(item.name)} ${escapeHtml(item.weaponName)} interactive preview">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)} ${escapeHtml(item.weaponName)} skin" loading="lazy">
                <span>Open interactive preview</span>
              </button>
              <button class="gamesense-collection-copy" type="button" data-gamesense-collection-preview data-preview-id="${escapeHtml(item.id)}" data-preview-src="${escapeHtml(item.previewImage || item.image)}" data-preview-name="${escapeHtml(item.name)}" data-preview-weapon="${escapeHtml(item.weaponName)}" aria-label="Open ${escapeHtml(item.name)} ${escapeHtml(item.weaponName)} interactive preview details">
                <span>${escapeHtml(item.weaponName)} skin</span>
                <h4>${escapeHtml(item.name)}</h4>
                <div class="gamesense-collection-meta"><b>${escapeHtml(item.edition)} Riot edition</b><b>${item.variants?.length || item.views?.length || 1} verified color ${(item.variants?.length || item.views?.length || 1) === 1 ? "variant" : "variants"}</b></div>
              </button>
            </article>`).join("")}
          </div>`}
      </section>`;
  }

  function renderWeaponDetail(group) {
    const weapons = group.weapons || [];
    const selected = weapons.find(weapon => weapon.id === state.detailId) || weapons[0];
    return `
      <div class="gamesense-detail-head gamesense-weapon-detail-head">
        <div><span>Weapon Dossier</span><h2>${escapeHtml(group.label)}</h2></div>
        <div class="gamesense-weapon-detail-actions"><span class="gamesense-patch">As of Patch ${escapeHtml(getReference().season?.patch || "Current")}</span><button class="gamesense-back" type="button" data-gamesense-back="weapons">Back to weapons</button></div>
      </div>
      <section class="gamesense-selector-section">
        <div class="gamesense-section-heading"><span>Arsenal</span><strong>Select a weapon</strong></div>
        <div class="gamesense-weapon-grid">${weapons.map(weapon => `
          <button type="button" data-gamesense-weapon="${escapeHtml(weapon.id)}" class="${weapon.id === selected?.id ? "active" : ""}" aria-pressed="${weapon.id === selected?.id}"><img src="${escapeHtml(weapon.image)}" alt=""><span>${escapeHtml(weapon.label)}</span><small>${weapon.cost} credits</small></button>
        `).join("")}</div>
        ${renderWeaponFact(selected)}
      </section>
      ${renderWeaponCollectionArchive(selected, getWeaponCollectionProvider()?.getCached(selected?.label), collectionLoadErrors.get(selected?.label) || "")}`;
  }

  function getSelectedWeapon() {
    if (state.topic !== "weapons" || !state.itemId) return null;
    const group = getReference().weapons?.find(item => item.id === state.itemId);
    return group?.weapons?.find(item => item.id === state.detailId) || group?.weapons?.[0] || null;
  }

  function replaceWeaponCollectionArchive(weapon, collections = null, loadError = "") {
    const archive = document.querySelector("#gamesenseLibraryView .gamesense-collection-archive");
    if (!archive || !weapon || getSelectedWeapon()?.id !== weapon.id) return null;
    return replaceTargetedElement(archive, renderWeaponCollectionArchive(weapon, collections, loadError));
  }

  function hydrateWeaponCollectionArchive(weapon = getSelectedWeapon(), options = {}) {
    const provider = getWeaponCollectionProvider();
    if (!weapon || !provider) return;
    const cached = provider.getCached(weapon.label);
    if (cached) {
      collectionLoadErrors.delete(weapon.label);
      replaceWeaponCollectionArchive(weapon, cached);
      return;
    }
    if (options.retry) {
      collectionLoadErrors.delete(weapon.label);
      replaceWeaponCollectionArchive(weapon);
    }
    provider.loadForWeapon(weapon.label).then(collections => {
      if (getSelectedWeapon()?.id !== weapon.id) return;
      collectionLoadErrors.delete(weapon.label);
      replaceWeaponCollectionArchive(weapon, collections);
    }).catch(error => {
      if (getSelectedWeapon()?.id !== weapon.id) return;
      const message = String(error?.message || "The live collection catalog could not be reached.");
      collectionLoadErrors.set(weapon.label, message);
      replaceWeaponCollectionArchive(weapon, null, message);
    });
  }

  function closeSkinPreview() {
    const overlay = activeSkinPreview;
    if (!overlay) return;
    activeSkinPreview = null;
    activeSkinViewIndex = 0;
    activeSkinVideoIndex = 0;
    overlay.querySelectorAll("iframe").forEach(frame => frame.removeAttribute("src"));
    overlay.querySelectorAll("video").forEach(video => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    });
    overlay.classList.remove("is-open");
    overlay.classList.add("is-closing");
    window.setTimeout(() => overlay.remove(), 220);
  }

  function getSkinPreviewItem(trigger) {
    const weapon = String(trigger?.dataset?.previewWeapon || "Weapon").trim();
    const id = String(trigger?.dataset?.previewId || "").trim();
    const cached = getWeaponCollectionProvider()?.getCached(weapon) || [];
    const item = cached.find(collection => collection.id === id);
    if (item) return item;
    const source = String(trigger?.dataset?.previewSrc || "").trim();
    const name = String(trigger?.dataset?.previewName || "Weapon skin").trim();
    const model = getWeaponCollectionProvider()?.getSketchfabModel?.(name, weapon, 0) || null;
    return {
      id,
      name,
      weaponName: weapon,
      previewImage: source,
      variants: source ? [{ id: `${id}-variant-1`, source, label: "Default variant", video: "", sketchfabModel: model }] : [],
      views: source ? [{ id: `${id}-variant-1`, source, label: "Default variant", video: "", sketchfabModel: model }] : [],
      upgradeVideos: [],
      sketchfabModel: model,
      bundleVideo: null
    };
  }

  function toRomanNumeral(value = 1) {
    let remaining = Math.max(1, Math.min(99, Math.floor(Number(value) || 1)));
    const numerals = [[50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
    return numerals.reduce((result, [amount, symbol]) => {
      while (remaining >= amount) {
        result += symbol;
        remaining -= amount;
      }
      return result;
    }, "");
  }

  function getApprovedSkinVideoUrl(value = "") {
    try {
      const url = new URL(String(value));
      const approvedHosts = new Set(["media.valorant-api.com", "valorant.dyn.riotcdn.net"]);
      return url.protocol === "https:" && approvedHosts.has(url.hostname) && /\.mp4$/i.test(url.pathname) ? url.href : "";
    } catch (_error) {
      return "";
    }
  }

  function getSkinPreviewVideos(item, variants) {
    const videos = [];
    const seen = new Map();
    const addVideo = (entry, kind, ordinal, poster = "") => {
      const video = getApprovedSkinVideoUrl(entry?.video);
      if (!video) return -1;
      if (seen.has(video)) return seen.get(video);
      const index = videos.length;
      videos.push({
        id: String(entry?.id || `${kind}-${index + 1}`),
        kind,
        label: String(entry?.label || `${kind === "level" ? "Upgrade" : "Variant"} ${index + 1}`).trim(),
        displayLabel: `${kind === "level" ? "Level" : "Variant"} ${toRomanNumeral(ordinal + 1)}`,
        poster: String(poster || item?.previewImage || variants[0]?.source || "").trim(),
        video
      });
      seen.set(video, index);
      return index;
    };
    (item?.upgradeVideos || []).forEach((level, index) => addVideo(level, "level", index));
    const directVariantIndexes = variants.map((variant, index) => addVideo(variant, "variant", index, variant.source));
    const fallbackIndex = [...(item?.upgradeVideos || []).keys()]
      .map(index => seen.get(getApprovedSkinVideoUrl(item.upgradeVideos[index]?.video)))
      .filter(index => Number.isInteger(index))
      .at(-1) ?? (videos.length ? 0 : -1);
    const variantIndexes = directVariantIndexes.map(index => index >= 0 ? index : fallbackIndex);
    return { videos, variantIndexes, directVariantIndexes };
  }

  function setActiveSkinView(nextIndex) {
    const overlay = activeSkinPreview;
    if (!overlay) return;
    const selectors = [...overlay.querySelectorAll("[data-skin-preview-view]")];
    const count = selectors.length;
    if (!count) return;
    activeSkinViewIndex = ((Number(nextIndex) % count) + count) % count;
    const active = selectors[activeSkinViewIndex];
    const image = overlay.querySelector("[data-skin-preview-image]");
    const label = overlay.querySelector("[data-skin-preview-label]");
    if (image) {
      image.src = active.dataset.skinPreviewSource || image.src;
      image.alt = active.dataset.skinPreviewAlt || image.alt;
    }
    if (label) label.textContent = `Variant ${toRomanNumeral(activeSkinViewIndex + 1)} of ${toRomanNumeral(count)}`;
    selectors.forEach((selector, index) => {
      const isActive = index === activeSkinViewIndex;
      selector.classList.toggle("active", isActive);
      selector.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function setActiveSkinModel(overlay, variant, name, weapon) {
    const model = /^[a-f0-9]{32}$/i.test(String(variant?.sketchfabModel?.id || "")) ? variant.sketchfabModel : null;
    const stage = overlay?.querySelector(".gamesense-skin-model-stage");
    const kicker = overlay?.querySelector("[data-skin-model-kicker]");
    const guidance = overlay?.querySelector("[data-skin-model-guidance]");
    const footer = overlay?.querySelector("[data-skin-model-footer]");
    const card = overlay?.querySelector(".gamesense-skin-preview-card");
    if (!stage || !footer || !card) return;
    card.classList.toggle("has-true-model", Boolean(model));
    card.classList.toggle("has-static-render", !model);
    stage.classList.toggle("has-model", Boolean(model));
    stage.classList.toggle("is-static", !model);
    if (kicker) kicker.textContent = model ? "True 3D Model" : "Official Weapon Render";
    if (guidance) guidance.textContent = model
      ? "Drag to rotate. Scroll or pinch to zoom."
      : "No approved exact 3D model is available for this color variant yet.";
    if (model) {
      stage.innerHTML = `<iframe src="${escapeHtml(model.embedUrl)}" title="Interactive 3D model of ${escapeHtml(model.title)} by ${escapeHtml(model.creator)}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; xr-spatial-tracking"></iframe>`;
      footer.innerHTML = `<span>Community model attribution</span><strong>${escapeHtml(model.title)}</strong><small>Created by ${escapeHtml(model.creator)} · <a href="${escapeHtml(model.modelUrl)}" target="_blank" rel="noopener noreferrer">View on Sketchfab</a> · <a href="${escapeHtml(model.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(model.license)}</a></small>`;
      return;
    }
    const count = overlay.querySelectorAll("[data-skin-preview-view]").length || 1;
    const index = Math.max(0, activeSkinViewIndex);
    const searchUrl = `https://sketchfab.com/search?type=models&q=${encodeURIComponent(`${name} ${weapon} Valorant`)}`;
    stage.innerHTML = `<img data-skin-preview-image src="${escapeHtml(variant?.source || "")}" alt="${escapeHtml(name)} ${escapeHtml(weapon)} ${escapeHtml(variant?.label || `variant ${index + 1}`)}"><span class="gamesense-skin-model-unavailable">Static render — exact 3D unavailable</span>`;
    footer.innerHTML = `<span>${escapeHtml(weapon)} collection</span><strong>${escapeHtml(name)}</strong><small data-skin-preview-label>Variant ${toRomanNumeral(index + 1)} of ${toRomanNumeral(count)} · <a href="${escapeHtml(searchUrl)}" target="_blank" rel="noopener noreferrer">Search Sketchfab references</a></small>`;
  }

  function setActiveSkinVideo(nextIndex, sourceSelector = null) {
    const overlay = activeSkinPreview;
    if (!overlay) return;
    const selectors = [...overlay.querySelectorAll("[data-skin-preview-video-option]")];
    const selected = sourceSelector?.matches?.("[data-skin-preview-video-option]")
      ? sourceSelector
      : selectors.find(selector => Number(selector.dataset.skinPreviewVideoOption) === Number(nextIndex));
    const video = overlay.querySelector("[data-skin-preview-video]");
    if (!selected || !video) return;
    activeSkinVideoIndex = Number(nextIndex);
    const nextSource = selected.dataset.skinPreviewVideoSource || "";
    const nextPoster = selected.dataset.skinPreviewVideoPoster || "";
    const sourceChanged = Boolean(nextSource && video.src !== nextSource);
    const posterChanged = Boolean(nextPoster && video.poster !== nextPoster);
    if (sourceChanged) video.src = nextSource;
    if (posterChanged) video.poster = nextPoster;
    if (sourceChanged || posterChanged) {
      video.load();
      video.play().catch(() => { /* Player controls remain available when autoplay is blocked. */ });
    }
    const label = overlay.querySelector("[data-skin-preview-video-label]");
    if (label) label.textContent = selected.dataset.skinPreviewVideoLabel || "Skin animation";
    const detail = overlay.querySelector("[data-skin-preview-video-detail]");
    if (detail) detail.textContent = selected.dataset.skinPreviewVideoDetail || "Animation supplied by Riot data used by val-skins.";
    selectors.forEach(selector => {
      const isActive = Number(selector.dataset.skinPreviewVideoOption) === activeSkinVideoIndex
        && (!selector.hasAttribute("data-skin-preview-view") || selector === selected);
      selector.classList.toggle("is-video-active", isActive);
      if (!selector.hasAttribute("data-skin-preview-view")) selector.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function openSkinPreview(trigger) {
    const item = getSkinPreviewItem(trigger);
    const name = String(item?.name || "Weapon skin").trim();
    const weapon = String(item?.weaponName || "Weapon").trim();
    const variants = (item?.variants || item?.views || []).filter(variant => variant?.source);
    const { videos: previewVideos, variantIndexes: variantVideoIndexes, directVariantIndexes } = getSkinPreviewVideos(item, variants);
    const model = /^[a-f0-9]{32}$/i.test(String(variants[0]?.sketchfabModel?.id || item?.sketchfabModel?.id || ""))
      ? (variants[0]?.sketchfabModel || item.sketchfabModel)
      : null;
    const approvedChannels = new Set(["VALORANT", "Dittozkul"]);
    const requestedVideoId = String(item?.bundleVideo?.id || "");
    const videoId = approvedChannels.has(item?.bundleVideo?.channel) && /^[a-zA-Z0-9_-]{11}$/.test(requestedVideoId) ? requestedVideoId : "";
    const playlistId = item?.bundleVideo?.channel === "VALORANT" && /^[a-zA-Z0-9_-]{34}$/.test(String(item?.bundleVideo?.playlistId || ""))
      ? String(item.bundleVideo.playlistId)
      : "";
    const sketchfabSearchUrl = `https://sketchfab.com/search?type=models&q=${encodeURIComponent(`${name} ${weapon} Valorant`)}`;
    if (!variants.length) return;
    closeSkinPreview();
    activeSkinViewIndex = 0;
    activeSkinVideoIndex = 0;
    const overlay = document.createElement("div");
    overlay.className = "gamesense-skin-preview-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", `${name} ${weapon} interactive preview`);
    overlay.tabIndex = -1;
    overlay.innerHTML = `
      <div class="gamesense-skin-preview-card${videoId ? " has-secondary-video" : " is-primary-only"}${model ? " has-true-model" : " has-static-render"}">
        <section class="gamesense-skin-viewer-pane">
          <header><div><span data-skin-model-kicker>${model ? "True 3D Model" : "Official Weapon Render"}</span><strong>${escapeHtml(name)} ${escapeHtml(weapon)}</strong><small data-skin-model-guidance>${model ? "Drag to rotate. Scroll or pinch to zoom." : "No approved exact 3D model is available for this color variant yet."}</small></div></header>
          <div class="gamesense-skin-model-stage${model ? " has-model" : " is-static"}">
            ${model ? `<iframe src="${escapeHtml(model.embedUrl)}" title="Interactive 3D model of ${escapeHtml(model.title)} by ${escapeHtml(model.creator)}" loading="eager" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; fullscreen; xr-spatial-tracking" allowfullscreen></iframe>` : `<img data-skin-preview-image src="${escapeHtml(variants[0].source)}" alt="${escapeHtml(name)} ${escapeHtml(weapon)} ${escapeHtml(variants[0].label || "default variant")}"><span class="gamesense-skin-model-unavailable">Static render — 3D unavailable</span>`}
          </div>
          <footer data-skin-model-footer>${model ? `<span>Community model attribution</span><strong>${escapeHtml(model.title)}</strong><small>Created by ${escapeHtml(model.creator)} · <a href="${escapeHtml(model.modelUrl)}" target="_blank" rel="noopener noreferrer">View on Sketchfab</a> · <a href="${escapeHtml(model.licenseUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(model.license)}</a></small>` : `<span>${escapeHtml(weapon)} collection</span><strong>${escapeHtml(name)}</strong><small data-skin-preview-label>Variant I of ${toRomanNumeral(variants.length)} · <a href="${escapeHtml(sketchfabSearchUrl)}" target="_blank" rel="noopener noreferrer">Search Sketchfab references</a></small>`}</footer>
        </section>
        <div class="gamesense-skin-preview-divider" aria-hidden="true"></div>
        <section class="gamesense-skin-media-pane${videoId ? " has-secondary-video" : ""}">
          <div class="gamesense-skin-media-pages">
          <article class="gamesense-skin-animation-preview is-active" data-skin-media-page="0">
            <header><span>Skin Animation</span><strong data-skin-preview-video-label>${escapeHtml(previewVideos[0]?.displayLabel || `${name} preview`)}</strong><small data-skin-preview-video-detail>Animation supplied by Riot data used by val-skins.</small></header>
            <div class="gamesense-skin-animation-frame">${previewVideos.length ? `<video data-skin-preview-video src="${escapeHtml(previewVideos[0].video)}" poster="${escapeHtml(previewVideos[0].poster)}" controls autoplay muted playsinline preload="metadata"></video>` : `<div class="gamesense-skin-video-unavailable"><strong>No animation published</strong><span>This skin does not include a streamed level or variant preview.</span></div>`}</div>
            <div class="gamesense-skin-option-groups">
              ${(item?.upgradeVideos || []).some(level => getApprovedSkinVideoUrl(level.video)) ? `<section><span>Upgrade levels</span><div role="group" aria-label="Choose a ${escapeHtml(name)} upgrade animation">${(item.upgradeVideos || []).map((level, levelIndex) => {
                const index = previewVideos.findIndex(video => video.video === getApprovedSkinVideoUrl(level.video));
                const roman = toRomanNumeral(levelIndex + 1);
                return index < 0 ? "" : `<button type="button" class="${index === 0 ? "is-video-active" : ""}" data-skin-preview-video-option="${index}" data-skin-preview-video-source="${escapeHtml(previewVideos[index].video)}" data-skin-preview-video-poster="${escapeHtml(previewVideos[index].poster)}" data-skin-preview-video-label="Level ${roman}" data-skin-preview-video-detail="Level-specific animation supplied by Riot data used by val-skins." aria-label="Play ${escapeHtml(level.label)}" title="${escapeHtml(level.label)}" aria-pressed="${index === 0 ? "true" : "false"}">${roman}</button>`;
              }).join("")}</div></section>` : ""}
              <section><span>Color variants</span><div class="gamesense-skin-view-selectors" role="group" aria-label="Choose a ${escapeHtml(name)} color variant">
                ${variants.map((variant, index) => {
                  const roman = toRomanNumeral(index + 1);
                  const videoIndex = variantVideoIndexes[index];
                  const hasDirectVideo = directVariantIndexes[index] >= 0;
                  const videoLabel = hasDirectVideo ? `Variant ${roman}` : `Shared ${previewVideos[videoIndex]?.displayLabel || "animation"}`;
                  const videoDetail = hasDirectVideo
                    ? "Color-specific animation supplied by Riot data used by val-skins."
                    : "Shared level animation; this color has no separate val-skins/Riot clip.";
                  return `<button type="button" class="${index === 0 ? "active" : ""}${videoIndex === 0 ? " is-video-active" : ""}" data-skin-preview-view="${index}" data-skin-preview-source="${escapeHtml(variant.source)}" data-skin-view-label="Variant ${roman}" data-skin-preview-alt="${escapeHtml(name)} ${escapeHtml(weapon)} ${escapeHtml(variant.label || `variant ${index + 1}`)}"${videoIndex >= 0 ? ` data-skin-preview-video-option="${videoIndex}" data-skin-preview-video-source="${escapeHtml(previewVideos[videoIndex].video)}" data-skin-preview-video-poster="${escapeHtml(variant.source || previewVideos[videoIndex].poster)}" data-skin-preview-video-label="${escapeHtml(videoLabel)}" data-skin-preview-video-detail="${escapeHtml(videoDetail)}" data-skin-preview-video-direct="${hasDirectVideo ? "true" : "false"}"` : ""} aria-label="Show ${escapeHtml(variant.label || `variant ${index + 1}`)}" title="${escapeHtml(variant.label || `Variant ${index + 1}`)}" aria-pressed="${index === 0 ? "true" : "false"}"><span class="gamesense-skin-variant-thumb">${variant.swatch ? `<img class="gamesense-skin-variant-swatch" src="${escapeHtml(variant.swatch)}" alt="">` : ""}<img src="${escapeHtml(variant.source)}" alt=""></span><span class="gamesense-skin-variant-index">${roman}</span></button>`;
                }).join("")}
              </div></section>
            </div>
          </article>
          ${videoId ? `<article class="gamesense-skin-video-pane" data-skin-media-page="1" hidden>
            <header><span>Collection Video</span><strong>${escapeHtml(item.bundleVideo.title)}</strong><small>${escapeHtml(item.bundleVideo.channel)}${item.bundleVideo.channel === "VALORANT" ? " official SKINS playlist" : " approved fallback"}</small></header>
            <div class="gamesense-skin-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(videoId)}?rel=0&amp;playsinline=1${playlistId ? `&amp;list=${escapeHtml(playlistId)}` : ""}" title="${escapeHtml(item.bundleVideo.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
          </article>` : ""}
          </div>
          ${videoId ? `<nav class="gamesense-skin-media-pagination" aria-label="Choose weapon skin video">
            <button type="button" class="is-active" data-skin-media-page-button="0" aria-label="Show skin animation" aria-pressed="true"></button>
            <button type="button" data-skin-media-page-button="1" aria-label="Show collection video" aria-pressed="false"></button>
          </nav>` : ""}
        </section>
        <p class="gamesense-skin-preview-dismiss">Click outside the preview to close.</p>
      </div>`;
    overlay.addEventListener("click", event => {
      if (event.target === overlay) {
        closeSkinPreview();
        return;
      }
      const selector = event.target.closest?.("[data-skin-preview-view]");
      if (selector) {
        const index = Number(selector.dataset.skinPreviewView || 0);
        setActiveSkinView(index);
        setActiveSkinModel(overlay, variants[index], name, weapon);
      }
      const videoSelector = event.target.closest?.("[data-skin-preview-video-option]");
      if (videoSelector) setActiveSkinVideo(Number(videoSelector.dataset.skinPreviewVideoOption || 0), videoSelector);
      const mediaPageButton = event.target.closest?.("[data-skin-media-page-button]");
      if (mediaPageButton) {
        const nextPage = Number(mediaPageButton.dataset.skinMediaPageButton || 0);
        overlay.querySelectorAll("[data-skin-media-page]").forEach((page) => {
          const isActive = Number(page.dataset.skinMediaPage || 0) === nextPage;
          page.hidden = !isActive;
          page.classList.toggle("is-active", isActive);
        });
        overlay.querySelectorAll("[data-skin-media-page-button]").forEach((button) => {
          const isActive = Number(button.dataset.skinMediaPageButton || 0) === nextPage;
          button.classList.toggle("is-active", isActive);
          button.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
        const nativeVideo = overlay.querySelector("[data-skin-preview-video]");
        if (nativeVideo && nextPage !== 0) nativeVideo.pause?.();
      }
    });
    document.body.appendChild(overlay);
    activeSkinPreview = overlay;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    overlay.focus({ preventScroll: true });
  }

  function renderDetail(topic, itemId) {
    const item = getTopicItems(topic).find(entry => entry.id === itemId);
    if (!item) return renderGallery(topic);
    if (topic === "maps") return renderMapDetail(item);
    if (topic === "agents") return renderAgentDetail(item);
    return renderWeaponDetail(item);
  }

  function applyMapZoom(nextZoom, anchor = null) {
    state.mapZoom = Math.max(1, Math.min(3, Math.round(Number(nextZoom || 1) * 10) / 10));
    const viewport = document.querySelector("[data-gamesense-map-viewport]");
    const stage = document.querySelector("[data-gamesense-map-stage]");
    const value = document.querySelector("[data-gamesense-map-zoom-value]");
    if (!viewport || !stage) return;
    const previousWidth = Math.max(1, stage.getBoundingClientRect().width);
    const anchorX = anchor?.x ?? viewport.clientWidth / 2;
    const anchorY = anchor?.y ?? viewport.clientHeight / 2;
    const contentX = (viewport.scrollLeft + anchorX) / previousWidth;
    const contentY = (viewport.scrollTop + anchorY) / previousWidth;
    stage.style.setProperty("--map-zoom", String(state.mapZoom));
    stage.style.setProperty("--map-width", `${state.mapZoom * 100}%`);
    viewport.classList.toggle("is-zoomed", state.mapZoom > 1);
    if (value) value.textContent = `${Math.round(state.mapZoom * 100)}%`;
    requestAnimationFrame(() => {
      const nextWidth = Math.max(1, stage.getBoundingClientRect().width);
      viewport.scrollLeft = Math.max(0, (contentX * nextWidth) - anchorX);
      viewport.scrollTop = Math.max(0, (contentY * nextWidth) - anchorY);
    });
  }

  function bindMapPanZoom() {
    const viewport = document.querySelector("[data-gamesense-map-viewport]");
    if (!viewport || viewport.dataset.panZoomBound === "true") return;
    viewport.dataset.panZoomBound = "true";
    const pointers = new Map();
    let dragging = false;
    let dragPointerId = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let pinchDistance = 0;
    let pinchZoom = state.mapZoom;
    const pointerDistance = values => Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
    const beginDrag = pointer => {
      dragging = state.mapZoom > 1;
      dragPointerId = pointer.id;
      startX = pointer.x;
      startY = pointer.y;
      startLeft = viewport.scrollLeft;
      startTop = viewport.scrollTop;
      viewport.classList.toggle("is-grabbing", dragging);
    };
    viewport.addEventListener("pointerdown", event => {
      if (event.target?.closest?.("button,a,summary")) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
      try {
        viewport.setPointerCapture?.(event.pointerId);
      } catch (_error) {
        // Pointer capture can fail after an interrupted touch; dragging still works without it.
      }
      const values = [...pointers.values()];
      if (values.length === 1) beginDrag(values[0]);
      if (values.length === 2) {
        dragging = false;
        viewport.classList.remove("is-grabbing");
        pinchDistance = pointerDistance(values);
        pinchZoom = state.mapZoom;
      }
    });
    viewport.addEventListener("pointermove", event => {
      if (!pointers.has(event.pointerId)) return;
      pointers.set(event.pointerId, { id: event.pointerId, x: event.clientX, y: event.clientY });
      const values = [...pointers.values()];
      if (values.length >= 2 && pinchDistance) {
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        const centerX = ((values[0].x + values[1].x) / 2) - rect.left;
        const centerY = ((values[0].y + values[1].y) / 2) - rect.top;
        applyMapZoom(pinchZoom * (pointerDistance(values) / pinchDistance), { x: centerX, y: centerY });
        return;
      }
      if (!dragging || dragPointerId !== event.pointerId || state.mapZoom <= 1) return;
      event.preventDefault();
      viewport.scrollLeft = startLeft - (event.clientX - startX);
      viewport.scrollTop = startTop - (event.clientY - startY);
    });
    const stopPointer = event => {
      pointers.delete(event.pointerId);
      pinchDistance = 0;
      const remaining = [...pointers.values()];
      if (remaining.length === 1) beginDrag(remaining[0]);
      else {
        dragging = false;
        dragPointerId = null;
        viewport.classList.remove("is-grabbing");
      }
    };
    viewport.addEventListener("pointerup", stopPointer);
    viewport.addEventListener("pointercancel", stopPointer);
    viewport.addEventListener("dragstart", event => event.preventDefault());
  }

  function selectCompAgent(compAgentButton) {
    const selectedAgent = String(compAgentButton?.dataset?.gamesenseCompAgent || "").trim();
    if (!selectedAgent) return;
    state.compAgent = selectedAgent;

    const compCard = compAgentButton.closest(".gamesense-comp-card");
    compCard?.querySelectorAll("[data-gamesense-comp-agent]").forEach(button => {
      const isSelected = button.dataset.gamesenseCompAgent === selectedAgent;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });

    const map = getMaps().find(item => item.id === state.itemId);
    const insight = map?.agentInsights?.[selectedAgent] || "No current composition note is available for this agent.";
    let read = compCard?.querySelector(".gamesense-comp-agent-read");
    if (!read) {
      read = document.createElement("div");
      read.className = "gamesense-comp-agent-read is-revealing";
      compCard?.querySelector(".gamesense-comp-prompt")?.replaceWith(read);
    }
    if (read) {
      read.innerHTML = `<strong>${escapeHtml(selectedAgent)}</strong><p>${escapeHtml(insight)}</p>`;
    }

    if (document.documentElement.classList.contains("is-mobile-layout")) {
      requestAnimationFrame(() => window.setTimeout(() => read?.scrollIntoView({ behavior: "smooth", block: "center" }), 60));
    }
  }

  function selectCompRole(roleButton) {
    const map = getMaps().find(item => item.id === state.itemId);
    const explorer = roleButton?.closest(".gamesense-comp-pick-explorer");
    const selectedRole = String(roleButton?.dataset?.gamesenseCompRole || "");
    if (!map || !explorer || !["Controller", "Duelist", "Initiator", "Sentinel"].includes(selectedRole)) return;
    state.compRole = selectedRole;
    explorer.querySelectorAll("[data-gamesense-comp-role]").forEach(button => {
      const isSelected = button.dataset.gamesenseCompRole === selectedRole;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    replaceTargetedElement(explorer.querySelector(".gamesense-comp-pick-list"), renderCompRolePickList(map, selectedRole));
  }

  function togglePlantPreview(toggle) {
    const row = toggle?.closest(".gamesense-plant-row");
    const legend = row?.closest(".gamesense-plant-legend");
    const preview = row?.querySelector(".gamesense-plant-preview");
    if (!row || !legend || !preview) return;
    const shouldOpen = preview.hidden;
    legend.querySelectorAll(".gamesense-plant-row").forEach(item => {
      const itemPreview = item.querySelector(".gamesense-plant-preview");
      const itemToggle = item.querySelector(".gamesense-plant-preview-toggle");
      if (itemPreview) itemPreview.hidden = true;
      item.classList.remove("has-preview-open");
      itemToggle?.setAttribute("aria-expanded", "false");
      if (itemToggle) itemToggle.textContent = "+";
    });
    if (shouldOpen) {
      preview.hidden = false;
      row.classList.add("has-preview-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.textContent = "-";
    }
  }

  function replaceTargetedElement(element, markup) {
    if (!element || !markup) return null;
    const template = document.createElement("template");
    template.innerHTML = markup.trim();
    const replacement = template.content.firstElementChild;
    if (!replacement) return null;
    element.replaceWith(replacement);
    return replacement;
  }

  function selectAbility(abilityButton) {
    const selectedAbility = String(abilityButton?.dataset?.gamesenseAbility || "").trim();
    const agent = getReference().agents?.find(item => item.id === state.itemId);
    const ability = agent?.abilities?.find(item => item.id === selectedAbility);
    const section = abilityButton?.closest(".gamesense-selector-section");
    if (!ability || !section) return;
    state.detailId = selectedAbility;
    section.querySelectorAll("[data-gamesense-ability]").forEach(button => {
      const isSelected = button.dataset.gamesenseAbility === selectedAbility;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    replaceTargetedElement(section.querySelector(".gamesense-ability-panel"), renderAbilityDetail(agent, ability));
  }

  function selectWeapon(weaponButton) {
    const selectedWeapon = String(weaponButton?.dataset?.gamesenseWeapon || "").trim();
    const group = getReference().weapons?.find(item => item.id === state.itemId);
    const weapon = group?.weapons?.find(item => item.id === selectedWeapon);
    const section = weaponButton?.closest(".gamesense-selector-section");
    if (!weapon || !section) return;
    state.detailId = selectedWeapon;
    section.querySelectorAll("[data-gamesense-weapon]").forEach(button => {
      const isSelected = button.dataset.gamesenseWeapon === selectedWeapon;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    replaceTargetedElement(section.querySelector(".gamesense-weapon-panel"), renderWeaponFact(weapon));
    replaceWeaponCollectionArchive(weapon, getWeaponCollectionProvider()?.getCached(weapon.label), collectionLoadErrors.get(weapon.label) || "");
    hydrateWeaponCollectionArchive(weapon);
  }

  function selectRole(roleButton) {
    const hub = roleButton?.closest(".gamesense-tips-hub");
    const map = getMaps().find(item => item.id === state.itemId);
    if (!hub || !map) return;
    state.role = roleButton.dataset.gamesenseRole === "all" ? "" : roleButton.dataset.gamesenseRole;
    hub.querySelectorAll("[data-gamesense-role]").forEach(button => {
      const buttonRole = button.dataset.gamesenseRole === "all" ? "" : button.dataset.gamesenseRole;
      const isSelected = buttonRole === state.role;
      button.classList.toggle("active", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    hub.classList.toggle("has-role-filter", Boolean(state.role));
    if (state.role) hub.dataset.roleTone = state.role.toLowerCase();
    else delete hub.dataset.roleTone;
    const summary = hub.querySelector(".gamesense-role-lens-menu summary strong");
    if (summary) {
      summary.textContent = state.role || "All roles";
      if (state.role) summary.dataset.roleTone = state.role.toLowerCase();
      else delete summary.dataset.roleTone;
    }
    const menu = hub.querySelector(".gamesense-role-lens-menu");
    if (menu) menu.open = false;
    replaceTargetedElement(hub.querySelector(".gamesense-tips-panel"), renderMapTipsPanel(getMapTipsViewModel(map)));
  }

  function setPlantHotspotHighlight(marker, highlighted, persistent = false) {
    const mapRow = marker?.closest(".gamesense-map-canvas-row");
    const key = marker?.dataset?.gamesensePlantKey;
    if (!mapRow || !key) return;
    const legendRow = [...mapRow.querySelectorAll(".gamesense-plant-legend [data-gamesense-plant-key]")]
      .find(item => item.dataset.gamesensePlantKey === key);
    marker.classList.toggle(persistent ? "active" : "is-hotspot-preview", highlighted);
    legendRow?.classList.toggle(persistent ? "active" : "is-hotspot-preview", highlighted);
    const legend = mapRow.querySelector(".gamesense-plant-legend");
    legend?.classList.toggle("has-hotspot-focus", Boolean(mapRow.querySelector(".gamesense-plant-marker:is(.active,.is-hotspot-preview)")));
  }

  function bindPlantHotspots() {
    const markers = [...document.querySelectorAll(".gamesense-plant-marker[data-gamesense-plant-key]")];
    markers.forEach(marker => {
      if (marker.dataset.hotspotBound === "true") return;
      marker.dataset.hotspotBound = "true";
      marker.addEventListener("pointerenter", () => setPlantHotspotHighlight(marker, true));
      marker.addEventListener("pointerleave", () => setPlantHotspotHighlight(marker, false));
      marker.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        const shouldActivate = !marker.classList.contains("active");
        markers.forEach(item => setPlantHotspotHighlight(item, false, true));
        if (shouldActivate) setPlantHotspotHighlight(marker, true, true);
      });
    });
  }

  function commitRender(root) {
    root.innerHTML = state.topic === "overview" ? renderOverview() : state.itemId ? renderDetail(state.topic, state.itemId) : renderGallery(state.topic);
    root.querySelectorAll("img[data-agent-fallback]").forEach(img => {
      img.addEventListener("error", () => {
        const fallback = img.dataset.agentFallback;
        if (fallback && img.src !== fallback) img.src = fallback;
      }, { once: true });
    });
    bindMapPanZoom();
    bindPlantHotspots();
    hydrateWeaponCollectionArchive();
  }

  function render(options = {}) {
    const root = document.getElementById("gamesenseLibraryView");
    if (!root) return;
    const direction = ["forward", "backward", "replace"].includes(options.direction) ? options.direction : "none";
    const shouldAnimate = ["forward", "backward"].includes(direction)
      && !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (!shouldAnimate) {
      commitRender(root);
      return null;
    }

    activeLibraryTransition?.skipTransition?.();
    document.documentElement.dataset.gamesenseTransition = direction;
    root.style.viewTransitionName = "gamesense-library-content";
    if (typeof document.startViewTransition === "function") {
      const transition = document.startViewTransition(() => commitRender(root));
      transition.ready?.catch(() => {});
      transition.updateCallbackDone?.catch(() => {});
      transition.finished?.catch(() => {});
      activeLibraryTransition = transition;
      transition.finished.catch(() => {}).finally(() => {
        if (activeLibraryTransition === transition) activeLibraryTransition = null;
        delete document.documentElement.dataset.gamesenseTransition;
      });
      return transition;
    }

    commitRender(root);
    const distance = direction === "backward" ? -24 : 24;
    const animation = root.animate([
      { opacity: .45, transform: `translate3d(${distance}px,0,0)` },
      { opacity: 1, transform: "translate3d(0,0,0)" }
    ], { duration: 260, easing: "cubic-bezier(.2,.82,.24,1)" });
    activeLibraryTransition = animation;
    animation.finished.catch(() => {}).finally(() => {
      if (activeLibraryTransition === animation) activeLibraryTransition = null;
      delete document.documentElement.dataset.gamesenseTransition;
    });
    return animation;
  }

  function openLibrary(topic = "overview", itemId = "") {
    state.topic = topicMeta[topic] ? topic : "overview";
    state.itemId = itemId;
    state.role = "";
    state.detailId = "";
    state.mapView = "locations";
    state.tipView = "attack";
    state.mapZoom = 1;
    state.compAgent = "";
    state.compRole = "Controller";
    const desktopNav = document.querySelector('.nav-btn[data-page="library"]');
    const mobileNav = document.querySelector('.mobile-bottom-page-btn[data-mobile-page="library"]');
    const selectedNav = document.documentElement.classList.contains("is-mobile-layout") ? mobileNav : desktopNav;
    if (!selectedNav?.classList.contains("active")) {
      selectedNav?.click();
    }
    render({ direction: itemId || state.topic !== "overview" ? "forward" : "none" });
  }

  function resetLibrary() {
    state.topic = "overview";
    state.itemId = "";
    state.role = "";
    state.detailId = "";
    state.mapView = "locations";
    state.tipView = "attack";
    state.mapZoom = 1;
    state.compAgent = "";
    state.compRole = "Controller";
    render({ direction: "backward" });
    const libraryPage = document.getElementById("page-library");
    const owner = document.documentElement.classList.contains("is-mobile-layout")
      ? document.querySelector(".app-root")
      : libraryPage;
    if (owner) owner.scrollTop = 0;
  }

  function decorateWarmupDrills() {
    const details = getReference().warmupDetails || {};
    document.querySelectorAll("[data-warmup-drill]").forEach(drill => {
      const id = drill.dataset.warmupDrill;
      const steps = details[id];
      if (!Array.isArray(steps) || drill.querySelector("[data-warmup-info]")) return;
      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "daily-warmup-info-toggle";
      toggle.dataset.warmupInfo = id;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `Show ${id.replace(/-/g, " ")} instructions`);
      toggle.textContent = "?";
      const detail = document.createElement("div");
      detail.className = "daily-warmup-info-detail";
      detail.dataset.warmupInfoDetail = id;
      detail.hidden = true;
      detail.innerHTML = `<strong>Run it like this</strong><ol>${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
      drill.append(toggle, detail);
    });
  }

  function toggleWarmupInfo(toggle) {
    const card = toggle.closest("[data-warmup-drill]");
    const detail = card?.querySelector(`[data-warmup-info-detail="${toggle.dataset.warmupInfo}"]`);
    if (!detail) return;
    const open = detail.hidden;
    detail.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    card.classList.toggle("has-info-open", open);
  }

  document.addEventListener("click", event => {
    const libraryNav = event.target.closest?.('.nav-btn[data-page="library"], .mobile-bottom-page-btn[data-mobile-page="library"]');
    if (libraryNav?.classList.contains("active") && state.topic !== "overview") {
      resetLibrary();
      return;
    }
    const warmupToggle = event.target.closest?.("[data-warmup-info]");
    if (warmupToggle) {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleWarmupInfo(warmupToggle);
      return;
    }
    const contextual = event.target.closest?.("[data-gamesense-open]");
    if (contextual) {
      event.preventDefault();
      openLibrary(contextual.dataset.gamesenseOpen, contextual.dataset.gamesenseItemTarget || "");
      return;
    }
    const topic = event.target.closest?.("[data-gamesense-topic]");
    if (topic) {
      state.topic = topic.dataset.gamesenseTopic;
      state.itemId = "";
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.tipView = "attack";
      state.mapZoom = 1;
      state.compAgent = "";
      state.compRole = "Controller";
      render({ direction: "forward" });
      return;
    }
    const item = event.target.closest?.("[data-gamesense-item]");
    if (item) {
      state.itemId = item.dataset.gamesenseItem;
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.tipView = "attack";
      state.mapZoom = 1;
      state.compAgent = "";
      state.compRole = "Controller";
      render({ direction: "forward" });
      return;
    }
    const mapView = event.target.closest?.("[data-gamesense-map-view]");
    if (mapView) {
      state.mapView = mapView.dataset.gamesenseMapView === "plants" ? "plants" : "locations";
      render({ direction: "replace" });
      return;
    }
    const tipView = event.target.closest?.("[data-gamesense-tip-view]");
    if (tipView) {
      state.tipView = ["attack", "defense", "sites", "teamplay"].includes(tipView.dataset.gamesenseTipView) ? tipView.dataset.gamesenseTipView : "attack";
      render({ direction: "replace" });
      return;
    }
    const mapZoom = event.target.closest?.("[data-gamesense-map-zoom]");
    if (mapZoom) {
      const action = mapZoom.dataset.gamesenseMapZoom;
      applyMapZoom(action === "in" ? state.mapZoom + .25 : action === "out" ? state.mapZoom - .25 : 1);
      return;
    }
    const compAgent = event.target.closest?.("[data-gamesense-comp-agent]");
    if (compAgent) {
      selectCompAgent(compAgent);
      return;
    }
    const compRole = event.target.closest?.("[data-gamesense-comp-role]");
    if (compRole) {
      selectCompRole(compRole);
      return;
    }
    const plantPreview = event.target.closest?.("[data-gamesense-plant-preview]");
    if (plantPreview) {
      event.preventDefault();
      event.stopPropagation();
      togglePlantPreview(plantPreview);
      return;
    }
    const role = event.target.closest?.("[data-gamesense-role]");
    if (role) {
      selectRole(role);
      return;
    }
    const ability = event.target.closest?.("[data-gamesense-ability]");
    if (ability) {
      selectAbility(ability);
      return;
    }
    const collectionPreview = event.target.closest?.("[data-gamesense-collection-preview]");
    if (collectionPreview) {
      event.preventDefault();
      event.stopPropagation();
      openSkinPreview(collectionPreview);
      return;
    }
    const collectionRetry = event.target.closest?.("[data-gamesense-collection-retry]");
    if (collectionRetry) {
      event.preventDefault();
      hydrateWeaponCollectionArchive(getSelectedWeapon(), { retry: true });
      return;
    }
    const collectionFilter = event.target.closest?.("[data-gamesense-collection-filter]");
    if (collectionFilter) {
      const archive = collectionFilter.closest(".gamesense-collection-archive");
      const filter = collectionFilter.dataset.gamesenseCollectionFilter || "all";
      archive?.querySelectorAll("[data-gamesense-collection-filter]").forEach(button => {
        const active = button.dataset.gamesenseCollectionFilter === filter;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      archive?.querySelectorAll("[data-gamesense-collection-tier]").forEach(card => {
        card.hidden = filter !== "all" && card.dataset.gamesenseCollectionTier !== filter;
      });
      return;
    }
    const weapon = event.target.closest?.("[data-gamesense-weapon]");
    if (weapon) {
      selectWeapon(weapon);
      return;
    }
    const back = event.target.closest?.("[data-gamesense-back]");
    if (back) {
      state.topic = back.dataset.gamesenseBack;
      state.itemId = "";
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.tipView = "attack";
      state.mapZoom = 1;
      state.compAgent = "";
      state.compRole = "Controller";
      render({ direction: "backward" });
    }
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && activeSkinPreview) {
      event.preventDefault();
      closeSkinPreview();
      return;
    }
    const toggle = event.target.closest?.("[data-warmup-info]");
    if (toggle && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      toggleWarmupInfo(toggle);
    }
  });

  document.addEventListener("pointerdown", event => {
    if (!activeSkinPreview || event.target.closest?.(".gamesense-skin-preview-card")) return;
    closeSkinPreview();
  }, true);

  decorateWarmupDrills();
  render();
  globalThis.RankedCoachGamesenseLibrary = Object.freeze({ open: openLibrary, render, reset: resetLibrary });
})();
