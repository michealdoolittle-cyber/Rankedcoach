# Beta Demo/Preview Data Mode — Fix Phase 1 Sync Dependency (2026-08-20)

**Recommended Codex settings: GPT-5.6 Terra · High reasoning · Fast speed.**

**Status: ready to build now, independent of any other open directive.**

## The bug

Confirmed by grepping `beta/public/js` for any demo/fixture/mock data path: **there isn't one.** Every page — Play, Review, Stats, Learn, Library, Settings previews — only renders real content (charts, Insights, Focus, RR Trend, scoreboards, etc.) when a real Henrik sync has populated the player model. With no synced account, every page shows an empty/"please sync" state.

This violates the Phase 1 rule established at the start of this build: **"100% visual and flow fidelity using any data including static/fake placeholders — no real computation required."** It also means neither Michael nor Claude can screenshot a page's actual populated/healthy state to compare against the concept art without going through a live Riot account sync first, every single time — which is slow and makes the one-page-at-a-time visual review process (the new workflow as of 2026-08-20) much harder than it needs to be.

## The fix

Build one static fixture dataset representing a realistic, fully-populated player profile — matches, MMR/RR history, Insights, active Focus + Focus Queue, Reflection Matches, Stats aggregates (weapons/agents/maps), Library sample items (lineups/routines/notes/collections/watch-later) — and wire it into the app so every page can render its fully-populated "healthy" state on demand, with no live account required.

**Activation:** a `?demo=1` URL flag (or an equivalent dev-facing toggle — Codex's choice, whatever's cleanest given the current routing) that loads the fixture dataset through **the exact same model/render pipeline real synced data already uses.** This is the one non-negotiable constraint: do not build a second, parallel set of demo-only components or hardcoded demo markup. If the fixture data doesn't flow through the same `buildPlayerModel()` / render functions as real Henrik data, the demo will drift from reality the same way the beta already drifted from the concept art — defeats the purpose.

**Content realism:** the fixture values don't need to be computed by real coaching logic — static/scripted numbers are fine per the Phase 1 rule. But they should be *plausible* (matching the kind of values shown across the concept art — e.g., an Ascendant-tier player with realistic K/D, win rate, RR history, a couple of real-sounding Insights and a Focus Queue with 3-4 items) so that visual QA against the concept art isn't confused by obviously-fake placeholder text like "Lorem ipsum" or "Value 1."

## Scope — every page/tab that currently depends on live sync data

- [ ] Play — Today's Focus, Improvement Timeline (if it stays on Play), Loadout (idle/generated), Compass, RR Card, RR Trend, Top Insight.
- [ ] Review — Performance, Timeline, Insights (list + detail), Reflection Matches, All Matches, Stats.
- [ ] Learn — Recommended/Recently Viewed personalization (category indexes and lesson content itself aren't player-data-dependent, but anything scoped "for you" is).
- [ ] Library — Lineups/Routines/Notes/Collections/Watch Later counts and lists, Dashboard Overview metric strip.
- [ ] Settings — Pipeline's live preview panel, Visual Settings' live dashboard preview.
- [ ] In-Game, Log Match, Focus Queue — should render their generated/populated states, not just idle/empty.

## What this is not

This is not a request to build real coaching logic, real Insight generation, or a real Library data model — those stay exactly as scoped (or not yet scoped) in the prior directives. This is purely a visual-QA unblocker: make every "healthy, populated" state reachable without a live Riot account, using static data through the real rendering path.

## How this will be reviewed

1. Load every page listed above with `?demo=1` (or the chosen activation method) and confirm it renders a fully populated, realistic-looking state with zero live Henrik sync.
2. Confirm there is exactly one rendering code path per page — grep for any demo-only branch that duplicates markup instead of reusing the real render functions with fixture data as input.
3. Screenshot every page in this state at 1920×1080 — these become the baseline screenshots for the one-page-at-a-time visual conformance review starting with Play.
