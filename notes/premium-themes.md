# Premium Theme Scaffold

**Status (2026-07-08):** QA-only live preview shipped. `radiant-focus` and `omen-night` now wire into the real Theme Selector for `michealdoolittle@gmail.com` through the same Edit Profile apply path as free themes, while guest and non-QA users keep the original gallery with no premium cards or theme options rendered into the DOM. `public/themes/premium-themes.js` remains a future data hook only; no subscription/payment system was added in this pass.

**Status (2026-07-08, later same day):** Michael confirmed live access under his account. The two themes are currently color-only reskins — no distinct motion or texture identity, and no visible name anywhere in the card gallery (a pre-existing gap affecting every theme, not just these two). Next: give both themes a genuinely distinct, bold visual identity per §"Distinct design directive" below. **Mobile-only for this pass** — see the constraint note inside that section for why.

Build brief v3 asked for premium themes to exist as a gated proof of concept, not as a live marketplace.

## Implemented

- Added `themes/premiumThemes.js` as the source-side theme object model.
- Added `public/themes/premium-themes.js` as the browser-loaded locked theme registry.
- Added two premium theme examples:
  - `radiant-focus`
  - `omen-night`
- Each theme stores:
  - `colors`
  - `signatureMotion`
  - `emphasis`
  - `subscriptionRequired`
  - `locked`
- Access is locked unless a future profile/subscription flag grants `premiumThemes`.

## Gating Rule

Premium themes remain unavailable by default. The browser registry only reports a theme as available when one of these is true:

- `window.RANKEDCOACH_FEATURES.premiumThemes === true`
- `window.RANKEDCOACH_FEATURES.allPremium === true`
- `profile.subscription.premiumThemes === true`
- `profile.subscription.tier === "premium"`
- `profile.entitlements.premiumThemes === true`

## Not Implemented

- No payment flow.
- No public marketplace.
- No live premium theme selector behavior.
- Existing free theme behavior is unchanged.

---

## Next steps for Codex - wire the two themes into the live gallery, gated to one QA account

Goal for this pass: make `radiant-focus` and `omen-night` actually visible and selectable in the real Theme Selector - but **only** for Michael's own logged-in account, so he can inspect them in the live app. Everyone else (guests and every other account) must keep seeing today's behavior: nothing changes, no locked cards, no hint these exist. This is still not a purchasable feature - do not build a payment flow, pricing copy, or a public "Premium" marketplace section. It's a director-only preview gate, same spirit as the existing Theme Builder admin gate.

**Precedent to copy, not reinvent:** `THEME_BUILDER_ADMIN_EMAILS` (`app.js:30350`) plus `isCurrentUserThemeBuilderAdmin()` (`app.js:31999-32009`) already implement exactly this pattern - a client-side email allowlist checked against `currentAuthUser.email` - to gate the Theme Builder feature. Mirror it, don't design something new.

1. **Add a QA allowlist.** Near `THEME_BUILDER_ADMIN_EMAILS`, add a new const, e.g. `PREMIUM_THEME_QA_EMAILS = ["michealdoolittle@gmail.com"]`, and a helper `isPremiumThemeQaUser(user = currentAuthUser)` that lowercases/trims and checks `user?.email` against it - same shape as `isCurrentUserThemeBuilderAdmin()`.
   - This only works once Michael has actually signed up / logged in to the live app with `michealdoolittle@gmail.com` through the existing Supabase auth modal (`authModal`, `app.js:12277`) - it's a real account gate, not a guest-profile flag. If he's currently only using a guest profile, logging in with that email is a prerequisite, not optional.

2. **Give the two premium themes the same color shape as free themes.** `PROFILE_THEME_PRESETS` entries are built via `createProfileTheme(value, label, mode, colors)` (`app.js:40269`), which already fills in sensible defaults (`base`, `base2`, `border`, `borderStrong`, `button`, `buttonHover`, `glow`, etc.) for any field you don't pass. The premium theme color values in `public/themes/premium-themes.js` (`accent`, `accent2`, `card`, `card2`, `text`, `muted`) map directly onto `createProfileTheme`'s override object - no adapter needed. Add two entries built this way (dark mode for both, matching the existing hex values) so they render and apply through the exact same code path as every other theme card.

3. **Update `renderThemeGallery()` (`app.js:41129`) to branch on QA access:**
   - `const premiumUnlocked = isPremiumThemeQaUser();`
   - If `premiumUnlocked` is true: append the two premium theme cards to the gallery, fully clickable/selectable, no visual difference from a free card - Michael needs to actually apply and preview them, not just see a static swatch.
   - If false (every other account, every guest): render nothing extra - gallery looks exactly as it does today. Do not show a locked/padlock/"coming soon" card to non-QA users in this pass; that's a separate future decision once there's an actual monetization plan, not something to build speculatively now.

4. **Don't touch `hasPremiumThemeAccess`/`profile.subscription`/`profile.entitlements` in `public/themes/premium-themes.js`.** Those stay as unused future hooks for when a real subscription system exists - the QA allowlist is a separate, simpler mechanism layered on top for this preview pass, not a replacement.

### Testing checklist - confirm before reporting done

1. Log in to the real app (not a guest profile) as `michealdoolittle@gmail.com`. Open Edit Profile -> Theme Selector. Confirm both `Radiant Focus` and `Omen Night` cards appear, are selectable, and applying them updates colors via `previewEditProfileVisuals()` the same as any free theme.
2. Log out / use a guest profile / log in as any other account. Confirm the gallery is pixel-identical to before this change - no extra cards, no console errors.
3. Run the scoped visual-audit passthrough per `testing/visual-audit/PASSTHROUGH-CHECKLIST.md`'s "Profile avatar, border, or theme code" row (profile-switcher, profile-dropdown, edit-profile-theme modal, both viewports) for the non-QA state, since that's what every real user will see.
4. Confirm no premium theme references leak into guest/non-QA console output, network payloads, or DOM (e.g. don't render the cards `display:none` - don't render them into the DOM at all for non-QA users).

---

## Distinct design directive - bold, mobile-only signature identity for both themes

**Constraint, read first:** Riot may be reviewing the live desktop app right now as part of the API key approval process (see `notes/riot-sync.md` - the key is still pending). Nothing in this pass may change desktop rendering, even for the QA account. Everything below is gated behind the existing mobile-layout mechanism: `isMobileLayoutViewport()` for any JS-side branch (`app.js:410-412`), and the `body.is-mobile-layout` class for all new CSS (set at `app.js:558-560`). Every new keyframe/selector must be written as `body.is-mobile-layout.theme-<name> ...` or nested under an existing `body.is-mobile-layout` block - never a bare `.theme-<name>` rule - so desktop silently no-ops even though the same `theme-<name>` class gets added to `<body>` on both viewports (see mechanism below).

**Why this is a small change, not a rebuild:** the motion-delivery pipe already exists and already works, it's just never been fed anything but "static". In the theme-apply function (`app.js:41561-41565`), `body.classList.add(\`theme-${theme.motion || "static"}\`)` runs after clearing six existing motion classes (`theme-static/kinetic/rings/orbit/shimmer/tide`), each with a real `@keyframes` rule already in `app.css` (~lines 22198-22218) scaled by the existing `--theme-motion-duration` CSS variable (`app.css:21563`). The only reason no theme animates today is that `createProfileTheme()` (`app.js:40269`) hardcodes `motion: "static"` on every object it returns (`app.js:40292`) with no way to override it. Don't reuse the six existing motion classes for these two themes though (other free themes may adopt them later and it'd dilute "premium" feeling distinct) - add two new ones, named after the original design intent that already existed in `public/themes/premium-themes.js` before this was wired up (`signatureMotion.name`, lines 17 and 40 of that file): `theme-glint-sweep` for `radiant-focus`, `theme-shadow-drift` for `omen-night`.

1. **Let theme objects carry a real motion value.** Add an optional 5th param or object field to `createProfileTheme()` (or set `.motion` directly on the two `PREMIUM_PROFILE_THEME_PRESETS` objects after construction - whichever is less invasive to the 29 existing free-theme call sites, which should all keep resolving to `"static"` exactly as today). Set `radiant-focus` to `motion: "glint-sweep"` and `omen-night` to `motion: "shadow-drift"`.

2. **Radiant Focus - "peak-chase" identity.** Emphasis per the original design brief: rank progress and peak-chase reads, gold highlights over cool blue support. Build, scoped to `body.is-mobile-layout.theme-glint-sweep`:
   - A diagonal light-sweep band (gradient highlight translating across card surfaces on a loop, ~1.8s per the original `signatureMotion.durationMs`, ease-in-out) crossing `.profile-panel`/card backgrounds - bold enough to notice, not so bright it fights with stat text on top.
   - A pulsing gold glow on the active profile avatar ring (`box-shadow`/`drop-shadow` pulse tied to `--accent`), distinct from any existing free-theme ring treatment.
   - Reuse `--theme-motion-duration` as the base timing unit so this respects the app's existing motion-scaling system rather than hardcoding a duration that ignores it.

3. **Omen Night - "controller/lurk" identity.** Emphasis per the original brief: controller, lurk, and decision-making reads, dark violet cards with soft cyan edges. Build, scoped to `body.is-mobile-layout.theme-shadow-drift`:
   - A slow drifting fog/silhouette layer behind cards - one or two large soft radial-gradient blobs whose position animates slowly (~2.4s per the original `signatureMotion.durationMs`, `cubic-bezier(.22,.61,.36,1)`) to feel like something moving just out of frame, not a literal video/particle asset.
   - A soft cyan edge-glow "breathing" effect on card borders (opacity/blur pulse), and a violet-to-cyan conic-gradient rotation on the active avatar ring.
   - Same `--theme-motion-duration` reuse as above.

4. **Card gallery name labels.** Separately from motion: no theme card in `renderThemeGallery()` (`app.js:41134-41163`) shows a visible name today - this affects all 29 free themes too, not just the premium two, so fix it once for everyone rather than special-casing the premium cards. Add a label under/over each `.theme-card-preview` showing `theme.label`, mobile and desktop both (this part is NOT mobile-only - a missing name is a real usability gap on both viewports and carries no desktop visual-regression risk, it's pure addition). Keep it small and unobtrusive so it doesn't crowd the existing swatch layout.

5. **Performance check, since this is the "bold" tier.** New `@keyframes` running continuously behind card content on mobile is more GPU/battery cost than the app has asked of any theme so far. Prefer `transform`/`opacity`-only animations (compositor-friendly) over animating `background-position`/`filter` where possible, and confirm the existing `access-reduced-motion` class (`app.js:41562`, set when `accessibility.motionMode === "reduced"`, `app.js:41568`) actually suppresses these two new animations the same way it should suppress the existing six - don't ship a11y-motion-preference regressions.

### Testing checklist for the design pass

1. Log in as `michealdoolittle@gmail.com` on a real mobile viewport (or device emulation at mobile width). Select Radiant Focus - confirm the glint-sweep motion plays on card surfaces and the avatar ring glow pulses, and it's visibly distinct from every free theme's `static` motion.
2. Repeat for Omen Night - confirm the drifting fog/shadow effect and cyan edge-glow/conic ring rotation.
3. Resize/reload at a desktop width (or check `body.is-mobile-layout` is absent) with the same account - confirm **zero visual change** from before this pass: no new animation, same colors as the color-only version that already shipped. This is the constraint that matters most - verify it explicitly, don't assume the CSS scoping worked.
4. Toggle Reduced Motion in accessibility settings, confirm both new animations stop (or reduce to the same treatment `theme-static` gets under that setting).
5. Confirm every free (non-premium) theme card and the two premium cards all now show a visible name label, both viewports, and that this addition doesn't visually break the existing swatch/pill layout (`testing/visual-audit/PASSTHROUGH-CHECKLIST.md`'s theme-surface row).
6. Run the scoped visual-audit passthrough for theme/profile surfaces (mobile viewport, QA account) - zero console errors, zero horizontal overflow, before reporting done.
