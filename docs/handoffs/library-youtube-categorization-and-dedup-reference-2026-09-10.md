# How the retired RankedCoach app categorized/deduped/refreshed YouTube content

**Written:** 2026-09-10, in response to: the video hub on the current `rankedcoach.gg` (Lovable) is (1) not assigning videos to the right categories, (2) duplicating hosted locations for the same video, (3) not surfacing news-related content, and (4) not refreshing the home tab with new content. This is a mechanism-level reference for the *retired* Cloudflare/vanilla-JS app's solution to each of those four problems, so it can be used as a spec when fixing the Lovable rebuild. It assumes no familiarity with this repo.

**Supersedes a domain claim in the earlier handoff** (`library-content-pipeline-outline-for-lovable-2026-08-31.md`, written 9 days ago): that doc said the retired app was live at `beta.rankedcoach.gg`. Re-checked live today — `beta.rankedcoach.gg` no longer resolves (DNS lookup fails outright) and `rankedcoach.gg` now serves the Lovable app directly (`twitter:site: @Lovable` in its HTML head, Vite-hashed asset bundle). **The retired app is not live anywhere right now** — everything below describes code that still exists in this repo (`Rankedcoach-main-sync`) but isn't serving real traffic. See the "Still running" section at the bottom for an important, separate finding about its cron job.

All of this logic lives in one file: `worker/content-automation.mjs`. The functions named below are real exports from that file, not paraphrased.

## 1. How a video got assigned to a category ("not properly assigning videos where they belong")

Category assignment is a **priority waterfall**, evaluated per video inside `buildFeaturedPlaylist()`. Each check is exclusive — first match wins, nothing falls through to a later check once assigned:

1. **Live/Streaming** — `getLiveStreamingClassification()`. Only true if `video.isLive === true` (an actual current-live signal from the YouTube API), never inferred from title text.
2. **VOD's** — `isPlaylistVodSource()`. True if `video.isVod`/`video.wasLive` is set, or the source is a Twitch VOD (`sourceType === "twitch-archive"` or a `twitch.tv/videos/<id>` URL).
3. **A manual override** — `video.topicTypeOverride`, but only if it's one of the 7 valid category names (`PLAYLIST_TOPIC_TYPE_SET`). This is the escape hatch for a video that content-based rules would otherwise miscategorize.
4. **News** — only reachable if `sourceType` is `"riot-official"` or `"patch-breakdown"` *and* `hasNewsCue()` matches. See section 3, this is almost certainly your bug #3.
5. **YT Shorts** — `video.isShort`.
6. **Keyword-scored category** — only for `sourceType === "creator-guide"` or `"searched-guide"` — via `categorizeCreatorTitle()`, described next.
7. **General** — the fallback if nothing above matched.

`sourceType` itself is decided *before* any of this, in `getVideoSourceType()`:
- Explicit `video.sourceType` if already set (used by the static/pinned list and owner-submitted research videos).
- `"creator-guide"` if `video.channelKind === "creator"` (i.e. it came from `TRUSTED_YOUTUBE_CHANNELS`).
- `"patch-breakdown"` if the title contains the literal text `"patch <current patch label>"`.
- `"bundle-showcase"` if the title matches `/skin|bundle|collection|showcase|reveal/`.
- Otherwise `"riot-official"` — the default assumption for anything not otherwise flagged.

**`categorizeCreatorTitle()` — the actual keyword classifier:**

```js
export function categorizeCreatorTitle(title = "") {
  if (GENERAL_PLAYLIST_TITLE_PATTERNS.some(pattern => pattern.test(title))) return "General";
  const normalized = normalizeSearchText(title);   // strip accents/punctuation, lowercase, collapse whitespace
  let best = null;
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const score = keywords.reduce((total, kw) => total + (normalized.includes(normalizeSearchText(kw)) ? 1 : 0), 0);
    if (score > (best?.score || 0)) best = { topic, score };
  }
  return best?.score ? best.topic : "General";
}
```

It's a **substring keyword match against the video title only** (not description, not transcript) — count how many keywords from each category appear in the normalized title, take the highest-scoring category, ties/zero go to `"General"`. The categories and their keyword lists (`TOPIC_KEYWORDS`):

| Category | Keywords matched |
|---|---|
| Role | role, controller, duelist, initiator, sentinel, entry, entries, lurk, anchor |
| Agent | agent, agents, + every one of the 29 agent names (`AGENT_NAMES`) |
| Map Knowledge | every one of the 13 competitive map names (`MAP_NAMES`) |
| Mechanics | aim, crosshair, flick, spray, recoil, gunfight, peeking, one tapped, sensitivity, movement, strafe, deadzon(e), counter straf(e), jump peek, jiggle |
| Mentality | mindset, tilt, toxic, confidence, mental, improving, hardstuck, comms, communication, callout, teammate, teamplay, igl |
| Settings/Gear | settings, gear, peripheral(s), monitor, icc, color, clarity, graphics, nvidia, pc settings, resolution, sens, sensitivity |

Note the deliberate simplicity: no NLP, no LLM call in the hot path, no external API for this step — a straight keyword-in-title count. It's cheap and predictable, and its failure modes are equally predictable (a title with zero recognized keywords always lands in General; a title matching two categories equally goes to whichever the loop reaches first in insertion order above, since the comparison is strict `>` not `>=`).

**If the Lovable rebuild is misassigning categories**, the highest-value things to check are: (a) is it running this same kind of keyword pass on the title at all, or trying something fuzzier/LLM-based that's less predictable and harder to debug; (b) is `sourceType` being computed *before* topic classification, since several branches above depend on it; (c) is the check order the same (News/Shorts/VOD checked before the keyword pass, not after).

## 2. How duplicate hosting was prevented ("duplicating hosted locations")

The dedup key was never the raw URL or the title — both are too easy to vary (tracking params on a URL, near-identical retitled uploads). It's a **canonical platform+ID identity**, computed by `playlistResearchIdentity()`:

```js
function playlistResearchIdentity(video = {}) {
  const platform = video.platform || (/twitch\.tv/i.test(video.url) ? "twitch" : "youtube");
  let upstreamId = video.upstreamId || video.id || "";
  if (platform === "youtube") {
    upstreamId = url.match(/[?&]v=([A-Za-z0-9_-]{11})/)?.[1]
      || url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)?.[1]
      || upstreamId.replace(/^youtube-/i, "");
  } else if (platform === "twitch") {
    upstreamId = url.match(/twitch\.tv\/videos\/(\d+)/)?.[1] || upstreamId.replace(/^twitch-/i, "");
  }
  return `${platform}:${upstreamId}`;
}
```

It extracts the actual 11-character YouTube video ID (or numeric Twitch VOD ID) straight out of the URL via regex, regardless of query-string noise, `youtu.be` vs `youtube.com/watch?v=` format, or an `id`/`upstreamId` field prefix mismatch. Two records referencing the same video always resolve to the same `"youtube:dQw4w9WgXcQ"`-style key even if their URLs, titles, or source records differ.

Three layers use that identity to prevent duplication:

1. **`dedupePlaylistVideos(items)`** — a straight `Set`-based first-occurrence dedup over that identity.
2. **`mergePlaylistResearchArchive(stale, current, curated)`** — when combining sources, explicit precedence order (curated wins over current-fetch metadata, which wins over a stale cached copy), fed through the same dedup.
3. **`buildHistoricalPlaylistArchive(curatedItems, featuredItems, ...)`** — this is specifically the "don't show the same video in two different places" guarantee. It computes the identity-set of everything already in the live Featured feed, then filters the curated archive to exclude anything matching — a video only ever appears in *either* Featured *or* Historical, never both, and the check is by canonical identity, not by list membership or manual bookkeeping.

**If the Lovable rebuild is duplicating hosted locations**, check whether it dedupes by canonical extracted-ID identity or by something weaker (raw URL string equality, title equality, or worse, no dedup at all when the same video gets pulled in from two different source lists — e.g. the curated guide list and a live search hitting the same video independently).

## 3. How "News" content got surfaced ("not referencing news related content")

This is almost certainly the exact bug. `hasNewsCue()`:

```js
function hasNewsCue(video = {}, sourceType = "") {
  if (sourceType === "patch-breakdown") return true;
  const text = normalizeSearchText(`${video.title} ${video.description}`);
  return /\b(?:patch|update|buff(?:s|ed|ing)?|nerf(?:s|ed|ing)?|ban(?:s|ned|ning)?|anti cheat|smurfing|win trading|queue sniping|night market|new agent|new map|ranked changes|competitive changes)\b/.test(text);
}
```

Two conditions have to *both* be true for a video to land in News: **(a)** `sourceType` has to already be `"riot-official"` or `"patch-breakdown"` — a creator's video discussing a patch never reaches this check no matter what its title says, because that gate is checked first in the waterfall (see section 1, step 4) — and **(b)** the title+description text has to contain one of those specific keywords. `sourceType === "patch-breakdown"` alone is enough by itself (line 1 of the function) — that's the title-contains-`"patch <current label>"` check from `getVideoSourceType()`.

There's a second, separate news source entirely: the actual Riot patch-notes page itself, fetched directly (not via YouTube) — `RIOT_NEWS_ROOT = "https://playvalorant.com/en-us/news/game-updates"`, scraped for a version/patch listing, cached in KV under `riot:patch-notes:latest:v2` with a 1-hour TTL, served via `GET /api/content/patch-notes`. That's Tier-1 "official written news," separate from "News-tagged videos" in the playlist — the Lovable rebuild's video hub gap is specifically about the video-tagging path above, but worth knowing both exist if "news" in the new app means the written feed rather than video cards.

**If the Lovable rebuild isn't surfacing news**, the two most likely gaps are: it never computes a `patch-breakdown`/`riot-official` sourceType distinction at all (everything gets bucketed as a generic creator/guide type), or it has that distinction but never runs a keyword scan against title+description for the News label specifically — i.e. the sourceType gate exists but the content gate (`hasNewsCue`) was never ported.

## 4. How the home tab got new content without staleness ("not adjusting home tab properly to show new content")

Two separate things combine here, and a rebuild missing either one produces a stale-looking home tab:

**a) The refresh trigger (cron, not request-driven):**
```toml
# wrangler.toml
[triggers]
crons = ["17 */6 * * *", "43 9 * * *"]   # every 6 hours, plus once daily at 09:43
```
`worker/index.js`'s `scheduled()` handler calls `runPlaylistKnowledgeAutomation` (and patch/library automation) on that schedule — this is what actually re-fetches YouTube data and rebuilds the featured list, independent of anyone visiting the site. The `GET /api/content/playlist` request handler (`handlePlaylistRequest`) only ever reads from KV; it doesn't re-fetch itself except as a fallback when the cache is missing/stale beyond `PLAYLIST_CACHE_WINDOW_MS` (5 minutes). **If content only ever refreshes when someone happens to load the page, and there's no independent background job re-running the fetch, the home tab will look frozen at whatever the very first successful fetch produced** — this is the single most likely cause of bug #4 in a rebuild that dropped the cron piece.

**b) Freshness metadata computed fresh on every classification pass**, inside `buildFeaturedPlaylist()`:
```js
isNewThisWeek: Date.parse(video.publishedAt) >= (now - 7 * 24 * 60 * 60 * 1000),
isNewIn24Hours: Date.parse(video.publishedAt) >= (now - 24 * 60 * 60 * 1000)
```
plus the whole list is sorted pinned-first, then `publishedAt` descending, before being capped to the top 120 (`PLAYLIST_MAX_ITEMS`). So "new" isn't a manually-flagged field anywhere in a data file — it's derived at build time from each video's real publish timestamp against whatever `now` is at cron-run time, which is exactly why it self-updates correctly as long as the cron keeps firing.

There's also a proactive-search layer that actively looks for new content rather than waiting on the curated list to be edited: `GUIDE_SEARCH_TARGETS` builds one search target per agent (29) and per competitive map (13), and `fetchPopularGuideSearchVideos()` searches YouTube for the most popular guide per target, caching each result 14 days (`PLAYLIST_GUIDE_SEARCH_CACHE_TTL_SECONDS`) — this is what keeps the library current for a newly-released agent/map without anyone manually adding a video.

## Quick mapping back to your 4 reported symptoms

| Symptom | Mechanism to check in the Lovable rebuild |
|---|---|
| Videos not assigned to the right categories | `getVideoSourceType()` → `categorizeCreatorTitle()` waterfall (section 1); is `TOPIC_KEYWORDS`-equivalent keyword scoring even implemented, and in the right check order? |
| Duplicating hosted locations | Canonical `platform:videoId` identity extraction + Featured/Historical mutual exclusion (section 2) — is dedup keyed on extracted ID, or on something weaker? |
| Not referencing news content | Two-part gate: sourceType must be riot-official/patch-breakdown *and* a keyword cue must match (section 3) — check both halves are implemented, not just one |
| Home tab not showing new content | A scheduled background job independent of page views, not a fetch-on-load (section 4a); is there any cron/scheduled equivalent at all in the Lovable/Supabase stack? |

## Still running: the retired app's cron, and your ntfy question

You asked whether the Cloudflare sync notifications you're still seeing through ntfy are from the new Lovable app or the retired one. **They're from the retired one.** Confirmed directly:

- `beta.rankedcoach.gg` — DNS doesn't resolve at all anymore.
- `rankedcoach.gg` — confirmed serving the Lovable app (`@Lovable` meta tag, Vite asset bundle).
- The retired app's original Cloudflare Worker (`wrangler.toml`, name `rankedcoach`) is **still deployed and responding** — `https://rankedcoach.michealdoolittle.workers.dev/api/health` returns `{"ok":true,"runtime":"cloudflare-worker"}` right now, and `wrangler deployments list` shows a deployment as recent as 2026-08-26.
- Lovable's own hosting doesn't run through this Worker or this repo at all, and a Lovable/Supabase-based project would not produce notifications to `NTFY_TOPIC = "rankedcoach-deploys-mk7x2q"` (that topic is hardcoded in this repo's `wrangler.toml`).

A Worker's `[triggers] crons` keep firing on Cloudflare's schedule regardless of whether any custom domain points at it — removing the `beta.rankedcoach.gg` DNS route didn't stop the cron, it just stopped anyone from being able to *see* the Worker's output. Every 6 hours (plus once daily), this retired Worker is still calling out to YouTube/Riot/OpenAI, writing to the shared `CONTENT_AUTOMATION` KV namespace, and pushing an ntfy notification — for an app nobody can reach.

**This is worth deliberately shutting down**, both to stop the noise and because it's spending real API quota/cost for zero benefit. The clean way to do it: remove the `[triggers]` block from `wrangler.toml` and redeploy (`npx wrangler deploy --config wrangler.toml`), which stops the cron while leaving the Worker and its code intact for reference. Say the word and I'll make that change — it's a one-line removal, but I'm not doing it without you confirming, since it's a live production Cloudflare change even though the app itself is retired.
