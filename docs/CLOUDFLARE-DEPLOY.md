# RankedCoach Cloudflare Deploy Notes

**Corrected 2026-07-09** — this file previously described a Cloudflare Pages + Pages Functions setup with Git-integration auto-deploy. That's stale: the live `wrangler.toml` uses `[assets]` (the newer Workers-with-static-assets config), not Pages, and there is no Pages project on the account and no CI pipeline in this repo. Deploys happen by running `wrangler deploy` directly — see below.

## Included Cloudflare pieces

- Static app files served from `./public` via `wrangler.toml`'s `[assets]` config (Worker, not Pages)
- Demo import payload at `data/demo-import.json`

## Known gap, found 2026-07-09, not yet resolved — `functions/api/**` may not actually be live

`functions/api/health.js`, `functions/api/demo/import-example.js`, `functions/api/riot/health.js`, `functions/api/riot/import-matches.js`, and `functions/_lib/riot.js` all still exist in the repo. But `functions/**` is a **Cloudflare Pages Functions** convention — it's auto-discovered by the Pages build system, not by a plain `wrangler deploy` against a `wrangler.toml` that only has `[assets]` and no `main` entry script. Since this project deploys as a Worker (no Pages project exists, confirmed), there's no mechanism currently wired to actually execute this code in production.

This matters because `public/app.js` calls `/api/riot/health` at runtime (`app.js:46227`, `46430`) and `/api/riot/import-matches` (`app.js:46244`) — if these routes really aren't deployed, those calls 404 in production every time they run. Riot sync is feature-flagged off (`RIOT_SYNC_FEATURE_FLAG = false`, see `notes/riot-sync.md`), so the blast radius may currently be small, but the health-check call may run independent of that flag — needs verification, not just this note. `/api/demo/import-example` doesn't appear to be called from `app.js` at all (demo data likely loads a different way), so that one's probably just dead code rather than an active bug.

**Not fixed as part of this doc correction** — this needs its own investigation pass (confirm live 404 behavior, then decide: convert to real Worker routing with a `main` entry script, or move back to Pages if Functions are genuinely needed) before treating it as done. Flagging here so it doesn't get lost.

## Required environment variables

- `RIOT_API_KEY`

## Deploying — always use the notify wrapper, not bare `wrangler deploy`

Michael wants a push notification when a deploy finishes so he isn't stuck watching the terminal. Every deploy should go through the wrapper script, not a bare `wrangler deploy`:

```powershell
powershell -File scripts\deploy-and-notify.ps1
```

or, in a bash-style shell:

```bash
bash scripts/deploy-and-notify.sh
```

Both run `wrangler deploy` and then push a status notification via `scripts/notify.js` (ntfy.sh, topic set in that file / the `RANKEDCOACH_NTFY_TOPIC` env var) — success or failure. Don't run `wrangler deploy` directly unless Michael explicitly asks for a silent/no-notification deploy for some reason; the default going forward is always through the wrapper.

## Local Cloudflare testing

Run:

```bash
npx wrangler dev
```

## Supabase setup

Before deploying, set your production Supabase project details in the HTML before `app.js` loads:

```html
<script>
  window.VIP_SUPABASE_CONFIG = {
    url: "https://YOUR_PROJECT.supabase.co",
    anonKey: "YOUR_SUPABASE_ANON_KEY"
  };
</script>
```
