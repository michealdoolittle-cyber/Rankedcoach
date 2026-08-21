# Beta Foundation Shell — Directive v4: Full Clean Rebuild, Every Button Wired (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: open — not started. Supersedes `notes/beta-foundation-shell-full-directive-2026-08-20.md`, `notes/beta-foundation-shell-round2-corrections-2026-08-21.md`, `notes/beta-foundation-shell-directive-v2-2026-08-21.md`, and `notes/beta-foundation-shell-directive-v3-2026-08-21.md`.** All four are kept for history but should not guide further work. v3's per-page content research is still accurate and is carried forward into this file — what changes in v4 is the fidelity bar every page has to hit, explained below.

**Read `notes/beta-foundation-shell-directive-v5-styling-2026-08-21.md` alongside this file.** v5 doesn't replace anything here — it adds the visual styling requirement (real dark Obsidian styling, not flat/dashed placeholders) that this file doesn't cover on its own. Build every section to satisfy both files at once, not this one first and v5 as a second pass.

## Read this first — the fidelity bar just changed

Every prior pass in this project (all the way back to the original teardown) defined "skeleton" as: a single dashed-border box with a short tag and a one-line description, standing in for a whole section. That was deliberate at the time — Michael didn't want real data or final visual styling this early. **That part hasn't changed: still no live account data, still no final pixel-perfect polish.** What's changed, per Michael's direct instruction, is everything else:

> "So you are telling me every button has a direct working flow to a functions page? The functions page also has example text, placeholders, and parent cards/objects? If not I need you to rewrite it. We should see all foundational pieces exist, be interactable, show a clear intended layout design with the expectation of what would be there."

Concretely, this means two new hard requirements for every page in this rebuild:

**1. Every interactive element must go somewhere real.** Every button, link, tab, card CTA, and nav item must be wired (via the existing `activatePage`/`activateTab`/`data-jump`/`data-modal` JS patterns, or new ones following the same style) to a destination that actually exists in the file. No label-only buttons, no `href="#"` dead ends, no "this would eventually link to X" comments in place of a real link. If this directive doesn't specify a destination for something, pick the most sensible existing page/section and wire it there rather than leaving it dead — a slightly-imperfect real link beats a dead button.

**2. Every destination must show its actual composed layout, not one abstract box.** Instead of a single `.skel` box with a tag and a description standing in for an entire section (e.g. one box saying "Scoreboard: Team rows, K/D/A, ACS, side split"), build the real sub-structure: the actual set of parent cards/panels/rows arranged in their real positions, each one populated with realistic example placeholder content — invented player names, invented stat numbers, invented match dates, invented insight headlines, all clearly fictional but concrete and specific, not "Lorem ipsum" and not a category label. Individual leaf elements (a stat card, a table row, a list item) can still use the dashed-border `.skel` treatment to signal "not final visual styling" — that visual language stays — but a whole page or a whole multi-part section must never collapse into one box. If a spec below says "breakdown table," build an actual table with several example rows, not a box that says "breakdown table" once.

Think of the standard as: a real clickable wireframe/prototype populated with invented-but-plausible content, not final-styled and not live-account-data, but with every card, row, and button actually present and actually working.

## What stays (infrastructure, not content — do not rebuild these from scratch)
- The CSS design tokens (`--rc-canvas`, `--rc-surface-*`, `--rc-brand`, `--rc-review`/`--rc-learn`/`--rc-library` accents, etc.)
- The `.skel` dashed-border visual treatment, as a leaf-element style (see standard above — its *scope of use* changes, its visual style doesn't)
- The page-transition animation, tab-switching JS pattern, state-cycling demo pattern, resizable `.stage` mechanism
- The sidebar structure (see below) — the one exception Michael named for full rebuild

## What gets deleted and rebuilt clean
Every `<section class="page">`'s actual content — Play, Review (incl. Insight Detail, Match Detail, Stats), Learn, Library, Settings, Log Match, Loadout, Focus Queue/Details, In-Game, Mobile Reference. This directive specifies every one of them below, including their button-to-destination wiring, so nothing needs to be looked up in an old file.

## Source priority
1. `notes/assets/groups-1-7/curated/*.png` — Michael's own selection, highest priority for anything it covers directly.
2. `notes/assets/groups-1-7/originals/*.png` — the fuller raw concept-art set, for anything the curated set doesn't cover.
3. `notes/assets/play-approved-raster-2026-08-20.png` + `notes/beta-play-approved-raster-directive-2026-08-20.md` — authoritative for the Play dashboard specifically.
4. This directive's own judgment calls (marked **[Claude's call]**) where the source is silent or self-contradictory.

## Sidebar (the one exception — keep as specified, don't touch further)
Source: `Top-Of-Side-Panel.png` + `Bottom-Side-Panel.png`.
- **Main**: Play, Review, Learn, Library
- **Tools**: Log Match, Loadout, Focus Queue
- **Footer**: Account block (avatar + rank + RR) → gear icon opens Settings, bell icon opens the Notifications Drawer overlay
- **[Claude's call]**: add a small secondary "Reference Pages" row below the footer (visually distinct from Main/Tools) so Mobile Reference, In-Game, and Match Saved stay reachable for review, since this file is a browsable artifact, not the live app.
- Every one of these nav rows must already be wired (they are, in the current JS pattern) — verify, don't rebuild.

---

## Play

### Dashboard
Rebuild from the raster: Today's Focus hero, Improvement Timeline (5 pillar tiles: **Mechanics, Game Sense, Teamwork, Discipline, Mental** — exact wording, don't substitute "Aim"/"Comms"), Loadout card, Compass (5-axis radar, values on the chart), Current Rank block, RR Trend chart, Top Insight (with Key Takeaways), Quick Actions row. Source: `notes/assets/play-approved-raster-2026-08-20.png`.

Every card needs real example content, not one abstract box per card — e.g. Today's Focus needs an actual invented headline + supporting sentence + a fake confidence number, not a box that says "hero coaching card." Current Rank needs actual invented rank/RR/win-loss numbers and a fake last-match stat row, not a description of what a rank card contains.

**Buttons/links on this page and where they go:**
- Today's Focus → "View Focus Details" → opens the Focus Details modal (populated with that same invented focus)
- Improvement Timeline → "View Full Timeline" → Review's Improvement Timeline tab
- Loadout card → "Select Play A Match" / equivalent → Loadout page, Idle state
- Compass → "View Compass Breakdown" → **[Claude's call]** either expands inline or jumps to the relevant Stats Overview tab (Stats already has a performance radar) — pick one and wire it, don't leave it unresolved
- Current Rank → "View Match History" → Review's All Matches tab
- RR Trend → "View RR Calculator" → **[Claude's call]** a simple skeleton utility page/modal is fine if nothing better exists — don't leave this dead
- Top Insight → "View All Insights" → Review's Insights List tab
- Quick Actions row (Play A Match / Review Match / Practice / Study a Map / Strategy Library) — wire each: Play A Match → Loadout; Review Match → Review's All Matches; Practice → Learn's Concepts index (or Learning Queue); Study a Map → Learn's Maps index; Strategy Library → Library dashboard.

### Loadout (full route)
3 states — Idle → Spinning → Generated. (Source: `Focus-Queue-Cards.png`, `Common-Icons.png`.)
- **Idle**: Role / Agent / Map dropdowns (default "Any"), "Spin Loadout" button → advances to Spinning.
- **Spinning**: animated orb/particle center-piece, progressive status lines ("Selecting map… / Analyzing your recent matches… / Building focused objective…") → auto-advances (or a demo-only "skip" control) to Generated.
- **Generated**: "Your Next Match" card with actual invented Role/Agent/Map values, a Focus preview line, a Map Reminder line. "View Details" → expands the card or jumps to a details sub-view (not dead). "Start Match" → In-Game full page.
- **[Claude's call]**: keep Started and Error/Partial as two additional demo-cycle states — not visually sourced, but reasonable per `beta-play-system-rebuild-2026-08-20.md`. Give both real example content too (Started: an active-loadout summary card; Error/Partial: an invented "map data unavailable, here's what we do have" message), not just a label.

### Focus Details (modal) + Focus Queue (page)
- **Focus Details modal**, triggered from the dashboard: Why This Matters, What To Do (an actual checklist with 3-4 invented items), Success Looks Like, Focus Impact stat + Confidence ring (real invented numbers), "Got It" dismiss button (closes modal, returns to Play). (Source: `Common-Icons.png`.)
- **Focus Queue page** (Tools nav item): "Your personalized queue of focuses to work on in your next matches." An actual drag-to-reorder list of 3-5 invented focus items — each with icon + category + one-line rationale + priority badge + drag handle, not one box describing the concept. "Add Focus to Queue" → opens a small add-focus form/modal (invented options list). "Clear Queue" → wired to actually empty the demo list (or show an empty-state card). Each queue item's own "view" affordance → the Focus Details modal for that item. (Source: `Focus-Queue-Cards.png`.)

### Log Match (full route)
Lean 6-part form — build every part as real fields with example placeholder values already filled in (not empty inputs, not a label describing the field): (Source: `Common-Icons.png`, `Focus-Queue-Cards.png`.)
1. Match Result — Win/Loss/Draw pills (one pre-selected as example) + Undo
2. RR Change — actual invented before/after numbers
3. Match Details — actual invented mode/map/duration
4. Reflections — emoji scale (one selected), both text areas pre-filled with an invented example sentence
5. Focus Review — the actual current focus text + one qualitative chip pre-selected
6. "Save to Reflection Matches" toggle (on) + "Save Match" button → advances to the save sequence

Save sequence, each its own real screen (not a single collapsed state): Save Confirmation → Syncing (auto-advances or has a demo "skip") → Complete → Next Stop card with an actual "Go to Reflection Matches" button wired to Review's Reflection Matches tab.

### Match Saved
Reachable via the secondary "Reference Pages" row — same populated Save Confirmation screen as above, plus its own "Back to Play" / "Review match" buttons, both wired (to Play dashboard and to a specific example Match Detail page, respectively).

### In-Game
Full desktop page: Current Focus (One Job — actual invented headline + description + agent portrait), Quick Reference row with 4 real sub-cards (Map Notes / Agent Tips / Lineups / **Economy** — not Weapons — each with a couple lines of invented example content, not just a label), In-Game Reminders (2 real tip chips with invented text), Round Score strip (actual invented score). "View Focus Details" → the Focus Details modal. Each Quick Reference card → a "view more" affordance that jumps to the relevant Learn/Library page (Map Notes → Learn Map Detail; Agent Tips → Learn Agent Guide; Lineups → Library Lineups; Economy → **[Claude's call]**, a simple skeleton sub-panel is fine). (Source: `Common-Icons.png`.) Also build a second state/variant for the compact modal version — open `In-Game-Modal.png` and `in-game-modal-only.png` directly, don't guess its content.

---

## Review

Three distinct lists (source: `Focus-Queue-Cards.png`'s "REVIEW — REFLECTION MATCHES" panel), each populated with several example rows, not a table description:

- **Performance Review** tab: Current Read Hero (an actual invented headline+evidence sentence+action button), Recent Signals / Role Snapshot / Queue Health module row (each a real mini-card with invented numbers), Next Review Action (a real button wired to Insights List or a specific example Insight Detail).
- **Reflection Matches** tab: an actual table with 4-5 invented example rows (Date/Map/Agent/Role/Result/Score/RR/Focus/Reflection), each row's "Review" button wired to that row's Match Detail page. Caption: "Matches you choose to save while logging are stored here. Review your thoughts, focus performance, and outcomes over time."
- **All Matches** tab: same table shape, full ranked history, 5+ invented rows, filters that are real dropdowns (with example option lists, don't need to actually filter), each row wired to Match Detail.
- **Improvement Timeline** tab: filters row (real dropdowns), summary strip with all 5 pillars (real invented numbers+deltas), an actual trend chart (even a simple inline SVG polyline with invented data points, not a box saying "trend chart"), 5 real pillar detail cards.
- **Insights List** tab: status filter tabs (All/Needs Work/Watch/Strengths — real, clickable, at least filter visually even if not functionally), an actual list of 5+ invented insight rows (icon+headline+impact badge+confidence+match count), each row wired to its own example Insight Detail page.
- **Stats** tab: see Stats section below.

### Match Detail (full page)
4 tabs: **Overview, Scoreboard, Round Breakdown, Performance.** No Focus Adherence tab, no Insights tab.
- **Overview**: Performance Summary (an actual radar chart + 5 real stat numbers: K/D, ADR, ACS, KAST, HS%), Top Highlights (3 real invented callouts — Clutch/Ace/Key Entry style, each with a round reference), a compact Related Insights rail (2-3 real invented insight rows, each wired to that Insight Detail page), and the saved focus note from Log Match (actual invented text, not a percentage).
- **Scoreboard**: both teams, an actual table with 5 real invented player rows each (10 total), full stat columns.
- **Round Breakdown**: an actual round-by-round grid (Attack/Defense rows, ~20 real invented per-round outcome icons — Win/Loss/Clutch/Ace/Plant), not a description.
- **Performance**: a few real selectable stat cards + an actual trend graph (inline SVG is fine) with invented data.

### Insight Detail (full page)
Single continuous scroll, no tabs. Every field below needs real invented content, not a category label:
- Headline (an actual invented conclusion sentence)
- Stat row: real invented Impact/Confidence/Matches-Analyzed numbers
- "What's happening?" — an actual 2-3 sentence invented explanation, optionally with a small trend chart
- "How to improve" / "Recommended Actions" — an actual list of 3 invented action items, each with its own real link: one to a specific example Learn lesson, one to a specific example Learn concept, one to Library's Lineups page — not three identical links
- Related Concepts — 3 real invented chips, each wired to a specific example Learn concept or lesson page
- Persistent right rail: Evidence Breakdown (3 real invented stats with bars) + Insight Status
- Top-right actions: Save Insight (toggles a saved state visually), Add to Focus Queue (actually appends to the Focus Queue page's demo list, or at minimum shows a confirmation toast)

---

## Stats (sub-tabs of Review)
Source: `All-Component-Examples.png`. Every card below needs real invented numbers/rows, not a description:
- **Overview**: 6-stat summary strip (real invented K/D, Win Rate, ADR, HS%, ACS, KAST with percentile+delta each), an actual trend chart, a results-breakdown donut (even a simple inline SVG), top strengths / areas-to-improve lists (3 real invented items each), most-played-role card.
- **Weapons**: most-used weapon hero card (real invented weapon name+stats), an actual breakdown table with 5+ invented weapon rows, best-performers row, accuracy gauge.
- **Agents**: most-played agent hero card, an actual breakdown table with 5+ invented agent rows, role-performance mini-radar, best win-rate callout.
- **Maps**: best-map hero card, an actual breakdown table with 5+ invented map rows, map win-rate ranked list, round-differential widget.

## Learn
Source: `Learn-System-UI.png`. Each of the 4 category index pages needs an actual populated grid (5-8 real invented item cards: thumbnail placeholder + title + tag + helpful% + learner count + duration), a real search bar + filter dropdown, and one specific personalized callout at the bottom with real invented content:
- **Maps** → "Learning Path" card, wired to a specific example Map Detail page
- **Agents** → "Suggested for You" card, wired to a specific example Agent Guide page
- **Concepts** → "Your Weakest Concept" card, wired to that specific concept's Lesson page
- **Situations** → "Situations for You" card, wired to a specific example Situation collection

Every category card itself must be wired to its own Lesson/Map Detail/Agent Guide page (not necessarily unique pages for all 5-8, but at least the first one in each grid should open a real, fully-built example destination — the rest can reuse that same destination, clearly labeled as reused, rather than being dead).

**Full Topic/Lesson page**: breadcrumb (wired back to the category index), title+tags, Add to Focus (wired to actually add to the Focus Queue demo list) / Save / Share buttons, video player (a real placeholder player frame, not just a label), Key Takeaways checklist (4-5 real invented items), 4-tab body: **Overview / Examples / Practice Drills / Notes**, each tab with real invented content (not "Practice Drills: drill list" — an actual list of 3+ invented drills). Below: Lesson Sections list (real invented sections with durations), a "Why This Matters" explainer with a real before/after stat comparison, Strengths/Weaknesses lists, Up Next card (wired to another example lesson), Related Lessons rail (2-3 real cards, wired).

**Map Detail example page**: map art placeholder + real invented stats header, tabs (Overview/Callouts/Playstyle/Matchups/Lessons — each with real content, not just tab labels), an interactive map graphic with a real Key Locations list (each with a lesson count, each wired to a relevant lesson), a "Learning Path for [Map]" progression strip with real invented steps.

**Agent Guide example page**: agent portrait+role, real tabbed content, Strengths list, Suggested Lessons (real, wired), progress bar.

**Learning Queue**: an actual populated list of 3-4 invented queued lessons with durations, "Start Queue" button (wired to the first lesson), "Auto-generate from insights" toggle.

**Learn-scoped search overlay**: real search input, an actual results list with 4-5 invented example results, each wired to its target page.

**Insight → Learn single-hop transition**: a 3-step mini-flow diagram (Insight Detail → click a Related Concept chip → lands on that Lesson page) is fine as an illustration, but the *actual* chip-click behavior on the real Insight Detail page (above) must also genuinely navigate — don't just illustrate it, wire it.

## Library
No dedicated deep-dive image — build from this spec, every list populated with real invented rows, not descriptions:
- **Library home/dashboard**: metric strip (5 real invented resource-type counts+deltas), recent activity feed (4-5 real invented entries), most-used-maps list (real invented rows), recently-viewed row (real invented items, each wired to its resource page).
- **5 full resource pages** (Lineups, Routines, Notes, Custom Collections, Watch Later): each gets a real filter/search bar, an actual main list with 5+ invented items (not a "main list" label), and a right-rail with real invented named collections/streaks/tags depending on type. Each list item needs some kind of open/view affordance, even if it just expands inline.

## Settings
Source: `Pipeline-Profile-Setting.png` + Visual composite images (`Visual-Settings-Plus-Theme.png`, `Icon-Style-Setting.png`, `Motion-Animation-Setting.png`, `Background-Style-Drop-Down.png`, `Font-Setting.png`, `Avatar-Style.png`, `Setting-Visual.png`).

- **Profile Settings tabs**: Profile / Pipeline / Notifications / Integrations / Billing (5).
  - **Profile**: real invented avatar placeholder, region, goal-rank fields (pre-filled example values), customization entry (wired to Visual).
  - **Notifications**: grouped toggle sections (Match Activity, App Updates, Sync Status, Content) — each group an actual set of 2-3 real toggles with labels, not one flat description.
  - **Integrations**: per-service connection cards, one real card per service (Riot — connected example state; Discord — connected example state; YouTube review tools — not-connected example state with a "Connect" button), not one box listing all three.
  - **Billing**: current plan (real invented plan name+price), history (an actual table with 3+ invented past charges), payment method (a real invented card-on-file placeholder) as 3 separate regions, plus the Free/Pro/Elite plan comparison table (real feature checklist per tier, from `Monetary-Plan.png`/`All-Component-Examples.png`'s Upgrade/Checkout panel), tied to Pipeline tiering below. "Upgrade to Pro/Elite" buttons wired to open the Checkout overlay.
- **Pipeline** — fully specified:
  - Preset list: 5 real named persona cards (**The Competitor** [Recommended, Free], **The Analyst** [Pro], **The Grinder** [Pro], **The Strategist** [Elite], **The Challenger** [Elite]), each with its own real one-line description, each selectable (radio behavior).
  - Selecting a preset updates a live "Pipeline Preview" panel — real mini versions of Today's Focus / RR Card / Compass, populated with invented content that visibly differs by preset (even if only the text/numbers change, not full re-styling).
  - A Before/After impact example: two real side-by-side mini-cards (Top Insight + Stats Overview) with different invented content per side.
  - "Customize Pipeline" button → opens the full builder: drag-to-prioritize Focus Areas (4 real invented items with High/Med/Low weight tags), Data Depth radio (3 real options), Delivery Style radio (3 real options), "Save as New Pipeline" / "Save Changes" (both show a real confirmation toast) / "Cancel" (returns without saving).
  - A small "Pipeline Selector (Quick Access)" widget in the sidebar footer or topbar — **[Claude's call on exact placement]** — showing the current pipeline name, wired to jump straight to this Pipeline tab.
- **Visual** — its own left-nav sub-app, 8 sections (Theme & Colors, Icons, Graphics & Avatars, Typography, Layout Density, Motion & Effects, Backgrounds, Preview & Apply), each a real left-nav item + a populated content panel (not one box per section):
  - Theme & Colors: 6 real named palette swatch cards (Obsidian [default, selected], Neo Mint, Sunset, Aurora, Rosewood, Monochrome), each showing its actual color chips.
  - Icons: 5 real selectable icon-style cards (Minimal, Tactical, Outline, Neon, Valorant Inspired), each showing example icon glyphs in that style.
  - Graphics & Avatars: real Agent Style / Rank Style / UI Graphics sub-tabs, each with 2-3 real selectable style-option cards.
  - Typography: a real font-family dropdown (populated with option names) + alternate-font quick-pick chips + a live text-preview block showing actual sample sentences in the selected font.
  - Motion & Effects: a real toggle list (6 named toggles, some on/some off as examples) + Animation Style radio (3 real options).
  - Backgrounds: 4 real selectable background-style cards, each with a small preview swatch.
  - Preview & Apply: a real summary of the currently-selected options + an "Apply" button (shows a confirmation toast).
  - **[Claude's call]**: keep Visual as a peer tab alongside Profile/Pipeline.
- **Components** reference page: a real populated set of examples — several button variants, a couple of card examples, a few pill/badge examples, a small chart example — not one box saying "component library." Link it from Settings. **[Claude's call — low-stakes.]**
- **Overlays** demo row: keep the existing working pattern (it already opens real modals with real content — Global Search with actual invented results, Notifications Drawer with actual invented rows, Profile Popover with real menu items, Checkout with the real plan cards from Billing above). This part of the current build is already done right — verify, don't rebuild.

## Mobile Reference
Single reference page, still lower priority — but even this should show the real bottom-tab-bar pattern with actual (if minimal) example content in the visible card, not an empty frame. Note clearly that full mobile parity is out of scope for this pass.

## Pillar naming
**Mechanics, Game Sense, Teamwork, Discipline, Mental.** Confirmed by Michael — use this exact set everywhere, don't substitute "Aim"/"Comms"/"Communication" from other reference images.

---

## How to build this
1. Read this directive fully. Open the specific cited images before building each section.
2. Strip every `<section class="page">`'s inner content back to empty; keep the sidebar/topbar shell and the CSS/JS infrastructure listed under "What stays."
3. Rebuild section by section, in this order: Sidebar (verify only) → Play (Dashboard, Loadout, Focus Details/Queue, Log Match, In-Game) → Review (Performance Review, Reflection Matches, All Matches, Timeline, Insights List, Match Detail, Insight Detail) → Stats → Learn → Library → Settings → Mobile Reference.
4. As you build each page, also build and wire every button/link it needs — don't do a separate "wiring pass" at the end, build the destination and the link to it together so nothing gets forgotten.
5. Every region needs real invented example content per the fidelity standard above — not an abstract tag+description box standing in for a whole section. Leaf-level dashed-border `.skel` styling is still fine and expected, just apply it to actual populated cards/rows, not to a single box replacing a whole page area.
6. Where this directive marks something **[Claude's call]**, build it as specified.

## Verification
1. After each section, screenshot it and compare against the specific image(s) cited.
2. **Click every button and link on the page.** Confirm each one lands somewhere real and that the destination is itself populated (not empty, not a dead end, not a console error).
3. List anything that doesn't structurally match the source, or any button that doesn't go anywhere yet — fix before moving on.
4. At the end, do a full click-through pass over the entire artifact (every nav item, every tab, every button) and list any dead ends found.
5. Resize-test the whole artifact (drag the `.stage` handle) to confirm nothing restructures.
6. Final report: list every section built, which image(s) it was verified against, every button wired and where it goes, and anything left out on purpose.
