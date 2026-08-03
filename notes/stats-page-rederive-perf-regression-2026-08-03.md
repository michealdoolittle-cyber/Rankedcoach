# Performance Regression: Raw-Payload Re-Derive Running on Every Stats Render, Not Once (2026-08-03)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.** Real, confirmed performance regression from today's raw-payload architecture work — needs care since the fix must not reintroduce the stale-data bugs that architecture was built to solve.

**Status: ready to build.** Michael reports three symptoms while running a live test: long overall load times, a loading indicator that jumps between a few fixed percentages (6, 8, 40, 42, 70, 90) with long unexplained pauses instead of counting up smoothly, and the Stats page specifically taking a long time to open.

## Root cause #1, confirmed by reading the code: Stats page re-derives the entire match history on every render

`getScopedStatsData()` (`app.js:~8992`) calls `rederiveMatchesFromStoredRawPayloads(rawSourceMatches)`, which `.map()`s over **every match in the account** and, for each one, checks `matchRecordNeedsStoredRawRehydrate()` and potentially re-runs full normalization against its stored raw payload. This was only ever meant to run when extraction logic actually changed (see `notes/store-raw-henrik-payload-architecture-2026-08-03.md`) — a rare, deliberate event — not on every single call to the function that powers the Stats page. Right now it runs **every time Stats is opened or re-rendered**, walking the full match list each time. With Michael's real match history now extending back through 2025 (confirmed today), this means potentially hundreds of matches get checked on every click into that page.

**Fix**: re-derivation must happen once per match, not once per render.
- Mark a match as "current" once it's been successfully re-derived (a schema/version stamp already exists on records — confirm `matchRecordNeedsStoredRawRehydrate()` is checking against it correctly and short-circuiting to a cheap, fast `false` for already-current records, not doing real work to arrive at that answer).
- If the short-circuit itself is still doing non-trivial work per match (e.g., deep-parsing the stored raw payload just to check a flag), that check itself needs to be cheap — a flag/version stamp read, not a payload inspection.
- Stronger fix: move re-derivation entirely out of the render/stats-computation path. Run it once, explicitly, right after a sync or after a version bump that requires it (as the original architecture directive intended), store the fully-rederived result, and never re-check on normal page views. `getScopedStatsData()` and anything else in the render path should read already-current data, not re-verify it every time.

## Root cause #2 (likely, needs confirmation): loading progress uses fixed checkpoints, not real granular progress

The jump pattern Michael describes (6%, 8%, 40%, 42%, 70%, 90%, with long pauses between) matches a loading UI built around a handful of hardcoded percentage values tied to coarse phases, not continuous progress tied to actual units of work. Confirm and fix: wherever the historical migration or sync loading indicator sets a percentage, tie it to real, countable progress (e.g., `processedMatches / totalMatches` for the historical walk, updated incrementally per match or per small batch) instead of jumping between a few fixed milestones with silent gaps. If a phase's duration genuinely can't be made granular (e.g., a single network call with no sub-progress), consider an indeterminate-but-alive indicator for that phase specifically (a moving/pulsing state) rather than a static percentage sitting still for a long, unexplained stretch.

## Root cause #3, to verify: is the historical migration re-running more than the intended one time?

The raw-payload architecture directive was explicit that the historical backfill should run once per account, tracked via `henrikHistoryBackfillVersion`/`henrikHistoryBackfillCompleteAt`, and never repeat once complete. Given Michael is now seeing slow loads on a *regular* sync (not just the first one after the fix shipped), confirm this version/completion tracking is actually being respected and the full historical walk isn't silently re-triggering on syncs where it shouldn't. If it's legitimately still finishing its one-time pass (a large real history takes a while the first time through), that's expected and should be communicated clearly rather than looking like a permanent slowdown — but confirm which of the two is actually happening rather than assuming.

## What NOT to do

- Don't cache/skip re-derivation so aggressively that it stops catching records that genuinely do need it (freshly-fixed extraction logic, or the fresh-sync completeness retries from the raw-payload directive) — the fix is "don't redo already-correct work repeatedly," not "stop checking entirely."
- Don't remove the loading progress indicator to hide the pauses — fix what it's measuring so the pauses either become real, granular progress or an honest "still working" state.

## Testing checklist

1. Confirm opening the Stats page repeatedly (without an intervening sync) does not re-walk or re-check the full match history each time — measure and report actual time-to-render before and after, on an account with a realistic (hundreds-of-matches) history.
2. Confirm a genuinely stale record (simulate one needing re-derivation) still gets correctly caught and fixed — this must not silently stop working in the name of speed.
3. Confirm the loading progress indicator now reports real, granular progress during the historical migration specifically, tested against an account with enough history to actually observe multiple increments.
4. Confirm the one-time historical migration is not re-running on regular syncs once it has genuinely completed for an account.
5. Confirm overall load time and Stats-page open time are measurably improved on Michael's real account after this fix, with real before/after numbers reported.
6. `node --check` on every touched file; run the existing test suite.
