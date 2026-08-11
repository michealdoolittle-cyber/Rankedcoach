# Map-Aware Loadout Roll: Select a Map, Weight the Roll by That Map's Global Win Rates (2026-08-11)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.** New feature, not a bug fix — read the whole spec before starting, the design constraints (weighted not excluded, manual map selection, season-pool-filtered) are deliberate and came out of a direct discussion with Michael.

**Status: ready to build.**

## Why this exists

Some agents are extremely difficult to play well on certain maps — not unplayable, just meaningfully worse-suited than others. Michael doesn't want agents excluded from the roll pool outright (variety matters, and personal skill can still make a "bad map fit" agent viable) — he wants the roll to be *informed* by real, global (not personal) agent performance on the map actually being played, so a weak-fit agent can still come up, just less often.

## Confirmed: the data already exists, no new integration needed

- **Per-agent, per-map win rate**: `agent.mapWinRates[mapName]` — already defined in the Library's agent data and already used for display in the Agent dossier (`public/library/gamesense-library.js:3485-3495`).
- **Current season's active map pool**: `DEMO_ACT_MAP_POOLS` (`app.js:1261-1268`) — despite the misleading "DEMO_" name, this is genuinely kept current (through "Season 2026 Act 4": Ascent, Breeze, Haven, Lotus, Split, Summit, Sunset, matching the season shown elsewhere in the app) and is the right source to filter the map picker against, rather than showing every map ever in the game. Consider renaming this constant to something that reflects its real, current-truth purpose (e.g. `SEASON_ACT_MAP_POOLS`) as part of this work, since "DEMO_" is actively misleading for something load-bearing outside the demo experience.
- **Current roll mechanism**: `getLoadoutAgentPool()` (`app.js:23661-23673`) returns a flat, uniformly-weighted array of eligible agents (already filtered by role and user exclusions/one-trick preference) that the roll picks from. `spinLoadout()` (`app.js:57599+`) consumes this pool.

## What to build

1. **Map selection UI** — a button/modal on the loadout roll flow (Home page) letting the user pick a map before rolling. Populate the list from the current season's active pool (`DEMO_ACT_MAP_POOLS`, keyed by whatever the app already uses to determine "current act" elsewhere — reuse that, don't hardcode which act is current). No map selected should remain a valid, default state (uniform roll, exactly as it works today) — this is additive, not a forced flow change.
2. **Weighted roll, not filtered.** When a map is selected, `getLoadoutAgentPool()` (or a new function built alongside it, wired into `spinLoadout()`) should still return every eligible agent under the existing role/exclusion rules — do not remove any agent from the pool based on map fit. Instead, bias the *random selection* using `agent.mapWinRates[selectedMap]` as a weight — higher win rate on that map means proportionally more likely to be picked, not guaranteed, and a low win rate still means a real (just smaller) chance. Pick a reasonable weighting formula (e.g., proportional to win rate, or win rate relative to the field's average on that map) and document why it was chosen.
3. **Missing data handling.** Not every agent will have a `mapWinRates` entry for every map — for any agent missing that data point, fall back to an average/neutral weight (don't let missing data mean zero chance or crash the weighting logic).
4. **Persist the selected map for the session** the same way other loadout preferences persist, so the user doesn't have to reselect it every roll — but make it easy to change or clear (back to unweighted/no-map-selected).

## How this will be reviewed

1. Confirm the map picker only shows the current season's actual active pool, not retired/rotated-out maps.
2. Confirm every eligible agent can still be rolled after a map is selected (no exclusion), with a real, observable bias toward stronger-fit agents over repeated rolls (statistical, not per-roll-guaranteed).
3. Confirm the missing-data fallback doesn't produce zero-probability agents or crashes.
4. Confirm existing role-filter/exclusion/one-trick behavior is completely unaffected when no map is selected.
5. `node --check` on every touched file; run the full existing test suite.

## Testing checklist

1. Roll repeatedly (e.g., 200+ simulated rolls) with a map selected and confirm the observed agent distribution meaningfully favors higher-`mapWinRates` agents for that map over a large sample, without ever reaching zero for the weakest-fit agent.
2. Confirm role filter + map weighting compose correctly (selecting a role and a map together still respects both).
3. Confirm one-trick preference still overrides everything, including map weighting, exactly as it does today.
4. Confirm the map picker list updates correctly if/when the current season's pool changes (test by simulating a different act value).
