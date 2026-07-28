// Verified public plant-heat-map references for the Map Dossier.
//
// The current collection is V26 Act 4.  A map can leave the active pool before
// its current-act image is published, so each older image below records the
// most recent retained act that responded with an actual image.  The manifest
// deliberately contains no inferred plant rates or coordinates.
(function () {
  "use strict";

  const SOURCE_BASE = "https://www.vstats.gg/statistics";
  const ALL_RANKS = "ALL";
  const PLANT_IMAGE = "heatmaps/plants_ALL_Plants.webp";
  const sourceUrl = (actId, mapCode) => `${SOURCE_BASE}/${actId}/${ALL_RANKS}/${encodeURIComponent(mapCode)}/${PLANT_IMAGE}`;

  const HEATMAPS = Object.freeze({
    abyss: Object.freeze({
      mapCode: "Infinity",
      actId: "3ea2b318-423b-cf86-25da-7cbb0eefbe2d",
      actLabel: "V26 Act 1",
      image: sourceUrl("3ea2b318-423b-cf86-25da-7cbb0eefbe2d", "Infinity")
    }),
    ascent: Object.freeze({
      mapCode: "Ascent",
      actId: "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
      actLabel: "V26 Act 4",
      image: sourceUrl("4f0864e2-40af-28a4-de2c-0e9e64e75f23", "Ascent")
    }),
    bind: Object.freeze({
      mapCode: "Duality",
      actId: "9d85c932-4820-c060-09c3-668636d4df1b",
      actLabel: "V26 Act 2",
      image: sourceUrl("9d85c932-4820-c060-09c3-668636d4df1b", "Duality")
    }),
    breeze: Object.freeze({
      mapCode: "Foxtrot",
      actId: "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
      actLabel: "V26 Act 4",
      image: sourceUrl("4f0864e2-40af-28a4-de2c-0e9e64e75f23", "Foxtrot")
    }),
    corrode: Object.freeze({
      mapCode: "Rook",
      actId: "3ea2b318-423b-cf86-25da-7cbb0eefbe2d",
      actLabel: "V26 Act 1",
      image: sourceUrl("3ea2b318-423b-cf86-25da-7cbb0eefbe2d", "Rook")
    }),
    fracture: Object.freeze({
      mapCode: "Canyon",
      actId: "ce2783e8-44fc-dd48-3da3-33b5ba6c4a22",
      actLabel: "V26 Act 3",
      image: sourceUrl("ce2783e8-44fc-dd48-3da3-33b5ba6c4a22", "Canyon")
    }),
    haven: Object.freeze({
      mapCode: "Triad",
      actId: "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
      actLabel: "V26 Act 4",
      image: sourceUrl("4f0864e2-40af-28a4-de2c-0e9e64e75f23", "Triad")
    }),
    icebox: Object.freeze({
      mapCode: "Port",
      // Icebox left the V26 pool before a current image was published.  This
      // is the newest verified retained image in the same public archive.
      actId: "ac12e9b3-47e6-9599-8fa1-0bb473e5efc7",
      actLabel: "V25 Act 4",
      image: sourceUrl("ac12e9b3-47e6-9599-8fa1-0bb473e5efc7", "Port")
    }),
    lotus: Object.freeze({
      mapCode: "Jam",
      actId: "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
      actLabel: "V26 Act 4",
      image: sourceUrl("4f0864e2-40af-28a4-de2c-0e9e64e75f23", "Jam")
    }),
    pearl: Object.freeze({
      mapCode: "Pitt",
      actId: "ce2783e8-44fc-dd48-3da3-33b5ba6c4a22",
      actLabel: "V26 Act 3",
      image: sourceUrl("ce2783e8-44fc-dd48-3da3-33b5ba6c4a22", "Pitt")
    }),
    split: Object.freeze({
      mapCode: "Bonsai",
      actId: "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
      actLabel: "V26 Act 4",
      image: sourceUrl("4f0864e2-40af-28a4-de2c-0e9e64e75f23", "Bonsai")
    }),
    summit: Object.freeze({
      mapCode: "Plummet",
      actId: "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
      actLabel: "V26 Act 4",
      image: sourceUrl("4f0864e2-40af-28a4-de2c-0e9e64e75f23", "Plummet")
    }),
    sunset: Object.freeze({
      mapCode: "Juliett",
      actId: "4f0864e2-40af-28a4-de2c-0e9e64e75f23",
      actLabel: "V26 Act 4",
      image: sourceUrl("4f0864e2-40af-28a4-de2c-0e9e64e75f23", "Juliett")
    })
  });

  globalThis.RankedCoachGamesenseHeatmaps = HEATMAPS;
})();
