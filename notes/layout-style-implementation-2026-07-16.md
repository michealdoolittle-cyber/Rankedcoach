# Layout Style — Implementation Directive (2026-07-16)

**Status: ready to build.** This supersedes the exploration log in `notes/layout-style-setting-2026-07-15.md` as the thing to actually implement — that file stays as the full history/rationale (why each concept exists, every fix made along the way) if you need to check context on any individual style; this file is the concrete build spec.

**Scope for this pass: Track A (10 CSS/SVG shape styles) + Track B (fonts) only. Track C (the 3 AI-generated frame PNGs — circuit-trace, Vine Bloom, Thornbound) is skipped for now** — Michael's call, not worth blocking this build on exporting/committing those asset files. Section 4c is left in place for whenever that track gets picked back up, but don't build against it this pass.

---

## 1. Where this actually lives (confirmed in code, not assumed)

Michael calls it the "Customize menu" — that's a real button, not a colloquial name. Confirmed:

- Profile dropdown → **Customize** button (`#pdOpenSettings`, `public/index.html:1033`) → calls `openEditProfileModal()` (`public/app.js:45175`) → opens `#editProfileModal`.
- That modal already has a tab strip (`public/index.html:424-428`):
  ```html
  <button class="profile-edit-tab is-active" data-profile-tab="theme">Theme Selector</button>
  <button class="profile-edit-tab" data-profile-tab="icon">Agent Profile Icon</button>
  <button class="profile-edit-tab" data-profile-tab="borderColor">Profile Border Color</button>
  <button class="profile-edit-tab" data-profile-tab="border">Profile Border</button>
  <button class="profile-edit-tab" data-profile-tab="banner">Banner</button>
  ```
  with matching `.profile-edit-panel[data-profile-panel="..."]` sections at `public/index.html:432+`.
- **This is not the floating "Theme Builder" dock** (`installThemeBuilderControls`, `app.js:38954`) — that's a separate live-editing power tool for theme colors/layout metrics. Layout Style is a profile customization option and belongs in the Customize modal's tab system, not the dock.

**Add a sixth tab, `data-profile-tab="layoutStyle"`, labeled "Layout Style"**, positioned after "Theme Selector" (it's the closest sibling concept) and before "Agent Profile Icon". Add the matching `.profile-edit-panel[data-profile-panel="layoutStyle"]` section following the exact markup shape of the existing panels (see `border` panel, `public/index.html:496-520`, as the closest analog — it's also a card-gallery-of-named-options pattern).

**The pattern to mirror exactly is `Profile Border`, not `Theme Selector`** — Profile Border is the existing feature closest to this one (a named list of purely-visual, fully-optional per-profile styles with live preview cards), and its implementation is small and self-contained:
- `PROFILE_BORDER_STYLES` array, `app.js:42801` — list of `{ value, label, note }`.
- `PREMIUM_PROFILE_BORDER_STYLES`, `app.js:42819` — premium-gated extras, gated via `getAvailableProfileBorderStyles()` (`app.js:42877`, checks `isPremiumThemeQaUser(user) && isMobileLayoutViewport()`).
- `normalizeProfileBorderStyle(borderStyle)`, `app.js:43752` — validates against the available list, falls back to `"standard"`.
- `renderBorderGallery(selectedBorder)`, `app.js:43941` — builds the clickable preview-card grid into `#editProfileBorderGallery`, reading live theme colors (`colors.accent`, `colors.card`, etc.) so every card previews in the *current* selected theme, not a fixed color. Click handler at `app.js:44000` (`selectBorderCard`) updates a hidden `<select id="editProfileBorderStyle">` and re-renders.
- Wired into the tab-switch dispatcher at `refreshProfileEditTabPanel()` (`app.js:45183-45209`) and `activateProfileEditTab()`'s `tabOrder` array (`app.js:45230`).
- Persisted in `saveEditProfileModal()` (reads from `#editProfileBorderGallery [data-border-card].is-active` or the hidden select, `app.js:45274`; writes `profile.profileBorder = normalizeProfileBorderStyle(selectedBorder)`, `app.js:45288`), plus profile-object defaults at `app.js:42981, 43029, 43091, 43449` and remote-load normalization at `app.js:43266-43267`.

Build `layoutStyle` as a parallel, same-shaped system: `LAYOUT_STYLE_OPTIONS` array, `normalizeLayoutStyle()`, `renderLayoutStyleGallery()`, wired into the same tab dispatcher/tabOrder/save/defaults/normalize call sites Profile Border already uses. Default value: `"default"` (current production styling, zero attribute applied, pixel-identical to today — same rule as the original directive).

Apply the chosen style via `body[data-layout-style="..."]`, scoped the same way theme selection already scopes via `body[data-theme="..."]` (`app.js:35596`).

---

## 2. Scope — which elements get restyled

Reuse the content-card list already worked out and approved (not re-derived): Insights in full, Home's Weekly Focus + Recent Improvement, Stats' Recent Match Trends + Match Patterns, Logging's Session Debrief + log feed entries, and the Gamesense Library dossiers/tips/comps/weapon-suggestions/fundamentals. Explicitly excludes nav bar, charts, meters, radar/diamond visualizations, dense stat-tile grids, and input controls, on every page. The card/tag selectors from commit `64e55c0` (reverted in `81e434e`, but the *selectors* — which elements get touched — are still valid, `git show 64e55c0`) are the ones to pull forward; its old visual rules are superseded by everything below.

**Hard rule:** Layout Style is a frame/border/shape treatment applied *around* existing content. Under no style does it remove, hide, replace, or crop any real content — agent icons, map thumbnails, stat values, tags, everything currently rendered stays fully intact and legible.

---

## 3. Track A — the 10 approved CSS/SVG shape styles (build first, no external blockers)

All defined and screenshot-verified in the committed reference files — lift the CSS/SVG directly rather than re-deriving it:

| Key | Label | Source file | Notes |
|---|---|---|---|
| `honeycomb` | Honeycomb Panel | `docs/design/layout-styles-v2-2026-07-16.html` | True hexagon silhouette — flag to Michael before building: this changes the outer card shape, not just a border, and may need a reflow pass for real content (see hard rule above and section 2 of the exploration log). |
| `chevronscan` | Chevron Scan | `docs/design/layout-styles-v2-2026-07-16.html` | |
| `aperturecut` | Aperture Cut | `docs/design/layout-styles-v2-2026-07-16.html` | |
| `scopevignette` | Scope Vignette | `docs/design/layout-styles-v2-2026-07-16.html` | |
| `hazardedge` | Hazard Edge | `docs/design/layout-styles-v2-2026-07-16.html` | |
| `diamondfacet` | Diamond Facet | `docs/design/layout-styles-v3-2026-07-16.html` | Silhouette change (eight-point facet), same reflow flag as Honeycomb. |
| `bladewedge` | Blade Wedge | `docs/design/layout-styles-v3-2026-07-16.html` | |
| `ribbonbanner` | Ribbon Banner | `docs/design/layout-styles-v3-2026-07-16.html` | |
| `monolithslab` | Monolith Slab | `docs/design/layout-styles-v3-2026-07-16.html` | |
| `pixeldialog` | Pixel Dialogue | `docs/design/layout-styles-v4-2026-07-16.html` | |

**Hard constraint (unchanged from the original directive, still binding):** every rule set references only `var(--accent)`, `var(--accent-2)`, `var(--card)`, `var(--card-2)`, `var(--text)`, `var(--muted)` — no new hardcoded hues. This is exactly why the original `hud-content-system.css` pass got reverted; don't repeat that mistake. Verify each style against at least two themes (Default + one premium, e.g. Omen Night) before calling it done.

---

## 4. Track B — typography

**Setting A — per-style "Custom Font" toggle**, under the Layout Style picker, defaults **on** when a style is selected. Off reverts header/title font to the app default (`Bahnschrift`/`Oswald`/system stack) while every shape/border rule from that style stays active. Body copy is never affected by either setting.

**Setting B — standalone global "Font" dropdown**, independent of Layout Style and Setting A entirely — applies regardless of which style or toggle state is active.

**4 approved fonts** (from `docs/design/layout-styles-fonts-2026-07-16.html` and `-fonts-v2-2026-07-16.html`): **Orbitron**, **Silkscreen**, **IBM Plex Mono**, **Press Start 2P**. Load only the weights actually used; confirm self-hosting vs. Google Fonts `<link>` against however the app currently loads any web fonts, don't introduce a new pattern.

---

## 4c. Track C — AI-generated frame assets — SKIPPED THIS PASS, reference only

Three frame assets are approved, but they only exist as images pasted into a Claude Code chat session — there is no way to pull those exact files onto disk from here. **Before Codex can build this track, Michael needs to export the 3 approved PNGs from wherever OpenAI generated them and commit them at these paths:**

- `public/assets/layout-frames/circuit-trace.png` — tactical HUD circuit-trace frame
- `public/assets/layout-frames/vine-bloom.png` — botanical vine/leaf corner frame
- `public/assets/layout-frames/thornbound.png` — barbed thorn-vine full-perimeter frame

Each must be: flat single-color (white) linework, fully transparent background, fully transparent/hollow interior (content shows through). All three were verified to meet this spec in the source chat — if the exported file looks different (filled center, added color, anti-aliased gradient edges) don't use it, regenerate first.

**Implementation approach once files exist** — these are raster assets, so they can't use the `var(--accent)` CSS-custom-property technique the CSS/SVG track uses. Instead, use them as a **CSS mask**, which recolors them per-theme despite being PNGs:

```css
[data-layout-style="circuittrace"] .demo-card::before {
  content: "";
  position: absolute;
  inset: -18px; /* frame extends slightly beyond the card edge */
  background: var(--accent);
  -webkit-mask-image: url("/assets/layout-frames/circuit-trace.png");
  mask-image: url("/assets/layout-frames/circuit-trace.png");
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  pointer-events: none;
  z-index: 0;
}
```
Keep real content at `z-index: 3` per the existing rule established across the reference files, so the frame layer never sits above text. Verify the mask recolors correctly on at least two themes exactly like Track A — a mask-image approach is new to this codebase, confirm browser support/rendering matches expectations before treating it as done.

Add three new `layoutStyle` keys once assets land: `circuittrace`, `vinebloom`, `thornbound`.

---

## 5. Testing checklist — don't report any track done until

1. Layout Style left at `"default"` → every page pixel-identical to current production (screenshot diff, not assumption).
2. Each style selected one at a time renders correctly on the in-scope card list (section 2) and leaves nav/charts/meters/grids/inputs completely untouched.
3. Each style checked against at least two themes (Default + one premium) — zero hardcoded color leakage, this is the specific failure mode that sank the original directive.
4. Layout Style persists per profile the same way Profile Border already does (reload, reopen, switch profiles).
5. Custom banner and other per-profile customizations still render correctly under every Layout Style.
6. Custom Font toggle off reverts header font only, shape/border rules stay active; standalone Font dropdown applies regardless of Layout Style/toggle state — test at least one deliberately mismatched combination.
7. `node --check` on every touched file; run the existing visual-audit suite plus full passthrough before deploying.
8. Bump the cache key in `public/index.html` for every changed asset.
9. Given the scope (10 shape styles + fonts), confirm with Michael whether he wants everything built before first release or wants to greenlight a subset first — reasonable to ship incrementally.

---

## PHASE 2 (added same day, after Track A/B shipped in `9f252b4` + `c365895`) — expand coverage app-wide, plus a mandatory text-fit pass

Michael tested the live build and confirmed most of the app is still untouched — the current `public/layout-styles.css` only themes a narrow card list within the 5 pages. He wants near-total coverage: **every button, card, and title in the app gets themed, except the nav bar and the real data-viz SVG/meter components.** This phase is a full audit-and-expand pass plus a mandatory legibility gate — do not commit without running the verification in section 8.

### 6. Confirmed current coverage vs. everything still untouched

Current `public/layout-styles.css` (lines 138-301) only themes this fixed list, repeated identically across the base rule and every one of the 10 named-style blocks:
```
#page-insights .insight-action-hero, .insight-focus-detail, .insight-card, .insight-trend-row, .trend-signal-card
#page-home .weekly-focus-card, .improvement-card
#page-stats .stats-trend-card, .stats-breakdown-cardlet
#page-logging .logging-hero, .logging-live-card, .log-entry
#page-library .gamesense-detail-head, .gamesense-tip, .gamesense-comp-card, .gamesense-comp-option, .gamesense-comp-agent-read, .gamesense-comp-pick-explorer, .gamesense-comp-pick-row, .gamesense-weapon-suggestion, .gamesense-note-block, .gamesense-agent-fact-list article, .gamesense-fact-panel, .gamesense-fact-read section, .gamesense-weapon-guidance section, .gamesense-map-fit, .gamesense-map-fit-item, .gamesense-lineups
```
A confirmed audit (read every `#page-*` container, every card/panel/button class, and every chart/meter component in `app.js`/`app.css`/`index.html`/`public/library/gamesense-library.js`/`.css`) found the app has exactly 5 pages — `#page-home`, `#page-logging`, `#page-stats`, `#page-insights`, `#page-library` — nothing else is a page (everything else, including Customize, is a modal — see section 9 for the scope call on those). **Add every element below to the same selector lists** (the base treatment block at `layout-styles.css:138`, every per-style clip-path/border block, and the font-pass block at `layout-styles.css:303`) — same mechanism Track A already uses, just a longer selector list. Do not invent new visual rules per element; every new selector added below gets the exact same per-style treatment its page's existing elements already get.

**#page-home — add:**
`.loadout-card`, `.compass-panel`, `.compass-main`, `.compass-header`, `.compass-score-card` (button), `.rr-card`, `.impact-card`, `.rr-chart-card`, `.role-filter-btn` (button — currently only has a mobile-scoped rule at `app.css:6070`/`37139`, needs a real desktop rule too), `#spinAgentBtn.small-btn` (button), `#compassDescriptionToggle.compass-description-toggle` (button), `.graph-btn` (button), `#timelineCycleBtn.timeline-cycle-btn` (button), `.compass-title`, `.compass-profile-title`, `.compass-profile-kicker` (titles — add to the font-pass block too).

**#page-stats — add:**
`.stats-summary-card`, `.stats-proof-card`, `.stats-role-progress-card`, `.stats-performance-card` (wraps the already-covered `.stats-trend-card` — themeing the outer wrapper too, don't double up conflicting borders, check visually), `.stats-breakdown-card` (wraps already-covered `.stats-breakdown-cardlet`, same double-up caution), `.stats-maps-card`, `.stats-agents-card`, `.stats-weapons-card`, `button[data-gamesense-open]` (the "Learn Maps/Agents/Weapons" buttons), `#statsActMobileTrigger` (button), `.stats-season-title` (title — font-pass too).

**#page-insights — add:**
`.insights-action-card` (wraps already-covered `.insight-action-hero`, same double-up caution), `.insights-top-card` (wraps `.insight-card`), `.insights-trends-card` (wraps `.insight-trend-row`), `.insight-filter-btn` (button), `.insight-action-kicker` (title — font-pass too).

**#page-logging — add:**
`.logging-card` (wraps `.logging-hero`), `.logging-feed-card`, `.manual-match-panel`, `#loggingTrainingMenuBtn.logging-training-menu-btn` (button), `.logging-chip` (button), `.logging-quick-chip` (button), `.logging-quick-toggle`/`.logging-quick-close` (buttons), `#logCalendarTrigger.logging-calendar-trigger` (button), `#logAgentBrowseBtn.agent-select-symbol` (button), `#logSaveBtn.small-btn` (button).

**#page-library — add:**
`.gamesense-hero`, `.gamesense-topic-card` (button), `.gamesense-entry-card`, `.gamesense-map-entry-card`, `.gamesense-agent-entry-card`, `.gamesense-weapon-entry-card`, `.gamesense-tactical-card`, `.gamesense-agent-hero`, `.gamesense-weapon-panel`, `.gamesense-collection-card`, `.gamesense-skin-preview-card`, `.gamesense-back` (button), `.gamesense-map-view-tabs button`, `.gamesense-tips-tabs button`, `.gamesense-comp-role-tabs button`, `.gamesense-collection-filters button`, `.gamesense-plant-preview-toggle` (button), `.gamesense-section-heading` (title — font-pass too).

### 7. Confirmed exclusions — do not theme these under any style

**Nav bar (already the rule, reconfirmed):** `<header class="app-header">` (`index.html:884`) in full — `.nav-left`/`.nav-logo`/`.nav-links`, `.nav-center` (`#nextRRWidget`/`#goalRRWidget`), `.nav-right`/`.profile-panel#profilePanel`, and its popover (`renderMobileProfilePopover`, `app.js:1723`).

**Real chart/meter/data-viz components — confirmed full list, none of these get touched by any Layout Style, ever:**
- `.chart-row` (`app.css:11831`)
- `.impact-bar-outer` / `.impact-bar-fill` / `.impact-bar-shell` (`app.css:2291` and its theme variants)
- `#compassSvg.sw-compass-mini` — the Skill Snapshot radar/diamond SVG (`index.html:1723-1738`)
- `.compass-bar-track` / `.compass-bar-fill` — its 4 supporting meters (`app.css:17282`, `29141`)
- `.coach-readiness-mini-bar` / `.coach-readiness-locked-bar` — nav profile popover unlock meters (`app.js:12497`, `12514`)
- `.profile-rating-meter` / `.profile-cleanup-meter` — nav profile popover meters (`app.css:52569`, `52841`)
- `.stats-data-visual` / `.stats-confidence-visual` — decorative icon glyphs inside `.stats-breakdown-cardlet` (`app.css:8368-8429`, `app.js:49749-49770`); these read as chart iconography even though static, exclude them too rather than debate it
- No `<canvas>` data-viz exists outside the decorative FX background engine (`app.js:37272`), which is cosmetic, not content — leave it alone regardless, it's outside the card list anyway.

If a card being newly added in section 6 *contains* one of the above as a child element (e.g. `.stats-breakdown-cardlet` contains `.stats-confidence-visual`), the card's border/shape/background still themes normally — just make sure the excluded child keeps its own untouched rendering (should fall out naturally since these rules only touch `border`/`background`/`clip-path`/`box-shadow` on the card container, not its descendants, but verify visually, don't assume).

### 8. MANDATORY — text-fit and legibility verification before any commit

Several of the 10 shapes use `clip-path` corner cuts (`honeycomb`, `aperturecut`, `diamondfacet`, `bladewedge`) or heavy corner/edge decoration (`chevronscan`'s left stripe, `hazardedge`'s left stripe, `ribbonbanner`'s corner flag, `monolithslab`/`pixeldialog`'s offset shadow). None of these are guaranteed to leave enough clear interior space for the real content now being added in section 6 — some of these cards have much longer or more variable text than the original demo card ("Map Preparation Gap" / one line of body copy) this was designed against. **Cut-off or illegible text is a hard blocker, not a polish item** — fix it before moving to the next style, don't batch it at the end.

For every newly-covered element, in every one of the 10 styles, check:
1. **Does any text get visually clipped** by a `clip-path` corner cut, an overlapping decorative stripe/flag, or an offset `box-shadow` — even partially, even one character? If yes, that's a blocker.
2. **Does text overflow its container** and get cut off by `overflow:hidden`, rather than wrapping or shrinking? Also a blocker.

**Fixes, in order of preference:**
- **First, increase interior padding** so the text bounding box sits fully inside the shape's safe area — e.g. for a clip-path that cuts a corner by 18px, the card's padding on that corner's two edges needs to be at least that 18px plus whatever base padding already exists, not the same padding a plain rectangle uses. Compute this per shape, not one blanket padding value for all 10.
- **Second, re-align rather than just pad**, when a fixed decorative element (not a symmetric corner cut) crowds one side — e.g. Chevron Scan and Hazard Edge's left accent stripe should push text alignment/left-inset over to clear it, rather than assuming center-aligned or default-aligned text is fine. Judge per shape which alignment (start/center/end) actually clears the decoration; don't apply one alignment rule to all 10 styles.
- **Third, where content length is variable enough that no fixed padding/alignment can guarantee a fit** (e.g. longer insight descriptions, log notes, gamesense tip text) — **reuse the existing shrink-to-fit utility, don't build a new one.** `scheduleThemeBuilderAutoFitText()` / `runThemeBuilderAutoFitText()` (`app.js:36950`, `37122`) already does exactly this: it shrinks an element's font size via a `--tb-auto-fit-font-size` custom property until the text fits its container. It's currently hard-restricted to `#page-home` only (the check at `app.js:37015`, `if (owningPage.id !== "page-home") return false;`). Extend that restriction to also cover the other 4 pages' Layout-Style-affected containers (or fork a small parallel utility using the exact same shrink-via-custom-property technique if extending the shared one risks unrelated regressions on Home) — don't hand-roll a separate font-shrinking mechanism from scratch.

**Verification, required before committing any of this phase's work:**
- Extend the existing `testing/visual-audit/layout-style.test.js` Playwright suite (already exists from Track A/B) to screenshot every newly-covered element from section 6, under every one of the 10 styles, using **two content-length extremes** per element — the shortest realistic real content it can hold, and the longest realistic real content it can hold (pull real examples from the app, not placeholder lorem — e.g. a one-line vs. a multi-line Insights description, a short vs. long log note).
- Visually inspect every resulting screenshot (read them, don't just assert no console errors) for clipped/cut-off characters, illegible overlap with decorative elements, or overflow. Any failure here is fixed before moving on — this is not a "note it and ship anyway" situation.
- Report back per-style, per-page: confirmed clean, or what was fixed and how.

### 9. Scope call flagged, not silently decided — Customize/Account modals

The audit also found `#editProfileModal` (Customize) and `#accountSupportModal` (Account/Support) are visually rich, tabbed, entirely untouched surfaces with their own buttons/cards/titles (`.profile-edit-tab`, `.auth-switch-control`, `#editProfileSave.pd-item`, `.security-totp-setup`, etc.) — technically "buttons, cards, titles" too. **Recommendation: leave these out of this pass.** They're configuration UI, not coaching content, and the Layout Style picker's own gallery cards (`.layout-style-card`, `.theme-card`, `.border-card`, etc.) living inside one of these modals would create a confusing recursive effect if the modal itself got restyled by the very picker it hosts. Don't build against these unless Michael says otherwise — flagging here so it's a decision, not an oversight.
