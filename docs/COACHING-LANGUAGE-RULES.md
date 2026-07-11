# RankedCoach Coaching Language Rules — 300 Reference Heuristics

Compiled 2026-07-11. These are **content rules** — real Valorant coaching knowledge the app can eventually match against a player's stat patterns — not phrasing/tone guidance (that's `notes/copy-language.md`, and it still applies to however these get worded when shown to a player). Grounded in current published coaching guidance ([site-execute fundamentals](https://boosteria.org/guides/execute-sites-valorant-2026-basic-attack-setups), [utility layering](https://www.thespike.gg/valorant/news/an-in-depth-guide-on-using-utilities-perfectly-in-valorant/2393), [communication/callouts](https://gankster.gg/effective-communication-and-callouts-the-teamplay-guide-for-valorant/), [economy discipline](https://www.switchbladegaming.com/valorant/economy-cheat-sheet/), [role fundamentals](https://dotesports.com/valorant/news/all-valorant-classes-explained)) plus general Valorant knowledge, reviewed for accuracy rather than generated blind.

**Intended pipeline** (per `notes/formula-wiring-and-language-directive-2026-07-11.md`): pull lifetime stats → narrow to agent/map/weapon slices → compare to rank-relative benchmark trend → check whether an outlier matches one of these rules → correlate with the player's own manual logs before stating anything as coaching advice. A rule matching a stat pattern is a candidate insight, not an automatic one — it still passes through the existing sample-size and confidence governance before reaching a player.

Not every rule below is currently checkable against available data (some need utility-cast timestamps Henrik doesn't provide, some need positional data not yet mapped) — mark those clearly when building the matching layer rather than silently dropping them or faking a match.

---

## Section 1 — Maps (rules 1-50)

1. A player with a much higher win rate on one map than all others, but under 10 total matches on it, should be read as an early sample, not a genuine map strength.
2. Repeated first-death rate above the player's own average on a specific map suggests unfamiliarity with that map's early-round danger angles, not a general aggression problem.
3. A defender-side win rate meaningfully below attacker-side win rate on the same map often points to setup/positioning issues rather than aim issues.
4. Players who win a majority of pistol rounds on a map but lose the map overall often have a mid-round execute or retake gap, not an opening-duel gap.
5. On maps with three sites (Haven), a player's site-preference imbalance (e.g., almost never defending C) is worth surfacing as a coverage gap for the team, not just the individual.
6. On maps with long rotations (Breeze, Icebox), slow site-to-site rotation time correlates with defenders losing map control mid-round — flag rotation speed as a coaching point when defense win rate is low specifically on these maps.
7. A player who wins more rounds on attack than defense across most maps may be better suited to an entry or fragging role than an anchor role.
8. Consistent low win rate across every map (not just one) points to a fundamentals issue, not a map-specific one — don't recommend "practice this map" when the pattern is map-agnostic.
9. On compact maps (Bind, Split), a high first-blood rate combined with a high first-death rate suggests overextension rather than genuine map control.
10. Teleporter-reliant maps (Bind) reward players who understand rotation mind-games; a defender who never uses or reacts to teleporter rotations is giving up a structural map advantage.
11. On mid-control maps (Ascent, Pearl), a team's round win rate often tracks whether they win the mid duel, not the site duel — mid-control stats matter more here than on other maps.
12. A high plant rate but low post-plant round-win rate on a map suggests the team is winning the execute but losing the retake fight — a post-plant positioning issue, not an entry issue.
13. Vertical maps (Icebox, Ascent's mid) punish players who don't check elevated angles; a high death rate to unseen high-ground kills on these maps is a specific, coachable pattern.
14. A player who performs well on simple two-site maps but poorly on three-site maps (Haven) may be struggling with information overload rather than mechanics.
15. Map-specific weapon performance matters — a player's Operator win rate on long-sightline maps (Breeze, Pearl mid) is a different stat than their overall Operator win rate.
16. Fracture's dual-flank structure means a team without a dedicated flank-watcher will consistently lose to backdoor spike plants — recurring late-round losses on this map specifically may point there.
17. A team with a low utility-usage rate on maps with mandatory long rotations (Breeze) is giving up information they can't otherwise get.
18. Lotus's rotating doors change site control dynamics mid-round — players unfamiliar with door mechanics often misjudge rotation timing on this map specifically.
19. Sunset's linear layout rewards trade discipline more than most maps — a low trade-received rate here is more costly than on maps with more space to disengage.
20. A player's win rate on a map they rarely play (under 3 matches) shouldn't be surfaced as a strength or weakness at all — too small to mean anything.
21. Consistent losses on defense specifically at a single site (not the whole map) suggest a site-assignment or setup problem for that site, not the player's general defense.
22. Abyss's edge/void mechanic changes positioning risk calculus — deaths from being pushed off the map or overextending near edges are a distinct, trackable pattern on this map.
23. Corrode's layout rewards early information; a low first-20-seconds engagement rate on this map may point to slow map read, not aim.
24. A duelist with a low entry-kill rate specifically on maps with tight chokepoints (Bind's hookah, Split's mid) may need a different entry approach than open maps allow.
25. Map win-rate trends should always be checked against the player's role that match — a support player's map "weakness" often reflects team composition that game, not the player.
26. On maps recently rotated into the active pool, low sample size is expected and should suppress confident map-specific coaching for a longer window than usual.
27. A team's timeout/pause usage correlating with losses on a specific map may indicate the team recognizes a real strategic gap there worth reviewing outside the match.
28. Site-preference data should be compared against what the rest of the team is doing — an individual's site imbalance matters less if a teammate is covering the gap.
29. Repeated deaths to the same specific off-angle on a map across multiple matches is a highly specific, highly actionable coaching point — flag these by name when the pattern repeats.
30. A map with unusually short average round length for the player suggests either very fast executes/retakes or very fast round losses — check win rate before framing this as good or bad.
31. Post-plant win rate should be evaluated per-map, since site geometry (Bind's sites vs. Ascent's) changes what a good post-plant position even looks like.
32. A defender who wins duels but loses the round anyway on a specific map may be dying in ways that don't deny the plant — kill efficiency and round-relevant kills aren't the same thing.
33. Maps with active bomb-site rotations (Lotus doors, Fracture's dual entry) require faster individual decision-making — slower-paced players may show a disproportionate map-specific dip here.
34. A team with strong pistol-round map control but poor round 3-4 performance may be losing the anti-eco, a common and coachable gap.
35. Icebox's verticality around both sites means utility usage for clearing high ground matters more here than horizontal-only maps — low utility diversity is a bigger cost on this map.
36. A player's win rate swings heavily by map when their agent pool is narrow — map weakness may actually be an agent-map fit issue, not a map skill issue.
37. Consistent overtime rate on a specific map (close, competitive rounds) vs. blowout losses on another map tells different coaching stories — a close loss needs refinement, a blowout needs fundamentals.
38. A team that wins the first three rounds consistently but loses the map overall may have a strong opening read but a weak mid-game adjustment — worth flagging as a pattern distinct from opening-duel stats.
39. Split's tight verticality (ropes, mid) rewards vertical awareness; deaths from unexpected rope rotations are a specific, nameable pattern worth tracking.
40. A rank-appropriate player struggling specifically on maps requiring long-range engagements (Breeze, Pearl) may have a genuine sniper/long-range aim gap worth isolating from their overall aim stats.
41. Site-take speed (how quickly a team establishes site control after an execute starts) is a coachable pattern distinct from whether the execute eventually succeeds.
42. A team with low retake win rate concentrated on one map's specific sites likely has a post-plant positioning gap specific to that site's geometry, not a general retake problem.
43. Haven's extra site adds a genuine decision-making load on defense; a defender rotating incorrectly (wrong site) repeatedly on this map specifically is a trackable, coachable pattern.
44. A player who plays significantly more rounds on attack than defense across their history (queue variance aside) may have unbalanced practice reps, worth noting for well-roundedness.
45. Map veto/agent-select patterns (if visible) correlating with worse performance may indicate the player is being placed into an uncomfortable role by team default, not choice.
46. A high percentage of rounds lost to the same enemy default setup across multiple matches on a map suggests a scouting/adaptation gap, not raw skill.
47. Bind's absence of mid means rotations are fully committed once made — a high rate of caught-rotating deaths on this map specifically is a distinct, coachable pattern from other maps' rotation deaths.
48. Pearl's mid control is unusually central to round outcomes; mid-duel win rate on this map should be weighted more heavily than on maps where mid is optional.
49. A player improving map-specific win rate over their most recent matches (vs. their season average) is a positive trend worth surfacing even if the overall map win rate is still below average.
50. When a player has genuinely even performance across every map, don't force a map-specific insight just to fill a category — absence of an outlier is itself information, and forcing one would violate the "don't over-punish low-value stats" rule already in the codebase.

## Section 2 — Agents (rules 51-100)

51. A duelist with a low first-blood rate is underperforming their role's core responsibility, regardless of overall K/D — this is a role-specific stat, not a general one.
52. A duelist with a high first-blood rate but a low round-win-rate-when-first-blood suggests the team isn't converting the space created, a team-level coaching point that shouldn't be blamed on the duelist alone.
53. A controller with low smoke-usage-per-round relative to team need is giving up map control the team is depending on them for.
54. A controller whose smokes frequently expire before the team executes suggests a timing gap, not a placement gap — these need different coaching language.
55. An initiator with low assist rate relative to kill rate may be playing more like a duelist than their role calls for — worth flagging as a role-fit question.
56. A sentinel with a low flank-kill or flank-deny rate isn't fulfilling the anchor responsibility even if their overall stats look fine.
57. A player who mains a single agent almost exclusively should have their benchmarks compared against that agent's typical playstyle, not the role average (e.g. Reyna's expected first-blood-per-death ratio differs from Jett's).
58. Agent pool width matters for coaching context — a one-trick player's "weakness" on a rarely-played agent is not a meaningful signal.
59. A Jett player with a high first-death rate should be evaluated on whether the deaths came from aggressive space-taking (acceptable, expected) or careless dashes into unchecked angles (coachable).
60. A Reyna player with high kills but low team-relevant round wins may be playing for personal stats over team objectives — a real, nameable pattern worth surfacing carefully.
61. A Sova player with low reveal-to-kill conversion (using recon but not following up) suggests an information-sharing gap even if the player's own aim is fine.
62. A Killjoy or Cypher player with low utility-replant/reposition rate between rounds may be leaving predictable setups the enemy can scout and counter.
63. An Omen or Viper player whose smoke placement doesn't match the team's actual execute site suggests a coordination gap, not an individual skill gap.
64. A Sage player with a low resurrection-usage rate in winnable rounds is leaving value on the table — but this should only be flagged when the pattern is clearly repeated, not a one-off tactical choice.
65. A Chamber or Kayo player whose kill rate is high but survivability is low may be misusing self-sufficiency tools meant to enable safer aggression.
66. A player switching agents frequently match-to-match (no consistent 2-3 agent pool) often shows more inconsistent performance than one with a stable pool — worth surfacing as a consistency-building suggestion.
67. Duelists on defense (off-role for most duelists) should be benchmarked differently than duelists on attack — the role expectation flips.
68. A controller who never plays post-plant lurk/flank-watch roles may be under-using their kit's late-round utility for information denial.
69. An initiator whose flashes/recon consistently come after the duelist already engaged, rather than before, indicates a timing/readiness gap worth naming specifically.
70. Agent-specific ultimate usage efficiency (kills or value generated per ultimate) is a distinct, trackable stat separate from overall performance.
71. A sentinel who dies to entries at their own site significantly more than the map/role average may be over-peeking instead of holding the anchor position their role calls for.
72. Fade, Skye, or Breach players (initiator flashes/recon) whose flash-assist rate is low relative to flash-usage rate may be flashing at the wrong angle or timing, not under-using utility.
73. A duelist who plays passively (low first-engagement rate) more than their role average may be more suited to a different role given their actual in-game behavior.
74. Cross-referencing agent choice against map (e.g., playing a close-range duelist on a long-sightline map) can explain a performance dip better than blaming mechanics.
75. A player whose performance is meaningfully better on flex/support agents than duelists, despite queueing duelist, may be misallocated for their actual strengths.
76. Neon's mobility-heavy kit changes what "good" headshot percentage looks like (already handled in-app) — the same logic should extend to other mobility-heavy agents as they're added.
77. A controller whose team's round win rate is much higher when they play a specific agent (vs. their other controller picks) suggests a genuine agent-fit signal worth surfacing.
78. Astra or other setup-phase agents (site selection before round start) whose setup doesn't match the eventual play suggests a planning gap distinct from execution.
79. A player's ultimate-point-to-usage lag (banking ults without using them) may indicate hesitancy that's worth coaching separately from mechanical skill.
80. Agents with self-revealing abilities (certain flashes, dashes) that get the player killed disproportionately more than the ability's value generated suggest overuse in bad situations.
81. A sentinel's trap/utility placement consistency (same spots every round) becomes exploitable — repeated identical setups across many rounds is a coachable pattern once enough matches exist to show it.
82. Deep-dive agent stats should always be contextualized against how many total rounds were played on that agent — 20 rounds on a rarely-played pick shouldn't generate the same confidence as 200 rounds on a main.
83. A duelist whose kills mostly come late in rounds (post-trade, cleanup) rather than in entries suggests they're playing a support role in duelist's clothing — worth naming as a role mismatch, not a weakness.
84. Viper players whose wall/orb placement doesn't isolate a specific chokepoint may be under-utilizing the agent's defining strength (area denial) versus just using it as a generic smoke.
85. A player who performs notably better in one role than others, across a wide enough sample, is a strong candidate for a "play this role more" recommendation — one of the more confidently statable insights available.
86. Yoru or other deception-kit agents whose decoy/clone usage doesn't correlate with any subsequent map-control gain suggests the utility is being used cosmetically, not tactically.
87. A player's KAST should be compared to their agent's typical role expectation — a sentinel's "good" KAST baseline differs from a duelist's given the different play patterns.
88. Agent win rate should be checked against whether the agent was picked into a bad map/comp fit (e.g., a close-range duelist on an open map) before attributing the result to skill.
89. A controller with high individual kill counts but low team-round-win correlation may be playing more aggressively than their role calls for, at the cost of the utility their team needs.
90. Harbor, Viper, or other zone-control agents whose ultimate usage doesn't correlate with a site take/retake nearby suggests mistimed ultimate deployment.
91. A player who consistently first-picks the same agent regardless of map or comp need may benefit from a coaching nudge toward flexibility, especially at higher ranks where comp balance matters more.
92. Initiators with high flash self-blind rate (flashing themselves or teammates) is a specific, correctable mechanical pattern distinct from general utility usage.
93. A sentinel whose deaths cluster at round start (early aggression) rather than round end (anchor holds broken) suggests role confusion — sentinels are expected to survive longer into the round on average.
94. Cypher or Killjoy players who don't recon lurk with cameras/turrets before committing utility may be giving up the information-gathering value the agent is picked for.
95. A player's win rate on their "comfort pick" should still be checked against rank-relative benchmarks — comfort doesn't automatically mean above-average performance.
96. Gekko or similarly newer initiator kits with reusable utility (if not on cooldown) whose low re-usage rate within a round suggests the player isn't tracking their own resource availability.
97. A duelist who trades well when dying (high trade-received rate) even with a high death rate overall may be playing the role correctly — dying to create space that gets converted is expected duelist behavior, not automatically a weakness.
98. Deadlock, Vyse, or other newer sentinel kits with area-denial tools whose zone placement doesn't cover the actual site chokepoint suggests a map-reading gap distinct from general utility skill.
99. A player's performance delta between their "assigned" role (per team comp) and their "played" role (per actual behavior) is itself a useful coaching signal about role clarity within the team.
100. Agent-specific coaching should always defer to the weapon/mechanics-context adjustment already in the app (down-weighting HS% for sniper/shotgun-heavy agents) rather than treating agent and weapon coaching as separate, potentially contradictory systems.

## Section 3 — Weapons (rules 101-150)

101. Headshot percentage benchmarks must be weapon-context-adjusted (already implemented) — never coach HS% as a flat universal number.
102. A player with high kills but low ADR may be relying on multi-kill lucky rounds rather than consistent output — check damage-per-round trend alongside kill count.
103. Rifle players (Vandal/Phantom) with HS% notably below the rank-relative rifle benchmark likely have a spray-control or crosshair-placement gap worth naming specifically.
104. SMG usage (Spectre, Stinger) concentrated in eco/light-buy rounds is expected and correct — SMG performance shouldn't be benchmarked against rifle HS% norms.
105. A player who buys Operator frequently but has a low Operator-round win rate may be over-investing economy into a weapon that isn't converting, worth a economy-efficiency flag.
106. Shotgun (Judge/Bucky) usage correlating with high first-blood rate but also high first-death rate on the same rounds suggests aggressive but risky close-range engagement — a distinct pattern from rifle aggression.
107. Sidearm (pistol round) performance should be benchmarked separately from full-buy performance — pistol rounds have fundamentally different engagement ranges and economy stakes.
108. A player whose kill weapon distribution is heavily rifle-only, even in situations calling for a sniper (long sightlines) or SMG (fast rotations), may be under-utilizing weapon variety for the situation.
109. Marshal/Outlaw (budget sniper) usage as a substitute for Operator in lighter economy rounds is a legitimate economy-discipline signal, not a downgrade to flag negatively.
110. A player's damage-per-round should be tracked separately by weapon category, since a rifle ADR baseline and a sniper ADR baseline mean different things (snipers deal high damage per hit, fewer hits).
111. Ares/Odin (heavy weapons) usage is situational (holding a chokepoint, suppressing an angle) — low usage rate isn't inherently a gap unless the player's role/situation regularly calls for it.
112. A consistent pattern of buying rifles but getting out-gunned by SMGs at close range suggests a positioning gap (fighting SMG players at their preferred range) more than a weapon choice gap.
113. Classic/Ghost (starting/light pistols) accuracy in pistol rounds is a meaningfully different mechanical skill (higher recoil unpredictability) than rifle spray control — benchmark separately.
114. A sniper player (Operator-heavy) with low first-shot-hit rate (multiple shots per kill) suggests a flick/pre-aim gap distinct from spray-control coaching.
115. Weapon choice inconsistency round-to-round (not tied to economy) may indicate indecision under pressure rather than a genuine tactical read — worth flagging gently.
116. A player whose ADR is high but whose team round-win-rate is low may be dealing damage in already-lost rounds (garbage-time damage) rather than round-relevant damage — a distinct, coachable framing difference.
117. Bulldog/Guardian (burst/marksman rifles) require different spray discipline than Vandal/Phantom — misapplying full-auto spray habits to these weapons is a specific, nameable mechanical issue.
118. Weapon economy efficiency (value generated per credit spent) is a distinct metric from raw kill count and worth its own trend line separate from K/D.
119. A player who frequently force-buys Operator in rounds their team can't support (no accompanying full buy) is creating an economy risk worth flagging as a team-economy coaching point.
120. Spray pattern control should be evaluated over sustained engagements (3+ bullet fights), not single-bullet picks, since these test different skills.
121. A high percentage of deaths to the same enemy weapon category (e.g., repeatedly dying to Operators) may indicate a positioning gap (over-exposing on long sightlines) rather than a weapon-matchup problem.
122. Weapon-specific performance trending upward over recent matches, even from a low baseline, is worth surfacing as positive progress distinct from the season-long average.
123. A player's HS% on flicks (fast target acquisition) vs. holds (pre-aimed angles) are different skills — where data allows this distinction, they shouldn't be averaged into one number.
124. Buying armor consistently (even light shields) correlates strongly with survival rate — a pattern of unarmored full-buys is a specific, correctable economy-discipline gap.
125. A player whose weapon kill distribution skews heavily toward whatever weapon is currently strong in the meta, rather than situational fit, may be following trends over sound decision-making.
126. Frenzy/Shorty (specialty sidearms) are close-range-only tools; a low win rate with these in long-sightline engagements reflects weapon misuse, not weapon weakness.
127. A rifle player who never buys a secondary utility purchase alongside their gun buy (shields, abilities) may be under-investing in survivability relative to firepower.
128. Weapon accuracy should be contextualized by engagement distance where trackable — close-range accuracy and long-range accuracy are different skills even with the same weapon.
129. A pattern of winning eco-round weapon duels (pistol/SMG vs. enemy rifle) is a strong positive signal worth highlighting — it indicates aim quality independent of gear advantage.
130. Odin/Ares suppression usage (holding a trigger to deny an angle without necessarily getting a kill) has value not captured by kill stats alone — avoid coaching against "low kill" heavy-weapon usage without checking the situational context.
131. A sniper player whose deaths cluster from being pushed while scoped in suggests a lack of off-angle awareness or missing a repositioning teammate/utility support.
132. Weapon choice under pressure (last-round, match-point situations) sometimes regresses to comfort picks over optimal picks — a subtle, situational pattern worth noting if it recurs.
133. A player whose bodyshot-to-headshot ratio is unusually high (landing hits but not headshots) even for their weapon/rank baseline may have a crosshair-height issue rather than a tracking issue.
134. Buying a full loadout but skipping a sidearm upgrade (keeping the default Classic) leaves a player weaker in the specific scenario of running out of primary ammo mid-fight — a rare but real, specific coaching point.
135. A player's win rate when out-gunned economically (light buy vs. enemy full buy) is one of the purest aim-skill signals available, since it isolates mechanics from equipment advantage.
136. Weapon-specific coaching should never contradict the agent-context adjustment already in place — if an agent's kit naturally leads to close-range engagements, don't coach the player toward long-range weapon habits that fight their own kit.
137. A high rate of "spray down" deaths (dying while holding the trigger without adjusting for recoil) versus "tap/burst" deaths indicates different corrective coaching — one is spray control, one is discipline about when to spray at all.
138. Weapon pickup behavior (grabbing a dropped rifle after an eco kill) correlating with round wins is worth surfacing as good economic instinct when it's a repeated pattern.
139. A player whose Operator usage is high specifically as an anchor/hold weapon (not pushed aggressively) should be benchmarked against defensive-sniper norms, not aggressive-sniper norms.
140. Ammo management (reloading at safe moments vs. getting caught empty) is a trackable-in-principle pattern that becomes coachable once round-level event data supports it.
141. A player's best-performing weapon by win rate isn't necessarily their best-performing weapon by K/D — both numbers matter and can tell different stories about the same weapon choice.
142. Weapon variety across a match (not committing to one gun regardless of round context) generally correlates with better economy discipline and situational awareness.
143. A pattern of dying to the same weapon type at the same map location repeatedly is specific enough to name directly (e.g., "Operator angle from X") rather than generalizing to "improve awareness."
144. Bucky/Judge alt-fire (aimed shot) usage vs. primary-fire (spread shot) usage represents different playstyles within the same weapon — worth distinguishing if the data supports it.
145. A player who under-buys relative to their team's economy (saving when the team is forcing, or vice versa) creates a coordination gap distinct from their individual weapon performance.
146. Weapon-based first-blood rate (which gun most often gets the round's opening kill for this player) can reveal whether a player's aggression is backed by appropriate equipment or is a gear mismatch.
147. A consistent pattern of losing close-range duels with a rifle against enemy SMGs/shotguns suggests either poor positioning (fighting at their preferred range) or a genuine close-range aim gap — worth distinguishing via death-location context if available.
148. Weapon skin or cosmetic factors should never enter coaching logic — only mechanical/economic weapon category matters for these rules.
149. A player's damage output per weapon should be checked against whether they're facing armored or unarmored opponents where determinable, since armor state changes required shots-to-kill.
150. When weapon-specific sample size is too small (a handful of rounds with a rarely-bought gun), suppress weapon-specific coaching in favor of the broader category (e.g., "rifles" instead of "Phantom specifically").

## Section 4 — Utility (rules 151-200)

151. Utility timing matters as much as utility placement — a smoke that lands correctly but fades before the team executes provides little value, per established coaching guidance.
152. Utility layering (smoke, then flash, then molly, then entry) is the standard structure for a successful execute — a team whose utility usage doesn't follow any sequence pattern likely lacks a coordinated execute plan.
153. Flashing before the entry player is ready to push gives the defense time to recover — flash-to-entry timing gap is a specific, coachable pattern distinct from flash accuracy.
154. A player who uses utility reactively (after taking damage or spotting an enemy) rather than proactively (as part of a planned execute) may be under-leveraging their kit's strategic value.
155. Molly/incendiary usage that doesn't correlate with a subsequent site take or kill suggests the utility is being used for area denial without follow-through, which has some value but less than a converted execute.
156. Recon utility (Sova drone, Skye scout) usage that isn't followed by team repositioning based on the information suggests an info-sharing or team-response gap, not a scouting gap.
157. A team with high aggregate utility usage per round but a low round win rate may have a coordination problem — usage volume alone isn't the same as usage effectiveness.
158. Saving utility into overtime/late rounds when the team desperately needs map control earlier suggests a hoarding pattern worth gently flagging.
159. Self-flashing or flashing teammates is a directly correctable mechanical issue distinct from flash timing or flash strategy.
160. A controller's smoke count remaining late in a half (unused) correlates with lower win rate on maps requiring multiple smokes per execute — utility hoarding has a measurable cost.
161. Utility used purely defensively (holding an angle) versus offensively (enabling a push) represents different tactical philosophies — coaching should identify which the situation called for, not assume offensive usage is always correct.
162. A player whose utility is consistently thrown from the same position every round becomes predictable to opponents reviewing patterns — recommend varying setup positions once enough repeated matches show the pattern.
163. Ultimate-ability timing (using a round-winning ultimate too early or holding it too long) is a distinct coaching category from regular utility timing, given the higher stakes per use.
164. A team's post-plant utility usage (mollies/walls covering the spike) correlating with higher retake-defense win rate is a strong, checkable pattern once round-level post-plant data is available.
165. Utility economy (buying abilities vs. saving credits for weapons) requires its own discipline separate from weapon economy — a full-kit buy without weapon upgrade is sometimes correct, sometimes a misallocation.
166. A high rate of utility used in the first 10 seconds of a round (before any information is available) suggests pre-planned setups that may not adapt to what the round actually calls for.
167. Recon utility followed immediately by the recon-user pushing into the revealed area (rather than a teammate) undermines the informational advantage the utility was meant to create for the team.
168. A team whose utility usage clusters entirely on one site regardless of the actual round's target suggests a scripted rather than adaptive playstyle.
169. Flash-assist rate (kills that happen while an enemy is flashed) is one of the more directly checkable utility-effectiveness metrics once flash and kill timestamps are both available.
170. A sentinel's trap/utility that goes untriggered for an entire half may be poorly placed relative to actual enemy pathing, not simply unlucky.
171. Utility used to deny a single specific chokepoint (rather than general area coverage) is generally more efficient and worth recommending in tight-map contexts.
172. A team that consistently loses rounds immediately after using all their utility (no fallback plan) may be over-committing to the initial read without an adaptation plan.
173. Molly usage timed to punish a common enemy default position (rather than a random guess) reflects map/opponent reading worth positively reinforcing when it recurs.
174. A duelist entering a smoke before it's fully deployed (walking through the animation) suggests impatience that costs the intended vision-denial value.
175. Utility saved specifically for retakes (not used in the initial defensive setup) is a deliberate, coachable strategic choice worth distinguishing from simple non-usage.
176. A team's flash usage rate during retakes correlating with retake win rate is a strong, checkable pattern for teams with initiators in their comp.
177. Using area-denial utility (Viper wall, Sage wall) to block a single chokepoint during a retake is a distinct skill from using it during an initial execute — both should be tracked separately.
178. A player who never varies their ultimate-point spending pattern (always using it in the same round type) may be missing higher-value windows to save or deploy it.
179. Utility used to clear common off-angles before a team commits to a push reduces flank/pick risk — a team with a habit of pushing without clearing is exhibiting a specific, nameable pattern.
180. A high rate of "wasted" utility (thrown but no enemy in the affected area, no information gained, no space taken) suggests either poor map reading or panic usage under pressure.
181. Coordinated multi-person utility usage (two flashes on the same push, timed together) is measurably different from simultaneous-but-uncoordinated usage, even if the raw usage counts look similar.
182. A team whose utility usage drops significantly in overtime rounds (compared to regulation) may be playing more conservatively than the higher-stakes situation calls for.
183. Recon utility usage before rotating (checking a path is clear before committing to it) is a lower-risk, information-gathering pattern worth positively distinguishing from recon used purely offensively.
184. A player's utility usage should be benchmarked against their specific agent's kit cooldowns and charges, not a flat "uses per round" number that doesn't account for kit differences.
185. Molly/wall usage to cut off a rotation path during a round (not just at round start) is an advanced, situational skill worth recognizing distinctly from standard setup usage.
186. A team with high individual utility effectiveness but low team-execute success may have a coordination gap where good tools aren't being used toward a shared plan.
187. Utility used purely for "stats" (getting a flash-assist credit) rather than genuine tactical value is hard to detect directly but may show up as flashes with no subsequent team push.
188. A controller whose smoke coverage doesn't fully block the intended sightline (partial smokes) undermines the intended vision denial — placement precision matters as much as usage timing.
189. Ultimate orbs/points denied to the enemy team (through map control or kills) is a team-level utility-economy concept worth surfacing when a team consistently plays into fast enemy ultimates.
190. A player's flash usage against an already-flashed enemy (redundant utility) suggests either poor situational awareness or panic usage.
191. Utility used to bait a specific enemy response (drawing rotation with a fake execute) is advanced-level play, worth positively flagging when a team demonstrates the pattern successfully.
192. A team's aggregate utility usage per round trending downward over a match (running low on abilities without full buys to replenish) should be contextualized against their economy state before flagging as a discipline issue.
193. Recon-first play (revealing before entering) versus entry-first play (entering before information) represents a real strategic choice with different risk profiles — coaching should identify which the team defaulted to and whether it matched the situation.
194. A duelist who dashes/flashes into a smoke rather than through a cleared angle may be trading information for aggression in a way that's sometimes correct, sometimes reckless — situational context matters.
195. Utility replenishment discipline (buying back abilities every round they're affordable) correlates with sustained team utility pressure across a half.
196. A team whose retakes fail specifically when the defender used their utility pre-plant (nothing left for the retake) suggests a resource-allocation gap between the initial hold and the retake phase.
197. Coordinated ultimate usage (two or more round-winning ultimates used in the same round) is a high-value, low-frequency pattern worth recognizing when it appears rather than treating ultimates purely individually.
198. A player's utility usage in rounds they end up losing anyway (utility "wasted" in a loss) shouldn't automatically be coached as ineffective — sometimes correct usage still loses to a better read from the opponent.
199. Utility economy across a half (not just a single round) reveals whether a team is pacing their resource usage sustainably or front-loading it into early rounds and running dry later.
200. When utility-timing data genuinely isn't available (a known current limitation), the coaching language should say so plainly rather than presenting a guess as measured fact — accuracy about what is and isn't known matters as much as the coaching content itself.

## Section 5 — Teamwork & Cohesion (rules 201-250)

201. Trade efficiency (how often a teammate's death is immediately avenged) is one of the strongest team-cohesion signals available and should be weighted heavily in team-level coaching.
202. A team with strong individual stats but poor trade efficiency is likely playing as five individuals rather than a coordinated unit.
203. Role coverage gaps (no controller, no sentinel) in a comp should be flagged as a structural team issue before any individual performance coaching happens for that match.
204. A duelist entering without a support flash/smoke behind them is taking on more risk than the role is designed for — this is a team-coordination gap, not purely an individual duelist decision.
205. Spacing discipline (not stacking too many players in one area, not overextending alone) is a trackable pattern through death-location clustering once positional data supports it.
206. A team that wins pistol rounds consistently but loses bonus rounds (round 2) may have an anti-eco coordination gap — a specific, well-known coachable pattern.
207. Teams with a wide skill gap between their best and worst performer often lose not because of the weak link alone, but because the team doesn't adjust strategy to protect that player's weaker rounds.
208. A team's win rate when playing as a pre-made group versus solo-queued into a random team is a meaningful distinction — coaching confidence should scale with how much of the sample was actually a coordinated team.
209. Retake structure (who enters first, who covers flanks, who watches the plant timer) benefits from a repeatable pattern — teams without one tend to retake inconsistently even with good individual aim.
210. A support-role player whose deaths cluster while trying to save a teammate (rather than trading or holding position) reflects a cohesion-driven risk, which should be coached differently than a purely selfish death.
211. Team economy coordination (everyone forcing together or everyone saving together, not split decisions) strongly predicts round outcomes in force-buy situations.
212. A team that communicates a plan but then doesn't execute it (visible in round-result patterns after callouts, where trackable) has an execution gap distinct from a planning gap.
213. Player roles should be evaluated for fit within the specific team's composition, not in isolation — a duelist's "low" first-blood rate may be appropriate if a teammate is intentionally taking that responsibility instead.
214. A team with high individual KAST across the board but low round win rate likely has a structural/strategic gap rather than an execution gap — everyone's involved, but not toward a winning plan.
215. Consistent lineup changes (different five players match to match) reduce the value of team-cohesion coaching, since patterns need repetition with the same group to mean anything.
216. A team's win rate in must-win rounds (facing elimination, or in a close map) versus low-stakes rounds reveals composure under pressure as a distinct skill from raw mechanical performance.
217. Flank-watch responsibility, when clearly unassigned (no one covering it, discovered via repeated backdoor deaths), is a structural team gap worth naming directly rather than blaming whichever individual got caught.
218. A team whose best player is put in a support role by comp necessity may be under-utilizing their strongest asset — worth a comp-rebalancing suggestion if the pattern is consistent and costly.
219. Trade-given rate (how often a player specifically avenges a teammate) should be evaluated relative to their role — anchors and support agents are expected to trade more often than isolated duelists.
220. A team's timeout usage (if visible/trackable) correlating with recovering from a losing position is a positive coordination signal worth recognizing.
221. Split-second decision alignment (multiple players rotating to the same read simultaneously without discussion) is a marker of genuine team cohesion built over repeated play, distinct from comms-driven coordination.
222. A team that consistently over-commits to retaking a lost site (throwing utility and lives into an unwinnable retake) may benefit from clearer criteria for when to concede a round instead.
223. Individual accountability language should be used carefully — a coaching insight framed around "the team" rather than singling out one player is usually more accurate anyway, since round losses are rarely one person's fault alone.
224. A team's win rate when down players (after an early death) versus full-strength reveals their 4v5/3v5 discipline, a distinct and important coachable skill at every rank.
225. Comp balance (avoiding double-duelist without adequate support, or all-defensive comps with no space-creation) should be checked against actual round outcomes before assuming a "meta" comp is automatically correct for this specific team.
226. A team whose players die in isolated 1v1s repeatedly (rather than grouped 2v1s the team wins) reflects a spacing/support gap distinct from individual aim.
227. Shared vision/information (calling out what you see even without being asked) correlates with better team decision-making — measurable indirectly through trade speed and rotation accuracy.
228. A team's success rate on "default" setups (no read, standard positioning) versus "adjusted" setups (reacting to scouted information) shows whether their information-to-action pipeline is actually working.
229. New player integration (a five-stack adding one new member) typically shows a temporary dip in trade efficiency and coordination — worth contextualizing rather than treating as a skill regression.
230. A team's late-round decision-making (whether to save, force, or commit fully) should be evaluated as a repeated pattern across many rounds, not judged off any single close call.
231. Player-to-player synergy (certain pairs performing better together than either does with other teammates) is a real, trackable pattern once enough shared-match data exists.
232. A team with strong individual highlight-reel plays but a losing record often has a fundamentals gap in the boring, repeatable plays (trades, rotations, economy) rather than a talent gap.
233. Clear pre-round role confirmation (who's entering, who's holding, who's flanking) reduces the "everyone did something different" failure mode common at lower coordination levels.
234. A team's willingness to give up a round early when it's clearly lost (versus fighting to the last player for no strategic gain) reflects economy discipline that pays off in future rounds.
235. Duo-lane coordination (two players moving and trading together through a chokepoint) is measurably more effective than solo pushes when trackable through death-timing clusters.
236. A support player's positioning relative to their duelist (close enough to trade, not so close as to die to the same utility) is a specific, coachable spacing skill.
237. Team performance dips specifically after a player disconnects/reconnects (if visible) shouldn't be scored against the team's coordination stats for that stretch.
238. A team that adapts their site preference based on the opponent's tendencies (not just their own default) shows a level of strategic flexibility worth positively reinforcing.
239. Overextending to secure a kill that isn't round-relevant (the round is already lost or already won) is a specific, low-cost-to-fix pattern once the app can distinguish round-relevant kills from garbage-time ones.
240. A team whose players consistently peek the same angle one at a time (rather than together) into a held position is giving the enemy easy, repeatable picks — a structural, nameable issue.
241. Consistency in the starting five (versus frequent rotation of the fifth player) should be factored into how confidently the app frames team-cohesion insights.
242. A team's post-plant spread (covering multiple defuse approaches vs. everyone stacking one angle) is a specific, positionally trackable pattern once round data supports it.
243. Recognizing when a teammate is on a "hot streak" (multiple kills, high confidence) and feeding them the next engagement is an advanced team-read worth positively flagging when it's a repeated pattern.
244. A team with high individual mechanical skill but a losing record against lower-mechanical-skill opponents often has a strategic or coordination deficit that skill alone doesn't cover — an important, sometimes uncomfortable insight to phrase carefully.
245. Rotation discipline (not rotating on a single, unconfirmed sound cue) prevents the costly "3 people move on 1 cue" mistake flagged in established coaching guidance.
246. A team's willingness to trade map control for information (giving up space to see where the enemy is) versus holding ground rigidly reflects two valid but different strategic philosophies — coaching should identify which one the team is actually using, intentionally or not.
247. Shared blame language should be avoided in favor of specific, nameable patterns — "the team's retake structure" is more useful and less deflating than "the team played badly."
248. A team whose win rate improves measurably over a season (holding rank roughly constant) reflects genuine cohesion growth worth calling out explicitly as a positive trend.
249. Player-reported comms quality (from manual logs) correlating with objective trade-efficiency stats is one of the clearest places where qualitative and quantitative data should be cross-referenced directly.
250. Team cohesion coaching should always be the lowest-confidence category relative to individual stats, since so much of it depends on teammates the player doesn't control — hedge accordingly and focus recommendations on what the player themselves can influence.

## Section 6 — Communication (rules 251-300)

251. The three highest-impact callout types are enemy position (location + count), utility usage ("flash from A Main"), and spike status ("spike B, 45 seconds") — per established coaching guidance, these should be the first things checked when evaluating comms quality.
252. Concise callouts ("two pushing B long") are measurably more useful than vague ones ("I think someone might be going B") — callout specificity is a distinct, coachable skill from callout frequency.
253. A player who reports low comms-enabled rate in manual logs correlating with worse team-trade-efficiency stats is a direct, checkable link between self-reported behavior and objective outcomes.
254. Over-communication (constant chatter that buries important callouts) can be as harmful as under-communication — the goal is signal clarity, not volume.
255. The most common expensive communication mistake is a team moving three players based on one unconfirmed sound cue — flag this pattern specifically when death-clustering suggests it happened.
256. Clarity should be prioritized over speed — a slightly delayed, precise callout is more valuable than a fast, garbled one, per established coaching guidance.
257. Numeric callouts ("two mid," not "they're mid") convey count information that changes tactical decisions — their absence is a specific, correctable communication gap.
258. A player whose manual logs consistently report "tilted" or "annoyed" mood correlating with worse in-game stats for that session is a directly correlatable qualitative-to-quantitative pattern worth surfacing.
259. Silence after early-round deaths (a common pattern — comms drop off once a player is eliminated) denies the team ongoing information from someone who may still be spectating useful angles.
260. Positive, specific reinforcement ("nice trade," "good hold") measurably sustains team morale better than criticism-only comms — worth encouraging as a habit, not just tactical calling.
261. A player who calls their own utility usage before throwing it ("smoking A now") helps teammates time their own plays — absence of this habit is a specific, nameable gap.
262. Comms quality should be evaluated separately from comms quantity — a quiet player who says the right thing at the right moment can have better comms than a constant talker.
263. Reporting a death's cause and location ("died to Jett on Heaven") gives the team actionable information even after that player is eliminated — a specific habit worth coaching directly.
264. A pattern of miscalled enemy counts (saying "one" when it was actually a duo) suggests either information gaps or communication carelessness — worth distinguishing which via correlated in-game outcomes.
265. Team comms should include economy calls ("I'm forcing," "I'm saving") since silent economy mismatches directly cause round losses through uncoordinated buys.
266. A player's self-reported comms-disabled sessions correlating with lower KAST is a specific, checkable pattern worth surfacing as a direct behavioral recommendation.
267. Calling rotations before making them ("rotating to B") lets teammates adjust their own positioning — absence of this is a coordination gap distinct from the rotation decision itself.
268. Defensive-round setup calls ("I've got Heaven," "watching flank") establish clear role coverage at round start — teams without this habit show more overlapping-coverage and gap patterns.
269. A player who only communicates negatively (criticism, frustration) even when accurate may be degrading team performance through morale effects that aren't visible in pure stat correlation but matter for coaching framing.
270. Post-round debrief comms ("we lost because of X") when accurate and blame-free correlate with faster team adaptation round-to-round — worth encouraging as a habit distinct from in-round calling.
271. A player whose manual log "why" notes frequently mention communication breakdowns is providing direct qualitative evidence that should be weighted heavily even without a matching statistical signature.
272. Calling out low-HP kills you didn't finish ("low HP, someone finish") helps teammates prioritize targets — a specific, tactical communication habit.
273. Voice comms usage rate (if trackable) correlating with better performance is one of the more robust, well-established patterns in competitive team games generally, not unique to Valorant.
274. A team's callout consistency (same terminology for the same locations every time) reduces confusion under pressure — inconsistent terminology within a team is a specific, correctable issue.
275. Reporting spike plant/defuse timers accurately and continuously (not just once) keeps the whole team's decision-making synced to the actual round clock.
276. A player who asks clarifying questions when a callout is ambiguous, rather than guessing, tends to make fewer costly rotation mistakes — a habit worth positively reinforcing.
277. Comms breakdown specifically in high-pressure rounds (match point, close overtime) versus normal rounds suggests a composure-under-pressure gap distinct from general communication skill.
278. A player's tendency to communicate more when winning and go quiet when losing is a common, human, but coachable pattern — comeback rounds specifically benefit from sustained comms.
279. Calling enemy utility usage ("they used their smoke already") gives the team tactical information about remaining enemy resources, a specific and often under-used callout category.
280. A player who consistently mutes or ignores teammate calls (self-reported or inferable from uncorrelated decision-making) may be missing genuinely useful information regardless of their own skill level.
281. Team callout response time (how quickly players react to a call) is a distinct skill from the quality of the call itself — both matter and can be coached separately.
282. A player's manual-log "comms quality" self-rating trending downward across a season, independent of win rate, is worth surfacing as its own signal — team dynamics can decay even when results haven't yet.
283. Calling your own status honestly (low HP, low utility, low ammo) rather than overstating your ability to help enables better teammate decisions than silence or false confidence.
284. A pattern of one player doing all the calling while the rest of the team stays silent creates a single point of failure — team comms distribution (not just volume) is a coachable structural pattern.
285. Positive comms specifically after a teammate's mistake (rather than blame) correlates with that player performing better in subsequent rounds — a well-established general team-sports pattern applicable here.
286. A team's use of quick, pre-agreed callout shorthand (rather than full sentences) under time pressure reflects practiced communication worth recognizing as a strength when present.
287. Reporting enemy agent compositions and abilities used (not just positions) helps the team anticipate upcoming utility and ultimates — a more advanced communication habit worth coaching at higher skill levels.
288. A player whose manual logs mention specific communication incidents ("teammate went silent after dying") provides direct qualitative context for a match's statistical anomalies.
289. Comms that include a clear "why" behind a call ("push now, they're low on utility") rather than just an instruction tend to produce better team buy-in and follow-through.
290. A player's comms style should be evaluated for their specific team context — a quiet, high-clarity caller in a coordinated team may be communicating perfectly well despite low raw comms volume.
291. Reporting successful bait/deception plays after the fact ("that was a fake, they bought it") helps the team learn what's working against this specific opponent.
292. A team's silence during clearly winnable retake situations, correlating with lost retakes, suggests a coordination-through-comms gap specifically in high-value moments.
293. Calling "hold" or "wait" explicitly, rather than assuming shared timing, reduces uncoordinated pushes — a simple, specific, highly correctable communication habit.
294. A player's frustration expressed through comms (not muting, but venting) correlating with worse subsequent-round performance for themselves specifically is a self-directed tilt pattern worth naming gently.
295. Communication about map control ("we have mid," "lost control of A main") keeps the whole team's mental model of the round state synced, beyond just enemy positions.
296. A team that calls out successful reads after the round ("good read on the rotate") reinforces the decision-making pattern that worked, making it more likely to repeat.
297. Comms drop-off correlating specifically with playing from behind (losing the map) rather than ahead suggests morale-driven silence, a distinct pattern from simple habit or personality.
298. A player who communicates plans before executing them, even simple ones ("going long"), gives teammates a chance to support or redirect before commitment rather than after.
299. Self-reported comms data should always be correlated against the actual team's trade efficiency and round win rate before being treated as validated — a player's own sense of "good comms" doesn't always match the measurable team outcome.
300. When comms data can't be directly measured (voice chat content isn't something the app can read), rely on the manual log's self-reported comms-enabled/quality fields as the best available proxy, and say so honestly rather than implying the app has visibility it doesn't have.

---

## Notes for implementation

- These are reference heuristics, not automatically-triggered insights. Every match against a player's stats still needs to pass through the existing sample-size and coaching-language governance (`app.js:3283`, `app.js:3373`) before reaching a player.
- Several rules (utility timing, exact positional death-clustering, voice-comms content) reference data the app doesn't currently have — mark these clearly as aspirational/future when building the matching layer, don't fake a match against unavailable data.
- Rules should be revisited and expanded as the game's meta evolves — this list reflects mid-2026 Valorant coaching consensus, not a permanent, unchanging reference.

### Current app coverage (2026-07-11)

The first structured slice lives in `public/analytics/coaching-rules.js`: 30 source-linked entries, five per category, with 20 executable matchers. Rules that require cast timestamps, positional events, or voice-chat content are marked `blocked` or `policy`; they cannot emit an insight. Executable candidates still pass through `buildCoachingEvidenceLayer()`, sample minimums, priority/deduplication, and `polishCoachingInsight()` before display. `testing/henrik/coaching-rules.test.js` verifies every structured entry still points to a numbered rule in this document so the machine-readable slice cannot silently drift away from this source of truth.
