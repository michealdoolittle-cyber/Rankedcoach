# Port Templated Insight-Variant System to Production (Phase 1: Infrastructure + Data Audit)

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.** This isn't a known patch — it requires research (auditing 300 heuristics against production's real data shape) and design (a seed strategy, a QA harness) rather than applying a pre-diagnosed fix.

**Status:** New directive, 2026-08-28. Not started.

**IMPORTANT — this work happens in a different repo than the one this note lives in.** This note is filed in `Rankedcoach-main-sync` (the Claude↔Codex channel), but the actual code changes below go in `Desktop/rankedcoach-production` (a sibling directory, separate git repo, serves the live `rankedcoach.gg` domain). Read `notes/production-lovable-repo-and-sync-pipeline-2026-08-28.md` in this repo first — it covers the repo split, the GitHub↔Lovable sync mechanics, the git-identity gotcha, and why work there must go through a branch + PR, never straight to `main`.

---

## 1. Why

Every insight in production's `coaching-rules.ts` currently produces exactly one fixed sentence per rule — same wording every time it fires, confirmed via direct code read. Beta (this repo) already has a small, working, zero-runtime-cost mechanism that solves this: `public/language/valorant-vocabulary.js`. It hash-selects between a few hand-authored phrasing variants per insight type and fills `{{slots}}` with real values — no LLM call, fully deterministic, same seed always picks the same variant. Production has nothing like it. This directive ports the mechanism, and audits how much of beta's existing 300-heuristic coaching library (`docs/COACHING-LANGUAGE-RULES.md`, this repo) production's real data can actually support — as separate, sequenced work, not blended into one big pass.

**Explicitly ruled out, do not revisit:** any runtime OpenAI/LLM call from production's insight-generation path. The whole point of this system is richer, more varied Focus/Insights at zero marginal cost. If a future phase wants an LLM to help *author* phrasing variants, that must be an offline/batch tool a human runs occasionally — never something `coaching-rules.ts`, a route, or a component calls live.

---

## 2. Phase 1a — Port the mechanism (mechanical)

Source to port, verbatim pattern, from `Rankedcoach-main-sync/public/language/valorant-vocabulary.js` (this repo):

```js
function hash(value) {
  return Array.from(String(value || "")).reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 2166136261);
}

function fill(template, values) {
  return String(template || "").replace(/\{\{(\w+)\}\}/g, (_match, key) => String(values?.[key] ?? ""));
}

function selectCardVariant(key, seed, values = {}) {
  const choices = cardVariants[key] || [];
  if (!choices.length) return null;
  const selected = choices[hash(`${key}:${seed}`) % choices.length];
  return Object.fromEntries(Object.entries(selected).map(([field, value]) => [field, fill(value, values)]));
}
```

Create `src/lib/insight-variants.ts` in `rankedcoach-production` with a typed equivalent:
- Port `hash`, `fill`, `selectCardVariant` as-is (logic unchanged, just typed).
- Port the `terms` vocabulary object from the same source file (`positioning`, `teamwork`, `roundFlow`, `economy`, `utility`, `mechanics` arrays) as the canonical approved-term list. This is the single source of truth for "sounds like real Valorant coaching, not invented jargon" — every variant string written now or later must only use words from this list or plain English.
- Port the existing 7 `cardVariants` categories (`agentStrength`, `mapWeakness`, `recentLosses`, `recentWins`, `winStreak`, `lossStreak`, `weeklyFocus`) as-is, as the proof-of-concept content — do not invent new variants yet, that's Phase 2.
- **Decide the seed strategy and document the choice in a comment**: recommend `${playerId}:${isoWeek}:${ruleId}` so a given player sees a stable variant for a given rule within a given week (not re-randomized every page load, not identical forever). Flag this as a default recommendation, not a mandate — if there's a reason to seed differently (e.g., per-match instead of per-week), note the tradeoff and pick one rather than leaving it open.

**Proof of concept, required before calling 1a done:** wire `agentStrength` into one real production rule (production already computes agent/map breakdowns — check `analytics-core.ts` / `focus-ranking.ts` for the existing aggregation to reuse, don't rebuild it) and confirm two different seeds produce two different variant sentences for the same underlying data.

---

## 3. Phase 1b — Data-availability audit (research, not code)

Cross-reference all 300 heuristics in `Rankedcoach-main-sync/docs/COACHING-LANGUAGE-RULES.md` against what `rankedcoach-production` can actually check today:
- `src/lib/round-metrics.ts`'s `RmMatch`/`RmRound`/`RmKill` types (what fields exist per round/kill).
- Whatever raw Henrik payload fields production's ingestion captures beyond those types — check `analytics-core.ts`, `analytics.functions.ts`, and any Henrik response-mapping code for what's parsed vs. discarded.

For each of the 300 heuristics, classify as one of:
- **Checkable now** — production's existing data already supports it.
- **Checkable with a small addition** — the data likely exists in Henrik's raw response but isn't currently parsed/stored; name the specific field.
- **Blocked** — genuinely unavailable (positional coordinates, utility-cast timestamps, voice-comms content are the known categories per the doc's own notes).

Mirror the `blocked`/`policy` tagging convention beta's own `coaching-rules.js` already uses for the same problem — don't invent new terminology for this.

**Deliverable:** a markdown report (not code), added to this repo's `notes/` folder as `production-insight-variant-audit-2026-08-28.md` (or dated when actually written), heuristic-by-heuristic. This is what Phase 2 (actually authoring new variants) gets scoped from — don't start writing new variant content until this audit exists and has been reviewed.

---

## 4. Phase 1c — QA harness

Build these as tests/scripts in `rankedcoach-production`, mirroring `Rankedcoach-main-sync/testing/henrik/coaching-rules.test.js`'s existing pattern (that file verifies every structured rule traces back to a numbered heuristic in the doc — copy that pattern, don't redesign it):

1. **Vocabulary lint** — scans every string in `cardVariants` (present and future) for words that read as game-jargon but aren't in `terms{}` or a small plain-English allowlist. Fails loudly on anything unrecognized.
2. **Source-trace test** — every variant category must declare which numbered heuristic(s) from `COACHING-LANGUAGE-RULES.md` it implements; test asserts the declared number(s) actually exist in the doc.
3. **Determinism test** — `selectCardVariant(key, seed, values)` called twice with the same seed returns identical output.
4. **Distribution test** — across a large sample of synthetic seeds, no single variant within a category is selected more than roughly 2x the expected share (catches a hash bias before it ships).
5. **Render-matrix test** — render every variant against edge-case slot values (zero, a very large number, the longest real agent name, the longest real map name) and assert no broken template (`{{` left unfilled, empty required field).

---

## 5. Explicitly out of scope for this pass

- Writing new phrasing variants for any of the 300 heuristics — that's Phase 2, scoped after 1b's audit lands.
- Wiring anything beyond the one `agentStrength` proof-of-concept into the live Focus/Insights UI.
- Any LLM/OpenAI call anywhere in this code path, including "just for authoring help" — if that's wanted later it's a separate, explicitly offline tool, not part of this directive.
- Trying to cover the full map×agent×weapon cross-product. Every new insight should condition on one dimension at a time (occasionally two, like role+side), matching how the existing 7 categories and the 300-heuristic library are already structured. Full cross-product coverage was explicitly ruled out as unnecessary and a simplicity risk.

---

## 6. Don't forget

- Separate repo, separate git identity: commit as `Michael Doolittle <245895280+michealdoolittle-cyber@users.noreply.github.com>` — `rankedcoach-production` has no git config and will silently pick up a work email otherwise. See the pipeline note (Section 3) for the exact commands.
- Feature branch → PR → merge on GitHub. Never push straight to `main`. Say which branch is active if Lovable's editor might also be open, per the sync note.
- No new secrets, no `.env` changes — this entire phase is pure client-side/deterministic logic, nothing server-side or billed.

---

## 7. Done when

- [ ] `insight-variants.ts` exists in `rankedcoach-production`, typed, with `hash`/`fill`/`selectCardVariant` ported and unit-tested for determinism.
- [ ] `terms{}` vocabulary ported and typed.
- [ ] The 7 existing beta categories ported as-is.
- [ ] `agentStrength` wired into one real production rule; two different seeds demonstrably produce two different variant sentences off the same data.
- [ ] Vocabulary lint, source-trace test, determinism test, distribution test, and render-matrix test all exist and pass.
- [ ] Phase 1b's heuristic-by-heuristic audit delivered as a written report in this repo's `notes/`.
- [ ] Work is on a feature branch with a PR open (or merged), commit identity correct, no direct pushes to `main`.
