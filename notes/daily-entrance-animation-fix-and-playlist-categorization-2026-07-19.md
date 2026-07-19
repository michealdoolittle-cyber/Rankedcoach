# Daily Entrance Animation Fix + Featured Playlist Source-Based Categorization (2026-07-19)

**Status:** New directive. Two separate confirmed bugs — Michael verified both live. `notes/daily-entrance-animation-*` (the prior directive `daily-entrance-motion.js` was built against) reported "Shipped" but Michael confirmed zero animations play in the real app. Do not mark this done from a passing test run alone — the existing test suite for this feature has a confirmed blind spot (Section 1.3 below); fix that first, then use the fixed test to actually prove the real trigger path works.

---

## 1. Daily Entrance Animations — confirmed broken in production despite `public/daily-entrance-motion.js` existing and being wired in

### 1.1 What's actually there

`public/daily-entrance-motion.js` (994 lines, commit `57cb7be`) is a real, thoughtfully-built animation controller — per-page sequences for Home/Logging/Stats/Insights/Library, Web Animations API-driven (`element.animate(...)`, not CSS classes, so no missing-stylesheet explanation), a skip-on-click handler, and per-day/per-identity persistence via `localStorage`. It's wired into `public/app.js` at `hideLoginInitializationOverlay()` (~line 12938), `enterGuestFromAuth()` (~line 14202), and `activatePage()` (~line 46576). This is not a "nothing was built" situation — the mechanism itself runs. I confirmed this by booting the app locally as a returning guest with no manual triggering: `window.RankedCoachDailyEntrance.getState()` came back `{ ready: true, activePage: "home" }` and a real WAAPI animation was captured on `document.getAnimations()`. So the plumbing works in at least one condition.

### 1.2 What's different about the condition where Michael saw nothing

The one case I could reproduce success in was a guest session with **no Supabase backend at all** (`supabaseClient?.auth` falsy → `initUserSession()` takes the synchronous early-return branch at `app.js:48350-48355`, calling `hideLoginInitializationOverlay()` immediately). Michael's real app has Supabase configured, so a real return visit goes through the async session-restore branch (`app.js:48357-48387` → `initializeSignedInAccount(user, { reason: "session-restore" })` → `app.js:16057-16129`), which is a materially different, longer, more failure-prone path. I could not reproduce that path locally (no real Supabase session available to me), so the exact failure point isn't nailed down — but here are the concrete, ranked candidates, in the actual code, that would each produce **exactly** "zero animations, no errors" — the symptom Michael reported:

1. **`prefersReducedMotion()` (`daily-entrance-motion.js:89`) silently and permanently disables the whole system for the day.** In `setSessionReady` (`:906-923`), if this returns true, `daily.skipped = true` is set immediately with no console output, no visual cue, nothing — `canAnimatePage` then returns false for every page for the rest of the day. This reads the OS/browser-level "reduce motion" accessibility setting, not an in-app setting. **Check this first** — it's a one-line check (`window.matchMedia("(prefers-reduced-motion: reduce)").matches`) in whatever browser/OS Michael tested with.
2. **The readiness retry loop can spin forever without ever firing.** `notifyDailyEntranceMotionReady()` (`app.js:12905-12930`) polls every 120ms for `hasBlockingVeil` to clear before calling `controller.setSessionReady(...)`. If any of the four veil/overlay conditions it checks (`profile-cleanup-active`, `appLoadingVeil`, `loginInitOverlay`) never actually clears — a stuck-modal-state bug, which this app has had before (`notes/mobile-skin-preview-two-tap-bug-2026-07-17.md`) — this retries silently forever and `setSessionReady` is never called at all.
3. **`context.userId` could resolve empty on a non-standard sign-in path.** `getDailyEntranceMotionContext()` (`app.js:12889-12896`) needs `currentAuthUser?.id` set. I traced the password/session-restore path and `currentAuthUser` is set synchronously at the top of `handleSignedInUser()` (`app.js:16019`) before `hideLoginInitializationOverlay()` can run — that path looks correct. OAuth or magic-link sign-in may take a different code path that doesn't guarantee the same ordering; not confirmed either way, worth checking directly.

**Fix approach:** add temporary logging (or use devtools) at the three points above, do a real login/return-visit test — not the synthetic bypass described in 1.3 below — and confirm which of these (or something else) is actually happening before changing code. Don't guess-fix all three defensively; find the actual one, since a defensive fix to the wrong one would ship as "done" again without being verified, which is exactly what happened last time.

### 1.3 The existing test suite has a real blind spot — fix this regardless of which root cause above is confirmed

`testing/visual-audit/daily-entrance-audit.js:117` calls `controller.setSessionReady({ userId: "guest" })` **directly**, bypassing the entire real trigger chain (`hideLoginInitializationOverlay` → `notifyDailyEntranceMotionReady` → `setSessionReady`) that a real user's session actually goes through. This test can pass 100% while the real trigger path is completely broken — which is consistent with what happened here. Rewrite this test (or add a second one) to drive the **natural** boot path: load the app as a returning authenticated/guest session with no manual controller calls, and assert the sequence starts on its own. Keep the existing forced-call tests for the individual sequence behaviors (they're still useful for that), but they cannot be the only coverage for "does this actually turn on."

### 1.4 The original animation spec, restated in full — build against this exactly

This is Michael's original request, verbatim, since the shipped version didn't match it and needs to be re-verified against the actual spec, not just against whatever the previous build happened to do:

> Add animated flare on the first login of the day. General style: unfade + slide-down. Occasionally slide left-to-right instead, no fade needed but preferred. Animations load in order per page, first time a user visits that page each day. Some cards load before their content/assets arrive — expect blank/prepped cards that animate in before content fills them in. Animations should be short, professional, and smooth.
>
> **Load order, with what animates within each:**
> 1. **This Week's Focus + Recent Improvement** (same time) — each pill falls into place, in order.
> 2. **The entire middle row** — Compass spiders out into place.
> 3. **Chart row** — everything appears at once, but K/D/A/ACS count up.
> 4. **Form** — all sections drop into place.
> 5. **Feed** — all sections drop into place.
> 6. **Stats card summary** — left-side numbers count up. Right-side rank counts up with changing rank icons, always starting from Iron 1, animation always takes 4 seconds max regardless of actual rank (a Radiant player shouldn't wait longer than an Iron player). Right-side role win-rate numbers count up.
> 7. **Recent Match Trends and Match Patterns** — all cards slide into place.
> 8. **Map Stats, Agent Stats, Weapon Stats** — content drops down top to bottom, one row at a time (procedurally generated content).
> 9. **Main Focus card** — Why/How/Source cards "pop" into place.
> 10. **Priority Trends** — cards pop into place.
> 11. **Trend Groups** — trend rows pop left to right, top to bottom; then signal cards drop left to right, down into place.
> 12. **Library page** — hero, then scope, then left-to-right grid cards, one at a time, left to right.
>
> Mobile gets the same animation types, but order follows column order instead of the desktop order above.
>
> **Skip:** one click anywhere skips all animations for the rest of that day.

Cross-check the shipped `PAGE_SEQUENCES` in `daily-entrance-motion.js` (`sequenceHome`, `sequenceLogging`, `sequenceStats`, `sequenceInsights`, `sequenceLibrary`) against this list item by item once the trigger bug is fixed — a quick skim suggests most of this was actually implemented (rank count-up capped at 4s, compass "spiders out" via a dedicated `compass` motion type, row-by-row stat reveals), so the most likely explanation really is "the code is right but never runs," not "the code doesn't match spec." Confirm that once triggering is fixed, rather than assuming.

---

## 2. Featured Playlist — categorization uses title-matching even where a real structural signal already exists

Confirmed in `worker/content-automation.mjs`. This isn't a case of the categorization logic being lazy everywhere — `isShort` (`:143-146`) and `isLive`/`wasLive` (`:190-191`) are already real, structural, API-derived signals, not guesses. The problems are specific and fixable:

### 2.1 Twitch has no VOD ingestion at all
Twitch only appears in this codebase as a **live-stream** card (`renderTwitchPlayer`, `getTwitchChannel`, `gamesense-library.js:327-397`) — there is no code path anywhere that pulls a Twitch channel's past broadcasts into the Playlist. Michael's point ("Twitch is VOD's") is that once a Twitch stream ends, it's a VOD on Twitch's own platform — that's a distinct, real content type the Playlist is currently missing entirely, not a miscategorization of something that exists.

**Fix:** build a Twitch VOD pull using the same trusted-channel pattern already established for YouTube (`fetchTrustedChannelVideos`, `worker/content-automation.mjs:214-226`) — Twitch's Helix API `GET /videos?user_id={id}&type=archive` returns past broadcasts. Requires a Twitch API client credential (check for an existing `TWITCH_CLIENT_ID`/`TWITCH_CLIENT_SECRET` binding before assuming one needs adding — the existing live-stream check likely already has one). These become their own `sourceType`/`topicType` (see 2.2), not a special case bolted onto the live-stream renderer.

### 2.2 "VODs" currently conflates two different things by falling back to a narrow title-keyword list
`hasVodCue()` (`worker/content-automation.mjs:159-163`) checks the real API signal first (`video.isVod === true || video.wasLive === true` — good), but its fallback for everything else is a hardcoded phrase list (`!vodreviews`, `ranked block coaching`, `free valorant tracker reviews`, etc.) clearly written for one or two specific creators' chat commands, not a general rule. This is exactly the "uses titles instead of source" pattern Michael flagged.

**Fix:**
1. Split what's currently one "VODs" bucket into two real `topicType` values: **"Live/Streaming"** for anything where `wasLive === true` (a recorded livestream — real signal, already computed, just never surfaced as its own category) or a real Twitch VOD from 2.1, versus a plain **long-form guide/coaching video** that just happens to be over 30 minutes — that's not a VOD, it's a normal video, and doesn't belong in the same bucket.
2. Keep the title-keyword fallback only as a last resort when no structural signal is available, and when it does fire, tag the result the same way the skin-media auto-curation already handles low-confidence matches (`notes/patch-content-automation-2026-07-16.md`, section 2) — flag it in the content-review notification rather than silently trusting a guess.

### 2.3 Missing category surfaces
- **Add an "All" tab.** `getPlaylistFilters()` (`gamesense-library.js:294-296`) has no unfiltered view — confirmed missing, add it as the first tab.
- **Surface "Live/Streaming" as a real filterable topicType** (per 2.2), not just the separate live-now section that already exists — Michael's ask is for it to sit alongside Shorts and normal videos as one of the three real YouTube content shapes, not be a completely separate feature.

---

## Testing checklist — don't report this batch done until:

1. The actual root cause from Section 1.2 is identified via a live test against a real returning session (not the synthetic `setSessionReady` bypass) — name which of the three candidates it was, or what else it turned out to be.
2. `daily-entrance-audit.js` is extended to cover the natural trigger path per 1.3, and that new test is what's used to confirm the fix — not just the existing forced-call tests passing again.
3. Once triggering is confirmed working, spot-check at least 3 of the 12 sequences in Section 1.4 live (screenshot or recording) against the described order/motion type — Home's pill fall-in, Stats' capped-at-4-seconds rank count-up, and Library's left-to-right grid reveal are good representative picks.
4. A real Twitch VOD (not a live stream) appears in the Playlist under its own category, sourced from the Helix API, not fabricated.
5. At least one video that was previously mis-bucketed into "VODs" by the old keyword fallback is confirmed to now land in the correct category (Live/Streaming vs. a normal long guide video).
6. The "All" tab renders every item with no filter applied.
7. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
8. Bump the cache key in `public/index.html` for every changed asset.
