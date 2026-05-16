-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DEPT_MANAGER', 'EMPLOYEE', 'RECEPTIONIST', 'SITE_ADMIN', 'CORPORATE_ADMIN');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('OFFICE', 'PROJECT_SITE', 'EXTERNAL_VENUE');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('internal', 'external', 'board', 'conference', 'training');

-- CreateEnum
CREATE TYPE "MeetingType" AS ENUM ('internal', 'external');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending_approval', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('not_required', 'pending_hod', 'pending_admin', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "ArrangementStatus" AS ENUM ('not_required', 'pending', 'confirmed', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('COMPLETED', 'ONGOING', 'UPCOMING');

-- CreateEnum
CREATE TYPE "SiteReadyStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'VISIT_IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "VisitStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'CLIENT_NO_SHOW', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "employee_id" TEXT,
    "designation" TEXT,
    "whatsapp_number" TEXT,
    "role" "UserRole" NOT NULL,
    "department_id" TEXT,
    "notify_email" BOOLEAN NOT NULL DEFAULT true,
    "notify_whatsapp" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email_group" TEXT,
    "whatsapp_group_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LocationType" NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "room_name" TEXT NOT NULL,
    "floor" TEXT NOT NULL,
    "description" TEXT,
    "capacity" INTEGER NOT NULL,
    "room_type" "RoomType" NOT NULL,
    "is_board_room" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meeting_type" "MeetingType" NOT NULL,
    "attendees_count" INTEGER NOT NULL DEFAULT 1,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "is_all_day" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "participants" JSONB NOT NULL DEFAULT '[]',
    "requires_approval" BOOLEAN NOT NULL DEFAULT false,
    "approver_id" TEXT,
    "approval_status" "ApprovalStatus" NOT NULL DEFAULT 'not_required',
    "approved_at" TIMESTAMP(3),
    "needs_laptop" BOOLEAN NOT NULL DEFAULT false,
    "needs_tea_coffee" BOOLEAN NOT NULL DEFAULT false,
    "needs_cookies" BOOLEAN NOT NULL DEFAULT false,
    "needs_snacks" BOOLEAN NOT NULL DEFAULT false,
    "needs_lunch" BOOLEAN NOT NULL DEFAULT false,
    "lunch_menu" TEXT,
    "refreshment_combo" TEXT,
    "arrangement_status" "ArrangementStatus" NOT NULL DEFAULT 'not_required',
    "arrangement_notes" TEXT,
    "arrangement_updated_by" TEXT,
    "arrangement_updated_at" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL,
    "notes" TEXT,
    "notifications_sent" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "source" TEXT,
    "interested_projects" TEXT[],
    "budget_range" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL,
    "has_marketing_suite" BOOLEAN NOT NULL DEFAULT false,
    "marketing_suite_capacity" INTEGER,
    "marketing_suite_notes" TEXT,
    "allow_visits" BOOLEAN NOT NULL DEFAULT true,
    "is_visit_ready" BOOLEAN NOT NULL DEFAULT false,
    "site_admin_id" TEXT NOT NULL,
    "project_details" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_visits" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "party_size" INTEGER NOT NULL DEFAULT 1,
    "site_id" TEXT NOT NULL,
    "visit_date" TIMESTAMP(3) NOT NULL,
    "visit_time" TEXT NOT NULL,
    "booked_by_id" TEXT NOT NULL,
    "preparation_checklist" JSONB NOT NULL DEFAULT '{"suite_cleaned":false,"food_arranged":false,"presentation_ready":false,"demo_flat_ready":false}',
    "site_ready_status" "SiteReadyStatus" NOT NULL DEFAULT 'PENDING',
    "special_requirements" TEXT,
    "status" "VisitStatus" NOT NULL,
    "completion_notes" TEXT,
    "notifications_sent" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "conditions" JSONB NOT NULL,
    "approver_role" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "ip_address" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LocationToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_department_id_idx" ON "users"("department_id");

-- CreateIndex
CREATE INDEX "users_employee_id_idx" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "locations_name_key" ON "locations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_room_name_key" ON "rooms"("room_name");

-- CreateIndex
CREATE INDEX "rooms_location_id_idx" ON "rooms"("location_id");

-- CreateIndex
CREATE INDEX "rooms_is_board_room_idx" ON "rooms"("is_board_room");

-- CreateIndex
CREATE INDEX "bookings_room_id_idx" ON "bookings"("room_id");

-- CreateIndex
CREATE INDEX "bookings_created_by_id_idx" ON "bookings"("created_by_id");

-- CreateIndex
CREATE INDEX "bookings_start_time_idx" ON "bookings"("start_time");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_department_id_idx" ON "bookings"("department_id");

-- CreateIndex
CREATE UNIQUE INDEX "clients_phone_key" ON "clients"("phone");

-- CreateIndex
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "project_sites_name_key" ON "project_sites"("name");

-- CreateIndex
CREATE INDEX "project_sites_location_idx" ON "project_sites"("location");

-- CreateIndex
CREATE INDEX "project_sites_status_idx" ON "project_sites"("status");

-- CreateIndex
CREATE INDEX "project_sites_site_admin_id_idx" ON "project_sites"("site_admin_id");

-- CreateIndex
CREATE INDEX "site_visits_site_id_idx" ON "site_visits"("site_id");

-- CreateIndex
CREATE INDEX "site_visits_client_id_idx" ON "site_visits"("client_id");

-- CreateIndex
CREATE INDEX "site_visits_visit_date_idx" ON "site_visits"("visit_date");

-- CreateIndex
CREATE INDEX "site_visits_status_idx" ON "site_visits"("status");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_trigger_key" ON "notification_templates"("trigger");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "_LocationToUser_AB_unique" ON "_LocationToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_LocationToUser_B_index" ON "_LocationToUser"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_sites" ADD CONSTRAINT "project_sites_site_admin_id_fkey" FOREIGN KEY ("site_admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "project_sites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_booked_by_id_fkey" FOREIGN KEY ("booked_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToUser" ADD CONSTRAINT "_LocationToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LocationToUser" ADD CONSTRAINT "_LocationToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
