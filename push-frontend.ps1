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
feat(frontend): all remaining pages — rooms, site visits, approvals, users, settings

RoomsPage (/rooms):
- Card grid (3-col) with type color strip, capacity, amenities, location
- Type filter tabs plus search bar, client-side filtering
- Amenity icons mapped from keywords, Book CTA on each card

SiteVisitsPage (/site-visits):
- Table with status tabs: All / Scheduled / Completed / Cancelled / No Show
- Columns: Client, Site, Date and Time, Booked By, Status, chevron
- Search and date filters with clear button

NewSiteVisitPage (/site-visits/new):
- Client picker and site picker loaded from API
- Date and time inputs with live summary card
- Notes textarea, validation, useMutation with toast and redirect

ApprovalsPage (/approvals):
- Pending bookings list with inline Approve and Reject buttons
- Admin/Manager only (access-restricted for other roles)
- Warning banner showing count, React Query cache invalidation

UsersPage (/users):
- Table with avatar initials, role badge with icon, department, last login
- Role filter tabs plus search, Admin only access guard
- You badge on current user row

SettingsPage (/settings):
- Profile card: read-only name, email, role, department, employee ID
- Notifications: read-only toggles for email and WhatsApp
- Change password: current and new password with show/hide, validation
- Session card with last login time and Sign Out button

New services: userService, clientService, siteService
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
