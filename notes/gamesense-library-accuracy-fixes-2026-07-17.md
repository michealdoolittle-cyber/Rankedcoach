# Gamesense Library — Accuracy Fixes from runnydraws#Dripy Review (2026-07-17)

Michael reviewed the Library's actual content (not just layout/UI) and found real factual errors in map strategy and agent/weapon descriptions. Confirmed every item below against the live source files first — this is not guesswork. **All Gamesense Library content is 100% hand-authored static JS with zero live-data backing** (`public/library/gamesense-reference.js` for agents/weapons, `public/library/gamesense-maps.js` for maps) — there is no API or external source currently feeding any of this, which is exactly how errors like the duplicated Ghost stat string below happened.

**On Michael's "verified resources" ask — two different problems, two different fixes, don't conflate them:**
- Weapon *stats* and ability *tooltip* text are official Riot data. `valorant-api.com` (already used in this codebase for skin cosmetics, `gamesense-collections.js:238`) has an agents/weapons endpoint with Riot's own numbers and ability text. Worth evaluating switching those specific fields to a live fetch instead of hand-typed copy — that removes an entire class of "just wrong" errors and stat drift (see the Ghost duplication issue in section 3).
- Map round-reads, site strategy, and teamplay tips are coaching judgment, not official data — no API provides this, it's not automatable. The realistic fix is a review process, not a data source: date-stamp reviewed content (the reference file's header comment already does this) and treat every future map/agent addition as needing the same kind of pass this note represents, rather than one-off cleanup.

---

## 1. Bind — factual corrections, `public/library/gamesense-maps.js:78-107`

**Attack macro read #1** (`macro.attack[0]`, line 87) — currently:
> "Bind has no mid, so once you commit to a site the rotation is fully committed too — there's no cheap way to redirect mid-execute."

**Wrong.** Bind's lack of mid is compensated by two teleporters, which give it the *fastest* rotation potential of any map, not a committed one. Rewrite to reflect that the teleporters are the actual rotational tool this map is built around, not a description of a limitation that doesn't exist.

**Attack macro read #2** (`macro.attack[1]`, line 88) — currently:
> "Target whatever gap the enemy's agent picks create, rather than defaulting to the same site read every round."

Michael's flagged this as too thin — wants it developed into real comp-based strategic advice, along these lines: double-sentinel defenses may call for breaking utility early and committing late; double-controller defenses reward committing earlier since smokes will be on constant rotation and utility is limited; double-initiator defenses reward committing to defaults since information is worth less against them; double-duelist defenses reward either more aggressive plays or holding lanes/areas, since information is key against them. Expand along these lines rather than replacing with a single generic sentence.

**Defense macro reads** (`macro.defense`, lines 82-84) — currently anchor entirely on "Shower control." Michael's direction: expand to name **Hookah, Showers, Octagon, and U-Haul** together as the high-value areas worth doubling up on, because holding them makes retakes easier, provides flank routes, and enables faster rotations — versus playing straight sites, which invites a flood of utility and forces poor retake positions. Also: defense read #2 currently reads generically about "defensive setup" — make it name **A site** specifically, not a generic phrase. Defense read #3 — replace with something in the register of "Look for common patterns, and strategize to punish them early, rather than late."

**Site tips** (`siteTips`, lines 92-95) — these have real callout/location errors, not just phrasing issues:

| Current (wrong) | The actual error |
|---|---|
| `"Clear Lamps before the spike crosses Truck; leaving it live lets one defender split the entire plant setup."` | **Wrong callout.** It's **Showers** that splits the site if left uncleared, not Lamps — Lamps is actually protected from that split angle. |
| `"Bath control creates the open plant and removes the safest close retake path. Hold it through the plant instead of abandoning it on entry."` | **Wrong callout.** **Lamps/U-Haul** is the closest retake path for defenders, not Bath. |
| `"Pair the Hookah drop with B Long pressure so defenders cannot aim at both elevations at once."` | Not a naming error — this is just **bad strategic advice**. Splitting sites is more effective than this single-pronged two-elevation play; don't recommend it. Replace with actual split-site strategy. |
| `"Keep Elbow and Defender Spawn cut while the spike is planted for Long; otherwise the planter is exposed before the post-plant begins."` | Same issue as above — this is baseline knowledge every player already has (smoke angles before planting), not useful coaching. Separately: **the word "cut" is wrong terminology** — utility denies an angle by being "covered down on" or "smoked off," not "cut." Fix the word choice everywhere it appears in this file, not just here. |

**Teamplay tips** (`teamplayTips`, lines 98-100) — Michael's assessment: all three current entries ("Teleport timing," "Two-lane hits," "Post-plant jobs") are weak. Redirect this section toward real teamplay strategy: common fakes, eco-round strategy, and strong round-plan execution — not generic reminders.

**Role notes** (`roleNotes`, lines 103-106) — flagged as "more than subpar," needs a real review pass. **Important: several of these reference Lamps/Bath by name** (e.g. Duelist's "Clear Lamps and Hookah," Sentinel's "...or Bath contact") — cross-check every one of these against the corrected Showers/Lamps facts above before leaving them as-is; they may be repeating the same wrong mental model the site tips had.

---

## 2. Weapon/ability description fixes — `public/library/gamesense-reference.js`

**Jett — Tailwind** (`ability("tailwind", ...)`, line 35), currently:
> "Prime a dash, then propel in the movement direction or forward while stationary."

**Wrong mechanic description.** This isn't a two-step "prime, then propel" action — Tailwind is a single instant activation that dashes in your current movement direction (or forward if standing still). You can dash while moving; there's no separate priming step. Rewrite to something like: "Instantly dash in your current movement direction, or forward if standing still."

**The same "prime the dash" mistake is duplicated in Jett's fundamentals** (line 25): *"Tailwind makes Jett one of the safest Operator holders: prime the dash, take a one-and-done angle, and finish the shot beside cover you can dash behind."* Fix this occurrence too — it's the same wrong mechanic, repeated.

**Jett — Blade Storm** (`ability("blade-storm", ...)`, line 37), currently:
> "Equip five accurate knives; single-fire kills restore knives while alternate fire spends the remaining set."

Not factually wrong, but imprecise about the actual mechanic — alternate fire doesn't just "spend" the remaining knives, it throws all of them at once in a burst/spread. Change the ending to describe this as **shotgunning** the remaining set (matching Michael's exact suggested word), which correctly conveys the simultaneous multi-knife throw instead of a vague "spends."

**Omen — Paranoia** (`ability("paranoia", ...)`, line 73), currently:
> "A wall-piercing projectile that Nearsights and Deafens everyone it touches."

Imprecise — rewrite to: **"A shadow phase projectile that Nearsights and Deafens everyone it touches, as well as passing through terrain and objects."** This correctly frames it as a shadow-phase effect rather than informally "wall-piercing," and is more complete (passes through terrain/objects broadly, not just walls).

---

## 3. Weapon suggestion "evidence" field — inconsistent format, and a duplication risk

Michael's example: the Ghost entry in Bind's `weaponSuggestions` (line 74) shows `evidence: "500 credits | one-shot headshot through 30m"`, while every other weapon on the same map shows a global K/D-and-damage format instead (e.g. Phantom: `"0.84 kills per round | 202 average damage"`). This inconsistency isn't unique to Bind — **the identical Ghost evidence string is hand-typed in 3 separate places**: `gamesense-maps.js:74` (Bind), `:157` (Breeze), `:255` (Split). That's not just a formatting inconsistency, it's a factual-drift risk — if Ghost's real stats ever change, someone has to remember to update it in 3 places by hand, and Ghost's actual canonical stat block already exists once, separately, in `gamesense-reference.js:248`.

Fix both problems together: either (a) derive every weapon's `evidence` string from the single canonical stat object in `gamesense-reference.js` instead of hand-typing it per map, or at minimum (b) standardize the format so every weapon on every map shows the same kind of evidence (pick one: live K/D+damage, or cost+mechanic — not a mix), and de-duplicate the Ghost string to one source instead of three hand-typed copies.

---

## Testing checklist

1. Every corrected Bind string re-read in context on the actual rendered map detail page (not just in the data file) — confirm no other section repeats the Lamps/Showers or "no mid" mistake.
2. Jett/Omen ability text re-read on the actual rendered agent detail page, both the ability card and the fundamentals bullet (Tailwind's mistake appears in both).
3. Confirm the Ghost evidence-string fix (however implemented) renders identically and correctly on all 3 maps that reference it.
4. `node --check` passes; run the existing visual-audit suite before deploying.
5. Bump the cache key in `public/index.html`.
6. This is one map (of 3 authored) and one small slice of 2 agents (of 6 authored) — Michael said he's "skipping some parts," so treat this as a first pass, not full coverage. Flag to him whether he wants the same review applied to Breeze/Split and the other 4 agents before considering the Library "accurate."
