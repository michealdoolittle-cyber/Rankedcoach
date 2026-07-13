# Henrik RR/MMR Data Completeness — Wrong Endpoint for Rank Tracking (2026-07-13)

**Status:** Ready to build. Independent of the Gamesense Library follow-up and the Riot sync rate-limit note from the same day — this is a data-source correctness issue in the Henrik MMR bridge (`functions/_lib/henrik.js`, `public/integrations/riot-sync.js`, `public/app.js`), not a UI issue. Safe to work after or in parallel with those batches.

**How this was found:** Michael compared RankedCoach's competitive-only stats against Tracker.gg and Blitz.gg for both his own account and older friends' accounts. Tracker/Blitz line up with each other; RankedCoach's match rows are missing RR and, on the older accounts, don't go as deep historically. This was investigated end-to-end (Henrik's own API docs, this app's actual source, and a live-match test already in the repo) rather than guessed at.

---

## 1. Root cause: RR is sourced from Henrik's "stored" cache, not its live endpoint

**Where:** `functions/_lib/henrik.js:132-142`, `getHenrikMmrHistory()`:
```js
`/valorant/v2/by-puuid/stored-mmr-history/${region}/pc/${encodeURIComponent(puuid)}?size=${size}&page=${page}`
```

This calls Henrik's **stored** MMR-history endpoint. Henrik's own documentation (`docs.henrikdev.xyz/valorant/guides/stored-matches.md`, which explicitly covers both stored matches and stored MMR under the same model) describes this data path in these terms, quoted directly:

> "Stored matches/MMR are an accumulating materialized subset of Riot's match history, not a pre-populated mirror of every match... the list may have holes compared with Riot's match history because matches may fail to fetch, storage may fail, or the match was never requested by any developer."

In plain terms: the "stored" endpoint only has an entry for a given match if *some* developer using Henrik's API had already queried that player before, at some point, causing Henrik to cache it. It is a passive, opportunistic cache with acknowledged gaps — not a live fetch from Riot. This is exactly what `notes/henrikdev-integration.md` already documented on 2026-07-10 without identifying the cause: *"Stored MMR History v2 currently returns ten snapshots for this account... missing games remain gaps and are never estimated."* Ten snapshots against 86 retained matches is not a Riot limitation — it's this endpoint's designed-in incompleteness.

Henrik separately publishes a **live** endpoint, `/valorant/v2/by-puuid/mmr-history/{affinity}/{platform}/{puuid}`, which fetches directly from Riot on every request (same live-fetch category as the `/valorant/v4/by-puuid/matches/...` endpoint this app already correctly uses for match history — that one is not the bug). The live MMR endpoint is not currently called anywhere in this codebase.

**Note on the live endpoint's shape, confirmed from Henrik's docs, but verify empirically before wiring it in:**
- Takes only path params (`affinity`, `platform`, `puuid`) — no `size`/`page` query params, unlike the stored endpoint. Its actual returned depth (likely Riot's native ~20-entry competitive-updates window) needs to be confirmed against a real puuid, not assumed.
- Each entry is tied to a `match_id`, same as the stored endpoint, so joining logic doesn't need to change shape — but the doc tooling could not confirm exact field names with certainty (no example payload was available to cross-check). Hit the endpoint against a real account first (e.g. `fdc507ce-cd41-5236-8962-fce4ac427e12`, the same puuid already used in `testing/henrik/data-reflection.test.js` and `testing/henrik/live-known-match.js`) and inspect the raw response before assuming field names like `rr`/`last_change`/`tier.id` match the stored endpoint 1:1.

---

## 2. Fix: add the live endpoint, merge with stored, prefer live

**Don't just swap one endpoint for the other** — the stored endpoint's `size=100&page=1` gives useful depth for older matches where they happen to have coverage; the live endpoint will be shallower but authoritative and gap-free for recent matches. Merge them:

1. Add a new proxy function alongside `getHenrikMmrHistory()` in `functions/_lib/henrik.js`, e.g. `getHenrikLiveMmrHistory()`, calling `/valorant/v2/by-puuid/mmr-history/${region}/pc/${puuid}` (no size/page params per the docs — confirm live whether Henrik silently ignores extra query params or rejects them).
2. Either add a new route (`functions/api/henrik/mmr-history-live.js`, mirroring the existing `functions/api/henrik/mmr-history.js` pattern) or add a mode flag to the existing route — match whichever pattern is more consistent with how `functions/api/henrik/matches.js` already branches on `mode` for match type.
3. In `pullMatches()` (`public/integrations/riot-sync.js:311-316`, the `mmrHistoryPromise`), fetch both the live and stored payloads (in parallel, same `Promise.allSettled`-style resilience the rest of this function already uses for transient failures), and merge them into one `mmrHistory` array before it's passed to `mapHenrikV4Match` at line 361-364. Merge rule: **for any `match_id` present in both, the live entry wins**; stored-only entries are kept as-is (better than nothing for older matches); nothing is ever synthesized or estimated for a match present in neither.
4. Update the test coverage: extend `testing/henrik/data-reflection.test.js` (currently validates KDA/ACS/ADR/HS%/KAST/result/map/agent/season against 3 real matches at different history offsets, but does not touch RR at all — grep for "rr" in that file confirms zero assertions on it today) to also assert `rrVerified`/`rr`/`rrDelta` against the live endpoint's real values for at least the most recent handful of matches, the same rigor already used for the other stats in that file.

**Do not touch:** the underlying "never estimate RR from win/loss" policy in `enrichLegacyMatchesWithMmr()` (`public/integrations/riot-sync.js:220-288`) and `fromHenrikV4Match()`'s `hasVerifiedRR` gate (`public/schema/match-record.js:633`) — that integrity rule is correct and should stay. This fix is about giving that gate more real data to verify against, not about loosening what counts as verified.

---

## 3. Separate, smaller UI fix: unverified RR disappears silently instead of showing a gap

**Where:** `renderLogFeed()`, `public/app.js:41937-41939`:
```js
const rrLabel = Number.isFinite(matchContext.rr)
  ? `${matchContext.rr > 0 ? "+" : ""}${Math.round(matchContext.rr)} RR`
  : "";
```
When `matchContext.rr` is `null` (unverified), `rrLabel` is an empty string and the whole RR badge (`log-result-rr`, line 41957) just doesn't render — no placeholder, nothing to distinguish "we don't have this data" from a rendering bug. This is worth fixing independently of the data-source fix above, since even with live MMR added, some gap will remain for very old matches.

**Fix:** When RR is unverified but the match itself is a real synced Henrik match (`match.source === "henrik_sync"` or equivalent), render a neutral placeholder state (e.g. a muted "RR unverified" or "—" badge) instead of omitting the element, so match rows read as complete-but-honest rather than broken. Keep the existing win/loss color-coding (`resultTone`) untouched — that's independent of RR and already confirmed correct.

---

## 4. Expectation-setting: old-account historical depth is not the same bug and may not be fully fixable

Confirmed via `notes/henrikdev-integration.md`: Henrik's live matches endpoint (the one this app already correctly uses) exhausts around 86 retained competitive matches for the one account tested, spanning about two years. That is Riot's own live match-history retention surfaced through Henrik, not a bug in this codebase. Tracker.gg and Blitz.gg show deeper history on old accounts because they've been passively recording every match for every player who's ever visited their sites, for years — a proprietary accumulated database, not a deeper Riot API call. RankedCoach has no equivalent yet because Henrik sync only shipped 2026-07-10.

This isn't something to "fix" to full parity retroactively without official Riot RSO access (already flagged elsewhere as backlogged 0-6 months). Two options worth deciding on, not both required:
- **(a)** Do nothing further here — accept the provider ceiling, and make sure the existing "oldest provider-retained date" messaging in the Stats season selector (already shipped per `notes/henrikdev-integration.md`) is prominent enough that it reads as an explained limit, not a bug.
- **(b)** Start persisting every synced match+MMR record server-side (not just client-side per profile) going forward, so RankedCoach begins building its own long-term store from today's date rather than re-querying Henrik's incomplete cache on every sync. This only helps prospectively — it does not backfill the past — and is a larger architectural change (needs its own directive if picked up).

---

## Testing checklist — don't report this batch done until:

1. Live `mmr-history` endpoint hit against a real puuid (reuse `fdc507ce-cd41-5236-8962-fce4ac427e12` or Michael's/goopy's current one) with the raw response logged and field names confirmed before wiring into the merge logic.
2. `testing/henrik/data-reflection.test.js` extended to assert RR/rrVerified/rrDelta against live data for recent matches, passing against real offsets the same way KDA/ACS/ADR/HS%/KAST already do.
3. Fresh sync on Michael's account and at least one older/friend's account shows materially more matches with a populated, non-placeholder RR badge, specifically for recent (last ~20) competitive games.
4. Matches that still lack RR (older than the live endpoint's window, with no stored-cache hit either) show the new "unverified" placeholder instead of a silently missing badge.
5. Win/loss coloring (`resultTone`) unchanged and still correct — this fix must not touch that path.
6. `node --check` passes on every touched file; run the existing Henrik/visual-audit test suites plus the full passthrough before deploying, per the standing project rule.
7. Bump the cache key in `public/index.html` for every changed asset.
