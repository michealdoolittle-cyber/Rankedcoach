const DEFAULT_NTFY_TOPIC = "rankedcoach-deploys-mk7x2q";
const VERSION_URL = "https://valorant-api.com/v1/version";
const RIOT_NEWS_ROOT = "https://playvalorant.com/en-us/news/game-updates";
const YOUTUBE_API_ROOT = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_FEED_ROOT = "https://www.youtube.com/feeds/videos.xml";
const MAX_CHANNEL_VIDEOS = 15;
const MAX_TWITCH_ARCHIVES = 15;
const PLAYLIST_MAX_ITEMS = 120;
const PLAYLIST_CACHE_WINDOW_MS = 5 * 60 * 1000;
const TWITCH_TOKEN_CACHE_KEY = "playlist:twitch-token";
const TWITCH_API_ROOT = "https://api.twitch.tv/helix";
const PLAYLIST_CLASSIFICATION_REVIEW_TTL_SECONDS = 7 * 24 * 60 * 60;
const PLAYLIST_GUIDE_SEARCH_CACHE_TTL_SECONDS = 14 * 24 * 60 * 60;
const PLAYLIST_GUIDE_SEARCH_MISS_TTL_SECONDS = 24 * 60 * 60;

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

function unwrapValorantApiData(payload = {}) {
  return payload?.data && typeof payload.data === "object" ? payload.data : payload;
}

function stripHtml(value = "") {
  return decodeHtml(String(value).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
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

export function buildFeaturedPlaylist(videos = [], patchLabel = "", suppressedIds = new Set(), now = Date.now()) {
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
  }).slice(0, PLAYLIST_MAX_ITEMS);
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
  if (cached?.cachedAt && Date.now() - Date.parse(cached.cachedAt) < PLAYLIST_CACHE_WINDOW_MS) return cached;
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
  const playlist = buildFeaturedPlaylist([
    ...getStaticPlaylistVideos(),
    ...guideSearchVideos,
    ...videos.filter(video => !video.isLive),
    ...twitchMedia.vods.slice(0, MAX_TWITCH_ARCHIVES)
  ], patch.label, suppressed);
  try {
    await notifyLowConfidencePlaylistReviews(env, playlist.items);
  } catch (error) {
    console.warn("Playlist classification review notification skipped", error?.message || error);
  }
  const liveStreams = [...youtubeStreams, ...twitchMedia.streams].sort((left, right) => Number(right.viewerCount || 0) - Number(left.viewerCount || 0));
  const payload = {
    ...playlist,
    liveStreams,
    liveAvailability: {
      youtube: Boolean(String(env.YOUTUBE_DATA_API_KEY || "").trim()),
      twitch: Boolean(String(env.TWITCH_CLIENT_ID || "").trim() && String(env.TWITCH_CLIENT_SECRET || "").trim())
    },
    cachedAt: new Date().toISOString(),
    source: env.YOUTUBE_DATA_API_KEY ? "youtube-data-api+popular-guide-search+twitch-helix" : "trusted-channel-feeds+twitch-helix"
  };
  await env.CONTENT_AUTOMATION?.put?.("playlist:featured", JSON.stringify(payload), { expirationTtl: 3600 });
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
