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
  },
  {
    id: "storm-voltage", label: "Storm Voltage", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#60a5fa", accent2: "#f8fafc", card: "#071426", card2: "#10294a", text: "#f8fafc", muted: "#bfdbfe" },
    signatureMotion: { name: "lightning-strike", durationMs: 12000, easing: "steps(1,end)" },
    emphasis: { strong: "branching lightning strikes", subtle: "electric blue storm depth" }
  },
  {
    id: "jetstream-wind", label: "Jetstream Wind", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#67e8f9", accent2: "#d9f99d", card: "#08222c", card2: "#124451", text: "#f0fdfa", muted: "#a5f3fc" },
    signatureMotion: { name: "wind-flow", durationMs: 18000, easing: "ease-in-out" },
    emphasis: { strong: "sweeping wind ribbons", subtle: "cyan air currents with lime light" }
  },
  {
    id: "void-ink", label: "Void Ink", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#818cf8", accent2: "#c084fc", card: "#090d17", card2: "#24153a", text: "#f8fafc", muted: "#c4b5fd" },
    signatureMotion: { name: "ink-bloom", durationMs: 24000, easing: "ease-in-out" },
    emphasis: { strong: "dark ink blooms", subtle: "indigo and violet diffusion" }
  },
  {
    id: "echo-sonar", label: "Echo Sonar", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#2dd4bf", accent2: "#a7f3d0", card: "#06221d", card2: "#0b403b", text: "#f0fdfa", muted: "#99f6e4" },
    signatureMotion: { name: "sonar-pulse", durationMs: 9000, easing: "ease-out" },
    emphasis: { strong: "expanding sonar pings", subtle: "deep green radar glow" }
  },
  {
    id: "neon-eq", label: "Neon EQ", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#f472b6", accent2: "#22d3ee", card: "#16071f", card2: "#3a0d43", text: "#fdf4ff", muted: "#f5d0fe" },
    signatureMotion: { name: "sound-wave", durationMs: 8000, easing: "ease-in-out" },
    emphasis: { strong: "animated EDM equalizer waves", subtle: "neon pink and cyan rhythm" }
  },
  {
    id: "victory-confetti", label: "Victory Confetti", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#facc15", accent2: "#fb7185", card: "#171029", card2: "#38204b", text: "#fff7ed", muted: "#fde68a" },
    signatureMotion: { name: "confetti-pop", durationMs: 14000, easing: "linear" },
    emphasis: { strong: "confetti popper bursts", subtle: "gold, coral, and violet celebration" }
  },
  {
    id: "aurora-rift", label: "Aurora Rift", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#5eead4", accent2: "#c084fc", card: "#07131f", card2: "#1d1638", text: "#f8fafc", muted: "#c4b5fd" },
    signatureMotion: { name: "aurora-rift", durationMs: 24000, easing: "ease-in-out" },
    emphasis: { strong: "shifting aurora ribbons", subtle: "teal light folding through violet space" }
  },
  {
    id: "neon-rain", label: "Neon Rain", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#22d3ee", accent2: "#fb7185", card: "#06111b", card2: "#1a1630", text: "#ecfeff", muted: "#a5f3fc" },
    signatureMotion: { name: "neon-rain", durationMs: 15000, easing: "linear" },
    emphasis: { strong: "falling neon streaks", subtle: "cyan rainfall with coral flashes" }
  },
  {
    id: "ember-dragon", label: "Ember Dragon", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#f97316", accent2: "#ef4444", card: "#170805", card2: "#3a120a", text: "#fff7ed", muted: "#fed7aa" },
    signatureMotion: { name: "ember-dragon", durationMs: 21000, easing: "ease-in-out" },
    emphasis: { strong: "curling ember breath", subtle: "orange heat with red flare paths" }
  },
  {
    id: "gravity-well", label: "Gravity Well", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#a78bfa", accent2: "#60a5fa", card: "#070716", card2: "#151538", text: "#f5f3ff", muted: "#c4b5fd" },
    signatureMotion: { name: "gravity-well", durationMs: 30000, easing: "linear" },
    emphasis: { strong: "orbiting gravity rings", subtle: "violet mass with blue star pull" }
  },
  {
    id: "holo-grid", label: "Holo Grid", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#38bdf8", accent2: "#34d399", card: "#041520", card2: "#082735", text: "#f0fdfa", muted: "#bae6fd" },
    signatureMotion: { name: "holo-grid", durationMs: 18000, easing: "linear" },
    emphasis: { strong: "holographic grid scan", subtle: "blue-green tactical projection" }
  },
  {
    id: "toxic-sludge", label: "Toxic Sludge", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#a3e635", accent2: "#22c55e", card: "#071006", card2: "#17260b", text: "#f7fee7", muted: "#d9f99d" },
    signatureMotion: { name: "toxic-sludge", durationMs: 23000, easing: "ease-in-out" },
    emphasis: { strong: "slow toxic bubbles", subtle: "acid green pools over dark resin" }
  },
  {
    id: "eclipse-corona", label: "Eclipse Corona", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#f59e0b", accent2: "#7dd3fc", card: "#090908", card2: "#1f1a12", text: "#fff7ed", muted: "#fde68a" },
    signatureMotion: { name: "eclipse-corona", durationMs: 26000, easing: "ease-in-out" },
    emphasis: { strong: "solar corona breathing", subtle: "gold ring light behind cool shadow" }
  },
  {
    id: "data-stream", label: "Data Stream", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#10b981", accent2: "#38bdf8", card: "#04110e", card2: "#09251f", text: "#ecfdf5", muted: "#a7f3d0" },
    signatureMotion: { name: "data-stream", durationMs: 12000, easing: "linear" },
    emphasis: { strong: "streaming data columns", subtle: "green code over blue packet light" }
  },
  {
    id: "crystal-bloom", label: "Crystal Bloom", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#f0abfc", accent2: "#67e8f9", card: "#0c0a18", card2: "#211832", text: "#fdf4ff", muted: "#f5d0fe" },
    signatureMotion: { name: "crystal-bloom", durationMs: 28000, easing: "ease-in-out" },
    emphasis: { strong: "faceted crystal bloom", subtle: "pink prisms with cyan edges" }
  },
  {
    id: "comet-trail", label: "Comet Trail", locked: true, subscriptionRequired: "premiumThemes",
    colors: { accent: "#93c5fd", accent2: "#facc15", card: "#050b19", card2: "#111d33", text: "#eff6ff", muted: "#bfdbfe" },
    signatureMotion: { name: "comet-trail", durationMs: 17000, easing: "ease-in-out" },
    emphasis: { strong: "sweeping comet trails", subtle: "blue arcs with golden sparks" }
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
