# Promotion Never Actually Landed the Correct Drafts — Sequencing Bug (2026-07-24)

**Status: ready to fix.** Michael reported the Library still shows the same text after Codex claimed the reconciliation directive was complete. Confirmed directly, precisely, with evidence — this is not "not visible yet," the correct content genuinely never reached the live files.

## What actually happened, in order

1. `public/library/_drafts/.baseline-promotion-complete.json` shows the one-time baseline exception was consumed at **`2026-07-23T19:15:24.047Z`**, claiming `"changedEntities": 61`.
2. But `map-bind.json`'s draft — checked directly — has all 24 real callouts, correctly sourced (`sourceKey`, `regionName`, `superRegionName`, real `x`/`y` positions from `valorant-api.com`). Its `_meta.generatedAt` is **`2026-07-23T19:50:34.311Z`** — 35 minutes *after* the baseline exception was already spent.
3. The live `gamesense-maps.js` still shows Bind at 10 callouts, not 24 — confirmed directly, not assumed.
4. A later promotion-plan run (`_promotion-plan.json`, generated `19:50:35`, one second after the good draft) shows `"baselineRequested": false, "changedEntities": []` — correct behavior for a non-baseline run, since nothing has `approved: true` yet. This is not a bug in that specific run; it's operating correctly on the assumption that the baseline exception was already used.

**Net effect:** the one-time exception got burned on an earlier, incomplete draft batch before the actually-correct, fully-researched drafts were ready. The good data is real and sitting in `public/library/_drafts/`, but it's now locked behind the normal per-field review gate (`scripts/promote-library-drafts.mjs:397-399`'s guard against reusing `--baseline`), and nothing has been reviewed/approved yet, so it never promotes. Michael is correctly seeing the same old text — because he is, in fact, still looking at the same old text.

## The research quality problem from the prior directive appears resolved

Worth stating plainly since it's good news: the actual sourcing discipline this time looks real — Bind's draft callouts are genuinely complete and properly attributed to Riot's own data, not fabricated or copied from a stale list. The failure here is a pipeline sequencing bug, not a research-quality regression.

## Fix

1. **Do not simply re-run `--baseline`** — it will hit the guard at line 397-399 and throw, since the marker file already exists.
2. Since the one-time exception's actual purpose (reach a correct baseline in one shot) was never achieved — the live files still don't reflect a correct baseline — reset it deliberately: delete or archive `public/library/_drafts/.baseline-promotion-complete.json`, log why (this exact sequencing bug, with a pointer to this note), and re-run `node scripts/promote-library-drafts.mjs --baseline` (no `--plan`) against the **current** draft set now sitting in `_drafts/`.
3. Verify directly afterward — don't just report done: confirm `gamesense-maps.js` actually shows Bind at 24 callouts (not 10), spot-check 2-3 other entities' live content against their corresponding drafts, and bump both stale cache keys (`gamesense-maps.js?v=20260715-...`, `gamesense-reference.js?v=20260721-...`) so the app doesn't serve a cached copy on top of a correct fix.
4. Once confirmed correct, the marker re-locks automatically (per the script's existing behavior) — the one-time exception should not be available a third time. Anything after this point goes through the normal per-field review process, as already reconciled.

## Process fix, so this exact bug doesn't recur

Before consuming any one-time or otherwise irreversible promotion step, confirm every draft being promoted is actually the final, current version — check `_meta.generatedAt` timestamps across the whole batch and hold off if any are still being actively regenerated. A one-time exception spent on a half-finished batch is worse than not using it at all.

## Testing checklist

1. Confirm the baseline marker reset is logged (why, when, pointing at this note) rather than silently deleted.
2. Confirm the re-run promotes real content — `gamesense-maps.js` shows Bind at 24 callouts, Breeze at 23, Split at 24, matching the drafts exactly.
3. Confirm cache keys are bumped and the app actually shows the new content after a hard refresh, not just that the source files changed.
4. Confirm the marker file exists again afterward and a subsequent `--baseline` attempt correctly refuses to run a second time.
5. `node --check` on every touched file.
