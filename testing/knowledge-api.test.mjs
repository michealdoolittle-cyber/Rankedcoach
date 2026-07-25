import assert from "node:assert/strict";
import test from "node:test";
import {
  authenticateKnowledgeOwner,
  handleKnowledgeOwnerRequest,
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

  async put(key, value) {
    this.values.set(key, String(value));
  }

  async list({ prefix = "" } = {}) {
    return {
      keys: [...this.values.keys()].filter(key => key.startsWith(prefix)).map(name => ({ name })),
      list_complete: true
    };
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
    evidence: [{
      url: "https://www.youtube.com/watch?v=abcdefghijk&t=12s",
      startSeconds: 12,
      privateExcerpt: "Never expose this evidence text."
    }],
    privateExcerpt: "Never expose this proposal text.",
    providerMetadata: { secret: true },
    owner: "Michael"
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
  assert.doesNotMatch(JSON.stringify(body), /Never expose|providerMetadata|Michael/);
});

test("knowledge API errors use authentication and validation status codes", async () => {
  assert.equal(knowledgeApiErrorResponse(new Error("Authentication required.")).status, 401);
  assert.equal(knowledgeApiErrorResponse(new Error("Owner access required.")).status, 403);
  assert.equal(knowledgeApiErrorResponse(new Error("A valid category is required.")).status, 400);
  assert.equal(knowledgeApiErrorResponse(new Error("Approval must confirm that the wording is original.")).status, 400);
  assert.equal(knowledgeApiErrorResponse(new Error("Only an owner-approved proposal can be published.")).status, 400);
});

test("owner review API paginates the selected decision bin", async () => {
  const proposalIndex = [
    { id: "proposal-review", approvalStatus: "pending-owner-approval" },
    { id: "proposal-approved", approvalStatus: "published" },
    { id: "proposal-rejected", approvalStatus: "rejected" }
  ];
  const kv = new MemoryKv({
    "knowledge:review:latest": JSON.stringify({
      id: "review-bins",
      createdAt: "2026-07-24T08:00:00.000Z",
      status: "review-required",
      summary: {},
      proposalIndex
    }),
    "knowledge:proposal:proposal-review": JSON.stringify({ ...proposalIndex[0], evidence: [] }),
    "knowledge:proposal:proposal-approved": JSON.stringify({ ...proposalIndex[1], evidence: [] }),
    "knowledge:proposal:proposal-rejected": JSON.stringify({ ...proposalIndex[2], evidence: [] })
  });
  const request = new Request("https://www.rankedcoach.gg/api/knowledge/review?proposalBucket=rejected", {
    headers: {
      Authorization: "Bearer owner-token",
      Origin: "https://www.rankedcoach.gg"
    }
  });
  const response = await handleKnowledgeOwnerRequest(request, {
    CONTENT_AUTOMATION: kv
  }, {
    fetchImpl: async () => Response.json({
      id: "owner-id",
      email: "owner@example.com",
      app_metadata: { role: "owner" },
      user_metadata: { username: "Michael" }
    })
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.review.proposals.map(item => item.id), ["proposal-rejected"]);
  assert.deepEqual(body.review.page.bucketCounts, { review: 1, approved: 1, rejected: 1 });
  assert.equal(body.review.page.bucket, "rejected");
});

test("owner approval stays private until a separate publish request", async () => {
  const proposal = {
    id: "proposal-two-stage",
    conceptId: "concept-two-stage",
    type: "coaching",
    topic: "map-control",
    entities: ["Bind"],
    state: "single-source",
    approvalStatus: "pending-owner-approval",
    evidence: []
  };
  const kv = new MemoryKv({
    "knowledge:review:latest": JSON.stringify({
      id: "review-two-stage",
      createdAt: "2026-07-25T00:00:00.000Z",
      status: "review-required",
      summary: { pendingApproval: 1, published: 0 },
      proposalIndex: [{ id: proposal.id, approvalStatus: proposal.approvalStatus }]
    }),
    [`knowledge:proposal:${proposal.id}`]: JSON.stringify(proposal)
  });
  const fetchImpl = async () => Response.json({
    id: "owner-id",
    email: "owner@example.com",
    app_metadata: { role: "owner" },
    user_metadata: { username: "Michael" }
  });
  const approvalResponse = await handleKnowledgeOwnerRequest(new Request(
    "https://www.rankedcoach.gg/api/knowledge/approve",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
        Origin: "https://www.rankedcoach.gg"
      },
      body: JSON.stringify({
        proposalId: proposal.id,
        rankedCoachWording: "Pair the first Showers utility with a teammate who can immediately trade the space.",
        confirmOriginalWording: true
      })
    }
  ), { CONTENT_AUTOMATION: kv }, { fetchImpl });
  assert.equal(approvalResponse.status, 200);
  assert.equal((await approvalResponse.json()).status, "approved-for-manual-library-promotion");
  assert.equal((await kv.get(`knowledge:proposal:${proposal.id}`, "json")).approvalStatus, "approved");
  assert.equal((await handlePublicKnowledgeRequest({ CONTENT_AUTOMATION: kv }).then(response => response.json())).items.length, 0);

  const approvedDashboardResponse = await handleKnowledgeOwnerRequest(new Request(
    "https://www.rankedcoach.gg/api/knowledge/review?proposalBucket=approved",
    {
      headers: {
        Authorization: "Bearer owner-token",
        Origin: "https://www.rankedcoach.gg"
      }
    }
  ), { CONTENT_AUTOMATION: kv }, { fetchImpl });
  const approvedDashboard = await approvedDashboardResponse.json();
  assert.deepEqual(approvedDashboard.review.proposals.map(item => item.id), [proposal.id]);
  assert.equal(approvedDashboard.review.proposals[0].approvalStatus, "approved");

  const publicationResponse = await handleKnowledgeOwnerRequest(new Request(
    "https://www.rankedcoach.gg/api/knowledge/publish",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer owner-token",
        "Content-Type": "application/json",
        Origin: "https://www.rankedcoach.gg"
      },
      body: JSON.stringify({
        proposalId: proposal.id,
        category: "map",
        entity: "Bind"
      })
    }
  ), { CONTENT_AUTOMATION: kv }, { fetchImpl });
  assert.equal(publicationResponse.status, 200);
  assert.equal((await publicationResponse.json()).status, "published");
  assert.equal((await handlePublicKnowledgeRequest({ CONTENT_AUTOMATION: kv }).then(response => response.json())).items.length, 1);
});

test("publish cannot implicitly approve a pending proposal", async () => {
  const proposal = {
    id: "proposal-pending-publish",
    conceptId: "concept-pending-publish",
    type: "coaching",
    topic: "teamplay",
    entities: [],
    state: "single-source",
    approvalStatus: "pending-owner-approval",
    evidence: []
  };
  const kv = new MemoryKv({
    "knowledge:review:latest": JSON.stringify({
      id: "review-pending-publish",
      createdAt: "2026-07-25T00:00:00.000Z",
      status: "review-required",
      summary: { pendingApproval: 1, published: 0 },
      proposalIndex: [{ id: proposal.id, approvalStatus: proposal.approvalStatus }]
    }),
    [`knowledge:proposal:${proposal.id}`]: JSON.stringify(proposal)
  });
  const request = new Request("https://www.rankedcoach.gg/api/knowledge/publish", {
    method: "POST",
    headers: {
      Authorization: "Bearer owner-token",
      "Content-Type": "application/json",
      Origin: "https://www.rankedcoach.gg"
    },
    body: JSON.stringify({
      proposalId: proposal.id,
      rankedCoachWording: "This wording must not silently approve and publish the pending proposal.",
      confirmOriginalWording: true,
      category: "general",
      entity: ""
    })
  });
  const fetchImpl = async () => Response.json({
    id: "owner-id",
    email: "owner@example.com",
    app_metadata: { role: "owner" },
    user_metadata: { username: "Michael" }
  });
  let failure;
  try {
    await handleKnowledgeOwnerRequest(request, { CONTENT_AUTOMATION: kv }, { fetchImpl });
  } catch (error) {
    failure = error;
  }
  assert.match(failure?.message || "", /owner-approved/);
  assert.equal(knowledgeApiErrorResponse(failure).status, 400);
  assert.equal((await kv.get(`knowledge:proposal:${proposal.id}`, "json")).approvalStatus, "pending-owner-approval");
  assert.equal(await kv.get(`knowledge:approval:${proposal.id}`, "json"), null);
  assert.equal((await handlePublicKnowledgeRequest({ CONTENT_AUTOMATION: kv }).then(response => response.json())).items.length, 0);
});

test("owner processing continues from retained storage when Playlist refresh fails", async () => {
  const kv = new MemoryKv();
  const request = new Request("https://www.rankedcoach.gg/api/knowledge/run", {
    method: "POST",
    headers: {
      Authorization: "Bearer owner-token",
      "Content-Type": "application/json",
      Origin: "https://www.rankedcoach.gg"
    },
    body: JSON.stringify({ batchSize: 1 })
  });
  const response = await handleKnowledgeOwnerRequest(request, {
    CONTENT_AUTOMATION: kv
  }, {
    sources: [],
    refreshPlaylist: async () => {
      throw new Error("YouTube refresh unavailable");
    },
    fetchImpl: async () => Response.json({
      id: "owner-id",
      email: "owner@example.com",
      app_metadata: { role: "owner" },
      user_metadata: { username: "Michael" }
    })
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.processed, []);
  assert.equal(body.publicationWrites, 0);
});
