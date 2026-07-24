import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("private transcript analyzer is token-gated and returns structured non-stored insights", async () => {
  const source = await readFile(
    path.join(root, "supabase", "functions", "knowledge-analyze", "index.ts"),
    "utf8"
  );
  assert.match(source, /KNOWLEDGE_PIPELINE_TOKEN/);
  assert.match(source, /x-rankedcoach-pipeline-token/);
  assert.match(source, /store:\s*false/);
  assert.match(source, /rankedcoach_video_insights/);
  assert.match(source, /contextExcerpt/);
  assert.match(source, /suggestedWording/);
  assert.match(source, /whyItMatters/);
  assert.match(source, /Never invent a number/);
});
