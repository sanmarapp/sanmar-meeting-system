Set-Location "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"

Write-Host "Adding railway.json with seed command..." -ForegroundColor Cyan
git add railway.json

Write-Host "Committing..." -ForegroundColor Cyan
git commit -m "chore: temp add db seed to Railway start command"

Write-Host "Pushing..." -ForegroundColor Cyan
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Push successful - Railway will now deploy and run the seed." -ForegroundColor Green
    Write-Host "Monitor deploy at: https://railway.app/project/4b0ed6c0-6cd3-48e7-9aa0-c52276d240d3" -ForegroundColor Cyan
} else {
    Write-Host "Push failed. Check output above." -ForegroundColor Red
}
