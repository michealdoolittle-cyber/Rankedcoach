# Consolidated Directive: Layout, Data-Pipeline Fixes, and the Insight/AI Narrative Rebuild (2026-08-11)

**This file supersedes and consolidates:** `notes/map-pill-layout-implementation-2026-08-11.md`, `notes/map-aware-loadout-roll-weighting-2026-08-11.md`, `notes/map-economy-combined-win-loss-stats-2026-08-11.md`, `notes/agent-side-stats-and-insight-match-count-2026-08-11.md`, `notes/insights-role-context-and-selection-bias-2026-08-10.md`, and Parts 2-5 of `notes/insights-architecture-and-library-editor-2026-08-10.md`. Work from this file, not those — Part 0 below explains why (code has moved since some of those were written, and re-doing already-fixed work would be wasted effort or risk regressing correct code). The old files can stay in the repo for history but should not be treated as the current spec.

**Status: ready to build. Build in the order below** — later parts depend on earlier ones (Part 8 needs Part 0's audit results; Part 9 needs Part 8 finished).

---

## Part 0 — Verify what appears to already be fixed before touching anything

Investigating this directive, I found that three bugs from `notes/insights-role-context-and-selection-bias-2026-08-10.md` (written 2026-08-10) appear to already be resolved in the current code, even though the commit that landed after that directive (`43aaac8`, "Stabilize insight and dossier editing workflows") only visibly touched the auto-fit text-scaling bug in its diff. The fix functions already exist and are already wired into live card copy:

1. **Role-blind "Fight Value" text** — `describeFightValueInterpretation()` (`app.js:5634-5654`) already branches by role (duelist/initiator/controller/sentinel) and is already called from the `fight_conversion` trend card (`app.js:8468`, feeding `detail`/`read` at `8487-8488`). This matches the fix the old directive asked for.
2. **Unlabeled Weapon Pattern stat pairing** — `getUsageWinRatePairing()` (`app.js:5614-5632`) already produces clearly labeled, distinct usage/win-rate text and is already wired into the "Weapon Pattern" trend card's `detail` and `proofItems` (`app.js:8654, 8742-8743, 8756-8757`).
3. **Type-biased outlier scoring** — `getCoachingEvidenceScore()` (`app.js:5597-5612`, sample-size-aware, not a flat per-type penalty) exists and is correctly used for `best_agent`/`best_map`/`best_role` scoring inside `describeProfilePracticeLever()` (`app.js:5674-5730`). **However, `describeProfilePracticeLever()` is never called anywhere in the file** — confirmed via a full-file search for its name outside its own definition. The fix logic exists but is disconnected from anything a user sees. It's not clear yet what (if anything) currently drives the "pick the best signal to feature" decision live — `weeklyCandidates` (`app.js:9393+`) is a separate, hand-built array that doesn't call this function or `getCoachingEvidenceScore` at all.

**Before building anything else, do this verification pass:**
- Confirm items 1 and 2 above genuinely show correct, role-aware / clearly-labeled text for a real account (not just that the functions exist) — if they check out, no further work needed on those two, they're done.
- Determine what `describeProfilePracticeLever()` was built for (check git blame/history around when `getCoachingEvidenceScore` was introduced) and decide: wire it in wherever it was intended to be used, or delete it if it's a genuine dead end superseded by something else. Don't leave a correct implementation sitting unused — that's exactly the kind of drift this whole directive is trying to eliminate.
- Report what you find before proceeding to Part 8, since Part 8's design assumes you know whether this function is a foundation to build on or dead weight to remove.

---

## Part 1 — Session Prep layout: Map pill, role-row width, frame safety rules

*(Full content of `notes/map-pill-layout-implementation-2026-08-11.md` — unchanged, reproduced here.)*

**Visual reference:** `https://claude.ai/code/artifact/fd5bfb66-94f3-4992-8c37-5e088cc4ebfe` — approved with one change: Map pill goes **left** of the Agent pill (final order: Map, Agent, Focus Category). Build with the app's real design tokens (`.home-loadout-pill`, existing accent colors, `Rajdhani` display font), not the mockup's literal placeholder CSS.

**Real current grid** (`.home-loadout-main`, `app.css:12087-12103`): `grid-template-columns: 206px 120px minmax(0,1fr)`, areas `"roles spin reel" / "agent agent agent" / "focus focus focus"`. Roles/spin/reel currently sit side by side in one row (roles fixed at 206px); Agent and Focus Category pills are each their own separate full-width row (`.home-loadout-pill:first-child`/`:last-child`, `app.css:12202-12207`) — not a shared row like the mockup shows.

**Required changes:**
1. Add a Map pill, ordered leftmost, alongside Agent and Focus Category as a shared row (reuse `.home-loadout-pill` as the base style, add a modifier class for the Map pill's interactive/cyan-accent state).
2. Make the role-filter row's width track the agent frame's width exactly (currently a fixed 206px column vs. the frame's `minmax(0,1fr)` — these don't match today).
3. Don't move/resize `#spinAgentBtn` as a side effect unless required to achieve #2.

**Mandatory safety rules:**
- **`.loadout-card`'s outer box (width/height) must never change** — verify pixel-identical before/after on desktop and mobile. Only child elements may be restructured.
- **The spin/reel animation is fragile and has broken before from exactly this kind of change.** `spinLoadout()` (`app.js:57599+`) calls `syncAgentReelGeometry(reel, reelStrip, frame)` (`app.js:57718`, also called at `14663, 25473, 26907, 48368, 48597, 57813, 57850`) to compute the reel's landing geometry **from the frame's actual rendered pixel size**. If `#agentFrame`'s box size changes as a side effect of #2, this must be re-verified: trigger a real roll and visually confirm it lands centered and correct on desktop and mobile, across at least two themes (there's existing theme-scoped transform-origin logic at `app.js:44469` targeting `#agentFrame`'s children — confirm no conflict).

**Review:** screenshot before/after for pill order and role-row width; confirm `.loadout-card` dimensions pixel-identical; confirm a real observed roll lands correctly; cross-theme check.

---

## Part 2 — Map-aware loadout roll: select a map, weight the roll by that map's global win rates

*(Full content of `notes/map-aware-loadout-roll-weighting-2026-08-11.md` — unchanged, reproduced here.)*

**Why:** Michael wants the roll informed by real, global (not personal) agent performance on the selected map — not excluding weak-fit agents, just deprioritizing them.

**Confirmed data already exists:**
- `agent.mapWinRates[mapName]` (`public/library/gamesense-library.js:3485-3495`) — per-agent-per-map win rate, already used for display.
- `DEMO_ACT_MAP_POOLS` (`app.js:1261-1268`) — despite the name, this is the genuinely current season/act map pool (through "Season 2026 Act 4"). Consider renaming to something like `SEASON_ACT_MAP_POOLS` since it's load-bearing outside the demo experience.
- `getLoadoutAgentPool()` (`app.js:23661-23673`) / `spinLoadout()` (`app.js:57599+`) — current roll mechanism to extend.

**Build:**
1. Map selection UI — button/modal on the Home loadout roll flow, populated from the current season's active pool. No selection remains a valid default (uniform roll, as today).
2. Weighted roll, not filtered — every eligible agent under existing role/exclusion rules stays in the pool; bias selection using `agent.mapWinRates[selectedMap]` (higher win rate = proportionally more likely, never zero chance for a low-fit agent). Document the weighting formula chosen.
3. Missing-data fallback to a neutral/average weight — never zero chance or a crash.
4. Persist the selected map for the session, easy to clear/change.

**Review:** map picker shows only the current season's real pool; every eligible agent can still roll after a map is selected, with a real statistical bias over repeated rolls; missing-data fallback doesn't zero out or crash; existing role-filter/exclusion/one-trick behavior unaffected when no map is selected. Test with 200+ simulated rolls confirming the distribution favors higher-`mapWinRates` agents without ever reaching zero.

---

## Part 3 — Map economy stats: combine Bonus and Full Buy win/loss into one line each

*(Full content of `notes/map-economy-combined-win-loss-stats-2026-08-11.md` — unchanged, reproduced here.)*

In `getMapEconomyStatItems()` (`app.js:11412-11446`), combine "Bonus Round Win %"/"Bonus Round Loss %" into one **"Bonus Round Win/Loss %"** row (`win%/loss%`, e.g. `40/60%`), and "Full Buy Round Win %"/"Full Buy Round Loss %" into one **"Full Buy Round Win/Loss %"** row (e.g. `33/66%`, Michael's exact target format). Source from the same existing `{ label, total, wins, losses }` buckets (`getMapEconomyRoundSummary()`, `app.js:11326+`) — no new tracking needed. **Do not touch Pistol Round Win % or Save Round Win %** — those stay single stats. Preserve the existing "No Data" behavior for empty buckets, and keep both win and loss formula explanations in the combined tooltip (`MAP_ECONOMY_ROUND_FORMULAS`, `app.js:11178-11185`).

**Review:** exactly one combined row each for Bonus and Full Buy, correct `win%/loss%` values; Pistol/Save unchanged; "No Data" state still works.

---

## Part 4 — Agent/Role dossier Attack/Defense tabs are always empty

*(Full content of Part 1 of `notes/agent-side-stats-and-insight-match-count-2026-08-11.md` — unchanged, reproduced here.)*

**Confirmed root cause:** `buildPlayerModel()` (`app.js:7691`) builds per-map/per-agent stats via `createPerformanceBucket()` (`app.js:5034-5048`), which only has generic fields (kills, deaths, matchesPlayed, etc.) — **no side-specific fields at all** (no `attackRoundsPlayed`, `defenseRoundsPlayed`, `attackKAST`, etc.). `getSideMetricsFromMaps()` (`app.js:11125-11151`), which powers the Attack/Defense tabs in `buildCalculatedAgentDetailTabs()`/`buildCalculatedRoleDetailTabs()` (`app.js:11966`, `12041`), reads exactly those missing fields, so every sum is 0. This has likely never worked for any agent, on any account.

**Two viable fix directions** — verify which real round-level data is actually available before picking one:
- **Option A:** aggregate side-specific round metrics into `mapBuckets`/`agentBuckets`/`roleBuckets` directly during `buildPlayerModel()`'s match loop, from real round data (`match.advanced.rounds` — see Part 6 below for exactly what fields are genuinely present there). Fixes it at the source for every consumer.
- **Option B:** `buildCalculatedAgentDetailTabs()`/`buildCalculatedRoleDetailTabs()` already independently fetch real per-round data (`attackRounds`/`defenseRounds` via `getEntityRounds()`, `app.js:11974-11975`, `12049-12050`) but only use it for secondary items today. Derive Win Rate/Kills/KAST/ADR directly from those round arrays instead of the broken `getSideMetricsFromMaps(agentMaps, side)` call. More surgical, doesn't touch the shared model shape.

Either way, don't leave `getSideMetricsFromMaps`'s dependency on structurally-never-populated fields sitting next to the fix.

**Review:** Attack/Defense tabs show real, non-zero, plausible numbers for 3+ agents and for the Role modal; numbers internally consistent with real match history; General/Coach tabs unaffected.

---

## Part 5 — Insight claimed 12 Cypher matches this season, real count is 1

*(Full content of Part 2 of `notes/agent-side-stats-and-insight-match-count-2026-08-11.md` — unchanged, reproduced here.)*

The season/act filtering mechanism itself (`getScopedStatsData()`, `matchBelongsToSelectedStatsAct()` at `app.js:53505-53511`, `getMatchSeasonIdentity()` at `app.js:53415-53433`) looks structurally correct on static review — it requires an exact season-key match and excludes matches with no resolvable key. **Do not guess-patch this — reproduce it live first.**

**Two concrete suspects to check, in order:**
1. **Stale memo** — `getPlayerModel()` (`app.js:9644-9659`) caches on a key built from `activeStatsActKey`/`activeStatsActLabel`/`scoped.selectedAct`. Check whether a stale/earlier-season model could be served if Insights renders before the season selection state settles (e.g., right after sync).
2. **All-time fallback** — `analytics.agents` falls back to raw `importedAnalytics?.agents` (all-time Tracker data) whenever the locally-computed `agents` array is empty (`app.js:9607`). Confirm this isn't firing when it shouldn't.

**Required approach:** reproduce against a real account (Michael's, or a friend's given the broader review he's now doing — see Part 9). Compare, for the same agent in the same render, the Stats page's season-filtered match count against what the trend card cites. Trace exactly where they diverge before submitting a fix.

**Review:** the exact divergence point demonstrated with real data, not "should be fixed now"; confirm the memo's performance benefit isn't regressed; re-check after a normal sync + season switch in both directions.

---

## Part 6 — Two stat fields are silently dead: First Blood/Death Lane, and Agent Econ Rating

**New finding, not in any prior directive.** While verifying the Henrik data pipeline end-to-end (schema mapping in `public/schema/match-record.js` and the real round-projection logic in `public/analytics/round-metrics.js`'s `deriveAdvancedContextFromRoundByRound()`, `round-metrics.js:115-155`), two more UI fields turned out to be structurally impossible to populate, not just missing for lack of data:

1. **"Most Common First Blood/Death Lane"** — read at six call sites in `app.js` (weapon detail tabs `11712-11713`, agent/role Attack/Defense panels `11875, 11885, 11907-11908`), all pulling `round.firstKillLocation`/`round.firstDeathLocation`. **This field is never set anywhere in the real data pipeline** — `deriveAdvancedContextFromRoundByRound()`'s `projectedRounds` mapping (`round-metrics.js:121-147`) has no location/lane field at all; no code path ever captures spatial/coordinate data from Henrik into a round object. This always renders "--", for every account. Either build real lane derivation (if Henrik's raw payload actually includes per-kill location/coordinate data — check the raw V4/Raw kill event shape before assuming it does) and wire it through the schema and round-projection layer, or remove these stat items and their copy entirely rather than leaving a permanently-dead field in the UI.
2. **Agent "Econ Rating"** (General tab, `app.js:12007`) reads `agent.econ`, a field `finalizePerformanceBucket()` (`app.js:5121-5138`) never computes. Unlike the lane fields, this doesn't show "--" — it shows **"0"** for every agent (since `agent` itself is truthy, the ternary falls through to `Math.round(safeNumber(undefined))`), which reads as a real, misleadingly-precise stat rather than missing data. Either compute a real econ figure (real per-round loadout/spend data exists — `round.playerEconomy.loadoutValue`/`spent`, confirmed real in Part 4/6's investigation) and wire it through `finalizePerformanceBucket`, or make it show "--" like everything else that's genuinely unavailable.

**Review:** confirm which of the two fields get real data wired in vs. removed, and that whichever path is chosen, nothing on screen silently claims to be a real number when it isn't (a removed stat is better than a fake "0").

---

## Part 7 — Library dossier editor scope, render-race crash, weapons gallery theming, text auto-fit regression

*(Parts 2-5 of `notes/insights-architecture-and-library-editor-2026-08-10.md` — unchanged, reproduced here. Part 1 of that file is superseded by Part 8 below.)*

### 7a — Dossier text editor: broaden scope to everything except imported stats
Michael's scope: "not trying to edit imported stats... but definitely headlines, sub text, descriptive text, all of it." Go through **every** dossier section across Maps, Agents, Weapons (headlines, kickers, descriptive paragraphs, tips, lore/fundamentals — anything that's narrative copy, not a number from Henrik/match data) and wire each to `renderDossierTextField()`, the pattern already proven working elsewhere. Produce a real audit list (section → editable or not) before starting.

**Do not wire editing onto imported/computed stats** (win rates, K/D, pick rates, etc.) — read-only by design.

**Two confirmed gaps:** `gamesense-library.js:3492` and `:3495` — two static `<p>` strings under `.gamesense-weapon-panel-copy` (`.gamesense-round-conversion-note` and its sibling), never wired. Wire both the same way the neighboring `focus` field already is (`gamesense-library.js:3500`).

**Tips: text-editing works, add/remove tiles does not — genuinely new functionality.** `renderMapTipsPanel()` (`gamesense-library.js:2895-2918`) already wires each existing tip's text to `renderDossierTextField()` (`2911`) — verify it still works live given the render-race bug in 7b may interfere. What's missing: add up to 4 tip tiles / remove any — `getMapTipsViewModel()`'s fixed `tips` array (`2845+`) has no insert/delete mechanism today. Build it.

**Maps locations stay rename-only — do not add delete for those.** Keep this distinct from the new Tips add/remove UI.

### 7b — Fix the `commitRender` render-race crash
Confirmed root cause: `render()` (`gamesense-library.js:4800-4829`) can defer `commitRender(root)` inside `document.startViewTransition()`'s async callback; a second `render()` call (plausibly from a `blur` event exiting an editable field) can replace the DOM before the first call's deferred callback fires, crashing on a detached node (`NotFoundError`). Guard against it — confirm `commitRender` checks `root.isConnected` before touching it, or otherwise ensure overlapping `render()` calls can't race. This likely contributes to the broader "editing doesn't work" experience, not just a console error.

### 7c — Weapons gallery inherits layout-style theming, should use default theme
Best-guess target: `.gamesense-entry-card.gamesense-weapon-entry-card` (`gamesense-library.js:1982`, the "All Weapons" gallery grid). Confirm live and check whether it's picking up layout-style-scoped CSS that Agent/Map gallery cards correctly don't.

### 7d — Text/font auto-fit scaling: confirmed regressing, not just persisting
Reproduces now in the weapon skins area **without any sync notification present** — not gated behind the previously-identified triggers (update check, sync toast). This is `installThemeBuilderAutoFitObservers()`'s `MutationObserver` (the 160ms debounce from `c5abc37` did not fix the real mechanism). Don't add this as another trigger to a list — trace the weapon-skins-specific behavior directly (likely image lazy-loading, hover-state DOM changes, or periodic re-renders in that area) and close the actual mechanism. Verify under idle, mid-sync, and mid-notification conditions before calling it fixed.

**Review (7a-7d):** dossier audit list with before/after status; render-race reproduced deliberately (rapid edit-then-navigate) and confirmed gone; weapons gallery theme rule identified and confirmed live-traced; all three auto-fit triggers confirmed non-reproducing after the page has settled.

---

## Part 8 — Consolidate insight/trend duplication into one canonical signal set

**This replaces Part 1 of the old `insights-architecture-and-library-editor-2026-08-10.md` directive** with a sharper, more complete version based on a full audit done today.

**The real scope, confirmed by tracing every surface:** there are **six** independent systems that each restate overlapping facts (best/weakest agent, map, role; K/D; ADR; KAST) with their own hand-tuned thresholds and their own English phrasing:

| Surface | Data source |
|---|---|
| Recent Match Trends (Stats page) | `model.trends`, `app.js:8479+` |
| Match Patterns (Stats page) | `model.breakdown`, `app.js:8785+` |
| Important Insights (Insights page) | `globalThis.RankedCoachCoachingRules.matchRules()`, `public/analytics/coaching-rules.js` |
| Supporting Reads (Insights page, 4 tabs) | `model.trendBreakdown`, `app.js:8881+` |
| Weekly Focus / Main Focus (Insights page) | `model.scoring.weeklyCandidates`, `app.js:9393+` |
| Ask Coach (chat modal) | `buildAskCoachAIContext()`, `app.js:9866` — real LLM call, architecturally different from the other five |

The `coaching-rules.js` engine (Important Insights) is the standard to hold the rest to — declarative conditions, explicit `minMatches` gates, honest `"policy"`/`"blocked"` entries for signals the data genuinely can't support. The other four (Recent Match Trends, Match Patterns, Supporting Reads, Weekly Focus) are ad hoc template systems that should not exist as four separate implementations.

**Additional confirmed bugs to fix as part of this consolidation:**
1. **`selectWeeklyFocusCandidate()` (`app.js:19999-20007`) computes nothing from the `score` field each weekly candidate carries.** It ranks only by confidence tier, then by a `priority` field that is never set anywhere in the candidate array (`app.js:9393+`) — meaning ties within a confidence tier are decided by array-insertion order. Fix it to actually use `score` (or remove `score` if it's being intentionally superseded — but then say so, don't leave a computed-and-ignored field).
2. **Two dead-code blocks sit in the live file behind an early `return`:** `renderTrendBreakdown()` (`app.js:26638-26670`) and `renderStatsPerformanceModel()` (`app.js:61378-61402`) both immediately return a different function, leaving stale, divergent copy-generation logic unreachable underneath. Remove the dead bodies — they're a real risk for a future edit landing on the wrong (unreachable) copy of the logic.
3. **Whatever the Part 0 audit determines about `describeProfilePracticeLever()`** — wire it in or remove it, per Part 0's findings.
4. **Match Patterns' "Agent Selection"/"Map Pattern"/"Role Fit" cards are near-duplicates of what Supporting Reads already shows.** Don't present the same fact as two separate insights.

**Build:**
1. **One canonical, deduplicated signal set**, computed once per player-model build: best/weakest agent, map, role; K/D; ADR; KAST; weapon pattern; mood pattern; etc. — each scored with **one shared, confidence/sample-size-aware formula** (`getCoachingEvidenceScore()` already exists and is proven correct — reuse it everywhere instead of the five-plus bespoke `selectionScore` formulas currently scattered across `app.js:8479+`, `8785+`, `8881+`).
2. **Make Recent Match Trends, Match Patterns, Supporting Reads, and Weekly Focus each a *view* over that one signal set** — a different slice, count, or framing of the same scored facts, not an independent re-derivation. This guarantees the same number and the same "is this good" verdict everywhere a given fact appears.
3. **A shared stat-pairing/labeling convention** (`getUsageWinRatePairing()` already does this correctly for usage-vs-win-rate pairs — audit for any other place two related-but-distinct percentages are shown together without this treatment, and apply it there too).
4. Audit **every** insight/trend/breakdown card in the file against this new shared layer — report the full list checked and what was migrated, not just the ones already known about.

**This part must be finished and verified before starting Part 9** — the AI narrative layer in Part 9 is only as good as the facts it's fed, and feeding it today's six-way-duplicated, inconsistently-thresholded signal set would just make the disagreements between cards sound more eloquent, not fix them.

**Review:** report the full audit list of cards checked/migrated; confirm the same underlying fact (e.g., "best agent") now produces the same score and a consistent "is this good" verdict everywhere it's surfaced; confirm `selectWeeklyFocusCandidate` genuinely uses its score; confirm the dead code is gone; `node --check` + full test suite.

---

## Part 9 — AI-generated narrative layer on top of the canonical signal set

**Depends on Part 8 being complete.** This is the new work discussed directly with Michael, approved for broad rollout — he has friends whose accounts he can personally review as part of QA, so this does not need to be gated behind a long internal-only trial first. It does need real safety rails from day one given everything this session has found about the deterministic system's accuracy problems.

**What to build:**
1. **Trigger point: after sync completes, not on page view, not per card.** Once Part 8's canonical signal set is built for the current sync, package it into one context object — reuse the same shape/pattern `buildAskCoachAIContext()` (`app.js:9866-9952`) already uses (insights, agent/map/role summaries, evidence layer, matched coaching rules, recent logs) — and send **one** call to the same backend AI mechanism Ask Coach already uses (`supabaseClient.functions.invoke`, `app.js:9954+`). Don't build new backend infrastructure; reuse what's already paid for and working.
2. **Only generate narrative/explanatory text, never raw numbers.** The AI call should produce the "why/how" sentences for the top cards (Main Focus's WHY/HOW fields, the top Insight card's detail text) — every literal stat value on screen stays 100% deterministically computed by code, always. This bounds the hallucination risk to prose, never to a number a user could act on incorrectly.
3. **Cache the result and only regenerate when the underlying signal set actually changes** — not on every sync if the top signals didn't meaningfully move. Tie invalidation to the existing generation-counter pattern already used for `playerModelMemo`/`statsPipelineSourceGeneration` (`app.js:9646-9653`) rather than inventing a new cache-key scheme.
4. **Structural validation before ever showing an AI response.** Require the AI's response to cite which canonical signal(s) (from Part 8's signal set) it used. Programmatically verify every number/fact mentioned traces back to something actually present in the context packet sent. If validation fails, or the call errors/times out, **silently fall back to the existing deterministic template copy** — the deterministic system must keep working standalone; the AI layer is a strict enhancement on top of it, never a replacement that can leave a card broken.
5. **Reuse the existing feedback mechanism to measure quality, don't build a new one.** Insight cards already have "Saved as useful"/"Saved for review" buttons (`recordInsightFeedback()`, `app.js:26689-26701`). Tag each feedback record with whether the card it was given on was AI-generated or template-generated text, so helpful-rate can be compared directly between the two — this is the real quality signal over time, not a one-time read-through.
6. **No fine-tuning, no training loop.** The AI call is stateless per sync — it does not need, and should not be built to expect, an accumulation period before it can produce good answers. A new account's answers will be appropriately hedged (low confidence, small sample) from day one, exactly as the deterministic system already handles low-sample accounts today, via the same confidence scoring from Part 8.

**Review:**
1. Confirm the AI call fires once per sync completion, not per page view — verify with a real sync and checking network/call logs.
2. Confirm a forced API failure (simulate a timeout or error response) results in the existing deterministic copy showing correctly, with no broken/blank card.
3. Confirm the structural validation genuinely rejects a deliberately-corrupted test response that references a fact not in the packet, and falls back correctly.
4. Confirm feedback recorded on an AI-generated card is tagged as such and distinguishable from template-generated feedback in whatever storage backs `recordInsightFeedback`.
5. Have Michael spot-check real output against at least 3 real accounts (his own plus friends') for tone and factual accuracy before considering this broadly live.
6. `node --check` on every touched file; run the full existing test suite.

---

## Overall testing checklist

1. Part 0: verification report on the three already-appears-fixed items, plus a clear decision on `describeProfilePracticeLever`.
2. Part 1: mockup-matching screenshots, `.loadout-card` dimension check, live spin-animation confirmation.
3. Part 2: 200+-roll statistical distribution check.
4. Part 3: combined Bonus/Full-Buy stat rows verified against real map data.
5. Part 4: non-zero, plausible Attack/Defense numbers for 3+ agents and the Role modal.
6. Part 5: real divergence point demonstrated for the 12-vs-1 match count bug.
7. Part 6: confirm First Blood/Death Lane and Econ Rating either show real data or are honestly removed — never a fake "0" or permanently-dead "--".
8. Part 7: full dossier editor click-through, render-race reproduction, weapons gallery cross-theme screenshots, auto-fit triggers reproduced and confirmed gone.
9. Part 8: full audit list of migrated cards; consistency check across surfaces for the same underlying fact.
10. Part 9: fallback-on-failure test, structural validation test, feedback tagging check, and Michael's real-account spot-check before broad rollout.
