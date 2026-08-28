# Production App Issues — Round 1

**Recommended Codex settings: GPT-5.6 Terra · Extra High reasoning · Fast speed.** Most items below are fully diagnosed with exact file:line, but this is being run as one pass covering everything — including Part 3's from-scratch feature builds (map zoom, twinkling stars) and the dummy-avatar task's open-ended pieces (guest-session wiring not yet located, SVG restyling) — so the setting is picked for the hardest item in the batch, not the average.

**Status:** New directive, 2026-08-28. Not started. All findings below verified by direct code read against `Desktop/rankedcoach-production` — not assumed.

**Repo reminder:** this work happens in `Desktop/rankedcoach-production`, a separate repo from where this note lives. Feature branch → PR → merge on GitHub, never push straight to `main`. Set commit identity to `Michael Doolittle <245895280+michealdoolittle-cyber@users.noreply.github.com>` before committing — this repo has no git config and will silently pick up a work email otherwise. Full detail in `notes/production-lovable-repo-and-sync-pipeline-2026-08-28.md`, same folder as this file.

---

## Part 1 — Quick, fully-specified fixes

### 1. Start-match button not full width
`src/components/rc/start-match-button.tsx:31-39` — the `<button>` has no width class in its `className` chain. Used bare at `src/routes/index.tsx:241` inside a non-flex `<div className="space-y-4">`, so it shrinks to content width. **Fix:** add `w-full` to the button's own class list.

### 2. Compass card blank space; RR Trend should take that width instead
`src/routes/index.tsx:246-317` — grid `grid gap-4 lg:grid-cols-3`. The "Improvement metrics" `Panel` (`lg:col-span-2`, lines 246-313) contains `RrTrendChart` embedded at lines 309-312; `CompassPanel` (1 column, line 316) sits beside it. `Panel` is a plain `<section>` with default grid `align-items: stretch`, so Compass's shorter card gets force-stretched to match the taller Improvement Metrics/RR-Trend panel, leaving blank space at Compass's bottom. **Fix:** pull the `RrTrendChart` block (lines 309-312) out of the Improvement Metrics `Panel` into its own full-width row below the grid, so Compass only stretches to match the now-shorter Improvement Metrics panel next to it.

### 3. Redundant map tooltip on Recent Matches hover
`src/components/rc/game-icons.tsx:195-217` — `MapChip` wraps its thumbnail + label in an `RcTooltip` (title/body "Map played in this match."). Used at `src/routes/index.tsx:358`. The image and map name are already visible without hovering. **Fix:** remove the `RcTooltip` wrapper from `MapChip` (or add a prop to disable it where used in Recent Matches specifically, if `MapChip` is reused elsewhere where the tooltip does add value — check other call sites first).

### 5. "Finished playing?" panel in the wrong column
`src/routes/play/in-game.tsx:90-386` — the two-column grid has exactly two intended columns (left `<div className="space-y-4">`, lines 91-259; right `<Panel title="Quick reference">`, lines 262-383) but `<MatchCompletePanel />` (from `src/components/rc/match-complete.tsx:19-84`, titled "Finished playing?") sits as a **bare third child** at line 385, outside both column containers. CSS Grid's row-major auto-placement drops it into row 2 under the left column instead of pairing with the right column. **Fix:** move `<MatchCompletePanel />` inside the right-column container (wrap "Quick reference" `Panel` + `MatchCompletePanel` in a shared `space-y-4` div, matching the left column's structure).

### 6. Match History row: only the ">" icon opens details
`src/routes/review/reflections.tsx` — `SortableTable` columns (lines 55-122) render plain text/spans except the last "open" column (107-121), which alone wraps a `<Link to="/review/matches/$id">` around the chevron. The `<tr>` in `src/components/rc/filters.tsx:260` has `hover:bg-elevated` styling implying clickability but no click handler. **Fix:** wrap the entire row in the same pattern already used elsewhere in this app — `src/routes/index.tsx:338-369` (Home Recent Matches), `src/routes/review/index.tsx:206-227` (Review Overview Recent Matches), and `match-history-dialog.tsx:45-67` all wrap the whole row in one `<Link>`. Reuse that pattern here instead of inventing a new one.

### 7. Icon/image "pop-in" on load
Confirmed pattern: `RankBadge`, `AgentAvatar`, `MapThumb`, `WeaponIcon`, `MapChip` (all in `src/components/rc/game-icons.tsx:41-46, 108-114, 149-155, 180-190, 209-211`) use `loading="lazy"` unconditionally, including above-the-fold instances, with no explicit `width`/`height` attributes (sizing is Tailwind-class-only) and no `fetchPriority`/`<link rel="preload">` anywhere in the app. The one existing good pattern is `src/components/rc/agent-rotator.tsx:65` — `loading={i === 0 ? "eager" : "lazy"}`. **Fix:** for the small set of genuinely above-the-fold instances (current rank badge, primary agent avatar on Home/Play dashboard, current match's map chip), switch to `loading="eager"` following the `agent-rotator.tsx` conditional pattern, and add explicit `width`/`height` attributes matching their rendered size to prevent layout shift while loading. Don't blanket-change every image to eager — only the ones visible without scrolling on first paint.

### 9a. Learn > Maps: hide 0% top agent instead of showing "0%"
`src/routes/learn/maps/$slug.tsx:102-104` computes `bestAgent`; rendered unconditionally at lines 315-321 printing `pctText(bestAgent.winRate, 0)`. **Fix:** wrap the render in a check — when `bestAgent.winRate === 0` (or `bestAgent` is otherwise not meaningful), omit the line entirely rather than showing "0%".

### 9c. Learn > Maps: label stats as "Top Agent All-Time" / "Top Guns All-Time"
`src/lib/subject-stats.functions.ts:59-64` (`getSubjectStats`) already queries the last 500 matches with **no season/act filter** — it's already effectively all-time data. The panel ("Your record here", `$slug.tsx:295-349`) just never says so. **Fix:** this is a copy-only change — update the labels to explicitly read "Top Agent All-Time" and "Top Guns All-Time". No data-layer change needed for this part.

### 12. Weapon damage-range selector doesn't visibly change
`src/routes/learn/weapons.tsx:152-219`. Root cause: `bodyDamageAt`'s range lookup (lines 152-158) is `ranges.find(r => meters >= r.rangeStartMeters && meters <= r.rangeEndMeters)` — inclusive on both ends. When two adjacent ranges share a boundary (e.g. 0-30m and 30-50m), clicking "30m" satisfies the first range's inclusive upper bound too, and `Array.find` returns the first match — so "30m" silently shows the same numbers as "0m". `stops` (lines 162-169) also derives one button per distinct start/end value in the data, producing 3 stops even though the real Riot data only has 2 meaningfully distinct ranges (0-30m, 30m+), matching what you're seeing on the Sheriff specifically. **Fix:** make the range lookup exclusive on the upper bound except for the last range (`meters >= start && meters < end`, with the final range using `<=` or unbounded), and simplify `stops` generation to produce exactly two selector positions (0-30m, 30m+) matching Riot's actual data shape rather than one button per distinct boundary value.

### 13. Weapon skin color variants (chromas) never show
UI is already fully built — `SkinPreviewDialog` (`src/routes/learn/weapons.tsx:402-482`) has a working chroma-swatch picker (lines 456-474) gated on `chromaUrls.length > 1`. Root cause is upstream data harvesting: `src/lib/content.server.ts:255-260, 273-274` builds both `level_urls` and `chroma_urls` by mapping only `.streamedVideo` and dropping any entry without one. Most skin chromas are static color swatches with no `streamedVideo` — they have `displayIcon`/`fullRender` instead (the `ApiWeapon` type at line 110 already declares these fields, just never uses them). **Fix:** in `content.server.ts`, fall back to `displayIcon`/`fullRender` when `.streamedVideo` is absent, for both `level_urls` and `chroma_urls`.

### 20. Supporter icon
`src/routes/settings/billing.tsx:213-215` — currently `{planId === "pro" ? <Crown/> : <Sparkles/>}`, so "Supporter" shares the generic `Sparkles` icon with "Basic." **Fix:** add a third branch for `planId === "supporter"` using lucide-react's `HandCoins` icon (hand holding a coin — already exists in the lucide set, no new asset needed). Check `src/lib/plans.ts:39-52` for the exact `"supporter"` plan id to branch on.

### 11. Agent showcase clips — port from beta, real source confirmed
Beta (`Rankedcoach-main-sync`, this repo) has this fully live already. `public/library/gamesense-official-media.js` (806 lines, generated) holds ~121 ability clip entries across 29 agents, each an `.mp4` hosted on **Riot's own CDN** — scraped via `scripts/sync-official-agent-media.mjs`, which pulls `__NEXT_DATA__` from Riot's live `playvalorant.com/en-us/agents/{slug}/` pages and matches ability titles to clips. Rendered via `renderAbilityVideo()`/`renderAbilityDetail()` (`public/library/gamesense-library.js:3459-3502`) as a native `<video>` tag, with a YouTube-iframe fallback for a small number of legacy entries. **Task:** port `scripts/sync-official-agent-media.mjs` into `rankedcoach-production` (or run it once and port the generated data if a one-time seed is simpler than standing up the scraper there), and extend `content.server.ts`'s `syncValorantContent` to also write `video_url`/`video_title` onto `game_abilities` (it currently only writes `slot, display_name, description, icon_url, ordinal`). Production's `learn/agents/$slug.tsx:149-207` already renders `video_url` correctly the moment it's populated — no UI change needed, this is a data-pipeline-only task.

### 4. Unranked/placement state — port from beta, correcting the original ask
Beta has this fully live already, but **not as a numeric countdown** — confirmed no "games until ranked" field exists anywhere (HenrikDev/Riot don't expose a placement-games-remaining count; beta's own `notes/placement-match-handling-2026-07-13.md` explicitly rejected hardcoding one). What beta actually has: a three-state rank display — `getRankDisplayStatus()` (`public/app.js:26464-26494`) + `isPlacementRankedMatch()` (`app.js:51733-51736`, checks Riot's per-match `tier.id === 0` signal) — showing "Placements in progress" / "Not yet placed" state text instead of RR when a player has no meaningful rank snapshot yet. Live, wired into the nav rank bar and dashboard (confirmed writing real DOM nodes, not dead code) at `app.js:7888, 10103, 11194, 25253, 55910, 58053, 58123`. **Task:** port this state logic into production wherever RR currently renders unconditionally (`src/routes/index.tsx:188-191`, `src/routes/lookup.tsx:148-153` per the earlier research pass) — replace with the same three-state label beta uses, worded to match production's voice. Also add an "Unranked"/"Not yet placed" icon to `rankIcons` in `src/lib/game-assets.ts:53-79`, which currently has no entry for this state at all (falls through to `RankBadge` rendering nothing).

### Training-dummy avatar — beta has a related asset, but it needs real avatar work
Beta has `public/assets/library/target-dummy.svg` — a real, live SVG (front-facing head/torso/legs silhouette, used for weapon damage-zone visualization in the Gamesense Library, `gamesense-library.js:3659`). It's not a face and wasn't built as an avatar, but it's a legitimate starting asset rather than nothing. Per your note, this should become both a new agent-gallery icon option and the default avatar for guest/unauthenticated logins. **Task:** port `target-dummy.svg` into production's assets, restyle/crop it into an avatar-appropriate icon consistent with `AgentAvatar`'s existing rendering (`src/components/rc/game-icons.tsx`), add it as a new entry in `agentRoster` (`src/lib/user-settings.ts:194`) alongside the real agents, and set it as the default `avatar_agent` specifically for guest sessions (find wherever guest/unauthenticated session defaults are initialized) — real signed-up users should still default to choosing an actual agent, not this.

---

## Part 2 — Medium complexity, needs a design decision but is pure code

### 8. Player Lookup: no season/all-time indicator
`src/lib/lookup.functions.ts:44-152` (`lookupPlayer`) fetches with no season/act parameter or label; `src/routes/lookup.tsx` never renders one. The app's existing season/all-time UI pattern is `src/hooks/use-season.ts` (`useSeasonSelection`) + the `Act` `FilterSelect` used in `src/routes/review/index.tsx:44, 68-80` — but that's tied to the signed-in user's own synced `data.seasons`, not an arbitrary looked-up player, so it can only be modeled after, not reused directly. **Task:** add a visible "This season" / "All time" label (minimum ask), and — since Michael asked for both to be selectable — a toggle that re-fetches with a season filter when HenrikDev's API supports one. Confirm what season filter, if any, `provider.fetchMatches`/`fetchMmr` actually accept before building the toggle; if the provider can't filter by season for arbitrary looked-up players, ship the label only and note the toggle as blocked on provider support.

### 9b. Learn > Maps: top guns should show K/D, not raw kill count
`src/routes/learn/maps/$slug.tsx:328-341` renders `{w.kills} kills`. Root cause: `subject-stats.functions.ts:154-158, 182-185` (`weaponCounts`/`topWeapons`) only tallies kills — deaths-per-weapon isn't aggregated anywhere yet. **Task:** add a deaths-per-weapon aggregation alongside the existing kills tally in `subject-stats.functions.ts`, then change the Maps panel to render a K/D ratio (or kill-conversion rate, whichever the existing K/D formatting helper elsewhere in the app already uses — check `coaching-rules.ts`/`round-metrics.ts` for the established K/D display convention and match it) instead of the raw kill count.

### 16. Unique usernames + username as a sign-in method
Partially built: `profiles.username` already has a case-insensitive unique index (`supabase/migrations/20260825174439_add_username_and_notification_channels.sql:3-4`), and `src/lib/account.functions.ts:12-34` (`updateUsername`) already does an `.ilike` pre-check plus handles the DB unique-constraint violation — but it's only exposed post-signup via `UsernamePanel` in `src/routes/account/index.tsx:33-64`. `src/routes/auth.tsx:41-63` sign-up/sign-in only uses email+password (`supabase.auth.signUp`/`signInWithPassword`) — no username field at signup, and no "resolve email from username, then sign in" path (Supabase Auth has no native username login). **Task:**
- Add a username field to the sign-up flow, reusing `account.functions.ts`'s existing uniqueness-check pattern rather than writing a new one.
- For sign-in-by-username: since Supabase Auth requires an email, add a server-side lookup (username → email via the `profiles` table) before calling `signInWithPassword`, and be careful this lookup doesn't leak whether a username exists to an unauthenticated caller in a way that enables enumeration attacks — rate-limit or generic-error this the same way a normal "forgot password" flow avoids confirming whether an email exists.

---

## Part 3 — New builds (larger scope, use the Extra High reasoning setting)

### 10. Map zoom in Learn > Maps
No zoom/pan library exists anywhere in `package.json`; `src/components/rc/map-canvas.tsx` renders a static `<img>` with callout markers only, no interaction. This is fully unbuilt. **Task:** add pinch/scroll-to-zoom and drag-to-pan on the Learn > Maps detail map image. Prefer a small, well-maintained library over a hand-rolled implementation given the callout-marker overlay already positioned on the image needs to zoom/pan in sync with it — check what's compatible with the existing marker positioning approach in `map-canvas.tsx` before picking a library.

### 17. Twinkling stars instead of static starfield
`src/hooks/use-appearance-settings.ts:2-14` — starry backgrounds (`obsidian-void-starfield.jpg` etc.) are static JPGs set as a CSS custom property, consumed at `src/styles.css:483-496` as a static `background-image`. No canvas/SVG/JS star layer or `@keyframes` exists anywhere. This is the app's first animated (non-static) background, per Michael — treat it as a new, reusable pattern other backgrounds may follow later, not a one-off hack. **Task:** build a lightweight twinkle-star overlay (CSS-only `@keyframes` opacity/scale animation on a small number of absolutely-positioned star elements, or a simple canvas layer if performance requires it) that layers on top of the existing static background images rather than replacing them — keep it subtle and low-CPU since it'll run continuously on every page using a starry theme.

---

## Part 4 — Content/copy fixes

### 22. About/Legal page: stale date and incomplete paragraph
`src/routes/help/about.tsx:21-32`. Current paragraph (lines 22-26): *"Ranked Coach turns match data into one clear habit to fix at a time. Instead of dumping fifty stats on you, it picks the single focus with the highest expected impact, keeps it in front of you while you play, and measures whether you actually held it."* Missing: clear stats display, goals derived from pulled match data, user customization, accountability via reflection logs/tracking. `Updated` `StatCard` (line 30) is hardcoded to `"Jun 2025"`; `Version`/`Build` (lines 28-29) are also hardcoded (`"1.4.2"`, `"beta"` — note "beta" here refers to a build-stage label baked into this page's copy, unrelated to the beta.rankedcoach.gg app; worth double-checking that string is still accurate for the live production build before leaving it). **Task:** rewrite the paragraph to cover: clear, straightforward stats; clearly defined goals derived from real pulled match data; user customization; accountability through reflection logs and tracking — plus anything else that reads as a real gap once you're looking at the current app holistically, not just this list. Update the `Updated` date to the actual current date. Confirm whether `Version`/`Build` should also move off hardcoded strings while in there (flag if unclear rather than guessing a versioning scheme).

---

## Not included in this directive — checked, doesn't hold up

- **Item 21 (news/updates from beta):** checked directly — beta does **not** have a real changelog/updates page either. What exists: a marketing tagline on the Gamesense Library header ("Keep yourself up to date with the latest news..."), a "News" tag used to classify YouTube videos in the Featured Playlist feature, cosmetic loading-screen toast text ("New Patch Notes Uploading"), and an internal dev-ops patch-detection alert (ntfy notification to the dev team, not user-facing). None of these is structured, user-facing changelog content. `notes/` (228 files) is genuinely just engineering session logs. This still needs a human curation pass — picking real milestones and writing new user-facing copy — in either app, not a port from one to the other.

## Not code — verification/setup checklists

### AdSense (Item 15)
Wiring is fully built and env-driven (`VITE_ADSENSE_CLIENT_ID`, read in `ad-slot.tsx`/`use-adsense-script.ts`); `public/ads.txt` already has the real ID. To go live:
1. Set `VITE_ADSENSE_CLIENT_ID=ca-pub-1812435924913382` in production's environment (note the `ca-` prefix Google requires — the raw `pub-1812435924913382` alone won't work). This is a Lovable/Supabase dashboard entry, not a code change.
2. Confirm `ads.txt` is actually reachable at `https://rankedcoach.gg/ads.txt` (a plain browser visit, not an AI query).
3. After redeploying with the env var set, load a real page with an ad slot and check DevTools → Network for a successful (200) request to `pagead2.googlesyndication.com` — that confirms the script is loading, separate from whether Google is actually serving a paid ad yet.
4. New AdSense publisher IDs commonly show blank/PSA placeholder ads for 24-48+ hours while Google reviews the site, even once everything above is correctly wired — don't treat a blank slot on day one as a bug.

### Donate link (Item 19)
Already built (`src/routes/settings/billing.tsx:18-19, 169-189`), reads `VITE_DONATE_URL`, falls back to a mailto link when unset.
1. First confirm a real donation-processing account/URL actually exists (Stripe payment link, Ko-fi, PayPal.me, Patreon, etc.) — nothing in the codebase suggests one is set up yet. If not, that's a business/account-setup step before this is a config task at all.
2. Once a URL exists, set `VITE_DONATE_URL` in production's environment.
3. If you also want it surfaced beyond Settings → Billing (nav/footer, not just buried in billing settings), that's a small separate Codex addition — not included in this directive, ask if wanted.

### Email/SMS notifications (Item 14) — includes one real gap, not just a check
1. **Password reset:** trigger a real "forgot password" flow on production and confirm the email arrives (check spam). This uses Supabase Auth's default email sender, which has a low rate limit meant for testing, not production traffic. Check the Supabase dashboard's Auth → Email settings for whether a custom SMTP provider (Resend, Postmark, SendGrid, etc.) is already configured — if it's still on Supabase's default, that's worth fixing before relying on this at real user volume.
2. **Billing:** trigger a real (test-mode) Paddle event and confirm Paddle's own receipt email arrives — entirely Paddle's system, nothing in this codebase to check.
3. **SMS has no implementation at all** — confirmed no Twilio or any SMS provider integration anywhere in the code, despite `notify_channel_text`/`phone_number` already existing as fields in the `profiles` schema. There's nothing to verify because nothing sends anything today. If SMS is actually wanted, that's new work — pick a provider, wire it server-side, build the dispatch logic — worth its own directive, not a config check.
4. **Separate, bigger gap worth remembering:** the notification *preference* toggles themselves (new insight, daily focus, routine streaks, product updates) have zero backend dispatch of any kind right now, including email — flipping them on in Settings currently does nothing. That's a real feature to scope later if you want those to actually fire, distinct from just fixing SMTP.
