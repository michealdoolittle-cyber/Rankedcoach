# Working Agreement — RankedCoach

Read this file first, every session, right after pulling. It's the shared contract between Michael and whichever agent is working (Claude or Codex) — the goal is that a brand-new session, on either the home or office machine, can pick up with zero lost context.

## Session start, every time, no exceptions

1. `git fetch && git status` before touching anything. Compare local `HEAD` to `origin/main` — don't assume the working copy is current.
2. Read `notes/*.md` and `docs/handoffs/*.md` for anything recent. Codex tends to implement against a directive note fast — sometimes before the note-writing session has even ended — so a note's own `**Status:**` line can go stale within minutes. Trust `git log` over a status label.
3. Check `docs/handoffs/` specifically for the latest dated handoff doc — it's the intended entry point for "what's the state of things" without re-deriving history.

## How Claude and Codex divide the work

- **Claude investigates and writes directives.** Verify claims against real data first (live Henrik/API calls, actual matches, actual current source — not assumptions or doc paraphrasing) before writing a `notes/*.md` directive. Ground every fix in exact file/line references. Separate "what's already correct" from "what's actually broken" explicitly — don't imply something's broken without checking.
- **Codex implements against the directives.** Once a note exists, treat it as live and actionable immediately.
- **Directive note format** (established pattern, keep using it): a `**Status:**` line, the problem and root cause with file/line citations, the fix, and a testing checklist at the end that names concrete pass/fail conditions.

## Data-integrity principle (already established, don't relitigate it)

Never estimate or fabricate a stat to fill a gap — RR, rank, or otherwise. If real verified data isn't available, show that honestly (an explicit "unverified"/"placement" state) rather than a silent guess or a silently-missing element. This applies to gap-filling from third-party sources too: don't pull from Tracker.gg/Blitz.gg or similar to patch holes — neither has a usable public API, scraping risks ToS violations, and we can't verify their own gap-filling methodology isn't itself an estimate. Prefer computing from data already being ingested (Henrik's round-level payloads already carry most of what would be needed) over adding a new external dependency.

## Communication preferences

- When asked to explain a plan or approach, lead with the plain-language version first — simple terms, no unexplained jargon — before any implementation detail.
- Keep responses concise. Don't pad with recap unless asked.
- Flag genuine uncertainty or unverified claims explicitly rather than smoothing over gaps.
