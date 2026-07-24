# Automated Knowledge and Consensus Pipeline

**Status: implementation complete; release verification pending.** The private scheduled research foundation shipped in `3487172`. The follow-up release automatically refreshes the Playlist source archive, retrieves available public YouTube captions, produces semantic transcript notes through the private analyzer, and places timestamped highlights plus editable RankedCoach wording in the owner-only review queue. The owner can save a draft, reject it, or explicitly publish it to the Library. Videos without an accessible transcript remain held for an automatic retry or manual recovery; nothing publishes automatically.

## Purpose

Implement an automated research pipeline that transforms trusted educational content into structured coaching knowledge for RankedCoach.

## Core philosophy

- Publish original RankedCoach coaching guidance, never copied transcripts.
- Treat public transcripts as private research input only.
- Build coaching from consensus rather than one source's opinion.
- Keep weighting, confidence calculations, source weighting, normalization formulas, and ranking algorithms private.

## Video pipeline

1. Register embedded YouTube and Twitch videos.
2. Acquire available public transcripts automatically, beginning with embedded YouTube videos.
3. Store transcripts privately.
4. Normalize VALORANT terminology.
5. Split transcripts into coaching sections.
6. Extract structured coaching claims with private semantic analysis, using deterministic caption rules only as a graceful fallback.
7. Compare claims against existing Gamesense knowledge.
8. Merge duplicates.
9. Flag contradictions.
10. Queue proposals for human approval.
11. Publish only owner-approved original RankedCoach wording.
12. Preserve timestamped links to the supporting videos.

The scheduled job runs after each Playlist refresh. The owner can also use **Process Playlist Now** from Account & Support > Research. The private review UI shows short highlighted transcript context, suggested original wording, and the destination selector without exposing full transcripts to players.

## Consensus

- Keep statistical consensus distinct from coaching consensus.
- Attach evidence from videos, Riot information, community discussions, professional coaching, professional play, strategy articles, and eventually RankedCoach user data.
- Identify repeated principles; never average wording.

## Complete review requirement

At the owner's request, reprocess new sources, merge duplicate concepts, detect conflicting advice, flag patch-stale content, revise confidence based on accumulated evidence, recommend stronger language where independent sources agree, identify missing coaching opportunities, and produce a review report before any publication.

## Publication rules

- Never publish automatically.
- Preserve timestamps internally.
- Never expose proprietary consensus methodology or transcript text.

## Long-term goal

Create the highest-quality self-coaching knowledge base in VALORANT using official information, educational content, community consensus, and RankedCoach's growing dataset.
