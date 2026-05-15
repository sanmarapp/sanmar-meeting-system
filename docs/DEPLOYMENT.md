# Deployment Guide

## Platform: Railway

### Services Required
| Service | Railway Template | Notes |
|---------|-----------------|-------|
| Backend (NestJS) | Node.js | Port 3000 |
| PostgreSQL | PostgreSQL plugin | Auto-provisioned |
| Redis | Redis plugin | For job queue |

---

## First-Time Setup

### 1. Create Railway Project
```bash
# Install Railway CLI (optional)
npm install -g @railway/cli
railway login
railway init
```
Or create via dashboard: https://railway.app/new

### 2. Add Environment Variables
In Railway dashboard → Variables, add all values from `.env.example`:
```
DATABASE_URL        → auto-set by Railway PostgreSQL plugin
REDIS_URL           → auto-set by Railway Redis plugin
JWT_SECRET          → generate: openssl rand -base64 32
JWT_EXPIRATION      → 7d
WALINKO_API_KEY     → from Walinko dashboard
WALINKO_API_URL     → https://app.walinko.com/api
AWS_REGION          → ap-south-1
AWS_ACCESS_KEY_ID   → from AWS IAM
AWS_SECRET_ACCESS_KEY → from AWS IAM
SES_FROM_EMAIL      → noreply@mysanmar.com
NODE_ENV            → production
PORT                → 3000 (Railway sets this automatically)
FRONTEND_URL        → https://your-frontend.railway.app
```

### 3. Deploy
Railway auto-deploys on every push to `main`. The `railway.json` config handles:
- Build: `npm install && npm run build && npx prisma generate`
- Start: `npx prisma migrate deploy && npm run start`

---

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ running locally
- Redis running locally (or use Docker)

### Setup
```bash
# Clone repo
git clone https://github.com/sanmarapp/sanmar-meeting-system.git
cd sanmar-meeting-system

# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env

# Edit .env with your local database credentials

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start development servers
npm run dev
```

### URLs
- Backend API: http://localhost:3000/api/v1
- Swagger docs: http://localhost:3000/api/docs
- Frontend: http://localhost:5173

---

## Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations in production
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```
