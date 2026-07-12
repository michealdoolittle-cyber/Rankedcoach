// Static gameplay reference reviewed 2026-07-12. Agent descriptions and art
// derive from Riot's public content/Valorant-API records; costs and current
// ability classifications were checked against the current Valorant Wiki.
(function () {
  "use strict";

  const agentAsset = (agent, file) => `/assets/library/agents/${agent}/${file}.png`;
  const weaponAsset = name => `/assets/weapons/${name}.png`;

  function ability(id, name, slot, agent, summary, stats, purpose, setup) {
    return { id, name, slot, icon: agentAsset(agent, id), summary, stats, purpose, setup };
  }

  const agents = [
    {
      id: "jett", label: "Jett", role: "Duelist", maps: ["Breeze", "Haven"],
      icon: agentAsset("jett", "icon"), portrait: agentAsset("jett", "portrait"),
      fundamentals: [
        "Judge first deaths by whether the dash created usable space, not by the death alone.",
        "Opening fights are part of the job. Passive rounds should be the exception, not the default.",
        "A death that is traded and converts the site can still be correct duelist value."
      ],
      signature: ["Clear the dash route before committing.", "Pair entry timing with initiator utility.", "Reposition after the first Operator shot instead of repeating the angle."],
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
        "Recon only creates value when the team is ready to act on the reveal.",
        "Utility that lands after the duelist has already fought is a timing gap, not an aim gap.",
        "Track reveal-to-kill conversion instead of treating every scan as equally useful."
      ],
      signature: ["Call the scan timing before firing it.", "Use the drone to clear the route the entry will actually take.", "Save shock utility for confirmed damage or post-plant denial."],
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
        "Smoke the team's real execute, not the site named during freeze time if the plan changes.",
        "Smokes expiring before contact point to a timing gap.",
        "Controller value includes surviving long enough to refresh utility and shape the late round."
      ],
      signature: ["Place smokes to remove named defender positions.", "Paranoia through the path teammates are ready to swing.", "Use teleports to break crosshair placement, not as unsupported coin flips."],
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
        "A wall or orb should isolate a specific chokepoint rather than act as a generic visual block.",
        "Zone-control utility should support the actual site take or retake nearby.",
        "Late-round fuel management matters as much as the opening setup."
      ],
      signature: ["Name what the wall removes before placing it.", "Cycle fuel instead of leaving utility active without pressure.", "Keep one denial tool available when the spike is planted."],
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
        "Repeated identical setups become scoutable, even when the first version worked.",
        "Early deaths usually mean the anchor is over-peeking instead of making attackers clear utility.",
        "Camera and trip information should confirm the lurk before more utility is committed."
      ],
      signature: ["Rotate at least one setup element between gun rounds.", "Play where contact with a trip can be punished.", "Keep camera information connected to a teammate's decision."],
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
        "Anchor utility is strongest when it delays a real chokepoint the enemy must cross.",
        "Resurrection value depends on a recoverable body and a round the team can still win.",
        "Surviving into the mid round preserves heal, wall, and resurrection options."
      ],
      signature: ["Wall for a clear timing or space objective.", "Slow the lane teammates are prepared to contest.", "Check the recovery plan before starting a resurrection."],
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
    jett: { pickRate: 29.6, pickRateDelta: -0.1, maps: ["Breeze"], mapWinRates: { Breeze: 49.58 } },
    sova: { pickRate: 15.3, pickRateDelta: 3.5, maps: ["Breeze"], mapWinRates: { Breeze: 50.04 } },
    omen: { pickRate: 9.6, pickRateDelta: 0, maps: ["Split"], mapWinRates: { Split: 46.33 } },
    viper: { pickRate: 0.9, pickRateDelta: -0.2, maps: ["Breeze"], mapWinRates: { Breeze: 49.71 } },
    cypher: { pickRate: 6.4, pickRateDelta: 0, maps: ["Split"], mapWinRates: { Split: 49.79 } },
    sage: { pickRate: 3.6, pickRateDelta: -0.4, maps: ["Split"], mapWinRates: { Split: 51.38 } },
    raze: { pickRate: 5.4, pickRateDelta: -0.1, maps: ["Split"], mapWinRates: { Split: 49.82 } }
  };
  const currentAgents = agents.map(agent => ({ ...agent, ...(currentAgentRates[agent.id] || {}) }));

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

  const currentWeaponUsage = {
    vandal: 37.6, phantom: 21.2, operator: 5.8, outlaw: 2.4, marshal: 4.1,
    guardian: 3.1, bulldog: 3.5, spectre: 5.9, stinger: 2.8, judge: 2.2,
    bucky: 1.1, shorty: 1.5, classic: 4.8, frenzy: 1.9, ghost: 8.1, sheriff: 5.7
  };
  Object.entries(currentWeaponUsage).forEach(([id, pickRate]) => {
    if (weaponCatalog[id]) weaponCatalog[id].pickRate = pickRate;
  });

  const weapons = [
    { id: "rifles", label: "Rifles", examples: "Vandal, Phantom", range: "Mid-range default", weaponIds: ["vandal", "phantom"], fundamentals: ["Adjust headshot expectations to rifle rounds, not every weapon combined.", "Tap or burst once recoil leaves the first controlled shots.", "Repeated close-range losses to SMGs often point to positioning, not rifle weakness."], economy: ["Buy rifle, armor, and required utility as one loadout decision.", "Do not split from a coordinated team buy just to preserve a comfort rifle."] },
    { id: "precision", label: "Light Rifles", examples: "Guardian, Bulldog", range: "Mid to long range", weaponIds: ["guardian", "bulldog"], fundamentals: ["Guardian and Bulldog punish full-auto habits copied from Vandal or Phantom.", "Let the burst or single-shot reset before the next commitment.", "Use the cleaner first-shot profile to hold narrow head-level lanes."], economy: ["Treat these as deliberate economy choices, not failed rifle buys.", "Keep enough credits for armor and utility instead of forcing the most expensive gun available."] },
    { id: "snipers", label: "Snipers", examples: "Operator, Outlaw, Marshal", range: "Long sightlines", weaponIds: ["operator", "outlaw", "marshal"], fundamentals: ["Multiple shots per kill can reveal a first-shot or pre-aim gap.", "Deaths while scoped often point to weak off-angle awareness or no escape plan.", "Defensive holds and aggressive opening picks need different expectations."], economy: ["Operator rounds need team economy support.", "Marshal or Outlaw can preserve pressure in lighter buy rounds without breaking the next full buy."] },
    { id: "smgs", label: "SMGs", examples: "Spectre, Stinger", range: "Close-range pressure", weaponIds: ["spectre", "stinger"], fundamentals: ["SMGs are expected in eco and light-buy rounds.", "Close distance before committing instead of testing rifles at their preferred range.", "Movement and target transfer matter more than chasing rifle-like headshot numbers."], economy: ["Use the lower cost to keep armor and utility.", "Plan the path to recover an enemy rifle after the first conversion kill."] },
    { id: "shotguns", label: "Shotguns", examples: "Judge, Bucky, Shorty", range: "Close-range only", weaponIds: ["judge", "bucky", "shorty"], fundamentals: ["High opening kills and high opening deaths together usually mean the position is powerful but overcommitted.", "Long-sightline losses are weapon misuse, not proof the shotgun is weak.", "Primary and alternate fire serve different distances."], economy: ["Choose a position that protects the weapon's range before buying it.", "Have a route to upgrade from a dropped rifle after contact."] },
    { id: "sidearms", label: "Sidearms", examples: "Classic, Frenzy, Ghost, Sheriff", range: "Pistol and save rounds", weaponIds: ["classic", "frenzy", "ghost", "sheriff"], fundamentals: ["Pistol-round accuracy is a separate skill from rifle spray control.", "Sheriff and Ghost reward tap discipline.", "Frenzy should not be stretched into long-range fights."], economy: ["Benchmark pistol rounds separately from full buys.", "A sidearm upgrade should support the expected engagement, not simply spend leftover credits."] }
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
