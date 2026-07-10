"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.resolve(__dirname, "..", "..");
const requests = [];

globalThis.RankedCoachMatchRecord = {
  fromRiotMatch(match) {
    return match;
  },
  fromHenrikRawMatch(match) {
    return match;
  },
  fromHenrikV4Match(match) {
    return { id: match.metadata.match_id, act: match.metadata.season.short };
  }
};

globalThis.fetch = async (_url, options = {}) => {
  const body = JSON.parse(options.body || "{}");
  requests.push(body);
  assert.equal(body.start % 10, 0);
  const available = Math.max(0, 25 - body.start);
  const count = Math.min(body.count, available);
  const data = Array.from({ length: count }, (_item, index) => ({
    metadata: {
      match_id: `match-${body.start + index}`,
      season: { short: body.start < 20 ? "e11a3" : "e10a6" }
    }
  }));
  return {
    ok: true,
    async json() {
      return { data };
    }
  };
};

const source = fs.readFileSync(path.join(repoRoot, "public", "integrations", "riot-sync.js"), "utf8");
vm.runInThisContext(source, { filename: "public/integrations/riot-sync.js" });

(async () => {
  const result = await globalThis.RankedCoachRiotSync.pullMatches({
    puuid: "fdc507ce-cd41-5236-8962-fce4ac427e12",
    region: "na",
    historyLimit: 25,
    knownMatchIds: ["match-3", "match-4"],
    refreshMatchIds: ["match-3"]
  });

  assert.deepEqual(requests.map(request => request.start), [0, 10, 20]);
  assert.deepEqual(requests.map(request => request.count), [10, 10, 5]);
  assert.equal(result.checked, 25);
  assert.equal(result.records.length, 24);
  assert.equal(result.records.some(record => record.id === "match-3"), true);
  assert.equal(result.records.some(record => record.id === "match-4"), false);
  assert.equal(result.historyWindowComplete, true);
  assert.equal(result.historyLimit, 25);

  console.log("Henrik history pagination passed: 25 checked across starts 0/10/20 with no Raw requests.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
