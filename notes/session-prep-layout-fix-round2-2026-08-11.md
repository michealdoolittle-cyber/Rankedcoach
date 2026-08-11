# Session Prep Layout — Round 2 Fix (Round 1 Broke Role Buttons and the Spin Button) (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.**

**Status: ready to build. This corrects `effa73e` — read the whole thing before touching CSS, it explains exactly why the first attempt broke and gives exact values this time instead of open-ended structure.**

## What actually happened (confirmed by reading the committed CSS, not guessing from a screenshot)

Screenshot of the current live result: role buttons render as "ALL" full-width on top, then the other 4 role icons wrapped into a 2×2 grid underneath; the spin button renders as a tall, disconnected vertical strip on the far right, unrelated to anything else in the card.

**Root cause #1 — stale per-button grid placement rules never got cleared.** The pre-existing base `.role-filter-row` (`app.css:12112-12122`, unrelated to this feature, already existed) is a 2-column/3-row grid, and its buttons are explicitly pinned by position:
```css
.role-filter-row button:nth-child(1){ grid-row:1; }              /* app.css:16863 */
.role-filter-row button:nth-child(2), :nth-child(3){ grid-row:2; } /* app.css:16867 */
.role-filter-row button:nth-child(4), :nth-child(5){ grid-row:3; } /* app.css:16872 */
.role-filter-row button[data-role="any"]{ grid-column:1 / span 2; } /* app.css:16906 */
```
The new rule added in `effa73e` changed `.role-filter-row`'s own `grid-template-columns`/`grid-template-rows` to `repeat(5, minmax(0,1fr))` / one row — but never overrode these per-button placement rules. The buttons still claim rows 1/2/3 individually, so CSS Grid auto-generates implicit rows to satisfy them, regardless of what the container's template says. That's the exact shape in the screenshot.

**Root cause #2 — the spin button was given `grid-row: 1 / 3`,** deliberately spanning both the roles row and the frame row in a narrow (46-92px) column. This was a real design choice in the new CSS, not a collision — and it's wrong. It turns the spin control into a tall vertical sidebar instead of a normal-sized control that sits beside the frame.

**Contributing risk — don't repeat this pattern.** There are several older `.loadout-card`-scoped CSS blocks already in the file, none behind a media query: `app.css:27874-27973`, `28959-29018`, `29313-29324`, `30382-30484`. `effa73e` added a sixth override block at the very end of the file (`app.css:~61573+`) instead of editing these in place. It technically wins on specificity today, but stacking another override on an already-overridden element is fragile and made this bug harder to see coming. **This time, edit the existing rules at their current locations instead of appending a new block elsewhere in the file.** Consolidate — don't add a seventh layer.

## Exact target layout

Three rows, full width each at the top and bottom, frame+spin sharing the middle row:
```
"roles roles"
"reel  spin"
"info  info"
```
- **Row 1 (`roles`):** role-filter-row, full width, one row, 5 equal columns (ALL + 4 role icons side by side). This is what "full width of the agent frame" means — its own dedicated full-width row, not squeezed beside anything.
- **Row 2:** agent frame (`reel`) takes the large majority of the width; spin button (`spin`) sits beside it as a normal, modestly-sized control — **not stretched to span row 1, not the height of two rows.** Roughly its original proportions (previously ~120px square) scaled to fit this row's height.
- **Row 3 (`info`):** the three pills (Map, Agent, Focus Category), full width, left to right in that order.

## Exact CSS to apply

Edit `#page-home .loadout-card .home-loadout-main` (the block added in `effa73e`, currently near `app.css:61573+`) — or better, fold this directly into the pre-existing unguarded block at `app.css:27874` and delete the duplicate block from `effa73e` rather than keeping both:

```css
#page-home .loadout-card .home-loadout-main{
  grid-template-columns: minmax(0, 1fr) clamp(72px, calc(96px * var(--app-1080-scale)), 120px);
  grid-template-rows: auto minmax(0, 1fr) auto;
  grid-template-areas:
    "roles roles"
    "reel  spin"
    "info  info";
}

#page-home .loadout-card .role-filter-row{
  grid-area: roles;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1fr);
  width: 100%;
}

/* Clear the stale per-button row/column pins from the old 2-column layout —
   this is the actual fix for root cause #1. Without this, the buttons keep
   claiming rows 1/2/3 individually no matter what the container says. */
#page-home .loadout-card .role-filter-row button{
  grid-row: 1 !important;
  grid-column: auto !important;
}

#page-home .loadout-card #spinAgentBtn{
  grid-area: spin;
  width: 100%;
  height: 100%;
  align-self: stretch;
  /* Do not span multiple grid rows. It lives in the "spin" cell only,
     matched to the frame row's height — not the roles row's height too. */
}

#page-home .loadout-card #agentFrame,
#page-home .loadout-card #agentFrame.agent-frame{
  grid-area: reel;
  width: 100%;
  height: 100%;
}
```

Adjust exact `clamp()` values as needed to look right, but the **grid-template-areas structure and the button `grid-row`/`grid-column` reset are not optional** — those are the two specific things that broke last time.

## Mandatory safety rules (same as last time, repeated because they still apply)

1. **`.loadout-card`'s outer box (width/height) must never change.** Verify pixel-identical before/after, desktop and mobile.
2. **The spin/reel animation is fragile.** `syncAgentReelGeometry()` (`app.js:57718` and other call sites at `14663, 25473, 26907, 48368, 48597, 57813, 57850`) computes the reel's landing geometry from the frame's actual rendered pixel size. Any change to `#agentFrame`'s box size requires a real, observed roll to confirm the reel still lands correctly — on desktop, mobile, and at least two themes.

## How this will be reviewed

1. **Screenshot the actual rendered result this time before calling it done** — compare directly against the screenshot in this conversation and against the approved mockup (`https://claude.ai/code/artifact/fd5bfb66-94f3-4992-8c37-5e088cc4ebfe`, Map pill leftmost).
2. Confirm all 5 role buttons render in one horizontal row, full width of the frame below them — not wrapped.
3. Confirm the spin button is a normal, modestly-sized control next to the frame — not a tall vertical strip.
4. Confirm `.loadout-card`'s outer dimensions are unchanged (measure in DevTools, don't eyeball it).
5. Confirm a real roll still lands the reel correctly.
6. Confirm the duplicate override block from `effa73e` was consolidated into the existing rules at `app.css:27874`, not left as a seventh competing block.

## Testing checklist

1. Visual match against both the screenshot-of-the-bug (to confirm it's gone) and the approved mockup (to confirm it now matches intent).
2. Real roll reproduction, desktop and mobile, at least two themes.
3. `.loadout-card` dimension check via DevTools computed size, before and after.
4. Confirm no leftover competing `.loadout-card`-scoped block still contains conflicting `grid-template-areas`/`grid-row`/`grid-column` values for these elements — grep for `.loadout-card` in `app.css` and account for every remaining block.
