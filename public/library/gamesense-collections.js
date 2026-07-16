// Complete weapon-level skin archive served by Valorant-API. Collection cards
// always use art for the weapon the player is currently inspecting.
(function () {
  "use strict";

  const weaponUuids = Object.freeze({
    Bucky: "910be174-449b-c412-ab22-d0873436b21b",
    Bulldog: "ae3de142-4d85-2547-dd26-4e90bed35cf7",
    Classic: "29a0cfab-485b-f5d5-779a-b59f85e204a8",
    Frenzy: "44d4e95c-4157-0037-81b2-17841bf2e8e3",
    Ghost: "1baa85b4-4c70-1284-64bb-6481dfc3bb4e",
    Guardian: "4ade7faa-4cf1-8376-95ef-39884480959b",
    Judge: "ec845bf4-4f79-ddda-a3da-0db3774b2794",
    Marshal: "c4883e50-4494-202c-3ec3-6b8a9284f00b",
    Operator: "a03b24d3-4319-996d-0f8c-94bbfba1dfc7",
    Outlaw: "5f0aaf7a-4289-3998-d5ff-eb9a5cf7ef5c",
    Phantom: "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a",
    Sheriff: "e336c6b8-418d-9340-d77f-7a9e4cfe0702",
    Shorty: "42da8ccc-40d5-affc-beec-15aa47b42eda",
    Spectre: "462080d1-4035-2937-7c09-27aa2a5c27a7",
    Stinger: "f7e1b454-4ad4-1063-ec0a-159e56b58941",
    Vandal: "9c82e19d-4575-0200-1a81-3eacf00cf872"
  });
  const contentTierIconRoot = "https://media.valorant-api.com/contenttiers";
  const contentTiers = Object.freeze({
    "12683d76-48d7-84a3-4e09-6985794f0445": Object.freeze({ label: "Select", icon: `${contentTierIconRoot}/12683d76-48d7-84a3-4e09-6985794f0445/displayicon.png` }),
    "0cebb8be-46d7-c12a-d306-e9907bfc5a25": Object.freeze({ label: "Deluxe", icon: `${contentTierIconRoot}/0cebb8be-46d7-c12a-d306-e9907bfc5a25/displayicon.png` }),
    "60bca009-4182-7998-dee7-b8a2558dc369": Object.freeze({ label: "Premium", icon: `${contentTierIconRoot}/60bca009-4182-7998-dee7-b8a2558dc369/displayicon.png` }),
    "e046854e-406c-37f4-6607-19a9ba8426fc": Object.freeze({ label: "Exclusive", icon: `${contentTierIconRoot}/e046854e-406c-37f4-6607-19a9ba8426fc/displayicon.png` }),
    "411e4a55-4e59-7757-41f0-86a53f101bb5": Object.freeze({ label: "Ultra", icon: `${contentTierIconRoot}/411e4a55-4e59-7757-41f0-86a53f101bb5/displayicon.png` })
  });
  const premiumVideoTiers = new Set(["premium", "exclusive", "ultra"]);
  const collectionVideos = Object.freeze(Object.fromEntries(Object.entries({
    aemondir: ["P3fUih8vWhY", "Kanga"],
    araxys: ["gVQpP7djcDc", "Kanga"],
    arcane: ["oibDoXyQDac", "Kanga"],
    ayakashi: ["1zrdgM1G6hY", "Meox"],
    "black-market": ["m8mfREoopSg", "Valorant SkinSpotlight"],
    blackspyre: ["CRqNCfjseQ0", "DoctorPhysicist"],
    blackthorn: ["GvpiPBD6tgI", "Meox"],
    blastx: ["2FrfcPRn0XI", "TalkEsport"],
    bolt: ["mufIbt9t3ok", "Kanga"],
    "bubblegum-deathwish": ["3Y1u98jmFV0", "Kanga"],
    celestial: ["NAe-po13XTA", "The Forge: VALORANT Skins"],
    "champions-2021": ["89qMIUw67GU", "Valorant SkinSpotlight"],
    "champions-2022": ["QXE5h476aBA", "Kanga"],
    "champions-2023": ["C1I23KRtZWo", "Kanga"],
    "champions-2024": ["xHMYB5AV_5s", "Kanga"],
    "champions-2025": ["ojShvR9PZC4", "Kanga"],
    chronovoid: ["2sE8Jr8AZy8", "Kanga"],
    crimsonbeast: ["tnP1COM08Do", "Esports Driven"],
    cryostasis: ["4sczRLQC_Ro", "Kanga"],
    cyrax: ["6kiqJQPYzO8", "Kanga"],
    divergence: ["wQWV_1244VY", "Kanga"],
    "dolmir-s-revenge": ["fOQyQua1QaM", "TJR Gaming"],
    "doodle-buds": ["oCINEFzQoRc", "Valorant SkinSpotlight"],
    doombringer: ["8KlFkWIhFSg", "Kanga"],
    ego: ["7L9g0s01orE", "The Forge: VALORANT Skins"],
    elderflame: ["u_cDp9XkOas", "rechyyy"],
    "evori-dreamwings": ["oW0qmFWHnlw", "Kanga"],
    "ex-o": ["ocPCS3hghGU", "Kanga"],
    forsaken: ["MAf9rTahJ1c", "Valorant SkinSpotlight"],
    "gaia-s-vengeance": ["kHBk-2il0x8", "MaybeCrabbzy"],
    glitchpop: ["f39y5ghRbrQ", "The Forge: VALORANT Skins"],
    "gravitational-uranium-neuroblaster": ["wpLgTGn0cvc", "AntsGaming"],
    helix: ["_99kOwQ8Gts", "Kanga"],
    "holo-meridian": ["42S0EBU_HHA", "VALORANT Lab"],
    imperium: ["hQBqK-w2EIc", "Kanga"],
    ion: ["uBZm56vdGKY", "Valorant SkinSpotlight"],
    kuronami: ["xk5owLRuPEY", "Kanga"],
    magepunk: ["iNNu9AmzWdg", "DKisLive"],
    mystbloom: ["M4-1l49CF6E", "Kanga"],
    nebula: ["kpZbl0t5kQw", "The Forge: VALORANT Skins"],
    "neo-frontier": ["WjAeLhgL5KY", "Game Poduvom"],
    neptune: ["o9Dfkip6cBM", "Kanga"],
    nocturnum: ["tj4FwaVG9ik", "Kanga"],
    "ora-by-onetap": ["f_rQf5dGvLs", "Red"],
    oni: ["qoICo17c9T8", "Valorant SkinSpotlight"],
    origin: ["ItnfxlBgq7U", "The Forge: VALORANT Skins"],
    overdrive: ["_M_yPgFU40Q", "Kanga"],
    phaseguard: ["t_6Hf_NLeok", "Kanga"],
    "prelude-to-chaos": ["tFy8C1axKJk", "Kanga"],
    prime: ["kB7RlywW4SQ", "Valorant SkinSpotlight"],
    "prime-2-0": ["qo0ohDBYQAk", "Valorant SkinSpotlight"],
    primordium: ["8Rna93ul_VA", "Kanga"],
    "protocol-781-a": ["kFVmNy4AGWo", "Valorant SkinSpotlight"],
    "radiant-crisis-001": ["iRJ-79LqSrc", "The Forge: VALORANT Skins"],
    "radiant-entertainment-system": ["Wj53-KugZJI", "Kanga"],
    reaver: ["TV-XRoSisMs", "Valorant SkinSpotlight"],
    recon: ["BWmYepJkpBY", "Valorant SkinSpotlight"],
    "rgx-11z-pro": ["drlG24xN2tw", "Valorant SkinSpotlight"],
    rogue: ["Ilk93Q8dXHE", "Kanga"],
    ruination: ["Pb6a1v-9HEY", "The Forge: VALORANT Skins"],
    "sentinels-of-light": ["7sSQTHlWtpk", "Valorant SkinSpotlight"],
    singularity: ["6g6V4ApThqY", "Valorant SkinSpotlight"],
    solarstride: ["SC6PBhOTHjQ", "Meox"],
    soulstrife: ["C6JGsR5ag7c", "Kanga"],
    sovereign: ["oVp-1NnLmU8", "Kanga"],
    spectrum: ["c-t3Lw6tJ5Y", "Valorant SkinSpotlight"],
    splashx: ["VJJMfN3sDBs", "Kanga"],
    spline: ["6eLesXOnORA", "The Forge: VALORANT Skins"],
    "tethered-realms": ["bif2NRrjCns", "Valorant SkinSpotlight"],
    undercity: ["HgFSgxzRMhM", "Valorant SkinSpotlight"],
    "valiant-hero": ["dSRvvUolVJY", "Kanga"],
    "valorant-go-vol-1": ["7rKIL2SeEOg", "FerGoPlay"],
    "valorant-go-vol-2": ["wUz9GtZ0fk8", "Valorant SkinSpotlight"],
    xenohunter: ["QVtQ4604w9Q", "Classic Architect"],
    xerofang: ["-WBtYNv_X3Q", "Bharath"],
    "xerofang-vandal": ["-WBtYNv_X3Q", "Bharath"]
  }).map(([key, value]) => [key, Object.freeze(value)])));
  const vctCollectionVideos = Object.freeze(Object.fromEntries(Object.entries({
    vct24: ["MIPjeD7keZM", "Avenger Gaming 71"],
    vct25: ["YGk8rLME534", "WhyAlwaysSam"],
    vct26: ["pS86jCM2pRc", "MetaSCREAM"]
  }).map(([key, value]) => [key, Object.freeze(value)])));
  const cache = new Map();
  const pending = new Map();

  function getCollectionName(displayName = "", weaponName = "") {
    const escapedWeapon = weaponName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return displayName.replace(new RegExp(`\\s+${escapedWeapon}$`, "i"), "").trim();
  }

  function normalizeCollectionKey(value = "") {
    return String(value).normalize("NFKD").replace(/[Øø]/g, "o").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getCollectionVideo(name = "", editionKey = "") {
    if (!premiumVideoTiers.has(String(editionKey).toLowerCase())) return null;
    const key = normalizeCollectionKey(name);
    const vctFamily = key.startsWith("vct26-x-")
      ? "vct26"
      : key.startsWith("vct25-x-")
        ? "vct25"
        : key.startsWith("vct-x-")
          ? "vct24"
          : "";
    const video = collectionVideos[key] || vctCollectionVideos[vctFamily];
    return video ? Object.freeze({
      id: video[0],
      title: `${name} community showcase`,
      channel: video[1]
    }) : null;
  }

  function getSkinViews(skin = {}) {
    const seen = new Set();
    const views = [];
    const addView = (source, label) => {
      const url = String(source || "").trim();
      if (!url || seen.has(url)) return;
      seen.add(url);
      views.push(Object.freeze({ source: url, label: String(label || `Riot render ${views.length + 1}`).trim() }));
    };

    (skin.chromas || []).forEach((chroma, index) => {
      addView(chroma?.fullRender || chroma?.displayIcon, chroma?.displayName || `Riot render ${index + 1}`);
    });
    if (!views.length) {
      (skin.levels || []).forEach((level, index) => addView(level?.displayIcon, level?.displayName || `Riot render ${index + 1}`));
    }
    if (!views.length) addView(skin.displayIcon, skin.displayName || "Riot weapon render");
    return Object.freeze(views);
  }

  function getSkinArt(skin = {}) {
    const views = getSkinViews(skin);
    const source = views[0]?.source || "";
    return { card: source, preview: source, views };
  }

  function normalizeSkins(weaponName, skins = []) {
    const omittedNames = new Set([`standard ${weaponName}`.toLowerCase(), "random favorite skin"]);
    const seen = new Set();
    return skins.map(skin => {
      const displayName = String(skin?.displayName || "").trim();
      const art = getSkinArt(skin);
      const name = getCollectionName(displayName, weaponName);
      const tier = contentTiers[String(skin?.contentTierUuid || "").toLowerCase()] || Object.freeze({ label: "Unrated", icon: "" });
      return {
        id: String(skin?.uuid || `${weaponName}-${name}`),
        name,
        weaponName,
        edition: tier.label,
        editionKey: tier.label.toLowerCase(),
        editionIcon: tier.icon,
        image: art.card,
        previewImage: art.preview,
        views: art.views,
        bundleVideo: getCollectionVideo(name, tier.label)
      };
    }).filter(item => {
      const key = `${item.weaponName}|${item.name}`.toLowerCase();
      const normalizedName = item.name.toLowerCase();
      if (!item.name || !item.image || omittedNames.has(normalizedName) || omittedNames.has(`${normalizedName} ${item.weaponName.toLowerCase()}`) || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
  }

  function getCached(weaponName = "") {
    return cache.get(String(weaponName)) || null;
  }

  async function loadForWeapon(weaponName = "") {
    const normalizedName = String(weaponName).trim();
    const uuid = weaponUuids[normalizedName];
    if (!uuid) throw new Error(`No Valorant weapon identifier is registered for ${normalizedName}.`);
    if (cache.has(normalizedName)) return cache.get(normalizedName);
    if (pending.has(normalizedName)) return pending.get(normalizedName);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);
    const request = fetch(`https://valorant-api.com/v1/weapons/${uuid}?language=en-US`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Weapon skin archive returned HTTP ${response.status}.`);
        return response.json();
      })
      .then(payload => {
        const collections = normalizeSkins(normalizedName, payload?.data?.skins || []);
        if (!collections.length) throw new Error(`No weapon skins were returned for ${normalizedName}.`);
        cache.set(normalizedName, Object.freeze(collections.map(item => Object.freeze(item))));
        return cache.get(normalizedName);
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        pending.delete(normalizedName);
      });

    pending.set(normalizedName, request);
    return request;
  }

  globalThis.RankedCoachWeaponCollections = Object.freeze({ getCached, loadForWeapon, getCollectionVideo });
})();
