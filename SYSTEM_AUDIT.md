# Sanmar Meeting System — Enterprise Gap Analysis
**Audit Date:** May 18, 2026  
**Analyst:** Senior System Architect Review  
**Scope:** Functional + Architectural comparison: Existing system vs. New Enterprise Requirements  

---

## 1. EXISTING FEATURES MAP

### 1.1 Corporate Office System (Partial)
| Feature | Status | Notes |
|---|---|---|
| Meeting room CRUD | ✅ Implemented | Full room model with type, capacity, floor, boardroom flag |
| Room availability check | ✅ Implemented | Hourly slots 8AM–8PM per date |
| Booking creation | ✅ Implemented | Full form with attendees, refreshments, meeting type |
| Approval workflow | ⚠️ Partial | Only board rooms trigger approval; all others auto-confirm |
| Admin approve/reject | ✅ Implemented | With reason, notification to creator |
| Booking cancel | ✅ Implemented | By owner or admin |
| Conflict detection | ✅ Implemented | Prevents overlapping bookings on same room |
| Multi-location schema | ✅ Implemented | Location model with OFFICE/PROJECT_SITE/EXTERNAL_VENUE types |
| Location-first UI | ❌ Missing | No location selector at login or route level |
| ADMIN role | ✅ Implemented | Full access, approvals |
| DEPT_MANAGER (HoD) role | ⚠️ Incorrect | Currently CAN approve; requirement = NO approval authority |
| RECEPTIONIST (Front Desk) role | ⚠️ Schema only | No dedicated UI for this role |
| CORPORATE_ADMIN role | ⚠️ Schema only | Exists in DB but no distinct permission enforcement |
| EMPLOYEE role | ✅ Implemented | Can create bookings, view own history |
| In-app notifications | ✅ Implemented | WebSocket real-time, role-based delivery |
| Email notifications | ❌ Not wired | Templates in DB; delivery not implemented |
| WhatsApp notifications | ❌ Not wired | Templates in DB; delivery not implemented |
| HoD notification-only mode | ❌ Missing | HoD should receive read-only notifications; not enforced |
| Reminder notifications | ❌ Missing | No scheduled/reminder notification system |
| Refreshment arrangements | ✅ Implemented | Tea/coffee, cookies, snacks, lunch menu in booking form |
| Audit log model | ⚠️ Schema only | AuditLog table exists; nothing writes to it |
| Approval rules engine | ⚠️ Schema only | ApprovalRule model exists; not enforced in endpoints |

### 1.2 Site Visit System (Partial)
| Feature | Status | Notes |
|---|---|---|
| Site visit scheduling | ✅ Implemented | With client, site, date, time, party size |
| Client model | ✅ Implemented | Name, phone, email, source, interested projects, budget |
| ProjectSite model | ✅ Implemented | Name, location, status, marketing suite, checklist config |
| Site admin role | ✅ Implemented | Receives notification for assigned sites |
| Site readiness checklist | ✅ Implemented | JSON: suite_cleaned, food_arranged, presentation_ready, demo_flat_ready |
| Visit status: SCHEDULED | ✅ Implemented | |
| Visit status: COMPLETED | ✅ Implemented | With completedAt timestamp |
| Visit status: CANCELLED | ✅ Implemented | |
| Visit status: CLIENT_NO_SHOW | ✅ Implemented | |
| Visit status: RESCHEDULED | ❌ Missing | Not in status enum |
| New vs Existing client distinction | ❌ Missing | No clientType field; no routing logic |
| Smart routing (Sales vs CSD) | ❌ Missing | All visits treated identically; no team assignment |
| CSD team role | ❌ Missing | No role or module for CSD team |
| Assistance contact number | ❌ Missing | Not a field on visit or site |
| Google Maps link per project | ❌ Missing | No maps URL or navigation fields on ProjectSite |
| Shareable location card | ❌ Missing | |
| Site admin cross-visibility (see corporate schedule) | ❌ Missing | Site admin only sees own site visits |
| Visit notification via WhatsApp | ❌ Missing | Not delivered |
| Visit notification via Email | ❌ Missing | Not delivered |
| Assistance contact in notifications | ❌ Missing | Not included in notification payload |

### 1.3 Property Fair System
| Feature | Status | Notes |
|---|---|---|
| Walk-in registration | ❌ Missing | Entire system not built |
| Source tracking (9 types) | ❌ Missing | Client model has 4 basic sources only |
| Sales Invitation conditional fields | ❌ Missing | |
| HOD-isolated data domains | ❌ Missing | |
| Footfall report (no PII) | ❌ Missing | |
| Attendee report (private) | ❌ Missing | |
| GMC Team role | ❌ Missing | |
| Lifestyle Consultant role | ❌ Missing | |
| Sales HOD role | ❌ Missing | |
| Brand & Marketing HOD role | ❌ Missing | |
| Lead assignment | ❌ Missing | |
| Daily report send button | ❌ Missing | |
| Hourly visitor stats | ❌ Missing | |

### 1.4 Super Admin Control System
| Feature | Status | Notes |
|---|---|---|
| SUPER_ADMIN role | ❌ Missing | No distinction from ADMIN |
| Segment enable/disable | ❌ Missing | Cannot toggle Corporate/SiteVisit/PropertyFair systems |
| Approval routing configuration | ❌ Missing | ApprovalRule model exists but not enforced |
| WhatsApp gateway settings | ❌ Missing | |
| Email recipient management | ❌ Missing | |
| GMC reporting target config | ❌ Missing | |
| User management UI | ⚠️ Read-only | List and view; no create/update endpoints exposed |

### 1.5 Global Infrastructure
| Feature | Status | Notes |
|---|---|---|
| JWT authentication | ✅ Implemented | With mustChangePassword first-login flow |
| WebSocket notification engine | ✅ Implemented | Per-user + per-role delivery |
| NestJS modular architecture | ✅ Implemented | Auth, Users, Rooms, Bookings, SiteVisits, Clients, Sites, Notifications |
| Prisma + PostgreSQL | ✅ Implemented | |
| Redis | ✅ Running | Available in Railway but integration not confirmed |
| Notification templates DB | ✅ Implemented | WHATSAPP/EMAIL channels, per-trigger templates |
| Audit log schema | ✅ Implemented | Model only, not active |

---

## 2. MISSING FEATURES MAP

### CRITICAL MISSING (Blocks new requirements entirely)
1. **Property Fair System** — zero implementation. New module required from scratch: walk-in registration, source tracking, lead assignment, HOD isolation, footfall analytics, daily report
2. **Super Admin role + control center** — no governance layer. Segment control, routing config, gateway settings all absent
3. **Smart routing engine** — Site Visit system has no NEW vs EXISTING client distinction and no Sales/CSD team routing logic
4. **WhatsApp delivery** — templates exist but no gateway integration; all external notifications silently drop
5. **Email delivery** — same as above; NestJS mailer not configured
6. **Location-first design** — users jump directly into system; no location selector enforced at session start
7. **CSD Team** — no role, no module, no notification path

### FUNCTIONAL MISSING
8. **RESCHEDULED visit status** — current enum: SCHEDULED/CONFIRMED/COMPLETED/CANCELLED/CLIENT_NO_SHOW; RESCHEDULED absent
9. **Assistance contact number** on site visits and in notifications
10. **Google Maps URL + Navigation** on ProjectSite model
11. **Shareable location card** generation
12. **Site admin cross-visibility** — Site Admin should see corporate meeting schedule (read-only); currently isolated to own site visits only
13. **HoD notification-only enforcement** — DEPT_MANAGER currently has approve permission; requirement forbids this
14. **ALL bookings require approval** — currently only board rooms trigger the approval flow; requirement is universal
15. **Multi-role HoD support** — single user mapped to multiple HOD roles in different departments; User model has departments as one-to-many but no HOD mapping table
16. **Reminder notification** — no scheduled/cron-based pre-meeting reminders
17. **Reschedule request workflow** — admin receives reschedule request notification (specified in requirements, not implemented)
18. **User create/edit in admin UI** — UsersPage is read-only; admin cannot create or modify users

---

## 3. PARTIAL FEATURES MAP

| Feature | What Exists | What's Missing |
|---|---|---|
| Approval workflow | Board rooms only trigger approval; approve/reject/notify works | Must trigger for ALL bookings; two-tier HoD→Admin chain not enforced despite schema support (pending_hod → pending_admin states exist) |
| Notification engine | WebSocket real-time delivery; per-user and per-role targeting | Email and WhatsApp channels not delivered; reminder/scheduled notifications absent; assistance contact not in payload |
| Role system | 6 roles in schema (ADMIN, DEPT_MANAGER, EMPLOYEE, RECEPTIONIST, SITE_ADMIN, CORPORATE_ADMIN) | Missing: SUPER_ADMIN, CSD_TEAM, LIFESTYLE_CONSULTANT, SALES_HOD, BRAND_MARKETING_HOD, GMC_TEAM; wrong permissions on DEPT_MANAGER |
| Location support | Location model with type enum; rooms and users linked to locations; location name shown in room listings | No location selector in UI; no route-level location filtering; no enforced user-location access scoping |
| Visit completion tracking | completedAt timestamp, completionNotes field, siteReadyStatus lifecycle | No RESCHEDULED status; no UI to mark completion status (only cancel is exposed); site checklist management not exposed to site admin in UI |
| Client source tracking | 4 source options in Client model (Phone Call/Walk-in/Referral/Website) | Needs 9 options per Property Fair spec; conditional "Sales Invitation" fields (person name, team name) absent; source tracking not linked to Property Fair registration flow |
| Audit log | AuditLog model with userId, action, entity, entityId, changes (JSON), ipAddress | Zero writes from any service; effectively non-functional |
| Approval rules engine | ApprovalRule model with conditions (JSON), approverRole, priority | Not read or enforced in any endpoint; booking approval logic is hardcoded in BookingsService |
| Two-tier approval | Schema has pending_hod and pending_admin states | Service only moves to pending_hod and Admin directly resolves; HoD step is bypassed entirely |
| User management | List + view users via API and UI | No create, update, deactivate in API or frontend; toggleActive and updateProfile endpoints exist but unused |

---

## 4. SYSTEM CONFLICTS

### CONFLICT 1 — HoD Permission Contradiction (Production Bug)
**Current behavior:** DEPT_MANAGER role can access ApprovalsPage and call `/bookings/:id/approve`  
**Requirement:** HoD has NO approval authority; receives notifications only  
**Impact:** HoD users can currently approve bookings in production — this is a permission violation  
**Resolution required:** Remove approval access from DEPT_MANAGER; implement notification-only path for this role

### CONFLICT 2 — Approval Scope Mismatch
**Current behavior:** `requiresApproval` flag is set only when `room.isBoardRoom === true || room.roomType === 'board'`  
**Requirement:** ALL bookings in the Corporate Office System require Corporate Admin approval  
**Impact:** All non-board-room bookings are auto-confirmed without review; this breaks the intended governance model  
**Resolution required:** Change approval trigger to apply universally within Corporate system; preserve board-room-specific flag only as priority indicator if needed

### CONFLICT 3 — Client Source Model Collision
**Current state:** `Client.source` is a freetext/enum with 4 values (Phone Call, Walk-in, Referral, Website)  
**Requirement:** Property Fair requires 9 distinct source types with conditional sub-fields (Sales Invitation → person + team name required)  
**Impact:** Extending the existing source field will pollute the Site Visit client model with Property Fair-specific fields  
**Resolution required:** Property Fair must use a separate `FairRegistration` model; do not extend the existing Client model

### CONFLICT 4 — Monolithic Architecture vs. Three-System Isolation Requirement
**Current state:** Single NestJS application with all modules co-located; no system boundary enforcement  
**Requirement:** Three independent systems (Corporate, SiteVisit, PropertyFair) with isolated data and separate governance  
**Impact:** Data leakage risk; no ability to enable/disable individual systems; role permissions span the entire app  
**Resolution required:** At minimum, introduce a system-scope guard (middleware or decorator) per module group; Super Admin segment control requires runtime system toggling; long-term, microservice extraction is advisable for PropertyFair

### CONFLICT 5 — Role Namespace Pollution
**Current state:** EMPLOYEE role is used for all non-admin staff (booking creators, sales reps, CSD staff, future consultants)  
**Requirement:** Lifestyle Consultants, CSD Team, and regular Employees are distinct roles with different permissions and notification paths  
**Impact:** Cannot correctly route site visit notifications or restrict Property Fair access without role granularity  
**Resolution required:** Add SALES_LIFESTYLE_CONSULTANT, CSD_TEAM, SALES_HOD, BRAND_MARKETING_HOD, GMC_TEAM role enum values; migrate existing EMPLOYEE assignments

### CONFLICT 6 — No SUPER_ADMIN Hierarchy
**Current state:** ADMIN is the top role; no distinction between Corporate Admin and platform-level Super Admin  
**Requirement:** Super Admin controls all three systems, assigns HODs, manages GMC, configures gateways — these are platform-level actions above Corporate Admin  
**Impact:** No way to implement segment control, approval routing config, or cross-system user management without SUPER_ADMIN role  
**Resolution required:** Add SUPER_ADMIN role above ADMIN; scope ADMIN to Corporate system only

### CONFLICT 7 — Frontend Role Mapping Mismatch
**Current state:** Frontend `AuthUser.role` type is `'ADMIN' | 'MANAGER' | 'STAFF' | 'VIEWER'` (simplified enum)  
**Actual database roles:** ADMIN, DEPT_MANAGER, EMPLOYEE, RECEPTIONIST, SITE_ADMIN, CORPORATE_ADMIN  
**Impact:** Frontend role checks (e.g., ApprovalsPage guard: `role === 'ADMIN' || role === 'MANAGER'`) may not match backend role strings; new roles will not be handled  
**Resolution required:** Align frontend AuthUser role type with backend enum; update all permission guards

---

## 5. REUSE vs REBUILD RECOMMENDATION

### REUSE (Keep as-is or extend)
| Component | Rationale |
|---|---|
| JWT auth system (login, token, mustChangePassword) | Solid; no conflicts |
| Prisma + PostgreSQL setup | No changes needed to infrastructure |
| WebSocket notification gateway | Working; extend with new payload types |
| Meeting room booking core (bookings module) | Reuse with approval scope fix and role guard fix |
| Room model + availability check | No structural changes needed |
| Site visit core models (SiteVisit, Client, ProjectSite) | Reuse; extend with new fields |
| NestJS module architecture | Keep; add new modules alongside |
| Department model | Reuse |
| AuditLog model | Reuse; wire writes into services |
| NotificationTemplate model | Reuse; wire up delivery channels |
| ApprovalRule model | Reuse; replace hardcoded logic with rule evaluation |

### EXTEND (Modify existing components)
| Component | Changes Required |
|---|---|
| User role enum | Add: SUPER_ADMIN, CSD_TEAM, LIFESTYLE_CONSULTANT, SALES_HOD, BRAND_MARKETING_HOD, GMC_TEAM |
| Booking approval logic | Change trigger from board-room-only to universal; enforce two-tier flow |
| Permission guards | Fix DEPT_MANAGER (remove approve); add SUPER_ADMIN guards |
| SiteVisit status enum | Add RESCHEDULED state |
| ProjectSite model | Add mapsUrl, navigationLink, assistanceContact fields |
| SiteVisit model | Add assistanceContact, clientType (NEW/EXISTING), assignedTeam fields |
| Frontend AuthUser type | Align with backend role enum |
| Notification payload | Add assistanceContact, mapsLink to site visit notifications |
| UsersPage | Add create/edit user functionality |

### REBUILD (Too structurally different to extend)
| Component | Rationale |
|---|---|
| Approval workflow engine | Hardcoded logic must become rule-driven; ApprovalRule model exists but is ignored |
| Client source tracking | Property Fair needs separate FairRegistration model; do not merge into Client |
| Role permission system (frontend) | Simplified ADMIN/MANAGER/STAFF/VIEWER mapping must be replaced with full role enum |

### BUILD NEW (Does not exist at all)
| Component | Notes |
|---|---|
| Property Fair module (backend) | FairRegistration, FairSession, FairReport models + full CRUD |
| Property Fair pages (frontend) | Walk-in registration, lead board, HOD dashboard, footfall analytics |
| Super Admin module | Segment control, user management, routing config, gateway settings |
| Email delivery service | NestJS Mailer + SMTP/SendGrid integration |
| WhatsApp delivery service | API gateway integration (e.g., Twilio, WATI, or custom) |
| HOD isolation middleware | Scopes all PropertyFair queries to requesting HOD's domain |
| Footfall analytics engine | Aggregation queries for hourly stats, source distribution, team counts |
| Daily report generator | Scheduled + on-demand report build + multi-channel dispatch |
| Location-first session flow | Location selector at login/session start; route-level location context |

---

## 6. PRIORITY UPGRADE LIST

### P0 — Fix Before Any New Feature Work (Production Correctness)

| ID | Issue | Action |
|---|---|---|
| P0-1 | DEPT_MANAGER can approve bookings (wrong) | Remove approve/reject permission from DEPT_MANAGER; make read-only + notification-only |
| P0-2 | Only board rooms trigger approval (wrong scope) | Change BookingsService approval trigger to apply to ALL bookings |
| P0-3 | Frontend role type mismatches backend enum | Align AuthUser.role type with DB enum; audit all permission guards |
| P0-4 | AuditLog writes missing | Wire AuditLog writes into all create/update/approve/reject/cancel actions |

### P1 — Core System Completeness (Required for Functional Compliance)

| ID | Feature | Component |
|---|---|---|
| P1-1 | Add SUPER_ADMIN role + segment control | Backend: new role + SystemConfig model; Frontend: Super Admin panel |
| P1-2 | Email delivery | NestJS Mailer integration; wire to NotificationTemplate |
| P1-3 | WhatsApp delivery | Gateway integration; wire to NotificationTemplate |
| P1-4 | Smart routing (NEW vs EXISTING client → Sales vs CSD) | SiteVisit model + BookingsService routing logic + notifications |
| P1-5 | RESCHEDULED visit status + completion marking | Add enum value; expose PATCH endpoint; build UI action |
| P1-6 | Assistance contact on SiteVisit | Model field + notification payload + form field |
| P1-7 | Google Maps + navigation on ProjectSite | Model fields + frontend display |
| P1-8 | User create/edit in admin | New API endpoints + UsersPage form |
| P1-9 | Two-tier approval enforcement (HoD notify → Admin approve) | BookingsService: notify DEPT_MANAGER first, then ADMIN resolves |
| P1-10 | CSD_TEAM role + routing | Add role enum; notification path for CSD visits |

### P2 — New System Modules (Strategic Build)

| ID | Feature | Complexity |
|---|---|---|
| P2-1 | Property Fair — walk-in registration + source tracking | High |
| P2-2 | Property Fair — HOD isolation data scoping | High |
| P2-3 | Property Fair — footfall analytics + report | Medium |
| P2-4 | Property Fair — daily report button + multi-channel dispatch | Medium |
| P2-5 | Location-first UI (session-level location selector) | Medium |
| P2-6 | Site Admin cross-visibility (read-only corporate schedule) | Low |
| P2-7 | Reminder/scheduled notifications (pre-meeting alerts) | Medium |
| P2-8 | Approval rules engine (replace hardcoded logic) | Medium |
| P2-9 | Multi-HOD role mapping per user | Medium |

---

## 7. RISK AREAS

### RISK 1 — PRODUCTION PERMISSION BUG (High / Immediate)
DEPT_MANAGER users can approve bookings right now. This is a live governance violation. Any HoD in production has the power to approve room bookings they should not be able to touch. Must be fixed before any new feature work.

### RISK 2 — NOTIFICATION SILENT FAILURE (High)
All email and WhatsApp notifications are silently discarded. Users and admins who expect external notifications (specified in requirements) are receiving none. This affects site visit confirmations, booking approvals, and all client-facing communications.

### RISK 3 — PROPERTY FAIR DATA ISOLATION (High / Design Risk)
If Property Fair client data is built on top of the existing Client model, HOD isolation becomes architecturally difficult. Cross-HOD leakage could expose private client contacts to unauthorized roles. A separate FairRegistration model must be established before any Property Fair data is written to production.

### RISK 4 — ROLE ENUM MIGRATION (Medium)
Adding new roles (SUPER_ADMIN, SALES_HOD, CSD_TEAM, etc.) requires a Prisma enum migration. Existing user records with old roles are unaffected, but the migration must be carefully staged; a failed migration on Railway will take the backend offline.

### RISK 5 — MONOLITH SCALING (Medium / Architectural)
The three-system requirement implies independent governance and data isolation. Running all three as NestJS modules in a single process creates coupling risk. If Property Fair experiences high load during events (fairs, exhibitions), it will impact Corporate and Site Visit system responsiveness. Recommendation: Plan for module extraction into a separate service for Property Fair as volume grows.

### RISK 6 — AUDIT LOG GAP (Medium / Compliance)
The AuditLog model exists but records nothing. All historical create/approve/reject/cancel actions that have occurred since launch are unrecorded. This is a compliance gap. Wiring AuditLog will capture future actions but the historical gap cannot be recovered.

### RISK 7 — PACKAGE-LOCK DRIFT (Low / DevOps)
The package-lock.json was updated on Railway's build container during the @nestjs/cli fix. The lock file on the local machine may now differ from what Railway builds. Should be resolved by running `npm install` locally and committing the updated lock file.

---

*End of Gap Analysis — sanmar-meeting-system v1 vs Enterprise Requirements*  
*Total items identified: 4 P0 fixes, 10 P1 features, 9 P2 modules, 7 risk areas*
