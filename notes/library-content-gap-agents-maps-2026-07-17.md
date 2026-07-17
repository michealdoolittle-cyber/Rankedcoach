# Gamesense Library — The Real Gap Is Coverage, Not Just Accuracy (2026-07-17)

**Status:** Ready to build, scoped as a multi-batch content project — this is not a small fix. Michael's ask: he wants every map, agent, and weapon covered, and flagged that the *existing* content also has factual errors (see `notes/gamesense-library-accuracy-fixes-2026-07-17.md`, already shipped) and weak advice quality. Checked the actual coverage against the full roster before proposing anything:

| | Covered | Total | Gap |
|---|---|---|---|
| **Weapons** | 16 | 16 | None — but see section 4, quality still needs an audit pass |
| **Maps** | 3 (Bind, Breeze, Split) | ~10 | **7 missing**, and critically: Bind is currently out-of-rotation while Ascent, Fracture, Haven, Lotus, Pearl — all in the *current* competitive pool — have zero coverage |
| **Agents** | 7 (Jett, Sova, Omen, Viper, Cypher, Sage, Raze) | ~29 | **22 missing** — over three-quarters of the roster |

Weapons need no new coverage, just a quality/accuracy pass (section 4). Maps and agents are where the real work is.

**On sourcing, per Michael's framing:** there's no single "coaching advice database," but the raw material exists all over the internet (official patch notes, Riot's own API for exact ability data, wikis, pro guides, coaching sites) — the job is packaging it well, not inventing it. **Do not generate ability stats, patch history, or tactical advice from memory/general knowledge.** That's exactly how the existing false-info problem happened (confirmed: all Library content is 100% hand-authored with zero live-data backing, per the accuracy-fixes note). Every fact below is sourced and cited; follow the same discipline for the rest.

---

## 1. Worked example, fully researched: Reyna (agent, zero prior coverage)

Proves the sourcing method end-to-end. Ready to paste into the `agents` array in `public/library/gamesense-reference.js` (schema matches the existing 7 entries exactly — `ability()` helper, `patchNote()` helper, same shape).

**Sources used:** exact ability names/descriptions from Riot's own data (`valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc`); costs/charges/patch history cross-checked against Liquipedia's structured Reyna page (chosen over Fandom, which is currently returning a paywall/402 for this project's fetch tooling — worth knowing for the rest of this batch, don't rely on Fandom).

```js
{
  id: "reyna", label: "Reyna", role: "Duelist", maps: [], // TODO: needs live Tracker Network map pick-rate check, don't guess
  icon: agentAsset("reyna", "icon"), portrait: agentAsset("reyna", "portrait"),
  fundamentals: [
    "Reyna snowballs off kills and does almost nothing without them — Soul Orbs only spawn from her own kills, so she rewards aggressive first contact more than any other duelist and punishes passive play with genuinely weak stats.",
    "Leer is her only paid signature in the game (most agents' signature is free) — 250 credits for a Nearsight that only affects enemies looking at it, so it's an entry-timing tool, not a smoke replacement. Cast it and swing immediately; a Leer with no follow-up is a wasted 250 credits.",
    "Empress is a personal reset, not a site-execute ultimate like Raze's or Jett's. It removes the cost/charge limit on Devour and Dismiss and buffs fire rate, but it doesn't clear space by itself — it's strongest mid-gunfight to keep fighting through what would otherwise be a losing duel."
  ],
  patchHistory: [
    patchNote("2.03", "Soul Harvest expanded to reward assists, not just kills; Devour and Dismiss charges fell from 4 to 2 and their cost rose to 200 credits each."),
    patchNote("3.00", "Leer's cost rose from 200 to 250 credits."),
    patchNote("5.07", "Leer's wind-up decreased, its range restriction was removed, and its Nearsight duration fell to 2.0 seconds."),
    patchNote("8.11", "Devour and Dismiss both sped up, and Empress changed from a timed duration to lasting until Reyna dies."),
    patchNote("9.05", "Empress's fire-rate buff was increased for more consistent recoil control while active.")
  ],
  abilities: [
    ability("devour", "Devour", "Q - Basic", "reyna", "Instantly consume a nearby Soul Orb (left by an enemy who died within 3 seconds of taking damage from Reyna) to rapidly gain temporary health.", { Cost: "200 credits", Charges: "2", Recharge: "No", Damage: "None" }, "Sustain through a multi-kill round or heal back up immediately after a trade so the next duel isn't fought on low HP.", "Only triggers off Reyna's own recent damage — it doesn't heal off a teammate's kill. Don't hold a fight waiting for an orb that isn't coming."),
    ability("dismiss", "Dismiss", "E - Basic", "reyna", "Instantly consume a nearby Soul Orb to become Intangible (untouchable, can't be seen or heard while moving) for a short duration.", { Cost: "200 credits", Charges: "2", Recharge: "No", Damage: "None" }, "Escape a losing position, reposition mid-fight without being traded, or reset to a new angle after getting a kill.", "It's a repositioning tool, not extra damage — plan where you're actually going before activating it, not just that you're temporarily safe."),
    ability("leer", "Leer", "C - Signature", "reyna", "Cast a destructible ethereal eye a short distance forward; it Nearsights any enemy who looks at it.", { Cost: "250 credits", Charges: "2", Duration: "2.0 seconds", Damage: "None" }, "Cover an entry by blinding whoever's watching the angle you're about to take.", "It only affects enemies who look at it, so throw it into the angle you expect a defender to be holding, not into empty space — and follow up immediately, since 2 seconds is short."),
    ability("empress", "Empress", "X - Ultimate", "reyna", "Instantly enter a frenzy: firing, equip, and reload speed increase dramatically, and Devour/Dismiss become free with infinite charges for the duration.", { Cost: "6 ultimate points", Duration: "Until death", Damage: "None" }, "Fight through a round you'd otherwise lose, or chain multiple kills without needing to buy or find new orbs.", "It's a mid-fight power spike, not a space-clearing tool — pop it when you're already in or about to be in a duel, not as a pre-round buff with nothing to fight yet.")
  ]
}
```

---

## 2. Priority order for the remaining 21 agents

Don't do these alphabetically — sequence by what's actually likely to matter to a player using the app, same logic already applied to the Sketchfab work.

**Tier 1 — highest pick-rate / most likely to be searched (do these first):** Phoenix, Chamber, Killjoy, Astra, Breach, Skye, Neon. These are consistently high-pick-rate agents across ranked play; a player is far more likely to open the Library looking for one of these than for a rarely-picked agent.

**Tier 2 — solid mid-priority:** Fade, Kayo, Gekko, Iso, Clove, Brimstone, Harbor, Yoru.

**Tier 3 — lower pick-rate but still real gaps:** Deadlock, Vyse, Tejo, Waylay, Miks, Veto.

*(If any of these names are wrong/outdated for the current roster, verify against the live `valorant-api.com/v1/agents` list first — the roster changes over time and this list was compiled from what's visible in the app's own Stats page agent grid, not independently re-verified against a live API call for every name.)*

For each: pull exact ability names/descriptions from `valorant-api.com/v1/agents/{uuid}?language=en-US` (get the uuid from the list endpoint first), cross-check costs/charges/patch history against Liquipedia (not Fandom — currently blocked for this project's fetch tooling) or official `playvalorant.com` patch notes directly, and write `fundamentals`/`purpose`/`setup` text in original language the way Reyna's entry above does — specific to that agent's actual kit interactions, not generic "use your abilities wisely" filler. That specificity is what separates useful advice from the "poor advice" Michael flagged.

---

## 3. The 7 missing maps — prioritize the in-rotation 5 first

**Do first (currently in the competitive map pool):** Ascent, Fracture, Haven, Lotus, Pearl.
**Lower priority (out of rotation right now, per the Stats page):** Abyss, Corrode. (Bind is already covered, despite also being out of rotation.)

Match the exact structure already used for Bind/Breeze/Split (`gamesense-maps.js`) — callouts with x/y coordinates, plant spots, weapon suggestions with round-conversion evidence, `macro` attack/defense notes, `siteTips`, `teamplayTips`, `roleNotes` per role, and the `metaComp`/`metaComps` composition data (per `notes/global-comp-rank-disclosure-2026-07-14.md`, use OP.GG's Ascendant+ sample with the honest pick-share disclosure, not a blended-rank source). The callout x/y coordinates specifically require the actual map layout image and careful manual placement — don't estimate these, verify against the real map graphic.

---

## 4. Weapons — accuracy audit, not new content

All 16 already have substantive, specific content (verified — e.g. Vandal/Phantom/Guardian entries cite real patch numbers with real stat deltas, not generic filler). This batch's job for weapons is narrower: spot-check the existing `patchHistory` entries against real patch notes for accuracy (the same review process that already found real errors in map/agent content per the accuracy-fixes note may not have covered weapons yet — confirm rather than assume they're clean), not author anything new.

---

## Testing checklist — don't report a batch of this done until:

1. Every new agent/map entry's ability stats and patch history are traceable to a real source (valorant-api.com for current data, Liquipedia or official patch notes for history) — no numbers written from memory.
2. `fundamentals`/`purpose`/`setup` text is specific to that agent/map's actual mechanics, not reusable boilerplate that could apply to any agent in the same role.
3. Spot-check at least 2 completed entries per batch against a real player's understanding (or a second independent source) before merging — same "don't just trust one pass" discipline the accuracy-fixes note established.
4. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying, per the standing project rule.
5. Bump the cache key in `public/index.html` for every changed asset.
6. Given the size of this project (22 agents + 7 maps), confirm with Michael whether batches ship incrementally (e.g., Tier 1 agents first, in-rotation maps first) as each completes, or whether he wants to review before each batch goes live — don't assume either way.
