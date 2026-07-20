# Daily Entrance Deadlock + Weekly Focus Role Badge — Fixed Directly (2026-07-19)

**Status:** Fixed, deployed, and verified against the real live production site (`rankedcoach.gg`) — not just local source reading. This took three passes in one session; the middle one was wrong and got reverted. The full story is below so it's clear what actually shipped and why.

---

## 1. Daily entrance animation

### Pass 1 (reverted) — misdiagnosed as a "stuck forever" deadlock
My first live test never interacted with the daily warm-up modal at all, saw entrance stuck at `ready: false` indefinitely, and concluded entrance was permanently deadlocked behind it. Based on that, I shipped a change (`081c843`) making entrance take priority and complete *before* the warm-up modal was ever allowed to open. That was wrong on two counts: it wasn't actually a deadlock (dismissing the modal made entrance fire immediately — normal modal behavior, not a bug), and Michael's actual spec is the opposite priority: warm-up message first, then once it's added-to or skipped, the page goes blank and the entrance sequence plays. Reverted in `6f7d6eb`.

### Pass 2 (the real fix) — an unsynchronized race, not a deadlock
Testing directly against `https://www.rankedcoach.gg/` (found `docs/CLOUDFLARE-DEPLOY.md` confirms deploys aren't automatic on `git push` — they require `wrangler deploy`, which is why earlier fixes needed an explicit deploy step, not just a commit) showed the real mechanism: `scheduleDailyWarmupCheck(700)` and entrance's own readiness signal (`notifyDailyEntranceMotionReady`, triggered from the guest/login flow) are two **independent timers racing each other** with no coordination beyond "is a modal currently visible." Entrance's trigger usually resolves faster than warm-up's fixed 700ms delay, so entrance would win and play *before* the warm-up message — backwards from spec, and inconsistent since it depends on real-world timing/network conditions on any given load.

**The fix (`fd041e0`, `notifyDailyEntranceMotionReady` in `app.js`):** entrance now holds itself back for up to 900ms whenever the warm-up check is still eligible to show today (`getDailyWarmupPromptDate(profile) !== today`), giving warm-up's 700ms timer guaranteed room to open and become visible to the existing blocking-veil check before entrance ever starts. No artificial delay applies once warm-up has already been resolved for the day (already prompted earlier, or skipped), so later page navigations aren't slowed down.

**Verified live end-to-end against production, fresh guest, zero manual triggering:**
- Warm-up modal opens first and entrance stays `ready: false` the entire time it's open (checked for 12 seconds straight, warm-up never dismissed) — confirms warm-up reliably wins now, not just usually.
- Dismissing the warm-up modal (`#dailyWarmupSkip`) immediately triggers entrance: 6 concurrent real WAAPI animations observed within 1 second, sequence completes cleanly (`seenPages: ["home"]`) within ~3 seconds.
- Re-ran `testing/visual-audit/daily-entrance-audit.js` (Codex's existing suite) — still passes clean.

**If you still see nothing after this:** the one thing I can't check myself is whether your OS/browser has "reduce motion" turned on (Windows: Settings → Accessibility → Visual effects → Animation effects; browsers generally follow the OS setting). `daily-entrance-motion.js` checks `prefers-reduced-motion` and silently skips the entire sequence for the day if it's set — by design, for accessibility, not a bug — but it would look identical to "nothing animates." Worth a quick check if this recurs.

---

## 2. Weekly Focus pills — role icon badge removed from desktop (mobile already had it hidden)

Confirmed the exact asymmetry: `layout-styles.css` had `html body.is-mobile-layout #page-home .weekly-focus-pill .coaching-role-badge{ display:none !important; }` — mobile was explicitly hiding this badge, but no equivalent rule existed for desktop, so it only ever showed there. The badge itself (`updateWeeklyFocusDetailsModel`, `app.js`) was being rendered unconditionally on every weekly focus pill regardless of what the pill actually represents (Tilt Pattern, Self Comms, Loss Pattern, etc.) — none of which are role-specific content, so a role icon on each one didn't have a real reason to be there in the first place. Mobile's `display:none` override looks like it was already the intended fix for this exact problem, just never applied to desktop.

**Fix:** removed the role badge from the weekly focus pill render entirely (`app.js`, `updateWeeklyFocusDetailsModel`) rather than patching desktop with a matching `display:none` — this fixes both platforms from one source and removes the now-dead mobile override and the now-unnecessary `.weekly-focus-pill:has(.coaching-role-badge)` padding rule in `app.css`. The role badge on **`.timeline-pill`** (Recent Match Trends) is untouched — that one is a different, legitimate use of the same badge component and wasn't part of what Michael flagged.

---

## Testing checklist — for your own future reference, already done here:

1. `node --check` passes on `app.js` — confirmed.
2. Live Playwright run against **production** (`www.rankedcoach.gg`, not local) confirms: warm-up opens first and blocks entrance for the full 12s a fresh guest never dismisses it; dismissing it immediately fires a real 6-animation entrance sequence that completes cleanly.
3. `testing/visual-audit/daily-entrance-audit.js` (existing suite) re-run clean, no regressions.
4. Confirmed via grep that no other selector still couples `.weekly-focus-pill` with `.coaching-role-badge` after the CSS cleanup.
5. Deployed via `scripts/deploy-and-notify.sh` (not just committed) — deploys in this project are not automatic on `git push`, worth remembering for future fixes so a code change and a live fix aren't assumed to be the same thing.
6. Still open: a real Supabase-authenticated (non-guest) session-restore path — I only tested guest, since that's what I can drive without real credentials. The fix targets the mechanism itself (any first-visible page racing the warm-up timer), so it should apply the same way, but worth a real confirm on a logged-in account when convenient.
7. Cache key for `app.js` was already bumped in the earlier commit in this note; no further asset changes since.
