import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

async function source(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("owner research tab is hidden by default and loaded through the governed client", async () => {
  const [html, app, reviewClient] = await Promise.all([
    source("public/index.html"),
    source("public/app.js"),
    source("public/knowledge-review.js")
  ]);
  assert.match(html, /id="accountSupportResearchTab"[^>]+hidden/);
  assert.match(html, /id="knowledgeResearchPanel"[^>]+hidden/);
  assert.match(html, /knowledge-review\.js\?v=[^"]+/);
  assert.match(app, /const tabOrder = \["account", "support", "research"\]/);
  assert.match(app, /RankedCoachKnowledgeReview\?\.syncAccess/);
  assert.match(reviewClient, /app_metadata\?\.role/);
  assert.match(reviewClient, /confirmOriginalWording/);
  assert.match(reviewClient, /Private transcript context/);
  assert.match(reviewClient, /\/api\/knowledge\/run/);
  assert.match(reviewClient, /\/api\/knowledge\/draft/);
  assert.match(reviewClient, /\/api\/knowledge\/reject/);
  assert.match(reviewClient, /\/api\/knowledge\/approve/);
  assert.match(reviewClient, /\/api\/knowledge\/publish/);
  assert.match(reviewClient, /const primaryAction = approved \? "publish" : "approve"/);
  assert.match(reviewClient, /const primaryLabel = approved \? "Publish to Library" : "Approve"/);
});

test("player Library consumes only the safe published-knowledge endpoint", async () => {
  const [library, worker] = await Promise.all([
    source("public/library/gamesense-library.js"),
    source("worker/index.js")
  ]);
  assert.match(library, /fetch\("\/api\/content\/knowledge"/);
  assert.match(library, /Approved coaching updates/);
  assert.doesNotMatch(library, /knowledge:private:transcript/);
  assert.match(worker, /handlePublicKnowledgeRequest/);
  assert.match(worker, /handleKnowledgeOwnerRequest/);
});
