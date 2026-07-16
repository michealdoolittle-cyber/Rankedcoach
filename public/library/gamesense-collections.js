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
  const collectionVideos = Object.freeze({
    aemondir: Object.freeze({ id: "P3fUih8vWhY", title: "Aemondir bundle showcase", channel: "Kanga" }),
    chronovoid: Object.freeze({ id: "CT8iu21QemU", title: "ChronoVoid bundle showcase", channel: "Valorant ASMR" }),
    "evori-dreamwings": Object.freeze({ id: "oW0qmFWHnlw", title: "Evori Dreamwings bundle showcase", channel: "Kanga" }),
    glitchpop: Object.freeze({ id: "cQvYigbe-f4", title: "Glitchpop bundle showcase", channel: "Valorant SkinSpotlight" }),
    neptune: Object.freeze({ id: "YWPokR196IU", title: "Neptune bundle showcase", channel: "Valorant SkinSpotlight" }),
    "prelude-to-chaos": Object.freeze({ id: "XOwgSAWD1ZA", title: "Prelude to Chaos bundle showcase", channel: "Valorant SkinSpotlight" }),
    "protocol-781-a": Object.freeze({ id: "kFVmNy4AGWo", title: "Protocol 781-A bundle showcase", channel: "Valorant SkinSpotlight" }),
    "radiant-entertainment-system": Object.freeze({ id: "Wj53-KugZJI", title: "Radiant Entertainment System bundle showcase", channel: "Kanga" }),
    recon: Object.freeze({ id: "BWmYepJkpBY", title: "Recon bundle showcase", channel: "Valorant SkinSpotlight" }),
    "rgx-11z-pro": Object.freeze({ id: "pcHmsSqik_U", title: "RGX 11z Pro bundle showcase", channel: "Valorant SkinSpotlight" })
  });
  const cache = new Map();
  const pending = new Map();

  function getCollectionName(displayName = "", weaponName = "") {
    const escapedWeapon = weaponName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return displayName.replace(new RegExp(`\\s+${escapedWeapon}$`, "i"), "").trim();
  }

  function normalizeCollectionKey(value = "") {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
        bundleVideo: collectionVideos[normalizeCollectionKey(name)] || null
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

  globalThis.RankedCoachWeaponCollections = Object.freeze({ getCached, loadForWeapon });
})();
