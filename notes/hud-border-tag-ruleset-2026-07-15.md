# HUD Border & Tag Ruleset — Content Cards Only (2026-07-15)

**Status:** Ready to build. This follows a multi-round design pass with Michael (two published mockup artifacts, iterated against his live feedback) — the ruleset below is the converged, approved result, not a first draft. Reference artifacts for exact visual values:
- `https://claude.ai/code/artifact/9064fd2e-6fbe-4c47-9325-22fd902ac06d` — the approved ruleset, demonstrated on full Home and Insights page mockups built from real screenshots taken of the live app.

**The ask, in Michael's words:** the app "does not feel unique" — good layout, generic trim. He does not want the layout changed. He wants two specific things generalized into a real system: **gradient borders** on cards, and the **flag-cut gradient tag** (the shape that read best was the Active Season/Patch style pill) replacing every rounded pill in the app.

---

## The 4 rules (exact CSS, lift directly from the approved artifact)

### Rule 1 — Gradient border, not flat border
Every card keeps its current shape, radius, and padding. Replace the flat `1px solid var(--line))`-style border with a 1.5px gradient stroke, color-mapped to what the card means:
```css
.card{
  background:
    linear-gradient(var(--panel), var(--panel)) padding-box,
    linear-gradient(135deg, var(--edge-a, var(--cool)), var(--edge-b, var(--cool-2))) border-box;
  border:1.5px solid transparent;
}
.card--hot{ --edge-a:var(--hot); --edge-b:var(--hot-2); }   /* needs-attention / alert content */
.card--good{ --edge-a:var(--good); --edge-b:var(--good-2); } /* confirmed win / strength content */
```
Default (no modifier) = cool cyan→violet, for neutral/informational cards. This is a pure `border` swap — no clip-path, no corner change, works on the existing rounded-rect card markup as-is.

### Rule 2 — One tag component, replacing every rounded pill
```css
.tag{
  --clip:polygon(7px 0, 100% 0, 100% 100%, 7px 100%, 0 50%);
  clip-path:var(--clip);
  display:inline-flex; padding:1.4px;
  background:linear-gradient(90deg, var(--tag-a, var(--cool)), var(--tag-b, var(--cool-2)));
}
.tag span{
  clip-path:var(--clip);
  background:var(--panel-2);
  padding:4px 11px 4px 13px;
  font-family:"Consolas","SF Mono",ui-monospace,monospace;
  font-size:10.5px; letter-spacing:.05em; text-transform:uppercase;
}
.tag--hot{ --tag-a:var(--hot); --tag-b:var(--hot-2); }
.tag--good{ --tag-a:var(--good); --tag-b:var(--good-2); }
.tag--flat{ --tag-a:var(--faint); --tag-b:var(--line); }
```
This replaces: Active Season pill, Patch pill, Confidence/Priority tags, Strength/Needs Work tags, RR delta badges (`log-result-rr`, `app.js:41957`), Focus Category tags — every place a rounded pill currently exists.

### Rule 3 — Gradient tick on eyebrow labels
```css
.label{ display:flex; align-items:center; gap:7px; font-family:"Consolas",monospace; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; }
.label::before{ content:""; width:11px; height:2px; background:linear-gradient(90deg,var(--label-a,var(--cool)),var(--label-b,var(--cool-2))); }
```
Applies to small uppercase section labels: WHY, HOW, SOURCE, MAIN FOCUS, THIS WEEK'S FOCUS, PRIORITY TRENDS, etc.

### Rule 4 — Dividers fade, don't cut
```css
.divider{ height:1px; background:linear-gradient(90deg, var(--div-a,var(--cool)) 0%, transparent 60%); }
```
Replaces flat `border-top`/`hr`-style section separators inside a card.

**Color tokens** (add if not already present as CSS custom properties): `--hot:#ff5a47; --hot-2:#ffb23d; --cool:#35c6f2; --cool-2:#6e7cff; --good:#3ddc84; --good-2:#22b8a3;`

---

## Scope: apply to content cards, not data-visualization or input surfaces

This distinction is the actual design decision, confirmed explicitly by Michael after a rejected first pass — don't skip it or apply the rules blanket-wide.

**Rule of thumb:** apply Rules 1–4 to any card that is primarily coaching copy, a list of read-outs, or carries a status tag. **Do not** apply them to charts, meters, radar/diamond visualizations, dense numeric stat-tile grids, or input controls (dropdowns, rating-button grids, filter/icon buttons) — those keep their exact current styling. If unsure which bucket a given card falls into, match it against the confirmed examples below rather than guessing.

### Confirmed IN scope (build these)
- **Insights page, in full** — Main Focus card + Why/How/Source triptych, Priority Trends filter tabs, the highlighted trend card (e.g. "Map Preparation Gap"), Trend Groups mini cards, the 3-column pattern grid (Map Pattern / Best Agent / Map Pattern cards with Strength/Needs Work tags).
- **Home — "This Week's Focus" card** (weekly-read rows + Confidence tags) and **"Recent Improvement" card** (KPI tiles + delta tags).
- **Stats page — "Recent Match Trends" cards** (`app.js:13478`, the 6-card grid with Needs Work/Strength tags — Damage Pressure, Recent Mechanical Form, Weapon Pattern, Fight Value, Win Rate, Team Utility) and the **"Match Patterns" carousel card** (`app.js:13484`).
- **Logging page — the Session Debrief card** (the "Lock in what this match actually taught you" card, including its "Waiting for Reflection" tag) and **every log feed entry** (`renderLogFeed`, `app.js:41873` — agent icon, RR badge already at `app.js:41937-41957`, Focus Category/Map/Self Rating/Mood/Team Comms/Self Comms rows). The RR badge specifically becomes a `.tag` — this was the exact element Michael called out as the strongest single win, so get this one right first and use it as the reference implementation for the rest.
- **Gamesense Library — in full, this is actually where the approved tag shape originated** (the Active Season / Patch pill Michael called out first was a Library dossier header element, not a Home one — treat Library as a confirmed, not speculative, part of this scope):
  - The Library home header (`RANKED FIELD GUIDE / GAMESENSE LIBRARY`) and its Active Season/Patch strip.
  - Every dossier header — Map (`renderMapDetail`), Agent (`renderAgentDetail`, `gamesense-library.js:313`), and Weapon detail heads, including the `.gamesense-patch` pill (`gamesense-library.css:665`) → becomes a `.tag`.
  - Tips content: the category tabs (Attack Side / Defense Side / Site-Specific / Teamplay Strats, `renderMapTips`, `gamesense-library.js:197-235`, `.gamesense-tips-hub`) get the same tab treatment as Insights' Priority Trends tabs — text-label tabs, not icon controls, so they're in scope by the same precedent. The Round Read callout cards underneath get the card border treatment.
  - Current-Season Comps / roster cards (`renderComp`, `gamesense-library.js:295-333`, `.gamesense-comp-card`) — card border on the outer panel, pick-share labels become `.tag`. Leave the individual colored agent-portrait tiles' own fill colors untouched, same principle as not touching Home's stat-bar colors.
  - Weapon Suggestions cards (`renderWeaponSuggestions`, `gamesense-library.js:221-235`, `.gamesense-weapon-suggestion`) — the "Highest Rifle Conversion" style labels become `.tag`, card gets the border.
  - Agent Fundamentals, Agent Facts and Stats, and Lore/History cards (`gamesense-library.js:357`) — pure content cards, in scope.
  - Map Fit pick%/win% pills (`gamesense-library.js:332-339`, `.gamesense-map-fit-item`, `gamesense-library.css:728-729`) → become `.tag`. The ability detail panel's Round Purpose / Setup and Difficulty text blocks are in scope as content cards.

### Confirmed OUT of scope (leave exactly as current styling)
- **Nav bar**, globally — active tab stays solid-fill, RR-to-next-rank/RR-to-goal-rank pills stay flat-bordered. Explicitly rejected in review, don't reintroduce it.
- **Home** — Filter panel (the All button, icon grid, Agent/Focus Category dropdowns), the Aim/Game Sense stat panel (radar chart + colored stat bars — keep their original orange/blue/green/yellow), the Synced rank movement summary panel (Wins/Losses/Draws/Games tiles, the Carry/Solid/Poor impact meter), and the RR chart + window-size buttons (5/10/20/50).
- **Stats page** — the top KPI tile row (KD/Win%/ADR/HS%/First Bloods/Damage-per-Round), the Peak Progress panel, Role Win Rate Progress tiles, and the Map Stats / Agent Stats / Weapon Stats grids (these are dense data-tile grids, same category as Home's rejected panels).
- **Logging page** — the Performance/Mood/Team Comms/Self Comms rating-button grids and the Choose Agent/Focus Category/Map dropdown rows (input controls, not content cards).
- **Library** — the Map Locations / Spike Plant Hot Spots interactive map view (pan/zoom controls, callout markers — a tool, not a content card) and the ability/weapon selector grids (icon+name button clusters, same category as Home's rejected filter icon grid). The `SELECTED` state tag on the active ability button still becomes a `.tag` even though the grid itself is out of scope, same as the RR badge inside an otherwise-untouched log entry.

---

## Testing checklist — don't report this batch done until:

1. Fresh screenshots of Insights, Home, Stats, Logging, and the Library (home + at least one Map/Agent/Weapon dossier) confirm: every card listed as in-scope shows the gradient border + tag treatment; every card/panel listed as out-of-scope is pixel-identical to its current production styling (diff against a pre-change screenshot if unsure).
2. The RR badge in the log feed renders as a `.tag` and still correctly reflects verified/unverified/placement state (per the two earlier Henrik directives — don't regress that logic while restyling it).
3. Nav bar is unchanged from current production styling on every page.
4. Color mapping is semantic, not arbitrary: needs-work/priority-immediate content uses `--hot`, strength/confirmed-win content uses `--good`, neutral/informational content uses the default cool gradient — spot-check a few cards against this rule rather than assuming it's consistent everywhere.
5. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
6. Bump the cache key in `public/index.html` for every changed asset.
