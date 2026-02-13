/*
  Warnings:

  - The values [HYGIENIST,admin,manager,receptionist] on the enum `StaffRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `condition` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `doctor` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Diagnosis` table. All the data in the column will be lost.
  - You are about to drop the column `administrator` on the `Immunization` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Immunization` table. All the data in the column will be lost.
  - You are about to drop the column `vaccine` on the `Immunization` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `orderedBy` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `LabResult` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `doctor` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `procedure` on the `Procedure` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `doctor` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Visit` table. All the data in the column will be lost.
  - You are about to drop the `LabResultItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clinicId,email]` on the table `Doctor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StaffRole_new" AS ENUM ('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTION', 'ASSISTANT');
ALTER TABLE "ClinicDoctor" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "ClinicDoctor" ALTER COLUMN "role" TYPE "StaffRole_new" USING ("role"::text::"StaffRole_new");
ALTER TYPE "StaffRole" RENAME TO "StaffRole_old";
ALTER TYPE "StaffRole_new" RENAME TO "StaffRole";
DROP TYPE "StaffRole_old";
ALTER TABLE "ClinicDoctor" ALTER COLUMN "role" SET DEFAULT 'DOCTOR';
COMMIT;

-- DropForeignKey
ALTER TABLE "Diagnosis" DROP CONSTRAINT "Diagnosis_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Immunization" DROP CONSTRAINT "Immunization_patientId_fkey";

-- DropForeignKey
ALTER TABLE "LabResult" DROP CONSTRAINT "LabResult_patientId_fkey";

-- DropForeignKey
ALTER TABLE "LabResultItem" DROP CONSTRAINT "LabResultItem_labResultId_fkey";

-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Procedure_patientId_fkey";

-- DropForeignKey
ALTER TABLE "Visit" DROP CONSTRAINT "Visit_patientId_fkey";

-- DropIndex
DROP INDEX "Doctor_email_key";

-- AlterTable
ALTER TABLE "Diagnosis" DROP COLUMN "condition",
DROP COLUMN "date",
DROP COLUMN "doctor",
DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "clinicId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "title" TEXT,
ALTER COLUMN "patientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Doctor" ALTER COLUMN "email" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Immunization" DROP COLUMN "administrator",
DROP COLUMN "location",
DROP COLUMN "vaccine",
ADD COLUMN     "clinicId" TEXT,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "patientId" DROP NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LabResult" DROP COLUMN "date",
DROP COLUMN "orderedBy",
DROP COLUMN "status",
ADD COLUMN     "clinicId" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "notes" TEXT,
ALTER COLUMN "patientId" DROP NOT NULL,
ALTER COLUMN "type" DROP NOT NULL,
ALTER COLUMN "type" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Procedure" DROP COLUMN "date",
DROP COLUMN "doctor",
DROP COLUMN "location",
DROP COLUMN "procedure",
ADD COLUMN     "clinicId" TEXT,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "performedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price" DOUBLE PRECISION,
ADD COLUMN     "toothNumber" TEXT,
ALTER COLUMN "patientId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Visit" DROP COLUMN "department",
DROP COLUMN "doctor",
DROP COLUMN "type",
ADD COLUMN     "clinicId" TEXT,
ADD COLUMN     "doctorId" TEXT,
ADD COLUMN     "purpose" TEXT,
ALTER COLUMN "patientId" DROP NOT NULL,
ALTER COLUMN "date" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "LabResultItem";

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_clinicId_email_key" ON "Doctor"("clinicId", "email");

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabResult" ADD CONSTRAINT "LabResult_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
