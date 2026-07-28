# Library coverage source audit — 2026-07-27

This is an internal maintainer record; these links are not presented as player-facing coaching citations.

## Approved sources used in this pass

- [Official VALORANT agent pages](https://playvalorant.com/en-us/agents/) — exact ability-page media. `scripts/sync-official-agent-media.mjs` extracts the title-matched Riot CDN clip for each ability. Four passive effects (Jett Drift, Phoenix Heating Up, Sova Uncanny Marksman, and Viper Toxic) have no standalone Riot clip; their dossier uses a clearly flagged parent-ability showcase from the same official page rather than inventing a clip.
- [VALORANT-API playable agents](https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=en-US) — current agent labels, icons, ability identities, and portraits.
- [VALORANT-API maps](https://valorant-api.com/v1/maps?language=en-US) — official map display icons and callout coordinate transforms. `scripts/build-official-map-layouts.mjs` creates each local marked layout from that source and normalizes attack toward the top and defense toward the bottom.
- [Riot Patch Notes 13.00](https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-00/) — current competitive-pool reference used by the Library pipeline.

- [VStats public aggregate map references](https://www.vstats.gg/statistics/) - retained high-rank (Ascendant, Immortal, and Radiant) map-agent aggregates, composition structures, and published plant heat-map images. The exact endpoint, retained act, and calculation method for every map are recorded in [the companion VStats audit](vstats-map-reference-2026-07-27.md).
- [Dignitas plant-location reference](https://dignitas.gg/articles/the-best-plant-spots-for-every-map) - optional in-game reference images and named location context used by the expandable plant-location controls. These images are never converted into a RankedCoach percentage, pick rate, or heat-map statistic.

## Deliberately not claimed

Riot's own public endpoints do not publish global historical map pick/win rates, individual spike-plant distribution, or map heat-map event samples. RankedCoach therefore uses only the separately audited VStats public aggregate reference for those retained historical views; it never estimates an unavailable number. The map dossier can also provide official marked layouts, site reference markers, and clearly labeled geometry-based weapon coaching.

Tracker.gg and Blitz.gg were not scraped or copied. Their historical datasets are proprietary accumulated records, and this project does not treat them as an authorized backfill source.

## Public plant heat-map references

The Map Dossier's Heat Map layer embeds the published image directly; it does
not copy, parse, or turn the image into a RankedCoach rate. The current source
collection is V26 Act 4. When its map image was unavailable, the most recent
retained image that returned an image response was used and its exact act is
stored in `public/library/gamesense-heatmaps.js`.

| Map | Verified source act |
| --- | --- |
| Abyss | [V26 Act 1](https://www.vstats.gg/statistics/3ea2b318-423b-cf86-25da-7cbb0eefbe2d/ALL/Infinity/heatmaps/plants_ALL_Plants.webp) |
| Ascent | [V26 Act 4](https://www.vstats.gg/statistics/4f0864e2-40af-28a4-de2c-0e9e64e75f23/ALL/Ascent/heatmaps/plants_ALL_Plants.webp) |
| Bind | [V26 Act 2](https://www.vstats.gg/statistics/9d85c932-4820-c060-09c3-668636d4df1b/ALL/Duality/heatmaps/plants_ALL_Plants.webp) |
| Breeze | [V26 Act 4](https://www.vstats.gg/statistics/4f0864e2-40af-28a4-de2c-0e9e64e75f23/ALL/Foxtrot/heatmaps/plants_ALL_Plants.webp) |
| Corrode | [V26 Act 1](https://www.vstats.gg/statistics/3ea2b318-423b-cf86-25da-7cbb0eefbe2d/ALL/Rook/heatmaps/plants_ALL_Plants.webp) |
| Fracture | [V26 Act 3](https://www.vstats.gg/statistics/ce2783e8-44fc-dd48-3da3-33b5ba6c4a22/ALL/Canyon/heatmaps/plants_ALL_Plants.webp) |
| Haven | [V26 Act 4](https://www.vstats.gg/statistics/4f0864e2-40af-28a4-de2c-0e9e64e75f23/ALL/Triad/heatmaps/plants_ALL_Plants.webp) |
| Icebox | [V25 Act 4](https://www.vstats.gg/statistics/ac12e9b3-47e6-9599-8fa1-0bb473e5efc7/ALL/Port/heatmaps/plants_ALL_Plants.webp) |
| Lotus | [V26 Act 4](https://www.vstats.gg/statistics/4f0864e2-40af-28a4-de2c-0e9e64e75f23/ALL/Jam/heatmaps/plants_ALL_Plants.webp) |
| Pearl | [V26 Act 3](https://www.vstats.gg/statistics/ce2783e8-44fc-dd48-3da3-33b5ba6c4a22/ALL/Pitt/heatmaps/plants_ALL_Plants.webp) |
| Split | [V26 Act 4](https://www.vstats.gg/statistics/4f0864e2-40af-28a4-de2c-0e9e64e75f23/ALL/Bonsai/heatmaps/plants_ALL_Plants.webp) |
| Summit | [V26 Act 4](https://www.vstats.gg/statistics/4f0864e2-40af-28a4-de2c-0e9e64e75f23/ALL/Plummet/heatmaps/plants_ALL_Plants.webp) |
| Sunset | [V26 Act 4](https://www.vstats.gg/statistics/4f0864e2-40af-28a4-de2c-0e9e64e75f23/ALL/Juliett/heatmaps/plants_ALL_Plants.webp) |
