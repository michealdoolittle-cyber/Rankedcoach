# Valorant Voice Layer — Design for Player-Facing Language, Full Directive

**Status:** Built 2026-07-11. The shared vocabulary bank, deterministic high-frequency card variants, and active insight-copy audit are wired and verified. Ask Coach source consumes the same bank.

**Deploy status (2026-07-11): LIVE.** Supabase Edge Function deployment was blocked on CLI auth — Michael provided a personal access token, Claude authenticated and ran `supabase functions deploy ask-coach --project-ref jqrsjaaxtdxfmpbtrupj` directly. Confirmed via a real production test call (not just a successful deploy message): asked "Why do I keep dying first in rounds even when I win the gunfight?" and got back genuine Valorant-native language — "dry wide swinging into common double-hold spots," "jiggle-peek or shoulder peek to bait the shot," "your teammate should be close enough to trade" — no glossary-explaining, matches the directive's intent exactly.

**Outstanding gap found during verification, NOT yet fixed:** the "Win Streak"/"Loss Streak" cards (`app.js:10615-10633`) — the exact calibration example used in Part 2d below — are still completely unfixed. Same generic copy ("Performance or decisions are trending negatively," "Take a break or reset approach"), plus a stale `"Riot API"` source label that should say Henrik now. This means Part 2c's "full audit pass" was marked complete but missed at least this card — Codex should re-check the same older section of the file (roughly lines 10448-10650) for other similarly-missed cards before trusting the audit is actually done.

Michael's original assessment after reading `docs/COACHING-LANGUAGE-RULES.md`: Ask Coach is good in general but leans robotic instead of Valorant-native and human. The rest of the app's player-facing cards (Home/Stats/Insights) are the bigger problem — generic enough that players either bounce immediately because the app doesn't feel like it's actually about Valorant, or waste time decoding what a card is implying because it avoids real game mechanics language.

## The actual finding, not a guess — the app already knows how to do this well in places

Read a wide sample of real card copy across the codebase before designing anything. **The quality gap isn't uniform — it's inconsistency between old and new code.**

**Already good** (`app.js:5540-5556`, the rank-benchmark card built this week): *"Keep crosshair placement as the focus, but judge it alongside fight selection instead of chasing headshots alone."* / *"Trim low-percentage peeks and stay close enough to teammates for trades before taking the next duel."* This is genuinely Valorant-native — crosshair placement, fight selection, peeks, trades are real terms a player uses, not analytics-speak wrapped in a game skin.

**Still robotic** (`app.js:10448-10454`, an older "Loss Streak" card): *"You are on a ${streak} game loss streak"* / *"Performance or decisions are trending negatively"* / *"Take a break or reset approach."* Zero game vocabulary. Reads like a generic productivity app, not a Valorant coach. This is the pattern to fix, and it's not isolated — expect it throughout older insight blocks that predate the more recent, better-written ones.

**The directive, therefore, isn't "invent a voice from nothing."** It's: find every card that reads like the second example, and bring it up to the standard the app already proved it can hit in the first example. Use the newer cards as the internal quality bar, not an external style guide invented from scratch.

---

## Part 1 — Ask Coach: closer, not a redesign

Ask Coach is a real LLM call (`supabase/functions/ask-coach/index.ts:74-97`) with an already-solid system prompt — "Be conversational, specific, and practical. Sound like a calm coach, not a stats report," "Answer in a human, direct style." The gap Michael's flagging is narrower than the card problem: the prompt never explicitly tells the model to use actual Valorant terminology, so it defaults to competent-but-generic coaching language instead of player-native language.

**Directive:** add one instruction to the `instructions` array (`ask-coach/index.ts:74-97`), after the existing tone instructions:

> "Use real Valorant terminology naturally where it fits — peek, hold, trade, rotate, off-angle, wide swing, jiggle-peek, eco, force-buy, site-take, retake, post-plant, lurk, anchor, entry, crosshair placement, pre-fire, stack. Don't force these in artificially, and don't explain them like a glossary — use them the way a player who's actually good at the game would talk, assuming the reader already knows what they mean."

This is a small, low-risk prompt addition, not a rebuild — the existing structure (short read sentence, then bullets, no markdown, 1-2 sentences for simple questions) is working and shouldn't change.

**Test:** ask it 5-10 real coaching questions spanning different topics (aim, economy, utility, teamwork) before and after the change, and confirm the after-responses read more like a teammate explaining something and less like a coaching article. This is a subjective quality check — Michael should personally review the before/after transcripts, not just trust that the prompt change "should" work.

---

## Part 2 — Player-facing cards: the real fix, structural not cosmetic

This is the bigger, harder problem, and a pure find-and-replace pass on individual strings won't fully solve it — two structural issues compound the wording problem:

### 2a. Build a Valorant vocabulary bank, sourced from real terminology already validated

`docs/COACHING-LANGUAGE-RULES.md` (300 rules, written 2026-07-11) already contains extensive real Valorant vocabulary organized by category — movement/positioning, utility, economy, weapons, teamwork, communication. **Extract the vocabulary, not just the coaching content, into a structured reference** (e.g. `public/language/valorant-vocabulary.js`): terms grouped by category (positioning: peek/hold/wide-swing/jiggle-peek/off-angle/w-key; economy: eco/force/full-buy/bonus-round/save; utility: smoke/flash/molly/lineup/execute/retake; teamwork: trade/entry/anchor/lurk/stack/rotate). This becomes the shared vocabulary source both the card-copy templates and the Ask Coach prompt draw from, so the app's voice is consistent across every surface instead of each part inventing its own phrasing independently.

### 2b. Fix template rigidity, not just template wording

Read `insights.push({...})` blocks across `app.js` (roughly 15+ distinct call sites, `5445+` and `10064+` per the earlier formula review) — most are a single fixed sentence template with variables slotted in (`"${bestAgent.agent} is your strongest current comfort pick at ${winrate}% win rate."`). **Even with perfect word choice, a single fixed template read by the same player dozens of times across a season starts to feel robotic through repetition alone**, independent of vocabulary quality. Where a card type recurs often (agent strength, map weakness, weekly trend — the high-frequency cards a player sees every session), build 2-3 phrasing variants per card type that rotate or get chosen based on minor context differences (e.g., a wide margin above/below 50% winrate gets different phrasing than a close one), all drawing from the same vocabulary bank in 2a. Low-frequency cards (rare milestone moments, edge-case empty states) don't need this — one well-written version is fine when a player will rarely see it twice.

### 2c. Full audit pass — find every "Loss Streak"-tier card, not just the ones already flagged

`notes/copy-language.md`'s existing audit is real but incomplete and predates this week's Henrik/formula work — new cards shipped this week (KAST, clutch/ace, discipline flags, trade asymmetry, damage consistency, rank-benchmark) need their own copy review, not just the pre-existing string list. **Grep every `insights.push({` call site and every card-rendering template across `app.js` and `index.html`**, not just the ones already in `copy-language.md`'s list — that list was scoped to a specific pass months ago and several of the newest, most stat-dense cards (the ones most likely to slip into analytics-speak, since they're describing genuinely technical concepts like trade-window detection) haven't been reviewed at all yet.

For each card found, apply this test before rewriting: **would a Valorant player actually say this sentence to a teammate?** If a card explains a stat's definition ("this checks whether you are surviving, trading, assisting...") rather than giving a player-native read, it fails the test — `notes/copy-language.md`'s own "Current Risk" note flagged this exact pattern back on 07-06 and it's still true.

### 2d. Concrete before/after pairs to set the standard — use these as the calibration examples

| Before (robotic) | After (Valorant-native) |
|---|---|
| "You are on a 3 game loss streak" / "Performance or decisions are trending negatively" / "Take a break or reset approach" | "Three losses in a row — before queuing again, figure out if it's a specific read that's failing or if you're just not seeing angles clearly right now." |
| "This checks whether you are surviving, trading, assisting, or converting enough rounds." (KAST explainer) | "KAST — are you getting a piece of the round even when you don't get the kill: a trade, an assist, staying alive, or surviving to help next round." |
| Generic map-weakness template: "${map} is your weakest map at ${winrate}% win rate" | Keep the structure but add texture: "${map} keeps losing you rounds — worth a session just reviewing your defaults on this one before queuing it again." |

These aren't final copy — they're calibration examples for the tone/vocabulary bar. Codex should generate the real replacements per card, following this pattern, not literally ship these three lines.

---

## Priority and sequencing

1. Part 1 (Ask Coach prompt addition) is small and independent — do it first, it's a 10-minute change with an easy before/after test.
2. Part 2a (vocabulary bank) should exist before 2c (the full audit pass), since the audit needs something concrete to rewrite cards *into*, not just vague "sound more Valorant" guidance.
3. Part 2b (template variety) matters most for the highest-frequency cards a player sees every session — prioritize those over rare/edge-case cards.
4. Part 2c (full audit) is the largest piece of work here — expect it to take real time given how many card types exist across Home/Stats/Insights. Sequence it after whatever Codex is currently finishing from the prior directive, not in parallel with it.

## Testing

1. Ask Coach: manual before/after comparison on 5-10 real questions, Michael's own judgment call on whether it reads more human.
2. Cards: pull up Home/Stats/Insights with a real data-rich profile (use the same validated test account) and read every visible card start to finish — does anything still read like a stats report instead of a coach talking? Flag anything that still fails the "would a player actually say this" test from 2c.
3. Confirm the vocabulary bank (2a) is actually being imported/used by the rewritten cards and the Ask Coach prompt, not just sitting as an unused reference file — same "built but not wired" risk this project has hit before.
4. Re-run `notes/copy-language.md`'s existing approved-rows list to confirm none of those prior fixes got reverted or contradicted by this pass.
