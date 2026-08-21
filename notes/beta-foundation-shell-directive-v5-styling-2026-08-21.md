# Beta Foundation Shell — Directive v5: Apply Obsidian Dark Styling (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: open — not started. Read this alongside `notes/beta-foundation-shell-directive-v4-2026-08-21.md`, which stays authoritative for content, structure, and button-wiring. This file does not supersede v4 — it adds the visual styling layer v4 didn't cover.**

## Why this file exists

Every prior directive in this project (back to the original teardown) treated visual styling as a later phase: "Once the pages are built we add the styling elements back in." Michael's instruction now: **"This foundation is to include styling, that being the dark obsidian like nature of the previous rasters."** That collapses the planned two-pass approach (structure now, styling later) into one pass. Treat this as a hard requirement, not optional polish — build every section from v4 already styled, don't build flat/dashed placeholders with a mental note to style them afterward.

## What changes

Every card/panel/region specified in v4 needs real Obsidian-dark styling as it's built:
- **Solid surface backgrounds** using the existing `--rc-surface-1` / `--rc-surface-2` / `--rc-surface-3` tokens — not a flat dashed-border box.
- **Rounded corners**: 12px for cards, 8px for chips/pills/badges.
- **Soft borders**: `--rc-border-subtle`, with a stronger `--rc-border-strong` for emphasis where it's already used (active nav states, etc.).
- **Subtle glow/gradient for depth** on emphasized elements — hero cards (Today's Focus, Current Read Hero, Pipeline preview), active/selected states, primary buttons.
- **Purple brand color** (`--rc-brand` / `--rc-brand-strong`) as primary, plus the semantic section accents already defined: `--rc-review` (teal), `--rc-learn` (gold), `--rc-library` (purple), `--rc-success` (green), `--rc-danger` (red), `--rc-warning` (amber), `--rc-info` (blue).
- **Typography hierarchy with strong contrast**: keep the existing Barlow Condensed (display/headlines) + Inter (body) pairing already in the file — headline weight/size clearly distinct from body and label text.

This exact language comes directly from the source: the "THEME NOTES" panel in `notes/assets/groups-1-7/curated/Common-Icons.png` reads: *"Deep dark surfaces with soft inner borders · Purple primary, teal accents, success green, loss red · Clean typography hierarchy with strong contrast · Consistent rounded corners (12px cards, 8px chips) · Subtle glows and gradients for depth."*

**Don't invent a new palette or token system.** The CSS tokens already declared in `notes/previews/beta-foundation-shell-reference-2026-08-20.html` already match this spec closely (dark canvas, purple brand, teal/gold/purple section accents) — they've just never actually been applied to anything beyond the sidebar and nav chrome. The whole job here is applying the tokens that already exist, properly, to every card and component v4 specifies.

## What doesn't change

- Still no live account/API data — all content stays invented/example, exactly per v4's fidelity standard.
- Still not claiming pixel-perfect production-final polish — exact spacing, final icon artwork, agent photography, and animation refinement can stay rough. The bar is "recognizably the real dark Obsidian app," not "indistinguishable from final production."
- The dashed-border `.skel` treatment isn't banned outright — it's fine to keep using it narrowly to flag a region that's genuinely still undecided (anything v4 marked **[Claude's call]** with low confidence). It should no longer be the *default* look for everything, though — that's the actual change here.

## Reference for the target look

- `notes/assets/play-approved-raster-2026-08-20.png` — the clearest single example of a fully-styled dashboard: real depth, glows, colored icons, not flat boxes. Match this look and feel for every other page.
- `Common-Icons.png`, `All-Component-Examples.png`, `Learn-System-UI.png`, `Pipeline-Profile-Setting.png` (all in `notes/assets/groups-1-7/curated/`) — these show fully-styled real components (buttons, badges, cards, tables). Use them as direct visual reference for the equivalent built components, not just for structure.

## How to build

1. Keep everything in v4 exactly as specified — content, wiring, page order, button destinations.
2. As each section from v4 is built, style it immediately using the token system + Theme Notes spec above. Don't build unstyled placeholders first with a plan to style later — that two-pass approach is exactly what this directive replaces.
3. Verify styling consistency against the Play raster and the sourced component images, not just structural correctness against the text spec.

## Verification addendum

Alongside v4's structural and click-through verification, also visually compare each section's styling against the Play raster's language (dark surfaces, purple glow, rounded cards, colored semantic accents). Flag anything that still reads as a flat gray wireframe rather than a styled dark UI — that's a fail condition now, same weight as a missing section or a dead button.
