# Screenshot Import

## 2026-07-05 22:51 -04:00

### Implementation status
- Added a guided 4-step history import modal in public/index.html.
- Added a Settings/Profile dropdown entry point: Import History.
- Added reference-only Tracker.gg profile URL storage and View Tracker.gg Profile outbound profile link.
- Added client-side OCR flow in public/app.js using Tesseract.js when available.
- Added required confirmation screen before saving anything.
- Confirmed records map through window.RankedCoachMatchRecord.fromTrackerOcrMatch() and save through 	oLegacyMatch() so imported screenshot records feed the same matches array as manual entries.

### Hard safety rule
- No code fetches, scrapes, polls, or requests Tracker.gg profile URLs.
- The only Tracker.gg URL action is a user-clicked outbound link/open button.
- OCR input comes only from user-selected local image files.
- The saved profile URL is stored as text only and never used as an app data source.

### OCR spike/prototype result
- No real Tracker.gg screenshots were present in this workspace or the attached brief, so a real-image OCR accuracy score could not be produced locally.
- A browser-side OCR prototype was added using Tesseract.js as the first viable option because it can run on user-uploaded images without sending screenshots to RankedCoach servers.
- Parser targets implemented: agent, map, result, K/D/A, rank line, RR line.
- Low-confidence behavior implemented: uncertain fields remain blank/unknown and appear on the required review screen.

### Expected failure-rate logging for first preview review
- historyImportState.failures records per-image failures in the browser for the current batch.
- Fields most likely to fail first: result text, map name if cropped, K/D/A when OCR merges columns, and rank/RR if the overview card is not included.
- Next review step: upload 2-3 real Tracker.gg screenshots in the secondary Cloudflare preview and record actual extraction counts here before shipping to real users.

### Error handling
- Bad/wrong images do not crash the whole batch.
- Failed images are shown separately with an Enter manually fallback.
- Nothing writes to the profile until Confirm Import is clicked.
