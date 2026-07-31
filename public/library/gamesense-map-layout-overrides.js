// Hand-reviewed TRN-style tactical layouts sourced from Overgear's VALORANT maps guide.
// Images are checked in locally; plant spot data remains source-verified and export-edited only.
(function () {
  "use strict";
  const LAYOUTS = Object.freeze({
  "bind": {
    "layoutImage": "/assets/library/maps/bind-layout-trn.png",
    "calloutLabelsBakedIn": true,
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
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "breeze": {
    "layoutImage": "/assets/library/maps/breeze-layout-trn.png",
    "calloutLabelsBakedIn": true,
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
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "split": {
    "layoutImage": "/assets/library/maps/split-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [
      {
        "number": 1,
        "site": "A",
        "label": "A Default",
        "rate": 15.39,
        "x": 15.7,
        "y": 70.4,
        "previewLabel": "A Default in-game reference",
        "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/b99bab902f64289dcade6a53f141639c33ac3a1e-1466x646.jpg?auto=format",
        "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
      },
      {
        "number": 2,
        "site": "A",
        "label": "A Screens Plant",
        "rate": 4.83,
        "x": 6.4,
        "y": 74.6,
        "previewLabel": "A lower-site in-game reference",
        "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/ab0936e9b7742f98920efa81852740809650bad4-733x646.png?auto=format",
        "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
      },
      {
        "number": 3,
        "site": "A",
        "label": "A Open Plant",
        "rate": 18.58,
        "x": 7.4,
        "y": 66.2,
        "previewLabel": "A open corner in-game reference",
        "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/3d2a7e4491b82d82be503ab28141c932658a3ff1-733x646.png?auto=format",
        "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
      },
      {
        "number": 1,
        "site": "B",
        "label": "B Open Plant",
        "rate": 26.94,
        "x": 88.9,
        "y": 70.4,
        "previewLabel": "B Main plant in-game reference",
        "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/ded16cdf2c51e60bfbaa8e80dd40740610dee46f-663x653.png?auto=format",
        "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
      },
      {
        "number": 2,
        "site": "B",
        "label": "B Default",
        "rate": 53.76,
        "x": 87.7,
        "y": 65.6,
        "previewLabel": "B Default in-game reference",
        "previewImage": "https://cdn.sanity.io/images/ccckgjf9/production/73c66772d5104035c44ce207d3b7ad4a827d6a15-663x653.png?auto=format",
        "previewSource": "https://dignitas.gg/articles/the-best-plant-spots-for-every-map"
      }
    ],
    "plantRateNote": "Plant rate is each numbered spot's share of successful plants on that site in active-season PC Competitive.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "abyss": {
    "layoutImage": "/assets/library/maps/abyss-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "No source-verified named spike-plant locations are published for Abyss in the retained Library sources. The map is shown without fabricated site-centroid markers.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "ascent": {
    "layoutImage": "/assets/library/maps/ascent-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "Dignitas names A Dice, A Tree, B Corner, B Back, and B Market as Ascent plant recommendations. Its guide does not publish map-coordinate markers, so the map is shown without approximated site-centroid pins.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "corrode": {
    "layoutImage": "/assets/library/maps/corrode-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "No source-verified named spike-plant locations are published for Corrode in the retained Library sources. The map is shown without fabricated site-centroid markers.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "fracture": {
    "layoutImage": "/assets/library/maps/fracture-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "No source-verified named spike-plant locations are published for Fracture in the retained Library sources. The map is shown without fabricated site-centroid markers.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "haven": {
    "layoutImage": "/assets/library/maps/haven-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "Dignitas names A Default, A Long, B Middle, B Left, C Garage, and C Long as Haven plant recommendations. Its guide does not publish map-coordinate markers, so the map is shown without approximated site-centroid pins.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "lotus": {
    "layoutImage": "/assets/library/maps/lotus-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "No source-verified named spike-plant locations are published for Lotus in the retained Library sources. The map is shown without fabricated site-centroid markers.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "pearl": {
    "layoutImage": "/assets/library/maps/pearl-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "No source-verified named spike-plant locations are published for Pearl in the retained Library sources. The map is shown without fabricated site-centroid markers.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "icebox": {
    "layoutImage": "/assets/library/maps/icebox-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "Dignitas names A Generator, A Belt, A Top, B Corner, B Mid, and B Top as Icebox plant recommendations. Its guide does not publish map-coordinate markers, so the map is shown without approximated site-centroid pins.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "summit": {
    "layoutImage": "/assets/library/maps/summit-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "No source-verified named spike-plant locations are published for Summit in the retained Library sources. The map is shown without fabricated site-centroid markers.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  },
  "sunset": {
    "layoutImage": "/assets/library/maps/sunset-layout-trn.png",
    "calloutLabelsBakedIn": true,
    "plantSpots": [],
    "plantRateNote": "No source-verified named spike-plant locations are published for Sunset in the retained Library sources. The map is shown without fabricated site-centroid markers.",
    "tacticalMapSource": "https://overgear.com/guides/valorant/maps-list/"
  }
});
  const maps = (globalThis.RankedCoachGamesenseMaps || []).map(map => ({ ...map, ...(LAYOUTS[map.id] || {}) }));
  globalThis.RankedCoachGamesenseOfficialMapLayouts = LAYOUTS;
  globalThis.RankedCoachGamesenseMaps = Object.freeze(maps);
})();
