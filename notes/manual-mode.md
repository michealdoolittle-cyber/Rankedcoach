# Manual Mode Verification

## 2026-07-05 22:40 -04:00

### Current manual fields
- Result
- RR delta
- Rounds won/lost
- Agent
- Map
- Focus category
- Performance rating
- Mood rating
- Team comms
- Self comms
- Notes
- Warmup toggles
- Manual report stats: kills, deaths, assists, ACS range, ADR range, HS% range

### Kept as typed values
- Kills
- Deaths
- Assists
- RR delta
- Rounds won/lost

### Converted to ranges
- ACS is now a range selector because most players will not remember exact ACS.
- ADR is now a range selector because exact ADR is unlikely without post-match review.
- HS% is now a range selector because weapon mix can make exact values misleading.

### Schema mapping
| Manual input | MatchRecord field |
| --- | --- |
| result | `result` |
| rr | `rank.rrDelta` |
| roundsWon | `rounds.won` |
| roundsLost | `rounds.lost` |
| agent | `agent` |
| map | `map` |
| manualKills | `stats.kills` |
| manualDeaths | `stats.deaths` |
| manualAssists | `stats.assists` |
| manualACS | `stats.acs` |
| manualADR | `stats.adr` |
| manualHS | `stats.hsPercent` |
| focus/mood/rating/comms/notes/warmup | `reflection.*` |

### Code changes
- `buildManualMatchFromLogEntry()` now uses `window.RankedCoachMatchRecord.fromManualLogEntry()` and `toLegacyMatch()` when available.
- `getMatchCore()` now reads `match.matchRecord` / canonical records first, then falls back to legacy segment parsing.
- Existing consumers continue receiving the legacy match shape, with canonical `matchRecord` attached.
