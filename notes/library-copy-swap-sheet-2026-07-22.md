# Library Copy Swap Sheet — 2026-07-22

**Status:** Review sheet for the current uncommitted edits in `public/library/gamesense-maps.js` and `public/library/gamesense-reference.js`.

**Purpose:** This is a 1:1 replacement guide so Michael can see the exact current sentence, the exact proposed replacement, and the UI/data context before deciding whether to keep, rewrite, or revert each change.

## How to use this

Search the **Find this exact text** value in the source file, then replace it with the matching **Replace with this exact text** value. Rows marked **Remove field** are not sentence swaps; they are cleanup items where the current data field is being removed from that record.

## File 1: `public/library/gamesense-maps.js`

### Bind map labels and callouts

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Bind layout callout label | `A Bath` | `A Showers` | Uses the current/common Valorant callout naming. |

### Bind weapon suggestions

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Bind > Phantom > locations | `Hookah, Lamps, Bath` | `Hookah, Lamps, Showers` | Aligns the callout with Showers naming. |
| Bind > Operator > note | `On defense, long lanes create early picks, but the lack of mid makes a missed read expensive. Pair it with an escape tool or planned teleporter rotation.` | `On defense, long lanes create early picks, while either teleporter can turn a missed opening read into a fast cross-map fight. Pair the Operator with an escape tool and a called rotation.` | Fixes the backwards “no mid means committed rotation” framing; teleporters make Bind rotations fast. |
| Bind > Ghost > locations | `A Short, Bath, B Long` | `A Short, Showers, B Long` | Aligns the callout with Showers naming. |
| Bind > Judge > locations | `Hookah, Lamps, U-Hall` | `Hookah, Lamps, U-Haul` | Corrects the callout spelling. |
| Bind > Judge > conversion | `Conversion read: more repeatable than an Operator when the setup guarantees two close contacts; much weaker if attackers can reset to Long or Bath.` | `Conversion read: more repeatable than an Operator when the setup guarantees two close contacts; much weaker if attackers can reset to Long or Showers.` | Aligns the callout with Showers naming. |
| Bind > Stinger > locations | `Hookah, Lamps, Bath` | `Hookah, Lamps, Showers` | Aligns the callout with Showers naming. |

#### Bind weapon suggestion field removals

These remove hand-typed weapon-stat fragments from individual map records so the Library does not drift away from canonical weapon stats.

| Context | Remove field |
| --- | --- |
| Bind > Phantom | `evidence: "0.84 kills per round \| 202 average damage",` |
| Bind > Operator | `evidence: "0.80 kills per round \| 220 average damage",` |
| Bind > Ghost | `evidence: "500 credits \| one-shot headshot through 30m",` |
| Bind > Judge | `evidence: "1,850 credits \| five-shell magazine",` |
| Bind > Stinger | `evidence: "228 average damage \| 1,100 credits",` |

### Bind macro notes

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Bind > macro > defense 1 | `Double up to contest the weak-side lane rather than spreading thin — accept giving up a low-value area to reinforce a high-value one instead.` | `Treat Hookah, Showers, Octagon, and U-Haul as Bind's high-value control areas. Double up when the read calls for it; owning one of these lanes gives the retake a flank route and shortens the next rotation.` | Replaces vague “weak-side” advice with named Bind control areas. |
| Bind > macro > defense 2 | `Shower control is the priority defensive anchor on this map — losing it tends to cascade into losing the rest of the defensive setup.` | `On A site, contest Showers or U-Haul before settling into straight-site positions. Giving up both lets attackers flood the site with utility and leaves the retake entering through predictable lanes.` | Makes Showers important without overstating it as the only priority. |
| Bind > macro > defense 3 | `Watch for predictable attacker patterns (a late shower lurk is a common one) — recognizing the pattern opens a window to punish it.` | `Look for repeated defaults, late lurks, and teleporter timings, then call an early punish. Waiting until the execute lands gives the pattern its value.` | Makes the advice more generally useful and more Bind-specific. |
| Bind > macro > attack 1 | `Bind has no mid, so once you commit to a site the rotation is fully committed too — there's no cheap way to redirect mid-execute.` | `Bind's two teleporters turn lane control into fast cross-map rotations. Draw utility or defenders first, then arrive at the exit together instead of treating first contact as a forced site commitment.` | Corrects the “no cheap redirect” framing. |
| Bind > macro > attack 2 | `Target whatever gap the enemy's agent picks create, rather than defaulting to the same site read every round.` | `Read the defensive composition before choosing pace: break sentinel utility early and commit late into double Sentinel; hit earlier into double Controller before rotating smokes recycle; hold disciplined defaults into double Initiator so repeated information sees no commitment; against double Duelist, take or hold forward lanes so aggression is called and traded.` | Turns broad advice into a role-composition read. |

### Bind site tips

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Bind > siteTips > A Short label | `A Short` | `A Showers` | The old label and text were pointing at the wrong tactical area. |
| Bind > siteTips > A Short text | `Clear Lamps before the spike crosses Truck; leaving it live lets one defender split the entire plant setup.` | `Clear Showers before the spike crosses Truck. A defender left there can split the site, punish the plant, and isolate the A Short group.` | Corrects the Showers/Lamps swap. |
| Bind > siteTips > A Bath label | `A Bath` | `A Lamps / U-Haul` | Moves the tip to the retake path actually being described. |
| Bind > siteTips > A Bath text | `Bath control creates the open plant and removes the safest close retake path. Hold it through the plant instead of abandoning it on entry.` | `Take and hold Lamps/U-Haul through the plant. It is the defenders' closest retake path and protects the planter from an immediate site re-entry.` | Corrects the callout and tactical meaning. |
| Bind > siteTips > B Hookah text | `Pair the Hookah drop with B Long pressure so defenders cannot aim at both elevations at once.` | `Build the B split around synchronized Hookah and Garden/B Long contact. Hold the drop until the Long group can trade, then clear site and Elbow from different directions.` | Adds timing/trade detail instead of a generic split line. |
| Bind > siteTips > B Long label | `B Long` | `B Long / Octagon` | Names the control area more precisely. |
| Bind > siteTips > B Long text | `Keep Elbow and Defender Spawn cut while the spike is planted for Long; otherwise the planter is exposed before the post-plant begins.` | `Keep Long or Octagon after the plant while a teammate holds site or Hookah. That crossfire forces the retake to clear separate lines instead of collapsing through Defender Spawn and Elbow together.` | Replaces “cut” language with clearer post-plant crossfire framing. |

### Bind teamplay tips

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Bind > teamplayTips > label 1 | `Teleport timing` | `Common fake` | New tip focuses on a practical fake setup. |
| Bind > teamplayTips > text 1 | `Call teleporter audio immediately and name the exit. The rotation is only useful if the destination player is ready for the next fight.` | `Sell A with Showers and A Short utility, then send one player through the A teleporter while the spike group holds B Long. Call whether the exit player is selling Hookah pressure or joining the hit before the audio plays.` | Adds a concrete play pattern. |
| Bind > teamplayTips > label 2 | `Two-lane hits` | `Eco-round plan` | Replaces generic teamplay with an eco-specific rule. |
| Bind > teamplayTips > text 2 | `Pressure both entrances to a site before committing so one defender cannot hold every attacker in a single choke.` | `Group the low buy to break one piece of sentinel utility and force a compact trade through Showers, U-Haul, or Hookah. Recover the first rifle before spreading into open lanes.` | Adds low-buy specificity. |
| Bind > teamplayTips > label 3 | `Post-plant jobs` | `Round-plan execution` | Reframes around pre-round planning. |
| Bind > teamplayTips > text 3 | `Assign one player to the spike and one to the flank before chasing exits; Bind's teleporters make late routes arrive quickly.` | `Before barriers drop, name the first lane, the teleporter trigger, and the reset condition. Bind's rotations are fast only when the destination group is ready for the exit fight.` | Better matches the corrected teleporter rotation logic. |

### Bind role notes

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Bind > Duelist > attack | `Take first space through A Short, Bath, Hookah, or B Long after support utility lands.` | `Take first space through A Short, Showers, Hookah, or B Long after support utility lands.` | Aligns the callout with Showers naming. |
| Bind > Duelist > sites | `Clear Lamps and Hookah with movement or explosive utility before teammates cross the choke.` | `On A, force the Showers split angle off and clear U-Haul/Lamps; on B, clear Hookah and Elbow before teammates spread into site.` | More precise by site. |
| Bind > Duelist > defense | `Contest one high-value lane with an escape plan instead of dry re-peeking after contact.` | `Contest Hookah, Showers, Octagon, or U-Haul with an escape plan instead of dry re-peeking after contact.` | Names the actual high-value lanes. |
| Bind > Initiator > attack | `Reveal or clear Hookah, B Long, Bath, and A Short immediately before the entry moves.` | `Reveal or clear Hookah, B Long, Showers, and A Short immediately before the entry moves.` | Aligns the callout with Showers naming. |
| Bind > Initiator > sites | `Use flashes and scans to isolate Lamps, A Heaven, Elbow, and Defender Spawn rather than covering empty space.` | `Use flashes and scans to isolate U-Haul/Lamps, A Tower, Elbow, and Defender Spawn rather than covering empty space.` | Uses preferred current callouts. |
| Bind > Initiator > teamplay | `Track teleporter audio so the team can rotate before the destination fight is already lost.` | `Track teleporter audio and call the exit so the team rotates before the destination fight is already lost.` | Adds the specific comm that matters. |
| Bind > Controller > sites | `For A hits, remove A Heaven and Lamps; for B hits, remove Defender Spawn and Elbow.` | `For A hits, smoke off A Tower and cover U-Haul/Lamps or Showers based on the lane the team owns; for B hits, smoke off Defender Spawn and Elbow.` | Adds lane ownership and clearer controller action. |
| Bind > Sentinel > defense | `Anchor where you can punish Hookah drop, B Long, A Short, or Bath contact without giving a free first death.` | `Anchor where you can punish Hookah, B Long, A Short, or Showers contact without giving a free first death.` | Aligns the callout with Showers naming and removes overly narrow “Hookah drop.” |

### Bind agent insight blurbs

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Bind > agentInsights > Raze | `Explosive movement and clearing utility break Bind's narrow Hookah, Bath, and A Short chokes.` | `Explosive movement and clearing utility break Bind's narrow Hookah, Showers, and A Short chokes.` | Aligns the callout with Showers naming. |
| Bind > agentInsights > Fade | `Haunt and Prowlers clear Lamps, Hookah, and site corners immediately before contact.` | `Haunt and Prowlers clear U-Haul/Lamps, Hookah, and site corners immediately before contact.` | Uses the full Lamps/U-Haul framing. |

### Breeze and Split weapon suggestion field removals

These do not change the visible coaching sentence text. They remove repeated `evidence` fragments from map-specific weapon records so the cards rely on conversion objects and canonical weapon data instead of duplicated snippets.

| Context | Remove field |
| --- | --- |
| Breeze > Phantom | `evidence: "0.84 kills per round \| 202 average damage",` |
| Breeze > Operator | `evidence: "0.80 kills per round \| 220 average damage",` |
| Breeze > Ghost | `evidence: "500 credits \| one-shot headshot through 30m",` |
| Breeze > Judge | `evidence: "1,850 credits \| five-shell magazine",` |
| Breeze > Spectre | `evidence: "30-round magazine \| 1,600 credits",` |
| Split > Phantom | `evidence: "0.84 kills per round \| 202 average damage",` |
| Split > Operator | `evidence: "0.80 kills per round \| 220 average damage",` |
| Split > Ghost | `evidence: "500 credits \| one-shot headshot through 30m",` |
| Split > Judge | `evidence: "1,850 credits \| five-shell magazine",` |
| Split > Spectre | `evidence: "30-round magazine \| 1,600 credits",` |

## File 2: `public/library/gamesense-reference.js`

### File review marker

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Header comment | `Static gameplay reference reviewed 2026-07-13.` | `Static gameplay reference reviewed 2026-07-17.` | Marks the review date for the accuracy pass. |

### Jett ability wording

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Jett > Blade Storm > ability summary | `Equip five accurate knives; single-fire kills restore knives while alternate fire spends the remaining set.` | `Equip five accurate knives; single-fire kills restore knives while alternate fire shotguns the remaining knives in one spread.` | Clarifies how alternate fire behaves instead of implying it simply spends the set. |

### Omen ability wording

| Context | Find this exact text | Replace with this exact text | Why |
| --- | --- | --- | --- |
| Omen > fundamentals > Paranoia bullet | `Paranoia passes through walls and hits teammates, which makes its path a team timing tool: call the lane, cast beside the entry, then swing with them.` | `Paranoia phases through terrain and objects and can hit teammates, which makes its path a team timing tool: call the lane, cast beside the entry, then swing with them.` | More accurate language than “passes through walls.” |
| Omen > Paranoia > ability summary | `A wall-piercing projectile that Nearsights and Deafens everyone it touches.` | `A shadow-phase projectile that Nearsights and Deafens everyone it touches while passing through terrain and objects.` | Uses the same corrected mechanic framing in the ability card. |

## Review notes before committing source changes

- The Bind changes are not just wording polish; they correct map-logic issues around Showers/Bath naming, Lamps/U-Haul retake paths, and teleporter rotation framing.
- The weapon `evidence` removals are data hygiene. If visible weapon cards still need stat copy, that should come from a canonical weapon stat source rather than hand-typed per-map strings.
- The Jett/Omen changes are direct ability-mechanic wording corrections.
- If Michael wants to hand-edit these manually, use this document as the checklist and then compare `git diff` against the current uncommitted source edits.
