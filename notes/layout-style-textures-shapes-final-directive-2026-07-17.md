# Layout Style — Final Directive: Textures + Shapes Split (2026-07-17)

**Status: ready to build.** This is the consolidated directive covering everything approved across 11 rounds of design exploration. It supersedes nothing already shipped — Track A/B from `notes/layout-style-implementation-2026-07-16.md` and the overreach fix are done and working. This note covers exactly three things: **one gap found in what's already shipped, the new Textures/Shapes data-model split, and the 16 approved shapes + 12 approved textures that still need building.**

---

## 0. Gap found in what's already shipped — fix this first

**Scope Vignette is missing.** It was approved in round 2 (`docs/design/layout-styles-v2-2026-07-16.html` #14) and listed in the original implementation directive, but a check of the current `public/layout-styles.css` (623 lines) shows no `scopevignette` key anywhere — every other round-2/3/4 approval (Honeycomb, Chevron Scan, Aperture Cut, Hazard Edge, Diamond Facet, Blade Wedge, Ribbon Banner, Monolith Slab, Pixel Dialogue) has its own `--layout-surface-*` block, but Scope Vignette doesn't. It got missed during implementation. Add it using the same pattern as its siblings — reference CSS is in `docs/design/layout-styles-v2-2026-07-16.html` concept #14, or the preview rule at the bottom of the current `layout-styles.css` if one still exists for it (check before assuming it needs to be built from scratch — the preview gallery card might have it even though the live surface rule doesn't).

---

## 1. Data model split — Textures and Shapes are now two independent, combinable settings

**This changes section 1 of the original implementation directive.** Michael's decision: the Customize → Layout Style picker splits into **two separate sections — Textures and Shapes** — each independently selectable and combinable (e.g. a player can run Hazard Edge's shape *and* Rust Patina's texture at the same time, or either alone, or neither).

**Data model:** replace the single `layoutStyle` profile key with two independent keys:
- `layoutShape` (default `"default"` = no shape treatment, current production rectangle)
- `layoutTexture` (default `"default"` = no texture treatment, flat card background)

Both apply via separate body attributes, same scoping pattern theme selection already uses:
- `body[data-layout-shape="..."]`
- `body[data-layout-texture="..."]`

**Why two independent attributes and not one combined key:** they need to compose freely without the CSS for one fighting the CSS for the other. A shape rule should only ever touch `clip-path`/border/outer silhouette; a texture rule should only ever touch the card's background layer. As long as each stays in its own lane, any shape can pair with any texture with zero extra combinatorial CSS.

**UI:** the Customize modal's Layout Style tab becomes two galleries (reuse the existing `renderLayoutStyleGallery`-equivalent pattern, just parameterized by which data set it's rendering) — a Textures gallery and a Shapes gallery, each with its own live preview cards in the current theme's colors, same interaction pattern as Profile Border. Neither gallery depends on a selection in the other.

**Font settings (Setting A/B from the original directive) stay exactly as they are** — unaffected by this split, still their own independent layer.

---

## 2. Shapes — 16 approved total, 10 already shipped, 6 new (plus the Scope Vignette gap from section 0)

**Already shipped, no changes needed:** Honeycomb, Chevron Scan, Aperture Cut, Hazard Edge, Diamond Facet, Blade Wedge, Ribbon Banner, Monolith Slab, Pixel Dialogue (9 — plus Scope Vignette per section 0, making 10).

**6 new shapes to add**, each with its exact source and technique:

| Key | Label | Source | Technique |
|---|---|---|---|
| `spearhead` | Spearhead | `docs/design/layout-styles-v7-2026-07-17.html` concept S02 | `clip-path: polygon(...)`, single-point arrow silhouette |
| `cargocrate` | Cargo Crate | `docs/design/layout-styles-v7-2026-07-17.html` concept S06 | `clip-path: polygon(...)` even octagon + tileBevel filter + 4 rivet dots |
| `battleplate` | Battle-Worn Plate | `docs/design/layout-styles-v9-2026-07-17.html` concept #01 | Hand-plotted CSS `path()` with two distinct irregular corner chips + tileBevel filter — **important implementation note learned the hard way**: apply `clip-path` directly to the same element carrying `filter:url(#tileBevel)` (i.e. both on `.tile-flat`/`.tile-bevel` themselves), never only on an ancestor — applying it to a parent while the filtered child has no clip-path of its own let the filter's extended render region (`x:-30% y:-30% width:160% height:160%`) bleed a visible dark artifact past the intended silhouette in testing. |
| `steelrivetframe` | Steel Rivet Frame | `docs/design/layout-styles-v11-2026-07-17.html` concept #02 | **Rim+face two-layer technique** (see section 2a) — octagonal face + slightly larger offset octagonal rim with 4 corner rivets |
| `prismrim` | Prism Rim | `docs/design/layout-styles-v11-2026-07-17.html` concept #03 | Rim+face technique — faceted diamond-cut face + a conic-gradient rim for a light-catching crystalline edge |
| `hazardrim` | Hazard Rim | `docs/design/layout-styles-v11-2026-07-17.html` concept #05 | Rim+face technique — angled-cut face + a repeating hazard-stripe rim instead of a metal gradient |

### 2a. The rim+face technique — new to the shape system, read this before building the 3 rim shapes

This is a genuinely different construction from every shape shipped so far, and it's not invented — it's adapted from a **real, previously-built system already in this codebase**: `body[data-theme="reaver"]` in `public/app.css:23941-24152`, currently dormant because `THEME_BUILDER_LAUNCH_LOCKED = true` (`app.js:19981`) disables the internal tool that exposes it. That original CSS is a full theme, not a modular Layout Style, and uses a hardcoded purple/gold palette — **don't wire the Layout Style shapes to that dormant CSS directly, and don't flip the lock flag.** The technique is what's being reused, recolored entirely to the app's live tokens, built as new, independent Layout Style rules.

The technique itself: two stacked, offset, irregular `clip-path` polygons instead of one shape with a border.
- **Face** (front layer): the card's own irregular silhouette, holding the actual background color/gradient.
- **Rim** (behind layer, `inset` slightly negative so it's larger than the face and peeks out around every edge): a second, separately-shaped polygon with its own lighter/metallic gradient (or in Hazard Rim's case, a stripe pattern), sitting visually behind the face so only its edge is visible as a frame.

Verified working reference implementation for all 3: `docs/design/layout-styles-v11-2026-07-17.html`, `.frame-rim`/`.frame-face` CSS classes plus each concept's inline styles (concepts #02, #03, #05 specifically — #01 Gothic Rim and #04 Runic Band Frame were both rejected, don't build those).

---

## 3. Textures — 12 approved, a new gallery, none built yet

All 12 need to be added as new `layoutTexture` values. Every texture is a **full-card-surface treatment** (a background layer covering the entire card at low opacity, positioned behind the text layer via z-index — never a corner accent). Source files and exact concepts:

| Key | Label | Source |
|---|---|---|
| `carbonweave` | Carbon Weave | `docs/design/layout-styles-v6-2026-07-17.html` T01 |
| `circuitplate` | Circuit Plate | `docs/design/layout-styles-v6-2026-07-17.html` T02 |
| `topocontour` | Topo Contour | `docs/design/layout-styles-v6-2026-07-17.html` T03 |
| `frostfracture` | Frost Fracture | `docs/design/layout-styles-v6-2026-07-17.html` T06 |
| `blueprintgrid` | Blueprint Grid | `docs/design/layout-styles-v6-2026-07-17.html` T08 |
| `brushedplate` | Brushed Plate | `docs/design/layout-styles-v6-2026-07-17.html` T09 |
| `hexarmor` | Hex Armor | `docs/design/layout-styles-v6-2026-07-17.html` T10 |
| `chainmesh` | Chain Mesh | `docs/design/layout-styles-v7-2026-07-17.html` T02 |
| `thermalvision` | Thermal Vision | `docs/design/layout-styles-v7-2026-07-17.html` T03 |
| `wovencable` | Woven Cable | `docs/design/layout-styles-v7-2026-07-17.html` T07 |
| `rustpatina` | Rust Patina | `docs/design/layout-styles-v8-2026-07-17.html` T03 |
| `frostedglass` | Frosted Glass | `docs/design/layout-styles-v8-2026-07-17.html` T06 |

**Apply to the same content-card list already approved for shapes** (section 4 of the original directive — Insights, Home, Stats, Logging, Library cards). Each texture's CSS is a `background`/`::before` layer only — verify none of them touch `border`, `clip-path`, or `box-shadow`, since those properties belong exclusively to the Shapes system and must stay untouched so the two compose cleanly.

---

## 4. MANDATORY verification, same discipline as every prior phase

1. **Composability check, the main new risk this phase introduces:** pick at least 3 shape+texture combinations (e.g. Steel Rivet Frame + Rust Patina, Prism Rim + Frosted Glass, Diamond Facet + Hex Armor) and confirm both render correctly together — no property collisions, no visual fighting, text still fully legible in every combination tested.
2. Confirm `layoutShape:"default"` + `layoutTexture:"default"` (both defaults) is pixel-identical to current production.
3. Every new shape and texture checked against at least two themes (Default + one premium) for zero hardcoded color leakage.
4. Text-fit verification (per the existing mandatory gate from the original Phase 2 directive) on every new shape and texture — screenshot each with the shortest and longest realistic real content, confirm no clipping.
5. Confirm Scope Vignette (section 0) actually renders now and wasn't silently broken for a reason that explains why it got skipped the first time.
6. Confirm the Customize UI's two galleries (Textures, Shapes) each persist their own selection independently per profile — reload, reopen, switch profiles, confirm neither setting resets the other.
7. `node --check` on every touched file; run the full existing visual-audit suite before deploying.
8. Bump the cache key in `public/index.html`.
