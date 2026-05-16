@echo off
cd /d "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"
echo === Git Status ===
git status
echo.
echo === Staging brand-system files ===
git add packages/brand-system/
echo.
echo === Committing ===
git commit -m "feat: add Sanmar brand system (colors, typography, components)"
echo.
echo === Pushing to origin main ===
git push origin main
echo.
echo === Done. Commit hash: ===
git rev-parse HEAD
echo.
pause
