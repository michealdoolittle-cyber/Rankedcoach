"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const librarySource = fs.readFileSync(path.join(root, "public", "library", "gamesense-library.js"), "utf8");
const cssSource = fs.readFileSync(path.join(root, "public", "library", "gamesense-library.css"), "utf8");
const policySource = fs.readFileSync(path.join(root, "public", "data", "persistence-policy.js"), "utf8");

assert.match(appSource, /watchedPlaylistVideos: normalizeWatchedPlaylistVideos\(profile\.watchedPlaylistVideos\)/);
assert.match(appSource, /RankedCoachPlaylistWatchHistory = Object\.freeze/);
assert.match(appSource, /markPlaylistVideoWatched\(watchKey = ""\)/);
assert.match(appSource, /queuePersistentAccountSave\("playlist-watch-history-merge"\)/);
assert.match(policySource, /MAX_WATCHED_PLAYLIST_VIDEOS = 1000/);
assert.match(policySource, /watchedPlaylistVideos: mergeWatchedPlaylistVideos/);

assert.match(librarySource, /data-video-watch-key=/);
assert.match(librarySource, /gamesense-video-watched/);
assert.match(librarySource, /enablejsapi/);
assert.match(librarySource, /bindYouTubePlaybackWatch/);
assert.match(librarySource, /payload\?\.event !== "onStateChange" \|\| state !== 1/);
assert.match(librarySource, /RankedCoachPlaylistWatchHistory\?\.markWatched\?\.\(normalizedWatchKey\)/);
assert.match(librarySource, /rankedcoach:playlist-watch-history-updated/);
assert.match(cssSource, /\.gamesense-video-card > \.gamesense-video-watched/);

console.log("Playlist watch history checks passed: bounded profile sync, playback-only YouTube marking, and watched-card UI.");
