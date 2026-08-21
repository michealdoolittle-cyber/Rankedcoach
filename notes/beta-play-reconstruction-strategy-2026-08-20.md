# Beta Play — Phased Reconstruction Strategy (2026-08-20)

**Recommended Codex settings for every task below: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

## Why this document exists

Codex has now had three correction rounds on the Play page and keeps failing the same way: it edits on top of the existing implementation instead of restructuring around the approved raster, so fixes don't stick (the Compass still isn't rebuilt after being flagged twice; Top Insight's bare-stat-label bug survived an entire round unfixed) and required content goes missing rather than getting rebuilt (Key Takeaways panel, Last Match stat strip, per-pillar sparklines all vanished somewhere in the process). Confirmed root cause: `beta/public/js/play/play-page.js` (1108 lines) and `beta/public/css/play.css` (2360 lines) are both single monolithic files with no per-card separation — every "small" change is a change to one giant file, which is exactly the condition that produces this failure pattern.

**The fix is process, not another content directive.** Everything Codex needs to know about *what* each card should contain already exists across `beta-play-approved-raster-directive-2026-08-20.md`, `beta-play-amendment-2026-08-20.md`, and the three correction rounds. This document sequences *how* to build it: skeleton first, real data wired into the skeleton second, each card rebuilt independently third, styling fourth, screenshot correction loop fifth. **Do not hand Codex this whole document as one task. Send one numbered task at a time, verify its stop condition actually holds, then send the next.**

**Non-negotiable across every task below:**
- The approved raster (`notes/assets/play-approved-raster-2026-08-20.png`) is the visual target. The current beta application is the functional/data source. Never invent example values — real data only.
- The left sidebar/navigation is out of scope visually — do not touch it.
- Every task has an explicit stop condition. Do not proceed to the next task until the current one's stop condition is verifiably true.
- Test viewport: 1920×1080, per established project convention.

---

## Task 1 — Skeleton only

**Objective:** replace Play's current content composition with a new structural shell matching the raster's macro layout. No real content, no restyling of existing cards, no artwork, no data logic changes — geometry only.

**Files to inspect:** `beta/public/js/play/play-page.js` (current render structure), `beta/public/css/play.css` (current grid/layout rules).

**Files expected to change:** `beta/public/css/play.css` (add a new grid shell, e.g. `.play-dashboard-v2`), `beta/public/js/play/play-page.js` (only enough markup to place 8 empty named regions — no card content yet).

**Named regions required:** `focus`, `timeline`, `loadout`, `compass`, `rank-summary`, `rr-trend`, `top-insight`, `quick-actions`.

**Target layout (tune exact spans/row-heights against the raster, this is a starting point):**

```css
.play-dashboard-v2 {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-template-areas:
    "focus focus focus focus focus timeline timeline timeline timeline timeline timeline timeline"
    "loadout loadout loadout compass compass rank rank rank rank rank rank rank"
    "trend trend trend trend trend insight insight insight insight insight insight insight"
    "quick quick quick quick quick quick quick quick quick quick quick quick";
}
```

**Behaviors that must remain untouched:** all existing Riot sync/data logic, routing, `ensureDailyFocus`/`getPriorityInsight` calls (they can still run, their output just isn't rendered into the new shell yet).

**Stop condition:** a screenshot of the empty shell already matches the raster's row proportions, column proportions, card placement, and overall spacing — even with every region empty. Do not proceed to Task 2 until this is visually confirmed at 1920×1080 against `notes/assets/play-approved-raster-2026-08-20.png`.

---

## Task 2 — Wire existing real data into the skeleton

**Objective:** attach real application data to each of the 8 regions from Task 1. No visual redesign yet — plain content is fine, it just has to be real.

**Data source per region:**

| Region | Reuse this exact logic |
|---|---|
| `focus` | `ensureDailyFocus(appState, model)` — the public entry point in `beta/public/js/play/play-page.js:240`. Do not call the private `getDailyFocus`/`focusPool` directly from elsewhere; go through `ensureDailyFocus`. |
| `timeline` | The existing 5-pillar values (Mechanics/Aim, Game Sense, Teamwork, Discipline, Mental) already computed elsewhere in `play-page.js`. |
| `loadout` | **Passive placeholder only** — do not wire the generator here. See Task 3C. |
| `compass` | The same 5 pillar values as `timeline`, feeding a radar (real rebuild happens in Task 3D). |
| `rank-summary` | Existing rank/RR model data, plus the real rank icon system (`getRankIconUrl()`, `public/app.js:~27101`) and real role icon system (`ROLE_ICON_MAP`, `public/app.js:24993`). |
| `rr-trend` | Existing RR trend data source. **Known bug to watch for while wiring this**: round 3 found the live RR Trend chart has a flat dead zone and wildly inconsistent x-axis date spacing (a 7-month gap, then 2-month, then 4-day) — if that's a data-wiring issue, it should surface and get fixed here, before Task 3F's visual rebuild. |
| `top-insight` | `getPriorityInsight(model)` — `beta/public/js/model/insights.js:66`. This is shared with Review, do not fork a Play-specific copy. |
| `quick-actions` | Existing routes/actions — but see Task 3H for the exact 5 items required; don't wire the current (wrong) item set, wire the correct one now if straightforward. |

**Files expected to change:** `beta/public/js/play/play-page.js` only.

**Stop condition:** all 8 regions show real, live application data (not placeholder text) while the Task 1 skeleton's structure is otherwise unchanged. A screenshot at this point will look like "correct proportions, wrong/no styling" — that's expected and correct for this stage.

---

## Task 3 — Rebuild each card independently (8 separate sub-tasks, one at a time)

**Do not combine these. Each is its own Codex task with its own stop condition.** For every sub-task: reuse the data wiring from Task 2, rebuild only that card's markup/CSS, do not touch any other region.

### 3A — Today's Focus

Requirements (raster Section 9 + round 3 findings):
- Eyebrow "TODAY'S FOCUS" + a small "CORE FOCUS" chip next to it.
- Focus statement as the dominant headline, **sentence case** (raster: "Stop taking isolated first fights." — not all-caps; round 3 found the live build wrongly renders this in all-caps).
- Confidence/Impact as two separate labeled stat blocks — a "CONFIDENCE" label over the percentage, an "IMPACT" label over the tier word — not a compact icon+pill combo squeezed onto the title's line.
- Concise evidence/explanation text ("Why this matters") — round 3 found this may be missing from render entirely; confirm it's actually in the DOM.
- Large agent artwork, right-aligned, **faded into the card with no visible rectangular edge** (round 3 found a hard-edged boxed image — this is an explicit raster requirement, not optional polish). ~40-42% width, ~110-115% card height, gradient mask toward the copy, restrained purple glow.
- "View Focus Details" button — round 3 found this may be missing from render; confirm it's present and routes to the merged Focus Details panel (per `beta-play-amendment-2026-08-20.md` Resolution 2).

**Stop condition:** screenshot of just this card, cropped, matches the raster's Today's Focus crop — sentence-case title, labeled stat blocks, evidence text visible, button visible, art with no visible edge.

### 3B — Improvement Timeline

Requirements: 5 coordinated pillar tiles (not 5 unrelated KPI cards), each with icon (from `beta-icon-set-2026-08-20.md`), label, score, delta, **and a mini sparkline** — round 3 found sparklines missing entirely from the live build despite this being an explicit requirement. Reuse the Game Stats strip's existing working sparkline component rather than rebuilding one. Semantic green/red for direction. Pending/skeleton state for insufficient data, not removal. "View Full Timeline" link.

**Stop condition:** all 5 tiles show a visible trend line, matching the raster's density.

### 3C — Loadout placeholder

**Already confirmed correct — the orbital animated icon is right, don't touch it.** Requirements for the rest of the card: no Role/Agent/Map selectors, no Generate/Spin controls on this dashboard card. Per `beta-play-amendment-2026-08-20.md` Resolution 3, this card **does** keep an active "Start A Match" button (overriding the base raster directive's "fully passive" instruction) — that part is already built correctly. Copy: "Select 'Play A Match' to receive your personalized focus, agent and role."

**Stop condition:** no functional change needed if the current build already matches — verify against the raster's card proportions and copy only.

### 3D — Compass

**This needs a full rebuild, not a tweak — round 3 found the current composition doesn't match the raster's actual structure at all.** The raster does not use boxed pillar tiles next to a small radar. It uses **one large five-axis radar chart with axis labels and numeric values integrated directly onto the chart geometry** — each pillar's name and score sit right next to its own point on the radar, not in a separate row of cards. Replace whatever CSS-diamond or boxed-tile-plus-small-radar exists with a real inline SVG radar: 5 axes, polygon grid rings, data polygon, node markers, labels+values positioned at each axis point, live pillar data, "View Compass Breakdown" link.

**Stop condition:** screenshot crop of this card shows one large radar as the dominant element with labels/values on the chart itself, matching the raster's proportions — not a small radar beside separate boxed tiles.

### 3E — Current Rank / Match Summary

Requirements: real rank emblem + rank name + current RR as a prominent block. Read-only Wins/Losses/Draws (no manual controls, no Undo). "Impact (Current Role)" using the real role icon system + role label. **A full 5-column Last Match strip: K/D/A, KAST, ADR, ACS, HS%** — round 3 found the live build replaced this with a condensed 1-stat combo box, showing only ACS. Rebuild the full 5-column strip. "View Match History" link.

**Stop condition:** all 5 Last Match stat columns are visible and populated with real data.

### 3F — RR Trend

Requirements: rank emblem/name/current RR, recent RR line chart, W/L/D markers if available, no percentage-growth clutter (per amendment Resolution 1 — RR values get an explicit "RR" suffix, no percentage anywhere), link to RR Calculator. **If Task 2's data wiring didn't already fix the flat-dead-zone/inconsistent-date-spacing bug, it must be fixed here before any visual polish** — a chart with broken data is not a styling problem.

**Stop condition:** chart renders a continuous, sensible line with evenly-reasoned date spacing on the x-axis; no percentage shown anywhere on the card.

### 3G — Top Insight

Requirements: **headline must be a written coaching conclusion sentence** (e.g. raster's "Your crosshair placement is winning you more fights.") — round 3 found the live build still shows a bare stat label ("Sova Win Rate") despite this being flagged in round 2. This is the second time this exact bug needs fixing; verify it actually changes this time, don't just re-apply the same fix that didn't stick. Supporting explanation sentence (not a raw stat comparison). Impact + Confidence. **A "Key Takeaways" side panel with ~4 bullet points** — round 3 found this missing entirely from the live build, it's required raster content, not optional. "View All Insights" link.

**Stop condition:** headline reads as a sentence, not a stat name; Key Takeaways panel is visible with real bullet content.

### 3H — Quick Actions

Requirements: **exactly 5 items — Play A Match, Review Match, Practice, Study a Map, Strategy Library** — round 3 found the live build shows 4 different generic nav shortcuts (Review/Library/Learn/Settings) instead. Rebuild to the correct 5. Reuse existing destinations under the hood where they map cleanly (e.g. "Study a Map" → Learn's map content), but the tile labels/icons must be the specified 5, not a re-listing of sidebar nav. "Play A Match" is the pipeline's primary entry point — same destination as the Loadout card's "Start A Match" button is fine, this is meant to be a redundant entry point, not a duplicate bug.

**Stop condition:** exactly 5 tiles, matching the raster's specified labels.

---

## Task 4 — Global styling harmonization

**Objective:** only after all 8 cards are structurally correct (Task 3A-3H stop conditions all verified), pass over the whole page applying one consistent visual system.

Tokens (starting point, tune via screenshot comparison):

```css
--rc-canvas: #070b12;
--rc-surface-1: #0e1622;
--rc-surface-2: #121c2a;
--rc-surface-3: #172234;
--rc-border-subtle: #223047;
--rc-border-strong: #37465e;
--rc-text-primary: #f6f8fc;
--rc-text-secondary: #b8c1d1;
--rc-text-muted: #7c889c;
--rc-brand: #8b5cf6;
--rc-brand-strong: #a78bfa;
--rc-brand-deep: #5b21b6;
--rc-review: #4fd1b5;
--rc-success: #4ade80;
--rc-danger: #f87171;
--rc-warning: #fbbf24;
--rc-info: #60a5fa;
--rc-grid-gap: 12px;
--rc-radius-md: 10px;
```

Avoid: giant SaaS whitespace, huge rounded cards, cyan-everything (round 1/2 found real drift toward amber where purple was specified — audit for this specifically), all-uppercase UI, equal-width cards, excessive blur/glow.

**Files expected to change:** `beta/public/css/play.css` broadly, plus small icon-sprite additions per `beta-icon-set-2026-08-20.md`.

**Stop condition:** full-page screenshot at 1920×1080 shows one consistent design language across all 8 cards — no card visually reads as belonging to a different system than the others.

---

## Task 5 — Screenshot comparison and correction loop

**Objective:** the mandatory iterative loop, run to convergence, not attempted once.

```
APPROVED RASTER → IMPLEMENTATION → SCREENSHOT → SIDE-BY-SIDE COMPARISON →
LIST NAMED DIFFERENCES → CORRECT → SCREENSHOT AGAIN → REPEAT
```

Follow the concrete 5-step process already specified in `beta-play-amendment-2026-08-20.md` (render at 1920×1080 using the existing `testing/visual-audit/audit.js` Playwright pattern, save the screenshot as a real file, place it next to `notes/assets/play-approved-raster-2026-08-20.png`, crop to individual cards where useful, list specific named differences — not "looks close"). Correction priority order: overall composition → row heights → card widths → artwork scale/crop → typography hierarchy → chart sizing → internal padding → spacing → borders/colors → micro-details. Do not spend time on 1px border tweaks while anything above it on this list is still wrong.

**Stop condition:** the named-differences list is empty, or every remaining item has a stated reason (a real data/behavior constraint) documented in the completion report rather than silently dropped.

---

## Recommended code structure (apply if safe, don't force it)

Given `play-page.js` (1108 lines) and `play.css` (2360 lines) are both monolithic — this is very likely *why* changes keep failing to stick. If it can be done without regressions, split toward:

```
beta/public/js/play/
  play-page.js          (orchestration only)
  play-dashboard.js
  focus-card.js
  timeline-card.js
  loadout-placeholder.js
  compass-card.js
  rank-summary-card.js
  rr-trend-card.js
  top-insight-card.js
  quick-actions.js

beta/public/css/play/
  play-layout.css
  play-focus.css
  play-timeline.css
  play-loadout.css
  play-compass.css
  play-rank.css
  play-insight.css
```

If splitting genuinely risks regressions given time constraints, keep the physical files but enforce equivalent *logical* separation internally (clearly bounded functions/sections per card) — the goal is that no single change can silently mutate an entire 2360-line stylesheet or 1108-line renderer without anyone noticing which card it touched.

## Negative constraints (apply to every task above)

- Do not redesign the sidebar.
- Do not modify Riot API behavior, persisted account data, or route semantics.
- Do not reintroduce manual Win/Loss/Draw controls or Undo.
- Do not put the full Loadout generator on the default Play dashboard.
- Do not retain a CSS-diamond Compass.
- Do not make all cards equal width.
- Do not replace agent artwork with a generic icon.
- Do not invent new percentage metrics beyond what's specified.
- Do not merge Play and In-Game into one state.
- Do not declare any task complete without the screenshot comparison its stop condition requires.
