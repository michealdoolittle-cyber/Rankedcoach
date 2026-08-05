"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const source = fs.readFileSync(path.join(repoRoot, "public", "integrations", "riot-sync.js"), "utf8");
const matchIds = Array.from({ length: 12 }, (_item, index) => `raw-batch-${index + 1}`);
let rawInFlight = 0;
let rawMaxInFlight = 0;
let rawCalls = 0;

function response(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; }
  };
}

globalThis.RankedCoachMatchRecord = {
  fromHenrikV4Match(match) {
    return {
      id: match.metadata.match_id,
      origin: "aggregate",
      agent: "Tejo",
      role: "Initiator",
      map: "Sunset",
      rank: { rank: "Platinum 3", rr: 42, rrDelta: 18, verified: true, source: "test" }
    };
  },
  fromHenrikRawMatch(payload) {
    return { id: payload.data.matchInfo.matchId, origin: "raw" };
  }
};

globalThis.fetch = async (url, options = {}) => {
  const route = String(url);
  const body = JSON.parse(options.body || "{}");
  if (route.includes("/api/henrik/matches")) {
    const start = Math.max(0, Number(body.start) || 0);
    const count = Math.max(1, Number(body.count) || matchIds.length);
    return response({
      ok: true,
      data: matchIds.slice(start, start + count).map(matchId => ({ metadata: { match_id: matchId } }))
    });
  }
  if (route.includes("/api/henrik/mmr-history")) return response({ ok: true, data: [] });
  if (!route.includes("/api/henrik/raw")) throw new Error(`Unexpected route: ${route}`);

  rawCalls += 1;
  rawInFlight += 1;
  rawMaxInFlight = Math.max(rawMaxInFlight, rawInFlight);
  const matchId = body.matchId;
  await new Promise(resolve => setTimeout(resolve, 45));
  rawInFlight -= 1;
  if (matchId === "raw-batch-4") {
    return response({ ok: false, status: 503, code: "henrik_503", error: "temporary raw payload failure", retryable: true });
  }
  return response({ ok: true, data: { matchInfo: { matchId } } });
};

vm.runInThisContext(source, { filename: "public/integrations/riot-sync.js" });

(async () => {
  const startedAt = Date.now();
  const result = await globalThis.RankedCoachRiotSync.pullMatches({
    puuid: "concurrency-player",
    region: "na",
    historyLimit: matchIds.length,
    hydrateRoundData: true,
    rawHydrationConcurrency: 3,
    rawMatchRetryDelaysMs: []
  });
  const elapsedMs = Date.now() - startedAt;

  assert.ok(rawCalls >= 4 && rawCalls < matchIds.length,
    `a transient provider failure should open the shared circuit before all optional raw requests run (${rawCalls}/${matchIds.length})`);
  assert.equal(rawMaxInFlight, 3, "raw payload hydration should use the configured bounded pool");
  assert.ok(elapsedMs < 350, `parallel batch should not take sequential time (${elapsedMs}ms)`);
  assert.equal(result.rawHydrationConcurrency, 3);
  assert.equal(result.rawMatchTimeoutMs, 9000);
  assert.equal(result.rawHydrationCircuit?.opened, true);
  assert.equal(result.rawHydrationCircuit?.code, "henrik_503");
  assert.ok(result.rawHydrationCircuit?.skipped > 0);
  assert.equal(result.records.length, matchIds.length, "one raw failure must retain its aggregate V4 record");
  assert.deepEqual(result.records.map(record => record.id), matchIds, "parallel hydration must preserve history order");
  assert.equal(result.records.find(record => record.id === "raw-batch-4").origin, "aggregate");
  const rawFailures = result.failures.filter(failure => failure.stage === "raw-round-data");
  const providerFailures = rawFailures.filter(failure => failure.skipped !== true);
  assert.equal(providerFailures.length, 1);
  assert.equal(providerFailures[0].matchId, "raw-batch-4");
  assert.equal(providerFailures[0].error, "temporary raw payload failure");
  assert.ok(rawFailures.filter(failure => failure.skipped === true).length > 0);

  console.log(`Raw hydration concurrency passed: ${rawMaxInFlight} in flight, ${elapsedMs}ms for ${matchIds.length} matches, and failure fallback retained the aggregate record.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
