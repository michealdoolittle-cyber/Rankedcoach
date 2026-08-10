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

  function replaceListEntry(item, listKey, index, nextValue) {
    const source = Array.isArray(item?.[listKey]) ? item[listKey] : [];
    if (!Number.isInteger(index) || index < 0 || index >= source.length) return item;
    const next = source.slice();
    const resolved = typeof nextValue === "function" ? nextValue(next[index]) : nextValue;
    if (resolved === next[index]) return item;
    next[index] = resolved;
    return { ...item, [listKey]: next };
  }

  function replaceObjectListField(item, listKey, index, field, text) {
    return replaceListEntry(item, listKey, index, entry => {
      if (!entry || typeof entry !== "object" || entry[field] === text) return entry;
      return { ...entry, [field]: text };
    });
  }

  function applyAgentPath(agent, path, value) {
    const text = cleanText(value);
    if (!text || !agent) return agent;
    const abilityMatch = String(path || "").match(/^abilities\.([^.]+)\.(summary|purpose|setup)$/);
    if (abilityMatch && Array.isArray(agent.abilities)) {
      const [, abilityId, field] = abilityMatch;
      let changed = false;
      const abilities = agent.abilities.map(ability => {
        if (ability?.id !== abilityId || ability[field] === text) return ability;
        changed = true;
        return { ...ability, [field]: text };
      });
      return changed ? { ...agent, abilities } : agent;
    }
    const fundamentalsMatch = String(path || "").match(/^fundamentals\.(\d+)$/);
    if (fundamentalsMatch) return replaceListEntry(agent, "fundamentals", Number(fundamentalsMatch[1]), text);
    const loreMatch = String(path || "").match(/^lore\.(\d+)\.(label|value|note)$/);
    if (loreMatch) return replaceObjectListField(agent, "lore", Number(loreMatch[1]), loreMatch[2], text);
    const historyMatch = String(path || "").match(/^patchHistory\.(\d+)\.(patch|note)$/);
    if (historyMatch) return replaceObjectListField(agent, "patchHistory", Number(historyMatch[1]), historyMatch[2], text);
    return agent;
  }

  function applyMapPath(map, path, value) {
    if (!map) return map;
    const tipCollectionMatch = String(path || "").match(/^tips\.(attack|defense|sites|teamplay)$/);
    if (tipCollectionMatch && Array.isArray(value)) {
      const category = tipCollectionMatch[1];
      const tips = value.map(entry => {
        const source = entry && typeof entry === "object" ? entry : {};
        return {
          ...source,
          label: cleanText(source.label) || "Round read",
          text: cleanText(typeof entry === "string" ? entry : source.text)
        };
      });
      if (category === "attack" || category === "defense") {
        return { ...map, macro: { ...(map.macro || {}), [category]: tips } };
      }
      const listKey = category === "sites" ? "siteTips" : "teamplayTips";
      return { ...map, [listKey]: tips };
    }
    const text = cleanText(value);
    if (!text) return map;
    const calloutMatch = String(path || "").match(/^callouts\.([^.]+)\.(label|sourceLabel)$/);
    if (calloutMatch && Array.isArray(map.callouts)) {
      const [, calloutId, field] = calloutMatch;
      let changed = false;
      const callouts = map.callouts.map(callout => {
        if (callout?.id !== calloutId || callout[field] === text) return callout;
        changed = true;
        return { ...callout, [field]: text };
      });
      return changed ? { ...map, callouts } : map;
    }
    if (path === "overview.note" && map.overview && typeof map.overview === "object") {
      return map.overview.note === text ? map : { ...map, overview: { ...map.overview, note: text } };
    }
    if (path === "compStatus") return map.compStatus === text ? map : { ...map, compStatus: text };
    if (path === "compSample.note" && map.compSample && typeof map.compSample === "object") {
      return map.compSample.note === text ? map : { ...map, compSample: { ...map.compSample, note: text } };
    }
    const insightMatch = String(path || "").match(/^agentInsights\.([^.]+)$/);
    if (insightMatch && map.agentInsights && typeof map.agentInsights === "object") {
      const agent = insightMatch[1];
      return map.agentInsights[agent] === text ? map : { ...map, agentInsights: { ...map.agentInsights, [agent]: text } };
    }
    const lineupMatch = String(path || "").match(/^lineupLinks\.(\d+)\.label$/);
    if (lineupMatch) return replaceObjectListField(map, "lineupLinks", Number(lineupMatch[1]), "label", text);
    const weaponMatch = String(path || "").match(/^weaponSuggestions\.(\d+)\.(fit|conversion|evidence|note)$/);
    if (weaponMatch) return replaceObjectListField(map, "weaponSuggestions", Number(weaponMatch[1]), weaponMatch[2], text);
    const tipMatch = String(path || "").match(/^(macro\.(attack|defense)|siteTips|teamplayTips)\.(\d+)(?:\.(label|text))?$/);
    if (tipMatch) {
      const [, sourceKey, macroView, indexText, field] = tipMatch;
      const index = Number(indexText);
      if (sourceKey.startsWith("macro.")) {
        const source = Array.isArray(map.macro?.[macroView]) ? map.macro[macroView] : [];
        if (!Number.isInteger(index) || index < 0 || index >= source.length) return map;
        const nextMacro = { ...map.macro };
        const next = source.slice();
        const entry = next[index];
        next[index] = typeof entry === "string" ? text : { ...entry, [field || "text"]: text };
        nextMacro[macroView] = next;
        return { ...map, macro: nextMacro };
      }
      const listKey = sourceKey;
      const source = Array.isArray(map[listKey]) ? map[listKey] : [];
      if (!Number.isInteger(index) || index < 0 || index >= source.length) return map;
      return replaceListEntry(map, listKey, index, entry => typeof entry === "string" ? text : { ...entry, [field || "text"]: text });
    }
    const roleTipMatch = String(path || "").match(/^roleNotes\.([^.]+)\.(\d+)(?:\.(label|text))?$/);
    if (roleTipMatch && map.roleNotes && typeof map.roleNotes === "object") {
      const [, role, indexText, field] = roleTipMatch;
      const source = Array.isArray(map.roleNotes[role]) ? map.roleNotes[role] : [];
      const index = Number(indexText);
      if (!Number.isInteger(index) || index < 0 || index >= source.length) return map;
      const next = source.slice();
      const entry = next[index];
      next[index] = typeof entry === "string" ? text : { ...entry, [field || "text"]: text };
      return { ...map, roleNotes: { ...map.roleNotes, [role]: next } };
    }
    return map;
  }

  function applyWeaponPath(weapon, path, value) {
    const text = cleanText(value);
    if (!text || !weapon) return weapon;
    if (path === "focus") return weapon.focus === text ? weapon : { ...weapon, focus: text };
    if (path === "libraryNotice" || path === "roundConversionNotice") {
      return weapon[path] === text ? weapon : { ...weapon, [path]: text };
    }
    const match = String(path || "").match(/^(whenToUse|howToUse)\.(\d+)$/);
    if (match) return replaceListEntry(weapon, match[1], Number(match[2]), text);
    const historyMatch = String(path || "").match(/^patchHistory\.(\d+)\.(patch|note)$/);
    if (historyMatch) return replaceObjectListField(weapon, "patchHistory", Number(historyMatch[1]), historyMatch[2], text);
    return weapon;
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
