# Layout Style Overreach — Fix the Border Treatment Bleeding Into Every Nested Element (2026-07-16)

**Status:** Ready to build. Michael tried a shipped Layout Style (`hazardedge`) live across Home, Logging, Stats, Insights, and Library, and reported it: cuts off important text, applies the decorative border to internal/nested elements instead of just parent cards, and "looks overwhelming" everywhere. He confirmed **this affects every layout style, not just this one** — screenshots attached showed the same problem repeated on every page. I checked `public/layout-styles.css` directly rather than guessing at the cause, and found the exact, precise bug — this is fixable as a targeted correction, not a redesign.

---

## 1. Root cause, confirmed in the actual CSS

`public/layout-styles.css:482-489` (the `hazardedge` block, but this exact selector list is **not unique to it**):

```css
body[data-layout-style="hazardedge"] :is(
  .compass-profile-title,.compass-profile-kicker,.compass-score-card,.role-filter-btn,#spinAgentBtn,#compassDescriptionToggle,.graph-btn,#timelineCycleBtn,
  button[data-gamesense-open],#statsActMobileTrigger,.stats-season-title,.insight-filter-btn,.insight-action-kicker,#loggingTrainingMenuBtn,.logging-chip,.logging-quick-chip,.logging-quick-toggle,.logging-quick-close,#logCalendarTrigger,#logAgentBrowseBtn,#logSaveBtn,
  .gamesense-back,.gamesense-map-view-tabs button,.gamesense-tips-tabs button,.gamesense-comp-role-tabs button,.gamesense-collection-filters button,.gamesense-plant-preview-toggle,.gamesense-section-heading
){
  --layout-surface-border-left-width:6px;
  --layout-surface-safe-left:18px;
}
```

This applies the **same heavy decorative border treatment** (6px border-left, 18px reserved padding, and for some styles a full repeating-stripe background) to small interactive controls — filter buttons, tabs, chips, close buttons, section headings, "back" buttons — as it does to actual top-level content cards. **This exact selector list is duplicated verbatim 7 times in the file** (confirmed via grep) — meaning most or all of the 20 style variants share this same copy-pasted overreach, not just `hazardedge`. That's exactly why Michael saw it on every page and every style: it's systemic, not style-specific.

A button like `#spinAgentBtn` or a tab in `.gamesense-tips-tabs` getting a 6px striped border plus 18px of reserved padding is visually loud on an element that size, and repeated across dozens of small controls per page, that's what reads as "overwhelming" and "borders on internal elements instead of parent cards."

**Likely cause of the text-cutoff complaint too:** `--layout-surface-safe-left`/`-top`/`-right`/`-bottom` are meant to reserve padding so the decorative border doesn't overlap content — but if that reserved space is being added on top of an element's existing padding rather than accounted for in its box model (or if a small button simply doesn't have 18-32px of spare width to give up), the result is exactly what got reported: cramped or clipped text. Audit whether `--layout-surface-safe-*` is actually wired into `padding`/`box-sizing` correctly for every element in that broad list, especially the small ones — a value tuned for a large card (some styles reserve up to 32px, confirmed at line 204) is very likely wrong for a button.

---

## 2. The fix — two tiers, not one shared treatment

**Tier 1 — top-level content cards get the full decorative treatment.** This should be the *only* place the heavy border/background/safe-padding system applies. Cross-reference against the already-approved scope from `notes/hud-border-tag-ruleset-2026-07-15.md` (Insights cards, Home's Weekly Focus/Recent Improvement, Stats' Recent Match Trends/Match Patterns specifically, Logging's Session Debrief/log entries, Library dossier/tips/comps/weapon-suggestion/fundamentals cards) — that scope list was already fought for and approved once; re-apply it here rather than the broader list currently in the CSS. Verify each class actually in the current "card" selector block (`layout-styles.css:491-503`: `.compass-main`, `.impact-card`, `.stats-proof-card`, `.stats-role-progress-card`, `.stats-trend-card`, `.stats-breakdown-cardlet`, `.insight-action-hero`, `.insight-card`, `.insight-trend-row`, `.logging-hero`, `.logging-live-card`, `.log-entry`) genuinely renders as a top-level card and not a smaller nested tile — `.stats-breakdown-cardlet` and `.insight-trend-row` in particular sound like they could be sub-row elements inside a bigger card rather than cards themselves; confirm live before keeping them in the heavy-treatment tier.

**Tier 2 — small interactive controls (the entire list at `layout-styles.css:482-485`, repeated 7×) get little to no decorative treatment.** Remove `--layout-surface-border-left-width` and `--layout-surface-safe-left` entirely from this list, or replace with something genuinely lightweight (e.g., a 1-2px underline on the active state only, no reserved padding change). Do this as one shared rule reused by all styles rather than copy-pasted per style, both to fix the bug everywhere at once and to stop this exact mistake from recurring the next time a style is added.

**Don't treat this as a full redesign of any style** — the shape/border *concepts* the 20 styles are built around are still the right direction (per Michael's earlier feedback that the ruleset itself, gradient borders and the tag shape, was good). This is specifically about *where* the treatment applies, not what it looks like.

---

## Testing checklist — don't report this batch done until:

1. Fresh screenshots of Home, Logging, Stats, Insights, and Library with `hazardedge` active show the decorative border only on genuine top-level cards — no buttons, tabs, chips, or section headings carrying it.
2. No visible text clipping, cramping, or awkward wrapping anywhere on any of those 5 pages with `hazardedge` active — compare directly against Michael's attached screenshots' specific trouble spots (Stats' individual stat tiles, Library's per-agent pick tiles, Home's window-size button column) to confirm those exact spots are fixed, not just spot-checked elsewhere.
3. Since the same selector list repeats 7× in the file, confirm the fix is applied to **all** affected style blocks, not just `hazardedge` — grep the final file for the old broad selector list to confirm zero remaining instances of the heavy treatment applied to small controls.
4. Default layout style (no attribute) remains completely unaffected — this is a fix to the non-default styles only.
5. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
6. Bump the cache key in `public/index.html` for every changed asset.
