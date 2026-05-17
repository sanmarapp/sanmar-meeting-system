Set-Location "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"

Write-Host "Installing packages..." -ForegroundColor Cyan
npm install -w apps/frontend
npm install -w apps/backend

if ($LASTEXITCODE -ne 0) {
    Write-Host "npm install failed. Check output above." -ForegroundColor Red
    exit 1
}

Write-Host "Staging all changes..." -ForegroundColor Cyan
git add -A

Write-Host "Committing..." -ForegroundColor Cyan
$msg = @"
feat: site-visit detail, mobile sidebar, WebSocket notifications, room detail

/site-visits/:id (SiteVisitDetailPage):
- Client info with mailto / tel links, site address, date/time, booked by
- Status badge, site-ready badge, 2-step cancel confirmation (owner/admin only)
- Status timeline: Scheduled -> Completed or Cancelled/No Show branch
- Loading skeleton and not-found fallback

Mobile sidebar / responsive drawer (SidebarContext + AppShell + Sidebar):
- SidebarContext with open/close/toggle + body scroll lock
- Sidebar slides in via CSS translate, lg:translate-x-0 always visible on desktop
- Hamburger button in Header (mobile only), overlay backdrop on open
- Auto-close on route change via useLocation

Real-time notifications (WebSocket):
- Backend: NotificationsGateway (socket.io, /notifications namespace)
  JWT auth in handleConnection, emitToUser + emitToRole helpers, ping/pong
- Backend: NotificationsModule exported, wired into AppModule
- Backend: IoAdapter registered in main.ts
- Backend deps: @nestjs/websockets, @nestjs/platform-socket.io, socket.io
- Frontend: NotificationContext with socket.io-client
  Reconnecting socket, notification + notification:role events, Sonner toasts
  Max 50 notifications, markAllRead, clearAll
- Frontend: NotificationProvider added to main.tsx inside AuthProvider
- Header: bell icon with unread count badge, dropdown with type icons + timeAgo
  Outside-click close, mark-all-read button

/rooms/:id (RoomDetailPage):
- Hero card with type accent strip, capacity, location, floor, amenities
- Custom month-grid calendar (no external lib) with past-date guard
- Availability slots panel: checkAvailability API, Book button per slot
- Quick-book CTA bar linking to /bookings/new with pre-filled roomId and date
- RoomsPage: View Details + Book split CTAs on each card

Header: added backHref prop (ArrowLeft button, hides hamburger on detail pages)
App.tsx: added /rooms/:id and /site-visits/:id routes
"@
git commit -m $msg

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Push successful! Railway will auto-deploy." -ForegroundColor Green
    Write-Host "Frontend dev: npm run dev -w apps/frontend" -ForegroundColor Cyan
} else {
    Write-Host "Push failed. Check output above." -ForegroundColor Red
}
