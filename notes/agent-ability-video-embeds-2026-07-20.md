# Agent Ability Video Embeds (2026-07-20)

**Status: ready to scope.** Michael's ask: when a player selects an ability on an agent's Gamesense Library profile, show a real video demonstration of that ability, embedded directly on the page — not just the current text-only summary/purpose/setup panel.

---

## 1. Where this lives, confirmed in code

- Data model: `ability(id, name, slot, agent, summary, stats, purpose, setup)` (`public/library/gamesense-reference.js:16-18`) — 24 abilities currently authored across 6 agents (Jett, Sova, Omen, Viper, Cypher, Sage — 4 abilities each).
- Render: `renderAbilityDetail(agent, ability)` (`public/library/gamesense-library.js:1035-1044`) — the panel shown when a player picks an ability from the grid in `renderAgentDetail()` (`gamesense-library.js:1085-1088`), re-rendered via `selectAbility()` (`gamesense-library.js:1813-1825`) using `replaceTargetedElement()` — this already targets exactly the "when selecting example ability" moment Michael described, no new interaction wiring needed, just more content in the panel that already refreshes on selection.
- Reusable embed helper already exists and is proven in production: `renderYouTubePlayer(videoId, title)` (`gamesense-library.js:560-570`) — builds a `youtube-nocookie.com/embed/` iframe with autoplay off, controls on, `rel=0`. This is the exact same technique already used for bundle showcase videos elsewhere in the Library. **Reuse this function directly, don't build a second video-embed pattern.**

## 2. Data model change

Add a `video` field to the `ability()` object shape:
```js
function ability(id, name, slot, agent, summary, stats, purpose, setup, video = null) {
  return { id, name, slot, icon: agentAsset(agent, id), summary, stats, purpose, setup, video };
}
```
`video` shape: `{ videoId: "<YouTube video ID>", title: "<real video title, for the iframe's accessible title>", startSeconds: <optional int> }`. Use `startSeconds` (appended as `&start=N` to the embed) for cases where the best available demonstration is a timestamped clip inside a longer guide/highlight video rather than a dedicated single-ability video — most ability demos will realistically be a moment inside a broader agent guide, not a standalone upload.

## 3. Sourcing — this is the actual work, and it isn't something to guess or fabricate

**Do not invent video IDs.** Every `videoId` must be a real, currently-live, non-private YouTube video, individually verified before it's wired in — same discipline already established and proven out for the Sketchfab 3D skin-model sourcing work (`notes/sketchfab-3d-coverage-expansion-2026-07-16.md`, `-round2-2026-07-17.md`): confirmed IDs only, license/availability re-checked live immediately before merging since pages can change, ambiguous matches explicitly resolved rather than assumed.

**Where to look, in priority order:**
1. Riot's own official VALORANT channel (already in `TRUSTED_YOUTUBE_CHANNELS`, `worker/content-automation.mjs:25` — `id: "UC8CX0LD98EDXl4UYX1MDCXg"`) — Riot has published dedicated per-ability showcase content for many agents' kits at launch; these are the highest-confidence source since they're the actual developer's own demonstration.
2. The same trusted creator channels already used for the Playlist feature (`worker/content-automation.mjs:24-36` — Dopai, Woohoojin, Maxie, Konpeki, Slayerkey, Sena, Rem, Rooney, Charla7an) — many have dedicated per-ability breakdown videos or agent guides with clearly timestamped sections per ability.
3. If neither has a clean match for a specific ability, leave `video: null` for that ability rather than force-fit a loosely-related video — same "don't force a low-confidence guess" principle already documented in `notes/patch-content-automation-2026-07-16.md`.

**Embedding, not downloading — this is a licensing-safe approach by construction.** A standard YouTube iframe embed always respects the original creator's ownership, monetization, and view attribution — this is fundamentally different from the earlier Sketchfab work (which required checking CC BY licensing because it embeds a 3D model file directly). No separate license check is needed for embedding a public YouTube video via iframe; the verification need here is narrower — just confirm the video is real, currently public (not private/deleted/region-locked), and actually shows the ability being described, not a loose keyword match.

## 4. UI change

In `renderAbilityDetail()` (`gamesense-library.js:1035-1044`), add the video block conditionally:
```js
function renderAbilityDetail(agent, ability) {
  if (!ability) return "";
  return `
    <article class="gamesense-fact-panel gamesense-ability-panel">
      <div class="gamesense-fact-panel-head">...</div>
      <p>${escapeHtml(ability.summary)}</p>
      ${renderStatChips(ability.stats)}
      ${ability.video ? `<div class="gamesense-ability-video">${renderYouTubePlayer(ability.video.videoId + (ability.video.startSeconds ? `?start=${ability.video.startSeconds}` : ""), ability.video.title)}</div>` : ""}
      <div class="gamesense-fact-read">...</div>
    </article>`;
}
```
(Adjust the `start` param wiring to however `renderYouTubePlayer`'s existing `URLSearchParams` construction handles extra params cleanly — don't just string-concat onto the videoId, pass `startSeconds` through properly so the existing `autoplay`/`controls`/`rel` params aren't clobbered.)

**Placement:** put the video above or below the "Round purpose"/"Setup and difficulty" text sections — Codex's call on which reads better, but keep the existing text content, don't replace it with video-only (matches the established Layout Style hard rule: new presentation adds to existing content, never removes it).

**No video available:** the panel renders exactly as it does today, text-only, no broken embed, no placeholder box. Confirm this explicitly — most abilities may not have a verified video at first pass, this must not look broken for those.

## 5. Scope for this pass

24 abilities across the 6 currently-authored agents (Jett, Sova, Omen, Viper, Cypher, Sage). Don't block shipping the feature on 100% coverage — ship with however many get a confidently-verified match, `video: null` for the rest, and this can be revisited as more agents get authored and as better source videos are found over time.

## Testing checklist

1. Every wired-in `videoId` manually re-verified live (real, public, not private/deleted/region-locked) immediately before merging.
2. Spot-check at least 5 of the newly wired abilities in the actual rendered panel — confirm the embed shows the right agent using the right ability, not a loosely-matched or wrong-agent video.
3. Confirm abilities with no video still render cleanly, text-only, no empty video container.
4. Confirm the embed doesn't autoplay (matches `renderYouTubePlayer`'s existing `autoplay: "0"` default) and doesn't fight the panel's layout on mobile.
5. Confirm switching between abilities (via `selectAbility()`'s targeted re-render) correctly swaps the video too, not just the text — no stale iframe left over from the previously selected ability.
6. `node --check` on every touched file; run the existing visual-audit suite before deploying.
7. Bump the cache key in `public/index.html`.
