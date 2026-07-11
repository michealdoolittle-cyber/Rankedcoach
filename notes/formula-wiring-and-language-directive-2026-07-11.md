# Formula Wiring Verification + Data Reflection + Language Layer — Full Directive for Codex

**Status:** Spec'd 2026-07-11, not yet built/verified. This is a follow-up to `notes/henrikdev-integration.md`, whose own status line claims nearly everything from the original formula directive already shipped (roundByRound→advanced projection, clutch/ace, discipline flags, real multi-kill counts, trade asymmetry, damage variance, season backfill, MMR history, season-label correction). **This directive does three things: (1) verify that claimed work actually holds up live, the same way every other Codex handoff in this project has been independently checked before being trusted; (2) close the specific gaps that are honestly documented as still-open; (3) wire a new, much larger coaching-language rule set into the insight layer, since "proper language for coaching and user understanding" was raised as a standalone concern, not just a data problem.**

---

## Part 1 — Verify what's claimed shipped, don't assume it

Every prior Codex handoff in this project has been checked against real code and real API calls before being accepted — do the same here before building anything new on top of it.

### 1a. Live season/history verification

Michael's complaint: the app isn't showing history of previous acts/seasons the way Tracker.gg does for the same account. Investigated before writing this directive:

- The season selector (`renderStatsSummaryMetaModel()`, `app.js:49348`) is genuinely data-driven — options come from `model.acts`, not a hardcoded list. Not a hardcoded-dropdown bug.
- Confirmed live via a direct Henrik API call: the most recent **retained Competitive** match for this account is dated **2026-06-01** — matching what `notes/henrikdev-integration.md` already documents (86 retained matches, spanning 2024-05-28 through 2026-06-01). The account has played Team Deathmatch since then, not ranked, so this is very likely correct behavior, not a bug — Henrik has nothing more recent to retain for Competitive.
- **The most likely real explanation: Henrik's retention window is a hard ceiling Tracker.gg isn't bound by.** Tracker.gg has been indexing this account independently for longer than Henrik's own retention covers — the two services do not have the same historical depth, and no amount of RankedCoach-side wiring closes that gap. This is a platform limitation, not a bug to keep chasing.

**Directive:**
1. Do one live production check first, in case this is actually another instance of the CSS/asset-cache-bust pattern that has bitten this project multiple times already: load `https://www.rankedcoach.gg` in an incognito/private window (guaranteed no stale cache), log in as the real account, and confirm season switching and history depth match what `notes/henrikdev-integration.md` claims was browser-tested. If it doesn't match, that's a real regression — file it as a new bug with exact repro steps, don't just re-read the code and assume it's fine.
2. If production confirms the same 2024-05-28 → 2026-06-01 window: **stop treating this as an open bug.** Instead, add a visible, honest note in the Stats page's season selector area (e.g. small text under the selector) explaining the retained-history boundary — something like "History available back to [oldest retained date]. Older matches aren't retained by our data source." Exact copy should follow the new language rules in Part 3. This turns a confusing gap into an explained limitation, which is a legitimate UX fix even though it can't fix the underlying data ceiling.
3. Do NOT attempt to backfill older history by scraping Tracker.gg or any other third-party source — that would violate the same hard-safety-rule this project already established for Tracker.gg (`notes/screenshot-import.md`'s original safety rule: no scraping, ever). If deeper history is ever needed, that's an RSO-only capability once official access lands, not something to route around now.

### 1b. Spot-check the formula wiring claims

`notes/henrikdev-integration.md`'s "Follow-up status: SHIPPED" line claims: `roundByRound` projects into the `advanced` shape, and Home/Stats/Insights/agent/map/weapon detail formulas, season switching, RR history, current/peak rank, and profile rank badges all consume retained Henrik data, plus closer-round finishes, discipline flags, real 2K/3K/4K/ace counts, role-aware trade splits, and damage standard deviation.

**Directive:** Before building anything new in Part 3, run `testing/henrik/live-known-match.js` (or its extended version if it was expanded per the original directive's testing note) and confirm it still passes against the same known match (17/22 KAST, 77%, 3 trade saves — the exact validation target). Also spot-check one new claim not covered by that specific test: pull the same known match's clutch/ace count and confirm it matches the `CeremonyCloser` ×3 / `CeremonyFlawless` ×1 already confirmed present in the raw data (`notes/henrikdev-integration.md` Step B section). If either check fails, fix that before proceeding — don't build Part 3 on top of a broken foundation.

### 1c. Two explicitly-documented open gaps — close or confirm still-blocked

Per `notes/henrikdev-integration.md`'s own follow-up status:
- **Utility timing** ("before contact" pattern) is explicitly unavailable — Henrik v4 has ability-cast counts but no cast timestamps. **Do not build a fake/inferred version of this.** Confirm the app doesn't silently show a wrong or misleading utility-timing read anywhere — if `summarizeAdvancedContextMatches()`'s `utilityBeforeContactRate` field is still being computed from a hardcoded/absent value, make sure nothing downstream presents that as real data. Either omit the read entirely for Henrik-sourced matches or label it clearly as unavailable, per the new language rules in Part 3.
- **Round-tagged manual notes** are gated on round-by-round match detail existing in the selected-match UI, which doesn't exist yet. Check whether that prerequisite UI (a per-round breakdown view for a selected match) is worth building now given round data is fully available (`roundByRound[]`) — if yes, spec and build it; if not now, leave the manual-tag feature gated and say so explicitly in the notes file rather than letting it sit as an ambiguous "todo."

---

## Part 2 — Data reflection correctness pass

Independent of the season-history question, do a full correctness pass on what's actually displayed once a real account is logged in, since "all data points pulled and reflected in the app properly" was raised as a general concern, not just about seasons specifically.

1. **Cross-check every Home/Stats/Insights surface against the raw Henrik data for at least 2-3 real matches** (use the same account, pick matches spanning different seasons/acts if the retained window allows it) — not just the one known-match validation target. Confirm K/D/A, ACS, ADR, HS%, KAST, win/loss, and rank displayed in the app match what a direct Henrik API call for the same match returns. This is the same rigor as the original KAST validation, just broader coverage.
2. **Confirm the profile's current rank and peak rank badges** pull from the same retained-history source consistently — check for any place still reading a stale/cached rank value from before the Henrik integration shipped (e.g., a leftover manual `profile.rank` field that isn't being overwritten by the new sync).
3. **Confirm guest/non-synced profiles are unaffected** — none of this work should change behavior for a guest profile or an account that hasn't connected a Riot ID; verify explicitly, don't just assume the gating held.

---

## Part 3 — Wire the new coaching-language rule set into the insight layer

Michael separately flagged the app's coaching language and user-understanding quality as needing real work, independent of the data pipeline. `docs/COACHING-LANGUAGE-RULES.md` (companion doc, written the same day as this directive) contains ~300 specific coaching heuristics across six categories: Maps, Agents, Weapons, Utility, Teamwork & Cohesion, Communication. These are content rules — real Valorant coaching knowledge — not just tone/style guidance like the existing `notes/copy-language.md` audit (that file governs *how insights are phrased*; the new doc governs *what coaching content is worth saying in the first place*). Both matter and both should keep being followed.

**The pipeline Michael described, build toward this exact shape:**
1. Pull the player's lifetime raw stats.
2. Narrow to agent/map/weapon-specific stat slices.
3. Compare against the rank-relative benchmark table (`notes/henrikdev-integration.md`'s benchmark section — already built) to find the global trend for their rank.
4. Cross-reference outliers against the new `docs/COACHING-LANGUAGE-RULES.md` rule set — does this player's specific outlier pattern match a known common-coaching-point (e.g., "low first-blood rate + high first-death rate on an entry duelist" maps to a real rule about aggressive positioning without trade support)?
5. Finalize with the player's own manual logs for correlation — does their self-reported mood/focus/comms data line up with or contradict what the stats+rules pipeline suggests?

**Directive:**
1. Build a new matching layer (e.g. `public/analytics/coaching-rules.js`, same module pattern as `round-metrics.js`) that loads the rule set from `docs/COACHING-LANGUAGE-RULES.md`'s content (reformat into a structured JS/JSON data file for actual matching — the markdown doc is the human-readable source of truth, but the app needs a queryable structured version; keep them in sync, don't let them drift into two different sources of truth). Each rule needs a machine-checkable condition (e.g. a stat threshold, a comparison, a pattern across multiple matches) alongside its human-readable coaching text.
2. Wire this matching layer into `buildPlayerModel()`'s insight generation (`app.js:5442+`), following the exact same governance the existing `COACHING_LANGUAGE_RULES` (`app.js:3373`) and `buildCoachingEvidenceLayer()` (`app.js:3283`) already enforce — sample-size discipline, no over-confident claims from small samples, one next action per insight. **Don't bypass or duplicate that governance layer — feed matched rules through it, not around it.**
3. Start with a manageable first slice rather than wiring all ~300 at once — pick the 20-30 highest-confidence, most-common rules per category (the ones most clearly grounded in real stat thresholds, not judgment calls) for the first pass, confirm the matching pipeline works correctly end-to-end, then expand coverage in follow-up passes. Report back which rules made the first cut and why.
4. Every new insight produced by this pipeline must go through the same coaching-language phrasing rules already established (`notes/copy-language.md`) before shipping — a rule engine that's factually right but phrased like a raw stats dump defeats the purpose Michael is asking for here.

### Testing

1. Pick 2-3 real matches from the account already used for validation. By hand, identify which coaching-language rules should plausibly match given the actual stats in those matches. Confirm the built pipeline surfaces the same matches, not different ones.
2. Confirm sample-size discipline holds — a rule shouldn't fire confidently off one match if it's the kind of pattern that needs repetition to mean anything (mirror the existing "AFK rounds in 4 of 10 matches, not 1 of 1" discipline already used elsewhere in this codebase).
3. Confirm guest/low-data profiles get appropriately hedged language ("not enough data yet") rather than a rule engine confidently misfiring on a 2-match sample.
