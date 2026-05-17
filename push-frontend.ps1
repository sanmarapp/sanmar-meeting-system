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
feat(frontend): NewBookingPage and BookingDetailPage

NewBookingPage (/bookings/new):
- Two-column layout: form sections left, live summary card right
- Sections: Meeting Details, Room and Schedule, Attendees and Setup
- Room picker loads from API with capacity and location info
- Date, start/end time inputs with live duration feedback
- Refreshments checkbox, room arrangement selector, notes textarea
- Client-side validation with inline error messages
- useMutation submit with toast success/error, redirect to detail

BookingDetailPage (/bookings/:id):
- Full meeting detail grid: room, date, time, duration, attendees
- Status timeline: Submitted / Approved / Completed (or Rejected / Cancelled)
- Admin/Manager actions: Approve button, Reject with optional reason form
- Owner actions: Cancel with inline confirmation step
- Approver record card shown after approval or rejection
- Skeleton loading state, not-found fallback
- React Query cache invalidation after each mutation
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
