# RankedCoach Stat-Baseline & Coaching-Resolver Master Directive (2026-08-18)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.** Bumped from an earlier "High" pass at this same directive — Parts C/D below are new resolver architecture, not a data swap, and warrant the same reasoning tier as the hardest open item already on file (`notes/animated-theme-gpu-cost-2026-08-17.md`).

**Status: ready to build, in phases.** This is one directive covering five parts that build on each other — don't attempt them out of order. Phase 1 (Parts A+B) is small and self-contained. Phase 2 (Part C) is the real new engine and the one to get right before touching Phase 3 (Part D), which extends it. Phase 4 (Part E) is a process fix that can run in parallel with any of the above.

---

## Part 0 — Voice rules for every card produced anywhere in this directive

The app already has a written coaching-voice constitution (`COACHING_LANGUAGE_RULES`, `public/app.js:5380-5403`) and a real card template used throughout the insights engine (`type`/`title`/`preview`/`what`/`why`/`action`/`sources`/`focus`/`category`/`priority` — see any `insights.push({...})` block, e.g. `app.js:8060-8071`). Follow that template exactly. On top of the existing rules, these are non-negotiable — corrected live after a first draft got every one of them wrong, so treat them as hard-won, not stylistic preference:

1. **Never name the specific rank tier in copy** (no "vs. the Gold benchmark"). The player already knows their rank. Say "your rank's average" / "your rank" instead.
2. **State deltas as a plain percent**, not "points," when the underlying stat is itself a percentage (win rate, HS%). "8% above your rank's average," not "8 points above."
3. **`why` means "why is this true for this specific player," never "why does this benchmark/metric exist."** Build it from other real, already-computed signals — role win rates, map win rates, weapon usage/win rate, economy win rates (`overview.fullBuyWinRate`/`ecoWinRate`/`lightBuyWinRate`, `app.js:7772-7774`), agent/map/weapon entity-profile reasoning (Part C/D), or a matched `coaching-rules.js` entry — never from explaining comparison methodology. **If nothing clears a real threshold, cut the `why` line — do not fill it with filler.**
4. **Never suggest sticking with a specific role or agent as an action.** The app deliberately varies role/agent (the loadout "spin" mechanic) — recommending "keep playing the same role/agent" fights the product's own design. Name something the player actually controls and logs instead (confidence, comms, mood consistency), framed as correlation not proof of cause, same as `buildWarmupCorrelationInsight` (`app.js:1170-1193`).
5. **Never tell the player to "check back later" or "recheck in N games."** These cards recompute continuously — that instruction asks the player to do the app's own job.
6. **Never emit a bare stat with no anchor** ("signal" language). Every card states the number, a reference point (own baseline, rank baseline, or entity-profile expected direction), and a direction together ("trend" language). If no anchor is available for a stat, don't surface it — see Part C.

---

## Part A — Rank/global baseline data

### Background

The only "is this stat good or bad for this player's rank" mechanism in the app is `public/data/rank-benchmarks.js`. It holds `RANK_BENCHMARKS` (Iron through Ascendant, three metrics only: `hsPercent`, `acs`, `kd`), sourced from a 171-player UpForge sample captured 2026-07-10 and explicitly marked `provisional: true`.

It's consumed in exactly one place: `public/app.js:7780` builds `rankComparison` via `compareRankMetrics()`, which feeds a single "Rank Benchmark Check" Insights card at `public/app.js:7986-8012`. Two problems with that card as it stands:

- The copy hardcodes the literal strings "Provisional" and "July 2026" at lines 7998, 8002, and 8006, instead of reading `rankComparison.source.provisional` / `.asOf`.
- Its own "why" line admits the gap: "Your existing agent, map, and trend reads still compare you with your own history." Confirmed true — `.stats-agents-card`, `.stats-maps-card`, `.stats-weapons-card`, and "Recent Match Trends" (`.stats-performance-card`, copy at `public/app.js:19123-19124`) are all self-referential today. None compare a player against any global or rank baseline.

New source data exists at `notes/data/tracker-gg-aggregate-data-2026-08-18.md`, captured today. Complete for: all 29 agents (tier, win rate, K/D, damage delta/round), all 19 non-melee weapons (including Bandit, Patch 13.01's addition — see Part E's manifest), all 7 current-rotation maps, and rank benchmarks by tier including **win rate**, which the old table lacks entirely. Only rank population distribution (its section 6) is rough — don't build on those exact numbers.

### What to do

1. **Replace the benchmark table.** Swap `RANK_BENCHMARKS`/`SOURCE` in `public/data/rank-benchmarks.js` for section 4 of `tracker-gg-aggregate-data-2026-08-18.md`. Add `winRate` alongside `hsPercent`/`acs`/`kd`. Immortal still has no data — don't invent a number. Decide deliberately whether `provisional` should still read `true` (broader capture, still screenshot-read not API-pulled — don't overclaim certainty).
2. **Wire `winRate` into the comparison call** at `public/app.js:7780` — add `winRate: overview.winrate`.
3. **Fix the hardcoded copy** at `app.js:7998/8002/8006` to derive wording from `rankComparison.source` instead of literal strings. Add win rate into `actionByMetric` (line 7990) and the `weakest`-metric logic.
4. **Extend the same comparison to Agent/Map/Weapon stats** (`.stats-agents-card`/`.stats-maps-card`/`.stats-weapons-card`, plus `.stats-performance-card`'s win-rate read) — additive, self-history stays primary.

### Test note

`testing/henrik/formulas.test.js:175-184` asserts `gold.source.provisional === true` and a Gold HS% input of 22.7 as `"near"`. New Gold HS% (22.8%) keeps the `"near"` assertion true (delta ~0.4%, inside the 5% band) — but the `provisional` assertion needs a deliberate update matching whatever you decide in step 1.

---

## Part B — Library/dossier factual-accuracy audit

`docs/reports/dossier-openai-*.md` show a separate, already-in-progress pass (`scripts/one-time-dossier-openai-pass.mjs`) rewriting the *tone* of the Library's map/agent/weapon coaching copy. That pass only changes phrasing, never facts. This part is a factual-accuracy layer on top, not a rewrite of the same text — don't conflict with it.

Use the agent tier list (source data section 1) and weapon win-rate/HS% data (section 2) to check `agentInsights` and `weaponSuggestions` copy in `gamesense-maps.js`/`gamesense-promoted.js`/`gamesense-reference.js` for claims that contradict real standing — e.g., copy implying an agent is a strong map pick when it sits Tier C/D globally, or a weapon note the win-rate data doesn't support. **Flag contradictions in a changelog; don't silently rewrite.** Michael reviews and decides case-by-case. Skip out-of-rotation maps (Bind, Abyss, Corrode, Fracture, Icebox, Pearl) — the source data intentionally excludes them.

---

## Part C — Match Trends Resolver (the new engine, build this before Part D)

### What Match Trends actually needs to be

Not five fixed UI categories. The tutorial copy at `app.js:19123-19124` names duel conversion/win rate/mechanical form/round damage/utility value as examples, but the real scope is **any stat, sliced any way it actually shows up in the recent window** — weapon kills, per-role stats, per-map stats, econ stats, down to specific combinations like Operator econ conversion, KAST rising across all games or in one specific role, or an agent's utility upkeep/damage delta when they've been played several times this window. **Stats only — never reflection-log data (mood/selfComms/rating/notes).** That boundary is what separates this from Part D.

The failure mode of the old five-category version: bare stats with no anchor ("signal" language the player has to interpret themselves) instead of trend language (number + reference point + direction, self-evidently readable). Part 0, rule 6 is the fix, structurally enforced here.

### Build: `public/analytics/match-trends-resolver.js`

New module, same pattern as `public/analytics/coaching-rules.js`/`round-metrics.js`. One function: `resolveMatchTrends(context)`, where `context` reuses the slices already computed in `getScopedStatsData()`/`buildCoachingEvidenceLayer()` — `agents`/`maps`/`roles` breakdown arrays, `overview` (including `fullBuyWinRate`/`ecoWinRate`/`lightBuyWinRate`), `roundSignals`, weapon families via the existing `getFamily()`-style lookups in `coaching-rules.js`. **Do not recompute anything that already exists** — this module consumes, it doesn't re-derive.

**Algorithm:**

1. **Enumerate populated slices for the recent window.** Every agent/map/role/weapon-family/economy-bucket that clears a real sample-size floor this window (reuse the `minMatches` pattern already established in `coaching-rules.js`'s `RULES` array — don't invent a new threshold system).
2. **Cross every slice against every stat that slice actually carries** (win rate, K/D, ACS, HS%, ADR, KAST, damage delta, econ conversion, utility casts, clutch rate, trade rate — whatever fields the breakdown object for that slice type actually has; don't force a stat onto a slice that doesn't track it).
3. **Anchor every surviving pair, or drop it.** Three possible anchors, in priority order: (a) the player's own longer-window baseline for that same slice, (b) the rank benchmark from Part A, for overall/global-level stats only, (c) the entity-profile expected direction from Part D's `gamesense-stat-profiles.js` (once it exists — see Part E), for agent/map/weapon-specific slices. If none apply, the pair is dropped — no bare-number cards, ever.
4. **Dedup by specificity.** If an agent-slice and its parent role-slice both fire for the same stat over materially the same rounds, keep the more specific (agent) card and suppress the broader one.
5. **Rank and cap** using the same `priority`-field sorting pattern already used by `insights.push()` consumers.
6. **Assemble through the Part 0 template**, sourcing `why` from the matched entity-profile reasoning or a `coaching-rules.js` active matcher when available, cutting the line otherwise.
7. **Structural stats-only enforcement:** `resolveMatchTrends()`'s signature must not accept the `logs` array at all — this needs to be true by construction, not by convention, so Part D can't accidentally collapse the boundary.

### Review checklist for Part C

- [ ] Confirm the resolver produces cards for at least three different slice types (agent, map, economy) in one real test session, not just one.
- [ ] Confirm every emitted card has a real anchor visible in its `preview` line — spot-check that none are bare numbers.
- [ ] Confirm dedup actually suppresses a redundant broader-slice card when a narrower one covers the same rounds.
- [ ] Confirm the function signature has no path to `logs` data.
- [ ] Confirm existing `.stats-performance-card` rendering still works when wired to this resolver's output instead of the old five-category logic.

---

## Part D — Insights Resolver (extends Part C, build second)

Insights is Part C's resolver plus a behavioral overlay — it needs the stat side resolved first, which is why Part C has to exist before this does. Add a second pass that reads `logs` (mood/selfComms/teamComms/rating/notes) and layers correlation cards on top of a Part C stat-trend slice for the same window, using the same "correlation, not proof of cause" framing as `buildWarmupCorrelationInsight` (`app.js:1170-1193`) — see the "Low Self Comms Lining Up With Late Trades" and "Confidence Dip Lines Up With a Rough Stretch" examples already agreed on for the shape this should take. The communication/teamwork entries in `coaching-rules.js` (`comms-trade-correlation`, `tilt-performance-correlation`, `comms-kast-correlation`, `logged-comms-breakdown` — all requiring `minLogs`) plug in here specifically.

Existing ad-hoc `insights.push({...})` blocks that duplicate a slice Part C's resolver already covers should be migrated to consume the resolver's output rather than maintain two separate implementations of the same comparison. Cards that are genuinely log-only (no stat component) stay as they are.

### Review checklist for Part D

- [ ] Confirm at least one behavioral-correlation card fires correctly on real data with both a stat delta and a logged behavioral signal present.
- [ ] Confirm a card never states correlation as causation (spot-check wording against the warm-up insight's existing disclaimer pattern).
- [ ] Confirm no duplicate cards appear for the same slice+stat from both the old ad-hoc logic and the new resolver during the migration.

---

## Part E — Content-completeness gate (fix the confirmed gap, then prevent it recurring)

### The confirmed problem

`docs/reports/dossier-openai-overhaul-2026-08-18.md` reports 494 fields enumerated, 432 changed, **62 skipped/logged** — and nothing since has gone back to resolve those 62. Checked the actual list (report lines 450-516): it spans at least Bind, Breeze, and Split map content, and ability `purpose`/`setup` fields for at least 13 agents (Omen, Brimstone, Chamber, Clove, Deadlock, Fade, Iso, Neon, Reyna, Tejo, Vyse, Waylay, Yoru), plus weapon `howToUse` fields for Phantom and Sheriff — for reasons including "model returned unchanged/empty text" and "source occurrence count N in gamesense-maps.js" (the script couldn't uniquely target which repeated instance of a string to replace). **This is exactly the "codex missed several maps, agents, and weapons" problem** — logged, but never gated or followed up, so it silently became permanent.

Separately: `scripts/one-time-stat-profile-pass.mjs` (the entity-profile generator Part C/D depend on for the `why` anchor) has never actually run for real. `docs/reports/stat-profile-pass-2026-08-18.md` shows `Mode: enumeration only (--no-api)` — 0 profiles generated. Three smoketests prove the approach works (Reyna, Viper, Bucky, Summit all got real, specific, well-reasoned profiles), but the output file `gamesense-stat-profiles.js` doesn't exist anywhere in `public/` yet.

### The fix: every entity-generation pass ships with a literal manifest and a per-entity PASS/FAIL report — not just an aggregate count

**Agent manifest (29) — from `tracker-gg-aggregate-data-2026-08-18.md` section 1:**
Tier S: Sage, Clove, Miks, Neon, Fade, Iso.
Tier A: Killjoy, Cypher, Jett, Phoenix, Deadlock, Waylay, Raze, Veto, Reyna, Yoru, Chamber, Skye, Vyse.
Tier B: Viper, KAY/O, Harbor, Sova, Brimstone, Tejo.
Tier C: Omen, Astra.
Tier D: Breach, Gekko.

**Map manifest (7, in-rotation only):** Haven, Lotus, Ascent, Split, Sunset, Breeze, Summit.

**Weapon manifest (19 non-melee):** Classic, Shorty, Frenzy, Ghost, Sheriff, Bandit, Stinger, Spectre, Bucky, Judge, Bulldog, Guardian, Phantom, Vandal, Marshal, Outlaw, Operator, Ares, Odin. Bandit is a genuine, recently-added weapon (Patch 13.01) — confirmed against this app's own library data (`gamesense-promoted.js:7110-7111`, sourced from a real `valorant-api.com` weapon UUID and already reviewed/approved at `public/library/_drafts/review-weapon-bandit-2026-07-23.md`). An earlier draft of this directive incorrectly flagged it as a transcription error — that was wrong, based on stale pre-2026 weapon-roster knowledge rather than this codebase's actual source of truth. No verification needed here; treat all 19 as real.

**Requirements:**

1. **Resolve the 62 skipped dossier fields against the agent/map manifest above** — each one gets either a real value or an explicit, human-reviewed reason it can't be filled (not just re-logged the same way). The "source occurrence count N" failures need a real fix (disambiguate which occurrence by surrounding context, not just skip) since that's a mechanical script limitation, not a content gap.
2. **Run the real `scripts/one-time-stat-profile-pass.mjs`** (with actual API access, not `--no-api`) across the full 61-entity scope, checked entity-by-entity against the agent/map/weapon manifests above. Ship `gamesense-stat-profiles.js` for real — Part C/D's `why` anchor depends on it existing.
3. **Going forward, any one-time content-generation pass in this codebase must report a literal checklist against its expected manifest** (every agent/map/weapon it should have touched, PASS/FAIL each) as part of its changelog, not just "N enumerated / N changed / N skipped." A skipped entity needs a named human-reviewable reason attached at the point it's skipped, not a silent count.

### Review checklist for Part E

- [ ] All 62 previously-skipped dossier fields are resolved or carry an explicit reviewed reason — list them.
- [ ] `gamesense-stat-profiles.js` exists and covers all 29 agents, 7 maps, and the corrected weapon manifest.
- [ ] The one-time-pass changelog format going forward includes a per-entity manifest check, not just aggregate counts.

---

## How this whole directive will be reviewed

1. `node --check` on every touched file; full existing test suite, including `testing/henrik/formulas.test.js` and `testing/henrik/coaching-rules.test.js`.
2. Every checklist above (Parts C, D, E) delivered as an explicit checked-off list in the build report, not summarized away.
3. Confirm Part A's Insights card, Part C's Match Trends cards, and Part D's Insights cards all pass the Part 0 voice rules — spot-check a sample of each against all six rules.
4. Confirm Part C ships and is stable before Part D is attempted, per the phase order at the top.

## Also in this Codex session

`notes/animated-theme-gpu-cost-2026-08-17.md` is a separate, already-ready-to-build fix — bundle it into the same Codex handoff. Animated-background lag reproducible only full-screen at 4K, confirmed via a note written in advance predicting the exact failure mode, the real-world symptom that any window resize instantly fixes it, and a clean baseline Performance trace with the theme off. See that file for its own full spec and review criteria — same Extra High reasoning tier as this directive now uses.
