/*
  Warnings:

  - A unique constraint covering the columns `[vitalSignId]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "vitalSignId" TEXT;

-- CreateTable
CREATE TABLE "ClinicVitalSign" (
    "id" TEXT NOT NULL,
    "bloodPressure" TEXT,
    "heartRate" TEXT,
    "temperature" TEXT,
    "respiratoryRate" TEXT,
    "oxygenSaturation" TEXT,
    "height" TEXT,
    "weight" TEXT,

    CONSTRAINT "ClinicVitalSign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_vitalSignId_key" ON "Appointment"("vitalSignId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_vitalSignId_fkey" FOREIGN KEY ("vitalSignId") REFERENCES "ClinicVitalSign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
