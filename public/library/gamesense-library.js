(function () {
  "use strict";

  const state = { topic: "overview", itemId: "", role: "", detailId: "" };
  const topicMeta = {
    maps: { label: "Maps", eyebrow: "Round Plan", copy: "Attack, defense, role notes, current comps, and marked tactical layouts." },
    agents: { label: "Agents", eyebrow: "Role Read", copy: "Role expectations, ability facts, costs, timing, and repeatable setups." },
    weapons: { label: "Weapons", eyebrow: "Gunfight Plan", copy: "Selectable weapon art, damage ranges, economy, and fight decisions." }
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
    return `
      <div class="gamesense-overview">
        <div class="gamesense-briefing">
          <span>Reference Room</span>
          <strong>Build the round before the barrier drops.</strong>
          <p>Choose what you want to study, then open the exact map, agent, or weapon decision.</p>
        </div>
        <div class="gamesense-topic-grid">
          ${Object.entries(topicMeta).map(([key, meta], index) => `
            <button class="gamesense-topic-card" type="button" data-gamesense-topic="${key}" style="--topic-index:${index}">
              <span class="gamesense-topic-number">0${index + 1}</span>
              <span class="gamesense-topic-eyebrow">${escapeHtml(meta.eyebrow)}</span>
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
        <div><span>${escapeHtml(meta.eyebrow)}</span><strong>${escapeHtml(meta.label)} Library</strong></div>
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
    return `
      <section class="gamesense-tactical-card">
        <div class="gamesense-section-heading"><span>Marked Tactical Map</span><strong>Named fight locations</strong></div>
        <div class="gamesense-tactical-scroll" tabindex="0" aria-label="Scrollable ${escapeHtml(map.label)} tactical map">
          <div class="gamesense-tactical-stage">
            <img src="${escapeHtml(map.layoutImage)}" alt="${escapeHtml(map.label)} tactical layout" loading="eager">
            ${(map.callouts || []).map(callout => `<span class="gamesense-callout" style="--callout-x:${Number(callout.x)}%;--callout-y:${Number(callout.y)}%">${escapeHtml(callout.label)}</span>`).join("")}
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
            ${roles.map(role => `<button type="button" data-gamesense-role="${role}" class="${role === activeRole ? "active" : ""}">${role}</button>`).join("")}
          </div>
        </details>
        ${activeRole ? renderList(`${activeRole} Plan`, map.roleNotes?.[activeRole] || [], "gamesense-role-result") : `<p class="gamesense-role-prompt">Choose your role to turn the map overview into a job for your next round.</p>`}
      </section>`;
  }

  function renderComp(map) {
    return `
      <section class="gamesense-comp-card">
        <div><span>Current Meta Comp</span><strong>${escapeHtml(map.metaComp?.winRate)} win rate</strong></div>
        <div class="gamesense-comp-agents">${(map.metaComp?.agents || []).map(agent => `
          <figure><img src="${escapeHtml(getAgentIcon(agent))}" alt="${escapeHtml(agent)}" loading="lazy"><figcaption>${escapeHtml(agent)}</figcaption></figure>
        `).join("")}</div>
        <p>${escapeHtml(map.metaComp?.composition)}</p>
      </section>`;
  }

  function renderMapDetail(map) {
    return `
      <div class="gamesense-detail-head">
        <button class="gamesense-back" type="button" data-gamesense-back="maps">Back to maps</button>
        <div><span>Map Dossier</span><h2>${escapeHtml(map.label)}</h2></div>
        <span class="gamesense-patch">As of Patch ${escapeHtml(map.metaComp?.patch)}</span>
      </div>
      ${renderMarkedMap(map)}
      <div class="gamesense-detail-grid">
        ${renderList("Defense", map.macro?.defense)}
        ${renderList("Attack", map.macro?.attack)}
        ${renderRoleNotes(map)}
        <section class="gamesense-controller-callout">
          <span>Controller Notes</span>
          <p>${escapeHtml(map.macro?.controllerNotes)}</p>
          <strong>${escapeHtml(map.macro?.macroPrinciple)}</strong>
        </section>
        ${renderComp(map)}
        <section class="gamesense-lineups">
          <div><span>Find Lineups</span></div>
          <div>${(map.lineupLinks || []).map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}</div>
        </section>
      </div>`;
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
        <img src="${escapeHtml(agent.portrait)}" alt="${escapeHtml(agent.label)}" loading="eager">
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
        <div><span>Map Fit</span><strong>Open the matching plan</strong></div>
        <div class="gamesense-agent-chips">${agent.maps.map(map => `<button type="button" data-gamesense-open="maps" data-gamesense-item-target="${escapeHtml(map.toLowerCase())}">${escapeHtml(map)}</button>`).join("")}</div>
      </section>`;
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
        <div class="gamesense-weapon-panel-copy"><span>Weapon Analysis</span><h3>${escapeHtml(weapon.label)}</h3><p>${escapeHtml(weapon.focus)}</p></div>
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

  function render() {
    const root = document.getElementById("gamesenseLibraryView");
    if (!root) return;
    root.innerHTML = state.topic === "overview" ? renderOverview() : state.itemId ? renderDetail(state.topic, state.itemId) : renderGallery(state.topic);
  }

  function openLibrary(topic = "overview", itemId = "") {
    state.topic = topicMeta[topic] ? topic : "overview";
    state.itemId = itemId;
    state.role = "";
    state.detailId = "";
    document.querySelector('.nav-btn[data-page="library"]')?.click();
    document.querySelector('.mobile-bottom-page-btn[data-mobile-page="library"]')?.click();
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
      render();
      return;
    }
    const item = event.target.closest?.("[data-gamesense-item]");
    if (item) {
      state.itemId = item.dataset.gamesenseItem;
      state.role = "";
      state.detailId = "";
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
