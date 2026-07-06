# Unified Match Schema

## 2026-07-05 22:35 -04:00

### Added files
- `schema/matchRecord.ts` defines the canonical typed Match Record contract for review and future module work.
- `public/schema/match-record.js` exposes `window.RankedCoachMatchRecord` for the current no-build browser app.

### Canonical fields covered
- Identity/source: `id`, `source`, `schemaVersion`, `legacyMatchId`, `manualLogId`.
- Time/scope: `createdAt`, `playedAt`, `season`, `act`, `matchNumber`.
- Match context: `agent`, `role`, `map`, `result`.
- Stats: `kills`, `deaths`, `assists`, `acs`, `adr`, `hsPercent`, `kdaText`, `scoreText`.
- Rounds/rank: `rounds.won`, `rounds.lost`, `rank.rank`, `rank.rr`, `rank.rrDelta`, peak rank/RR fields.
- Reflection/logging: `focus`, `mood`, `rating`, `teamComms`, `selfComms`, `notes`, `warmup`.
- Import safety: per-field confidence, pending verification, screenshot import metadata, parse warnings, raw OCR text.

### Source adapters included
- `fromManualLogEntry(entry)` maps the existing manual logging form into the canonical shape.
- `fromTrackerOcrMatch(match, context)` maps OCR-confirmed screenshot records into the same shape.
- `fromRiotMatch(match, context)` provides the flag-off Riot sync pathway shape.
- `fromLegacyMatch(match)` and `toLegacyMatch(record)` bridge the existing app model so this can be adopted without a full rewrite.

### Boundaries
- This schema does not fetch Tracker.gg or Riot data.
- The screenshot adapter is image/OCR-result only and keeps low-confidence fields blank for confirmation.
- The Riot adapter is scaffold-only until the feature flag is enabled.
