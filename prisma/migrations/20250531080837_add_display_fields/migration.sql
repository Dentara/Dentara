-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "condition" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "doctor" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "image" TEXT DEFAULT '',
ADD COLUMN     "lastVisit" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Active';
