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

## Approved Rows Implemented On 2026-07-06

- `Current Window` changed to `Recent Matches` where approved and on the compass visible fallback.
- `No rating, mood, or map selected yet.` changed to `Add a rating, mood, or map to see it here.`
- `Pending Riot sync verification` changed to `Still waiting on Riot's approval — log manually or import a screenshot for now`.
- `No imported match sample yet.` changed to `Import a few matches to see this here.`
- `No repeated map has enough matches yet.` changed to `Play this map a few more times and we'll show your trend here.`
- `There are not enough mood logs yet to make a strong tilt read.` changed to `Log your mood a few more times and we'll tell you if tilt's affecting your games.`
- The approved `Build sample`, `central evidence rules`, weapon category, imported block, imported window, fallback score, and coaching model phrases were updated in `public/app.js`.

## Current Risk

Many strings still explain what a metric is instead of what a player should do with it. The next copy pass should start with match trend cards, data reads, and insight empty states because those are the highest-volume coaching surfaces.

## Held For Full-Context Rewrite

Claude requested full surrounding strings for these rows before rewriting them. Do not guess at these until the next copy pass.

- `public/app.js:2077` — `sentence: \`${matches} matches is enough to guide the next block, but not enough to overrule future results.\``
- `public/app.js:2104` — `if (band === "none") return \`${lowerSubject} needs more matches before the read is fair.\`;`
- `public/app.js:2773` — `: "There is not enough low-rating log volume yet to isolate a fair self-rating pattern.";`
- `public/app.js:2842` — `diagnosis: \`${mapName} needs more matches before this is a fair map read.\`,`
- `public/app.js:2884` — `diagnosis: \`${agentName} needs more games before this is a fair agent read.\`,`
- `public/app.js:4096` — `action: "Import matches, then add 2-3 reflection logs to unlock a stronger first coaching cycle.",`
- `public/app.js:4350` — `let coachDiagnosis = primaryInsight?.what || "The player model needs more match volume before it can report a sharper diagnosis.";`
- `public/app.js:4650` — `detail: avgKast ? "This checks whether you are surviving, trading, assisting, or converting enough rounds." : "No data",`
- `public/app.js:4749` — `detail: "This uses Riot damage-per-round data to estimate your round-by-round damage impact."`
- `public/app.js:4755` — `detail: bestAgent ? "Your best repeated agent gives the clearest picture of what is working in ranked." : "The app needs more repeated games on the same agents before it can identify a reliable pick."`

## Approved Rows Implemented On 2026-07-06 (Round 2)

Full-context rewrite, cleared after Codex pasted the surrounding sentences above. Applied in `public/app.js` with template literal interpolation preserved:

- `public/app.js:2077` — replace with: `` `${matches} matches is enough to point you in a direction, but not enough to call the final verdict yet.` ``
- `public/app.js:2104` — replace with: `` `${lowerSubject} needs a few more matches before the read is fair.` ``
- `public/app.js:2773` — replace with: `"You haven't logged enough low-rated games yet to spot a real pattern."`
- `public/app.js:2842` — replace with: `` `${mapName} needs a few more matches before this is a fair map read.` ``
- `public/app.js:2884` — replace with: `` `${agentName} needs a few more games before this is a fair agent read.` ``
- `public/app.js:4096` — replace with: `"Import matches, then add 2-3 reflection logs so your first coaching read has more to work with."`
- `public/app.js:4350` — replace with: `"Log a few more matches and we'll sharpen this diagnosis."`
- `public/app.js:4650` — replace with: `"Checks whether you're surviving, trading, assisting, or converting enough rounds."`
- `public/app.js:4749` — replace with: `"Uses Riot's damage-per-round data to estimate your round-by-round impact."`
- `public/app.js:4755` — replace with (both branches):
  - truthy branch: `"Your best repeated agent gives the clearest picture of what's working in ranked."`
  - falsy branch: `"Play the same agent a few more times so we can spot what's actually working."`

## `app.js:4377` "Minimal confidence" — Resolved

Confirmed **user-facing**: this is the `detail` text under the weekly coaching insight cards (primary/secondary/tertiary), shown right next to a High/Medium/Low confidence label the player sees. Not a backend-only string — do not strike it from the audit.

Note: the same "Minimal confidence because…" pattern appears **three times**, not once — the audit only caught one. All three were fixed:

- `public/app.js:4377` (primary card) — replace with: `"Low confidence — not enough repeated reflection logs yet."`
- `public/app.js:4383` (secondary card) — replace with: `"Low confidence — weak-rating data is still sparse."`
- `public/app.js:4389` (tertiary card) — replace with: `"Low confidence — mood and tilt mentions are still limited."`

Reasoning: keeps the word "confidence" (per prior direction not to hide the concept from players) but drops "Minimal" for the more standard High/Medium/Low vocabulary already used on the label right next to it, and leads with the plain-English reason instead of a fragment.

## Visual Passthrough Copy Fixes On 2026-07-06

- `public/app.js` Insights main-focus confidence pill changed from `Confidence: High Confidence` to `Confidence: High`.
- Rule added: if a model label already includes `Confidence`, strip the repeated noun before placing it after a `Confidence:` prefix.

## Task 6 Documentation Gap — Completed

`COACH_READINESS_UNLOCKS` / `renderCoachReadinessUI()` (public/app.js ~9855–9921) implements Task 6 (progress/building-state UI) and shipped in commit `63d13f5` ("Build secondary verification scaffolds"). The documentation gap is now backfilled in `notes/progress-ui.md`, including replaced placeholders, unlock thresholds, and the locked-state copy-pass status.
