# Riot Sync Scaffolding

## Pre-launch blocker, found 2026-07-09 — fix before flipping RIOT_SYNC_FEATURE_FLAG on

`public/app.js` calls `/api/riot/health` (`~46319`, `~46522`) and `/api/riot/import-matches` (`~46336`) when Riot sync runs. Those routes' code lives at `functions/api/riot/health.js` / `functions/api/riot/import-matches.js`, which is a **Cloudflare Pages Functions** convention — but this project currently deploys as a plain Worker (`wrangler.toml` has `[assets]` only, no `main` entry script, no Pages project on the account). Pages Functions aren't auto-discovered under a Worker-only deploy, so there's a real chance these routes 404 in production right now.

**Zero impact today** — confirmed both call sites are guarded by `isRiotSyncFeatureEnabled()` checks that return early while the flag is off, so the broken routes are never actually reached. This is purely a landmine for later, not a current bug. See `docs/CLOUDFLARE-DEPLOY.md`'s "Known gap" section for the full technical detail.

**Must be resolved before this flag ever flips to `true`** — either wire real Worker routing (a `main` entry script that handles `/api/riot/*`) or move the deploy back to Pages, and confirm live (not just structurally) that these routes actually respond before Riot sync goes live for real users.

## 2026-07-05 22:53 -04:00

### Added files
- integrations/riotSync/index.js for Node/review-side scaffold.
- public/integrations/riot-sync.js for the current browser app.

### Feature flag state
- RIOT_SYNC_FEATURE_FLAG = false in both modules.
- Browser activation also requires window.RANKEDCOACH_FEATURES.riotSync === true, so it is doubly gated.
- No environment enables this yet.

### RSO auth path scaffold
- createRsoAuthorizationUrl() can build a Riot RSO authorization URL only when the flag is enabled.
- With the flag off it returns { enabled: false, reason: "riot_sync_feature_flag_off" }.

### Data-pull path scaffold
- pullMatches() / pullRiotMatches() are stubbed to return disabled status and no records.
- No live Riot data pull is executed from this scaffold.

### Schema mapping
- mapRiotMatch() / mapRiotMatchToCanonicalRecord() map future Riot match payloads through RankedCoachMatchRecord.fromRiotMatch().
- No Riot-specific parallel schema was added.
