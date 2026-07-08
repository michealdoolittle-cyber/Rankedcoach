# Premium Theme Scaffold

**Status (2026-07-08):** QA-only live preview shipped. `radiant-focus` and `omen-night` now wire into the real Theme Selector for `michealdoolittle@gmail.com` through the same Edit Profile apply path as free themes, while guest and non-QA users keep the original gallery with no premium cards or theme options rendered into the DOM. `public/themes/premium-themes.js` remains a future data hook only; no subscription/payment system was added in this pass.

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
