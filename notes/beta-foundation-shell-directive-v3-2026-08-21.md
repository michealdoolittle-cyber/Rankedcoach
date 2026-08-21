# Beta Foundation Shell — Directive v3: Full Clean Rebuild (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: open — not started. Supersedes `notes/beta-foundation-shell-full-directive-2026-08-20.md`, `notes/beta-foundation-shell-round2-corrections-2026-08-21.md`, and `notes/beta-foundation-shell-directive-v2-2026-08-21.md`.** All three are kept for history but should not guide further work.

## This is a full clean rebuild, not a patch — read this section first

Michael's explicit instruction: **"All, everything, needs a full new clean start. There is a single exception, the left side panel only is okay."** This changes the approach from v2 (targeted corrections layered onto the existing 588-line file) to: delete every page's content and rebuild it fresh, directly from the source images, even for pages Claude had previously verified as already correct (Play dashboard, Stats, Learn, Library). Nothing carries over from the existing build just because it happened to be right before — the point is to remove any risk of stale content surviving from earlier incorrect passes, and to have every single region traceable to a specific source image rather than to "the file already had this."

**What stays (infrastructure, not content — do not rebuild these from scratch):**
- The CSS design tokens (`--rc-canvas`, `--rc-surface-*`, `--rc-brand`, `--rc-review`/`--rc-learn`/`--rc-library` accents, etc.)
- The `.skel` / `.skel-tag` / `.skel-desc` skeleton primitive pattern
- The page-transition animation, tab-switching JS pattern, state-cycling demo pattern, resizable `.stage` mechanism
- The sidebar structure (see below) — the one exception Michael named

**What gets deleted and rebuilt clean:** every `<section class="page">`'s actual content — Play, Review (incl. Insight Detail, Match Detail, Stats), Learn, Library, Settings, Log Match, Loadout, Focus Queue/Details, In-Game, Mobile Reference. This directive specifies every one of them from scratch below, so nothing needs to be "looked up in the old file" — build directly from this document plus the cited images.

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
- **[Claude's call]**: since this HTML file is a browsable reference artifact for review, not the live app, add a small secondary "Reference Pages" row below the footer (visually distinct from Main/Tools) so Mobile Reference, In-Game, and any transient states (like Match Saved) stay reachable for review — but don't present them as if they were real production nav.

## Play

### Dashboard
Rebuild from the raster, same content as before (unchanged in substance, just being rebuilt fresh rather than patched): Today's Focus hero, Improvement Timeline (5 pillar tiles: **Mechanics, Game Sense, Teamwork, Discipline, Mental** — this exact wording, confirmed, don't use "Aim"/"Comms" from other images), Loadout card, Compass (5-axis radar, same 5 pillars, values on the chart), Current Rank block, RR Trend chart, Top Insight (with Key Takeaways), Quick Actions row. Source: `notes/assets/play-approved-raster-2026-08-20.png`.

### Loadout (full route)
3 states — Idle → Spinning → Generated. (Source: `Focus-Queue-Cards.png`, `Common-Icons.png`.)
- **Idle**: Role / Agent / Map dropdowns, each defaulting to "Any", a "Spin Loadout" primary button.
- **Spinning**: animated orb/particle center-piece with progressive status lines ("Selecting map… / Analyzing your recent matches… / Building focused objective…").
- **Generated**: "Your Next Match" card — chosen Role/Agent/Map, a Focus preview line, a Map Reminder line, "View Details" + "Start Match" buttons.
- **[Claude's call]**: keep Started and Error/Partial as two additional demo states in the state-cycle button — not visually sourced in any image, but reasonable to keep demonstrable per the state-machine spec in `beta-play-system-rebuild-2026-08-20.md`.

### Focus Details (modal) + Focus Queue (page) — two separate surfaces
- **Focus Details modal**: triggered from the dashboard's "Today's Focus" card. Sections: Why This Matters, What To Do (checklist), Success Looks Like, Focus Impact stat + Confidence ring, "Got It" dismiss button. (Source: `Common-Icons.png`.)
- **Focus Queue page** (Tools nav item): "Your personalized queue of focuses to work on in your next matches." A drag-to-reorder list of 3-5 focus items, each with icon + category (Game Sense / Discipline / etc.) + one-line rationale + priority badge (High/Medium/Low) + drag handle. "Add Focus to Queue" and "Clear Queue" buttons. Caption: "The top focus becomes your active focus on the Home Dashboard." (Source: `Focus-Queue-Cards.png`.)

### Log Match (full route)
Lean 6-part form, not sections numbered 1-8. (Source: `Common-Icons.png`, `Focus-Queue-Cards.png`.)
1. Match Result — Win / Loss / Draw pills + Undo
2. RR Change — RR before → RR after, shown as a delta
3. Match Details — mode, map, duration
4. Reflections — "How did the match feel?" emoji scale (Very Bad/Bad/Okay/Good/Great), "What went well?" free text, "What could you improve?" free text
5. Focus Review — shows the match's active focus text, plus a self-rated qualitative chip: Didn't focus / A little / Somewhat / Focused / Nailed it
6. "Save to Reflection Matches" toggle + "Save Match" button

Then a save sequence as its own set of states/screens: Save Confirmation ("Match Saved!") → Syncing (spinner, "This may take a few seconds") → Complete (trophy, "You're all set!") → a "Next Stop" card suggesting Reflection Matches.

### Match Saved
Keep as a short confirmation reference page (reachable via the secondary "Reference Pages" row), showing the same Save Confirmation state as above.

### In-Game
Full desktop page. Current Focus ("One Job" headline + description + agent portrait), Quick Reference row (Map Notes / Agent Tips / Lineups / **Economy** — not Weapons), In-Game Reminders (2 short tip chips), Round Score strip (our team vs. enemy team). (Source: `Common-Icons.png`.) Also add a second state/variant for the compact modal version — open `In-Game-Modal.png` and `in-game-modal-only.png` directly and build from what's actually in them (don't guess).

## Review

Three distinct lists, not a flat tab row (source: `Focus-Queue-Cards.png`'s "REVIEW — REFLECTION MATCHES" panel):

- **Performance Review** tab — the analysis hub: Current Read Hero, Recent Signals / Role Snapshot / Queue Health module row, Next Review Action.
- **Reflection Matches** tab — only matches saved-with-reflection at Log Match time. Same table shape as All Matches (Date/Map/Agent/Role/Result/Score/RR/Focus/Reflection columns) but scoped to reflected matches, plus caption: "Matches you choose to save while logging are stored here. Review your thoughts, focus performance, and outcomes over time."
- **All Matches** tab — full ranked history, filterable table, same column set.
- **Improvement Timeline** tab — filters (season/role/map/category/confidence) + summary strip with all 5 pillars + multi-line trend chart + 5 pillar detail cards.
- **Insights List** tab — status-filtered rows (All/Needs Work/Watch/Strengths), impact-color-coded, filters+sort control.
- **Stats** tab — see Stats section below.

Insight Detail and Match Detail are drill-down pages reached from these lists, not top-level tabs.

### Match Detail (full page)
4 tabs only: **Overview, Scoreboard, Round Breakdown, Performance.** No Focus Adherence tab, no Insights tab (per Michael's explicit decision — that data isn't realistically derivable from the Henrik API as an ongoing scored metric).
- **Overview**: Performance Summary (radar + key stats: K/D, ADR, ACS, KAST, HS%), Top Highlights (Clutch/Ace/Key Entry style callouts), a compact Related Insights rail, and the saved focus note from Log Match (plain text, not a scored percentage).
- **Scoreboard**: both teams, full row stats.
- **Round Breakdown**: round-by-round grid (Attack/Defense rows, per-round outcome icons — Win/Loss/Clutch/Ace/Plant).
- **Performance**: selectable stat cards + trend graph over the match.

### Insight Detail (full page)
Single continuous scroll, **no tabs** — confirmed by two independent images (`Insight-List-Plus-Details.png`, `All-Component-Examples.png`).
- Headline (the conclusion, plain language)
- Stat row: Impact, Confidence, Matches Analyzed (or a "The Problem" framing with a specific stat comparison — either shape is fine, same concept)
- "What's happening?" / "The Problem" explanation, optionally with a trend chart
- "How to improve" / "Recommended Actions" — a short list, some items linking out differently (Learn Lesson / Improve Concept / View Lineups — not all identical targets)
- Related Concepts chips at the bottom (the single-hop jump into Learn)
- Persistent right rail: Evidence Breakdown (a few key stats with bars) + Insight Status
- Top-right actions: Save Insight, Add to Focus Queue

## Stats (sub-tabs of Review)

Source: `All-Component-Examples.png`. Confirms the existing spec, rebuild fresh from it:
- **Overview**: 6-stat summary strip (K/D, Win Rate, ADR, HS%, ACS, KAST, each with percentile+delta), performance trend chart, results breakdown donut, top strengths / areas to improve lists, most-played-role card.
- **Weapons**: most-used weapon hero card, breakdown table (per-weapon Kills/K:D/ADR/HS%/Accuracy/First Bloods/Win%), best-performers row, weapon accuracy gauge.
- **Agents**: most-played agent hero card, breakdown table (per-agent Matches/Win%/K:D/ADR/ACS/KAST/First Bloods), role-performance mini-radar, best win-rate callout.
- **Maps**: best-map hero card, breakdown table (per-map Matches/Win%/K:D/ADR/ACS/Attack Win%/Defense Win%), map win-rate ranked list, round-differential widget (best/worst).

## Learn

Source: `Learn-System-UI.png`. All 4 category index pages share: search bar + filter dropdown, a grid/list of item cards each showing thumbnail + title + tag (difficulty/category badge, e.g. Essentials/Core/Advanced or Attack/Defense/Retake) + helpful% + learner count + duration, and one specific personalized callout at the bottom:
- **Maps** → "Learning Path" (next map to study, based on agent pool/weaknesses)
- **Agents** → "Suggested for You" (agent + stats + View Agent Guide)
- **Concepts** → "Your Weakest Concept" (+ Start Learning button)
- **Situations** → "Situations for You" (+ View Collection button)

**Full Topic/Lesson page**: breadcrumb, title + tags (e.g. Mechanics/Intermediate), Add to Focus / Save / Share buttons, video player, Key Takeaways checklist, 4-tab body: **Overview / Examples / Practice Drills / Notes** (confirmed correct, not "Mistakes"). Below: Lesson Sections list, a "Why This Matters" explainer with a before/after stat comparison, Strengths/Weaknesses, Up Next, Related Lessons rail.

**Map Detail example page**: map art + stats header (win rate/matches/avg score), tabs (Overview/Callouts/Playstyle/Matchups/Lessons), interactive map with Key Locations list (each with a lesson count), a "Learning Path for [Map]" progression strip.

**Agent Guide example page**: agent portrait+role, tabs, Strengths, Suggested Lessons, progress bar.

**Learning Queue**: "Your Learning Queue" list of queued lessons with duration + Start Queue button, "Auto-generate from insights" toggle.

**Learn-scoped search overlay**: search input, quick results list, Start Queue button.

**Insight → Learn single-hop transition**: illustrate as a 3-step mini-flow if useful (Insight Detail → click a Related Concept chip → lands on that Lesson page) — don't duplicate a full lesson page here, just the transition.

## Library

No dedicated deep-dive image beyond a small Lineups thumbnail — rebuild from this spec directly:
- **Library home/dashboard**: metric strip (5 resource types with counts+deltas), recent activity feed, most-used-maps list, recently-viewed row.
- **5 full resource pages** (Lineups, Routines, Notes, Custom Collections, Watch Later), each: filter/search + main list + a right-rail (named collections, streaks/tags/playlists depending on type).

## Settings

Source: `Pipeline-Profile-Setting.png` + the Visual composite images (`Visual-Settings-Plus-Theme.png`, `Icon-Style-Setting.png`, `Motion-Animation-Setting.png`, `Background-Style-Drop-Down.png`, `Font-Setting.png`, `Avatar-Style.png`, `Setting-Visual.png`).

- **Profile Settings tabs**: Profile / Pipeline / Notifications / Integrations / Billing (5).
  - Profile: avatar/region/goal-rank, customization entry.
  - Notifications: grouped toggle sections (Match Activity, App Updates, Sync Status, Content — not one flat list).
  - Integrations: per-service connection cards, one per service (Riot, Discord, YouTube review tools).
  - Billing: current plan + history + payment method as 3 separate regions, plus the Free/Pro/Elite plan comparison (monetization placeholder — same shallow skeleton-level treatment as everything else this pass), tied to Pipeline tiering below.
- **Pipeline** — fully specified:
  - A "coaching pipeline" is a named persona that changes what the app emphasizes: **The Competitor** (Recommended, balanced, Free tier), **The Analyst** (data deep-dive, Pro), **The Grinder** (fundamentals/consistency, Pro), **The Strategist** (map/agent/game-sense focus, Elite), **The Challenger** (Elite).
  - Structure top to bottom: preset list (radio-style cards, one marked Recommended) → live "Pipeline Preview" panel (mini versions of Today's Focus / RR Card / Compass showing how that pipeline changes emphasis) → a Before/After impact example (Top Insight + Stats Overview compared across two pipelines) → a full "Customize Pipeline" builder (drag-to-prioritize Focus Areas with High/Med/Low weight, Data Depth radio [Essential/Detailed/Advanced], Delivery Style radio [Direct/Balanced/Educational], Save as New Pipeline / Save Changes / Cancel).
  - Include a small "Pipeline Selector (Quick Access)" widget — a compact dropdown badge, placed wherever fits the shell's topbar/footer best **[Claude's call on exact placement]**.
- **Visual** — its own left-nav sub-app with 8 sections: Theme & Colors, Icons, Graphics & Avatars, Typography, Layout Density, Motion & Effects, Backgrounds, Preview & Apply. Each section is a left-nav item + a content panel to its right (not 3 columns).
  - Theme & Colors: 6 named palettes (Obsidian [default], Neo Mint, Sunset, Aurora, Rosewood, Monochrome) as swatch cards.
  - Icons: 5 icon styles (Minimal, Tactical, Outline, Neon, Valorant Inspired) as selectable cards.
  - Graphics & Avatars: Agent Style / Rank Style / UI Graphics sub-tabs, each with style options (e.g. Illustrated / Stylized / Minimal).
  - Typography: font family dropdown + alternate font quick-picks + live text preview block.
  - Motion & Effects: toggle list (Enable Animations, Hover Animations, Page Transitions, Micro Interactions, Parallax Effects, Reduce Motion) + Animation Style radio (Snappy/Smooth/Relaxed).
  - Backgrounds: a few options (Dark Gradient, Subtle Pattern, Matrix Grid, Custom Image upload).
  - **[Claude's call]**: keep Visual as a peer tab alongside Profile/Pipeline rather than promoting it to its own sidebar item.
- **Components** reference page: keep as a single "component library" skeleton (buttons, cards, pills, charts) — link it from Settings, doesn't need its own sidebar item. **[Claude's call — Michael hasn't specified this one either way, low-stakes.]**
- **Overlays** demo row: Global Search, Notifications Drawer, Profile Popover, Checkout/Upgrade — these are contextual overlays in the source (triggered from a search icon, the bell icon, the account avatar, an upgrade CTA), not really a Settings tab. **[Claude's call]**: keep a small demo-trigger row in Settings anyway, purely so they're reachable for review in this reference artifact — not meant as real production IA.

## Mobile Reference

Single reference page, explicitly lower priority — bottom-tab-bar pattern only, noted as out of scope for this pass. Don't attempt full mobile parity.

## Pillar naming — use this exact set everywhere

**Mechanics, Game Sense, Teamwork, Discipline, Mental.** Confirmed by Michael — don't substitute "Aim," "Comms," or "Communication" from other reference images; those are inconsistent shorthand from earlier exploration passes, not a real naming difference.

## How to build this

1. Read this directive fully. Open the specific cited images before building each section — don't rely on memory of the old file's content.
2. Strip every `<section class="page">`'s inner content back to empty, keep the sidebar/topbar shell and all CSS/JS infrastructure listed under "What stays" above.
3. Rebuild section by section, in this order: Sidebar (verify only, already correct) → Play (Dashboard, Loadout, Focus Details/Queue, Log Match, In-Game) → Review (Performance Review, Reflection Matches, All Matches, Timeline, Insights List, Match Detail, Insight Detail) → Stats → Learn → Library → Settings → Mobile Reference.
4. Every new region follows the existing `.skel` / `.skel-tag` / `.skel-desc` pattern — structure only, no real data, no final visual polish.
5. Where this directive marks something **[Claude's call]**, build it as specified — don't re-litigate, but a short code comment is fine if something doesn't fit the shell cleanly.

## Verification

1. After each section, screenshot it and compare against the specific image(s) cited for that section.
2. List anything that doesn't structurally match — a missing sub-section, wrong tab set, wrong grouping — not visual polish.
3. Fix and re-screenshot before moving to the next section.
4. At the end, resize-test the whole artifact (drag the `.stage` handle) to confirm nothing restructures.
5. Final report: list every section built, which image(s) it was verified against, and anything left out on purpose.
