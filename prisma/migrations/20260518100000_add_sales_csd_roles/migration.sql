-- AlterEnum: Add SALES_HOD, SALES_TEAM, CSD_TEAM to UserRole
-- These values are added individually — PostgreSQL requires separate ADD VALUE statements

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SALES_HOD';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SALES_TEAM';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CSD_TEAM';
