Set-Location "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"

Write-Host "Reverting seed command from railway.json..." -ForegroundColor Cyan
git add railway.json

git commit -m "chore: revert temp db seed from Railway start command"

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "Revert pushed. Railway will redeploy without seed command." -ForegroundColor Green
} else {
    Write-Host "Push failed. Check output above." -ForegroundColor Red
}
