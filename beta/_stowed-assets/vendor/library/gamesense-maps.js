// Gamesense Library — Map content, first slice (Bind, Breeze, Split).
// Written in original language from secondary research, not scraped or
// reproduced verbatim from any script or transcript. Underscore-prefixed
// fields (_researchNote, _researchUrl) are internal provenance only —
// for the team's own future reference if content ever needs revisiting —
// and must NEVER be rendered in the player-facing UI. Game mechanics and
// strategy are not gatekept knowledge; no creator attribution is shown to
// players. The "patch" field on metaComp IS meant to be player-visible —
// it's a data-freshness indicator, not attribution.
// Round conversion percent values were aggregated from the active-act map,
// economy, side, and weapon sample published at https://www.vstats.gg/weapons.
(function () {
  "use strict";

  const ASCENDANT_PLUS_GLOBAL_PICK_RATES = Object.freeze({
    Astra: { role: "Controller", rate: 0.84 }, Breach: { role: "Initiator", rate: 0.68 },
    Brimstone: { role: "Controller", rate: 0.25 }, Chamber: { role: "Sentinel", rate: 8.72 },
    Clove: { role: "Controller", rate: 14.46 }, Cypher: { role: "Sentinel", rate: 4.50 },
    Deadlock: { role: "Sentinel", rate: 0.58 }, Fade: { role: "Initiator", rate: 4.60 },
    Gekko: { role: "Initiator", rate: 0.42 }, Harbor: { role: "Controller", rate: 0.40 },
    Iso: { role: "Duelist", rate: 0.95 }, Jett: { role: "Duelist", rate: 15.62 },
    "KAY/O": { role: "Initiator", rate: 0.43 }, Killjoy: { role: "Sentinel", rate: 2.61 },
    Miks: { role: "Controller", rate: 0.91 }, Neon: { role: "Duelist", rate: 3.35 },
    Omen: { role: "Controller", rate: 3.08 }, Phoenix: { role: "Duelist", rate: 5.17 },
    Raze: { role: "Duelist", rate: 3.50 }, Reyna: { role: "Duelist", rate: 9.11 },
    Sage: { role: "Sentinel", rate: 1.74 }, Skye: { role: "Initiator", rate: 2.52 },
    Sova: { role: "Initiator", rate: 9.49 }, Tejo: { role: "Initiator", rate: 0.47 },
    Veto: { role: "Sentinel", rate: 0.61 }, Viper: { role: "Controller", rate: 1.22 },
    Vyse: { role: "Sentinel", rate: 1.34 }, Waylay: { role: "Duelist", rate: 1.87 },
    Yoru: { role: "Duelist", rate: 0.56 }
  });

  function buildRolePickRates(mapRates = {}) {
    return Object.entries(ASCENDANT_PLUS_GLOBAL_PICK_RATES).map(([agent, global]) => ({
      agent,
      role: global.role,
      mapRate: Number(mapRates[agent] || 0),
      globalRate: global.rate
    }));
  }

  const PLANT_IMAGE_SOURCE = "https://dignitas.gg/articles/the-best-plant-spots-for-every-map";

  const GAMESENSE_MAPS = [
    {
      id: "bind",
      label: "Bind",
      inCompetitivePool: false,
      cardImage: "/assets/library/maps/bind-card.png",
      layoutImage: "/assets/library/maps/bind-layout-trn.png",
      calloutLabelsBakedIn: true,
      callouts: [
        { id: "bind-1", sourceKey: "A::Exit", sourceLabel: "A Exit", label: "A Exit", superRegionName: "A", regionName: "Exit", x: 92.35, y: 52.21 },
        { id: "bind-2", sourceKey: "A::Link", sourceLabel: "A Link", label: "A Link", superRegionName: "A", regionName: "Link", x: 51.75, y: 59.2 },
        { id: "bind-3", sourceKey: "A::Lobby", sourceLabel: "A Lobby", label: "A Lobby", superRegionName: "A", regionName: "Lobby", x: 76.33, y: 60.69 },
        { id: "bind-4", sourceKey: "A::Short", sourceLabel: "A Short", label: "A Short", superRegionName: "A", regionName: "Short", x: 62.44, y: 49.65 },
        { id: "bind-5", sourceKey: "A::Site", sourceLabel: "A Site", label: "A Site", superRegionName: "A", regionName: "Site", x: 73.41, y: 33.34 },
        { id: "bind-6", sourceKey: "A::Teleporter", sourceLabel: "A Teleporter", label: "A Teleporter", superRegionName: "A", regionName: "Teleporter", x: 60.58, y: 41.11 },
        { id: "bind-7", sourceKey: "Attacker Side::Spawn", sourceLabel: "Attacker Side Spawn", label: "Attacker Side Spawn", superRegionName: "Attacker Side", regionName: "Spawn", x: 58.15, y: 95.8 },
        { id: "bind-8", sourceKey: "B::Exit", sourceLabel: "B Exit", label: "B Exit", superRegionName: "B", regionName: "Exit", x: 47.29, y: 44.12 },
        { id: "bind-9", sourceKey: "B::Hall", sourceLabel: "B Hall", label: "B Hall", superRegionName: "B", regionName: "Hall", x: 28.54, y: 20.16 },
        { id: "bind-10", sourceKey: "B::Link", sourceLabel: "B Link", label: "B Link", superRegionName: "B", regionName: "Link", x: 42.23, y: 59.22 },
        { id: "bind-11", sourceKey: "B::Fountain", sourceLabel: "B Fountain", label: "B Fountain", superRegionName: "B", regionName: "Fountain", x: 25.89, y: 62.91 },
        { id: "bind-12", sourceKey: "B::Long", sourceLabel: "B Long", label: "B Long", superRegionName: "B", regionName: "Long", x: 19.27, y: 51.52 },
        { id: "bind-13", sourceKey: "B::Short", sourceLabel: "B Short", label: "B Short", superRegionName: "B", regionName: "Short", x: 39.66, y: 52.95 },
        { id: "bind-14", sourceKey: "B::Site", sourceLabel: "B Site", label: "B Site", superRegionName: "B", regionName: "Site", x: 29.19, y: 31.22 },
        { id: "bind-15", sourceKey: "B::Teleporter", sourceLabel: "B Teleporter", label: "B Teleporter", superRegionName: "B", regionName: "Teleporter", x: 15.07, y: 43.49 },
        { id: "bind-16", sourceKey: "B::Window", sourceLabel: "B Window", label: "B Hookah", superRegionName: "B", regionName: "Window", x: 32.27, y: 44.68 },
        { id: "bind-17", sourceKey: "A::Bath", sourceLabel: "A Bath", label: "A Showers", superRegionName: "A", regionName: "Bath", x: 83.95, y: 43.03 },
        { id: "bind-18", sourceKey: "Attacker Side::Cave", sourceLabel: "Attacker Side Cave", label: "Attacker Side Cave", superRegionName: "Attacker Side", regionName: "Cave", x: 59.21, y: 73.63 },
        { id: "bind-19", sourceKey: "A::Cubby", sourceLabel: "A Cubby", label: "A Cubby", superRegionName: "A", regionName: "Cubby", x: 58.73, y: 45.99 },
        { id: "bind-20", sourceKey: "Defender Side::Spawn", sourceLabel: "Defender Side Spawn", label: "Defender Side Spawn", superRegionName: "Defender Side", regionName: "Spawn", x: 51.69, y: 10.37 },
        { id: "bind-21", sourceKey: "B::Elbow", sourceLabel: "B Elbow", label: "B Elbow", superRegionName: "B", regionName: "Elbow", x: 15.83, y: 30.6 },
        { id: "bind-22", sourceKey: "B::Garden", sourceLabel: "B Garden", label: "B Garden", superRegionName: "B", regionName: "Garden", x: 24.67, y: 42.81 },
        { id: "bind-23", sourceKey: "A::Lamps", sourceLabel: "A Lamps", label: "A Lamps / U-Haul", superRegionName: "A", regionName: "Lamps", x: 58.17, y: 33.92 },
        { id: "bind-24", sourceKey: "A::Tower", sourceLabel: "A Tower", label: "A Heaven", superRegionName: "A", regionName: "Tower", x: 72.78, y: 20.81 }
      ],
      plantSpots: [
        { number: 1, site: "A", label: "A Truck Default", rate: null, x: 75.6, y: 34.5, previewLabel: "A Truck in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/4d5161107bb15614535dae6dfc7f86bea500d003-763x663.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 2, site: "A", label: "A Open Plant", rate: null, x: 68.5, y: 35.7, previewLabel: "A Open in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/b996cd4c248b1766a76f753742b3b3bd5a4760e8-763x663.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 1, site: "B", label: "B Default", rate: null, x: 31.4, y: 31.3, previewLabel: "B Default in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/ae001b00624f314098333175e48aa9d7a317c2c2-857x661.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 2, site: "B", label: "B Long Plant", rate: null, x: 26.7, y: 31.3, previewLabel: "B open-site in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/52e28edead38b5b1ec0dcbfaf074fb2894cd7725-857x661.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 3, site: "B", label: "B Window Plant", rate: null, x: 29.1, y: 32.4, previewLabel: "B open-site in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/52e28edead38b5b1ec0dcbfaf074fb2894cd7725-857x661.png?auto=format", previewSource: PLANT_IMAGE_SOURCE }
      ],
      plantRateNote: "Bind is outside the active competitive rotation, so no active-season PC plant-rate sample is available.",
      weaponSuggestions: [
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Best all-around rifle fit on Bind", locations: "Hookah, Lamps, Showers", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "Phantom fits Bind because most fights happen at choke distance: A Short, Showers, Hookah, and B Long. You also spam smokes constantly on this map, and the Phantom gives you that pressure without tracer lines giving you away." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Fits you if you want to lock down Bind’s long lanes and force attackers to spend utility. B Long, Showers, and A Short give you clean first-contact angles. Miss the shot or get smoked off, and your retake value drops fast.", side: "DEF", locations: "B Long, A Tower, A Short", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", conversion: "Bind rewards shotguns in Hookah and Lamps. That does not make them default conversion buys. If your first fight is B Long, A Short, or Showers, buy this instead and keep the fight at a real gun range.", note: "Bind gives the Operator clean defense fights at B Long and A Showers. Take one shot, then leave or get traded. Hold with an escape ability or teammate utility, and make the rotate call early because teleporters can flip the round fast." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Use it on pistol rounds when you expect clean duels through Showers, Hookah, or B Long. Bind gives you plenty of early fights where a stronger sidearm matters immediately.", locations: "A Short, Showers, B Long", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "Ghost fits Bind pistol rounds because you need utility to crack Hookah, Showers, or A Short. Take the clean tap fights outside the choke. Do not walk it into Shorty range in Hookah, lamps, or showers corners." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "A solid alternative for converting close-range fights.", side: "DEF", locations: "Hookah, Lamps, U-Haul", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", conversion: "Pick this over an Operator when your setup reliably gives you two close-range contacts. If attackers can back out and reset toward Long or Showers, its value drops hard.", note: "On defense, use this as a close-range trap, not a duel weapon. Bind gives you Hookah, Showers, and Lamps-style choke fights. Get the first kill, grab the rifle, and leave before the trade arrives." },
        { weapon: "Stinger", image: "/assets/weapons/stinger.png", category: "eco", fit: "Niche eco buy", locations: "Hookah, Lamps, Showers", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "Shorty is a trap weapon on Bind. Hold tight angles in Hookah, Lamps, Showers, or TP exits and force the first fight point-blank. If they clear you from range or you burn both shots, the gun is finished." }
      ],
      macro: {
        _researchNote: "internal only, do not render",
        _researchUrl: "https://www.zleague.gg/theportal/woohoojin-mastering-the-bind-map-in-valorant/",
        defense: [
          "Bind has no mid, so defense is won by denying the side lanes early. Fight for one piece of forward space — Showers, Hookah, or B Long — then fall back alive. If you give every lane for free, attack walks into a grouped site hit and your retake has no flank.",
          "Bind has no mid, so your A defense is about denying clean lane control. Do not give attackers free Showers and free A Short pressure at the same time. Use early utility to hold one side, keep Lamps playable, then rotate off info. If A starts with no space and no Lamps control, the retake is already bad.",
          "Bind rewards memory on defense. There is no mid, so attacker plans repeat through A Short, Showers, B Long, and Hookah. Track who takes first contact, who lurks, and when they use TP. Once the pattern is clear, stack the right lane or push the empty side before the hit starts."
        ],
        attack: [
          "Bind has no mid, so your first contact tells defenders a lot. Make that contact expensive. Force utility on one site, then rotate or take the teleporter with numbers. The TP sound gives away the move, so do not trickle out one by one.",
          "Set your pace off their comp. Into double Sentinel, clear or break the trips early, then commit late once their setup is weaker. Into double Controller, hit earlier before the second wave of smokes comes back up. Into double Initiator, stay disciplined in defaults so their repeat info doesn’t get a real tell. Into double Duelist, fight for the forward lanes or hold them tight so their aggression gets called and traded."
        ]
      },
      siteTips: [
        { label: "A Showers", text: "Do not commit the A plant with Showers unaccounted for. A defender in Baths gets a clean swing on default, pressures the planter, and turns your A Short hit into a crossfire you cannot trade cleanly.", roles: ["Duelist", "Initiator"] },
        { label: "A Lamps / U-Haul", text: "On A, Lamps decides whether the plant is safe. If defenders keep U-Haul, they can swing straight back into site and punish default plants. Clear it before the spike goes down, then hold it with a body or utility.", roles: ["Controller", "Sentinel"] },
        { label: "B Hookah", text: "B hits fail when Hookah drops before Long is ready. Hold the drop, let the Long group reach Garden pressure, then pinch site together. One side clears close site while the other fights Elbow. If the timing is split, defenders isolate both groups.", roles: ["Duelist", "Initiator"] },
        { label: "Own B Long and Octagon", text: "On B post-plant, do not all hide site. Keep one player Long or Octagon and another on site or Hookah. That crossfire punishes retakes from Defender Spawn and Elbow, and it stops defenders from clearing the site as one pack.", roles: ["Controller", "Sentinel"] }
      ],
      teamplayTips: [
        { label: "Force the rotate first", text: "Bind has no mid, so your teamplay comes from paired lane control. Don’t hit A with only Short or B with only Long. Take Showers with A Short, or Hookah with B Long, then force defenders to split their crossfires." },
        { label: "Stack ecos and force close fights", text: "On a bad buy, stop spreading across Bind. Stack five, delete one Sentinel setup, and force a close-range fight through Showers, Lamps, or Hookah. Your goal is one rifle and instant trades. Once you steal a gun, slow down and play around it." },
        { label: "Call the teleport before you take it", text: "Set the Bind plan before the barrier drops. Call the first hit, who is allowed to take TP, and what trigger cancels the play. Teleporter rotates are only strong when the exit player is ready to trade the door." }
      ],
      roleNotes: {
        Duelist: [{ category: "attack", text: "Bind has no mid to bail you out. Pick a lane, demand the flash or reveal, and take the first fight through A Short, Showers, Hookah, or B Long. If you do not win early space, your team gets stuck guessing into stacked sites." }, { category: "sites", text: "Bind punishes slow duelists. A site is a Lamps and Showers crossfire. B site is Hookah, Elbow, and back site trading off each other. Enter first, break one side of the setup, and make defenders turn before your team walks through the choke." }, { category: "defense", text: "Bind punishes ego re-peeks. Take first contact to crack Hookah, Showers, Long, or A Short, then move. If you forced utility or pulled a defender, you did your job. Reset and hit with your team instead of dying on the same angle." }],
        Initiator: [{ category: "attack", text: "Bind has no mid, so fights stack around four lanes: Showers, A Short, Hookah, and B Long. Use recon, drone, dog, or flash to take those lanes before the hit. If your entry clears them dry, you failed your job." }, { category: "sites", text: "Bind rewards initiators who clear the pockets defenders actually play. Use recon, dogs, and flashes to break Lamps, A Tower, Hookah, Elbow, and spawn retakes before your duelists swing. Empty lane info is not enough." }, { category: "teamplay", text: "Bind rotations are loud because teleporters announce them. As Initiator, treat that sound as info utility. Call the exit instantly, then push your team to re-hit, rotate, or collapse before the other side resets." }],
        Controller: [{ category: "sites", text: "Bind has no mid, so your smokes decide which lane is safe to use. On A hits, block Tower first, then use the next smoke on Lamps or Showers based on what your team does not control. On B, cut Defender Spawn and Elbow before the plant. Leave either one open and the site gets pinched for free." }, { category: "teamplay", text: "Do not burn smokes on vanity one-ways. Bind hits need real cover through tight chokes: A Short, Showers, Hookah, and B Long. If the smoke does not protect the entry, delay a defender, or block a retake lane, keep it for the execute." }, { category: "defense", text: "Do not spend every smoke on the hit. Bind post-plants are won by cutting the retake lanes late: A Heaven, A Short, CT, Elbow, Hookah. One late smoke or molly buys more time than a third setup piece before the spike is down." }],
        Sentinel: [{ category: "teamplay", text: "Bind rotates are fast because of teleporters. Put flank utility where it watches the rotate path without sitting in the first prefire spot. If your trip dies for free, you lose the warning and the teleporter flank is live." }, { category: "defense", text: "Bind has no mid, so your setups decide how safely attackers take the lanes. Use trips, cages, turrets, or slows to punish Hookah, B Long, Showers, and A Short contact. Get value, fall, and make them spend time clearing you." }, { category: "defense", text: "Bind has no mid, so attackers reuse the same lanes: A Short, Showers, B Long, and Hookah. Once your trap, turret, or cam is seen, move the layer next gun round. Make them clear new pixels instead of deleting the same setup for free." }]
      },
      metaComp: {
        agents: [],
        composition: "No current ranked composition sample",
        patch: "13.01"
      },
      metaComps: [],
      compStatus: "No verified composition reference is available for this map.",
      agentInsights: {
        Clove: "Clove is playable on Bind because the map is tight and the first fight usually happens near the site. If you die contesting A Short, Showers, Hookah, or B Long, you can still use Ruse from death to block the hit or finish the exec. Do not die isolated in a useless pocket. Your corpse decides where your post-death smokes still matter.",
        Raze: "Raze is built for Bind. The map is all tight rooms and hard corners: Hookah, Showers, Lamps, A Short. Boom Bot and Paint Shells force defenders out before you facecheck. Blast Pack lets you break the first angle fast, especially into Hookah or site hits. If you play Raze here, your job is to create space, not sit behind the team with full utility.",
        Fade: "Bind gives Fade real value because the important fights run through tight lanes: Hookah, Showers, A Short, and B Long. Use Prowlers to take the first close angle before your entry swings. Time Haunt with contact, not ten seconds early. You want defenders in Lamps, Hookah, and site corners revealed while the hit is already coming.",
        Cypher: "Cypher is a niche Bind pick, but his job is clear. Bind has no mid, so his value comes from locking extremities and removing flank pressure while your team commits through tight chokes. Use trips and cam to hold Showers, A Short, Hookah, or B Long space without bodies. If you die early, your setup stops controlling the rotation game.",
        Skye: "Skye is useful on Bind because the map is all chokes and close corners. Use Trailblazer to clear Hookah, Showers, U-Hall, and tight site pockets before your entry swings. Bend Guiding Light through A Short, Showers, Hookah, or B Long to force defenders off the first fight. If you waste the flash before your team is ready to move, Skye gives Bind very little."
      },
      lineupLinks: [
        { label: "LineupsValorant — Bind", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Bind", url: "https://upforge.gg/lineups" }
      ]
    },
    {
      id: "breeze",
      label: "Breeze",
      inCompetitivePool: true,
      cardImage: "/assets/library/maps/breeze-card.png",
      layoutImage: "/assets/library/maps/breeze-layout-trn.png",
      calloutLabelsBakedIn: true,
      callouts: [
        { id: "breeze-1", sourceKey: "Mid::Hall", sourceLabel: "Mid Hall", label: "Mid Hall", superRegionName: "Mid", regionName: "Hall", x: 63.95, y: 53.51 },
        { id: "breeze-2", sourceKey: "A::Bridge", sourceLabel: "A Bridge", label: "A Bridge", superRegionName: "A", regionName: "Bridge", x: 71.19, y: 24.51 },
        { id: "breeze-3", sourceKey: "Defender Side::Spawn", sourceLabel: "Defender Side Spawn", label: "Defender Side Spawn", superRegionName: "Defender Side", regionName: "Spawn", x: 71.19, y: 21.01 },
        { id: "breeze-4", sourceKey: "Defender Side::Arches", sourceLabel: "Defender Side Arches", label: "Defender Side Arches", superRegionName: "Defender Side", regionName: "Arches", x: 37.41, y: 17.51 },
        { id: "breeze-5", sourceKey: "Mid::Wood Doors", sourceLabel: "Mid Wood Doors", label: "Mid Wood Doors", superRegionName: "Mid", regionName: "Wood Doors", x: 64.36, y: 49.53 },
        { id: "breeze-6", sourceKey: "Mid::Pillar", sourceLabel: "Mid Pillar", label: "Mid Pillar", superRegionName: "Mid", regionName: "Pillar", x: 49.84, y: 54.08 },
        { id: "breeze-7", sourceKey: "Mid::Top", sourceLabel: "Mid Top", label: "Mid Top", superRegionName: "Mid", regionName: "Top", x: 50.19, y: 40.08 },
        { id: "breeze-8", sourceKey: "Mid::Nest", sourceLabel: "Mid Nest", label: "Mid Nest", superRegionName: "Mid", regionName: "Nest", x: 48.44, y: 22.76 },
        { id: "breeze-9", sourceKey: "B::Window", sourceLabel: "B Window", label: "B Window", superRegionName: "B", regionName: "Window", x: 17.29, y: 67.73 },
        { id: "breeze-10", sourceKey: "B::Main", sourceLabel: "B Main", label: "B Main", superRegionName: "B", regionName: "Main", x: 15.36, y: 58.46 },
        { id: "breeze-11", sourceKey: "B::Elbow", sourceLabel: "B Elbow", label: "B Elbow", superRegionName: "B", regionName: "Elbow", x: 26.21, y: 50.58 },
        { id: "breeze-12", sourceKey: "B::Site", sourceLabel: "B Site", label: "B Site", superRegionName: "B", regionName: "Site", x: 6.96, y: 38.16 },
        { id: "breeze-13", sourceKey: "B::Tunnel", sourceLabel: "B Tunnel", label: "B Tunnel", superRegionName: "B", regionName: "Tunnel", x: 36.36, y: 38.16 },
        { id: "breeze-14", sourceKey: "A::Ramp", sourceLabel: "A Ramp", label: "A Ramp", superRegionName: "A", regionName: "Ramp", x: 65.59, y: 32.21 },
        { id: "breeze-15", sourceKey: "B::Back", sourceLabel: "B Back", label: "B Back", superRegionName: "B", regionName: "Back", x: 6.79, y: 30.46 },
        { id: "breeze-16", sourceKey: "B::Wall", sourceLabel: "B Wall", label: "B Wall", superRegionName: "B", regionName: "Wall", x: 25.51, y: 23.46 },
        { id: "breeze-17", sourceKey: "Mid::Cannon", sourceLabel: "Mid Cannon", label: "Mid Cannon", superRegionName: "Mid", regionName: "Cannon", x: 33.56, y: 63.01 },
        { id: "breeze-18", sourceKey: "Mid::Bottom", sourceLabel: "Mid Bottom", label: "Mid Bottom", superRegionName: "Mid", regionName: "Bottom", x: 49.84, y: 72.28 },
        { id: "breeze-19", sourceKey: "A::Lobby", sourceLabel: "A Lobby", label: "A Lobby", superRegionName: "A", regionName: "Lobby", x: 70.31, y: 92.06 },
        { id: "breeze-20", sourceKey: "A::Shop", sourceLabel: "A Shop", label: "A Shop", superRegionName: "A", regionName: "Shop", x: 76.26, y: 68.26 },
        { id: "breeze-21", sourceKey: "A::Site", sourceLabel: "A Site", label: "A Site", superRegionName: "A", regionName: "Site", x: 90.79, y: 49.53 },
        { id: "breeze-22", sourceKey: "A::Pyramids", sourceLabel: "A Pyramids", label: "A Pyramids", superRegionName: "A", regionName: "Pyramids", x: 84.66, y: 46.91 },
        { id: "breeze-23", sourceKey: "Attacker Side::Spawn", sourceLabel: "Attacker Side Spawn", label: "Attacker Side Spawn", superRegionName: "Attacker Side", regionName: "Spawn", x: 43.36, y: 87.33 }
      ],
      plantSpots: [
        { number: 1, site: "A", label: "A Pyramid Default", rate: 44.15, x: 91.4, y: 47.8, previewLabel: "A Pyramid in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 2, site: "A", label: "A Open Pyramid", rate: 13.00, x: 81.7, y: 47.8, previewLabel: "A Pyramid in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 3, site: "A", label: "A Deep Pyramid", rate: 20.30, x: 93.7, y: 47.8, previewLabel: "A Pyramid in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 4, site: "A", label: "A Safe Pyramid", rate: 7.44, x: 84.7, y: 47.8, previewLabel: "A Pyramid in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 1, site: "B", label: "B Pillar Default", rate: 83.61, x: 14.0, y: 31.6, previewLabel: "B Pillar in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/2c999bc13e7f9ae68fb4fd749a5b2684b82a483f-531x652.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 2, site: "B", label: "B Open Plant", rate: 0.71, x: 17.1, y: 30.5, previewLabel: "B open plant in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/2ec53a4e3cead720efc4ab4f107576e37a851174-531x652.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 3, site: "B", label: "B Back Plant", rate: 1.51, x: 10.6, y: 31.9, previewLabel: "B open plant in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/2ec53a4e3cead720efc4ab4f107576e37a851174-531x652.png?auto=format", previewSource: PLANT_IMAGE_SOURCE }
      ],
      plantRateNote: "Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive.",
      weaponSuggestions: [
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Highest rifle conversion", locations: "A Main, B Main, Mid", roundConversion: { scope: "Combined", value: 50.87, sample: "896,805 active-season full-buy rounds", comparisonLabel: "Second rifle", comparisonWeapon: "Vandal", comparisonValue: 50.41 }, note: "Phantom has a slight edge when you’re fighting through smokes or finishing close site fights, but Vandal is still the cleaner pick for Breeze’s long lanes and one-taps." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Breeze is built on long, exposed lanes. This weapon fits because it rewards clean aim, punishes wide swings, and lets you hold space without forcing close fights.", side: "DEF", locations: "A Main, B Main, Mid Nest", roundConversion: { scope: "Defense", value: 52.43, sample: "230,391 active-season defense full-buy rounds", comparisonLabel: "Second sniper", comparisonWeapon: "Outlaw", comparisonValue: 44.64 }, conversion: "Breeze rewards the Operator on defense. The lanes are long, the retakes are wide, and one clean pick can stall the whole hit. Do not force Judge or Bucky here unless you are playing a trapped close angle in Halls or Tunnel with utility protecting your escape.", note: "Breeze is an Operator map. Long lanes let you take first contact before rifles are comfortable. Do not dry-swing the same angle twice. Fire, reposition, and make them clear you again." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Highest pistol conversion", locations: "A Main, Mid, B Main", roundConversion: { scope: "Combined", value: 50.64, sample: "2,791,564 active-season pistol rounds", comparisonLabel: "Second pistol", comparisonWeapon: "Sheriff", comparisonValue: 50.21 }, note: "Breeze pistol fights are long. Tap from cover, value first-shot accuracy, and keep enough credits for the utility that gets you through the open space." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "Best pick when you’re forcing a shotgun for a close-range conversion.", side: "DEF", locations: "A Hall, B Tunnel", roundConversion: { scope: "Defense", value: 48.24, sample: "27,678 active-season defense full-buy rounds", comparisonLabel: "Second shotgun", comparisonWeapon: "Bucky", comparisonValue: 44.24 }, conversion: "Only buy a shotgun on Breeze if you already have a close-range trap planned. This map is built around long lanes, wide sites, and Operator angles. If you end up fighting A Main, B Main, Mid, or back site space, the shotgun loses before the duel starts.", note: "Use it as a trap weapon, not a main plan. Tuck Halls or B Tunnel, take the close fight, then upgrade fast. Breeze punishes short-range guns once you leave cover and step into the long lanes." },
        { weapon: "Spectre", image: "/assets/weapons/spectre.png", category: "eco", fit: "Highest eco conversion", locations: "Tunnel and close Hall pockets", roundConversion: { scope: "Combined", value: 33.61, sample: "128,040 active-season second-round-loss rounds", comparisonLabel: "Second SMG", comparisonWeapon: "Stinger", comparisonValue: 29.69 }, note: "Pick it only with a clear close-range plan. Breeze has a lot of long fights, so an SMG gets punished fast if you drift into open angles." }
      ],
      macro: {
        _researchNote: "internal only, do not render",
        _researchUrl: "https://www.youtube.com/watch?v=0VLyBGR5sNA",
        defense: [
          "On Breeze, mid decides how safe your sites actually are. If you give it up for free, attackers can split either side and your rotations become guesses. Fight for information early, then fall back with a plan. You do not need to die in mid; you need to know where the hit is going."
        ],
        attack: [
          "Breeze mid is too open to dry walk. Put a smoke on Mid Nest before you scale. It removes the strongest defender sightline and lets you fight for Doors, Tunnel, or B split without feeding the Operator.",
          "Smoke Tunnel to make defenders choose: fight forward for that space, or back off and give it up. Either way, you’re forcing the issue instead of letting them hold it comfortably."
        ]
      },
      siteTips: [
        { label: "A Pyramids", text: "A site is not clear because you crossed the choke. The pyramids hide close defenders and break trades. Clear both sides of the default plant space, then check back site before the spike goes down.", roles: ["Duelist", "Initiator"] },
        { label: "A Bridge", text: "Do not plant on A while Bridge is open. That angle looks over the site and punishes default pyramid plants. Smoke it, wall it, or force it off before the spike goes down.", roles: ["Controller", "Sentinel"] },
        { label: "Make Pillar the B Anchor", text: "On B, Pillar is the anchor point. Use it to cut the site in half, then clear Back Site before anyone commits to plant. If Back Site stays alive, your open plant lanes turn into free kills for the defender.", roles: ["Duelist", "Initiator"] },
        { label: "B Tunnel", text: "Taking Tunnel cuts down defender rotate time and helps cover a B split, but it only works if your Mid player is close enough to get traded.", roles: ["Controller", "Sentinel"] }
      ],
      teamplayTips: [
        { label: "Take Mid as a Unit", text: "Breeze punishes five-man lane hits. Put pressure through Mid while the site group takes Main space. Mid control forces defenders to hold more angles and makes their long rotations easier to punish." },
        { label: "Trade the long lanes", text: "Breeze punishes solo peeks. The lanes are wide and the fights happen at range, so a teammate behind you is not automatically a trade. Pair up before contesting A Main, B Main, or Mid, and swing off the same contact." },
        { label: "Refresh Info Before You Rotate", text: "Do not dump all your info utility on the first hit. Breeze is huge, and a bad site call costs the round. Keep one cam, scan, trap, or player for the rotate so your team can leave safely instead of walking blind into a flank." }
      ],
      roleNotes: {
        Duelist: [{ category: "attack", text: "Breeze rewards prepared entries, not ego peeks. Force the Operator or rifle off the first long angle with flash or recon support, then use your movement to cross and claim space." }, { category: "attack", text: "Do not let Breeze become five players walking into one long choke. As Duelist, take early Mid or Halls space and force defenders to split their crossfires. If they can stack Main with rifles, your entry has already lost value." }, { category: "defense", text: "Breeze gives Operator players long, clean lanes. If you take the Op as duelist, know your exit before you swing. After you fire, leave or change angles. Re-peeking the same lane lets them pre-aim you, flash you, or drone you out." }],
        Initiator: [{ category: "attack", text: "Breeze punishes dry first contact. Use drone, dog, eye, or recon to break the long lane before your entry swings it. If your duelist sees the Operator before your utility does, you were late." }, { category: "sites", text: "Breeze is too wide for vague info. Call exactly what your recon cleared: Halls, Mid Nest, Tunnel, back site. If utility sees nothing, say that too. Your team needs to know which gaps are still live." }, { category: "teamplay", text: "Do not dump every info tool at the start of the round. Breeze is wide, and a wrong rotate takes too long to undo. Save one recon piece for the mid-round so your team confirms bodies before leaving a site." }],
        Controller: [{ category: "sites", text: "Breeze punishes weak controller utility. One smoke does not solve these sites. Use your wall to break the long sightlines and split the bombsite, then hit before it drops. If defenders stay in front, they get traded. If they fall behind it, your team gets the plant." }, { category: "attack", text: "Mid control on Breeze starts with Nest. Smoke it before your team crosses, or defenders get free info and clean fights into Mid. If you are splitting, block Tunnel too. Leaving either angle open turns the split into a pinch against you." }, { category: "teamplay", text: "On Breeze, focus on fully cutting lanes and managing your fuel timing instead of forcing tricky one-ways. The open geometry makes clean lane denial more reliable." }],
        Sentinel: [{ category: "teamplay", text: "Breeze is too wide to re-clear your backline every hit. Put Sentinel utility on the lurk routes, then play your life around the info. If you die early, your team loses the map control that lets rotations commit." }, { category: "defense", text: "Anchor in off-angles that attackers only get to clear after they’ve crossed the open space." }, { category: "defense", text: "Don’t dump all your utility on one site. If they pressure Mid, they can slip behind your setup and collapse it from the back." }]
      },
      metaComp: {
        agents: ["Chamber", "Clove", "Jett", "Reyna", "Sova"],
        composition: "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel",
        patch: "13.01 + 13.00"
      },
      metaComps: [
        { label: "Double-duelist layout", agents: ["Chamber", "Clove", "Jett", "Reyna", "Sova"], composition: "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel" },
        { label: "Double-controller layout", agents: ["Chamber", "Clove", "Jett", "Sova", "Viper"], composition: "2 Controllers, 1 Duelist, 1 Initiator, 1 Sentinel" },
        { label: "Double-controller + double-initiator", agents: ["Clove", "Jett", "KAY/O", "Sova", "Viper"], composition: "2 Controllers, 1 Duelist, 2 Initiators" }
      ],
      compSample: {
        rankLabel: "Ascendant to Radiant",
        patchLabel: "13.01 + 13.00",
        currentPatchAgentSelections: 4324,
        combinedAgentSelections: 631146,
        source: "OP.GG Competitive",
        note: "OP.GG Competitive Ascendant+ map picks from Patch 13.01 are combined with Patch 13.00 because the current high-rank window is still small. Percentages are individual agent pick share within the combined Ascendant-to-Radiant map sample; no five-agent lineup win rate is claimed."
      },
      highRankPickRates: { Chamber: 16.09, Clove: 8.55, Iso: 1.32, Jett: 18.47, "KAY/O": 0.52, Neon: 3.74, Reyna: 11.15, Sova: 17.13, Viper: 6.92 },
      rolePickRates: buildRolePickRates({ Astra: 3.89, Breach: 0.07, Brimstone: 0.21, Chamber: 16.09, Clove: 8.55, Cypher: 1.27, Deadlock: 0.15, Fade: 0.14, Gekko: 0.17, Harbor: 2.06, Iso: 1.32, Jett: 18.47, "KAY/O": 0.52, Killjoy: 0.06, Miks: 0.91, Neon: 3.74, Omen: 1.39, Phoenix: 1.88, Raze: 0.23, Reyna: 11.15, Sage: 0.53, Skye: 0.47, Sova: 17.13, Tejo: 0.11, Veto: 0.38, Viper: 6.92, Vyse: 0.17, Waylay: 1.24, Yoru: 0.77 }),
      agentInsights: {
        Chamber: "Breeze is built for Chamber. The map is wide, sightlines are long, and flanks take forever to check manually. Put Trademark on the lurk path your team is not holding, then play for first contact with Headhunter, Operator, or Tour De Force. Set Rendezvous before you peek. Your job is to take the opening duel, leave alive, and make them spend utility clearing the same lane again.",
        Clove: "Clove fits Breeze because you can keep smoking from long range as the round rotates, then still help after death. If a hit comes in late, your post-death utility can buy cover and keep the push playable.",
        Jett: "Breeze rewards Jett because the map is built around long, open fights. Post with an Operator on A Main, B Main, Mid, or Hall, take first contact, then Tailwind out before the trade arrives. Updraft gives you extra off-angles over cover and pyramids, forcing enemies to clear more than head height.",
        Neon: "Breeze gives Neon room to work. High Gear lets you steal mid space, hit far lanes fast, and punish slow rotates across the map. Do not sprint dry through long sightlines. Use Fast Lane, Relay Bolt, and teammate utility to break the Operator angles first.",
        Reyna: "Breeze gives Reyna the fights she wants: wide lanes, long peeks, and isolated defenders. Take first contact on your terms, then use Dismiss after the kill so the trade arrives late. Leer is a setup tool, not full site utility. If you are not winning opening duels, this pick gives the team very little.",
        Iso: "Breeze rewards Iso when you turn the map’s long lanes into clean 1v1s. Pop Double Tap before first contact, then use Contingency to cut Operator angles and cross open space. Do not dry swing into multiple site lines. Iso wins here by forcing one fight at a time.",
        "KAY/O": "KAY/O is a solid Breeze pick when your comp already has real recon. ZERO/point pressures Viper, Cypher, and site anchors before the hit, which matters on a map where dry long-range entries get punished. Use him to disable the first layer, flash teammates through chokes, and trade. Do not treat him as your only info tool; Breeze is too wide for that.",
        Sova: "Sova works on Breeze because the map is too wide to face-check. Recon Bolt and Owl Drone let you clear long lanes, back site, and close corners before your team walks into Operator angles. Use utility to take info first, then swing with numbers. Dry entrying Breeze wastes the agent.",
        Sage: "Sage is a stall pick on Breeze, not a real flank solution. The map is too wide for her to replace a trip sentinel. Use Barrier to cut A Main or B Main pressure and Slow Orbs to punish teams forcing through the choke. If your team needs lurk control, Sage does not solve that problem.",
        Viper: "Viper fits Breeze because the sites are wide and the sightlines are long. Toxic Screen gives your team a real lane onto A or B instead of dry-walking into every angle at once. Keep fuel for the plant and retake pressure; an empty Viper after the hit is just a weak smoker."
      },
      lineupLinks: [
        { label: "LineupsValorant — Breeze", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Breeze", url: "https://upforge.gg/lineups" }
      ]
    },
    {
      id: "split",
      label: "Split",
      inCompetitivePool: true,
      cardImage: "/assets/library/maps/split-card.png",
      layoutImage: "/assets/library/maps/split-layout-trn.png",
      calloutLabelsBakedIn: true,
      callouts: [
        { id: "split-1", sourceKey: "A::Back", sourceLabel: "A Back", label: "A Back", superRegionName: "A", regionName: "Back", x: 22.93, y: 12.47 },
        { id: "split-2", sourceKey: "A::Lobby", sourceLabel: "A Lobby", label: "A Lobby", superRegionName: "A", regionName: "Lobby", x: 65.05, y: 16.61 },
        { id: "split-3", sourceKey: "A::Main", sourceLabel: "A Main", label: "A Main", superRegionName: "A", regionName: "Main", x: 49.17, y: 20.77 },
        { id: "split-4", sourceKey: "A::Rafters", sourceLabel: "A Rafters", label: "A Rafters", superRegionName: "A", regionName: "Rafters", x: 35.4, y: 27.37 },
        { id: "split-5", sourceKey: "A::Ramps", sourceLabel: "A Ramps", label: "A Ramps", superRegionName: "A", regionName: "Ramps", x: 47.17, y: 35.98 },
        { id: "split-6", sourceKey: "A::Screens", sourceLabel: "A Screens", label: "A Screens", superRegionName: "A", regionName: "Screens", x: 15.04, y: 25.7 },
        { id: "split-7", sourceKey: "A::Sewer", sourceLabel: "A Sewer", label: "A Sewers", superRegionName: "A", regionName: "Sewer", x: 65.75, y: 31.83 },
        { id: "split-8", sourceKey: "A::Site", sourceLabel: "A Site", label: "A Site", superRegionName: "A", regionName: "Site", x: 31.48, y: 18.37 },
        { id: "split-9", sourceKey: "A::Tower", sourceLabel: "A Tower", label: "A Heaven", superRegionName: "A", regionName: "Tower", x: 31.58, y: 33.59 },
        { id: "split-10", sourceKey: "Attacker Side::Spawn", sourceLabel: "Attacker Side Spawn", label: "Attacker Side Spawn", superRegionName: "Attacker Side", regionName: "Spawn", x: 84.68, y: 54.92 },
        { id: "split-11", sourceKey: "B::Alley", sourceLabel: "B Alley", label: "B Alley", superRegionName: "B", regionName: "Alley", x: 21.3, y: 78.79 },
        { id: "split-12", sourceKey: "B::Back", sourceLabel: "B Back", label: "B Back", superRegionName: "B", regionName: "Back", x: 26.36, y: 93.99 },
        { id: "split-13", sourceKey: "B::Link", sourceLabel: "B Link", label: "B Link", superRegionName: "B", regionName: "Link", x: 65.73, y: 69.97 },
        { id: "split-14", sourceKey: "B::Garage", sourceLabel: "B Garage", label: "B Main", superRegionName: "B", regionName: "Garage", x: 54.2, y: 86.85 },
        { id: "split-15", sourceKey: "B::Rafters", sourceLabel: "B Rafters", label: "B Rafters", superRegionName: "B", regionName: "Rafters", x: 36.87, y: 74.73 },
        { id: "split-16", sourceKey: "B::Site", sourceLabel: "B Site", label: "B Site", superRegionName: "B", regionName: "Site", x: 35.35, y: 86.66 },
        { id: "split-17", sourceKey: "B::Stairs", sourceLabel: "B Stairs", label: "B Stairs", superRegionName: "B", regionName: "Stairs", x: 31.48, y: 61.48 },
        { id: "split-18", sourceKey: "B::Tower", sourceLabel: "B Tower", label: "B Heaven", superRegionName: "B", regionName: "Tower", x: 42.96, y: 68.44 },
        { id: "split-19", sourceKey: "B::Lobby", sourceLabel: "B Lobby", label: "B Lobby", superRegionName: "B", regionName: "Lobby", x: 68.75, y: 79.68 },
        { id: "split-20", sourceKey: "Defender Side::Spawn", sourceLabel: "Defender Side Spawn", label: "Defender Side Spawn", superRegionName: "Defender Side", regionName: "Spawn", x: 14.29, y: 53.05 },
        { id: "split-21", sourceKey: "Mid::Bottom", sourceLabel: "Mid Bottom", label: "Mid Bottom", superRegionName: "Mid", regionName: "Bottom", x: 61.6, y: 54.76 },
        { id: "split-22", sourceKey: "Mid::Mail", sourceLabel: "Mid Mail", label: "Mid Mail", superRegionName: "Mid", regionName: "Mail", x: 46.71, y: 60.75 },
        { id: "split-23", sourceKey: "Mid::Top", sourceLabel: "Mid Top", label: "Mid Top", superRegionName: "Mid", regionName: "Top", x: 48.36, y: 53.99 },
        { id: "split-24", sourceKey: "Mid::Vent", sourceLabel: "Mid Vent", label: "Mid Vents", superRegionName: "Mid", regionName: "Vent", x: 42.58, y: 45.15 }
      ],
      plantSpots: [
        { number: 1, site: "A", label: "A Default", rate: 15.39, x: 84.3, y: 29.6, previewLabel: "A Default in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/b99bab902f64289dcade6a53f141639c33ac3a1e-1466x646.jpg?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 2, site: "A", label: "A Screens Plant", rate: 4.83, x: 93.6, y: 25.4, previewLabel: "A lower-site in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/ab0936e9b7742f98920efa81852740809650bad4-733x646.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 3, site: "A", label: "A Open Plant", rate: 18.58, x: 92.6, y: 33.8, previewLabel: "A open corner in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/3d2a7e4491b82d82be503ab28141c932658a3ff1-733x646.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 1, site: "B", label: "B Open Plant", rate: 26.94, x: 11.1, y: 29.6, previewLabel: "B Main plant in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/ded16cdf2c51e60bfbaa8e80dd40740610dee46f-663x653.png?auto=format", previewSource: PLANT_IMAGE_SOURCE },
        { number: 2, site: "B", label: "B Default", rate: 53.76, x: 12.3, y: 34.4, previewLabel: "B Default in-game reference", previewImage: "https://cdn.sanity.io/images/ccckgjf9/production/73c66772d5104035c44ce207d3b7ad4a827d6a15-663x653.png?auto=format", previewSource: PLANT_IMAGE_SOURCE }
      ],
      plantRateNote: "Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive.",
      weaponSuggestions: [
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Highest rifle conversion", locations: "A Main, B Main, Vents, Mail", roundConversion: { scope: "Combined", value: 51.18, sample: "1,385,619 active-season full-buy rounds", comparisonLabel: "Second rifle", comparisonWeapon: "Vandal", comparisonValue: 50.26 }, note: "Phantom is strong on Split because most fights are close or mid range and sites get buried in smokes. You can spam common choke points, fight through utility, and spray transfer in tight lanes without giving up tracers." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Operator fits Split as a defensive punish weapon, not a default buy. Hold A Main, Mid, or B Main from deep angles, take the first kill, then fall back into heaven or vents support. On attack, only buy it when your plan gives you a posted angle after contact; forcing it into Split’s tight retakes bleeds credits.", side: "DEF", locations: "A Ramps, B Main, Mid", roundConversion: { scope: "Defense", value: 54.62, sample: "158,318 active-season defense full-buy rounds", comparisonLabel: "Second sniper", comparisonWeapon: "Outlaw", comparisonValue: 46.61 }, conversion: "Great for taking the first lane fight, but once attackers get into Split’s tight towers, vents, and site pockets, Judge and Bucky start getting real value.", note: "On defense, take your opening fight from a spot with a clean exit. If the round slows down, don’t overstay and let it turn into a forced close-range retake." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Highest pistol conversion", locations: "A Main, Mid, B Main", roundConversion: { scope: "Combined", value: 50.64, sample: "2,851,065 active-season pistol rounds", comparisonLabel: "Second pistol", comparisonWeapon: "Frenzy", comparisonValue: 50.59 }, note: "Split rewards clean first bullets. Use this to punish Mid, A Ramp, and B Main fights before they turn into choke spam. Take the headshot duel, then move." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "Split is packed with tight chokes and layered corners: B Main, A Ramps, Mail, Vents. Play those spaces and this weapon turns contact into fast kills. Take long, open fights and you are throwing away its value.", side: "DEF", locations: "B Tower, Vents, A Heaven", roundConversion: { scope: "Defense", value: 49.84, sample: "36,692 active-season defense full-buy rounds", comparisonLabel: "Second shotgun", comparisonWeapon: "Bucky", comparisonValue: 46.08 }, conversion: "Judge converts on Split when you force contact in tight lanes: B Main, A Ramps, Vents, Mail, ropes, and site corners. Do not take fair Mid or Main duels with it. Close the gap, play off smokes, and make them clear you point-blank.", note: "Split gives you tight defensive chokes. Use this weapon to punish B Main, A Main, or Mail from a new close angle each round. After the first kill, move or upgrade. Repeating the same corner gets you cleared." },
        { weapon: "Spectre", image: "/assets/weapons/spectre.png", category: "eco", fit: "Highest eco conversion", locations: "B Tower, Vents, A Main", roundConversion: { scope: "Combined", value: 33.75, sample: "134,619 active-season second-round-loss rounds", comparisonLabel: "Second SMG", comparisonWeapon: "Stinger", comparisonValue: 30.18 }, note: "Spectre is strong on Split when you keep fights close. Use it in B Main, A Main, site corners, and ropes fights. Do not dry swing long Mid angles with it. Close space first or play a crossfire." }
      ],
      macro: {
        _researchNote: "internal only, do not render",
        _researchUrl: "https://www.youtube.com/watch?v=I2kxN3-V4zg",
        defense: [
          "Do not defend Split as two separate sites. Make Mid expensive every round. If attackers take Mid cleanly, Vents and Mail give them fast splits onto both sites and your anchors get pinched instead of taking fair fights."
        ],
        attack: [
          "A and B are tight sites on opposite ends, so you can’t waste too much time figuring out which hit is real. If your read is slow, rotations and utility catch up fast because there isn’t much of a mid buffer to bail you out.",
          "Split attack starts with Mid. If you leave Mid untouched, defenders anchor sites comfortably and rotate through heaven for free. Take Mid, pressure Mail and Vents, then choose the site after defenders show their setup."
        ]
      },
      siteTips: [
        { label: "A Site", text: "On Split A, Heaven and Screens punish autopilot plants. A smoke only blocks vision; it does not clear the space. Clear one, isolate the other, then plant where your team can actually hold.", roles: ["Duelist", "Initiator"] },
        { label: "A Ramps", text: "A Ramps decides most A hits. If you leave it to defenders, A Main becomes a shooting gallery from Heaven and Screens. Take Ramps, pressure Heaven, then scale site with two angles instead of one choke.", roles: ["Controller", "Sentinel"] },
        { label: "B Site", text: "Do not dry swing B Main as the whole plan. Split B punishes single-lane hits with Heaven pressure and stacked site angles. Pair B Main contact with Mid control, Mail pressure, or utility that cuts Heaven before your entry commits.", roles: ["Duelist", "Initiator"] },
        { label: "B Alley", text: "On Split, the plant dies if the rotate lane is open. Smoke or stall Heaven, Screens, CT, or B Heaven until the spike is planted. After that, shift the same utility onto the retake choke. Make defenders spend utility before they see the bomb.", roles: ["Controller", "Sentinel"] }
      ],
      teamplayTips: [
        { label: "Fight for Mid Control", text: "On Split, dry five-man site hits are weak. Pair every A or B exec with mid pressure on the matching Tower: Vents for A, Mail for B. If mid is stalled, your site hit walks into free Heaven crossfire." },
        { label: "Chain Utility, Don’t Dump It", text: "Split rewards layered setups. Put one piece of utility at the choke, one behind the first contact, and one for the retake path. If everything is sitting in the same corner, attackers clear it once and your whole defense disappears." },
        { label: "Retake With Utility, Not Dry", text: "Do not spend every cooldown on first contact. Split retakes are fought through tight doors, ramps, and heaven drops. One saved flash, smoke, slow, or molly can break the post-plant instead of forcing a dry swing." }
      ],
      roleNotes: {
        Duelist: [{ category: "attack", text: "Split has brutal first chokes. Your job is to break A Main, B Main, or Mid contact first, not wait behind utility. Use dash, satchel, slide, flash, or nade pressure to force defenders off the angle so your team can trade and take space." }, { category: "sites", text: "On Split, duelist value comes from taking height. Let smokes, flashes, or stuns break the first hold, then burst into A Heaven, B Heaven, Mail, or Vents. If you stop at the choke, defenders keep every strong angle." }, { category: "defense", text: "Only pressure a choke if you still have a clean way out before the trade swings you." }],
        Initiator: [{ category: "attack", text: "Split punishes dry contact through narrow chokes. Flash, stun, or reveal as your duelists cross the choke, not before they are ready. Early utility gives defenders time to tuck, call it, and fight the swing clean." }, { category: "sites", text: "Split punishes lazy info. Your drone, dog, knife, or reveal should isolate one pocket at a time: Heaven, Screens, Mail, Vents, back site. If your utility only clears the choke, the hit is still blind." }, { category: "defense", text: "Do not spend your whole kit on the first hit. Split retakes run through tight doors and heaven drops. Keep one flash, drone, dog, or reveal for the re-clear, or your team walks back in dry." }],
        Controller: [{ category: "sites", text: "Your job is to break the vertical crossfires. On A, smoke Heaven/Rafters and Screens before the hit. On B, smoke B Heaven and CT. If those sightlines stay open, your entry has to clear site, high ground, and rotation pressure at the same time." }, { category: "attack", text: "On Split mid, deny one elevated angle before your team walks up. Smoke Vents if you are taking Mail. Smoke Mail if you are pressuring Vents or A Heaven. Leaving both open turns mid into a crossfire your entry should not have to solve." }, { category: "teamplay", text: "Use Split one-ways with a purpose, not as decoration. If the smoke is not sitting high enough, it is just a normal smoke with bad coverage. Call the gap it leaves so your teammate does not swing the uncovered lane for free." }],
        Sentinel: [{ category: "teamplay", text: "Mid is the hinge on Split. Put Sentinel utility on the Mail and Vents paths so your team gets the Heaven pressure call before the site anchor is getting pinched." }, { category: "defense", text: "Don’t pile your whole setup on one pixel. Split funnels attackers through A Main, B Main, and Mid, so clustered utility gets cleared by one explosive, drone path, or spam burst. Stagger your traps and stall pieces so clearing the first layer does not open the site." }, { category: "defense", text: "On Split, do not give attackers the same Sentinel picture every gun round. Shift your setup pressure between B Main, Mid, and A Main. Once your default is solved, they hit faster and spend less utility clearing you." }]
      },
      metaComp: {
        agents: ["Clove", "Cypher", "Jett", "Reyna", "Skye"],
        composition: "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel",
        patch: "13.01 + 13.00"
      },
      metaComps: [
        { label: "Double-duelist layout", agents: ["Clove", "Cypher", "Jett", "Reyna", "Skye"], composition: "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel" },
        { label: "Double-initiator layout", agents: ["Clove", "Cypher", "Fade", "Jett", "Skye"], composition: "1 Controller, 1 Duelist, 2 Initiators, 1 Sentinel" },
        { label: "Double-sentinel layout", agents: ["Clove", "Cypher", "Jett", "Sage", "Skye"], composition: "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels" }
      ],
      compSample: {
        rankLabel: "Ascendant to Radiant",
        patchLabel: "13.01 + 13.00",
        currentPatchAgentSelections: 4170,
        combinedAgentSelections: 637716,
        source: "OP.GG Competitive",
        note: "OP.GG Competitive Ascendant+ map picks from Patch 13.01 are combined with Patch 13.00 because the current high-rank window is still small. Percentages are individual agent pick share within the combined Ascendant-to-Radiant map sample; no five-agent lineup win rate is claimed."
      },
      highRankPickRates: { Clove: 16.18, Cypher: 6.88, Fade: 4.49, Jett: 14.04, Neon: 2.45, Raze: 7.84, Reyna: 8.70, Sage: 5.54, Skye: 11.07 },
      rolePickRates: buildRolePickRates({ Astra: 0.30, Breach: 1.12, Brimstone: 0.24, Chamber: 5.64, Clove: 16.18, Cypher: 6.88, Deadlock: 0.63, Fade: 4.49, Gekko: 0.14, Harbor: 0.05, Iso: 0.65, Jett: 14.04, "KAY/O": 0.29, Killjoy: 0.69, Miks: 0.97, Neon: 2.45, Omen: 2.75, Phoenix: 3.35, Raze: 7.84, Reyna: 8.70, Sage: 5.54, Skye: 11.07, Sova: 0.48, Tejo: 0.62, Veto: 0.74, Viper: 0.70, Vyse: 0.81, Waylay: 2.11, Yoru: 0.55 }),
      agentInsights: {
        Clove: "Clove fits Split because Mid decides the map and Clove can fight there without giving up controller value. Smoke Mail, Vents, and Heaven to let your team take space or pivot fast. On defense, take aggressive Mid fights with support. If you die, your post-death smokes can still slow the split and keep the round playable.",
        Jett: "Jett fits Split because the map is choke-heavy and vertical. On attack, use Cloudburst + Dash to break A Main or B Main contact instead of dry-swinging into stacked crossfires. On defense, her Operator value is high: take the first fight in Mid, A Main, or B Main, then Dash out before the trade arrives. Updraft also lets you contest Heaven and rafters angles without walking into them for free.",
        Raze: "Raze is strong on Split because the map forces fights through narrow lanes and stacked close angles. Boom Bot and Paint Shells punish A Main, B Main, vents, ropes, and heaven holds. Blast Packs let you break static crossfires and contest vertical space instead of slow-walking into it.",
        Neon: "Neon is strongest on Split when Mid control is already cracked. Use Relay Bolt to stun Mail, Vents, or Heaven angles, then Fast Lane through the gap before defenders reset above you. Do not dry sprint into A Main or B Main. Split has too many close corners and vertical crossfires for solo hero entries.",
        Reyna: "Split gives Reyna the close fights she wants, but the map does not let her solo-entry for free. A Main, B Main, and Mid are choke-heavy. Use Leer and team utility to force a real duel, then Dismiss out after the first kill. If you dry swing first contact every round, you are just donating the opener.",
        Skye: "Skye fits Split because Guiding Light can curve through the tight corners, and Trailblazer checks close pockets before your duelists commit.",
        Fade: "Use Prowlers to clear Split’s tight close corners, then lean on Haunt to confirm the stacked vertical positions around Mid before you commit.",
        Sage: "Sage is a strong Split pick because the map forces teams through narrow lanes. Your wall and slows punish B Main, A Ramp, and Mid pressure hard. She is defense-leaning here: stall the hit, force utility to break your wall, then play for the delayed retake or rez value.",
        Cypher: "Cypher fits Split because the map is narrow and rotation-heavy. Trips can lock flank routes, catch Mid pressure, and let you anchor without guessing. On defense, use him to hold a lane solo and free teammates to fight Mid. On attack, his value drops if your trips only watch spawn. Place them to protect the lurk and punish fast retakes."
      },
      lineupLinks: [
        { label: "LineupsValorant — Split", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Split", url: "https://upforge.gg/lineups" }
      ]
    }
  ];

  globalThis.RankedCoachGamesenseMaps = Object.freeze(GAMESENSE_MAPS);
})();
