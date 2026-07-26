# Situational Coaching Call-Outs — Agent+Map Tips and Round-Level Diagnosis (2026-07-20)

**Status:** Shipped 2026-07-26. Agent-map publications, new-match raw round hydration with retry/fallback, the three scoped round detectors, exact-match low-impact research callouts, and shared Agent/Map dossier rendering are implemented. The private/public boundary, the Approve-then-Publish gate, original-wording enforcement, and the `CONTENT_AUTOMATION` KV layout remain unchanged.

**The product goal, from Michael directly:** two gaps exist beyond what Stats+Insight (trends) and the Library dossier (general baseline reference) already cover. First, there's no tip content tied to a specific agent+map combination — his test case, Phoenix on Summit, currently returns nothing: Phoenix is template-generated with an empty `maps: []` field, and Summit doesn't exist in the app in any form. Second, there's no "human coach" layer — something that looks at a specific match and calls out a real judgment-level issue (risk vs. reward, isolated fights, decision-making) the way a coach reviewing a VOD would, not just a stat trend.

---

## Part A — Knowledge pipeline: support a real agent+map joint key

`publishApprovedKnowledge` (`worker/knowledge-pipeline.mjs:2676-2740`) currently enforces exactly one `category` (`general`/`map`/`agent`/`weapon`) resolved to one `entity` via `canonicalPublicationEntity()` (`:138-147`) — it cannot represent "map: Summit AND agent: Phoenix" as a single filterable, queryable item. The unused `entities` array (carried through at `:2711` and `getPublishedKnowledge`, `:2777`) is free-text and not used as a filter key anywhere.

**Fix:** add a `category: "agent-map"` option whose `entity` is a canonical `"Agent · Map"` pair (validate both halves against the existing `AGENT_ENTITY_NAMES`/`MAP_ENTITY_NAMES` lookups already used by `canonicalPublicationEntity`). This is additive to the existing enum, not a replacement — `general`/`map`/`agent`/`weapon` publications keep working exactly as they do today. Update the Research tab's Publish step (`docs/knowledge-pipeline.md` section "Owner workflow in the app") so the owner can pick an agent+map pair as the target when that's what a proposal is actually about, alongside the existing single-target options.

---

## Part B — Wire the existing round-by-round ingestion into the default sync path

**Confirmed: this data already exists in the schema, it's just not being populated.** `public/schema/match-record.js` (`fromHenrikRawMatch`/`fromHenrikV4Match`, `:437-696`) already parses `roundByRound[]` per round — `side`, `won`, `roundResult`, `bombPlanter`/`bombDefuser`, `playerEconomy` (loadout value, weapon, armor, spent/remaining), `utilityCasts` (counts only, no timing — confirmed dead end, see caveat below), `damageDealt`, and a `kills[]` array with `killer`/`victim`/`assistants[]`/`roundTime` (`:547-553`, `:78-85`). `public/analytics/round-metrics.js` already derives KAST, trade kills/deaths (5s window), first blood/death, multi-kills, and clutch detection (1vX, ≥2 opponents alive, `:196-223`) from this — genuinely solid, already-built analysis, just starved of input.

**The gap:** the default sync (`functions/api/henrik/matches.js` → Henrik's `v4/by-puuid/matches`) only pulls aggregate box-score stats. The raw-match endpoint that actually returns round-by-round data (`functions/_lib/henrik.js:119-130,154-163`, exposed at `functions/api/henrik/raw.js`) exists but isn't part of the normal import flow.

**Fix:** wire the raw-match fetch into the default sync path (confirm Henrik's rate limits for the raw endpoint before doing this for every match — check `notes/riot-sync-rate-limit-2026-07-13.md` for the existing rate-limit handling pattern and extend it rather than re-solving it) so `roundByRound[]` is populated on new matches going forward. Backfilling historical matches is a separate, lower-priority pass — don't block this directive on it.

**Honest ceiling, do not build around this being possible:** there is no position/coordinate data anywhere in this schema, and Riot's public API doesn't expose it to third parties. `round-metrics.js:137` already marks utility timing as `"timing-unavailable"` for the same reason. Nothing in this directive should claim to detect map positioning, off-angles, or rotation timing — that's a real ceiling, not a gap to engineer around.

---

## Part C — Detectors: real, honest patterns from round data (no fabrication)

Build a small, specific set of detectors off `roundByRound[]`/`round-metrics.js` output — each one a concrete, verifiable pattern, not a vibe:

1. **Untraded death** — a death with no ally kill within the existing trade window (already computed) on the same round. This is the closest honest proxy to "isolated fight" without positional data.
2. **Economy-mismatched engagement** — a fight entered while significantly under-equipped relative to the opponent's known buy (both sides' `playerEconomy` already parsed).
3. **Early entry before utility commitment** — a death within the first ~10s of a round before any teammate utility cast is logged for that round (utility *counts* exist per round even without timing — this uses round-level sequencing, not intra-round timing, so it stays inside the data that's actually available).

Each detector should produce a small structured flag (agent, map, round, pattern type, timestamp reference back to the match) — not player-facing text by itself. Don't invent a fourth or fifth detector beyond these three in this pass; get these solid and honestly-scoped first.

---

## Part D — Surfacing: post-match call-out + dossier, both sourced from the same approved knowledge

**Post-match:** `openImpactModal()` (`app.js:19782-19891`) already renders map, agent, and impact score together in one snapshot (`impactSnapshots[]`, `app.js:8024-8032` — map/agent/score already co-located per match). Its only current advice text, `renderImpactOpportunityPullout()`/`getImpactOpportunityAction()` (`app.js:19738-19768`), is keyed only by role-impact component and role — never map, agent, or the new detectors. Extend this: when a match's impact is low and a Part C detector fired for that match, look up a published `agent-map` knowledge item (Part A) for that exact agent+map pair and surface it as a distinct call-out card in the modal — clearly labeled as sourced research, same visual honesty pattern as the existing "RankedCoach Research" section (`gamesense-library.js:1212-1256`), not blended into the stat rows.

**Dossier:** the same published `agent-map` item renders on both that agent's and that map's Library dossier — reuse `renderPublishedKnowledge`'s existing pattern (`gamesense-library.js:1212-1256`) rather than building a second rendering path; just add `agent-map` as a category it filters on, matched against the current dossier's agent or map.

**No forced content.** If no approved item exists for a given agent+map+pattern combination (which will be true for almost every combination at launch, including Phoenix+Summit, since nothing has been researched and published for it yet), show nothing rather than inventing a generic call-out — this is the same honesty rule as the rest of the Library (`docs/GAMESENSE-LIBRARY-CONTENT-STANDARD.md`, Part B). The detectors and the content are two separate concerns: detectors can ship and start flagging patterns immediately; the actual coaching text fills in over time through the existing Research/Approve/Publish workflow, same as everything else in the knowledge pipeline.

---

## Testing checklist — don't report this batch done until:

1. Publishing an `agent-map` item works end to end through the existing owner Research tab, and it does not affect or require changes to existing `general`/`map`/`agent`/`weapon` publications — spot check one of each still works unchanged.
2. A new match synced after this ships has `roundByRound[]` populated from the raw endpoint — confirm on a real account, not a synthetic payload. Confirm Henrik rate-limit handling holds under the added raw-match calls (per the existing rate-limit note).
3. Each of the three Part C detectors fires correctly on at least one real match with a known example of that pattern, and does not fire on a clean match that shouldn't trigger it.
4. The impact modal shows a call-out card only when a real published `agent-map` item exists for that match's agent+map+pattern — confirm the "nothing published yet" case renders nothing, not a placeholder.
5. The same published item appears on both the relevant agent's and map's Library dossier pages via the existing `renderPublishedKnowledge` path.
6. Confirm the private/public boundary is unchanged: no transcript text, excerpt, or detector internals are ever exposed via `/api/content/knowledge` or any other public route — only owner-approved wording and evidence links, same as today.
7. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
8. Bump the cache key in `public/index.html` for every changed asset.
