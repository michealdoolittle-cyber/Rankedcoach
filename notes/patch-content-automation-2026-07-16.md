# Patch-Change Detection and Skin Media Auto-Curation (2026-07-16)

**Status:** Shipped 2026-07-18. Cloudflare now checks the live Valorant version every six hours, stores the last verified patch in `CONTENT_AUTOMATION` KV, scans only Riot's agent/weapon balance sections, and sends the established ntfy review alert without rewriting Gamesense coaching copy. Trusted skin-media curation runs off the same Worker infrastructure, applies only confident collection-title matches, and queues unresolved video/model gaps for review. The YouTube Data API path is ready when `YOUTUBE_DATA_API_KEY` is configured; trusted channel feeds are the deployed fallback. Patch 13.01, no-op detection, real Blackspyre media, Wrangler dry-run, focused UI suites, and the full mobile/desktop passthrough all passed. Browser cache key: `20260718-content-automation-01`.

**Sequencing note:** this directive is meant to land before the Featured Creators video-feed directive, because section 2 below shares infrastructure with it — build the trusted-channel + video-lookup system once, and both this directive and the video feed consume it.

---

## 1. Patch-change detection and a content-review flag (not silent auto-rewrite)

**The gap:** Gamesense Library content (Map Tips, Agent Fundamentals/Facts, Weapon dossiers) is entirely hand-authored static data in `gamesense-maps.js`/`gamesense-reference.js` — confirmed directly, this has been hand-edited all session. Nothing currently detects when a patch changes agent/weapon balance and flags the affected dossiers for review; it relies on someone noticing.

**Real data source, confirmed live:** `https://valorant-api.com/v1/version` — free, no API key, returns the current game version. Confirmed live response today: `{"branch":"release-13.01","version":"13.01.00.5090349","buildDate":"2026-07-16T17:42:16Z"}`.

**Patch-notes URL, confirmed predictable:** Riot's patch notes live at `https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-{slug}`, where `{slug}` is the version's branch with the dot replaced by a dash (`release-13.01` → `13-01`). Confirmed against three real, live patches: 13.01, 13.00, 12.11 all resolve correctly. The page itself is plain HTML with no RSS/JSON feed — confirmed via direct fetch, so the content has to be parsed as text, not consumed as structured data.

**Fix — detection is automatic, content rewriting stays human-reviewed:**
1. Add a scheduled check (confirm whether Cloudflare Cron Triggers are already configured in `wrangler.toml` — `docs/CLOUDFLARE-DEPLOY.md` should say — or whether one needs adding) that polls `/v1/version` and compares against the last-known version, persisted in whatever storage binding the project already has (check for an existing KV namespace before adding a new one).
2. On a version change: construct the patch-notes URL per the slug rule above, fetch it, and text-scan for known agent/weapon names already present in `gamesense-reference.js`'s own data (a simple keyword match against the roster — not NLP) to identify which dossiers are actually affected. The real patch fetched today (13.01) is a good first test case: its headline is *"Adjustments to Iso, Yoru, and Outlaw, and punishing rank manipulators"* — the scan should correctly flag Iso, Yoru, and Outlaw's dossiers.
3. Send a notification the same way deploys already do — `node scripts/notify.js "Patch 13.01 detected — dossier review needed: Iso, Yoru, Outlaw"` (`scripts/notify.js`, existing ntfy pattern) — rather than inventing a new notification path.
4. **Do not auto-rewrite `gamesense-reference.js`/`gamesense-maps.js` prose from the patch notes text.** Detection and flagging are what becomes automatic; updating the actual coaching copy stays a reviewed edit, the same as every other content change in this project. Silently regenerating player-facing coaching language from scraped patch text would cut directly against the project's established "never fabricate, always verify" discipline — this is a genuine philosophy line, not a shortcut worth taking to save a step.

---

## 2. Automated skin showcase-video / 3D-model curation

**The gap, confirmed precisely:** skin *data* (images, editions, variants) already auto-updates live from `valorant-api.com/v1/weapons/{uuid}` (`public/library/gamesense-collections.js`, `loadForWeapon()`) — that part is not the problem. The actual manual bottleneck is two static lookup tables in the same file:
- `approvedCollectionVideos` + `dittozkulFallbackVideos` (`gamesense-collections.js:33-79`) — hand-picked YouTube video IDs per skin collection, gating the showcase video shown in the skin preview modal (`openSkinPreview`, `gamesense-library.js:1060+`).
- `approvedSketchfabModels` (`gamesense-collections.js:82-126`) — hand-curated 3D model links, same gating pattern.

Any collection/skin not present as a key in these tables silently falls back to no video / no 3D model (`getCollectionVideo()`/`getSketchfabModel()` return `null`) — confirmed one commit alone added 70+ hand-pasted entries in a single pass.

**Also worth knowing, in case "bundles" meant something more specific:** the app doesn't use Riot's real `/v1/bundles` endpoint anywhere — confirmed live and working (`https://valorant-api.com/v1/bundles` returns real store-bundle data with names/icons), but this codebase's "collections" are just per-weapon skin lines grouped by the live API's own naming, not actual Riot store bundles. If real bundle detection (the actual purchasable bundle offers) is wanted, that's new scope beyond what's here — flag it back if so.

**Fix — build once, reuse for the video feed too:**
1. Build the trusted-channel allowlist + YouTube Data API lookup infrastructure described in the upcoming Featured Creators video-feed directive first (or in parallel) — this section is its second consumer, not a separate system.
2. When `loadForWeapon()` surfaces a collection/skin key not present in `approvedCollectionVideos`/`approvedSketchfabModels`, auto-query the trusted channel list for a video whose title contains the collection name (simple keyword match, same caution as the video-feed directive — confident match only, no broad open-web search).
3. On a confident match, populate the entry automatically. On no confident match, leave the existing silent-`null` fallback behavior exactly as it is today — don't force a low-confidence match just to fill the gap — and include it in the same patch/content-review notification from section 1 so a human knows a skin is missing curated media, instead of it silently going unnoticed.

---

## Testing checklist — don't report this batch done until:

1. The version-poll correctly detects a real patch change (test against the actual 13.01 release used throughout this note) and does not false-positive on no-op checks.
2. The patch-notes URL construction is verified against at least the three real patches confirmed in this note (13.01, 13.00, 12.11), not just one.
3. The agent/weapon name-matching against patch-notes text correctly flags Iso, Yoru, and Outlaw for the 13.01 patch specifically — use this as the concrete pass/fail case, not a synthetic one.
4. Confirm no coaching prose in `gamesense-reference.js`/`gamesense-maps.js` is ever auto-written by this pipeline — only the notification/flag is automatic.
5. The skin/3D-model auto-curation only populates on a confident title match and safely no-ops (current silent-fallback behavior, unchanged) otherwise — test against at least one real new collection release, not a mock.
6. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
7. Bump the cache key in `public/index.html` for every changed asset.
