# RankedCoach Session Handoff - 2026-07-13

This document is written for a new Codex session with no prior knowledge of RankedCoach. Read it before making changes. Then verify the repository and production state because this app moves quickly and older directive notes often preserve historical text below newer status lines.

## 1. Project Identity

- Product: RankedCoach.gg, a Valorant ranked-performance and coaching web app.
- Production: https://www.rankedcoach.gg
- Real Git repository: `C:\Users\Micheal Doolittle\Desktop\Rankedcoach-main-sync`
- Do not work from `C:\Users\mdoolittle\Desktop\Live-App-35`; it is an old flat/export-style app folder, not the active repository.
- Deployment path: local `main` -> GitHub `origin/main` -> Cloudflare Worker with static assets.
- Supabase provides authentication and persisted profile/match data.
- HenrikDev is the current server-side source for Riot ID, Competitive match history, rank, MMR snapshots, and raw round data. Official Riot RSO remains a future path.

## 2. Original State at Handoff

- Branch: `main`
- Live product baseline before this documentation-only handoff commit: `57b7badb039c2ab3c046e72204c1efec255b055e`
- Product commit: `57b7bad - Refine Gamesense Library mobile experience`
- `origin/main` matched that product baseline when this handoff was written. A newer HEAD containing only this handoff document does not require a Cloudflare deployment.
- Worktree was clean before this handoff file was created.
- Live static cache key: `20260713-library-mobile-refine-01`
- Latest Cloudflare deployment version: `30c596ee-8a04-4ff3-9a89-e625207c8344`
- Production smoke verification confirmed the cache key, removal of the Reference Room, the Tracker Network source disclosure, and the new weapon-suggestion markup.
- The deploy wrapper and a separate completion message both successfully notified the configured ntfy topic.

The latest commit sequence is heavily focused on the Gamesense Library:

```text
57b7bad Refine Gamesense Library mobile experience
67f9346 Polish library maps and shared UI motion
f9ea794 Polish mobile progression and gamesense library
55c6cb2 Fix Gamesense Library scrolling
735307b Protect map card art from theme overrides
7461952 Fix Library asset URL resolution
6e266d0 Expand Gamesense Library visual guides
419475e Add Gamesense Library and consolidate navigation
```

## 2A. Post-Handoff Release Update

The repository advanced after the original handoff. Treat this as the current shipped baseline:

- Current branch/remote: `main`, with local HEAD and `origin/main` both at `a63266fd19fe1eeacb5b6ff67c97de4833217f7c` when this update was recorded.
- Current product commit: `a63266f - Improve profile sync and post-game workflow`.
- Current production cache key: `20260713-profile-sync-ui-01`.
- Production verification confirmed that cache key and a healthy configured Henrik bridge at `/api/henrik/health`.
- Michael reported the complete release passed automated, live-data, desktop, mobile, and production checks, was pushed/deployed, and sent its release notification.

The three post-handoff commits are:

```text
a63266f Improve profile sync and post-game workflow
e42d9d5 Harden Henrik sync rate-limit handling
988dc70 Refine Gamesense Library follow-up
```

### `988dc70` - Gamesense Library Follow-Up

- Replaced the generated Weapons dossier image with real Valorant weapon presentation; the committed `public/assets/library/weapons-dossier-v2.webp` was deleted.
- Refined focus-label sizing, Stats selector placement, dossier highlights, dropdown transitions, and expandable Role Lens controls.
- Expanded pistol, shotgun, and sniper guidance with clearer use cases, economy context, conversion comparisons, and weapon-specific details.
- Updated the focused Gamesense visual regression coverage with the new dossier behavior.

### `e42d9d5` - Henrik Rate-Limit Resilience

- Treats HTTP 429, timeouts, and upstream 5xx responses as retryable Henrik failures.
- Adds bounded retry/backoff behavior and clearer rate-limit state instead of treating a temporary shared-key quota event as missing player data.
- Adds dedicated data-layer and visual regression tests for rate-limit resilience.
- The triggering incident reproduced against unrelated PUUIDs and cleared later, confirming a shared Henrik quota event rather than an account-specific failure.

### `a63266f` - Profile Sync and Post-Game Workflow

- Replaced browser `prompt()` profile creation with a compact profile setup menu for name, Riot ID, and region.
- New profiles display loading progress while account resolution and retained Competitive-history sync run.
- Retained-history sync can page much deeper than the previous single 100-match window while remaining bounded.
- Imported Competitive games receive verified RR when Henrik supplies it; null/absent RR is no longer coerced into a false zero.
- The latest imported game from today can prefill the reflection form without overwriting an existing player draft.
- Post-game aim training can be added, displayed, edited, or removed against the correct session.
- Signed-in initialization uses the retained-history flow and updates the loading veil as batches progress.
- Added `testing/visual-audit/profile-sync-workflow.test.js` and expanded Henrik, log-policy, warm-up, Library, and data-surface checks.

### Untracked Files at This Update

Do not assume these were part of the shipped release or delete them without checking with Michael:

```text
notes/gamesense-library-followup-2026-07-13.md
notes/riot-sync-rate-limit-2026-07-13.md
public/assets/library/weapons-dossier-v2.webp
testing/visual-audit/audit-run.log
testing/visual-audit/library-drill.js
```

The WebP path is intentionally absent from current Git because `988dc70` deleted the generated asset; its reappearance is an untracked local artifact.

## 3. Application Architecture

This is a large client-side SPA, not React or a conventional module-bundled app.

- `public/index.html`: page and modal markup, script/style loading, cache-bust keys.
- `public/app.js`: the main application runtime. It is very large and contains navigation, profiles, auth hydration, logging, stats, insights, themes, charts, Henrik sync, and persistence behavior.
- `public/app.css`: the main shared stylesheet.
- `public/mobile-user43-verified-final.css`: established mobile-specific overrides. Do not casually move desktop rules into it or vice versa.
- `public/schema/match-record.js`: canonical imported match schema and provider adapters.
- `public/analytics/round-metrics.js`: KAST and round-derived metrics.
- `public/analytics/coaching-rules.js`: structured first slice of coaching-rule matching.
- `public/analytics/warmup-correlation.js`: warm-up/training correlation behavior.
- `public/language/`: shared Valorant vocabulary/copy support.
- `public/library/gamesense-library.js`: Library state, rendering, selection handling, and transitions.
- `public/library/gamesense-library.css`: Library desktop/mobile presentation and map interaction styles.
- `public/library/gamesense-maps.js`: map strategy, role notes, plant locations, current references, and weapon suggestions.
- `public/library/gamesense-reference.js`: agent, ability, weapon, map-fit, and usage reference data.
- `public/themes/premium-themes.js`: future entitlement hooks only. The active QA gate is in `app.js`.
- `worker/index.js`: Cloudflare Worker entry point and `/api/*` router. It delegates to handlers under `functions/api/**` and serves all other requests from `env.ASSETS`.
- `supabase/functions/ask-coach/index.ts`: Ask Coach server function and coaching prompt.
- `testing/visual-audit/`: Playwright passthrough and focused regression suites.

Cloudflare configuration is in `wrangler.toml`:

```toml
name = "rankedcoach"
main = "./worker/index.js"

[assets]
directory = "./public"
binding = "ASSETS"
run_worker_first = ["/api/*"]
```

Some older documentation still says Worker routing is missing. That is stale. `worker/index.js` now routes Riot, Henrik, demo, and development snapshot endpoints.

## 4. Non-Negotiable Working Rules

1. Deploy live by default unless Michael explicitly says not to.
2. Always deploy with `powershell -ExecutionPolicy Bypass -File .\scripts\deploy-and-notify.ps1`, not bare `wrangler deploy`. The wrapper sends ntfy success/failure. Push GitHub manually because the wrapper does not push.
3. Send a specific ntfy completion message with `node scripts/notify.js "..."` when a requested batch is ready.
4. Mobile and desktop are the same app with different layouts. Mobile-only changes must be gated behind `html.is-mobile-layout`, `body.is-mobile-layout`, or `isMobileLayoutViewport()` and must not affect desktop unintentionally.
5. If a requested positioning/layout change has non-obvious desktop and mobile consequences, pause and explicitly surface that tradeoff before committing.
6. Bump the cache key in `public/index.html` for every changed browser asset. Stale asset URLs caused multiple false regressions before this rule was established.
7. Visually verify tabs, dropdowns, gestures, key cards, and reachable modals after layout changes. Do not rely on syntax checks alone.
8. For multi-item bug requests, say which issue/item is currently being addressed in progress updates.
9. Do not expose `HENRIKDEV_API_KEY` in `public/app.js` or any client asset. It is a Worker secret and Henrik requests must go through `/api/henrik/*`.
10. Tracker.gg screenshot/OCR import and Tracker profile links were intentionally removed. Do not resurrect that flow; Henrik Riot-ID sync replaced it.
11. Coaching language should sound like a calm Valorant coach. Follow `docs/COACHING-LANGUAGE-RULES.md`, `docs/RANKEDCOACH-VOICE-GUIDE.md`, `notes/copy-language.md`, and the shared vocabulary module. Avoid robotic analytics language.
12. Use `All-time`, `recent matches`, `match window`, or a named season/act. Avoid unexplained terms such as `slice`, `global`, `blocker`, `signal`, or `first contact` in player-facing copy.
13. Advice must use supporting profile evidence and should explain both what the coach sees and how the player should approach it.
14. Preserve unrelated user changes and old untracked debug artifacts unless a task explicitly scopes cleanup.

## 5. Major Shipped Systems

### Navigation and Mobile Shell

- Mobile header row 1 contains RR widgets.
- Mobile header row 2 contains avatar, labeled Ask Coach, and settings.
- Bottom navigation is page navigation only.
- There are five top-level pages: Home, Logging, Stats, Insights, and Library.
- Library is a deliberate exception to the older four-tab rule. Do not infer that a sixth tab is automatically acceptable.
- Page swipe and button-triggered page transitions have real slide previews. Child swipe structures should take priority over page navigation.

### Henrik and Player Data

- Worker-backed Henrik proxy is live and secret-protected.
- Production health endpoint previously verified: `https://www.rankedcoach.gg/api/henrik/health` returns configured/healthy.
- Profiles sync retained Competitive matches, account identity by PUUID, season labels, rank, and sparse verified MMR snapshots.
- Historical backfill requests up to 100 retained matches per pass and resumes via stored state where applicable.
- For GoopyWetDiaper, Henrik retention begins on 2024-05-28. This is a provider retention boundary, not the player account's true lifetime.
- Riot ended Episode naming after Episode 9. Internal later episode identifiers render as Season 2025/2026 labels.
- Historical RR is sparse. Only verified Henrik MMR snapshots are charted; missing RR is never estimated from match result.
- Imported Henrik games are objective match records, not user-authored coaching logs. Logs exist only when users feed qualitative information into RankedCoach. Synced games can receive blank/editable log content.

### Formula and Coaching Layer

- The known validation match is `145aceda-cda0-47ce-a177-0eae09a9fd06` for PUUID `fdc507ce-cd41-5236-8962-fce4ac427e12`.
- Exact expected KAST: 17/22 rounds, 77%, including three trade-window saves.
- Round data projects into attack/defense, economy, opening-event, KAST, damage, and role context.
- Shipped round metrics include clutch/closer recognition, discipline flags, real multi-kills/aces, role-aware trades given/received, and damage consistency.
- Home, Stats, Insights, season switching, agent/map/weapon breakdowns, rank badges, and RR surfaces consume retained Henrik data.
- A governed 30-rule first slice from `docs/COACHING-LANGUAGE-RULES.md` is wired through existing sample-size/confidence governance.

### Profiles and Themes

- Profile customization includes avatar, banners, borders, border animation, accents, ambient motion, and accessibility controls.
- Premium themes are QA-only for `michealdoolittle@gmail.com` through `PREMIUM_THEME_QA_EMAILS` and `isPremiumThemeQaUser()` in `app.js`.
- Radiant Focus and Omen Night appear in the Theme Selector only for that QA account. Guests and other users have zero premium-theme DOM trace.
- Premium visual motion is mobile-only; desktop retains the color treatment.

### Daily Training

- Logging exposes a warm-up menu below Map on mobile and desktop.
- Eleven pre-ranked drills support themed selection feedback and a four-drill cap.
- Post-game aim training is a separate flow.
- Feed fire/crosshair actions sit beside RR, show `Edit`, and reopen date-specific training editors.
- Ranked, warm-up, and weekly aim-training streak logic is guarded and persisted.
- Profile Rating contains a theme-aware 30-day ranked activity heatmap.

### Gamesense Library

- Library is a full desktop/mobile page, not an Insights subview.
- It has Maps, Agents, and Weapons topic dossiers.
- The current catalog contains Bind, Breeze, and Split; six agents; sixteen weapons; agent abilities; role notes; tactical maps; plant-hot-spot layers; map-fit data; current comp references; and map weapon suggestions.
- Library data is explicitly active-season/current-sample information, not historical profile data.
- Clicking the active Library nav button returns to the Library topic landing page.
- Stats/Insights contextual entry points were previously added where relevant.

## 6. Latest Completed Batch: Library Mobile Refinement

Commit `57b7bad` completed the most recent manual-review list.

### Landing and Gallery Layout

- Removed the entire Reference Room section.
- Mobile topic category numbers are centered above the category title.
- Map-gallery cards render the map name only over the map art.
- Mobile agent cards now place the index top-right, agent art bottom-left at card height, and agent name bottom-right. Extra role/map copy is hidden on the compact card.
- Mobile weapon-category cards place the index top-right and center/contain the weapon art.
- Added `public/assets/library/weapons-dossier-v2.webp`, a more colorful arsenal overview image.

### Map Interaction

- Map viewport, controls, and view tabs now own touch gestures before page swipe logic.
- Mobile supports drag and two-pointer pinch zoom; desktop supports drag/pan.
- Plant-hot-spot markers use a red location dot plus offset numbered badge so the exact plant location remains visible.
- Marker geometry is tested for visibility and non-overlap at Fit zoom.
- Split now uses `public/assets/library/maps/split-layout-trn.png` in the correct landscape orientation, with transformed callout and plant coordinates.
- Mobile map headers place Back above/right, patch on the right of the title row, and map name bottom-left.
- Selected role notes have their own collapsible result panel in addition to the role selector.
- Selecting a top-comp agent on mobile automatically scrolls the explanation into view.

### Current Data and Weapon Guidance

- Current agent/map rates use Tracker Network's rolling competitive insights.
- Weapon evidence uses Blitz weapon statistics.
- No reliable source found publishes measured five-agent composition win rates. The UI therefore treats listed compositions as tactical references assembled from current map leaders and does not relabel unsupported OP.GG figures as another provider's data.
- Weapon suggestions are reduced to one rifle, one sniper/niche option, and one eco option per map. Categories do not duplicate.
- Each suggestion uses weapon art, a concise strength tag, evidence, location context, and a collapsible detail body.
- Bind is honestly marked unavailable where the current rolling map sample does not provide data.

Reference URLs used in the last pass:

- `https://tracker.gg/valorant/insights/agents`
- `https://tracker.gg/valorant/insights/maps`
- `https://blitz.gg/valorant/stats/weapons`
- `https://tracker.gg/valorant/db/maps/split`

These are live/current sources and can go stale. Re-verify before changing displayed rates or patch labels.

### Motion and Modals

- Library internal navigation uses directional View Transitions when supported, with a transform/opacity fallback.
- The previous mobile child animation that caused a sharp shake/judder was disabled.
- Forward, backward, and replacement transitions now have distinct directional motion.
- Shared lens/agent/profile/auth modal overlays animate backdrop blur from focused background to `blur(12px)`, then release blur while closing.
- Modal cards pull downward and fade on close. Lens close buttons remain removed; click-away is the intended exit interaction where supported.

### Files Changed in `57b7bad`

- `public/app.css`
- `public/app.js`
- `public/index.html`
- `public/library/gamesense-library.css`
- `public/library/gamesense-library.js`
- `public/library/gamesense-maps.js`
- `public/library/gamesense-reference.js`
- `public/assets/library/maps/split-layout-trn.png`
- `public/assets/library/weapons-dossier-v2.webp`
- `testing/visual-audit/gamesense-library.test.js`
- `testing/visual-audit/rank-goal-stats-qol.test.js`

## 7. Validation Evidence at Handoff

All of the following passed immediately before commit/deploy:

```powershell
node --check public/app.js
node --check public/library/gamesense-library.js
node --check public/library/gamesense-maps.js
node --check public/library/gamesense-reference.js
git diff --check

cd testing/visual-audit
node gamesense-library.test.js
node rank-goal-stats-qol.test.js
node daily-warmup.test.js
node audit.js
```

Focused Library coverage includes:

- Reference Room removal and map-name-only gallery cards.
- Role-note secondary collapse behavior.
- Tracker disclosure and removal of unsupported comp metrics.
- Unique weapon categories, images, and expandable details.
- Correct Split asset/orientation.
- Current agent-rate source labeling.
- Mobile topic-number, agent-card, weapon-card, header, and detail geometry.
- Touch panning without page navigation.
- Synthetic two-pointer pinch zoom.
- Plant-marker visibility/non-overlap at Fit.
- Mobile comp-agent auto-scroll.
- Animated active-Library reset.

The full `audit.js` run took about 378 seconds and passed:

- Mobile and desktop.
- Blank and demo states.
- Home, Logging, Stats, Insights, and Library.
- Profile dropdown/switcher/rating, Edit Profile theme, Ask Coach, and Bug Report modals.
- Zero console issues.
- Zero horizontal overflow on every audited surface.

Production verification after deploy confirmed:

```text
CacheKeyPresent      : True
ReferenceRoomRemoved : True
TrackerSourcePresent : True
WeaponDetailsPresent : True
```

## 8. Known Limitations and Deliberately Parked Work

- Henrik retained history is not Riot lifetime history. Do not promise Episode 1-forward data from Henrik when the provider does not retain it.
- Historical RR remains sparse and must not be fabricated.
- Current agent/map/weapon data requires periodic freshness review. The patch and sample language must remain visible and honest.
- Five-agent composition win rates are not currently backed by a reliable source in the app. Keep tactical compositions clearly framed as references unless a verified provider supplies measured composition data.
- The proactive Gamesense suggestion engine is intentionally unbuilt. Future idea: connect identified player weaknesses to recommended Library entries after usage validates the Library format.
- Full Home card drag-reordering is parked. Home uses static HTML; the prior realistic first step was fixed show/hide toggles.
- Theme Builder extraction is parked. The launch-locked code still closes over many app-local dependencies and needs an explicit interface before extraction.
- Official Riot RSO remains future work. Do not remove the dormant RSO authorization scaffold merely because Henrik is current.
- Some old note bodies are historical and contradict their own newer status lines. In particular:
  - `docs/CLOUDFLARE-DEPLOY.md` still contains an old missing-Worker-routing section; current `worker/index.js` proves it is resolved.
  - `notes/gamesense-library-2026-07-11.md` has an older OP.GG comp-data status paragraph; commit `57b7bad` supersedes it with Tracker map leaders and no unsupported five-agent win-rate claims.
  - `notes/mobile-bug-fixes-2026-07-08.md` preserves old live-only repros. Reproduce against the current cache key before changing code.

## 9. How to Resume in a New Session

Run these first:

```powershell
Set-Location 'C:\Users\Micheal Doolittle\Desktop\Rankedcoach-main-sync'
git status --short
git log -5 --oneline --decorate
git rev-parse HEAD
git rev-parse origin/main
rg -n '20260713-library-mobile-refine-01' public/index.html
```

Then:

1. Read this handoff fully.
2. Read the newest status blocks in the directive note relevant to the user's next request; do not blindly execute old body text already marked shipped, superseded, or parked.
3. Confirm the user is testing the current cache key before chasing a supposedly still-broken visual issue.
4. Reproduce any manual-review bug at the exact viewport and state first. Mobile screenshots commonly include the browser chrome, so distinguish CSS viewport size from physical screenshot size.
5. Keep child gesture ownership ahead of page swipe ownership. For Library map bugs, start with `shouldAllowMobilePageSwipeStart()` in `app.js` and the map gesture handlers in `gamesense-library.js`.
6. For Library layout/motion bugs, inspect the final refinement block near the end of `gamesense-library.css`; later source-order rules intentionally win over older styles.
7. Run the focused test for the changed surface, inspect generated screenshots, then run the full passthrough before deploying.
8. Commit only intentional source/tests/assets, push `main`, deploy through the notify wrapper, verify production cache/content, and send the specific ntfy completion message.

## 10. Most Likely Next Work

There was no unfinished code task at the moment of handoff. The latest user batch was implemented, committed, pushed, deployed, smoke-checked, and notified. The next session should begin from Michael's next manual mobile/desktop review rather than inventing additional scope.

If no new manual issue is supplied, the safest queued work is one of:

- Refresh/validate active-season Library data and patch labels.
- Continue coaching-language rule coverage beyond the governed first 30 rules.
- Scope the proactive weakness-to-Library recommendation engine without building it prematurely.
- Design a dependency interface for the parked Theme Builder extraction.
- Revisit Home widget show/hide controls separately from full drag-reordering.

Do not start one of these merely because it is listed here if Michael gives a different priority.
