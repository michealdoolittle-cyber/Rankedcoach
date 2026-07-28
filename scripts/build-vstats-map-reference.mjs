/**
 * Build the static high-rank Map Dossier reference manifest.
 *
 * Sources:
 *   - https://www.vstats.gg/statistics/<act>/ALL/<map>/agent.json.gz
 *   - https://www.vstats.gg/statistics/<act>/ALL/<map>/comp.json.gz
 *   - https://valorant-api.com/v1/agents?isPlayableCharacter=true
 *
 * The manifest intentionally contains only measured aggregate pick data. It
 * never fills an unavailable rate with a guess. `r` values 22, 25 and 27 are
 * VStats' Ascendant, Immortal and Radiant buckets, respectively.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "public/library/gamesense-vstats-reference.js");
const HIGH_RANK_BUCKETS = Object.freeze([22, 25, 27]);
const SOURCE_BASE = "https://www.vstats.gg/statistics";
const AGENTS_ENDPOINT = "https://valorant-api.com/v1/agents?isPlayableCharacter=true";

const ACTS_NEWEST_FIRST = Object.freeze([
  { id: "4f0864e2-40af-28a4-de2c-0e9e64e75f23", label: "V26 Act 4", patchLabel: "13.00" },
  { id: "ce2783e8-44fc-dd48-3da3-33b5ba6c4a22", label: "V26 Act 3", patchLabel: "V26 Act 3" },
  { id: "9d85c932-4820-c060-09c3-668636d4df1b", label: "V26 Act 2", patchLabel: "V26 Act 2" },
  { id: "3ea2b318-423b-cf86-25da-7cbb0eefbe2d", label: "V26 Act 1", patchLabel: "V26 Act 1" },
  { id: "4c4b8cff-43eb-13d3-8f14-96b783c90cd2", label: "V25 Act 6", patchLabel: "V25 Act 6" },
  { id: "5adc33fa-4f30-2899-f131-6fba64c5dd3a", label: "V25 Act 5", patchLabel: "V25 Act 5" },
  { id: "ac12e9b3-47e6-9599-8fa1-0bb473e5efc7", label: "V25 Act 4", patchLabel: "V25 Act 4" },
  { id: "aef237a0-494d-3a14-a1c8-ec8de84e309c", label: "V25 Act 3", patchLabel: "V25 Act 3" },
  { id: "16118998-4705-5813-86dd-0292a2439d90", label: "V25 Act 2", patchLabel: "V25 Act 2" },
  { id: "476b0893-4c2e-abd6-c5fe-708facff0772", label: "V25 Act 1", patchLabel: "V25 Act 1" }
]);

const MAPS = Object.freeze([
  { id: "abyss", label: "Abyss", code: "Infinity" },
  { id: "ascent", label: "Ascent", code: "Ascent" },
  { id: "bind", label: "Bind", code: "Duality" },
  { id: "breeze", label: "Breeze", code: "Foxtrot" },
  { id: "corrode", label: "Corrode", code: "Rook" },
  { id: "fracture", label: "Fracture", code: "Canyon" },
  { id: "haven", label: "Haven", code: "Triad" },
  { id: "icebox", label: "Icebox", code: "Port" },
  { id: "lotus", label: "Lotus", code: "Jam" },
  { id: "pearl", label: "Pearl", code: "Pitt" },
  { id: "split", label: "Split", code: "Bonsai" },
  { id: "summit", label: "Summit", code: "Plummet" },
  { id: "sunset", label: "Sunset", code: "Juliett" }
]);

// These are VStats' published economy buckets. They stay as provider keys in
// the generated manifest; the Library maps them to player-facing labels rather
// than inferring a buy state from weapon price.
const WEAPON_ECONOMY_BUCKETS = Object.freeze([
  "pistol",
  "2nd_lost",
  "2nd_won",
  "full_eco",
  "unknown"
]);

function endpoint(actId, mapCode, resource) {
  return `${SOURCE_BASE}/${actId}/ALL/${encodeURIComponent(mapCode)}/${resource}.json.gz`;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });
  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(`Expected JSON from ${url}; received ${response.status} ${contentType || "unknown content type"}.`);
  }
  return response.json();
}

function highRankRows(rows, label) {
  if (!Array.isArray(rows)) throw new Error(`${label} did not return an array.`);
  const filtered = rows.filter(row => HIGH_RANK_BUCKETS.includes(Number(row?.r)));
  if (!filtered.length) throw new Error(`${label} did not return any Ascendant-to-Radiant rows.`);
  return filtered;
}

function aggregateAgentRows(rows, agentsById, label) {
  const totals = new Map();
  const winTotals = new Map();
  let selections = 0;
  for (const row of highRankRows(rows, label)) {
    const agent = agentsById.get(row?.a);
    if (!agent) throw new Error(`${label} contained an unknown agent UUID: ${String(row?.a)}.`);
    const matches = Number(row?.m);
    if (!Number.isFinite(matches) || matches < 0) {
      throw new Error(`${label} contained an invalid match count for ${agent.label}.`);
    }
    selections += matches;
    totals.set(agent.label, (totals.get(agent.label) || 0) + matches);
    const winRate = Number(row?.wr);
    if (Number.isFinite(winRate)) {
      winTotals.set(agent.label, (winTotals.get(agent.label) || 0) + (winRate * matches));
    }
  }
  if (!selections) throw new Error(`${label} had no high-rank agent selections.`);
  const estimatedMatches = selections / 5;
  if (!Number.isInteger(estimatedMatches)) {
    throw new Error(`${label} did not aggregate to complete five-player matches.`);
  }
  const rates = {};
  const winRates = {};
  for (const [agent, selectionsForAgent] of [...totals.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    rates[agent] = Number(((selectionsForAgent / estimatedMatches) * 100).toFixed(4));
    const weightedWinRate = winTotals.get(agent);
    if (Number.isFinite(weightedWinRate) && selectionsForAgent > 0) {
      winRates[agent] = Number((weightedWinRate / selectionsForAgent).toFixed(4));
    }
  }
  return {
    agentSelections: selections,
    matchCount: estimatedMatches,
    rates,
    winRates
  };
}

function aggregateWeaponRows(rows, weaponsById, label) {
  const totals = new Map();
  for (const row of highRankRows(rows, label)) {
    const weapon = weaponsById.get(String(row?.w || "").toLowerCase());
    const economy = String(row?.p || "").trim();
    if (!weapon || !WEAPON_ECONOMY_BUCKETS.includes(economy)) continue;
    const attackRounds = Number(row?.a_ro);
    const defenseRounds = Number(row?.d_ro);
    const attackRate = Number(row?.a_wr);
    const defenseRate = Number(row?.d_wr);
    if (!Number.isFinite(attackRounds) || !Number.isFinite(defenseRounds)
      || !Number.isFinite(attackRate) || !Number.isFinite(defenseRate)
      || attackRounds < 0 || defenseRounds < 0) {
      throw new Error(`${label} contained invalid weapon conversion data for ${weapon.label}.`);
    }
    const weaponTotals = totals.get(weapon.label) || new Map();
    const entry = weaponTotals.get(economy) || {
      attackRounds: 0,
      defenseRounds: 0,
      attackWins: 0,
      defenseWins: 0
    };
    entry.attackRounds += attackRounds;
    entry.defenseRounds += defenseRounds;
    entry.attackWins += attackRate * attackRounds;
    entry.defenseWins += defenseRate * defenseRounds;
    weaponTotals.set(economy, entry);
    totals.set(weapon.label, weaponTotals);
  }

  const output = {};
  for (const [weapon, economies] of [...totals.entries()].sort(([left], [right]) => left.localeCompare(right))) {
    const values = {};
    for (const [economy, entry] of economies) {
      const rounds = entry.attackRounds + entry.defenseRounds;
      if (!rounds) continue;
      values[economy] = {
        value: Number(((entry.attackWins + entry.defenseWins) / rounds).toFixed(4)),
        attackValue: entry.attackRounds ? Number((entry.attackWins / entry.attackRounds).toFixed(4)) : null,
        defenseValue: entry.defenseRounds ? Number((entry.defenseWins / entry.defenseRounds).toFixed(4)) : null,
        attackRounds: entry.attackRounds,
        defenseRounds: entry.defenseRounds,
        rounds
      };
    }
    if (Object.keys(values).length) output[weapon] = values;
  }
  if (!Object.keys(output).length) throw new Error(`${label} had no usable high-rank weapon conversion rows.`);
  return output;
}

function getRoleComposition(agentNames, agentsByName) {
  const counts = new Map();
  for (const name of agentNames) {
    const role = agentsByName.get(name)?.role;
    if (!role) throw new Error(`Missing official role metadata for ${name}.`);
    counts.set(role, (counts.get(role) || 0) + 1);
  }
  return ["Controller", "Duelist", "Initiator", "Sentinel"]
    .filter(role => counts.has(role))
    .map(role => `${counts.get(role)} ${role}${counts.get(role) === 1 ? "" : "s"}`)
    .join(", ");
}

function getRoleSignature(agentNames, agentsByName) {
  return agentNames
    .map(name => agentsByName.get(name)?.role || "Unknown")
    .sort()
    .join("|");
}

function buildMetaComps(rows, agentsById, agentsByName, label) {
  const exactComps = new Map();
  for (const row of highRankRows(rows, label)) {
    if (!Array.isArray(row?.as) || row.as.length !== 5) continue;
    const agents = row.as.map(id => agentsById.get(id)?.label);
    if (agents.some(name => !name)) {
      throw new Error(`${label} contained an unknown composition agent UUID.`);
    }
    const matches = Number(row?.m);
    if (!Number.isFinite(matches) || matches < 0) continue;
    const key = agents.slice().sort().join("|");
    const existing = exactComps.get(key) || { agents, matchCount: 0 };
    existing.matchCount += matches;
    exactComps.set(key, existing);
  }
  if (!exactComps.size) throw new Error(`${label} had no complete high-rank team-composition rows.`);

  const layouts = new Map();
  for (const comp of exactComps.values()) {
    const signature = getRoleSignature(comp.agents, agentsByName);
    const existing = layouts.get(signature) || { matchCount: 0, representative: null };
    existing.matchCount += comp.matchCount;
    if (!existing.representative || comp.matchCount > existing.representative.matchCount) {
      existing.representative = comp;
    }
    layouts.set(signature, existing);
  }

  const labels = ["Primary role layout", "Secondary role layout", "Alternate role layout"];
  return [...layouts.values()]
    .sort((left, right) => right.matchCount - left.matchCount)
    .slice(0, 3)
    .map((layout, index) => ({
      label: labels[index],
      agents: layout.representative.agents.slice().sort((left, right) => {
        const leftRole = agentsByName.get(left)?.role || "";
        const rightRole = agentsByName.get(right)?.role || "";
        return leftRole.localeCompare(rightRole) || left.localeCompare(right);
      }),
      composition: getRoleComposition(layout.representative.agents, agentsByName),
      roleLayoutMatchCount: layout.matchCount,
      representativeMatchCount: layout.representative.matchCount
    }));
}

function makeRolePickRates(mapRates, globalRates, agents) {
  return agents
    .map(agent => {
      const hasMapSample = Object.hasOwn(mapRates, agent.label);
      const hasGlobalSample = Object.hasOwn(globalRates, agent.label);
      return {
        agent: agent.label,
        role: agent.role,
        mapRate: hasMapSample ? Number(mapRates[agent.label]) : null,
        globalRate: hasGlobalSample ? Number(globalRates[agent.label]) : null,
        mapSampleAvailable: hasMapSample,
        globalSampleAvailable: hasGlobalSample
      };
    })
    .sort((left, right) => left.agent.localeCompare(right.agent));
}

function serialise(value) {
  return JSON.stringify(value, null, 2)
    .replace(/<\//g, "<\\/");
}

async function fetchMapActData(map, act, agentsById, weaponsById) {
  const agentUrl = endpoint(act.id, map.code, "agent");
  const compUrl = endpoint(act.id, map.code, "comp");
  const weaponUrl = endpoint(act.id, map.code, "weapon");
  try {
    const [agentRows, compRows, weaponRows] = await Promise.all([
      fetchJson(agentUrl),
      fetchJson(compUrl),
      fetchJson(weaponUrl)
    ]);
    return {
      act,
      agentUrl,
      compUrl,
      weaponUrl,
      agentRows,
      compRows,
      weaponRows,
      agent: aggregateAgentRows(agentRows, agentsById, `${map.id} ${act.label} agent data`),
      weapons: aggregateWeaponRows(weaponRows, weaponsById, `${map.id} ${act.label} weapon data`)
    };
  } catch (error) {
    const message = String(error?.message || error);
    // A VStats route returns its HTML app shell for maps which are not in the
    // selected act. That is a real "not retained" signal, not data to infer.
    if (/Expected JSON/.test(message)) return null;
    throw error;
  }
}

function rankGlobalAgents(globalRates) {
  return Object.entries(globalRates)
    .sort(([, left], [, right]) => Number(right) - Number(left))
    .reduce((ranks, [agent], index) => {
      ranks[agent] = index + 1;
      return ranks;
    }, {});
}

function buildAgentMapFits(mapReferences, currentGlobal, agents) {
  const globalRanks = rankGlobalAgents(currentGlobal.rates);
  const result = {};
  for (const agent of agents) {
    const mapRows = Object.values(mapReferences)
      .map(reference => ({
        map: reference.label,
        pickRate: Number(reference.highRankPickRates[agent.label]),
        winRate: Number(reference.highRankWinRates[agent.label]),
        sourceAct: reference.source.actLabel,
        sourcePatch: reference.source.patchLabel
      }))
      .filter(row => Number.isFinite(row.pickRate) || Number.isFinite(row.winRate))
      .sort((left, right) => right.winRate - left.winRate || right.pickRate - left.pickRate || left.map.localeCompare(right.map));
    const mapPickRates = {};
    const mapWinRates = {};
    const mapSources = {};
    for (const row of mapRows) {
      if (Number.isFinite(row.pickRate)) mapPickRates[row.map] = row.pickRate;
      if (Number.isFinite(row.winRate)) mapWinRates[row.map] = row.winRate;
      mapSources[row.map] = { actLabel: row.sourceAct, patchLabel: row.sourcePatch };
    }
    result[agent.label] = {
      role: agent.role,
      globalPickRate: Number(currentGlobal.rates[agent.label] || 0),
      globalPickRateRank: globalRanks[agent.label] || null,
      maps: mapRows.map(row => row.map),
      mapPickRates,
      mapWinRates,
      mapSources
    };
  }
  return result;
}

function buildRuntimeOutput(manifest) {
  return [
    "// Generated by scripts/build-vstats-map-reference.mjs.",
    "// VStats public high-rank Competitive aggregates. Do not hand edit.",
    "(function () {",
    "  \"use strict\";",
    "  const REFERENCE = Object.freeze(" + serialise(manifest) + ");",
    "",
    "  function applyToLoadedMaps() {",
    "    const maps = globalThis.RankedCoachGamesenseMaps;",
    "    if (!Array.isArray(maps)) return false;",
    "    maps.forEach(map => {",
    "      const reference = REFERENCE.maps[map?.id];",
    "      if (!reference) return;",
    "      map.highRankPickRates = { ...reference.highRankPickRates };",
    "      map.rolePickRates = reference.rolePickRates.map(item => ({ ...item }));",
    "      map.metaComps = reference.metaComps.map(item => ({",
    "        label: item.label,",
    "        agents: item.agents.slice(),",
    "        composition: item.composition",
    "      }));",
    "      map.metaComp = { ...(map.metaComp || {}), ...map.metaComps[0], patch: reference.source.patchLabel };",
    "      // A retained, verified aggregate replaces the generated placeholder state.",
    "      map.dataStatus = \"verified\";",
    "      map.compSample = {",
    "        rankLabel: reference.source.rankLabel,",
    "        patchLabel: reference.source.patchLabel,",
    "        currentPatchAgentSelections: reference.sample.agentSelections,",
    "        combinedAgentSelections: reference.sample.agentSelections,",
    "        source: reference.source.provider,",
    "        note: \"High-rank Competitive selection reference. Map and global pick shares use the same rank window; each role layout is an observed five-agent structure.\",",
    "        sourceUrl: reference.source.agentUrl",
    "      };",
    "      map.statsSource = {",
    "        provider: reference.source.provider,",
    "        actLabel: reference.source.actLabel,",
    "        patchLabel: reference.source.patchLabel,",
    "        rankLabel: reference.source.rankLabel,",
    "        agentUrl: reference.source.agentUrl,",
    "        compUrl: reference.source.compUrl",
    "      };",
    "      map.weaponConversionReference = {",
    "        source: {",
    "          provider: reference.source.provider,",
    "          actLabel: reference.source.actLabel,",
    "          patchLabel: reference.source.patchLabel,",
    "          rankLabel: reference.source.rankLabel,",
    "          weaponUrl: reference.source.weaponUrl",
    "        },",
    "        metrics: reference.weaponConversions",
    "      };",
    "    });",
    "    return true;",
    "  }",
    "",
    "  function applyToLoadedAgentReference() {",
    "    const reference = globalThis.RankedCoachGamesenseReference;",
    "    if (!Array.isArray(reference?.agents)) return false;",
    "    reference.agents.forEach(agent => {",
    "      const fit = REFERENCE.agents[agent?.label];",
    "      if (!fit) return;",
    "      agent.pickRate = fit.globalPickRate;",
    "      agent.pickRateRank = fit.globalPickRateRank;",
    "      agent.sampleLabel = \"VStats \" + REFERENCE.source.currentActLabel + \" | Ascendant to Radiant\";",
    "      agent.maps = fit.maps.slice();",
    "      agent.mapPickRates = { ...fit.mapPickRates };",
    "      agent.mapWinRates = { ...fit.mapWinRates };",
    "      agent.mapFitSources = { ...fit.mapSources };",
    "    });",
    "    return true;",
    "  }",
    "",
    "  globalThis.RankedCoachGamesenseVStatsReference = REFERENCE;",
    "  globalThis.RankedCoachApplyVStatsReference = applyToLoadedMaps;",
    "  globalThis.RankedCoachApplyVStatsAgentFits = applyToLoadedAgentReference;",
    "  applyToLoadedMaps();",
    "  applyToLoadedAgentReference();",
    "})();",
    ""
  ].join("\n");
}

async function main() {
  const officialAgentsPayload = await fetchJson(AGENTS_ENDPOINT);
  const officialAgents = (officialAgentsPayload?.data || [])
    .filter(agent => agent?.isPlayableCharacter && agent?.uuid && agent?.displayName && agent?.role?.displayName)
    .map(agent => ({
      id: agent.uuid,
      label: agent.displayName,
      role: agent.role.displayName
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
  if (!officialAgents.length) throw new Error("The official agent endpoint returned no playable agents.");
  const agentsById = new Map(officialAgents.map(agent => [agent.id, agent]));
  const agentsByName = new Map(officialAgents.map(agent => [agent.label, agent]));
  const officialWeaponsPayload = await fetchJson("https://valorant-api.com/v1/weapons?language=en-US");
  const weaponsById = new Map((officialWeaponsPayload?.data || [])
    .filter(weapon => weapon?.uuid && weapon?.displayName)
    .map(weapon => [String(weapon.uuid).toLowerCase(), { label: weapon.displayName }]));
  if (!weaponsById.size) throw new Error("The official weapon endpoint returned no weapons.");

  const globalByAct = new Map();
  async function getGlobalForAct(act) {
    if (globalByAct.has(act.id)) return globalByAct.get(act.id);
    const agentUrl = endpoint(act.id, "ALL", "agent");
    const rows = await fetchJson(agentUrl);
    const aggregate = aggregateAgentRows(rows, agentsById, `All-map ${act.label} agent data`);
    const result = { ...aggregate, agentUrl, act };
    globalByAct.set(act.id, result);
    return result;
  }

  const currentAct = ACTS_NEWEST_FIRST[0];
  const currentGlobal = await getGlobalForAct(currentAct);

  const maps = {};
  for (const map of MAPS) {
    let source = null;
    for (const act of ACTS_NEWEST_FIRST) {
      source = await fetchMapActData(map, act, agentsById, weaponsById);
      if (source) break;
    }
    if (!source) {
      throw new Error(`${map.label} has no retained VStats agent-and-composition sample in the approved fallback window.`);
    }
    const global = await getGlobalForAct(source.act);
    const metaComps = buildMetaComps(source.compRows, agentsById, agentsByName, `${map.id} ${source.act.label} composition data`);
    maps[map.id] = {
      label: map.label,
      mapCode: map.code,
      highRankPickRates: source.agent.rates,
      highRankWinRates: source.agent.winRates,
      rolePickRates: makeRolePickRates(source.agent.rates, global.rates, officialAgents),
      weaponConversions: source.weapons,
      unavailableAgents: officialAgents
        .filter(agent => !Object.hasOwn(source.agent.rates, agent.label))
        .map(agent => agent.label),
      metaComps,
      sample: {
        agentSelections: source.agent.agentSelections,
        matchCount: source.agent.matchCount,
        compositionLayoutMatches: metaComps.reduce((sum, comp) => sum + comp.roleLayoutMatchCount, 0)
      },
      source: {
        provider: "VStats.gg",
        actId: source.act.id,
        actLabel: source.act.label,
        patchLabel: source.act.patchLabel,
        rankLabel: "Ascendant to Radiant",
        rankBuckets: HIGH_RANK_BUCKETS,
        agentUrl: source.agentUrl,
        compUrl: source.compUrl,
        weaponUrl: source.weaponUrl,
        globalAgentUrl: global.agentUrl
      }
    };
    console.log(`${map.id}: ${source.act.label}; ${source.agent.matchCount.toLocaleString()} high-rank matches; ${metaComps.length} unique role layouts.`);
  }

  const generatedAt = new Date().toISOString();
  const manifest = {
    source: {
      provider: "VStats.gg",
      currentActId: currentAct.id,
      currentActLabel: currentAct.label,
      currentPatchLabel: currentAct.patchLabel,
      rankLabel: "Ascendant to Radiant",
      rankBuckets: HIGH_RANK_BUCKETS,
      fallbackActs: ACTS_NEWEST_FIRST.map(act => ({ id: act.id, label: act.label, patchLabel: act.patchLabel })),
      globalAgentUrl: currentGlobal.agentUrl,
      officialAgentsUrl: AGENTS_ENDPOINT,
      generatedAt,
      methodology: "Agent pick share = high-rank agent selections divided by high-rank matches, using the provider's r=22, r=25, and r=27 buckets. Map/global comparisons use the same retained act. Role-layout frequency aggregates full five-agent compositions before selecting a representative composition for each distinct role structure."
    },
    global: {
      highRankPickRates: currentGlobal.rates,
      highRankWinRates: currentGlobal.winRates,
      sample: {
        agentSelections: currentGlobal.agentSelections,
        matchCount: currentGlobal.matchCount
      }
    },
    maps,
    agents: buildAgentMapFits(maps, currentGlobal, officialAgents)
  };

  const runtimeOutput = buildRuntimeOutput(manifest);
  await mkdir(dirname(OUTPUT), { recursive: true });
  await writeFile(OUTPUT, runtimeOutput, "utf8");
  console.log(`Wrote ${OUTPUT}`);
  console.log(`Coverage: ${Object.keys(maps).length}/${MAPS.length} maps; ${officialAgents.length} official playable agents; ${currentGlobal.matchCount.toLocaleString()} current-act all-map high-rank matches.`);
}

main().catch(error => {
  console.error(error?.stack || error);
  process.exitCode = 1;
});
