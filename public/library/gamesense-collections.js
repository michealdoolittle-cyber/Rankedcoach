// Curated VALORANT collection archive. Edition is Riot's content tier, not a
// community review score. Release patches and collection classifications are
// cross-checked against the VALORANT Wiki; art is served by Valorant-API.
(function () {
  "use strict";

  const officialVideoSearch = name => `https://www.youtube.com/@valorant/search?query=${encodeURIComponent(name)}`;
  const wiki = slug => `https://wiki.playvalorant.com/en-us/${slug}_Collection`;

  const collections = [
    { id: "prime", name: "Prime", edition: "Premium", sourceType: "Store Bundle", year: 2020, era: "Episode 1 Act 1", patch: "1.0", image: "https://media.valorant-api.com/bundles/2116a38e-4b71-f169-0d16-ce9289af4bfa/displayicon.png", referenceUrl: wiki("Prime"), videoUrl: officialVideoSearch("Prime collection") },
    { id: "elderflame", name: "Elderflame", edition: "Ultra", sourceType: "Store Bundle", year: 2020, era: "Episode 1 Act 1", patch: "1.03", image: "https://media.valorant-api.com/bundles/1ba50cf0-46dd-848f-13a9-dc92fb0a3e3b/displayicon.png", referenceUrl: wiki("Elderflame"), videoUrl: officialVideoSearch("Elderflame collection") },
    { id: "oni", name: "Oni", edition: "Premium", sourceType: "Store Bundle", year: 2020, era: "Episode 1 Act 1", patch: "1.04", image: "https://media.valorant-api.com/bundles/b7d754d4-44aa-4663-afc3-84a5cccc3c9d/displayicon.png", referenceUrl: wiki("Oni"), videoUrl: officialVideoSearch("Oni collection") },
    { id: "glitchpop", name: "Glitchpop", edition: "Exclusive", sourceType: "Store Bundle", year: 2020, era: "Episode 1 Act 2", patch: "1.05", image: "https://media.valorant-api.com/bundles/fc723fef-444a-4013-a741-3e85a97382f2/displayicon.png", referenceUrl: wiki("Glitchpop"), videoUrl: officialVideoSearch("Glitchpop collection") },
    { id: "reaver", name: "Reaver", edition: "Premium", sourceType: "Store Bundle", year: 2020, era: "Episode 1 Act 3", patch: "1.11", image: "https://media.valorant-api.com/bundles/fde33d91-4bbd-ee1d-3c2b-40af0fe0e510/displayicon.png", referenceUrl: wiki("Reaver"), videoUrl: officialVideoSearch("Reaver collection") },
    { id: "ion", name: "Ion", edition: "Premium", sourceType: "Store Bundle", year: 2020, era: "Episode 1 Act 3", patch: "1.12", image: "https://media.valorant-api.com/bundles/790f52c4-4ed8-9869-fa8b-bf92fc24b441/displayicon.png", referenceUrl: wiki("Ion"), videoUrl: officialVideoSearch("Ion collection") },
    { id: "ruination", name: "Ruination", edition: "Exclusive", sourceType: "Store Bundle", year: 2021, era: "Episode 3 Act 1", patch: "3.01", image: "https://media.valorant-api.com/bundles/ae0c9cc4-4c03-f8d6-745c-84953db684fc/displayicon.png", referenceUrl: wiki("Ruination"), videoUrl: officialVideoSearch("Ruination collection") },
    { id: "champions-2021", name: "Champions 2021", edition: "Exclusive", sourceType: "Limited Bundle", year: 2021, era: "Episode 3 Act 3", patch: "3.10", image: "https://media.valorant-api.com/bundles/bf987f36-4a33-45e4-3c49-1ab9a2502607/displayicon.png", referenceUrl: wiki("Champions_2021"), videoUrl: officialVideoSearch("Champions 2021 collection") },
    { id: "prelude-to-chaos", name: "Prelude to Chaos", edition: "Exclusive", sourceType: "Store Bundle", year: 2022, era: "Episode 5 Act 1", patch: "5.0", image: "https://media.valorant-api.com/bundles/2f58cd79-4914-9dc6-ea10-b8b9ea481add/displayicon.png", referenceUrl: wiki("Prelude_to_Chaos"), videoUrl: officialVideoSearch("Prelude to Chaos collection") },
    { id: "araxys", name: "Araxys", edition: "Exclusive", sourceType: "Store Bundle", year: 2023, era: "Episode 6 Act 1", patch: "6.0", image: "https://media.valorant-api.com/bundles/72e38650-47a3-8330-d02b-62890c5753aa/displayicon.png", referenceUrl: wiki("Araxys"), videoUrl: officialVideoSearch("Araxys collection") },
    { id: "kuronami", name: "Kuronami", edition: "Exclusive", sourceType: "Store Bundle", year: 2024, era: "Episode 8 Act 1", patch: "8.0", image: "https://media.valorant-api.com/bundles/69d9b2be-4439-0785-780b-ba8951053683/displayicon.png", referenceUrl: wiki("Kuronami"), videoUrl: officialVideoSearch("Kuronami collection") },
    { id: "evori-dreamwings", name: "Evori Dreamwings", edition: "Ultra", sourceType: "Store Bundle", year: 2024, era: "Episode 9 Act 1", patch: "9.0", image: "https://media.valorant-api.com/bundles/f94649de-4723-b138-8293-45ab433c9da4/displayicon.png", referenceUrl: wiki("Evori_Dreamwings"), videoUrl: officialVideoSearch("Evori Dreamwings collection") },
    { id: "kingdom", name: "Kingdom", edition: "Deluxe", sourceType: "Battlepass", year: 2020, era: "Episode 1 Act 1", patch: "1.0", image: "https://media.valorant-api.com/weaponskinlevels/a7229cba-4691-62b0-9c40-f59a29817ddc/displayicon.png", referenceUrl: wiki("Kingdom"), videoUrl: officialVideoSearch("Episode 1 Act 1 battlepass") },
    { id: "hivemind", name: "Hivemind", edition: "Deluxe", sourceType: "Battlepass", year: 2020, era: "Episode 1 Act 2", patch: "1.05", image: "https://media.valorant-api.com/weaponskins/f7f63b78-4b12-b21e-a0e7-6bafbad81509/displayicon.png", referenceUrl: wiki("Hivemind"), videoUrl: officialVideoSearch("Episode 1 Act 2 battlepass") }
  ];

  globalThis.RankedCoachWeaponCollections = Object.freeze(collections.map(item => Object.freeze(item)));
})();
