# Knowledge Pipeline — Claims Are Segmented Too Narrowly to Be Useful (2026-07-24)

**Status: implemented and verified locally on 2026-07-24.** Michael's report: review proposals show a single isolated sentence pulled from the transcript, rarely enough on its own to make sense ("rarely lands"), instead of a creator's whole explanation of one coaching point. Traced to two separate causes in two separate files — one in the deterministic fallback path, one in the primary LLM-based path.

## Implementation result

- Production-path inspection found that the latest 12-source run used the primary semantic analyzer for 9 sources and deterministic fallback for 3, so both paths were corrected.
- Primary semantic evidence now requests and preserves one complete contiguous passage of up to 120 words. The prompt keeps the minimal-edit rule and the public seven-consecutive-source-word originality guard.
- Deterministic fallback now follows topic continuity across ordinary sentence endings and pauses, with a four-second hard-pause boundary plus 600-character and 120-word safety caps.
- Lead-in and follow-through now walk up to eight contiguous cues within 36 seconds, stop at a genuine long pause, and retain up to 96 words on each side.
- A privacy-safe rerun across five real production transcripts reduced 104 raw segments to 93 and selected 33 actionable claims under the final eligibility rules. No segment exceeded either safety cap, no unexplained same-topic split remained, and all three confirmed topic changes split correctly.
- The full Node test run passes 62/62, `node --check`, Deno type-checking, `git diff --check`, and local browser console verification all pass.

## Root cause 0 — the primary path already reads the whole transcript, but its output is explicitly capped at 28 words

**This is likely the more important fix — it's the primary path, not the fallback.** `supabase/functions/knowledge-analyze/index.ts` is the real semantic analyzer referenced in `docs/knowledge-pipeline.md`: it sends the **entire transcript in one request** (up to 120,000 characters, `MAX_TRANSCRIPT_CHARACTERS`) to a real LLM (`OPENAI_MODEL`, defaults to `gpt-5.5`) and asks it to extract 8-16 holistic insights with full context of the video. This part of the architecture is already sound — it's genuinely capable of the same whole-transcript understanding Michael described wanting.

The bug is one explicit instruction in the prompt itself, `index.ts:133`: *"contextExcerpt is private reviewer evidence and must contain no more than 28 consecutive transcript words."* The model has the full transcript and full understanding of it — it's being told by name to cut down what it shows the reviewer to 28 words, which is exactly why the surfaced evidence "rarely lands." This is almost certainly the dominant cause, not the deterministic fallback below, since the fallback (per `docs/knowledge-pipeline.md`) only runs when this LLM call isn't available.

**Fix:** raise the 28-word cap in the prompt instructions substantially — enough that `contextExcerpt` can hold a genuinely complete passage (the creator's full point, not a fragment of it). This still needs to stay a bounded excerpt, not an unbounded transcript dump (per the existing privacy design — transcript text stays private, never reaches players), but 28 words is far too tight to be the ceiling. Recommend a real reviewer-usability bar instead of an arbitrary word count: the excerpt should be long enough that Michael understands the point without watching the source video, the same bar already used elsewhere in this note.

## Root cause 1 — the deterministic fallback's segmentation function also flushes almost immediately

`cueAnchoredClaimSegments` (`worker/knowledge-pipeline.mjs:950-996`) builds each candidate segment by buffering consecutive transcript cues, then ends the segment (`flush()`) the moment **any** of these hit:
- a sentence-ending punctuation mark, if the buffer has already reached just **28 characters** — a bar low enough that almost any complete sentence clears it immediately;
- a hard **260-character** cap;
- a **1,750ms** (1.75 second) gap to the next cue.

Normal speech pauses between sentences constantly, well within 1.75 seconds, even when a speaker is still elaborating on the exact same point. In practice this means a segment almost never grows past a single sentence — confirmed as the direct cause of what Michael is seeing.

**Fix:** segment on topic continuity, not on sentence-end or a short pause. Concretely:
- Raise the natural-pause threshold substantially (a genuine topic change reads more like 3-4+ seconds of silence, not 1.75) — treat 1.75s as normal mid-explanation breathing room, not a boundary.
- Raise the character cap so a segment can hold a full multi-sentence explanation (several hundred characters at minimum) rather than flushing at the first opportunity past 28.
- Use the existing `classifyTopic` function (`worker/knowledge-pipeline.mjs:998`) as the real segmentation signal: keep buffering cues into the same segment as long as consecutive sentences classify to the same topic, and only flush when the topic actually changes (or the pause is genuinely long, or a sane upper bound is hit so one segment can't run unbounded).

## Root cause 2 — lead-in/follow-through context is capped far too tight to help

`surroundingTranscriptExcerpts` (`worker/knowledge-pipeline.mjs:2577-2603`) only pulls the **3 nearest cues** before and after the selected segment (within an 18-second window), then truncates the combined text to **42 words** per side. Since a caption "cue" is often just a few words, 3 of them plus a 42-word cap is a thin sliver — nowhere near enough to show the surrounding reasoning that gives a passage its actual meaning.

**Fix:** once root cause 1 is fixed and segments are already topic-coherent and appropriately sized, the lead-in/follow-through window can reasonably widen too — pull enough surrounding cues to cover a genuine sentence or two of context on each side (not just 3 short cues), and raise the 42-word truncation to something that can actually hold that. Exact numbers are Codex's judgment call, but the test is concrete: a reviewer should be able to read the lead-in, the selected passage, and the follow-through and understand what point was being made without needing to open the source video.

## Testing checklist

1. **Confirm which path is actually running in production first** — check whether `knowledge-analyze`'s LLM call is succeeding (primary path) or falling back to `cueAnchoredClaimSegments` (deterministic path) for recent real videos, so the fix effort matches where the actual traffic is.
2. Re-run the `knowledge-analyze` function against a real transcript after raising the 28-word cap; confirm `contextExcerpt` now contains a complete, coherent point, not a fragment.
3. Take 5 real videos already processed and re-run extraction with the fallback-path fix; confirm segments now span a creator's full point (multiple sentences on one topic) rather than isolated single sentences.
4. Confirm segmentation still terminates sanely — no segment should run unbounded just because a topic happens to continue for a very long stretch; keep a sane upper bound.
5. Confirm lead-in/follow-through context, read together with the selected passage, is enough on its own for Michael to understand the point without watching the source video — this is the actual bar, not a specific word count.
6. Re-check that the minimal-edit fix from `notes/knowledge-pipeline-minimal-edit-fix-2026-07-24.md` still holds once excerpts/segments are longer — a longer source passage still needs a minimal-edit suggestion, not a fresh rewrite of the now-larger text.
7. `node --check` on every touched file; run `testing/knowledge-pipeline.test.mjs` and `testing/knowledge-analysis-function.test.mjs`.
