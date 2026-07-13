// Gamesense Library — Map content, first slice (Bind, Breeze, Split).
// Written in original language from secondary research, not scraped or
// reproduced verbatim from any script or transcript. Underscore-prefixed
// fields (_researchNote, _researchUrl) are internal provenance only —
// for the team's own future reference if content ever needs revisiting —
// and must NEVER be rendered in the player-facing UI. Game mechanics and
// strategy are not gatekept knowledge; no creator attribution is shown to
// players. The "patch" field on metaComp IS meant to be player-visible —
// it's a data-freshness indicator, not attribution.
(function () {
  "use strict";

  const GAMESENSE_MAPS = [
    {
      id: "bind",
      label: "Bind",
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
        { number: 1, site: "A", label: "A Truck Default", rate: null, x: 75.6, y: 34.5 },
        { number: 2, site: "A", label: "A Open Plant", rate: null, x: 68.5, y: 35.7 },
        { number: 1, site: "B", label: "B Default", rate: null, x: 31.4, y: 31.3 },
        { number: 2, site: "B", label: "B Long Plant", rate: null, x: 26.7, y: 31.3 },
        { number: 3, site: "B", label: "B Window Plant", rate: null, x: 29.1, y: 32.4 }
      ],
      plantRateNote: "Bind is outside the active competitive rotation, so no active-season PC plant-rate sample is available.",
      weaponSuggestions: [
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Best rifle fit", evidence: "0.84 kills per round | 202 average damage", locations: "Hookah, Lamps, Bath", note: "Compact chokes and frequent smoke fights reward the Phantom's close-range control." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Strong sniper fit", evidence: "0.80 kills per round | 220 average damage", locations: "B Long, A Tower, A Short", note: "Long lanes create early picks, but the lack of mid makes a missed read expensive. Pair it with an escape tool or planned teleporter rotation." },
        { weapon: "Stinger", image: "/assets/weapons/stinger.png", category: "eco", fit: "Eco outlier", evidence: "228 average damage | 1,100 credits", locations: "Hookah, Lamps, Bath", note: "The low-cost damage output is useful only when the setup protects a close fight and a short magazine." }
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
        ],
        controllerNotes: "Smokes should deny Bind's actual fight lines: A Heaven and Lamps on A, or Defender Spawn and Elbow on B. The goal is controlling where defenders can take the next fight, not placing a generic sightline block.",
        macroPrinciple: "Understand the conditions that make a site hit actually succeed, then deny those specific conditions on defense rather than just holding angles."
      },
      roleNotes: {
        Duelist: ["Take first space through A Short, Bath, Hookah, or B Long after support utility lands.", "Clear Lamps and Hookah with movement or explosive utility before teammates cross the choke.", "On defense, contest one high-value lane with an escape plan instead of dry re-peeking after contact."],
        Initiator: ["Reveal or clear Hookah, B Long, Bath, and A Short immediately before the entry moves.", "Use flashes and scans to isolate Lamps, A Heaven, Elbow, and Defender Spawn rather than covering empty space.", "Track teleporter audio so the team can rotate before the destination fight is already lost."],
        Controller: ["For A hits, remove A Heaven and Lamps; for B hits, remove Defender Spawn and Elbow.", "One-way smokes are possible around ledges and boxes, but they are setup-dependent and should not replace the execute smokes.", "Keep one smoke or damage tool for the post-plant because Bind retakes often arrive through narrow named lanes."],
        Sentinel: ["Place flank utility where it survives common prefire paths and still catches teleporter rotations.", "Anchor from a position that can punish Hookah drop, B Long, A Short, or Bath contact without giving a free first death.", "Change trap and camera height between gun rounds so the same clear does not solve the setup twice."]
      },
      metaComp: {
        agents: [],
        composition: "No current ranked composition sample",
        winRate: "Unavailable",
        patch: "13.00"
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
        { number: 1, site: "A", label: "A Pyramid Default", rate: 44.15, x: 91.4, y: 47.8 },
        { number: 2, site: "A", label: "A Open Pyramid", rate: 13.00, x: 81.7, y: 47.8 },
        { number: 3, site: "A", label: "A Deep Pyramid", rate: 20.30, x: 93.7, y: 47.8 },
        { number: 4, site: "A", label: "A Safe Pyramid", rate: 7.44, x: 84.7, y: 47.8 },
        { number: 1, site: "B", label: "B Pillar Default", rate: 83.61, x: 14.0, y: 31.6 },
        { number: 2, site: "B", label: "B Open Plant", rate: 0.71, x: 17.1, y: 30.5 },
        { number: 3, site: "B", label: "B Back Plant", rate: 1.51, x: 10.6, y: 31.9 }
      ],
      plantRateNote: "Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive.",
      weaponSuggestions: [
        { weapon: "Vandal", image: "/assets/weapons/vandal.png", category: "rifle", fit: "Best rifle fit", evidence: "0.84 kills per round | 29.2% headshots", locations: "A Main, B Main, Mid", note: "Breeze's long sightlines reward the Vandal's no-falloff headshot and punish close-range-only plans." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "High-value sniper", evidence: "0.80 kills per round | 220 average damage", locations: "A Main, B Main, Mid Nest", note: "The map gives repeated long-lane shots. Mobility or teleport tools make the weapon safer after contact." },
        { weapon: "Stinger", image: "/assets/weapons/stinger.png", category: "eco", fit: "Niche eco outlier", evidence: "228 average damage | 1,100 credits", locations: "Tunnel and close Hall pockets", note: "Use it only with a deliberate close-range setup; most Breeze fights expose its range limit." }
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
        ],
        controllerNotes: "Breeze rewards deliberate, named-target smokes (Mid Nest, Tunnel) over general area denial, since the map's long sightlines make a poorly placed smoke nearly worthless.",
        macroPrinciple: "Because Breeze's sites are far apart, mid control functions as leverage over both sites simultaneously — it's the map's actual contested resource, not either site directly."
      },
      roleNotes: {
        Duelist: ["Use movement to cross the long exposed lanes after recon or a flash removes the first angle.", "Create pressure from Mid or Hall so defenders cannot hold one site entrance with every rifle.", "Operator rounds need a planned escape route; do not repeat the same long angle after revealing the weapon."],
        Initiator: ["Scan or drone the long sightline the duelist is about to cross, not the site after contact begins.", "Use Mid Nest, Tunnel, Back Site, and Hall as named utility targets so the team knows what is actually cleared.", "Save one information tool for the late rotation because the distance between sites makes false reads expensive."],
        Controller: ["Viper-style walls are strongest when they split a site into a playable front half and an isolated defender half.", "Remove Mid Nest or Tunnel when taking center control; both positions can hold multiple rotation paths.", "One-way setups exist but are difficult to repeat on Breeze's open geometry; prioritize complete lane denial and fuel timing."],
        Sentinel: ["Use flank utility to protect the long rotations, then survive so that information remains useful.", "Anchor from off-angles that force attackers to clear after crossing open ground.", "Do not stack every piece of utility on one site when Mid pressure can break the setup from behind."]
      },
      metaComp: {
        agents: ["Clove", "Jett", "Sova", "Sage", "Viper"],
        composition: "2 Controllers, 1 Duelist, 1 Initiator, 1 Sentinel",
        winRate: "54.1%",
        patch: "13.00"
      },
      metaComps: [
        { agents: ["Clove", "Jett", "Sage", "Sova", "Gekko"], composition: "1 Controller, 1 Duelist, 2 Initiators, 1 Sentinel" },
        { agents: ["Clove", "Jett", "Sage", "Sova", "Viper"], composition: "2 Controllers, 1 Duelist, 1 Initiator, 1 Sentinel" },
        { agents: ["Clove", "Jett", "Killjoy", "Sage", "Sova"], composition: "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels" }
      ],
      agentInsights: {
        Chamber: "Trademark protects the long flank while Rendezvous supports aggressive Operator holds; B has the stronger current defensive success in this sample.",
        Clove: "Long-range smoke placement stays useful through Breeze rotations, and post-death utility protects late hits.",
        Jett: "Dash and Updraft create a safe exit from the long Operator lanes that define first contact.",
        Neon: "High Gear closes Breeze's long gaps quickly enough to punish defenders before cross-map help arrives.",
        Reyna: "Dismiss gives a self-sufficient escape after winning one of Breeze's exposed long-range duels.",
        Iso: "Double Tap and Contingency help isolate one long sightline instead of fighting the full open site.",
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
        { number: 1, site: "A", label: "A Default", rate: 15.39, x: 84.3, y: 29.6 },
        { number: 2, site: "A", label: "A Screens Plant", rate: 4.83, x: 93.6, y: 25.4 },
        { number: 3, site: "A", label: "A Open Plant", rate: 18.58, x: 92.6, y: 33.8 },
        { number: 1, site: "B", label: "B Open Plant", rate: 26.94, x: 11.1, y: 29.6 },
        { number: 2, site: "B", label: "B Default", rate: 53.76, x: 12.3, y: 34.4 }
      ],
      plantRateNote: "Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive.",
      weaponSuggestions: [
        { weapon: "Phantom", image: "/assets/weapons/phantom.png", category: "rifle", fit: "Best rifle fit", evidence: "0.84 kills per round | 202 average damage", locations: "A Main, B Main, Vents, Mail", note: "Split's compact chokes and smoke-heavy site fights reward the Phantom's close-range control." },
        { weapon: "Operator", image: "/assets/weapons/operator.png", category: "sniper", fit: "Viable sniper", evidence: "0.80 kills per round | 220 average damage", locations: "A Ramps, B Main, Mid", note: "Strong for an opening pick, but tight rotations make a missed shot dangerous without an escape path." },
        { weapon: "Stinger", image: "/assets/weapons/stinger.png", category: "eco", fit: "Eco outlier", evidence: "228 average damage | 1,100 credits", locations: "B Tower, Vents, A Main", note: "The low price and damage output fit compact corners, but do not carry the setup into open Mid." }
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
        ],
        controllerNotes: "Because sites are compact, smokes and mollies have outsized value per-use on Split relative to open maps — a single well-placed piece of utility can lock down a small area almost entirely.",
        macroPrinciple: "Treat mid as the map's actual swing resource, the same way Breeze treats mid as shared leverage — Split just compresses the effect into a smaller, faster-paced map."
      },
      roleNotes: {
        Duelist: ["Use movement or explosive utility to break the first choke at A Main, B Main, or Mid.", "Take vertical space in A Heaven, B Heaven, Vents, and Mail after support utility forces defenders off the angle.", "On defense, pressure a choke only when you can fall back before the trade arrives."],
        Initiator: ["Narrow lanes reward flashes, stuns, and damage utility that land immediately before the swing.", "Clear A Heaven, Screens, B Heaven, Mail, and Vents as separate jobs instead of calling an entire site clear.", "Hold one piece of retake utility because Split sites are compact enough for a single well-timed cast to change the round."],
        Controller: ["On A, remove A Heaven and Screens; on B, remove B Heaven and the defender rotation lane.", "Mid control usually needs a smoke at Mail or Vents so the team can fight one elevation at a time.", "One-way smokes are available on several ledges, but use them only when the height is consistent and teammates know the exposed lane."],
        Sentinel: ["Trap the route that connects Mid to the site hit so defenders receive the rotation warning early.", "Compact sites reward layered stall utility, but leave enough spacing that one grenade cannot clear everything.", "Rotate setups between B Main, Mid, and A Main pressure so attackers must re-clear the map each gun round."]
      },
      metaComp: {
        agents: ["Clove", "Raze", "Fade", "Sage", "Cypher"],
        composition: "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels",
        winRate: "54.7%",
        patch: "13.00"
      },
      metaComps: [
        { agents: ["Clove", "Fade", "Killjoy", "Raze", "Sage"], composition: "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels" },
        { agents: ["Clove", "Cypher", "Raze", "Sage", "Skye"], composition: "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels" },
        { agents: ["Clove", "Fade", "Jett", "Raze", "Sage"], composition: "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel" }
      ],
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
