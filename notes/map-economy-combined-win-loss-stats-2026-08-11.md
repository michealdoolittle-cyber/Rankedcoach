# Map Economy Stats: Combine Bonus and Full Buy Win/Loss Into One Line Each (2026-08-11)

**Recommended Codex settings: GPT-5.6 Sol · Light reasoning · Fast speed.** Small, precisely-specified formatting change to existing map economy stats. No new data sources, no new calculations — just combining two already-correct stats into one display line.

**Status: ready to build.**

## What to change

In `getMapEconomyStatItems()` (`public/app.js:11412-11446`), the Map stat detail currently shows four separate stat rows for bonus and full-buy rounds:

- "Bonus Round Win %" (`app.js:11420-11424`)
- "Bonus Round Loss %" (`app.js:11425-11429`)
- "Full Buy Round Win %" (`app.js:11435-11439`)
- "Full Buy Round Loss %" (`app.js:11440-11444`)

Combine each pair into a single stat row:

- **"Bonus Round Win/Loss %"** — value formatted as `{winPct}/{lossPct}%`, e.g. `40/60%`.
- **"Full Buy Round Win/Loss %"** — value formatted as `{winPct}/{lossPct}%`, e.g. `33/66%` (this exact label and format was given directly by Michael as the target).

Win percentage first, loss percentage second, both out of the same confirmed-round total (`summary.bonus`/`summary.fullBuy`, the existing `{ label, total, wins, losses }` buckets from `getMapEconomyRoundSummary()`, `app.js:11326+`) — these already sum correctly to the total, so no new tracking is needed, only a combined display.

**Do not touch Pistol Round Win % or Save Round Win %** (`app.js:11415-11419`, `11430-11434`) — those stay as single stats exactly as they are today. Only Bonus and Full Buy are being combined, per Michael's request.

## Implementation notes

`formatEconomyPhaseRate(bucket, field)` (`app.js:11311-11314`) currently formats one side (wins or losses) and returns `"No Data"` when the bucket has zero confirmed rounds. For the combined stat, add a helper that formats both sides at once from the same bucket, preserving the existing "No Data" behavior when `bucket.total` is 0 (don't show `0/0%` or similar for a genuinely empty bucket — keep the existing no-data messaging, just for the combined row instead of two separate ones).

The formula/tooltip text (`formatEconomyPhaseFormula`, `app.js:11316-11324`, backed by `MAP_ECONOMY_ROUND_FORMULAS.bonusWin`/`bonusLoss`/`fullBuyWin`/`fullBuyLoss` at `app.js:11178-11185`) should still explain both the win and loss math in one combined tooltip rather than dropping the loss-side explanation — reuse both existing formula strings for each pair, don't delete the loss ones.

## How this will be reviewed

1. Open the Map stat detail for a map with real bonus-round and full-buy-round history and confirm exactly one "Bonus Round Win/Loss %" row and one "Full Buy Round Win/Loss %" row appear, each showing `win%/loss%`, matching what the two separate stats used to show individually.
2. Confirm the win% and loss% shown add up sensibly against the total confirmed rounds for that phase (they don't need to sum to 100 if some rounds are unresolved/void, but should be internally consistent with the existing per-field calculation).
3. Confirm Pistol Round Win % and Save Round Win % are unchanged.
4. Confirm the "No Data" state still shows correctly for a map with no confirmed bonus or full-buy rounds.
5. `node --check` on every touched file; run the full existing test suite.
