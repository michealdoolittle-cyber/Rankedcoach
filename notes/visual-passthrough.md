# Visual Passthrough Corrections — Handoff to Codex

Full findings, evidence, and screenshots: `testing/visual-audit/CORRECTIONS.md` (read that first for each item — this file is just the priority order and done-criteria). Checklist for future passthroughs: `testing/visual-audit/PASSTHROUGH-CHECKLIST.md`. Harness: `testing/visual-audit/audit.js` (`cd testing/visual-audit && node audit.js`, needs `npm install` once — see that folder's own `package.json`).

Work top to bottom. After each fix, rerun the harness and eyeball the relevant screenshot(s) before moving to the next item — don't batch all fixes then check once at the end.

## 1. Ask Coach / Report a Bug don't open on mobile (High)

`CORRECTIONS.md` #1. Reproduce on a real mobile viewport with DevTools open — tap the Ask Coach or bug-report icon in the mobile top bar and check whether `.ask-coach-panel` / the bug-report modal actually gets a visible computed style (not just the `open`/`aria-hidden` attribute — check `display`, `opacity`, `transform`). There are 3+ separate `body.is-mobile-layout .ask-coach-panel{...}` blocks in `app.css` (~lines 7003, 36659, 37493) plus state rules at 40787 and 45089 — find which one is actually winning and whether it's hiding the panel. Also check `ensureMobileAskCoachButton()`/`ensureMobileBugReportButton()` (app.js ~704-772) — these mobile-cloned buttons dispatch to the original desktop element; confirm that dispatch actually reaches a working handler on mobile.

**Done when:** tapping both icons on a 390px-wide viewport visibly opens the panel, confirmed in a fresh harness screenshot (`modal-ask-coach.png` / `modal-bug-report.png` under `output/mobile/*/`) that no longer matches the plain home page.

## 2. No mobile entry point for Profile Rating / Coach Readiness (High)

`CORRECTIONS.md` #2. The mobile bottom shell (`ensureMobileBottomShell()`, app.js ~610-678) only wires `data-mobile-action="profile"` and `"menu"`. Add a third action (e.g. `"rating"`) that opens `#profileRatingDropdown`, or fold the readiness summary into the existing profile-switcher popover on mobile — your call on which reads better, but players need some way to see Coach Readiness unlock progress on mobile.

**Done when:** a fresh harness run's `output/mobile/*/modal-profile-rating.png` shows the dropdown instead of the harness's current auto-skip (the script currently throws `SKIPPED: profile-rating has no mobile bottom-shell trigger` for mobile — once you add a trigger, update `MODALS` in `audit.js` to use it instead of skipping).

## 3. "Recent Improvement" widget shows a duplicate stat tile (High)

`CORRECTIONS.md` #3. The 4-tile grid on the Home page picks "top 4 recent-improvement metrics" but doesn't dedupe — reproduced showing "ACS" twice in one run and "Positive Mood Rate" twice in another, on both viewports. Find wherever that tile list is built (likely near `buildPlayerModel()` / the "Recent Improvement" section in app.js) and add a dedupe-by-metric-key step before selecting the 4 tiles to show.

**Done when:** `output/*/demo/page-home.png` shows 4 visibly distinct metrics/labels, checked across a couple of harness reruns since the underlying data can vary.

## 4. Guest-switcher active-profile highlight missing on desktop (Medium)

`CORRECTIONS.md` #4. Mobile correctly highlights the active `Guest: Blank` / `Guest: Demo Import` row in red/orange; desktop shows both rows plain gray for the same state. Check for a desktop-specific override on `.profile-row-guest.active` that's suppressing it.

## 5. "Confidence: High Confidence" repeats itself (Medium)

`CORRECTIONS.md` #5. Insights page main-focus pill. Should read "Confidence: High" like the Home page's Weekly Read cards do. This is a copy fix — once you find the template string, add the before/after to `notes/copy-language.md` the same way we did the last copy pass, since it wasn't in the original audit list.

## 6. Mobile RR-to-next-rank value truncates mid-number (Medium)

`CORRECTIONS.md` #6. "Radiant 5..." is ambiguous. Either shrink font/relabel to make room, truncate the rank name instead of the number, or wrap to a second line — your call on which fits the mobile top-bar space best.

## Lower priority — manual verification only, don't blind-fix

- `CORRECTIONS.md` #7 (Theme Selector gallery clipping at Save Profile footer) and #8 (profile-switcher popover seam on mobile) — both are likely fine (normal scroll / normal positioning) and only look suspicious in a full-page screenshot. Manually open and scroll/inspect before touching any code. If actually broken, fix; if fine, just note "checked, working as intended" back in `CORRECTIONS.md`.

## Not urgent, but flag if you're touching mobile CSS anyway

`CORRECTIONS.md`'s maintainability note: `app.css` has 6+ scattered, contradictory `body.is-mobile-layout .nav-right/.nav-left/.nav-btn{...}` blocks resolved only by source-order last-wins. This is almost certainly the underlying mess behind #1. If fixing #1 means touching this area, consider consolidating those blocks into one rather than adding a 7th — but don't scope-creep into a full CSS cleanup unless that's what it takes to actually fix #1.

## Reporting back

Update `testing/visual-audit/CORRECTIONS.md` — mark each item's status (fixed / not-a-bug-confirmed-working / needs-more-info) as you go, same pattern as the copy-language handoff. Re-run the full harness once when everything above is done and confirm no new console errors or overflow flags in the fresh `output/report.json`.
