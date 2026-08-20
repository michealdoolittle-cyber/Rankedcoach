# Beta Play — Live Build Correction Round 2 (2026-08-20)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: ready to build.** This corrects the live `beta.rankedcoach.gg` Play build against `notes/beta-play-system-rebuild-2026-08-20.md` after a direct screenshot review. Most of that directive landed correctly — this document only covers what still needs fixing. **Where this document gives literal CSS/markup, copy it directly** — prose-only correction rounds on this project have repeatedly lost fidelity; the updated `Play System Preview` artifact (same URL as before) reflects every fix below and should be treated as the literal reference, not just this document's prose.

---

## P0 — Data integrity (fix this first, it's a real bug not a style note)

**In the never-synced / no-account state, Today's Focus still renders a fully-confident coaching card** — "92% Confidence," a "why" justification like "Aim is tracking at 0/100 in the active window" — off literally zero real data. Focus Queue does the same, showing 3 specific named jobs with impact tags in the zero-data state. This is a coaching system making confident claims from nothing, which conflicts with this project's data-integrity standard elsewhere.

**Fix:** when there's no synced account (or no match data yet), Today's Focus and Focus Queue should not render confident-looking coaching content at all. Show an onboarding-style empty state instead — e.g., "Sync your account to get your first focus" — matching the same honest, no-fake-confidence treatment already used correctly on the Top Insight card in this exact state ("Sync a real account to build your first beta read" — that copy is correct, reuse that pattern for Today's Focus and Focus Queue too).

## P0 — Top Insight shows a stat label, not a coaching conclusion

Live build shows **"Overall K/D"** as the Insight's headline — that's a stat category name, not an interpreted conclusion. Per the design philosophy (Section 21: "Stats are descriptive. Insights are interpretive... Do not blur the distinction") and the established Insight anatomy, the headline must be a written conclusion sentence — e.g., "Your K/D is outperforming your rank average" or similar generated coaching language, not a bare metric label. The supporting line ("1.14 vs 1.01 for your rank's average") is correctly the *evidence* — it's the headline above it that's wrong.

## P0 — Last Match "Focus adherence" field is wrong

Live build shows **"Focus adherence: Win the first honest fight"** — that's just repeating the focus title. This field needs an actual adherence value (a score or percentage, per Section 5/6 of the master Play directive), not the focus name restated.

---

## P1 — Today's Focus card: resize, reorder, background

The card is currently too large and uses the wrong background/framing. Full correction, matching the updated preview artifact exactly:

- **Scale the whole card down to roughly half its current height, proportionally** — not just a shorter container with the same oversized internal text/image. Every internal element (title size, evidence text size, stat-block size, button size, agent-art width) scales down together as one ratio. Reference values from the corrected artifact: card `min-height: 96px` (was 172px), title `font-size: 17px` (was 25px), stat-block value `font-size: 15px` (was 24px), button `height: 26px`.
- **Column order, left to right: text block → Confidence/Impact stat block → agent art.** The stat block sits *between* the text and the art, and the art is the true rightmost element, flush to the card's right edge — not floating in the middle with the stat block pushed further right than the art.
- **Agent art background: black-faded, not a bright purple box with a visible border.** Per ChatGPT's own note: a near-black background with a subtle radial glow behind the portrait, and a gradient fade at the bottom edge so the art disappears into the card rather than sitting in a distinctly-colored, bordered rectangle. Reference CSS from the artifact:
  ```css
  .agent-art-frame{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:center;overflow:hidden;background:#05060a;}
  .agent-art-frame::before{content:"";position:absolute;inset:0;background:radial-gradient(70% 60% at 50% 28%,rgba(139,92,246,.16),transparent 72%);}
  .agent-art-frame::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,#05060a 96%);}
  .agent-art-frame img{position:relative;height:118%;width:auto;object-fit:contain;filter:drop-shadow(0 10px 16px rgba(0,0,0,.55));}
  ```
- **The card's outer border/frame must stay the standard neutral card border — no amber/multi-color outline.** The live build currently shows an amber glow around this card and an amber "View Focus Details" button. Both should be the standard `.rc-card` neutral border and the standard purple primary-button treatment — the deep purple identity, not amber. Amber/gold is reserved for the Learn section accent and specific semantic warnings, not Play's primary framing.

## P1 — Real rank icons, not an abstract badge

**Use the app's existing rank icon system, not an invented shape.** Production already has this solved — `getRankIconUrl(label)` in `public/app.js` (~line 27101) maps a rank label to a real icon URL (`https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/{tier}_rank.png`, e.g. `ascendant_2_rank.png`). Reuse that exact function/URL pattern in beta everywhere a rank icon appears (RR Card, RR Trend, Match Saved, sidebar account chip, anywhere else) — do not draw a new rank badge shape.

## P1 — Compass: pillar tiles still not under the radar, and need icons

The live build still places the 5 pillar stat tiles beside the radar chart, not underneath it — this was already specified in the prior directive and needs to actually move. Additionally, **each pillar tile needs a small icon glyph, not text-only.** The corrected artifact has 5 reference icons (crosshair for Mechanics, eye for Game Sense, two overlapping circles for Teamwork, shield for Discipline, an abstract head/mind mark for Mental) at `.compass-pillars .pillar-tile.compact svg` — copy that icon set directly rather than inventing new ones.

## P1 — Loadout Generator (dashboard tile): wrong icon, remove all text

- **The animated icon must be the specified one, not a substitute.** Reference markup from the artifact:
  ```html
  <div class="lp-icon fancy"><div class="ring"></div><div class="ring2"></div><div class="core"></div></div>
  ```
  ```css
  .lp-icon.fancy{width:64px;height:64px;position:relative;}
  .lp-icon.fancy .ring{position:absolute;inset:0;border-radius:50%;border:2px solid transparent;border-top-color:var(--brand-hi);border-right-color:var(--brand);animation:spin 3s linear infinite;}
  .lp-icon.fancy .ring2{position:absolute;inset:7px;border-radius:50%;border:2px solid transparent;border-bottom-color:rgba(185,148,255,.5);animation:spin 4s linear infinite reverse;}
  .lp-icon.fancy .core{position:absolute;inset:16px;border-radius:50%;background:linear-gradient(160deg,var(--brand-hi),var(--brand-deep));box-shadow:0 0 16px rgba(139,92,246,.5);}
  ```
  Two counter-rotating rings + a glowing core — this is what "animated" means here, respecting `prefers-reduced-motion` as already specified.
- **Remove all text from this tile** — no "Loadout Generator" eyebrow, no "Spin when you are ready" title, no caption line. Just the animated icon, centered, with the "Start A Match" button centered directly below it. This supersedes the earlier instruction that kept a caption line — that's now gone too.

## P1 — Loadout Spinning state is missing entirely, needs a minimum duration

The live build appears to skip straight from Idle to Generated with no visible Spinning state. **The Spinning state must always render, and must last a minimum of 3.5 seconds** even if the underlying generation logic resolves faster — pad it artificially if needed. Without a floor duration, it reads as a flash/glitch instead of a deliberate "the coach is thinking" moment, which defeats the purpose of having a spinning state at all.

---

## P2 — Trend chart treatment (two distinct chart types, don't conflate them)

Michael provided reference screenshots for both. These are two different chart contexts — don't apply one style to both:

### Compact/small trend charts (Game Stats tiles, and anywhere else a small inline trend appears)
Needs: a gradient fill under the line (opaque near the top of the line, fading to 100% transparent right at the baseline), a visible dot marker at the peak and/or valley points (not just a bare line), and a baseline axis line at the bottom. Reference from the corrected artifact (one of five, same pattern for all):
```html
<svg class="s-spark" viewBox="0 0 100 30" preserveAspectRatio="none">
  <polygon fill="url(#sparkFill)" stroke="none" points="0,14 20,12 40,15 60,8 80,10 100,4 100,26 0,26"/>
  <line x1="0" y1="26" x2="100" y2="26" stroke="var(--border)" stroke-width="1"/>
  <polyline fill="none" stroke="var(--brand-hi)" stroke-width="1.6" points="0,14 20,12 40,15 60,8 80,10 100,4"/>
  <circle cx="100" cy="4" r="2" fill="var(--brand-hi)"/>
  <circle cx="40" cy="15" r="1.6" fill="var(--text-3)"/>
</svg>
```
with a shared gradient def once per page:
```html
<linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="var(--brand-hi)" stop-opacity=".55"/>
  <stop offset="100%" stop-color="var(--brand-hi)" stop-opacity="0"/>
</linearGradient>
```

### Main RR Trend card — corrected 2026-08-20, supersedes the earlier "x/y values not necessary" spec
Michael's new reference shows this chart needs **explicit y-axis gridlines with labeled values (e.g. 300/400/500) and actual calendar x-axis dates (e.g. "Apr 20 / Apr 30 / May 10 / May 16"), not the relative "30d ago / Today" labels from the earlier round.** Header changes from "(Last 30 Days)" to "(Last 20 Matches)." Line color is green (`var(--success)`), with a gradient fill fading to transparent at the baseline, and dot markers at interior peak/valley points plus the current/latest point. This explicitly overrides the earlier directive's "x and y values aren't as necessary here" note — that guidance is no longer correct, build to this new reference instead. Full corrected markup is in the artifact's RR Trend card (`.sparkline` SVG inside the RR Trend card, ~260×90 viewBox with gridlines, axis labels, and the green polygon/polyline/circles).

---

## Cross-cutting rule reaffirmed

**Colors must come from the established token set, not ad-hoc choices.** The amber creep on Today's Focus (border glow, button color) is the clearest example — check the rest of the build for similar drift where a component ended up using `--warning`/`--learn` amber instead of `--brand` purple for what should be primary/identity elements. Amber is Learn's section accent and the semantic warning color — it is not a substitute for Play's purple identity.

## How this will be reviewed

1. Screenshot the dashboard in both the demo (`?demo=1`) and never-synced states at 1920×1080 — the never-synced state is the one that needs the data-integrity fix, don't just re-check the demo state and call it done.
2. Confirm Today's Focus is visibly smaller (roughly half height) with art flush right, stats between text and art, black-faded art background, purple framing throughout.
3. Confirm Compass pillar tiles are under the radar with icons, not beside it.
4. Trigger a full Loadout spin and time the Spinning state — must be ≥3.5s and visibly present.
5. Confirm every rank icon on the page is the real `getRankIconUrl()` asset, not an invented shape.
6. Compare the RR Trend card directly against Michael's reference screenshot — gridlines, calendar dates, green gradient line, dot markers all present.
