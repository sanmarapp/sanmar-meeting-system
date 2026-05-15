# Architecture & Technical Decisions

## Decision Log

### 001 — Monorepo Structure
**Date**: 2026-05-16
**Decision**: npm workspaces monorepo (`apps/backend`, `apps/frontend`, `packages/brand-system`)
**Reason**: Single repo makes it easier to share types, brand system, and deploy together. No need for Turborepo/Nx complexity at this stage.
**Trade-off**: npm workspaces hoisting can cause version conflicts — mitigated by keeping package.json scoped.

---

### 002 — NestJS for Backend
**Date**: 2026-05-16
**Decision**: NestJS + TypeScript + Prisma
**Reason**: Structured, enterprise-grade framework. Decorator-based architecture suits the approval workflow model. Prisma provides type-safe DB access and excellent migration tooling.
**Trade-off**: More boilerplate than Express. Acceptable for a multi-role system with complex business logic.

---

### 003 — React + Vite + Tailwind for Frontend
**Date**: 2026-05-16
**Decision**: React 18 + TypeScript + Vite + Tailwind CSS
**Reason**: Fast dev experience (Vite HMR), utility-first styling for rapid UI, React Query for server state.
**Trade-off**: No SSR (not needed — internal tool with auth).

---

### 004 — PostgreSQL on Railway
**Date**: 2026-05-16
**Decision**: PostgreSQL (Railway hosted) as primary DB, Redis for queue/cache
**Reason**: Railway provides managed PostgreSQL with automatic backups. Redis needed for Bull job queue (notification scheduling).
**Trade-off**: Railway free tier has limits — acceptable for initial rollout.

---

### 005 — WhatsApp via Walinko
**Date**: 2026-05-16
**Decision**: Walinko API for WhatsApp notifications
**Reason**: Officially approved WhatsApp Business API provider. Supports Bangladesh numbers. Simpler than direct Meta API integration.
**Trade-off**: External dependency + API cost. Fallback to email only if Walinko is unavailable.

---

### 006 — Multi-Location Architecture
**Date**: 2026-05-16
**Decision**: Location field (enum) on rooms and projects rather than separate schemas
**Reason**: Only 2 locations (Tower One CTG, Tower Two DHK). Separate schemas would be premature. Enum is type-safe and easily filterable.
**Trade-off**: Adding a 3rd location requires a migration. Acceptable risk.
