const KNOWLEDGE_SCHEMA_VERSION = 1;
const SOURCE_REGISTRY_KEY = "knowledge:sources:registry";
const PRIVATE_TRANSCRIPT_PREFIX = "knowledge:private:transcript:";
const PRIVATE_CLAIMS_PREFIX = "knowledge:private:claims:";
const PRIVATE_CONSENSUS_PREFIX = "knowledge:private:consensus:";
const PROPOSAL_PREFIX = "knowledge:proposal:";
const APPROVAL_PREFIX = "knowledge:approval:";
const REVIEW_PREFIX = "knowledge:review:";
const LATEST_REVIEW_KEY = "knowledge:review:latest";
const LAST_RUN_KEY = "knowledge:run:last";
const PUBLISHED_PREFIX = "knowledge:published:";
const PUBLISHED_INDEX_KEY = "knowledge:published:index";
const DEFAULT_BATCH_SIZE = 4;
const MAX_TRANSCRIPT_CUES = 12_000;
const MAX_SOURCE_ITEMS = 2_000;

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

function fingerprint(value = "") {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
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
  const sourceKind = normalizeWhitespace(source.sourceKind || source.channelKind || source.sourceType || "community-video");
  const researchEligible = !/(?:skin|collection|showcase|live-stream)/i.test(sourceKind)
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
    topicType: normalizeWhitespace(source.topicType || source.topicTypeOverride || ""),
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
    const next = {
      ...source,
      registeredAt: previous?.registeredAt || source.registeredAt,
      transcriptStatus: previous?.transcriptStatus || source.transcriptStatus,
      lastTranscriptAttemptAt: previous?.lastTranscriptAttemptAt || null,
      transcriptLanguage: previous?.transcriptLanguage || "",
      cueCount: Number(previous?.cueCount || 0),
      claimCount: Number(previous?.claimCount || 0)
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

export async function acquirePublicYouTubeTranscript(source, fetchImpl = fetch) {
  const identity = sourceIdentity(source);
  if (!identity || identity.platform !== "youtube") {
    return Object.freeze({ status: "unsupported", language: "", cues: [] });
  }
  const watchResponse = await fetchImpl(`https://www.youtube.com/watch?v=${identity.upstreamId}&hl=en`, {
    headers: { "User-Agent": "RankedCoach-Knowledge-Research/1.0" },
    signal: AbortSignal.timeout(20_000)
  });
  if (!watchResponse.ok) {
    return Object.freeze({ status: "watch-page-unavailable", language: "", cues: [] });
  }
  const tracks = extractYouTubeCaptionTracks(await watchResponse.text());
  const track = selectCaptionTrack(tracks);
  if (!track) return Object.freeze({ status: "no-public-transcript", language: "", cues: [] });
  const transcriptUrl = new URL(track.baseUrl);
  transcriptUrl.searchParams.set("fmt", "json3");
  const transcriptResponse = await fetchImpl(transcriptUrl, {
    headers: { "User-Agent": "RankedCoach-Knowledge-Research/1.0" },
    signal: AbortSignal.timeout(20_000)
  });
  if (!transcriptResponse.ok) {
    return Object.freeze({ status: "transcript-unavailable", language: track.languageCode, cues: [] });
  }
  const transcriptBody = await transcriptResponse.text();
  let cues = [];
  if (transcriptBody.trim()) {
    try {
      cues = parseYouTubeTranscriptPayload(JSON.parse(transcriptBody));
    } catch {
      cues = parseTimedTextXml(transcriptBody);
    }
  }
  return Object.freeze({
    status: cues.length ? "acquired" : "empty-transcript",
    language: track.languageCode,
    trackKind: track.kind || "human",
    cues: Object.freeze(cues)
  });
}

export async function acquireKnowledgeTranscript(source, env = {}, fetchImpl = fetch) {
  const providerEndpoint = String(env.KNOWLEDGE_TRANSCRIPT_ENDPOINT || "").trim();
  if (providerEndpoint) {
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
  }
  return acquirePublicYouTubeTranscript(source, fetchImpl);
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
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(normalizeWhitespace)
    .filter(Boolean);
}

function classifyTopic(text = "") {
  return TOPIC_RULES.find(rule => rule.pattern.test(text))?.id || "general";
}

function classifyClaimType(text = "") {
  return /\b\d+(?:\.\d+)?%?\b|\b(?:win rate|pick rate|usage rate|damage|credits?|seconds?|rounds?|acs|adr|k\/d)\b/i.test(text)
    ? "statistical"
    : "coaching";
}

function claimStance(text = "") {
  return /\b(?:avoid|don't|do not|never|stop|shouldn't|cannot|can't)\b/i.test(text) ? "discourage" : "encourage";
}

function coachingSignal(text = "") {
  return /\b(?:should|need to|make sure|avoid|always|never|when|if|because|try|focus|treat|use|hold|play|rotate|peek|swing|trade|smoke|flash|plant|retake|entry|anchor|buy|save)\b/i.test(text);
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
  for (let index = 0; index < cues.length - 1; index += 1) {
    cues[index].durationMs = Math.max(1_000, cues[index + 1].startMs - cues[index].startMs);
  }
  return normalizeValorantTranscript(cues);
}

export function extractStructuredClaims(source, sections = []) {
  const claims = [];
  for (const section of sections) {
    let offsetMs = section.startMs;
    for (const sentence of sentenceParts(section.text)) {
      const clean = normalizeWhitespace(sentence);
      const approximateDurationMs = Math.max(1_000, Math.round((clean.length / Math.max(section.text.length, 1)) * Math.max(section.endMs - section.startMs, 1_000)));
      const type = classifyClaimType(clean);
      if (clean.length >= 28 && clean.length <= 420 && (coachingSignal(clean) || type === "statistical")) {
        const topic = classifyTopic(clean);
        const entities = entityMatches(clean);
        const tokens = conceptTokens(clean);
        const startSeconds = Math.max(0, offsetMs / 1000);
        const endSeconds = Math.max(startSeconds, (offsetMs + approximateDurationMs) / 1000);
        const conceptKey = `${type}:${topic}:${entities.map(slug).sort().join(",")}:${fingerprint(tokens.sort().join(" "))}`;
        claims.push(Object.freeze({
          schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
          id: `${source.id}-${fingerprint(`${offsetMs}:${clean}`)}`,
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
          privateExcerpt: clean
        }));
      }
      offsetMs += approximateDurationMs;
    }
  }
  return Object.freeze(claims);
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

export function buildKnowledgeConsensus(claimDocuments = []) {
  const claims = claimDocuments.flatMap(document => document.claims || []);
  const clusters = [];
  for (const claim of claims) {
    const cluster = clusters.find(candidate => (
      candidate.type === claim.type
      && (candidate.conceptKeys.has(claim.conceptKey) || candidate.claims.some(existing => claimSimilarity(existing, claim) >= 0.72))
    ));
    if (cluster) {
      cluster.claims.push(claim);
      cluster.conceptKeys.add(claim.conceptKey);
    } else {
      clusters.push({
        id: `concept-${fingerprint(claim.conceptKey)}`,
        type: claim.type,
        topic: claim.topic,
        claims: [claim],
        conceptKeys: new Set([claim.conceptKey])
      });
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
      type: cluster.type,
      topic: cluster.topic,
      state,
      confidenceBand,
      publishers: Object.freeze(publishers),
      sourceCount: unique(cluster.claims.map(claim => claim.sourceId)).length,
      entities: Object.freeze(unique(cluster.claims.flatMap(claim => claim.entities))),
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
    type: concept.type,
    topic: concept.topic,
    entities: concept.entities,
    state: concept.state,
    confidenceBand: concept.confidenceBand,
    evidence: concept.evidence,
    contradictions: concept.contradictions,
    libraryComparison,
    recommendation,
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
    published: 0
  });
  return Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: `review-${createdAt.replace(/[^0-9]/g, "").slice(0, 14)}`,
    createdAt,
    status: "review-required",
    summary,
    libraryAudit: options.libraryAudit || null,
    proposals: Object.freeze(proposals),
    publicationRule: "Proposals are not published automatically. Owner-approved original RankedCoach wording is required."
  });
}

async function collectClaimDocuments(kv) {
  const documents = [];
  for (const key of await listKvKeys(kv, PRIVATE_CLAIMS_PREFIX)) {
    const document = await kv.get(key, "json");
    if (document?.claims) documents.push(document);
  }
  return documents;
}

async function persistKnowledgeReview(kv, review, consensus) {
  await kv.put(`${PRIVATE_CONSENSUS_PREFIX}${review.id}`, JSON.stringify(consensus));
  const persistedProposals = [];
  for (const proposal of review.proposals) {
    const previous = await kv.get(`${PROPOSAL_PREFIX}${proposal.id}`, "json");
    if (previous?.approvalStatus === "approved" || previous?.approvalStatus === "published") {
      persistedProposals.push(previous);
      continue;
    }
    await kv.put(`${PROPOSAL_PREFIX}${proposal.id}`, JSON.stringify(proposal));
    persistedProposals.push(proposal);
  }
  const persistedReview = {
    ...review,
    summary: {
      ...review.summary,
      pendingApproval: persistedProposals.filter(proposal => proposal.approvalStatus === "pending-owner-approval").length,
      published: persistedProposals.filter(proposal => proposal.approvalStatus === "published").length
    },
    proposals: persistedProposals
  };
  await kv.put(`${REVIEW_PREFIX}${review.id}`, JSON.stringify(persistedReview));
  await kv.put(LATEST_REVIEW_KEY, JSON.stringify(persistedReview));
  return persistedReview;
}

async function updateLatestReviewProposal(kv, proposal) {
  const review = await kv.get(LATEST_REVIEW_KEY, "json");
  if (!review?.proposals?.length) return;
  const proposals = review.proposals.map(item => item.id === proposal.id ? proposal : item);
  const updated = {
    ...review,
    summary: {
      ...review.summary,
      pendingApproval: proposals.filter(item => item.approvalStatus === "pending-owner-approval").length,
      published: proposals.filter(item => item.approvalStatus === "published").length
    },
    proposals
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
  await kv.put(`${PRIVATE_TRANSCRIPT_PREFIX}${source.id}`, JSON.stringify({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    sourceId: source.id,
    acquiredAt: ingestedAt,
    language: normalizeWhitespace(input.language || "en"),
    trackKind: "owner-imported-timestamped-transcript",
    cues
  }));
  await kv.put(`${PRIVATE_CLAIMS_PREFIX}${source.id}`, JSON.stringify({
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
  }));
  const registry = await readSourceRegistry(kv);
  await writeSourceRegistry(kv, registry.map(entry => entry.id === source.id ? {
    ...entry,
    transcriptStatus: "acquired-private",
    lastTranscriptAttemptAt: ingestedAt,
    transcriptLanguage: normalizeWhitespace(input.language || "en"),
    cueCount: cues.length,
    claimCount: claims.length
  } : entry), ingestedAt);
  const claimDocuments = await collectClaimDocuments(kv);
  const consensus = buildKnowledgeConsensus(claimDocuments);
  const review = buildKnowledgeReview(consensus, {
    now,
    libraryAudit: options.libraryAudit || null,
    claimDocuments,
    libraryKnowledgeIndex: options.libraryKnowledgeIndex || []
  });
  const persistedReview = await persistKnowledgeReview(kv, review, consensus);
  return Object.freeze({
    sourceId: source.id,
    cueCount: cues.length,
    claimCount: claims.length,
    reviewId: persistedReview.id,
    summary: persistedReview.summary,
    publicationWrites: 0
  });
}

function pendingSources(sources, providerAvailable = false) {
  return sources.filter(source => (
    source.platform === "youtube"
    && source.researchEligible !== false
    && source.transcriptStatus !== "acquired-private"
    && (
      ["pending", "retry-required"].includes(source.transcriptStatus || "pending")
      || (providerAvailable && source.transcriptStatus === "provider-required")
    )
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

export async function runKnowledgePipeline(env = {}, options = {}) {
  const kv = env.CONTENT_AUTOMATION;
  if (!kv) throw new Error("CONTENT_AUTOMATION KV is not configured.");
  const now = options.now || new Date();
  const cachedPlaylist = await kv.get("playlist:featured", "json");
  const suppliedSources = [
    ...(options.sources || []),
    ...((cachedPlaylist?.items || []).filter(item => !item.isLive && !item.wasLive)),
    ...((cachedPlaylist?.liveStreams || []).filter(item => item.isVod))
  ];
  const registered = await registerKnowledgeSources(kv, suppliedSources, now);
  const batchSize = Math.max(1, Math.min(12, Number(options.batchSize || DEFAULT_BATCH_SIZE)));
  const providerAvailable = Boolean(String(env.KNOWLEDGE_TRANSCRIPT_ENDPOINT || "").trim());
  const sourceRegistry = await readSourceRegistry(kv);
  const sourceState = new Map(sourceRegistry.map(source => [source.id, source]));
  const queue = pendingSources(sourceRegistry, providerAvailable).slice(0, batchSize);
  const processed = [];
  const updateSourceStatus = (source, patch) => {
    sourceState.set(source.id, { ...source, ...patch });
  };
  for (const source of queue) {
    const attemptedAt = nowIso(now);
    try {
      const transcript = await acquireKnowledgeTranscript(source, env, options.fetchImpl || fetch);
      if (transcript.status !== "acquired") {
        const transcriptStatus = transcript.status === "empty-transcript"
          ? "provider-required"
          : transcript.status;
        updateSourceStatus(source, {
          transcriptStatus,
          lastTranscriptAttemptAt: attemptedAt,
          transcriptLanguage: transcript.language || ""
        });
        processed.push({ sourceId: source.id, status: transcriptStatus, claims: 0 });
        continue;
      }
      const cues = normalizeValorantTranscript(transcript.cues);
      const sections = splitTranscriptIntoSections(cues);
      const claims = extractStructuredClaims(source, sections);
      await kv.put(`${PRIVATE_TRANSCRIPT_PREFIX}${source.id}`, JSON.stringify({
        schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
        sourceId: source.id,
        acquiredAt: attemptedAt,
        language: transcript.language,
        trackKind: transcript.trackKind,
        cues
      }));
      await kv.put(`${PRIVATE_CLAIMS_PREFIX}${source.id}`, JSON.stringify({
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
      }));
      updateSourceStatus(source, {
        transcriptStatus: "acquired-private",
        lastTranscriptAttemptAt: attemptedAt,
        transcriptLanguage: transcript.language,
        cueCount: cues.length,
        claimCount: claims.length
      });
      processed.push({ sourceId: source.id, status: "acquired-private", claims: claims.length });
    } catch (error) {
      updateSourceStatus(source, {
        transcriptStatus: "retry-required",
        lastTranscriptAttemptAt: attemptedAt,
        lastErrorClass: error?.name || "Error"
      });
      processed.push({ sourceId: source.id, status: "retry-required", claims: 0 });
    }
  }
  await writeSourceRegistry(kv, [...sourceState.values()], nowIso(now));

  const claimDocuments = await collectClaimDocuments(kv);
  const consensus = buildKnowledgeConsensus(claimDocuments);
  const review = buildKnowledgeReview(consensus, {
    now,
    libraryAudit: options.libraryAudit || null,
    claimDocuments,
    libraryKnowledgeIndex: options.libraryKnowledgeIndex || []
  });
  const persistedReview = await persistKnowledgeReview(kv, review, consensus);
  const result = Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    ranAt: nowIso(now),
    registered: registered.length,
    processed: Object.freeze(processed),
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

export async function publishApprovedKnowledge(kv, publication = {}, now = new Date()) {
  const proposalId = String(publication.proposalId || "").trim();
  const owner = normalizeWhitespace(publication.owner);
  const category = normalizeWhitespace(publication.category || "general").toLowerCase();
  const entity = normalizeWhitespace(publication.entity);
  if (!proposalId || !owner || !["general", "map", "agent", "weapon"].includes(category)) {
    throw new Error("Proposal, owner, and a valid Library category are required.");
  }
  if (category !== "general" && !entity) throw new Error("A target entity is required for contextual Library publication.");
  const proposalKey = `${PROPOSAL_PREFIX}${proposalId}`;
  const proposal = await kv.get(proposalKey, "json");
  const approval = await kv.get(`${APPROVAL_PREFIX}${proposalId}`, "json");
  if (!proposal || !approval || proposal.approvalStatus !== "approved") {
    throw new Error("Only an owner-approved proposal can be published.");
  }
  const publishedAt = nowIso(now);
  const record = Object.freeze({
    schemaVersion: KNOWLEDGE_SCHEMA_VERSION,
    id: proposalId,
    proposalId,
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
  return Object.freeze({
    updatedAt: index?.updatedAt || null,
    items: Object.freeze((Array.isArray(index?.items) ? index.items : []).filter(item => (
      item?.status === "published" && typeof item.wording === "string"
    )))
  });
}

export async function getKnowledgeOwnerDashboard(kv) {
  const [registry, review, published] = await Promise.all([
    readSourceRegistry(kv),
    kv.get(LATEST_REVIEW_KEY, "json"),
    getPublishedKnowledge(kv)
  ]);
  return Object.freeze({
    sources: Object.freeze(registry.map(source => Object.freeze({
      id: source.id,
      platform: source.platform,
      title: source.title,
      publisher: source.publisher,
      sourceKind: source.sourceKind,
      url: source.url,
      transcriptStatus: source.transcriptStatus,
      cueCount: Number(source.cueCount || 0),
      claimCount: Number(source.claimCount || 0)
    }))),
    review: review ? Object.freeze({
      id: review.id,
      createdAt: review.createdAt || null,
      status: review.status,
      summary: review.summary,
      libraryGapCount: Number(review.libraryAudit?.missingOpportunities?.length || 0),
      proposals: Object.freeze([...(review.proposals || [])])
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
  lastRun: LAST_RUN_KEY,
  publishedPrefix: PUBLISHED_PREFIX,
  publishedIndex: PUBLISHED_INDEX_KEY
});
