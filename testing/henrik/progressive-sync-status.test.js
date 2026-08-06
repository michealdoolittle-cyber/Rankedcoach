"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const puuid = "progressive-sync-puuid";
let firstHistoryAttempt = true;
let activeHistoryRequests = 0;
let maxParallelHistoryRequests = 0;

function response(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return payload; }
  };
}

function matches(start, count) {
  return Array.from({ length: count }, (_value, index) => ({
    metadata: { match_id: `progressive-${start + index}` }
  }));
}

globalThis.RankedCoachMatchRecord = {
  fromHenrikV4Match(match) {
    return { id: match.metadata.match_id };
  }
};

globalThis.fetch = async (url, request = {}) => {
  const body = JSON.parse(request.body || "{}");
  const pathName = String(url);
  if (pathName.includes("/api/henrik/account")) {
    return response(200, { data: { puuid } });
  }
  if (pathName.includes("/api/henrik/mmr-history-live")) return response(200, { data: [] });
  if (pathName.includes("/api/henrik/mmr-history")) return response(200, { data: [] });
  if (!pathName.includes("/api/henrik/matches")) throw new Error(`Unexpected endpoint: ${pathName}`);

  if (body.start === 0 && firstHistoryAttempt) {
    firstHistoryAttempt = false;
    return response(200, {
      ok: false,
      error: "Provider busy",
      code: "henrik_429",
      status: 429,
      retryable: true
    });
  }
  activeHistoryRequests += 1;
  maxParallelHistoryRequests = Math.max(maxParallelHistoryRequests, activeHistoryRequests);
  await new Promise(resolve => setTimeout(resolve, 20));
  activeHistoryRequests -= 1;
  return response(200, { data: matches(body.start, body.count) });
};

const source = fs.readFileSync(path.join(repoRoot, "public", "integrations", "riot-sync.js"), "utf8");
vm.runInThisContext(source, { filename: "public/integrations/riot-sync.js" });

(async () => {
  const progress = [];
  const requests = [];
  const result = await globalThis.RankedCoachRiotSync.pullMatches({
    riotId: "Progressive#NA1",
    region: "na",
    historyLimit: 40,
    includeKnownMatches: true,
    hydrateRoundData: false,
    historyPageConcurrency: 3,
    matchRetryDelaysMs: [0, 0],
    waitForRetry: () => {},
    onProgress: event => progress.push(event),
    onRequest: event => requests.push(event)
  });

  assert.equal(result.checked, 40);
  assert.equal(result.records.length, 40);
  assert.equal(result.matchSyncError, null);
  assert.ok(maxParallelHistoryRequests >= 2, `expected later history pages to overlap, saw ${maxParallelHistoryRequests}`);
  assert.ok(progress.some(event => /Checking match history — page 2 of 4/.test(event.message)), JSON.stringify(progress));
  assert.ok(progress.some(event => /Waiting on Henrik — retry 1 of 2/.test(event.message)), JSON.stringify(progress));
  assert.ok(requests.some(event => event.phase === "end" && event.path === "/api/henrik/account" && event.ok === true));
  assert.ok(requests.some(event => event.phase === "end" && event.path === "/api/henrik/matches" && event.ok === false && event.providerStatus === 429));
  assert.ok(requests.some(event => event.phase === "end" && event.path === "/api/henrik/mmr-history" && event.ok === true));

  console.log("Progressive sync status passed: live retry/history progress, bounded parallel history pages, and endpoint diagnostics.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
