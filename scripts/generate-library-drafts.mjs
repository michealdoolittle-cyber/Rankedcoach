import path from "node:path";
import {
  ACTIVE_MAP_IDS,
  COMPETITIVE_MAP_IDS,
  DRAFT_ROOT,
  VALORANT_API_ROOT,
  buildCanonicalAbilities,
  buildCanonicalCallouts,
  buildCanonicalWeapon,
  deepMerge,
  ensureDraftDirectories,
  fetchJson,
  fieldMeta,
  loadLibraryState,
  mapLabelSources,
  patchLabel,
  plain,
  slug,
  todayIso,
  weaponGroupId,
  writeJson
} from "./library-pipeline-core.mjs";

const baseline = process.argv.includes("--baseline");
const generatedAt = new Date().toISOString();
const reviewedDate = todayIso();
const unsourcedLegacyMapIds = new Set([
  "abyss", "ascent", "corrode", "fracture", "haven", "lotus", "pearl"
]);

function entityDraft({ category, entity, patchVersion, canonicalMeta, specialMeta = {}, operation = "merge", groupId = "" }) {
  const metadata = {};
  for (const key of Object.keys(entity)) {
    if (key.startsWith("_")) continue;
    metadata[key] = canonicalMeta[key] || fieldMeta({
      tier: "synthesized",
      sources: Array.isArray(entity?._sources) ? entity._sources : [],
      approved: false,
      confidence: "Existing authored field; fresh corroboration required before regeneration can replace it"
    });
  }
  Object.assign(metadata, specialMeta);
  return {
    ...plain(entity),
    _meta: {
      schemaVersion: 1,
      category,
      slug: entity.id,
      entityName: entity.label,
      operation,
      groupId,
      generatedAt,
      generationReason: baseline ? "One-time full-coverage baseline" : "Scheduled canonical refresh",
      patchVersion,
      lastReviewed: reviewedDate
    },
    _fieldMeta: metadata
  };
}

function indexById(items = []) {
  return new Map(items.filter(Boolean).map(item => [item.id || slug(item.label), item]));
}

function flattenWeapons(reference = {}) {
  const entries = [];
  for (const group of reference.weapons || []) {
    for (const weapon of group.weapons || []) entries.push({ weapon, groupId: group.id });
  }
  return entries;
}

function canonicalMeta(source, fields) {
  return Object.fromEntries(fields.map(field => [field, fieldMeta({
    tier: "canonical",
    sources: [source],
    approved: true
  })]));
}

await ensureDraftDirectories();

const [
  versionPayload,
  agentPayload,
  mapPayload,
  weaponPayload,
  state
] = await Promise.all([
  fetchJson(`${VALORANT_API_ROOT}/version`),
  fetchJson(`${VALORANT_API_ROOT}/agents?isPlayableCharacter=true&language=en-US`),
  fetchJson(`${VALORANT_API_ROOT}/maps?language=en-US`),
  fetchJson(`${VALORANT_API_ROOT}/weapons?language=en-US`),
  loadLibraryState()
]);

const patchVersion = patchLabel(versionPayload.data);
const authoredAgents = indexById(state.authoredReference.agents);
const liveAgents = indexById(state.reference.agents);
const liveMaps = indexById(state.maps);
const liveWeapons = new Map(flattenWeapons(state.reference).map(item => [item.weapon.id, item]));
const written = [];

for (const agent of [...agentPayload.data].sort((left, right) => left.displayName.localeCompare(right.displayName))) {
  const id = slug(agent.displayName);
  const source = `${VALORANT_API_ROOT}/agents/${agent.uuid}?language=en-US`;
  // Prefer the authored entry when one exists. This is important for Raze:
  // the old encyclopedia merge replaced her authored coaching copy.
  const authored = authoredAgents.get(id);
  const live = liveAgents.get(id);
  const current = authored
    ? deepMerge(live || {}, authored)
    : live || {
      id,
      label: agent.displayName,
      maps: [],
      fundamentals: [],
      patchHistory: [],
      lore: []
    };
  let entity = deepMerge(current, {
    id,
    uuid: agent.uuid,
    label: agent.displayName,
    role: agent.role?.displayName || "Agent",
    icon: agent.displayIconSmall || agent.displayIcon || "",
    portrait: agent.fullPortraitV2 || agent.fullPortrait || agent.bustPortrait || agent.displayIcon || "",
    abilities: buildCanonicalAbilities(agent),
    source
  });
  const draft = entityDraft({
    category: "agent",
    entity,
    patchVersion,
    operation: liveAgents.has(id) ? "merge" : "append",
    canonicalMeta: canonicalMeta(source, ["id", "uuid", "label", "role", "icon", "portrait", "abilities", "source"])
  });
  const file = path.join(DRAFT_ROOT, `agent-${id}.json`);
  await writeJson(file, draft);
  written.push(file);
}

const competitiveMaps = mapPayload.data
  .filter(map => COMPETITIVE_MAP_IDS.includes(slug(map.displayName)))
  .sort((left, right) => left.displayName.localeCompare(right.displayName));

for (const map of competitiveMaps) {
  const id = slug(map.displayName);
  const source = `${VALORANT_API_ROOT}/maps/${map.uuid}?language=en-US`;
  const labelSources = mapLabelSources(id, map.uuid);
  const current = liveMaps.get(id) || {
    id,
    label: map.displayName,
    plantSpots: [],
    weaponSuggestions: [],
    siteTips: [],
    teamplayTips: [],
    roleNotes: {},
    metaComp: { agents: [], composition: "No verified current ranked composition sample", patch: patchVersion },
    metaComps: [],
    agentInsights: {},
    lineupLinks: []
  };
  const bakedLayout = ["bind", "breeze"].includes(id)
    ? `/assets/library/maps/${id}-layout-labeled.svg`
    : id === "split"
      ? (current.layoutImage || "/assets/library/maps/split-layout-trn.png")
      : map.displayIcon;
  let entity = deepMerge(current, {
    id,
    uuid: map.uuid,
    label: map.displayName,
    coordinates: map.coordinates || "",
    inCompetitivePool: ACTIVE_MAP_IDS.has(id),
    cardImage: map.splash || map.listViewIcon || "",
    layoutImage: bakedLayout || "",
    calloutLabelsBakedIn: ["bind", "breeze", "split"].includes(id),
    callouts: buildCanonicalCallouts(map),
    source
  });
  if (!liveMaps.has(id) || unsourcedLegacyMapIds.has(id)) entity.dataStatus = "in-review";
  if (unsourcedLegacyMapIds.has(id)) {
    // The retired encyclopedia generator invented these groups without any
    // logged sources. Hold them instead of silently grandfathering them.
    entity.macro = { defense: [], attack: [] };
    entity.siteTips = [];
    entity.teamplayTips = [];
    entity.roleNotes = {};
  }
  const mapSourceMeta = canonicalMeta(source, [
    "id",
    "uuid",
    "label",
    "coordinates",
    "cardImage",
    "layoutImage",
    "calloutLabelsBakedIn",
    "source"
  ]);
  mapSourceMeta.inCompetitivePool = fieldMeta({
    tier: "canonical",
    sources: ["https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-00/"],
    approved: true
  });
  if (entity.dataStatus) {
    mapSourceMeta.dataStatus = fieldMeta({
      tier: "canonical",
      sources: [source],
      approved: true,
      confidence: "Pipeline status: canonical facts exist while synthesized guidance remains under review"
    });
  }
  if (unsourcedLegacyMapIds.has(id)) {
    for (const field of ["macro", "siteTips", "teamplayTips", "roleNotes"]) {
      mapSourceMeta[field] = fieldMeta({
        tier: "canonical",
        sources: [source],
        approved: true,
        confidence: "Held from publication because Riot's canonical map feed contains no tactical guidance and the retired generator logged no sources"
      });
    }
  }
  const labelsApproved = baseline && labelSources.length >= 3;
  const calloutMeta = {
    _tier: "mixed",
    approved: labelsApproved,
    positions: fieldMeta({
      tier: "canonical",
      sources: [source],
      approved: true
    }),
    labels: fieldMeta({
      tier: "synthesized",
      sources: labelSources,
      approved: labelsApproved,
      confidence: labelsApproved
        ? `${labelSources.length} independent Riot/community references logged for the baseline`
        : `${labelSources.length} references logged; explicit approval required`
    })
  };
  const draft = entityDraft({
    category: "map",
    entity,
    patchVersion,
    operation: liveMaps.has(id) ? "merge" : "append",
    canonicalMeta: mapSourceMeta,
    specialMeta: { callouts: calloutMeta }
  });
  const file = path.join(DRAFT_ROOT, `map-${id}.json`);
  await writeJson(file, draft);
  written.push(file);
}

const dossierWeapons = weaponPayload.data
  .filter(weapon => weapon.shopData && weapon.weaponStats && slug(weapon.displayName) !== "melee")
  .sort((left, right) => left.displayName.localeCompare(right.displayName));

for (const weapon of dossierWeapons) {
  const canonical = buildCanonicalWeapon(weapon);
  const id = canonical.id;
  const source = canonical.source;
  const existing = liveWeapons.get(id);
  const entity = deepMerge(existing?.weapon || {
    id,
    label: weapon.displayName,
    whenToUse: [],
    howToUse: [],
    patchHistory: []
  }, canonical);
  const draft = entityDraft({
    category: "weapon",
    entity,
    patchVersion,
    operation: existing ? "merge" : "append",
    groupId: existing?.groupId || weaponGroupId(weapon),
    canonicalMeta: canonicalMeta(source, [
      "id",
      "uuid",
      "label",
      "image",
      "cost",
      "magazine",
      "fireRate",
      "penetration",
      "damageRanges",
      "source"
    ])
  });
  const file = path.join(DRAFT_ROOT, `weapon-${id}.json`);
  await writeJson(file, draft);
  written.push(file);
}

console.log(`Generated ${written.length} governed Library drafts for Patch ${patchVersion}.`);
console.log(`Coverage: ${agentPayload.data.length} agents, ${competitiveMaps.length} competitive maps, ${dossierWeapons.length} purchasable weapons.`);
console.log(`Mode: ${baseline ? "one-time baseline (corroborated callout labels pre-approved)" : "steady-state review gate"}.`);
