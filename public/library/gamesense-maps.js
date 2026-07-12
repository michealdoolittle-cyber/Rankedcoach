// Gamesense Library — Map content, first slice (Bind, Breeze, Split).
// Sourced from written coverage of named creators/analysts, not scraped or
// reproduced verbatim. Every "source" field must render as a visible
// attribution in the UI — this content is not RankedCoach's own voice.
// Meta comp data is patch-dependent — see "patch" field, needs periodic review.
(function () {
  "use strict";

  const GAMESENSE_MAPS = [
    {
      id: "bind",
      label: "Bind",
      macro: {
        source: "Woohoojin",
        sourceUrl: "https://www.zleague.gg/theportal/woohoojin-mastering-the-bind-map-in-valorant/",
        defense: [
          "Double up to contest the weak-side lane rather than spreading thin — accept giving up a low-value area to reinforce a high-value one instead.",
          "Shower control is the priority defensive anchor on this map — losing it tends to cascade into losing the rest of the defensive setup.",
          "Watch for predictable attacker patterns (a late shower lurk is the named example) — recognizing the pattern opens a window to punish it."
        ],
        attack: [
          "Bind has no mid, so once you commit to a site the rotation is fully committed too — there's no cheap way to redirect mid-execute.",
          "Target whatever gap the enemy's agent picks create, rather than defaulting to the same site read every round."
        ],
        controllerNotes: "Smokes should deny specific named areas (stairs, market) that attackers need to move through, not just block a sightline generically — the goal is manipulating where the fight happens, not just hiding a peek.",
        macroPrinciple: "Understand the conditions that make a site hit actually succeed, then deny those specific conditions on defense rather than just holding angles."
      },
      metaComp: {
        agents: ["Brimstone", "Raze", "Skye", "Sage", "Fade"],
        composition: "2 Initiators, 1 Controller, 1 Duelist, 1 Sentinel",
        winRate: "57%",
        patch: "12.10",
        source: "Community meta tracking (esportsinsider.com, alviran.net), July 2026"
      },
      lineupLinks: [
        { label: "LineupsValorant — Bind", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Bind", url: "https://upforge.gg/lineups" }
      ]
    },
    {
      id: "breeze",
      label: "Breeze",
      macro: {
        source: "Community map analysis (Woohoojin content referenced, Viper-specific techniques)",
        sourceUrl: "https://www.youtube.com/watch?v=0VLyBGR5sNA",
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
      metaComp: {
        agents: ["Viper", "Jett", "Sova", "Killjoy", "KAY/O"],
        composition: "1 Controller, 1 Duelist, 1 Initiator (Sova), 1 Sentinel, 1 Initiator (KAY/O)",
        winRate: "57.5%",
        patch: "12.10",
        source: "Community meta tracking (esportsinsider.com), July 2026 — currently the highest top-comp win rate of any map in the pool"
      },
      lineupLinks: [
        { label: "LineupsValorant — Breeze", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Breeze", url: "https://upforge.gg/lineups" }
      ]
    },
    {
      id: "split",
      label: "Split",
      macro: {
        source: "Community map analysis (Woohoojin has published Split-specific content)",
        sourceUrl: "https://www.youtube.com/watch?v=I2kxN3-V4zg",
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
      metaComp: {
        agents: ["Omen", "Raze", "Breach", "Cypher", "Sage"],
        composition: "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels (double-sentinel)",
        winRate: "56.8%",
        patch: "12.10",
        source: "Community meta tracking (esportsinsider.com), July 2026"
      },
      lineupLinks: [
        { label: "LineupsValorant — Split", url: "https://lineupsvalorant.com/" },
        { label: "UpForge Lineup Library — Split", url: "https://upforge.gg/lineups" }
      ]
    }
  ];

  globalThis.RankedCoachGamesenseMaps = Object.freeze(GAMESENSE_MAPS);
})();
