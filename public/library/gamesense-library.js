(function () {
  "use strict";

  const state = { topic: "overview", itemId: "", role: "", detailId: "", mapView: "locations", mapZoom: 1, compAgent: "" };
  const topicMeta = {
    maps: { label: "Maps", copy: "Attack, defense, role notes, current comps, and marked tactical layouts." },
    agents: { label: "Agents", copy: "Role expectations, ability facts, costs, timing, and repeatable setups." },
    weapons: { label: "Weapons", copy: "Selectable weapon art, damage ranges, economy, and fight decisions." }
  };

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function assetSlug(value = "") {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getAgentIcon(agent = "") {
    return `/assets/library/agents/${assetSlug(agent)}/icon.png`;
  }

  function getAgentFallbackIcon(agent = "") {
    return `https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/silhouettes/${assetSlug(agent)}.png`;
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
        <div class="gamesense-season-scope"><span>Current Season Only</span><strong>${escapeHtml(season.label || "Current Season")} | Patch ${escapeHtml(season.patch || "Current")}</strong><p>Agent, map, and weapon rates on this page use the current competitive season, not historical profile data.</p></div>
        <div class="gamesense-briefing">
          <span>Reference Room</span>
          <strong>Build the round before the barrier drops.</strong>
          <p>Choose what you want to study, then open the exact map, agent, or weapon decision.</p>
        </div>
        <div class="gamesense-topic-grid">
          ${Object.entries(topicMeta).map(([key, meta], index) => `
            <button class="gamesense-topic-card" type="button" data-gamesense-topic="${key}" style="--topic-index:${index}">
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
        <span class="gamesense-entry-index">${String(index + 1).padStart(2, "0")}</span>
        <span class="gamesense-map-card-shade"></span>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.metaComp?.composition)}</small>
        <span>Open marked map</span>
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
      <div class="gamesense-gallery-head">
        <button class="gamesense-back" type="button" data-gamesense-back="overview">Back to topics</button>
        <div><strong>${escapeHtml(meta.label)} Library</strong></div>
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
        <div class="gamesense-tactical-scroll ${state.mapZoom > 1 ? "is-zoomed" : ""}" data-gamesense-map-viewport tabindex="0" aria-label="Zoomable ${escapeHtml(map.label)} tactical map">
          <div class="gamesense-tactical-stage" data-gamesense-map-stage style="--map-zoom:${state.mapZoom}">
            <img src="${escapeHtml(map.layoutImage)}" alt="${escapeHtml(map.label)} tactical layout" loading="eager">
            ${markers.map(callout => `<span class="gamesense-callout ${isPlants ? "gamesense-plant-marker" : ""}" style="--callout-x:${Number(callout.x)}%;--callout-y:${Number(callout.y)}%">${escapeHtml(callout.label)}</span>`).join("")}
          </div>
        </div>
      </section>`;
  }

  function renderRoleNotes(map) {
    const roles = ["Duelist", "Initiator", "Controller", "Sentinel"];
    const activeRole = roles.includes(state.role) ? state.role : "";
    return `
      <section class="gamesense-role-notes">
        <details class="gamesense-role-menu">
          <summary>${activeRole ? `${escapeHtml(activeRole)} notes selected` : "Open role-specific notes"}</summary>
          <div class="gamesense-role-options">
            ${roles.map(role => `<button type="button" data-gamesense-role="${role}" data-role-tone="${role.toLowerCase()}" class="${role === activeRole ? "active" : ""}">${role}</button>`).join("")}
          </div>
        </details>
        ${activeRole ? renderList(`${activeRole} Plan`, map.roleNotes?.[activeRole] || [], "gamesense-role-result") : `<p class="gamesense-role-prompt">Choose your role to turn the map overview into a job for your next round.</p>`}
      </section>`;
  }

  function renderComp(map) {
    const comps = Array.isArray(map.metaComps) && map.metaComps.length ? map.metaComps.slice(0, 3) : [map.metaComp];
    const hasCurrentSample = comps.some(comp => Array.isArray(comp?.agents) && comp.agents.length === 5 && comp?.sample);
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
        <div><span>Top Win Rate Among 20 Most-Played Comps</span><strong>Patch ${escapeHtml(map.metaComp?.patch || getReference().season?.patch || "Current")}</strong></div>
        <p class="gamesense-comp-source">Current Season 26 Act 4 ranked sample from OP.GG. Win rate uses wins divided by all games, including draws.</p>
        <div class="gamesense-comp-list">${comps.map((comp, index) => `
          <article class="gamesense-comp-option">
            <div class="gamesense-comp-rank"><span>#${index + 1}</span><strong>${escapeHtml(comp.winRate)} win rate | ${Number(comp.sample).toLocaleString()} games</strong></div>
            <div class="gamesense-comp-agents">${(comp.agents || []).map(agent => `
              <button type="button" data-gamesense-comp-agent="${escapeHtml(agent)}" class="${selectedAgent === agent ? "active" : ""}" aria-pressed="${selectedAgent === agent ? "true" : "false"}">
                <img src="${escapeHtml(getAgentIcon(agent))}" data-agent-fallback="${escapeHtml(getAgentFallbackIcon(agent))}" alt="${escapeHtml(agent)}" loading="lazy"><span>${escapeHtml(agent)}</span>
              </button>
            `).join("")}</div>
            <p>${escapeHtml(comp.composition)}</p>
          </article>
        `).join("")}</div>
        ${selectedInsight ? `<div class="gamesense-comp-agent-read"><strong>${escapeHtml(selectedAgent)}</strong><p>${escapeHtml(selectedInsight)}</p></div>` : `<p class="gamesense-comp-prompt">Select an agent to see why the pick succeeds on ${escapeHtml(map.label)}.</p>`}
      </section>`;
  }

  function renderMapDetail(map) {
    return `
      <div class="gamesense-detail-head">
        <button class="gamesense-back" type="button" data-gamesense-back="maps">Back to maps</button>
        <div><span>Map Dossier</span><h2>${escapeHtml(map.label)}</h2></div>
        <span class="gamesense-patch">As of Patch ${escapeHtml(map.metaComp?.patch)}</span>
      </div>
      <div class="gamesense-detail-grid">
        ${renderList("Defense", map.macro?.defense)}
        ${renderList("Attack", map.macro?.attack)}
        ${renderRoleNotes(map)}
        ${state.role === "Controller" ? `<section class="gamesense-controller-callout">
          <span>Controller Notes</span>
          <p>${escapeHtml(map.macro?.controllerNotes)}</p>
          <strong>${escapeHtml(map.macro?.macroPrinciple)}</strong>
        </section>` : ""}
        ${renderComp(map)}
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

  function renderAgentDetail(agent) {
    const abilities = agent.abilities || [];
    const selected = abilities.find(ability => ability.id === state.detailId) || abilities[0];
    return `
      <div class="gamesense-detail-head">
        <button class="gamesense-back" type="button" data-gamesense-back="agents">Back to agents</button>
        <div><span>${escapeHtml(agent.role)} Field Guide</span><h2>${escapeHtml(agent.label)}</h2></div>
      </div>
      <section class="gamesense-agent-hero">
        <div class="gamesense-agent-portrait-wrap">
          <div class="gamesense-agent-rate ${Number(agent.pickRateDelta) >= 0 ? "is-up" : "is-down"}"><span>Global pick rate ${safePercent(agent.pickRate)}</span><strong>${Number(agent.pickRateDelta) >= 0 ? "&#8593;" : "&#8595;"} ${Math.abs(Number(agent.pickRateDelta || 0)).toFixed(1)}% vs previous season</strong></div>
          <img src="${escapeHtml(agent.portrait)}" alt="${escapeHtml(agent.label)}" loading="eager">
        </div>
        <div>${renderList("Role Fundamentals", agent.fundamentals)}${renderList("Round Checklist", agent.signature)}</div>
      </section>
      <section class="gamesense-selector-section">
        <div class="gamesense-section-heading"><span>Ability Analysis</span><strong>Select an ability</strong></div>
        <div class="gamesense-ability-grid">${abilities.map(ability => `
          <button type="button" data-gamesense-ability="${escapeHtml(ability.id)}" class="${ability.id === selected?.id ? "active" : ""}" aria-pressed="${ability.id === selected?.id}"><img src="${escapeHtml(ability.icon)}" alt=""><span>${escapeHtml(ability.name)}</span><small>${escapeHtml(ability.slot)}</small></button>
        `).join("")}</div>
        ${renderAbilityDetail(agent, selected)}
      </section>
      <section class="gamesense-comp-card gamesense-map-fit">
        <div><span>Map Fit</span><strong>Current-season win rate</strong></div>
        <div class="gamesense-map-fit-grid">${agent.maps.map(mapName => {
          const map = getMaps().find(item => item.label.toLowerCase() === mapName.toLowerCase());
          const winRate = agent.mapWinRates?.[mapName];
          return `<button type="button" data-gamesense-open="maps" data-gamesense-item-target="${escapeHtml(mapName.toLowerCase())}"><img src="${escapeHtml(map?.cardImage || "")}" alt="" loading="lazy"><span>${escapeHtml(mapName)}</span><strong>${Number.isFinite(Number(winRate)) ? `${Number(winRate).toFixed(1)}% WR` : "Current data pending"}</strong></button>`;
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
      </article>`;
  }

  function renderWeaponDetail(group) {
    const weapons = group.weapons || [];
    const selected = weapons.find(weapon => weapon.id === state.detailId) || weapons[0];
    return `
      <div class="gamesense-detail-head">
        <button class="gamesense-back" type="button" data-gamesense-back="weapons">Back to weapons</button>
        <div><span>${escapeHtml(group.range)}</span><h2>${escapeHtml(group.label)}</h2></div>
        <span class="gamesense-patch">${escapeHtml(group.examples)}</span>
      </div>
      <div class="gamesense-detail-grid gamesense-weapon-overview">${renderList("Fight Plan", group.fundamentals)}${renderList("Economy Read", group.economy)}</div>
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
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let startTop = 0;
    let pinchDistance = 0;
    let pinchZoom = state.mapZoom;
    const distance = touches => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
    viewport.addEventListener("pointerdown", event => {
      if (state.mapZoom <= 1 || event.pointerType === "touch") return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startLeft = viewport.scrollLeft;
      startTop = viewport.scrollTop;
      viewport.classList.add("is-grabbing");
      viewport.setPointerCapture?.(event.pointerId);
    });
    viewport.addEventListener("pointermove", event => {
      if (!dragging) return;
      viewport.scrollLeft = startLeft - (event.clientX - startX);
      viewport.scrollTop = startTop - (event.clientY - startY);
    });
    const stopDrag = () => { dragging = false; viewport.classList.remove("is-grabbing"); };
    viewport.addEventListener("pointerup", stopDrag);
    viewport.addEventListener("pointercancel", stopDrag);
    viewport.addEventListener("touchstart", event => {
      if (event.touches.length !== 2) return;
      pinchDistance = distance(event.touches);
      pinchZoom = state.mapZoom;
    }, { passive: true });
    viewport.addEventListener("touchmove", event => {
      if (event.touches.length !== 2 || !pinchDistance) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      applyMapZoom(pinchZoom * (distance(event.touches) / pinchDistance), {
        x: ((event.touches[0].clientX + event.touches[1].clientX) / 2) - rect.left,
        y: ((event.touches[0].clientY + event.touches[1].clientY) / 2) - rect.top
      });
    }, { passive: false });
    viewport.addEventListener("touchend", () => { pinchDistance = 0; }, { passive: true });
  }

  function render() {
    const root = document.getElementById("gamesenseLibraryView");
    if (!root) return;
    root.innerHTML = state.topic === "overview" ? renderOverview() : state.itemId ? renderDetail(state.topic, state.itemId) : renderGallery(state.topic);
    root.querySelectorAll("img[data-agent-fallback]").forEach(img => {
      img.addEventListener("error", () => {
        const fallback = img.dataset.agentFallback;
        if (fallback && img.src !== fallback) img.src = fallback;
      }, { once: true });
    });
    bindMapPanZoom();
  }

  function openLibrary(topic = "overview", itemId = "") {
    state.topic = topicMeta[topic] ? topic : "overview";
    state.itemId = itemId;
    state.role = "";
    state.detailId = "";
    state.mapView = "locations";
    state.mapZoom = 1;
    state.compAgent = "";
    const desktopNav = document.querySelector('.nav-btn[data-page="library"]');
    const mobileNav = document.querySelector('.mobile-bottom-page-btn[data-mobile-page="library"]');
    const selectedNav = document.documentElement.classList.contains("is-mobile-layout") ? mobileNav : desktopNav;
    if (!selectedNav?.classList.contains("active")) {
      selectedNav?.click();
    }
    render();
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
    const libraryPage = document.getElementById("page-library");
    if (libraryNav && libraryPage?.classList.contains("active") && state.topic !== "overview") {
      state.topic = "overview";
      state.itemId = "";
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.mapZoom = 1;
      state.compAgent = "";
      render();
      const owner = document.documentElement.classList.contains("is-mobile-layout") ? document.querySelector(".app-root") : libraryPage;
      if (owner) owner.scrollTop = 0;
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
      state.mapZoom = 1;
      state.compAgent = "";
      render();
      return;
    }
    const item = event.target.closest?.("[data-gamesense-item]");
    if (item) {
      state.itemId = item.dataset.gamesenseItem;
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.mapZoom = 1;
      state.compAgent = "";
      render();
      return;
    }
    const mapView = event.target.closest?.("[data-gamesense-map-view]");
    if (mapView) {
      state.mapView = mapView.dataset.gamesenseMapView === "plants" ? "plants" : "locations";
      render();
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
      render();
      return;
    }
    const role = event.target.closest?.("[data-gamesense-role]");
    if (role) {
      state.role = role.dataset.gamesenseRole;
      render();
      return;
    }
    const ability = event.target.closest?.("[data-gamesense-ability]");
    if (ability) {
      state.detailId = ability.dataset.gamesenseAbility;
      render();
      return;
    }
    const weapon = event.target.closest?.("[data-gamesense-weapon]");
    if (weapon) {
      state.detailId = weapon.dataset.gamesenseWeapon;
      render();
      return;
    }
    const back = event.target.closest?.("[data-gamesense-back]");
    if (back) {
      state.topic = back.dataset.gamesenseBack;
      state.itemId = "";
      state.role = "";
      state.detailId = "";
      state.mapView = "locations";
      state.mapZoom = 1;
      state.compAgent = "";
      render();
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
  globalThis.RankedCoachGamesenseLibrary = Object.freeze({ open: openLibrary, render });
})();
