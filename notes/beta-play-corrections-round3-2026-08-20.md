# Beta Play — Live Build Correction Round 3 (2026-08-20)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: ready to build.** This is a direct screenshot comparison between the live build and `notes/assets/play-approved-raster-2026-08-20.png` (the actual raster file, now in the repo — see `notes/beta-play-amendment-2026-08-20.md` for why this file existing matters and the 5-step comparison process to use going forward). **Test viewport: 1920×1080** — this is the standard used throughout this project's screenshot review, not the raster export's own 1536×1024 canvas size.

The gap here isn't stylistic polish — several of these are missing required content (data the directive explicitly asked for that isn't rendering at all) or an actual functional bug, not a "make it prettier" note. Prioritized accordingly.

---

## P0 — Real bug, not a style issue: RR Trend chart

The live chart has a flat/dead zone in the middle of the line — looks like missing or broken data points, not a deliberate rendering choice. The x-axis dates are inconsistent in a way that indicates a real query/binding bug: "Nov 11 → Jun 1" is roughly a 7-month gap, "Jun 1 → Aug 1" is 2 months, "Aug 1 → Aug 5" is 4 days. For a "Last 20 Matches" chart, the x-axis should reflect the actual dates of the last 20 matches in order — investigate whatever is populating this chart's data points before touching any styling on it.

## P0 — Top Insight headline is still a bare stat label

This was flagged in round 2 and has not been fixed. Live build shows **"Sova Win Rate"** as the headline — that's a stat category name, not a coaching conclusion. Per the design philosophy (Stats are descriptive, Insights are interpretive) and the raster's own example ("Your crosshair placement is winning you more fights."), the headline must be a full written conclusion sentence. The current supporting line ("100% vs 33% earlier — anchored to your earlier Sova agent baseline.") also reads like a raw stat comparison, not the "concise explanation" the directive calls for — rewrite both, not just the headline.

## P0 — Top Insight's Key Takeaways panel is missing entirely

The raster shows a distinct right-side "KEY TAKEAWAYS" panel with 4 bullet points, next to the main insight card. This is not present in the live build at all. Add it back — this is required content per the raster, not an optional enhancement.

## P0 — Current Rank card is missing its Last Match stat strip

The raster's Current Rank card includes a "LAST MATCH" strip at the bottom: K/D/A, KAST, ADR, ACS, HS% — 5 distinct stat columns (directive Section 13 explicitly lists these). The live build has replaced this with a condensed "Today +0 RR / Last ACS 198" combo bundled inside the role box, showing only 1 of the 5 required stats. Rebuild the full 5-column strip.

## P0 — Quick Actions shows the wrong items

Directive Section 16 specifies exactly 5 conceptual actions: **Play A Match, Review Match, Practice, Study a Map, Strategy Library** — with "Play A Match" explicitly called out as beginning the pre-game pipeline (the primary entry point, redundant with the Loadout card's own button, which is fine — both should exist). The live build shows 4 different items instead: Review, Library, Learn, Settings — generic nav shortcuts, not the specified actions. Rebuild this row to match the 5 specified actions; reuse existing destinations under the hood where they map cleanly (e.g. "Review Match" → Review's match history, "Study a Map" → Learn's map content), but the tile labels and icons must match the raster's 5, not become a re-listing of the main sidebar nav.

---

## P1 — Today's Focus: typography, agent art edge, missing content

- **Title case**: raster shows sentence case ("Stop taking isolated first fights.") with only the emphasis phrase in a distinct color/weight. Live build renders the entire title in ALL CAPS. Fix to sentence case.
- **Agent art has a visible rectangular edge.** Directive Section 9 explicitly requires the art to fade into the card "without a visible rectangular edge." Live build shows a hard-edged boxed image on the right. Apply the fade-mask treatment already specified (gradient toward the copy, no visible photo boundary).
- **"Why this matters" evidence text and the "View Focus Details" button both appear to be missing** from what's currently rendering — confirm these are actually present in the DOM/rendered output; if they're being clipped or hidden, that's a layout bug distinct from the styling notes above.
- Confidence/Impact should be presented as the raster shows them: two labeled stat blocks (a "CONFIDENCE" label over "72%", an "IMPACT" label over "High"), not a compact icon+pill combo squeezed onto the title's line.

## P1 — Improvement Timeline: missing sparklines

Directive Section 10 explicitly requires "Mini trend line" per pillar. None of the 5 pillar tiles in the live build show one. Add the sparkline back to each tile — this was already built correctly elsewhere (the Game Stats strip has working sparklines with the same visual treatment); reuse that component rather than rebuilding it.

## P1 — Compass composition doesn't match the raster at all

This is the biggest structural gap, and it's worth stating plainly: **the raster does not use boxed pillar tiles next to a small radar chart.** It uses one large radar chart with axis labels and numeric values integrated directly onto the chart geometry — the pillar name and score sit right next to their axis point on the radar itself, not in a separate row of cards. What's currently built (and what earlier directive rounds specified, based on a different reference image) doesn't match this. Rebuild the Compass to match the raster specifically: a large five-axis radar as the dominant element, with each axis's label and value positioned directly next to its point on the chart rather than in separate boxed tiles.

## P1 — Header: missing subtitle, sync indicator mismatch

Raster shows "Improve. One match at a time." as a subtitle under "PLAY" — missing from the live build. Raster's account-sync indicator is a labeled "Up to date" state with a separate "Refresh Data" button; live build shows a compact "Synced" pill plus search/bell icons and a "Pipeline" button that aren't part of the raster at all. The extra icons may be legitimate (global search/notifications are established elsewhere in this app), but confirm the sync status treatment specifically matches the raster's clearer "state + explicit refresh action" pattern rather than a bare pill.

---

## Not a target for correction

The sidebar is explicitly out of scope per the approved-raster directive (Section 1: "Do not redesign the left sidebar/navigation") — the raster's sidebar shows a different, older nav structure than what's built, and that's expected/fine, not a bug to fix.

**The Loadout card's animated orbital icon is confirmed correct** — no changes needed there.

---

## How this will be reviewed

Follow the 5-step screenshot-comparison process in `beta-play-amendment-2026-08-20.md` exactly: render at 1920×1080, screenshot, place next to `notes/assets/play-approved-raster-2026-08-20.png`, crop to each card for the component-level comparisons above, list what's still different, fix, repeat. Given how much of this round is missing-content rather than styling, prioritize confirming that all required data/copy is actually rendering (P0 items) before polishing anything visual (P1 items) — an empty or wrong data field is a worse failure than a slightly-off radius.
