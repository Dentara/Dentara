/*
  Warnings:

  - You are about to drop the column `doctor` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `medication` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `refills` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Prescription` table. All the data in the column will be lost.
  - Added the required column `date` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medications` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Prescription" DROP COLUMN "doctor",
DROP COLUMN "dosage",
DROP COLUMN "endDate",
DROP COLUMN "frequency",
DROP COLUMN "medication",
DROP COLUMN "refills",
DROP COLUMN "startDate",
DROP COLUMN "status",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "doctorId" TEXT NOT NULL,
ADD COLUMN     "medications" JSONB NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PrescriptionTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "medications" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrescriptionTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
