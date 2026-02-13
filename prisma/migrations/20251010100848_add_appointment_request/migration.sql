-- CreateEnum
CREATE TYPE "AppointmentRequestStatus" AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

-- CreateEnum
CREATE TYPE "AppointmentRequestTargetType" AS ENUM ('clinic', 'doctor');

-- CreateTable
CREATE TABLE "AppointmentRequest" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "targetType" "AppointmentRequestTargetType" NOT NULL,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "targetDoctorEmail" TEXT,
    "targetDoctorName" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "endTime" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "status" "AppointmentRequestStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AppointmentRequest_patientId_idx" ON "AppointmentRequest"("patientId");

-- CreateIndex
CREATE INDEX "AppointmentRequest_clinicId_idx" ON "AppointmentRequest"("clinicId");

-- CreateIndex
CREATE INDEX "AppointmentRequest_doctorId_idx" ON "AppointmentRequest"("doctorId");

-- CreateIndex
CREATE INDEX "AppointmentRequest_status_idx" ON "AppointmentRequest"("status");

-- AddForeignKey
ALTER TABLE "AppointmentRequest" ADD CONSTRAINT "AppointmentRequest_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentRequest" ADD CONSTRAINT "AppointmentRequest_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentRequest" ADD CONSTRAINT "AppointmentRequest_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
