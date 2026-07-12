(function () {
  "use strict";

  const agents = [
    {
      id: "jett", label: "Jett", role: "Duelist", maps: ["Breeze", "Haven"],
      fundamentals: [
        "Judge first deaths by whether the dash created usable space, not by the death alone.",
        "Opening fights are part of the job. Passive rounds should be the exception, not the default.",
        "A death that is traded and converts the site can still be correct duelist value."
      ],
      signature: ["Clear the dash route before committing.", "Pair entry timing with initiator utility.", "Reposition after the first Operator shot instead of repeating the angle."]
    },
    {
      id: "sova", label: "Sova", role: "Initiator", maps: ["Breeze", "Haven"],
      fundamentals: [
        "Recon only creates value when the team is ready to act on the reveal.",
        "Utility that lands after the duelist has already fought is a timing gap, not an aim gap.",
        "Track reveal-to-kill conversion instead of treating every scan as equally useful."
      ],
      signature: ["Call the scan timing before firing it.", "Use the drone to clear the route the entry will actually take.", "Save shock utility for confirmed damage or post-plant denial."]
    },
    {
      id: "omen", label: "Omen", role: "Controller", maps: ["Split", "Haven"],
      fundamentals: [
        "Smoke the team's real execute, not the site named during freeze time if the plan changes.",
        "Smokes expiring before contact point to a timing gap.",
        "Controller value includes surviving long enough to refresh utility and shape the late round."
      ],
      signature: ["Place smokes to remove named defender positions.", "Paranoia through the path teammates are ready to swing.", "Use teleports to break crosshair placement, not as unsupported coin flips."]
    },
    {
      id: "viper", label: "Viper", role: "Controller", maps: ["Breeze", "Bind"],
      fundamentals: [
        "A wall or orb should isolate a specific chokepoint rather than act as a generic visual block.",
        "Zone-control utility should support the actual site take or retake nearby.",
        "Late-round fuel management matters as much as the opening setup."
      ],
      signature: ["Name what the wall removes before placing it.", "Cycle fuel instead of leaving utility active without pressure.", "Keep one denial tool available when the spike is planted."]
    },
    {
      id: "cypher", label: "Cypher", role: "Sentinel", maps: ["Bind", "Split"],
      fundamentals: [
        "Repeated identical setups become scoutable, even when the first version worked.",
        "Early deaths usually mean the anchor is over-peeking instead of making attackers clear utility.",
        "Camera and trip information should confirm the lurk before more utility is committed."
      ],
      signature: ["Rotate at least one setup element between gun rounds.", "Play where contact with a trip can be punished.", "Keep camera information connected to a teammate's decision."]
    },
    {
      id: "sage", label: "Sage", role: "Sentinel", maps: ["Bind", "Split"],
      fundamentals: [
        "Anchor utility is strongest when it delays a real chokepoint the enemy must cross.",
        "Resurrection value depends on a recoverable body and a round the team can still win.",
        "Surviving into the mid round preserves heal, wall, and resurrection options."
      ],
      signature: ["Wall for a clear timing or space objective.", "Slow the lane teammates are prepared to contest.", "Check the recovery plan before starting a resurrection."]
    }
  ];

  const weapons = [
    {
      id: "rifles", label: "Rifles", examples: "Vandal, Phantom", range: "Mid-range default",
      fundamentals: ["Adjust headshot expectations to rifle rounds, not every weapon combined.", "Tap or burst once recoil leaves the first controlled shots.", "Repeated close-range losses to SMGs often point to positioning, not rifle weakness."],
      economy: ["Buy rifle, armor, and required utility as one loadout decision.", "Do not split from a coordinated team buy just to preserve a comfort rifle."]
    },
    {
      id: "precision", label: "Precision Rifles", examples: "Guardian, Bulldog", range: "Mid to long range",
      fundamentals: ["Guardian and Bulldog punish full-auto habits copied from Vandal or Phantom.", "Let the burst reset before taking the next shot.", "Use the cleaner first-shot profile to hold narrow head-level lanes."],
      economy: ["Treat these as deliberate economy choices, not failed rifle buys.", "Keep enough credits for armor and utility instead of forcing the most expensive gun available."]
    },
    {
      id: "snipers", label: "Snipers", examples: "Operator, Outlaw, Marshal", range: "Long sightlines",
      fundamentals: ["Multiple shots per kill can reveal a first-shot or pre-aim gap.", "Deaths while scoped often point to weak off-angle awareness or no escape plan.", "Defensive holds and aggressive opening picks need different expectations."],
      economy: ["Operator rounds need team economy support.", "Marshal or Outlaw can preserve pressure in lighter buy rounds without breaking the next full buy."]
    },
    {
      id: "smgs", label: "SMGs", examples: "Spectre, Stinger", range: "Close-range pressure",
      fundamentals: ["SMGs are expected in eco and light-buy rounds.", "Close distance before committing instead of testing rifles at their preferred range.", "Movement and target transfer matter more than chasing rifle-like headshot numbers."],
      economy: ["Use the lower cost to keep armor and utility.", "Plan the path to recover an enemy rifle after the first conversion kill."]
    },
    {
      id: "shotguns", label: "Shotguns", examples: "Judge, Bucky, Shorty", range: "Close-range only",
      fundamentals: ["High opening kills and high opening deaths together usually mean the position is powerful but overcommitted.", "Long-sightline losses are weapon misuse, not proof the shotgun is weak.", "Primary and alternate fire serve different distances."],
      economy: ["Choose a position that protects the weapon's range before buying it.", "Have a route to upgrade from a dropped rifle after contact."]
    },
    {
      id: "sidearms", label: "Sidearms", examples: "Classic, Ghost, Sheriff, Frenzy", range: "Pistol and save rounds",
      fundamentals: ["Pistol-round accuracy is a separate skill from rifle spray control.", "Sheriff and Ghost reward tap-and-strafe discipline.", "Frenzy and Shorty should not be stretched into long-range fights."],
      economy: ["Benchmark pistol rounds separately from full buys.", "A sidearm upgrade should support the expected engagement, not simply spend leftover credits."]
    }
  ];

  const warmupDetails = {
    "weapon-choice": ["Choose one weapon for the session.", "Set the range where that weapon should win.", "Keep every drill on the same weapon so the reps transfer together."],
    "burst-peeking": ["Start behind cover with the crosshair at head height.", "Counter-strafe into a two-to-four-shot burst.", "Return to cover and wait for recoil to reset before repeating."],
    "burst-peeking-strafe": ["Burst from a stopped position.", "Move off the expected return shot immediately.", "Stop cleanly before the next burst instead of firing while drifting."],
    "tap-fire-rhythm": ["Place the first shot at head height.", "Wait until recoil fully settles.", "Repeat at a steady rhythm without speeding up after a miss."],
    "easy-bots-flicking": ["Begin centered between targets.", "Move in one smooth line to the head.", "Confirm the stop before clicking; accuracy is the goal, not score."],
    "medium-bots-flicking": ["Keep the same smooth path used on Easy.", "Raise speed only after the crosshair stops cleanly.", "Reset your hand after every miss instead of panic-flicking."],
    "hard-bots-flicking": ["Use one controlled attempt per target.", "Accept misses without adding a correction spray.", "Track clean first-shot confirms rather than chasing the scoreboard."],
    "head-tracking": ["Place the crosshair on a moving bot's head.", "Track without firing for a short count.", "Shoot only after the crosshair stays attached through the movement."],
    "head-tracking-strafe": ["Track while you strafe with the target.", "Counter-strafe to a full stop.", "Take the shot only after both movement and crosshair are settled."],
    "drone-target-switching": ["Pick a clear target order before starting.", "Travel in one controlled line between drones.", "Confirm each target before switching instead of sweeping past it."],
    "spray-control-dummy": ["Start the spray at upper chest or head height.", "Pull through the pattern while holding one target.", "Release, fully reset recoil, and repeat without dragging between dummies."]
  };

  globalThis.RankedCoachGamesenseReference = Object.freeze({ agents, weapons, warmupDetails });
})();
