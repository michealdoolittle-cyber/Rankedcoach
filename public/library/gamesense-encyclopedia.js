// Generated from Riot game-content data and source-linked current reference pages.
// Run: node scripts/generate-gamesense-encyclopedia.mjs
(function () {
  "use strict";
  const GENERATED_AGENTS = [
  {
    "id": "astra",
    "label": "Astra",
    "role": "Controller",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/fullportrait.png",
    "fundamentals": [
      "Riot identifies Astra as a Controller. Ghanaian Agent Astra harnesses the energies of the cosmos to reshape battlefields to her whim. With full command of her astral form and a talent for deep strategic foresight, she's always eons ahead of her enemy's next move.",
      "Astra's current ability slots are listed directly from Riot's live game-content feed.",
      "Astral Form / Cosmic Divide is Astra's Ultimate ability. ACTIVATE to enter Astral Form where you can place Stars with FIRE. Stars can be reactivated later, transforming them into a Nova Pulse, Nebula, or Gravity Well.\r\n\r\nWhen Cosmic Divide is charged, use ALT FIRE in Astral Form to begin aiming it, then FIRE to select two locations. An infinite Cosmic Divide connects the two points you select. Cosmic Divide blocks bullets and sound."
    ],
    "patchHistory": [
      {
        "patch": "12.05",
        "note": "Astral Form Bugfix: Fixed a bug where a floating gun may briefly appear when a suppression effect interrupts it",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-05/"
      },
      {
        "patch": "12.00",
        "note": "Nebula/Dissipate Bugfix: Fixed a bug where Nebula created by Dissipate did not have an icon on the minimap.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-00/"
      }
    ],
    "abilities": [
      {
        "id": "nova-pulse",
        "name": "Nova Pulse",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/ability1/displayicon.png",
        "summary": "Place Stars in Astral Form (Ultimate Key).\r\n\r\nACTIVATE a Star to detonate a Nova Pulse. The Nova Pulse charges briefly then strikes, Concussing all players in its area.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Nova Pulse applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Nova Pulse needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US"
      },
      {
        "id": "nebula-dissipate",
        "name": "Nebula  / Dissipate",
        "slot": "Nebula (Primary use): E - Basic",
        "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/ability2/displayicon.png",
        "summary": "Place Stars in Astral Form (Ultimate Key). \r\n\r\nACTIVATE a Star to transform it into a Nebula (smoke).\r\n\r\nUSE a Star to Dissipate it, returning the Star to be placed in a new location after a delay.\r\n\r\nDissipate briefly forms a fake Nebula at the Star's location before returning.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Nebula  / Dissipate controls sightlines. Place it on the specific defender view the team needs removed, then move while that view is blocked.",
        "setup": "Nebula  / Dissipate needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US"
      },
      {
        "id": "gravity-well",
        "name": "Gravity Well",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/grenade/displayicon.png",
        "summary": "Place Stars in Astral Form (Ultimate Key).\r\n\r\nACTIVATE a Star to form a Gravity Well. Players in the area are pulled toward the center before it explodes, making all players still trapped inside Vulnerable.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Gravity Well applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Gravity Well needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US"
      },
      {
        "id": "astral-form-cosmic-divide",
        "name": "Astral Form / Cosmic Divide",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/ultimate/displayicon.png",
        "summary": "ACTIVATE to enter Astral Form where you can place Stars with FIRE. Stars can be reactivated later, transforming them into a Nova Pulse, Nebula, or Gravity Well.\r\n\r\nWhen Cosmic Divide is charged, use ALT FIRE in Astral Form to begin aiming it, then FIRE to select two locations. An infinite Cosmic Divide connects the two points you select. Cosmic Divide blocks bullets and sound.",
        "stats": {
          "Cost": "Ultimate-point value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "Astral Form / Cosmic Divide performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Astral Form / Cosmic Divide needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US"
      },
      {
        "id": "astral-form",
        "name": "Astral Form",
        "slot": "Passive",
        "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/abilities/passive/displayicon.png",
        "summary": "ACTIVATE Ultimate to enter Astral Form and PRIMARY FIRE to place Stars. Target Stars with your Nova Pulse, Nebula, or Gravity Well to use those abilities.",
        "stats": {
          "Cost": "Passive; no purchase",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Astral Form performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Astral Form needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Controller",
        "note": "Controllers are experts in slicing up dangerous territory to set their team up for success."
      },
      {
        "label": "Official profile",
        "value": "Astra",
        "note": "Ghanaian Agent Astra harnesses the energies of the cosmos to reshape battlefields to her whim. With full command of her astral form and a talent for deep strategic foresight, she's always eons ahead of her enemy's next move."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US"
  },
  {
    "id": "breach",
    "label": "Breach",
    "role": "Initiator",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/fullportrait.png",
    "fundamentals": [
      "Riot identifies Breach as a Initiator. The bionic Swede Breach fires powerful, targeted kinetic blasts to aggressively clear a path through enemy ground. The damage and disruption he inflicts ensures no fight is ever fair.",
      "Fault Line is Breach's current Signature ability. EQUIP a Seismic Blast. HOLD FIRE to increase the distance. RELEASE to set off the quake, Concussing all players in its zone and in a line up to the zone.",
      "Rolling Thunder is Breach's Ultimate ability. EQUIP a Seismic Charge. FIRE to send a cascading quake through all terrain in a large zone. The quake Concusses and knocks up anyone caught in it."
    ],
    "patchHistory": [
      {
        "patch": "12.00",
        "note": "Flashpoint Buff: Projectile speed increased from 2000 to 2400",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-00/"
      },
      {
        "patch": "11.08",
        "note": "Fault Line Nerf: Cooldown increased from 40s to 60s",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
      }
    ],
    "abilities": [
      {
        "id": "flashpoint",
        "name": "Flashpoint",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/ability1/displayicon.png",
        "summary": "EQUIP a Blinding charge. FIRE the charge to set a fast-acting burst through the wall. The charge detonates to Blind all players looking at it.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Flashpoint is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Flashpoint must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US"
      },
      {
        "id": "fault-line",
        "name": "Fault Line",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/ability2/displayicon.png",
        "summary": "EQUIP a Seismic Blast. HOLD FIRE to increase the distance. RELEASE to set off the quake, Concussing all players in its zone and in a line up to the zone.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Fault Line limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Fault Line must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US"
      },
      {
        "id": "aftershock",
        "name": "Aftershock",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/grenade/displayicon.png",
        "summary": "EQUIP a fusion charge. FIRE the charge to set a slow-acting burst through the wall. The burst does heavy damage to anyone caught in its area.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Aftershock applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Aftershock must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US"
      },
      {
        "id": "rolling-thunder",
        "name": "Rolling Thunder",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a Seismic Charge. FIRE to send a cascading quake through all terrain in a large zone. The quake Concusses and knocks up anyone caught in it.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Rolling Thunder limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Rolling Thunder must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Initiator",
        "note": "Initiators challenge angles by setting up their team to enter contested ground and push defenders away."
      },
      {
        "label": "Official profile",
        "value": "Breach",
        "note": "The bionic Swede Breach fires powerful, targeted kinetic blasts to aggressively clear a path through enemy ground. The damage and disruption he inflicts ensures no fight is ever fair."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US"
  },
  {
    "id": "brimstone",
    "label": "Brimstone",
    "role": "Controller",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/fullportrait.png",
    "fundamentals": [
      "Riot identifies Brimstone as a Controller. Joining from the U.S.A., Brimstone's orbital arsenal ensures his squad always has the advantage. His ability to deliver utility precisely and safely make him the unmatched boots-on-the-ground commander.",
      "Sky Smoke is Brimstone's current Signature ability. EQUIP a tactical map. FIRE to set locations where Brimstone's smoke clouds will land. ALT FIRE to confirm, launching long-lasting smoke clouds that block vision in the selected area.",
      "Orbital Strike is Brimstone's Ultimate ability. EQUIP a tactical map. FIRE to launch a lingering orbital strike laser at the selected location, dealing high damage-over-time to players caught in the selected area."
    ],
    "patchHistory": [
      {
        "patch": "12.05",
        "note": "Sky Smoke Bugfix: Fixed a bug where his equip pose was displaying unintended VFX when viewed far away.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-05/"
      },
      {
        "patch": "12.00",
        "note": "Sky Smoke and Orbital Strike Adjustment: Tactical map updated for better readability",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-00/"
      }
    ],
    "abilities": [
      {
        "id": "stim-beacon",
        "name": "Stim Beacon",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/grenade/displayicon.png",
        "summary": "INSTANTLY toss down a stim beacon. Upon landing, it creates a field that grants players a Combat Stim and a Speed Boost.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Stim Beacon changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Stim Beacon should be prepared around the official description above; no extra range, duration, or interaction is assumed when Riot's public feed does not state it.",
        "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US"
      },
      {
        "id": "incendiary",
        "name": "Incendiary",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ability1/displayicon.png",
        "summary": "EQUIP an incendiary grenade launcher. FIRE to launch a grenade that detonates as it comes to a rest on the floor, creating a lingering fire zone that damages players within the zone.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Incendiary applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Incendiary must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US"
      },
      {
        "id": "sky-smoke",
        "name": "Sky Smoke",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ability2/displayicon.png",
        "summary": "EQUIP a tactical map. FIRE to set locations where Brimstone's smoke clouds will land. ALT FIRE to confirm, launching long-lasting smoke clouds that block vision in the selected area.",
        "stats": {
          "Cost": "100 credits",
          "Charges": "3",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Sky Smoke controls sightlines. Place it on the specific defender view the team needs removed, then move while that view is blocked.",
        "setup": "Sky Smoke must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US"
      },
      {
        "id": "orbital-strike",
        "name": "Orbital Strike",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a tactical map. FIRE to launch a lingering orbital strike laser at the selected location, dealing high damage-over-time to players caught in the selected area.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Orbital Strike applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Orbital Strike must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Controller",
        "note": "Controllers are experts in slicing up dangerous territory to set their team up for success."
      },
      {
        "label": "Official profile",
        "value": "Brimstone",
        "note": "Joining from the U.S.A., Brimstone's orbital arsenal ensures his squad always has the advantage. His ability to deliver utility precisely and safely make him the unmatched boots-on-the-ground commander."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US"
  },
  {
    "id": "chamber",
    "label": "Chamber",
    "role": "Sentinel",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/fullportrait.png",
    "fundamentals": [
      "Riot identifies Chamber as a Sentinel. Well-dressed and well-armed, French weapons designer Chamber expels aggressors with deadly precision. He leverages his custom arsenal to hold the line and pick off enemies from afar, with a contingency built for every plan.",
      "Rendezvous is Chamber's current Signature ability. EQUIP a teleport anchor. FIRE to place it on the ground. While on the ground and in range of the anchor, REACTIVATE to quickly teleport to the anchor. The anchor can be picked up to be REDEPLOYED.",
      "Tour De Force is Chamber's Ultimate ability. ACTIVATE to summon a powerful, custom sniper rifle that will kill an enemy with any direct hit to the upper body. ALT FIRE to aim down sights. Killing an enemy creates a lingering field that Slows players caught inside of it."
    ],
    "patchHistory": [
      {
        "patch": "12.09",
        "note": "Headhunter Bugfix Buff: Fixed a bug where ADS-ing while firing created an animation that covers too much of the screen",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
      },
      {
        "patch": "12.04",
        "note": "Trademark Bugfix: Fixed a bug where it would play its reactivation SFX twice if he had Suppress expiring on him.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-04/"
      }
    ],
    "abilities": [
      {
        "id": "rendezvous",
        "name": "Rendezvous",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/ability2/displayicon.png",
        "summary": "EQUIP a teleport anchor. FIRE to place it on the ground. While on the ground and in range of the anchor, REACTIVATE to quickly teleport to the anchor. The anchor can be picked up to be REDEPLOYED.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Rendezvous changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Rendezvous must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US"
      },
      {
        "id": "trademark",
        "name": "Trademark",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/grenade/displayicon.png",
        "summary": "EQUIP a trap that scans for enemies. FIRE to place it on the ground. When a visible enemy comes in range, the trap counts down and then destabilizes the terrain around them, creating a lingering field that Slows players caught inside of it. The trap can be picked up to be REDEPLOYED.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Trademark provides information. Use the reveal, detection, or tracking result to name an occupied space before a teammate commits.",
        "setup": "Trademark must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US"
      },
      {
        "id": "headhunter",
        "name": "Headhunter",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/ability1/displayicon.png",
        "summary": "ACTIVATE to equip a heavy pistol. ALT FIRE with the pistol equipped to aim down sights.",
        "stats": {
          "Cost": "100 credits",
          "Charges": "8 20px|link=",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Headhunter performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Headhunter must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US"
      },
      {
        "id": "tour-de-force",
        "name": "Tour De Force",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/abilities/ultimate/displayicon.png",
        "summary": "ACTIVATE to summon a powerful, custom sniper rifle that will kill an enemy with any direct hit to the upper body. ALT FIRE to aim down sights. Killing an enemy creates a lingering field that Slows players caught inside of it.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Tour De Force limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Tour De Force needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Sentinel",
        "note": "Sentinels are defensive experts who can lock down areas and watch flanks, both on attacker and defender rounds."
      },
      {
        "label": "Official profile",
        "value": "Chamber",
        "note": "Well-dressed and well-armed, French weapons designer Chamber expels aggressors with deadly precision. He leverages his custom arsenal to hold the line and pick off enemies from afar, with a contingency built for every plan."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US"
  },
  {
    "id": "clove",
    "label": "Clove",
    "role": "Controller",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/fullportrait.png",
    "fundamentals": [
      "Riot identifies Clove as a Controller. Scottish troublemaker Clove makes mischief for enemies in both the heat of combat and the cold of death. The young immortal keeps foes guessing, even from beyond the grave, their return to the living only ever a moment away.",
      "Ruse is Clove's current Signature ability. EQUIP a view of the battlefield. FIRE to set the locations where Clove's clouds will settle. ALT FIRE to confirm, launching clouds that block vision in the chosen areas. Clove can use this ability after death.",
      "Not Dead Yet is Clove's Ultimate ability. After dying, ACTIVATE to resurrect. Once resurrected, Clove must earn a kill or a damaging assist within a set time or they will die. REACTIVATE to cancel early."
    ],
    "patchHistory": [
      {
        "patch": "12.06",
        "note": "Ruse Bugfix Buff: Fixed a bug where post-death Ruse could not be unequipped without casting it.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-06/"
      },
      {
        "patch": "12.05",
        "note": "Ruse Nerf: Smoke duration 14s >> 6s when casted while dead",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-05/"
      }
    ],
    "abilities": [
      {
        "id": "pick-me-up",
        "name": "Pick-me-up",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/grenade/displayicon.png",
        "summary": "ACTIVATE to absorb the life force of a fallen enemy that Clove damaged or killed, gaining haste and temporary health.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Pick-me-up preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Pick-me-up should be prepared around the official description above; no extra range, duration, or interaction is assumed when Riot's public feed does not state it.",
        "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US"
      },
      {
        "id": "ruse",
        "name": "Ruse",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/ability2/displayicon.png",
        "summary": "EQUIP a view of the battlefield. FIRE to set the locations where Clove's clouds will settle. ALT FIRE to confirm, launching clouds that block vision in the chosen areas. Clove can use this ability after death.",
        "stats": {
          "Cost": "150 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Ruse performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Ruse must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US"
      },
      {
        "id": "not-dead-yet",
        "name": "Not Dead Yet",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/ultimate/displayicon.png",
        "summary": "After dying, ACTIVATE to resurrect. Once resurrected, Clove must earn a kill or a damaging assist within a set time or they will die. REACTIVATE to cancel early.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Not Dead Yet preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Not Dead Yet has a second activation in Riot's description. Decide what will trigger that follow-up before the first cast.",
        "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US"
      },
      {
        "id": "meddle",
        "name": "Meddle",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/ability1/displayicon.png",
        "summary": "EQUIP a fragment of immortality essence. FIRE to throw the fragment, which upon landing on the floor, erupts after a short delay and temporarily Decays all targets caught inside.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Meddle performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Meddle must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Controller",
        "note": "Controllers are experts in slicing up dangerous territory to set their team up for success."
      },
      {
        "label": "Official profile",
        "value": "Clove",
        "note": "Scottish troublemaker Clove makes mischief for enemies in both the heat of combat and the cold of death. The young immortal keeps foes guessing, even from beyond the grave, their return to the living only ever a moment away."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US"
  },
  {
    "id": "deadlock",
    "label": "Deadlock",
    "role": "Sentinel",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/fullportrait.png",
    "fundamentals": [
      "Riot identifies Deadlock as a Sentinel. Norwegian operative Deadlock deploys an array of cutting-edge nanowire to secure the battlefield from even the most lethal assault. No one escapes her vigilant watch, nor survives her unyielding ferocity.",
      "GravNet is Deadlock's current Signature ability. EQUIP a GravNet grenade. FIRE to throw. ALT FIRE to lob. The GravNet detonates upon landing, forcing any characters caught within to crouch and move slowly.",
      "Annihilation is Deadlock's Ultimate ability. EQUIP a Nanowire Accelerator. FIRE to unleash a pulse of nanowires that captures the first enemy contacted. The cocooned enemy is pulled along a nanowire path and will die unless they are freed. The nanowire cocoon is destructible."
    ],
    "patchHistory": [
      {
        "patch": "12.00",
        "note": "GravNet and Barrier Mesh Bugfix Buff: Fixed an issue where throw animations would break if aiming straight down",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-00/"
      },
      {
        "patch": "11.08",
        "note": "GravNet Nerf: Cooldown increased from 40s to 60s",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
      }
    ],
    "abilities": [
      {
        "id": "sonic-sensor",
        "name": "Sonic Sensor",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/ability1/displayicon.png",
        "summary": "EQUIP a Sonic Sensor. FIRE to deploy. The sensor monitors an area for enemies making sound. It concusses that area if footsteps, weapons fire, or significant noise are detected. This ability can be picked up to be REDEPLOYED.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Sonic Sensor provides information. Use the reveal, detection, or tracking result to name an occupied space before a teammate commits.",
        "setup": "Sonic Sensor must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US"
      },
      {
        "id": "barrier-mesh",
        "name": "Barrier Mesh",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/grenade/displayicon.png",
        "summary": "EQUIP a Barrier Mesh disc. FIRE to throw forward. Upon landing, the disc generates barriers from the origin point that block character movement.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Barrier Mesh changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Barrier Mesh must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US"
      },
      {
        "id": "gravnet",
        "name": "GravNet",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/ability2/displayicon.png",
        "summary": "EQUIP a GravNet grenade. FIRE to throw. ALT FIRE to lob. The GravNet detonates upon landing, forcing any characters caught within to crouch and move slowly.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "GravNet applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "GravNet must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US"
      },
      {
        "id": "annihilation",
        "name": "Annihilation",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a Nanowire Accelerator. FIRE to unleash a pulse of nanowires that captures the first enemy contacted. The cocooned enemy is pulled along a nanowire path and will die unless they are freed. The nanowire cocoon is destructible.",
        "stats": {
          "Cost": "7 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Annihilation performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Annihilation must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Sentinel",
        "note": "Sentinels are defensive experts who can lock down areas and watch flanks, both on attacker and defender rounds."
      },
      {
        "label": "Official profile",
        "value": "Deadlock",
        "note": "Norwegian operative Deadlock deploys an array of cutting-edge nanowire to secure the battlefield from even the most lethal assault. No one escapes her vigilant watch, nor survives her unyielding ferocity."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US"
  },
  {
    "id": "fade",
    "label": "Fade",
    "role": "Initiator",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/fullportrait.png",
    "fundamentals": [
      "Riot identifies Fade as a Initiator. Turkish bounty hunter Fade unleashes the power of raw nightmare to seize enemy secrets. Attuned with terror itself, she hunts down targets and reveals their deepest fears - before crushing them in the dark.",
      "Haunt is Fade's current Signature ability. EQUIP a haunting watcher. FIRE to throw. The watcher drops down after a set time. RE-USE to drop the watcher early. The watcher lashes out on impact, Revealing enemies in its line of sight and creating terror trails to them. Enemies can destroy the watcher.",
      "Nightfall is Fade's Ultimate ability. EQUIP the power of nightmare itself. FIRE to unleash a wave of unstoppable nightmare energy. Enemies caught in the wave are Marked by terror trails, Deafened, and Decayed."
    ],
    "patchHistory": [
      {
        "patch": "12.04",
        "note": "Nightfall Bugfix: Fixed a bug where its minimap indicator was slightly smaller than the actual ability.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-04/"
      },
      {
        "patch": "12.01",
        "note": "Prowler Bugfix: Fixed a bug where it was missing a VFX asset when viewed in Left Handed Mode.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-01/"
      }
    ],
    "abilities": [
      {
        "id": "seize",
        "name": "Seize",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/ability1/displayicon.png",
        "summary": "EQUIP a knot of raw fear. FIRE to throw. The knot drops down after a set time. RE-USE to drop the knot early. The knot ruptures on impact, holding nearby enemies in place. Held enemies are Deafened, and Decayed.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Seize performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Seize must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US"
      },
      {
        "id": "haunt",
        "name": "Haunt",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/ability2/displayicon.png",
        "summary": "EQUIP a haunting watcher. FIRE to throw. The watcher drops down after a set time. RE-USE to drop the watcher early. The watcher lashes out on impact, Revealing enemies in its line of sight and creating terror trails to them. Enemies can destroy the watcher.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Haunt provides information. Use the reveal, detection, or tracking result to name an occupied space before a teammate commits.",
        "setup": "Haunt must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US"
      },
      {
        "id": "prowler",
        "name": "Prowler",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/grenade/displayicon.png",
        "summary": "EQUIP a prowler. FIRE to send the prowler forward. HOLD FIRE to steer the prowler towards your crosshair. The prowler will chase down the first enemy or terror trail it sees, and Nearsight the enemy on impact.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Prowler is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Prowler must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US"
      },
      {
        "id": "nightfall",
        "name": "Nightfall",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/abilities/ultimate/displayicon.png",
        "summary": "EQUIP the power of nightmare itself. FIRE to unleash a wave of unstoppable nightmare energy. Enemies caught in the wave are Marked by terror trails, Deafened, and Decayed.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Nightfall performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Nightfall must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Initiator",
        "note": "Initiators challenge angles by setting up their team to enter contested ground and push defenders away."
      },
      {
        "label": "Official profile",
        "value": "Fade",
        "note": "Turkish bounty hunter Fade unleashes the power of raw nightmare to seize enemy secrets. Attuned with terror itself, she hunts down targets and reveals their deepest fears - before crushing them in the dark."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US"
  },
  {
    "id": "gekko",
    "label": "Gekko",
    "role": "Initiator",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/fullportrait.png",
    "fundamentals": [
      "Riot identifies Gekko as a Initiator. Gekko the Angeleno leads a tight-knit crew of calamitous creatures. His buddies bound forward, scattering enemies out of the way, with Gekko chasing them down to regroup and go again.",
      "Dizzy is Gekko's current Signature ability. EQUIP Dizzy. FIRE to send Dizzy soaring forward through the air. Dizzy charges then unleashes plasma blasts at enemies in line of sight. Enemies hit by her plasma are Blinded. When Dizzy expires she reverts into a dormant globule. INTERACT to reclaim the globule and gain another Dizzy charge after a short cooldown.",
      "Thrash is Gekko's Ultimate ability. EQUIP Thrash. FIRE to link with Thrash's mind and steer her through enemy territory. ACTIVATE to lunge forward and explode, Detaining any players in a small radius. When Thrash expires she reverts into a dormant globule. INTERACT to reclaim the globule and gain another Thrash charge after a short cooldown. Thrash can be reclaimed once."
    ],
    "patchHistory": [
      {
        "patch": "12.07",
        "note": "Dizzy Bugfix Buff: Fixed a bug where she would only target an enemy if their head was visible.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-07/"
      },
      {
        "patch": "12.05",
        "note": "Thrash Bugfix: Fixed a bug where a floating gun may briefly appear when a suppression effect interrupts it",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-05/"
      }
    ],
    "abilities": [
      {
        "id": "wingman",
        "name": "Wingman",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/ability1/displayicon.png",
        "summary": "EQUIP Wingman. FIRE to send Wingman forward seeking enemies. Wingman unleashes a concussive blast toward the first enemy he sees. ALT FIRE when targeting a Spike site or planted Spike to have Wingman defuse or plant the Spike. To plant, Gekko must have the Spike in his inventory. When Wingman expires he reverts into a dormant globule. INTERACT to reclaim the globule and gain another Wingman charge after a short cooldown.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Wingman limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Wingman must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US"
      },
      {
        "id": "dizzy",
        "name": "Dizzy",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/ability2/displayicon.png",
        "summary": "EQUIP Dizzy. FIRE to send Dizzy soaring forward through the air. Dizzy charges then unleashes plasma blasts at enemies in line of sight. Enemies hit by her plasma are Blinded. When Dizzy expires she reverts into a dormant globule. INTERACT to reclaim the globule and gain another Dizzy charge after a short cooldown.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Dizzy is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Dizzy must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US"
      },
      {
        "id": "mosh-pit",
        "name": "Mosh Pit",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/grenade/displayicon.png",
        "summary": "EQUIP Mosh. FIRE to throw Mosh like a grenade. ALT FIRE to lob. Upon landing Mosh duplicates across a large area that deals a small amount of damage over time then after a short delay explodes. INTERACT to reclaim the globule and gain another Mosh charge after a short cooldown.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Mosh Pit applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Mosh Pit must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US"
      },
      {
        "id": "thrash",
        "name": "Thrash",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/abilities/ultimate/displayicon.png",
        "summary": "EQUIP Thrash. FIRE to link with Thrash's mind and steer her through enemy territory. ACTIVATE to lunge forward and explode, Detaining any players in a small radius. When Thrash expires she reverts into a dormant globule. INTERACT to reclaim the globule and gain another Thrash charge after a short cooldown. Thrash can be reclaimed once.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Thrash applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Thrash must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Initiator",
        "note": "Initiators challenge angles by setting up their team to enter contested ground and push defenders away."
      },
      {
        "label": "Official profile",
        "value": "Gekko",
        "note": "Gekko the Angeleno leads a tight-knit crew of calamitous creatures. His buddies bound forward, scattering enemies out of the way, with Gekko chasing them down to regroup and go again."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US"
  },
  {
    "id": "harbor",
    "label": "Harbor",
    "role": "Controller",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/fullportrait.png",
    "fundamentals": [
      "Riot identifies Harbor as a Controller. Hailing from India's coast, Harbor storms the field wielding ancient technology with dominion over water. He unleashes frothing rapids and crushing waves to shield his allies, or pummel those that oppose him.",
      "Cove is Harbor's current Signature ability. EQUIP Cove. ACTIVATE to form a water Smoke in the select location. HOLD FIRE while targeting to move the marker further away and HOLD ALT FIRE to move it closer. RELOAD to toggle targeting view. REACTIVATE to Shield the water Smoke, blocking any bullets that hit it. The Shielded water Smoke can be destroyed.",
      "Reckoning is Harbor's Ultimate ability. EQUIP Reckoning. FIRE to unleash the full power of your artifact, releasing a surge of water that barrels forward to Nearsight and Slow enemies that are hit."
    ],
    "patchHistory": [
      {
        "patch": "12.05",
        "note": "Storm Surge Bugfix: Fixed a bug where his relic was not glowing when equipping it in Left Handed Mode.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-05/"
      },
      {
        "patch": "12.04",
        "note": "Storm Surge Bugfix: Fixed a bug where it could briefly persist into the next round when cast right before a round ends.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-04/"
      }
    ],
    "abilities": [
      {
        "id": "high-tide",
        "name": "High Tide",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/ability1/displayicon.png",
        "summary": "EQUIP High Tide. FIRE to send water forward along the ground. HOLD FIRE to guide the water towards your crosshair spawning a vision blocking Screen along the path. ALT FIRE to stop the water early. All players crossing High Tide are Slowed.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "High Tide limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "High Tide must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US"
      },
      {
        "id": "storm-surge",
        "name": "Storm Surge",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/grenade/displayicon.png",
        "summary": "EQUIP Storm Surge. FIRE to throw, creating an explosive whirlpool that Slows and Nearsights players within it after a short duration.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Storm Surge is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Storm Surge must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US"
      },
      {
        "id": "cove",
        "name": "Cove",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/ability2/displayicon.png",
        "summary": "EQUIP Cove. ACTIVATE to form a water Smoke in the select location. HOLD FIRE while targeting to move the marker further away and HOLD ALT FIRE to move it closer. RELOAD to toggle targeting view. REACTIVATE to Shield the water Smoke, blocking any bullets that hit it. The Shielded water Smoke can be destroyed.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Cove controls sightlines. Place it on the specific defender view the team needs removed, then move while that view is blocked.",
        "setup": "Cove must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US"
      },
      {
        "id": "reckoning",
        "name": "Reckoning",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/abilities/ultimate/displayicon.png",
        "summary": "EQUIP Reckoning. FIRE to unleash the full power of your artifact, releasing a surge of water that barrels forward to Nearsight and Slow enemies that are hit.",
        "stats": {
          "Cost": "7 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Reckoning is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Reckoning must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Controller",
        "note": "Controllers are experts in slicing up dangerous territory to set their team up for success."
      },
      {
        "label": "Official profile",
        "value": "Harbor",
        "note": "Hailing from India's coast, Harbor storms the field wielding ancient technology with dominion over water. He unleashes frothing rapids and crushing waves to shield his allies, or pummel those that oppose him."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US"
  },
  {
    "id": "iso",
    "label": "Iso",
    "role": "Duelist",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/fullportrait.png",
    "fundamentals": [
      "Riot identifies Iso as a Duelist. Chinese fixer for hire Iso falls into a flow state to dismantle the opposition. Reconfiguring ambient energy into bulletproof protection, he advances with focus towards his next duel to the death.",
      "Double Tap is Iso's current Signature ability. INSTANTLY start channeling your focus. Once focused: gain a shield which absorbs one instance of damage from any source, reload more quickly, and enter a flow state during which downed enemies you kill or damage spawn an energy orb. Shooting this orb refreshes your flow state and your existing shield, or grants another.",
      "Kill Contract is Iso's Ultimate ability. EQUIP an interdimensional arena. FIRE to hurl a column of energy through the battlefield, pulling and healing both you and the first enemy hit into the arena to duel to the death."
    ],
    "patchHistory": [
      {
        "patch": "12.00",
        "note": "Undercut Bugfix Buff: Fixed an issue where throw animations would break if aiming straight down",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-00/"
      },
      {
        "patch": "11.11",
        "note": "Kill Contract Bugfix Nerf: Fixed a bug where Clove and Reyna would not enter the arena at full health and with full shields or overheal if they entered with damaged overheal.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-11/"
      }
    ],
    "abilities": [
      {
        "id": "undercut",
        "name": "Undercut",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/ability1/displayicon.png",
        "summary": "EQUIP a molecular bolt. FIRE to throw it forward, briefly applying Vulnerable & Suppress to all players it touches. The bolt can pass through solid objects, including walls.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Undercut limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Undercut must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US"
      },
      {
        "id": "kill-contract",
        "name": "Kill Contract",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/ultimate/displayicon.png",
        "summary": "EQUIP an interdimensional arena. FIRE to hurl a column of energy through the battlefield, pulling and healing both you and the first enemy hit into the arena to duel to the death.",
        "stats": {
          "Cost": "7 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Kill Contract preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Kill Contract must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US"
      },
      {
        "id": "double-tap",
        "name": "Double Tap",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/ability2/displayicon.png",
        "summary": "INSTANTLY start channeling your focus. Once focused: gain a shield which absorbs one instance of damage from any source, reload more quickly, and enter a flow state during which downed enemies you kill or damage spawn an energy orb. Shooting this orb refreshes your flow state and your existing shield, or grants another.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Double Tap applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Double Tap includes a channel, windup, or delay in its official behavior. Start it from safety and account for that time before contact.",
        "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US"
      },
      {
        "id": "contingency",
        "name": "Contingency",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/abilities/grenade/displayicon.png",
        "summary": "EQUIP to assemble prismatic energy. FIRE to push an indestructible wall of energy forward that blocks bullets. ALT FIRE to push out a slower version of the wall.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Contingency controls sightlines. Place it on the specific defender view the team needs removed, then move while that view is blocked.",
        "setup": "Contingency must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Duelist",
        "note": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first."
      },
      {
        "label": "Official profile",
        "value": "Iso",
        "note": "Chinese fixer for hire Iso falls into a flow state to dismantle the opposition. Reconfiguring ambient energy into bulletproof protection, he advances with focus towards his next duel to the death."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US"
  },
  {
    "id": "kay-o",
    "label": "KAY/O",
    "role": "Initiator",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/fullportrait.png",
    "fundamentals": [
      "Riot identifies KAY/O as a Initiator. KAY/O is a machine of war built for a single purpose: neutralizing radiants. His power to Suppress enemy abilities dismantles his opponents' capacity to fight back, securing him and his allies the ultimate edge.",
      "FRAG/ment is KAY/O's current Signature ability. EQUIP an explosive fragment. FIRE to throw. ALT FIRE to lob. The fragment sticks to the floor and explodes multiple times, dealing near lethal damage at the center with each explosion.",
      "NULL/cmd is KAY/O's Ultimate ability. INSTANTLY overload with polarized radianite energy that pulses from KAY/O in a massive radius. Enemies hit with pulses are Suppressed for a short duration. While overloaded, KAY/O gains Combat Stim and can be re-stabilized if downed."
    ],
    "patchHistory": [
      {
        "patch": "13.01",
        "note": "Current ability verification: KAY/O is listed in Riot's live playable-agent content feed. No additional balance value is inferred.",
        "source": "https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=en-US"
      },
      {
        "patch": "13.01",
        "note": "Roster verification: KAY/O is listed in Riot's live playable-agent content feed. No additional balance value is inferred.",
        "source": "https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=en-US"
      }
    ],
    "abilities": [
      {
        "id": "frag-ment",
        "name": "FRAG/ment",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/grenade/displayicon.png",
        "summary": "EQUIP an explosive fragment. FIRE to throw. ALT FIRE to lob. The fragment sticks to the floor and explodes multiple times, dealing near lethal damage at the center with each explosion.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "FRAG/ment applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "FRAG/ment must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US"
      },
      {
        "id": "flash-drive",
        "name": "FLASH/drive",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/ability1/displayicon.png",
        "summary": "EQUIP a flash grenade. FIRE to overhand throw. ALT FIRE to lob a weaker version that explodes quickly. The flash grenade explodes after a short fuse, Blinding anyone in line of sight.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "FLASH/drive is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "FLASH/drive must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US"
      },
      {
        "id": "zero-point",
        "name": "ZERO/point",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/ability2/displayicon.png",
        "summary": "EQUIP a suppression blade. FIRE to throw. The blade sticks to the first surface it hits, winds up, and Suppresses anyone in the radius of the explosion. Enemies can destroy this blade.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "ZERO/point limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "ZERO/point must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US"
      },
      {
        "id": "null-cmd",
        "name": "NULL/cmd",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/abilities/ultimate/displayicon.png",
        "summary": "INSTANTLY overload with polarized radianite energy that pulses from KAY/O in a massive radius. Enemies hit with pulses are Suppressed for a short duration. While overloaded, KAY/O gains Combat Stim and can be re-stabilized if downed.",
        "stats": {
          "Cost": "Ultimate-point value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "NULL/cmd limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "NULL/cmd should be prepared around the official description above; no extra range, duration, or interaction is assumed when Riot's public feed does not state it.",
        "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Initiator",
        "note": "Initiators challenge angles by setting up their team to enter contested ground and push defenders away."
      },
      {
        "label": "Official profile",
        "value": "KAY/O",
        "note": "KAY/O is a machine of war built for a single purpose: neutralizing radiants. His power to Suppress enemy abilities dismantles his opponents' capacity to fight back, securing him and his allies the ultimate edge."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US"
  },
  {
    "id": "killjoy",
    "label": "Killjoy",
    "role": "Sentinel",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/fullportrait.png",
    "fundamentals": [
      "Riot identifies Killjoy as a Sentinel. The genius of Germany, Killjoy effortlessly secures key battlefield positions with her arsenal of inventions. If their damage doesn't take her enemies out, the debuff her robots provide will make short work of them.",
      "Killjoy's current ability slots are listed directly from Riot's live game-content feed.",
      "Lockdown is Killjoy's Ultimate ability. EQUIP the Lockdown device. FIRE to deploy the device. After a long windup, the device Detains all enemies caught in the radius. The device can be destroyed by enemies."
    ],
    "patchHistory": [
      {
        "patch": "12.04",
        "note": "Turret Buff: Can now be rotated while holding down ALT-FIRE. ACTIVATE now swaps its direction.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-04/"
      },
      {
        "patch": "12.01",
        "note": "Bugfix: Fixed a bug where Killjoy's neck and hair clip would shift inconsistently while moving with an Odin equipped.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-01/"
      }
    ],
    "abilities": [
      {
        "id": "nanoswarm",
        "name": "Nanoswarm",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/grenade/displayicon.png",
        "summary": "EQUIP a Nanoswarm grenade. FIRE to throw the grenade. Upon landing, the Nanoswarm goes covert. ALT FIRE to lob. ACTIVATE the Nanoswarm to deploy a damaging swarm of nanobots.  ",
        "stats": {
          "Cost": "200 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Nanoswarm applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Nanoswarm must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US"
      },
      {
        "id": "alarmbot",
        "name": "ALARMBOT",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/ability1/displayicon.png",
        "summary": "EQUIP a covert Alarmbot. FIRE to deploy a bot that hunts down enemies that get in range.  After reaching its target, the bot explodes and applies Vulnerable to enemies in the area. HOLD EQUIP to recall a deployed bot.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "ALARMBOT applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "ALARMBOT must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US"
      },
      {
        "id": "turret",
        "name": "TURRET",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/ability2/displayicon.png",
        "summary": "EQUIP a Turret. FIRE to deploy a turret that fires at enemies in a 100 degree cone. While targeting, EQUIP again to swap turret direction, HOLD ALT FIRE to rotate. HOLD EQUIP to recall the deployed turret.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "TURRET performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "TURRET must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US"
      },
      {
        "id": "lockdown",
        "name": "Lockdown",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/abilities/ultimate/displayicon.png",
        "summary": "EQUIP the Lockdown device. FIRE to deploy the device. After a long windup, the device Detains all enemies caught in the radius. The device can be destroyed by enemies.",
        "stats": {
          "Cost": "9 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Lockdown limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Lockdown must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Sentinel",
        "note": "Sentinels are defensive experts who can lock down areas and watch flanks, both on attacker and defender rounds."
      },
      {
        "label": "Official profile",
        "value": "Killjoy",
        "note": "The genius of Germany, Killjoy effortlessly secures key battlefield positions with her arsenal of inventions. If their damage doesn't take her enemies out, the debuff her robots provide will make short work of them."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US"
  },
  {
    "id": "miks",
    "label": "Miks",
    "role": "Controller",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/fullportrait.png",
    "fundamentals": [
      "Riot identifies Miks as a Controller. Straight from Croatia, Miks takes the stage channeling pure sound energy. With his infectious passion and sonic powers, he rallies his squad to move as one as they set the tempo on the battlefield together.",
      "Waveform is Miks's current Signature ability. EQUIP a Map Targeter. FIRE to set locations. ALT-FIRE to spawn Smokes at selected locations.",
      "Bassquake is Miks's Ultimate ability. EQUIP Bassquake. FIRE to build up and unleash Sonic Radiance forward, knocking back, Deafening, and Slowing players."
    ],
    "patchHistory": [
      {
        "patch": "12.09",
        "note": "Harmonize Bugfix: Updated tooltip description.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
      },
      {
        "patch": "12.07",
        "note": "Bassquake Bugfix: Fixed a bug where using it would cause the minimap cone to blink on use.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-07/"
      }
    ],
    "abilities": [
      {
        "id": "m-pulse",
        "name": "M-pulse",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/grenade/displayicon.png",
        "summary": "EQUIP M-pulse. ALT-FIRE to toggle between Concuss and Healing outputs. FIRE to throw the device. Upon landing, M-pulse sends out sound waves, either Concussing or Healing players.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "M-pulse preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "M-pulse must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US"
      },
      {
        "id": "waveform",
        "name": "Waveform",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/ability2/displayicon.png",
        "summary": "EQUIP a Map Targeter. FIRE to set locations. ALT-FIRE to spawn Smokes at selected locations.",
        "stats": {
          "Cost": "100 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Waveform controls sightlines. Place it on the specific defender view the team needs removed, then move while that view is blocked.",
        "setup": "Waveform must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US"
      },
      {
        "id": "harmonize",
        "name": "Harmonize",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/ability1/displayicon.png",
        "summary": "EQUIP Harmonize. Target an ally and FIRE to activate a Combat Stim and a speed boost on yourself and the ally that refreshes with each kill. ALT-FIRE to grant Combat Stim and speed boost to yourself.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Harmonize changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Harmonize must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US"
      },
      {
        "id": "bassquake",
        "name": "Bassquake",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/abilities/ultimate/displayicon.png",
        "summary": "EQUIP Bassquake. FIRE to build up and unleash Sonic Radiance forward, knocking back, Deafening, and Slowing players.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Bassquake limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Bassquake must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Controller",
        "note": "Controllers are experts in slicing up dangerous territory to set their team up for success."
      },
      {
        "label": "Official profile",
        "value": "Miks",
        "note": "Straight from Croatia, Miks takes the stage channeling pure sound energy. With his infectious passion and sonic powers, he rallies his squad to move as one as they set the tempo on the battlefield together."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US"
  },
  {
    "id": "neon",
    "label": "Neon",
    "role": "Duelist",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/fullportrait.png",
    "fundamentals": [
      "Riot identifies Neon as a Duelist. Filipino Agent Neon surges forward at shocking speeds, discharging bursts of bioelectric radiance as fast as her body generates it. She races ahead to catch enemies off guard then strikes them down quicker than lightning.",
      "High Gear is Neon's current Signature ability. INSTANTLY channel Neon's power for Increased Speed. When charged, ALT FIRE to trigger an electric slide dash. Slide charge resets every two kills.",
      "Overdrive is Neon's Ultimate ability. Unleash Neon's full power and speed for a short duration, regaining all her fuel and a slide charge. FIRE to channel the power into a deadly lightning beam with high movement accuracy. Kills reset the duration of the effect. "
    ],
    "patchHistory": [
      {
        "patch": "12.09",
        "note": "High Gear Nerf: Jumping while active no longer provides any speed bonus while Neon is airborne. Instead, Neon's air speed while sprinting will match melee speed.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
      },
      {
        "patch": "12.07",
        "note": "High Gear Bugfix: Fixed a bug where the slide was not playing SFX for moving across different surface types.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-07/"
      }
    ],
    "abilities": [
      {
        "id": "high-gear",
        "name": "High Gear",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/ability2/displayicon.png",
        "summary": "INSTANTLY channel Neon's power for Increased Speed. When charged, ALT FIRE to trigger an electric slide dash. Slide charge resets every two kills.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "High Gear changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "High Gear needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US"
      },
      {
        "id": "relay-bolt",
        "name": "Relay Bolt",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/ability1/displayicon.png",
        "summary": "INSTANTLY throw an energy bolt that bounces once. Upon hitting each surface, the bolt electrifies the ground below with a Concussive blast.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Relay Bolt limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Relay Bolt needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US"
      },
      {
        "id": "fast-lane",
        "name": "Fast Lane",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/grenade/displayicon.png",
        "summary": "FIRE two energy lines forward on the ground that extend a short distance or until they hit a surface. The lines rise into walls of static electricity that block vision.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Fast Lane performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Fast Lane needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US"
      },
      {
        "id": "overdrive",
        "name": "Overdrive",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/ultimate/displayicon.png",
        "summary": "Unleash Neon's full power and speed for a short duration, regaining all her fuel and a slide charge. FIRE to channel the power into a deadly lightning beam with high movement accuracy. Kills reset the duration of the effect. ",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Overdrive changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Overdrive needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Duelist",
        "note": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first."
      },
      {
        "label": "Official profile",
        "value": "Neon",
        "note": "Filipino Agent Neon surges forward at shocking speeds, discharging bursts of bioelectric radiance as fast as her body generates it. She races ahead to catch enemies off guard then strikes them down quicker than lightning."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US"
  },
  {
    "id": "phoenix",
    "label": "Phoenix",
    "role": "Duelist",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/fullportrait.png",
    "fundamentals": [
      "Riot identifies Phoenix as a Duelist. Hailing from the U.K., Phoenix's star power shines through in his fighting style, igniting the battlefield with flash and flare. Whether he's got backup or not, he's rushing in to fight on his own terms.",
      "Curveball is Phoenix's current Signature ability. EQUIP a flare orb that takes a curving path and detonates shortly after throwing. FIRE to curve the flare orb to the left, detonating and Blinding any player who sees the orb. ALT FIRE to curve the flare orb to the right. Curveball resets a charge every two kills.",
      "Run it Back is Phoenix's Ultimate ability. INSTANTLY place a marker at Phoenix's location. While this ability is active, dying or allowing the timer to expire will end this ability and bring Phoenix back to this location with full health and the amount of armor he had when the ability was cast."
    ],
    "patchHistory": [
      {
        "patch": "12.01",
        "note": "Run it Back Bugfix Buff: Fixed a bug where Phoenix would remain nearsighted from certain abilities after respawning from Run it Back.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-01/"
      },
      {
        "patch": "12.00",
        "note": "Hot Hands Bugfix Buff: Fixed an issue where throw animations would break if aiming straight down",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-00/"
      }
    ],
    "abilities": [
      {
        "id": "blaze",
        "name": "Blaze",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/grenade/displayicon.png",
        "summary": "EQUIP a flame wall. FIRE to create a line of flame that moves forward, passing through the world and creating a wall of fire that blocks vision and damages players passing through it. The fire wall heals Phoenix instead of dealing damage. HOLD FIRE to bend the wall in the direction of your crosshair.",
        "stats": {
          "Cost": "150 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Blaze controls sightlines. Place it on the specific defender view the team needs removed, then move while that view is blocked.",
        "setup": "Blaze must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US"
      },
      {
        "id": "hot-hands",
        "name": "Hot Hands",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ability1/displayicon.png",
        "summary": "EQUIP a fireball. FIRE to throw a fireball that explodes after a set amount of time or upon hitting the ground, creating a lingering fire zone that damages enemies. The fire zone heals Phoenix instead of dealing damage. ALT FIRE to lob.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Hot Hands preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Hot Hands must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US"
      },
      {
        "id": "curveball",
        "name": "Curveball",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ability2/displayicon.png",
        "summary": "EQUIP a flare orb that takes a curving path and detonates shortly after throwing. FIRE to curve the flare orb to the left, detonating and Blinding any player who sees the orb. ALT FIRE to curve the flare orb to the right. Curveball resets a charge every two kills.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Curveball is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Curveball must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US"
      },
      {
        "id": "run-it-back",
        "name": "Run it Back",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/abilities/ultimate/displayicon.png",
        "summary": "INSTANTLY place a marker at Phoenix's location. While this ability is active, dying or allowing the timer to expire will end this ability and bring Phoenix back to this location with full health and the amount of armor he had when the ability was cast.",
        "stats": {
          "Cost": "6 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Run it Back preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Run it Back needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US"
      },
      {
        "id": "heating-up",
        "name": "Heating Up",
        "slot": "Passive",
        "icon": null,
        "summary": "PASSIVELY Heal Phoenix instead of taking damage after standing in Phoenix's own fire",
        "stats": {
          "Cost": "Passive; no purchase",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Heating Up preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Heating Up needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Duelist",
        "note": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first."
      },
      {
        "label": "Official profile",
        "value": "Phoenix",
        "note": "Hailing from the U.K., Phoenix's star power shines through in his fighting style, igniting the battlefield with flash and flare. Whether he's got backup or not, he's rushing in to fight on his own terms."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US"
  },
  {
    "id": "raze",
    "label": "Raze",
    "role": "Duelist",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/fullportrait.png",
    "fundamentals": [
      "Riot identifies Raze as a Duelist. Raze explodes out of Brazil with her big personality and big guns. With her blunt-force-trauma playstyle, she excels at flushing entrenched enemies and clearing tight spaces with a generous dose of \"boom.\"",
      "Paint Shells is Raze's current Signature ability. EQUIP a cluster grenade. FIRE to throw the grenade, which does damage and creates sub-munitions, each doing damage to anyone in their range. ALT FIRE to lob. Paint Shells charge resets every two kills.",
      "Showstopper is Raze's Ultimate ability. EQUIP a rocket launcher. FIRE to shoot a rocket that does massive area damage on contact with anything."
    ],
    "patchHistory": [
      {
        "patch": "12.02",
        "note": "Boom Bot Nerf: Can now be concussed.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-02/"
      },
      {
        "patch": "11.08",
        "note": "Blast Pack Nerf: Can now be affected by Slows while midair with Blast Pack. If Slowed, the force from Blast Pack will be reduced, similar to how slows affect other Dashes",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
      }
    ],
    "abilities": [
      {
        "id": "blast-pack",
        "name": "Blast Pack",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability1/displayicon.png",
        "summary": "INSTANTLY throw a Blast Pack that will stick to surfaces. RE-USE the ability after deployment to detonate, moving anything hit and dealing damage if fully armed.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Blast Pack applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Blast Pack needs a deliberate target or path. Confirm the landing area and the teammate timing before deploying it.",
        "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
      },
      {
        "id": "paint-shells",
        "name": "Paint Shells",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability2/displayicon.png",
        "summary": "EQUIP a cluster grenade. FIRE to throw the grenade, which does damage and creates sub-munitions, each doing damage to anyone in their range. ALT FIRE to lob. Paint Shells charge resets every two kills.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Paint Shells applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Paint Shells must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
      },
      {
        "id": "boom-bot",
        "name": "Boom Bot",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/grenade/displayicon.png",
        "summary": "EQUIP a Boom Bot. FIRE will deploy the bot, causing it to travel in a straight line on the ground, bouncing off walls. The Boom Bot will lock on to any enemies in its frontal cone and chase them, exploding for heavy damage if it reaches them.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Boom Bot applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Boom Bot must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
      },
      {
        "id": "showstopper",
        "name": "Showstopper",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a rocket launcher. FIRE to shoot a rocket that does massive area damage on contact with anything.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Showstopper applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Showstopper must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Duelist",
        "note": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first."
      },
      {
        "label": "Official profile",
        "value": "Raze",
        "note": "Raze explodes out of Brazil with her big personality and big guns. With her blunt-force-trauma playstyle, she excels at flushing entrenched enemies and clearing tight spaces with a generous dose of \"boom.\""
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
  },
  {
    "id": "reyna",
    "label": "Reyna",
    "role": "Duelist",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/fullportrait.png",
    "fundamentals": [
      "Riot identifies Reyna as a Duelist. Forged in the heart of Mexico, Reyna dominates single combat, popping off with each kill she scores. Her capability is only limited by her raw skill, making her sharply dependent on performance. ",
      "Dismiss is Reyna's current Signature ability. INSTANTLY consume a nearby Soul Orb, becoming Intangible for a short duration. If EMPRESS is active, also become Invisible.",
      "Empress is Reyna's Ultimate ability. INSTANTLY enter a frenzy, gaining a Combat Stim that increases firing, equip and reload speed dramatically. Gain infinite charges of Soul Harvest abilities."
    ],
    "patchHistory": [
      {
        "patch": "12.02",
        "note": "Soul Harvest Nerf: Orbs duration in world decreased from 4s >> 3s",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-02/"
      },
      {
        "patch": "12.00",
        "note": "Leer Bugfix Buff: Fixed an issue where throw animations would break if aiming straight down",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-00/"
      }
    ],
    "abilities": [
      {
        "id": "devour",
        "name": "Devour",
        "slot": "Q - Signature",
        "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ability1/displayicon.png",
        "summary": "Soul Harvest: Enemies that die within 3 seconds of taking damage from Reyna leave behind Soul Orbs that last 3 seconds.\r\nDevour: INSTANTLY consume a soul orb, rapidly gaining Temporary Health. If EMPRESS is active then Devour automatically casts, does not consume the Soul Orb, and Healing is permanent.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "2, shared with Dismiss",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Devour preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Devour should be prepared around the official description above; no extra range, duration, or interaction is assumed when Riot's public feed does not state it.",
        "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US"
      },
      {
        "id": "dismiss",
        "name": "Dismiss",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ability2/displayicon.png",
        "summary": "INSTANTLY consume a nearby Soul Orb, becoming Intangible for a short duration. If EMPRESS is active, also become Invisible.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "2, shared with Devour",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Dismiss performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Dismiss should be prepared around the official description above; no extra range, duration, or interaction is assumed when Riot's public feed does not state it.",
        "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US"
      },
      {
        "id": "leer",
        "name": "Leer",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/grenade/displayicon.png",
        "summary": "EQUIP an ethereal, destructible eye. ACTIVATE to cast the eye a short distance forward. The eye will Nearsight all enemies who look at it.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Leer is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Leer must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US"
      },
      {
        "id": "empress",
        "name": "Empress",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/abilities/ultimate/displayicon.png",
        "summary": "INSTANTLY enter a frenzy, gaining a Combat Stim that increases firing, equip and reload speed dramatically. Gain infinite charges of Soul Harvest abilities.",
        "stats": {
          "Cost": "7 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Empress changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Empress must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Duelist",
        "note": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first."
      },
      {
        "label": "Official profile",
        "value": "Reyna",
        "note": "Forged in the heart of Mexico, Reyna dominates single combat, popping off with each kill she scores. Her capability is only limited by her raw skill, making her sharply dependent on performance. "
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US"
  },
  {
    "id": "skye",
    "label": "Skye",
    "role": "Initiator",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/fullportrait.png",
    "fundamentals": [
      "Riot identifies Skye as a Initiator. Hailing from Australia, Skye and her band of beasts trailblaze the way through hostile territory. With her creations hampering the enemy, and her power to heal others, the team is strongest and safest by Skye's side.",
      "Guiding Light is Skye's current Signature ability. EQUIP a hawk trinket. FIRE to send it forward. HOLD FIRE to guide the hawk in the direction of your crosshair. RE-USE while the hawk is in flight to transform it into a flash. The flash reaches max potency after a short duration during the hawk's flight.",
      "Seekers is Skye's Ultimate ability. EQUIP a Seeker trinket. FIRE to send out three Seekers to track down the three closest enemies. If a Seeker reaches its target, it Nearsights and slows them. Enemies can destroy the Seekers."
    ],
    "patchHistory": [
      {
        "patch": "12.05",
        "note": "Guiding Light Added: Added 60s Cooldown",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-05/"
      },
      {
        "patch": "12.04",
        "note": "Seekers Bugfix: Fixed an observer bug where they would not show on the minimap when she is an attacker.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-04/"
      }
    ],
    "abilities": [
      {
        "id": "trailblazer",
        "name": "Trailblazer",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/ability1/displayicon.png",
        "summary": "EQUIP a Tasmanian tiger trinket. FIRE to send out and take control of the predator. While in control, FIRE to leap forward, exploding in a Concussive blast on impact and damaging directly hit enemies.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Trailblazer applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Trailblazer must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US"
      },
      {
        "id": "guiding-light",
        "name": "Guiding Light",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/ability2/displayicon.png",
        "summary": "EQUIP a hawk trinket. FIRE to send it forward. HOLD FIRE to guide the hawk in the direction of your crosshair. RE-USE while the hawk is in flight to transform it into a flash. The flash reaches max potency after a short duration during the hawk's flight.",
        "stats": {
          "Cost": "250 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Guiding Light is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Guiding Light must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US"
      },
      {
        "id": "regrowth",
        "name": "Regrowth",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/grenade/displayicon.png",
        "summary": "EQUIP a healing trinket. HOLD FIRE to channel, Healing allies in range and line of sight. Can be reused until her healing pool is depleted. Skye cannot heal herself.",
        "stats": {
          "Cost": "150 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Regrowth preserves team resources. Use its verified recovery effect only when the restored player can safely return to a useful fight.",
        "setup": "Regrowth must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US"
      },
      {
        "id": "seekers",
        "name": "Seekers",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a Seeker trinket. FIRE to send out three Seekers to track down the three closest enemies. If a Seeker reaches its target, it Nearsights and slows them. Enemies can destroy the Seekers.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Seekers is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Seekers must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Initiator",
        "note": "Initiators challenge angles by setting up their team to enter contested ground and push defenders away."
      },
      {
        "label": "Official profile",
        "value": "Skye",
        "note": "Hailing from Australia, Skye and her band of beasts trailblaze the way through hostile territory. With her creations hampering the enemy, and her power to heal others, the team is strongest and safest by Skye's side."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US"
  },
  {
    "id": "tejo",
    "label": "Tejo",
    "role": "Initiator",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/fullportrait.png",
    "fundamentals": [
      "Riot identifies Tejo as a Initiator. A veteran intelligence consultant from Colombia, Tejo's ballistic guidance system pressures the enemy to relinquish their ground - or their lives. His targeted strikes keep opponents off balance and under his heel.",
      "Guided Salvo is Tejo's current Signature ability. EQUIP an AR targeting system. FIRE to select up to two target locations on the map. ALT FIRE to launch missiles that autonomously navigate to target locations, detonating repeatedly for damage on arrival.",
      "Armageddon is Tejo's Ultimate ability. EQUIP a tactical strike targeting map. FIRE to select the origin point of the strike. FIRE again to set the end point and launch the attack, unleashing a wave of lethal damaging explosions along the strike path. ALT FIRE during map targeting to cancel the origin point."
    ],
    "patchHistory": [
      {
        "patch": "12.09",
        "note": "Guided Salvo Bugfix: Fixed issue where the equip idle sound kept playing long after cast.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
      },
      {
        "patch": "12.08",
        "note": "Bugfix: Fixed a bug where his agent select animation would sometimes cut off the smoke from the explosion. (fixed in",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-08/"
      }
    ],
    "abilities": [
      {
        "id": "guided-salvo",
        "name": "Guided Salvo",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/ability2/displayicon.png",
        "summary": "EQUIP an AR targeting system. FIRE to select up to two target locations on the map. ALT FIRE to launch missiles that autonomously navigate to target locations, detonating repeatedly for damage on arrival.",
        "stats": {
          "Cost": "150 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Guided Salvo applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Guided Salvo must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US"
      },
      {
        "id": "special-delivery",
        "name": "Special Delivery",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/ability1/displayicon.png",
        "summary": "EQUIP a sticky grenade. FIRE to launch. The grenade sticks to the first surface it hits and explodes, Concussing and dealing damage to any targets caught in the blast. ALT FIRE to launch the grenade with a single bounce instead.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Special Delivery applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Special Delivery must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US"
      },
      {
        "id": "armageddon",
        "name": "Armageddon",
        "slot": "E - Ultimate",
        "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a tactical strike targeting map. FIRE to select the origin point of the strike. FIRE again to set the end point and launch the attack, unleashing a wave of lethal damaging explosions along the strike path. ALT FIRE during map targeting to cancel the origin point.",
        "stats": {
          "Cost": "9 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Armageddon performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Armageddon must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US"
      },
      {
        "id": "stealth-drone",
        "name": "Stealth Drone",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/abilities/grenade/displayicon.png",
        "summary": "EQUIP a stealth drone. FIRE to throw the drone forward, assuming direct control of its movement. FIRE again to trigger a pulse that Suppresses and Reveals enemies hit.",
        "stats": {
          "Cost": "400 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Stealth Drone provides information. Use the reveal, detection, or tracking result to name an occupied space before a teammate commits.",
        "setup": "Stealth Drone must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Initiator",
        "note": "Initiators challenge angles by setting up their team to enter contested ground and push defenders away."
      },
      {
        "label": "Official profile",
        "value": "Tejo",
        "note": "A veteran intelligence consultant from Colombia, Tejo's ballistic guidance system pressures the enemy to relinquish their ground - or their lives. His targeted strikes keep opponents off balance and under his heel."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US"
  },
  {
    "id": "veto",
    "label": "Veto",
    "role": "Sentinel",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/fullportrait.png",
    "fundamentals": [
      "Riot identifies Veto as a Sentinel. Empowered by an unstoppable DNA mutation, Senegalese enforcer Veto defies the rules of engagement by nullifying his opponent's powers and technology. On Veto's battlefield, gunplay is your only guarantee.",
      "Interceptor is Veto's current Signature ability. EQUIP the Interceptor. FIRE to place the Interceptor at projected location. Once placed, RE-USE to activate. Once active, it will destroy any utility that would BOUNCE off a player and/or be destroyed naturally by gunfire. Enemies can destroy the Interceptor.",
      "Evolution is Veto's Ultimate ability. INSTANTLY begin to fully mutate, gaining a combat stim, regeneration, and becoming IMMUNE to all forms of debuffs."
    ],
    "patchHistory": [
      {
        "patch": "12.08",
        "note": "Evolution Bugfix: Fixed a bug where Viper's Toxic Screen SFX would activate repeatedly when Veto walked into it with Evolution active",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-08/"
      },
      {
        "patch": "12.06",
        "note": "Crosscut Bugfix: Fixed a bug where the icon was missing on the minimap when the Enemy Highlight Color setting was set to red.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-06/"
      }
    ],
    "abilities": [
      {
        "id": "interceptor",
        "name": "Interceptor",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/ability2/displayicon.png",
        "summary": "EQUIP the Interceptor. FIRE to place the Interceptor at projected location. Once placed, RE-USE to activate. Once active, it will destroy any utility that would BOUNCE off a player and/or be destroyed naturally by gunfire. Enemies can destroy the Interceptor.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Interceptor performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Interceptor must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US"
      },
      {
        "id": "crosscut",
        "name": "Crosscut",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/grenade/displayicon.png",
        "summary": "EQUIP a vortex. FIRE to place on the ground. While in range and looking at the vortex, ACTIVATE to teleport to the vortex. During the BUY PHASE, the vortex can be reclaimed to be REDEPLOYED.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Crosscut changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Crosscut must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US"
      },
      {
        "id": "evolution",
        "name": "Evolution",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/ultimate/displayicon.png",
        "summary": "INSTANTLY begin to fully mutate, gaining a combat stim, regeneration, and becoming IMMUNE to all forms of debuffs.",
        "stats": {
          "Cost": "7 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Evolution performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Evolution should be prepared around the official description above; no extra range, duration, or interaction is assumed when Riot's public feed does not state it.",
        "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US"
      },
      {
        "id": "chokehold",
        "name": "Chokehold",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/abilities/ability1/displayicon.png",
        "summary": "EQUIP a viscous fragment of your mutation. FIRE to throw. The fragment deploys upon hitting the ground, creating a trap to hold enemies in place. Held enemies are Deafened, and Decayed. Enemies can destroy the trap before activation.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Chokehold limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Chokehold must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Sentinel",
        "note": "Sentinels are defensive experts who can lock down areas and watch flanks, both on attacker and defender rounds."
      },
      {
        "label": "Official profile",
        "value": "Veto",
        "note": "Empowered by an unstoppable DNA mutation, Senegalese enforcer Veto defies the rules of engagement by nullifying his opponent's powers and technology. On Veto's battlefield, gunplay is your only guarantee."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US"
  },
  {
    "id": "vyse",
    "label": "Vyse",
    "role": "Sentinel",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/fullportrait.png",
    "fundamentals": [
      "Riot identifies Vyse as a Sentinel. Metallic mastermind Vyse unleashes liquid metal to isolate, trap, and disarm her enemies. Through cunning and manipulation, she forces all who oppose her to fear the battlefield itself.",
      "Arc Rose is Vyse's current Signature ability. EQUIP an Arc Rose. Target a surface and FIRE to place a stealthed Arc Rose, or ALT FIRE to place the Arc Rose through it. REUSE to blind all players looking at it. This ability can be picked up to be REDEPLOYED.",
      "Steel Garden is Vyse's Ultimate ability. EQUIP a bramble of liquid metal. FIRE to send the metal erupting from you as a torrent of metal thorns, JAMMING enemy primary weapons after a brief windup."
    ],
    "patchHistory": [
      {
        "patch": "12.09",
        "note": "Shear Bugfix Buff: Fixed a bug where possessable drones (Sova's Owl Drone, Skye's Trailblazer, Tejo's Stealth Drone) would trigger the arming audio",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
      },
      {
        "patch": "12.03",
        "note": "Razorvine All Random One Site only:",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-03/"
      }
    ],
    "abilities": [
      {
        "id": "shear",
        "name": "Shear",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/ability1/displayicon.png",
        "summary": "EQUIP filaments of liquid metal. FIRE to place a hidden wall trap. When an enemy crosses, an indestructible wall bursts from the ground behind them. The wall lasts for a brief time before dissipating.",
        "stats": {
          "Cost": "200 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Shear limits an opponent's options. Time its verified control effect for the moment an enemy must cross or fight.",
        "setup": "Shear must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US"
      },
      {
        "id": "arc-rose",
        "name": "Arc Rose",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/ability2/displayicon.png",
        "summary": "EQUIP an Arc Rose. Target a surface and FIRE to place a stealthed Arc Rose, or ALT FIRE to place the Arc Rose through it. REUSE to blind all players looking at it. This ability can be picked up to be REDEPLOYED.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Arc Rose is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "Arc Rose must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US"
      },
      {
        "id": "razorvine",
        "name": "Razorvine",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/grenade/displayicon.png",
        "summary": "EQUIP a nest of liquid metal. FIRE to launch. Upon landing, the nest becomes invisible. When ACTIVATED, it sprawls out into a large razorvine nest which slows and damages all players who move through it.",
        "stats": {
          "Cost": "150 credits",
          "Charges": "2",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Razorvine applies direct pressure. Pair its verified damage effect with a confirmed position rather than spending it on an unchecked guess.",
        "setup": "Razorvine must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US"
      },
      {
        "id": "steel-garden",
        "name": "Steel Garden",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a bramble of liquid metal. FIRE to send the metal erupting from you as a torrent of metal thorns, JAMMING enemy primary weapons after a brief windup.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Steel Garden performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "Steel Garden must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Sentinel",
        "note": "Sentinels are defensive experts who can lock down areas and watch flanks, both on attacker and defender rounds."
      },
      {
        "label": "Official profile",
        "value": "Vyse",
        "note": "Metallic mastermind Vyse unleashes liquid metal to isolate, trap, and disarm her enemies. Through cunning and manipulation, she forces all who oppose her to fear the battlefield itself."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US"
  },
  {
    "id": "waylay",
    "label": "Waylay",
    "role": "Duelist",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/fullportrait.png",
    "fundamentals": [
      "Riot identifies Waylay as a Duelist. Thailand's prismatic radiant Waylay transforms into light itself as she darts across the battlefield, striking down her targets through shards of light before flitting back to safety, all in the blink of an eye.",
      "Refract is Waylay's current Signature ability. INSTANTLY create a beacon of light on the floor. REACTIVATE to speed back to your beacon as a mote of pure light. You are invulnerable as you travel. Refract resets a charge every two kills.",
      "Convergent Paths is Waylay's Ultimate ability. EQUIP to focus your prismatic power. FIRE to create an afterimage of yourself that projects a beam of light. After a brief delay, you gain a powerful speed boost and the beam expands, Hindering other players in the area."
    ],
    "patchHistory": [
      {
        "patch": "12.06",
        "note": "Saturate Nerf: Changed from INSTANT to EQUIP.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-06/"
      },
      {
        "patch": "11.08",
        "note": "Saturate Nerf: Hindered duration decreased from 4s to 3s",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
      }
    ],
    "abilities": [
      {
        "id": "refract",
        "name": "Refract",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/ability2/displayicon.png",
        "summary": "INSTANTLY create a beacon of light on the floor. REACTIVATE to speed back to your beacon as a mote of pure light. You are invulnerable as you travel. Refract resets a charge every two kills.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Refract changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Refract has a second activation in Riot's description. Decide what will trigger that follow-up before the first cast.",
        "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US"
      },
      {
        "id": "saturate",
        "name": "Saturate",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/grenade/displayicon.png",
        "summary": "EQUIP a cluster of light. FIRE to throw the cluster, which upon contact with the ground explodes, Hindering nearby players with a powerful movement and weapon slow.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Saturate changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Saturate must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US"
      },
      {
        "id": "lightspeed",
        "name": "Lightspeed",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/ability1/displayicon.png",
        "summary": "EQUIP to prepare for a burst of speed. FIRE to dash forward twice. ALT FIRE to dash once. Only your first dash can send you upward.",
        "stats": {
          "Cost": "300 credits",
          "Charges": "1",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Lightspeed changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Lightspeed must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US"
      },
      {
        "id": "convergent-paths",
        "name": "Convergent Paths",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/abilities/ultimate/displayicon.png",
        "summary": "EQUIP to focus your prismatic power. FIRE to create an afterimage of yourself that projects a beam of light. After a brief delay, you gain a powerful speed boost and the beam expands, Hindering other players in the area.",
        "stats": {
          "Cost": "8 ultimate points",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text + Valorant Wiki current infobox"
        },
        "purpose": "Convergent Paths changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "Convergent Paths must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Duelist",
        "note": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first."
      },
      {
        "label": "Official profile",
        "value": "Waylay",
        "note": "Thailand's prismatic radiant Waylay transforms into light itself as she darts across the battlefield, striking down her targets through shards of light before flitting back to safety, all in the blink of an eye."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US"
  },
  {
    "id": "yoru",
    "label": "Yoru",
    "role": "Duelist",
    "maps": [],
    "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png",
    "portrait": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/fullportrait.png",
    "fundamentals": [
      "Riot identifies Yoru as a Duelist. Japanese native Yoru rips holes straight through reality to infiltrate enemy lines unseen. Using deception and aggression in equal measure, he gets the drop on each target before they know where to look.",
      "FAKEOUT is Yoru's current Signature ability. EQUIP an echo that transforms into a mirror image of Yoru when activated. FIRE to instantly activate the mirror image and send it forward. ALT FIRE to place an inactive echo. USE to transform an inactive echo into a mirror image and send it forward.  Mirror images explode in a Blinding flash when destroyed by enemies.",
      "DIMENSIONAL DRIFT is Yoru's Ultimate ability. EQUIP a mask that can see between dimensions. FIRE to drift into Yoru's dimension, unable to be affected or seen by enemies from the outside. REACTIVATE to exit Yoru's dimension early."
    ],
    "patchHistory": [
      {
        "patch": "12.07",
        "note": "Dimensional Drift Bugfix Buff: Fixed a bug where during Dimensional Drift, he could not see invisible abilities even if he was close enough to them.",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-07/"
      },
      {
        "patch": "12.05",
        "note": "Gatecrash Nerf: Duration beacon is active reduced 30s >> 15s",
        "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-05/"
      }
    ],
    "abilities": [
      {
        "id": "fakeout",
        "name": "FAKEOUT",
        "slot": "E - Signature",
        "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/grenade/displayicon.png",
        "summary": "EQUIP an echo that transforms into a mirror image of Yoru when activated. FIRE to instantly activate the mirror image and send it forward. ALT FIRE to place an inactive echo. USE to transform an inactive echo into a mirror image and send it forward.  Mirror images explode in a Blinding flash when destroyed by enemies.",
        "stats": {
          "Cost": "Free signature charge",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "FAKEOUT is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "FAKEOUT must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US"
      },
      {
        "id": "blindside",
        "name": "BLINDSIDE",
        "slot": "C - Basic",
        "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/ability1/displayicon.png",
        "summary": "EQUIP to rip an unstable dimensional fragment from reality. FIRE to throw the fragment, activating a flash that winds up once it collides with a hard surface.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "BLINDSIDE is the kit's vision-denial tool. Use its verified blind or Nearsight effect immediately before the team contests the affected angle.",
        "setup": "BLINDSIDE must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US"
      },
      {
        "id": "gatecrash",
        "name": "GATECRASH",
        "slot": "Q - Basic",
        "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/ability2/displayicon.png",
        "summary": "EQUIP a rift tether FIRE to send the tether forward. ALT FIRE to place a stationary tether. ACTIVATE to teleport to the tether's location. USE to trigger a fake teleport. GATECRASH resets a charge every two kills.",
        "stats": {
          "Cost": "Current client value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "GATECRASH changes position. Choose the destination and nearby cover before activating the movement effect described by Riot.",
        "setup": "GATECRASH must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US"
      },
      {
        "id": "dimensional-drift",
        "name": "DIMENSIONAL DRIFT",
        "slot": "X - Ultimate",
        "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/abilities/ultimate/displayicon.png",
        "summary": "EQUIP a mask that can see between dimensions. FIRE to drift into Yoru's dimension, unable to be affected or seen by enemies from the outside. REACTIVATE to exit Yoru's dimension early.",
        "stats": {
          "Cost": "Ultimate-point value not published in Riot's public content feed",
          "Charges": "Current client value not published in Riot's public content feed",
          "Source": "Riot game text; economy detail unavailable"
        },
        "purpose": "DIMENSIONAL DRIFT performs the exact function in Riot's current description. Build the play around that stated effect instead of assuming an unlisted interaction.",
        "setup": "DIMENSIONAL DRIFT must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
        "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US"
      }
    ],
    "lore": [
      {
        "label": "Official role",
        "value": "Duelist",
        "note": "Duelists are self-sufficient fraggers who their team expects, through abilities and skills, to get high frags and seek out engagements first."
      },
      {
        "label": "Official profile",
        "value": "Yoru",
        "note": "Japanese native Yoru rips holes straight through reality to infiltrate enemy lines unseen. Using deception and aggression in equal measure, he gets the drop on each target before they know where to look."
      }
    ],
    "facts": [
      {
        "label": "Global pick rate",
        "value": "Not published",
        "note": "Riot's public game-content feed does not publish a current Competitive pick-rate sample."
      },
      {
        "label": "Map fit",
        "value": "Not published",
        "note": "No verified current-season map sample is attached to this dossier."
      }
    ],
    "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US"
  }
];
  const GENERATED_MAPS = [
  {
    "id": "abyss",
    "label": "Abyss",
    "inCompetitivePool": false,
    "cardImage": "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
    "layoutImage": "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/displayicon.png",
    "callouts": [
      {
        "label": "A Bridge",
        "x": 46.96,
        "y": 3.83
      },
      {
        "label": "A Link",
        "x": 30.15,
        "y": 27.32
      },
      {
        "label": "A Lobby",
        "x": 77.54,
        "y": 23.67
      },
      {
        "label": "A Main",
        "x": 63.37,
        "y": 19.22
      },
      {
        "label": "A Site",
        "x": 48.38,
        "y": 15.17
      },
      {
        "label": "Attacker Side Spawn",
        "x": 90.09,
        "y": 42.3
      },
      {
        "label": "A Tower",
        "x": 48.99,
        "y": 25.5
      },
      {
        "label": "Mid Bend",
        "x": 58.71,
        "y": 63.77
      },
      {
        "label": "B Link",
        "x": 30.96,
        "y": 66.2
      },
      {
        "label": "B Lobby",
        "x": 82.6,
        "y": 79.56
      },
      {
        "label": "B Main",
        "x": 62.35,
        "y": 86.04
      },
      {
        "label": "B Nest",
        "x": 67.42,
        "y": 90.3
      },
      {
        "label": "Mid Bottom",
        "x": 54.66,
        "y": 53.24
      },
      {
        "label": "B Site",
        "x": 40.48,
        "y": 85.84
      },
      {
        "label": "Mid Catwalk",
        "x": 54.25,
        "y": 45.14
      },
      {
        "label": "B Danger",
        "x": 55.67,
        "y": 97.39
      },
      {
        "label": "Defender Side Spawn",
        "x": 7.27,
        "y": 42.3
      },
      {
        "label": "Mid Library",
        "x": 45.14,
        "y": 52.63
      },
      {
        "label": "A Secret",
        "x": 18.81,
        "y": 19.42
      },
      {
        "label": "A Security",
        "x": 25.9,
        "y": 10.31
      },
      {
        "label": "Mid Top",
        "x": 30.76,
        "y": 43.72
      },
      {
        "label": "B Tower",
        "x": 29.75,
        "y": 81.79
      },
      {
        "label": "A Vent",
        "x": 47.37,
        "y": 36.23
      }
    ],
    "plantSpots": [],
    "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    "weaponSuggestions": [],
    "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
    "macro": {
      "defense": [
        "Abyss has open edges where players can fall out of the map. Defenders should keep movement paths clear when fighting near those exposed boundaries."
      ],
      "attack": [
        "Abyss uses vertical routes and exposed edges to change how players cross between lanes. Clear the landing and the ledge before committing movement utility."
      ]
    },
    "siteTips": [
      {
        "label": "A Link",
        "text": "A Link is a verified Riot callout on Abyss. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Lobby",
        "text": "A Lobby is a verified Riot callout on Abyss. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      },
      {
        "label": "A Main",
        "text": "A Main is a verified Riot callout on Abyss. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Site",
        "text": "A Site is a verified Riot callout on Abyss. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      }
    ],
    "teamplayTips": [
      {
        "label": "Map structure",
        "text": [
          "Call elevated and lower positions separately. A teammate clearing one height has not cleared the other angle watching the same lane."
        ]
      }
    ],
    "roleNotes": {
      "Duelist": [
        {
          "category": "sites",
          "text": "On Abyss, connect A Link to A Lobby: Take first space only after support utility reaches the named defender angle."
        }
      ],
      "Initiator": [
        {
          "category": "sites",
          "text": "On Abyss, connect A Lobby to A Main: Use information or disabling utility immediately before the teammate who will act on it."
        }
      ],
      "Controller": [
        {
          "category": "sites",
          "text": "On Abyss, connect A Main to A Site: Block the sightline the team must cross, then keep one tool for the late-round route."
        }
      ],
      "Sentinel": [
        {
          "category": "sites",
          "text": "On Abyss, connect A Site to A Tower: Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
        }
      ]
    },
    "metaComp": {
      "agents": [],
      "composition": "No verified current ranked composition sample",
      "patch": "13.01"
    },
    "metaComps": [],
    "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    "agentInsights": {},
    "lineupLinks": [],
    "source": "https://valorant-api.com/v1/maps/224b0a95-48b9-f703-1bd8-67aca101a61f?language=en-US"
  },
  {
    "id": "ascent",
    "label": "Ascent",
    "inCompetitivePool": true,
    "cardImage": "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
    "layoutImage": "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/displayicon.png",
    "callouts": [
      {
        "label": "A Tree",
        "x": 39.82,
        "y": 29.46
      },
      {
        "label": "A Lobby",
        "x": 60.29,
        "y": 25.9
      },
      {
        "label": "A Main",
        "x": 48.42,
        "y": 20.07
      },
      {
        "label": "A Window",
        "x": 24.12,
        "y": 29.16
      },
      {
        "label": "A Site",
        "x": 35.01,
        "y": 14.25
      },
      {
        "label": "Attacker Side Spawn",
        "x": 81.74,
        "y": 56.9
      },
      {
        "label": "B Lobby",
        "x": 71.66,
        "y": 67.76
      },
      {
        "label": "B Main",
        "x": 40.5,
        "y": 71.21
      },
      {
        "label": "B Boat House",
        "x": 27.05,
        "y": 88.72
      },
      {
        "label": "Mid Bottom",
        "x": 39.73,
        "y": 49.47
      },
      {
        "label": "B Site",
        "x": 28.55,
        "y": 73.73
      },
      {
        "label": "Mid Catwalk",
        "x": 52.5,
        "y": 41.11
      },
      {
        "label": "Mid Cubby",
        "x": 45.48,
        "y": 33.61
      },
      {
        "label": "Defender Side Spawn",
        "x": 13.18,
        "y": 43.36
      },
      {
        "label": "A Garden",
        "x": 28.53,
        "y": 30.91
      },
      {
        "label": "Mid Market",
        "x": 29.85,
        "y": 49.7
      },
      {
        "label": "Mid Courtyard",
        "x": 49.28,
        "y": 48.77
      },
      {
        "label": "Mid Link",
        "x": 51.43,
        "y": 61.75
      },
      {
        "label": "Mid Pizza",
        "x": 30.55,
        "y": 44.71
      },
      {
        "label": "A Rafters",
        "x": 23.92,
        "y": 14.41
      },
      {
        "label": "Mid Top",
        "x": 66.48,
        "y": 38.05
      },
      {
        "label": "A Wine",
        "x": 48.56,
        "y": 5.81
      }
    ],
    "plantSpots": [],
    "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    "weaponSuggestions": [],
    "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
    "macro": {
      "defense": [
        "Ascent's two one-way site doors can be closed to slow a retake route. Once shut, they must be broken before that lane can be used again."
      ],
      "attack": [
        "Mid connects both sites, so controlling it forces defenders to watch Market, Catwalk, and the two Main entrances instead of leaning into one choke."
      ]
    },
    "siteTips": [
      {
        "label": "A Lobby",
        "text": "A Lobby is a verified Riot callout on Ascent. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Main",
        "text": "A Main is a verified Riot callout on Ascent. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      },
      {
        "label": "A Site",
        "text": "A Site is a verified Riot callout on Ascent. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "B Lobby",
        "text": "B Lobby is a verified Riot callout on Ascent. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      }
    ],
    "teamplayTips": [
      {
        "label": "Map structure",
        "text": [
          "Name whether Market or Catwalk is controlled before the site group commits; Mid pressure only helps when both groups move on the same timing."
        ]
      }
    ],
    "roleNotes": {
      "Duelist": [
        {
          "category": "sites",
          "text": "On Ascent, connect A Lobby to A Main: Take first space only after support utility reaches the named defender angle."
        }
      ],
      "Initiator": [
        {
          "category": "sites",
          "text": "On Ascent, connect A Main to A Site: Use information or disabling utility immediately before the teammate who will act on it."
        }
      ],
      "Controller": [
        {
          "category": "sites",
          "text": "On Ascent, connect A Site to B Lobby: Block the sightline the team must cross, then keep one tool for the late-round route."
        }
      ],
      "Sentinel": [
        {
          "category": "sites",
          "text": "On Ascent, connect B Lobby to B Main: Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
        }
      ]
    },
    "metaComp": {
      "agents": [],
      "composition": "No verified current ranked composition sample",
      "patch": "13.01"
    },
    "metaComps": [],
    "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    "agentInsights": {},
    "lineupLinks": [],
    "source": "https://valorant-api.com/v1/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319?language=en-US"
  },
  {
    "id": "corrode",
    "label": "Corrode",
    "inCompetitivePool": false,
    "cardImage": "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/splash.png",
    "layoutImage": "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/displayicon.png",
    "callouts": [
      {
        "label": "A Crane",
        "x": 24.62,
        "y": 18.79
      },
      {
        "label": "A Elbow",
        "x": 38.09,
        "y": 10.92
      },
      {
        "label": "A Link",
        "x": 45.27,
        "y": 37.52
      },
      {
        "label": "A Lobby",
        "x": 70.82,
        "y": 19.67
      },
      {
        "label": "A Main",
        "x": 61.19,
        "y": 8.47
      },
      {
        "label": "A Pocket",
        "x": 47.02,
        "y": 10.92
      },
      {
        "label": "A Site",
        "x": 39.84,
        "y": 25.79
      },
      {
        "label": "Attacker Side Spawn",
        "x": 92.34,
        "y": 50.18
      },
      {
        "label": "A Yard",
        "x": 47.02,
        "y": 19.67
      },
      {
        "label": "B Arch",
        "x": 21.82,
        "y": 72.52
      },
      {
        "label": "B Elbow",
        "x": 32.14,
        "y": 89.14
      },
      {
        "label": "B Link",
        "x": 39.84,
        "y": 59.04
      },
      {
        "label": "B Lobby",
        "x": 72.04,
        "y": 61.67
      },
      {
        "label": "B Main",
        "x": 57.87,
        "y": 69.02
      },
      {
        "label": "Mid Bottom",
        "x": 53.84,
        "y": 49.07
      },
      {
        "label": "B Site",
        "x": 44.39,
        "y": 69.02
      },
      {
        "label": "B Tower",
        "x": 32.14,
        "y": 74.62
      },
      {
        "label": "Defender Side Spawn",
        "x": 12.37,
        "y": 49.94
      },
      {
        "label": "Mid Stairs",
        "x": 42.29,
        "y": 49.07
      },
      {
        "label": "Mid Window",
        "x": 30.92,
        "y": 49.07
      },
      {
        "label": "Mid Top",
        "x": 39.84,
        "y": 49.07
      }
    ],
    "plantSpots": [],
    "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    "weaponSuggestions": [],
    "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
    "macro": {
      "defense": [
        "Corrode mixes long exterior sightlines with tighter interior routes. Defenders need an exit plan before taking an opening fight in either space."
      ],
      "attack": [
        "Use the named interior routes to shorten a long exterior fight, but clear each close corner before treating that route as safe."
      ]
    },
    "siteTips": [
      {
        "label": "A Link",
        "text": "A Link is a verified Riot callout on Corrode. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Lobby",
        "text": "A Lobby is a verified Riot callout on Corrode. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      },
      {
        "label": "A Main",
        "text": "A Main is a verified Riot callout on Corrode. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Site",
        "text": "A Site is a verified Riot callout on Corrode. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      }
    ],
    "teamplayTips": [
      {
        "label": "Map structure",
        "text": [
          "Say whether the next contact is a long lane or a tight room before utility is committed; the correct flash, smoke, and weapon spacing changes with that distance."
        ]
      }
    ],
    "roleNotes": {
      "Duelist": [
        {
          "category": "sites",
          "text": "On Corrode, connect A Link to A Lobby: Take first space only after support utility reaches the named defender angle."
        }
      ],
      "Initiator": [
        {
          "category": "sites",
          "text": "On Corrode, connect A Lobby to A Main: Use information or disabling utility immediately before the teammate who will act on it."
        }
      ],
      "Controller": [
        {
          "category": "sites",
          "text": "On Corrode, connect A Main to A Site: Block the sightline the team must cross, then keep one tool for the late-round route."
        }
      ],
      "Sentinel": [
        {
          "category": "sites",
          "text": "On Corrode, connect A Site to B Link: Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
        }
      ]
    },
    "metaComp": {
      "agents": [],
      "composition": "No verified current ranked composition sample",
      "patch": "13.01"
    },
    "metaComps": [],
    "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    "agentInsights": {},
    "lineupLinks": [],
    "source": "https://valorant-api.com/v1/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115?language=en-US"
  },
  {
    "id": "fracture",
    "label": "Fracture",
    "inCompetitivePool": true,
    "cardImage": "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
    "layoutImage": "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/displayicon.png",
    "callouts": [
      {
        "label": "Attacker Side Bridge",
        "x": 49.8,
        "y": 12.6
      },
      {
        "label": "B Bench",
        "x": 33.1,
        "y": 26.1
      },
      {
        "label": "B Arcade",
        "x": 23.1,
        "y": 36.18
      },
      {
        "label": "B Tower",
        "x": 12.01,
        "y": 44.18
      },
      {
        "label": "B Site",
        "x": 9.35,
        "y": 51.8
      },
      {
        "label": "B Generator",
        "x": 29.33,
        "y": 50.36
      },
      {
        "label": "B Link",
        "x": 34.32,
        "y": 43.84
      },
      {
        "label": "B Canteen",
        "x": 31.22,
        "y": 60.12
      },
      {
        "label": "A Link",
        "x": 65.85,
        "y": 48.68
      },
      {
        "label": "Defender Side Spawn",
        "x": 50.41,
        "y": 44.17
      },
      {
        "label": "B Main",
        "x": 14.02,
        "y": 69.05
      },
      {
        "label": "B Tree",
        "x": 23.64,
        "y": 76.86
      },
      {
        "label": "B Tunnel",
        "x": 24.04,
        "y": 57.85
      },
      {
        "label": "A Hall",
        "x": 71.74,
        "y": 76.09
      },
      {
        "label": "A Door",
        "x": 70.83,
        "y": 70.29
      },
      {
        "label": "A Rope",
        "x": 63.91,
        "y": 63.81
      },
      {
        "label": "A Main",
        "x": 82.61,
        "y": 69.73
      },
      {
        "label": "A Site",
        "x": 82.01,
        "y": 52.21
      },
      {
        "label": "A Drop",
        "x": 77.74,
        "y": 43
      },
      {
        "label": "A Dish",
        "x": 66.55,
        "y": 27.47
      },
      {
        "label": "A Gate",
        "x": 67.9,
        "y": 14.48
      },
      {
        "label": "Attacker Side Spawn",
        "x": 48.3,
        "y": 81.69
      }
    ],
    "plantSpots": [],
    "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    "weaponSuggestions": [],
    "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
    "macro": {
      "defense": [
        "Fracture lets attackers approach each site from opposite sides of the map. Defenders must decide whether to contest those outer lanes or protect the site from the pinch."
      ],
      "attack": [
        "The two attacker spawns make a real two-sided hit possible. Wait for both groups to reach their named lane before either side gives away the execute."
      ]
    },
    "siteTips": [
      {
        "label": "B Tower",
        "text": "B Tower is a verified Riot callout on Fracture. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "B Site",
        "text": "B Site is a verified Riot callout on Fracture. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      },
      {
        "label": "B Link",
        "text": "B Link is a verified Riot callout on Fracture. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Link",
        "text": "A Link is a verified Riot callout on Fracture. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      }
    ],
    "teamplayTips": [
      {
        "label": "Map structure",
        "text": [
          "Call which side of the site each group owns. A split attack loses its advantage when both groups clear the same defender angle."
        ]
      }
    ],
    "roleNotes": {
      "Duelist": [
        {
          "category": "sites",
          "text": "On Fracture, connect B Tower to B Site: Take first space only after support utility reaches the named defender angle."
        }
      ],
      "Initiator": [
        {
          "category": "sites",
          "text": "On Fracture, connect B Site to B Link: Use information or disabling utility immediately before the teammate who will act on it."
        }
      ],
      "Controller": [
        {
          "category": "sites",
          "text": "On Fracture, connect B Link to A Link: Block the sightline the team must cross, then keep one tool for the late-round route."
        }
      ],
      "Sentinel": [
        {
          "category": "sites",
          "text": "On Fracture, connect A Link to B Main: Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
        }
      ]
    },
    "metaComp": {
      "agents": [],
      "composition": "No verified current ranked composition sample",
      "patch": "13.01"
    },
    "metaComps": [],
    "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    "agentInsights": {},
    "lineupLinks": [],
    "source": "https://valorant-api.com/v1/maps/b529448b-4d60-346e-e89e-00a4c527a405?language=en-US"
  },
  {
    "id": "haven",
    "label": "Haven",
    "inCompetitivePool": true,
    "cardImage": "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
    "layoutImage": "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/displayicon.png",
    "callouts": [
      {
        "label": "A Garden",
        "x": 74.22,
        "y": 41.02
      },
      {
        "label": "A Link",
        "x": 28.98,
        "y": 32.44
      },
      {
        "label": "A Lobby",
        "x": 62.39,
        "y": 38.48
      },
      {
        "label": "A Long",
        "x": 57.59,
        "y": 17.7
      },
      {
        "label": "A Sewer",
        "x": 49.98,
        "y": 38.38
      },
      {
        "label": "A Site",
        "x": 40.15,
        "y": 16.95
      },
      {
        "label": "Attacker Side Spawn",
        "x": 89.52,
        "y": 51.21
      },
      {
        "label": "B Back",
        "x": 29.36,
        "y": 49.53
      },
      {
        "label": "B Site",
        "x": 40.11,
        "y": 50.14
      },
      {
        "label": "C Link",
        "x": 34.31,
        "y": 64.93
      },
      {
        "label": "C Lobby",
        "x": 66.44,
        "y": 76.59
      },
      {
        "label": "C Long",
        "x": 64.41,
        "y": 89.45
      },
      {
        "label": "C Garage",
        "x": 49.35,
        "y": 62.92
      },
      {
        "label": "C Window",
        "x": 41.9,
        "y": 64.35
      },
      {
        "label": "C Site",
        "x": 41.77,
        "y": 82.11
      },
      {
        "label": "C Cubby",
        "x": 60.13,
        "y": 80.17
      },
      {
        "label": "Defender Side Spawn",
        "x": 13.98,
        "y": 42.18
      },
      {
        "label": "Mid Doors",
        "x": 62.37,
        "y": 63.14
      },
      {
        "label": "Mid Courtyard",
        "x": 59,
        "y": 50.61
      },
      {
        "label": "Mid Window",
        "x": 67.59,
        "y": 49.65
      },
      {
        "label": "A Tower",
        "x": 30.8,
        "y": 13.86
      }
    ],
    "plantSpots": [],
    "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    "weaponSuggestions": [],
    "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
    "macro": {
      "defense": [
        "Haven has three spike sites, so defenders cannot stack every entrance. Early information matters because a late rotation has farther to travel."
      ],
      "attack": [
        "Use the third site to stretch defender resources. Pressure one entrance, keep control of the connecting lanes, and change direction before the defense settles."
      ]
    },
    "siteTips": [
      {
        "label": "A Link",
        "text": "A Link is a verified Riot callout on Haven. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Lobby",
        "text": "A Lobby is a verified Riot callout on Haven. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      },
      {
        "label": "A Site",
        "text": "A Site is a verified Riot callout on Haven. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "B Site",
        "text": "B Site is a verified Riot callout on Haven. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      }
    ],
    "teamplayTips": [
      {
        "label": "Map structure",
        "text": [
          "Keep one player connected to Mid or Garage while the site group works. That player protects the rotation and prevents defenders from moving freely between three sites."
        ]
      }
    ],
    "roleNotes": {
      "Duelist": [
        {
          "category": "sites",
          "text": "On Haven, connect A Link to A Lobby: Take first space only after support utility reaches the named defender angle."
        }
      ],
      "Initiator": [
        {
          "category": "sites",
          "text": "On Haven, connect A Lobby to A Site: Use information or disabling utility immediately before the teammate who will act on it."
        }
      ],
      "Controller": [
        {
          "category": "sites",
          "text": "On Haven, connect A Site to B Site: Block the sightline the team must cross, then keep one tool for the late-round route."
        }
      ],
      "Sentinel": [
        {
          "category": "sites",
          "text": "On Haven, connect B Site to C Link: Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
        }
      ]
    },
    "metaComp": {
      "agents": [],
      "composition": "No verified current ranked composition sample",
      "patch": "13.01"
    },
    "metaComps": [],
    "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    "agentInsights": {},
    "lineupLinks": [],
    "source": "https://valorant-api.com/v1/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047?language=en-US"
  },
  {
    "id": "lotus",
    "label": "Lotus",
    "inCompetitivePool": true,
    "cardImage": "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
    "layoutImage": "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/displayicon.png",
    "callouts": [
      {
        "label": "A Top",
        "x": 81.81,
        "y": 25.1
      },
      {
        "label": "A Drop",
        "x": 89.35,
        "y": 23.26
      },
      {
        "label": "A Site",
        "x": 85.49,
        "y": 36.08
      },
      {
        "label": "A Hut",
        "x": 85.49,
        "y": 34.77
      },
      {
        "label": "A Tree",
        "x": 85.49,
        "y": 47.5
      },
      {
        "label": "A Door",
        "x": 82.95,
        "y": 51.39
      },
      {
        "label": "A Main",
        "x": 75.43,
        "y": 53.7
      },
      {
        "label": "A Rubble",
        "x": 80.89,
        "y": 60.09
      },
      {
        "label": "A Root",
        "x": 69.2,
        "y": 60.09
      },
      {
        "label": "A Lobby",
        "x": 66.55,
        "y": 72.44
      },
      {
        "label": "C Lobby",
        "x": 34.13,
        "y": 81.67
      },
      {
        "label": "B Pillars",
        "x": 50.29,
        "y": 66.1
      },
      {
        "label": "B Main",
        "x": 45.13,
        "y": 56.66
      },
      {
        "label": "C Door",
        "x": 32.86,
        "y": 57.08
      },
      {
        "label": "B Site",
        "x": 50.29,
        "y": 45.93
      },
      {
        "label": "A Link",
        "x": 60.51,
        "y": 48.5
      },
      {
        "label": "B Upper",
        "x": 56.4,
        "y": 36.46
      },
      {
        "label": "C Waterfall",
        "x": 31.12,
        "y": 43.39
      },
      {
        "label": "C Link",
        "x": 35.56,
        "y": 37.75
      },
      {
        "label": "A Stairs",
        "x": 73.28,
        "y": 32.32
      },
      {
        "label": "C Mound",
        "x": 34.13,
        "y": 63.96
      },
      {
        "label": "C Main",
        "x": 22.81,
        "y": 53.53
      },
      {
        "label": "C Bend",
        "x": 7.45,
        "y": 51.04
      },
      {
        "label": "C Site",
        "x": 14.76,
        "y": 43.7
      },
      {
        "label": "C Hall",
        "x": 14.76,
        "y": 34.88
      },
      {
        "label": "C Gravel",
        "x": 32.86,
        "y": 27.43
      },
      {
        "label": "Defender Side Spawn",
        "x": 57.7,
        "y": 22.03
      },
      {
        "label": "Attacker Side Spawn",
        "x": 51.08,
        "y": 81.69
      }
    ],
    "plantSpots": [],
    "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    "weaponSuggestions": [],
    "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
    "macro": {
      "defense": [
        "Lotus has three sites plus rotating doors and a breakable wall. Those mechanics change which rotation lanes are open during the round."
      ],
      "attack": [
        "Secure the door or wall route before changing sites. Opening a route without a player ready to use it gives defenders the same shortcut."
      ]
    },
    "siteTips": [
      {
        "label": "A Site",
        "text": "A Site is a verified Riot callout on Lotus. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Door",
        "text": "A Door is a verified Riot callout on Lotus. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      },
      {
        "label": "A Main",
        "text": "A Main is a verified Riot callout on Lotus. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "A Lobby",
        "text": "A Lobby is a verified Riot callout on Lotus. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      }
    ],
    "teamplayTips": [
      {
        "label": "Map structure",
        "text": [
          "Call every rotating-door activation and breakable-wall change. The sound announces the route to both teams, so the next player must already know the plan."
        ]
      }
    ],
    "roleNotes": {
      "Duelist": [
        {
          "category": "sites",
          "text": "On Lotus, connect A Site to A Door: Take first space only after support utility reaches the named defender angle."
        }
      ],
      "Initiator": [
        {
          "category": "sites",
          "text": "On Lotus, connect A Door to A Main: Use information or disabling utility immediately before the teammate who will act on it."
        }
      ],
      "Controller": [
        {
          "category": "sites",
          "text": "On Lotus, connect A Main to A Lobby: Block the sightline the team must cross, then keep one tool for the late-round route."
        }
      ],
      "Sentinel": [
        {
          "category": "sites",
          "text": "On Lotus, connect A Lobby to C Lobby: Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
        }
      ]
    },
    "metaComp": {
      "agents": [],
      "composition": "No verified current ranked composition sample",
      "patch": "13.01"
    },
    "metaComps": [],
    "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    "agentInsights": {},
    "lineupLinks": [],
    "source": "https://valorant-api.com/v1/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9?language=en-US"
  },
  {
    "id": "pearl",
    "label": "Pearl",
    "inCompetitivePool": true,
    "cardImage": "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
    "layoutImage": "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/displayicon.png",
    "callouts": [
      {
        "label": "B Hall",
        "x": 9.4,
        "y": 33.14
      },
      {
        "label": "Mid Doors",
        "x": 52.71,
        "y": 54.93
      },
      {
        "label": "Mid Connector",
        "x": 62.09,
        "y": 44.43
      },
      {
        "label": "Defender Side Water",
        "x": 62.09,
        "y": 30.7
      },
      {
        "label": "Defender Side Spawn",
        "x": 51,
        "y": 5.08
      },
      {
        "label": "A Flowers",
        "x": 67.6,
        "y": 19.34
      },
      {
        "label": "A Secret",
        "x": 77.93,
        "y": 10.03
      },
      {
        "label": "A Dugout",
        "x": 93.71,
        "y": 31.85
      },
      {
        "label": "A Site",
        "x": 91.49,
        "y": 40.01
      },
      {
        "label": "Defender Side Records",
        "x": 36.58,
        "y": 21.61
      },
      {
        "label": "Mid Top",
        "x": 53.7,
        "y": 75.42
      },
      {
        "label": "B Tunnel",
        "x": 31.24,
        "y": 21.61
      },
      {
        "label": "B Tower",
        "x": 25.81,
        "y": 25.04
      },
      {
        "label": "A Main",
        "x": 77.88,
        "y": 41.93
      },
      {
        "label": "A Restaurant",
        "x": 69.99,
        "y": 57.04
      },
      {
        "label": "B Link",
        "x": 43.43,
        "y": 56.48
      },
      {
        "label": "A Art",
        "x": 74.62,
        "y": 56.02
      },
      {
        "label": "A Link",
        "x": 77.55,
        "y": 44.37
      },
      {
        "label": "Mid Plaza",
        "x": 45.51,
        "y": 70.15
      },
      {
        "label": "Mid Shops",
        "x": 36.74,
        "y": 85.36
      },
      {
        "label": "B Club",
        "x": 36.74,
        "y": 85.36
      },
      {
        "label": "B Ramp",
        "x": 18.41,
        "y": 77.95
      },
      {
        "label": "B Main",
        "x": 13.92,
        "y": 60.01
      },
      {
        "label": "B Site",
        "x": 25.82,
        "y": 46.36
      },
      {
        "label": "B Screen",
        "x": 9.04,
        "y": 42.77
      },
      {
        "label": "Attacker Side Spawn",
        "x": 43.37,
        "y": 95.89
      }
    ],
    "plantSpots": [],
    "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
    "weaponSuggestions": [],
    "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
    "macro": {
      "defense": [
        "Pearl is a two-site map without teleporters, rotating doors, or other route-changing mechanics. Lane control and rotation timing decide how much ground defenders can keep."
      ],
      "attack": [
        "Mid connects several direct routes into both sites. Hold the central lane long enough that defenders cannot rotate through it for free."
      ]
    },
    "siteTips": [
      {
        "label": "Mid Doors",
        "text": "Mid Doors is a verified Riot callout on Pearl. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "Mid Connector",
        "text": "Mid Connector is a verified Riot callout on Pearl. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      },
      {
        "label": "A Site",
        "text": "A Site is a verified Riot callout on Pearl. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Duelist",
          "Initiator"
        ]
      },
      {
        "label": "Mid Top",
        "text": "Mid Top is a verified Riot callout on Pearl. Clear or control this named space before reporting that the connected route is safe.",
        "roles": [
          "Controller",
          "Sentinel"
        ]
      }
    ],
    "teamplayTips": [
      {
        "label": "Map structure",
        "text": [
          "Name the exact Mid branch the team controls before a site finish. Pearl rewards clear lane ownership more than a late, unannounced route change."
        ]
      }
    ],
    "roleNotes": {
      "Duelist": [
        {
          "category": "sites",
          "text": "On Pearl, connect Mid Doors to Mid Connector: Take first space only after support utility reaches the named defender angle."
        }
      ],
      "Initiator": [
        {
          "category": "sites",
          "text": "On Pearl, connect Mid Connector to A Site: Use information or disabling utility immediately before the teammate who will act on it."
        }
      ],
      "Controller": [
        {
          "category": "sites",
          "text": "On Pearl, connect A Site to Mid Top: Block the sightline the team must cross, then keep one tool for the late-round route."
        }
      ],
      "Sentinel": [
        {
          "category": "sites",
          "text": "On Pearl, connect Mid Top to B Tower: Protect the route that would reach teammates from behind and survive long enough for that warning to matter."
        }
      ]
    },
    "metaComp": {
      "agents": [],
      "composition": "No verified current ranked composition sample",
      "patch": "13.01"
    },
    "metaComps": [],
    "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
    "agentInsights": {},
    "lineupLinks": [],
    "source": "https://valorant-api.com/v1/maps/fd267378-4d1d-484f-ff52-77821ed10dc2?language=en-US"
  }
];
  const baseReference = globalThis.RankedCoachGamesenseReference || { agents: [], weapons: [], warmupDetails: {} };
  const baseMaps = globalThis.RankedCoachGamesenseMaps || [];
  const agentsById = new Map([...baseReference.agents, ...GENERATED_AGENTS].map(agent => [agent.id, agent]));
  const mapsById = new Map([...baseMaps, ...GENERATED_MAPS].map(map => [map.id, map]));
  globalThis.RankedCoachGamesenseReference = Object.freeze({ ...baseReference, agents: Object.freeze([...agentsById.values()]) });
  globalThis.RankedCoachGamesenseMaps = Object.freeze([...mapsById.values()]);
})();
