# Daily Entrance Animation — Force-Replay Debug Toggle (2026-07-20)

**Status: the animation system itself is confirmed working, not broken.** Root cause of "I've never seen it" across 5 rounds was traced and confirmed directly from Michael's own DevTools output: `RankedCoachDailyEntrance.getState().daily.seenPages` already contained all 5 pages for today's date before he checked — the once-per-day gate (intentional, from the original spec) was correctly skipping replay because it had already fired earlier that day. This is not a regression and does not need another animation rebuild.

**What's actually needed now:** Michael wants to iterate on how the animations look (timing, easing, motion style — see his reference: slide up/down + fade in/out, https://stackoverflow.com/questions/56922202/slide-up-down-animation-with-fadein-out-effect) and needs the sequence to replay on every load while he's doing that, not just once per day. Add a debug override — **dev/QA only, must not change default production behavior for real users.**

## Build this

A persisted debug flag, separate from the daily state (`daily.seenPages`/`daily.skipped` in `public/daily-entrance-motion.js`), that when active makes the gate functions ignore the "already seen today" checks entirely.

**Gate functions to update** — `canAnimatePage` (`daily-entrance-motion.js:893-900`) and `canPreparePage` (`902-908`):
```js
function canAnimatePage(pageId) {
  const daily = ensureCurrentDay();
  return runtime.ready
    && PAGE_IDS.has(pageId)
    && (runtime.forceReplay || (!daily.skipped && !daily.seenPages.includes(pageId)))
    && !prefersReducedMotion();
}
```
(Same pattern for `canPreparePage`.) `prefersReducedMotion()` must still be respected even in force-replay mode — this is a styling/timing iteration aid, not a reduced-motion override, don't let it fight accessibility settings.

**Persistence + toggle API**, exposed on the existing `window.RankedCoachDailyEntrance` object (same object the console output Michael pasted came from):
```js
const FORCE_REPLAY_KEY = "rankedcoach_daily_entrance_force_replay";
runtime.forceReplay = localStorage.getItem(FORCE_REPLAY_KEY) === "1";

function setForceReplay(enabled) {
  runtime.forceReplay = Boolean(enabled);
  if (runtime.forceReplay) localStorage.setItem(FORCE_REPLAY_KEY, "1");
  else localStorage.removeItem(FORCE_REPLAY_KEY);
}
```
Add `setForceReplay` to the object already returned/exposed as `window.RankedCoachDailyEntrance` (same place `resetToday`/`getState` are exposed, `daily-entrance-motion.js:1090` area). Michael turns it on once via console (`RankedCoachDailyEntrance.setForceReplay(true)`), it persists across reloads via localStorage exactly like he asked ("remain on at all times in the meantime"), and he turns it off the same way when done (`setForceReplay(false)`).

**Also handle re-arming an already-completed page while force-replay is on** — right now once a page's animation finishes, `daily.seenPages` gets that page added (this is what gated Michael's test). With force-replay active, either don't push to `seenPages` at all, or explicitly re-run `preparePage`/`schedulePage` for a page on each navigation regardless of its `seenPages` membership. Confirm which approach fits the existing `activatePage`/`schedulePage` flow (`daily-entrance-motion.js:921-966`) without breaking the normal (non-debug) once-per-day path.

## Do NOT do

- Don't change the default (no flag set) behavior — the once-per-day gate is correct, intentional, already shipped, and working. This is purely an opt-in debug aid.
- Don't add a UI control for this (a settings toggle, a button) — console-only via `window.RankedCoachDailyEntrance.setForceReplay(...)`, matching how `resetToday()` already works. This is a dev tool, not a player-facing feature.
- Don't touch the animation keyframes/timing themselves as part of this note — that's Michael's next round of iteration once force-replay is in place, a separate ask.

## Testing checklist

1. `RankedCoachDailyEntrance.setForceReplay(true)` then reload → sequence plays even though `seenPages` already lists every page for today.
2. Navigate between all 5 pages repeatedly with force-replay on → sequence replays every time, doesn't get stuck "seen" after the first pass.
3. `RankedCoachDailyEntrance.setForceReplay(false)` then reload → normal once-per-day behavior returns immediately (no lingering force-replay state).
4. Confirm `prefers-reduced-motion` still cleanly disables animation even with force-replay on.
5. Confirm a fresh guest/account with force-replay OFF still only gets the sequence once per day, exactly as before — this change must be zero-impact for real users who never touch the console.
