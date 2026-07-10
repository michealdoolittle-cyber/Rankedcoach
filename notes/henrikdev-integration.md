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

## Not yet done

Step C (build the formula layer: KAST composite, rank/role/weapon-relative percentile benchmarks, `roundCeremony`-based leverage weighting, a data model shaped to mirror Riot's schema so RSO can swap in later) and Step D (scope manual entry down to the qualitative-only fields) are both unstarted. Given the size of what's already queued for Codex (mobile bug fixes, premium theme expansion, QoL batch), this needs an explicit prioritization call before it gets spec'd in the same level of detail as the rest — this is a bigger, higher-stakes engineering project than any single item currently in the queue, not a quick addition.
