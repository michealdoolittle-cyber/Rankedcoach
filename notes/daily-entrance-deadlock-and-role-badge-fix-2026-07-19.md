# Daily Entrance Deadlock + Weekly Focus Role Badge — Fixed Directly (2026-07-19)

**Status:** Fixed and verified live by Claude, not Codex, this round. Michael reported Codex's previous pass (`4e48c41`) did not resolve the animation issue — confirmed via incognito test — and separately flagged desktop-only role icons still showing on the weekly focus pills. Both are fixed below with the exact root cause, verified against real code execution (Playwright), not just read from source. This note explains what was actually wrong and what changed, for Codex's awareness going forward — no action needed on these two items.

---

## 1. Daily entrance animation — real root cause: a boot-time race with the daily warm-up modal

Codex's `4e48c41` fix (adding `dailyWarmupModal` to the blocking-veil checks in `notifyDailyEntranceMotionReady`) was necessary but not sufficient, and here's why, confirmed by actually driving the app end-to-end with Playwright as a fresh guest (matching Michael's incognito test):

**The deadlock:** `scheduleDailyWarmupCheck(700)` (`app.js`, called from `activatePage()`) and the entrance animation's own readiness signal both start racing at boot. `canOpenDailyWarmupCheck()` only refused to open the warm-up modal while entrance was **already actively running** (`activePage`/`pendingPages` truthy) — but during the guest-entry flow (auth modal → guest tutorial choice → `enterGuestFromAuth`), entrance's own readiness takes long enough that its state still looks completely idle (`ready: false`, no `activePage`) at the 700ms mark. From the warm-up check's point of view, "not running yet" and "will never get a turn because you're about to steal the modal slot" look identical, so it opened the warm-up modal first. Once open, entrance's own blocking-veil check (correctly, per Codex's fix) then refused to proceed while that modal was up — and the modal only closes on manual dismissal. Net effect: entrance gets permanently stuck behind a modal that grabbed the slot before entrance ever had a chance, and the only way to ever see it was to fully dismiss the warm-up modal first — which most users would not do quickly enough to perceive it as the "first thing I see," and Michael's incognito test window apparently didn't trigger it at all.

I reproduced this exactly: a fresh guest session showed `warmupModalActive: true` while entrance was still `ready: false`, and entrance only proceeded once I manually dismissed the warm-up modal.

**The fix (`app.js`, `canOpenDailyWarmupCheck`/`scheduleDailyWarmupCheck`):** the warm-up check now also waits for entrance to have genuinely had its turn on the current page — either `ready && daily.skipped`, or `ready && daily.seenPages` includes the current page — before it's allowed to open, not just "is it active right now." A capped retry counter (`dailyWarmupPromptDeferrals`, limit 8 attempts / ~5.6s) prevents this from waiting forever if entrance's own trigger never fires for an unrelated reason, so the warm-up check still degrades gracefully instead of silently disappearing.

**Verified live (Playwright, fresh guest, no manual controller calls, no pre-seeded storage — the same class of test as an incognito visit):**
- Before the fix: entrance stuck at `ready: false` indefinitely; warm-up modal open and blocking.
- After the fix: entrance completes on its own (`ready: true`, `seenPages: ["home"]`, real WAAPI animations observed on `document.getAnimations()`) with zero manual interaction, and the warm-up modal still opens correctly afterward once entrance has finished — so the warm-up feature itself is unaffected, just correctly deferred.
- Re-ran the existing `testing/visual-audit/daily-entrance-audit.js` suite (Codex's own coverage) afterward — all assertions still pass, no regressions.

**Not yet independently re-verified:** a real Supabase-authenticated (non-guest) session-restore path, since that requires real credentials I don't have. The fix addresses the actual mechanism (a race against any first-visible page, not guest-specific), so it should apply the same way, but worth a real confirm on your end when convenient.

---

## 2. Weekly Focus pills — role icon badge removed from desktop (mobile already had it hidden)

Confirmed the exact asymmetry: `layout-styles.css` had `html body.is-mobile-layout #page-home .weekly-focus-pill .coaching-role-badge{ display:none !important; }` — mobile was explicitly hiding this badge, but no equivalent rule existed for desktop, so it only ever showed there. The badge itself (`updateWeeklyFocusDetailsModel`, `app.js`) was being rendered unconditionally on every weekly focus pill regardless of what the pill actually represents (Tilt Pattern, Self Comms, Loss Pattern, etc.) — none of which are role-specific content, so a role icon on each one didn't have a real reason to be there in the first place. Mobile's `display:none` override looks like it was already the intended fix for this exact problem, just never applied to desktop.

**Fix:** removed the role badge from the weekly focus pill render entirely (`app.js`, `updateWeeklyFocusDetailsModel`) rather than patching desktop with a matching `display:none` — this fixes both platforms from one source and removes the now-dead mobile override and the now-unnecessary `.weekly-focus-pill:has(.coaching-role-badge)` padding rule in `app.css`. The role badge on **`.timeline-pill`** (Recent Match Trends) is untouched — that one is a different, legitimate use of the same badge component and wasn't part of what Michael flagged.

---

## Testing checklist — for your own future reference, already done here:

1. `node --check` passes on `app.js` — confirmed.
2. Live Playwright run confirms entrance completes unattended as a fresh guest, with the warm-up modal still opening correctly afterward.
3. `testing/visual-audit/daily-entrance-audit.js` (existing suite) re-run clean, no regressions.
4. Confirmed via grep that no other selector still couples `.weekly-focus-pill` with `.coaching-role-badge` after the CSS cleanup.
5. Cache key bump and the real-authenticated-session spot check are still open — bump `public/index.html`'s cache key for the changed assets on next deploy pass, and if you get a chance to verify against a real (non-guest) login, that's the one condition I couldn't personally test.
