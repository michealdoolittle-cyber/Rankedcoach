import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  buildKnowledgeConsensus,
  createKnowledgeIndex,
  extractStructuredClaims
} from "../worker/knowledge-pipeline.mjs";

const EXPECTED_FIELDS = Object.freeze({
  map: Object.freeze([
    "macro",
    "siteTips",
    "teamplayTips",
    "roleNotes",
    "weaponSuggestions",
    "lineupLinks"
  ]),
  agent: Object.freeze([
    "fundamentals",
    "abilities",
    "lore",
    "patchHistory"
  ]),
  weapon: Object.freeze([
    "whenToUse",
    "howToUse",
    "damageRanges",
    "patchHistory"
  ])
});

function normalizeText(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9%/]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function fieldSources(meta = {}) {
  return [...new Set([
    ...(meta._sources || []),
    ...(meta.positions?._sources || []),
    ...(meta.labels?._sources || [])
  ].filter(Boolean))];
}

function fieldTier(meta = {}) {
  if (meta._tier === "mixed") return "mixed";
  if (meta._tier === "canonical") return "canonical";
  return "synthesized";
}

function isEmpty(value) {
  if (value == null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

function collectText(value, field, output = [], pathParts = []) {
  if (typeof value === "string") {
    const text = value.trim();
    if (
      text.length >= 28
      && !/^https?:\/\//i.test(text)
      && !/(?:\.png|\.jpg|\.jpeg|\.svg|\.webp|\.mp4)(?:\?|$)/i.test(text)
    ) {
      output.push({ field, path: pathParts.join("."), text });
    }
    return output;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectText(item, field, output, [...pathParts, String(index)]));
    return output;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith("_") || /(?:image|icon|portrait|source|url)$/i.test(key)) continue;
      collectText(child, field, output, [...pathParts, key]);
    }
  }
  return output;
}

function sourcePublisher(url = "") {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "authored-library";
  }
}

function buildClaimDocument(draft, field, meta, textItems) {
  const sources = fieldSources(meta);
  const sourceUrl = sources[0] || `rankedcoach://library/${draft._meta.category}/${draft._meta.slug}/${field}`;
  const source = {
    id: `library-${draft._meta.category}-${draft._meta.slug}-${field}`,
    platform: "library",
    url: sourceUrl,
    title: `${draft._meta.entityName} ${field}`,
    publisher: sourcePublisher(sourceUrl),
    publisherKey: sourcePublisher(sourceUrl),
    sourceKind: fieldTier(meta),
    entities: [draft._meta.entityName]
  };
  const claims = textItems.flatMap((item, index) => extractStructuredClaims(source, [{
    index,
    startMs: index * 1_000,
    endMs: index * 1_000 + 1_000,
    text: item.text,
    cues: []
  }]));
  return { source, claims };
}

export async function auditLibraryDrafts(draftRoot, options = {}) {
  const files = (await readdir(draftRoot))
    .filter(file => /^(?:agent|map|weapon)-.+\.json$/i.test(file))
    .sort();
  const fields = [];
  const missing = [];
  const outdated = [];
  const duplicateIndex = new Map();
  const claimDocuments = [];

  for (const file of files) {
    const draft = JSON.parse(await readFile(path.join(draftRoot, file), "utf8"));
    const category = draft._meta.category;
    const entity = draft._meta.entityName || draft.label || draft._meta.slug;
    if (options.currentPatch && draft._meta.patchVersion !== options.currentPatch) {
      outdated.push({
        category,
        entity,
        draftPatch: draft._meta.patchVersion,
        currentPatch: options.currentPatch
      });
    }
    for (const expected of EXPECTED_FIELDS[category] || []) {
      if (isEmpty(draft[expected])) missing.push({ category, entity, field: expected });
    }
    for (const [field, meta] of Object.entries(draft._fieldMeta || {})) {
      const sources = fieldSources(meta);
      const textItems = collectText(draft[field], field);
      fields.push({
        category,
        entity,
        field,
        tier: fieldTier(meta),
        approved: Boolean(meta.approved),
        sourceCount: sources.length,
        hasSources: sources.length > 0,
        textItems: textItems.length
      });
      if (textItems.length) claimDocuments.push(buildClaimDocument(draft, field, meta, textItems));
      for (const item of textItems) {
        const normalized = normalizeText(item.text);
        if (normalized.length < 45) continue;
        const rows = duplicateIndex.get(normalized) || [];
        rows.push({ category, entity, field, path: item.path });
        duplicateIndex.set(normalized, rows);
      }
    }
  }

  const duplicates = [...duplicateIndex.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([concept, rows]) => ({
      concept: concept.slice(0, 180),
      occurrences: rows
    }))
    .sort((left, right) => right.occurrences.length - left.occurrences.length);
  const consensus = buildKnowledgeConsensus(claimDocuments);
  const knowledgeIndex = createKnowledgeIndex(claimDocuments);
  const conflictCandidates = [...consensus.statistical, ...consensus.coaching]
    .filter(concept => concept.state === "conflicted")
    .map(concept => ({
      type: concept.type,
      topic: concept.topic,
      entities: concept.entities,
      evidence: concept.evidence,
      reasons: concept.contradictions.map(item => item.reason)
    }));

  const byTier = Object.fromEntries(["canonical", "synthesized", "mixed"].map(tier => [
    tier,
    fields.filter(field => field.tier === tier).length
  ]));
  const sourceCoverage = {
    sourcedFields: fields.filter(field => field.hasSources).length,
    unsourcedFields: fields.filter(field => !field.hasSources).length
  };

  return Object.freeze({
    generatedAt: new Date(options.now || Date.now()).toISOString(),
    status: "review-complete-no-publication",
    scope: {
      drafts: files.length,
      agents: files.filter(file => file.startsWith("agent-")).length,
      maps: files.filter(file => file.startsWith("map-")).length,
      weapons: files.filter(file => file.startsWith("weapon-")).length,
      governedFields: fields.length
    },
    sourceCoverage,
    byTier,
    approval: {
      approvedFields: fields.filter(field => field.approved).length,
      pendingFields: fields.filter(field => !field.approved).length
    },
    missingOpportunities: missing,
    duplicateConcepts: duplicates,
    conflictCandidates,
    outdated,
    consensusSummary: {
      statisticalConcepts: consensus.statistical.length,
      coachingConcepts: consensus.coaching.length,
      corroborated: [...consensus.statistical, ...consensus.coaching].filter(concept => concept.state === "corroborated").length,
      singleSource: [...consensus.statistical, ...consensus.coaching].filter(concept => concept.state === "single-source").length
    },
    // Server-only comparison index. The Markdown report intentionally omits
    // tokens and matching internals.
    knowledgeIndex
  });
}

function tableRows(rows, formatter, empty) {
  if (!rows.length) return empty;
  return rows.map(formatter).join("\n");
}

export function renderLibraryAuditMarkdown(audit) {
  const missingByCategory = Object.fromEntries(["map", "agent", "weapon"].map(category => [
    category,
    audit.missingOpportunities.filter(item => item.category === category).length
  ]));
  const conflictRows = tableRows(
    audit.conflictCandidates.slice(0, 20),
    item => `| ${item.type} | ${item.topic} | ${item.entities.join(", ") || "General"} | ${[...new Set(item.reasons)].join("; ")} |`,
    "| — | — | — | No contradiction candidates were detected in the currently governed text. |"
  );
  const duplicateRows = tableRows(
    audit.duplicateConcepts.slice(0, 20),
    item => `| ${item.occurrences.length} | ${item.occurrences.map(row => `${row.entity}.${row.field}`).join(", ")} | ${item.concept.replace(/\|/g, "\\|")} |`,
    "| 0 | — | No exact repeated coaching concepts were detected. |"
  );
  const missingRows = tableRows(
    audit.missingOpportunities.slice(0, 40),
    item => `| ${item.category} | ${item.entity} | ${item.field} |`,
    "| — | — | No expected coaching fields are empty. |"
  );
  const outdatedRows = tableRows(
    audit.outdated.slice(0, 30),
    item => `| ${item.category} | ${item.entity} | ${item.draftPatch} | ${item.currentPatch} |`,
    "| — | — | — | No patch-stale drafts were detected. |"
  );

  return `# RankedCoach Knowledge Library Review

Generated: ${audit.generatedAt}

Status: **Complete review report; no publication performed.**

## Scope

| Drafts | Agents | Maps | Weapons | Governed fields |
| ---: | ---: | ---: | ---: | ---: |
| ${audit.scope.drafts} | ${audit.scope.agents} | ${audit.scope.maps} | ${audit.scope.weapons} | ${audit.scope.governedFields} |

## Evidence and approval

| Sourced fields | Unsourced fields | Approved fields | Pending fields |
| ---: | ---: | ---: | ---: |
| ${audit.sourceCoverage.sourcedFields} | ${audit.sourceCoverage.unsourcedFields} | ${audit.approval.approvedFields} | ${audit.approval.pendingFields} |

The review keeps statistical consensus separate from coaching consensus. It intentionally omits source weights, ranking calculations, normalization formulas, transcript excerpts, and other private methodology.

| Canonical fields | Synthesized fields | Mixed fields | Statistical concepts | Coaching concepts |
| ---: | ---: | ---: | ---: | ---: |
| ${audit.byTier.canonical} | ${audit.byTier.synthesized} | ${audit.byTier.mixed} | ${audit.consensusSummary.statisticalConcepts} | ${audit.consensusSummary.coachingConcepts} |

## Recommended priorities

1. Source or deliberately hold the ${audit.sourceCoverage.unsourcedFields} governed fields that currently have no evidence URL.
2. Fill the ${audit.missingOpportunities.length} expected coaching gaps (${missingByCategory.map} map, ${missingByCategory.agent} agent, ${missingByCategory.weapon} weapon) only when current evidence exists.
3. Review the contradiction candidates below before strengthening language.
4. Merge repeated concepts before adding new wording.
5. Keep every proposed wording change in owner approval; this report does not alter the live Library.

## Missing coaching opportunities

| Category | Entity | Field |
| --- | --- | --- |
${missingRows}

## Duplicate concepts

| Occurrences | Locations | Normalized concept |
| ---: | --- | --- |
${duplicateRows}

## Contradiction candidates

These are review flags, not automatic conclusions.

| Type | Topic | Entities | Reason |
| --- | --- | --- | --- |
${conflictRows}

## Patch freshness

| Category | Entity | Draft patch | Current patch |
| --- | --- | --- | --- |
${outdatedRows}

## Publication decision

No content was published. Transcript-derived proposals remain private and require original RankedCoach wording plus explicit owner approval before manual Library promotion.
`;
}
