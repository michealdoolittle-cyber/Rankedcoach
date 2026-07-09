# RankedCoach Visual & Functionality Passthrough Checklist

Two-tier process: a **Full Passthrough** (this doc, run before major milestones or after a batch of unrelated changes) and a **Scoped Passthrough** (run after any single change, covering only what that change could plausibly have touched).

First full passthrough ran 2026-07-06 — see `CORRECTIONS.md` for the baseline findings (3 high, 3 medium, 2 needing manual confirmation) before making further sweeping changes.

## How To Run The Automated Harness

```
cd testing/visual-audit
node audit.js
```

This serves `public/` on `127.0.0.1:41777`, drives the real guest-entry UI (no test-only hooks — it clicks the same buttons a player clicks), and captures for every combination of:
- **Viewport**: `mobile` (390x844) and `desktop` (1440x900)
- **Guest state**: `blank` (empty profile, tests empty/locked states) and `demo` (sample matches loaded, tests populated states)
- **Surface**: Home / Logging / Stats / Insights pages, plus profile dropdown, profile switcher, profile rating dropdown, edit-profile theme selector, import-history modal, Ask Coach panel, bug-report modal

Output lands in `testing/visual-audit/output/<viewport>/<state>/*.png`, plus `console.log.json` (browser console errors/warnings per run) and `report.json` (horizontal-overflow flags per surface).

**2026-07-06 mobile nav redesign:** Mobile Profile Rating / Coach Readiness is now inside the combined avatar popover opened by `#mobileHeaderProfileBtn`. Mobile settings open from `#mobileHeaderSettingsBtn`. The bottom bar is page navigation only (`.mobile-bottom-page-btn[data-mobile-page="..."]`).

**Account & Support modal:** Import History and the Tracker.gg profile URL field now live on the Logging page near manual entry. Settings -> Account & Support is now a 2-tab modal (`Account` / `Support`) used for security/auth actions, Bug Report, Tip to Dev, support links, and legal links. When adding modal tests, open `#pdAccountSupportBtn` first and then choose the relevant tab.

The harness is intentionally cheap to extend — add a new page to `PAGES` or a new entry to `MODALS` in `audit.js` when a brief adds a new screen or modal, so it stays current instead of drifting from the real nav.

**Mobile vs desktop use different DOM entry points for the same action** � desktop keeps the real header controls (`#profileAvatarWrap`, `#profileDropdownToggle`, `#profileRatingWidget`, `#askCoachOpen`, `#bugReportOpen`, `#profileSyncBtn`). Mobile now uses the rebuilt two-row header (`#mobileHeaderProfileBtn`, `#mobileAskCoachOpen`, `#mobileHeaderSettingsBtn`) and a nav-only bottom shell (`.mobile-bottom-page-btn[data-mobile-page="..."]`). Profile Rating lives inside the avatar popover, and Bug Report lives under Settings -> Account & Support -> Support.

**Full-page screenshots don't capture nested scroll containers past their visible bounds.** `page.screenshot({fullPage:true})` expands to the outer page's scroll height, but a modal with its own internal `overflow:auto` panel (e.g. the Theme Selector's swatch gallery) only shows what's visible in that panel at capture time — a partially-visible last row at the bottom of such a panel is very likely just normal scrollable content, not a clipping bug. Confirm by manually scrolling before filing it as a correction (see `CORRECTIONS.md` #7 for an example this tripped on).

## Full Passthrough — What To Check Per Screenshot

For **every** surface x viewport x state combination:

- [ ] No horizontal scroll/overflow (check `report.json` `hasHorizontalOverflow`, then confirm visually — some overflow is clipped and invisible but still breaks tap targets)
- [ ] No overlapping text or elements that aren't intentionally layered (compare mobile vs desktop — a fix on one is a common source of a new conflict on the other)
- [ ] No text clipped, truncated without ellipsis, or wrapping into a neighboring element
- [ ] No broken/missing images (blank box, alt-text fallback showing)
- [ ] Consistent spacing/alignment with sibling elements on the same screen
- [ ] Empty state (guest: blank) reads as "not enough data yet," not as broken/blank
- [ ] Populated state (guest: demo) doesn't overflow with realistic data volume (long agent names, 3-digit stats, etc.)
- [ ] Modal open/close doesn't leave a stray backdrop, scroll-lock, or focus trap behind
- [ ] Nav active-state highlight matches the currently visible page
- [ ] `console.log.json` has no new errors (warnings are lower priority but worth a scan)
- [ ] Tap targets on mobile are large enough to hit distinctly (no two adjacent buttons closer than ~8px)
- [ ] Copy matches the established coaching-language rules in `notes/copy-language.md` (player language first, no internal jargon)

## Scoped Passthrough — Pick The Rows That Apply

Run this instead of the full pass when a change is narrow. Match the change to the surfaces it can touch, then only check those:

| If you touched... | Check these surfaces |
| --- | --- |
| `public/app.css` global rules, CSS variables, or root layout | Full passthrough — global CSS regresses everywhere |
| Nav bar / header | Home, Logging, Stats, Insights (nav is shared across all four) |
| Profile avatar, border, or theme code | profile-switcher, profile-dropdown, edit-profile-theme modal, both viewports |
| Match Record schema / manual mode fields | Logging page, Stats page (any card reading match stats) |
| Screenshot import flow | import-history modal, both viewports, both states |
| Coach Readiness / unlock progress UI | Home page (nav-right widget), profile-rating dropdown |
| Insight cards / weekly coaching copy | Insights page, both states (empty vs populated reads differently) |
| Chart/graph rendering | Stats page, both viewports (chart legend/axis crowding is a recurring mobile issue) |
| Ask Coach | ask-coach modal only |
| Any copy/string change | The specific screen that string appears on, both viewports — check for reflow if the new string is longer |

## Recording New Issues

Add anything found — from either pass, or spotted manually outside the harness — to `testing/visual-audit/CORRECTIONS.md` using the same format as existing entries (surface, viewport, state, severity, description, suggested fix). Do not fix silently; log first so Claude can review scope/priority before Codex implements.
