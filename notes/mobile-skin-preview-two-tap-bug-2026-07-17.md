# Mobile Skin Preview — the Real Bug, Confirmed by Reproduction (2026-07-17)

Michael has reported this specific thing broken 5+ times. Every previous round got reported fixed because the test suite validating it was scripted to tap the one exact spot that actually works — it never tested what a real user does. This note gives the confirmed root cause and the fix; **don't re-tune timing/thresholds again, the interaction logic itself is wrong.**

---

## 1. Confirmed root cause (reproduced live, not inferred from reading code)

A Playwright repro against the real `public/library/gamesense-library.js` + `gamesense-collections.js` data, on a mobile viewport with touch emulation, tapping the **general card body** (not any specific sub-element) twice in a row:

```
Tap 1 (card body) → card gets .is-selected: true
Tap 2 (card body again) → overlay count: 0   <- nothing happens
Tap 3 (card body again) → overlay count: 0   <- still nothing
Tap on [data-gamesense-collection-open] specifically → overlay count: 1   <- only this works
```

**The interaction requires the second tap to land exactly on a small "Open Preview" button that fades in at the bottom-left of the art thumbnail after the card is selected.** A real user has no way to know that button is the only thing that opens the preview — they tap the card again, the same thing they just tapped, and it silently no-ops (it's already selected, so re-selecting produces no visible change). That reads as "broken," repeatedly, because it is.

## 2. Why every previous fix "passed" anyway

`public/library/gamesense-library.js:1462-1481` (touchend handler):
```js
if (activation.openRequested && activation.trigger.classList.contains("is-selected")) {
  openSkinPreview(activation.trigger);
  return;
}
selectCollectionPreview(activation.trigger);
```
`activation.openRequested` is only `true` if the tap's `touchstart` target was inside `[data-gamesense-collection-open]` (set at line 1453). It is **not** based on whether the card is already selected — a second tap anywhere else on an already-selected card falls through to `selectCollectionPreview` again, which is a no-op (already selected).

The exact same over-restrictive pattern is duplicated in two more places:
- Click handler, `gamesense-library.js:1578-1589` — gates on `!collectionOpen` (was the click on the button) rather than on `.is-selected` state.
- Keydown handler, `gamesense-library.js:1636-1644` — same pattern, for Enter/Space.

Meanwhile `testing/visual-audit/gamesense-library.test.js` — the suite every previous round used to confirm "fixed" — explicitly targets the button on the second interaction, every time:
```js
const firstMobileCollectionOpen = firstMobileCollectionCard.locator("[data-gamesense-collection-open]");
...
await touchWithNaturalDrift(mobile, firstMobileCollectionOpen, { x: 2, y: 2 });   // line 1360
...
await touchWithNaturalDrift(mobile, mobileReaverCard.locator("[data-gamesense-collection-open]"), { x: 2, y: 2 });  // line 1409
```
The test was never wrong about what it tested — it just never tested what a real, uninformed user actually does (tap the card, not a specific 44px sub-element they have no reason to know about). That's why "fixed" kept shipping without the real complaint going away.

## 3. The fix — gate on selection state, not on tap target

Change all three gates (touchend, click, keydown) from "did this specific interaction target the Open button" to "is the card already selected." The Open button can stay as a visual affordance (a hint that a second tap will open it) but must not be the only thing that works.

**`gamesense-library.js:1476`** — touchend handler, change:
```js
if (activation.openRequested && activation.trigger.classList.contains("is-selected")) {
```
to:
```js
if (activation.trigger.classList.contains("is-selected")) {
```
(drop `activation.openRequested &&` entirely — `openRequested` and the `touchstart` tracking for it can be removed if nothing else uses it, don't leave dead code).

**`gamesense-library.js:1583`** — click handler, change:
```js
if (!collectionOpen && usesTwoStepCollectionPreview()) {
  selectCollectionPreview(collectionPreview);
  return;
}
openSkinPreview(collectionPreview);
```
to:
```js
if (usesTwoStepCollectionPreview() && !collectionPreview.classList.contains("is-selected")) {
  selectCollectionPreview(collectionPreview);
  return;
}
openSkinPreview(collectionPreview);
```
(the `collectionOpen` variable becomes unused here — remove it if nothing else in this branch needs it, check the surrounding block before deleting).

**`gamesense-library.js:1636-1644`** — keydown handler, same change: gate on `collectionPreview.classList.contains("is-selected")` instead of `!collectionOpen`.

Result: tap 1 anywhere on the card selects it (unchanged). Tap 2 **anywhere on the same card** — body, image, text, or the Open button — opens the preview, because the gate now checks the card's own selected state instead of which pixel got tapped.

## 4. Mandatory test requirement — this is the part that actually prevents a 6th recurrence

Add a test case to `testing/visual-audit/gamesense-library.test.js` that taps the **general card body** twice in a row (not `[data-gamesense-collection-open]`) and asserts the overlay opens. This is the exact scenario that was never tested and is why this shipped broken repeatedly. Keep the existing button-targeted test too (it's still valid — the button should also work), but the card-body-only path is the one that must be added and must pass. Suggested shape, near the existing mobile block (`gamesense-library.test.js:1348-1361`):

```js
const secondCollectionCard = mobile.locator(".gamesense-collection-card[data-gamesense-collection-preview]").nth(1);
await touchWithNaturalDrift(mobile, secondCollectionCard); // tap 1: selects
assert.equal(await secondCollectionCard.evaluate(card => card.classList.contains("is-selected")), true);
await touchWithNaturalDrift(mobile, secondCollectionCard); // tap 2: SAME card body, not the button
await mobile.locator(".gamesense-skin-preview-overlay.is-open").waitFor({ state: "visible" });
```

Don't report this fixed without this specific test passing. The button-only test passing is not sufficient evidence — it never was, that's the whole reason this took 5+ rounds.

## 5. Checklist

1. Second tap on the general card body (not the Open button) opens the preview — verified via the new test in section 4, not just observed once.
2. Second tap directly on the Open button still also works (existing test, don't regress it).
3. First tap still only selects, never opens (single-tap-opens-immediately would be a different regression — don't overcorrect).
4. Desktop click behavior unchanged — `usesTwoStepCollectionPreview()` is false there, single click still opens directly.
5. Keyboard: Enter/Space on an already-focused, already-selected card opens it; on an unselected card, selects it first — same state-based gate as touch/click.
6. `node --check` passes; run the full existing visual-audit suite, not just the new test, before reporting done.
7. Bump the cache key in `public/index.html`.
