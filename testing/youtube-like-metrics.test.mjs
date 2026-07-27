import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { enrichYouTubeLikeMetrics, handlePlaylistRequest } from "../worker/content-automation.mjs";

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
}

test("Playlist uses YouTube Data API statistics.likeCount and caches only verified public metrics", async () => {
  const kv = new MemoryKv();
  const beforeFetch = globalThis.fetch;
  let requestCount = 0;
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    assert.equal(url.origin + url.pathname, "https://www.googleapis.com/youtube/v3/videos");
    assert.equal(url.searchParams.get("part"), "statistics");
    assert.equal(url.searchParams.get("key"), "test-official-key");
    assert.equal(url.searchParams.get("id"), "metric00001,unrated0001");
    requestCount += 1;
    return Response.json({
      items: [{ id: "metric00001", statistics: { likeCount: "1280" } }, { id: "unrated0001", statistics: {} }]
    });
  };
  try {
    const videos = [
      { id: "metric00001", platform: "youtube", title: "Verified guide", url: "https://www.youtube.com/watch?v=metric00001" },
      { id: "unrated0001", platform: "youtube", title: "Ratings hidden", url: "https://www.youtube.com/watch?v=unrated0001" },
      { id: "twitch-1", platform: "twitch", title: "Twitch VOD" }
    ];
    const enriched = await enrichYouTubeLikeMetrics(videos, {
      YOUTUBE_DATA_API_KEY: "test-official-key",
      CONTENT_AUTOMATION: kv
    });
    assert.equal(requestCount, 1);
    assert.deepEqual(enriched.map(video => ({ id: video.id, likeCount: video.youtubeLikeCount, status: video.youtubeLikeMetricStatus, source: video.youtubeLikeMetricSource })), [
      { id: "metric00001", likeCount: 1280, status: "verified", source: "youtube-data-api-v3" },
      { id: "unrated0001", likeCount: null, status: "unavailable", source: undefined },
      { id: "twitch-1", likeCount: undefined, status: undefined, source: undefined }
    ]);
    assert.doesNotMatch(JSON.stringify(enriched), /test-official-key/);

    globalThis.fetch = async () => {
      throw new Error("A verified cache hit must not re-query YouTube.");
    };
    const fromCache = await enrichYouTubeLikeMetrics(videos, {
      YOUTUBE_DATA_API_KEY: "test-official-key",
      CONTENT_AUTOMATION: kv
    });
    assert.equal(fromCache[0].youtubeLikeCount, 1280);
    assert.equal(fromCache[0].youtubeLikeMetricStatus, "verified");
  } finally {
    globalThis.fetch = beforeFetch;
  }
});

test("Playlist shows an honest unavailable state without a YouTube Data API key", async () => {
  const beforeFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error("No-key metric fallback must not query YouTube.");
  };
  try {
    const [video] = await enrichYouTubeLikeMetrics([{
      id: "fallback001",
      platform: "youtube",
      title: "Fallback guide"
    }], {});
    assert.equal(video.youtubeLikeCount, null);
    assert.equal(video.youtubeLikeMetricStatus, "unavailable");
    assert.equal(video.youtubeLikeMetricSource, undefined);
  } finally {
    globalThis.fetch = beforeFetch;
  }
});

test("Playlist enriches both featured and Historical Archive cards with official YouTube metrics", async () => {
  const kv = new MemoryKv();
  await kv.put("playlist:featured", JSON.stringify({
    cachedAt: new Date().toISOString(),
    items: [{ id: "featured001", platform: "youtube", title: "Featured guide" }],
    historicalItems: [{ id: "historic000", platform: "youtube", title: "Historical guide" }]
  }));
  await kv.put("playlist:knowledge-sources", JSON.stringify({ items: [] }));
  const beforeFetch = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = new URL(String(input));
    assert.equal(url.searchParams.get("part"), "statistics");
    const id = url.searchParams.get("id");
    return Response.json({
      items: [{ id, statistics: { likeCount: id === "featured001" ? "44" : "77" } }]
    });
  };
  try {
    const playlist = await handlePlaylistRequest({
      CONTENT_AUTOMATION: kv,
      YOUTUBE_DATA_API_KEY: "test-official-key"
    });
    assert.equal(playlist.items[0].youtubeLikeCount, 44);
    assert.equal(playlist.historicalItems[0].youtubeLikeCount, 77);
    assert.equal(playlist.items[0].youtubeLikeMetricSource, "youtube-data-api-v3");
    assert.equal(playlist.historicalItems[0].youtubeLikeMetricSource, "youtube-data-api-v3");
  } finally {
    globalThis.fetch = beforeFetch;
  }
});

test("Playlist cards display only verified YouTube likes and link viewers back to YouTube to like", async () => {
  const library = await readFile(new URL("../public/library/gamesense-library.js", import.meta.url), "utf8");
  assert.match(library, /video\.youtubeLikeMetricStatus !== "verified"/);
  assert.match(library, /Official YouTube like count/);
  assert.match(library, /Watch &amp; like on YouTube/);
  assert.match(library, /Open & like on YouTube/);
});
