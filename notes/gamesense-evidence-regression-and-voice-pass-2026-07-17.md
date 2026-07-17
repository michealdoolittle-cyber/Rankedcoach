# Two Follow-Ups from Reviewing the Accuracy Fixes (2026-07-17)

Found while reviewing the (uncommitted) work against `notes/gamesense-library-accuracy-fixes-2026-07-17.md`. Both are real, confirmed issues — not style opinions.

---

## 1. Regression: weapon `evidence` field deleted, not fixed — restore it

`notes/gamesense-library-accuracy-fixes-2026-07-17.md` section 3 asked to fix the *inconsistency* in the `evidence` field (Ghost's hand-typed stat string duplicated identically across 3 maps, format mismatch with other weapons on the same map) — either derive it from the canonical stat object or standardize the format. The actual change removes the `evidence` field entirely from all 15 weapon suggestion entries across Bind, Breeze, and Split (`gamesense-maps.js`).

**This is a real regression, confirmed live in the render path:** `gamesense-library.js:405` renders `<p class="gamesense-weapon-evidence">${escapeHtml(item.evidence)}</p>` unconditionally, with no check for whether `evidence` exists. `escapeHtml`'s default parameter (`value = ""`, `gamesense-library.js:64`) means this doesn't crash or print "undefined" — it silently renders an empty `<p>` — but every weapon suggestion card on every map now has a blank gap where real K/D/damage/cost info used to be. That's a content-quality loss, not a fix.

**Fix:** restore `evidence` with correct, de-duplicated content. Pick one:
- (a) Derive each weapon's evidence string from its canonical stat object in `gamesense-reference.js:weaponCatalog` instead of hand-typing it per map — this is the more durable fix and solves the drift risk permanently.
- (b) At minimum, standardize the format (pick one presentation — live K/D+damage, or cost+mechanic — not a mix) and de-duplicate the Ghost string to one source.

Don't just leave the field empty — if a decision is made to genuinely retire the concept, that's a legitimate call, but then also remove the now-dead `.gamesense-weapon-evidence` markup from the render so there's no blank paragraph tag left behind, and confirm with Michael that dropping this info entirely (rather than fixing it) is actually what's wanted, since it wasn't what was asked for.

**Verify:** screenshot at least 2 weapon suggestion cards per map (6 total) after the fix and confirm real content renders, not a blank line.

---

## 2. Gamesense Library needs its own voice pass — separate from the personalized-read voice guide

`docs/RANKEDCOACH-VOICE-GUIDE.md` (added in the coaching-language-rules work) is a good, well-built guide — but it's written entirely for *personalized* player reads (Compass, Weekly Focus, Insights, Ask Coach): the "you" voice, evidence/causality rules, sample-size rules. **The Gamesense Library (maps, agents, weapons — `gamesense-maps.js` / `gamesense-reference.js`) is a completely separate content system with no voice guide covering it at all**, and it shows: Michael's read after this pass is "a lot of the wording is still not human like... too forward... doesn't sound like Valorant."

Confirmed by reading the actual rewritten Bind text just shipped — concrete examples of the problem:
- *"Draw utility or defenders first, then arrive at the exit together instead of treating first contact as a forced site commitment."* — "arrive at the exit together" has no clear subject, reads like a translated instruction, not spoken coaching.
- *"hold disciplined defaults into double Initiator so repeated information sees no commitment"* — "information sees no commitment" is an awkward personification nobody would actually say.
- *"Before barriers drop, name the first lane, the teleporter trigger, and the reset condition."* — "the teleporter trigger" and "the reset condition" are dense noun-compounds, not natural phrasing.
- *"Call whether the exit player is selling Hookah pressure or joining the hit before the audio plays."* — "before the audio plays" is ambiguously placed and reads like a technical spec, not a coach talking.

**The core problem:** this content reads like it was optimized for information density (correct facts, packed tightly) rather than natural spoken rhythm. It's also stacked almost entirely in imperative commands ("Clear Showers before...", "Take and hold...", "Keep Long or Octagon...") rather than the more natural mix of description-then-guidance a real coach or strategy writeup uses — this is likely what Michael means by "not 3rd person enough": general map knowledge should read more like an objective explanation of how the map works and why a position matters, not a stacked list of orders.

**Directive:** write a second voice-guide addendum (or a new doc, `docs/GAMESENSE-LIBRARY-VOICE-GUIDE.md`) specifically for this content type — general map/agent/weapon knowledge, not personalized to the player. Suggested standard, drawing on the same "what/why/what to do" spine as the existing guide but adjusted for this voice:
- Lead with what the position/pattern actually is or does (descriptive), then why it matters (the consequence), then what to do about it (the guidance) — not guidance-first commands stacked back to back.
- Avoid noun-compound jargon ("teleporter trigger," "reset condition," "destination group," "exit fight") — say it the way a player would say it out loud.
- Vary sentence rhythm — not every sentence needs to be a command; descriptive statements ("Showers is the position that splits the site if it's left uncleared") read more human than constant imperatives.
- Re-run this lens across the already-shipped Bind rewrite before moving to any other map — it doesn't need to be redone for facts (those are correct now), just for how it reads.

**Verify:** have Michael read the rewritten Bind content again specifically for voice, separate from fact-checking, before applying the same pass to Breeze/Split or any other map/agent.
