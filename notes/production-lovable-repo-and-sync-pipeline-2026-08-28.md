# Production Repo Split & Lovable Sync Pipeline — Reference

**Purpose:** This is not a task list — it's a reference doc so Codex (and any future Claude session) doesn't rediscover this the hard way. It explains where `rankedcoach.gg` production code actually lives now, how it's separate from this repo, how the GitHub↔Lovable sync works, and the gotchas hit while using it for the first time on 2026-08-28.

**Status:** Confirmed via direct inspection (git log, live domain headers, a real push/PR/merge cycle) — not secondhand.

---

## 0. Quick facts (copy-paste reference)

| | |
|---|---|
| Production domain | `rankedcoach.gg` |
| Production repo (HTTPS) | `https://github.com/michealdoolittle-cyber/art-keeper-collection.git` |
| Clone command used | `git clone https://github.com/michealdoolittle-cyber/art-keeper-collection.git rankedcoach-production` |
| Local checkout | `Desktop/rankedcoach-production` (sibling of this repo) |
| GitHub repo visibility | Private |
| Beta repo (this one) | `Rankedcoach-main-sync`, serves `beta.rankedcoach.gg` only |
| Correct git identity for the production repo | `Michael Doolittle <245895280+michealdoolittle-cyber@users.noreply.github.com>` |
| Lovable app id / template | `.lovable/project.json` → `"template": "tanstack_start_ts_current"`, `"revision": "tanstack_start_ts_current-b3e81c491308"` |
| Pre-existing fix commit (Lovable/bot) | `8abd4c5` "Fixed pistol off-by-one & bugs" (merge commit, authored by `gpt-engineer-app[bot]` + `michealdoolittle-cyber`) |
| Follow-up branch (this session) | `claude/language-clarity-followup-2026-08-28` |
| Follow-up commit | `f12d489` "Finish language-clarity backlog left over from 8abd4c5" |
| PR | #1, `https://github.com/michealdoolittle-cyber/art-keeper-collection/pull/1` |
| Merge commit | `a729e1a` "Merge pull request #1 from michealdoolittle-cyber/claude/language-clarity-followup-2026-08-28" |
| Live prod HTTP headers seen | `server: cloudflare`, `x-deployment-id: 17573d6c83c3181984a71c0de5c0d63ad79ba36dfb5c3a27a05397224cc725be` (snapshot from 2026-08-28 ~14:45 UTC — will change on redeploy, useful only as a "did this change" marker, not an absolute reference) |
| `.env.example` keys present | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_PROJECT_ID`, `VITE_SITE_URL`, `VITE_ADSENSE_CLIENT_ID`, `VITE_PADDLE_CLIENT_TOKEN`, `VITE_PADDLE_ENV`, `VITE_PADDLE_PRICE_SUPPORTER_MONTHLY`, `VITE_PADDLE_PRICE_SUPPORTER_YEARLY`, `VITE_PADDLE_PRICE_PRO_MONTHLY`, `VITE_PADDLE_PRICE_PRO_YEARLY`, `VITE_CHECKOUT_ENABLED`, `PADDLE_API_KEY`, `PADDLE_ENV`, `PADDLE_WEBHOOK_SECRET`, `VITE_DONATE_URL` — no Cloudflare/Vercel/Netlify/CI deploy tokens anywhere. |

---

## 1. The split — read this first

**`Rankedcoach-main-sync` (this repo) no longer serves the production root domain.** It serves `beta.rankedcoach.gg` only. If you're reading this from inside this repo and a task references `rankedcoach.gg` (the live root domain), the code for that is **not here**.

**`rankedcoach.gg` (production) now runs a completely separate project:**
- Repo: `github.com/michealdoolittle-cyber/art-keeper-collection`
- Local checkout: `Desktop/rankedcoach-production` — a sibling directory to this repo, deliberately kept separate so the two apps don't get confused with each other (this whole doc exists because that confusion already happened once).
- Stack: TanStack Start (SSR) + React 19 + Vite + Tailwind v4, Supabase-backed "Lovable Cloud" for auth/DB, `@lovable.dev/cloud-auth-js`. Built and hosted through **Lovable** (lovable.dev), not a plain Cloudflare Worker like this repo.
- Coaching engine lives at `src/lib/{coaching-rules,round-metrics,mechanisms,metric-benchmarks,coaching-expectations,baselines.server}.ts` in that repo — this is the measured-baseline, trust-weighted, causal-linking-pilot coaching system. It is **not** the same code as this repo's `public/analytics/coaching-rules.js` / `round-metrics.js`. Don't cross-reference bug reports between the two without checking which repo they're actually about.

If a task ever needs work in the production coaching engine, that work happens in `Desktop/rankedcoach-production`, not here — but notes/directives about it may still get written into this repo's `notes/` folder, since that's the established Claude↔Codex channel. Check the note's content, not its location, to know which repo it's actually about.

---

## 2. How the GitHub↔Lovable sync works

Confirmed directly from Lovable (relayed 2026-08-28):

- **Bidirectional, real-time, no manual pull/push step.** Lovable's own editor auto-commits and pushes to GitHub on every change made there. Commits pushed to GitHub from anywhere else (a local clone, Codex, Claude) sync back into the Lovable editor automatically.
- **No defined conflict-resolution strategy** for two simultaneous edits to the same file from both sides. Lovable has version history (Google-Docs-style restore) and branch switching as fallbacks, but real-time merge of concurrent edits isn't guaranteed clean.
- **Safe working pattern, per Lovable's own recommendation:** work on a feature branch, not `main`. Push the branch, open a PR, merge on GitHub. Tell Lovable/whoever else has the editor open which branch is active so nobody edits the same file in the Lovable UI while it's also being edited locally. Lovable can switch to a branch in its editor too.
- This was used successfully end-to-end on 2026-08-28: branch `claude/language-clarity-followup-2026-08-28` → PR #1 → merged on GitHub (merge commit `a729e1a`) → confirmed synced into Lovable's editor by pasting the post-merge `src/lib/mechanisms.ts` content from the Lovable code view and diffing it against the local copy (`diff <(tr -d '\r' < pasted.ts) <(tr -d '\r' < local.ts)`) — byte-for-byte identical across all 299 lines except one pre-existing cosmetic difference (a literal `’` vs. an escaped `’`, from before this session's changes, unrelated to the fix).
- **Reusable verification recipe:** to confirm any future GitHub→Lovable sync without spending Lovable tokens — (1) merge on GitHub, (2) open the file in Lovable's code *view* (not chat) and copy its content, (3) paste into a local scratch file, (4) `diff` (with `tr -d '\r'` on both sides to neutralize CRLF/LF) against the working tree's copy of the same file. Exact match = synced.

---

## 3. Git identity gotcha — check this before any commit in that repo

`rankedcoach-production` has **no git config at all** — no local `.git/config` user section, no global, no system. A first commit there silently falls back to whatever the OS/network reports, which came back as a **work email** (`mdoolittle@montefiore.org`, from Windows domain-join info) — not something that should end up in a pushed commit on a personal project.

**Correct identity for this repo, confirmed from its own commit history:**
```
Michael Doolittle <245895280+michealdoolittle-cyber@users.noreply.github.com>
```
Set it per-commit (`GIT_AUTHOR_NAME`/`GIT_AUTHOR_EMAIL`/`GIT_COMMITTER_NAME`/`GIT_COMMITTER_EMAIL` env vars, or `git commit --amend --reset-author` before pushing if it slipped through) rather than writing to global git config. Check `git log -1 --format='%an <%ae>'` before pushing anything from this repo for the first time in a session.

---

## 4. Deployment — there is no separate deploy pipeline

Checked directly: no `.github/workflows`, no `wrangler.toml`, no deploy script in `package.json` (only `dev`/`build`/`preview`/`lint`/`format`), no Cloudflare/Vercel/Netlify credentials anywhere in `.env.example`. The Vite config builds *toward* a Cloudflare target via Nitro, but the actual publish step is entirely inside Lovable's platform — there's no `wrangler deploy` or CI job to run as an alternative.

**The only lever from git is merging to `main`.** Whether that alone re-publishes the live site, or whether it still needs a manual "Publish" click in the Lovable dashboard, is a **per-project Lovable setting that hasn't been confirmed yet** — check the dashboard's Deploy/Publish page (a plain UI look, not an AI query) rather than assuming either way.

---

## 5. Cost awareness — Michael's explicit ask

Michael wants Lovable AI/chat token usage minimized — it's "incredibly inefficient" per his words. Concretely:
- Checking merge status, diffing files, confirming sync → all doable for free via plain git (`git fetch`, `git log`, `git merge-base --is-ancestor`) or by pasting file content for a byte-diff. No Lovable involvement needed.
- Checking Lovable's Publish/Deploy setting or GitHub-connection status → free, it's browsing a settings page in their dashboard, not an AI query.
- The thing that actually costs tokens is asking **Lovable's chat/agent** to go check or do something on your behalf. Default to git-native or dashboard-UI checks first; only loop Lovable's AI in when something genuinely requires their side to act (e.g. an actual code change made through their editor).

---

## 6. Status as of 2026-08-28 (history, not an open task)

A handoff doc from an earlier Lovable-side chat described 3 coaching-engine defects and a language-clarity standard. Verified against the real repo once it became accessible:
- Pistol-round off-by-one (`round-metrics.ts`) and the ADR/K-D role-nudge double-count (`coaching-expectations.ts`) — both fixed cleanly in commit `8abd4c5`.
- The residual-trade "bought for" claim (`mechanisms.ts`) — the exclusion logic was fixed in `8abd4c5`, but the sentence text and several other language-clarity items were left over (some regressed by `8abd4c5` itself). Fixed on branch `claude/language-clarity-followup-2026-08-28` (commit `f12d489`), PR #1, merged into `main` (`a729e1a`), confirmed synced into Lovable's editor.
- Deployment status of that merge (live on rankedcoach.gg or not) — unconfirmed as of this writing, per Section 4 above.

**Exact fixes applied in `f12d489`, for reference:**

| File | Line(s) (pre-fix) | Before | After |
|---|---|---|---|
| `src/lib/mechanisms.ts` | ~185, `no-response` case in `tradeMechanism` | `` `${share} passed without you shooting at that enemy at all, in rounds where you were alive and had bought a rifle-tier loadout.` `` (broken clause + invented jargon) | `` `${share}, and you never fired at that enemy — these were rounds where you were alive and had bought a gun.` `` |
| `src/lib/coaching-rules.ts` | ~163 (new line added after `roleNote`) | — | Added `const roleLabel = (m: RoundMetrics) => (m.primaryRole ? \`${m.primaryRole}s\` : "your role");` |
| `src/lib/coaching-rules.ts` | 339 (`duel-efficiency` body) | `...expected for your role mix in ${tierLabel(...)} lobbies.` | `...expected for ${roleLabel(m)} in ${tierLabel(...)} lobbies.` |
| `src/lib/coaching-rules.ts` | 370 (`low-adr` body) | same "role mix" pattern | same `roleLabel(m)` swap |
| `src/lib/coaching-rules.ts` | 514 (`damage-strength` title) | `"Your damage output is carrying rounds"` (unsupported "carrying" claim) | `"Your damage output is having a big impact"` |
| `src/lib/coaching-rules.ts` | 534 (`damage-strength` body) | "role mix" pattern | `roleLabel(m)` swap |
| `src/lib/coaching-rules.ts` | 617, 650 (`trade-back-strength` and `trade-given` evidence) | `` `${m.tradeChances} teammate deaths you were close enough to answer` `` — this was `8abd4c5` moving the phrasing in the *wrong* direction | `` `${m.tradeChances} teammate deaths you were in range to trade` `` |
| `src/lib/coaching-rules.ts` | 646 (`trade-given` first step) | `"Stand within trade distance of the first contact, not behind a wall"` (static positioning, not the intended dynamic-readiness point) | `"Play close to your teammates and stay mentally ready to trade in, whether you are holding an angle or clearing one"` |

**How to apply:** if a future task touches `rankedcoach.gg` production behavior, start in `Desktop/rankedcoach-production`, not this repo — and re-check whether GitHub two-way sync and the identity/deploy notes above are still accurate, since this was all set up for the first time this session.
