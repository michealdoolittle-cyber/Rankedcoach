# Gamesense Library — Research + Full Feature Directive

**Status:** Content written and committed 2026-07-11 (`public/library/gamesense-maps.js` — real, sourced Bind/Breeze/Split entries). UI/wiring not yet built — that's this directive. Michael pre-approved this structure directly; build against it. Two asks in this pass: (1) a small addition to the just-shipped Daily Warm-Up Check — info tags/expanded detail so players understand exactly what's being asked of them; (2) a much larger new feature — a browsable reference library (weapon/map/agent) covering meta team comps, pro strats, lineup knowledge, and direct tips from named creators (Woohoojin, Dopai), none of which the app currently has any of.

## What this looks like as an end result — concrete walkthrough

A new nav entry (working name "Gamesense," final label is a copy-layer decision, follow `notes/copy-language.md` conventions) opens a topic picker: three cards — **Maps**, **Agents**, **Weapons**. Tapping Maps shows the map grid (Bind, Breeze, Split in the first slice, same visual pattern as the existing map-select UI elsewhere in the app — reuse, don't reinvent). Tapping a map opens a detail page with this exact structure, matching the content already written in `public/library/gamesense-maps.js`:

- A header with the map name and a small "via Woohoojin" (or whichever source) attribution line right under it — visible before the player reads any content, not buried at the bottom.
- Two columns or stacked sections: **Defense** and **Attack**, each a short bulleted list (2-3 real points, e.g. Bind's "shower control is the priority defensive anchor" / "double up to contest the weak-side lane") — not paragraphs, scannable like the rest of the app's card language.
- A **Controller notes** callout — since smoke/utility placement is consistently the most specific, actionable content in the sourced material (e.g. Breeze's "smoke Mid Nest to remove the Operator angle").
- A **Current Meta Comp** card — the five agents, composition breakdown (roles), win rate, and a visible patch tag ("as of Patch 12.10") so it reads as time-bound data, not a permanent claim.
- A **Find Lineups** section at the bottom — outbound link buttons to LineupsValorant/UpForge for that specific map, same visual treatment as the existing Aim Lab/KovaaK's buttons on the post-game training card. This is the outsourced part — RankedCoach sends players to the databases that already do this well, never tries to host its own lineup screenshots.

Agents and Weapons work the same navigational pattern (topic grid → detail page), but **their content already exists** — see "Reuse existing content" below, don't write new agent/weapon copy from scratch.

Every page in this feature carries the same visible sourcing discipline: named attribution up top, patch/date tags on anything time-bound, outbound links instead of attempted rehosting. That consistency is what makes the "no direct info coming from esports/pro players" gap Michael flagged actually get closed credibly, rather than the app inventing generic advice and passing it off as expert-sourced.

---

## Part 1 — Info tags on the warm-up drill picker

Quick addition on top of the already-committed proven-method-attribution fix. Each drill card currently has a one-line description ("Hold the crosshair on a moving head before taking the shot") — add an info affordance (tap/click a small "?" icon on the card, opens an inline expansion or a lightweight popover, doesn't need a full modal-on-modal) with a longer, step-by-step version of the same drill, plus the source attribution from the prior fix.

**Be upfront about a real constraint:** actual gameplay screenshots or GIFs demonstrating each drill aren't something Codex (or Claude) can produce — that requires either capturing real Valorant footage or licensing existing creator content, neither of which is available here. The realistic version of "show players what's being requested" is well-written expanded text (a short numbered sequence, not just one sentence) rather than visual media. If visual demonstration genuinely matters enough to invest in, that's a separate, larger content-production task (someone recording real clips) — flag it to Michael as a distinct future decision rather than silently downgrading to text-only without saying so.

---

## Part 2 — Gamesense Library

### Research — real, sourced content, not invented

**Utility lineup knowledge already has a mature ecosystem RankedCoach shouldn't try to rebuild.** Multiple established, community-maintained lineup databases exist: [LineupsValorant](https://lineupsvalorant.com/) (6,600+ lineups), [UpForge's lineup library](https://upforge.gg/lineups), a dedicated [VALORANT Lineups Database](https://valorantcrosshair.app/lineups-database), and [Valoguide](https://valoguide.com/lineups) — all filterable by map/agent, all illustrated with real in-game screenshots RankedCoach has no way to reproduce. **Don't attempt to build an original lineup database.** The realistic, honest design is curated outbound links to the best existing resources per map/agent, same trust model already established for the Aim Lab/KovaaK's links in the post-game training card — RankedCoach points to good external tools, it doesn't try to out-build them.

**Current meta team comps by map are real, sourced, and current** (checked July 2026 data specifically, not stale info) — example entries, with real win-rate data ([sources](https://esportsinsider.com/best-valorant-comps), [alviran.net](https://alviran.net/blog/best-valorant-team-comps-by-map-2026/)):
- Bind: Brimstone/Raze/Skye/Sage/Fade, 57% win rate, 2 Initiators/1 Controller/1 Duelist/1 Sentinel.
- Breeze: Viper/Jett/Sova/Killjoy/KAY-O, 57.5% win rate — currently the highest top-comp win rate of any map in the pool.
- Split: Omen/Raze/Breach/Cypher/Sage, 56.8% win rate, double-sentinel setup.
- Haven: double-duelist (Neon/Phoenix pairing called out specifically) backed by Sova recon, favored for Haven's tight entry points.

**This data is patch-dependent and will go stale** — the source itself frames these numbers against specific patches (11.08, 12.10). Any comp data shipped needs a visible "as of Patch X" tag and a real maintenance plan, not a one-time seed treated as permanently correct.

**Woohoojin's map-macro content is real, specific, and directly usable** — pulled a full worked example for Bind ([source](https://www.zleague.gg/theportal/woohoojin-mastering-the-bind-map-in-valorant/)):
- Defense: "double up to contest lanes on the weak side," accept giving up low-value areas to reinforce high-value ones. Shower control specifically flagged as critical to defensive setup.
- Attack: watch for predictable patterns (his example: late shower lurks) to find exploitable windows.
- Controller play: smoke placement should deny specific named areas (stairs, market) to manipulate where fights happen, not just block sightlines generically.
- The overarching principle he teaches: understanding "map macro" — the conditions that make a site hit succeed — and that good defense is about denying those conditions, not just holding angles.

This is a genuinely good template for what a map-library entry should look like: named source, specific and actionable (not generic "control the map" filler), attack and defense both covered.

**Dopai** — same finding as the warm-up research: confirmed real and credible, but this search pass didn't surface comparably specific, quotable strategic content the way Woohoojin's Bind guide did. Don't fabricate Dopai-attributed content to fill the gap — build out what's genuinely sourced and leave a placeholder/lower-priority note for his content rather than inventing something in his name.

### Structure — where this lives, and why

Michael's own framing left this open ("not sure if this would be a section on the pages"). Recommendation: **a dedicated new section (e.g. a "Gamesense" or "Library" entry point, reachable from the main nav)**, not just scattered tooltips — the described use case (a player deciding "I want to learn about Bind" or "I want to learn Sova") is a browse/reference behavior, which wants a real destination, not an incidental hint. **Also wire contextual entry points** from where they're already relevant — e.g. a "Learn this map" link from the Stats page's per-map breakdown, a "Learn this agent" link from the agent breakdown — so the library isn't only reachable by deliberately navigating to it cold.

### Content categories per topic type

- **Maps**: macro strategy overview (attack + defense, structured like the Bind example above — specific named areas and conditions, not generic advice), current-meta comp callouts (patch-tagged), outbound links to lineup databases scoped to that map.
- **Agents**: role fundamentals (this can directly reuse/link to the existing Agent section of `docs/COACHING-LANGUAGE-RULES.md`, rules 51-100, rather than duplicating content), signature ability usage notes, which current-meta comps/maps favor this agent.
- **Weapons**: Woohoojin's gunfight hygiene matrix (already researched during the warm-up work — burst-tap vs. spray by range, per weapon category), paired with the existing Weapons rule section (101-150).

### Sourcing and legal guardrails — non-negotiable

Same hard-safety-rule discipline already established for Tracker.gg (`notes/screenshot-import.md`'s original rule: no scraping, ever) applies here:
- **Never scrape or rehost video transcripts, screenshots, or lineup images from creators or third-party sites.** Everything creator-attributed in this library must be an original short summary written from publicly available secondary sources (the same approach used for the Woohoojin/Dopai research in this doc and the warm-up doc), clearly attributed by name, not presented as verbatim reproduction.
- **Always attribute.** Content derived from a named creator's teaching should say so in the UI ("via Woohoojin's Bind guide"), not get folded into RankedCoach's voice as if it were the app's own original expertise.
- **Prefer outbound links over rehosting wherever visual/illustrated content is involved** (lineups specifically) — link to the databases that already do this well instead of attempting to reproduce their content.

### Maintenance

Meta comp data needs a visible freshness indicator (patch number, last-updated date) and should be flagged in whatever periodic-review process the rank-benchmark table already has (that table was shipped with the same "provisional, needs updating" framing — reuse that pattern here rather than inventing a new one).

### Build recommendation — start small, same lesson as the coaching-rules rollout

Don't attempt full coverage (every map, every agent, every weapon) in one pass. Ship a small, fully-fleshed first slice — recommend 3 maps (using the ones with the most concrete sourced content right now: Bind, Breeze, Split, per the research above), a handful of agents, and the weapons section (which can lean heavily on material already researched for the warm-up feature) — confirm the format and UX work, then expand coverage in follow-up passes. Report back which maps/agents/weapons made the first cut and why, same as the coaching-rules first-slice approach.

---

## Implementation directive — content is written, this is the build

### Nav placement — real constraint, don't violate it

`notes/mobile-nav-redesign.md` explicitly established the mobile bottom bar as **exactly 4 tabs, "nothing else ever goes here again"** — a hard constraint from that prior work, not a suggestion. **Do not add a 5th bottom-nav tab for this feature.** Reachable entry points instead: the mobile settings quick menu (same pattern as "Customize"/"Account & Support"), and/or a card or link from Home. Contextual entry points from Stats/Insights (per the design above) don't touch the bottom nav at all and are safe regardless. If a standalone destination genuinely needs its own top-level nav slot, that's a real product decision to bring back to Michael, not something to silently decide by adding a 5th tab.

### Data — already written, load it, don't regenerate it

`public/library/gamesense-maps.js` is real, committed content — three full entries (Bind, Breeze, Split), each with `macro.defense[]`, `macro.attack[]`, `macro.controllerNotes`, `macro.source`/`sourceUrl`, `metaComp` (agents/composition/winRate/patch/source), and `lineupLinks[]`. Load this via `<script src="library/gamesense-maps.js?v=...">` (remember the cache-bust version bump every time this file changes — this project has hit the stale-cache bug on `app.css` before, don't repeat it on a new file) and consume `globalThis.RankedCoachGamesenseMaps`. **Don't invent new map copy or restructure the schema without checking with Claude first** — this content was researched and sourced deliberately; changing the wording changes what's being attributed to Woohoojin.

### Reuse existing content for Agents and Weapons — don't author new copy

`docs/COACHING-LANGUAGE-RULES.md` already has 50 rules each for Agents (51-100) and Weapons (101-150), several already citing real mechanics (Woohoojin's gunfight hygiene matrix is rules 101-150's natural anchor). Build a lightweight structured version of a curated subset of these (not all 50 each — pick the ones that read well as standalone reference entries rather than stat-matching conditions) formatted the same way as the maps content, rather than writing original agent/weapon copy. This keeps one source of truth for coaching content instead of two independent copies that can drift apart.

### Page structure

Topic grid (Maps/Agents/Weapons) → category grid (map names / agent names / weapon categories) → detail page. Reuse existing card-gallery UI patterns already in the app (the theme gallery, avatar gallery, border gallery all follow the same `renderXGallery()` + `.x-card` pattern — follow that convention for a `renderGamesenseMapGallery()` etc. rather than building a new component style from scratch).

## Testing

1. Confirm every creator-attributed entry has a visible source citation, not silently presented as RankedCoach's own voice.
2. Confirm lineup-related content routes to outbound links, not an attempt at in-app illustrated lineups.
3. Confirm meta-comp entries show a patch/date tag.
4. Confirm the library is reachable without adding a 5th bottom-nav tab — verify against `notes/mobile-nav-redesign.md`'s 4-tab constraint explicitly, don't just eyeball it.
5. Confirm the library is reachable both as a standalone destination and contextually from relevant Stats/Insights surfaces.
6. Info tags on warm-up drills: confirm the expanded detail is genuinely more actionable than the existing one-liner, not just a longer restatement of the same sentence.
7. Confirm `library/gamesense-maps.js` content renders exactly as written — no paraphrasing or "improving" the sourced copy during implementation, since that would silently change what's attributed to a named creator.
