import { CURATED_PLAYLIST_RESEARCH_ARCHIVE } from "./curated-playlist-research.mjs";
import { KNOWLEDGE_STORAGE_KEYS } from "./knowledge-pipeline.mjs";

const DEFAULT_NTFY_TOPIC = "rankedcoach-deploys-mk7x2q";
const VERSION_URL = "https://valorant-api.com/v1/version";
const AGENTS_URL = "https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=en-US";
const MAPS_URL = "https://valorant-api.com/v1/maps?language=en-US";
const WEAPONS_URL = "https://valorant-api.com/v1/weapons?language=en-US";
const PLAYER_CARDS_URL = "https://valorant-api.com/v1/playercards?language=en-US";
const RIOT_SITE_ROOT = "https://playvalorant.com";
const RIOT_NEWS_ROOT = "https://playvalorant.com/en-us/news/game-updates";
const YOUTUBE_API_ROOT = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_FEED_ROOT = "https://www.youtube.com/feeds/videos.xml";
const MAX_CHANNEL_VIDEOS = 15;
const MAX_TWITCH_ARCHIVES = 15;
const PLAYLIST_MAX_ITEMS = 120;
const PLAYLIST_KNOWLEDGE_SOURCE_MAX_ITEMS = 5_000;
const PLAYLIST_KNOWLEDGE_SOURCE_ARCHIVE_KEY = "playlist:knowledge-sources";
const PLAYER_CARD_CATALOG_KEY = "profile:player-cards:v1";
const PLAYER_CARD_CATALOG_TTL_SECONDS = 24 * 60 * 60;
const RIOT_PATCH_NOTES_FEED_KEY = "riot:patch-notes:latest:v2";
const RIOT_PATCH_NOTES_FEED_TTL_SECONDS = 60 * 60;
const LIBRARY_ENTITY_SNAPSHOT_KEY = "library:entities:v1";
const LIBRARY_DAILY_RESEARCH_KEY = "library:research:last";
const COMPETITIVE_MAP_NAMES = Object.freeze([
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven",
  "Icebox", "Lotus", "Pearl", "Split", "Summit", "Sunset"
]);
export const TRUSTED_LIBRARY_SITES = Object.freeze([
  Object.freeze({ id: "riot-api", kind: "canonical", url: "https://valorant-api.com/v1" }),
  Object.freeze({ id: "riot-official", kind: "canonical", url: "https://playvalorant.com/en-us/" }),
  Object.freeze({ id: "valohub", kind: "synthesized", url: "https://valohub.co/maps/{slug}" }),
  Object.freeze({ id: "valocheck", kind: "synthesized", url: "https://www.valocheck.com/maps/{slug}/" }),
  Object.freeze({ id: "valorantinfo", kind: "synthesized", url: "https://valorantinfo.gg/maps/{slug}/" })
]);
const PLAYLIST_CACHE_WINDOW_MS = 5 * 60 * 1000;
const PLAYLIST_YOUTUBE_LIKE_METRIC_CACHE_PREFIX = "playlist:youtube-like-metric:";
const PLAYLIST_YOUTUBE_LIKE_METRIC_CACHE_TTL_SECONDS = 12 * 60 * 60;
const PLAYLIST_YOUTUBE_LIKE_METRIC_UNAVAILABLE_CACHE_TTL_SECONDS = 60 * 60;
const TWITCH_TOKEN_CACHE_KEY = "playlist:twitch-token";
const TWITCH_API_ROOT = "https://api.twitch.tv/helix";
const PLAYLIST_CLASSIFICATION_REVIEW_TTL_SECONDS = 7 * 24 * 60 * 60;
const PLAYLIST_GUIDE_SEARCH_CACHE_TTL_SECONDS = 14 * 24 * 60 * 60;
const PLAYLIST_GUIDE_SEARCH_MISS_TTL_SECONDS = 24 * 60 * 60;
const OWNER_RESEARCH_SOURCE_KIND = "owner-imported-educational-video";

export const AGENT_NAMES = Object.freeze([
  "Astra", "Breach", "Brimstone", "Chamber", "Clove", "Cypher", "Deadlock", "Fade", "Gekko",
  "Harbor", "Iso", "Jett", "KAY/O", "Killjoy", "Miks", "Neon", "Omen", "Phoenix", "Raze",
  "Reyna", "Sage", "Skye", "Sova", "Tejo", "Veto", "Viper", "Vyse", "Waylay", "Yoru"
]);

export const WEAPON_NAMES = Object.freeze([
  "Ares", "Bucky", "Bulldog", "Classic", "Frenzy", "Ghost", "Guardian", "Judge", "Marshal",
  "Odin", "Operator", "Outlaw", "Phantom", "Sheriff", "Shorty", "Spectre", "Stinger", "Vandal"
]);

export const MAP_NAMES = Object.freeze([
  "Abyss", "Ascent", "Bind", "Breeze", "Corrode", "Fracture", "Haven", "Icebox", "Lotus",
  "Pearl", "Split", "Summit", "Sunset"
]);

const PLAYLIST_TOPIC_TYPES = Object.freeze(["General", "Role", "Agent", "Map Knowledge", "Mechanics", "Mentality", "Settings/Gear"]);
const PLAYLIST_TOPIC_TYPE_SET = new Set(PLAYLIST_TOPIC_TYPES);

const GUIDE_SEARCH_TARGETS = Object.freeze([
  ...AGENT_NAMES.map(name => Object.freeze({ targetType: "Agent", targetName: name, topicType: "Agent" })),
  ...MAP_NAMES.map(name => Object.freeze({ targetType: "Map", targetName: name, topicType: "Map Knowledge" }))
]);

const STATIC_PLAYLIST_VIDEOS = Object.freeze([
  Object.freeze({
    id: "d8CXBLRgP-A",
    platform: "youtube",
    channel: "TenZ",
    channelKind: "creator",
    title: "Find your PERFECT Sensitivity and Optimal Settings! | SEN TenZ",
    description: "Sensitivity, clarity, and optimal Valorant settings guidance from TenZ.",
    publishedAt: "2025-01-01T00:00:00.000Z",
    thumbnail: "https://i.ytimg.com/vi/d8CXBLRgP-A/hqdefault.jpg",
    url: "https://www.youtube.com/watch?v=d8CXBLRgP-A",
    sourceType: "settings-gear",
    topicTypeOverride: "Settings/Gear",
    isCatalogPinned: true,
    isShort: false,
    isLive: false,
    wasLive: false,
    isVod: false,
    hasStructuralMediaMetadata: true,
    isValorant: true
  })
]);

export const TRUSTED_YOUTUBE_CHANNELS = Object.freeze([
  Object.freeze({ id: "UC8CX0LD98EDXl4UYX1MDCXg", name: "VALORANT", kind: "riot", playlist: true, skin: true }),
  Object.freeze({ id: "UC93uuDyuin2YXOY2ZVn8nkw", name: "Dittozkul", kind: "showcase", playlist: false, skin: true }),
  Object.freeze({ id: "UCBjL1GzlTwyaXoqa1Ka6wzQ", handle: "@Dopai", name: "Dopai", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCqCLRG4_zynXOEPU6N5POkw", handle: "@Woohoojin", name: "Woohoojin", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCoAdB1kEFR1KDGw0gXPMV1w", handle: "@Maxiedome", name: "Maxie", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCv1zbx03PIvqG8cHNpWWWUw", handle: "@CoachKonpeki", name: "Konpeki", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCW15YpAc8hjPhDX9be7YdRg", handle: "@Slayerkey", name: "Slayerkey", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCH__y98F7DyZaw_C3LdGu-A", handle: "@SenaVL", name: "Sena", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCcCTL6IEX64sXTOba-Iz6gA", handle: "@RemValorant", name: "Rem", kind: "creator", playlist: true, skin: true }),
  Object.freeze({ id: "UCHNd-wW9s1d7VGvd3qJgp5g", handle: "@rooneyVAL", name: "Rooney", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UC7BbRccnD432c3AADwFq1VQ", handle: "@Charla7an", name: "Charla7an", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCgIriwgZBo34xOp96Xsp4Yw", handle: "@ThinkingMansValorant", name: "Thinking Man's Valorant", kind: "creator", playlist: true, skin: false })
]);

export const TRUSTED_TWITCH_CHANNELS = Object.freeze([
  "Subroza", "Dasnerth", "Charla7an", "curry", "inspire", "eggster", "s0mcs", "ShahZaM",
  "Grimm", "Hiko", "sinatraa", "zekken", "Xeppaa", "temet", "LFToxy_val", "TenZ", "Keeoh",
  "AunaWEEB", "ethos", "florescent", "shanks_ttv", "VALORANT_EMEA", "VALORANT_Americas",
  "VALORANT_NorthAmerica", "VALORANT", "VALORANT_Pacific", "crunchVAL", "madaa", "canezerraa"
]);

const TOPIC_KEYWORDS = Object.freeze({
  Role: Object.freeze(["role", "controller", "duelist", "initiator", "sentinel", "entry", "entries", "lurk", "anchor"]),
  Agent: Object.freeze(["agent", "agents", ...AGENT_NAMES.map(name => normalizeSearchText(name))]),
  "Map Knowledge": Object.freeze(MAP_NAMES.map(name => normalizeSearchText(name))),
  Mechanics: Object.freeze(["aim", "crosshair", "flick", "spray", "recoil", "gunfight", "peeking", "one tapped", "sensitivity", "movement", "strafe", "deadzon", "counter straf", "jump peek", "jiggle"]),
  Mentality: Object.freeze(["mindset", "tilt", "toxic", "confidence", "mental", "improving", "hardstuck", "comms", "communication", "callout", "teammate", "teamplay", "igl"]),
  "Settings/Gear": Object.freeze(["settings", "gear", "peripheral", "peripherals", "monitor", "icc", "color", "clarity", "graphics", "nvidia", "pc settings", "resolution", "sens", "sensitivity"])
});

const GENERAL_PLAYLIST_TITLE_PATTERNS = Object.freeze([
  /\bhow to actually improve game sense in valorant\b/i
]);

function decodeHtml(value = "") {
  return String(value)
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

export function normalizeSearchText(value = "") {
  return decodeHtml(String(value))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function playlistTargetSlug(value = "") {
  return normalizeSearchText(value).replace(/\s+/g, "-");
}

function getPlaylistTopicOverride(video = {}) {
  const topic = String(video.topicTypeOverride || "").trim();
  return PLAYLIST_TOPIC_TYPE_SET.has(topic) ? topic : "";
}

export function getStaticPlaylistVideos() {
  return STATIC_PLAYLIST_VIDEOS.map(video => Object.freeze({ ...video }));
}

export function getCuratedPlaylistResearchArchive() {
  return Object.freeze(CURATED_PLAYLIST_RESEARCH_ARCHIVE.map(video => Object.freeze({
    ...video,
    entities: Object.freeze([...(video.entities || [video.targetName].filter(Boolean))])
  })));
}

// Kept as a video-oriented alias for callers that treat every Playlist source
// as media rather than as an archive record.
export const getCuratedPlaylistResearchVideos = getCuratedPlaylistResearchArchive;

function normalizeOwnerResearchPlaylistVideo(source = {}) {
  // The source registry is the knowledge pipeline's deliberately public-safe
  // boundary. Keep this mapping explicit: private transcripts, claims,
  // confidence, and consensus data must never reach the public Playlist.
  if (String(source.sourceKind || "").trim() !== OWNER_RESEARCH_SOURCE_KIND) return null;
  const platform = String(source.platform || "").trim().toLowerCase();
  const upstreamId = String(source.upstreamId || "").trim();
  const validYouTubeId = /^[A-Za-z0-9_-]{11}$/.test(upstreamId);
  const validTwitchId = /^\d+$/.test(upstreamId);
  if ((platform !== "youtube" || !validYouTubeId) && (platform !== "twitch" || !validTwitchId)) return null;

  const title = String(source.title || "").trim();
  const channel = String(source.publisher || "").trim();
  const url = String(source.url || "").trim();
  if (!title || !channel || !url) return null;
  const topicTypeOverride = PLAYLIST_TOPIC_TYPE_SET.has(String(source.topicType || "").trim())
    ? String(source.topicType).trim()
    : "";
  const entities = Object.freeze((Array.isArray(source.entities) ? source.entities : [])
    .map(entity => String(entity || "").trim())
    .filter(Boolean));

  return Object.freeze({
    id: upstreamId,
    upstreamId,
    platform,
    channel,
    channelKind: "owner-submitted",
    title,
    url,
    thumbnail: platform === "youtube" ? `https://i.ytimg.com/vi/${upstreamId}/hqdefault.jpg` : "",
    sourceType: "owner-submitted-research",
    topicTypeOverride,
    entities,
    publishedAt: String(source.registeredAt || "").trim(),
    isLive: false,
    wasLive: false,
    isVod: platform === "twitch",
    isShort: false,
    hasStructuralMediaMetadata: true,
    isValorant: true
  });
}

/**
 * Returns public Playlist candidates for owner-submitted Research videos.
 *
 * This intentionally reads only the source registry's normalized metadata
 * fields. The private transcript, claims, review, and consensus KV records
 * remain outside this reader and cannot leak through the Playlist response.
 */
export async function getResearchSubmittedVideos(kv) {
  if (!kv?.get) return Object.freeze([]);
  const registry = await kv.get(KNOWLEDGE_STORAGE_KEYS.sourceRegistry, "json");
  const videos = (Array.isArray(registry?.sources) ? registry.sources : [])
    .map(normalizeOwnerResearchPlaylistVideo)
    .filter(Boolean);
  return Object.freeze(videos);
}

function playlistResearchIdentity(video = {}) {
  const url = String(video.url || "");
  const platform = String(
    video.platform
    || (/(?:^|\.)twitch\.tv\b/i.test(url) ? "twitch" : "youtube")
  ).trim().toLowerCase();
  let upstreamId = String(video.upstreamId || video.id || "").trim();
  if (platform === "youtube") {
    upstreamId = url.match(/[?&]v=([A-Za-z0-9_-]{11})(?:[&#]|$)/)?.[1]
      || url.match(/youtu\.be\/([A-Za-z0-9_-]{11})(?:[?&#/]|$)/i)?.[1]
      || upstreamId.replace(/^youtube-/i, "");
  } else if (platform === "twitch") {
    upstreamId = url.match(/twitch\.tv\/videos\/(\d+)(?:[?&#/]|$)/i)?.[1]
      || upstreamId.replace(/^twitch-/i, "");
  }
  return platform && upstreamId ? `${platform}:${upstreamId}` : "";
}

export function dedupePlaylistVideos(items = []) {
  const identities = new Set();
  const deduped = [];
  for (const item of Array.isArray(items) ? items : []) {
    const identity = playlistResearchIdentity(item);
    if (!identity || identities.has(identity)) continue;
    identities.add(identity);
    deduped.push(item);
  }
  return Object.freeze(deduped);
}

export function mergePlaylistResearchArchive(staleItems = [], currentItems = [], curatedItems = []) {
  // `dedupePlaylistVideos` keeps the first occurrence, so precedence is made
  // explicit here: curated > current upstream metadata > stale archive.
  return dedupePlaylistVideos([
    ...(Array.isArray(curatedItems) ? curatedItems : []),
    ...(Array.isArray(currentItems) ? currentItems : []),
    ...(Array.isArray(staleItems) ? staleItems : [])
  ]);
}

/**
 * Builds the public, intentionally separate Historical Playlist archive.
 *
 * The owner-curated guide manifest was originally registered solely for the
 * private research pipeline. It is public video metadata, though, and players
 * need a durable way to find those map, agent, and role guides without
 * displacing the time-bounded Featured feed. Keep the two collections
 * separate: a guide already present in the actual Featured result is omitted
 * here by canonical platform/video identity, but a candidate merely trimmed
 * from the 120-card Featured cap remains discoverable in Historical.
 */
export function buildHistoricalPlaylistArchive(
  curatedItems = [],
  featuredItems = [],
  patchLabel = "",
  suppressedIds = new Set(),
  now = Date.now()
) {
  const featuredIdentities = new Set((Array.isArray(featuredItems) ? featuredItems : [])
    .map(playlistResearchIdentity)
    .filter(Boolean));
  const historicalCandidates = dedupePlaylistVideos(Array.isArray(curatedItems) ? curatedItems : [])
    .filter(video => !featuredIdentities.has(playlistResearchIdentity(video)));
  return buildFeaturedPlaylist(
    historicalCandidates,
    patchLabel,
    suppressedIds,
    now,
    { maxItems: PLAYLIST_KNOWLEDGE_SOURCE_MAX_ITEMS }
  );
}

export function getPlaylistGuideSearchTargets() {
  return GUIDE_SEARCH_TARGETS.map(target => Object.freeze({ ...target }));
}

function getGuideTargetAliases(targetName = "") {
  const normalized = normalizeSearchText(targetName);
  const aliases = new Set([normalized]);
  const compressed = normalized.replace(/\s+/g, "");
  if (compressed && compressed !== normalized) aliases.add(compressed);
  if (normalized === "kay o") aliases.add("kayo");
  return [...aliases].filter(Boolean);
}

function hasGuideTargetCue(text = "", targetName = "") {
  const padded = ` ${normalizeSearchText(text)} `;
  return getGuideTargetAliases(targetName).some(alias => padded.includes(` ${alias} `));
}

function hasGuideCue(text = "") {
  const normalized = normalizeSearchText(text);
  return /\b(?:guide|how to|tips?|tutorial|lineups?|setups?|setup|playbook|complete|ultimate|learn|master|masterclass|ranked|pro analysis)\b/.test(normalized);
}

function hasGuideRejectCue(text = "") {
  const normalized = normalizeSearchText(text);
  return /\b(?:montage|highlights?|fragmovie|cinematic|trailer|reaction|reacts?|clips?|leaks?|skin|skins|bundle|bundles|night market)\b/.test(normalized);
}

export function isPopularGuideSearchCandidate(video = {}, target = {}) {
  const title = String(video.title || "");
  const description = String(video.description || "");
  const text = `${title} ${description}`;
  if (!/^[A-Za-z0-9_-]{11}$/.test(String(video.id || ""))) return false;
  if (video.isLive || video.wasLive || video.isVod || video.isShort) return false;
  if (!hasValorantMetadata(video) && !/\bvalorant\b/i.test(text)) return false;
  if (!hasGuideTargetCue(title, target.targetName)) return false;
  if (!hasGuideCue(text)) return false;
  if (hasGuideRejectCue(title)) return false;
  return true;
}

export function getPatchDescriptor(payload = {}) {
  const branch = String(payload.branch || "").trim();
  const match = branch.match(/^release-(\d+)\.(\d+)$/i);
  if (!match) throw new Error("The current Valorant branch did not contain a patch number.");
  const label = `${Number(match[1])}.${String(match[2]).padStart(2, "0")}`;
  const slug = `${Number(match[1])}-${String(match[2]).padStart(2, "0")}`;
  return Object.freeze({ branch, version: String(payload.version || ""), label, slug, notesUrl: `${RIOT_NEWS_ROOT}/valorant-patch-notes-${slug}/` });
}

async function getLatestRiotPatchNotesDescriptor() {
  const listingHtml = await fetchText(`${RIOT_NEWS_ROOT}/`);
  const entries = [...String(listingHtml).matchAll(/\/en-us\/news\/game-updates\/valorant-patch-notes-(\d+)-(\d+)\/?/gi)]
    .map(match => {
      const major = Number(match[1]);
      const minor = Number(match[2]);
      if (!Number.isFinite(major) || !Number.isFinite(minor)) return null;
      const slug = `${major}-${String(minor).padStart(2, "0")}`;
      return {
        major,
        minor,
        label: `${major}.${String(minor).padStart(2, "0")}`,
        slug,
        notesUrl: `${RIOT_NEWS_ROOT}/valorant-patch-notes-${slug}/`
      };
    })
    .filter(Boolean);
  const seen = new Set();
  const unique = entries.filter(entry => {
    if (seen.has(entry.slug)) return false;
    seen.add(entry.slug);
    return true;
  });
  unique.sort((left, right) => (right.major - left.major) || (right.minor - left.minor));
  const latest = unique[0];
  if (!latest) throw new Error("No official Riot patch note links were found.");
  return Object.freeze({
    ...latest,
    branch: `riot-news-${latest.label}`,
    version: latest.label,
    sourceIndexUrl: `${RIOT_NEWS_ROOT}/`
  });
}

function unwrapValorantApiData(payload = {}) {
  return payload?.data && typeof payload.data === "object" ? payload.data : payload;
}

function stripHtml(value = "") {
  return decodeHtml(String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
}

export function extractBalanceUpdateText(html = "") {
  const headings = [...String(html).matchAll(/<h([12])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match => ({
    index: match.index,
    end: match.index + match[0].length,
    level: Number(match[1]),
    text: stripHtml(match[2]).toUpperCase()
  }));
  const wanted = new Set(["AGENTS UPDATES", "WEAPONS UPDATES"]);
  return headings.filter(heading => wanted.has(heading.text)).map(heading => {
    const next = headings.find(candidate => candidate.index > heading.index && candidate.level <= heading.level);
    return stripHtml(String(html).slice(heading.end, next?.index || String(html).length));
  }).join(" ");
}

export function findAffectedDossiers(text = "", agents = AGENT_NAMES, weapons = WEAPON_NAMES) {
  const normalized = ` ${normalizeSearchText(text)} `;
  return [...agents, ...weapons].map(name => {
    const token = normalizeSearchText(name);
    return { name, index: token ? normalized.indexOf(` ${token} `) : -1 };
  }).filter(entry => entry.index >= 0).sort((left, right) => left.index - right.index).map(entry => entry.name);
}

function xmlTag(entry = "", tag = "") {
  const escaped = tag.replace(":", "\\:");
  return decodeHtml(entry.match(new RegExp(`<${escaped}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${escaped}>`, "i"))?.[1] || "").trim();
}

export function parseYouTubeFeed(xml = "", channel = {}) {
  return [...String(xml).matchAll(/<entry>([\s\S]*?)<\/entry>/gi)].map(match => {
    const entry = match[1];
    const id = xmlTag(entry, "yt:videoId");
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    const description = stripHtml(xmlTag(entry, "media:description"));
    return Object.freeze({
      id,
      title: stripHtml(xmlTag(entry, "title")),
      description,
      channelId: channel.id,
      channel: channel.name,
      channelKind: channel.kind,
      publishedAt: xmlTag(entry, "published"),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`,
      platform: "youtube"
    });
  }).filter(Boolean);
}

function parseIsoDurationSeconds(value = "") {
  const match = String(value).match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i);
  return match ? Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0) : 0;
}

function hasYouTubeShortCue(video = {}) {
  const text = `${video.title || ""} ${video.description || ""}`;
  return /(?:^|\s)#shorts?\b/i.test(text) || (Number(video.durationSeconds) > 0 && Number(video.durationSeconds) <= 60);
}

function hasValorantMetadata(video = {}) {
  const tags = Array.isArray(video.tags) ? video.tags.join(" ") : "";
  return /\bvalorant\b/i.test(`${video.title || ""} ${video.description || ""} ${tags}`);
}

function hasNewsCue(video = {}, sourceType = "") {
  if (sourceType === "patch-breakdown") return true;
  const text = normalizeSearchText(`${video.title || ""} ${video.description || ""}`);
  return /\b(?:patch|update|buff|buffs|buffed|buffing|nerf|nerfs|nerfed|nerfing|ban|bans|banned|banning|anti cheat|smurfing|win trading|queue sniping|night market|new agent|new map|ranked changes|competitive changes)\b/.test(text);
}

function getLiveStreamingClassification(video = {}) {
  if (video.isLive === true) {
    return Object.freeze({ matches: true, confidence: "verified", reason: "current-live-signal" });
  }
  if (video.sourceType === "twitch-archive" || (video.platform === "twitch" && video.isVod === true)) {
    return Object.freeze({ matches: false, confidence: "verified", reason: "twitch-archive-vod" });
  }
  if (video.wasLive === true) {
    return Object.freeze({ matches: false, confidence: "verified", reason: "youtube-vod-metadata" });
  }
  if (video.hasStructuralMediaMetadata === true || Number(video.durationSeconds || 0) < 1800) {
    return Object.freeze({ matches: false, confidence: "verified", reason: "not-an-archive" });
  }
  return Object.freeze({
    matches: false,
    confidence: "unclassified",
    reason: "no-current-live-signal"
  });
}

function isPlaylistVodSource(video = {}, sourceType = "") {
  return Boolean(video.isVod || video.wasLive)
    || sourceType === "twitch-archive"
    || sourceType === "youtube-vod"
    || (video.platform === "twitch" && /twitch\.tv\/videos\/\d+/i.test(String(video.url || "")));
}

async function enrichYouTubeVideos(videos = [], apiKey = "") {
  if (!apiKey || !videos.length) return videos.map(video => Object.freeze({
    ...video,
    isShort: hasYouTubeShortCue(video),
    isLive: false,
    wasLive: false,
    isVod: false,
    hasStructuralMediaMetadata: false
  }));
  const metadata = new Map();
  for (let index = 0; index < videos.length; index += 50) {
    const ids = videos.slice(index, index + 50).map(video => video.id).filter(Boolean);
    const url = new URL(`${YOUTUBE_API_ROOT}/videos`);
    url.searchParams.set("part", "snippet,contentDetails,liveStreamingDetails");
    url.searchParams.set("id", ids.join(","));
    url.searchParams.set("key", apiKey);
    const payload = await fetchJson(url);
    (payload.items || []).forEach(item => metadata.set(String(item.id), item));
  }
  return videos.map(video => {
    const item = metadata.get(video.id);
    const snippet = item?.snippet || {};
    const liveDetails = item?.liveStreamingDetails || {};
    const wasLive = Boolean(liveDetails.actualStartTime && liveDetails.actualEndTime);
    const enriched = {
      ...video,
      title: decodeHtml(snippet.title || video.title),
      description: decodeHtml(snippet.description || video.description || ""),
      channelId: String(video.channelId || snippet.channelId || ""),
      channel: String(video.channel || snippet.channelTitle || ""),
      publishedAt: String(snippet.publishedAt || video.publishedAt || ""),
      thumbnail: String(snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || video.thumbnail),
      tags: Array.isArray(snippet.tags) ? snippet.tags : [],
      durationSeconds: parseIsoDurationSeconds(item?.contentDetails?.duration),
      isLive: snippet.liveBroadcastContent === "live" && !liveDetails.actualEndTime,
      wasLive,
      hasStructuralMediaMetadata: Boolean(item),
      viewerCount: Number(liveDetails.concurrentViewers)
    };
    return Object.freeze({ ...enriched, isShort: hasYouTubeShortCue(enriched), isVod: wasLive, isValorant: hasValorantMetadata(enriched) });
  });
}

function getYouTubeVideoId(video = {}) {
  const platform = String(video.platform || "youtube").trim().toLowerCase();
  const id = String(video.upstreamId || video.id || "").trim();
  return platform === "youtube" && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : "";
}

function parseYouTubeLikeCount(value) {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+$/.test(value))) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

function buildYouTubeLikeMetric(status = "unavailable", likeCount = null) {
  const verifiedLikeCount = status === "verified" ? parseYouTubeLikeCount(likeCount) : null;
  return Object.freeze({
    youtubeLikeCount: verifiedLikeCount,
    youtubeLikeMetricStatus: verifiedLikeCount === null ? "unavailable" : "verified",
    ...(verifiedLikeCount === null ? {} : { youtubeLikeMetricSource: "youtube-data-api-v3" })
  });
}

async function readCachedYouTubeLikeMetric(kv, videoId = "") {
  if (!kv?.get || !videoId) return null;
  try {
    const cached = await kv.get(`${PLAYLIST_YOUTUBE_LIKE_METRIC_CACHE_PREFIX}${videoId}`, "json");
    if (!cached || Date.parse(cached.expiresAt || 0) <= Date.now()) return null;
    if (cached.status === "verified" && parseYouTubeLikeCount(cached.likeCount) !== null) {
      return buildYouTubeLikeMetric("verified", cached.likeCount);
    }
    return cached.status === "unavailable" ? buildYouTubeLikeMetric("unavailable") : null;
  } catch {
    // Metrics are optional enrichment. A cache read failure must not hide the Playlist.
    return null;
  }
}

async function writeCachedYouTubeLikeMetric(kv, videoId = "", metric = {}) {
  if (!kv?.put || !videoId) return;
  const verified = metric.youtubeLikeMetricStatus === "verified" && Number.isSafeInteger(metric.youtubeLikeCount);
  const ttl = verified ? PLAYLIST_YOUTUBE_LIKE_METRIC_CACHE_TTL_SECONDS : PLAYLIST_YOUTUBE_LIKE_METRIC_UNAVAILABLE_CACHE_TTL_SECONDS;
  const record = {
    status: verified ? "verified" : "unavailable",
    likeCount: verified ? metric.youtubeLikeCount : null,
    checkedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
  };
  try {
    await kv.put(`${PLAYLIST_YOUTUBE_LIKE_METRIC_CACHE_PREFIX}${videoId}`, JSON.stringify(record), { expirationTtl: ttl });
  } catch {
    // A failed cache write only means the next refresh will re-check YouTube.
  }
}

/**
 * Adds only official YouTube like counts to public Playlist records.
 *
 * `statistics.likeCount` comes from YouTube Data API v3. There is deliberately
 * no guessed count, scrape, or in-app rating fallback: a missing API key,
 * inaccessible video, disabled rating, or upstream failure is marked plainly
 * as unavailable and the card keeps its direct YouTube link.
 */
export async function enrichYouTubeLikeMetrics(videos = [], env = {}) {
  const sourceVideos = Array.isArray(videos) ? videos : [];
  const apiKey = String(env.YOUTUBE_DATA_API_KEY || "").trim();
  const videoIds = [...new Set(sourceVideos.map(getYouTubeVideoId).filter(Boolean))];
  if (!videoIds.length) return Object.freeze(sourceVideos.map(video => Object.freeze({ ...video })));
  if (!apiKey) return Object.freeze(sourceVideos.map(video => {
    const videoId = getYouTubeVideoId(video);
    return Object.freeze(videoId ? { ...video, ...buildYouTubeLikeMetric("unavailable") } : { ...video });
  }));

  const cachedEntries = await Promise.all(videoIds.map(async videoId => [
    videoId,
    await readCachedYouTubeLikeMetric(env.CONTENT_AUTOMATION, videoId)
  ]));
  const metrics = new Map(cachedEntries.filter(([, metric]) => metric));
  const uncachedIds = videoIds.filter(videoId => !metrics.has(videoId));
  const fetchedMetrics = new Map();

  for (let index = 0; index < uncachedIds.length; index += 50) {
    const ids = uncachedIds.slice(index, index + 50);
    const url = new URL(`${YOUTUBE_API_ROOT}/videos`);
    url.searchParams.set("part", "statistics");
    url.searchParams.set("id", ids.join(","));
    url.searchParams.set("key", apiKey);
    try {
      const payload = await fetchJson(url);
      const returnedIds = new Set();
      for (const item of payload.items || []) {
        const videoId = String(item?.id || "");
        if (!ids.includes(videoId)) continue;
        returnedIds.add(videoId);
        fetchedMetrics.set(videoId, buildYouTubeLikeMetric("verified", item?.statistics?.likeCount));
      }
      // A valid API response with no item (private/deleted) or no public count
      // is an honest unavailable state and can be cached briefly.
      ids.filter(videoId => !returnedIds.has(videoId)).forEach(videoId => {
        fetchedMetrics.set(videoId, buildYouTubeLikeMetric("unavailable"));
      });
    } catch {
      // Keep this refresh healthy if YouTube is temporarily unavailable. Do not
      // cache a transient error; the next request can recover with a real count.
    }
  }

  await Promise.allSettled([...fetchedMetrics.entries()].map(([videoId, metric]) =>
    writeCachedYouTubeLikeMetric(env.CONTENT_AUTOMATION, videoId, metric)
  ));
  fetchedMetrics.forEach((metric, videoId) => metrics.set(videoId, metric));

  return Object.freeze(sourceVideos.map(video => {
    const videoId = getYouTubeVideoId(video);
    const metric = videoId ? metrics.get(videoId) || buildYouTubeLikeMetric("unavailable") : null;
    return Object.freeze(metric ? { ...video, ...metric } : { ...video });
  }));
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Upstream request failed with HTTP ${response.status}.`);
  return response.json();
}

async function fetchText(url, init = {}) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`Upstream request failed with HTTP ${response.status}.`);
  const contentLength = Number(response.headers.get("Content-Length") || 0);
  if (contentLength > 2_500_000) throw new Error("Upstream document exceeded the review parser limit.");
  const text = await response.text();
  if (text.length > 2_500_000) throw new Error("Upstream document exceeded the review parser limit.");
  return text;
}

export async function fetchTrustedChannelVideos(env = {}, options = {}) {
  const channels = (options.channels || TRUSTED_YOUTUBE_CHANNELS).filter(channel => options.kind ? channel[options.kind] : true);
  const apiKey = String(env.YOUTUBE_DATA_API_KEY || "").trim();
  const results = await Promise.allSettled(channels.map(async channel => {
    const url = new URL(YOUTUBE_FEED_ROOT);
    url.searchParams.set("channel_id", channel.id);
    return parseYouTubeFeed(await fetchText(url), channel);
  }));
  const batches = results.filter(result => result.status === "fulfilled").map(result => result.value);
  if (!batches.length) throw new Error("No trusted YouTube channel could be refreshed.");
  const videos = batches.flat().sort((left, right) => Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0));
  return enrichYouTubeVideos(videos, apiKey);
}

async function readCachedGuideSearchVideo(kv, cacheKey = "", target = {}) {
  if (!kv?.get || !cacheKey) return undefined;
  const cached = await kv.get(cacheKey, "json");
  if (!cached?.expiresAt || Date.parse(cached.expiresAt) <= Date.now()) return undefined;
  if (!cached.video) return null;
  const video = Object.freeze(cached.video);
  return isPopularGuideSearchCandidate(video, target) ? video : undefined;
}

async function writeCachedGuideSearchVideo(kv, cacheKey = "", video = null) {
  if (!kv?.put || !cacheKey) return;
  const hasVideo = Boolean(video);
  const ttl = hasVideo ? PLAYLIST_GUIDE_SEARCH_CACHE_TTL_SECONDS : PLAYLIST_GUIDE_SEARCH_MISS_TTL_SECONDS;
  await kv.put(cacheKey, JSON.stringify({
    video,
    cachedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
  }), { expirationTtl: ttl });
}

async function fetchMostPopularGuideForTarget(env = {}, target = {}) {
  const apiKey = String(env.YOUTUBE_DATA_API_KEY || "").trim();
  if (!apiKey || !target?.targetName) return null;
  const cacheKey = `playlist:guide-search:${String(target.targetType || "target").toLowerCase()}:${playlistTargetSlug(target.targetName)}`;
  const cached = await readCachedGuideSearchVideo(env.CONTENT_AUTOMATION, cacheKey, target);
  if (cached !== undefined) return cached;
  const searchUrl = new URL(`${YOUTUBE_API_ROOT}/search`);
  searchUrl.searchParams.set("part", "snippet");
  searchUrl.searchParams.set("q", `Valorant ${target.targetName} Guide`);
  searchUrl.searchParams.set("type", "video");
  searchUrl.searchParams.set("order", "viewCount");
  searchUrl.searchParams.set("regionCode", "US");
  searchUrl.searchParams.set("relevanceLanguage", "en");
  searchUrl.searchParams.set("safeSearch", "moderate");
  searchUrl.searchParams.set("videoEmbeddable", "true");
  searchUrl.searchParams.set("maxResults", "8");
  searchUrl.searchParams.set("key", apiKey);
  const payload = await fetchJson(searchUrl);
  const candidates = (payload.items || []).map(item => {
    const id = String(item?.id?.videoId || "");
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    const snippet = item.snippet || {};
    return Object.freeze({
      id,
      platform: "youtube",
      channelId: String(snippet.channelId || ""),
      channel: String(snippet.channelTitle || ""),
      channelKind: "searched-guide",
      title: decodeHtml(snippet.title || ""),
      description: decodeHtml(snippet.description || ""),
      publishedAt: String(snippet.publishedAt || ""),
      thumbnail: String(snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`),
      url: `https://www.youtube.com/watch?v=${id}`
    });
  }).filter(Boolean);
  const enriched = await enrichYouTubeVideos(candidates, apiKey);
  const match = enriched.find(video => isPopularGuideSearchCandidate(video, target));
  const video = match ? Object.freeze({
    ...match,
    sourceType: "searched-guide",
    topicTypeOverride: target.topicType,
    targetType: target.targetType,
    targetName: target.targetName,
    searchTerm: `Valorant ${target.targetName} Guide`,
    isCatalogPinned: true
  }) : null;
  await writeCachedGuideSearchVideo(env.CONTENT_AUTOMATION, cacheKey, video);
  return video;
}

export async function fetchPopularGuideSearchVideos(env = {}, options = {}) {
  const apiKey = String(env.YOUTUBE_DATA_API_KEY || "").trim();
  if (!apiKey) return [];
  const targets = Array.isArray(options.targets) && options.targets.length ? options.targets : GUIDE_SEARCH_TARGETS;
  const videos = [];
  const searchTargets = [];
  for (const target of targets) {
    const cacheKey = `playlist:guide-search:${String(target.targetType || "target").toLowerCase()}:${playlistTargetSlug(target.targetName)}`;
    const cached = await readCachedGuideSearchVideo(env.CONTENT_AUTOMATION, cacheKey, target);
    if (cached) {
      videos.push(cached);
    } else if (cached === undefined) {
      searchTargets.push(target);
    }
  }
  const batchSize = Math.max(1, Math.min(8, Number(options.batchSize || 6)));
  for (let index = 0; index < searchTargets.length; index += batchSize) {
    const batch = searchTargets.slice(index, index + batchSize);
    const results = await Promise.allSettled(batch.map(target => fetchMostPopularGuideForTarget(env, target)));
    results.forEach((result, offset) => {
      if (result.status === "fulfilled" && result.value) videos.push(result.value);
      if (result.status === "rejected") console.warn(`Popular guide search skipped for ${batch[offset]?.targetName || "unknown target"}`, result.reason?.message || result.reason);
    });
  }
  return videos;
}

export function categorizeCreatorTitle(title = "") {
  if (GENERAL_PLAYLIST_TITLE_PATTERNS.some(pattern => pattern.test(String(title || "")))) return "General";
  const normalized = normalizeSearchText(title);
  let best = null;
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const score = keywords.reduce((total, keyword) => total + (normalized.includes(normalizeSearchText(keyword)) ? 1 : 0), 0);
    if (score > (best?.score || 0)) best = { topic, score };
  }
  return best?.score ? best.topic : "General";
}

function getVideoSourceType(video, patchLabel = "") {
  if (video.sourceType) return String(video.sourceType);
  const title = normalizeSearchText(video.title);
  if (video.channelKind === "creator") return "creator-guide";
  if (patchLabel && title.includes(`patch ${normalizeSearchText(patchLabel)}`)) return "patch-breakdown";
  if (/(skin|bundle|collection|showcase|reveal)/.test(title)) return "bundle-showcase";
  return "riot-official";
}

export function buildFeaturedPlaylist(videos = [], patchLabel = "", suppressedIds = new Set(), now = Date.now(), options = {}) {
  const maxItems = Math.max(1, Math.min(
    PLAYLIST_KNOWLEDGE_SOURCE_MAX_ITEMS,
    Number(options.maxItems || PLAYLIST_MAX_ITEMS)
  ));
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const items = videos
    .filter(video => !suppressedIds.has(video.id))
    .sort((left, right) => {
      const pinnedDelta = Number(Boolean(right.isCatalogPinned)) - Number(Boolean(left.isCatalogPinned));
      return pinnedDelta || (Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0));
    })
    .map(video => {
    const sourceType = getVideoSourceType(video, patchLabel);
    const streaming = getLiveStreamingClassification({ ...video, sourceType });
    const topicOverride = getPlaylistTopicOverride(video);
    const topicType = streaming.matches
      ? "Live/Streaming"
      : isPlaylistVodSource(video, sourceType)
        ? "VOD's"
      : topicOverride
        ? topicOverride
      : (sourceType === "riot-official" || sourceType === "patch-breakdown") && hasNewsCue(video, sourceType)
        ? "News"
        : video.isShort
          ? "YT Shorts"
          : (sourceType === "creator-guide" || sourceType === "searched-guide")
            ? categorizeCreatorTitle(video.title)
            : "General";
    return Object.freeze({
      ...video,
      sourceType,
      topicType,
      classificationConfidence: streaming.matches ? streaming.confidence : "verified",
      classificationReason: streaming.reason,
      needsContentReview: streaming.matches && streaming.confidence === "low",
      isNewThisWeek: Date.parse(video.publishedAt || 0) >= oneWeekAgo,
      isNewIn24Hours: Date.parse(video.publishedAt || 0) >= oneDayAgo
    });
  }).slice(0, maxItems);
  const currentPatchVideo = items.find(item => item.sourceType === "patch-breakdown") || null;
  return Object.freeze({
    patchLabel,
    patchTag: currentPatchVideo ? `Patch ${patchLabel} Breakdown Inside` : "",
    newThisWeek: items.filter(item => item.isNewThisWeek).length,
    newIn24Hours: items.filter(item => item.isNewIn24Hours).length,
    items: Object.freeze(items)
  });
}

function buildYouTubeLiveStreams(videos = []) {
  return videos.filter(video => video.isLive && video.isValorant).map(video => Object.freeze({
    id: video.id,
    platform: "youtube",
    channel: video.channel,
    title: video.title,
    viewerCount: Number.isFinite(video.viewerCount) ? video.viewerCount : null,
    thumbnail: video.thumbnail,
    url: video.url,
    startedAt: video.publishedAt
  }));
}

async function getTwitchAppAccessToken(env = {}) {
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const clientSecret = String(env.TWITCH_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) return "";
  const cached = await env.CONTENT_AUTOMATION?.get?.(TWITCH_TOKEN_CACHE_KEY, "json");
  if (cached?.accessToken && Date.parse(cached.expiresAt || 0) > Date.now() + 60_000) return cached.accessToken;
  const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" });
  const token = await fetchJson("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  const accessToken = String(token.access_token || "");
  if (!accessToken) throw new Error("Twitch did not return an app access token.");
  const expiresIn = Math.max(120, Number(token.expires_in || 3600));
  await env.CONTENT_AUTOMATION?.put?.(TWITCH_TOKEN_CACHE_KEY, JSON.stringify({
    accessToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
  }), { expirationTtl: expiresIn });
  return accessToken;
}

function parseTwitchDurationSeconds(value = "") {
  const match = String(value).match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  return match ? Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0) : 0;
}

function normalizeTwitchThumbnail(value = "") {
  return String(value)
    .replace(/%?\{width\}/g, "640")
    .replace(/%?\{height\}/g, "360");
}

async function fetchTrustedTwitchUsers(env = {}, channels = TRUSTED_TWITCH_CHANNELS, accessToken = "") {
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const token = accessToken || await getTwitchAppAccessToken(env);
  if (!clientId || !token) return [];
  const url = new URL(`${TWITCH_API_ROOT}/users`);
  channels.slice(0, 100).forEach(channel => url.searchParams.append("login", channel));
  const payload = await fetchJson(url, { headers: { "Client-Id": clientId, Authorization: `Bearer ${token}` } });
  return payload.data || [];
}

export async function fetchTrustedTwitchStreams(env = {}, channels = TRUSTED_TWITCH_CHANNELS, options = {}) {
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const accessToken = options.accessToken || await getTwitchAppAccessToken(env);
  if (!clientId || !accessToken) return [];
  const url = new URL(`${TWITCH_API_ROOT}/streams`);
  channels.slice(0, 100).forEach(channel => url.searchParams.append("user_login", channel));
  const payload = await fetchJson(url, { headers: { "Client-Id": clientId, Authorization: `Bearer ${accessToken}` } });
  return (payload.data || []).filter(stream => stream.type === "live" && String(stream.game_name || "").toLowerCase() === "valorant").map(stream => Object.freeze({
    id: String(stream.id || stream.user_login),
    platform: "twitch",
    channel: String(stream.user_name || stream.user_login),
    title: String(stream.title || `${stream.user_name || stream.user_login} is live`),
    viewerCount: Number(stream.viewer_count),
    thumbnail: normalizeTwitchThumbnail(stream.thumbnail_url),
    url: `https://www.twitch.tv/${encodeURIComponent(stream.user_login)}`,
    startedAt: String(stream.started_at || "")
  }));
}

export async function fetchTrustedTwitchVods(env = {}, channels = TRUSTED_TWITCH_CHANNELS, options = {}) {
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const accessToken = options.accessToken || await getTwitchAppAccessToken(env);
  if (!clientId || !accessToken) return [];
  const users = await fetchTrustedTwitchUsers(env, channels, accessToken);
  const results = await Promise.allSettled(users.map(async user => {
    const url = new URL(`${TWITCH_API_ROOT}/videos`);
    url.searchParams.set("user_id", String(user.id || ""));
    url.searchParams.set("type", "archive");
    url.searchParams.set("first", "2");
    const payload = await fetchJson(url, { headers: { "Client-Id": clientId, Authorization: `Bearer ${accessToken}` } });
    return (payload.data || []).map(video => Object.freeze({
      id: `twitch-${String(video.id || "")}`,
      upstreamId: String(video.id || ""),
      platform: "twitch",
      channelId: String(user.id || video.user_id || ""),
      channel: String(video.user_name || user.display_name || user.login || ""),
      channelKind: "creator",
      title: String(video.title || `${user.display_name || user.login} past broadcast`),
      description: String(video.description || ""),
      publishedAt: String(video.published_at || video.created_at || ""),
      thumbnail: normalizeTwitchThumbnail(video.thumbnail_url),
      url: String(video.url || `https://www.twitch.tv/videos/${video.id}`),
      durationSeconds: parseTwitchDurationSeconds(video.duration),
      sourceType: "twitch-archive",
      isLive: false,
      wasLive: true,
      isVod: true,
      isShort: false,
      hasStructuralMediaMetadata: true
    }));
  }));
  return results
    .filter(result => result.status === "fulfilled")
    .flatMap(result => result.value)
    .sort((left, right) => Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0));
}

async function fetchTrustedTwitchMedia(env = {}) {
  const clientId = String(env.TWITCH_CLIENT_ID || "").trim();
  const accessToken = await getTwitchAppAccessToken(env);
  if (!clientId || !accessToken) return { streams: [], vods: [] };
  const [streamsResult, vodsResult] = await Promise.allSettled([
    fetchTrustedTwitchStreams(env, TRUSTED_TWITCH_CHANNELS, { accessToken }),
    fetchTrustedTwitchVods(env, TRUSTED_TWITCH_CHANNELS, { accessToken })
  ]);
  if (streamsResult.status === "rejected") console.warn("Twitch live refresh skipped", streamsResult.reason?.message || streamsResult.reason);
  if (vodsResult.status === "rejected") console.warn("Twitch archive refresh skipped", vodsResult.reason?.message || vodsResult.reason);
  return {
    streams: streamsResult.status === "fulfilled" ? streamsResult.value : [],
    vods: vodsResult.status === "fulfilled" ? vodsResult.value : []
  };
}

export function findConfidentCollectionVideo(collectionName = "", videos = []) {
  const collection = normalizeSearchText(collectionName);
  if (collection.length < 4) return null;
  const match = videos.find(video => {
    const title = normalizeSearchText(video.title);
    const hasCollectionName = (` ${title} `).includes(` ${collection} `);
    const hasMediaCue = /(skin|bundle|collection|showcase|reveal|worth buying)/.test(title)
      || (title.includes("new") && title.includes("valorant"));
    return hasCollectionName && hasMediaCue;
  });
  return match ? Object.freeze({
    id: match.id,
    title: match.title,
    channel: match.channel,
    playlistId: match.channel === "VALORANT" ? "PLTFsoy_DWCOMWzK4f6ICbroM1FzHW4S7j" : ""
  }) : null;
}

async function readSuppressedVideoIds(kv) {
  const ids = new Set();
  if (!kv?.list) return ids;
  let cursor;
  do {
    const page = await kv.list({ prefix: "video:suppressed:", cursor });
    (page.keys || []).forEach(key => ids.add(key.name.slice("video:suppressed:".length)));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return ids;
}

async function getCurrentPatch(env) {
  const cached = await env.CONTENT_AUTOMATION?.get?.("patch:last", "json");
  if (cached?.label) return cached;
  return getPatchDescriptor(unwrapValorantApiData(await fetchJson(VERSION_URL)));
}

async function notifyReview(env, message) {
  const topic = String(env.NTFY_TOPIC || DEFAULT_NTFY_TOPIC).trim();
  const response = await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
    method: "POST",
    headers: { Title: "RankedCoach" },
    body: message
  });
  if (!response.ok) throw new Error(`ntfy.sh responded with HTTP ${response.status}.`);
}

async function notifyLowConfidencePlaylistReviews(env, items = []) {
  const kv = env.CONTENT_AUTOMATION;
  if (!kv) return;
  const inferred = items.filter(item => item.needsContentReview && item.classificationReason === "title-fallback");
  const pending = [];
  for (const item of inferred) {
    const key = `review:playlist-classification:${encodeURIComponent(`${item.platform || "youtube"}:${item.id}`)}`;
    if (await kv.get(key)) continue;
    pending.push({ item, key });
  }
  if (!pending.length) return;
  const labels = pending.slice(0, 8).map(({ item }) => `${item.channel || "Unknown creator"}: ${item.title || item.id}`);
  await notifyReview(env, `Playlist content review needed - low-confidence title fallback marked Live/Streaming: ${labels.join(" | ")}`);
  await Promise.all(pending.map(({ key }) => kv.put(key, "1", { expirationTtl: PLAYLIST_CLASSIFICATION_REVIEW_TTL_SECONDS })));
}

function librarySlug(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function libraryFingerprint(value) {
  const text = JSON.stringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function canonicalAgentSnapshot(agent = {}) {
  const abilities = (agent.abilities || []).map(ability => ({
    slot: ability.slot,
    name: ability.displayName,
    description: ability.description,
    icon: ability.displayIcon
  }));
  return {
    id: librarySlug(agent.displayName),
    uuid: agent.uuid,
    label: agent.displayName,
    role: agent.role?.displayName || "",
    icon: agent.displayIconSmall || agent.displayIcon || "",
    portrait: agent.fullPortraitV2 || agent.fullPortrait || "",
    abilities,
    fingerprint: libraryFingerprint({ role: agent.role?.displayName, abilities })
  };
}

function canonicalMapSnapshot(map = {}) {
  const callouts = (map.callouts || []).map(callout => ({
    superRegionName: callout.superRegionName,
    regionName: callout.regionName,
    location: callout.location
  }));
  return {
    id: librarySlug(map.displayName),
    uuid: map.uuid,
    label: map.displayName,
    cardImage: map.splash || "",
    layoutImage: map.displayIcon || "",
    coordinates: map.coordinates || "",
    callouts,
    fingerprint: libraryFingerprint({
      displayIcon: map.displayIcon,
      splash: map.splash,
      coordinates: map.coordinates,
      callouts
    })
  };
}

function canonicalWeaponSnapshot(weapon = {}) {
  const stats = weapon.weaponStats || {};
  const values = {
    cost: weapon.shopData?.cost,
    category: weapon.shopData?.category,
    fireRate: stats.fireRate,
    magazineSize: stats.magazineSize,
    wallPenetration: stats.wallPenetration,
    damageRanges: stats.damageRanges
  };
  return {
    id: librarySlug(weapon.displayName),
    uuid: weapon.uuid,
    label: weapon.displayName,
    image: weapon.displayIcon || "",
    ...values,
    fingerprint: libraryFingerprint(values)
  };
}

export async function fetchLibraryEntitySnapshot() {
  const [agentsPayload, mapsPayload, weaponsPayload] = await Promise.all([
    fetchJson(AGENTS_URL),
    fetchJson(MAPS_URL),
    fetchJson(WEAPONS_URL)
  ]);
  const competitiveMaps = new Set(COMPETITIVE_MAP_NAMES);
  return Object.freeze({
    capturedAt: new Date().toISOString(),
    agents: Object.freeze(unwrapValorantApiData(agentsPayload).filter(Boolean).map(canonicalAgentSnapshot)),
    maps: Object.freeze(unwrapValorantApiData(mapsPayload).filter(map => competitiveMaps.has(map.displayName)).map(canonicalMapSnapshot)),
    weapons: Object.freeze(unwrapValorantApiData(weaponsPayload)
      .filter(weapon => weapon.shopData && weapon.weaponStats && weapon.displayName !== "Melee")
      .map(canonicalWeaponSnapshot))
  });
}

export function diffLibraryEntitySnapshots(previous = {}, current = {}) {
  const diffCategory = category => {
    const before = new Map((previous[category] || []).map(item => [item.uuid, item]));
    const after = new Map((current[category] || []).map(item => [item.uuid, item]));
    const added = [...after.values()].filter(item => !before.has(item.uuid));
    const changed = [...after.values()].filter(item => (
      before.has(item.uuid) && before.get(item.uuid).fingerprint !== item.fingerprint
    ));
    const removed = [...before.values()].filter(item => !after.has(item.uuid));
    return Object.freeze({ added: Object.freeze(added), changed: Object.freeze(changed), removed: Object.freeze(removed) });
  };
  return Object.freeze({
    agents: diffCategory("agents"),
    maps: diffCategory("maps"),
    weapons: diffCategory("weapons")
  });
}

function hasLibraryEntityChanges(diff = {}) {
  return ["agents", "maps", "weapons"].some(category => (
    (diff[category]?.added?.length || 0)
    + (diff[category]?.changed?.length || 0)
    + (diff[category]?.removed?.length || 0)
  ));
}

async function queueLibraryCanonicalDrafts(kv, diff, patch) {
  const queued = [];
  for (const category of ["agents", "maps", "weapons"]) {
    for (const changeType of ["added", "changed"]) {
      for (const entity of diff[category]?.[changeType] || []) {
        const draft = {
          schemaVersion: 1,
          category: category.slice(0, -1),
          slug: entity.id,
          operation: changeType === "added" ? "append" : "merge",
          patchVersion: patch.label,
          generatedAt: new Date().toISOString(),
          canonical: entity,
          _tier: "canonical",
          approved: true,
          _sources: [
            category === "agents" ? AGENTS_URL : category === "maps" ? MAPS_URL : WEAPONS_URL
          ]
        };
        const key = `library:draft:${category.slice(0, -1)}:${entity.id}`;
        await kv.put(key, JSON.stringify(draft));
        queued.push(key);
      }
    }
  }
  return queued;
}

async function verifyLibraryResearchSources(mapName = "") {
  const slug = librarySlug(mapName);
  const candidates = TRUSTED_LIBRARY_SITES
    .filter(source => source.kind === "synthesized")
    .map(source => ({ ...source, url: source.url.replace("{slug}", slug) }));
  const checks = await Promise.allSettled(candidates.map(async source => {
    const response = await fetch(source.url, {
      method: "GET",
      headers: { "User-Agent": "RankedCoach-Content-Automation/1.0" },
      signal: AbortSignal.timeout(8_000)
    });
    return { ...source, available: response.ok, status: response.status };
  }));
  return checks.map((result, index) => (
    result.status === "fulfilled"
      ? result.value
      : { ...candidates[index], available: false, status: 0 }
  ));
}

async function queueDailyLibraryResearch(kv, snapshot, patch) {
  const queued = [];
  for (const map of snapshot.maps || []) {
    const checkedSources = await verifyLibraryResearchSources(map.label);
    const available = checkedSources.filter(source => source.available);
    const draft = {
      schemaVersion: 1,
      category: "map",
      slug: map.id,
      patchVersion: patch.label,
      generatedAt: new Date().toISOString(),
      _tier: "synthesized",
      approved: false,
      _sources: checkedSources.map(source => source.url),
      sourceChecks: checkedSources,
      status: available.length >= 3 ? "ready-for-synthesis" : "held-for-corroboration",
      fields: {}
    };
    // The worker deliberately does not fabricate prose. It queues a governed
    // draft with source evidence; a synthesis job may only fill fields after
    // three independent current sources are actually available.
    const key = `library:research:map:${map.id}`;
    await kv.put(key, JSON.stringify(draft), { expirationTtl: 14 * 24 * 60 * 60 });
    queued.push(key);
  }
  await kv.put(LIBRARY_DAILY_RESEARCH_KEY, JSON.stringify({
    patchVersion: patch.label,
    checkedAt: new Date().toISOString(),
    queued
  }));
  return queued;
}

export async function runLibraryContentAutomation(env = {}, options = {}) {
  const kv = env.CONTENT_AUTOMATION;
  if (!kv) throw new Error("CONTENT_AUTOMATION KV is not configured.");
  const [snapshot, patch] = await Promise.all([
    fetchLibraryEntitySnapshot(),
    getCurrentPatch(env)
  ]);
  const previous = await kv.get(LIBRARY_ENTITY_SNAPSHOT_KEY, "json");
  const diff = diffLibraryEntitySnapshots(previous || {}, snapshot);
  const queuedCanonical = await queueLibraryCanonicalDrafts(kv, diff, patch);
  await kv.put(LIBRARY_ENTITY_SNAPSHOT_KEY, JSON.stringify(snapshot));
  const queuedResearch = options.daily ? await queueDailyLibraryResearch(kv, snapshot, patch) : [];
  if (previous && hasLibraryEntityChanges(diff)) {
    const labels = ["agents", "maps", "weapons"].flatMap(category => (
      [...(diff[category].added || []), ...(diff[category].changed || [])]
        .map(entity => `${category.slice(0, -1)}:${entity.label}`)
    ));
    try {
      await notifyReview(env, `Library canonical change detected for Patch ${patch.label}: ${labels.slice(0, 20).join(", ")}. ${queuedCanonical.length} governed draft(s) queued.`);
    } catch (error) {
      console.warn("Library canonical-change notification skipped", error?.message || error);
    }
  }
  return Object.freeze({
    initialized: !previous,
    changed: hasLibraryEntityChanges(diff),
    patch: patch.label,
    diff,
    queuedCanonical,
    queuedResearch
  });
}

export async function handlePlayerCardsRequest(env = {}) {
  const cached = await env.CONTENT_AUTOMATION?.get?.(PLAYER_CARD_CATALOG_KEY, "json");
  if (cached?.cachedAt && Array.isArray(cached.data) && cached.data.length > 100) {
    return cached;
  }
  const payload = await fetchJson(PLAYER_CARDS_URL);
  const cards = Array.isArray(payload?.data) ? payload.data : [];
  const data = cards
    .map(card => ({
      uuid: String(card?.uuid || ""),
      displayName: stripHtml(card?.displayName || "Valorant Player Card"),
      wideArt: String(card?.wideArt || "").trim()
    }))
    .filter(card => /^[0-9a-f-]{36}$/i.test(card.uuid) && card.wideArt)
    .sort((left, right) => left.displayName.localeCompare(right.displayName, undefined, { sensitivity: "base" }));
  const result = Object.freeze({
    cachedAt: new Date().toISOString(),
    count: data.length,
    source: PLAYER_CARDS_URL,
    data
  });
  await env.CONTENT_AUTOMATION?.put?.(PLAYER_CARD_CATALOG_KEY, JSON.stringify(result), {
    expirationTtl: PLAYER_CARD_CATALOG_TTL_SECONDS
  });
  return result;
}

function extractHtmlAttribute(value = "", attribute = "") {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(value).match(new RegExp(`${escaped}\\s*=\\s*["']([^"']+)["']`, "i"));
  return decodeHtml(match?.[1] || "").trim();
}

function extractMetaContent(html = "", property = "") {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(html).match(new RegExp(`<meta\\b(?=[^>]*(?:property|name)=["']${escaped}["'])[^>]*>`, "i"));
  return match ? extractHtmlAttribute(match[0], "content") : "";
}

function extractRiotPatchIntroBullets(html = "") {
  const body = String(html);
  const introStart = body.search(/Here(?:'|&#x27;|&rsquo;|’)?s what(?:'|&#x27;|&rsquo;|’)?s happening/i);
  if (introStart < 0) return [];
  const intro = body.slice(introStart, Math.min(body.length, introStart + 6000));
  const list = intro.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/i)?.[1] || "";
  return [...list.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(match => stripHtml(match[1]))
    .filter(Boolean)
    .slice(0, 6);
}

function extractRiotPatchSections(html = "") {
  const body = String(html);
  const headingMatches = [...body.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map(match => ({
    index: match.index,
    end: match.index + match[0].length,
    level: Number(match[1]),
    title: stripHtml(match[2])
  })).filter(heading => heading.title && !/^table of contents$/i.test(heading.title));
  return headingMatches.map((heading, index) => {
    const next = headingMatches.find((candidate, candidateIndex) => (
      candidateIndex > index && candidate.level <= heading.level
    ));
    const slice = body.slice(heading.end, next?.index || body.length);
    const items = [...slice.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(match => stripHtml(match[1]))
      .filter(Boolean);
    const text = stripHtml(slice);
    return { title: heading.title, text, items };
  }).filter(section => section.text && !/^all platforms$/i.test(section.title));
}

function isActionableRiotPatchSection(section = {}) {
  const title = String(section.title || "");
  if (!title || /^table of contents$/i.test(title) || /^all platforms$/i.test(title)) return false;
  return /agent|map|mode|weapon|competitive|gameplay|system|bug|premier|esports|player behavior|social|performance|general updates|all platforms|pc/i.test(title);
}

function splitPatchSectionOutcomes(text = "") {
  return String(text || "")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(item => item.trim())
    .filter(item => item.length >= 28 && !/here(?:'|’)?s what|what(?:'|’)?s happening|welcome to|we(?:'|’)?re back/i.test(item));
}

function escapeRegExpLiteral(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findPatchEntityBeforeSentence(text = "", sentence = "") {
  const sourceText = stripHtml(text);
  const sentenceIndex = sourceText.indexOf(sentence);
  const scopedText = sentenceIndex >= 0
    ? sourceText.slice(0, sentenceIndex + sentence.length)
    : sourceText;
  return [...AGENT_NAMES, ...WEAPON_NAMES, ...MAP_NAMES]
    .map(name => {
      const matcher = new RegExp(`(?:^|\\b)${escapeRegExpLiteral(name)}(?:\\b|$)`, "gi");
      let index = -1;
      let match = null;
      while ((match = matcher.exec(scopedText))) index = match.index;
      return { name, index };
    })
    .filter(entry => entry.index >= 0)
    .sort((left, right) => right.index - left.index)[0]?.name || "";
}

function startsWithPatchEntity(sentence = "", entity = "") {
  if (!entity) return false;
  return new RegExp(`^${escapeRegExpLiteral(entity)}(?:\\b|\\s*:)`, "i").test(sentence.trim());
}

function lowercasePatchOutcomeLead(sentence = "") {
  return sentence.replace(/^([A-Z])/, letter => letter.toLowerCase());
}

function formatNumericPatchOutcome(sectionText = "", sentence = "") {
  const cleanSentence = stripHtml(sentence)
    .replace(/\s*(?:>{2,}|→|->)\s*/g, " to ")
    .replace(/\s+/g, " ")
    .trim();
  const entity = findPatchEntityBeforeSentence(sectionText, cleanSentence);
  if (!entity || startsWithPatchEntity(cleanSentence, entity)) return cleanSentence;
  return `${entity} ${lowercasePatchOutcomeLead(cleanSentence)}`;
}

function extractNumericPatchOutcomes(section = {}) {
  const text = stripHtml(section.text || "");
  if (!text) return [];
  return text
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(sentence => sentence.trim())
    .filter(sentence => {
      const numbers = sentence.match(/\b\d+(?:\.\d+)?%?\b/g) || [];
      if (numbers.length < 2) return false;
      return /\b(?:from|to|increased|decreased|reduced|raised|lowered|changed|points?|damage|range|duration|cooldown|cost|credits?|ammo|charges?|seconds?|health|speed)\b|>{2,}|→|->/i.test(sentence);
    })
    .map(sentence => formatNumericPatchOutcome(text, sentence))
    .filter(Boolean)
    .filter((item, index, list) => list.findIndex(candidate => candidate.toLowerCase() === item.toLowerCase()) === index);
}

function buildRiotPatchOutcomeBullets(sections = []) {
  return sections
    .filter(isActionableRiotPatchSection)
    .flatMap(section => {
      const numericOutcomes = extractNumericPatchOutcomes(section);
      const baseOutcomes = Array.isArray(section.items) && section.items.length
        ? section.items
        : splitPatchSectionOutcomes(section.text).slice(0, 2);
      const numericEntities = new Set(
        numericOutcomes
          .map(outcome => findPatchEntityBeforeSentence(outcome, outcome))
          .filter(Boolean)
          .map(name => normalizeSearchText(name))
      );
      const outcomes = numericOutcomes.length
        ? [
          ...numericOutcomes,
          ...baseOutcomes.filter(item => {
            const normalizedItem = normalizeSearchText(item);
            return ![...numericEntities].some(entity => normalizedItem.startsWith(entity));
          })
        ]
        : baseOutcomes;
      return outcomes
        .map(item => trimPatchSummaryText(item, numericOutcomes.includes(item) ? 240 : 180))
        .filter(Boolean)
        .map(item => `${section.title}: ${item}`);
    })
    .filter((item, index, list) => list.findIndex(candidate => candidate.toLowerCase() === item.toLowerCase()) === index)
    .slice(0, 6);
}

function trimPatchSummaryText(value = "", maxLength = 240) {
  const text = stripHtml(value);
  if (text.length <= maxLength) return text;
  const sentence = text.slice(0, maxLength).replace(/\s+\S*$/, "").trim();
  return `${sentence || text.slice(0, maxLength).trim()}…`;
}

function buildRiotPatchNotesPayload(patch = {}, html = "") {
  const title = stripHtml(String(html).match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "") || `VALORANT Patch Notes ${patch.label || ""}`.trim();
  const tagline = stripHtml(String(html).match(/data-testid=["']tagline["'][\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i)?.[1] || "")
    || extractMetaContent(html, "description")
    || "Latest official VALORANT patch notes from Riot Games.";
  const publishedAt = String(html).match(/<time\b[^>]*dateTime=["']([^"']+)["'][^>]*>/i)?.[1]
    || String(html).match(/<time\b[^>]*datetime=["']([^"']+)["'][^>]*>/i)?.[1]
    || "";
  const introBullets = extractRiotPatchIntroBullets(html);
  const sections = extractRiotPatchSections(html);
  const outcomeBullets = buildRiotPatchOutcomeBullets(sections);
  const bullets = (outcomeBullets.length ? outcomeBullets : introBullets).slice(0, 6);
  return Object.freeze({
    title,
    label: patch.label ? `Patch ${patch.label}` : title.replace(/^VALORANT\s+/i, ""),
    effectiveDate: publishedAt || patch.checkedAt || new Date().toISOString(),
    sourceUrl: patch.notesUrl,
    sourceName: "Riot Games VALORANT Patch Notes",
    tagline: trimPatchSummaryText(tagline, 220),
    bullets,
    sections: sections.slice(0, 8).map(section => ({
      title: section.title,
      text: trimPatchSummaryText(section.text, 260)
    })),
    cachedAt: new Date().toISOString()
  });
}

export async function handlePatchNotesRequest(env = {}) {
  const cached = await env.CONTENT_AUTOMATION?.get?.(RIOT_PATCH_NOTES_FEED_KEY, "json");
  if (
    cached?.cachedAt
    && cached?.sourceUrl
    && Date.now() - Date.parse(cached.cachedAt) < RIOT_PATCH_NOTES_FEED_TTL_SECONDS * 1000
  ) {
    return cached;
  }
  const patch = await getLatestRiotPatchNotesDescriptor();
  const notesHtml = await fetchText(patch.notesUrl);
  const payload = buildRiotPatchNotesPayload(patch, notesHtml);
  await env.CONTENT_AUTOMATION?.put?.(RIOT_PATCH_NOTES_FEED_KEY, JSON.stringify(payload), {
    expirationTtl: RIOT_PATCH_NOTES_FEED_TTL_SECONDS
  });
  return payload;
}

export async function runPatchContentAutomation(env = {}) {
  const kv = env.CONTENT_AUTOMATION;
  if (!kv) throw new Error("CONTENT_AUTOMATION KV is not configured.");
  const current = getPatchDescriptor(unwrapValorantApiData(await fetchJson(VERSION_URL)));
  const previous = await kv.get("patch:last", "json");
  if (previous?.branch === current.branch && previous?.version === current.version) {
    return Object.freeze({ changed: false, patch: current, affected: [] });
  }
  const notesHtml = await fetchText(current.notesUrl);
  const affected = findAffectedDossiers(extractBalanceUpdateText(notesHtml));
  const missingMedia = (await kv.list({ prefix: "review:skin-missing:" })).keys.map(key => decodeURIComponent(key.name.slice("review:skin-missing:".length)));
  const review = affected.length ? affected.join(", ") : "no known agent or weapon dossier names found";
  const mediaSuffix = missingMedia.length ? ` Missing curated skin media: ${missingMedia.slice(0, 12).join(", ")}.` : "";
  await notifyReview(env, `Patch ${current.label} detected - dossier review needed: ${review}.${mediaSuffix}`);
  await kv.put("patch:last", JSON.stringify({ ...current, affected, checkedAt: new Date().toISOString() }));
  return Object.freeze({ changed: true, patch: current, affected, missingMedia });
}

export async function handlePlaylistRequest(env = {}) {
  const cached = await env.CONTENT_AUTOMATION?.get?.("playlist:featured", "json");
  const cachedArchive = await env.CONTENT_AUTOMATION?.get?.(PLAYLIST_KNOWLEDGE_SOURCE_ARCHIVE_KEY, "json");
  if (
    cached?.cachedAt
    && Date.now() - Date.parse(cached.cachedAt) < PLAYLIST_CACHE_WINDOW_MS
  ) {
    // KV keys propagate independently. A fresh featured payload must remain
    // usable if its companion source archive has not reached this edge yet;
    // otherwise a harmless propagation gap turns into an upstream refresh and
    // can surface as a 502. A deployment can also encounter a cache written
    // before the public archive field existed, so derive that list from the
    // verified manifest without guessing at any source data.
    const historicalItems = Array.isArray(cached.historicalItems)
      ? cached.historicalItems
      : buildHistoricalPlaylistArchive(
        getCuratedPlaylistResearchArchive(),
        cached.items,
        cached.patchLabel,
        await readSuppressedVideoIds(env.CONTENT_AUTOMATION)
      ).items;
    const [itemsWithLikeMetrics, historicalItemsWithLikeMetrics] = await Promise.all([
      enrichYouTubeLikeMetrics(cached.items, env),
      enrichYouTubeLikeMetrics(historicalItems, env)
    ]);
    return {
      ...cached,
      items: itemsWithLikeMetrics,
      historicalItems: historicalItemsWithLikeMetrics
    };
  }
  const patch = await getCurrentPatch(env);
  const [videoResult, twitchResult] = await Promise.allSettled([
    fetchTrustedChannelVideos(env, { kind: "playlist" }),
    fetchTrustedTwitchMedia(env)
  ]);
  if (videoResult.status !== "fulfilled") throw videoResult.reason;
  const videos = videoResult.value;
  const guideSearchResult = await Promise.allSettled([fetchPopularGuideSearchVideos(env)]);
  const guideSearchVideos = guideSearchResult[0]?.status === "fulfilled" ? guideSearchResult[0].value : [];
  if (guideSearchResult[0]?.status === "rejected") console.warn("Popular guide search refresh skipped", guideSearchResult[0].reason?.message || guideSearchResult[0].reason);
  const twitchMedia = twitchResult.status === "fulfilled" ? twitchResult.value : { streams: [], vods: [] };
  if (twitchResult.status === "rejected") console.warn("Twitch media refresh skipped", twitchResult.reason?.message || twitchResult.reason);
  const suppressed = await readSuppressedVideoIds(env.CONTENT_AUTOMATION);
  const youtubeStreams = buildYouTubeLiveStreams(videos);
  const researchSubmittedVideos = await getResearchSubmittedVideos(env.CONTENT_AUTOMATION);
  const playlistCandidates = dedupePlaylistVideos([
    ...getStaticPlaylistVideos(),
    ...guideSearchVideos,
    ...videos.filter(video => !video.isLive),
    ...twitchMedia.vods.slice(0, MAX_TWITCH_ARCHIVES),
    // Existing curated/trusted records retain precedence when an owner later
    // submits the same video for Research; the Playlist stays duplicate-free.
    ...researchSubmittedVideos
  ]);
  const playlist = buildFeaturedPlaylist(playlistCandidates, patch.label, suppressed);
  const historicalArchive = buildHistoricalPlaylistArchive(
    getCuratedPlaylistResearchArchive(),
    playlist.items,
    patch.label,
    suppressed
  );
  const [itemsWithLikeMetrics, historicalItemsWithLikeMetrics] = await Promise.all([
    enrichYouTubeLikeMetrics(playlist.items, env),
    enrichYouTubeLikeMetrics(historicalArchive.items, env)
  ]);
  const cumulativeResearchCandidates = mergePlaylistResearchArchive(
    cachedArchive?.items,
    playlistCandidates,
    getCuratedPlaylistResearchArchive()
  );
  const researchArchive = buildFeaturedPlaylist(
    cumulativeResearchCandidates,
    patch.label,
    suppressed,
    Date.now(),
    { maxItems: PLAYLIST_KNOWLEDGE_SOURCE_MAX_ITEMS }
  );
  try {
    await notifyLowConfidencePlaylistReviews(env, playlist.items);
  } catch (error) {
    console.warn("Playlist classification review notification skipped", error?.message || error);
  }
  const liveStreams = [...youtubeStreams, ...twitchMedia.streams].sort((left, right) => Number(right.viewerCount || 0) - Number(left.viewerCount || 0));
  const payload = {
    ...playlist,
    items: itemsWithLikeMetrics,
    // Deliberately independent from `items`: the bounded Featured feed
    // remains stable, while every verified owner-curated historical guide is
    // publicly available in its normal category and in Historical Archive.
    historicalItems: historicalItemsWithLikeMetrics,
    liveStreams,
    liveAvailability: {
      youtube: Boolean(String(env.YOUTUBE_DATA_API_KEY || "").trim()),
      twitch: Boolean(String(env.TWITCH_CLIENT_ID || "").trim() && String(env.TWITCH_CLIENT_SECRET || "").trim())
    },
    cachedAt: new Date().toISOString(),
    source: env.YOUTUBE_DATA_API_KEY ? "youtube-data-api+popular-guide-search+twitch-helix" : "trusted-channel-feeds+twitch-helix"
  };
  await Promise.all([
    env.CONTENT_AUTOMATION?.put?.("playlist:featured", JSON.stringify(payload), { expirationTtl: 3600 }),
    env.CONTENT_AUTOMATION?.put?.(PLAYLIST_KNOWLEDGE_SOURCE_ARCHIVE_KEY, JSON.stringify({
      schemaVersion: 1,
      cachedAt: payload.cachedAt,
      items: researchArchive.items
    }))
  ]);
  return payload;
}

export async function handleSkinMediaRequest(request, env = {}) {
  const body = await request.json();
  const collections = Array.isArray(body?.collections) ? body.collections.slice(0, 100) : [];
  const matches = {};
  const entries = (await Promise.all(collections.map(async entry => {
    const key = normalizeSearchText(entry?.key || entry?.name).replace(/\s+/g, "-");
    const name = String(entry?.name || "").trim();
    if (!key || !name) return null;
    const cached = await env.CONTENT_AUTOMATION?.get?.(`skin-media:${key}`, "json");
    if (cached?.video) matches[key] = { video: cached.video };
    return { entry, key, name, cached };
  }))).filter(Boolean);
  const unresolved = entries.filter(item => item.entry?.needsVideo !== false && !item.cached?.video);
  const videos = unresolved.length ? await fetchTrustedChannelVideos(env, { kind: "skin" }) : [];
  await Promise.all(entries.map(async ({ entry, key, name, cached }) => {
    const video = cached?.video || findConfidentCollectionVideo(name, videos);
    if (video) {
      matches[key] = { video };
      if (!cached?.video) await env.CONTENT_AUTOMATION?.put?.(`skin-media:${key}`, JSON.stringify({ video, matchedAt: new Date().toISOString() }));
    } else if (entry?.needsVideo !== false) {
      await env.CONTENT_AUTOMATION?.put?.(`review:skin-missing:${encodeURIComponent(name)}`, new Date().toISOString());
    }
    if (entry?.needsModel) {
      await env.CONTENT_AUTOMATION?.put?.(`review:skin-missing:${encodeURIComponent(`${name} 3D model`)}`, new Date().toISOString());
    }
  }));
  return { matches };
}
