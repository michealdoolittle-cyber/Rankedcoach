param(
  [int]$Scale = 8,
  [int]$JpegQuality = 96
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$repoRoot = Split-Path -Parent $PSScriptRoot
$appPath = Join-Path $repoRoot "public\app.js"
$outputDir = Join-Path $repoRoot "public\assets\profile-banners\upscaled"

if (-not (Test-Path $appPath)) {
  throw "Unable to find public/app.js at $appPath"
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
Add-Type -AssemblyName System.Drawing

$source = Get-Content -LiteralPath $appPath -Raw
$matches = [regex]::Matches($source, "https://media\.valorant-api\.com/playercards/([0-9a-fA-F-]{36})/wideart\.png")
$uuids = @($matches | ForEach-Object { $_.Groups[1].Value.ToLowerInvariant() } | Sort-Object -Unique)

if (-not $uuids.Count) {
  throw "No static Valorant player-card wide-art URLs found in public/app.js"
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" } | Select-Object -First 1
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([int64]$JpegQuality)

foreach ($uuid in $uuids) {
  $target = Join-Path $outputDir "$uuid.jpg"
  $url = "https://media.valorant-api.com/playercards/$uuid/wideart.png"
  $temp = Join-Path $env:TEMP "rankedcoach-banner-$uuid.png"

  Invoke-WebRequest -Uri $url -OutFile $temp -UseBasicParsing
  $sourceImage = [System.Drawing.Image]::FromFile($temp)
  try {
    $width = [Math]::Max(1, [int]($sourceImage.Width * $Scale))
    $height = [Math]::Max(1, [int]($sourceImage.Height * $Scale))
    $upscaled = New-Object System.Drawing.Bitmap $width, $height
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($upscaled)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
      } finally {
        $graphics.Dispose()
      }
      $upscaled.Save($target, $jpegCodec, $encoderParams)
    } finally {
      $upscaled.Dispose()
    }
  } finally {
    $sourceImage.Dispose()
    Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "Generated $($uuids.Count) profile banner upscales in $outputDir"
