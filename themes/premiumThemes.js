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
