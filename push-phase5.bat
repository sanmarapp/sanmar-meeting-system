@echo off
cd /d "D:\AIWorkspace\projects\sanmar-meeting-system\sanmar-meeting-system"
echo.
echo === Phase 5: Super Admin Controls ===
echo.

git add -A
git commit -m "Phase 5: Super Admin Controls

Backend:
- AuditService: add paginated list() with filters (userId, entity, action, dateRange)
- AuditService: add getEntityTypes() and getActionTypes() for filter dropdowns
- AuditController: new GET /audit-logs endpoint (Admin/Super Admin only)
- AuditModule: register controller
- SystemConfigService: add segment keys (seg_bookings, seg_external_books,
  seg_site_visits, seg_fairs) and approval routing keys
  (appr_board_required, appr_duration_mins, appr_external_required)
- SystemConfigService: add getSegments() and getApprovalConfig() helpers
- SystemConfigController: add GET /system-config/segments and /approval-config
- BookingsService: inject SystemConfigService, add segment guard on create()
  (throws 403 if bookings or external_bookings segment is disabled)
- BookingsModule: import SystemConfigModule

Frontend:
- auditService.ts: typed client for audit logs + segment/approval config
- AuditLogPage: filterable table (entity, action, date range, search),
  expandable rows with JSON diff viewer, pagination
- SettingsPage: add SegmentPanel and ApprovalRoutingPanel (Super Admin / Admin only)
  - Segment toggles: Bookings, External Bookings, Site Visits, Fairs
  - Approval routing: board room required, external required, duration threshold
- App.tsx: add /audit-logs route
- Sidebar.tsx: add Audit Log nav item under Manage section"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Done. Watch Railway for deployment.
pause
