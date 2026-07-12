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
        { label: "A Site", x: 27, y: 28 },
        { label: "A Bath", x: 14, y: 43 },
        { label: "A Short", x: 39, y: 53 },
        { label: "Lamps", x: 40, y: 42 },
        { label: "A Heaven", x: 31, y: 19 },
        { label: "B Site", x: 72, y: 29 },
        { label: "B Long", x: 91, y: 49 },
        { label: "Hookah", x: 67, y: 45 },
        { label: "Elbow", x: 82, y: 39 },
        { label: "Garden", x: 82, y: 54 }
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
        agents: ["Brimstone", "Raze", "Skye", "Sage", "Fade"],
        composition: "2 Initiators, 1 Controller, 1 Duelist, 1 Sentinel",
        winRate: "57%",
        patch: "12.10"
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
        { label: "A Site", x: 25, y: 29 },
        { label: "A Main", x: 18, y: 50 },
        { label: "A Hall", x: 10, y: 31 },
        { label: "Mid Nest", x: 49, y: 35 },
        { label: "Mid Doors", x: 47, y: 53 },
        { label: "Tunnel", x: 61, y: 49 },
        { label: "B Site", x: 77, y: 29 },
        { label: "B Main", x: 83, y: 51 },
        { label: "Back Site", x: 82, y: 20 }
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
        agents: ["Viper", "Jett", "Sova", "Killjoy", "KAY/O"],
        composition: "1 Controller, 1 Duelist, 1 Initiator (Sova), 1 Sentinel, 1 Initiator (KAY/O)",
        winRate: "57.5%",
        patch: "12.10"
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
      layoutImage: "/assets/library/maps/split-layout.png",
      callouts: [
        { label: "A Site", x: 27, y: 25 },
        { label: "A Main", x: 18, y: 48 },
        { label: "A Heaven", x: 34, y: 34 },
        { label: "Screens", x: 17, y: 30 },
        { label: "Mid", x: 50, y: 50 },
        { label: "Vents", x: 42, y: 41 },
        { label: "Mail", x: 60, y: 42 },
        { label: "B Heaven", x: 68, y: 34 },
        { label: "B Site", x: 76, y: 25 },
        { label: "B Main", x: 82, y: 49 }
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
        agents: ["Omen", "Raze", "Breach", "Cypher", "Sage"],
        composition: "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels (double-sentinel)",
        winRate: "56.8%",
        patch: "12.10"
      },
      lineupLinks: [
        { label: "LineupsValorant — Split", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Split", url: "https://upforge.gg/lineups" }
      ]
    }
  ];

  globalThis.RankedCoachGamesenseMaps = Object.freeze(GAMESENSE_MAPS);
})();
