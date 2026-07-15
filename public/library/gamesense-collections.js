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
  const contentTiers = Object.freeze({
    "12683d76-48d7-84a3-4e09-6985794f0445": "Select",
    "0cebb8be-46d7-c12a-d306-e9907bfc5a25": "Deluxe",
    "60bca009-4182-7998-dee7-b8a2558dc369": "Premium",
    "e046854e-406c-37f4-6607-19a9ba8426fc": "Exclusive",
    "411e4a55-4e59-7757-41f0-86a53f101bb5": "Ultra"
  });
  const cache = new Map();
  const pending = new Map();

  function getCollectionName(displayName = "", weaponName = "") {
    const escapedWeapon = weaponName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return displayName.replace(new RegExp(`\\s+${escapedWeapon}$`, "i"), "").trim();
  }

  function getSkinArt(skin = {}) {
    const chroma = (skin.chromas || []).find(item => item.fullRender || item.displayIcon);
    const level = (skin.levels || []).find(item => item.displayIcon);
    return {
      card: skin.displayIcon || chroma?.displayIcon || chroma?.fullRender || level?.displayIcon || "",
      preview: chroma?.fullRender || skin.displayIcon || chroma?.displayIcon || level?.displayIcon || ""
    };
  }

  function normalizeSkins(weaponName, skins = []) {
    const omittedNames = new Set([`standard ${weaponName}`.toLowerCase(), "random favorite skin"]);
    const seen = new Set();
    return skins.map(skin => {
      const displayName = String(skin?.displayName || "").trim();
      const art = getSkinArt(skin);
      const name = getCollectionName(displayName, weaponName);
      const edition = contentTiers[String(skin?.contentTierUuid || "").toLowerCase()] || "Unrated";
      return {
        id: String(skin?.uuid || `${weaponName}-${name}`),
        name,
        weaponName,
        edition,
        editionKey: edition.toLowerCase(),
        image: art.card,
        previewImage: art.preview
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
