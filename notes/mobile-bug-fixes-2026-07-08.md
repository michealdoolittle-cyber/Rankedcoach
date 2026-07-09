# Mobile Bug Fixes — Directive for Codex

**Status:** Spec'd 2026-07-08, not yet built. 14 issues reported by Michael after using the live mobile app. Each was investigated against current source (not guessed) before writing the directive below — file:line citations are from reading the actual code. Two items turned out **not to reproduce** in current source at all; those are flagged explicitly rather than given a fabricated fix — re-verify live before touching code on those two.

Grouped by severity: **High** (real functional regressions), **Medium** (perf/clarity), **Low/Unconfirmed** (couldn't reproduce from source, needs live re-check first).

---

## High severity

### 1. Quickly leaving and returning to the tab causes a full account refresh

**Root cause found:** `supabaseClient.auth.onAuthStateChange()` (`app.js:30558-30589`) has no debounce or "is this actually a new sign-in" check. Supabase's own client library re-validates/refreshes the session when the tab regains visibility (this is built into `supabase-js`, not something RankedCoach wrote). Every time that fires, this handler's fallback branch runs unconditionally:
```
void handleSignedInUser(session?.user || null);   // app.js:30584
```
`handleSignedInUser()` (`app.js:13482-13499`) calls `loadPersistentAccountState(user)` — a real Supabase query (`vip_app_state` table) plus a full UI re-render. There is no tracking of *when* the last load happened or *whether* the user actually changed — any session-carrying auth event, including a silent background token refresh triggered by switching tabs, is treated identically to a fresh login.

**Fix directive:** Add a module-level timestamp, e.g. `lastAccountStateLoadAt = 0`, set whenever `handleSignedInUser`/`initializeSignedInAccount` successfully completes. In the `onAuthStateChange` callback, before the fallback `handleSignedInUser` call at `app.js:30584`, skip the reload if: the `session.user.id` is unchanged from `currentAuthUser?.id` **and** less than 5 minutes have passed since `lastAccountStateLoadAt`. This is the "timed sleep" Michael asked for — a background tab that comes back within 5 minutes should not trigger a full reload; one that's been away longer should. Don't build a separate `visibilitychange` listener (there isn't one today, and this bug doesn't need one — the existing Supabase auth-event path is the actual trigger).

### 2. Bottom nav page switch doesn't close previously opened overlays

**Root cause found:** The bottom-nav tap handler (`app.js:630-641`, inside `ensureMobileBottomShell`) calls `event.stopPropagation()` (`app.js:634`) before running `activatePage()`. This prevents the tap from ever reaching the existing generic "close on outside click" listener (`app.js:37710-37741`), which is the only thing that currently closes `mobileProfilePopover`, `profileSwitcher`, and the settings quick menu (`profileDropdown`). Worse, that generic listener never knew about the Ask Coach panel or Account & Support modal in the first place — those have their own dedicated close functions (`closeAskCoachModal`, `app.js:6779`; `closeAccountSupportModal`, `app.js:9975`) that nothing currently calls on page switch. No `closeAllModals`/`closeAllOverlays` helper exists anywhere in the codebase today.

**Fix directive:** Write a new `closeAllMobileOverlays()` helper and call it at the top of the bottom-nav tap handler (`app.js:630-641`, before `activatePage()`). It should close, unconditionally, every mobile overlay that can currently be open: `mobileProfilePopover` (`app.js:714`), the settings quick menu / `profileDropdown` (`index.html:861`), `accountSupportModal` (`index.html:440`), the Ask Coach panel (via `closeAskCoachModal()`), `editProfileModal` (`index.html:323`), `securitySettingsModal` (`index.html:221`), `historyImportModal` (`index.html:1998`), `riotProfileConfirmModal` (`index.html:305`), `bugReportModal` (`index.html:567`), `goalRankModal` (`index.html:2063`). Leave `authModal` (`index.html:32`) out unless you confirm the bottom nav is even reachable while it's open — if it's not, there's nothing to close there and forcing it shut mid-login would be a regression, not a fix.

### 3. Swipe-to-navigate and menu swiping stop working

**Root cause found — this predates the mobile nav redesign, it's not a regression from it.** `ensureMobileSwipeAffordances()` (`app.js:1457-1520`), which binds swipe listeners to `#mobileLoggingTabs`, `#mobileStatsTabs`, the bottom-nav page strip, and several other containers via `bindMobileSwipe()` (`app.js:1408-1449`), is only called **once**, during initial mobile-layout setup (`app.js:594`). But `ensureMobileLoggingTabs()`/`ensureMobileStatsTabs()` regenerate their tab container DOM on later page switches, and `bindMobileSwipe` guards against double-binding via `dataset.mobileSwipeBound` (`app.js:1417`) — so a freshly regenerated container never gets a listener rebound to it. First visit to a page works; navigate away and back, and swipe on that page silently stops working because the DOM node swipe was bound to no longer exists.

**Fix directive:** Call `ensureMobileSwipeAffordances()` again (or a narrower rebind covering just the affected containers) at the end of `activatePage()`'s mobile branch (`app.js:42641-42665`), and/or immediately after `ensureMobileLoggingTabs()`/`ensureMobileStatsTabs()` finish regenerating their DOM. Confirm `bindMobileSwipe`'s `dataset.mobileSwipeBound` guard correctly treats a freshly-created element as unbound (it should, since it's a new DOM node with no dataset — but verify, since a stale attribute copied via `cloneNode` could falsely block rebinding).

### 4. Crosshair border animation plays even when not selected

**Root cause confirmed.** Two non-adjacent CSS blocks force the crosshair preview animation to run unconditionally, ignoring the `.border-animated` gate that every other border style correctly requires:
- `app.css:19535-19538`
- `app.css:48063` (duplicate block)

Compare to the correctly-gated versions elsewhere in the same file: `app.css:21980` (`.profile-panel.border-animated.border-notched...`) and `app.css:32432` (`.border-card.is-previewing.border-card-notched...`) both require the gate class before animating. The crosshair rule in the two blocks above is missing `.border-animated` in its selector entirely, so it animates for every profile that has the crosshair style set, regardless of whether "Animated Border" is toggled on.

**Fix directive:** Add `.border-animated` to the selector in both `app.css:19535-19538` and `app.css:48063`, matching the pattern already used correctly for notched at `app.css:21980`/`32432`. While in this file region, do a quick pass of the rest of `app.css:19509-19538` and `app.css:48038-48064` (same two blocks) for any other border-style rule with the identical missing-gate defect — this looks like a copy-paste-across-styles bug, not crosshair-specific, so there may be more than one instance.

---

## Medium severity — loading performance & clarity

### 5. Very long wait pulling in profile preferences on cached/signed-in accounts

**Root cause found:** `initializeSignedInAccount()` (`app.js:13501-13541`) runs every step **serially, fully awaited**, even where steps are independent:
1. `handleSignedInUser(user)` → `loadPersistentAccountState(user)` — one Supabase query (`vip_app_state` table)
2. `hydrateSecuritySettingsFromBackend()` — a **separate, independent** query (`account_security_preferences` table) that doesn't depend on step 1's result
3. `performRiotSync(...)` — only runs if `active.riotId` is set; currently short-circuits fast since Riot sync is feature-flagged off (see `notes/riot-sync.md`), so this isn't the bottleneck today, but don't assume that stays true once the Riot key is live
4. UI re-renders, plus a **hardcoded 360ms artificial delay** (`app.js:13536`)

**Fix directive:** Run steps 1 and 2 concurrently via `Promise.all([...])` since neither depends on the other. Remove or drastically shrink the hardcoded 360ms delay at `app.js:13536` — that's pure added latency with no stated purpose in the surrounding code; if it exists to let a UI transition finish, replace it with an actual `transitionend` listener instead of a fixed guess. Re-test load time on an account with meaningfully large `profiles_json`/`log_entries_json` payloads, not just an empty test account.

### 6. Loading percentage appears stuck between categories

**Root cause found:** There's already a real progress system — `#loginInitOverlay` with a percentage bar and 4 step labels (`app.js:10801-10831`, HTML at `index.html:204-217`), driven by `setLoginInitializationProgress(percent, copy, activeStep)`. Steps are `["Profile","Logs","Coach","Ready"]` at roughly 18/46/70/92% (`app.js:13509,13512,13517,13525,13529`). The "stuck" feeling is real: each step jumps straight from one percentage to the next with nothing in between, so if any single step (e.g. a slow `vip_app_state` query) takes a while, the bar sits frozen at the same number for that whole stretch — indistinguishable from actually being stuck. Separately, the **"Logs" step label is wrong** — it displays while `hydrateSecuritySettingsFromBackend()` runs (security preferences), not while any log data is being fetched (`app.js:13513` vs the step label at `13512`).

**Fix directive:** This is the same UI Michael should keep using — don't build a new one. Two changes: (a) relabel the steps to match what's actually happening at each stage (fix the "Logs" mislabel specifically — rename to something accurate for what `hydrateSecuritySettingsFromBackend()` does, e.g. "Security"), and (b) add a small indeterminate pulse/shimmer on the progress bar *within* a step while its async call is in flight, so the bar visibly moves even during a long single-query wait instead of sitting dead still.

### 7. Add clearer notes on what's loading and why it takes longer for larger accounts

**Fix directive:** Same `#loginInitOverlay`/`setLoginInitializationProgress` system as #6. Add a short line of copy under the percentage bar for each step explaining what it's doing in player language (e.g. under the "Profile" step: "Loading your saved profile and match history — larger accounts take longer here"). Follow `notes/copy-language.md`'s existing rules (player language first, no internal jargon) for the wording.

### 8. Missing loading screen on mobile launch

**Investigated, not a clean "missing" bug — needs a live check to pin down which entry path is actually gapped.** A loading veil exists (`showAppLoadingVeil`/`hideAppLoadingVeil`, `app.js:11307-11362`, `.app-loading-veil` CSS at `app.css:19696-19776`) covering guest entry and demo-match import, and the fuller `#loginInitOverlay` covers real Supabase login. No mobile-hiding CSS or JS branch was found for either. **Before writing a fix**, reproduce live on a real mobile viewport across each entry path separately — first-time guest, returning guest (profile already picked, no fresh "entry" event to trigger the veil), demo import, and real login — and identify exactly which one shows no loading indicator on mobile. It's plausible the gap is specifically the *returning guest / already-picked-profile* path, since that one wasn't confirmed to trigger either overlay in this investigation. Report back which path is actually gapped before scoping the fix.

---

## Low severity / needs live re-verification before fixing

These three did not reproduce anywhere in current source after a thorough read. Don't guess at a fix — re-check live on mobile first, screenshot it, and only then write the actual fix (which may target a different selector than the ones below, since these were the most likely candidates and came up clean).

### 9. Notched profile border has no animation

Checked every layer: desktop panel (`app.css:21980-21982`), gallery preview card (`app.css:32432-32434`), and both mobile nav avatar blocks (`app.css:19522`, `48042`) — all correctly reference `@keyframes profileBorderNotchBreathe` (`app.css:22053`) gated behind `.border-animated`/`.is-previewing` exactly like every other working border style. If this reproduces live, it's likely a *third* conflicting block beyond the two already known to exist for this component (see bug #4 above for a confirmed instance of the same disease) — audit `app.css` for every `border-notched` occurrence the same way #4 was found, don't assume the citations above are exhaustive.

### 10. Exit "X" buttons not aligned with header text

Checked `.lens-modal-close`/`.lens-modal-header` (`app.css:17883-17921`) — `display:flex;align-items:center`, 44×44px button, used identically by all four modals named in #11 below. No misalignment found in source. Re-verify live on mobile specifically (source doesn't rule out a mobile-only override not yet found) before fixing.

### 11. Gray exit buttons (Customization menu, Impact pill, Recent Improvement, Trend/Improvement Timeline)

All four resolve to the same `.lens-modal-close` component (`#editProfileClose`, `#lensModalClose`, `#weeklyFocusClose`, `#timelineStatsClose` — index.html:327, 1657, 1135, 1206) sharing one base rule (`app.css:17899-17921`): a hardcoded red gradient (`#ef4444`→`#b91c1c`), not gray, reinforced (not weakened) by a `body[data-theme="default"]` override at `app.css:24121-24127`. No gray override found anywhere for these four selectors. **One real issue worth fixing regardless of whether "gray" reproduces:** the color is a hardcoded hex, not `var(--accent)` — so under any theme other than the default (including the two premium themes from this same directive doc), the close button won't match that theme's accent color. That's a legitimate theme-consistency bug even if it doesn't look "gray." Re-verify the original gray report live first; if it doesn't reproduce, fix the hardcoded-color issue anyway as a smaller, separate polish item, and switch `.lens-modal-close` to reference `var(--accent)`/`var(--accent-2)` so it stays correct across every current and future theme.

### 12. Slight touch delay / lack of feedback switching pages

No CSS transition delay found on the actual page-swap mechanism — `body.is-mobile-layout .page`/`.page.active` uses a hard `display:none!important`/`display:block!important` toggle (`app.css:4177-4196`, reinforced `5434-5443`, `6758-6767`), not an animated transition, and `touch-action:manipulation` is already set on the nav buttons (`app.css:37884`) with the correct viewport meta tag already in place — so the classic mobile 300ms tap-delay shouldn't apply. **Likely actual cause:** no visual `:active`/touchstart feedback state exists on `.mobile-bottom-page-btn` — the tap itself may be fast, but nothing visually acknowledges the touch landed, which reads as "laggy" even when the underlying switch is instant. Fix directive: add an immediate visual press-state (opacity dip or scale-down on `:active`, or a touchstart-triggered class if `:active` proves unreliable on the target devices) to the bottom-nav buttons so users get instant confirmation their tap registered, independent of how long `activatePage()` itself takes. Separately, profile `activatePage`'s mobile branch (`app.js:42641-42665`) and `ensureMobileLoggingTabs()`/`ensureMobileStatsTabs()` for any synchronous work heavy enough to visibly block the next paint — if found, defer it (e.g. `requestAnimationFrame`) rather than running it inline before the page becomes visible.

---

## Full testing / bug checklist — run before reporting any of this done

Test everything below on a real mobile viewport (or device emulation at mobile width), logged in as a real account where relevant, not just guest.

1. **Tab-refresh timing (#1):** Switch away from the tab for under 5 minutes, return — confirm no full reload/re-render happens and the UI state (scroll position, open page) is undisturbed. Leave the tab backgrounded for 5+ minutes, return — confirm a refresh *does* happen this time.
2. **Overlay close-on-nav (#2):** Open each of the 10 listed overlays one at a time, tap a different bottom-nav page tab, confirm it closes. Repeat for at least profile popover, settings quick menu, and Ask Coach explicitly since those were the ones confirmed broken.
3. **Swipe persistence (#3):** On Logging and Stats pages, swipe between tabs successfully. Navigate to Home, then back to Logging/Stats via the bottom nav, and confirm swipe still works — this is the exact sequence that was broken.
4. **Crosshair animation gating (#4):** Set border style to crosshair without turning on "Animated Border" — confirm it does NOT animate anywhere (mobile bottom-nav avatar, profile panel, gallery preview). Turn "Animated Border" on — confirm it does.
5. **Load performance (#5):** Time a login on an account with a non-trivial amount of match history / log entries before and after the `Promise.all` change — confirm a measurable improvement, not just a code diff.
6. **Progress bar (#6, #7):** Watch the login progress bar on a real (not instant) login — confirm it never sits frozen for more than a couple seconds without some visible motion, confirm step labels match what's actually loading, confirm the new explanatory copy is visible and reads clearly per `notes/copy-language.md`.
7. **Loading screen coverage (#8):** Test first-time guest entry, returning guest, demo import, and real login separately — confirm every path shows a loading indicator with no gap. Report which path(s), if any, were actually found missing.
8. **Notched border (#9) / exit alignment (#10) / gray exit buttons (#11):** Screenshot each live before concluding whether it reproduces. If any of these three genuinely reproduce, document the *actual* selector/rule at fault (it won't be the ones ruled out above) before fixing, and add a note back in this file about what the real cause turned out to be.
9. **Touch feedback (#12):** Tap a bottom-nav page button and confirm visible, immediate press feedback (not just the page changing) on every tap, not just the first.
10. **Regression check:** Run the full `testing/visual-audit/audit.js` harness (both viewports, both guest states) — zero new console errors, zero new horizontal-overflow flags versus the last stored `report.json`.
11. **Desktop untouched:** For every fix above that touches shared (non-mobile-gated) code — #1, #5, #6, #7 are JS-only and apply to both viewports; #2, #3, #4, #12 are mobile-specific UI — confirm desktop behavior is unchanged for the JS-only fixes and simply doesn't apply (rather than erroring) for the mobile-only ones.

Update this file's Status line and mark each numbered item resolved/still-open when done, same pattern as `notes/premium-themes.md` and `notes/mobile-nav-redesign.md`.
