# Beta Phase 4 — Port Validated Foundation Into the Real App (2026-08-21)

**Recommended Codex settings: GPT-5.6 Terra · Ultra reasoning · Fast speed.**

**Status: open — not started.**

## Read this first — scope boundary, not optional

This is the step that caused the original teardown. Michael's own words at the time: *"It all started failing when there were options to import account data when there are no bones or foundation to the app."* The foundation now exists and is fully verified (structure, button wiring, dark styling, small-viewport and 4K scaling — see `notes/previews/beta-foundation-shell-reference-2026-08-20.html`, commit `59ca183`). This directive ports that foundation into the real served app. **It does not wire any real data.**

**Explicitly out of scope for this pass — do not do any of this:**
- No real Henrik API calls.
- No real Supabase reads/writes.
- No "import your account" flow, no account linking, no live match data.
- All content stays invented/placeholder, exactly as it is in the reference file today.

Real account porting is the next phase after this one lands and is independently verified — not something to fold in here. If it's tempting to wire in "just one real field" while you're in there, don't — that's precisely the shortcut that broke the last attempt.

## What this phase actually does

Take the validated reference file and make it the real app, served from `beta/public/` by the existing Cloudflare Worker (`beta/worker/index.js`, `wrangler.beta.toml` — both untouched since the teardown, don't modify them unless something below requires it). Right now `beta/public/` is empty.

## Architecture — split into real files, don't ship one inline HTML file

The reference file is intentionally one self-contained file (588 lines with everything inline) — that was right for a reviewable artifact, wrong for a real app. Before the teardown, `beta/public/` was structured as `index.html` + `css/` + `js/` with separate modules (e.g. `play-page.js`, `js/model/insights.js`). Rebuild along those lines:

- `beta/public/index.html` — the shell markup (sidebar, topbar, page containers), referencing external CSS/JS instead of inline `<style>`/`<script>`.
- `beta/public/css/` — split the design tokens and component styles out of the reference file's `<style>` block into real stylesheet(s). Keep the token system exactly as-is (don't redesign it, just relocate it).
- `beta/public/js/` — split the page-transition/tab-switching/state-cycling logic and the per-page content into real modules rather than one inline `<script>` block. Use this as a natural opportunity to separate concerns (e.g. a `nav.js` for routing between pages, per-section files for Play/Review/Learn/Library/Settings content) rather than one giant file — but don't over-architect it either; match the granularity the original app used before the teardown as a reasonable guide.

**[Claude's call]**: exact file boundaries within `js/`/`css/` are Codex's judgment — the goal is maintainability, not a specific prescribed file count. If genuinely unsure, fewer larger files is safer than premature fragmentation.

## Content — carry over exactly, placeholder-for-placeholder

Every page, every button destination, every populated card from the reference file ports over as-is — same invented example content, same wiring, same styling. This is a structural/technical port, not a content revision pass. Don't "improve" copy or restructure anything while porting; if something looks wrong, flag it rather than silently changing it, so Claude can verify the port is faithful to what was already validated.

## Assets — keep placeholders, don't reintroduce stowed assets yet

`beta/_stowed-assets/` holds real preserved assets from before the teardown (agent portraits, weapon images, map layouts, team logos, analytics/library JS modules) — leave them stowed for now. Reintroducing them is a fast, low-risk follow-up once this port itself is confirmed working, not something to bundle in here. Keep using the same placeholder treatment (labeled boxes, generic icons) the reference file already uses.

## How to verify

1. Run the real Worker locally (`wrangler dev` against `wrangler.beta.toml`, or however local dev is normally run for this project) and confirm the app actually serves and loads — not just that the HTML file opens directly in a browser.
2. Click through every nav item, tab, and button, same standard as the reference file's own verification: confirm nothing is broken by the file-splitting (a missed `<script src>`, a CSS file not linked, a JS module not loading).
3. Re-run the same viewport checks already validated on the reference file (no horizontal scroll from ~700px through 3840px, sidebar collapses correctly at 720px, large-viewport scaling still fills the screen proportionally) — confirm the port didn't regress any of this.
4. Do not deploy to production as part of this task. Once Codex reports this done, Claude will independently verify it the same way every prior round has been verified, and deployment is a separate, explicit decision after that — not something to bundle into "porting."

## Report back with

- The final file structure (what got split where).
- Confirmation the local dev server actually serves it correctly.
- Any content or behavior that had to change to make the split work (should be none, but flag anything that did).
