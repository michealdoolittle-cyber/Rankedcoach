# Gamesense Library — Research + Full Feature Directive

**Status (shipped 2026-07-11):** The Gamesense Library is now a polished fifth top-level page on desktop and mobile, labeled `Library`. The first slice includes the committed Bind/Breeze/Split map content, curated agent and weapon references, contextual entry points from Stats and Insights, and three-step info expansions for all 11 warm-up drills. Focused desktop/mobile verification covers exact map-copy reuse, patch tags, outbound lineup links, internal-attribution suppression, all five nav tabs at 360x740, and horizontal containment. The proactive weakness-to-library suggestion engine remains intentionally unbuilt until this first slice has real usage data.

**Status (2026-07-12 depth pass):** The published map, agent, and weapon catalog now has local visual assets and selectable detail instead of text-only cards. Bind/Breeze/Split use scene-art gallery cards plus scrollable marked tactical layouts and role-specific notes; current comps render agent portraits; all six published agents expose selectable ability facts; and all 16 supported weapons expose selectable economy and damage-range analysis. The redundant hero topic strip, entry-count copy, `First Slice` badge, and lineup instruction sentence were removed. Warm-up instructions now distinguish the Range's Strafe setting from player movement and correctly describe stationary flicking, continuous-fire drone transfers, disabled infinite ammo, and distance-based spray accuracy work.

**Attribution policy, updated 2026-07-11 — read before building the UI:** Michael's call: no visible creator attribution in the player-facing app. His reasoning, and it's a sound one: game mechanics and strategic knowledge aren't gatekept or copyrightable — only a creator's specific *expression* (their exact script, their video) would need attribution, and this content was never that in the first place, it's original writing based on understanding the underlying mechanics. The original draft of this doc called for visible "via Woohoojin" style attribution; **that's reversed now.** Source research notes stay in `public/library/gamesense-maps.js` as underscore-prefixed internal fields (`_researchNote`, `_researchUrl`) for the team's own future reference — **never render these fields to players.**

## What this looks like as an end result — concrete walkthrough

A new nav entry (working name "Gamesense," final label is a copy-layer decision, follow `notes/copy-language.md` conventions) opens a topic picker: three cards — **Maps**, **Agents**, **Weapons**. Tapping Maps shows the map grid (Bind, Breeze, Split in the first slice, same visual pattern as the existing map-select UI elsewhere in the app — reuse, don't reinvent). Tapping a map opens a detail page with this exact structure, matching the content already written in `public/library/gamesense-maps.js`:

- A header with the map name — no attribution line, per the updated policy above.
- Two columns or stacked sections: **Defense** and **Attack**, each a short bulleted list (2-3 real points, e.g. Bind's "shower control is the priority defensive anchor" / "double up to contest the weak-side lane") — not paragraphs, scannable like the rest of the app's card language.
- A **Controller notes** callout — since smoke/utility placement is consistently the most specific, actionable content (e.g. Breeze's "smoke Mid Nest to remove the Operator angle").
- A **Current Meta Comp** card — the five agents, composition breakdown (roles), win rate, and a visible patch tag ("as of Patch 12.10") so it reads as time-bound data, not a permanent claim. **This tag stays visible** — it's a data-freshness indicator, not attribution, different category from the creator-sourcing question.
- A **Find Lineups** section at the bottom — outbound link buttons to LineupsValorant/UpForge for that specific map, same visual treatment as the existing Aim Lab/KovaaK's buttons on the post-game training card. This is the outsourced part — RankedCoach sends players to the databases that already do this well, never tries to host its own lineup screenshots.

Agents and Weapons work the same navigational pattern (topic grid → detail page), but **their content already exists** — see "Reuse existing content" below, don't write new agent/weapon copy from scratch.

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

### Sourcing guardrails — updated 2026-07-11, no visible attribution

Same hard-safety-rule discipline already established for Tracker.gg (`notes/screenshot-import.md`'s original rule: no scraping, ever) still applies to *how content gets written*, even though attribution is no longer shown to players:
- **Never scrape or rehost video transcripts, screenshots, or lineup images from creators or third-party sites.** Everything in this library must be original writing that reflects an understanding of the underlying game mechanics/strategy, sourced from publicly available secondary material — not a verbatim or near-verbatim reproduction of any creator's specific wording. This is the actual line that matters legally (expression vs. fact), and it's independent of whether attribution is shown.
- **No visible attribution in the player-facing UI** — per Michael's policy above. Keep research provenance as internal-only metadata (underscore-prefixed fields) for the team's own future reference, never rendered.
- **Prefer outbound links over rehosting wherever visual/illustrated content is involved** (lineups specifically) — link to the databases that already do this well instead of attempting to reproduce their content.

### Maintenance

Meta comp data needs a visible freshness indicator (patch number, last-updated date) and should be flagged in whatever periodic-review process the rank-benchmark table already has (that table was shipped with the same "provisional, needs updating" framing — reuse that pattern here rather than inventing a new one).

### Build recommendation — start small, same lesson as the coaching-rules rollout

Don't attempt full coverage (every map, every agent, every weapon) in one pass. Ship a small, fully-fleshed first slice — recommend 3 maps (using the ones with the most concrete sourced content right now: Bind, Breeze, Split, per the research above), a handful of agents, and the weapons section (which can lean heavily on material already researched for the warm-up feature) — confirm the format and UX work, then expand coverage in follow-up passes. Report back which maps/agents/weapons made the first cut and why, same as the coaching-rules first-slice approach.

---

## Implementation directive — content is written, this is the build

### Nav placement — policy reversed 2026-07-11, this IS a 5th tab now

**Overrides the earlier "don't add a 5th tab" directive.** Michael's explicit call: he doesn't want this buried where players won't find it, and considers a 5th tab acceptable on both mobile and desktop as long as it's built thoroughly. `notes/mobile-nav-redesign.md`'s original "exactly 4 tabs, nothing else ever goes here again" rule is being amended by this decision — see the note added there. Build Gamesense as a real 5th bottom-nav tab (mobile) and the equivalent top-level nav item (desktop), matching the visual/interaction pattern the existing 4 tabs already use (`.mobile-bottom-page-btn[data-mobile-page="..."]`, `app.js:1343`) — same tap-target sizing, same active-state styling, no second-class treatment relative to Home/Logging/Stats/Insights. "Extremely thorough" was the explicit bar — this isn't a quick add-on, budget real UI/UX effort matching the other four tabs' polish level, not a bare-bones placeholder.

### Data — already written, load it, don't regenerate it

`public/library/gamesense-maps.js` is real, committed content — three full entries (Bind, Breeze, Split), each with `macro.defense[]`, `macro.attack[]`, `macro.controllerNotes`, `macro._researchNote`/`_researchUrl` (internal only, never render), `metaComp` (agents/composition/winRate/patch), and `lineupLinks[]`. Load this via `<script src="library/gamesense-maps.js?v=...">` (remember the cache-bust version bump every time this file changes — this project has hit the stale-cache bug on `app.css` before, don't repeat it on a new file) and consume `globalThis.RankedCoachGamesenseMaps`. **Don't invent new map copy or restructure the schema without checking with Claude first** — this content was researched deliberately, and the underscore-prefixed fields must stay out of any render path.

### Reuse existing content for Agents and Weapons — don't author new copy

`docs/COACHING-LANGUAGE-RULES.md` already has 50 rules each for Agents (51-100) and Weapons (101-150), several already citing real mechanics (Woohoojin's gunfight hygiene matrix is rules 101-150's natural anchor). Build a lightweight structured version of a curated subset of these (not all 50 each — pick the ones that read well as standalone reference entries rather than stat-matching conditions) formatted the same way as the maps content, rather than writing original agent/weapon copy. This keeps one source of truth for coaching content instead of two independent copies that can drift apart.

### Page structure

Topic grid (Maps/Agents/Weapons) → category grid (map names / agent names / weapon categories) → detail page. Reuse existing card-gallery UI patterns already in the app (the theme gallery, avatar gallery, border gallery all follow the same `renderXGallery()` + `.x-card` pattern — follow that convention for a `renderGamesenseMapGallery()` etc. rather than building a new component style from scratch).

## Testing

1. **Confirm no creator names or `_researchNote`/`_researchUrl` fields render anywhere in the UI** — search the rendered DOM output for "Woohoojin," "Dopai," and any raw URL from the internal fields, confirm zero matches. This is the inverse of the original testing item and matters more now that the policy flipped — verify it explicitly, don't assume the rename to underscore-prefixed fields alone prevents accidental rendering.
2. Confirm lineup-related content routes to outbound links, not an attempt at in-app illustrated lineups.
3. Confirm meta-comp entries show a patch/date tag (this one stays visible — it's freshness data, not attribution).
4. Confirm the new 5th tab matches the visual/interaction polish of the existing 4 — same tap targets, same active-state treatment, works identically on desktop's top-level nav equivalent. "Thorough" was the explicit bar, verify it reads that way, not like a bolted-on afterthought.
5. Confirm the library is reachable both as its own tab and contextually from relevant Stats/Insights surfaces.
6. Info tags on warm-up drills: confirm the expanded detail is genuinely more actionable than the existing one-liner, not just a longer restatement of the same sentence.
7. Confirm `library/gamesense-maps.js` content renders exactly as written — no paraphrasing or "improving" the sourced copy during implementation.

---

## Future direction, noted not built — content-suggestion engine

Michael wants this flagged for later, not built now: eventually, the app should proactively suggest specific Gamesense Library entries to a player based on identified weaknesses, rather than the library only being something a player browses cold. Example: a player with a low win rate specifically on Bind defense gets a surfaced suggestion pointing at the Bind macro entry; a player whose formulas flag a weapon-hygiene gap gets pointed at the relevant Weapons entry. This is a natural extension of the existing insight-generation pipeline (`buildPlayerModel()`, the coaching-rules matching layer from the formula-wiring directive) — once a weakness is identified, the same matching logic that generates a coaching insight could also attach a "read this" library link. Don't build this now; it depends on the library existing first and having real usage to validate the format before recommending it proactively. Revisit once the library's first slice has shipped and stabilized.
