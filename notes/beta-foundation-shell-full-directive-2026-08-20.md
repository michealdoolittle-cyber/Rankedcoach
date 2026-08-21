# Beta Foundation Shell — Full Groups 1-7 Coverage (2026-08-20)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: ready to build.** Claude is running low on usage this session, so this hands the next step directly to Codex. This continues the ground-up rebuild strategy Michael directed after the beta site teardown (see `notes/beta-play-reconstruction-strategy-2026-08-20.md` for that diagnosis — Codex kept editing on top of the existing implementation instead of restructuring, so the whole site was torn down to `beta/public/` empty and validated assets stowed at `beta/_stowed-assets/`). This task is Phase 1 of that plan taken to its full scope: **one comprehensive, self-contained HTML reference artifact covering every screen from Groups 1-7 plus the newest Play home page, structure only — no real data, no final styling.** This is a verification/blueprint tool, not the real app. Once Michael approves the structure shown here, later phases add styling, then placeholder data, then real account porting.

## What already exists — extend this, don't start from zero

**`notes/previews/beta-foundation-shell-reference-2026-08-20.html`** is a working reference implementation covering the app shell + Play + stub skeletons for the other 8 sections. **Open it, understand the pattern, and extend it** — don't invent a new structure. It demonstrates every mechanical requirement below:

- Single self-contained HTML file, one `<html>` document, internal JS-driven navigation (clicking a sidebar item swaps which `<section class="page">` is visible — this is what "hyperlinked" means here: in-page navigation between sections, not separate linked HTML files).
- A page-transition animation (fade + slight vertical shift) on every section switch, respecting `prefers-reduced-motion`.
- Tab-switching within sections that have sub-tabs (Review's 6 tabs, Settings' 6 tabs) using the same pattern — extend this to every section that needs internal tabs.
- A state-cycling demo pattern (see Loadout's Idle/Spinning/Generated cycle button) for any component that has multiple states worth showing — extend this to other multi-state components (see the Group-by-group list below for which ones).
- Every content region is a labeled, dashed-border **skeleton box** (`.skel` class) — a tag + one-line description, not a finished card. This is deliberate: Michael does not want real data, exact spacing, or final visual styling in this pass, only correct structure and correct information architecture.
- Fluid sizing via CSS `clamp()` on every major dimension (sidebar width, padding, gaps, font sizes) — no fixed-pixel breakpoints, no layout that restructures at different widths. The reference file's `.stage` wrapper has a native CSS `resize: horizontal` handle specifically so this is testable by dragging, not just asserted.
- Reuses the already-validated Obsidian design tokens (`--rc-canvas`, `--rc-surface-*`, `--rc-brand`, `--rc-review`/`--rc-learn`/`--rc-library` section accents) — these are not in question, only structure was failing, don't redesign the token system.

## Source priority — read in this order, resolve conflicts this way

1. **For the Play section specifically**: `notes/assets/play-approved-raster-2026-08-20.png` (the actual reference image) + `notes/beta-play-approved-raster-directive-2026-08-20.md` + `notes/beta-play-amendment-2026-08-20.md` are authoritative. This supersedes Group 1's Play content from item 2 below — Group 1 was an earlier, less-refined reference; the raster is the confirmed final target for Play's home dashboard specifically. The reference file's existing Play skeleton is already built against this raster — verify it, don't rebuild from Group 1.
2. **For everything else** (Review, Stats, Learn, Library, Settings, Global UI, Mobile, and Play's *non-dashboard* surfaces like Loadout/Log Match/In-Game/Focus Queue): `notes/beta-concept-art-final-directive-2026-08-19.md` — Claude's written interpretation of the "Groups 1-7" concept art set, organized by the same group numbers used below. This is the authoritative content/structure source for these areas; no newer replacement exists for them yet.
3. `notes/beta-design-philosophy-2026-08-19.md` for any structural judgment call not covered by 1 or 2 (the 4-level hierarchy rule, the 8-step "how to invent a new page" process, the named failure modes).

**Important gap, read before starting**: unlike the Play raster, **the original Group 1-7 concept art images were never saved as files** — only Claude's text descriptions in `beta-concept-art-final-directive-2026-08-19.md` exist in the repo. Build from that text directly. If Michael has the original images still available and wants tighter accuracy, ask him to save them the same way the Play raster was saved (`notes/assets/`) — but don't block on this, the text descriptions are detailed enough to build a structural skeleton from.

## Content checklist — one skeleton region per item, matching the reference file's `.skel` pattern

Build every item below into the artifact as its own labeled skeleton box (tag + one-line description), organized under the correct top-level nav section. Where a group's content spans multiple sub-pages within one nav item (e.g. Learn's 4 category index pages), use the tab-switching pattern already demonstrated for Review/Settings, or a secondary in-page nav if a plain tab row doesn't fit — match whatever the reference file already does for the closest analogous case.

### Play (Group 1 for non-dashboard flows; raster for the dashboard — see priority above)
- Dashboard: already built in the reference file against the raster. Verify only.
- Loadout full-screen flow: Idle / Spinning / Generated states — reference file already stubs this with a state-cycle button; extend the cycle to also demonstrate Started and Error/partial states from the original Loadout state-machine spec.
- Focus Details (merged with Focus Queue): current-focus deep-dive skeleton + "Other Trending Focuses" skeleton + Auto-Rotate/Self-Chosen toggle skeleton + add-your-own skeleton — reference file has a basic version, verify it matches `beta-play-amendment-2026-08-20.md` Resolution 2's structure exactly.
- Log Match: 8-section debrief (Result / RR Change / Match Details / Mood / Personal Performance / Comms self+team / Reflection / Focus Adherence) — reference file has this, verify against `beta-play-system-rebuild-2026-08-20.md` Section 5.
- Match Saved confirmation.
- In-Game: One Job / Focus Pillars / Focus Checklist / Quick Reference (Map Notes, Agent Tips, Lineups, Weapons) / Match Complete — reference file has this, verify against `beta-play-system-rebuild-2026-08-20.md` Section 3.

### Review (Group 2)
- Improvement Timeline (full page): summary strip with all 5 pillars, multi-line trend chart, 5 pillar detail cards.
- Insights list: status-filtered tabs (All/Needs Work/Good/Strong), impact-color-coded rows.
- Insight Detail (full page): 4-tab structure (Overview/Evidence/How to Improve/Related), evidence stats, example rounds, seen-in-maps/agents breakdowns, related-concepts chips.
- All Matches: filterable table.
- Match Detail (full page): 6-tab structure (Overview/Scoreboard/Performance/Focus Adherence/Round Breakdown/Insights), round-breakdown grid, related-insights rail.

### Stats (Group 3 — sub-tabs of Review)
- Overview: summary strip (6 stats with percentile+delta), trend chart, results breakdown, strengths/weaknesses lists, most-played-role card.
- Weapons: most-used hero card, breakdown table, best-performers row, accuracy gauge.
- Agents: most-played hero card, breakdown table, role-performance mini-radar.
- Maps: best-map hero card, breakdown table, win-rate ranked list, round-differential widget.

### Learn (Group 4)
- 4 category index pages (Maps/Agents/Concepts/Situations) sharing one pattern: search+filter, category-appropriate grid/list, a personalized callout card per category.
- Full Topic/Lesson page: video+takeaways header, 4-tab body (Overview/Examples/Practice Drills/Notes), strengths/weaknesses, Up Next.
- Insight→Learn single-hop transition (already related to the Review Insight Detail's "Related Concepts" chips above — link them structurally, don't duplicate).
- Map Detail example page, Agent Guide example page.
- Learning Queue (Add-to-Focus-integrated).
- Learn-scoped search overlay.

### Library (Group 5)
- Library home/dashboard: metric strip (5 resource types with counts+deltas), recent activity feed, most-used-maps list, recently-viewed row.
- 5 full resource pages (Lineups, Routines, Notes, Custom Collections, Watch Later), each: filter/search + main list + a right-rail (named collections, streaks/tags/playlists depending on type).

### Settings (Group 6)
- Profile, Notifications, Integrations, Billing tabs (reference file stubs these — verify content matches the group description: Profile has avatar/region/goal-rank, Notifications has grouped toggle sections, Integrations has per-service connection cards, Billing has current plan + history + payment method).
- Pipeline: preset list + live preview + builder + quick-selector skeleton.
- Visual: 3-column workstation (nav/editor/preview) skeleton.
- Global components reference (buttons, badges, inputs, toggles — this can be a single "component library" skeleton page, doesn't need its own nav item, link it from Settings).
- Global overlays: search command-palette, notifications drawer, profile popover, checkout/upgrade flow — these are overlays, not full pages; represent them as skeleton modals triggerable from somewhere sensible (e.g. a demo trigger row) rather than nav destinations.

### Mobile & Components (Group 7)
- Explicitly **lower priority per Michael's direction** — mobile is a separate, structurally different experience, not required this pass. If time allows, add a single "Mobile Reference" skeleton page showing the bottom-tab-bar pattern and noting it's out of scope for now; do not attempt full mobile parity in this artifact.

## How to build this — methodology

1. Read `notes/previews/beta-foundation-shell-reference-2026-08-20.html` fully before writing anything — copy its token system, CSS structure, and JS patterns exactly rather than reinventing them.
2. Work group by group, not all at once — finish and verify Review before starting Stats, finish Stats before Learn, etc. (This mirrors the exact lesson from `notes/beta-play-reconstruction-strategy-2026-08-20.md`: small, independently-verifiable steps, not one giant pass.)
3. For each new section, add: the sidebar nav item (if it's a new top-level destination), the `<section class="page">` skeleton content, and any tab/state-switching JS needed — following the exact pattern of the existing Review/Settings/Loadout examples in the reference file.
4. Do not add real data, real copy beyond short structural labels, or final visual polish (shadows, exact radii, real icons) — the whole point of this pass is verifying structure and flow, not appearance.

## How this will be verified — do this, don't skip it

1. After each group is added, take a screenshot of that section at a reasonable width (1600-1900px) using the same Playwright pattern established in `testing/visual-audit/`.
2. Compare it against the corresponding source: the raster image for Play's dashboard, or the relevant Group N section of `beta-concept-art-final-directive-2026-08-19.md`'s text description for everything else.
3. List specific things that don't match structurally (a missing sub-section, wrong tab set, wrong grouping) — not visual polish differences, those don't matter yet.
4. Fix and re-screenshot before moving to the next group.
5. At the end, resize-test the whole artifact (drag the `.stage` handle from ~1900px down to ~1300px) and confirm nothing restructures or breaks — this is the "no deviation across viewports" requirement, and it's directly testable, not subjective.
6. Final report should list, group by group: what was built, what it was verified against, and any content from the source material that was deliberately left out and why.
