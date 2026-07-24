# Owner-Curated Playlist Research Archive — 2026-07-24

**Status: implemented and verified.**

## Scope

The supplied heading-based outline contained 169 YouTube URL occurrences representing 167 unique videos:

- 40 map guides across all 13 governed maps;
- 111 agent guides across all 29 governed agents;
- 16 role guides across Controller, Duelist, Initiator, Sentinel, and All Roles; and
- 26 explicit video start offsets.

Every unique ID was resolved against live public YouTube oEmbed metadata before registration. Repeated URL text on the Astra and Tejo lines was collapsed without dropping the intended video.

## Implementation

- `scripts/import-owner-research-outline.mjs` is the reusable importer and validator.
- `worker/curated-playlist-research.mjs` is the generated durable exact-video manifest.
- `worker/content-automation.mjs` keeps these sources out of the public 120-card Featured feed and merges them into the cumulative private `playlist:knowledge-sources` archive.
- `worker/embedded-knowledge-sources.mjs` contains the same sources for deterministic research registration even before a Playlist cache refresh.
- Canonical platform/video identity prevents duplicates. Precedence is owner-curated metadata, then current dynamic metadata, then stale archive metadata.
- Knowledge runs now process at most 24 queued sources per invocation. Processing writes private transcripts, claims, and proposals only; the existing owner approval and separate publish actions are unchanged.

## Verification checklist

- [x] 167 unique submitted YouTube IDs; zero missing and zero extra.
- [x] 40 Map / 111 Agent / 16 Role sources.
- [x] All 13 maps, 29 agents, and 5 role scopes represented.
- [x] All 26 explicit start offsets preserved.
- [x] Every source resolves through live YouTube oEmbed metadata.
- [x] Curated sources stay outside the public Featured Playlist.
- [x] Curated sources enter the cumulative private research archive.
- [x] All curated sources exist in the generated embedded source registry.
- [x] Pipeline tests confirm private transcript/claim writes and zero automatic publication.
