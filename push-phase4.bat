@echo off
cd /d "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"
echo.
echo === Phase 4: Property Fair System ===
echo.

git add -A
git commit -m "Phase 4: Property Fair System

- Fix SystemConfig double-prefix bug (/api/api -> /api/system-config)
- Add Fair, FairVisitor, FairLead Prisma models + enums
- Migration: 20260518000000_add_property_fair_system
- Add FairsModule (NestJS service + controller) with full CRUD
  - Create/list/update/delete fairs
  - Register visitors + check-in
  - Capture and manage leads (interest level, status, follow-up)
  - Fair summary stats endpoint
- Frontend FairsPage with:
  - Card grid view with status badges and progress bars
  - Create Fair modal
  - Fair detail view: summary stats + visitors + leads tabs
  - Register Visitor modal (walk-in/pre-reg/invited, source tracking)
  - Capture Lead modal (project selection, budget, interest level, follow-up)
  - Inline lead status update via dropdown
  - Check-in action per visitor
- Add /fairs route in App.tsx
- Add 'Property Fairs' nav item in Sidebar (Store icon)
- Fix duplicate toggleActive in userService.ts"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Done. Watch Railway for deployment.
pause
