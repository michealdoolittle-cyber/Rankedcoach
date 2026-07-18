# Gamesense Content Audit — Concrete Fixes (2026-07-18)

**Status:** Ready to build. Companion to the full manual review at `docs/GAMESENSE-LIBRARY-CONTENT-REVIEW-2026-07-18.md` and the standard at `docs/GAMESENSE-LIBRARY-CONTENT-STANDARD.md`. Everything in this note is a concrete code/data fix that doesn't require new content research — the big authoring task (23 agents, 7 maps currently running on template filler instead of real content) is intentionally **not** in this directive; see the review doc Part 1.5 for why, and treat it as separate, larger future work using the Content Standard as the target.

---

## 1. Personalized-insight language enforcement — the actual root cause of "even my personalized notes suck"

This is the highest-value fix in this batch. `docs/RANKEDCOACH-VOICE-GUIDE.md` and `docs/COACHING-LANGUAGE-RULES.md` are real and well-built, and the functions that follow them (`polishCoachingInsight`, `polishTrendRead`, `formatTrendCoachAction` — `app.js:4516, 4696, 4255`) genuinely produce good copy. The problem is coverage, confirmed with exact violations currently shipping:

- `getWinrateCoachingSentence("This selected window", ...)` (`app.js:4228`) renders the literal banned phrase "selected window" in player-facing sentences.
- `getStatsTrendQuickTakeaway` (`app.js:4460`) falls back to `"This sample"` as the subject when no kicker/agent is set, directly violating the Voice Guide's "never call them the player, the profile, or the sample" rule.
- The Compass score breakdown tabs (`app.js:7740-7805`) are the worst cluster: "Profile Share," "Raw Weight," "Unrounded model output before the display score is clamped to the 0-100 coaching scale," "Weighted from imported combat accuracy," "Shared model confidence based on imported sample size" — internal-analytics language shipped straight to players.
- `COACHING_LANGUAGE_RULES` (`app.js:4120`, 18 rules) is never executed as a check anywhere — only ever handed to the Ask Coach AI prompt as inert context.

**Root mechanism:** the good polish functions are title-keyed against a fixed whitelist of legacy insight titles. Newer content — the 20 rule-generated cards in `public/analytics/coaching-rules.js`, and the Compass detail tabs — has different titles, so it never reaches the good layer. It falls through to `normalizeRankedCoachCopy` (`app.js:40-76`), a small regex table that doesn't contain most of the Voice Guide's actual banned words (confirmed: none of signal, baseline, scoped, derived, entity, weighted, cumulative, selected window, or profile model appear in that table).

**Fix:**
1. Turn the Voice Guide's banned-word list into an actual enforcement function — a real check against the list already defined in `docs/RANKEDCOACH-VOICE-GUIDE.md` ("Words To Avoid In Main Cards"), not just the small existing regex table. Run it against every player-facing string right before render, not just the legacy title-matched ones.
2. Extend `coaching-rules.js`'s 20 rule-generated cards and the Compass detail-tab strings (`app.js:7740-7805`, `10114`, `10285`, `10417`, `10484`, `7391`, `7451`, `13716`, `19780`) through the same polish/normalize path the legacy titles already get — either widen the title-matching to cover these newer card types, or (cleaner) decouple the polish function from title-matching entirely and apply it universally to any player-facing coaching string.
3. Fix the specific violating strings found above directly: replace "This selected window"/"This sample" fallback subjects with player-addressed phrasing ("Your recent matches," "You," etc.), and rewrite the Compass tab labels in the Voice Guide's actual voice (a rewrite pass on `app.js:7740-7805` specifically — these read like a debug dump, not a coaching card).
4. `COACHING_LANGUAGE_RULES` staying as AI-prompt context is fine to keep for that purpose, but stop treating it as if it were enforcement anywhere else — it isn't, and shouldn't be documented as if it were.

---

## 2. Weapons — three concrete fixes

- **Classic's focus text incorrectly says "pellets"** (`gamesense-reference.js:245`): *"...reserve alternate fire for close movement fights where all pellets can connect."* Classic's alt-fire is a burst, not a shotgun spread — copy-paste artifact from shotgun phrasing. Rewrite to describe the actual burst mechanic.
- **The `locations` field exists on every weapon-suggestion object across all maps but is never rendered.** `renderWeaponSuggestions()` (`gamesense-library.js:554-568`) reads `fit`, `side`, `image`, `weapon`, `roundConversion`/`roundConversionUnavailable`, `conversion`, `evidence`, `note` — never `item.locations`. Either wire it into the render (it's real, useful data — e.g. Bind's Operator: "B Long, A Tower, A Short") or remove the dead field from the data if it's genuinely not wanted; don't leave it silently unused.
- **"Global round conversion" shows the literal unexplained string "Economy-filtered" to players** (`gamesense-reference.js:353-355`, rendered `gamesense-library.js:827`). The code comment explains the real reason (vstats can't expose a defensible unfiltered round-win percentage) but that never reaches the UI. Replace with player-facing copy that actually explains the limitation, matching the honesty pattern already established elsewhere (Bind's `compStatus`, the RR-unverified badge).

---

## 3. Agents — five concrete fixes

- **Raze has real, usable data sitting disconnected.** `gamesense-reference.js:172-176` (pick-rate/map data) and `:203-206` (lore) are complete and real, but Raze isn't in that file's `agents` array, so this data never reaches the player — Raze currently renders from the generated-template tier instead. Wire Raze into the hand-authored `agents` array using this existing data. This is the fastest, highest-value single fix in this whole batch — it promotes one full agent from template-tier to real-tier with zero new research needed.
- **The `facts` field (Global pick rate / Map fit) exists on every one of the 29 agent objects and is never rendered by any UI function** — confirmed, the actual Map Fit panel builds from `agent.maps`/`agent.mapPickRates`/`agent.mapWinRates` directly. Either wire `facts` into a real UI surface or remove it; dead data shouldn't ship on every agent.
- **Killjoy has two abilities both slotted "C - Basic"** (Nanoswarm and ALARMBOT, `gamesense-encyclopedia.js:1279, 1294`) — a genuine data conflict, not just a display quirk. Confirm the correct slots against Riot's live agent data (`valorant-api.com/v1/agents/{killjoy-uuid}`) and fix.
- **Slot-label errors:** Reyna's Devour is labeled "Q - Signature" (`:1854`) — should be "Q - Basic". Tejo's Armageddon, his actual ultimate, is labeled "E - Ultimate" (`:2108`) — should be "X - Ultimate". Verify both against the live API and correct.
- **Two patch-history entries are truncated mid-sentence**: Tejo's (`gamesense-encyclopedia.js:2074`) ends on an open parenthesis, Vyse's (`:2299`) ends abruptly on a colon. Both need the source patch note re-fetched and the text completed or removed if the source itself doesn't support a full sentence.

---

## 4. Verification flag, not a fix

**Miks** (`gamesense-encyclopedia.js:1365-1476`) and **Veto** (`:2164-2275`) were not recognized as current, real Riot agents by either this investigation or the research agent that ran it. Both have real `valorant-api.com` source UUIDs and were pulled from the live API, so this is very likely just recent content neither of us has independent knowledge of yet, not fabricated data — but confirm with a fresh live check against `valorant-api.com/v1/agents?isPlayableCharacter=true` before doing any further work on either agent's content, since building real coaching content around a misidentified or test agent would be wasted effort.

---

## Testing checklist — don't report this batch done until:

1. Section 1's enforcement fix is verified against the exact violating strings quoted above — confirm they no longer render with banned words, not just that the function exists.
2. At least one of the 20 `coaching-rules.js`-generated cards and one Compass detail tab are spot-checked live to confirm they now pass through the same polish path as the legacy insight titles.
3. Raze renders with the real wired-in data (pick rate, lore) instead of template text — confirm live, not just in source.
4. Killjoy's ability slots, Reyna's Devour, and Tejo's Armageddon are verified against a live `valorant-api.com` pull before the labels are corrected, not just reasoned from the summary text.
5. Bind's Operator weapon suggestion shows its location data (or the field is cleanly removed) — pick one concrete case, not just "the field exists now."
6. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
7. Bump the cache key in `public/index.html` for every changed asset.
