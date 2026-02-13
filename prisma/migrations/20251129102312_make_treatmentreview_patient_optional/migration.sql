-- DropForeignKey
ALTER TABLE "public"."TreatmentReview" DROP CONSTRAINT "TreatmentReview_patientId_fkey";

-- AlterTable
ALTER TABLE "TreatmentReview" ALTER COLUMN "patientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TreatmentReview" ADD CONSTRAINT "TreatmentReview_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
