import { access } from "node:fs/promises";
import path from "node:path";
import {
  COMPETITIVE_MAP_IDS,
  ROOT,
  loadLibraryState
} from "./library-pipeline-core.mjs";

const MAP_DIR = path.join(ROOT, "public", "assets", "library", "maps");

// Retired 2026-07-31:
// The app no longer generates Riot-minimap SVG layouts. Every competitive map
// now uses a hand-reviewed TRN-style tactical PNG checked into this repository.
// Keep this filename as a compatibility validator so any old automation that
// calls it fails safely instead of silently regenerating the previous style.

const state = await loadLibraryState();
const missing = [];
const disconnected = [];

for (const id of COMPETITIVE_MAP_IDS) {
  const expected = `/assets/library/maps/${id}-layout-trn.png`;
  const file = path.join(MAP_DIR, `${id}-layout-trn.png`);
  try {
    await access(file);
  } catch (_error) {
    missing.push(expected);
  }
  const map = (state.maps || []).find(item => item.id === id);
  if (map?.layoutImage !== expected || map?.calloutLabelsBakedIn !== true) {
    disconnected.push(`${id} -> ${map?.layoutImage || "missing"}`);
  }
}

if (missing.length || disconnected.length) {
  if (missing.length) console.error(`Missing TRN map layout assets:\n${missing.join("\n")}`);
  if (disconnected.length) console.error(`Map layout overrides are not wired to TRN PNGs:\n${disconnected.join("\n")}`);
  process.exit(1);
}

console.log(`Verified ${COMPETITIVE_MAP_IDS.length} static TRN-style map layouts. Generation is retired.`);
