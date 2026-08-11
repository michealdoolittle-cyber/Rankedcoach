(function () {
  "use strict";

  // Owner-maintained corrections layer. The generated Gamesense data refreshes
  // on a schedule, so hand edits live here and are merged after generated files.
  // Paste exported editor JSON into DOSSIER_TEXT_OVERRIDES, then commit this file.
  const DOSSIER_TEXT_OVERRIDES = {
    agents: {},
    maps: {
      ascent: {
        "tips.attack": [
          {
            label: "Mid! Mid! Mid!",
            text: "Mid-control on Ascent is vital to successful site executions as A, and B site have narrow choke holds to exit from main. This means site hits can stall from a single smoke or molly, completely delaying or denying a site execute. Make sure you pressure mid with presence or utility to split the defenders."
          },
          {
            label: "Teams that Anchor",
            text: "Teams that have a hard site anchor can be completely break by incorporating 2 strong late lurks. The first is the late B Main lurk, when your team takes site on A. The defender will know the plant started, verifying it is not a fake and begin the rotation where you get a free easy pick, and several choices of how you want to rotate or continue the flank pressure. The second is going to be from a very late Mid Pizza lurk. Most defenders expect you to maintain B Main, and tend to either fight together or smoke main to cut off the angle. When the defenders retake begins and you verified your B Main is not getting flanked you can commit to the longer Mid to Pizza rotation (knife out) and take a Market flank, or CT pick if you caught the defenders early enough. This kind of extra late lurk is the type that sticks with defenders for the entire game forcing accountability and awareness. It also makes any team that has a slower or tougher time retaking, literally impossible, especially if their comp has low utility to begin with"
          },
          {
            label: "Teams that Rotate Fast",
            text: "Fighting against teams that are heavy on reactivity instead of proactivity leaves a gap for you as an attacker. Defenders are always forced to take on a side of the map with 3 players leaning A or B. If they are reactive you can easily run 2 setups. The first is a general fake which always forces a map gap if defenders are taking the shortest route through their spawn . The second is a default. As an attacker you can have 2 people on both mains, and one mid plus a smoke to take map control. From here you gather the info on which site has the 3 players. There is no way for the defense to have even numbers on a 4 lane map. Either there is 2 on each site, with one tree or pizza plus a trip, if there are 2 mid then there is a site that contains 1 player A or B, or they are stacked on one side with stall utility on a Main which can be baited out by your default."
          },
          {
            label: "Teams that Fight Back",
            text: "Although not super common it is possible in ranked you will have teams that are extra aggressive on defense. The first insight is always to be aware of how much and the types of utility you are up against. Generally playing more patient is best as you come to expect these kinds of plays from your opponent, and is definitely better to catch early on based on the enemy composition. The other thing is for any lane pushed, opposite lanes tend to be reserved. If your team is getting pushed on B Main, A Main should be the weaker site. Being pushed with no Mid Control however is not an option. If the enemy is a Jett or Chamber you need to expect an operator on their snowballing economy and be prepared to either smoke these angles, force them out with recon or flash your team through these sight lines as an op swinging is at a massive disadvantage compared to an op holding."
          }
        ],
        "tips.teamplay": []
      }
    },
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
