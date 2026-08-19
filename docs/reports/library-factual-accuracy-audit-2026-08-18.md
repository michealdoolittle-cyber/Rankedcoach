# Library factual-accuracy audit — 2026-08-18

**Status:** Phase 1 audit complete. No dossier prose was rewritten in this pass; items below are review flags only.

## Source used

- `notes/data/tracker-gg-aggregate-data-2026-08-18.md`
- Agent table: public Tracker.gg / UpForge screenshot capture, Competitive, All Maps, Radiant, All Regions.
- Weapon table: OP.GG weapon stats plus vstats.gg attack/defense win-rate capture.
- Map table: current competitive pool only: Breeze, Split, Ascent, Haven, Lotus, Sunset, Summit.

The source note marks this data as manual public-page capture, not API-backed. Treat it as provisional and avoid silent content rewrites.

## Scope checked

- `public/library/gamesense-maps.js`
- `public/library/gamesense-promoted.js`
- `public/library/gamesense-reference.js`

Out-of-rotation map sections were intentionally skipped for accuracy judgments: Bind, Abyss, Corrode, Fracture, Icebox, Pearl.

## Agent insight findings

### No immediate rewrite needed

The current in-pool `agentInsights` checked in `public/library/gamesense-maps.js` are mostly consistent with the captured global tier table:

- Breeze: Chamber, Jett, Neon, and Iso are all Tier A/S and the positive map language is directionally supported (`public/library/gamesense-maps.js:239-247`).
- Split: Clove, Jett, Raze, Neon, Reyna, Skye, Fade, Sage, and Cypher are all Tier S/A and the positive map language is directionally supported (`public/library/gamesense-maps.js:352-361`).

### Needs source verification before stronger wording

- `public/library/gamesense-maps.js:247` — Sova is described as working on Breeze. The same file’s Breeze role-pick table lists Sova at 17.13% (`public/library/gamesense-maps.js:238`), so the map-specific pick-rate context may support the read. The global aggregate table, though, puts Sova in Tier B with 48.6% non-mirror win rate. Keep the read only if the Breeze-specific source remains available; avoid upgrading the wording to “strong” without map-specific win-rate support.
- `public/library/gamesense-promoted.js:127-206` and `public/library/gamesense-promoted.js:810-847` contain Breach/Gekko ability/fundamental copy. These are ability explanations, not map-pick recommendations, so the Tier D global standing is not a contradiction by itself. If future UI surfaces them as “recommended picks,” they need a separate map-specific support check.
- `public/library/gamesense-promoted.js:9-110` and `public/library/gamesense-promoted.js:1598-1685` contain Astra/Omen ability/fundamental copy. Same treatment: ability explanations are fine; avoid surfacing them as strong current-meta picks without current-map backing because the aggregate table places Astra/Omen in Tier C.

## Weapon suggestion findings

### Supported by the new aggregate table

- Breeze Operator/Ghost/Judge/Spectre suggestions are directionally supported by the current map-specific conversion copy and the global weapon table (`public/library/gamesense-maps.js:185-189`).
- Split Phantom/Ghost/Judge/Spectre suggestions are directionally supported by the current map-specific conversion copy and the global weapon table (`public/library/gamesense-maps.js:298-302`).
- Low-conversion weapons in `public/library/gamesense-reference.js` are framed as situational/trap/economy tools, not broad defaults. That is consistent with the aggregate table for Bucky, Stinger, Sheriff, Classic, and Shorty (`public/library/gamesense-reference.js:320-356`).

### Needs wording review

- `public/library/gamesense-maps.js:299` — Split Operator conversion text says “Judge and Bucky start getting real value.” Judge is supported as the better shotgun option, but Bucky is one of the lowest aggregate weapons in the captured vstats table: 38.47% attack WR, 38.11% defense WR. The map-specific text also lists Bucky only as the second shotgun behind Judge. Suggested future edit: keep the close-range warning, but tone Bucky down to “emergency trap buy” unless map-specific Bucky data is intentionally being cited.

## Testing checklist

- [x] Current competitive-pool maps were checked separately from out-of-rotation maps.
- [x] Agent tier contradictions were flagged without silently rewriting dossier prose.
- [x] Weapon conversion contradictions were flagged without silently rewriting dossier prose.
- [x] Ability/fundamental copy was not treated as a pick-rate recommendation unless the UI context implies it.
- [x] Provisional/manual-capture source status is preserved.
