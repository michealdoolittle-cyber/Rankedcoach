// Static gameplay reference reviewed 2026-07-13. Agent and weapon history is
// sourced from Riot patch notes; current rolling usage rates are disclosed in
// the Library as Tracker Network (agents) and Blitz (weapons) samples.
(function () {
  "use strict";

  const agentAsset = (agent, file) => `/assets/library/agents/${agent}/${file}.png`;
  const weaponAsset = name => `/assets/weapons/${name}.png`;
  const patchNoteUrl = patch => {
    const [major, minor] = String(patch).split(".");
    const urlMinor = Number(major) < 10 && minor === "00" ? "0" : minor;
    return `https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-${major}-${urlMinor}/`;
  };
  const patchNote = (patch, note, source = patchNoteUrl(patch)) => ({ patch, note, source });

  function ability(id, name, slot, agent, summary, stats, purpose, setup) {
    return { id, name, slot, icon: agentAsset(agent, id), summary, stats, purpose, setup };
  }

  const agents = [
    {
      id: "jett", label: "Jett", role: "Duelist", maps: ["Breeze", "Haven"],
      icon: agentAsset("jett", "icon"), portrait: agentAsset("jett", "portrait"),
      fundamentals: [
        "Tailwind makes Jett one of the safest Operator holders: prime the dash, take a one-and-done angle, and finish the shot beside cover you can dash behind.",
        "Cloudburst is a short crossing tool. Pair it with Tailwind to break one sightline, then clear the next fight instead of treating it like a full controller smoke.",
        "Updraft and Blade Storm stay accurate while moving, so use elevation to change the defender's crosshair height only when you know where you can land."
      ],
      patchHistory: [
        patchNote("4.08", "Tailwind changed to a primed dash: after a 0.75-second delay, Jett received a 12-second window to use it."),
        patchNote("7.04", "Tailwind's window fell to 7.5 seconds with a 1-second windup; Cloudburst fell to 2.5 seconds, Updraft to one charge, and Blade Storm rose to 8 points.")
      ],
      abilities: [
        ability("updraft", "Updraft", "Q - Basic", "jett", "Instant vertical movement that changes elevation before or during a fight.", { Cost: "150 credits", Charges: "1", Recharge: "No", Damage: "None" }, "Reach unexpected elevation, clear vertical utility, or combine with Blade Storm.", "Use it with a clear landing plan. The weapon re-equip delay makes unsupported airtime punishable."),
        ability("tailwind", "Tailwind", "E - Signature", "jett", "Prime a dash, then propel in the movement direction or forward while stationary.", { Cost: "Free", Charges: "1", Recharge: "After 2 kills", Damage: "None" }, "Create entry space or escape after an Operator shot or opening duel.", "Activate before contact. The dash should end behind cover or inside a planned Cloudburst."),
        ability("cloudburst", "Cloudburst", "C - Basic", "jett", "A steerable vision-blocking cloud for a very short crossing window.", { Cost: "200 credits", Charges: "2", Duration: "2.5 seconds", Damage: "None" }, "Break one sightline long enough to dash, cross, isolate, or retrieve the spike.", "Small one-ways are possible, but the short duration makes them a momentary duel tool rather than controller coverage."),
        ability("blade-storm", "Blade Storm", "X - Ultimate", "jett", "Equip five accurate knives; single-fire kills restore knives while alternate fire spends the remaining set.", { Cost: "8 ultimate points", Ammo: "5 knives", Damage: "50 body / 150 head", Falloff: "No single-fire falloff" }, "Preserve economy, fight accurately while moving, and pair vertical movement with a weapon that stays precise.", "Single-fire for reliable resets. Alternate fire is a close-range commitment and does not restore knives on a kill.")
      ]
    },
    {
      id: "sova", label: "Sova", role: "Initiator", maps: ["Breeze", "Haven"],
      icon: agentAsset("sova", "icon"), portrait: agentAsset("sova", "portrait"),
      fundamentals: [
        "Recon Bolt is strongest where defenders must expose themselves to break it. Call the pulse before it lands so the entry can move on the reveal.",
        "Owl Drone should clear the route your first player will actually take; start close enough that teammates can trade the drone's contact.",
        "Shock Bolt and Hunter's Fury convert confirmed information. Use them after a tag, plant sound, or teammate call rather than guessing at empty space."
      ],
      patchHistory: [
        patchNote("4.08", "Owl Drone duration fell from 10 to 7 seconds and health from 125 to 100; its dart dropped from three reveal pings to two, while Shock Bolt max damage fell to 75."),
        patchNote("13.00", "Sova's signature cooldown was reduced from 60 to 50 seconds, restoring more late-round Recon Bolt opportunities.")
      ],
      abilities: [
        ability("owl-drone", "Owl Drone", "C - Basic", "sova", "A controllable drone that clears close space and can tag an enemy for repeated reveals.", { Cost: "400 credits", Charges: "1", Duration: "About 10 seconds", Damage: "None" }, "Clear the exact route the entry will take and force defenders to shoot or give up space.", "Start close enough that teammates can follow the drone. A full solo flight with nobody ready wastes the reveal window."),
        ability("shock-bolt", "Shock Bolt", "Q - Basic", "sova", "A charged, bouncing explosive arrow with damage that falls away from the blast center.", { Cost: "150 credits each", Charges: "2", Damage: "Up to 75", Falloff: "Scales down from center" }, "Finish tagged enemies, clear utility, punish plants, and force players out of cover.", "Use full damage only when the center can land. Edge damage is pressure, not a guaranteed kill."),
        ability("recon-bolt", "Recon Bolt", "E - Signature", "sova", "A destructible scan arrow that reveals enemies in line of sight.", { Cost: "Free", Charges: "1", Recharge: "Cooldown", Damage: "None" }, "Confirm occupied lanes and make defenders turn away from the entry fight to break the dart.", "Place it where the pulse sees the fight but defenders cannot destroy it without exposing themselves."),
        ability("hunter-s-fury", "Hunter's Fury", "X - Ultimate", "sova", "Three long wall-piercing blasts that damage and reveal enemies caught in the beam.", { Cost: "8 ultimate points", Charges: "3 blasts", Damage: "80 per blast", Falloff: "None through terrain" }, "Convert recon or a drone tag, deny a plant or defuse, and damage clustered rotations.", "Lead the target between blasts. Firing all three at the same stale position gives away the remaining shots.")
      ]
    },
    {
      id: "omen", label: "Omen", role: "Controller", maps: ["Split", "Haven"],
      icon: agentAsset("omen", "icon"), portrait: agentAsset("omen", "portrait"),
      fundamentals: [
        "Dark Cover recharges, so survive the opening long enough to reshape the late round. Place each smoke against a named defender angle the team is ready to cross.",
        "Paranoia passes through walls and hits teammates, which makes its path a team timing tool: call the lane, cast beside the entry, then swing with them.",
        "Shrouded Step and From the Shadows create doubt before they create kills. Teleport when sound, smoke, or pressure gives the enemy more than one landing to respect."
      ],
      patchHistory: [
        patchNote("4.04", "Dark Cover cooldown fell from 40 to 30 seconds and projectile speed rose from 2800 to 6400; Shrouded Step became cheaper and faster to complete."),
        patchNote("13.00", "Enemy-facing Shrouded Step audio was updated to make nearby teleports easier to parse during chaotic fights.")
      ],
      abilities: [
        ability("shrouded-step", "Shrouded Step", "C - Basic", "omen", "A short targeted teleport after a brief channel.", { Cost: "100 credits", Charges: "2", Recharge: "No", Damage: "None" }, "Reach elevation, escape utility, cross a watched gap, or reposition after making noise elsewhere.", "Hide the channel sound or force the enemy to watch multiple landing points. Unsupported open-ground teleports are a gamble."),
        ability("paranoia", "Paranoia", "Q - Basic", "omen", "A wall-piercing projectile that Nearsights and Deafens everyone it touches.", { Cost: "250 credits", Charges: "1", Debuff: "About 2 seconds", Damage: "None" }, "Start a coordinated swing through a narrow lane or disable a defender holding behind cover.", "Call the path before casting. It can hit teammates, so align the projectile beside their approach rather than through them."),
        ability("dark-cover", "Dark Cover", "E - Signature", "omen", "A long-lasting spherical smoke placed through Omen's tactical targeting view.", { Cost: "1 free; extra charge 150", Charges: "2", Duration: "15 seconds", Recharge: "Cooldown" }, "Remove named angles, sell pressure across the map, and preserve a smoke for the late round.", "One-ways are possible on ledges and boxes, but require consistent placement. A complete execute smoke matters more than a fragile trick setup."),
        ability("from-the-shadows", "From the Shadows", "X - Ultimate", "omen", "Teleport anywhere as a destructible Shade, with the option to cancel and return.", { Cost: "7 ultimate points", Range: "Map-wide", Damage: "None", Recharge: "No" }, "Recover the spike, force defenders to turn, sell a fake, or convert information into a fast rotation.", "Choose a landing with cover and a reason. A cancel can still create value if it forces the enemy to abandon position.")
      ]
    },
    {
      id: "viper", label: "Viper", role: "Controller", maps: ["Breeze", "Bind"],
      icon: agentAsset("viper", "icon"), portrait: agentAsset("viper", "portrait"),
      fundamentals: [
        "Toxic Screen and Poison Cloud share fuel, so cycle them around the team's contact instead of spending the full tank before anyone can take space.",
        "Her wall is permanent for the round and the orb is only recoverable during Buy Phase. Commit each setup to the lanes your team actually plans to contest.",
        "Snake Bite's Vulnerable effect turns teammate damage into the real threat. Pair it with a choke, smoke, plant sound, or swing rather than relying on the puddle alone."
      ],
      patchHistory: [
        patchNote("3.00", "Snake Bite duration fell from 8 to 6.5 seconds and its price rose from 100 to 200 credits as Riot reduced Viper's stall time."),
        patchNote("8.08", "Smoke uptime fell to 12 seconds, minimum activation fuel rose to 30%, and Snake Bite moved to one 300-credit charge with a 6.5-second duration.")
      ],
      abilities: [
        ability("snake-bite", "Snake Bite", "C - Basic", "viper", "A lingering chemical zone that damages and applies Vulnerable.", { Cost: "300 credits", Charges: "1", Duration: "6.5 seconds", Damage: "Damage over time" }, "Clear a corner, stop a plant or defuse, and double the threat of teammate damage through Vulnerable.", "Damage depends on how long the target remains inside, so pair it with a choke, smoke, stun, or confirmed spike timing."),
        ability("poison-cloud", "Poison Cloud", "Q - Basic", "viper", "A reusable fuel-powered smoke orb that applies Decay to enemies inside.", { Cost: "200 credits", Charges: "1", Uptime: "Up to 12 seconds on full solo fuel", Reactivation: "5-second delay" }, "Control a choke repeatedly and create strong one-way fights from stable ledges.", "One-ways are a core strength, but difficult throws need a reproducible lineup. If the orb misses, the setup can be unrecoverable after Buy Phase."),
        ability("toxic-screen", "Toxic Screen", "E - Signature", "viper", "A permanent emitter line that raises a fuel-powered wall and Decays enemies crossing it.", { Cost: "Free", Charges: "1", Uptime: "Up to 12 seconds on full solo fuel", Reactivation: "5-second delay" }, "Split open sites, hide several crossing lanes at once, and control when defenders regain information.", "Place it for the entire round plan. The emitters cannot be moved, so a wall that helps defenders retake can hurt the team later."),
        ability("viper-s-pit", "Viper's Pit", "X - Ultimate", "viper", "A large persistent cloud that Nearsights and Decays enemies while Viper maintains it.", { Cost: "9 ultimate points", Duration: "Persistent while maintained", Damage: "Decay, not direct damage", Recharge: "No" }, "Lock down a planted spike or high-value zone and force close, uncertain fights.", "Move between several safe pockets. Repeating one hiding spot turns the entire ultimate into one pre-aimed duel.")
      ]
    },
    {
      id: "cypher", label: "Cypher", role: "Sentinel", maps: ["Bind", "Split"],
      icon: agentAsset("cypher", "icon"), portrait: agentAsset("cypher", "portrait"),
      fundamentals: [
        "Trapwire is strongest when your position can punish the slow and reveal. Build the crossfire first, then choose a wire attackers cannot clear safely.",
        "Cyber Cage breaks vision and announces a crossing, so pair its audio cue with a swing or use it to leave before the trade arrives.",
        "Spycam keeps value while Cypher stays alive. Change camera and wire height between gun rounds so one learned clear does not solve the whole setup."
      ],
      patchHistory: [
        patchNote("11.08", "Trapwire windup fell to 0.9 seconds, stopped concussing, and instead applied a 50% slow plus a one-second reveal; Spycam gained clearer proximity audio and stealth rules."),
        patchNote("13.00", "Trapwire windup was reduced again, from 0.9 to 0.7 seconds, improving Cypher's anchor conversion window.")
      ],
      abilities: [
        ability("trapwire", "Trapwire", "C - Basic", "cypher", "A covert line that catches, Slows, and Reveals an enemy who does not break it in time.", { Cost: "200 credits each", Charges: "2", Windup: "0.9 seconds on PC", Damage: "No meaningful direct damage" }, "Protect a flank, delay an entry, and create a guaranteed wallbang or swing timing.", "Change height and anchor position. A trip has little value if attackers can clear it without exposing themselves."),
        ability("cyber-cage", "Cyber Cage", "Q - Basic", "cypher", "A remote vision-blocking cage that gives an audio cue when enemies pass through.", { Cost: "100 credits each", Charges: "2", Duration: "About 7 seconds", Damage: "None" }, "Break vision, isolate a choke, or trigger a swing from the crossing audio.", "One-way cages are possible on many ledges and are strong when the exposed feet line is consistent. Test the height from both sides."),
        ability("spycam", "Spycam", "E - Signature", "cypher", "A controllable camera that can fire a tracking dart and be picked up for redeployment.", { Cost: "Free", Charges: "1", Recharge: "Cooldown if destroyed", Damage: "None" }, "Confirm an execute, watch a rotation, and force an enemy to turn away from the gunfight.", "Use a view that answers one question clearly. A hidden camera pointed at empty geometry is not information."),
        ability("neural-theft", "Neural Theft", "X - Ultimate", "cypher", "Use a recent enemy corpse to reveal every living opponent twice.", { Cost: "7 ultimate points", Pulses: "2 reveals", Damage: "None", Requirement: "Recent enemy corpse" }, "Call rotations, isolate lurkers, and time a swing between reveal pulses.", "Say which enemy position changes the plan. The second reveal can punish players who immediately reposition after the first.")
      ]
    },
    {
      id: "sage", label: "Sage", role: "Sentinel", maps: ["Bind", "Split"],
      icon: agentAsset("sage", "icon"), portrait: agentAsset("sage", "portrait"),
      fundamentals: [
        "Barrier Orb changes the map, not just the timer. Place it to secure a plant, split a retake, or create an elevation the opponent must clear deliberately.",
        "Slow Orb is a timing tool: land it where attackers still need to cross, then let teammate damage or a coordinated peek punish the reduced movement.",
        "Healing Orb and Resurrection gain value when Sage survives. Play one layer behind first contact and clear the recovery route before committing to a revive."
      ],
      patchHistory: [
        patchNote("11.08", "Barrier Orb cost fell from 400 to 300 and fortified after 2 seconds, while fortified segment health fell from 800 to 600."),
        patchNote("13.00", "Healing Orb's self-heal-over-time increased from 50 to 100, restoring more of Sage's personal sustain.")
      ],
      abilities: [
        ability("barrier-orb", "Barrier Orb", "C - Basic", "sage", "A four-segment wall that fortifies after deployment and blocks movement and bullets.", { Cost: "300 credits", Charges: "1", Duration: "40 seconds", Health: "600 per fortified segment" }, "Delay a choke, secure a plant, reshape an angle, or elevate a teammate.", "Off-angle walls are possible, but every exposed segment can give attackers a safe breaking target. Build for a specific fight or timing."),
        ability("slow-orb", "Slow Orb", "Q - Basic", "sage", "A lingering field that slows movement and reduces dash speed.", { Cost: "200 credits each", Charges: "2", Duration: "7 seconds", Damage: "None" }, "Hold attackers in damage utility, stop a fast hit, and make a retake swing easier to time.", "Throw it where enemies must cross, not where they already finished moving. Layer two slows only when the extra time changes the round."),
        ability("healing-orb", "Healing Orb", "E - Signature", "sage", "A heal-over-time for an ally or a weaker self-heal for Sage.", { Cost: "Free", Charges: "1", Recharge: "Cooldown", Damage: "None" }, "Restore a teammate who can take another meaningful fight and preserve armor value.", "Do not cross an exposed lane just to heal. Ask whether the healed player can actually rejoin the round."),
        ability("resurrection", "Resurrection", "X - Ultimate", "sage", "Revive a dead ally after a vulnerable channel and return them at full health.", { Cost: "7 ultimate points", Charges: "1", Health: "Full health", Damage: "None" }, "Recover a key weapon, restore numbers, or force defenders to contest the body.", "Clear the body and name the revived player's escape route first. A resurrection that immediately dies spends the ultimate without restoring pressure.")
      ]
    }
  ];

  function weapon(id, label, cost, magazine, fireRate, penetration, damageRanges, focus) {
    return { id, label, image: weaponAsset(id), cost, magazine, fireRate, penetration, damageRanges, focus };
  }

  const currentAgentRates = {
    jett: {
      pickRate: 10.3, pickRateRank: 1, sampleLabel: "Tracker Network | Past two weeks", maps: ["Breeze", "Ascent", "Haven"],
      mapPickRates: { Breeze: 11.7, Ascent: 11.3, Haven: 11.3 },
      mapWinRates: { Breeze: 50.4, Ascent: 49.9, Haven: 50.0 }
    },
    sova: {
      pickRate: 4.9, pickRateRank: 7, sampleLabel: "Tracker Network | Past two weeks", maps: ["Ascent", "Haven", "Breeze"],
      mapPickRates: { Ascent: 8.4, Haven: 7.9, Breeze: 7.7 },
      mapWinRates: { Ascent: 51.3, Haven: 50.8, Breeze: 50.8 }
    },
    omen: {
      pickRate: 4.9, pickRateRank: 7, sampleLabel: "Tracker Network | Past two weeks", maps: ["Haven", "Ascent", "Lotus"],
      mapPickRates: { Haven: 5.6, Ascent: 5.3, Lotus: 5.2 },
      mapWinRates: { Haven: 47.6, Ascent: 47.6, Lotus: 47.5 }
    },
    viper: {
      pickRate: 0.9, pickRateRank: 25, sampleLabel: "Tracker Network | Past two weeks", maps: ["Breeze", "Split", "Lotus"],
      mapPickRates: { Breeze: 3.9, Split: 0.6, Lotus: 0.5 },
      mapWinRates: { Breeze: 50.4, Split: 47.9, Lotus: 48.2 }
    },
    cypher: {
      pickRate: 3.4, pickRateRank: 11, sampleLabel: "Tracker Network | Past two weeks", maps: ["Split", "Sunset", "Haven"],
      mapPickRates: { Split: 4.9, Sunset: 4.5, Haven: 3.8 },
      mapWinRates: { Split: 50.2, Sunset: 50.1, Haven: 50.6 }
    },
    sage: {
      pickRate: 6.8, pickRateRank: 5, sampleLabel: "Tracker Network | Past two weeks", maps: ["Split", "Sunset", "Haven"],
      mapPickRates: { Split: 8.9, Sunset: 6.7, Haven: 6.5 },
      mapWinRates: { Split: 52.3, Sunset: 51.9, Haven: 51.5 }
    },
    raze: {
      pickRate: 4.0, pickRateRank: 10, sampleLabel: "Tracker Network | Past two weeks", maps: ["Lotus", "Split", "Sunset"],
      mapPickRates: { Lotus: 6.5, Split: 5.9, Sunset: 4.4 },
      mapWinRates: { Lotus: 50.6, Split: 50.7, Sunset: 50.3 }
    }
  };
  const officialAgentLore = {
    jett: [
      { label: "Origin", value: "South Korea", note: "Jett represents her home country with an agile, evasive fighting style built around speed and calculated risk." },
      { label: "Lore", value: "Wind-driven duelist", note: "Her supernatural command of wind lets her move through fights in ways few opponents can track, favoring precision over brute force." }
    ],
    sova: [
      { label: "Origin", value: "Russia", note: "Raised through the severity of the Russian tundra, Sova is a patient scout and relentless tracker." },
      { label: "Lore", value: "Hunter of hidden threats", note: "Specialized equipment and a custom bow help him reveal, pursue, and eliminate enemies who believe they are concealed." }
    ],
    omen: [
      { label: "Origin", value: "Unknown", note: "Omen is a phantom of memory whose fragmented identity remains one of the Protocol's deepest mysteries." },
      { label: "Lore", value: "Shadow-born hunter", note: "He moves through darkness, blinds the opposition, and lets uncertainty spread before striking from an unexpected angle." }
    ],
    viper: [
      { label: "Origin", value: "United States", note: "Viper is an American chemist who applies a formidable scientific mind directly to the battlefield." },
      { label: "Lore", value: "Toxic field commander", note: "Her chemical devices control space and impair enemies, and she is willing to use every advantage to secure the mission." }
    ],
    cypher: [
      { label: "Origin", value: "Morocco", note: "Cypher is a Moroccan information broker who watches the battlefield through an extensive surveillance network." },
      { label: "Lore", value: "Keeper of secrets", note: "He tracks movement, protects hidden information, and treats every enemy habit as another secret waiting to be uncovered." }
    ],
    sage: [
      { label: "Origin", value: "China", note: "Sage creates safety for her team wherever the mission takes them and serves as a calm center in chaotic fights." },
      { label: "Lore", value: "Radiant stronghold", note: "Her Radiant power heals allies, denies ground, and can return a fallen teammate to the fight." }
    ],
    raze: [
      { label: "Origin", value: "Brazil", note: "Raze brings a bold personality and a large collection of explosives from Brazil into every operation." },
      { label: "Lore", value: "Explosive space maker", note: "Her aggressive tools excel at clearing tight positions and dislodging opponents who rely on entrenched cover." }
    ]
  };
  const currentAgents = agents.map(agent => {
    const rates = currentAgentRates[agent.id] || {};
    const strongestMap = rates.maps?.[0];
    const mapPickRate = strongestMap ? rates.mapPickRates?.[strongestMap] : null;
    const mapWinRate = strongestMap ? rates.mapWinRates?.[strongestMap] : null;
    return {
      ...agent,
      ...rates,
      lore: officialAgentLore[agent.id] || [],
      facts: [
        {
          label: "Global pick rate",
          value: Number.isFinite(rates.pickRate) ? `${rates.pickRate.toFixed(1)}%` : "Pending",
          note: rates.sampleLabel || "Tracker Network rolling Competitive sample."
        },
        {
          label: strongestMap ? `${strongestMap} map fit` : "Map fit",
          value: Number.isFinite(mapPickRate) && Number.isFinite(mapWinRate) ? `${mapPickRate.toFixed(1)}% pick | ${mapWinRate.toFixed(1)}% win` : "Pending",
          note: "Current rolling Competitive sample; this is not lifetime profile data."
        }
      ]
    };
  });

  const weaponCatalog = {
    vandal: weapon("vandal", "Vandal", 2900, 25, "9.75 rounds/sec", "Medium", [{ range: "0-50m", head: 160, body: 40, legs: 34 }], "No damage falloff. Favor clean taps and short bursts once the first controlled shots are gone."),
    phantom: weapon("phantom", "Phantom", 2900, 30, "11 rounds/sec", "Medium", [{ range: "0-20m", head: 156, body: 39, legs: 33 }, { range: "20-50m", head: 140, body: 35, legs: 30 }], "Higher fire rate and a silenced profile reward close-to-mid fights; respect the long-range headshot falloff."),
    bulldog: weapon("bulldog", "Bulldog", 2050, 24, "10 rounds/sec", "Medium", [{ range: "0-50m", head: 116, body: 35, legs: 30 }], "Use alternate-fire bursts for planned mid-range fights and avoid forcing full-auto recoil at long range."),
    guardian: weapon("guardian", "Guardian", 2250, 12, "5.25 rounds/sec", "High", [{ range: "0-50m", head: 195, body: 65, legs: 49 }], "Treat every shot as a resettable single-fire decision; high penetration supports disciplined wallbangs."),
    operator: weapon("operator", "Operator", 4700, 5, "0.6 rounds/sec", "High", [{ range: "0-50m", head: 255, body: 150, legs: 120 }], "Plan the escape before taking the shot. Missing without cover or movement utility exposes the weapon's slow cycle."),
    outlaw: weapon("outlaw", "Outlaw", 2400, 2, "2.75 rounds/sec", "High", [{ range: "0-50m", head: 238, body: 140, legs: 119 }], "Punish light armor with a body shot and manage the two-round chamber as a paired burst, not an endless hold."),
    marshal: weapon("marshal", "Marshal", 950, 5, "1.5 rounds/sec", "Medium", [{ range: "0-50m", head: 202, body: 101, legs: 86 }], "Use mobility and fast follow-up positioning to punish unarmored buys without overstaying a scoped lane."),
    spectre: weapon("spectre", "Spectre", 1600, 30, "13.33 rounds/sec", "Low", [{ range: "0-15m", head: 78, body: 26, legs: 22 }, { range: "15-30m", head: 66, body: 22, legs: 19 }, { range: "30-50m", head: 60, body: 20, legs: 17 }], "Close distance and transfer through multiple targets; long-range rifle duels waste the weapon's mobility advantage."),
    stinger: weapon("stinger", "Stinger", 1100, 20, "16 rounds/sec", "Low", [{ range: "0-15m", head: 68, body: 27, legs: 23 }, { range: "15-50m", head: 57, body: 23, legs: 19 }], "Commit to close fights or controlled alternate-fire bursts. The magazine disappears quickly if the first transfer is late."),
    judge: weapon("judge", "Judge", 1850, 5, "3.5 rounds/sec", "Low", [{ range: "0-10m", head: 34, body: 17, legs: 14 }, { range: "10-15m", head: 20, body: 10, legs: 9 }, { range: "15-50m", head: 14, body: 7, legs: 6 }], "Damage is per pellet. Own a tight choke and have a route to recover a rifle after the first conversion."),
    bucky: weapon("bucky", "Bucky", 850, 5, "1.1 rounds/sec", "Low", [{ range: "0-8m", head: 34, body: 17, legs: 14 }, { range: "8-12m", head: 26, body: 13, legs: 11 }, { range: "12-50m", head: 18, body: 9, legs: 8 }], "Damage is per pellet. Protect the close-range fight and do not expose the long recovery to a second enemy."),
    shorty: weapon("shorty", "Shorty", 300, 2, "3 rounds/sec", "Low", [{ range: "0-7m", head: 22, body: 11, legs: 9 }, { range: "7-15m", head: 12, body: 6, legs: 5 }, { range: "15-50m", head: 6, body: 3, legs: 3 }], "Damage is per pellet. Use it as a concealed close-corner answer, then immediately upgrade from the dropped weapon."),
    classic: weapon("classic", "Classic", 0, 12, "6.75 rounds/sec", "Low", [{ range: "0-30m", head: 78, body: 26, legs: 22 }, { range: "30-50m", head: 66, body: 22, legs: 19 }], "Use controlled taps at range and reserve alternate fire for close movement fights where all pellets can connect."),
    frenzy: weapon("frenzy", "Frenzy", 450, 15, "10 rounds/sec", "Low", [{ range: "0-20m", head: 78, body: 26, legs: 22 }, { range: "20-50m", head: 63, body: 21, legs: 18 }], "Treat it like a compact SMG: close distance, control the short magazine, and avoid long-range tap races."),
    ghost: weapon("ghost", "Ghost", 500, 13, "6.75 rounds/sec", "Medium", [{ range: "0-30m", head: 105, body: 30, legs: 26 }, { range: "30-50m", head: 88, body: 25, legs: 21 }], "Use the clean first shot and quiet profile for disciplined pistol-round picks; reset instead of panic-spamming."),
    sheriff: weapon("sheriff", "Sheriff", 800, 6, "4 rounds/sec", "High", [{ range: "0-30m", head: 160, body: 55, legs: 47 }, { range: "30-50m", head: 145, body: 50, legs: 43 }], "Protect the 0-30m one-shot headshot range and let recoil settle. Long-range headshots no longer kill full armor." )
  };

  const weaponGuides = {
    vandal: {
      whenToUse: ["Choose it on full buys when long sightlines and one-shot headshots matter.", "Favor it when your plan includes disciplined taps, bursts, or medium-penetration spam through a known position."],
      howToUse: ["Tap at long range, use two-to-four-shot bursts at mid range, and commit to a spray only when the target is close enough to track.", "Stop before the first shot and reset after the controlled bullets; running recoil is deliberately harsher."],
      patchHistory: [patchNote("1.07", "Fire rate rose from 9.25 to 9.75 rounds per second and body damage rose from 39 to 40."), patchNote("6.11", "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 75 to 50."), patchNote("11.08", "Protected spray bullets rose from four to six while horizontal recoil timing was retuned.")]
    },
    phantom: {
      whenToUse: ["Choose it for close-to-mid fights, smoke spam, and positions where a silenced shot keeps your location less obvious.", "Its larger magazine and faster fire rate fit multi-target holds better than long one-tap lanes."],
      howToUse: ["Burst through mid range and lean on controlled sprays inside 20 meters, where a headshot still kills full armor.", "Respect the 20-meter headshot falloff and shorten the fight before challenging a Vandal on an open lane."],
      patchHistory: [patchNote("6.11", "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 90 to 60."), patchNote("11.08", "Protected spray bullets rose from six to eight and horizontal recoil timing was retuned to make close-to-mid sprays more controllable.")]
    },
    guardian: {
      whenToUse: ["Buy it when head-level long lanes and high-penetration wallbangs are worth more than automatic fire.", "It is a deliberate mid-price rifle choice when armor and required utility still fit the team buy."],
      howToUse: ["Fire one settled shot at a time at range; at closer distances, keep a measured rhythm instead of panic-spamming.", "Hold narrow head-height lanes and use the high penetration only on confirmed common positions."],
      patchHistory: [patchNote("1.08", "Price fell from 2500 to 2400, fire rate rose from 4.75 to 5.25 rounds per second, and recovery improved."), patchNote("3.00", "Price fell again, from 2400 to 2250 credits."), patchNote("4.00", "The ADS fire-rate penalty was removed and one more shot was added before the recovery curve begins.")]
    },
    bulldog: {
      whenToUse: ["Use it on a lighter rifle buy when the team still needs armor and utility.", "It works best on mid-range lanes where ADS burst gives a clean first engagement and full-auto protects a close collapse."],
      howToUse: ["Use ADS burst for a planned medium-to-long fight, then wait for the short recovery before the next burst.", "Switch to full-auto only when the opponent closes distance; do not drag the burst cadence into a long spray."],
      patchHistory: [patchNote("3.00", "Hip-fire rate rose from 9.15 to 9.5 rounds per second and price fell from 2100 to 2050."), patchNote("4.00", "Hip-fire rate rose to 10 and burst recovery improved from 0.4 to 0.35 seconds."), patchNote("11.08", "Horizontal recoil timing was lengthened from 0.37 to 0.6 seconds as rifle sprays were retuned.")]
    },
    operator: {
      whenToUse: ["Buy it when the economy can support the weapon and the round offers a long first-contact lane.", "Agents with an escape tool can take a more aggressive opening angle; everyone else needs hard cover beside the shot."],
      howToUse: ["Plan the escape before scoping, fire once, then reposition while the enemy spends utility on the old angle.", "Avoid unsupported repeeks: the slow cycle, movement speed, and equip timing all give opponents a punish window."],
      patchHistory: [patchNote("1.09", "Price rose from 4500 to 5000 while scoped movement, fire rate, equip time, and jump-land accuracy were all reduced."), patchNote("3.00", "Price fell from 5000 to the current 4700 credits.")]
    },
    outlaw: {
      whenToUse: ["Use it against likely light armor or when a 2400-credit sniper preserves the next full buy.", "Its rapid two-shot chamber can punish a second target or finish a tagged full-armor opponent."],
      howToUse: ["Treat the chamber as a two-shot plan: take the first body shot, correct quickly, then leave before the long full reload.", "Partial reloads are faster than replacing both shells, so track whether one shot remains before repeating the lane."],
      patchHistory: [patchNote("8.00", "The Outlaw entered the arsenal as a two-shot sniper built to sit between the Marshal and Operator in price and stopping power.", "https://playvalorant.com/en-us/news/game-updates/a-new-addition-to-the-arsenal-outlaw-insights/")]
    },
    marshal: {
      whenToUse: ["Buy it to punish unarmored or light-buy opponents without breaking the next rifle round.", "Its high scoped movement fits mobile long-lane picks and quick repositioning."],
      howToUse: ["Hold head height against full armor and accept body shots only when the enemy economy suggests no shields.", "Move after the first shot; the low price buys flexibility, not permission to repeat a revealed lane."],
      patchHistory: [patchNote("2.03", "Scoped movement rose from 76% to 90%, price fell from 1100 to 1000, and zoom increased from 2.5x to 3.5x."), patchNote("3.00", "Price fell again, from 1000 to 950 credits.")]
    },
    spectre: {
      whenToUse: ["Choose it for anti-eco rounds, close site holds, and run paths that can avoid open rifle lanes.", "The 30-round magazine supports a controlled transfer when multiple lightly armed opponents collapse together."],
      howToUse: ["Close distance with cover, then use a compact spray and transfer; burst or disengage once the fight stretches beyond 15 meters.", "Movement is part of the weapon's identity, but stop for any fight where the first bullets must be dependable."],
      patchHistory: [patchNote("4.00", "Spray error began earlier, moving recoil multipliers rose from 1.25x to 1.5x, and protected spray bullets fell from eight to five."), patchNote("6.11", "Running vertical recoil rose from 1.5x to 1.8x."), patchNote("11.08", "Total spread fell from 1.5 to 1.3, tap efficiency rose from two to three, and protected bullets rose from four to five.")]
    },
    stinger: {
      whenToUse: ["Use it on a force or save where a close first kill can recover a rifle.", "It is strongest in tight corridors and fast contact plans where its low price and burst damage can matter immediately."],
      howToUse: ["Full-auto only at close range and control the first four-to-six bullets; the 20-round magazine disappears quickly.", "Use ADS burst for a measured mid-range chance, then reset instead of stacking inaccurate bursts."],
      patchHistory: [patchNote("2.03", "Price rose to 1100, full-auto fire rate fell from 18 to 16, and recoil became more aggressive after the third bullet."), patchNote("3.00", "Price returned from 1100 to 950 credits."), patchNote("11.08", "Full-auto spread rose from 1.3 to 1.5 and reached maximum spread one bullet sooner.")]
    },
    judge: {
      whenToUse: ["Hold a tight choke where enemies must enter inside the first damage band.", "Use it when an escape path or dropped-rifle upgrade is available after the first close kill."],
      howToUse: ["Set your feet before firing, center the full pellet pattern, and make the enemy clear into your range.", "Do not chase through open ground; reposition between shots so the magazine can cover more than one contact."],
      patchHistory: [patchNote("3.00", "Price rose from 1600 to 1850 and pellet damage at 10 and 15 meters was reduced."), patchNote("12.09", "Minimum and movement spread increased, sharply reducing accuracy while walking, running, jumping, or using ropes.")]
    },
    bucky: {
      whenToUse: ["Choose it for a low-cost close hold where one patient shot can recover a better weapon.", "It fits corners with hard cover that protect the long recovery after a miss."],
      howToUse: ["Stand still, let the target enter the first damage band, and center the body so enough pellets connect.", "Do not expose to a second enemy until the pump finishes; the weapon rewards one isolated fight at a time."],
      patchHistory: [patchNote("3.00", "Price fell from 900 to 850 credits."), patchNote("12.09", "Close-range pellet damage fell from 40/20/17 to 34/17/14, minimum spread rose to 3.0, and moving spread increased.")]
    },
    shorty: {
      whenToUse: ["Use it as a concealed sidearm for one close corner, often beside a rifle or Operator.", "It is a save-round ambush tool when the first contact can immediately yield an upgrade."],
      howToUse: ["Hide the weapon until the target fills the spread, stop moving, and commit both shells only if the first does not finish.", "After contact, take the dropped weapon or leave; two shells cannot hold an extended lane."],
      patchHistory: [patchNote("6.11", "Price rose from 150 to 300, reserve ammo fell from ten to six, and damage at the first two ranges was reduced."), patchNote("12.09", "Fire rate fell from 3.33 to 3.0 and movement spread increased across walking, running, crouch-walking, jumping, and ropes.")]
    },
    classic: {
      whenToUse: ["Keep it when utility matters more than a pistol upgrade or when the round plan creates a very close right-click fight.", "Its free cost preserves the full 800-credit pistol-round budget."],
      howToUse: ["Tap with primary fire at range and wait for recoil to settle.", "Use alternate fire only at close distance, preferably after stopping or while dropping into a target that already fills the pellet spread."],
      patchHistory: [patchNote("2.00", "Jumping error for alternate fire rose from 0.4 to 1.0 and repeated right-click bursts gained a stronger recovery curve."), patchNote("3.00", "Walking and running inaccuracy increased as Riot tightened moving sidearm fire.")]
    },
    frenzy: {
      whenToUse: ["Buy it for close pistol-round pressure or a save-round path that reaches SMG distance quickly.", "It pairs with agents who can cross open space before the 15-round magazine is committed."],
      howToUse: ["Use short close-range sprays and reset before the magazine empties; long tap races favor Ghost or Sheriff.", "Move to close the gap, then settle before the decisive burst."],
      patchHistory: [patchNote("2.03", "Price rose from 400 to 500 credits after the Frenzy crowded other pistol-round options."), patchNote("3.00", "Price fell to 450 while walking and running inaccuracy increased."), patchNote("6.11", "Minimum spread increased, maximum spread arrived in five bullets, and running recoil rose from 1.25x to 1.5x.")]
    },
    ghost: {
      whenToUse: ["Choose it for quiet pistol-round taps, medium sightlines, and a utility-light 500-credit buy.", "It rewards first-shot accuracy against unarmored targets through 30 meters."],
      howToUse: ["Hold head height, tap once or twice, then let the weapon settle instead of chasing with a full magazine.", "Use the silenced profile to take a first pick without broadcasting the exact lane through tracers."],
      patchHistory: [patchNote("3.00", "Walking inaccuracy rose from 0.25 to 0.92 and running inaccuracy from 1.85 to 2.3."), patchNote("6.11", "Minimum spread on ropes rose from 0.35 to 0.6 as rope combat was made less reliable.")]
    },
    sheriff: {
      whenToUse: ["Buy it when an eco round needs one-shot headshot threat inside 30 meters.", "Its high penetration can punish a confirmed common wall position, but six rounds demand a planned exit."],
      howToUse: ["Let recoil fully settle between long shots and protect the 0-30-meter one-tap range.", "Do not spam after a miss; move back to cover, reset, and take the next deliberate shot."],
      patchHistory: [patchNote("3.00", "Walking inaccuracy rose from 0.25 to 1.2 and running inaccuracy from 2.0 to 3.0."), patchNote("6.11", "Minimum spread on ropes rose from 0.35 to 0.78 as rope combat was made less reliable.")]
    }
  };
  Object.entries(weaponGuides).forEach(([id, guide]) => {
    if (weaponCatalog[id]) Object.assign(weaponCatalog[id], guide);
  });

  const currentWeaponUsage = {
    vandal: 37.6, phantom: 21.2, operator: 5.8, outlaw: 2.4, marshal: 4.1,
    guardian: 3.1, bulldog: 3.5, spectre: 5.9, stinger: 2.8, judge: 2.2,
    bucky: 1.1, shorty: 1.5, classic: 4.8, frenzy: 1.9, ghost: 8.1, sheriff: 5.7
  };
  Object.entries(currentWeaponUsage).forEach(([id, pickRate]) => {
    if (weaponCatalog[id]) weaponCatalog[id].pickRate = pickRate;
  });
  const currentWeaponKillConversion = {
    vandal: 1.01, phantom: 1.03, operator: 1.32, outlaw: 0.91, marshal: 0.68,
    guardian: 0.86, bulldog: 0.80, spectre: 0.78, stinger: 0.69, judge: 0.84,
    bucky: 0.65, shorty: 0.57, classic: 0.72, frenzy: 0.53, ghost: 0.60, sheriff: 0.66
  };
  Object.entries(currentWeaponKillConversion).forEach(([id, killConversion]) => {
    if (!weaponCatalog[id]) return;
    weaponCatalog[id].killConversion = killConversion;
    // vstats publishes round win conversion through economy filters. It does
    // not expose a defensible single unfiltered round-win percentage.
    weaponCatalog[id].roundConversion = "Economy-filtered";
  });

  const weapons = [
    { id: "rifles", label: "Rifles", examples: "Vandal, Phantom", range: "Mid-range default", weaponIds: ["vandal", "phantom"] },
    { id: "precision", label: "Light Rifles", examples: "Guardian, Bulldog", range: "Mid to long range", weaponIds: ["guardian", "bulldog"] },
    { id: "snipers", label: "Snipers", examples: "Operator, Outlaw, Marshal", range: "Long sightlines", weaponIds: ["operator", "outlaw", "marshal"] },
    { id: "smgs", label: "SMGs", examples: "Spectre, Stinger", range: "Close-range pressure", weaponIds: ["spectre", "stinger"] },
    { id: "shotguns", label: "Shotguns", examples: "Judge, Bucky, Shorty", range: "Close-range only", weaponIds: ["judge", "bucky", "shorty"] },
    { id: "sidearms", label: "Sidearms", examples: "Classic, Frenzy, Ghost, Sheriff", range: "Pistol and save rounds", weaponIds: ["classic", "frenzy", "ghost", "sheriff"] }
  ].map(group => ({ ...group, weapons: group.weaponIds.map(id => weaponCatalog[id]) }));

  const warmupDetails = {
    "weapon-choice": ["Choose the weapon you want to train before starting.", "Keep that weapon selected through the drills so the recoil and timing reps stay connected.", "Change weapons only when you intentionally start a different training block."],
    "burst-peeking": ["Leave the Range Strafe setting off.", "Peek with your own movement, stop fully, and fire a short controlled burst.", "Return behind the same line, let recoil reset, and repeat without shooting while moving."],
    "burst-peeking-strafe": ["Turn on Strafe mode in the Range settings.", "Peek, settle the crosshair on the moving bot, and fire a short controlled burst.", "Reset behind the line and repeat; Strafe refers to the bot setting, not permission to fire while drifting."],
    "tap-fire-rhythm": ["Place the first shot at head height.", "Wait until recoil fully settles before the next tap.", "Keep one steady rhythm after a miss instead of speeding up to chase the target."],
    "easy-bots-flicking": ["Stand completely still for the entire drill.", "Move in one smooth line from center to the bot's head.", "Confirm the crosshair stop before clicking; clean hits matter more than the score."],
    "medium-bots-flicking": ["Remain stationary and use the same centered starting point every rep.", "Raise speed only after the crosshair stops cleanly on the head.", "Reset your hand after every miss instead of adding a panic correction."],
    "hard-bots-flicking": ["Stay stationary and take one controlled attempt per target.", "Accept a miss without turning it into a correction spray.", "Track clean first-shot confirms rather than chasing the scoreboard."],
    "head-tracking": ["Place the crosshair on a bot's head before firing.", "Track the head smoothly for a short count while keeping your own position stable.", "Shoot only after the crosshair remains attached through the movement."],
    "head-tracking-strafe": ["Turn on Strafe mode in the Range settings and remain stationary.", "Track the bot's head through each direction change without firing.", "Take the shot only after the crosshair stays attached through the strafe."],
    "drone-target-switching": ["Stay stationary, choose a rifle, and turn infinite ammo off.", "Hold the fire input on the first drone, then transfer the same burst to the second without releasing.", "Repeat as a speed test while preserving as many unused rounds as possible; reload only when the magazine requires it."],
    "spray-control-dummy": ["Use the large range-finder target dummy, select the shortest distance, and turn infinite ammo off.", "Hold one full spray and judge accuracy by bullets hitting the dummy, not precision at the center bullseye.", "Move up one distance setting at a time only while the spray continues to land, then reload and repeat through the longest setting."]
  };

  globalThis.RankedCoachGamesenseReference = Object.freeze({
    agents: currentAgents,
    weapons,
    warmupDetails,
    season: { label: "Season 2026 Act 4", patch: "13.00", updatedAt: "2026-07-12" }
  });
})();
