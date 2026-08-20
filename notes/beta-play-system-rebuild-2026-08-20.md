# Beta Play System — Complete Rebuild Directive (2026-08-20)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: ready to build. This is the authoritative Play spec — it fully replaces every prior Play-related layout description.** Source: Michael's "Play System — Complete Flow Mass Board" assembled mockup plus his detailed written walkthrough (2026-08-20), which corrects several things the mockup shows imperfectly. Where the two disagree, **the written walkthrough wins** — it was written specifically to fix the mockup's gaps.

## Supersession — read this first

This document replaces:
- The `.play-grid` CSS grid-template-areas in `notes/beta-visual-conformance-spec-2026-08-19.md` Section 6.1 (derived from the old 5-figure concept set — no longer valid).
- Group 1's Play-dashboard component descriptions in `notes/beta-concept-art-final-directive-2026-08-19.md` (those were individual component references with no assembled layout — this document is the assembled layout).

**Do not blend old grid structure with anything below.** If Codex's current Play build has a "timeline" grid area, RR Card spanning two rows in the old pattern, or any other structural holdover from the old spec, it needs to go — rebuild the page structure from this document, not patch the old one.

This also changes real product logic, not just visuals, in two significant ways: **Today's Focus becomes a daily-cycling focus instead of per-match-generated**, and **the sync model changes to only two triggers app-wide**. Both are detailed below — flag anything in the existing codebase that conflicts with either before building on top of it.

---

## 1. Default Play Dashboard (`/play`)

Full-width sections, top to bottom:

### 1a. Today's Focus (top, full width — the main coaching card)
Exact layout confirmed against reference screenshot, corrected 2026-08-20: eyebrow "TODAY'S FOCUS" (small, muted), then a teal "ONE JOB" sub-label, then the focus statement as the dominant two-line headline. Below that, a "Why this matters" small heading followed by the one-line evidence sentence. "View Focus Details" as a filled primary button (not a text link). Agent artwork right-aligned per the established illustrated-art-style.

**Confidence/Impact — corrected 2026-08-20, not small pills:** these render as a **vertically stacked stat block** on the right side of the card, generously spaced apart — "CONFIDENCE" (teal label) above a large "92%" value, then a real gap, then "IMPACT" (teal label) above a large "High" value in amber/warning color. Not a compact pill/badge treatment — this needs to read as a prominent stat readout, similar scale to the RR value elsewhere on the dashboard.

**Logic change — read carefully:** the focus shown here is **not regenerated per match.** It's a **daily-cycling focus** — one consistent focus for the entire day, so the player has a single thing to work on across all of that day's matches rather than a new focus every game. Selection logic:
- Pulls from **all 5 Compass pillars** (Aim/Mechanics, Game Sense, Teamwork, Discipline, Mental) as eligible categories — every pillar must be a candidate, not a fixed subset.
- Reuses the **existing Compass pillar scoring logic** — do not build a separate weighting system from scratch. Mental's inputs (reflection-log mood + the new self/team comms ratings from Log Match, see Section 5) feed into this the same way the other pillars already aggregate in-game factors.
- The selected focus needs a **"reason why"** — a real evidence-based justification for why that pillar/category was picked today (e.g., "Your trade timing dropped in your last 6 matches"), not an arbitrary rotation. This reason is what populates the "Why this matters" line.
- "Daily cycling" means the focus can change once a new day starts, but persists across every match played within that day.
- **Corrected 2026-08-20: this algorithm is the default, not the only path.** The player can override it via the Focus Queue modal's Auto-Rotate/Self-Chosen toggle (Section 1e) — either picking a specific queued focus manually or writing in a custom one. When Self-Chosen is active, the daily-cycling algorithm doesn't override the player's pick until they switch back to Auto-Rotate.

### 1b. Game Stats (full width, directly below Today's Focus) — corrected 2026-08-20
**This is a full-width strip showing 4-5 stat tiles simultaneously** (K/D, ADR, HS%, ACS, KAST, etc.), each with a label, current value, delta, and a small trend sparkline — not a one-stat-at-a-time carousel. Arrow controls (prev/next) at the top-right of the card page through the remaining stats beyond what's visible (e.g., "1–5 of 8"). The 5 Compass pillar tiles do **not** live in this section — see 1c, they moved under the Compass widget.

**Data-freshness requirement:** these stats are computed from global/aggregate numbers and must be recalculated continuously, not cached/stale — every time a new match is logged, these recompute.

### 1c. Row of 3
- **Loadout Generator (mini/compact)** — corrected 2026-08-20, exact copy confirmed: this card should **not** preview Map/Role/Agent data (nothing has been generated yet at this point). It's a **defining placeholder** — a fancy *animated* SVG icon (not static; this is what signals "this switches you into a different mode"), one line of unbolded caption text reading exactly **"Click start for the spin loadout modal to appear,"** and a primary button labeled **"Start A Match"** (not "Spin Loadout"). Clicking it opens the full-screen Loadout flow (Section 2); it does not generate or preview anything inline on the dashboard.
- **Compass** — the existing 5-axis SVG radar component (already confirmed correct by Michael — reuse as-is). **Corrected 2026-08-20: the 5 pillar tiles (Aim/Mechanics, Game Sense, Teamwork, Discipline, Mental — score + delta each) sit directly underneath the radar, inside this same card**, not in a separate section (see 1b).
- **RR Card** — corrected 2026-08-20, restructured: current RR value at top **paired with a rank icon + rank name** (see "RR is never a flat number" rule below), then **today's total accumulated RR** (the sum across every match logged today, e.g. "Today: +23 RR" — not last-match delta), then a **progress bar** showing RR-to-next-rank (visual bar, not just a text line), then **3 read-only counters underneath the bar, bottom-aligned to the card** (the card should flex so these sit at the card's bottom edge regardless of content above): Wins / Losses / Draws (counts, not interactive buttons — remove the Win/Loss/Draw/Undo manual-adjustment button row entirely). No "Open RR Calculator" button — there is no designed modal for it, that action is removed.

**New rule, corrected 2026-08-20 — RR is never shown as a flat number anywhere in the app.** RR only has meaning paired with the rank it belongs to (a "412" alone is ambiguous without knowing which rank tier that RR sits inside). Every place RR appears — RR Card, RR Trend, Match Saved confirmation, anywhere else — pairs it with a rank icon/name, never bare digits. This applies retroactively to Section 6 (Match Saved) below too.

### 1d. Row of 3
- **RR Trend** — corrected 2026-08-20, exact header layout confirmed against reference and final: **left side** = a small rank-icon badge + current RR value + a percentage differential (e.g. "▲3%"); **right side** = the raw point-value delta for the period (e.g. "+23"). Chart below: 30-day window, oldest day on the left, today on the right, no exact x/y axis values needed — the trend shape and the two header deltas are what carry the information. Date labels underneath the chart: "30d ago / 20d ago / 10d ago / Today." **Confirmed 2026-08-20: no peak-rank/peak-RR reference anywhere on this card** — the simplified left/right header is final, the earlier spec's peak requirement is dropped.
- **Top Insight** — the single insight with the **highest impact AND highest confidence** combined (this is the selection criteria, make sure whatever picks "the" top insight actually optimizes for both, not just whichever is most recent).
- **Focus Queue (mini)** — top 3 items only, with an **Open** action (not just "View All") that launches the Focus Queue modal — see the new Section 1e below. The queue itself can hold more than 3; this dashboard card is a preview.

### 1e. Focus Queue modal (new, corrected 2026-08-20 — this changes the daily-focus logic from Section 1a)
Opened from the dashboard's Focus Queue card. This is **not just a viewer** — it's how the player can override the daily-cycling focus algorithm from Section 1a. Contents:
- A two-way toggle at the top: **Auto-Rotate** (the algorithm from 1a picks the daily focus) vs. **Self-Chosen** (the player picks or writes their own).
- Up to 4 focus cards in a row, each with: a dismiss (×) icon, the focus statement, an impact tag (High/Medium, color-coded), and a "Confidence NN%" label with a threshold-gradient bar (red → amber → green) filled to that confidence value.
- A "+ Add Focus to Queue" dashed/ghost row at the bottom — this is also where a self-chosen custom focus gets written in when the toggle is set to Self-Chosen.

### 1f. Last Match (full-width banner, bottom of dashboard)
Full width, not a normal-sized card. Shows the most recent match's result, RR change, focus adherence. The reflection button routes to **All Reflections** (the drawer/list, not just that single match's detail) — that's the explicit destination Michael specified.

---

## 2. Loadout flow — full-screen takeover, not a dashboard section

**Critical UX requirement:** while any Loadout state (idle/spinning/generated) is active, hide the sidebar and other dashboard chrome. This is a focused, distraction-free flow with one purpose: get the player to Start Match → In-Game. No other app sections should be visible or reachable mid-flow except via the explicit Exit action.

- **Idle:** real selectable dropdowns — Map (actual map list, not the mockup's "?" placeholder icons), Role (includes an "Any Role" option), Agent (reuse the **existing** agent-selector component/filtering logic already in the app — same behavior as today, not a new one). Spin Loadout as the primary action. Exit available.
- **Spinning:** a Valorant-styled SVG spinner (geometric/angular, matching the game's visual language — the mockup's circular resolver with a diamond/chevron mark in the center is a reasonable reference). Short progress caption. No dramatic layout shift.
- **Generated:** corrected 2026-08-20 — this is a **vertical/portrait composition, not a horizontal row of three slots.** It needs the rolled agent's illustrated art as a large, tall panel (same treatment as Today's Focus's art panel, scaled up to dominate a significant portion of the screen's height — this state was missing agent art entirely in the first pass, that's the most important fix here). **The art panel sits on the right side of the composition, not the left** — Map/Role/Agent result values and the Match Focus block (with Confidence/Impact) sit on the left. **Start Match** primary action, with **Spin Again** positioned near it. Exit still available even after generating.

**Agent art assets, confirmed 2026-08-20:** Michael provided 30 illustrated agent portraits (originals, not traced Riot art), copied into `beta/public/assets/agents-src/` in this repo and renamed to the confirmed mapping below (Michael cross-referenced against the official Riot agent list directly — every one of the 29 real agents is covered, nothing is missing):

```
01-Miks.png       09-Sage.png       17-Reyna.png      25-Sova.png
02-Waylay.png     10-Jett.png       18-Fade.png       26-Breach.png
03-Tejo.png       11-Viper.png      19-Harbor.png     27-Skye.png
04-Veto.png       12-Chamber.png    20-Astra.png      28-KAYO.png
05-Vyse.png       13-Clove.png      21-Omen.png       29-Brimstone.png
06-Deadlock.png   14-Iso.png        22-Cypher.png     30-Jett.png (alt/duplicate portrait — see note)
07-Killjoy.png    15-Gekko.png      23-Phoenix.png
08-Raze.png       16-Neon.png       24-Yoru.png
```

All 29 real, currently-playable Valorant agents are covered — the roster's own "Agent 08" numbering gap (a well-documented in-fiction character who has never shipped as a playable agent, confirmed via web search 2026-08-20) is not a real gap in this asset set, nothing further needs sourcing.

Note: `10-Jett.png` and `30-Jett.png` are both Jett but are not byte-identical (different file sizes) — likely two separate near-identical generations rather than a true duplicate. Both are kept; use `10-Jett.png` as the primary unless Michael says otherwise.

`21-Omen.png` is already wired into this preview's Today's Focus and Generated Loadout art. Use this table as the authoritative filename-to-agent mapping for wiring up every other agent-art placement across the app — Loadout results, agent-selector previews, Learn's agent guides, Stats' agent breakdown, etc. Apply the dark-card-background + light-radial-glow treatment to every placement, per Michael's note — see the `.agent-art-frame` CSS in the preview artifact for the reference implementation (radial purple glow behind the portrait, drop shadow, bottom-anchored crop).

---

## 3. In-Game (`/play/in-game`)

**Corrected 2026-08-20: this whole page is a single-column vertical layout**, not a two-column grid. Order top to bottom:

- **In-Game Focus card** — same daily focus, plus a short reminder line. This is a smaller/tighter restatement of 1a, not a new focus. **Confidence/Impact directly below it**, explicitly labeled ("Confidence: 92%" / "Impact: High," not bare "92%"/"High") and sized noticeably bigger than a small pill — same vertical-stat-block family as 1a's, just a more compact variant for this tighter card.
- **Focus Pillars (in-game reference)** — corrected 2026-08-20: sits **directly under the In-Game Focus text/stats block**, immediately following it (this is a vertical page — Focus Pillars is not off in a side column). **All 5 canonical pillars** (Aim/Mechanics, Game Sense, Teamwork, Discipline, Mental), each showing the player's current standing (%) and an impact tag. This is purely informational — it's the same Compass data, restated as "where you're at and what needs the most work," not a separate scoring system. (The mockup only shows 4 of these and mislabels one "Communication" — build the full 5 with "Mental" as the label, matching the canonical set used everywhere else.)
- **Focus Checklist** — a checklist of concrete actionable steps tied to the active focus (checkable items, e.g., "Stay alive through first utility cycle," "Use smoke with purpose").
- **Quick Reference** — corrected 2026-08-20: **4 categories, not 5 — Economy Guide is removed, it's not needed.** Cleaner icon-button treatment than the current build:
  1. **Map Notes** — pulls the map image with A/B/C sites marked directly on the image, plus attack/defense win rate shown as a global/community reference stat (not the player's personal stats — this is a reference panel).
  2. **Agent Tips** — general useful tips, either map-specific or agent-general.
  3. **Lineups** — includes a **search** input (not present in the mockup's mini reference card, add it).
  4. **Weapons** — pick-rate % + weapon image for each weapon, focused on pistol-round usage and Phantom vs. Vandal comparison, plus callouts for outlier usage on core weapons (Judge/Operator/Odin) when their pick rate is unusually high.

  **All Quick Reference content is static/pre-generated**, pulled from the Learn knowledge base — none of it requires a live sync. See Section 4.

- **Match Complete button** — sits below the Quick Reference section. This is the trigger described in Section 4. On a failed/empty sync response, show a **Retry** button. **Exit** is always available.

---

## 4. Sync model change (cross-cutting — read before touching any sync code)

This replaces however syncing currently works. **Only two sync triggers exist app-wide going forward:**

1. **Match-history backfill** — for players with a long match history, pull data in repeated/paginated calls until complete.
2. **Explicit player action** — specifically, the **Match Complete** button in Section 3. This is now the *only* per-match sync trigger; there is no ambient/automatic syncing tied to other features.

**Everything knowledge-related (Map Notes, Agent Tips, Lineups, Economy Guide, Weapons reference, and general Learn content) needs no sync at all** — it's static/pre-generated content sourced from the Learn knowledge base, independent of the player's live match state. If any current code path syncs for the purpose of showing reference/tip content, that's now wrong and should be removed.

---

## 5. Log Match (auto-reached after a successful sync from "Match Complete")

Auto-populated from the sync, not manually entered: Result (Win/Loss/Draw), RR Change (Before/After/Change, per the mockup's framing), Map, Agent, Score. Duration is nice-to-have, not required — don't block on it if it's not available. Per the "RR is never a flat number" rule (Section 1c), the Before/After values here should also be rank-paired where practical — at minimum, don't introduce a new standalone bare-RR field beyond what's already specified.

**Corrected 2026-08-20: the whole page is a single-column vertical layout**, not the multi-column grid the earlier draft implied. Sections stack top to bottom in this order: Result → RR Change → Match Details → Mood → Personal Performance → Comms → Reflection → Focus Adherence → End Match.

**Result field, corrected 2026-08-20: Win/Loss/Draw only — no Undo.** A logged match result isn't something the player can undo from this screen; remove that fourth button entirely.

**Corrected 2026-08-20: every rating field uses a percentage progress/slider bar, not stars — including Mood, which was originally an emoji picker.** Michael's explicit reasoning: star (and emoji) values can't represent a value "split in half" cleanly, a slider can. Give every slider a visible handle/thumb so it reads as draggable, not just a static fill bar.

**Mood specifically, corrected 2026-08-20:** renders as a slider with a labeled scale underneath the bar — text mood labels positioned along an x-axis describing each percentage range (e.g., "Frustrated / Rough / Okay / Good / Great" spaced across the width), not emoji. The label nearest the current handle position should read as active/highlighted.

Player-entered fields, confirmed as **five separate fields** (Mood and Personal Performance Score are distinct, not the same field):
- **Mood** — labeled slider (see above) — how the player felt about the match emotionally.
- **Personal Performance Score** — **self-rated by the player**, rendered as a percentage slider — a subjective "how do you think you played?" rating, not computed from stats.
- **Comms** — **two separate percentage sliders**: one for the player's own communication, one for the team's. This is new, not in the mockup at all.
- **Reflective note** — free-text field, with **auto-suggested quick tips appearing as the player types**, for common patterns. Port this behavior from the existing Notes section's quick-tip suggestion feature rather than building a new one.
- **Focus Adherence** — percentage slider (not stars, see above) — tracks how well the player stuck to their daily focus this match.

**End Match** primary action saves everything.

---

## 6. Match Saved confirmation

Green checkmark, "Match Saved!" confirmation, RR change shown. **Corrected 2026-08-20: there is no standalone "New Total" RR number** — per the new rule in Section 1c, RR is never shown as a flat number. Replace "New Total: 394" with a single combined stat: rank icon + rank name + RR value together (e.g. the rank badge showing "Ascendant 2" with "394 RR" underneath it), reusing the same rank-icon treatment as the RR Trend card (Section 1d). **Confirmed 2026-08-20:** the first match logged each day shows this rank + RR combo; subsequent matches logged the same day show the cumulative daily RR total instead (still always paired with rank, never bare digits — same rule applies). **View Reflection** and **Back to Play** actions.

## 7. Dashboard update after save

Returns to the Play dashboard (Section 1), which recalculates: Last Match banner updates to the new match, RR Card/RR Trend/Game Stats strip/pillar tiles all reflect the new data (per Section 1b's "must recalculate continuously" requirement). The "updated dashboard" state should also make the new match's full **Reflection Details** view reachable (tabs: Overview/Timeline/Focus Review/Key Moments; Reflection Summary, Focus Adherence, Key Takeaways, What Went Well) — this is what the mockup's expanded reflection panel and the "new reflection modal" reference are pointing at. Reachable from the Last Match banner's reflection button (which per Section 1e goes to All Reflections) and/or directly after saving via "View Reflection."

---

## 8. Reference/overlay row (supporting content, bottom of dashboard or its own drawer)

- **All Reflections** — drawer/list preview (recent entries + count), "View All."
- **Map Notes Reference**, **Agent Tips Reference**, **Lineups Reference** (with search), **Economy Reference**, **Weapons Reference** — each a compact preview card sourced from Learn content, with a "View Full [X]" action routing to the complete version. Same static/pre-generated sourcing as Section 3's Quick Reference — these are very likely the same underlying content just previewed from the dashboard instead of from inside In-Game.

---

## Assumptions — all confirmed 2026-08-20, none open

- Map Notes' attack/defense win rate is a **global/community** reference stat, not the player's personal stat — it's presented as reference material, not personal analytics.
- Match Saved's rank + RR vs. total-RR-for-the-day display is **confirmed conditional**: first match of the day shows rank + RR, subsequent same-day matches show the cumulative daily total (see Section 6).
- The "new reflection modal" reference is the **Reflection Details** expanded view (Overview/Timeline/Focus Review/Key Moments tabs) shown as part of the updated dashboard state, not a separate unlisted screen.
- RR Trend's peak-rank/peak-RR reference is **dropped** — not part of the final design (see Section 1d).

---

## Cross-cutting rules (carried over, still binding)

- Semantic win/loss/warn/info colors never change with palette/theme.
- `prefers-reduced-motion` honored, especially the Loadout spin sequence.
- Every interactive element keyboard-reachable with a visible focus ring.
- Reuse existing components wherever this document says "reuse" or "as currently exists" — do not rebuild the Agent selector, the Compass, the Notes quick-tip system, or the Learn content pipeline from scratch.
- Use the `?demo=1` fixture data path from `notes/beta-demo-data-mode-directive-2026-08-20.md` to populate every state described above for screenshot review — none of this should require a live account to verify visually.

## Build order

1. Sync model change (Section 4) first — this is a behavioral/data-flow change that everything else depends on; get it right before building UI on top of assumptions about when data is available.
2. Default Play Dashboard (Section 1) — including the daily-cycling focus logic (1a), the full-width Game Stats strip (1b), the Compass-with-nested-pillars card (1c), and the Focus Queue modal with its Auto-Rotate/Self-Chosen toggle (1e).
3. Loadout full-screen flow (Section 2).
4. In-Game (Section 3), including the new Weapons quick-reference category and Match Complete button.
5. Log Match (Section 5) with the new self/team Comms fields and self-rated Performance Score.
6. Match Saved confirmation (Section 6) and dashboard update/Reflection Details (Section 7).
7. Reference/overlay row (Section 8).

## How this will be reviewed

1. Screenshot the full dashboard, each Loadout state, In-Game, Log Match, and Match Saved confirmation at 1920×1080 using `?demo=1`, compared directly against the mockup and this document's corrections — not the mockup alone, since the mockup has known inaccuracies this document fixes.
2. Confirm the daily-cycling focus does NOT regenerate per match — verify by logging two matches same day and confirming the focus statement stays identical.
3. Confirm no ambient sync calls remain outside the two triggers in Section 4 — grep for sync calls tied to Quick Reference/Learn content specifically, those should be gone.
4. Confirm the Focus Pillars in-game reference shows all 5 pillars with "Mental" (not "Communication," not 4 items).
