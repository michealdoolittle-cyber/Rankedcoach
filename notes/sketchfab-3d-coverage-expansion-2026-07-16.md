# Expand Curated Sketchfab 3D Coverage (2026-07-16)

**Status:** Ready to build. Follow-up to Michael's observation about the skin preview 3D viewer: `renderSkinPreviewOverlay()` (`public/library/gamesense-library.js:916-923`) always renders the "Drag to rotate. Scroll or pinch to zoom." 3D-viewer-styled stage, but when no entry exists in `approvedSketchfabModels` (`public/library/gamesense-collections.js:82-105`) for that exact weapon+skin+color, it falls back to the flat splash image inside that same stage, labeled "Static render — 3D unavailable." The frame invites rotation; a flat image can't deliver it. Every new model below converts one of those flat-fallback cases into a real rotatable model — that's the actual value of this batch, not just "more coverage."

**Also confirmed, don't relitigate:** full extraction-from-game-files (UModel/FModel against the live `.pak`s) was explored and explicitly ruled out — Riot's fan content policy states not to use item/weapon appearance "in a game or app," and RankedCoach's premium tiers make it a commercial Project without the narrow exceptions the policy allows. That path is closed; this note is the alternative that stays inside the existing CC-BY-curation pattern already in the codebase.

---

## 1. New entries to add to `approvedSketchfabModels`

Same object shape as the existing 14 entries (`gamesense-collections.js:82-96`) — key format `"collection|weapon|variantIndex"`, value array `[sketchfabId, title, creator, urlSlug]`. Confirmed CC BY 4.0 on the ones marked verified; the rest need a quick license re-check on the live page before wiring in (same discipline the existing 14 already followed) since license pages can change.

**Verified CC BY 4.0:**
- `araxys|<weapon>|0` — id `3d5ae8039a2f42f6a6cafe5f4f67ac1b`, "ARAXYS BUNDLE VALORANT", creator KiLLSHOT (same creator as existing Reaver/RGX entries). Confirm which specific weapon(s) the bundle model actually depicts before assigning a weapon key — the search result didn't enumerate contents.
- `prime|vandal|1` (Orange) — id `91e1a01291d741849acd35514cca21b0`, "Prime Vandal (Orange)", creator ILilMitch.
- `prime|vandal|2` (Yellow) — id `bcca9bc0df714df185f019282c1b3cd0`, "Prime Vandal (Yellow)", creator ILilMitch.
- `rogue|vandal|0` — id `44b2d633ea1b44378b200d044788e223`, "ROGUE Vandal - Valorant Skin", creator neumann (same creator as existing `kuronami|operator|0`). **This upgrades an existing video-only collection (`rogue` is already in `approvedCollectionVideos`) to also have 3D.**
- `radiant-entertainment-system|phantom|0` — id `bb334fb114fa4db084c6666e2e09d071`, "Radiant Entertainment System Valorant Phantom", creator gkari. **Upgrades an existing video-only collection.**
- `arcane|sheriff|0` — id `9d817055d22543b8a4a5992f68a35b33`, "Arcane Sheriff", creator ILilMitch. **Upgrades an existing video-only collection (`arcane` is already in `approvedCollectionVideos`).**

**Found, license needs a live re-check before adding (same creators/patterns as trusted entries, but not personally verified this pass):**
- `kuronami|bucky|0` — id `07a2108e29534737a25f99c262db45db`, "Bucky Oni - Valorant" — note the title says Oni but the search context suggests this may actually be Kuronami-line; verify which collection this belongs to before assigning the key. Creator kairos, same as existing `kuronami|marshal|0`.
- `protocol-781-a|sheriff|0` — id `6881f8e804b6454f9a7a4843d5e391fe`, "Protocol 781-A Sheriff", creator MiguelFua (same creator as existing `recon|phantom|0`). **Would upgrade an existing video-only collection.**
- `glitchpop|frenzy|0` — id `97ed3f185548407db5e4caf18084b2a4`, "Glitch Pop Frenzy", creator MemoX. **Would upgrade an existing video-only collection.**
- `standard|phantom|0` (or whatever key fits the base-tier skin naming convention) — id `4c75d2afe8964b739434447801c9b4c2`, "Standard Phantom", creator esmurz, CC Attribution per the page.

**Needs Codex to visit directly and pull individual model IDs** (I only have the collection overview, not each model's own page URL — don't fabricate IDs):
- `https://sketchfab.com/ILilMitch/collections/valorant-vandal-models-08dea74e797d4d7c8c55f0a1b167af6a` — 25 models total from a creator you already trust. Confirmed present in the collection: Neptune Vandal (Black, White, White-Unupgraded), SOL Vandal (Purple, Pink, White, Default), Forsaken Vandal (White, Green), RGX Vandal (Yellow, Red, Green, Blue — you currently have only 1 RGX color, this adds 3 new), Gaia Vandal (Red, Orange), Prelude Vandal (Blue, Purple, Silver), Oni Vandal. Reaver Vandal and Prime Vandal in this collection are already covered — skip re-adding those, just confirm no ID mismatch with what's already in `approvedSketchfabModels`.

---

## 2. Confirmed empty — don't spend more search time here

Systematic search across every weapon found **zero** usable community 3D coverage for: **Judge, Guardian, Bulldog, Outlaw, Shorty, Stinger, Classic** (one weak Classic hit, not worth pursuing). These weapons just don't get community modeler attention the way Vandal/Phantom/Operator/Sheriff do — this is a real, consistent gap across every search angle tried, not a search-quality problem. These will keep falling back to the static-image stage until an official Riot API path exists; don't keep re-searching Sketchfab for them.

---

## 3. New: frame-sampled pseudo-3D for skins with a val-skins video but no true 3D model

Michael's ask: for skins with neither a Sketchfab model nor real 3D, can we still deliver something better than one flat static image in the "Drag to rotate" stage? Sourcing genuine multi-angle photography per skin isn't realistic at scale — that asset just doesn't exist standalone for most skins. But the app already has a better source sitting unused for this specific purpose: the **"Skin Animation" pane** (same overlay, `gamesense-library.js:928-930`, `previewVideos`/`data-skin-preview-video`, sourced from val-skins/Riot data) already plays a rotating preview clip for most released skins.

**The idea:** when `renderSkinPreviewOverlay()` has no `model` (no Sketchfab entry) but does have a `previewVideos[0]` available, sample 3-4 frames out of that existing video at different points in its rotation (e.g., roughly 0°/90°/180°/270° through the clip — check the actual clip length/rotation speed first rather than assuming even spacing) instead of falling back to a single flat splash image. Use those sampled frames to drive the same drag-interaction pattern the true-3D stage already has (swap frame based on horizontal drag position), so the "3D space" stage delivers a real (if coarse) multi-angle experience instead of one static image, for any skin where a val-skins video exists.

**How to sample frames, technically:** this can be done server-side/at-build-time (not live in the browser) using `ffmpeg` against the same video URL already referenced in `previewVideos[].video` — extract frames at computed timestamps, save as static images, reference them from a new field (e.g., `variant.rotationFrames: [url0, url90, url180, url270]`) alongside the existing `variant.source`. Don't do this as a live client-side video-scrubbing interaction — sampled static frames are simpler, cacheable, and match the existing static-image code path already in place for the no-model case.

**Scope this after section 1-2 land** — it's a bigger, more experimental build than adding curated model entries, and depends on confirming val-skins clip quality/rotation-speed is actually consistent enough across skins to make evenly-spaced frame sampling look coherent (check a handful of clips first before building the full pipeline).

---

## Testing checklist — don't report this batch done until:

1. Every new entry's license re-verified live on its Sketchfab page immediately before merging (pages can change) — confirm CC BY 4.0 or equivalent permissive reuse, not "Free Standard" (Sketchfab's default, more restrictive) or a paid store listing.
2. For the ILilMitch collection pull, confirm each model's actual weapon+color against its page — don't assume from the collection-overview title alone.
3. Spot-check at least 3 of the newly-added combos live in the app: confirm the skin preview overlay now shows `has-true-model`/"True 3D Model" (real Sketchfab iframe, rotatable) instead of the static-image fallback for those specific weapon+skin+color combos.
4. Confirm the two upgraded video-only collections (`rogue`, `radiant-entertainment-system`, `arcane`, and any others added) still show their existing video correctly alongside the new 3D option in the media pager.
5. If section 3 is built this pass: confirm frame-sampled skins show a visibly different image while dragging (not the same frame repeated), and that skins with a true Sketchfab model or no val-skins video at all are unaffected by this new code path.
6. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
7. Bump the cache key in `public/index.html` for every changed asset.
