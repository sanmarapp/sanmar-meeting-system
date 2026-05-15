# System Architecture

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Sanmar Meeting System                    │
├──────────────────┬──────────────────────────────────────────┤
│   Frontend       │   Backend                                │
│   React + Vite   │   NestJS + Prisma                        │
│   Port 5173      │   Port 3000                              │
│   Tailwind CSS   │   PostgreSQL + Redis                     │
└──────────────────┴──────────────────────────────────────────┘
```

## Monorepo Structure

```
sanmar-meeting-system/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # React SPA
├── packages/
│   └── brand-system/     # Shared design tokens
├── prisma/               # DB schema & seeds
└── docs/                 # Project documentation
```

## Backend Module Architecture

```
AppModule
├── ConfigModule (global)
├── PrismaModule (global)
├── AuthModule
│   ├── JWT Strategy
│   └── Local Strategy
├── UsersModule
│   ├── CRUD + role management
│   └── Password hashing (bcrypt)
├── MeetingRoomsModule
│   ├── Room availability check
│   └── Conflict detection
├── BookingsModule
│   ├── Meeting room bookings
│   ├── Approval workflow
│   └── Status transitions
├── ProjectsModule
│   └── Site visit management
└── NotificationsModule
    ├── WhatsApp (Walinko)
    └── Email (AWS SES)
```

## Database Schema

```
users
├── id, name, email, phone, password
├── role: SUPER_ADMIN | ADMIN | MANAGER | STAFF | SALES | CSD
└── isActive, createdAt, updatedAt

meeting_rooms
├── id, name, location, capacity
├── amenities: string[]
└── isActive, createdAt, updatedAt

projects
├── id, name, location, address
├── hasMarketingSuite: boolean
└── isActive, createdAt, updatedAt

bookings
├── id, type: MEETING_ROOM | SITE_VISIT
├── status: PENDING | APPROVED | REJECTED | CANCELLED | COMPLETED
├── title, description, startTime, endTime, attendees
├── requestedById → users.id
├── approvedById → users.id (nullable)
├── meetingRoomId → meeting_rooms.id (nullable)
└── projectId → projects.id (nullable)
```

## Booking Workflow

```
Staff creates booking (PENDING)
        │
        ▼
Manager receives notification (WhatsApp + Email)
        │
   ┌────┴────┐
   │         │
APPROVED   REJECTED
   │
   ▼
Staff notified (WhatsApp + Email)
   │
   ▼
Reminder sent 1h before (WhatsApp)
   │
   ▼
COMPLETED (auto after end time)
```

## API Endpoints (planned)

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/users
POST   /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id

GET    /api/v1/meeting-rooms
GET    /api/v1/meeting-rooms/:id/availability

GET    /api/v1/bookings
POST   /api/v1/bookings
GET    /api/v1/bookings/:id
PATCH  /api/v1/bookings/:id/approve
PATCH  /api/v1/bookings/:id/reject
PATCH  /api/v1/bookings/:id/cancel

GET    /api/v1/projects
GET    /api/v1/site-visits
POST   /api/v1/site-visits
```
