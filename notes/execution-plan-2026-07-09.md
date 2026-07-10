# Execution Plan for Codex — 2026-07-09

Everything currently queued across `notes/*.md`, in the order it should actually be worked, with the reasoning for that order. This file doesn't repeat the detailed directives — it points at them and says what to do first and why. Update the status line here as phases complete; the detailed status still lives in each source file.

**Status:** Phase 1 shipped. Phase 2 was rechecked on a fresh local cache-busted build, and the manual-mode overlay stack issue was fixed there. Phase 3 structural screenshot-import fixes shipped, but a rerun against Michael's original real screenshots is still pending because those source images are not in this workspace. Phase 4 shipped, and the visual audit passed clean.

---

## Phase 0 — one console error, already resolved, no action needed

Michael reported: `Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received`, repeating 4x, attributed to `(index):1`.

**This is not a RankedCoach bug and needs no code change.** Confirmed via grep: `chrome.runtime`, `onMessage`, `sendResponse`, and service-worker registration have zero matches anywhere in `public/app.js` or `public/index.html`. That's the deciding fact, not a guess — `chrome.runtime.onMessage`/`sendResponse` is an API surface that is only ever available inside a browser extension's own context. Normal page JavaScript (including anything loaded via a `<script>` tag, first-party or third-party) cannot reach it at all. This exact error can only be produced by an installed browser extension's content script (password managers, ad blockers, Grammarly, React/Redux DevTools, etc. are the common culprits) failing to respond to its own internal message before a tab/context closes — it has nothing to do with the page it happens to be logged against.

**One verification step, then close it:** reproduce in an Incognito window with extensions disabled (or any browser profile with no extensions installed). If the error doesn't appear there, that's confirmation, not just inference — mark it closed as "confirmed external, not actionable" rather than leaving it open indefinitely as an unexplained item.

---

## Phase 1 — CSS cache-bust fix (do this before anything else below)

**`notes/mobile-bug-fixes-2026-07-08.md` item #13.** Bump `app.css?v=...` in `index.html`. This is first because it's not just a bug — it's a precondition for trusting any evaluation of the items in Phase 2. Michael's live screenshots of the gray/misaligned exit button and the "minor" premium theme motion may both have been taken against a stale, pre-fix stylesheet. Fixing the cache-bust and re-verifying comes before spending more engineering time on either.

**Done when:** version bumped, hard-refresh (or incognito) test confirms the current `app.css` is actually what's rendering.

---

## Phase 2 — re-verify what Phase 1 might have been masking

Only after Phase 1 is confirmed fixed and re-tested fresh:

1. **`notes/mobile-bug-fixes-2026-07-08.md` #9** (notched border animation) and **#10** (exit-X alignment) — re-check live. Both were left open because neither reproduced from source reading; if they still reproduce on a confirmed-fresh CSS load, that's real signal they need a fresh investigation pass (there may be a third conflicting CSS block, same disease as the crosshair bug in #4).
2. **#11** (gray exit buttons original repro) — same re-check. The theme-consistency fix (`var(--accent)`) already shipped; confirm whether the actual "gray" symptom is now gone too.
3. **`notes/premium-themes.md` "Intensity follow-up" section** — re-screenshot both premium themes fresh. Only apply the opacity/avatar-ring tuning described there if the effects still read as too subtle after Phase 1 — don't tune blind against a possibly-stale screenshot.

**Done when:** each of these three items has a written status update in its source file — either "confirmed fixed by the cache-bust alone" or "genuinely still broken, here's the new root cause" — not left ambiguous.

---

## Phase 3 — screenshot import structural fixes — **RETIRED 2026-07-10**

**Superseded, do not continue this phase.** Real HenrikDev API access is now live (`notes/henrikdev-integration.md`), making screenshot-OCR import unnecessary — it's being removed, not further fixed. See `notes/henrikdev-integration.md`'s "Removal" section for the actual directive. Original phase text kept below for history only.

**`notes/screenshot-import.md`**, the 2026-07-09 entry. This is the highest real user-value item in this batch — it's the primary non-manual data path into the app, and the first real-screenshot test just proved two of its core fields (Agent, Result) can never work as currently built, not just "need tuning." In order:

1. Fix the duplicate-record bug (no dedupe in `parseTrackerOcrText`'s line-scanning loop) — cheapest, highest-confidence fix, unblocks accurate testing of everything else in this phase.
2. Replace the Agent text input with an icon picker on the review screen — stop asking OCR to read something that was never rendered as text.
3. Decide and implement the Result approach (manual-only vs. score-comparison inference) per the two options in the source file.
4. Add handling for non-match screenshots (like the aggregate overview image) getting uploaded — at minimum confirm it fails safely, ideally give a clear message instead of silent no-op.
5. Fix the truncated warning text (reuse the same `white-space:normal` override pattern already used for the Insights card fix).
6. Re-run the same two-screenshot test Michael just did and record the new results in `notes/screenshot-import.md`, same format as the 07-09 entry, before calling this shipping-ready.

---

## Phase 4 — Account & Support tab collapse

**`notes/mobile-nav-redesign.md` §9.** Lower urgency than Phase 3 — this is a navigation/discoverability cleanup, not a broken-feature fix. Move Import History + Tracker.gg URL field to the Logging page (coordinate with Phase 3 if both are in flight, since Phase 3 touches the same modal's OCR flow, not its entry point — they shouldn't conflict, but land Phase 3 first so the import flow itself is stable before relocating its entry point). Delete Force Refresh, fold Legal into Support, remove the duplicate Log out row, decide Tip to Dev's placement.

---

## Why this order

Phase 1 is a five-minute fix that determines whether Phase 2's items are real work or already-done. Phase 3 is the biggest actual gap between "built" and "trustworthy" in the app today — screenshot import has never worked correctly against a real screenshot until this week's test, and manual entry + screenshot import are the only data paths until the Riot key lands. Phase 4 is real but lower stakes — nothing is broken there, it's purely getting-easier-to-use. Phase 0 needed zero engineering time, just confirmation, so it's listed first but costs nothing.

## Reporting back

Update this file's Status line as each phase completes, same pattern as the source files. Don't mark a phase done until its own file's testing checklist has actually been run — this file is a sequencing map, not a replacement for the detailed checklists already written.
