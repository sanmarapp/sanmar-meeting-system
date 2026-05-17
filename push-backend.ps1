Set-Location "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"

Write-Host "Staging changes..." -ForegroundColor Cyan
git add -A

Write-Host "Committing..." -ForegroundColor Cyan
$msg = @"
feat(backend): full CRUD — bookings, rooms availability, site-visits, clients, sites

Bookings:
- POST /api/bookings — create with conflict detection, auto requiresApproval for boardrooms
- PATCH /api/bookings/:id/approve — set confirmed + notify requestor
- PATCH /api/bookings/:id/reject — set cancelled+rejected + notify requestor
- PATCH /api/bookings/:id/cancel — cancel booking + notify
- GET /api/bookings — paginated with status/date/search/roomId filters
- Status mapping: schema pending_approval/confirmed -> frontend PENDING/APPROVED/REJECTED/etc
- Field mapping: attendeesCount -> attendeeCount, roomName -> name, roomType -> type

Rooms:
- GET /api/rooms/:id/availability?date=YYYY-MM-DD — hourly slots 08:00-19:00, checks conflicts
- Field transform: roomName->name, roomType->type (uppercased), amenities: []

Site Visits:
- POST /api/site-visits — create with client/site validation, notifies site admin
- PATCH /api/site-visits/:id/cancel — cancel + notify site admin
- GET /api/site-visits — filtered list with status/date/search
- Status mapping: CLIENT_NO_SHOW->NO_SHOW, CONFIRMED->SCHEDULED
- siteReadyStatus mapping: PENDING->NOT_READY, PREPARING->PARTIAL, READY->READY

Clients + Sites (new endpoints):
- GET /api/clients?search= — for NewSiteVisitPage dropdown
- GET /api/sites?search= — project sites for NewSiteVisitPage dropdown

Notifications gateway:
- Fixed payload.userId (was reading payload.sub which didn't exist)
- BookingsModule and SiteVisitsModule now import NotificationsModule
- emitToUser on approve/reject/cancel, emitToRole(ADMIN) on new pending booking
"@
git commit -m $msg

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Push successful! Railway will auto-deploy backend." -ForegroundColor Green
} else {
    Write-Host "Push failed." -ForegroundColor Red
}
