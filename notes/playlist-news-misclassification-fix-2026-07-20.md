# Playlist "News" Misclassification Fix (2026-07-20)

**Confirmed root cause, not a guess:** `hasNewsCue()` in `worker/content-automation.mjs:156-160` runs a bare-keyword regex against every video's title+description regardless of where the video came from, and classifies it "News" on any match. The trigger example: a Dopai (or similar trusted creator) video titled *"How to Get So Good At Valorant It Feels Like Smurfing"* — a skill-improvement video, not news — gets caught because the regex includes the bare word `smurfing` (intended to catch real anti-smurf policy stories), and `\bsmurfing\b` matches the colloquial use in that title with zero phrase context.

**This is a systemic risk, not a one-word bug.** Other words on the same list (`worker/content-automation.mjs:159`) are just as ambiguous in ordinary creator content: `ban`/`bans`/`banned` means real anti-cheat news in one sense, but is completely normal language in strategy videos ("Top 5 Agents to Ban This Patch," "Why You Should Ban This Map"). `buff`/`nerf` have the same risk in "here's how to abuse the buffed X" guide titles. Patching the word "smurfing" alone would leave this exact failure mode open on the next creator video that happens to use "ban" or "nerf" in its title.

## The real fix — a structural gate, not a better keyword list

`getLiveStreamingClassification()` (same file, line 162) already solves an equivalent problem correctly: it checks real structural signal first (`wasLive`, Twitch archive metadata) and only falls back to a title-regex as an explicitly flagged **low-confidence** guess (`confidence: "low"`, routed through `notifyLowConfidencePlaylistReviews`). News classification does the opposite today — the keyword regex runs unconditionally against every video, including the 10 trusted creator channels (`TRUSTED_YOUTUBE_CHANNELS`, `content-automation.mjs:24-36`) who make skill/strategy/guide content and realistically never publish actual game-update news. Only Riot's own channel (`kind: "riot"`) and confirmed patch-breakdown content should ever be eligible for News.

**Change `buildFeaturedPlaylist()`'s classification order** (`content-automation.mjs:279-287`), from:
```js
const topicType = streaming.matches
  ? "Live/Streaming"
  : hasNewsCue(video, sourceType)
    ? "News"
    : video.isShort
      ? "YT Shorts"
      : sourceType === "creator-guide"
        ? categorizeCreatorTitle(video.title)
        : "General";
```
to gate the News check on `sourceType` first:
```js
const topicType = streaming.matches
  ? "Live/Streaming"
  : (sourceType === "riot-official" || sourceType === "patch-breakdown") && hasNewsCue(video, sourceType)
    ? "News"
    : video.isShort
      ? "YT Shorts"
      : sourceType === "creator-guide"
        ? categorizeCreatorTitle(video.title)
        : "General";
```
This means: a creator-channel video can never be misrouted into News no matter what incidental words appear in its title — it instead correctly falls through to `categorizeCreatorTitle()`, which scores it against `TOPIC_KEYWORDS` (`content-automation.mjs:45-51`) and lands it in Role/Agent/Map Knowledge/Mechanics/Mentality/General as appropriate. Confirmed: the Smurfing video's title matches none of the `TOPIC_KEYWORDS` sets, so it would correctly land in **General**.

`hasNewsCue()`'s keyword list itself can stay as-is once this gate is added — it's fine as a heuristic for Riot's own channel and confirmed patch content, where "buff," "nerf," "ban," "smurfing" etc. genuinely do signal real news rather than colloquial creator language.

## Also worth doing while in this code

Every other trusted-channel entry with `kind: "creator"` should be double-checked against this same assumption (none of them realistically publish real Valorant news) — confirmed already true for all 10 in the current allowlist, just flagging so this doesn't quietly break if a news-adjacent channel gets added to `TRUSTED_YOUTUBE_CHANNELS` later without updating this gate.

## Testing checklist

1. Re-run classification against the actual "How to Get So Good At Valorant It Feels Like Smurfing" video (or an equivalent live pull from the same creator channel) — confirm it now lands in "General," not "News."
2. Spot-check a handful of other recent videos from each of the 10 creator channels — confirm none of them land in "News" regardless of title wording (test specifically against titles that would contain "ban," "nerf," "buff," "patch" colloquially).
3. Confirm a real Riot-channel patch/update video still correctly classifies as "News" — this fix must not suppress legitimate news, only gate it to the right source.
4. Confirm `patch-breakdown` sourceType still works for Riot's own channel. Note this is structurally never reachable for a creator channel anyway — `getVideoSourceType()` (`content-automation.mjs:261-267`) checks `video.channelKind === "creator"` first and returns `"creator-guide"` immediately, before the `patch-breakdown` check on line 265 ever runs — so there's no actual judgment call needed here, a creator's own patch-recap video already can't reach `patch-breakdown` today and won't be affected by this fix either way.
5. `node --check` on `worker/content-automation.mjs`; run the existing visual-audit/worker test suite before deploying.
6. Bump the cache key / confirm the 5-minute KV cache (`PLAYLIST_CACHE_WINDOW_MS`) doesn't need manual invalidation for this to take effect, or document that it'll self-correct within 5 minutes of deploy.
