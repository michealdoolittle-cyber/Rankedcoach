# RankedCoach Play Page — Approved Raster Reconstruction Directive (2026-08-20)

**Source: pasted directly by Michael, 2026-08-20 — not written by Claude.** Archived here verbatim for the repo record and so Codex has one canonical copy instead of a chat paste. **See `notes/beta-play-amendment-2026-08-20.md` for the 3 explicit resolutions where this document conflicted with prior directives, plus the real rank/role icon sourcing and the finalized Loadout/Focus Details markup.** Read the amendment alongside this document — this file is unmodified from the original paste.

---

CODEX DIRECTIVE — APPROVED RANKED COACH PLAY PAGE RECONSTRUCTION

## Mission

Implement the approved desktop Play page for Ranked Coach.GG.

This is a reconstruction task, not a redesign task. The approved Play raster is the visual source of truth for the Play page's main content area. The current beta application is the source of truth for existing Riot API data, routing, state, calculations, account sync, and working behavior.

Preserve the working product logic. Reconstruct the approved visual composition.

Do not reinterpret the reference into a generic dashboard. Do not simplify it because an existing component is easier to reuse. Do not redesign the left sidebar/navigation; it has been adjusted separately and is outside scope.

The task is not complete merely because every widget exists. It is complete when a screenshot of the rebuilt Play content area closely conforms to the approved raster at the same desktop viewport.

## 1. Scope

Reconstruct the Play main content area:

1. Play header and compact account-sync status.
2. Today's Focus.
3. Improvement Timeline.
4. Passive Loadout placeholder.
5. Five-axis Compass.
6. Current Rank and automatic match-summary card.
7. Rank Rating Trend.
8. Top Insight.
9. Quick Actions.
10. Required SVG/icon/art presentation.
11. Responsive behavior.
12. Existing actions/routes attached to these components.

Out of scope:

- Redesigning the left sidebar/navigation.
- Rewriting Riot ingestion.
- Replacing working routing/state architecture without necessity.
- Redesigning already-approved In-Game, Log Match, or Reflection surfaces.

## 2. Source-of-truth priority

For visual appearance:

1. Approved Play raster.
2. Ranked Coach Design Philosophy / Visual Language guide.
3. Existing beta CSS.

The raster wins for layout, proportions, hierarchy, spacing, card relationships, artwork placement, density, typography scale, component composition, accent placement, chart sizing, and surface treatment.

For functionality/data:

1. Existing beta application logic.
2. Existing Riot API/model/state pipeline.
3. Existing routes/actions.
4. Concept raster.

The application wins for real values, account state, calculations, match ingestion, routes, persistence, and API behavior. Never copy example values from the raster into production.

## 3. Non-negotiable rule

DO NOT REDESIGN THE APPROVED RASTER. RECONSTRUCT IT.

Unacceptable substitutions include:

- Same information in a different layout.
- Equal-width generic dashboard cards.
- Generic SaaS styling.
- Oversized empty panels.
- Replacing agent artwork with an icon because it is easier.
- Moving major cards to different rows.
- Restoring Loadout generation controls to the default dashboard.
- Turning Riot-synced match counts into manual buttons.
- Retaining the old CSS Compass.
- Adding percentage changes where the approved design deliberately removed them.

Visual conformance is part of acceptance.

## 4. Page purpose and flow

The default Play page is the player's home base between matches. It answers:

What am I working on, how am I progressing, and what should I do before my next match?

It is not the In-Game screen.

Expected lifecycle:

DEFAULT PLAY → PLAY A MATCH → PRE-GAME / GENERATED ASSIGNMENT PIPELINE → START MATCH → IN-GAME → LOG MATCH → REFLECTION → RETURN TO DEFAULT PLAY

The default dashboard provides coaching context and progression without exposing the full In-Game interface.

## 5. Visual hierarchy

The page should read in this order:

1. Today's Focus.
2. Improvement Timeline.
3. Loadout / Compass / Current Rank.
4. Rank Rating Trend / Top Insight.
5. Quick Actions.

Do not make the page feel like nine equal cards.

## 6. Macro geometry

Use CSS Grid for the major composition. Do not absolutely position the entire page.

Conceptual layout:

PLAY + compact Account Sync

ROW 1: Today's Focus | Improvement Timeline

ROW 2: Loadout | Compass | Current Rank / Match Summary

ROW 3: Rank Rating Trend | Top Insight

ROW 4: Quick Actions

Prefer named grid areas. Tune spans and row heights against the approved raster. Preserve its asymmetry rather than converting the layout to a generic equal-card grid.

## 7. Base visual system

Use the established Ranked Coach visual language. Starting tokens:

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
--rc-learn: #f5c451;
--rc-success: #4ade80;
--rc-danger: #f87171;
--rc-warning: #fbbf24;
--rc-info: #60a5fa;
--rc-page-padding: 16px;
--rc-grid-gap: 12px;
--rc-radius-sm: 7px;
--rc-radius-md: 10px;
--rc-radius-lg: 14px;
```

These are controlled starting values. Tune them through screenshot comparison rather than inventing a second design system.

Cards use near-black/navy surfaces, thin low-contrast borders, roughly 10px primary radii, restrained shadows, compact padding, and selective glow.

Avoid giant SaaS radii, heavy cyan outlines, excessive glass blur, glowing every card, and unused empty space.

## 8. Play header

Left: PLAY

Supporting copy: Improve. One match at a time.

Right: compact account-sync state such as Up to date, Syncing, Data stale, or Sync failed.

If manual refresh remains necessary, expose it as a compact secondary control. Do not restore the large beta account-sync hero panel.

## 9. Today's Focus

This is the dominant coaching card.

Required:

- TODAY'S FOCUS eyebrow.
- Optional focus category.
- Focus statement.
- Concise evidence/explanation.
- Confidence.
- Impact.
- Large agent artwork.
- View Focus Details.

The focus statement is the largest content. Confidence and Impact are compact supporting signals.

Use approved production Riot agent artwork. Present it editorially on the right, larger than a normal portrait, faded into the card, without a visible rectangular edge, while protecting copy space on the left. Use restrained purple lighting/glow.

A useful implementation starting point is an absolutely positioned image inside the card with bottom-right anchoring, object-fit: contain, approximately 40–42% width, approximately 110–115% card height, subtle contrast/saturation treatment, drop shadow, and a mask gradient that fades the image toward the copy.

Preserve existing Focus Details behavior if it already works.

## 10. Improvement Timeline

Show five persistent coaching pillars:

1. Mechanics / Aim.
2. Game Sense.
3. Teamwork / Communication.
4. Discipline.
5. Mental.

Each compact pillar shows:

- Category SVG icon.
- Category label.
- Current score.
- Directional delta.
- Mini trend line.

These must read as one coordinated component, not five unrelated KPI cards.

Positive movement uses semantic green/teal. Negative movement uses semantic red. Stable is neutral.

If data is insufficient, preserve the category's position and show a Pending/sample/skeleton state instead of removing it.

View Full Timeline routes to the existing Review → Improvement Timeline experience.

## 11. Loadout — default Play state

The default Play page does NOT generate a Loadout.

Remove from this dashboard card:

- Generate Loadout.
- Spin Loadout.
- Role selector.
- Agent selector.
- Map selector.
- Generated assignment controls.

Those belong to the Play A Match / pre-game pipeline.

The dashboard Loadout is a passive visual entry point. Communicate:

Select "Play A Match" to receive your personalized focus, agent and role.

Use a static or lightweight animated Ranked Coach loadout placeholder: geometric cube/loadout mark, thin orbital rings, subtle purple points, optional slow motion, and a static reduced-motion state.

Do not recreate the old generator here.

> **Amended 2026-08-20 — see `beta-play-amendment-2026-08-20.md` Section 3.** Michael explicitly chose to keep an active "Start A Match" button on this card (overriding this section's "passive only" framing), paired with the specific orbital gem+star icon design in the amendment — build that combination, not a purely passive card with no button.

## 12. Compass

Replace the CSS diamond with a real inline SVG five-axis radar.

Pillars:

1. Mechanics / Aim.
2. Game Sense.
3. Teamwork / Communication.
4. Discipline.
5. Mental.

Dashboard treatment includes a five-axis grid, data polygon, node markers, external labels, pillar values, and compact overall-performance framing.

View Compass Breakdown routes to the existing detailed Review/Stats experience.

Provide readable values outside the geometry and do not rely on color alone.

## 13. Current Rank / automatic match summary

This replaces the old manual RR control card.

The dominant rank area shows:

- Real rank emblem.
- Rank name.
- Current RR.

The raster's example values are not production data.

Riot sync supplies read-only counters for:

- Wins.
- Losses.
- Draws.

Remove manual Win/Loss/Draw controls and remove Undo. The dashboard displays synced history; it does not mutate match results.

Impact references the player's current role type, for example Controller. Use the appropriate role icon and label. If a segmented treatment remains, it supports the role presentation rather than implying a user-controlled 1–10 impact value.

The lower Last Match strip may display available synced values such as K/D/A, KAST, ADR, ACS, and HS%. Only use data that actually exists.

View Match History routes to Review → All Matches or the appropriate existing history destination.

## 14. Rank Rating Trend

Show:

- Current rank emblem.
- Rank name.
- Current RR.
- Recent RR line chart.
- Recent W/L/D markers if available.
- Link to RR Calculator / detailed RR experience.

Do not show arbitrary percentage growth or duplicated improvement percentages. Deeper RR calculations belong in the RR Calculator/detail experience.

This card answers: Where is my rank rating moving?

W is green, L is red, D is neutral.

> **Amended 2026-08-20 — confirmed, no conflict.** Michael confirmed dropping the percentage; the only addition is that RR values must always carry an explicit "RR" unit suffix (e.g. "412 RR") since they're never shown as a flat number per the existing directive's rule. See amendment Section 1.

## 15. Top Insight

Show exactly one prioritized takeaway.

Structure:

- TOP INSIGHT eyebrow.
- "Your biggest takeaway" supporting phrase.
- Conclusion.
- Concise explanation.
- Impact.
- Confidence.
- Key Takeaways.
- View All Insights.

The conclusion is the largest content. Do not begin with a chart or turn this into a generic stat grid.

Keep Key Takeaways short and actionable.

View All Insights routes to Review → Insights.

## 16. Quick Actions

Quick Actions are compact subordinate navigation aids.

Approved conceptual actions:

1. Play A Match.
2. Review Match.
3. Practice.
4. Study a Map.
5. Strategy Library.

Reuse existing destinations wherever possible.

Each tile may contain an SVG icon, primary label, small descriptor, and chevron. Do not turn these into another row of large hero cards.

### Play A Match

This begins the pre-game/in-game pipeline.

That pipeline owns:

- Map/role/agent context.
- Loadout generation.
- Generated focus.
- Start Match.
- In-Game state.

Do not move those controls back onto the default Play dashboard.

## 17. SVG/icon rules

Use real SVGs for Ranked Coach-owned UI geometry. Prefer the existing SVG sprite architecture and currentColor.

Do not use emoji, Unicode symbols as permanent icons, mismatched icon libraries, or raster files for simple UI geometry.

Riot-owned rank/agent/game imagery should use approved Riot assets rather than being traced into fake Ranked Coach vectors.

> **Amended 2026-08-20 — sourced.** "Approved Riot assets" for rank and role specifically are the app's real existing hosted images — see amendment Section 2 for exact URLs/functions. For every other icon (Compass pillars, Game Stats, reference sections, Settings, nav), use `notes/beta-icon-set-2026-08-20.md`'s finalized set — do not invent new ones for concepts already covered there.

## 18. Typography

Do not uppercase the entire interface.

Uppercase is primarily for eyebrows, small category labels, and compact metadata.

Use sentence/title case for buttons, navigation, titles, and descriptions.

The focus statement receives the strongest display treatment. Body copy must remain comfortably readable; do not compensate for oversized cards by making text microscopic.

## 19. Motion

Motion communicates state; it is not decoration.

Useful motion includes the subtle Loadout placeholder orbit, selected/hover transitions, chart updates, modal entrance, and data-sync state.

Keep motion fast and controlled. Honor prefers-reduced-motion.

## 20. Preserve working application logic

Before editing, inspect the existing Play renderer, CSS, model/state code, routing, Riot sync, and shared UI components.

Do not rewrite working business logic merely to achieve the visual result.

Prefer:

- Markup restructuring.
- CSS Grid/Flexbox.
- CSS token cleanup.
- SVG replacement.
- Asset presentation.
- Small component extraction.

Avoid unnecessary data-model changes.

If a visual requirement genuinely conflicts with existing behavior, document the conflict before replacing working behavior.

## 21. Do-not-change list

Unless required by a real integration conflict:

- Do not redesign the sidebar.
- Do not change Riot API behavior.
- Do not change account identity logic.
- Do not change match ingestion.
- Do not change persisted data formats.
- Do not change route semantics.
- Do not remove working error/loading states.
- Do not invent new subscription gating.
- Do not alter unrelated Review/Learn/Library pages.

## 22. Visual failure modes to avoid

**Generic SaaS drift** — No huge whitespace, giant rounded cards, one number per massive panel, or generic gray dashboard styling.

**Tracker-site drift** — Do not let statistics replace coaching conclusions.

**Game-HUD drift** — Avoid excessive glow, bevels, noisy backgrounds, or effects that harm readability.

**Card soup** — Do not make every component identical in size and importance.

**Color soup** — Do not invent arbitrary per-card accents. Preserve semantic color meaning.

## 23. Responsive behavior

The approved desktop raster is the visual authority.

At narrower widths, preserve hierarchy and stack intentionally. Do not merely shrink everything.

Maintain Today's Focus prominence, usable Timeline pillars, readable Current Rank, and appropriate Quick Actions.

Do not compromise the approved desktop composition merely to make mobile easier. Mobile has its own established design direction.

## 24. Required implementation process

**Phase 1 — Inspect**: Identify the Play renderer/component, Play CSS, shared primitives, current Compass implementation, rank/RR source, match-count source, Timeline source, Top Insight source, Focus source, relevant routes, and available Riot assets.

**Phase 2 — Macro reconstruction**: Implement page grid, row heights, column proportions, card placement, and major card dimensions. Do not polish icons yet.

**Phase 3 — Component reconstruction**: Rebuild each card to match the approved composition.

**Phase 4 — Visual system**: Apply typography, colors, borders, radii, spacing, artwork, SVGs, and charts.

**Phase 5 — Behavior verification**: Verify existing routes/actions/data still work.

**Phase 6 — Screenshot conformance**: Render at the same viewport as the approved raster. Capture a screenshot. Compare side-by-side or overlay. Identify the largest visual differences. Correct them. Repeat.

## 25. Mandatory screenshot acceptance loop

APPROVED RASTER → IMPLEMENTATION → SCREENSHOT → SIDE-BY-SIDE / OVERLAY COMPARISON → LIST 10 LARGEST VISUAL DIFFERENCES → CORRECT → SCREENSHOT AGAIN → REPEAT

Do not declare completion after the first screenshot.

Prioritize corrections:

1. Overall composition.
2. Card widths/heights.
3. Row proportions.
4. Artwork scale/crop.
5. Hierarchy.
6. Typography.
7. Chart sizing.
8. Spacing.
9. Colors/borders.
10. Micro-details.

Do not tune 1px borders while the grid is still wrong.

## 26. Visual acceptance criteria

The implementation must satisfy all of these:

- Today's Focus is visually dominant.
- Focus artwork has approximately the same visual mass as the raster.
- Improvement Timeline reads as five coordinated pillars.
- Loadout is passive and has no generator controls. *(Amended — see Section 11 note: keep the active Start A Match button.)*
- Compass is a real five-axis SVG.
- Current Rank uses real rank art/name/RR.
- Wins/Losses/Draws are read-only Riot-synced counters.
- Undo is absent.
- Impact communicates current role.
- Last Match metrics are compact.
- RR Trend contains rank context and trend without unnecessary percentages.
- Top Insight is conclusion-first.
- Quick Actions remain subordinate.
- Main cards have similar proportions to the raster.
- Desktop space is used efficiently.
- The page no longer resembles the old beta visual shell.
- Existing data and routes still work.
- Sidebar remains visually untouched.

## 27. Functional acceptance criteria

Verify at minimum:

- Account sync still works.
- Focus data loads.
- Timeline data loads.
- Compass receives live pillar values.
- Current rank/RR comes from the existing model.
- W/L/D counters derive from synced match data.
- Last Match metrics remain data-backed.
- RR Trend remains data-backed.
- Top Insight remains data-backed.
- Focus Details opens/routes correctly. *(Amended — now opens the merged Focus Details + Focus Queue panel, see amendment Section 3.)*
- View Full Timeline routes correctly.
- View Compass Breakdown routes correctly.
- View Match History routes correctly.
- View All Insights routes correctly.
- Play A Match enters the intended pre-game pipeline.
- No sidebar regression is introduced.

## 28. Completion report required from Codex

When finished, do not merely say "implemented."

Report:

1. Files changed.
2. Existing logic preserved.
3. Components structurally rebuilt.
4. SVG/assets introduced.
5. Routes/actions verified.
6. Screenshot viewport used.
7. Visual discrepancies found during comparison.
8. Corrections made after comparison.
9. Any remaining mismatch and why it remains.
10. Any data fields shown in the raster that were omitted because the real application does not currently provide them.

## 29. Final instruction

The approved raster is not inspiration. It is the reconstruction target.

Do not creatively reinterpret it.

Preserve the existing product engine underneath it, ignore the left navigation visually, rebuild the Play content area to match the approved composition, and use screenshot comparison as a required part of implementation rather than an optional final check.
