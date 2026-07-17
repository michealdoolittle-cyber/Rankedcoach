# Gamesense Library — Build It Like an Encyclopedia (2026-07-17, revised)

**Status:** Ready to build, full scope, no phases. Michael's correction on the first draft of this note: don't structure this as tiers with approval gates between batches — the Library is meant to work like an encyclopedia, complete and available to look up, not a staged rollout. **Build coverage for every remaining agent and map. No "ship Tier 1, wait for a check-in, then do Tier 2."** Second correction: the writing itself needs to be plainer — explain terms in the sentence instead of assuming the reader already knows them. Both are reflected below; the Reyna example is rewritten to the new standard.

Checked actual coverage before any of this — weapons are complete (16/16, genuinely substantive already). Maps and agents are the real gap: only 7 of ~29 agents and 3 of ~10 maps have any content, and the 3 covered maps skew wrong (out-of-rotation Bind is covered; the 5 maps actually in the current competitive pool — Ascent, Fracture, Haven, Lotus, Pearl — are not).

**On sourcing:** there's no single "coaching advice database," but the raw material exists — official patch notes, Riot's own API for exact ability data, wikis, pro guides. Package it, don't invent it. **Never generate ability stats, patch history, or tactical advice from memory.** That's how the existing false-info problem happened (all Library content is 100% hand-authored with zero live-data backing, confirmed in `notes/gamesense-library-accuracy-fixes-2026-07-17.md`). Every fact in the Reyna example below is sourced; hold every new entry to the same standard.

---

## 1. Writing standard — plain, self-explanatory, encyclopedia tone

This applies to every `fundamentals`/`purpose`/`setup` line written from here forward, including a re-pass on the 7 agents/3 maps already live if they read too jargon-dense on review.

- **Explain a term the sentence needs, in the sentence** — don't assume the reader already knows what a "signature ability," "site-execute," "one-way," or "wallbang" is. If a word needs game knowledge to parse, define it in five words or fewer right where it's used, the way an encyclopedia entry would.
- **Keep the underlying facts exactly as precise** — this is not about removing detail or accuracy, only about not requiring prior expertise to read it. A newer player and an experienced one should both be able to read the same entry and get something real out of it.
- **Still ground every claim in a real source** — plain language doesn't mean less rigor, it means the same rigor written more accessibly.

**Correction (2026-07-17, same day):** the first version of this example got Reyna's kit wrong — it labeled Leer as her signature (free) ability and Devour/Dismiss as both flat-cost Basics. That's backwards. Confirmed via a direct, targeted search (a full wiki-page fetch had actually already surfaced this data but lost it in AI summarization — lesson for the rest of this batch: for "which ability is free" specifically, ask that exact question directly rather than fetching a full page and trusting the summary caught it): **Dismiss (E) is the Signature ability** — one free charge each round (still requires a Soul Orb to trigger). Devour and Dismiss share a combined pool of up to 4 uses; only that first Dismiss charge each round is free, further uses cost credits. **Leer (C) is a Basic ability**, always 250 credits, with no connection to the Soul Harvest/orb system at all.

**Reyna's `fundamentals`, corrected and in plain language:**
```js
fundamentals: [
  "Reyna gets stronger the more she kills, and much weaker when she can't. Devour and Dismiss both need a 'Soul Orb,' which only appears when Reyna herself kills an enemy — so getting the first kill in a fight matters more for her than for most other agents.",
  "Every agent gets one ability free each round — for Reyna, that's Dismiss, her signature. Devour and Dismiss share a pool of up to 4 total uses, but only that first Dismiss each round is free; using Devour, or a second use of either in the same round, costs credits. Leer is different again — it's never free, always 250 credits, whether or not the signature charge has been used yet.",
  "Empress makes Reyna better in a fight she's already in — faster shooting, unlimited use of her other abilities — but it doesn't clear out an area the way some other agents' ultimates do. It's best saved for when Reyna is already exchanging gunfire and wants to win that fight, not as a setup move before one starts."
]
```

**Two rewritten abilities showing the corrected cost fields (apply the same plain-language pass to `purpose`/`setup` on all 4 before merging):**
```js
ability("devour", "Devour", "Q - Basic", "reyna",
  "Instantly consume a nearby Soul Orb (left behind by an enemy who died within 3 seconds of taking damage from Reyna) to rapidly gain temporary health.",
  { Cost: "200 credits (free if it's the shared pool's first use this round)", Charges: "Shares a pool of 4 with Dismiss", Recharge: "No", Damage: "None" },
  "Lets Reyna heal back up quickly right after getting a kill, so she can keep fighting at higher health instead of falling back to recover.",
  "Only works if Reyna herself damaged the enemy who died — a teammate's kill doesn't create a Soul Orb for her to use, so don't wait on an orb that isn't coming."),
ability("dismiss", "Dismiss", "E - Signature", "reyna",
  "Instantly consume a nearby Soul Orb to become Intangible (untouchable, can't be seen or heard while moving) for a short duration.",
  { Cost: "Free for the round's first shared-pool use, 200 credits after", Charges: "Shares a pool of 4 with Devour", Recharge: "No", Damage: "None" },
  "Escape a losing position, reposition mid-fight without being traded, or reset to a new angle after getting a kill.",
  "It's a repositioning tool, not extra damage — plan where you're actually going before activating it, not just that you're temporarily safe.")
```

Leer and Empress keep their original (already-correct) descriptions from the first draft — only their category framing in `fundamentals` needed fixing, not their own stat lines. Sourcing: Riot's own ability text via `valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc`; the free-charge mechanic confirmed via direct search, not page-fetch summarization; remaining costs/patch history cross-checked against Liquipedia (Fandom is currently returning a 402/paywall for this project's fetch tooling, don't rely on it).

---

## 2. Build every remaining agent and map — no tiers, no gating

22 agents, 7 maps. Build all of them. A rough build order is still useful just to sequence the work sensibly (start with agents/maps people are more likely to look up first), but it is **not** a phase boundary — don't stop and wait for sign-off between groups, and don't treat any agent or map as lower priority than "eventually."

**Suggested build order (not a gate):** Phoenix, Chamber, Killjoy, Astra, Breach, Skye, Neon, Fade, Kayo, Gekko, Iso, Clove, Brimstone, Harbor, Yoru, Deadlock, Vyse, Tejo, Waylay, Miks, Veto. *(Verify this list against a live call to `valorant-api.com/v1/agents` first — it was compiled from what's visible in the app's own Stats page agent grid, not independently re-checked name-by-name against the current live roster.)*

For each: pull exact ability names/descriptions from `valorant-api.com/v1/agents/{uuid}?language=en-US`, cross-check costs/charges/patch history against Liquipedia or official `playvalorant.com` patch notes, and write `fundamentals`/`purpose`/`setup` in the plain style from section 1 — specific to that agent's actual kit, never generic boilerplate that could apply to any agent in the same role.

**Specifically verify which ability is the free Signature for every agent — don't assume it maps cleanly onto valorant-api.com's internal slot names.** This is exactly where the Reyna draft went wrong: its "Grenade"-labeled slot was assumed to be the signature and wasn't. For this one fact specifically, ask a direct, targeted question ("is [agent]'s [ability] free every round?") rather than fetching a full wiki page and trusting the summary preserved the detail — a full-page fetch on this exact question already had the right data and still lost it in summarization once.

**Maps, same approach, all 7:** Ascent, Fracture, Haven, Lotus, Pearl, Abyss, Corrode. Match the existing Bind/Breeze/Split structure in `gamesense-maps.js` — callouts, plant spots, weapon suggestions, `macro` notes, `siteTips`, `teamplayTips`, `roleNotes`, and `metaComp`/`metaComps` per `notes/global-comp-rank-disclosure-2026-07-14.md` (OP.GG Ascendant+ sample, honest pick-share disclosure). Callout x/y coordinates need the real map layout image and manual placement — don't estimate them.

---

## 3. Weapons — accuracy audit, not new content

All 16 already substantive and specific. This project's job for weapons is a spot-check of existing `patchHistory` against real patch notes (the accuracy-fixes review may not have covered weapons yet), not new authoring.

---

## Testing checklist — don't report this done until:

1. Every entry's ability stats and patch history trace to a real source — no numbers from memory.
2. Every `fundamentals`/`purpose`/`setup` line passes the plain-language standard in section 1 — a reader without deep game knowledge can follow it, and any term it needs is explained inline.
3. Text is specific to that agent/map's actual mechanics, never reusable boilerplate.
4. Spot-check at least 2 entries per work session against a second independent source before merging.
5. `node --check` passes on every touched file; run the existing visual-audit test suite plus the full passthrough before deploying.
6. Bump the cache key in `public/index.html` for every changed asset.
