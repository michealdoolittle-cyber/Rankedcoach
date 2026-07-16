# Layout Style — A New Setting, Not a New Default (2026-07-15, concepts revised 2026-07-16)

**Status:** Ready to build. This replaces the forced-global approach from `notes/hud-border-tag-ruleset-2026-07-15.md`. That directive was built (`64e55c0`, `public/hud-content-system.css`) and reverted the same day (`81e434e`) — Michael's words: "did not fit the theme as I was expected... we would need more subtlety."

**Revision note (2026-07-16):** the first 20 concepts (artifact `296f0dbc-...`) were rejected as not distinctive enough — Michael's read was that they were mostly one idea (a rectangle) reskinned with different border/corner treatments, not genuinely different framing devices. **The 20 concepts below are the replacement and the current spec — don't build the original 20.** The new set pulls from actual sci-fi/HUD vector-design vocabulary (corner brackets, circuit traces, portal rings, exploded-diagram leader lines) so each one is a structurally different framing metaphor, not a variant of the same box.

**Primary visual/CSS reference — committed directly into the repo, not just a hosted link** (Michael is often off the claude.ai network and needs this reachable via a plain `git pull`):
- `docs/design/layout-styles-v2-2026-07-16.html` — open directly in a browser after pulling, no server needed, fully self-contained.
- Secondary/backup: `https://claude.ai/code/artifact/[see ntfy notification for this batch]` (hosted copy, same content).

**The pivot:** don't pick one direction and force it on every profile. Add a real setting, **Layout Style**, next to the existing Theme Selector. Current production styling becomes the **Default** option — untouched, always available, no migration needed for existing users. The 20 concepts in `docs/design/layout-styles-v2-2026-07-16.html` become additional selectable options. This is explicitly full creative range per style ("go 100% in changing all of the pages how you see fit") — unlike the prior directive's restrained "borders and tags only" scope, these can restyle corners, dividers, typography accents, and card chrome however each concept calls for.

---

## 1. Hard constraint: every style must be color-neutral

This is almost certainly why the reverted pass didn't land generally, even though it was scoped narrowly — it introduced new hardcoded color tokens (`--hot`, `--cool`, `--good`) independent of the app's actual theme system. A user on any non-default theme would have gotten a style that visually fights their chosen colors.

Confirmed from the live app: the real color variables themes already redefine are `--accent`, `--accent-2`, `--card`, `--card-2` (or equivalent — verify exact names in `public/app.css:9` and `public/app.css:22365-22366`), `--text`, `--muted`, scoped via `body[data-theme="..."]` (`public/app.js:35596`), and premium themes (`public/themes/premium-themes.js`) redefine the same variables per theme (e.g. Radiant Focus: accent `#facc15`/accent-2 `#38bdf8`; Omen Night: accent `#8b5cf6`/accent-2 `#06b6d4`).

**Every one of the 20 Layout Style CSS rule sets must reference only `var(--accent)`, `var(--accent-2)`, `var(--card)`, `var(--card-2)`, `var(--text)`, `var(--muted)`** (using `color-mix()` for tints/opacity variants, gradients between the two accent values, etc.) — never a new fixed hue. The reference artifact's `<style>` block is already written this way end-to-end and can be lifted directly; it also includes a live theme-color-swap control at the top (three buttons cycling real accent pairs) specifically to prove every style recolors correctly with zero hardcoded hues. Verify this same way before considering any style done — check it against at least two different themes, not just Default.

---

## 2. Data model and persistence — mirror the existing Theme Builder pattern

Add a `layoutStyle` field to the profile object (default: `"default"`, meaning current production styling, no attribute applied). Store and apply it the same way theme selection already works — the app has an existing `getCurrentThemeBuilderThemeKey()` / `persistAndApplyThemeBuilder()` pair (`public/app.js:34442+`) that already solves "persist a per-profile visual-mode key and re-apply it on load." Add the equivalent `getCurrentLayoutStyleKey()` / `persistAndApplyLayoutStyle()`, following that existing pattern rather than inventing a new persistence mechanism.

Apply the chosen style via a data attribute on the same element the theme system already scopes from — e.g. `body[data-layout-style="brackets"]`, `body[data-layout-style="circuit"]`, etc., using the 20 keys from `docs/design/layout-styles-v2-2026-07-16.html`: `brackets, circuit, honeycomb, hologram, portal, chevron, perspective, oscillo, aperture, fracture, loadbar, gridmount, radar, scope, leader, interlock, solder, hazard, uplink, exploded`. `data-layout-style` absent or `"default"` = no rule set applies, current styling renders exactly as today.

Note two concepts have layout implications beyond a card restyle, flag these to Michael before building rather than silently deciding: **Honeycomb Panel** and **Portal Ring** change the outer silhouette of a card (true hexagon / true circle) rather than just its border and corners — confirm these are still wanted as full swaps for rectangular content cards (they may need a taller/narrower content reflow than a standard card) before investing in them.

---

## 3. UI — add the picker next to the existing Theme Selector

Find wherever the current Theme Selector lives in Settings (confirmed present: "Theme Selector" appears in the account/profile settings surface) and add a parallel **Layout Style** selector there — same interaction pattern (a list/grid of selectable options with a live preview), defaulting to **Default**. Each option should show a small live preview swatch of that style rendered in the user's currently-selected theme colors — not a static screenshot — so the compatibility (section 1) is visible to the player choosing it, not just asserted in this note.

---

## 4. Scope — same content-card list as the reverted directive, just switchable now

Don't re-derive which cards get styled — that classification (content/coaching cards vs. charts/meters/data-grids/input-controls) was already worked out and approved in `notes/hud-border-tag-ruleset-2026-07-15.md`'s "Confirmed IN scope" / "Confirmed OUT of scope" lists (Insights in full, Home's Weekly Focus + Recent Improvement, Stats' Recent Match Trends + Match Patterns, Logging's Session Debrief + log feed entries, and the Gamesense Library dossiers/tips/comps/weapon-suggestions/fundamentals — explicitly excluding nav bar, charts, meters, radar/diamond visualizations, dense stat-tile grids, and input controls across every page). Reuse that exact list as the set of elements each of the 20 Layout Styles restyles. If a future style needs a different scope, that's a new decision to bring back to Michael — don't quietly expand scope per-style.

**Reuse, don't rebuild, the scope wiring:** the reverted commit (`64e55c0`, before `81e434e` reverted it) already built `public/hud-content-system.css` scoped correctly to this exact content-card list — the card/tag *selectors* (which elements get touched on each page) are still valid and worth pulling forward with `git show 64e55c0`. Its actual visual rules (the old gradient-border/flag-tag look, with the hardcoded `--hot`/`--cool`/`--good` tokens) are superseded by the 20 v2 concepts and should not be reused as-is. All 20 new styles are fresh builds against `docs/design/layout-styles-v2-2026-07-16.html`'s CSS.

---

## 5. Typography — a paired font per style, fully optional two ways

Michael's ask: each Layout Style should get its own display font, but nobody should be stuck with a font they don't like. Two independent controls, both required, neither a substitute for the other:

**Visual/CSS reference, committed into the repo:** `docs/design/layout-styles-fonts-2026-07-16.html` — same self-contained, open-directly-after-`git pull` pattern as the shapes file. It loads all 20 fonts live via a Google Fonts `<link>` (real internet access, not the Artifact CSP sandbox, so the actual typefaces render when opened normally) and demonstrates both controls below plus the full per-style font pairing table.

**Setting A — per-style "Custom Font" toggle.** Lives directly under the Layout Style picker. Defaults to **on** the moment a style is selected. Switching it off keeps every shape/border/tag rule from that style exactly as-is and only reverts header/title typography to the app's current default font (`Bahnschrift`/`Oswald`/system stack, matching the existing display-font usage already established elsewhere in this design work) — body copy is never affected either way, it always stays on the app's normal readable font.

**Setting B — standalone global "Font" dropdown.** A second, fully independent setting, not nested under Layout Style at all. Lets a player pick any of the 20 display fonts (or Default) directly, and it applies regardless of which Layout Style is active or what Setting A is set to — e.g. a player could run the Default layout shape-wise but with the Circuit Trace style's font, or run Circuit Trace's shapes with a font from a completely different style. Each option in the dropdown must render its own name in its own actual typeface (implemented in the reference file) so the choice is self-explanatory without a separate preview step.

**The 20 pairings** (display font for headers/titles only; reference file has live examples of each):

| Style | Font | Why |
|---|---|---|
| Floating Brackets | Rajdhani | geometric technical sans, HUD readout weight |
| Circuit Trace | Share Tech Mono | PCB-silkscreen monospace |
| Honeycomb Panel | Orbitron | geometric hex-friendly display face |
| Hologram Stack | Audiowide | rounded projected-glow display face |
| Portal Ring | Michroma | wide geometric sci-fi face |
| Chevron Scan | Aldrich | scanning-console technical face |
| Perspective Monitor | Exo 2 | modern cockpit-display geometric sans |
| Oscilloscope Ticker | JetBrains Mono | clean waveform-readout monospace |
| Aperture Cut | Iceland | condensed mechanical-iris face |
| Energy Fracture | Turret Road | angular jagged energy face |
| Loading Bar Frame | VT323 | retro loading-screen pixel face |
| Grid Mount | Space Mono | graph-paper technical monospace |
| Radar Wedge | Electrolize | clean sci-fi radar-readout face |
| Scope Vignette | Saira Condensed | tactical condensed military face |
| Leader-Line Callout | Special Elite | technical-diagram typewriter face |
| Interlock Notch | Silkscreen | blocky interlocking pixel face |
| Solder Node Corners | Chakra Petch | circuit-board geometric tech face |
| Hazard Edge | Bebas Neue | bold condensed caution-sign face |
| Signal Uplink | Syncopate | futuristic uppercase signal face |
| Exploded Diagram | IBM Plex Mono | clean blueprint-annotation monospace |

All 20 are free Google Fonts — confirm licensing/self-hosting approach with however the rest of the app currently loads any web fonts (check if RankedCoach already self-hosts fonts vs. links Google Fonts directly; match that existing pattern rather than introducing a new one) before wiring these into production, and load only the weights actually used per style rather than every weight, for performance.

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
9. The per-style Custom Font toggle, switched off, reverts header/title typography to the app default while every shape/border/tag rule from that style stays active — confirm these are genuinely decoupled (toggling font never resets or disables the shape styling).
10. The standalone Font dropdown applies its chosen font regardless of Layout Style or the per-style toggle's state — test at least one deliberately mismatched combination (e.g. Default shapes with a non-Default font) to confirm the two settings don't silently override each other.
11. Body copy is confirmed untouched by any font choice, in every style, at every toggle state — only headers/titles change.
