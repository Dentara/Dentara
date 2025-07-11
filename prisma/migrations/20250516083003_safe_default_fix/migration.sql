-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "endTime" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "time" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "ClinicPatient" ADD COLUMN     "image" TEXT DEFAULT '';

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "image" TEXT DEFAULT '';
