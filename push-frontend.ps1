Set-Location "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"

# Optional: run convert-logos.ps1 first if real PNG logos are needed
# .\convert-logos.ps1

Write-Host "Installing new frontend packages..." -ForegroundColor Cyan
npm install -w apps/frontend

if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed. Check output above." -ForegroundColor Red
    exit 1
}

Write-Host "Staging all frontend changes..." -ForegroundColor Cyan
git add -A

Write-Host "Committing..." -ForegroundColor Cyan
git commit -m "feat(frontend): dark sidebar + golden brand system

- Sidebar: dark variant (#1A1614 bg) with golden active states (#C9A97A)
- Logo: updated to golden fill for dark sidebar visibility
- Nav: inline-style hover states (Tailwind-safe arbitrary hex)
- User footer: avatar initials, role label, logout with reveal-on-hover
- Admin section: conditional Manage group for ADMIN/MANAGER roles"

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful!" -ForegroundColor Green
    Write-Host "Railway will auto-deploy. Frontend runs on: npm run dev -w apps/frontend" -ForegroundColor Cyan
} else {
    Write-Host "Push failed. Check output above." -ForegroundColor Red
}
