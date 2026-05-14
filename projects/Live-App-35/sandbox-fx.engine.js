window.__APP_STARTED__ = true;
window.__SANDBOX_FX_EMBED_MODE__ = true;
console.log("✅ app.js loaded");
window.__FX_TICK_PROBE = 0;

/* ========= MODES ========= */
const MODES = {
  INTRO: "INTRO",
  EFFECTS: "EFFECTS",
  BG: "BG",
  FRAME: "FRAME"
};

setTimeout(() => {
  const frame = document.querySelector(".frame");
  if (!frame) return console.log("NO FRAME");

  const behind = frame.querySelector(".frame-fx.behind");
  const front  = frame.querySelector(".frame-fx.front");

}, 1000);


/* ========= STATE ========= */

const FX_STATE = {
  v: 1,
  agent: null,
  frame: {
    art: {
      src: null,
      x: 0,
      y: 0,
      s: 1
    }
  },
  fx: []
};

// expose for debugging
window.FX_STATE = FX_STATE;

// ==============================
// PRESET QUERY (GLOBAL, EARLY)
// ==============================

window.getPresetsForCurrentAgent = function () {
  const all = JSON.parse(
    localStorage.getItem("val_fx_presets_v1") || "{}"
  );
  return all[FX_STATE.agent] || {};
};

// ==============================
// PRESET STORAGE (Local)
// ==============================

const PRESET_STORAGE_KEY = "val_fx_presets_v1";
const LAST_PRESET_KEY = "val_fx_last_preset_v1";

function loadLastPresetMap() {
  try {
    return JSON.parse(localStorage.getItem(LAST_PRESET_KEY)) || {};
  } catch {
    return {};
  }
}

function saveLastPresetMap(map) {
  localStorage.setItem(LAST_PRESET_KEY, JSON.stringify(map));
}

function setLastPresetForAgent(agentId, presetName) {
  if (!agentId) return;
  const map = loadLastPresetMap();
  map[agentId] = presetName || "";
  saveLastPresetMap(map);
}

function getLastPresetForAgent(agentId) {
  const map = loadLastPresetMap();
  return map[agentId] || "";
}

function loadAllPresets() {
  try {
    return JSON.parse(localStorage.getItem(PRESET_STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveAllPresets(data) {
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(data));
}


const AGENTS = [
  // Duelists
  { id: "JETT", name: "Jett", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/jett.png" },
  { id: "PHOENIX", name: "Phoenix", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/phoenix.png" },
  { id: "REYNA", name: "Reyna", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/reyna.png" },
  { id: "RAZE", name: "Raze", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/raze.png" },
  { id: "YORU", name: "Yoru", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/yoru.png" },
  { id: "NEON", name: "Neon", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/neon.png" },
  { id: "ISO", name: "Iso", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/iso.png" },

  // Controllers
  { id: "BRIMSTONE", name: "Brimstone", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/brimstone.png" },
  { id: "OMEN", name: "Omen", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/omen.png" },
  { id: "VIPER", name: "Viper", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/viper.png" },
  { id: "ASTRA", name: "Astra", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/astra.png" },
  { id: "HARBOR", name: "Harbor", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/harbor.png" },
  { id: "CLOVE", name: "Clove", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/clove.png" },

  // Initiators
  { id: "SOVA", name: "Sova", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/sova.png" },
  { id: "BREACH", name: "Breach", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/breach.png" },
  { id: "SKYE", name: "Skye", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/skye.png" },
  { id: "KAYO", name: "KAY/O", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/kayo.png" },
  { id: "FADE", name: "Fade", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/fade.png" },
  { id: "GEKKO", name: "Gekko", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/gekko.png" },
  { id: "TEJO", name: "Tejo", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/tejo.png"},
  
  // Sentinels
  { id: "SAGE", name: "Sage", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/sage.png" },
  { id: "CYPHER", name: "Cypher", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/cypher.png" },
  { id: "KILLJOY", name: "Killjoy", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/killjoy.png" },
  { id: "CHAMBER", name: "Chamber", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/chamber.png" },
  { id: "DEADLOCK", name: "Deadlock", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/deadlock.png" },
  { id: "VETO", name: "Tejo", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/veto.png"},
  { id: "VYSE", name: "Vyse", image: "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/vyse.png"},
];

const ONI_MASK_URL = "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/yoru_oni_mask.png";
const ORBITAL_ICON_URL =
  "https://raw.githubusercontent.com//michealdoolittle-cyber/images/main/icons/brim_orbital_symbol.png";
const CHAMBER_BULLET_IMG = "https://raw.githubusercontent.com/michealdoolittle-cyber/images/main/icons/bullet-impact.png";

const INTRO_PLAY_MODE = {
  INTRO: "intro",
  STATIC: "static",
  BOTH: "both",
};

/* ========= DOM ========= */
const panel = document.getElementById("panel");
const cardList = document.getElementById("cardList");
const modeBar = document.getElementById("modeBar");
const ctxAgentName = document.getElementById("ctxAgentName");
const ctxFxCount = document.getElementById("ctxFxCount");
const ctxCardCount = document.getElementById("ctxCardCount");

const frameArt = document.querySelector(".frame-art");
// 🔒 FORCE FRAME ART TO HAVE SIZE (CRITICAL)
Object.assign(frameArt.style, {
  width: "100%",
  height: "100%",
  minHeight: "320px",
  display: "block"
});

frameArt.style.pointerEvents = "none";
frameArt.style.position = "relative";
frameArt.style.overflow = "hidden";

// 🔥 NUKE LEGACY FX LAYERS (CRITICAL)
if (!window.__SANDBOX_FX_EMBED_MODE__) {
  document
    .querySelectorAll(".frame > .frame-fx")
    .forEach(n => n.remove());
}

/* ========= HELPERS ========= */
function getCardsForMode(state, mode) {
  return state.cards
    .filter(c => c.mode === mode)
    .sort((a, b) => a.order - b.order);
}

function normalizeFxId(id) {
  if (!id) return id;

  // ✅ keep dotted ids (effect.xxx / frame.xxx / intro.xxx) intact
  // ✅ only trim whitespace
  return String(id).trim();
}

function getFxEffectLayer(layer = 1) {
  const root = ensureFxLayers?.();
  if (!root) return null;
  return layer ? root.front?.querySelector(".fx-effect-layer")
               : root.behind?.querySelector(".fx-effect-layer");
}


function getFrameArtEl() {
  return (frameArt && frameArt.nodeType === 1) ? frameArt :
         (frameArt?.el && frameArt.el.nodeType === 1) ? frameArt.el :
         document.querySelector(".frame-art");
}

function applyFxNow(fx) {

  if (!fx) return;

  const def =
    FX_REGISTRY[fx.id] ||
    FX_REGISTRY["fx_effect_" + fx.id] ||
    FX_REGISTRY["fx_frame_" + fx.id];

  if (!def) return;

  // -------------------------
  // FRAME FX
  // -------------------------
  if (def.scope === "frame") {
    renderFrame();
    return;
  }

  // -------------------------
  // EFFECT FX (ONE-SHOT)
  // -------------------------
  if (def.scope === "effect") {

    const host =
      window.__FRAME_FX_HOST ||
      document.querySelector(".frame-art") ||
      document.querySelector(".frame");

    if (!host) return;

    def.apply({
      fx,
      host,
      time: performance.now() / 1000
    });
  }
}

function resolveFxDef(fxId) {
  return (
    FX_REGISTRY[fxId] ||
    FX_REGISTRY["fx_effect_" + fxId] ||
    FX_REGISTRY["fx_frame_" + fxId]
  );
}


function spawnBubble({ fx, el, now, size, rise, mixDark, opacity }) {
  const b = document.createElement("div");
  b.className = "fx-gekko-mosh-bubble";

  // ✅ choose bubble type (SEPARATED COLORS)
  const isDark = Math.random() < mixDark;
  if (isDark) b.classList.add("dark");

  // start X (bottom only)
  const x = 10 + Math.random() * 80;  // 10% → 90%
  const s = (0.55 + Math.random() * 0.95) * size;

  // height only upward
  const h = 180 + Math.random() * 200;

  // duration scaled by riseSpeed
  const dur = (1.8 + Math.random() * 1.4) / rise;

  b.style.left = `${x}%`;
  b.style.setProperty("--x", `${x}%`);
  b.style.setProperty("--s", s.toFixed(3));
  b.style.setProperty("--h", `${h.toFixed(0)}px`);
  b.style.setProperty("--dur", `${dur.toFixed(3)}s`);
  b.style.setProperty("--op", (opacity * (0.75 + Math.random() * 0.35)).toFixed(3));

  el.appendChild(b);

  // remove at end
  const kill = () => b.remove();
  b.addEventListener("animationend", kill, { once: true });

  // safety cleanup if animationend doesn't fire
  setTimeout(kill, (dur * 1000 + 200) | 0);
}



// tiny deterministic random
function rand01(n) {
  const s = Math.sin(n) * 10000;
  return s - Math.floor(s);
}

document.querySelector(".frame-fx.front")
document.querySelector(".fx-chamber-gilded")

function resolveHostEl(host) {
  // already an element
  if (host && host.nodeType === 1) return host;

  // common wrappers
  if (host?.el && host.el.nodeType === 1) return host.el;

  // fallback
  return document.querySelector(".frame") || document.querySelector(".frame-art");
}

// for FX that want behind/front + frame/effect sublayer
function getFxHost(host, layer = "front", kind = "effect") {
  const root = resolveHostEl(host);
  if (!root) return null;

  const layers = ensureFxLayers?.();
  if (!layers) return root;

  const side =
    (layer === 0 || layer === "behind") ? layers.fxBehind :
    layers.fxFront;

  if (!side) return root;

  if (kind === "frame") {
    return side.querySelector(".fx-frame-layer") || side;
  }

  // default effect
  return side.querySelector(".fx-effect-layer") || side;
}


function getLayerHost(layer = 1, kind = "effect", baseHost) {
  // baseHost optional: defaults to ensureFxLayers() handles or frame
  const layers = ensureFxLayers?.();
  const frameEl = layers?.frameEl || document.querySelector(".frame");
  if (!frameEl) return null;

  // aliases
  if (layer === "behind") layer = 0;
  if (layer === "front")  layer = 1;
  if (kind === "frame") kind = "frame";
  if (kind === "effect") kind = "effect";

  // choose front/behind container
  const side = (layer === 0) ? "Behind" : "Front";
  const sideEl =
    (layer === 0 ? layers?.fxBehind : layers?.fxFront) ||
    frameEl.querySelector(layer === 0 ? ".frame-fx.behind" : ".frame-fx.front");

  if (!sideEl) return frameEl;

  // choose frame/effect sublayer
  const sub =
    kind === "frame"
      ? sideEl.querySelector(".fx-frame-layer")
      : sideEl.querySelector(".fx-effect-layer");

  return sub || sideEl;
}

// ==========================
// HARD LAYER ROUTER
// ==========================
function routeFxToLayer(root, frameArt, layer /* 0=behind,1=front */) {
  if (!root || !frameArt) return;

  const front = frameArt.querySelector(".frame-fx.front");
  const behind = frameArt.querySelector(".frame-fx.behind");
  if (!front || !behind) return;

  const target = layer ? front : behind;

  if (root.parentElement !== target) {
    root.remove();
    target.appendChild(root);
  }

  // hard stacking
  root.style.position = "absolute";
  root.style.inset = "0";
  root.style.pointerEvents = "none";
}


function fxClassFromId(id){
  return id.replace(/^fx_/, "fx-").replace(/_/g, "-");
}

// create jagged bolt between two points
function makeBoltPath(x0, y0, x1, y1, segs = 6, jag = 5) {
  const pts = [];
  pts.push([x0, y0]);

  for (let i = 1; i < segs; i++) {
    const t = i / segs;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;

    // perpendicular offset
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.max(0.0001, Math.hypot(dx, dy));
    const px = -dy / len;
    const py = dx / len;

    const off = (Math.random() * 2 - 1) * jag;
    pts.push([x + px * off, y + py * off]);
  }

  pts.push([x1, y1]);

  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
  }
  return d;
}
function updateLeftContext() {
  const agent = AGENTS.find(a => a.id === FX_STATE.agent);
  document.getElementById("ctxAgentName").textContent =
  agent ? agent.name : "—";
  document.getElementById("ctxMode").textContent = frameState.mode;

  const active = frameState.cards.filter(c => c.enabled).length;
  const total = frameState.cards.length;

  document.getElementById("ctxActiveCount").textContent = active;
  document.getElementById("ctxTotalCount").textContent = total;
}

function exportFxPresetPretty() {
  return JSON.stringify(FX_STATE, null, 2);
}

function getFxTargetLayer(host, layer) {
  const frameRoot = host?.closest?.(".frame") || document.querySelector(".frame") || host;
  const layerNode = frameRoot?.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");
  if (!layerNode) return null;

  // Prefer the effect layer wrapper if you have it
  return layerNode.querySelector(".fx-effect-layer") || layerNode;
}

function getSideHost(host, layer = 1) {
  if (!host) return null;

  if (layer === "behind") layer = 0;
  if (layer === "front")  layer = 1;

  const behind = host.querySelector?.(".frame-fx.behind");
  const front  = host.querySelector?.(".frame-fx.front");

  if (layer === 0) return behind || host;
  return front || host;
}

function resolveFxLayerHost(host, layer) {
  const frame =
    host?.closest?.(".frame") ||
    document.querySelector(".frame");

  if (!frame) return null;

  const layerHost =
    frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind") ||
    frame.querySelector(".frame-fx.front");

  if (!layerHost) return null;

  // guarantee positioning
  layerHost.style.position = "absolute";
  layerHost.style.inset = "10px";

  return layerHost;
}

function resolveArt(host) {
  const frame =
    host?.closest?.(".frame") ||
    document.querySelector(".frame");

  return frame?.querySelector(".frame-art-inner");
}


function sampleInteriorPoint(margin = 18) {
  return {
    x: margin + Math.random() * (100 - margin * 2),
    y: margin + Math.random() * (100 - margin * 2),
  };
}

// side: "top" | "right" | "bottom" | "left"
function samplePerimeterPoint(margin = 6, avoidSide = null) {
  const sides = ["top", "right", "bottom", "left"];
  let side = sides[Math.floor(Math.random() * 4)];

  // if asked to avoid matching side (encourage “cross frame” bolts)
  if (avoidSide) {
    const opposite = {
      top: "bottom",
      bottom: "top",
      left: "right",
      right: "left"
    };
    side = opposite[avoidSide] || side;
  }

  let x = 50, y = 50;
  const t = margin + Math.random() * (100 - margin * 2);

  if (side === "top")    { x = t; y = margin; }
  if (side === "bottom") { x = t; y = 100 - margin; }
  if (side === "left")   { x = margin; y = t; }
  if (side === "right")  { x = 100 - margin; y = t; }

  return { x, y, side };
}

function saveCurrentPreset(name) {
  if (!name) return;

  const all = loadAllPresets();
  const agent = FX_STATE.agent;

  if (!agent) {
    console.warn("No agent set, cannot save preset");
    return;
  }

  if (!all[agent]) all[agent] = {};
  all[agent][name] = JSON.parse(JSON.stringify(FX_STATE));

  saveAllPresets(all);
}
const glowTrailPool = [];

function updateFrameFxOnly() {
  if (!frameArt) return;

  FX_STATE.fx.forEach(fx => {
    if (!fx || !fx.on) return;

    const raw = String(fx.id || "")
      .trim()
      .replace(/^frame\./, "")
      .replace(/^effect\./, "")
      .replace(/^fx_frame_/, "")
      .replace(/^fx_effect_/, "");

    const def =
      FX_REGISTRY[fx.id] ||
      FX_REGISTRY[raw] ||
      FX_REGISTRY["fx_frame_" + raw] ||
      FX_REGISTRY["fx_effect_" + raw];

    if (!def || def.scope !== "frame") return;

    // applyFrameFx tolerates ids; pass id explicitly
    applyFrameFx(fx.id, performance.now());
  });
}

FX_STATE.fx.forEach(fx => {
  if (!fx.on) return;
if (normalizeFxId(fx.id) === normalizeFxId("frame.fire_border")) {
  applyFireBorderFx(fx, frameArt);
}

});

  function playIntroRunIn(fx) {
	  renderFrame();
	// Hide the real frame art during run-in
    frameArt.style.opacity = "0";
    frameArt.style.transition = "opacity 0.25s ease-out";
	  
  const host = frameArt && frameArt.querySelector(".frame-fx.front");
  if (!host) return;

  const strength =
  (fx.p[1] !== undefined && fx.p[1] !== null)
    ? fx.p[1]
    : 1;

  const direction = (fx.p[0] !== undefined && fx.p[0] !== null) ? fx.p[0] : 0;

  const ghosts = 4;
  const distance = 120 * strength;

  for (let i = 0; i < ghosts; i++) {
    const ghost = document.createElement("div");
    ghost.className = "fx-runin-ghost";
ghost.style.backgroundImage = frameArt.style.backgroundImage;
ghost.style.backgroundRepeat = "no-repeat";
ghost.style.backgroundPosition = "center";
ghost.style.backgroundSize = "contain";

    // Base offsets
    let ox = 0, oy = 0;

    if (direction === 0) {
      ox = (Math.random() - 0.5) * distance * 2;
      oy = (Math.random() - 0.5) * distance * 2;
    } else {
      if (direction === 1) ox = -distance;
      if (direction === 2) ox = distance;
      if (direction === 3) oy = -distance;
      if (direction === 4) oy = distance;
    }

    ghost.style.transform = `translate(${ox}px, ${oy}px)`;
    ghost.style.opacity = 0.6;
    ghost.style.filter = "blur(6px)";

    host.appendChild(ghost);

    requestAnimationFrame(() => {
      ghost.style.transition = "transform 0.35s ease-out, opacity 0.35s ease-out";
      ghost.style.transform = "translate(0, 0)";
      ghost.style.opacity = 0;
    });

    setTimeout(() => ghost.remove(), 400);
	
	// Reveal the real frame art after run-in completes
setTimeout(() => {
  frameArt.style.opacity = "1";
}, 360);

  }
}
function spawnGlowGhost(el, dx, dy, hue, blur, opacity, pulse) {

  const ghost = el.cloneNode(true);
  ghost.style.transform = el.style.transform + ` translate(${dx}px, ${dy}px)`;

  ghost.style.animation = "none";              // stop pulse on ghost

  ghost.classList.add("glow-ghost");

  ghost.style.opacity = opacity;
ghost.style.filter = `blur(${blur}px) hue-rotate(${hue}deg)`;


  ghost.style.transition = "opacity 0.35s linear";

  el.parentElement.appendChild(ghost);

  requestAnimationFrame(() => {
    ghost.style.opacity = "0";
  });

  setTimeout(() => ghost.remove(), 400);
}
function lowFreqShake({ el, strength = 1, duration = 600 }) {
  const start = performance.now();

  function tick(t) {
    const p = Math.min((t - start) / duration, 1);
    const amp = (1 - p) * 8 * strength;

    const x = Math.sin(t * 0.004) * amp;
    const y = Math.cos(t * 0.003) * amp;

    el.style.transform = `translate(${x}px, ${y}px)`;

    if (p < 1) requestAnimationFrame(tick);
    else el.style.transform = "";
  }

  requestAnimationFrame(tick);
}

function updateGlowPulse(fx, el) {
  if (!Number.isFinite(fx._pulsePhase)) {
    fx._pulsePhase = 0;
  }

  const intensity = fx.p[0];
  const pulse = fx.p[5];
  const direction = Number(fx.p[6]);
  const mode = Number(fx.p[7]);

// Smooth velocity (momentum)
fx._velocity += (pulse - fx._velocity) * 0.12;

  if (!pulse) {
    el.style.opacity = intensity;
    el.style.filter = `
      blur(${fx.p[2]}px)
      hue-rotate(${fx.p[3]}deg)
    `;
    return;
  }

  fx._pulsePhase += 0.05 + pulse * 0.12;

  const wave = Math.sin(fx._pulsePhase);
  const mod = 1 + wave * pulse * 0.3;
  el.style.opacity = intensity * mod;

  if (mode !== 1) {
    el.style.filter = `
      blur(${fx.p[2]}px)
      hue-rotate(${fx.p[3]}deg)
    `;
    return;
  }

  // Sharp head during run
  el.style.filter = `
    blur(${fx.p[2] * 0.4}px)
    hue-rotate(${fx.p[3]}deg)
    brightness(1.1)
    contrast(1.15)
  `;

  let dx = 0;
  let dy = 0;
  const step = fx.p[1] * 8;

  if (direction === 1) dx = step;
  if (direction === 2) dx = -step;
  if (direction === 3) dy = -step;
  if (direction === 4) dy = step;

// Detect stopping (velocity collapsing)
const stopping = fx._velocity < 0.05 && pulse < 0.05;

// Small forward snap when stopping
if (stopping) {
  el.style.transform = `translate(${dx * 0.6}px, ${dy * 0.6}px)`;
} else {
  el.style.transform = "";
}

  if (wave > 0.2) {
    const frames = Math.max(
      1,
      Math.floor((fx.p[8] || 1) * (0.6 + pulse * 1.4))
    );

    const stepScale = 1 / frames;

    for (let i = 0; i < frames; i++) {
      const t = Math.pow(i * stepScale, 1.6);
      const jitter = (Math.random() - 0.5) * 2;
      
	  const speed = Math.max(0.001, fx._velocity);
      const ghostBlur = fx.p[2] * (0.8 + t * 1.6);

      spawnGlowGhost(
        el,
        dx * (1 + t * 2.2 * speed + jitter * 0.04),
        dy * (1 + t * 2.2 * speed + jitter * 0.04),
        fx.p[3] + t * 18,
        ghostBlur,
        0.45 * Math.pow(1 - t, 2.2),
        pulse
      );
	  
    }
  }
}

function applyFireBorderFx(fx, frame) {
  const layer = fx.p[5] === 1 ? "front" : "behind";
  const fxHost = frame.querySelector(".frame-fx." + layer);

  if (!fxHost) return;

  // Recreate or reuse canvas every structural pass
  let cvs = fxHost.querySelector(".fx-fire-border-canvas");
  if (!cvs) {
    cvs = document.createElement("canvas");
    cvs.className = "fx-fire-border-canvas";
    fxHost.appendChild(cvs);
  }

  // Deterministic seed (export-safe)
  if (fx._seed === undefined || fx._seed === null) { fx._seed = hashStringToSeed(String(FX_STATE.agent || "") + "|" + fx.id); }

  // Size canvas OUTSIDE the frame
  const rect = frame.closest(".frame").getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // NOTE: fixed pad — not slider-driven
  const pad = 48;

  const w = Math.max(1, rect.width + pad * 2);
  const h = Math.max(1, rect.height + pad * 2);

  cvs.style.left = -pad + "px";
  cvs.style.top = -pad + "px";
  cvs.style.width = w + "px";
  cvs.style.height = h + "px";

  cvs.width = Math.round(w * dpr);
  cvs.height = Math.round(h * dpr);

  // Cache for tick loop
  fx._padPx = pad * dpr;
}

function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function clamp01(v) { return Math.max(0, Math.min(1, Number(v ?? 0))); }

function ensureFxLayers(frameEl) {

  // ✅ Accept either: a .frame root OR a .frame-art
  let root = (frameEl && frameEl.nodeType === 1) ? frameEl : null;
  if (!root) root = document.querySelector(".frame");
  if (!root) return null;

  // ✅ Resolve the correct frame-art (scoped, never global "first .frame-art")
  const frameArt =
    root.classList && root.classList.contains("frame-art")
      ? root
      : root.querySelector(".frame-art");

  if (!frameArt) return null;

  // 🔒 containment lives here
  frameArt.style.position = frameArt.style.position || "relative";
  frameArt.style.overflow = "hidden";

  // ==========================
  // TOP LEVEL FX LAYERS (direct children of frameArt)
  // ==========================
  let fxBehind = frameArt.querySelector(":scope > .frame-fx.behind");
  let fxFront  = frameArt.querySelector(":scope > .frame-fx.front");

  if (!fxBehind) {
    fxBehind = document.createElement("div");
    fxBehind.className = "frame-fx behind";
    frameArt.appendChild(fxBehind);
  }

  if (!fxFront) {
    fxFront = document.createElement("div");
    fxFront.className = "frame-fx front";
    frameArt.appendChild(fxFront);
  }

  [fxBehind, fxFront].forEach(el => {
    Object.assign(el.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none"
    });
  });

  // ==========================
  // SUBLAYERS (frame vs effect)
  // ==========================
  const ensureSubLayer = (parent, cls) => {
    let n = parent.querySelector(":scope > ." + cls);
    if (!n) {
      n = document.createElement("div");
      n.className = cls;
      parent.appendChild(n);
    }
    Object.assign(n.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none"
    });
    return n;
  };

  const behindFrame  = ensureSubLayer(fxBehind, "fx-frame-layer");
  const behindEffect = ensureSubLayer(fxBehind, "fx-effect-layer");
  const frontFrame   = ensureSubLayer(fxFront,  "fx-frame-layer");
  const frontEffect  = ensureSubLayer(fxFront,  "fx-effect-layer");

  return {
    // ✅ keep both, so older + newer FX code works
    frameEl: root,
    frameArt,

    behind: fxBehind,
    front: fxFront,

    behindFrame,
    behindEffect,
    frontFrame,
    frontEffect
  };
}


function hashStringToSeed(str) {
  // FNV-1a-ish small hash -> uint32
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rand01(seed) {
  // xorshift32 -> [0,1)
  let x = seed >>> 0;
  x ^= x << 13; x >>>= 0;
  x ^= x >> 17; x >>>= 0;
  x ^= x << 5;  x >>>= 0;
  return (x >>> 0) / 4294967296;
}

function noise2D(x, y, seed) {
  // Value noise with hash at integer lattice + smooth interp
  const xi = Math.floor(x), yi = Math.floor(y);
  const xf = x - xi, yf = y - yi;

  const h00 = hash2(xi, yi, seed);
  const h10 = hash2(xi + 1, yi, seed);
  const h01 = hash2(xi, yi + 1, seed);
  const h11 = hash2(xi + 1, yi + 1, seed);

  const u = smoothstep01(xf);
  const v = smoothstep01(yf);

  const a = lerp(h00, h10, u);
  const b = lerp(h01, h11, u);
  return lerp(a, b, v);
}

function fbm(x, y, seed) {
  // 3-octave FBM
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 3; i++) {
    sum += amp * noise2D(x * freq, y * freq, seed + i * 1013);
    freq *= 2;
    amp *= 0.5;
  }
  return sum; // ~0..1-ish
}

function hash2(x, y, seed) {
  // stable pseudo-random per cell -> [0,1)
  let h = seed ^ (x * 374761393) ^ (y * 668265263);
  h = (h ^ (h >> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  h = (h ^ (h >> 16)) >>> 0;
  return (h >>> 0) / 4294967296;
}

function smoothstep01(t) {
  t = Math.max(0, Math.min(1, t));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t){ return a + (b - a) * t; }

function sdfRoundedRect(px, py, cx, cy, hw, hh, r) {
  // Signed distance to rounded rectangle centered at (cx,cy)
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  const outside = Math.hypot(ax, ay) - r;
  const inside = Math.min(Math.max(qx, qy), 0);
  return outside + inside;
}

function hueRotateRGB(r, g, b, deg) {
  // Simple hue rotation via YIQ matrix
  const rad = deg * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const yiq = {
    y: 0.299*r + 0.587*g + 0.114*b,
    i: 0.596*r - 0.275*g - 0.321*b,
    q: 0.212*r - 0.523*g + 0.311*b
  };

  const i = yiq.i * cosA - yiq.q * sinA;
  const q = yiq.i * sinA + yiq.q * cosA;

  const rr = yiq.y + 0.956*i + 0.621*q;
  const gg = yiq.y - 0.272*i - 0.647*q;
  const bb = yiq.y - 1.106*i + 1.703*q;

  return [
    Math.max(0, Math.min(255, rr)),
    Math.max(0, Math.min(255, gg)),
    Math.max(0, Math.min(255, bb))
  ];
}

function renderFireBorderCanvas(opts) {
  const _ctx = opts._ctx;
  const bw = opts.bw;
  const bh = opts.bh;
  _ctx.clearRect(0, 0, bw, bh);
  const pad = opts.pad;
  const seed = opts.seed;
  const t = opts.t;
  const thicknessPx = opts.thicknessPx;
  const turbulence = opts.turbulence;
  const speed = opts.speed;
  const intensity = opts.intensity;
  const hueDeg = opts.hueDeg;

  if (!_ctx || !bw || !bh) return;

  const inset = 10;
  const r = 14;
  
const w = bw;
const h = bh;

  // center on the FRAME inside the padded canvas
const cx = pad + (w - pad * 2) * 0.5;
const cy = pad + (h - pad * 2) * 0.5;
const hw = (w - pad * 2) * 0.5 - inset;
const hh = (h - pad * 2) * 0.5 - inset;

  const img = _ctx.createImageData(bw, bh);
  const data = img.data;

  const baseFreq = lerp(0.012, 0.028, turbulence);
  const advectY = 0.9 + turbulence * 1.6;
  const advectX = 0.15 + turbulence * 0.35;

  const flicker =
    0.82 + 0.18 * Math.sin(t * (7 + speed * 3) + seed * 0.0001);

     let p = 0;
     for (let y = 0; y < bh; y++) {
     for (let x = 0; x < bw; x++, p += 4) {
      const dx = Math.abs(x - cx) - hw;
      const dy = Math.abs(y - cy) - hh;
      const d = sdfRoundedRect(x, y, cx, cy, hw, hh, r);
      const edgeDist = Math.max(0, d); // only outside the frame



      if (edgeDist <= 0 || edgeDist > thicknessPx) {
  data[p + 3] = 0;
  continue;
}

      let flowX = 0;
      let flowY = 0;
	  
	  let edge = "top";

     const ax = Math.abs(x - cx) - hw;
     const ay = Math.abs(y - cy) - hh;

     
     if (ax > ay) {
     edge = (x < cx) ? "left" : "right";
    } else {
      edge = (y < cy) ? "top" : "bottom";
    }


	  if (edge === "top") {
      flowY = -1;
      } else if (edge === "bottom") {
      flowY = 1;
      } else if (edge === "left") {
      flowX = 1;
      } else if (edge === "right") {
      flowX = -1;
      }


      const nx = x * baseFreq + flowX * t * speed * 12 + seed * 0.001;
      const ny = y * baseFreq + flowY * t * speed * 12 + seed * 0.002;



      const n = fbm(nx, ny, seed);

      const tongue = Math.floor(n * 6) / 6;
      const distort = tongue * thicknessPx * 1.4;


      const front = d + distort;
      const burn = smoothstep01(1 - front / (thicknessPx * 1.15));
	  const heat = Math.max(0, Math.min(1, burn));
      const [rr, gg, bb] = hueRotateRGB(
        255,
        Math.round(120 + heat * 100),
        Math.round(40 * (1 - heat)),
        hueDeg
     );

      let a = intensity * flicker * burn;
      a *= 1 - smoothstep01(d / (thicknessPx * 1.9));

      data[p]   = rr;
      data[p+1] = gg;
      data[p+2] = bb;

      data[p + 3] = Math.round(255 * clamp01(a));
    }
  }

  _ctx.putImageData(img, 0, 0);
}

function clamp01(v) {
  v = Number(v);
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}


/* ========= FRAME RENDER ========= */
function renderFrame() {
  if (!frameArt) return;
ensureFxLayers();

  // ✅ FX layers are siblings of .frame-art under .frame
  const frameEl = frameArt.closest(".frame") || document.querySelector(".frame");
  if (!frameEl) return;

  // ==========================
  // FRAME FX LAYERS (INIT)
  // ==========================
  let fxBehind = frameEl.querySelector(".frame-fx.behind");
  let fxFront  = frameEl.querySelector(".frame-fx.front");

  // Behind layer must be BEFORE art
  if (!fxBehind) {
    fxBehind = document.createElement("div");
    fxBehind.className = "frame-fx behind";
    fxBehind.id = "agentFxBehind";
    frameEl.insertBefore(fxBehind, frameArt);
  }

  // Front layer must be AFTER art
  if (!fxFront) {
    fxFront = document.createElement("div");
    fxFront.className = "frame-fx front";
    fxFront.id = "agentFxFront";
    frameEl.appendChild(fxFront);
  }

  // ==========================
  // SUBLAYERS (FRAME vs EFFECT)
  // - frame layer: cleared every render
  // - effect layer: persistent (do NOT clear)
  // ==========================
  function ensureLayer(parent, cls) {
    let node = parent.querySelector("." + cls);
    if (!node) {
      node = document.createElement("div");
      node.className = cls;
      parent.appendChild(node);
    }
    return node;
  }

  const behindFrame  = ensureLayer(fxBehind, "fx-frame-layer");
  const behindEffect = ensureLayer(fxBehind, "fx-effect-layer");
  const frontFrame   = ensureLayer(fxFront,  "fx-frame-layer");
  const frontEffect  = ensureLayer(fxFront,  "fx-effect-layer");

  // ✅ Clear ONLY frame FX (never clear effect FX)
  behindFrame.innerHTML = "";
  frontFrame.innerHTML  = "";

  // ==========================
  // FRAME TRANSFORM ONLY (ART ONLY)
  // ==========================
  const art = FX_STATE.frame.art || { x: 0, y: 0, s: 1 };
  frameArt.style.transform = `translate(${art.x}px, ${art.y}px) scale(${art.s})`;

  // ==========================
  // APPLY FRAME FX (frame scope only)
  // ==========================
  FX_STATE.fx.forEach(fx => {
    if (!fx.on) return;

    const def = FX_REGISTRY[fx.id];
    if (!def || def.scope !== "frame") return;

    applyFrameFx(fx);
  });
}


/* ========= FRAME CONTROL RENDERERS ========= */
function renderFrameControls(card, controls) {
  if (card.subtype !== "art") return;

  controls.innerHTML = `
    <div class="control-row">
      <label>Scale</label>
      <input type="range" min="0.7" max="1.2" step="0.01"
             value="${FX_STATE.frame.art.s}">
    </div>
    <div class="control-row">
      <label>X</label>
      <input type="range" min="-80" max="80" step="1"
             value="${FX_STATE.frame.art.x}">
    </div>
    <div class="control-row">
      <label>Y</label>
      <input type="range" min="-80" max="80" step="1"
             value="${FX_STATE.frame.art.y}">
    </div>
  `;

  const [scaleInput, xInput, yInput] =
    controls.querySelectorAll("input");

  scaleInput.addEventListener("input", e => {
    FX_STATE.frame.art.s = parseFloat(e.target.value);
    renderFrame();
  });

  xInput.addEventListener("input", e => {
    FX_STATE.frame.art.x = parseInt(e.target.value, 10);
    renderFrame();
  });

  yInput.addEventListener("input", e => {
    FX_STATE.frame.art.y = parseInt(e.target.value, 10);
    renderFrame();
  });
}
/* ========= FX TRIGGER (GLOBAL) ========= */
function triggerFxNow(fxId) {
  const fx = ensureFx(fxId);
  if (!fx) return;

const def = resolveFxDef(fxId);
if (!def) return;


  // Intro Run-In (one-shot, localized)
if (fxId === "intro.runin") {
  console.log("RUN-IN CALLED");
  playIntroRunIn(fx);
  return;
}


  // Frame-localized FX + intro.flash
  if (def.scope === "frame" || fxId === "intro.flash") {
    const wasOn = fx.on;
    fx.on = 1;
    renderFrame();
    applyFxPreview(true);
    fx.on = wasOn;
    return;
  }

  // Scene FX ONLY
  applyFxPreview(true);
}
function playIntroSequence(mode = INTRO_PLAY_MODE.INTRO) {
  console.log("INTRO SEQUENCE", mode);
  renderFrame();

  const introCards = frameState.cards
    .filter(c => c.type === "fx" && c.fxId.startsWith("intro.") && c.enabled)
    .sort((a, b) => a.order - b.order);
console.group("INTRO DEBUG");

console.log(
  "All cards:",
  frameState.cards.map(c => ({
    id: c.id,
    fxId: c.fxId,
    type: c.type,
    enabled: c.enabled
  }))
);

console.log(
  "Filtered intro cards:",
  frameState.cards.filter(
    c => c.type === "fx" && c.fxId && c.fxId.startsWith("intro.")
  )
);

console.log(
  "Enabled intro cards:",
  frameState.cards.filter(
    c => c.type === "fx" && c.fxId && c.fxId.startsWith("intro.") && c.enabled
  )
);

console.groupEnd();

if (!introCards.length) {
  console.warn("No Intro FX enabled");
  return;
}

  let delay = 0;

  introCards.forEach(card => {
    const fxId = card.fxId;
    const fx = ensureFx(fxId);
    if (!fx) return;

    if (fxId === "intro.runin") {
      setTimeout(() => playIntroRunIn(fx), delay);
      delay += 400;
    } else if (fxId === "intro.flash") {
      setTimeout(() => triggerFxNow("intro.flash"), delay);
      delay += 250;
    }
  });

  if (mode === INTRO_PLAY_MODE.BOTH) {
  const hasStaticFx = frameState.cards.some(
    c =>
      c.type === "fx" &&
      !c.fxId.startsWith("intro.") &&
      c.enabled
  );

  if (hasStaticFx) {
    setTimeout(() => applyFxPreview(true), delay + 50);
  }
}

  if (mode === INTRO_PLAY_MODE.STATIC) {
  const hasStaticFx = frameState.cards.some(
    c =>
      c.type === "fx" &&
      !c.fxId.startsWith("intro.") &&
      c.enabled
  );

  if (!hasStaticFx) {
    console.warn("No static FX enabled");
    return;
  }
const mo = new MutationObserver(muts => {
  muts.forEach(m => {
    m.removedNodes.forEach(n => {
      if (n.classList?.contains("fx-jett-wind-shear")) {
        console.warn("[WS DOM REMOVED]", m);
      }
    });
  });
});

mo.observe(document.body, { childList: true, subtree: true });

  applyFxPreview(true);
}
}

// ✅ EXPOSE IT HERE (TOP-LEVEL)
window.playIntroSequence = playIntroSequence;
function resolveFxDef(fxId) {
  return (
    FX_REGISTRY[fxId] ||
    FX_REGISTRY["fx_frame_" + fxId] ||
    FX_REGISTRY["fx_effect_" + fxId]
  );
}


/* ========= FX CONTROL RENDERERS ========= */
function renderFxControls(card, controls) {

  const rawId = String(card.fxId || "")
    .trim()
    .replace(/^frame\./, "")
    .replace(/^effect\./, "");

  if (!rawId) return;

  const def =
    FX_REGISTRY[rawId] ||
    FX_REGISTRY["fx_frame_" + rawId] ||
    FX_REGISTRY["fx_effect_" + rawId] ||
    (rawId.startsWith("fx_frame_") && FX_REGISTRY[rawId.replace(/^fx_frame_/, "fx_effect_")]) ||
    (rawId.startsWith("fx_effect_") && FX_REGISTRY[rawId.replace(/^fx_effect_/, "fx_frame_")]);

  if (!def) {
    console.warn("[renderFxControls] Missing def for:", rawId);
    return;
  }

  const fx = ensureFx(rawId);
  if (!fx) {
    console.warn("[renderFxControls] Missing fx state for:", rawId);
    return;
  }

  controls.innerHTML = "";

  fx.p = Array.isArray(fx.p) ? fx.p : [];

  if (Array.isArray(def.defaults)) {
    for (let i = 0; i < def.defaults.length; i++) {
      if (fx.p[i] == null && def.defaults[i] != null)
        fx.p[i] = def.defaults[i];
    }
  }

  def.params.forEach((key, i) => {

    const row = document.createElement("div");
    row.className = "control-row";

    const label = document.createElement("label");
    label.textContent = key;

    let input;
    const kl = String(key).toLowerCase();

    // ==========================
    // LAYER
    // ==========================
    if (key === "layer") {
      input = document.createElement("select");
      [["0","Behind"],["1","Front"]].forEach(([v,t]) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = t;
        input.appendChild(opt);
      });
      input.value = String(fx.p[i] ?? 1);
    }

    // ==========================
    // COLOR
    // ==========================
    else if (kl.includes("color")) {
      input = document.createElement("input");
      input.type = "color";
      input.value = fx.p[i] || "#ffffff";
    }

    // ==========================
    // X / Y POSITION (FIXED)
    // ==========================
    else if (key === "x" || key === "y") {
      input = document.createElement("input");
      input.type = "range";
      input.min = -300;
      input.max = 300;
      input.step = 1;
      input.value = String(fx.p[i] ?? 0);
    }

    // ==========================
    // ANGLES
    // ==========================
    else if (kl.endsWith("deg")) {
      input = document.createElement("input");
      input.type = "range";
      input.min = 0;
      input.max = 360;
      input.step = 1;
      input.value = String(fx.p[i] ?? 0);
    }

    // ==========================
    // COUNT-LIKE
    // ==========================
    else if (
      key === "count" || key === "rings" || key === "streaks" || key === "shards" ||
      kl.includes("count") || kl.includes("segments")
    ) {
      input = document.createElement("input");
      input.type = "range";
      input.min = 1;
      input.max = 24;
      input.step = 1;
      input.value = String(fx.p[i] ?? def.defaults?.[i] ?? 6);
    }
// ==========================
// THICKNESS
// ==========================
else if (key === "thickness") {
  input = document.createElement("input");
  input.type = "range";
  input.min = 0;
  input.max = 120;
  input.step = 0.5;
  input.value = String(fx.p[i] ?? def.defaults?.[i] ?? 40);
}
    // ==========================
    // DEFAULT FLOAT
    // ==========================
    else {
      input = document.createElement("input");
      input.type = "range";
      input.min = 0;
      input.max = 2;
      input.step = 0.01;
      input.value = String(fx.p[i] ?? def.defaults?.[i] ?? 0);
    }

    input.addEventListener("input", (e) => {

      let value;

      if (input.type === "color") {
        value = e.target.value;
      } else if (input.tagName === "SELECT") {
        value = parseInt(e.target.value, 10);
      } else {
        value = parseFloat(e.target.value);
      }

      if (Number.isNaN(value)) value = def.defaults?.[i] ?? 0;

      fx.p[i] = value;

      if (typeof setFxParam === "function")
        setFxParam(card.fxId, i, value);

      if (def.scope === "effect")
        fx._nextFireTime = 0;

      if (fx.on && typeof applyFxNow === "function")
        applyFxNow(fx);

      if (def.scope === "frame" && typeof updateFrameFxOnly === "function")
        updateFrameFxOnly();
    });

    row.appendChild(label);
    row.appendChild(input);
    controls.appendChild(row);
  });
}



/* ========= CARD RENDER ========= */
function renderCards() {

  panel.dataset.mode = frameState.mode;
  cardList.innerHTML = "";

  const cards = getCardsForMode(frameState, frameState.mode);

  if (!cards.length) {
    cardList.innerHTML = "<em>No cards in this mode</em>";
    return;
  }

  cards.forEach(card => {

    const row = document.createElement("div");
    row.className = "card";
    if (!card.enabled) row.classList.add("disabled");
    if (card.expanded) row.classList.add("expanded");
	
	// ==========================
// CARD EXPAND / COLLAPSE
// ==========================
row.addEventListener("click", () => {
  card.expanded = !card.expanded;
  renderCards();
});

    // ==========================
    // LEFT (title + description)
    // ==========================
    const left = document.createElement("div");
    left.className = "card-left";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = card.label;

    const sub = document.createElement("div");
    sub.className = "card-sub";
    sub.textContent = card.description;

    left.appendChild(title);
    left.appendChild(sub);

// ==========================
// FRAME TOGGLE
// ==========================
if (card.type === "frame") {

  const toggle = document.createElement("button");
  toggle.className = "card-toggle";
  toggle.textContent = card.enabled ? "ON" : "OFF";

  toggle.addEventListener("click", e => {
    e.stopPropagation();

    card.enabled = !card.enabled;
    toggle.textContent = card.enabled ? "ON" : "OFF";
    row.classList.toggle("disabled", !card.enabled);

    renderFrame();
  });

  row.appendChild(toggle);
}
// ==========================
// FX TOGGLE (LOCKED & SAFE)
// ==========================
if (card.type === "fx") {

  const toggle = document.createElement("button");
  toggle.className = "card-toggle";

  const fx = ensureFx(card.fxId);
  card.enabled = !!fx?.on;

  toggle.textContent = card.enabled ? "ON" : "OFF";
  row.classList.toggle("disabled", !card.enabled);

  toggle.addEventListener("click", e => {
    e.stopPropagation();

    const fx = ensureFx(card.fxId);
    if (!fx) return;

    // flip UI state
    card.enabled = !card.enabled;

// 🔒 HARD SYNC ENGINE STATE
fx.on = card.enabled ? 1 : 0;
fx._wasOn = card.enabled ? 0 : 1;
fx._nextFireTime = 0;

toggle.textContent = card.enabled ? "ON" : "OFF";
row.classList.toggle("disabled", !card.enabled);

// ✅ Scope-aware execution
const def =
  FX_REGISTRY[fx.id] ||
  FX_REGISTRY["fx_frame_" + fx.id] ||
  FX_REGISTRY["fx_effect_" + fx.id];

if (def?.scope === "frame") {
  renderFrame();
}
else if (def?.scope === "effect") {
  if (fx.on) applyFxNow(fx);
}
  });

  row.appendChild(toggle);
}


// ==========================
// CONTROLS
// ==========================
const controls = document.createElement("div");
controls.className = "card-controls";

if (card.expanded) {
  if (card.type === "frame") renderFrameControls(card, controls);
  if (card.type === "fx") renderFxControls(card, controls);
}

controls.addEventListener("click", e => e.stopPropagation());

// ==========================
// FINAL ASSEMBLY
// ==========================
row.appendChild(left);
row.appendChild(controls);
cardList.appendChild(row);


  }); // ✅ closes cards.forEach

} // ✅ closes renderCards


/* ========= AGENT PICKER (HARD PROBE) ========= */
function renderAgentPicker() {
  const picker = document.querySelector(".agent-picker");
  if (!picker) {
    console.error("❌ agent-picker not found");
    return;
  }

  picker.innerHTML = "";

  AGENTS.forEach(agent => {
    const btn = document.createElement("button");
    btn.className = "agent-btn";
    btn.textContent = agent.name;

    btn.addEventListener("click", () => {
      selectAgent(agent.id);
    });

    picker.appendChild(btn);
  });
}

/* ========= MODE SWITCH ========= */
modeBar.addEventListener("click", e => {
  const btn = e.target.closest("button[data-mode]");
  if (!btn) return;

  frameState.mode = btn.dataset.mode;

  Array.from(modeBar.querySelectorAll("button")).forEach(b =>
    b.classList.toggle("active", b === btn)
  );

  if (typeof updateLeftContext === "function") updateLeftContext();
  renderCards();

});


function ensureFxLayers() {
  // ✅ scope everything to the MAIN preview frame (not agent cards)
  const frameEl = document.querySelector(".frame");
  if (!frameEl) return null;

  // ✅ find the frame-art INSIDE this frame (never global)
  const frameArtEl = frameEl.querySelector(".frame-art");
  if (!frameArtEl) return null;

  // 🔒 containment must live on the FRAME (since layers are siblings of art)
  frameEl.style.position = frameEl.style.position || "relative";
  frameEl.style.overflow = "hidden";

  let fxBehind = frameEl.querySelector(":scope > .frame-fx.behind");
  let fxFront  = frameEl.querySelector(":scope > .frame-fx.front");

  // Behind layer must be BEFORE art
  if (!fxBehind) {
    fxBehind = document.createElement("div");
    fxBehind.className = "frame-fx behind";
    fxBehind.id = "agentFxBehind";
    frameEl.insertBefore(fxBehind, frameArtEl);
  }

  // Front layer must be AFTER art
  if (!fxFront) {
    fxFront = document.createElement("div");
    fxFront.className = "frame-fx front";
    fxFront.id = "agentFxFront";
    frameEl.appendChild(fxFront);
  }

  // 🔒 hard positioning
  [fxBehind, fxFront].forEach(n => {
    Object.assign(n.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none"
    });
  });

  const mk = (parent, cls) => {
    let n = parent.querySelector(":scope > ." + cls);
    if (!n) {
      n = document.createElement("div");
      n.className = cls;
      parent.appendChild(n);
    }
    Object.assign(n.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none"
    });
    return n;
  };

  const behindFrame  = mk(fxBehind, "fx-frame-layer");
  const behindEffect = mk(fxBehind, "fx-effect-layer");
  const frontFrame   = mk(fxFront,  "fx-frame-layer");
  const frontEffect  = mk(fxFront,  "fx-effect-layer");

  return {
    frameEl,
    frameArtEl,

    // legacy
    fxBehind,
    fxFront,

    // canonical
    behind: fxBehind,
    front:  fxFront,

    behindFrame,
    behindEffect,
    frontFrame,
    frontEffect
  };
}

function spawnIsoOrb(ctx, fx, host) {

const layers = ensureFxLayers?.();
const layerSide = (fx.p?.[3] ?? 1) ? 1 : 0;

const target =
  layerSide
    ? (layers?.frontEffect || host)
    : (layers?.behindEffect || host);


if (!target) return;
target.style.overflow = "visible";



  const hold     = Math.max(0.25, Math.min(2.0, fx.p?.[1] ?? 0.65));
  const shardsN  = Math.max(10, Math.min(60, Math.round(fx.p?.[2] ?? 18)));
  const layer    = (fx.p?.[3] ?? 1) ? 1 : 0;

  // allow particles to escape
  host.style.overflow = "visible";

  // --------------------------
  // ORB
  // --------------------------
  const px = 12 + Math.random() * 76;
  const py = 12 + Math.random() * 76;

  const orb = document.createElement("div");
  orb.className = "fx-iso-orb";

  Object.assign(orb.style, {
    position: "absolute",
    left: `${px}%`,
    top:  `${py}%`,
    width: "56px",
    height:"56px",
    borderRadius: "50%",
    pointerEvents: "none",
    transform: "translate(-50%,-50%) scale(0.9)",
    overflow: "visible"
  });

  target.appendChild(orb);


  // appear
orb.animate(
  [
    { opacity: 0, transform: "translate(-50%,-50%) scale(0.75)" },
    { opacity: 1, transform: "translate(-50%,-50%) scale(1)" }
  ],
  { duration: 200, easing: "ease-out", fill: "forwards" }
);

  // spin
orb.animate(
  [
    { transform: "translate(-50%,-50%) scale(1) rotate(0deg)" },
    { transform: "translate(-50%,-50%) scale(1) rotate(360deg)" }
  ],
  {
    duration: 1200,
    iterations: Infinity,
    easing: "linear"
  }
);

  // --------------------------
  // SHATTER
  // --------------------------
  setTimeout(() => {

    const orbRect  = orb.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();

    const ox = orbRect.left - hostRect.left + orbRect.width  / 2;
    const oy = orbRect.top  - hostRect.top  + orbRect.height / 2;

    for (let i = 0; i < shardsN; i++) {

      const a  = Math.PI * 2 * (i / shardsN);
      const r  = 70 + Math.random() * 120;
      const dx = Math.cos(a) * r;
      const dy = Math.sin(a) * r;
	  const rot = Math.random() * 240 - 120;

const shard = document.createElement("div");
shard.className = "fx-iso-shard";

Object.assign(shard.style, {
  position: "absolute",
  left: `${ox}px`,
  top: `${oy}px`,
  width: "12px",
  height: "7px",
  opacity: "0.95",
  pointerEvents: "none",
  zIndex: "5",
  rotate: `${rot}deg`,

  borderRadius: "2px",

  background: `
    linear-gradient(135deg,
      rgba(245,235,255,0.9),
      rgba(170,70,255,0.7) 52%,
      rgba(90,10,200,0.35))
  `,

  boxShadow: "0 0 10px rgba(170,70,255,0.45)",

  clipPath: "polygon(50% 0%, 100% 35%, 75% 100%, 0% 65%)"

});


target.appendChild(shard);

shard.animate(
  [
    { translate: "0px 0px" },
    { translate: `${dx}px ${dy}px` }
  ],
  { duration: 1000, easing: "linear", fill: "forwards" }
);

      host.appendChild(shard);

      shard.animate(
        [
          { opacity: 1, transform: "translate(-50%,-50%) scale(1)" },
          { opacity: 1, transform: `translate(${dx * 0.35}px, ${dy * 0.35}px) scale(1)` },
          { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(0.9)` }
        ],
        { duration: 750, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" }
      );

      setTimeout(() => shard.remove(), 900);
    }

    orb.remove();

  }, hold * 1000);
}


function resolveFxDef(fxId) {
  const id = String(fxId || "").trim();
  if (!id) return null;

  // direct match
  if (FX_REGISTRY[id]) return FX_REGISTRY[id];

  // if user passed short id like "jett_wind_shear"
  if (FX_REGISTRY["fx_frame_" + id]) return FX_REGISTRY["fx_frame_" + id];
  if (FX_REGISTRY["fx_effect_" + id]) return FX_REGISTRY["fx_effect_" + id];

  // if user passed prefixed id but registry expects other prefix
  // (rare but helps when cards mismatch)
  if (id.startsWith("fx_frame_")) {
    const shortId = id.replace(/^fx_frame_/, "");
    if (FX_REGISTRY[shortId]) return FX_REGISTRY[shortId];
    if (FX_REGISTRY["fx_effect_" + shortId]) return FX_REGISTRY["fx_effect_" + shortId];
  }

  if (id.startsWith("fx_effect_")) {
    const shortId = id.replace(/^fx_effect_/, "");
    if (FX_REGISTRY[shortId]) return FX_REGISTRY[shortId];
    if (FX_REGISTRY["fx_frame_" + shortId]) return FX_REGISTRY["fx_frame_" + shortId];
  }

  return null;
}

// ==========================
// FX ID NORMALIZER (DROP-IN)
// ==========================
function normalizeFxId(id) {
  if (!id) return id;

  // tolerate fx object passed accidentally
  if (typeof id === "object" && id.id) id = id.id;

  id = String(id).trim();

  // common prefixes from older cards
  if (id.startsWith("effect.")) id = id.slice("effect.".length);
  if (id.startsWith("frame."))  id = id.slice("frame.".length);

  // if already canonical
  if (id.startsWith("fx_effect_") || id.startsWith("fx_frame_")) return id;

  // if registry contains exact id, keep it
  if (FX_REGISTRY && FX_REGISTRY[id]) return id;

  // prefer effect if available, else frame
  if (FX_REGISTRY && FX_REGISTRY["fx_effect_" + id]) return "fx_effect_" + id;
  if (FX_REGISTRY && FX_REGISTRY["fx_frame_" + id])  return "fx_frame_" + id;

  // fallback: return as-is
  return id;
}

// ==========================
// ensureFx (DROP-IN REPLACE)
// ==========================
function ensureFx(id) {

  const reqId = (id && typeof id === "object" && id.id) ? id.id : id;
  if (!reqId) return null;

  const canon = normalizeFxId(reqId);

  // alias map
  FX_STATE._alias = FX_STATE._alias || Object.create(null);

  const mapped = FX_STATE._alias[String(reqId)];
  const finalId = mapped || canon;

  // --------------------------
  // FIND EXISTING
  // --------------------------
  let fx = FX_STATE.fx.find(f => f.id === finalId);

  if (!fx && finalId !== canon) {
    fx = FX_STATE.fx.find(f => f.id === canon);
  }

  // --------------------------
  // CREATE IF MISSING
  // --------------------------
  if (!fx) {
    fx = {
      id: finalId,
      on: 0,
      p: [],
      _wasOn: 0,
      _nextFireTime: 0
    };
    FX_STATE.fx.push(fx);
  }

  // --------------------------
  // GUARANTEE SAFE STRUCTURE
  // --------------------------
  fx.on = (typeof fx.on === "number") ? fx.on : 0;
  fx.p  = Array.isArray(fx.p) ? fx.p : [];

  // --------------------------
  // LOAD DEFAULT PARAMS ONCE
  // --------------------------
  const def =
    (FX_REGISTRY && FX_REGISTRY[fx.id]) ||
    (FX_REGISTRY && FX_REGISTRY["fx_effect_" + fx.id]) ||
    (FX_REGISTRY && FX_REGISTRY["fx_frame_" + fx.id]);

if (def && Array.isArray(def.defaults)) {
  if (!Array.isArray(fx.p) || fx.p.length !== def.defaults.length) {
    fx.p = def.defaults.slice();
  }
}

  // --------------------------
  // ALIAS NORMALIZATION
  // --------------------------
  FX_STATE._alias[String(reqId)] = fx.id;

  const raw = String(reqId)
    .replace(/^effect\./, "")
    .replace(/^frame\./, "");

  FX_STATE._alias["fx_effect_" + raw] = fx.id;
  FX_STATE._alias["fx_frame_"  + raw] = fx.id;
  FX_STATE._alias["effect." + raw] = fx.id;
  FX_STATE._alias["frame."  + raw] = fx.id;

  return fx;
}


function setFxEnabled(id, enabled) {
  const fx = ensureFx(id);
  if (!fx) return;

  fx.on = enabled ? 1 : 0;

  // ✅ Apply immediately on toggle so FX actually appears
  if (fx.on) {
    // allow one-shot effects to retrigger
    fx._last = 0;

    if (typeof applyFxNow === "function") applyFxNow(fx);
    if (typeof updateFrameFxOnly === "function") updateFrameFxOnly();
  } else {
    // ✅ cleanup on disable (if FX supports it)
    const def = FX_REGISTRY[fx.id];
    if (def && typeof def.cleanup === "function") {
      const host = window.__FRAME_FX_HOST || frameArt;
      def.cleanup({ fx, host });
    }
  }
}

function setFxParam(id, key, value) {
  const fx = ensureFx(id);
  if (!fx) return;

  const raw = String(id || "")
    .trim()
    .replace(/^frame\./, "")
    .replace(/^effect\./, "")
    .replace(/^fx_frame_/, "")
    .replace(/^fx_effect_/, "");

  const def =
    FX_REGISTRY[id] ||
    FX_REGISTRY[raw] ||
    FX_REGISTRY["fx_frame_" + raw] ||
    FX_REGISTRY["fx_effect_" + raw];

  if (!def) return;

  const index = (typeof key === "number")
    ? key
    : def.params.indexOf(key);

  if (index === -1) {
    console.warn("Invalid FX param:", id, key);
    return;
  }

  fx.p[index] = (typeof value === "string" && !isNaN(value))
    ? Number(value)
    : value;

  // ✅ update visuals for frame FX (but never for intro.flash)
  if (def.scope === "frame" && raw !== "intro.flash") {
    updateFrameFxOnly();
  }
}

function setFrameArt(src) {
  if (!frameArt) return;

  // 🔥 HARD RESET — guarantees no ghost agents
  frameArt.querySelectorAll(".frame-art-inner").forEach(n => n.remove());

  const artEl = document.createElement("div");
  artEl.className = "frame-art-inner";
Object.assign(artEl.style, {
  position: "absolute",
  inset: "0",
  width: "100%",
  height: "100%",
  backgroundRepeat: "no-repeat",
  backgroundSize: "contain",
  backgroundPosition: "center center",
  pointerEvents: "none",
  zIndex: "1"
});


  artEl.style.backgroundImage = src ? `url(${src})` : "none";
  frameArt.prepend(artEl);

  FX_STATE.frame.art ||= { x: 0, y: 0, s: 1 };
  FX_STATE.frame.art.src = src;
}

function setFrameTransform({ x, y, s }) {
  if (x !== undefined) FX_STATE.frame.art.x = x;
  if (y !== undefined) FX_STATE.frame.art.y = y;
  if (s !== undefined) FX_STATE.frame.art.s = s;
}

let introFlashTimers = [];

function applyFxPreview(force = false) {
  const flash = FX_STATE.fx.find(f => f.id === "intro.flash");
const fxHost = frameArt && frameArt.querySelector(".frame-fx.front");
if (!fxHost) return;

let el = fxHost.querySelector(".fx-intro-flash");
if (!el) {
  el = document.createElement("div");
  el.className = "fx-intro-flash";
  fxHost.appendChild(el);
}


  // Kill any pending timers
  introFlashTimers.forEach(t => clearTimeout(t));
  introFlashTimers.length = 0;

  if (!flash || (!flash.on && !force)) {
    el.style.transition = "none";
    el.style.opacity = "0";
    return;
  }

let [intensity, duration, delay, color] = flash.p;

// Accept both formats:
// - normalized (0..1)  -> convert
// - milliseconds (> 1) -> use as-is (legacy / older presets)
const durationMs = (duration > 1)
  ? Math.max(60, duration)
  : Math.max(60, duration * 800);

const delayMs = (delay > 1)
  ? Math.max(0, delay)
  : Math.max(0, delay * 400);


  // Hard reset
  el.style.transition = "none";
  el.style.opacity = "0";
  el.style.background = color;

  // Force reset to commit
  void el.offsetHeight;

  const t1 = setTimeout(() => {
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${durationMs}ms ease-out`;
      el.style.opacity = intensity;

      const t2 = setTimeout(() => {
        el.style.opacity = "0";
      }, durationMs);

      introFlashTimers.push(t2);
    });
  }, delayMs);

  introFlashTimers.push(t1);
}

function applyFrameFx(fxId, time) {
  // ✅ tolerate fx objects being passed accidentally
  if (fxId && typeof fxId === "object") fxId = fxId.id;

  // ✅ normalize time to SECONDS (raf gives ms)
  const tMs = Number.isFinite(time) ? time : performance.now();
  const t   = tMs / 1000;

  const fx = ensureFx(fxId);
  if (!fx || !fx.on) return;

  const def =
    FX_REGISTRY[fx.id] ||
    FX_REGISTRY["fx_effect_" + fx.id] ||
    FX_REGISTRY["fx_frame_" + fx.id];

	// 🔥 Bind frame tick once
if (def.scope === "frame" && typeof def._tick === "function") {
  fx._tick = (t) => def._tick(t, fx);
}

  if (!def) return;

  // ✅ always resolve a real host element
  const hostEl =
    (window.__FRAME_FX_HOST && window.__FRAME_FX_HOST.nodeType === 1) ? window.__FRAME_FX_HOST :
    (frameArt && frameArt.nodeType === 1) ? frameArt :
    (frameArt?.el && frameArt.el.nodeType === 1) ? frameArt.el :
    document.querySelector(".frame-art");

  // ==========================
  // FRAME FX: init once + tick
  // ==========================
  if (def.scope === "frame") {
    if (!fx.__el && typeof def.init === "function") {
      try {
        def.init({ fx, host: hostEl, time: t, t });
      } catch (e) {
        console.warn("FX init error:", fx.id, e);
      }
    }

    // ✅ unified tick bridge
    // supports:
    //   legacy: _tick(t, fx, host)
    //   object: _tick({ t, time, fx, host })
    const tickFn =
      (typeof fx._tick === "function" && fx._tick) ||
      (typeof def._tick === "function"
        ? (arg) => {
            // if legacy expects multiple args, do NOT pass object
            if (def._tick.length >= 2) return def._tick(t, fx, hostEl);
            return def._tick({ t, time: t, fx, host: hostEl });
          }
        : null);

    if (tickFn) {
      try {
        // ✅ call tick with ms for fx._tick (it normalizes), otherwise no arg needed
        tickFn(tMs);
      } catch (e) {
        console.warn("FX _tick error:", fx.id, e);
      }
    }

    return;
  }

// ==========================
// EFFECT FX (route host to layers)
// ==========================
// ==========================
// EFFECT FX
// ==========================
if (def.scope === "effect") {

  // 🔥 INIT ONCE
  if (!fx.__inited) {
    fx.__inited = true;
    if (typeof def.apply === "function") {
      try {
        def.apply({ fx, host: hostEl, time: t, t });
      } catch (e) {
        console.warn("FX apply error:", fx.id, e);
      }
    }
  }

  // 🔥 SUPPORT _tick FOR EFFECTS (this was missing)
  if (typeof def._tick === "function") {
    try {
      def._tick({ fx, host: hostEl, time: t, t });
    } catch (e) {
      console.warn("FX _tick error:", fx.id, e);
    }
  }

  return;
 }
}

function exportFxPreset() {
  return JSON.stringify(FX_STATE);
}
function importFxPreset(json) {
  try {
    const data = JSON.parse(json);
    if (!data || data.v !== 1) {
      throw new Error("Invalid FX preset version");
    }

    FX_STATE.v = data.v;
    FX_STATE.agent = data.agent;
    FX_STATE.frame = JSON.parse(JSON.stringify(data.frame));
    FX_STATE.fx = JSON.parse(JSON.stringify(data.fx));

 

    applyFxPreview();
  } catch (err) {
    console.error("Failed to import FX preset:", err);
  }
}
function loadPreset(agent, name) {
  const all = loadAllPresets();
  const preset =
  all &&
  all[agent] &&
  all[agent][name];

  if (!preset) {
    console.warn("Preset not found:", agent, name);
    return;
  }

  importFxPreset(JSON.stringify(preset));

  // Sync legacy frame art image if needed
  const artCard = frameState.cards.find(
    c => c.type === "frame" && c.subtype === "art"
  );

  if (artCard && preset.frame && preset.frame.art && preset.frame.art.src) {
    artCard.image = preset.frame.art.src;
  }

  renderFrame();
}
// ==============================
// FX REGISTRY
// ==============================
const FX_REGISTRY = {
  "intro.flash": {
    params: ["intensity", "duration", "delay", "color"],
    defaults: [0.6, 0.5, 0, "#ffffff"]
  },

  "intro.runin": {
    scope: "intro",
    params: ["direction", "strength"],
    defaults: [0, 1]
  },

  "overlay.scan": {
    params: ["strength", "speed"],
    defaults: [0.4, 1]
  },

  "frame.glow": {
    scope: "frame",
    params: [
      "intensity",
      "spread",
      "blur",
      "hue",
      "layer",
      "pulse",
      "direction",
      "pulseMode",
      "trailFrames"
    ],
    defaults: [0.8, 1.2, 14, 0, 0, 0, 0, 0, 3],

    apply({ fx, host }) {
      const frame = host;
      const layer = fx.p[4] === 1 ? "front" : "behind";
      const fxHost = frame.querySelector(".frame-fx." + layer);
      if (!fxHost) return;

      let el = fxHost.querySelector(".fx-frame-glow");
      if (!el) {
        el = document.createElement("div");
        el.className = "fx-frame-glow";
        fxHost.appendChild(el);
      }

      const artEl = frameArt.querySelector(".frame-art-inner");
      el.style.backgroundImage = artEl ? artEl.style.backgroundImage : "none";

      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundPosition = "center";
      el.style.backgroundSize = "contain";
      el.style.transform = frameArt.style.transform;

      updateGlowPulse(fx, el);
    }
  },

  "frame.fire_border": {
    scope: "frame",
    params: ["intensity", "thickness", "speed", "turbulence", "hue", "layer"],
    defaults: [0.8, 14, 1, 0.6, 20, 0],

    apply({ fx, host }) {
      applyFireBorderFx(fx, host);
    }
  },
"fx_effect_breach_fault_line": {
  scope: "effect",
  params: ["strength", "speed"],
  defaults: [12, 0.25],

  apply({ fx }) {
    fx._next = 0;
  },

  _tick(ctx, fx) {
    if (!fx.on) return;

    const t = ctx.time;
    if (t < fx._next) return;

    const strength = fx.p?.[0] ?? 12;
    const speed    = Math.max(0.1, fx.p?.[1] ?? 0.25);

    spawnBreachFaultLine(strength);

    fx._next = t + (1 / speed);
  },

  cleanup() {
    document
      .querySelectorAll(".fx-breach-debug")
      .forEach(n => n.remove());
  }
},

/* ---------------------------------------------
 * FRAME — Breach Seismic Dust
 * ------------------------------------------- */
"fx_frame_breach_seismic_frame": {
  scope: "frame",
  params: ["rate", "size", "speed", "layer"],
  defaults: [12, 3, 1.0, 1],

  _tick(t, fx) {

    const rate  = Math.max(1, fx.p?.[0] ?? 12);
    const size  = Math.max(1, fx.p?.[1] ?? 3);
    const speed = Math.max(0.3, fx.p?.[2] ?? 1);
    const layer = fx.p?.[3] ?? 1;
const host = getLayerHost(layer, "frame");


    if (!host) return;

    // spawn timer
    fx._acc = (fx._acc || 0) + rate;

    if (fx._acc < 60) return;
    fx._acc = 0;

    const d = document.createElement("div");
    d.className = "fx-breach-seismic-dust";

    d.style.left = `${Math.random() * 100}%`;
    d.style.top = `-10px`;

    const vy = (120 + Math.random() * 140) * speed;
    const vx = (Math.random() - 0.5) * 40;

    d.style.setProperty("--vx", `${vx}px`);
    d.style.setProperty("--vy", `${vy}px`);
    d.style.width  = `${size}px`;
    d.style.height = `${size}px`;

host.appendChild(d);

// ✅ animate TOP so transforms elsewhere can't freeze it
const startTop = -10;
const endTop   = startTop + vy;

d.style.top = `${startTop}px`;

d.animate(
  [
    { top: `${startTop}px`, opacity: 1 },
    { top: `${endTop}px`,   opacity: 0 }
  ],
  { duration: 1200, easing: "linear", fill: "forwards" }
);

setTimeout(() => d.remove(), 1300);


  },

  cleanup(fx) {
    const hosts = frameArt.querySelectorAll(
      ".frame-fx.front, .frame-fx.behind"
    );

    hosts.forEach(h =>
      h.querySelectorAll(".fx-breach-seismic-dust").forEach(n => n.remove())
    );

    fx._acc = 0;
  }
},


  // ======================
  // OMEN
  // ======================
"fx_effect_omen_shadow_ripple": {

  scope: "frame",
  params: ["strength", "speed", "fieldColor", "wispColor"],
  defaults: [0.6, 1, "#7b2cff", "#ffffff"],

  _tick(ctx, fx) {
    const host = ctx.frameEl;
    if (!host || !fx.on) return;

    // ---------- BUILD ----------
    let field = host.querySelector(".fx-omen-field");
    if (!field) {
      field = document.createElement("div");
      field.className = "fx-omen-field";
      Object.assign(field.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none"
      });
      host.appendChild(field);

      field._t = Math.random() * Math.PI * 2;
      field._wisps = [];

      for (let i = 0; i < 6; i++) {
        const w = document.createElement("div");
        w.className = "fx-omen-wisp";
        Object.assign(w.style, {
          position: "absolute",
          left: "-40%",
          top: `${10 + i * 12}%`,
          width: "70%",
          height: "18%",
          pointerEvents: "none",
          opacity: "0"
        });

        w._x = -Math.random() * 60;
        w._y = Math.random() * 100;
        w._v = 0.4 + Math.random() * 0.6;

        field.appendChild(w);
        field._wisps.push(w);
      }
    }

    // ---------- ANIMATE ----------
    const strength   = fx.p?.[0] ?? 0.6;
    const speed      = Math.max(0.2, fx.p?.[1] ?? 1);
    const fieldColor = fx.p?.[2] ?? "#7b2cff";
    const wispColor  = fx.p?.[3] ?? "#ffffff";

    field._t += 0.016 * speed;
    const pulse = 0.5 + Math.sin(field._t) * 0.5;

    field.style.background = `
      linear-gradient(
        120deg,
        ${fieldColor}33,
        ${fieldColor}66,
        ${fieldColor}99
      )
    `;
    field.style.filter = `blur(${4 + strength * 8}px)`;
    field.style.opacity = 0.25 + pulse * 0.35;

    field._wisps.forEach(w => {
      w._x += w._v * speed;
      w._y -= 0.05 * speed;

      if (w._x > 130) {
        w._x = -50;
        w._y = 80 + Math.random() * 20;
      }

      w.style.background = `
        linear-gradient(
          to right,
          ${wispColor}00,
          ${wispColor}66,
          ${wispColor}00
        )
      `;

      w.style.transform =
        `translate(${w._x}%, ${w._y}%) skewX(${Math.sin(field._t) * 6}deg)`;
      w.style.opacity = 0.15 + pulse * 0.4 * strength;
    });
  },

  cleanup(ctx) {
    ctx?.frameEl
      ?.querySelectorAll(".fx-omen-field")
      .forEach(n => n.remove());
  }
},

  /* ---------------------------------------------
 * EFFECT — Omen Void Threads
 * ------------------------------------------- */
"fx_effect_omen_void_threads": {
  scope: "frame",
  params: ["density", "speed", "strength", "color"],
  defaults: [48, 1.0, 0.55, "#000000"],

  _tick(ctx, fx) {
    if (!fx.on) return;

    const host = ctx.front || ctx.behind;
    if (!host) return;

    fx._lt = fx._lt ?? ctx.time;
    const dt = Math.min(0.05, ctx.time - fx._lt);
    fx._lt = ctx.time;

    const density  = Math.max(0, Math.round(fx.p?.[0] ?? 48));
    const speed    = Math.max(0.2, fx.p?.[1] ?? 1);
    const strength = Math.min(1, Math.max(0, fx.p?.[2] ?? 0.55));
    const color    = fx.p?.[3] ?? "#000000";

    let threads = Array.from(host.querySelectorAll(".fx-omen-thread"));

    if (density === 0) {
      threads.forEach(t => t.remove());
      return;
    }

    // ───────── SPAWN ─────────
    for (let i = threads.length; i < density; i++) {
      const t = document.createElement("div");
      t.className = "fx-omen-thread";

      const y = Math.random() * 100;
      const thickness = Math.random() < 0.6 ? "1px" : "0.5px";

      Object.assign(t.style, {
        position: "absolute",
        left: "0",
        top: `${y}%`,
        width: "120%",
        height: thickness,
        pointerEvents: "none",
        opacity: strength,
        imageRendering: "pixelated",
        backgroundRepeat: "repeat-x"
      });

      // motion state
      t._x = Math.random() * 140;
      t._v = (0.3 + Math.random() * 1.8) * 90;
      t._phase = Math.random() * Math.PI * 2;

      // 🔑 HIGH-ENTROPY SEGMENTS (NO BLUR)
      const segA = 2 + Math.random() * 6;
      const segB = segA + 1 + Math.random() * 10;
      const segC = segB + 1 + Math.random() * 8;

      t.style.backgroundImage = `
        repeating-linear-gradient(
          to right,
          ${color}ff 0px,
          ${color}ff 1px,
          ${color}00 ${segA}px,
          ${color}ff ${segA + 1}px,
          ${color}00 ${segB}px,
          ${color}ff ${segB + 1}px,
          ${color}00 ${segC}px
        )
      `;

      host.appendChild(t);
      threads.push(t);
    }

    while (threads.length > density) {
      threads.pop().remove();
    }

    // ───────── ANIMATE ─────────
    threads.forEach(t => {
      t._phase += dt * speed * (1.5 + Math.random());

      t._x -= t._v * speed * dt;
      if (t._x < -140) {
        t._x += 280;
        t.style.top = `${Math.random() * 100}%`; // 🔑 respawn randomness
      }

      const jitterX = Math.sin(t._phase * 2.3) * 1.1;
      const jitterY = Math.sin(t._phase * 1.1) * 0.7;

      t.style.transform =
        `translateX(${t._x + jitterX}%) translateY(${jitterY}px)`;

      t.style.opacity =
        strength * (0.35 + Math.sin(t._phase) * 0.25);
    });
  },

  cleanup(ctx) {
    (ctx.front || ctx.behind)
      ?.querySelectorAll(".fx-omen-thread")
      .forEach(n => n.remove());
  }
},



  /* ---------------------------------------------
 * EFFECT — Omen Shadow Phase
 * ------------------------------------------- */
"fx_effect_omen_shadow_phase": {
  scope: "frame",
  params: ["intensity", "speed", "layer"],
  defaults: [1.4, 1, 1],

  _tick(ctx, fx) {
    const target = fx.p?.[2] ? ctx.front : ctx.behind;
    if (!target || !fx.on) return;

    let el = target.querySelector(".fx-omen-shadow-phase");
    if (!el) {
      el = document.createElement("div");
      el.className = "fx-omen-shadow-phase";
      Object.assign(el.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none"
      });
      target.appendChild(el);
      el._t = Math.random() * Math.PI * 2;
    }

    const intensity = fx.p?.[0] ?? 1;
    const speed = Math.max(0.25, fx.p?.[1] ?? 1);

    el._t += 0.02 * speed;
    const pulse = Math.sin(el._t) * 0.5 + 0.5;

    el.style.setProperty("--p", pulse);
    el.style.setProperty("--i", intensity);
  },

  cleanup(ctx) {
    ctx?.front?.querySelectorAll(".fx-omen-shadow-phase").forEach(n => n.remove());
    ctx?.behind?.querySelectorAll(".fx-omen-shadow-phase").forEach(n => n.remove());
  }
},




// ======================
// S A G E
// ======================


/* ---------------------------------------------
 * EFFECT — Healing Wave
 * ------------------------------------------- */
"fx_effect_sage_healing_wave": {
  scope: "effect",
  params: ["strength", "rings", "duration", "softness"],
  defaults: [1.0, 3, 0.85, 0.65],

  apply({ fx, host }) {

    if (!fx._root || !fx._root.isConnected) {

      const root = document.createElement("div");
      root.className = "fx-sage-heal-root";
      host.appendChild(root);

      fx._root = root;
      fx._ringCount = 0;
      fx._moteCount = 0;
    }

    const root = fx._root;

    const strength = Math.max(0.2, fx.p?.[0] ?? 1);
    const rings = Math.max(1, Math.round(fx.p?.[1] ?? 3));
    const duration = Math.max(0.2, fx.p?.[2] ?? 0.85);
    const soft = Math.max(0, Math.min(1, fx.p?.[3] ?? 0.65));

    root.style.setProperty("--dur", `${duration}s`);
    root.style.setProperty("--str", strength);
    root.style.setProperty("--soft", soft);

    // ----------------------------
    // RINGS (rebuild only if count changed)
    // ----------------------------
    if (root._ringCount !== rings) {

      root.querySelectorAll(".fx-sage-heal-ring").forEach(n => n.remove());
      root._ringCount = rings;

      for (let i = 0; i < rings; i++) {
        const r = document.createElement("div");
        r.className = "fx-sage-heal-ring";
        r.style.animationDelay = `${(i * duration) / rings}s`;
        root.appendChild(r);
      }
    }

    // ----------------------------
    // FLOATING MOTES (persistent)
    // ----------------------------
    const desiredMotes = 18;

    if (root._moteCount !== desiredMotes) {

      root.querySelectorAll(".fx-sage-heal-mote").forEach(n => n.remove());
      root._moteCount = desiredMotes;

      for (let i = 0; i < desiredMotes; i++) {

        const p = document.createElement("i");
        p.className = "fx-sage-heal-mote";

        p.style.left = `${Math.random() * 100}%`;
        p.style.top  = `${Math.random() * 100}%`;

        p.style.animationDelay = `${Math.random() * duration}s`;
        p.style.animationDuration =
          `${duration * (0.9 + Math.random() * 0.6)}s`;

        root.appendChild(p);
      }
    }
  },

  cleanup({ fx }) {
    if (fx._root) fx._root.remove();
    fx._root = null;
  }
},

/* ---------------------------------------------
 * EFFECT — Sage Barrier Rise (CLEAN + SVG SHARDS)
 * ------------------------------------------- */
"fx_effect_sage_barrier_rise": {
  scope: "effect",
  params: ["panelCount", "height", "crackIntensity", "duration", "softness"],
  defaults: [5, 0.85, 0.65, 1.0, 0.45],

  apply({ fx, host }) {
    if (!host) return;

    const clamp01 = v => Math.max(0, Math.min(1, v));

    // -----------------------------
    // Slider values
    // -----------------------------
    const panelCount = Math.max(2, Math.round(fx.p?.[0] ?? 5));
    const height     = Math.max(0.25, Math.min(1.25, fx.p?.[1] ?? 0.85));
    const crack      = clamp01(fx.p?.[2] ?? 0.65);
    const durMul     = Math.max(0.25, fx.p?.[3] ?? 1.0);
    const softness   = clamp01(fx.p?.[4] ?? 0.45);

    // -----------------------------
    // Resolve correct FX layer
    // -----------------------------
    const frame =
      host?.closest?.(".frame") ||
      document.querySelector(".frame");
    if (!frame) return;

    const layers = (typeof ensureFxLayers === "function") ? ensureFxLayers() : null;

    let target =
      layers?.frontEffect ||
      frame.querySelector(".frame-fx.front .fx-effect-layer") ||
      frame.querySelector(".frame-fx.front");
    if (!target) return;

    if (target.classList?.contains("front")) {
      let effectLayer = target.querySelector(".fx-effect-layer");
      if (!effectLayer) {
        effectLayer = document.createElement("div");
        effectLayer.className = "fx-effect-layer";
        target.appendChild(effectLayer);
      }
      target = effectLayer;
    }

    // -----------------------------
    // Create root once
    // -----------------------------
    if (!fx._root || !fx._root.isConnected) {
      const root = document.createElement("div");
      root.className = "fx-sage-wall-root";
      target.appendChild(root);
      fx._root = root;
      fx._panelCount = 0;
    }

    const root = fx._root;

    // Timing
    const cycleSeconds = 8 * durMul;

    root.style.setProperty("--dur", `${cycleSeconds}s`);
    root.style.setProperty("--h", height);
    root.style.setProperty("--cr", crack);      // ✅ IMPORTANT: crack slider drives CSS vars
    root.style.setProperty("--soft", softness);

    // -----------------------------
    // Helpers (local, no globals)
    // -----------------------------
    const svgNS = "http://www.w3.org/2000/svg";
    const rand = (min, max) => min + Math.random() * (max - min);

    function appendCrackPath(svg, d) {
      const glow = document.createElementNS(svgNS, "path");
      glow.setAttribute("d", d);
      glow.setAttribute("class", "fx-sage-crack-glow");
      svg.appendChild(glow);

      const core = document.createElementNS(svgNS, "path");
      core.setAttribute("d", d);
      core.setAttribute("class", "fx-sage-crack-core");
      svg.appendChild(core);
    }

    // -----------------------------
    // Rebuild panels if needed
    // -----------------------------
    if (fx._panelCount !== panelCount) {
      fx._panelCount = panelCount;
      root.innerHTML = "";

      for (let i = 0; i < panelCount; i++) {
        const panel = document.createElement("div");
        panel.className = "fx-sage-wall-panel";
        panel.style.left = `${(i / panelCount) * 100}%`;
        panel.style.width = `${100 / panelCount}%`;
        panel.style.setProperty("--seed", Math.random().toFixed(3));
        root.appendChild(panel);

        // -----------------------------
        // FRACTURE SVG (density scales with crack)
        // -----------------------------
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("viewBox", "0 0 200 300");
        svg.setAttribute("class", "fx-sage-fracture");
        panel.appendChild(svg);

        // ✅ Crack density scaling (actually responsive)
        const verticalSpines   = Math.max(1, Math.floor(1 + crack * 14));
        const horizontalCracks = Math.max(0, Math.floor(crack * 10));
        const branchChance     = 0.15 + crack * 0.75;
        const branchAttempts   = Math.floor(2 + crack * 12);

        // Vertical spines + branches
        for (let v = 0; v < verticalSpines; v++) {
          let x = rand(40, 160);
          let y = 300;
          let d = `M ${x.toFixed(1)} ${y.toFixed(1)}`;

          const segments = 6 + Math.floor(crack * 14);

          for (let s = 0; s < segments; s++) {
            x += rand(-30, 30);
            y -= 300 / segments;
            d += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
          }

          appendCrackPath(svg, d);

          // branches
          for (let b = 0; b < branchAttempts; b++) {
            if (Math.random() < branchChance) {
              let bx = rand(40, 160);
              let by = rand(60, 260);
              let bd = `M ${bx.toFixed(1)} ${by.toFixed(1)}`;

              const bSeg = 2 + Math.floor(Math.random() * (3 + crack * 6));

              for (let bs = 0; bs < bSeg; bs++) {
                bx += rand(-35, 35);
                by += rand(-25, 25);
                bd += ` L ${bx.toFixed(1)} ${by.toFixed(1)}`;
              }

              appendCrackPath(svg, bd);
            }
          }
        }

        // Horizontal stress fractures
        for (let h = 0; h < horizontalCracks; h++) {
          let yy = rand(80, 240);
          let xx = 20;
          let d = `M ${xx.toFixed(1)} ${yy.toFixed(1)}`;

          const segments = 4 + Math.floor(crack * 8);

          for (let s = 0; s < segments; s++) {
            xx += 160 / segments;
            yy += rand(-20, 20);
            d += ` L ${xx.toFixed(1)} ${yy.toFixed(1)}`;
          }

          appendCrackPath(svg, d);
        }

        // -----------------------------
        // SVG CRYSTAL SHARDS (burst container)
        // -----------------------------
        const burst = document.createElement("div");
        burst.className = "fx-sage-wall-burst";
        panel.appendChild(burst);
		Object.assign(burst.style, {
  position: "absolute",
  left: "0",
  top: "0",        // 🔥 anchor to top
  width: "100%",
  height: "0",     // no height — origin only
  pointerEvents: "none"
});
        const shardCount = 6 + Math.floor(crack * 18);

        for (let s = 0; s < shardCount; s++) {

          const shardSvg = document.createElementNS(svgNS, "svg");
          shardSvg.setAttribute("viewBox", "0 0 40 80");
          shardSvg.classList.add("fx-sage-shard");

          const defs = document.createElementNS(svgNS, "defs");
          const grad = document.createElementNS(svgNS, "linearGradient");
          const gid = `sageShardGrad_${i}_${s}_${Math.random().toString(36).slice(2)}`;

          grad.setAttribute("id", gid);
          grad.setAttribute("x1", "0%");
          grad.setAttribute("y1", "0%");
          grad.setAttribute("x2", "0%");
          grad.setAttribute("y2", "100%");

          const stop1 = document.createElementNS(svgNS, "stop");
          stop1.setAttribute("offset", "0%");
          stop1.setAttribute("stop-color", "rgba(210,255,250,0.95)");

          const stop2 = document.createElementNS(svgNS, "stop");
          stop2.setAttribute("offset", "100%");
          stop2.setAttribute("stop-color", "rgba(120,240,255,0.35)");

          grad.appendChild(stop1);
          grad.appendChild(stop2);
          defs.appendChild(grad);
          shardSvg.appendChild(defs);

          const poly = document.createElementNS(svgNS, "polygon");

          // random shard polygon
          const w = 10 + Math.random() * 16;
          const h = 26 + Math.random() * 40;

          const pts = [
            [20, 0],
            [20 + w * 0.55, h * 0.25],
            [20 + w * 0.25, h],
            [20 - w * 0.25, h],
            [20 - w * 0.55, h * 0.25]
          ]
            .map(p => p.map(n => n.toFixed(1)).join(","))
            .join(" ");

          poly.setAttribute("points", pts);
          poly.setAttribute("fill", `url(#${gid})`);

          shardSvg.appendChild(poly);

// ==========================
// GRAVITY-BASED SHARD MOTION
// ==========================

// small outward break (keep shard shape feel)
const dx = (Math.random() * 2 - 1) * 80;

// slight initial upward pop (small)
const initialLift = -60 - Math.random() * 80;

// gravity pull (dominant downward)
const gravityDrop = 260 + Math.random() * 240;

const dy = initialLift + gravityDrop;

// tumble remains same
const rot = (Math.random() * 360 - 180);

// preserve original size range
const scale = 0.6 + Math.random() * 1.4;

          shardSvg.style.setProperty("--dx", `${dx.toFixed(1)}px`);
          shardSvg.style.setProperty("--dy", `${dy.toFixed(1)}px`);
          shardSvg.style.setProperty("--rot", `${rot.toFixed(1)}deg`);
          shardSvg.style.setProperty("--sz", `${scale.toFixed(2)}`);

          burst.appendChild(shardSvg);
        }
      }

      const lock = document.createElement("div");
      lock.className = "fx-sage-wall-lock";
      root.appendChild(lock);
    }
  },

  cleanup({ fx }) {
    if (fx?._root && fx._root.isConnected) fx._root.remove();
    if (fx) {
      fx._root = null;
      fx._panelCount = 0;
    }
  }
},

"fx_frame_viper_haze": {
  scope: "frame",
  params: ["density", "drift", "opacity", "layer"],
  defaults: [0.75, 0.4, 0.65, 1],

  apply() {},

_tick(ctx, fxArg) {

  const fx = ctx?.fx || fxArg;
  const time = ctx?.time ?? 0;

  const layerVal = fx?.p?.[3] ?? 1;

  const frame = document.querySelector(".frame");
  if (!frame) return;

  const target = layerVal
    ? frame.querySelector(".frame-fx.front")
    : frame.querySelector(".frame-fx.behind");

  if (!target) return;

  let root = target.querySelector(".fx-viper-haze-root");

  if (!root) {
    root = document.createElement("div");
    root.className = "fx-viper-haze-root";
    target.appendChild(root);
  }

  const density = fx?.p?.[0] ?? 0.75;
  const drift   = fx?.p?.[1] ?? 0.4;
  const opacity = fx?.p?.[2] ?? 0.65;

  root.style.setProperty("--density", density);
  root.style.setProperty("--opacity", opacity);

  const dx = time * 15 * drift;
  const dy = time * 9 * drift;

  root.style.backgroundPosition =
    `${dx}px ${dy}px, ${-dx * 0.7}px ${-dy * 0.7}px`;
},

  cleanup() {
    document.querySelectorAll(".fx-viper-haze-root")
      .forEach(n => n.remove());
  }
},


"fx_effect_viper_acid_splat": {
  scope: "effect",
  params: ["size", "frequency", "layer"],
  defaults: [0.8, 0.7, 1],

  apply({ fx, host, time }) {

// ------------------------
// Frequency spawn control
// ------------------------

const size = fx?.p?.[0] ?? 0.8;
const freq = fx?.p?.[1] ?? 0.5;
const layerVal = fx?.p?.[2] ?? 1;

// Smooth nonlinear frequency scaling
// freq 0 → 2.5s
// freq 1 → 0.4s
const minDelay = 0.4;
const maxDelay = 2.5;

// Exponential feel (more responsive at high end)
const delay = maxDelay * Math.pow(0.25, freq);

if (!fx._nextAt || time >= fx._nextAt) {
  fx._nextAt = time + delay;
} else {
  return;
}
    // -------- Layer resolve --------
    const frame = document.querySelector(".frame");
    const target = layerVal
      ? frame?.querySelector(".frame-fx.front")
      : frame?.querySelector(".frame-fx.behind");

    const splatHost = target || host;
    if (!splatHost) return;

	if (host.querySelector(".fx-viper-acid-splat-fast")) return;
	
    // -------- Create quick splat --------
    const splat = document.createElement("div");
    splat.className = "fx-viper-acid-splat-fast";
    splat.style.left = Math.random() * 100 + "%";
    splat.style.top  = Math.random() * 100 + "%";
    splat.style.setProperty("--size", size);
	
	const rotation = (Math.random() * 360).toFixed(2);
	splat.style.setProperty("--rot", rotation + "deg");

    splatHost.appendChild(splat);

    // short life
splat.addEventListener("animationend", () => {
  splat.remove();
});
  },

  cleanup({ host }) {
    host.querySelectorAll(".fx-viper-acid-splat-fast")
      .forEach(n => n.remove());
  }
},
// ======================
// S K Y E
// ======================

/* ---------------------------------------------
 * EFFECT — Skye Trailblazer Rush (Bite Snap)
 * ------------------------------------------- */
"fx_effect_skye_trailblazer_rush": {
  scope: "effect",
  params: ["size", "ferocity", "duration", "softness", "layer"],
  defaults: [1.0, 0.75, 0.55, 0.35, 1],

  apply({ fx, host, time }) {

    const size  = Math.max(0.55, Math.min(2.0, fx.p?.[0] ?? 1.0));
    const fero  = Math.max(0, Math.min(1, fx.p?.[1] ?? 0.75));
    const dur   = Math.max(0.35, fx.p?.[2] ?? 0.55);
    const soft  = Math.max(0, Math.min(1, fx.p?.[3] ?? 0.35));
    const layer = (fx.p?.[4] ?? 1) ? 1 : 0;

    // loop gate
    if (fx._nextAt && time < fx._nextAt) return;
    fx._nextAt = time + dur;

    const frameEl = document.querySelector(".frame");
    if (!frameEl) return;

    const layerWrap = frameEl.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");
    if (!layerWrap) return;

    // stable host
    let H = layerWrap.querySelector(".fx-full-host");
    if (!H) {
      H = document.createElement("div");
      H.className = "fx-full-host";
      Object.assign(H.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none",
        overflow: "visible"
      });
      layerWrap.appendChild(H);
    }

    const root = document.createElement("div");
    root.className = "fx-skye-bite-root";

    root.style.setProperty("--sz", size);
    root.style.setProperty("--fero", fero);
    root.style.setProperty("--dur", `${dur}s`);
    root.style.setProperty("--soft", soft);
    root.style.setProperty("--rot", `${(-10 + Math.random() * 20).toFixed(1)}deg`);

    // center bias
    const ox = (-60 + Math.random() * 120) * size;
    const oy = (-40 + Math.random() * 80)  * size;
    root.style.left = `calc(50% + ${ox.toFixed(1)}px)`;
    root.style.top  = `calc(50% + ${oy.toFixed(1)}px)`;

    // ring
    const ring = document.createElement("div");
    ring.className = "fx-skye-bite-ring";
    root.appendChild(ring);

    // spark
    const spark = document.createElement("div");
    spark.className = "fx-skye-bite-spark";
    root.appendChild(spark);

    // jaws
    const topJaw = document.createElement("div");
    topJaw.className = "fx-skye-bite-jaw top";
    root.appendChild(topJaw);

    const botJaw = document.createElement("div");
    botJaw.className = "fx-skye-bite-jaw bot";
    root.appendChild(botJaw);

const addFangs = (jaw, isTop) => {

  // ======================
  // LARGE CANINES
  // ======================

  const bigL = document.createElement("div");
  bigL.className = "fang big";
  bigL.style.left = "8%";
  jaw.appendChild(bigL);

  const bigR = document.createElement("div");
  bigR.className = "fang big";
  bigR.style.right = "8%";
  jaw.appendChild(bigR);

  // ======================
  // SMALL CENTER TEETH (5)
  // ======================

  const smallCount = 5;

  for (let i = 0; i < smallCount; i++) {

    const t = document.createElement("div");
    t.className = "fang small";

    // narrower center range to avoid clipping
    const pct = 28 + (i * (44 / (smallCount - 1)));
    t.style.left = `${pct}%`;
    t.style.transform = "translateX(-50%)";

    // bottom jaw flip fix
    if (!isTop) {
      t.style.transform += " scaleY(-1)";
    }

    jaw.appendChild(t);
  }
};

    addFangs(topJaw, true);
    addFangs(botJaw, false);

    H.appendChild(root);

    // auto remove after animation
    setTimeout(() => {
      if (root.parentNode) root.remove();
    }, dur * 1000 + 120);
  },

  cleanup({ fx }) {

    if (fx) fx._nextAt = 0;

    const frameEl = document.querySelector(".frame");
    if (!frameEl) return;

    frameEl
      .querySelectorAll(".fx-skye-bite-root")
      .forEach(n => n.remove());

    frameEl
      .querySelectorAll(".fx-full-host")
      .forEach(n => {
        if (!n.children.length) n.remove();
      });
  }
},

"fx_effect_skye_regrowth_bloom": {
  scope: "effect",
  params: ["strength", "rings", "duration", "softness"],
  defaults: [1.0, 3, 0.95, 0.6],

  apply({ fx, host }) {

    if (fx._root) return;

    const root = document.createElement("div");
    root.className = "fx-skye-bloom-root";
    host.appendChild(root);
    fx._root = root;

    const core = document.createElement("div");
    core.className = "fx-skye-bloom-core";
    root.appendChild(core);

    fx._ringCount = 0;
    fx._moteCount = 0;
  },

  _tick({ fx }) {

    const root = fx._root;
    if (!root) return;

    const str   = Math.max(0.2, fx.p?.[0] ?? 1.0);
    const rings = Math.max(1, Math.round(fx.p?.[1] ?? 3));
    const dur   = Math.max(0.25, fx.p?.[2] ?? 0.95);
    const soft  = Math.max(0, Math.min(1, fx.p?.[3] ?? 0.6));

    // Sync CSS vars (live sliders)
    root.style.setProperty("--str", str);
    root.style.setProperty("--dur", `${dur}s`);
    root.style.setProperty("--soft", soft);

    /* --------------------------
       RINGS REBUILD IF CHANGED
    --------------------------- */

    if (fx._ringCount !== rings) {
      root.querySelectorAll(".fx-skye-bloom-ring").forEach(n => n.remove());
      fx._ringCount = rings;

      for (let i = 0; i < rings; i++) {
        const r = document.createElement("div");
        r.className = "fx-skye-bloom-ring";
        r.style.animationDelay = `${(i * dur) / rings}s`;
        r.style.opacity = `${0.9 - i * (0.55 / rings)}`;
        root.appendChild(r);
      }
    }

    /* --------------------------
       MOTES REBUILD IF NEEDED
    --------------------------- */

    const desiredMotes = Math.round(10 + str * 20);

    if (fx._moteCount !== desiredMotes) {

      root.querySelectorAll(".fx-skye-bloom-mote").forEach(n => n.remove());
      fx._moteCount = desiredMotes;

      for (let i = 0; i < desiredMotes; i++) {
        const m = document.createElement("i");
        m.className = "fx-skye-bloom-mote";
        m.style.left = `${Math.random() * 100}%`;
        m.style.top  = `${Math.random() * 100}%`;
        m.style.animationDelay = `${Math.random() * dur}s`;
        m.style.animationDuration = `${dur * (0.8 + Math.random() * 1.2)}s`;
        m.style.opacity = `${0.3 + Math.random() * 0.7}`;
        root.appendChild(m);
      }
    }
  },

  cleanup({ fx }) {
    fx._root?.remove();
    fx._root = null;
    fx._ringCount = 0;
    fx._moteCount = 0;
  }
},
// ======================
// G E K K O
// ======================

/* ---------------------------------------------
 * EFFECT — Mosh Pit Splash (Bubbles only)
 * ------------------------------------------- */
"fx_effect_gekko_mosh_pit": {
  scope: "effect",
  params: ["rate", "size", "riseSpeed", "mixDark", "opacity", "layer"],
  defaults: [0.65, 0.85, 0.85, 0.35, 0.85, 1],

  apply({ fx, host, time }) {
    const rootHost = resolveHostEl(host);
    if (!rootHost) return;

    const rate     = Math.max(0.05, Math.min(2.0, fx.p?.[0] ?? 0.65)); // spawn scaler
    const size     = Math.max(0.45, Math.min(1.6, fx.p?.[1] ?? 0.85));
    const rise     = Math.max(0.35, Math.min(1.8, fx.p?.[2] ?? 0.85)); // speed scaler
    const mixDark  = Math.max(0.0,  Math.min(1.0, fx.p?.[3] ?? 0.35));
    const opacity  = Math.max(0.0,  Math.min(1.0, fx.p?.[4] ?? 0.85));
    const layerVal = (fx.p?.[5] ?? 1) ? 1 : 0;

    // ✅ use app-standard layer routing
    const target =
      getFxHost(rootHost, layerVal ? "front" : "behind", "effect") ||
      rootHost;

    // ✅ hard guarantee: never leave the frame
    // set once, not every tick
    if (!target.dataset.fxClip) {
      target.dataset.fxClip = "1";
    }

    // ✅ persistent root node (ONE per layer)
    let el = target.querySelector(":scope > .fx-gekko-mosh-root");
    if (!el) {
      el = document.createElement("div");
      el.className = "fx-gekko-mosh-root";
      target.appendChild(el);
    } else if (el.parentNode !== target) {
      target.appendChild(el);
    }

    // ✅ keep runtime clock on fx (prevents one-shot behavior)
    const now = (typeof time === "number") ? time : (performance.now() / 1000);
    fx._gk_mosh_next = fx._gk_mosh_next ?? now;

    // spawn bubbles continuously
    const spawnInterval = 1 / (6.5 * rate); // ~6.5 bubbles/sec at rate=1
    let safety = 0;

    while (fx._gk_mosh_next <= now && safety++ < 30) {
      spawnBubble({
        fx,
        el,
        now: fx._gk_mosh_next,
        size,
        rise,
        mixDark,
        opacity
      });
      fx._gk_mosh_next += spawnInterval;
    }
  },

  cleanup({ host }) {
    const rootHost = resolveHostEl(host);
    if (!rootHost) return;

    // ✅ remove ONLY from this frame's fx layers (not document-wide)
    const layers = (typeof ensureFxLayers === "function") ? ensureFxLayers() : null;

    if (layers) {
      layers.frontEffect?.querySelectorAll(".fx-gekko-mosh-root").forEach(n => n.remove());
      layers.behindEffect?.querySelectorAll(".fx-gekko-mosh-root").forEach(n => n.remove());
    } else {
      rootHost.querySelectorAll(".fx-gekko-mosh-root").forEach(n => n.remove());
    }
  }
},

/* ---------------------------------------------
 * EFFECT — Gekko Dizzy Pop (LOOPING BLUE SPLAT)
 * One splat at a time: spawn -> animate -> removed
 * ------------------------------------------- */
"fx_effect_gekko_dizzy_pop": {
  scope: "effect",
  params: ["strength", "count", "duration", "softness", "layer"],
  defaults: [1.0, 10, 0.38, 0.45, 1],

  apply({ fx, host, time }) {
    // cache a stable host once
    fx.__host = resolveHostEl(host) || host;

    // bind tick once so sliders update live
    if (!fx._tick) fx._tick = (t) => this._tick(t, fx);

    // run once immediately too
    fx._tick(time);
  },

  _tick(arg, fx) {
    if (!fx || !fx.__host) return;

    // ✅ normalize time to SECONDS (supports number seconds, number ms, or object)
    let nowSec;
    if (typeof arg === "number") {
      // if it's huge, assume ms
      nowSec = arg > 1000 ? (arg / 1000) : arg;
    } else if (arg && typeof arg === "object") {
      const t = Number(arg.time ?? arg.t ?? 0);
      nowSec = t > 1000 ? (t / 1000) : t;
    } else {
      nowSec = performance.now() / 1000;
    }

    // ✅ read sliders LIVE every tick
    const strength = Math.max(0.5, Math.min(2.0, Number(fx.p?.[0] ?? 1.0)));
    const count    = Math.max(6,   Math.min(26,  Math.round(Number(fx.p?.[1] ?? 10))));
    const duration = Math.max(0.18,Math.min(1.2, Number(fx.p?.[2] ?? 0.38)));
    const soft     = Math.max(0.1, Math.min(0.9, Number(fx.p?.[3] ?? 0.45)));
    const layerVal = (fx.p?.[4] ?? 1) ? 1 : 0;

    // ✅ loop cadence: spawn AFTER the previous should be gone
    const gap = 0.10; // small breathing room between splats
    const interval = duration + gap;

    fx._nextAt = Number.isFinite(fx._nextAt) ? fx._nextAt : nowSec;
    if (nowSec < fx._nextAt) return;
    fx._nextAt = nowSec + interval;

    // ✅ correct layer host
    const target =
      getFxHost(fx.__host, layerVal ? "front" : "behind", "effect") ||
      fx.__host;

    // ✅ ONE AT A TIME: remove any existing splat in this host
    target.querySelectorAll(".fx-gekko-dizzy-pop").forEach(n => n.remove());

    // build root
    const root = document.createElement("div");
    root.className = "fx-gekko-dizzy-pop";
    root.style.setProperty("--dur", `${duration}s`);
    root.style.setProperty("--str", String(strength));
    root.style.setProperty("--soft", String(soft));

    const splash = document.createElement("div");
    splash.className = "fx-gekko-dizzy-splash";

    const droplets = document.createElement("div");
    droplets.className = "fx-gekko-dizzy-droplets";

    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");
      p.className = "fx-gekko-dizzy-drop";

      const a = (i / count) * Math.PI * 2;
      const jitter = (Math.sin(nowSec * 1000 + i * 77) * 0.5 + 0.5);

      const r   = (22 + jitter * 58) * strength;
      const sc  = (0.65 + jitter * 1.5) * strength;
      const rot = (jitter * 420);

      p.style.setProperty("--x", `${Math.cos(a) * r}px`);
      p.style.setProperty("--y", `${Math.sin(a) * r}px`);
      p.style.setProperty("--sc", sc.toFixed(3));
      p.style.setProperty("--rot", `${rot.toFixed(1)}deg`);

      droplets.appendChild(p);
    }

    root.appendChild(splash);
    root.appendChild(droplets);
    target.appendChild(root);

    // force replay
    root.classList.remove("play");
    void root.offsetWidth;
    requestAnimationFrame(() => root.classList.add("play"));

    // hard cleanup
    setTimeout(() => {
      if (root && root.parentNode) root.remove();
    }, Math.round(duration * 1000 + 220));
  },

  cleanup({ fx }) {
    if (fx) {
      fx.__host = null;
      fx._nextAt = 0;
      fx._tick = null;
    }
    document.querySelectorAll(".fx-gekko-dizzy-pop").forEach(n => n.remove());
  }
},

"fx_frame_gekko_globules_idle": {
  scope: "frame",
  params: ["size", "pulse", "bounce"],
  defaults: [0.8, 0.6, 0.6],

apply({ fx, host }) {

  const frame = host?.closest?.(".frame") || document.querySelector(".frame");
  if (!frame) return;

  let root = frame.querySelector(".fx-gekko-globules");

  if (!root) {

    root = document.createElement("div");
    root.className = "fx-gekko-globules";

    Object.assign(root.style, {
      position: "absolute",
      bottom: "16px",
      left: "50%",
      transform: "translateX(-50%)",
      display: "flex",
      alignItems: "flex-end",
      gap: "18px",
      pointerEvents: "none",
      zIndex: "9999"
    });

    frame.appendChild(root);

    const colors = ["blue", "yellow", "pink"];
    fx._blobs = [];

    colors.forEach(color => {

      const blob = document.createElement("div");
      blob.className = `gekko-blob ${color}`;

      // --- EYES ---
      const eyes = document.createElement("div");
      eyes.className = "gekko-eyes";

      for (let i = 0; i < 2; i++) {
        const eye = document.createElement("div");
        eye.className = "gekko-eye";
        eyes.appendChild(eye);
      }

      blob.appendChild(eyes);
      root.appendChild(blob);

      fx._blobs.push({
        el: blob,
        seed: Math.random() * 10,
        pulseSeed: Math.random() * 10
      });

    });
  }

  fx._root = root;
},

_tick(ctx, fx) {

  const t = ctx?.time ?? 0;

  const size   = fx.p?.[0] ?? 0.8;
  const pulse  = fx.p?.[1] ?? 0.6;
  const bounce = fx.p?.[2] ?? 0.6;

  const blobs = fx._blobs;
  if (!blobs) return;

  blobs.forEach(b => {

    const phase = t * 2 + b.seed;
    const pulsePhase = t * 1.5 + b.pulseSeed;

    const bounceY = Math.sin(phase) * 6 * bounce;
    const scale = 1 + Math.sin(pulsePhase) * 0.06 * pulse;

b.el.style.transform =
  `translateY(${-bounceY}px)
   scale(${scale * size})
   rotate(${Math.sin(phase)*2}deg)`;

  });
},

  cleanup({ fx }) {
    fx?._root?.remove();
    fx._root = null;
    fx._blobs = null;
  }
},
  // ======================
 // JETT
 // ======================
"fx_frame_jett_wind_shear": {
  scope: "frame",
  params: ["directionDeg", "count", "speed", "width", "opacity"],
  defaults: [45, 6, 1.2, 0.35, 0.6],

  // ==========================
  // BUILD DOM
  // ==========================
  apply({ fx, host }) {

    const fxHost = host; // frame-fx.front
    if (!fxHost) return;

    let wrap = fxHost.querySelector(".fx-jett-wind-shear");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "fx-jett-wind-shear";
      Object.assign(wrap.style, {
        position: "absolute",
        inset: "0",
        pointerEvents: "none"
      });
      fxHost.appendChild(wrap);
    }

    const count   = Math.max(1, Math.round(fx.p?.[1] ?? 6));
    const width   = fx.p?.[3] ?? 0.35;
    const opacity = fx.p?.[4] ?? 0.6;

    wrap.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "fx-jett-wind-streak";

      Object.assign(el.style, {
        position: "absolute",
        top: "0",
        left: `${(i + 0.5) / count * 100}%`,
        width: `${width * 40}px`,
        height: "100%",
        opacity,
        background:
          "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)",
        pointerEvents: "none",
        willChange: "transform"
      });

      wrap.appendChild(el);
    }

    fx._wrap = wrap; // store for tick
  },

  // ==========================
  // FRAME TICK
  // ==========================
  
_tick(a, fx) {

  // support both engine signatures
  let t;
  if (typeof a === "number") {
    t = a / 1000;
  } else if (a && typeof a === "object" && typeof a.time === "number") {
    t = a.time;
  } else {
    return;
  }

  const wrap = fx._wrap;
  if (!wrap) return;

  const direction = Number(fx.p?.[0]) || 45;
  const count     = Math.max(1, Math.round(Number(fx.p?.[1]) || 6));
  const speed     = Number(fx.p?.[2]) || 1.2;
  const width     = Number(fx.p?.[3]) || 0.35;
  const opacity   = Number(fx.p?.[4]) || 0.6;

  // ---------------------------------
  // Ensure correct streak count
  // ---------------------------------
  let streaks = wrap.querySelectorAll(".fx-jett-wind-streak");

  if (streaks.length !== count) {
    wrap.innerHTML = "";

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      el.className = "fx-jett-wind-streak";
      wrap.appendChild(el);
    }

    streaks = wrap.querySelectorAll(".fx-jett-wind-streak");
  }

  const rad = direction * (Math.PI / 180);

  streaks.forEach((el, i) => {

    // live style updates
    el.style.left   = `${(i + 0.5) / count * 100}%`;
    el.style.width  = `${width * 40}px`;
    el.style.opacity = opacity;

    el.style.height = "100%";
    el.style.position = "absolute";
    el.style.top = "0";
    el.style.background =
      "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), transparent)";
    el.style.pointerEvents = "none";
    el.style.willChange = "transform";

    const offset = i * 0.15;
    const progress = ((t * speed) + offset) % 1;
    const travel = (progress * 140) - 20;

    const x = Math.cos(rad) * travel;
    const y = Math.sin(rad) * travel;

    el.style.transform = `
  translate(${x}%, ${y}%)
  rotate(${direction}deg)
`;
  });
},

  // ==========================
  // CLEANUP
  // ==========================
  cleanup({ host, fx }) {

    const fxHost = host;
    if (!fxHost) return;

    fxHost.querySelector(".fx-jett-wind-shear")?.remove();

    fx._wrap = null;
  }
},


"fx_effect_jett_dash_burst": {
  scope: "effect",
  params: ["strength", "count", "duration", "softness", "spin", "layer"],
  defaults: [1.4, 8, 0.25, 0.35, 1, 0],

  // ==========================
  // BUILD
  // ==========================
  apply({ fx, host }) {

    const root = host?.closest?.(".frame") || host;
    root.querySelectorAll(".fx-jett-dash-burst").forEach(n => n.remove());

    const strength = fx.p?.[0] ?? 1.4;
    const count    = Math.max(4, Math.round(fx.p?.[1] ?? 8));
    const softness = fx.p?.[3] ?? 0.35;

    const burst = document.createElement("div");
    burst.className = "fx-jett-dash-burst";

    Object.assign(burst.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      overflow: "hidden",
      clipPath: "inset(0)",
      transformOrigin: "50% 50%",
      zIndex: 2
    });

    const rays = [];

    for (let i = 0; i < count; i++) {

      const ray = document.createElement("div");
      Object.assign(ray.style, {
        position: "absolute",
        left: "50%",
        top: "50%",
        width: `${1.2 + strength * 2.5}px`,
        height: `${260 * strength}px`,
        transformOrigin: "50% 100%",
        translate: "-50% -100%"
      });

      const inner = document.createElement("div");
      Object.assign(inner.style, {
        width: "100%",
        height: "100%",
        background: `
  linear-gradient(
    to top,
    rgba(255,255,255,${1.0 * strength}),
    rgba(255,255,255,${0.75 * strength}) 40%,
    rgba(255,255,255,${0.35 * strength}) 70%,
    transparent
  )
`,
filter: `blur(${1.5 + softness * 3 + strength * 2}px)`,
        transform: "scaleY(0)",
        transformOrigin: "50% 100%",
        opacity: 0
      });

      ray.appendChild(inner);
      burst.appendChild(ray);

      rays.push({ ray, inner });
    }

    const front  = root.querySelector(".frame-fx.front")  || root;
    const behind = root.querySelector(".frame-fx.behind") || root;
    (fx.p?.[5] ? front : behind).appendChild(burst);

    fx._burst = burst;
    fx._rays  = rays;
    fx._start = performance.now();
  },

  // ==========================
  // TICK
  // ==========================
_tick(a, fx) {

  // support both engine signatures
  let now;
  if (typeof a === "number") now = a;
  else if (a && typeof a === "object" && typeof a.time === "number") now = a.time * 1000;
  else return;

  // 🔒 fire once on enable
  if (fx.on && !fx._started) {
    fx._started = 1;
    fx._start = now;
  }

  if (!fx._started || !fx._burst || !fx._rays) return;

  const dur = (Number(fx.p?.[2]) || 0.25) * 1000;
  const p   = Math.min(1, (now - fx._start) / dur);

if (p >= 1) {

  fx._burst?.remove();
  fx._burst = null;
  fx._rays = null;

  // 🔁 restart automatically if still enabled
  if (fx.on) {
    this.apply({
      fx,
      host: document.querySelector(".frame")
    });
    fx._started = 1;
    fx._start = now;
  } else {
    fx._started = 0;
  }

  return;
}

  const spinSpeed = Number(fx.p?.[4]) || 1;
  const spin = (now / 1000) * 360 * spinSpeed;

  const scale = Math.max(0.15, p);
  const fade  = 1 - Math.pow(p, 1.25);

  const rays = fx._rays;
  const len  = rays.length;

  for (let i = 0; i < len; i++) {
    const { ray, inner } = rays[i];
    const angle = ((i + 0.5) / len) * 360 + spin;

    ray.style.transform = `rotate(${angle}deg)`;
    inner.style.transform = `scaleY(${scale})`;
    inner.style.opacity = fade;
  }
},
  // ==========================
  // CLEANUP
  // ==========================
  cleanup({ host }) {
    const root = host?.closest?.(".frame") || host;
    root.querySelectorAll(".fx-jett-dash-burst").forEach(n => n.remove());
  }
},


"fx_effect_jett_hover_drift": {
  scope: "effect",
  params: ["amplitude", "speed", "softness", "opacity"],
  defaults: [6, 0.6, 0.5, 0.25],

  apply({ fx, host }) {

    const art = host.querySelector(".frame-art-inner");
    if (!art) return;

    host.querySelectorAll(".fx-jett-hover-aura").forEach(n => n.remove());

    const aura = document.createElement("div");
    aura.className = "fx-jett-hover-aura";

    Object.assign(aura.style, {
      position: "absolute",
      inset: "-10px",
      pointerEvents: "none",
      borderRadius: "16px",
      mixBlendMode: "screen",
      background: `
        radial-gradient(circle at 30% 20%,
          rgba(255,255,255,0.35),
          rgba(255,255,255,0.15) 30%,
          transparent 65%
        ),
        radial-gradient(circle at 70% 80%,
          rgba(255,255,255,0.25),
          transparent 60%
        )
      `,
      backgroundSize: "160% 160%",
      backgroundPosition: "50% 50%"
    });

    art.parentElement.appendChild(aura);

    fx._art  = art;
    fx._aura = aura;
    fx._t    = Math.random() * 1000;
  },

  _tick(ctx, fx) {
;

    if (!fx.on || !fx._art || !fx._aura) return;

    const amp      = fx.p?.[0] ?? 6;
    const speed    = fx.p?.[1] ?? 0.6;
    const softness = fx.p?.[2] ?? 0.5;
    const opacity  = fx.p?.[3] ?? 0.25;

    fx._t += 0.016 * speed;

    // agent hover (unchanged)
    const y = Math.sin(fx._t * Math.PI * 2) * amp;
    const x = Math.sin(fx._t * Math.PI) * (amp * 0.25);

    fx._art.style.translate = `${x}px ${y}px`;

    // 🔑 RADIAL MOTION VIA DRIFT (ENGINE SAFE)
    const bx = 50 + Math.sin(fx._t * 1.3) * 20;
    const by = 50 + Math.cos(fx._t * 1.1) * 20;

    fx._aura.style.backgroundPosition = `${bx}% ${by}%`;
    fx._aura.style.filter = `blur(${6 + softness * 8}px)`;
    fx._aura.style.opacity = opacity * (0.6 + 0.4 * Math.sin(fx._t * Math.PI * 2));

    fx._aura.style.translate = `${x * 0.6}px ${y * 0.6}px`;
	
	fx._aura.style.backgroundPosition = `${bx}% ${by}%`;

requestAnimationFrame(() => {
});

  },

  cleanup({ host, fx }) {
    host.querySelectorAll(".fx-jett-hover-aura").forEach(n => n.remove());
    fx._art = fx._aura = null;
  }
},


// ======================
// F A D E
// ======================

/* ---------------------------------------------
 * FRAME — Fade Nightfall (Original Look Restored)
 * ------------------------------------------- */
"fx_frame_fade_nightfall": {
  scope: "frame",
  params: ["layer", "intensity", "drift", "pulseSpeed", "vignette"],
  defaults: [1, 0.85, 0.65, 0.55, 0.75],

  init({ fx, host }) {

    const frameEl = host?.closest(".frame") || document.querySelector(".frame");
    if (!frameEl) return;

    const layerIndex = fx.p?.[0] ?? 1;
    const layerWrap = frameEl.querySelector(
      layerIndex ? ".frame-fx.front" : ".frame-fx.behind"
    );
    if (!layerWrap) return;

    layerWrap.querySelectorAll(".fx-fade-nightfall-root").forEach(n => n.remove());

    const root = document.createElement("div");
    root.className = "fx-fade-nightfall-root is-loop";

    const fog  = document.createElement("div");
    fog.className = "fx-fade-nightfall-fog";

    const wave = document.createElement("div");
    wave.className = "fx-fade-nightfall-wave";

    const film = document.createElement("div");
    film.className = "fx-fade-nightfall-film";

    root.appendChild(fog);
    root.appendChild(wave);
    root.appendChild(film);

    layerWrap.appendChild(root);

    fx.__el = root;
    fx.__layerWrap = layerWrap;
    fx.__frame = frameEl;
  },

_tick(t, fx) {

  const el = fx.__el;
  if (!el) return;

  const intensity  = fx.p?.[1] ?? 0.85;
  const drift      = fx.p?.[2] ?? 0.65;
  const pulseSpeed = fx.p?.[3] ?? 0.55;
  const vignette   = fx.p?.[4] ?? 0.75;

  // only set reactive variables
  el.style.setProperty("--intensity", intensity.toFixed(3));
  el.style.setProperty("--drift", drift.toFixed(3));
  el.style.setProperty("--pulseSpeed", pulseSpeed.toFixed(3));
  el.style.setProperty("--vignette", vignette.toFixed(3));
},

  cleanup({ fx }) {
    if (fx.__el) fx.__el.remove();
    fx.__el = null;
    fx.__layerWrap = null;
    fx.__frame = null;
  }
},

"fx_frame_fade_nightmare_shroud": {
  scope: "frame",
  params: ["layer", "intensity", "crawl", "tendrils", "vignette"],
  defaults: [1, 0.95, 0.65, 0.85, 0.75],

init({ fx, host }) {

  const frameEl = host?.closest(".frame") || document.querySelector(".frame");
  if (!frameEl) return;

  const layer = fx.p?.[0] ?? 1;
  const layerWrap = frameEl.querySelector(
    layer ? ".frame-fx.front" : ".frame-fx.behind"
  );
  if (!layerWrap) return;

  layerWrap.querySelectorAll(".fx-fade-shroud-root").forEach(n => n.remove());

  const root = document.createElement("div");
  root.className = "fx-fade-shroud-root";

  const ink = document.createElement("div");
  ink.className = "fx-fade-shroud-ink";

  const tend = document.createElement("div");
  tend.className = "fx-fade-shroud-tendrils";

  const film = document.createElement("div");
  film.className = "fx-fade-shroud-film";

  root.appendChild(ink);
  root.appendChild(tend);
  root.appendChild(film);

  layerWrap.appendChild(root);

  fx.__el = root;
  fx.__layerWrap = layerWrap;
  fx.__frame = frameEl;
},

_tick(t, fx) {

  const el = fx.__el;
  if (!el) return;

  const layer     = fx.p?.[0] ?? 1;
  const intensity = fx.p?.[1] ?? 0.95;
  const crawl     = fx.p?.[2] ?? 0.65;
  const tendrils  = fx.p?.[3] ?? 0.85;
  const vignette  = fx.p?.[4] ?? 0.75;

  const frameEl = fx.__frame;
  if (!frameEl) return;

  const newWrap = frameEl.querySelector(
    layer ? ".frame-fx.front" : ".frame-fx.behind"
  );

  if (newWrap && fx.__layerWrap !== newWrap) {
    fx.__layerWrap = newWrap;
    newWrap.appendChild(el);
  }

  el.style.setProperty("--intensity", intensity.toFixed(3));
  el.style.setProperty("--crawl", crawl.toFixed(3));
  el.style.setProperty("--tendrils", tendrils.toFixed(3));
  el.style.setProperty("--vignette", vignette.toFixed(3));

  // smooth JS-driven crawl
  const dx = (t * 0.020 * (0.35 + crawl)) % 240;
  const dy = (t * 0.014 * (0.35 + crawl)) % 240;

  el.style.setProperty("--dx", dx.toFixed(2));
  el.style.setProperty("--dy", dy.toFixed(2));

  // breathing modulation
  const beat = 0.55 + 0.45 * Math.sin(t * (0.85 + crawl * 1.9));
  el.style.setProperty("--beat", beat.toFixed(3));
},

apply({ fx, host }) {
  if (!fx.__el) this.init({ fx, host });
},

cleanup({ fx }) {
  if (fx.__el) fx.__el.remove();
  fx.__el = null;
  fx.__layerWrap = null;
  fx.__frame = null;
}

},

"fx_effect_fade_dread_bloom": {
  scope: "effect",
  params: ["layer", "strength", "embers", "pulseSpeed", "smoke"],
  defaults: [1, 0.95, 0.65, 0.6, 0.85],

  apply({ fx, host, time }) {

    const layer      = fx.p?.[0] ?? 1;
    const strength   = fx.p?.[1] ?? 0.95;
    const embers     = fx.p?.[2] ?? 0.65;
    const pulseSpeed = fx.p?.[3] ?? 0.6;
    const smoke      = fx.p?.[4] ?? 0.85;

    // ✅ Resolve frame + correct layer wrap (no helper)
    const frameEl = host?.closest(".frame") || document.querySelector(".frame");
    if (!frameEl) return;

    const layerWrap = frameEl.querySelector(
      layer ? ".frame-fx.front" : ".frame-fx.behind"
    );
    if (!layerWrap) return;

    // ==========================
    // CREATE ROOT IF MISSING
    // ==========================
    if (!fx.__el || !fx.__el.isConnected) {

      const root = document.createElement("div");
      root.className = "fx-fade-bloom-root is-loop";

      const bloom = document.createElement("div");
      bloom.className = "fx-fade-bloom-core";

      const fog = document.createElement("div");
      fog.className = "fx-fade-bloom-fog";

      const motes = document.createElement("div");
      motes.className = "fx-fade-bloom-motes";

      root.appendChild(fog);
      root.appendChild(bloom);
      root.appendChild(motes);

      layerWrap.appendChild(root);

      fx.__el = root;
      fx.__layerWrap = layerWrap;

      // restart CSS loop safely
      root.classList.remove("is-loop");
      void root.offsetHeight;
      root.classList.add("is-loop");
    }

    // ==========================
    // LIVE LAYER SWITCH
    // ==========================
    if (fx.__layerWrap !== layerWrap && fx.__el) {
      fx.__layerWrap = layerWrap;
      layerWrap.appendChild(fx.__el);
    }

    // ==========================
    // SLIDERS
    // ==========================
    const el = fx.__el;

    el.style.setProperty("--strength", strength.toFixed(3));
    el.style.setProperty("--embers", embers.toFixed(3));
    el.style.setProperty("--pulse", pulseSpeed.toFixed(3));
    el.style.setProperty("--smoke", smoke.toFixed(3));

    // ==========================
    // SMOOTH DRIFT (continuous)
    // ==========================
    const dx = (time * 0.018 * (0.3 + smoke)) % 220;
    const dy = (time * 0.011 * (0.3 + smoke)) % 220;

    el.style.setProperty("--dx", dx.toFixed(2));
    el.style.setProperty("--dy", dy.toFixed(2));
  },

  cleanup({ fx }) {
    if (fx.__el) fx.__el.remove();
    fx.__el = null;
    fx.__layerWrap = null;
  }
},

// ======================
// D E A D L O C K
// ======================

/* ---------------------------------------------
 * FRAME — Winter Lock
 * ------------------------------------------- */
"fx_frame_deadlock_winter_lock": {
  scope: "effect",
  params: ["snow", "frost", "scan", "opacity"],
  defaults: [0.75, 0.55, 0.45, 0.7],

  // create once (or after DOM wipe)
  init({ fx, host }) {
    const layers = ensureFxLayers();
    if (!layers) return;

    // ✅ mount to FRONT effect bucket (persistent + above art)
    const L =
      layers.frontEffect ||
      layers.front?.querySelector?.(".fx-effect-layer") ||
      layers.fxFront?.querySelector?.(".fx-effect-layer") ||
      document.querySelector(".frame-fx.front .fx-effect-layer") ||
      document.querySelector(".frame-fx.front") ||
      host;

    if (!L) return;

    // remove stale duplicates
    L.querySelectorAll(".fx-deadlock-winter-root").forEach(n => n.remove());

    const root = document.createElement("div");
    root.className = "fx-deadlock-winter-root";
    root.innerHTML = `
      <div class="fx-deadlock-winter-frost"></div>
      <div class="fx-deadlock-winter-snow"></div>
      <div class="fx-deadlock-winter-scan"></div>
    `;

    L.appendChild(root);

    fx.__el = root;
    fx.__layerHost = L;
    fx.__hostArt = host;
    fx.__lastS = null; // seconds
  },

  _tick(arg, fx) {
    // ✅ support engine signatures:
    // - number ms
    // - seconds number
    // - { fx, time } where time is seconds
    let tSec;
    let F = fx;

    if (typeof arg === "number") {
      // heuristic: big numbers are ms
      tSec = (arg > 1000) ? (arg / 1000) : arg;
    } else if (arg && typeof arg === "object") {
      F = arg.fx || fx;
      const tt = Number(arg.time ?? arg.t ?? 0);
      tSec = (tt > 1000) ? (tt / 1000) : tt;
    } else {
      return;
    }

    if (!F) return;

    // ✅ if OFF: remove + stop
    if (!F.on) {
      if (F.__el) F.__el.remove();
      F.__el = null;
      F.__layerHost = null;
      F.__hostArt = null;
      F.__lastS = null;
      return;
    }

    // ✅ resolve host + layers (handles rebuilds)
    const host = F.__hostArt || window.__FRAME_FX_HOST || document.querySelector(".frame-art");
    if (!host) return;

    const layers = ensureFxLayers();
    if (!layers) return;

    const desiredHost =
      layers.frontEffect ||
      layers.front?.querySelector?.(".fx-effect-layer") ||
      document.querySelector(".frame-fx.front .fx-effect-layer") ||
      document.querySelector(".frame-fx.front");

    // init / re-init if needed
    if (!F.__el || !F.__el.isConnected) {
      this.init({ fx: F, host });
      if (!F.__el) return;
    }

    // re-parent if host changed
    if (desiredHost && F.__layerHost !== desiredHost) {
      F.__layerHost = desiredHost;
      desiredHost.appendChild(F.__el);
    }

    const root = F.__el;

    // params
    const snow  = Math.max(0, Math.min(1, F.p?.[0] ?? 0.75));
    const frost = Math.max(0, Math.min(1, F.p?.[1] ?? 0.55));
    const scan  = Math.max(0, Math.min(1, F.p?.[2] ?? 0.45));
    const op    = Math.max(0, Math.min(1, F.p?.[3] ?? 0.7));

    root.style.setProperty("--dl-snow",  snow.toFixed(3));
    root.style.setProperty("--dl-frost", frost.toFixed(3));
    root.style.setProperty("--dl-scan",  scan.toFixed(3));
    root.style.setProperty("--dl-op",    op.toFixed(3));

    // ✅ smooth drift: compute elapsed seconds
    const last = Number.isFinite(F.__lastS) ? F.__lastS : tSec;
    const dt = Math.min(0.05, Math.max(0, tSec - last)); // clamp
    F.__lastS = tSec;

    // accumulate positions so it never "snaps"
    F.__d1 = (F.__d1 ?? 0) + dt * (180 + snow * 240);  // px/sec
    F.__d2 = (F.__d2 ?? 0) + dt * (240 + snow * 320);  // px/sec

    root.style.setProperty("--dl-drift",  `${(F.__d1 % 2000).toFixed(2)}px`);
    root.style.setProperty("--dl-drift2", `${(F.__d2 % 2400).toFixed(2)}px`);
  },

apply({ fx, host, time }) {

  fx.__hostArt = host;

  if (!fx.__el || !fx.__el.isConnected) {
    this.init({ fx, host });
  }

  this._tick(time, fx);
},

  cleanup({ fx }) {
    if (fx?.__el) fx.__el.remove();
    if (fx) {
      fx.__el = null;
      fx.__layerHost = null;
      fx.__hostArt = null;
      fx.__lastS = null;
      fx.__d1 = 0;
      fx.__d2 = 0;
      fx._tick = null;
    }

    // extra safety: remove any strays
    document.querySelectorAll(".fx-deadlock-winter-root").forEach(n => n.remove());
  }
},


/* ---------------------------------------------
 * EFFECT — Deadlock GravNet Capture (Looping)
 * ------------------------------------------- */
"fx_effect_deadlock_gravnet_capture": {
  scope: "effect",
  loop: true,
  params: ["strength", "grid", "speed", "snow", "layer"],
  defaults: [1.0, 0.85, 0.75, 0.6, 1],

  init({ fx, host }) {
    ensureFxLayers();

    const layers = ensureFxLayers();
    if (!layers) return;

    const wantFront = (fx.p?.[4] ?? 1) ? true : false;

    const target = wantFront
      ? layers.frontEffect || layers.front
      : layers.behindEffect || layers.behind;

    if (!target) return;

    // remove stale
    target.querySelectorAll(".fx-deadlock-gravnet").forEach(n => n.remove());

    const root = document.createElement("div");
    root.className = "fx-deadlock-gravnet";
    root.innerHTML = `
      <div class="gravnet-snow"></div>
      <div class="gravnet-grid"></div>
      <div class="gravnet-vignette"></div>
    `;

    target.appendChild(root);

    fx.__el = root;
    fx.__hostArt = host;
    fx.__layerHost = target;
    fx.__lastS = null;
    fx.__accum = 0;
  },

  _tick(arg, fx) {
    let tSec;
    let F = fx;

    // ✅ support all engine signatures
    if (typeof arg === "number") {
      tSec = (arg > 1000) ? (arg / 1000) : arg;
    } else if (arg && typeof arg === "object") {
      F = arg.fx || fx;
      const tt = Number(arg.time ?? arg.t ?? 0);
      tSec = (tt > 1000) ? (tt / 1000) : tt;
    } else {
      return;
    }

    if (!F) return;

    if (!F.on) {
      if (F.__el) F.__el.remove();
      F.__el = null;
      F.__lastS = null;
      F.__accum = 0;
      return;
    }

    const host = F.__hostArt || window.__FRAME_FX_HOST || document.querySelector(".frame-art");
    if (!host) return;

    const layers = ensureFxLayers();
    if (!layers) return;

    const wantFront = (F.p?.[4] ?? 1) ? true : false;

    const desiredHost = wantFront
      ? layers.frontEffect || layers.front
      : layers.behindEffect || layers.behind;

    if (!desiredHost) return;

    // create if missing
    if (!F.__el || !F.__el.isConnected) {
      this.init({ fx: F, host });
      if (!F.__el) return;
    }

    // re-parent on layer change
    if (F.__layerHost !== desiredHost) {
      desiredHost.appendChild(F.__el);
      F.__layerHost = desiredHost;
    }

    const root = F.__el;

    const strength = Math.max(0, Math.min(2, F.p?.[0] ?? 1.0));
    const grid     = Math.max(0.15, Math.min(1.75, F.p?.[1] ?? 0.85));
    const speed    = Math.max(0.05, Math.min(3.0, F.p?.[2] ?? 0.75));
    const snow     = Math.max(0, Math.min(1, F.p?.[3] ?? 0.6));

    root.style.setProperty("--gn-strength", strength.toFixed(3));
    root.style.setProperty("--gn-grid",     grid.toFixed(3));
    root.style.setProperty("--gn-speed",    speed.toFixed(3));
    root.style.setProperty("--gn-snow",     snow.toFixed(3));

    // smooth accumulated time (stable loop)
    const last = Number.isFinite(F.__lastS) ? F.__lastS : tSec;
    const dt = Math.min(0.05, Math.max(0, tSec - last));
    F.__lastS = tSec;

    F.__accum = (F.__accum ?? 0) + dt * speed;

    root.style.setProperty("--gn-t", F.__accum.toFixed(4));
  },

apply({ fx, host, time }) {

  fx.__hostArt = host;

  if (!fx.__el || !fx.__el.isConnected) {
    this.init({ fx, host });
  }

  this._tick(time, fx);
},

  cleanup({ fx }) {
    if (fx?.__el) fx.__el.remove();

    if (fx) {
      fx.__el = null;
      fx.__hostArt = null;
      fx.__layerHost = null;
      fx.__lastS = null;
      fx.__accum = 0;
      fx._tick = null;
    }

    document.querySelectorAll(".fx-deadlock-gravnet").forEach(n => n.remove());
  }
},
/* ---------------------------------------------
 * ISO — Kill Contract (Shield → Shatter) [RECURRING]
 * ------------------------------------------- */
"fx_effect_iso_kill_contract": {
  scope: "effect",
  params: ["size", "shards", "cooldown", "layer"],
  defaults: [1.0, 22, 1.6, 1],

  apply({ fx, host, time }) {
    const size     = Math.max(0.6, Math.min(1.8, fx.p?.[0] ?? 1.0));
    const shardsN  = Math.max(8,  Math.min(60, Math.round(fx.p?.[1] ?? 22)));
    const cooldown = Math.max(0.35, Math.min(6.0, fx.p?.[2] ?? 1.6));
    const layer    = (fx.p?.[3] ?? 1) ? 1 : 0;

    const layers = ensureFxLayers?.();
    // ✅ CURRENT ENGINE: use effect layers, not layers.front/behind
    const target =
      layer ? (layers?.frontEffect  || host)
            : (layers?.behindEffect || host);

    if (!target) return;

    // ✅ recurring cooldown gate (apply may run every frame)
    fx._iso = fx._iso || {};
    if (fx._iso.next && time < fx._iso.next) return;
    fx._iso.next = time + cooldown; // set immediately to prevent double-fires same frame

    // cleanup any prior remnants in both effect layers
    const cleanupHosts = [
      host,
      layers?.frontEffect,
      layers?.behindEffect
    ].filter(Boolean);

    cleanupHosts.forEach(h => {
      if (h.querySelectorAll) {
        h.querySelectorAll(".fx-iso-kill, .fx-iso-shard").forEach(n => n.remove());
      }
    });

    // ---- SHIELD ----
    const shield = document.createElement("div");
    shield.className = "fx-iso-kill";
    Object.assign(shield.style, {
      position: "absolute",
      inset: "10%",
      borderRadius: "18px",
      pointerEvents: "none",
      transform: `scale(${0.96 * size})`,
      opacity: "0"
    });

    target.appendChild(shield);

    // shield “encase”
    shield.animate(
      [
        { opacity: 0, transform: `scale(${0.90 * size})` },
        { opacity: 1, transform: `scale(${1.00 * size})` }
      ],
      { duration: 220, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
    );

    const holdMs = 420;

    setTimeout(() => {
      if (!shield.isConnected) return;

      // crack flash + fade
      shield.animate(
        [
          { filter: "brightness(1)",   opacity: 1 },
          { filter: "brightness(1.7)", opacity: 1 },
          { filter: "brightness(1)",   opacity: 0 }
        ],
        { duration: 180, easing: "linear", fill: "forwards" }
      );

// pixel-space origin from shield center
const shieldRect = shield.getBoundingClientRect();
const targetRect = target.getBoundingClientRect();

const ox = shieldRect.left - targetRect.left + shieldRect.width  / 2;
const oy = shieldRect.top  - targetRect.top  + shieldRect.height / 2;

for (let i = 0; i < shardsN; i++) {

  const a  = (Math.PI * 2) * (i / shardsN) + (Math.random() * 0.35);
  const r  = 70 + Math.random() * 120;
  const dx = Math.cos(a) * r;
  const dy = Math.sin(a) * r;

  const w   = 10 + Math.random() * 22;
  const h   = 6  + Math.random() * 18;
  const rot = (Math.random() * 220 - 110);

  const shard = document.createElement("div");
  shard.className = "fx-iso-shard";

  Object.assign(shard.style, {
    position: "absolute",
    left: `${ox}px`,
    top:  `${oy}px`,
    width: `${w}px`,
    height:`${h}px`,
    opacity: "0.95",
    pointerEvents: "none",

    zIndex: "5",
    rotate: `${rot}deg`,

    clipPath: "polygon(50% 0%, 100% 35%, 75% 100%, 0% 65%)"
  });

  target.appendChild(shard);

  shard.animate(
    [
      { opacity: 1, translate: "0px 0px", scale: "0.75" },
      { opacity: 1, translate: `${dx * 0.35}px ${dy * 0.35}px`, scale: "1" },
      { opacity: 0, translate: `${dx}px ${dy}px`, scale: "0.95" }
    ],
    { duration: 520 + Math.random() * 280, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" }
  );

  setTimeout(() => shard.remove(), 1100);
}


      setTimeout(() => shield.remove(), 260);
    }, holdMs);
  },

  cleanup({ host }) {
    const layers = ensureFxLayers?.();
    [host, layers?.frontEffect, layers?.behindEffect].forEach(h => {
      if (h && h.querySelectorAll) {
        h.querySelectorAll(".fx-iso-kill, .fx-iso-shard").forEach(n => n.remove());
      }
    });
  }
},


/* ---------------------------------------------
 * ISO — Duel Focus (Orb → Shatter) [RECURRING]
 * ------------------------------------------- */
"fx_effect_iso_duel_focus": {
  scope: "effect",
  params: ["cooldown", "hold", "shards", "layer"],
  defaults: [1.8, 0.65, 18, 1],

  // ==========================
  // SETUP
  // ==========================
  apply({ fx }) {
    fx._iso = {
      nextAt: 0
    };
  },

  // ==========================
  // CONTINUOUS TICK
  // ==========================
  _tick(ctx, fx) {
    if (!fx.on) return;

    const t = ctx.time;

    const cooldown = Math.max(0.5, Math.min(6.0, fx.p?.[0] ?? 1.8));

    if (t < fx._iso.nextAt) return;
    fx._iso.nextAt = t + cooldown;

    spawnIsoOrb(ctx, fx, ctx.host);

  },

  // ==========================
  // CLEANUP
  // ==========================
  cleanup({ host, fx }) {
    const layers = ensureFxLayers?.();
    [host, layers?.frontEffect, layers?.behindEffect].forEach(h => {
      if (h && h.querySelectorAll) {
        h.querySelectorAll(".fx-iso-orb, .fx-iso-shard").forEach(n => n.remove());
      }
    });

    fx._iso = null;
  }
},

"fx_frame_tejo_tactical_scan": {
  scope: "frame",
  params: ["intensity", "scanSpeed", "gridSize", "glow", "layer"],
  defaults: [0.7, 1.2, 28, 0.8, 0],

  apply({ fx }) {

    const layers = ensureFxLayers();
    if (!layers) return;

    const target = fx.p?.[4] ? layers.front : layers.behind;

    let root = target.querySelector(".fx-tejo-scan");
    if (!root) {
      root = document.createElement("div");
      root.className = "fx-tejo-scan";
      target.appendChild(root);
    }

    fx._root = root;
  },

  _tick(ctx, fx) {
    if (!fx._root) return;

    const t = ctx.time;

    fx._root.style.setProperty("--i", fx.p?.[0] ?? 0.7);
    fx._root.style.setProperty("--grid", (fx.p?.[2] ?? 28) + "px");
    fx._root.style.setProperty("--glow", fx.p?.[3] ?? 0.8);

    const sweep = (t * 140 * (fx.p?.[1] ?? 1.2)) % 100;
    fx._root.style.setProperty("--sweep", sweep + "%");

    const drift = (t * 30) % 200;
    fx._root.style.setProperty("--drift", drift + "%");
  },

  cleanup({ fx }) {
    fx._root?.remove();
    fx._root = null;
  }
},

// ==============================
// TEJO — GUIDED SALVO (FRAME) — DROP-IN (ENGINE-CORRECT)
// - Matches your tickFrameFx calling style: def.apply(ctx), def._tick(ctx, fx)
// - Also tolerant of applyFrameFx binding style: def._tick(t, fx)
// - Owns DOM via fx._root
// - Full-frame SVG 1000x600 (center 500,300)
// - Thick ribbon computed using centerline normals
// ==============================
"fx_frame_tejo_guided_salvo_v2": {
scope:"frame",
params:["speed","smoke","impact","cooldown","layer"],
defaults:[1.0,40,120,1.5,1],

apply(ctx){

const fx = ctx.fx;
if(!fx) return;

const layers = ensureFxLayers?.();
if(!layers) return;

const p = Array.isArray(fx.p)?fx.p:(fx.p=this.defaults.slice());
const target = (p[4]??1)?layers.front:layers.behind;

/* create root */
if(!fx._root){

const root=document.createElement("div");

Object.assign(root.style,{
position:"absolute",
inset:"0",
pointerEvents:"none",
overflow:"visible",
zIndex: 50
});

target.appendChild(root);

fx._root=root;
fx._shots=[];
fx._particles=[];

/* create 7 missile sprites */
for(let i=-3;i<=3;i++){

const m=document.createElement("div");

Object.assign(m.style,{
position:"absolute",
width:"18px",
height:"5px",
background:"#e8e6df",
borderRadius:"3px",
pointerEvents:"none",
transformOrigin:"9px 2.5px"
});

root.appendChild(m);

fx._shots.push({
el:m,
lane:i,
t0:(ctx.time??performance.now()/1000)+(Math.random()*1.5)
});

}

}

},

_tick(ctx,fx){

if(!fx?.on || !fx._shots) return;

const now=(typeof ctx==="number")?ctx:(ctx?.time??performance.now()/1000);

const p=Array.isArray(fx.p)?fx.p:this.defaults.slice();

const speed=p[0];
const smokeAmount=p[1];
const impact=p[2];
const cooldown=p[3];

const fly=1.8/speed;

for(const s of fx._shots){

let t = now - s.t0;

/* reset cycle */
if(t > fly + cooldown){
s.t0 = now + Math.random()*1.2;
t = 0;
}

if(t <= fly){

const prog=t/fly;

const frame = fx._root.getBoundingClientRect();
const W = frame.width;
const H = frame.height;

/* spawn just outside frame */
const startX = s.lane < 0 ? -20 : W + 20;
const startY = -30 + s.lane * 14;

/* impact near bottom */
const endX = s.lane < 0 ? W * 0.75 : W * 0.25;
const endY = H + 10;

/* crossing control point */
const ctrlX = s.lane < 0 ? W * 0.85 : W * 0.15;
const ctrlY = H * 0.4 + s.lane * 10;

const omt=1-prog;

let x =
omt*omt*startX +
2*omt*prog*ctrlX +
prog*prog*endX;

let y =
omt*omt*startY +
2*omt*prog*ctrlY +
prog*prog*endY;

/* snake */
const dx=endX-startX;
const dy=endY-startY;
const len=Math.hypot(dx,dy)||1;

const nx=-dy/len;
const ny=dx/len;

x += nx*Math.sin(prog*Math.PI*3 + s.lane)*110*(0.2+0.8*prog);
y += ny*Math.sin(prog*Math.PI*3 + s.lane)*110*(0.2+0.8*prog);

/* direction */
const tx =
2*(1-prog)*(ctrlX-startX)+
2*prog*(endX-ctrlX);

const ty =
2*(1-prog)*(ctrlY-startY)+
2*prog*(endY-ctrlY);

const ang=Math.atan2(ty,tx)*180/Math.PI;

s.el.style.opacity=1;
s.el.style.transform=`translate(${x}px,${y}px) rotate(${ang}deg)`;

/* exhaust */
spawnFlame(x,y,fx);
spawnSmoke(x,y,smokeAmount,fx);

}else{

s.el.style.opacity=0;

if(!s._boom){

s._boom=true;

spawnExplosion(
s.lane<0?700:300,
560,
impact,
fx
);

}

}

}

if(fx._particles) updateParticles(fx);

},

cleanup(ctx){

const fx=ctx?.fx||ctx;
if(!fx) return;

fx._root?.remove();
fx._root=null;
fx._shots=null;
fx._particles=null;

}

},
/* ---------------------------------------------
 * FRAME — Veto Ult Transformation
 * ------------------------------------------- */
"fx_frame_veto_ult_transformation": {
  scope: "frame",

  params: [
    "speed",
    "arms",
    "thickness",
    "smoothness",
    "curl",
    "pull",
    "jagged",
    "branch",
    "density",
    "scale",
    "layer"
  ],

  defaults: [
    1.2,
    8,
    40,
    14,
    3.5,
    160,
    60,
    0.35,
    20,
    1.0,
    0
  ],

  apply({ fx, host }) {

    const frame = host?.closest?.(".frame") || document.querySelector(".frame");
    if (!frame) return;

    const behind = frame.querySelector(".frame-fx.behind");
    const front  = frame.querySelector(".frame-fx.front");
    const target = (fx.p?.[10] ?? 0) ? front : behind;

    if (fx._root && fx._root.parentNode !== target) {
      fx._root.remove();
      fx._root = null;
    }

    if (!fx._root) {

      const root = document.createElement("div");
      root.className = "fx-veto-ult";

      Object.assign(root.style,{
        position:"absolute",
        inset:"-14px",
        pointerEvents:"none"
      });

      const svgNS="http://www.w3.org/2000/svg";

      const svg=document.createElementNS(svgNS,"svg");
      svg.setAttribute("viewBox","0 0 1000 600");
      svg.style.width="100%";
      svg.style.height="100%";
      svg.style.background="#00FFFF";

      root.appendChild(svg);
      target.appendChild(root);

      fx._root=root;
      fx._svg=svg;

      // deterministic branch seeds
      fx._branchSeeds = [];

      for(let i=0;i<64;i++){
        fx._branchSeeds.push(Math.random());
      }
    }

  },

_tick(ctx,fx){
	
  if(!fx?.on || !fx._svg) return;

  const p = fx.p || [];

  const speed      = p[0] ?? 1.2;
  const arms       = Math.max(1, Math.floor(p[1] ?? 8));
  const thickness = fx.p?.[2] ?? 40;

  const smoothness = Math.floor(p[3] ?? 14);
  const curl       = p[4] ?? 3.5;
  const pull       = p[5] ?? 160;
  const jagged     = p[6] ?? 60;
  const branch     = p[7] ?? 0.35;
  const density = Math.max(3, Math.floor(p[8] ?? 20));
  const scale      = p[9] ?? 1;

  const t = ctx?.time ?? performance.now()/1000;

  const cx = 500;
  const cy = 300;

  const maxRadius = 900;

  const svg = fx._svg;

  while(svg.firstChild) svg.removeChild(svg.firstChild);

  // background field
  const base = document.createElementNS(svg.namespaceURI,"rect");
  base.setAttribute("width","1000");
  base.setAttribute("height","600");
  base.setAttribute("fill","#00FFFF");
  svg.appendChild(base);

  for(let a=0; a<arms; a++){

    const path = document.createElementNS(svg.namespaceURI,"path");
    path.setAttribute("fill", a%2 ? "#000" : "#00D8DE");

    const center = [];
    const outer  = [];

    // ===== CENTER SPIRAL =====
    for(let i=0;i<density;i++){

      const prog = i/density;

      const r = maxRadius - prog*maxRadius - ((t*speed*pull) % maxRadius);

      const angle =
        a*(Math.PI*2/arms) +
        prog*curl +
        t*speed*0.4;

      const jitter = Math.sin(i*13.7 + a*5) * jagged;

      const x = cx + Math.cos(angle) * (r + jitter);
      const y = cy + Math.sin(angle) * (r + jitter);

      center.push([x,y]);
    }

    // ===== OUTER EDGE =====
    for(let i=0;i<center.length;i++){

      const pt   = center[i];
      const prev = center[Math.max(i-1,0)];

      const dx = pt[0] - prev[0];
      const dy = pt[1] - prev[1];

      const len = Math.sqrt(dx*dx + dy*dy) || 1;

      const nx = -dy/len;
      const ny =  dx/len;

      outer.push([
        pt[0] + nx*thickness,
        pt[1] + ny*thickness
      ]);
    }
if (!center.length || !outer.length) continue;
    // ===== PATH BUILD =====
    let d = "";

    d += "M " + center[0][0] + " " + center[0][1];

    for(let i=1;i<center.length;i++){
      d += " L " + center[i][0] + " " + center[i][1];
    }

    for(let i=outer.length-1;i>=0;i--){
      d += " L " + outer[i][0] + " " + outer[i][1];
    }

    d += " Z";

    path.setAttribute("d", d);
    svg.appendChild(path);

    // ===== BRANCH PLATES =====
    if(fx._branchSeeds && fx._branchSeeds[a] < branch){

      const branchPath = document.createElementNS(svg.namespaceURI,"path");

      branchPath.setAttribute("fill","#000");
      branchPath.setAttribute(
        "transform",
        "rotate(" + (a*360/arms) + " 500 300)"
      );

      branchPath.setAttribute("d", d);

      svg.appendChild(branchPath);
    }

  }
  
// ==========================
// VORTEX PLATES (angular shards)
// ==========================

for (let a = 0; a < arms; a++) {

  const plate = document.createElementNS(svg.namespaceURI,"path");

  const baseAngle = (a / arms) * Math.PI * 2;
  const jitter = Math.sin(a * 7 + t * speed) * jagged;

  const baseInner = 40 + Math.sin(t * speed * 2 + a) * 20;

const rOuter = 900;
const rInner = baseInner + thickness;

  const curlAngle = baseAngle + t * speed;

  const spread = 0.015 + thickness * 0.0008;

  const a1 = curlAngle - spread;
  const a2 = curlAngle + spread;

  const x1 = cx + Math.cos(a1) * rOuter;
  const y1 = cy + Math.sin(a1) * rOuter;

  const x2 = cx + Math.cos(a2) * rOuter;
  const y2 = cy + Math.sin(a2) * rOuter;

  const x3 = cx + Math.cos(a2 + curl * 0.4) * rInner;
  const y3 = cy + Math.sin(a2 + curl * 0.4) * rInner;

  const x4 = cx + Math.cos(a1 + curl * 0.4) * rInner;
  const y4 = cy + Math.sin(a1 + curl * 0.4) * rInner;

  const d =
    "M " + x1 + " " + y1 +
    " L " + x2 + " " + y2 +
    " L " + x3 + " " + y3 +
    " L " + x4 + " " + y4 +
    " Z";

  plate.setAttribute("d", d);
  plate.setAttribute("fill", a % 2 ? "#000000" : "#00D8DE");

  svg.appendChild(plate);
}

// ==========================
// FINAL SCALE
// ==========================

svg.style.transform = "scale(" + scale + ")";

},
  cleanup({fx}){
    fx?._root?.remove();
    fx._root=null;
    fx._svg=null;
  }

},




"fx_frame_vyse_alloy_flow": {
  scope: "frame",
  params: ["flowSpeed", "metallic", "intensity", "layer"],
  defaults: [1.0, 0.7, 0.8, 0],

  apply({ fx }) {

    const layers = ensureFxLayers();
    if (!layers) return;

    const target = fx.p?.[3] ? layers.front : layers.behind;

    let root = target.querySelector(".fx-vyse-alloy");
    if (!root) {
      root = document.createElement("div");
      root.className = "fx-vyse-alloy";
      target.appendChild(root);
    }

    fx._root = root;
  },

  _tick(time, fx) {
    if (!fx._root) return;

    const t = (time > 1000) ? time / 1000 : time;

    const flow = (t * 100 * (fx.p?.[0] ?? 1)) % 200;

    fx._root.style.setProperty("--flow", flow + "%");
    fx._root.style.setProperty("--metal", fx.p?.[1] ?? 0.7);
    fx._root.style.setProperty("--i", fx.p?.[2] ?? 0.8);
  },

  cleanup({ fx }) {
    fx._root?.remove();
    fx._root = null;
  }
},

/* ---------------------------------------------
 * EFFECT — Vyse Arc Rose 1
 * ------------------------------------------- */
"fx_effect_vyse_arc_rose": {
  scope: "effect",
  params: ["size", "speed", "x", "y", "layer"],
  defaults: [1.0, 0.6, 0, 0, 1],

  apply({ fx }) {

    const layers = ensureFxLayers();
    if (!layers) return;

    const target = (fx.p?.[4] ?? 1) ? layers.front : layers.behind;

    // Move instance if layer changed
    if (fx._root && fx._root.parentNode !== target) {
      fx._root.remove();
      fx._root = null;
    }

    if (!fx._root) {

      const root = document.createElement("div");
      root.className = "fx-arc-rose";

      root.innerHTML = `
        <svg viewBox="0 0 200 200" class="arc-rose-svg">

          <defs>

            <!-- Chrome -->
            <linearGradient id="arChrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="20%" stop-color="#cfcfd6"/>
              <stop offset="45%" stop-color="#ffffff"/>
              <stop offset="75%" stop-color="#b8b8b8"/>
              <stop offset="100%" stop-color="#f0f0f0"/>
            </linearGradient>

            <linearGradient id="arChromeShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
              <stop offset="50%" stop-color="rgba(255,255,255,0.85)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </linearGradient>

            <linearGradient id="arChromeEdge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="rgba(80,80,95,0.6)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0.6)"/>
            </linearGradient>

            <!-- Core -->
            <radialGradient id="arCore" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stop-color="#ff66cc"/>
              <stop offset="35%" stop-color="#a84cff"/>
              <stop offset="75%" stop-color="#450070"/>
              <stop offset="100%" stop-color="#160020"/>
            </radialGradient>

          </defs>

          <!-- Chrome Leaves -->
          <g class="ar-blades">

            <g class="blade-group">
              <path class="blade-base"
                d="M100 28
                   C118 40 132 65 130 88
                   C128 105 112 100 100 90
                   C88 100 72 105 70 88
                   C68 65 82 40 100 28 Z"
                fill="url(#arChrome)"/>

              <path class="blade-highlight"
                d="M100 28
                   C118 40 132 65 130 88
                   C128 105 112 100 100 90
                   C88 100 72 105 70 88
                   C68 65 82 40 100 28 Z"
                fill="url(#arChromeShine)"/>

              <path class="blade-edge"
                d="M100 28
                   C118 40 132 65 130 88
                   C128 105 112 100 100 90
                   C88 100 72 105 70 88
                   C68 65 82 40 100 28 Z"
                fill="none"
                stroke="url(#arChromeEdge)"
                stroke-width="2"/>
            </g>

            <g class="blade-group"></g>
            <g class="blade-group"></g>

          </g>

          <!-- Core Disk -->
          <circle cx="100" cy="100" r="46"
                  fill="url(#arCore)"
                  stroke="#8c2cff"
                  stroke-width="4"/>

          <!-- Carved Spiral -->
          <path class="spiral-groove"
            d="M100 72
               C130 72 142 95 130 115
               C118 135 85 138 72 120
               C58 100 70 78 92 78
               C112 78 120 95 110 108
               C100 120 82 115 80 102
               C78 92 86 85 96 85
               C104 85 108 92 104 98"
            fill="none"
            stroke="rgba(0,0,0,0.65)"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

        </svg>
      `;

      target.appendChild(root);

      // Clone blade geometry
      const blades = root.querySelectorAll(".blade-group");
      if (blades.length === 3) {
        blades[1].innerHTML = blades[0].innerHTML;
        blades[2].innerHTML = blades[0].innerHTML;
      }

      fx._root = root;

      fx._parts = {
        svg: root.querySelector(".arc-rose-svg"),
        blades: root.querySelectorAll(".blade-group")
      };

      fx._angle = 0;
      fx._bloom = 0;
    }
  },

  _tick(ctx, fx) {
    if (!fx.on || !fx._parts?.svg) return;

    const size  = fx.p?.[0] ?? 1;
    const speed = fx.p?.[1] ?? 0.6;
    const x     = fx.p?.[2] ?? 0;
    const y     = fx.p?.[3] ?? 0;

    fx._angle += 0.25 * speed;
    fx._bloom += 0.02 * speed;

    const bloom = 6 + Math.sin(fx._bloom) * 8;

    fx._parts.blades.forEach((blade, i) => {
      blade.setAttribute(
        "transform",
        `
        translate(100 100)
        rotate(${i * 120})
        translate(0 ${-bloom})
        rotate(${Math.sin(fx._bloom) * 8})
        translate(-100 -100)
        `
      );
    });

    fx._parts.svg.style.transform =
      `
      translate(-50%, -50%)
      translate(${x}px, ${y}px)
      rotate(${fx._angle}deg)
      scale(${size})
      `;
  },

  cleanup({ fx }) {
    if (fx?._root) {
      fx._root.remove();
      fx._root = null;
      fx._parts = null;
    }
  }
},

/* ---------------------------------------------
 * EFFECT — Vyse Arc Rose 2
 * ------------------------------------------- */
"fx_effect_vyse_arc_rose_2": {
  scope: "effect",
  params: ["size", "speed", "x", "y", "layer"],
  defaults: [1.0, 0.6, 0, 0, 1],

  apply({ fx }) {

    const layers = ensureFxLayers();
    if (!layers) return;

    const target = (fx.p?.[4] ?? 1) ? layers.front : layers.behind;

    // Move instance if layer changed
    if (fx._root && fx._root.parentNode !== target) {
      fx._root.remove();
      fx._root = null;
    }

    if (!fx._root) {

      const root = document.createElement("div");
      root.className = "fx-arc-rose";

      root.innerHTML = `
        <svg viewBox="0 0 200 200" class="arc-rose-svg">

          <defs>

            <!-- Chrome -->
            <linearGradient id="arChrome" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="20%" stop-color="#cfcfd6"/>
              <stop offset="45%" stop-color="#ffffff"/>
              <stop offset="75%" stop-color="#b8b8b8"/>
              <stop offset="100%" stop-color="#f0f0f0"/>
            </linearGradient>

            <linearGradient id="arChromeShine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,0)"/>
              <stop offset="50%" stop-color="rgba(255,255,255,0.85)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
            </linearGradient>

            <linearGradient id="arChromeEdge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="rgba(80,80,95,0.6)"/>
              <stop offset="100%" stop-color="rgba(255,255,255,0.6)"/>
            </linearGradient>

            <!-- Core -->
            <radialGradient id="arCore" cx="50%" cy="45%" r="65%">
              <stop offset="0%" stop-color="#ff66cc"/>
              <stop offset="35%" stop-color="#a84cff"/>
              <stop offset="75%" stop-color="#450070"/>
              <stop offset="100%" stop-color="#160020"/>
            </radialGradient>

          </defs>

          <!-- Chrome Leaves -->
          <g class="ar-blades">

            <g class="blade-group">
              <path class="blade-base"
                d="M100 28
                   C118 40 132 65 130 88
                   C128 105 112 100 100 90
                   C88 100 72 105 70 88
                   C68 65 82 40 100 28 Z"
                fill="url(#arChrome)"/>

              <path class="blade-highlight"
                d="M100 28
                   C118 40 132 65 130 88
                   C128 105 112 100 100 90
                   C88 100 72 105 70 88
                   C68 65 82 40 100 28 Z"
                fill="url(#arChromeShine)"/>

              <path class="blade-edge"
                d="M100 28
                   C118 40 132 65 130 88
                   C128 105 112 100 100 90
                   C88 100 72 105 70 88
                   C68 65 82 40 100 28 Z"
                fill="none"
                stroke="url(#arChromeEdge)"
                stroke-width="2"/>
            </g>

            <g class="blade-group"></g>
            <g class="blade-group"></g>

          </g>

          <!-- Core Disk -->
          <circle cx="100" cy="100" r="46"
                  fill="url(#arCore)"
                  stroke="#8c2cff"
                  stroke-width="4"/>

          <!-- Carved Spiral -->
          <path class="spiral-groove"
            d="M100 72
               C130 72 142 95 130 115
               C118 135 85 138 72 120
               C58 100 70 78 92 78
               C112 78 120 95 110 108
               C100 120 82 115 80 102
               C78 92 86 85 96 85
               C104 85 108 92 104 98"
            fill="none"
            stroke="rgba(0,0,0,0.65)"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
          />

        </svg>
      `;

      target.appendChild(root);

      // Clone blade geometry
      const blades = root.querySelectorAll(".blade-group");
      if (blades.length === 3) {
        blades[1].innerHTML = blades[0].innerHTML;
        blades[2].innerHTML = blades[0].innerHTML;
      }

      fx._root = root;

      fx._parts = {
        svg: root.querySelector(".arc-rose-svg"),
        blades: root.querySelectorAll(".blade-group")
      };

      fx._angle = 0;
      fx._bloom = 0;
    }
  },

  _tick(ctx, fx) {
    if (!fx.on || !fx._parts?.svg) return;

    const size  = fx.p?.[0] ?? 1;
    const speed = fx.p?.[1] ?? 0.6;
    const x     = fx.p?.[2] ?? 0;
    const y     = fx.p?.[3] ?? 0;

    fx._angle += 0.25 * speed;
    fx._bloom += 0.02 * speed;

    const bloom = 6 + Math.sin(fx._bloom) * 8;

    fx._parts.blades.forEach((blade, i) => {
      blade.setAttribute(
        "transform",
        `
        translate(100 100)
        rotate(${i * 120})
        translate(0 ${-bloom})
        rotate(${Math.sin(fx._bloom) * 8})
        translate(-100 -100)
        `
      );
    });

    fx._parts.svg.style.transform =
      `
      translate(-50%, -50%)
      translate(${x}px, ${y}px)
      rotate(${fx._angle}deg)
      scale(${size})
      `;
  },

  cleanup({ fx }) {
    if (fx?._root) {
      fx._root.remove();
      fx._root = null;
      fx._parts = null;
    }
  }
},

/* ---------------------------------------------
 * EFFECT — Veto Shard Orb (Spiral Shell, PNG-style)
 * ------------------------------------------- */
"fx_effect_veto_void_orb": {
  scope: "effect",
  params: ["size", "speed", "x", "y", "layer"],
  defaults: [1.0, 0.7, 0, 0, 1],

  apply({ fx }) {

    const layers = ensureFxLayers();
    if (!layers) return;

    const target = (fx.p?.[4] ?? 1) ? layers.front : layers.behind;

    // move instance if layer changes
    if (fx._root && fx._root.parentNode !== target) {
      fx._root.remove();
      fx._root = null;
    }

    if (!fx._root) {
      const root = document.createElement("div");
      root.className = "fx-veto-orb";

      root.innerHTML = `
        <svg viewBox="0 0 200 200" class="veto-orb-svg" aria-hidden="true">

          <defs>
            <!-- energy -->
            <radialGradient id="voEnergy" cx="45%" cy="40%" r="70%">
              <stop offset="0%"   stop-color="#c9ffff"/>
              <stop offset="35%"  stop-color="#00ffff"/>
              <stop offset="70%"  stop-color="#00cfd6"/>
              <stop offset="100%" stop-color="#00484d"/>
            </radialGradient>

            <!-- soft energy haze -->
<radialGradient id="voEnergy" cx="45%" cy="40%" r="70%">
  <stop offset="0%"   stop-color="#fff8a6"/>
  <stop offset="20%"  stop-color="#ffe766"/>
  <stop offset="40%"  stop-color="#00ffff"/>
  <stop offset="75%"  stop-color="#00cfd6"/>
  <stop offset="100%" stop-color="#00484d"/>
</radialGradient>
            <!-- shell shading -->
            <linearGradient id="voShell" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stop-color="#2a2a35"/>
              <stop offset="35%"  stop-color="#13131b"/>
              <stop offset="70%"  stop-color="#0a0a10"/>
              <stop offset="100%" stop-color="#30303a"/>
            </linearGradient>

            <linearGradient id="voShellEdge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
              <stop offset="55%" stop-color="rgba(255,255,255,0.0)"/>
              <stop offset="100%" stop-color="rgba(0,0,0,0.25)"/>
            </linearGradient>
          </defs>

          <!-- cyan haze behind -->
          <circle cx="100" cy="100" r="68" fill="url(#voHaze)"/>

          <!-- core -->
          <ellipse cx="102" cy="104" rx="52" ry="46" fill="url(#voEnergy)" class="vo-core"/>

          <!-- spiral shell plates (PNG-like wrap) -->
          <g class="vo-shell">

            <!-- TOP PLATE -->
            <path fill="url(#voShell)" fill-rule="evenodd" d="
              M58 52
              C78 30 130 30 154 58
              C166 72 170 86 168 96
              C160 92 150 90 140 92
              C144 80 140 70 130 62
              C114 50 86 50 72 62
              C66 66 62 72 60 80
              C54 76 50 70 50 64
              C50 60 52 56 58 52
              Z

              M76 64
              C90 50 114 50 128 64
              C140 76 140 90 128 98
              C120 104 108 106 100 104
              C92 102 84 96 80 90
              C74 82 72 72 76 64
              Z
            "/>
            <path d="M58 52 C78 30 130 30 154 58" stroke="url(#voShellEdge)" stroke-width="6" opacity="0.35" fill="none"/>

            <!-- RIGHT PLATE -->
            <path fill="url(#voShell)" fill-rule="evenodd" d="
              M150 66
              C176 92 174 142 142 166
              C128 176 112 178 102 174
              C110 168 116 160 118 150
              C130 156 142 152 150 140
              C160 126 160 104 148 90
              C142 82 134 78 126 78
              C128 72 132 66 138 62
              C142 60 146 62 150 66
              Z

              M138 98
              C150 112 150 126 140 138
              C132 148 120 150 110 146
              C100 142 94 132 94 122
              C94 112 100 102 110 98
              C120 94 132 92 138 98
              Z
            "/>
            <path d="M150 66 C176 92 174 142 142 166" stroke="url(#voShellEdge)" stroke-width="6" opacity="0.35" fill="none"/>

            <!-- BOTTOM-LEFT PLATE -->
            <path fill="url(#voShell)" fill-rule="evenodd" d="
              M60 150
              C36 126 34 88 62 66
              C70 60 78 56 86 56
              C80 64 78 74 80 84
              C70 82 62 86 56 96
              C48 110 50 132 62 144
              C72 154 86 156 98 150
              C100 160 96 168 88 174
              C78 180 68 170 60 150
              Z

              M74 134
              C62 120 62 108 70 98
              C78 88 92 86 104 92
              C114 98 120 110 118 122
              C116 134 106 144 94 144
              C86 144 80 140 74 134
              Z
            "/>
            <path d="M60 150 C36 126 34 88 62 66" stroke="url(#voShellEdge)" stroke-width="6" opacity="0.35" fill="none"/>

          </g>

          <!-- white “band” highlight like PNG -->
          <path class="vo-band" d="
            M82 108
            C90 96 112 92 124 104
            C130 110 132 116 128 122
            C120 134 98 138 86 126
            C80 120 78 114 82 108
            Z
          " fill="#ffd84d" opacity="0.95"/>

        </svg>
      `;

      target.appendChild(root);

      fx._root = root;
      fx._parts = {
        svg: root.querySelector(".veto-orb-svg"),
        core: root.querySelector(".vo-core"),
        band: root.querySelector(".vo-band")
      };

      fx._angle = 0;
      fx._pulse = Math.random() * 10;
    }
  },

  _tick(ctx, fx) {
    if (!fx.on || !fx._parts?.svg) return;

    const size  = fx.p?.[0] ?? 1.0;
    const speed = fx.p?.[1] ?? 0.7;
    const x     = fx.p?.[2] ?? 0;
    const y     = fx.p?.[3] ?? 0;

    // time-safe
    const t = (ctx?.time != null) ? ctx.time : (performance.now() / 1000);

    // flat spin + pulse (like PNG “alive” feel)
    fx._angle += 0.55 * speed;
    fx._pulse = (fx._pulse ?? 0) + 0.9 * speed;

    const p = 0.92 + Math.sin(fx._pulse) * 0.06;
    const glow = 0.65 + Math.sin(fx._pulse + 1.2) * 0.25;

    fx._parts.svg.style.transform =
      `translate(-50%,-50%) translate(${x}px, ${y}px) rotate(${fx._angle}deg) scale(${size * p})`;

    // energy “breath”
    fx._parts.core.style.filter = `drop-shadow(0 0 ${18 * glow}px rgba(0,255,255,0.85))`;
    fx._parts.band.style.opacity = String(0.85 + glow * 0.25);
  },

  cleanup({ fx }) {
    fx?._root?.remove();
    if (fx) {
      fx._root = null;
      fx._parts = null;
      fx._angle = 0;
      fx._pulse = 0;
    }
  }
},

"fx_frame_vyse_razor_vines": {

scope:"frame",
params:["wires","barbs","speed","tangle","thickness","layer"],
defaults:[7,10,1.0,1.0,2,1],

apply(ctx){

const fx=ctx.fx;
if(!fx) return;

const layers=ensureFxLayers?.();
if(!layers) return;

const p=Array.isArray(fx.p)?fx.p:(fx.p=this.defaults.slice());
const target=(p[5]??1)?layers.front:layers.behind;

if(!fx._root){

const root=document.createElement("div");
target.appendChild(root);

const zone=document.createElement("div");

Object.assign(zone.style,{
position:"absolute",
left:"0",
right:"0",
bottom:"0",
height:"80px",
pointerEvents:"none",
overflow:"visible"
});

root.appendChild(zone);

const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
svg.setAttribute("viewBox","0 0 1000 80");

Object.assign(svg.style,{
width:"100%",
height:"100%"
});

zone.appendChild(svg);

fx._root=root;
fx._zone=zone;
fx._svg=svg;
fx._wires=[];

}

if(fx._root.parentElement!==target){
fx._root.remove();
target.appendChild(fx._root);
}

const wireCount=Math.max(2,Math.min(14,Math.floor(p[0])));

/* rebuild wires if slider changed */
if(!fx._wires || fx._wires.length!==wireCount){

fx._svg.textContent="";
fx._wires=[];

for(let i=0;i<wireCount;i++){

const path=document.createElementNS("http://www.w3.org/2000/svg","path");

const barbGroup=document.createElementNS("http://www.w3.org/2000/svg","g");

fx._svg.appendChild(path);
fx._svg.appendChild(barbGroup);

fx._wires.push({
path,
barbGroup,
lane:i,
phase:i*0.8,
barbs:null
});

}

}

},

_tick(ctx,fx){

if(!fx?.on||!fx._wires) return;

const now=(typeof ctx==="number")?ctx:(ctx?.time??performance.now()/1000);

const p=Array.isArray(fx.p)?fx.p:this.defaults.slice();

const barbCount=Math.max(2,Math.floor(p[1]));
const speed=p[2];
const tangle=p[3];
const thickness=Math.max(1,p[4]);

for(const w of fx._wires){

let d="";
const pts=40;
const baseY=70-(w.lane*6);

const positions=[];

for(let i=0;i<=pts;i++){

const x=i*(1000/pts);

const snake=Math.sin(i*0.45+now*1.6+w.phase)*16*tangle;
const cross=Math.sin(i*0.25+now*2.2+w.lane)*10*tangle;

const y=baseY+snake+cross;

positions.push({x,y});

if(i===0)d+=`M ${x} ${y}`;
else d+=` L ${x} ${y}`;

}

w.path.setAttribute("d",d);
w.path.setAttribute("stroke","#bcbcbc");
w.path.setAttribute("stroke-width",thickness);
w.path.setAttribute("fill","none");

/* rebuild barbs when slider changes */
if(!w.barbs||w.barbs.length!==barbCount){

w.barbGroup.textContent="";
w.barbs=[];

for(let i=0;i<barbCount;i++){

const barb=document.createElementNS("http://www.w3.org/2000/svg","path");

barb.setAttribute("stroke","#e0e0e0");
barb.setAttribute("fill","none");

w.barbGroup.appendChild(barb);
w.barbs.push(barb);

}

}

/* move barbs */
const scroll=(now*speed*2+w.phase)%1;

for(let i=0;i<w.barbs.length;i++){

const t=(i/w.barbs.length+scroll)%1;
const idx=Math.floor(t*(positions.length-1));

const p1=positions[idx];
const p2=positions[Math.min(idx+1,positions.length-1)];

const ang=Math.atan2(p2.y-p1.y,p2.x-p1.x);

const size=5+thickness*1.5;

const x1=p1.x+Math.cos(ang+1.7)*size;
const y1=p1.y+Math.sin(ang+1.7)*size;

const x2=p1.x+Math.cos(ang-1.7)*size;
const y2=p1.y+Math.sin(ang-1.7)*size;

w.barbs[i].setAttribute(
"d",
`M ${x1} ${y1} L ${p1.x} ${p1.y} L ${x2} ${y2}`
);

w.barbs[i].setAttribute("stroke-width",thickness);

}

}

},

cleanup(ctx){

const fx=ctx?.fx||ctx;
if(!fx)return;

fx._root?.remove();
fx._root=null;
fx._svg=null;
fx._zone=null;
fx._wires=null;

}

},
"fx_frame_reyna_dismiss_veil": {
  scope: "frame",
  params: ["darkness", "veinIntensity", "speed", "veinCount"],
  defaults: [0.85, 0.9, 1.0, 12],

  // ==========================================
  // BUILD
  // ==========================================
  apply({ fx, host }) {

    const root = host?.closest?.(".frame") || host;
    if (!root) return;

    const art = root.querySelector(".frame-art-inner");
    if (!art) return;

    fx._art  = art;
    fx._host = host;

    // remove old veil
    root.querySelectorAll(".fx-reyna-veil").forEach(n => n.remove());

    const veil = document.createElement("div");
    veil.className = "fx-reyna-veil";

    Object.assign(veil.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      mixBlendMode: "multiply",
      transformOrigin: "50% 50%",
      background:
        "linear-gradient(180deg, rgba(8,0,18,0.95), rgba(45,0,80,0.95))"
    });

    // mask to agent silhouette
    const artBg = getComputedStyle(art).backgroundImage;

    veil.style.webkitMaskImage = artBg;
    veil.style.webkitMaskRepeat = "no-repeat";
    veil.style.webkitMaskSize = "contain";
    veil.style.webkitMaskPosition = "center";

    veil.style.maskImage = artBg;
    veil.style.maskRepeat = "no-repeat";
    veil.style.maskSize = "contain";
    veil.style.maskPosition = "center";

    const front = root.querySelector(".frame-fx.front") || root;
    front.appendChild(veil);

    fx._veil  = veil;
    fx._veins = [];

    const count = Math.max(6, Math.min(30, Math.round(fx.p?.[3] ?? 12)));

    for (let i = 0; i < count; i++) {
      fx._veins.push(this._spawnVein(veil));
    }
  },

  // ==========================================
  // SPAWN VEIN
  // ==========================================
  _spawnVein(veil) {

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 100 100");

    Object.assign(svg.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none"
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    const x = Math.random()*100;
    const y = Math.random()*100;

    const d = `
      M ${x} ${y}
      C ${x + (Math.random()-0.5)*60} ${y + (Math.random()-0.5)*60},
        ${x + (Math.random()-0.5)*80} ${y + (Math.random()-0.5)*80},
        ${x + (Math.random()-0.5)*100} ${y + (Math.random()-0.5)*100}
    `;

    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-width", 0.6 + Math.random()*0.6);
    path.setAttribute("stroke", "rgba(0,0,0,1)");

    const len = 300;
    path.style.strokeDasharray  = len;
    path.style.strokeDashoffset = len;

    svg.appendChild(path);
    veil.appendChild(svg);

    return {
      path,
      length: len,
      speed: 0.7 + Math.random()*0.8,
      birth: null
    };
  },

  // ==========================================
  // TICK
  // ==========================================
  _tick(ctx, fx) {

    if (!fx.on || !fx._veil || !fx._art || !fx._veins) return;

    const darkness     = fx.p?.[0] ?? 0.85;
    const veinStrength = fx.p?.[1] ?? 0.9;
    const speed        = fx.p?.[2] ?? 1.0;
    const desired      = Math.max(6, Math.min(30, Math.round(fx.p?.[3] ?? 12)));

    const t = ctx.time * speed;

    // ==========================================
    // 🔥 HARD SYNC TO EMPRESS SCALE
    // ==========================================
    const artScale = getComputedStyle(fx._art).scale;
    fx._veil.style.scale =
      artScale && artScale !== "none" ? artScale : 1;

    fx._veil.style.opacity = darkness;

    // ==========================================
    // REBUILD IF COUNT CHANGED
    // ==========================================
    if (fx._veins.length !== desired) {
      fx._veil.querySelectorAll("svg").forEach(n => n.remove());
      fx._veins = [];
      for (let i = 0; i < desired; i++) {
        fx._veins.push(this._spawnVein(fx._veil));
      }
      return;
    }

    // ==========================================
    // BURROW (NO LOOP)
    // ==========================================
    fx._veins.forEach((v, i) => {

      if (!v.birth) v.birth = t;

      const life = 1.5;
      const progress = (t - v.birth) / life;

      if (progress >= 1) {
        v.path.parentNode.remove();
        fx._veins[i] = this._spawnVein(fx._veil);
        return;
      }

      const travel = progress * v.length;
      v.path.style.strokeDashoffset = v.length - travel;

      const fade = veinStrength * (1 - progress);
      v.path.style.stroke = `rgba(0,0,0,${fade})`;
    });
  },

  // ==========================================
  // CLEANUP
  // ==========================================
  cleanup({ fx }) {

    if (fx._veil) fx._veil.remove();

    fx._veil  = null;
    fx._veins = null;
    fx._art   = null;
    fx._host  = null;
  }
},





/* ---------------------------------------------
 * EFFECT — Cosmic Nebula (Astra)
 * ------------------------------------------- */
"fx_effect_astra_astral_veil": {
  scope: "effect",

  params: [
    "intensity",     // 0
    "driftSpeed",    // 1
    "streakSize",    // 2  (px)
    "streakCount",   // 3  (min 3)
    "streakBright",  // 4
    "streakSharp",   // 5  (0..1)
    "streakSeed",    // 6  (layout)
    "layer"          // 7  (0 behind, 1 front)
  ],

  defaults: [0.8, 0.25, 2, 3, 0.9, 1.0, 1, 0],

  apply({ fx, host, time }) {
    if (!fx.on) return;

    const layers = ensureFxLayers();
    const target = fx.p[7] ? layers.front : layers.behind;

    // create root once per target
    let root = target.querySelector(".fx-astra-nebula");
    if (!root) {
      root = document.createElement("div");
      root.className = "fx-astra-nebula";
      target.appendChild(root);

      const base = document.createElement("div");
      base.className = "fx-astra-nebula-base";
      root.appendChild(base);

      const streakWrap = document.createElement("div");
      streakWrap.className = "fx-astra-streakwrap";
      root.appendChild(streakWrap);
    }

    const base = root.querySelector(".fx-astra-nebula-base");
    const streakWrap = root.querySelector(".fx-astra-streakwrap");

    // params
    const intensity = Math.max(0, Math.min(1.2, fx.p?.[0] ?? 0.8));
    const spd       = Math.max(0.05, Math.min(2.0, fx.p?.[1] ?? 0.25));
    const sizePx    = Math.max(1, Math.min(6,   Math.round(fx.p?.[2] ?? 2)));
    const count = Math.max(3, Math.min(10, Math.round(fx.p?.[3] ?? 3)));
    const bright    = Math.max(0.2, Math.min(2.5, fx.p?.[4] ?? 0.9));
    const sharp     = Math.max(0, Math.min(1,   fx.p?.[5] ?? 1.0));
    const seed      = Math.max(0, Math.min(9999, Math.round(fx.p?.[6] ?? 1)));

    // apply vars
    base.style.setProperty("--i", intensity);
    base.style.setProperty("--spd", spd);

    root.style.setProperty("--streakSize", sizePx);
    root.style.setProperty("--streakBright", bright);
    root.style.setProperty("--streakSharp", sharp);
    root.style.setProperty("--spd", spd);

    // deterministic seeded random
    const rand01 = (n) => {
      const x = Math.sin(n) * 10000;
      return x - Math.floor(x);
    };

    // rebuild streak elements ONLY when count/seed changes
if (fx._veilCount !== count || fx._veilSeed !== seed || fx._veilLayer !== target) {
  streakWrap.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const s = document.createElement("div");
    s.className = "fx-astra-streak";

    const r1 = rand01(seed*97 + i*13);
    const r2 = rand01(seed*53 + i*31);

    s.style.left = `${50 + (r1*40 - 20)}%`;
    s.style.top  = `${50 + (r2*40 - 20)}%`;

    s.style.width  = `${180 + r1*120}%`;
    s.style.height = `${180 + r2*120}%`;

    s.style.animationDuration = `${160 + r1*200}s`;

    streakWrap.appendChild(s);
  }

  fx._veilCount = count;
  fx._veilSeed  = seed;
  fx._veilLayer = target;
}

const el = target.querySelector(".fx-astra-nebula");
if (el) {
  el.style.setProperty(
    "--streakCount",
    Math.max(3, Math.min(10, Math.round(fx.p[3])))
  );
}


    // keep frame clean while active
    host.classList.add("astra-veil-active");
  },

  cleanup({ host }) {
    const layers = ensureFxLayers();
    layers.front.querySelectorAll(".fx-astra-nebula").forEach(n => n.remove());
    layers.behind.querySelectorAll(".fx-astra-nebula").forEach(n => n.remove());
    host.classList.remove("astra-veil-active");
  }
},


/* ---------------------------------------------
 * FRAME — Astra Light Stars (TWINKLE / EMISSIVE)
 * ------------------------------------------- */
"fx_frame_astra_star_nodes": {
  scope: "effect",
  params: ["count","size","pulseSpeed","softness","brightness","layer"],
  defaults: [18, 1.0, 0.6, 0.5, 1.2, 1],

  apply({ fx, host, time }) {

    // cache host
    fx.__host = host;

    // bind tick once
    if (!fx._tick) {
      fx._tick = (ctx) => this._tick(ctx, fx);
    }

    // run once immediately
    this._tick({ fx, host, time }, fx);
  },

  _tick(ctx, fx) {
    if (!fx.on) return;

    const host = fx.__host;
    if (!host) return;

    const layers = ensureFxLayers();
    if (!layers) return;

    const target = (fx.p?.[5] ?? 1)
      ? (layers.frontEffect || layers.front)
      : (layers.behindEffect || layers.behind);

    if (!target) return;

    const desired = Math.max(6, Math.min(40, Math.round(fx.p?.[0] ?? 18)));

    // recreate only if count or layer changed
    if (fx._count !== desired || fx._layer !== target) {

      layers.front?.querySelectorAll(".fx-astra-lightstar").forEach(n=>n.remove());
      layers.behind?.querySelectorAll(".fx-astra-lightstar").forEach(n=>n.remove());

      const rect = host.getBoundingClientRect();

      for (let i=0;i<desired;i++){
        const s = document.createElement("div");
        s.className = "fx-astra-lightstar";
        s.style.position = "absolute";
        s.style.pointerEvents = "none";
        s.style.width = "6px";
        s.style.height = "6px";
        s.style.left = (Math.random() * rect.width) + "px";
        s.style.top  = (Math.random() * rect.height) + "px";
        s.style.transform = "translate(-50%,-50%)";

        const core = document.createElement("div");
        core.style.width = "100%";
        core.style.height = "100%";
        core.style.borderRadius = "50%";
        core.style.background =
          "radial-gradient(circle, rgba(255,255,245,1), rgba(255,240,200,1) 35%, rgba(255,210,140,0.9) 55%, rgba(0,0,0,0) 70%)";
        core.style.animation = "astraStarTwinkle 6s ease-in-out infinite";
        core.style.animationDelay = (Math.random()*6)+"s";

        s.appendChild(core);
        target.appendChild(s);
      }

      fx._count = desired;
      fx._layer = target;
    }

    // update live values
    target.querySelectorAll(".fx-astra-lightstar").forEach(s=>{
      const core = s.firstChild;

      s.style.transform =
        `translate(-50%,-50%) scale(${0.6 + (fx.p?.[1] ?? 1.0)*0.6})`;

      const blur = 2 + (fx.p?.[3] ?? 0.5)*4;
      core.style.filter = `blur(${blur}px)`;

      const glow = fx.p?.[4] ?? 1.2;

      core.style.boxShadow =
        `0 0 ${35*glow}px rgba(255,255,220,1),
         0 0 ${70*glow}px rgba(255,230,160,1),
         0 0 ${120*glow}px rgba(255,200,120,0.95),
         0 0 ${180*glow}px rgba(255,170,80,0.8)`;

      core.style.animationDuration =
        `${6 / Math.max(0.25, fx.p?.[2] ?? 0.6)}s`;
    });
  },

  cleanup(){
    const layers = ensureFxLayers();
    layers?.front?.querySelectorAll(".fx-astra-lightstar").forEach(n=>n.remove());
    layers?.behind?.querySelectorAll(".fx-astra-lightstar").forEach(n=>n.remove());
  }
},
/* ---------------------------------------------
 * FRAME — Clove Heartbeat (SVG HEART)
 * ------------------------------------------- */
"fx_frame_clove_heartbeat": {
  scope: "frame",
  params: ["strength","speed","softness","size","layer"],
  defaults: [1.0, 0.8, 0.35, 1.0, 1],

_tick(time, fx) {

  if (!fx) return;

  const layers = ensureFxLayers();
  if (!layers) return;

  const target = fx.p?.[4] ? layers.front : layers.behind;

  // wipe only if layer changes
  if (fx._hbLayer !== target) {
    layers.front.querySelectorAll(".fx-clove-heartbeat").forEach(n=>n.remove());
    layers.behind.querySelectorAll(".fx-clove-heartbeat").forEach(n=>n.remove());
    fx._hbLayer = target;
  }

  let el = target.querySelector(".fx-clove-heartbeat");

  if (!el) {

    el = document.createElement("div");
    el.className = "fx-clove-heartbeat";

    Object.assign(el.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none"
    });

    el.innerHTML = `
      <svg viewBox="0 0 100 90" class="fx-clove-heart-svg">
        <path d="
          M50 18
          C35 -4 0 8 0 38
          C0 65 50 90 50 90
          C50 90 100 65 100 38
          C100 8 65 -4 50 18
          Z
        "/>
      </svg>
    `;

    target.appendChild(el);
  }

  el.style.setProperty("--str", fx.p?.[0] ?? 1.0);
  el.style.setProperty("--spd", fx.p?.[1] ?? 0.8);
  el.style.setProperty("--soft", fx.p?.[2] ?? 0.35);
  el.style.setProperty("--size", fx.p?.[3] ?? 1.0);
},

  cleanup(){
    const layers = ensureFxLayers();
    layers.front.querySelectorAll(".fx-clove-heartbeat").forEach(n=>n.remove());
    layers.behind.querySelectorAll(".fx-clove-heartbeat").forEach(n=>n.remove());
  }
},
/* ---------------------------------------------
 * EFFECT — Clove Smoke
 * ------------------------------------------- */
"fx_effect_clove_smoke": {
  scope: "frame",
  params: [
    "intensity",
    "driftSpeed",
    "streakSpeed",
    "streakWidth",
    "streakCount",
    "streakBright",
    "layer"
  ],
  defaults: [0.8, 0.25, 1, 2, 5, 1, 0],

  apply({ fx }) {

    const layers = ensureFxLayers();
    if (!layers) return;

    const target = fx.p?.[6] ? layers.front : layers.behind;

    let host = target.querySelector(".fx-clove-smoke");
    if (host) {
      fx._root = host;
      return;
    }

    host = document.createElement("div");
    host.className = "fx-clove-smoke";

    const streaks = document.createElement("div");
    streaks.className = "fx-clove-streaks";

    host.appendChild(streaks);
    target.appendChild(host);

    fx._root = host;
    fx._streaks = streaks;
  },

  _tick(time, fx) {

    if (!fx._root) return;

    const intensity = fx.p?.[0] ?? 0.8;
    const driftSpeed = fx.p?.[1] ?? 0.25;
    const streakSpeed = fx.p?.[2] ?? 1;
    const streakWidth = fx.p?.[3] ?? 2;
    const streakCount = Math.max(1, Math.min(8, fx.p?.[4] ?? 5));
    const streakBright = fx.p?.[5] ?? 1;

    fx._root.style.setProperty("--i", intensity);

    const smokeDur = (10 / Math.max(0.1, driftSpeed)).toFixed(2) + "s";
    const streakDur = (12 / Math.max(0.1, streakSpeed)).toFixed(2) + "s";

    fx._root.style.setProperty("--smokeDur", smokeDur);

    if (fx._streaks) {
      fx._streaks.style.setProperty("--streakDur", streakDur);
      fx._streaks.style.setProperty("--streakWidth", streakWidth + "px");
      fx._streaks.style.setProperty("--streakCount", streakCount);
      fx._streaks.style.setProperty("--streakBright", streakBright);
    }
  },

  cleanup() {
    const layers = ensureFxLayers();
    if (!layers) return;

    layers.front.querySelectorAll(".fx-clove-smoke").forEach(n => n.remove());
    layers.behind.querySelectorAll(".fx-clove-smoke").forEach(n => n.remove());
  }
},

/* ---------------------------------------------
 * EFFECT — Clove Butterflies (RANDOM WANDER, FRAME-BOUNDED)
 * ------------------------------------------- */
"fx_effect_clove_butterflies": {
  scope: "effect",
  params: ["count","size","speed","brightness","layer"],
  defaults: [7, 1.0, 0.7, 1.25, 1],

  apply({ fx, host, time }) {
    fx.__host = host;
    fx._bf = null; // force rebuild on first tick
  },

  _tick({ fx, time }) {

    if (!fx.on || !fx.__host) return;

    const layers = ensureFxLayers();
    const target = (fx.p?.[4] ?? 1)
      ? layers.frontEffect
      : layers.behindEffect;

    const count = Math.max(2, Math.min(18, Math.round(fx.p?.[0] ?? 7)));
    const size  = Math.max(0.6, Math.min(2.0, fx.p?.[1] ?? 1.0));
    const spd   = Math.max(0.2, Math.min(2.0, fx.p?.[2] ?? 0.7));
    const bright= Math.max(0.4, Math.min(3.0, fx.p?.[3] ?? 1.25));

    // ==========================
    // INIT / REBUILD
    // ==========================
    if (!fx._bf || fx._bfTarget !== target || fx._bfCount !== count) {

      layers.frontEffect?.querySelectorAll(".fx-clove-bfly").forEach(n=>n.remove());
      layers.behindEffect?.querySelectorAll(".fx-clove-bfly").forEach(n=>n.remove());

      fx._bf = [];
      fx._bfTarget = target;
      fx._bfCount = count;

      for (let i=0;i<count;i++){

        const el = document.createElement("div");
        el.className = "fx-clove-bfly";

        Object.assign(el.style,{
          position:"absolute",
          left:(10+Math.random()*80)+"%",
          top:(10+Math.random()*80)+"%",
          transform:"translate(-50%,-50%)"
        });

        target.appendChild(el);

        fx._bf.push({
          el,
          x: parseFloat(el.style.left),
          y: parseFloat(el.style.top),
          vx: (Math.random()*2-1)*15,
          vy: (Math.random()*2-1)*15,
          t0: time + Math.random()*10
        });
      }

      fx._bfLastT = time;
    }

    // ==========================
    // FRAME UPDATE
    // ==========================
    const dt = Math.min(0.05, Math.max(0.001, time - fx._bfLastT));
    fx._bfLastT = time;

    for (const b of fx._bf){

      b.vx += (Math.random()*2-1) * 8 * spd;
      b.vy += (Math.random()*2-1) * 8 * spd;

      b.vx *= 0.98;
      b.vy *= 0.98;

      const vmax = 30 * spd;
      b.vx = Math.max(-vmax, Math.min(vmax, b.vx));
      b.vy = Math.max(-vmax, Math.min(vmax, b.vy));

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      if (b.x < 5) { b.x = 5; b.vx *= -0.6; }
      if (b.x > 95){ b.x = 95; b.vx *= -0.6; }
      if (b.y < 5) { b.y = 5; b.vy *= -0.6; }
      if (b.y > 95){ b.y = 95; b.vy *= -0.6; }

      b.el.style.left = b.x + "%";
      b.el.style.top  = b.y + "%";

      b.el.style.setProperty("--size", size);
      b.el.style.setProperty("--b", bright);

      const rot = Math.max(-20, Math.min(20, b.vx * 0.4));
      b.el.style.transform =
        `translate(-50%,-50%) rotate(${rot}deg)`;
    }
  },

  cleanup(){
    const layers = ensureFxLayers();
    layers.frontEffect?.querySelectorAll(".fx-clove-bfly").forEach(n=>n.remove());
    layers.behindEffect?.querySelectorAll(".fx-clove-bfly").forEach(n=>n.remove());
  }
},
// ======================
// H A R B O R
// ======================

/* ---------------------------------------------
 * FRAME — Cove
 * Watery refractive shield bubble
 * ------------------------------------------- */
"fx_frame_harbor_cove": {
  scope: "frame",
  params: ["layer", "strength", "refraction", "drift", "droplets"],
  defaults: [1, 0.9, 0.75, 0.6, 0.7],

  init({ fx, host }) {

    const frameEl = host?.closest(".frame") || document.querySelector(".frame");
    if (!frameEl) return;

    const layer = fx.p?.[0] ?? 1;

    const layerWrap = frameEl.querySelector(
      layer ? ".frame-fx.front" : ".frame-fx.behind"
    );
    if (!layerWrap) return;

    layerWrap.querySelectorAll(".fx-harbor-cove-root").forEach(n => n.remove());

    const root = document.createElement("div");
    root.className = "fx-harbor-cove-root is-loop";

    const shell = document.createElement("div");
    shell.className = "fx-harbor-cove-shell";

    const refr = document.createElement("div");
    refr.className = "fx-harbor-cove-refract";

    const drops = document.createElement("div");
    drops.className = "fx-harbor-cove-drops";

    root.appendChild(shell);
    root.appendChild(refr);
    root.appendChild(drops);

    layerWrap.appendChild(root);

    fx.__el = root;
    fx.__layerWrap = layerWrap;
    fx.__frame = frameEl;

    // restart loop animation
    root.classList.remove("is-loop");
    void root.offsetHeight;
    root.classList.add("is-loop");
  },

  _tick(t, fx) {

    const el = fx.__el;
    if (!el) return;

    const layer    = fx.p?.[0] ?? 1;
    const strength = fx.p?.[1] ?? 0.9;
    const refr     = fx.p?.[2] ?? 0.75;
    const drift    = fx.p?.[3] ?? 0.6;
    const drops    = fx.p?.[4] ?? 0.7;

    const frameEl = fx.__frame;
    if (!frameEl) return;

    const newWrap = frameEl.querySelector(
      layer ? ".frame-fx.front" : ".frame-fx.behind"
    );

    if (newWrap && fx.__layerWrap !== newWrap) {
      fx.__layerWrap = newWrap;
      newWrap.appendChild(el);
    }

    el.style.setProperty("--strength", strength.toFixed(3));
    el.style.setProperty("--refr", refr.toFixed(3));
    el.style.setProperty("--drift", drift.toFixed(3));
    el.style.setProperty("--drops", drops.toFixed(3));

    // smooth water drift
    const dx = (t * 0.045 * (0.35 + drift)) % 260;
    const dy = (t * 0.030 * (0.35 + drift)) % 260;

    el.style.setProperty("--dx", dx.toFixed(2));
    el.style.setProperty("--dy", dy.toFixed(2));

    // breathing water pulse
    const beat = 0.6 + 0.4 * Math.sin(t * (1.1 + drift * 2.4));
    el.style.setProperty("--beat", beat.toFixed(3));
  },

  apply({ fx, host }) {
    if (!fx.__el) this.init({ fx, host });
  },

  cleanup({ fx }) {
    if (fx.__el) fx.__el.remove();
    fx.__el = null;
    fx.__layerWrap = null;
    fx.__frame = null;
  }
},


/* ---------------------------------------------
 * FRAME — Shoreline Waves
 * Bottom waves scrolling sideways (SVG)
 * ------------------------------------------- */
"fx_frame_harbor_shoreline_waves": {
  scope: "effect",
  params: ["layer", "intensity", "speed", "height", "foam"],
  defaults: [1, 0.9, 0.65, 0.45, 0.65],

  init({ fx, host }) {

    const frameEl = host?.closest(".frame") || document.querySelector(".frame");
    if (!frameEl) return;

    const layer = fx.p?.[0] ?? 1;

    const layerWrap = frameEl.querySelector(
      layer ? ".frame-fx.front" : ".frame-fx.behind"
    );
    if (!layerWrap) return;

    layerWrap.querySelectorAll(".fx-harbor-svgshore-root").forEach(n => n.remove());

    const root = document.createElement("div");
    root.className = "fx-harbor-svgshore-root";

    Object.assign(root.style, {
      position: "absolute",
      left: "0",
      right: "0",
      bottom: "0",
      height: "55%",
      top: "auto",
      pointerEvents: "none"
    });

    root.innerHTML = `
      <svg class="fx-harbor-svgshore" viewBox="0 0 1000 260" preserveAspectRatio="none">
        <g class="fx-harbor-wavegrp">
          <g class="wavecopy">
            <path class="fx-harbor-wave w1" d="M0,160 C120,120 240,200 360,160 C480,120 600,200 720,160 C840,120 920,190 1000,160 L1000,260 L0,260 Z"/>
            <path class="fx-harbor-wave w2" d="M0,175 C140,145 260,210 400,175 C540,140 650,215 800,175 C900,150 950,185 1000,175 L1000,260 L0,260 Z"/>
            <path class="fx-harbor-wave w3" d="M0,195 C160,175 300,225 460,195 C620,165 740,235 900,195 C955,182 980,192 1000,195 L1000,260 L0,260 Z"/>
            <path class="fx-harbor-foam" d="M0,165 C120,125 240,205 360,165 C480,125 600,205 720,165 C840,125 920,195 1000,165"/>
          </g>
          <g class="wavecopy" transform="translate(1000 0)">
            <path class="fx-harbor-wave w1" d="M0,160 C120,120 240,200 360,160 C480,120 600,200 720,160 C840,120 920,190 1000,160 L1000,260 L0,260 Z"/>
            <path class="fx-harbor-wave w2" d="M0,175 C140,145 260,210 400,175 C540,140 650,215 800,175 C900,150 950,185 1000,175 L1000,260 L0,260 Z"/>
            <path class="fx-harbor-wave w3" d="M0,195 C160,175 300,225 460,195 C620,165 740,235 900,195 C955,182 980,192 1000,195 L1000,260 L0,260 Z"/>
            <path class="fx-harbor-foam" d="M0,165 C120,125 240,205 360,165 C480,125 600,205 720,165 C840,125 920,195 1000,165"/>
          </g>
        </g>
      </svg>
    `;

    layerWrap.appendChild(root);

    fx.__el = root;
    fx.__wrap = layerWrap;
    fx.__frame = frameEl;
    fx.__g = root.querySelector(".fx-harbor-wavegrp");
    fx.__phase = 0;
    fx.__lastT = null;
  },

  _tick(arg, fx) {

    let timeSec;

    if (typeof arg === "number") {
      timeSec = arg;
    } else if (arg && typeof arg === "object") {
      timeSec = Number(arg.time ?? 0);
      fx = arg.fx || fx;
    } else {
      return;
    }

    if (!fx || !fx.__el || !fx.__g) return;

    const frameEl = fx.__frame;
    if (!frameEl) return;

    // 🔥 LIVE LAYER SWITCHING
    const layer = fx.p?.[0] ?? 1;
    const desiredWrap = frameEl.querySelector(
      layer ? ".frame-fx.front" : ".frame-fx.behind"
    );

    if (desiredWrap && fx.__wrap !== desiredWrap) {
      fx.__wrap = desiredWrap;
      desiredWrap.appendChild(fx.__el);
    }

    const intensity = fx.p?.[1] ?? 0.9;
    const speedRaw  = Math.max(0, Math.min(1, fx.p?.[2] ?? 0.65));
    const height    = fx.p?.[3] ?? 0.45;
    const foam      = fx.p?.[4] ?? 0.65;

    fx.__el.style.setProperty("--intensity", intensity.toFixed(3));
    fx.__el.style.setProperty("--height", height.toFixed(3));
    fx.__el.style.setProperty("--foam", foam.toFixed(3));

    const t = timeSec;

    const last = Number.isFinite(fx.__lastT) ? fx.__lastT : t;
    const dt = Math.min(0.05, Math.max(0, t - last));
    fx.__lastT = t;

    const velocity = 200 + speedRaw * 800;

    fx.__phase = (fx.__phase || 0) + velocity * dt;

    const LOOP = 1000;
    const px = ((fx.__phase % LOOP) + LOOP) % LOOP;

    fx.__g.setAttribute("transform", `translate(${-px} 0)`);
  },

  apply({ fx, host, time }) {

    if (!fx.__el || !fx.__el.isConnected) {
      this.init({ fx, host });
    }

    if (!fx._tick) {
      fx._tick = (t) => this._tick(t, fx);
    }

    fx._tick(time);
  },

  cleanup({ fx }) {
    if (fx.__el) fx.__el.remove();
    fx.__el = null;
    fx.__wrap = null;
    fx.__frame = null;
    fx.__g = null;
    fx.__phase = 0;
    fx.__lastT = null;
    fx._tick = null;
  }
},
// ======================
// K I L L J O Y
// ======================

/* ---------------------------------------------
 * EFFECT — Nanoswarm
 * ------------------------------------------- */
"fx_effect_killjoy_nanoswarm": {
  scope: "effect",
  params: ["layer", "colorA", "colorB", "intensity", "speed", "rise", "shards", "size"],
  defaults: [1, "#e6ff4a", "#ff3bd6", 0.9, 1.0, 0.85, 26, 1.0],

  apply({ fx, host, time }) {
    const layer = fx.p?.[0] ?? 1;
    const colorA = fx.p?.[1] ?? "#e6ff4a";
    const colorB = fx.p?.[2] ?? "#ff3bd6";
    const intensity = Math.max(0.05, Math.min(1.6, fx.p?.[3] ?? 0.9));
    const speed = Math.max(0.35, Math.min(2.8, fx.p?.[4] ?? 1.0));
    const rise = Math.max(0.2, Math.min(1.0, fx.p?.[5] ?? 0.85));
    const shards = Math.max(0, Math.min(70, Math.round(fx.p?.[6] ?? 26)));
    const size = Math.max(0.6, Math.min(1.8, fx.p?.[7] ?? 1.0));

    const target = getFxTargetLayer(host, layer);
    if (!target) return;

    // mount once
    if (!fx._nanoRoot || !fx._nanoRoot.isConnected) {
      const root = document.createElement("div");
      root.className = "fx-kj-nano2-root";

      const shardWrap = document.createElement("div");
      shardWrap.className = "fx-kj-nano2-shards";
      root.appendChild(shardWrap);

      target.appendChild(root);

      fx._nanoRoot = root;
      fx._nanoShards = shardWrap;
      fx._nanoLayer = layer;
      fx._nanoShardCount = -1; // force build
    }

    // re-parent on layer change
    if (fx._nanoLayer !== layer) {
      const newTarget = getFxTargetLayer(host, layer);
      if (newTarget && fx._nanoRoot?.isConnected) newTarget.appendChild(fx._nanoRoot);
      fx._nanoLayer = layer;
    }

    // vars
    fx._nanoRoot.style.setProperty("--cA", colorA);
    fx._nanoRoot.style.setProperty("--cB", colorB);
    fx._nanoRoot.style.setProperty("--i", intensity);
    fx._nanoRoot.style.setProperty("--spd", speed);
    fx._nanoRoot.style.setProperty("--rise", rise);
    fx._nanoRoot.style.setProperty("--sz", size);

    fx._nanoRoot.style.setProperty("--ph", ((time * 0.001 * speed) % 1).toFixed(3));

    // ✅ rebuild shards (desync safe)
    const childCount = fx._nanoShards?.childElementCount ?? 0;
    if (fx._nanoShardCount !== shards || childCount !== shards) {
      fx._nanoShardCount = shards;
      fx._nanoShards.innerHTML = "";

      for (let i = 0; i < shards; i++) {
        const s = document.createElement("div");
        s.className = "fx-kj-nano2-shard";

        // ✅ alternate color A/B
        s.style.setProperty("--c", (i % 2 === 0) ? "var(--cA)" : "var(--cB)");

        s.style.setProperty("--x", `${(6 + Math.random() * 88).toFixed(2)}%`);
        s.style.setProperty("--y", `${(65 + Math.random() * 34).toFixed(2)}%`); // bottom biased
        s.style.setProperty("--r", `${(Math.random() * 360).toFixed(2)}deg`);
        s.style.setProperty("--d", `${(Math.random() * 0.9).toFixed(2)}s`);
        s.style.setProperty("--p", `${(0.55 + Math.random() * 0.65).toFixed(2)}`);
        s.style.setProperty("--w", `${(6 + Math.random() * 18).toFixed(2)}px`);
        s.style.setProperty("--h", `${(5 + Math.random() * 22).toFixed(2)}px`);
        s.style.setProperty("--t", `${(0.65 + Math.random() * 1.4).toFixed(2)}`);

        fx._nanoShards.appendChild(s);
      }
    }
  },

  cleanup({ fx }) {
    if (fx._nanoRoot?.isConnected) fx._nanoRoot.remove();
    fx._nanoRoot = null;
    fx._nanoShards = null;
    fx._nanoLayer = null;
    fx._nanoShardCount = null;
  }
},


/* ---------------------------------------------
 * EFFECT — Killjoy Ultimate Hex Grid
 * (replaces old Lockdown Pulse)
 * ------------------------------------------- */
"fx_effect_killjoy_lockdown_pulse": {
  scope: "effect",
params: ["layer", "color", "intensity", "speed", "opacity", "cell", "wave"],
defaults: [1, "#ffffff", 0.9, 1.0, 0.85, 22, 1],


  apply({ fx, host, time }) {
    const layer = fx.p?.[0] ?? 1;
    const color = fx.p?.[1] ?? "#ffd24a";
    const intensity = Math.max(0.05, Math.min(1.6, fx.p?.[2] ?? 0.9));
    const speed = Math.max(0.35, Math.min(2.6, fx.p?.[3] ?? 1.0));
    const opacity = Math.max(0.05, Math.min(1.0, fx.p?.[4] ?? 0.85));
    const cell = Math.max(12, Math.min(42, Math.round(fx.p?.[5] ?? 22)));
    const wave = Math.max(0, Math.min(1, fx.p?.[6] ?? 1));

    const target = getFxTargetLayer(host, layer);
    if (!target) return;

    // mount once
    if (!fx._kjHexRoot || !fx._kjHexRoot.isConnected) {
      const root = document.createElement("div");
      root.className = "fx-kj-ulthex-root";

      const grid = document.createElement("div");
      grid.className = "fx-kj-ulthex-grid";
      root.appendChild(grid);

      const sweep = document.createElement("div");
      sweep.className = "fx-kj-ulthex-sweep";
      root.appendChild(sweep);

      target.appendChild(root);

      fx._kjHexRoot = root;
      fx._kjHexGrid = grid;
      fx._kjHexSweep = sweep;
      fx._kjHexLayer = layer;
    }

    // re-parent on layer change
    if (fx._kjHexLayer !== layer) {
      const newTarget = getFxTargetLayer(host, layer);
      if (newTarget && fx._kjHexRoot?.isConnected) newTarget.appendChild(fx._kjHexRoot);
      fx._kjHexLayer = layer;
    }

    // vars
    fx._kjHexRoot.style.setProperty("--c", color);
    fx._kjHexRoot.style.setProperty("--i", intensity);
    fx._kjHexRoot.style.setProperty("--spd", speed);
    fx._kjHexRoot.style.setProperty("--op", opacity);
    fx._kjHexRoot.style.setProperty("--cell", `${cell}px`);
    fx._kjHexRoot.style.setProperty("--wave", wave);

    // subtle shimmer phase (no DOM churn)
    fx._kjHexRoot.style.setProperty("--ph", ((time * 0.001 * speed) % 1).toFixed(3));
  },

  cleanup({ fx }) {
    if (fx._kjHexRoot?.isConnected) fx._kjHexRoot.remove();
    fx._kjHexRoot = null;
    fx._kjHexGrid = null;
    fx._kjHexSweep = null;
    fx._kjHexLayer = null;
  }
},

// ======================
// S O V A
// ======================

/* ---------------------------------------------
 * EFFECT — Recon Pulse (Sova)
 * ------------------------------------------- */
"fx_frame_sova_recon_pulse": {
  scope: "frame",

  params: ["layer", "color", "strength", "radius", "scanOn", "scanSpeed", "pings", "glow"],
  defaults: [1, "#38a8ff", 0.75, 0.6, 1, 0.55, 0.6, 0.8],

  apply({ fx, host }) {

    if (!fx.p || fx.p.length === 0) {
      fx.p = [...this.defaults];
    }

    const frame =
      host?.closest?.(".frame") ||
      document.querySelector(".frame");

    if (!frame) return;

    const layer = (fx.p?.[0] ?? 1) ? 1 : 0;

    const layerHost =
      frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");

    if (!layerHost) return;

    const root = document.createElement("div");
    root.className = "fx-sova-recon";

    root.innerHTML = `
      <div class="grid"></div>
      <div class="ring ring-a"></div>
      <div class="ring ring-b"></div>
      <div class="sweep"></div>
      <div class="pings"></div>
    `;

    layerHost.appendChild(root);

    fx._root = root;
    fx._angle = 0;
    fx._lastT = 0;
    fx._nextPingTime = 0;
  },

  _tick(arg1, arg2) {

    const ctx = (typeof arg1 === "object" && arg1) ? arg1 : null;
    const fx  = ctx ? ctx.fx : arg2;
    const t   = ctx ? ctx.time : arg1;

    if (!fx || !fx.on || !fx._root) return;

    const clamp01 = v => Math.max(0, Math.min(1, v));

    const frame =
      ctx?.host?.closest?.(".frame") ||
      document.querySelector(".frame");

    if (!frame) return;

    const w = frame.clientWidth;
    const h = frame.clientHeight;

    const color     = fx.p?.[1] ?? "#38a8ff";
    const strength  = clamp01(fx.p?.[2] ?? 0.75);
    const radius01  = clamp01(fx.p?.[3] ?? 0.6);
    const scanOn    = (fx.p?.[4] ?? 1) >= 0.5;
    const scanSpeed = clamp01(fx.p?.[5] ?? 0.55);
    const pings01   = clamp01(fx.p?.[6] ?? 0.6);
    const glow01    = clamp01(fx.p?.[7] ?? 0.8);

    const base = Math.min(w, h);
    const R = Math.max(180, Math.round(base * (0.36 + radius01 * 0.88)));

    const root = fx._root;
	root.style.left = `${frame.clientWidth * 0.5}px`;
root.style.top  = `${frame.clientHeight * 0.5}px`;


    root.style.setProperty("--c", color);
    root.style.setProperty("--r", `${R}px`);
    root.style.setProperty("--amp", 0.35 + strength * 1.8);
    root.style.setProperty("--g", 0.15 + glow01 * 2.2);

    // ======================
    // SMOOTH ROTATION
    // ======================
    const sweep = root.querySelector(".sweep");

    if (scanOn && sweep) {

      if (!fx._lastT) fx._lastT = t;

      const dt = Math.min(0.05, Math.max(0, t - fx._lastT));
      fx._lastT = t;

      const rotPerSec = 0.35 + scanSpeed * 1.9;
      fx._angle = (fx._angle || 0) + dt * rotPerSec * 360;

      sweep.style.display = "";
      sweep.style.transform =
        `translate(-50%, -50%) rotate(${fx._angle}deg)`;

    } else if (sweep) {
      sweep.style.display = "none";
    }

// ======================
// SWEEP-BASED PINGS
// ======================
const pingHost = root.querySelector(".pings");
if (!pingHost) return;

if (scanOn) {

  const sweepAngle = fx._angle % 360;

  // initialize last ping angle tracker
  if (fx._lastPingAngle == null) {
    fx._lastPingAngle = sweepAngle;
  }

  const delta = (sweepAngle - fx._lastPingAngle + 360) % 360;

  // spawn when sweep advances enough degrees
  const threshold = 12 + (1 - pings01) * 28; // more pings slider = smaller threshold

  if (delta >= threshold) {

    fx._lastPingAngle = sweepAngle;

    const count = Math.max(1, Math.round(1 + pings01 * 4));

    for (let i = 0; i < count; i++) {

      const angleRad = (sweepAngle + (Math.random() * 10 - 5)) * Math.PI / 180;

// measure actual rendered radius from CSS variable
const computedR = parseFloat(getComputedStyle(root).getPropertyValue("--r")) || R;
// enforce circular clipping for pings
const pingHost = root.querySelector(".pings");
if (pingHost) {
  pingHost.style.position = "absolute";
  pingHost.style.inset = "0";
  pingHost.style.clipPath = `circle(${R}px at 50% 50%)`;
}

// keep pings safely inside visible ring
const innerPad = 18; 
const maxRadius = computedR - innerPad;

// radial distribution (slightly biased outward)
const dist = Math.sqrt(Math.random()) * maxRadius;



      const px = Math.cos(angleRad) * dist;
      const py = Math.sin(angleRad) * dist;

      const el = document.createElement("i");
      el.className = "ping";

      el.style.setProperty("--px", `${px}px`);
      el.style.setProperty("--py", `${py}px`);
      el.style.setProperty("--d", `${Math.random() * 0.25}s`);
      el.style.setProperty("--s", `${(0.6 + Math.random() * 1.3).toFixed(2)}`);

      pingHost.appendChild(el);

      setTimeout(() => el.remove(), 900);
    }
  }
}

  },

  cleanup({ fx }) {
    if (fx._root) fx._root.remove();
    fx._root = null;
  }
},

/* ---------------------------------------------
 * EFFECT — Shock Dart
 * ------------------------------------------- */
"fx_effect_sova_shock_dart": {
  scope: "effect",
  params: ["layer", "arcCount", "intensity", "speed", "radius", "thickness"],
  defaults: [1, 7, 0.8, 1.0, 0.46, 1.0],

  apply({ fx, host, time }) {
    const layer     = (fx.p?.[0] ?? 1) ? 1 : 0;
    const arcCount  = Math.max(3, Math.round(fx.p?.[1] ?? 7));
    const intensity = Math.max(0.15, Math.min(1.3, fx.p?.[2] ?? 0.8));
    const speed     = Math.max(0.35, Math.min(2.5, fx.p?.[3] ?? 1.0));
    const radius    = Math.max(0.28, Math.min(0.62, fx.p?.[4] ?? 0.46));
    const thickness = Math.max(0.35, Math.min(2.5, fx.p?.[5] ?? 1.0));

    const target = getFxTargetLayer(host, layer);
    if (!target) return;

    // ✅ Create once
    if (!fx._shockRoot || !fx._shockRoot.isConnected) {
      const root = document.createElement("div");
      root.className = "fx-sova-shock-root";
      root.dataset.fx = fx.id; // ✅ IMPORTANT for cleanup
      target.appendChild(root);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "fx-sova-shock-svg");
      svg.setAttribute("viewBox", "0 0 100 100");
      svg.setAttribute("preserveAspectRatio", "none");

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "fx-sova-shock-g");
      svg.appendChild(g);
      root.appendChild(svg);

      fx._shockRoot  = root;
      fx._shockSvg   = svg;
      fx._shockG     = g;
      fx._shockLayer = layer;
      fx._shockCount = 0;

      fx._shockNextT = 0;
      fx._shockSeed  = Math.random() * 9999;
    }

    // ✅ Re-parent on layer change
    if (fx._shockLayer !== layer) {
      const newTarget = getFxTargetLayer(host, layer);
      if (newTarget && fx._shockRoot?.isConnected) newTarget.appendChild(fx._shockRoot);
      fx._shockLayer = layer;
    }

    // ✅ Update vars
    const root = fx._shockRoot;
    root.style.setProperty("--i", intensity);
    root.style.setProperty("--spd", speed);
    root.style.setProperty("--rad", radius);
    root.style.setProperty("--th", thickness);

    // ✅ Rebuild path elements if count changed
    if (fx._shockCount !== arcCount) {
      fx._shockCount = arcCount;
      fx._shockG.innerHTML = "";

      for (let i = 0; i < arcCount; i++) {
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("class", "fx-sova-bolt");
        p.style.setProperty("--d", `${(Math.random() * 0.25).toFixed(2)}s`);
        p.style.setProperty("--w", `${(0.9 + Math.random() * 1.8).toFixed(2)}`);
        fx._shockG.appendChild(p);

        if (Math.random() < 0.35) {
          const f = document.createElementNS("http://www.w3.org/2000/svg", "path");
          f.setAttribute("class", "fx-sova-bolt fx-sova-bolt-fork");
          f.style.setProperty("--d", `${(Math.random() * 0.25).toFixed(2)}s`);
          f.style.setProperty("--w", `${(0.65 + Math.random() * 1.4).toFixed(2)}`);
          fx._shockG.appendChild(f);
        }
      }
    }

    // ✅ discrete redraw (snap lightning)
    const t = (Number.isFinite(time) ? time : performance.now() / 1000);
    const interval = 0.10 / speed;
    if (t < fx._shockNextT) return;
    fx._shockNextT = t + interval;

    const paths = fx._shockG.querySelectorAll(".fx-sova-bolt");
    const jag  = 3.5 + intensity * 3.8;
    const segs = 6 + Math.round(intensity * 4);

    paths.forEach((path) => {
      const p0 = samplePerimeterPoint(6);
      const p1 = (Math.random() < 0.55)
        ? samplePerimeterPoint(6)
        : sampleInteriorPoint(18);

      if (Math.random() < 0.35) {
        const p2 = samplePerimeterPoint(6, p0.side);
        p1.x = p2.x; p1.y = p2.y;
      }

      const d = makeBoltPath(p0.x, p0.y, p1.x, p1.y, segs, jag);
      path.setAttribute("d", d);
    });
  },

  cleanup({ fx, host }) {
    // ✅ remove our root if we still have it
    if (fx?._shockRoot && fx._shockRoot.isConnected) {
      fx._shockRoot.remove();
    }

    // ✅ safety scrub if root got detached from fx state
    const frame = host?.closest?.(".frame") || document.querySelector(".frame");
    if (frame) {
      frame.querySelectorAll(`.fx-sova-shock-root[data-fx="${fx?.id}"]`).forEach(n => n.remove());
    }

    if (fx) {
      fx._shockRoot  = null;
      fx._shockSvg   = null;
      fx._shockG     = null;
      fx._shockLayer = null;
      fx._shockCount = 0;
      fx._shockNextT = 0;
    }
  }
},


// ======================
// C H A M B E R
// ======================
"fx_effect_chamber_bullet_impacts": {
  scope: "effect",
  params: ["fireRate", "spread", "duration", "sparks", "layer"],
  defaults: [2.2, 0.9, 0.55, 0.6, 1],

  apply({ fx, host }) {

    fx.__host = host;
    if (!fx._lastShot) fx._lastShot = 0;

    if (!fx._tick) {
      fx._tick = (t) => this._tick({ fx, time: t });
    }
  },

  _tick({ fx, time }) {

    if (!fx || !fx.__host) return;

    const frameEl = fx.__host.closest(".frame") || document.querySelector(".frame");
    if (!frameEl) return;

    const fireRate = Math.max(0.2, Math.min(12, fx.p?.[0] ?? 2.2));
    const spread   = Math.max(0.05, Math.min(1.0, fx.p?.[1] ?? 0.9));
    const dur      = Math.max(0.15, Math.min(2.5, fx.p?.[2] ?? 0.55));
    const sparks   = Math.max(0.0,  Math.min(1.0, fx.p?.[3] ?? 0.6));
    const layerVal = fx.p?.[4] ?? 1;

    // 🔥 DIRECT LAYER RESOLUTION (no helper)
    const layerWrap = frameEl.querySelector(
      layerVal ? ".frame-fx.front" : ".frame-fx.behind"
    );
    if (!layerWrap) return;

    const now = time * 1000;
    const intervalMs = 1000 / fireRate;

    if (!fx._lastShot) fx._lastShot = now;
    if (now - fx._lastShot < intervalMs) return;

    fx._lastShot = now;

    const wrap = document.createElement("div");
    wrap.className = "fx-chamber-bullets";
    wrap.style.setProperty("--dur", dur);

    layerWrap.appendChild(wrap);

    const imp = document.createElement("div");
    imp.className = "fx-bullet-imp";

    const rx = (Math.random() * 2 - 1) * spread;
    const ry = (Math.random() * 2 - 1) * spread;

    imp.style.left = `${50 + rx * 48}%`;
    imp.style.top  = `${50 + ry * 60}%`;

    if (typeof CHAMBER_BULLET_IMG === "string" && CHAMBER_BULLET_IMG.length) {
      imp.style.setProperty("--img", `url("${CHAMBER_BULLET_IMG}")`);
    }

    const sparkCount = Math.min(18, Math.round(6 + sparks * 12));

    for (let j = 0; j < sparkCount; j++) {

      const sp = document.createElement("span");
      sp.className = "fx-bullet-spark";

      const a = Math.random() * Math.PI * 2;
      const v = 26 + Math.random() * 74;

      const dx = Math.cos(a) * v;
      const dy = Math.sin(a) * v;
      const g  = 60 + Math.random() * 140;

      sp.style.setProperty("--dx", `${dx.toFixed(1)}px`);
      sp.style.setProperty("--dy", `${dy.toFixed(1)}px`);
      sp.style.setProperty("--g",  `${g.toFixed(1)}px`);
      sp.style.setProperty("--sd", `${(Math.random() * 0.03).toFixed(3)}s`);
      sp.style.setProperty("--dur", `${(0.45 + Math.random() * 0.45).toFixed(2)}s`);

      imp.appendChild(sp);
    }

    wrap.appendChild(imp);

    setTimeout(() => {
      if (wrap && wrap.parentNode) wrap.remove();
    }, dur * 1000 + 900);
  },

  cleanup({ fx }) {
    fx._lastShot = 0;
    fx.__host = null;

    document.querySelectorAll(".fx-chamber-bullets").forEach(n => n.remove());
  }
},

"fx_frame_chamber_gilded_focus": {
  scope: "frame",
  params: ["outline", "size", "sharpness", "pulseSpeed", "pulseStrength"],
  defaults: [0.85, 1.05, 0.65, 1.0, 0.85],

  apply({ fx, host }) {

    const frame = host?.closest?.(".frame") || host;
    if (!frame) return;

    let root = frame.querySelector(".fx-chamber-gilded");
    if (!root) {
      root = document.createElement("div");
      root.className = "fx-chamber-gilded";
      frame.appendChild(root);
    }

    fx._root = root;

    // Cache original art state once
    const art = frame.querySelector(".frame-art-inner");
    if (art && !fx._orig) {
      fx._orig = {
        scale: art.style.scale || "",
        filter: art.style.filter || "",
        willChange: art.style.willChange || ""
      };
    }

    fx._art = art;
  },

  _tick(ctx, fx) {

    if (!fx.on) return;

    const t = (typeof ctx === "number")
      ? ctx / 1000
      : (ctx?.time ?? 0);

    const outline = fx.p?.[0] ?? 0.85;
    const size    = fx.p?.[1] ?? 1.05;
    const sharp   = fx.p?.[2] ?? 0.65;
    const speed   = fx.p?.[3] ?? 1.0;
    const pulse   = fx.p?.[4] ?? 0.85;

    const root = fx._root;
    if (!root) return;

    // -----------------------------
    // Pulse math
    // -----------------------------
    const beat = 0.5 + Math.sin(t * 2 * Math.PI * speed) * 0.5;
    const glowAmp = 0.4 + beat * pulse;

    // -----------------------------
    // Root styling
    // -----------------------------
    root.style.setProperty("--outline", outline);
    root.style.setProperty("--sharp", sharp);
    root.style.setProperty("--glow", glowAmp);

    // -----------------------------
    // Subtle art scale pulse
    // -----------------------------
    if (fx._art) {
      const scale = size + beat * 0.03 * pulse;

      fx._art.style.scale = scale.toFixed(4);
      fx._art.style.willChange = "transform, filter";
      fx._art.style.filter =
        `contrast(${1 + sharp * 0.35}) brightness(${1 + glowAmp * 0.2})`;
    }
  },

  cleanup({ fx }) {

    const root = fx?._root;
    if (root?.isConnected) root.remove();

    if (fx?._art && fx?._orig) {
      fx._art.style.scale = fx._orig.scale;
      fx._art.style.filter = fx._orig.filter;
      fx._art.style.willChange = fx._orig.willChange;
    }

    fx._root = null;
    fx._art = null;
    fx._orig = null;
  }
},
// ======================
// P H O E N I X
// ======================

/* ---------------------------------------------
 * FRAME — Radiant Heat
 * ------------------------------------------- */
"fx_frame_phoenix_radiant_heat": {
  scope: "effect",
  params: ["intensity", "shimmerSpeed", "emberDensity", "glowStrength"],
  defaults: [0.6, 0.8, 0.4, 0.7],
  
  apply({ fx, host, time }) {
  let layer = host.querySelector(".fx-phoenix-radiant-heat");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-phoenix-radiant-heat";
    host.appendChild(layer);
  }

  const intensity     = fx.p[0] ?? 0.6;
  const shimmerSpeed  = fx.p[1] ?? 0.8;
  const emberDensity  = fx.p[2] ?? 0.4;
  const glowStrength  = fx.p[3] ?? 0.7;

  // 🔥 Heat shimmer (GPU-safe)
  const shimmer = Math.sin(time * 0.002 * shimmerSpeed) * 6 * intensity;
  layer.style.filter = `
    blur(${1.5 + intensity * 2}px)
    drop-shadow(0 0 ${12 * glowStrength}px rgba(255,120,40,${0.35 * glowStrength}))
  `;
  layer.style.transform = `translateY(${shimmer}px)`;

  // 🔥 Glow pulse
  layer.style.opacity =
    0.55 + Math.sin(time * 0.003) * 0.15 * intensity;

  // 🔥 Embers (lightweight, capped)
  if (Math.random() < 0.02 * emberDensity) {
    const ember = document.createElement("div");
    ember.className = "phoenix-ember";
    layer.appendChild(ember);

    ember.style.left = `${Math.random() * 100}%`;
    ember.style.animationDuration = `${0.6 + Math.random() * 0.6}s`;

    setTimeout(() => ember.remove(), 1200);
  }
}

},

/* ---------------------------------------------
 * FRAME — Burning Edge
 * ------------------------------------------- */
"fx_frame_phoenix_burning_edge": {
  scope: "effect",
  params: ["flameSpeed", "flameHeight", "opacity"],
  defaults: [0.9, 0.5, 0.75],
  
  apply({ fx, host, time }) {
  let layer = host.querySelector(".fx-phoenix-burning-edge");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "fx-phoenix-burning-edge";
    host.appendChild(layer);
  }

  const flameSpeed  = fx.p[0] ?? 0.9;
  const flameHeight = fx.p[1] ?? 0.5;
  const opacity     = fx.p[2] ?? 0.75;

  // 🔥 Animate fire flow via background shift (GPU safe)
  const offset = (time * 0.02 * flameSpeed) % 100;

  layer.style.opacity = opacity;
  layer.style.backgroundPosition = `
    ${offset}% 0%,
    ${100 - offset}% 100%
  `;
  layer.style.filter = `
    blur(${2 + flameHeight * 3}px)
    drop-shadow(0 0 ${10 + flameHeight * 10}px rgba(255,90,20,0.6))
  `;
}

},
"fx_effect_phoenix_hot_hands_burst": {
  scope: "frame",
  params: ["radius", "speed", "softness", "intensity"],
  defaults: [1, 1, 0.6, 0.8],

  // ======================
  // BUILD DOM
  // ======================
  apply({ fx, host }) {

    host.querySelectorAll(".fx-phoenix-hot-hands-wrapper")
      .forEach(n => n.remove());

    const wrapper = document.createElement("div");
    wrapper.className = "fx-phoenix-hot-hands-wrapper";

    Object.assign(wrapper.style, {
      position: "absolute",
      inset: "0",
      overflow: "hidden",
      pointerEvents: "none"
    });

    const el = document.createElement("div");
    el.className = "fx-phoenix-hot-hands";

Object.assign(el.style, {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "140%",
  height: "140%",
  transform: "translate(-50%, -50%)"
});

    wrapper.appendChild(el);

    const root = host?.closest?.(".frame") || host;
    (root.querySelector(".frame-fx.front") || root).appendChild(wrapper);

    fx._wrapper = wrapper;
    fx._el = el;
    fx._phase = Math.random() * Math.PI * 2;
  },

  // ======================
  // FRAME TICK
  // ======================
  _tick(ctx, fx) {
    if (!fx.on || !fx._el || !fx._wrapper) return;

    const radius    = fx.p?.[0] ?? 1;
    const speed     = fx.p?.[1] ?? 1;
    const softness  = fx.p?.[2] ?? 0.6;
    const intensity = fx.p?.[3] ?? 0.8;

    fx._phase += 0.04 * speed;
    const pulse = 0.65 + Math.sin(fx._phase) * 0.35;

    // 🔒 FRAME-SCALED RADIUS (FIX)
    const scale = radius * pulse * 1.25;

    fx._el.style.transform =
      `translate(-50%, -50%) scale(${scale})`;

    fx._el.style.setProperty("--soft", softness);
    fx._el.style.setProperty("--glow", pulse);
    fx._el.style.setProperty("--opacity", intensity * pulse);
  },

  // ======================
  // CLEANUP
  // ======================
  cleanup({ fx }) {
    fx._wrapper?.remove();
    fx._wrapper = null;
    fx._el = null;
    fx._phase = null;
  }
},


/* ---------------------------------------------
 * EFFECT — Curveball Flash
 * ------------------------------------------- */
"fx_effect_phoenix_curveball_flash": {
  scope: "effect",
  params: ["arcAngle", "arcWidth", "flashStrength", "duration"],
  defaults: [120, 0.35, 0.9, 0.25],
  
  apply({ fx, host }) {
  // 🧹 cleanup previous instances
  host.querySelectorAll(".fx-phoenix-curveball, .fx-phoenix-curveball-flash")
      .forEach(n => n.remove());

  const arcAngle      = fx.p[0] ?? 120;
  const arcWidth      = fx.p[1] ?? 0.35;
  const flashStrength = fx.p[2] ?? 0.9;
  const duration      = fx.p[3] ?? 0.25;

  // 🔥 arc sweep
  const arc = document.createElement("div");
  arc.className = "fx-phoenix-curveball";
  host.appendChild(arc);

  arc.style.setProperty("--arc-angle", `${arcAngle}deg`);
  arc.style.setProperty("--arc-width", arcWidth);
  arc.style.animationDuration = `${duration}s`;

  // 💥 flash pop
  const flash = document.createElement("div");
  flash.className = "fx-phoenix-curveball-flash";
  host.appendChild(flash);

Object.assign(flash.style, {
  background:
    `radial-gradient(circle at center,
      rgba(255,220,120,${0.85 * flashStrength}),
      rgba(255,140,40,${0.55 * flashStrength}) 40%,
      rgba(255,80,0,${0.25 * flashStrength}) 65%,
      transparent 75%)`,
  mixBlendMode: "screen",
  opacity: 1,
  animation: "phoenixFlashFade 0.18s ease-out forwards"
});


  // auto cleanup
  setTimeout(() => {
    arc.remove();
    flash.remove();
  }, duration * 1000 + 80);
}

},

/* ---------------------------------------------
 * EFFECT — Run It Back Ignition
 * ------------------------------------------- */
"fx_effect_phoenix_run_it_back_ignition": {
  scope: "effect",
  params: ["collapseSpeed", "fireIntensity", "rebirthDelay"],
  defaults: [0.8, 1, 0.2],
  
  apply({ fx, host }) {
  // 🧹 cleanup previous instances
  host.querySelectorAll(".fx-phoenix-rib, .fx-phoenix-rib-burst")
      .forEach(n => n.remove());

  const collapseSpeed = fx.p[0] ?? 0.8;
  const fireIntensity = fx.p[1] ?? 1;
  const rebirthDelay  = fx.p[2] ?? 0.2;

  const totalCollapse = 220 / collapseSpeed;
  const reigniteAt = totalCollapse + rebirthDelay * 1000;

  // 🔥 collapsing fire silhouette
  const core = document.createElement("div");
  core.className = "fx-phoenix-rib";
  host.appendChild(core);

  core.style.setProperty("--intensity", fireIntensity);
  core.style.animationDuration = `${totalCollapse}ms`;

  // 🔥 reignite burst
  const burst = document.createElement("div");
  burst.className = "fx-phoenix-rib-burst";

  setTimeout(() => {
    host.appendChild(burst);
  }, reigniteAt);

  // 🧹 final cleanup
  setTimeout(() => {
    core.remove();
    burst.remove();
  }, reigniteAt + 300);
  },

  destroy({ host, fx }) {
    host.querySelectorAll(".fx-phoenix-rib, .fx-phoenix-rib-burst")
        .forEach(n => n.remove());
    fx._tick = null;
  }
},

/* ---------------------------------------------
 * Y O R U — EFFECT — Gatecrash Fracture (Looping)
 * ------------------------------------------- */
"fx_effect_yoru_gatecrash_tear": {
  scope: "effect",
  params: ["size", "intensity", "cycle", "layer"],
  defaults: [1.0, 0.85, 4.5, 1],

  apply({ fx, host, time }) {
    if (!host) return;

    const frame = host.closest?.(".frame") || document.querySelector(".frame");
    if (!frame) return;

    const art = frame.querySelector(".frame-art-inner") || frame.querySelector(".frame-art");

    const size  = Math.max(0.6, Math.min(1.8, fx.p?.[0] ?? 1.0));
    const inten = Math.max(0.0, Math.min(1.0, fx.p?.[1] ?? 0.85));
    const cycle = Math.max(2.2, Math.min(12.0, fx.p?.[2] ?? 4.5));
    const layer = (fx.p?.[3] ?? 1) ? 1 : 0;

    /* ---------- ROOT INIT ---------- */

    if (!fx._root || !fx._root.isConnected) {

      host.querySelectorAll(".fx-yoru-gatecrash").forEach(n => n.remove());

      const root = document.createElement("div");
      root.className = "fx-yoru-gatecrash";

      root.innerHTML = `
        <div class="fx-yoru-aura"></div>
        <div class="fx-yoru-rift">
          <div class="fx-yoru-core"></div>
          <div class="fx-yoru-split fx-yoru-splitL"></div>
          <div class="fx-yoru-split fx-yoru-splitR"></div>
        </div>
        <div class="fx-yoru-shards"></div>
      `;

      const layers = ensureFxLayers?.();
      const fxHost = layers ? (layer ? layers.front : layers.behind) : host;
      if (!fxHost) return;

      fxHost.appendChild(root);
      fx._root = root;

      fx._art = art || null;

      // Capture original filter ONCE per enable
      if (fx._art && !fx._capturedOriginal) {
        fx._origFilter = fx._art.style.filter || "";
        fx._capturedOriginal = true;
      }

      fx._shardBurst = -1;
    }

    const root = fx._root;
    if (!root) return;

    /* ---------- TIMING ---------- */

    const u = (time % cycle) / cycle;

    const clamp = v => Math.max(0, Math.min(1, v));

    const auraEnd    = 0.25;
    const splitStart = 0.45;
    const splitEnd   = 0.75;
    const shardStart = 0.75;

    const seamProgress  = clamp((u - auraEnd) / (splitStart - auraEnd));

    let splitProgress = 0;
    if (u >= splitStart && u <= splitEnd) {
      splitProgress = (u - splitStart) / (splitEnd - splitStart);
    } else if (u > splitEnd) {
      splitProgress = 1;
    }

    splitProgress = splitProgress * splitProgress; // ease

    const shardProgress = clamp((u - shardStart) / (1 - shardStart));

    const splitDist = splitProgress * (frame.clientWidth * 0.5);

    /* ---------- CSS VARS ---------- */

    root.style.setProperty("--s", size);
    root.style.setProperty("--i", inten);
    root.style.setProperty("--aura", clamp(u / auraEnd));
    root.style.setProperty("--rift", clamp(seamProgress + splitProgress));
    root.style.setProperty("--split", splitDist + "px");
    root.style.setProperty("--splitProgress", splitProgress);
    root.style.setProperty("--sh", shardProgress);

    /* ---------- CENTER SEAM VISIBILITY ---------- */

    const core = root.querySelector(".fx-yoru-core");
    if (core) {
      core.style.opacity = splitProgress > 0.02 ? "0" : "1";
    }

    /* ---------- ART BLUE BOOST ---------- */

if (fx._art) {

  const energy = splitProgress; // grows as seams open

  if (energy > 0.001) {

    const sat = 1 + 0.6 * energy;
    const bright = 1 + 0.2 * energy;
    const contrast = 1 + 0.15 * energy;

    fx._art.style.filter =
      `saturate(${sat.toFixed(3)}) brightness(${bright.toFixed(3)}) contrast(${contrast.toFixed(3)})`;

  } else {
    fx._art.style.filter = fx._origFilter || "";
  }
}


    /* ---------- SHARDS ---------- */

    const shardsHost = root.querySelector(".fx-yoru-shards");
    const cycleIndex = Math.floor(time / cycle);

    if (shardsHost && u >= shardStart && fx._shardBurst !== cycleIndex) {

      fx._shardBurst = cycleIndex;
      shardsHost.innerHTML = "";

      const count = Math.round(10 + 18 * inten);

      for (let i = 0; i < count; i++) {

        const shard = document.createElement("div");
        shard.className = "fx-yoru-shard";

        shard.style.setProperty("--x", (15 + Math.random() * 70) + "%");
        shard.style.setProperty("--y", (35 + Math.random() * 20) + "%");
        shard.style.setProperty("--dx", ((Math.random() - 0.5) * 60) + "px");
        shard.style.setProperty("--dur", (0.6 + Math.random() * 0.8) + "s");
        shard.style.setProperty("--d", (Math.random() * 0.2) + "s");
        shard.style.setProperty("--sc", (0.6 + Math.random() * 1.2));

        shardsHost.appendChild(shard);
      }
    }
  },

  cleanup({ fx }) {

    if (fx?._root?.isConnected) {
      fx._root.remove();
    }

    if (fx?._art) {
      fx._art.style.filter = fx._origFilter || "";
    }

    fx._root = null;
    fx._art = null;
    fx._origFilter = null;
    fx._capturedOriginal = false;
    fx._shardBurst = -1;
  }
},


/* ---------------------------------------------
 * FRAME — Oni Mask Reveal (Yoru Signature)
 * ------------------------------------------- */
"fx_frame_yoru_oni_reveal": {
  scope: "frame",

  params: ["maskOpacity", "blinkRate", "glow", "maskX", "maskY", "maskScale", "maskRotDeg", "layer"],
  defaults: [0.85, 0.55, 0.7, 1, 1, 1.0, -12, 1],

  // ==========================
  // BUILD
  // ==========================
  apply({ fx, host }) {

    if (!fx.p || fx.p.length === 0) {
      fx.p = [...this.defaults];
    }

    const frame =
      host?.closest?.(".frame") ||
      document.querySelector(".frame");

    if (!frame) return;

    const layers = ensureFxLayers?.();
    const layerIndex = (fx.p?.[7] ?? 1) ? 1 : 0;
    const wrap = layerIndex
      ? layers?.front || frame.querySelector(".frame-fx.front")
      : layers?.behind || frame.querySelector(".frame-fx.behind");

    if (!wrap) return;

    wrap.querySelectorAll(".fx-yoru-oni").forEach(n => n.remove());

    const root = document.createElement("div");
    root.className = "fx-yoru-oni";
    root.innerHTML = `<div class="fx-yoru-oni-mask-img"></div>`;

    wrap.appendChild(root);

    fx._oniRoot = root;
    fx._lastLayer = layerIndex;
  },

  // ==========================
  // TICK
  // ==========================
  _tick(ctx, fxRef) {

    const fx = ctx?.fx || fxRef;
    const t  = ctx?.time ?? 0;

    if (!fx || !fx.on || !fx._oniRoot) return;

    const frame = fx._oniRoot.closest(".frame");
    if (!frame) return;

    const mask = fx._oniRoot.querySelector(".fx-yoru-oni-mask-img");
    if (!mask) return;

    // -------- READ PARAMS --------
    const opacity = fx.p?.[0] ?? 0.85;
    const blink   = fx.p?.[1] ?? 0.55;
    const glow    = fx.p?.[2] ?? 0.7;

    let xIn       = fx.p?.[3] ?? 1;
    let yIn       = fx.p?.[4] ?? 1;
    let scaleIn   = fx.p?.[5] ?? 1.0;
    const rot     = fx.p?.[6] ?? -12;
    const layer   = (fx.p?.[7] ?? 1) ? 1 : 0;

    // -------- LAYER SWITCH --------
    if (fx._lastLayer !== layer) {
      const layers = ensureFxLayers?.();
      const target = layer
        ? layers?.front || frame.querySelector(".frame-fx.front")
        : layers?.behind || frame.querySelector(".frame-fx.behind");

      if (target) {
        target.appendChild(fx._oniRoot);
        fx._lastLayer = layer;
      }
    }

    // -------- NORMALIZE SLIDERS --------
    // Your sliders are roughly 0–2 with 1 as center.
    const pxRangeX = frame.clientWidth  * 0.35;
    const pxRangeY = frame.clientHeight * 0.35;

    const x = (xIn - 1) * pxRangeX;
    const y = (yIn - 1) * pxRangeY;

    const scale = Math.max(0.25, scaleIn);

    // -------- HEARTBEAT PULSE --------
    const freq  = 0.8 + blink * 2.2;
    const pulse = Math.sin(t * freq) * 0.5 + 0.5;
    const alpha = opacity * (0.55 + pulse * 0.45);

    // -------- BIND IMAGE ONCE --------
    if (!mask.dataset.bound) {
      mask.dataset.bound = "1";
      mask.style.backgroundImage = `url("${ONI_MASK_URL}")`;
    }

    // -------- APPLY STYLES --------
    mask.style.setProperty("--oniAlpha", alpha.toFixed(3));
    mask.style.setProperty("--oniGlow",  glow.toFixed(3));
    mask.style.setProperty("--oniX",     `${x}px`);
    mask.style.setProperty("--oniY",     `${y}px`);
    mask.style.setProperty("--oniScale", scale);
    mask.style.setProperty("--oniRot",   `${rot}deg`);
  },

  // ==========================
  // CLEANUP
  // ==========================
  cleanup({ fx }) {
    if (fx?._oniRoot) fx._oniRoot.remove();
    fx._oniRoot = null;
  }
},

/* ---------------------------------------------
 * EFFECT — Relay Bolt (Neon)
 * ------------------------------------------- */
"fx_effect_neon_relay_bolt": {
  scope: "effect",
  params: ["layer", "color", "strength", "count", "spread", "life", "glow"],
  defaults: [1, "#41ffaf", 0.85, 0.55, 0.55, 0.45, 0.8],

  apply({ fx, host, time }) {
	  
	  const clamp01 = v => Math.max(0, Math.min(1, v));

    // layer: 1=Front, 0=Behind
    const layer = (fx.p?.[0] ?? 1) ? 1 : 0;

    // ✅ IMPORTANT: resolve from .frame (not .frame-art)
    let frame = host;

    // if host is a layer node, climb to .frame
    if (frame?.classList?.contains("front") || frame?.classList?.contains("behind")) {
      frame = frame.closest(".frame");
    }

    // if host is frame-art, climb to .frame
    if (frame?.classList?.contains("frame-art")) {
      frame = frame.closest(".frame");
    }

    // otherwise try generic climb
    if (!frame?.classList?.contains("frame")) {
      frame = host?.closest?.(".frame") || document.querySelector(".frame");
    }

    if (!frame) return;

    // ✅ now query the sibling layer containers correctly
    const layerHost = frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");
    if (!layerHost) return;

    // --- params ---
    const color    = fx.p?.[1] ?? "#41ffaf";
    const strength = clamp01(fx.p?.[2] ?? 0.85);
    const count01  = clamp01(fx.p?.[3] ?? 0.55);
    const spread01 = clamp01(fx.p?.[4] ?? 0.55);
    const life01   = clamp01(fx.p?.[5] ?? 0.45);
    const glow01   = clamp01(fx.p?.[6] ?? 0.8);

    const bolts  = Math.max(2, Math.round(2 + count01 * 10)); // 2..12
    const spread = 20 + spread01 * 140;                       // px
    const dur    = 220 + life01 * 680;                        // ms
    const amp    = 0.55 + strength * 1.35;

    // 🔥 stronger glow mapping
    const g = 0.15 + glow01 * 2.2;
    const boltAlpha = 0.55 + glow01 * 0.45;

    // --- time-based emission ---
    const t = performance.now();
    if (fx._rbLast == null) fx._rbLast = 0;

    const interval = Math.max(110, Math.round(dur * 0.55));
    if (t - fx._rbLast < interval) return;
    fx._rbLast = t;

    // Clear bolts ONLY if layer flips
    if (fx._rbLayer == null) fx._rbLayer = layer;
    if (fx._rbLayer !== layer) {
      frame.querySelectorAll(".fx-neon-relaybolt").forEach(n => n.remove());
      fx._rbLayer = layer;
    }

    // --- spawn burst ---
    for (let i = 0; i < bolts; i++) {
      const b = document.createElement("div");
      b.className = "fx-neon-relaybolt";

      const center = frame.clientHeight * 0.5;
const spreadOffset = (Math.random() - 0.5) * spread;
const y = center + spreadOffset;


      const skew = (Math.random() * 14 - 7);
      const wiggle = 6 + Math.random() * 16;

      b.style.setProperty("--y", `${y}px`);
      b.style.setProperty("--skew", `${skew}deg`);
      b.style.setProperty("--wiggle", `${wiggle}px`);
      b.style.setProperty("--dur", `${dur}ms`);
      b.style.setProperty("--amp", `${amp}`);
      b.style.setProperty("--g", `${g}`);

      // ✅ color picker + brightness
      b.style.setProperty("--c", color);
      b.style.setProperty("--a", `${boltAlpha}`);

      b.style.animationDelay = `${Math.random() * 70}ms`;

      layerHost.appendChild(b);
      setTimeout(() => b.remove(), dur + 160);
    }
  }
},


/* ---------------------------------------------
 * FRAME — High Gear (Neon)
 * ------------------------------------------- */
"fx_frame_neon_high_gear": {
  scope: "frame",

  params: ["layer", "color", "strength", "streaks", "speed", "glow", "opacity"],
  defaults: [1, "#41ffaf", 0.75, 0.55, 0.6, 0.75, 0.7],

  // ==========================
  // BUILD (once)
  // ==========================
  apply({ fx, host }) {

    if (!fx.p || fx.p.length === 0) {
      fx.p = [...this.defaults];
    }

    const frame =
      host?.closest?.(".frame") ||
      document.querySelector(".frame");

    if (!frame) return;

    const art = frame.querySelector(".frame-art-inner");
    if (!art) return;

    const layer = (fx.p?.[0] ?? 1) ? 1 : 0;

    const layerHost =
      frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");

    if (!layerHost) return;

    let root = document.createElement("div");
    root.className = "fx-neon-highgear";

    Object.assign(root.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      overflow: "hidden"
    });

    const artBg = getComputedStyle(art).backgroundImage;

    root.style.webkitMaskImage = artBg;
    root.style.webkitMaskRepeat = "no-repeat";
    root.style.webkitMaskSize = "contain";
    root.style.webkitMaskPosition = "center";

    root.style.maskImage = artBg;
    root.style.maskRepeat = "no-repeat";
    root.style.maskSize = "contain";
    root.style.maskPosition = "center";

    layerHost.appendChild(root);

    fx._root = root;
    fx._lastLayer = layer;
  },

  // ==========================
  // TICK (live slider response)
  // ==========================
  _tick(ctx, fxRef) {

    const fx = ctx?.fx || fxRef;
    if (!fx || !fx.on || !fx._root) return;

    const frame = fx._root.closest(".frame");
    if (!frame) return;

    const clamp01 = v => Math.max(0, Math.min(1, v));

    const layer     = (fx.p?.[0] ?? 1) ? 1 : 0;
    const color     = fx.p?.[1] ?? "#41ffaf";
    const strength  = clamp01(fx.p?.[2] ?? 0.75);
    const streaks01 = clamp01(fx.p?.[3] ?? 0.55);
    const speed01   = clamp01(fx.p?.[4] ?? 0.6);
    const glow01    = clamp01(fx.p?.[5] ?? 0.75);
    const op        = clamp01(fx.p?.[6] ?? 0.7);

    // ---- layer switching ----
    if (fx._lastLayer !== layer) {
      const target =
        frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");
      if (target) {
        target.appendChild(fx._root);
        fx._lastLayer = layer;
      }
    }

    const streaks = Math.max(4, Math.round(4 + streaks01 * 18));
    const dur = 0.35 + (1 - speed01) * 1.2;
    const amp = 0.4 + strength * 1.6;
    const g   = 0.35 + glow01 * 1.25;

    fx._root.style.setProperty("--c", color);
    fx._root.style.setProperty("--amp", amp);
    fx._root.style.setProperty("--g", g);
    fx._root.style.setProperty("--op", op);
    fx._root.style.setProperty("--dur", `${dur}s`);

    // ---- rebuild streaks only if count changed ----
    if (fx._lastCount !== streaks) {

      fx._root.innerHTML = "";

      for (let i = 0; i < streaks; i++) {
        const s = document.createElement("i");
        s.className = "streak";

        s.style.left = `${Math.random() * 100}%`;
        s.style.top  = `${Math.random() * 100}%`;

        s.style.setProperty("--d", `${Math.random() * 0.25}s`);
        s.style.setProperty("--w", `${Math.round(80 + Math.random() * 220)}px`);
        s.style.setProperty("--h", `${(1 + Math.random() * 3).toFixed(2)}px`);

        fx._root.appendChild(s);
      }

      fx._lastCount = streaks;
    }
  },

  // ==========================
  // CLEANUP
  // ==========================
  cleanup({ fx }) {
    if (fx?._root) fx._root.remove();
    fx._root = null;
  }
},


/* ---------------------------------------------
 * FRAME — Overdrive (Neon)
 * ------------------------------------------- */
"fx_frame_neon_overdrive": {
  scope: "frame",

  params: ["layer", "color", "strength", "pulse", "scan", "sparks", "glow"],
  defaults: [1, "#41ffaf", 0.8, 0.55, 0.55, 0.55, 0.85],

  // ==========================
  // TICK (frame loop uses THIS)
  // ==========================
_tick(arg1, arg2) {

  const ctx = (typeof arg1 === "object" && arg1) ? arg1 : null;
  const fx  = ctx ? ctx.fx : arg2;
  const host = ctx ? ctx.host : null;
  const time = ctx ? ctx.time : arg1;

  if (!fx || !fx.on) return;



    const clamp01 = v => Math.max(0, Math.min(1, v));

    // resolve frame-art
const frame =
  host?.closest?.(".frame") ||
  document.querySelector(".frame");

if (!frame) return;

const art = frame.querySelector(".frame-art-inner");
if (!art) return;

    if (!art) return;

    // layer: 0 = behind, 1 = front
    const layer = parseInt(fx.p?.[0] ?? 1, 10) ? 1 : 0;

const layerHost =
  frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");


    if (!layerHost) return;

    // ==========================
    // ROOT (UNMASKED)
    // ==========================
let root = frame.querySelector(".fx-neon-overdrive");


    if (!root) {
      root = document.createElement("div");
      root.className = "fx-neon-overdrive";
    }

    // always move to correct layer
    if (root.parentElement !== layerHost) {
      layerHost.appendChild(root);
    }

    Object.assign(root.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none"
    });

    // ==========================
    // INNER (MASKED)
    // ==========================
    let inner = root.querySelector(".fx-neon-overdrive-inner");

    if (!inner) {
      inner = document.createElement("div");
      inner.className = "fx-neon-overdrive-inner";
      inner.innerHTML = `
        <div class="core"></div>
        <div class="scan"></div>
        <div class="sparks"></div>
      `;
      root.appendChild(inner);
    }

    Object.assign(inner.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none",
      overflow: "hidden"
    });

    // mask ONLY inner
    const artBg = getComputedStyle(art).backgroundImage;

    inner.style.webkitMaskImage = artBg;
    inner.style.webkitMaskRepeat = "no-repeat";
    inner.style.webkitMaskSize = "contain";
    inner.style.webkitMaskPosition = "center";

    inner.style.maskImage = artBg;
    inner.style.maskRepeat = "no-repeat";
    inner.style.maskSize = "contain";
    inner.style.maskPosition = "center";

    // ==========================
    // PARAMS (live)
    // ==========================
    const color    = fx.p?.[1] ?? "#41ffaf";
    const strength = clamp01(fx.p?.[2] ?? 0.8);
    const pulse01  = clamp01(fx.p?.[3] ?? 0.55);
    const scan01   = clamp01(fx.p?.[4] ?? 0.55);
    const sparks01 = clamp01(fx.p?.[5] ?? 0.55);
    const glow01   = clamp01(fx.p?.[6] ?? 0.85);

    const amp = 0.5 + strength * 1.6;
    const g   = 0.35 + glow01 * 1.25;

    inner.style.setProperty("--c", color);
    inner.style.setProperty("--amp", amp);
    inner.style.setProperty("--g", g);
    inner.style.setProperty("--pulse", (0.7 + pulse01 * 1.8).toFixed(2));
    inner.style.setProperty("--scan", (0.35 + scan01 * 1.3).toFixed(2));

    // ==========================
    // SPARKS
    // ==========================
    const sparkWrap = inner.querySelector(".sparks");
    if (!sparkWrap) return;

    const target = Math.max(6, Math.round(6 + sparks01 * 22));

    if (sparkWrap.children.length !== target) {
      sparkWrap.innerHTML = "";
      for (let i = 0; i < target; i++) {
        const sp = document.createElement("i");
        sp.className = "spark";
        sp.style.left = `${Math.random() * 100}%`;
        sp.style.top  = `${Math.random() * 100}%`;
        sp.style.setProperty("--d", `${Math.random() * 0.6}s`);
        sp.style.setProperty("--s", `${(0.6 + Math.random() * 1.4).toFixed(2)}`);
        sparkWrap.appendChild(sp);
      }
    }
  },

cleanup() {

  document
    .querySelectorAll(".fx-neon-overdrive")
    .forEach(n => n.remove());

}


},



/* ---------------------------------------------
 * FRAME — Incendiary Burn (Brimstone)
 * ------------------------------------------- */
"fx_frame_brimstone_incendiary_burn": {
  scope: "frame",

  params: ["layer", "strength"],
  defaults: [0, 0.75],

_tick(arg1, arg2) {

  const ctx  = (typeof arg1 === "object" && arg1) ? arg1 : null;
  const fx   = ctx ? ctx.fx : arg2;
  const host = ctx ? ctx.host : null;

  if (!fx || !fx.on) return;


    const frame =
      host?.closest?.(".frame") ||
      document.querySelector(".frame");

    if (!frame) return;

    const layer = parseInt(fx.p?.[0] ?? 0, 10) ? 1 : 0;

    const layerHost =
      frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");

    if (!layerHost) return;

    // ==========================
    // ROOT
    // ==========================
    let root = frame.querySelector(".fx-brim-debug");

    if (!root) {
      root = document.createElement("div");
      root.className = "fx-brim-debug";
      root.innerHTML = `<div class="burn"></div>`;
    }

    if (root.parentElement !== layerHost) {
      layerHost.appendChild(root);
    }

    Object.assign(root.style, {
      position: "absolute",
      inset: "0",
      pointerEvents: "none"
    });

    const burn = root.querySelector(".burn");

    const strength = Math.max(0, Math.min(1, fx.p?.[1] ?? 0.75));

    Object.assign(burn.style, {
      position: "absolute",
      inset: "0",
      background: "radial-gradient(circle at 50% 80%, rgba(255,120,40,0.65), transparent 70%)",
      opacity: strength
    });
  },

  cleanup() {
    document.querySelectorAll(".fx-brim-debug")
      .forEach(n => n.remove());
  }
},


/* ---------------------------------------------
 * FRAME — Sky Smoke (Brimstone)
 * ------------------------------------------- */
"fx_frame_brimstone_sky_smoke": {
  scope: "effect",
  params: ["layer", "color", "density", "drift", "turbulence", "softness", "opacity"],
  defaults: [0, "#a9b2bd", 0.6, 0.45, 0.55, 0.75, 0.65],

  apply({ fx, host, time }) {
    const layer = (fx.p?.[0] ?? 0) ? 1 : 0;

    // ✅ resolve from .frame (matches your new structure)
    const frame = host?.closest?.(".frame") || document.querySelector(".frame");
    if (!frame) return;

    const layerHost = frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");
    if (!layerHost) return;

    // root
    let root = layerHost.querySelector(".fx-brim-smoke");
    if (!root) {
      root = document.createElement("div");
      root.className = "fx-brim-smoke";
      root.innerHTML = `
        <div class="smoke-plumes"></div>
        <div class="smoke-ash"></div>
      `;
      layerHost.appendChild(root);
    }

    // params
    const color      = fx.p?.[1] ?? "#a9b2bd";
    const density01  = clamp01(fx.p?.[2] ?? 0.6);
    const drift01    = clamp01(fx.p?.[3] ?? 0.45);
    const turb01     = clamp01(fx.p?.[4] ?? 0.55);
    const soft01     = clamp01(fx.p?.[5] ?? 0.75);
    const op         = clamp01(fx.p?.[6] ?? 0.65);

    // mapping
    const plumes = Math.max(3, Math.round(3 + density01 * 9)); // 3..12
    const ash    = Math.max(6, Math.round(6 + density01 * 22)); // 6..28

    const driftDur = 4.2 + (1 - drift01) * 6.0; // 4.2..10.2 sec
    const wobbleDur = 2.0 + (1 - turb01) * 3.8; // 2..5.8 sec
    const blur = (1.0 + soft01 * 3.5).toFixed(2); // px
    const amp = 0.35 + density01 * 1.25;

    root.style.setProperty("--c", color);
    root.style.setProperty("--op", op);
    root.style.setProperty("--amp", amp);
    root.style.setProperty("--blur", `${blur}px`);
    root.style.setProperty("--driftDur", `${driftDur}s`);
    root.style.setProperty("--wobbleDur", `${wobbleDur}s`);

    // plumes build
    const plumeWrap = root.querySelector(".smoke-plumes");
    if (plumeWrap.children.length !== plumes) {
      plumeWrap.innerHTML = "";
      for (let i = 0; i < plumes; i++) {
        const p = document.createElement("i");
        p.className = "plume";
        p.style.left = `${Math.random() * 120 - 10}%`;
        p.style.top  = `${Math.random() * 40 + 35}%`; // mid/lower
        p.style.setProperty("--s", `${(0.9 + Math.random() * 1.6).toFixed(2)}`);
        p.style.setProperty("--d", `${(Math.random() * 1.4).toFixed(2)}s`);
        p.style.setProperty("--x", `${Math.round(18 + Math.random() * 60)}px`);
        p.style.setProperty("--y", `${Math.round(12 + Math.random() * 36)}px`);
        plumeWrap.appendChild(p);
      }
    }

    // ash build
    const ashWrap = root.querySelector(".smoke-ash");
    if (ashWrap.children.length !== ash) {
      ashWrap.innerHTML = "";
      for (let i = 0; i < ash; i++) {
        const a = document.createElement("i");
        a.className = "ash";
        a.style.left = `${Math.random() * 100}%`;
        a.style.top  = `${Math.random() * 100}%`;
        a.style.setProperty("--s", `${(0.4 + Math.random() * 1.6).toFixed(2)}`);
        a.style.setProperty("--d", `${(Math.random() * 2.0).toFixed(2)}s`);
        a.style.setProperty("--t", `${(2.2 + Math.random() * 2.6).toFixed(2)}s`);
        ashWrap.appendChild(a);
      }
    }
  },

  destroy({ host }) {
    const frame = host?.closest?.(".frame") || document.querySelector(".frame");
    if (!frame) return;
    frame.querySelectorAll(".fx-brim-smoke").forEach(n => n.remove());
  }
},

/* ---------------------------------------------
 * EFFECT — Orbital Strike (Brimstone)
 * ------------------------------------------- */
"fx_effect_brimstone_orbital_strike": {
  scope: "effect",
params: ["layer", "color", "strength", "size", "pulse", "shock", "glow", "cooldown"],
defaults: [1, "#ff3b1f", 0.85, 0.55, 0.6, 0.65, 0.85, 1.2],

  apply({ fx, host, time }) {
	  const clamp01 = v => Math.max(0, Math.min(1, v));

    const layer = (fx.p?.[0] ?? 1) ? 1 : 0;

    // ✅ resolve from .frame
    const frame = host?.closest?.(".frame") || document.querySelector(".frame");
    if (!frame) return;

    const layerHost = frame.querySelector(layer ? ".frame-fx.front" : ".frame-fx.behind");
    if (!layerHost) return;

    // params
    const color     = fx.p?.[1] ?? "#ff3b1f";
    const strength  = clamp01(fx.p?.[2] ?? 0.85);
    const size01    = clamp01(fx.p?.[3] ?? 0.55);
    const pulse01   = clamp01(fx.p?.[4] ?? 0.6);
    const shock01   = clamp01(fx.p?.[5] ?? 0.65);
    const glow01    = clamp01(fx.p?.[6] ?? 0.85);

    const amp = 0.4 + strength * 1.9;
    // invert blur scale
const g = 0.6 + (1 - glow01) * 1.6;

    // emission timing
    const t = performance.now();

    if (fx._orbLast == null) fx._orbLast = 0;

    // pulse rate (lower pulse slider => slower)
    const interval = 650 + (1 - pulse01) * 1100; // 650..1750ms
    if (t - fx._orbLast < interval) return;
    fx._orbLast = t;

    // size in px based on frame size
    const rect = frame.getBoundingClientRect();
    const base = Math.min(rect.width, rect.height);
    const R = Math.max(48, Math.round(base * (0.09 + size01 * 0.14)));

    // pick center point (biased slightly lower for "ground strike" vibe)
    const cx = rect.width * (0.35 + Math.random() * 0.30); // 35%..65%
    const cy = rect.height * (0.46 + Math.random() * 0.22); // 46%..68%

    // create burst root
    const root = document.createElement("div");
    root.className = "fx-brim-orbital";
    root.style.left = `${cx}px`;
    root.style.top  = `${cy}px`;
	root.style.willChange = "opacity";
	
    root.style.setProperty("--c", color);
    root.style.setProperty("--amp", amp);
    root.style.setProperty("--g", g);
    root.style.setProperty("--r", `${R}px`);
    root.style.setProperty("--shock", (0.6 + shock01 * 1.6).toFixed(2));
	root.style.setProperty("--shockAmp", (0.4 + shock01 * 2.0).toFixed(2));
	root.style.setProperty("--pulseSpeed", (0.6 + pulse01 * 1.6).toFixed(2));
	root.style.setProperty("--icon", `url("${ORBITAL_ICON_URL}")`);

root.innerHTML = `
  <div class="reticle">
    <div class="orb-icon"></div>
  </div>
  <div class="ring ring-a"></div>
  <div class="ring ring-b"></div>
  <div class="shockwave"></div>
`;

    layerHost.appendChild(root);

// ==========================
// HARD FADE OUT (NO LINGER)
// ==========================

const pulseDurMs = (0.6 + pulse01 * 1.6) * 1000;
const shockExtraMs = shock01 * 250;
const life = pulseDurMs + shockExtraMs;

// start fade
setTimeout(() => {

  root.style.transition = "opacity 220ms ease-out, filter 220ms ease-out";
  root.style.opacity = "0";

  // 🔥 kill glow immediately
  root.style.filter = "none";
  root.style.mixBlendMode = "normal";

}, life - 220);

// remove after fade
setTimeout(() => {
  root.remove();
}, life);
  }
},


// ======================
// R A Z E
// ======================

"fx_frame_raze_party_wave": {
  scope: "frame",

  params: [
    "popRate",
    "popSize",
    "waveStrength",
    "waveSpeed",
    "waveThickness",
    "waveY",
    "colorA",
    "colorB"
  ],
  defaults: [1, 1, 0.9, 1, 0.6, 66, "#ffb000", "#ff00ff"],

  // ==========================
  // BUILD
  // ==========================
  apply({ fx, host }) {

    const front = host.querySelector(".frame-fx.front") || host;
    const art = host.querySelector(".frame-art-inner");
    if (!front || !art) return;

    let wrap = front.querySelector(".fx-raze-party");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "fx-raze-party";
      front.appendChild(wrap);
    }

    let wave = art.parentElement.querySelector(".fx-raze-synthwave");
    if (!wave) {
      wave = document.createElement("div");
      wave.className = "fx-raze-synthwave";
      art.parentElement.appendChild(wave);
    }

    fx._wrap = wrap;
    fx._wave = wave;
    fx._lastPop = 0;
    fx._wavePulse = 0;
  },

  // ==========================
  // FRAME TICK
  // ==========================
  _tick(ctx, fx) {

    if (!fx.on || !fx._wrap || !fx._wave) return;

    const host = window.__FRAME_FX_HOST || frameArt;
    const art = host.querySelector(".frame-art-inner");

    const popRate  = fx.p?.[0] ?? 1;
    const popSize  = fx.p?.[1] ?? 1;
    const waveStr  = fx.p?.[2] ?? 0.9;
    const waveSpd  = fx.p?.[3] ?? 1;
    const waveThk  = fx.p?.[4] ?? 0.6;
    const waveY    = fx.p?.[5] ?? 66;
    const colorA   = fx.p?.[6] ?? "#ffb000";
    const colorB   = fx.p?.[7] ?? "#ff00ff";

    // -------------------------
    // POP TIMING
    // -------------------------
    const now = performance.now();
    const popEvery = 320 / Math.max(0.1, popRate);

    if (now - fx._lastPop > popEvery) {
      fx._lastPop = now;
      spawnPop();
    }

    // -------------------------
    // WAVE
    // -------------------------
    fx._wavePulse *= 0.9;

    const t = ctx.time * (0.6 + waveSpd * 1.6);
    const pulse = fx._wavePulse;

    const waveYPct = waveY <= 1 ? waveY * 100 : waveY;
fx._wave.style.setProperty("--waveY", `${waveYPct}%`);
    fx._wave.style.setProperty("--waveT", `${t}`);
    fx._wave.style.setProperty("--waveAmp", `${pulse}`);
    fx._wave.style.setProperty("--waveGlow", `${(0.1 + pulse * 0.9) * waveStr}`);
    fx._wave.style.setProperty("--waveThick", `${waveThk}`);
    fx._wave.style.setProperty("--cA", colorA);
    fx._wave.style.setProperty("--cB", colorB);

    if (art) {
      if (pulse > 0.12) {
        art.style.filter =
          `drop-shadow(0 0 ${10 + pulse * 18}px rgba(255,0,255,${0.1 + pulse * 0.25}))`;
      } else {
        art.style.filter = "";
      }
    }

    // -------------------------
    // HELPERS
    // -------------------------
    function spawnPop() {

      const rect = host.getBoundingClientRect();
      const pad = 20;

      const x = pad + Math.random() * (rect.width - pad * 2);
      const y = pad + Math.random() * (rect.height - pad * 2);

      const pop = document.createElement("div");
      pop.className = "fx-raze-pop";

      const size = 26 + popSize * 46;

      pop.style.left = `${x}px`;
      pop.style.top = `${y}px`;
      pop.style.setProperty("--popSize", size);
      pop.style.setProperty("--cA", colorA);
      pop.style.setProperty("--cB", colorB);

      const sparks = 14 + Math.round(popSize * 10);
      for (let i = 0; i < sparks; i++) {
        const sp = document.createElement("div");
        sp.className = "fx-raze-spark";

        const ang = (i / sparks) * Math.PI * 2;
        const r = (0.6 + Math.random() * 0.5) * (size * 0.55);

        sp.style.setProperty("--dx", `${Math.cos(ang) * r}px`);
        sp.style.setProperty("--dy", `${Math.sin(ang) * r}px`);

        pop.appendChild(sp);
      }

      fx._wrap.appendChild(pop);
      setTimeout(() => pop.remove(), 520);

      spawnConfetti(x, y);
      fx._wavePulse = Math.min(1, fx._wavePulse + 0.9);
    }

    function spawnConfetti(x, y) {

      const pieces = 14 + Math.round(popSize * 10);

      for (let i = 0; i < pieces; i++) {
        const c = document.createElement("div");
        c.className = "fx-raze-confetti";
        c.style.left = `${x}px`;
        c.style.top = `${y}px`;

        const ang = Math.random() * Math.PI * 2;
        const dist = 24 + Math.random() * 70;

        c.style.setProperty("--vx", `${Math.cos(ang) * dist}px`);
        c.style.setProperty("--vy", `${Math.sin(ang) * dist + 20}px`);

        const pal = [colorA, colorB, "#ffffff", "#00ffd0"];
        c.style.background = pal[(Math.random() * pal.length) | 0];

        fx._wrap.appendChild(c);
        setTimeout(() => c.remove(), 760);
      }
    }
  },

  // ==========================
  // CLEANUP
  // ==========================
  cleanup({ fx, host }) {

    const front = host.querySelector(".frame-fx.front") || host;
    front?.querySelectorAll(".fx-raze-party").forEach(n => n.remove());

    const art = host.querySelector(".frame-art-inner");
    if (art) {
      art.style.filter = "";
      art.parentElement?.querySelectorAll(".fx-raze-synthwave").forEach(n => n.remove());
    }

    fx._wrap = null;
    fx._wave = null;
    fx._lastPop = null;
    fx._wavePulse = null;
  }
},


"fx_effect_kayo_suppression_pulse": {
  scope: "effect",
  params: ["layer", "color", "intensity", "speed", "radius", "shards"],
  defaults: [1, "#7dffd6", 0.85, 1.0, 0.56, 10],

  apply({ fx, host }) {
    const layer = fx.p?.[0] ?? 1;
    const color = fx.p?.[1] ?? "#7dffd6";
    const intensity = Math.max(0.1, Math.min(1.4, fx.p?.[2] ?? 0.85));
    const speed = Math.max(0.35, Math.min(2.5, fx.p?.[3] ?? 1.0));
    const radius = Math.max(0.25, Math.min(0.85, fx.p?.[4] ?? 0.56));
    const shards = Math.max(0, Math.min(30, Math.round(fx.p?.[5] ?? 10)));

    const target = getFxTargetLayer(host, layer);
    if (!target) return;

    // Create once
    if (!fx._empRoot || !fx._empRoot.isConnected) {
      const root = document.createElement("div");
      root.className = "fx-kayo-emp-root";

      const ring = document.createElement("div");
      ring.className = "fx-kayo-emp-ring";
      root.appendChild(ring);

      const shardsWrap = document.createElement("div");
      shardsWrap.className = "fx-kayo-emp-shards";
      root.appendChild(shardsWrap);

      target.appendChild(root);

      fx._empRoot = root;
      fx._empShards = shardsWrap;
      fx._empLayer = layer;
      fx._empShardCount = -1; // force first build
    }

    // re-parent on layer change
    if (fx._empLayer !== layer) {
      const newTarget = getFxTargetLayer(host, layer);
      if (newTarget && fx._empRoot?.isConnected) newTarget.appendChild(fx._empRoot);
      fx._empLayer = layer;
    }

    // vars
    fx._empRoot.style.setProperty("--c", color);
    fx._empRoot.style.setProperty("--i", intensity);
    fx._empRoot.style.setProperty("--spd", speed);
    fx._empRoot.style.setProperty("--rad", radius);

    // ✅ shards rebuild (count-desync safe)
    const shardChildren = fx._empShards?.childElementCount ?? 0;
    if (fx._empShardCount !== shards || shardChildren !== shards) {
      fx._empShardCount = shards;
      fx._empShards.innerHTML = "";

      for (let i = 0; i < shards; i++) {
        const s = document.createElement("div");
        s.className = "fx-kayo-shard";
        s.style.setProperty("--x", `${(10 + Math.random() * 80).toFixed(2)}%`);
        s.style.setProperty("--y", `${(10 + Math.random() * 80).toFixed(2)}%`);
        s.style.setProperty("--r", `${(Math.random() * 360).toFixed(2)}deg`);
        s.style.setProperty("--w", `${(6 + Math.random() * 20).toFixed(2)}px`);
        s.style.setProperty("--h", `${(2 + Math.random() * 8).toFixed(2)}px`);
        s.style.setProperty("--d", `${(Math.random() * 0.55).toFixed(2)}s`);
        s.style.setProperty("--p", `${(0.55 + Math.random() * 0.65).toFixed(2)}`);
        fx._empShards.appendChild(s);
      }
    }
  },

  cleanup({ fx }) {
    if (fx._empRoot?.isConnected) fx._empRoot.remove();
    fx._empRoot = null;
    fx._empShards = null;
    fx._empLayer = null;
    fx._empShardCount = null;
  }
},


"fx_effect_kayo_zeropoint_field": {
  scope: "effect",
  params: ["layer", "color", "intensity", "speed", "radius", "lines", "nodes"],
  defaults: [1, "#7dffd6", 0.85, 1.0, 0.62, 8, 10],

  apply({ fx, host }) {
    const layer = fx.p?.[0] ?? 1;
    const color = fx.p?.[1] ?? "#7dffd6";
    const intensity = Math.max(0.1, Math.min(1.4, fx.p?.[2] ?? 0.85));
    const speed = Math.max(0.35, Math.min(2.5, fx.p?.[3] ?? 1.0));
    const radius = Math.max(0.30, Math.min(0.90, fx.p?.[4] ?? 0.62));
    const lines = Math.max(0, Math.min(18, Math.round(fx.p?.[5] ?? 8)));
    const nodes = Math.max(0, Math.min(26, Math.round(fx.p?.[6] ?? 10)));

    const target = getFxTargetLayer(host, layer);
    if (!target) return;

    if (!fx._zpRoot || !fx._zpRoot.isConnected) {
      const root = document.createElement("div");
      root.className = "fx-kayo-zp-root";

      const core = document.createElement("div");
      core.className = "fx-kayo-zp-core";
      root.appendChild(core);

      const scan = document.createElement("div");
      scan.className = "fx-kayo-zp-scan";
      root.appendChild(scan);

      const nodesWrap = document.createElement("div");
      nodesWrap.className = "fx-kayo-zp-nodes";
      root.appendChild(nodesWrap);

      target.appendChild(root);

      fx._zpRoot = root;
      fx._zpScan = scan;
      fx._zpNodes = nodesWrap;
      fx._zpLayer = layer;

      fx._zpLineCount = -1; // force first build
      fx._zpNodeCount = -1;
    }

    // re-parent on layer change
    if (fx._zpLayer !== layer) {
      const newTarget = getFxTargetLayer(host, layer);
      if (newTarget && fx._zpRoot?.isConnected) newTarget.appendChild(fx._zpRoot);
      fx._zpLayer = layer;
    }

    fx._zpRoot.style.setProperty("--c", color);
    fx._zpRoot.style.setProperty("--i", intensity);
    fx._zpRoot.style.setProperty("--spd", speed);
    fx._zpRoot.style.setProperty("--rad", radius);

    // ✅ scan lines rebuild (count-desync safe)
    const lineChildren = fx._zpScan?.childElementCount ?? 0;
    if (fx._zpLineCount !== lines || lineChildren !== lines) {
      fx._zpLineCount = lines;
      fx._zpScan.innerHTML = "";

      for (let i = 0; i < lines; i++) {
        const l = document.createElement("div");
        l.className = "fx-kayo-zp-line";
        l.style.setProperty("--y", `${(8 + (i / Math.max(1, lines - 1)) * 84).toFixed(2)}%`);
        l.style.setProperty("--d", `${(Math.random() * 0.7).toFixed(2)}s`);
        l.style.setProperty("--p", `${(0.55 + Math.random() * 0.65).toFixed(2)}`);
        fx._zpScan.appendChild(l);
      }
    }

    // ✅ nodes rebuild (count-desync safe)
    const nodeChildren = fx._zpNodes?.childElementCount ?? 0;
    if (fx._zpNodeCount !== nodes || nodeChildren !== nodes) {
      fx._zpNodeCount = nodes;
      fx._zpNodes.innerHTML = "";

      for (let i = 0; i < nodes; i++) {
        const n = document.createElement("div");
        n.className = "fx-kayo-zp-node";
        n.style.setProperty("--x", `${(18 + Math.random() * 64).toFixed(2)}%`);
        n.style.setProperty("--y", `${(18 + Math.random() * 64).toFixed(2)}%`);
        n.style.setProperty("--d", `${(Math.random() * 0.9).toFixed(2)}s`);
        n.style.setProperty("--s", `${(0.6 + Math.random() * 1.15).toFixed(2)}`);
        fx._zpNodes.appendChild(n);
      }
    }
  },

  cleanup({ fx }) {
    if (fx._zpRoot?.isConnected) fx._zpRoot.remove();
    fx._zpRoot = null;
    fx._zpScan = null;
    fx._zpNodes = null;
    fx._zpLayer = null;
    fx._zpLineCount = null;
    fx._zpNodeCount = null;
  }
},

// ======================
// R E Y N A
// ======================
"fx_frame_reyna_empress_overdrive": {
  scope: "frame",
  params: ["outline", "size", "sharpness", "beatSpeed", "beatStrength"],
  defaults: [0.85, 1.05, 0.65, 1.0, 0.85],

  apply({ fx, host }) {

    const root = host?.closest?.(".frame") || host;
    const art  = root.querySelector(".frame-art-inner");
    if (!art) return;

    // cache original styles once
    if (fx._orig == null) {
      fx._orig = {
        scale: art.style.scale || "",
        filter: art.style.filter || "",
        willChange: art.style.willChange || ""
      };
    }

    fx._art = art;
    art.style.willChange = "transform, filter, opacity";
  },

_tick(ctx, fx) {
  if (!fx.on || !fx._art) return;

  const outlineAmt   = fx.p?.[0] ?? 0.85;
  const baseSize     = fx.p?.[1] ?? 1.05;   // ✅ THIS now controls art size
  const sharpness    = fx.p?.[2] ?? 0.65;
  const beatSpeed    = fx.p?.[3] ?? 1.0;
  const beatStrength = fx.p?.[4] ?? 0.85;

  const t = ctx.time * beatSpeed;

  // ❤️ real heartbeat (double bump)
  const beat1 = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2)), 6);
  const beat2 = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 + 1.15)), 9);

  const beatPulse = 1 + (beat1 * 0.22 + beat2 * 0.14) * beatStrength;

  // ==========================
  // 🎯 ACTUAL ART SIZE
  // ==========================
  const finalScale = baseSize * beatPulse;
  fx._art.style.scale = finalScale;

  // ==========================
  // ✨ GLOW (outlineAmt only)
  // ==========================
  const o = Math.max(0, Math.min(1, outlineAmt));
  const blurPx = (1 - Math.max(0, Math.min(1, sharpness))) * 10;

  const glowA = (0.18 + o * 0.42) * beatPulse;
  const glowB = (0.10 + o * 0.22) * beatPulse;

  const r1 = (10 + 30 * o) * beatPulse;
  const r2 = (4 + 14 * o) * beatPulse;

  const extra = fx._orig?.filter ? (fx._orig.filter + " ") : "";

  fx._art.style.filter =
    `${extra}blur(${blurPx}px)` +
    ` drop-shadow(0 0 ${r1}px rgba(210,80,255,${glowA}))` +
    ` drop-shadow(0 0 ${r2}px rgba(80,0,120,${glowB}))`;
},


  cleanup({ fx }) {
    const art = fx._art;
    if (art && fx._orig) {
      art.style.scale = fx._orig.scale;
      art.style.filter = fx._orig.filter;
      art.style.willChange = fx._orig.willChange;
    }

    fx._art = null;
    fx._orig = null;
  }
},

"fx_frame_cypher_cctv": {
  scope: "frame",
  params: ["scanSpeed", "noise", "glitchChance", "glitchStrength", "opacity"],
  defaults: [0.7, 0.4, 0.35, 0.7, 0.6],

apply({ fx, host }) {

  const frame = host?.closest?.(".frame") || document.querySelector(".frame");
  if (!frame) return;

  // cache frame for tick
  fx._frame = frame;

  // ✅ persistent state (do NOT reset)
  fx._state = fx._state || { glitchUntil: 0, nextAt: 0, primed: 0 };

  // ✅ create/resolve root ONCE
  let root = fx._root;
  if (!root || !root.isConnected) {

    root = frame.querySelector(".fx-cctv-root");

    if (!root) {
      root = document.createElement("div");
      root.className = "fx-cctv-root";
      frame.appendChild(root);

      root.innerHTML = `
        <div class="fx-cctv-scan"></div>
        <div class="fx-cctv-roll"></div>
        <div class="fx-cctv-tear"></div>
      `;
    }

    fx._root = root;
  }
},

_tick(a, fx) {

  // --------------------------
  // SUPPORT BOTH CALL SHAPES
  // --------------------------
  let t;

  if (typeof a === "number") {
    // ms from performance.now
    t = a / 1000;
  }
  else if (a && typeof a === "object" && typeof a.time === "number") {
    // context object
    t = a.time;
  }
  else {
    return; // invalid call
  }

  const root = fx._root;
  if (!root) return;

  const scanSpeed      = Number(fx.p?.[0]) || 0.7;
  const noise          = Number(fx.p?.[1]) || 0.4;
  const glitchChance   = Number(fx.p?.[2]) || 0;
  const glitchStrength = Number(fx.p?.[3]) || 0.7;
  const opacity        = Number(fx.p?.[4]) || 0.6;

  root.style.setProperty("--opacity", opacity);
  root.style.setProperty("--noise", noise);

  const roll = (t * 60 * scanSpeed) % 100;
  root.style.setProperty("--roll", roll + "%");

  const frame = fx._frame || document.querySelector(".frame");
  if (!frame) return;

  // --------------------------
  // SIMPLE RELIABLE GLITCH
  // --------------------------

  const c = Math.max(0, Math.min(1, glitchChance));

  const interval = 2.5 - (2.2 * c);     // frequency
  const duration = interval * 0.05;     // visible duty cycle

  const phase = t % interval;
  const glitching = phase < duration;

  root.classList.toggle("is-glitching", glitching);

  if (glitching) {

    frame.classList.add("cctv-art-glitch");

    const shift = (Math.random() - 0.5) * 30 * glitchStrength;
    frame.style.setProperty("--cctvShift", shift + "px");

    const invert = Math.random() > 0.5 ? 1 : 0;
    frame.style.setProperty("--cctvInvert", invert);

    root.style.filter = `contrast(${1 + 0.8 * glitchStrength})`;

  } else {

    frame.classList.remove("cctv-art-glitch");
    frame.style.setProperty("--cctvShift", "0px");
    frame.style.setProperty("--cctvInvert", "0");
    root.style.filter = "";
  }
},
cleanup(fx) {

  const frame = document.querySelector(".frame");

  frame?.querySelectorAll(".fx-cctv-root").forEach(n => n.remove());
  frame?.style.setProperty("--cctvShift", "0px");
  frame?.style.setProperty("--cctvInvert", "0");
  frame?.classList.remove("cctv-art-glitch");

  fx._root = null;
  fx._state = null;
 }
},


}; // ✅ registry ends ONCE, here
window.FX_REGISTRY = FX_REGISTRY;

// ==========================
// FX ALIASES (BACKWARD COMPAT)
// ==========================
(function FX_ALIAS_PATCH(){
  if (!window.FX_REGISTRY) return;
  const R = window.FX_REGISTRY;

  if (!R["cypher_cctv"]) {
    R["cypher_cctv"] =
      R["fx_effect_cypher_surveillance_feed"] ||
      R["fx_effect_cypher_cctv"] ||
      R["fx_frame_cypher_cctv"] ||
      R["fx_effect_cypher_surveillance"] ||
      null;
  }

  if (!R["fx_effect_cypher_cctv"]) R["fx_effect_cypher_cctv"] = R["cypher_cctv"] || null;
  if (!R["fx_frame_cypher_cctv"])  R["fx_frame_cypher_cctv"]  = R["cypher_cctv"] || null;

  if (!R["cypher_cctv"]) {
    console.warn("[FX_ALIAS_PATCH] Could not resolve cypher_cctv -> any known cypher key.");
  }
})();


// helper
function spawnButterfly(target, fx){
  const b = document.createElement("div");
  b.className = "fx-clove-bfly";

  const x = Math.random()*100;
  const y = 100 + Math.random()*40;

  b.style.left = x + "%";
  b.style.top  = y + "%";

  b.style.animationDuration =
    `${18 + Math.random()*10}s`;

  target.appendChild(b);

  // respawn loop
  b.addEventListener("animationiteration", ()=>{
    b.style.left = Math.random()*100 + "%";
    b.style.top  = 100 + Math.random()*40 + "%";
  });
}

function dustParticles({ host, count = 24, spread = 120 }) {
  // force dust to live in a stable, top-level container
  const root =
    document.querySelector(".frame") ||
    document.querySelector(".frame-art") ||
    host;

  if (!root) return;

  if (getComputedStyle(root).position === "static") {
    root.style.position = "relative";
  }

  const w = root.clientWidth || 1;

  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "fx-dust";

    const x = Math.random() * w;
    const dx = (Math.random() - 0.5) * 40;
    const dy = 140 + Math.random() * 160;

    p.style.left = `${x}px`;
    p.style.top = `0px`;

    // don’t rely on CSS keyframes — animate directly
    root.appendChild(p);

    p.animate(
      [
        { transform: "translate(0px, 0px)", opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
      ],
      { duration: 900, easing: "linear", fill: "forwards" }
    );

    setTimeout(() => p.remove(), 950);
  }
}




function spawnFaultPulse(host, index, total, strength = 1) {
  const rect = host.getBoundingClientRect();
  const segmentH = rect.height / total;

  const topY = index * segmentH;

  const thickness = Math.max(
    4,
    segmentH * (0.09 + strength * 0.05)
  );

  const pulses = [
    // TOP
    {
      left: "0",
      top: `${topY}px`,
      width: "100%",
      height: `${thickness}px`,
      sparkY: topY,
      sparkDir: -1
    },

    // BOTTOM
    {
      left: "0",
      top: `${topY + segmentH - thickness}px`,
      width: "100%",
      height: `${thickness}px`,
      sparkY: topY + segmentH,
      sparkDir: 1
    },

    // LEFT
    {
      left: "0",
      top: `${topY}px`,
      width: `${thickness}px`,
      height: `${segmentH}px`
    },

    // RIGHT
    {
      left: "auto",
      right: "0",
      top: `${topY}px`,
      width: `${thickness}px`,
      height: `${segmentH}px`
    }
  ];


const test = document.createElement("div");
Object.assign(test.style, {
  position: "absolute",
  inset: "40%",
  width: "40px",
  height: "40px",
  background: "red",
  zIndex: 9999
});
document.body.appendChild(test);

let t = 0;
setInterval(() => {
  t += 0.05;
  test.style.left = `${50 + Math.sin(t) * 10}%`;
}, 16);

 pulses.forEach(p => {
  const pulse = document.createElement("div");
  pulse.className = "fx-fault-pulse";
  pulse.style.zIndex = "4";

  // ❗ REQUIRED: give the pulse geometry
  Object.assign(pulse.style, {
    left: p.left,
    right: p.right,
    top: p.top,
    width: p.width,
    height: p.height
  });

  host.appendChild(pulse);

  requestAnimationFrame(() => {
    const heat = Math.min(1, strength / 10);
    const hue = 50 - heat * 40;

    pulse.style.background = `
  linear-gradient(
    to right,
    hsla(${hue}, 100%, 60%, 0),
    hsla(${hue}, 100%, 65%, 1),
    hsla(${hue - 10}, 100%, 55%, 0.9),
    hsla(${hue}, 100%, 60%, 0)
  )
`;
    pulse.style.filter = `blur(${0.3 + strength * 0.05}px)`;

    pulse.style.boxShadow = `
      0 0 ${12 + strength * 4}px hsla(${hue}, 100%, 60%, 0.9),
      0 0 ${24 + strength * 6}px hsla(${hue - 10}, 100%, 50%, 0.7)
    `;

    pulse.classList.add("active");
  });

  if (p.sparkY !== undefined) {
    spawnPulseSparks(
      host,
      p.sparkY,
      rect.width,
      p.sparkDir,
      3,
      strength
    );
  }

  setTimeout(() => pulse.remove(), 220);
});
}


function spawnFlame(x,y,fx){

const p=document.createElement("div");

Object.assign(p.style,{
position:"absolute",
width:"10px",
height:"10px",
borderRadius:"50%",
background:"#ff7733"
});

p._life=0.25;
p._vx=(Math.random()-0.5)*20;
p._vy=40+Math.random()*30;

fx._root.appendChild(p);
fx._particles.push(p);

p.style.left=x+"px";
p.style.top=y+"px";

}

function spawnSmoke(x,y,amt,fx){

if(Math.random()>amt/120) return;

const p=document.createElement("div");

const colors=["#1a001a","#220000","#111"];

Object.assign(p.style,{
position:"absolute",
width:"20px",
height:"20px",
borderRadius:"50%",
background:colors[Math.floor(Math.random()*colors.length)]
});

p._life=1.2;
p._vx=(Math.random()-0.5)*20;
p._vy=-20-Math.random()*20;

fx._root.appendChild(p);
fx._particles.push(p);

p.style.left=x+"px";
p.style.top=y+"px";

}

function spawnExplosion(x,y,size,fx){

for(let i=0;i<30;i++){

const p=document.createElement("div");

const colors=["#ff8844","#ff5522","#330011","#000"];

Object.assign(p.style,{
position:"absolute",
width:size*0.18+"px",
height:size*0.18+"px",
borderRadius:"50%",
background:colors[Math.floor(Math.random()*colors.length)]
});

p._life=1.1;
p._vx=(Math.random()-0.5)*size;
p._vy=(Math.random()-0.5)*size;

fx._root.appendChild(p);
fx._particles.push(p);

p.style.left=x+"px";
p.style.top=y+"px";

}

}

function updateParticles(fx){

const dt=1/60;

fx._particles=fx._particles.filter(p=>{

p._life-=dt;

if(p._life<=0){
p.remove();
return false;
}

const x=parseFloat(p.style.left)+p._vx*dt;
const y=parseFloat(p.style.top)+p._vy*dt;

p.style.left=x+"px";
p.style.top=y+"px";

p.style.opacity=p._life;

return true;

});

}

function updateParticles(fx){

const dt=1/60;

fx._particles=fx._particles.filter(p=>{

p._life-=dt;

if(p._life<=0){

p.remove();
return false;

}

const x=parseFloat(p.style.left)+p._vx*dt;
const y=parseFloat(p.style.top)+p._vy*dt;

p.style.left=x+"px";
p.style.top=y+"px";

p.style.opacity=p._life;

return true;

});

}
function spawnPulseSparks(host, y, width, direction, count = 3, strength = 1) {
  for (let i = 0; i < count; i++) {
    const spark = document.createElement("div");
    spark.className = "fx-pulse-spark";

    const x = Math.random() * width;
    const force = 1 + strength * 0.8;

    const dx = (Math.random() - 0.5) * 18 * force;
    const dy = direction * (6 + Math.random() * 10) * force;

    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.setProperty("--dx", `${dx}px`);
    spark.style.setProperty("--dy", `${dy}px`);

    host.appendChild(spark);

    requestAnimationFrame(() => {
      spark.classList.add("active");
    });

    setTimeout(() => {
      spark.classList.add("fade");
    }, 120);

    setTimeout(() => spark.remove(), 320);
  }
};



function buildIsoKillContractPanels(fx) {
  if (!fx?.__panels) return;

  const panelCount = Math.max(1, Math.min(6, Math.round(fx.p?.[0] ?? 3)));
  fx.__panelCount = panelCount;

  fx.__panels.innerHTML = "";

  // layout angles around frame: top/bot/left/right corners
  // we’ll spawn up to 6 panels distributed.
  for (let i = 0; i < panelCount; i++) {
    const panel = document.createElement("div");
    panel.className = "fx-iso-kc-panel";
    panel.dataset.i = i;

    // choose anchor spots
    // 0: top-left, 1: top-right, 2: bottom-right, 3: bottom-left, extras: mid-sides
    let slot = i;
    if (panelCount <= 4) slot = i;
    else slot = i; // 5/6 => adds side panels

    panel.dataset.slot = slot;

    fx.__panels.appendChild(panel);
  }
}

function breachRumble() {

  const art = document.querySelector(".frame-art-inner");
  if (!art) return;

  let frames = 14;
  const mag = 7;

  (function jitter(){
    if (frames-- <= 0) {
      art.style.translate = "0px 0px";
      return;
    }

    art.style.translate =
      `${(Math.random()-0.5)*mag}px ${(Math.random()-0.5)*mag}px`;

    requestAnimationFrame(jitter);
  })();
}

function spawnMicroDust(host){

  for(let i=0;i<24;i++){

    const d = document.createElement("div");

    Object.assign(d.style,{
      position:"absolute",
      left:`${20+Math.random()*60}%`,
      top:"0%",
      width:"2px",
      height:"2px",
      borderRadius:"50%",
      background:"rgba(220,200,160,0.9)",
      pointerEvents:"none"
    });

    host.appendChild(d);

    const dx = (Math.random()-0.5)*60;
    const dy = 120 + Math.random()*120;

    d.animate(
      [
        { transform:"translate(0,0)", opacity:1 },
        { transform:`translate(${dx}px, ${dy}px)`, opacity:0 }
      ],
      { duration:900, easing:"linear", fill:"forwards" }
    );

    setTimeout(()=>d.remove(),900);
  }
}


function spawnBreachFaultLine(strength = 12) {

  const frame = document.querySelector(".frame");
  if (!frame) return;

  // ==========================
  // SVG GLOW DEF (ONCE)
  // ==========================
  if (!document.getElementById("breachGlowDef")) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    g.id = "breachGlowDef";
    g.style.position = "absolute";
    g.style.width = "0";
    g.style.height = "0";
    g.innerHTML = `
      <defs>
        <filter id="breachGlow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge>
            <feMergeNode in="b"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
    `;
    document.body.appendChild(g);
  }

  // ==========================
  // CONTAINER
  // ==========================
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999"
  });
  frame.appendChild(container);

  const slices = 5;
  const sliceH = frame.clientHeight / slices;

  for (let i = 0; i < slices; i++) {

    setTimeout(() => {

      breachRumble();

      // ==========================
      // SLICE
      // ==========================
      const slice = document.createElement("div");
      Object.assign(slice.style, {
        position: "absolute",
        left: "0",
        top: `${i * sliceH}px`,
        width: "100%",
        height: "0px",
        overflow: "hidden",
        pointerEvents: "none"
      });
      container.appendChild(slice);

      // ==========================
      // ROCK SURFACE
      // ==========================
      const surface = document.createElement("div");
      Object.assign(surface.style, {
        position: "absolute",
        inset: "0",
        background: `
          radial-gradient(circle at 20% 30%, #5a2f16 0%, transparent 55%),
          radial-gradient(circle at 65% 25%, #6a381c 0%, transparent 55%),
          radial-gradient(circle at 40% 75%, #4a2412 0%, transparent 60%),
          repeating-linear-gradient(
            120deg,
            rgba(0,0,0,.9) 0px,
            rgba(0,0,0,.9) 2px,
            transparent 2px,
            transparent 14px
          ),
          linear-gradient(180deg,#7a3b1c,#2a1208)
        `,
        filter: "contrast(1.3) brightness(1.1)",
        boxShadow: "inset 0 0 26px rgba(0,0,0,.8)"
      });
      slice.appendChild(surface);

      // ==========================
      // FRACTURE VEINS
      // ==========================
      const veinCount = 10 + Math.floor(Math.random() * 6);

      for (let v = 0; v < veinCount; v++) {

        const horizontal = Math.random() < 0.35;
        if (Math.random() < 0.4) continue; // global density cut

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 100 100");
        Object.assign(svg.style, { position: "absolute", inset: "0" });

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        const colors = [
          "rgba(255,60,40,0.85)",
          "rgba(255,140,40,0.85)",
          "rgba(255,220,120,0.85)"
        ];

        const steps = 6 + Math.floor(Math.random() * 4);
        let d = "";

        if (!horizontal) {
          // VERTICAL PRIMARY FRACTURE
          let x = 15 + Math.random() * 70;
          d = `M ${x} 0 `;
          const bias = Math.random() < 0.5 ? -1 : 1;

          for (let s = 0; s < steps; s++) {
            x += bias * (2 + Math.random() * 6);
            const y = (s + 1) * (100 / steps);
            d += `L ${x} ${y} `;

            if (Math.random() < 0.4) {
              const bx = x + bias * (8 + Math.random() * 12);
              const by = y + 8 + Math.random() * 12;
              d += `M ${x} ${y} L ${bx} ${by} `;
            }
          }

        } else {
          // HORIZONTAL SECONDARY FRACTURE
          let y = 15 + Math.random() * 70;
          d = `M 0 ${y} `;
          const bias = Math.random() < 0.5 ? -1 : 1;

          for (let s = 0; s < steps; s++) {
            y += bias * (2 + Math.random() * 6);
            const x = (s + 1) * (100 / steps);
            d += `L ${x} ${y} `;

            if (Math.random() < 0.35) {
              const bx = x + 8 + Math.random() * 12;
              const by = y + bias * (8 + Math.random() * 12);
              d += `M ${x} ${y} L ${bx} ${by} `;
            }
          }
        }

        path.setAttribute("d", d);
        path.setAttribute("stroke", colors[Math.floor(Math.random() * colors.length)]);
        path.setAttribute("stroke-width", horizontal ? "1.2" : "1.5");
        path.setAttribute("filter", "url(#breachGlow)");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");
        path.setAttribute("stroke-linejoin", "round");

        const len = 420;
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;

        svg.appendChild(path);
        slice.appendChild(svg);

        path.animate(
          [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
          { duration: 420, easing: "ease-out", fill: "forwards" }
        );
      }

      // ==========================
      // EARLY SHARDS
      // ==========================
      for (let s = 0; s < 12; s++) {
        const shard = document.createElement("div");
        Object.assign(shard.style, {
          position: "absolute",
          left: `${25 + Math.random() * 50}%`,
          top: "0%",
          width: "3px",
          height: "10px",
          background: "linear-gradient(to bottom, rgba(255,240,200,1), rgba(255,120,40,.9))",
          transform: "translate(-50%,0)"
        });

        slice.appendChild(shard);

        const dx = (Math.random() - 0.5) * 140;
        const dy = 50 + Math.random() * 140;

        shard.animate(
          [
            { transform: "translate(-50%,0)", opacity: 1 },
            { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: 0 }
          ],
          { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" }
        );

        setTimeout(() => shard.remove(), 600);
      }

      // ==========================
      // CARVE DOWN
      // ==========================
      slice.animate(
        [{ height: "0px" }, { height: `${sliceH}px` }],
        { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" }
      );

      setTimeout(() => slice.remove(), 520);

    }, i * 460);
  }

  setTimeout(() => container.remove(), slices * 460 + 900);
}

function buildMissilePaths(x, y, ang, len, rad) {

  const ca = Math.cos(ang);
  const sa = Math.sin(ang);

  const nx = -sa;
  const ny = ca;

  const nose = {
    x: x + ca * len,
    y: y + sa * len
  };

  const bodyFront = {
    x: x + ca * (len * 0.55),
    y: y + sa * (len * 0.55)
  };

  const bodyBack = {
    x: x - ca * (len * 0.75),
    y: y - sa * (len * 0.75)
  };

  const bodyL = {
    x: bodyFront.x + nx * rad,
    y: bodyFront.y + ny * rad
  };

  const bodyR = {
    x: bodyFront.x - nx * rad,
    y: bodyFront.y - ny * rad
  };

  const tailL = {
    x: bodyBack.x + nx * rad,
    y: bodyBack.y + ny * rad
  };

  const tailR = {
    x: bodyBack.x - nx * rad,
    y: bodyBack.y - ny * rad
  };

  const finSpread = rad * 1.7;

  const finBack = {
    x: bodyBack.x - ca * 8,
    y: bodyBack.y - sa * 8
  };

  const finL = {
    x: bodyBack.x + nx * finSpread,
    y: bodyBack.y + ny * finSpread
  };

  const finR = {
    x: bodyBack.x - nx * finSpread,
    y: bodyBack.y - ny * finSpread
  };

  const bodyPath =
    `M ${tailL.x} ${tailL.y}
     L ${bodyL.x} ${bodyL.y}
     L ${nose.x} ${nose.y}
     L ${bodyR.x} ${bodyR.y}
     L ${tailR.x} ${tailR.y}
     Z`;

  const finPath =
    `M ${finL.x} ${finL.y}
     L ${finBack.x} ${finBack.y}
     L ${finR.x} ${finR.y}
     Z`;

  const nozzleX = bodyBack.x;
  const nozzleY = bodyBack.y;

  return {
    body: bodyPath,
    fins: finPath,
    nozzleX,
    nozzleY
  };

}

function assembleBreachFrame() {
  const frame = document.querySelector(".breach-frame");
  if (!frame || frame.classList.contains("locked")) return;

  const segments = [
    ".frame-left",
    ".frame-right",
    ".frame-top",
    ".frame-bottom"
  ];

  segments.forEach((sel, i) => {
    const el = frame.querySelector(sel);
    if (!el) return;

    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translate(0,0)";
    }, i * 70);
  });

  // Lock state after assembly
  setTimeout(() => {
    frame.classList.add("locked");
  }, 300);
}

// ==============================
// PRESET UI LOGIC (CLEAN)
// ==============================

const presetSelect = document.getElementById("presetSelect");
const presetExportBtn = document.getElementById("presetExportBtn");
const presetExportOutput = document.getElementById("presetExportOutput");
const presetSaveBtn = document.getElementById("presetSaveBtn");
const presetOverwriteBtn = document.getElementById("presetOverwriteBtn");
const presetRenameBtn = document.getElementById("presetRenameBtn");
const presetDeleteBtn = document.getElementById("presetDeleteBtn");
// Export preset JSON
if (presetExportBtn && presetExportOutput) {
presetExportBtn.addEventListener("click", async () => {
  const json = exportFxPresetPretty();
  presetExportOutput.value = json;

  let copied = false;

  // Attempt modern clipboard API
  try {
    await navigator.clipboard.writeText(json);
    copied = true;
  } catch {}

  // Fallback: manual selection + execCommand
  if (!copied) {
    presetExportOutput.focus();
    presetExportOutput.select();

    try {
      copied = document.execCommand("copy");
    } catch {}
  }

  // UI feedback
  if (copied) {
    presetExportBtn.textContent = "Copied ✓";
    setTimeout(() => {
      presetExportBtn.textContent = "Copy Preset JSON";
    }, 1200);
  } else {
    presetExportBtn.textContent = "Select & Copy";
  }
});
}


function updatePresetActionState() {
  if (!presetSelect) return;
  const hasSelection = !!presetSelect.value;

  presetOverwriteBtn.disabled = !hasSelection;
  presetRenameBtn.disabled = !hasSelection;
  presetDeleteBtn.disabled = !hasSelection;
}

function refreshPresetDropdown() {
  if (!presetSelect) return;

  presetSelect.innerHTML = `<option value="">Select preset…</option>`;
  const presets = getPresetsForCurrentAgent();

  Object.keys(presets).forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    presetSelect.appendChild(opt);
  });

  updatePresetActionState();
}

// Save new
if (presetSaveBtn) {
  presetSaveBtn.addEventListener("click", () => {
    const name = prompt("Preset name:");
    if (!name) return;

    saveCurrentPreset(name);
    refreshPresetDropdown();
  });
}

// Select preset
if (presetSelect) {
  presetSelect.addEventListener("change", e => {
    const name = e.target.value;
    updatePresetActionState();

    if (!name) return;

    loadPreset(FX_STATE.agent, name);
    setLastPresetForAgent(FX_STATE.agent, name);
  });
}

// Overwrite
if (presetOverwriteBtn) {
  presetOverwriteBtn.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) return;

    saveCurrentPreset(name);
    refreshPresetDropdown();
    presetSelect.value = name;
  });
}

// Rename
if (presetRenameBtn) {
  presetRenameBtn.addEventListener("click", () => {
    const oldName = presetSelect.value;
    if (!oldName) return;

    const newName = prompt("Rename preset:", oldName);
    if (!newName || newName === oldName) return;

    const all = loadAllPresets();
    const agent = FX_STATE.agent;

    all[agent][newName] = all[agent][oldName];
    delete all[agent][oldName];

    saveAllPresets(all);
    refreshPresetDropdown();
    presetSelect.value = newName;
  });
}

// Delete
if (presetDeleteBtn) {
  presetDeleteBtn.addEventListener("click", () => {
    const name = presetSelect.value;
    if (!name) return;

    if (!confirm(`Delete preset "${name}"?`)) return;

    const all = loadAllPresets();
    delete all[FX_STATE.agent][name];

    saveAllPresets(all);

    const last = getLastPresetForAgent(FX_STATE.agent);
    if (last === name) setLastPresetForAgent(FX_STATE.agent, "");

    refreshPresetDropdown();
  });
}


const frameState = {
  mode: MODES.FRAME,
  cards: [

      {
      id: "frame_art",
      type: "frame",
      subtype: "art",
      mode: MODES.FRAME,
      label: "Agent Art",
      description: "Base agent artwork",
      image: null,
      enabled: false,
      expanded: false,
      order: 0
    },
{
  id: "fx_frame_glow",
  type: "fx",
  fxId: "frame.glow",
  label: "Frame Glow",
  description: "Localized glow around the agent frame",
  mode: MODES.FRAME,
  order: 20,
  enabled: true,
  expanded: false
},
{
  id: "fx_frame_fire_border",
  type: "fx",
  fxId: "frame.fire_border",
  label: "Fire Border",
  description: "Fiery energy around the outer frame",
  mode: MODES.FRAME,
  order: 25,
  enabled: false,
  expanded: false
},

{
  id: "fx_intro_runin",
  type: "fx",
  fxId: "intro.runin",
  label: "Intro Run-In",
  description: "Agents converge into the frame at intro",
  mode: MODES.INTRO,
  order: 5,
  enabled: false,
  expanded: false,
},
{
  id: "fx_intro_flash",
  type: "fx",
  fxId: "intro.flash",
  label: "Intro Flash",
  description: "Quick color flash at intro start",
  mode: MODES.INTRO,
  order: 10,
  enabled: false,
  expanded: false,
},

{
  id: "fx_effect_killjoy_nanoswarm",
  agent: "killjoy",
  type: "fx",
  fxId: "fx_effect_killjoy_nanoswarm",
  mode: MODES.EFFECTS,
  label: "Killjoy — Nanoswarm",
  description: "Hazard nano-cloud + nanobot flecks + hex shimmer (tintable).",
  enabled: false,
  expanded: false,
  order: 320
},
{
  id: "fx_effect_killjoy_lockdown_pulse",
  agent: "killjoy",
  type: "fx",
  fxId: "fx_effect_killjoy_lockdown_pulse",
  mode: MODES.EFFECTS,
  label: "Killjoy — Lockdown Pulse",
  description: "Lockdown warning: core beacon + outward pulses + sweep ring.",
  enabled: false,
  expanded: false,
  order: 321
},

{
  id: "fx_effect_breach_fault_line",
  type: "fx",
  fxId: "fx_effect_breach_fault_line",
  label: "Breach — Fault Line",
  description: "Agent art splits into rising seismic slabs",
  mode: MODES.EFFECTS,
  order: 5,
  enabled: false,
  expanded: false
},

{
  id: "fx_effect_breach_seismic_frame",
  type: "fx",
  fxId: "frame.breach_seismic_frame",
  label: "Breach — Seismic Frame",
  description: "Segmented frame slams outward with seismic force",
  mode: MODES.EFFECTS,
  order: 7,
  enabled: false,
  expanded: false
},

{
  id: "fx_effect_gekko_mosh_pit",
  type: "fx",
  fxId: "fx_effect_gekko_mosh_pit",
  label: "Gekko — Mosh Pit Splash",
  description: "Goopy acid splash with bubbles + drips (Mosh Pit)",
  mode: MODES.EFFECTS,
  order: 420,
  enabled: false,
  expanded: false
},



{
  id: "fx_effect_gekko_dizzy_pop",
  type: "fx",
  fxId: "effect.gekko_dizzy_pop",
  label: "Gekko — Dizzy Pop",
  description: "Bright pop burst with splat particles + shock ring",
  mode: MODES.EFFECTS,
  order: 430,
  enabled: false,
  expanded: false
},

{
  id: "fx_frame_gekko_globules_idle",
  type: "fx",
  fxId: "frame.gekko_globules_idle",
  label: "Gekko — Globules Idle",
  description: "Three idle creatures at bottom with subtle pulse + bounce",
  mode: MODES.EFFECTS,
  order: 431,
  enabled: false,
  expanded: false
},
{
  id: "fx_frame_cypher_cctv",
  agent: "cypher",
  type: "fx",
  fxId: "cypher_cctv",
  mode: MODES.EFFECTS,
  label: "Cypher — Surveillance Feed",
  description: "Old CRT glitch feed.",
  enabled: false,
  expanded: false,
  order: 340
},

{
  id: "fx_frame_viper_haze",
  agent: "viper",
  type: "fx",
  fxId: "viper_haze",
  mode: MODES.EFFECTS,
  label: "Viper — Toxic Haze",
  description: "Drifting toxic fog background.",
  enabled: false,
  expanded: false,
  order: 350
},
{
  id: "fx_effect_viper_acid_splat",
  agent: "viper",
  type: "fx",
  fxId: "viper_acid_splat",
  mode: MODES.EFFECTS,
  label: "Viper — Acid Splat",
  description: "Random corrosive acid splats.",
  enabled: false,
  expanded: false,
  order: 351
},
{
  id: "fx_effect_astra_astral_veil",
  agent: "astra",
  type: "fx",
  fxId: "fx_effect_astra_astral_veil",
  mode: MODES.EFFECTS,
  label: "Astra — Astral Veil",
  description: "A drifting cosmic veil with faint stars and nebula haze.",
  enabled: false,
  expanded: false,
  order: 5300
},


{
  id: "fx_frame_astra_star_nodes",
  agent: "astra",
  type: "fx",
  fxId: "fx_frame_astra_star_nodes",
  mode: MODES.EFFECTS,
  label: "Astra — Star Pulse Nodes",
  description: "Small astral orbs pulse gently around the card.",
  enabled: false,
  expanded: false,
  order: 5310
},

{
  id: "fx_frame_clove_heartbeat",
  agent: "clove",
  type: "fx",
  fxId: "fx_frame_clove_heartbeat",
  mode: MODES.EFFECTS,
  label: "Clove — Heartbeat",
  description: "A soft pink pulse radiates outward like a living heartbeat.",
  enabled: false,
  expanded: false,
  order: 5400
},
{
  id: "fx_effect_clove_smoke",
  agent: "clove",
  type: "fx",
  fxId: "fx_effect_clove_smoke",
  mode: MODES.EFFECTS,
  label: "Clove — Smoke",
  description: "Creamy pink and white smoke swirls around Clove.",
  enabled: false,
  expanded: false,
  order: 5420
},

{
  id: "fx_effect_clove_butterflies",
  agent: "clove",
  type: "fx",
  fxId: "fx_effect_clove_butterflies",
  mode: MODES.EFFECTS,
  label: "Clove — Butterflies",
  description: "Glowing pink butterflies drift and flutter around Clove.",
  enabled: false,
  expanded: false,
  order: 5410
},


// ======================
// I S O
// ======================

{
  id: "fx_effect_iso_kill_contract",
  agent: "iso",
  type: "fx",
  fxId: "fx_effect_iso_kill_contract",
  mode: MODES.EFFECTS,
  label: "Iso — Kill Contract",
  description: "Angular energy panels lock and release around Iso.",
  enabled: false,
  expanded: false,
  order: 5200
},
{
  id: "fx_effect_iso_duel_focus",
  agent: "iso",
  type: "fx",
  fxId: "fx_effect_iso_duel_focus",
  mode: MODES.EFFECTS,
  label: "Iso — Duel Focus",
  description: "The world tightens inward as Iso isolates his target.",
  enabled: false,
  expanded: false,
  order: 5210
},

// ======================
// STUBS (missing FX)
// ======================



{
  id: "fx_frame_chamber_gilded_focus",
  agent: "chamber",
  type: "fx",
  fxId: "fx_frame_chamber_gilded_focus",
  mode: MODES.EFFECTS,
  label: "Chamber — Gilded Focus (Frame)",
  description: "Premium gold trim + prismatic shimmer sweep along the frame edge.",
  enabled: false,
  expanded: false,
  order: 395
},

/* ---------------------------------------------
 * FRAME — Bullet Impacts
 * ------------------------------------------- */

{
  id: "fx_effect_chamber_bullet_impacts",
  agent: "chamber",
  type: "fx",
  fxId: "fx_effect_chamber_bullet_impacts",
  mode: MODES.EFFECTS,
  label: "Chamber — Bullet Impacts",
  description: "Rapid bullet impact flashes with crack sparks — Snare + Tour combined.",
  enabled: false,
  expanded: false,
  order: 396
},

{
  id: "fx_effect_skye_regrowth_bloom",
  agent: "skye",
  type: "fx",
  fxId: "fx_effect_skye_regrowth_bloom",
  mode: MODES.EFFECTS,
  label: "Skye — Regrowth Bloom",
  description: "Healing bloom core + expanding rings + floating motes.",
  enabled: false,
  expanded: false,
  order: 361
},
{
  id: "fx_effect_skye_trailblazer_rush",
  agent: "skye",
  type: "fx",
  fxId: "fx_effect_skye_trailblazer_rush",
  mode: MODES.EFFECTS,
  label: "Skye — Trailblazer Rush",
  description: "Punchy green rush bursts + dust motes (impact feel).",
  enabled: false,
  expanded: false,
  order: 362
},
// ======================
// F A D E — NEW SET (SAFE ORDERS)
// ======================

{
  id: "fx_frame_fade_nightfall",
  agent: "fade",
  type: "fx",
  fxId: "fx_frame_fade_nightfall",
  mode: MODES.EFFECTS,
  label: "Fade — Nightfall",
  description: "Horror ink wave + dread fog + pulsing vignette film.",
  enabled: false,
  expanded: false,
  order: 366
},
{
  id: "fx_frame_fade_nightmare_shroud",
  agent: "fade",
  type: "fx",
  fxId: "fx_frame_fade_nightmare_shroud",
  mode: MODES.EFFECTS,
  label: "Fade — Nightmare Shroud",
  description: "Heavy ink corruption crawls in from the edges with tendrils + dread pulse.",
  enabled: false,
  expanded: false,
  order: 367
},

{
  id: "fx_effect_fade_dread_bloom",
  agent: "fade",
  type: "fx",
  fxId: "fx_effect_fade_dread_bloom",
  mode: MODES.EFFECTS,
  label: "Fade — Dread Bloom",
  description: "Looping nightmare bloom behind the silhouette: smoke pulse + embers + shadow motes.",
  enabled: false,
  expanded: false,
  order: 369
},

{
  id: "fx_frame_tejo_tactical_scan",
  type: "fx",
  fxId: "frame.tejo_tactical_scan",
  label: "Tejo — Tactical Scan",
  description: "Yellow tactical battlefield scan with animated sweep grid.",
  mode: MODES.EFFECTS,
  order: 1300,
  enabled: false,
  expanded: false
},

{
  id: "fx_effect_tejo_guided_salvo",
  type: "fx",
  fxId: "tejo_guided_salvo_v2",
  label: "Tejo — Guided Salvo",
  description: "Missile impact burst with explosive radial pulse.",
  mode: MODES.EFFECTS,
  order: 1301,
  enabled: false,
  expanded: false
},

{
  id: "fx_frame_veto_ult_transformation",
  type: "fx",
  fxId: "fx_frame_veto_ult_transformation",
  label: "Veto — Ult Transformation",
  description: "Hard turquoise plates + black swirls (animated)",
  mode: MODES.EFFECTS,
  order: 1320,
  enabled: false,
  expanded: false
},

{
  id: "fx_frame_vyse_alloy_flow",
  type: "fx",
  fxId: "frame.vyse_alloy_flow",
  label: "Vyse — Alloy Flow",
  description: "Silver liquid metal flowing across the frame.",
  mode: MODES.EFFECTS,
  order: 1304,
  enabled: false,
  expanded: false
},
{
  id: "fx_frame_vyse_razor_vines",
  type: "fx",
  fxId: "frame.vyse_razor_vines",
  label: "Vyse — Razor Vines",
  description: "Barbed wire alloy vines snaking across the bottom.",
  mode: MODES.EFFECTS,
  order: 1305,
  enabled: false,
  expanded: false
},
{
  id: "fx_effect_vyse_arc_rose",
  type: "fx",
  fxId: "effect.vyse_arc_rose",
  label: "Vyse — Arc Rose",
  description: "Slow spinning metallic arc rose.",
  mode: MODES.EFFECTS,
  order: 1208,
  enabled: false,
  expanded: false
},

{
  id: "fx_effect_vyse_arc_rose_2",
  type: "fx",
  fxId: "fx_effect_vyse_arc_rose_2",
  label: "Vyse — Arc Rose II",
  description: "Secondary Arc Rose instance",
  mode: MODES.EFFECTS,
  order: 1311,
  enabled: false,
  expanded: false
},

{
  id: "fx_effect_veto_void_orb",
  type: "fx",
  fxId: "fx_effect_veto_void_orb",
  label: "Veto — Void Orb",
  description: "Turquoise containment orb with mirrored black ribbon swirls",
  mode: MODES.EFFECTS,
  order: 1312,
  enabled: false,
  expanded: false
},
// ======================
// H A R B O R
// ======================
{
  id: "fx_frame_harbor_cove",
  agent: "harbor",
  type: "fx",
  fxId: "fx_frame_harbor_cove",
  mode: MODES.EFFECTS,
  label: "Harbor — Cove",
  description: "Watery refractive shield bubble.",
  enabled: false,
  expanded: false,
  order: 370
},
{
  id: "fx_frame_harbor_shoreline_waves",
  agent: "harbor",
  type: "fx",
  fxId: "fx_frame_harbor_shoreline_waves",
  mode: MODES.EFFECTS,
  label: "Harbor — Shoreline Waves",
  description: "Small waves rolling at the bottom of the frame.",
  enabled: false,
  expanded: false,
  order: 371
},

{
  id: "fx_frame_deadlock_winter_lock",
  agent: "deadlock",
  type: "fx",
  fxId: "fx_frame_deadlock_winter_lock",
  mode: MODES.EFFECTS,
  label: "Deadlock — Winter Lock",
  description: "Cold nano-tech frost + drifting snow + soft scan veil.",
  enabled: false,
  expanded: false,
  order: 600
},
{
  id: "fx_effect_deadlock_gravnet_capture",
  agent: "deadlock",
  type: "fx",
  fxId: "fx_effect_deadlock_gravnet_capture",
  mode: MODES.EFFECTS,
  label: "Deadlock — GravNet Capture",
  description: "Nano grav-net capture grid snap + scan pulse + snowfall.",
  enabled: false,
  expanded: false,
  order: 601
},



{
  id: "fx_frame_brimstone_incendiary_burn",
  agent: "brimstone",
  type: "fx",
  fxId: "fx_frame_brimstone_incendiary_burn",
  mode: MODES.EFFECTS,
  label: "Brimstone — Incendiary Burn",
  description: "Ember edge glow + heat shimmer haze + drifting sparks.",
  enabled: false,
  expanded: false,
  order: 270
},

{
  id: "fx_frame_brimstone_sky_smoke",
  agent: "brimstone",
  type: "fx",
  fxId: "fx_frame_brimstone_sky_smoke",
  mode: MODES.EFFECTS,
  label: "Brimstone — Sky Smoke",
  description: "Layered drifting smoke plumes + ash motes (tintable).",
  enabled: false,
  expanded: false,
  order: 271
},

{
  id: "fx_effect_brimstone_orbital_strike",
  agent: "brimstone",
  type: "fx",
  fxId: "fx_effect_brimstone_orbital_strike",
  mode: MODES.EFFECTS,
  label: "Brimstone — Orbital Strike",
  description: "Target reticle + warning rings + beam rip + shockwave burst.",
  enabled: false,
  expanded: false,
  order: 272
},

{
  id: "fx_effect_sage_healing_wave",
  agent: "sage",
  type: "fx",
  fxId: "fx_effect_sage_healing_wave",
  mode: MODES.EFFECTS,
  label: "Sage — Healing Wave",
  description: "Mint healing rings + soft motes (one-shot).",
  enabled: false,
  expanded: false,
  order: 331
},

{
  id: "fx_effect_sage_barrier_rise",
  agent: "sage",
  type: "fx",
  fxId: "fx_effect_sage_barrier_rise",
  mode: MODES.EFFECTS,
  label: "Sage — Barrier Rise",
  description: "Ice wall panels rise + crack shimmer + lock pulse (one-shot).",
  enabled: false,
  expanded: false,
  order: 332
},


 {
    id: "fx_effect_omen_shadow_phase",
    type: "fx",
    fxId: "fx_effect_omen_shadow_phase",
    label: "Omen — Shadow Phase",
    description: "Living shadow fades in and out across the silhouette",
    mode: MODES.EFFECTS,
    order: 10,
    enabled: false,
    expanded: false
  },

{
  id: "fx_effect_omen_shadow_ripple",
  type: "fx",                     // 🔴 MUST be "fx"
  fxId: "fx_effect_omen_shadow_ripple",
  label: "Omen — Shadow Ripple",
  description: "Void pressure ripples across the frame",
  mode: MODES.EFFECTS,             // 🔴 MUST match active mode
  order: 9,
  enabled: false,
  expanded: false
},



{
  id: "fx_effect_omen_void_threads",
  type: "fx",
  fxId: "fx_effect_omen_void_threads",
  label: "Omen — Void Threads",
  description: "Horizontal void strands sweep across the silhouette",
  mode: MODES.EFFECTS,
  order: 35,
  enabled: false,
  expanded: false
},


    // ======================
    // JETT — FX
    // ======================
    {
      id: "jett_wind_shear",
      type: "fx",
      fxId: "fx_frame_jett_wind_shear",
      mode: MODES.EFFECTS,
      label: "Wind Shear",
      description: "Directional wind streaks cutting through the frame",
      enabled: false,
      expanded: false,
      order: 100
    },
    {
      id: "jett_dash_burst",
      type: "fx",
      fxId: "fx_effect_jett_dash_burst",
      mode: MODES.EFFECTS,
      label: "Dash Burst",
      description: "Radial wind burst (one-shot)",
      enabled: false,
      expanded: false,
      order: 110
    },
    {
      id: "jett_hover_drift",
      type: "fx",
      fxId: "fx_effect_jett_hover_drift",
      mode: MODES.EFFECTS,
      label: "Hover Drift",
      description: "Subtle floating air shimmer",
      enabled: false,
      expanded: false,
      order: 120
    },
// ======================
// PHOENIX — FX
// ======================
{
  id: "phoenix_hot_hands",
  type: "fx",
  fxId: "fx_effect_phoenix_hot_hands_burst",
  mode: MODES.EFFECTS,
  label: "Phoenix — Hot Hands",
  description: "Fiery radial explosion that blooms and fades",
  enabled: false,
  expanded: false,
  order: 130
},
{
  id: "phoenix_curveball",
  type: "fx",
  fxId: "fx_effect_phoenix_curveball_flash",
  mode: MODES.EFFECTS,
  label: "Phoenix — Curveball",
  description: "Curved fire arc followed by a blinding flash",
  enabled: false,
  expanded: false,
  order: 140
},
{
  id: "phoenix_run_it_back",
  type: "fx",
  fxId: "fx_effect_phoenix_run_it_back_ignition",
  mode: MODES.EFFECTS,
  label: "Phoenix — Run It Back",
  description: "Collapse into flame, then explosive rebirth",
  enabled: false,
  expanded: false,
  order: 150
},

{
  id: "fx_frame_reyna_dismiss_veil",
  agent: "reyna",
  type: "fx",
  fxId: "fx_frame_reyna_dismiss_veil",
  mode: MODES.EFFECTS,
  label: "Dismiss Veil",
  description: "Ghostly purple veil with subtle motion",
  enabled: false,
  expanded: false,
  order: 210
},

{
  id: "fx_frame_reyna_empress_overdrive",
  agent: "reyna",
  type: "fx",
  fxId: "fx_frame_reyna_empress_overdrive",
  mode: MODES.EFFECTS,
  label: "Empress Overdrive",
  description: "Aggressive energy surge and edge distortion",
  enabled: false,
  expanded: false,
  order: 230
},

// ======================
// R A Z E — FX
// ======================
{
  id: "raze_party_wave",
  type: "fx",
  fxId: "fx_frame_raze_party_wave",
  mode: MODES.EFFECTS,
  label: "Raze — Party Wave",
  description: "Firework pops + reactive synthwave over agent art",
  enabled: false,
  expanded: false,
  order: 240
},

// ======================
// Y O R U — FX
// ======================

{
  id: "fx_frame_yoru_gatecrash_combo",
  agent: "yoru",
  type: "fx",
  fxId: "fx_effect_yoru_gatecrash_tear",
  mode: MODES.EFFECTS,
  label: "Yoru — Gatecrash / Echo Step",
  description: "Echo step pulse + torn Gatecrash rift with shards and glow",

  enabled: false,
  expanded: false,
  order: 251
},

{
  id: "fx_frame_yoru_oni_reveal",
  agent: "yoru",
  type: "fx",
  fxId: "fx_frame_yoru_oni_reveal",
  mode: MODES.EFFECTS,
  label: "Yoru — Oni Mask Reveal",
  description: "Dimensional veil reveals a blue oni mask + phase sheen + piercing eyes.",
  enabled: false,
  expanded: false,
  order: 253
},
{
  id: "fx_effect_neon_relay_bolt",
  agent: "neon",
  type: "fx",
  fxId: "fx_effect_neon_relay_bolt",
  mode: MODES.EFFECTS,
  label: "Neon — Relay Bolt",
  description: "Electric bolt snap + sparks across the art.",
  enabled: false,
  expanded: false,
  order: 260
},
{
  id: "fx_frame_neon_high_gear",
  agent: "neon",
  type: "fx",
  fxId: "fx_frame_neon_high_gear",
  mode: MODES.EFFECTS,
  label: "Neon — High Gear",
  description: "Speed streak trails and kinetic electric bloom.",
  enabled: false,
  expanded: false,
  order: 261
},
{
  id: "fx_frame_neon_overdrive",
  agent: "neon",
  type: "fx",
  fxId: "fx_frame_neon_overdrive",
  mode: MODES.EFFECTS,
  label: "Neon — Overdrive",
  description: "Electric core pulse + voltage scanlines + sparks.",
  enabled: false,
  expanded: false,
  order: 262
},

{
  id: "fx_effect_sova_recon_pulse",
  agent: "sova",
  type: "fx",
  fxId: "fx_frame_sova_recon_pulse",
  mode: MODES.EFFECTS,
  label: "Sova — Recon Pulse",
  description: "Sonar recon rings + sweep arc + ping dots (tintable).",
  enabled: false,
  expanded: false,
  order: 280
},

{
  id: "fx_effect_sova_shock_dart",
  agent: "sova",
  type: "fx",
  fxId: "fx_effect_sova_shock_dart",
  mode: MODES.EFFECTS,
  label: "Sova — Shock Dart",
  description: "Electric impact bursts + crack rings + sparks (quick damage pulse).",
  enabled: false,
  expanded: false,
  order: 281
},

{
  id: "fx_effect_kayo_suppression_pulse",
  agent: "kayo",
  type: "fx",
  fxId: "fx_effect_kayo_suppression_pulse",
  mode: MODES.EFFECTS,
  label: "KAY/O — Suppression Pulse",
  description: "EMP shock ring + digital glitch shards (looping while enabled).",
  enabled: false,
  expanded: false,
  order: 300
},

{
  id: "fx_effect_kayo_zeropoint_field",
  agent: "kayo",
  type: "fx",
  fxId: "fx_effect_kayo_zeropoint_field",
  mode: MODES.EFFECTS,
  label: "KAY/O — ZERO/POINT Field",
  description: "Knife suppression field: scan lines + jitter nodes + core beacon.",
  enabled: false,
  expanded: false,
  order: 301
},

]
};

function tickFrameFx(rafMs) {

  const t = rafMs / 1000;

  const host =
    (typeof getFrameArtEl === "function")
      ? getFrameArtEl()
      : document.querySelector(".frame-art");

  if (!host) {
    requestAnimationFrame(tickFrameFx);
    return;
  }

  const layers =
    (typeof ensureFxLayers === "function")
      ? ensureFxLayers()
      : null;

  const frontEffect =
    layers?.frontEffect ||
    layers?.front ||
    document.querySelector(".frame-fx.front") ||
    null;

  const behindEffect =
    layers?.behindEffect ||
    layers?.behind ||
    document.querySelector(".frame-fx.behind") ||
    null;

  const ctxBase = {
    host,
    frameEl: host,
    front: frontEffect,
    behind: behindEffect,
    time: t
  };

  for (const fx of (FX_STATE?.fx || [])) {

    if (!fx || !fx.id) continue;

    const def =
      FX_REGISTRY?.[fx.id] ||
      FX_REGISTRY?.["fx_frame_" + fx.id] ||
      FX_REGISTRY?.["fx_effect_" + fx.id] ||
      FX_REGISTRY?.["fx_effect_" + String(fx.id).replace("effect.", "")] ||
      FX_REGISTRY?.["fx_frame_"  + String(fx.id).replace("frame.", "")];

    if (!def) continue;

    // --------------------------
    // OFF (cleanup once)
    // --------------------------
    if (!fx.on) {
      if (fx._wasOn) {
        const ctx = { ...ctxBase, fx };
        try { def.cleanup?.(ctx); } catch {}
        try { def.destroy?.(ctx); } catch {}
      }

      fx._wasOn = 0;
      fx._nextFireTime = 0;
      continue;
    }

    // --------------------------
    // ON (first frame)
    // --------------------------
    if (!fx._wasOn) {
      fx._wasOn = 1;

      if (typeof def.apply === "function") {
        const ctx = { ...ctxBase, fx };
        try { def.apply(ctx); } catch {}
      }

      if (def.scope === "effect") {
        fx._nextFireTime = 0;
      }
    }

    // --------------------------
    // CONTINUOUS TICK
    // --------------------------
    if (typeof def._tick === "function") {
      const ctx = { ...ctxBase, fx };
      try { def._tick(ctx, fx); }
      catch {
        try { def._tick(ctx); } catch {}
      }
      continue;
    }

    // --------------------------
    // CONTINUOUS EFFECT (optional)
    // --------------------------
    if (def.scope === "effect" && def.continuous === true && typeof def.apply === "function") {
      const ctx = { ...ctxBase, fx };
      try { def.apply(ctx); } catch {}
      continue;
    }

    // --------------------------
    // LEGACY EFFECT FIRE
    // --------------------------
    if (def.scope === "effect" && typeof def.apply === "function") {
      if (fx._nextFireTime == null) fx._nextFireTime = 0;

      if (t >= fx._nextFireTime) {
        const ctx = { ...ctxBase, fx };
        try { def.apply(ctx); } catch {}

        const cd = fx.p?.[2] ?? def.defaults?.[2] ?? 1.2;
        fx._nextFireTime = t + Math.max(0.1, cd);
      }
    }

  }

  requestAnimationFrame(tickFrameFx);
}

requestAnimationFrame(tickFrameFx);
function testDust() {
  dustParticles({ count: 40 });
}


function selectAgent(agentId) {
  const key = String(agentId || "").toLowerCase();

  const agent =
    AGENTS.find(a => String(a.id || "").toLowerCase() === key) || AGENTS[0];

  if (!agent) return;

  FX_STATE.agent = agent.id;

  if (ctxAgentName) ctxAgentName.textContent = agent.name;

  // ✅ artwork
  setFrameArt(agent.image);

  renderCards();
  renderFrame();
  if (typeof updateLeftContext === "function") updateLeftContext();
  if (typeof refreshPresetDropdown === "function") refreshPresetDropdown();
}

function resetEmbeddedAgentFx() {
  FX_STATE.fx.forEach(fx => {
    fx.on = 0;
    fx._inited = false;
    fx.__inited = false;
    fx._tick = null;
    fx.__el = null;
  });

  FX_STATE.fx = [];
  FX_STATE._alias = Object.create(null);

  const frame = document.querySelector(".frame");
  if (!frame) return;

  frame.querySelectorAll(".frame-fx.behind, .frame-fx.front").forEach(layer => {
    layer.innerHTML = "";
  });

  const art = frame.querySelector(".frame-art");
  art?.querySelectorAll(".frame-art-inner").forEach(node => node.remove());
}

function mountEmbeddedAgentFx(agentId, config = {}) {
  const id = String(agentId || "").trim();
  if (!id) return;

  FX_STATE.agent = id.toUpperCase();
  resetEmbeddedAgentFx();

  const art = config?.frame?.art || {};
  setFrameArt(art.src || "");
  setFrameTransform({
    x: Number.isFinite(Number(art.x)) ? Number(art.x) : 0,
    y: Number.isFinite(Number(art.y)) ? Number(art.y) : 0,
    s: Number.isFinite(Number(art.s)) ? Number(art.s) : 1
  });

  const list = Array.isArray(config?.fx) ? config.fx : [];
  list.forEach(rawFx => {
    if (!rawFx?.id) return;
    const fx = ensureFx(rawFx.id);
    if (!fx) return;
    fx.on = Number(rawFx.on) === 1 ? 1 : 0;
    fx.p = Array.isArray(rawFx.p) ? rawFx.p.slice() : fx.p;
    fx._inited = false;
    fx.__inited = false;
    fx._tick = null;
    fx.__el = null;
  });

  renderFrame();
  applyFxPreview(true);
}

window.SandboxFxEngine = {
  FX_STATE,
  FX_REGISTRY,
  ensureFx,
  renderFrame,
  setFrameArt,
  setFrameTransform,
  mountEmbeddedAgentFx,
  resetEmbeddedAgentFx
};


/* ========= INIT ========= */

// Force initial mode explicitly
frameState.mode = MODES.INTRO;

// Sync mode bar UI
if (!window.__SANDBOX_FX_EMBED_MODE__) {
  Array.from(modeBar.querySelectorAll("button")).forEach(b =>
    b.classList.toggle("active", b.dataset.mode === frameState.mode)
  );
}

// --- INITIAL FX STATE SYNC (FRAME ART) ---
// ❌ DO NOT apply agent art here
// Art is controlled exclusively by agent selection via setFrameArt()

// Ensure frame transform state exists only
FX_STATE.frame.art ||= { x: 0, y: 0, s: 1 };

// Initial renders
if (!window.__SANDBOX_FX_EMBED_MODE__) {
  renderCards();
  renderFrame();
  renderAgentPicker();
} else {
  renderFrame();
}

// ✅ pick default agent on boot (keeps your “don’t apply art in init” rule)
if (!window.__SANDBOX_FX_EMBED_MODE__) {
  selectAgent(FX_STATE.agent || "YORU");
}

if (!window.__SANDBOX_FX_EMBED_MODE__ && typeof updateLeftContext === "function") {
  updateLeftContext();
}

if (!window.__SANDBOX_FX_EMBED_MODE__) {
  setTimeout(() => {
    const frame = document.querySelector(".frame");
    const behind = document.querySelector(".frame-fx.behind");
    const front  = document.querySelector(".frame-fx.front");
  }, 800);
}


console.log("EOF OK");
