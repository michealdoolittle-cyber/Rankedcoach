"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const matchPages = [];
const makeMatch = index => ({ metadata: { match_id: `match-${index}` } });
globalThis.RankedCoachMatchRecord = {
  fromHenrikV4Match(match, context) {
    return { id: match.metadata.match_id, context };
  }
};
globalThis.fetch = async (_url, options = {}) => {
  const body = JSON.parse(options.body || "{}");
  if (String(_url).includes("/api/henrik/mmr-history")) {
    return {
      ok: true,
      async json() {
        return {
          data: [{
            match_id: "match-0",
            tier: { id: 19, name: "Diamond 2" },
            rr: 50,
            last_change: -18,
            elo: 1650
          }]
        };
      }
    };
  }
  if (String(_url).includes("/api/henrik/matches")) {
    matchPages.push(body.start);
    const count = body.start < 80 ? 10 : body.start === 80 ? 6 : 0;
    return {
      ok: true,
      async json() {
        return { data: Array.from({ length: count }, (_item, offset) => makeMatch(body.start + offset)) };
      }
    };
  }
  throw new Error(`Unexpected request: ${_url}`);
};

const source = fs.readFileSync(
  path.resolve(__dirname, "..", "public", "integrations", "riot-sync.js"),
  "utf8"
);
vm.runInThisContext(source, { filename: "public/integrations/riot-sync.js" });

(async () => {
  const result = await globalThis.RankedCoachRiotSync.pullMatches({
    puuid: "test-puuid",
    region: "na",
    historyLimit: 100
  });
  assert.equal(result.checked, 86);
  assert.equal(result.records.length, 86);
  assert.equal(result.historyWindowComplete, true);
  assert.deepEqual(matchPages, [0, 10, 20, 30, 40, 50, 60, 70, 80]);
  assert.equal(result.records[0].context.mmrSnapshot.rr, 50);

  const enriched = globalThis.RankedCoachRiotSync.enrichLegacyMatchesWithMmr([{
    id: "match-0",
    matchId: "match-0",
    source: "henrik_sync",
    metadata: { matchId: "match-0", source: "henrik_sync" },
    matchRecord: { rank: {} }
  }, {
    id: "match-1",
    matchId: "match-1",
    source: "henrik_sync",
    metadata: { matchId: "match-1", source: "henrik_sync" },
    matchRecord: { rank: {} }
  }], result.mmrHistory);
  assert.equal(enriched[0].rr, null);
  assert.equal(enriched[0].verifiedRrDelta, -18);
  assert.equal(enriched[0].rrTotal, 50);
  assert.equal(enriched[0].rrVerified, true);
  assert.notEqual(enriched[1].rrVerified, true);
  assert.equal(enriched[1].rrTotal, undefined);

  const preserved = globalThis.RankedCoachRiotSync.enrichLegacyMatchesWithMmr([{
    id: "older-match",
    source: "henrik_sync",
    rrVerified: true,
    rrTotal: 61,
    verifiedRrDelta: -16
  }], []);
  assert.equal(preserved[0].rrVerified, true);
  assert.equal(preserved[0].rrTotal, 61);
  console.log("Henrik history checks passed: 86-match exhaustion, 100-match window, and verified MMR enrichment.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
