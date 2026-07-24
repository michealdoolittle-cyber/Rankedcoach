const KNOWLEDGE_SCHEMA_VERSION = 1;
const SOURCE_REGISTRY_KEY = "knowledge:sources:registry";
const PRIVATE_TRANSCRIPT_PREFIX = "knowledge:private:transcript:";
const PRIVATE_CLAIMS_PREFIX = "knowledge:private:claims:";
const PRIVATE_CONSENSUS_PREFIX = "knowledge:private:consensus:";
const PROPOSAL_PREFIX = "knowledge:proposal:";
const APPROVAL_PREFIX = "knowledge:approval:";
const REVIEW_PREFIX = "knowledge:review:";
const LATEST_REVIEW_KEY = "knowledge:review:latest";
const REVIEW_DIRTY_KEY = "knowledge:review:dirty";
const LAST_RUN_KEY = "knowledge:run:last";
const RUN_LEASE_KEY = "knowledge:run:lease";
const PUBLISHED_PREFIX = "knowledge:published:";
const PUBLISHED_INDEX_KEY = "knowledge:published:index";
const DEFAULT_BATCH_SIZE = 4;
const MAX_PIPELINE_BATCH_SIZE = 24;
const DEFAULT_PIPELINE_DEADLINE_MS = 9 * 60 * 1_000;
const RUN_LEASE_TTL_MS = 12 * 60 * 1_000;
const MAX_TRANSCRIPT_CUES = 12_000;
const MAX_SOURCE_ITEMS = 6_000;
const YOUTUBE_ANDROID_CLIENT_VERSION = "20.10.38";
const YOUTUBE_BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";
const YOUTUBE_ANDROID_USER_AGENT = `com.google.android.youtube/${YOUTUBE_ANDROID_CLIENT_VERSION} (Linux; U; Android 11) gzip`;
const GEMINI_INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";
const DEFAULT_KNOWLEDGE_ANALYSIS_ENDPOINT = "https://jqrsjaaxtdxfmpbtrupj.supabase.co/functions/v1/knowledge-analyze";
const DEFAULT_GEMINI_VIDEO_MODEL = "gemini-3.6-flash";
const GEMINI_API_REVISION = "2026-05-20";
const MAX_VIDEO_INSIGHTS = 24;
const MAX_FALLBACK_CLAIMS_PER_SOURCE = 24;
const MAX_REVIEW_EXCERPT_WORDS = 120;
const MAX_SURROUNDING_EXCERPT_WORDS = 96;
const MAX_SURROUNDING_EXCERPT_CUES = 8;
const SURROUNDING_EXCERPT_WINDOW_MS = 36_000;
const CLAIM_TOPIC_PAUSE_MS = 4_000;
const MAX_CLAIM_SENTENCE_UNIT_CHARACTERS = 320;
const MAX_CLAIM_SEGMENT_CHARACTERS = 600;
const MAX_CLAIM_SEGMENT_WORDS = MAX_REVIEW_EXCERPT_WORDS;

const TERMINOLOGY = Object.freeze([
  Object.freeze([/\bgame[\s-]*sense\b/gi, "game sense"]),
  Object.freeze([/\bhead[\s-]*shot(s)?\b/gi, "headshot$1"]),
  Object.freeze([/\bcounter[\s-]*strafe(s|d|ing)?\b/gi, "counter-strafe$1"]),
  Object.freeze([/\bulti(?:mate)?\b/gi, "ultimate"]),
  Object.freeze([/\bu[\s-]*haul\b/gi, "U-Haul"]),
  Object.freeze([/\bhooka\b/gi, "Hookah"]),
  Object.freeze([/\bop(?:erator)?\b/gi, "Operator"]),
  Object.freeze([/\bphantom\b/gi, "Phantom"]),
  Object.freeze([/\bvandal\b/gi, "Vandal"])
]);

const STOP_WORDS = new Set([
  "a", "about", "after", "again", "all", "also", "an", "and", "are", "as", "at", "be", "because",
  "been", "before", "being", "but", "by", "can", "do", "for", "from", "get", "has", "have", "he",
  "her", "here", "him", "his", "how", "i", "if", "in", "into", "is", "it", "its", "just", "like",
  "more", "most", "not", "of", "on", "one", "or", "our", "out", "over", "really", "she", "so",
  "some", "that", "the", "their", "them", "then", "there", "these", "they", "this", "to", "up",
  "very", "was", "we", "were", "what", "when", "where", "which", "who", "will", "with", "you",
  "your"
]);

const TOPIC_RULES = Object.freeze([
  Object.freeze({ id: "economy", pattern: /\b(?:buy|credits?|economy|eco|save|force|light buy|full buy)\b/i }),
  Object.freeze({ id: "mechanics", pattern: /\b(?:aim|crosshair|headshot|spray|recoil|peek(?:ing)?|swing|strafe|movement|flick)\b/i }),
  Object.freeze({ id: "teamplay", pattern: /\b(?:trade|teammate|team|comms?|communicat|coordinate|support|utility)\b/i }),
  Object.freeze({ id: "map-control", pattern: /\b(?:map|site|lane|space|control|rotate|rotation|flank|lurk|plant|retake)\b/i }),
  Object.freeze({ id: "agent", pattern: /\b(?:agent|ability|ultimate|duelist|controller|initiator|sentinel|entry|anchor)\b/i }),
  Object.freeze({ id: "mentality", pattern: /\b(?:mental|tilt|confidence|focus|discipline|mindset|pressure|mistake)\b/i })
]);

const ENTITY_NAMES = Object.freeze([
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus", "Pearl",
  "Split", "Summit", "Sunset", "Astra", "Breach", "Brimstone", "Chamber", "Clove", "Cypher",
  "Deadlock", "Fade", "Gekko", "Harbor", "Iso", "Jett", "KAY/O", "Killjoy", "Miks", "Neon",
  "Omen", "Phoenix", "Raze", "Reyna", "Sage", "Skye", "Sova", "Tejo", "Veto", "Viper", "Vyse",
  "Waylay", "Yoru", "Ares", "Bandit", "Bucky", "Bulldog", "Classic", "Frenzy", "Ghost",
  "Guardian", "Judge", "Marshal", "Odin", "Operator", "Outlaw", "Phantom", "Sheriff", "Shorty",
  "Spectre", "Stinger", "Vandal"
]);
const MAP_ENTITY_NAMES = new Set(ENTITY_NAMES.slice(0, 13));
const WEAPON_ENTITY_NAMES = new Set([
  "Ares", "Bandit", "Bucky", "Bulldog", "Classic", "Frenzy", "Ghost", "Guardian", "Judge",
  "Marshal", "Odin", "Operator", "Outlaw", "Phantom", "Sheriff", "Shorty", "Spectre", "Stinger", "Vandal"
]);
const AGENT_ENTITY_NAMES = new Set(ENTITY_NAMES.filter(name => !MAP_ENTITY_NAMES.has(name) && !WEAPON_ENTITY_NAMES.has(name)));

function nowIso(now = new Date()) {
  return new Date(now).toISOString();
}

function normalizeWhitespace(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function decodeHtml(value = "") {
  return String(value)
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function slug(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function legacyFingerprint32(value = "") {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function fingerprint(value = "") {
  let hash = 0x6c62272e07bb014262b821756295c58dn;
  const prime = 0x0000000001000000000000000000013bn;
  const mask = (1n << 128n) - 1n;
  for (const byte of new TextEncoder().encode(String(value))) {
    hash ^= BigInt(byte);
    hash = (hash * prime) & mask;
  }
  return hash.toString(16).padStart(32, "0");
}

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function canonicalPublicationEntity(category, value = "") {
  if (category === "general") return "";
  const allowed = category === "map"
    ? MAP_ENTITY_NAMES
    : category === "weapon"
      ? WEAPON_ENTITY_NAMES
      : AGENT_ENTITY_NAMES;
  const normalized = normalizeWhitespace(value).toLowerCase();
  return [...allowed].find(entity => entity.toLowerCase() === normalized) || "";
}

function containsCopiedTranscriptPhrase(wording = "", excerpt = "", phraseLength = 7) {
  const normalize = value => normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9%/ ]+/g, "")
    .split(" ")
    .filter(Boolean);
  const draft = normalize(wording);
  const source = normalize(excerpt).join(" ");
  if (draft.length < phraseLength) return false;
  for (let index = 0; index <= draft.length - phraseLength; index += 1) {
    if (source.includes(draft.slice(index, index + phraseLength).join(" "))) return true;
  }
  return false;
}

function youtubeId(value = "") {
  const raw = String(value || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    const fromQuery = url.searchParams.get("v");
    if (/^[A-Za-z0-9_-]{11}$/.test(fromQuery || "")) return fromQuery;
    const fromPath = url.hostname.includes("youtu.be")
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.pathname.match(/\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)?.[1];
    return /^[A-Za-z0-9_-]{11}$/.test(fromPath || "") ? fromPath : "";
  } catch {
    return "";
  }
}

function twitchVideoId(value = "") {
  const raw = String(value || "").trim();
  const id = raw.match(/(?:twitch-(\d+)|twitch\.tv\/videos\/(\d+)|^(\d+)$)/i);
  return id?.[1] || id?.[2] || id?.[3] || "";
}

function sourceIdentity(source = {}) {
  const platform = String(source.platform || "").toLowerCase();
  if (platform === "youtube") {
    const upstreamId = youtubeId(source.upstreamId || source.id || source.url);
    return upstreamId ? { platform, upstreamId, id: `youtube-${upstreamId}` } : null;
  }
  if (platform === "twitch") {
    const upstreamId = twitchVideoId(source.upstreamId || source.videoId || source.id || source.url);
    return upstreamId ? { platform, upstreamId, id: `twitch-${upstreamId}` } : null;
  }
  return null;
}

function sourcePublisher(source = {}) {
  const publisher = normalizeWhitespace(source.channel || source.creator || source.publisher);
  if (publisher) return slug(publisher);
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export function normalizeKnowledgeSource(source = {}, registeredAt = nowIso()) {
  const identity = sourceIdentity(source);
  if (!identity) return null;
  const url = identity.platform === "youtube"
    ? `https://www.youtube.com/watch?v=${identity.upstreamId}`
    : `https://www.twitch.tv/videos/${identity.upstreamId}`;
  const sourceKind = normalizeWhitespace(source.sourceKind || source.sourceType || source.channelKind || "community-video");
  const sourceClassifiers = [
    source.sourceKind,
    source.sourceType,
    source.channelKind
  ].map(normalizeWhitespace).filter(Boolean).join(" ");
  const topicType = normalizeWhitespace(source.topicType || source.topicTypeOverride || "");
  const startSeconds = Math.max(0, Number(source.startSeconds || 0));
  const researchEligible = source.researchEligible !== false
    && !/(?:skin|collection|showcase|live-stream)/i.test(sourceClassifiers)
    && !/^(?:News|YT Shorts|Live\/Streaming)$/i.test(topicType)
    && source.isLive !== true;
  return Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: identity.id,
    platform: identity.platform,
    upstreamId: identity.upstreamId,
    url,
    title: normalizeWhitespace(source.title || `${identity.platform} video ${identity.upstreamId}`),
    publisher: normalizeWhitespace(source.channel || source.creator || source.publisher || "Unknown"),
    publisherKey: sourcePublisher({ ...source, url }),
    sourceKind,
    topicType,
    startSeconds,
    entities: unique((source.entities || [source.targetName]).map(normalizeWhitespace)),
    registeredAt,
    researchEligible,
    transcriptStatus: !researchEligible
      ? "registered-non-educational"
      : identity.platform === "youtube"
        ? "pending"
        : "provider-required",
    reviewStatus: "research-only"
  });
}

async function listKvKeys(kv, prefix) {
  const names = [];
  let cursor;
  do {
    const page = await kv.list({ prefix, cursor });
    names.push(...(page.keys || []).map(key => key.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return names;
}

export async function registerKnowledgeSources(kv, sources = [], now = new Date()) {
  const registeredAt = nowIso(now);
  const registry = await kv.get(SOURCE_REGISTRY_KEY, "json");
  const existing = new Map((registry?.sources || []).map(source => [source.id, source]));
  const normalized = [];
  for (const candidate of sources.slice(0, MAX_SOURCE_ITEMS)) {
    const source = normalizeKnowledgeSource(candidate, registeredAt);
    if (!source) continue;
    const previous = existing.get(source.id);
    const eligibilityChanged = Boolean(previous)
      && previous.researchEligible !== source.researchEligible;
    const preserveResearchState = Boolean(previous) && !eligibilityChanged;
    const next = {
      ...source,
      registeredAt: previous?.registeredAt || source.registeredAt,
      transcriptStatus: preserveResearchState ? previous.transcriptStatus : source.transcriptStatus,
      lastTranscriptAttemptAt: preserveResearchState ? previous.lastTranscriptAttemptAt || null : null,
      transcriptLanguage: preserveResearchState ? previous.transcriptLanguage || "" : "",
      cueCount: preserveResearchState ? Number(previous.cueCount || 0) : 0,
      claimCount: preserveResearchState ? Number(previous.claimCount || 0) : 0,
      extractionKind: preserveResearchState ? previous.extractionKind || "" : "",
      lastErrorClass: preserveResearchState ? previous.lastErrorClass || "" : "",
      attemptCount: preserveResearchState ? Number(previous.attemptCount || 0) : 0,
      nextRetryAt: preserveResearchState ? previous.nextRetryAt || null : null,
      retryRequestedAt: preserveResearchState ? previous.retryRequestedAt || null : null,
      analysisStatus: preserveResearchState ? previous.analysisStatus || "" : "",
      eligibilityChangedAt: eligibilityChanged ? registeredAt : previous?.eligibilityChangedAt || null,
      eligibilityReviewPending: eligibilityChanged
        ? true
        : previous?.eligibilityReviewPending === true,
      eligibilityReviewedAt: previous?.eligibilityReviewedAt || null
    };
    existing.set(next.id, next);
    normalized.push(next);
  }
  await kv.put(SOURCE_REGISTRY_KEY, JSON.stringify({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    updatedAt: registeredAt,
    sources: [...existing.values()].slice(0, MAX_SOURCE_ITEMS)
  }));
  return normalized;
}

async function readSourceRegistry(kv) {
  const registry = await kv.get(SOURCE_REGISTRY_KEY, "json");
  return Array.isArray(registry?.sources) ? registry.sources : [];
}

async function writeSourceRegistry(kv, sources, updatedAt) {
  await kv.put(SOURCE_REGISTRY_KEY, JSON.stringify({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    updatedAt,
    sources: sources.slice(0, MAX_SOURCE_ITEMS)
  }));
}

function extractJsonArrayAfter(source, marker) {
  const markerIndex = String(source).indexOf(marker);
  if (markerIndex < 0) return [];
  const start = String(source).indexOf("[", markerIndex + marker.length);
  if (start < 0) return [];
  let depth = 0;
  let inString = false;
  let escaping = false;
  for (let index = start; index < String(source).length; index += 1) {
    const character = String(source)[index];
    if (inString) {
      if (escaping) escaping = false;
      else if (character === "\\") escaping = true;
      else if (character === "\"") inString = false;
      continue;
    }
    if (character === "\"") {
      inString = true;
      continue;
    }
    if (character === "[") depth += 1;
    if (character === "]") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(String(source).slice(start, index + 1));
        } catch {
          return [];
        }
      }
    }
  }
  return [];
}

export function extractYouTubeCaptionTracks(html = "") {
  return extractJsonArrayAfter(html, "\"captionTracks\":")
    .filter(track => track?.baseUrl && track?.languageCode)
    .map(track => ({
      baseUrl: String(track.baseUrl),
      languageCode: String(track.languageCode),
      name: normalizeWhitespace(track.name?.simpleText || track.name?.runs?.map(run => run.text).join("") || track.languageCode),
      kind: String(track.kind || ""),
      isTranslatable: Boolean(track.isTranslatable)
    }));
}

function selectCaptionTrack(tracks = []) {
  const english = tracks.filter(track => /^en(?:-|$)/i.test(track.languageCode));
  return english.find(track => track.kind !== "asr")
    || english[0]
    || tracks.find(track => track.kind !== "asr")
    || tracks[0]
    || null;
}

function interactionOutputText(payload = {}) {
  if (typeof payload.output_text === "string") return payload.output_text;
  return (payload.steps || [])
    .filter(step => step?.type === "model_output")
    .flatMap(step => step.content || [])
    .filter(content => content?.type === "text")
    .map(content => content.text || "")
    .join("\n");
}

function normalizeGeminiVideoInsights(payload = {}) {
  return Object.freeze((Array.isArray(payload?.insights) ? payload.insights : [])
    .slice(0, MAX_VIDEO_INSIGHTS)
    .map(item => {
      const contextExcerpt = normalizeWhitespace(item?.contextExcerpt)
        .split(" ")
        .slice(0, MAX_REVIEW_EXCERPT_WORDS)
        .join(" ");
      const suggestedWording = normalizeWhitespace(item?.suggestedWording);
      const selectionReason = normalizeWhitespace(item?.selectionReason);
      const startSeconds = Math.max(0, Number(item?.startSeconds || 0));
      const endSeconds = Math.max(startSeconds, Number(item?.endSeconds || startSeconds + 8));
      const type = item?.type === "statistical" ? "statistical" : "coaching";
      const topic = TOPIC_RULES.some(rule => rule.id === item?.topic) ? item.topic : classifyTopic(`${contextExcerpt} ${suggestedWording}`);
      const entities = unique([
        ...(Array.isArray(item?.entities) ? item.entities : []),
        ...entityMatches(`${contextExcerpt} ${suggestedWording}`)
      ].map(normalizeWhitespace)).filter(entity => ENTITY_NAMES.includes(entity));
      if (contextExcerpt.length < 20 || suggestedWording.length < 20) return null;
      const normalized = {
        startSeconds,
        endSeconds,
        contextExcerpt,
        suggestedWording,
        whyItMatters: normalizeWhitespace(item?.whyItMatters),
        selectionReason: selectionReason || selectionReasonForInsight({ type, topic, entities }),
        type,
        topic,
        entities: Object.freeze(entities),
        confidence: ["high", "medium", "low"].includes(item?.confidence) ? item.confidence : "medium"
      };
      return transferableVideoInsight(normalized) ? Object.freeze(normalized) : null;
    })
    .filter(Boolean));
}

function evidenceTokens(value = "") {
  return [...String(value).matchAll(/[a-z0-9%/]+(?:['’.-][a-z0-9%/]+)*/gi)]
    .map(match => {
      const raw = match[0];
      const normalized = raw
        .toLowerCase()
        .replace(/[^a-z0-9%/]+/g, "");
      return normalized ? {
        raw,
        normalized,
        characterStart: Number(match.index || 0),
        characterEnd: Number(match.index || 0) + raw.length
      } : null;
    })
    .filter(Boolean);
}

function orderedTokenOverlap(left = [], right = []) {
  const rows = new Array(right.length + 1).fill(0);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let diagonal = 0;
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const previous = rows[rightIndex];
      rows[rightIndex] = left[leftIndex - 1] === right[rightIndex - 1]
        ? diagonal + 1
        : Math.max(rows[rightIndex], rows[rightIndex - 1]);
      diagonal = previous;
    }
  }
  return rows[right.length];
}

function closestTranscriptTokenSpan(insight, cues = []) {
  const claimed = evidenceTokens(insight.contextExcerpt).map(token => token.normalized);
  if (claimed.length < 4) return null;
  const claimedStartMs = Math.max(0, Number(insight.startSeconds || 0) * 1_000);
  const claimedEndMs = Math.max(
    claimedStartMs,
    Number(insight.endSeconds || insight.startSeconds || 0) * 1_000
  );
  const nearbyCues = normalizeValorantTranscript(cues)
    .filter(cue => {
      const cueStart = Number(cue.startMs || 0);
      const cueEnd = cueStart + Math.max(1_000, Number(cue.durationMs || 0));
      return cueEnd >= claimedStartMs - 8_000 && cueStart <= claimedEndMs + 8_000;
    })
    .sort((left, right) => Number(left.startMs || 0) - Number(right.startMs || 0));
  const transcriptTokens = nearbyCues.flatMap((cue, cueIndex) => (
    evidenceTokens(cue.text).map(token => ({
      ...token,
      cueIndex,
      startMs: Number(cue.startMs || 0),
      endMs: Number(cue.startMs || 0) + Math.max(1_000, Number(cue.durationMs || 0))
    }))
  ));
  if (transcriptTokens.length < 4) return null;

  const groundedSpan = (start, length) => {
    if (length > MAX_REVIEW_EXCERPT_WORDS) return null;
    const matchedTokens = transcriptTokens.slice(start, start + length);
    const firstToken = matchedTokens[0];
    const lastToken = matchedTokens[matchedTokens.length - 1];
    const contextExcerpt = nearbyCues
      .slice(firstToken.cueIndex, lastToken.cueIndex + 1)
      .map((cue, offset) => {
        const cueIndex = firstToken.cueIndex + offset;
        const cueText = String(cue.text || "");
        const from = cueIndex === firstToken.cueIndex ? firstToken.characterStart : 0;
        const trailingPunctuation = cueIndex === lastToken.cueIndex
          ? String(cueText.slice(lastToken.characterEnd).match(/^[.!?]["')\]]*/)?.[0] || "")
          : "";
        const to = cueIndex === lastToken.cueIndex
          ? lastToken.characterEnd + trailingPunctuation.length
          : cueText.length;
        return cueText.slice(from, to);
      })
      .join(" ");
    return {
      startMs: firstToken.startMs,
      endMs: lastToken.endMs,
      contextExcerpt: normalizeWhitespace(contextExcerpt)
    };
  };
  const exactStart = transcriptTokens.findIndex((_token, start) => (
    start + claimed.length <= transcriptTokens.length
    && claimed.every((token, offset) => transcriptTokens[start + offset].normalized === token)
  ));
  if (exactStart >= 0) return groundedSpan(exactStart, claimed.length);

  let best = null;
  const minimumLength = Math.max(4, claimed.length - 3);
  const maximumLength = Math.min(
    transcriptTokens.length,
    claimed.length + 3,
    MAX_REVIEW_EXCERPT_WORDS
  );
  const tokenFrequency = transcriptTokens.reduce((frequency, token) => {
    frequency.set(token.normalized, Number(frequency.get(token.normalized) || 0) + 1);
    return frequency;
  }, new Map());
  const anchors = claimed
    .slice(0, Math.min(12, claimed.length))
    .map((token, claimedIndex) => ({
      token,
      claimedIndex,
      frequency: Number(tokenFrequency.get(token) || 0)
    }))
    .filter(anchor => anchor.frequency > 0)
    .sort((left, right) => left.frequency - right.frequency || left.claimedIndex - right.claimedIndex)
    .slice(0, 3);
  const anchoredStarts = new Set();
  for (const anchor of anchors) {
    transcriptTokens.forEach((token, transcriptIndex) => {
      if (token.normalized !== anchor.token) return;
      const start = transcriptIndex - anchor.claimedIndex;
      if (start >= 0 && start < transcriptTokens.length) anchoredStarts.add(start);
    });
  }
  const candidateStarts = (anchoredStarts.size
    ? [...anchoredStarts]
    : transcriptTokens.map((_token, index) => index))
    .sort((left, right) => (
      Math.abs(transcriptTokens[left].startMs - claimedStartMs)
      - Math.abs(transcriptTokens[right].startMs - claimedStartMs)
    ))
    .slice(0, 128);
  for (const start of candidateStarts) {
    for (let length = minimumLength; length <= maximumLength && start + length <= transcriptTokens.length; length += 1) {
      const candidate = transcriptTokens
        .slice(start, start + length)
        .map(token => token.normalized);
      const overlap = orderedTokenOverlap(claimed, candidate);
      const score = overlap / Math.max(claimed.length, candidate.length);
      const timestampDistance = Math.abs(transcriptTokens[start].startMs - claimedStartMs);
      if (
        !best
        || score > best.score
        || (score === best.score && timestampDistance < best.timestampDistance)
      ) {
        best = { start, length, overlap, score, timestampDistance };
      }
    }
  }
  const requiredOverlap = Math.max(4, Math.ceil(claimed.length * 0.78));
  if (!best || best.score < 0.78 || best.overlap < requiredOverlap) return null;

  return groundedSpan(best.start, best.length);
}

function groundInsightsAgainstTranscript(insights = [], cues = []) {
  return Object.freeze(insights.map(insight => {
    const grounded = closestTranscriptTokenSpan(insight, cues);
    if (!grounded) return null;
    return Object.freeze({
      ...insight,
      startSeconds: grounded.startMs / 1_000,
      endSeconds: grounded.endMs / 1_000,
      contextExcerpt: grounded.contextExcerpt
    });
  }).filter(Boolean));
}

export async function acquireGeminiYouTubeInsights(source, env = {}, fetchImpl = fetch) {
  const identity = sourceIdentity(source);
  const sourceStartSeconds = Math.max(0, Number(source.startSeconds || 0));
  // A dedicated Gemini key is preferred. A project-level Google API key may
  // also have Generative Language enabled; if it does not, caption analysis
  // continues through the deterministic fallback below.
  const apiKey = String(
    env.GEMINI_API_KEY
    || env.GOOGLE_GENERATIVE_AI_API_KEY
    || ""
  ).trim();
  if (!identity || identity.platform !== "youtube") {
    return Object.freeze({ status: "unsupported", language: "", cues: [], insights: [] });
  }
  if (!apiKey) {
    return Object.freeze({ status: "gemini-not-configured", language: "", cues: [], insights: [] });
  }
  const schema = {
    type: "object",
    additionalProperties: false,
    properties: {
      insights: {
        type: "array",
        maxItems: MAX_VIDEO_INSIGHTS,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            startSeconds: { type: "integer", minimum: 0 },
            endSeconds: { type: "integer", minimum: 0 },
            contextExcerpt: { type: "string" },
            suggestedWording: { type: "string" },
            whyItMatters: { type: "string" },
            selectionReason: { type: "string" },
            type: { type: "string", enum: ["coaching", "statistical"] },
            topic: { type: "string", enum: ["economy", "mechanics", "teamplay", "map-control", "agent", "mentality", "general"] },
            entities: { type: "array", items: { type: "string" } },
            confidence: { type: "string", enum: ["high", "medium", "low"] }
          },
          required: [
            "startSeconds", "endSeconds", "contextExcerpt", "suggestedWording",
            "whyItMatters", "selectionReason", "type", "topic", "entities", "confidence"
          ]
        }
      }
    },
    required: ["insights"]
  };
  const response = await fetchImpl(GEMINI_INTERACTIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
      "Api-Revision": GEMINI_API_REVISION
    },
    body: JSON.stringify({
      model: String(env.KNOWLEDGE_VIDEO_MODEL || DEFAULT_GEMINI_VIDEO_MODEL),
      store: false,
      input: [
        { type: "video", uri: source.url, mime_type: "video/mp4" },
        {
          type: "text",
          text: [
            "Analyze this public Valorant educational video for a private RankedCoach owner-review queue.",
            ...(sourceStartSeconds > 0
              ? [`The owner selected the video from ${sourceStartSeconds} seconds onward. Ignore content and insights that end before that timestamp.`]
              : []),
            `Return no more than ${MAX_VIDEO_INSIGHTS} distinct, actionable coaching or clearly qualified statistical insights.`,
            "Ignore sponsorships, subscriptions, channel promotion, greetings, jokes, outros, and generic filler.",
            "For esports analysis, extract what players do: a repeatable setup, decision, timing, spacing, utility sequence, positioning choice, adaptation, or punish.",
            "Do not extract how a team is doing: standings, season form, roster narratives, qualification, tournament placement, series scores, map scores, or praise/criticism of a team's results.",
            `Anchor every insight to the exact spoken timestamp. contextExcerpt is private reviewer evidence: copy the complete contiguous passage that explains one coaching point, normally 45-${MAX_REVIEW_EXCERPT_WORDS} spoken words and never more than ${MAX_REVIEW_EXCERPT_WORDS}. Do not stop after the first sentence when the speaker continues the same explanation.`,
            "suggestedWording must make the smallest edit needed for accurate Valorant terminology, clarity, and concise player-facing use. Preserve the source meaning and sequence instead of independently restructuring it. Public approval rejects any seven consecutive source words, so the suggestion must not retain a seven-word source sequence verbatim.",
            "whyItMatters should explain the player decision or outcome in one short sentence.",
            "selectionReason must tell the owner which repeatable action and decision-to-outcome link made this passage worth extracting.",
            `Only use these entity names when clearly relevant: ${ENTITY_NAMES.join(", ")}.`,
            "If the video contains no specific useful Valorant instruction, return an empty insights array."
          ].join(" ")
        }
      ],
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema
      },
      generation_config: {
        max_output_tokens: 8_000,
        thinking_level: "low"
      }
    }),
    signal: AbortSignal.timeout(110_000)
  });
  if (!response.ok) {
    return Object.freeze({
      status: response.status === 429 ? "gemini-rate-limited" : "gemini-unavailable",
      language: "",
      cues: [],
      insights: []
    });
  }
  const interaction = await response.json().catch(() => ({}));
  if (interaction.status && interaction.status !== "completed") {
    return Object.freeze({ status: "gemini-incomplete", language: "", cues: [], insights: [] });
  }
  let structured = {};
  try {
    structured = JSON.parse(interactionOutputText(interaction));
  } catch {
    return Object.freeze({ status: "gemini-invalid-output", language: "", cues: [], insights: [] });
  }
  const insights = Object.freeze(
    normalizeGeminiVideoInsights(structured)
      .filter(insight => insight.endSeconds > sourceStartSeconds)
  );
  const cues = insights.map(insight => Object.freeze({
    startMs: Math.round(insight.startSeconds * 1_000),
    durationMs: Math.max(1_000, Math.round((insight.endSeconds - insight.startSeconds) * 1_000)),
    text: insight.contextExcerpt
  }));
  return Object.freeze({
    status: insights.length ? "acquired" : "no-actionable-insights",
    language: "en",
    trackKind: "gemini-public-youtube-video-analysis",
    cues: Object.freeze(cues),
    insights
  });
}

export async function analyzeKnowledgeTranscript(source, cues = [], env = {}, fetchImpl = fetch) {
  const token = String(env.KNOWLEDGE_PIPELINE_TOKEN || "").trim();
  if (!token || !cues.length) {
    return Object.freeze({ status: "analysis-not-configured", insights: [], model: "" });
  }
  const endpoint = String(env.KNOWLEDGE_ANALYSIS_ENDPOINT || DEFAULT_KNOWLEDGE_ANALYSIS_ENDPOINT).trim();
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rankedcoach-pipeline-token": token
      },
      body: JSON.stringify({
        source: {
          id: source.id,
          title: source.title,
          publisher: source.publisher,
          topicType: source.topicType,
          entities: source.entities
        },
        cues
      }),
      signal: AbortSignal.timeout(110_000)
    });
    if (!response.ok) {
      return Object.freeze({
        status: response.status === 429 ? "analysis-rate-limited" : "analysis-unavailable",
        insights: [],
        model: ""
      });
    }
    const payload = await response.json().catch(() => ({}));
    const normalized = normalizeGeminiVideoInsights(payload);
    const insights = groundInsightsAgainstTranscript(normalized, cues);
    return Object.freeze({
      status: insights.length ? "analyzed" : normalized.length ? "analysis-ungrounded" : "no-actionable-insights",
      insights,
      model: normalizeWhitespace(payload.model)
    });
  } catch (_error) {
    return Object.freeze({ status: "analysis-unavailable", insights: [], model: "" });
  }
}

export function parseYouTubeTranscriptPayload(payload = {}) {
  const cues = [];
  for (const event of payload.events || []) {
    if (!Array.isArray(event?.segs)) continue;
    const text = normalizeWhitespace(decodeHtml(event.segs.map(segment => segment?.utf8 || "").join("")));
    if (!text || /^\[(?:music|applause|laughter)\]$/i.test(text)) continue;
    cues.push({
      startMs: Math.max(0, Number(event.tStartMs || 0)),
      durationMs: Math.max(0, Number(event.dDurationMs || 0)),
      text
    });
    if (cues.length >= MAX_TRANSCRIPT_CUES) break;
  }
  return cues;
}

function parseTimedTextXml(value = "") {
  const cues = [];
  for (const match of String(value).matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/gi)) {
    const attributes = match[1];
    const startSeconds = Number(attributes.match(/\bstart="([^"]+)"/i)?.[1] || 0);
    const durationSeconds = Number(attributes.match(/\bdur="([^"]+)"/i)?.[1] || 0);
    const text = normalizeWhitespace(decodeHtml(match[2].replace(/<[^>]+>/g, " ")));
    if (!text) continue;
    cues.push({
      startMs: Math.max(0, Math.round(startSeconds * 1_000)),
      durationMs: Math.max(0, Math.round(durationSeconds * 1_000)),
      text
    });
  }
  return cues;
}

async function fetchYouTubeCaptionTrack(track, fetchImpl = fetch, userAgent = YOUTUBE_ANDROID_USER_AGENT) {
  if (!track?.baseUrl) return Object.freeze({ language: "", trackKind: "", cues: [] });
  const transcriptUrl = new URL(track.baseUrl);
  transcriptUrl.searchParams.set("fmt", "json3");
  const response = await fetchImpl(transcriptUrl, {
    headers: {
      "User-Agent": userAgent,
      "Accept-Language": "en-US,en;q=0.9"
    },
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) return Object.freeze({ language: track.languageCode || "", trackKind: track.kind || "", cues: [] });
  const body = await response.text();
  let cues = [];
  if (body.trim()) {
    try {
      cues = parseYouTubeTranscriptPayload(JSON.parse(body));
    } catch {
      cues = parseTimedTextXml(body);
    }
  }
  return Object.freeze({
    language: track.languageCode || "",
    trackKind: track.kind || "human",
    cues: Object.freeze(cues)
  });
}

export async function acquireYouTubeAndroidTranscript(source, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const identity = sourceIdentity(source);
  if (!identity || identity.platform !== "youtube") {
    return Object.freeze({ status: "unsupported", language: "", cues: [] });
  }
  const apiKey = String(options.apiKey || "").trim();
  const clientVersion = String(options.clientVersion || YOUTUBE_ANDROID_CLIENT_VERSION);
  const endpoint = new URL("https://www.youtube.com/youtubei/v1/player");
  endpoint.searchParams.set("prettyPrint", "false");
  if (apiKey) endpoint.searchParams.set("key", apiKey);
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": YOUTUBE_ANDROID_USER_AGENT,
      "X-Youtube-Client-Name": "3",
      "X-Youtube-Client-Version": clientVersion
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "ANDROID",
          clientVersion,
          androidSdkVersion: 30,
          hl: "en",
          gl: "US"
        }
      },
      videoId: identity.upstreamId
    }),
    signal: AbortSignal.timeout(20_000)
  });
  if (!response.ok) {
    return Object.freeze({ status: "android-player-unavailable", language: "", cues: [] });
  }
  const payload = await response.json().catch(() => ({}));
  const playability = String(payload?.playabilityStatus?.status || "");
  if (playability && playability !== "OK") {
    return Object.freeze({ status: "video-unavailable", language: "", cues: [] });
  }
  const tracks = (payload?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [])
    .filter(track => track?.baseUrl && track?.languageCode)
    .map(track => ({
      baseUrl: String(track.baseUrl),
      languageCode: String(track.languageCode),
      name: normalizeWhitespace(track.name?.simpleText || track.name?.runs?.map(run => run.text).join("") || track.languageCode),
      kind: String(track.kind || ""),
      isTranslatable: Boolean(track.isTranslatable)
    }));
  const track = selectCaptionTrack(tracks);
  if (!track) return Object.freeze({ status: "no-public-transcript", language: "", cues: [] });
  const transcript = await fetchYouTubeCaptionTrack(track, fetchImpl, YOUTUBE_ANDROID_USER_AGENT);
  return Object.freeze({
    status: transcript.cues.length ? "acquired" : "empty-transcript",
    language: transcript.language,
    trackKind: transcript.trackKind === "asr" ? "youtube-auto-caption" : "youtube-caption",
    cues: transcript.cues
  });
}

export async function acquirePublicYouTubeTranscript(source, fetchImpl = fetch) {
  const identity = sourceIdentity(source);
  if (!identity || identity.platform !== "youtube") {
    return Object.freeze({ status: "unsupported", language: "", cues: [] });
  }
  // Public timed-text URLs returned by the normal watch page are frequently
  // empty from server runtimes. The player response supplies the same public
  // caption track and is therefore attempted first, while the watch-page path
  // remains as a compatibility fallback.
  try {
    const androidTranscript = await acquireYouTubeAndroidTranscript(source, { fetchImpl });
    if (androidTranscript.status === "acquired" || androidTranscript.status === "no-public-transcript") {
      return androidTranscript;
    }
  } catch (_error) {
    // Continue through the watch-page compatibility path.
  }
  try {
    const watchResponse = await fetchImpl(`https://www.youtube.com/watch?v=${identity.upstreamId}&hl=en`, {
      headers: {
        "User-Agent": YOUTUBE_BROWSER_USER_AGENT,
        "Accept-Language": "en-US,en;q=0.9"
      },
      signal: AbortSignal.timeout(20_000)
    });
    if (watchResponse.ok) {
      const html = await watchResponse.text();
      const track = selectCaptionTrack(extractYouTubeCaptionTracks(html));
      if (track) {
        const transcript = await fetchYouTubeCaptionTrack(track, fetchImpl, YOUTUBE_BROWSER_USER_AGENT);
        if (transcript.cues.length) {
          return Object.freeze({
            status: "acquired",
            language: transcript.language,
            trackKind: transcript.trackKind || "youtube-caption",
            cues: transcript.cues
          });
        }
      }
    }
  } catch (_error) {
    // The public watch page is frequently bot-gated from data-center IPs.
  }
  return Object.freeze({ status: "transcript-unavailable", language: "", cues: [] });
}

export async function acquireKnowledgeTranscript(source, env = {}, fetchImpl = fetch) {
  const providerEndpoint = String(env.KNOWLEDGE_TRANSCRIPT_ENDPOINT || "").trim();
  if (providerEndpoint) {
    try {
      const response = await fetchImpl(providerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(env.KNOWLEDGE_TRANSCRIPT_TOKEN
            ? { Authorization: `Bearer ${String(env.KNOWLEDGE_TRANSCRIPT_TOKEN)}` }
            : {})
        },
        body: JSON.stringify({
          platform: source.platform,
          videoId: source.upstreamId,
          url: source.url,
          language: "en"
        }),
        signal: AbortSignal.timeout(30_000)
      });
      if (response.ok) {
        const payload = await response.json();
        const cues = normalizeValorantTranscript(Array.isArray(payload?.cues) ? payload.cues : []);
        if (cues.length) {
          return Object.freeze({
            status: "acquired",
            language: String(payload.language || "en"),
            trackKind: "configured-private-provider",
            cues: Object.freeze(cues)
          });
        }
      }
    } catch (_error) {
      // Continue to the public caption path.
    }
  }
  let publicTranscript;
  try {
    publicTranscript = await acquirePublicYouTubeTranscript(source, fetchImpl);
  } catch (_error) {
    publicTranscript = Object.freeze({ status: "transcript-unavailable", language: "", cues: [] });
  }
  if (publicTranscript.status === "acquired") return publicTranscript;
  try {
    const semanticVideo = await acquireGeminiYouTubeInsights(source, env, fetchImpl);
    if (["acquired", "no-actionable-insights"].includes(semanticVideo.status)) return semanticVideo;
  } catch (_error) {
    // Retain the caption failure status so the retry queue can back off.
  }
  return publicTranscript;
}

export function normalizeValorantTranscript(cues = []) {
  return cues.map(cue => {
    let text = normalizeWhitespace(cue.text)
      .replace(/^\s*(?:>>|[-–—])\s*/g, "")
      .replace(/\[(?:music|applause|laughter)\]/gi, " ");
    for (const [pattern, replacement] of TERMINOLOGY) text = text.replace(pattern, replacement);
    return Object.freeze({
      startMs: Math.max(0, Number(cue.startMs || 0)),
      durationMs: Math.max(0, Number(cue.durationMs || 0)),
      text: normalizeWhitespace(text)
    });
  }).filter(cue => cue.text);
}

export function splitTranscriptIntoSections(cues = [], options = {}) {
  const maxDurationMs = Math.max(30_000, Number(options.maxDurationMs || 90_000));
  const maxCharacters = Math.max(300, Number(options.maxCharacters || 1_200));
  const sections = [];
  let current = [];
  let characters = 0;
  const flush = () => {
    if (!current.length) return;
    const first = current[0];
    const last = current[current.length - 1];
    sections.push(Object.freeze({
      index: sections.length,
      startMs: first.startMs,
      endMs: last.startMs + last.durationMs,
      text: normalizeWhitespace(current.map(cue => cue.text).join(" ")),
      cues: Object.freeze(current)
    }));
    current = [];
    characters = 0;
  };
  for (const cue of cues) {
    const nextDuration = current.length ? cue.startMs + cue.durationMs - current[0].startMs : cue.durationMs;
    if (current.length && (nextDuration > maxDurationMs || characters + cue.text.length > maxCharacters)) flush();
    current.push(cue);
    characters += cue.text.length + 1;
  }
  flush();
  return Object.freeze(sections);
}

function sentenceParts(value = "") {
  return String(value)
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map(normalizeWhitespace)
    .filter(Boolean);
}

function boundedTextParts(
  value = "",
  maxCharacters = MAX_CLAIM_SENTENCE_UNIT_CHARACTERS,
  maxWords = MAX_CLAIM_SEGMENT_WORDS
) {
  const parts = [];
  for (const sentence of sentenceParts(value)) {
    const words = sentence.split(" ").filter(Boolean);
    let current = "";
    let currentWords = 0;
    for (const word of words) {
      if (
        current
        && (
          current.length + word.length + 1 > maxCharacters
          || currentWords >= maxWords
        )
      ) {
        parts.push(current);
        current = "";
        currentWords = 0;
      }
      current = current ? `${current} ${word}` : word;
      currentWords += 1;
    }
    if (current) parts.push(current);
  }
  return parts;
}

function approximateSegmentationCues(section = {}) {
  const text = normalizeWhitespace(section.text);
  if (!text) return [];
  const parts = boundedTextParts(text);
  const startMs = Math.max(0, Number(section.startMs || 0));
  const totalDurationMs = Math.max(
    1_000,
    Number(section.endMs || 0) - startMs
  );
  const totalCharacters = Math.max(1, parts.reduce((sum, part) => sum + part.length, 0));
  let elapsedMs = 0;
  return parts.map((part, index) => {
    const remainingMs = Math.max(1, totalDurationMs - elapsedMs);
    const durationMs = index === parts.length - 1
      ? remainingMs
      : Math.max(1, Math.round(totalDurationMs * (part.length / totalCharacters)));
    const cue = {
      startMs: startMs + elapsedMs,
      durationMs,
      text: part
    };
    elapsedMs += durationMs;
    return cue;
  });
}

function claimSentenceUnits(section = {}) {
  const sectionCues = Array.isArray(section.cues) && section.cues.length
    ? section.cues
    : approximateSegmentationCues(section);
  const cues = sectionCues.flatMap(cue => {
    const text = normalizeWhitespace(cue.text);
    const parts = boundedTextParts(text);
    if (parts.length <= 1) return [{ ...cue, text }];
    const durationMs = Math.max(1_000, Number(cue.durationMs || 0));
    const totalCharacters = Math.max(1, parts.reduce((sum, part) => sum + part.length, 0));
    let elapsedMs = 0;
    return parts.map((part, index) => {
      const remainingMs = Math.max(1, durationMs - elapsedMs);
      const partDurationMs = index === parts.length - 1
        ? remainingMs
        : Math.max(1, Math.round(durationMs * (part.length / totalCharacters)));
      const expanded = {
        startMs: Number(cue.startMs || 0) + elapsedMs,
        durationMs: partDurationMs,
        text: part
      };
      elapsedMs += partDurationMs;
      return expanded;
    });
  }).filter(cue => cue.text);
  return cues.map((cue, index) => {
    const previous = cues[index - 1];
    const gapBefore = previous
      ? Number(cue.startMs || 0) - (
        Number(previous.startMs || 0) + Math.max(1_000, Number(previous.durationMs || 0))
      )
      : 0;
    const text = normalizeWhitespace(cue.text);
    return {
      text,
      topic: classifyTopic(text),
      claimType: segmentationClaimType(text),
      startMs: Number(cue.startMs || 0),
      endMs: Number(cue.startMs || 0) + Math.max(1_000, Number(cue.durationMs || 0)),
      breakBefore: index > 0 && gapBefore >= CLAIM_TOPIC_PAUSE_MS
    };
  });
}

function cueAnchoredClaimSegments(section = {}) {
  const units = claimSentenceUnits(section);
  const segments = [];
  let buffer = [];
  let characters = 0;
  let wordCount = 0;
  let activeTopic = "general";
  let activeClaimType = "coaching";
  const flush = () => {
    if (!buffer.length) return;
    const first = buffer[0];
    const last = buffer[buffer.length - 1];
    const text = normalizeWhitespace(buffer.map(unit => unit.text).join(" "));
    if (text) {
      segments.push({
        text,
        startMs: Number(first.startMs || 0),
        endMs: Number(last.endMs || last.startMs || 0)
      });
    }
    buffer = [];
    characters = 0;
    wordCount = 0;
    activeTopic = "general";
    activeClaimType = "coaching";
  };

  const nextSpecificTopic = index => {
    for (let offset = 1; offset <= 2 && index + offset < units.length; offset += 1) {
      const candidate = units[index + offset];
      if (candidate.breakBefore) return "general";
      if (candidate.topic !== "general") return candidate.topic;
    }
    return "general";
  };

  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    const topicChanged = (
      buffer.length
      && activeTopic !== "general"
      && unit.topic !== "general"
      && unit.topic !== activeTopic
      && (
        nextSpecificTopic(index) === unit.topic
        || explicitTopicTransition(unit.text)
      )
    );
    const claimTypeChanged = buffer.length && unit.claimType !== activeClaimType;
    const exceedsLimit = (
      buffer.length
      && (
        characters + unit.text.length + 1 > MAX_CLAIM_SEGMENT_CHARACTERS
        || wordCount + unit.text.split(" ").filter(Boolean).length > MAX_CLAIM_SEGMENT_WORDS
      )
    );
    if (buffer.length && (unit.breakBefore || topicChanged || claimTypeChanged || exceedsLimit)) flush();
    buffer.push(unit);
    characters += unit.text.length + 1;
    wordCount += unit.text.split(" ").filter(Boolean).length;
    if (activeTopic === "general" && unit.topic !== "general") activeTopic = unit.topic;
    activeClaimType = unit.claimType;
  }
  flush();
  return segments;
}

function classifyTopic(text = "") {
  return TOPIC_RULES.find(rule => rule.pattern.test(text))?.id || "general";
}

function statisticalClaimSignal(text = "") {
  return (
    /\b\d+(?:\.\d+)?\s*%/i.test(text)
    || /\b(?:win rate|pick rate|usage rate|damage per round|acs|adr|k\/d|sample size)\b/i.test(text)
    || /\b(?:over|across|sample of)\s+\d+(?:\.\d+)?\s+rounds?\b/i.test(text)
    || /\b\d+(?:\.\d+)?\s+(?:of|out of)\s+\d+(?:\.\d+)?\s+(?:rounds?|games?|matches?)\b/i.test(text)
    || /\b\d+(?:\.\d+)?\s+(?:wins?|losses?|kills?|deaths?|assists?)\s+(?:in|across|over|out of)\s+\d+(?:\.\d+)?\s+(?:rounds?|games?|matches?)\b/i.test(text)
    || /\b(?:dealt|took|averaged?)\s+\d+(?:\.\d+)?\s+damage\b/i.test(text)
    || /\b\d+(?:\.\d+)?\s+damage\b/i.test(text)
  );
}

function classifyClaimType(text = "") {
  return statisticalClaimSignal(text) ? "statistical" : "coaching";
}

function segmentationClaimType(text = "") {
  return classifyClaimType(text);
}

function explicitTopicTransition(text = "") {
  return /^(?:now|next|instead|moving on|for (?:economy|mechanics|teamplay|map control|agents?|mentality)|on (?:economy|mechanics|teamplay|map control|agents?|mentality))\b/i.test(
    normalizeWhitespace(text)
  );
}

function claimStance(text = "") {
  return /\b(?:avoid|don't|do not|never|stop|shouldn't|cannot|can't)\b/i.test(text) ? "discourage" : "encourage";
}

function coachingSignal(text = "") {
  return /\b(?:should|need to|make sure|avoid|always|never|when|if|because|try|focus|treat|use|hold|play|rotate|peek|swing|trade|smoke|flash|plant|retake|entry|anchor|buy|save)\b/i.test(text);
}

function tacticalActionSignal(text = "") {
  return /\b(?:ability|aim|angle|anchor|anti-eco|buy|call|clarity|clear|commit|communicat\w*|contact|contrast|crossfire|crosshair|default|defend|deny|discipline|double[- ]?peek|dpi|drill|economy|entry|execute|fake|flash|flank|focus|fps|gear|hold|info|keyboard|lane|latency|lineup|lur[kc]|mental|monitor|mouse|movement|off[- ]?angle|peek|peripheral|plant|position|practice|pressure|push|reclear|recoil|reset|resolution|retake|review|rotate|routine|save|sensitivity|setting|setup|site|smoke|space|spacing|split|swing|tempo|timing|trade|train|trap|utility|wall|warmup)\b/i.test(text);
}

function esportsResultNarrative(text = "") {
  return /\b(?:champion(?:ship)?|eliminat(?:ed|ion)|finals?|group stage|lost the (?:map|match|series)|map score|match score|playoffs?|qualified|qualifying|record (?:this|in)|roster|season (?:form|record|results?|standings)|series score|standings|tournament (?:placement|result)|won the (?:map|match|series))\b/i.test(text);
}

function selectionReasonForInsight(insight = {}) {
  const entity = (insight.entities || [])[0];
  const scope = entity ? `${entity} ` : "";
  const topic = String(insight.topic || "general").replaceAll("-", " ");
  return `Selected because this passage describes a repeatable ${scope}${topic} decision and connects the action to a gameplay consequence.`;
}

function transferableVideoInsight(insight = {}) {
  const excerpt = normalizeWhitespace(insight.contextExcerpt);
  const wording = normalizeWhitespace(insight.suggestedWording);
  const combined = `${excerpt} ${wording}`;
  if (promotionalTranscriptSegment(combined)) return false;
  if (esportsResultNarrative(excerpt) && !tacticalActionSignal(excerpt)) return false;
  if (insight.type === "statistical") {
    return tacticalActionSignal(excerpt)
      || /\b(?:acs|adr|credits?|damage|headshot|pick rate|round conversion|rounds?|usage rate|win rate)\b/i.test(excerpt);
  }
  return tacticalActionSignal(excerpt) && (coachingSignal(combined) || /\b(?:adapt|counter|punish|respond|sequence)\b/i.test(combined));
}

function promotionalTranscriptSegment(text = "") {
  return /\b(?:subscribe|subscribing|like the video|hit the bell|leave a comment|comment down below|link in the description|sponsor(?:ed)?|use code|thanks? for watching|see you (?:guys )?(?:next|later)|follow me|my channel|on stream)\b/i.test(text);
}

function entityMatches(text = "") {
  return ENTITY_NAMES.filter(name => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace("/", "\\/")}\\b`, "i").test(text));
}

function conceptTokens(text = "") {
  return unique(
    normalizeWhitespace(text)
      .toLowerCase()
      .replace(/[^a-z0-9%/]+/g, " ")
      .split(" ")
      .map(token => ({
        peeking: "peek",
        taking: "take",
        trading: "trade",
        rotating: "rotate",
        swinging: "swing"
      })[token] || token)
      .filter(token => token.length > 2 && !STOP_WORDS.has(token))
  );
}

function jaccard(left = [], right = []) {
  const a = new Set(left);
  const b = new Set(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter(token => b.has(token)).length;
  return intersection / (a.size + b.size - intersection);
}

function evidenceUrl(source, startSeconds) {
  if (source.platform !== "youtube") return source.url;
  const url = new URL(source.url);
  if (startSeconds > 0) url.searchParams.set("t", `${Math.floor(startSeconds)}s`);
  return url.toString();
}

function transcriptTimestampMs(value = "") {
  const parts = String(value || "").trim().replace(",", ".").split(":").map(Number);
  if (!parts.length || parts.some(part => !Number.isFinite(part))) return null;
  if (parts.length === 2) return Math.round(((parts[0] * 60) + parts[1]) * 1000);
  if (parts.length === 3) return Math.round(((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000);
  return null;
}

export function parseTimestampedTranscript(input = "") {
  if (Array.isArray(input)) {
    return normalizeValorantTranscript(input.map(cue => ({
      startMs: Number(cue?.startMs ?? cue?.offsetMs ?? 0),
      durationMs: Number(cue?.durationMs ?? Math.max(1_000, Number(cue?.endMs || 0) - Number(cue?.startMs || 0))),
      text: cue?.text || cue?.content || ""
    })));
  }
  const lines = String(input || "").replace(/\r/g, "").split("\n");
  const cues = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line || /^WEBVTT$/i.test(line) || /^\d+$/.test(line)) continue;
    const range = line.match(/^(\d{1,2}:\d{2}(?::\d{2})?[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?[,.]\d{1,3})/);
    if (range) {
      const startMs = transcriptTimestampMs(range[1]);
      const endMs = transcriptTimestampMs(range[2]);
      const textLines = [];
      while (index + 1 < lines.length && lines[index + 1].trim()) {
        if (lines[index + 1].includes("-->")) break;
        textLines.push(lines[index + 1].trim());
        index += 1;
      }
      if (startMs != null && endMs != null && textLines.length) {
        cues.push({ startMs, durationMs: Math.max(1_000, endMs - startMs), text: textLines.join(" ") });
      }
      continue;
    }
    const stamped = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?(?:[,.]\d{1,3})?)\]?\s+(.+)$/);
    if (stamped) {
      const startMs = transcriptTimestampMs(stamped[1]);
      if (startMs != null) cues.push({ startMs, durationMs: 4_000, text: stamped[2] });
    }
  }
  cues.sort((left, right) => left.startMs - right.startMs);
  return normalizeValorantTranscript(cues);
}

export function extractStructuredClaims(source, sections = []) {
  const claims = [];
  for (const section of sections) {
    for (const segment of cueAnchoredClaimSegments(section)) {
      const clean = normalizeWhitespace(segment.text);
      const type = classifyClaimType(clean);
      if (
        clean.length >= 28
        && clean.length <= MAX_CLAIM_SEGMENT_CHARACTERS
        && !promotionalTranscriptSegment(clean)
        && (!esportsResultNarrative(clean) || tacticalActionSignal(clean))
        && (coachingSignal(clean) || type === "statistical")
      ) {
        const topic = classifyTopic(clean);
        const entities = entityMatches(clean);
        const tokens = conceptTokens(clean);
        const startSeconds = Math.max(0, Number(segment.startMs || 0) / 1000);
        const endSeconds = Math.max(startSeconds, Number(segment.endMs || segment.startMs || 0) / 1000);
        const conceptKey = `${type}:${topic}:${entities.map(slug).sort().join(",")}:${fingerprint(tokens.sort().join(" "))}`;
        claims.push(Object.freeze({
          schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
          id: `${source.id}-${fingerprint(`${segment.startMs}:${clean}`)}`,
          sourceId: source.id,
          sourcePublisher: source.publisherKey,
          sourceKind: source.sourceKind,
          type,
          topic,
          entities: Object.freeze(entities),
          stance: claimStance(clean),
          conceptKey,
          tokens: Object.freeze(tokens),
          startSeconds,
          endSeconds,
          evidenceUrl: evidenceUrl(source, startSeconds),
          // Excerpts are stored only under the private claim prefix. Review
          // reports and approval records deliberately omit transcript wording.
          privateExcerpt: clean,
          selectionReason: selectionReasonForInsight({ type, topic, entities })
        }));
      }
    }
  }
  const scored = claims
    .map(claim => {
      const text = claim.privateExcerpt;
      const actionSignals = (text.match(/\b(?:use|hold|avoid|trade|peek|swing|rotate|smoke|flash|plant|retake|buy|save|position|crosshair|sensitivity|utility)\b/gi) || []).length;
      const score = (
        Math.min(5, actionSignals) * 3
        + Math.min(3, claim.entities.length) * 2
        + (/\b(?:because|so that|instead|before|after|when|if)\b/i.test(text) ? 2 : 0)
        + (text.length >= 55 && text.length <= MAX_CLAIM_SEGMENT_CHARACTERS ? 2 : 0)
        - (claim.type === "statistical" ? 1 : 0)
        - (/\b(?:i think|i guess|maybe|kind of|sort of|you know)\b/i.test(text) ? 2 : 0)
      );
      return { claim, score };
    })
    .sort((left, right) => right.score - left.score || left.claim.startSeconds - right.claim.startSeconds);
  const selected = [];
  for (const candidate of scored) {
    if (selected.some(existing => (
      existing.type === candidate.claim.type
      && existing.topic === candidate.claim.topic
      && jaccard(existing.tokens, candidate.claim.tokens) >= 0.8
    ))) continue;
    selected.push(candidate.claim);
    if (selected.length >= MAX_FALLBACK_CLAIMS_PER_SOURCE) break;
  }
  selected.sort((left, right) => left.startSeconds - right.startSeconds);
  return Object.freeze(selected);
}

function claimsFromVideoInsights(source, insights = []) {
  return Object.freeze(insights.filter(transferableVideoInsight).map(insight => {
    const text = normalizeWhitespace(`${insight.contextExcerpt} ${insight.suggestedWording}`);
    const tokens = conceptTokens(text);
    const entities = unique([...(insight.entities || []), ...entityMatches(text)]);
    const startSeconds = Math.max(0, Number(insight.startSeconds || 0));
    const endSeconds = Math.max(startSeconds, Number(insight.endSeconds || startSeconds));
    const conceptKey = `${insight.type}:${insight.topic}:${entities.map(slug).sort().join(",")}:${fingerprint(tokens.sort().join(" "))}`;
    return Object.freeze({
      schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
      id: `${source.id}-${fingerprint(`${startSeconds}:${text}`)}`,
      sourceId: source.id,
      sourcePublisher: source.publisherKey,
      sourceKind: source.sourceKind,
      type: insight.type,
      topic: insight.topic,
      entities: Object.freeze(entities),
      stance: claimStance(insight.suggestedWording),
      conceptKey,
      tokens: Object.freeze(tokens),
      startSeconds,
      endSeconds,
      evidenceUrl: evidenceUrl(source, startSeconds),
      privateExcerpt: insight.contextExcerpt,
      suggestedWording: insight.suggestedWording,
      whyItMatters: insight.whyItMatters,
      selectionReason: insight.selectionReason || selectionReasonForInsight(insight),
      confidence: insight.confidence,
      extractionKind: "semantic-video-analysis"
    });
  }));
}

function numericValues(text = "") {
  return [...String(text).matchAll(/\b(\d+(?:\.\d+)?)\s*(%|credits?|seconds?|rounds?)?\b/gi)]
    .map(match => ({ value: Number(match[1]), unit: String(match[2] || "number").toLowerCase() }));
}

function numericConflict(left, right) {
  if (left.type !== "statistical" || right.type !== "statistical") return false;
  const leftValues = numericValues(left.privateExcerpt);
  const rightValues = numericValues(right.privateExcerpt);
  return leftValues.some(a => rightValues.some(b => (
    a.unit === b.unit
    && Math.abs(a.value - b.value) > Math.max(1, Math.min(a.value, b.value) * 0.08)
  )));
}

function claimSimilarity(left, right) {
  if (left.type !== right.type || left.topic !== right.topic) return 0;
  const sharedEntities = left.entities.length && right.entities.length
    ? left.entities.some(entity => right.entities.includes(entity))
    : true;
  return sharedEntities ? jaccard(left.tokens, right.tokens) : 0;
}

function conceptIdentityForClaim(claim = {}) {
  const entities = [...(claim.entities || [])].map(slug).sort().join(",");
  const tokens = [...(claim.tokens || [])].sort().join(" ");
  const canonicalSeed = `${claim.type}:${claim.topic}:${entities}:${tokens}`;
  const legacyConceptKey = `${claim.type}:${claim.topic}:${entities}:${legacyFingerprint32(tokens)}`;
  return Object.freeze({
    id: `concept-${fingerprint(canonicalSeed)}`,
    legacyIds: Object.freeze(unique([
      claim.conceptKey ? `concept-${legacyFingerprint32(claim.conceptKey)}` : "",
      `concept-${legacyFingerprint32(legacyConceptKey)}`
    ]))
  });
}

export function buildKnowledgeConsensus(claimDocuments = []) {
  const claims = claimDocuments
    .flatMap(document => document.claims || [])
    .filter(claim => transferableVideoInsight({
      contextExcerpt: claim.privateExcerpt,
      suggestedWording: claim.suggestedWording || claim.privateExcerpt,
      type: claim.type,
      topic: claim.topic,
      entities: claim.entities
    }));
  const clusters = [];
  const exactConcepts = new Map();
  const tokenBuckets = new Map();
  for (const claim of claims) {
    let cluster = exactConcepts.has(claim.conceptKey)
      ? clusters[exactConcepts.get(claim.conceptKey)]
      : null;
    if (!cluster) {
      const bucketKeys = (claim.tokens || [])
        .map(token => `${claim.type}:${claim.topic}:${token}`)
        .sort((left, right) => (tokenBuckets.get(left)?.size || 0) - (tokenBuckets.get(right)?.size || 0))
        .slice(0, 4);
      const candidateIndexes = new Set(bucketKeys.flatMap(key => [...(tokenBuckets.get(key) || [])]));
      cluster = [...candidateIndexes]
        .map(index => clusters[index])
        .find(candidate => (
          candidate?.type === claim.type
          && candidate.claims.some(existing => claimSimilarity(existing, claim) >= 0.72)
        ));
    }
    if (cluster) {
      cluster.claims.push(claim);
      cluster.conceptKeys.add(claim.conceptKey);
      const identity = conceptIdentityForClaim(claim);
      if (identity.id !== cluster.id) cluster.legacyIds.add(identity.id);
      for (const legacyId of identity.legacyIds) cluster.legacyIds.add(legacyId);
    } else {
      const identity = conceptIdentityForClaim(claim);
      cluster = {
        index: clusters.length,
        id: identity.id,
        legacyIds: new Set(identity.legacyIds),
        type: claim.type,
        topic: claim.topic,
        claims: [claim],
        conceptKeys: new Set([claim.conceptKey])
      };
      clusters.push(cluster);
    }
    const clusterIndex = cluster.index;
    exactConcepts.set(claim.conceptKey, clusterIndex);
    for (const token of claim.tokens || []) {
      const key = `${claim.type}:${claim.topic}:${token}`;
      if (!tokenBuckets.has(key)) tokenBuckets.set(key, new Set());
      tokenBuckets.get(key).add(clusterIndex);
    }
  }

  const concepts = clusters.map(cluster => {
    const publishers = unique(cluster.claims.map(claim => claim.sourcePublisher));
    const contradictions = [];
    for (let leftIndex = 0; leftIndex < cluster.claims.length; leftIndex += 1) {
      for (let rightIndex = leftIndex + 1; rightIndex < cluster.claims.length; rightIndex += 1) {
        const left = cluster.claims[leftIndex];
        const right = cluster.claims[rightIndex];
        if (
          left.sourcePublisher !== right.sourcePublisher
          && (left.stance !== right.stance || numericConflict(left, right))
        ) {
          contradictions.push(Object.freeze({
            leftClaimId: left.id,
            rightClaimId: right.id,
            reason: left.stance !== right.stance ? "opposing coaching direction" : "incompatible numerical values"
          }));
        }
      }
    }
    const state = contradictions.length
      ? "conflicted"
      : publishers.length >= 2
        ? "corroborated"
        : "single-source";
    const confidenceBand = state === "corroborated" && publishers.length >= 3
      ? "strong"
      : state === "corroborated"
        ? "supported"
        : state === "conflicted"
          ? "conflict-review"
          : "limited";
    return Object.freeze({
      id: cluster.id,
      legacyIds: Object.freeze([...cluster.legacyIds]),
      type: cluster.type,
      topic: cluster.topic,
      state,
      confidenceBand,
      publishers: Object.freeze(publishers),
      sourceCount: unique(cluster.claims.map(claim => claim.sourceId)).length,
      entities: Object.freeze(unique(cluster.claims.flatMap(claim => claim.entities))),
      suggestedWording: cluster.claims.find(claim => claim.suggestedWording)?.suggestedWording || null,
      whyItMatters: cluster.claims.find(claim => claim.whyItMatters)?.whyItMatters || null,
      selectionReason: cluster.claims.find(claim => claim.selectionReason)?.selectionReason
        || selectionReasonForInsight(cluster.claims[0]),
      claimIds: Object.freeze(cluster.claims.map(claim => claim.id)),
      evidence: Object.freeze(cluster.claims.map(claim => Object.freeze({
        sourceId: claim.sourceId,
        startSeconds: claim.startSeconds,
        endSeconds: claim.endSeconds,
        url: claim.evidenceUrl
      }))),
      contradictions: Object.freeze(contradictions)
    });
  });

  return Object.freeze({
    statistical: Object.freeze(concepts.filter(concept => concept.type === "statistical")),
    coaching: Object.freeze(concepts.filter(concept => concept.type === "coaching"))
  });
}

export function createKnowledgeIndex(claimDocuments = []) {
  return Object.freeze(claimDocuments.flatMap(document => (
    (document.claims || []).map(claim => Object.freeze({
      id: claim.id,
      type: claim.type,
      topic: claim.topic,
      entities: Object.freeze([...(claim.entities || [])]),
      stance: claim.stance,
      tokens: Object.freeze([...(claim.tokens || [])]),
      sourceId: claim.sourceId,
      evidenceUrl: claim.evidenceUrl
    }))
  )));
}

function compareConceptToLibrary(concept, claimById, libraryIndex = []) {
  const claims = concept.claimIds.map(id => claimById.get(id)).filter(Boolean);
  const matches = [];
  for (const claim of claims) {
    for (const existing of libraryIndex) {
      const similarity = claimSimilarity(claim, existing);
      if (similarity < 0.72) continue;
      matches.push({
        fieldClaimId: existing.id,
        sourceId: existing.sourceId,
        evidenceUrl: existing.evidenceUrl,
        relationship: claim.stance === existing.stance ? "duplicate" : "conflict",
        similarity
      });
    }
  }
  matches.sort((left, right) => right.similarity - left.similarity);
  const uniqueMatches = [];
  for (const match of matches) {
    if (!uniqueMatches.some(existing => existing.fieldClaimId === match.fieldClaimId && existing.relationship === match.relationship)) {
      uniqueMatches.push(match);
    }
  }
  const relationship = uniqueMatches.some(match => match.relationship === "conflict")
    ? "conflicts-with-library"
    : uniqueMatches.length
      ? "duplicates-library"
      : "new-opportunity";
  return Object.freeze({
    relationship,
    matches: Object.freeze(uniqueMatches.slice(0, 8).map(match => Object.freeze({
      fieldClaimId: match.fieldClaimId,
      sourceId: match.sourceId,
      evidenceUrl: match.evidenceUrl,
      relationship: match.relationship
    })))
  });
}

function proposalFromConcept(concept, createdAt, libraryComparison) {
  const recommendation = libraryComparison.relationship === "conflicts-with-library"
    ? "Resolve the conflict with the current Library field before drafting player-facing guidance."
    : libraryComparison.relationship === "duplicates-library"
      ? "Merge this evidence into the existing Library concept instead of adding duplicate wording."
      : concept.state === "corroborated"
        ? "Draft original RankedCoach guidance from the repeated principle."
        : concept.state === "conflicted"
          ? "Resolve the conflicting source advice before drafting player-facing guidance."
          : "Keep this claim held or explicitly qualified until another independent source supports it.";
  return Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: `proposal-${concept.id}`,
    conceptId: concept.id,
    legacyProposalIds: Object.freeze((concept.legacyIds || []).map(id => `proposal-${id}`)),
    type: concept.type,
    topic: concept.topic,
    entities: concept.entities,
    state: concept.state,
    confidenceBand: concept.confidenceBand,
    claimIds: concept.claimIds,
    evidence: concept.evidence,
    contradictions: concept.contradictions,
    libraryComparison,
    recommendation,
    suggestedWording: concept.suggestedWording || null,
    whyItMatters: concept.whyItMatters || null,
    selectionReason: concept.selectionReason || null,
    rankedCoachWording: null,
    approvalStatus: "pending-owner-approval",
    createdAt
  });
}

export function buildKnowledgeReview(consensus, options = {}) {
  const createdAt = nowIso(options.now || new Date());
  const concepts = [...(consensus.statistical || []), ...(consensus.coaching || [])];
  const claimById = new Map((options.claimDocuments || []).flatMap(document => document.claims || []).map(claim => [claim.id, claim]));
  const proposals = concepts.map(concept => proposalFromConcept(
    concept,
    createdAt,
    compareConceptToLibrary(concept, claimById, options.libraryKnowledgeIndex || [])
  ));
  const summary = Object.freeze({
    statisticalConcepts: consensus.statistical?.length || 0,
    coachingConcepts: consensus.coaching?.length || 0,
    corroborated: concepts.filter(concept => concept.state === "corroborated").length,
    singleSource: concepts.filter(concept => concept.state === "single-source").length,
    conflicts: concepts.filter(concept => concept.state === "conflicted").length,
    libraryDuplicates: proposals.filter(proposal => proposal.libraryComparison.relationship === "duplicates-library").length,
    libraryConflicts: proposals.filter(proposal => proposal.libraryComparison.relationship === "conflicts-with-library").length,
    newOpportunities: proposals.filter(proposal => proposal.libraryComparison.relationship === "new-opportunity").length,
    pendingApproval: proposals.length,
    rejected: 0,
    published: 0
  });
  return Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: `review-${createdAt.replace(/[^0-9]/g, "")}`,
    createdAt,
    status: "review-required",
    summary,
    libraryAudit: options.libraryAudit || null,
    proposals: Object.freeze(proposals),
    publicationRule: "Proposals are not published automatically. Owner-approved original RankedCoach wording is required."
  });
}

async function collectClaimDocuments(kv, options = {}) {
  const registry = options.registry || await readSourceRegistry(kv);
  const eligibleSourceIds = new Set(
    registry
      .filter(source => source.researchEligible !== false)
      .map(source => source.id)
  );
  const keys = new Set(await listKvKeys(kv, PRIVATE_CLAIMS_PREFIX));
  for (const sourceId of options.directSourceIds || []) {
    if (sourceId) keys.add(`${PRIVATE_CLAIMS_PREFIX}${sourceId}`);
  }
  const documentsBySource = new Map();
  const keyList = [...keys];
  for (let offset = 0; offset < keyList.length; offset += 24) {
    const batch = await Promise.all(keyList.slice(offset, offset + 24).map(key => kv.get(key, "json")));
    for (const document of batch) {
      const sourceId = String(document?.source?.id || "");
      if (sourceId && eligibleSourceIds.has(sourceId) && Array.isArray(document.claims)) {
        documentsBySource.set(sourceId, document);
      }
    }
  }
  for (const [sourceId, document] of options.overlayDocuments || []) {
    if (eligibleSourceIds.has(sourceId) && Array.isArray(document?.claims)) {
      documentsBySource.set(sourceId, document);
    }
  }
  return [...documentsBySource.values()];
}

function activeReviewDirty(record) {
  return Boolean(record?.generationId && record.status === "pending");
}

async function markReviewDirty(kv, input = {}) {
  const existing = await kv.get(REVIEW_DIRTY_KEY, "json");
  const generationId = input.generationId
    || existing?.generationId
    || `generation-${fingerprint(`${input.startedAt || nowIso()}:${Math.random()}`)}`;
  const record = {
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    generationId,
    status: "pending",
    startedAt: input.startedAt || existing?.startedAt || nowIso(),
    plannedSourceIds: unique([
      ...(existing?.plannedSourceIds || []),
      ...(input.plannedSourceIds || [])
    ]),
    changedSourceIds: unique([
      ...(existing?.changedSourceIds || []),
      ...(input.changedSourceIds || [])
    ]),
    reason: normalizeWhitespace(input.reason || existing?.reason || "knowledge-review-rebuild")
  };
  await kv.put(REVIEW_DIRTY_KEY, JSON.stringify(record));
  return record;
}

async function clearReviewDirty(kv, generationId, completedAt = nowIso()) {
  const current = await kv.get(REVIEW_DIRTY_KEY, "json");
  if (!current || current.generationId !== generationId) return;
  if (typeof kv.delete === "function") {
    await kv.delete(REVIEW_DIRTY_KEY);
    return;
  }
  await kv.put(REVIEW_DIRTY_KEY, JSON.stringify({
    ...current,
    status: "completed",
    completedAt
  }));
}

function reviewProposalIndex(review = {}) {
  if (Array.isArray(review?.proposalIndex)) return review.proposalIndex;
  return (review?.proposals || []).map(proposal => ({
    id: proposal.id,
    approvalStatus: proposal.approvalStatus || "pending-owner-approval",
    analysisFingerprint: proposalAnalysisFingerprint(proposal),
    legacyProposalIds: [...(proposal.legacyProposalIds || [])]
  }));
}

function proposalAnalysisFingerprint(proposal = {}) {
  const evidence = [...(proposal.evidence || [])]
    .map(item => ({
      sourceId: String(item.sourceId || ""),
      startSeconds: Number(item.startSeconds || 0),
      endSeconds: Number(item.endSeconds || 0),
      url: String(item.url || "")
    }))
    .sort((left, right) => (
      left.sourceId.localeCompare(right.sourceId)
      || left.startSeconds - right.startSeconds
      || left.endSeconds - right.endSeconds
    ));
  return fingerprint(JSON.stringify({
    type: proposal.type || "coaching",
    topic: proposal.topic || "general",
    entities: [...(proposal.entities || [])].sort(),
    state: proposal.state || "single-source",
    confidenceBand: proposal.confidenceBand || "limited",
    claimIds: [...(proposal.claimIds || [])].sort(),
    evidence,
    contradictions: [...(proposal.contradictions || [])]
      .map(item => ({
        leftClaimId: item.leftClaimId || "",
        rightClaimId: item.rightClaimId || "",
        reason: item.reason || ""
      }))
      .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right))),
    libraryComparison: proposal.libraryComparison || null,
    recommendation: proposal.recommendation || "",
    suggestedWording: proposal.suggestedWording || "",
    whyItMatters: proposal.whyItMatters || "",
    selectionReason: proposal.selectionReason || "",
    orphanedPublication: proposal.orphanedPublication === true
  }));
}

function proposalCanRemainPublished(proposal = {}) {
  if (proposal.orphanedPublication === true || proposal.state === "evidence-removed") return false;
  if (
    proposal.state === "conflicted"
    || proposal.libraryComparison?.relationship === "conflicts-with-library"
  ) return false;
  return proposal.type !== "statistical" || proposal.state === "corroborated";
}

function publicationHoldReason(proposal = {}) {
  if (proposal.orphanedPublication === true || proposal.state === "evidence-removed") {
    return "supporting-evidence-removed";
  }
  if (proposal.state === "conflicted") return "source-conflict";
  if (proposal.libraryComparison?.relationship === "conflicts-with-library") return "library-conflict";
  if (proposal.type === "statistical" && proposal.state !== "corroborated") {
    return "statistical-corroboration-lost";
  }
  return "";
}

function orphanProposalFromPublication(item = {}, createdAt = nowIso()) {
  const id = String(item.proposalId || item.id || "");
  return {
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id,
    conceptId: String(item.conceptId || id.replace(/^proposal-/, "")),
    legacyProposalIds: [],
    type: item.type === "statistical" ? "statistical" : "coaching",
    topic: normalizeWhitespace(item.topic || "general"),
    entities: Object.freeze((item.entities || []).map(normalizeWhitespace).filter(Boolean)),
    state: "evidence-removed",
    confidenceBand: "unverified",
    claimIds: Object.freeze([]),
    evidence: Object.freeze([...(item.evidence || [])]),
    contradictions: Object.freeze([]),
    libraryComparison: Object.freeze({ relationship: "evidence-removed", matches: Object.freeze([]) }),
    recommendation: "Supporting transcript evidence no longer appears in the current research set. Remove this update or re-approve it from fresh evidence.",
    suggestedWording: null,
    whyItMatters: "This published guidance no longer has a current transcript-derived concept behind it.",
    rankedCoachWording: normalizeWhitespace(item.wording),
    approvalStatus: "published",
    publishedAt: item.publishedAt || null,
    publishedCategory: item.category || "general",
    publishedEntity: item.entity || "",
    publicationNeedsReview: true,
    publicationHoldReason: "supporting-evidence-removed",
    orphanedPublication: true,
    createdAt
  };
}

function mergeProposalDecision(proposal, previous, analysisUpdatedAt) {
  if (!["draft", "approved", "published", "rejected"].includes(previous?.approvalStatus)) return proposal;
  const publicationNeedsReview = previous.approvalStatus === "published" && (
    previous.publicationNeedsReview === true
    || !proposalCanRemainPublished(proposal)
  );
  return {
    ...proposal,
    rankedCoachWording: previous.rankedCoachWording || proposal.rankedCoachWording,
    approvalStatus: previous.approvalStatus,
    draftSavedAt: previous.draftSavedAt || null,
    draftSavedBy: previous.draftSavedBy || null,
    approvedAt: previous.approvedAt || null,
    approvedBy: previous.approvedBy || null,
    rejectedAt: previous.rejectedAt || null,
    rejectedBy: previous.rejectedBy || null,
    rejectionReason: previous.rejectionReason || null,
    publishedAt: previous.publishedAt || null,
    publishedCategory: previous.publishedCategory || null,
    publishedEntity: previous.publishedEntity || null,
    unpublishedAt: previous.unpublishedAt || null,
    analysisUpdatedAt,
    publicationNeedsReview,
    publicationHoldReason: publicationNeedsReview
      ? previous.publicationHoldReason || publicationHoldReason(proposal)
      : ""
  };
}

async function persistKnowledgeReview(kv, review, consensus, options = {}) {
  await kv.put(`${PRIVATE_CONSENSUS_PREFIX}${review.id}`, JSON.stringify({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    reviewId: review.id,
    statisticalConcepts: consensus.statistical?.length || 0,
    coachingConcepts: consensus.coaching?.length || 0,
    storedAs: "per-proposal-private-records"
  }));
  const [previousReview, publishedIndex] = await Promise.all([
    kv.get(LATEST_REVIEW_KEY, "json"),
    kv.get(PUBLISHED_INDEX_KEY, "json")
  ]);
  const previousIndex = new Map();
  for (const item of reviewProposalIndex(previousReview)) {
    previousIndex.set(item.id, item);
    for (const legacyId of item.legacyProposalIds || []) {
      if (!previousIndex.has(legacyId)) previousIndex.set(legacyId, item);
    }
  }
  const freshProposals = [...review.proposals];
  const freshById = new Map();
  for (const proposal of freshProposals) {
    freshById.set(proposal.id, proposal);
    for (const legacyId of proposal.legacyProposalIds || []) freshById.set(legacyId, proposal);
  }
  const resolveFreshProposal = itemId => {
    if (freshById.has(itemId)) return freshById.get(itemId);
    const previous = previousIndex.get(itemId);
    return unique([previous?.id, ...(previous?.legacyProposalIds || [])])
      .map(id => freshById.get(id))
      .find(Boolean);
  };
  const publishedItems = Array.isArray(publishedIndex?.items) ? publishedIndex.items : [];
  const orphanProposals = publishedItems
    .filter(item => !resolveFreshProposal(String(item.proposalId || item.id || "")))
    .map(item => orphanProposalFromPublication(item, review.createdAt));
  const proposals = [...freshProposals, ...orphanProposals];
  const proposalIndex = new Array(proposals.length);
  let cursor = 0;
  const persistWorker = async () => {
    while (cursor < proposals.length) {
      const index = cursor;
      cursor += 1;
      const proposal = proposals[index];
      const candidateIds = unique([proposal.id, ...(proposal.legacyProposalIds || [])]);
      const previousEntry = candidateIds.map(id => previousIndex.get(id)).find(Boolean);
      const analysisFingerprint = proposalAnalysisFingerprint(proposal);
      const analyticallyChanged = (
        !previousEntry
        || previousEntry.id !== proposal.id
        || previousEntry.analysisFingerprint !== analysisFingerprint
      );
      if (!analyticallyChanged) {
        proposalIndex[index] = {
          id: proposal.id,
          approvalStatus: previousEntry.approvalStatus || "pending-owner-approval",
          analysisFingerprint,
          legacyProposalIds: [...(proposal.legacyProposalIds || [])]
        };
        continue;
      }
      const key = `${PROPOSAL_PREFIX}${proposal.id}`;
      const previousId = previousEntry?.id || proposal.id;
      const previous = await kv.get(`${PROPOSAL_PREFIX}${previousId}`, "json");
      const merged = mergeProposalDecision(proposal, previous, review.createdAt);
      await kv.put(key, JSON.stringify(merged));
      if (previousId !== proposal.id) {
        const approval = await kv.get(`${APPROVAL_PREFIX}${previousId}`, "json");
        if (approval) {
          await kv.put(`${APPROVAL_PREFIX}${proposal.id}`, JSON.stringify({
            ...approval,
            proposalId: proposal.id,
            migratedFromProposalId: previousId
          }));
        }
      }
      proposalIndex[index] = {
        id: proposal.id,
        approvalStatus: merged.approvalStatus,
        analysisFingerprint,
        legacyProposalIds: [...(proposal.legacyProposalIds || [])]
      };
    }
  };
  await Promise.all(Array.from(
    { length: Math.min(8, Math.max(1, proposals.length)) },
    () => persistWorker()
  ));
  const reconciledPublished = new Map();
  for (const item of publishedItems) {
    const itemId = String(item.proposalId || item.id || "");
    const proposal = resolveFreshProposal(itemId);
    if (!proposal) {
      const held = {
        ...item,
        status: "held-for-review",
        holdReason: "supporting-evidence-removed",
        heldAt: review.createdAt
      };
      reconciledPublished.set(itemId, held);
      await kv.put(`${PUBLISHED_PREFIX}${itemId}`, JSON.stringify(held));
      continue;
    }
    const valid = proposalCanRemainPublished(proposal);
    const wasAlreadyHeld = item.status !== "published";
    const status = valid && !wasAlreadyHeld ? "published" : "held-for-review";
    const migrated = {
      ...item,
      id: proposal.id,
      proposalId: proposal.id,
      conceptId: proposal.conceptId,
      type: proposal.type,
      topic: proposal.topic,
      entities: [...(proposal.entities || [])],
      evidence: [...(proposal.evidence || [])],
      status,
      holdReason: status === "published"
        ? ""
        : item.holdReason || publicationHoldReason(proposal) || "owner-reapproval-required",
      ...(status === "published" ? {} : { heldAt: item.heldAt || review.createdAt })
    };
    reconciledPublished.set(proposal.id, migrated);
    await kv.put(`${PUBLISHED_PREFIX}${proposal.id}`, JSON.stringify(migrated));
  }
  if (publishedItems.length) {
    await kv.put(PUBLISHED_INDEX_KEY, JSON.stringify({
      schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
      updatedAt: review.createdAt,
      items: [...reconciledPublished.values()]
    }));
  }
  const { proposals: _proposals, ...reviewWithoutProposals } = review;
  const persistedReview = {
    ...reviewWithoutProposals,
    summary: {
      ...review.summary,
      pendingApproval: proposalIndex.filter(item => item.approvalStatus === "pending-owner-approval").length,
      rejected: proposalIndex.filter(item => item.approvalStatus === "rejected").length,
      published: proposalIndex.filter(item => item.approvalStatus === "published").length
    },
    proposalCount: proposalIndex.length,
    proposalIndex
  };
  await kv.put(`${REVIEW_PREFIX}${review.id}`, JSON.stringify(persistedReview));
  await kv.put(LATEST_REVIEW_KEY, JSON.stringify(persistedReview));
  return persistedReview;
}

async function updateLatestReviewProposal(kv, proposal) {
  const review = await kv.get(LATEST_REVIEW_KEY, "json");
  const proposalIndex = reviewProposalIndex(review);
  if (!proposalIndex.length) return;
  const updatedIndex = proposalIndex.map(item => (
    item.id === proposal.id
      ? { ...item, id: proposal.id, approvalStatus: proposal.approvalStatus }
      : item
  ));
  const { proposals: _proposals, ...reviewWithoutProposals } = review;
  const updated = {
    ...reviewWithoutProposals,
    summary: {
      ...review.summary,
      pendingApproval: updatedIndex.filter(item => item.approvalStatus === "pending-owner-approval").length,
      rejected: updatedIndex.filter(item => item.approvalStatus === "rejected").length,
      published: updatedIndex.filter(item => item.approvalStatus === "published").length
    },
    proposalCount: updatedIndex.length,
    proposalIndex: updatedIndex
  };
  await kv.put(`${REVIEW_PREFIX}${review.id}`, JSON.stringify(updated));
  await kv.put(LATEST_REVIEW_KEY, JSON.stringify(updated));
}

export async function ingestTimestampedKnowledgeTranscript(kv, input = {}, options = {}) {
  if (!kv) throw new Error("CONTENT_AUTOMATION KV is not configured.");
  const now = options.now || new Date();
  const [source] = await registerKnowledgeSources(kv, [{
    ...(input.source || {}),
    researchEligible: true,
    sourceKind: input.source?.sourceKind || "owner-imported-educational-video"
  }], now);
  if (!source || source.researchEligible === false) {
    throw new Error("A valid educational YouTube or Twitch source is required.");
  }
  const cues = parseTimestampedTranscript(input.cues || input.transcript || "");
  if (!cues.length) {
    throw new Error("A timestamped transcript is required. Use VTT, SRT, or lines beginning with MM:SS.");
  }
  const sections = splitTranscriptIntoSections(cues);
  const claims = extractStructuredClaims(source, sections);
  const ingestedAt = nowIso(now);
  const dirty = await markReviewDirty(kv, {
    startedAt: ingestedAt,
    plannedSourceIds: [source.id],
    changedSourceIds: [source.id],
    reason: "owner-transcript-import"
  });
  const claimDocument = {
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    source: {
      id: source.id,
      platform: source.platform,
      publisher: source.publisher,
      publisherKey: source.publisherKey,
      sourceKind: source.sourceKind,
      title: source.title,
      url: source.url
    },
    extractedAt: ingestedAt,
    claims
  };
  await kv.put(`${PRIVATE_TRANSCRIPT_PREFIX}${source.id}`, JSON.stringify({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    sourceId: source.id,
    acquiredAt: ingestedAt,
    language: normalizeWhitespace(input.language || "en"),
    trackKind: "owner-imported-timestamped-transcript",
    cues
  }));
  await kv.put(`${PRIVATE_CLAIMS_PREFIX}${source.id}`, JSON.stringify(claimDocument));
  const registry = await readSourceRegistry(kv);
  const updatedRegistry = registry.map(entry => entry.id === source.id ? {
    ...entry,
    transcriptStatus: "acquired-private",
    lastTranscriptAttemptAt: ingestedAt,
    transcriptLanguage: normalizeWhitespace(input.language || "en"),
    cueCount: cues.length,
    claimCount: claims.length
  } : entry);
  const claimDocuments = await collectClaimDocuments(kv, {
    registry: updatedRegistry,
    directSourceIds: dirty.plannedSourceIds,
    overlayDocuments: new Map([[source.id, claimDocument]])
  });
  const consensus = buildKnowledgeConsensus(claimDocuments);
  const review = buildKnowledgeReview(consensus, {
    now,
    libraryAudit: options.libraryAudit || null,
    claimDocuments,
    libraryKnowledgeIndex: options.libraryKnowledgeIndex || []
  });
  const persistedReview = await persistKnowledgeReview(kv, review, consensus, {
    changedSourceIds: [source.id]
  });
  await writeSourceRegistry(kv, updatedRegistry, ingestedAt);
  await clearReviewDirty(kv, dirty.generationId, ingestedAt);
  return Object.freeze({
    sourceId: source.id,
    cueCount: cues.length,
    claimCount: claims.length,
    reviewId: persistedReview.id,
    summary: persistedReview.summary,
    publicationWrites: 0
  });
}

function sourceRetryDelayMs(attemptCount = 1) {
  const exponent = Math.max(0, Math.min(7, Number(attemptCount || 1) - 1));
  return Math.min(7 * 24 * 60 * 60 * 1_000, 60 * 60 * 1_000 * (2 ** exponent));
}

function nextSourceRetryAt(now, attemptCount) {
  return new Date(new Date(now).getTime() + sourceRetryDelayMs(attemptCount)).toISOString();
}

function pendingSources(sources, options = {}) {
  const nowMs = new Date(options.now || new Date()).getTime();
  const retryable = new Set([
    "watch-page-unavailable",
    "android-player-unavailable",
    "transcript-unavailable",
    "empty-transcript",
    "no-public-transcript",
    "gemini-rate-limited",
    "gemini-unavailable",
    "gemini-incomplete",
    "gemini-invalid-output",
    "pipeline-error"
  ]);
  const priority = source => {
    if (source.retryRequestedAt) return 0;
    if ((source.transcriptStatus || "pending") === "pending" || !source.lastTranscriptAttemptAt) return 1;
    if (source.transcriptStatus === "analysis-degraded") return 2;
    return 3;
  };
  return sources.filter(source => {
    if (source.platform !== "youtube" || source.researchEligible === false) return false;
    const status = source.transcriptStatus || "pending";
    if (status === "pending") return true;
    if (status === "retry-required" && source.retryRequestedAt) return true;
    if (status === "provider-required") return options.providerAvailable === true;
    if (status === "analysis-degraded" && options.analyzerAvailable !== true) return false;
    if (status !== "analysis-degraded" && !retryable.has(status)) return false;
    const retryAt = Date.parse(source.nextRetryAt || 0);
    return !Number.isFinite(retryAt) || retryAt <= nowMs;
  }).sort((left, right) => (
    priority(left) - priority(right)
    || Date.parse(left.lastTranscriptAttemptAt || left.registeredAt || 0)
      - Date.parse(right.lastTranscriptAttemptAt || right.registeredAt || 0)
  ));
}

async function notifyReview(env, message) {
  const topic = String(env.NTFY_TOPIC || "").trim();
  if (!topic) return false;
  const endpoint = topic.startsWith("http") ? topic : `https://ntfy.sh/${encodeURIComponent(topic)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
    body: message,
    signal: AbortSignal.timeout(10_000)
  });
  return response.ok;
}

async function acquireRunLease(kv, now = new Date()) {
  const acquiredAt = nowIso(now);
  const nowMs = new Date(now).getTime();
  const current = await kv.get(RUN_LEASE_KEY, "json");
  if (current?.token && Date.parse(current.expiresAt || 0) > nowMs) return null;
  const lease = {
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    token: fingerprint(`${acquiredAt}:${Math.random()}:${current?.token || ""}`),
    acquiredAt,
    expiresAt: new Date(nowMs + RUN_LEASE_TTL_MS).toISOString()
  };
  await kv.put(
    RUN_LEASE_KEY,
    JSON.stringify(lease),
    { expirationTtl: Math.ceil(RUN_LEASE_TTL_MS / 1_000) }
  );
  const confirmed = await kv.get(RUN_LEASE_KEY, "json");
  return confirmed?.token === lease.token ? lease : null;
}

async function releaseRunLease(kv, lease, now = new Date()) {
  if (!lease?.token) return;
  const current = await kv.get(RUN_LEASE_KEY, "json");
  if (current?.token !== lease.token) return;
  if (typeof kv.delete === "function") {
    await kv.delete(RUN_LEASE_KEY);
    return;
  }
  await kv.put(RUN_LEASE_KEY, JSON.stringify({
    ...current,
    releasedAt: nowIso(now),
    expiresAt: nowIso(now)
  }));
}

async function runKnowledgePipelineUnlocked(env = {}, options = {}) {
  const kv = env.CONTENT_AUTOMATION;
  if (!kv) throw new Error("CONTENT_AUTOMATION KV is not configured.");
  const now = options.now || new Date();
  const ranAt = nowIso(now);
  const deadlineMs = Math.max(1, Number(options.deadlineMs || DEFAULT_PIPELINE_DEADLINE_MS));
  const deadlineAt = Date.now() + deadlineMs;
  const existingDirty = await kv.get(REVIEW_DIRTY_KEY, "json");
  const [cachedPlaylist, playlistArchive] = await Promise.all([
    kv.get("playlist:featured", "json"),
    kv.get("playlist:knowledge-sources", "json")
  ]);
  const suppliedSources = [
    ...(options.sources || []),
    ...((playlistArchive?.items || []).filter(item => !item.isLive && !item.wasLive)),
    ...((cachedPlaylist?.items || []).filter(item => !item.isLive && !item.wasLive)),
    ...((cachedPlaylist?.liveStreams || []).filter(item => item.isVod))
  ];
  const registered = await registerKnowledgeSources(kv, suppliedSources, now);
  const batchSize = Math.max(1, Math.min(MAX_PIPELINE_BATCH_SIZE, Number(options.batchSize || DEFAULT_BATCH_SIZE)));
  const providerAvailable = Boolean(String(env.KNOWLEDGE_TRANSCRIPT_ENDPOINT || "").trim());
  const analyzerAvailable = Boolean(String(env.KNOWLEDGE_PIPELINE_TOKEN || "").trim());
  const sourceRegistry = await readSourceRegistry(kv);
  const sourceState = new Map(sourceRegistry.map(source => [source.id, source]));
  const pending = pendingSources(sourceRegistry, { providerAvailable, analyzerAvailable, now });
  const queue = pending.slice(0, batchSize);
  const eligibilityChangedSourceIds = sourceRegistry
    .filter(source => source.eligibilityReviewPending === true)
    .map(source => source.id);
  let dirty = activeReviewDirty(existingDirty) ? existingDirty : null;
  if (queue.length || eligibilityChangedSourceIds.length || dirty) {
    dirty = await markReviewDirty(kv, {
      generationId: dirty?.generationId,
      startedAt: dirty?.startedAt || ranAt,
      plannedSourceIds: unique([
        ...(dirty?.plannedSourceIds || []),
        ...queue.map(source => source.id),
        ...eligibilityChangedSourceIds
      ]),
      changedSourceIds: unique([
        ...(dirty?.changedSourceIds || []),
        ...eligibilityChangedSourceIds
      ]),
      reason: dirty?.reason || "scheduled-knowledge-run"
    });
  }
  const processed = [];
  const claimDocumentsWritten = new Map();
  const updateSourceStatus = (source, patch) => {
    sourceState.set(source.id, { ...source, ...patch });
  };
  const processSource = async source => {
    const attemptedAt = nowIso(now);
    try {
      const transcript = await acquireKnowledgeTranscript(source, env, options.fetchImpl || fetch);
      if (transcript.status !== "acquired") {
        const transcriptStatus = transcript.status;
        const attemptCount = Number(source.attemptCount || 0) + 1;
        updateSourceStatus(source, {
          transcriptStatus,
          lastTranscriptAttemptAt: attemptedAt,
          transcriptLanguage: transcript.language || "",
          attemptCount,
          nextRetryAt: nextSourceRetryAt(now, attemptCount),
          retryRequestedAt: null
        });
        processed.push({ sourceId: source.id, status: transcriptStatus, claims: 0 });
        return;
      }
      const sourceStartMs = Math.max(0, Number(source.startSeconds || 0) * 1_000);
      const cues = normalizeValorantTranscript(transcript.cues)
        .filter(cue => cue.startMs + cue.durationMs > sourceStartMs);
      const sections = splitTranscriptIntoSections(cues);
      const semantic = transcript.insights?.length
        ? { status: "analyzed", insights: transcript.insights, model: String(env.KNOWLEDGE_VIDEO_MODEL || DEFAULT_GEMINI_VIDEO_MODEL) }
        : await analyzeKnowledgeTranscript(source, cues, env, options.fetchImpl || fetch);
      const claims = semantic.insights?.length
        ? claimsFromVideoInsights(source, semantic.insights)
        : extractStructuredClaims(source, sections);
      const analysisDegraded = [
        "analysis-not-configured",
        "analysis-rate-limited",
        "analysis-unavailable",
        "analysis-ungrounded"
      ].includes(semantic.status);
      const transcriptStatus = !claims.length
        ? "no-actionable-insights"
        : analysisDegraded
          ? "analysis-degraded"
          : "acquired-private";
      await kv.put(`${PRIVATE_TRANSCRIPT_PREFIX}${source.id}`, JSON.stringify({
        schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
        sourceId: source.id,
        acquiredAt: attemptedAt,
        language: transcript.language,
        trackKind: transcript.trackKind,
        semanticAnalysis: semantic.insights?.length
          ? { insightCount: semantic.insights.length, model: semantic.model, status: semantic.status }
          : null,
        cues
      }));
      const claimDocument = {
        schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
        source: {
          id: source.id,
          platform: source.platform,
          publisher: source.publisher,
          publisherKey: source.publisherKey,
          sourceKind: source.sourceKind,
          title: source.title,
          url: source.url
        },
        extractedAt: attemptedAt,
        claims
      };
      await kv.put(`${PRIVATE_CLAIMS_PREFIX}${source.id}`, JSON.stringify(claimDocument));
      claimDocumentsWritten.set(source.id, claimDocument);
      updateSourceStatus(source, {
        transcriptStatus,
        lastTranscriptAttemptAt: attemptedAt,
        transcriptLanguage: transcript.language,
        cueCount: cues.length,
        claimCount: claims.length,
        extractionKind: semantic.insights?.length ? "semantic-video-analysis" : "caption-rule-analysis",
        analysisStatus: semantic.status,
        attemptCount: analysisDegraded ? Number(source.attemptCount || 0) + 1 : 0,
        nextRetryAt: analysisDegraded ? nextSourceRetryAt(now, Number(source.attemptCount || 0) + 1) : null,
        retryRequestedAt: null,
        lastErrorClass: ""
      });
      processed.push({
        sourceId: source.id,
        status: transcriptStatus,
        claims: claims.length,
        claimDocumentWritten: true
      });
    } catch (error) {
      const attemptCount = Number(source.attemptCount || 0) + 1;
      updateSourceStatus(source, {
        transcriptStatus: "pipeline-error",
        lastTranscriptAttemptAt: attemptedAt,
        lastErrorClass: error?.name || "Error",
        attemptCount,
        nextRetryAt: nextSourceRetryAt(now, attemptCount),
        retryRequestedAt: null
      });
      processed.push({ sourceId: source.id, status: "pipeline-error", claims: 0 });
    }
  };
  let queueCursor = 0;
  const runQueueWorker = async () => {
    while (queueCursor < queue.length && Date.now() < deadlineAt) {
      const source = queue[queueCursor];
      queueCursor += 1;
      await processSource(source);
    }
  };
  await Promise.all(Array.from(
    { length: Math.min(3, queue.length) },
    () => runQueueWorker()
  ));
  const queueOrder = new Map(queue.map((source, index) => [source.id, index]));
  processed.sort((left, right) => queueOrder.get(left.sourceId) - queueOrder.get(right.sourceId));

  if (!processed.length && !activeReviewDirty(dirty)) {
    const latestReview = await kv.get(LATEST_REVIEW_KEY, "json");
    if (latestReview) {
      const result = Object.freeze({
        schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
        ranAt,
        registered: registered.length,
        processed: Object.freeze([]),
        deferred: pending.length,
        reviewId: latestReview.id,
        summary: latestReview.summary,
        publicationWrites: 0
      });
      await kv.put(LAST_RUN_KEY, JSON.stringify(result));
      return result;
    }
  }

  const updatedRegistry = [...sourceState.values()];
  const changedSourceIds = unique([
    ...(dirty?.changedSourceIds || []),
    ...eligibilityChangedSourceIds,
    ...processed
      .filter(item => item.claimDocumentWritten)
      .map(item => item.sourceId)
  ]);
  const claimDocuments = await collectClaimDocuments(kv, {
    registry: updatedRegistry,
    directSourceIds: unique([
      ...(dirty?.plannedSourceIds || []),
      ...changedSourceIds
    ]),
    overlayDocuments: claimDocumentsWritten
  });
  const consensus = buildKnowledgeConsensus(claimDocuments);
  const review = buildKnowledgeReview(consensus, {
    now,
    libraryAudit: options.libraryAudit || null,
    claimDocuments,
    libraryKnowledgeIndex: options.libraryKnowledgeIndex || []
  });
  const persistedReview = await persistKnowledgeReview(kv, review, consensus, {
    changedSourceIds
  });
  const reconciledRegistry = updatedRegistry.map(source => (
    eligibilityChangedSourceIds.includes(source.id)
      ? {
          ...source,
          eligibilityReviewPending: false,
          eligibilityReviewedAt: ranAt
        }
      : source
  ));
  await writeSourceRegistry(kv, reconciledRegistry, ranAt);
  if (dirty) await clearReviewDirty(kv, dirty.generationId, ranAt);
  const result = Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    ranAt,
    registered: registered.length,
    processed: Object.freeze(processed),
    deferred: Math.max(0, pending.length - processed.length),
    reviewId: persistedReview.id,
    summary: persistedReview.summary,
    publicationWrites: 0
  });
  await kv.put(LAST_RUN_KEY, JSON.stringify(result));
  const libraryGapCount = Number(persistedReview.libraryAudit?.missingOpportunities?.length || 0);
  if ((persistedReview.summary.pendingApproval > 0 || libraryGapCount > 0) && options.notify !== false) {
    try {
      await notifyReview(
        env,
        `RankedCoach knowledge review ${persistedReview.id}: ${persistedReview.summary.corroborated} corroborated, ${persistedReview.summary.conflicts + persistedReview.summary.libraryConflicts} conflict(s), ${persistedReview.summary.pendingApproval} proposal(s), ${libraryGapCount} existing Library gap(s) awaiting owner review. Nothing was published.`
      );
    } catch (error) {
      console.warn("Knowledge review notification skipped", error?.message || error);
    }
  }
  return result;
}

export async function runKnowledgePipeline(env = {}, options = {}) {
  const kv = env.CONTENT_AUTOMATION;
  if (!kv) throw new Error("CONTENT_AUTOMATION KV is not configured.");
  const now = options.now || new Date();
  const lease = await acquireRunLease(kv, now);
  if (!lease) {
    const lastRun = await kv.get(LAST_RUN_KEY, "json");
    return Object.freeze({
      schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
      ranAt: nowIso(now),
      registered: 0,
      processed: Object.freeze([]),
      deferred: 0,
      reviewId: lastRun?.reviewId || null,
      summary: lastRun?.summary || null,
      publicationWrites: 0,
      skipped: "run-in-progress"
    });
  }
  try {
    return await runKnowledgePipelineUnlocked(env, options);
  } finally {
    try {
      await releaseRunLease(kv, lease, options.now || new Date());
    } catch (error) {
      console.warn("Knowledge run lease release skipped", error?.message || error);
    }
  }
}

export async function approveKnowledgeProposal(kv, approval = {}, now = new Date()) {
  const proposalId = String(approval.proposalId || "").trim();
  const owner = normalizeWhitespace(approval.owner);
  const rankedCoachWording = normalizeWhitespace(approval.rankedCoachWording);
  if (!proposalId || !owner || rankedCoachWording.length < 20) {
    throw new Error("Owner, proposalId, and at least 20 characters of original RankedCoach wording are required.");
  }
  if (approval.confirmOriginalWording !== true) {
    throw new Error("Approval must confirm that the wording is original RankedCoach guidance, not copied transcript text.");
  }
  const key = `${PROPOSAL_PREFIX}${proposalId}`;
  const proposal = await kv.get(key, "json");
  if (!proposal) throw new Error(`Knowledge proposal not found: ${proposalId}`);
  for (const evidence of proposal.evidence || []) {
    const document = await kv.get(`${PRIVATE_CLAIMS_PREFIX}${evidence.sourceId}`, "json");
    const claim = (document?.claims || []).find(item => (
      Math.abs(Number(item.startSeconds || 0) - Number(evidence.startSeconds || 0)) < 0.01
    ));
    if (claim?.privateExcerpt && containsCopiedTranscriptPhrase(rankedCoachWording, claim.privateExcerpt)) {
      throw new Error("Rewrite the insight in original RankedCoach wording before approval; it still contains a long transcript phrase.");
    }
  }
  const approvedAt = nowIso(now);
  const record = Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    proposalId,
    conceptId: proposal.conceptId,
    owner,
    rankedCoachWording,
    approvedAt,
    status: "approved-for-manual-library-promotion",
    evidence: proposal.evidence
  });
  await kv.put(`${APPROVAL_PREFIX}${proposalId}`, JSON.stringify(record));
  const updatedProposal = {
    ...proposal,
    rankedCoachWording,
    approvalStatus: "approved",
    approvedAt,
    approvedBy: owner
  };
  await kv.put(key, JSON.stringify(updatedProposal));
  await updateLatestReviewProposal(kv, updatedProposal);
  return record;
}

export async function saveKnowledgeProposalDraft(kv, draft = {}, now = new Date()) {
  const proposalId = String(draft.proposalId || "").trim();
  const owner = normalizeWhitespace(draft.owner);
  const rankedCoachWording = normalizeWhitespace(draft.rankedCoachWording);
  if (!proposalId || !owner || rankedCoachWording.length < 20) {
    throw new Error("Owner, proposalId, and at least 20 characters of RankedCoach wording are required.");
  }
  const key = `${PROPOSAL_PREFIX}${proposalId}`;
  const proposal = await kv.get(key, "json");
  if (!proposal) throw new Error(`Knowledge proposal not found: ${proposalId}`);
  if (proposal.approvalStatus === "published") {
    throw new Error("Remove this guidance from the Library before changing its draft.");
  }
  const updatedProposal = {
    ...proposal,
    rankedCoachWording,
    approvalStatus: "draft",
    draftSavedAt: nowIso(now),
    draftSavedBy: owner,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null
  };
  await kv.put(key, JSON.stringify(updatedProposal));
  await updateLatestReviewProposal(kv, updatedProposal);
  return Object.freeze({ proposalId, status: "draft-saved" });
}

export async function rejectKnowledgeProposal(kv, rejection = {}, now = new Date()) {
  const proposalId = String(rejection.proposalId || "").trim();
  const owner = normalizeWhitespace(rejection.owner);
  const reason = normalizeWhitespace(rejection.reason || "Not suitable for RankedCoach publication.");
  if (!proposalId || !owner) throw new Error("Owner and proposal ID are required.");
  const key = `${PROPOSAL_PREFIX}${proposalId}`;
  const proposal = await kv.get(key, "json");
  if (!proposal) throw new Error(`Knowledge proposal not found: ${proposalId}`);
  if (proposal.approvalStatus === "published") {
    throw new Error("Remove the published guidance from the Library before rejecting it.");
  }
  const updatedProposal = {
    ...proposal,
    approvalStatus: "rejected",
    rejectedAt: nowIso(now),
    rejectedBy: owner,
    rejectionReason: reason
  };
  await kv.put(key, JSON.stringify(updatedProposal));
  await updateLatestReviewProposal(kv, updatedProposal);
  return Object.freeze({ proposalId, status: "rejected" });
}

export async function queueKnowledgeSourceRetry(kv, input = {}, now = new Date()) {
  const sourceId = String(input.sourceId || "").trim();
  if (!sourceId) throw new Error("Source ID is required.");
  const registry = await readSourceRegistry(kv);
  let found = false;
  const updated = registry.map(source => {
    if (source.id !== sourceId) return source;
    found = true;
    return {
      ...source,
      transcriptStatus: "retry-required",
      retryRequestedAt: nowIso(now),
      nextRetryAt: null,
      lastErrorClass: ""
    };
  });
  if (!found) throw new Error(`Knowledge source not found: ${sourceId}`);
  await writeSourceRegistry(kv, updated, nowIso(now));
  return Object.freeze({ sourceId, status: "retry-required" });
}

export async function publishApprovedKnowledge(kv, publication = {}, now = new Date()) {
  const proposalId = String(publication.proposalId || "").trim();
  const owner = normalizeWhitespace(publication.owner);
  const category = normalizeWhitespace(publication.category || "general").toLowerCase();
  const entity = canonicalPublicationEntity(category, publication.entity);
  if (!proposalId || !owner || !["general", "map", "agent", "weapon"].includes(category)) {
    throw new Error("Proposal, owner, and a valid Library category are required.");
  }
  if (category !== "general" && !entity) throw new Error("Choose a valid map, agent, or weapon for contextual Library publication.");
  const proposalKey = `${PROPOSAL_PREFIX}${proposalId}`;
  const proposal = await kv.get(proposalKey, "json");
  const approval = await kv.get(`${APPROVAL_PREFIX}${proposalId}`, "json");
  if (!proposal || !approval || proposal.approvalStatus !== "approved") {
    throw new Error("Only an owner-approved proposal can be published.");
  }
  if (
    proposal.state === "conflicted"
    || proposal.libraryComparison?.relationship === "conflicts-with-library"
  ) {
    throw new Error("Resolve the source or Library conflict before publication.");
  }
  if (proposal.type === "statistical" && proposal.state !== "corroborated") {
    throw new Error("A statistical insight needs corroboration from independent sources before publication.");
  }
  const publishedAt = nowIso(now);
  const record = Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: proposalId,
    proposalId,
    conceptId: proposal.conceptId,
    wording: approval.rankedCoachWording,
    type: proposal.type,
    topic: proposal.topic,
    category,
    entity,
    entities: Object.freeze([...(proposal.entities || [])]),
    evidence: Object.freeze((proposal.evidence || []).map(item => Object.freeze({
      sourceId: item.sourceId,
      startSeconds: Number(item.startSeconds || 0),
      endSeconds: Number(item.endSeconds || 0),
      url: item.url
    }))),
    publishedAt,
    status: "published"
  });
  await kv.put(`${PUBLISHED_PREFIX}${proposalId}`, JSON.stringify(record));
  const existing = await kv.get(PUBLISHED_INDEX_KEY, "json");
  const items = Array.isArray(existing?.items) ? existing.items.filter(item => item.id !== record.id) : [];
  items.push(record);
  await kv.put(PUBLISHED_INDEX_KEY, JSON.stringify({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    updatedAt: publishedAt,
    items
  }));
  const updatedProposal = {
    ...proposal,
    approvalStatus: "published",
    publishedAt,
    publishedCategory: category,
    publishedEntity: entity
  };
  await kv.put(proposalKey, JSON.stringify(updatedProposal));
  await updateLatestReviewProposal(kv, updatedProposal);
  return record;
}

export async function unpublishKnowledge(kv, publication = {}, now = new Date()) {
  const proposalId = String(publication.proposalId || "").trim();
  if (!proposalId) throw new Error("Proposal ID is required.");
  const existing = await kv.get(PUBLISHED_INDEX_KEY, "json");
  const items = Array.isArray(existing?.items) ? existing.items.filter(item => item.id !== proposalId) : [];
  await kv.put(PUBLISHED_INDEX_KEY, JSON.stringify({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    updatedAt: nowIso(now),
    items
  }));
  const proposalKey = `${PROPOSAL_PREFIX}${proposalId}`;
  const proposal = await kv.get(proposalKey, "json");
  if (proposal) {
    const updatedProposal = {
      ...proposal,
      approvalStatus: "approved",
      unpublishedAt: nowIso(now)
    };
    await kv.put(proposalKey, JSON.stringify(updatedProposal));
    await updateLatestReviewProposal(kv, updatedProposal);
  }
  return Object.freeze({ proposalId, status: "unpublished" });
}

export async function getPublishedKnowledge(kv) {
  const index = await kv.get(PUBLISHED_INDEX_KEY, "json");
  const items = (Array.isArray(index?.items) ? index.items : [])
    .filter(item => item?.status === "published" && typeof item.wording === "string")
    .map(item => Object.freeze({
      id: String(item.id || ""),
      wording: normalizeWhitespace(item.wording),
      type: item.type === "statistical" ? "statistical" : "coaching",
      topic: normalizeWhitespace(item.topic || "general"),
      category: ["general", "map", "agent", "weapon"].includes(item.category) ? item.category : "general",
      entity: normalizeWhitespace(item.entity),
      entities: Object.freeze((item.entities || []).map(normalizeWhitespace).filter(Boolean)),
      evidence: Object.freeze((item.evidence || []).map(evidence => Object.freeze({
        sourceId: String(evidence.sourceId || ""),
        startSeconds: Math.max(0, Number(evidence.startSeconds || 0)),
        endSeconds: Math.max(0, Number(evidence.endSeconds || 0)),
        url: String(evidence.url || "")
      }))),
      publishedAt: item.publishedAt || null,
      status: "published"
    }));
  return Object.freeze({
    updatedAt: index?.updatedAt || null,
    items: Object.freeze(items)
  });
}

function words(value = "", max = MAX_REVIEW_EXCERPT_WORDS) {
  return normalizeWhitespace(value).split(" ").filter(Boolean).slice(0, max).join(" ");
}

function trailingWords(value = "", max = MAX_SURROUNDING_EXCERPT_WORDS) {
  return normalizeWhitespace(value).split(" ").filter(Boolean).slice(-max).join(" ");
}

function surroundingTranscriptExcerpts(claim, transcript = {}) {
  const cues = normalizeValorantTranscript(transcript.cues || []);
  if (!cues.length) return Object.freeze([]);
  const startMs = Math.max(0, Number(claim.startSeconds || 0) * 1_000);
  const endMs = Math.max(startMs, Number(claim.endSeconds || claim.startSeconds || 0) * 1_000);
  const before = [];
  let beforeBoundaryMs = startMs;
  for (let index = cues.length - 1; index >= 0; index -= 1) {
    const cue = cues[index];
    const cueStartMs = Number(cue.startMs || 0);
    const cueEndMs = cueStartMs + Math.max(1_000, Number(cue.durationMs || 0));
    if (cueEndMs > startMs) continue;
    if (cueEndMs < startMs - SURROUNDING_EXCERPT_WINDOW_MS) break;
    if (beforeBoundaryMs - cueEndMs >= CLAIM_TOPIC_PAUSE_MS) break;
    before.unshift(cue);
    beforeBoundaryMs = cueStartMs;
    if (before.length >= MAX_SURROUNDING_EXCERPT_CUES) break;
  }
  const after = [];
  let afterBoundaryMs = endMs;
  for (const cue of cues) {
    const cueStartMs = Number(cue.startMs || 0);
    const cueEndMs = cueStartMs + Math.max(1_000, Number(cue.durationMs || 0));
    if (cueStartMs < endMs) continue;
    if (cueStartMs > endMs + SURROUNDING_EXCERPT_WINDOW_MS) break;
    if (cueStartMs - afterBoundaryMs >= CLAIM_TOPIC_PAUSE_MS) break;
    after.push(cue);
    afterBoundaryMs = cueEndMs;
    if (after.length >= MAX_SURROUNDING_EXCERPT_CUES) break;
  }
  const excerpt = (label, selected) => {
    if (!selected.length) return null;
    const combined = selected.map(cue => cue.text).join(" ");
    return Object.freeze({
      label,
      startSeconds: Number(selected[0].startMs || 0) / 1_000,
      text: label === "Lead-in"
        ? trailingWords(combined, MAX_SURROUNDING_EXCERPT_WORDS)
        : words(combined, MAX_SURROUNDING_EXCERPT_WORDS)
    });
  };
  return Object.freeze([
    excerpt("Lead-in", before),
    excerpt("Follow-through", after)
  ].filter(item => item?.text));
}

function proposalOwnerContext(proposal, claimById, claimByEvidence, sourceById, transcriptBySource) {
  const claims = (proposal.claimIds || [])
    .map(id => claimById.get(id))
    .filter(Boolean);
  if (!claims.length) {
    for (const evidence of proposal.evidence || []) {
      const claim = claimByEvidence.get(`${evidence.sourceId}:${Math.round(Number(evidence.startSeconds || 0) * 1_000)}`);
      if (claim) claims.push(claim);
    }
  }
  return Object.freeze(claims.slice(0, 5).map(claim => {
    const source = sourceById.get(claim.sourceId) || {};
    return Object.freeze({
      claimId: claim.id,
      sourceId: claim.sourceId,
      sourceTitle: source.title || "Playlist video",
      sourcePublisher: source.publisher || "Unknown creator",
      startSeconds: Number(claim.startSeconds || 0),
      endSeconds: Number(claim.endSeconds || claim.startSeconds || 0),
      url: claim.evidenceUrl,
      contextExcerpt: words(claim.privateExcerpt, MAX_REVIEW_EXCERPT_WORDS),
      keywords: Object.freeze((claim.tokens || []).slice(0, 8)),
      whyItMatters: normalizeWhitespace(claim.whyItMatters),
      selectionReason: normalizeWhitespace(
        claim.selectionReason
        || proposal.selectionReason
        || selectionReasonForInsight(claim)
      ),
      supportingExcerpts: surroundingTranscriptExcerpts(claim, transcriptBySource.get(claim.sourceId)),
      confidence: claim.confidence || "",
      extractionKind: claim.extractionKind || "caption-rule-analysis"
    });
  }));
}

function proposalBucketForStatus(status = "") {
  if (status === "rejected") return "rejected";
  if (status === "published" || status === "approved") return "approved";
  return "review";
}

export async function getKnowledgeOwnerDashboard(kv, options = {}) {
  const proposalOffset = Math.max(0, Number(options.proposalOffset || 0));
  const proposalLimit = Math.max(1, Math.min(100, Number(options.proposalLimit || 50)));
  const proposalBucket = ["review", "approved", "rejected"].includes(options.proposalBucket)
    ? options.proposalBucket
    : "review";
  const sourceOffset = Math.max(0, Number(options.sourceOffset || 0));
  const sourceLimit = Math.max(1, Math.min(200, Number(options.sourceLimit || 100)));
  const [registry, review, published, lastRun] = await Promise.all([
    readSourceRegistry(kv),
    kv.get(LATEST_REVIEW_KEY, "json"),
    getPublishedKnowledge(kv),
    kv.get(LAST_RUN_KEY, "json")
  ]);
  const index = reviewProposalIndex(review);
  const bucketCounts = index.reduce((counts, item) => {
    counts[proposalBucketForStatus(item.approvalStatus)] += 1;
    return counts;
  }, { review: 0, approved: 0, rejected: 0 });
  const bucketIndex = index.filter(item => proposalBucketForStatus(item.approvalStatus) === proposalBucket);
  let proposals = [];
  if (Array.isArray(review?.proposals)) {
    proposals = review.proposals
      .filter(proposal => proposalBucketForStatus(proposal.approvalStatus) === proposalBucket)
      .slice(proposalOffset, proposalOffset + proposalLimit);
  } else {
    proposals = (await Promise.all(bucketIndex
      .slice(proposalOffset, proposalOffset + proposalLimit)
      .map(item => kv.get(`${PROPOSAL_PREFIX}${item.id}`, "json"))))
      .filter(Boolean);
  }
  const evidenceSourceIds = unique(proposals.flatMap(proposal => (
    (proposal.evidence || []).map(item => item.sourceId)
  )));
  const [claimDocuments, transcriptDocuments] = await Promise.all([
    Promise.all(evidenceSourceIds.map(sourceId => kv.get(`${PRIVATE_CLAIMS_PREFIX}${sourceId}`, "json"))),
    Promise.all(evidenceSourceIds.map(sourceId => kv.get(`${PRIVATE_TRANSCRIPT_PREFIX}${sourceId}`, "json")))
  ]);
  const availableClaimDocuments = claimDocuments.filter(Boolean);
  const sourceById = new Map(registry.map(source => [source.id, source]));
  const transcriptBySource = new Map(transcriptDocuments.filter(Boolean).map(document => [document.sourceId, document]));
  const claims = availableClaimDocuments.flatMap(document => document.claims || []);
  const claimById = new Map(claims.map(claim => [claim.id, claim]));
  const claimByEvidence = new Map(claims.map(claim => [
    `${claim.sourceId}:${Math.round(Number(claim.startSeconds || 0) * 1_000)}`,
    claim
  ]));
  return Object.freeze({
    sourceSummary: Object.freeze({
      total: registry.length,
      processed: registry.filter(source => source.transcriptStatus === "acquired-private").length,
      waiting: registry.filter(source => ![
        "acquired-private",
        "registered-non-educational",
        "no-actionable-insights",
        "video-unavailable"
      ].includes(source.transcriptStatus)).length
    }),
    sourcePage: Object.freeze({
      offset: sourceOffset,
      limit: sourceLimit,
      total: registry.length,
      hasMore: sourceOffset + sourceLimit < registry.length
    }),
    sources: Object.freeze(registry.slice(sourceOffset, sourceOffset + sourceLimit).map(source => Object.freeze({
      id: source.id,
      platform: source.platform,
      title: source.title,
      publisher: source.publisher,
      sourceKind: source.sourceKind,
      url: source.url,
      transcriptStatus: source.transcriptStatus,
      lastTranscriptAttemptAt: source.lastTranscriptAttemptAt || null,
      nextRetryAt: source.nextRetryAt || null,
      extractionKind: source.extractionKind || "",
      analysisStatus: source.analysisStatus || "",
      cueCount: Number(source.cueCount || 0),
      claimCount: Number(source.claimCount || 0)
    }))),
    lastRun: lastRun || null,
    review: review ? Object.freeze({
      id: review.id,
      createdAt: review.createdAt || null,
      status: review.status,
      summary: review.summary,
      libraryGapCount: Number(review.libraryAudit?.missingOpportunities?.length || 0),
      page: Object.freeze({
        offset: proposalOffset,
        limit: proposalLimit,
        total: bucketIndex.length,
        hasMore: proposalOffset + proposalLimit < bucketIndex.length,
        bucket: proposalBucket,
        bucketCounts: Object.freeze(bucketCounts)
      }),
      proposals: Object.freeze(proposals.map(proposal => Object.freeze({
        ...proposal,
        contextNotes: proposalOwnerContext(proposal, claimById, claimByEvidence, sourceById, transcriptBySource)
      })))
    }) : null,
    published
  });
}

export const KNOWLEDGE_STORAGE_KEYS = Object.freeze({
  sourceRegistry: SOURCE_REGISTRY_KEY,
  privateTranscriptPrefix: PRIVATE_TRANSCRIPT_PREFIX,
  privateClaimsPrefix: PRIVATE_CLAIMS_PREFIX,
  privateConsensusPrefix: PRIVATE_CONSENSUS_PREFIX,
  proposalPrefix: PROPOSAL_PREFIX,
  approvalPrefix: APPROVAL_PREFIX,
  reviewPrefix: REVIEW_PREFIX,
  latestReview: LATEST_REVIEW_KEY,
  reviewDirty: REVIEW_DIRTY_KEY,
  lastRun: LAST_RUN_KEY,
  runLease: RUN_LEASE_KEY,
  publishedPrefix: PUBLISHED_PREFIX,
  publishedIndex: PUBLISHED_INDEX_KEY
});
