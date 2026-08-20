# Play Page — Directive Reconciliation Amendment (2026-08-20)

**Read this alongside `notes/beta-play-approved-raster-directive-2026-08-20.md` (the approved-raster reconstruction directive Michael provided directly) before starting.** That document is now the primary source of truth for the **default Play dashboard's** macro composition, superseding Section 1 of `notes/beta-play-system-rebuild-2026-08-20.md`. This amendment exists because the two documents disagreed in three places — each is resolved below with Michael's explicit answer, not a guess.

**Scope boundary:** the approved-raster directive covers only the default Play dashboard's main content area (Today's Focus, Improvement Timeline, Loadout placeholder, Compass, Current Rank, RR Trend, Top Insight, Quick Actions). Everything else already specified stays in force unchanged: the full-screen Loadout spin flow itself (`beta-play-system-rebuild-2026-08-20.md` Section 2), In-Game (Section 3), the two-trigger sync model (Section 4), Log Match (Section 5), Match Saved (Section 6), and the finalized icon set (`beta-icon-set-2026-08-20.md`). Do not let the approved-raster directive's silence on those areas be read as license to change them.

Preview artifact (updated to reflect every resolution below): https://claude.ai/code/artifact/edf8fa39-febf-4fe3-ac90-d7583e505ed8

---

## Resolution 1 — RR Trend percentage

**Approved-raster directive wins**: no percentage anywhere on the RR Trend card. Remove the "▲3%" that the earlier directive round had confirmed.

**One addition**: every RR value must carry an explicit "RR" unit suffix (e.g. "412 RR," not "412") — consistent with the already-established "RR is never a flat number" rule. Final header layout: left side = rank icon + "412 RR" (no percentage); right side = the point-value delta ("+23").

## Resolution 2 — Focus Queue

**Focus Queue is removed as a separate dashboard card.** There is no third item in the RR Trend / Top Insight row — that row is 2 columns, not 3.

Instead, Focus Queue is **merged into the Focus Details panel**, opened from Today's Focus's "View Focus Details" button. Structure, top to bottom, in one panel:

1. **Current focus deep-dive** (unchanged content from the existing Focus Details spec): focus statement as a headline, Confidence/Impact stat block, "Why this matters," "What to do" checklist, "Success looks like."
2. A divider.
3. **"Other Trending Focuses"** section header, with the **Auto-Rotate / Self-Chosen toggle** (from the original Focus Queue modal spec) aligned to its right.
4. A row of candidate focus cards — the *other* trending focuses, not including the one already shown above as current (avoid showing the same focus twice). Each card: dismiss (×), focus statement, impact tag, "Confidence NN%" label with the gradient threshold bar.
5. A "+ Add Focus to Queue" dashed row at the bottom, for a self-chosen custom entry.

This is one panel, one route, not two. The exact markup is in the preview artifact's "Focus Details (merged)" tab — copy it directly rather than re-deriving the layout from this description.

**Open question, not yet resolved:** the sidebar's "Focus Queue" Tools nav item still exists and currently says "Focus Queue." Should it be renamed to "Focus Details" to match, or keep its current label while routing to this same merged panel? Left as-is (label unchanged, same route) until Michael says otherwise — flag back if this reads wrong once built.

## Resolution 3 — Loadout dashboard entry point

**The approved-raster directive's "fully passive, no button" instruction is overridden.** Michael explicitly wants to keep the active **"Start A Match"** button directly on the dashboard Loadout card (launching the spin flow from there, as already built) — not route exclusively through a separate "Play A Match" Quick Action tile. The Quick Actions row's "Play A Match" tile can still exist and lead to the same place; it's additive, not the only entry point.

**The icon changes.** Replace whatever Loadout placeholder icon exists with this exact animated composition — a faceted gem at the center with two tilted elliptical orbit rings, each with small star points that **actually travel along the ellipse** (not just static rotating rings):

```html
<svg class="lp-orbit" viewBox="0 0 64 64">
  <g transform="rotate(-15 32 32)">
    <ellipse class="orbit-ring" cx="32" cy="32" rx="27" ry="11"/>
    <circle class="orbit-star" r="1.6">
      <animateMotion dur="7s" repeatCount="indefinite" path="M 5,32 A 27,11 0 1,1 59,32 A 27,11 0 1,1 5,32"/>
    </circle>
    <circle class="orbit-star" r="1.1" opacity=".75">
      <animateMotion dur="7s" begin="-4.6s" repeatCount="indefinite" path="M 5,32 A 27,11 0 1,1 59,32 A 27,11 0 1,1 5,32"/>
    </circle>
  </g>
  <g transform="rotate(20 32 32)">
    <ellipse class="orbit-ring" cx="32" cy="32" rx="22" ry="9"/>
    <circle class="orbit-star" r="1.3">
      <animateMotion dur="5.2s" begin="-1.8s" repeatCount="indefinite" path="M 10,32 A 22,9 0 1,1 54,32 A 22,9 0 1,1 10,32"/>
    </circle>
  </g>
  <path d="M32 20 43 32 32 44 21 32Z" fill="url(#gemGrad)" stroke="var(--rc-brand-strong)" stroke-width=".6"/>
  <path d="M32 20 37 27 32 32 27 27Z" fill="rgba(255,255,255,.35)"/>
</svg>
```

```css
.lp-orbit{width:72px;height:72px;}
.lp-orbit .orbit-ring{fill:none;stroke:var(--rc-brand-strong);opacity:.35;stroke-width:.8;}
.lp-orbit .orbit-star{fill:#fff;}
@media (prefers-reduced-motion:reduce){.lp-orbit animateMotion{display:none;}}
```

Gradient def (add once per page, referenced by `url(#gemGrad)`):

```html
<linearGradient id="gemGrad" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="var(--rc-brand-strong)"/>
  <stop offset="100%" stop-color="var(--rc-brand-deep)"/>
</linearGradient>
```

`animateMotion`/`mpath` is standard SVG, works natively without JS. The `prefers-reduced-motion` rule freezes the stars in place (display:none on the animateMotion elements resolves to the circle's default position — verify this renders sensibly, not as a missing/invisible star, when reduced motion is on).

---

## Real rank and role icons — use these exact sources, do not invent new ones

Confirmed by direct codebase search 2026-08-20:

- **Rank icons**: `getRankIconUrl(label)` in `public/app.js` (~line 27101) → `https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/{tier}_rank.png` (e.g. `ascendant_2_rank.png`). Reuse this function/URL pattern everywhere a rank icon appears on Play — Current Rank card, RR Trend, RR Card, Match Saved.
- **Role icons**: `ROLE_ICON_MAP` in `public/app.js:24993` (duplicated as `roleIconMap` in `public/library/gamesense-library.js:1170`) → `https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/{role}_role.png` for Duelist/Initiator/Sentinel, and `role_controller.png` (word order reversed) for Controller. Use `renderRoleIconImage()` — it already exists, don't reimplement it. This is what Section 13's "Impact references the player's current role" needs for the role icon/label.

**Known caveat, documented in `notes/revert-fake-role-icons-fix-real-asset-2026-08-17.md`**: the role images are WebP files saved with a `.png` extension in the external image repo, served as `image/png` with `nosniff` — a MIME mismatch that can fail to decode in strict browsers. This is a pre-existing issue in the image host, not something beta introduces. The existing `ROLE_ICON_MAP` usage already has an `onerror` fallback to a generic inline SVG badge (dark rounded square, cyan ring, amber dot) — carry that same fallback into beta rather than leaving a broken-image icon if this bug reoccurs.

For every icon *not* covered by the two systems above (Compass pillars, Game Stats, reference sections, Settings gear, nav icons), use the finalized set in `notes/beta-icon-set-2026-08-20.md` — do not design new ones for concepts already covered there.

---

## The raster image is now a real file — use it, don't work from memory of the description

**`notes/assets/play-approved-raster-2026-08-20.png`** (1536×1024) is the actual approved-raster image, saved into the repo. Section 25 of `beta-play-approved-raster-directive-2026-08-20.md` requires a "mandatory screenshot acceptance loop" — that loop is not optional and is not satisfied by eyeballing the CSS you wrote. Follow these concrete steps, every time, for both the full dashboard and for any individual card/icon/element you're adjusting mid-build:

1. **Render the live/local beta Play page and screenshot it** at a browser viewport that matches the raster's proportions (1536×1024, or scale proportionally — e.g. 1920×1280 — but keep the same aspect ratio so the comparison isn't distorted). Use the same Playwright pattern already established in `testing/visual-audit/` (see `audit.js` for the existing capture convention in this repo) rather than inventing a new screenshot method.
2. **Save that screenshot to a real file** — e.g. `testing/visual-audit/play-dashboard-current.png` — don't just describe what you see, produce the actual image.
3. **Place it directly next to `notes/assets/play-approved-raster-2026-08-20.png`** and compare them — either literally side-by-side (open both images) or as an overlay/diff if tooling supports it. This applies at two scales:
   - **Full-page pass**: compare the whole dashboard screenshot against the whole raster — composition, row proportions, spacing, hierarchy.
   - **Component pass**: when you're specifically working on one card (Today's Focus, Loadout, Compass, Current Rank, RR Trend, Top Insight, Quick Actions), crop both your screenshot and the raster down to just that card's region and compare those crops directly — full-page comparison alone will miss small icon/spacing/color mismatches inside a single card.
4. **List the specific differences you see** — not a vague "looks close," actual named differences (e.g. "agent art crop is centered, raster has it bottom-right anchored," "Improvement Timeline pillar icons are missing," "Compass card padding is wider than the raster's"). This list is what Section 28's completion report is asking for under "Visual discrepancies found during comparison" — if you can't produce specific line items here, the comparison wasn't actually done.
5. **Fix the named differences, take a new screenshot, and repeat** until the list is empty or you can name a real reason (a specific data/behavior constraint) why a remaining gap can't be closed — that reason goes in Section 28's "Any remaining mismatch and why it remains," not silently dropped.

Do this same 5-step process for every icon/SVG from `notes/beta-icon-set-2026-08-20.md` and the orbital Loadout icon above too — "does it look like the reference" is a screenshot-comparison question, not something to self-assess from reading your own markup.

## How this will be reviewed

1. Follow the concrete 5-step screenshot-comparison process above for both the full dashboard and each individual card/icon — Section 25's "mandatory screenshot acceptance loop" is only satisfied if actual saved screenshot files exist and were actually placed next to `notes/assets/play-approved-raster-2026-08-20.png` for comparison, not just claimed.
2. Request the actual saved screenshot files (`testing/visual-audit/play-dashboard-current.png` and any component crops) as part of the build report, alongside the specific discrepancy list from step 4 above — a completion report with no attached screenshots and no named discrepancies is a sign the loop didn't happen, treat it as incomplete and send back for another pass rather than accepting it.
3. Confirm RR Trend shows no percentage anywhere, with "RR" suffixed on every value.
4. Confirm Focus Details opens one merged panel (current focus + trending queue + add-your-own), not two separate flows.
5. Confirm the Loadout dashboard card keeps its "Start A Match" button and uses the exact orbital gem SVG above, with visibly traveling star points (not static).
6. Confirm rank and role icons resolve to the real hosted URLs, not a placeholder or a redrawn icon.
