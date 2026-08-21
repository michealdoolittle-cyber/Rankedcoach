# Beta Foundation Shell — Round 2 Corrections (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · High reasoning · Fast speed.**

**Status: open — not started.**

Michael handed the Groups 1-7 extension to Codex last round (`notes/beta-foundation-shell-full-directive-2026-08-20.md`, commit `98e2664`) because Claude was low on usage. Claude has since independently verified the result — read the full 588-line file directly and ran it through Playwright (every nav item, every visible tab, Loadout's 5-state cycle, In-Game's collapse/expand, all 4 overlay modals). No JS errors, everything functionally wires up. Most of the checklist holds up correctly. But 5 specific items were checked against the directive's content checklist and don't match — this file is scoped to just those 5, so items that already pass (Loadout, Log Match, Focus Details, In-Game, Review's Insight/Match Detail tabs, Stats' 4 tabs, Overlays) don't need to be touched or re-verified.

**Do not rebuild the whole file.** Open `notes/previews/beta-foundation-shell-reference-2026-08-20.html`, find each section below by its existing `id`, and fix only that section's content. Everything else in the file is already correct.

## 1. Settings → Pipeline tab (`#st-pipeline`) — wrong feature was built

Current content describes a content-moderation queue ("review queue, approved queue, rejected bin, publish/process controls") — that's a different system. The directive asked for the report/output pipeline configurator: **preset list + live preview + builder + quick-selector**. Replace the single skeleton box with 4 labeled skeleton regions, one per item, following the same `.skel`-per-item pattern used everywhere else in this file (see `#stats-overview`'s `module-row` for the pattern).

## 2. Settings → Visual tab (`#st-visual`) — not the 3-column workstation

Current content is one generic box ("Theme, layout style, profile border, avatar, banner, motion mode"). The directive specified a **3-column workstation: nav / editor / preview**. Rebuild as a 3-column grid (reuse `.detail-layout` or a new 3-col grid class matching the existing sizing conventions — see `--rc-gap` usage elsewhere), with one labeled skeleton per column: Nav (list of customizable surfaces), Editor (active surface's controls), Preview (live-look region).

## 3. Settings → Notifications / Integrations / Billing tabs — under-expanded

These three (`#st-notifications`, `#st-integrations`, `#st-billing`) are each a single collapsed skeleton box. Every other section in this file (Review, Stats, Learn, Library) got one skeleton box per named sub-item — these three are leftover stubs from the original reference file that never got expanded to match. Fix:

- **Notifications**: break into **grouped toggle sections** — separate skeleton boxes per group (e.g., Match Activity, App Updates, Sync Status, Content — match/patch/video/sync categories already named in the current description), not one box listing all 5 as bullet text.
- **Integrations**: break into **per-service connection cards** — one skeleton box per service (Riot, Discord, YouTube review tools), each showing connection state, not one box listing all 3.
- **Billing**: break into **3 separate regions** — Current Plan, History, Payment Method — each its own skeleton box, not one box listing all 3.

## 4. Review → Improvement Timeline tab (`#rv-timeline`) — under-built

Current content is one generic box ("Trend line, match markers, promoted cards"). The directive asked for a **5-pillar summary strip + 5 separate pillar detail cards** (same 5 pillars as the Play dashboard's Improvement Timeline tile — Play's version is correct, use it as the reference for which 5 pillars). Add: a summary strip skeleton (5 pillars, compact), then 5 individual pillar detail card skeletons below it, keeping the existing Timeline Filters box as-is.

## 5. Learn → Categories tab (`#ln-categories`) — missing search+filter, wrong callout pattern

Two fixes to the existing 4-category grid:

- Add a **search + filter row** above the category grid (a single skeleton box is fine: "Search across all categories + category/difficulty/status filters").
- The directive asked for **one personalized callout card per category** (4 total, each tied to its own category). Currently there are two generic shared cards instead ("Insight → Learn Single Hop", "Focus From Lesson") that apply to Learn as a whole, not per-category. Keep those two — they're valid concepts and don't need to be deleted — but add a 4th labeled skeleton per category tile (or directly under each of the 4 category boxes) showing what a personalized callout for *that* category would contain (e.g., "Your weakest map on this list" for Maps, "Your most-played agent's next drill" for Agents).

## How to verify

1. Fix each of the 5 items above, one at a time.
2. After each fix, reload the file in a browser (or Playwright) and confirm: the new skeleton boxes render, follow the existing `.skel`/`.skel-tag`/`.skel-desc` pattern exactly (no new CSS classes unless a layout genuinely needs one — reuse `.module-row`, `.split-layout`, `.detail-layout`, `.rail-layout`), and nothing else on the page shifted or broke.
3. Do not touch any section not listed above.
4. Report back listing each of the 5 items and what changed, so Michael/Claude can spot-check the diff rather than re-reading the whole file.
