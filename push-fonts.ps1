Set-Location "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"

# ── 1. Copy Brown Pro font files ──────────────────────────────
$fontsDir  = "apps\frontend\public\fonts"
$sourceDir = "E:\E drive\Fonts"

New-Item -ItemType Directory -Force -Path $fontsDir | Out-Null

$files = @("BrownPro-Light.otf", "BrownPro-Regular.otf")
foreach ($f in $files) {
    $src  = Join-Path $sourceDir $f
    $dest = Join-Path $fontsDir  $f
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Force
        Write-Host "Copied $f" -ForegroundColor Green
    } else {
        Write-Host "MISSING: $src" -ForegroundColor Red
        exit 1
    }
}

# ── 2. Stage and commit ───────────────────────────────────────
Write-Host "`nStaging changes..." -ForegroundColor Cyan
git add -A

Write-Host "Committing..." -ForegroundColor Cyan
$msg = @"
feat(frontend): apply Brown Pro font — Light 300 + Regular 400

Typography migration:
- Add @font-face for BrownPro-Light.otf (weight 300) and BrownPro-Regular.otf (weight 400)
- Switch font-sans from DM Sans to Brown Pro in Tailwind config
- Remove DM Sans from Google Fonts (keep Playfair Display + Fira Code)
- Update body font-family in index.css to Brown Pro
- Fix h5/h6 and .label-xs to font-weight 400

Font-weight audit (Brown Pro surfaces -> font-normal):
- Button base class: font-medium -> font-normal
- Badge pill: font-medium -> font-normal
- Input/Textarea labels: font-medium -> font-normal
- Sidebar: nav links, user name, initials, section labels -> font-normal
- Header: location pill, notification title/items, mark-read link, badge count -> font-normal
- main.tsx Sonner toast title: font-semibold -> font-normal
- All page table headers, filter tabs, body text -> font-normal
- Playfair Display (font-display) headings unchanged (600 weight supported natively)
"@
git commit -m $msg

# ── 3. Push ───────────────────────────────────────────────────
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Done. Frontend will pick up Brown Pro on next dev server restart." -ForegroundColor Green
} else {
    Write-Host "Push failed." -ForegroundColor Red
}
