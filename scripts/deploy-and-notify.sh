#!/usr/bin/env bash
# Deploys the Worker and pushes a notification via ntfy.sh when it's done.
# Usage: bash scripts/deploy-and-notify.sh
set -o pipefail
npx wrangler deploy
status=$?
if [ $status -eq 0 ]; then
  node scripts/notify.js "RankedCoach deploy succeeded"
else
  node scripts/notify.js "RankedCoach deploy FAILED (exit $status)"
fi
exit $status
