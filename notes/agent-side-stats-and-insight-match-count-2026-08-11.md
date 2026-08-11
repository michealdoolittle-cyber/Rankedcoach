# Agent/Role Attack-Defense Stats Are Always Empty, and an Insight Overcounted Season Matches (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.** Two distinct bugs, reported together but fix independently. Part 1 has a confirmed, code-verified root cause — build the fix directly. Part 2 needs live reproduction against Michael's real account before any fix is proposed — do not guess-patch it.

**Status: ready to build (Part 1), ready to investigate (Part 2).**

## Context: this is not the same bug as yesterday's insights-architecture directive

`notes/insights-architecture-and-library-editor-2026-08-10.md` (Part 1: shared insight interpretation architecture, role/confidence-aware scoring) is **still outstanding** — commit `43aaac8` ("Stabilize insight and dossier editing workflows") only fixed the auto-fit text-scaling bug (Part 5 of that directive) and added test hooks. The role-context and selection-bias work was not built. That directive is still the right place for those problems and should still get picked up. This directive covers two newly reported, more specific bugs that are real regardless of when that larger work lands.

## Part 1 — Agent/Role dossier Attack/Defense tabs show nothing

**Reproduction:** Open any agent's stat detail (the modal reachable from Stats → Agents, or the "agent" lens — `openStatsDetailModal("agent", agentName)` at `app.js:12562-12566`, rendering `buildCalculatedAgentDetailTabs()` at `app.js:11966`). The General tab shows real numbers (Role, K/D, Average ADR, Best/Worst Map). The Attack and Defense tabs show zero or `--` for everything. Same structure and same bug applies to the Role detail modal (`buildCalculatedRoleDetailTabs`, `app.js:12041`).

**Confirmed root cause:**
1. `buildPlayerModel()` (`app.js:7691`) computes per-map and per-agent stats by accumulating into buckets created by `createPerformanceBucket()` (`app.js:5034-5048`). That bucket only has generic fields: `matchesPlayed`, `matchesWon`, `matchesLost`, `kills`, `deaths`, `assists`, `acsTotal`, `adrTotal`, `hsTotal`, `hsCount`. **It has no side-specific fields at all** — no `attackRoundsPlayed`, `defenseRoundsPlayed`, `attackRoundsWon`, `attackKAST`, `attackDamagePerRound`, `attackKills`, `attackFirstBloods`, etc.
2. `getAgentMapInsights(agentName, analytics)` (`app.js:11102`) returns `analytics.maps` entries for that agent — which are these same locally-computed buckets (`analytics.maps` in the player model is `maps.length ? maps : (importedAnalytics?.maps || [])`, `app.js:9606` — the raw-Tracker-data fallback only fires when there are literally zero locally-computed map entries, which is never true once real match history exists).
3. `getSideMetricsFromMaps(agentMaps, "attack"/"defense")` (`app.js:11125-11151`) reads exactly the missing fields (`attackRoundsPlayed`, `attackRoundsWon`, `attackKAST`, `attackDamagePerRound`, `attackKills`, `attackFirstBloods`, `attackFirstDeaths`, `attackTraded`, `attackSurvived`, and the `defense*` equivalents) off each map entry. Since those fields don't exist on the locally-computed buckets, every sum is 0 and every average divides 0/0 — hence the empty tabs. This is not a season-scoping or data-availability issue; it will reproduce for every account with any real match history, always has.

**A real fix has two viable directions — pick whichever is cleaner, verify against real data either way:**

- **Option A (more consistent with the rest of the model):** during `buildPlayerModel()`'s match loop (`app.js:7722-7772`), also aggregate side-specific round metrics into `mapBuckets`/`agentBuckets` (and `roleBuckets`) directly from each match's real round data (`match.advanced.rounds`, same source already used by `getEntityRounds`/`buildRoleSideMetrics`/`buildWeaponDetailTabs` elsewhere in this file — `round.side`, `round.roundWon`, and whatever fields those rounds carry for damage/KAST components). This makes `analytics.maps`/`analytics.agents` genuinely carry the fields `getSideMetricsFromMaps` expects, fixing this at the source for every consumer, not just the one modal.
- **Option B (more surgical):** `buildCalculatedAgentDetailTabs()` and `buildCalculatedRoleDetailTabs()` already independently fetch real per-round data for both sides — `attackRounds`/`defenseRounds` via `getEntityRounds({ agentName, side, matchEntries: scoped.matches })` (`app.js:11974-11975`, `12049-12050`) — and currently only use it for the secondary `buildRoleSideMetrics()` items (first blood rate, lanes). Derive Attack/Defense Win Rate, Kills, and (where the round objects carry the needed component fields) KAST/ADR directly from `attackRounds`/`defenseRounds` instead of from the broken `getSideMetricsFromMaps(agentMaps, side)` call — this fixes just these two modals without touching the shared player-model shape.

Before choosing, check whether individual round objects in `match.advanced.rounds` actually carry per-round damage and KAST-component data (kills/assists/survived/traded flags) — if they do, Option B is likely less risky since it doesn't touch the shared `buildPlayerModel()` shape other things depend on; if that data isn't reliably present at the round level, Option A (aggregating whatever *is* available) may be the only way to get real numbers into all consumers of `analytics.maps`. Either way, delete or fix `getSideMetricsFromMaps`'s dependency on fields that are structurally never populated — don't leave a second, still-broken path next to the fix.

**How this will be reviewed:**
1. Open the Attack and Defense tabs for at least three different agents with real match history and confirm every stat shows a real, non-zero, plausible number (not `--`, not `0%`) where the player has actually played rounds on that side.
2. Confirm the numbers are internally consistent — e.g., Attack Win Rate's win/round counts should roughly reconcile with what the match history actually shows for that agent on attack.
3. Confirm the Role detail modal's Attack/Defense tabs are fixed the same way (same bug, same file).
4. Confirm the General tab and other already-working tabs are unaffected.
5. `node --check` on every touched file; run the full existing test suite.

## Part 2 — Insight claimed 12 Cypher matches this season, real count is 1

**Reproduction reported:** the Insights "Fight Value" trend card showed "good... across 12 matches" attributed to Cypher, while Michael's actual match count for Cypher this season is 1.

**What I confirmed by static review (this part checks out, don't assume it's broken without live data):** the season/act filtering mechanism itself — `getScopedStatsData()` (`app.js:9738`), `matchBelongsToSelectedStatsAct()` (`app.js:53505-53511`), `getMatchSeasonIdentity()` (`app.js:53415-53433`) — requires an exact season-key match and explicitly excludes matches with no resolvable season key (`if (!matchSeasonKey) return false`, `app.js:53508`). This is the same mechanism the Stats page's season filter uses, and it was already confirmed correctly consolidated in an earlier session. So this is not an obviously-broken filter in the code — it needs to be reproduced live to find the actual divergence point, not guess-patched.

**Two concrete suspects worth checking first, in order:**
1. **Stale memo.** `getPlayerModel()` (`app.js:9644-9659`) caches on a key built from `activeStatsActKey`/`activeStatsActLabel`/`scoped.selectedAct` (`app.js:9646-9653`). If the Insights view renders before the season selection state is fully settled (e.g., right after a sync, or before the act picker's default resolves), it's possible a stale/earlier-season model gets cached and reused. Check whether `playerModelMemo` could be serving a result computed before the correct current-season key was set.
2. **All-time fallback.** `analytics.agents` in the player model falls back to `importedAnalytics?.agents` — raw, all-time Tracker data — whenever the locally-computed `agents` array is empty (`app.js:9607`). Confirm this fallback is not firing when it shouldn't (e.g., if season-scoped match data momentarily produces zero agent buckets during a render race, it would briefly show all-time counts).

**Required approach:** reproduce this against Michael's real account (or another known account with a similar mismatch between current-season and career match counts on one agent). Compare, for the same agent, in the same render: (a) the match count the Stats page shows for that agent under the currently selected season, against (b) the match count the "Fight Value" trend card cites for that same agent. Trace exactly where the two diverge — don't submit a fix until the actual divergence point is identified and shown, since two structurally-sound-looking mechanisms (season filter, memo key) both need to be ruled in or out with real data, not assumed.

**How this will be reviewed:**
1. A clear before/after showing the exact code location where the 12-vs-1 divergence happens, demonstrated with real data (not just "should be fixed now").
2. Confirm the fix (once identified) doesn't regress the memo's performance benefit — `getPlayerModel()` being cheap to call repeatedly is load-bearing elsewhere in the app.
3. Re-check the same trend card after a normal sync + season switch to confirm it updates correctly both ways (switching to an older season shows that season's true count, switching back to current shows current's true count).
4. `node --check` on every touched file; run the full existing test suite.

## Testing checklist

1. Attack/Defense tabs: verified non-empty, plausible numbers for 3+ agents and for the Role modal.
2. Insight match-count bug: real divergence point identified and demonstrated, not just silently changed.
3. Regression check: existing General tab, Coach tab, and other already-working detail-modal tabs unaffected.
4. Full existing test suite passes.
