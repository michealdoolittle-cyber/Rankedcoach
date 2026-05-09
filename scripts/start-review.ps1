$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$serverScript = Join-Path $repoRoot "scripts\review-server.js"

if (!(Test-Path $serverScript)) {
  throw "Could not find review server script at $serverScript"
}

Write-Host "Starting RankedCoach local review server on http://127.0.0.1:3000"
node $serverScript
