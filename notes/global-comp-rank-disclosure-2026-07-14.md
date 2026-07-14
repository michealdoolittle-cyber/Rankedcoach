# Current-Season Comps — Rank-Blend Disclosure and Honest Win-Rate Framing (2026-07-14)

**Status:** Implemented and verified on 2026-07-14. The comp card now identifies its blended all-rank Competitive scope, explicitly says it is not Ascendant+ specific, and presents the three lineups as qualitative tactical references instead of unsupported exact five-agent win rates or sample counts.

**Scope:** `public/library/gamesense-maps.js` (data: `metaComp`/`metaComps` per map) and `public/library/gamesense-library.js` `renderComp()` (`~line 295-333`, the rendering). Currently only Breeze and Split have populated `metaComps` arrays; Bind's is empty (`gamesense-maps.js:85`) and already falls back to an honest "unavailable" message (`compStatus`, `gamesense-maps.js:86`) — that fallback pattern is correct and is the model to extend, not replace.

---

## 1. The sample is blended across all ranks, not high-elo-specific — say so

**Confirmed:** the composition data is sourced from "Tracker Network's rolling Competitive insights" (`docs/handoffs/SESSION-HANDOFF-2026-07-13.md:232`; per-map `compStatus` text also references this, e.g. `gamesense-maps.js:86`). Grepped the entire map dataset for any rank/elo/tier field — there is none. It is one undifferentiated Competitive sample across the whole ranked population, which in Valorant is pyramid-shaped: the large majority of games are played well below Ascendant. A composition that reads as "strongest" in that blended sample is not the same claim as "strongest at Ascendant+," where coordination, execution ceiling, and meta knowledge diverge from average play.

**Fix:** Add an explicit rank-scope disclosure to the comp card, next to (or replacing part of) the existing line at `gamesense-library.js:313`:
```js
<p class="gamesense-comp-source">Reference win rates are the strongest measured compositions among the 20 most-played combinations in the active-season ranked sample.</p>
```
Make clear this sample spans all Competitive ranks and is not elo-segmented — e.g. append something like *"This reflects the broad ranked population, not high-elo play specifically."* Keep it short and matter-of-fact, consistent with how `compStatus` already handles the Bind unavailable case (state the limitation plainly, don't hedge it into meaninglessness).

---

## 2. The win-rate/sample-count numbers aren't real measured 5-stack composition stats — the framing overstates them

**Confirmed directly from this project's own prior research**, not a new finding: `docs/handoffs/SESSION-HANDOFF-2026-07-13.md:234` states outright — *"No reliable source found publishes measured five-agent composition win rates. The UI therefore treats listed compositions as tactical references assembled from current map leaders."* In other words, figures like `winRate: 56.9` and `sample: 4639` (`gamesense-maps.js:168-170`, `256-258`) are not a real measured win rate for that exact 5-agent lineup appearing together — they're assembled from individual agent performance data and presented with a precision (a decimal win rate, a specific game count) that implies a level of empirical rigor the underlying data doesn't actually have.

**Fix:** Rework the presentation in `renderComp()` (`gamesense-library.js:311-333`) so it no longer reads as a measured composition stat:
- Either drop the specific decimal win-rate/game-count framing (`gamesense-comp-rank`/`gamesense-comp-winrate`, `~line 322`) in favor of language that matches what this actually is — e.g. a ranked ordering of strong picks ("top pick," "strong alternative") without a fabricated-precision number attached, or
- If a number stays, relabel what it actually measures (individual agent standing assembled into a lineup) rather than presenting it as a composition's own win rate.
- Update the source-line copy at `gamesense-library.js:313` accordingly — it currently says "the strongest **measured** compositions," which asserts a level of measurement that section 1's own source doc says doesn't exist.

**Don't over-correct:** the underlying agent-strength signal feeding these compositions may still be useful information — the issue is specifically the presentation implying a measured 5-stack win rate exists when it doesn't, not that the content itself is worthless. Keep whatever real signal is in the individual agent data; fix how it's framed.

---

## Testing checklist — don't report this batch done until:

1. Breeze and Split's Current-Season Comps cards show the new rank-scope disclosure, visible without needing to scroll or expand anything extra.
2. The win-rate/sample-count presentation no longer implies a measured 5-agent composition stat exists where one doesn't — verify the new copy against `docs/handoffs/SESSION-HANDOFF-2026-07-13.md:234`'s own description of what the data actually is.
3. Bind's existing "unavailable" fallback (`compStatus`) is untouched and still renders correctly — this fix extends the same honesty pattern, it doesn't replace it.
4. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
5. Bump the cache key in `public/index.html` for every changed asset.
