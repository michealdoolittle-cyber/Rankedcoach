import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  TRUSTED_YOUTUBE_CHANNELS,
  TRUSTED_TWITCH_CHANNELS,
  buildFeaturedPlaylist,
  categorizeCreatorTitle,
  extractBalanceUpdateText,
  fetchPopularGuideSearchVideos,
  fetchTrustedChannelVideos,
  fetchTrustedTwitchStreams,
  fetchTrustedTwitchVods,
  findAffectedDossiers,
  findConfidentCollectionVideo,
  getStaticPlaylistVideos,
  getPatchDescriptor,
  isPopularGuideSearchCandidate,
  runPatchContentAutomation
} from "../../worker/content-automation.mjs";

const repoRoot = new URL("../../", import.meta.url);
const referenceUrl = new URL("public/library/gamesense-reference.js", repoRoot);
const mapsUrl = new URL("public/library/gamesense-maps.js", repoRoot);
const hashFiles = async () => createHash("sha256").update(`${await readFile(referenceUrl, "utf8")}\n${await readFile(mapsUrl, "utf8")}`).digest("hex");

const descriptor = getPatchDescriptor({ branch: "release-13.01", version: "13.01.00.5090349" });
assert.equal(descriptor.label, "13.01");
assert.equal(descriptor.notesUrl, "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-01/");

const liveVersionResponse = await fetch("https://valorant-api.com/v1/version");
assert.equal(liveVersionResponse.ok, true, "The live Valorant version endpoint must resolve.");
const liveVersionPayload = await liveVersionResponse.json();
assert.equal(getPatchDescriptor(liveVersionPayload.data).label, "13.01", "The live wrapped version payload must expose the current patch.");

const patchUrls = ["13-01", "13-00", "12-11"].map(slug => `https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-${slug}/`);
const patchResponses = await Promise.all(patchUrls.map(url => fetch(url)));
assert.deepEqual(patchResponses.map(response => response.ok), [true, true, true], "The three real Riot patch-note URLs must resolve.");
const patch1301Html = await patchResponses[0].text();
assert.deepEqual(findAffectedDossiers(extractBalanceUpdateText(patch1301Html)), ["Iso", "Yoru", "Outlaw"], "Patch 13.01 must flag only the balance-update dossiers.");

const liveVideos = await fetchTrustedChannelVideos({});
const playlistChannels = TRUSTED_YOUTUBE_CHANNELS.filter(channel => channel.playlist).map(channel => channel.name);
playlistChannels.forEach(channel => assert(liveVideos.some(video => video.channel === channel), `${channel} must have a live trusted-channel feed.`));

const creatorChannels = TRUSTED_YOUTUBE_CHANNELS.filter(channel => channel.kind === "creator");
assert.equal(creatorChannels.length, 10, "The trusted creator allowlist must contain the original eight creators plus Charla7an and Thinking Man's Valorant.");
for (const channel of creatorChannels) {
  const sample = liveVideos.find(video => video.channelId === channel.id);
  assert.ok(sample, `${channel.name} must expose a current sample video.`);
  const metadataResponse = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(sample.url)}&format=json`);
  assert.equal(metadataResponse.ok, true, `${channel.name}'s sample must resolve through YouTube oEmbed.`);
  const metadata = await metadataResponse.json();
  assert.equal(new URL(metadata.author_url).pathname.toLowerCase(), `/${channel.handle.toLowerCase()}`, `${channel.name}'s channel ID must resolve to ${channel.handle}.`);
}

const liveSkinVideos = await fetchTrustedChannelVideos({}, { kind: "skin" });
assert.ok(liveSkinVideos.some(video => video.channel === "Rem"), "Rem must feed the fail-closed skin-media curation path.");

const creatorSamples = new Map([
  ["Dopai", "Steal this Summit Strat"],
  ["Woohoojin", "Why Eggsters Entries are so good."],
  ["Maxie", "How to be USEFUL on OMEN"],
  ["Konpeki", "1 Mistake For Every Agent In 2026"],
  ["Slayerkey", "Your Aim Isn't Inconsistent. Here's What's Actually Happening."],
  ["Sena", "You Don't Suck, You're Just Playing the Wrong Agent"],
  ["Rem", "Valorant Is BUFFING Yoru"],
  ["Rooney", "the hidden mistake keeping you hardstuck"],
  ["Charla7an", "Controller Role Guide for Ranked"],
  ["Thinking Man's Valorant", "Why This Pro Comp Works On Sunset"]
]);
for (const [channel, title] of creatorSamples) {
  assert.notEqual(categorizeCreatorTitle(title), "General", `${channel}'s focused sample must map beyond General.`);
}
assert.equal(categorizeCreatorTitle("A quiet afternoon update"), "General", "An unrelated title must fail closed into General.");
assert.equal(categorizeCreatorTitle("Best Valorant monitor settings and clarity guide"), "Settings/Gear", "Settings and gear titles must map into the dedicated Playlist section.");

const blackspyreId = "aSFtc5Y-ORQ";
const blackspyreMetadataResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${blackspyreId}&format=json`);
assert.equal(blackspyreMetadataResponse.ok, true, "The approved Blackspyre showcase must still resolve on YouTube.");
const blackspyreMetadata = await blackspyreMetadataResponse.json();
assert.equal(blackspyreMetadata.author_name, "VALORANT");
const blackspyre = findConfidentCollectionVideo("Blackspyre", [{ id: blackspyreId, title: blackspyreMetadata.title, channel: blackspyreMetadata.author_name }]);
assert(blackspyre?.id, "The real Blackspyre release must confidently match trusted showcase media.");
assert.equal(findConfidentCollectionVideo("Imaginary Collection", liveVideos), null, "A missing collection must not receive a forced match.");
assert.equal(findConfidentCollectionVideo("Evori Dreamwings", [{
  id: "abcdefghijk",
  title: "NEW EVORI DREAMWINGS in VALORANT!",
  channel: "Rem"
}])?.id, "abcdefghijk", "An exact Rem collection release title must be eligible for skin-media curation.");
assert.equal(findConfidentCollectionVideo("Evori Dreamwings", [{
  id: "lmnopqrstuv",
  title: "My Evori Dreamwings ranked coaching session",
  channel: "Rem"
}]), null, "A collection-name mention without a skin or release cue must remain unmatched.");

const suppressed = buildFeaturedPlaylist(liveVideos, "13.01", new Set([liveVideos[0].id]));
assert(!suppressed.items.some(item => item.id === liveVideos[0].id), "A suppressed real video must disappear from the rotation immediately.");

const classifiedPlaylist = buildFeaturedPlaylist([
  { id: "news-short", title: "Iso and Yoru buffs in Patch 13.01", channelKind: "official", isShort: true, hasStructuralMediaMetadata: true, publishedAt: "2026-07-18T12:00:00Z" },
  { id: "creator-smurfing-guide", title: "How to Get So Good At Valorant It Feels Like Smurfing", channelKind: "creator", isShort: false, durationSeconds: 1220, hasStructuralMediaMetadata: true, publishedAt: "2026-07-18T11:00:00Z" },
  { id: "creator-buff-guide", title: "How to Abuse the Buffed Duelist Without Throwing", channelKind: "creator", isShort: false, durationSeconds: 980, hasStructuralMediaMetadata: true, publishedAt: "2026-07-18T10:30:00Z" },
  { id: "past-live", title: "Ranked Block Coaching", channelKind: "creator", isShort: false, wasLive: true, durationSeconds: 7200, hasStructuralMediaMetadata: true, publishedAt: "2026-07-17T12:00:00Z" },
  { id: "long-guide", title: "Ranked Block Coaching !livecoach", channelKind: "creator", isShort: false, wasLive: false, durationSeconds: 7200, hasStructuralMediaMetadata: true, publishedAt: "2026-07-16T18:00:00Z" },
  { id: "feed-fallback", title: "Free Valorant Tracker Reviews", channelKind: "creator", isShort: false, durationSeconds: 7200, hasStructuralMediaMetadata: false, publishedAt: "2026-07-16T15:00:00Z" },
  { id: "twitch-123456", upstreamId: "123456", title: "Subroza ranked", channelKind: "creator", platform: "twitch", sourceType: "twitch-archive", isVod: true, hasStructuralMediaMetadata: true, publishedAt: "2026-07-16T13:00:00Z" },
  { id: "regular-short", title: "Three clean movement tips", channelKind: "creator", isShort: true, hasStructuralMediaMetadata: true, publishedAt: "2026-07-16T12:00:00Z" }
], "13.01", new Set(), Date.parse("2026-07-18T18:00:00Z"));
assert.deepEqual(
  classifiedPlaylist.items.map(item => item.topicType),
  ["News", "General", "Role", "VOD's", "General", "General", "VOD's", "YT Shorts"],
  "Only videos with a current live signal may enter Live/Streaming; archives belong in VOD's."
);
assert.equal(classifiedPlaylist.items.find(item => item.id === "creator-smurfing-guide")?.sourceType, "creator-guide", "Creator channels must remain structurally classified as guides.");
assert.equal(classifiedPlaylist.items.find(item => item.id === "creator-smurfing-guide")?.topicType, "General", "Creator smurfing phrasing must not be misrouted into News.");
assert.notEqual(classifiedPlaylist.items.find(item => item.id === "creator-buff-guide")?.topicType, "News", "Creator buff wording must not be misrouted into News.");
assert.equal(classifiedPlaylist.items.find(item => item.id === "long-guide")?.needsContentReview, false, "A metadata-confirmed long guide must not be mislabeled as a VOD from its title.");
assert.equal(classifiedPlaylist.items.find(item => item.id === "feed-fallback")?.needsContentReview, false, "A title-only fallback must not be treated as live or queued for Live/Streaming review.");
assert.equal(classifiedPlaylist.items.find(item => item.id === "twitch-123456")?.classificationReason, "twitch-archive-vod", "A Twitch archive must carry structural VOD provenance.");
const settingsOverridePlaylist = buildFeaturedPlaylist(getStaticPlaylistVideos(), "13.01", new Set(), Date.parse("2026-07-18T18:00:00Z"));
assert.equal(settingsOverridePlaylist.items[0]?.topicType, "Settings/Gear", "The pinned TenZ settings video must appear in Settings/Gear.");
assert.equal(settingsOverridePlaylist.items[0]?.id, "d8CXBLRgP-A", "The pinned TenZ settings video must use the verified requested YouTube ID.");

class MemoryKv {
  constructor() { this.values = new Map(); }
  async get(key, type) {
    if (!this.values.has(key)) return null;
    const value = this.values.get(key);
    return type === "json" ? JSON.parse(value) : value;
  }
  async put(key, value) { this.values.set(key, String(value)); }
  async list({ prefix = "", cursor } = {}) {
    void cursor;
    return { keys: [...this.values.keys()].filter(key => key.startsWith(prefix)).map(name => ({ name })), list_complete: true };
  }
}

assert.equal(isPopularGuideSearchCandidate({
  id: "jettGuid001",
  title: "VALORANT Jett Guide - Complete Tips",
  description: "Learn Jett utility and entry pathing.",
  channel: "Guide Channel",
  isValorant: true,
  isShort: false,
  isLive: false,
  wasLive: false,
  isVod: false
}, { targetName: "Jett" }), true, "A target-specific Valorant guide must be eligible for popular guide sourcing.");
assert.equal(isPopularGuideSearchCandidate({
  id: "jettMontage1",
  title: "VALORANT Jett Highlights Montage",
  description: "Frag movie clips.",
  channel: "Clip Channel",
  isValorant: true,
  isShort: false,
  isLive: false,
  wasLive: false,
  isVod: false
}, { targetName: "Jett" }), false, "Montages must not be accepted as guide catalog entries.");

const guideSearchKv = new MemoryKv();
const fetchBeforeGuideSearchCheck = globalThis.fetch;
globalThis.fetch = async input => {
  const url = new URL(String(input));
  if (url.href.startsWith("https://www.googleapis.com/youtube/v3/search")) {
    const query = url.searchParams.get("q");
    assert.equal(url.searchParams.get("order"), "viewCount", "Popular guide sourcing must use YouTube's view-count sort.");
    assert.equal(url.searchParams.get("regionCode"), "US", "Popular guide sourcing must target English/NA discovery.");
    const id = query.includes("Jett") ? "jettGuid001" : "bindGuid002";
    const target = query.includes("Jett") ? "Jett" : "Bind";
    return new Response(JSON.stringify({ items: [{
      id: { videoId: id },
      snippet: {
        channelId: `channel-${target}`,
        channelTitle: `${target} Coach`,
        title: `VALORANT ${target} Guide - Complete Ranked Tips`,
        description: `A real Valorant ${target} guide for ranked.`,
        publishedAt: "2026-07-18T12:00:00Z",
        thumbnails: { high: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` } }
      }
    }] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (url.href.startsWith("https://www.googleapis.com/youtube/v3/videos")) {
    const ids = url.searchParams.get("id").split(",");
    return new Response(JSON.stringify({ items: ids.map(id => {
      const target = id === "jettGuid001" ? "Jett" : "Bind";
      return {
        id,
        snippet: {
          channelId: `channel-${target}`,
          channelTitle: `${target} Coach`,
          title: `VALORANT ${target} Guide - Complete Ranked Tips`,
          description: `A real Valorant ${target} guide for ranked.`,
          publishedAt: "2026-07-18T12:00:00Z",
          thumbnails: { high: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` } },
          tags: ["Valorant", target, "Guide"]
        },
        contentDetails: { duration: "PT12M30S" },
        liveStreamingDetails: {}
      };
    }) }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return fetchBeforeGuideSearchCheck(input);
};
try {
  const popularGuides = await fetchPopularGuideSearchVideos({
    CONTENT_AUTOMATION: guideSearchKv,
    YOUTUBE_DATA_API_KEY: "test-youtube-key"
  }, {
    targets: [
      { targetType: "Agent", targetName: "Jett", topicType: "Agent" },
      { targetType: "Map", targetName: "Bind", topicType: "Map Knowledge" }
    ],
    batchSize: 2
  });
  assert.deepEqual(popularGuides.map(video => [video.targetName, video.topicTypeOverride]), [["Jett", "Agent"], ["Bind", "Map Knowledge"]], "Popular guide searches must file exact agent/map matches into their respective Playlist categories.");
  const guidePlaylist = buildFeaturedPlaylist(popularGuides, "13.01", new Set(), Date.parse("2026-07-18T18:00:00Z"));
  assert.deepEqual(guidePlaylist.items.map(item => item.topicType), ["Agent", "Map Knowledge"], "Popular searched guide videos must preserve their target categories after playlist build.");
} finally {
  globalThis.fetch = fetchBeforeGuideSearchCheck;
}

assert.equal(TRUSTED_TWITCH_CHANNELS.length, 29, "Every requested Twitch channel must stay on the trusted live allowlist.");
const twitchKv = new MemoryKv();
const fetchBeforeTwitchCheck = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  if (url === "https://id.twitch.tv/oauth2/token") {
    assert.equal(init.method, "POST");
    return new Response(JSON.stringify({ access_token: "test-token", expires_in: 3600 }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (url.startsWith("https://api.twitch.tv/helix/streams?")) {
    assert.match(url, /user_login=Subroza/);
    assert.match(url, /user_login=VALORANT_Americas/);
    assert.equal(init.headers["Client-Id"], "test-client");
    return new Response(JSON.stringify({ data: [
      { id: "stream-1", user_login: "subroza", user_name: "Subroza", game_name: "VALORANT", type: "live", title: "Ranked", viewer_count: 900, thumbnail_url: "https://example.com/{width}x{height}.jpg", started_at: "2026-07-18T12:00:00Z" },
      { id: "stream-2", user_login: "hiko", user_name: "Hiko", game_name: "Other Game", type: "live", title: "Variety", viewer_count: 100, thumbnail_url: "https://example.com/{width}x{height}.jpg", started_at: "2026-07-18T12:00:00Z" }
    ] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (url.startsWith("https://api.twitch.tv/helix/users?")) {
    assert.match(url, /login=Subroza/);
    return new Response(JSON.stringify({ data: [
      { id: "100", login: "subroza", display_name: "Subroza" }
    ] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  if (url.startsWith("https://api.twitch.tv/helix/videos?")) {
    assert.match(url, /user_id=100/);
    assert.match(url, /type=archive/);
    return new Response(JSON.stringify({ data: [
      { id: "987654321", user_id: "100", user_name: "Subroza", title: "Radiant ranked session", description: "", created_at: "2026-07-18T10:00:00Z", published_at: "2026-07-18T10:00:00Z", url: "https://www.twitch.tv/videos/987654321", thumbnail_url: "https://example.com/%{width}x%{height}.jpg", duration: "2h14m8s", type: "archive" }
    ] }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  return fetchBeforeTwitchCheck(input, init);
};
try {
  const twitchStreams = await fetchTrustedTwitchStreams({ CONTENT_AUTOMATION: twitchKv, TWITCH_CLIENT_ID: "test-client", TWITCH_CLIENT_SECRET: "test-secret" });
  assert.deepEqual(twitchStreams.map(stream => stream.channel), ["Subroza"], "Only live VALORANT-tagged Twitch streams may surface.");
  assert.equal(twitchStreams[0].thumbnail, "https://example.com/640x360.jpg");
  const twitchVods = await fetchTrustedTwitchVods({ CONTENT_AUTOMATION: twitchKv, TWITCH_CLIENT_ID: "test-client", TWITCH_CLIENT_SECRET: "test-secret" });
  assert.equal(twitchVods.length, 1, "A real Helix archive response must create one Playlist item.");
  assert.deepEqual({
    topicType: buildFeaturedPlaylist(twitchVods, "13.01").items[0]?.topicType,
    sourceType: twitchVods[0].sourceType,
    durationSeconds: twitchVods[0].durationSeconds,
    thumbnail: twitchVods[0].thumbnail
  }, {
    topicType: "VOD's",
    sourceType: "twitch-archive",
    durationSeconds: 8048,
    thumbnail: "https://example.com/640x360.jpg"
  });
} finally {
  globalThis.fetch = fetchBeforeTwitchCheck;
}

const sourceHashBefore = await hashFiles();
const kv = new MemoryKv();
await kv.put("patch:last", JSON.stringify({ branch: "release-13.00", version: "13.00.00" }));
let notificationCount = 0;
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = String(input);
  if (url === "https://valorant-api.com/v1/version") return new Response(JSON.stringify({ branch: "release-13.01", version: "13.01.00.5090349" }), { status: 200, headers: { "Content-Type": "application/json" } });
  if (url === descriptor.notesUrl) return new Response(patch1301Html, { status: 200, headers: { "Content-Type": "text/html" } });
  if (url.startsWith("https://ntfy.sh/")) {
    notificationCount += 1;
    assert.match(String(init.body), /Iso, Yoru, Outlaw/);
    return new Response("ok", { status: 200 });
  }
  return originalFetch(input, init);
};

try {
  const changed = await runPatchContentAutomation({ CONTENT_AUTOMATION: kv, NTFY_TOPIC: "test-topic" });
  assert.equal(changed.changed, true);
  assert.deepEqual(changed.affected, ["Iso", "Yoru", "Outlaw"]);
  const unchanged = await runPatchContentAutomation({ CONTENT_AUTOMATION: kv, NTFY_TOPIC: "test-topic" });
  assert.equal(unchanged.changed, false);
  assert.equal(notificationCount, 1, "A no-op patch check must not notify again.");
} finally {
  globalThis.fetch = originalFetch;
}

assert.equal(await hashFiles(), sourceHashBefore, "Automation must never rewrite Gamesense coaching prose.");
console.log(`Patch/content automation checks passed: 3 Riot URLs, 13.01 dossier match, ${playlistChannels.length} trusted playlist channels, real Blackspyre media, no-op detection, and suppression.`);
