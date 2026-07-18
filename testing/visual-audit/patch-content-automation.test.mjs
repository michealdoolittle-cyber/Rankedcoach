import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  TRUSTED_YOUTUBE_CHANNELS,
  buildFeaturedPlaylist,
  categorizeCreatorTitle,
  extractBalanceUpdateText,
  fetchTrustedChannelVideos,
  findAffectedDossiers,
  findConfidentCollectionVideo,
  getPatchDescriptor,
  runPatchContentAutomation
} from "../../worker/content-automation.mjs";

const repoRoot = new URL("../../", import.meta.url);
const referenceUrl = new URL("public/library/gamesense-reference.js", repoRoot);
const mapsUrl = new URL("public/library/gamesense-maps.js", repoRoot);
const hashFiles = async () => createHash("sha256").update(`${await readFile(referenceUrl, "utf8")}\n${await readFile(mapsUrl, "utf8")}`).digest("hex");

const descriptor = getPatchDescriptor({ branch: "release-13.01", version: "13.01.00.5090349" });
assert.equal(descriptor.label, "13.01");
assert.equal(descriptor.notesUrl, "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-01/");

const patchUrls = ["13-01", "13-00", "12-11"].map(slug => `https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-${slug}/`);
const patchResponses = await Promise.all(patchUrls.map(url => fetch(url)));
assert.deepEqual(patchResponses.map(response => response.ok), [true, true, true], "The three real Riot patch-note URLs must resolve.");
const patch1301Html = await patchResponses[0].text();
assert.deepEqual(findAffectedDossiers(extractBalanceUpdateText(patch1301Html)), ["Iso", "Yoru", "Outlaw"], "Patch 13.01 must flag only the balance-update dossiers.");

const liveVideos = await fetchTrustedChannelVideos({});
const playlistChannels = TRUSTED_YOUTUBE_CHANNELS.filter(channel => channel.playlist).map(channel => channel.name);
playlistChannels.forEach(channel => assert(liveVideos.some(video => video.channel === channel), `${channel} must have a live trusted-channel feed.`));

const creatorSamples = new Map([
  ["Dopai", "Steal this Summit Strat"],
  ["Woohoojin", "Why Eggsters Entries are so good."],
  ["Maxie", "How to be USEFUL on OMEN"],
  ["Konpeki", "1 Mistake For Every Agent In 2026"],
  ["Slayerkey", "Your Aim Isn't Inconsistent. Here's What's Actually Happening."],
  ["Sena", "You Don't Suck, You're Just Playing the Wrong Agent"],
  ["Rem", "Valorant Is BUFFING Yoru"],
  ["Rooney", "the hidden mistake keeping you hardstuck"]
]);
for (const [channel, title] of creatorSamples) {
  assert.notEqual(categorizeCreatorTitle(title), "Uncategorized", `${channel}'s real-title sample must map confidently.`);
}
assert.equal(categorizeCreatorTitle("A quiet afternoon update"), "Uncategorized", "An unrelated title must fail closed.");

const blackspyreId = "aSFtc5Y-ORQ";
const blackspyreMetadataResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${blackspyreId}&format=json`);
assert.equal(blackspyreMetadataResponse.ok, true, "The approved Blackspyre showcase must still resolve on YouTube.");
const blackspyreMetadata = await blackspyreMetadataResponse.json();
assert.equal(blackspyreMetadata.author_name, "VALORANT");
const blackspyre = findConfidentCollectionVideo("Blackspyre", [{ id: blackspyreId, title: blackspyreMetadata.title, channel: blackspyreMetadata.author_name }]);
assert(blackspyre?.id, "The real Blackspyre release must confidently match trusted showcase media.");
assert.equal(findConfidentCollectionVideo("Imaginary Collection", liveVideos), null, "A missing collection must not receive a forced match.");

const suppressed = buildFeaturedPlaylist(liveVideos, "13.01", new Set([liveVideos[0].id]));
assert(!suppressed.items.some(item => item.id === liveVideos[0].id), "A suppressed real video must disappear from the rotation immediately.");

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
