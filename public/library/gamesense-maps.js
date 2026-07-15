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
      layoutImage: "/assets/library/maps/bind-layout.png",
      callouts: [
        { label: "A Site", x: 73.4, y: 33.3 },
        { label: "A Bath", x: 83.9, y: 43.0 },
        { label: "A Short", x: 62.4, y: 49.7 },
        { label: "A Lamps", x: 58.2, y: 33.9 },
        { label: "A Tower", x: 72.8, y: 20.8 },
        { label: "B Site", x: 29.2, y: 31.2 },
        { label: "B Long", x: 19.3, y: 51.5 },
        { label: "B Window", x: 32.3, y: 44.7 },
        { label: "B Elbow", x: 15.8, y: 30.6 },
        { label: "B Garden", x: 24.7, y: 42.8 }
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
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Best rifle fit", evidence: "0.84 kills per round | 202 average damage", locations: "Hookah, Lamps, Bath", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "Compact chokes and frequent smoke fights reward the Phantom's close-range control." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Strong sniper fit", side: "DEF", evidence: "0.80 kills per round | 220 average damage", locations: "B Long, A Tower, A Short", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", conversion: "Conversion read: stronger than a shotgun while the first duel stays long; Judge and Bucky gain value once Hookah or Lamps is the planned contact.", note: "On defense, long lanes create early picks, but the lack of mid makes a missed read expensive. Pair it with an escape tool or planned teleporter rotation." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Pistol-round fit", evidence: "500 credits | one-shot headshot through 30m", locations: "A Short, Bath, B Long", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "The quiet, accurate first shot fits Bind's early lane fights while keeping utility in the buy." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "Close conversion rival", side: "DEF", evidence: "1,850 credits | five-shell magazine", locations: "Hookah, Lamps, U-Hall", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", conversion: "Conversion read: more repeatable than an Operator when the setup guarantees two close contacts; much weaker if attackers can reset to Long or Bath.", note: "On defense, commit it to a compact choke and plan the rifle recovery after the first conversion." },
        { weapon: "Stinger", image: "/assets/weapons/stinger.png", category: "eco", fit: "Eco outlier", evidence: "228 average damage | 1,100 credits", locations: "Hookah, Lamps, Bath", roundConversionUnavailable: "Bind is outside the active-season Competitive sample.", note: "The low-cost damage output is useful only when the setup protects a close fight and a short magazine." }
      ],
      macro: {
        _researchNote: "internal only, do not render",
        _researchUrl: "https://www.zleague.gg/theportal/woohoojin-mastering-the-bind-map-in-valorant/",
        defense: [
          "Double up to contest the weak-side lane rather than spreading thin — accept giving up a low-value area to reinforce a high-value one instead.",
          "Shower control is the priority defensive anchor on this map — losing it tends to cascade into losing the rest of the defensive setup.",
          "Watch for predictable attacker patterns (a late shower lurk is a common one) — recognizing the pattern opens a window to punish it."
        ],
        attack: [
          "Bind has no mid, so once you commit to a site the rotation is fully committed too — there's no cheap way to redirect mid-execute.",
          "Target whatever gap the enemy's agent picks create, rather than defaulting to the same site read every round."
        ]
      },
      siteTips: [
        { label: "A Short", text: "Clear Lamps before the spike crosses Truck; leaving it live lets one defender split the entire plant setup.", roles: ["Duelist", "Initiator"] },
        { label: "A Bath", text: "Bath control creates the open plant and removes the safest close retake path. Hold it through the plant instead of abandoning it on entry.", roles: ["Controller", "Sentinel"] },
        { label: "B Hookah", text: "Pair the Hookah drop with B Long pressure so defenders cannot aim at both elevations at once.", roles: ["Duelist", "Initiator"] },
        { label: "B Long", text: "Keep Elbow and Defender Spawn cut while the spike is planted for Long; otherwise the planter is exposed before the post-plant begins.", roles: ["Controller", "Sentinel"] }
      ],
      teamplayTips: [
        { label: "Teleport timing", text: "Call teleporter audio immediately and name the exit. The rotation is only useful if the destination player is ready for the next fight." },
        { label: "Two-lane hits", text: "Pressure both entrances to a site before committing so one defender cannot hold every attacker in a single choke." },
        { label: "Post-plant jobs", text: "Assign one player to the spike and one to the flank before chasing exits; Bind's teleporters make late routes arrive quickly." }
      ],
      roleNotes: {
        Duelist: [{ category: "attack", text: "Take first space through A Short, Bath, Hookah, or B Long after support utility lands." }, { category: "sites", text: "Clear Lamps and Hookah with movement or explosive utility before teammates cross the choke." }, { category: "defense", text: "Contest one high-value lane with an escape plan instead of dry re-peeking after contact." }],
        Initiator: [{ category: "attack", text: "Reveal or clear Hookah, B Long, Bath, and A Short immediately before the entry moves." }, { category: "sites", text: "Use flashes and scans to isolate Lamps, A Heaven, Elbow, and Defender Spawn rather than covering empty space." }, { category: "teamplay", text: "Track teleporter audio so the team can rotate before the destination fight is already lost." }],
        Controller: [{ category: "sites", text: "For A hits, remove A Heaven and Lamps; for B hits, remove Defender Spawn and Elbow." }, { category: "teamplay", text: "One-way smokes are setup-dependent and should not replace the smokes the execute needs." }, { category: "defense", text: "Keep one smoke or damage tool for the post-plant because Bind retakes arrive through narrow named lanes." }],
        Sentinel: [{ category: "teamplay", text: "Place flank utility where it survives common prefire paths and still catches teleporter rotations." }, { category: "defense", text: "Anchor where you can punish Hookah drop, B Long, A Short, or Bath contact without giving a free first death." }, { category: "defense", text: "Change trap and camera height between gun rounds so the same clear does not solve the setup twice." }]
      },
      metaComp: {
        agents: [],
        composition: "No current ranked composition sample",
        patch: "13.01"
      },
      metaComps: [],
      compStatus: "Bind is outside Tracker Network's current rolling Competitive map sample, so no current composition reference is shown.",
      agentInsights: {
        Clove: "Post-death smokes keep both teleporter rotations covered after an opening fight.",
        Raze: "Explosive movement and clearing utility break Bind's narrow Hookah, Bath, and A Short chokes.",
        Fade: "Haunt and Prowlers clear Lamps, Hookah, and site corners immediately before contact.",
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
      layoutImage: "/assets/library/maps/breeze-layout.png",
      callouts: [
        { label: "A Site", x: 90.8, y: 49.5 },
        { label: "A Lobby", x: 70.3, y: 92.1 },
        { label: "Mid Hall", x: 63.9, y: 53.5 },
        { label: "Mid Nest", x: 48.4, y: 22.8 },
        { label: "Mid Wood Doors", x: 64.4, y: 49.5 },
        { label: "B Tunnel", x: 36.4, y: 38.2 },
        { label: "B Site", x: 7.0, y: 38.2 },
        { label: "B Main", x: 15.4, y: 58.5 },
        { label: "B Back", x: 6.8, y: 30.5 }
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
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Highest rifle conversion", evidence: "0.84 kills per round | 202 average damage", locations: "A Main, B Main, Mid", roundConversion: { scope: "Combined", value: 50.87, sample: "896,805 active-season full-buy rounds", comparisonLabel: "Second rifle", comparisonWeapon: "Vandal", comparisonValue: 50.41 }, note: "Smoke fights and close site finishes give the Phantom a narrow conversion edge, while the Vandal remains the cleaner long-lane one-tap choice." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "High-value sniper", side: "DEF", evidence: "0.80 kills per round | 220 average damage", locations: "A Main, B Main, Mid Nest", roundConversion: { scope: "Defense", value: 52.43, sample: "230,391 active-season defense full-buy rounds", comparisonLabel: "Second sniper", comparisonWeapon: "Outlaw", comparisonValue: 44.64 }, conversion: "Conversion read: the Operator wins the defense-side sniper comparison; Judge or Bucky only catches up inside a deliberately protected Tunnel or Hall pocket.", note: "On defense, the map gives repeated long-lane shots. Mobility or teleport tools make the weapon safer after contact." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Highest pistol conversion", evidence: "500 credits | one-shot headshot through 30m", locations: "A Main, Mid, B Main", roundConversion: { scope: "Combined", value: 50.64, sample: "2,791,564 active-season pistol rounds", comparisonLabel: "Second pistol", comparisonWeapon: "Sheriff", comparisonValue: 50.21 }, note: "Use cover and first-shot accuracy across Breeze's long pistol lanes while preserving credits for utility." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "Best shotgun conversion", side: "DEF", evidence: "1,850 credits | five-shell magazine", locations: "A Hall, B Tunnel", roundConversion: { scope: "Defense", value: 48.24, sample: "27,678 active-season defense full-buy rounds", comparisonLabel: "Second shotgun", comparisonWeapon: "Bucky", comparisonValue: 44.24 }, conversion: "Conversion read: the shotgun remains location-dependent and cannot match the Operator across Breeze's open sites.", note: "On defense, treat it as a protected Hall or Tunnel ambush, then recover a ranged weapon before rotating into open space." },
        { weapon: "Spectre", image: "/assets/weapons/spectre.png", category: "eco", fit: "Highest eco conversion", evidence: "30-round magazine | 1,600 credits", locations: "Tunnel and close Hall pockets", roundConversion: { scope: "Combined", value: 33.61, sample: "128,040 active-season second-round-loss rounds", comparisonLabel: "Second SMG", comparisonWeapon: "Stinger", comparisonValue: 29.69 }, note: "Use it with a deliberate close-range route; most Breeze fights still expose an SMG's range limit." }
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
      callouts: [
        { label: "A Site", x: 81.6, y: 31.5 },
        { label: "A Main", x: 79.2, y: 49.2 },
        { label: "A Rafters", x: 72.6, y: 35.4 },
        { label: "A Screens", x: 74.3, y: 15.0 },
        { label: "Mid Bottom", x: 45.2, y: 61.6 },
        { label: "Mid Vent", x: 54.9, y: 42.6 },
        { label: "Mid Mail", x: 39.3, y: 46.7 },
        { label: "B Tower", x: 31.6, y: 43.0 },
        { label: "B Site", x: 13.3, y: 35.4 },
        { label: "B Garage", x: 13.2, y: 54.2 }
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
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Highest rifle conversion", evidence: "0.84 kills per round | 202 average damage", locations: "A Main, B Main, Vents, Mail", roundConversion: { scope: "Combined", value: 51.18, sample: "1,385,619 active-season full-buy rounds", comparisonLabel: "Second rifle", comparisonWeapon: "Vandal", comparisonValue: 50.26 }, note: "Split's compact chokes and smoke-heavy site fights reward the Phantom's close-range control." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Conditional sniper", side: "DEF", evidence: "0.80 kills per round | 220 average damage", locations: "A Ramps, B Main, Mid", roundConversion: { scope: "Defense", value: 54.62, sample: "158,318 active-season defense full-buy rounds", comparisonLabel: "Second sniper", comparisonWeapon: "Outlaw", comparisonValue: 46.61 }, conversion: "Conversion read: excellent for the opening lane, but Judge and Bucky gain value after attackers enter Split's tight towers, vents, and site pockets.", note: "On defense, take the opening pick beside an exit. Do not drag the slow cycle into a forced close retake." },
        { weapon: "Ghost", image: "/assets/weapons/ghost.png", category: "pistol", fit: "Highest pistol conversion", evidence: "500 credits | one-shot headshot through 30m", locations: "A Main, Mid, B Main", roundConversion: { scope: "Combined", value: 50.64, sample: "2,851,065 active-season pistol rounds", comparisonLabel: "Second pistol", comparisonWeapon: "Frenzy", comparisonValue: 50.59 }, note: "Its first-shot accuracy covers the medium lanes without consuming the utility budget needed to break Split's chokes." },
        { weapon: "Judge", image: "/assets/weapons/judge.png", category: "shotgun", fit: "High close conversion", side: "DEF", evidence: "1,850 credits | five-shell magazine", locations: "B Tower, Vents, A Heaven", roundConversion: { scope: "Defense", value: 49.84, sample: "36,692 active-season defense full-buy rounds", comparisonLabel: "Second shotgun", comparisonWeapon: "Bucky", comparisonValue: 46.08 }, conversion: "Conversion read: the Judge is the stronger shotgun when the route forces repeated close fights, but loses value immediately if Mid or Main opens the range.", note: "On defense, anchor one compact route, vary the corner, and plan how the weapon leaves the round after the first close duel." },
        { weapon: "Spectre", image: "/assets/weapons/spectre.png", category: "eco", fit: "Highest eco conversion", evidence: "30-round magazine | 1,600 credits", locations: "B Tower, Vents, A Main", roundConversion: { scope: "Combined", value: 33.75, sample: "134,619 active-season second-round-loss rounds", comparisonLabel: "Second SMG", comparisonWeapon: "Stinger", comparisonValue: 30.18 }, note: "The compact corners suit the Spectre, but do not carry the setup into open Mid." }
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
