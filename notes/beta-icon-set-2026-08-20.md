# Beta Icon Set — Final (2026-08-20)

**Recommended Codex settings: GPT-5.6 Terra · Medium reasoning · Fast speed.**

**Status: ready to build, except K/D.** This supersedes the earlier draft of this document — several icons went through 4 rounds of revision against a picker sheet before landing on these final choices. Every icon below is the literal, locked SVG markup — copy it directly into the icon component/sprite system rather than re-deriving from the artifact history. **K/D is explicitly skipped for now** — do not build a K/D icon yet; leave that stat tile's icon slot empty/pending until a follow-up directive lands.

All icons: 24×24 viewBox, `stroke="currentColor"` (unless noted as filled), 1.4–1.9 stroke-width, outline style, matching the icon language in the conformance spec (Section 13.2). Render 18–20px in nav contexts, 14–16px inline in stat tiles/pills.

---

## 1. Compass pillar icons

| Pillar | Markup | Color token |
|---|---|---|
| Mechanics (Aim) | `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>` | `--brand-hi` |
| Game Sense | `<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z"/><circle cx="12" cy="12" r="2.6"/>` | `--info` |
| Teamwork | `<circle cx="9" cy="9" r="3.4"/><circle cx="16" cy="11" r="3"/><path d="M3.5 19c.7-2.8 2.9-4.4 5.5-4.4s4.8 1.6 5.5 4.4M13.5 19c.5-2.1 2.1-3.3 4-3.3s3.5 1.2 4 3.3"/>` | `--review` |
| Discipline | `<path d="M12 2 20 5v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V5Z"/>` | `--learn` |
| **Mental (final, 2026-08-20)** | `<rect x="3.2" y="9" width="6.6" height="5" rx="1.2"/><rect x="14.2" y="9" width="6.6" height="5" rx="1.2"/><path d="M9.8 11.5h4.4M3.2 10l-1.7-.6M20.8 10l1.7-.6"/>` — rectangular-lens glasses | `--library` |

Use these everywhere a pillar is labeled: Compass card's nested pillar tiles, In-Game's Focus Pillars reference, Review's Improvement Timeline, Settings' Pipeline preview — one icon set, reused, not redrawn per context.

## 2. Game Stats icons

The Game Stats strip (Play dashboard) currently has no icons, text-only. Add one per tile, 14–16px:

| Stat | Markup | Notes |
|---|---|---|
| K/D | — | **Skip. Not yet decided — leave this tile's icon slot empty for now.** |
| Win Rate | `<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3"/><path d="M12 13v3M9 20h6M10 20v-2.5c0-.6.4-1 1-1h2c.6 0 1 .4 1 1V20"/>` | Trophy |
| ACS | `<path d="M12 6.5c1.6 2 3 3.6 3 6a3 3 0 0 1-6 0c0-1.3.6-2.1 1-2.9.1 1 .7 1.5 1.2 1.5.6 0 .8-1 .8-1.7 0-.9-.5-1.9 0-2.9Z"/><circle cx="12" cy="12" r="9"/>` | Flame inside a badge ring — flame drawn first, ring circle drawn after so it frames the flame |
| KAST | `<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/>` | 4-quadrant grid (represents Kill/Assist/Survive/Trade) |
| HS% | `<path d="M12 3.5a5.2 5.2 0 0 0-5.2 5.2c0 2.3 1.1 3.6 1.9 4.4v1.4h6.6v-1.4c.8-.8 1.9-2.1 1.9-4.4A5.2 5.2 0 0 0 12 3.5Z"/><circle cx="9.8" cy="8.8" r="1.1" fill="currentColor" stroke="none"/><circle cx="14.2" cy="8.8" r="1.1" fill="currentColor" stroke="none"/><path d="M9.5 14.7v1.3M12 14.7v1.8M14.5 14.7v1.3"/><circle cx="12" cy="10" r="5" stroke-width="1.3"/><path d="M12 5v3M12 12v3M7 10h3M14 10h3" stroke-width="1.3"/>` | Skull with the **real production crosshair** (`getTrainingCrosshairMarkup()`, `public/app.js:504`) overlaid on top, centered. Use this exact composite, not a redrawn crosshair. |
| Matches Total | `<path d="M4 6h2M4 12h2M4 18h2"/><path d="M9 6h11M9 12h11M9 18h11"/>` | List |

## 3. Impact & Confidence pills — redesigned

Both pill types get an icon prefix instead of text-only:

- **Impact pill**: a 3-bar intensity glyph (ascending bar heights, like a signal-strength icon). Fill count = level: High = all 3 bars filled, Medium = 2 filled + 1 dimmed (28% opacity), Low = 1 filled + 2 dimmed. Same red/amber/gray color coding as today, just with the bars added.
- **Confidence pill**: a mini radial-progress ring filled to the confidence percentage. Formula: `stroke-dasharray = (pct/100 * 37.7).toFixed(1) + " 37.7"` on a `r="6"` circle (circumference ≈37.7), rotated -90° so the fill starts at 12 o'clock. Background ring at 25% opacity of the same color underneath.

Apply both redesigns everywhere impact/confidence pills currently appear: Today's Focus, In-Game Focus, Top Insight, Focus Queue cards. **Do not** apply this to the Focus Queue modal's dedicated gradient confidence bar — that's a different, already-correct component.

## 4. Reference-section icons

Used in: In-Game's Quick Reference, the dashboard's bottom reference row (Section 8 of the Play directive), and anywhere else these categories are referenced (Learn, Library if applicable).

| Section | Markup | Notes |
|---|---|---|
| Map Notes | `<path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2Z"/>` | Unchanged |
| All Reflections | `<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 3v18M9 8h7M9 12h7M9 16h4"/>` | Journal/notebook |
| Agent Tips | `<circle cx="12" cy="8" r="3.4"/><path d="M5 20c.8-3.6 3.4-5.6 7-5.6s6.2 2 7 5.6"/>` | Agent bust |
| **Lineups (final, 2026-08-20)** | `<g transform="rotate(-32 12 12)"><rect x="3" y="9" width="18" height="6" rx="1"/><path d="M7 9v2.3M10.5 9v2.8M14 9v2.3M17.5 9v2.8"/></g>` | Diagonal ruler with graduation ticks |
| Economy | `<circle cx="12" cy="12" r="8"/><path d="M9.5 9.3c0-1 1-1.8 2.5-1.8s2.5.7 2.5 1.6c0 2.2-5 1-5 3.2 0 .9 1 1.7 2.5 1.7s2.5-.8 2.5-1.8M12 6.2v1.3M12 16.5v1.3"/>` | Coin |
| Weapons | `<path d="M2.5 4.5h13l3.5 1.5-3.5 1.5h-13Z"/><path d="M2.5 10h13l3.5 1.5-3.5 1.5h-13Z"/><path d="M2.5 15.5h13l3.5 1.5-3.5 1.5h-13Z"/>` | 3 even-height horizontal bullets |

## 5. Settings

**Use the exact icon already in production — do not redraw.** Source: `public/index.html:1224-1229` and the fallback in `getSettingsGearMarkup()`, `public/app.js:1943-1950`.

```html
<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M9.59 3.94c.09-.54.56-.94 1.11-.94h2.6c.55 0 1.02.4 1.11.94l.21 1.28c.06.38.31.69.65.87l.22.13c.32.2.72.26 1.07.12l1.22-.45c.51-.19 1.09.01 1.37.49l1.3 2.24c.27.48.16 1.08-.26 1.43l-1 .83c-.3.24-.44.61-.43.99v.26c-.01.38.13.75.43.99l1 .83c.42.35.53.95.26 1.43l-1.3 2.24c-.28.48-.86.68-1.37.49l-1.22-.45c-.35-.14-.75-.08-1.07.12l-.22.13c-.34.18-.59.49-.65.87l-.21 1.28c-.09.54-.56.94-1.11.94h-2.6c-.55 0-1.02-.4-1.11-.94l-.21-1.28c-.06-.38-.31-.69-.65-.87l-.22-.13c-.32-.2-.72-.26-1.07-.12l-1.22.45c-.51.19-1.09-.01-1.37-.49l-1.3-2.24c-.27-.48-.16-1.08.26-1.43l1-.83c.3-.24.44-.61.43-.99v-.26c.01-.38-.13-.75-.43-.99l-1-.83c-.42-.35-.53-.95-.26-1.43l1.3-2.24c.28-.48.86-.68 1.37-.49l1.22.45c.35.14.75.08 1.07-.12l.22-.13c.34-.18.59-.49.65-.87l.21-1.28Z" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path>
  <path d="M15.2 12a3.2 3.2 0 1 1-6.4 0 3.2 3.2 0 0 1 6.4 0Z" fill="none" stroke="currentColor" stroke-width="1.9"></path>
</svg>
```

Replace the crude 4-tick placeholder currently in the beta sidebar footer with this exact markup — pixel-identical to the desktop profile-dropdown toggle and mobile header settings button already in production.

## 6. Sidebar nav icons — Loadout, In-Game, Review

| Nav item | Markup | Notes |
|---|---|---|
| Loadout | `<path d="M4 12a8 8 0 0 1 13.7-5.7M20 12a8 8 0 0 1-13.7 5.7"/><path d="M17.7 3v3.3H14.4M6.3 21v-3.3h3.3"/>` | Shuffle arrows (final, 2026-08-20) |
| In-Game | `<path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3"/><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/>` | Viewfinder corner-brackets + center dot |
| Review | `<circle cx="12" cy="13" r="8"/><path d="M10 3h4M12 3v2"/><path d="M19 6l1.5-1.5"/><path d="M12 9v3.3l2.3 1.4"/><path d="M8.7 14.9l1.5 1.5 3-3.4" stroke-width="1.3"/>` | Stopwatch with hands + a checkmark (final, 2026-08-20 — supersedes the earlier "keep the bar-chart" note) |

---

## How this will be reviewed

1. Compare every icon against this document's literal markup at actual usage size (14–20px) — an icon that reads clearly at 26px in the reference sheet needs to still read clearly at real usage size.
2. Confirm K/D's icon slot is genuinely empty/pending, not filled with a guess.
3. Confirm the Settings gear is byte-identical to `public/index.html:1224-1229` — this is a reused production asset, not a new drawing.
4. Confirm HS%'s crosshair overlay matches `getTrainingCrosshairMarkup()` (`public/app.js:504`) exactly, not a redrawn approximation.
5. Confirm no duplicate/inconsistent icon exists for the same concept across pages (e.g., Compass pillar icons must be pixel-identical wherever pillars are labeled).
6. Confirm the Impact/Confidence pill redesign didn't get applied to the Focus Queue modal's dedicated gradient confidence bar.
