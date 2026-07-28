import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ROOT,
  VALORANT_API_ROOT,
  fetchJson,
  loadLibraryState,
  slug
} from "./library-pipeline-core.mjs";

const MAP_DIR = path.join(ROOT, "public", "assets", "library", "maps");
const OVERRIDE_FILE = path.join(ROOT, "public", "library", "gamesense-map-layout-overrides.js");

// A hand-reviewed flat tactical layout has its own geometry, zone fills, and
// baked labels.  Riot's public displayIcon + callout-coordinate feed does not
// contain those room polygons, so the automatic minimap renderer must never
// overwrite an approved flat layout with a different visual treatment.
function isHandVerifiedFlatLayout(layoutImage = "") {
  return /-layout-trn\.(?:png|webp|svg)(?:\?.*)?$/i.test(String(layoutImage));
}

function xml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;"
  })[character]);
}

function transformedPoint(point, angle) {
  const x = Number(point.x) * 10;
  const y = Number(point.y) * 10;
  if (angle === 90) return { ...point, x: (1000 - y) / 10, y: x / 10 };
  if (angle === 180) return { ...point, x: (1000 - x) / 10, y: (1000 - y) / 10 };
  if (angle === 270) return { ...point, x: y / 10, y: (1000 - x) / 10 };
  return { ...point, x: Number(point.x), y: Number(point.y) };
}

function orientationAngle(callouts = []) {
  const attacker = callouts.find(item => item.superRegionName === "Attacker Side" && item.regionName === "Spawn");
  const defender = callouts.find(item => item.superRegionName === "Defender Side" && item.regionName === "Spawn");
  if (!attacker || !defender) return 0;
  const dx = Number(attacker.x) - Number(defender.x);
  const dy = Number(attacker.y) - Number(defender.y);
  // CSS y grows downward.  Choose the cardinal rotation that places attack
  // closest to the top and defender closest to the bottom.
  const candidates = [
    { angle: 0, vertical: dy },
    { angle: 90, vertical: dx },
    { angle: 180, vertical: -dy },
    { angle: 270, vertical: -dx }
  ];
  return candidates.sort((left, right) => left.vertical - right.vertical)[0].angle;
}

function overlap(left, right, padding = 9) {
  return !(left.x + left.width + padding < right.x || right.x + right.width + padding < left.x || left.y + left.height + padding < right.y || right.y + right.height + padding < left.y);
}

function placeLabels(callouts = []) {
  const placed = [];
  const directions = [[1, 0], [-1, 0], [0, -1], [0, 1], [1, -1], [-1, -1], [1, 1], [-1, 1]];
  const radii = [24, 48, 74, 104, 140, 176];
  for (const callout of callouts) {
    const anchorX = Number(callout.x) * 10;
    const anchorY = Number(callout.y) * 10;
    const width = Math.min(204, Math.max(88, String(callout.label).length * 8.1 + 24));
    const height = 32;
    let selected;
    for (const radius of radii) {
      for (const [dx, dy] of directions) {
        const candidate = {
          x: Math.max(8, Math.min(992 - width, anchorX + dx * radius - (dx <= 0 ? width : 0))),
          y: Math.max(8, Math.min(960, anchorY + dy * radius - (dy <= 0 ? height : 0))),
          width,
          height
        };
        if (!placed.some(item => overlap(item, candidate))) {
          selected = candidate;
          break;
        }
      }
      if (selected) break;
    }
    selected ||= { x: Math.max(8, Math.min(992 - width, anchorX + 18)), y: Math.max(8, Math.min(960, anchorY + 12)), width, height };
    placed.push({ ...selected, anchorX, anchorY, callout });
  }
  return placed;
}

function zoneColor(callout, callouts) {
  const attacker = callouts.find(item => item.superRegionName === "Attacker Side" && item.regionName === "Spawn");
  const defender = callouts.find(item => item.superRegionName === "Defender Side" && item.regionName === "Spawn");
  if (!attacker || !defender) return "#a8b3c7";
  const distance = (left, right) => Math.hypot(Number(left.x) - Number(right.x), Number(left.y) - Number(right.y));
  const delta = Math.abs(distance(callout, attacker) - distance(callout, defender));
  if (delta < 9 || /^(mid)\b/i.test(callout.label)) return "#a8b3c7";
  return distance(callout, attacker) < distance(callout, defender) ? "#55ddd4" : "#ff6675";
}

async function fetchAsset(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!response.ok) throw new Error(`map display icon HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "image/png";
  return { mime: contentType.split(";")[0], base64: Buffer.from(await response.arrayBuffer()).toString("base64") };
}

function buildSvg(map, image, angle, { labels = true } = {}) {
  const callouts = (map.callouts || []).map(item => transformedPoint(item, angle));
  const labelMarkup = labels ? placeLabels(callouts).map(item => {
    const color = zoneColor(item.callout, callouts);
    const centerX = item.x + item.width / 2;
    const centerY = item.y + item.height / 2;
    return `<g><path d="M ${item.anchorX.toFixed(1)} ${item.anchorY.toFixed(1)} L ${centerX.toFixed(1)} ${centerY.toFixed(1)}" stroke="${color}" stroke-width="2" opacity=".72"/><circle cx="${item.anchorX.toFixed(1)}" cy="${item.anchorY.toFixed(1)}" r="5" fill="#08111f" stroke="${color}" stroke-width="3"/><rect x="${item.x.toFixed(1)}" y="${item.y.toFixed(1)}" width="${item.width.toFixed(1)}" height="${item.height}" rx="8" fill="#07101ee8" stroke="${color}" stroke-width="2"/><text x="${centerX.toFixed(1)}" y="${(item.y + 20).toFixed(1)}" text-anchor="middle" fill="#f8fafc" font-family="Rajdhani,Arial,sans-serif" font-size="15" font-weight="800">${xml(item.callout.label)}</text></g>`;
  }).join("\n") : "";
  const title = labels ? `${map.label} complete callout map` : `${map.label} plant reference map`;
  const description = labels
    ? `Official VALORANT tactical map with ${callouts.length} source-verified callouts. Attacker spawn is oriented toward the top; defender spawn toward the bottom. Teal labels are closer to attacker spawn, red labels are closer to defender spawn, and gray labels are central.`
    : "Official VALORANT tactical map oriented with attacker spawn toward the top and defender spawn toward the bottom. The player interface adds only spike plant markers over this image.";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" role="img" aria-labelledby="title desc"><title id="title">${xml(title)}</title><desc id="desc">${xml(description)}</desc><image href="data:${image.mime};base64,${image.base64}" width="1000" height="1000" preserveAspectRatio="xMidYMid meet" transform="rotate(${angle} 500 500)"/><rect width="1000" height="1000" fill="#030712" opacity=".08"/>${labelMarkup}</svg>\n`;
}

const [state, liveMaps] = await Promise.all([
  loadLibraryState(),
  fetchJson(`${VALORANT_API_ROOT}/maps?language=en-US`)
]);
const apiById = new Map((liveMaps.data || []).map(map => [slug(map.displayName), map]));
const layouts = {};
await mkdir(MAP_DIR, { recursive: true });

for (const map of state.maps || []) {
  const id = map.id || slug(map.label);
  const apiMap = apiById.get(id);
  if (!apiMap?.displayIcon || !(map.callouts || []).length) {
    console.warn(`Skipped ${map.label}: official display icon or canonical callouts unavailable.`);
    continue;
  }
  const angle = orientationAngle(map.callouts);
  const image = await fetchAsset(apiMap.displayIcon);
  const output = path.join(MAP_DIR, `${id}-layout-labeled.svg`);
  const plantOutput = path.join(MAP_DIR, `${id}-layout-plants.svg`);
  const preserveFlatLayout = isHandVerifiedFlatLayout(map.layoutImage);
  const writes = [
    writeFile(plantOutput, buildSvg(map, image, angle, { labels: false }), "utf8")
  ];
  // Do not even regenerate the alternate labeled SVG for an approved flat
  // layout.  Leaving its last generated file alone is harmless, but producing
  // a fresh, visibly different replacement makes accidental reuse too easy.
  if (!preserveFlatLayout) {
    writes.unshift(writeFile(output, buildSvg(map, image, angle, { labels: true }), "utf8"));
  }
  await Promise.all(writes);
  // A Riot callout centre identifies a site, not an exact spike location.
  // Never turn one into a plant marker: only retain authored spots whose
  // source actually publishes a named plant location and its placement.
  const originalPlantSpots = Array.isArray(map.plantSpots) ? map.plantSpots : [];
  layouts[id] = {
    // Keep the base-map layout image when it is a reviewed flat zone asset.
    // The generated plant image is deliberately separate: its marker
    // coordinate system follows the normalized Riot minimap layer.
    ...(preserveFlatLayout ? {} : { layoutImage: `/assets/library/maps/${id}-layout-labeled.svg` }),
    plantLayoutImage: `/assets/library/maps/${id}-layout-plants.svg`,
    calloutLabelsBakedIn: true,
    plantSpots: originalPlantSpots.map(spot => transformedPoint(spot, angle)),
    plantRateNote: originalPlantSpots.length
      ? map.plantRateNote
      : map.plantRateNote || "No source-verified named spike-plant locations are published for this map. The map is shown without fabricated site-centroid markers.",
    tacticalMapSource: `${VALORANT_API_ROOT}/maps/${apiMap.uuid}?language=en-US`
  };
}

const override = `// Generated by scripts/build-official-map-layouts.mjs.\n// Official Riot display icons and canonical callout coordinates, normalized to attack-top/defense-bottom.\n(function () {\n  \"use strict\";\n  const LAYOUTS = Object.freeze(${JSON.stringify(layouts, null, 2)});\n  const maps = (globalThis.RankedCoachGamesenseMaps || []).map(map => ({ ...map, ...(LAYOUTS[map.id] || {}) }));\n  globalThis.RankedCoachGamesenseOfficialMapLayouts = LAYOUTS;\n  globalThis.RankedCoachGamesenseMaps = Object.freeze(maps);\n})();\n`;
await writeFile(OVERRIDE_FILE, override, "utf8");
console.log(`Built ${Object.keys(layouts).length} official map layouts with normalized spawn orientation.`);
