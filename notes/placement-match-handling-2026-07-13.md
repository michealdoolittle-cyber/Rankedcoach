# New-Act Placement Matches — Distinguish "No Rank Yet" From "Missing Data" (2026-07-13)

**Status:** Ready to build. Follows directly from `notes/henrik-rr-data-completeness-2026-07-13.md` (shipped 2026-07-13) — that note fixed genuine RR data gaps by merging live + stored Henrik MMR. This note covers a different, structural case that fix doesn't address: at the start of each new competitive season, Riot plays a player's first handful of Competitive matches as **placements** — no rank/RR is revealed by Riot at all until placement completes. Michael flagged that this count varies by patch/season (he recalled it being 1, 3, or 5 depending on the season) and asked that this be thought through properly rather than hardcoded.

**Why this matters and how it was found:** it connects to a bug already flagged in the original app review session (same day, different pass): *"a rank-trend chart could misleadingly read as a derank crash right at a new-act placement reset."* Investigated against the actual current code below — some of this is already handled correctly, one real gap remains.

---

## 1. Don't hardcode Riot's placement-game count — detect it per match instead

Riot's placement-match count has changed across patches (Michael's recollection of 1/3/5 is consistent with this — it is not a fixed constant to encode). **Don't build logic that counts "the first N competitive matches of a new season" and treats them as placements.** That number will drift again next patch and silently break.

Instead, Henrik's v4 match payload already carries a per-player, per-match rank (`player.tier.name`/`player.tier.id`, already parsed in `fromHenrikV4Match`, `public/schema/match-record.js:654`, `:665`). Riot's API reports **`tier.id === 0` ("Unrated")** for a Competitive-mode match when the player has not yet completed placements that season — this is the same signal already informally observed in this codebase's own history (`notes/henrikdev-integration.md:17` recorded *"two Unrated zero-value entries"* in stored MMR history without identifying them as placement games specifically).

**Verify this empirically before building anything** — the same discipline every other Henrik feature in this codebase has followed. Find or wait for a real account currently mid-placement after a season transition (check whether Michael's or a friend's account is mid-placement now, or use a throwaway/smurf account if available), pull its raw match payload via `/api/henrik/matches`, and confirm `player.tier.id` reads `0`/`"Unrated"` for those specific matches while `result` (win/loss) and full `stats`/`roundByRound` are still fully populated. If confirmed, per-match tier is the detection signal — no fixed placement count needed anywhere in this codebase, ever.

---

## 2. What's already correct today — don't rebuild this

Checked before writing this directive, not assumed:

- **Peak/current rank already excludes Unrated correctly.** `isMeaningfulRankLabel()` (`public/app.js:17085-17088`) filters out `"Unrated"`/`"Unknown"`/`"--"` labels, and both `getProfileCurrentRankSnapshot()` (`app.js:17115-17127`) and `computePeakProfileProgress()` (`app.js:43105-43110`) already apply this filter before picking a current/peak rank. A placement match will not get mistaken for the player's actual current or peak rank.
- **The lifetime rank chart already drops Unrated points cleanly, not as a crash to zero.** `buildLifetimeRankSeries()` (`app.js:16365-16370`) maps each charted entry through `getRankSnapshotAbsoluteRR()`, which returns `null` for a non-meaningful rank label, and then `.filter(Boolean)` removes those entries from the plotted series entirely. So a placement match does not appear as a vertical drop to zero RR on the chart today — that specific failure mode does not exist in the current code.

---

## 3. What's still wrong: two real gaps

### 3a. Placement matches get bucketed into the same UI state as a genuine data gap

The shipped fix in `notes/henrik-rr-data-completeness-2026-07-13.md` added an "RR unverified" placeholder (`renderLogFeed`, `public/app.js`) for any synced match lacking a verified MMR snapshot. A placement match will also lack a verified snapshot (there is no rank to verify — Riot hasn't revealed one yet), so it will show the exact same "RR unverified" badge as a match where the data genuinely failed to sync. These are different situations and should read differently to the player: one is "we're missing something," the other is "there is nothing to show yet, by design."

**Fix:** Using the per-match `tier.id === 0` signal from section 1, add a distinct third state — e.g. a neutral "Placements" or "Rank hidden" badge — separate from both the normal RR chip and the "RR unverified" gap state. Thread this through the same places `rrVerified`/`hasVerifiedRR` are currently checked (`fromHenrikV4Match`, `match-record.js:633`; `enrichLegacyMatchesWithMmr`, `riot-sync.js:220-288`; `renderLogFeed`, `app.js:41937-41939`) — add a parallel `isPlacementMatch` flag rather than overloading the existing verified/unverified boolean, so the two states can't be confused in code the way they currently are in the UI.

### 3b. The rank-trend chart has no season-boundary marker, so a real act-reset reads as an ordinary derank streak

Dropping Unrated points from the chart (section 2) avoids a crash-to-zero glitch, but creates a different, subtler problem: Riot's actual, *expected* act-start rank decay (existing players start the new act at a genuinely lower rank than where they ended the last one — this is real, intentional Riot design, not a data bug) still gets drawn as a single continuous line segment directly from the last point of the old act to the first verified point of the new act, indistinguishable from an ordinary bad losing streak within a season. There's no visual cue telling the player "this drop is the expected season reset," which is exactly the misreading the original app review flagged.

**Fix:** In the chart-building path around `buildLifetimeRankSeries()`/`renderChart()` (`app.js:16365-16378`, `:45537+`), detect season-label transitions between adjacent charted entries using the already-existing `getMatchSeasonLabel()` (`app.js:43060`) and draw a visible boundary marker (vertical divider + label, e.g. "New Season — Placements") at each transition. This doesn't require knowing how many placement games occurred — it only needs to know where one season's matches end and the next begin, which the codebase already tracks for the Stats season selector.

---

## Testing checklist — don't report this batch done until:

1. Section 1's empirical check completed against a real account's raw Henrik payload during an actual placement window, with the `tier.id === 0` hypothesis confirmed or corrected before any detection logic is built on top of it.
2. A synced account with real placement matches shows a distinct "Placements"/"Rank hidden" state, visually different from both a normal RR chip and the "RR unverified" gap state from the prior note.
3. Win/loss result and full performance stats (KDA/ACS/ADR/HS%/KAST/etc.) for placement matches are unaffected and still populated — this is purely a rank/RR display distinction, not a data-availability one.
4. The lifetime rank chart shows a clear season-boundary marker at every detected season transition, including at least one that spans a real act-reset RR drop, and that drop no longer reads as an ordinary in-season derank streak.
5. Peak/current rank calculations remain unaffected (they already handle this correctly per section 2 — regression-check only, no behavior change expected).
6. `node --check` passes on every touched file; run the existing Henrik/visual-audit test suites plus the full passthrough before deploying, per the standing project rule.
7. Bump the cache key in `public/index.html` for every changed asset.
