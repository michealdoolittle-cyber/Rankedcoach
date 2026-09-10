# Cutover prep — move the current app to beta.rankedcoach.gg — 2026-08-26

## Why this note exists

We're cutting rankedcoach.gg over to a new app built in Lovable. The stated
goal: the **current** production app (this repo — real Henrik/Riot data,
everything live today) moves to `beta.rankedcoach.gg`, and the Lovable app
takes over the root domain. The explicit concern driving this: don't lose the
snapshot of what the app looks like and how it functions right now.

Before this note, that goal was not what the repo was actually set up to do.
`beta.rankedcoach.gg`'s Cloudflare config (`wrangler.beta.toml`) pointed at
`beta/worker/` + `beta/public/` — a separate, from-scratch visual redesign
prototype ("Beta Foundation Shell") with invented demo content, mid-rebuild,
never fully deployed. It was not a copy of production and would not have
preserved anything if the root domain moved to Lovable as planned.

## What's done (code only — see below for what still needs a human)

1. **Snapshot tag pushed to GitHub**: `pre-cutover-production-snapshot-2026-08-26`
   on commit `3ce8848`, the exact committed state serving rankedcoach.gg right
   now. This exists independently of everything else below — even if nothing
   further happens, this commit is preserved and can always be redeployed.

2. **`wrangler.beta.toml` repointed** to deploy the exact same code as
   production (`main = "./worker/index.js"`, `directory = "./public"`)
   instead of the redesign prototype. The Worker name stays
   `rankedcoach-beta`, so it deploys as a distinct Worker from production
   (`rankedcoach`) and can be bound to `beta.rankedcoach.gg` independently.
   `[triggers]` crons are deliberately still omitted — production's Worker
   already runs the scheduled content-automation jobs against the shared
   `CONTENT_AUTOMATION` KV; running them a second time from beta would risk
   duplicate writes against that same store.

3. **`beta/worker/` and `beta/public/` (the redesign prototype) are
   untouched** — nothing was deleted. That work just isn't wired to a domain
   through this config anymore. Whoever picks the redesign back up can point
   a wrangler config at it again later, under a different name/subdomain if
   `beta` is now spoken for.

4. **Verified the app doesn't hardcode the domain in a way that would break
   under `beta.rankedcoach.gg`**: the cross-origin check in `worker/index.js`
   compares the request's `Origin` header against `url.origin` dynamically —
   it isn't pinned to `rankedcoach.gg`, so it works correctly under any
   domain the Worker is actually deployed on. The only literal
   `rankedcoach.gg` strings in the app are in static HTML/SEO files
   (`public/index.html`, `privacy.html`, `terms.html`, `robots.txt`,
   `sitemap.xml`) — canonical/OG URLs and sitemap entries. Those will read
   "rankedcoach.gg" while served from `beta.rankedcoach.gg`, which is
   cosmetically wrong (SEO metadata pointing at the wrong host) but doesn't
   break functionality. Worth a follow-up pass if `beta` stays up long-term,
   not a blocker for standing it up.

## What still needs you (no Cloudflare credentials or login available here)

**1. Set secrets on the `rankedcoach-beta` Worker.** Cloudflare scopes
secrets per Worker name, so `rankedcoach-beta` needs its own copies of
whatever `rankedcoach` (production) currently has. From reading the code,
these names are referenced somewhere in the request/response path or the
content-automation pipeline:

```
wrangler secret put HENRIKDEV_API_KEY --config wrangler.beta.toml
wrangler secret put RIOT_API_KEY --config wrangler.beta.toml
wrangler secret put SUPABASE_URL --config wrangler.beta.toml
wrangler secret put SUPABASE_ANON_KEY --config wrangler.beta.toml
wrangler secret put GEMINI_API_KEY --config wrangler.beta.toml
wrangler secret put GOOGLE_GENERATIVE_AI_API_KEY --config wrangler.beta.toml
wrangler secret put KNOWLEDGE_PIPELINE_TOKEN --config wrangler.beta.toml
wrangler secret put KNOWLEDGE_ANALYSIS_ENDPOINT --config wrangler.beta.toml
wrangler secret put KNOWLEDGE_TRANSCRIPT_ENDPOINT --config wrangler.beta.toml
wrangler secret put KNOWLEDGE_TRANSCRIPT_TOKEN --config wrangler.beta.toml
wrangler secret put KNOWLEDGE_OWNER_EMAILS --config wrangler.beta.toml
wrangler secret put KNOWLEDGE_VIDEO_MODEL --config wrangler.beta.toml
wrangler secret put YOUTUBE_DATA_API_KEY --config wrangler.beta.toml
wrangler secret put TWITCH_CLIENT_ID --config wrangler.beta.toml
wrangler secret put TWITCH_CLIENT_SECRET --config wrangler.beta.toml
```

This list is derived from static code analysis (every `env.X` reference in
`worker/` and `functions/`), not from reading production's actual secret
store — I have no Cloudflare login here to confirm it's complete. Since beta
will run byte-identical code to production, the reliable approach is: run
`wrangler secret list` against the production Worker and copy every value it
has to `rankedcoach-beta`, rather than trusting this list as exhaustive.

(`SUPABASE_ACCESS_TOKEN`, present in `.dev.vars`, is not referenced anywhere
in `worker/` or `functions/` — it looks like a local CLI-only credential, not
something the Worker itself needs.)

**2. First deploy:**
```
wrangler deploy --config wrangler.beta.toml
```

**3. Point `beta.rankedcoach.gg` at the `rankedcoach-beta` Worker** in the
Cloudflare dashboard (Workers & Pages → rankedcoach-beta → Domains & Routes),
if that route isn't already configured from the earlier prototype work.

**4. Confirm it before touching the root domain.** Once deployed, load
`beta.rankedcoach.gg` and check it behaves like production right now — sign
in, a real match sync, stats pages. Only after that's confirmed should the
root-domain DNS move (Cloudflare → point `@`/`www` at Lovable's
`185.158.133.1`) happen — that's the point of this whole exercise: there
should be no window where the current live app is unreachable from any
domain.

## Rollback

Nothing here is destructive. `wrangler.beta.toml`'s previous version (pointing
at the redesign prototype) is one `git revert` away. The snapshot tag
(`pre-cutover-production-snapshot-2026-08-26`) and the `beta/` prototype
directory are both untouched and available regardless of what happens next.
