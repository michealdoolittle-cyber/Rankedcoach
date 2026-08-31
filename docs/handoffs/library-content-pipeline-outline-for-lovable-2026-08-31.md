# RankedCoach Library — content pipeline outline (for Lovable handoff)

**Purpose:** explains how the Gamesense Library feature on `beta.rankedcoach.gg` sources, caches, and serves its content so that opening the Library never blocks on a live third-party API or LLM call. Written to be handed to Lovable as a spec for replicating the same feature/pattern. Repo paths below are relative to the `Rankedcoach-main-sync` repo root.

## Which codebase this describes

Two directories in this repo could plausibly be "the app": `public/` and `beta/public/`. Despite the folder name, **`beta/public/` is NOT what's live at beta.rankedcoach.gg** — it's an early, mostly-unbuilt redesign scaffold (383 lines total across its JS files, effectively a placeholder). Confirmed by fetching `https://beta.rankedcoach.gg/` directly: the served HTML references `library/gamesense-library.css`, `app.css`, `mobile-qa-final.css`, and the other asset names that only exist in root `public/` — i.e. **the live beta.rankedcoach.gg site is root `public/` + `worker/index.js` + `wrangler.toml`** (Worker name `rankedcoach`). `www.rankedcoach.gg` itself has moved to a separate Lovable project outside this repo. This mismatch between the `beta/` folder's name and what's actually deployed is worth flagging to whoever picks this up next — it's a real source of confusion in the repo as it stands today.

## The short version

Library content is not fetched live when a user opens the page. It exists in three tiers, and only the third one ever makes a network call at request time — and even that call hits a pre-warmed cache, never an external API directly.

| Tier | What | When it's populated | Runtime cost on page load |
|---|---|---|---|
| 1 | Static reference/encyclopedia data (maps, agents, weapons, callouts, dossiers) | Build-time / one-time authoring passes, committed to the repo | Zero — already in memory before the Library page renders |
| 2 | Static media (map art, agent portraits, official ability clips) | Downloaded once from the source, saved as local files | Zero — served as ordinary static assets off the same edge deploy |
| 3 | Semi-live content (patch notes, featured video playlist, published knowledge-base entries) | Refreshed on a background cron schedule | One same-origin GET to a KV-cache read — typically single-digit ms |

## Tier 1 — static reference data, loaded synchronously at page load

These files are plain JS, each wrapped in an IIFE that attaches its data to `globalThis.RankedCoach*`, and are loaded via `<script>` tags in `public/index.html` (lines ~2298-2309) **before** `app.js` runs. By the time any Library UI code executes, all of this is already sitting in memory — there is no `fetch()` in the render path for any of it.

- `public/library/gamesense-maps.js` — map dossiers: macro strategy, site tips, callouts, plant spots, comp data.
- `public/library/gamesense-reference.js` — agent ability text (summary/purpose/setup) and weapon stat tables.
- `public/library/gamesense-encyclopedia.js` — the larger agent/weapon/map encyclopedia entries.
- `public/library/gamesense-promoted.js` — promoted/featured content surfaced in the Library UI.
- `public/library/gamesense-map-layout-overrides.js` — manual position/label corrections layered on top of the auto-sourced map callout data.
- `public/library/gamesense-dossier-text-overrides.js` — manual text corrections layered on top of auto-generated dossier prose.
- `public/library/gamesense-vstats-reference.js` — weapon/agent stat reference numbers (sourced from vstats.gg, see below).
- `public/library/gamesense-heatmaps.js`, `gamesense-collections.js` — supporting content for heatmap and collection views.
- `public/library/gamesense-library.js` (5,800 lines) — the actual Library UI logic that reads all of the above and renders it, plus the three Tier 3 fetches described below.

All of these are versioned via a `?v=<date>-<slug>` query string on the script tag, so a content update just means editing the file and bumping that version string (cache-busts the CDN/browser cache on next deploy) — no separate publish step.

## Tier 2 — static media, self-hosted (no runtime hotlinking)

Per `public/assets/library/README.md`:

- Map splash/tactical-layout art and agent portraits/icons are **downloaded once** from `https://valorant-api.com/v1/maps` and `https://valorant-api.com/v1/agents?isPlayableCharacter=true` (a community-run wrapper around Riot's own game-data), saved as local files under `public/assets/library/`, and refreshed only when the underlying reference data is reviewed after a patch.
- This is deliberate: "local copies avoid runtime hotlinking and keep the Library usable if the community asset endpoint is temporarily unavailable" — direct quote from that README.
- Official ability clips (`public/library/gamesense-official-media.js`) are the one exception — those stay hotlinked directly to Riot's own CDN (`cmsassets.rgpub.io`), sourced from `https://playvalorant.com/en-us/agents/<agent>/`, since that's Riot's own first-party infrastructure rather than a third party.

## Tier 3 — semi-live content, KV-cached and cron-refreshed

Three Library-facing endpoints do make a real `fetch()` at page-load time, from `public/library/gamesense-library.js`:

- `GET /api/content/knowledge` — published knowledge-base entries (coaching claims mined from video transcripts).
- `GET /api/content/patch-notes` — latest Riot patch notes summary.
- `GET /api/content/playlist` — the featured video playlist.

**Why these don't introduce lag:** all three are handled in `worker/index.js` by functions in `worker/content-automation.mjs` / `worker/knowledge-api.mjs`, and every one of them reads from a Cloudflare KV namespace (`CONTENT_AUTOMATION`) first and returns that immediately if it's fresh. Example (`content-automation.mjs`, `handlePlaylistRequest`):

```js
const cached = await env.CONTENT_AUTOMATION?.get?.("playlist:featured", "json");
if (cached?.cachedAt && Date.now() - Date.parse(cached.cachedAt) < PLAYLIST_CACHE_WINDOW_MS) {
  // serve cached.items immediately — no external call
}
```

The expensive work — calling the YouTube API, scraping/parsing Riot's patch-notes page, running an LLM pass to extract coaching claims from video transcripts — happens **off the request path**, in a scheduled Worker handler:

```toml
# wrangler.toml
[triggers]
crons = ["17 */6 * * *", "43 9 * * *"]   # every 6 hours, plus once daily at 09:43
```

```js
// worker/index.js
scheduled(controller, env, executionContext) {
  const jobs = [
    runPatchContentAutomation(env),
    runLibraryContentAutomation(env, { daily: isDailyResearch }),
    runPlaylistKnowledgeAutomation(env, { notify: isDailyResearch })
  ];
  executionContext.waitUntil(Promise.all(jobs));
}
```

So the actual sequence is: cron fires → worker calls out to YouTube/Riot/OpenAI → result gets written to KV with a TTL (playlist: 1 hour TTL, patch notes and player-card catalog have their own TTL constants) → next real user request just reads that KV entry. A user's browser never waits on YouTube, Riot's news site, or an LLM call — it waits on a KV read at the edge.

## The pieces that keep this fresh without a human in the loop

This part matters for Lovable if they want to replicate the *pipeline*, not just the *serving pattern*:

- `worker/content-automation.mjs` (1,665 lines) — the core automation: version-poll against Riot's own patch feed, auto-apply balance-note changes to existing entries, auto-detect new agents/weapons/maps, playlist refresh, YouTube "like" metric caching, Twitch VOD lookups.
- `worker/knowledge-pipeline.mjs` (3,480 lines) — the transcript-mining pipeline that turns trusted-channel videos into structured coaching claims.
- `worker/curated-playlist-research.mjs` (3,375 lines) — houses `CURATED_PLAYLIST_RESEARCH_ARCHIVE`, the featured-playlist source list (see CSV below).
- `worker/embedded-knowledge-sources.mjs` (2,770 lines, auto-generated by `scripts/generate-knowledge-source-registry.mjs`) — houses `EMBEDDED_KNOWLEDGE_SOURCES`, the knowledge-pipeline's video source registry (see CSV below).
- `worker/knowledge-api.mjs` / `worker/knowledge-library-audit-baseline.mjs` — the owner-facing review API and an audit baseline used to sanity-check the knowledge index against `valorant-api.com`'s live entity list.

**Guardrails worth carrying over, not just the mechanics:**

- A **trusted-source allowlist** gates what's allowed to become content at all — `TRUSTED_YOUTUBE_CHANNELS` and `TRUSTED_TWITCH_CHANNELS` in `content-automation.mjs` (full list below). Nothing outside this list feeds the automated pipeline.
- A **confidence/corroboration bar**: a claim consistent across independent sources publishes as flat fact; a single-source claim publishes hedged in the copy itself ("early data suggests…") rather than being blocked outright.
- **Never estimate a missing stat.** If a source doesn't publish something at the granularity needed, the field stays `null` with an explicit "unavailable" state in the UI — never a guessed or interpolated number. This is a repo-wide rule (see `AGENTS.md`), not specific to the Library.
- **Provenance lives in the data file itself**, not just in an audit log — e.g. `gamesense-maps.js` entries carry `_researchNote`/`_researchUrl` fields pointing at the actual source used, so opening the file shows where a claim came from.
- Every automated change gets logged to an `ntfy` push-notification channel (`NTFY_TOPIC` in `wrangler.toml`) for after-the-fact review, since the pipeline runs fully unattended (no human approval gate before publish).
- **Individual player data is never scraped from Tracker.gg or similar sites** — that's a hard rule (no usable public API, ToS risk, unverifiable methodology). The one Tracker.gg reference in the codebase (`public/data/rank-benchmarks.js`) is a single manually-captured *aggregate* rank-distribution data point, explicitly flagged `provisional: true` — not automated, not per-player.

Full design rationale for this pipeline (including the reasoning for going fully unattended, the corroboration-bar logic, and the balance-note auto-apply job) is written up in `notes/unattended-content-pipeline-2026-07-21.md`.

## Other external domains the pipeline cites as sources

| Domain | What it's used for |
|---|---|
| `valorant-api.com` / `media.valorant-api.com` | Community-run wrapper of Riot's own game data — agent/weapon/map metadata, portraits, icons, callout coordinates |
| `playvalorant.com` | Official Riot patch notes and per-agent ability media pages |
| `cmsassets.rgpub.io` | Riot's own CDN — official ability video clips, hotlinked directly |
| `vstats.gg` | Third-party weapon/agent stat reference numbers |
| `tracker.gg` | One manually-captured aggregate rank-distribution benchmark (not automated, not per-player — see guardrail above) |
| `zleague.gg` | One cited tactical-content source (Bind map guide) |
| `youtube.com` | The two curated video registries below — instructional/guide content and knowledge-source transcripts |

## The curated content registries (the "current curated list of content")

Two separate lists, both YouTube-only, both living in `worker/`:

1. **`CURATED_PLAYLIST_RESEARCH_ARCHIVE`** (`worker/curated-playlist-research.mjs`) — 167 entries. This is the featured/playlist video source list shown directly in the Library UI. Full export: [`library-curated-playlist-source-urls-2026-08-31.csv`](./library-curated-playlist-source-urls-2026-08-31.csv) (title, channel, video URL, channel URL, topic).
2. **`EMBEDDED_KNOWLEDGE_SOURCES`** (`worker/embedded-knowledge-sources.mjs`) — 213 entries. This is the knowledge-pipeline's transcript-mining source registry — videos that get processed into structured coaching claims, not shown directly as a playlist. Full export: [`library-knowledge-source-urls-2026-08-31.csv`](./library-knowledge-source-urls-2026-08-31.csv) (title, channel, video URL, source kind, topic type, entities tagged, clip start time).

Together: 380 curated video URLs across 71 unique YouTube channels.

### Trusted-channel allowlist (the gate for both registries above)

From `worker/content-automation.mjs`:

**YouTube:**

| Channel | Handle/ID | Kind |
|---|---|---|
| VALORANT (Riot's own channel) | `UC8CX0LD98EDXl4UYX1MDCXg` | riot |
| Dittozkul | `UC93uuDyuin2YXOY2ZVn8nkw` | showcase |
| Dopai | `@Dopai` | creator |
| Woohoojin | `@Woohoojin` | creator |
| Maxie | `@Maxiedome` | creator |
| Konpeki | `@CoachKonpeki` | creator |
| Slayerkey | `@Slayerkey` | creator |
| Sena | `@SenaVL` | creator |
| Rem | `@RemValorant` | creator |
| Rooney | `@rooneyVAL` | creator |
| Charla7an | `@Charla7an` | creator |
| Thinking Man's Valorant | `@ThinkingMansValorant` | creator |
| zasko III | `@zaskoIII` | creator |
| zasko II | `@zasko_II` | creator |
| OD26 | `@od26coaching` | creator |

**Twitch:** Subroza, Dasnerth, Charla7an, curry, inspire, eggster, s0mcs, ShahZaM, Grimm, Hiko, sinatraa, zekken, Xeppaa, temet, LFToxy_val, TenZ, Keeoh, AunaWEEB, ethos, florescent, shanks_ttv, VALORANT_EMEA, VALORANT_Americas, VALORANT_NorthAmerica, VALORANT, VALORANT_Pacific, crunchVAL, madaa, canezerraa.

## Repo path quick-reference

```
public/index.html                              — script load order = dependency graph for Tier 1
public/library/gamesense-*.js                   — Tier 1 static content (11 files, 36.5k lines)
public/library/gamesense-library.js              — Library UI + the 3 Tier-3 fetch() calls
public/library/gamesense-official-media.js       — Riot CDN ability clip manifest
public/assets/library/                           — Tier 2 static media, self-hosted
public/assets/library/README.md                  — sourcing note for the static media
public/data/rank-benchmarks.js                   — the one tracker.gg aggregate reference

worker/index.js                                  — routes /api/content/*, defines scheduled() cron
worker/content-automation.mjs                    — core automation + trusted-source allowlists
worker/knowledge-pipeline.mjs                    — transcript-mining pipeline
worker/knowledge-api.mjs                         — owner-facing knowledge review API
worker/knowledge-library-audit-baseline.mjs       — audit baseline vs. valorant-api.com
worker/curated-playlist-research.mjs             — CURATED_PLAYLIST_RESEARCH_ARCHIVE (167 URLs)
worker/embedded-knowledge-sources.mjs            — EMBEDDED_KNOWLEDGE_SOURCES (213 URLs)

wrangler.toml                                    — Worker name "rankedcoach", cron schedule, KV binding
scripts/generate-knowledge-source-registry.mjs   — generates embedded-knowledge-sources.mjs

notes/unattended-content-pipeline-2026-07-21.md   — full design rationale for the automation
AGENTS.md                                        — repo-wide data-integrity rule (never estimate a stat)
```
