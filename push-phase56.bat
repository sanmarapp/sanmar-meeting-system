@echo off
echo ============================================
echo  Sanmar — Phase 5 + Phase 6 Deploy
echo  Super Admin Controls + Reports + Production
echo ============================================

cd /d "%~dp0"

echo.
echo [1/4] Staging all changes...
git add -A

echo.
echo [2/4] Committing...
git commit -m "feat: Phase 5 + Phase 6 — Super Admin Controls, Reports & Analytics, Production Prep

Phase 5 – Super Admin Controls
- audit/audit.service.ts: add list(), getEntityTypes(), getActionTypes()
- audit/audit.controller.ts: GET /audit-logs (admin-gated, paginated, filterable)
- audit/audit.module.ts: register AuditController
- system-config/system-config.service.ts: 7 new config keys (segments + approval routing)
- system-config/system-config.controller.ts: GET /system-config/segments, approval-config
- bookings/bookings.service.ts: segment guard on booking creation
- bookings/bookings.module.ts: import SystemConfigModule

Phase 6 – Reports & Analytics
- reports/reports.service.ts: bookingReport, siteVisitReport, fairReport, CSV exports
- reports/reports.controller.ts: 6 endpoints (JSON + CSV), role-gated
- reports/reports.module.ts: new module
- app.module.ts: register FairsModule + ReportsModule

Mail – Dynamic SMTP from Admin Panel
- mail/mail.module.ts: remove static MailerModule, inject SystemConfigModule
- mail/mail.service.ts: nodemailer + handlebars, reads SMTP config from DB at send-time
- nest-cli.json: copy .hbs templates to dist/ on build

Frontend
- pages/ReportsPage.tsx: tabbed (Bookings/Site Visits/Fairs), recharts bar+pie, CSV export
- pages/AuditLogPage.tsx: filtered table, expandable JSON diff, pagination
- pages/SettingsPage.tsx: SegmentPanel + ApprovalRoutingPanel
- pages/FairsPage.tsx: fix imports (useAuth from contexts, sonner toast)
- services/api.ts: VITE_API_URL support for Vercel production
- services/reportService.ts: align exportUrl with VITE_API_URL
- components/layout/Sidebar.tsx: Reports + Audit Log nav items
- App.tsx: /reports + /audit-logs + /fairs routes

Production Prep
- main.ts: multi-origin CORS (comma-separated FRONTEND_URL env var)
- apps/frontend/vercel.json: SPA routing rewrites for React Router"

echo.
echo [3/4] Pushing to Railway...
git push origin main

echo.
echo [4/4] Done!
echo Railway will build and deploy automatically.
echo.
echo === NEXT STEPS ===
echo 1. Wait for Railway build to go green
echo 2. Copy your Railway backend URL (e.g. https://xxx.railway.app)
echo 3. Deploy frontend to Vercel (connect GitHub repo, set root to apps/frontend)
echo 4. In Vercel: add env var VITE_API_URL = https://xxx.railway.app
echo 5. In Railway: set FRONTEND_URL = https://your-app.vercel.app
echo 6. Log in as admin, go to Settings and configure SMTP
echo.
pause
