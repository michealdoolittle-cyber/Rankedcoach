(function () {
  "use strict";

  const state = { topic: "overview", itemId: "" };
  const topicMeta = {
    maps: { label: "Maps", eyebrow: "Round Plan", copy: "Attack, defense, controller notes, current comps, and trusted lineup tools." },
    agents: { label: "Agents", eyebrow: "Role Read", copy: "Role expectations and repeatable habits for a focused first agent slice." },
    weapons: { label: "Weapons", eyebrow: "Gunfight Plan", copy: "Range, fire discipline, and economy reads by weapon family." }
  };

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
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
          <p>Pick a lane to study. Every entry is built for a quick pre-queue read, not a lecture.</p>
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

  function renderGallery(topic) {
    const meta = topicMeta[topic];
    const items = getTopicItems(topic);
    return `
      <div class="gamesense-gallery-head">
        <button class="gamesense-back" type="button" data-gamesense-back="overview">Back to topics</button>
        <div><span>${escapeHtml(meta.eyebrow)}</span><strong>${escapeHtml(meta.label)} Library</strong></div>
        <small>${items.length} entries in this first field guide</small>
      </div>
      <div class="gamesense-entry-grid gamesense-entry-grid-${topic}">
        ${items.map((item, index) => `
          <button class="gamesense-entry-card" type="button" data-gamesense-item="${escapeHtml(item.id)}" style="--entry-index:${index}">
            <span class="gamesense-entry-index">${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(topic === "maps" ? item.metaComp?.composition : topic === "agents" ? `${item.role} | ${item.maps.join(" / ")}` : `${item.examples} | ${item.range}`)}</small>
            <span>Read field notes</span>
          </button>
        `).join("")}
      </div>`;
  }

  function renderList(title, items = []) {
    return `
      <section class="gamesense-note-block">
        <h3>${escapeHtml(title)}</h3>
        <ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
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
        <section class="gamesense-controller-callout">
          <span>Controller Notes</span>
          <p>${escapeHtml(map.macro?.controllerNotes)}</p>
          <strong>${escapeHtml(map.macro?.macroPrinciple)}</strong>
        </section>
        <section class="gamesense-comp-card">
          <div><span>Current Meta Comp</span><strong>${escapeHtml(map.metaComp?.winRate)} win rate</strong></div>
          <div class="gamesense-agent-chips">${(map.metaComp?.agents || []).map(agent => `<span>${escapeHtml(agent)}</span>`).join("")}</div>
          <p>${escapeHtml(map.metaComp?.composition)}</p>
        </section>
        <section class="gamesense-lineups">
          <div><span>Find Lineups</span><strong>Use an illustrated lineup database</strong></div>
          <div>${(map.lineupLinks || []).map(link => `<a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}</div>
        </section>
      </div>`;
  }

  function renderAgentDetail(agent) {
    return `
      <div class="gamesense-detail-head">
        <button class="gamesense-back" type="button" data-gamesense-back="agents">Back to agents</button>
        <div><span>${escapeHtml(agent.role)} Field Guide</span><h2>${escapeHtml(agent.label)}</h2></div>
        <span class="gamesense-patch">First Slice</span>
      </div>
      <div class="gamesense-detail-grid gamesense-agent-detail">
        ${renderList("Role Fundamentals", agent.fundamentals)}
        ${renderList("Round Checklist", agent.signature)}
        <section class="gamesense-comp-card gamesense-map-fit">
          <div><span>Map Fit</span><strong>Start the review here</strong></div>
          <div class="gamesense-agent-chips">${agent.maps.map(map => `<button type="button" data-gamesense-open="maps" data-gamesense-item-target="${escapeHtml(map.toLowerCase())}">${escapeHtml(map)}</button>`).join("")}</div>
          <p>Use the map dossier beside these role habits so utility timing has a named place and purpose.</p>
        </section>
      </div>`;
  }

  function renderWeaponDetail(weapon) {
    return `
      <div class="gamesense-detail-head">
        <button class="gamesense-back" type="button" data-gamesense-back="weapons">Back to weapons</button>
        <div><span>${escapeHtml(weapon.range)}</span><h2>${escapeHtml(weapon.label)}</h2></div>
        <span class="gamesense-patch">${escapeHtml(weapon.examples)}</span>
      </div>
      <div class="gamesense-detail-grid gamesense-weapon-detail">
        ${renderList("Fight Plan", weapon.fundamentals)}
        ${renderList("Economy Read", weapon.economy)}
      </div>`;
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
    document.querySelectorAll("[data-gamesense-topic-nav]").forEach(button => {
      button.classList.toggle("active", button.dataset.gamesenseTopicNav === state.topic);
    });
    root.innerHTML = state.topic === "overview"
      ? renderOverview()
      : state.itemId
        ? renderDetail(state.topic, state.itemId)
        : renderGallery(state.topic);
    root.scrollTop = 0;
  }

  function openLibrary(topic = "overview", itemId = "") {
    state.topic = topicMeta[topic] ? topic : "overview";
    state.itemId = itemId;
    document.querySelector('.nav-btn[data-page="library"]')?.click();
    render();
  }

  function decorateWarmupDrills() {
    const details = getReference().warmupDetails || {};
    document.querySelectorAll("[data-warmup-drill]").forEach(card => {
      const steps = details[card.dataset.warmupDrill];
      if (!steps || card.querySelector("[data-warmup-info]")) return;
      const toggle = document.createElement("span");
      toggle.className = "daily-warmup-info-toggle";
      toggle.dataset.warmupInfo = card.dataset.warmupDrill;
      toggle.setAttribute("role", "button");
      toggle.setAttribute("tabindex", "0");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `Show ${card.querySelector("strong")?.textContent || "drill"} steps`);
      toggle.textContent = "?";
      const detail = document.createElement("span");
      detail.className = "daily-warmup-info-detail";
      detail.hidden = true;
      detail.innerHTML = `<strong>Run it clean</strong><ol>${steps.map(step => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`;
      card.append(toggle, detail);
    });
  }

  function toggleWarmupInfo(toggle) {
    const card = toggle.closest("[data-warmup-drill]");
    const detail = card?.querySelector(".daily-warmup-info-detail");
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
      render();
      return;
    }
    const topicNav = event.target.closest?.("[data-gamesense-topic-nav]");
    if (topicNav) {
      state.topic = topicNav.dataset.gamesenseTopicNav;
      state.itemId = "";
      render();
      return;
    }
    const item = event.target.closest?.("[data-gamesense-item]");
    if (item) {
      state.itemId = item.dataset.gamesenseItem;
      render();
      return;
    }
    const back = event.target.closest?.("[data-gamesense-back]");
    if (back) {
      state.topic = back.dataset.gamesenseBack;
      state.itemId = "";
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
