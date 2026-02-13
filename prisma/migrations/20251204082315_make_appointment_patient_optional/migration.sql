-- DropForeignKey
ALTER TABLE "public"."Appointment" DROP CONSTRAINT "Appointment_patientId_fkey";

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "patientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
