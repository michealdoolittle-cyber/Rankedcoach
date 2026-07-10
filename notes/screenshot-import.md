# Screenshot Import

**Status (2026-07-10): SUPERSEDED AND REMOVED.** HenrikDev Riot-ID match sync replaces this workaround. The Tracker.gg link, URL storage, screenshot-import UI, OCR parser/state, Tesseract loader, and reachable app handlers have been removed; only the dormant canonical `fromTrackerOcrMatch()` adapter remains as required by `notes/henrikdev-integration.md`.

**Status (2026-07-09), for history only:** Structural fixes are shipped in the current local build: anchored KDA parsing, score-based result inference, agent icon picker, map select, safe non-match failures, warning-text wrapping, and the Logging-page entry point move. A rerun against Michael's original real screenshots is still pending because those source images are not in this workspace. This work is now moot given the 2026-07-10 status above, but left in the file as a record of what was built.

## 2026-07-09 — first real-screenshot test result (the deferred "next review step" from 07-05, finally done)

Michael uploaded two real screenshots together: a Tracker.gg match-history list (7 matches across two date groups) and a separate aggregate "Competitive Overview" profile-stats screenshot. Root-caused against the actual parser in `public/app.js` (`parseTrackerOcrText`, `~10672-10718`), not just the review-screen symptoms. Three real bugs found, all with a known mechanism — not "OCR is flaky," specific fixable defects:

1. **Duplicate records from the same match row.** `parseTrackerOcrText` loops `lines.forEach` and opens a fresh 3-line lookahead window (`line[i], line[i+1], line[i+2]`) starting at **every single line**, with no advance-past-a-match / dedupe step after a successful push (`app.js:10686-10714`). If one match's OCR text spans multiple lines (it does — map name, placement, score, KDA line, stats are all separate lines per row), two or three different starting lines can each independently see the same KDA/map text in their window and each push a full separate record. This is almost certainly why the review screen showed a second, duplicate "Corrode" entry — not two different matches, the same row parsed twice. **Fix:** after a successful match push, skip the loop index forward past the lines that were consumed by that match (or dedupe records by identical `map + kdaText` occurring within a few lines of each other) before rendering the review list.

2. **Agent is structurally unreadable by text OCR — this isn't a tuning problem.** `findFirstKnownToken()` (`app.js:10661-10664`) does substring matching against known agent names in the raw OCR'd text. But Tracker.gg's match-list row (confirmed against the real screenshot) renders the agent as a **portrait icon only** — the agent's name is never printed as text anywhere in that row. No amount of OCR tuning fixes this; the text isn't there to read. **Fix:** stop trying to OCR agent from this screenshot type. Turn the Agent field on the review screen (`app.js:10771`, currently a bare text `<input>`) into an icon picker reusing the same gallery pattern as `renderAvatarGallery()` (`app.js:41175`) so the player picks the agent visually in ~1 tap instead of typing/fixing a field that will be blank essentially 100% of the time.

3. **Result is structurally unreadable the same way.** The result regex (`app.js:10690`) searches for the literal words "victory/won/win" or "defeat/lost/loss" — but Tracker.gg conveys win/loss via a colored left-edge bar and by which score number is larger ("11 : 13" vs "13 : 10"), never through a text word. Same root problem as #2: the parser is looking for text that was never rendered. **Fix, two options, pick based on effort:** (a) simplest — stop attempting automatic result detection from this screenshot type entirely and rely on the existing Result `<select>` (`app.js:10773`) for manual confirm, since a wrong auto-guess is worse than an honest blank; or (b) better if there's time — parse the round-score pair (`\d{1,2}\s*:\s*\d{1,2}` pattern, same idea as `parseKdaText`) and infer win/loss from which number is larger, which is a real signal actually present in the image, unlike the win/loss words.

4. **Non-match screenshots silently get fed through the same per-match parser with no type check.** The aggregate overview image has no per-match fields (no map/agent/KDA-shaped text), so it likely produced zero records rather than garbage — but nothing in `processHistoryImportFiles`/`parseTrackerOcrText` actually validates that an uploaded image is a match-history-list screenshot before running full OCR on it. **Fix:** at minimum, verify this doesn't crash or silently produce a garbage record when the case isn't a clean zero-match result (test this specific overview screenshot deliberately); ideally, add a cheap heuristic (e.g. "did we find at least one KDA-shaped line at all in this image") to route non-match screenshots to the failures list with a clear "this doesn't look like a match history screenshot" message instead of silent no-op, so the player understands why that upload didn't produce anything.

5. **Review-screen warning text gets cut off, not wrapped, on mobile.** `.history-import-warning` (`app.css:50936`) has no `white-space`/`overflow` override, so it should wrap by default — but the screenshot clearly shows "Result not confidently read. Agent not confidently" truncated mid-sentence with no wrap. This matches the exact pattern Codex already found and fixed for the Insights action-card title in commit `1a0c45c` (`#page-insights .insight-priority-title` needed an explicit `white-space:normal !important; overflow:visible !important; text-overflow:clip !important` override to beat a broader, earlier truncation rule). **Fix:** apply the same override pattern to `.history-import-warning` (and check its siblings `.history-import-record label` for the same defect while in this file region — this codebase has a recurring habit of a generic "prevent overflow" rule clipping text that should legitimately wrap).

**What actually worked:** map name and K/D/A extraction were both correct for the Corrode row (matched the real screenshot's `15/18/11` and map exactly) once a valid window was found — the core numeric-extraction approach is sound, the failures are specifically agent/result (structurally unreadable as text) and the duplicate-window bug (fixable), not the OCR engine itself being unreliable.

**Also fix while touching this modal:** confirm this test happened over the *mobile* review screen — re-run the same two-screenshot test after the fixes above and record the new results back in this file, same as this entry, before calling screenshot import shipping-ready.

---

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
