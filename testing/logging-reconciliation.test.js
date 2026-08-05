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

function draft(overrides = {}) {
  return {
    id: "draft-tejo-1",
    profileId,
    createdAt: "2026-08-04T18:03:00.000Z",
    agent: "Tejo",
    focus: "Credit / Ult Economy",
    rating: 4,
    mood: "Focused",
    teamComms: 4,
    selfComms: 5,
    notes: "Called ult timing before the site hit.",
    source: "player-reflection",
    isPlayerAuthored: true,
    ...overrides
  };
}

// Saved reflection draft + later Henrik match become one linked entry. The
// authored fields survive and the verified match fields arrive in the same card.
const savedSync = policy.syncMatchPlaceholders([draft()], [incomingMatch], profileId, { pendingLoadoutRoll });
assert.equal(savedSync.added, 0);
assert.equal(savedSync.reconciled, 1);
assert.equal(savedSync.entries.length, 1);
const mergedSaved = savedSync.entries[0];
assert.equal(mergedSaved.id, "draft-tejo-1");
assert.equal(mergedSaved.matchId, "henrik-match-tejo-1");
assert.equal(mergedSaved.rr, 21);
assert.equal(mergedSaved.roleImpact.score, 74);
assert.equal(mergedSaved.focus, "Credit / Ult Economy");
assert.equal(mergedSaved.rating, 4);
assert.equal(mergedSaved.mood, "Focused");
assert.equal(mergedSaved.notes, "Called ult timing before the site hit.");
assert.equal(mergedSaved.isPlayerAuthored, true);

// An in-progress edit is represented by the same stored draft record. Blank
// notes must not erase the rolled focus or produce a second placeholder.
const midEditSync = policy.syncMatchPlaceholders([
  draft({ id: "draft-tejo-edit", notes: "", rating: null, mood: "" })
], [incomingMatch], profileId, { pendingLoadoutRoll });
assert.equal(midEditSync.added, 0);
assert.equal(midEditSync.reconciled, 1);
assert.equal(midEditSync.entries[0].focus, "Credit / Ult Economy");
assert.equal(midEditSync.entries[0].notes, "");
assert.equal(midEditSync.entries[0].matchId, "henrik-match-tejo-1");

// An unrelated/older draft must never be linked to the new result.
const unmatched = policy.syncMatchPlaceholders([
  draft({ id: "old-draft", createdAt: "2026-08-04T17:45:00.000Z" })
], [incomingMatch], profileId, { pendingLoadoutRoll });
assert.equal(unmatched.reconciled, 0);
assert.equal(unmatched.added, 1);
assert.equal(unmatched.entries.length, 2);
assert.ok(unmatched.entries.some(entry => entry.matchId === "henrik-match-tejo-1"));
assert.equal(
  unmatched.entries.find(entry => entry.matchId === "henrik-match-tejo-1")?.focus,
  "Credit / Ult Economy",
  "A fresh synced placeholder must inherit a same-agent pending loadout focus even when no manual draft exists."
);

const mismatchedRoll = policy.syncMatchPlaceholders([], [{ ...incomingMatch, id: "henrik-match-sova-2", agent: "Sova" }], profileId, { pendingLoadoutRoll });
assert.equal(
  mismatchedRoll.entries[0]?.focus,
  "",
  "A loadout focus must not spill into a different agent's synced match."
);

// With no rolled draft, normal placeholder creation remains unchanged.
const normalPlaceholder = policy.syncMatchPlaceholders([], [incomingMatch], profileId);
assert.equal(normalPlaceholder.reconciled, 0);
assert.equal(normalPlaceholder.added, 1);
assert.equal(normalPlaceholder.entries[0].isMatchPlaceholder, true);
assert.equal(normalPlaceholder.entries[0].isPlayerAuthored, false);

const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
assert.match(appSource, /async function performPersistentAccountStateSave[\s\S]*?try\s*\{\s*user = await getSupabaseUser/);
assert.match(appSource, /auth-save-timeout/);
assert.match(appSource, /schedulePersistentAccountSaveRetry\("auth-save-unavailable"\)/);
assert.match(appSource, /function deleteLogEntry\(/);
assert.match(appSource, /function isProtectedVerifiedRankedLogEntry\(/);
assert.match(appSource, /Verified match protected/);
assert.match(appSource, /queuePersistentLogDeletion\(entryId\)/);
assert.match(appSource, /const retainedSync = await syncProfileRetainedHistory\(/);
assert.match(appSource, /safeNumber\(retainedSync\?\.totalImported\) > 0 && retainedSync\?\.prefilled/);
assert.match(appSource, /activatePage\?\.\("logging", \{ source: "login-new-match" \}\)/);

console.log("Logging reconciliation checks passed: rolled drafts merge safely, fresh placeholders inherit same-agent focus, verified RR entries are guarded, new login imports route to reflection, normal placeholders remain intact, deletes queue cloud removal, and auth save timeouts retry.");
