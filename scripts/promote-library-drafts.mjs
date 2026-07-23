import {
  access,
  readFile,
  readdir,
  writeFile
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  BASELINE_MARKER,
  DRAFT_ROOT,
  PROMOTED_OUTPUT,
  ROOT,
  canPromote,
  deepMerge,
  ensureDraftDirectories,
  escapeMarkdownCell,
  loadLibraryState,
  plain,
  reviewValue,
  todayIso,
  writeJson
} from "./library-pipeline-core.mjs";

const planOnly = process.argv.includes("--plan");
const skipNotify = process.argv.includes("--skip-notify");
const baselineRequested = process.argv.includes("--baseline");
const refreshScreenshots = process.argv.includes("--refresh-screenshots");
const planPath = path.join(DRAFT_ROOT, "_promotion-plan.json");
const reviewedDate = todayIso();
const BASELINE_DIRECTIVE = "notes/promotion-sequencing-bug-2026-07-24.md";

function checkJavaScript(filePath) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    cwd: ROOT,
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(`node --check failed for ${path.relative(ROOT, filePath)}:\n${result.stderr || result.stdout}`);
  }
}

function getEntity(state, category, id) {
  if (category === "map") return (state.maps || []).find(item => item.id === id) || null;
  if (category === "agent") return (state.reference.agents || []).find(item => item.id === id) || null;
  for (const group of state.reference.weapons || []) {
    const weapon = (group.weapons || []).find(item => item.id === id);
    if (weapon) return weapon;
  }
  return null;
}

function mergeCanonicalCalloutPositions(current = [], incoming = []) {
  const existingByKey = new Map();
  for (const item of current) {
    for (const key of [item.sourceKey, item.sourceLabel, item.label].filter(Boolean)) {
      existingByKey.set(String(key).toLowerCase(), item);
    }
  }
  return incoming.flatMap(item => {
    const previous = [
      item.sourceKey,
      item.sourceLabel,
      item.label
    ].map(key => existingByKey.get(String(key || "").toLowerCase())).find(Boolean);
    if (!previous) return [];
    return [{
      ...previous,
      id: item.id,
      sourceKey: item.sourceKey,
      sourceLabel: item.sourceLabel,
      superRegionName: item.superRegionName,
      regionName: item.regionName,
      x: item.x,
      y: item.y
    }];
  });
}

function selectPromotedPatch(draft, current, { baseline = false } = {}) {
  const patch = {};
  const rows = [];
  for (const [field, meta] of Object.entries(draft._fieldMeta || {})) {
    if (!(field in draft)) continue;
    let allowed = baseline || canPromote(meta);
    let nextValue = draft[field];
    let sources = meta._sources || [];
    let confidence = meta.confidence || "";
    let tier = meta._tier || "synthesized";

    if (field === "callouts" && meta._tier === "mixed") {
      const positionsAllowed = baseline || canPromote(meta.positions);
      const labelsAllowed = baseline || canPromote(meta.labels);
      if (positionsAllowed && labelsAllowed) {
        allowed = true;
        sources = [...new Set([...(meta.positions?._sources || []), ...(meta.labels?._sources || [])])];
        confidence = meta.labels?.confidence || meta.positions?.confidence || "";
        tier = "mixed";
      } else if (positionsAllowed && current?.callouts?.length) {
        nextValue = mergeCanonicalCalloutPositions(current.callouts, draft.callouts);
        allowed = nextValue.length > 0;
        sources = meta.positions?._sources || [];
        confidence = "Canonical positions only; unapproved display labels were held";
        tier = "canonical";
      } else {
        allowed = false;
      }
    }

    if (!allowed) continue;
    patch[field] = plain(nextValue);
    const before = current?.[field];
    if (JSON.stringify(before) !== JSON.stringify(nextValue)) {
      rows.push({
        field,
        tier,
        before: plain(before),
        after: plain(nextValue),
        sources,
        confidence
      });
    }
  }
  patch.lastReviewed = draft._meta.lastReviewed || reviewedDate;
  patch.patchVersion = draft._meta.patchVersion || "Current";
  return { patch, rows };
}

async function validateBaselineBatch(files) {
  if (!files.length) throw new Error("Baseline promotion refused: no governed drafts were found.");
  const drafts = await Promise.all(files.map(async file => ({
    file,
    value: JSON.parse(await readFile(path.join(DRAFT_ROOT, file), "utf8"))
  })));
  const timestamps = drafts.map(({ file, value }) => {
    const timestamp = Date.parse(value?._meta?.generatedAt || "");
    if (!Number.isFinite(timestamp)) {
      throw new Error(`Baseline promotion refused: ${file} has no valid _meta.generatedAt timestamp.`);
    }
    return timestamp;
  });
  const patchVersions = [...new Set(drafts.map(({ value }) => value?._meta?.patchVersion || "Current"))];
  if (patchVersions.length !== 1) {
    throw new Error(`Baseline promotion refused: drafts span multiple patch versions (${patchVersions.join(", ")}).`);
  }
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);
  if (newest - oldest > 5 * 60 * 1000) {
    throw new Error(`Baseline promotion refused: draft timestamps span more than five minutes (${new Date(oldest).toISOString()} to ${new Date(newest).toISOString()}). Regenerate one final batch first.`);
  }
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const planTimestamp = Date.parse(plan?.generatedAt || "");
  if (!Number.isFinite(planTimestamp) || planTimestamp < newest) {
    throw new Error("Baseline promotion refused: run --plan after the final draft generation so the irreversible promotion cannot consume a partial batch.");
  }
  const digest = createHash("sha256");
  for (const { file, value } of drafts) {
    digest.update(file);
    digest.update("\0");
    digest.update(JSON.stringify(value));
    digest.update("\0");
  }
  return {
    draftCount: drafts.length,
    patchVersion: patchVersions[0],
    oldestGeneratedAt: new Date(oldest).toISOString(),
    newestGeneratedAt: new Date(newest).toISOString(),
    plannedAt: new Date(planTimestamp).toISOString(),
    sha256: digest.digest("hex")
  };
}

function categoryPlural(category) {
  return category === "map" ? "maps" : category === "agent" ? "agents" : "weapons";
}

function sourceList(sources = []) {
  return sources.length ? sources.map(source => `[${source}](${source})`).join(", ") : "No sources logged";
}

function screenshotStatus(slug) {
  const before = path.join(DRAFT_ROOT, "screenshots", `${slug}-before.png`);
  const after = path.join(DRAFT_ROOT, "screenshots", `${slug}-after.png`);
  return Promise.all([
    access(before).then(() => true).catch(() => false),
    access(after).then(() => true).catch(() => false)
  ]);
}

async function renderReview(entry) {
  const { draft, rows } = entry;
  const { category, entityName, slug, generationReason } = draft._meta;
  const date = draft._meta.lastReviewed || reviewedDate;
  const [hasBefore, hasAfter] = await screenshotStatus(slug);
  const canonicalCount = rows.filter(row => row.tier === "canonical").length;
  const synthesizedCount = rows.filter(row => row.tier === "synthesized").length;
  const mixedCount = rows.filter(row => row.tier === "mixed").length;
  const summary = `${generationReason}. ${rows.length} field${rows.length === 1 ? "" : "s"} changed for Patch ${draft._meta.patchVersion}.`;
  const screenshotLines = hasBefore && hasAfter
    ? `![Before](./screenshots/${slug}-before.png)\n![After](./screenshots/${slug}-after.png)`
    : `Screenshot capture is incomplete: before=${hasBefore ? "captured" : "missing"}, after=${hasAfter ? "captured" : "missing"}. Run \`node testing/visual-audit/library-draft-screenshots.js --phase before|after\`; this section is not silently omitted.`;
  const tableRows = rows.map(row => (
    `| \`${escapeMarkdownCell(row.field)}\` | ${escapeMarkdownCell(row.tier)} | ${escapeMarkdownCell(reviewValue(row.before))} | ${escapeMarkdownCell(reviewValue(row.after))} | ${escapeMarkdownCell(sourceList(row.sources))} | ${escapeMarkdownCell(row.confidence)} |`
  )).join("\n");
  const markdown = `# Library Draft Review — ${category[0].toUpperCase()}${category.slice(1)}: ${entityName} — ${date}

## Summary

${summary}

## Screenshot

${screenshotLines}

## Field-by-field changes

| Field | Tier | Before | After | Sources checked | Confidence |
| --- | --- | --- | --- | --- | --- |
${tableRows || "| `none` | n/a | No user-visible change | No user-visible change | n/a | n/a |"}

## Approval

- [ ] Approved as-is
- [ ] Approved with edits (note edits below)
- [ ] Rejected (note why below)

Notes:

Promotion totals: ${canonicalCount} canonical, ${synthesizedCount} synthesized, ${mixedCount} mixed-tier field groups.
`;
  const reviewPath = path.join(DRAFT_ROOT, `review-${category}-${slug}-${date}.md`);
  await writeFile(reviewPath, markdown, "utf8");
  return { reviewPath, summary, canonicalCount, synthesizedCount, mixedCount, entityName, category };
}

async function readNtfyConfig() {
  const wrangler = await readFile(path.join(ROOT, "wrangler.toml"), "utf8");
  const readVar = name => wrangler.match(new RegExp(`^${name}\\s*=\\s*"([^"]+)"`, "m"))?.[1] || "";
  return {
    server: process.env.RANKEDCOACH_NTFY_SERVER || readVar("NTFY_SERVER") || "https://ntfy.sh",
    topic: process.env.RANKEDCOACH_NTFY_TOPIC || readVar("NTFY_TOPIC"),
    token: process.env.RANKEDCOACH_NTFY_TOKEN || ""
  };
}

async function notifyReview(review) {
  const config = await readNtfyConfig();
  if (!config.topic) {
    console.error(`Library review notification skipped for ${review.entityName}: NTFY_TOPIC is not configured.`);
    return;
  }
  const headers = {
    Title: `Library draft ready: ${review.entityName} (${review.category})`,
    Priority: review.synthesizedCount > 0 ? "high" : "default",
    "Content-Type": "text/plain; charset=utf-8"
  };
  if (config.token) headers.Authorization = `Bearer ${config.token}`;
  const body = `${review.summary} ${review.canonicalCount} canonical (auto-approved), ${review.synthesizedCount} synthesized (needs review), ${review.mixedCount} mixed. ${path.relative(ROOT, review.reviewPath).replaceAll("\\", "/")}`;
  try {
    const response = await fetch(`${config.server.replace(/\/$/, "")}/${encodeURIComponent(config.topic)}`, {
      method: "POST",
      headers,
      body,
      signal: AbortSignal.timeout(15_000)
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (error) {
    console.error(`Library review notification failed for ${review.entityName}: ${error.message}`);
  }
}

function xmlEscape(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;"
  })[character]);
}

function rectsOverlap(left, right, padding = 7) {
  return !(
    left.x + left.width + padding < right.x
    || right.x + right.width + padding < left.x
    || left.y + left.height + padding < right.y
    || right.y + right.height + padding < left.y
  );
}

function placeCalloutLabels(callouts = []) {
  const placed = [];
  const directions = [
    [1, 0], [-1, 0], [0, -1], [0, 1],
    [1, -1], [-1, -1], [1, 1], [-1, 1]
  ];
  const radii = [24, 48, 72, 102, 136, 174];
  for (const callout of callouts) {
    const anchorX = Number(callout.x) * 10;
    const anchorY = Number(callout.y) * 10;
    const width = Math.min(205, Math.max(88, String(callout.label).length * 8.1 + 24));
    const height = 32;
    let selected = null;
    for (const radius of radii) {
      for (const [directionX, directionY] of directions) {
        const candidate = {
          x: Math.max(8, Math.min(992 - width, anchorX + directionX * radius - (directionX <= 0 ? width : 0))),
          y: Math.max(8, Math.min(960, anchorY + directionY * radius - (directionY <= 0 ? height : 0))),
          width,
          height
        };
        if (!placed.some(item => rectsOverlap(item, candidate, 10))) {
          selected = candidate;
          break;
        }
      }
      if (selected) break;
    }
    selected ||= {
      x: Math.max(8, Math.min(992 - width, anchorX + 18)),
      y: Math.max(8, Math.min(962, anchorY + 12)),
      width,
      height
    };
    placed.push({ ...selected, anchorX, anchorY, callout });
  }
  return placed;
}

function zoneColor(callout, callouts) {
  const attack = callouts.find(item => item.superRegionName === "Attacker Side" && item.regionName === "Spawn");
  const defense = callouts.find(item => item.superRegionName === "Defender Side" && item.regionName === "Spawn");
  if (!attack || !defense) return "#94a3b8";
  const distance = (left, right) => Math.hypot(Number(left.x) - Number(right.x), Number(left.y) - Number(right.y));
  const attackDistance = distance(callout, attack);
  const defenseDistance = distance(callout, defense);
  const delta = Math.abs(attackDistance - defenseDistance);
  if (delta < 9 || /^(Mid)\b/i.test(callout.label)) return "#a8b3c7";
  return attackDistance < defenseDistance ? "#55ddd4" : "#ff6675";
}

async function writeBakedMapLayout(mapPatch) {
  if (!["bind", "breeze"].includes(mapPatch.id) || !Array.isArray(mapPatch.callouts)) return;
  const basePath = path.join(ROOT, "public", "assets", "library", "maps", `${mapPatch.id}-layout.png`);
  const base = await readFile(basePath);
  const placements = placeCalloutLabels(mapPatch.callouts);
  const labelMarkup = placements.map(item => {
    const color = zoneColor(item.callout, mapPatch.callouts);
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    return `<g>
      <path d="M ${item.anchorX.toFixed(1)} ${item.anchorY.toFixed(1)} L ${centerX.toFixed(1)} ${centerY.toFixed(1)}" stroke="${color}" stroke-width="2" opacity=".72"/>
      <circle cx="${item.anchorX.toFixed(1)}" cy="${item.anchorY.toFixed(1)}" r="5" fill="#08111f" stroke="${color}" stroke-width="3"/>
      <rect x="${item.x.toFixed(1)}" y="${item.y.toFixed(1)}" width="${item.width.toFixed(1)}" height="${item.height}" rx="8" fill="#07101ee8" stroke="${color}" stroke-width="2"/>
      <text x="${centerX.toFixed(1)}" y="${(item.y + 20).toFixed(1)}" text-anchor="middle" fill="#f8fafc" font-family="Rajdhani,Arial,sans-serif" font-size="15" font-weight="800">${xmlEscape(item.callout.label)}</text>
    </g>`;
  }).join("\n");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" role="img" aria-labelledby="title desc">
  <title id="title">${xmlEscape(mapPatch.label)} complete callout map</title>
  <desc id="desc">Riot tactical map with ${mapPatch.callouts.length} source-verified callouts. Teal labels are closer to attacker spawn, red labels are closer to defender spawn, and gray labels are central.</desc>
  <image href="data:image/png;base64,${base.toString("base64")}" width="1000" height="1000" preserveAspectRatio="xMidYMid meet"/>
  <rect width="1000" height="1000" fill="#030712" opacity=".08"/>
  ${labelMarkup}
</svg>
`;
  await writeFile(path.join(ROOT, "public", "assets", "library", "maps", `${mapPatch.id}-layout-labeled.svg`), svg, "utf8");
}

function buildPromotedSource(promoted) {
  return `// Generated only by scripts/promote-library-drafts.mjs.
// Canonical fields auto-promote; synthesized fields require approval and three logged sources.
(function () {
  "use strict";
  const PROMOTED = ${JSON.stringify(promoted, null, 2)};
  const merge = (base, patch) => {
    if (Array.isArray(patch)) return patch.map(item => merge(undefined, item));
    if (!patch || typeof patch !== "object") return patch;
    if (!Object.keys(patch).length) return {};
    const result = base && typeof base === "object" && !Array.isArray(base) ? { ...base } : {};
    Object.entries(patch).forEach(([key, value]) => {
      if (key === "abilities" && Array.isArray(value)) {
        const previous = new Map((Array.isArray(result.abilities) ? result.abilities : []).map(item => [item.id, item]));
        result.abilities = value.map(item => merge(previous.get(item.id), item));
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        result[key] = merge(result[key], value);
      } else {
        result[key] = Array.isArray(value) ? value.map(item => merge(undefined, item)) : value;
      }
    });
    return result;
  };
  const reference = globalThis.RankedCoachGamesenseReference || { agents: [], weapons: [], warmupDetails: {} };
  const agents = new Map((reference.agents || []).map(item => [item.id, item]));
  PROMOTED.agents.forEach(patch => agents.set(patch.id, merge(agents.get(patch.id), patch)));
  const groups = (reference.weapons || []).map(group => ({ ...group, weapons: [...(group.weapons || [])] }));
  const groupById = new Map(groups.map(group => [group.id, group]));
  PROMOTED.weapons.forEach(({ groupId, patch }) => {
    let group = groupById.get(groupId);
    if (!group) {
      group = { id: groupId, label: groupId === "machine-guns" ? "Machine Guns" : "Weapons", examples: "", range: "", weaponIds: [], weapons: [] };
      groups.push(group);
      groupById.set(groupId, group);
    }
    const index = group.weapons.findIndex(item => item.id === patch.id);
    const next = merge(index >= 0 ? group.weapons[index] : undefined, patch);
    if (index >= 0) group.weapons[index] = next;
    else group.weapons.push(next);
    group.weaponIds = [...new Set([...(group.weaponIds || []), patch.id])];
  });
  const maps = new Map((globalThis.RankedCoachGamesenseMaps || []).map(item => [item.id, item]));
  PROMOTED.maps.forEach(patch => maps.set(patch.id, merge(maps.get(patch.id), patch)));
  globalThis.RankedCoachGamesenseReference = Object.freeze({ ...reference, agents: Object.freeze([...agents.values()]), weapons: Object.freeze(groups) });
  globalThis.RankedCoachGamesenseMaps = Object.freeze([...maps.values()]);
})();
`;
}

await ensureDraftDirectories();
if (refreshScreenshots) {
  const reviewFiles = (await readdir(DRAFT_ROOT)).filter(file => /^review-(agent|map|weapon)-.+-\d{4}-\d{2}-\d{2}\.md$/i.test(file));
  let refreshed = 0;
  for (const file of reviewFiles) {
    const slug = file.match(/^review-(?:agent|map|weapon)-(.+)-\d{4}-\d{2}-\d{2}\.md$/i)?.[1];
    if (!slug) continue;
    const [hasBefore, hasAfter] = await screenshotStatus(slug);
    if (!hasBefore || !hasAfter) continue;
    const reviewPath = path.join(DRAFT_ROOT, file);
    const current = await readFile(reviewPath, "utf8");
    const replacement = `## Screenshot\n\n![Before](./screenshots/${slug}-before.png)\n![After](./screenshots/${slug}-after.png)\n\n## Field-by-field changes`;
    const next = current.replace(/## Screenshot\n\n[\s\S]*?\n\n## Field-by-field changes/, replacement);
    if (next !== current) {
      await writeFile(reviewPath, next, "utf8");
      refreshed += 1;
    }
  }
  console.log(`Refreshed screenshot sections in ${refreshed} Library review documents.`);
  process.exit(0);
}
if (await access(PROMOTED_OUTPUT).then(() => true).catch(() => false)) checkJavaScript(PROMOTED_OUTPUT);

const baselineAlreadyUsed = await access(BASELINE_MARKER).then(() => true).catch(() => false);
if (baselineRequested && baselineAlreadyUsed && !planOnly) {
  throw new Error("The one-time baseline auto-promotion has already been used. Edit synthesized draft approvals and run without --baseline.");
}

const state = await loadLibraryState();
const files = (await readdir(DRAFT_ROOT))
  .filter(file => /^(agent|map|weapon)-.+\.json$/i.test(file))
  .sort();
const baselineBatch = baselineRequested ? await validateBaselineBatch(files) : null;
const promoted = { agents: [], maps: [], weapons: [] };
const entries = [];

for (const file of files) {
  const draft = JSON.parse(await readFile(path.join(DRAFT_ROOT, file), "utf8"));
  const current = getEntity(state, draft._meta.category, draft._meta.slug);
  const { patch, rows } = selectPromotedPatch(draft, current, { baseline: baselineRequested });
  if (!patch.id) patch.id = draft._meta.slug;
  if (draft._meta.category === "weapon") {
    promoted.weapons.push({ groupId: draft._meta.groupId || "other", patch });
  } else {
    promoted[categoryPlural(draft._meta.category)].push(patch);
  }
  if (rows.length || !current) entries.push({ draft, rows, patch, current });
}

const plan = {
  generatedAt: new Date().toISOString(),
  baselineRequested,
  changedEntities: entries.map(({ draft, rows }) => ({
    category: draft._meta.category,
    slug: draft._meta.slug,
    entityName: draft._meta.entityName,
    changedFields: rows.map(row => row.field)
  }))
};

if (planOnly) {
  await writeJson(planPath, plan);
  console.log(`Promotion plan: ${entries.length} changed entities. No live file was written.`);
  process.exit(0);
}

for (const mapPatch of promoted.maps) await writeBakedMapLayout(mapPatch);
await writeFile(PROMOTED_OUTPUT, buildPromotedSource(promoted), "utf8");
checkJavaScript(PROMOTED_OUTPUT);

const reviews = [];
for (const entry of entries) reviews.push(await renderReview(entry));
if (!skipNotify) {
  for (const review of reviews) await notifyReview(review);
}

await writeJson(planPath, plan);
if (baselineRequested) {
  await writeJson(BASELINE_MARKER, {
    completedAt: new Date().toISOString(),
    patchVersion: baselineBatch.patchVersion,
    changedEntities: entries.length,
    promotedEntities: files.length,
    batch: baselineBatch,
    resetLog: "public/library/_drafts/baseline-reset-2026-07-24.json",
    directive: BASELINE_DIRECTIVE,
    note: "Corrected one-time baseline exception consumed after validating the final draft batch. All future synthesized fields require reviewed approval."
  });
}

console.log(`Promoted ${files.length} governed drafts into ${path.relative(ROOT, PROMOTED_OUTPUT)}.`);
console.log(`Created ${reviews.length} review document${reviews.length === 1 ? "" : "s"}; notifications ${skipNotify ? "skipped by explicit flag" : "attempted"}.`);
