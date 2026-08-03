# RankedCoach data-integrity fixtures

This fixture set backs `testing/visual-audit/data-integrity-matrix.test.js`.
Each fixture intentionally exercises one historical data-integrity bug class and
documents the expected player-facing value.

| Fixture | Edge case | Correct expectation |
| --- | --- | --- |
| `baseline-competitive` | Complete competitive Henrik-style match | Counts as one ranked match, HS shows `25%`, match report ACS shows `244`. |
| `placement-competitive-no-rr` | Competitive placement match with no visible RR | Counts in ranked stats and chart position remains RR-unavailable/flat instead of being dropped. |
| `noncompetitive-exclusion` | Explicit `unrated` match beside a competitive control | Unrated match is excluded from ranked season stats; Duelist role stays `--`. |
| `missing-headshot-data` | No shot-location/headshot data | HS displays `--`, never `0%`. |
| `true-zero-headshot` | Real, verified `0%` HS | HS displays `0%`, never `--`. |
| `unmapped-weapon-uuid` | Kill with unknown weapon UUID | Weapon surface uses a friendly fallback like `Weapon deadbeef`; the full bare UUID must never appear. |
| `demo-fixture-suppression` | Tutorial/demo fixture beside real Henrik data | Demo fixture never contaminates real-account ranked stats. |
| `stale-pre-migration-raw-rederive` | Old normalized record missing HS/queue but retaining raw Henrik payload | Stored raw payload re-derives HS as `33%` and queue as `competitive`; ranked stats include it correctly. |

The suite prints a fixture × surface matrix so failures point to the exact
surface and fact that drifted.
