-- AlterTable
ALTER TABLE "ClinicUser" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
