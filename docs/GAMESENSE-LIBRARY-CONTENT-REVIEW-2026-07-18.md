# Gamesense Library — Full Content Review (2026-07-18)

This is the complete sweep Michael asked for: every piece of player-facing text in the Weapons, Maps, and Agents dossiers, verbatim, with exact file/line paths, plus the findings from investigating the actual root cause of "the language is still poor." Checked against `docs/GAMESENSE-LIBRARY-CONTENT-STANDARD.md`.

**How to use this document:** Part 1 is the analysis — read this first, it explains what's actually wrong and why. Parts 2-4 are the full verbatim content, organized by category, for direct manual review/editing. Every content block is tagged with its exact `file:line` so an edit can be found and applied precisely.

---

# PART 1 — Findings

## 1.1 The real root cause: two tiers of content quality, shown with equal authority

This is the central finding, and it's bigger than word choice. The Library pulls from two different data sources per category, and they are **not** the same quality:

| Category | Hand-authored, real content | Auto-generated template filler |
|---|---|---|
| **Maps** | Bind, Breeze, Split (3) — `gamesense-maps.js` | Abyss, Ascent, Corrode, Fracture, Haven, Lotus, Pearl (7) — `gamesense-encyclopedia.js` |
| **Agents** | Jett, Sova, Omen, Viper, Cypher, Sage (6) — `gamesense-reference.js` | The other 23 — `gamesense-encyclopedia.js`, a `GENERATED_AGENTS` array |
| **Weapons** | All 16 weapons — `gamesense-reference.js` | None — every weapon is hand-authored |

Weapons are fully covered and consistently well-written (see Part 1.3). Maps and Agents are not — a minority of entries have real strategic knowledge, and a majority have placeholder text standing in for it, rendered through the exact same UI components with no visual distinction. A player has no way to tell the difference between a real coaching read and filler.

**What the template filler actually looks like** — direct comparison, same field, real vs. generated:

Bind (real, `gamesense-maps.js:91`): *"Clear Lamps before the spike crosses Truck; leaving it live lets one defender split the entire plant setup."*

Ascent (generated, `gamesense-encyclopedia.js:2961`): *"A Lobby is a verified Riot callout on Ascent. Clear or control this named space before reporting that the connected route is safe."* — the same sentence structure repeats for A Main, A Site, and B Lobby with only the location name swapped in (`:2969`, `:2977`, `:2985`). No specific reason is given for any of them, no consequence stated, nothing map-specific.

Jett's Tailwind (real, `gamesense-reference.js:35`): *"Activate before contact. The dash should end behind cover or inside a planned Cloudburst."*

Astra's Nova Pulse (generated, `gamesense-encyclopedia.js:38`): *"Nova Pulse needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it."* — this exact sentence, word for word, is reused as the "setup" text for dozens of unrelated abilities across many different agents regardless of what the ability does (see 1.4).

This is the actual, mechanical explanation for "the language is still poor" — much of what reads as poor isn't badly worded, it's not really written at all. Fixing wording on the templated 23 agents and 7 maps would just produce better-worded placeholder text. The real fix is authoring real content for them, the same way the 6 agents and 3 maps already have it — using `docs/GAMESENSE-LIBRARY-CONTENT-STANDARD.md`'s coverage checklist as the target. That's a big, separate authoring task and is intentionally **not** attempted in this pass — see Part 1.5.

## 1.2 The personalized-insight side has the same root shape, for a different reason

Separately investigated: why do Home/Stats/Insights cards (which *do* have a mature standard — `docs/RANKEDCOACH-VOICE-GUIDE.md`, `docs/COACHING-LANGUAGE-RULES.md`) still read poorly in practice? Confirmed real, exact violations in currently-shipping code:

- `winrateText: getWinrateCoachingSentence("This selected window", ...)` (`app.js:4228`) renders sentences like *"This selected window is at 47% WR across 12 matches..."* — "selected window" is a banned phrase, verbatim, in rendered copy.
- `getStatsTrendQuickTakeaway` (`app.js:4460`): `const subject = trend.kicker || signalAgent || "This sample";` produces *"This sample is at 24% HS, so your aim is in a good place."* — directly violates the Voice Guide's own rule 6 ("never call them the player, the profile, or the sample").
- The Compass score breakdown tabs (`app.js:7740-7805`) are the worst offender — internal-analytics language shipped straight to players: *"Profile Share,"* *"Raw Weight,"* *"Unrounded model output before the display score is clamped to the 0-100 coaching scale,"* *"Weighted from imported combat accuracy."*
- `COACHING_LANGUAGE_RULES` (`app.js:4120`), the 18-rule governance array, is **never executed as a check anywhere in the codebase** — it's only ever handed to the Ask Coach AI prompt as context. It's reference material, not enforcement.

**The actual mechanism:** the good functions (`polishCoachingInsight`, `polishTrendRead`, `formatTrendCoachAction` — `app.js:4516, 4696, 4255`) genuinely do follow the Voice Guide well. But they're **title-keyed** — matched against a fixed whitelist of legacy insight titles. Newer content (the 20 rule-generated cards in `public/analytics/coaching-rules.js`, and the Compass detail tabs) has different titles, so it never passes through the good layer — it falls through to a weak regex table (`normalizeRankedCoachCopy`, `app.js:40-76`) that doesn't contain most of the Voice Guide's actual banned words. Git history confirms this isn't neglect — real, repeated effort was made (`a3e1cba` → `634864d` → `62e2346` → `d2bd471`/`cef9199` → `01fc28f`), but the Compass/Gamesense surface was explicitly split off into a later pass (`ebb2dfb`) that never fully landed.

This is a code fix, not a content-authoring task — covered in the directive (Part 1.6 / the companion note).

## 1.3 Weapons: genuinely solid, real bugs found anyway

Every weapon has real stats, real per-weapon guidance, and real dated patch history (down to specific patch numbers and real source URLs — e.g. Outlaw's introduction cites `playvalorant.com/en-us/news/game-updates/a-new-addition-to-the-arsenal-outlaw-insights/`). This category doesn't need a rewrite. It does have concrete bugs:

- **Classic's focus text says "pellets"** (`gamesense-reference.js:245`): *"...reserve alternate fire for close movement fights where all pellets can connect."* Classic's alt-fire is a three-round burst, not a shotgun — this line was copy-pasted from shotgun phrasing and never corrected.
- **The `locations` field is present on every weapon-suggestion entry but is never rendered.** Confirmed against `renderWeaponSuggestions()` (`gamesense-library.js:554-568`) — it reads `fit`, `side`, `image`, `weapon`, `roundConversion`, `conversion`, `evidence`, `note`, but never `item.locations`. Every map's weapon suggestions carry real location data (e.g. Bind's Operator: *"B Long, A Tower, A Short"*) that a player never sees.
- **"Global round conversion" displays the literal string "Economy-filtered"** to every weapon, unexplained (`gamesense-reference.js:353-355`, rendered `gamesense-library.js:827`). The code comment explains why (vstats can't expose an unfiltered round-win percentage) but that reasoning never reaches the player — they just see an odd, meaningless label.

## 1.4 Agents: the specific bugs found during extraction

- **Raze has real, good data that's disconnected and unused.** `gamesense-reference.js:172-176` and `:203-206` contain real pick-rate/lore data for Raze — but Raze isn't in that file's `agents` array, so this data never reaches the player. Raze instead renders from the generated-template tier. This is a fast, high-value fix: wire the existing real data back in rather than writing anything new.
- **The `facts` field (Global pick rate / Map fit) exists on every single agent object and is never rendered by any UI function** — confirmed, the on-screen Map Fit panel is built from `agent.maps`/`agent.mapPickRates`/`agent.mapWinRates` directly, not from `agent.facts`. Dead data on all 29 agents.
- **Killjoy has two abilities both slotted "C - Basic"** (Nanoswarm and ALARMBOT, `gamesense-encyclopedia.js:1279, 1294`) — a real data conflict, not just a display issue.
- **Slot-label inconsistencies**: Reyna's Devour is labeled "Q - Signature" instead of "Q - Basic" (`:1854`); Tejo's Armageddon (his actual ultimate) is labeled "E - Ultimate" instead of "X - Ultimate" (`:2108`).
- **Malformed/truncated source text** in at least two patch-history entries — Tejo's (`:2074`) ends mid-sentence on an open parenthesis, Vyse's (`:2299`) ends abruptly on a colon.
- **Two agent names — Miks and Veto — were not recognized by either me or the research agent as current, real Riot agents.** Both have real `valorant-api.com` source UUIDs and were pulled from the live API, so this is very likely just new content released after both of our knowledge cutoffs, not fabrication — but worth a quick human confirmation before assuming the data is correct, since neither of us could independently verify it.

## 1.5 What this pass does NOT do, on purpose

Writing real, researched strategic content for 23 agents and 7 maps — matching the depth and sourcing rigor of the 6 agents and 3 maps that already have it — is a large authoring task, not a mechanical fix. Attempting to fake it in this same pass (generating plausible-sounding tips without real research per agent/map) would just create a third tier of content: better-worded, still not real. That would repeat the exact mistake this whole investigation was triggered by. `docs/GAMESENSE-LIBRARY-CONTENT-STANDARD.md`'s coverage checklist is the target for that work whenever it's picked up — flagged here as the next real project, not silently skipped.

## 1.6 What ships as a Codex directive from this pass

See `notes/gamesense-content-audit-fixes-2026-07-18.md` — every fix in 1.2, 1.3, and 1.4 above is concrete, doesn't require new content research, and is ready to build now.

---

# PART 2 — Weapons: Full Verbatim Content

**Source:** `public/library/gamesense-reference.js` (weapon data), `public/library/gamesense-library.js` (rendering/UI chrome), `public/library/gamesense-collections.js` (skin archive).

## Weapon Categories

`gamesense-reference.js:359-365`
```js
const weapons = [
  { id: "rifles", label: "Rifles", examples: "Vandal, Phantom", range: "Mid-range default", weaponIds: ["vandal", "phantom"] },
  { id: "precision", label: "Light Rifles", examples: "Guardian, Bulldog", range: "Mid to long range", weaponIds: ["guardian", "bulldog"] },
  { id: "snipers", label: "Snipers", examples: "Operator, Outlaw, Marshal", range: "Long sightlines", weaponIds: ["operator", "outlaw", "marshal"] },
  { id: "smgs", label: "SMGs", examples: "Spectre, Stinger", range: "Close-range pressure", weaponIds: ["spectre", "stinger"] },
  { id: "shotguns", label: "Shotguns", examples: "Judge, Bucky, Shorty", range: "Close-range only", weaponIds: ["judge", "bucky", "shorty"] },
  { id: "sidearms", label: "Sidearms", examples: "Classic, Frenzy, Ghost, Sheriff", range: "Pistol and save rounds", weaponIds: ["classic", "frenzy", "ghost", "sheriff"] }
]
```
Static category-card copy: **"Inspect weapons"** (`gamesense-library.js:289`)
Weapons topic description (`gamesense-library.js:18`): *"Selectable weapon art, damage ranges, economy, and fight decisions."*
Gallery header: **"Weapons Library"**, back button **"Back to topics"** (`gamesense-library.js:410-412`)

## Rifles

### Vandal — `gamesense-reference.js:233, 252-256`
- Cost 2900 | Mag 25 | Fire rate 9.75 rounds/sec | Penetration High | Damage 0-50m: 160/40/34
- Focus: *"No damage falloff. Favor clean taps and short bursts once the first controlled shots are gone."*
- When to use it: "Choose it on full buys when long sightlines and one-shot headshots matter." / "Favor it when your plan includes disciplined taps, bursts, or medium-penetration spam through a known position."
- How to use it: "Tap at long range, use two-to-four-shot bursts at mid range, and commit to a spray only when the target is close enough to track." / "Stop before the first shot and reset after the controlled bullets; running recoil is deliberately harsher."
- Patch history: 1.07 — "Fire rate rose from 9.25 to 9.75 rounds per second and body damage rose from 39 to 40." · 6.11 — "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 75 to 50." · 11.08 — "Protected spray bullets rose from four to six while horizontal recoil timing was retuned."

### Phantom — `gamesense-reference.js:234, 257-261`
- Cost 2900 | Mag 30 | Fire rate 11 rounds/sec | Penetration Medium | Damage 0-20m: 156/39/33, 20-50m: 140/35/30
- Focus: *"Higher fire rate and a silenced profile reward close-to-mid fights; respect the long-range headshot falloff."*
- When to use it: "Choose it for close-to-mid fights, smoke spam, and positions where a silenced shot keeps your location less obvious." / "Its larger magazine and faster fire rate fit multi-target holds better than long one-tap lanes."
- How to use it: "Burst through mid range and lean on controlled sprays inside 20 meters, where a headshot still kills full armor." / "Respect the 20-meter headshot falloff and shorten the fight before challenging a Vandal on an open lane."
- Patch history: 6.11 — "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 90 to 60." · 11.08 — "Protected spray bullets rose from six to eight and horizontal recoil timing was retuned to make close-to-mid sprays more controllable."

## Light Rifles

### Guardian — `gamesense-reference.js:236, 262-266`
- Cost 2250 | Mag 12 | Fire rate 5.25 rounds/sec | Penetration High | Damage 0-50m: 195/65/49
- Focus: *"Treat every shot as a resettable single-fire decision; high penetration supports disciplined wallbangs."*
- When to use it: "Buy it when head-level long lanes and high-penetration wallbangs are worth more than automatic fire." / "It is a deliberate mid-price rifle choice when armor and required utility still fit the team buy."
- How to use it: "Fire one settled shot at a time at range; at closer distances, keep a measured rhythm instead of panic-spamming." / "Hold narrow head-height lanes and use the high penetration only on confirmed common positions."
- Patch history: 1.08 — "Price fell from 2500 to 2400, fire rate rose from 4.75 to 5.25 rounds per second, and recovery improved." · 3.00 — "Price fell again, from 2400 to 2250 credits." · 4.00 — "The ADS fire-rate penalty was removed and one more shot was added before the recovery curve begins."

### Bulldog — `gamesense-reference.js:235, 267-271`
- Cost 2050 | Mag 24 | Fire rate 10 rounds/sec | Penetration Medium | Damage 0-50m: 116/35/30
- Focus: *"Use alternate-fire bursts for planned mid-range fights and avoid forcing full-auto recoil at long range."*
- When to use it: "Use it on a lighter rifle buy when the team still needs armor and utility." / "It works best on mid-range lanes where ADS burst gives a clean first engagement and full-auto protects a close collapse."
- How to use it: "Use ADS burst for a planned medium-to-long fight, then wait for the short recovery before the next burst." / "Switch to full-auto only when the opponent closes distance; do not drag the burst cadence into a long spray."
- Patch history: 3.00 — "Hip-fire rate rose from 9.15 to 9.5 rounds per second and price fell from 2100 to 2050." · 4.00 — "Hip-fire rate rose to 10 and burst recovery improved from 0.4 to 0.35 seconds." · 11.08 — "Horizontal recoil timing was lengthened from 0.37 to 0.6 seconds as rifle sprays were retuned."

## Snipers

### Operator — `gamesense-reference.js:237, 272-276`
- Cost 4700 | Mag 5 | Fire rate 0.6 rounds/sec | Penetration High | Damage 0-50m: 255/150/120
- Focus: *"Plan the escape before taking the shot. Missing without cover or movement utility exposes the weapon's slow cycle."*
- When to use it: "Buy it when the economy can support the weapon and the round offers a long first-contact lane." / "Agents with an escape tool can take a more aggressive opening angle; everyone else needs hard cover beside the shot."
- How to use it: "Plan the escape before scoping, fire once, then reposition while the enemy spends utility on the old angle." / "Avoid unsupported repeeks: the slow cycle, movement speed, and equip timing all give opponents a punish window."
- Patch history: 1.09 — "Price rose from 4500 to 5000 while scoped movement, fire rate, equip time, and jump-land accuracy were all reduced." · 3.00 — "Price fell from 5000 to the current 4700 credits."

### Outlaw — `gamesense-reference.js:238, 277-281`
- Cost 2400 | Mag 2 | Fire rate 2.75 rounds/sec | Penetration High | Damage 0-50m: 238/140/119
- Focus: *"Punish light armor with a body shot and manage the two-round chamber as a paired burst, not an endless hold."*
- When to use it: "Use it against likely light armor or when a 2400-credit sniper preserves the next full buy." / "Its rapid two-shot chamber can punish a second target or finish a tagged full-armor opponent."
- How to use it: "Treat the chamber as a two-shot plan: take the first body shot, correct quickly, then leave before the long full reload." / "Partial reloads are faster than replacing both shells, so track whether one shot remains before repeating the lane."
- Patch history: 8.00 — "The Outlaw entered the arsenal as a two-shot sniper built to sit between the Marshal and Operator in price and stopping power." (source: `playvalorant.com/en-us/news/game-updates/a-new-addition-to-the-arsenal-outlaw-insights/`)

### Marshal — `gamesense-reference.js:239, 282-286`
- Cost 950 | Mag 5 | Fire rate 1.5 rounds/sec | Penetration Medium | Damage 0-50m: 202/101/86
- Focus: *"Use mobility and fast follow-up positioning to punish unarmored buys without overstaying a scoped lane."*
- When to use it: "Buy it to punish unarmored or light-buy opponents without breaking the next rifle round." / "Its high scoped movement fits mobile long-lane picks and quick repositioning."
- How to use it: "Hold head height against full armor and accept body shots only when the enemy economy suggests no shields." / "Move after the first shot; the low price buys flexibility, not permission to repeat a revealed lane."
- Patch history: 2.03 — "Scoped movement rose from 76% to 90%, price fell from 1100 to 1000, and zoom increased from 2.5x to 3.5x." · 3.00 — "Price fell again, from 1000 to 950 credits."

## SMGs

### Spectre — `gamesense-reference.js:240, 287-291`
- Cost 1600 | Mag 30 | Fire rate 13.33 rounds/sec | Penetration Low | Damage 0-15m: 78/26/22, 15-30m: 66/22/19, 30-50m: 60/20/17
- Focus: *"Close distance and transfer through multiple targets; long-range rifle duels waste the weapon's mobility advantage."*
- When to use it: "Choose it for anti-eco rounds, close site holds, and run paths that can avoid open rifle lanes." / "The 30-round magazine supports a controlled transfer when multiple lightly armed opponents collapse together."
- How to use it: "Close distance with cover, then use a compact spray and transfer; burst or disengage once the fight stretches beyond 15 meters." / "Movement is part of the weapon's identity, but stop for any fight where the first bullets must be dependable."
- Patch history: 4.00 — "Spray error began earlier, moving recoil multipliers rose from 1.25x to 1.5x, and protected spray bullets fell from eight to five." · 6.11 — "Running vertical recoil rose from 1.5x to 1.8x." · 11.08 — "Total spread fell from 1.5 to 1.3, tap efficiency rose from two to three, and protected bullets rose from four to five."

### Stinger — `gamesense-reference.js:241, 292-296`
- Cost 1100 | Mag 20 | Fire rate 16 rounds/sec | Penetration Low | Damage 0-15m: 68/27/23, 15-50m: 57/23/19
- Focus: *"Commit to close fights or controlled alternate-fire bursts. The magazine disappears quickly if the first transfer is late."*
- When to use it: "Use it on a force or save where a close first kill can recover a rifle." / "It is strongest in tight corridors and fast contact plans where its low price and burst damage can matter immediately."
- How to use it: "Full-auto only at close range and control the first four-to-six bullets; the 20-round magazine disappears quickly." / "Use ADS burst for a measured mid-range chance, then reset instead of stacking inaccurate bursts."
- Patch history: 2.03 — "Price rose to 1100, full-auto fire rate fell from 18 to 16, and recoil became more aggressive after the third bullet." · 3.00 — "Price returned from 1100 to 950 credits." · 11.08 — "Full-auto spread rose from 1.3 to 1.5 and reached maximum spread one bullet sooner."

## Shotguns

### Judge — `gamesense-reference.js:242, 297-301`
- Cost 1850 | Mag 5 | Fire rate 3.5 rounds/sec | Penetration Low | Damage/pellet 0-10m: 34/17/14, 10-15m: 20/10/9, 15-50m: 14/7/6
- Focus: *"Damage is per pellet. Own a tight choke and have a route to recover a rifle after the first conversion."*
- When to use it: "Hold a tight choke where enemies must enter inside the first damage band." / "Use it when an escape path or dropped-rifle upgrade is available after the first close kill."
- How to use it: "Set your feet before firing, center the full pellet pattern, and make the enemy clear into your range." / "Do not chase through open ground; reposition between shots so the magazine can cover more than one contact."
- Patch history: 3.00 — "Price rose from 1600 to 1850 and pellet damage at 10 and 15 meters was reduced." · 12.09 — "Minimum and movement spread increased, sharply reducing accuracy while walking, running, jumping, or using ropes."

### Bucky — `gamesense-reference.js:243, 302-306`
- Cost 850 | Mag 5 | Fire rate 1.1 rounds/sec | Penetration Low | Damage/pellet 0-8m: 34/17/14, 8-12m: 26/13/11, 12-50m: 18/9/8
- Focus: *"Damage is per pellet. Protect the close-range fight and do not expose the long recovery to a second enemy."*
- When to use it: "Choose it for a low-cost close hold where one patient shot can recover a better weapon." / "It fits corners with hard cover that protect the long recovery after a miss."
- How to use it: "Stand still, let the target enter the first damage band, and center the body so enough pellets connect." / "Do not expose to a second enemy until the pump finishes; the weapon rewards one isolated fight at a time."
- Patch history: 3.00 — "Price fell from 900 to 850 credits." · 12.09 — "Close-range pellet damage fell from 40/20/17 to 34/17/14, minimum spread rose to 3.0, and moving spread increased."

### Shorty — `gamesense-reference.js:244, 307-311`
- Cost 300 | Mag 2 | Fire rate 3 rounds/sec | Penetration Low | Damage/pellet 0-7m: 22/11/9, 7-15m: 12/6/5, 15-50m: 6/3/3
- Focus: *"Damage is per pellet. Use it as a concealed close-corner answer, then immediately upgrade from the dropped weapon."*
- When to use it: "Use it as a concealed sidearm for one close corner, often beside a rifle or Operator." / "It is a save-round ambush tool when the first contact can immediately yield an upgrade."
- How to use it: "Hide the weapon until the target fills the spread, stop moving, and commit both shells only if the first does not finish." / "After contact, take the dropped weapon or leave; two shells cannot hold an extended lane."
- Patch history: 6.11 — "Price rose from 150 to 300, reserve ammo fell from ten to six, and damage at the first two ranges was reduced." · 12.09 — "Fire rate fell from 3.33 to 3.0 and movement spread increased across walking, running, crouch-walking, jumping, and ropes."

## Sidearms

### Classic — `gamesense-reference.js:245, 312-316`
- Cost 0 | Mag 12 | Fire rate 6.75 rounds/sec | Penetration Low | Damage 0-30m: 78/26/22, 30-50m: 66/22/19
- Focus: *"Use controlled taps at range and reserve alternate fire for close movement fights where all pellets can connect."* — **flagged bug: Classic's alt-fire is a burst, not pellets; see Part 1.3.**
- When to use it: "Keep it when utility matters more than a pistol upgrade or when the round plan creates a very close right-click fight." / "Its free cost preserves the full 800-credit pistol-round budget."
- How to use it: "Tap with primary fire at range and wait for recoil to settle." / "Use alternate fire only at close distance, preferably after stopping or while dropping into a target that already fills the pellet spread."
- Patch history: 2.00 — "Jumping error for alternate fire rose from 0.4 to 1.0 and repeated right-click bursts gained a stronger recovery curve." · 3.00 — "Walking and running inaccuracy increased as Riot tightened moving sidearm fire."

### Frenzy — `gamesense-reference.js:246, 317-321`
- Cost 450 | Mag 15 | Fire rate 10 rounds/sec | Penetration Low | Damage 0-20m: 78/26/22, 20-50m: 63/21/18
- Focus: *"Treat it like a compact SMG: close distance, control the short magazine, and avoid long-range tap races."*
- When to use it: "Buy it for close pistol-round pressure or a save-round path that reaches SMG distance quickly." / "It pairs with agents who can cross open space before the 15-round magazine is committed."
- How to use it: "Use short close-range sprays and reset before the magazine empties; long tap races favor Ghost or Sheriff." / "Move to close the gap, then settle before the decisive burst."
- Patch history: 2.03 — "Price rose from 400 to 500 credits after the Frenzy crowded other pistol-round options." · 3.00 — "Price fell to 450 while walking and running inaccuracy increased." · 6.11 — "Minimum spread increased, maximum spread arrived in five bullets, and running recoil rose from 1.25x to 1.5x."

### Ghost — `gamesense-reference.js:247, 322-326`
- Cost 500 | Mag 13 | Fire rate 6.75 rounds/sec | Penetration Medium | Damage 0-30m: 105/30/26, 30-50m: 88/25/21
- Focus: *"Use the clean first shot and quiet profile for disciplined pistol-round picks; reset instead of panic-spamming."*
- When to use it: "Choose it for quiet pistol-round taps, medium sightlines, and a utility-light 500-credit buy." / "It rewards first-shot accuracy against unarmored targets through 30 meters."
- How to use it: "Hold head height, tap once or twice, then let the weapon settle instead of chasing with a full magazine." / "Use the silenced profile to take a first pick without broadcasting the exact lane through tracers."
- Patch history: 3.00 — "Walking inaccuracy rose from 0.25 to 0.92 and running inaccuracy from 1.85 to 2.3." · 6.11 — "Minimum spread on ropes rose from 0.35 to 0.6 as rope combat was made less reliable."

### Sheriff — `gamesense-reference.js:248, 327-331`
- Cost 800 | Mag 6 | Fire rate 4 rounds/sec | Penetration High | Damage 0-30m: 160/55/47, 30-50m: 145/50/43
- Focus: *"Protect the 0-30m one-shot headshot range and let recoil settle. Long-range headshots no longer kill full armor."*
- When to use it: "Buy it when an eco round needs one-shot headshot threat inside 30 meters." / "Its high penetration can punish a confirmed common wall position, but six rounds demand a planned exit."
- How to use it: "Let recoil fully settle between long shots and protect the 0-30-meter one-tap range." / "Do not spam after a miss; move back to cover, reset, and take the next deliberate shot."
- Patch history: 3.00 — "Walking inaccuracy rose from 0.25 to 1.2 and running inaccuracy from 2.0 to 3.0." · 6.11 — "Minimum spread on ropes rose from 0.35 to 0.78 as rope combat was made less reliable."

---

## Sidearms — Proposed Rewrite (2026-07-19)

You stopped your own pass before reaching Sidearms, so this section wasn't touched by hand. Written against the voice standard your Rifles-through-Shotguns edits confirmed (`docs/GAMESENSE-LIBRARY-CONTENT-STANDARD.md`, Part C): a named technique per entry, community voice where it's the real term, and researched beyond just official Riot sources. This is a proposal for you to mark up the same way as everything above — not yet applied to `gamesense-reference.js`.

**Note on `gamesense-reference.js:242` (Classic's focus text):** the "pellets" copy-paste bug flagged in Part 1.3 and quoted in the original Sidearms section above is already fixed in the live source — it now reads "the three-round alternate-fire burst for close fights where the full burst can land." The line numbers in the original section headers above have also shifted slightly since this doc was written (Codex's fix pass touched this file); citations below match the current file.

### Classic
- Focus: *"Use controlled taps at range — and don't sleep on the alt-fire. Its three-round burst stays just as accurate jumping or running as it does standing still, which no other primary fire in the game can say."*
- When to use it: "Keep it when utility matters more than a pistol upgrade, or when the round plan sets up a close, sudden right-click fight." / "Its free cost preserves the full 800-credit pistol-round budget."
- How to use it: "Tap with primary fire at range and let recoil settle before the next shot." / "Jump-peek tight corners with the alt-fire — it holds its spread in the air, so landing two of three pellets is often enough to drop an unarmored target on eco."
- Patch history: unchanged from above.

### Frenzy
- Focus: *"Treat it like a compact SMG: close the distance, control the short magazine, and avoid long-range tap races."* (unchanged — already solid)
- When to use it: unchanged from above.
- How to use it: "Crouch the moment you commit to a close fight — it tightens the spread noticeably, and the first three bullets are already close to perfectly accurate." / "Pre-fire the corner you're about to peek; the fire rate is high enough that starting your spray a beat early costs almost nothing and means your bullets are already tracking when the enemy appears."
- Patch history: unchanged from above.

### Ghost
- Focus: unchanged from above — already solid.
- When to use it: unchanged from above.
- How to use it: "Hold head height and commit to a tap or two — the spray stays close to a straight line through the first two or three bullets before it kicks, so you don't need a full reset between them." / "Use the silenced profile to take a first pick without broadcasting the exact lane through tracers."
- Patch history: unchanged from above.

### Sheriff
- Focus: *"Protect the 0-30m one-shot headshot range and let recoil settle — this is a stop-and-shoot weapon, not a flick gun."*
- When to use it: unchanged from above.
- How to use it: "Stop moving before every shot and hold your crosshair at head height on likely angles before the enemy appears — the Sheriff punishes a late flick far more than it rewards one." / "If the target is moving or at range, two body shots beat forcing a low-percentage headshot. Don't spam after a miss — reset to cover and take the next deliberate shot."
- Patch history: unchanged from above.

Sources consulted for the technique-level additions above (Classic alt-fire air accuracy, Frenzy crouch/pre-fire, Sheriff stop-and-shoot discipline): [Classic — Valorant Wiki](https://valorant.fandom.com/wiki/Classic), [A Tip for Each Weapon in Valorant — Dignitas](https://dignitas.gg/articles/a-tip-for-each-weapon-in-valorant), [Valorant Spray Patterns and Recoil Control Guide — bo3.gg](https://bo3.gg/valorant/articles/valorant-spray-patterns-and-recoil-control-guide), [How to Improve Sheriff Accuracy — Aimlabs](https://aimlabs.com/articles/aimlabs-academy/how-to-improve-sheriff-accuracy-in-valorant/), [How to use the Ghost — Dexerto](https://www.dexerto.com/valorant/how-to-use-the-ghost-valorant-weapon-guide-1547411/).

---

## Weapon Dossier UI Chrome (`gamesense-library.js`)

- Detail header kicker "Weapon Dossier", patch chip "As of Patch ${patch}", back button "Back to weapons" (`:914-915`); section "Arsenal" / "Select a weapon" (`:918`)
- Weapon Analysis panel kicker "Weapon Analysis" (`:827`); stat chips "Cost", "Magazine", "Fire rate", "Penetration" (`:828`); section headers "When to use it" / "How to use it" (`:831-832`); "Patch history" (`:835`), "Riot source" link text (`:836`)
- Damage table zone labels "Head" / "Body" / "Legs" (`:800-802`)
- Skin Collection Archive kicker "Historical Reference" (`:851`), title "${weapon} Skin Collection Archive", trailing disclaimer "Riot edition is the official content tier, not a community review score." (`:852`), error state "Skin archive unavailable." / "Try again" (`:854`), fallback "The live collection catalog could not be reached." (`:962`)
- Skin preview modal: "True 3D Model" / "Official Weapon Render" kicker (`:1092`), "Drag to rotate. Scroll or pinch to zoom." (`:1093-1094`), "No approved exact 3D model is available for this color variant yet." (`:1095`), "Static render — exact 3D unavailable" badge (`:1104`), "Community model attribution" (`:1098`)

## Appendix — Per-Map Weapon Suggestions (lives in Maps data, not Weapons topic)

Field shape matches weapons content but these render on **map** detail pages (`renderWeaponSuggestions()`, `gamesense-library.js:541-570`), not the Weapons topic. Only Bind, Breeze, and Split have populated arrays (full text in Part 3). All 7 template maps (Abyss, Ascent, Corrode, Fracture, Haven, Lotus, Pearl) carry the identical fallback: `"weaponSuggestions": []`, `"weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier."` (7 occurrences, `gamesense-encyclopedia.js`).

**Confirmed dead field:** `locations` is present on every weapon-suggestion object but `renderWeaponSuggestions()` never reads it — see Part 1.3.

---

# PART 3 — Maps: Full Verbatim Content

**Source:** `public/library/gamesense-maps.js` (Bind, Breeze, Split — hand-authored), `public/library/gamesense-encyclopedia.js` (Abyss, Ascent, Corrode, Fracture, Haven, Lotus, Pearl — templated).

## BIND (`gamesense-maps.js:45-126`) — hand-authored

Callouts: A Site, A Bath, A Short, A Lamps, A Tower, B Site, B Long, B Window, B Elbow, B Garden.
Plant rate note: *"Bind is outside the active competitive rotation, so no active-season PC plant-rate sample is available."*

**Weapon Suggestions:**
- Phantom — fit "Best rifle fit", evidence "0.84 kills per round | 202 average damage", locations "Hookah, Lamps, Bath", note *"Compact chokes and frequent smoke fights reward the Phantom's close-range control."*
- Operator — fit "Strong sniper fit" (DEF), evidence "0.80 kills per round | 220 average damage", locations "B Long, A Tower, A Short", conversion *"...stronger than a shotgun while the first duel stays long; Judge and Bucky gain value once Hookah or Lamps is the planned contact."*, note *"On defense, long lanes create early picks, but the lack of mid makes a missed read expensive. Pair it with an escape tool or planned teleporter rotation."*
- Ghost — fit "Pistol-round fit", locations "A Short, Bath, B Long", note *"The quiet, accurate first shot fits Bind's early lane fights while keeping utility in the buy."*
- Judge — fit "Close conversion rival" (DEF), locations "Hookah, Lamps, U-Hall", conversion *"...more repeatable than an Operator when the setup guarantees two close contacts; much weaker if attackers can reset to Long or Bath."*, note *"On defense, commit it to a compact choke and plan the rifle recovery after the first conversion."*
- Stinger — fit "Eco outlier", locations "Hookah, Lamps, Bath", note *"The low-cost damage output is useful only when the setup protects a close fight and a short magazine."*

**Macro** — Defense: "Double up to contest the weak-side lane rather than spreading thin — accept giving up a low-value area to reinforce a high-value one instead." / "Shower control is the priority defensive anchor on this map — losing it tends to cascade into losing the rest of the defensive setup." / "Watch for predictable attacker patterns (a late shower lurk is a common one) — recognizing the pattern opens a window to punish it."
Attack: "Bind has no mid, so once you commit to a site the rotation is fully committed too — there's no cheap way to redirect mid-execute." / "Target whatever gap the enemy's agent picks create, rather than defaulting to the same site read every round."

**Site Tips:** A Short (Duelist/Initiator) — *"Clear Lamps before the spike crosses Truck; leaving it live lets one defender split the entire plant setup."* · A Bath (Controller/Sentinel) — *"Bath control creates the open plant and removes the safest close retake path. Hold it through the plant instead of abandoning it on entry."* · B Hookah (Duelist/Initiator) — *"Pair the Hookah drop with B Long pressure so defenders cannot aim at both elevations at once."* · B Long (Controller/Sentinel) — *"Keep Elbow and Defender Spawn cut while the spike is planted for Long; otherwise the planter is exposed before the post-plant begins."*

**Teamplay Tips:** Teleport timing — *"Call teleporter audio immediately and name the exit. The rotation is only useful if the destination player is ready for the next fight."* · Two-lane hits — *"Pressure both entrances to a site before committing so one defender cannot hold every attacker in a single choke."* · Post-plant jobs — *"Assign one player to the spike and one to the flank before chasing exits; Bind's teleporters make late routes arrive quickly."*

**Role Notes:** Duelist — attack: "Take first space through A Short, Bath, Hookah, or B Long after support utility lands." sites: "Clear Lamps and Hookah with movement or explosive utility before teammates cross the choke." defense: "Contest one high-value lane with an escape plan instead of dry re-peeking after contact."
Initiator — attack: "Reveal or clear Hookah, B Long, Bath, and A Short immediately before the entry moves." sites: "Use flashes and scans to isolate Lamps, A Heaven, Elbow, and Defender Spawn rather than covering empty space." teamplay: "Track teleporter audio so the team can rotate before the destination fight is already lost."
Controller — sites: "For A hits, remove A Heaven and Lamps; for B hits, remove Defender Spawn and Elbow." teamplay: "One-way smokes are setup-dependent and should not replace the smokes the execute needs." defense: "Keep one smoke or damage tool for the post-plant because Bind retakes arrive through narrow named lanes."
Sentinel — teamplay: "Place flank utility where it survives common prefire paths and still catches teleporter rotations." defense: "Anchor where you can punish Hookah drop, B Long, A Short, or Bath contact without giving a free first death." defense: "Change trap and camera height between gun rounds so the same clear does not solve the setup twice."

**Comp:** metaComp empty, `compStatus`: *"Bind is outside Tracker Network's current rolling Competitive map sample, so no current composition reference is shown."*

**Agent Insights:** Clove — "Post-death smokes keep both teleporter rotations covered after an opening fight." Raze — "Explosive movement and clearing utility break Bind's narrow Hookah, Bath, and A Short chokes." Fade — "Haunt and Prowlers clear Lamps, Hookah, and site corners immediately before contact." Cypher — "Flank information survives teleporter rotations; B is the higher-success anchor site in this current sample." Skye — "Guiding Light can curve through both compact site entrances and support fast re-clears."

## BREEZE (`gamesense-maps.js:127-225`) — hand-authored

Callouts: A Site, A Lobby, Mid Hall, Mid Nest, Mid Wood Doors, B Tunnel, B Site, B Main, B Back.
Plant rate note: *"Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive."*

**Weapon Suggestions:**
- Phantom — fit "Highest rifle conversion", roundConversion 50.87% combined (896,805-round sample) vs. Vandal 50.41%, note *"Smoke fights and close site finishes give the Phantom a narrow conversion edge, while the Vandal remains the cleaner long-lane one-tap choice."*
- Operator — fit "High-value sniper" (DEF), roundConversion 52.43% defense (230,391-round sample) vs. Outlaw 44.64%, conversion *"...the Operator wins the defense-side sniper comparison; Judge or Bucky only catches up inside a deliberately protected Tunnel or Hall pocket."*, note *"On defense, the map gives repeated long-lane shots. Mobility or teleport tools make the weapon safer after contact."*
- Ghost — fit "Highest pistol conversion", roundConversion 50.64% (2,791,564-round sample) vs. Sheriff 50.21%, note *"Use cover and first-shot accuracy across Breeze's long pistol lanes while preserving credits for utility."*
- Judge — fit "Best shotgun conversion" (DEF), roundConversion 48.24% defense (27,678-round sample) vs. Bucky 44.24%, conversion *"...remains location-dependent and cannot match the Operator across Breeze's open sites."*, note *"On defense, treat it as a protected Hall or Tunnel ambush, then recover a ranged weapon before rotating into open space."*
- Spectre — fit "Highest eco conversion", roundConversion 33.61% (128,040-round sample) vs. Stinger 29.69%, note *"Use it with a deliberate close-range route; most Breeze fights still expose an SMG's range limit."*

**Macro** — Defense: "Mid is the strategic core of this map — mid control is less about the space itself and more about the pressure it lets you apply to both sites at once."
Attack: "Smoking Mid Nest removes the Operator angle that otherwise dominates that lane — a specific, repeatable utility play, not just a generic smoke." / "Smoking Tunnel forces defenders into a binary choice: play the tunnel more aggressively than they'd like, or fall back and give up the space."

**Site Tips:** A Pyramids (Duelist/Initiator) — *"Split the two pyramids into separate clears. Plant only after the close side and Back Site lane have been accounted for."* · A Bridge (Controller/Sentinel) — *"Keep Bridge denied during the plant; its elevation watches both the site crossing and several pyramid plants."* · B Pillar (Duelist/Initiator) — *"Use Pillar to isolate the first defender, then clear Back Site before spreading into the open plant lanes."* · B Tunnel (Controller/Sentinel) — *"Tunnel control shortens the defender rotation and protects a B split, but only if the Mid player can be traded."*

**Teamplay Tips:** Mid leverage — *"Keep one player connected to Mid while the site group pressures Main; that threat prevents both defenders from leaning into one entrance."* · Long trades — *"Breeze spacing stretches trade distance. Say who follows the first contact before crossing an open lane."* · Late information — *"Save one scan, camera, or flank trap for the rotation because a wrong site read costs more time here than on compact maps."*

**Role Notes:** Duelist — attack: "Use movement to cross the long exposed lanes after recon or a flash removes the first angle." attack: "Create pressure from Mid or Hall so defenders cannot hold one site entrance with every rifle." defense: "Operator rounds need a planned escape route; do not repeat the same long angle after revealing the weapon."
Initiator — attack: "Scan or drone the long sightline the duelist is about to cross, not the site after contact begins." sites: "Use Mid Nest, Tunnel, Back Site, and Hall as named utility targets so the team knows what is actually cleared." teamplay: "Save one information tool for the late rotation because the distance between sites makes false reads expensive."
Controller — sites: "Viper-style walls are strongest when they split a site into a playable front half and an isolated defender half." attack: "Remove Mid Nest or Tunnel when taking center control; both positions can hold multiple rotation paths." teamplay: "Prioritize complete lane denial and fuel timing over difficult one-way setups on Breeze's open geometry."
Sentinel — teamplay: "Use flank utility to protect the long rotations, then survive so that information remains useful." defense: "Anchor from off-angles that force attackers to clear after crossing open ground." defense: "Do not stack every piece of utility on one site when Mid pressure can break the setup from behind."

**Comp:** metaComp — Chamber/Clove/Jett/Reyna/Sova, "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel", Patch 13.01+13.00. Alt comps: Chamber/Clove/Jett/Sova/Viper (double-controller); Clove/Jett/KAY-O/Sova/Viper (double-controller + double-initiator). `compSample`: rank "Ascendant to Radiant", source "OP.GG Competitive", note *"OP.GG Competitive Ascendant+ map picks from Patch 13.01 are combined with Patch 13.00 because the current high-rank window is still small. Percentages are individual agent pick share within the combined Ascendant-to-Radiant map sample; no five-agent lineup win rate is claimed."*

**Agent Insights:** Chamber — "Trademark protects the long flank while Rendezvous supports aggressive Operator holds; B has the stronger current defensive success in this sample." Clove — "Long-range smoke placement stays useful through Breeze rotations, and post-death utility protects late hits." Jett — "Dash and Updraft create a safe exit from the long Operator lanes that define first contact." Neon — "High Gear closes Breeze's long gaps quickly enough to punish defenders before cross-map help arrives." Reyna — "Dismiss gives a self-sufficient escape after winning one of Breeze's exposed long-range duels." Iso — "Double Tap and Contingency help isolate one long sightline instead of fighting the full open site." KAY/O — "ZERO/point and suppression give the second-initiator layout a direct way to disable defensive utility before crossing Breeze's long lanes." Sova — "Recon and Drone clear wide sightlines where close-range flashes cannot cover every defender." Sage — "Barrier and Slow Orbs compress open entrances; A is the stronger current anchor site for her stall package." Viper — "Toxic Screen divides the open sites into playable halves and preserves fuel for post-plant denial."

## SPLIT (`gamesense-maps.js:226-322`) — hand-authored

Callouts: A Site, A Main, A Rafters, A Screens, Mid Bottom, Mid Vent, Mid Mail, B Tower, B Site, B Garage.
Plant rate note: same as Breeze — *"Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive."*

**Weapon Suggestions:**
- Phantom — fit "Highest rifle conversion", roundConversion 51.18% (1,385,619-round sample) vs. Vandal 50.26%, note *"Split's compact chokes and smoke-heavy site fights reward the Phantom's close-range control."*
- Operator — fit "Conditional sniper" (DEF), roundConversion 54.62% defense (158,318-round sample) vs. Outlaw 46.61%, conversion *"Excellent for the opening lane, but Judge and Bucky gain value after attackers enter Split's tight towers, vents, and site pockets."*, note *"On defense, take the opening pick beside an exit. Do not drag the slow cycle into a forced close retake."*
- Ghost — fit "Highest pistol conversion", roundConversion 50.64% (2,851,065-round sample) vs. Frenzy 50.59%, note *"Its first-shot accuracy covers the medium lanes without consuming the utility budget needed to break Split's chokes."*
- Judge — fit "High close conversion" (DEF), roundConversion 49.84% defense (36,692-round sample) vs. Bucky 46.08%, conversion *"The Judge is the stronger shotgun when the route forces repeated close fights, but loses value immediately if Mid or Main opens the range."*, note *"On defense, anchor one compact route, vary the corner, and plan how the weapon leaves the round after the first close duel."*
- Spectre — fit "Highest eco conversion", roundConversion 33.75% (134,619-round sample) vs. Stinger 30.18%, note *"The compact corners suit the Spectre, but do not carry the setup into open Mid."*

**Macro** — Defense: "Split's compact design means mid connects both sites more directly than on most maps — losing mid control lets attackers move and threaten either site quickly."
Attack: "A and B sites are small and sit at opposite ends of the map — a slow read on which site is live costs more here than on a map with a real mid buffer." / "Controlling the center is often the deciding factor for both attack and defense, since it enables fast movement between points and keeps the defense guessing."

**Site Tips:** A Site (Duelist/Initiator) — *"Clear A Heaven and Screens as separate jobs before settling the plant; one smoke does not confirm either space is empty."* · A Ramps (Controller/Sentinel) — *"Ramps control splits the defender's Heaven setup and gives the attack a safer route out of A Main."* · B Site (Duelist/Initiator) — *"Pair B Main pressure with Mail or B Heaven utility so the entry is not fighting both elevations at once."* · B Alley (Controller/Sentinel) — *"Keep the defender rotation lane blocked until the spike is secure, then shift the smoke or stall toward the retake choke."*

**Teamplay Tips:** Mid split — *"Treat Vents and Mail as two separate clears. The site group should wait until the Mid group can pressure the matching Heaven lane."* · Utility spacing — *"Compact sites amplify utility, but stacked tools can be cleared together. Leave enough distance that one grenade cannot erase the full setup."* · Retake reserve — *"Hold one flash, smoke, slow, or damage tool for the retake; Split's small sites let one late cast touch most of the fight."*

**Role Notes:** Duelist — attack: "Use movement or explosive utility to break the first choke at A Main, B Main, or Mid." sites: "Take vertical space in A Heaven, B Heaven, Vents, and Mail after support utility forces defenders off the angle." defense: "Pressure a choke only when you can fall back before the trade arrives."
Initiator — attack: "Narrow lanes reward flashes, stuns, and damage utility that land immediately before the swing." sites: "Clear A Heaven, Screens, B Heaven, Mail, and Vents as separate jobs instead of calling an entire site clear." defense: "Hold one piece of retake utility because Split sites are compact enough for a single well-timed cast to change the round."
Controller — sites: "On A, remove A Heaven and Screens; on B, remove B Heaven and the defender rotation lane." attack: "Mid control usually needs a smoke at Mail or Vents so the team can fight one elevation at a time." teamplay: "Use ledge one-ways only when the height is consistent and teammates know the exposed lane."
Sentinel — teamplay: "Trap the route that connects Mid to the site hit so defenders receive the rotation warning early." defense: "Layer stall utility with enough spacing that one grenade cannot clear everything." defense: "Rotate setups between B Main, Mid, and A Main pressure so attackers must re-clear the map each gun round."

**Comp:** metaComp — Clove/Cypher/Jett/Reyna/Skye, "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel", Patch 13.01+13.00. Alt comps: Clove/Cypher/Fade/Jett/Skye (double-initiator); Clove/Cypher/Jett/Sage/Skye (double-sentinel). `compSample` same methodology note as Breeze.

**Agent Insights:** Clove — "Fast smokes cover Mail, Vents, and either Heaven while the team changes direction through Mid." Jett — "Dash breaks the first compact choke and Updraft contests Split's stacked Heaven positions." Raze — "Paint Shells and Blast Packs punish Split's compact chokes and vertical defender pockets." Neon — "Fast Lane and High Gear turn a Mid opening into site pressure before defenders reset their vertical crossfires." Reyna — "Dismiss lets her escape the close first duel, but the comp still relies on Skye to make that fight favorable." Skye — "Guiding Light bends through Split's tight corners and Trailblazer clears the close pockets before both duelists commit." Fade — "Prowlers clear close corners while Haunt confirms the stacked vertical positions around Mid." Sage — "Wall and Slow Orbs delay narrow site entrances; B currently gives her the higher anchor conversion." Cypher — "Trips control Mid-to-site rotations and let the anchor survive instead of guessing which choke broke."

## Abyss, Ascent, Corrode, Fracture, Haven, Lotus, Pearl — templated (`gamesense-encyclopedia.js`)

All 7 follow the identical generation pattern. Fully sampled below using **Ascent** (`gamesense-encyclopedia.js:2829-3036`) since it's representative — the other 6 were confirmed to follow the same structure but were not individually transcribed in full here (that would just repeat the same template with different location names; not useful for a manual-edit review). Codex should enumerate and confirm all 7 directly before starting the authoring work.

**Ascent** — `inCompetitivePool: true`. Real callout coordinates exist (22 named locations). `plantSpots: []`. Plant rate note: *"Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated."* `weaponSuggestions: []`, note *"No verified active-season weapon conversion sample is attached to this map dossier."*

**Macro** (the only genuinely specific content on this entry) — Defense: *"Ascent's two one-way site doors can be closed to slow a retake route. Once shut, they must be broken before that lane can be used again."* Attack: *"Mid connects both sites, so controlling it forces defenders to watch Market, Catwalk, and the two Main entrances instead of leaning into one choke."*

**Site Tips** — templated, same sentence structure for all four: "A Lobby is a verified Riot callout on Ascent. Clear or control this named space before reporting that the connected route is safe." (A Main, A Site, B Lobby — identical pattern, location name substituted only.)

**Teamplay Tips** — one entry, "Map structure": *"Name whether Market or Catwalk is controlled before the site group commits; Mid pressure only helps when both groups move on the same timing."* (This one is genuinely specific, not templated.)

**Role Notes** — templated for all four roles: *"On Ascent, connect A Lobby to A Main: Take first space only after support utility reaches the named defender angle."* (Duelist), and equivalent connector-based templates for Initiator/Controller/Sentinel — same pattern, not agent- or map-specific beyond the location name.

**Comp:** empty. `compStatus`: *"Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed."* **Agent Insights:** `{}` (empty on every one of the 7). **Lineup Links:** `[]`.

## Map Dossier UI Chrome (`gamesense-library.js`)

- Topic description: *"Attack, defense, role notes, current comps, and marked tactical layouts."* (`:16`)
- Gallery: "Maps Library" header, "Back to topics" (`:411-412`), season tabs "In-Season" / "Off-Season" (`:398-399`)
- Marked map: "Marked Tactical Map" / "Map Location Info" (`:434`), tabs "Map Locations" / "Spike Plant Hot Spots" (`:436-437`), "Active-season plant share" (`:460`), "No verified in-game image is available for this spot." (`:467`)
- Tips tabs: "Attack side" / "Defense side" / "Site-specific" / "Teamplay strats" (`:483-486`); role lens "All roles" (`:531, 533`)
- Weapon Suggestions: eyebrow "Weapon Suggestions" (`:546, 552`), empty-state "Verified active-season sample unavailable" / *"No verified active-season weapon conversion sample is attached to this map dossier."* (`:546-547`), populated subtitle "Highest-value choices by buy type" (`:552`), source line *"Round conversion percent uses the vstats active-season Competitive map and economy sample. Kills-per-round and average-damage context uses Blitz Competitive weapon stats."* (`:553`)
- Comp: no-sample eyebrow "Current-Season Comps" (`:628`), *"No verified current-season composition sample is available for this map."* (`:629`); populated eyebrow "Competitive Comps" (`:634`), fallback note *"High-rank Competitive pick shares are used as tactical composition references; no five-agent lineup win rate is claimed."* (`:635`); agent-insight prompt *"Select an agent to see why the pick succeeds on ${map.label}."* (`:660`)
- Detail head: "Map Dossier" (`:687`), "Out of Season" badge, patch chip "As of Patch ${patch}", "Back to maps" (`:688`)
- Lineups section: "Find Lineups" (`:695`)

---

# PART 4 — Agents: Full Verbatim Content

**Source:** `public/library/gamesense-reference.js` (Jett, Sova, Omen, Viper, Cypher, Sage — 6 hand-authored), `public/library/gamesense-encyclopedia.js` (`GENERATED_AGENTS`, 23 templated). Total roster: 29 agents.

**Note on the templated tier's pattern:** every generated agent's ability entries follow one of a small number of reused sentence templates for `purpose` and `setup`, selected mechanically by ability category (damage / vision-denial / information / movement / control / recovery), not written per-ability. Examples of the exact reused sentences, appearing verbatim across many unrelated agents/abilities:
- *"[Ability] applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess."*
- *"[Ability] is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle."*
- *"[Ability] must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active."*
- *"[Ability] changes position. Choose the destination and nearby cover before activating the movement effect described by Riot."*

Full per-agent extraction follows. Ability descriptions ("summary") are Riot's own official text and are accurate/fine as-is; it's the `purpose`/`setup` fields (the actual coaching content) that are templated.

## Hand-authored (6)

### Jett (Duelist) — `gamesense-reference.js:21-39`, maps: Breeze, Haven
**Fundamentals:** *"Tailwind makes Jett one of the safest Operator holders: prime the dash, take a one-and-done angle, and finish the shot beside cover you can dash behind."* / *"Cloudburst is a short crossing tool. Pair it with Tailwind to break one sightline, then clear the next fight instead of treating it like a full controller smoke."* / *"Updraft and Blade Storm stay accurate while moving, so use elevation to change the defender's crosshair height only when you know where you can land."*
**Patch history:** 4.08 — "Tailwind changed to a primed dash: after a 0.75-second delay, Jett received a 12-second window to use it." · 7.04 — "Tailwind's window fell to 7.5 seconds with a 1-second windup; Cloudburst fell to 2.5 seconds, Updraft to one charge, and Blade Storm rose to 8 points."
**Abilities:** Updraft (Q) — "Reach unexpected elevation, clear vertical utility, or combine with Blade Storm." / "Use it with a clear landing plan. The weapon re-equip delay makes unsupported airtime punishable." · Tailwind (E) — "Create entry space or escape after an Operator shot or opening duel." / "Activate before contact. The dash should end behind cover or inside a planned Cloudburst." · Cloudburst (C) — "Break one sightline long enough to dash, cross, isolate, or retrieve the spike." / "Small one-ways are possible, but the short duration makes them a momentary duel tool rather than controller coverage." · Blade Storm (X) — "Preserve economy, fight accurately while moving, and pair vertical movement with a weapon that stays precise." / "Single-fire for reliable resets. Alternate fire is a close-range commitment and does not restore knives on a kill."
**Lore:** Origin South Korea — *"Jett represents her home country with an agile, evasive fighting style built around speed and calculated risk."* Lore — *"Her supernatural command of wind lets her move through fights in ways few opponents can track, favoring precision over brute force."*
**Rates:** pick rate 10.3% (rank 1), maps Breeze 11.7%/50.4% WR, Ascent 11.3%/49.9%, Haven 11.3%/50.0%.

### Sova (Initiator) — `gamesense-reference.js:40-58`, maps: Breeze, Haven
**Fundamentals:** *"Recon Bolt is strongest where defenders must expose themselves to break it. Call the pulse before it lands so the entry can move on the reveal."* / *"Owl Drone should clear the route your first player will actually take; start close enough that teammates can trade the drone's contact."* / *"Shock Bolt and Hunter's Fury convert confirmed information. Use them after a tag, plant sound, or teammate call rather than guessing at empty space."*
**Patch history:** 4.08 — "Owl Drone duration fell from 10 to 7 seconds and health from 125 to 100; its dart dropped from three reveal pings to two, while Shock Bolt max damage fell to 75." · 13.00 — "Sova's signature cooldown was reduced from 60 to 50 seconds, restoring more late-round Recon Bolt opportunities."
**Abilities:** Owl Drone (C) — "Clear the exact route the entry will take and force defenders to shoot or give up space." / "Start close enough that teammates can follow the drone. A full solo flight with nobody ready wastes the reveal window." · Shock Bolt (Q) — "Finish tagged enemies, clear utility, punish plants, and force players out of cover." / "Use full damage only when the center can land. Edge damage is pressure, not a guaranteed kill." · Recon Bolt (E) — "Confirm occupied lanes and make defenders turn away from the entry fight to break the dart." / "Place it where the pulse sees the fight but defenders cannot destroy it without exposing themselves." · Hunter's Fury (X) — "Convert recon or a drone tag, deny a plant or defuse, and damage clustered rotations." / "Lead the target between blasts. Firing all three at the same stale position gives away the remaining shots."
**Lore:** Origin Russia — *"Raised through the severity of the Russian tundra, Sova is a patient scout and relentless tracker."* Lore — *"Specialized equipment and a custom bow help him reveal, pursue, and eliminate enemies who believe they are concealed."*
**Rates:** pick rate 4.9% (rank 7), maps Ascent 8.4%/51.3% WR, Haven 7.9%/50.8%, Breeze 7.7%/50.8%.

### Omen (Controller) — `gamesense-reference.js:59-77`, maps: Split, Haven
**Fundamentals:** *"Dark Cover recharges, so survive the opening long enough to reshape the late round. Place each smoke against a named defender angle the team is ready to cross."* / *"Paranoia passes through walls and hits teammates, which makes its path a team timing tool: call the lane, cast beside the entry, then swing with them."* / *"Shrouded Step and From the Shadows create doubt before they create kills. Teleport when sound, smoke, or pressure gives the enemy more than one landing to respect."*
**Patch history:** 4.04 — "Dark Cover cooldown fell from 40 to 30 seconds and projectile speed rose from 2800 to 6400; Shrouded Step became cheaper and faster to complete." · 13.00 — "Enemy-facing Shrouded Step audio was updated to make nearby teleports easier to parse during chaotic fights."
**Abilities:** Shrouded Step (C) — "Reach elevation, escape utility, cross a watched gap, or reposition after making noise elsewhere." / "Hide the channel sound or force the enemy to watch multiple landing points. Unsupported open-ground teleports are a gamble." · Paranoia (Q) — "Start a coordinated swing through a narrow lane or disable a defender holding behind cover." / "Call the path before casting. It can hit teammates, so align the projectile beside their approach rather than through them." · Dark Cover (E) — "Remove named angles, sell pressure across the map, and preserve a smoke for the late round." / "One-ways are possible on ledges and boxes, but require consistent placement. A complete execute smoke matters more than a fragile trick setup." · From the Shadows (X) — "Recover the spike, force defenders to turn, sell a fake, or convert information into a fast rotation." / "Choose a landing with cover and a reason. A cancel can still create value if it forces the enemy to abandon position."
**Lore:** Origin Unknown — *"Omen is a phantom of memory whose fragmented identity remains one of the Protocol's deepest mysteries."* Lore — *"He moves through darkness, blinds the opposition, and lets uncertainty spread before striking from an unexpected angle."*
**Rates:** pick rate 4.9% (rank 7), maps Haven 5.6%/47.6% WR, Ascent 5.3%/47.6%, Lotus 5.2%/47.5%.

### Viper (Controller) — `gamesense-reference.js:78-96`, maps: Breeze, Bind
**Fundamentals:** *"Toxic Screen and Poison Cloud share fuel, so cycle them around the team's contact instead of spending the full tank before anyone can take space."* / *"Her wall is permanent for the round and the orb is only recoverable during Buy Phase. Commit each setup to the lanes your team actually plans to contest."* / *"Snake Bite's Vulnerable effect turns teammate damage into the real threat. Pair it with a choke, smoke, plant sound, or swing rather than relying on the puddle alone."*
**Patch history:** 3.00 — "Snake Bite duration fell from 8 to 6.5 seconds and its price rose from 100 to 200 credits as Riot reduced Viper's stall time." · 8.08 — "Smoke uptime fell to 12 seconds, minimum activation fuel rose to 30%, and Snake Bite moved to one 300-credit charge with a 6.5-second duration."
**Abilities:** Snake Bite (C) — "Clear a corner, stop a plant or defuse, and double the threat of teammate damage through Vulnerable." / "Damage depends on how long the target remains inside, so pair it with a choke, smoke, stun, or confirmed spike timing." · Poison Cloud (Q) — "Control a choke repeatedly and create strong one-way fights from stable ledges." / "One-ways are a core strength, but difficult throws need a reproducible lineup. If the orb misses, the setup can be unrecoverable after Buy Phase." · Toxic Screen (E) — "Split open sites, hide several crossing lanes at once, and control when defenders regain information." / "Place it for the entire round plan. The emitters cannot be moved, so a wall that helps defenders retake can hurt the team later." · Viper's Pit (X) — "Lock down a planted spike or high-value zone and force close, uncertain fights." / "Move between several safe pockets. Repeating one hiding spot turns the entire ultimate into one pre-aimed duel."
**Lore:** Origin United States — *"Viper is an American chemist who applies a formidable scientific mind directly to the battlefield."* Lore — *"Her chemical devices control space and impair enemies, and she is willing to use every advantage to secure the mission."*
**Rates:** pick rate 0.9% (rank 25), maps Breeze 3.9%/50.4% WR, Split 0.6%/47.9%, Lotus 0.5%/48.2%.

### Cypher (Sentinel) — `gamesense-reference.js:97-134`, maps: Bind, Split
**Fundamentals:** *"Trapwire is strongest when your position can punish the slow and reveal. Build the crossfire first, then choose a wire attackers cannot clear safely."* / *"Cyber Cage breaks vision and announces a crossing, so pair its audio cue with a swing or use it to leave before the trade arrives."* / *"Spycam keeps value while Cypher stays alive. Change camera and wire height between gun rounds so one learned clear does not solve the whole setup."*
**Patch history:** 11.08 — "Trapwire windup fell to 0.9 seconds, stopped concussing, and instead applied a 50% slow plus a one-second reveal; Spycam gained clearer proximity audio and stealth rules." · 13.00 — "Trapwire windup was reduced again, from 0.9 to 0.7 seconds, improving Cypher's anchor conversion window."
**Abilities:** Trapwire (C) — "Protect a flank, delay an entry, and create a guaranteed wallbang or swing timing." / "Change height and anchor position. A trip has little value if attackers can clear it without exposing themselves." · Cyber Cage (Q) — "Break vision, isolate a choke, or trigger a swing from the crossing audio." / "One-way cages are possible on many ledges and are strong when the exposed feet line is consistent. Test the height from both sides." · Spycam (E) — "Confirm an execute, watch a rotation, and force an enemy to turn away from the gunfight." / "Use a view that answers one question clearly. A hidden camera pointed at empty geometry is not information." · Neural Theft (X) — "Call rotations, isolate lurkers, and time a swing between reveal pulses." / "Say which enemy position changes the plan. The second reveal can punish players who immediately reposition after the first."
**Lore:** Origin Morocco — *"Cypher is a Moroccan information broker who watches the battlefield through an extensive surveillance network."* Lore — *"He tracks movement, protects hidden information, and treats every enemy habit as another secret waiting to be uncovered."*
**Rates:** pick rate 3.4% (rank 11), maps Split 4.9%/50.2% WR, Sunset 4.5%/50.1%, Haven 3.8%/50.6%.

### Sage (Sentinel) — `gamesense-reference.js:116-134`, maps: Bind, Split
**Fundamentals:** *"Barrier Orb changes the map, not just the timer. Place it to secure a plant, split a retake, or create an elevation the opponent must clear deliberately."* / *"Slow Orb is a timing tool: land it where attackers still need to cross, then let teammate damage or a coordinated peek punish the reduced movement."* / *"Healing Orb and Resurrection gain value when Sage survives. Play one layer behind first contact and clear the recovery route before committing to a revive."*
**Patch history:** 11.08 — "Barrier Orb cost fell from 400 to 300 and fortified after 2 seconds, while fortified segment health fell from 800 to 600." · 13.00 — "Healing Orb's self-heal-over-time increased from 50 to 100, restoring more of Sage's personal sustain."
**Abilities:** Barrier Orb (C) — "Delay a choke, secure a plant, reshape an angle, or elevate a teammate." / "Off-angle walls are possible, but every exposed segment can give attackers a safe breaking target. Build for a specific fight or timing." · Slow Orb (Q) — "Hold attackers in damage utility, stop a fast hit, and make a retake swing easier to time." / "Throw it where enemies must cross, not where they already finished moving. Layer two slows only when the extra time changes the round." · Healing Orb (E) — "Restore a teammate who can take another meaningful fight and preserve armor value." / "Do not cross an exposed lane just to heal. Ask whether the healed player can actually rejoin the round." · Resurrection (X) — "Recover a key weapon, restore numbers, or force defenders to contest the body." / "Clear the body and name the revived player's escape route first. A resurrection that immediately dies spends the ultimate without restoring pressure."
**Lore:** Origin China — *"Sage creates safety for her team wherever the mission takes them and serves as a calm center in chaotic fights."* Lore — *"Her Radiant power heals allies, denies ground, and can return a fallen teammate to the fight."*
**Rates:** pick rate 6.8% (rank 5), maps Split 8.9%/52.3% WR, Sunset 6.7%/51.9%, Haven 6.5%/51.5%.

## Templated (23) — `gamesense-encyclopedia.js`, `GENERATED_AGENTS`

For each: role, fundamentals (3 real Riot-sourced lore/ability-summary lines), 2 patch-history entries with real Riot source URLs, all abilities with real Riot summary text but templated purpose/setup, official lore. `facts` (dead field) and `maps: []` omitted below since identical/empty for all 23 — see Part 1.4.

**Astra** (Controller, `:6-132`) — Signature abilities: Nova Pulse, Nebula/Dissipate, Gravity Well, Astral Form/Cosmic Divide, Astral Form (passive). Lore: *"Ghanaian Agent Astra harnesses the energies of the cosmos to reshape battlefields to her whim. With full command of her astral form and a talent for deep strategic foresight, she's always eons ahead of her enemy's next move."*

**Breach** (Initiator, `:134-244`) — Flashpoint, Fault Line, Aftershock, Rolling Thunder. Lore: *"The bionic Swede Breach fires powerful, targeted kinetic blasts to aggressively clear a path through enemy ground."*

**Brimstone** (Controller, `:245-356`) — Stim Beacon, Incendiary, Sky Smoke, Orbital Strike. Lore: *"Joining from the U.S.A., Brimstone's orbital arsenal ensures his squad always has the advantage."*

**Chamber** (Sentinel, `:357-468`) — Rendezvous, Trademark, Headhunter (note: stray wiki markup `"20px|link="` in Charges field, `:415`), Tour De Force. Lore: *"Well-dressed and well-armed, French weapons designer Chamber expels aggressors with deadly precision."*

**Clove** (Controller, `:469-580`) — Pick-me-up, Ruse, Not Dead Yet, Meddle. Lore: *"Scottish troublemaker Clove makes mischief for enemies in both the heat of combat and the cold of death."*

**Deadlock** (Sentinel, `:581-692`) — Sonic Sensor, Barrier Mesh, GravNet, Annihilation. Lore: *"Norwegian operative Deadlock deploys an array of cutting-edge nanowire to secure the battlefield."*

**Fade** (Initiator, `:693-804`) — Seize, Haunt, Prowler, Nightfall. Lore: *"Turkish bounty hunter Fade unleashes the power of raw nightmare to seize enemy secrets."*

**Gekko** (Initiator, `:805-916`) — Wingman, Dizzy, Mosh Pit, Thrash. Lore: *"Gekko the Angeleno leads a tight-knit crew of calamitous creatures."*

**Harbor** (Controller, `:917-1027`) — High Tide, Storm Surge, Cove, Reckoning. Lore: *"Hailing from India's coast, Harbor storms the field wielding ancient technology with dominion over water."*

**Iso** (Duelist, `:1029-1140`) — Undercut, Kill Contract, Double Tap, Contingency. Lore: *"Chinese fixer for hire Iso falls into a flow state to dismantle the opposition."*

**KAY/O** (Initiator, `:1141-1252`) — FRAG/ment, FLASH/drive, ZERO/point, NULL/cmd. **Patch history is a placeholder pattern, not real balance notes**: both entries read *"Current ability verification: KAY/O is listed in Riot's live playable-agent content feed. No additional balance value is inferred."* Lore: *"KAY/O is a machine of war built for a single purpose: neutralizing radiants."*

**Killjoy** (Sentinel, `:1253-1364`) — Nanoswarm, ALARMBOT (both slotted "C - Basic" — **data conflict, see Part 1.4**), TURRET, Lockdown. Lore: *"The genius of Germany, Killjoy effortlessly secures key battlefield positions with her arsenal of inventions."*

**Miks** (Controller, `:1365-1476`) — **name not independently verified, see Part 1.4.** M-pulse, Waveform, Harmonize, Bassquake. Lore: *"Straight from Croatia, Miks takes the stage channeling pure sound energy."*

**Neon** (Duelist, `:1477-1588`) — High Gear, Relay Bolt, Fast Lane, Overdrive. Lore: *"Filipino Agent Neon surges forward at shocking speeds, discharging bursts of bioelectric radiance."*

**Phoenix** (Duelist, `:1589-1715`) — Blaze, Hot Hands, Curveball, Run it Back, Heating Up (passive — note templated "setup" text incorrectly talks about "deploying" a passive with no cast, `:1687`). Lore: *"Hailing from the U.K., Phoenix's star power shines through in his fighting style."*

**Raze** (Duelist, `:1716-1827`) — Blast Pack, Paint Shells, Boom Bot, Showstopper. **Has real orphaned data in `gamesense-reference.js:172-176, 203-206` that's disconnected — see Part 1.4.** Lore (generated version): *"Raze explodes out of Brazil with her big personality and big guns."*

**Reyna** (Duelist, `:1828-1939`) — Devour (mislabeled "Q - Signature", should be "Q - Basic"), Dismiss, Leer, Empress. Lore: *"Forged in the heart of Mexico, Reyna dominates single combat, popping off with each kill she scores."*

**Skye** (Initiator, `:1940-2051`) — Trailblazer, Guiding Light, Regrowth, Seekers. Lore: *"Hailing from Australia, Skye and her band of beasts trailblaze the way through hostile territory."*

**Tejo** (Initiator, `:2052-2163`) — Guided Salvo, Special Delivery, Armageddon (mislabeled "E - Ultimate", should be "X - Ultimate"), Stealth Drone. **One patch note truncated mid-sentence, ends on an open parenthesis** (`:2074`). Lore: *"A veteran intelligence consultant from Colombia, Tejo's ballistic guidance system pressures the enemy."*

**Veto** (Sentinel, `:2164-2275`) — **name not independently verified, see Part 1.4.** Interceptor, Crosscut, Evolution, Chokehold. Lore: *"Empowered by an unstoppable DNA mutation, Senegalese enforcer Veto defies the rules of engagement."*

**Vyse** (Sentinel, `:2276-2387`) — Shear, Arc Rose, Razorvine, Steel Garden. **One patch note truncated, ends abruptly on a colon** (`:2299`). Lore: *"Metallic mastermind Vyse unleashes liquid metal to isolate, trap, and disarm her enemies."*

**Waylay** (Duelist, `:2388-2499`) — Refract, Saturate, Lightspeed, Convergent Paths. Lore: *"Thailand's prismatic radiant Waylay transforms into light itself as she darts across the battlefield."*

**Yoru** (Duelist, `:2500-2611`) — FAKEOUT, BLINDSIDE, GATECRASH (missing punctuation in source text, `:2557`), DIMENSIONAL DRIFT. Lore: *"Japanese native Yoru rips holes straight through reality to infiltrate enemy lines unseen."*

## Agent Dossier UI Chrome (`gamesense-library.js`)

- Topic description: *"Role expectations, ability facts, costs, timing, and repeatable setups."* (`:17`)
- Gallery card: "Inspect abilities" (`:280`), role filter "All Agents" + lowercase role tabs (`:401-407`)
- "Agent Fundamentals" section header (via `renderList`, `:753`)
- Ability detail panel: "Round purpose" / "Setup and difficulty" (`:714`)
- Lore block: "Lore and History" (`:723`), "Gameplay history" (`:728`), "Riot patch notes" link text (`:729`)
- Detail head: "${role} Field Guide" (`:741`), "Active season" chip, "Back to agents" (`:742`)
- "Global Pick Rate" / "Rank #${n}" (`:747-748`), fallback *"No verified current Competitive usage sample"* (`:738`)
- "Ability Analysis" / "Select an ability" (`:756`)
- "Map Fit" section (`:763`), tile fallbacks "Pick pending" / "Win pending" (`:779`), empty-state *"No verified current-season map-fit sample is attached to this agent dossier."* (`:780`)
- "Pending" fallback for non-finite percentages (`:785-787`)
- Related video: "Related Video" / "Watch on YouTube" (`:816-819`)
