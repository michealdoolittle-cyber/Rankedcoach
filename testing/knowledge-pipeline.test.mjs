import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  KNOWLEDGE_STORAGE_KEYS,
  acquireKnowledgeTranscript,
  acquirePublicYouTubeTranscript,
  approveKnowledgeProposal,
  buildKnowledgeConsensus,
  buildKnowledgeReview,
  extractStructuredClaims,
  extractYouTubeCaptionTracks,
  normalizeKnowledgeSource,
  normalizeValorantTranscript,
  parseYouTubeTranscriptPayload,
  registerKnowledgeSources,
  runKnowledgePipeline,
  splitTranscriptIntoSections
} from "../worker/knowledge-pipeline.mjs";
import {
  auditLibraryDrafts,
  renderLibraryAuditMarkdown
} from "../scripts/knowledge-library-audit.mjs";
import { DRAFT_ROOT, ROOT } from "../scripts/library-pipeline-core.mjs";

class MemoryKv {
  constructor() {
    this.values = new Map();
  }

  async get(key, type) {
    if (!this.values.has(key)) return null;
    const value = this.values.get(key);
    return type === "json" ? JSON.parse(value) : value;
  }

  async put(key, value) {
    this.values.set(key, String(value));
  }

  async list({ prefix = "", cursor } = {}) {
    void cursor;
    return {
      keys: [...this.values.keys()]
        .filter(key => key.startsWith(prefix))
        .map(name => ({ name })),
      list_complete: true
    };
  }
}

const captionPayload = {
  events: [
    {
      tStartMs: 1_000,
      dDurationMs: 4_000,
      segs: [{ utf8: "When you take map control, trade with your teammate instead of peeking alone." }]
    },
    {
      tStartMs: 5_000,
      dDurationMs: 4_000,
      segs: [{ utf8: "A 55% win rate in 200 rounds is a statistical sample, not a guarantee." }]
    }
  ]
};

test("embedded source registration distinguishes research from inventory", async () => {
  const educational = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Bind ranked guide",
    channel: "Coach",
    sourceKind: "map-guide"
  }, "2026-07-23T00:00:00.000Z");
  const cosmetic = normalizeKnowledgeSource({
    id: "lmnopqrstuv",
    platform: "youtube",
    title: "Collection showcase",
    channel: "VALORANT",
    sourceKind: "skin-collection-video"
  }, "2026-07-23T00:00:00.000Z");
  const twitch = normalizeKnowledgeSource({
    id: "twitch-123456",
    platform: "twitch",
    title: "Ranked VOD",
    channel: "Player",
    sourceKind: "twitch-archive"
  }, "2026-07-23T00:00:00.000Z");
  assert.equal(educational.transcriptStatus, "pending");
  assert.equal(cosmetic.transcriptStatus, "registered-non-educational");
  assert.equal(twitch.transcriptStatus, "provider-required");

  const kv = new MemoryKv();
  const registered = await registerKnowledgeSources(kv, [educational, cosmetic, twitch]);
  assert.equal(registered.length, 3);
  const registry = await kv.get(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, "json");
  assert.equal(registry.sources.length, 3);
});

test("public YouTube captions become normalized timestamped private claims", async () => {
  const html = `<script>{"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":[{"baseUrl":"https://captions.example.test/api?video=abc\\u0026lang=en","languageCode":"en","name":{"simpleText":"English"}}]}}}</script>`;
  assert.equal(extractYouTubeCaptionTracks(html).length, 1);
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Map control guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const fetchImpl = async input => {
    const url = String(input);
    if (url.startsWith("https://www.youtube.com/watch")) return new Response(html, { status: 200 });
    if (url.startsWith("https://captions.example.test/api")) {
      assert.match(url, /fmt=json3/);
      return new Response(JSON.stringify(captionPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const transcript = await acquirePublicYouTubeTranscript(source, fetchImpl);
  assert.equal(transcript.status, "acquired");
  assert.equal(transcript.cues.length, 2);
  const parsed = parseYouTubeTranscriptPayload(captionPayload);
  const normalized = normalizeValorantTranscript(parsed);
  const sections = splitTranscriptIntoSections(normalized, { maxCharacters: 400 });
  const claims = extractStructuredClaims(source, sections);
  assert.equal(claims.length, 2);
  assert.deepEqual(new Set(claims.map(claim => claim.type)), new Set(["coaching", "statistical"]));
  assert.match(claims[0].evidenceUrl, /t=1s/);
});

test("configured private transcript provider can supply public-video cues without browser exposure", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Map control guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const transcript = await acquireKnowledgeTranscript(source, {
    KNOWLEDGE_TRANSCRIPT_ENDPOINT: "https://private-transcripts.example.test/youtube",
    KNOWLEDGE_TRANSCRIPT_TOKEN: "private-test-token"
  }, async (input, init) => {
    assert.equal(String(input), "https://private-transcripts.example.test/youtube");
    assert.equal(init.headers.Authorization, "Bearer private-test-token");
    assert.deepEqual(JSON.parse(init.body), {
      platform: "youtube",
      videoId: "abcdefghijk",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      language: "en"
    });
    return new Response(JSON.stringify({ language: "en", cues: parseYouTubeTranscriptPayload(captionPayload) }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  });
  assert.equal(transcript.status, "acquired");
  assert.equal(transcript.trackKind, "configured-private-provider");
  assert.equal(transcript.cues.length, 2);
});

test("coaching and statistical consensus stay separate and conflicts are held", () => {
  const sources = [
    normalizeKnowledgeSource({ id: "abcdefghijk", platform: "youtube", channel: "Coach A", sourceKind: "map-guide" }),
    normalizeKnowledgeSource({ id: "lmnopqrstuv", platform: "youtube", channel: "Coach B", sourceKind: "map-guide" }),
    normalizeKnowledgeSource({ id: "12345678901", platform: "youtube", channel: "Coach C", sourceKind: "map-guide" })
  ];
  const section = text => [{ startMs: 0, endMs: 4_000, text, cues: [] }];
  const documents = [
    {
      source: sources[0],
      claims: extractStructuredClaims(sources[0], section("When taking map control, trade with your teammate and avoid peeking the lane alone."))
    },
    {
      source: sources[1],
      claims: extractStructuredClaims(sources[1], section("When taking map control, trade with your teammate and avoid peeking the lane alone."))
    },
    {
      source: sources[2],
      claims: extractStructuredClaims(sources[2], section("When taking map control, trade with your teammate and always peeking the lane alone."))
    },
    {
      source: sources[0],
      claims: extractStructuredClaims(sources[0], section("The agent has a 55% win rate across 200 rounds, so treat it as a measured sample."))
    }
  ];
  const consensus = buildKnowledgeConsensus(documents);
  assert.ok(consensus.coaching.length >= 1);
  assert.ok(consensus.statistical.length >= 1);
  assert.ok(consensus.coaching.some(concept => concept.state === "conflicted"));
  const existingClaim = documents[0].claims[0];
  const review = buildKnowledgeReview(consensus, {
    now: new Date("2026-07-23T00:00:00.000Z"),
    claimDocuments: documents,
    libraryKnowledgeIndex: [{
      ...existingClaim,
      id: "library-map-bind-siteTips-0",
      sourceId: "library-map-bind-siteTips"
    }]
  });
  assert.equal(review.summary.published, 0);
  assert.ok(review.summary.libraryDuplicates + review.summary.libraryConflicts >= 1);
  assert.ok(review.proposals.some(proposal => proposal.libraryComparison.relationship !== "new-opportunity"));
  assert.ok(review.proposals.every(proposal => proposal.approvalStatus === "pending-owner-approval"));
  assert.ok(review.proposals.every(proposal => proposal.rankedCoachWording === null));
});

test("scheduled knowledge run stores research privately and cannot publish", async () => {
  const kv = new MemoryKv();
  const source = {
    id: "abcdefghijk",
    platform: "youtube",
    title: "Map control guide",
    channel: "Coach A",
    sourceKind: "map-guide"
  };
  const html = `<script>{"captionTracks":[{"baseUrl":"https://captions.example.test/api?video=abc","languageCode":"en","name":{"simpleText":"English"}}]}</script>`;
  const fetchImpl = async input => {
    const url = String(input);
    if (url.startsWith("https://www.youtube.com/watch")) return new Response(html, { status: 200 });
    if (url.startsWith("https://captions.example.test/api")) {
      return new Response(JSON.stringify(captionPayload), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const result = await runKnowledgePipeline({
    CONTENT_AUTOMATION: kv
  }, {
    sources: [source],
    batchSize: 1,
    fetchImpl,
    notify: false,
    now: new Date("2026-07-23T00:00:00.000Z")
  });
  assert.equal(result.publicationWrites, 0);
  assert.equal(result.processed[0].status, "acquired-private");
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateTranscriptPrefix}youtube-abcdefghijk`));
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateClaimsPrefix}youtube-abcdefghijk`));
  const report = await kv.get(KNOWLEDGE_STORAGE_KEYS.latestReview, "json");
  assert.equal(report.publicationRule.includes("not published automatically"), true);
  assert.doesNotMatch(JSON.stringify(report), /trade with your teammate instead of peeking alone/i);
  assert.equal([...kv.values.keys()].some(key => key.startsWith("library:draft:")), false);

  const proposal = report.proposals[0];
  const approval = await approveKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Trade the first lane contact so your team keeps map control after the opening duel.",
    confirmOriginalWording: true
  }, new Date("2026-07-23T00:05:00.000Z"));
  assert.equal(approval.status, "approved-for-manual-library-promotion");
  assert.equal([...kv.values.keys()].some(key => key.startsWith("library:draft:")), false);
});

test("complete Library audit covers every governed draft without publishing", async () => {
  const audit = await auditLibraryDrafts(DRAFT_ROOT, { currentPatch: "13.01" });
  assert.deepEqual(audit.scope, {
    drafts: 61,
    agents: 29,
    maps: 13,
    weapons: 19,
    governedFields: 1078
  });
  assert.equal(audit.status, "review-complete-no-publication");
  assert.equal(audit.sourceCoverage.sourcedFields + audit.sourceCoverage.unsourcedFields, 1078);
  assert.ok(audit.missingOpportunities.length > 0);
  assert.ok(audit.duplicateConcepts.length > 0);
  assert.ok(audit.knowledgeIndex.length > 0);
  const report = renderLibraryAuditMarkdown(audit);
  assert.match(report, /no publication performed/i);
  assert.match(report, /statistical consensus separate from coaching consensus/i);
  assert.match(report, /intentionally omits source weights/i);
});

test("daily worker schedule includes the private knowledge run", async () => {
  const worker = await readFile(path.join(ROOT, "worker", "index.js"), "utf8");
  const registry = await readFile(path.join(ROOT, "worker", "embedded-knowledge-sources.mjs"), "utf8");
  const libraryBaseline = await readFile(path.join(ROOT, "worker", "knowledge-library-audit-baseline.mjs"), "utf8");
  assert.match(worker, /if \(isDailyResearch\)[\s\S]*runKnowledgePipeline/);
  assert.match(worker, /batchSize:\s*4/);
  assert.equal((registry.match(/"platform": "youtube"/g) || []).length, 46);
  assert.match(libraryBaseline, /LIBRARY_KNOWLEDGE_INDEX/);
});
