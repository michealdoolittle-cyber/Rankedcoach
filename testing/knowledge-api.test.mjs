import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticateKnowledgeOwner,
  handlePublicKnowledgeRequest,
  knowledgeApiErrorResponse
} from "../worker/knowledge-api.mjs";

class MemoryKv {
  constructor(values = {}) {
    this.values = new Map(Object.entries(values));
  }

  async get(key, type) {
    const value = this.values.get(key);
    if (value == null) return null;
    return type === "json" ? JSON.parse(value) : value;
  }
}

test("knowledge owner authentication verifies the Supabase token and app role", async () => {
  const request = new Request("https://www.rankedcoach.gg/api/knowledge/review", {
    headers: { Authorization: "Bearer owner-token" }
  });
  const owner = await authenticateKnowledgeOwner(request, {}, async (_url, init) => {
    assert.equal(init.headers.Authorization, "Bearer owner-token");
    assert.ok(init.headers.apikey);
    return Response.json({
      id: "owner-id",
      email: "owner@example.com",
      app_metadata: { role: "owner" },
      user_metadata: { username: "Michael" }
    });
  });
  assert.equal(owner.displayName, "Michael");
});

test("knowledge owner authentication rejects a valid non-owner account", async () => {
  const request = new Request("https://www.rankedcoach.gg/api/knowledge/review", {
    headers: { Authorization: "Bearer player-token" }
  });
  await assert.rejects(
    authenticateKnowledgeOwner(request, {}, async () => Response.json({
      id: "player-id",
      email: "player@example.com",
      app_metadata: {}
    })),
    /Owner access required/
  );
});

test("public knowledge route exposes only the publication index", async () => {
  const publicRecord = {
    id: "proposal-concept-one",
    status: "published",
    wording: "Trade the first lane contact before the team commits through the choke.",
    category: "map",
    entity: "Bind",
    evidence: [{ url: "https://www.youtube.com/watch?v=abcdefghijk&t=12s", startSeconds: 12 }]
  };
  const privateTranscript = {
    cues: [{ text: "Private transcript wording must never leave storage." }]
  };
  const kv = new MemoryKv({
    "knowledge:published:index": JSON.stringify({ updatedAt: "2026-07-24T00:00:00.000Z", items: [publicRecord] }),
    "knowledge:private:transcript:youtube-abcdefghijk": JSON.stringify(privateTranscript)
  });
  const response = await handlePublicKnowledgeRequest({ CONTENT_AUTOMATION: kv });
  const body = await response.json();
  assert.equal(body.items.length, 1);
  assert.match(body.items[0].wording, /Trade the first lane/);
  assert.doesNotMatch(JSON.stringify(body), /Private transcript wording/);
});

test("knowledge API errors use authentication and validation status codes", async () => {
  assert.equal(knowledgeApiErrorResponse(new Error("Authentication required.")).status, 401);
  assert.equal(knowledgeApiErrorResponse(new Error("Owner access required.")).status, 403);
  assert.equal(knowledgeApiErrorResponse(new Error("A valid category is required.")).status, 400);
});
