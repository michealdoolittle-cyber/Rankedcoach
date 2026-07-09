# Deploys the Worker and pushes a notification via ntfy.sh when it's done.
# Usage: powershell -File scripts\deploy-and-notify.ps1
npx wrangler deploy
if ($LASTEXITCODE -eq 0) {
  node scripts/notify.js "RankedCoach deploy succeeded"
} else {
  node scripts/notify.js "RankedCoach deploy FAILED (exit $LASTEXITCODE)"
  exit $LASTEXITCODE
}
