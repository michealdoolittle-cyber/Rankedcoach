# RankedCoach Formula Reference

Every formula currently in the coaching engine, what it computes, and what it gives the player or the coaching AI. Compiled 2026-07-10 from a full review of `buildPlayerModel()` and its helpers in `public/app.js`, plus the new HenrikDev-fed formulas built the same day. Status tags: **live** (wired to real data and actually feeding insights today), **built, not wired** (the formula exists and is correct but nothing feeds it real data yet), **spec'd, not built** (proposed, not implemented).

---

## Data quality & calibration layer

These don't produce a stat themselves — they govern how confidently other formulas get turned into coaching language.

**Weapon/agent-context headshot calibration** — *live*. Adjusts what counts as a "good" headshot percentage based on weapon mix: sniper-heavy or shotgun-heavy play gets a lower HS% benchmark than rifle play, since a 15% HS% Operator player landing every shot that matters isn't underperforming the way a 15% HS% Vandal player would be. Has specific agent adjustments too (Neon's slide, Yoru's Operator tendency). **Gives the coaching AI:** the correct baseline to judge HS% against instead of one flat number for every playstyle.

**Sample-confidence weighting** — *live*. Tracks how many matches and reflection logs exist and scales confidence accordingly — under 6 matches reads as "early sample, direction not proof," 15+ reads as "stable sample." Also weights win rate and log-derived reads separately based on their own sample sizes. **Gives the coaching AI:** permission to say less, and say it less confidently, when there isn't enough data yet — the thing that stops an app from confidently telling a 3-match player they have a map problem.

**Coaching language rules** — *live*. A fixed set of governance rules baked into the insight layer: don't call something a strength if it's still under 50% win rate, down-weight raw mechanics stats when context reduces their meaning, give one next action per insight instead of a wall of context. **Gives the player:** insights that read like a coach who knows when to hedge, not a stats page pretending to have universal answers.

---

## Round-involvement & impact formulas

**KAST (Kill/Assist/Survive/Traded)** — *live, built and validated 2026-07-10*. Percentage of rounds where the player got a kill, an assist, survived, or was traded within 5 seconds of dying. Computed per-round from real Henrik match data, split by attack/defense side. Validated against a real match: 77% (17/22 rounds), with 3 rounds counted specifically because of the trade-window logic. **Gives the player:** the standard competitive-analysis measure of "how often was I actually involved in the round," which is a far more honest impact read than kills alone — a player who dies early every round but never gets kills, assists, survives, or gets traded is invisible to K/D but very visible to KAST.

**Rank-relative benchmark comparison** — *live, built 2026-07-10*. Compares the player's HS%/ACS/K-D against real rank-tier reference data (sourced from public community stats, not invented numbers) instead of one flat threshold for every rank. **Gives the coaching AI:** the "am I good for my rank" comparison the app never had — previously every player was judged against the same bar regardless of whether they were Iron or Diamond.

**Opening-duel score** — *built, not wired to real data*. `52 + (firstBloods × 8) − (firstDeaths × 9) + ((firstBloods − firstDeaths) × 4)` — a weighted formula scoring first-contact performance, split by attack/defense side. Well-designed, but currently reads from a match data shape (`match.advanced`) that isn't populated by the new real-data pipeline — see the wiring note below. **Would give the coaching AI, once wired:** a real read on whether a player wins or loses the fights that set up the round, distinct from overall K/D.

**Trade-efficiency asymmetry** — *spec'd, not built*. Splits "how often am I traded when I die" from "how often do I personally trade a teammate's death" — two different questions the existing trade-window logic can already answer separately but currently only reports combined. **Would give the coaching AI:** a role-relevant read — an entry fragger should expect to be traded often; a support/anchor should be doing more of the trading. Same number today looks the same regardless of role; split, it tells two different coaching stories.

**Multi-kill / ace rate** — *spec'd, not built*. Counts kills-per-round from real round data to bucket into 2K/3K/4K/ace rates. **Would give the player:** a fragging-impact read independent of average KDA — two players can share the same K/D with very different round-winning power.

---

## Economy & discipline formulas

**Win rate by buy type (eco/light/full-buy)** — *built, not wired to real data*. Splits round win rate by economic situation. Well-designed, same wiring gap as opening-duel score — currently expects a `buyType` text label per round that nothing produces from the real Henrik pipeline (which has real `loadoutValue` numbers instead, actually more precise than a label). **Would give the coaching AI, once wired:** real buy-discipline analysis — is a player winning eco rounds they should be saving, or losing full-buys they should be winning.

**Utility-before-contact timing** — *built, not wired to real data*. Flags whether utility (abilities) gets used before the first fight of a round or reactively after. Same wiring gap. **Would give the coaching AI:** a proactive-vs-reactive utility usage read, a real coaching-relevant behavior pattern.

**Discipline signals (AFK / stayed-in-spawn / friendly fire)** — *spec'd, not built*. Real per-round and per-match data already flowing through the pipeline (`wasAfk`, `stayedInSpawn`, `behaviorFactors`) but nothing surfaces it. Would be built as a low-frequency flag — one AFK round means nothing, a repeated pattern across matches is worth a coaching note. **Would give the coaching AI:** a blind-spot check players rarely self-report honestly in manual logs.

**Clutch/ace recognition (`roundCeremony`)** — *spec'd, not built*. Riot's own automatic moment-tagging (Ace/Clutch/Flawless/Thrifty/Closer) is real, confirmed populated data, currently unused. **Would give the player:** a clutch-conversion rate — "closed 2 of your last 5 clutch rounds" — without any manual tagging UI needed, since Riot already tags the moment.

**Damage consistency (variance)** — *spec'd, not built*. Two players can share identical average ADR with very different round-to-round reliability. **Would give the coaching AI:** a distinct signal from ADR itself — steady output vs. boom-or-bust performance are different coaching conversations even at the same average.

---

## Player-relative (self-comparison) formulas

**Agent/map/role performance buckets** — *live*. Aggregates win rate, K/D, ACS, HS% per agent/map/role from real match history, ranks them, and surfaces the strongest and weakest. Powers insights like "Core Agent Strength" and "Map Preparation Gap." **Gives the player:** a self-relative read (your best map vs. your worst map) — reasonable and already live, just not the same as the rank-relative read above; the two are complementary, not redundant.

**Weekly focus tracking** — *live*. Same bucket logic scoped to the current week, plus mood-count tracking within that window (flags a run of "annoyed"/"tilted" entries). **Gives the player:** a shorter-horizon read than the season/all-time view, useful for "what's true about this week specifically."

---

## Manual/qualitative logging (not formulas — the layer no API can replace)

**Mood, comms-enabled, and low-distraction rates** — *live* (`summarizeLogContext()`). Tracks self-reported mood category, whether comms were used, and whether music/distraction was present, across manual reflection logs. **Gives the coaching AI:** the qualitative context objective stats can't provide on their own.

**Round-tagged "what were you trying to do"** — *spec'd, not built*. A proposed addition: an optional free-text tag on a manual reflection, associated with a specific round number once round-level match detail is visible in the UI. **Would give the coaching AI:** the one thing no API will ever supply — *why* a call was made — paired directly with the real round data that shows *what happened*. Neither half is as useful alone.

---

## Summary — what actually needs work

Nothing here needs new formula design for the near term. The economy/first-blood/utility-timing suite is already well-built and just needs its data source reconnected to the real Henrik pipeline (`notes/henrikdev-integration.md`, "Formula layer follow-up" section, item 1) — that alone unlocks three formulas that already exist. After that, `roundCeremony`, discipline signals, multi-kill rate, trade asymmetry, and damage consistency are all genuinely new value sitting on top of data that's already flowing through the app, not hypothetical future capability.
