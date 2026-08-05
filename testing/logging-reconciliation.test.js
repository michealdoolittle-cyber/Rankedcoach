"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const policySource = fs.readFileSync(path.join(root, "public", "data", "log-policy.js"), "utf8");
vm.runInThisContext(policySource, { filename: "public/data/log-policy.js" });

const policy = globalThis.RankedCoachLogPolicy;
const profileId = "profile-tejo";
const pendingLoadoutRoll = {
  agent: "Tejo",
  focus: "Credit / Ult Economy",
  createdAt: "2026-08-04T18:00:00.000Z"
};
const incomingMatch = {
  id: "henrik-match-tejo-1",
  createdAt: "2026-08-04T18:45:00.000Z",
  result: "win",
  rr: 21,
  agent: "Tejo",
  role: "Initiator",
  map: "Sunset",
  roleImpact: { score: 74, roleKey: "initiator" }
};

// The normal flow starts with no log draft at all.  Sync creates the one and
// only match entry, carrying the matching rolled focus into that entry.
const firstSync = policy.syncMatchPlaceholders([], [incomingMatch], profileId, { pendingLoadoutRoll });
assert.equal(firstSync.added, 1);
assert.equal(firstSync.entries.length, 1);
assert.equal(firstSync.consumedPendingLoadoutRollMatchId, incomingMatch.id);
const syncedEntry = firstSync.entries[0];
assert.equal(syncedEntry.id, `ranked-match-log:${profileId}:${incomingMatch.id}`);
assert.equal(syncedEntry.matchId, incomingMatch.id);
assert.equal(syncedEntry.focus, "Credit / Ult Economy");
assert.equal(syncedEntry.agent, "Tejo");
assert.equal(syncedEntry.role, "Initiator");
assert.equal(syncedEntry.map, "Sunset");
assert.equal(syncedEntry.rr, 21);
assert.equal(syncedEntry.roleImpact.score, 74);

// Repeated syncs are idempotent: the existing linked record is retained and
// a second entry is never created for the same match.
const repeatedSync = policy.syncMatchPlaceholders(firstSync.entries, [incomingMatch], profileId, { pendingLoadoutRoll });
assert.equal(repeatedSync.added, 0);
assert.equal(repeatedSync.entries.length, 1);
assert.equal(repeatedSync.consumedPendingLoadoutRollMatchId, "");

// A roll is consumed by the earliest matching post-roll game only, even when
// Henrik returns multiple same-agent matches in an arbitrary order.
const laterTejoMatch = {
  ...incomingMatch,
  id: "henrik-match-tejo-2",
  createdAt: "2026-08-04T20:10:00.000Z"
};
const doubleHeader = policy.syncMatchPlaceholders([], [laterTejoMatch, incomingMatch], profileId, { pendingLoadoutRoll });
assert.equal(doubleHeader.added, 2);
assert.equal(doubleHeader.consumedPendingLoadoutRollMatchId, incomingMatch.id);
assert.equal(doubleHeader.entries.find(entry => entry.matchId === incomingMatch.id)?.focus, "Credit / Ult Economy");
assert.equal(doubleHeader.entries.find(entry => entry.matchId === laterTejoMatch.id)?.focus, "");

// A loadout cannot spill into another agent's match.
const mismatchedRoll = policy.syncMatchPlaceholders([], [{ ...incomingMatch, id: "henrik-match-sova-2", agent: "Sova" }], profileId, { pendingLoadoutRoll });
assert.equal(mismatchedRoll.entries[0]?.focus, "");
assert.equal(mismatchedRoll.consumedPendingLoadoutRollMatchId, "");

// Existing legacy drafts are deliberately not merged.  New form saves are
// blocked while a roll is pending, so the two-path merge design cannot recur.
const legacyDraft = {
  id: "legacy-unlinked-draft",
  profileId,
  createdAt: "2026-08-04T18:03:00.000Z",
  agent: "Tejo",
  focus: "Credit / Ult Economy",
  source: "player-reflection",
  isPlayerAuthored: true
};
const legacySync = policy.syncMatchPlaceholders([legacyDraft], [incomingMatch], profileId, { pendingLoadoutRoll });
assert.equal(legacySync.added, 1);
assert.equal(legacySync.entries.length, 2);
assert.equal(legacySync.entries.find(entry => entry.id === legacyDraft.id)?.matchId, undefined);
assert.ok(legacySync.entries.some(entry => entry.matchId === incomingMatch.id));

const normalPlaceholder = policy.syncMatchPlaceholders([], [incomingMatch], profileId);
assert.equal(normalPlaceholder.added, 1);
assert.equal(normalPlaceholder.entries[0].focus, "");
assert.equal(normalPlaceholder.entries[0].isMatchPlaceholder, true);
assert.equal(normalPlaceholder.entries[0].isPlayerAuthored, false);

const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
assert.match(appSource, /if \(!editingId && getPendingLoadoutRoll\(\)\)/);
assert.match(appSource, /function getSyncedLogEntryForMatch\(/);
assert.match(appSource, /function openSyncedMatchReflectionFlow\(/);
assert.match(appSource, /openSyncedMatchReflectionFlow\(newlyImportedReflection/);
assert.match(appSource, /function isProtectedVerifiedRankedLogEntry\(/);
assert.match(appSource, /Match record protected/);
assert.doesNotMatch(appSource, /findPendingLoadoutDraftIndex|mergeMatchPlaceholderIntoDraft|Verified match protected|Verified match<\//);

console.log("Logging single-entry checks passed: sync creates exactly one match entry, consumes the roll once, keeps mismatched focus blank, avoids draft merging, and routes the report into the saved entry editor.");
