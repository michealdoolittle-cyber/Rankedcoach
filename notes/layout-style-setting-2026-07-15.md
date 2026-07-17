# Layout Style — A New Setting, Not a New Default (2026-07-15, concepts revised 2026-07-16, round 3 added 2026-07-16)

**Status:** Ready to build. This replaces the forced-global approach from `notes/hud-border-tag-ruleset-2026-07-15.md`. That directive was built (`64e55c0`, `public/hud-content-system.css`) and reverted the same day (`81e434e`) — Michael's words: "did not fit the theme as I was expected... we would need more subtlety."

**Revision note (2026-07-16):** the first 20 concepts (artifact `296f0dbc-...`) were rejected as not distinctive enough — Michael's read was that they were mostly one idea (a rectangle) reskinned with different border/corner treatments, not genuinely different framing devices. The 20 concepts in `docs/design/layout-styles-v2-2026-07-16.html` (round 2) replaced them.

**Round 3 (2026-07-16) — approvals in, plus a bolder new batch:**

*Approved from round 2's 20 designs (`docs/design/layout-styles-v2-2026-07-16.html`):* Honeycomb Panel (#3), Chevron Scan (#6), Aperture Cut (#9), Scope Vignette (#14), Hazard Edge (#18).

*Approved from round 2's 20 fonts (`docs/design/layout-styles-fonts-2026-07-16.html`), same numbered pairing order as the designs:* Orbitron (#3, paired with Honeycomb Panel), Silkscreen (#16, paired with Interlock Notch), IBM Plex Mono (#20, paired with Exploded Diagram). Note these font approvals are independent of which design they were originally paired with — per section 5's two-setting model, Michael can end up running e.g. Honeycomb's shape with IBM Plex Mono's font, that's expected and by design.

Michael's feedback on both round-2 sets: **too safe, go bolder.** Constraint given alongside that: don't introduce new SVG assets or change page container/grid layouts — but the shape/silhouette of the styled card itself is fully fair game to push further (this is why several round-3 concepts below are true silhouette changes — octagon, shield, diamond bevel — not border decoration on a rectangle).

**Round 3 replacement/addition sets (don't discard round 2's approved 5+3 above — these are additional options alongside them, review the same way):**
- **20 new bolder shape concepts:** `docs/design/layout-styles-v3-2026-07-16.html` (primary, open directly after `git pull` — no server needed), hosted copy at https://claude.ai/code/artifact/79810a5a-b730-48c5-b6fa-1f3c8d48358e. Several are genuine silhouette changes (Diamond Facet, Warp Gate's octagon, Shield Emblem, Iris Diaphragm's full-ring blade wrap) rather than corner/edge decoration on a rectangle, per the "bolder" note above. Same color-neutrality proof (live theme-swap control) as round 2.
- **20 new bolder fonts:** `docs/design/layout-styles-fonts-v2-2026-07-16.html` (primary, same reasoning — open locally for real Google Fonts, the hosted artifact copy at https://claude.ai/code/artifact/a5dc4c5d-efeb-4ef1-9d21-d93dddcf9585 will fall back to system fonts since the Artifact preview's CSP blocks font CDNs). Deliberately spread across registers round 2 didn't touch — engraved/ornate (Cinzel Decorative), glitch (Rubik Glitch), hand-scrawled (Rock Salt), blackletter (UnifrakturMaguntia), pixel-arcade (Press Start 2P), brutalist-heavy (Vast Shadow) — rather than staying in round 2's "clean technical sans" register throughout.

**Round 3 designs approved:** Diamond Facet (#1), Blade Wedge (#4), Ribbon Banner (#17), Monolith Slab (#19), from `docs/design/layout-styles-v3-2026-07-16.html`.
**Round 3 font approved:** Press Start 2P (#13), from `docs/design/layout-styles-fonts-v2-2026-07-16.html`.

**Round 4 (2026-07-16) — built directly from Michael's own reference moodboard, not invented from scratch.** Michael sent ~18 stock/reference images spanning pixel-RPG dialogue boxes, spray-paint stencils, botanical vine frames, comic-jagged speech bubbles, Valorant's own real official patch-notes editorial layout, wood signage, military field-patch badges, thorn/barbed frames, fire, ice, neon HUD, and water-bubble shapes — plus explicitly flagged that arcade-style and horror-adjacent directions were missing from what had been produced so far.

- **20 new shape concepts, each traced to a specific reference image:** `docs/design/layout-styles-v4-2026-07-16.html` (primary, open after `git pull`), hosted copy at https://claude.ai/code/artifact/c70a5df9-05da-4661-888d-0545df0fd374. Includes **Arcade Marquee** and **Claw Marks** built specifically to fill the arcade/horror gap Michael named, and **Sticky Note Flag** for the "note" direction he also asked for. Same color-neutrality rule, no new SVGs, no container changes.
- **Applied example on real UI, not just the demo card:** `docs/design/layout-styles-applied-2026-07-16.html`, hosted copy at https://claude.ai/code/artifact/cbf99ae6-c240-4d3b-9c6c-44453c408f69. Shows Dev Diary Diamond and the already-approved Monolith Slab applied to a Logging-form mockup (Map/Agent/Focus/Notes/Save), and Ink Cluster (designed specifically to repeat well in a list) and the already-approved Ribbon Banner applied to a 3-entry log feed mockup — directly answering Michael's ask to see this tied to the form and feed, not just an abstract card.
- **No new font round yet this batch** — Michael's round-4 message didn't include new font references; round 3's font list (`docs/design/layout-styles-fonts-v2-2026-07-16.html`) is still the latest font set pending further picks.

**Still waiting on Michael's picks from round 4 before any of it is locked in.**

**Round 4 designs approved:** Pixel Dialogue (#1), from `docs/design/layout-styles-v4-2026-07-16.html`.

**Round 5 (2026-07-17) — 12 new thematic concepts drawn from Valorant's own iconography (Radianite, spike timer, rank crest, agent dossier, cooldown ring, laser engraving, smoke wall, sentinel node, flash burst, recon ping, plus 2 shape-bevel concepts), `docs/design/layout-styles-v5-2026-07-17.html`, https://claude.ai/code/artifact/fbd5edcf-1c4d-452a-b1c8-f69f547b14b7. Michael's read: 11 of 12 rejected as "boring and uninspired for text boxes." Only Laser Engraving (#6) is even marginally okay ("not great, but I think we can add it") — approved to add, not a strong approval.**

**Likely root cause, worth confirming before round 6:** every rejected concept (including the 2 that used the shape-bevel technique) kept the card as a plain-ish rectangle and added a single small decorative accent (a corner icon, badge, ring, or edge marking) rather than transforming the whole tile. Laser Engraving was the one exception that treated the *entire card surface* with a texture instead of adding a corner accent — that may be the actual signal, not the Valorant-iconography theme itself. Don't re-run another "corner icon on a plain box" batch without checking this read with Michael first.

**Confirmed via AskUserQuestion:** yes, whole-surface material/texture treatments are the right direction, not corner accents.

**Round 6 (2026-07-17) — 10 whole-surface material concepts, `docs/design/layout-styles-v6-2026-07-17.html`, https://claude.ai/code/artifact/b0971eb6-699f-4b4f-b1ae-f67e8d44dba4. Approved: Carbon Weave (#1), Circuit Plate (#2), Topo Contour (#3), Frost Fracture (#6), Blueprint Grid (#8), Brushed Plate (#9), Hex Armor (#10) — 7 of 10. Rejected: Kevlar Weave (#4), Scanline Static (#5), Stitched Leather (#7).**

**Architecture decision, confirmed by Michael (2026-07-17):** the Layout Style picker in Customize should split into **two separate sections — Textures and Shapes** — selectable independently and combinable (e.g. a shape silhouette from the shapes list *plus* a texture from the textures list at the same time), rather than one single mutually-exclusive "Layout Style" choice. This changes the data model from a single `layoutStyle` key to two independent keys (e.g. `layoutTexture` + `layoutShape`), each with its own gallery/tab in the Customize UI. Flag this to whoever writes the next implementation directive — this is a real change to the section 1 data model in `notes/layout-style-implementation-2026-07-16.md`, not just a visual add.

**Still wants more of both** — round 7 in progress, covering additional textures and additional card shapes (a category not revisited since round 3/4).

**AI-generated frame asset review log (2026-07-16) — Michael is now generating finished frame art via OpenAI image generation, separate from the hand-coded CSS/SVG track above. Tracking verdicts here as they come in, for the eventual directive.**

| # | Description | Verdict | Why |
|---|---|---|---|
| 1 | Chrome/silver rose-and-thorns corner frame (two variants: full-perimeter square, top+bottom-only rectangle) | **Rejected** | Style mismatch — gothic/romantic register (chrome roses, thorns) fights the app's tactical/competitive-shooter identity; nothing approved so far (Diamond Facet, Blade Wedge, Ribbon Banner, Monolith Slab, Honeycomb, Press Start 2P) sits anywhere near this register. Also fails two hard technical constraints regardless of style fit: (1) baked chrome lighting/fixed silver-lilac tones can't be recolored via the `--accent`/`--accent-2`/`--card` token system every style is required to use (section 1) — would look wrong on any non-matching theme; (2) it's a raster illustration with baked highlights, not a true scalable vector, so it can't stretch cleanly across the app's differently-sized/differently-proportioned cards (Insights vs. Home vs. Library). Recommended direction instead: tactical/military/circuit-etched motifs, not organic floral, to match what's already approved. |
| 2 | Tactical circuit-trace HUD frame (hex corner nodes, chevron ticks, PCB-trace lines) | **Approved** | First working example of the corrected prompt recipe — flat single white color, no lighting/gradient, transparent background. Ready for `mask-image` + `background: var(--accent)` (or two-piece corner/edge split for `--accent-2` two-tone). This is the reference standard the rest of the batch is being judged against. |
| 3 | Vine Bloom (two opposite corners only, curling vine + leaves + tulip buds) | **Approved** | Matches the Vine Bloom concept brief from round 4 (`docs/design/layout-styles-v4-2026-07-16.html` #04) — calm/organic counterpoint to the tactical styles, by design. Flat white linework, transparent background, thin uniform line weight, no shading. Ready for masking. |
| 4 | Thornbound (full-perimeter thorned/barbed vine, jagged spikes) | **Approved** | Matches the Thornbound concept brief (v4 #09) — the "dangerous" counterpart to Vine Bloom. Flat white silhouette, consistent spike shapes, transparent background, no shading. Ready for masking. |
| 5 | Spray Stencil (irregular torn-edge silhouette with scattered dots) | **Needs revision — not usable as-is** | Generated as a **solid filled shape** with no transparent interior — there's no hollow center for card content to sit inside, so as a mask it would cover the entire card instead of framing it. Re-prompt with an explicit instruction that the interior must stay fully transparent (hollow border only, matching the negative space in the other approved frames), not a filled stencil badge. |

**Recreation pass (2026-07-16) — the round-4 CSS approximations weren't faithful enough to the actual reference images, rebuilt with real texture.** Michael's read: the concept fits the app perfectly, but flat clip-path polygons and gradient blobs couldn't capture what made the references (irregular ink splatter, wood grain, camo blotches, ice crackle, etc.) actually look good — approved going beyond CSS-only where needed.

`docs/design/layout-styles-recreations-2026-07-16.html` (primary, `git pull` + open locally), hosted copy https://claude.ai/code/artifact/823b6a25-8f6a-4fe1-9910-9437d1db1c3e. Covers the 14 round-4 concepts that trace to a specific reference image (Arcade Marquee/Claw Marks/Sticky Note Flag/Woven Thread/Origin Sigil/Crackle Light had no source image, round 4's versions stand for those). Techniques used, all inline within the one file — **no new asset files added to the repo**:
- Irregular organic edges (Ink Cluster, Spray Stencil, Comic Jagged Panel, Bubble Blob): `feTurbulence` → `feDisplacementMap` warping a plain shape, so the boundary is genuinely non-repeating instead of a fixed zigzag polygon.
- Anisotropic grain (Timber Plank) and paper texture (Dev Diary Diamond): `feTurbulence` at directional/high frequency, blended in at low opacity.
- Camo blotches (Field Badge): two independent `feTurbulence` → `feColorMatrix`-threshold layers in the two accent colors, layered as separate background elements.
- Crackle lines (Ice Shard): `feTurbulence` (anisotropic) → high-contrast `feColorMatrix` to isolate thin lines, not blob regions.
- Real vector linework (Vine Bloom, Thornbound, Flame Frame): inline `<svg>` `<path>` elements for genuine organic curves/spikes/flame-tongues — SVG filters can't fake actual vector geometry, so these use real paths instead.
- Real bloom (Neon HUD Outline): a blurred duplicate outline behind the crisp one, not a flat `box-shadow`.

**Implementation warning for Codex, learned the hard way building this reference file:** CSS `filter` applied to an element distorts its **entire rendered subtree, including child text** — a child's own `filter:none` does not exempt it from an ancestor's filter; that's not how compositing works. Every texture/displacement filter is applied to a dedicated background layer (a `::before`/`::after` or a separate absolutely-positioned element), never to the element that contains the actual card text, specifically to avoid this. Give real content `position:relative; z-index:3` (see the shared rule in the file) so it always paints above any decorative layer regardless of stacking ambiguity.

**Second revision (same day) — moved off procedural noise filters entirely, replaced with hand-plotted vector artwork.** Michael's read on the filter-based pass: only Pixel Dialogue (#1) was acceptable; the rest still didn't look real. Separately, and importantly: several of the original reference images turned out to be watermarked stock assets (Alamy/Shutterstock/Vecteezy, visible stock ID numbers) — inspiration/mood-board material, not licensed content, and not something to derive designs from directly no matter how much a derivative is altered ("change it enough and it's legal" is not a real legal safe harbor for a commercial product; style/genre is not copyrightable, the specific expression is). Confirmed with Michael: build genuinely original hand-drawn artwork capturing the same style/mood, not modified copies of the specific images.

Every texture-dependent concept in the file now uses real hand-plotted inline `<svg>` paths instead of `feTurbulence`/`feDisplacementMap`: an actual blob-and-drip silhouette (Ink Cluster), a hand-plotted jagged stencil edge with scattered overspray flecks (Spray Stencil), a scalloped all-around border (Comic Jagged Panel), six independently-wavy grain strokes (Timber Plank), six overlapping hand-drawn blob shapes in two colors (Field Badge), a branching crack-line network with facet highlights (Ice Shard), a real blob path with a `radialGradient` glass fill, specular highlight, and trailing drip circles (Bubble Blob), and denser hand-drawn tick/dash/node greebles along all four edges (Neon HUD). The five that already used real paths (Vine Bloom, Thornbound, Flame Frame, Dev Diary Diamond, Coffin Wedge) got additional polish too, since Michael's "only #1 was okay" feedback covered all 13, not just the technically-broken ones — added a second leaf/berry to Vine Bloom, a hot inner-core layer to Flame Frame, the diamond icon that was missing from Dev Diary Diamond, and a center highlight to Coffin Wedge's bevel. Verified by screenshot after every change, same as the filter pass.

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

**Hard rule, made explicit after a mockup mix-up (2026-07-16):** Layout Style is a border/shape/frame treatment applied *around* existing content — under no style, in no case, does it remove, hide, replace, or alter any actual content: agent icons/portraits, map thumbnails, stat values, tags, anything currently rendered. If a concept's silhouette (e.g. Honeycomb's hexagon) would visually clip or crowd out real content that a rectangular card doesn't, that's a reflow/sizing problem to solve, not a license to drop the content. This should already be obvious from "restyle corners, dividers, typography accents, and card chrome" in the pivot section above, but a design mockup used a plain placeholder circle instead of a real agent icon and it read as ambiguous about whether that was intentional — it wasn't; every reference mockup so far assumes real content stays fully intact underneath the new framing.

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
