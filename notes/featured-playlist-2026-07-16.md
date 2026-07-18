# Featured Playlist — Curated Video Section (2026-07-16)

**Status:** Ready to build. Third and final consumer of the trusted-channel/auto-curation infrastructure speced in `notes/patch-content-automation-2026-07-16.md` section 2 (skin showcase videos) — build that infrastructure once, this directive and that one both plug into it. This is the "external content, credited and embedded" counterpart to the Gamesense Library's in-house dossier content, and directly answers the earlier competitive research on theguide.gg: instead of RankedCoach producing paywalled video courses, it becomes the discovery/distribution layer for creators who already make good content, driving them real traffic instead of gating their audience behind a subscription.

---

## 1. The tile — a 4th `topicMeta` entry, no new visual system needed

`topicMeta` (`gamesense-library.js:13-17`) currently has `maps`, `agents`, `weapons`, rendered generically via `Object.entries(topicMeta).map(...)` (`gamesense-library.js:234-241`) into `.gamesense-topic-card` buttons. Add a 4th key, e.g. `playlist`, label **"Playlist"** (matches the existing one-word pattern) — it will automatically inherit whatever Layout Style/shape/texture/font the player has selected (confirmed built: `profile.layoutShape`/`layoutStyleCustomFont`, `document.body.dataset.layoutShape`), same as the other three tiles already do. No new theming work.

**What does need building, on top of the existing `.gamesense-topic-collage` pattern:**
- Collage background populated from the currently active featured rotation's real video thumbnails (3-4 images), not static art — reuses the existing collage grid CSS, just fed real, current thumbnail URLs instead of map/agent/weapon images. This means the tile visually refreshes itself as content rotates, for free.
- A play-button icon centered over the collage — the one genuinely new bit of CSS needed. This is the single clearest "this is video" signal and is what actually satisfies "know what it is before reading a word."
- A conditional patch-tag pill (`.gamesense-patch` pattern, same as Active Season elsewhere) — e.g. "Patch 13.01 Breakdown Inside" — only rendered when a current-patch video genuinely exists in the rotation, tied to the patch-detection work in the companion directive.
- A small "+N New This Week" badge, driven by a real count, not decorative.

---

## 2. Content model — two independent tag axes on every video

A video needs a **source type** and, for creator content specifically, a **topic type**. Don't conflate these into one field.

**Source type** (how the video got into the system):
- `patch-breakdown` — tied to the patch-detection pipeline in the companion directive.
- `bundle-showcase` — tied to new-bundle detection (same companion directive, section 2).
- `riot-official` — Riot's own channel: lore drops, cinematic content, misc official videos. Pull from Riot Games' official VALORANT YouTube channel specifically (verify the exact channel ID at build time, don't guess it).
- `creator-guide` — from the trusted educational-creator allowlist (below).

**Topic type** (what a `creator-guide` video actually teaches — not applicable to the other three source types): **Role**, **Playstyle**, **Mechanics**, **Map Knowledge**, **Movement**, **Mood/Behavior**, **Communication**. This taxonomy isn't arbitrary — it mirrors categories the app already coaches on elsewhere (Mood, Team Comms, and Self Comms are existing Logging page fields; Movement was explicitly discussed and kept out of scored metrics earlier this session, but is fair game as *video guidance* since that's exactly where Michael said it belongs — training content, not a stat).

---

## 3. Esports live streams — a different mechanism, not part of the auto-curation pipeline

This is not "detect and categorize a video" — it's a link-out to Riot's own official VALORANT Esports channel/schedule, and should be built as its own small element (e.g. a "Watch Live" or "Upcoming Matches" card), not folded into the creator-guide feed logic. Before building: confirm whether Riot's esports properties (`valorantesports.com` or the official VALORANT Esports YouTube channel) expose any public schedule data or embeddable live-status indicator, or whether this has to be a simple static "official channel" link with no live/schedule awareness. Don't assume a schedule API exists — verify it first, and fall back to a plain channel link if nothing better is available.

---

## 4. Trusted creator allowlist — verify every channel before building, don't hardcode guessed IDs

Michael's starting list: **Dopai, Woohoojin, Maxiedome/Maxie, Konpeki, SlayerKey, SenaVL, Rem, Rooney.**

Independently confirmed real and active during this session's research: **Woohoojin** (`youtube.com/channel/UCqCLRG4_zynXOEPU6N5POkw`) and **Konpeki** (both corroborated via a separate VLR.gg community post ranking coaching content creators, not just Michael's own list). The other six were not found in the two searches run this session — that is *not* evidence they're wrong, just that they weren't independently corroborated yet. **Resolve every one of these eight (plus Woohoojin/Konpeki, to get their exact channel IDs, not just the confirmed name) via the YouTube Data API's channel search at build time** — search by name, confirm it's a real, currently-active, Valorant-focused channel, and capture the actual channel ID before adding anything to the allowlist. Do not hardcode a guessed channel ID for any of these eight.

---

## 5. Categorization method — Michael's proposed approach, confirmed sound

Title-based keyword matching against the 7-item topic taxonomy above ("skimming their YouTube channel videos for titles and then categorizing them"). This is the right level of automation for the same reason the patch-detection and skin-media directives both landed on rule-based matching over open-ended AI classification: it's auditable, predictable, and fails safely.

**Fix:**
1. Pull each trusted channel's recent uploads via the YouTube Data API (same call pattern as the skin-media curation infrastructure).
2. Run title text against a keyword map for the 7 topic categories (e.g. "aim," "crosshair," "flick" → Mechanics; a specific map name → Map Knowledge; "comms," "callouts" → Communication; "tilt," "mindset," "mood" → Mood/Behavior). Define the actual keyword sets against a real sample of each creator's recent video titles before finalizing — don't guess the keyword list blind, pull real titles first the same way every other piece of this project has verified against real data before shipping.
3. **A title that doesn't confidently match any category stays uncategorized** (surfaced in a general/unsorted bucket) rather than being force-fit into the nearest guess — same "no low-confidence forced matches" principle as the skin-video-matching directive.

---

## 6. Where content surfaces

- **The Playlist dossier itself** — sectioned, not a flat list: a "This Week" rotation, then filterable by topic type, reusing the existing tab pattern already established elsewhere (Priority Trends' filter row, or the Tips hub's category tabs) rather than inventing new filter UI.
- **Contextual cross-references** — a "Related Video" card surfaced at the bottom of relevant Map/Agent/Weapon dossiers, pulled from the same pool by tag match. One content pool, two surfaces.

---

## 7. Attribution and embed hygiene

- Show creator name/channel alongside every embed, plus a clear "Watch on YouTube" outbound link. In-app embedded plays still count toward the creator's real YouTube view count — this isn't a tradeoff against them, it's a genuine benefit either way.
- Suppress YouTube's related-video suggestions in the embed parameters so unrelated content never surfaces next to RankedCoach's own product.
- **A real, fast escape hatch to unpublish a bad auto-match** — this is the direct mitigation for the curation-difficulty risk Michael flagged earlier, not optional polish. A keyword-matched video can land in the wrong category or, rarely, be the wrong video entirely; there needs to be a one-step way to pull it before it's ever presented as curated.

---

## Testing checklist — don't report this batch done until:

1. All eight trusted creators (plus Riot's official channel) have real, verified channel IDs — confirm this was actually checked via the API, not assumed from the name list in this note.
2. A sample pull from each trusted channel is manually spot-checked against the 7-topic keyword taxonomy before the taxonomy is considered final — real titles, not synthetic test cases.
3. The Playlist tile renders correctly under at least two different Layout Styles (same compatibility bar as every other Layout Style-aware component) with zero new hardcoded colors.
4. The esports live-stream element gracefully degrades to a plain channel link if no schedule/live-status data source is actually confirmed available — don't ship a fake "live now" indicator.
5. At least one deliberately mismatched video title is used to confirm the uncategorized-bucket fallback actually works, not just the happy path.
6. The escape-hatch removal flow is tested end to end — flag a real auto-matched video, confirm it's gone from both the dossier and any contextual cross-reference within one pull cycle.
7. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
8. Bump the cache key in `public/index.html` for every changed asset.
