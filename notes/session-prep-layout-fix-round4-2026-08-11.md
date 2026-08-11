# Session Prep Layout — Round 4: Debug Live This Time, Plus Map Picker/Pill Polish (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.**

**Status: ready to build. Read "Before touching CSS again" first — the approach changes again this round.**

## Before touching CSS again: this needs live inspection, not another blind edit

I verified round 3's committed CSS (`339a606`) directly — it correctly deleted all four old competing `.loadout-card` blocks I'd found, and the new consolidated rule correctly sets `#page-home .loadout-card #agentFrame { aspect-ratio:auto !important; width:100% !important; max-width:none !important; height:100% !important; }`, which on specificity should beat the base `.agent-frame` class's `aspect-ratio:1/1` and `width:min(100%, var(--agent-frame-target-size,232px))` (`app.css:12975-13001`). **On paper this should have worked.** It didn't — the portrait still renders small and floating with empty space around it (per the latest screenshot).

That means the remaining cause is not something guessable from reading CSS text alone — three rounds of that have each found one real bug, but there's evidently still something not visible in a static read. Two likely candidates, and this needs to be resolved by actually inspecting the live page, not by writing a fourth speculative CSS patch:

1. **Check for inline styles set by JavaScript.** `syncAgentReelGeometry()` (`app.js:57718` and other call sites at `14663, 25473, 26907, 48368, 48597, 57813, 57850`) computes reel geometry from the frame's rendered size — confirm it (or anything else) isn't also *writing* an inline `width`/`height`/`aspect-ratio` directly onto `#agentFrame` or `#agentReel` via `element.style.*`, which would silently override even a correctly-specific stylesheet rule.
2. **Check the actual resolved grid track size.** Open DevTools on the live page, inspect `#agentFrame`'s computed box model, and inspect the "reel" grid track's actual resolved height inside `#page-home .loadout-card .home-loadout-main`. Confirm whether the row genuinely has a tall resolved height (in which case the frame's `height:100%` should be tall too, and something else is shrinking the child art) or whether the row itself is resolving shorter than expected (in which case the fix is in the grid row sizing, not in `#agentFrame` at all).

**Report which of these it actually is before changing more CSS.** Per Michael: the frame's height and width are both free to change from their current/historical values — there's no fixed size to preserve — so the fix doesn't need to protect any particular proportion, just make the frame genuinely fill its cell the way the approved mockup (`https://claude.ai/code/artifact/fd5bfb66-94f3-4992-8c37-5e088cc4ebfe`) shows.

**Same mandatory safety rule as every prior round:** since the frame's rendered size is genuinely changing, confirm with a real, observed roll that `syncAgentReelGeometry()` still lands the reel correctly afterward — desktop, mobile, at least two themes.

## Tone down the glow around the agent frame

Confirmed the base `.agent-frame` rule itself has `box-shadow: none` (`app.css:12992`) — the glow isn't coming from there. Likely sources to check live: the `.breach-frame`/`.breach-energy`/`.frame-segment` decorative overlay elements (`index.html`, inside `#agentFrame`), or a `--agent-role-color`-based effect tied to the role border tint (`app.css:13144-13147`, e.g. `.agent-frame.sentinel{ border-color:#22c55e }`, matching the green seen in the screenshot). Identify the actual live source and reduce its intensity — don't remove the role-color border entirely, just the excess glow/blur around it.

## Map picker: remove the "Any map" tile, keep a way to clear the selection

`renderLoadoutMapPicker()` (`app.js:23826-23841`) renders an "Any map / Uniform roll" tile first in the grid (`app.js:23833`, class `.loadout-map-choice-clear`). Remove this tile from the grid.

**Do not silently remove the ability to clear a map selection** — the original spec required it stay easy to clear/change. Replace it with something less visually prominent than a full grid tile: e.g., clicking the currently-active/selected map tile again deselects it (toggle behavior), or add a small clear affordance on the Map pill itself (an "×" that appears only once a map is selected). Pick whichever fits the existing interaction pattern most naturally, but confirm a real, working way to clear the selection still exists after the tile is gone.

## Map pill: show the selected map's image as its background

Once a map is selected, the Map pill on the Session Prep card (`#loadoutMapPicker`, text rendered via `renderLoadoutMapControl()`, `app.js:23813-23824`) should show that map's preview image as its background, not just plain text on the existing dark pill background. Reuse the exact image source and overlay technique already used for the modal's map tiles (`getMapIconUrl(map)` for the image, and the same darkening gradient overlay pattern used on `.loadout-map-choice > span` so the "Map" label and map name text stay readable on top of the photo) — don't invent a new image source or a new overlay approach, match what the modal tiles already do for visual consistency.

## How this will be reviewed

1. **Report which of the two live-debugging candidates (inline JS style vs. grid track sizing) was the actual cause**, with the real computed values found, before/after.
2. A real screenshot of the frame now filling its cell width and height appropriately, compared against the approved mockup.
3. Confirm the glow is visibly reduced but the role-color border tint is still present.
4. Confirm the "Any map" tile is gone from the grid, and confirm a real, working way to clear a map selection still exists — demonstrate it.
5. Confirm the Map pill shows the selected map's photo as background once a map is chosen, with readable text on top.
6. Confirm a real roll still lands the reel correctly after the frame's size change — desktop, mobile, two themes.
7. Confirm `.loadout-card`'s outer box dimensions are still unchanged (this constraint has not changed — only the frame's own internal size is free to move).

## Testing checklist

1. Visual match against the approved mockup, desktop and mobile.
2. Real roll reproduction confirming correct reel landing at the frame's new size.
3. Map picker: select a map, confirm pill background updates; clear the map via whatever mechanism replaces the removed tile, confirm it actually returns to unweighted/uniform rolling.
4. `.loadout-card` dimension check via DevTools, before and after.
