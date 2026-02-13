-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "reminder24hSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder2hSent" BOOLEAN NOT NULL DEFAULT false;
