# Production Insight-Variant Data Availability Audit (2026-08-28)

**Status:** Phase 1b complete. This is a data-capability audit only; it does not authorize Phase 2 wording or rule work.

## Ground truth used

This audit was made against the production checkout (`Desktop/rankedcoach-production`), not the beta implementation.

- Normalized production analytics already reads `matches` (map, agent, role, result, score, duration, RR, full retained `raw` JSON), `match_players` (all ten players' agent, tier, K/D/A, ACS, ADR, HS%, plants/defuses), `match_rounds` (side, result, self K/D/A/damage/loadout, plant/defuse/site), `match_kills` (all kill timestamps, teams, assistants, weapon/category, first kill), `mmr_history`, and player-authored `match_reflections`.
- The importer retains the complete Henrik match object in `matches.raw`, even when a field has not been projected into a normalized table. Henrik v4's documented payload includes per-round ability-cast counts and economy, kill/plant/defuse locations and player-location snapshots. It does **not** supply voice content, ability cast timestamps, ability effects/hits, continuous movement, or player intent.
- **Checkable now** means the normalized production fields already support a deterministic calculation. **Small addition** means parsing a named retained raw field (or reading an already-stored reflection field) into the analytics input; no new provider or invented data. **Blocked** means the asserted behavior requires a missing event stream, such as voice content, an ability's timing/effect, continuous movement, or intent.
- Policy/guardrail rules are marked **Checkable now** when the app can enforce the suppression or disclosure without making a new gameplay claim. This mirrors beta's `active` / `policy` / `blocked` convention rather than turning a missing signal into a guess.

## Section 1 — Maps (1–50)

| Rule | Status | Exact production basis or limitation |
|---:|---|---|
| 1 | Checkable now | `matches.map_name`, result, and per-map match count; preserve the under-10 early-sample guardrail. |
| 2 | Checkable now | Map joined to `match_kills.is_first_kill` and self-death timestamps supports map-specific first-death rate. |
| 3 | Checkable now | `match_rounds.self_side` + `self_won` joined to match map. |
| 4 | Checkable now | Map result plus round number and pistol-round outcomes are normalized. |
| 5 | Small addition | Parse raw per-kill/plant player-location snapshots to infer repeated Haven site coverage; `plant_site` alone is attacking-only. |
| 6 | Blocked | Kill/plant snapshots are not a continuous movement trace, so true site-to-site rotation time is absent. |
| 7 | Checkable now | Attack/defense win splits plus stored agent role support the comparison. |
| 8 | Checkable now | Existing map aggregation can distinguish all-map weakness from one-map weakness. |
| 9 | Checkable now | Map, first-kill/first-death, and round outcomes are normalized. |
| 10 | Blocked | No teleporter-use or teleporter-reaction event exists. |
| 11 | Small addition | Parse raw `kills[].location` / `player_locations` and map transforms to identify mid duels. |
| 12 | Checkable now | `bomb_planted`, map, and post-plant round outcome already exist. |
| 13 | Small addition | Raw kill locations and view radians can identify elevated-area deaths after map-coordinate work; "unseen" still needs conservative wording. |
| 14 | Checkable now | Map name and result support two-site versus three-site aggregation. |
| 15 | Checkable now | `match_kills.weapon_name/category` joined to map supports map-specific kill/weapon results. |
| 16 | Small addition | Retained plant and player-location snapshots can identify Fracture backdoor patterns; no role assignment may be inferred. |
| 17 | Small addition | Parse `raw.rounds[].stats[].ability_casts` by map; it is retained but not projected. |
| 18 | Blocked | No Lotus-door interaction event is retained. |
| 19 | Checkable now | Map-specific trade-received rate can be recomputed from normalized kill timestamps. |
| 20 | Checkable now | Per-map match count already supports the no-claim small-sample policy. |
| 21 | Small addition | Requires raw defender location snapshots by site; normalized `plant_site` is insufficient. |
| 22 | Small addition | Parse raw kill weapon/type and death location to validate edge/fall deaths; do not assume every Abyss death is a fall. |
| 23 | Checkable now | Map plus `time_in_round_ms` supports first-20-second engagement rate. |
| 24 | Small addition | First-contact timing exists, but chokepoint classification requires raw locations and map geometry. |
| 25 | Checkable now | Map, agent role, and match result are all normalized. |
| 26 | Checkable now | Active-pool freshness is external reference data, but the longer sample suppression is enforceable from map counts. |
| 27 | Blocked | No timeout/pause event is stored. |
| 28 | Small addition | Compare raw player-location snapshots; current schema does not record a defender's site assignment. |
| 29 | Small addition | Raw death coordinates plus a named map-coordinate registry can surface repeat off-angles. |
| 30 | Checkable now | `duration_seconds / rounds` joined to map provides average round length. |
| 31 | Checkable now | Map, plant, and round outcome support per-map post-plant conversion. |
| 32 | Checkable now | Kill events and round result joined by map support duel-win/round-loss comparison. |
| 33 | Blocked | Door/dual-entry decision events and continuous rotations are not recorded. |
| 34 | Checkable now | Round number and outcomes support pistol-to-bonus conversion. |
| 35 | Small addition | Parse per-round raw ability-cast slots; map-specific utility diversity is not normalized. |
| 36 | Checkable now | Stored map, agent, and result support a bounded agent-map-fit comparison. |
| 37 | Checkable now | `rounds_won/lost`, map, and result distinguish overtime/close losses from blowouts. |
| 38 | Checkable now | Map-level first-three-round and final outcomes are normalized. |
| 39 | Small addition | Rope/vertical-location labels need raw kill locations and map transforms. |
| 40 | Small addition | Engagement distance needs raw kill locations and map-coordinate distance calculation. |
| 41 | Small addition | Henrik raw `plant_events.plant_time_in_round` is retained but not normalized. |
| 42 | Checkable now | Planted/defused and map/site outcomes identify map-specific retake conversion. |
| 43 | Small addition | Wrong-site rotation needs raw location snapshots plus Haven site geometry. |
| 44 | Checkable now | `match_rounds.self_side` supplies attack/defense round exposure. |
| 45 | Blocked | Veto and agent-select order are not part of the retained match event data. |
| 46 | Blocked | Snapshots at kills do not prove an enemy's repeated opening default setup or scouting intent. |
| 47 | Small addition | Raw death locations plus Bind route geometry can identify caught-rotating deaths. |
| 48 | Small addition | Pearl-mid weighting needs raw kill coordinates and map-zone labels. |
| 49 | Checkable now | Dated match results support recent-versus-season map trend. |
| 50 | Checkable now | Existing aggregation can deliberately emit no map outlier; this is a policy guardrail. |

## Section 2 — Agents (51–100)

| Rule | Status | Exact production basis or limitation |
|---:|---|---|
| 51 | Checkable now | Stored role and first-kill data support duelist opening-duty rate. |
| 52 | Checkable now | First-blood rounds and their round outcomes are normalized. |
| 53 | Small addition | Controller ability volume requires raw `rounds[].stats[].ability_casts`, grouped by agent. |
| 54 | Blocked | Smoke expiry and execute timing need cast timestamps/durations, neither retained. |
| 55 | Checkable now | Agent role plus self kills/assists is normalized. |
| 56 | Blocked | Flank denial requires trap trigger/effect data; locations alone cannot prove it. |
| 57 | Small addition | Own agent samples exist now; agent-specific expectations require a measured agent baseline rather than the current role baseline. |
| 58 | Checkable now | `matches.agent` supports pool width and rare-pick suppression. |
| 59 | Blocked | A Jett death cannot be attributed to a careful or careless dash without ability timing/location context. |
| 60 | Checkable now | Reyna kills, round outcome, and objective events support a conservative round-relevance read. |
| 61 | Blocked | Recon reveal/hit and follow-up linkage are not in the retained event stream. |
| 62 | Blocked | Utility placement and between-round repositioning are not retained. |
| 63 | Blocked | Smoke placement, target site, and execute timing are missing. |
| 64 | Blocked | Ultimate count is available in raw, but resurrection timing in a winnable state is not. |
| 65 | Checkable now | Agent, K/D, and survival are normalized. |
| 66 | Checkable now | Dated agent picks and performance already support switching/consistency analysis. |
| 67 | Checkable now | Role and round side are normalized. |
| 68 | Small addition | Raw positions at plant/kill can approximate controller post-plant/flank-watch positioning; no intent claim. |
| 69 | Blocked | Ability-cast timestamps relative to duelist contact are missing. |
| 70 | Blocked | Ultimate casts have no value, kill, or site-take linkage. |
| 71 | Small addition | Sentinel entry deaths at their site need raw location snapshots plus site zones. |
| 72 | Blocked | Flash-assist effect data is not retained. |
| 73 | Checkable now | First-contact participation can be calculated from normalized kill/death timing and role. |
| 74 | Checkable now | Map, agent, role, and result are normalized; keep any comparison one dimension at a time. |
| 75 | Checkable now | Stored roles and performance rows support the wide-sample role-fit comparison. |
| 76 | Checkable now | Agent and adjusted HS% are normalized; existing weapon adjustment remains authoritative. |
| 77 | Checkable now | Agent role, self agent, team outcome, and match sample are available; this grounds the Phase 1 `agent-strength` proof. |
| 78 | Blocked | Astra setup placement and the intended eventual play are not recorded. |
| 79 | Blocked | Ultimate-point accrual and exact cast timing are absent. |
| 80 | Blocked | No self-revealing ability event can be linked to a subsequent death. |
| 81 | Blocked | Sentinel utility placement/trigger locations are not retained. |
| 82 | Checkable now | Agent match and round counts already support confidence/sample disclosure. |
| 83 | Checkable now | Kill timestamps, first kill, and duelist role support entry-versus-cleanup timing. |
| 84 | Blocked | Viper wall/orb placement and chokepoint coverage are not retained. |
| 85 | Checkable now | Role, sample size, and performance are normalized. |
| 86 | Blocked | Decoy use and ensuing map-control gain lack event/effect data. |
| 87 | Checkable now | KAST, role mix, and the existing role baseline are normalized. |
| 88 | Checkable now | Self agent/map plus all-player `match_players.agent` supports map/comp contextualization. |
| 89 | Checkable now | Controller role, individual kills, and team round/match result are normalized. |
| 90 | Blocked | Ultimate time/location relative to site take or retake is missing. |
| 91 | Blocked | Match data records selected agent, not agent-select order or player choice. |
| 92 | Blocked | Self/team flash events are not retained. |
| 93 | Checkable now | Sentinel role and death timestamps distinguish early from late deaths. |
| 94 | Blocked | Camera/turret use, recon outcome, and commitment timing are absent. |
| 95 | Small addition | Agent win rate exists; a rank-relative agent baseline must be measured before calling it above/below average. |
| 96 | Blocked | Cooldown/readiness and reusable-utility state are not retained. |
| 97 | Checkable now | Role, death rate, and trade-received timing are normalized. |
| 98 | Blocked | Area-denial placement and chokepoint coverage are not retained. |
| 99 | Blocked | Assigned role/strategy cannot be reliably inferred from agent choice and outcome alone. |
| 100 | Checkable now | This is a policy: retain the existing weapon-adjusted HS% and prevent conflicting agent copy. |

## Section 3 — Weapons (101–150)

| Rule | Status | Exact production basis or limitation |
|---:|---|---|
| 101 | Checkable now | Production's `headshotPctAdjusted` remains the authoritative weapon-normalized accuracy measure. |
| 102 | Checkable now | Dated match kills and ADR support total weapon-impact trend copy. |
| 103 | Blocked | Raw hit locations are not associated with the weapon that fired each shot, so rifle-only HS% cannot be calculated. |
| 104 | Small addition | Retained raw per-round `economy.weapon` identifies the weapon held at round end. |
| 105 | Small addition | Per-round raw weapon/economy joined to the normalized outcome supports a conservative held-weapon split. |
| 106 | Small addition | Raw round loadouts can identify shotgun-held rounds; do not infer a death's held weapon from kill rows alone. |
| 107 | Small addition | The round-level raw loadout supports a bounded weapon-use sample. |
| 108 | Small addition | Raw kill/death locations joined to raw weapon fields can support named-location copy after map-zone definitions exist. |
| 109 | Small addition | Raw round weapon and economy fields support buy-context comparisons. |
| 110 | Small addition | Self round damage and raw weapon/economy support damage while holding a weapon. |
| 111 | Small addition | Raw heavy-weapon-held rounds can be measured; retain a low-usage suppression rather than treating absence as weakness. |
| 112 | Small addition | Raw own-weapon fields and kill locations support a limited hold-position analysis. |
| 113 | Blocked | Category-specific accuracy or HS% by weapon has no shot/hit-to-weapon linkage. |
| 114 | Blocked | Shot count and first-shot count are not in the match payload. |
| 115 | Small addition | Raw round economy/loadout supports a buy-conversion measure. |
| 116 | Checkable now | Normalized per-round damage, kill timing, and outcome support a conservative low-leverage filter. |
| 117 | Blocked | Firing and spray behavior without a kill are not recorded. |
| 118 | Checkable now | Existing self damage plus round loadout/economy supports damage-per-credit with an explicit sample guard. |
| 119 | Small addition | All-player raw round economy can supply a team-buy comparison. |
| 120 | Blocked | Sustained fight duration and shots fired are not available. |
| 121 | Checkable now | Normalized self deaths and opponent weapon categories support an exact death-weapon breakdown. |
| 122 | Checkable now | Dated match weapon kill performance supports a trend, limited to recorded kills/results. |
| 123 | Blocked | A per-event headshot plus hold/flick classification is not provided. |
| 124 | Small addition | Raw per-round armor joined to self deaths supports an armor-context split. |
| 125 | Blocked | Dynamic weapon meta and situational fit require an external, time-versioned ruleset. |
| 126 | Small addition | Raw weapon fields plus locations can support fixed, named close-range zones only. |
| 127 | Blocked | Utility purchases and secondary equipment are not retained as a purchased-loadout event. |
| 128 | Blocked | Accuracy by distance cannot be calculated without weapon-linked hits/shots. |
| 129 | Small addition | Both teams' raw round loadouts and outcomes support an eco/force/full-buy comparison. |
| 130 | Blocked | Suppression or firing that does not yield a kill is absent. |
| 131 | Blocked | Scope state is not present. |
| 132 | Small addition | Raw weapon fields joined to score/late-round context support a pressure split, not a mental-state claim. |
| 133 | Blocked | Weapon-linked head/body baseline data is missing. |
| 134 | Blocked | Secondary sidearm inventory is not retained. |
| 135 | Small addition | Both teams' raw round loadouts and round outcomes support an economy-matchup sample. |
| 136 | Checkable now | This is a disclosure rule: suppress unsupported weapon conclusions. |
| 137 | Blocked | Firing-pattern telemetry is unavailable. |
| 138 | Blocked | Weapon pickup events are unavailable. |
| 139 | Small addition | Raw Operator-held rounds and location snapshots can support a carefully scoped hold-position sample. |
| 140 | Blocked | Ammo and reload events are unavailable. |
| 141 | Small addition | Raw equipped weapon joined to exact round outcome and self K/D supports a held-weapon record. |
| 142 | Blocked | Production has no user-declared weapon-style preference. |
| 143 | Small addition | Raw kill/death coordinates plus map-zone labels can ground location wording. |
| 144 | Small addition | Retained raw `secondary_fire_mode` supports an exact alternate-fire count. |
| 145 | Small addition | All-player economy is available in retained raw round payloads. |
| 146 | Checkable now | `match_kills.is_first_kill` and recorded weapon/category support a first-contact weapon split. |
| 147 | Small addition | Raw player-location snapshots and held-weapon fields support a bounded anchor/weapon analysis. |
| 148 | Checkable now | This is a policy guardrail against pretending that low-usage weapon data is complete. |
| 149 | Blocked | Weapon-linked damage against opponent armor is not recorded. |
| 150 | Small addition | Raw weapon-held rounds can be measured first, then suppressed below the documented sample threshold. |

## Section 4 — Utility (151–200)

| Rule | Status | Exact production basis or limitation |
|---:|---|---|
| 151 | Blocked | Ability casts have counts only; no timestamps or durations. |
| 152 | Blocked | In-round ability timing sequences are absent. |
| 153 | Blocked | Cast timestamps are absent. |
| 154 | Blocked | A cast cannot be ordered relative to damage without an event time. |
| 155 | Blocked | Cast type/time/effect relative to a site take is not recorded. |
| 156 | Blocked | Recon effect followed by movement is not recorded. |
| 157 | Small addition | Raw per-round ability-cast counts joined to results support a narrow volume analysis. |
| 158 | Small addition | Cast counts can be split by match phase/half, but not by intraround timing. |
| 159 | Blocked | Flash effect is not supplied. |
| 160 | Small addition | Controller cast counts plus the selected agent's static kit support a disclosed volume comparison. |
| 161 | Blocked | Defensive/offensive utility intent and location are not recorded. |
| 162 | Blocked | Ability cast locations are absent. |
| 163 | Blocked | Ultimate cast time and downstream value are absent. |
| 164 | Blocked | Post-plant utility timing/effect is absent. |
| 165 | Blocked | Ability purchase prices are not in the retained match data. |
| 166 | Blocked | The first ten seconds cannot be identified without cast timestamps. |
| 167 | Blocked | Recon timeline information is absent. |
| 168 | Blocked | Cast location and site target are absent. |
| 169 | Blocked | Flash effect data is absent. |
| 170 | Blocked | Utility trigger and pathing events are absent. |
| 171 | Blocked | Cast location is absent. |
| 172 | Small addition | Raw per-round cast counts plus team outcomes support a limited association, never a claim that all available utility was used. |
| 173 | Blocked | Utility target and time are absent. |
| 174 | Blocked | Deployment time is absent. |
| 175 | Blocked | Cast time relative to a plant is absent. |
| 176 | Blocked | Cast time/type relative to a retake is absent. |
| 177 | Blocked | Utility location and time are absent. |
| 178 | Small addition | Raw per-round `*_casts` values plus round context are retained. |
| 179 | Blocked | Ability-clear events are absent. |
| 180 | Blocked | Effects such as information gained or space created are absent. |
| 181 | Blocked | Ability timing is absent. |
| 182 | Small addition | Overtime round number and raw cast counts are retained. |
| 183 | Blocked | Recon and rotation times are absent. |
| 184 | Small addition | Raw cast counts plus a maintained agent-kit catalog can support a transparent availability baseline. |
| 185 | Blocked | Utility time/location is absent. |
| 186 | Blocked | Ability-effect metrics are absent. |
| 187 | Blocked | Flash effect relative to a teammate push is absent. |
| 188 | Blocked | Smoke placement geometry is absent. |
| 189 | Blocked | Ultimate orb/point event data is absent. |
| 190 | Blocked | Flash status and duration are absent. |
| 191 | Blocked | Bait/response intent is absent. |
| 192 | Small addition | Raw cast counts and raw economy can ground a round-level volume/cost context. |
| 193 | Blocked | Cast timestamps are absent. |
| 194 | Blocked | Dash/flash timestamps are absent. |
| 195 | Blocked | Ability purchase and replenishment events are absent. |
| 196 | Blocked | Cast time before plant is absent. |
| 197 | Small addition | Per-round all-player `*_casts` are retained raw fields. |
| 198 | Checkable now | This is a policy rule: a loss alone must never be labeled wasted utility. |
| 199 | Small addition | Half-wide raw cast counts and round economy can be aggregated exactly. |
| 200 | Checkable now | This is a disclosure policy for cast-count limitations. |

## Section 5 — Teamwork (201–250)

| Rule | Status | Exact production basis or limitation |
|---:|---|---|
| 201 | Checkable now | Normalized kill/death timestamps and assistants support deterministic trade timing. |
| 202 | Checkable now | All-player rows plus trade timing support a team-context comparison. |
| 203 | Checkable now | Agent composition is normalized through `match_players.agent`. |
| 204 | Blocked | Support-utility timing and effects are absent. |
| 205 | Small addition | Raw player-location snapshots support fixed-position grouping, not an intent claim. |
| 206 | Checkable now | Normalized round number and outcome support early/late match splits. |
| 207 | Blocked | Strategic adjustment intent cannot be inferred from skill spread and results. |
| 208 | Small addition | A retained raw party identifier may support party grouping only after importer validation and privacy review. |
| 209 | Small addition | Raw player locations and retake context can support a positional sample. |
| 210 | Small addition | Raw death locations/timing and roles support careful coverage language, not player intent. |
| 211 | Small addition | All-player raw per-round economy supports a team-buy context. |
| 212 | Blocked | Pre-round voice plans are not recorded. |
| 213 | Checkable now | Agent roles and composition are normalized. |
| 214 | Checkable now | KAST can be derived from normalized player K/D/A and kill events. |
| 215 | Checkable now | Repeated player PUUIDs across matches support roster continuity. |
| 216 | Checkable now | Close-map outcomes are available; wording must not imply elimination or vote causality. |
| 217 | Small addition | Raw locations/pathing snapshots support limited positioning analysis. |
| 218 | Checkable now | Player stats and composition roles are normalized. |
| 219 | Checkable now | Existing role and trade logic supports the comparison. |
| 220 | Blocked | Timeout events are not retained. |
| 221 | Blocked | A no-discussion inference is player intent, not match telemetry. |
| 222 | Small addition | Raw positions, times, and loadouts can identify a plausible retake state after a conservative definition is set. |
| 223 | Checkable now | This is a policy guardrail around attribution. |
| 224 | Checkable now | Kill sequence and round outcome are normalized. |
| 225 | Checkable now | Team composition and outcomes are normalized. |
| 226 | Small addition | Raw positional snapshots can support fixed zone language. |
| 227 | Blocked | Calls are not recorded. |
| 228 | Blocked | Default versus adjusted intent/scouting is not observable. |
| 229 | Checkable now | Repeated roster PUUIDs and trade events are normalized. |
| 230 | Small addition | Raw loadouts, outcomes, and event timing support a round-economy context. |
| 231 | Checkable now | Teammate pairings and their recorded results can be calculated from player rows. |
| 232 | Checkable now | Individual output, loss, and trade events are available; avoid calling any play a “highlight” without a defined metric. |
| 233 | Blocked | Pre-round confirmation speech is absent. |
| 234 | Small addition | Raw equipment and round timing support a restricted equipment-context rule. |
| 235 | Small addition | Raw locations plus kill timings support a positional timing sample. |
| 236 | Small addition | Raw positions and stored roles support a constrained role-position split. |
| 237 | Small addition | Retained raw `was_afk` fields require importer validation before any behavior rule. |
| 238 | Blocked | Opponent tendencies and intent cannot be established from outcome data alone. |
| 239 | Checkable now | Kill timestamps, alive context, and round outcome are normalized. |
| 240 | Small addition | Raw positions/time snapshots support a bounded spacing/rotation proxy. |
| 241 | Checkable now | Repeated roster membership is normalized through player PUUIDs. |
| 242 | Small addition | Raw plant/defuse locations support a location-specific objective sample. |
| 243 | Blocked | “Feed” engagement is an intent judgment, not a recorded event. |
| 244 | Checkable now | Opponent tiers/player stats and match record are present; wording must distinguish correlation from cause. |
| 245 | Blocked | Sound or call source telemetry is absent. |
| 246 | Blocked | Map-control choices and intent are absent. |
| 247 | Checkable now | This is a policy-language restriction. |
| 248 | Checkable now | MMR/rank history and dated results are normalized. |
| 249 | Checkable now | Player-authored self/team communication ratings can be compared with objective trade data without inventing a transcript. |
| 250 | Checkable now | This is a policy/sample-cap guardrail. |

## Section 6 — Communication (251–300)

| Rule | Status | Exact production basis or limitation |
|---:|---|---|
| 251 | Blocked | Voice and callout content are not recorded. |
| 252 | Blocked | Voice communication is not recorded. |
| 253 | Checkable now | Player-authored self/team communication ratings can be compared with objective trade data. |
| 254 | Blocked | Voice volume is not recorded. |
| 255 | Blocked | Sound/call source telemetry is not recorded. |
| 256 | Blocked | Voice clarity is not recorded. |
| 257 | Blocked | Call content is not recorded. |
| 258 | Checkable now | Reflection mood ratings and dated session results are stored. |
| 259 | Blocked | Voice-drop behavior is not recorded. |
| 260 | Blocked | Call content is not recorded. |
| 261 | Blocked | Specific spoken statements are not recorded. |
| 262 | Small addition | Stored reflection text or an explicit quality-versus-quantity questionnaire is needed; existing ratings do not separate them. |
| 263 | Blocked | Call content is not recorded. |
| 264 | Blocked | Call content is not recorded. |
| 265 | Blocked | Call content is not recorded. |
| 266 | Checkable now | A player-authored communication rating can be joined to KAST as a disclosed proxy. |
| 267 | Blocked | Voice telemetry is not recorded. |
| 268 | Blocked | Voice telemetry is not recorded. |
| 269 | Blocked | Speech sentiment/content is not recorded; mood alone is insufficient. |
| 270 | Blocked | Debrief text and call accuracy are not recorded. |
| 271 | Small addition | `match_reflections.reflection_text` is stored; analytics must read deterministic tags before presenting a player-authored statement. |
| 272 | Blocked | Actual call wording is not recorded. |
| 273 | Blocked | Voice telemetry is absent unless a new, explicit self-report is collected. |
| 274 | Blocked | Call terminology is not recorded. |
| 275 | Blocked | Call content is not recorded. |
| 276 | Blocked | Clarification behavior is not recorded. |
| 277 | Checkable now | Player-authored communication ratings can be compared with an exact high-pressure game-state definition. |
| 278 | Checkable now | Player-authored communication ratings can be split by recorded win/loss. |
| 279 | Blocked | Speech data is not recorded. |
| 280 | Blocked | Mute/ignore telemetry is not recorded. |
| 281 | Blocked | Response timing to a call is not recorded. |
| 282 | Checkable now | Dated self/team communication ratings are stored. |
| 283 | Blocked | Speech data is not recorded. |
| 284 | Blocked | Per-player voice distribution is not recorded. |
| 285 | Blocked | Speech style/sentiment is not recorded. |
| 286 | Blocked | Speech style is not recorded. |
| 287 | Blocked | Speech data is not recorded. |
| 288 | Small addition | Stored reflection text can support player-authored tags, but analytics does not yet read it. |
| 289 | Blocked | Speech data is not recorded. |
| 290 | Blocked | Team voice clarity/context is unavailable. |
| 291 | Small addition | Reflection text can support only a player-reported bait/deception tag, never a claim about the team. |
| 292 | Blocked | Silence during a round is not recorded. |
| 293 | Blocked | Speech data is not recorded. |
| 294 | Small addition | Reflection text/mood can support player-reported wording only. |
| 295 | Blocked | Speech data is not recorded. |
| 296 | Blocked | Team calls are not recorded. |
| 297 | Checkable now | Player-authored communication ratings can be compared with a declared playing-behind state. |
| 298 | Blocked | Speech data is not recorded. |
| 299 | Checkable now | Player-authored communication ratings, trade events, and round results are available. |
| 300 | Checkable now | This is a policy: disclose ratings as self-report rather than verified voice telemetry. |

## Testing and implementation consequences

- The Phase 1 `agent-strength` card is a **Checkable now** proof: exact agent match/win records are compared only with the same player's other known-agent records. Its confidence and sample guard prevent a low-volume or placement-state claim.
- Future small-addition rules must name the retained raw/reflection field they parse, preserve raw counts/rates in evidence, and add a deterministic test fixture before card copy is enabled.
- Blocked rules remain unavailable until the user supplies a permitted, verifiable source that actually records the needed event. No estimate, scraped third-party stat, or LLM inference may substitute for it.
- Deterministic variant tests belong in production `scripts/insight-variants.test.ts`: vocabulary allowlist, beta-rule ID source trace, weekly seed determinism, distribution, and render matrix all run in `npm run test:insight-variants`.
