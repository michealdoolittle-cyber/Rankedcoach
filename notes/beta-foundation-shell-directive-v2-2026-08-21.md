# Beta Foundation Shell — Directive v2 (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: open — not started. Supersedes `notes/beta-foundation-shell-full-directive-2026-08-20.md` and `notes/beta-foundation-shell-round2-corrections-2026-08-21.md`.** Those two files were written before real Groups 1-7 source images existed in the repo (they only had Claude's earlier text description to go on). Michael has since supplied the actual images — `notes/assets/groups-1-7/originals/` (18 raw concept-art exports) and `notes/assets/groups-1-7/curated/` (44 favorite elements he selected himself: modals, page layouts, styling, components — explicitly **not** a literal spec to copy). This directive is Claude's own synthesis after reviewing that material directly: where the source is clear and consistent, follow it; where the source contradicts itself across images (it does, in a few places) or is silent, Claude made a judgment call and says so; two decisions were explicitly confirmed by Michael and are marked as such. **Do not re-derive structure from the old two files — they're wrong in specific, listed ways below.**

## What already exists — extend this, don't start from zero

`notes/previews/beta-foundation-shell-reference-2026-08-20.html` is the working reference artifact (588 lines as of commit `98e2664`). It already has the right mechanical patterns: single self-contained HTML, JS-driven nav, page-transition animation, tab-switching, state-cycling demos, `.skel` skeleton primitives, fluid `clamp()` sizing, resizable `.stage` for testing. **Keep all of that.** This directive changes *what content and structure* goes into it, not the mechanics.

## Source priority

1. `notes/assets/groups-1-7/curated/*.png` — Michael's own selection, highest priority for anything it covers directly. File names are descriptive (e.g. `Pipeline-Profile-Setting.png`, `Focus-Queue-Cards.png`).
2. `notes/assets/groups-1-7/originals/*.png` — the fuller raw concept-art set, useful for anything the curated set doesn't cover.
3. `notes/assets/play-approved-raster-2026-08-20.png` + `notes/beta-play-approved-raster-directive-2026-08-20.md` — still authoritative for the Play dashboard specifically (unchanged from before).
4. This directive's own judgment calls (marked **[Claude's call]** below) where the source is silent or self-contradictory — don't second-guess these, they're deliberate, but they're also lower-confidence than anything sourced directly from an image.

## Navigation — corrected, leaner than the current build

Source: `Top-Of-Side-Panel.png` + `Bottom-Side-Panel.png`.

- **Main**: Play, Review, Learn, Library
- **Tools**: Log Match, Loadout, Focus Queue
- **Footer**: Account block (avatar + rank + RR) → gear icon opens Settings, bell icon opens the Notifications Drawer overlay

No sidebar entry for In-Game, Match Saved, or Mobile. **[Claude's call]**: since this HTML file is a *browsable reference artifact* for review purposes, not the real app, keep a small secondary "Reference Pages" row or similar at the bottom of the sidebar (visually distinct from Main/Tools) so In-Game, Match Saved state, and the Mobile reference stay reachable for review — but don't present them as if they were real production nav.

## Play (Group 1)

- **Dashboard**: unchanged from the current build — already verified correct against the raster.
- **Loadout**: exactly 3 states — Idle → Spinning → Generated. (Source: `Focus-Queue-Cards.png`, `Common-Icons.png`.)
  - Idle: Role / Agent / Map dropdowns, each defaulting to "Any", a "Spin Loadout" primary button.
  - Spinning: animated orb/particle center-piece with progressive status lines ("Selecting map… / Analyzing your recent matches… / Building focused objective…").
  - Generated: "Your Next Match" card — chosen Role/Agent/Map, a Focus preview line, a Map Reminder line, "View Details" + "Start Match" buttons.
  - **[Claude's call]**: keep Started and Error/Partial as two additional demo states in the cycle button, same as the current build — they're not visually sourced in any image, but they came from `beta-play-system-rebuild-2026-08-20.md`'s state-machine spec and are reasonable to keep demonstrable. Label them clearly as unsourced in a code comment if you want to flag it for a later design pass.
- **Focus is two separate surfaces, not one merged panel.** This reverses the 2026-08-20 amendment's "merge Focus Queue into Focus Details" instruction — that merge was made before this source material existed.
  - **Focus Details modal**: triggered from the dashboard's "Today's Focus" card. Sections: Why This Matters, What To Do (checklist), Success Looks Like, Focus Impact stat + Confidence ring, "Got It" dismiss button. (Source: `Common-Icons.png`.)
  - **Focus Queue page** (Tools nav item): "Your personalized queue of focuses to work on in your next matches." A drag-to-reorder list of 3-5 focus items, each with icon + category (Game Sense / Discipline / etc.) + one-line rationale + priority badge (High/Medium/Low) + drag handle. "Add Focus to Queue" and "Clear Queue" buttons. Caption to include: "The top focus becomes your active focus on the Home Dashboard." (Source: `Focus-Queue-Cards.png`.)
- **Log Match — real structural correction, not the 8 numbered sections currently built.** Two independent images (`Common-Icons.png`, `Focus-Queue-Cards.png`) show the same lean structure:
  1. Match Result — Win / Loss / Draw pills + Undo
  2. RR Change — RR before → RR after, shown as a delta
  3. Match Details — mode, map, duration (these are Henrik-API-derivable, not self-report)
  4. Reflections — "How did the match feel?" emoji scale (Very Bad/Bad/Okay/Good/Great), "What went well?" free text, "What could you improve?" free text
  5. Focus Review — shows the match's active focus text, plus a **self-rated qualitative chip**: Didn't focus / A little / Somewhat / Focused / Nailed it (this is a one-time self-report at log time, not a computed ongoing metric — keep it, it's realistic)
  6. "Save to Reflection Matches" toggle + "Save Match" button
  Then a save sequence: Save Confirmation ("Match Saved!") → Syncing (spinner, "This may take a few seconds") → Complete (trophy, "You're all set!") → a "Next Stop" card suggesting Reflection Matches.
  Drop the old 8-section version entirely — "Personal Performance" and "Comms — self & team" as separate sections don't appear in any source image and were never a good idea given they'd need self-report anyway; the "Reflections" + "Focus Review" sections above already cover that ground more realistically.
- **In-Game**: full desktop page, confirmed. Current Focus ("One Job" headline + description + agent portrait), Quick Reference row (Map Notes / Agent Tips / Lineups / **Economy** — not Weapons, confirmed twice), In-Game Reminders (2 short tip chips), Round Score strip (our team vs. enemy team). (Source: `Common-Icons.png`.)
  - There also appear to be separate compact modal variants (`In-Game-Modal.png`, `in-game-modal-only.png`) — Codex should open these directly and add a second "In-Game (Compact Modal)" state to the same page's demo, since it looks like an overlay-during-match variant distinct from the full page. Don't guess its content without opening the file.

## Review (Group 2)

Confirmed 3 distinct lists under Review, not a flat set of tabs (source: `Focus-Queue-Cards.png`'s "REVIEW — REFLECTION MATCHES" panel, which shows tabs **Performance Review / Reflection Matches / All Matches**):

- **Performance Review** — the analysis hub (what's currently built as `rv-overview`). Keep as-is.
- **Reflection Matches** — only the matches Michael chose to save-with-reflection at Log Match time (via that toggle). New tab, not currently built. Same table shape as All Matches but scoped to reflected matches, plus a caption: "Matches you choose to save while logging are stored here. Review your thoughts, focus performance, and outcomes over time."
- **All Matches** — full ranked history, unchanged from current build.
- **Improvement Timeline**, **Insights List**, **Stats** stay as their own tabs, unchanged in position.
- **Insight Detail** and **Match Detail** are drill-down pages reached from these lists, not top-level tabs themselves (keep them reachable the way they already are, just don't list them in the Review tab row).

**Match Detail** (per Michael's explicit decision): 4 tabs only — **Overview, Scoreboard, Round Breakdown, Performance**. No Focus Adherence tab, no Insights tab.
- Overview folds in: Performance Summary (radar + key stats), Top Highlights, a compact Related Insights rail, and the saved focus note from Log Match (plain text, not a scored percentage).
- Scoreboard, Round Breakdown, Performance: unchanged from what's already built for those tabs.

**Insight Detail**: confirmed single continuous scroll, **no tabs, ever** — two independent images agree on this (`Insight-List-Plus-Details.png`, `All-Component-Examples.png`). Current build's 4-tab version (Overview/Evidence/How to Improve/Related) is wrong and needs to become one scrolling page:
- Headline (the conclusion, plain language)
- Stat row: Impact, Confidence, Matches Analyzed (or "The Problem" framing with a specific stat comparison — either image's version is fine, they're the same concept)
- "What's happening?" / "The Problem" explanation, optionally with a trend chart
- "How to improve" / "Recommended Actions" — a short list, each item optionally linking out (Learn Lesson / Improve Concept / View Lineups — different link targets per action, not all identical)
- Related Concepts chips at the bottom (these are the single-hop jump into Learn)
- Persistent right rail: Evidence Breakdown (a few key stats with bars) + Insight Status
- Top-right actions: Save Insight, (Add to) Focus Queue

## Stats (Group 3)

Unchanged — already verified correct against the source composite.

## Learn (Group 4)

Mostly confirms the current build; refines the per-category callout pattern precisely (source: `Learn-System-UI.png`). All 4 category index pages share: search bar + filter dropdown, a grid/list of item cards each showing thumbnail + title + tag (difficulty/category badge, e.g. Essentials/Core/Advanced or Attack/Defense/Retake) + helpful% + learner count + duration, and **one specific personalized callout** at the bottom of each:
- Maps → "Learning Path" (next map to study, based on agent pool/weaknesses)
- Agents → "Suggested for You" (agent + stats + View Agent Guide)
- Concepts → "Your Weakest Concept" (+ Start Learning button)
- Situations → "Situations for You" (+ View Collection button)

Lesson page's tab set is confirmed correct as already built: Overview / Examples / Practice Drills / Notes. No change needed there.

## Library (Group 5)

Unchanged — no dedicated deep-dive image beyond what's already covered; current build matches the one Lineups thumbnail available.

## Settings (Group 6) — restructured

Source: `Pipeline-Profile-Setting.png`, plus the Visual composite images (`Visual-Settings-Plus-Theme.png`, `Icon-Style-Setting.png`, `Motion-Animation-Setting.png`, `Background-Style-Drop-Down.png`, `Font-Setting.png`, `Avatar-Style.png`, `Setting-Visual.png`).

- **Profile Settings tabs**: Profile / Pipeline / Notifications / Integrations / Billing (5 — drop Visual, Components, Overlays as peer tabs here; see below).
- **Pipeline** — fully specified now, replaces the guess in the old round2-corrections file:
  - A "coaching pipeline" is a named persona that changes what the app emphasizes: **The Competitor** (Recommended, balanced), **The Analyst** (data deep-dive), **The Grinder** (fundamentals/consistency), **The Strategist** (map/agent/game-sense focus), **The Challenger** (Elite tier).
  - Structure, top to bottom: preset list (radio-style cards, one marked Recommended) → live "Pipeline Preview" panel (mini versions of Today's Focus / RR Card / Compass showing how that pipeline changes emphasis) → a Before/After impact example (Top Insight + Stats Overview compared across two pipelines) → a full "Customize Pipeline" builder (drag-to-prioritize Focus Areas with High/Med/Low weight, Data Depth radio [Essential/Detailed/Advanced], Delivery Style radio [Direct/Balanced/Educational], Save as New Pipeline / Save Changes / Cancel).
  - Pipelines are tiered by plan: Free unlocks The Competitor only; Pro adds The Analyst + The Grinder; Elite adds The Strategist + The Challenger. Tie this into the Billing/Monetization section below.
  - Include a small "Pipeline Selector (Quick Access)" widget — a compact dropdown badge, reachable from somewhere outside Settings (e.g. the account footer or topbar), for switching pipelines without a full Settings visit. **[Claude's call]** on exact placement — pick wherever fits the existing shell's topbar/footer best, it's a minor widget.
- **Visual** — bigger than a single Settings tab; it's its own left-nav sub-app with 8 sections: Theme & Colors, Icons, Graphics & Avatars, Typography, Layout Density, Motion & Effects, Backgrounds, Preview & Apply. Each section is a left-nav item + a content panel to its right (not 3 columns — that was wrong in the old round2-corrections file). Notable content per section:
  - Theme & Colors: 6 named palettes (Obsidian [default], Neo Mint, Sunset, Aurora, Rosewood, Monochrome) as swatch cards.
  - Icons: 5 icon styles (Minimal, Tactical, Outline, Neon, Valorant Inspired) as selectable cards.
  - Graphics & Avatars: Agent Style / Rank Style / UI Graphics sub-tabs, each with a few style options (e.g. Illustrated / Stylized / Minimal).
  - Typography: font family dropdown + alternate font quick-picks + a live text preview block.
  - Motion & Effects: toggle list (Enable Animations, Hover Animations, Page Transitions, Micro Interactions, Parallax Effects, Reduce Motion) + Animation Style radio (Snappy/Smooth/Relaxed).
  - Backgrounds: a few background style options (Dark Gradient, Subtle Pattern, Matrix Grid, Custom Image upload).
  - **[Claude's call]**: keep Visual as a peer tab alongside Profile/Pipeline for now rather than promoting it to its own sidebar item — simpler, and nothing in the source suggests it needs top-level nav.
- **Billing** — include a Free/Pro/Elite plan comparison (per Michael's decision to include a monetization placeholder), directly referencing the Pipeline tier-gating above. Same shallow skeleton-level treatment as everything else this pass.
- Global Search, Notifications Drawer, Profile Popover, and the Upgrade/Checkout modal are contextual overlays in the source (triggered from a search icon, the bell icon, the account avatar, and an upgrade CTA respectively) — not tucked inside a Settings tab. **[Claude's call]**: for this reference artifact specifically, keep a small demo-trigger row (already exists as `st-overlays`) so they stay reachable for review, but don't treat that tab as real production IA.

## Mobile & Components (Group 7)

Unchanged — still explicitly lower priority, single reference page only, per Michael's earlier direction.

## Pillar naming — confirmed unchanged

Michael confirmed: keep the already-built Play dashboard's wording — **Mechanics, Game Sense, Teamwork, Discipline, Mental** — everywhere. Other reference images use inconsistent shorthand ("Aim," "Comms") for the same ideas; treat those as loose labels from earlier exploration passes, not a real naming difference. Normalize any new section you build (e.g. In-Game's Focus Pillars reference) to this exact 5-name set.

## How to build this

1. Read this directive fully, plus the specific curated images it cites, before writing anything — don't rebuild from memory of the old two files.
2. Work section by section: Navigation → Play (Loadout, Focus Details + Focus Queue, Log Match, In-Game) → Review (Reflection Matches tab, Match Detail 4-tab rebuild, Insight Detail de-tabify) → Learn (per-category callouts) → Settings (Pipeline rebuild, Visual restructure, Billing addition). Skip Stats, Learn's lesson page, and Library — already correct, don't touch them.
3. Follow the existing `.skel` / `.skel-tag` / `.skel-desc` pattern for every new region — structure only, no real data, no final visual polish (this hasn't changed).
4. Where this directive marks something **[Claude's call]**, build it as specified — don't re-litigate, but feel free to leave a short code comment if something about it doesn't fit the existing shell cleanly, so it's easy to revisit.

## Verification

1. After each section, screenshot it and compare against the specific curated image(s) cited for that section (not the old originals-only checklist).
2. List anything that doesn't structurally match — a missing sub-section, wrong tab set, wrong grouping — not visual polish.
3. Fix and re-screenshot before moving to the next section.
4. At the end, resize-test the whole artifact (drag the `.stage` handle) to confirm nothing restructures.
5. Final report: list every section touched, which image(s) it was verified against, and anything left out on purpose.
