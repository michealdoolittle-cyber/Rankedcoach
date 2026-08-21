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
      "icon": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf/fullportrait.png",
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
          "purpose": "Nova Pulse is your setup stun. Use it on known positions, choke points, and plant zones to force enemies off timing or make them easy to swing. Do not burn it on a blind guess unless the space control is worth the Star.",
          "setup": "Put the star on a choke, plant spot, or swing path before the fight starts. Nova Pulse has a windup, so it needs timing. Call the pop and have a teammate peek or exec off the concuss. Random pulses just give up your star for nothing.",
          "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/e54ed10355d571c15ef2ee5a0897cca06851fd56.mp4?accountingTag=VAL",
            "title": "NOVA PULSE",
            "source": "https://playvalorant.com/en-us/agents/astra/",
            "provider": "riot"
          }
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
          "purpose": "Nebula cuts the exact sightline your team needs removed. Smoke the defender angle, cross or hit while it is blind, then stop feeding that view. Dissipate recalls the star and leaves a brief fake smoke, so use it to bait reactions, fake pressure, or save utility after you forced respect.",
          "setup": "Place Astra stars where a real smoke would matter. A Nebula should cut a sightline for the hit or retake. A Dissipate should fake that same threat and pull attention for your timing. Random stars get ignored and waste your map pressure.",
          "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/2aafadb8cef8c1ab2894a657c23988e921b006c8.mp4?accountingTag=VAL",
            "title": "NEBULA",
            "source": "https://playvalorant.com/en-us/agents/astra/",
            "provider": "riot"
          }
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
          "purpose": "Gravity Well is for moving enemies, not fishing. Use it on confirmed positions to pull players off angles, trap exits, or hold them for damage utility. It also buys time on chokepoints and spike taps because enemies have to fight the pull before they can play normally.",
          "setup": "Place the Star before the fight starts. Gravity Well wins rounds when it is already on the choke, plant spot, or anchor position your team is about to punish. Call the pull, then swing or stack damage while enemies are dragged in and made Vulnerable.",
          "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/3439c939846214067561746668bfd96805efc225.mp4?accountingTag=VAL",
            "title": "GRAVITY WELL",
            "source": "https://playvalorant.com/en-us/agents/astra/",
            "provider": "riot"
          }
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
          "purpose": "Astral Form lets you place and trigger map-wide utility without exposing your body. Use it to set the round before contact. Cosmic Divide is a hard sightline and bullet blocker that also cuts sound. Drop it to split a site, protect a plant or defuse, and force enemies to walk through blind to what is happening behind it.",
          "setup": "Cosmic Divide is a team call, not a panic wall. Enter Astral Form with a plan: draw a line that cuts the defender crossfire or splits the retake. The wall blocks bullets and kills sound, so your teammates need to know which side they are fighting before it goes up.",
          "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6bed3444d432f27cdac08f3be1dad2760be7052f.mp4?accountingTag=VAL",
            "title": "ASTRAL FORM / COSMIC DIVIDE",
            "source": "https://playvalorant.com/en-us/agents/astra/",
            "provider": "riot"
          }
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
          "purpose": "Astral Form is your setup tool. Use it to place Stars from safety and build the round before contact. Your body is helpless while you are in it, so enter from cover, place with intent, then get back into the fight.",
          "setup": "Use Astral Form from cover, not in the open. You lose your body while placing stars. Know the round plan before you go in: smoke the choke, pull the clear, stun the swing. Random stars give away intent and waste your strongest timing tool.",
          "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6bed3444d432f27cdac08f3be1dad2760be7052f.mp4?accountingTag=VAL",
            "title": "ASTRAL FORM / COSMIC DIVIDE",
            "source": "https://playvalorant.com/en-us/agents/astra/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/41fb69c1-4189-7b37-f117-bcaf1e96f1bf?language=en-US",
      "uuid": "41fb69c1-4189-7b37-f117-bcaf1e96f1bf",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "breach",
      "label": "Breach",
      "role": "Initiator",
      "icon": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/5f8d3a7f-467b-97f3-062c-13acf203c006/fullportrait.png",
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
          "purpose": "Flashpoint is Breach’s angle-breaking flash. Fire it through cover, call the timing, and swing as it pops. Its job is not to farm blinds. Its job is to make a held angle unplayable for the next fight.",
          "setup": "Set Flashpoint from cover and put it through solid terrain before your team swings. Do not stand in the choke with the flash out. Fire it, call the pop, then get your gun back out for the trade.",
          "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ffa4695b83e2f959bc59f0393dfc74e533546a89.mp4?accountingTag=VAL",
            "title": "FLASHPOINT",
            "source": "https://playvalorant.com/en-us/agents/breach/",
            "provider": "riot"
          }
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
          "purpose": "Fault Line is Breach’s long-range stun for forcing fights and stopping pushes. Use it through walls before your team swings, or into a choke when enemies are committed. A stunned player loses the duel.",
          "setup": "Fault Line is a setup tool, not a dry-peek tool. Charge it from cover, line it through the choke or common hold, and release as your teammate is ready to swing. Your gun is down while equipping it, so swap back the moment the stun fires.",
          "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a4f24e1fe60879234be5da0f8a768feb8f379fdd.mp4?accountingTag=VAL",
            "title": "FAULT LINE",
            "source": "https://playvalorant.com/en-us/agents/breach/",
            "provider": "riot"
          }
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
          "purpose": "Aftershock is for removing a known spot, not checking a guess. Use it through walls to force players out of corners, stop plants, or punish defuses. If you have no read, save it until you do.",
          "setup": "Set up Aftershock from cover. You are not fighting while it is equipped. Line it through the wall, fire it to force the player out or punish the hold, then get your gun back before you swing.",
          "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/592212ab60d09999d493c2099f9260d59fab917a.mp4?accountingTag=VAL",
            "title": "AFTERSHOCK",
            "source": "https://playvalorant.com/en-us/agents/breach/",
            "provider": "riot"
          }
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
          "purpose": "Rolling Thunder is Breach’s hard commit button. Use it to take space, break a setup, or start a retake when your team is ready to swing. It hits through terrain, so the value is in forcing defenders out of strong positions before they can take clean fights.",
          "setup": "Set Rolling Thunder from cover, not in the choke. The cast locks you out of your gun and the wave takes a moment to travel. Call the hit, fire it through the site or retake lane, then move with your team before the daze window expires.",
          "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/207b0ab21f8e27e98ca22f4b5546cc0963d94af6.mp4?accountingTag=VAL",
            "title": "ROLLING THUNDER",
            "source": "https://playvalorant.com/en-us/agents/breach/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/5f8d3a7f-467b-97f3-062c-13acf203c006?language=en-US",
      "uuid": "5f8d3a7f-467b-97f3-062c-13acf203c006",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "brimstone",
      "label": "Brimstone",
      "role": "Controller",
      "icon": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417/fullportrait.png",
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
          "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/da2d65e4abc2129e284cf5248fd70925f093a0b3.mp4?accountingTag=VAL",
            "title": "STIM BEACON",
            "source": "https://playvalorant.com/en-us/agents/brimstone/",
            "provider": "riot"
          }
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
          "purpose": "Incendiary is Brimstone’s hard stop. Use it to deny a choke, clear a confirmed corner, or buy time on the spike. Do not throw it as a blind guess. It is too valuable for post-plant and retake delay.",
          "setup": "Incendiary takes your rifle out of your hands. Set it up from safety, not in the open. Use the bounce or lineup, fire the molly, then instantly re-equip your gun. The damage buys time; it does not protect you while you are holding the launcher.",
          "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9df59d490062acceb7c6ca32a3650b55718381f7.mp4?accountingTag=VAL",
            "title": "INCENDIARY",
            "source": "https://playvalorant.com/en-us/agents/brimstone/",
            "provider": "riot"
          }
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
          "purpose": "Sky Smoke is Brimstone’s main way to take space. Use it to cut off the exact angles that stop your hit, then move before the smoke fades. Bad smokes just give defenders room. Good smokes force them to wait, spam, or push through blind.",
          "setup": "Open Sky Smoke from safety. The tablet takes your gun out and makes you free kill in the open. Place the smokes before the hit starts, confirm them together, then get your weapon back out and move with the team.",
          "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/8e0b72295747346b60c354765944f5233fb208f2.mp4?accountingTag=VAL",
            "title": "SKY SMOKE",
            "source": "https://playvalorant.com/en-us/agents/brimstone/",
            "provider": "riot"
          }
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
          "purpose": "Orbital Strike is for guaranteed displacement and round-ending denial. Use it on confirmed positions, defuses, plants, or trapped players. Do not spend it on a blind guess unless the space itself wins the round.",
          "setup": "Orbital Strike uses Brimstone’s map tablet. Do not pull it out in the open. Set it from cover, place it on a committed target or choke, fire, then get your gun back out immediately.",
          "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ccd8e6c574b7017a2681e5d37c744f5a654327e3.mp4?accountingTag=VAL",
            "title": "ORBITAL STRIKE",
            "source": "https://playvalorant.com/en-us/agents/brimstone/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/9f0d8ba9-4140-b941-57d3-a7ad57c6b417?language=en-US",
      "uuid": "9f0d8ba9-4140-b941-57d3-a7ad57c6b417",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "chamber",
      "label": "Chamber",
      "role": "Sentinel",
      "icon": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7/fullportrait.png",
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
          "purpose": "Rendezvous lets Chamber take first contact from an angle he should not survive. Place the anchor behind safe cover, peek for the pick, then teleport out before the trade arrives. If your anchor is exposed or out of range, the ability is wasted.",
          "setup": "Set Rendezvous before you swing. Put the anchor behind hard cover, then take your angle inside its range with your gun out. If you are equipping the teleport while contact is possible, you are giving up the whole point of the ability.",
          "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6d191f3734a8170d99f66642041da9f33240d319.mp4?accountingTag=VAL",
            "title": "RENDEZVOUS",
            "source": "https://playvalorant.com/en-us/agents/chamber/",
            "provider": "riot"
          }
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
          "purpose": "Trademark is Chamber’s flank alarm. Use it to hold a route your team is not watching. A trigger gives the call, and the slow buys time to turn, rotate, or punish the player walking into it.",
          "setup": "Trademark must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
          "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/245fa173c5d3677e3838d52fb155b6366d19c91b.mp4?accountingTag=VAL",
            "title": "TRADEMARK",
            "source": "https://playvalorant.com/en-us/agents/chamber/",
            "provider": "riot"
          }
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
          "purpose": "Headhunter is Chamber’s bought precision sidearm. Its job is to keep real kill pressure when your main weapon is weak, empty, or bad for the angle. Use it for clean first-bullet fights, long sightlines, and eco rounds. Do not spam it like a Classic. Every bullet is a purchase.",
          "setup": "Headhunter is not utility you throw and forget. It is a gun with an equip time. Buy the bullets before the round, pull it out behind cover, then take the fight with it already in your hand. Do not swap to it in the open unless you are already dead if you stay on your current weapon.",
          "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/745571f61d83d880c42278a35a072cdd8b7bfa12.mp4?accountingTag=VAL",
            "title": "HEADHUNTER",
            "source": "https://playvalorant.com/en-us/agents/chamber/",
            "provider": "riot"
          }
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
          "purpose": "Tour De Force is for locking a long angle and making the first contact lethal. Use it when the enemy has to cross open space or challenge your line. A kill drops a slow field, which stalls the trade and lets you reset the fight.",
          "setup": "Set Tour De Force around a real sightline, not a hope shot. Take a long angle, place Rendezvous before contact, and tell your team what lane is locked. The gun wins first contact. The setup keeps you alive after it.",
          "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/49f14376a65d54586c350e7fe863ba30911032a0.mp4?accountingTag=VAL",
            "title": "TOUR DE FORCE",
            "source": "https://playvalorant.com/en-us/agents/chamber/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/22697a3d-45bf-8dd7-4fec-84a9e28c69d7?language=en-US",
      "uuid": "22697a3d-45bf-8dd7-4fec-84a9e28c69d7",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "clove",
      "label": "Clove",
      "role": "Controller",
      "icon": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/1dbf2edd-4729-0984-3115-daa5eed44993/fullportrait.png",
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
          "purpose": "Pick-me-up is Clove’s post-fight reset. After a damaged enemy drops, use it to regain temporary health and haste so you can escape, swing the next angle, or keep taking space. It does nothing until contact is already won.",
          "setup": "Pick-me-up has no pre-place setup. Your setup is the fight plan. Damage or kill an enemy first, keep a route out, then use the haste and temporary health to reset, re-swing, or survive the trade. If you take first contact without doing damage, this ability does nothing.",
          "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4adb022f083d3887f73d23f60de71cccb45e6d83.mp4?accountingTag=VAL",
            "title": "Pick-Me-Up",
            "source": "https://playvalorant.com/en-us/agents/clove/",
            "provider": "riot"
          }
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
          "purpose": "Ruse is your round-shaping smoke. Cut key sightlines, cover crossings, and isolate fights so your team can take space without eating every angle. You can still place it after death, so dying early is not an excuse to stop controlling the round.",
          "setup": "Ruse puts your gun away. Do not set smokes in the open. Tuck behind cover, place both clouds with a clear plan, then get your weapon back out before the hit lands.",
          "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f74f0d7b96cae0bcf51e97ad99883a370508a381.mp4?accountingTag=VAL",
            "title": "Ruse",
            "source": "https://playvalorant.com/en-us/agents/clove/",
            "provider": "riot"
          }
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
          "purpose": "Not Dead Yet is a second swing, not a reset. Use it when your revive puts you straight back into a fight where you can get a kill or damaging assist before the timer ends. If there is no contact to convert, you are just dying twice.",
          "setup": "Do not pop Not Dead Yet just because it is available. Before you revive, know the fight you are taking. You need a kill or damaging assist fast, so stand up with a target, a swing path, and a teammate ready to trade.",
          "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b9e4ee59e2e2a492ec5a76f71c2161faa6f03981.mp4?accountingTag=VAL",
            "title": "Not Dead Yet",
            "source": "https://playvalorant.com/en-us/agents/clove/",
            "provider": "riot"
          }
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
          "purpose": "Meddle is your fight starter. It applies Decay, so anyone hit is easier to kill during the follow-up swing. Throw it into common holds, tight chokes, or post-plant pockets right before contact. The ability does not clear space for free. You still need a gun ready to punish the Decay.",
          "setup": "Meddle must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
          "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/71b28c3a8e3b6f29a2523f2cada52f2ea5a1eab0.mp4?accountingTag=VAL",
            "title": "Meddle",
            "source": "https://playvalorant.com/en-us/agents/clove/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/1dbf2edd-4729-0984-3115-daa5eed44993?language=en-US",
      "uuid": "1dbf2edd-4729-0984-3115-daa5eed44993",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "cypher",
      "label": "Cypher",
      "role": "Sentinel",
      "icon": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b/fullportrait.png",
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
          "purpose": "Use Cyber Cage to cut vision on demand and make a choke dangerous to cross. The cage hides your setup, creates a clear sound cue when enemies push through, and gives you a clean timing to swing or activate utility.",
          "setup": "Set cages where they create a punish, not just cover. Strong one-ways give you a consistent feet line while denying the enemy’s headshot angle. Test the cage from both sides in custom. If they can cross or swing without exposing anything, it is just a smoke.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/54a8dfaa9b82c7aaf994b0432bb25ef1e95c985c.mp4?accountingTag=VAL",
            "title": "Cypher Cyber Cage ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Spycam to take info without risking your body. It anchors flanks, checks site setups, tracks rotations, and can tag a player to drag their aim off the fight.",
          "setup": "Set Spycam to answer a real rotation question. Watch the lane your team is leaving open, the choke before the hit, or the lurk path behind you. A cam aimed at safe space gives no info. Hide it high or off-angle, check it in short bursts, and only tag when the reveal creates a kill or stops a push.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/825ba0643c74ad583350d1eb562bb7650ad78ae0.mp4?accountingTag=VAL",
            "title": "Cypher Spycam ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Trapwire turns space into a problem for the enemy. Use it to lock flank routes, stall fast entries, and force a reveal they have to break or eat. When it triggers, swing or spam immediately.",
          "setup": "Build Trapwires to punish movement, not to decorate a doorway. Place them where the enemy has to swing deep or look away from the fight to break them. Mix heights and anchor points so they cannot pre-aim the same clear every round.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/aab21b75eb43f0e8cc9c0b816cb4877ae868b9fd.mp4?accountingTag=VAL",
            "title": "Cypher Trapwire ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Neural Theft to turn one kill into the whole round plan. It exposes every living enemy, confirms the stack, catches lurks, and tells your team whether to hit, rotate, or collapse.",
          "setup": "Use Neural Theft before the commit, not after the round is already won. Tell the team what position changes the call: stack, flank, or late lurk. The second ping punishes players who instantly run after the first reveal, so keep guns up and be ready to swing.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ddeaad5ff2e4865351755b71fdc4fc97339fb334.mp4?accountingTag=VAL",
            "title": "Cypher Neural Theft ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
          },
          "source": "https://valorant-api.com/v1/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b?language=en-US"
        }
      ],
      "uuid": "117ed9e3-49f3-6512-3ccf-0cada7e3823b",
      "source": "https://valorant-api.com/v1/agents/117ed9e3-49f3-6512-3ccf-0cada7e3823b?language=en-US",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "deadlock",
      "label": "Deadlock",
      "role": "Sentinel",
      "icon": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235/fullportrait.png",
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
          "purpose": "Sonic Sensor is a sound-triggered trap, not a normal trip. Put it where enemies have to run, jump, shoot, or dump utility, then swing off the concuss. Silent walkers can pass it, so do not treat it as full lane control.",
          "setup": "Set Sonic Sensor before the hit, not during it. Place it from cover on a lane where enemies have to make noise to take space, then immediately pull your gun back out. The sensor is worthless if you die holding the tablet.",
          "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/e2c77e5b49fc3b53a7c625eb7646e51e7094dc52.mp4?accountingTag=VAL",
            "title": "SONIC SENSOR",
            "source": "https://playvalorant.com/en-us/agents/deadlock/",
            "provider": "riot"
          }
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
          "purpose": "Barrier Mesh stops bodies, not bullets. Use it to lock a choke, split a hit, or trap a player where they can be shot but cannot swing out freely. Place it where enemies must break the nodes or waste time rerouting.",
          "setup": "Set Barrier Mesh from cover. The throw leaves you with utility out, and the wall does not protect you from bullets. Place it to block movement through a choke, then pull your gun immediately.",
          "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a9dc93d62c1ae6c51b12ed1e84a5d96c678677f9.mp4?accountingTag=VAL",
            "title": "BARRIER MESH",
            "source": "https://playvalorant.com/en-us/agents/deadlock/",
            "provider": "riot"
          }
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
          "setup": "Set GravNet from cover and throw it where a fight is about to happen: choke, plant, defuse, or swing path. It forces caught enemies low and slow, but they can still shoot and remove it. Swap back fast and punish the trapped target.",
          "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d7576f43161214699762f1858e2fc8e2d3112077.mp4?accountingTag=VAL",
            "title": "GRAVNET",
            "source": "https://playvalorant.com/en-us/agents/deadlock/",
            "provider": "riot"
          }
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
          "purpose": "Annihilation is a single-target pick tool. Fire it through tight lanes or after contact to catch one enemy, drag them out of the fight, and force their team to either break the cocoon or lose them. Use it when a guaranteed 5v4 wins the round.",
          "setup": "Set Annihilation up from safety. It has a real equip window, and holding it in the open gets you killed before the ult matters. Use it after contact or utility pressure, then get your gun back out and fight the players trying to break the cocoon.",
          "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b995bab386bd58541eacfe0e065a808081c0b9ea.mp4?accountingTag=VAL",
            "title": "ANNIHILATION",
            "source": "https://playvalorant.com/en-us/agents/deadlock/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/cc8b64c8-4b25-4ff9-6e7f-37b4da43d235?language=en-US",
      "uuid": "cc8b64c8-4b25-4ff9-6e7f-37b4da43d235",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "fade",
      "label": "Fade",
      "role": "Initiator",
      "icon": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/dade69b4-4f5a-8528-247b-219e5a1facd6/fullportrait.png",
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
          "purpose": "Seize is your catch tool. It tethers, deafens, and decays enemies in its radius, so use it to stop movement and punish players trapped in pockets. Throw it off confirmed info from Haunt, Prowlers, or contact, then layer damage utility or swing while they cannot leave.",
          "setup": "Seize must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
          "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ed5b27f8f8acf6420d5f0e30938e963a204cfeca.mp4?accountingTag=VAL",
            "title": "SEIZE",
            "source": "https://playvalorant.com/en-us/agents/fade/",
            "provider": "riot"
          }
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
          "purpose": "Haunt is your first-contact info tool. Throw it to expose defenders in key space before your team swings, entries, or retakes. If it lands clean, call the revealed positions and follow the trails. If it gets shot, you still forced a defender to reveal where they are playing from.",
          "setup": "Set Haunt from cover, not in the choke. Pick a landing spot that sees common holds and forces defenders to turn or shoot up. Throw it, swap back, then take space while they are revealed or busy breaking it.",
          "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/2ee3d74b1105ab3cd996821fb07e4d6aa5c77c1a.mp4?accountingTag=VAL",
            "title": "HAUNT",
            "source": "https://playvalorant.com/en-us/agents/fade/",
            "provider": "riot"
          }
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
          "purpose": "Prowler is Fade’s space-taking tool. Send it into close angles or down Terror Trails to force contact, pull crosshairs, and Nearsight the target. Swing with it. A Prowler that hits with no teammate ready is wasted pressure.",
          "setup": "Pull Prowler from cover, not in the choke. Send it through the first contact angle and move with it so you can trade the blind or confirm the clear. The moment it hits, dies, or clears the path, get your rifle back out.",
          "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d401c0074081fd609fa08710174f27fc216c5b92.mp4?accountingTag=VAL",
            "title": "PROWLER",
            "source": "https://playvalorant.com/en-us/agents/fade/",
            "provider": "riot"
          }
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
          "purpose": "Nightfall is your hard engage button. Send it through the site or retake lane, then follow the trails before they expire. Hit enemies are deafened, decayed, and tracked, so they lose audio, lose health buffer, and become easy to collapse on.",
          "setup": "Set Nightfall up from cover, not in the choke. The wave goes through walls, so you do not need to expose yourself to hit the site or retake path. Fire it, swap back, and move with your team while enemies are deafened, decayed, and trailed.",
          "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/fd638db2f5041f8bc09f311af2c460cec579edcd.mp4?accountingTag=VAL",
            "title": "NIGHTFALL",
            "source": "https://playvalorant.com/en-us/agents/fade/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/dade69b4-4f5a-8528-247b-219e5a1facd6?language=en-US",
      "uuid": "dade69b4-4f5a-8528-247b-219e5a1facd6",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "gekko",
      "label": "Gekko",
      "role": "Initiator",
      "icon": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/e370fa57-4757-3604-3648-499e1f642d3f/fullportrait.png",
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
          "purpose": "Wingman gives you a free job-doer. Send him in to clear close space, force a defender to shoot or eat the concuss, or plant and defuse while you keep your gun up. His value is making the enemy answer him before they answer you.",
          "setup": "Set Wingman up from cover. You are unarmed while holding him, and the value comes after he is moving. Send him, then take your gun back and fight off the contact he creates. For plant or defuse, clear the path first; Wingman is not a shield.",
          "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/e9a92a506942c735f5a986ee9489fad34b192843.mp4?accountingTag=VAL",
            "title": "WINGMAN",
            "source": "https://playvalorant.com/en-us/agents/gekko/",
            "provider": "riot"
          }
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
          "purpose": "Dizzy is Gekko’s safe flash and angle-check. Send it through the lane you want to take. If it fires, swing on the blind. If it stays quiet, that sightline is either clear or the enemy gave up the angle.",
          "setup": "Take Dizzy out from cover, not in the choke. Throw her high or across the entry so she clears the angle before you swing. Move on the blind, swap back fast, and be ready to trade if she gets shot.",
          "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f3a565e0cde441f1754eeadda2427020a795d4a0.mp4?accountingTag=VAL",
            "title": "DIZZY",
            "source": "https://playvalorant.com/en-us/agents/gekko/",
            "provider": "riot"
          }
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
          "purpose": "Mosh Pit is your forced-move damage. Use it on confirmed spots, tight corners, plants, and defuses. The delay gives enemies a choice: leave the space or eat the detonation.",
          "setup": "Mosh Pit is a commitment. Pull it out from cover, throw it with a clear purpose, then get your gun back up. Use it to force enemies out of planted spike positions, delay a choke, or punish a trapped corner. Do not stand in the open holding utility.",
          "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/85f2c3958091bf4b8fb475c8bda0dcb10a409fbc.mp4?accountingTag=VAL",
            "title": "MOSH PIT",
            "source": "https://playvalorant.com/en-us/agents/gekko/",
            "provider": "riot"
          }
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
          "purpose": "Thrash is your commit button. Use it when you know where the fight is: clear a close angle, break a site hold, or start a retake. A detained player should die. Do not send it blind into empty space.",
          "setup": "Set Thrash from safety. Your body is useless while you steer it, so tuck behind hard cover and have a teammate hold the swing. Send it through the choke, detain the target, then be ready to fight off the hit immediately.",
          "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/fe30846150b8f87f7f945a3f0c82e59d0522dbdc.mp4?accountingTag=VAL",
            "title": "THRASH",
            "source": "https://playvalorant.com/en-us/agents/gekko/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/e370fa57-4757-3604-3648-499e1f642d3f?language=en-US",
      "uuid": "e370fa57-4757-3604-3648-499e1f642d3f",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "harbor",
      "label": "Harbor",
      "role": "Controller",
      "icon": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/95b78ed7-4637-86d9-7e41-71ba8c293152/fullportrait.png",
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
          "purpose": "High Tide is Harbor’s main vision cut. Use it to split sites, block defender angles, and force enemies to cross a slow wall before they can fight. Bend it through the map to cover multiple lanes with one cast.",
          "setup": "High Tide takes your gun away while you shape it. Cast it from cover, draw the wall fast, then re-equip before you move. If you stand exposed while steering it, you are just donating the opening kill.",
          "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/1705161e278ec0d669e17e3392ece2cfb3555316.mp4?accountingTag=VAL",
            "title": "HIGH TIDE",
            "source": "https://playvalorant.com/en-us/agents/harbor/",
            "provider": "riot"
          }
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
          "purpose": "Harbor does not have Storm Surge. His kit denies vision with water walls and Cove, not a blind or Nearsight.",
          "setup": "Do not set this up in the open. Harbor utility takes your gun off the screen, so use cover, deploy the effect, then get your weapon back out before you re-peek.",
          "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/e8a2822075831bdda3b1a121a569c61cb865eb59.mp4?accountingTag=VAL",
            "title": "STORM SURGE",
            "source": "https://playvalorant.com/en-us/agents/harbor/",
            "provider": "riot"
          }
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
          "purpose": "Cove is your smoke for actions that get spammed. Use it to plant, defuse, or cross exposed gaps while the shield eats bullets. The shield breaks under fire, so move immediately. Do not treat it like a normal long-duration smoke.",
          "setup": "Cove has pullout time and you are unarmed while setting it up. Throw it from safety, not in the open. Once the sphere blooms, get your gun back out and play off the shield before it gets broken.",
          "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/ba5abcf93cae8d9dfacaac56862dd400407d416e.mp4?accountingTag=VAL",
            "title": "COVE (COVE SMOKE)",
            "source": "https://playvalorant.com/en-us/agents/harbor/",
            "provider": "riot"
          }
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
          "purpose": "Reckoning is your fight-starting ult. Drop it on a site, retake path, or packed anchor spot to force movement and punish anyone who stays with concuss pulses. Call the timing and swing with the strikes; the ult creates pressure, not free kills.",
          "setup": "Cast Reckoning from cover before the hit or retake. You are not useful holding the artifact in the open. Once the zone is down, pull your gun out and follow the geyser pressure. Enemies inside have to move or risk the concuss; that is your timing to take space.",
          "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/820946b15b9a68ca46270d44363574dc634b8c1f.mp4?accountingTag=VAL",
            "title": "RECKONING",
            "source": "https://playvalorant.com/en-us/agents/harbor/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/95b78ed7-4637-86d9-7e41-71ba8c293152?language=en-US",
      "uuid": "95b78ed7-4637-86d9-7e41-71ba8c293152",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "iso",
      "label": "Iso",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c/fullportrait.png",
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
          "purpose": "Undercut is Iso’s fight starter. It travels through walls and applies Vulnerable, turning any follow-up damage into a kill threat. Use it before you swing, retake, or punish a known defender holding behind cover.",
          "setup": "Set Undercut up from cover, not in the choke. It passes through walls, so send it through common holds before the fight starts. Swing or call a teammate through immediately while Vulnerable is active.",
          "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/17503f71b58f654d583a66e29dab75460677576f.mp4?accountingTag=VAL",
            "title": "UNDERCUT",
            "source": "https://playvalorant.com/en-us/agents/iso/",
            "provider": "riot"
          }
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
          "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6fbd2b0e16ac3bda095094770ce6b1d403fc3832.mp4?accountingTag=VAL",
            "title": "KILL CONTRACT",
            "source": "https://playvalorant.com/en-us/agents/iso/",
            "provider": "riot"
          }
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
          "setup": "Pop Double Tap before you take space, not as you swing. The startup gives enemies a free timing if you use it in the open. Activate from cover, then take the duel while the buff is live.",
          "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/11ad2731215ec978c89fdb675aaf3b591c3c3c55.mp4?accountingTag=VAL",
            "title": "DOUBLE TAP",
            "source": "https://playvalorant.com/en-us/agents/iso/",
            "provider": "riot"
          }
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
          "purpose": "Contingency is a moving bullet shield, not a smoke. Use it to cross exposed lanes, break an Operator angle, or walk into a choke without getting sprayed on entry. Enemies can still see you, so take space with it instead of hiding behind it.",
          "setup": "Set Contingency from cover. You are giving up your gun to place it, so do not equip it in the choke. Fire it before the swing, swap back, and move behind the wall. It blocks bullets, not utility.",
          "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/5e331c774ffde4e8e0c45a8844b0237b7d75ba3b.mp4?accountingTag=VAL",
            "title": "CONTINGENCY",
            "source": "https://playvalorant.com/en-us/agents/iso/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/0e38b510-41a8-5780-5e8f-568b2a4f2d6c?language=en-US",
      "uuid": "0e38b510-41a8-5780-5e8f-568b2a4f2d6c",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "jett",
      "label": "Jett",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png",
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
          "purpose": "Use Updraft to break normal crosshair placement. Take high off-angles, reach vertical positions, dodge ground pressure, or pair it with Blade Storm for fights most agents cannot contest cleanly.",
          "setup": "Use Updraft with a landing spot already picked. The lift exposes you and your gun is not ready instantly after the movement. Take a height, dodge utility, or pair it with Blade Storm. Do not float in the open for free.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4cbc968f05713579aae9464c5a16dc3f6863f943.mp4?accountingTag=VAL",
            "title": "Jett Updraft ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Tailwind is your commit button. Use it to break a choke, force defenders to turn, and create space your team can follow. On defense, use it to take aggressive contact or fire an Operator shot without being stuck in the trade.",
          "setup": "Set Tailwind before you take the fight and know exactly where the dash ends. Your destination needs cover, a Cloudburst, or a teammate ready to trade. If your dash lands in open space or uncleared space, you did not set up an escape.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ec6b3cf1f8ac09d597b0193de1d7bb81335b40e4.mp4?accountingTag=VAL",
            "title": "Jett Tailwind ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Cloudburst is not map control. It is a short vision break for tempo. Use it to cut an Operator angle, hide your dash path, cross a gap, or isolate one fight before the smoke disappears.",
          "setup": "Use Cloudburst as a timing tool, not site coverage. Pre-aim the throw, curve it into the choke, and take the fight before it fades. One-ways are valid for a quick duel, but they do not replace controller smoke uptime.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/3353597819f0c032d56ff947d9762368b4ee6c6b.mp4?accountingTag=VAL",
            "title": "Jett Cloudburst ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Blade Storm lets you take rifle-level fights without buying a rifle. Use it to break eco rounds, keep your money healthy, and pair Jett’s dash or Updraft with a weapon that stays accurate while moving. Secure a kill, refresh the knives, and keep snowballing.",
          "setup": "Use Blade Storm in single-fire by default. It gives you accurate picks and refreshes your knives on a kill. Right-click is a point-blank dump. If it does not kill, you are empty. If it does kill, you still do not get the reset.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/667770571300e065b332617e5c8f2e009ed88928.mp4?accountingTag=VAL",
            "title": "Jett Blade Storm ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
      "uuid": "add6443a-41bd-e414-f6ad-e58d267f4e95",
      "source": "https://valorant-api.com/v1/agents/add6443a-41bd-e414-f6ad-e58d267f4e95?language=en-US",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "kay-o",
      "label": "KAY/O",
      "role": "Initiator",
      "icon": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/601dbbe7-43ce-be57-2a40-4abd24953621/fullportrait.png",
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
          "purpose": "FRAG/ment is for forcing space, not fishing. Use it on confirmed anchors, tight corners, plant spots, and defuse taps. It denies the area long enough to make them move or punish them for staying.",
          "setup": "Set FRAG/ment up from cover, not in the choke. You are holding utility, so you lose the duel if someone swings. Line it, throw it, then get your gun back before the pulse forces the fight.",
          "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/292e5319f9cd0aa7eee01af47413f4009236f87e.mp4?accountingTag=VAL",
            "title": "FRAG/MENT",
            "source": "https://playvalorant.com/en-us/agents/kay-o/",
            "provider": "riot"
          }
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
          "purpose": "FLASH/drive is KAY/O’s fight starter. It forces defenders off held angles by blinding them or making them turn, giving you the timing to swing, trade, and take space. Throw it when someone is ready to peek. A flash with no swing is wasted pressure.",
          "setup": "Set FLASH/drive from cover, not in the open. Your gun is down while you prep it. Call the pop, throw it to detonate as you or your teammate swing, then swap back immediately. A flash with no trade behind it is wasted utility.",
          "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9ad839fef2fd8d16d9608f8a6efd709091f0b74a.mp4?accountingTag=VAL",
            "title": "FLASH/DRIVE",
            "source": "https://playvalorant.com/en-us/agents/kay-o/",
            "provider": "riot"
          }
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
          "purpose": "ZERO/point is your info and denial tool. Throw it before the fight starts to suppress defenders out of utility, expose who is playing the area, and force them to either fall back or take a raw gunfight.",
          "setup": "Set ZERO/point from cover, not in the choke. The knife has travel time, sticks, then activates, so throw it before your team commits. As soon as it leaves your hand, get your gun back out and be ready to punish suppressed players or trade the space it clears.",
          "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/dbccb81297a30a9ddc92ec1883c832298f014504.mp4?accountingTag=VAL",
            "title": "ZERO/POINT",
            "source": "https://playvalorant.com/en-us/agents/kay-o/",
            "provider": "riot"
          }
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
          "purpose": "NULL/cmd is your go button. Pop it before the hit or retake, then take space while defenders are suppressed and your fire rate is boosted. If you get dropped, your team can still trade forward and pick you back up.",
          "setup": "Set NULL/cmd before the commit. Pop it where your pulses hit the site, choke, or retake path, then take space with your team behind you. If you go down, they need to be close enough to trade and stabilize you. Isolated NULL/cmd is just a loud way to die.",
          "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d9e35cc5d68e533df2d6e15a93471a5c073b0471.mp4?accountingTag=VAL",
            "title": "NULL/CMD",
            "source": "https://playvalorant.com/en-us/agents/kay-o/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/601dbbe7-43ce-be57-2a40-4abd24953621?language=en-US",
      "uuid": "601dbbe7-43ce-be57-2a40-4abd24953621",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "killjoy",
      "label": "Killjoy",
      "role": "Sentinel",
      "icon": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/1e58de9c-4950-5125-93e9-a0aee9f98746/fullportrait.png",
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
          "purpose": "Nanoswarm is Killjoy’s remote molly. Use it to stall chokes, stop plants or defuses, and punish enemies tagged by Alarmbot or held by Turret contact. Trigger it when they are committed, not because you are guessing.",
          "setup": "Nanoswarm is setup utility, not a panic button. Place it before contact, do it from cover, then get your gun back out. If you are still holding the grenade when the hit comes, you are giving up the fight before your setup matters.",
          "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b47a0b24d2499935d28f845a067984a52dbc2542.mp4?accountingTag=VAL",
            "title": "NANOSWARM",
            "source": "https://playvalorant.com/en-us/agents/killjoy/",
            "provider": "riot"
          }
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
          "purpose": "Alarmbot is your contact trap. When it triggers, it confirms an enemy is committing and applies Vulnerable, making your Nanoswarms or swing far more lethal. Put it on paths enemies must cross, not in spots they clear for free.",
          "setup": "Set ALARMBOT before contact, not during it. Place it behind cover or tucked off the obvious clear path so it triggers before it gets shot. Once it is down, get your gun out. The bot creates the vulnerable punish; you still have to be ready to kill the player it tags.",
          "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/0582e7e1a0733667614492129abef67e17cfc92c.mp4?accountingTag=VAL",
            "title": "ALARMBOT",
            "source": "https://playvalorant.com/en-us/agents/killjoy/",
            "provider": "riot"
          }
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
          "purpose": "Turret is your contact alarm and crosshair tax. Use it to watch a lane, catch flanks, and force enemies to clear it before they take space. Do not treat it like a gunfight winner. Its value is the info, the chip damage, and the timing it gives you to swing or rotate.",
          "setup": "Place Turret from cover, not in the open. The setup animation leaves you unable to fight. Use it to hold contact or force a crosshair pull, then have your gun ready before they swing.",
          "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/007e5042385d6f7315f4b4cb3fbd3b2c71b530c1.mp4?accountingTag=VAL",
            "title": "TURRET",
            "source": "https://playvalorant.com/en-us/agents/killjoy/",
            "provider": "riot"
          }
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
          "purpose": "Lockdown is a space-taking ult. It forces enemies to leave the radius, destroy the device, or get detained and lose the fight. Use it to retake sites, break post-plants, or start an execute when you need defenders pushed out of strong positions.",
          "setup": "Lockdown is a space-taking tool, not a panic button. Place it from cover where enemies cannot destroy it for free, then get your gun back out and protect the device. If they stay in range, they get detained. If they leave, you take the space.",
          "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9485f7bbf04841f4c37e031f07dad03e9cbc1bf9.mp4?accountingTag=VAL",
            "title": "LOCKDOWN",
            "source": "https://playvalorant.com/en-us/agents/killjoy/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/1e58de9c-4950-5125-93e9-a0aee9f98746?language=en-US",
      "uuid": "1e58de9c-4950-5125-93e9-a0aee9f98746",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "miks",
      "label": "Miks",
      "role": "Controller",
      "icon": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72/fullportrait.png",
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
          "purpose": "M-pulse is for turning a safe recovery into another useful fight. Don’t spend it on a player who gets restored into a lost angle, a trapped site, or instant trade range.",
          "setup": "Do not set up M-pulse in the open. Equip it from cover, commit the setup, then swap back to your weapon as soon as the effect is live.",
          "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/71696d85f7392dc2dbbefbf7d6d53b478dd50d1e.mp4?accountingTag=VAL",
            "title": "M-pulse",
            "source": "https://playvalorant.com/en-us/agents/miks/",
            "provider": "riot"
          }
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
          "purpose": "Waveform is for removing a sightline long enough to move. Block the angle that actually stops your play, then cross or take space while it is down.",
          "setup": "Waveform costs your gun while you set it up. Do it from cover, not in the open. Once the effect is active, stop holding utility and get your weapon back out.",
          "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/aba82134b8cf0f62eb0ba80daa9b6d86380e2348.mp4?accountingTag=VAL",
            "title": "WAVEFORM",
            "source": "https://playvalorant.com/en-us/agents/miks/",
            "provider": "riot"
          }
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
          "purpose": "Harmonize is a reposition tool. Pick the destination before you press it. Land near cover, not in open space. The point is to leave a bad fight without creating a worse one.",
          "setup": "Do not pull Harmonize in the open. Equip it from cover, start the effect, then get your gun back out immediately. The setup window is the punish window.",
          "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/7fe1ccd5f450d0e4734c4452cedca5bf6fa818fc.mp4?accountingTag=VAL",
            "title": "HARMONIZE",
            "source": "https://playvalorant.com/en-us/agents/miks/",
            "provider": "riot"
          }
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
          "purpose": "Use Bassquake to take choices away. Fire it when the enemy has to cross, swing, or hold their ground, so the control effect turns that moment into a losing fight.",
          "setup": "Bassquake takes your gun off-screen. Do the setup from cover, not in the open. Once the effect is running, get your weapon back out and be ready to fight.",
          "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/460f601d6928013be29591766945f2d6bd4759e2.mp4?accountingTag=VAL",
            "title": "BASSQUAKE",
            "source": "https://playvalorant.com/en-us/agents/miks/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/7c8a4701-4de6-9355-b254-e09bc2a34b72?language=en-US",
      "uuid": "7c8a4701-4de6-9355-b254-e09bc2a34b72",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "neon",
      "label": "Neon",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/bb2a4828-46eb-8cd1-e765-15848195d751/fullportrait.png",
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
          "purpose": "High Gear is Neon's tempo tool. Use it to beat rotations, explode through a gap, or reposition before the enemy adjusts. Pick the cover or fight you are sprinting to before you press it; your gun is down during the run, so drifting in the open gets you killed.",
          "setup": "High Gear is not a scouting tool. Pick the lane before you pop it, and make sure the first corner or slide endpoint is covered by utility or a teammate. You are unarmed while sprinting, so running through uncleared space just feeds.",
          "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a1c82c1a3aa3676bbff05dae9af8fdd8f2f25fb7.mp4?accountingTag=VAL",
            "title": "HIGH GEAR",
            "source": "https://playvalorant.com/en-us/agents/neon/",
            "provider": "riot"
          }
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
          "purpose": "Relay Bolt is your entry stun. Bounce it into common angles, concuss the spot, then take space while the defender is too slow to fight cleanly. It is strongest when it lands as you or a teammate swings, not as random poke.",
          "setup": "Relay Bolt only gets value if the fight is timed with the stun. Know the first hit and the bounce before you throw it. Call the swing, concuss the angle, then take space immediately. If no one fights off it, you gave away tempo for free.",
          "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/db28dddd3cf49297ca4c10c1898e4d3702af9d6f.mp4?accountingTag=VAL",
            "title": "RELAY BOLT",
            "source": "https://playvalorant.com/en-us/agents/neon/",
            "provider": "riot"
          }
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
          "setup": "Fast Lane is a pathing tool, not a panic button. Aim it down the lane your team is actually taking and call the hit before you throw it. It blocks sight, not bullets, so your team needs to move with it immediately.",
          "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/c1ba9d2ec4c567f6b27ddeab512ed245d5706e6b.mp4?accountingTag=VAL",
            "title": "FAST LANE",
            "source": "https://playvalorant.com/en-us/agents/neon/",
            "provider": "riot"
          }
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
          "purpose": "Overdrive turns Neon into a high-speed duelist with a fully mobile beam. Use it to break open messy fights, chase isolated players, and punish enemies who have to track your movement. Activate it with a route and cover in mind; the ult is strongest when you keep moving and chain kills.",
          "setup": "Do not activate Overdrive just to look for something. Set the lane first. Stun the common hold, cut vision with Fast Lane, and go on teammate contact. You need a first target and a path out before you ult.",
          "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/917de7be4f9bad96b54f47a4de6f91c323a57a6a.mp4?accountingTag=VAL",
            "title": "OVERDRIVE",
            "source": "https://playvalorant.com/en-us/agents/neon/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/bb2a4828-46eb-8cd1-e765-15848195d751?language=en-US",
      "uuid": "bb2a4828-46eb-8cd1-e765-15848195d751",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "omen",
      "label": "Omen",
      "role": "Controller",
      "icon": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/8e253930-4c05-31dd-1b6c-968525494517/fullportrait.png",
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
          "purpose": "Use Paranoia to take fights on your timing. Send it through walls or tight lanes before the swing to blind anchors, break crossfires, and let your team claim space.",
          "setup": "Call your Paranoia before you throw it. It hits teammates, so blind the angle they are about to fight, not the lane they are running through. Throw it from cover and send it through the choke before the swing.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f401fc788f3182b6d5aa25af6056c842117b1b36.mp4?accountingTag=VAL",
            "title": "Omen Paranoia ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Dark Cover is your map control tool. Cut the sightline that stops the hit, isolate the fight you want, and force defenders to either give space or push through smoke blind. Spend one to take ground. Save one for the late round when the rotate, plant, or retake needs cover.",
          "setup": "Set Dark Cover to deny the sightline first. Deep, sealed smokes win rounds more reliably than cute one-ways. Use ledges and box tops for one-ways only when you can place them fast and repeat them under pressure.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ba0b035a5ff2bb8d9487ba461b3d15900ff50f6b.mp4?accountingTag=VAL",
            "title": "Omen Dark Cover ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Shrouded Step to take space normal movement cannot. Get onto elevation, slip across a held line, or reset to a new angle after contact so the enemy has to clear you twice.",
          "setup": "Use Shrouded Step from cover, not as a dry entry tool. Set it up with Dark Cover, Paranoia, or teammate contact so the enemy cannot freely hold your landing spot. Best value is repositioning to a new angle, crossing a watched gap, or taking height after pressure is already on them.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/33550fee410c5a55ea8832f41827a12aaddb686f.mp4?accountingTag=VAL",
            "title": "Omen Shrouded Step ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "From the Shadows is a global macro tool, not a dueling ult. Use it to steal the spike, fake a site hit, punish over-rotations, or turn confirmed space into an instant flank. Ult into pressure your team creates; landing alone in watched space just feeds or gets cancelled.",
          "setup": "Choose a landing with cover and a reason. A cancel can still create value if it forces the enemy to abandon position.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/252cf8ad86b6aca6210ba93ea856f52708476eba.mp4?accountingTag=VAL",
            "title": "Omen From the Shadows ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
          },
          "source": "https://valorant-api.com/v1/agents/8e253930-4c05-31dd-1b6c-968525494517?language=en-US"
        }
      ],
      "uuid": "8e253930-4c05-31dd-1b6c-968525494517",
      "source": "https://valorant-api.com/v1/agents/8e253930-4c05-31dd-1b6c-968525494517?language=en-US",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "phoenix",
      "label": "Phoenix",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/eb93336a-449b-9c1b-0a54-a891f7921d69/fullportrait.png",
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
          "purpose": "Blaze is Phoenix’s vision wall. Use it to cut the angle that stops your entry, then take space before it drops. It also lets you heal, but the main value is breaking a defender’s sightline long enough to move.",
          "setup": "Blaze is a setup tool, not a duel tool. Cast it from cover, curve it to cut the angle you need, then get your gun back out before you cross or fight.",
          "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/8c5b0e23be0814583ad4601b4297d04dbaff79f7.mp4?accountingTag=VAL",
            "title": "BLAZE",
            "source": "https://playvalorant.com/en-us/agents/phoenix/",
            "provider": "riot"
          }
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
          "purpose": "Hot Hands is Phoenix’s space denial and self-reset tool. Use it to clear close corners, stall a push, or force a player off the spike. Stand in it for healing only when that HP lets you take the next fight, not when your team needs the molly for control.",
          "setup": "Hot Hands is not instant. Pull it out from cover, throw it with a clear purpose, then get your gun back up. Use it to force enemies off a corner, stall a choke, or heal yourself without giving up a free timing.",
          "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b702ed368fd050e7cb77adf26bc55bb63c5936fb.mp4?accountingTag=VAL",
            "title": "HOT HANDS",
            "source": "https://playvalorant.com/en-us/agents/phoenix/",
            "provider": "riot"
          }
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
          "purpose": "Curveball is your corner flash. Use it to break close angles and take the fight before the blind fades. Throw it, swing with it, and punish anyone holding the angle.",
          "setup": "Set Curveball from cover, not in the open. Stand tight to the corner, choose the left or right bend, throw it so it pops past the edge, then have your gun out as you swing. The flash is only value if you are ready to punish it.",
          "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/c62125b1b5637b7b0e0881348502f7e8b8e93572.mp4?accountingTag=VAL",
            "title": "CURVEBALL",
            "source": "https://playvalorant.com/en-us/agents/phoenix/",
            "provider": "riot"
          }
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
          "purpose": "Run It Back lets you entry without risking a real death. Cast it from a safe marker, take the first contact, clear close angles, and force defenders to reveal positions. If the marker is exposed, the ult becomes a free kill for the enemy.",
          "setup": "Ult from a spot your team controls, not from the choke. If the marker can be swung or spammed, your return is dead on arrival. Call the target before you pop it, then take first contact while your team trades behind you.",
          "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/aa122a33b1ef0320174991b8ddee4e82dbc2b937.mp4?accountingTag=VAL",
            "title": "RUN IT BACK",
            "source": "https://playvalorant.com/en-us/agents/phoenix/",
            "provider": "riot"
          }
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
          "purpose": "Heating Up lets Phoenix turn his own fire into a reset. Use Blaze or Hot Hands to heal after taking contact, then get back into the fight without draining teammate utility.",
          "setup": "Heating Up only works if your fire is placed where you can actually stand. Put Hot Hands or Blaze on a safe pocket before you commit to the heal. If the flame lands in the open, you waste the sustain or hand the enemy a free swing.",
          "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/b702ed368fd050e7cb77adf26bc55bb63c5936fb.mp4?accountingTag=VAL",
            "title": "Phoenix ability showcase",
            "source": "https://playvalorant.com/en-us/agents/phoenix/",
            "provider": "riot",
            "contextualFallback": true
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/eb93336a-449b-9c1b-0a54-a891f7921d69?language=en-US",
      "uuid": "eb93336a-449b-9c1b-0a54-a891f7921d69",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "raze",
      "label": "Raze",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/fullportrait.png",
      "abilities": [
        {
          "id": "blast-pack",
          "name": "Blast Pack",
          "slot": "C - Basic",
          "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability1/displayicon.png",
          "summary": "INSTANTLY throw a Blast Pack that will stick to surfaces. RE-USE the ability after deployment to detonate, moving anything hit and dealing damage if fully armed.",
          "stats": {
            "Cost": "Buy-menu utility",
            "Charges": "2",
            "Damage": "Armed satchel damage",
            "Movement": "Self-launching displacement",
            "Source": "Riot game text + Valorant Wiki current infobox"
          },
          "purpose": "Blast Pack is Raze’s space button. Use it to explode through chokes, take vertical/off-angle fights, break enemy utility, and leave before the trade lands.",
          "setup": "Decide the landing before you throw the satchel. Blast Pack gets you space fast, but it also commits your body. Land behind cover, on an angle your team is pressuring, or not at all.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/82028c5e9ae38b59660dbf9f57f341f1c20c5480.mp4?accountingTag=VAL",
            "title": "Raze Blast Pack ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
          },
          "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
        },
        {
          "id": "paint-shells",
          "name": "Paint Shells",
          "slot": "Q - Basic",
          "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ability2/displayicon.png",
          "summary": "EQUIP a cluster grenade. FIRE to throw the grenade, which does damage and creates sub-munitions, each doing damage to anyone in their range. ALT FIRE to lob. Paint Shells charge resets every two kills.",
          "stats": {
            "Cost": "Signature utility",
            "Recharge": "Resets after two kills",
            "Damage": "Cluster explosive damage",
            "AltFire": "Lob throw",
            "Charges": "1",
            "Source": "Riot game text + Valorant Wiki current infobox"
          },
          "purpose": "Use Paint Shells to break defensive setups before you swing. Throw it into tight corners, chokes, and stall positions where players have to move or eat damage. It forces space for the entry and punishes anyone trapped by your team’s pressure.",
          "setup": "Use Paint Shells to break fixed positions, not to fish for random damage. Nade the corner, cubby, or default plant pocket before your team swings. The explosion forces movement; your crosshair or your teammate’s crosshair gets the kill.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d75fd65435a84906bb3e8ad0b97c505e7359697b.mp4?accountingTag=VAL",
            "title": "Raze Paint Shells ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
          },
          "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
        },
        {
          "id": "boom-bot",
          "name": "Boom Bot",
          "slot": "E - Signature",
          "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/grenade/displayicon.png",
          "summary": "EQUIP a Boom Bot. FIRE will deploy the bot, causing it to travel in a straight line on the ground, bouncing off walls. The Boom Bot will lock on to any enemies in its frontal cone and chase them, exploding for heavy damage if it reaches them.",
          "stats": {
            "Cost": "Buy-menu utility",
            "Charges": "1",
            "Damage": "Explosive on contact",
            "Tracking": "Frontal cone",
            "Source": "Riot game text + Valorant Wiki current infobox"
          },
          "purpose": "Boom Bot is your disposable corner clear. Send it into tight space before you swing. If it finds someone, they have to shoot it, move, or take the blast. Use that reaction to take the fight on your timing.",
          "setup": "Boom Bot is for the angle your entry cannot face-check for free. Send it into close pockets, follow behind it, and swing when the defender has to shoot it or dodge. If you throw it and wait, you wasted the pressure.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/c824fe8e08a4f36be2273aa456819d2c2b6cd6b0.mp4?accountingTag=VAL",
            "title": "Raze Boom Bot ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
          },
          "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
        },
        {
          "id": "showstopper",
          "name": "Showstopper",
          "slot": "X - Ultimate",
          "icon": "https://media.valorant-api.com/agents/f94c3b30-42be-e959-889c-5aa313dba261/abilities/ultimate/displayicon.png",
          "summary": "EQUIP a rocket launcher. FIRE to shoot a rocket that does massive area damage on contact with anything.",
          "stats": {
            "Cost": "Ultimate points",
            "Charges": "1 rocket",
            "Damage": "Massive area damage",
            "Range": "Projectile travel",
            "Source": "Riot game text + Valorant Wiki current infobox"
          },
          "purpose": "Showstopper is your round-breaking threat. Use it to force defenders out of anchor spots, delete tight angles, or shut down a retake before they touch the spike. Fire it where escape routes are limited, not into open space.",
          "setup": "Showstopper is best when the target has no clean exit. Use teammate pressure, Paint Shells, Boom Bot, or a satchel swing to force movement first. Aim the rocket at the choke or escape path they must cross, not at a random corner.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/7281a34566f12d202dee3d43e0fa0bf0b4271d60.mp4?accountingTag=VAL",
            "title": "Raze Showstopper ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
          },
          "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US"
        }
      ],
      "source": "https://valorant-api.com/v1/agents/f94c3b30-42be-e959-889c-5aa313dba261?language=en-US",
      "uuid": "f94c3b30-42be-e959-889c-5aa313dba261",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "reyna",
      "label": "Reyna",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc/fullportrait.png",
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
          "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/327ccef09ef3c84a92320593c5db1bcb4b37e1e7.mp4?accountingTag=VAL",
            "title": "DEVOUR",
            "source": "https://playvalorant.com/en-us/agents/reyna/",
            "provider": "riot"
          }
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
          "purpose": "Dismiss is Reyna’s exit button after a kill. Use it to take a hard first duel, deny the trade, and reset into cover or a new angle. It does nothing before you earn the orb, so the purpose is simple: win contact first, then leave before the second player punishes you.",
          "setup": "Dismiss only matters after a soul orb exists. Set it up before the fight: take an angle where one kill gives you a clean phase back to cover or into new space. Do not swing with no exit and call it confidence. Dismiss saves winning duels, not bad positioning.",
          "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6a7db5a37dd8e6e6671699ff30ad297cf1f2eeda.mp4?accountingTag=VAL",
            "title": "DISMISS",
            "source": "https://playvalorant.com/en-us/agents/reyna/",
            "provider": "riot"
          }
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
          "purpose": "Leer is Reyna’s entry tool. Put the eye through cover, then swing while defenders are nearsighted or forced to shoot it. If you throw it and wait, you waste the pressure.",
          "setup": "Do not walk out with Leer in your hand. Throw it from cover, place it high or wide, then swing with your gun ready. A good Leer forces the defender to shoot the eye or fight nearsighted. If you delay, they kill it for free.",
          "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/01030fba2df618b91c6185bb076f54e8c6c40415.mp4?accountingTag=VAL",
            "title": "LEER",
            "source": "https://playvalorant.com/en-us/agents/reyna/",
            "provider": "riot"
          }
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
          "purpose": "Empress is Reyna’s snowball button. Use it before a fight-heavy hit, retake, or clutch. The combat steroid helps you win the first duel, then each kill keeps the ult running and lets you chain Devour or Dismiss to keep taking space.",
          "setup": "Pop Empress before you take the fight, not while you are exposed. Your gun is down during the activation. Use cover, activate, re-equip, then force contact fast. The ult only gets value if you turn the first kill into more space.",
          "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d777e81e035db1430b1fbf664a432163deed5afb.mp4?accountingTag=VAL",
            "title": "EMPRESS",
            "source": "https://playvalorant.com/en-us/agents/reyna/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/a3bfb853-43b2-7238-a4f1-ad90e9e46bcc?language=en-US",
      "uuid": "a3bfb853-43b2-7238-a4f1-ad90e9e46bcc",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "sage",
      "label": "Sage",
      "role": "Sentinel",
      "icon": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/569fdd95-4d10-43ab-ca70-79becc718b46/fullportrait.png",
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
          "purpose": "Use Slow Orb to kill timing. Drop it on a choke, plant spot, or retake path and force enemies to crawl through loud, bad movement. It buys rotations, traps players in damage utility, and makes swings easier to time.",
          "setup": "Slow Orb is strongest before contact turns into a full swing. Land it on chokepoints, spike paths, and retake lanes so enemies lose timing and spacing. Do not waste both charges on the same stall unless those seconds secure a rotate, a plant, or a defuse.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/45053483528b96cbe003ac39e6b53c9866d5fea6.mp4?accountingTag=VAL",
            "title": "Sage Slow Orb ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Healing Orb to put a damaged player back into the round before the next fight. Prioritize the teammate who still has a job to do: entry again, hold the site, or play the retake. Do not waste it on chip damage while a low HP teammate is about to take contact.",
          "setup": "Set up your heal from safety. Healing Orb is not worth crossing an open angle and giving up your life. Heal players who can immediately rejoin the fight, hold space, or anchor a retake. If they are trapped and cannot be helped, keep your gun up.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a247d196383136d3de15b4d6d9c816e3c8054ba0.mp4?accountingTag=VAL",
            "title": "Sage Healing Orb ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Barrier Orb to change the round geometry. Cut off a choke, force enemies to break utility before they move, protect a plant or defuse, or create off-angles with a boost.",
          "setup": "Do not wall by habit. Barrier Orb is strongest when it forces a timing: blocks a choke, creates a boost, or lets you take an off-angle before the hit starts. If enemies can safely shoot exposed segments for free, the wall is just noise.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/a79b1d6838cee5572b428babd74a2db0c07f4ea5.mp4?accountingTag=VAL",
            "title": "Sage Barrier Orb ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Resurrection turns a lost player back into a gun. Use it to restore numbers, bring back your carry or sentinel setup, and punish enemies who gave up control of the body.",
          "setup": "Do not res into a live angle. Clear the body, wall or smoke the threat, then call where the revived player exits. A safe Resurrection restores numbers. A lazy one feeds an ultimate orb back to the enemy.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df83929ed5da349c37a5bf4600c2b55010c72402.mp4?accountingTag=VAL",
            "title": "Sage Resurrection ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
          },
          "source": "https://valorant-api.com/v1/agents/569fdd95-4d10-43ab-ca70-79becc718b46?language=en-US"
        }
      ],
      "uuid": "569fdd95-4d10-43ab-ca70-79becc718b46",
      "source": "https://valorant-api.com/v1/agents/569fdd95-4d10-43ab-ca70-79becc718b46?language=en-US",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "skye",
      "label": "Skye",
      "role": "Initiator",
      "icon": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/6f2a04ca-43e0-be17-7f36-b3908627744d/fullportrait.png",
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
          "purpose": "Trailblazer is your controlled clear. Send it through tight space to check close angles, force the defender to move, and concuss them for the swing. Use it where your team can act on the contact, not as a random scout into empty space.",
          "setup": "Trailblazer locks you into control and leaves your body helpless. Start it from hard cover, not in the choke. Use it to clear the first dangerous angle, call contact fast, then cancel or bite and get your gun back. Your team must be ready to swing off the stun or info.",
          "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/3256cb83ad3563516497864209ea585c595cd8df.mp4?accountingTag=VAL",
            "title": "Q - Trailblazer",
            "source": "https://playvalorant.com/en-us/agents/skye/",
            "provider": "riot"
          }
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
          "purpose": "Guiding Light is Skye’s fight starter and angle check. Send the hawk through the space your team is about to take, pop it where defenders have to look, then swing on the blind or use the hit confirm to call enemy presence.",
          "setup": "Guiding Light is not a panic button. Equip it behind cover, steer the hawk around the angle, pop it, then get your gun back. If you pull it out in the open, the defender gets a free timing or shoots the bird before it matters.",
          "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/64edfd7af8a7125dd9c981c52fdc60f9560b821b.mp4?accountingTag=VAL",
            "title": "E - Guiding Light",
            "source": "https://playvalorant.com/en-us/agents/skye/",
            "provider": "riot"
          }
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
          "purpose": "Regrowth resets damaged teammates so your next fight is taken with real HP, not chip damage. You cannot heal yourself. Spend it on allies who can safely rejoin the round, not players trapped in a dead position.",
          "setup": "Regrowth puts your gun away and locks you into a channel. Use it from cover, with teammates close enough to actually receive the heal. Do not start it in the open, and do not over-channel after the useful healing is done.",
          "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/d64273e31bf2c4d16c52acc2f461e9accdb7c7f9.mp4?accountingTag=VAL",
            "title": "C - Regrowth",
            "source": "https://playvalorant.com/en-us/agents/skye/",
            "provider": "riot"
          }
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
          "purpose": "Seekers is your hit-confirm and retake starter. Send it before the team commits. It gives enemy positions, forces them to shoot or run, and Nearsights anyone it reaches. Trade off that pressure immediately.",
          "setup": "Seekers has a long equip and cast commitment. Use it from cover, not while exposed in the choke. Once they are moving, get your gun back out and follow the pressure with your team.",
          "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/82ab63d9255f9fbbea7c13e00cd46b09ff90d25b.mp4?accountingTag=VAL",
            "title": "X - Seekers",
            "source": "https://playvalorant.com/en-us/agents/skye/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/6f2a04ca-43e0-be17-7f36-b3908627744d?language=en-US",
      "uuid": "6f2a04ca-43e0-be17-7f36-b3908627744d",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "sova",
      "label": "Sova",
      "role": "Initiator",
      "icon": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa/fullportrait.png",
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
          "purpose": "Shock Bolt is Sova’s damage tool. Use it to punish plants and defuses, finish tagged players, break exposed utility, and force enemies out of cover without swinging.",
          "setup": "Set Shock Bolts for forced positions: plant spots, defuse taps, tight corners, and post-contact swings. The damage falls off fast from the center. If the bolt lands wide, it is chip damage, not a kill setup.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/7776fa677e90c72da94ec7d188d2d4618116c41b.mp4?accountingTag=VAL",
            "title": "Sova Shock Bolt ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Recon Bolt to take space with information. A good dart scans the lane your team wants to fight, exposes players holding it, and forces them to hide or shoot instead of taking the first duel.",
          "setup": "Put Recon Bolt where it scans the space your team is about to fight, not where it lands safely. A good dart forces defenders to either break crosshair, swing into danger, or get revealed.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/50f9d870fa2a9b9ba38408eb718ffc06879c11a8.mp4?accountingTag=VAL",
            "title": "Sova Recon Bolt ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Owl Drone to clear the entry path before bodies commit. It checks close angles, spots setups, and forces defenders to shoot it, fall back, or risk getting tagged.",
          "setup": "Drone from a spot your team can immediately follow. Owl Drone is strongest when it forces defenders to shoot, dodge, or get tagged while your entry takes space. If you fly it alone from too far back, the info expires before anyone can punish it.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/6c6f036376c18ddf4ed0c589b506b8889d86a29a.mp4?accountingTag=VAL",
            "title": "Sova Owl Drone ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Hunter’s Fury to turn info into damage. Fire it off Recon, Drone, or teammate contact to kill trapped players through walls. It also stalls plants and defuses, breaks post-plant positions, and punishes teams stacked in narrow lanes.",
          "setup": "Use Hunter’s Fury off real info, not guesses. Drone tag, Recon reveal, Spike tap, or teammate contact gives you the first line. After the first shot, drag the next blast toward their escape route. Three shots on the same marker is how you waste the ult.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/df9ce34c3d2a7f527929cac123501e1473e0da0e.mp4?accountingTag=VAL",
            "title": "Sova Hunter's Fury ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
      "uuid": "320b2a48-4d9b-a075-30f1-1f93a9b638fa",
      "source": "https://valorant-api.com/v1/agents/320b2a48-4d9b-a075-30f1-1f93a9b638fa?language=en-US",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "tejo",
      "label": "Tejo",
      "role": "Initiator",
      "icon": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/b444168c-4e35-8076-db47-ef9bf368f384/fullportrait.png",
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
          "purpose": "Use Guided Salvo to hit known positions and force movement. It is strongest after info, not as a blind clear. Confirm the target, fire the salvo, then punish the enemy as they leave cover.",
          "setup": "Guided Salvo takes your gun away and locks you into the targeting map. Set one or two strike points from cover, launch before the contact timing, then swap back fast. If you program it in the choke, you die before the missiles matter.",
          "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/612a857ad0b5ebfa86611af953066356cd33fe97.mp4?accountingTag=VAL",
            "title": "Guided Salvo",
            "source": "https://playvalorant.com/en-us/agents/tejo/",
            "provider": "riot"
          }
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
          "setup": "Special Delivery takes your gun out. Set the stick or bounce from cover, not in the choke. Once the concuss is about to pop, swap back and be ready to punish the stunned player.",
          "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/6fdd2855da57354f3f1d274bea06f8f24140ef23.mp4?accountingTag=VAL",
            "title": "Special Delivery",
            "source": "https://playvalorant.com/en-us/agents/tejo/",
            "provider": "riot"
          }
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
          "setup": "Armageddon takes your gun out and forces you into placement. Do it from cover, not in the choke. Set the strike line, fire it, then swap back immediately so you are ready for the swing after the warning starts.",
          "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/8060ca420965ebd775f8cdbe3589600ee5733911.mp4?accountingTag=VAL",
            "title": "Armageddon",
            "source": "https://playvalorant.com/en-us/agents/tejo/",
            "provider": "riot"
          }
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
          "purpose": "Stealth Drone is Tejo’s safe info tool. Send it through the choke before your team commits, pulse anchor spots, then call what is clear and what is occupied.",
          "setup": "Stealth Drone must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
          "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/68c56e770855ce32eab9ba4283e4496952295d9a.mp4?accountingTag=VAL",
            "title": "Stealth Drone",
            "source": "https://playvalorant.com/en-us/agents/tejo/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/b444168c-4e35-8076-db47-ef9bf368f384?language=en-US",
      "uuid": "b444168c-4e35-8076-db47-ef9bf368f384",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "veto",
      "label": "Veto",
      "role": "Sentinel",
      "icon": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b/fullportrait.png",
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
          "purpose": "Interceptor is a rules-check tool. Use it for the exact utility denial it is built to provide, then swing or take space off that blocked timing. Do not base a setup on unlisted interactions. If you have not tested the counter, do not trust it in ranked.",
          "setup": "Do not set Interceptor up in the open. It forces your gun away first, so use cover, activate it, then immediately swap back. If you get swung during the setup, you gave them a free fight.",
          "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/e1e6a22165aecb88f0bb8527cfee9e16c6bdc788.mp4?accountingTag=VAL",
            "title": "INTERCEPTOR",
            "source": "https://playvalorant.com/en-us/agents/veto/",
            "provider": "riot"
          }
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
          "purpose": "Crosscut is your reposition tool. Use it with a landing spot already picked, not as a panic button. Move to cover, break the angle, and force the fight to reset on your terms.",
          "setup": "Crosscut costs you your gun while you set it up. Do it from cover, not in the open. Once the effect is live, stop holding utility and get your weapon back out.",
          "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/120c1d637aadbeb6995ca80f5819bf9647b9056c.mp4?accountingTag=VAL",
            "title": "CROSSCUT",
            "source": "https://playvalorant.com/en-us/agents/veto/",
            "provider": "riot"
          }
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
          "purpose": "Treat Evolution as a rules-as-written tool. Use it for the confirmed effect, then play off the value it actually gives. Do not base a round plan on unverified tech or hidden interactions.",
          "setup": "Build Evolution setups around the ability text, not assumptions. Do not plan around hidden range, extra duration, refreshes, or special interactions unless the game confirms them. Test the exact placement in custom before you use it in ranked.",
          "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/4aafeeffca726a0bfdd0852c0543583dc43da41b.mp4?accountingTag=VAL",
            "title": "EVOLUTION",
            "source": "https://playvalorant.com/en-us/agents/veto/",
            "provider": "riot"
          }
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
          "purpose": "Use Chokehold to cut choices off. Put it on the path the enemy has to take, then fight during the control window. If it is not forcing a cross, stopping a swing, or trapping a commit, it is wasted.",
          "setup": "Chokehold costs you gun uptime during setup. Do not equip it in the open. Set it from cover, activate the effect, then get your weapon back out immediately.",
          "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news_live/c20ef1ed8b1ac66589d7be8ce91eb8d238add412.mp4?accountingTag=VAL",
            "title": "CHOKEHOLD",
            "source": "https://playvalorant.com/en-us/agents/veto/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/92eeef5d-43b5-1d4a-8d03-b3927a09034b?language=en-US",
      "uuid": "92eeef5d-43b5-1d4a-8d03-b3927a09034b",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "viper",
      "label": "Viper",
      "role": "Controller",
      "icon": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/707eab51-4836-f488-046a-cda6bf494859/fullportrait.png",
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
          "purpose": "Use Poison Cloud to cut a key sightline or lock a choke on your timing. It is reusable and fuel-based, so place it where repeated denial matters: main entrances, spike control, or a strong one-way.",
          "setup": "Poison Cloud is strongest when the orb lands exactly where planned. Use simple, repeatable lineups for one-ways and choke smokes. A bad throw wastes your fuel plan and often leaves the orb in a spot you cannot safely recover.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/49ff8efd75b76941da3018362061275d3a1d43d6.mp4?accountingTag=VAL",
            "title": "Viper Poison Cloud ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Toxic Screen is your map-cutting tool. Use it to slice sites and lanes in half, remove multiple sightlines at once, and force enemies through decay to take space back. You decide when vision is allowed.",
          "setup": "Set Toxic Screen for the round you are actually playing. Once the emitters are down, the line is locked. A bad wall can stall the first hit, then ruin your own retake or post-plant. Plan the whole round before you throw it.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/36db8f44946850c2a20aba43d8ad3ecd977c7d7e.mp4?accountingTag=VAL",
            "title": "Viper Toxic Screen ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Snake Bite to force enemies out or make them pay for staying. It clears close corners, stalls plants and defuses, and applies Vulnerable so any follow-up damage hits harder.",
          "setup": "Snake Bite is strongest when the enemy is forced to stay in it. Use it on planted spike timings, tight chokes, or behind your own Toxic Screen and Poison Cloud. The Vulnerable makes every tick and follow-up bullet hurt more. Don’t waste it in open space where players can just step out.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9eeb3090efed080792e6ea2f264fd60ebb12694e.mp4?accountingTag=VAL",
            "title": "Viper Snake Bite ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
          "purpose": "Use Viper’s Pit to claim a bomb site, anchor a plant, or stall a retake. The ult cuts vision, decays enemies inside it, and forces them to clear you at close range. Plant inside the pit and play for sound, timing, and isolation.",
          "setup": "Set Viper’s Pit so you have more than one playable pocket inside it. If you sit in the same corner every round, the ult becomes a pre-aimed duel. Keep moving, break contact after a kill, and force enemies to clear the whole pit.",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/4601fd972c588a79cdd910b2497546f156886c40.mp4?accountingTag=VAL",
            "title": "Viper's Pit ability demo",
            "source": "https://playvalorant.com/en-us/agents/",
            "provider": "riot"
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
      "uuid": "707eab51-4836-f488-046a-cda6bf494859",
      "source": "https://valorant-api.com/v1/agents/707eab51-4836-f488-046a-cda6bf494859?language=en-US",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "vyse",
      "label": "Vyse",
      "role": "Sentinel",
      "icon": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/efba5359-4016-a1e5-7626-b1ae76895940/fullportrait.png",
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
          "purpose": "Shear is for isolation. Place it where the first enemy crossing commits into space, then the wall cuts off the trade behind them. Use it to punish entries, split pushes, and turn a fair fight into a trapped duel.",
          "setup": "Set Shear before contact. It is a trap, not a reaction tool. Place it from cover where enemies must cross, then get your gun back out and play off the isolation it creates.",
          "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/bacb07fdf5b13efeab5e24168f8e244257c1d0cb.mp4?accountingTag=VAL",
            "title": "Shear",
            "source": "https://playvalorant.com/en-us/agents/vyse/",
            "provider": "riot"
          }
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
          "setup": "Arc Rose is strongest when it is already placed before contact. Put it on a surface from cover, get your gun back out, then trigger the blind when enemies commit to the angle. Do not stand in the open holding the flower while the fight starts.",
          "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/5cefca2b93f097285ce2cb4f20fec7184b555218.mp4?accountingTag=VAL",
            "title": "Arc Rose",
            "source": "https://playvalorant.com/en-us/agents/vyse/",
            "provider": "riot"
          }
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
          "purpose": "Razorvine is your movement tax. Drop it on a choke, spike, or confirmed contact point to slow the hit and punish anyone who keeps moving through it. It gets real value after info, not as a blind guess.",
          "setup": "Razorvine must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
          "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/84154b3401b08acad60d739616017a4fcd86710a.mp4?accountingTag=VAL",
            "title": "Razorvine",
            "source": "https://playvalorant.com/en-us/agents/vyse/",
            "provider": "riot"
          }
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
          "purpose": "Steel Garden is a fight ult, not a damage ult. Use it to start a committed hit or retake, then take space while affected enemies have their primary weapons jammed. The value is the timing window: make them fight with pistols or give up ground.",
          "setup": "Steel Garden is not a panic cast. You have to commit to the equip and fire animation, so use it from cover before the swing, retake, or site hit. Once enemy primaries are jammed, get your gun back out and force the fight before they reset.",
          "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/f9d32afb39a3260b915ea6ef441054c904a69e91.mp4?accountingTag=VAL",
            "title": "Steel Garden",
            "source": "https://playvalorant.com/en-us/agents/vyse/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/efba5359-4016-a1e5-7626-b1ae76895940?language=en-US",
      "uuid": "efba5359-4016-a1e5-7626-b1ae76895940",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "waylay",
      "label": "Waylay",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/df1cb487-4902-002e-5c17-d28e83e78588/fullportrait.png",
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
          "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/189ff46acf7dd27b245631af9a6c51ef95013bb7.mp4?accountingTag=VAL",
            "title": "Refract",
            "source": "https://playvalorant.com/en-us/agents/waylay/",
            "provider": "riot"
          }
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
          "purpose": "Saturate is a reposition tool. Use it to leave a bad fight, take a new angle, or reset behind cover. Pick the endpoint before you cast. Moving without a safe landing spot just hands them the trade.",
          "setup": "Saturate must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
          "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/705b3917c26e9e97c5343d57875cd3404537190b.mp4?accountingTag=VAL",
            "title": "Saturate",
            "source": "https://playvalorant.com/en-us/agents/waylay/",
            "provider": "riot"
          }
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
          "purpose": "Lightspeed is your reposition button. Use it to take space, dodge the first contact, or reset after a fight. Pick the destination and the cover before you press it.",
          "setup": "Lightspeed has equip time. Do not start it in the open. Set it up from cover, trigger the effect, then get your gun back out before you swing or get traded.",
          "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/e06f520d0e844b3c136623c2568137ac47bc54ff.mp4?accountingTag=VAL",
            "title": "Lightspeed",
            "source": "https://playvalorant.com/en-us/agents/waylay/",
            "provider": "riot"
          }
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
          "setup": "Do not set up Convergent Paths in the open. You have to equip it first, which means your gun is down. Start it from cover, let the effect come online, then swap back to your weapon immediately.",
          "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/news/b04a789382009e666cca021889586c6bc00bbaf5.mp4?accountingTag=VAL",
            "title": "Convergent Paths",
            "source": "https://playvalorant.com/en-us/agents/waylay/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/df1cb487-4902-002e-5c17-d28e83e78588?language=en-US",
      "uuid": "df1cb487-4902-002e-5c17-d28e83e78588",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "yoru",
      "label": "Yoru",
      "role": "Duelist",
      "icon": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/displayicon.png",
      "portrait": "https://media.valorant-api.com/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89/fullportrait.png",
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
          "purpose": "FAKEOUT is your decoy and contact check. Send the clone through contested space to pull crosshairs, force a reaction, or punish a shot with a flash. Swing off the hesitation or the blind; do not throw it with no plan to take space.",
          "setup": "Set Fakeout from cover. You are not fighting while the ability is in your hand. Place it before the hit or send it with the team, then pull your gun back out. The clone only creates value if it draws a shot or lets you sell pressure.",
          "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/ef008c8e848a054f88e88f173c03279a45a1c796.mp4?accountingTag=VAL",
            "title": "FAKEOUT",
            "source": "https://playvalorant.com/en-us/agents/yoru/",
            "provider": "riot"
          }
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
          "purpose": "BLINDSIDE is your fight starter. Bounce it off cover so it pops on the angle, then swing, teleport, or send a teammate through while the defender is blind or forced to turn. If no one takes space off it, you wasted the flash.",
          "setup": "Set BLINDSIDE from cover. It only pops after bouncing off a surface, so aim the bounce to detonate in the enemy’s face, not in yours. Throw it, swap back, and swing on the flash timing.",
          "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/295ab26ef6097d28da0bef9c9b4c6185a80071c8.mp4?accountingTag=VAL",
            "title": "BLINDSIDE",
            "source": "https://playvalorant.com/en-us/agents/yoru/",
            "provider": "riot"
          }
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
          "purpose": "GATECRASH is Yoru’s position break. Use it to take space, escape after contact, or sell a fake rotation. Set the tether where you can survive after arriving. A bad teleport just delivers you into a crossfire.",
          "setup": "Gatecrash takes your gun away while you set the tether. Do it from cover, not in the choke. Once the tether is moving or parked, swap back to your weapon and play around the teleport window.",
          "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/be352287c5704d82d1acbff5ecdee5187755d235.mp4?accountingTag=VAL",
            "title": "GATECRASH",
            "source": "https://playvalorant.com/en-us/agents/yoru/",
            "provider": "riot"
          }
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
          "purpose": "Dimensional Drift is your safest info and reposition tool. Use it to walk through contested space, confirm setups, track rotations, and exit where the enemy has to turn. The value is the information and forced crosshair movement; the kill comes after the exit, usually with a flash, Gatecrash, or teammate swing.",
          "setup": "DIMENSIONAL DRIFT must be equipped before use. Prepare it behind cover, then return to the weapon as soon as the stated effect is active.",
          "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US",
          "video": {
            "src": "https://cmsassets.rgpub.io/sanity/files/dsfx7636/game_data/9ca7fac6ec9514fa06b9785aad2ead0c3fba0eec.mp4?accountingTag=VAL",
            "title": "DIMENSIONAL DRIFT",
            "source": "https://playvalorant.com/en-us/agents/yoru/",
            "provider": "riot"
          }
        }
      ],
      "source": "https://valorant-api.com/v1/agents/7f94d92c-4234-0a36-9646-3a87eb8b5c89?language=en-US",
      "uuid": "7f94d92c-4234-0a36-9646-3a87eb8b5c89",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    }
  ],
  "maps": [
    {
      "id": "abyss",
      "label": "Abyss",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png",
      "layoutImage": "/assets/library/maps/abyss-layout-trn.png",
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
      "macro": {
        "attack": [
          "Abyss is a mid-control map. If you ignore mid, defenders keep fast rotates, high-low angles, and flank timings. Take mid pressure early, then decide whether you are splitting A, splitting B, or forcing defenders to over-rotate.",
          "Site hits need space before the spike crosses the choke. A Main and B Main are both punishable if you walk in dry. Use utility to clear the close ledges, tower angles, and back-site positions before your planter commits."
        ],
        "defense": [
          "Do not give mid for free. Abyss rotations and split pressure run through mid. Fight for it with utility, get info, then fall back alive. If attackers own mid uncontested, both sites become pinched.",
          "Abyss retakes are dangerous because the sites have vertical angles and fall-off edges. Save utility for the retake. If you spend everything fighting the first choke, you retake into crossfires with no tools."
        ]
      },
      "siteTips": [
        {
          "label": "A Main",
          "text": "A Main contact is not enough for an A hit. Clear the close site angles and the elevated defender positions before the spike moves in. If you rush the plant, one defender swings from height or back site and your whole hit stalls.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Tower",
          "text": "A Tower cannot stay live during an A execute. It watches too much of the site and punishes the planter. Smoke it, flash it, or pressure it from mid. Ignoring it turns every A plant into a gamble.",
          "roles": [
            "Controller",
            "Initiator"
          ]
        },
        {
          "label": "Mid",
          "text": "Mid is the map’s pressure valve. Taking it forces defenders to watch split routes instead of stacking the main choke. Losing it on attack means every site hit is frontal and easy to read.",
          "roles": [
            "Initiator",
            "Sentinel"
          ]
        },
        {
          "label": "B Main",
          "text": "B Main hits need the close corners and back-site angles cleared before the dash or satchel goes in. Do not let the entry jump into three unchecked fights. Layer the reveal, flash, and smoke, then trade immediately.",
          "roles": [
            "Duelist",
            "Controller"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Split before you commit",
          "text": "Abyss rewards split pressure. Pair main pressure with mid pressure before the execute. If five players hit one choke, defenders hold a simple crossfire and rotate early."
        },
        {
          "label": "Respect the edges",
          "text": "Do not wide-swing near drop-offs like it is a normal map. Utility displacement and panic movement can throw players off the map. Take tighter fights and clear angles before jumping across gaps."
        },
        {
          "label": "Keep flank control",
          "text": "Long rotations and mid routes make late flanks strong. Leave a trip, turret, alarmbot, or player watching the path. If your whole team stares at site, the retake starts behind you."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "You are not here to dry peek Abyss angles one by one. Call for the reveal or flash, then take A Main, B Main, or mid space with speed. If you pause in the choke, your team gets spammed and stalled."
          },
          {
            "category": "teamplay",
            "text": "Entry paths on Abyss need a trade plan. Dash, satchel, or swing into a cleared pocket, not into the whole site. If your team cannot trade you, you went too deep."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Your first job is clearing the choke and the height. Use recon, drone, dog, or flash before the duelist crosses A Main, B Main, or mid. Dry entry on this map is a throw."
          },
          {
            "category": "teamplay",
            "text": "Save one piece of utility for the second layer of the hit. Abyss sites have too many back-site and elevated positions to dump everything at the choke. Clear entry, then clear the plant fight."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "Your smokes must cut tower and defender rotation sightlines before the spike plants. On A, deny the elevated defender angle. On B, block the main retake lanes and isolate back site. Bad smokes leave the planter exposed."
          },
          {
            "category": "teamplay",
            "text": "Refresh smokes for the post-plant or retake. Abyss rounds often stall around vertical angles and narrow bridges. If your cover fades before the spike is safe, the enemy walks back in for free."
          }
        ],
        "Sentinel": [
          {
            "category": "defense",
            "text": "Anchor with info, not ego. Abyss sites are hard to hold alone if attackers split through mid. Use utility to slow the first lane, call the split, and stay alive for the retake."
          },
          {
            "category": "teamplay",
            "text": "On attack, your flank utility matters every round. Mid and long rotate paths create late lurks. If you do not cover the back, your team loses post-plant to a timing they should have seen."
          }
        ]
      },
      "source": "https://valorant-api.com/v1/maps/224b0a95-48b9-f703-1bd8-67aca101a61f?language=en-US",
      "uuid": "224b0a95-48b9-f703-1bd8-67aca101a61f",
      "coordinates": "70° 50' AJ\" N, 9° 00' VX\" W",
      "calloutLabelsBakedIn": true,
      "dataStatus": "in-review",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02"
    },
    {
      "id": "ascent",
      "label": "Ascent",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png",
      "layoutImage": "/assets/library/maps/ascent-layout-trn.png",
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
      "macro": {
        "defense": [],
        "attack": []
      },
      "siteTips": [],
      "teamplayTips": [],
      "roleNotes": {},
      "source": "https://valorant-api.com/v1/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319?language=en-US",
      "uuid": "7eaecc1b-4337-bbf6-6ab9-04b8f06b3319",
      "coordinates": "45°26'BF'N,12°20'Q'E",
      "calloutLabelsBakedIn": true,
      "dataStatus": "in-review",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "bind",
      "label": "Bind",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba/splash.png",
      "layoutImage": "/assets/library/maps/bind-layout-trn.png",
      "calloutLabelsBakedIn": true,
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
      "uuid": "2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba",
      "coordinates": "34°2'A'N,6°51'Z'W",
      "source": "https://valorant-api.com/v1/maps/2c9d57ec-4431-9c5e-2939-8f9ef6dd5cba?language=en-US",
      "dataStatus": "verified",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "breeze",
      "label": "Breeze",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53/splash.png",
      "layoutImage": "/assets/library/maps/breeze-layout-trn.png",
      "calloutLabelsBakedIn": true,
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
      "uuid": "2fb9a4fd-47b8-4e7d-a969-74b4046ebd53",
      "coordinates": "26°11'AG\"N 71°10'WY\"W",
      "source": "https://valorant-api.com/v1/maps/2fb9a4fd-47b8-4e7d-a969-74b4046ebd53?language=en-US",
      "dataStatus": "verified",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "corrode",
      "label": "Corrode",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/splash.png",
      "layoutImage": "/assets/library/maps/corrode-layout-trn.png",
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
      "macro": {
        "attack": [
          "Corrode plays close to even, so do not expect the map to carry you. Win early space, keep a lurk or flank watch alive, and finish with numbers. Dry five-man hits give defenders clean utility value.",
          "Mid control matters because it changes both sites. If you ignore Mid, defenders rotate safely and stack the obvious hit. Pressure Mid early, then choose whether to split A, split B, or punish the rotate."
        ],
        "defense": [
          "Defense is only slightly favored, so do not over-peek for free. Take one early fight with utility, then fall back into crossfires. If you die forward alone, the site collapses before the rotate arrives.",
          "Do not give attackers both Main and Mid pressure at the same time. Contest one lane and have info utility on the other. If you play fully passive, they walk into a split and your anchors get pinched."
        ]
      },
      "siteTips": [
        {
          "label": "A Main",
          "text": "Do not let A Main become free staging space. If attackers get close with full utility, the anchor has to fight the hit and the plant at the same time. Contest it early or retake it with a pair.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "B Main",
          "text": "B Main control decides how clean the B hit is. A late smoke at the choke is not enough if attackers are already up close. Use damage, recon, or a flash before they reach the execute timing.",
          "roles": [
            "Initiator",
            "Controller"
          ]
        },
        {
          "label": "Mid",
          "text": "Mid is not optional. It is the lane that turns a normal site hit into a split. If your team gives it away with no info, the site player has to guess which angle becomes live first.",
          "roles": [
            "Initiator",
            "Sentinel"
          ]
        },
        {
          "label": "Defender Spawn",
          "text": "On attack, block the Defender Spawn rotation before the plant finishes. If spawn stays open, defenders retake together and pressure the planter for free. Smoke it, hold it, or expect the swing.",
          "roles": [
            "Controller",
            "Duelist"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Split before you execute",
          "text": "Do not hit a site from one doorway unless you already pulled rotation utility. Pair Main pressure with Mid pressure. One choke makes every molly, stun, and smoke worth too much."
        },
        {
          "label": "Trade the first lane fight",
          "text": "The first fight decides the round shape. Send two players for early space, not one hero dry-peeking. If the first player dies untraded, the other team gets the lane and the timing."
        },
        {
          "label": "Keep flank control honest",
          "text": "Corrode rounds punish lazy rotations. Leave a trip, turret, alarmbot, or player watching the push. If nobody owns the backline, defenders will walk through the space you abandoned."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Your job is to take the first real space, not wait behind the pack. Call for the flash or reveal, then break A Main, B Main, or Mid timing. If you enter late, your team burns utility for nothing."
          },
          {
            "category": "defense",
            "text": "Take early space only with support. One aggressive kill is good. One aggressive death gives attackers the lane, the orb, and the tempo."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Use recon, drone, dog, or flash before your duelist crosses the first choke. Clearing late is useless. The entry needs the information before contact, not after they are dead."
          },
          {
            "category": "defense",
            "text": "Save at least one piece of utility for the actual hit. Early info is valuable, but if you dump everything in the first ten seconds, the site anchor has no help when the execute starts."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "Your smokes must cut rotations and remove the strongest site crossfire. Do not smoke just because the hit starts. Smoke when your team is ready to cross and plant."
          },
          {
            "category": "attack",
            "text": "If your team is splitting from Mid, smoke for both sides of the pinch. A Main-only smokes do not protect the Mid players, and Mid-only smokes leave the planter exposed."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Own the flank every attack round. Put utility where it gives warning before the defender is already in spawn behind you. If your team has to turn around during the execute, the hit is dead."
          },
          {
            "category": "defense",
            "text": "Anchor with the goal of staying alive through first contact. Delay the plant, call numbers, and let the rotate arrive. Dying for one kill is not enough if the site is lost instantly."
          }
        ]
      },
      "source": "https://valorant-api.com/v1/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115?language=en-US",
      "uuid": "1c18ab1f-420d-0d8b-71d0-77ad3c439115",
      "coordinates": "48° 38' FH\" N8, 1° 33' YV\" W8",
      "calloutLabelsBakedIn": true,
      "dataStatus": "in-review",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02"
    },
    {
      "id": "fracture",
      "label": "Fracture",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png",
      "layoutImage": "/assets/library/maps/fracture-layout-trn.png",
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
      "macro": {
        "attack": [
          "Fracture is attack-favored because defenders must cover both fronts of each site. Do not five-man one choke by default. Pressure A Main with A Dish, or B Main with Arcade, and make the site players turn their backs.",
          "Your round is weak if both sides of the map are quiet. Hold spawn exits, threaten late Dish or Arcade, and punish defenders who over-rotate through Defender Spawn. Fracture gives you free map split options. Use them."
        ],
        "defense": [
          "Defense on Fracture is about taking one piece of forward space early. Fight for A Main, Dish, B Main, or Arcade with utility, then leave alive. If you give every lane for free, attackers hit both sides of a site and your crossfire dies.",
          "Do not rotate off sound alone. Fracture attackers can show on one side and finish through the other fast. Keep anchor discipline until spike is seen or your forward info confirms the hit."
        ]
      },
      "siteTips": [
        {
          "label": "A Dish",
          "text": "A is not secure until Dish is controlled or watched. A Dish attackers can pinch Drop, clear site backs, and cut off rotations through Defender Spawn. If you ignore it, your A Main hit gets shot in the side.",
          "roles": [
            "Duelist",
            "Sentinel"
          ]
        },
        {
          "label": "A Drop",
          "text": "Drop is a timing trap. Jumping down without a flash, stun, or teammate swinging A Main gives defenders a free isolated kill. Clear below Drop and site together, or wait.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Rope",
          "text": "A Rope controls too much of the retake. If defenders keep Rope, they can swing site, pressure default, and reconnect to Defender Spawn. Smoke it, clear it, or plant for a setup that punishes the swing.",
          "roles": [
            "Controller",
            "Initiator"
          ]
        },
        {
          "label": "B Arcade",
          "text": "B hits are much stronger with Arcade pressure. Arcade splits Tower and Canteen defenders from the back while B Main holds the front. If you only hit B Main, you run into the cleanest crossfires on the map.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "B Tower",
          "text": "B Tower must be cleared or smoked before the plant. A defender in Tower sees the site, the planter, and the B Main exit. Leave it open and your plant is not a plant, it is a coin flip.",
          "roles": [
            "Controller",
            "Duelist"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Hit from two fronts",
          "text": "Fracture rewards synchronized pressure. Call the pinch before the barrier drops. A Main plus Dish, or B Main plus Arcade. If one group waits too long, the other group dies alone."
        },
        {
          "label": "Keep one lane watched",
          "text": "Flanks are constant on Fracture because defenders can push behind both attacker spawns. Leave a trip, alarmbot, turret, or live body on the lane you give up. If nobody owns it, your post-plant gets collapsed."
        },
        {
          "label": "Retake through contact",
          "text": "Defensive retakes need grouped contact. Do not flood one doorway while the other two teammates are still rotating. Wait for Arcade, Spawn, or Rope pressure to line up, then swing together."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Your job is to break the first choke and let the split happen. Take A Main, Drop, B Main, or Arcade with utility behind you. If you lurk while your team walks in first, you are wasting the map."
          },
          {
            "category": "attack",
            "text": "On Fracture, entry timing matters more than raw speed. Do not dash or satchel into site while the other side of the split is still outside. Wait for contact, then explode and trade the crossfire."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Use your reveal, drone, dog, flash, or stun to win the lane before the site hit. A Dish, A Main, B Main, and Arcade all need help. Dry clearing those angles burns your duelist for no reason."
          },
          {
            "category": "attack",
            "text": "Save utility for Tower, Rope, Drop, and close site pockets. Fracture sites have too many layered angles for one entry to clear alone. If your utility all goes into the first choke, the plant still dies."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "Your smokes must cut the retake lanes, not just the first sightline. On A, block Rope and Defender Spawn pressure. On B, block Tower and Canteen or Spawn depending on the hit. One open lane is enough to break the plant."
          },
          {
            "category": "sites",
            "text": "Fracture rewards controllers who stay alive for the post-plant. Use early smoke to cross, then keep a second layer for the defuse fight. If you spend everything on entry, defenders retake through clean vision."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Your flank utility has to cover the side your team abandoned. Dish, A Main, B Main, and Arcade are all live flank routes. Put the trap deep enough to warn the team before the flank is already shooting."
          },
          {
            "category": "teamplay",
            "text": "On defense, anchor with the goal of delaying, not dying first. Fracture sites get pinched fast. Trip one side, play off contact, and buy time for the rotate instead of taking a solo hero fight."
          }
        ]
      },
      "source": "https://valorant-api.com/v1/maps/b529448b-4d60-346e-e89e-00a4c527a405?language=en-US",
      "uuid": "b529448b-4d60-346e-e89e-00a4c527a405",
      "coordinates": "35°48'BI\"N 106°08'YQ\"W",
      "calloutLabelsBakedIn": true,
      "dataStatus": "in-review",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02"
    },
    {
      "id": "haven",
      "label": "Haven",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png",
      "layoutImage": "/assets/library/maps/haven-layout-trn.png",
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
      "macro": {
        "attack": [
          "Haven has three sites, so defenders cannot hold everything with bodies. Your default must threaten A Long, Garage, and C Long enough to pull utility. If you group five early, defense reads the hit and stacks before you are ready.",
          "Mid and Garage decide the map. If you own Garage, C loses its safest support and B becomes harder to hold. If you ignore it, defenders rotate through Spawn and Garage for free and every site hit becomes a retake setup.",
          "Do not treat B as a full site hit unless you have pressure elsewhere. B is small, exposed from both sides, and easy to retake. Use B pressure to split A or C, or punish over-rotations when defenders abandon it."
        ],
        "defense": [
          "Haven defense is about information, not sitting five players deep. Fight for one early lane — A Long, A Short, Garage, or C Long — then fall back alive. If you give all three sites for free, attack walks into the weakest gap.",
          "Garage control is the hinge. Losing Garage gives attackers a C split, B pressure, and a fast rotate path. If you cannot hold it, take information somewhere else immediately or you will get pulled apart.",
          "Retakes are common because three sites stretch you thin. Save utility for the retake instead of dumping it all on first contact. If your site anchor dies after using everything, the round is usually over."
        ]
      },
      "siteTips": [
        {
          "label": "A Long",
          "text": "A Long is not just an entry lane. It controls the plant pressure on A and forces defenders in Heaven and site to split attention. If attackers walk up Long for free, A becomes hard to anchor.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Short",
          "text": "A Short breaks the common A crossfire. Hitting A from only Long lets defenders play Heaven, site, and default angles comfortably. Add Short pressure or expect the entry to get stalled.",
          "roles": [
            "Duelist",
            "Controller"
          ]
        },
        {
          "label": "Garage",
          "text": "Garage is the center of Haven. Control it before committing C or B. A defender left in Garage can flank C, fight Window, or collapse on B while your team is planting.",
          "roles": [
            "Initiator",
            "Sentinel"
          ]
        },
        {
          "label": "C Long",
          "text": "C Long is a long, utility-heavy lane. Dry walking into it feeds the anchor or the Operator. Clear close, force back site and Platform pressure, then plant with Spawn and Garage accounted for.",
          "roles": [
            "Duelist",
            "Controller"
          ]
        },
        {
          "label": "B Site",
          "text": "B is easy to enter and easy to retake. Do not plant B without blocking both sides of Spawn pressure and checking links. If you plant and everyone hides, defenders collapse from A Link, C Link, and Spawn.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Pressure two lanes before the hit",
          "text": "Haven punishes single-lane hits. Pair A Long with A Short, or C Long with Garage. One lane contact gets stalled. Two lane contact breaks the anchor."
        },
        {
          "label": "Call defender rotations early",
          "text": "Every sound and utility trade matters on Haven because three sites stretch defense. If you pull two defenders to A, say it. That is the cue to hit C, split Garage, or walk into B."
        },
        {
          "label": "Retake with grouped timing",
          "text": "Do not retake Haven sites one doorway at a time. Wait for Heaven and Short on A, Garage and Spawn on C, or both links on B. Solo swings give attackers free isolation."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Take the first real space, not the safest fight. A Long, A Short, Garage, and C Long all need a body willing to cross the choke. If you wait behind your team, the defense keeps every rotation intact."
          },
          {
            "category": "attack",
            "text": "On A, do not dash or satchel into site while Short is unchecked. You will land between Heaven, site, and close angles with no trade. Make the split timing real or slow down."
          },
          {
            "category": "attack",
            "text": "On C hits, clear close and force the back-site player before the spike crosses. If you only run down Long, one anchor can stall the whole round while rotations flood in."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Your early utility should answer where the defense is fighting. Drone, dog, flash, or reveal A Long, Garage, or C Long before your entry walks in. Dry contact into Haven lanes is lazy and expensive."
          },
          {
            "category": "attack",
            "text": "Garage needs support utility every time you plan to use it. Clear Window, close Garage, and the C Link side before calling the split. Half-cleared Garage gets your lurk killed and ruins the timing."
          },
          {
            "category": "attack",
            "text": "Save one piece of utility for post-plant or retake denial. Haven sites get retaken fast from multiple doors. If all your flashes and recon are gone on entry, holding the spike becomes guesswork."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "On A hits, block Heaven and CT/Spawn pressure before the plant. If Short is not controlled, account for it with utility or positioning. Leaving Heaven open makes default plant a coin flip."
          },
          {
            "category": "sites",
            "text": "On C hits, smoke Defender Spawn and manage Garage pressure. C Long alone is not enough. If Garage stays open, defenders pinch the plant and your post-plant gets split."
          },
          {
            "category": "sites",
            "text": "B needs smokes on both sides, not one comfort smoke. Cut A Link and C Link or Spawn pressure based on the hit. B is too small to survive open sightlines from both doors."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Your flank setup decides whether the three-site attack can rotate safely. Watch A Lobby, Mid/Garage routes, or C Lobby depending on the default. If the trip is too deep to matter, your team rotates blind."
          },
          {
            "category": "teamplay",
            "text": "On defense, anchor with survival in mind. Your job is to delay long enough for rotates, not die after one kill. Haven retakes are winnable only if the site player buys time."
          },
          {
            "category": "teamplay",
            "text": "In post-plant, lock the retake path your team is not watching. A has Heaven and Short pressure. C has Spawn and Garage. B has both links. Cover the gap or the pinch is free."
          }
        ]
      },
      "source": "https://valorant-api.com/v1/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047?language=en-US",
      "uuid": "2bee0dc9-4ffe-519b-1cbd-7fbe763a6047",
      "coordinates": "27°28'A'N,89°38'WZ'E",
      "calloutLabelsBakedIn": true,
      "dataStatus": "in-review",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02"
    },
    {
      "id": "icebox",
      "label": "Icebox",
      "uuid": "e2ad5c54-4114-a870-9641-8ea21279579a",
      "coordinates": "76°44' A\"N 149°30' Z\"E",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png",
      "layoutImage": "/assets/library/maps/icebox-layout-trn.png",
      "calloutLabelsBakedIn": true,
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
      "dataStatus": "verified",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02",
      "macro": {
        "attack": [
          "Icebox attack is built around vertical pressure and late lurks. A Site and B Site both have too many angles to clear by walking in dry. Use mid, Tube, Kitchen, and under-site pressure to split defenders instead of five-manning one choke.",
          "A hits need fast space or they die in the rafters crossfire. Clear Belt, Pipes, Nest, and close site with utility before the spike commits. If the planter is exposed on default with no screens or rafters control, the round is already coinflip.",
          "B is not just B Main. If you never pressure Mid or Kitchen, defenders can stack Yellow, Snowman, and site for free. Take B Main control, force utility at Yellow, then decide if you are hitting, cutting rotations, or resetting."
        ],
        "defense": [
          "Icebox defense is about delaying the plant, not holding every inch. A and B both let attackers plant under pressure if you give the choke for free. Spend utility early, fall back alive, and make the post-plant cost them bodies.",
          "Do not over-rotate off sound on Icebox. Attackers can fake A noise, walk back through spawn, and hit B late with mid pressure. Keep one player responsible for the other side until spike is confirmed.",
          "Mid control decides whether your sites get split. If attackers own Tube and Kitchen for free, B rotations get cut and A players get trapped. Fight or utility mid every round, even if you are not peeking it."
        ]
      },
      "siteTips": [
        {
          "label": "A Belt and Pipes",
          "text": "A attackers cannot ignore Belt and Pipes. Those angles see the choke, the plant path, and the first entry route. Clear them with movement and utility before your team crosses into site.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Screens",
          "text": "Screens control makes the A plant safer and makes the retake worse for defenders. If Screens is open, the planter gets spammed or swung from deep site for free. Smoke it, clear it, or plant for a different fight.",
          "roles": [
            "Controller",
            "Duelist"
          ]
        },
        {
          "label": "B Yellow",
          "text": "Yellow is the first real fight on B. If attackers take it cleanly, they can plant and play deep post-plant. If defenders keep it or trade it late, the plant gets delayed and B Main gets trapped.",
          "roles": [
            "Duelist",
            "Sentinel"
          ]
        },
        {
          "label": "Mid Tube",
          "text": "Tube pressure changes the whole map. Attackers using Tube threaten Kitchen and B splits. Defenders holding or breaking Tube control keep rotations clean and stop the lurk from winning the round by itself.",
          "roles": [
            "Initiator",
            "Sentinel"
          ]
        },
        {
          "label": "Kitchen",
          "text": "Kitchen is the defender rotation anchor. If attackers own Kitchen, B players cannot rotate safely and Snowman gets pinched. If defenders keep it, B retakes stay organized.",
          "roles": [
            "Sentinel",
            "Controller"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Do not dry walk A",
          "text": "A Site has too much vertical cover for solo clearing. Pair entry movement with recon, flash, drone, or suppression. One player clears high, one player clears close, then the spike crosses."
        },
        {
          "label": "Pair B Main with mid pressure",
          "text": "B Main alone stalls at Yellow. Add Mid, Tube, or Kitchen pressure so defenders cannot stack every rifle toward B Main and Snowman. If no one cuts the rotation, your post-plant gets flooded."
        },
        {
          "label": "Retake together",
          "text": "Icebox retakes fail when players climb in one by one. Wait for the flank, clear the common post-plant spots, then swing the spike together. The map has too many boxes for hero clears."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "On A, your job is to break the first layer. Take Belt, Pipes, or close site with utility behind you. If you stop in the choke, the planter never gets a real timing."
          },
          {
            "category": "attack",
            "text": "On B, fight for Yellow or force defenders off it. Do not dash or satchel past every trade angle with no one ready. B post-plant is strong only if your team keeps bodies alive."
          },
          {
            "category": "attack",
            "text": "Use vertical movement to clear vertical angles. Icebox punishes flat entries. If you never challenge high ground, defenders keep free crossfires all half."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Your utility must clear the angles the entry cannot check at the same time. On A, reveal or drone high and close. On B, clear Yellow, site, and Snowman before the spike commits."
          },
          {
            "category": "attack",
            "text": "Mid needs information every round. Use recon, drone, dog, flash, or knife to see if Tube and Kitchen are being fought. If the lurk dies blind, you gave away the split."
          },
          {
            "category": "attack",
            "text": "Save utility for the plant and post-plant. Icebox spikes get spammed constantly. A late flash, reveal, or molly wins more rounds than dumping everything at the barrier."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "On A hits, block the defender sightlines that see the plant first. Screens and rafters pressure matter more than pretty smokes. If the spike crosses open, your smoke plan failed."
          },
          {
            "category": "sites",
            "text": "On B, your smoke must help the team take space around Yellow and cut the deep defender angle toward Snowman or site. A smoke that leaves the planter exposed does nothing."
          },
          {
            "category": "sites",
            "text": "Use walls and smokes to split the vertical mess, not to hide from it. Icebox sites have layered angles. Cut one layer, clear the next, then plant."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Your flank utility has to cover long rotations and mid lurks. Watch attacker spawn routes, Tube pressure, and late Kitchen contact. If mid is open, your team cannot trust either site hit."
          },
          {
            "category": "teamplay",
            "text": "On defense, anchor with delay instead of ego peeking. A and B both give attackers plant lanes if you die early. Slow the hit, stay alive, and let the rotate arrive."
          },
          {
            "category": "teamplay",
            "text": "In post-plant, play your utility around the spike path, not random corners. Icebox plants are spammed and defused through pressure. Make the defuse costly and swing with the contact."
          }
        ]
      }
    },
    {
      "id": "lotus",
      "label": "Lotus",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png",
      "layoutImage": "/assets/library/maps/lotus-layout-trn.png",
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
      "macro": {
        "attack": [
          "Lotus is a three-site map, so the defense is always thin somewhere. Take early space, make defenders rotate, then hit the weak site. If you rush the first choke every round, defenders stack utility and farm you.",
          "A control drives the map. A Main, A Root, and Rubble decide whether defenders can fight forward or have to play retake. Win that area and you can pressure A, pivot through the rotating door, or pull defenders off B and C.",
          "Use the doors with a plan. The A Door and C Door are loud and commit attention. Open them to split a site or fake pressure, not because someone felt like pressing the button."
        ],
        "defense": [
          "You cannot hard-hold all three sites on Lotus. Fight for one forward zone early, usually A Main/Rubble or C Main, then fall back alive. If you give every lane for free, attack gets to choose the weakest site with full utility.",
          "Retake discipline matters more than hero anchoring. B and C can be retaken if you keep numbers and deny clean post-plant space. Dying alone behind site box just gives attack the round before the rotate arrives.",
          "Track door pressure. If attackers open A Door or C Door and nobody owns the other side, your site crossfire is broken. Call it instantly and either fight it together or concede into retake."
        ]
      },
      "siteTips": [
        {
          "label": "A Main / Rubble",
          "text": "A is decided before the site hit. If attackers get A Main and Rubble for free, defenders lose the best early fight and the rotate door becomes a real threat. Contest it with utility or give it and call retake early.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "A Door",
          "text": "The A Door changes the site from a front hit into a pinch. Do not plant A while the door side is unchecked. A defender swinging from Tree or through the door ruins the plant and splits your trades.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        },
        {
          "label": "B Site",
          "text": "B is small and exposed. You do not need five people sprinting into the same doorway. Smoke the main defender angles, clear close corners, plant fast, then get out into crossfires before the retake utility lands.",
          "roles": [
            "Duelist",
            "Controller"
          ]
        },
        {
          "label": "C Main",
          "text": "C Main is a long choke, so dry walking it loses rounds. Use stun, flash, drone, dog, or smoke to take the first space. If defenders keep C Main control, your C hit arrives late and gets flanked.",
          "roles": [
            "Initiator",
            "Duelist"
          ]
        },
        {
          "label": "C Door",
          "text": "C Door gives attackers a clean split if defenders ignore it. If your team hits C only from Main, site players can stare at one choke. Open or threaten the door to break that hold.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Do not five-man one choke",
          "text": "Lotus punishes single-lane hits. Pair A Main with A Door pressure, C Main with C Door pressure, or B pressure with map control behind it. One choke means one smoke, one molly, and your round is dead."
        },
        {
          "label": "Take space, then leave",
          "text": "Early control is not a marriage. Fight for A Main or C Main, force utility, then rotate if the site is stacked. The map is built for pivots. Use them."
        },
        {
          "label": "Retake with numbers",
          "text": "On defense, stop feeding the first plant sound. Lotus sites are retakable when three players arrive together with utility. One player swinging early just gives attack a free post-plant setup."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Your first job is taking A Main, Rubble, or C Main space with help. Ask for the flash, stun, drone, or smoke, then go. If you wait in the choke, the defense rotates and your team loses the map."
          },
          {
            "category": "attack",
            "text": "On B hits, entry fast and clear close. B is too small for slow shoulder-peeking. Create the first trade window, then let the planter work."
          },
          {
            "category": "attack",
            "text": "Use door pressure to split, not to lurk uselessly. If your team is hitting A or C, be ready to explode off the door timing. Late contact after everyone dies is not a split."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Lotus chokes are utility checks. Clear A Main, Rubble, C Main, and close B with recon, dog, drone, flash, or stun before your duelist crosses. Dry entry is your fault as much as theirs."
          },
          {
            "category": "attack",
            "text": "Save one piece of utility for the door fight. A Door and C Door swings decide split hits. If you spend everything at the first choke, your team walks into the second fight blind."
          },
          {
            "category": "attack",
            "text": "On defense, use info utility early and rotate off it. Lotus rotations are about knowing which site is real. If your reveal finds nothing A Main or C Main, say it fast and move the defense."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "On A hits, smoke the main defender sightlines before the plant and respect Tree/A Door pressure. If the door side is open, your smoke plan is incomplete."
          },
          {
            "category": "sites",
            "text": "On B, cut the defender angles quickly and keep the plant simple. The site is cramped, so late smokes lose value. Smoke before contact, not after the entry dies."
          },
          {
            "category": "sites",
            "text": "On C, block the back-site and rotate sightlines so your team can leave C Main. If everyone stays trapped in Main after the plant, the retake collapses on you."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Your flank utility has to cover the long rotates and late pushes, not sit in the first obvious break spot. Lotus attackers rotate a lot. If you give no warning, your team gets pinched."
          },
          {
            "category": "teamplay",
            "text": "On defense, anchor with delay, not ego. A molly, trip, alarmbot, wall, or slow that buys five seconds is worth more than dying alone on site before the rotate starts."
          },
          {
            "category": "teamplay",
            "text": "If your team takes early A or C space, lock the gap behind them. Forward control only works if nobody walks through the empty lane and kills the rotators."
          }
        ]
      },
      "source": "https://valorant-api.com/v1/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9?language=en-US",
      "uuid": "2fe4ed3a-450a-948b-6d6b-e89a78e680a9",
      "coordinates": "14°07'AD.4\"N8 74°53'XY\"E8",
      "calloutLabelsBakedIn": true,
      "dataStatus": "in-review",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02"
    },
    {
      "id": "pearl",
      "label": "Pearl",
      "inCompetitivePool": false,
      "cardImage": "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png",
      "layoutImage": "/assets/library/maps/pearl-layout-trn.png",
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
      "macro": {
        "attack": [
          "Pearl is won through Mid pressure. If you only hit A Main or B Main, defenders keep full site crossfires and rotate cleanly. Take Mid Doors, Mid Connector, or Art before you commit.",
          "B Long is powerful but obvious. The lane is long, the Operator is common, and the plant is exposed from B Hall and Screens. Use utility to cross, clear close, and either plant with control or leave before the defense stacks.",
          "A hits need depth. Taking A Main is not enough. Clear Art or force defenders off A Link, or the site players fight once and the rotators kill the planter from the side."
        ],
        "defense": [
          "Do not give Mid for free. Pearl has too many split routes once attackers own Mid. Fight it early with utility, then fall back alive before you get pinched.",
          "B Long needs a plan every round. Either contest it with an Operator, flash, or recon, or play retake with utility saved. Standing passive on site while attackers walk to the plant gives them the round.",
          "A defense is about denying the split. If attackers have A Main and Art, site is boxed in. Hold one lane with intent, call the pressure early, and do not die alone behind default."
        ]
      },
      "siteTips": [
        {
          "label": "B Long",
          "text": "Respect the long sightline. Dry peeking B Long into an Operator loses the round before it starts. Use flash, drone, smoke, or shoulder pressure before you commit bodies.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "B Site Plant",
          "text": "The default B plant is not free. B Hall, Screens, and site back angles can all pressure the planter. Smoke the key defender angle and have someone hold the swing, or the plant dies in the open.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        },
        {
          "label": "Mid Doors",
          "text": "Mid Doors controls the map. Attackers use it to split B through Link or threaten rotations. Defenders who lose it must respect late lurks and cannot rotate cleanly.",
          "roles": [
            "Initiator",
            "Sentinel"
          ]
        },
        {
          "label": "A Art",
          "text": "Art is the pressure point for A. If attackers own Art, A Link and site defenders cannot hold a simple front crossfire. If defenders keep Art, A Main hits get stalled and trapped.",
          "roles": [
            "Duelist",
            "Controller"
          ]
        },
        {
          "label": "A Main",
          "text": "A Main is narrow enough to stall hard. Do not send the entry through a smoke or molly with no trade path. Clear close corners first, then fight site and Link together.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Split before you hit",
          "text": "Pearl punishes single-lane hits. Pair A Main with Art, or B Long with Mid control. One lane lets defenders stack crossfires. Two lanes breaks them."
        },
        {
          "label": "Call Mid ownership",
          "text": "Mid control changes every rotation. Say who owns Doors, Connector, and Art before anyone leaves a site. Silent rotations get killed by the lurk you forgot existed."
        },
        {
          "label": "Retake with utility, not ego",
          "text": "Pearl retakes are playable if you have smokes, flashes, and recon. They are terrible if everyone saves utility for duels and walks into post-plant angles one at a time."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Your job is to break the first lane, not stare at it. On Pearl that means B Long, A Main, Art, or Mid Doors. Ask for the setup, take the space, and force the defense to move."
          },
          {
            "category": "attack",
            "text": "Do not dash or satchel onto B Site with no plant plan. If Hall and Screens are live, you are entering into a box. Clear the danger or create enough chaos for the plant."
          },
          {
            "category": "attack",
            "text": "On A, entry through Main is weaker without Art pressure. If your team has no split, you must clear close, fight site fast, and expect the Link swing."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Use early utility to answer the Operator question on B Long and Mid. If your duelist finds that answer with their face, you wasted the round."
          },
          {
            "category": "attack",
            "text": "Your recon should enable splits. Clear Art for A pressure, Doors for Mid control, or close B Long before the hit. Random scans that do not move the team are noise."
          },
          {
            "category": "attack",
            "text": "Save at least one piece of utility for the plant or retake denial. Pearl post-plants are angle-heavy, and a late flash or reveal wins more than another early fake."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "On B hits, cut the long defender sightlines before the cross and plant. Screens, Hall, and Defender Spawn pressure the site hard. If one stays open, someone must hold it."
          },
          {
            "category": "sites",
            "text": "On A hits, smoke the rotation and side pressure your team does not control. If you have no Art, A Link matters. If you have no Main depth, site angles matter."
          },
          {
            "category": "sites",
            "text": "Mid smokes are not optional. Blocking Doors, Connector, or Art at the right time decides whether your team can rotate safely or gets split in half."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Your flank setup has to cover Mid movement. Pearl lurks often come through Doors, Connector, or Art. If your utility only watches spawn, it is late information."
          },
          {
            "category": "teamplay",
            "text": "On defense, anchor with survival in mind. A lone kill is fine, but staying alive behind utility delays the split and buys the rotate. Dying early opens the whole site."
          },
          {
            "category": "teamplay",
            "text": "In post-plant, play off the planted bomb and your utility. Pearl gives attackers strong long-range post-plant positions, especially on B. Do not abandon that advantage for a random close fight."
          }
        ]
      },
      "source": "https://valorant-api.com/v1/maps/fd267378-4d1d-484f-ff52-77821ed10dc2?language=en-US",
      "uuid": "fd267378-4d1d-484f-ff52-77821ed10dc2",
      "coordinates": "38°42'ED\"N8 9°08'XS\"W8",
      "calloutLabelsBakedIn": true,
      "dataStatus": "in-review",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02"
    },
    {
      "id": "split",
      "label": "Split",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/d960549e-485c-e861-8d71-aa9d1aed12a2/splash.png",
      "layoutImage": "/assets/library/maps/split-layout-trn.png",
      "calloutLabelsBakedIn": true,
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
      "uuid": "d960549e-485c-e861-8d71-aa9d1aed12a2",
      "coordinates": "35°41'CD'N,139°41'WX'E",
      "source": "https://valorant-api.com/v1/maps/d960549e-485c-e861-8d71-aa9d1aed12a2?language=en-US",
      "dataStatus": "verified",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "summit",
      "label": "Summit",
      "uuid": "756da597-416b-c0f2-f47b-afbdf28670bc",
      "coordinates": "29° 18' FC\" N, 110° 25' ZQ\" E",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/splash.png",
      "layoutImage": "/assets/library/maps/summit-layout-trn.png",
      "calloutLabelsBakedIn": true,
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
      "dataStatus": "verified",
      "lastReviewed": "2026-08-17",
      "patchVersion": "13.02"
    },
    {
      "id": "sunset",
      "label": "Sunset",
      "uuid": "92584fbe-486a-b1b2-9faa-39b0f486b498",
      "coordinates": "34° 2′ C″ N, 118° 12′ YT″ W",
      "inCompetitivePool": true,
      "cardImage": "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png",
      "layoutImage": "/assets/library/maps/sunset-layout-trn.png",
      "calloutLabelsBakedIn": true,
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
      "dataStatus": "verified",
      "lastReviewed": "2026-08-18",
      "patchVersion": "13.02",
      "macro": {
        "attack": [
          "Sunset is defense-favored because Mid is narrow and both sites punish late, dry hits. Take Mid with purpose or pressure both mains before committing. If you let defenders keep Mid and rotate early, every site hit runs into four players.",
          "B Main is the pressure point of the map. If you take it cleanly, defenders have to respect the split through Market and the straight hit into B. If you stall outside B Main with no Mid pressure, you are walking into crossfires and spam.",
          "A hits need either A Main control with real utility or Mid pressure into Defender Spawn. A Site has tight angles and strong retake paths. Planting without clearing close site and blocking spawn turns the round into a coin flip."
        ],
        "defense": [
          "Defense wins Sunset by contesting Mid and B Main early, then staying alive. You do not need to overfight. You need information, chip damage, and enough utility left to stop the hit.",
          "Do not give B Main for free every round. Attackers use it to pin your B players, fake rotates, and walk into Market timing. Fight it with utility, fall back, and make them spend before they reach the choke.",
          "A retakes are playable if you keep numbers and deny the clean plant. If you die alone in A Main or overpeek A Elbow, attackers get the site and your retake comes through obvious lanes."
        ]
      },
      "siteTips": [
        {
          "label": "B Main",
          "text": "B Main decides too many Sunset rounds. Attackers need it for the B hit and defenders need to tax it early. If nobody contests or clears it, the round turns into a late lurk and rotate problem.",
          "roles": [
            "Duelist",
            "Initiator"
          ]
        },
        {
          "label": "Mid Courtyard",
          "text": "Mid control is not optional. It opens Market, Defender Spawn pressure, and faster rotations. If attack ignores Mid, defenders stack the mains. If defense ignores Mid, both sites get split.",
          "roles": [
            "Initiator",
            "Controller"
          ]
        },
        {
          "label": "B Market",
          "text": "Market is the most important B split lane. Smoke it, flash it, or clear it with numbers. Leaving Market active lets defenders swing the planter and break the B Main hit from the side.",
          "roles": [
            "Controller",
            "Duelist"
          ]
        },
        {
          "label": "A Main",
          "text": "A Main is a choke, not a full plan. You need close corners cleared and spawn pressure blocked before the plant. If you just run through A Main, defenders farm you from site, elbow, and retake lanes.",
          "roles": [
            "Duelist",
            "Controller"
          ]
        },
        {
          "label": "Defender Spawn",
          "text": "Defender Spawn connects the retake on both sites. On attack, cut it during the plant. On defense, rotate through it with timing and utility. If spawn stays open, post-plants collapse fast.",
          "roles": [
            "Controller",
            "Sentinel"
          ]
        }
      ],
      "teamplayTips": [
        {
          "label": "Pair Mid with a main lane",
          "text": "Do not take Mid alone and do not hit a site with five from main every round. Pair Mid with B Main for a Market split, or pair Mid pressure with A Main to pull rotations. One lane pressure is easy to read."
        },
        {
          "label": "Trade the choke fights",
          "text": "Sunset chokes are tight. B Main, A Main, and Market punish solo swings. First player takes space, second player trades, third player clears the next angle. If your spacing breaks, defenders get free multikills."
        },
        {
          "label": "Retake before you panic",
          "text": "On defense, call the retake early if the site anchor is smoked off or isolated. Sunset retakes work with numbers and layered utility. They fail when two players feed site before the rotate arrives."
        }
      ],
      "roleNotes": {
        "Duelist": [
          {
            "category": "attack",
            "text": "Your job is to break B Main, A Main, or the Mid fight with utility behind you. Do not lurk behind your team while the initiator clears space. Sunset rewards the first clean trade and punishes slow entries."
          },
          {
            "category": "attack",
            "text": "On B, do not dash or satchel deep without Market being smoked or pressured. You will get shot from the side before your team can trade. Entry through the choke only works when the crossfire is broken."
          },
          {
            "category": "attack",
            "text": "On A, clear close site and force the defenders off the plant zone. If you only swing for spawn fights, the planter dies behind you and the hit stops."
          }
        ],
        "Initiator": [
          {
            "category": "attack",
            "text": "Use your first utility to win B Main or Mid, not to decorate the wall. Drone, dog, reveal, or flash the first fight so your duelist can move. Dry contact into Sunset chokes is throwing."
          },
          {
            "category": "attack",
            "text": "For B splits, help clear Mid into Market before the main hit commits. If Market is unknown, your B Main players are walking into a side swing."
          },
          {
            "category": "attack",
            "text": "For A hits, spend utility on close site and the common retake swing timing. A plant is fragile if defenders keep enough space to peek the planter."
          }
        ],
        "Controller": [
          {
            "category": "sites",
            "text": "On B hits, block Market and Defender Spawn before the plant. Those are the lanes that kill the planter and split the post-plant. Smoke too late and your team dies in B Main."
          },
          {
            "category": "sites",
            "text": "On A hits, cut Defender Spawn and the strongest site-side angle your team is not clearing. A Main alone does not clear the site. Your smokes have to create a plant, not just start the hit."
          },
          {
            "category": "sites",
            "text": "On defense, save at least one smoke for the actual hit. Early Mid or B Main smokes are fine, but if you have nothing left when the execute starts, the site anchor gets buried."
          }
        ],
        "Sentinel": [
          {
            "category": "teamplay",
            "text": "Your flank utility matters because Sunset rotations are quick through Mid and spawn. Cover the lane your team is not holding. If your trip only watches a dead area, the lurker owns the round."
          },
          {
            "category": "teamplay",
            "text": "On defense, anchor with delay, not ego. Use trips, mollies, cages, or alarm utility to slow A Main or B Main, then live for the retake. One dead sentinel gives attackers the site and the post-plant."
          },
          {
            "category": "teamplay",
            "text": "On attack, watch the late Mid and main push timings after your team shows pressure. Defenders on Sunset like to take space back when the hit stalls. Punish that or your backline gets collapsed."
          }
        ]
      }
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
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "910be174-449b-c412-ab22-d0873436b21b",
        "source": "https://valorant-api.com/v1/weapons/910be174-449b-c412-ab22-d0873436b21b?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "ae3de142-4d85-2547-dd26-4e90bed35cf7",
        "source": "https://valorant-api.com/v1/weapons/ae3de142-4d85-2547-dd26-4e90bed35cf7?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "29a0cfab-485b-f5d5-779a-b59f85e204a8",
        "source": "https://valorant-api.com/v1/weapons/29a0cfab-485b-f5d5-779a-b59f85e204a8?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "44d4e95c-4157-0037-81b2-17841bf2e8e3",
        "source": "https://valorant-api.com/v1/weapons/44d4e95c-4157-0037-81b2-17841bf2e8e3?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
        "source": "https://valorant-api.com/v1/weapons/1baa85b4-4c70-1284-64bb-6481dfc3bb4e?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "4ade7faa-4cf1-8376-95ef-39884480959b",
        "source": "https://valorant-api.com/v1/weapons/4ade7faa-4cf1-8376-95ef-39884480959b?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "ec845bf4-4f79-ddda-a3da-0db3774b2794",
        "source": "https://valorant-api.com/v1/weapons/ec845bf4-4f79-ddda-a3da-0db3774b2794?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "c4883e50-4494-202c-3ec3-6b8a9284f00b",
        "source": "https://valorant-api.com/v1/weapons/c4883e50-4494-202c-3ec3-6b8a9284f00b?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
        "source": "https://valorant-api.com/v1/weapons/a03b24d3-4319-996d-0f8c-94bbfba1dfc7?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c",
        "source": "https://valorant-api.com/v1/weapons/5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
        "source": "https://valorant-api.com/v1/weapons/ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
        "source": "https://valorant-api.com/v1/weapons/e336c6b8-418d-9340-d77f-7a9e4cfe0702?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "42da8ccc-40d5-affc-beec-15aa47b42eda",
        "source": "https://valorant-api.com/v1/weapons/42da8ccc-40d5-affc-beec-15aa47b42eda?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "462080d1-4035-2937-7c09-27aa2a5c27a7",
        "source": "https://valorant-api.com/v1/weapons/462080d1-4035-2937-7c09-27aa2a5c27a7?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "f7e1b454-4ad4-1063-ec0a-159e56b58941",
        "source": "https://valorant-api.com/v1/weapons/f7e1b454-4ad4-1063-ec0a-159e56b58941?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
        "uuid": "9c82e19d-4575-0200-1a81-3eacf00cf872",
        "source": "https://valorant-api.com/v1/weapons/9c82e19d-4575-0200-1a81-3eacf00cf872?language=en-US",
        "lastReviewed": "2026-08-17",
        "patchVersion": "13.02"
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
