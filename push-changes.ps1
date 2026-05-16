$repoPath = "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"
Set-Location $repoPath

Write-Host "Detecting Windows proxy..." -ForegroundColor Cyan
$proxySettings = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
$proxy = $proxySettings.ProxyServer
if ($proxy) {
    if (-not $proxy.StartsWith("http")) { $proxy = "http://$proxy" }
    git config --global http.proxy $proxy
    Write-Host "Proxy set: $proxy" -ForegroundColor Yellow
} else {
    git config --global --unset http.proxy 2>$null
    Write-Host "No proxy - direct connection" -ForegroundColor Green
}

Write-Host "`nGit status:" -ForegroundColor Cyan
git status --short

Write-Host "`nStaging all changes..." -ForegroundColor Cyan
git add -A

Write-Host "`nCommitting..." -ForegroundColor Cyan
git commit -m "feat: add all NestJS modules and update backend structure

- PrismaModule + PrismaService (global, lifecycle-managed)
- AuthModule: JWT login, change-password, profile, JwtAuthGuard
- UsersModule, BookingsModule, RoomsModule, SiteVisitsModule
- Full Prisma schema: User, Room, Booking, Client, ProjectSite,
  SiteVisit, ApprovalRule, NotificationTemplate, AuditLog
- Brand system: Sanmar golden-bronze #826B52, Playfair Display + DM Sans
- main.ts: CORS, ValidationPipe, /api prefix, PORT from env"

Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nPush successful!" -ForegroundColor Green
    Write-Host "https://github.com/sanmarapp/sanmar-meeting-system" -ForegroundColor Cyan
} else {
    Write-Host "`nRegular push failed - trying force push..." -ForegroundColor Yellow
    git push origin main --force
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nForce push successful!" -ForegroundColor Green
    } else {
        Write-Host "`nPush failed. Check output above." -ForegroundColor Red
    }
}
