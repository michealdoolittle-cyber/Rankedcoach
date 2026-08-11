# Session Prep Layout — Round 5: Revert the Crop Regression, Fix the Real Glow (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.**

**Status: ready to build.**

## What round 4 got right — keep these, no changes needed

Verified in `aa831c8`:
- Map pill background image via `--loadout-map-image` + `::before` overlay (`app.css:61254-61290`, `app.js:23818-23828`) — works, matches the modal's overlay technique.
- "Any map" tile removed from the picker grid; clicking the active map again clears it, with a "Click again to clear" hint (`app.js:23826-23847`, `app.js:47674-47681`) — works, preserves the required clear affordance.

## What round 4 broke — this is why the portrait is now an extreme, cropped close-up

Confirmed the exact cause: `app.css:56979-56990` (a new rule Codex added this round, `#page-home .loadout-card #agentFrame .agent-reveal-art img, #page-home .loadout-card #agentFrame .agent-frame-portrait`) changed `object-fit: contain` to `object-fit: cover`. The matching theme-builder string in `app.js:44683` was updated the same way. The intent (per the code comment) was to eliminate letterboxing/empty space around the art — but `cover` crops an image to fill a box, and since round 3 also set `#agentFrame`'s `aspect-ratio: auto` (making the frame a wide rectangle matching its grid cell, not square), a portrait-shaped character asset gets cropped down to almost nothing but a face to fill that wide shape. That's the extreme zoomed-in Phoenix screenshot.

**The actual fix is to stop making the frame a wide non-square rectangle in the first place — this round's approach was solving the wrong problem.** The empty side-margins in earlier rounds weren't a bug to eliminate by distorting the frame's shape; the approved mockup shows a large, centered, roughly-square portrait with the grid cell's leftover width simply unused on the sides — that's normal, expected, and fine. Revert both changes:

1. **`app.css:56979-56990`** — change `object-fit: cover !important;` back to `object-fit: contain !important;`.
2. **`app.js:44683`** — change the theme-builder string's `object-fit:cover !important;` back to `object-fit:contain !important;` for `.agent-reveal-art img, .agent-frame-portrait, .frame-art-inner` (the `.reel-icon` line the round-4 diff split out separately, `app.js:44684`, was already `contain` and can stay as-is).
3. **`#page-home .loadout-card #agentFrame`'s `aspect-ratio`** (currently `auto`, set in round 3 at `app.css:~35695` and mirrored in the theme-builder string at `app.js:44682`) — change back to `aspect-ratio: 1 / 1`. Keep `height: 100%` so the frame is sized by the available row height (which should now be genuinely tall, since round 4 apparently fixed whatever was constraining it) — with `aspect-ratio:1/1`, width will follow height automatically, and `justify-self: center` (not `stretch`) so it centers in its column rather than trying to fill the column's full width. This produces a large, square, centered portrait — bigger than the old 232px default, matching Michael's "size can change" permission — without cropping the art or leaving it visually broken.

## The glow: round 4 fixed the wrong state

Round 4's glow change (`app.css:14965-14971`) only reduced the **idle placeholder silhouette's** drop-shadow (the mystery-state icon shown before an agent is revealed) — it never touched whatever's producing the glow visible around a **revealed** agent's frame border, which is what's actually shown in the screenshot (a revealed Phoenix, red glow around the border). I could not confidently identify the exact source through static file search this time — there are at least three separate `.agent-frame` base rules (`app.css:12975`, `26539`, plus per-role border-color rules at `13144-13147`) and none show an obvious box-shadow on the revealed state.

**Don't guess again — find this live.** Open the app with a revealed agent showing (any agent, not the idle placeholder), inspect `#agentFrame` and its children in DevTools, and identify which specific element/property is producing the visible glow/bloom around the border. Reduce its intensity — don't remove the role-color border tint entirely, just the excess glow around it. Confirm visually, before and after, with the same agent revealed both times so the comparison is real.

## Mandatory safety rule (same as every round)

Since the frame's rendered size is changing again this round, confirm with a real, observed roll that `syncAgentReelGeometry()` (`app.js:57718` and other call sites) still lands the reel correctly afterward — desktop, mobile, at least two themes.

## How this will be reviewed

1. **A real screenshot showing the full character portrait rendering correctly** — not cropped to a face, matching the visual style from earlier rounds (before the crop regression), just larger.
2. Confirm the map pill background image and the any-map-tile removal/clear-toggle still work after these CSS changes (they shouldn't be affected, but confirm).
3. Confirm the glow around a **revealed** agent's frame is visibly reduced, with a screenshot of the same agent before and after.
4. Confirm a real roll still lands the reel correctly at the frame's current size.
5. Confirm `.loadout-card`'s outer box dimensions are still unchanged.

## Testing checklist

1. Visual comparison against the approved mockup and against a pre-round-4 screenshot (to confirm the crop regression is specifically gone, not just "different").
2. Real roll reproduction, desktop and mobile, two themes.
3. Map picker: confirm background image and clear-via-reselect both still work.
4. `.loadout-card` dimension check via DevTools, before and after.
