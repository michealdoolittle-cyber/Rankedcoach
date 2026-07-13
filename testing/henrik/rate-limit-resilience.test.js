"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const resolvedPuuid = "62a85dd7-1b17-4f45-9941-9fab4e32f820";
let scenario = "retry-success";
let matchRequests = [];
let accountRequests = 0;
let retryWaits = [];

const response = (status, payload) => ({
  ok: status >= 200 && status < 300,
  status,
  async json() {
    return payload;
  }
});

const makeMatches = (start, count) => Array.from({ length: count }, (_item, index) => ({
  metadata: { match_id: `match-${start + index}` }
}));

globalThis.RankedCoachMatchRecord = {
  fromHenrikV4Match(match, context) {
    return { id: match.metadata.match_id, context };
  }
};

globalThis.fetch = async (url, options = {}) => {
  const body = JSON.parse(options.body || "{}");
  if (String(url).includes("/api/henrik/account")) {
    accountRequests += 1;
    return response(200, { data: { puuid: resolvedPuuid, name: "Subroza", tag: "RULT" } });
  }
  if (String(url).includes("/api/henrik/mmr-history")) {
    return response(200, { data: [] });
  }
  if (!String(url).includes("/api/henrik/matches")) {
    throw new Error(`Unexpected request: ${url}`);
  }

  matchRequests.push({ start: body.start, count: body.count });
  const requestsAtStart = matchRequests.filter(request => request.start === body.start).length;
  if (scenario === "retry-success") {
    if (body.start === 0 && requestsAtStart < 3) {
      return response(429, {
        ok: false,
        error: "Rate limit exceeded, please try again later. For further information check the headers of the response.",
        code: "henrik_429"
      });
    }
    return response(200, { data: makeMatches(body.start, body.start === 0 ? 10 : 3) });
  }
  if (scenario === "first-page-failure") {
    return response(429, {
      ok: false,
      error: "Rate limit exceeded, please try again later. For further information check the headers of the response.",
      code: "henrik_429"
    });
  }
  if (scenario === "partial-history") {
    if (body.start === 0) return response(200, { data: makeMatches(0, 10) });
    return response(503, {
      ok: false,
      error: "Henrik could not complete the request.",
      code: "henrik_503"
    });
  }
  throw new Error(`Unknown scenario: ${scenario}`);
};

const source = fs.readFileSync(path.join(repoRoot, "public", "integrations", "riot-sync.js"), "utf8");
vm.runInThisContext(source, { filename: "public/integrations/riot-sync.js" });

const pull = options => globalThis.RankedCoachRiotSync.pullMatches({
  region: "na",
  matchRetryDelaysMs: [0, 0],
  waitForRetry(delayMs, context) {
    retryWaits.push({ delayMs, attempt: context.attempt, start: context.body.start });
  },
  ...options
});

(async () => {
  const recovered = await pull({ riotId: "Subroza#RULT", historyLimit: 20 });
  assert.equal(recovered.puuid, resolvedPuuid);
  assert.equal(accountRequests, 1);
  assert.equal(recovered.checked, 13);
  assert.equal(recovered.records.length, 13);
  assert.equal(recovered.matchSyncError, null);
  assert.equal(recovered.historyWindowComplete, true);
  assert.deepEqual(matchRequests.map(request => request.start), [0, 0, 0, 10]);
  assert.deepEqual(retryWaits.map(wait => wait.attempt), [1, 2]);

  scenario = "first-page-failure";
  matchRequests = [];
  retryWaits = [];
  const failed = await pull({ riotId: "Subroza#RULT", historyLimit: 10 });
  assert.equal(failed.puuid, resolvedPuuid);
  assert.equal(accountRequests, 2);
  assert.equal(failed.checked, 0);
  assert.equal(failed.records.length, 0);
  assert.equal(failed.matchSyncError.code, "henrik_429");
  assert.equal(failed.matchSyncError.status, 429);
  assert.equal(failed.matchSyncError.retryable, true);
  assert.equal(failed.matchSyncError.attempts, 3);
  assert.equal(failed.failures[0].stage, "matches");
  assert.deepEqual(matchRequests.map(request => request.start), [0, 0, 0]);

  scenario = "partial-history";
  matchRequests = [];
  retryWaits = [];
  const partial = await pull({ puuid: resolvedPuuid, historyLimit: 20 });
  assert.equal(partial.checked, 10);
  assert.equal(partial.records.length, 10);
  assert.equal(partial.matchSyncError.code, "henrik_503");
  assert.equal(partial.matchSyncError.attempts, 3);
  assert.equal(partial.historyWindowComplete, false);
  assert.deepEqual(matchRequests.map(request => request.start), [0, 10, 10, 10]);

  console.log("Henrik rate-limit resilience passed: transient retry recovery, resolved-PUUID retention, and partial-page preservation.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
