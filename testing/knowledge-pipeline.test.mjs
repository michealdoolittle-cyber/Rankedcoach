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
  saveApprovedKnowledgeTarget,
  saveKnowledgeProposalDraft,
  splitTranscriptIntoSections
} from "../worker/knowledge-pipeline.mjs";
import {
  AGENT_NAMES,
  MAP_NAMES,
  buildHistoricalPlaylistArchive,
  buildFeaturedPlaylist,
  dedupePlaylistVideos,
  getCuratedPlaylistResearchArchive,
  getResearchSubmittedVideos,
  handlePlaylistRequest,
  mergePlaylistResearchArchive
} from "../worker/content-automation.mjs";
import { CURATED_PLAYLIST_RESEARCH_ARCHIVE } from "../worker/curated-playlist-research.mjs";
import { EMBEDDED_KNOWLEDGE_SOURCES } from "../worker/embedded-knowledge-sources.mjs";
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

test("owner-submitted Research sources become safe, duplicate-free Playlist candidates", async () => {
  const kv = new MemoryKv();
  await registerKnowledgeSources(kv, [
    {
      id: "abcdefghijk",
      platform: "youtube",
      title: "Bind teamplay guide",
      publisher: "Coach A",
      sourceKind: "owner-imported-educational-video",
      topicType: "Map Knowledge",
      entities: ["Bind"]
    },
    {
      id: "lmnopqrstuv",
      platform: "youtube",
      title: "Automatic research inventory source",
      publisher: "Coach B",
      sourceKind: "map-guide"
    }
  ], new Date("2026-07-27T00:00:00.000Z"));
  const registry = await kv.get(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, "json");
  registry.sources[0] = {
    ...registry.sources[0],
    privateTranscript: "This private transcript must never enter the Playlist.",
    claims: [{ wording: "Private claim" }],
    consensus: { confidence: 0.99 },
    confidence: 0.99
  };
  await kv.put(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, JSON.stringify(registry));

  const candidates = await getResearchSubmittedVideos(kv);
  assert.equal(candidates.length, 1, "Only manually submitted Research sources belong in the public bridge.");
  assert.deepEqual(Object.keys(candidates[0]).sort(), [
    "channel", "channelKind", "entities", "hasStructuralMediaMetadata", "id", "isLive", "isShort",
    "isValorant", "isVod", "platform", "publishedAt", "sourceType", "thumbnail", "title",
    "topicTypeOverride", "upstreamId", "url", "wasLive"
  ]);
  assert.deepEqual(candidates[0], {
    id: "abcdefghijk",
    upstreamId: "abcdefghijk",
    platform: "youtube",
    channel: "Coach A",
    channelKind: "owner-submitted",
    title: "Bind teamplay guide",
    url: "https://www.youtube.com/watch?v=abcdefghijk",
    thumbnail: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg",
    sourceType: "owner-submitted-research",
    topicTypeOverride: "Map Knowledge",
    entities: ["Bind"],
    publishedAt: "2026-07-27T00:00:00.000Z",
    isLive: false,
    wasLive: false,
    isVod: false,
    isShort: false,
    hasStructuralMediaMetadata: true,
    isValorant: true
  });
  assert.doesNotMatch(JSON.stringify(candidates), /private transcript|private claim|consensus|confidence/i);

  const existingPlaylistRecord = {
    ...candidates[0],
    title: "Existing trusted Playlist record"
  };
  const deduped = dedupePlaylistVideos([existingPlaylistRecord, ...candidates]);
  assert.equal(deduped.length, 1, "Submitting an existing Playlist video must not duplicate its public card.");
  assert.equal(deduped[0].title, "Existing trusted Playlist record", "Existing trusted metadata keeps precedence.");
  const featured = buildFeaturedPlaylist(candidates);
  assert.equal(featured.items.length, 1);
  assert.doesNotMatch(JSON.stringify(featured.items[0]), /private transcript|private claim|consensus/i);
});

test("Playlist refresh includes a submitted Research video without private review data", async () => {
  const kv = new MemoryKv();
  await registerKnowledgeSources(kv, [{
    id: "abcdefghijk",
    platform: "youtube",
    title: "Owner submitted Bind guide",
    publisher: "Coach A",
    sourceKind: "owner-imported-educational-video",
    entities: ["Bind"]
  }], new Date("2026-07-27T00:00:00.000Z"));
  const registry = await kv.get(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, "json");
  registry.sources[0] = {
    ...registry.sources[0],
    transcript: "Private transcript text.",
    claims: [{ wording: "Private claim text." }],
    confidence: 0.99
  };
  await kv.put(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, JSON.stringify(registry));
  await kv.put("patch:last", JSON.stringify({ label: "13.01" }));

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.startsWith("https://www.youtube.com/feeds/videos.xml")) {
      return new Response("<?xml version=\"1.0\"?><feed></feed>", { status: 200 });
    }
    throw new Error(`Unexpected Playlist refresh request: ${url}`);
  };
  try {
    const playlist = await handlePlaylistRequest({ CONTENT_AUTOMATION: kv });
    const submitted = playlist.items.find(item => item.id === "abcdefghijk");
    assert.ok(submitted, "A submitted Research video must be present after the next Playlist refresh.");
    assert.equal(submitted.title, "Owner submitted Bind guide");
    assert.equal(submitted.channel, "Coach A");
    assert.equal(submitted.url, "https://www.youtube.com/watch?v=abcdefghijk");
    assert.doesNotMatch(JSON.stringify(submitted), /private transcript|private claim|claims|consensus/i);
    assert.equal(playlist.historicalItems.length, 167, "The public response must expose every verified owner-curated historical guide outside Featured.");
    const publicUnion = dedupePlaylistVideos([...playlist.items, ...playlist.historicalItems]);
    const publicIds = new Set(publicUnion.map(item => item.id));
    assert.equal(
      getCuratedPlaylistResearchArchive().every(source => publicIds.has(source.id)),
      true,
      "The public Featured + Historical union must expose every canonical curated video ID."
    );
    assert.equal(playlist.items.some(item => item.archiveOnly), false, "Historical entries must not displace the Featured feed.");
    assert.doesNotMatch(JSON.stringify(playlist.historicalItems), /private transcript|private claim|claims|consensus/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
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
              selectionReason: "This passage explains a repeatable spacing decision and its trade consequence.",
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
        selectionReason: "This passage links a repeatable spacing choice to preserving the entry trade.",
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
  assert.match(analysis.insights[0].selectionReason, /repeatable spacing/i);
});

test("esports analysis keeps transferable tactics and rejects season-result commentary", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Pro Bind analysis",
    channel: "Thinking Man's Valorant",
    sourceKind: "strategy-guide"
  });
  const cues = [
    {
      startMs: 12_000,
      durationMs: 5_000,
      text: "They won the series and qualified after a strong season in the standings."
    },
    {
      startMs: 22_000,
      durationMs: 5_000,
      text: "They use the Viper wall to split the site before the entry swings through."
    }
  ];
  const analysis = await analyzeKnowledgeTranscript(source, cues, {
    KNOWLEDGE_PIPELINE_TOKEN: "shared-test-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, async () => Response.json({
    model: "gpt-test",
    insights: [
      {
        startSeconds: 12,
        endSeconds: 17,
        contextExcerpt: cues[0].text,
        suggestedWording: "Treat qualification as proof that the team is currently strong.",
        whyItMatters: "The season result shows how the team is performing.",
        selectionReason: "The team qualified after a strong season.",
        type: "statistical",
        topic: "general",
        entities: [],
        confidence: "low"
      },
      {
        startSeconds: 22,
        endSeconds: 27,
        contextExcerpt: cues[1].text,
        suggestedWording: "Use Viper's wall to divide the site before your entry player commits.",
        whyItMatters: "The wall reduces the number of angles the entry must fight at once.",
        selectionReason: "This passage identifies a repeatable utility sequence and the space it creates.",
        type: "coaching",
        topic: "agent",
        entities: ["Viper", "Bind"],
        confidence: "high"
      }
    ]
  }));
  assert.equal(analysis.insights.length, 1);
  assert.match(analysis.insights[0].suggestedWording, /Viper's wall/);
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

test("fallback claims keep a punctuated same-topic explanation together across normal pauses", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Trade spacing explanation",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const cues = [
    {
      startMs: 0,
      durationMs: 1_000,
      text: "Hold your teammate close while the first utility takes space."
    },
    {
      startMs: 3_000,
      durationMs: 1_000,
      text: "Coordinate the next utility so the trade remains available through lane 2 after contact."
    },
    {
      startMs: 6_500,
      durationMs: 1_000,
      text: "Use the teammate's follow-up to preserve the trade through the final choke."
    }
  ];
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.equal(claims.length, 1);
  assert.equal(claims[0].privateExcerpt, cues.map(cue => cue.text).join(" "));
  assert.equal(claims[0].startSeconds, 0);
  assert.equal(claims[0].endSeconds, 7.5);
});

test("fallback claims split confirmed topic changes without mixing explanations", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Teamplay and economy guide",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const cues = [
    { startMs: 0, durationMs: 1_000, text: "Hold the trade with your teammate while the utility lands." },
    { startMs: 1_500, durationMs: 1_000, text: "Coordinate the teammate follow-up before the team commits." },
    { startMs: 3_000, durationMs: 1_000, text: "Save your credits when the next full buy matters more." },
    { startMs: 4_500, durationMs: 1_000, text: "Avoid spending credits on a force buy so the economy can recover together." }
  ];
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.equal(claims.length, 2);
  assert.deepEqual(claims.map(claim => claim.topic), ["teamplay", "economy"]);
  assert.doesNotMatch(claims[0].privateExcerpt, /credits|force buy/i);
  assert.doesNotMatch(claims[1].privateExcerpt, /teammate follow-up|trade with/i);
});

test("fallback claims retain general bridges but stop at a genuine long pause", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Connected trade explanation",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const connected = [
    { startMs: 0, durationMs: 1_000, text: "Hold the trade with your teammate before the first contact." },
    { startMs: 2_000, durationMs: 1_000, text: "This keeps the plan connected while the next decision develops." },
    { startMs: 4_000, durationMs: 1_000, text: "Use the teammate follow-up so the trade remains available." }
  ];
  const connectedClaims = extractStructuredClaims(source, splitTranscriptIntoSections(connected));
  assert.equal(connectedClaims.length, 1);
  assert.match(connectedClaims[0].privateExcerpt, /next decision develops/);

  const separated = [
    connected[0],
    {
      startMs: 5_100,
      durationMs: 1_000,
      text: "Use coordinated utility so the support player can follow the final execute."
    }
  ];
  const separatedClaims = extractStructuredClaims(source, splitTranscriptIntoSections(separated));
  assert.equal(separatedClaims.length, 2);
});

test("fallback claim segments stay bounded without losing a long same-topic explanation", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Long teamplay explanation",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const cueTexts = [
    "Hold the teammate trade while the first utility establishes safe contact through the opening choke.",
    "Coordinate the support timing so the second teammate can preserve pressure without becoming isolated.",
    "Use the next utility with the team ready to trade any defender who contests the shared space.",
    "Keep teammate spacing connected while the caller confirms which lane the coordinated group will pressure.",
    "Hold support utility until the teammate reaches cover and can trade the next defensive contact.",
    "Coordinate the team response so every utility choice has a nearby teammate ready to follow it.",
    "Use the teammate trade to preserve control while the support player prepares the next utility layer.",
    "Keep the group connected so the final teammate can trade and continue the coordinated site plan."
  ];
  const cues = cueTexts.map((text, index) => ({
    startMs: index * 1_500,
    durationMs: 1_000,
    text
  }));
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.ok(claims.length >= 2);
  assert.ok(claims.every(claim => claim.privateExcerpt.length <= 600));
  for (const cueText of cueTexts) {
    assert.equal(
      claims.filter(claim => claim.privateExcerpt.includes(cueText)).length,
      1
    );
  }
});

test("text-only fallback sections use the same topic-continuity boundaries", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Imported guide",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const text = [
    "Hold the teammate trade while the first utility lands.",
    "Coordinate the team follow-up before the next contact.",
    "Save your credits when the next full buy is more important.",
    "Avoid spending credits on the force buy so the economy can recover together."
  ].join(" ");
  const claims = extractStructuredClaims(source, [{
    startMs: 0,
    endMs: 12_000,
    text,
    cues: []
  }]);
  assert.equal(claims.length, 2);
  assert.deepEqual(claims.map(claim => claim.topic), ["teamplay", "economy"]);
});

test("lowercase unpunctuated captions still split confirmed topic changes", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Unpunctuated strategy guide",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const cues = [
    { startMs: 0, durationMs: 1_000, text: "hold the trade with your teammate while utility lands" },
    { startMs: 1_500, durationMs: 1_000, text: "coordinate the teammate follow-up before the team commits" },
    { startMs: 3_000, durationMs: 1_000, text: "save credits so the next full buy remains available" },
    { startMs: 4_500, durationMs: 1_000, text: "avoid spending credits while the economy recovers" }
  ];
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.equal(claims.length, 2);
  assert.deepEqual(claims.map(claim => claim.topic), ["teamplay", "economy"]);
});

test("one explicit topic transition can close the previous explanation", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Explicit transition guide",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const cues = [
    { startMs: 0, durationMs: 1_000, text: "Hold the trade with your teammate while utility lands." },
    { startMs: 1_500, durationMs: 1_000, text: "Coordinate the teammate follow-up before the team commits." },
    { startMs: 3_000, durationMs: 1_000, text: "For economy, save credits so the next full buy remains available." }
  ];
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.equal(claims.length, 2);
  assert.deepEqual(claims.map(claim => claim.topic), ["teamplay", "economy"]);
});

test("tactical timing numbers stay inside their same-topic explanation", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Trade timing guide",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const cues = [
    { startMs: 0, durationMs: 1_000, text: "Hold the trade with your teammate before the first contact." },
    { startMs: 1_500, durationMs: 1_000, text: "Wait 5 seconds before using the support utility with the team." },
    { startMs: 3_000, durationMs: 1_000, text: "Then use the teammate trade to complete the coordinated execute." }
  ];
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.equal(claims.length, 1);
  assert.equal(claims[0].privateExcerpt, cues.map(cue => cue.text).join(" "));
  assert.equal(claims[0].type, "coaching");
});

test("observed samples are statistical without treating damage utility as a metric", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Measured round review",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const sampleClaims = extractStructuredClaims(source, [{
    startMs: 0,
    endMs: 4_000,
    text: "Use this sample carefully: the agent won 12 of 20 rounds, so treat the result as context rather than certainty.",
    cues: []
  }]);
  const utilityClaims = extractStructuredClaims(source, [{
    startMs: 0,
    endMs: 4_000,
    text: "Use damage utility before your teammate swings because the pressure creates a safer trade.",
    cues: []
  }]);
  assert.equal(sampleClaims.length, 1);
  assert.equal(sampleClaims[0].type, "statistical");
  assert.equal(utilityClaims.length, 1);
  assert.equal(utilityClaims[0].type, "coaching");
});

test("fallback passages are bounded by reviewer words as well as characters", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Dense teamplay guide",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const shortTokens = Array.from({ length: 204 }, (_value, index) => (
    `${String.fromCharCode(97 + Math.floor(index / (26 * 26)))}`
    + `${String.fromCharCode(97 + (Math.floor(index / 26) % 26))}`
    + `${String.fromCharCode(97 + (index % 26))}`
  ));
  const blocks = Array.from({ length: 12 }, (_value, blockIndex) => [
    "use",
    "teammate",
    "trade",
    ...shortTokens.slice(blockIndex * 17, (blockIndex + 1) * 17)
  ].join(" "));
  const text = `${blocks.join(" ")}.`;
  const claims = extractStructuredClaims(source, [{
    startMs: 0,
    endMs: 24_000,
    text,
    cues: [{ startMs: 0, durationMs: 24_000, text }]
  }]);
  assert.ok(claims.length >= 2);
  assert.ok(claims.every(claim => claim.privateExcerpt.split(" ").length <= 120));
  assert.ok(claims.every(claim => claim.privateExcerpt.length <= 600));
});

test("start-only transcript timestamps preserve genuine pauses", () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Paused teamplay guide",
    channel: "Coach",
    sourceKind: "strategy-guide"
  });
  const cues = parseTimestampedTranscript(`
00:00 Hold the trade with your teammate before the first contact.
00:10 Use coordinated utility so the support player can follow the final execute.
  `);
  assert.equal(cues[0].durationMs, 4_000);
  const claims = extractStructuredClaims(source, splitTranscriptIntoSections(cues));
  assert.equal(claims.length, 2);
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

test("semantic grounding preserves a complete multi-sentence reviewer passage", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Complete execute explanation",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const passage = [
    "Before the execute begins, call which teammate will trade the first contact and which utility creates the opening.",
    "Hold the second player close enough to preserve that trade instead of letting the entry cross the choke alone.",
    "Once the first defender is cleared, use the remaining utility to protect the follow-up so the team keeps the space it earned.",
    "That sequence gives every player a clear timing and keeps one isolated duel from ending the entire site hit."
  ].join(" ");
  const analysis = await analyzeKnowledgeTranscript(source, [{
    startMs: 20_000,
    durationMs: 32_000,
    text: passage
  }], {
    KNOWLEDGE_PIPELINE_TOKEN: "shared-test-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, async () => Response.json({
    model: "gpt-test",
    insights: [{
      startSeconds: 20,
      endSeconds: 52,
      contextExcerpt: passage,
      suggestedWording: "Before the execute, call the first trade and opening utility, then keep the second player connected so the team preserves its earned space.",
      whyItMatters: "The sequence protects the entry and the follow-up from isolated fights.",
      selectionReason: "This passage explains the complete trade and utility sequence behind a connected execute.",
      type: "coaching",
      topic: "teamplay",
      entities: [],
      confidence: "high"
    }]
  }));
  assert.equal(analysis.status, "analyzed");
  assert.equal(analysis.insights.length, 1);
  assert.ok(analysis.insights[0].contextExcerpt.split(" ").length > 28);
  assert.match(analysis.insights[0].contextExcerpt, /ending the entire site hit\.$/i);
});

test("approximate semantic grounding cannot expand past the reviewer word cap", async () => {
  const source = normalizeKnowledgeSource({
    id: "abcdefghijk",
    platform: "youtube",
    title: "Bounded execute explanation",
    channel: "Coach",
    sourceKind: "map-guide"
  });
  const transcriptWords = [
    "Use", "trade", "spacing", "with", "your", "teammate", "before", "the", "execute", "because",
    ...Array.from({ length: 113 }, (_value, index) => `detail${String(index).padStart(3, "0")}`)
  ];
  const omitted = new Set([40, 80, 100]);
  const modelExcerpt = transcriptWords.filter((_word, index) => !omitted.has(index)).join(" ");
  assert.equal(transcriptWords.length, 123);
  assert.equal(modelExcerpt.split(" ").length, 120);
  const analysis = await analyzeKnowledgeTranscript(source, [{
    startMs: 20_000,
    durationMs: 32_000,
    text: transcriptWords.join(" ")
  }], {
    KNOWLEDGE_PIPELINE_TOKEN: "shared-test-token",
    KNOWLEDGE_ANALYSIS_ENDPOINT: "https://analysis.example.test"
  }, async () => Response.json({
    model: "gpt-test",
    insights: [{
      startSeconds: 20,
      endSeconds: 52,
      contextExcerpt: modelExcerpt,
      suggestedWording: "Keep the teammate connected through the execute so the opening trade remains available.",
      whyItMatters: "The connected spacing protects the opening fight.",
      selectionReason: "This passage describes a repeatable execute decision.",
      type: "coaching",
      topic: "teamplay",
      entities: [],
      confidence: "high"
    }]
  }));
  assert.equal(analysis.status, "analyzed");
  assert.equal(analysis.insights.length, 1);
  assert.ok(analysis.insights[0].contextExcerpt.split(" ").length <= 120);
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
    rankedCoachWording: proposal.suggestedWording,
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
  assert.ok(ownerDashboard.review.page.bucketCounts.review >= 2);
  assert.match(JSON.stringify(ownerDashboard), /hold the trade spacing before crossing/i);
  assert.ok(ownerDashboard.review.proposals.every(item => item.contextNotes.length >= 1));
  assert.ok(ownerDashboard.review.proposals.some(item => item.contextNotes.some(note => note.supportingExcerpts.length >= 1)));
  assert.ok(ownerDashboard.review.proposals.every(item => item.contextNotes.every(note => note.selectionReason)));
  const proposal = ownerDashboard.review.proposals.find(item => item.type === "coaching");
  await assert.rejects(
    publishApprovedKnowledge(kv, { proposalId: proposal.id, owner: "Michael", category: "map", entity: "Bind" }),
    /owner-approved/
  );
  await approveKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Keep one teammate close enough to trade before the team commits through Bind’s first choke.",
    type: "coaching",
    topic: "general",
    confirmOriginalWording: true
  }, new Date("2026-07-24T00:02:00.000Z"));
  const approvedDashboard = await getKnowledgeOwnerDashboard(kv, { proposalBucket: "approved" });
  const approvedProposal = approvedDashboard.review.proposals.find(item => item.id === proposal.id);
  assert.equal(approvedProposal.approvalStatus, "approved");
  assert.equal(approvedProposal.approvedType, "coaching");
  assert.equal(approvedProposal.approvedTopic, "general");
  assert.equal(approvedDashboard.review.page.bucketCounts.approved, 1);
  const savedTarget = await saveApprovedKnowledgeTarget(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    type: "coaching",
    topic: "mechanics",
    category: "map",
    entity: "Bind"
  }, new Date("2026-07-24T00:02:30.000Z"));
  assert.equal(savedTarget.type, "coaching");
  assert.equal(savedTarget.topic, "mechanics");
  assert.equal(savedTarget.category, "map");
  assert.equal(savedTarget.entity, "Bind");
  const retaggedProposal = (await getKnowledgeOwnerDashboard(kv, { proposalBucket: "approved" })).review.proposals.find(item => item.id === proposal.id);
  assert.equal(retaggedProposal.approvedType, "coaching");
  assert.equal(retaggedProposal.approvedTopic, "mechanics");
  assert.equal(retaggedProposal.approvedCategory, "map");
  assert.equal(retaggedProposal.approvedEntity, "Bind");
  assert.equal((await getPublishedKnowledge(kv)).items.length, 0);
  const published = await publishApprovedKnowledge(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    type: "coaching",
    topic: "mechanics",
    category: "map",
    entity: "Bind"
  }, new Date("2026-07-24T00:03:00.000Z"));
  assert.equal(published.status, "published");
  assert.equal(published.type, "coaching");
  assert.equal(published.topic, "mechanics");
  assert.equal(published.entity, "Bind");
  const publishedDashboard = await getKnowledgeOwnerDashboard(kv, { proposalBucket: "approved" });
  assert.equal(publishedDashboard.review.proposals.find(item => item.id === proposal.id).approvalStatus, "published");
  const publicIndex = await getPublishedKnowledge(kv);
  assert.equal(publicIndex.items.length, 1);
  assert.equal(publicIndex.items[0].topic, "mechanics");
  assert.match(publicIndex.items[0].wording, /Keep one teammate/);
  assert.doesNotMatch(JSON.stringify(publicIndex), /hold the trade spacing before crossing/i);
});

test("owner-corrected type controls statistical publication gate", async () => {
  const kv = new MemoryKv();
  await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=typegate123",
      title: "Bind lane trading guide",
      publisher: "Coach A",
      entities: ["Bind"]
    },
    cues: parseTimestampedTranscript(`
00:01 Pair your first utility with a teammate so the team can trade the opening lane safely.
00:08 Keep one teammate close before the site hit so first contact can be recovered.
00:15 The spacing idea works because the second player is close enough to convert the duel.
    `)
  }, {
    now: new Date("2026-07-24T00:10:00.000Z"),
    libraryKnowledgeIndex: []
  });
  const proposal = (await getKnowledgeOwnerDashboard(kv)).review.proposals.find(item => item.type === "coaching");
  await approveKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Keep the second player close enough to trade before the team commits through the choke.",
    type: "statistical",
    topic: "teamplay",
    confirmOriginalWording: true
  }, new Date("2026-07-24T00:11:00.000Z"));
  await assert.rejects(
    publishApprovedKnowledge(kv, {
      proposalId: proposal.id,
      owner: "Michael",
      type: "statistical",
      topic: "teamplay",
      category: "map",
      entity: "Bind"
    }),
    /statistical insight needs corroboration/
  );
  const published = await publishApprovedKnowledge(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    type: "coaching",
    topic: "teamplay",
    category: "map",
    entity: "Bind"
  }, new Date("2026-07-24T00:12:00.000Z"));
  assert.equal(published.type, "coaching");
  assert.equal(published.topic, "teamplay");
});

test("agent-map publications require and preserve a canonical valid pair", async () => {
  const kv = new MemoryKv();
  await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=agentmap123",
      title: "Jett Breeze entry guide",
      publisher: "Coach A",
      entities: ["Jett", "Breeze"]
    },
    cues: parseTimestampedTranscript(`
00:01 On Breeze, prime Tailwind before crossing the first long lane so the Operator cannot trap you in the open.
00:08 Keep one teammate ready to trade the dash before the rest of the team commits through the site entrance.
00:15 Save Cloudburst for the second angle so the first crossing does not become a second exposed fight.
    `)
  }, {
    now: new Date("2026-07-24T01:00:00.000Z"),
    libraryKnowledgeIndex: []
  });
  const proposal = (await getKnowledgeOwnerDashboard(kv)).review.proposals.find(item => item.type === "coaching");
  await approveKnowledgeProposal(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    rankedCoachWording: "Jett should prime Tailwind before challenging Breeze's first long sightline.",
    confirmOriginalWording: true
  }, new Date("2026-07-24T01:01:00.000Z"));
  const published = await publishApprovedKnowledge(kv, {
    proposalId: proposal.id,
    owner: "Michael",
    category: "agent-map",
    entity: "jett \u00b7 breeze"
  }, new Date("2026-07-24T01:02:00.000Z"));
  assert.equal(published.entity, "Jett \u00b7 Breeze");
  assert.equal((await getPublishedKnowledge(kv)).items[0].category, "agent-map");
  await assert.rejects(
    publishApprovedKnowledge(kv, {
      proposalId: proposal.id,
      owner: "Michael",
      category: "agent-map",
      entity: "Jett \u00b7 Not A Map"
    }),
    /agent-map pair/
  );
});

test("owner review shows a complete selected passage with wider contiguous context", async () => {
  const kv = new MemoryKv();
  const before = Array.from({ length: 6 }, (_value, index) => ({
    startMs: index * 2_500,
    durationMs: 1_500,
    text: `Hold map control through lane ${index + 1} while the site rotation keeps every covered space connected.`
  }));
  const selected = [
    {
      startMs: 15_000,
      durationMs: 1_500,
      text: "Use Astra's ability after the first contact so the defender cannot immediately reclaim the choke."
    },
    {
      startMs: 17_500,
      durationMs: 1_500,
      text: "Hold the next ability until Astra's timing confirms the defender is fully committed."
    },
    {
      startMs: 20_000,
      durationMs: 1_500,
      text: "Use the final ability after Astra confirms the defender is committed and cannot escape."
    }
  ];
  const after = Array.from({ length: 6 }, (_value, index) => ({
    startMs: 22_500 + (index * 2_500),
    durationMs: 1_500,
    text: `Keep crosshair placement steady through follow-up angle ${index + 1} before the next controlled movement begins.`
  }));
  await ingestTimestampedKnowledgeTranscript(kv, {
    source: {
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=contextwide",
      title: "Astra execute context",
      publisher: "Coach Context",
      entities: ["Astra"]
    },
    cues: [...before, ...selected, ...after]
  }, {
    now: new Date("2026-07-24T01:00:00.000Z"),
    libraryKnowledgeIndex: []
  });
  const dashboard = await getKnowledgeOwnerDashboard(kv);
  const note = dashboard.review.proposals
    .flatMap(proposal => proposal.contextNotes)
    .find(context => /Astra's ability after the first contact/i.test(context.contextExcerpt));
  assert.ok(note);
  assert.ok(note.contextExcerpt.split(" ").length > 28, note.contextExcerpt);
  assert.match(note.contextExcerpt, /defender is committed and cannot escape/i);
  const leadIn = note.supportingExcerpts.find(excerpt => excerpt.label === "Lead-in");
  const followThrough = note.supportingExcerpts.find(excerpt => excerpt.label === "Follow-through");
  assert.ok(leadIn.text.split(" ").length > 42);
  assert.ok(followThrough.text.split(" ").length > 42);
  assert.match(leadIn.text, /lane 6/i);
  assert.match(followThrough.text, /angle 1/i);
  assert.doesNotMatch(
    JSON.stringify(await getPublishedKnowledge(kv)),
    /Astra's ability after the first contact/i
  );
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
  const rejected = (await getKnowledgeOwnerDashboard(kv, { proposalBucket: "rejected" })).review.proposals[0];
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
  const held = (await getKnowledgeOwnerDashboard(kv, { proposalBucket: "approved" })).review.proposals
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
  const orphan = (await getKnowledgeOwnerDashboard(kv, { proposalBucket: "approved" })).review.proposals
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
  const batchSources = Array.from({ length: 27 }, (_value, index) => ({
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
  assert.equal(bounded.processed.length, 24);
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

test("curated Playlist research archive is complete, scoped, canonical, and educational", () => {
  const curated = getCuratedPlaylistResearchArchive();
  assert.equal(CURATED_PLAYLIST_RESEARCH_ARCHIVE.length, 167);
  assert.equal(curated.length, 167);
  assert.notEqual(curated, CURATED_PLAYLIST_RESEARCH_ARCHIVE, "The getter must not expose the manifest array for mutation.");

  const ids = curated.map(source => source.id);
  assert.equal(new Set(ids).size, 167, "Every curated video must have one unique canonical YouTube ID.");
  const validRoles = new Set(["Controller", "Duelist", "Initiator", "Sentinel", "All Roles"]);
  const expectedTopic = {
    Map: "Map Knowledge",
    Agent: "Agent",
    Role: "Role"
  };
  const scopes = {
    Map: new Set(),
    Agent: new Set(),
    Role: new Set()
  };

  for (const source of curated) {
    assert.match(source.id, /^[A-Za-z0-9_-]{11}$/);
    assert.equal(source.platform, "youtube");
    assert.equal(source.url, `https://www.youtube.com/watch?v=${source.id}`);
    assert.ok(String(source.title || "").trim(), `${source.id} must have a verified title.`);
    assert.ok(String(source.channel || "").trim(), `${source.id} must have a verified publisher.`);
    assert.equal(source.thumbnail, `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`);
    assert.notEqual(source.isLive, true);
    assert.notEqual(source.wasLive, true);
    assert.notEqual(source.isVod, true);
    assert.notEqual(source.isShort, true);
    assert.ok(scopes[source.targetType], `${source.id} has an unsupported target type.`);
    assert.equal(source.topicType || source.topicTypeOverride, expectedTopic[source.targetType]);
    assert.ok(Array.isArray(source.entities) && source.entities.includes(source.targetName));
    if (source.targetType === "Map") assert.ok(MAP_NAMES.includes(source.targetName));
    if (source.targetType === "Agent") assert.ok(AGENT_NAMES.includes(source.targetName));
    if (source.targetType === "Role") assert.ok(validRoles.has(source.targetName));
    scopes[source.targetType].add(source.targetName);

    const normalized = normalizeKnowledgeSource(source);
    assert.ok(normalized, `${source.id} must normalize into a knowledge source.`);
    assert.equal(normalized.researchEligible, true);
    assert.equal(normalized.transcriptStatus, "pending");
    assert.equal(
      normalized.startSeconds,
      Math.max(0, Number(source.startSeconds || 0)),
      `${source.id} must retain the owner's selected research start offset.`
    );
  }

  assert.deepEqual({
    maps: scopes.Map.size,
    agents: scopes.Agent.size,
    roles: scopes.Role.size
  }, {
    maps: 13,
    agents: 29,
    roles: 5
  });
});

test("curated videos dedupe by canonical identity, retain category context, and stay outside the Featured cap", () => {
  const curated = getCuratedPlaylistResearchArchive();
  const first = curated[0];
  const deduped = dedupePlaylistVideos([
    first,
    { ...first, title: "Duplicate metadata must not win" },
    ...curated.slice(1)
  ]);
  assert.equal(deduped.length, 167);
  assert.equal(deduped[0].title, first.title, "Dedupe must preserve the first canonical record.");

  const publicCandidates = Array.from({ length: 130 }, (_value, index) => ({
    id: `pub${String(index).padStart(8, "0")}`,
    platform: "youtube",
    channel: "Current Coach",
    channelKind: "creator",
    title: `Current Valorant guide ${index}`,
    publishedAt: new Date(2026, 0, 1, 0, index).toISOString(),
    isLive: false,
    wasLive: false,
    isVod: false,
    isShort: false,
    isValorant: true
  }));
  const featured = buildFeaturedPlaylist(dedupePlaylistVideos(publicCandidates));
  const historical = buildHistoricalPlaylistArchive(curated, featured.items);
  const researchCandidates = mergePlaylistResearchArchive([], publicCandidates, curated);
  const researchArchive = buildFeaturedPlaylist(
    researchCandidates,
    "",
    new Set(),
    Date.now(),
    { maxItems: 5_000 }
  );
  const curatedIds = new Set(curated.map(source => source.id));

  assert.equal(featured.items.length, 120);
  assert.equal(featured.items.some(source => curatedIds.has(source.id)), false);
  assert.equal(historical.items.length, 167, "The separate Historical collection must not inherit the 120-card Featured cap.");
  assert.equal(
    curated.every(source => historical.items.some(item => item.id === source.id)),
    true,
    "Every curated source must be available through the public Historical collection."
  );
  assert.deepEqual(
    Object.fromEntries(["Map Knowledge", "Agent", "Role"].map(topic => [
      topic,
      new Set(historical.items.filter(item => item.topicType === topic).map(item => item.targetName)).size
    ])),
    { "Map Knowledge": 13, Agent: 29, Role: 5 },
    "Map, Agent, and Role Playlist filters must retain each curated source's original category and target context."
  );
  assert.equal(researchArchive.items.length, publicCandidates.length + curated.length);
  assert.equal(
    curated.every(source => researchArchive.items.some(item => item.id === source.id)),
    true,
    "Every curated source must enter the private research archive."
  );
});

test("a curated guide trimmed from Featured remains reachable through Historical with its start offset", () => {
  const [curated] = getCuratedPlaylistResearchArchive().filter(source => Number(source.startSeconds) > 0);
  assert.ok(curated, "The fixture needs a curated source with an explicit YouTube start offset.");
  const currentCandidates = Array.from({ length: 121 }, (_value, index) => ({
    id: `cur${String(index).padStart(8, "0")}`,
    platform: "youtube",
    channel: "Current Coach",
    channelKind: "creator",
    title: `Current guide ${index}`,
    publishedAt: new Date(2026, 6, 1, 0, index).toISOString(),
    isLive: false,
    wasLive: false,
    isVod: false,
    isShort: false,
    isValorant: true
  }));
  const featured = buildFeaturedPlaylist([...currentCandidates, curated]);
  assert.equal(featured.items.some(item => item.id === curated.id), false, "The older curated record should be trimmed from the 120-card Featured feed.");
  const historical = buildHistoricalPlaylistArchive([curated], featured.items);
  const reachable = historical.items.find(item => item.id === curated.id);
  assert.ok(reachable, "A curated record trimmed from Featured must remain available in Historical.");
  assert.equal(reachable.startSeconds, curated.startSeconds, "Historical playback must retain the owner's exact start offset.");
});

test("every curated archive source is present in the generated embedded registry", () => {
  const embeddedById = new Map(EMBEDDED_KNOWLEDGE_SOURCES
    .filter(source => source.platform === "youtube")
    .map(source => [source.id, source]));
  const missing = getCuratedPlaylistResearchArchive()
    .map(source => source.id)
    .filter(id => !embeddedById.has(id));
  assert.deepEqual(missing, []);
  assert.ok(embeddedById.size >= CURATED_PLAYLIST_RESEARCH_ARCHIVE.length);
});

test("processing a curated archive source remains private until owner publication", async () => {
  const kv = new MemoryKv();
  const [source] = getCuratedPlaylistResearchArchive();
  const result = await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    sources: [source],
    batchSize: 1,
    fetchImpl: youtubeCaptionFetch(),
    notify: false,
    now: new Date("2026-07-24T19:00:00.000Z")
  });

  assert.equal(result.publicationWrites, 0);
  assert.equal(result.processed.length, 1);
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateTranscriptPrefix}youtube-${source.id}`));
  assert.ok(await kv.get(`${KNOWLEDGE_STORAGE_KEYS.privateClaimsPrefix}youtube-${source.id}`));
  assert.deepEqual(await getPublishedKnowledge(kv), { updatedAt: null, items: [] });
  assert.equal([...kv.values.keys()].some(key => key.startsWith("knowledge:published:")), false);
});

test("owner-selected start offsets exclude earlier transcript material from research", async () => {
  const kv = new MemoryKv();
  const source = {
    ...getCuratedPlaylistResearchArchive()[0],
    startSeconds: 5
  };
  await runKnowledgePipeline({ CONTENT_AUTOMATION: kv }, {
    sources: [source],
    batchSize: 1,
    fetchImpl: youtubeCaptionFetch(),
    notify: false,
    now: new Date("2026-07-24T19:05:00.000Z")
  });

  const transcript = await kv.get(
    `${KNOWLEDGE_STORAGE_KEYS.privateTranscriptPrefix}youtube-${source.id}`,
    "json"
  );
  assert.deepEqual(
    transcript.cues.map(cue => cue.startMs),
    [5_000],
    "Research must begin at the owner's explicit YouTube timestamp."
  );
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
  const libraryBaseline = await readFile(path.join(ROOT, "worker", "knowledge-library-audit-baseline.mjs"), "utf8");
  assert.match(worker, /await handlePlaylistRequest\(env\)[\s\S]*runKnowledgePipeline/);
  assert.match(worker, /batchSize:\s*24/);
  assert.match(worker, /runPlaylistKnowledgeAutomation\(env, \{ notify: isDailyResearch \}\)/);
  const embeddedIds = new Set(EMBEDDED_KNOWLEDGE_SOURCES.map(source => `${source.platform}:${source.id}`));
  assert.equal(embeddedIds.size, EMBEDDED_KNOWLEDGE_SOURCES.length, "The generated embedded registry must stay deduplicated.");
  assert.equal(
    getCuratedPlaylistResearchArchive().every(source => embeddedIds.has(`youtube:${source.id}`)),
    true,
    "Schedules must receive every curated archive source through the generated registry."
  );
  assert.match(libraryBaseline, /LIBRARY_KNOWLEDGE_INDEX/);
});
