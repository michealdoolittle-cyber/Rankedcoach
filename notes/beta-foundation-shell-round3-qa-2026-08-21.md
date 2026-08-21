# Beta Foundation Shell — Round 3 QA Pass (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · Medium reasoning · Fast speed.**

**Status: open — not started.**

The v4/v5 rebuild (commit `b114d72`) is strong — Claude independently verified 10 major views via Playwright (Play, Review's Performance Review/Reflection Matches/All Matches tabs, Match Detail, Insight Detail, Settings Pipeline, Settings Visual, Loadout, Log Match, Learn) with zero console errors and close structural fidelity to the directives, including getting the two hardest corrections right (Match Detail's trimmed 4-tab set, Insight Detail's single-scroll-no-tabs). Two concrete bugs were found in that pass, and several pages weren't checked yet due to time. This is a small, targeted follow-up — don't rebuild anything already verified working.

## 1. Fix: Compass is missing a pillar

On the Play dashboard, the Compass radar renders as a 4-point diamond (values 76/61/64/69) instead of a 5-axis pentagon. The Improvement Timeline row directly above it on the same page correctly shows all 5 pillars (Mechanics, Game Sense, Teamwork, Discipline, Mental) — the Compass needs the same 5, not 4. Find whichever pillar got dropped from the Compass's data/render and add it back as a 5th axis point.

## 2. Fix: dropped apostrophe in Pipeline Preview text

Settings → Pipeline tab, the live Pipeline Preview headline reads "win today s next two swing rounds" — the apostrophe in "today's" was dropped, likely an escaping issue in however that string gets generated/interpolated. Fix this instance, and do a quick pass checking other JS-generated/interpolated text strings for the same issue (this looked like an isolated case when spot-checked, not systemic, but worth a quick grep for other apostrophes near generated content to be sure).

## 3. Verify the pages that weren't checked yet

Claude's pass didn't get to these — screenshot each, confirm they match the v4/v5 directives structurally and stylistically (populated real content, every button wired, dark Obsidian styling, no skeleton boxes), and fix anything that doesn't match. Given how solid everything else came out, these are likely fine — this is verification, not an expected rebuild:

- **In-Game**: both the full desktop page and the compact modal variant (from `In-Game-Modal.png` / `in-game-modal-only.png`).
- **Library**: the dashboard plus all 5 resource pages (Lineups, Routines, Notes, Custom Collections, Watch Later).
- **Focus Queue**: the drag-to-reorder list, Add Focus to Queue, Clear Queue.
- **Mobile Reference**: the single reference page.
- **Specific button destinations** that are easy to leave unwired even in an otherwise-solid build: Play dashboard's Quick Actions row (all 5 buttons — Play A Match / Review Match / Practice / Study a Map / Strategy Library), Learn's Agents / Concepts / Situations tabs (only Maps was checked), Settings' Notifications / Integrations / Billing tabs (only Pipeline and Visual were checked).

## How to verify

1. Fix items 1 and 2 first, screenshot both to confirm.
2. Work through the item 3 list, screenshotting each page/state.
3. Click every button on each page in this list specifically — confirm it goes somewhere real and populated, same standard as v4.
4. Report back listing what was found wrong (if anything) per page, and what was confirmed already correct.
