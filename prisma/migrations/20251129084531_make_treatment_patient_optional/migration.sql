-- DropForeignKey
ALTER TABLE "public"."TreatmentEntry" DROP CONSTRAINT "TreatmentEntry_patientId_fkey";

-- AlterTable
ALTER TABLE "TreatmentEntry" ALTER COLUMN "patientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TreatmentEntry" ADD CONSTRAINT "TreatmentEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
