# RankedCoach Cloudflare Deploy Notes

This workspace is set up for Cloudflare Pages with Pages Functions.

## Included Cloudflare pieces

- Static app files at the repo root
- Pages Functions under `functions/api/**`
- Demo import payload at `data/demo-import.json`
- `wrangler.toml` for local Pages development with Wrangler
- `_redirects` and `404.html`

## Cloudflare Pages settings

- Production branch: `main`
- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: `.`

## Required environment variables

- `RIOT_API_KEY`

## Current route behavior

- `/api/demo/import-example` serves the demo payload from `data/demo-import.json`
- `/api/riot/health` reports whether `RIOT_API_KEY` is configured
- `/api/riot/import-matches` performs live Riot API match import on Cloudflare
- `/api/dev/theme-snapshot` and `/api/dev/overlay-snapshot` still return `501`
  because Pages Functions do not provide the local file writes this route uses in `server.js`

## Local Cloudflare testing

Run:

```bash
npx wrangler pages dev .
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
