#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const ROOT = process.cwd();
const MAPS_PATH = path.join(ROOT, 'public', 'library', 'gamesense-maps.js');
const REFERENCE_PATH = path.join(ROOT, 'public', 'library', 'gamesense-reference.js');
const OVERRIDES_PATH = path.join(ROOT, 'public', 'library', 'gamesense-dossier-text-overrides.js');
const DEFAULT_CHANGELOG_PATH = path.join(ROOT, 'docs', 'reports', 'dossier-openai-pass-2026-08-17.md');

const PLACEHOLDER_RE = /\b(still in review|not authored|not available|no verified|no approved|current client value not published|not filling that gap|missing values|untracked)\b/i;
const EMPTYISH_RE = /^[\s\-–—.]*$/;
const RESPONSE_ENDPOINT = 'https://api.openai.com/v1/responses';

const args = parseArgs(process.argv.slice(2));
await loadDotEnvLike(path.join(ROOT, '.dev.vars'));

const openaiKey = process.env.OPENAI_API_KEY || '';
const model = process.env.OPENAI_MODEL || 'gpt-5.5';
const dryRun = !args.apply;
const noApi = Boolean(args.noApi);
const limit = Number.isFinite(args.limit) ? args.limit : Infinity;
const includeTypes = new Set(String(args.type || 'maps,agents,weapons').split(',').map(item => item.trim()).filter(Boolean));
const includeIds = new Set(String(args.ids || '').split(',').map(item => item.trim()).filter(Boolean));
const changelogPath = path.resolve(ROOT, args.report || DEFAULT_CHANGELOG_PATH);

if (!openaiKey && !noApi) {
  console.error('OPENAI_API_KEY is required to generate rewrites. Use --no-api to enumerate/verify skip logic only.');
  process.exitCode = 2;
} else {
  await main();
}

function parseArgs(values) {
  return values.reduce((output, arg) => {
    if (arg === '--apply') output.apply = true;
    else if (arg === '--dry-run') output.apply = false;
    else if (arg === '--no-api') output.noApi = true;
    else if (arg.startsWith('--limit=')) output.limit = Number(arg.slice('--limit='.length));
    else if (arg.startsWith('--type=')) output.type = arg.slice('--type='.length);
    else if (arg.startsWith('--ids=')) output.ids = arg.slice('--ids='.length);
    else if (arg.startsWith('--report=')) output.report = arg.slice('--report='.length);
    return output;
  }, {});
}

async function loadDotEnvLike(filePath) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    // Optional local env file.
  }
}

async function main() {
  const { maps, reference, overrides } = await loadDossierData();
  const fields = enumerateFields({ maps, reference })
    .filter(field => includeTypes.has(field.type))
    .filter(field => !includeIds.size || includeIds.has(field.id))
    .map(field => ({
      ...field,
      skipReason: getSkipReason(field, overrides),
    }));

  const candidates = fields.filter(field => !field.skipReason).slice(0, limit);
  const skipped = fields.filter(field => field.skipReason);

  const sourceByFile = {
    [MAPS_PATH]: await fs.readFile(MAPS_PATH, 'utf8'),
    [REFERENCE_PATH]: await fs.readFile(REFERENCE_PATH, 'utf8'),
  };
  const changes = [];
  const sourceSkips = [];

  for (const field of candidates) {
    const sourceText = sourceByFile[field.file];
    const oldLiteral = JSON.stringify(field.value);
    const occurrenceCount = countOccurrences(sourceText, oldLiteral);
    if (occurrenceCount !== 1) {
      sourceSkips.push({ ...field, skipReason: `source occurrence count ${occurrenceCount}` });
      continue;
    }
    const nextValue = noApi ? field.value : await rewriteField(field);
    if (!nextValue || nextValue.trim() === field.value.trim()) {
      sourceSkips.push({ ...field, skipReason: noApi ? 'enumeration only (--no-api)' : 'model returned unchanged/empty text' });
      continue;
    }
    const newLiteral = JSON.stringify(nextValue.trim());
    sourceByFile[field.file] = sourceByFile[field.file].replace(oldLiteral, newLiteral);
    changes.push({ ...field, after: nextValue.trim() });
  }

  if (!dryRun && changes.length) {
    for (const [file, source] of Object.entries(sourceByFile)) {
      await fs.writeFile(file, source, 'utf8');
    }
  }

  await writeChangelog({
    fields,
    changes,
    skipped: [...skipped, ...sourceSkips],
    dryRun,
    noApi,
    model,
    outputPath: changelogPath,
  });

  console.log(`Enumerated ${fields.length} dossier text fields.`);
  console.log(`Eligible candidates: ${candidates.length}`);
  console.log(`Generated changes: ${changes.length}`);
  console.log(`Skipped: ${skipped.length + sourceSkips.length}`);
  console.log(`${dryRun ? 'Dry run' : 'Apply'} changelog: ${path.relative(ROOT, changelogPath)}`);
}

async function loadDossierData() {
  const context = {
    console,
    globalThis: {},
  };
  context.globalThis = context;
  for (const file of [MAPS_PATH, REFERENCE_PATH]) {
    vm.runInNewContext(await fs.readFile(file, 'utf8'), context, { filename: file });
  }
  const maps = cloneJson(context.RankedCoachGamesenseMaps || []);
  const reference = cloneJson(context.RankedCoachGamesenseReference || {});
  vm.runInNewContext(await fs.readFile(OVERRIDES_PATH, 'utf8'), context, { filename: OVERRIDES_PATH });
  const overrides = cloneJson(context.RankedCoachGamesenseDossierTextOverrides || {});
  return { maps, reference, overrides };
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function enumerateFields({ maps, reference }) {
  const fields = [];
  for (const map of Array.isArray(maps) ? maps : []) {
    const mapName = map.label || map.id;
    addTipCollection(fields, MAPS_PATH, 'maps', map.id, mapName, 'macro.attack', map.macro?.attack, 'attack macro tip');
    addTipCollection(fields, MAPS_PATH, 'maps', map.id, mapName, 'macro.defense', map.macro?.defense, 'defense macro tip');
    addTipCollection(fields, MAPS_PATH, 'maps', map.id, mapName, 'siteTips', map.siteTips, 'site tip');
    addTipCollection(fields, MAPS_PATH, 'maps', map.id, mapName, 'teamplayTips', map.teamplayTips, 'teamplay tip');
    for (const [role, tips] of Object.entries(map.roleNotes || {})) {
      addTipCollection(fields, MAPS_PATH, 'maps', map.id, mapName, `roleNotes.${role}`, tips, `${role} role note`);
    }
    for (const [agent, value] of Object.entries(map.agentInsights || {})) {
      addField(fields, MAPS_PATH, 'maps', map.id, `agentInsights.${agent}`, `${mapName} ${agent} map fit`, value, 'map agent insight');
    }
    for (const [index, item] of Object.entries(map.weaponSuggestions || [])) {
      for (const key of ['fit', 'conversion', 'evidence', 'note']) {
        addField(fields, MAPS_PATH, 'maps', map.id, `weaponSuggestions.${index}.${key}`, `${mapName} weapon suggestion ${Number(index) + 1} ${key}`, item?.[key], 'map weapon suggestion');
      }
    }
    addField(fields, MAPS_PATH, 'maps', map.id, 'overview.note', `${mapName} overview note`, map.overview?.note, 'map overview');
    addField(fields, MAPS_PATH, 'maps', map.id, 'compStatus', `${mapName} comp status`, map.compStatus, 'map comp status');
  }

  for (const agent of Array.isArray(reference.agents) ? reference.agents : []) {
    const agentName = agent.label || agent.id;
    for (const [index, value] of Object.entries(agent.fundamentals || [])) {
      addField(fields, REFERENCE_PATH, 'agents', agent.id, `fundamentals.${index}`, `${agentName} fundamental ${Number(index) + 1}`, value, 'agent fundamental');
    }
    for (const ability of agent.abilities || []) {
      addField(fields, REFERENCE_PATH, 'agents', agent.id, `abilities.${ability.id}.purpose`, `${agentName} ${ability.name} purpose`, ability.purpose, 'ability purpose');
      addField(fields, REFERENCE_PATH, 'agents', agent.id, `abilities.${ability.id}.setup`, `${agentName} ${ability.name} setup`, ability.setup, 'ability setup');
    }
  }

  const seenWeaponIds = new Set();
  for (const group of Array.isArray(reference.weapons) ? reference.weapons : []) {
    for (const weapon of group.weapons || []) {
      if (!weapon?.id || seenWeaponIds.has(weapon.id)) continue;
      seenWeaponIds.add(weapon.id);
      const weaponName = weapon.label || weapon.id;
      addField(fields, REFERENCE_PATH, 'weapons', weapon.id, 'focus', `${weaponName} focus copy`, weapon.focus, 'weapon focus');
      for (const [index, value] of Object.entries(weapon.whenToUse || [])) {
        addField(fields, REFERENCE_PATH, 'weapons', weapon.id, `whenToUse.${index}`, `${weaponName} use case ${Number(index) + 1}`, value, 'weapon use case');
      }
      for (const [index, value] of Object.entries(weapon.howToUse || [])) {
        addField(fields, REFERENCE_PATH, 'weapons', weapon.id, `howToUse.${index}`, `${weaponName} handling ${Number(index) + 1}`, value, 'weapon handling');
      }
    }
  }
  return fields;
}

function addTipCollection(fields, file, type, id, itemName, basePath, list, kind) {
  if (!Array.isArray(list)) return;
  list.forEach((item, index) => {
    if (typeof item === 'string') {
      addField(fields, file, type, id, `${basePath}.${index}`, `${itemName} ${kind} ${index + 1}`, item, kind);
      return;
    }
    addField(fields, file, type, id, `${basePath}.${index}.label`, `${itemName} ${kind} ${index + 1} label`, item?.label, `${kind} label`);
    addField(fields, file, type, id, `${basePath}.${index}.text`, `${itemName} ${kind} ${index + 1} text`, item?.text, `${kind} text`);
  });
}

function addField(fields, file, type, id, fieldPath, context, value, kind) {
  if (typeof value !== 'string') return;
  fields.push({
    file,
    type,
    id,
    path: fieldPath,
    context,
    value: value.trim(),
    kind,
  });
}

function getSkipReason(field, overrides) {
  if (!field.value || EMPTYISH_RE.test(field.value)) return 'empty';
  if (PLACEHOLDER_RE.test(field.value)) return 'placeholder/needs human source';
  const entityOverrides = overrides?.[field.type]?.[field.id] || {};
  if (Object.prototype.hasOwnProperty.call(entityOverrides, field.path)) return 'owner override exact path';
  const mapTipOverride = mapTipOverridePath(field.path);
  if (mapTipOverride && Object.prototype.hasOwnProperty.call(entityOverrides, mapTipOverride)) {
    return `owner override collection ${mapTipOverride}`;
  }
  return '';
}

function mapTipOverridePath(fieldPath) {
  if (fieldPath.startsWith('macro.attack.')) return 'tips.attack';
  if (fieldPath.startsWith('macro.defense.')) return 'tips.defense';
  if (fieldPath.startsWith('siteTips.')) return 'tips.sites';
  if (fieldPath.startsWith('teamplayTips.')) return 'tips.teamplay';
  return '';
}

async function rewriteField(field) {
  const system = [
    'You are rewriting tactical Valorant dossier copy for RankedCoach.',
    'Be conversational, specific, and practical. Sound like a calm coach, not a stats report.',
    'Use real Valorant terminology naturally, the way a strong player talks to a teammate who already knows the game.',
    'Preserve the tactical meaning of the existing text. Do not invent new map facts, stats, lineups, win rates, patch details, or unsupported claims.',
    'This is a rewrite pass, not free generation. If the source text is weak, make it clearer and more useful without adding facts that were not there.',
    'Address the reader as you when useful. Keep the text compact enough for an app dossier.',
    'Return only JSON shaped exactly as {"text":"..."} with no markdown.',
  ].join('\n');
  const user = [
    `Entity type: ${field.type}`,
    `Entity id: ${field.id}`,
    `Field path: ${field.path}`,
    `Field role: ${field.kind}`,
    `Context: ${field.context}`,
    '',
    'Current copy to rewrite:',
    field.value,
  ].join('\n');
  const response = await fetch(RESPONSE_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_output_tokens: 320,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI rewrite failed for ${field.type}/${field.id}/${field.path}: ${response.status} ${errorText.slice(0, 500)}`);
  }
  const data = await response.json();
  const output = extractResponseText(data);
  const parsed = parseJsonText(output);
  return String(parsed?.text || '').trim();
}

function extractResponseText(data) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const chunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

function parseJsonText(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  }
}

function countOccurrences(source, needle) {
  if (!needle) return 0;
  let count = 0;
  let index = source.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = source.indexOf(needle, index + needle.length);
  }
  return count;
}

async function writeChangelog({ fields, changes, skipped, dryRun, noApi, model, outputPath }) {
  const lines = [
    '# One-time dossier OpenAI pass changelog — 2026-08-17',
    '',
    `Mode: ${dryRun ? 'dry-run' : 'apply'}`,
    `API: ${noApi ? 'not called (--no-api)' : 'OpenAI Responses API'}`,
    `Model: ${model}`,
    '',
    '## Summary',
    '',
    `- Fields enumerated: ${fields.length}`,
    `- Changes generated: ${changes.length}`,
    `- Fields skipped/logged: ${skipped.length}`,
    '',
    '## Changes',
    '',
  ];

  if (!changes.length) {
    lines.push('_No source changes were generated in this run._', '');
  } else {
    lines.push('| Field | Before | After |', '|---|---|---|');
    for (const change of changes) {
      lines.push(`| ${escapeMd(`${change.type}/${change.id}/${change.path}`)} | ${escapeMd(change.value)} | ${escapeMd(change.after)} |`);
    }
    lines.push('');
  }

  lines.push('## Skipped / flagged fields', '');
  if (!skipped.length) {
    lines.push('_No skipped fields._', '');
  } else {
    lines.push('| Field | Reason | Current text |', '|---|---|---|');
    for (const item of skipped) {
      lines.push(`| ${escapeMd(`${item.type}/${item.id}/${item.path}`)} | ${escapeMd(item.skipReason)} | ${escapeMd(item.value)} |`);
    }
    lines.push('');
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
}

function escapeMd(value) {
  return String(value ?? '')
    .replace(/\r?\n/g, '<br>')
    .replace(/\|/g, '\\|')
    .trim();
}
