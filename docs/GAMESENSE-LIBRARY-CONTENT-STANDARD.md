# Gamesense Library Content Standard

`docs/RANKEDCOACH-VOICE-GUIDE.md` and `docs/COACHING-LANGUAGE-RULES.md` govern **personalized coaching copy** — cards that read a specific player's own stats and logs ("Split is your highest win rate map right now at 22%..."). The Gamesense Library dossier (Maps, Agents, Weapons) is a different writing job: general strategy reference content that doesn't know anything about the individual reading it. It has never had its own equivalent standard, and that gap — not just word choice — is why dossier quality has drifted across many separate authoring passes. This document is that standard. Every new or rewritten piece of dossier content should be checked against both parts below before it ships.

---

## Part A — Coverage checklist: what should exist, per category

A missing category of information is a bigger problem than a badly worded sentence. Check coverage first, wording second.

### Weapons — every weapon entry should cover:
1. **Engagement range / use case** — where and when this gun is actually the right pick.
2. **Economy tier and buy context** — when it fits in a round's economy, not just its credit cost.
3. **Mechanical demand** — what spray/burst/tap discipline it requires, and what a player commonly gets wrong.
4. **Nearest-competitor comparison** — how it stacks up against the weapon players are actually choosing between (Judge vs. Operator at close range, Marshal vs. Operator as a lighter-buy sniper), not evaluated in isolation.
5. **Patch history** — recent buffs/nerfs, sourced from real patch notes (ties directly into the patch-detection automation already built — this is the field it should feed).
6. **Situational/map fit** — already structurally present via `weaponSuggestions`' location field; keep it, don't lose it in a rewrite.

### Maps — every map entry should cover:
1. **Attack-side and defense-side macro strategy** (already present — `macro`).
2. **Site-specific tips**, not generic ones — a tip has to name the actual site/location it applies to.
3. **Teamplay/execute coordination** — already present, keep the causal "why" attached to each tip.
4. **Role-specific notes**, genuinely tailored per role, not the same advice reworded four times.
5. **Weapon fit for this specific map** (already present via `weaponSuggestions`).
6. **Composition guidance** — already present, and already fixed for honest rank-scope framing (`notes/global-comp-rank-disclosure-2026-07-14.md`) — don't regress that fix in a rewrite pass.
7. **Common misplays specific to this map's geometry** — not generic "play smart," name the actual mistake (e.g. Bind's caught-mid-rotation death pattern, already documented in `docs/COACHING-LANGUAGE-RULES.md` rule 47 — the dossier prose and the coaching-rules reference should agree with each other, not contradict).

### Agents — every agent entry should cover:
1. **Kit-specific playstyle synergy** (Agent Fundamentals — already redirected here per the 2026-07-13 directive; verify this actually landed, don't assume).
2. **Facts, history, and stats** (Agent Facts and Stats — same directive; verify).
3. **Per-ability breakdown**: what it does, when to use it, the most common misuse — not a flat kit list.
4. **Within-kit combo sequencing** — how this agent's own abilities work together (e.g. smoke-then-dash), not cross-agent utility interactions (that stays a small footnote per item 5, not a full section).
5. **Utility-counter footnotes** where they genuinely exist (e.g. Killjoy's kit countering Sova's Recon Bolt/Owl Drone) — short, cross-referenced on both agents' ability detail panels, never a whole new category.
6. **Map fit** (already present).
7. **Role expectations specific to this agent's kit** — not generic role advice restated with the agent's name swapped in.

---

## Part B — Language standard

**Hold up what's already working, don't assume everything needs rewriting.** Real example already in the app that meets this bar: *"Clear Lamps before the spike crosses Truck; leaving it live lets one defender split the entire plant setup."* Concrete location, concrete consequence, causal "why" — that's the target for every tip, not an aspirational ideal.

- **Every claim is either a general, verifiable game-mechanics fact, or explicitly sourced from real external research** (matching the existing `_researchNote`/`_researchUrl` pattern already used informally in `gamesense-maps.js`) — never fabricated precision. This is the same discipline behind the Comp card rank-disclosure fix; it applies to every dossier field, not just that one card.
- **Name the specific thing** — the actual location, the actual weapon, the actual agent — never a vague substitute ("watch your surroundings" instead of "clear Lamps").
- **State the consequence, not just the instruction.** A tip that says what to do without saying why it matters is half-finished.
- **Avoid the same clinical/vague words the Voice Guide already bans** in personalized copy (model, signal, baseline, scoped, derived, entity, weighted, cumulative, selected window) — they're just as wrong in reference prose.
- **No forced content to fill a category.** If real, sourced information doesn't exist for a field (matching the project's established honesty pattern — Bind's `compStatus` fallback, the RR-unverified badge, the Global Comp rank-scope disclosure), say so plainly instead of inventing something to avoid an empty section.

---

## How this gets used

Every dossier content audit or rewrite (starting with the current full Weapons/Maps/Agents sweep) gets checked against Part A first — is anything missing — before Part B is applied to whatever text exists. A rewrite that only touches wording without checking coverage is treating a symptom.
