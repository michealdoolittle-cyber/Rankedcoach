"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");
const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(root, "public", "index.html"), "utf8");
const vocabularySource = fs.readFileSync(path.join(root, "public", "language", "valorant-vocabulary.js"), "utf8");

vm.runInThisContext(vocabularySource, { filename: "valorant-vocabulary.js" });
const vocabulary = globalThis.RankedCoachValorantVocabulary;

assert.ok(vocabulary?.insightToneCopy, "Insights tone copy must be centralized in the vocabulary bundle.");
assert.ok(vocabulary?.insightToneSourceLog, "Insights tone source log must ship with the wording bundle.");
assert.equal(
  vocabulary.insightToneSourceLog.approvedExcerptCorpus.availableInClientBundle,
  false,
  "The private approved-excerpt corpus gap must be explicit instead of implied."
);
assert.ok(
  vocabulary.insightToneSourceLog.fallbackSources.every(source => source.approvalStatus === "internal-vetted"),
  "Fallback tone sources must identify their approval status."
);
assert.match(vocabulary.insightToneSourceLog.rollbackTrail, /centralized/i);

for (const forbidden of [
  "The one adjustment that will have the biggest impact on your performance.",
  "Priority: Waiting",
  "Confidence: Low",
  "Priority Trends",
  "Trend Groups",
  "Waiting for insight",
  "No additional read available yet.",
  "Import or log matches to unlock KD, win-rate, and map-performance reads."
]) {
  assert.doesNotMatch(appSource, new RegExp(escapeRegExp(forbidden)), `old Insights wording returned: ${forbidden}`);
  assert.doesNotMatch(indexSource, new RegExp(escapeRegExp(forbidden)), `old first-render Insights wording returned: ${forbidden}`);
}

assert.match(appSource, /function getInsightConfidenceDisplay/);
assert.match(appSource, /function getInsightPriorityDisplay/);
assert.match(appSource, /Focus: \$\{escapeHtml\(normalizedInsightFocus\)\}/);
assert.match(indexSource, /Start with the read most likely to help your next ranked block\./);
assert.match(indexSource, /What To Watch First/);
assert.match(indexSource, /Supporting Reads/);

const userFacingToneCopy = flattenStrings(vocabulary.insightToneCopy);
assert.ok(userFacingToneCopy.length >= 20, "Expected enough Insights tone copy to guard.");

for (const text of userFacingToneCopy) {
  if (!/[a-z]/i.test(text) || wordsIn(text).length < 4) continue;
  const grade = fleschKincaidGrade(text);
  const ease = fleschReadingEase(text);
  assert.ok(
    grade <= 8.2,
    `Insights copy must stay near grade 8 or below (${grade.toFixed(2)}): ${text}`
  );
  assert.ok(
    ease >= 59,
    `Insights copy must stay easy to read (${ease.toFixed(2)}): ${text}`
  );
}

console.log(`Insights tone readability passed: ${userFacingToneCopy.length} strings, source log, old phrase bans, and helper wiring are present.`);

function flattenStrings(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(flattenStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(flattenStrings);
  return [];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function wordsIn(text) {
  return String(text || "")
    .replace(/\bK\/D\b/g, "kd")
    .match(/[a-z]+(?:'[a-z]+)?/gi) || [];
}

function sentenceCount(text) {
  const matches = String(text || "").match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
  return Math.max(1, matches.filter(sentence => wordsIn(sentence).length).length);
}

function syllablesInWord(word) {
  let clean = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;
  clean = clean.replace(/(?:e|es|ed)$/i, "");
  const groups = clean.match(/[aeiouy]+/g) || [];
  return Math.max(1, groups.length);
}

function readabilityParts(text) {
  const words = wordsIn(text);
  const wordCount = Math.max(1, words.length);
  const sentences = sentenceCount(text);
  const syllables = Math.max(1, words.reduce((total, word) => total + syllablesInWord(word), 0));
  return { wordCount, sentences, syllables };
}

function fleschKincaidGrade(text) {
  const { wordCount, sentences, syllables } = readabilityParts(text);
  return (0.39 * (wordCount / sentences)) + (11.8 * (syllables / wordCount)) - 15.59;
}

function fleschReadingEase(text) {
  const { wordCount, sentences, syllables } = readabilityParts(text);
  return 206.835 - (1.015 * (wordCount / sentences)) - (84.6 * (syllables / wordCount));
}
