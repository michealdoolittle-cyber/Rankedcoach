# Copy / Language Audit

Build brief v3 asked for a list-only pass. No user-facing coaching copy was rewritten in this pass.

## Rules To Preserve

- Use player language first, not internal model language.
- Explain the takeaway before explaining the stat.
- Keep short cards in a two-sentence rhythm: what the coach sees, then how the player should approach it.
- Avoid internal words like `slice`, `blocker`, `global`, `signal`, and `first contact` unless the UI explains them first.
- Use `All-time` instead of `Global`.
- Use `match window`, `recent matches`, or a named season/act instead of `slice`.
- If data is limited, say what is missing and what the app can still reasonably assume.

## Strings To Review

- `public/index.html:464` — “Tell RankedCoach what was missing or what needs more detail.”
- `public/index.html:1340` — “Current Window”
- `public/index.html:1612` — “No rating, mood, or map selected yet.”
- `public/index.html:1698` — “Pending Riot sync verification”
- `public/app.js:1967` — default `Current Window`
- `public/app.js:2062` — “No imported match sample yet.”
- `public/app.js:2077` — “not enough to overrule future results”
- `public/app.js:2104` — “needs more matches before the read is fair”
- `public/app.js:2130` — “No repeated map has enough matches yet.”
- `public/app.js:2766` — “There are not enough mood logs yet to make a strong tilt read.”
- `public/app.js:2773` — “not enough low-rating log volume”
- `public/app.js:2842` — “fair map read”
- `public/app.js:2884` — “fair agent read”
- `public/app.js:4093` — “unlock Riot-based coaching”
- `public/app.js:4096` — “unlock a stronger first coaching cycle”
- `public/app.js:4350` — “player model needs more match volume”
- `public/app.js:4357` — “Build sample”
- `public/app.js:4377` — “Minimal confidence”
- `public/app.js:4544` — “central evidence rules”
- `public/app.js:4650` — “This checks whether you are surviving...”
- `public/app.js:4749` — “This uses Riot damage-per-round data...”
- `public/app.js:4755` — “clearest picture of what is working”
- `public/app.js:4820` — “No weapon category data reported yet.”
- `public/app.js:4945` — “latest imported block”
- `public/app.js:5147` — “Current Imported Window”
- `public/app.js:5390` — “Fallback watch score”
- `public/app.js:5404` — “Current coaching model built from...”

## Current Risk

Many strings still explain what a metric is instead of what a player should do with it. The next copy pass should start with match trend cards, data reads, and insight empty states because those are the highest-volume coaching surfaces.
