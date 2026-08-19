# RankedCoach Beta — isolated workspace for beta.rankedcoach.gg

This directory (plus `wrangler.beta.toml` at the repo root) is a fully separate
frontend + Worker deploy from the production app (`public/`, `worker/index.js`,
`wrangler.toml`). It exists to build the Play/Review/Learn/Library redesign
(see `notes/rank-baseline-upgrade-and-stat-gauging-2026-08-18.md`'s sibling
concept-art memory) without any risk of touching or breaking the live site.

## What's isolated vs. shared

**Isolated (never touches production files):**
- `beta/public/` — the new frontend's HTML/CSS/JS. Production's `public/` is
  never read or written by anything in here.
- `beta/worker/index.js` — a separate Worker entry point. It does not import
  from, or get imported by, `worker/index.js`.
- `wrangler.beta.toml` — a separate Cloudflare Worker deploy (`name =
  "rankedcoach-beta"`), independent of the production `wrangler.toml`'s
  `rankedcoach` worker.

**Shared on purpose (this is the whole point of the architecture):**
- `functions/api/*` and `functions/_lib/*` — the actual Henrik sync, account,
  and match-import logic. `beta/worker/index.js` imports these same modules
  directly, so beta runs against real, working backend logic instead of a
  reimplementation. Changes to these files affect both apps — that's
  intentional; it's the shared data pipeline.
- The `CONTENT_AUTOMATION` KV namespace (same `id` in both wrangler configs) —
  the Gamesense Library / knowledge content beta's Learn section will read.
- The Henrik/Supabase/OpenAI API keys (see Manual setup below) — same key
  values, bound separately per Worker since Cloudflare scopes secrets per
  Worker name.

**Deliberately NOT shared:** the `scheduled()` cron handler. Production's
worker already runs the content-automation/knowledge-pipeline jobs against the
shared KV on a schedule — `beta/worker/index.js` has no `scheduled()` export
and `wrangler.beta.toml` has no `[triggers]` block, so those jobs never run
twice against the same store.

## Why beta needs its own Worker instead of calling production's API

Production's `functions/api/henrik/*` handlers reject cross-origin POST
requests by design (`worker/index.js`'s `Origin !== url.origin` check) — this
is a deliberate security control, not an oversight, and it's preserved as-is
in `beta/worker/index.js`. That means the beta frontend calling
`www.rankedcoach.gg/api/henrik/*` directly would be blocked. Running the same
handler modules under beta's own origin (`beta.rankedcoach.gg/api/henrik/*`)
is what makes the shared-backend approach actually work same-origin, without
weakening that protection.

## Manual setup still needed (none of this is done yet — infra actions, not file changes)

1. **Secrets.** The beta Worker needs its own copies of the same secret
   values production has (`HENRIKDEV_API_KEY`, `SUPABASE_ACCESS_TOKEN`,
   `OPENAI_API_KEY` — names only, confirmed from `.dev.vars`, values never
   touched by this scaffold). Cloudflare scopes secrets per Worker name, so
   these need to be set again against `rankedcoach-beta`:
   ```
   wrangler secret put HENRIKDEV_API_KEY --config wrangler.beta.toml
   wrangler secret put SUPABASE_ACCESS_TOKEN --config wrangler.beta.toml
   wrangler secret put OPENAI_API_KEY --config wrangler.beta.toml
   ```
2. **Custom domain route.** Point `beta.rankedcoach.gg` at the
   `rankedcoach-beta` Worker in the Cloudflare dashboard (Workers & Pages →
   rankedcoach-beta → Domains & Routes) once it's deployed.
3. **First deploy.**
   ```
   wrangler deploy --config wrangler.beta.toml
   ```
4. **Account toggle** (product decision, not built yet): the plan from the
   concept-art memory is an account-level flag that routes opted-in users
   (Pro/Elite first) to beta.rankedcoach.gg with a visible switch-back option.
   Not part of this scaffold — flagged here so it isn't lost.

## What exists right now

Just a placeholder page (`beta/public/index.html`) and a Worker that can
already serve the shared Henrik API routes (health/account/matches/mmr-history
/mmr-history-live/raw) once secrets are set. No actual Play/Review/Learn/
Library UI has been built yet — that's the next phase of work.
