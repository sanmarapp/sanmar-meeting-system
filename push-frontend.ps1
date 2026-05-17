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
$msg = @"
feat(frontend): BookingsPage with filters and status badges

- Full /bookings page: table layout, status tabs, search, date filter
- Status tabs: All / Pending / Approved / Rejected / Cancelled / Completed
- Table: Meeting, Room, Date and Time, Attendees, Status, chevron
- Admin/Manager: extra Requested By and Department column
- Skeleton loading, empty state, filter-aware empty state messaging
- Pagination: 15 per page, prev/next controls, page indicator
- isFetching dimming on filter change for perceived speed
- Wired into App.tsx replacing ComingSoon placeholder
"@
git commit -m $msg

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful!" -ForegroundColor Green
    Write-Host "Railway will auto-deploy. Frontend runs on: npm run dev -w apps/frontend" -ForegroundColor Cyan
} else {
    Write-Host "Push failed. Check output above." -ForegroundColor Red
}
