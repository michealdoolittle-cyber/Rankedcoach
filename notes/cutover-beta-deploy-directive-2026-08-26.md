# Directive for Codex — stand up beta.rankedcoach.gg as the production mirror

## Context (read `notes/cutover-beta-snapshot-2026-08-26.md` first)

That note explains the situation in full; this one is the actual task list.
Short version: `wrangler.beta.toml` has been repointed (already committed,
commit `9f963b7`) to deploy the exact same code as production
(`worker/index.js` + `public/`) under the `rankedcoach-beta` Worker name,
instead of the old redesign-prototype shell. The goal is for
`beta.rankedcoach.gg` to become a live, working copy of the current
production app — unchanged — before the root domain (`rankedcoach.gg`) gets
moved to a new Lovable-built app. A git tag,
`pre-cutover-production-snapshot-2026-08-26`, already preserves the current
production commit regardless of what happens below.

Four things remain. Do them in order. **For each one: try it for real, don't
just assume it'll fail. If it genuinely can't be done from your environment,
don't stop at "blocked" — write out the exact, literal step-by-step
instructions Michael needs to follow himself, as if he has never used
Cloudflare or wrangler before.** Put that handoff directly in your final
report, not buried in a file he has to go find.

## Step 1 — Set secrets on the `rankedcoach-beta` Worker

First, check whether you're authenticated at all:

```
npx wrangler whoami
```

If that fails ("not logged in" / no `CLOUDFLARE_API_TOKEN`), **stop here for
steps 1 and 2** and skip to the handoff instructions below — don't try
`wrangler login` interactively, it won't work in a non-interactive
environment either.

If you ARE authenticated, the reliable way to get the exact secret list
(don't just trust the guess below) is to read what production already has:

```
npx wrangler secret list --config wrangler.toml
```

That gives you names only (not values — Cloudflare never returns secret
values). For each name it lists, you need the actual value, which only
Michael has (they're not in this repo — `.dev.vars` has local dev copies of
some, but not all). So even fully authenticated, you cannot complete this
step end to end without Michael supplying values for whichever secrets
you don't already have local copies of.

From static analysis of `worker/` and `functions/`, the names referenced are:
`HENRIKDEV_API_KEY`, `RIOT_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
`GEMINI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `KNOWLEDGE_PIPELINE_TOKEN`,
`KNOWLEDGE_ANALYSIS_ENDPOINT`, `KNOWLEDGE_TRANSCRIPT_ENDPOINT`,
`KNOWLEDGE_TRANSCRIPT_TOKEN`, `KNOWLEDGE_OWNER_EMAILS`,
`KNOWLEDGE_VIDEO_MODEL`, `YOUTUBE_DATA_API_KEY`, `TWITCH_CLIENT_ID`,
`TWITCH_CLIENT_SECRET`. Trust `wrangler secret list` on production over this
guess — copy whatever it actually lists, not just this set.

For each secret you have both the name and a value for:
```
npx wrangler secret put <NAME> --config wrangler.beta.toml
```
(this prompts for the value on stdin — pipe it in or handle non-interactively
however your environment requires; do not print secret values in your report).

## Step 2 — Deploy

Only after step 1 is as complete as it can be:
```
npx wrangler deploy --config wrangler.beta.toml
```
Report the deployed Worker URL (the `*.workers.dev` one) it prints.

## Step 3 — Point beta.rankedcoach.gg at the new Worker

Check first whether this is even possible from the CLI in your environment —
try adding to `wrangler.beta.toml`:
```
routes = [
  { pattern = "beta.rankedcoach.gg", custom_domain = true }
]
```
then `wrangler deploy --config wrangler.beta.toml` again and see whether it
actually attaches the domain (check `wrangler deployments status` or similar,
or just curl `https://beta.rankedcoach.gg` after a minute and see if it
answers). I could find no precedent anywhere in this repo's history of a
custom domain being attached this way (no existing `routes`/`custom_domain`
entries in any wrangler config, no deploy-related GitHub Actions workflow),
which suggests production's domain was originally attached by hand in the
dashboard — so this may simply not be scriptable in this account's current
setup. If the `routes` approach doesn't visibly attach the domain, don't
guess further — hand this one off.

## Step 4 — Confirm beta actually behaves like production

Whatever you could deploy, hit it with real checks:
```
curl -sS https://beta.rankedcoach.gg/ | head -50
curl -sS https://beta.rankedcoach.gg/api/henrik/health
```
(or the equivalent health/status endpoints — check `functions/api/*/health.js`
for what's available) and report what came back. This confirms the Worker is
live and the API layer is responding, but it does NOT confirm a real user can
sign in and sync a real Riot account — that needs a human with real
credentials to click through once. Say so plainly rather than declaring
victory on curl output alone.

## If any step couldn't be completed — required format for the handoff

For every step you couldn't finish, write out literally what Michael needs to
do, in order, assuming zero prior context:
- The exact command to type, or the exact dashboard path to click through
  (e.g. "Cloudflare dashboard → Workers & Pages → rankedcoach-beta → Settings
  → Domains & Routes → Add Custom Domain → enter `beta.rankedcoach.gg`").
- What to expect to see when it works.
- What secret VALUES he needs to have on hand before starting (names only,
  never ask him to paste a secret value into a shared note/commit).

Do not just say "steps 1–3 require Cloudflare access I don't have." That's
true but not useful on its own — the whole point of this directive is that if
you hit that wall, you become the one writing the runbook, not the one
reporting the wall exists.
