[CmdletBinding()]
param(
  # Overview collage cells render at roughly 70-110 CSS pixels. Keep the
  # derivatives comfortably above that while avoiding an eager 13-image decode
  # spike when the Library opens.
  [int]$MapWidth = 360,
  [int]$AgentWidth = 360,
  [int]$JpegQuality = 82
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$mapSourceRoot = Join-Path $repoRoot "public\assets\library\maps"
$mapThumbRoot = Join-Path $mapSourceRoot "thumbs"
$agentRoot = Join-Path $repoRoot "public\assets\library\agents"
New-Item -ItemType Directory -Force -Path $mapThumbRoot | Out-Null

Add-Type -AssemblyName System.Drawing

$mapSources = [ordered]@{
  abyss    = "https://media.valorant-api.com/maps/224b0a95-48b9-f703-1bd8-67aca101a61f/splash.png"
  ascent   = "https://media.valorant-api.com/maps/7eaecc1b-4337-bbf6-6ab9-04b8f06b3319/splash.png"
  bind     = (Join-Path $mapSourceRoot "bind-card.png")
  breeze   = (Join-Path $mapSourceRoot "breeze-card.png")
  corrode  = "https://media.valorant-api.com/maps/1c18ab1f-420d-0d8b-71d0-77ad3c439115/splash.png"
  fracture = "https://media.valorant-api.com/maps/b529448b-4d60-346e-e89e-00a4c527a405/splash.png"
  haven    = "https://media.valorant-api.com/maps/2bee0dc9-4ffe-519b-1cbd-7fbe763a6047/splash.png"
  icebox   = "https://media.valorant-api.com/maps/e2ad5c54-4114-a870-9641-8ea21279579a/splash.png"
  lotus    = "https://media.valorant-api.com/maps/2fe4ed3a-450a-948b-6d6b-e89a78e680a9/splash.png"
  pearl    = "https://media.valorant-api.com/maps/fd267378-4d1d-484f-ff52-77821ed10dc2/splash.png"
  split    = (Join-Path $mapSourceRoot "split-card.png")
  summit   = "https://media.valorant-api.com/maps/756da597-416b-c0f2-f47b-afbdf28670bc/splash.png"
  sunset   = "https://media.valorant-api.com/maps/92584fbe-486a-b1b2-9faa-39b0f486b498/splash.png"
}

function Save-ResizedJpeg {
  param(
    [Parameter(Mandatory)] [string]$InputPath,
    [Parameter(Mandatory)] [string]$OutputPath,
    [Parameter(Mandatory)] [int]$Width,
    [Parameter(Mandatory)] [int]$Quality
  )
  $source = [System.Drawing.Image]::FromFile($InputPath)
  try {
    $height = [Math]::Max(1, [int][Math]::Round($source.Height * ($Width / [double]$source.Width)))
    $canvas = New-Object System.Drawing.Bitmap $Width, $height
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear([System.Drawing.Color]::Black)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $Width, $height)
        $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq "image/jpeg"
        $parameters = New-Object System.Drawing.Imaging.EncoderParameters 1
        $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
        $canvas.Save($OutputPath, $codec, $parameters)
        $parameters.Dispose()
      } finally {
        $graphics.Dispose()
      }
    } finally {
      $canvas.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

function Save-ResizedPng {
  param(
    [Parameter(Mandatory)] [string]$InputPath,
    [Parameter(Mandatory)] [string]$OutputPath,
    [Parameter(Mandatory)] [int]$Width
  )
  $source = [System.Drawing.Image]::FromFile($InputPath)
  try {
    $height = [Math]::Max(1, [int][Math]::Round($source.Height * ($Width / [double]$source.Width)))
    $canvas = New-Object System.Drawing.Bitmap $Width, $height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($source, 0, 0, $Width, $height)
        $canvas.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $graphics.Dispose()
      }
    } finally {
      $canvas.Dispose()
    }
  } finally {
    $source.Dispose()
  }
}

foreach ($entry in $mapSources.GetEnumerator()) {
  $temporary = $null
  try {
    $sourcePath = [string]$entry.Value
    if ($sourcePath -match "^https?://") {
      $temporary = Join-Path $env:TEMP ("rankedcoach-map-" + $entry.Key + ".png")
      Invoke-WebRequest -Uri $sourcePath -OutFile $temporary
      $sourcePath = $temporary
    }
    Save-ResizedJpeg -InputPath $sourcePath -OutputPath (Join-Path $mapThumbRoot ($entry.Key + ".jpg")) -Width $MapWidth -Quality $JpegQuality
  } finally {
    if ($temporary) { Remove-Item -LiteralPath $temporary -Force -ErrorAction SilentlyContinue }
  }
}

Get-ChildItem -Path $agentRoot -Directory | ForEach-Object {
  $portrait = Join-Path $_.FullName "portrait.png"
  if (Test-Path -LiteralPath $portrait) {
    Save-ResizedPng -InputPath $portrait -OutputPath (Join-Path $_.FullName "portrait-card.png") -Width $AgentWidth
  }
}

Write-Host "Generated Library overview thumbnails in $mapThumbRoot."
