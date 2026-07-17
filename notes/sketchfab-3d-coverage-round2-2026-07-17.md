# Sketchfab 3D Coverage — Round 2, Ambiguity Resolved (2026-07-17)

**Status:** Implemented 2026-07-17 with 16 newly verified model mappings. The live license and official Riot chroma-order pass found that Oni and RGX Red currently have no published Sketchfab license, while the proposed RGX Green entry duplicates the already-covered default color. Those three remain excluded; all retained entries use the official color indexes rather than the provisional order below.

---

## 1. Rogue Vandal — ambiguity resolved, add it

`rogue|vandal|0` — id `44b2d633ea1b44378b200d044788e223`, "ROGUE Vandal - Valorant Skin", creator neumann (same creator already trusted via `kuronami|operator|0`). Confirmed live: **CC BY 4.0**, and the page's own tags explicitly include `#vandal` — this is definitely a Vandal, not a different weapon. `rogue` is already an existing video-only collection (`approvedCollectionVideos`) — this upgrades it to real 3D.

## 2. Araxys Bundle — resolved, but the answer is "don't add it"

Checked the model page directly: its tags include `valorantknife`, and the description never names a specific gun. This is very likely the **Araxys knife/melee model**, not one of the 16 weapons tracked in `weaponUuids` (`gamesense-collections.js:6-23`, which has no knife entry at all). Don't force this into a weapon key — it doesn't fit the current schema. If knives ever become an in-scope content type, revisit then; not this batch.

## 3. Full ILilMitch Vandal collection — exact IDs, no more guessing

Pulled directly from `https://sketchfab.com/ILilMitch/collections/valorant-vandal-models-08dea74e797d4d7c8c55f0a1b167af6a`. Spot-verified 2 of these live (RGX Vandal Yellow, Neptune Vandal Black) — both CC BY 4.0, consistent with every other ILilMitch model checked across this whole effort (7 for 7 now). Recommend Codex still do a fast final license glance per page immediately before merging (pages can change), but there's no remaining reason to skip these for "needs verification."

**New collections (not currently in the app in any form — check these collection-name keys don't collide with anything in `approvedCollectionVideos`/`dittozkulFallbackVideos` before adding):**
- `neptune|vandal|0` (Black) — `b61e3f7bf9c749878beba1d6e01d6a84`
- `neptune|vandal|1` (White) — `bd272b95723942dbaf1004d2626ec128`
  - (Skip the collection's third "White (Unupgraded)" listing — same skin, pre-upgrade visual state, not a distinct color variant worth its own key.)
- `oni|vandal|0` — `1a558dacecb74b7e936c9931a236c430` (confirm this doesn't collide with any existing `oni` key for a different weapon)
- `sol|vandal|0` (Purple) — `8b4c8ae3fa374b8fb638457184263ef4`
- `sol|vandal|1` (Pink) — `4cc8e7c1ff4e45a09dcbf7956225352c`
- `sol|vandal|2` (White) — `198d96cfc1ea48d7a84b038b14c37576`
- `sol|vandal|3` (Default) — `7cfb779913a9489f95f7b884dcf0ff05`
- `forsaken|vandal|0` (White) — `99f07632e3b243f3bfef2e67b08653e7` (the model title on Sketchfab misspells this "Foresaken" — use the correct official skin name "Forsaken" in the app regardless of the source title)
- `forsaken|vandal|1` (Green) — `d905175d72604c1fad68d90ca44f6324`
- `gaia|vandal|0` (Red) — `dfeddd540e7641bfb0b7128155117a1d`
- `gaia|vandal|1` (Orange) — `46e6e410115441c182efab311d557532`
- `prelude|vandal|0` (Blue) — `49fcf7c9b36e4ac2b877fc4f32048071`
- `prelude|vandal|1` (Purple) — `0dec73e342a54b1bacc9a242fe64d325`
- `prelude|vandal|2` (Silver) — `bd0f274b21034e039f788bbe6c461757`

**Existing collection, new color variants** (you currently have exactly 1 RGX Vandal color at `rgx-11z-pro|vandal|0` — add these 3 alongside it, don't overwrite index 0):
- `rgx-11z-pro|vandal|1` (Yellow) — `53259a078e6e4521b1e116e6723f0011`
- `rgx-11z-pro|vandal|2` (Red) — `3e53ea8a88bd4368b8df6d31fa967e9a`
- `rgx-11z-pro|vandal|3` (Green) — `a1dc3a3de34b487b9db4ee4c74407194`
- `rgx-11z-pro|vandal|4` (Blue) — `65d8384673f241938de5c39dff07d200`

For every entry above, `modelUrl`/`embedUrl` construction follows the exact same pattern as the existing 19 entries (`gamesense-collections.js:102-108`) — no new logic needed, just new data.

That's **19 additional entries** ready to merge (18 new collections/colors + Rogue), on top of the 5 already shipped and the 14 original — bringing total curated 3D coverage to 38 weapon+skin+color combos once this lands.

---

## Testing checklist — don't report this batch done until:

1. Final live license glance on each of the 19 URLs immediately before merging (same discipline as round 1 — pages can change between when I checked and when this ships).
2. Confirm none of the new collection-name keys (`neptune`, `oni`, `sol`, `forsaken`, `gaia`, `prelude`, `rogue`) collide with an existing key already used for a different weapon in `approvedCollectionVideos`/`dittozkulFallbackVideos`/`approvedSketchfabModels`.
3. Spot-check at least 4 of the 19 live in the app: confirm the skin preview overlay shows `has-true-model`/"True 3D Model" instead of the static-image fallback for those specific combos.
4. Confirm `rgx-11z-pro|vandal|0` (the existing entry) is untouched and the 4 new color indexes don't renumber or shift it.
5. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
6. Bump the cache key in `public/index.html` for every changed asset.
