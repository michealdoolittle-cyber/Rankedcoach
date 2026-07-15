const PREMIUM_THEMES = [
  {
    id: "radiant-focus",
    label: "Radiant Focus",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: {
      accent: "#facc15",
      accent2: "#38bdf8",
      card: "#07111f",
      card2: "#111827",
      text: "#f8fafc",
      muted: "#cbd5e1"
    },
    signatureMotion: {
      name: "rank-glint",
      durationMs: 1800,
      easing: "ease-in-out"
    },
    emphasis: {
      strong: "rank progress and peak-chase reads",
      subtle: "gold highlights with cool blue support"
    }
  },
  {
    id: "omen-night",
    label: "Omen Night",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: {
      accent: "#8b5cf6",
      accent2: "#06b6d4",
      card: "#090a1a",
      card2: "#151129",
      text: "#f5f3ff",
      muted: "#c4b5fd"
    },
    signatureMotion: {
      name: "shadow-drift",
      durationMs: 2400,
      easing: "cubic-bezier(.22,.61,.36,1)"
    },
    emphasis: {
      strong: "controller, lurk, and decision-making reads",
      subtle: "dark violet cards with soft cyan edges"
    }
  },
  {
    id: "tactical-matrix",
    label: "Tactical Matrix",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: { accent: "#38bdf8", accent2: "#facc15", card: "#071522", card2: "#0d2530", text: "#f8fafc", muted: "#a8b3c7" },
    signatureMotion: { name: "grid-drift", durationMs: 18000, easing: "linear" },
    emphasis: { strong: "animated tactical-grid texture", subtle: "sky-blue lines with warm yellow signals" }
  },
  {
    id: "astral-galaxy",
    label: "Astral Galaxy",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: { accent: "#a78bfa", accent2: "#22d3ee", card: "#090d20", card2: "#19103a", text: "#f8fafc", muted: "#c4b5fd" },
    signatureMotion: { name: "star-drift", durationMs: 26000, easing: "linear" },
    emphasis: { strong: "slow star-field drift", subtle: "violet nebulae with cyan starlight" }
  },
  {
    id: "abyssal-tide",
    label: "Abyssal Tide",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: { accent: "#2dd4bf", accent2: "#38bdf8", card: "#052530", card2: "#0a4650", text: "#f0fdfa", muted: "#99f6e4" },
    signatureMotion: { name: "water-flow", durationMs: 22000, easing: "ease-in-out" },
    emphasis: { strong: "layered underwater current", subtle: "deep teal with clear blue highlights" }
  },
  {
    id: "spectral-fog",
    label: "Spectral Fog",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: { accent: "#c4b5fd", accent2: "#64748b", card: "#111522", card2: "#252036", text: "#f8fafc", muted: "#cbd5e1" },
    signatureMotion: { name: "fog-drift", durationMs: 28000, easing: "ease-in-out" },
    emphasis: { strong: "soft layered fog banks", subtle: "lavender light over slate smoke" }
  },
  {
    id: "cryo-fractal",
    label: "Cryo Fractal",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: { accent: "#a5f3fc", accent2: "#60a5fa", card: "#081a27", card2: "#12364a", text: "#f0f9ff", muted: "#bae6fd" },
    signatureMotion: { name: "fractal-shift", durationMs: 30000, easing: "linear" },
    emphasis: { strong: "slow crystalline fracture shift", subtle: "ice cyan with arctic blue depth" }
  },
  {
    id: "solar-magma",
    label: "Solar Magma",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: { accent: "#fb923c", accent2: "#facc15", card: "#240b06", card2: "#4a1608", text: "#fff7ed", muted: "#fed7aa" },
    signatureMotion: { name: "solar-flow", durationMs: 24000, easing: "ease-in-out" },
    emphasis: { strong: "flowing solar-flare veins", subtle: "magma orange with a golden core" }
  },
  {
    id: "prism-refraction",
    label: "Prism Refraction",
    locked: true,
    subscriptionRequired: "premiumThemes",
    colors: { accent: "#f472b6", accent2: "#22d3ee", card: "#111127", card2: "#28204a", text: "#fafafa", muted: "#ddd6fe" },
    signatureMotion: { name: "prism-turn", durationMs: 32000, easing: "linear" },
    emphasis: { strong: "refracting kaleidoscope rotation", subtle: "pink, cyan, and violet facets" }
  }
];

function hasPremiumThemeAccess(profile = {}, flags = {}) {
  return Boolean(
    flags.premiumThemes === true ||
    flags.allPremium === true ||
    profile?.subscription?.premiumThemes === true ||
    profile?.subscription?.tier === "premium" ||
    profile?.entitlements?.premiumThemes === true
  );
}

function getPremiumThemesForProfile(profile = {}, flags = {}) {
  const unlocked = hasPremiumThemeAccess(profile, flags);
  return PREMIUM_THEMES.map(theme => ({
    ...theme,
    locked: !unlocked,
    accessState: unlocked ? "available" : "locked"
  }));
}

function getPremiumThemeById(id, profile = {}, flags = {}) {
  return getPremiumThemesForProfile(profile, flags).find(theme => theme.id === id) || null;
}

module.exports = {
  PREMIUM_THEMES,
  hasPremiumThemeAccess,
  getPremiumThemesForProfile,
  getPremiumThemeById
};
