# Session Prep Layout: Map Pill Placement, Role Row Width, Frame Safety Rules (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.** Layout implementation directive — pairs with `notes/map-aware-loadout-roll-weighting-2026-08-11.md` (the roll-weighting logic itself). This directive is the visual/structural spec only. Read the whole thing before touching any CSS here — the agent frame is a known-fragile area with a documented history of breaking the spin animation.

**Status: ready to build.**

## Visual reference

Layout mockup: `https://claude.ai/code/artifact/fd5bfb66-94f3-4992-8c37-5e088cc4ebfe` — approved by Michael with one change: **the Map pill goes to the left of the Agent pill**, not the right (mockup showed it rightmost; final order left-to-right is **Map, Agent, Focus Category**). Everything else in the mockup (pill styling, picker modal layout, map grid, copy) is approved as shown. The mockup used approximated colors/type as a stand-in for the real design system — build with the app's actual tokens (existing `.home-loadout-pill`, accent colors, `Rajdhani` display font, etc.), not the mockup's literal CSS values.

## Confirmed: the real current grid structure (the mockup simplified this — build against what's actually here)

`.home-loadout-main` (`app.css:12087-12103`) is a CSS grid:
```css
grid-template-columns: 206px 120px minmax(0,1fr);
grid-template-areas:
  "roles spin reel"
  "agent agent agent"
  "focus focus focus";
```
Role buttons (`grid-area: roles`), the spin button (`grid-area: spin`), and the agent visual frame (`#agentFrame`, `grid-area: reel`) currently sit **side by side in one row** — roles is a fixed 206px column, not full-width. The two info pills are each their own **separate full-width row** below that (`.home-loadout-pill:first-child` → `grid-area: agent`; `.home-loadout-pill:last-child` → `grid-area: focus`, `app.css:12202-12207`) — they are not currently a shared row the way the mockup showed three pills side by side.

## Required changes

1. **Add a third pill for Map, ordered leftmost.** Restructure the pill area so Agent and Focus Category (and the new Map pill) render as a shared row — matching the mockup's visual — with Map first, Agent second, Focus Category third. Reuse `.home-loadout-pill` as the base style for consistency (border, background, padding, label/value typography) rather than introducing new pill CSS from scratch; add whatever's needed on top for the Map pill's interactive/cyan-accent state (matching the mockup) as a modifier class, not a full reimplementation.
2. **Role filter row width must equal the agent frame's width.** Currently `roles` is a fixed 206px column while `reel` (`#agentFrame`) is `minmax(0,1fr)` — these are structurally different and don't match today. Restructure so the role-filter row's rendered width tracks the agent frame's width exactly. Decide the cleanest way to achieve this within the grid (e.g., moving roles to its own full-width row above/below the frame, spanning the same column as `reel`, rather than sitting beside it) — but see the safety rule below before changing anything that affects `#agentFrame`'s own box size.
3. **The spin button and its icon are unaffected by this — don't move or resize `#spinAgentBtn` as a side effect** of the roles/reel width change unless explicitly required to achieve it; if its position must change to make the width relationship work, keep its own size and animation untouched.

## Mandatory safety rules — read before touching any CSS in this area

**Rule 1 — the `.loadout-card` parent must never change size.** Per Michael: "we just need... a safeguard that prevents the main-loadout parent card from adjusting in height or width. All child elements can be adjusted but adjusting the parent card breaks the app and all other section boundaries set." `.loadout-card` (`app.css:12074-12079`) and its rendered box dimensions are load-bearing for the surrounding Home page layout. Every change in this directive must happen *inside* the card's existing box — reflow the grid, resize/reposition children, but the card's own outer width/height must be verified unchanged before and after, on both desktop and mobile. Add this as an explicit automated or manual check, not just an assumption.

**Rule 2 — the agent frame's spin animation is fragile and has broken before from exactly this kind of change.** `spinLoadout()` (`app.js:57599+`) calls `syncAgentReelGeometry(reel, reelStrip, frame)` (`app.js:57718`, also called from other sync points at `app.js:14663`, `25473`, `26907`, `48368`, `48597`, `57813`, `57850`) to compute the reel animation's landing geometry **from the frame's actual rendered pixel size**. If `#agentFrame`'s width or height changes as a side effect of the grid restructuring in item 2 above, the spin animation's math depends on that size and must be re-verified — a resized frame with stale geometry assumptions can make the reel land off-center, spin the wrong distance, or clip. After any change that could affect `#agentFrame`'s box size:
   - Trigger a real roll (`spinLoadout()`) and visually confirm the reel spins smoothly and lands centered, correctly showing the selected agent, on both desktop and mobile.
   - Check every other call site of `syncAgentReelGeometry` listed above still executes correctly (these are re-sync points for cases like resize/theme change — confirm none of them now produce incorrect geometry).
   - Do this on at least two different themes/layout styles, since this area also has scoped theme CSS elsewhere in the file (`app.js:44469` already targets `#agentFrame`'s children for transform-origin — confirm this directive's changes don't conflict with it).

## How this will be reviewed

1. Screenshot before/after confirming Map pill is leftmost, Agent second, Focus Category third, matching the approved mockup order.
2. Screenshot confirming the role-filter row's width visually matches the agent frame's width.
3. Confirm `.loadout-card`'s outer box dimensions are pixel-identical before and after, on both desktop and mobile viewports.
4. Confirm the spin animation works correctly with a real, observed roll — not just "the code looks unchanged."
5. `node --check` on every touched file; run the full existing test suite plus any existing visual-audit tests covering this card (`testing/visual-audit/*.test.js` — check for one covering Home/loadout first before assuming none exists).

## Testing checklist

1. Visual comparison against the approved mockup (with the Map-pill-leftmost correction) on desktop and mobile.
2. Real roll reproduction confirming the spin animation lands correctly, repeated a few times to catch any intermittent geometry issue.
3. Confirm `.loadout-card` box dimensions unchanged via direct measurement (DevTools computed size), not visual estimation.
4. Confirm role filter buttons still function correctly (role filtering, active states) after the width change.
5. Cross-theme check (at least two themes/layout styles) for both the pill row and the frame/reel area.
