# HenrikDev API Bridge — Data Integration for Coaching Engine

**Status (2026-07-10):** Step B from the handoff doc (`RankedCoach_HenrikDev_Handoff_Guide.pdf`) is complete and **positive**. Real API test confirms the free Basic key's Raw endpoint carries everything needed — no fallback to a direct Riot-internal-endpoint client required. Step C (build the formula layer) is unblocked and ready to spec whenever this gets prioritized against the rest of the current queue.

## Background — why this exists

Manual-entry coaching insight was inaccurate regardless of match volume — not a volume problem, a data/formula problem: flat thresholds instead of rank/role/weapon-relative benchmarks, invented formulas instead of an established composite (KAST), and match-level aggregates instead of round-level data (economy, trade timing, leverage). Official Riot RSO is backlogged 0-6 months with no paid expedite. HenrikDev's free, community-maintained unofficial API is the interim bridge — real match data without waiting on RSO. Manual entry's scope shrinks to the qualitative layer only (mood, tilt, comms, "why") once this is live; it stops trying to substitute for objective stats. Full plan in the handoff doc; this file tracks the actual integration work against it.

**Key management:** `HENRIKDEV_API_KEY` lives in `.dev.vars` (gitignored, confirmed via `git check-ignore`) for local dev — never commit it. Production will need it set via `wrangler secret put HENRIKDEV_API_KEY` when this ships to the live Worker.

## Step B result — Raw endpoint test (2026-07-10)

Tested against a real match from Michael's own account (`GoopyWetDiaper#Goopy`, NA), a genuine 22-round Competitive match (`matchid: 145aceda-cda0-47ce-a177-0eae09a9fd06` — had to skip several Team Deathmatch matches first since TDM has no rounds/economy/buy-phase structure and wouldn't have tested anything meaningful).

`POST /valorant/v1/raw` with `{"type":"matchdetails","value":"<matchid>","region":"na"}` returned HTTP 200, ~564KB payload. Confirmed present, with real (not placeholder) data:

- **`roundResults[].playerEconomies`** — present on all 22 rounds. Shape: `{subject, loadoutValue, weapon, armor, remaining, spent}` per player per round, exactly as the handoff doc predicted. (Also duplicated at `roundResults[].playerStats[].economy` — same shape, redundant location, pick whichever's more convenient when building the formula layer.)
- **Kill `roundTime`** — present on every kill event (`roundResults[].playerStats[].kills[].roundTime`, milliseconds since round start — e.g. `49784`). Real trade-window detection (kill within N seconds of a teammate's death) is buildable from this.
- **`roundResults[].roundCeremony`** — present and **genuinely populated, not a static default**: across this match's 22 rounds, values included `CeremonyCloser` (×3), `CeremonyFlawless` (×1), rest `CeremonyDefault`. Automatic leverage/moment tagging works as described — no manual tagging UI needed.
- **`behaviorFactors`** — present, but at a different location than the handoff doc guessed: it's per-player at match level (`data.players[N].behaviorFactors`), not nested under round data. Confirmed fields: `afkRounds`, `damageParticipationOutgoing`, `friendlyFireIncoming`, `friendlyFireOutgoing`, `stayedInSpawnRounds`, plus three not mentioned in the handoff doc — `collisions`, `commsRatingRecovery`, `mouseMovement`, `selfDamage`. All real discipline/game-sense proxy data, more than the doc anticipated.

**Conclusion: build directly against this schema. Skip the fallback plan entirely** (the doc's Section 4B fallback — a thin client against Riot's internal endpoint using the same bot-account auth pattern Henrik uses — carried more engineering lift and the same ToS risk profile; not needed since Raw came back positive).

## Formula review (2026-07-10) — what's already correct, what's missing

Checked the live insight logic before writing the directive below, not assuming the handoff doc's example bug still exists. **It doesn't** — grepped for flat HS%/ACS threshold comparisons in `app.js`, zero matches. Current insight generation (`app.js:5442+`, e.g. "Core Agent Strength," "Map Preparation Gap") is **self-relative** (your best map vs. your worst map) — reasonable, but not the same as **population-relative** (your HS% vs. other players at your rank), which is what's actually missing.

`overview.attackKAST`/`defenseKAST`/`econ` fields already exist in `buildPlayerModel()` (`app.js:5318-5320`) but are empty pass-throughs — populated only when an import source happens to hand over pre-computed values. **No KAST formula exists anywhere in the codebase.** Confirms the handoff doc's "formula issue" exactly.

## KAST formula — validated against a real match, not theoretical

Computed by hand against Michael's real match (`GoopyWetDiaper#Goopy`, matchid `145aceda-cda0-47ce-a177-0eae09a9fd06`, 22 rounds) using the Raw endpoint's actual field names. **Result: 77% KAST (17/22 rounds)** — 13 kills, 12 deaths, 6 assists, and critically, **3 of those 17 rounds were only counted because of trade-window detection**, proving the trade logic does real work, not just pads the number. For reference, general KAST guidance puts 65%+ as "good" and 75-85% as "star player" range — 77% on a real match is a plausible, sane result, which cross-validates the formula is computing something real.

**One structural finding that must be handled: player names come back blank in the Raw schema** (confirmed — all 10 players in the test match had empty `gameName`/`tagLine`). Matching "which player is the user" must be done by **`puuid`** (get it once via the account-lookup endpoint, store it on the profile), never by name string matching.

**Exact algorithm** (per player, per round, from `roundResults[]`):
```
allKillsThisRound = round.playerStats.flatMap(ps => ps.kills || [])
gotKill    = allKillsThisRound.some(k => k.killer === myPuuid)
gotAssist  = allKillsThisRound.some(k => (k.assistants || []).includes(myPuuid))
myDeath    = allKillsThisRound.find(k => k.victim === myPuuid)
survived   = !myDeath
traded     = myDeath && allKillsThisRound.some(k =>
               teammatePuuids.has(k.killer) &&
               k.victim === myDeath.killer &&
               (k.roundTime - myDeath.roundTime) >= 0 &&
               (k.roundTime - myDeath.roundTime) <= 5000   // 5s trade window, standard KAST convention
             )
roundCounts = gotKill || gotAssist || survived || traded
```
`KAST% = (rounds where roundCounts true) / (total rounds) * 100`. This is a straight port of the script already run and validated — don't redesign it, implement it as-is.

## Rank-relative benchmark table — seeded with real sourced data, not invented numbers

Researched current (July 2026) community benchmark data since Henrik cannot supply population-wide percentile distributions itself (it gives per-match data, not aggregate stats across the playerbase) — a benchmark table needs an external reference source. Found real numbers via UpForge (171 tracked players, as of 2026-07-10):

| Tier | Headshot % | ACS | K/D |
|------|-----------|-----|-----|
| Iron | 10.5% | 205 | 0.89 |
| Bronze | 18% | 206 | 0.96 |
| Silver | 20.7% | 202 | 0.95 |
| Gold | 22.7% | 213 | 1.03 |
| Platinum | 25.1% | 224 | 1.04 |
| Diamond | 27.4% | 212 | 1.03 |
| Ascendant | 24.5% | 213 | 1.01 |

**Honest gaps in this source, don't paper over them:** no Immortal/Radiant rows (source didn't have the data), no role or weapon breakdown, no KAST-by-rank numbers, and 171 players is a small sample — directionally useful, not authoritative. Ship this as a real but clearly-labeled-as-provisional starting reference table (a plain object/JSON keyed by rank tier, easy to update later), and use the general KAST guidance (65%+ good, 75-85% star) as the KAST baseline until better rank-segmented KAST data is found. For Immortal/Radiant, either interpolate conservatively from Ascendant or omit the comparison and fall back to self-relative framing for those tiers specifically — don't fabricate numbers for tiers with no source data.

Sources: [UpForge Valorant Stats](https://upforge.gg/valorant/stats), [What Is KAST In VALORANT?](https://www.esports.net/wiki/guides/what-is-kast-valorant/)

---

## Full build directive

### 1. Blocking dependency — fix the Worker routing gap FIRST

**This was already flagged in this file's earlier status update as a "pre-launch blocker, not urgent yet" — it's urgent now.** `wrangler.toml` has only `[assets]`, no `main` entry script. `functions/api/**` (including the pre-existing `riot/health.js`/`riot/import-matches.js` stubs) is a Cloudflare **Pages Functions** convention that a Worker-only deploy doesn't auto-wire. **The server-side Henrik proxy this whole plan depends on (step 2 below) cannot work until this is fixed** — there's currently no mechanism for any server-side code to run at all in production. Give the Worker a real `main` entry script with actual request routing for `/api/*` paths before anything else in this directive. Confirm live (a real deployed request to any `/api/*` path returning something other than a static-asset 404) before proceeding to step 2 — don't assume it's fixed just because the code compiles.

### 2. Server-side Henrik proxy — the API key must never reach the client

`HENRIKDEV_API_KEY` currently lives in `.dev.vars` (local only). **It must never be sent to or called from `public/app.js` directly** — that's client-side code, fully visible to anyone via browser devtools, and would leak the key to every visitor immediately. Build a server-side route (wherever step 1's real routing lands, e.g. `/api/henrik/account`, `/api/henrik/matches`, `/api/henrik/raw`) that holds the key as a Worker secret (`wrangler secret put HENRIKDEV_API_KEY` for production) and proxies the actual HenrikDev calls. The client calls RankedCoach's own `/api/henrik/*` routes, never `api.henrikdev.xyz` directly.

### 3. Extend the canonical match schema for round-level data

`public/schema/match-record.js` currently only carries aggregate `rounds.won`/`rounds.lost` (confirmed, `~line 323-336`) — no round-by-round breakdown exists anywhere in `RankedCoachMatchRecord`. KAST, economy, and trade-window formulas all need per-round data. Add a new field (e.g. `roundByRound: []`, array of `{roundNum, playerEconomy, kills: [...], roundCeremony}` per round scoped to the tracked player and their team) to the schema, populated by a new `fromHenrikRawMatch(rawMatchDetails, context)` adapter alongside the existing `fromRiotMatch()` (`public/schema/match-record.js` — since Henrik's Raw payload IS Riot's native schema, this adapter can very likely share most of its logic with `fromRiotMatch()` rather than being a fully separate implementation — check before duplicating).

### 4. Repurpose the riotSync scaffold — don't rebuild it

`integrations/riotSync/index.js` and `public/integrations/riot-sync.js` already have the right shape: `mapRiotMatch()`/`mapRiotMatchToCanonicalRecord()` already call `RankedCoachMatchRecord.fromRiotMatch()`, which is correct since Henrik's Raw schema matches Riot's native shape (use the new `fromHenrikRawMatch()` from step 3 here instead, once it exists). `pullMatches()`/`pullRiotMatches()` currently just return a disabled stub — replace with a real implementation that calls the new server-side `/api/henrik/*` routes from step 2. **Leave `createRsoAuthorizationUrl()` untouched** — that's RSO-specific OAuth, not applicable to Henrik (no auth flow needed, just Riot ID + API key), and it should keep working unmodified for whenever official RSO actually lands.

### 5. Build the KAST + benchmark formula layer

Implement the exact validated algorithm from above, consuming the new `roundByRound` schema field from step 3. Feed the output into `buildPlayerModel()`'s existing `overview.attackKAST`/`defenseKAST` fields (`app.js:5318-5320` — finally give them real data instead of an empty pass-through) split by attack/defense side per round (`roundResults[].playerStats[]` — check for a side/team-role indicator per round, Riot's schema tracks attacker/defender per round). Add the benchmark table as a new reference data module, and extend the existing insight-generation logic (`app.js:5442+`) with population-relative comparisons alongside the self-relative ones already there — don't replace the self-relative insights, they're still valid, just add the new comparison type.

### 6. Worked example for testing — use the real match already validated

Use `matchid: 145aceda-cda0-47ce-a177-0eae09a9fd06` (Michael's own match, puuid `fdc507ce-cd41-5236-8962-fce4ac427e12`) as the first real test case. Expected KAST: **77% (17/22 rounds)**. If the implementation doesn't produce this number against this exact match, the implementation has a bug — this isn't a "close enough" check, it's an exact validation target computed by hand from the same real data.

---

## Removal — Tracker.gg screenshot/OCR import is now obsolete

Now that real match data can be pulled live from just a Riot ID, the manual screenshot-OCR import path (`notes/screenshot-import.md`) is no longer needed — it was always a workaround for not having API access, and that's no longer true. Remove it, don't keep maintaining it alongside the new real sync.

**UI to remove** (`public/index.html`):
- `#importHistoryOpenBtn` (`~line 1835`, Logging page entry point)
- `#historyImportModal` and its entire 4-step guided flow (`~line 2067+`)
- `#profileTrackerLink` ("View Tracker.gg Profile" outbound link, `~line 916`)
- `#saveTrackerProfileUrlBtn` + the Tracker.gg URL input field (`~line 1837-1840`)
- The "Open your Tracker.gg profile" outbound-link step inside the import modal (`~line 2091-2093`)

**Code to remove** (`public/app.js`):
- `parseTrackerOcrText()` (`11881`), `processHistoryImportFiles()` (`11946`), `confirmHistoryImportRecords()` (`12054`), `closeHistoryImportModal()` (`11748`)
- Tesseract.js dynamic-load code (search for `Tesseract` — the OCR library loader tied to the import flow)
- `historyImportState` and any other state purely feeding this flow

**Don't remove:** the underlying `RankedCoachMatchRecord.fromTrackerOcrMatch()` adapter and canonical schema plumbing — no harm leaving unused adapter code in the schema file, and ripping it out isn't worth the risk of breaking something else that touches the same file during this pass. Just remove the UI and the OCR-specific parsing/state code that's actually reachable by users.

**Notes files to update, don't leave stale:**
- `notes/screenshot-import.md` — add a status line marking the whole feature superseded/removed as of this pass, pointing back to this file for why.
- `notes/execution-plan-2026-07-09.md` — Phase 3 (screenshot import structural fixes) is now moot. Mark it retired rather than leaving it as an active phase Codex might still pick up — the dedupe/agent-picker/result-detection fixes speced there no longer matter if the feature's being removed.
- `notes/mobile-nav-redesign.md` §9 — the Import History / Tracker.gg relocation work it describes as shipped is about to be deleted again; add a note there so it doesn't read as contradictory history.

## Not yet done

Everything in "Full build directive" above. This is a genuinely large, multi-part build (Worker routing fix, server-side proxy, schema extension, formula layer, UI removal) — bigger than any single item in the existing UI/bug-fix queue. Sequence it as its own track rather than folding into the existing execution plan's phase numbering.
