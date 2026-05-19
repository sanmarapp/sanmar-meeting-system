/*
  Warnings:

  - The values [internal,external] on the enum `MeetingType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MeetingType_new" AS ENUM ('INTERNAL', 'CLIENT', 'BOARD', 'TRAINING', 'OTHER');
ALTER TABLE "bookings" ALTER COLUMN "meeting_type" TYPE "MeetingType_new" USING ("meeting_type"::text::"MeetingType_new");
ALTER TYPE "MeetingType" RENAME TO "MeetingType_old";
ALTER TYPE "MeetingType_new" RENAME TO "MeetingType";
DROP TYPE "MeetingType_old";
COMMIT;

-- AlterTable
ALTER TABLE "fair_leads" ALTER COLUMN "interested_projects" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "fairs" ALTER COLUMN "updated_at" DROP DEFAULT;
