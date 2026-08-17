# Animated theme GPU-cost audit — 2026-08-17

This is the repo-level audit requested by `notes/collective-directive-2026-08-17-part2.md` Part B.

Important boundary: this script can identify CSS patterns that commonly force paint/raster work, but it cannot replace a real Chrome DevTools Performance recording with GPU/Raster/Composite tracks on Michael’s actual high-resolution hardware. No CSS rework should be called performance-complete until that recording confirms the hotspot.

## Summary

- Full-viewport animated theme pseudo-element rules scanned: 112
- Rules with paint/raster-risk properties in either the rule or its keyframes: 95
- Themes with at least one flagged full-viewport animation: 53

Risk properties searched: `filter`, `backdrop-filter`, `background-position`, `background-size`, and `box-shadow`.

## Flagged themes

### grid-drift

- Line 22958: `body.theme-grid-drift .app-root::before`
  - Animations: themeGridDrift (line 23440)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### star-drift

- Line 22965: `body.theme-star-drift .app-root::before`
  - Animations: themeMilkyWaySpin (line 23455)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 22974: `body.theme-star-drift .app-root::after`
  - Animations: themeNebulaBreathe (line 23450)
  - Rule-level properties: none detected
  - Keyframe properties: filter

### water-flow

- Line 22979: `body.theme-water-flow .app-root::before`
  - Animations: themeWaterWhirlpool (line 23466)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 22988: `body.theme-water-flow .app-root::after`
  - Animations: themeWaterCaustics (line 23471)
  - Rule-level properties: background-size
  - Keyframe properties: filter

### fog-drift

- Line 22994: `body.theme-fog-drift .app-root::before, body.theme-fog-drift .app-root::after`
  - Animations: themeFogField (line 23476)
  - Rule-level properties: filter, background-position, background-size
  - Keyframe properties: filter

### fractal-shift

- Line 23008: `body.theme-fractal-shift .app-root::before`
  - Animations: themeCryoFracture (line 23486)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter

### solar-flow

- Line 23017: `body.theme-solar-flow .app-root::before`
  - Animations: themeSolarFlow (line 23491)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 23026: `body.theme-solar-flow .app-root::after`
  - Animations: themeMagmaBubble (line 23501)
  - Rule-level properties: background-size
  - Keyframe properties: filter
- Line 23215: `body.theme-solar-flow .app-root::after`
  - Animations: none detected
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### prism-turn

- Line 23033: `body.theme-prism-turn .app-root::before`
  - Animations: themePrismKaleidoscope (line 23512)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 23042: `body.theme-prism-turn .app-root::after`
  - Animations: themePrismSweep (line 23518)
  - Rule-level properties: none detected
  - Keyframe properties: filter

### lightning-strike

- Line 23046: `body.theme-lightning-strike .app-root::before`
  - Animations: themeLightningStrike (line 23523)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 23054: `body.theme-lightning-strike .app-root::after`
  - Animations: themeStormVoltage (line 23531)
  - Rule-level properties: background-size
  - Keyframe properties: filter

### wind-flow

- Line 23063: `body.theme-wind-flow .app-root::before`
  - Animations: themeWindFlow (line 23538)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter

### ink-bloom

- Line 23071: `body.theme-ink-bloom .app-root::before`
  - Animations: themeInkBloom (line 23540)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 23078: `body.theme-ink-bloom .app-root::after`
  - Animations: themeInkDrift (line 23541)
  - Rule-level properties: filter
  - Keyframe properties: filter

### sonar-pulse

- Line 23079: `body.theme-sonar-pulse .app-root::before`
  - Animations: themeSonarPulse (line 23542)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 23086: `body.theme-sonar-pulse .app-root::after`
  - Animations: themeSonarSweep (line 23543)
  - Rule-level properties: none detected
  - Keyframe properties: filter

### sound-wave

- Line 23087: `body.theme-sound-wave .app-root::before`
  - Animations: themeSoundWave (line 23544)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: background-position

### confetti-pop

- Line 23095: `body.theme-confetti-pop .app-root::before`
  - Animations: themeConfettiPop (line 23546)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter

### aurora-rift

- Line 23111: `body.theme-aurora-rift .app-root::before`
  - Animations: themeAuroraRift (line 23548)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: none detected

### neon-rain

- Line 23123: `body.theme-neon-rain .app-root::before`
  - Animations: themeNeonRain (line 23550)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 23130: `body.theme-neon-rain .app-root::after`
  - Animations: themeRainGlow (line 23555)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### ember-dragon

- Line 23137: `body.theme-ember-dragon .app-root::before`
  - Animations: themeEmberDragon (line 23560)
  - Rule-level properties: background-size
  - Keyframe properties: filter, background-position
- Line 23138: `body.theme-ember-dragon .app-root::after`
  - Animations: themeEmberSparks (line 23561)
  - Rule-level properties: none detected
  - Keyframe properties: background-position

### gravity-well

- Line 23139: `body.theme-gravity-well .app-root::before`
  - Animations: themeGravityWell (line 23562)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter

### holo-grid

- Line 23141: `body.theme-holo-grid .app-root::before`
  - Animations: themeHoloGrid (line 23564)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### toxic-sludge

- Line 23143: `body.theme-toxic-sludge .app-root::before`
  - Animations: themeToxicSludge (line 23566)
  - Rule-level properties: filter, background-size
  - Keyframe properties: filter, background-position

### eclipse-corona

- Line 23145: `body.theme-eclipse-corona .app-root::before`
  - Animations: themeEclipseCorona (line 23568)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter

### data-stream

- Line 23147: `body.theme-data-stream .app-root::before`
  - Animations: themeDataStream (line 23570)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter

### crystal-bloom

- Line 23149: `body.theme-crystal-bloom .app-root::before`
  - Animations: themeCrystalBloom (line 23572)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: filter
- Line 23150: `body.theme-crystal-bloom .app-root::after`
  - Animations: themeCrystalGlint (line 23573)
  - Rule-level properties: none detected
  - Keyframe properties: background-position

### comet-trail

- Line 23151: `body.theme-comet-trail .app-root::before`
  - Animations: themeCometTrail (line 23574)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23152: `body.theme-comet-trail .app-root::after`
  - Animations: themeCometSpark (line 23575)
  - Rule-level properties: none detected
  - Keyframe properties: background-position

### runic-circuit

- Line 23154: `body.theme-runic-circuit .app-root::before`
  - Animations: themeRunicCircuit (line 23576)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23155: `body.theme-runic-circuit .app-root::after`
  - Animations: themeRunicPulse (line 23577)
  - Rule-level properties: background-size
  - Keyframe properties: filter

### koi-current

- Line 23156: `body.theme-koi-current .app-root::before`
  - Animations: themeKoiCurrent (line 23578)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: background-position
- Line 23157: `body.theme-koi-current .app-root::after`
  - Animations: themeKoiRipples (line 23579)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### meteor-garden

- Line 23158: `body.theme-meteor-garden .app-root::before`
  - Animations: themeMeteorGarden (line 23580)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23159: `body.theme-meteor-garden .app-root::after`
  - Animations: themeMeteorSparkle (line 23581)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### arcade-scanline

- Line 23160: `body.theme-arcade-scanline .app-root::before`
  - Animations: themeArcadeScanline (line 23582)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23161: `body.theme-arcade-scanline .app-root::after`
  - Animations: themeArcadeSweep (line 23583)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### bio-lumina

- Line 23162: `body.theme-bio-lumina .app-root::before`
  - Animations: themeBioLumina (line 23584)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23163: `body.theme-bio-lumina .app-root::after`
  - Animations: themeBioBreath (line 23585)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### rift-portal

- Line 23164: `body.theme-rift-portal .app-root::before`
  - Animations: themeRiftPortal (line 23586)
  - Rule-level properties: background-position, background-size
  - Keyframe properties: none detected
- Line 23165: `body.theme-rift-portal .app-root::after`
  - Animations: themeRiftPulse (line 23587)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### desert-mirage

- Line 23166: `body.theme-desert-mirage .app-root::before`
  - Animations: themeDesertMirage (line 23588)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23167: `body.theme-desert-mirage .app-root::after`
  - Animations: themeMirageHeat (line 23589)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### glacial-comet

- Line 23168: `body.theme-glacial-comet .app-root::before`
  - Animations: themeGlacialFracture (line 23590)
  - Rule-level properties: background-size
  - Keyframe properties: filter
- Line 23169: `body.theme-glacial-comet .app-root::after`
  - Animations: themeGlacialComet (line 23591)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### bonsai-neon

- Line 23170: `body.theme-bonsai-neon .app-root::before`
  - Animations: themeBonsaiGrow (line 23592)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23171: `body.theme-bonsai-neon .app-root::after`
  - Animations: themeBonsaiPetals (line 23593)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### cyber-dragonfly

- Line 23172: `body.theme-cyber-dragonfly .app-root::before`
  - Animations: themeDragonflyWing (line 23594)
  - Rule-level properties: background-size
  - Keyframe properties: none detected
- Line 23173: `body.theme-cyber-dragonfly .app-root::after`
  - Animations: themeDragonflyTrace (line 23595)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### pulse-foundry

- Line 23174: `body.theme-pulse-foundry .app-root::before`
  - Animations: themePulseFoundry (line 23596)
  - Rule-level properties: background-size
  - Keyframe properties: filter
- Line 23175: `body.theme-pulse-foundry .app-root::after`
  - Animations: themeFoundryHeat (line 23597)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### moonlit-rain

- Line 23176: `body.theme-moonlit-rain .app-root::before`
  - Animations: themeMoonlitRain (line 23598)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23177: `body.theme-moonlit-rain .app-root::after`
  - Animations: themeMoonGlow (line 23599)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### plasma-bloom

- Line 23178: `body.theme-plasma-bloom .app-root::before`
  - Animations: themePlasmaBloom (line 23600)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23179: `body.theme-plasma-bloom .app-root::after`
  - Animations: themePlasmaVeil (line 23601)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### origami-sky

- Line 23180: `body.theme-origami-sky .app-root::before`
  - Animations: themeOrigamiFold (line 23602)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23181: `body.theme-origami-sky .app-root::after`
  - Animations: themeOrigamiGlide (line 23603)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### neon-carnival

- Line 23182: `body.theme-neon-carnival .app-root::before`
  - Animations: themeCarnivalOrbit (line 23604)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23183: `body.theme-neon-carnival .app-root::after`
  - Animations: themeCarnivalLights (line 23605)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### shadow-circuit

- Line 23184: `body.theme-shadow-circuit .app-root::before`
  - Animations: themeShadowCircuit (line 23606)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23185: `body.theme-shadow-circuit .app-root::after`
  - Animations: themeShadowNode (line 23607)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### pearl-lagoon

- Line 23186: `body.theme-pearl-lagoon .app-root::before`
  - Animations: themePearlLagoon (line 23608)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23187: `body.theme-pearl-lagoon .app-root::after`
  - Animations: themePearlShimmer (line 23609)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### volcanic-glass

- Line 23188: `body.theme-volcanic-glass .app-root::before`
  - Animations: themeVolcanicCrack (line 23610)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23189: `body.theme-volcanic-glass .app-root::after`
  - Animations: themeVolcanicGlow (line 23611)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### auric-topography

- Line 23190: `body.theme-auric-topography .app-root::before`
  - Animations: themeAuricTopography (line 23612)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23191: `body.theme-auric-topography .app-root::after`
  - Animations: themeAuricSweep (line 23613)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### synthwave-road

- Line 23192: `body.theme-synthwave-road .app-root::before`
  - Animations: themeSynthRoad (line 23614)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23193: `body.theme-synthwave-road .app-root::after`
  - Animations: themeSynthSun (line 23615)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### lunar-eclipse

- Line 23194: `body.theme-lunar-eclipse .app-root::before`
  - Animations: themeLunarEclipse (line 23616)
  - Rule-level properties: background-size
  - Keyframe properties: none detected
- Line 23195: `body.theme-lunar-eclipse .app-root::after`
  - Animations: themeLunarCorona (line 23617)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### garden-firefly

- Line 23196: `body.theme-garden-firefly .app-root::before`
  - Animations: themeGardenDrift (line 23618)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23197: `body.theme-garden-firefly .app-root::after`
  - Animations: themeFireflies (line 23619)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### quantum-static

- Line 23198: `body.theme-quantum-static .app-root::before`
  - Animations: themeQuantumStatic (line 23620)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23199: `body.theme-quantum-static .app-root::after`
  - Animations: themeQuantumTear (line 23621)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### coral-reef

- Line 23200: `body.theme-coral-reef .app-root::before`
  - Animations: themeCoralReef (line 23622)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23201: `body.theme-coral-reef .app-root::after`
  - Animations: themeCoralCurrent (line 23623)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### thunderhead

- Line 23202: `body.theme-thunderhead .app-root::before`
  - Animations: themeThunderhead (line 23624)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23203: `body.theme-thunderhead .app-root::after`
  - Animations: themeThunderFlash (line 23625)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### chrome-liquid

- Line 23204: `body.theme-chrome-liquid .app-root::before`
  - Animations: themeChromeLiquid (line 23626)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23205: `body.theme-chrome-liquid .app-root::after`
  - Animations: themeChromeTurn (line 23627)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### pixel-burst

- Line 23206: `body.theme-pixel-burst .app-root::before`
  - Animations: themePixelBurst (line 23628)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23207: `body.theme-pixel-burst .app-root::after`
  - Animations: themePixelPulse (line 23629)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### starlit-sakura

- Line 23208: `body.theme-starlit-sakura .app-root::before`
  - Animations: themeSakuraDrift (line 23630)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23209: `body.theme-starlit-sakura .app-root::after`
  - Animations: themeSakuraFall (line 23631)
  - Rule-level properties: background-size
  - Keyframe properties: background-position

### deep-sea-radar

- Line 23210: `body.theme-deep-sea-radar .app-root::before`
  - Animations: themeSeaRadar (line 23632)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23211: `body.theme-deep-sea-radar .app-root::after`
  - Animations: themeSeaDrift (line 23633)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

### radiant-snowfall

- Line 23212: `body.theme-radiant-snowfall .app-root::before`
  - Animations: themeRadiantSnowfall (line 23634)
  - Rule-level properties: background-size
  - Keyframe properties: background-position
- Line 23213: `body.theme-radiant-snowfall .app-root::after`
  - Animations: themeRadiantSnowGlow (line 23635)
  - Rule-level properties: background-size
  - Keyframe properties: none detected

## Recommended next step

Record ~10 seconds of idle with one flagged theme active, starting with `theme-fog-drift`, in Chrome DevTools Performance on the real 4K setup. If GPU/Raster/Composite time is high, rework the flagged themes so their full-screen layers animate only `transform` and `opacity` over pre-rendered/static texture layers, instead of animating `filter`, `background-position`, or `background-size` every frame.

