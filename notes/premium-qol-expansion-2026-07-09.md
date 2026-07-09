# Premium Feel + Quality-of-Life Expansion — Full Directive for Codex

**Status (2026-07-09):** Phases A, B, C, D1, D2, and D3 are now shipped in the live code path. This batch added the reusable toast stack, shared match-save completion hook, persisted peak-rank detection, mobile-only premium moment overlays, stronger Radiant Focus / Omen Night motion tuning, premium-only mobile border rings and signature banners, themed login overlay treatment, accent-variable cleanup on shared controls, premium typography/aura/foil polish, the custom accent picker, the calm-motion option for free themes, and surfaced accessibility controls in Account & Support. D4 remains intentionally unbuilt and still needs its own future scope decision because Home is static markup, not an ordered render config.

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

**Exact implementation:**
1. Add a new persisted field, `profile.peakRR` (number, RR value of the highest point ever reached), alongside the existing profile fields mutated by `updateProfile(id, data)` (`app.js:40914-40932` — follow the exact same pattern used there for `riotId`/`region`: read the previous value, compute the next value, assign, don't touch fields not passed).
2. In the A3 save hook (below), after the match is added to `profile.matches`, call `computePeakProfileProgress(profile)` fresh (it already re-derives from `profile.matches`, no change needed there) and compare its result to `profile.peakRR`.
3. If the new peak is strictly greater than the stored `profile.peakRR`: set `justHitNewPeak = true` for this save event, then call `updateProfile(activeProfileId, { peakRR: newPeakValue })` and `saveProfiles()` (`app.js:40424`) so it actually persists — don't just hold it in memory, or it resets every reload and would falsely re-trigger the celebration on next launch.
4. First-ever save for a profile with no prior `profile.peakRR` (i.e. `profile.peakRR` is `undefined`/`0`): do NOT treat this as a "new peak" celebration — initialize it silently. The celebration is for beating a *previous* peak, not for the first data point ever recorded.

### A3. Match-save completion hook

**Confirmed the exact hook point.** Manual match logging's submit handler is `addLogEntry()` (`app.js:39705-39789`) — traced it directly: it pushes to `logEntries`, calls `upsertManualMatchForLogEntry(entry)` (`app.js:39736`), then re-renders (`renderLogFeed()`, `renderInsights()`, etc. at `app.js:39760-39765`) before resetting the form fields (`app.js:39767-39789`). Insert the new hook call **right after line 39765** (`syncWeeklyFocus();`), before the form-reset block begins — at that point the match is fully saved and all data-layer state is current, but the UI reset hasn't started yet, so a toast/flourish can render cleanly without fighting the form-clear.

Screenshot-imported matches go through `confirmHistoryImportRecords()` (`app.js:10899`) — call the same hook there too, after its save-to-profile step completes (read the function to find its equivalent "save is now fully committed" point; it should be structurally similar — after data is written, before/independent of any modal-close UI cleanup).

**Both paths call the same shared function** — write `onMatchSaved(record, { isNewPeak })` once (near `addLogEntry`, or wherever shared save-adjacent helpers already live) and call it from both sites with the actual saved record and the `justHitNewPeak` result from A2. Don't duplicate the toast/flourish/peak-check logic in two places.

---

## Phase B — premium-exclusive visual features (mobile-only, reuse existing systems)

### B1. Theme motion intensity tuning (already spec'd, still not shipped)

Don't re-spec this — it's fully written in `notes/premium-themes.md`'s "Intensity follow-up" section. Just confirm it's actually in this batch's scope: wider opacity plateau on the glint-sweep, structural (not filter-only) avatar ring glow. Do this first in Phase B since it's already fully designed, zero new research needed.

### B2. Two new premium-exclusive animated border ring styles

`PROFILE_BORDER_STYLES` (`app.js:40582-40598`) is a flat array of `{ value, label, note }`. `renderBorderGallery()` is `app.js:41450`. Each style gets a CSS class (`.profile-border-{value}` pattern) with its own `@keyframes`, gated behind `.border-animated` (see the crosshair bug fix from the earlier bug-fix pass for the exact gating pattern to copy — `.border-animated.border-crosshair`, not just `.border-crosshair`).

Add two new entries, gated to premium accounts only (don't add them to the array unconditionally — branch the array construction or filter at render time on `isPremiumThemeQaUser()`, same pattern as `PREMIUM_PROFILE_THEME_PRESETS`):

**"Sunburst" (Radiant Focus exclusive):** 8 short radiating spokes around the ring, built as 8 evenly-spaced `box-shadow` segments (45° apart, same technique as the existing crosshair style's 4-directional `box-shadow` segments — copy that structural approach, just double the segment count and shorten each spoke's length so it reads as a burst, not a cross). Color: `var(--accent)` core with a `color-mix(in srgb, var(--accent) 60%, transparent)` outer glow. Animation: `@keyframes profileBorderSunburstPulse` — spokes scale from `0.85` to `1.15` and opacity `0.6` to `1` over the cycle, `ease-in-out`, duration `calc(var(--theme-motion-duration) * .15)` (~2.7s at the current 18s base — noticeably faster than the ambient card motion so it reads as a distinct, more energetic ring, not just a slower echo of the card sweep).

**"Eclipse" (Omen Night exclusive):** a dark crescent/shadow disc that slowly transits across the ring, distinct from the theme's existing ambient avatar halo (`themeOmenRingSpin`, a full conic-gradient rotation already used for the ambient card-motion pass — don't reuse that same visual, this needs to look different from it since both can be visible on the same avatar at once). Build via a radial-gradient "occluding" pseudo-element (`::after` on the border-ring wrapper, `background: radial-gradient(circle at var(--eclipse-x,50%) 20%, rgba(5,5,15,.85), transparent 55%)`) whose `--eclipse-x` custom property animates from `-20%` to `120%` in a straight line pass (not a rotation) over `calc(var(--theme-motion-duration) * .2)` (~3.6s), pausing/resetting with a longer gap between passes (`animation-timing-function: steps` or a keyframe with a long hold at 0%/100%) so it reads as an occasional "eclipse event," not continuous motion — reinforces the "lurk" identity from the original design brief (something happening, then still, then happening again) rather than nonstop motion.

Both: gate behind `.border-animated` exactly like every other animated border style (per the crosshair bug fix precedent — the gate goes in the selector itself, not as a separate check).

### B3. One premium-exclusive banner per theme

`PROFILE_BANNER_STYLES` (`app.js:40600`) entries are either Riot-art-linked (`image: "https://media.valorant-api.com/..."`) or CSS-only (`pattern: "linear-gradient(...)"`, category `"unofficial"` — confirmed via `getProfileBannerCategory()`, `app.js:41291-41294`, and `getBannerPattern()`, `app.js:41318`). **Use the CSS-pattern approach, not a Riot image link** — don't tie a monetized premium feature to Riot's own card art, and it avoids needing new image assets entirely.

Add two entries to `PROFILE_BANNER_STYLES` with `category: "unofficial"` and no `image` field, gated to premium accounts the same way as B2 (filter at the same point the array gets consumed, don't add unconditionally):

```js
{ value: "radiant-focus-signature", label: "Radiant Signature", category: "unofficial",
  pattern: "radial-gradient(circle at 15% 20%, #facc1533, transparent 42%), linear-gradient(120deg, #facc1522 0%, transparent 45%, #38bdf822 78%, transparent 100%)" }
{ value: "omen-night-signature", label: "Omen Signature", category: "unofficial",
  pattern: "radial-gradient(circle at 82% 25%, #8b5cf640, transparent 45%), linear-gradient(135deg, #090a1a 0%, #151129 55%, #06b6d422 100%)" }
```

These follow the exact shape `getBannerPattern()` already expects (`app.js:41318-41328` — a CSS gradient string) so no changes to the rendering function are needed, only the new array entries plus the premium-gate filter.

### B4. Themed login overlay

`showLoginInitializationOverlay()`/`setLoginInitializationProgress()` (`app.js:10801+`, per the earlier bug-fix pass) drives `#loginInitOverlay`. Add a check for `isPremiumThemeQaUser()` at overlay-show time and swap the progress bar's color (currently presumably the default red/accent) to the active premium theme's accent gradient. This is the one item in Phase B that's borderline mobile-only — the login overlay itself renders on both viewports, so scope **only the premium color swap** behind `isMobileLayoutViewport()`, not the overlay's existence (which must keep working identically on desktop).

### B5. Accent color pairing audit

Search `app.css` for hardcoded hex colors on buttons/chips/pills/tags that should be using `var(--accent)`/`var(--accent-2)` instead — the `.lens-modal-close` hardcoded-red bug from the earlier pass is a confirmed instance of this exact pattern; there are likely more. This directly serves "accent color pairings" feeling more complete/consistent for premium themes, since right now only the big card treatments reliably pick up theme colors. **This audit and fix is safe on both viewports** (it's just correcting hardcoded colors to use the CSS variable that's already being set correctly) — not mobile-gated.

### B6. Heading and stat-number typography treatment

Confirmed the two anchor classes and their current values: `.card-title` (`app.css:11795-11802` — `font-size:13px; letter-spacing:0.12em; text-transform:uppercase; color:#9ca3af; font-weight:700`) and `.stat-value` (`app.css:20079-20083` — `font-size:clamp(31px,1.72vw,36px); font-weight:800; color:#f8fafc`). Both are reused consistently, not scattered one-offs (confirmed via the ~12 shared-class occurrences in `index.html`).

**Note in passing:** `.card-title`'s `color:#9ca3af` is a hardcoded gray, not theme-linked — same class of issue as B5. Fix it to `var(--muted)` while in this file region regardless of the premium work; that's a correctness fix for everyone, not premium-gated.

**Exact premium deltas**, added as a `body.is-mobile-layout[data-theme="radiant-focus"] .card-title` / `[data-theme="omen-night"] .card-title` (and same pattern for `.stat-value`) override — check the actual attribute/selector the theme-apply function sets (`body.dataset.theme = themeKey`, confirmed `app.js:41563` from earlier investigation) so this targets real markup:
- `.card-title`: `letter-spacing: 0.16em` (up from 0.12em — noticeable, not excessive), `font-weight: 800` (up from 700).
- `.stat-value`: keep size/weight as-is (already maximal), add `text-shadow: 0 0 10px color-mix(in srgb, var(--accent) 35%, transparent)` for a subtle glow on the numbers specifically — this is the "premium numbers feel alive" signal without changing legibility, since text-shadow at this opacity doesn't reduce contrast against the dark card backgrounds.

Do NOT touch body text, labels, or paragraph copy — headings and numbers only, so readability of the actual coaching content never degrades.

### B7. Themed agent-icon aura during manual logging

**Confirmed the exact element.** The agent icon in the manual log form is `#logAgentImg`, inside a wrapper `#logAgentDisplay` (`app.js:16155-16165`, the `updateLogAgentDisplay()` function that sets `display.dataset.agent`). Target `#logAgentDisplay` (the wrapper, not the raw `<img>`) for the aura ring — a `box-shadow`/border-glow pulse using `var(--accent)`, same `calc(var(--theme-motion-duration) * ...)` timing convention as the other premium motion work. Only render/activate when `logAgentDisplay.dataset.agent` is actually set (an agent has been picked) — don't glow an empty icon slot.

### B8. Foil-corner treatment on Coach Readiness cards

`getCoachReadinessModel()` (`app.js:10448`), `getReadinessLockedMarkup()` (`app.js:10473`), `renderCoachReadinessUI()` (`app.js:10488`). Add a diagonal shine/foil corner CSS treatment scoped specifically to these cards' markup (get the exact rendered class names by reading these three functions — don't guess a selector), premium-gated, mobile-only. This ties the premium feel to the app's actual coaching value prop, not just profile decoration.

---

## Phase C — moment-based premium features (needs Phase A)

### C1. Rank-up / personal-best celebration

Once A2 (peak detection) exists: on `justHitNewPeak === true`, **every account** gets an acknowledgment — this is a real accomplishment moment, and per Michael's stated principle, feel-good baseline UX isn't a premium-exclusive lever. Two tiers of the same event:
- **Non-premium:** a clean, simple banner/toast via the A1 toast component — "New peak rank!" with the rank icon, no special color treatment beyond the app's default accent.
- **Premium:** the amplified version — a themed screen-edge flash/color sweep (gold for Radiant Focus, violet for Omen Night) in addition to the same toast, plus (optional, only if straightforward once built) a brief extra flourish on the avatar ring.

Same trigger, same underlying event (`justHitNewPeak`) — the two tiers are a rendering branch on `isPremiumThemeQaUser()`, not two separate features to build.

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
