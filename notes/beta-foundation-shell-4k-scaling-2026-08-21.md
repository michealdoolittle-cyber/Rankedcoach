# Beta Foundation Shell — Scale Proportionally at Large/4K Viewports (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · Medium reasoning · Fast speed.**

**Status: open — not started.**

## The problem, confirmed by testing

Claude tested `notes/previews/beta-foundation-shell-reference-2026-08-20.html` at 3840×2160 (4K) via Playwright. At that viewport, the shell renders **1051px tall in a 2160px-tall window — less than half the vertical space is used**, with a large empty area below and around the content. No horizontal scrolling or width overflow (that part is fine), so this wasn't caught by prior viewport checks that only tested widths matched to shorter heights.

Root cause: every fluid sizing token (`--rc-sidebar-w`, `--rc-topbar-h`, `--rc-pad`, `--rc-gap`, body font-size, etc.) is `vw`-based (scales with viewport *width* only) and caps out at a `clamp()` ceiling tuned for a normal desktop monitor — sidebar maxes at 224px, font-size maxes at ~13.5px, padding maxes at 26px. These ceilings are reached well before 3840px width, so nothing keeps growing past that point, and since nothing is driven by viewport *height* either, the extra vertical space at 4K just sits empty. This is the same issue Michael flagged earlier in the project ("full FOV failure... viewing at 4k resolution") — it was never actually fixed, just not re-tested until now.

## Decision — confirmed by Michael

**Scale everything up proportionally at large viewports.** Not "show more content at the same size" and not a max-width cap that keeps content centered with side margins — cards, text, icons, and spacing should all keep growing as the viewport gets larger, so a 4K view looks like a proportionally bigger version of the desktop layout, filling the screen.

## What to fix

1. **Raise every `clamp()` ceiling substantially** — roughly double each token's current maximum, and make sure the preferred-value formula (the middle `vw` term) keeps the curve climbing all the way to ~3840px rather than flattening out well before it. Concretely, using the current values as a starting point:
   - `--rc-sidebar-w`: currently `clamp(168px, 13vw, 224px)` → raise the ceiling to roughly 380-420px, and adjust the `vw` multiplier so it's still visibly growing between 2560px and 3840px, not flat.
   - `--rc-topbar-h`: currently `clamp(58px, 4.7vw, 72px)` → raise ceiling to roughly 120-130px.
   - `--rc-pad` / `--rc-gap`: raise ceilings roughly proportionally (roughly double).
   - Body font-size: currently capped around 13.5px → raise to roughly 20-22px at the top end. Headline/display sizes (Barlow Condensed) should scale up proportionally alongside it, not stay fixed while body text grows.
   - Do **not** change the minimum bound of any of these — the small/narrow end (down through the 720px mobile breakpoint) was already verified working correctly and shouldn't move.

2. **Convert any fixed-pixel sizing that should also grow into a `clamp()`.** A few things are still hardcoded px values that won't scale no matter what happens to the tokens above — most notably `.shell`'s `min-height:620px` (this is very likely the single biggest contributor to the empty-space problem, since it's an absolute floor unrelated to viewport size), `.skel`'s `min-height:60px`, and any hardcoded SVG/chart dimensions, icon sizes, or avatar sizes. Audit for these and convert them to fluid `clamp()` values consistent with the rest of the system.

3. **Re-verify at both ends after the change:**
   - Large end: test at 1920×1080, 2560×1440, 3200×1800, and 3840×2160 (all 16:9, matching real monitor ratios). Confirm the shell's rendered height scales up to fill most of each viewport height — not stuck at a fixed low value — and that nothing looks disproportionate (icons staying tiny while text balloons, or vice versa).
   - Small end: re-run the existing downward check (1920px down through 800px, then confirm the sidebar still correctly disappears at the 720px mobile breakpoint) to make sure raising the ceilings didn't regress anything already verified working there.

## Verification

Screenshot at each of the 4 large-viewport widths above and at 2-3 points on the small end, confirm visually that content fills the available height reasonably at large sizes without breaking anything at small sizes, and report back with the before/after height numbers at 3840×2160 specifically (currently 1051px shell height in a 2160px viewport) so the improvement is measurable, not just claimed.
