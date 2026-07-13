(function () {
  "use strict";

  const state = { topic: "overview", itemId: "", role: "", detailId: "", mapView: "locations", tipView: "attack", mapZoom: 1, compAgent: "" };
  let activeLibraryTransition = null;
  const topicMeta = {
    maps: { label: "Maps", copy: "Attack, defense, role notes, current comps, and marked tactical layouts." },
    agents: { label: "Agents", copy: "Role expectations, ability facts, costs, timing, and repeatable setups." },
    weapons: { label: "Weapons", copy: "Selectable weapon art, damage ranges, economy, and fight decisions." }
  };
  const agentUuids = Object.freeze({
    chamber: "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
    clove: "1dbf2edd-4729-0984-3115-daa5eed44993",
    cypher: "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
    fade: "dade69b4-4f5a-8528-247b-219e5a1facd6",
    gekko: "e370fa57-4757-3604-3648-499e1f642d3f",
    iso: "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
    jett: "add6443a-41bd-e414-f6ad-e58d267f4e95",
    killjoy: "1e58de9c-4950-5125-93e9-a0aee9f98746",
    neon: "bb2a4828-46eb-8cd1-e765-15848195d751",
    raze: "f94c3b30-42be-e959-889c-5aa313dba261",
    reyna: "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
    sage: "569fdd95-4d10-43ab-ca70-79becc718b46",
    skye: "6f2a04ca-43e0-be17-7f36-b3908627744d",
    sova: "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
    viper: "707eab51-4836-f488-046a-cda6bf494859"
  });
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
    return [
      "https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png",
      "https://media.valorant-api.com/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794/displayicon.png",
      "https://media.valorant-api.com/weapons/a03b24d3-4319-996d-0f8c-94bbfba1dfc7/displayicon.png"
    ];
  }

  function getMaps() {
    return Array.isArray(globalThis.RankedCoachGamesenseMaps) ? globalThis.RankedCoachGamesenseMaps : [];
  }

  function getReference() {
    return globalThis.RankedCoachGamesenseReference || { agents: [], weapons: [], warmupDetails: {} };
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
              <span class="gamesense-topic-number">0${index + 1}</span>
              <strong>${escapeHtml(meta.label)}</strong>
              <small>${escapeHtml(meta.copy)}</small>
              <span class="gamesense-topic-action">Open dossier</span>
            </button>
          `).join("")}
        </div>
      </div>`;
  }

  function renderMapCard(item, index) {
    return `
      <button class="gamesense-entry-card gamesense-map-entry-card" type="button" data-gamesense-item="${escapeHtml(item.id)}" style="--entry-index:${index};--map-card-image:url('${escapeHtml(item.cardImage)}')">
        <span class="gamesense-map-card-shade"></span>
        <strong>${escapeHtml(item.label)}</strong>
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
        <span class="gamesense-weapon-card-art">${(item.weapons || []).slice(0, 3).map(weapon => `<img src="${escapeHtml(weapon.image)}" alt="" loading="lazy">`).join("")}</span>
        <span class="gamesense-entry-copy"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.examples)} | ${escapeHtml(item.range)}</small><span>Inspect weapons</span></span>
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
                return `<span class="gamesense-callout gamesense-plant-marker" style="--callout-x:${Number(callout.x)}%;--callout-y:${Number(callout.y)}%;--marker-label-x:${offset[0] * direction}px;--marker-label-y:${offset[1]}px"><i></i><b>${escapeHtml(`${callout.site}${callout.number}`)}</b></span>`;
              }).join("")}
            </div>
          </div>
          ${isPlants ? `<aside class="gamesense-plant-legend" aria-label="${escapeHtml(map.label)} plant location rates">
            <strong>Active-season plant share</strong>
            ${(map.plantSpots || []).map(spot => `<div><i></i><b>${escapeHtml(`${spot.site}${spot.number}`)}</b><em>${spot.rate != null && Number.isFinite(Number(spot.rate)) ? `${Number(spot.rate).toFixed(2)}%` : "N/A"}</em><span>${escapeHtml(spot.label)}</span></div>`).join("")}
            <p>${escapeHtml(map.plantRateNote || "Plant share is unavailable for this map.")}</p>
          </aside>` : ""}
        </div>
      </section>`;
  }

  function renderMapTips(map) {
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
    return `
      <section class="gamesense-tips-hub${activeRole ? ` has-role-filter" data-role-tone="${activeRole.toLowerCase()}` : ""}">
        <div class="gamesense-section-heading gamesense-tips-heading"><span>Tips</span><strong>${escapeHtml(map.label)} round plans</strong></div>
        <div class="gamesense-tips-tabs" role="tablist" aria-label="${escapeHtml(map.label)} tip categories">
          ${categories.map(category => `<button type="button" role="tab" data-gamesense-tip-view="${category.id}" class="${category.id === activeCategory ? "active" : ""}" aria-selected="${category.id === activeCategory}">${category.label}</button>`).join("")}
        </div>
        <div class="gamesense-tips-role-filter">
          <span>Role lens</span>
          <div class="gamesense-role-options">
            <button type="button" data-gamesense-role="all" class="${activeRole ? "" : "active"}" aria-pressed="${activeRole ? "false" : "true"}">All roles</button>
            ${roles.map(role => `<button type="button" data-gamesense-role="${role}" data-role-tone="${role.toLowerCase()}" class="${role === activeRole ? "active" : ""}" aria-pressed="${role === activeRole}">${role}</button>`).join("")}
          </div>
        </div>
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
        </div>
      </section>`;
  }

  function renderWeaponSuggestions(map) {
    const suggestions = Array.isArray(map.weaponSuggestions) ? map.weaponSuggestions : [];
    if (!suggestions.length) return "";
    return `
      <section class="gamesense-weapon-suggestions">
        <div><span>Weapon Suggestions</span><strong>Highest-value choices by buy type</strong></div>
        <p class="gamesense-weapon-source">Efficiency evidence uses Blitz Competitive weapon stats. Map fit explains where that weapon can protect its strongest fight.</p>
        <div class="gamesense-weapon-suggestion-grid">${suggestions.map(item => `
          <details class="gamesense-weapon-suggestion">
            <summary><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.weapon)}"><span>${escapeHtml(item.fit)}</span><i aria-hidden="true"></i></summary>
            <div><strong>${escapeHtml(item.evidence)}</strong><small>${escapeHtml(item.locations)}</small><p>${escapeHtml(item.note)}</p></div>
          </details>
        `).join("")}</div>
      </section>`;
  }

  function renderComp(map) {
    const comps = Array.isArray(map.metaComps) && map.metaComps.length ? map.metaComps.slice(0, 3) : [map.metaComp];
    const hasCurrentSample = comps.some(comp => Array.isArray(comp?.agents) && comp.agents.length === 5);
    const selectedAgent = state.compAgent;
    const selectedInsight = selectedAgent ? map.agentInsights?.[selectedAgent] : "";
    if (!hasCurrentSample) {
      return `
        <section class="gamesense-comp-card gamesense-comp-unavailable">
          <div><span>Current-Season Comps</span><strong>Patch ${escapeHtml(map.metaComp?.patch || getReference().season?.patch || "Current")}</strong></div>
          <p>${escapeHtml(map.compStatus || "No verified current-season composition sample is available for this map.")}</p>
        </section>`;
    }
    return `
      <section class="gamesense-comp-card">
        <div><span>Current Competitive Comps</span><strong>Tracker Network | Past two weeks</strong></div>
        <p class="gamesense-comp-source">Agent and map rates use Tracker Network's rolling Competitive sample. These five-agent combinations are tactical references built from current map leaders, not measured composition win-rate claims.</p>
        <div class="gamesense-comp-list">${comps.map((comp, index) => `
          <article class="gamesense-comp-option">
            <div class="gamesense-comp-rank"><span>Reference ${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(comp.composition)}</strong></div>
            <div class="gamesense-comp-agents">${(comp.agents || []).map(agent => `
              <button type="button" data-gamesense-comp-agent="${escapeHtml(agent)}" class="${selectedAgent === agent ? "active" : ""}" aria-pressed="${selectedAgent === agent ? "true" : "false"}">
                <img src="${escapeHtml(getAgentIcon(agent))}" data-agent-fallback="${escapeHtml(getAgentFallbackIcon(agent))}" alt="${escapeHtml(agent)}" loading="eager"><span>${escapeHtml(agent)}</span>
              </button>
            `).join("")}</div>
          </article>
        `).join("")}</div>
        ${selectedInsight ? `<div class="gamesense-comp-agent-read"><strong>${escapeHtml(selectedAgent)}</strong><p>${escapeHtml(selectedInsight)}</p></div>` : `<p class="gamesense-comp-prompt">Select an agent to see why the pick succeeds on ${escapeHtml(map.label)}.</p>`}
      </section>`;
  }

  function renderMapDetail(map) {
    return `
      <div class="gamesense-detail-head gamesense-map-detail-head">
        <div><span>Map Dossier</span><h2>${escapeHtml(map.label)}</h2></div>
        <span class="gamesense-patch">As of Patch ${escapeHtml(map.metaComp?.patch)}</span>
        <button class="gamesense-back" type="button" data-gamesense-back="maps">Back to maps</button>
      </div>
      <div class="gamesense-detail-grid">
        ${renderMapTips(map)}
        ${renderComp(map)}
        ${renderWeaponSuggestions(map)}
        <section class="gamesense-lineups">
          <div><span>Find Lineups</span></div>
          <div>${(map.lineupLinks || []).map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}</div>
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

  function renderAgentFacts(agent) {
    const history = Array.isArray(agent.patchHistory) ? agent.patchHistory : [];
    const facts = Array.isArray(agent.facts) ? agent.facts : [];
    return `
      <section class="gamesense-note-block gamesense-agent-facts">
        <h3>Agent Facts and Stats</h3>
        <div class="gamesense-agent-fact-list">
          ${facts.map(item => `<article><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><p>${escapeHtml(item.note || "")}</p></article>`).join("")}
        </div>
        <details class="gamesense-patch-history">
          <summary>Buff and nerf history</summary>
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
          <div class="gamesense-agent-rate"><span>Global pick rate ${safePercent(agent.pickRate)}</span><strong>${escapeHtml(agent.sampleLabel || "Tracker Network | Past two weeks")}</strong></div>
          <img src="${escapeHtml(agent.portrait)}" alt="${escapeHtml(agent.label)}" loading="eager">
        </div>
        <div>${renderList("Agent Fundamentals", agent.fundamentals)}${renderAgentFacts(agent)}</div>
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
        <div class="gamesense-weapon-panel-copy"><span>Weapon Analysis</span><h3>${escapeHtml(weapon.label)}</h3><strong class="gamesense-global-rate">Global usage ${safePercent(weapon.pickRate)}</strong><p>${escapeHtml(weapon.focus)}</p></div>
        ${renderStatChips({ Cost: `${weapon.cost} credits`, Magazine: `${weapon.magazine}`, "Fire rate": weapon.fireRate, Penetration: weapon.penetration })}
        ${renderDamageTable(weapon)}
        <div class="gamesense-weapon-guidance">
          <section><span>When to use it</span><ul>${(weapon.whenToUse || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
          <section><span>How to use it</span><ul>${(weapon.howToUse || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul></section>
        </div>
        <details class="gamesense-patch-history gamesense-weapon-history">
          <summary>Patch history</summary>
          <ol>${(weapon.patchHistory || []).map(item => `<li><span>${escapeHtml(item.patch.startsWith("Patch") ? item.patch : `Patch ${item.patch}`)}</span><p>${escapeHtml(item.note)}</p>${item.source ? `<a href="${escapeHtml(item.source)}" target="_blank" rel="noopener noreferrer">Riot source</a>` : ""}</li>`).join("")}</ol>
        </details>
      </article>`;
  }

  function renderWeaponDetail(group) {
    const weapons = group.weapons || [];
    const selected = weapons.find(weapon => weapon.id === state.detailId) || weapons[0];
    return `
      <div class="gamesense-detail-head gamesense-weapon-detail-head">
        <div><span>${escapeHtml(group.range)}</span><h2>${escapeHtml(group.label)}</h2></div>
        <span class="gamesense-patch">${escapeHtml(group.examples)}</span>
        <button class="gamesense-back" type="button" data-gamesense-back="weapons">Back to weapons</button>
      </div>
      <section class="gamesense-selector-section">
        <div class="gamesense-section-heading"><span>Arsenal</span><strong>Select a weapon</strong></div>
        <div class="gamesense-weapon-grid">${weapons.map(weapon => `
          <button type="button" data-gamesense-weapon="${escapeHtml(weapon.id)}" class="${weapon.id === selected?.id ? "active" : ""}" aria-pressed="${weapon.id === selected?.id}"><img src="${escapeHtml(weapon.image)}" alt=""><span>${escapeHtml(weapon.label)}</span><small>${weapon.cost} credits</small></button>
        `).join("")}</div>
        ${renderWeaponFact(selected)}
      </section>`;
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

  function commitRender(root) {
    root.innerHTML = state.topic === "overview" ? renderOverview() : state.itemId ? renderDetail(state.topic, state.itemId) : renderGallery(state.topic);
    root.querySelectorAll("img[data-agent-fallback]").forEach(img => {
      img.addEventListener("error", () => {
        const fallback = img.dataset.agentFallback;
        if (fallback && img.src !== fallback) img.src = fallback;
      }, { once: true });
    });
    bindMapPanZoom();
  }

  function render(options = {}) {
    const root = document.getElementById("gamesenseLibraryView");
    if (!root) return;
    const direction = ["forward", "backward", "replace"].includes(options.direction) ? options.direction : "none";
    const shouldAnimate = direction !== "none"
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
      activeLibraryTransition = transition;
      transition.finished.finally(() => {
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
    animation.finished.finally(() => {
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
      render({ direction: "forward" });
      return;
    }
    const mapView = event.target.closest?.("[data-gamesense-map-view]");
    if (mapView) {
      const previousView = state.mapView;
      state.mapView = mapView.dataset.gamesenseMapView === "plants" ? "plants" : "locations";
      render({ direction: previousView === "plants" ? "backward" : "forward" });
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
      state.compAgent = state.compAgent === compAgent.dataset.gamesenseCompAgent ? "" : compAgent.dataset.gamesenseCompAgent;
      const selectedAgent = state.compAgent;
      const transition = render({ direction: "replace" });
      if (selectedAgent && document.documentElement.classList.contains("is-mobile-layout")) {
        const revealSelectedAgent = () => document.querySelector(".gamesense-comp-agent-read")?.scrollIntoView({ behavior: "smooth", block: "center" });
        requestAnimationFrame(() => window.setTimeout(revealSelectedAgent, 60));
        Promise.resolve(transition?.finished).catch(() => {}).finally(() => {
          window.setTimeout(revealSelectedAgent, 40);
        });
      }
      return;
    }
    const role = event.target.closest?.("[data-gamesense-role]");
    if (role) {
      state.role = role.dataset.gamesenseRole === "all" ? "" : role.dataset.gamesenseRole;
      render({ direction: "replace" });
      return;
    }
    const ability = event.target.closest?.("[data-gamesense-ability]");
    if (ability) {
      state.detailId = ability.dataset.gamesenseAbility;
      render({ direction: "replace" });
      return;
    }
    const weapon = event.target.closest?.("[data-gamesense-weapon]");
    if (weapon) {
      state.detailId = weapon.dataset.gamesenseWeapon;
      render({ direction: "replace" });
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
      render({ direction: "backward" });
    }
  }, true);

  document.addEventListener("keydown", event => {
    const toggle = event.target.closest?.("[data-warmup-info]");
    if (toggle && ["Enter", " "].includes(event.key)) {
      event.preventDefault();
      toggleWarmupInfo(toggle);
    }
  });

  decorateWarmupDrills();
  render();
  globalThis.RankedCoachGamesenseLibrary = Object.freeze({ open: openLibrary, render, reset: resetLibrary });
})();
