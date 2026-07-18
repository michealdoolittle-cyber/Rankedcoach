// One-command emergency escape hatch for a bad Featured Playlist match.
// Usage: node scripts/unpublish-video.js VIDEO_ID
// Restore: node scripts/unpublish-video.js VIDEO_ID --restore
const { spawnSync } = require("node:child_process");

const namespaceId = "ae66a938fffc4177a899337ba55165eb";
const videoId = String(process.argv[2] || "").trim();
const restore = process.argv.includes("--restore");

if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
  console.error("Provide one valid 11-character YouTube video ID.");
  process.exit(1);
}

function runWrangler(args) {
  const npxArgs = ["wrangler", "kv", "key", ...args, "--remote"];
  const command = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : "npx";
  const commandArgs = process.platform === "win32" ? ["/d", "/s", "/c", "npx", ...npxArgs] : npxArgs;
  const result = spawnSync(command, commandArgs, {
    cwd: process.cwd(),
    stdio: "inherit",
    windowsHide: true
  });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status || 1);
}

const key = `video:suppressed:${videoId}`;
if (restore) {
  runWrangler(["delete", "--namespace-id", namespaceId, key]);
} else {
  runWrangler(["put", "--namespace-id", namespaceId, key, new Date().toISOString()]);
}
runWrangler(["delete", "--namespace-id", namespaceId, "playlist:featured"]);
console.log(`${restore ? "Restored" : "Unpublished"} ${videoId}; the Featured Playlist cache was cleared.`);
