-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('NEW_CLIENT', 'EXISTING_CLIENT', 'REFERRAL');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SiteReadyStatus" ADD VALUE 'NOT_READY';
ALTER TYPE "SiteReadyStatus" ADD VALUE 'PARTIAL';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "VisitStatus" ADD VALUE 'RESCHEDULED';
ALTER TYPE "VisitStatus" ADD VALUE 'NO_SHOW';

-- AlterTable
ALTER TABLE "project_sites" ADD COLUMN     "maps_url" TEXT,
ADD COLUMN     "navigation_link" TEXT;

-- AlterTable
ALTER TABLE "site_visits" ADD COLUMN     "assistance_contact" TEXT,
ADD COLUMN     "client_type" "ClientType";
