import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  KNOWLEDGE_STORAGE_KEYS,
  acquireGeminiYouTubeInsights,
  acquireKnowledgeTranscript,
  acquirePublicYouTubeTranscript,
  acquireYouTubeAndroidTranscript,
  analyzeKnowledgeTranscript,
  approveKnowledgeProposal,
  buildKnowledgeConsensus,
  buildKnowledgeReview,
  extractStructuredClaims,
  extractYouTubeCaptionTracks,
  getKnowledgeOwnerDashboard,
  getPublishedKnowledge,
  ingestTimestampedKnowledgeTranscript,
  normalizeKnowledgeSource,
  normalizeValorantTranscript,
  parseYouTubeTranscriptPayload,
  parseTimestampedTranscript,
  publishApprovedKnowledge,
  queueKnowledgeSourceRetry,
  rejectKnowledgeProposal,
  registerKnowledgeSources,
  runKnowledgePipeline,
  saveKnowledgeProposalDraft,
  splitTranscriptIntoSections
} from "../worker/knowledge-pipeline.mjs";
import { buildFeaturedPlaylist } from "../worker/content-automation.mjs";
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

  async delete(key) {
    this.values.delete(key);
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

function youtubeCaptionFetch({ delayMs = 0, onPlayerRequest = () => {} } = {}) {
  return async (input, init = {}) => {
    const url = String(input);
    if (url.startsWith("https://www.youtube.com/youtubei/v1/player")) {
      onPlayerRequest(JSON.parse(init.body || "{}").videoId);
      if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
      return Response.json({
        playabilityStatus: { status: "OK" },
        captions: {
          playerCaptionsTracklistRenderer: {
            captionTracks: [{
              baseUrl: "https://captions.example.test/pipeline",
              languageCode: "en",
              kind: "asr"
            }]
          }
        }
      });
    }
    if (url.startsWith("https://captions.example.test/pipeline")) return Response.json(captionPayload);
    throw new Error(`Unexpected URL: ${url}`);
  };
}

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
  assert.equal(normalizeKnowledgeSource({
    id: "zzzzzzzzzzz",
    platform: "youtube",
    title: "Weapon bundle showcase",
    channel: "VALORANT",
    channelKind: "riot",
    sourceType: "bundle-showcase"
  }).transcriptStatus, "registered-non-educational");
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

test("Android player fallback consumes a signed caption track immediately", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Map control guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const fetchImpl = async input => {
    const url = String(input);
    if (url.startsWith("https://www.youtube.com/youtubei/v1/player")) {
      return Response.json({
        playabilityStatus: { status: "OK" },
        captions: {
          playerCaptionsTracklistRenderer: {
            captionTracks: [{
              baseUrl: "https://captions.example.test/signed?expire=999",
              languageCode: "en",
              kind: "asr",
              name: { simpleText: "English (auto-generated)" }
            }]
          }
        }
      });
    }
    if (url.startsWith("https://captions.example.test/signed")) {
      assert.match(url, /fmt=json3/);
      return Response.json(captionPayload);
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const transcript = await acquireYouTubeAndroidTranscript(source, { fetchImpl });
  assert.equal(transcript.status, "acquired");
  assert.equal(transcript.trackKind, "youtube-auto-caption");
  assert.equal(transcript.cues[0].startMs, 1_000);
});

test("official Gemini YouTube analysis returns structured timestamped review insights", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Bind control guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const result = await acquireGeminiYouTubeInsights(source, {
    GEMINI_API_KEY: "test-key",
    KNOWLEDGE_VIDEO_MODEL: "gemini-test"
  }, async (_input, init) => {
    assert.equal(init.headers["x-goog-api-key"], "test-key");
    const body = JSON.parse(init.body);
    assert.equal(body.store, false);
    assert.equal(body.input[0].uri, source.url);
    assert.equal(body.response_format.mime_type, "application/json");
    return Response.json({
      status: "completed",
      steps: [{
        type: "model_output",
        content: [{
          type: "text",
          text: JSON.stringify({
            insights: [{
              startSeconds: 42,
              endSeconds: 51,
              contextExcerpt: "Hold the trade spacing before the team crosses the first Bind choke.",
              suggestedWording: "Keep a teammate in trade range before committing through Bind's first choke.",
              whyItMatters: "The spacing preserves the follow-up after first contact.",
              type: "coaching",
              topic: "teamplay",
              entities: ["Bind"],
              confidence: "high"
            }]
          })
        }]
      }]
    });
  });
  assert.equal(result.status, "acquired");
  assert.equal(result.insights.length, 1);
  assert.equal(result.cues[0].startMs, 42_000);
});

test("configured private transcript analyzer converts captions into semantic review notes", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Bind guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const analysis = await analyzeKnowledgeTranscript(source, [{
    startMs: 12_000,
    durationMs: 4_000,
    text: "Hold trade spacing before crossing into Bind A."
  }], {
    KNOWLEDGE_PIPELINE_TOKEN: "shared-test-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, async (input, init) => {
    assert.equal(String(input), "https://analysis.example.test");
    assert.equal(init.headers["x-rankedcoach-pipeline-token"], "shared-test-token");
    assert.equal(JSON.parse(init.body).cues[0].startMs, 12_000);
    return Response.json({
      model: "gpt-test",
      insights: [{
        startSeconds: 12,
        endSeconds: 16,
        contextExcerpt: "Hold trade spacing before crossing into Bind A.",
        suggestedWording: "Keep a teammate in trade range before committing through Bind A.",
        whyItMatters: "The follow-up protects the site entry after first contact.",
        type: "coaching",
        topic: "teamplay",
        entities: ["Bind"],
        confidence: "high"
      }]
    });
  });
  assert.equal(analysis.status, "analyzed");
  assert.equal(analysis.model, "gpt-test");
  assert.equal(analysis.insights[0].startSeconds, 12);
});

test("lowercase unpunctuated captions create cue-anchored notes", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Split guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const cues = [
    { startMs: 12_000, durationMs: 3_000, text: "when you take mid control make sure your teammate can trade" },
    { startMs: 15_000, durationMs: 3_000, text: "hold the first angle and avoid swinging into the site alone" },
    { startMs: 18_000, durationMs: 3_000, text: "use utility before the team rotates through the next lane" }
  ];
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.ok(claims.length >= 1);
  assert.equal(claims[0].startSeconds, 12);
  assert.match(claims[0].evidenceUrl, /t=12s/);
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

test("optional transcript and analysis failures retain public captions and deterministic notes", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Map control guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const fetchImpl = async input => {
    const url = String(input);
    if (url === "https://private-transcripts.example.test/youtube") throw new TypeError("provider offline");
    if (url.startsWith("https://www.youtube.com/youtubei/v1/player")) {
      return Response.json({
        playabilityStatus: { status: "OK" },
        captions: {
          playerCaptionsTracklistRenderer: {
            captionTracks: [{
              baseUrl: "https://captions.example.test/signed",
              languageCode: "en",
              kind: "asr"
            }]
          }
        }
      });
    }
    if (url.startsWith("https://captions.example.test/signed")) return Response.json(captionPayload);
    if (url === "https://analysis.example.test") throw new DOMException("timed out", "TimeoutError");
    throw new Error(`Unexpected URL: ${url}`);
  };
  const transcript = await acquireKnowledgeTranscript(source, {
    KNOWLEDGE_TRANSCRIPT_ENDPOINT: "https://private-transcripts.example.test/youtube"
  }, fetchImpl);
  assert.equal(transcript.status, "acquired");
  assert.equal(transcript.cues.length, 2);

  const kv = new MemoryKv();
  const result = await runKnowledgePipeline({
    CONTENT_AUTOMATION: kv,
    KNOWLEDGE_PIPELINE_TOKEN: "pipeline-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, {
    sources: [source],
    batchSize: 1,
    fetchImpl,
    notify: false,
    now: new Date("2026-07-24T03:00:00.000Z")
  });
  assert.equal(result.processed[0].status, "analysis-degraded");
  assert.ok(result.processed[0].claims >= 1);
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateTranscriptPrefix}${source.id}`));
});

test("semantic transcript notes discard fabricated excerpts and timestamps", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Bind guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const analysis = await analyzeKnowledgeTranscript(source, [{
    startMs: 12_000,
    durationMs: 4_000,
    text: "Hold trade spacing before crossing into Bind A."
  }], {
    KNOWLEDGE_PIPELINE_TOKEN: "shared-test-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, async () => Response.json({
    model: "gpt-test",
    insights: [{
      startSeconds: 900,
      endSeconds: 910,
      contextExcerpt: "Invented Operator economy advice that never appeared in the supplied transcript.",
      suggestedWording: "Save the Operator for a fabricated future round that was never discussed.",
      whyItMatters: "This should not survive grounding.",
      type: "coaching",
      topic: "economy",
      entities: ["Operator"],
      confidence: "high"
    }]
  }));
  assert.equal(analysis.status, "analysis-ungrounded");
  assert.equal(analysis.insights.length, 0);
});

test("semantic grounding keeps the closest ordered words from the real cue span", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Trade timing guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const cues = [
    { startMs: 10_000, durationMs: 3_000, text: "At the start keep your teammate close enough" },
    { startMs: 13_000, durationMs: 3_000, text: "to trade the first lane before anyone swings alone" }
  ];
  const analysis = await analyzeKnowledgeTranscript(source, cues, {
    KNOWLEDGE_PIPELINE_TOKEN: "shared-test-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, async () => Response.json({
    model: "gpt-test",
    insights: [{
      startSeconds: 10,
      endSeconds: 16,
      contextExcerpt: "keep your teammate close enough to trade first lane before anyone swings alone",
      suggestedWording: "Keep a teammate close enough to trade before the opening lane swing.",
      whyItMatters: "Ordered evidence should stay attached to the real cue.",
      type: "coaching",
      topic: "teamplay",
      entities: [],
      confidence: "high"
    }]
  }));
  assert.equal(analysis.status, "analyzed");
  assert.equal(analysis.insights.length, 1);
  assert.equal(analysis.insights[0].startSeconds, 10);
  assert.equal(analysis.insights[0].endSeconds, 16);
  assert.match(
    analysis.insights[0].contextExcerpt,
    /keep your teammate close enough to trade the first lane before anyone swings alone/i
  );
});

test("semantic grounding rejects the same transcript words in a fabricated order", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Trade timing guide",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const cues = [{
    startMs: 10_000,
    durationMs: 6_000,
    text: "Keep your teammate close enough to trade the first lane before anyone swings alone."
  }];
  const analysis = await analyzeKnowledgeTranscript(source, cues, {
    KNOWLEDGE_PIPELINE_TOKEN: "shared-test-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, async () => Response.json({
    model: "gpt-test",
    insights: [{
      startSeconds: 10,
      endSeconds: 16,
      contextExcerpt: "alone swings anyone before lane first the trade to enough close teammate your keep",
      suggestedWording: "This deliberately reverses the supplied transcript.",
      whyItMatters: "A bag-of-words match must not pass.",
      type: "coaching",
      topic: "teamplay",
      entities: [],
      confidence: "high"
    }]
  }));
  assert.equal(analysis.status, "analysis-ungrounded");
  assert.equal(analysis.insights.length, 0);
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
    if (url === "https://analysis.example.test") {
      return Response.json({
        model: "test-semantic-model",
        insights: [{
          startSeconds: 1,
          endSeconds: 5,
          contextExcerpt: "When you take map control, trade with your teammate instead of peeking alone.",
          suggestedWording: "Take map control with a teammate close enough to convert the opening contact.",
          whyItMatters: "Connected spacing turns first contact into retained team space.",
          type: "coaching",
          topic: "map-control",
          entities: [],
          confidence: "high"
        }]
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
  assert.equal(result.processed[0].status, "analysis-degraded");
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateTranscriptPrefix}youtube-abcdefghijk`));
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateClaimsPrefix}youtube-abcdefghijk`));
  const upgraded = await runKnowledgePipeline({
    CONTENT_AUTOMATION: kv,
    KNOWLEDGE_PIPELINE_TOKEN: "pipeline-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, {
    sources: [source],
    batchSize: 1,
    fetchImpl,
    notify: false,
    now: new Date("2026-07-23T02:00:00.000Z")
  });
  assert.equal(upgraded.processed[0].status, "acquired-private");
  const upgradedDashboard = await getKnowledgeOwnerDashboard(kv);
  assert.equal(upgradedDashboard.sources[0].analysisStatus, "analyzed");
  const report = await kv.get(KNOWLEDGE_STORAGE_KEYS.latestReview, "json");
  assert.equal(report.publicationRule.includes("not published automatically"), true);
  assert.doesNotMatch(JSON.stringify(report), /trade with your teammate instead of peeking alone/i);
  assert.equal([...kv.values.keys()].some(key => key.startsWith("library:draft:")), false);

  const proposal = (await getKnowledgeOwnerDashboard(kv)).review.proposals[0];
  const approval = await approveKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Trade the first lane contact so your team keeps map control after the opening duel.",
    confirmOriginalWording: true
  }, new Date("2026-07-23T00:05:00.000Z"));
  assert.equal(approval.status, "approved-for-manual-library-promotion");
  assert.equal([...kv.values.keys()].some(key => key.startsWith("library:draft:")), false);
});

test("owner-imported timestamped transcripts create reviewable claims and only approved wording can publish", async () => {
  const kv = new MemoryKv();
  const cues = parseTimestampedTranscript(`
00:01 Pair your first utility with a teammate so the team can trade the opening lane safely.
00:08 When you take Bind A control, hold the trade spacing before crossing into the site.
00:15 A 54% win rate over 200 rounds is a sample to review, not a guaranteed result.
  `);
  assert.equal(cues.length, 3);
  const ingestion = await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      title: "Bind teamplay guide",
      publisher: "Coach A",
      entities: ["Bind"]
    },
    cues
  }, {
    now: new Date("2026-07-24T00:00:00.000Z"),
    libraryKnowledgeIndex: []
  });
  assert.equal(ingestion.publicationWrites, 0);
  assert.equal(ingestion.cueCount, 3);
  assert.ok(ingestion.claimCount >= 2);

  const ownerDashboard = await getKnowledgeOwnerDashboard(kv);
  assert.equal(ownerDashboard.sources[0].transcriptStatus, "acquired-private");
  assert.ok(ownerDashboard.review.proposals.length >= 2);
  assert.match(JSON.stringify(ownerDashboard), /hold the trade spacing before crossing/i);
  assert.ok(ownerDashboard.review.proposals.every(item => item.contextNotes.length >= 1));
  const proposal = ownerDashboard.review.proposals.find(item => item.type === "coaching");
  await assert.rejects(
    publishApprovedKnowledge(kv, { proposalId: proposal.id, owner: "Michael", category: "map", entity: "Bind" }),
    /owner-approved/
  );
  await approveKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Keep one teammate close enough to trade before the team commits through Bind’s first choke.",
    confirmOriginalWording: true
  }, new Date("2026-07-24T00:02:00.000Z"));
  const approvedDashboard = await getKnowledgeOwnerDashboard(kv);
  assert.equal(approvedDashboard.review.proposals.find(item => item.id === proposal.id).approvalStatus, "approved");
  const published = await publishApprovedKnowledge(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    category: "map",
    entity: "Bind"
  }, new Date("2026-07-24T00:03:00.000Z"));
  assert.equal(published.status, "published");
  assert.equal(published.entity, "Bind");
  const publishedDashboard = await getKnowledgeOwnerDashboard(kv);
  assert.equal(publishedDashboard.review.proposals.find(item => item.id === proposal.id).approvalStatus, "published");
  const publicIndex = await getPublishedKnowledge(kv);
  assert.equal(publicIndex.items.length, 1);
  assert.match(publicIndex.items[0].wording, /Keep one teammate/);
  assert.doesNotMatch(JSON.stringify(publicIndex), /hold the trade spacing before crossing/i);
});

test("draft and reject decisions persist without publishing", async () => {
  const kv = new MemoryKv();
  await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      title: "Trade spacing guide",
      publisher: "Coach A"
    },
    transcript: "00:12 Keep trade spacing with your teammate before you swing the opening lane."
  }, { now: new Date("2026-07-24T01:00:00.000Z") });
  const dashboard = await getKnowledgeOwnerDashboard(kv);
  const proposal = dashboard.review.proposals[0];
  await saveKnowledgeProposalDraft(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Keep one teammate close enough to trade the opening lane before committing."
  });
  assert.equal((await getKnowledgeOwnerDashboard(kv)).review.proposals[0].approvalStatus, "draft");
  await rejectKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    reason: "Too broad for the current Library."
  });
  const rejected = (await getKnowledgeOwnerDashboard(kv)).review.proposals[0];
  assert.equal(rejected.approvalStatus, "rejected");
  assert.equal((await getPublishedKnowledge(kv)).items.length, 0);
});

test("new videos and owner-requested retries are not starved by older failures", async () => {
  const kv = new MemoryKv();
  const failedSources = Array.from({ length: 24 }, (_value, index) => ({
    id: String(index).padStart(11, "a"),
    platform: "youtube",
    title: `Unavailable guide ${index}`,
    channel: "Coach",
    sourceKind: "map-guide"
  }));
  await registerKnowledgeSources(kv, failedSources, new Date("2026-07-20T00:00:00.000Z"));
  const registry = await kv.get(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, "json");
  registry.sources = registry.sources.map(source => ({
    ...source,
    transcriptStatus: "no-public-transcript",
    lastTranscriptAttemptAt: "2026-07-20T00:00:00.000Z",
    nextRetryAt: "2026-07-20T01:00:00.000Z",
    attemptCount: 1
  }));
  await kv.put(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, JSON.stringify(registry));
  const newSource = {
    id: "newsource01",
    platform: "youtube",
    title: "New trade guide",
    channel: "New Coach",
    sourceKind: "map-guide"
  };
  const requestedIds = [];
  const fetchImpl = async (input, init = {}) => {
    const url = String(input);
    if (url.startsWith("https://www.youtube.com/youtubei/v1/player")) {
      requestedIds.push(JSON.parse(init.body).videoId);
      return Response.json({
        playabilityStatus: { status: "OK" },
        captions: {
          playerCaptionsTracklistRenderer: {
            captionTracks: [{ baseUrl: "https://captions.example.test/fair", languageCode: "en", kind: "asr" }]
          }
        }
      });
    }
    if (url.startsWith("https://captions.example.test/fair")) return Response.json(captionPayload);
    throw new Error(`Unexpected URL: ${url}`);
  };
  const result = await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    sources: [newSource],
    batchSize: 1,
    fetchImpl,
    notify: false,
    now: new Date("2026-07-24T04:00:00.000Z")
  });
  assert.equal(result.processed[0].sourceId, "youtube-newsource01");
  assert.equal(requestedIds[0], "newsource01");

  const retryTarget = registry.sources[12].id;
  await queueKnowledgeSourceRetry(kv, { sourceId: retryTarget }, new Date("2026-07-24T04:05:00.000Z"));
  requestedIds.length = 0;
  const retried = await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    batchSize: 1,
    fetchImpl,
    notify: false,
    now: new Date("2026-07-24T04:06:00.000Z")
  });
  assert.equal(retried.processed[0].sourceId, retryTarget);
  assert.equal(requestedIds[0], retryTarget.replace(/^youtube-/, ""));
});

test("new corroboration refreshes analytics while preserving the owner draft", async () => {
  const kv = new MemoryKv();
  const transcript = "00:12 Keep trade spacing with your teammate before you swing the opening lane.";
  await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      title: "Trade spacing guide one",
      publisher: "Coach A"
    },
    transcript
  }, { now: new Date("2026-07-24T05:00:00.000Z") });
  const first = (await getKnowledgeOwnerDashboard(kv)).review.proposals[0];
  const wording = "Keep one teammate close enough to trade before swinging the opening lane.";
  await saveKnowledgeProposalDraft(kv, {
    proposalId: first.id,
    owner: "Michael",
    rankedCoachWording: wording
  });
  await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=lmnopqrstuv",
      title: "Trade spacing guide two",
      publisher: "Coach B"
    },
    transcript
  }, { now: new Date("2026-07-24T05:10:00.000Z") });
  const refreshed = (await getKnowledgeOwnerDashboard(kv)).review.proposals.find(item => item.id === first.id);
  assert.equal(refreshed.approvalStatus, "draft");
  assert.equal(refreshed.rankedCoachWording, wording);
  assert.equal(refreshed.state, "corroborated");
  assert.equal(refreshed.evidence.length, 2);
});

test("research eligibility transitions reset acquisition state in both directions", async () => {
  const kv = new MemoryKv();
  const id = "abcdefghijk";
  await registerKnowledgeSources(kv, [{
    id,
    platform: "youtube",
    title: "Bind guide",
    channel: "Coach",
    sourceKind: "map-guide"
  }], new Date("2026-07-24T06:00:00.000Z"));
  const seeded = await kv.get(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, "json");
  seeded.sources[0] = {
    ...seeded.sources[0],
    transcriptStatus: "acquired-private",
    cueCount: 40,
    claimCount: 8,
    attemptCount: 3,
    nextRetryAt: "2026-07-25T06:00:00.000Z"
  };
  await kv.put(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, JSON.stringify(seeded));

  const [disabled] = await registerKnowledgeSources(kv, [{
    id,
    platform: "youtube",
    title: "Weapon skin showcase",
    channel: "Coach",
    sourceKind: "skin-showcase"
  }], new Date("2026-07-24T06:05:00.000Z"));
  assert.equal(disabled.researchEligible, false);
  assert.equal(disabled.transcriptStatus, "registered-non-educational");
  assert.equal(disabled.cueCount, 0);
  assert.equal(disabled.claimCount, 0);
  assert.equal(disabled.attemptCount, 0);
  assert.equal(disabled.nextRetryAt, null);

  const [enabled] = await registerKnowledgeSources(kv, [{
    id,
    platform: "youtube",
    title: "Bind guide",
    channel: "Coach",
    sourceKind: "map-guide"
  }], new Date("2026-07-24T06:10:00.000Z"));
  assert.equal(enabled.researchEligible, true);
  assert.equal(enabled.transcriptStatus, "pending");
  assert.equal(enabled.cueCount, 0);
  assert.equal(enabled.claimCount, 0);
});

test("ineligible sources are removed from consensus even when private claims remain stored", async () => {
  const kv = new MemoryKv();
  await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      title: "Trade spacing guide",
      publisher: "Coach A"
    },
    transcript: "00:12 Keep trade spacing with your teammate before you swing the opening lane."
  }, { now: new Date("2026-07-24T06:20:00.000Z") });
  assert.ok((await getKnowledgeOwnerDashboard(kv)).review.proposals.length > 0);
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateClaimsPrefix}youtube-abcdefghijk`, "json"));

  await registerKnowledgeSources(kv, [{
    id: "abcdefghijk",
    platform: "youtube",
    title: "Cosmetic showcase",
    channel: "Coach A",
    sourceKind: "skin-showcase"
  }], new Date("2026-07-24T06:24:00.000Z"));
  await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    notify: false,
    now: new Date("2026-07-24T06:25:00.000Z")
  });
  const dashboard = await getKnowledgeOwnerDashboard(kv);
  assert.equal(dashboard.sources[0].transcriptStatus, "registered-non-educational");
  assert.equal(dashboard.review.proposals.length, 0);
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateClaimsPrefix}youtube-abcdefghijk`, "json"));
});

test("dirty review recovery directly reads new claims when KV listing still lags", async () => {
  class LaggingFailOnceKv extends MemoryKv {
    constructor() {
      super();
      this.failLatestOnce = true;
    }

    async put(key, value) {
      if (key === KNOWLEDGE_STORAGE_KEYS.latestReview && this.failLatestOnce) {
        this.failLatestOnce = false;
        throw new Error("simulated latest-review write failure");
      }
      return super.put(key, value);
    }

    async list(options = {}) {
      const page = await super.list(options);
      if (options.prefix === KNOWLEDGE_STORAGE_KEYS.privateClaimsPrefix) {
        return { ...page, keys: [] };
      }
      return page;
    }
  }

  const kv = new LaggingFailOnceKv();
  await assert.rejects(
    ingestTimestampedKnowledgeTranscript(kv, {
      source: {
        platform: "youtube",
        url: "https://www.youtube.com/watch?v=abcdefghijk",
        title: "Trade spacing guide",
        publisher: "Coach A"
      },
      transcript: "00:12 Keep trade spacing with your teammate before you swing the opening lane."
    }, { now: new Date("2026-07-24T06:30:00.000Z") }),
    /latest-review write failure/
  );
  const dirty = await kv.get(KNOWLEDGE_STORAGE_KEYS.reviewDirty, "json");
  assert.equal(dirty.status, "pending");
  assert.deepEqual(dirty.plannedSourceIds, ["youtube-abcdefghijk"]);

  const registry = await kv.get(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, "json");
  registry.sources[0] = {
    ...registry.sources[0],
    transcriptStatus: "acquired-private",
    cueCount: 1,
    claimCount: 1
  };
  await kv.put(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, JSON.stringify(registry));
  const recovered = await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    notify: false,
    now: new Date("2026-07-24T06:35:00.000Z")
  });
  assert.ok(recovered.summary.pendingApproval > 0);
  assert.equal(await kv.get(KNOWLEDGE_STORAGE_KEYS.reviewDirty, "json"), null);
  assert.ok((await getKnowledgeOwnerDashboard(kv)).review.proposals.length > 0);
});

test("proposal IDs migrate from legacy 32-bit records without losing approval", async () => {
  const kv = new MemoryKv();
  const input = {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
      title: "Trade spacing guide",
      publisher: "Coach A"
    },
    transcript: "00:12 Keep trade spacing with your teammate before you swing the opening lane."
  };
  await ingestTimestampedKnowledgeTranscript(kv, input, {
    now: new Date("2026-07-24T06:40:00.000Z")
  });
  const proposal = (await getKnowledgeOwnerDashboard(kv)).review.proposals[0];
  assert.match(proposal.id, /^proposal-concept-[0-9a-f]{32}$/);
  const legacyId = proposal.legacyProposalIds.find(id => /^proposal-concept-[0-9a-f]{8}$/.test(id));
  assert.ok(legacyId);
  const wording = "Stay close enough to answer first contact before committing through the opening lane.";
  const legacyProposal = {
    ...proposal,
    id: legacyId,
    conceptId: legacyId.replace(/^proposal-/, ""),
    approvalStatus: "approved",
    rankedCoachWording: wording,
    approvedAt: "2026-07-24T06:41:00.000Z",
    approvedBy: "Michael"
  };
  await kv.put(`${KNOWLEDGE_STORAGE_KEYS.proposalPrefix}${legacyId}`, JSON.stringify(legacyProposal));
  await kv.put(`${KNOWLEDGE_STORAGE_KEYS.approvalPrefix}${legacyId}`, JSON.stringify({
    proposalId: legacyId,
    conceptId: legacyProposal.conceptId,
    owner: "Michael",
    rankedCoachWording: wording,
    approvedAt: legacyProposal.approvedAt,
    status: "approved-for-manual-library-promotion",
    evidence: legacyProposal.evidence
  }));
  await kv.delete(`${KNOWLEDGE_STORAGE_KEYS.proposalPrefix}${proposal.id}`);
  const latest = await kv.get(KNOWLEDGE_STORAGE_KEYS.latestReview, "json");
  latest.proposalIndex = latest.proposalIndex.map(item => (
    item.id === proposal.id
      ? { id: legacyId, approvalStatus: "approved" }
      : item
  ));
  await kv.put(KNOWLEDGE_STORAGE_KEYS.latestReview, JSON.stringify(latest));

  await ingestTimestampedKnowledgeTranscript(kv, input, {
    now: new Date("2026-07-24T06:45:00.000Z")
  });
  const migrated = await kv.get(`${KNOWLEDGE_STORAGE_KEYS.proposalPrefix}${proposal.id}`, "json");
  const migratedApproval = await kv.get(`${KNOWLEDGE_STORAGE_KEYS.approvalPrefix}${proposal.id}`, "json");
  assert.equal(migrated.approvalStatus, "approved");
  assert.equal(migrated.rankedCoachWording, wording);
  assert.equal(migratedApproval.proposalId, proposal.id);
  assert.equal(migratedApproval.migratedFromProposalId, legacyId);
});

test("removed evidence updates proposals and invalid publications return to owner review", async () => {
  const kv = new MemoryKv();
  for (const [id, publisher, minute, transcript] of [
    ["abcdefghijk", "Coach A", 50, "00:12 A 55% win rate in 200 rounds is a statistical sample, not a guarantee."],
    ["lmnopqrstuv", "Coach B", 55, "00:12 A 55% win rate across 200 rounds is a statistical sample, not a guarantee."]
  ]) {
    await ingestTimestampedKnowledgeTranscript(kv, {
      source: {
        platform: "youtube",
        url: `https://www.youtube.com/watch?v=${id}`,
        title: "Sample size guide",
        publisher
      },
      transcript
    }, { now: new Date(`2026-07-24T06:${minute}:00.000Z`) });
  }
  const proposal = (await getKnowledgeOwnerDashboard(kv)).review.proposals
    .find(item => item.type === "statistical");
  assert.equal(proposal.state, "corroborated");
  assert.equal(proposal.evidence.length, 2);
  await approveKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Treat a large round sample as context rather than certainty when judging the percentage.",
    confirmOriginalWording: true
  }, new Date("2026-07-24T07:00:00.000Z"));
  await publishApprovedKnowledge(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    category: "general"
  }, new Date("2026-07-24T07:01:00.000Z"));
  assert.equal((await getPublishedKnowledge(kv)).items.length, 1);

  await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    sources: [{
      id: "abcdefghijk",
      platform: "youtube",
      title: "Cosmetic showcase",
      channel: "Coach A",
      sourceKind: "skin-showcase"
    }],
    notify: false,
    now: new Date("2026-07-24T07:05:00.000Z")
  });
  const held = (await getKnowledgeOwnerDashboard(kv)).review.proposals
    .find(item => item.type === "statistical");
  assert.equal(held.evidence.length, 1);
  assert.equal(held.state, "single-source");
  assert.equal(held.publicationNeedsReview, true);
  assert.equal(held.publicationHoldReason, "statistical-corroboration-lost");
  assert.equal((await getPublishedKnowledge(kv)).items.length, 0);

  await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    sources: [{
      id: "lmnopqrstuv",
      platform: "youtube",
      title: "Cosmetic showcase",
      channel: "Coach B",
      sourceKind: "skin-showcase"
    }],
    notify: false,
    now: new Date("2026-07-24T07:10:00.000Z")
  });
  const orphan = (await getKnowledgeOwnerDashboard(kv)).review.proposals
    .find(item => item.type === "statistical");
  assert.equal(orphan.orphanedPublication, true);
  assert.equal(orphan.state, "evidence-removed");
  assert.equal(orphan.publicationNeedsReview, true);
  assert.equal((await getPublishedKnowledge(kv)).items.length, 0);
});

test("run lease, maximum batch, and deadline bound overlapping research work", async () => {
  const now = new Date("2026-07-24T07:20:00.000Z");
  const leaseKv = new MemoryKv();
  await leaseKv.put(KNOWLEDGE_STORAGE_KEYS.runLease, JSON.stringify({
    token: "another-run",
    acquiredAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 60_000).toISOString()
  }));
  let fetchCount = 0;
  const skipped = await runKnowledgePipeline({ CONTENT_AUTOMATION: leaseKv }, {
    sources: [{
      id: "abcdefghijk",
      platform: "youtube",
      title: "Guide",
      channel: "Coach",
      sourceKind: "map-guide"
    }],
    fetchImpl: youtubeCaptionFetch({ onPlayerRequest: () => { fetchCount += 1; } }),
    notify: false,
    now
  });
  assert.equal(skipped.skipped, "run-in-progress");
  assert.equal(fetchCount, 0);

  const batchKv = new MemoryKv();
  const batchSources = Array.from({ length: 15 }, (_value, index) => ({
    id: String(index).padStart(11, "x"),
    platform: "youtube",
    title: `Guide ${index}`,
    channel: "Coach",
    sourceKind: "map-guide"
  }));
  const bounded = await runKnowledgePipeline({ CONTENT_AUTOMATION: batchKv }, {
    sources: batchSources,
    batchSize: 24,
    fetchImpl: youtubeCaptionFetch(),
    notify: false,
    now: new Date("2026-07-24T07:25:00.000Z")
  });
  assert.equal(bounded.processed.length, 12);
  assert.equal(bounded.deferred, 3);

  const deadlineKv = new MemoryKv();
  const deadlineSources = batchSources.slice(0, 6);
  const deadlineBound = await runKnowledgePipeline({ CONTENT_AUTOMATION: deadlineKv }, {
    sources: deadlineSources,
    batchSize: 6,
    deadlineMs: 50,
    fetchImpl: youtubeCaptionFetch({ delayMs: 80 }),
    notify: false,
    now: new Date("2026-07-24T07:30:00.000Z")
  });
  assert.ok(deadlineBound.processed.length > 0);
  assert.ok(deadlineBound.processed.length <= 3);
  assert.ok(deadlineBound.deferred >= 3);
});

test("conflicted coaching cannot be published even after wording approval", async () => {
  const kv = new MemoryKv();
  const proposalId = "proposal-conflicted";
  await kv.put(`${KNOWLEDGE_STORAGE_KEYS.proposalPrefix}${proposalId}`, JSON.stringify({
    id: proposalId,
    type: "coaching",
    topic: "teamplay",
    state: "conflicted",
    approvalStatus: "approved",
    libraryComparison: { relationship: "new-opportunity" },
    evidence: []
  }));
  await kv.put(`${KNOWLEDGE_STORAGE_KEYS.approvalPrefix}${proposalId}`, JSON.stringify({
    proposalId,
    owner: "Michael",
    rankedCoachWording: "Hold this coaching item until its conflicting evidence has been resolved."
  }));
  await assert.rejects(
    publishApprovedKnowledge(kv, {
      proposalId,
      owner: "Michael",
      category: "general"
    }),
    /conflict before publication/
  );
});

test("historical Playlist research can retain more than the 120-card public view", () => {
  const videos = Array.from({ length: 250 }, (_value, index) => ({
    id: `video-${String(index).padStart(4, "0")}`,
    platform: "youtube",
    channel: "Coach",
    channelKind: "creator",
    title: `Valorant guide ${index}`,
    publishedAt: new Date(2026, 0, 1, 0, index).toISOString(),
    isLive: false,
    wasLive: false,
    isVod: false,
    isShort: false,
    isValorant: true
  }));
  assert.equal(buildFeaturedPlaylist(videos).items.length, 120);
  assert.equal(buildFeaturedPlaylist(videos, "", new Set(), Date.now(), { maxItems: 2_000 }).items.length, 250);
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

test("both worker schedules refresh the Playlist before private knowledge processing", async () => {
  const worker = await readFile(path.join(ROOT, "worker", "index.js"), "utf8");
  const registry = await readFile(path.join(ROOT, "worker", "embedded-knowledge-sources.mjs"), "utf8");
  const libraryBaseline = await readFile(path.join(ROOT, "worker", "knowledge-library-audit-baseline.mjs"), "utf8");
  assert.match(worker, /await handlePlaylistRequest\(env\)[\s\S]*runKnowledgePipeline/);
  assert.match(worker, /batchSize:\s*24/);
  assert.match(worker, /runPlaylistKnowledgeAutomation\(env, \{ notify: isDailyResearch \}\)/);
  assert.equal((registry.match(/"platform": "youtube"/g) || []).length, 46);
  assert.match(libraryBaseline, /LIBRARY_KNOWLEDGE_INDEX/);
});
