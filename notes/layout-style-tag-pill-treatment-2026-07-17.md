# Layout Style — Tag/Pill Treatment for the Small Category Badges (2026-07-17)

Michael's ask: the small category tooltip/tag boxes — "Watch", "Strength", "Confidence: High", "As of Patch X", etc. — currently get **no Layout Style treatment at all**. This adds a third, purpose-built tier for them. Read this alongside `notes/layout-style-overreach-fix-2026-07-16.md` first — that note is the reason this has to be its own tier, not a copy of the card tier or the compact-control tier.

---

## 1. Confirmed elements — real classes, not guesses

These are every small status/category badge in the app that matches what Michael described, confirmed in the actual render code:

| Element | What it shows | Selector | file:line |
|---|---|---|---|
| Insight type tag | "GOOD" / "BAD" / "WARN" | `.insight-tag` | `app.js:18712` |
| Insight meta pills | "Watch Priority", "Confidence: High", "Focus Category: ..." | `.insight-meta-pill` | `app.js:51041-51043` |
| Insight source chips | citation tags in expanded insight detail | `.insight-source` | `app.js:18737`, `51059` |
| Home confidence pill | "Confidence: High/Medium/Low" | `.weekly-focus-confidence` | `app.js:50201` |
| Trend signal tone label | "Watch" / "Strength" | `.trend-signal-tone` | `app.js:10613` |
| Library patch tag | "As of Patch X" / "Active season" | `.gamesense-patch` | `gamesense-library.js:514,565,670` |
| Stats trend tone pill | tone label in compact trend cards | `.stats-trend-tone` | already referenced at `layout-styles.css:398` |
| Stats out-of-season badge | "Out-of-Season" | `.stats-map-out-badge` | `app.js:50506` |

These are the only elements this directive targets. Don't fold in `.insight-label` ("WHAT"/"WHY"/"ACTION" section captions) — those are field labels, not category/status badges, different job, leave them alone unless Michael asks separately.

---

## 2. Why this needs its own tier — don't reuse Tier 1 or Tier 2 as-is

`public/layout-styles.css` currently has two tiers (see the overreach-fix note for the full story of why):
- **Tier 1** (`layout-styles.css:255-308`) — full card treatment: `clip-path`, border, background, shadow, and safe-padding sized for full cards (10-32px). **Do not apply this tier's values to these tag elements** — a tag/pill is maybe 18-26px tall; card-scale padding and clip insets would immediately cut off or crush the text inside it, which is the exact bug that was just fixed for cards and would just reappear here at pill scale.
- **Tier 2** (`layout-styles.css:319-351`) — compact controls get *no* visual change beyond a `clip-path:none` reset, plus a thin active-state underline for filter/tab buttons. That's intentionally near-invisible because those are buttons a user operates, not content to showcase.

These tags are neither — they're small, static, read-only badges. They deserve a **real but small-scale decorative echo** of each style's identity: enough that switching Layout Style visibly changes them too (per Michael's ask — "add new styling," not "leave them out"), but scaled correctly so text never gets cramped. Build a **third custom-property tier**, e.g. `--layout-tag-clip`, `--layout-tag-border-color`, `--layout-tag-background`, `--layout-tag-shadow`, mirroring the existing `--layout-surface-*` pattern structurally, but with values sized for an ~18-26px-tall pill, not a card.

---

## 3. Per-style direction — small-scale echo of each card style, not a shrunk copy of its exact values

For each of the 10 styles, give the tag a small, recognizable echo of that style's card treatment — pick a technique proportional to the pill's size, not the literal pixel values used on cards:

| Style | Suggested tag treatment |
|---|---|
| Honeycomb Panel | tiny hex-notch clip on both ends (2-4px insets, not 14px) |
| Chevron Scan | thin 2px left accent stripe (not 5px), no repeating background |
| Aperture Cut | tiny corner clip on one or two corners (3-4px, not 12-18px) |
| Scope Vignette | fully rounded pill with a faint 1px center accent line |
| Hazard Edge | thin 2-3px left stripe, optionally a much finer repeating diagonal (2-3px repeat, not 7px) |
| Diamond Facet | small pointed ends (chevron-style pill, not full facet cuts) |
| Blade Wedge | one angled-cut corner only, small scale |
| Ribbon Banner | tiny folded-corner nub in one corner, scaled to the pill |
| Monolith Slab | solid fill, 1px border, tiny 2px offset shadow (not 6px) |
| Pixel Dialogue | 2px stepped border, tiny 2px offset shadow (not 4px border / 6px shadow) |

These are directional, not exact CSS — use judgment scaling each down proportionally, the point is "recognizably the same style family, correctly sized," not "identical shape at 1/6 scale" (some of these, like Diamond Facet's full facet cut, simply don't work at pill scale and need a simplified version, like the pointed-ends approach suggested above).

---

## 4. Hard constraints carried over from the rest of Layout Style — still binding

- Color-neutral: only `var(--accent)`, `var(--accent-2)`, `var(--card)`, `var(--card-2)`, `var(--text)`, `var(--muted)` — same rule as every other tier, no exceptions for tags.
- Don't touch the tone-based semantic coloring these already have (`.insight-tag` red/amber/green by type, `.trend-signal-tone` by tone, etc.) — the Layout Style treatment adds shape/border/shadow on top of the existing tone color logic, it doesn't replace it. Verify both systems still combine correctly (e.g. a "BAD" tag under Diamond Facet should still read red-toned AND show the diamond-point ends).
- Nav bar and real chart/meter SVGs remain untouched — not applicable here since none of these 8 elements live in either, but keep the rule in mind if any of them turn out to nest inside an excluded component.

---

## 5. MANDATORY verification — same discipline as the card-tier text-fit gate

This is a small-element treatment going in right after a small-element treatment (Tier 2's active-underline) had to be walked back for being too heavy — don't repeat that mistake at pill scale. Before reporting this done:

1. Screenshot every one of the 8 elements in section 1, under all 10 styles, with their real shortest and longest actual content (e.g. `.insight-meta-pill` ranges from "High" to "Focus Category: Aim Discipline" — check both extremes, not just one).
2. Confirm zero text clipping, zero cramped/illegible text, at both extremes, for all 10 styles — visually inspect the screenshots, don't just assert no console errors.
3. Confirm the existing tone-based coloring (good/warn/bad, etc.) still renders correctly alongside the new shape/border treatment — this is a combination of two systems, verify they don't fight each other.
4. Confirm Default layout style (no attribute) is pixel-identical to current production — this tier must be fully opt-in like every other tier.
5. Check against at least two themes (Default + one premium) for zero hardcoded color leakage, same as every other tier.
6. `node --check` passes; run the full existing visual-audit suite before deploying.
7. Bump the cache key in `public/index.html`.
