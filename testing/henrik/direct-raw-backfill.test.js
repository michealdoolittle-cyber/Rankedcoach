"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const source = fs.readFileSync(path.join(repoRoot, "public", "integrations", "riot-sync.js"), "utf8");
const storedIds = Array.from({ length: 16 }, (_item, index) => `stored-backfill-${index + 1}`);
const historyStarts = [];
const rawRequests = [];

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; }
  };
}

globalThis.RankedCoachMatchRecord = {
  fromHenrikV4Match(match) {
    return { id: match.metadata.match_id, origin: "history" };
  },
  fromHenrikRawMatch(payload, context) {
    return {
      id: payload.data.matchInfo.matchId,
      origin: "direct-raw",
      agent: context.agent,
      role: context.role,
      map: context.map,
      rank: {
        rank: context.rank,
        rr: context.rr,
        rrDelta: context.rrDelta,
        verified: context.rrVerified
      }
    };
  }
};

globalThis.fetch = async (url, options = {}) => {
  const route = String(url);
  const body = JSON.parse(options.body || "{}");
  if (route.includes("/api/henrik/matches")) {
    historyStarts.push(Number(body.start) || 0);
    // The initial discovery window is legitimate. Any later page means a
    // stored backfill was incorrectly sent through relocation search.
    assert.equal(Number(body.start) || 0, 0, "stored raw backfills must not page history to rediscover known ids");
    return response({
      ok: true,
      data: [{ metadata: { match_id: "latest-known-match" } }]
    });
  }
  if (route.includes("/api/henrik/mmr-history")) return response({ ok: true, data: [] });
  assert.match(route, /\/api\/henrik\/raw/, "only Raw hydration should follow the initial history page");
  rawRequests.push(body.matchId);
  return response({ ok: true, data: { matchInfo: { matchId: body.matchId } } });
};

vm.runInThisContext(source, { filename: "public/integrations/riot-sync.js" });

(async () => {
  const refreshMatchRecords = storedIds.map((matchId, index) => ({
    matchId,
    record: {
      schemaVersion: 1,
      id: matchId,
      agent: "Sova",
      role: "Initiator",
      map: "Ascent",
      rank: {
        rank: "Platinum 3",
        rr: 42 + index,
        rrDelta: 18,
        verified: true
      }
    }
  }));
  const result = await globalThis.RankedCoachRiotSync.pullMatches({
    puuid: "stored-backfill-player",
    region: "na",
    historyLimit: 10,
    knownMatchIds: ["latest-known-match", ...storedIds],
    refreshMatchIds: storedIds,
    refreshMatchRecords,
    hydrateRoundData: true,
    rawMatchRetryDelaysMs: []
  });

  assert.deepEqual(historyStarts, [0], "only the normal latest-history request is made");
  assert.deepEqual(rawRequests.sort(), storedIds.slice().sort(), "every selected stored record hydrates directly by id");
  assert.equal(result.refreshSearchChecked, 0);
  assert.deepEqual(result.unresolvedRefreshMatchIds, []);
  assert.deepEqual(result.directRefreshMatchIds.sort(), storedIds.slice().sort());
  assert.deepEqual(result.directRefreshSucceededMatchIds.sort(), storedIds.slice().sort());
  const example = result.records.find(record => record.id === storedIds[0]);
  assert.deepEqual(example, {
    id: storedIds[0],
    origin: "direct-raw",
    agent: "Sova",
    role: "Initiator",
    map: "Ascent",
    rank: { rank: "Platinum 3", rr: 42, rrDelta: 18, verified: true }
  });

  console.log(`Direct raw backfill passed: ${rawRequests.length} Raw requests with ${historyStarts.length} history page and no relocation search.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
