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
      layoutImage: "/assets/library/maps/bind-layout-labeled.svg",
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
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Best rifle fit", locations: "Hookah, Lamps, Showers", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "Compact chokes and frequent smoke fights reward the Phantom's close-range control." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Strong sniper fit", side: "DEF", locations: "B Long, A Tower, A Short", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", conversion: "Conversion read: stronger than a shotgun while the first duel stays long; Judge and Bucky gain value once Hookah or Lamps is the planned contact.", note: "On defense, long lanes create early picks, while either teleporter can turn a missed opening read into a fast cross-map fight. Pair the Operator with an escape tool and a called rotation." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Pistol-round fit", locations: "A Short, Showers, B Long", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "The quiet, accurate first shot fits Bind's early lane fights while keeping utility in the buy." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "Close conversion rival", side: "DEF", locations: "Hookah, Lamps, U-Haul", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", conversion: "Conversion read: more repeatable than an Operator when the setup guarantees two close contacts; much weaker if attackers can reset to Long or Showers.", note: "On defense, commit it to a compact choke and plan the rifle recovery after the first conversion." },
        { weapon: "Stinger", image: "/assets/weapons/stinger.png", category: "eco", fit: "Eco outlier", locations: "Hookah, Lamps, Showers", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "The low-cost damage output is useful only when the setup protects a close fight and a short magazine." }
      ],
      macro: {
        _researchNote: "internal only, do not render",
        _researchUrl: "https://www.zleague.gg/theportal/woohoojin-mastering-the-bind-map-in-valorant/",
        defense: [
          "Treat Hookah, Showers, Octagon, and U-Haul as Bind's high-value control areas. Double up when the read calls for it; owning one of these lanes gives the retake a flank route and shortens the next rotation.",
          "On A site, contest Showers or U-Haul before settling into straight-site positions. Giving up both lets attackers flood the site with utility and leaves the retake entering through predictable lanes.",
          "Look for repeated defaults, late lurks, and teleporter timings, then call an early punish. Waiting until the execute lands gives the pattern its value."
        ],
        attack: [
          "Bind's two teleporters turn lane control into fast cross-map rotations. Draw utility or defenders first, then arrive at the exit together instead of treating first contact as a forced site commitment.",
          "Read the defensive composition before choosing pace: break sentinel utility early and commit late into double Sentinel; hit earlier into double Controller before rotating smokes recycle; hold disciplined defaults into double Initiator so repeated information sees no commitment; against double Duelist, take or hold forward lanes so aggression is called and traded."
        ]
      },
      siteTips: [
        { label: "A Showers", text: "Clear Showers before the spike crosses Truck. A defender left there can split the site, punish the plant, and isolate the A Short group.", roles: ["Duelist", "Initiator"] },
        { label: "A Lamps / U-Haul", text: "Take and hold Lamps/U-Haul through the plant. It is the defenders' closest retake path and protects the planter from an immediate site re-entry.", roles: ["Controller", "Sentinel"] },
        { label: "B Hookah", text: "Build the B split around synchronized Hookah and Garden/B Long contact. Hold the drop until the Long group can trade, then clear site and Elbow from different directions.", roles: ["Duelist", "Initiator"] },
        { label: "B Long / Octagon", text: "Keep Long or Octagon after the plant while a teammate holds site or Hookah. That crossfire forces the retake to clear separate lines instead of collapsing through Defender Spawn and Elbow together.", roles: ["Controller", "Sentinel"] }
      ],
      teamplayTips: [
        { label: "Common fake", text: "Sell A with Showers and A Short utility, then send one player through the A teleporter while the spike group holds B Long. Call whether the exit player is selling Hookah pressure or joining the hit before the audio plays." },
        { label: "Eco-round plan", text: "Group the low buy to break one piece of sentinel utility and force a compact trade through Showers, U-Haul, or Hookah. Recover the first rifle before spreading into open lanes." },
        { label: "Round-plan execution", text: "Before barriers drop, name the first lane, the teleporter trigger, and the reset condition. Bind's rotations are fast only when the destination group is ready for the exit fight." }
      ],
      roleNotes: {
        Duelist: [{ category: "attack", text: "Take first space through A Short, Showers, Hookah, or B Long after support utility lands." }, { category: "sites", text: "On A, force the Showers split angle off and clear U-Haul/Lamps; on B, clear Hookah and Elbow before teammates spread into site." }, { category: "defense", text: "Contest Hookah, Showers, Octagon, or U-Haul with an escape plan instead of dry re-peeking after contact." }],
        Initiator: [{ category: "attack", text: "Reveal or clear Hookah, B Long, Showers, and A Short immediately before the entry moves." }, { category: "sites", text: "Use flashes and scans to isolate U-Haul/Lamps, A Tower, Elbow, and Defender Spawn rather than covering empty space." }, { category: "teamplay", text: "Track teleporter audio and call the exit so the team rotates before the destination fight is already lost." }],
        Controller: [{ category: "sites", text: "For A hits, smoke off A Tower and cover U-Haul/Lamps or Showers based on the lane the team owns; for B hits, smoke off Defender Spawn and Elbow." }, { category: "teamplay", text: "One-way smokes are setup-dependent and should not replace the smokes the execute needs." }, { category: "defense", text: "Keep one smoke or damage tool for the post-plant because Bind retakes arrive through narrow named lanes." }],
        Sentinel: [{ category: "teamplay", text: "Place flank utility where it survives common prefire paths and still catches teleporter rotations." }, { category: "defense", text: "Anchor where you can punish Hookah, B Long, A Short, or Showers contact without giving a free first death." }, { category: "defense", text: "Change trap and camera height between gun rounds so the same clear does not solve the setup twice." }]
      },
      metaComp: {
        agents: [],
        composition: "No current ranked composition sample",
        patch: "13.01"
      },
      metaComps: [],
      compStatus: "No verified composition reference is available for this map.",
      agentInsights: {
        Clove: "Post-death smokes keep both teleporter rotations covered after an opening fight.",
        Raze: "Explosive movement and clearing utility break Bind's narrow Hookah, Showers, and A Short chokes.",
        Fade: "Haunt and Prowlers clear U-Haul/Lamps, Hookah, and site corners immediately before contact.",
        Cypher: "Flank information survives teleporter rotations; B is the higher-success anchor site in this current sample.",
        Skye: "Guiding Light can curve through both compact site entrances and support fast re-clears."
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
      layoutImage: "/assets/library/maps/breeze-layout-labeled.svg",
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
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Highest rifle conversion", locations: "A Main, B Main, Mid", roundConversion: { scope: "Combined", value: 50.87, sample: "896,805 active-season full-buy rounds", comparisonLabel: "Second rifle", comparisonWeapon: "Vandal", comparisonValue: 50.41 }, note: "Smoke fights and close site finishes give the Phantom a narrow conversion edge, while the Vandal remains the cleaner long-lane one-tap choice." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "High-value sniper", side: "DEF", locations: "A Main, B Main, Mid Nest", roundConversion: { scope: "Defense", value: 52.43, sample: "230,391 active-season defense full-buy rounds", comparisonLabel: "Second sniper", comparisonWeapon: "Outlaw", comparisonValue: 44.64 }, conversion: "Conversion read: the Operator wins the defense-side sniper comparison; Judge or Bucky only catches up inside a deliberately protected Tunnel or Hall pocket.", note: "On defense, the map gives repeated long-lane shots. Mobility or teleport tools make the weapon safer after contact." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Highest pistol conversion", locations: "A Main, Mid, B Main", roundConversion: { scope: "Combined", value: 50.64, sample: "2,791,564 active-season pistol rounds", comparisonLabel: "Second pistol", comparisonWeapon: "Sheriff", comparisonValue: 50.21 }, note: "Use cover and first-shot accuracy across Breeze's long pistol lanes while preserving credits for utility." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "Best shotgun conversion", side: "DEF", locations: "A Hall, B Tunnel", roundConversion: { scope: "Defense", value: 48.24, sample: "27,678 active-season defense full-buy rounds", comparisonLabel: "Second shotgun", comparisonWeapon: "Bucky", comparisonValue: 44.24 }, conversion: "Conversion read: the shotgun remains location-dependent and cannot match the Operator across Breeze's open sites.", note: "On defense, treat it as a protected Hall or Tunnel ambush, then recover a ranged weapon before rotating into open space." },
        { weapon: "Spectre", image: "/assets/weapons/spectre.png", category: "eco", fit: "Highest eco conversion", locations: "Tunnel and close Hall pockets", roundConversion: { scope: "Combined", value: 33.61, sample: "128,040 active-season second-round-loss rounds", comparisonLabel: "Second SMG", comparisonWeapon: "Stinger", comparisonValue: 29.69 }, note: "Use it with a deliberate close-range route; most Breeze fights still expose an SMG's range limit." }
      ],
      macro: {
        _researchNote: "internal only, do not render",
        _researchUrl: "https://www.youtube.com/watch?v=0VLyBGR5sNA",
        defense: [
          "Mid is the strategic core of this map — mid control is less about the space itself and more about the pressure it lets you apply to both sites at once."
        ],
        attack: [
          "Smoking Mid Nest removes the Operator angle that otherwise dominates that lane — a specific, repeatable utility play, not just a generic smoke.",
          "Smoking Tunnel forces defenders into a binary choice: play the tunnel more aggressively than they'd like, or fall back and give up the space."
        ]
      },
      siteTips: [
        { label: "A Pyramids", text: "Split the two pyramids into separate clears. Plant only after the close side and Back Site lane have been accounted for.", roles: ["Duelist", "Initiator"] },
        { label: "A Bridge", text: "Keep Bridge denied during the plant; its elevation watches both the site crossing and several pyramid plants.", roles: ["Controller", "Sentinel"] },
        { label: "B Pillar", text: "Use Pillar to isolate the first defender, then clear Back Site before spreading into the open plant lanes.", roles: ["Duelist", "Initiator"] },
        { label: "B Tunnel", text: "Tunnel control shortens the defender rotation and protects a B split, but only if the Mid player can be traded.", roles: ["Controller", "Sentinel"] }
      ],
      teamplayTips: [
        { label: "Mid leverage", text: "Keep one player connected to Mid while the site group pressures Main; that threat prevents both defenders from leaning into one entrance." },
        { label: "Long trades", text: "Breeze spacing stretches trade distance. Say who follows the first contact before crossing an open lane." },
        { label: "Late information", text: "Save one scan, camera, or flank trap for the rotation because a wrong site read costs more time here than on compact maps." }
      ],
      roleNotes: {
        Duelist: [{ category: "attack", text: "Use movement to cross the long exposed lanes after recon or a flash removes the first angle." }, { category: "attack", text: "Create pressure from Mid or Hall so defenders cannot hold one site entrance with every rifle." }, { category: "defense", text: "Operator rounds need a planned escape route; do not repeat the same long angle after revealing the weapon." }],
        Initiator: [{ category: "attack", text: "Scan or drone the long sightline the duelist is about to cross, not the site after contact begins." }, { category: "sites", text: "Use Mid Nest, Tunnel, Back Site, and Hall as named utility targets so the team knows what is actually cleared." }, { category: "teamplay", text: "Save one information tool for the late rotation because the distance between sites makes false reads expensive." }],
        Controller: [{ category: "sites", text: "Viper-style walls are strongest when they split a site into a playable front half and an isolated defender half." }, { category: "attack", text: "Remove Mid Nest or Tunnel when taking center control; both positions can hold multiple rotation paths." }, { category: "teamplay", text: "Prioritize complete lane denial and fuel timing over difficult one-way setups on Breeze's open geometry." }],
        Sentinel: [{ category: "teamplay", text: "Use flank utility to protect the long rotations, then survive so that information remains useful." }, { category: "defense", text: "Anchor from off-angles that force attackers to clear after crossing open ground." }, { category: "defense", text: "Do not stack every piece of utility on one site when Mid pressure can break the setup from behind." }]
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
        Chamber: "Trademark protects the long flank while Rendezvous supports aggressive Operator holds; B has the stronger current defensive success in this sample.",
        Clove: "Long-range smoke placement stays useful through Breeze rotations, and post-death utility protects late hits.",
        Jett: "Dash and Updraft create a safe exit from the long Operator lanes that define first contact.",
        Neon: "High Gear closes Breeze's long gaps quickly enough to punish defenders before cross-map help arrives.",
        Reyna: "Dismiss gives a self-sufficient escape after winning one of Breeze's exposed long-range duels.",
        Iso: "Double Tap and Contingency help isolate one long sightline instead of fighting the full open site.",
        "KAY/O": "ZERO/point and suppression give the second-initiator layout a direct way to disable defensive utility before crossing Breeze's long lanes.",
        Sova: "Recon and Drone clear wide sightlines where close-range flashes cannot cover every defender.",
        Sage: "Barrier and Slow Orbs compress open entrances; A is the stronger current anchor site for her stall package.",
        Viper: "Toxic Screen divides the open sites into playable halves and preserves fuel for post-plant denial."
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
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Highest rifle conversion", locations: "A Main, B Main, Vents, Mail", roundConversion: { scope: "Combined", value: 51.18, sample: "1,385,619 active-season full-buy rounds", comparisonLabel: "Second rifle", comparisonWeapon: "Vandal", comparisonValue: 50.26 }, note: "Split's compact chokes and smoke-heavy site fights reward the Phantom's close-range control." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Conditional sniper", side: "DEF", locations: "A Ramps, B Main, Mid", roundConversion: { scope: "Defense", value: 54.62, sample: "158,318 active-season defense full-buy rounds", comparisonLabel: "Second sniper", comparisonWeapon: "Outlaw", comparisonValue: 46.61 }, conversion: "Conversion read: excellent for the opening lane, but Judge and Bucky gain value after attackers enter Split's tight towers, vents, and site pockets.", note: "On defense, take the opening pick beside an exit. Do not drag the slow cycle into a forced close retake." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Highest pistol conversion", locations: "A Main, Mid, B Main", roundConversion: { scope: "Combined", value: 50.64, sample: "2,851,065 active-season pistol rounds", comparisonLabel: "Second pistol", comparisonWeapon: "Frenzy", comparisonValue: 50.59 }, note: "Its first-shot accuracy covers the medium lanes without consuming the utility budget needed to break Split's chokes." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "High close conversion", side: "DEF", locations: "B Tower, Vents, A Heaven", roundConversion: { scope: "Defense", value: 49.84, sample: "36,692 active-season defense full-buy rounds", comparisonLabel: "Second shotgun", comparisonWeapon: "Bucky", comparisonValue: 46.08 }, conversion: "Conversion read: the Judge is the stronger shotgun when the route forces repeated close fights, but loses value immediately if Mid or Main opens the range.", note: "On defense, anchor one compact route, vary the corner, and plan how the weapon leaves the round after the first close duel." },
        { weapon: "Spectre", image: "/assets/weapons/spectre.png", category: "eco", fit: "Highest eco conversion", locations: "B Tower, Vents, A Main", roundConversion: { scope: "Combined", value: 33.75, sample: "134,619 active-season second-round-loss rounds", comparisonLabel: "Second SMG", comparisonWeapon: "Stinger", comparisonValue: 30.18 }, note: "The compact corners suit the Spectre, but do not carry the setup into open Mid." }
      ],
      macro: {
        _researchNote: "internal only, do not render",
        _researchUrl: "https://www.youtube.com/watch?v=I2kxN3-V4zg",
        defense: [
          "Split's compact design means mid connects both sites more directly than on most maps — losing mid control lets attackers move and threaten either site quickly."
        ],
        attack: [
          "A and B sites are small and sit at opposite ends of the map — a slow read on which site is live costs more here than on a map with a real mid buffer.",
          "Controlling the center is often the deciding factor for both attack and defense, since it enables fast movement between points and keeps the defense guessing."
        ]
      },
      siteTips: [
        { label: "A Site", text: "Clear A Heaven and Screens as separate jobs before settling the plant; one smoke does not confirm either space is empty.", roles: ["Duelist", "Initiator"] },
        { label: "A Ramps", text: "Ramps control splits the defender's Heaven setup and gives the attack a safer route out of A Main.", roles: ["Controller", "Sentinel"] },
        { label: "B Site", text: "Pair B Main pressure with Mail or B Heaven utility so the entry is not fighting both elevations at once.", roles: ["Duelist", "Initiator"] },
        { label: "B Alley", text: "Keep the defender rotation lane blocked until the spike is secure, then shift the smoke or stall toward the retake choke.", roles: ["Controller", "Sentinel"] }
      ],
      teamplayTips: [
        { label: "Mid split", text: "Treat Vents and Mail as two separate clears. The site group should wait until the Mid group can pressure the matching Heaven lane." },
        { label: "Utility spacing", text: "Compact sites amplify utility, but stacked tools can be cleared together. Leave enough distance that one grenade cannot erase the full setup." },
        { label: "Retake reserve", text: "Hold one flash, smoke, slow, or damage tool for the retake; Split's small sites let one late cast touch most of the fight." }
      ],
      roleNotes: {
        Duelist: [{ category: "attack", text: "Use movement or explosive utility to break the first choke at A Main, B Main, or Mid." }, { category: "sites", text: "Take vertical space in A Heaven, B Heaven, Vents, and Mail after support utility forces defenders off the angle." }, { category: "defense", text: "Pressure a choke only when you can fall back before the trade arrives." }],
        Initiator: [{ category: "attack", text: "Narrow lanes reward flashes, stuns, and damage utility that land immediately before the swing." }, { category: "sites", text: "Clear A Heaven, Screens, B Heaven, Mail, and Vents as separate jobs instead of calling an entire site clear." }, { category: "defense", text: "Hold one piece of retake utility because Split sites are compact enough for a single well-timed cast to change the round." }],
        Controller: [{ category: "sites", text: "On A, remove A Heaven and Screens; on B, remove B Heaven and the defender rotation lane." }, { category: "attack", text: "Mid control usually needs a smoke at Mail or Vents so the team can fight one elevation at a time." }, { category: "teamplay", text: "Use ledge one-ways only when the height is consistent and teammates know the exposed lane." }],
        Sentinel: [{ category: "teamplay", text: "Trap the route that connects Mid to the site hit so defenders receive the rotation warning early." }, { category: "defense", text: "Layer stall utility with enough spacing that one grenade cannot clear everything." }, { category: "defense", text: "Rotate setups between B Main, Mid, and A Main pressure so attackers must re-clear the map each gun round." }]
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
        Clove: "Fast smokes cover Mail, Vents, and either Heaven while the team changes direction through Mid.",
        Jett: "Dash breaks the first compact choke and Updraft contests Split's stacked Heaven positions.",
        Raze: "Paint Shells and Blast Packs punish Split's compact chokes and vertical defender pockets.",
        Neon: "Fast Lane and High Gear turn a Mid opening into site pressure before defenders reset their vertical crossfires.",
        Reyna: "Dismiss lets her escape the close first duel, but the comp still relies on Skye to make that fight favorable.",
        Skye: "Guiding Light bends through Split's tight corners and Trailblazer clears the close pockets before both duelists commit.",
        Fade: "Prowlers clear close corners while Haunt confirms the stacked vertical positions around Mid.",
        Sage: "Wall and Slow Orbs delay narrow site entrances; B currently gives her the higher anchor conversion.",
        Cypher: "Trips control Mid-to-site rotations and let the anchor survive instead of guessing which choke broke."
      },
      lineupLinks: [
        { label: "LineupsValorant — Split", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Split", url: "https://upforge.gg/lineups" }
      ]
    }
  ];

  globalThis.RankedCoachGamesenseMaps = Object.freeze(GAMESENSE_MAPS);
})();
