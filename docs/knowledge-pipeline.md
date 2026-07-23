# RankedCoach Knowledge Pipeline

The knowledge pipeline is a private research and review system layered on top of the existing governed Library drafts.

## What runs automatically

The daily `43 9 * * *` worker schedule:

1. Registers embedded and cached Playlist YouTube/Twitch sources.
2. Acquires a small batch of available public YouTube captions.
3. Stores normalized transcripts under private `knowledge:private:*` KV keys.
4. Extracts timestamped statistical and coaching claims.
5. Compares each concept to the current governed Gamesense fields.
6. Merges repeated concepts and flags source-to-source or source-to-Library contradiction candidates.
7. Writes a transcript-free review report and owner-approval proposals.
8. Sends an ntfy summary stating explicitly that nothing was published.

Twitch media is registered, but remains `provider-required`; no transcript is invented when a public transcript is unavailable. Cosmetic showcase videos are registered for inventory completeness but excluded from coaching extraction.

YouTube's public caption metadata is attempted directly. If YouTube exposes a caption track but returns no caption body to a server-side request, the source moves to `provider-required` instead of being treated as researched. A private transcript service can be configured through `KNOWLEDGE_TRANSCRIPT_ENDPOINT` and optional `KNOWLEDGE_TRANSCRIPT_TOKEN`; it must return timestamped cues and is never called from the browser.

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

Approval creates an `approved-for-manual-library-promotion` record. It does not edit `gamesense-*.js`, create a promoted Library overlay, commit, deploy, or publish. Manual governed promotion remains a separate action.

## Full Library review

Run:

```powershell
node scripts/review-library-knowledge.mjs
```

This audits all governed agent, map, and weapon drafts for source coverage, empty coaching opportunities, exact duplicate concepts, contradiction candidates, approval state, and patch freshness. The report intentionally omits private methodology and transcript wording.

## Source registry

Run after embedded video references change:

```powershell
node scripts/generate-knowledge-source-registry.mjs
```

This regenerates `worker/embedded-knowledge-sources.mjs` from the current embedded public metadata. It never downloads or writes transcripts into the repository.
