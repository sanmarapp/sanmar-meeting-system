@echo off
echo === Fix MeetingType enum + push to Railway ===
cd /d %~dp0

echo.
echo [1/4] Generating Prisma migration...
npx prisma migrate dev --name fix_meeting_type_enum --schema=prisma/schema.prisma

echo.
echo [2/4] Regenerating Prisma client...
npx prisma generate --schema=prisma/schema.prisma

echo.
echo [3/4] Committing fix...
git add -A
git commit -m "fix: expand MeetingType enum to INTERNAL/CLIENT/BOARD/TRAINING/OTHER"

echo.
echo [4/4] Pushing to GitHub (triggers Railway deploy)...
git push origin main

echo.
echo === Done! Railway will redeploy in ~2 minutes ===
pause
