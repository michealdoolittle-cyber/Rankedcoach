# Premium Theme Scaffold

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
