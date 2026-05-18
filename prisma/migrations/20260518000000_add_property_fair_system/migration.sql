-- CreateEnum
CREATE TYPE "FairStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationType" AS ENUM ('WALK_IN', 'PRE_REGISTERED', 'INVITED');

-- CreateEnum
CREATE TYPE "LeadInterestLevel" AS ENUM ('HOT', 'WARM', 'COLD');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'SITE_VISIT', 'NEGOTIATING', 'CONVERTED', 'LOST');

-- CreateTable
CREATE TABLE "fairs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "location_id" TEXT,
    "description" TEXT,
    "target_visitors" INTEGER,
    "status" "FairStatus" NOT NULL DEFAULT 'UPCOMING',
    "team_assignments" JSONB NOT NULL DEFAULT '[]',
    "created_by_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fairs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fairs_start_date_idx" ON "fairs"("start_date");

-- CreateIndex
CREATE INDEX "fairs_status_idx" ON "fairs"("status");

-- CreateIndex
CREATE INDEX "fairs_location_id_idx" ON "fairs"("location_id");

-- CreateTable
CREATE TABLE "fair_visitors" (
    "id" TEXT NOT NULL,
    "fair_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "registration_type" "RegistrationType" NOT NULL DEFAULT 'WALK_IN',
    "source" TEXT,
    "checked_in" BOOLEAN NOT NULL DEFAULT false,
    "check_in_time" TIMESTAMP(3),
    "notes" TEXT,
    "registered_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fair_visitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fair_visitors_fair_id_idx" ON "fair_visitors"("fair_id");

-- CreateIndex
CREATE INDEX "fair_visitors_phone_idx" ON "fair_visitors"("phone");

-- CreateTable
CREATE TABLE "fair_leads" (
    "id" TEXT NOT NULL,
    "fair_id" TEXT NOT NULL,
    "visitor_id" TEXT NOT NULL,
    "interested_projects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "budget_range" TEXT,
    "interest_level" "LeadInterestLevel" NOT NULL DEFAULT 'WARM',
    "requires_follow_up" BOOLEAN NOT NULL DEFAULT true,
    "follow_up_date" TIMESTAMP(3),
    "follow_up_notes" TEXT,
    "assigned_to_id" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "captured_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fair_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fair_leads_fair_id_idx" ON "fair_leads"("fair_id");

-- CreateIndex
CREATE INDEX "fair_leads_visitor_id_idx" ON "fair_leads"("visitor_id");

-- CreateIndex
CREATE INDEX "fair_leads_interest_level_idx" ON "fair_leads"("interest_level");

-- CreateIndex
CREATE INDEX "fair_leads_status_idx" ON "fair_leads"("status");

-- AddForeignKey
ALTER TABLE "fairs" ADD CONSTRAINT "fairs_location_id_fkey"
    FOREIGN KEY ("location_id") REFERENCES "locations"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fairs" ADD CONSTRAINT "fairs_created_by_id_fkey"
    FOREIGN KEY ("created_by_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fair_visitors" ADD CONSTRAINT "fair_visitors_fair_id_fkey"
    FOREIGN KEY ("fair_id") REFERENCES "fairs"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fair_visitors" ADD CONSTRAINT "fair_visitors_registered_by_id_fkey"
    FOREIGN KEY ("registered_by_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fair_leads" ADD CONSTRAINT "fair_leads_fair_id_fkey"
    FOREIGN KEY ("fair_id") REFERENCES "fairs"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fair_leads" ADD CONSTRAINT "fair_leads_visitor_id_fkey"
    FOREIGN KEY ("visitor_id") REFERENCES "fair_visitors"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fair_leads" ADD CONSTRAINT "fair_leads_assigned_to_id_fkey"
    FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fair_leads" ADD CONSTRAINT "fair_leads_captured_by_id_fkey"
    FOREIGN KEY ("captured_by_id") REFERENCES "users"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
