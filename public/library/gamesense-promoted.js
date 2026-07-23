// Generated only by scripts/promote-library-drafts.mjs.
// Canonical fields auto-promote; synthesized fields require approval and three logged sources.
(function () {
  "use strict";
  const PROMOTED = {
  "agents": [
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
          "slot": "Passive - Passive",
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
      "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US",
      "uuid": "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US",
      "uuid": "5f8d3a7f-467b-97f3-062c-13acf203c006",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "E - Signature",
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
      "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US",
      "uuid": "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
          "slot": "C - Basic",
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
      "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US",
      "uuid": "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "E - Signature",
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
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/abilities/ability2/displayicon.png",
          "summary": "EQUIP a view of the battlefield. FIRE to set the locations where Clove’s clouds will settle. ALT FIRE to confirm, launching clouds that block vision in the chosen areas. Clove can use this ability after death.",
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
          "slot": "C - Basic",
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
      "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US",
      "uuid": "1dbf2edd-4729-0984-3115-daa5eed44993",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "cypher",
      "label": "Cypher",
      "role": "Sentinel",
      "maps": [
        "Split",
        "Sunset",
        "Haven"
      ],
      "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/fullportrait.png",
      "fundamentals": [
        "Trapwire is strongest when your position can punish the slow and reveal. Build the crossfire first, then choose a wire attackers cannot clear safely.",
        "Cyber Cage breaks vision and announces a crossing, so pair its audio cue with a swing or use it to leave before the trade arrives.",
        "Spycam keeps value while Cypher stays alive. Change camera and wire height between gun rounds so one learned clear does not solve the whole setup."
      ],
      "patchHistory": [
        {
          "patch": "11.08",
          "note": "Trapwire windup fell to 0.9 seconds, stopped concussing, and instead applied a 50% slow plus a one-second reveal; Spycam gained clearer proximity audio and stealth rules.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
        },
        {
          "patch": "13.00",
          "note": "Trapwire windup was reduced again, from 0.9 to 0.7 seconds, improving Cypher's anchor conversion window.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-00/"
        }
      ],
      "abilities": [
        {
          "id": "cyber-cage",
          "name": "Cyber Cage",
          "slot": "C - Basic",
          "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/ability1/displayicon.png",
          "summary": "INSTANTLY toss the cyber cage in front of Cypher. ACTIVATE to create a zone that blocks vision and plays an audio cue when enemies pass through it.",
          "stats": {
            "Cost": "100 credits each",
            "Charges": "2",
            "Duration": "About 7 seconds",
            "Damage": "None"
          },
          "purpose": "Break vision, isolate a choke, or trigger a swing from the crossing audio.",
          "setup": "One-way cages are possible on many ledges and are strong when the exposed feet line is consistent. Test the height from both sides.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/54a8dfaa9b82c7aaf994b0432bb25ef1e95c985c.mp4?accountingTag=VAL",
            "title": "Cypher Cyber Cage ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b?language=en-US"
        },
        {
          "id": "spycam",
          "name": "Spycam",
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/ability2/displayicon.png",
          "summary": "EQUIP a spycam. FIRE to place the spycam at the targeted location. RE-USE this ability to take control of the camera's view. While in control of the camera, FIRE to shoot a marking dart. This dart will Reveal the location of any player struck by the dart. This ability can be picked up to be REDEPLOYED.",
          "stats": {
            "Cost": "Free",
            "Charges": "1",
            "Recharge": "Cooldown if destroyed",
            "Damage": "None"
          },
          "purpose": "Confirm an execute, watch a rotation, and force an enemy to turn away from the gunfight.",
          "setup": "Use a view that answers one question clearly. A hidden camera pointed at empty geometry is not information.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/825ba0643c74ad583350d1eb562bb7650ad78ae0.mp4?accountingTag=VAL",
            "title": "Cypher Spycam ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b?language=en-US"
        },
        {
          "id": "trapwire",
          "name": "Trapwire",
          "slot": "E - Signature",
          "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/grenade/displayicon.png",
          "summary": "EQUIP a trapwire. FIRE to place a destructible and covert trapwire at the targeted location, creating a line that spans between the placed location and the wall opposite. Enemy players who cross a trapwire will be Slowed and Revealed after a short period if they do not destroy the device in time. This ability can be picked up to be REDEPLOYED.",
          "stats": {
            "Cost": "200 credits each",
            "Charges": "2",
            "Windup": "0.9 seconds on PC",
            "Damage": "No meaningful direct damage"
          },
          "purpose": "Protect a flank, delay an entry, and create a guaranteed wallbang or swing timing.",
          "setup": "Change height and anchor position. A trip has little value if attackers can clear it without exposing themselves.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/aab21b75eb43f0e8cc9c0b816cb4877ae868b9fd.mp4?accountingTag=VAL",
            "title": "Cypher Trapwire ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b?language=en-US"
        },
        {
          "id": "neural-theft",
          "name": "Neural Theft",
          "slot": "X - Ultimate",
          "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/abilities/ultimate/displayicon.png",
          "summary": "INSTANTLY use on a targeted dead enemy to download information on their team.  After a brief delay, the location of all living enemy players will be Revealed twice.",
          "stats": {
            "Cost": "7 ultimate points",
            "Pulses": "2 reveals",
            "Damage": "None",
            "Requirement": "Recent enemy corpse"
          },
          "purpose": "Call rotations, isolate lurkers, and time a swing between reveal pulses.",
          "setup": "Say which enemy position changes the plan. The second reveal can punish players who immediately reposition after the first.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ddeaad5ff2e4865351755b71fdc4fc97339fb334.mp4?accountingTag=VAL",
            "title": "Cypher Neural Theft ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b?language=en-US"
        }
      ],
      "pickRate": 3.4,
      "pickRateRank": 11,
      "sampleLabel": "Tracker Network | Past two weeks",
      "mapPickRates": {
        "Split": 4.9,
        "Sunset": 4.5,
        "Haven": 3.8
      },
      "mapWinRates": {
        "Split": 50.2,
        "Sunset": 50.1,
        "Haven": 50.6
      },
      "lore": [
        {
          "label": "Origin",
          "value": "Morocco",
          "note": "Cypher is a Moroccan information broker who watches the battlefield through an extensive surveillance network."
        },
        {
          "label": "Lore",
          "value": "Keeper of secrets",
          "note": "He tracks movement, protects hidden information, and treats every enemy habit as another secret waiting to be uncovered."
        }
      ],
      "uuid": "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
      "source": "https://valorant-api.com/v1/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "E - Signature",
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
          "slot": "Q - Basic",
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
      "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US",
      "uuid": "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US",
      "uuid": "dade69b4-4f5a-8528-247b-219e5a1facd6",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
          "summary": "EQUIP Thrash. FIRE to link with Thrash’s mind and steer her through enemy territory. ACTIVATE to lunge forward and explode, Detaining any players in a small radius. When Thrash expires she reverts into a dormant globule. INTERACT to reclaim the globule and gain another Thrash charge after a short cooldown. Thrash can be reclaimed once.",
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
      "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US",
      "uuid": "e370fa57-4757-3604-3648-499e1f642d3f",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "E - Signature",
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
          "slot": "Q - Basic",
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
      "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US",
      "uuid": "95b78ed7-4637-86d9-7e41-71ba8c293152",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US",
      "uuid": "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "jett",
      "label": "Jett",
      "role": "Duelist",
      "maps": [
        "Breeze",
        "Ascent",
        "Haven"
      ],
      "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png",
      "fundamentals": [
        "Tailwind makes Jett one of the safest Operator holders: take a one-and-done angle, then dash back beside cover after the shot.",
        "Cloudburst is a short crossing tool. Pair it with Tailwind to break one sightline, then clear the next fight instead of treating it like a full controller smoke.",
        "Updraft and Blade Storm stay accurate while moving, so use elevation to change the defender's crosshair height only when you know where you can land."
      ],
      "patchHistory": [
        {
          "patch": "4.08",
          "note": "Tailwind changed to a primed dash: after a 0.75-second delay, Jett received a 12-second window to use it.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-4-08/"
        },
        {
          "patch": "7.04",
          "note": "Tailwind's window fell to 7.5 seconds with a 1-second windup; Cloudburst fell to 2.5 seconds, Updraft to one charge, and Blade Storm rose to 8 points.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-7-04/"
        }
      ],
      "abilities": [
        {
          "id": "updraft",
          "name": "Updraft",
          "slot": "C - Basic",
          "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ability1/displayicon.png",
          "summary": "INSTANTLY propel Jett high into the air.",
          "stats": {
            "Cost": "150 credits",
            "Charges": "1",
            "Recharge": "No",
            "Damage": "None"
          },
          "purpose": "Reach unexpected elevation, clear vertical utility, or combine with Blade Storm.",
          "setup": "Use it with a clear landing plan. The weapon re-equip delay makes unsupported airtime punishable.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4cbc968f05713579aae9464c5a16dc3f6863f943.mp4?accountingTag=VAL",
            "title": "Jett Updraft ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=en-US"
        },
        {
          "id": "tailwind",
          "name": "Tailwind",
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ability2/displayicon.png",
          "summary": "ACTIVATE to prepare a gust of wind for a limited time. RE-USE the wind to propel Jett in the direction she is moving. If Jett is standing still, she propels forward. Tailwind charge resets every two kills.",
          "stats": {
            "Cost": "Free",
            "Charges": "1",
            "Recharge": "After 2 kills",
            "Damage": "None"
          },
          "purpose": "Create entry space or escape after an Operator shot or opening duel.",
          "setup": "Use the dash with a clear destination. It should end behind cover or inside a planned Cloudburst.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ec6b3cf1f8ac09d597b0193de1d7bb81335b40e4.mp4?accountingTag=VAL",
            "title": "Jett Tailwind ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=en-US"
        },
        {
          "id": "cloudburst",
          "name": "Cloudburst",
          "slot": "E - Signature",
          "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/grenade/displayicon.png",
          "summary": "INSTANTLY throw a projectile that expands into a brief vision-blocking cloud on impact with a surface. HOLD the ability key to curve the smoke in the direction of your crosshair.",
          "stats": {
            "Cost": "200 credits",
            "Charges": "2",
            "Duration": "2.5 seconds",
            "Damage": "None"
          },
          "purpose": "Break one sightline long enough to dash, cross, isolate, or retrieve the spike.",
          "setup": "Small one-ways are possible, but the short duration makes them a momentary duel tool rather than controller coverage.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/3353597819f0c032d56ff947d9762368b4ee6c6b.mp4?accountingTag=VAL",
            "title": "Jett Cloudburst ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=en-US"
        },
        {
          "id": "blade-storm",
          "name": "Blade Storm",
          "slot": "X - Ultimate",
          "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/ultimate/displayicon.png",
          "summary": "EQUIP a set of highly accurate throwing knives. FIRE to throw a single knife and recharge knives on a kill. ALT FIRE to throw all remaining daggers but does not recharge on a kill.",
          "stats": {
            "Cost": "8 ultimate points",
            "Ammo": "5 knives",
            "Damage": "50 body / 150 head",
            "Falloff": "No single-fire falloff"
          },
          "purpose": "Preserve economy, fight accurately while moving, and pair vertical movement with a weapon that stays precise.",
          "setup": "Single-fire for reliable resets. Alternate fire is a close-range commitment and does not restore knives on a kill.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/667770571300e065b332617e5c8f2e009ed88928.mp4?accountingTag=VAL",
            "title": "Jett Blade Storm ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=en-US"
        },
        {
          "id": "drift",
          "name": "Drift",
          "slot": "Passive - Passive",
          "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/abilities/passive/displayicon.png",
          "summary": "Holding the jump button while falling allows you to glide through the air.",
          "source": "https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=en-US"
        }
      ],
      "pickRate": 10.3,
      "pickRateRank": 1,
      "sampleLabel": "Tracker Network | Past two weeks",
      "mapPickRates": {
        "Breeze": 11.7,
        "Ascent": 11.3,
        "Haven": 11.3
      },
      "mapWinRates": {
        "Breeze": 50.4,
        "Ascent": 49.9,
        "Haven": 50
      },
      "lore": [
        {
          "label": "Origin",
          "value": "South Korea",
          "note": "Jett represents her home country with an agile, evasive fighting style built around speed and calculated risk."
        },
        {
          "label": "Lore",
          "value": "Wind-driven duelist",
          "note": "Her supernatural command of wind lets her move through fights in ways few opponents can track, favoring precision over brute force."
        }
      ],
      "uuid": "add6443a-41bd-e414-f6ad-e58d267f4e95",
      "source": "https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
      "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US",
      "uuid": "601dbbe7-43ce-be57-2a40-4abd24953621",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US",
      "uuid": "1e58de9c-4950-5125-93e9-a0aee9f98746",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "E - Signature",
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
          "slot": "Q - Basic",
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
          "slot": "C - Basic",
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
      "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US",
      "uuid": "7c8a4701-4de6-9355-b254-e09bc2a34b72",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/abilities/ability2/displayicon.png",
          "summary": "INSTANTLY channel Neon’s power for Increased Speed. When charged, ALT FIRE to trigger an electric slide dash. Slide charge resets every two kills.",
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
          "slot": "C - Basic",
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
          "slot": "E - Signature",
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
          "summary": "Unleash Neon’s full power and speed for a short duration, regaining all her fuel and a slide charge. FIRE to channel the power into a deadly lightning beam with high movement accuracy. Kills reset the duration of the effect. ",
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
      "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US",
      "uuid": "bb2a4828-46eb-8cd1-e765-15848195d751",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "omen",
      "label": "Omen",
      "role": "Controller",
      "maps": [
        "Haven",
        "Ascent",
        "Lotus"
      ],
      "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/fullportrait.png",
      "fundamentals": [
        "Dark Cover recharges, so survive the opening long enough to reshape the late round. Place each smoke against a named defender angle the team is ready to cross.",
        "Paranoia phases through terrain and objects and can hit teammates, which makes its path a team timing tool: call the lane, cast beside the entry, then swing with them.",
        "Shrouded Step and From the Shadows create doubt before they create kills. Teleport when sound, smoke, or pressure gives the enemy more than one landing to respect."
      ],
      "patchHistory": [
        {
          "patch": "4.04",
          "note": "Dark Cover cooldown fell from 40 to 30 seconds and projectile speed rose from 2800 to 6400; Shrouded Step became cheaper and faster to complete.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-4-04/"
        },
        {
          "patch": "13.00",
          "note": "Enemy-facing Shrouded Step audio was updated to make nearby teleports easier to parse during chaotic fights.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-00/"
        }
      ],
      "abilities": [
        {
          "id": "paranoia",
          "name": "Paranoia",
          "slot": "C - Basic",
          "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ability1/displayicon.png",
          "summary": "EQUIP a blinding orb.  FIRE to throw it forward, briefly Nearsighting and Deafening all players it touches. This projectile can pass straight through walls.",
          "stats": {
            "Cost": "250 credits",
            "Charges": "1",
            "Debuff": "About 2 seconds",
            "Damage": "None"
          },
          "purpose": "Start a coordinated swing through a narrow lane or disable a defender holding behind cover.",
          "setup": "Call the path before casting. It can hit teammates, so align the projectile beside their approach rather than through them.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f401fc788f3182b6d5aa25af6056c842117b1b36.mp4?accountingTag=VAL",
            "title": "Omen Paranoia ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/8e253930-4c05-31dd-1b6c-968525494517?language=en-US"
        },
        {
          "id": "dark-cover",
          "name": "Dark Cover",
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ability2/displayicon.png",
          "summary": "EQUIP a shadow orb, entering a phased world to place and target the orbs. PRESS the ability key to throw the shadow orb to the marked location, creating a long-lasting shadow sphere that blocks vision. HOLD FIRE while targeting to move the marker further away. HOLD ALT FIRE while targeting to move the marker closer. PRESS RELOAD to toggle normal targeting view.",
          "stats": {
            "Cost": "1 free; extra charge 150",
            "Charges": "2",
            "Duration": "15 seconds",
            "Recharge": "Cooldown"
          },
          "purpose": "Remove named angles, sell pressure across the map, and preserve a smoke for the late round.",
          "setup": "One-ways are possible on ledges and boxes, but require consistent placement. A complete execute smoke matters more than a fragile trick setup.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ba0b035a5ff2bb8d9487ba461b3d15900ff50f6b.mp4?accountingTag=VAL",
            "title": "Omen Dark Cover ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/8e253930-4c05-31dd-1b6c-968525494517?language=en-US"
        },
        {
          "id": "shrouded-step",
          "name": "Shrouded Step",
          "slot": "E - Signature",
          "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/grenade/displayicon.png",
          "summary": "EQUIP a shrouded step ability and see its range indicator. FIRE to begin a brief channel, then teleport to the marked location.",
          "stats": {
            "Cost": "100 credits",
            "Charges": "2",
            "Recharge": "No",
            "Damage": "None"
          },
          "purpose": "Reach elevation, escape utility, cross a watched gap, or reposition after making noise elsewhere.",
          "setup": "Hide the channel sound or force the enemy to watch multiple landing points. Unsupported open-ground teleports are a gamble.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/33550fee410c5a55ea8832f41827a12aaddb686f.mp4?accountingTag=VAL",
            "title": "Omen Shrouded Step ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/8e253930-4c05-31dd-1b6c-968525494517?language=en-US"
        },
        {
          "id": "from-the-shadows",
          "name": "From the Shadows",
          "slot": "X - Ultimate",
          "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/abilities/ultimate/displayicon.png",
          "summary": "EQUIP a tactical map. FIRE to begin teleporting to the selected location. While teleporting, Omen will appear as a Shade that can be destroyed by an enemy to cancel his teleport, or PRESS EQUIP for Omen to cancel his teleport.",
          "stats": {
            "Cost": "7 ultimate points",
            "Range": "Map-wide",
            "Damage": "None",
            "Recharge": "No"
          },
          "purpose": "Recover the spike, force defenders to turn, sell a fake, or convert information into a fast rotation.",
          "setup": "Choose a landing with cover and a reason. A cancel can still create value if it forces the enemy to abandon position.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/252cf8ad86b6aca6210ba93ea856f52708476eba.mp4?accountingTag=VAL",
            "title": "Omen From the Shadows ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/8e253930-4c05-31dd-1b6c-968525494517?language=en-US"
        }
      ],
      "pickRate": 4.9,
      "pickRateRank": 7,
      "sampleLabel": "Tracker Network | Past two weeks",
      "mapPickRates": {
        "Haven": 5.6,
        "Ascent": 5.3,
        "Lotus": 5.2
      },
      "mapWinRates": {
        "Haven": 47.6,
        "Ascent": 47.6,
        "Lotus": 47.5
      },
      "lore": [
        {
          "label": "Origin",
          "value": "Unknown",
          "note": "Omen is a phantom of memory whose fragmented identity remains one of the Protocol's deepest mysteries."
        },
        {
          "label": "Lore",
          "value": "Shadow-born hunter",
          "note": "He moves through darkness, blinds the opposition, and lets uncertainty spread before striking from an unexpected angle."
        }
      ],
      "uuid": "8e253930-4c05-31dd-1b6c-968525494517",
      "source": "https://valorant-api.com/v1/agents/8e253930-4c05-31dd-1b6c-968525494517?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "E - Signature",
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "Passive - Passive",
          "icon": "",
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
      "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US",
      "uuid": "eb93336a-449b-9c1b-0a54-a891f7921d69",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "raze",
      "label": "Raze",
      "role": "Duelist",
      "maps": [
        "Lotus",
        "Split",
        "Sunset"
      ],
      "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/fullportrait.png",
      "fundamentals": [
        "Boom Bot and Paint Shells clear the close positions that stop your entry. Send the clear first, then move while the defender is displaced.",
        "Blast Pack creates fast space, but the landing still needs cover or teammate pressure. Use the second pack to finish the route or escape the trade.",
        "Showstopper is strongest after utility or contact narrows the defender's exits. Fire at the space they must cross instead of guessing at a hidden player."
      ],
      "patchHistory": [
        {
          "patch": "12.02",
          "note": "Boom Bot can now be concussed.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-02/"
        },
        {
          "patch": "11.08",
          "note": "Slows now reduce Blast Pack movement while Raze is airborne.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
        }
      ],
      "abilities": [
        {
          "id": "blast-pack",
          "name": "Blast Pack",
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
          "label": "Origin",
          "value": "Brazil",
          "note": "Raze brings a bold personality and a large collection of explosives from Brazil into every operation."
        },
        {
          "label": "Lore",
          "value": "Explosive space maker",
          "note": "Her aggressive tools excel at clearing tight positions and dislodging opponents who rely on entrenched cover."
        }
      ],
      "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US",
      "pickRate": 4,
      "pickRateRank": 10,
      "sampleLabel": "Tracker Network | Past two weeks",
      "mapPickRates": {
        "Lotus": 6.5,
        "Split": 5.9,
        "Sunset": 4.4
      },
      "mapWinRates": {
        "Lotus": 50.6,
        "Split": 50.7,
        "Sunset": 50.3
      },
      "uuid": "f94c3b30-42be-e959-889c-5aa313dba261",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US",
      "uuid": "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "sage",
      "label": "Sage",
      "role": "Sentinel",
      "maps": [
        "Split",
        "Sunset",
        "Haven"
      ],
      "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png",
      "fundamentals": [
        "Barrier Orb changes the map, not just the timer. Place it to secure a plant, split a retake, or create an elevation the opponent must clear deliberately.",
        "Slow Orb is a timing tool: land it where attackers still need to cross, then let teammate damage or a coordinated peek punish the reduced movement.",
        "Healing Orb and Resurrection gain value when Sage survives. Play one layer behind first contact and clear the recovery route before committing to a revive."
      ],
      "patchHistory": [
        {
          "patch": "11.08",
          "note": "Barrier Orb cost fell from 400 to 300 and fortified after 2 seconds, while fortified segment health fell from 800 to 600.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
        },
        {
          "patch": "13.00",
          "note": "Healing Orb's self-heal-over-time increased from 50 to 100, restoring more of Sage's personal sustain.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-00/"
        }
      ],
      "abilities": [
        {
          "id": "slow-orb",
          "name": "Slow Orb",
          "slot": "C - Basic",
          "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ability1/displayicon.png",
          "summary": "EQUIP a slowing orb. FIRE to throw a slowing orb forward that detonates upon landing, creating a lingering field that Slows and reduces the dash speed of players caught inside of it.",
          "stats": {
            "Cost": "200 credits each",
            "Charges": "2",
            "Duration": "7 seconds",
            "Damage": "None"
          },
          "purpose": "Hold attackers in damage utility, stop a fast hit, and make a retake swing easier to time.",
          "setup": "Throw it where enemies must cross, not where they already finished moving. Layer two slows only when the extra time changes the round.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/45053483528b96cbe003ac39e6b53c9866d5fea6.mp4?accountingTag=VAL",
            "title": "Sage Slow Orb ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/569fdd95-4d10-43ab-ca70-79becc718b46?language=en-US"
        },
        {
          "id": "healing-orb",
          "name": "Healing Orb",
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ability2/displayicon.png",
          "summary": "EQUIP a healing orb. FIRE with your crosshairs over a damaged ally to activate a Heal-Over-Time on them. ALT FIRE while Sage is damaged to activate a self Heal-Over-Time.",
          "stats": {
            "Cost": "Free",
            "Charges": "1",
            "Recharge": "Cooldown",
            "Damage": "None"
          },
          "purpose": "Restore a teammate who can take another meaningful fight and preserve armor value.",
          "setup": "Do not cross an exposed lane just to heal. Ask whether the healed player can actually rejoin the round.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a247d196383136d3de15b4d6d9c816e3c8054ba0.mp4?accountingTag=VAL",
            "title": "Sage Healing Orb ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/569fdd95-4d10-43ab-ca70-79becc718b46?language=en-US"
        },
        {
          "id": "barrier-orb",
          "name": "Barrier Orb",
          "slot": "E - Signature",
          "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/grenade/displayicon.png",
          "summary": "EQUIP a barrier orb. FIRE places a wall that fortifies after a few seconds. ALT FIRE rotates the targeter.",
          "stats": {
            "Cost": "300 credits",
            "Charges": "1",
            "Duration": "40 seconds",
            "Health": "600 per fortified segment"
          },
          "purpose": "Delay a choke, secure a plant, reshape an angle, or elevate a teammate.",
          "setup": "Off-angle walls are possible, but every exposed segment can give attackers a safe breaking target. Build for a specific fight or timing.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a79b1d6838cee5572b428babd74a2db0c07f4ea5.mp4?accountingTag=VAL",
            "title": "Sage Barrier Orb ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/569fdd95-4d10-43ab-ca70-79becc718b46?language=en-US"
        },
        {
          "id": "resurrection",
          "name": "Resurrection",
          "slot": "X - Ultimate",
          "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/abilities/ultimate/displayicon.png",
          "summary": "EQUIP a resurrection ability. FIRE with your crosshairs placed over a dead ally to begin resurrecting them. After a brief channel, the ally will be brought back to life with full health.",
          "stats": {
            "Cost": "7 ultimate points",
            "Charges": "1",
            "Health": "Full health",
            "Damage": "None"
          },
          "purpose": "Recover a key weapon, restore numbers, or force defenders to contest the body.",
          "setup": "Clear the body and name the revived player's escape route first. A resurrection that immediately dies spends the ultimate without restoring pressure.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df83929ed5da349c37a5bf4600c2b55010c72402.mp4?accountingTag=VAL",
            "title": "Sage Resurrection ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/569fdd95-4d10-43ab-ca70-79becc718b46?language=en-US"
        }
      ],
      "pickRate": 6.8,
      "pickRateRank": 5,
      "sampleLabel": "Tracker Network | Past two weeks",
      "mapPickRates": {
        "Split": 8.9,
        "Sunset": 6.7,
        "Haven": 6.5
      },
      "mapWinRates": {
        "Split": 52.3,
        "Sunset": 51.9,
        "Haven": 51.5
      },
      "lore": [
        {
          "label": "Origin",
          "value": "China",
          "note": "Sage creates safety for her team wherever the mission takes them and serves as a calm center in chaotic fights."
        },
        {
          "label": "Lore",
          "value": "Radiant stronghold",
          "note": "Her Radiant power heals allies, denies ground, and can return a fallen teammate to the fight."
        }
      ],
      "uuid": "569fdd95-4d10-43ab-ca70-79becc718b46",
      "source": "https://valorant-api.com/v1/agents/569fdd95-4d10-43ab-ca70-79becc718b46?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US",
      "uuid": "6f2a04ca-43e0-be17-7f36-b3908627744d",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "sova",
      "label": "Sova",
      "role": "Initiator",
      "maps": [
        "Ascent",
        "Haven",
        "Breeze"
      ],
      "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/fullportrait.png",
      "fundamentals": [
        "Recon Bolt is strongest where defenders must expose themselves to break it. Call the pulse before it lands so the entry can move on the reveal.",
        "Owl Drone should clear the route your first player will actually take; start close enough that teammates can trade the drone's contact.",
        "Shock Bolt and Hunter's Fury convert confirmed information. Use them after a tag, plant sound, or teammate call rather than guessing at empty space."
      ],
      "patchHistory": [
        {
          "patch": "4.08",
          "note": "Owl Drone duration fell from 10 to 7 seconds and health from 125 to 100; its dart dropped from three reveal pings to two, while Shock Bolt max damage fell to 75.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-4-08/"
        },
        {
          "patch": "13.00",
          "note": "Sova's signature cooldown was reduced from 60 to 50 seconds, restoring more late-round Recon Bolt opportunities.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-13-00/"
        }
      ],
      "abilities": [
        {
          "id": "shock-bolt",
          "name": "Shock Bolt",
          "slot": "C - Basic",
          "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ability1/displayicon.png",
          "summary": "EQUIP a bow with a shock bolt. FIRE to send the explosive bolt forward, detonating upon collision and damaging players nearby. HOLD FIRE to extend the range of the projectile. ALT FIRE to add up to two bounces to this arrow.",
          "stats": {
            "Cost": "150 credits each",
            "Charges": "2",
            "Damage": "Up to 75",
            "Falloff": "Scales down from center"
          },
          "purpose": "Finish tagged enemies, clear utility, punish plants, and force players out of cover.",
          "setup": "Use full damage only when the center can land. Edge damage is pressure, not a guaranteed kill.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/7776fa677e90c72da94ec7d188d2d4618116c41b.mp4?accountingTag=VAL",
            "title": "Sova Shock Bolt ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa?language=en-US"
        },
        {
          "id": "recon-bolt",
          "name": "Recon Bolt",
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ability2/displayicon.png",
          "summary": "EQUIP a bow with recon bolt. FIRE to send the recon bolt forward, activating upon collision and Revealing the location of nearby enemies caught in the line of sight of the bolt. Enemies can destroy this bolt. HOLD FIRE to extend the range of the projectile. ALT FIRE to add up to two bounces to this arrow. ",
          "stats": {
            "Cost": "Free",
            "Charges": "1",
            "Recharge": "Cooldown",
            "Damage": "None"
          },
          "purpose": "Confirm occupied lanes and make defenders turn away from the entry fight to break the dart.",
          "setup": "Place it where the pulse sees the fight but defenders cannot destroy it without exposing themselves.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/50f9d870fa2a9b9ba38408eb718ffc06879c11a8.mp4?accountingTag=VAL",
            "title": "Sova Recon Bolt ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa?language=en-US"
        },
        {
          "id": "owl-drone",
          "name": "Owl Drone",
          "slot": "E - Signature",
          "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/grenade/displayicon.png",
          "summary": "EQUIP an owl drone. FIRE to deploy and take control of movement of the drone. While in control of the drone, FIRE to shoot a marking dart. This dart will Reveal the location of any player struck by the dart. Enemies can destroy the Owl Drone.",
          "stats": {
            "Cost": "400 credits",
            "Charges": "1",
            "Duration": "About 10 seconds",
            "Damage": "None"
          },
          "purpose": "Clear the exact route the entry will take and force defenders to shoot or give up space.",
          "setup": "Start close enough that teammates can follow the drone. A full solo flight with nobody ready wastes the reveal window.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6c6f036376c18ddf4ed0c589b506b8889d86a29a.mp4?accountingTag=VAL",
            "title": "Sova Owl Drone ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa?language=en-US"
        },
        {
          "id": "hunter-s-fury",
          "name": "Hunter's Fury",
          "slot": "X - Ultimate",
          "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/abilities/ultimate/displayicon.png",
          "summary": "EQUIP a bow with three long-range, wall-piercing energy blasts. FIRE to release an energy blast in a line in front of Sova, dealing damage and Revealing the location of enemies caught in the line. This ability can be RE-USED up to two more times while the ability timer is active.",
          "stats": {
            "Cost": "8 ultimate points",
            "Charges": "3 blasts",
            "Damage": "80 per blast",
            "Falloff": "None through terrain"
          },
          "purpose": "Convert recon or a drone tag, deny a plant or defuse, and damage clustered rotations.",
          "setup": "Lead the target between blasts. Firing all three at the same stale position gives away the remaining shots.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df9ce34c3d2a7f527929cac123501e1473e0da0e.mp4?accountingTag=VAL",
            "title": "Sova Hunter's Fury ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa?language=en-US"
        },
        {
          "id": "uncanny-marksman",
          "name": "Uncanny Marksman",
          "slot": "Passive - Passive",
          "icon": "",
          "summary": "Sova's custom bow can fire his arrows and bounce them off terrain. Holding fire charges the bow's power, and the bolt is loosed when released. Press alt fire to change the number of bounces.Your arrows can bounce off terrain. Holding left click increases the bow's range trajectory. Right clicking Toggle through the desired number of terrain bounces by right clicking. The arrow is loosed when left click is released.",
          "source": "https://valorant-api.com/v1/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa?language=en-US"
        }
      ],
      "pickRate": 4.9,
      "pickRateRank": 7,
      "sampleLabel": "Tracker Network | Past two weeks",
      "mapPickRates": {
        "Ascent": 8.4,
        "Haven": 7.9,
        "Breeze": 7.7
      },
      "mapWinRates": {
        "Ascent": 51.3,
        "Haven": 50.8,
        "Breeze": 50.8
      },
      "lore": [
        {
          "label": "Origin",
          "value": "Russia",
          "note": "Raised through the severity of the Russian tundra, Sova is a patient scout and relentless tracker."
        },
        {
          "label": "Lore",
          "value": "Hunter of hidden threats",
          "note": "Specialized equipment and a custom bow help him reveal, pursue, and eliminate enemies who believe they are concealed."
        }
      ],
      "uuid": "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
      "source": "https://valorant-api.com/v1/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
        }
      ],
      "abilities": [
        {
          "id": "guided-salvo",
          "name": "Guided Salvo",
          "slot": "Q - Basic",
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
          "slot": "C - Basic",
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
          "slot": "X - Ultimate",
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US",
      "uuid": "b444168c-4e35-8076-db47-ef9bf368f384",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
          "slot": "C - Basic",
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
      "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US",
      "uuid": "92eeef5d-43b5-1d4a-8d03-b3927a09034b",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "viper",
      "label": "Viper",
      "role": "Controller",
      "maps": [
        "Breeze",
        "Split",
        "Lotus"
      ],
      "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/fullportrait.png",
      "fundamentals": [
        "Toxic Screen and Poison Cloud share fuel, so cycle them around the team's contact instead of spending the full tank before anyone can take space.",
        "Her wall is permanent for the round and the orb is only recoverable during Buy Phase. Commit each setup to the lanes your team actually plans to contest.",
        "Snake Bite's Vulnerable effect turns teammate damage into the real threat. Pair it with a choke, smoke, plant sound, or swing rather than relying on the puddle alone."
      ],
      "patchHistory": [
        {
          "patch": "3.00",
          "note": "Snake Bite duration fell from 8 to 6.5 seconds and its price rose from 100 to 200 credits as Riot reduced Viper's stall time.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
        },
        {
          "patch": "8.08",
          "note": "Smoke uptime fell to 12 seconds, minimum activation fuel rose to 30%, and Snake Bite moved to one 300-credit charge with a 6.5-second duration.",
          "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-8-08/"
        }
      ],
      "abilities": [
        {
          "id": "poison-cloud",
          "name": "Poison Cloud",
          "slot": "C - Basic",
          "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/ability1/displayicon.png",
          "summary": "EQUIP a gas emitter. FIRE to throw the emitter that perpetually remains throughout the round. ALT FIRE to lob. RE-USE the ability to create a toxic gas cloud that Decays opponents inside it at the cost of fuel. This ability can be picked up to be REDEPLOYED before the round starts and can be RE-USED more than once throughout the round.",
          "stats": {
            "Cost": "200 credits",
            "Charges": "1",
            "Uptime": "Up to 12 seconds on full solo fuel",
            "Reactivation": "5-second delay"
          },
          "purpose": "Control a choke repeatedly and create strong one-way fights from stable ledges.",
          "setup": "One-ways are a core strength, but difficult throws need a reproducible lineup. If the orb misses, the setup can be unrecoverable after Buy Phase.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/49ff8efd75b76941da3018362061275d3a1d43d6.mp4?accountingTag=VAL",
            "title": "Viper Poison Cloud ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/707eab51-4836-f488-046a-cda6bf494859?language=en-US"
        },
        {
          "id": "toxic-screen",
          "name": "Toxic Screen",
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/ability2/displayicon.png",
          "summary": "EQUIP a gas emitter launcher that penetrates terrain. FIRE to deploy a long line of gas emitters. RE-USE the ability to create a tall wall of toxic gas that Decays opponents that cross it at the cost of fuel. This ability can be RE-USED more than once.",
          "stats": {
            "Cost": "Free",
            "Charges": "1",
            "Uptime": "Up to 12 seconds on full solo fuel",
            "Reactivation": "5-second delay"
          },
          "purpose": "Split open sites, hide several crossing lanes at once, and control when defenders regain information.",
          "setup": "Place it for the entire round plan. The emitters cannot be moved, so a wall that helps defenders retake can hurt the team later.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/36db8f44946850c2a20aba43d8ad3ecd977c7d7e.mp4?accountingTag=VAL",
            "title": "Viper Toxic Screen ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/707eab51-4836-f488-046a-cda6bf494859?language=en-US"
        },
        {
          "id": "snake-bite",
          "name": "Snake Bite",
          "slot": "E - Signature",
          "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/grenade/displayicon.png",
          "summary": "EQUIP a chemical launcher. FIRE to launch a canister that shatters upon hitting the floor, creating a lingering chemical zone that damages and applies Vulnerable.",
          "stats": {
            "Cost": "300 credits",
            "Charges": "1",
            "Duration": "6.5 seconds",
            "Damage": "Damage over time"
          },
          "purpose": "Clear a corner, stop a plant or defuse, and double the threat of teammate damage through Vulnerable.",
          "setup": "Damage depends on how long the target remains inside, so pair it with a choke, smoke, stun, or confirmed spike timing.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9eeb3090efed080792e6ea2f264fd60ebb12694e.mp4?accountingTag=VAL",
            "title": "Viper Snake Bite ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/707eab51-4836-f488-046a-cda6bf494859?language=en-US"
        },
        {
          "id": "viper-s-pit",
          "name": "Viper's Pit",
          "slot": "X - Ultimate",
          "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/abilities/ultimate/displayicon.png",
          "summary": "EQUIP a chemical sprayer. FIRE to spray a chemical cloud in all directions around Viper, creating a large cloud that Nearsights players and Decays the health of enemies inside of it. HOLD the ability key to disperse the cloud early.",
          "stats": {
            "Cost": "9 ultimate points",
            "Duration": "Persistent while maintained",
            "Damage": "Decay, not direct damage",
            "Recharge": "No"
          },
          "purpose": "Lock down a planted spike or high-value zone and force close, uncertain fights.",
          "setup": "Move between several safe pockets. Repeating one hiding spot turns the entire ultimate into one pre-aimed duel.",
          "video": {
            "provider": "riot",
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4601fd972c588a79cdd910b2497546f156886c40.mp4?accountingTag=VAL",
            "title": "Viper's Pit ability demo",
            "source": "https://playvalorant.com/en-us/agents/"
          },
          "source": "https://valorant-api.com/v1/agents/707eab51-4836-f488-046a-cda6bf494859?language=en-US"
        },
        {
          "id": "toxic",
          "name": "Toxic",
          "slot": "Passive - Passive",
          "icon": "",
          "summary": "You gradually generate and replenish the toxin that fuels your abilities.  Enemies that cross through Viper's Poison Cloud, Toxic Screen, or Viper's Pit are instantly inflicted with at least 30 Decay. Their Decay level increases the longer they remain in contact with it.",
          "source": "https://valorant-api.com/v1/agents/707eab51-4836-f488-046a-cda6bf494859?language=en-US"
        }
      ],
      "pickRate": 0.9,
      "pickRateRank": 25,
      "sampleLabel": "Tracker Network | Past two weeks",
      "mapPickRates": {
        "Breeze": 3.9,
        "Split": 0.6,
        "Lotus": 0.5
      },
      "mapWinRates": {
        "Breeze": 50.4,
        "Split": 47.9,
        "Lotus": 48.2
      },
      "lore": [
        {
          "label": "Origin",
          "value": "United States",
          "note": "Viper is an American chemist who applies a formidable scientific mind directly to the battlefield."
        },
        {
          "label": "Lore",
          "value": "Toxic field commander",
          "note": "Her chemical devices control space and impair enemies, and she is willing to use every advantage to secure the mission."
        }
      ],
      "uuid": "707eab51-4836-f488-046a-cda6bf494859",
      "source": "https://valorant-api.com/v1/agents/707eab51-4836-f488-046a-cda6bf494859?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
        }
      ],
      "abilities": [
        {
          "id": "shear",
          "name": "Shear",
          "slot": "C - Basic",
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
      "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US",
      "uuid": "efba5359-4016-a1e5-7626-b1ae76895940",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
          "slot": "Q - Basic",
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
          "slot": "E - Signature",
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
          "slot": "C - Basic",
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
      "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US",
      "uuid": "df1cb487-4902-002e-5c17-d28e83e78588",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
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
      "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US",
      "uuid": "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    }
  ],
  "maps": [
    {
      "id": "abyss",
      "label": "Abyss",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/displayicon.png",
      "callouts": [
        {
          "id": "abyss-1",
          "sourceKey": "A::Bridge",
          "sourceLabel": "A Bridge",
          "label": "A Bridge",
          "superRegionName": "A",
          "regionName": "Bridge",
          "x": 46.96,
          "y": 3.83
        },
        {
          "id": "abyss-2",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 30.15,
          "y": 27.32
        },
        {
          "id": "abyss-3",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 77.54,
          "y": 23.67
        },
        {
          "id": "abyss-4",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 63.37,
          "y": 19.22
        },
        {
          "id": "abyss-5",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 48.38,
          "y": 15.17
        },
        {
          "id": "abyss-6",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 90.09,
          "y": 42.3
        },
        {
          "id": "abyss-7",
          "sourceKey": "A::Tower",
          "sourceLabel": "A Tower",
          "label": "A Tower",
          "superRegionName": "A",
          "regionName": "Tower",
          "x": 48.99,
          "y": 25.5
        },
        {
          "id": "abyss-8",
          "sourceKey": "Mid::Bend",
          "sourceLabel": "Mid Bend",
          "label": "Mid Bend",
          "superRegionName": "Mid",
          "regionName": "Bend",
          "x": 58.71,
          "y": 63.77
        },
        {
          "id": "abyss-9",
          "sourceKey": "B::Link",
          "sourceLabel": "B Link",
          "label": "B Link",
          "superRegionName": "B",
          "regionName": "Link",
          "x": 30.96,
          "y": 66.2
        },
        {
          "id": "abyss-10",
          "sourceKey": "B::Lobby",
          "sourceLabel": "B Lobby",
          "label": "B Lobby",
          "superRegionName": "B",
          "regionName": "Lobby",
          "x": 82.6,
          "y": 79.56
        },
        {
          "id": "abyss-11",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 62.35,
          "y": 86.04
        },
        {
          "id": "abyss-12",
          "sourceKey": "B::Nest",
          "sourceLabel": "B Nest",
          "label": "B Nest",
          "superRegionName": "B",
          "regionName": "Nest",
          "x": 67.42,
          "y": 90.3
        },
        {
          "id": "abyss-13",
          "sourceKey": "Mid::Bottom",
          "sourceLabel": "Mid Bottom",
          "label": "Mid Bottom",
          "superRegionName": "Mid",
          "regionName": "Bottom",
          "x": 54.66,
          "y": 53.24
        },
        {
          "id": "abyss-14",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 40.48,
          "y": 85.84
        },
        {
          "id": "abyss-15",
          "sourceKey": "Mid::Catwalk",
          "sourceLabel": "Mid Catwalk",
          "label": "Mid Catwalk",
          "superRegionName": "Mid",
          "regionName": "Catwalk",
          "x": 54.25,
          "y": 45.14
        },
        {
          "id": "abyss-16",
          "sourceKey": "B::Danger",
          "sourceLabel": "B Danger",
          "label": "B Danger",
          "superRegionName": "B",
          "regionName": "Danger",
          "x": 55.67,
          "y": 97.39
        },
        {
          "id": "abyss-17",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 7.27,
          "y": 42.3
        },
        {
          "id": "abyss-18",
          "sourceKey": "Mid::Library",
          "sourceLabel": "Mid Library",
          "label": "Mid Library",
          "superRegionName": "Mid",
          "regionName": "Library",
          "x": 45.14,
          "y": 52.63
        },
        {
          "id": "abyss-19",
          "sourceKey": "A::Secret",
          "sourceLabel": "A Secret",
          "label": "A Secret",
          "superRegionName": "A",
          "regionName": "Secret",
          "x": 18.81,
          "y": 19.42
        },
        {
          "id": "abyss-20",
          "sourceKey": "A::Security",
          "sourceLabel": "A Security",
          "label": "A Security",
          "superRegionName": "A",
          "regionName": "Security",
          "x": 25.9,
          "y": 10.31
        },
        {
          "id": "abyss-21",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 30.76,
          "y": 43.72
        },
        {
          "id": "abyss-22",
          "sourceKey": "B::Tower",
          "sourceLabel": "B Tower",
          "label": "B Tower",
          "superRegionName": "B",
          "regionName": "Tower",
          "x": 29.75,
          "y": 81.79
        },
        {
          "id": "abyss-23",
          "sourceKey": "A::Vent",
          "sourceLabel": "A Vent",
          "label": "A Vent",
          "superRegionName": "A",
          "regionName": "Vent",
          "x": 47.37,
          "y": 36.23
        }
      ],
      "plantSpots": [],
      "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
      "weaponSuggestions": [],
      "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "metaComp": {
        "agents": [],
        "composition": "No verified current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
      "agentInsights": {},
      "lineupLinks": [],
      "source": "https://valorant-api.com/v1/maps/224b0a95-48b9-f703-1bd8-67aca101a61f?language=en-US",
      "uuid": "224b0a95-48b9-f703-1bd8-67aca101a61f",
      "coordinates": "70° 50' AJ\" N, 9° 00' VX\" W",
      "calloutLabelsBakedIn": false,
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "ascent",
      "label": "Ascent",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/displayicon.png",
      "callouts": [
        {
          "id": "ascent-1",
          "sourceKey": "A::Tree",
          "sourceLabel": "A Tree",
          "label": "A Tree",
          "superRegionName": "A",
          "regionName": "Tree",
          "x": 39.82,
          "y": 29.46
        },
        {
          "id": "ascent-2",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 60.29,
          "y": 25.9
        },
        {
          "id": "ascent-3",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 48.42,
          "y": 20.07
        },
        {
          "id": "ascent-4",
          "sourceKey": "A::Window",
          "sourceLabel": "A Window",
          "label": "A Window",
          "superRegionName": "A",
          "regionName": "Window",
          "x": 24.12,
          "y": 29.16
        },
        {
          "id": "ascent-5",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 35.01,
          "y": 14.25
        },
        {
          "id": "ascent-6",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 81.74,
          "y": 56.9
        },
        {
          "id": "ascent-7",
          "sourceKey": "B::Lobby",
          "sourceLabel": "B Lobby",
          "label": "B Lobby",
          "superRegionName": "B",
          "regionName": "Lobby",
          "x": 71.66,
          "y": 67.76
        },
        {
          "id": "ascent-8",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 40.5,
          "y": 71.21
        },
        {
          "id": "ascent-9",
          "sourceKey": "B::Boat House",
          "sourceLabel": "B Boat House",
          "label": "B Boat House",
          "superRegionName": "B",
          "regionName": "Boat House",
          "x": 27.05,
          "y": 88.72
        },
        {
          "id": "ascent-10",
          "sourceKey": "Mid::Bottom",
          "sourceLabel": "Mid Bottom",
          "label": "Mid Bottom",
          "superRegionName": "Mid",
          "regionName": "Bottom",
          "x": 39.73,
          "y": 49.47
        },
        {
          "id": "ascent-11",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 28.55,
          "y": 73.73
        },
        {
          "id": "ascent-12",
          "sourceKey": "Mid::Catwalk",
          "sourceLabel": "Mid Catwalk",
          "label": "Mid Catwalk",
          "superRegionName": "Mid",
          "regionName": "Catwalk",
          "x": 52.5,
          "y": 41.11
        },
        {
          "id": "ascent-13",
          "sourceKey": "Mid::Cubby",
          "sourceLabel": "Mid Cubby",
          "label": "Mid Cubby",
          "superRegionName": "Mid",
          "regionName": "Cubby",
          "x": 45.48,
          "y": 33.61
        },
        {
          "id": "ascent-14",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 13.18,
          "y": 43.36
        },
        {
          "id": "ascent-15",
          "sourceKey": "A::Garden",
          "sourceLabel": "A Garden",
          "label": "A Garden",
          "superRegionName": "A",
          "regionName": "Garden",
          "x": 28.53,
          "y": 30.91
        },
        {
          "id": "ascent-16",
          "sourceKey": "Mid::Market",
          "sourceLabel": "Mid Market",
          "label": "Mid Market",
          "superRegionName": "Mid",
          "regionName": "Market",
          "x": 29.85,
          "y": 49.7
        },
        {
          "id": "ascent-17",
          "sourceKey": "Mid::Courtyard",
          "sourceLabel": "Mid Courtyard",
          "label": "Mid Courtyard",
          "superRegionName": "Mid",
          "regionName": "Courtyard",
          "x": 49.28,
          "y": 48.77
        },
        {
          "id": "ascent-18",
          "sourceKey": "Mid::Link",
          "sourceLabel": "Mid Link",
          "label": "Mid Link",
          "superRegionName": "Mid",
          "regionName": "Link",
          "x": 51.43,
          "y": 61.75
        },
        {
          "id": "ascent-19",
          "sourceKey": "Mid::Pizza",
          "sourceLabel": "Mid Pizza",
          "label": "Mid Pizza",
          "superRegionName": "Mid",
          "regionName": "Pizza",
          "x": 30.55,
          "y": 44.71
        },
        {
          "id": "ascent-20",
          "sourceKey": "A::Rafters",
          "sourceLabel": "A Rafters",
          "label": "A Rafters",
          "superRegionName": "A",
          "regionName": "Rafters",
          "x": 23.92,
          "y": 14.41
        },
        {
          "id": "ascent-21",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 66.48,
          "y": 38.05
        },
        {
          "id": "ascent-22",
          "sourceKey": "A::Wine",
          "sourceLabel": "A Wine",
          "label": "A Wine",
          "superRegionName": "A",
          "regionName": "Wine",
          "x": 48.56,
          "y": 5.81
        }
      ],
      "plantSpots": [],
      "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
      "weaponSuggestions": [],
      "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "metaComp": {
        "agents": [],
        "composition": "No verified current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
      "agentInsights": {},
      "lineupLinks": [],
      "source": "https://valorant-api.com/v1/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319?language=en-US",
      "uuid": "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
      "coordinates": "45°26'BF'N,12°20'Q'E",
      "calloutLabelsBakedIn": false,
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "bind",
      "label": "Bind",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
      "layoutImage": "/assets/library/maps/bind-layout-labeled.svg",
      "callouts": [
        {
          "id": "bind-1",
          "sourceKey": "A::Exit",
          "sourceLabel": "A Exit",
          "label": "A Exit",
          "superRegionName": "A",
          "regionName": "Exit",
          "x": 92.35,
          "y": 52.21
        },
        {
          "id": "bind-2",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 51.75,
          "y": 59.2
        },
        {
          "id": "bind-3",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 76.33,
          "y": 60.69
        },
        {
          "id": "bind-4",
          "sourceKey": "A::Short",
          "sourceLabel": "A Short",
          "label": "A Short",
          "superRegionName": "A",
          "regionName": "Short",
          "x": 62.44,
          "y": 49.65
        },
        {
          "id": "bind-5",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 73.41,
          "y": 33.34
        },
        {
          "id": "bind-6",
          "sourceKey": "A::Teleporter",
          "sourceLabel": "A Teleporter",
          "label": "A Teleporter",
          "superRegionName": "A",
          "regionName": "Teleporter",
          "x": 60.58,
          "y": 41.11
        },
        {
          "id": "bind-7",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 58.15,
          "y": 95.8
        },
        {
          "id": "bind-8",
          "sourceKey": "B::Exit",
          "sourceLabel": "B Exit",
          "label": "B Exit",
          "superRegionName": "B",
          "regionName": "Exit",
          "x": 47.29,
          "y": 44.12
        },
        {
          "id": "bind-9",
          "sourceKey": "B::Hall",
          "sourceLabel": "B Hall",
          "label": "B Hall",
          "superRegionName": "B",
          "regionName": "Hall",
          "x": 28.54,
          "y": 20.16
        },
        {
          "id": "bind-10",
          "sourceKey": "B::Link",
          "sourceLabel": "B Link",
          "label": "B Link",
          "superRegionName": "B",
          "regionName": "Link",
          "x": 42.23,
          "y": 59.22
        },
        {
          "id": "bind-11",
          "sourceKey": "B::Fountain",
          "sourceLabel": "B Fountain",
          "label": "B Fountain",
          "superRegionName": "B",
          "regionName": "Fountain",
          "x": 25.89,
          "y": 62.91
        },
        {
          "id": "bind-12",
          "sourceKey": "B::Long",
          "sourceLabel": "B Long",
          "label": "B Long",
          "superRegionName": "B",
          "regionName": "Long",
          "x": 19.27,
          "y": 51.52
        },
        {
          "id": "bind-13",
          "sourceKey": "B::Short",
          "sourceLabel": "B Short",
          "label": "B Short",
          "superRegionName": "B",
          "regionName": "Short",
          "x": 39.66,
          "y": 52.95
        },
        {
          "id": "bind-14",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 29.19,
          "y": 31.22
        },
        {
          "id": "bind-15",
          "sourceKey": "B::Teleporter",
          "sourceLabel": "B Teleporter",
          "label": "B Teleporter",
          "superRegionName": "B",
          "regionName": "Teleporter",
          "x": 15.07,
          "y": 43.49
        },
        {
          "id": "bind-16",
          "sourceKey": "B::Window",
          "sourceLabel": "B Window",
          "label": "B Hookah",
          "superRegionName": "B",
          "regionName": "Window",
          "x": 32.27,
          "y": 44.68
        },
        {
          "id": "bind-17",
          "sourceKey": "A::Bath",
          "sourceLabel": "A Bath",
          "label": "A Showers",
          "superRegionName": "A",
          "regionName": "Bath",
          "x": 83.95,
          "y": 43.03
        },
        {
          "id": "bind-18",
          "sourceKey": "Attacker Side::Cave",
          "sourceLabel": "Attacker Side Cave",
          "label": "Attacker Side Cave",
          "superRegionName": "Attacker Side",
          "regionName": "Cave",
          "x": 59.21,
          "y": 73.63
        },
        {
          "id": "bind-19",
          "sourceKey": "A::Cubby",
          "sourceLabel": "A Cubby",
          "label": "A Cubby",
          "superRegionName": "A",
          "regionName": "Cubby",
          "x": 58.73,
          "y": 45.99
        },
        {
          "id": "bind-20",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 51.69,
          "y": 10.37
        },
        {
          "id": "bind-21",
          "sourceKey": "B::Elbow",
          "sourceLabel": "B Elbow",
          "label": "B Elbow",
          "superRegionName": "B",
          "regionName": "Elbow",
          "x": 15.83,
          "y": 30.6
        },
        {
          "id": "bind-22",
          "sourceKey": "B::Garden",
          "sourceLabel": "B Garden",
          "label": "B Garden",
          "superRegionName": "B",
          "regionName": "Garden",
          "x": 24.67,
          "y": 42.81
        },
        {
          "id": "bind-23",
          "sourceKey": "A::Lamps",
          "sourceLabel": "A Lamps",
          "label": "A Lamps / U-Haul",
          "superRegionName": "A",
          "regionName": "Lamps",
          "x": 58.17,
          "y": 33.92
        },
        {
          "id": "bind-24",
          "sourceKey": "A::Tower",
          "sourceLabel": "A Tower",
          "label": "A Heaven",
          "superRegionName": "A",
          "regionName": "Tower",
          "x": 72.78,
          "y": 20.81
        }
      ],
      "plantSpots": [
        {
          "number": 1,
          "site": "A",
          "label": "A Truck Default",
          "rate": null,
          "x": 75.6,
          "y": 34.5,
          "previewLabel": "A Truck in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/4d5161107bb15614535dae6dfc7f86bea500d003-763x663.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 2,
          "site": "A",
          "label": "A Open Plant",
          "rate": null,
          "x": 68.5,
          "y": 35.7,
          "previewLabel": "A Open in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/b996cd4c248b1766a76f753742b3b3bd5a4760e8-763x663.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 1,
          "site": "B",
          "label": "B Default",
          "rate": null,
          "x": 31.4,
          "y": 31.3,
          "previewLabel": "B Default in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/ae001b00624f314098333175e48aa9d7a317c2c2-857x661.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 2,
          "site": "B",
          "label": "B Long Plant",
          "rate": null,
          "x": 26.7,
          "y": 31.3,
          "previewLabel": "B open-site in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/52e28edead38b5b1ec0dcbfaf074fb2894cd7725-857x661.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 3,
          "site": "B",
          "label": "B Window Plant",
          "rate": null,
          "x": 29.1,
          "y": 32.4,
          "previewLabel": "B open-site in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/52e28edead38b5b1ec0dcbfaf074fb2894cd7725-857x661.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        }
      ],
      "plantRateNote": "Bind is outside the active competitive rotation, so no active-season PC plant-rate sample is available.",
      "weaponSuggestions": [
        {
          "weapon": "Phantom",
          "image": "/assets/weapons/phantom.png",
          "category": "rifle",
          "fit": "Best rifle fit",
          "locations": "Hookah, Lamps, Showers",
          "roundConversionUnavailable": "Bind is outside the active-season Competitive sample.",
          "note": "Compact chokes and frequent smoke fights reward the Phantom's close-range control."
        },
        {
          "weapon": "Operator",
          "image": "/assets/weapons/operator.png",
          "category": "sniper",
          "fit": "Strong sniper fit",
          "side": "DEF",
          "locations": "B Long, A Tower, A Short",
          "roundConversionUnavailable": "Bind is outside the active-season Competitive sample.",
          "conversion": "Conversion read: stronger than a shotgun while the first duel stays long; Judge and Bucky gain value once Hookah or Lamps is the planned contact.",
          "note": "On defense, long lanes create early picks, while either teleporter can turn a missed opening read into a fast cross-map fight. Pair the Operator with an escape tool and a called rotation."
        },
        {
          "weapon": "Ghost",
          "image": "/assets/weapons/ghost.png",
          "category": "pistol",
          "fit": "Pistol-round fit",
          "locations": "A Short, Showers, B Long",
          "roundConversionUnavailable": "Bind is outside the active-season Competitive sample.",
          "note": "The quiet, accurate first shot fits Bind's early lane fights while keeping utility in the buy."
        },
        {
          "weapon": "Judge",
          "image": "/assets/weapons/judge.png",
          "category": "shotgun",
          "fit": "Close conversion rival",
          "side": "DEF",
          "locations": "Hookah, Lamps, U-Haul",
          "roundConversionUnavailable": "Bind is outside the active-season Competitive sample.",
          "conversion": "Conversion read: more repeatable than an Operator when the setup guarantees two close contacts; much weaker if attackers can reset to Long or Showers.",
          "note": "On defense, commit it to a compact choke and plan the rifle recovery after the first conversion."
        },
        {
          "weapon": "Stinger",
          "image": "/assets/weapons/stinger.png",
          "category": "eco",
          "fit": "Eco outlier",
          "locations": "Hookah, Lamps, Showers",
          "roundConversionUnavailable": "Bind is outside the active-season Competitive sample.",
          "note": "The low-cost damage output is useful only when the setup protects a close fight and a short magazine."
        }
      ],
      "macro": {
        "_researchNote": "internal only, do not render",
        "_researchUrl": "https://www.zleague.gg/theportal/woohoojin-mastering-the-bind-map-in-valorant/",
        "defense": [
          "Treat Hookah, Showers, Octagon, and U-Haul as Bind's high-value control areas. Double up when the read calls for it; owning one of these lanes gives the retake a flank route and shortens the next rotation.",
          "On A site, contest Showers or U-Haul before settling into straight-site positions. Giving up both lets attackers flood the site with utility and leaves the retake entering through predictable lanes.",
          "Look for repeated defaults, late lurks, and teleporter timings, then call an early punish. Waiting until the execute lands gives the pattern its value."
        ],
        "attack": [
          "Bind's two teleporters turn lane control into fast cross-map rotations. Draw utility or defenders first, then arrive at the exit together instead of treating first contact as a forced site commitment.",
          "Read the defensive composition before choosing pace: break sentinel utility early and commit late into double Sentinel; hit earlier into double Controller before rotating smokes recycle; hold disciplined defaults into double Initiator so repeated information sees no commitment; against double Duelist, take or hold forward lanes so aggression is called and traded."
        ]
      },
      "siteTips": [
        {
          "label": "A Showers",
          "text": "Clear Showers before the spike crosses Truck. A defender left there can split the site, punish the plant, and isolate the A Short group.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Lamps / U-Haul",
          "text": "Take and hold Lamps/U-Haul through the plant. It is the defenders' closest retake path and protects the planter from an immediate site re-entry.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        },
        {
          "label": "B Hookah",
          "text": "Build the B split around synchronized Hookah and Garden/B Long contact. Hold the drop until the Long group can trade, then clear site and Elbow from different directions.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "B Long / Octagon",
          "text": "Keep Long or Octagon after the plant while a teammate holds site or Hookah. That crossfire forces the retake to clear separate lines instead of collapsing through Defender Spawn and Elbow together.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Common fake",
          "text": "Sell A with Showers and A Short utility, then send one player through the A teleporter while the spike group holds B Long. Call whether the exit player is selling Hookah pressure or joining the hit before the audio plays."
        },
        {
          "label": "Eco-round plan",
          "text": "Group the low buy to break one piece of sentinel utility and force a compact trade through Showers, U-Haul, or Hookah. Recover the first rifle before spreading into open lanes."
        },
        {
          "label": "Round-plan execution",
          "text": "Before barriers drop, name the first lane, the teleporter trigger, and the reset condition. Bind's rotations are fast only when the destination group is ready for the exit fight."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Take first space through A Short, Showers, Hookah, or B Long after support utility lands."
          },
          {
            "category": "sites",
            "text": "On A, force the Showers split angle off and clear U-Haul/Lamps; on B, clear Hookah and Elbow before teammates spread into site."
          },
          {
            "category": "defense",
            "text": "Contest Hookah, Showers, Octagon, or U-Haul with an escape plan instead of dry re-peeking after contact."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Reveal or clear Hookah, B Long, Showers, and A Short immediately before the entry moves."
          },
          {
            "category": "sites",
            "text": "Use flashes and scans to isolate U-Haul/Lamps, A Tower, Elbow, and Defender Spawn rather than covering empty space."
          },
          {
            "category": "teamplay",
            "text": "Track teleporter audio and call the exit so the team rotates before the destination fight is already lost."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "For A hits, smoke off A Tower and cover U-Haul/Lamps or Showers based on the lane the team owns; for B hits, smoke off Defender Spawn and Elbow."
          },
          {
            "category": "teamplay",
            "text": "One-way smokes are setup-dependent and should not replace the smokes the execute needs."
          },
          {
            "category": "defense",
            "text": "Keep one smoke or damage tool for the post-plant because Bind retakes arrive through narrow named lanes."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Place flank utility where it survives common prefire paths and still catches teleporter rotations."
          },
          {
            "category": "defense",
            "text": "Anchor where you can punish Hookah, B Long, A Short, or Showers contact without giving a free first death."
          },
          {
            "category": "defense",
            "text": "Change trap and camera height between gun rounds so the same clear does not solve the setup twice."
          }
        ]
      },
      "metaComp": {
        "agents": [],
        "composition": "No current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Bind is outside Tracker Network's current rolling Competitive map sample, so no current composition reference is shown.",
      "agentInsights": {
        "Clove": "Post-death smokes keep both teleporter rotations covered after an opening fight.",
        "Raze": "Explosive movement and clearing utility break Bind's narrow Hookah, Showers, and A Short chokes.",
        "Fade": "Haunt and Prowlers clear U-Haul/Lamps, Hookah, and site corners immediately before contact.",
        "Cypher": "Flank information survives teleporter rotations; B is the higher-success anchor site in this current sample.",
        "Skye": "Guiding Light can curve through both compact site entrances and support fast re-clears."
      },
      "lineupLinks": [
        {
          "label": "LineupsValorant — Bind",
          "url": "https://lineupsvalorant.com/"
        },
        {
          "label": "UpForge Lineup Library — Bind",
          "url": "https://upforge.gg/lineups"
        }
      ],
      "uuid": "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
      "coordinates": "34°2'A'N,6°51'Z'W",
      "calloutLabelsBakedIn": true,
      "source": "https://valorant-api.com/v1/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "breeze",
      "label": "Breeze",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
      "layoutImage": "/assets/library/maps/breeze-layout-labeled.svg",
      "callouts": [
        {
          "id": "breeze-1",
          "sourceKey": "Mid::Hall",
          "sourceLabel": "Mid Hall",
          "label": "Mid Hall",
          "superRegionName": "Mid",
          "regionName": "Hall",
          "x": 63.95,
          "y": 53.51
        },
        {
          "id": "breeze-2",
          "sourceKey": "A::Bridge",
          "sourceLabel": "A Bridge",
          "label": "A Bridge",
          "superRegionName": "A",
          "regionName": "Bridge",
          "x": 71.19,
          "y": 24.51
        },
        {
          "id": "breeze-3",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 71.19,
          "y": 21.01
        },
        {
          "id": "breeze-4",
          "sourceKey": "Defender Side::Arches",
          "sourceLabel": "Defender Side Arches",
          "label": "Defender Side Arches",
          "superRegionName": "Defender Side",
          "regionName": "Arches",
          "x": 37.41,
          "y": 17.51
        },
        {
          "id": "breeze-5",
          "sourceKey": "Mid::Wood Doors",
          "sourceLabel": "Mid Wood Doors",
          "label": "Mid Wood Doors",
          "superRegionName": "Mid",
          "regionName": "Wood Doors",
          "x": 64.36,
          "y": 49.53
        },
        {
          "id": "breeze-6",
          "sourceKey": "Mid::Pillar",
          "sourceLabel": "Mid Pillar",
          "label": "Mid Pillar",
          "superRegionName": "Mid",
          "regionName": "Pillar",
          "x": 49.84,
          "y": 54.08
        },
        {
          "id": "breeze-7",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 50.19,
          "y": 40.08
        },
        {
          "id": "breeze-8",
          "sourceKey": "Mid::Nest",
          "sourceLabel": "Mid Nest",
          "label": "Mid Nest",
          "superRegionName": "Mid",
          "regionName": "Nest",
          "x": 48.44,
          "y": 22.76
        },
        {
          "id": "breeze-9",
          "sourceKey": "B::Window",
          "sourceLabel": "B Window",
          "label": "B Window",
          "superRegionName": "B",
          "regionName": "Window",
          "x": 17.29,
          "y": 67.73
        },
        {
          "id": "breeze-10",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 15.36,
          "y": 58.46
        },
        {
          "id": "breeze-11",
          "sourceKey": "B::Elbow",
          "sourceLabel": "B Elbow",
          "label": "B Elbow",
          "superRegionName": "B",
          "regionName": "Elbow",
          "x": 26.21,
          "y": 50.58
        },
        {
          "id": "breeze-12",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 6.96,
          "y": 38.16
        },
        {
          "id": "breeze-13",
          "sourceKey": "B::Tunnel",
          "sourceLabel": "B Tunnel",
          "label": "B Tunnel",
          "superRegionName": "B",
          "regionName": "Tunnel",
          "x": 36.36,
          "y": 38.16
        },
        {
          "id": "breeze-14",
          "sourceKey": "A::Ramp",
          "sourceLabel": "A Ramp",
          "label": "A Ramp",
          "superRegionName": "A",
          "regionName": "Ramp",
          "x": 65.59,
          "y": 32.21
        },
        {
          "id": "breeze-15",
          "sourceKey": "B::Back",
          "sourceLabel": "B Back",
          "label": "B Back",
          "superRegionName": "B",
          "regionName": "Back",
          "x": 6.79,
          "y": 30.46
        },
        {
          "id": "breeze-16",
          "sourceKey": "B::Wall",
          "sourceLabel": "B Wall",
          "label": "B Wall",
          "superRegionName": "B",
          "regionName": "Wall",
          "x": 25.51,
          "y": 23.46
        },
        {
          "id": "breeze-17",
          "sourceKey": "Mid::Cannon",
          "sourceLabel": "Mid Cannon",
          "label": "Mid Cannon",
          "superRegionName": "Mid",
          "regionName": "Cannon",
          "x": 33.56,
          "y": 63.01
        },
        {
          "id": "breeze-18",
          "sourceKey": "Mid::Bottom",
          "sourceLabel": "Mid Bottom",
          "label": "Mid Bottom",
          "superRegionName": "Mid",
          "regionName": "Bottom",
          "x": 49.84,
          "y": 72.28
        },
        {
          "id": "breeze-19",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 70.31,
          "y": 92.06
        },
        {
          "id": "breeze-20",
          "sourceKey": "A::Shop",
          "sourceLabel": "A Shop",
          "label": "A Shop",
          "superRegionName": "A",
          "regionName": "Shop",
          "x": 76.26,
          "y": 68.26
        },
        {
          "id": "breeze-21",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 90.79,
          "y": 49.53
        },
        {
          "id": "breeze-22",
          "sourceKey": "A::Pyramids",
          "sourceLabel": "A Pyramids",
          "label": "A Pyramids",
          "superRegionName": "A",
          "regionName": "Pyramids",
          "x": 84.66,
          "y": 46.91
        },
        {
          "id": "breeze-23",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 43.36,
          "y": 87.33
        }
      ],
      "plantSpots": [
        {
          "number": 1,
          "site": "A",
          "label": "A Pyramid Default",
          "rate": 44.15,
          "x": 91.4,
          "y": 47.8,
          "previewLabel": "A Pyramid in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 2,
          "site": "A",
          "label": "A Open Pyramid",
          "rate": 13,
          "x": 81.7,
          "y": 47.8,
          "previewLabel": "A Pyramid in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 3,
          "site": "A",
          "label": "A Deep Pyramid",
          "rate": 20.3,
          "x": 93.7,
          "y": 47.8,
          "previewLabel": "A Pyramid in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 4,
          "site": "A",
          "label": "A Safe Pyramid",
          "rate": 7.44,
          "x": 84.7,
          "y": 47.8,
          "previewLabel": "A Pyramid in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/0482846d2a0c463405dbcbb0313bc04f81e4e9ca-1042x697.jpg?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 1,
          "site": "B",
          "label": "B Pillar Default",
          "rate": 83.61,
          "x": 14,
          "y": 31.6,
          "previewLabel": "B Pillar in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/2c999bc13e7f9ae68fb4fd749a5b2684b82a483f-531x652.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 2,
          "site": "B",
          "label": "B Open Plant",
          "rate": 0.71,
          "x": 17.1,
          "y": 30.5,
          "previewLabel": "B open plant in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/2ec53a4e3cead720efc4ab4f107576e37a851174-531x652.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 3,
          "site": "B",
          "label": "B Back Plant",
          "rate": 1.51,
          "x": 10.6,
          "y": 31.9,
          "previewLabel": "B open plant in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/2ec53a4e3cead720efc4ab4f107576e37a851174-531x652.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        }
      ],
      "plantRateNote": "Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive.",
      "weaponSuggestions": [
        {
          "weapon": "Phantom",
          "image": "/assets/weapons/phantom.png",
          "category": "rifle",
          "fit": "Highest rifle conversion",
          "locations": "A Main, B Main, Mid",
          "roundConversion": {
            "scope": "Combined",
            "value": 50.87,
            "sample": "896,805 active-season full-buy rounds",
            "comparisonLabel": "Second rifle",
            "comparisonWeapon": "Vandal",
            "comparisonValue": 50.41
          },
          "note": "Smoke fights and close site finishes give the Phantom a narrow conversion edge, while the Vandal remains the cleaner long-lane one-tap choice."
        },
        {
          "weapon": "Operator",
          "image": "/assets/weapons/operator.png",
          "category": "sniper",
          "fit": "High-value sniper",
          "side": "DEF",
          "locations": "A Main, B Main, Mid Nest",
          "roundConversion": {
            "scope": "Defense",
            "value": 52.43,
            "sample": "230,391 active-season defense full-buy rounds",
            "comparisonLabel": "Second sniper",
            "comparisonWeapon": "Outlaw",
            "comparisonValue": 44.64
          },
          "conversion": "Conversion read: the Operator wins the defense-side sniper comparison; Judge or Bucky only catches up inside a deliberately protected Tunnel or Hall pocket.",
          "note": "On defense, the map gives repeated long-lane shots. Mobility or teleport tools make the weapon safer after contact."
        },
        {
          "weapon": "Ghost",
          "image": "/assets/weapons/ghost.png",
          "category": "pistol",
          "fit": "Highest pistol conversion",
          "locations": "A Main, Mid, B Main",
          "roundConversion": {
            "scope": "Combined",
            "value": 50.64,
            "sample": "2,791,564 active-season pistol rounds",
            "comparisonLabel": "Second pistol",
            "comparisonWeapon": "Sheriff",
            "comparisonValue": 50.21
          },
          "note": "Use cover and first-shot accuracy across Breeze's long pistol lanes while preserving credits for utility."
        },
        {
          "weapon": "Judge",
          "image": "/assets/weapons/judge.png",
          "category": "shotgun",
          "fit": "Best shotgun conversion",
          "side": "DEF",
          "locations": "A Hall, B Tunnel",
          "roundConversion": {
            "scope": "Defense",
            "value": 48.24,
            "sample": "27,678 active-season defense full-buy rounds",
            "comparisonLabel": "Second shotgun",
            "comparisonWeapon": "Bucky",
            "comparisonValue": 44.24
          },
          "conversion": "Conversion read: the shotgun remains location-dependent and cannot match the Operator across Breeze's open sites.",
          "note": "On defense, treat it as a protected Hall or Tunnel ambush, then recover a ranged weapon before rotating into open space."
        },
        {
          "weapon": "Spectre",
          "image": "/assets/weapons/spectre.png",
          "category": "eco",
          "fit": "Highest eco conversion",
          "locations": "Tunnel and close Hall pockets",
          "roundConversion": {
            "scope": "Combined",
            "value": 33.61,
            "sample": "128,040 active-season second-round-loss rounds",
            "comparisonLabel": "Second SMG",
            "comparisonWeapon": "Stinger",
            "comparisonValue": 29.69
          },
          "note": "Use it with a deliberate close-range route; most Breeze fights still expose an SMG's range limit."
        }
      ],
      "macro": {
        "_researchNote": "internal only, do not render",
        "_researchUrl": "https://www.youtube.com/watch?v=0VLyBGR5sNA",
        "defense": [
          "Mid is the strategic core of this map — mid control is less about the space itself and more about the pressure it lets you apply to both sites at once."
        ],
        "attack": [
          "Smoking Mid Nest removes the Operator angle that otherwise dominates that lane — a specific, repeatable utility play, not just a generic smoke.",
          "Smoking Tunnel forces defenders into a binary choice: play the tunnel more aggressively than they'd like, or fall back and give up the space."
        ]
      },
      "siteTips": [
        {
          "label": "A Pyramids",
          "text": "Split the two pyramids into separate clears. Plant only after the close side and Back Site lane have been accounted for.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Bridge",
          "text": "Keep Bridge denied during the plant; its elevation watches both the site crossing and several pyramid plants.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        },
        {
          "label": "B Pillar",
          "text": "Use Pillar to isolate the first defender, then clear Back Site before spreading into the open plant lanes.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "B Tunnel",
          "text": "Tunnel control shortens the defender rotation and protects a B split, but only if the Mid player can be traded.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Mid leverage",
          "text": "Keep one player connected to Mid while the site group pressures Main; that threat prevents both defenders from leaning into one entrance."
        },
        {
          "label": "Long trades",
          "text": "Breeze spacing stretches trade distance. Say who follows the first contact before crossing an open lane."
        },
        {
          "label": "Late information",
          "text": "Save one scan, camera, or flank trap for the rotation because a wrong site read costs more time here than on compact maps."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Use movement to cross the long exposed lanes after recon or a flash removes the first angle."
          },
          {
            "category": "attack",
            "text": "Create pressure from Mid or Hall so defenders cannot hold one site entrance with every rifle."
          },
          {
            "category": "defense",
            "text": "Operator rounds need a planned escape route; do not repeat the same long angle after revealing the weapon."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Scan or drone the long sightline the duelist is about to cross, not the site after contact begins."
          },
          {
            "category": "sites",
            "text": "Use Mid Nest, Tunnel, Back Site, and Hall as named utility targets so the team knows what is actually cleared."
          },
          {
            "category": "teamplay",
            "text": "Save one information tool for the late rotation because the distance between sites makes false reads expensive."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "Viper-style walls are strongest when they split a site into a playable front half and an isolated defender half."
          },
          {
            "category": "attack",
            "text": "Remove Mid Nest or Tunnel when taking center control; both positions can hold multiple rotation paths."
          },
          {
            "category": "teamplay",
            "text": "Prioritize complete lane denial and fuel timing over difficult one-way setups on Breeze's open geometry."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Use flank utility to protect the long rotations, then survive so that information remains useful."
          },
          {
            "category": "defense",
            "text": "Anchor from off-angles that force attackers to clear after crossing open ground."
          },
          {
            "category": "defense",
            "text": "Do not stack every piece of utility on one site when Mid pressure can break the setup from behind."
          }
        ]
      },
      "metaComp": {
        "agents": [
          "Chamber",
          "Clove",
          "Jett",
          "Reyna",
          "Sova"
        ],
        "composition": "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel",
        "patch": "13.01 + 13.00"
      },
      "metaComps": [
        {
          "label": "Double-duelist layout",
          "agents": [
            "Chamber",
            "Clove",
            "Jett",
            "Reyna",
            "Sova"
          ],
          "composition": "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel"
        },
        {
          "label": "Double-controller layout",
          "agents": [
            "Chamber",
            "Clove",
            "Jett",
            "Sova",
            "Viper"
          ],
          "composition": "2 Controllers, 1 Duelist, 1 Initiator, 1 Sentinel"
        },
        {
          "label": "Double-controller + double-initiator",
          "agents": [
            "Clove",
            "Jett",
            "KAY/O",
            "Sova",
            "Viper"
          ],
          "composition": "2 Controllers, 1 Duelist, 2 Initiators"
        }
      ],
      "compSample": {
        "rankLabel": "Ascendant to Radiant",
        "patchLabel": "13.01 + 13.00",
        "currentPatchAgentSelections": 4324,
        "combinedAgentSelections": 631146,
        "source": "OP.GG Competitive",
        "note": "OP.GG Competitive Ascendant+ map picks from Patch 13.01 are combined with Patch 13.00 because the current high-rank window is still small. Percentages are individual agent pick share within the combined Ascendant-to-Radiant map sample; no five-agent lineup win rate is claimed."
      },
      "highRankPickRates": {
        "Chamber": 16.09,
        "Clove": 8.55,
        "Iso": 1.32,
        "Jett": 18.47,
        "KAY/O": 0.52,
        "Neon": 3.74,
        "Reyna": 11.15,
        "Sova": 17.13,
        "Viper": 6.92
      },
      "rolePickRates": [
        {
          "agent": "Astra",
          "role": "Controller",
          "mapRate": 3.89,
          "globalRate": 0.84
        },
        {
          "agent": "Breach",
          "role": "Initiator",
          "mapRate": 0.07,
          "globalRate": 0.68
        },
        {
          "agent": "Brimstone",
          "role": "Controller",
          "mapRate": 0.21,
          "globalRate": 0.25
        },
        {
          "agent": "Chamber",
          "role": "Sentinel",
          "mapRate": 16.09,
          "globalRate": 8.72
        },
        {
          "agent": "Clove",
          "role": "Controller",
          "mapRate": 8.55,
          "globalRate": 14.46
        },
        {
          "agent": "Cypher",
          "role": "Sentinel",
          "mapRate": 1.27,
          "globalRate": 4.5
        },
        {
          "agent": "Deadlock",
          "role": "Sentinel",
          "mapRate": 0.15,
          "globalRate": 0.58
        },
        {
          "agent": "Fade",
          "role": "Initiator",
          "mapRate": 0.14,
          "globalRate": 4.6
        },
        {
          "agent": "Gekko",
          "role": "Initiator",
          "mapRate": 0.17,
          "globalRate": 0.42
        },
        {
          "agent": "Harbor",
          "role": "Controller",
          "mapRate": 2.06,
          "globalRate": 0.4
        },
        {
          "agent": "Iso",
          "role": "Duelist",
          "mapRate": 1.32,
          "globalRate": 0.95
        },
        {
          "agent": "Jett",
          "role": "Duelist",
          "mapRate": 18.47,
          "globalRate": 15.62
        },
        {
          "agent": "KAY/O",
          "role": "Initiator",
          "mapRate": 0.52,
          "globalRate": 0.43
        },
        {
          "agent": "Killjoy",
          "role": "Sentinel",
          "mapRate": 0.06,
          "globalRate": 2.61
        },
        {
          "agent": "Miks",
          "role": "Controller",
          "mapRate": 0.91,
          "globalRate": 0.91
        },
        {
          "agent": "Neon",
          "role": "Duelist",
          "mapRate": 3.74,
          "globalRate": 3.35
        },
        {
          "agent": "Omen",
          "role": "Controller",
          "mapRate": 1.39,
          "globalRate": 3.08
        },
        {
          "agent": "Phoenix",
          "role": "Duelist",
          "mapRate": 1.88,
          "globalRate": 5.17
        },
        {
          "agent": "Raze",
          "role": "Duelist",
          "mapRate": 0.23,
          "globalRate": 3.5
        },
        {
          "agent": "Reyna",
          "role": "Duelist",
          "mapRate": 11.15,
          "globalRate": 9.11
        },
        {
          "agent": "Sage",
          "role": "Sentinel",
          "mapRate": 0.53,
          "globalRate": 1.74
        },
        {
          "agent": "Skye",
          "role": "Initiator",
          "mapRate": 0.47,
          "globalRate": 2.52
        },
        {
          "agent": "Sova",
          "role": "Initiator",
          "mapRate": 17.13,
          "globalRate": 9.49
        },
        {
          "agent": "Tejo",
          "role": "Initiator",
          "mapRate": 0.11,
          "globalRate": 0.47
        },
        {
          "agent": "Veto",
          "role": "Sentinel",
          "mapRate": 0.38,
          "globalRate": 0.61
        },
        {
          "agent": "Viper",
          "role": "Controller",
          "mapRate": 6.92,
          "globalRate": 1.22
        },
        {
          "agent": "Vyse",
          "role": "Sentinel",
          "mapRate": 0.17,
          "globalRate": 1.34
        },
        {
          "agent": "Waylay",
          "role": "Duelist",
          "mapRate": 1.24,
          "globalRate": 1.87
        },
        {
          "agent": "Yoru",
          "role": "Duelist",
          "mapRate": 0.77,
          "globalRate": 0.56
        }
      ],
      "agentInsights": {
        "Chamber": "Trademark protects the long flank while Rendezvous supports aggressive Operator holds; B has the stronger current defensive success in this sample.",
        "Clove": "Long-range smoke placement stays useful through Breeze rotations, and post-death utility protects late hits.",
        "Jett": "Dash and Updraft create a safe exit from the long Operator lanes that define first contact.",
        "Neon": "High Gear closes Breeze's long gaps quickly enough to punish defenders before cross-map help arrives.",
        "Reyna": "Dismiss gives a self-sufficient escape after winning one of Breeze's exposed long-range duels.",
        "Iso": "Double Tap and Contingency help isolate one long sightline instead of fighting the full open site.",
        "KAY/O": "ZERO/point and suppression give the second-initiator layout a direct way to disable defensive utility before crossing Breeze's long lanes.",
        "Sova": "Recon and Drone clear wide sightlines where close-range flashes cannot cover every defender.",
        "Sage": "Barrier and Slow Orbs compress open entrances; A is the stronger current anchor site for her stall package.",
        "Viper": "Toxic Screen divides the open sites into playable halves and preserves fuel for post-plant denial."
      },
      "lineupLinks": [
        {
          "label": "LineupsValorant — Breeze",
          "url": "https://lineupsvalorant.com/"
        },
        {
          "label": "UpForge Lineup Library — Breeze",
          "url": "https://upforge.gg/lineups"
        }
      ],
      "uuid": "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
      "coordinates": "26°11'AG\"N 71°10'WY\"W",
      "calloutLabelsBakedIn": true,
      "source": "https://valorant-api.com/v1/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "corrode",
      "label": "Corrode",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/displayicon.png",
      "callouts": [
        {
          "id": "corrode-1",
          "sourceKey": "A::Crane",
          "sourceLabel": "A Crane",
          "label": "A Crane",
          "superRegionName": "A",
          "regionName": "Crane",
          "x": 24.62,
          "y": 18.79
        },
        {
          "id": "corrode-2",
          "sourceKey": "A::Elbow",
          "sourceLabel": "A Elbow",
          "label": "A Elbow",
          "superRegionName": "A",
          "regionName": "Elbow",
          "x": 38.09,
          "y": 10.92
        },
        {
          "id": "corrode-3",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 45.27,
          "y": 37.52
        },
        {
          "id": "corrode-4",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 70.82,
          "y": 19.67
        },
        {
          "id": "corrode-5",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 61.19,
          "y": 8.47
        },
        {
          "id": "corrode-6",
          "sourceKey": "A::Pocket",
          "sourceLabel": "A Pocket",
          "label": "A Pocket",
          "superRegionName": "A",
          "regionName": "Pocket",
          "x": 47.02,
          "y": 10.92
        },
        {
          "id": "corrode-7",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 39.84,
          "y": 25.79
        },
        {
          "id": "corrode-8",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 92.34,
          "y": 50.18
        },
        {
          "id": "corrode-9",
          "sourceKey": "A::Yard",
          "sourceLabel": "A Yard",
          "label": "A Yard",
          "superRegionName": "A",
          "regionName": "Yard",
          "x": 47.02,
          "y": 19.67
        },
        {
          "id": "corrode-10",
          "sourceKey": "B::Arch",
          "sourceLabel": "B Arch",
          "label": "B Arch",
          "superRegionName": "B",
          "regionName": "Arch",
          "x": 21.82,
          "y": 72.52
        },
        {
          "id": "corrode-11",
          "sourceKey": "B::Elbow",
          "sourceLabel": "B Elbow",
          "label": "B Elbow",
          "superRegionName": "B",
          "regionName": "Elbow",
          "x": 32.14,
          "y": 89.14
        },
        {
          "id": "corrode-12",
          "sourceKey": "B::Link",
          "sourceLabel": "B Link",
          "label": "B Link",
          "superRegionName": "B",
          "regionName": "Link",
          "x": 39.84,
          "y": 59.04
        },
        {
          "id": "corrode-13",
          "sourceKey": "B::Lobby",
          "sourceLabel": "B Lobby",
          "label": "B Lobby",
          "superRegionName": "B",
          "regionName": "Lobby",
          "x": 72.04,
          "y": 61.67
        },
        {
          "id": "corrode-14",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 57.87,
          "y": 69.02
        },
        {
          "id": "corrode-15",
          "sourceKey": "Mid::Bottom",
          "sourceLabel": "Mid Bottom",
          "label": "Mid Bottom",
          "superRegionName": "Mid",
          "regionName": "Bottom",
          "x": 53.84,
          "y": 49.07
        },
        {
          "id": "corrode-16",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 44.39,
          "y": 69.02
        },
        {
          "id": "corrode-17",
          "sourceKey": "B::Tower",
          "sourceLabel": "B Tower",
          "label": "B Tower",
          "superRegionName": "B",
          "regionName": "Tower",
          "x": 32.14,
          "y": 74.62
        },
        {
          "id": "corrode-18",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 12.37,
          "y": 49.94
        },
        {
          "id": "corrode-19",
          "sourceKey": "Mid::Stairs",
          "sourceLabel": "Mid Stairs",
          "label": "Mid Stairs",
          "superRegionName": "Mid",
          "regionName": "Stairs",
          "x": 42.29,
          "y": 49.07
        },
        {
          "id": "corrode-20",
          "sourceKey": "Mid::Window",
          "sourceLabel": "Mid Window",
          "label": "Mid Window",
          "superRegionName": "Mid",
          "regionName": "Window",
          "x": 30.92,
          "y": 49.07
        },
        {
          "id": "corrode-21",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 39.84,
          "y": 49.07
        }
      ],
      "plantSpots": [],
      "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
      "weaponSuggestions": [],
      "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "metaComp": {
        "agents": [],
        "composition": "No verified current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
      "agentInsights": {},
      "lineupLinks": [],
      "source": "https://valorant-api.com/v1/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115?language=en-US",
      "uuid": "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
      "coordinates": "48° 38' FH\" N8, 1° 33' YV\" W8",
      "calloutLabelsBakedIn": false,
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "fracture",
      "label": "Fracture",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/displayicon.png",
      "callouts": [
        {
          "id": "fracture-1",
          "sourceKey": "Attacker Side::Bridge",
          "sourceLabel": "Attacker Side Bridge",
          "label": "Attacker Side Bridge",
          "superRegionName": "Attacker Side",
          "regionName": "Bridge",
          "x": 49.8,
          "y": 12.6
        },
        {
          "id": "fracture-2",
          "sourceKey": "B::Bench",
          "sourceLabel": "B Bench",
          "label": "B Bench",
          "superRegionName": "B",
          "regionName": "Bench",
          "x": 33.1,
          "y": 26.1
        },
        {
          "id": "fracture-3",
          "sourceKey": "B::Arcade",
          "sourceLabel": "B Arcade",
          "label": "B Arcade",
          "superRegionName": "B",
          "regionName": "Arcade",
          "x": 23.1,
          "y": 36.18
        },
        {
          "id": "fracture-4",
          "sourceKey": "B::Tower",
          "sourceLabel": "B Tower",
          "label": "B Tower",
          "superRegionName": "B",
          "regionName": "Tower",
          "x": 12.01,
          "y": 44.18
        },
        {
          "id": "fracture-5",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 9.35,
          "y": 51.8
        },
        {
          "id": "fracture-6",
          "sourceKey": "B::Generator",
          "sourceLabel": "B Generator",
          "label": "B Generator",
          "superRegionName": "B",
          "regionName": "Generator",
          "x": 29.33,
          "y": 50.36
        },
        {
          "id": "fracture-7",
          "sourceKey": "B::Link",
          "sourceLabel": "B Link",
          "label": "B Link",
          "superRegionName": "B",
          "regionName": "Link",
          "x": 34.32,
          "y": 43.84
        },
        {
          "id": "fracture-8",
          "sourceKey": "B::Canteen",
          "sourceLabel": "B Canteen",
          "label": "B Canteen",
          "superRegionName": "B",
          "regionName": "Canteen",
          "x": 31.22,
          "y": 60.12
        },
        {
          "id": "fracture-9",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 65.85,
          "y": 48.68
        },
        {
          "id": "fracture-10",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 50.41,
          "y": 44.17
        },
        {
          "id": "fracture-11",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 14.02,
          "y": 69.05
        },
        {
          "id": "fracture-12",
          "sourceKey": "B::Tree",
          "sourceLabel": "B Tree",
          "label": "B Tree",
          "superRegionName": "B",
          "regionName": "Tree",
          "x": 23.64,
          "y": 76.86
        },
        {
          "id": "fracture-13",
          "sourceKey": "B::Tunnel",
          "sourceLabel": "B Tunnel",
          "label": "B Tunnel",
          "superRegionName": "B",
          "regionName": "Tunnel",
          "x": 24.04,
          "y": 57.85
        },
        {
          "id": "fracture-14",
          "sourceKey": "A::Hall",
          "sourceLabel": "A Hall",
          "label": "A Hall",
          "superRegionName": "A",
          "regionName": "Hall",
          "x": 71.74,
          "y": 76.09
        },
        {
          "id": "fracture-15",
          "sourceKey": "A::Door",
          "sourceLabel": "A Door",
          "label": "A Door",
          "superRegionName": "A",
          "regionName": "Door",
          "x": 70.83,
          "y": 70.29
        },
        {
          "id": "fracture-16",
          "sourceKey": "A::Rope",
          "sourceLabel": "A Rope",
          "label": "A Rope",
          "superRegionName": "A",
          "regionName": "Rope",
          "x": 63.91,
          "y": 63.81
        },
        {
          "id": "fracture-17",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 82.61,
          "y": 69.73
        },
        {
          "id": "fracture-18",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 82.01,
          "y": 52.21
        },
        {
          "id": "fracture-19",
          "sourceKey": "A::Drop",
          "sourceLabel": "A Drop",
          "label": "A Drop",
          "superRegionName": "A",
          "regionName": "Drop",
          "x": 77.74,
          "y": 43
        },
        {
          "id": "fracture-20",
          "sourceKey": "A::Dish",
          "sourceLabel": "A Dish",
          "label": "A Dish",
          "superRegionName": "A",
          "regionName": "Dish",
          "x": 66.55,
          "y": 27.47
        },
        {
          "id": "fracture-21",
          "sourceKey": "A::Gate",
          "sourceLabel": "A Gate",
          "label": "A Gate",
          "superRegionName": "A",
          "regionName": "Gate",
          "x": 67.9,
          "y": 14.48
        },
        {
          "id": "fracture-22",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 48.3,
          "y": 81.69
        }
      ],
      "plantSpots": [],
      "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
      "weaponSuggestions": [],
      "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "metaComp": {
        "agents": [],
        "composition": "No verified current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
      "agentInsights": {},
      "lineupLinks": [],
      "source": "https://valorant-api.com/v1/maps/b529448b-4d60-346e-e89e-00a4c527a405?language=en-US",
      "uuid": "b529448b-4d60-346e-e89e-00a4c527a405",
      "coordinates": "35°48'BI\"N 106°08'YQ\"W",
      "calloutLabelsBakedIn": false,
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "haven",
      "label": "Haven",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/displayicon.png",
      "callouts": [
        {
          "id": "haven-1",
          "sourceKey": "A::Garden",
          "sourceLabel": "A Garden",
          "label": "A Garden",
          "superRegionName": "A",
          "regionName": "Garden",
          "x": 74.22,
          "y": 41.02
        },
        {
          "id": "haven-2",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 28.98,
          "y": 32.44
        },
        {
          "id": "haven-3",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 62.39,
          "y": 38.48
        },
        {
          "id": "haven-4",
          "sourceKey": "A::Long",
          "sourceLabel": "A Long",
          "label": "A Long",
          "superRegionName": "A",
          "regionName": "Long",
          "x": 57.59,
          "y": 17.7
        },
        {
          "id": "haven-5",
          "sourceKey": "A::Sewer",
          "sourceLabel": "A Sewer",
          "label": "A Sewer",
          "superRegionName": "A",
          "regionName": "Sewer",
          "x": 49.98,
          "y": 38.38
        },
        {
          "id": "haven-6",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 40.15,
          "y": 16.95
        },
        {
          "id": "haven-7",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 89.52,
          "y": 51.21
        },
        {
          "id": "haven-8",
          "sourceKey": "B::Back",
          "sourceLabel": "B Back",
          "label": "B Back",
          "superRegionName": "B",
          "regionName": "Back",
          "x": 29.36,
          "y": 49.53
        },
        {
          "id": "haven-9",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 40.11,
          "y": 50.14
        },
        {
          "id": "haven-10",
          "sourceKey": "C::Link",
          "sourceLabel": "C Link",
          "label": "C Link",
          "superRegionName": "C",
          "regionName": "Link",
          "x": 34.31,
          "y": 64.93
        },
        {
          "id": "haven-11",
          "sourceKey": "C::Lobby",
          "sourceLabel": "C Lobby",
          "label": "C Lobby",
          "superRegionName": "C",
          "regionName": "Lobby",
          "x": 66.44,
          "y": 76.59
        },
        {
          "id": "haven-12",
          "sourceKey": "C::Long",
          "sourceLabel": "C Long",
          "label": "C Long",
          "superRegionName": "C",
          "regionName": "Long",
          "x": 64.41,
          "y": 89.45
        },
        {
          "id": "haven-13",
          "sourceKey": "C::Garage",
          "sourceLabel": "C Garage",
          "label": "C Garage",
          "superRegionName": "C",
          "regionName": "Garage",
          "x": 49.35,
          "y": 62.92
        },
        {
          "id": "haven-14",
          "sourceKey": "C::Window",
          "sourceLabel": "C Window",
          "label": "C Window",
          "superRegionName": "C",
          "regionName": "Window",
          "x": 41.9,
          "y": 64.35
        },
        {
          "id": "haven-15",
          "sourceKey": "C::Site",
          "sourceLabel": "C Site",
          "label": "C Site",
          "superRegionName": "C",
          "regionName": "Site",
          "x": 41.77,
          "y": 82.11
        },
        {
          "id": "haven-16",
          "sourceKey": "C::Cubby",
          "sourceLabel": "C Cubby",
          "label": "C Cubby",
          "superRegionName": "C",
          "regionName": "Cubby",
          "x": 60.13,
          "y": 80.17
        },
        {
          "id": "haven-17",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 13.98,
          "y": 42.18
        },
        {
          "id": "haven-18",
          "sourceKey": "Mid::Doors",
          "sourceLabel": "Mid Doors",
          "label": "Mid Doors",
          "superRegionName": "Mid",
          "regionName": "Doors",
          "x": 62.37,
          "y": 63.14
        },
        {
          "id": "haven-19",
          "sourceKey": "Mid::Courtyard",
          "sourceLabel": "Mid Courtyard",
          "label": "Mid Courtyard",
          "superRegionName": "Mid",
          "regionName": "Courtyard",
          "x": 59,
          "y": 50.61
        },
        {
          "id": "haven-20",
          "sourceKey": "Mid::Window",
          "sourceLabel": "Mid Window",
          "label": "Mid Window",
          "superRegionName": "Mid",
          "regionName": "Window",
          "x": 67.59,
          "y": 49.65
        },
        {
          "id": "haven-21",
          "sourceKey": "A::Tower",
          "sourceLabel": "A Tower",
          "label": "A Tower",
          "superRegionName": "A",
          "regionName": "Tower",
          "x": 30.8,
          "y": 13.86
        }
      ],
      "plantSpots": [],
      "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
      "weaponSuggestions": [],
      "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "metaComp": {
        "agents": [],
        "composition": "No verified current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
      "agentInsights": {},
      "lineupLinks": [],
      "source": "https://valorant-api.com/v1/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047?language=en-US",
      "uuid": "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
      "coordinates": "27°28'A'N,89°38'WZ'E",
      "calloutLabelsBakedIn": false,
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "icebox",
      "label": "Icebox",
      "uuid": "e2ad5c54-4114-a870-9641-8ea21279579a",
      "coordinates": "76°44' A\"N 149°30' Z\"E",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/displayicon.png",
      "calloutLabelsBakedIn": false,
      "callouts": [
        {
          "id": "icebox-1",
          "sourceKey": "B::Garage",
          "sourceLabel": "B Garage",
          "label": "B Garage",
          "superRegionName": "B",
          "regionName": "Garage",
          "x": 35.76,
          "y": 39.47
        },
        {
          "id": "icebox-2",
          "sourceKey": "A::Belt",
          "sourceLabel": "A Belt",
          "label": "A Belt",
          "superRegionName": "A",
          "regionName": "Belt",
          "x": 39.9,
          "y": 82.31
        },
        {
          "id": "icebox-3",
          "sourceKey": "A::Nest",
          "sourceLabel": "A Nest",
          "label": "A Nest",
          "superRegionName": "A",
          "regionName": "Nest",
          "x": 52.5,
          "y": 78.35
        },
        {
          "id": "icebox-4",
          "sourceKey": "A::Pipes",
          "sourceLabel": "A Pipes",
          "label": "A Pipes",
          "superRegionName": "A",
          "regionName": "Pipes",
          "x": 49.26,
          "y": 74.75
        },
        {
          "id": "icebox-5",
          "sourceKey": "A::Rafters",
          "sourceLabel": "A Rafters",
          "label": "A Rafters",
          "superRegionName": "A",
          "regionName": "Rafters",
          "x": 76.62,
          "y": 76.91
        },
        {
          "id": "icebox-6",
          "sourceKey": "A::Screen",
          "sourceLabel": "A Screen",
          "label": "A Screen",
          "superRegionName": "A",
          "regionName": "Screen",
          "x": 69.96,
          "y": 67.19
        },
        {
          "id": "icebox-7",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 69.06,
          "y": 76.55
        },
        {
          "id": "icebox-8",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 13.98,
          "y": 58.73
        },
        {
          "id": "icebox-9",
          "sourceKey": "B::Yellow",
          "sourceLabel": "B Yellow",
          "label": "B Yellow",
          "superRegionName": "B",
          "regionName": "Yellow",
          "x": 45.84,
          "y": 15.71
        },
        {
          "id": "icebox-10",
          "sourceKey": "B::Back",
          "sourceLabel": "B Back",
          "label": "B Back",
          "superRegionName": "B",
          "regionName": "Back",
          "x": 76.76,
          "y": 28.66
        },
        {
          "id": "icebox-11",
          "sourceKey": "B::Cubby",
          "sourceLabel": "B Cubby",
          "label": "B Cubby",
          "superRegionName": "B",
          "regionName": "Cubby",
          "x": 39,
          "y": 22.91
        },
        {
          "id": "icebox-12",
          "sourceKey": "B::Green",
          "sourceLabel": "B Green",
          "label": "B Green",
          "superRegionName": "B",
          "regionName": "Green",
          "x": 40.98,
          "y": 33.71
        },
        {
          "id": "icebox-13",
          "sourceKey": "B::Hall",
          "sourceLabel": "B Hall",
          "label": "B Hall",
          "superRegionName": "B",
          "regionName": "Hall",
          "x": 67.98,
          "y": 28.31
        },
        {
          "id": "icebox-14",
          "sourceKey": "B::Hut",
          "sourceLabel": "B Hut",
          "label": "B Hut",
          "superRegionName": "B",
          "regionName": "Hut",
          "x": 77.7,
          "y": 40.73
        },
        {
          "id": "icebox-15",
          "sourceKey": "B::Kitchen",
          "sourceLabel": "B Kitchen",
          "label": "B Kitchen",
          "superRegionName": "B",
          "regionName": "Kitchen",
          "x": 70.53,
          "y": 46.46
        },
        {
          "id": "icebox-16",
          "sourceKey": "B::Orange",
          "sourceLabel": "B Orange",
          "label": "B Orange",
          "superRegionName": "B",
          "regionName": "Orange",
          "x": 58.26,
          "y": 35.02
        },
        {
          "id": "icebox-17",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 64.56,
          "y": 18.05
        },
        {
          "id": "icebox-18",
          "sourceKey": "B::Snowman",
          "sourceLabel": "B Snowman",
          "label": "B Snowman",
          "superRegionName": "B",
          "regionName": "Snowman",
          "x": 74.54,
          "y": 14.27
        },
        {
          "id": "icebox-19",
          "sourceKey": "B::Snow Pile",
          "sourceLabel": "B Snow Pile",
          "label": "B Snow Pile",
          "superRegionName": "B",
          "regionName": "Snow Pile",
          "x": 64.02,
          "y": 43.25
        },
        {
          "id": "icebox-20",
          "sourceKey": "B::Tube",
          "sourceLabel": "B Tube",
          "label": "B Tube",
          "superRegionName": "B",
          "regionName": "Tube",
          "x": 55.2,
          "y": 47.03
        },
        {
          "id": "icebox-21",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 96.96,
          "y": 57.47
        },
        {
          "id": "icebox-22",
          "sourceKey": "Mid::Blue",
          "sourceLabel": "Mid Blue",
          "label": "Mid Blue",
          "superRegionName": "Mid",
          "regionName": "Blue",
          "x": 53.04,
          "y": 50.81
        },
        {
          "id": "icebox-23",
          "sourceKey": "Mid::Boiler",
          "sourceLabel": "Mid Boiler",
          "label": "Mid Boiler",
          "superRegionName": "Mid",
          "regionName": "Boiler",
          "x": 67.08,
          "y": 54.77
        },
        {
          "id": "icebox-24",
          "sourceKey": "Mid::Pallet",
          "sourceLabel": "Mid Pallet",
          "label": "Mid Pallet",
          "superRegionName": "Mid",
          "regionName": "Pallet",
          "x": 58.8,
          "y": 62.51
        },
        {
          "id": "icebox-25",
          "sourceKey": "B::Fence",
          "sourceLabel": "B Fence",
          "label": "B Fence",
          "superRegionName": "B",
          "regionName": "Fence",
          "x": 71.91,
          "y": 27.86
        }
      ],
      "source": "https://valorant-api.com/v1/maps/e2ad5c54-4114-a870-9641-8ea21279579a?language=en-US",
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "lotus",
      "label": "Lotus",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/displayicon.png",
      "callouts": [
        {
          "id": "lotus-1",
          "sourceKey": "A::Top",
          "sourceLabel": "A Top",
          "label": "A Top",
          "superRegionName": "A",
          "regionName": "Top",
          "x": 81.81,
          "y": 25.1
        },
        {
          "id": "lotus-2",
          "sourceKey": "A::Drop",
          "sourceLabel": "A Drop",
          "label": "A Drop",
          "superRegionName": "A",
          "regionName": "Drop",
          "x": 89.35,
          "y": 23.26
        },
        {
          "id": "lotus-3",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 85.49,
          "y": 36.08
        },
        {
          "id": "lotus-4",
          "sourceKey": "A::Hut",
          "sourceLabel": "A Hut",
          "label": "A Hut",
          "superRegionName": "A",
          "regionName": "Hut",
          "x": 85.49,
          "y": 34.77
        },
        {
          "id": "lotus-5",
          "sourceKey": "A::Tree",
          "sourceLabel": "A Tree",
          "label": "A Tree",
          "superRegionName": "A",
          "regionName": "Tree",
          "x": 85.49,
          "y": 47.5
        },
        {
          "id": "lotus-6",
          "sourceKey": "A::Door",
          "sourceLabel": "A Door",
          "label": "A Door",
          "superRegionName": "A",
          "regionName": "Door",
          "x": 82.95,
          "y": 51.39
        },
        {
          "id": "lotus-7",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 75.43,
          "y": 53.7
        },
        {
          "id": "lotus-8",
          "sourceKey": "A::Rubble",
          "sourceLabel": "A Rubble",
          "label": "A Rubble",
          "superRegionName": "A",
          "regionName": "Rubble",
          "x": 80.89,
          "y": 60.09
        },
        {
          "id": "lotus-9",
          "sourceKey": "A::Root",
          "sourceLabel": "A Root",
          "label": "A Root",
          "superRegionName": "A",
          "regionName": "Root",
          "x": 69.2,
          "y": 60.09
        },
        {
          "id": "lotus-10",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 66.55,
          "y": 72.44
        },
        {
          "id": "lotus-11",
          "sourceKey": "C::Lobby",
          "sourceLabel": "C Lobby",
          "label": "C Lobby",
          "superRegionName": "C",
          "regionName": "Lobby",
          "x": 34.13,
          "y": 81.67
        },
        {
          "id": "lotus-12",
          "sourceKey": "B::Pillars",
          "sourceLabel": "B Pillars",
          "label": "B Pillars",
          "superRegionName": "B",
          "regionName": "Pillars",
          "x": 50.29,
          "y": 66.1
        },
        {
          "id": "lotus-13",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 45.13,
          "y": 56.66
        },
        {
          "id": "lotus-14",
          "sourceKey": "C::Door",
          "sourceLabel": "C Door",
          "label": "C Door",
          "superRegionName": "C",
          "regionName": "Door",
          "x": 32.86,
          "y": 57.08
        },
        {
          "id": "lotus-15",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 50.29,
          "y": 45.93
        },
        {
          "id": "lotus-16",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 60.51,
          "y": 48.5
        },
        {
          "id": "lotus-17",
          "sourceKey": "B::Upper",
          "sourceLabel": "B Upper",
          "label": "B Upper",
          "superRegionName": "B",
          "regionName": "Upper",
          "x": 56.4,
          "y": 36.46
        },
        {
          "id": "lotus-18",
          "sourceKey": "C::Waterfall",
          "sourceLabel": "C Waterfall",
          "label": "C Waterfall",
          "superRegionName": "C",
          "regionName": "Waterfall",
          "x": 31.12,
          "y": 43.39
        },
        {
          "id": "lotus-19",
          "sourceKey": "C::Link",
          "sourceLabel": "C Link",
          "label": "C Link",
          "superRegionName": "C",
          "regionName": "Link",
          "x": 35.56,
          "y": 37.75
        },
        {
          "id": "lotus-20",
          "sourceKey": "A::Stairs",
          "sourceLabel": "A Stairs",
          "label": "A Stairs",
          "superRegionName": "A",
          "regionName": "Stairs",
          "x": 73.28,
          "y": 32.32
        },
        {
          "id": "lotus-21",
          "sourceKey": "C::Mound",
          "sourceLabel": "C Mound",
          "label": "C Mound",
          "superRegionName": "C",
          "regionName": "Mound",
          "x": 34.13,
          "y": 63.96
        },
        {
          "id": "lotus-22",
          "sourceKey": "C::Main",
          "sourceLabel": "C Main",
          "label": "C Main",
          "superRegionName": "C",
          "regionName": "Main",
          "x": 22.81,
          "y": 53.53
        },
        {
          "id": "lotus-23",
          "sourceKey": "C::Bend",
          "sourceLabel": "C Bend",
          "label": "C Bend",
          "superRegionName": "C",
          "regionName": "Bend",
          "x": 7.45,
          "y": 51.04
        },
        {
          "id": "lotus-24",
          "sourceKey": "C::Site",
          "sourceLabel": "C Site",
          "label": "C Site",
          "superRegionName": "C",
          "regionName": "Site",
          "x": 14.76,
          "y": 43.7
        },
        {
          "id": "lotus-25",
          "sourceKey": "C::Hall",
          "sourceLabel": "C Hall",
          "label": "C Hall",
          "superRegionName": "C",
          "regionName": "Hall",
          "x": 14.76,
          "y": 34.88
        },
        {
          "id": "lotus-26",
          "sourceKey": "C::Gravel",
          "sourceLabel": "C Gravel",
          "label": "C Gravel",
          "superRegionName": "C",
          "regionName": "Gravel",
          "x": 32.86,
          "y": 27.43
        },
        {
          "id": "lotus-27",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 57.7,
          "y": 22.03
        },
        {
          "id": "lotus-28",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 51.08,
          "y": 81.69
        }
      ],
      "plantSpots": [],
      "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
      "weaponSuggestions": [],
      "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "metaComp": {
        "agents": [],
        "composition": "No verified current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
      "agentInsights": {},
      "lineupLinks": [],
      "source": "https://valorant-api.com/v1/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9?language=en-US",
      "uuid": "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
      "coordinates": "14°07'AD.4\"N8 74°53'XY\"E8",
      "calloutLabelsBakedIn": false,
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "pearl",
      "label": "Pearl",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/displayicon.png",
      "callouts": [
        {
          "id": "pearl-1",
          "sourceKey": "B::Hall",
          "sourceLabel": "B Hall",
          "label": "B Hall",
          "superRegionName": "B",
          "regionName": "Hall",
          "x": 9.4,
          "y": 33.14
        },
        {
          "id": "pearl-2",
          "sourceKey": "Mid::Doors",
          "sourceLabel": "Mid Doors",
          "label": "Mid Doors",
          "superRegionName": "Mid",
          "regionName": "Doors",
          "x": 52.71,
          "y": 54.93
        },
        {
          "id": "pearl-3",
          "sourceKey": "Mid::Connector",
          "sourceLabel": "Mid Connector",
          "label": "Mid Connector",
          "superRegionName": "Mid",
          "regionName": "Connector",
          "x": 62.09,
          "y": 44.43
        },
        {
          "id": "pearl-4",
          "sourceKey": "Defender Side::Water",
          "sourceLabel": "Defender Side Water",
          "label": "Defender Side Water",
          "superRegionName": "Defender Side",
          "regionName": "Water",
          "x": 62.09,
          "y": 30.7
        },
        {
          "id": "pearl-5",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 51,
          "y": 5.08
        },
        {
          "id": "pearl-6",
          "sourceKey": "A::Flowers",
          "sourceLabel": "A Flowers",
          "label": "A Flowers",
          "superRegionName": "A",
          "regionName": "Flowers",
          "x": 67.6,
          "y": 19.34
        },
        {
          "id": "pearl-7",
          "sourceKey": "A::Secret",
          "sourceLabel": "A Secret",
          "label": "A Secret",
          "superRegionName": "A",
          "regionName": "Secret",
          "x": 77.93,
          "y": 10.03
        },
        {
          "id": "pearl-8",
          "sourceKey": "A::Dugout",
          "sourceLabel": "A Dugout",
          "label": "A Dugout",
          "superRegionName": "A",
          "regionName": "Dugout",
          "x": 93.71,
          "y": 31.85
        },
        {
          "id": "pearl-9",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 91.49,
          "y": 40.01
        },
        {
          "id": "pearl-10",
          "sourceKey": "Defender Side::Records",
          "sourceLabel": "Defender Side Records",
          "label": "Defender Side Records",
          "superRegionName": "Defender Side",
          "regionName": "Records",
          "x": 36.58,
          "y": 21.61
        },
        {
          "id": "pearl-11",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 53.7,
          "y": 75.42
        },
        {
          "id": "pearl-12",
          "sourceKey": "B::Tunnel",
          "sourceLabel": "B Tunnel",
          "label": "B Tunnel",
          "superRegionName": "B",
          "regionName": "Tunnel",
          "x": 31.24,
          "y": 21.61
        },
        {
          "id": "pearl-13",
          "sourceKey": "B::Tower",
          "sourceLabel": "B Tower",
          "label": "B Tower",
          "superRegionName": "B",
          "regionName": "Tower",
          "x": 25.81,
          "y": 25.04
        },
        {
          "id": "pearl-14",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 77.88,
          "y": 41.93
        },
        {
          "id": "pearl-15",
          "sourceKey": "A::Restaurant",
          "sourceLabel": "A Restaurant",
          "label": "A Restaurant",
          "superRegionName": "A",
          "regionName": "Restaurant",
          "x": 69.99,
          "y": 57.04
        },
        {
          "id": "pearl-16",
          "sourceKey": "B::Link",
          "sourceLabel": "B Link",
          "label": "B Link",
          "superRegionName": "B",
          "regionName": "Link",
          "x": 43.43,
          "y": 56.48
        },
        {
          "id": "pearl-17",
          "sourceKey": "A::Art",
          "sourceLabel": "A Art",
          "label": "A Art",
          "superRegionName": "A",
          "regionName": "Art",
          "x": 74.62,
          "y": 56.02
        },
        {
          "id": "pearl-18",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 77.55,
          "y": 44.37
        },
        {
          "id": "pearl-19",
          "sourceKey": "Mid::Plaza",
          "sourceLabel": "Mid Plaza",
          "label": "Mid Plaza",
          "superRegionName": "Mid",
          "regionName": "Plaza",
          "x": 45.51,
          "y": 70.15
        },
        {
          "id": "pearl-20",
          "sourceKey": "Mid::Shops",
          "sourceLabel": "Mid Shops",
          "label": "Mid Shops",
          "superRegionName": "Mid",
          "regionName": "Shops",
          "x": 36.74,
          "y": 85.36
        },
        {
          "id": "pearl-21",
          "sourceKey": "B::Club",
          "sourceLabel": "B Club",
          "label": "B Club",
          "superRegionName": "B",
          "regionName": "Club",
          "x": 36.74,
          "y": 85.36
        },
        {
          "id": "pearl-22",
          "sourceKey": "B::Ramp",
          "sourceLabel": "B Ramp",
          "label": "B Ramp",
          "superRegionName": "B",
          "regionName": "Ramp",
          "x": 18.41,
          "y": 77.95
        },
        {
          "id": "pearl-23",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 13.92,
          "y": 60.01
        },
        {
          "id": "pearl-24",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 25.82,
          "y": 46.36
        },
        {
          "id": "pearl-25",
          "sourceKey": "B::Screen",
          "sourceLabel": "B Screen",
          "label": "B Screen",
          "superRegionName": "B",
          "regionName": "Screen",
          "x": 9.04,
          "y": 42.77
        },
        {
          "id": "pearl-26",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 43.37,
          "y": 95.89
        }
      ],
      "plantSpots": [],
      "plantRateNote": "Riot's public map-content feed does not publish plant-location percentages, so no plant share is estimated.",
      "weaponSuggestions": [],
      "weaponSuggestionNote": "No verified active-season weapon conversion sample is attached to this map dossier.",
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "metaComp": {
        "agents": [],
        "composition": "No verified current ranked composition sample",
        "patch": "13.01"
      },
      "metaComps": [],
      "compStatus": "Riot's public content feed does not publish measured five-agent composition win rates, so no lineup percentage is claimed.",
      "agentInsights": {},
      "lineupLinks": [],
      "source": "https://valorant-api.com/v1/maps/fd267378-4d1d-484f-ff52-77821ed10dc2?language=en-US",
      "uuid": "fd267378-4d1d-484f-ff52-77821ed10dc2",
      "coordinates": "38°42'ED\"N8 9°08'XS\"W8",
      "calloutLabelsBakedIn": false,
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "split",
      "label": "Split",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
      "layoutImage": "/assets/library/maps/split-layout-trn.png",
      "callouts": [
        {
          "id": "split-1",
          "sourceKey": "A::Back",
          "sourceLabel": "A Back",
          "label": "A Back",
          "superRegionName": "A",
          "regionName": "Back",
          "x": 22.93,
          "y": 12.47
        },
        {
          "id": "split-2",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 65.05,
          "y": 16.61
        },
        {
          "id": "split-3",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 49.17,
          "y": 20.77
        },
        {
          "id": "split-4",
          "sourceKey": "A::Rafters",
          "sourceLabel": "A Rafters",
          "label": "A Rafters",
          "superRegionName": "A",
          "regionName": "Rafters",
          "x": 35.4,
          "y": 27.37
        },
        {
          "id": "split-5",
          "sourceKey": "A::Ramps",
          "sourceLabel": "A Ramps",
          "label": "A Ramps",
          "superRegionName": "A",
          "regionName": "Ramps",
          "x": 47.17,
          "y": 35.98
        },
        {
          "id": "split-6",
          "sourceKey": "A::Screens",
          "sourceLabel": "A Screens",
          "label": "A Screens",
          "superRegionName": "A",
          "regionName": "Screens",
          "x": 15.04,
          "y": 25.7
        },
        {
          "id": "split-7",
          "sourceKey": "A::Sewer",
          "sourceLabel": "A Sewer",
          "label": "A Sewers",
          "superRegionName": "A",
          "regionName": "Sewer",
          "x": 65.75,
          "y": 31.83
        },
        {
          "id": "split-8",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 31.48,
          "y": 18.37
        },
        {
          "id": "split-9",
          "sourceKey": "A::Tower",
          "sourceLabel": "A Tower",
          "label": "A Heaven",
          "superRegionName": "A",
          "regionName": "Tower",
          "x": 31.58,
          "y": 33.59
        },
        {
          "id": "split-10",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 84.68,
          "y": 54.92
        },
        {
          "id": "split-11",
          "sourceKey": "B::Alley",
          "sourceLabel": "B Alley",
          "label": "B Alley",
          "superRegionName": "B",
          "regionName": "Alley",
          "x": 21.3,
          "y": 78.79
        },
        {
          "id": "split-12",
          "sourceKey": "B::Back",
          "sourceLabel": "B Back",
          "label": "B Back",
          "superRegionName": "B",
          "regionName": "Back",
          "x": 26.36,
          "y": 93.99
        },
        {
          "id": "split-13",
          "sourceKey": "B::Link",
          "sourceLabel": "B Link",
          "label": "B Link",
          "superRegionName": "B",
          "regionName": "Link",
          "x": 65.73,
          "y": 69.97
        },
        {
          "id": "split-14",
          "sourceKey": "B::Garage",
          "sourceLabel": "B Garage",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Garage",
          "x": 54.2,
          "y": 86.85
        },
        {
          "id": "split-15",
          "sourceKey": "B::Rafters",
          "sourceLabel": "B Rafters",
          "label": "B Rafters",
          "superRegionName": "B",
          "regionName": "Rafters",
          "x": 36.87,
          "y": 74.73
        },
        {
          "id": "split-16",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 35.35,
          "y": 86.66
        },
        {
          "id": "split-17",
          "sourceKey": "B::Stairs",
          "sourceLabel": "B Stairs",
          "label": "B Stairs",
          "superRegionName": "B",
          "regionName": "Stairs",
          "x": 31.48,
          "y": 61.48
        },
        {
          "id": "split-18",
          "sourceKey": "B::Tower",
          "sourceLabel": "B Tower",
          "label": "B Heaven",
          "superRegionName": "B",
          "regionName": "Tower",
          "x": 42.96,
          "y": 68.44
        },
        {
          "id": "split-19",
          "sourceKey": "B::Lobby",
          "sourceLabel": "B Lobby",
          "label": "B Lobby",
          "superRegionName": "B",
          "regionName": "Lobby",
          "x": 68.75,
          "y": 79.68
        },
        {
          "id": "split-20",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 14.29,
          "y": 53.05
        },
        {
          "id": "split-21",
          "sourceKey": "Mid::Bottom",
          "sourceLabel": "Mid Bottom",
          "label": "Mid Bottom",
          "superRegionName": "Mid",
          "regionName": "Bottom",
          "x": 61.6,
          "y": 54.76
        },
        {
          "id": "split-22",
          "sourceKey": "Mid::Mail",
          "sourceLabel": "Mid Mail",
          "label": "Mid Mail",
          "superRegionName": "Mid",
          "regionName": "Mail",
          "x": 46.71,
          "y": 60.75
        },
        {
          "id": "split-23",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 48.36,
          "y": 53.99
        },
        {
          "id": "split-24",
          "sourceKey": "Mid::Vent",
          "sourceLabel": "Mid Vent",
          "label": "Mid Vents",
          "superRegionName": "Mid",
          "regionName": "Vent",
          "x": 42.58,
          "y": 45.15
        }
      ],
      "plantSpots": [
        {
          "number": 1,
          "site": "A",
          "label": "A Default",
          "rate": 15.39,
          "x": 84.3,
          "y": 29.6,
          "previewLabel": "A Default in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/b99bab902f64289dcade6a53f141639c33ac3a1e-1466x646.jpg?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 2,
          "site": "A",
          "label": "A Screens Plant",
          "rate": 4.83,
          "x": 93.6,
          "y": 25.4,
          "previewLabel": "A lower-site in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/ab0936e9b7742f98920efa81852740809650bad4-733x646.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 3,
          "site": "A",
          "label": "A Open Plant",
          "rate": 18.58,
          "x": 92.6,
          "y": 33.8,
          "previewLabel": "A open corner in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/3d2a7e4491b82d82be503ab28141c932658a3ff1-733x646.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 1,
          "site": "B",
          "label": "B Open Plant",
          "rate": 26.94,
          "x": 11.1,
          "y": 29.6,
          "previewLabel": "B Main plant in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/ded16cdf2c51e60bfbaa8e80dd40740610dee46f-663x653.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        },
        {
          "number": 2,
          "site": "B",
          "label": "B Default",
          "rate": 53.76,
          "x": 12.3,
          "y": 34.4,
          "previewLabel": "B Default in-game reference",
          "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/73c66772d5104035c44ce207d3b7ad4a827d6a15-663x653.png?auto=format",
          "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
        }
      ],
      "plantRateNote": "Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive.",
      "weaponSuggestions": [
        {
          "weapon": "Phantom",
          "image": "/assets/weapons/phantom.png",
          "category": "rifle",
          "fit": "Highest rifle conversion",
          "locations": "A Main, B Main, Vents, Mail",
          "roundConversion": {
            "scope": "Combined",
            "value": 51.18,
            "sample": "1,385,619 active-season full-buy rounds",
            "comparisonLabel": "Second rifle",
            "comparisonWeapon": "Vandal",
            "comparisonValue": 50.26
          },
          "note": "Split's compact chokes and smoke-heavy site fights reward the Phantom's close-range control."
        },
        {
          "weapon": "Operator",
          "image": "/assets/weapons/operator.png",
          "category": "sniper",
          "fit": "Conditional sniper",
          "side": "DEF",
          "locations": "A Ramps, B Main, Mid",
          "roundConversion": {
            "scope": "Defense",
            "value": 54.62,
            "sample": "158,318 active-season defense full-buy rounds",
            "comparisonLabel": "Second sniper",
            "comparisonWeapon": "Outlaw",
            "comparisonValue": 46.61
          },
          "conversion": "Conversion read: excellent for the opening lane, but Judge and Bucky gain value after attackers enter Split's tight towers, vents, and site pockets.",
          "note": "On defense, take the opening pick beside an exit. Do not drag the slow cycle into a forced close retake."
        },
        {
          "weapon": "Ghost",
          "image": "/assets/weapons/ghost.png",
          "category": "pistol",
          "fit": "Highest pistol conversion",
          "locations": "A Main, Mid, B Main",
          "roundConversion": {
            "scope": "Combined",
            "value": 50.64,
            "sample": "2,851,065 active-season pistol rounds",
            "comparisonLabel": "Second pistol",
            "comparisonWeapon": "Frenzy",
            "comparisonValue": 50.59
          },
          "note": "Its first-shot accuracy covers the medium lanes without consuming the utility budget needed to break Split's chokes."
        },
        {
          "weapon": "Judge",
          "image": "/assets/weapons/judge.png",
          "category": "shotgun",
          "fit": "High close conversion",
          "side": "DEF",
          "locations": "B Tower, Vents, A Heaven",
          "roundConversion": {
            "scope": "Defense",
            "value": 49.84,
            "sample": "36,692 active-season defense full-buy rounds",
            "comparisonLabel": "Second shotgun",
            "comparisonWeapon": "Bucky",
            "comparisonValue": 46.08
          },
          "conversion": "Conversion read: the Judge is the stronger shotgun when the route forces repeated close fights, but loses value immediately if Mid or Main opens the range.",
          "note": "On defense, anchor one compact route, vary the corner, and plan how the weapon leaves the round after the first close duel."
        },
        {
          "weapon": "Spectre",
          "image": "/assets/weapons/spectre.png",
          "category": "eco",
          "fit": "Highest eco conversion",
          "locations": "B Tower, Vents, A Main",
          "roundConversion": {
            "scope": "Combined",
            "value": 33.75,
            "sample": "134,619 active-season second-round-loss rounds",
            "comparisonLabel": "Second SMG",
            "comparisonWeapon": "Stinger",
            "comparisonValue": 30.18
          },
          "note": "The compact corners suit the Spectre, but do not carry the setup into open Mid."
        }
      ],
      "macro": {
        "_researchNote": "internal only, do not render",
        "_researchUrl": "https://www.youtube.com/watch?v=I2kxN3-V4zg",
        "defense": [
          "Split's compact design means mid connects both sites more directly than on most maps — losing mid control lets attackers move and threaten either site quickly."
        ],
        "attack": [
          "A and B sites are small and sit at opposite ends of the map — a slow read on which site is live costs more here than on a map with a real mid buffer.",
          "Controlling the center is often the deciding factor for both attack and defense, since it enables fast movement between points and keeps the defense guessing."
        ]
      },
      "siteTips": [
        {
          "label": "A Site",
          "text": "Clear A Heaven and Screens as separate jobs before settling the plant; one smoke does not confirm either space is empty.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Ramps",
          "text": "Ramps control splits the defender's Heaven setup and gives the attack a safer route out of A Main.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        },
        {
          "label": "B Site",
          "text": "Pair B Main pressure with Mail or B Heaven utility so the entry is not fighting both elevations at once.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "B Alley",
          "text": "Keep the defender rotation lane blocked until the spike is secure, then shift the smoke or stall toward the retake choke.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Mid split",
          "text": "Treat Vents and Mail as two separate clears. The site group should wait until the Mid group can pressure the matching Heaven lane."
        },
        {
          "label": "Utility spacing",
          "text": "Compact sites amplify utility, but stacked tools can be cleared together. Leave enough distance that one grenade cannot erase the full setup."
        },
        {
          "label": "Retake reserve",
          "text": "Hold one flash, smoke, slow, or damage tool for the retake; Split's small sites let one late cast touch most of the fight."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Use movement or explosive utility to break the first choke at A Main, B Main, or Mid."
          },
          {
            "category": "sites",
            "text": "Take vertical space in A Heaven, B Heaven, Vents, and Mail after support utility forces defenders off the angle."
          },
          {
            "category": "defense",
            "text": "Pressure a choke only when you can fall back before the trade arrives."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Narrow lanes reward flashes, stuns, and damage utility that land immediately before the swing."
          },
          {
            "category": "sites",
            "text": "Clear A Heaven, Screens, B Heaven, Mail, and Vents as separate jobs instead of calling an entire site clear."
          },
          {
            "category": "defense",
            "text": "Hold one piece of retake utility because Split sites are compact enough for a single well-timed cast to change the round."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "On A, remove A Heaven and Screens; on B, remove B Heaven and the defender rotation lane."
          },
          {
            "category": "attack",
            "text": "Mid control usually needs a smoke at Mail or Vents so the team can fight one elevation at a time."
          },
          {
            "category": "teamplay",
            "text": "Use ledge one-ways only when the height is consistent and teammates know the exposed lane."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Trap the route that connects Mid to the site hit so defenders receive the rotation warning early."
          },
          {
            "category": "defense",
            "text": "Layer stall utility with enough spacing that one grenade cannot clear everything."
          },
          {
            "category": "defense",
            "text": "Rotate setups between B Main, Mid, and A Main pressure so attackers must re-clear the map each gun round."
          }
        ]
      },
      "metaComp": {
        "agents": [
          "Clove",
          "Cypher",
          "Jett",
          "Reyna",
          "Skye"
        ],
        "composition": "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel",
        "patch": "13.01 + 13.00"
      },
      "metaComps": [
        {
          "label": "Double-duelist layout",
          "agents": [
            "Clove",
            "Cypher",
            "Jett",
            "Reyna",
            "Skye"
          ],
          "composition": "1 Controller, 2 Duelists, 1 Initiator, 1 Sentinel"
        },
        {
          "label": "Double-initiator layout",
          "agents": [
            "Clove",
            "Cypher",
            "Fade",
            "Jett",
            "Skye"
          ],
          "composition": "1 Controller, 1 Duelist, 2 Initiators, 1 Sentinel"
        },
        {
          "label": "Double-sentinel layout",
          "agents": [
            "Clove",
            "Cypher",
            "Jett",
            "Sage",
            "Skye"
          ],
          "composition": "1 Controller, 1 Duelist, 1 Initiator, 2 Sentinels"
        }
      ],
      "compSample": {
        "rankLabel": "Ascendant to Radiant",
        "patchLabel": "13.01 + 13.00",
        "currentPatchAgentSelections": 4170,
        "combinedAgentSelections": 637716,
        "source": "OP.GG Competitive",
        "note": "OP.GG Competitive Ascendant+ map picks from Patch 13.01 are combined with Patch 13.00 because the current high-rank window is still small. Percentages are individual agent pick share within the combined Ascendant-to-Radiant map sample; no five-agent lineup win rate is claimed."
      },
      "highRankPickRates": {
        "Clove": 16.18,
        "Cypher": 6.88,
        "Fade": 4.49,
        "Jett": 14.04,
        "Neon": 2.45,
        "Raze": 7.84,
        "Reyna": 8.7,
        "Sage": 5.54,
        "Skye": 11.07
      },
      "rolePickRates": [
        {
          "agent": "Astra",
          "role": "Controller",
          "mapRate": 0.3,
          "globalRate": 0.84
        },
        {
          "agent": "Breach",
          "role": "Initiator",
          "mapRate": 1.12,
          "globalRate": 0.68
        },
        {
          "agent": "Brimstone",
          "role": "Controller",
          "mapRate": 0.24,
          "globalRate": 0.25
        },
        {
          "agent": "Chamber",
          "role": "Sentinel",
          "mapRate": 5.64,
          "globalRate": 8.72
        },
        {
          "agent": "Clove",
          "role": "Controller",
          "mapRate": 16.18,
          "globalRate": 14.46
        },
        {
          "agent": "Cypher",
          "role": "Sentinel",
          "mapRate": 6.88,
          "globalRate": 4.5
        },
        {
          "agent": "Deadlock",
          "role": "Sentinel",
          "mapRate": 0.63,
          "globalRate": 0.58
        },
        {
          "agent": "Fade",
          "role": "Initiator",
          "mapRate": 4.49,
          "globalRate": 4.6
        },
        {
          "agent": "Gekko",
          "role": "Initiator",
          "mapRate": 0.14,
          "globalRate": 0.42
        },
        {
          "agent": "Harbor",
          "role": "Controller",
          "mapRate": 0.05,
          "globalRate": 0.4
        },
        {
          "agent": "Iso",
          "role": "Duelist",
          "mapRate": 0.65,
          "globalRate": 0.95
        },
        {
          "agent": "Jett",
          "role": "Duelist",
          "mapRate": 14.04,
          "globalRate": 15.62
        },
        {
          "agent": "KAY/O",
          "role": "Initiator",
          "mapRate": 0.29,
          "globalRate": 0.43
        },
        {
          "agent": "Killjoy",
          "role": "Sentinel",
          "mapRate": 0.69,
          "globalRate": 2.61
        },
        {
          "agent": "Miks",
          "role": "Controller",
          "mapRate": 0.97,
          "globalRate": 0.91
        },
        {
          "agent": "Neon",
          "role": "Duelist",
          "mapRate": 2.45,
          "globalRate": 3.35
        },
        {
          "agent": "Omen",
          "role": "Controller",
          "mapRate": 2.75,
          "globalRate": 3.08
        },
        {
          "agent": "Phoenix",
          "role": "Duelist",
          "mapRate": 3.35,
          "globalRate": 5.17
        },
        {
          "agent": "Raze",
          "role": "Duelist",
          "mapRate": 7.84,
          "globalRate": 3.5
        },
        {
          "agent": "Reyna",
          "role": "Duelist",
          "mapRate": 8.7,
          "globalRate": 9.11
        },
        {
          "agent": "Sage",
          "role": "Sentinel",
          "mapRate": 5.54,
          "globalRate": 1.74
        },
        {
          "agent": "Skye",
          "role": "Initiator",
          "mapRate": 11.07,
          "globalRate": 2.52
        },
        {
          "agent": "Sova",
          "role": "Initiator",
          "mapRate": 0.48,
          "globalRate": 9.49
        },
        {
          "agent": "Tejo",
          "role": "Initiator",
          "mapRate": 0.62,
          "globalRate": 0.47
        },
        {
          "agent": "Veto",
          "role": "Sentinel",
          "mapRate": 0.74,
          "globalRate": 0.61
        },
        {
          "agent": "Viper",
          "role": "Controller",
          "mapRate": 0.7,
          "globalRate": 1.22
        },
        {
          "agent": "Vyse",
          "role": "Sentinel",
          "mapRate": 0.81,
          "globalRate": 1.34
        },
        {
          "agent": "Waylay",
          "role": "Duelist",
          "mapRate": 2.11,
          "globalRate": 1.87
        },
        {
          "agent": "Yoru",
          "role": "Duelist",
          "mapRate": 0.55,
          "globalRate": 0.56
        }
      ],
      "agentInsights": {
        "Clove": "Fast smokes cover Mail, Vents, and either Heaven while the team changes direction through Mid.",
        "Jett": "Dash breaks the first compact choke and Updraft contests Split's stacked Heaven positions.",
        "Raze": "Paint Shells and Blast Packs punish Split's compact chokes and vertical defender pockets.",
        "Neon": "Fast Lane and High Gear turn a Mid opening into site pressure before defenders reset their vertical crossfires.",
        "Reyna": "Dismiss lets her escape the close first duel, but the comp still relies on Skye to make that fight favorable.",
        "Skye": "Guiding Light bends through Split's tight corners and Trailblazer clears the close pockets before both duelists commit.",
        "Fade": "Prowlers clear close corners while Haunt confirms the stacked vertical positions around Mid.",
        "Sage": "Wall and Slow Orbs delay narrow site entrances; B currently gives her the higher anchor conversion.",
        "Cypher": "Trips control Mid-to-site rotations and let the anchor survive instead of guessing which choke broke."
      },
      "lineupLinks": [
        {
          "label": "LineupsValorant — Split",
          "url": "https://lineupsvalorant.com/"
        },
        {
          "label": "UpForge Lineup Library — Split",
          "url": "https://upforge.gg/lineups"
        }
      ],
      "uuid": "d960549e-485c-e861-8d71-aa9d1aed12a2",
      "coordinates": "35°41'CD'N,139°41'WX'E",
      "calloutLabelsBakedIn": true,
      "source": "https://valorant-api.com/v1/maps/d960549e-485c-e861-8d71-aa9d1aed12a2?language=en-US",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "summit",
      "label": "Summit",
      "uuid": "756da597-416b-c0f2-f47b-afbdf28670bc",
      "coordinates": "29° 18' FC\" N, 110° 25' ZQ\" E",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/displayicon.png",
      "calloutLabelsBakedIn": false,
      "callouts": [
        {
          "id": "summit-1",
          "sourceKey": "Mid::Bottom",
          "sourceLabel": "Mid Bottom",
          "label": "Mid Bottom",
          "superRegionName": "Mid",
          "regionName": "Bottom",
          "x": 48.43,
          "y": 41.64
        },
        {
          "id": "summit-2",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 53.68,
          "y": 67.7
        },
        {
          "id": "summit-3",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 69.43,
          "y": 74.08
        },
        {
          "id": "summit-4",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 69.43,
          "y": 56.64
        },
        {
          "id": "summit-5",
          "sourceKey": "A::Garden",
          "sourceLabel": "A Garden",
          "label": "A Garden",
          "superRegionName": "A",
          "regionName": "Garden",
          "x": 79.18,
          "y": 40.33
        },
        {
          "id": "summit-6",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 91.74,
          "y": 40.33
        },
        {
          "id": "summit-7",
          "sourceKey": "A::Art",
          "sourceLabel": "A Art",
          "label": "A Art",
          "superRegionName": "A",
          "regionName": "Art",
          "x": 79.18,
          "y": 26.45
        },
        {
          "id": "summit-8",
          "sourceKey": "A::Cave",
          "sourceLabel": "A Cave",
          "label": "A Cave",
          "superRegionName": "A",
          "regionName": "Cave",
          "x": 95.68,
          "y": 26.45
        },
        {
          "id": "summit-9",
          "sourceKey": "A::Hall",
          "sourceLabel": "A Hall",
          "label": "A Hall",
          "superRegionName": "A",
          "regionName": "Hall",
          "x": 69.24,
          "y": 26.45
        },
        {
          "id": "summit-10",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 65.12,
          "y": 36.01
        },
        {
          "id": "summit-11",
          "sourceKey": "B::Lobby",
          "sourceLabel": "B Lobby",
          "label": "B Lobby",
          "superRegionName": "B",
          "regionName": "Lobby",
          "x": 28.93,
          "y": 59.45
        },
        {
          "id": "summit-12",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 51.05,
          "y": 7.33
        },
        {
          "id": "summit-13",
          "sourceKey": "Mid::Window",
          "sourceLabel": "Mid Window",
          "label": "Mid Window",
          "superRegionName": "Mid",
          "regionName": "Window",
          "x": 48.43,
          "y": 32.64
        },
        {
          "id": "summit-14",
          "sourceKey": "B::Gym",
          "sourceLabel": "B Gym",
          "label": "B Gym",
          "superRegionName": "B",
          "regionName": "Gym",
          "x": 27.99,
          "y": 18.95
        },
        {
          "id": "summit-15",
          "sourceKey": "B::Trophy",
          "sourceLabel": "B Trophy",
          "label": "B Trophy",
          "superRegionName": "B",
          "regionName": "Trophy",
          "x": 32.3,
          "y": 29.83
        },
        {
          "id": "summit-16",
          "sourceKey": "B::Tower",
          "sourceLabel": "B Tower",
          "label": "B Tower",
          "superRegionName": "B",
          "regionName": "Tower",
          "x": 15.62,
          "y": 21.58
        },
        {
          "id": "summit-17",
          "sourceKey": "B::Drop",
          "sourceLabel": "B Drop",
          "label": "B Drop",
          "superRegionName": "B",
          "regionName": "Drop",
          "x": 5.3,
          "y": 24.01
        },
        {
          "id": "summit-18",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 15.05,
          "y": 33.76
        },
        {
          "id": "summit-19",
          "sourceKey": "B::Link",
          "sourceLabel": "B Link",
          "label": "B Link",
          "superRegionName": "B",
          "regionName": "Link",
          "x": 33.05,
          "y": 41.64
        },
        {
          "id": "summit-20",
          "sourceKey": "Mid::Fountain",
          "sourceLabel": "Mid Fountain",
          "label": "Mid Fountain",
          "superRegionName": "Mid",
          "regionName": "Fountain",
          "x": 51.05,
          "y": 55.33
        },
        {
          "id": "summit-21",
          "sourceKey": "Mid::Bend",
          "sourceLabel": "Mid Bend",
          "label": "Mid Bend",
          "superRegionName": "Mid",
          "regionName": "Bend",
          "x": 63.62,
          "y": 49.33
        },
        {
          "id": "summit-22",
          "sourceKey": "Mid::Tiles",
          "sourceLabel": "Mid Tiles",
          "label": "Mid Tiles",
          "superRegionName": "Mid",
          "regionName": "Tiles",
          "x": 36.49,
          "y": 60.68
        },
        {
          "id": "summit-23",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 18.62,
          "y": 49.14
        },
        {
          "id": "summit-24",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 3.99,
          "y": 89.64
        }
      ],
      "source": "https://valorant-api.com/v1/maps/756da597-416b-c0f2-f47b-afbdf28670bc?language=en-US",
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    },
    {
      "id": "sunset",
      "label": "Sunset",
      "uuid": "92584fbe-486a-b1b2-9faa-39b0f486b498",
      "coordinates": "34° 2′ C″ N, 118° 12′ YT″ W",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
      "layoutImage": "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/displayicon.png",
      "calloutLabelsBakedIn": false,
      "callouts": [
        {
          "id": "sunset-1",
          "sourceKey": "B::Boba",
          "sourceLabel": "B Boba",
          "label": "B Boba",
          "superRegionName": "B",
          "regionName": "Boba",
          "x": 12.56,
          "y": 34.4
        },
        {
          "id": "sunset-2",
          "sourceKey": "Mid::Tiles",
          "sourceLabel": "Mid Tiles",
          "label": "Mid Tiles",
          "superRegionName": "Mid",
          "regionName": "Tiles",
          "x": 53.12,
          "y": 65.6
        },
        {
          "id": "sunset-3",
          "sourceKey": "B::Market",
          "sourceLabel": "B Market",
          "label": "B Market",
          "superRegionName": "B",
          "regionName": "Market",
          "x": 23.48,
          "y": 53.12
        },
        {
          "id": "sunset-4",
          "sourceKey": "B::Site",
          "sourceLabel": "B Site",
          "label": "B Site",
          "superRegionName": "B",
          "regionName": "Site",
          "x": 4.37,
          "y": 56.24
        },
        {
          "id": "sunset-5",
          "sourceKey": "B::Main",
          "sourceLabel": "B Main",
          "label": "B Main",
          "superRegionName": "B",
          "regionName": "Main",
          "x": 5.93,
          "y": 67.16
        },
        {
          "id": "sunset-6",
          "sourceKey": "B::Lobby",
          "sourceLabel": "B Lobby",
          "label": "B Lobby",
          "superRegionName": "B",
          "regionName": "Lobby",
          "x": 29.72,
          "y": 78.08
        },
        {
          "id": "sunset-7",
          "sourceKey": "Mid::Bottom",
          "sourceLabel": "Mid Bottom",
          "label": "Mid Bottom",
          "superRegionName": "Mid",
          "regionName": "Bottom",
          "x": 34.2,
          "y": 65.6
        },
        {
          "id": "sunset-8",
          "sourceKey": "Mid::Courtyard",
          "sourceLabel": "Mid Courtyard",
          "label": "Mid Courtyard",
          "superRegionName": "Mid",
          "regionName": "Courtyard",
          "x": 40.64,
          "y": 56.24
        },
        {
          "id": "sunset-9",
          "sourceKey": "A::Lobby",
          "sourceLabel": "A Lobby",
          "label": "A Lobby",
          "superRegionName": "A",
          "regionName": "Lobby",
          "x": 65.6,
          "y": 65.6
        },
        {
          "id": "sunset-10",
          "sourceKey": "A::Main",
          "sourceLabel": "A Main",
          "label": "A Main",
          "superRegionName": "A",
          "regionName": "Main",
          "x": 67.16,
          "y": 54.68
        },
        {
          "id": "sunset-11",
          "sourceKey": "A::Link",
          "sourceLabel": "A Link",
          "label": "A Link",
          "superRegionName": "A",
          "regionName": "Link",
          "x": 73.4,
          "y": 34.4
        },
        {
          "id": "sunset-12",
          "sourceKey": "A::Site",
          "sourceLabel": "A Site",
          "label": "A Site",
          "superRegionName": "A",
          "regionName": "Site",
          "x": 74.96,
          "y": 43.76
        },
        {
          "id": "sunset-13",
          "sourceKey": "A::Elbow",
          "sourceLabel": "A Elbow",
          "label": "A Elbow",
          "superRegionName": "A",
          "regionName": "Elbow",
          "x": 82.76,
          "y": 50
        },
        {
          "id": "sunset-14",
          "sourceKey": "A::Alley",
          "sourceLabel": "A Alley",
          "label": "A Alley",
          "superRegionName": "A",
          "regionName": "Alley",
          "x": 78.08,
          "y": 25.04
        },
        {
          "id": "sunset-15",
          "sourceKey": "Defender Side::Spawn",
          "sourceLabel": "Defender Side Spawn",
          "label": "Defender Side Spawn",
          "superRegionName": "Defender Side",
          "regionName": "Spawn",
          "x": 34.49,
          "y": 21.88
        },
        {
          "id": "sunset-16",
          "sourceKey": "Mid::Top",
          "sourceLabel": "Mid Top",
          "label": "Mid Top",
          "superRegionName": "Mid",
          "regionName": "Top",
          "x": 34.4,
          "y": 35.96
        },
        {
          "id": "sunset-17",
          "sourceKey": "Attacker Side::Spawn",
          "sourceLabel": "Attacker Side Spawn",
          "label": "Attacker Side Spawn",
          "superRegionName": "Attacker Side",
          "regionName": "Spawn",
          "x": 46.88,
          "y": 98.56
        }
      ],
      "source": "https://valorant-api.com/v1/maps/92584fbe-486a-b1b2-9faa-39b0f486b498?language=en-US",
      "dataStatus": "in-review",
      "lastReviewed": "2026-07-23",
      "patchVersion": "13.01"
    }
  ],
  "weapons": [
    {
      "groupId": "machine-guns",
      "patch": {
        "id": "ares",
        "label": "Ares",
        "uuid": "55d8a0f4-4274-ca67-fe2c-06ab45efdf58",
        "image": "https://media.valorant-api.com/weapons/55d8a0f4-4274-ca67-fe2c-06ab45efdf58/displayicon.png",
        "cost": 1600,
        "magazine": 50,
        "fireRate": "13 rounds/sec",
        "penetration": "High",
        "damageRanges": [
          {
            "range": "0-30m",
            "head": 75,
            "body": 30,
            "legs": 25.5
          },
          {
            "range": "30-50m",
            "head": 70,
            "body": 28,
            "legs": 23.8
          }
        ],
        "source": "https://valorant-api.com/v1/weapons/55d8a0f4-4274-ca67-fe2c-06ab45efdf58?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "sidearms",
      "patch": {
        "id": "bandit",
        "label": "Bandit",
        "uuid": "410b2e0b-4ceb-1321-1727-20858f7f3477",
        "image": "https://media.valorant-api.com/weapons/410b2e0b-4ceb-1321-1727-20858f7f3477/displayicon.png",
        "cost": 600,
        "magazine": 8,
        "fireRate": "5.1 rounds/sec",
        "penetration": "Medium",
        "damageRanges": [
          {
            "range": "0-10m",
            "head": 152,
            "body": 39,
            "legs": 33
          },
          {
            "range": "10-30m",
            "head": 128,
            "body": 39,
            "legs": 33
          },
          {
            "range": "30-50m",
            "head": 112,
            "body": 34,
            "legs": 28
          }
        ],
        "source": "https://valorant-api.com/v1/weapons/410b2e0b-4ceb-1321-1727-20858f7f3477?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "shotguns",
      "patch": {
        "id": "bucky",
        "label": "Bucky",
        "image": "https://media.valorant-api.com/weapons/910be174-449b-c412-ab22-d0873436b21b/displayicon.png",
        "cost": 850,
        "magazine": 5,
        "fireRate": "1.1 rounds/sec",
        "penetration": "Low",
        "damageRanges": [
          {
            "range": "0-8m",
            "head": 34,
            "body": 17,
            "legs": 14
          },
          {
            "range": "8-12m",
            "head": 26,
            "body": 13,
            "legs": 11.05
          },
          {
            "range": "12-50m",
            "head": 18,
            "body": 9,
            "legs": 7.65
          }
        ],
        "focus": "Damage is per pellet. Protect the close-range fight and do not expose the long recovery to a second enemy.",
        "whenToUse": [
          "Choose it for a low-cost close hold where one patient shot can recover a better weapon.",
          "It fits corners with hard cover that protect the long recovery after a miss."
        ],
        "howToUse": [
          "Stand still, let the target enter the first damage band, and center the body so enough pellets connect.",
          "Do not expose to a second enemy until the pump finishes; the weapon rewards one isolated fight at a time."
        ],
        "patchHistory": [
          {
            "patch": "3.00",
            "note": "Price fell from 900 to 850 credits.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "12.09",
            "note": "Close-range pellet damage fell from 40/20/17 to 34/17/14, minimum spread rose to 3.0, and moving spread increased.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
          }
        ],
        "pickRate": 1.1,
        "killConversion": 0.65,
        "roundConversion": "Available by buy type",
        "uuid": "910be174-449b-c412-ab22-d0873436b21b",
        "source": "https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "precision",
      "patch": {
        "id": "bulldog",
        "label": "Bulldog",
        "image": "https://media.valorant-api.com/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7/displayicon.png",
        "cost": 2050,
        "magazine": 24,
        "fireRate": "10 rounds/sec",
        "penetration": "Medium",
        "damageRanges": [
          {
            "range": "0-50m",
            "head": 115.5,
            "body": 35,
            "legs": 29.75
          }
        ],
        "focus": "Use alternate-fire bursts for planned mid-range fights and avoid forcing full-auto recoil at long range.",
        "whenToUse": [
          "Use it on a lighter rifle buy when the team still needs armor and utility.",
          "It works best on mid-range lanes where ADS burst gives a clean first engagement and full-auto protects a close collapse."
        ],
        "howToUse": [
          "Use ADS burst for a planned medium-to-long fight, then wait for the short recovery before the next burst.",
          "Switch to full-auto only when the opponent closes distance; do not drag the burst cadence into a long spray."
        ],
        "patchHistory": [
          {
            "patch": "3.00",
            "note": "Hip-fire rate rose from 9.15 to 9.5 rounds per second and price fell from 2100 to 2050.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "4.00",
            "note": "Hip-fire rate rose to 10 and burst recovery improved from 0.4 to 0.35 seconds.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-4-0/"
          },
          {
            "patch": "11.08",
            "note": "Horizontal recoil timing was lengthened from 0.37 to 0.6 seconds as rifle sprays were retuned.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
          }
        ],
        "pickRate": 3.5,
        "killConversion": 0.8,
        "roundConversion": "Available by buy type",
        "uuid": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
        "source": "https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "sidearms",
      "patch": {
        "id": "classic",
        "label": "Classic",
        "image": "https://media.valorant-api.com/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8/displayicon.png",
        "cost": 0,
        "magazine": 12,
        "fireRate": "6.75 rounds/sec",
        "penetration": "Low",
        "damageRanges": [
          {
            "range": "0-30m",
            "head": 78,
            "body": 26,
            "legs": 22.1
          },
          {
            "range": "30-50m",
            "head": 66,
            "body": 22,
            "legs": 18.7
          }
        ],
        "focus": "Use controlled taps at range, and do not sleep on the alt-fire. Its three-round burst stays accurate while jumping or running, which makes it a real close-range movement option.",
        "whenToUse": [
          "Keep it when utility matters more than a pistol upgrade, or when the round plan sets up a close, sudden right-click fight.",
          "Its free cost preserves the full 800-credit pistol-round budget."
        ],
        "howToUse": [
          "Tap with primary fire at range and let recoil settle before the next shot.",
          "Jump-peek tight corners with the alt-fire. Commit only when the full three-shot burst can land, or when a headshot plus one body shot can finish an unarmored target inside 30 meters."
        ],
        "patchHistory": [
          {
            "patch": "2.00",
            "note": "Jumping error for alternate fire rose from 0.4 to 1.0 and repeated right-click bursts gained a stronger recovery curve.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-2-0/"
          },
          {
            "patch": "3.00",
            "note": "Walking and running inaccuracy increased as Riot tightened moving sidearm fire.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          }
        ],
        "pickRate": 4.8,
        "killConversion": 0.72,
        "roundConversion": "Available by buy type",
        "uuid": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
        "source": "https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "sidearms",
      "patch": {
        "id": "frenzy",
        "label": "Frenzy",
        "image": "https://media.valorant-api.com/weapons/44d4e95c-4157-0037-81b2-17841bf2e8e3/displayicon.png",
        "cost": 450,
        "magazine": 15,
        "fireRate": "10 rounds/sec",
        "penetration": "Low",
        "damageRanges": [
          {
            "range": "0-20m",
            "head": 78,
            "body": 26,
            "legs": 22.1
          },
          {
            "range": "20-50m",
            "head": 63,
            "body": 21,
            "legs": 17.85
          }
        ],
        "focus": "Treat it like a compact SMG: close distance, control the short magazine, and avoid long-range tap races.",
        "whenToUse": [
          "Buy it for close pistol-round pressure or a save-round path that reaches SMG distance quickly.",
          "It pairs with agents who can cross open space before the 15-round magazine is committed."
        ],
        "howToUse": [
          "Crouch the moment you commit to a close fight; it tightens the spread noticeably, and the first three bullets stay close to perfectly accurate.",
          "Pre-fire the corner you are about to peek. The fire rate is high enough that starting your spray a beat early costs almost nothing and means your bullets are already tracking when the enemy appears."
        ],
        "patchHistory": [
          {
            "patch": "2.03",
            "note": "Price rose from 400 to 500 credits after the Frenzy crowded other pistol-round options.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-2-03/"
          },
          {
            "patch": "3.00",
            "note": "Price fell to 450 while walking and running inaccuracy increased.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "6.11",
            "note": "Minimum spread increased, maximum spread arrived in five bullets, and running recoil rose from 1.25x to 1.5x.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-6-11/"
          }
        ],
        "pickRate": 1.9,
        "killConversion": 0.53,
        "roundConversion": "Available by buy type",
        "uuid": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
        "source": "https://valorant-api.com/v1/weapons/44d4e95c-4157-0037-81b2-17841bf2e8e3?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "sidearms",
      "patch": {
        "id": "ghost",
        "label": "Ghost",
        "image": "https://media.valorant-api.com/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e/displayicon.png",
        "cost": 500,
        "magazine": 13,
        "fireRate": "6.75 rounds/sec",
        "penetration": "Medium",
        "damageRanges": [
          {
            "range": "0-30m",
            "head": 105,
            "body": 30,
            "legs": 25.5
          },
          {
            "range": "30-50m",
            "head": 87.5,
            "body": 25,
            "legs": 21.25
          }
        ],
        "focus": "Use the clean first shot and quiet profile for disciplined pistol-round picks; reset instead of panic-spamming.",
        "whenToUse": [
          "Choose it for quiet pistol-round taps, medium sightlines, and a utility-light 500-credit buy.",
          "It rewards first-shot accuracy against unarmored targets through 30 meters."
        ],
        "howToUse": [
          "Hold head height and commit to a tap or two. The spray stays close to a straight line through the first two or three bullets before it kicks, so you do not need a full reset between them.",
          "Use the silenced profile to take a first pick without broadcasting the exact lane through tracers."
        ],
        "patchHistory": [
          {
            "patch": "3.00",
            "note": "Walking inaccuracy rose from 0.25 to 0.92 and running inaccuracy from 1.85 to 2.3.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "6.11",
            "note": "Minimum spread on ropes rose from 0.35 to 0.6 as rope combat was made less reliable.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-6-11/"
          }
        ],
        "pickRate": 8.1,
        "killConversion": 0.6,
        "roundConversion": "Available by buy type",
        "uuid": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
        "source": "https://valorant-api.com/v1/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "precision",
      "patch": {
        "id": "guardian",
        "label": "Guardian",
        "image": "https://media.valorant-api.com/weapons/4ade7faa-4cf1-8376-95ef-39884480959b/displayicon.png",
        "cost": 2250,
        "magazine": 12,
        "fireRate": "5.25 rounds/sec",
        "penetration": "High",
        "damageRanges": [
          {
            "range": "0-50m",
            "head": 195,
            "body": 65,
            "legs": 48.75
          }
        ],
        "focus": "Treat every shot as a resettable single-fire decision; high penetration supports disciplined wallbangs.",
        "whenToUse": [
          "Buy it when head-level long lanes and high-penetration wallbangs are worth more than automatic fire.",
          "It is a deliberate mid-price rifle choice when armor and required utility still fit the team buy."
        ],
        "howToUse": [
          "Fire one settled shot at a time at range; at closer distances, keep a measured rhythm instead of panic-spamming.",
          "Hold narrow head-height lanes and use the high penetration only on confirmed common positions."
        ],
        "patchHistory": [
          {
            "patch": "1.08",
            "note": "Price fell from 2500 to 2400, fire rate rose from 4.75 to 5.25 rounds per second, and recovery improved.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-1-08/"
          },
          {
            "patch": "3.00",
            "note": "Price fell again, from 2400 to 2250 credits.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "4.00",
            "note": "The ADS fire-rate penalty was removed and one more shot was added before the recovery curve begins.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-4-0/"
          }
        ],
        "pickRate": 3.1,
        "killConversion": 0.86,
        "roundConversion": "Available by buy type",
        "uuid": "4ade7faa-4cf1-8376-95ef-39884480959b",
        "source": "https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "shotguns",
      "patch": {
        "id": "judge",
        "label": "Judge",
        "image": "https://media.valorant-api.com/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794/displayicon.png",
        "cost": 1850,
        "magazine": 5,
        "fireRate": "3.5 rounds/sec",
        "penetration": "Low",
        "damageRanges": [
          {
            "range": "0-10m",
            "head": 34,
            "body": 17,
            "legs": 14.45
          },
          {
            "range": "10-15m",
            "head": 20,
            "body": 10,
            "legs": 8.5
          },
          {
            "range": "15-50m",
            "head": 14,
            "body": 7,
            "legs": 5.95
          }
        ],
        "focus": "Damage is per pellet. Own a tight choke and have a route to recover a rifle after the first conversion.",
        "whenToUse": [
          "Hold a tight choke where enemies must enter inside the first damage band.",
          "Use it when an escape path or dropped-rifle upgrade is available after the first close kill."
        ],
        "howToUse": [
          "Set your feet before firing, center the full pellet pattern, and make the enemy clear into your range.",
          "Do not chase through open ground; reposition between shots so the magazine can cover more than one contact."
        ],
        "patchHistory": [
          {
            "patch": "3.00",
            "note": "Price rose from 1600 to 1850 and pellet damage at 10 and 15 meters was reduced.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "12.09",
            "note": "Minimum and movement spread increased, sharply reducing accuracy while walking, running, jumping, or using ropes.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
          }
        ],
        "pickRate": 2.2,
        "killConversion": 0.84,
        "roundConversion": "Available by buy type",
        "uuid": "ec845bf4-4f79-ddda-a3da-0db3774b2794",
        "source": "https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "snipers",
      "patch": {
        "id": "marshal",
        "label": "Marshal",
        "image": "https://media.valorant-api.com/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b/displayicon.png",
        "cost": 950,
        "magazine": 5,
        "fireRate": "1.5 rounds/sec",
        "penetration": "Medium",
        "damageRanges": [
          {
            "range": "0-50m",
            "head": 202,
            "body": 101,
            "legs": 85.85
          }
        ],
        "focus": "Use mobility and fast follow-up positioning to punish unarmored buys without overstaying a scoped lane.",
        "whenToUse": [
          "Buy it to punish unarmored or light-buy opponents without breaking the next rifle round.",
          "Its high scoped movement fits mobile long-lane picks and quick repositioning."
        ],
        "howToUse": [
          "Hold head height against full armor and accept body shots only when the enemy economy suggests no shields.",
          "Move after the first shot; the low price buys flexibility, not permission to repeat a revealed lane."
        ],
        "patchHistory": [
          {
            "patch": "2.03",
            "note": "Scoped movement rose from 76% to 90%, price fell from 1100 to 1000, and zoom increased from 2.5x to 3.5x.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-2-03/"
          },
          {
            "patch": "3.00",
            "note": "Price fell again, from 1000 to 950 credits.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          }
        ],
        "pickRate": 4.1,
        "killConversion": 0.68,
        "roundConversion": "Available by buy type",
        "uuid": "c4883e50-4494-202c-3ec3-6b8a9284f00b",
        "source": "https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "machine-guns",
      "patch": {
        "id": "odin",
        "label": "Odin",
        "uuid": "63e6c2b6-4a8e-869c-3d4c-e38355226584",
        "image": "https://media.valorant-api.com/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584/displayicon.png",
        "cost": 3200,
        "magazine": 100,
        "fireRate": "12 rounds/sec",
        "penetration": "High",
        "damageRanges": [
          {
            "range": "0-30m",
            "head": 95,
            "body": 38,
            "legs": 32.3
          },
          {
            "range": "30-50m",
            "head": 77.5,
            "body": 31,
            "legs": 26.35
          }
        ],
        "source": "https://valorant-api.com/v1/weapons/63e6c2b6-4a8e-869c-3d4c-e38355226584?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "snipers",
      "patch": {
        "id": "operator",
        "label": "Operator",
        "image": "https://media.valorant-api.com/weapons/a03b24d3-4319-996d-0f8c-94bbfba1dfc7/displayicon.png",
        "cost": 4700,
        "magazine": 5,
        "fireRate": "0.6 rounds/sec",
        "penetration": "High",
        "damageRanges": [
          {
            "range": "0-50m",
            "head": 255,
            "body": 150,
            "legs": 120
          }
        ],
        "focus": "Plan the escape before taking the shot. Missing without cover or movement utility exposes the weapon's slow cycle.",
        "whenToUse": [
          "Buy it when the economy can support the weapon and the round offers a long first-contact lane.",
          "Agents with an escape tool can take a more aggressive opening angle; everyone else needs hard cover beside the shot."
        ],
        "howToUse": [
          "Plan the escape before scoping, fire once, then reposition while the enemy spends utility on the old angle.",
          "Avoid unsupported repeeks: the slow cycle, movement speed, and equip timing all give opponents a punish window."
        ],
        "patchHistory": [
          {
            "patch": "1.09",
            "note": "Price rose from 4500 to 5000 while scoped movement, fire rate, equip time, and jump-land accuracy were all reduced.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-1-09/"
          },
          {
            "patch": "3.00",
            "note": "Price fell from 5000 to the current 4700 credits.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          }
        ],
        "pickRate": 5.8,
        "killConversion": 1.32,
        "roundConversion": "Available by buy type",
        "uuid": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
        "source": "https://valorant-api.com/v1/weapons/a03b24d3-4319-996d-0f8c-94bbfba1dfc7?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "snipers",
      "patch": {
        "id": "outlaw",
        "label": "Outlaw",
        "image": "https://media.valorant-api.com/weapons/5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c/displayicon.png",
        "cost": 2400,
        "magazine": 2,
        "fireRate": "2.75 rounds/sec",
        "penetration": "High",
        "damageRanges": [
          {
            "range": "0-50m",
            "head": 238,
            "body": 140,
            "legs": 119
          }
        ],
        "focus": "Punish light armor with a body shot and manage the two-round chamber as a paired burst, not an endless hold.",
        "whenToUse": [
          "Use it against likely light armor or when a 2400-credit sniper preserves the next full buy.",
          "Its rapid two-shot chamber can punish a second target or finish a tagged full-armor opponent."
        ],
        "howToUse": [
          "Treat the chamber as a two-shot plan: take the first body shot, correct quickly, then leave before the long full reload.",
          "Partial reloads are faster than replacing both shells, so track whether one shot remains before repeating the lane."
        ],
        "patchHistory": [
          {
            "patch": "8.00",
            "note": "The Outlaw entered the arsenal as a two-shot sniper built to sit between the Marshal and Operator in price and stopping power.",
            "source": "https://playvalorant.com/en-us/news/game-updates/a-new-addition-to-the-arsenal-outlaw-insights/"
          }
        ],
        "pickRate": 2.4,
        "killConversion": 0.91,
        "roundConversion": "Available by buy type",
        "uuid": "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c",
        "source": "https://valorant-api.com/v1/weapons/5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "rifles",
      "patch": {
        "id": "phantom",
        "label": "Phantom",
        "image": "https://media.valorant-api.com/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a/displayicon.png",
        "cost": 2900,
        "magazine": 30,
        "fireRate": "11 rounds/sec",
        "penetration": "Medium",
        "damageRanges": [
          {
            "range": "0-20m",
            "head": 156,
            "body": 39,
            "legs": 33.15
          },
          {
            "range": "20-50m",
            "head": 140,
            "body": 35,
            "legs": 29.75
          }
        ],
        "focus": "Higher fire rate and a silenced profile reward close-to-mid fights; respect the long-range headshot falloff.",
        "whenToUse": [
          "Choose it for close-to-mid fights, smoke spam, and positions where a silenced shot keeps your location less obvious.",
          "Its larger magazine and faster fire rate fit multi-target holds better than long one-tap lanes."
        ],
        "howToUse": [
          "Burst through mid range and lean on controlled sprays inside 20 meters, where a headshot still kills full armor.",
          "Respect the 20-meter headshot falloff and shorten the fight before challenging a Vandal on an open lane."
        ],
        "patchHistory": [
          {
            "patch": "6.11",
            "note": "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 90 to 60.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-6-11/"
          },
          {
            "patch": "11.08",
            "note": "Protected spray bullets rose from six to eight and horizontal recoil timing was retuned to make close-to-mid sprays more controllable.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
          }
        ],
        "pickRate": 21.2,
        "killConversion": 1.03,
        "roundConversion": "Available by buy type",
        "uuid": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
        "source": "https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "sidearms",
      "patch": {
        "id": "sheriff",
        "label": "Sheriff",
        "image": "https://media.valorant-api.com/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702/displayicon.png",
        "cost": 800,
        "magazine": 6,
        "fireRate": "4 rounds/sec",
        "penetration": "High",
        "damageRanges": [
          {
            "range": "0-30m",
            "head": 159.5,
            "body": 55,
            "legs": 46.75
          },
          {
            "range": "30-50m",
            "head": 145,
            "body": 50,
            "legs": 42.5
          }
        ],
        "focus": "Protect the 0-30m one-shot headshot range and let recoil settle. This is a stop-and-shoot weapon, not a flick gun.",
        "whenToUse": [
          "Buy it when an eco round needs one-shot headshot threat inside 30 meters.",
          "Its high penetration can punish a confirmed common wall position, but six rounds demand a planned exit."
        ],
        "howToUse": [
          "Stop moving before every shot and hold your crosshair at head height on likely angles before the enemy appears. The Sheriff punishes a late flick far more than it rewards one.",
          "If the target is moving or at range, two body shots beat forcing a low-percentage headshot. Do not spam after a miss; reset to cover and take the next deliberate shot."
        ],
        "patchHistory": [
          {
            "patch": "3.00",
            "note": "Walking inaccuracy rose from 0.25 to 1.2 and running inaccuracy from 2.0 to 3.0.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "6.11",
            "note": "Minimum spread on ropes rose from 0.35 to 0.78 as rope combat was made less reliable.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-6-11/"
          }
        ],
        "pickRate": 5.7,
        "killConversion": 0.66,
        "roundConversion": "Available by buy type",
        "uuid": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
        "source": "https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "shotguns",
      "patch": {
        "id": "shorty",
        "label": "Shorty",
        "image": "https://media.valorant-api.com/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda/displayicon.png",
        "cost": 300,
        "magazine": 2,
        "fireRate": "3 rounds/sec",
        "penetration": "Low",
        "damageRanges": [
          {
            "range": "0-7m",
            "head": 22,
            "body": 11,
            "legs": 9.35
          },
          {
            "range": "7-15m",
            "head": 12,
            "body": 6,
            "legs": 5.1
          },
          {
            "range": "15-50m",
            "head": 6,
            "body": 3,
            "legs": 2.55
          }
        ],
        "focus": "Damage is per pellet. Use it as a concealed close-corner answer, then immediately upgrade from the dropped weapon.",
        "whenToUse": [
          "Use it as a concealed sidearm for one close corner, often beside a rifle or Operator.",
          "It is a save-round ambush tool when the first contact can immediately yield an upgrade."
        ],
        "howToUse": [
          "Hide the weapon until the target fills the spread, stop moving, and commit both shells only if the first does not finish.",
          "After contact, take the dropped weapon or leave; two shells cannot hold an extended lane."
        ],
        "patchHistory": [
          {
            "patch": "6.11",
            "note": "Price rose from 150 to 300, reserve ammo fell from ten to six, and damage at the first two ranges was reduced.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-6-11/"
          },
          {
            "patch": "12.09",
            "note": "Fire rate fell from 3.33 to 3.0 and movement spread increased across walking, running, crouch-walking, jumping, and ropes.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-12-09/"
          }
        ],
        "pickRate": 1.5,
        "killConversion": 0.57,
        "roundConversion": "Available by buy type",
        "uuid": "42da8ccc-40d5-affc-beec-15aa47b42eda",
        "source": "https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "smgs",
      "patch": {
        "id": "spectre",
        "label": "Spectre",
        "image": "https://media.valorant-api.com/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7/displayicon.png",
        "cost": 1600,
        "magazine": 30,
        "fireRate": "13.333 rounds/sec",
        "penetration": "Low",
        "damageRanges": [
          {
            "range": "0-15m",
            "head": 78,
            "body": 26,
            "legs": 22.1
          },
          {
            "range": "15-30m",
            "head": 66,
            "body": 22,
            "legs": 18.7
          },
          {
            "range": "30-50m",
            "head": 60,
            "body": 20,
            "legs": 17
          }
        ],
        "focus": "Close distance and transfer through multiple targets; long-range rifle duels waste the weapon's mobility advantage.",
        "whenToUse": [
          "Choose it for anti-eco rounds, close site holds, and run paths that can avoid open rifle lanes.",
          "The 30-round magazine supports a controlled transfer when multiple lightly armed opponents collapse together."
        ],
        "howToUse": [
          "Close distance with cover, then use a compact spray and transfer; burst or disengage once the fight stretches beyond 15 meters.",
          "Movement is part of the weapon's identity, but stop for any fight where the first bullets must be dependable."
        ],
        "patchHistory": [
          {
            "patch": "4.00",
            "note": "Spray error began earlier, moving recoil multipliers rose from 1.25x to 1.5x, and protected spray bullets fell from eight to five.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-4-0/"
          },
          {
            "patch": "6.11",
            "note": "Running vertical recoil rose from 1.5x to 1.8x.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-6-11/"
          },
          {
            "patch": "11.08",
            "note": "Total spread fell from 1.5 to 1.3, tap efficiency rose from two to three, and protected bullets rose from four to five.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
          }
        ],
        "pickRate": 5.9,
        "killConversion": 0.78,
        "roundConversion": "Available by buy type",
        "uuid": "462080d1-4035-2937-7c09-27aa2a5c27a7",
        "source": "https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "smgs",
      "patch": {
        "id": "stinger",
        "label": "Stinger",
        "image": "https://media.valorant-api.com/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941/displayicon.png",
        "cost": 1100,
        "magazine": 20,
        "fireRate": "16 rounds/sec",
        "penetration": "Low",
        "damageRanges": [
          {
            "range": "0-15m",
            "head": 67.5,
            "body": 27,
            "legs": 22.95
          },
          {
            "range": "15-50m",
            "head": 57,
            "body": 23,
            "legs": 19
          }
        ],
        "focus": "Commit to close fights or controlled alternate-fire bursts. The magazine disappears quickly if the first transfer is late.",
        "whenToUse": [
          "Use it on a force or save where a close first kill can recover a rifle.",
          "It is strongest in tight corridors and fast contact plans where its low price and burst damage can matter immediately."
        ],
        "howToUse": [
          "Full-auto only at close range and control the first four-to-six bullets; the 20-round magazine disappears quickly.",
          "Use ADS burst for a measured mid-range chance, then reset instead of stacking inaccurate bursts."
        ],
        "patchHistory": [
          {
            "patch": "2.03",
            "note": "Price rose to 1100, full-auto fire rate fell from 18 to 16, and recoil became more aggressive after the third bullet.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-2-03/"
          },
          {
            "patch": "3.00",
            "note": "Price returned from 1100 to 950 credits.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-3-0/"
          },
          {
            "patch": "11.08",
            "note": "Full-auto spread rose from 1.3 to 1.5 and reached maximum spread one bullet sooner.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
          }
        ],
        "pickRate": 2.8,
        "killConversion": 0.69,
        "roundConversion": "Available by buy type",
        "uuid": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
        "source": "https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    },
    {
      "groupId": "rifles",
      "patch": {
        "id": "vandal",
        "label": "Vandal",
        "image": "https://media.valorant-api.com/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872/displayicon.png",
        "cost": 2900,
        "magazine": 25,
        "fireRate": "9.75 rounds/sec",
        "penetration": "Medium",
        "damageRanges": [
          {
            "range": "0-50m",
            "head": 160,
            "body": 40,
            "legs": 34
          }
        ],
        "focus": "No damage falloff. Favor clean taps and short bursts once the first controlled shots are gone.",
        "whenToUse": [
          "Choose it on full buys when long sightlines and one-shot headshots matter.",
          "Favor it when your plan includes disciplined taps, bursts, or medium-penetration spam through a known position."
        ],
        "howToUse": [
          "Tap at long range, use two-to-four-shot bursts at mid range, and commit to a spray only when the target is close enough to track.",
          "Stop before the first shot and reset after the controlled bullets; running recoil is deliberately harsher."
        ],
        "patchHistory": [
          {
            "patch": "1.07",
            "note": "Fire rate rose from 9.25 to 9.75 rounds per second and body damage rose from 39 to 40.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-1-07/"
          },
          {
            "patch": "6.11",
            "note": "Running vertical recoil rose from 1.5x to 1.8x and reserve ammo fell from 75 to 50.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-6-11/"
          },
          {
            "patch": "11.08",
            "note": "Protected spray bullets rose from four to six while horizontal recoil timing was retuned.",
            "source": "https://playvalorant.com/en-us/news/game-updates/valorant-patch-notes-11-08/"
          }
        ],
        "pickRate": 37.6,
        "killConversion": 1.01,
        "roundConversion": "Available by buy type",
        "uuid": "9c82e19d-4575-0200-1a81-3eacf00cf872",
        "source": "https://valorant-api.com/v1/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872?language=en-US",
        "lastReviewed": "2026-07-23",
        "patchVersion": "13.01"
      }
    }
  ]
};
  const merge = (base, patch) => {
    if (Array.isArray(patch)) return patch.map(item => merge(undefined, item));
    if (!patch || typeof patch !== "object") return patch;
    if (!Object.keys(patch).length) return {};
    const result = base && typeof base === "object" && !Array.isArray(base) ? { ...base } : {};
    Object.entries(patch).forEach(([key, value]) => {
      if (key === "abilities" && Array.isArray(value)) {
        const previous = new Map((Array.isArray(result.abilities) ? result.abilities : []).map(item => [item.id, item]));
        result.abilities = value.map(item => merge(previous.get(item.id), item));
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        result[key] = merge(result[key], value);
      } else {
        result[key] = Array.isArray(value) ? value.map(item => merge(undefined, item)) : value;
      }
    });
    return result;
  };
  const reference = globalThis.RankedCoachGamesenseReference || { agents: [], weapons: [], warmupDetails: {} };
  const agents = new Map((reference.agents || []).map(item => [item.id, item]));
  PROMOTED.agents.forEach(patch => agents.set(patch.id, merge(agents.get(patch.id), patch)));
  const groups = (reference.weapons || []).map(group => ({ ...group, weapons: [...(group.weapons || [])] }));
  const groupById = new Map(groups.map(group => [group.id, group]));
  PROMOTED.weapons.forEach(({ groupId, patch }) => {
    let group = groupById.get(groupId);
    if (!group) {
      group = { id: groupId, label: groupId === "machine-guns" ? "Machine Guns" : "Weapons", examples: "", range: "", weaponIds: [], weapons: [] };
      groups.push(group);
      groupById.set(groupId, group);
    }
    const index = group.weapons.findIndex(item => item.id === patch.id);
    const next = merge(index >= 0 ? group.weapons[index] : undefined, patch);
    if (index >= 0) group.weapons[index] = next;
    else group.weapons.push(next);
    group.weaponIds = [...new Set([...(group.weaponIds || []), patch.id])];
  });
  const maps = new Map((globalThis.RankedCoachGamesenseMaps || []).map(item => [item.id, item]));
  PROMOTED.maps.forEach(patch => maps.set(patch.id, merge(maps.get(patch.id), patch)));
  globalThis.RankedCoachGamesenseReference = Object.freeze({ ...reference, agents: Object.freeze([...agents.values()]), weapons: Object.freeze(groups) });
  globalThis.RankedCoachGamesenseMaps = Object.freeze([...maps.values()]);
})();
