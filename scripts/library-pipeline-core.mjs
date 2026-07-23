import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PUBLIC_ROOT = path.join(ROOT, "public");
export const LIBRARY_ROOT = path.join(PUBLIC_ROOT, "library");
export const DRAFT_ROOT = path.join(LIBRARY_ROOT, "_drafts");
export const SCREENSHOT_ROOT = path.join(DRAFT_ROOT, "screenshots");
export const PROMOTED_OUTPUT = path.join(LIBRARY_ROOT, "gamesense-promoted.js");
export const BASELINE_MARKER = path.join(DRAFT_ROOT, ".baseline-promotion-complete.json");
export const VALORANT_API_ROOT = "https://valorant-api.com/v1";

export const COMPETITIVE_MAP_IDS = Object.freeze([
  "abyss",
  "ascent",
  "bind",
  "breeze",
  "corrode",
  "fracture",
  "haven",
  "icebox",
  "lotus",
  "pearl",
  "split",
  "summit",
  "sunset"
]);

export const ACTIVE_MAP_IDS = new Set([
  "ascent",
  "breeze",
  "haven",
  "lotus",
  "split",
  "summit",
  "sunset"
]);

const ROLE_KEYS = Object.freeze({
  Ability1: "C",
  Ability2: "Q",
  Grenade: "E",
  Ultimate: "X",
  Passive: "Passive"
});

const ABILITY_TYPES = Object.freeze({
  Ability1: "Basic",
  Ability2: "Basic",
  Grenade: "Signature",
  Ultimate: "Ultimate",
  Passive: "Passive"
});

const MAP_LABEL_SOURCE_OVERRIDES = Object.freeze({
  bind: [
    "https://valohub.co/maps/bind",
    "https://www.reddit.com/r/VALORANT/comments/1dlyx4x/why_does_bind_have_different_callouts_then_the_map/"
  ],
  breeze: [
    "https://valohub.co/maps/breeze",
    "https://www.redbull.com/us-en/valorant-breeze-map-guide"
  ],
  split: [
    "https://valohub.co/maps/split",
    "https://valorantinfo.gg/maps/split/"
  ]
});

const COMMUNITY_CALLOUT_LABELS = Object.freeze({
  bind: Object.freeze({
    "A Bath": "A Showers",
    "A Lamps": "A Lamps / U-Haul",
    "A Tower": "A Heaven",
    "B Window": "B Hookah"
  }),
  split: Object.freeze({
    "A Sewer": "A Sewers",
    "A Tower": "A Heaven",
    "B Garage": "B Main",
    "B Tower": "B Heaven",
    "Mid Vent": "Mid Vents"
  })
});

export function slug(value = "") {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function plain(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function patchLabel(versionPayload = {}) {
  const branch = String(versionPayload.branch || "");
  const branchMatch = branch.match(/release-(\d+\.\d+)/i);
  if (branchMatch) return branchMatch[1];
  const versionMatch = String(versionPayload.version || "").match(/^(\d+\.\d+)/);
  return versionMatch?.[1] || "Current";
}

export async function fetchJson(url, options = {}, retries = 3) {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "User-Agent": "RankedCoach-Library-Pipeline/1.0",
          ...(options.headers || {})
        },
        signal: options.signal || AbortSignal.timeout(20_000)
      });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) await new Promise(resolve => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }
  throw lastError;
}

export async function ensureDraftDirectories() {
  await Promise.all([
    mkdir(DRAFT_ROOT, { recursive: true }),
    mkdir(SCREENSHOT_ROOT, { recursive: true })
  ]);
}

async function runLibrarySource(context, relativePath) {
  const source = await readFile(path.join(PUBLIC_ROOT, relativePath), "utf8");
  vm.runInContext(source, context, { filename: relativePath });
}

export async function loadLibraryState({ includePromoted = true } = {}) {
  const sandbox = {};
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  const context = vm.createContext(sandbox);
  await runLibrarySource(context, "library/gamesense-reference.js");
  const authoredReference = plain(context.RankedCoachGamesenseReference || {});
  await runLibrarySource(context, "library/gamesense-maps.js");
  const authoredMaps = plain(context.RankedCoachGamesenseMaps || []);
  await runLibrarySource(context, "library/gamesense-encyclopedia.js");
  if (includePromoted) {
    try {
      await runLibrarySource(context, "library/gamesense-promoted.js");
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }
  return {
    authoredReference,
    authoredMaps,
    reference: plain(context.RankedCoachGamesenseReference || {}),
    maps: plain(context.RankedCoachGamesenseMaps || [])
  };
}

export function mapCalloutPoint(map, callout) {
  return {
    x: Number(((callout.location.y * map.xMultiplier + map.xScalarToAdd) * 100).toFixed(2)),
    y: Number(((callout.location.x * map.yMultiplier + map.yScalarToAdd) * 100).toFixed(2))
  };
}

export function internalCalloutLabel(callout = {}) {
  return [callout.superRegionName, callout.regionName].filter(Boolean).join(" ").trim();
}

export function communityCalloutLabel(mapId, callout = {}) {
  const internal = internalCalloutLabel(callout);
  return COMMUNITY_CALLOUT_LABELS[mapId]?.[internal] || internal;
}

export function mapLabelSources(mapId, mapUuid) {
  const community = MAP_LABEL_SOURCE_OVERRIDES[mapId] || [
    `https://valohub.co/maps/${mapId}`,
    `https://www.valocheck.com/maps/${mapId}/`
  ];
  return [
    `${VALORANT_API_ROOT}/maps/${mapUuid}?language=en-US`,
    ...community
  ];
}

export function buildCanonicalCallouts(map) {
  const mapId = slug(map.displayName);
  return (map.callouts || []).map((callout, index) => ({
    id: `${mapId}-${index + 1}`,
    sourceKey: `${callout.superRegionName || ""}::${callout.regionName || ""}`,
    sourceLabel: internalCalloutLabel(callout),
    label: communityCalloutLabel(mapId, callout),
    superRegionName: callout.superRegionName || "",
    regionName: callout.regionName || "",
    ...mapCalloutPoint(map, callout)
  }));
}

export function buildCanonicalAbilities(agent) {
  return (agent.abilities || []).map(ability => {
    const key = ROLE_KEYS[ability.slot] || "";
    const type = ABILITY_TYPES[ability.slot] || ability.slot || "Ability";
    return {
      id: slug(ability.displayName),
      name: ability.displayName,
      slot: `${key ? `${key} - ` : ""}${type}`,
      icon: ability.displayIcon || "",
      summary: ability.description || "",
      source: `${VALORANT_API_ROOT}/agents/${agent.uuid}?language=en-US`
    };
  });
}

function penetrationLabel(value = "") {
  return String(value).split("::").pop().replace(/([a-z])([A-Z])/g, "$1 $2") || "Unknown";
}

export function buildCanonicalWeapon(weapon) {
  const stats = weapon.weaponStats || {};
  return {
    id: slug(weapon.displayName),
    uuid: weapon.uuid,
    label: weapon.displayName,
    image: weapon.displayIcon || "",
    cost: Number(weapon.shopData?.cost || 0),
    magazine: Number(stats.magazineSize || 0),
    fireRate: Number.isFinite(Number(stats.fireRate)) ? `${Number(stats.fireRate)} rounds/sec` : "Unavailable",
    penetration: penetrationLabel(stats.wallPenetration),
    damageRanges: (stats.damageRanges || []).map(range => ({
      range: `${Number(range.rangeStartMeters)}-${Number(range.rangeEndMeters)}m`,
      head: Number(Number(range.headDamage).toFixed(2)),
      body: Number(Number(range.bodyDamage).toFixed(2)),
      legs: Number(Number(range.legDamage).toFixed(2))
    })),
    source: `${VALORANT_API_ROOT}/weapons/${weapon.uuid}?language=en-US`
  };
}

export function weaponGroupId(weapon = {}) {
  const id = slug(weapon.displayName);
  if (["vandal", "phantom"].includes(id)) return "rifles";
  if (["bulldog", "guardian"].includes(id)) return "precision";
  const category = String(weapon.shopData?.category || weapon.category || "").toLowerCase();
  if (category.includes("sniper")) return "snipers";
  if (category.includes("smg")) return "smgs";
  if (category.includes("shotgun")) return "shotguns";
  if (category.includes("pistol") || category.includes("sidearm")) return "sidearms";
  if (category.includes("heavy")) return "machine-guns";
  return "other";
}

export function deepMerge(base, patch) {
  if (Array.isArray(patch)) return plain(patch);
  if (!patch || typeof patch !== "object") return patch;
  const result = base && typeof base === "object" && !Array.isArray(base) ? { ...base } : {};
  for (const [key, value] of Object.entries(patch)) {
    if (key === "abilities" && Array.isArray(value)) {
      const previous = new Map((Array.isArray(result.abilities) ? result.abilities : []).map(item => [item.id, item]));
      result.abilities = value.map(item => deepMerge(previous.get(item.id), item));
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = deepMerge(result[key], value);
    } else {
      result[key] = plain(value);
    }
  }
  return result;
}

export function fieldMeta({ tier, sources = [], approved = tier === "canonical", confidence = "" } = {}) {
  return {
    _tier: tier,
    _sources: [...new Set(sources.filter(Boolean))],
    approved: Boolean(approved),
    confidence: confidence || (
      tier === "canonical"
        ? "n/a (auto-approved)"
        : `${sources.length} corroborating source${sources.length === 1 ? "" : "s"} logged`
    )
  };
}

export function canPromote(meta = {}) {
  if (!meta.approved) return false;
  if (meta._tier === "canonical") return true;
  return meta._tier === "synthesized" && Array.isArray(meta._sources) && meta._sources.length >= 3;
}

export function reviewValue(value) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

export function escapeMarkdownCell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, stableJson(value), "utf8");
}
