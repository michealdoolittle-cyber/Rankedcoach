import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = path.join(ROOT, "public", "library", "gamesense-encyclopedia.js");
const API_ROOT = "https://valorant-api.com/v1";
const WIKI_API = "https://valorant.fandom.com/api.php";
const EXISTING_AGENT_IDS = new Set(["jett", "sova", "omen", "viper", "cypher", "sage"]);
const EXISTING_MAP_IDS = new Set(["bind", "breeze", "split"]);
const ACTIVE_MAPS = new Set(["ascent", "fracture", "haven", "lotus", "pearl", "breeze", "split"]);
const CURRENT_PATCH = "13.01";

const mapGuides = {
  ascent: {
    defense: ["Ascent's two one-way site doors can be closed to slow a retake route. Once shut, they must be broken before that lane can be used again."],
    attack: ["Mid connects both sites, so controlling it forces defenders to watch Market, Catwalk, and the two Main entrances instead of leaning into one choke."],
    teamplay: ["Name whether Market or Catwalk is controlled before the site group commits; Mid pressure only helps when both groups move on the same timing."]
  },
  fracture: {
    defense: ["Fracture lets attackers approach each site from opposite sides of the map. Defenders must decide whether to contest those outer lanes or protect the site from the pinch."],
    attack: ["The two attacker spawns make a real two-sided hit possible. Wait for both groups to reach their named lane before either side gives away the execute."],
    teamplay: ["Call which side of the site each group owns. A split attack loses its advantage when both groups clear the same defender angle."]
  },
  haven: {
    defense: ["Haven has three spike sites, so defenders cannot stack every entrance. Early information matters because a late rotation has farther to travel."],
    attack: ["Use the third site to stretch defender resources. Pressure one entrance, keep control of the connecting lanes, and change direction before the defense settles."],
    teamplay: ["Keep one player connected to Mid or Garage while the site group works. That player protects the rotation and prevents defenders from moving freely between three sites."]
  },
  lotus: {
    defense: ["Lotus has three sites plus rotating doors and a breakable wall. Those mechanics change which rotation lanes are open during the round."],
    attack: ["Secure the door or wall route before changing sites. Opening a route without a player ready to use it gives defenders the same shortcut."],
    teamplay: ["Call every rotating-door activation and breakable-wall change. The sound announces the route to both teams, so the next player must already know the plan."]
  },
  pearl: {
    defense: ["Pearl is a two-site map without teleporters, rotating doors, or other route-changing mechanics. Lane control and rotation timing decide how much ground defenders can keep."],
    attack: ["Mid connects several direct routes into both sites. Hold the central lane long enough that defenders cannot rotate through it for free."],
    teamplay: ["Name the exact Mid branch the team controls before a site finish. Pearl rewards clear lane ownership more than a late, unannounced route change."]
  },
  abyss: {
    defense: ["Abyss has open edges where players can fall out of the map. Defenders should keep movement paths clear when fighting near those exposed boundaries."],
    attack: ["Abyss uses vertical routes and exposed edges to change how players cross between lanes. Clear the landing and the ledge before committing movement utility."],
    teamplay: ["Call elevated and lower positions separately. A teammate clearing one height has not cleared the other angle watching the same lane."]
  },
  corrode: {
    defense: ["Corrode mixes long exterior sightlines with tighter interior routes. Defenders need an exit plan before taking an opening fight in either space."],
    attack: ["Use the named interior routes to shorten a long exterior fight, but clear each close corner before treating that route as safe."],
    teamplay: ["Say whether the next contact is a long lane or a tight room before utility is committed; the correct flash, smoke, and weapon spacing changes with that distance."]
  }
};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const slug = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const asciiText = value => String(value || "")
  .replace(/[\u2018\u2019]/g, "'")
  .replace(/[\u201C\u201D]/g, '"')
  .replace(/[\u2013\u2014]/g, "-")
  .replace(/\u2192/g, "to")
  .replace(/\u2026/g, "...")
  .replace(/\u00A0/g, " ");

async function fetchJson(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": "RankedCoach-Library-Generator/1.0" } });
    if (response.ok) return response.json();
    if (attempt === retries - 1) throw new Error(`${response.status} ${response.statusText}: ${url}`);
    await sleep(250 * (attempt + 1));
  }
}

async function parseWikiPage(title) {
  const params = new URLSearchParams({ action: "parse", page: title, prop: "wikitext", format: "json", origin: "*" });
  const data = await fetchJson(`${WIKI_API}?${params}`);
  return data?.parse?.wikitext?.["*"] || "";
}

function cleanWiki(value) {
  return String(value || "")
    .replace(/<!--.*?-->/gs, " ")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{\{ui\|([^}|]+)(?:\|[^}]*)?\}\}/g, "$1:")
    .replace(/\{\{abi text\|([^}|]+)(?:\|[^}]*)?\}\}/g, "$1")
    .replace(/\{\{patchv\|([^}|]+)(?:\|[^}]*)?\}\}/g, "Patch $1")
    .replace(/\{\{[^{}]*\|([^{}|]+)\}\}/g, "$1")
    .replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, "$1")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/'''?/g, "")
    .replace(/&gt;&gt;&gt;|>>>/g, "to")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function infoboxValue(wikitext, key) {
  const match = wikitext.match(new RegExp(`^\\|${key}\\s*=\\s*(.*)$`, "mi"));
  return cleanWiki(match?.[1] || "");
}

function parseUses(value) {
  const uses = String(value || "").match(/\{\{uses\|([^}|]+)/i)?.[1];
  const shared = String(value || "").match(/shared with \[\[([^\]]+)/i)?.[1];
  if (!uses) return cleanWiki(value) || "Current client value not published in Riot's public content feed";
  return shared ? `${uses}, shared with ${shared}` : uses;
}

function patchNoteUrl(patch) {
  const [major, minor = "0"] = String(patch).split(".");
  const suffix = Number(major) < 10 && minor === "00" ? "0" : minor;
  return `https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-${major}-${suffix}/`;
}

function parsePatchHistory(wikitext, label) {
  const headers = [...wikitext.matchAll(/\{\{patchv\|([0-9]+(?:\.[0-9]+)?)\}\}/g)];
  const result = [];
  const seen = new Set();
  for (let index = 0; index < headers.length && result.length < 2; index += 1) {
    const patch = headers[index][1];
    if (seen.has(patch)) continue;
    const sectionEnd = headers[index + 1]?.index ?? wikitext.length;
    const section = wikitext.slice(headers[index].index + headers[index][0].length, sectionEnd);
    const bullets = section.split(/\r?\n/)
      .filter(line => /^\*+\s*/.test(line))
      .map(line => cleanWiki(line.replace(/^\*+\s*/, "")))
      .filter(line => line && !/^Fixed a bug/i.test(line))
      .slice(0, 2);
    if (!bullets.length) continue;
    seen.add(patch);
    result.push({ patch, note: bullets.join(" "), source: patchNoteUrl(patch) });
  }
  while (result.length < 2) {
    const marker = result.length ? "Roster verification" : "Current ability verification";
    result.push({
      patch: CURRENT_PATCH,
      note: `${marker}: ${label} is listed in Riot's live playable-agent content feed. No additional balance value is inferred.`,
      source: "https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=en-US"
    });
  }
  return result;
}

function inferPurpose(name, description) {
  const text = String(description || "").toLowerCase();
  if (/blind|nearsight|flash/.test(text)) return `${name} is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.`;
  if (/smoke|vision blocker|blocking vision|wall of/.test(text)) return `${name} controls sightlines. Place it on the specific defender view the team needs removed, then move while that view is blocked.`;
  if (/reveal|detect|scan|track/.test(text)) return `${name} provides information. Use the reveal, detection, or tracking result to name an occupied space before a teammate commits.`;
  if (/heal|health|resurrect|revive/.test(text)) return `${name} preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.`;
  if (/dash|teleport|reposition|movement|speed/.test(text)) return `${name} changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.`;
  if (/damage|explod|detonat|missile|grenade/.test(text)) return `${name} applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.`;
  if (/trap|slow|stun|concuss|detain|suppress/.test(text)) return `${name} limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.`;
  return `${name} performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.`;
}

function inferSetup(name, description) {
  const text = String(description || "").toLowerCase();
  if (/equip/.test(text)) return `${name} must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.`;
  if (/place|deploy|throw|fire/.test(text)) return `${name} needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.`;
  if (/channel|windup|delay/.test(text)) return `${name} includes a channel, windup, or delay in its official behavior. Start it from safety and account for that time before contact.`;
  if (/reactivate|reuse|recast/.test(text)) return `${name} has a second activation in Riot's description. Decide what will trigger that follow-up before the first cast.`;
  return `${name} should be prepared around the official description above; no extra range, duration, or interaction is assumed when Riot's public feed does not state it.`;
}

async function getAbilityWiki(abilityName) {
  try {
    return await parseWikiPage(abilityName);
  } catch {
    return "";
  }
}

async function buildAgent(agent) {
  let agentWiki = "";
  try {
    agentWiki = await parseWikiPage(agent.displayName);
  } catch {
    // New agents can reach Riot's content API before a community reference page exists.
  }
  const abilityWikis = await Promise.all(agent.abilities.map(item => getAbilityWiki(item.displayName)));
  const abilities = agent.abilities.map((item, index) => {
    const wiki = abilityWikis[index];
    const type = infoboxValue(wiki, "type") || ({ Ability1: "Basic", Ability2: "Basic", Grenade: "Signature", Ultimate: "Ultimate", Passive: "Passive" }[item.slot] || item.slot);
    const key = infoboxValue(wiki, "key") || ({ Ability1: "C", Ability2: "Q", Grenade: "E", Ultimate: "X" }[item.slot] || "");
    const credits = infoboxValue(wiki, "creds");
    const points = infoboxValue(wiki, "points");
    let cost = credits ? `${credits} credits` : "Current client value not published in Riot's public content feed";
    if (/signature/i.test(type) && !credits) cost = "Free signature charge";
    if (/ultimate/i.test(type)) cost = points ? `${points.replace(/[^0-9].*$/, "")} ultimate points` : "Ultimate-point value not published in Riot's public content feed";
    if (/passive/i.test(type)) cost = "Passive; no purchase";
    return {
      id: slug(item.displayName),
      name: item.displayName,
      slot: `${key ? `${key} - ` : ""}${type}`,
      icon: item.displayIcon,
      summary: item.description,
      stats: {
        Cost: cost,
        Charges: parseUses(wiki.match(/^\|uses\s*=\s*(.*)$/mi)?.[1] || ""),
        Source: wiki ? "Riot game text + Valorant Wiki current infobox" : "Riot game text; economy detail unavailable"
      },
      purpose: inferPurpose(item.displayName, item.description),
      setup: inferSetup(item.displayName, item.description),
      source: `${API_ROOT}/agents/${agent.uuid}?language=en-US`
    };
  });
  const signature = abilities.find(item => /^E\s*-/.test(item.slot)) || abilities.find(item => /signature/i.test(item.slot));
  const ultimate = abilities.find(item => /ultimate/i.test(item.slot));
  return {
    id: slug(agent.displayName),
    label: agent.displayName,
    role: agent.role?.displayName || "Agent",
    maps: [],
    icon: agent.displayIconSmall || agent.displayIcon,
    portrait: agent.fullPortraitV2 || agent.fullPortrait || agent.bustPortrait || agent.displayIcon,
    fundamentals: [
      `Riot identifies ${agent.displayName} as a ${agent.role?.displayName || "playable agent"}. ${agent.description}`,
      signature ? `${signature.name} is ${agent.displayName}'s current Signature ability. ${signature.summary}` : `${agent.displayName}'s current ability slots are listed directly from Riot's live game-content feed.`,
      ultimate ? `${ultimate.name} is ${agent.displayName}'s Ultimate ability. ${ultimate.summary}` : `No Ultimate description is published for ${agent.displayName} in Riot's current public content feed.`
    ],
    patchHistory: parsePatchHistory(agentWiki, agent.displayName),
    abilities,
    lore: [
      { label: "Official role", value: agent.role?.displayName || "Agent", note: agent.role?.description || agent.description },
      { label: "Official profile", value: agent.displayName, note: agent.description }
    ],
    facts: [
      { label: "Global pick rate", value: "Not published", note: "Riot's public game-content feed does not publish a current Competitive pick-rate sample." },
      { label: "Map fit", value: "Not published", note: "No verified current-season map sample is attached to this dossier." }
    ],
    source: `${API_ROOT}/agents/${agent.uuid}?language=en-US`
  };
}

function mapPoint(map, callout) {
  return {
    label: [callout.superRegionName, callout.regionName].filter(Boolean).join(" "),
    x: Number(((callout.location.y * map.xMultiplier + map.xScalarToAdd) * 100).toFixed(2)),
    y: Number(((callout.location.x * map.yMultiplier + map.yScalarToAdd) * 100).toFixed(2))
  };
}

function buildMap(map) {
  const id = slug(map.displayName);
  const guide = mapGuides[id];
  const callouts = (map.callouts || []).map(callout => mapPoint(map, callout));
  const keyCallouts = callouts.filter(item => /site|main|mid|lobby|garage|door|link|tower/i.test(item.label)).slice(0, 6);
  const roleLabels = ["Duelist", "Initiator", "Controller", "Sentinel"];
  const roleNotes = Object.fromEntries(roleLabels.map((role, index) => {
    const first = keyCallouts[index % Math.max(1, keyCallouts.length)]?.label || `${map.displayName} lanes`;
    const second = keyCallouts[(index + 1) % Math.max(1, keyCallouts.length)]?.label || "the next named lane";
    const action = {
      Duelist: "Take first space only after support utility reaches the named defender angle.",
      Initiator: "Use information or disabling utility immediately before the teammate who will act on it.",
      Controller: "Block the sightline the team must cross, then keep one tool for the late-round route.",
      Sentinel: "Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
    }[role];
    return [role, [{ category: "sites", text: `On ${map.displayName}, connect ${first} to ${second}: ${action}` }]];
  }));
  return {
    id,
    label: map.displayName,
    inCompetitivePool: ACTIVE_MAPS.has(id),
    cardImage: map.splash,
    layoutImage: map.displayIcon,
    callouts,
    plantSpots: [],
    plantRateNote: "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    weaponSuggestions: [],
    weaponSuggestionNote: "No verified active-season weapon conversion sample is attached to this map dossier.",
    macro: { defense: guide.defense, attack: guide.attack },
    siteTips: keyCallouts.slice(0, 4).map((item, index) => ({
      label: item.label,
      text: `${item.label} is a verified Riot callout on ${map.displayName}. Clear or control this named space before reporting that the connected route is safe.`,
      roles: index % 2 ? ["Controller", "Sentinel"] : ["Duelist", "Initiator"]
    })),
    teamplayTips: [{ label: "Map structure", text: guide.teamplay }],
    roleNotes,
    metaComp: { agents: [], composition: "No verified current ranked composition sample", patch: CURRENT_PATCH },
    metaComps: [],
    compStatus: "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    agentInsights: {},
    lineupLinks: [],
    source: `${API_ROOT}/maps/${map.uuid}?language=en-US`
  };
}

const agentPayload = await fetchJson(`${API_ROOT}/agents?isPlayableCharacter=true&language=en-US`);
const mapPayload = await fetchJson(`${API_ROOT}/maps?language=en-US`);
const missingAgents = agentPayload.data
  .filter(agent => !EXISTING_AGENT_IDS.has(slug(agent.displayName)))
  .sort((left, right) => left.displayName.localeCompare(right.displayName));
const generatedAgents = [];
for (const agent of missingAgents) {
  generatedAgents.push(await buildAgent(agent));
  await sleep(40);
}
const generatedMaps = mapPayload.data
  .filter(map => mapGuides[slug(map.displayName)] && !EXISTING_MAP_IDS.has(slug(map.displayName)))
  .sort((left, right) => left.displayName.localeCompare(right.displayName))
  .map(buildMap);

const source = asciiText(`// Generated from Riot game-content data and source-linked current reference pages.\n// Run: node scripts/generate-gamesense-encyclopedia.mjs\n(function () {\n  "use strict";\n  const GENERATED_AGENTS = ${JSON.stringify(generatedAgents, null, 2)};\n  const GENERATED_MAPS = ${JSON.stringify(generatedMaps, null, 2)};\n  const baseReference = globalThis.RankedCoachGamesenseReference || { agents: [], weapons: [], warmupDetails: {} };\n  const baseMaps = globalThis.RankedCoachGamesenseMaps || [];\n  const agentsById = new Map([...baseReference.agents, ...GENERATED_AGENTS].map(agent => [agent.id, agent]));\n  const mapsById = new Map([...baseMaps, ...GENERATED_MAPS].map(map => [map.id, map]));\n  globalThis.RankedCoachGamesenseReference = Object.freeze({ ...baseReference, agents: Object.freeze([...agentsById.values()]) });\n  globalThis.RankedCoachGamesenseMaps = Object.freeze([...mapsById.values()]);\n})();\n`);

await writeFile(OUTPUT, source, "utf8");
console.log(`Wrote ${generatedAgents.length} agents and ${generatedMaps.length} maps to ${OUTPUT}`);
