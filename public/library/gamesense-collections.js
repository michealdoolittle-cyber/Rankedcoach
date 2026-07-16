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
  const officialSkinPlaylistId = "PLTFsoy_DWCOMWzK4f6ICbroM1FzHW4S7j";
  const approvedCollectionVideos = Object.freeze(Object.fromEntries(Object.entries({
    araxys: ["vdfexNscpPo", "VALORANT"],
    arcane: ["d1yOu8UlmkQ", "VALORANT"],
    ayakashi: ["ZSEMYF4AU2g", "VALORANT"],
    blackspyre: ["aSFtc5Y-ORQ", "VALORANT"],
    blackthorn: ["RdjvO-lrXOw", "VALORANT"],
    blastx: ["-M07PLBAHtA", "VALORANT"],
    "champions-2021": ["LJ0w_9-qXpM", "VALORANT"],
    "champions-2022": ["yfFTEn6URbg", "VALORANT"],
    "champions-2023": ["365svb1KnyA", "VALORANT"],
    "champions-2024": ["VNxvRG0ceUI", "VALORANT"],
    "champions-2025": ["bKpcAOVyX3g", "VALORANT"],
    chronovoid: ["ebGzlUQ6v_k", "VALORANT"],
    cyrax: ["97eAYyVHsUE", "VALORANT"],
    elderflame: ["5oslaJjYdzs", "VALORANT"],
    "evori-dreamwings": ["wtJt38PhTOE", "VALORANT"],
    glitchpop: ["dhNyPZj-nQk", "VALORANT"],
    imperium: ["KTIIlCjGL9k", "VALORANT"],
    ion: ["7zpPkcKWPVE", "VALORANT"],
    kuronami: ["pXqSRj-JEkA", "VALORANT"],
    "neo-frontier": ["KPvCldjk_O8", "VALORANT"],
    oni: ["WwVgA5X4lP4", "VALORANT"],
    phaseguard: ["gZPyHib9GNw", "VALORANT"],
    "prime-2-0": ["Z5Fm4jtnQc8", "VALORANT"],
    primordium: ["6SPuDeBwTpU", "VALORANT"],
    "protocol-781-a": ["h6i8lM3egvI", "VALORANT"],
    "radiant-entertainment-system": ["MPemOdTvHTk", "VALORANT"],
    reaver: ["WLWZP6eRkiA", "VALORANT"],
    "rgx-11z-pro": ["O3InzdUOhxs", "VALORANT"],
    rogue: ["b1u1kUdDOys", "VALORANT"],
    splashx: ["P8ZahXzfjgk", "VALORANT"],
    "valiant-hero": ["250eQlJ8mTU", "VALORANT"],
    xerofang: ["5SJIek3cmm8", "VALORANT"],
    "xerofang-vandal": ["5SJIek3cmm8", "VALORANT"]
  }).map(([key, value]) => [key, Object.freeze(value)])));
  const dittozkulFallbackVideos = Object.freeze(Object.fromEntries(Object.entries({
    aemondir: ["PT3EC2dgqzs", "Dittozkul"],
    bolt: ["PU26q53j-HM", "Dittozkul"],
    divergence: ["H_8vUux9R48", "Dittozkul"],
    "dolmir-s-revenge": ["EndGCF4xT7A", "Dittozkul"],
    doombringer: ["_NmzHBD0BEk", "Dittozkul"],
    "holo-meridian": ["iYemZ5UfHOk", "Dittozkul"],
    mystbloom: ["BHgpsmBZkMk", "Dittozkul"],
    "ora-by-onetap": ["_xF2dKFJkM0", "Dittozkul"],
    singularity: ["yJ64L0dxpUY", "Dittozkul"],
    solarstride: ["QO6ZoZGMn2M", "Dittozkul"]
  }).map(([key, value]) => [key, Object.freeze(value)])));
  const officialVctVideo = Object.freeze(["z3AOg7mUP_Y", "VALORANT"]);
  const sketchfabLicenseUrl = "https://creativecommons.org/licenses/by/4.0/";
  const approvedSketchfabModels = Object.freeze(Object.fromEntries(Object.entries({
    "blastx|phantom": ["e3135ecb9ba34c478e28a0fac9053d50", "Valorant Phantom BlastX", "Huseyin Dogan", "valorant-phantom-blastx"],
    "ion|phantom": ["c1011ae384f04b5b8b4f0cd3bc047ed2", "Ion Phantom VALORANT", "keytogotyou", "ion-phantom-valorant"],
    "kuronami|marshal": ["df20cb436eb24f229e82aca15d731ba5", "Marshal Kuronami - Valorant", "kairos", "marshal-kuronami-valorant"],
    "kuronami|operator": ["637801735b3e4d6f8d98d52f64450b4c", "KURONAMI Operator - Valorant Skin", "neumann", "kuronami-operator-valorant-skin"],
    "prime|classic": ["ba82312c24cf4b89a6b34030b764947f", "Prime Classic | Valorant", "ILilMitch", "prime-classic-valorant"],
    "prime|vandal": ["5c93b4c3858a44ba9fd6994508eaf3c8", "Prime Vandal", "ILilMitch", "prime-vandal"],
    "reaver|phantom": ["399ea10e99b5459cbf892498c7c258fc", "Phantom - Reaver (White Variant) Valorant", "MisterM4n", "phantom-reaver-white-variant-valorant"],
    "reaver|sheriff": ["94c17a4f625d44e3817d8e603e6a14d1", "Reaver Sheriff", "reaperslayz", "reaver-sheriff"],
    "reaver|vandal": ["04f9851ace5c424492c327608b895e2c", "Reaver Vandal (White)", "ILilMitch", "reaver-vandal-white"],
    "recon|phantom": ["85af07c2d05c4298a3a497ed091805b0", "Valorant Recon Phantom Rifle", "Jordan Stasak", "valorant-recon-phantom-rifle"],
    "rgx-11z-pro|vandal": ["b1da0d2feb70448fae76769dc7ee01fd", "RGX Vandal Valorant", "KiLLSHOT", "rgx-vandal-valorant"]
  }).map(([key, value]) => [key, Object.freeze({
    id: value[0],
    title: value[1],
    creator: value[2],
    modelUrl: `https://sketchfab.com/3d-models/${value[3]}-${value[0]}`,
    embedUrl: `https://sketchfab.com/models/${value[0]}/embed?autostart=1&preload=1&ui_theme=dark&ui_hint=0`,
    license: "CC BY 4.0",
    licenseUrl: sketchfabLicenseUrl
  })])));
  const cache = new Map();
  const pending = new Map();

  function getCollectionName(displayName = "", weaponName = "") {
    const escapedWeapon = weaponName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return displayName.replace(new RegExp(`\\s+${escapedWeapon}$`, "i"), "").trim();
  }

  function normalizeCollectionKey(value = "") {
    return String(value).normalize("NFKD").replace(/[Øø]/g, "o").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getCollectionVideo(name = "") {
    const key = normalizeCollectionKey(name);
    const isVctCapsule = key.startsWith("vct26-x-") || key.startsWith("vct25-x-") || key.startsWith("vct-x-");
    const video = approvedCollectionVideos[key] || (isVctCapsule ? officialVctVideo : null) || dittozkulFallbackVideos[key];
    return video ? Object.freeze({
      id: video[0],
      title: `${name} collection video`,
      channel: video[1],
      playlistId: video[1] === "VALORANT" ? officialSkinPlaylistId : ""
    }) : null;
  }

  function getSketchfabModel(name = "", weaponName = "") {
    return approvedSketchfabModels[`${normalizeCollectionKey(name)}|${String(weaponName).trim().toLowerCase()}`] || null;
  }

  function getSkinVariants(skin = {}) {
    const variants = [];
    const addVariant = (entry = {}, index = 0) => {
      const source = entry?.fullRender || entry?.displayIcon || skin.displayIcon;
      const url = String(source || "").trim();
      if (!url) return;
      variants.push(Object.freeze({
        id: String(entry?.uuid || `${skin.uuid || "skin"}-variant-${index + 1}`),
        source: url,
        label: String(entry?.displayName || `Variant ${index + 1}`).trim(),
        swatch: String(entry?.swatch || "").trim(),
        video: String(entry?.streamedVideo || "").trim()
      }));
    };

    (skin.chromas || []).forEach(addVariant);
    if (!variants.length) addVariant(skin, 0);
    return Object.freeze(variants);
  }

  function getUpgradeVideos(skin = {}) {
    return Object.freeze((skin.levels || []).map((level, index) => ({
      id: String(level?.uuid || `${skin.uuid || "skin"}-level-${index + 1}`),
      label: String(level?.displayName || `Upgrade ${index + 1}`).trim(),
      video: String(level?.streamedVideo || "").trim()
    })).filter(level => level.video).map(level => Object.freeze(level)));
  }

  function getSkinArt(skin = {}) {
    const variants = getSkinVariants(skin);
    const source = variants[0]?.source || "";
    return { card: source, preview: source, variants };
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
        variants: art.variants,
        views: art.variants,
        upgradeVideos: getUpgradeVideos(skin),
        sketchfabModel: getSketchfabModel(name, weaponName),
        bundleVideo: getCollectionVideo(name)
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

  globalThis.RankedCoachWeaponCollections = Object.freeze({ getCached, loadForWeapon, getCollectionVideo, getSketchfabModel });
})();
