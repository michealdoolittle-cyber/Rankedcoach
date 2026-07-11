# Daily Warm-Up Check — Research + Full Feature Directive

**Status:** Built and locally verified 2026-07-11. The once-daily Home/Logging prompt, seven-drill playlist, four-drill cap, skip path, per-profile warm-up log, isolated Henrik DM/TDM verification, and sample-gated ranked correlation insight are implemented. Production deployment is tracked by the shipping commit.

---

## Research — real, sourced methods, not invented

Done before designing anything, per Michael's request to look into proven techniques and pull from Woohoojin and Dopai specifically.

### Named warm-up methods

**Aimstars Method** (what Michael referred to as "STAR method" — the community name is Aimstars). Created by @nawyFPS, a structured routine targeting flicking, tracking, target-switching, and mouse control under pressure. Distributed as an Aim Lab workshop playlist. ([source](https://www.tiktok.com/discover/how-to-do-aimstars-method))

**Miyagi Method** (Michael's "Myogi Method" — community spelling is Miyagi, a Karate Kid reference). Popularized by YouTuber Red. Enter Deathmatch with a Guardian and Sheriff. Put your crosshair on an enemy's head and track their movement *without shooting* until you're confident you're tracking cleanly, then take the shot. Builds tracking discipline before rewarding trigger discipline — explicitly a beginner-friendly foundational method. ([source](https://www.sportskeeda.com/valorant/5-valorant-warm-up-routines-will-make-ranked-climb-easier-2022))

**Classic Range Routine**, four phases, 10-15 minutes total ([source](https://prosettings.net/blog/valorant-warmup-how-to/)):
1. Accuracy — Practice mode, headshot-only on bots, incorporating strafing, precision over speed.
2. Tracking — crosshair on a bot's head, follow it side to side without losing placement.
3. Reaction training — Training mode, easy difficulty ramping to hard.
4. Weapon-specific — spray control and time with whatever weapon(s) the player expects to lean on that session (e.g. Operator practice if they're an anchor/sniper role that day).

**Community-validated 4-stage full routine** (VLR.gg forum, real reported result: Platinum 1 → Immortal 2 across one episode) ([source](https://www.vlr.gg/295948/best-aim-routine)):
1. Aimlabs general warmup (the "Improved Demon1 routine by VT minigod" workshop playlist).
2. Range flick training — Deagle vs. bots, easy→medium→hard, slow smooth stops centered on the head.
3. Range tracking — Guardian, "eliminate 50" bot mode, strafe enabled, track before shooting.
4. Deathmatch — start with the Miyagi method on Guardian, then switch to Vandal/Phantom for controlled 3-4 bullet bursts.

**Standard DM/TDM closer**: every source checked agrees on roughly 1-2 matches of Deathmatch or Team Deathmatch as the live-fire capstone after range work — directly matches what Michael proposed independent of this research, which is a good sign the instinct was already sound.

### Woohoojin — pulled real, specific content, not just reputation

Couldn't get literal video transcripts (YouTube doesn't serve captions to a page fetch, and no transcript mirror site turned up in search) — pulled from written guides/interviews covering his actual teaching content instead, which is honest secondhand sourcing, not a substitute for watching the videos directly.

**"Gunfight hygiene"** — his most concrete, reusable concept, a real weapon×range firing-technique matrix ([source](https://www.zleague.gg/theportal/valorant-gunfight-guide-gunfight-hygiene/)):
- Rifles: spray under ~10m, burst-tap at 10m+. Vandal specifically: "always burst tap," per his teaching, even at closer range than that rule would otherwise suggest.
- SMGs/LMGs: spray dominates under 10m; SMGs favor "run and gun," LMGs favor "spam it with ADS."
- Snipers: only on mobile agents who can reposition after a shot — a positioning rule as much as an aim rule.
- Shotguns: firing mode (left-click vs. right-click/alt-fire) should switch around the 10m threshold.
- Sidearms (Sheriff/Ghost): tap-and-strafe, never sustained fire.

**The practice-to-match transfer gap** — his other major recurring theme, and arguably the more important one for this feature specifically ([source](https://www.zleague.gg/theportal/woohoojin-mastering-valorant-coaching-and-climbing-to-diamond/)): players often show good mechanics in the range or in Deathmatch but the skill doesn't show up in real competitive rounds, because range/DM lack the decision pressure of a real round. His coaching specifically targets *executing* the mechanic under real match conditions, not just possessing it in isolation. **This matters for the feature's framing**: warm-up alone doesn't guarantee it shows up in ranked play — the app's copy for this feature should say so honestly rather than implying warm-up is a complete fix.

### Dopai — confirmed real and credible, content depth more limited

Rank 1 Radiant peak, coaching content on YouTube/ProGuides/Discord, known for direct, blunt advice framing ("6 Years of Brutally Honest Valorant Advice"). Couldn't extract specific drill-level content the way Woohoojin's "gunfight hygiene" concept was findable as a named, written-up technique — his content is real and well-regarded but didn't surface a similarly quotable, specific system in the search results available. **Be honest about this gap rather than inventing content attributed to him** — if deeper Dopai-specific material matters to Michael, that likely requires someone actually watching/transcribing his videos directly, which wasn't possible here.

---

## Feature design

### The playlist — Michael's "mini playlist players choose from," concretely

Present as a **selectable set, not a fixed sequence** — a player picks the drills that fit their session, not a forced script:

1. **Aimstars flick/tracking routine** (Aim Lab, external link)
2. **Miyagi Method** (in-range/DM instructions shown in-app, since it's simple enough not to need an external tool)
3. **Range accuracy pass** (headshot-only bots, Practice mode)
4. **Range tracking pass** (crosshair-follow on a moving bot)
5. **Reaction training** (Training mode, easy→hard)
6. **Weapon-specific pass** (spray control on whatever weapon the player expects to lean on — let them type/select which)
7. **Gunfight hygiene pass** (Woohoojin's range×weapon technique — burst-tap vs. spray practice matched to weapon category)

Let players pick up to 4 per Michael's "4 small warm-ups" framing, in any combination — some days a player might want flick+tracking, other days weapon-specific+reaction training.

### Trigger mechanism

No existing "once per day" concept in the codebase — the closest pattern is `scheduleWeeklyFocusRollover()` (`app.js:149-165`, a weekly, not daily, timer-based rollover). Build fresh: store `profile.lastWarmupPromptDate` (a date string) via the existing `updateProfile()` pattern. On app load / first navigation to Home or Logging each session, compare today's date against the stored value — if different (or absent), show the Warm-Up Check modal once, then update the stored date regardless of whether the player completes, partially completes, or skips it, so it doesn't re-prompt again the same day.

### Verification — this is where it gets genuinely stronger than a plain checklist

Michael's core complaint was "no verification of this in app." Two different verification realities apply here, and the feature should be honest about which is which rather than presenting both as equally verified:

- **Range drills are inherently self-reported.** Range/Practice mode isn't a matchmade game, so it almost certainly doesn't appear in Henrik's retained match history at all (unconfirmed — Codex should verify this directly against a real account's data before assuming, but it's very unlikely Riot's match API tracks solo Range sessions as queryable matches). Treat range-drill completion as an honest checkbox, same trust model as the existing manual reflection logs elsewhere in the app — don't pretend to verify what can't be verified.
- **DM/TDM completion can be genuinely, objectively verified**, and this is the real upgrade over a plain checklist: Henrik's retained match history already includes Deathmatch/TDM matches (confirmed directly — real TDM matches were pulled for the validated test account during the original Henrik integration work). After a player marks the warm-up check "done" (or even if they don't), the app can check whether a DM/TDM-mode match appears in their synced history within some reasonable window (e.g. the same calendar day) and mark that portion as **auto-verified** rather than self-reported. This is a meaningfully better feature than a plain honor-system checklist, and it's only possible because the Henrik pipeline already exists — build it.

### Data model

Add a new per-day record (not a single field on `profile`, since this needs to be queryable per-day for the correlation formula later): something like `profile.warmupLog: [{ date, drillsSelected: [...], dmTdmSelfReported: boolean, dmTdmAutoVerified: boolean, skipped: boolean }]`. Follow the same `updateProfile()`/`saveProfiles()` persistence pattern already used for `peakRR` and other profile fields added during the Henrik work.

### The correlation formula — the actual "stat that shows correlation" Michael wants

Once enough days of data exist, build a new formula (same module pattern as `round-metrics.js`) comparing competitive-match performance (KAST, ACS, win rate — whichever the existing formula suite already computes) on days with a completed/auto-verified warm-up against days with a skipped or absent one. **Apply the exact same sample-size discipline already enforced elsewhere in the app** (`buildCoachingEvidenceLayer()`, `app.js:3283`) — this needs a real number of both warmed-up and non-warmed-up days before saying anything confident, and the existing evidence-layer governance should gate this insight exactly like every other one. Don't ship a "warming up improves your KAST by X%" claim off a five-day sample.

### Post-game aim training — separate, lighter, non-blocking

Distinct from the pre-session check: after a session (however "session end" gets defined — worth a short discussion with Michael on the exact trigger, e.g. app close, inactivity timeout, or a manual "end session" action), surface a lightweight, dismissible card recommending an external aim-trainer playlist (Aim Lab or KovaaK's) rather than gating anything. This matches the research finding that aim-trainer work is conventionally a post-session, not pre-session, activity, and it should feel like a suggestion, not a second checklist.

---

## Bonus — new sourced additions to `docs/COACHING-LANGUAGE-RULES.md`

Two genuinely new, well-sourced entries surfaced by this research that weren't in the original 300 (both distinct from what's already there, not duplicates):

- **Woohoojin's gunfight hygiene matrix** deserves its own entry in the Weapons section — the existing weapon rules cover HS% calibration and general buy/positioning patterns, but nothing currently encodes the specific "burst-tap vs. spray by range" technique matrix. Worth adding as rule 301 (or folded into the existing 101-150 range in a follow-up pass) once this feature's build makes weapon-specific coaching more prominent anyway.
- **The practice-to-match transfer gap** is a genuinely distinct coaching principle from anything in the current 300 — closest existing rules (e.g. rule 45 on scouting/adaptation) don't capture this specific idea that mechanical skill shown in isolated practice doesn't automatically transfer to live-round decision pressure. Worth its own entry, likely in Teamwork & Cohesion or a new short "Practice & Improvement" section if this becomes a recurring theme as more creator research gets folded in.

Don't force these into the existing 300 immediately — flag them for Codex to add in the next language-rules revision pass rather than making an ad-hoc edit to a doc that's meant to stay a stable, versioned reference.

---

## Testing

1. Trigger correctly fires once per calendar day, not once per app load, and doesn't re-fire after being dismissed/skipped the same day.
2. Range-drill self-report saves correctly and shows up in the new `warmupLog` structure.
3. DM/TDM auto-verification: play (or simulate via test data) a real TDM match after marking the check, confirm the app correctly flags `dmTdmAutoVerified: true` once that match syncs — this needs a live test against the validated account, not just a code read, same rigor as every other Henrik claim in this project.
4. Confirm the correlation formula stays silent/hedged until a real sample exists — don't let it fire confidently on day 3.
5. Confirm skipping the check entirely has zero negative UI consequence (no guilt-tripping copy, no blocked navigation) — this is an opt-in consistency tool, not a gate.
