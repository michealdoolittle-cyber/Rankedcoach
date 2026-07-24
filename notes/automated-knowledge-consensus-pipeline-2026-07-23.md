# Automated Knowledge and Consensus Pipeline

**Status: active in production.** The private scheduled research foundation shipped in `3487172`. The owner-facing transcript import, review, approval, and explicit Library publication workflow is implemented in the follow-up release. Public YouTube retrieval remains best-effort; sources that cannot be retrieved stay held until a timestamped transcript is imported or a private provider supplies it.

## Purpose

Implement an automated research pipeline that transforms trusted educational content into structured coaching knowledge for RankedCoach.

## Core philosophy

- Publish original RankedCoach coaching guidance, never copied transcripts.
- Treat public transcripts as private research input only.
- Build coaching from consensus rather than one source's opinion.
- Keep weighting, confidence calculations, source weighting, normalization formulas, and ranking algorithms private.

## Video pipeline

1. Register embedded YouTube and Twitch videos.
2. Acquire available public transcripts, beginning with embedded YouTube videos.
3. Store transcripts privately.
4. Normalize VALORANT terminology.
5. Split transcripts into coaching sections.
6. Extract structured coaching claims.
7. Compare claims against existing Gamesense knowledge.
8. Merge duplicates.
9. Flag contradictions.
10. Queue proposals for human approval.
11. Publish only owner-approved original RankedCoach wording.
12. Preserve timestamped links to the supporting videos.

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
