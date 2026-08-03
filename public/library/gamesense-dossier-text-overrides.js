(function () {
  "use strict";

  // Owner-maintained corrections layer. The generated Gamesense data refreshes
  // on a schedule, so hand edits live here and are merged after generated files.
  // Paste exported editor JSON into DOSSIER_TEXT_OVERRIDES, then commit this file.
  const DOSSIER_TEXT_OVERRIDES = {
    agents: {},
    maps: {},
    weapons: {}
  };

  function getOverrides() {
    const external = globalThis.RankedCoachGamesenseDossierTextOverrides;
    return external && typeof external === "object" ? external : DOSSIER_TEXT_OVERRIDES;
  }

  function cleanText(value) {
    return String(value ?? "").trim();
  }

  function cloneItem(item) {
    if (!item || typeof item !== "object") return item;
    return { ...item };
  }

  function applyAgentPath(agent, path, value) {
    const match = String(path || "").match(/^abilities\.([^.]+)\.(summary|purpose|setup)$/);
    if (!match) return agent;
    const [, abilityId, field] = match;
    const text = cleanText(value);
    if (!text || !Array.isArray(agent?.abilities)) return agent;
    let changed = false;
    const abilities = agent.abilities.map(ability => {
      if (ability?.id !== abilityId || ability[field] === text) return ability;
      changed = true;
      return { ...ability, [field]: text };
    });
    return changed ? { ...agent, abilities } : agent;
  }

  function applyMapPath(map, path, value) {
    const match = String(path || "").match(/^callouts\.([^.]+)\.(label|sourceLabel)$/);
    if (!match) return map;
    const [, calloutId, field] = match;
    const text = cleanText(value);
    if (!text || !Array.isArray(map?.callouts)) return map;
    let changed = false;
    const callouts = map.callouts.map(callout => {
      if (callout?.id !== calloutId || callout[field] === text) return callout;
      changed = true;
      return { ...callout, [field]: text };
    });
    return changed ? { ...map, callouts } : map;
  }

  function applyWeaponPath(weapon, path, value) {
    const text = cleanText(value);
    if (!text || !weapon) return weapon;
    if (path === "focus") return weapon.focus === text ? weapon : { ...weapon, focus: text };
    const match = String(path || "").match(/^(whenToUse|howToUse)\.(\d+)$/);
    if (!match) return weapon;
    const [, listKey, indexText] = match;
    const index = Number(indexText);
    const sourceList = Array.isArray(weapon[listKey]) ? weapon[listKey] : [];
    if (!Number.isInteger(index) || index < 0 || index >= sourceList.length || sourceList[index] === text) return weapon;
    const nextList = sourceList.slice();
    nextList[index] = text;
    return { ...weapon, [listKey]: nextList };
  }

  function applyPaths(item, corrections, applyPath) {
    if (!item || !corrections || typeof corrections !== "object") return item;
    return Object.entries(corrections).reduce((current, [path, value]) => applyPath(current, path, value), item);
  }

  function applyAgentOverrides(agent, overrides) {
    return applyPaths(agent, overrides?.agents?.[agent?.id], applyAgentPath);
  }

  function applyMapOverrides(map, overrides) {
    return applyPaths(map, overrides?.maps?.[map?.id], applyMapPath);
  }

  function applyWeaponOverrides(weapon, overrides) {
    return applyPaths(weapon, overrides?.weapons?.[weapon?.id], applyWeaponPath);
  }

  function applyReferenceOverrides(overrides) {
    const reference = globalThis.RankedCoachGamesenseReference;
    if (!reference || typeof reference !== "object") return;
    const agents = Array.isArray(reference.agents)
      ? reference.agents.map(agent => applyAgentOverrides(agent, overrides))
      : reference.agents;
    const weapons = Array.isArray(reference.weapons)
      ? reference.weapons.map(group => {
        const nextGroup = cloneItem(group);
        nextGroup.weapons = Array.isArray(group?.weapons)
          ? group.weapons.map(weapon => applyWeaponOverrides(weapon, overrides))
          : group?.weapons;
        return nextGroup;
      })
      : reference.weapons;
    globalThis.RankedCoachGamesenseReference = Object.freeze({
      ...reference,
      agents: Array.isArray(agents) ? Object.freeze(agents) : agents,
      weapons: Array.isArray(weapons) ? Object.freeze(weapons) : weapons
    });
  }

  function applyMapOverridesToGlobal(overrides) {
    const maps = globalThis.RankedCoachGamesenseMaps;
    if (!Array.isArray(maps)) return;
    globalThis.RankedCoachGamesenseMaps = Object.freeze(maps.map(map => applyMapOverrides(map, overrides)));
  }

  function applyDossierTextOverrides(overrides = getOverrides()) {
    applyReferenceOverrides(overrides);
    applyMapOverridesToGlobal(overrides);
    globalThis.RankedCoachGamesenseDossierTextOverrides = overrides;
    return overrides;
  }

  globalThis.RankedCoachGamesenseDossierTextOverrides = getOverrides();
  globalThis.RankedCoachApplyDossierTextOverrides = applyDossierTextOverrides;
  applyDossierTextOverrides();
})();
