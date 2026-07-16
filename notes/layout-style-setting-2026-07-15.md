# Layout Style — A New Setting, Not a New Default (2026-07-15)

**Status:** Ready to build. This replaces the forced-global approach from `notes/hud-border-tag-ruleset-2026-07-15.md`. That directive was built (`64e55c0`, `public/hud-content-system.css`) and reverted the same day (`81e434e`) — Michael's words: "did not fit the theme as I was expected... we would need more subtlety." Reference artifact for exact visual/CSS specs, all 20 concepts:
- `https://claude.ai/code/artifact/296f0dbc-e99b-494b-95ea-6a7031c4f41a`

**The pivot:** don't pick one direction and force it on every profile. Add a real setting, **Layout Style**, next to the existing Theme Selector. Current production styling becomes the **Default** option — untouched, always available, no migration needed for existing users. The 20 concepts in the artifact become additional selectable options. This is explicitly full creative range per style ("go 100% in changing all of the pages how you see fit") — unlike the prior directive's restrained "borders and tags only" scope, these can restyle corners, dividers, typography accents, and card chrome however each concept calls for.

---

## 1. Hard constraint: every style must be color-neutral

This is almost certainly why the reverted pass didn't land generally, even though it was scoped narrowly — it introduced new hardcoded color tokens (`--hot`, `--cool`, `--good`) independent of the app's actual theme system. A user on any non-default theme would have gotten a style that visually fights their chosen colors.

Confirmed from the live app: the real color variables themes already redefine are `--accent`, `--accent-2`, `--card`, `--card-2` (or equivalent — verify exact names in `public/app.css:9` and `public/app.css:22365-22366`), `--text`, `--muted`, scoped via `body[data-theme="..."]` (`public/app.js:35596`), and premium themes (`public/themes/premium-themes.js`) redefine the same variables per theme (e.g. Radiant Focus: accent `#facc15`/accent-2 `#38bdf8`; Omen Night: accent `#8b5cf6`/accent-2 `#06b6d4`).

**Every one of the 20 Layout Style CSS rule sets must reference only `var(--accent)`, `var(--accent-2)`, `var(--card)`, `var(--card-2)`, `var(--text)`, `var(--muted)`** (using `color-mix()` for tints/opacity variants, gradients between the two accent values, etc.) — never a new fixed hue. The reference artifact's `<style>` block is already written this way end-to-end and can be lifted directly; it also includes a live theme-color-swap control at the top (three buttons cycling real accent pairs) specifically to prove every style recolors correctly with zero hardcoded hues. Verify this same way before considering any style done — check it against at least two different themes, not just Default.

---

## 2. Data model and persistence — mirror the existing Theme Builder pattern

Add a `layoutStyle` field to the profile object (default: `"default"`, meaning current production styling, no attribute applied). Store and apply it the same way theme selection already works — the app has an existing `getCurrentThemeBuilderThemeKey()` / `persistAndApplyThemeBuilder()` pair (`public/app.js:34442+`) that already solves "persist a per-profile visual-mode key and re-apply it on load." Add the equivalent `getCurrentLayoutStyleKey()` / `persistAndApplyLayoutStyle()`, following that existing pattern rather than inventing a new persistence mechanism.

Apply the chosen style via a data attribute on the same element the theme system already scopes from — e.g. `body[data-layout-style="hud"]`, `body[data-layout-style="holo"]`, etc., using the 20 keys from the artifact: `hud, holo, milsim, broadcast, terminal, blueprint, neon, minimal, tcg, comms, recon, arcade, command, manual, ghost, signal, trophy, redacted, sonar, modular`. `data-layout-style` absent or `"default"` = no rule set applies, current styling renders exactly as today.

---

## 3. UI — add the picker next to the existing Theme Selector

Find wherever the current Theme Selector lives in Settings (confirmed present: "Theme Selector" appears in the account/profile settings surface) and add a parallel **Layout Style** selector there — same interaction pattern (a list/grid of selectable options with a live preview), defaulting to **Default**. Each option should show a small live preview swatch of that style rendered in the user's currently-selected theme colors — not a static screenshot — so the compatibility (section 1) is visible to the player choosing it, not just asserted in this note.

---

## 4. Scope — same content-card list as the reverted directive, just switchable now

Don't re-derive which cards get styled — that classification (content/coaching cards vs. charts/meters/data-grids/input-controls) was already worked out and approved in `notes/hud-border-tag-ruleset-2026-07-15.md`'s "Confirmed IN scope" / "Confirmed OUT of scope" lists (Insights in full, Home's Weekly Focus + Recent Improvement, Stats' Recent Match Trends + Match Patterns, Logging's Session Debrief + log feed entries, and the Gamesense Library dossiers/tips/comps/weapon-suggestions/fundamentals — explicitly excluding nav bar, charts, meters, radar/diamond visualizations, dense stat-tile grids, and input controls across every page). Reuse that exact list as the set of elements each of the 20 Layout Styles restyles. If a future style needs a different scope, that's a new decision to bring back to Michael — don't quietly expand scope per-style.

**Reuse, don't rebuild, the prior work:** the reverted commit (`64e55c0`, before `81e434e` reverted it) already built `public/hud-content-system.css` scoped correctly to this exact card list. `git show 64e55c0` to pull it back as the starting implementation for Layout Style #1 (`hud`, "Tactical HUD") — adapt its color references from the old hardcoded `--hot`/`--cool`/`--good` tokens to `--accent`/`--accent-2` per section 1, then scope it under `body[data-layout-style="hud"]` instead of applying globally. The other 19 styles are new builds, using the reference artifact's CSS as the exact spec.

---

## Testing checklist — don't report this batch done until:

1. With Layout Style left at Default, every page (Home, Insights, Stats, Logging, Library) is pixel-identical to current production — confirm via screenshot diff, not assumption.
2. Each of the 20 styles, selected one at a time, renders correctly on the in-scope card list from section 4, and leaves the out-of-scope elements (nav, charts, meters, grids, inputs) completely untouched.
3. Each style is checked against at least two different themes (e.g. Default red/orange and one premium theme like Omen Night) to confirm zero hardcoded color leakage — this is the specific failure mode section 1 exists to prevent.
4. Layout Style selection persists per profile the same way theme selection already does (reload, re-open the app, switch profiles — confirm it sticks to the right profile).
5. Custom banner and other existing per-profile color customizations still render correctly under every Layout Style, not just Default.
6. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
7. Bump the cache key in `public/index.html` for every changed asset.
8. Given the scale (20 full style implementations), it's reasonable to ship this incrementally — confirm with Michael whether he wants all 20 built before the first release or wants to greenlight a subset first, rather than assuming the full set ships at once.
