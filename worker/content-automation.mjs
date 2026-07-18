const DEFAULT_NTFY_TOPIC = "rankedcoach-deploys-mk7x2q";
const VERSION_URL = "https://valorant-api.com/v1/version";
const RIOT_NEWS_ROOT = "https://playvalorant.com/en-us/news/game-updates";
const YOUTUBE_API_ROOT = "https://www.googleapis.com/youtube/v3";
const YOUTUBE_FEED_ROOT = "https://www.youtube.com/feeds/videos.xml";
const MAX_CHANNEL_VIDEOS = 15;

export const AGENT_NAMES = Object.freeze([
  "Astra", "Breach", "Brimstone", "Chamber", "Clove", "Cypher", "Deadlock", "Fade", "Gekko",
  "Harbor", "Iso", "Jett", "KAY/O", "Killjoy", "Miks", "Neon", "Omen", "Phoenix", "Raze",
  "Reyna", "Sage", "Skye", "Sova", "Tejo", "Veto", "Viper", "Vyse", "Waylay", "Yoru"
]);

export const WEAPON_NAMES = Object.freeze([
  "Ares", "Bucky", "Bulldog", "Classic", "Frenzy", "Ghost", "Guardian", "Judge", "Marshal",
  "Odin", "Operator", "Outlaw", "Phantom", "Sheriff", "Shorty", "Spectre", "Stinger", "Vandal"
]);

export const TRUSTED_YOUTUBE_CHANNELS = Object.freeze([
  Object.freeze({ id: "UC8CX0LD98EDXl4UYX1MDCXg", name: "VALORANT", kind: "riot", playlist: true, skin: true }),
  Object.freeze({ id: "UC93uuDyuin2YXOY2ZVn8nkw", name: "Dittozkul", kind: "showcase", playlist: false, skin: true }),
  Object.freeze({ id: "UCBjL1GzlTwyaXoqa1Ka6wzQ", name: "Dopai", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCqCLRG4_zynXOEPU6N5POkw", name: "Woohoojin", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCoAdB1kEFR1KDGw0gXPMV1w", name: "Maxie", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCv1zbx03PIvqG8cHNpWWWUw", name: "Konpeki", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCW15YpAc8hjPhDX9be7YdRg", name: "Slayerkey", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCH__y98F7DyZaw_C3LdGu-A", name: "Sena", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCcCTL6IEX64sXTOba-Iz6gA", name: "Rem", kind: "creator", playlist: true, skin: false }),
  Object.freeze({ id: "UCHNd-wW9s1d7VGvd3qJgp5g", name: "Rooney", kind: "creator", playlist: true, skin: false })
]);

const TOPIC_KEYWORDS = Object.freeze({
  Role: Object.freeze(["agent", "controller", "duelist", "initiator", "sentinel", "omen", "jett", "sova", "viper", "yoru", "iso", "miks"]),
  Playstyle: Object.freeze(["entry", "entries", "lurk", "anchor", "rotate", "clutch", "decision", "ranked", "smurfing"]),
  Mechanics: Object.freeze(["aim", "crosshair", "flick", "spray", "recoil", "gunfight", "peeking", "one tapped", "sensitivity"]),
  "Map Knowledge": Object.freeze(["ascent", "bind", "breeze", "fracture", "haven", "icebox", "lotus", "pearl", "split", "sunset", "summit"]),
  Movement: Object.freeze(["movement", "strafe", "deadzon", "counter-straf", "jump peek", "jiggle"]),
  "Mood/Behavior": Object.freeze(["mindset", "tilt", "toxic", "confidence", "mental", "improving", "hardstuck"]),
  Communication: Object.freeze(["comms", "communication", "callout", "teammate", "teamplay", "igl"])
});

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
    return Object.freeze({
      id,
      title: stripHtml(xmlTag(entry, "title")),
      channelId: channel.id,
      channel: channel.name,
      channelKind: channel.kind,
      publishedAt: xmlTag(entry, "published"),
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      url: `https://www.youtube.com/watch?v=${id}`
    });
  }).filter(Boolean);
}

function parseYouTubeApi(payload = {}, channel = {}) {
  return (payload.items || []).map(item => {
    const id = String(item?.id?.videoId || "");
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return Object.freeze({
      id,
      title: decodeHtml(item?.snippet?.title || ""),
      channelId: channel.id,
      channel: channel.name,
      channelKind: channel.kind,
      publishedAt: String(item?.snippet?.publishedAt || ""),
      thumbnail: String(item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`),
      url: `https://www.youtube.com/watch?v=${id}`
    });
  }).filter(Boolean);
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
    if (apiKey) {
      const url = new URL(`${YOUTUBE_API_ROOT}/search`);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("channelId", channel.id);
      url.searchParams.set("maxResults", String(MAX_CHANNEL_VIDEOS));
      url.searchParams.set("order", "date");
      url.searchParams.set("type", "video");
      url.searchParams.set("key", apiKey);
      return parseYouTubeApi(await fetchJson(url), channel);
    }
    const url = new URL(YOUTUBE_FEED_ROOT);
    url.searchParams.set("channel_id", channel.id);
    return parseYouTubeFeed(await fetchText(url), channel);
  }));
  const batches = results.filter(result => result.status === "fulfilled").map(result => result.value);
  if (!batches.length) throw new Error("No trusted YouTube channel could be refreshed.");
  return batches.flat().sort((left, right) => Date.parse(right.publishedAt || 0) - Date.parse(left.publishedAt || 0));
}

export function categorizeCreatorTitle(title = "") {
  const normalized = normalizeSearchText(title);
  let best = null;
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const score = keywords.reduce((total, keyword) => total + (normalized.includes(normalizeSearchText(keyword)) ? 1 : 0), 0);
    if (score > (best?.score || 0)) best = { topic, score };
  }
  return best?.score ? best.topic : "Uncategorized";
}

function getVideoSourceType(video, patchLabel = "") {
  const title = normalizeSearchText(video.title);
  if (video.channelKind === "creator") return "creator-guide";
  if (patchLabel && title.includes(`patch ${normalizeSearchText(patchLabel)}`)) return "patch-breakdown";
  if (/(skin|bundle|collection|showcase|reveal)/.test(title)) return "bundle-showcase";
  return "riot-official";
}

export function buildFeaturedPlaylist(videos = [], patchLabel = "", suppressedIds = new Set(), now = Date.now()) {
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const items = videos.filter(video => !suppressedIds.has(video.id)).map(video => {
    const sourceType = getVideoSourceType(video, patchLabel);
    return Object.freeze({
      ...video,
      sourceType,
      topicType: sourceType === "creator-guide" ? categorizeCreatorTitle(video.title) : "",
      isNewThisWeek: Date.parse(video.publishedAt || 0) >= oneWeekAgo
    });
  }).slice(0, 40);
  const currentPatchVideo = items.find(item => item.sourceType === "patch-breakdown") || null;
  return Object.freeze({
    patchLabel,
    patchTag: currentPatchVideo ? `Patch ${patchLabel} Breakdown Inside` : "",
    newThisWeek: items.filter(item => item.isNewThisWeek).length,
    items: Object.freeze(items)
  });
}

export function findConfidentCollectionVideo(collectionName = "", videos = []) {
  const collection = normalizeSearchText(collectionName);
  if (collection.length < 4) return null;
  const match = videos.find(video => {
    const title = normalizeSearchText(video.title);
    return (` ${title} `).includes(` ${collection} `) && /(skin|bundle|collection|showcase|reveal|worth buying)/.test(title);
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
  if (cached?.cachedAt && Date.now() - Date.parse(cached.cachedAt) < 30 * 60 * 1000) return cached;
  const patch = await getCurrentPatch(env);
  const videos = await fetchTrustedChannelVideos(env, { kind: "playlist" });
  const suppressed = await readSuppressedVideoIds(env.CONTENT_AUTOMATION);
  const playlist = buildFeaturedPlaylist(videos, patch.label, suppressed);
  const payload = { ...playlist, cachedAt: new Date().toISOString(), source: env.YOUTUBE_DATA_API_KEY ? "youtube-data-api" : "trusted-channel-feeds" };
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
