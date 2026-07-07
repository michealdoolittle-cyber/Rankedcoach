# RankedCoach Full Passthrough — Corrections Report

**Run date:** 2026-07-06
**Method:** Automated Playwright harness (`testing/visual-audit/audit.js`) driving the real guest-entry UI — no test-only hooks. Mobile (390x844) and desktop (1440x900), both `Guest: Blank` and `Guest: Demo Import` states, every nav page and every reachable modal. 46 full-page screenshots + console logs reviewed manually. Raw screenshots: `testing/visual-audit/output/`.

Ranked by severity. Each entry: what's wrong, where, how confirmed, suggested fix. Add new issues to the bottom of the matching severity section using the same format — see `PASSTHROUGH-CHECKLIST.md` for the recording convention.

**2026-07-06 mobile nav redesign update:** The old mobile bottom-shell action model has been superseded. Bottom nav now contains page tabs only; mobile avatar/profile rating opens through `#mobileHeaderProfileBtn`; mobile settings opens through `#mobileHeaderSettingsBtn`; Bug Report moved to Settings -> Account & Support -> Support. Full harness passed after the redesign: zero console issues and zero horizontal overflow across mobile/desktop, blank/demo, all pages and reachable modals.

---

## High Severity

### 1. Ask Coach and Report a Bug do not visibly open on mobile
- **Status:** Superseded and fixed by the mobile nav redesign. Ask Coach now opens from the labeled `#mobileAskCoachOpen` header-row pill; Bug Report now opens from Settings -> Account & Support -> Support. Verified in focused mobile smoke at 390x844 and 360x740, plus the full Playwright harness.
- **Where:** Mobile viewport, both guest states. Desktop works correctly (screenshots: `output/desktop/*/modal-ask-coach.png`, `modal-bug-report.png` both show the panels open cleanly).
- **Evidence:** `output/mobile/blank/modal-ask-coach.png` and `modal-bug-report.png` are pixel-identical to the plain home page — no panel appeared. Clicking the trigger icon threw no error (the button is visible/clickable), but nothing rendered. Reproduced in both blank and demo states.
- **Likely cause:** `app.js` maintains a *separate* mobile-cloned button pair (`#mobileAskCoachOpen`, `#mobileBugReportOpen`, appended directly to `document.body` — see `ensureMobileAskCoachButton()`/`ensureMobileBugReportButton()` around app.js:704-772) alongside the original desktop `#askCoachOpen`/`#bugReportOpen`. The mobile clone's click handler re-dispatches to the original element's click / calls `openBugReportModal()` directly, but the resulting panel's mobile CSS (`.ask-coach-panel` has at least 3 separate `body.is-mobile-layout .ask-coach-panel{...}` blocks at app.css:7003, 36659, 37493, plus `.open`/`[aria-hidden="true"]` state rules at 40787 and 45089) may not be resolving to a visible state. This needs live-device/DevTools investigation, not just a code read — screenshot automation found the symptom but the exact rule at fault wasn't conclusively identified.
- **Fix:** Reproduce manually on a real mobile viewport with DevTools open, check computed `display`/`opacity`/`transform` on `.ask-coach-panel` and the bug-report modal after tapping the mobile buttons, and consolidate the mobile CSS overrides for these two panels (see maintainability note below — this file has many redundant/conflicting mobile blocks for the same selectors).

### 2. Profile Rating / Coach Readiness has no way to open on mobile
- **Status:** Superseded and fixed by the mobile nav redesign. Profile Rating / Coach Readiness now lives in the combined mobile avatar popover opened by `#mobileHeaderProfileBtn`; the bottom bar is page navigation only.
- **Where:** Mobile viewport, both guest states.
- **Evidence:** The JS-built mobile bottom nav (`ensureMobileBottomShell()`, app.js:610-678) only wires two profile actions: `data-mobile-action="profile"` (switcher) and `data-mobile-action="menu"` (settings dropdown). There is no mobile trigger for `#profileRatingWidget`. Confirmed by reading the click-handler dispatch (app.js:654-668) and by the harness: attempting `#profileRatingWidget` on mobile times out because the element is not visible/actionable there.
- **Impact:** The Coach Readiness / unlock-progress feature (shipped in commit `63d13f5`, documented in `notes/progress-ui.md`) is desktop-only in practice — mobile players can never see their unlock thresholds or building-profile status.
- **Fix:** Add a `data-mobile-action="rating"` entry to the mobile bottom shell (or fold the rating summary into the existing profile-switcher popover on mobile) so the same information is reachable.

### 3. "Recent Improvement" widget can show a duplicate stat tile
- **Status:** Fixed in this pass. Recent Improvement candidates now dedupe by visible metric label before the four-card selection renders, preventing duplicate player-facing tiles.
- **Where:** Home page, both viewports, both states — `output/desktop/blank/page-home.png`, `output/desktop/demo/page-home.png`, `output/desktop/blank/modal-profile-dropdown.png`.
- **Evidence:** The 4-tile "Recent Improvement" grid is supposed to show 4 distinct metrics. Across separate runs it showed **"ACS" in two of the four tiles** (identical label + value + delta) in one run, and **"Positive Mood Rate" in two of the four tiles** in another — reproduced 3+ times across different screenshots/runs, so it's a real selection bug, not a one-off render glitch.
- **Fix:** Whatever selects the "top 4 recent-improvement metrics" needs to dedupe by metric key before rendering; right now it appears to sometimes pick the same metric for two slots.

---

## Medium Severity

### 4. Guest-switcher "active profile" highlight is inconsistent between viewports
- **Status:** Fixed in this pass. Desktop `.profile-row-guest.active` now receives the same red/orange active treatment used on mobile.
- **Where:** Profile switcher popover (`Guest: Blank` / `Guest: Demo Import` rows).
- **Evidence:** `output/mobile/demo/modal-profile-switcher.png` clearly shows "Guest: Demo Import" highlighted in a red/orange gradient (the active-row treatment) while "Guest: Blank" stays plain gray. `output/desktop/demo/modal-profile-switcher.png` — same underlying state (a profile with matches loaded) — shows **both rows in the same plain gray**, no active highlight on either.
- **Fix:** Check the `.profile-row-guest.active` styling for a desktop-specific override that's suppressing the highlight, or a desktop-only selector mismatch.

### 5. "Confidence: High Confidence" repeats the word "Confidence"
- **Status:** Fixed in this pass. The Insights confidence pill strips the trailing `Confidence` word from model labels before rendering, so it reads `Confidence: High`.
- **Where:** Insights page, `MAIN FOCUS` card pill, both viewports (`output/desktop/blank/page-insights.png`, `output/mobile/blank/page-insights.png`).
- **Evidence:** The pill reads "Confidence: High Confidence" — compare to the Home page's "Weekly Read" cards which correctly show "Confidence: High" (no repeat). This wasn't in the original ~25-string copy audit list.
- **Fix:** Same fix pattern as the copy-language pass — likely `Confidence: ${label}` where `label` is already "High Confidence" instead of "High". Add to `notes/copy-language.md` for the next language pass.

### 6. Mobile "RR TO NEXT RANK" value truncates mid-number
- **Status:** Fixed in this pass. Mobile RR-to-next value now preserves the full number and lets the rank/header text compress first.
- **Where:** Mobile top bar, all pages (e.g. `output/mobile/blank/page-home.png`).
- **Evidence:** Shows "Radiant 5..." — truncating inside the rank/RR number itself rather than the rank name, which reads ambiguously (Radiant 500? 580? 599?).
- **Fix:** Either shrink the font/abbreviate the label ("RR TO NEXT" ) to make room, or truncate the rank name instead of the number, or wrap to a second line.

---

## Needs Manual Verification (not conclusive from screenshots alone)

### 7. Theme Selector gallery's last row clips at the "Save Profile" footer
- **Status:** Not-a-bug-confirmed-working. Opened the mobile Theme Selector, scrolled the actual `.profile-edit-panel.is-active` container to the bottom, and confirmed the final swatches remain reachable above the sticky Save Profile footer with no console issues.
- **Where:** Edit Profile → Theme Selector, both viewports.
- **Evidence:** A partially-visible swatch row sits right where the sticky "Save Profile" button begins.
- **Why unconfirmed:** Full-page screenshots capture the outer page scroll but not nested `overflow:auto` containers past their visible bounds — this is very likely just a normal scrollable list (the gallery scrolls internally) and not a real clipping bug, but that can't be proven from a screenshot. **Testing methodology gap** — see note in `PASSTHROUGH-CHECKLIST.md`.
- **Fix:** Manually open the modal and scroll the theme gallery to confirm all swatches are reachable and nothing is actually cut off.

### 8. Profile-switcher popover sits very close to the mobile bottom nav
- **Status:** Not-a-bug-confirmed-working. Opened the mobile profile switcher and confirmed the popover sits above the bottom nav without a functional overlap or blocked controls.
- **Where:** Mobile profile switcher (`output/mobile/*/modal-profile-switcher.png`).
- **Evidence:** A thin colored sliver is visible at the seam between the popover's bottom edge and the fixed bottom nav bar.
- **Fix:** Manually check there's no z-index/overlap gap — likely fine (app.js positions the switcher relative to `--mobile-bottom-nav`) but worth a quick live check after any change to bottom-nav height or safe-area insets.

---

## Maintainability Note (not a live bug, but a recurring root cause)

`public/app.css` has **at least 6-9 separate, non-adjacent `body.is-mobile-layout .nav-right{...}` / `.nav-left{...}` / `.nav-btn{...}` blocks** (e.g. lines ~4230, 5848, 6888, 35790, 37321, 38551 for `.nav-right` alone) with contradicting values (`display:none` vs `display:flex`, different `max-width`), resolved only by CSS source-order last-wins rather than an intentional cascade. This is the same pattern Task 1's structure audit already flagged ("Multiple theme/profile-border CSS blocks exist from historical fix passes"). It's the most likely root cause of finding #1 above, and makes every future mobile-layout change a gamble on which block actually wins. Worth a dedicated cleanup pass before doing much more mobile CSS work — consolidate to one `@media` block per selector.
