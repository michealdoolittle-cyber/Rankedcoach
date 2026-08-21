// Static gameplay reference reviewed 2026-07-17. Agent and weapon history is
// sourced from Riot patch notes. Aggregate Competitive rates are injected by
// the separately generated, source-audited VStats reference at runtime.
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

  function ability(id, name, slot, agent, summary, stats, purpose, setup, video = null) {
    return { id, name, slot, icon: agentAsset(agent, id), summary, stats, purpose, setup, video };
  }
  const riotAbilityVideo = (src, title) => ({ provider: "riot", src, title, source: "https://playvalorant.com/en-us/agents/" });

  const agents = [
    {
      id: "jett", label: "Jett", role: "Duelist", maps: ["Breeze", "Haven"],
      icon: agentAsset("jett", "icon"), portrait: agentAsset("jett", "portrait"),
      fundamentals: [
        "Tailwind is Jett’s license to take aggressive Operator fights. Pre-activate dash, hold the angle, shoot, then leave before the trade arrives. If dash is not ready, you are just another immobile Op.",
        "Cloudburst is a tempo tool, not a controller smoke. Use it to break one angle long enough to dash, cross, or isolate a fight. It buys seconds, not space. Be ready to clear the next angle immediately.",
        "Blade Storm stays accurate while you move and jump. Use Updraft to break head-level crosshair placement and take fights from angles defenders are not holding. Pick your landing spot before you go up. If you float into the open with no exit, you donated the round."
      ],
      patchHistory: [
        patchNote("4.08", "Tailwind changed to a primed dash: after a 0.75-second delay, Jett received a 12-second window to use it."),
        patchNote("7.04", "Tailwind's window fell to 7.5 seconds with a 1-second windup; Cloudburst fell to 2.5 seconds, Updraft to one charge, and Blade Storm rose to 8 points.")
      ],
      abilities: [
        ability("updraft", "Updraft", "Q - Basic", "jett", "Instant vertical movement that changes elevation before or during a fight.", { Cost: "150 credits", Charges: "1", Recharge: "No", Damage: "None" }, "Use Updraft to take unexpected high angles, get over vertical utility, or pair it with Blade Storm to fight from spots enemies aren’t ready for.", "Updraft only when you know where you’re landing. The re-equip delay makes floating in the open easy to punish, so don’t take unsupported airtime.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4cbc968f05713579aae9464c5a16dc3f6863f943.mp4?accountingTag=VAL", "Jett Updraft ability demo")),
        ability("tailwind", "Tailwind", "E - Signature", "jett", "Instant movement that propels Jett in her current movement direction or forward while stationary.", { Cost: "Free", Charges: "1", Recharge: "After 2 kills", Damage: "None" }, "Use Tailwind to burst into site and take space, or to dash out safely after an Operator shot or opening duel.", "Set your dash before you swing, and know exactly where you’re ending up. Tailwind should carry you behind cover or into a planned Cloudburst, not leave you exposed in the open.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ec6b3cf1f8ac09d597b0193de1d7bb81335b40e4.mp4?accountingTag=VAL", "Jett Tailwind ability demo")),
        ability("cloudburst", "Cloudburst", "C - Basic", "jett", "A steerable vision-blocking cloud for a very short crossing window.", { Cost: "200 credits", Charges: "2", Duration: "2.5 seconds", Damage: "None" }, "Use Cloudburst to cut one sightline just long enough to dash, cross safely, isolate a fight, or grab the spike.", "You can set up small one-ways with Cloudburst, but they disappear fast. Treat them as a quick duel setup to swing off, not as real controller-style cover.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/3353597819f0c032d56ff947d9762368b4ee6c6b.mp4?accountingTag=VAL", "Jett Cloudburst ability demo")),
        ability("blade-storm", "Blade Storm", "X - Ultimate", "jett", "Equip five accurate knives; single-fire kills restore knives while alternate fire shotguns the remaining knives in one spread.", { Cost: "8 ultimate points", Ammo: "5 knives", Damage: "50 body / 150 head", Falloff: "No single-fire falloff" }, "Use Blade Storm to save your economy, take accurate fights while moving, and turn Jett’s vertical movement into real kill pressure with a weapon that stays precise.", "Use single-fire when you want clean picks and reliable knife resets. Save the right-click for close-range commits only — if it gets the kill, you do not get knives back.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/667770571300e065b332617e5c8f2e009ed88928.mp4?accountingTag=VAL", "Jett Blade Storm ability demo"))
      ]
    },
    {
      id: "sova", label: "Sova", role: "Initiator", maps: ["Breeze", "Haven"],
      icon: agentAsset("sova", "icon"), portrait: agentAsset("sova", "portrait"),
      fundamentals: [
        "Your Recon Bolt is strongest when breaking it costs space or exposes a defender. Don’t fire it as background noise. Call the scan before it lands, then have your entry take ground on the first reveal.",
        "Owl Drone is your safest first contact. Use it to clear the lane your entry is about to take, not random deep space. Launch it close enough that your team can swing off the tag or the spotted player. A drone that finds contact with nobody ready to trade is wasted utility.",
        "Sova converts info into damage. Don’t throw Shock Bolts or Hunter’s Fury at guesses. Use them when a dart scan, drone tag, plant sound, defuse tap, or teammate call gives you a real target. Info first. Damage second."
      ],
      patchHistory: [
        patchNote("4.08", "Owl Drone duration fell from 10 to 7 seconds and health from 125 to 100; its dart dropped from three reveal pings to two, while Shock Bolt max damage fell to 75."),
        patchNote("13.00", "Sova's signature cooldown was reduced from 60 to 50 seconds, restoring more late-round Recon Bolt opportunities.")
      ],
      abilities: [
        ability("owl-drone", "Owl Drone", "C - Basic", "sova", "A controllable drone that clears close space and can tag an enemy for repeated reveals.", { Cost: "400 credits", Charges: "1", Duration: "About 10 seconds", Damage: "None" }, "Use Owl Drone to clear the exact path your entry wants to take. Make defenders either shoot it and reveal themselves, or back off and give up space.", "Launch Owl Drone from close enough that your team can swing behind it. If you send it on a long solo flight with no one ready to follow, you burn the reveal window for nothing.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6c6f036376c18ddf4ed0c589b506b8889d86a29a.mp4?accountingTag=VAL", "Sova Owl Drone ability demo")),
        ability("shock-bolt", "Shock Bolt", "Q - Basic", "sova", "A charged, bouncing explosive arrow with damage that falls away from the blast center.", { Cost: "150 credits each", Charges: "2", Damage: "Up to 75", Falloff: "Scales down from center" }, "Use Shock Bolt to finish tagged enemies, break utility, punish plant attempts, and push players out of cover.", "Go for full damage only when you can place the bolt near the center of the target. If it lands on the edge, treat it as chip damage or pressure, not a guaranteed kill.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/7776fa677e90c72da94ec7d188d2d4618116c41b.mp4?accountingTag=VAL", "Sova Shock Bolt ability demo")),
        ability("recon-bolt", "Recon Bolt", "E - Signature", "sova", "A destructible scan arrow that reveals enemies in line of sight.", { Cost: "Free", Charges: "1", Recharge: "Cooldown", Damage: "None" }, "Use Recon Bolt to confirm which lanes are occupied and force defenders to look away from the entry fight to break the dart.", "Put Recon where the scan covers the fight, but defenders have to swing into danger if they want to break it.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/50f9d870fa2a9b9ba38408eb718ffc06879c11a8.mp4?accountingTag=VAL", "Sova Recon Bolt ability demo")),
        ability("hunter-s-fury", "Hunter's Fury", "X - Ultimate", "sova", "Three long wall-piercing blasts that damage and reveal enemies caught in the beam.", { Cost: "8 ultimate points", Charges: "3 blasts", Damage: "80 per blast", Falloff: "None through terrain" }, "Use Hunter’s Fury to convert recon or a Drone tag into kills, stop a plant or defuse, and punish grouped rotations.", "Track the target between shots and adjust each blast. If you keep firing all three at the same spot, they’ll read it and dodge the rest.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df9ce34c3d2a7f527929cac123501e1473e0da0e.mp4?accountingTag=VAL", "Sova Hunter's Fury ability demo"))
      ]
    },
    {
      id: "omen", label: "Omen", role: "Controller", maps: ["Split", "Haven"],
      icon: agentAsset("omen", "icon"), portrait: agentAsset("omen", "portrait"),
      fundamentals: [
        "Dark Cover recharges. That makes your life valuable after the first execute. Smoke the early choke or cross, then stay alive long enough to smoke the retake, late lurk, or plant pressure. Dead Omen is one smoke cycle and nothing else.",
        "Paranoia ignores walls, but it still ruins teammates. Call the line before you throw it. Send it through the defender lane, not through your entry’s face, then swing while the nearsight is active.",
        "Omen teleports are pressure tools before they are kill tools. Use Shrouded Step when smokes, contact, or utility hide the landing. Ult to force rotations, steal space, recover spike, or make defenders check the wrong place. A teleport into silence is a free death."
      ],
      patchHistory: [
        patchNote("4.04", "Dark Cover cooldown fell from 40 to 30 seconds and projectile speed rose from 2800 to 6400; Shrouded Step became cheaper and faster to complete."),
        patchNote("13.00", "Enemy-facing Shrouded Step audio was updated to make nearby teleports easier to parse during chaotic fights.")
      ],
      abilities: [
        ability("shrouded-step", "Shrouded Step", "C - Basic", "omen", "A short targeted teleport after a brief channel.", { Cost: "100 credits", Charges: "2", Recharge: "No", Damage: "None" }, "Use Shrouded Step to take elevation, slip out of utility, cross a held gap, or reposition after you’ve pulled attention somewhere else.", "Mask the Shrouded Step audio when you can, or make enemies choose between multiple possible landing spots. Don’t dry TP across open ground unless you’re willing to gamble.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/33550fee410c5a55ea8832f41827a12aaddb686f.mp4?accountingTag=VAL", "Omen Shrouded Step ability demo")),
        ability("paranoia", "Paranoia", "Q - Basic", "omen", "A shadow-phase projectile that Nearsights and Deafens everyone it touches while passing through terrain and objects.", { Cost: "250 credits", Charges: "1", Debuff: "About 2 seconds", Damage: "None" }, "Use Paranoia to set up a coordinated swing through a tight lane, or to blind a defender tucked behind cover so your team can clear them safely.", "Call your Paranoia path before you throw it. It can blind teammates, so aim it just beside their entry route instead of sending it straight through them.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f401fc788f3182b6d5aa25af6056c842117b1b36.mp4?accountingTag=VAL", "Omen Paranoia ability demo")),
        ability("dark-cover", "Dark Cover", "E - Signature", "omen", "A long-lasting spherical smoke placed through Omen's tactical targeting view.", { Cost: "1 free; extra charge 150", Charges: "2", Duration: "15 seconds", Recharge: "Cooldown" }, "Use Dark Cover to cut off key named angles, sell pressure across the map, and still have a smoke ready for the late round.", "You can make one-ways on ledges and boxes, but only if your placement is consistent. Don’t force a fragile trick smoke over a solid execute smoke that actually blocks the angle your team needs.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ba0b035a5ff2bb8d9487ba461b3d15900ff50f6b.mp4?accountingTag=VAL", "Omen Dark Cover ability demo")),
        ability("from-the-shadows", "From the Shadows", "X - Ultimate", "omen", "Teleport anywhere as a destructible Shade, with the option to cancel and return.", { Cost: "7 ultimate points", Range: "Map-wide", Damage: "None", Recharge: "No" }, "Use From the Shadows to grab the spike, pull defenders’ crosshairs, sell a fake, or turn info into a quick rotate.", "Pick a landing spot with cover and a clear reason behind it. Even a cancelled From the Shadows can get value if it makes the enemy leave a strong position.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/252cf8ad86b6aca6210ba93ea856f52708476eba.mp4?accountingTag=VAL", "Omen From the Shadows ability demo"))
      ]
    },
    {
      id: "viper", label: "Viper", role: "Controller", maps: ["Breeze", "Bind"],
      icon: agentAsset("viper", "icon"), portrait: agentAsset("viper", "portrait"),
      fundamentals: [
        "Toxic Screen and Poison Cloud share the same fuel bar. Do not leave them running for nothing. Activate them when your team is ready to cross, hit, retake, or defuse. Empty fuel before contact means you gave up your strongest pressure tool for free.",
        "Viper commits her setup before the round starts. Toxic Screen stays where you put it, and Poison Cloud is not a mid-round rotate tool. Place them for the space your team plans to take or deny. Bad pre-round utility leaves you playing Viper with half a kit.",
        "Snake Bite is a setup tool, not just a molly. The Vulnerable is the threat. Use it to make spam, swings, post-plant lineups, and teammate damage lethal faster. If nobody is ready to punish the target, you wasted most of the ability."
      ],
      patchHistory: [
        patchNote("3.00", "Snake Bite duration fell from 8 to 6.5 seconds and its price rose from 100 to 200 credits as Riot reduced Viper's stall time."),
        patchNote("8.08", "Smoke uptime fell to 12 seconds, minimum activation fuel rose to 30%, and Snake Bite moved to one 300-credit charge with a 6.5-second duration.")
      ],
      abilities: [
        ability("snake-bite", "Snake Bite", "C - Basic", "viper", "A lingering chemical zone that damages and applies Vulnerable.", { Cost: "300 credits", Charges: "1", Duration: "6.5 seconds", Damage: "Damage over time" }, "Use Snake Bite to clear tight corners, delay plants or defuses, and make any follow-up damage from you or a teammate hit harder with Vulnerable.", "Snake Bite only gets real value if they’re forced to sit in it. Use it on a choke, through your smoke, after a stun, or off confirmed spike timing so they can’t just step out for free.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9eeb3090efed080792e6ea2f264fd60ebb12694e.mp4?accountingTag=VAL", "Viper Snake Bite ability demo")),
        ability("poison-cloud", "Poison Cloud", "Q - Basic", "viper", "A reusable fuel-powered smoke orb that applies Decay to enemies inside.", { Cost: "200 credits", Charges: "1", Uptime: "Up to 12 seconds on full solo fuel", Reactivation: "5-second delay" }, "Use Poison Cloud to keep re-smoking a choke and create strong one-way fights from stable ledges.", "One-ways are one of Poison Cloud’s biggest strengths, but don’t freestyle the throw. Use a repeatable lineup, because if the orb lands wrong after Buy Phase, that setup is usually gone for the round.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/49ff8efd75b76941da3018362061275d3a1d43d6.mp4?accountingTag=VAL", "Viper Poison Cloud ability demo")),
        ability("toxic-screen", "Toxic Screen", "E - Signature", "viper", "A permanent emitter line that raises a fuel-powered wall and Decays enemies crossing it.", { Cost: "Free", Charges: "1", Uptime: "Up to 12 seconds on full solo fuel", Reactivation: "5-second delay" }, "Use Toxic Screen to cut sites in half, block multiple crossing lanes at once, and decide when defenders get vision back.", "Commit the wall to your round plan before you place it. Toxic Screen emitters can’t be moved, so a wall that helps on the retake can also block or hurt your team later if the round shifts.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/36db8f44946850c2a20aba43d8ad3ecd977c7d7e.mp4?accountingTag=VAL", "Viper Toxic Screen ability demo")),
        ability("viper-s-pit", "Viper's Pit", "X - Ultimate", "viper", "A large persistent cloud that Nearsights and Decays enemies while Viper maintains it.", { Cost: "9 ultimate points", Duration: "Persistent while maintained", Damage: "Decay, not direct damage", Recharge: "No" }, "Use Viper’s Pit to lock down the planted spike or a key zone, forcing enemies to push into close-range, low-info fights on your terms.", "Play the Pit from a few safe pockets instead of camping one spot. If you keep using the same hide, attackers will pre-aim it and turn your ult into a single predictable duel.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4601fd972c588a79cdd910b2497546f156886c40.mp4?accountingTag=VAL", "Viper's Pit ability demo"))
      ]
    },
    {
      id: "cypher", label: "Cypher", role: "Sentinel", maps: ["Bind", "Split"],
      icon: agentAsset("cypher", "icon"), portrait: agentAsset("cypher", "portrait"),
      fundamentals: [
        "Trapwire is only scary when you can punish it. Put trips where breaking or triggering them exposes the enemy to your angle, cage, or teammate. A trip that gets cleared for free is just early warning, not site control.",
        "Cyber Cage is not just a smoke. It is a tripwire for timing. When an enemy crosses it, you get the audio cue. Swing on that sound, reposition, or leave before the trade arrives.",
        "Cypher punishes patterns, but he also becomes one if you repeat setups. Change cam spots, trip heights, and trap timing between gun rounds. If the enemy learned your default, make their clear useless next round."
      ],
      patchHistory: [
        patchNote("11.08", "Trapwire windup fell to 0.9 seconds, stopped concussing, and instead applied a 50% slow plus a one-second reveal; Spycam gained clearer proximity audio and stealth rules."),
        patchNote("13.00", "Trapwire windup was reduced again, from 0.9 to 0.7 seconds, improving Cypher's anchor conversion window.")
      ],
      abilities: [
        ability("trapwire", "Trapwire", "C - Basic", "cypher", "A covert line that catches, Slows, and Reveals an enemy who does not break it in time.", { Cost: "200 credits each", Charges: "2", Windup: "0.9 seconds on PC", Damage: "No meaningful direct damage" }, "Use Trapwire to cover a flank, slow an entry, or force a clean timing for a wallbang or swing.", "Vary the height and anchor points of your Trapwires. A trip does very little if attackers can break it from safety without swinging into danger.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/aab21b75eb43f0e8cc9c0b816cb4877ae868b9fd.mp4?accountingTag=VAL", "Cypher Trapwire ability demo")),
        ability("cyber-cage", "Cyber Cage", "Q - Basic", "cypher", "A remote vision-blocking cage that gives an audio cue when enemies pass through.", { Cost: "100 credits each", Charges: "2", Duration: "About 7 seconds", Damage: "None" }, "Use Cyber Cage to cut vision, isolate a choke, or bait a reaction with the crossing audio so you can swing on your timing.", "Use one-way cages on ledges where the enemy’s feet show consistently before they can see you. Check the cage height from both sides in a custom so you know exactly what they see and what you can punish.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/54a8dfaa9b82c7aaf994b0432bb25ef1e95c985c.mp4?accountingTag=VAL", "Cypher Cyber Cage ability demo")),
        ability("spycam", "Spycam", "E - Signature", "cypher", "A controllable camera that can fire a tracking dart and be picked up for redeployment.", { Cost: "Free", Charges: "1", Recharge: "Cooldown if destroyed", Damage: "None" }, "Use Spycam to confirm the hit, watch rotations, and make enemies look away from the fight to clear or break it.", "Place Spycam where it answers a specific question: is someone crossing, clearing, planting, or pushing? A hidden cam staring at a wall is still zero info.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/825ba0643c74ad583350d1eb562bb7650ad78ae0.mp4?accountingTag=VAL", "Cypher Spycam ability demo")),
        ability("neural-theft", "Neural Theft", "X - Ultimate", "cypher", "Use a recent enemy corpse to reveal every living opponent twice.", { Cost: "7 ultimate points", Pulses: "2 reveals", Damage: "None", Requirement: "Recent enemy corpse" }, "Use Neural Theft to call rotations, catch lurkers, and time your swing between reveal pulses.", "Call out the enemy position that changes the plan. Use the second ping to catch players who instantly rotate or tuck after the first reveal.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ddeaad5ff2e4865351755b71fdc4fc97339fb334.mp4?accountingTag=VAL", "Cypher Neural Theft ability demo"))
      ]
    },
    {
      id: "sage", label: "Sage", role: "Sentinel", maps: ["Bind", "Split"],
      icon: agentAsset("sage", "icon"), portrait: agentAsset("sage", "portrait"),
      fundamentals: [
        "Barrier Orb changes the map for a few seconds. Use it to block a choke, protect a plant or defuse, or create a boosted angle they are forced to clear. Do not waste it as decoration. Make it deny space or win time.",
        "Use Slow Orb to break timing, not decorate a choke. Land it where enemies still have to cross. Then call spam, damage utility, or a swing while their movement is slowed and their path is committed.",
        "Sage gets more valuable the longer she lives. Do not be first contact unless the round demands it. Play close enough to trade and heal, but far enough back that you are not the first body lost. Resurrection is only worth it if you can secure the corpse and survive the cast."
      ],
      patchHistory: [
        patchNote("11.08", "Barrier Orb cost fell from 400 to 300 and fortified after 2 seconds, while fortified segment health fell from 800 to 600."),
        patchNote("13.00", "Healing Orb's self-heal-over-time increased from 50 to 100, restoring more of Sage's personal sustain.")
      ],
      abilities: [
        ability("barrier-orb", "Barrier Orb", "C - Basic", "sage", "A four-segment wall that fortifies after deployment and blocks movement and bullets.", { Cost: "300 credits", Charges: "1", Duration: "40 seconds", Health: "600 per fortified segment" }, "Use Barrier Orb to stall a choke, make a plant safer, change the angle of a fight, or boost a teammate into an off-angle.", "You can use Barrier Orb for off-angle walls, but don’t leave extra pieces exposed for attackers to farm safely. Place it with a clear purpose: either to set up one specific fight or to buy a timing window.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a79b1d6838cee5572b428babd74a2db0c07f4ea5.mp4?accountingTag=VAL", "Sage Barrier Orb ability demo")),
        ability("slow-orb", "Slow Orb", "Q - Basic", "sage", "A lingering field that slows movement and reduces dash speed.", { Cost: "200 credits each", Charges: "2", Duration: "7 seconds", Damage: "None" }, "Use Slow Orb to stall fast hits, trap attackers in damage utility, and make retake swings easier to sync.", "Throw Slow Orb where they still have to cross, not where they already moved through. Stack the second slow only when those extra seconds actually change the round.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/45053483528b96cbe003ac39e6b53c9866d5fea6.mp4?accountingTag=VAL", "Sage Slow Orb ability demo")),
        ability("healing-orb", "Healing Orb", "E - Signature", "sage", "A heal-over-time for an ally or a weaker self-heal for Sage.", { Cost: "Free", Charges: "1", Recharge: "Cooldown", Damage: "None" }, "Use Healing Orb to get a teammate back into fighting shape so they can take the next real duel, while squeezing more value out of the armor they still have.", "Don’t swing or cross an open lane just to get a heal off. First ask if that teammate can safely rejoin the fight after the heal; if not, don’t risk your life for it.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a247d196383136d3de15b4d6d9c816e3c8054ba0.mp4?accountingTag=VAL", "Sage Healing Orb ability demo")),
        ability("resurrection", "Resurrection", "X - Ultimate", "sage", "Revive a dead ally after a vulnerable channel and return them at full health.", { Cost: "7 ultimate points", Charges: "1", Health: "Full health", Damage: "None" }, "Use Resurrection to bring back a key gun, even up the numbers, or force defenders to fight over the body.", "Before you Res, clear around the body and call the revived player’s exit first. If they stand up into a trade with nowhere to go, you’ve spent the ult without actually bringing pressure back.", riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df83929ed5da349c37a5bf4600c2b55010c72402.mp4?accountingTag=VAL", "Sage Resurrection ability demo"))
      ]
    },
    {
      id: "raze", label: "Raze", role: "Duelist", maps: ["Lotus", "Split", "Sunset"],
      icon: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
      portrait: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/fullportrait.png",
      fundamentals: [
        "Raze is built to break close angles before she enters. Send Boom Bot or Paint Shells into the corner first, then swing while the defender is moving, shooting utility, or giving up space.",
        "Blast Pack gets you into space faster than defenders can comfortably adjust. That only matters if the landing is protected. Fly behind a flash, through a smoke, or with teammates swinging your contact. Keep the second pack for the next gap or the escape. If you use both packs just to enter alone, you are donating a trade.",
        "Showstopper punishes trapped players, not guesses. Use it after contact or utility has boxed someone in, then rocket the path they have to cross. If they still have room to leave, you are spending an ult on a coin flip."
      ],
      patchHistory: [
        patchNote("12.02", "Boom Bot can now be concussed."),
        patchNote("11.08", "Slows now reduce Blast Pack movement while Raze is airborne.")
      ],
      abilities: [
        {
          id: "boom-bot",
          name: "Boom Bot",
          slot: "C - Basic",
          icon: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/grenade/displayicon.png",
          summary: "A ground bot that travels forward, bounces off walls, locks onto enemies in its frontal cone, and explodes if it reaches them.",
          stats: { Cost: "Buy-menu utility", Charges: "1", Damage: "Explosive on contact", Tracking: "Frontal cone" },
          purpose: "Use Boom Bot to clear close corners, make defenders reveal themselves by shooting it, and create a safer entry timing off the noise and pressure.",
          setup: "Send Boom Bot into the first close danger pocket your entry can’t safely face-check. As the defender dodges it or shoots it, swing with the timing and take the fight.",
          video: riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/c824fe8e08a4f36be2273aa456819d2c2b6cd6b0.mp4?accountingTag=VAL", "Raze Boom Bot ability demo")
        },
        {
          id: "blast-pack",
          name: "Blast Pack",
          slot: "Q - Basic",
          icon: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability1/displayicon.png",
          summary: "A sticky satchel that can be re-used after deployment to detonate, moving anything hit and dealing damage once armed.",
          stats: { Cost: "Buy-menu utility", Charges: "2", Damage: "Armed satchel damage", Movement: "Self-launching displacement" },
          purpose: "Use Blast Pack to take space fast, hit vertical routes, clear utility, or bounce out before the trade comes through after first contact.",
          setup: "Choose your landing spot before you satchel. Blast Pack only gets real value when you land somewhere with cover, or when your teammates are already pressuring the fight.",
          video: riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/82028c5e9ae38b59660dbf9f57f341f1c20c5480.mp4?accountingTag=VAL", "Raze Blast Pack ability demo")
        },
        {
          id: "paint-shells",
          name: "Paint Shells",
          slot: "E - Signature",
          icon: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability2/displayicon.png",
          summary: "A cluster grenade that bursts once, then creates smaller sub-munitions that damage anyone in their range.",
          stats: { Cost: "Signature utility", Recharge: "Resets after two kills", Damage: "Cluster explosive damage", AltFire: "Lob throw" },
          purpose: "Use Paint Shells to clear tight corners, stall a choke, punish players stuck in place, or force defenders out of cover before your team swings.",
          setup: "Throw Paint Shells at the spot defenders still have to hold, not the space they’ve already given up. It hits hardest when a teammate is ready to punish the route they’re forced to take out.",
          video: riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d75fd65435a84906bb3e8ad0b97c505e7359697b.mp4?accountingTag=VAL", "Raze Paint Shells ability demo")
        },
        {
          id: "showstopper",
          name: "Showstopper",
          slot: "X - Ultimate",
          icon: "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ultimate/displayicon.png",
          summary: "Equip a rocket launcher that fires a projectile with massive area damage on contact.",
          stats: { Cost: "Ultimate points", Charges: "1 rocket", Damage: "Massive area damage", Range: "Projectile travel" },
          purpose: "Use Showstopper to crack a stacked site, punish someone pinned in a bad spot, or force a retaker off the spike when the timer is running.",
          setup: "Before you pop Showstopper, cut down their exits with utility, contact, or teammate pressure. Aim the rocket at the lane they’re forced to cross, not a random corner you’re hoping they’re tucked in.",
          video: riotAbilityVideo("https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/7281a34566f12d202dee3d43e0fa0bf0b4271d60.mp4?accountingTag=VAL", "Raze Showstopper ability demo")
        }
      ]
    }
  ];

  function weapon(id, label, cost, magazine, fireRate, penetration, damageRanges, focus) {
    return { id, label, image: weaponAsset(id), cost, magazine, fireRate, penetration, damageRanges, focus };
  }

  // No stale third-party sample is retained as a fallback. If the generated
  // aggregate is unavailable, the player-facing dossier explicitly shows no
  // verified usage sample instead of silently showing an old estimate.
  const currentAgentRates = {};
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
    return {
      ...agent,
      ...rates,
      lore: officialAgentLore[agent.id] || []
    };
  });

  const weaponCatalog = {
    vandal: weapon("vandal", "Vandal", 2900, 25, "9.75 rounds/sec", "Medium", [{ range: "0-50m", head: 160, body: 40, legs: 34 }], "The Vandal is built for first-bullet discipline. It kills with one headshot at any range, so stop spraying when the fight turns long. Take the clean tap, burst if you miss, then reset before the recoil takes over."),
    phantom: weapon("phantom", "Phantom", 2900, 30, "11 rounds/sec", "Medium", [{ range: "0-20m", head: 156, body: 39, legs: 33 }, { range: "20-50m", head: 140, body: 35, legs: 30 }], "Use the Phantom to force close and mid-range fights. It fires fast, sprays well, and its suppressed shots hide tracers through smokes. Abuse that on defense and in smoke spam. Do not ego long angles like you have a Vandal. Past close range, headshots stop being clean one-taps against armor."),
    bulldog: weapon("bulldog", "Bulldog", 2050, 24, "10 rounds/sec", "Medium", [{ range: "0-50m", head: 116, body: 35, legs: 30 }], "Treat the Bulldog as a mid-range rifle, not a cheap Vandal. ADS burst is the weapon’s edge: pre-aim, commit to clean 3-round bursts, and reset before the spray drifts. In close fights, stay full-auto and swing with intent. At long range, do not hold mouse1 and pray."),
    guardian: weapon("guardian", "Guardian", 2250, 12, "5.25 rounds/sec", "High", [{ range: "0-50m", head: 195, body: 65, legs: 49 }], "Treat the Guardian as a one-tap rifle, not a budget Vandal. Hold clean head-height lines, fire one deliberate shot, then reset or leave. Its high penetration is real value: punish common cover and smoke edges with controlled spam, not panic clicks."),
    operator: weapon("operator", "Operator", 4700, 5, "0.6 rounds/sec", "High", [{ range: "0-50m", head: 255, body: 150, legs: 120 }], "The Operator wins rounds by taking the first contact on your terms. Hold long sightlines, shoot once, then break line of sight. If you miss or stay exposed after the shot, the slow reset gets you traded and your team loses the most expensive gun in the round."),
    outlaw: weapon("outlaw", "Outlaw", 2400, 2, "2.75 rounds/sec", "High", [{ range: "0-50m", head: 238, body: 140, legs: 119 }], "Use the Outlaw to punish light armor and broken buys. A clean body shot deletes 125/140 HP targets, so your job is to read economy and take disciplined first contact. You only get two shots before a reload. Fire with a plan, reposition after contact, and stop holding like you have a rifle magazine."),
    marshal: weapon("marshal", "Marshal", 950, 5, "1.5 rounds/sec", "Medium", [{ range: "0-50m", head: 202, body: 101, legs: 86 }], "Use the Marshal to punish weak buys and force early damage from long sightlines. A body shot deletes no armor, and the price keeps your economy clean. Take the shot, move, and make them clear you again. If you sit scoped in the same lane, you turn a cheap advantage into a free trade."),
    ares: weapon("ares", "Ares", 1600, 50, "13 rounds/sec", "High", [{ range: "0-30m", head: 75, body: 30, legs: 25.5 }, { range: "30-50m", head: 70, body: 28, legs: 23.8 }], "Pick the Ares when you can shoot first and keep shooting. Spam smokes, tag through thin cover, and break rushes from anchored positions. Do not treat it like a rifle; its value is high penetration, a big magazine, and sustained fire after the ramp-up."),
    odin: weapon("odin", "Odin", 3200, 100, "12 rounds/sec", "High", [{ range: "0-30m", head: 95, body: 38, legs: 32.3 }, { range: "30-50m", head: 77.5, body: 31, legs: 26.35 }], "Use the Odin to deny space, not to take clean rifle duels. Pre-aim common lanes, spam high-pen walls, break utility, and keep firing when teams commit. The huge mag lets you punish grouped pushes and stall hits longer than any rifle."),
    spectre: weapon("spectre", "Spectre", 1600, 30, "13.33 rounds/sec", "Low", [{ range: "0-15m", head: 78, body: 26, legs: 22 }, { range: "15-30m", head: 66, body: 22, legs: 19 }, { range: "30-50m", head: 60, body: 20, legs: 17 }], "Spectre wins by denying clean rifle duels. Hold tight angles, swing off utility, and force fights where the first bullets decide the round. If the duel stretches to range, burst and reset or disengage. Your edge is mobility and close-range spray control, not standing still against a Vandal."),
    stinger: weapon("stinger", "Stinger", 1100, 20, "16 rounds/sec", "Low", [{ range: "0-15m", head: 68, body: 27, legs: 23 }, { range: "15-50m", head: 57, body: 23, legs: 19 }], "The Stinger is an eco tool for stealing close-range fights. Force enemies through tight space, swing before they can reset, and end the duel fast. Past close range, ADS burst or reposition. If you spray the whole mag into a rifle player, you already lost the value."),
    judge: weapon("judge", "Judge", 1850, 5, "3.5 rounds/sec", "Low", [{ range: "0-10m", head: 34, body: 17, legs: 14 }, { range: "10-15m", head: 20, body: 10, legs: 9 }, { range: "15-50m", head: 14, body: 7, legs: 6 }], "The Judge is a space trap, not a duel weapon. Play smokes, tight corners, and choke exits where the spread lands clean. Your first kill is the value. After that, reposition or steal a rifle before they clear you properly."),
    bucky: weapon("bucky", "Bucky", 850, 5, "1.1 rounds/sec", "Low", [{ range: "0-8m", head: 34, body: 17, legs: 14 }, { range: "8-12m", head: 26, body: 13, legs: 11 }, { range: "12-50m", head: 18, body: 9, legs: 8 }], "Bucky is not a fair-fight weapon. Force point-blank contact from a corner, smoke edge, or tight choke, and make the first shot count. If the kill does not happen, break line of sight immediately. The pump delay gets you traded for free."),
    shorty: weapon("shorty", "Shorty", 300, 2, "3 rounds/sec", "Low", [{ range: "0-7m", head: 22, body: 11, legs: 9 }, { range: "7-15m", head: 12, body: 6, legs: 5 }, { range: "15-50m", head: 6, body: 3, legs: 3 }], "Shorty is a point-blank ambush weapon, not a sidearm for fair fights. Play it in tight corners, force the enemy into pellet range, then leave with their rifle or get out. If you whiff or take space in the open, you are dead."),
    classic: weapon("classic", "Classic", 0, 12, "6.75 rounds/sec", "Low", [{ range: "0-30m", head: 78, body: 26, legs: 22 }, { range: "30-50m", head: 66, body: 22, legs: 19 }], "Classic is free, not weak. Take clean head taps at range and save the alt-fire for point-blank fights where the spread actually matters. Your job is to get damage, steal a close duel, and upgrade. Do not spam it like a Ghost."),
    frenzy: weapon("frenzy", "Frenzy", 450, 15, "10 rounds/sec", "Low", [{ range: "0-20m", head: 78, body: 26, legs: 22 }, { range: "20-50m", head: 63, body: 21, legs: 18 }], "Use the Frenzy to steal close space, not to take fair duels. It wins when you force contact inside its spray range, swing fast, and end the fight before the 13-round mag runs dry. If the fight is outside close range, close distance or leave it."),
    ghost: weapon("ghost", "Ghost", 500, 13, "6.75 rounds/sec", "Medium", [{ range: "0-30m", head: 105, body: 30, legs: 26 }, { range: "30-50m", head: 88, body: 25, legs: 21 }], "Ghost rewards clean first contact. Play for the head, fire in controlled taps, and abuse the suppressed shots to stay harder to locate. It wins pistol rounds by landing the first accurate bullet, not by panic dumping the magazine."),
    sheriff: weapon("sheriff", "Sheriff", 800, 6, "4 rounds/sec", "High", [{ range: "0-30m", head: 160, body: 55, legs: 47 }, { range: "30-50m", head: 145, body: 50, legs: 43 }], "Use the Sheriff for clean first-bullet fights, not spam duels. Inside 30m, one headshot kills armored targets. Past that, headshots leave them low, so be ready to finish. Stop before shooting, reset between shots, and take angles where one accurate bullet can steal the round." ),
    melee: {
      ...weapon("melee", "Melee", "Always equipped", "No magazine", "Swing timing", "Not applicable", [], "Melee is not a fighting plan. Use it for faster movement when you are safe, then get your gun out before the next angle. Knife kills are style points, not a reliable win condition."),
      image: "https://media.valorant-api.com/weapons/2f59173c-4bed-b6c3-2191-dea9b58be9c7/displayicon.png",
      libraryOnly: true,
      meleeDamage: [
        { label: "Light attack", damage: 50, condition: "Front or side contact", range: "Melee contact" },
        { label: "Light backstab", damage: 100, condition: "Behind the target", range: "Melee contact" },
        { label: "Heavy attack", damage: 75, condition: "Front or side contact", range: "Melee contact" },
        { label: "Heavy backstab", damage: 150, condition: "Behind the target", range: "Melee contact" }
      ],
      damageSource: "https://valorant.fandom.com/wiki/Melee"
    }
  };

  const weaponGuides = {
    vandal: {
      whenToUse: ["Buy the Vandal on full rifle rounds when you need one-tap threat at any range. It is strongest on long lanes and disciplined angle fights where first bullet accuracy decides the duel.", "Use the Vandal when your fights are about first-bullet accuracy: long angles, shoulder-peek punishes, and short bursts through common cover. It rewards headshots and control. If your plan is smoke spraying or extended close-range spraying, take a Phantom instead."],
      howToUse: ["The Vandal is strongest when you let accuracy reset. Take the first shot seriously, then fire short bursts instead of dragging the recoil. At long range, tap for the head. At mid range, burst and stop before the pattern climbs. Spray only in close fights where you can pull down and keep the target in the crosshair.", "The Vandal rewards clean first bullets and punishes panic sprays. Stop before you shoot, fire 1–3 bullets, then reset your aim and recoil before taking the next fight. If you strafe while firing or drag the spray too long, you give up the weapon’s biggest strength."],
      patchHistory: [patchNote("1.07", "Fire rate rose from 9.25 to 9.75 rounds per second and body damage rose from 39 to 40."), patchNote("6.11", "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 75 to 50."), patchNote("11.08", "Protected spray bullets rose from four to six while horizontal recoil timing was retuned.")]
    },
    phantom: {
      whenToUse: ["Use the Phantom when your fights are close or mid range. It melts faster there, hides tracers through smoke, and keeps your position harder to read while you spam. Avoid building your plan around long-range dry duels where the Vandal’s one-tap matters more.", "Pick Phantom when you are anchoring or expecting a grouped hit. The 30-round mag, higher fire rate, and clean spray transfers help you fight more than one player. It also punishes smoke pushes without giving away tracers. Avoid dry long-range duels where Vandal one-taps and Phantom falls off."],
      howToUse: ["Use the Phantom like a burst rifle past close range. Two to four bullets, reset, then re-peek or strafe. Inside 15m, commit to the spray if you start landing damage; the headshot kills full armor there, and the fire rate carries the fight.", "Respect the Phantom’s headshot falloff past 20 meters. If you’re taking a Vandal on a long open lane, close the gap or force a shorter fight first."],
      patchHistory: [patchNote("6.11", "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 90 to 60."), patchNote("11.08", "Protected spray bullets rose from six to eight and horizontal recoil timing was retuned to make close-to-mid sprays more controllable.")]
    },
    guardian: {
      whenToUse: ["Buy Guardian when you can take clean mid-to-long range fights and hold head-height angles. It rewards first-shot accuracy, one-tap headshots, and high-pen wallbangs. Do not buy it if you need to clear tight space with spray.", "Buy Guardian when a full rifle would cost you armor or key utility. It gives you real one-tap pressure at range for less money, but it demands clean first bullets. Take disciplined angles. Do not use it to force close-range spray fights."],
      howToUse: ["Use the Guardian like a rifle built for duels, not spraying. Hold head height, fire one deliberate shot, then correct before the next. If you mash the trigger, you turn its best strength into bloom and lose the fight.", "Play the Guardian on head-height lanes where the first shot decides the fight. Do not spray it like a Vandal. Its high penetration is valuable, but wallbang only off info or common defaults. Blind spam just gives away your position."],
      patchHistory: [patchNote("1.08", "Price fell from 2500 to 2400, fire rate rose from 4.75 to 5.25 rounds per second, and recovery improved."), patchNote("3.00", "Price fell again, from 2400 to 2250 credits."), patchNote("4.00", "The ADS fire-rate penalty was removed and one more shot was added before the recovery curve begins.")]
    },
    bulldog: {
      whenToUse: ["Buy Bulldog when Vandal or Phantom breaks your economy but you still need armor and utility. It gives you rifle-range fights without turning the next round into a hard save.", "Buy Bulldog when you need cheap rifle power for medium-range fights. ADS burst is the reason to pick it: hold the lane, take the first clean shot, then reset. If they close the gap, stop bursting and use full-auto."],
      howToUse: ["Use the Bulldog like a burst rifle at mid range. ADS, fire the 3-round burst, then let the reset finish before the next burst. If you spam it, the spread opens and the gun stops being cheap value.", "Treat the Bulldog as a burst rifle until the fight is close. ADS burst gives you the control that makes the gun dangerous at mid range. Hip-fire full auto is for close swings and panic trades, not for dragging sprays across a lane."],
      patchHistory: [patchNote("3.00", "Hip-fire rate rose from 9.15 to 9.5 rounds per second and price fell from 2100 to 2050."), patchNote("4.00", "Hip-fire rate rose to 10 and burst recovery improved from 0.4 to 0.35 seconds."), patchNote("11.08", "Horizontal recoil timing was lengthened from 0.37 to 0.6 seconds as rifle sprays were retuned.")]
    },
    operator: {
      whenToUse: ["Buy the Operator when your money is stable and you can take a long first-contact angle. It wins rounds by deleting the first player who swings, but it is a liability if dying with it wrecks your economy.", "Use the Operator when your agent can survive the first shot. Jett dash, Chamber teleport, Reyna dismiss, and similar exits let you take aggressive opening angles. Without an escape, anchor the angle from hard cover. Miss once in the open and you donate the most expensive gun in the game."],
      howToUse: ["The Operator wins the first contact and loses the cleanup if you get pinned. Hold every angle with a fallback ready. Shoot, break line of sight, then take a new angle. If you stay scoped in the same lane, utility and trade swings will remove your 4700-credit gun.", "Fire once, then change the fight. The Operator is built to win the first held angle, not take repeated dry peeks. After a miss or body shot, you are slow, loud, and stuck between shots. Fall back, reposition, or ask for utility before you show again."],
      patchHistory: [patchNote("1.09", "Price rose from 4500 to 5000 while scoped movement, fire rate, equip time, and jump-land accuracy were all reduced."), patchNote("3.00", "Price fell from 5000 to the current 4700 credits.")]
    },
    outlaw: {
      whenToUse: ["Buy Outlaw when the enemy economy points to light armor. A body shot deletes 125 HP, so half-buy rounds become free picks if you hold the first contact cleanly. Against full armor, treat it like a setup weapon: tag them, finish with the second shot, or swap.", "Take Outlaw fights where the second shot has a job. The first body shot cripples full armor and deletes light armor. The fast follow-up finishes the tag or punishes the trade swing."],
      howToUse: ["Outlaw is built to punish light armor and chipped players. Take body shots without overthinking the headshot. You have two rounds before the reload, so spend them with intent and leave the angle before you get trapped empty.", "Protect the second round. After one shot, duck out and load one back in before you swing again. Emptying both barrels forces the long reload and turns the Outlaw into dead weight."],
      patchHistory: [patchNote("8.00", "The Outlaw entered the arsenal as a two-shot sniper built to sit between the Marshal and Operator in price and stopping power.", "https://playvalorant.com/en-us/news/game-updates/a-new-addition-to-the-arsenal-outlaw-insights/")]
    },
    marshal: {
      whenToUse: ["Buy the Marshal when the enemy is on eco or light armor. It one-taps unarmored bodies, punishes dry peeks, and keeps your economy clean for the next rifle round.", "Use it on light buys when you need long-lane threat without paying Operator money. Take the pick, then reposition. The Marshal rewards first contact and punishes you for staying still after the shot."],
      howToUse: ["Into armor, the Marshal is a headshot weapon. Body shots do not finish the kill, and a tagged rifle can still swing you. Take the free body shot only when they are on no shields or your teammate is ready to clean it up.", "Fire the first shot from a tight angle, then break contact. The Marshal punishes clean peeks, but it does not let you tank a trade. Once they know the lane has a sniper, your next peek needs a new angle or a teammate's support."],
      patchHistory: [patchNote("2.03", "Scoped movement rose from 76% to 90%, price fell from 1100 to 1000, and zoom increased from 2.5x to 3.5x."), patchNote("3.00", "Price fell again, from 1000 to 950 credits.")]
    },
    spectre: {
      whenToUse: ["Buy Spectre when you expect close fights: anti-eco rounds, tight site hits, retakes, and smoke-heavy plays. Do not take long rifle duels with it. Use movement, corners, and utility to make the fight short-range.", "Buy Spectre when enemies are on pistols or light armor and you expect them to swing together. The 30-round mag lets you punish the second body without a reload. Keep the fight close and spray through the collapse."],
      howToUse: ["Use the Spectre to steal space, not hold a long lane. Fight close, swing off cover, and commit to the spray when you are inside its effective range. Past mid range, tap or burst and reset. If a rifle gets a clean long duel, you already picked the wrong fight.", "Treat the Spectre like a close-range movement weapon, not a rifle. You can strafe and spray in tight fights, but if the duel starts past comfort range, plant your feet before the first bullets. The weapon wins by making you hard to hit while staying close."],
      patchHistory: [patchNote("4.00", "Spray error began earlier, moving recoil multipliers rose from 1.25x to 1.5x, and protected spray bullets fell from eight to five."), patchNote("6.11", "Running vertical recoil rose from 1.5x to 1.8x."), patchNote("11.08", "Total spread fell from 1.5 to 1.3, tap efficiency rose from two to three, and protected bullets rose from four to five.")]
    },
    stinger: {
      whenToUse: ["Buy the Stinger when you are broke but can force a close fight. Play a smoke edge, tight corner, or fast choke hit. Your job is to steal one kill and upgrade. Do not take long-range rifle duels.", "Buy the Stinger when your money is bad and your plan creates close-range fights. Sit in a smoke, tuck into a short angle, or hit fast with utility. If you take long duels with it, you are donating the round."],
      howToUse: ["Use the Stinger to fight in your face, not to duel rifles down lanes. Commit to the spray only at close range. Past that, fire short bursts, reset, or leave. The 20-round mag disappears fast, and a bad spray turns into a reload death.", "Use ADS when the fight stretches past Stinger range. The 4-round burst is cleaner than spraying, but only if you let the recoil reset. Spam bursts and it turns into a cheap SMG pretending to be a rifle."],
      patchHistory: [patchNote("2.03", "Price rose to 1100, full-auto fire rate fell from 18 to 16, and recoil became more aggressive after the third bullet."), patchNote("3.00", "Price returned from 1100 to 950 credits."), patchNote("11.08", "Full-auto spread rose from 1.3 to 1.5 and reached maximum spread one bullet sooner.")]
    },
    judge: {
      whenToUse: ["Buy Judge when you can force contact inside a doorway, smoke, or tight choke. If they have to enter your close range before seeing you, the weapon wins fast. If they can clear you from distance, do not force it.", "Buy Judge when your plan is a close-range ambush with an exit. Take the first fight from a corner, smoke, or tight choke, then either leave immediately or grab the rifle. If you are forced to keep swinging open space, you bought the wrong gun."],
      howToUse: ["Judge wins by denying space, not by taking fair duels. Hold tight corners, fight inside shotgun range, and keep your crosshair at chest height so the spread lands fully. If the enemy is outside your effective range, fall back or reposition. Do not swing long sightlines with it.", "Do not swing the Judge through open space. It wins by forcing close contact, not by chasing tags. After a burst, break line of sight or move to the next tight angle. Make them walk into the spread again."],
      patchHistory: [patchNote("3.00", "Price rose from 1600 to 1850 and pellet damage at 10 and 15 meters was reduced."), patchNote("12.09", "Minimum and movement spread increased, sharply reducing accuracy while walking, running, jumping, or using ropes.")]
    },
    bucky: {
      whenToUse: ["Buy Bucky on low money when you can sit inside shotgun range. Hold a corner, take one close kill, and upgrade to their rifle. If you have to swing long sightlines, do not buy it.", "Play Bucky from hard cover at point-blank range. You need the first shot to matter, because the reset between shots is slow and open space gets you traded for free."],
      howToUse: ["Play the Bucky like a trap, not a rifle. Hold tight angles, stay still before firing, and force the fight inside lethal range. Aim center mass. You need pellet count, not a highlight headshot.", "After you fire Bucky, you are not ready for a second fight. The pump delay loses to every trade swing. Shoot from cover, break line of sight, then re-peek only when the next shell is ready."],
      patchHistory: [patchNote("3.00", "Price fell from 900 to 850 credits."), patchNote("12.09", "Close-range pellet damage fell from 40/20/17 to 34/17/14, minimum spread rose to 3.0, and moving spread increased.")]
    },
    shorty: {
      whenToUse: ["Use Shorty when you can force a point-blank fight. Tuck into a close corner, let them enter your barrel, and take the one kill. It is a sidearm for ambushes, not a weapon for taking space.", "Buy Shorty on hard saves when you can force a point-blank fight in a doorway, corner, or smoke. You are not playing for a fair duel. Kill the first body, grab the weapon, and turn the round."],
      howToUse: ["Play the Shorty from barrel range or do not play it. Hold tight corners, let them walk into the spread, then stop and shoot. You only have two shells, so commit to the kill or swap off immediately.", "Treat the Shorty as a two-shot ambush tool, not a real hold weapon. After you fire, either take the kill and grab a gun, fall back, or get traded. Staying exposed with an empty Shorty is throwing."],
      patchHistory: [patchNote("6.11", "Price rose from 150 to 300, reserve ammo fell from ten to six, and damage at the first two ranges was reduced."), patchNote("12.09", "Fire rate fell from 3.33 to 3.0 and movement spread increased across walking, running, crouch-walking, jumping, and ropes.")]
    },
    classic: {
      whenToUse: ["Keep the Classic when the round is about utility, armor, or economy. It is free, accurate enough for close fights, and the right-click can punish anyone who lets you get on top of them. Do not take dry mid-range duels with it unless you have to.", "Run Classic on pistol when your credits are better spent on armor and utility. The gun is free, so your value comes from the kit you buy around it. Take close fights, trade fast, and do not play it like a Ghost."],
      howToUse: ["At range, stop spamming. Use single primary-fire taps and let the Classic reset between shots. If you rush the cadence, the spread does the aiming for you.", "Classic right-click is for point-blank corners, not fair fights. Jump-peek tight angles to punish someone holding close. If the burst will not land clean, do not commit. Swap back to left-click, jiggle for info, or fall out."],
      patchHistory: [patchNote("2.00", "Jumping error for alternate fire rose from 0.4 to 1.0 and repeated right-click bursts gained a stronger recovery curve."), patchNote("3.00", "Walking and running inaccuracy increased as Riot tightened moving sidearm fire.")]
    },
    frenzy: {
      whenToUse: ["Buy Frenzy when your plan puts you in close range immediately. It wins by dumping bullets through tight chokes, swings, and smoke exits. Do not take long pistol duels with it.", "Buy Frenzy when your plan puts you in close range fast. Dash, satchel, slide, smoke, or flash your way into the fight. If you have to cross open space dry, the small mag gets punished."],
      howToUse: ["The Frenzy wins by forcing close fights and dumping ammo fast. Play tight angles, swing into contact, and commit to the spray. Crouch only after you decide to finish the duel: it tightens the spread, but it also locks you in place for the trade.", "Use the Frenzy like a close-range entry tool, not a pocket rifle. Start the spray as you clear tight angles so the first bullets meet the swing. If the fight goes long, reset or leave. The spread will betray you."],
      patchHistory: [patchNote("2.03", "Price rose from 400 to 500 credits after the Frenzy crowded other pistol-round options."), patchNote("3.00", "Price fell to 450 while walking and running inaccuracy increased."), patchNote("6.11", "Minimum spread increased, maximum spread arrived in five bullets, and running recoil rose from 1.25x to 1.5x.")]
    },
    ghost: {
      whenToUse: ["Buy Ghost on pistol when you want clean mid-range fights without spending your whole round on the gun. It gives you accurate taps, quiet pressure, and enough credits left for key utility.", "Buy Ghost for pistol-round fights where you can take controlled headshot duels. It kills unarmored targets with one headshot inside 30m, so your value comes from clean first bullets, not body-shot trading."],
      howToUse: ["Use the Ghost like a headshot pistol, not a spam weapon. Hold head height, fire in clean taps or short two-shot bursts, then reset before the spread takes over. If you panic-click the full magazine, you give up the one thing the Ghost is good at.", "Play the Ghost like a precision pistol, not a Frenzy. Hold head height, tap clean first shots, and reset before you spam. Its value is accuracy and control; throw that away and you are just taking weak body-shot duels."],
      patchHistory: [patchNote("3.00", "Walking inaccuracy rose from 0.25 to 0.92 and running inaccuracy from 1.85 to 2.3."), patchNote("6.11", "Minimum spread on ropes rose from 0.35 to 0.6 as rope combat was made less reliable.")]
    },
    sheriff: {
      whenToUse: ["Buy the Sheriff on save rounds when you can take controlled fights under 30 meters. It gives you real one-tap threat for cheap. If you are swinging wide and spamming, buy something else.", "Buy Sheriff when you can turn info into one-tap damage through cover. It has high penetration, so tagged or predictable players in common spots are punishable. Fire with purpose. Six bullets disappear fast, and a dry reload gets you killed."],
      howToUse: ["Treat the Sheriff like a one-shot tool, not a spam pistol. Stop moving before you fire, hold head height, and make the first bullet count. If you miss, reset your aim before the next shot instead of panic-clicking.", "If they’re moving or far enough that the headshot is low percentage, take the two-tap to the body instead. After a miss, don’t panic-spam the Sheriff. Duck back, reset your aim, and swing for the next clean shot."],
      patchHistory: [patchNote("3.00", "Walking inaccuracy rose from 0.25 to 1.2 and running inaccuracy from 2.0 to 3.0."), patchNote("6.11", "Minimum spread on ropes rose from 0.35 to 0.78 as rope combat was made less reliable.")]
    },
    melee: {
      whenToUse: ["Use melee for speed through safe space. Pull it out on rotations, spawn paths, and behind cover when no angle can see you. Do not swing fights with it unless the enemy is already touching you or you are going for a guaranteed backstab.", "Melee choice is cosmetic. Skins do not change damage, reach, or fight planning, so pick what feels clean and stop thinking about it."],
      howToUse: ["Use melee for speed, not fights. Swap to it for rotations and safe repositioning, then get your gun out before contact. Knife damage is only a play when the enemy is trapped, isolated, or unaware at point-blank range.", "Melee back damage matters: right-click from behind deals 150 and kills a full-health armored target. That does not make knife kills a plan. Use it only when the kill is guaranteed and shooting would risk the round."],
      patchHistory: []
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
    weaponCatalog[id].roundConversion = "Available by buy type";
  });

  const weapons = [
    { id: "rifles", label: "Rifles", examples: "Vandal, Phantom", range: "Mid-range default", weaponIds: ["vandal", "phantom"] },
    { id: "precision", label: "Light Rifles", examples: "Guardian, Bulldog", range: "Mid to long range", weaponIds: ["guardian", "bulldog"] },
    { id: "snipers", label: "Snipers", examples: "Operator, Outlaw, Marshal", range: "Long sightlines", weaponIds: ["operator", "outlaw", "marshal"] },
    { id: "machine-guns", label: "Machine Guns", examples: "Ares, Odin", range: "High-penetration pressure", weaponIds: ["ares", "odin"] },
    { id: "smgs", label: "SMGs", examples: "Spectre, Stinger", range: "Close-range pressure", weaponIds: ["spectre", "stinger"] },
    { id: "shotguns", label: "Shotguns", examples: "Judge, Bucky, Shorty", range: "Close-range only", weaponIds: ["judge", "bucky", "shorty"] },
    { id: "sidearms", label: "Sidearms", examples: "Classic, Frenzy, Ghost, Sheriff", range: "Pistol and save rounds", weaponIds: ["classic", "frenzy", "ghost", "sheriff"] },
    { id: "melee", label: "Melee", examples: "Knife", range: "Melee only", weaponIds: ["melee"] }
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
