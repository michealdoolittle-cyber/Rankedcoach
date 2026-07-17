"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..", "..");
const vocabularyPath = path.join(root, "public", "language", "valorant-vocabulary.js");
const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const askCoachSource = fs.readFileSync(path.join(root, "supabase", "functions", "ask-coach", "index.ts"), "utf8");

vm.runInThisContext(fs.readFileSync(vocabularyPath, "utf8"), { filename: vocabularyPath });
const vocabulary = globalThis.RankedCoachValorantVocabulary;

assert.ok(vocabulary);
assert.ok(vocabulary.terms.positioning.includes("off-angle"));
assert.ok(vocabulary.terms.economy.includes("force-buy"));
assert.ok(vocabulary.terms.teamwork.includes("trade"));
assert.ok(vocabulary.getPromptTerminology().includes("post-plant"));

for (const key of ["agentStrength", "mapWeakness", "recentLosses", "recentWins", "weeklyFocus"]) {
  assert.equal(vocabulary.cardVariants[key].length, 3, `${key} should have three variants`);
}

const first = vocabulary.selectCardVariant("agentStrength", "Jett:8:60", { agent: "Jett", games: 8, winrate: 60 });
const second = vocabulary.selectCardVariant("agentStrength", "Jett:8:60", { agent: "Jett", games: 8, winrate: 60 });
assert.deepEqual(second, first, "card phrasing must remain stable between renders");
assert.match(first.preview, /Jett/);
assert.doesNotMatch(first.preview, /\{\{/);

assert.match(appSource, /RankedCoachValorantVocabulary\?\.selectCardVariant/);
assert.match(appSource, /title === "trade support split"/);
assert.match(appSource, /title === "damage consistency"/);
assert.match(appSource, /title === "clutch closing"/);
assert.match(appSource, /verified 1vX multi-kill rounds became wins/);
assert.match(appSource, /Your damage is low at/);
assert.match(appSource, /Your team impact is on the low end/);
assert.doesNotMatch(appSource, /Your damage is too quiet/);
assert.doesNotMatch(appSource, /ended with you getting the final kill/);
assert.doesNotMatch(appSource, /Weapon category changes how aim, HS%, and conversion should be read/);
assert.match(appSource, /weeklyMoodPatternEligible = weeklyLogs\.length >= 5 && weeklyNegativeMoodRate >= 20/);
assert.match(appSource, /Write to the player as you/);
assert.doesNotMatch(fs.readFileSync(vocabularyPath, "utf8"), /giving this profile playable rounds/);
assert.match(appSource, /statItem\("Def\/Atk Share"/);
assert.match(appSource, /impactScore, 0\)\)}% on/);
assert.match(askCoachSource, /valorant-vocabulary\.js/);
assert.match(askCoachSource, /Use real Valorant terminology naturally where it fits/);
assert.match(askCoachSource, /Do not attach Self Comms to K\/D, ACS, or headshot percentage/);
assert.match(askCoachSource, /at least five logs and at least 20%/);
assert.match(askCoachSource, /verified 1vX multi-kill state/);

console.log("Valorant voice layer passed: shared terms, deterministic variants, active card audit, and Ask Coach wiring are present.");
