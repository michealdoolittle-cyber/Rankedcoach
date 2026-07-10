"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(path.resolve(__dirname, "..", "public", "data", "log-policy.js"), "utf8");
vm.runInThisContext(source, { filename: "public/data/log-policy.js" });

const policy = globalThis.RankedCoachLogPolicy;
const authored = { id: "authored-1", notes: "Real note", createdAt: "2026-07-10T10:00:00Z" };
const demo = { id: "demo-1", source: "demo-fixture", demoAct: "Season 2026 Act 3" };
const placeholder = policy.createMatchPlaceholder({
  id: "match-1",
  createdAt: "2026-07-09T10:00:00Z",
  result: "win",
  agent: "Sova",
  map: "Lotus"
}, "profile-1");

assert.equal(policy.isSyntheticDemoLog(demo), true);
assert.equal(policy.isSyntheticDemoLog(authored), false);
assert.equal(policy.isPlayerAuthored(authored), true);
assert.equal(policy.isPlayerAuthored(placeholder), false);
assert.equal(placeholder.id, "ranked-match-log:profile-1:match-1");
assert.equal(placeholder.notes, "");
assert.equal(placeholder.profileId, "profile-1");

const signedLogs = policy.sanitizeLogEntries([demo, authored, placeholder], {
  signedIn: true,
  profileId: "profile-1"
});
assert.deepEqual(signedLogs.map(entry => entry.id), ["authored-1", "ranked-match-log:profile-1:match-1"]);
assert.equal(signedLogs[0].profileId, "profile-1");

const synced = policy.syncMatchPlaceholders([authored, placeholder], [
  { id: "match-1", createdAt: "2026-07-09T10:00:00Z" },
  { id: "match-2", createdAt: "2026-07-08T10:00:00Z", agent: "Omen", map: "Haven" }
], "profile-1");
assert.equal(synced.added, 1);
assert.equal(synced.entries.length, 3);
assert.equal(synced.entries[2].matchId, "match-2");
assert.equal(synced.entries[2].notes, "");

const completed = { ...placeholder, isMatchPlaceholder: false, isPlayerAuthored: true, notes: "My review" };
assert.equal(policy.isPlayerAuthored(completed), true);

console.log("Log policy checks passed: demo cleanup, account scoping, blank placeholder, authored conversion.");
