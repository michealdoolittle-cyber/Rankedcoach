# Progress / Coach Readiness UI

## Task 6 Status

Task 6 is implemented in `public/app.js` through `COACH_READINESS_UNLOCKS`, `getCoachReadinessModel()`, `getReadinessLockedMarkup()`, and `renderCoachReadinessUI()`.

## What It Replaced

- Replaced loose `Build sample` / `No Data` placeholders with a visible profile-building state.
- Replaced unclear locked sections in high-value coaching surfaces with progress-based locked cards.
- Moved the readiness summary into the nav-right `Profile Rating` widget so the home layout does not carry another large confidence panel.
- Uses the same match count source as imported/manual match history through `getCanonicalMatchRecordCount()`.

## Unlock Thresholds

| Unlock key | Label | Required matches | Purpose |
| --- | --- | ---: | --- |
| `match-impact` | Post-match impact | 1 | Allows immediate match impact feedback after the first saved/imported match. |
| `recent-trends` | Recent trends | 5 | Unlocks short trend reads once the app has enough recent games to avoid one-game overreaction. |
| `stats-confidence` | Stats confidence | 10 | Gives the stats page enough volume for more stable category confidence. |
| `deep-insights` | Deep insights | 20 | Unlocks broader insight reads where role/map/behavior patterns need more history. |

## Locked-State Copy

Current locked copy:

- `X/Y games logged for [unlock label].`
- `X/Y games logged. Add N more to unlock this read.`

This copy is clear and player-facing, but it was not included in the original ~25-string copy audit. It should be included in the next language pass so the locked-state wording can match the same coach voice as match trends and insight cards.

## Verification Notes

- `renderCoachReadinessUI()` updates both the nav-right `Profile Rating` widget and the old readiness card if present.
- `getReadinessLockedMarkup()` is currently used for Recent Match Trends and Data Reads locked states.
- The UI is progress-only. It does not add payment logic, Riot API permissions, or premium gating.
