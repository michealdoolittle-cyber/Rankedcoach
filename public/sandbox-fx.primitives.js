// fx.primitives.js
console.log("✅ fx.primitives.js loaded");

// ======================
// OMEN — SPAWN HELPERS
// (NO FX REGISTRY CODE IN THIS FILE)
// ======================

function spawnOmenRipple(host, strength = 1, speed = 1) {
  const ripple = document.createElement("div");
  ripple.className = "fx-omen-ripple";
  ripple.style.setProperty("--dur", `${3 / Math.max(0.1, speed)}s`);
  ripple.style.filter = `blur(${14 + strength * 6}px)`;

  host.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

function spawnOmenShadow(host, dx, dy) {
  const s = document.createElement("div");
  s.className = "fx-omen-shadow";
  s.style.setProperty("--dx", `${dx}px`);
  s.style.setProperty("--dy", `${dy}px`);
  host.appendChild(s);
  return s;
}

function spawnOmenThread(host, x, strength = 1) {
  const t = document.createElement("div");
  t.className = "fx-omen-thread";
  t._t = Math.random() * Math.PI * 2;

  t.style.left = `${x}%`;
  t.style.opacity = 0.3 + strength * 0.6;
  t.style.mixBlendMode = "screen";

  host.appendChild(t);
  return t;
}


/*
  // ======================
  // O M E N
  // ======================
  omen: {
    fx: [
      {
        id: "omen_shadow_phase",
        name: "Shadow Phase",
        intent:
          "Living darkness swirls across Omen’s silhouette as portions fade out and reappear, never fully vanishing.",
        primitives: ["opacityMask", "noiseFlow", "swirlField"],
        sliders: {
          shadowDensity:   { min: 0, max: 1, default: 0.6 },
          phaseCycle:      { min: 2, max: 12, default: 6 },
          swirlSpeed:      { min: 0, max: 2, default: 0.8 },
          visibilityFloor: { min: 0, max: 0.6, default: 0.2 }
        }
      },


  // ======================
  // B R E A C H
  // ======================
  breach: {
    fx: [
      {
        id: "breach_seismic_frame",
        name: "Seismic Pressure",
        intent:
          "Sections of the card frame push outward one at a time with heavy force, ejecting debris.",
        primitives: ["segmentedFrame", "zPush", "debrisEmitter"],
        sliders: {
          segmentCount: { min: 2, max: 8, default: 4 },
          pushDepth:    { min: 10, max: 80, default: 40 },
          impactDelay:  { min: 0.2, max: 2, default: 0.8 },
          debrisAmount: { min: 0, max: 1, default: 0.6 }
        }
      },
      {
        id: "breach_aftershock_rumble",
        name: "Aftershock Rumble",
        intent:
          "Low-frequency rumble causes subtle vibration and falling dust.",
        primitives: ["lowFreqShake", "dustParticles"],
        sliders: {
          rumbleStrength: { min: 0, max: 1, default: 0.4 },
          shakeRate:      { min: 0.5, max: 3, default: 1.2 },
          dustDensity:    { min: 0, max: 1, default: 0.5 },
          decay:          { min: 0, max: 1, default: 0.6 }
        }
      }
    ]
  },

  // ======================
  // J E T T
  // ======================
  jett: {
    fx: [
      {
        id: "jett_wind_shear",
        name: "Wind Shear",
        intent:
          "Wind ribbons orbit Jett’s silhouette with subtle upward lift.",
        primitives: ["vectorTrails", "liftBias"],
        sliders: {
          windSpeed:   { min: 0, max: 2, default: 0.9 },
          liftAmount:  { min: 0, max: 20, default: 6 },
          trailLength: { min: 10, max: 80, default: 40 },
          softness:    { min: 0, max: 1, default: 0.6 }
        }
      },
      {
        id: "jett_dash_echo",
        name: "Dash Echo",
        intent:
          "Occasional motion echoes snap behind Jett, hinting at sudden movement.",
        primitives: ["ghostEcho", "motionBlur"],
        sliders: {
          echoChance: { min: 0, max: 1, default: 0.25 },
          offset:     { min: 5, max: 40, default: 18 },
          blur:       { min: 0, max: 10, default: 4 },
          fadeSpeed:  { min: 0.2, max: 2, default: 0.7 }
        }
      }
    ]
  },

  // ======================
  // P H O E N I X
  // ======================
  phoenix: {
    fx: [
      {
        id: "phoenix_inner_flame",
        name: "Inner Flame",
        intent:
          "Fire burns inside Phoenix’s silhouette, licking upward and pulsing with heat.",
        primitives: ["internalFlames", "heatDistortion"],
        sliders: {
          flameHeight: { min: 0, max: 1, default: 0.7 },
          heatRipple:  { min: 0, max: 1, default: 0.4 },
          emberRate:   { min: 0, max: 1, default: 0.3 },
          brightness:  { min: 0, max: 1, default: 0.8 }
        }
      },
      {
        id: "phoenix_reignite_glow",
        name: "Reignite Glow",
        intent:
          "A warm glow surges outward periodically like a self-heal pulse.",
        primitives: ["radialGlow", "pulseWave"],
        sliders: {
          pulseRate:   { min: 2, max: 12, default: 6 },
          glowRadius:  { min: 40, max: 200, default: 120 },
          intensity:   { min: 0, max: 1, default: 0.6 },
          decay:       { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // V I P E R
  // ======================
  viper: {
    fx: [
      {
        id: "viper_toxic_flow",
        name: "Toxic Circulation",
        intent:
          "Green toxin flows through veins across Viper’s silhouette.",
        primitives: ["veinMask", "flowNoise"],
        sliders: {
          flowSpeed: { min: 0, max: 2, default: 0.6 },
          density:   { min: 0, max: 1, default: 0.7 },
          opacity:   { min: 0, max: 1, default: 0.6 },
          pulse:     { min: 0, max: 1, default: 0.4 }
        }
      },
      {
        id: "viper_gas_pressure",
        name: "Gas Pressure",
        intent:
          "A slow pressure wave expands like Viper’s ult breathing.",
        primitives: ["radialFog", "pressurePulse"],
        sliders: {
          pressureRate: { min: 3, max: 15, default: 8 },
          expansion:    { min: 0, max: 1, default: 0.5 },
          fade:         { min: 0, max: 1, default: 0.6 },
          softness:     { min: 0, max: 1, default: 0.7 }
        }
      }
    ]
  }

  // ⚠️ CONTINUES:
  // Sage, Reyna, Killjoy, Sova, Cypher, Raze, Yoru, Fade, KAY/O,
  // Skye, Astra, Chamber, Harbor, Deadlock, Iso, Neon, Gekko, Clove
};
  // ======================
  // S A G E
  // ======================
  sage: {
    fx: [
      {
        id: "sage_healing_flow",
        name: "Healing Flow",
        intent:
          "Soft energy streams flow upward through Sage like restorative magic.",
        primitives: ["verticalFlow", "softGlow"],
        sliders: {
          flowSpeed: { min: 0, max: 2, default: 0.5 },
          brightness:{ min: 0, max: 1, default: 0.6 },
          softness:  { min: 0, max: 1, default: 0.8 },
          pulse:     { min: 0, max: 1, default: 0.3 }
        }
      },
      {
        id: "sage_barrier_crystal",
        name: "Barrier Crystal",
        intent:
          "Crystalline facets subtly form and refract light across her silhouette.",
        primitives: ["facetMask", "lightRefraction"],
        sliders: {
          facetSize: { min: 10, max: 80, default: 40 },
          shimmer:   { min: 0, max: 1, default: 0.5 },
          opacity:   { min: 0, max: 1, default: 0.4 },
          shiftRate: { min: 0, max: 1, default: 0.3 }
        }
      }
    ]
  },

  // ======================
  // R E Y N A
  // ======================
  reyna: {
    fx: [
      {
        id: "reyna_soul_pull",
        name: "Soul Pull",
        intent:
          "Purple energy pulls inward toward Reyna as if consuming nearby souls.",
        primitives: ["inwardFlow", "energyVeins"],
        sliders: {
          pullStrength:{ min: 0, max: 1, default: 0.7 },
          pulseRate:   { min: 1, max: 6, default: 3 },
          glow:        { min: 0, max: 1, default: 0.8 },
          decay:       { min: 0, max: 1, default: 0.5 }
        }
      },
      {
        id: "reyna_dismiss_phase",
        name: "Dismiss Phase",
        intent:
          "Reyna intermittently phases into a ghostly, invulnerable state.",
        primitives: ["phaseOpacity", "spectralShift"],
        sliders: {
          phaseTime: { min: 2, max: 10, default: 5 },
          fadeDepth: { min: 0, max: 1, default: 0.6 },
          tint:      { min: 0, max: 1, default: 0.7 },
          softness:  { min: 0, max: 1, default: 0.8 }
        }
      }
    ]
  },

  // ======================
  // K I L L J O Y
  // ======================
  killjoy: {
    fx: [
      {
        id: "kj_tech_calibration",
        name: "Tech Calibration",
        intent:
          "UI brackets and markers assemble and realign around Killjoy.",
        primitives: ["uiOverlays", "scanTicks"],
        sliders: {
          scanRate:  { min: 0, max: 3, default: 1 },
          density:   { min: 0, max: 1, default: 0.6 },
          opacity:   { min: 0, max: 1, default: 0.7 },
          jitter:    { min: 0, max: 1, default: 0.2 }
        }
      },
      {
        id: "kj_lockdown_field",
        name: "Lockdown Field",
        intent:
          "A faint containment field pulses outward from Killjoy.",
        primitives: ["radialGrid", "fieldPulse"],
        sliders: {
          radius:   { min: 40, max: 200, default: 120 },
          pulseRate:{ min: 2, max: 10, default: 6 },
          strength: { min: 0, max: 1, default: 0.5 },
          fade:     { min: 0, max: 1, default: 0.6 }
        }
      }
    ]
  },

  // ======================
  // S O V A
  // ======================
  sova: {
    fx: [
      {
        id: "sova_recon_scan",
        name: "Recon Scan",
        intent:
          "Radial scan waves sweep across Sova’s silhouette.",
        primitives: ["radialScan", "edgeReveal"],
        sliders: {
          scanSpeed: { min: 0, max: 3, default: 1 },
          radius:    { min: 50, max: 200, default: 120 },
          intensity: { min: 0, max: 1, default: 0.6 },
          cooldown:  { min: 1, max: 10, default: 5 }
        }
      },
      {
        id: "sova_hunters_focus",
        name: "Hunter’s Focus",
        intent:
          "Edges sharpen and darken as Sova locks into target focus.",
        primitives: ["edgeSharpen", "vignette"],
        sliders: {
          sharpness:{ min: 0, max: 1, default: 0.5 },
          darken:   { min: 0, max: 1, default: 0.4 },
          pulse:    { min: 0, max: 1, default: 0.3 },
          hold:     { min: 0, max: 1, default: 0.6 }
        }
      }
    ]
  },

  // ======================
  // C Y P H E R
  // ======================
  cypher: {
    fx: [
      {
        id: "cypher_surveillance",
        name: "Surveillance",
        intent:
          "Camera reticles and data flicker across Cypher’s form.",
        primitives: ["reticles", "dataNoise"],
        sliders: {
          reticleCount:{ min: 0, max: 5, default: 2 },
          flicker:     { min: 0, max: 1, default: 0.4 },
          opacity:     { min: 0, max: 1, default: 0.6 },
          sweep:       { min: 0, max: 1, default: 0.5 }
        }
      },
      {
        id: "cypher_tripwire_tension",
        name: "Tripwire Tension",
        intent:
          "Invisible tension lines subtly pull at the silhouette edges.",
        primitives: ["edgeTension", "lineHints"],
        sliders: {
          tension: { min: 0, max: 1, default: 0.5 },
          count:   { min: 0, max: 6, default: 3 },
          fade:    { min: 0, max: 1, default: 0.6 },
          jitter:  { min: 0, max: 1, default: 0.2 }
        }
      }
    ]
  }
  // ======================
  // R A Z E
  // ======================
  raze: {
    fx: [
      {
        id: "raze_explosive_pressure",
        name: "Explosive Pressure",
        intent:
          "Contained explosive energy pushes outward in short bursts, like grenades primed but not detonated.",
        primitives: ["radialPush", "debrisHints"],
        sliders: {
          burstRate:  { min: 1, max: 8, default: 4 },
          pushAmount: { min: 0, max: 1, default: 0.6 },
          debris:     { min: 0, max: 1, default: 0.5 },
          decay:      { min: 0, max: 1, default: 0.4 }
        }
      },
      {
        id: "raze_paint_charge",
        name: "Paint Charge",
        intent:
          "Color splashes and streaks crawl and settle across the silhouette.",
        primitives: ["colorSplatter", "surfaceCrawl"],
        sliders: {
          splatterAmount:{ min: 0, max: 1, default: 0.6 },
          crawlSpeed:    { min: 0, max: 2, default: 0.8 },
          saturation:    { min: 0, max: 1, default: 0.9 },
          fade:          { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // Y O R U
  // ======================
  yoru: {
    fx: [
      {
        id: "yoru_dimensional_rift",
        name: "Dimensional Rift",
        intent:
          "Blue rifts open and slide across Yoru as layers misalign and snap back.",
        primitives: ["layerOffset", "riftMask"],
        sliders: {
          offset:    { min: 0, max: 40, default: 18 },
          riftSpeed: { min: 0, max: 2, default: 0.7 },
          glow:      { min: 0, max: 1, default: 0.8 },
          remerge:   { min: 0, max: 1, default: 0.5 }
        }
      },
      {
        id: "yoru_phase_tearing",
        name: "Phase Tearing",
        intent:
          "The silhouette intermittently tears as if phasing between dimensions.",
        primitives: ["phaseSlices", "opacityShift"],
        sliders: {
          tearCount: { min: 1, max: 6, default: 3 },
          phaseTime: { min: 2, max: 10, default: 5 },
          depth:     { min: 0, max: 1, default: 0.6 },
          softness:  { min: 0, max: 1, default: 0.4 }
        }
      }
    ]
  },

  // ======================
  // F A D E
  // ======================
  fade: {
    fx: [
      {
        id: "fade_nightmare_tendrils",
        name: "Nightmare Tendrils",
        intent:
          "Shadowy tendrils creep outward and retract like living fear.",
        primitives: ["tendrilGrowth", "darkFlow"],
        sliders: {
          growthRate:{ min: 0, max: 2, default: 0.6 },
          reach:     { min: 0, max: 1, default: 0.7 },
          opacity:   { min: 0, max: 1, default: 0.6 },
          pulse:     { min: 0, max: 1, default: 0.4 }
        }
      },
      {
        id: "fade_terror_pulse",
        name: "Terror Pulse",
        intent:
          "Sudden fear pulses ripple through the silhouette.",
        primitives: ["radialShock", "contrastSpike"],
        sliders: {
          pulseRate:{ min: 1, max: 6, default: 3 },
          intensity:{ min: 0, max: 1, default: 0.7 },
          falloff:  { min: 0, max: 1, default: 0.6 },
          recovery: { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // K A Y / O
  // ======================
  kayo: {
    fx: [
      {
        id: "kayo_suppression_field",
        name: "Suppression Field",
        intent:
          "Hard-edged pulses radiate like an EMP suppression wave.",
        primitives: ["hexPulse", "signalDrop"],
        sliders: {
          pulseRate:{ min: 1, max: 8, default: 4 },
          radius:   { min: 40, max: 200, default: 120 },
          strength: { min: 0, max: 1, default: 0.7 },
          decay:    { min: 0, max: 1, default: 0.6 }
        }
      },
      {
        id: "kayo_combat_protocol",
        name: "Combat Protocol",
        intent:
          "Robotic indicators and status lights flicker methodically.",
        primitives: ["statusLights", "uiTicks"],
        sliders: {
          tickRate:{ min: 0, max: 3, default: 1 },
          brightness:{ min: 0, max: 1, default: 0.6 },
          jitter:   { min: 0, max: 1, default: 0.2 },
          opacity:  { min: 0, max: 1, default: 0.7 }
        }
      }
    ]
  },

  // ======================
  // N E O N
  // ======================
  neon: {
    fx: [
      {
        id: "neon_energy_current",
        name: "Energy Current",
        intent:
          "Electric currents race continuously along Neon’s silhouette.",
        primitives: ["electricFlow", "edgeGlow"],
        sliders: {
          speed:     { min: 0, max: 3, default: 1.5 },
          brightness:{ min: 0, max: 1, default: 0.9 },
          thickness: { min: 0, max: 1, default: 0.5 },
          flicker:   { min: 0, max: 1, default: 0.3 }
        }
      },
      {
        id: "neon_sprint_charge",
        name: "Sprint Charge",
        intent:
          "Energy builds and releases rhythmically like a runner pacing.",
        primitives: ["chargePulse", "motionBlur"],
        sliders: {
          chargeRate:{ min: 1, max: 6, default: 3 },
          intensity: { min: 0, max: 1, default: 0.7 },
          blur:      { min: 0, max: 10, default: 4 },
          cooldown:  { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // G E K K O
  // ======================
  gekko: {
    fx: [
      {
        id: "gekko_creature_orbit",
        name: "Creature Orbit",
        intent:
          "Small creature-like shapes orbit playfully around Gekko.",
        primitives: ["orbitingSprites", "bobMotion"],
        sliders: {
          count: { min: 1, max: 5, default: 3 },
          speed: { min: 0, max: 2, default: 0.7 },
          radius:{ min: 20, max: 80, default: 40 },
          bounce:{ min: 0, max: 1, default: 0.6 }
        }
      },
      {
        id: "gekko_slime_splash",
        name: "Slime Splash",
        intent:
          "Organic slime splashes and slowly slides downward.",
        primitives: ["organicSplatter", "gravitySlide"],
        sliders: {
          amount:{ min: 0, max: 1, default: 0.6 },
          viscosity:{ min: 0, max: 1, default: 0.7 },
          speed: { min: 0, max: 1, default: 0.4 },
          fade:  { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // C L O V E
  // ======================
  clove: {
    fx: [
      {
        id: "clove_afterlife_mist",
        name: "Afterlife Mist",
        intent:
          "Purple-pink mist drifts through Clove as if between life and death.",
        primitives: ["mistFlow", "opacityDrift"],
        sliders: {
          density:{ min: 0, max: 1, default: 0.6 },
          drift:  { min: 0, max: 2, default: 0.5 },
          opacity:{ min: 0, max: 1, default: 0.7 },
          softness:{ min: 0, max: 1, default: 0.8 }
        }
      },
      {
        id: "clove_defiance_pulse",
        name: "Defiance Pulse",
        intent:
          "A stubborn pulse radiates outward, hinting at refusal to fall.",
        primitives: ["radialPulse", "contrastLift"],
        sliders: {
          pulseRate:{ min: 1, max: 6, default: 3 },
          intensity:{ min: 0, max: 1, default: 0.6 },
          radius:   { min: 40, max: 200, default: 120 },
          fade:     { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  }
  // ======================
  // D E A D L O C K
  // ======================
  deadlock: {
    fx: [
      {
        id: "deadlock_nanowire_tension",
        name: "Nanowire Tension",
        intent:
          "Hard-light nanowires subtly tighten and release around Deadlock’s silhouette.",
        primitives: ["tensionLines", "edgeClamp"],
        sliders: {
          wireCount: { min: 1, max: 6, default: 3 },
          tension:   { min: 0, max: 1, default: 0.6 },
          glow:      { min: 0, max: 1, default: 0.4 },
          pulse:     { min: 0, max: 1, default: 0.3 }
        }
      },
      {
        id: "deadlock_lockdown_surge",
        name: "Lockdown Surge",
        intent:
          "A rigid containment pulse radiates outward in controlled bursts.",
        primitives: ["radialClamp", "hardPulse"],
        sliders: {
          pulseRate:{ min: 1, max: 6, default: 3 },
          strength: { min: 0, max: 1, default: 0.7 },
          radius:   { min: 40, max: 200, default: 120 },
          decay:    { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // C H A M B E R
  // ======================
  chamber: {
    fx: [
      {
        id: "chamber_gilded_precision",
        name: "Gilded Precision",
        intent:
          "Elegant gold accents subtly align and sharpen around Chamber.",
        primitives: ["goldHighlights", "precisionAlign"],
        sliders: {
          highlightStrength:{ min: 0, max: 1, default: 0.7 },
          edgeSharpness:    { min: 0, max: 1, default: 0.6 },
          shimmerRate:      { min: 0, max: 1, default: 0.3 },
          opacity:          { min: 0, max: 1, default: 0.8 }
        }
      },
      {
        id: "chamber_anchor_presence",
        name: "Anchor Presence",
        intent:
          "Subtle spatial anchors hint at teleport positions.",
        primitives: ["anchorMarkers", "spatialPulse"],
        sliders: {
          markerCount:{ min: 0, max: 3, default: 1 },
          pulseRate:  { min: 1, max: 6, default: 3 },
          glow:       { min: 0, max: 1, default: 0.6 },
          fade:       { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // S K Y E
  // ======================
  skye: {
    fx: [
      {
        id: "skye_nature_breath",
        name: "Nature Breath",
        intent:
          "Soft green energy flows like living forest breath.",
        primitives: ["organicFlow", "softGlow"],
        sliders: {
          flowSpeed:{ min: 0, max: 2, default: 0.6 },
          brightness:{ min: 0, max: 1, default: 0.6 },
          softness:  { min: 0, max: 1, default: 0.8 },
          pulse:     { min: 0, max: 1, default: 0.4 }
        }
      },
      {
        id: "skye_spirit_call",
        name: "Spirit Call",
        intent:
          "Faint animal spirit shapes briefly emerge and dissolve.",
        primitives: ["spiritHints", "fadeInOut"],
        sliders: {
          appearanceRate:{ min: 1, max: 6, default: 3 },
          opacity:       { min: 0, max: 1, default: 0.5 },
          scale:         { min: 0, max: 1, default: 0.6 },
          linger:        { min: 0, max: 1, default: 0.4 }
        }
      }
    ]
  },

  // ======================
  // A S T R A
  // ======================
  astra: {
    fx: [
      {
        id: "astra_cosmic_drift",
        name: "Cosmic Drift",
        intent:
          "Starfield energy slowly rotates and drifts through Astra.",
        primitives: ["starfield", "orbitalDrift"],
        sliders: {
          driftSpeed:{ min: 0, max: 1, default: 0.4 },
          density:   { min: 0, max: 1, default: 0.6 },
          glow:      { min: 0, max: 1, default: 0.7 },
          depth:     { min: 0, max: 1, default: 0.5 }
        }
      },
      {
        id: "astra_astral_focus",
        name: "Astral Focus",
        intent:
          "A subtle astral plane overlay phases in and out.",
        primitives: ["planeOverlay", "phaseShift"],
        sliders: {
          phaseRate:{ min: 2, max: 12, default: 6 },
          opacity:  { min: 0, max: 1, default: 0.5 },
          offset:   { min: 0, max: 1, default: 0.4 },
          softness: { min: 0, max: 1, default: 0.6 }
        }
      }
    ]
  },

  // ======================
  // I S O
  // ======================
  iso: {
    fx: [
      {
        id: "iso_kill_contract",
        name: "Kill Contract",
        intent:
          "Angular energy panels lock and release around Iso.",
        primitives: ["angularPanels", "lockPulse"],
        sliders: {
          panelCount:{ min: 1, max: 6, default: 3 },
          lockSpeed: { min: 0, max: 2, default: 0.8 },
          glow:      { min: 0, max: 1, default: 0.6 },
          opacity:   { min: 0, max: 1, default: 0.7 }
        }
      },
      {
        id: "iso_duel_focus",
        name: "Duel Focus",
        intent:
          "The world tightens inward as Iso isolates his target.",
        primitives: ["centerCompression", "contrastFocus"],
        sliders: {
          compression:{ min: 0, max: 1, default: 0.5 },
          contrast:   { min: 0, max: 1, default: 0.6 },
          pulse:      { min: 0, max: 1, default: 0.4 },
          fade:       { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  },

  // ======================
  // B R I M S T O N E
  // ======================
  brimstone: {
    fx: [
      {
        id: "brimstone_orbital_command",
        name: "Orbital Command",
        intent:
          "Tactical HUD elements and targeting grids hover around Brimstone.",
        primitives: ["hudGrid", "targetMarkers"],
        sliders: {
          gridDensity:{ min: 0, max: 1, default: 0.6 },
          scanRate:   { min: 0, max: 2, default: 0.8 },
          opacity:    { min: 0, max: 1, default: 0.7 },
          jitter:     { min: 0, max: 1, default: 0.2 }
        }
      },
      {
        id: "brimstone_incendiary_heat",
        name: "Incendiary Heat",
        intent:
          "Heat waves rise upward like a controlled inferno.",
        primitives: ["heatDistortion", "verticalGlow"],
        sliders: {
          heatStrength:{ min: 0, max: 1, default: 0.6 },
          riseSpeed:   { min: 0, max: 2, default: 0.7 },
          brightness: { min: 0, max: 1, default: 0.5 },
          softness:   { min: 0, max: 1, default: 0.6 }
        }
      }
    ]
  },

  // ======================
  // H A R B O R
  // ======================
  harbor: {
    fx: [
      {
        id: "harbor_water_flow",
        name: "Water Flow",
        intent:
          "Water currents continuously flow across Harbor’s silhouette.",
        primitives: ["liquidFlow", "refraction"],
        sliders: {
          flowSpeed:{ min: 0, max: 2, default: 0.7 },
          distortion:{ min: 0, max: 1, default: 0.6 },
          opacity:   { min: 0, max: 1, default: 0.7 },
          brightness:{ min: 0, max: 1, default: 0.5 }
        }
      },
      {
        id: "harbor_tidal_pulse",
        name: "Tidal Pulse",
        intent:
          "A calm but powerful wave radiates outward like rolling tide.",
        primitives: ["radialWave", "edgeFoam"],
        sliders: {
          pulseRate:{ min: 1, max: 6, default: 3 },
          radius:   { min: 40, max: 200, default: 120 },
          strength: { min: 0, max: 1, default: 0.6 },
          fade:     { min: 0, max: 1, default: 0.5 }
        }
      }
    ]
  }
*/

const PRIMITIVES = {


  // ======================
  // VISIBILITY / MASKING
  // ======================
  opacityMask({ host, params, time }) {
  if (!host) return;

  const density = params.shadowDensity ?? 0.6;
  const floor   = params.visibilityFloor ?? 0.2;

  // Create mask layer once
  let mask = host.querySelector(".fx-opacity-mask");
  if (!mask) {
    mask = document.createElement("div");
    mask.className = "fx-opacity-mask";
    mask.style.position = "absolute";
    mask.style.inset = "0";
    mask.style.pointerEvents = "none";
    mask.style.mixBlendMode = "multiply";
    host.appendChild(mask);
  }

  const t = time * 0.001;

  // Animate noise-like opacity variation
  const wave =
    (Math.sin(t * 1.7) +
     Math.sin(t * 2.3 + 1) +
     Math.sin(t * 3.1 + 2)) / 3;

  const opacity =
    floor + (Math.abs(wave) * density);

  mask.style.background =
    `rgba(0,0,0,${opacity})`;
},


radialMask({ host, params, time }) {
  if (!host) return;

  const expansion = params.expansion ?? 0.15;   // 0 → 0.4 typical
  const softness  = params.softness  ?? 0.6;    // edge feather
  const level     = params.darknessLevel ?? 0.7;

  // Create mask layer once
  let layer = host.querySelector(".fx-radial-mask");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-radial-mask";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "multiply";
    host.appendChild(layer);
  }

  const t = time * 0.001;
  const pulse = (Math.sin(t * 1.2) * 0.5 + 0.5); // 0..1
  const r = 35 + pulse * 40 * (1 + expansion);  // % radius

  const edge = Math.max(1, Math.min(99, r + softness * 20));

  layer.style.backgroundImage = `
    radial-gradient(
      circle at 50% 55%,
      rgba(0,0,0,${level}) 0%,
      rgba(0,0,0,${level}) ${r}%,
      rgba(0,0,0,0) ${edge}%
    )
  `;
},


phaseOpacity({ host, params, time }) {
  if (!host) return;

  const phaseTime = params.phaseTime ?? 5;
  const depth     = params.fadeDepth ?? 0.6;

  const t = time * 0.001;
  const wave = (Math.sin(t * (Math.PI * 2 / phaseTime)) + 1) / 2;

  host.style.opacity =
    1 - wave * depth;
},


  facetMask({ host, params, time }) {
    // expects: facetSize, shimmer
  },

  // ======================
  // FLOW / FIELD
  // ======================
noiseFlow({ host, params, time }) {
  if (!host) return;

  const speed   = params.swirlSpeed ?? 0.8;
  const density = params.shadowDensity ?? params.density ?? 0.6;

  // Create flow layer once
  let layer = host.querySelector(".fx-noise-flow");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-noise-flow";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "multiply";
    layer.style.backgroundSize = "200% 200%";
    host.appendChild(layer);
  }

  const t = time * 0.001 * speed;
  const x = Math.sin(t * 0.7) * 50;
  const y = Math.cos(t * 0.9) * 50;

  layer.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
  layer.style.opacity = Math.max(0, Math.min(1, density));

  // lightweight pseudo-noise via layered gradients
  layer.style.backgroundImage = `
    radial-gradient(40% 60% at 30% 40%, rgba(0,0,0,0.35), transparent 60%),
    radial-gradient(60% 40% at 70% 60%, rgba(0,0,0,0.35), transparent 60%)
  `;
},


darkFlow({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-dark-flow");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-dark-flow";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "multiply";
    layer.style.backgroundSize = "200% 200%";
    host.appendChild(layer);
  }

  const speed = params.flowSpeed ?? 0.6;
  const opacity = params.opacity ?? 0.6;
  const t = time * 0.001 * speed;

  layer.style.backgroundPosition =
    `${50 + Math.sin(t) * 40}% ${50 + Math.cos(t) * 40}%`;
  layer.style.opacity = opacity;

  layer.style.backgroundImage = `
    radial-gradient(60% 60% at 30% 40%, rgba(0,0,0,0.4), transparent 70%),
    radial-gradient(50% 50% at 70% 60%, rgba(0,0,0,0.4), transparent 70%)
  `;
},

liquidFlow({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-liquid-flow");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-liquid-flow";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "overlay";
    layer.style.filter = "blur(4px)";
    layer.style.backgroundSize = "200% 200%";
    host.appendChild(layer);
  }

  const speed = params.flowSpeed ?? 0.7;
  const dist  = params.distortion ?? 0.6;
  const t = time * 0.001 * speed;

  layer.style.backgroundPosition =
    `${50 + Math.sin(t) * 40}% ${50 + Math.cos(t * 0.9) * 40}%`;
  layer.style.opacity = Math.min(1, dist);

  layer.style.backgroundImage = `
    radial-gradient(60% 40% at 30% 50%, rgba(255,255,255,0.25), transparent 70%),
    radial-gradient(40% 60% at 70% 50%, rgba(255,255,255,0.25), transparent 70%)
  `;
},

electricFlow({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-electric-flow");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-electric-flow";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "screen";
    host.appendChild(layer);
  }

  const speed = params.speed ?? 1.5;
  const thick = params.thickness ?? 0.5;
  const t = time * 0.001 * speed;

  const shift = (Math.sin(t * 6) * 20);

  layer.style.opacity = Math.min(1, thick);
  layer.style.backgroundImage = `
    linear-gradient(
      ${t * 40}deg,
      rgba(0,255,255,0.8),
      transparent ${50 + shift}%,
      rgba(0,255,255,0.8)
    )
  `;
},


  // ======================
  // MOTION / TRANSFORM
  // ======================
scalePulse({ host, params, time }) {
  if (!host) return;

  const rate = params.breathRate ?? 5;
  const amp  = params.expansion ?? 0.15;

  const t = time * 0.001;
  const s = 1 + Math.sin(t * (Math.PI * 2 / rate)) * amp;

  host.style.transform =
    `scale(${s})`;
},


layerOffset({ host, params, time }) {
  if (!host) return;

  const amt = params.offset ?? 18;
  const speed = params.riftSpeed ?? 0.7;

  const t = time * 0.001 * speed;
  const x = Math.sin(t) * amt;
  const y = Math.cos(t * 0.8) * amt;

  host.style.transform =
    `translate(${x}px, ${y}px)`;
},


  zPush({ host, params, time }) {
    // expects: pushDepth, impactDelay
  },

centerCompression({ host, params, time }) {
  if (!host) return;

  const c = params.compression ?? 0.5;
  const t = time * 0.001;

  const s = 1 - Math.abs(Math.sin(t)) * c * 0.1;

  host.style.transform =
    `scale(${s})`;
},


liftBias({ host, params, time }) {
  if (!host) return;

  const lift = params.liftAmount ?? 6;
  const t = time * 0.001;

  const y = Math.sin(t) * lift;

  host.style.transform =
    `translateY(${-y}px)`;
},


  // ======================
  // STRUCTURE / FRAME
  // ======================
segmentedFrame({ host, params }) {
  if (!host) return;

  const count = params.segmentCount ?? 4;

  let wrap = host.querySelector(".fx-segmented-frame");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "fx-segmented-frame";
    wrap.style.position = "absolute";
    wrap.style.inset = "0";
    wrap.style.pointerEvents = "none";
    host.appendChild(wrap);
  }

  if (wrap.childElementCount !== count) {
    wrap.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const seg = document.createElement("div");
      seg.className = "fx-frame-seg";
      seg.style.position = "absolute";
      seg.style.inset = "0";
      seg.style.border = "1px solid rgba(255,255,255,0.15)";
      seg.style.transform =
        `rotate(${(360 / count) * i}deg)`;
      wrap.appendChild(seg);
    }
  }
},


angularPanels({ host, params, time }) {
  if (!host) return;

  const count = params.panelCount ?? 3;
  const speed = params.lockSpeed ?? 0.8;

  let wrap = host.querySelector(".fx-angular-panels");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "fx-angular-panels";
    wrap.style.position = "absolute";
    wrap.style.inset = "0";
    wrap.style.pointerEvents = "none";
    host.appendChild(wrap);
  }

  if (wrap.childElementCount !== count) {
    wrap.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.style.position = "absolute";
      p.style.inset = "20%";
      p.style.border = "2px solid rgba(255,255,255,0.25)";
      p.style.transform = `rotate(${i * 15}deg)`;
      wrap.appendChild(p);
    }
  }

  const t = time * 0.001 * speed;
  wrap.style.opacity = 0.5 + Math.sin(t) * 0.2;
},


hexPulse({ host, params, time }) {
  if (!host) return;

  const radius = params.radius ?? 120;
  const str = params.strength ?? 0.7;
  const t = time * 0.001;

  host.style.boxShadow =
    `0 0 ${radius}px rgba(100,200,255,${str * (0.5 + Math.sin(t) * 0.5)})`;
},


hudGrid({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-hud-grid");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-hud-grid";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "screen";
    layer.style.backgroundSize = "40px 40px";
    host.appendChild(layer);
  }

  const density = params.gridDensity ?? 0.6;
  const speed   = params.scanRate ?? 0.8;
  const t = time * 0.001 * speed;

  layer.style.opacity = density * 0.6;
  layer.style.backgroundPosition = `${t * 20}px ${t * 20}px`;

  layer.style.backgroundImage = `
    linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
  `;
},


  // ======================
  // PARTICLES / DEBRIS
  // ======================
debrisEmitter({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-debris");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-debris";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    host.appendChild(layer);
  }

  const amount = params.debrisAmount ?? 0.6;
  const t = time * 0.001;

  layer.innerHTML = "";
  const count = Math.floor(amount * 8);

  for (let i = 0; i < count; i++) {
    const d = document.createElement("div");
    d.style.position = "absolute";
    d.style.width = "4px";
    d.style.height = "4px";
    d.style.background = "rgba(180,180,180,0.8)";
    d.style.left = `${50 + Math.sin(t + i) * 30}%`;
    d.style.top  = `${50 + Math.cos(t * 1.2 + i) * 30}%`;
    layer.appendChild(d);
  }
},


dustParticles({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-dust");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-dust";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    host.appendChild(layer);
  }

  const density = params.dustDensity ?? 0.5;
  const t = time * 0.001;

  layer.innerHTML = "";
  const count = Math.floor(density * 12);

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.style.position = "absolute";
    p.style.width = "2px";
    p.style.height = "2px";
    p.style.background = "rgba(255,255,255,0.5)";
    p.style.left = `${Math.random() * 100}%`;
    p.style.top  = `${(Math.random() * 100 + t * 10) % 100}%`;
    layer.appendChild(p);
  }
},


emberHints({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-embers");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-embers";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "screen";
    host.appendChild(layer);
  }

  const rate = params.emberRate ?? 0.3;
  const t = time * 0.001;

  layer.innerHTML = "";
  if (Math.random() < rate * 0.02) {
    const e = document.createElement("div");
    e.style.position = "absolute";
    e.style.width = "3px";
    e.style.height = "3px";
    e.style.background = "orange";
    e.style.left = `${40 + Math.random() * 20}%`;
    e.style.top  = `${60 + Math.random() * 20}%`;
    layer.appendChild(e);
  }
},


edgeFoam({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-edge-foam");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-edge-foam";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "screen";
    host.appendChild(layer);
  }

  const strength = params.strength ?? 0.6;
  const t = time * 0.001;

  layer.style.opacity = strength * (0.6 + Math.sin(t) * 0.4);
  layer.style.border = `2px solid rgba(255,255,255,${strength})`;
},


  // ======================
  // UI / OVERLAY
  // ======================
reticles({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-reticles");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-reticles";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    host.appendChild(layer);
  }

  const count = params.reticleCount ?? 2;
  const t = time * 0.001;

  if (layer.childElementCount !== count) {
    layer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const r = document.createElement("div");
      r.className = "fx-reticle";
      r.style.position = "absolute";
      r.style.width = "18px";
      r.style.height = "18px";
      r.style.border = "1px solid rgba(255,255,255,0.6)";
      r.style.borderRadius = "50%";
      layer.appendChild(r);
    }
  }

  [...layer.children].forEach((r, i) => {
    r.style.left = `${50 + Math.sin(t + i) * 20}%`;
    r.style.top  = `${50 + Math.cos(t * 1.1 + i) * 20}%`;
  });
},


scanTicks({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-scan-ticks");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-scan-ticks";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    host.appendChild(layer);
  }

  const rate = params.scanRate ?? 1;
  const t = time * 0.001 * rate;

  layer.style.background =
    `linear-gradient(
      to right,
      transparent 0%,
      rgba(255,255,255,0.4) ${50 + Math.sin(t) * 20}%,
      transparent 100%
    )`;
},


targetMarkers({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-target-markers");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-target-markers";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    host.appendChild(layer);
  }

  const count = params.markerCount ?? 1;

  if (layer.childElementCount !== count) {
    layer.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const m = document.createElement("div");
      m.style.position = "absolute";
      m.style.width = "12px";
      m.style.height = "12px";
      m.style.border = "2px solid rgba(255,0,0,0.6)";
      m.style.left = `${30 + i * 20}%`;
      m.style.top  = "50%";
      layer.appendChild(m);
    }
  }
},


statusLights({ host, params, time }) {
  if (!host) return;

  let layer = host.querySelector(".fx-status-lights");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-status-lights";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    host.appendChild(layer);
  }

  const rate = params.tickRate ?? 1;
  const t = time * 0.001 * rate;
  const on = Math.sin(t * Math.PI * 2) > 0;

  layer.style.boxShadow =
    `inset 0 0 0 2px rgba(0,255,0,${on ? 0.6 : 0.2})`;
},

  
  swirlField({ host, params, time }) {
  if (!host) return;

  const speed   = params.swirlSpeed ?? 0.8;
  const density = params.shadowDensity ?? 0.6;

  // Create swirl layer once
  let layer = host.querySelector(".fx-swirl-field");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-swirl-field";
    layer.style.position = "absolute";
    layer.style.inset = "0";
    layer.style.pointerEvents = "none";
    layer.style.mixBlendMode = "multiply";
    layer.style.filter = "blur(6px)";
    host.appendChild(layer);
  }

  const t = time * 0.001 * speed;

  // Rotational motion
  const rot = (t * 30) % 360;
  const scale = 1.05 + Math.sin(t * 1.2) * 0.03;

  layer.style.transform = `rotate(${rot}deg) scale(${scale})`;
  layer.style.opacity = Math.max(0, Math.min(1, density));

  // Curling, directional gradients (cheap swirl illusion)
  layer.style.backgroundImage = `
    conic-gradient(
      from ${rot}deg,
      rgba(0,0,0,0.35),
      rgba(0,0,0,0.15),
      rgba(0,0,0,0.35)
    )
  `;
}

};

window.PRIMITIVES = PRIMITIVES;
