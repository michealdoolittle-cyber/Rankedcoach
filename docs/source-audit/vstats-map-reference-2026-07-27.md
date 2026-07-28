# VStats Map Reference Audit — 2026-07-27

**Status:** Generated and validated by `scripts/build-vstats-map-reference.mjs`.

This internal audit accompanies `public/library/gamesense-vstats-reference.js`. It is not player-facing copy.

## Approved public sources

- VStats map agent aggregates: `https://www.vstats.gg/statistics/{act-id}/ALL/{map-code}/agent.json.gz`
- VStats map composition aggregates: `https://www.vstats.gg/statistics/{act-id}/ALL/{map-code}/comp.json.gz`
- VStats map weapon/economy aggregates: `https://www.vstats.gg/statistics/{act-id}/ALL/{map-code}/weapon.json.gz`
- VStats all-map agent aggregate: `https://www.vstats.gg/statistics/{act-id}/ALL/ALL/agent.json.gz`
- Official agent identity and role metadata: `https://valorant-api.com/v1/agents?isPlayableCharacter=true`
- Official weapon identity metadata: `https://valorant-api.com/v1/weapons?language=en-US`

## Method

- Only VStats rank buckets `r=22`, `r=25`, and `r=27` are used: Ascendant, Immortal, and Radiant.
- Agent pick share is calculated from the provider's actual agent selections divided by its actual high-rank match count. No missing number is estimated.
- Win rate is a match-count-weighted aggregate of VStats' published rank-bucket win rates.
- Map/global pick comparisons use the same retained act for that map.
- The three suggested composition layouts are the three most frequent distinct role structures. Each uses the highest-volume observed five-agent composition inside that structure; no lineup win rate is claimed.
- Weapon conversion is the VStats published round-win percentage for the shown weapon and map, weighted across the same Ascendant/Immortal/Radiant rank buckets by the provider's attack and defense round totals. A weapon suggestion requests the explicit provider economy bucket (full-buy, pistol, or second-round loss); if an older retained act genuinely lacks that bucket, the UI labels VStats' measured `unknown`/all-round aggregate instead of calling it a full-buy value.

## Retained source coverage

| Maps | Latest retained VStats act used |
| --- | --- |
| Ascent, Breeze, Haven, Lotus, Split, Summit, Sunset | V26 Act 4 / Patch 13.00 |
| Fracture, Pearl | V26 Act 3 |
| Bind | V26 Act 2 |
| Abyss, Corrode | V26 Act 1 |
| Icebox | V25 Act 4 |

The generated manifest contains a per-map source URL, act, patch/act label, match count, and rank-window metadata. It covers all 13 maps and the official roster of 29 playable agents.

Miks and Veto were not present in the retained historical act used by every out-of-rotation map. Their absent historical rows remain explicitly unavailable in the manifest; they are not converted into a fictional 0% pick rate. Current-rotation maps have their V26 Act 4 rows.

## Exclusions

No data, images, map layouts, or plant locations were scraped or copied from Tracker.gg, Blitz.gg, or similar player-profile services. Those services are not used as gap fillers.
