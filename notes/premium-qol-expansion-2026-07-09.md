# Premium Feel + Quality-of-Life Expansion — Full Directive for Codex

**Status:** Spec'd 2026-07-09, not yet built. Everything below came out of a design conversation with Michael about making the two premium themes (`radiant-focus`, `omen-night`) feel genuinely premium, plus a parallel set of quality-of-life ideas he wants available to *every* user, not just premium accounts — his words: "the app is essentially and should be customizable for the users preference on look and feel," with premium being "another level of exciting" layered on top of an already-good baseline, not the only source of a good experience.

**Hard scope constraint, applies to every item below unless explicitly marked otherwise:** Riot may still be reviewing the live desktop app as part of the API key approval process (`notes/riot-sync.md`). Every new visual/motion change in this doc is **mobile-only** — gate JS branches behind `isMobileLayoutViewport()` (`app.js:410-412`) and CSS behind the `body.is-mobile-layout` class (set `app.js:558-560`), exactly like the premium theme motion work already shipped. The only items exempt from this are ones with **zero possible desktop rendering effect** — each item below states explicitly whether it's mobile-only or safe-on-both, don't guess.

**Gating precedent, reuse everywhere premium-exclusive is mentioned:** `PREMIUM_THEME_QA_EMAILS` (`app.js:30550`) and `isPremiumThemeQaUser(user = currentAuthUser)` (`app.js:32218`) are the existing premium-account gate. Every premium-exclusive feature below should check this same function — don't invent a second gating mechanism.

---

## Phase A — shared infrastructure (build first, other phases depend on this)

Three things don't exist yet and multiple features below need them. Build these before Phase C.

### A1. A reusable toast/confirmation component

**Confirmed this doesn't exist today** — searched for `showToast`/`showConfirmation`/`showBanner`/snackbar patterns in `app.js`, zero matches. Whatever currently shows "Saved" or similar feedback does it inline/one-off per feature, not through a shared component.

Build one: a small `showToast(message, { variant = "default" })` function that renders a transient, auto-dismissing message (bottom of screen on mobile, doesn't block interaction, ~2-3s visible then fades). This becomes the hook point for themed premium styling (A1 depends on: reading `isPremiumThemeQaUser()` and the active theme's `motion` value to pick a themed variant vs. default). Safe on both viewports structurally (the component itself), but the **themed variant styling is mobile-only** per the scope constraint.

### A2. Peak-rank / personal-best event detection

**Confirmed this doesn't exist as an event today** — peak rank is tracked as passive display data only, via `computePeakProfileProgress(profile)` (`app.js:41621`, `app.js:47506`), consumed for a Stats page display element (`stats-peak-rank-icon`/`stats-peak-rank-text` around `app.js:21730-21744`). There is no boolean/event anywhere for "the player just now hit a new peak" — it's computed fresh from stored history every time, with no before/after comparison and no celebratory UI at all currently.

Build this fresh: after a match save (see A3 below) or Riot sync completes, compare the newly computed peak against the previously stored peak (you'll need to persist "last known peak" somewhere — check `profile` fields for a natural place, or add one) and emit a `justHitNewPeak` boolean for that save event. This is genuinely new logic, not a hookup to something existing — budget real time for it, don't treat it as a quick wire-up.

### A3. Match-save completion hook

Manual match logging goes through `addLogEntry()` (`app.js:39705`) — confirm this is the actual submit handler (trace what calls it from the log form) and identify the exact point where a save has just succeeded and the UI is about to re-render the feed. Screenshot-imported matches go through `confirmHistoryImportRecords()` (`app.js:10899`). **Both paths need the same post-save hook** (toast confirmation, peak-rank check, result-reveal flourish) — don't build two separate implementations; factor a shared `onMatchSaved(record, { isNewPeak })` call both paths invoke.

---

## Phase B — premium-exclusive visual features (mobile-only, reuse existing systems)

### B1. Theme motion intensity tuning (already spec'd, still not shipped)

Don't re-spec this — it's fully written in `notes/premium-themes.md`'s "Intensity follow-up" section. Just confirm it's actually in this batch's scope: wider opacity plateau on the glint-sweep, structural (not filter-only) avatar ring glow. Do this first in Phase B since it's already fully designed, zero new research needed.

### B2. Two new premium-exclusive animated border ring styles

`PROFILE_BORDER_STYLES` (`app.js:40582-40598`) is a flat array of `{ value, label, note }`. `renderBorderGallery()` is `app.js:41450`. Each style gets a CSS class (`.profile-border-{value}` pattern) with its own `@keyframes`, gated behind `.border-animated` (see the crosshair bug fix from the earlier bug-fix pass for the exact gating pattern to copy — `.border-animated.border-crosshair`, not just `.border-crosshair`).

Add two new entries, gated to premium accounts only (don't add them to the array unconditionally — branch the array construction or filter at render time on `isPremiumThemeQaUser()`, same pattern as `PREMIUM_PROFILE_THEME_PRESETS`):
- A Radiant-Focus-exclusive ring (working name "sunburst" — gold rays/spokes radiating outward, pulsing outward on a slow loop)
- An Omen-Night-exclusive ring (working name "eclipse" — a slow violet-to-cyan rotating crescent/arc, darker and more restrained than sunburst)

Reuse `--theme-motion-duration` for timing consistency with the rest of the premium motion work.

### B3. One premium-exclusive banner per theme

`PROFILE_BANNER_STYLES` (`app.js:40600`) entries are either Riot-art-linked (`image: "https://media.valorant-api.com/..."`) or CSS-only (`pattern: "linear-gradient(...)"`, category `"unofficial"` — confirmed via `getProfileBannerCategory()`, `app.js:41291-41294`, and `getBannerPattern()`, `app.js:41318`). **Use the CSS-pattern approach, not a Riot image link** — don't tie a monetized premium feature to Riot's own card art, and it avoids needing new image assets entirely. Build two gradient patterns using each theme's actual accent colors (`radiant-focus`: gold/blue; `omen-night`: violet/cyan), gated to premium accounts the same way as B2.

### B4. Themed login overlay

`showLoginInitializationOverlay()`/`setLoginInitializationProgress()` (`app.js:10801+`, per the earlier bug-fix pass) drives `#loginInitOverlay`. Add a check for `isPremiumThemeQaUser()` at overlay-show time and swap the progress bar's color (currently presumably the default red/accent) to the active premium theme's accent gradient. This is the one item in Phase B that's borderline mobile-only — the login overlay itself renders on both viewports, so scope **only the premium color swap** behind `isMobileLayoutViewport()`, not the overlay's existence (which must keep working identically on desktop).

### B5. Accent color pairing audit

Search `app.css` for hardcoded hex colors on buttons/chips/pills/tags that should be using `var(--accent)`/`var(--accent-2)` instead — the `.lens-modal-close` hardcoded-red bug from the earlier pass is a confirmed instance of this exact pattern; there are likely more. This directly serves "accent color pairings" feeling more complete/consistent for premium themes, since right now only the big card treatments reliably pick up theme colors. **This audit and fix is safe on both viewports** (it's just correcting hardcoded colors to use the CSS variable that's already being set correctly) — not mobile-gated.

### B6. Heading and stat-number typography treatment

`.card-title`/`.stat-value`-pattern classes are reused consistently across `index.html` (confirmed, ~12 occurrences of a small set of shared classes rather than scattered one-offs) — this is buildable as a small, targeted set of rules. For premium accounts, add letter-spacing/weight/subtle accent-glow treatment scoped to these shared classes, mobile-only. Do NOT touch body text, labels, or paragraph copy — headings and numbers only, so readability of the actual coaching content never degrades.

### B7. Themed agent-icon aura during manual logging

Find the agent icon element in the manual log entry form (distinct from the avatar/profile agent picker already covered by `renderAvatarGallery()`) and add a subtle pulsing ring/glow around it, premium-gated, mobile-only, reusing the `--theme-motion-duration` timing convention. Confirm the exact selector before building — trace forward from `addLogEntry()` (`app.js:39705`) to find the form markup it reads from.

### B8. Foil-corner treatment on Coach Readiness cards

`getCoachReadinessModel()` (`app.js:10448`), `getReadinessLockedMarkup()` (`app.js:10473`), `renderCoachReadinessUI()` (`app.js:10488`). Add a diagonal shine/foil corner CSS treatment scoped specifically to these cards' markup (get the exact rendered class names by reading these three functions — don't guess a selector), premium-gated, mobile-only. This ties the premium feel to the app's actual coaching value prop, not just profile decoration.

---

## Phase C — moment-based premium features (needs Phase A)

### C1. Rank-up / personal-best celebration

Once A2 (peak detection) exists: on `justHitNewPeak === true`, premium accounts get a distinct celebratory flourish (screen-edge flash, themed color sweep) via the A3 save hook. Non-premium accounts can get a smaller/simpler acknowledgment (or none, if Michael wants this fully premium-exclusive — confirm which before building, don't assume).

### C2. Match-result reveal flourish

Via the A3 save hook: on every match save (not just peak moments — this is the high-frequency one), premium accounts get a themed win/loss reveal treatment (brief color sweep matching the theme, gold for a Radiant Focus win, violet pulse for Omen Night). This is the highest-frequency touchpoint in this whole batch — get the intensity right, it'll be seen far more than any of the ambient card motion.

### C3. Themed toast confirmations

Via A1: premium accounts' toasts pick up theme-accent styling instead of the default. Straightforward once A1 exists.

### C4. Themed empty/locked states

Extend B8's treatment (or a lighter version of it) to the Coach Readiness *locked* state markup specifically (`getReadinessLockedMarkup()`, `app.js:10473`) so premium identity shows up even for newer accounts without much data yet, not just fully-unlocked profiles.

---

## Phase D — general quality-of-life, NOT premium-gated (available to everyone)

### D1. Free-form accent color picker

A color-picker input (not just the 29 preset themes) for choosing a custom accent color, layered on top of whatever base theme is selected. Check how deeply `--accent`/`--accent-2` propagate before committing to full freedom here — if B5's audit finds many hardcoded colors, a free-form picker will expose those gaps immediately, so **do B5 before D1**, not after.

### D2. Light ambient motion option for free themes

Free themes are hardcoded to `motion: "static"` in `createProfileTheme()` (`app.js:40269`-area, confirmed unchanged this whole project). Add ONE new shared motion option (not the premium-exclusive `glint-sweep`/`shadow-drift` classes) that any user can opt into — clearly a smaller/calmer effect than the premium ones, so premium still reads as strictly bolder. Mobile-only per the standard constraint.

### D3. Surface accessibility controls more visibly

Confirm where `accessibility.contrastMode`/`motionMode`/`layoutMode` currently get set in the UI (trace forward from their consumption in the theme-apply function) and whether that control surface is easy to find today. If it's buried, move it somewhere more visible — Account tab of Account & Support is the natural fit given the recent tab-collapse work. Safe on both viewports — this is a discoverability fix, not new visual behavior.

### D4. Home page card reordering / show-hide — bigger lift, scope carefully

**Confirmed the Home page is static markup in `index.html` (`#page-home`, line 1082), not driven by an ordered config array.** This is a real architectural gap, not a quick preference toggle — building true drag-reorder means converting Home's rendering from static HTML into a data-driven render function first. That's a bigger project than everything else in this doc combined. **Recommend scoping D4 down for a first pass:** simple show/hide toggles for a small, fixed set of optional widgets (not full reordering) is realistic soon; true reordering should be its own separate future phase, not bundled into this batch. Confirm with Michael before Codex sinks real time into the full version.

---

## Build order recommendation

Phase A (infrastructure) → Phase B (visual, all independently shippable, do B1 first since it's already fully spec'd) → Phase C (needs A) → Phase D (independent of A/B/C, can run in parallel with any of them, D1 waits on B5, D4 needs a scoping decision first).

## Testing, every phase

- Every mobile-gated item: verify on `body.is-mobile-layout`, then explicitly verify **zero change** at desktop width with the same account — screenshot both, don't just assume the CSS scoping worked (this exact assumption needs re-verifying every time given how much of this codebase's history is duplicate/conflicting mobile CSS blocks).
- Every premium-gated item: verify visible for the QA account, verify completely absent (not just hidden — absent from the DOM) for guest/non-QA accounts.
- Reduced Motion accessibility setting: confirm it suppresses every new animation added in this batch, not just the ones from the original premium theme pass.
- Run `testing/visual-audit/audit.js` (both viewports, both guest states) after each phase — zero new console errors, zero new horizontal-overflow flags.
- Update this file's Status line and cross-reference `notes/premium-themes.md` where an item extends work already tracked there, so status doesn't fork across two files.

---

## Desktop regression check (separate ask, not part of the feature work above)

Michael asked for a check that everything shipped so far hasn't broken desktop. I ran `testing/visual-audit/audit.js` myself (both viewports, both guest states) against the current `main` branch — see chat for the result of this specific run rather than this doc, since it's a one-time verification, not an ongoing spec. If it surfaces anything, that becomes its own bug entry in `notes/mobile-bug-fixes-2026-07-08.md` rather than being folded into this feature doc.
