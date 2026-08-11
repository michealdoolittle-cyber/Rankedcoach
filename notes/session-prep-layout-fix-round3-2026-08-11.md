# Session Prep Layout — Round 3: Stop Competing With the Old Rules, Delete Them (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.**

**Status: ready to build. Read this fully — the approach changes this round: delete the competing old declarations instead of adding a fourth layer of `!important` on top of them.**

## Why round 2 still didn't match the approved layout

Round 2 (`c10dadb`) correctly fixed both bugs from round 1 — role buttons now sit in one row, the spin button no longer spans two grid rows — and correctly consolidated the newest rule into an existing `#page-home .loadout-card .home-loadout-main` block (around `app.css:35695`) instead of stacking a duplicate, which is exactly the right instinct. But it still didn't touch two things declared in **older, separate, un-media-queried `.loadout-card` blocks** that are still live and unopposed on specific properties:

- **`aspect-ratio: 1 / 1 !important` on `#agentFrame`** — set in two places, `app.css:27933` and `app.css:30449`. Neither the round-1 nor round-2 rule ever declares `aspect-ratio` at all, so nothing competes with these — they just apply, forcing the frame back into a small square instead of filling its wide cell. This is why there's empty dark space on both sides of the portrait in your screenshot.
- **The spin button stretches to fill its entire row height** because the current rule sets `height:100%; align-self:stretch`, and the row it's in is tall (it gets the card's leftover flexible height). Nothing caps it to a reasonable, roughly-square size.

**Two rounds in a row, the fix has been "add a more specific rule to out-compete the old ones," and each time something the new rule doesn't happen to touch slips through from one of three old, overlapping blocks still sitting in the file** (`app.css:27874-27973`, `28959-29018`, `30382-30484`). Property-by-property specificity whack-a-mole against three old layers is what's costing rounds. **Change the approach this round: delete the competing declarations from those three old blocks entirely, so there is exactly one place in the file controlling `.loadout-card`'s `#agentFrame`, `#spinAgentBtn`, `.role-filter-row`, `.role-filter-row button`, `.home-loadout-main`, `.home-loadout-info`, `.home-loadout-pill`, `#agentName`, and `#focusDisplay`.**

## What to delete

Confirmed still-live, still-competing blocks (all exclusively scoped to `.loadout-card`, safe to remove in full — verify each block's boundaries before deleting, since surrounding unrelated CSS must stay untouched):

1. **`app.css:27874-27973`** — `.loadout-card .home-loadout-main`, `.role-filter-row`, `.role-filter-row button`, `#spinAgentBtn`, `#agentFrame`, `.home-loadout-pill`, `#agentName`/`#focusDisplay`. (Unrelated content resumes at `27977` with `body.has-active-modal .compass-panel...` — stop before that.)
2. **`app.css:28959-29018`** (plus whatever immediately follows for `#agentName`/`#focusDisplay` in that same block — check the boundary) — same set of selectors, a second competing copy.
3. **`app.css:30382-30484ish`** — same set of selectors again, a third competing copy, this one also containing the second `aspect-ratio:1/1` declaration (`30449`).

Search the whole file for every remaining declaration touching `.loadout-card #agentFrame`, `.loadout-card #spinAgentBtn`, `.loadout-card .role-filter-row`, `.loadout-card .home-loadout-main`, `.loadout-card .home-loadout-info`, `.loadout-card .home-loadout-pill` (bare `.loadout-card` prefix, not just the `#page-home`-prefixed ones) and confirm nothing is left outside the one consolidated rule at `app.css:~35695`. If you find a fourth block beyond the three listed here, remove it too — the goal is exactly one source of truth, not three minus the ones I happened to find.

## What to add/fix in the one remaining consolidated rule (`app.css:~35695`)

```css
#page-home .loadout-card #agentFrame,
#page-home .loadout-card #agentFrame.agent-frame{
  grid-area: reel;
  width: 100%;
  min-width: 0;
  max-width: none;
  height: 100%;
  min-height: 0;
  aspect-ratio: auto;      /* was unopposed 1/1 from a deleted old block — this is the actual fix */
  justify-self: stretch;
  align-self: stretch;
}

#page-home .loadout-card #spinAgentBtn{
  grid-area: spin;
  width: 100%;
  min-width: 0;
  height: auto;
  aspect-ratio: 1 / 1;     /* capped, roughly square — matched to its own column width, not stretched to the row */
  max-height: 100%;
  align-self: center;      /* centered within the row, not stretched top-to-bottom */
  justify-self: stretch;
}
```

Keep everything else already correct from round 2 (role buttons in one row, `grid-template-areas: "roles roles" / "reel spin" / "info info"`, pills in the info row) — only these two rules need to change, now that the competing old declarations are gone rather than being fought against.

## Mandatory safety rules (same as both prior rounds)

1. **`.loadout-card`'s outer box (width/height) must never change.** Verify pixel-identical before/after, desktop and mobile.
2. **The spin/reel animation is fragile.** `syncAgentReelGeometry()` (`app.js:57718` and call sites at `14663, 25473, 26907, 48368, 48597, 57813, 57850`) computes the reel's landing geometry from the frame's actual rendered pixel size. Since this round changes the frame's aspect ratio (no longer forced 1:1), this **must** be re-verified with a real, observed roll — the frame's rendered size is genuinely changing this time, not just its position.

## How this will be reviewed

1. **A real screenshot of the actual rendered result, compared directly against `https://claude.ai/code/artifact/fd5bfb66-94f3-4992-8c37-5e088cc4ebfe`** (Map pill leftmost) — don't report this done without one.
2. Confirm the agent frame now fills the width of its cell (no large empty margins on either side), not forced back to a square.
3. Confirm the spin button is a modest, roughly-square control, vertically centered in its row — not a tall stretched strip.
4. Confirm role buttons are still one row, full width, and the pills are still Map / Agent / Focus Category left to right.
5. Confirm `.loadout-card`'s outer dimensions are unchanged (DevTools computed size, not eyeballed).
6. Confirm a real roll lands the reel correctly at the frame's new (non-square) rendered size — desktop, mobile, at least two themes.
7. Grep the full file for `.loadout-card #agentFrame`, `.loadout-card #spinAgentBtn`, `.loadout-card .role-filter-row`, `.loadout-card .home-loadout-main`, `.loadout-card .home-loadout-info`, `.loadout-card .home-loadout-pill` and confirm exactly one block remains for each, not several competing ones.

## Testing checklist

1. Visual match against the approved mockup, desktop and mobile.
2. Real roll reproduction, desktop and mobile, at least two themes — this time specifically checking the reel's landing position now that the frame's aspect ratio changed.
3. `.loadout-card` dimension check via DevTools, before and after.
4. Full-file grep confirming no remaining competing `.loadout-card`-scoped blocks for these elements.
