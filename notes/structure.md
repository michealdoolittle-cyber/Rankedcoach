# Structure Audit

## 2026-07-05 22:25 -04:00

### Current shape
- `public/index.html` owns the full static shell, modals, navigation, manual logging fields, and page containers.
- `public/app.js` is the main runtime and holds state, data transforms, renderers, profile persistence, chart logic, mobile/desktop behavior, insight generation, logging, stats, and customization.
- `public/app.css` contains global desktop/mobile styling plus many later lock/fix blocks.
- `public/sandbox-fx.*` contains animation helpers for the standalone `Active-Edit.html` visual editor; production profile frames do not load it.
- `supabase/functions/ask-coach/index.ts` is the deployed Ask Coach edge function.
- `cloudflare/functions/*` holds Cloudflare serverless endpoints for Riot integration and bug reports.
- `scripts/*` contains fixture/demo/build helper scripts.
- `data/`, `public/data/`, and fixture JSON files provide demo/import source data.

### High-risk structure areas
- `public/app.js` is too broad for fast feature work. It mixes UI, data, copy, profile persistence, Riot/import logic, and visual layout concerns.
- Manual matches, imported Riot matches, demo matches, chart points, logs, and insights still pass through several legacy shapes.
- Desktop and mobile are visual variants of the same app, but many CSS and render overrides now live far apart.
- Copy/language rules are partially embedded in app code instead of a central coaching language layer.
- Theme/profile border code is spread across CSS, app render functions, and asset-driven preview rules.

### Current shared logic
- `getMatchCore()` is the main practical adapter for reading match fields.
- `buildPlayerModel()` is the core profile analytics model.
- Stats, home, insights, and chart views all depend on derived match/log context.
- Profile persistence is still local-profile based with Supabase/auth hooks layered around it.

### Current duplication / conflict risk
- Mobile and desktop stats renderers share data but have separate visual layout rules.
- Multiple theme/profile-border CSS blocks exist from historical fix passes.
- Empty/locked states are inconsistent across home, stats, and insights.
- Manual mode uses exact stat fields that players often cannot know from memory.

### Suggested refactor path after this brief
1. Keep `public/app.js` stable during the brief.
2. Add canonical adapters first, then migrate view code gradually.
3. Move copy rules into a centralized language/coaching module.
4. Move theme/border config into object registries and let CSS consume generated variables.
5. Split mobile/desktop layout CSS into clearly marked sections only after behavior parity is confirmed.

### Task 1 conclusion
- The foundation issue is not missing features; it is lack of a canonical data boundary.
- Task 2 should add a match-record adapter between manual logs, screenshot import, Riot sync, and existing analytics without forcing a full rewrite now.
