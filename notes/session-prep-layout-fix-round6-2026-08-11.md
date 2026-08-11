# Session Prep Layout — Round 6: Exact Proportions Specified Directly + Revert Round 4's Crop Bug (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.**

**Status: ready to build. This supersedes `notes/session-prep-layout-fix-round5-2026-08-11.md` — round 5 was never built; its fix is folded into Part A below alongside today's new, very specific instructions in Part B. Build both parts together, in order.**

## Part A — Revert round 4's crop regression first (prerequisite for Part B)

Confirmed cause, still unfixed: round 4 (`aa831c8`) changed `object-fit: contain` to `object-fit: cover` on the agent art (`app.css:56979-56990`, and the matching theme-builder string at `app.js:44683`), trying to eliminate empty space around the portrait. `cover` crops to fill a box instead of letterboxing, which is why the character art currently renders as an extreme, cropped close-up. **Revert this specific change before doing anything in Part B**, since Part B changes the frame's shape again and `object-fit: contain` is what makes that safe (it letterboxes instead of cropping, regardless of the box's proportions):

1. `app.css:56979-56990` — change `object-fit: cover !important;` back to `object-fit: contain !important;` for `.agent-reveal-art img` / `.agent-frame-portrait`.
2. `app.js:44683` — same revert in the theme-builder string (the `.reel-icon` line at `app.js:44684` was already `contain`, leave it).

**Do not reintroduce `object-fit: cover` anywhere in this round's work**, even if the new proportions in Part B leave visible empty space around the art on some agents — that's expected and correct with `contain`, not a bug to fix by cropping again.

## Part B — Exact layout changes, specified directly by Michael

1. **Flip the spin button and agent frame positions.** Spin button goes left, agent frame goes right (currently the reverse). Change `grid-template-areas` from `"roles roles" / "reel spin" / "info info"` to `"roles roles" / "spin reel" / "info info"`.

2. **Spin button and agent frame become the same height.** Set both to `height: 100%; align-self: stretch;` with no `aspect-ratio` constraint on either — since they now share the same grid row, matching height is automatic once neither is artificially capped to a square or centered smaller than the row. Remove any `aspect-ratio: 1/1` currently applied to `#spinAgentBtn` in this scope.

3. **Spin button and agent frame split their row 50/50, with a decent gap.** Currently the agent frame takes roughly two-thirds of the row's width with the spin button taking the rest. Change the row's column split to two equal columns: `grid-template-columns: minmax(0,1fr) minmax(0,1fr)` for that row (both `roles` and `info` already span both columns via their area names, so this doesn't affect them). Add a real, visible gap between the two cells — `column-gap: 14px` is a reasonable starting point, adjust if it looks too tight or too loose once rendered.

4. **Reduce the agent-frame row's height by 20 percentage points; add 10 to the role-button row and 10 to the info row.** The three rows (`roles`, `spin`/`reel`, `info`) are currently sized `auto minmax(0,1fr) auto` — content-driven, not explicit percentages. To apply this precisely: **measure the actual current rendered height of each of the three rows as a percentage of `.home-loadout-main`'s total height**, then set new explicit percentages: middle row (spin/reel) = current − 20 points, roles row = current + 10 points, info row = current + 10 points (all three must still sum to 100%). Convert `grid-template-rows` to these three explicit percentage values instead of `auto`/`1fr`, so the proportion is fixed and doesn't drift with content changes. **Report the before/after percentages actually used** so this can be verified against the request.

5. **Remove the glow entirely — border color only, no glow.** Michael's explicit words: "we only need a colored border, so no glowing border." This is not "reduce the glow" (what round 4 attempted and didn't fully address) — remove any box-shadow, drop-shadow filter, or blur effect associated with the agent frame's border, in **both** the idle/placeholder state and the revealed-agent state. Keep only the existing role-tinted `border-color` (`app.css:13144-13147`, e.g. `.agent-frame.sentinel{ border-color:#22c55e }`) and the plain border width/style — nothing glowing around it. Round 4's change at `app.css:14965-14971` only reduced (not removed) the idle placeholder's drop-shadow and never touched the revealed-agent state's glow at all — find the revealed-agent glow live in DevTools (inspect an actual revealed agent, not the idle placeholder) and remove it at the source, don't just dim it further.

## Mandatory safety rule (same as every round)

The frame's size and position are both changing again this round. Confirm with a real, observed roll that `syncAgentReelGeometry()` (`app.js:57718` and other call sites) still lands the reel correctly afterward — desktop, mobile, at least two themes.

## How this will be reviewed

1. A real screenshot showing: spin button on the left, agent frame on the right, both visibly the same height, split roughly 50/50 with a clear gap between them.
2. Confirm the character art renders fully and correctly (not cropped) — `object-fit: contain` confirmed still in place.
3. Report the exact before/after row-height percentages used for the roles/reel-spin/info rows.
4. Screenshot showing the border is a plain colored line with no glow/blur around it, for both an idle (no agent revealed yet) and a revealed-agent state.
5. Confirm a real roll still lands the reel correctly at the new frame size/position.
6. Confirm `.loadout-card`'s outer box dimensions are still unchanged.

## Testing checklist

1. Visual check against this exact spec (positions flipped, equal height, 50/50 width split, adjusted row heights, no glow) rather than against the original mockup, since this round's instructions supersede the mockup's proportions directly.
2. Real roll reproduction, desktop and mobile, two themes.
3. `.loadout-card` dimension check via DevTools, before and after.
4. Confirm no other regressions to the map pill background image or the any-map clear-toggle from round 4 (both should be unaffected by this round's changes, but confirm).
