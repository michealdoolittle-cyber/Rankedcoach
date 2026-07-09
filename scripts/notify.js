// Sends a push notification via ntfy.sh (no account needed).
// Usage: node scripts/notify.js "message text"
// Topic can be overridden with the RANKEDCOACH_NTFY_TOPIC env var so it
// doesn't have to be committed/shared if you want a private one.
const DEFAULT_TOPIC = "rankedcoach-deploys-mk7x2q";
const topic = process.env.RANKEDCOACH_NTFY_TOPIC || DEFAULT_TOPIC;
const message = process.argv.slice(2).join(" ") || "RankedCoach notification";

fetch(`https://ntfy.sh/${topic}`, {
  method: "POST",
  headers: { "Title": "RankedCoach" },
  body: message
})
  .then((res) => {
    if (!res.ok) throw new Error(`ntfy.sh responded ${res.status}`);
    console.log(`Notified (ntfy.sh/${topic}): ${message}`);
  })
  .catch((err) => {
    console.error(`Notification failed: ${err.message}`);
    process.exitCode = 1;
  });
