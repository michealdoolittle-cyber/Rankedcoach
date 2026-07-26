"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const source = fs.readFileSync(path.join(repoRoot, "public/integrations/riot-sync.js"), "utf8");

function createContext({ rawFails = false } = {}) {
  let rawRequests = 0;
  const context = {
    AbortController,
    Response,
    URL,
    console,
    setTimeout,
    clearTimeout,
    globalThis: null,
    RankedCoachMatchRecord: {
      fromHenrikV4Match(match, options) {
        return {
          id: match.metadata.match_id,
          origin: "aggregate",
          agent: "Jett",
          role: "Duelist",
          map: "Breeze",
          isPlacementMatch: false,
          rank: { rank: "Diamond 2", rr: 42, rrDelta: 18, verified: true, source: "henrik-test" },
          options
        };
      },
      fromHenrikRawMatch(payload, options) {
        return { id: payload.data.matchInfo.matchId, origin: "raw", options };
      }
    },
    fetch: async (url) => {
      const route = String(url);
      if (route.includes("/api/henrik/matches")) {
        return Response.json({ ok: true, data: [{ metadata: { match_id: "new-match" } }] });
      }
      if (route.includes("/api/henrik/mmr-history")) return Response.json({ ok: true, data: [] });
      if (route.includes("/api/henrik/raw")) {
        rawRequests += 1;
        if (rawFails) return Response.json({ ok: false, status: 429, code: "henrik_429", error: "busy", retryable: true });
        if (rawRequests === 1) return Response.json({ ok: false, status: 429, code: "henrik_429", error: "busy", retryable: true });
        return Response.json({ ok: true, data: { matchInfo: { matchId: "new-match" } } });
      }
      throw new Error(`Unexpected route: ${route}`);
    }
  };
  context.globalThis = context;
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "public/integrations/riot-sync.js" });
  return { context, getRawRequests: () => rawRequests };
}

async function run() {
  const hydrated = createContext();
  const retryDelays = [];
  const result = await hydrated.context.RankedCoachRiotSync.pullMatches({
    puuid: "player-puuid",
    region: "na",
    historyLimit: 1,
    hydrateRoundData: true,
    rawMatchRetryDelaysMs: [0, 0],
    waitForRetry(delay) { retryDelays.push(delay); }
  });
  assert.equal(hydrated.getRawRequests(), 2, "A transient raw response should retry before a record is downgraded.");
  assert.equal(retryDelays.length, 1);
  assert.equal(result.records[0].origin, "raw");
  assert.equal(result.records[0].options.rankElo, undefined);
  assert.equal(result.records[0].options.rrVerified, true);

  const fallback = createContext({ rawFails: true });
  const fallbackResult = await fallback.context.RankedCoachRiotSync.pullMatches({
    puuid: "player-puuid",
    region: "na",
    historyLimit: 1,
    hydrateRoundData: true,
    rawMatchRetryDelaysMs: [0],
    waitForRetry() {}
  });
  assert.equal(fallback.getRawRequests(), 2);
  assert.equal(fallbackResult.records[0].origin, "aggregate");
  assert.equal(fallbackResult.failures[0].stage, "raw-round-data");
  console.log("Situational sync checks passed: raw retries hydrate new matches and rate-limit fallback preserves aggregate data.");
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
