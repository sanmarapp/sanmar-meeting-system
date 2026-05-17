# ──────────────────────────────────────────────────────────────
# convert-logos.ps1
# Converts Sanmar EPS brand files → PNG for the frontend public folder.
# Requires Inkscape OR ImageMagick (magick) to be installed.
# ──────────────────────────────────────────────────────────────

$PublicDir = "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system\apps\frontend\public"

# Source EPS files — place your originals in the project root with these names
$ProjectRoot  = "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"
$WordmarkEps  = Join-Path $ProjectRoot "sanmar-logo.eps"
$IconEps      = Join-Path $ProjectRoot "sanmar-icon.eps"

# Outputs
$LogoPng     = Join-Path $PublicDir "logo.png"
$Icon192Png  = Join-Path $PublicDir "icon-192.png"
$FaviconPng  = Join-Path $PublicDir "favicon.png"

Write-Host ""
Write-Host "Sanmar Logo Converter" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray

# ── Check source files ─────────────────────────────────────────
if (-not (Test-Path $WordmarkEps)) {
    Write-Host "ERROR: Wordmark EPS not found at expected path." -ForegroundColor Red
    Write-Host "  Please copy 'Sanmar Logo.eps' to this folder and re-run." -ForegroundColor Yellow
    exit 1
}
if (-not (Test-Path $IconEps)) {
    Write-Host "ERROR: Icon EPS not found at expected path." -ForegroundColor Red
    Write-Host "  Please copy 'Home Screen Logo.eps' to this folder and re-run." -ForegroundColor Yellow
    exit 1
}

Write-Host "Source files found." -ForegroundColor Green

# ── Detect converter ───────────────────────────────────────────
$UseInkscape = $false
$UseMagick   = $false

$InkscapeCmd  = Get-Command inkscape -ErrorAction SilentlyContinue
$MagickCmd    = Get-Command magick   -ErrorAction SilentlyContinue
$InkscapePath = if ($InkscapeCmd) { $InkscapeCmd.Source } else { $null }
$MagickPath   = if ($MagickCmd)   { $MagickCmd.Source   } else { $null }

if ($InkscapePath) {
    Write-Host "Using Inkscape: $InkscapePath" -ForegroundColor DarkGray
    $UseInkscape = $true
} elseif ($MagickPath) {
    Write-Host "Using ImageMagick: $MagickPath" -ForegroundColor DarkGray
    $UseMagick = $true
} else {
    Write-Host ""
    Write-Host "Neither Inkscape nor ImageMagick found on PATH." -ForegroundColor Red
    Write-Host "Install one of the following, then re-run:" -ForegroundColor Yellow
    Write-Host "  Inkscape:     https://inkscape.org/release/" -ForegroundColor White
    Write-Host "  ImageMagick:  https://imagemagick.org/script/download.php" -ForegroundColor White
    Write-Host ""
    Write-Host "ALTERNATIVE: Copy logo files manually to:" -ForegroundColor Cyan
    Write-Host "  $PublicDir" -ForegroundColor White
    Write-Host "  - logo.png       (wordmark, transparent bg, ~400px wide)" -ForegroundColor White
    Write-Host "  - icon-192.png   (square icon, 192×192 px)" -ForegroundColor White
    Write-Host "  - favicon.png    (square icon, 64×64 px)" -ForegroundColor White
    exit 1
}

# ── Convert wordmark → logo.png ────────────────────────────────
Write-Host ""
Write-Host "Converting wordmark..." -ForegroundColor Cyan

if ($UseInkscape) {
    & inkscape $WordmarkEps --export-type=png --export-filename=$LogoPng --export-width=560 2>&1 | Out-Null
} else {
    & magick -density 300 $WordmarkEps -resize 560x -background none -flatten $LogoPng 2>&1 | Out-Null
}

if (Test-Path $LogoPng) {
    Write-Host "  logo.png saved." -ForegroundColor Green
} else {
    Write-Host "  logo.png conversion failed." -ForegroundColor Red
}

# ── Convert icon → icon-192.png ────────────────────────────────
Write-Host "Converting app icon..." -ForegroundColor Cyan

if ($UseInkscape) {
    & inkscape $IconEps --export-type=png --export-filename=$Icon192Png --export-width=192 --export-height=192 2>&1 | Out-Null
} else {
    & magick -density 300 $IconEps -resize 192x192 -background none -flatten $Icon192Png 2>&1 | Out-Null
}

if (Test-Path $Icon192Png) {
    Write-Host "  icon-192.png saved." -ForegroundColor Green
    # Also copy as favicon at 64x64
    if ($UseInkscape) {
        & inkscape $IconEps --export-type=png --export-filename=$FaviconPng --export-width=64 --export-height=64 2>&1 | Out-Null
    } else {
        & magick $Icon192Png -resize 64x64 $FaviconPng 2>&1 | Out-Null
    }
    if (Test-Path $FaviconPng) { Write-Host "  favicon.png saved." -ForegroundColor Green }
} else {
    Write-Host "  icon-192.png conversion failed." -ForegroundColor Red
}

Write-Host ""
Write-Host "Done. Logos are in: $PublicDir" -ForegroundColor Green
Write-Host "Run push-frontend.ps1 next to push to GitHub." -ForegroundColor Cyan
