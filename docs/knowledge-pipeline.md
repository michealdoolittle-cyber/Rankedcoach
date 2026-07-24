# RankedCoach Knowledge Pipeline

The knowledge pipeline is a private research and review system layered on top of the existing governed Library drafts.

## What runs automatically

The `17 */6 * * *` and daily `43 9 * * *` worker schedules:

1. Registers embedded and cached Playlist YouTube/Twitch sources.
2. Acquires up to 24 available public YouTube caption sources per run.
3. Stores normalized transcripts under private `knowledge:private:*` KV keys.
4. Extracts timestamped statistical and coaching claims.
5. Compares each concept to the current governed Gamesense fields.
6. Merges repeated concepts and flags source-to-source or source-to-Library contradiction candidates.
7. Writes a transcript-free review report and owner-approval proposals.
8. Sends an ntfy summary stating explicitly that nothing was published.

Twitch media is registered, but remains `provider-required`; no transcript is invented when a public transcript is unavailable. Cosmetic showcase videos are registered for inventory completeness but excluded from coaching extraction.

YouTube's public caption metadata is attempted directly. If YouTube exposes a caption track but returns no caption body to a server-side request, the source moves to `provider-required` instead of being treated as researched. A private transcript service can be configured through `KNOWLEDGE_TRANSCRIPT_ENDPOINT` and optional `KNOWLEDGE_TRANSCRIPT_TOKEN`; it must return timestamped cues and is never called from the browser.

Owner-selected exact videos are stored separately from the public 120-card Featured Playlist. They enter the cumulative private `playlist:knowledge-sources` archive, are deduplicated by platform and upstream video ID, and are also compiled into the embedded source registry so a cache refresh cannot remove them. The private archive is capped at 5,000 sources. Curated metadata wins over a dynamic copy of the same video; current upstream metadata wins over a stale archived copy.

## Owner workflow in the app

The owner account now has an **Account & Support → Research** tab. It:

1. shows the registered Playlist research inventory and transcript status;
2. accepts VTT, SRT, or `MM:SS` timestamped transcript imports;
3. processes imported text immediately into private claims and a transcript-free review;
4. shows the selected private transcript passage, its lead-in and follow-through, the extraction rationale, evidence timestamps, and proposal relationships;
5. requires original RankedCoach wording plus an explicit originality confirmation;
6. requires a second, separate Publish action and a map, agent, weapon, or general Library target; and
7. moves published and rejected decisions out of the active queue into separate Approved and Rejected bins; and
8. can remove a published update without deleting its private research history.

The extractor selects transferable player behavior and preparation choices: setups, decisions, timing, spacing, utility sequences, positioning, practice, settings, adaptations, and punishments. Esports standings, season form, roster narratives, qualification, tournament placement, map or series scores, and general commentary about how a team is performing are rejected unless the same passage explains the repeatable action responsible for the outcome. Each proposal shows one exact selected passage plus nearby lead-in/follow-through context; independently corroborating sources appear as additional evidence cards.

Selected passages follow topic continuity instead of ending at the first sentence or ordinary speaking pause. Reviewer evidence remains bounded and private: the selected passage is capped at 120 spoken words, while lead-in and follow-through context are separately capped and stop at a genuine long pause. Suggested RankedCoach wording starts from that source passage and makes the smallest terminology, clarity, and format edits needed instead of independently restructuring the creator's point.

Normal accounts never receive the Research tab or private review API. The Worker verifies the Supabase access token and then requires an `owner`/`admin` app role or the configured `KNOWLEDGE_OWNER_EMAILS` allowlist.

Player-facing Library dossiers request only `/api/content/knowledge`. That route contains owner-approved RankedCoach wording, its Library target, and timestamped evidence URLs. It never contains transcript text, claim excerpts, source weights, formulas, or private consensus internals.

## Privacy boundary

No public route serves transcripts, excerpts, consensus internals, weights, or normalization details. Browser assets do not contain transcript data. Private records stay in the `CONTENT_AUTOMATION` KV namespace under:

- `knowledge:private:transcript:*`
- `knowledge:private:claims:*`
- `knowledge:private:consensus:*`

The transcript-free owner report is stored at `knowledge:review:latest`. Public source metadata and review proposals are stored separately from transcript text.
Registered public metadata is consolidated under `knowledge:sources:registry` so a daily run does not spend one KV operation per source merely to rebuild inventory.

## Approval boundary

`approveKnowledgeProposal()` requires:

- an existing proposal ID;
- the approving owner's identity;
- original RankedCoach wording of at least 20 characters; and
- an explicit confirmation that the wording is not copied transcript text.

Approval creates an `approved-for-manual-library-promotion` record. It does not publish. The owner must separately choose **Publish to Library**, which adds only the approved original wording and timestamped evidence to the public publication index. The underlying governed `gamesense-*.js` baseline remains unchanged.

## Full Library review

Run:

```powershell
node scripts/review-library-knowledge.mjs
```

This audits all governed agent, map, and weapon drafts for source coverage, empty coaching opportunities, exact duplicate concepts, contradiction candidates, approval state, and patch freshness. The report intentionally omits private methodology and transcript wording.

## Source registry

For a heading-based owner outline of exact YouTube links, run:

```powershell
node scripts/import-owner-research-outline.mjs <outline.txt>
```

The importer recognizes the governed map, agent, and role headings, collapses duplicate URL occurrences, preserves explicit YouTube start offsets, verifies each video's public title/channel/thumbnail through YouTube oEmbed, and regenerates `worker/curated-playlist-research.mjs`. It does not add the video's channel to the trusted-feed allowlist and does not download transcripts.

Run after embedded video references change:

```powershell
node scripts/generate-knowledge-source-registry.mjs
```

This regenerates `worker/embedded-knowledge-sources.mjs` from the current embedded public metadata. It never downloads or writes transcripts into the repository.
