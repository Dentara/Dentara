/*
  Warnings:

  - A unique constraint covering the columns `[clinicId,userId]` on the table `ClinicDoctor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('CLINIC', 'DOCTOR', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('XRAY', 'PHOTO', 'DOC', 'NOTE', 'LAB', 'OTHER');

-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('READ', 'UPDATE', 'DOWNLOAD', 'CREATE', 'DELETE');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PRIVATE', 'CLINIC', 'DOCTOR', 'GRANTED');

-- AlterTable
ALTER TABLE "ClinicDoctor" ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ClinicPatient" ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "inviteExpiresAt" TIMESTAMP(3),
ADD COLUMN     "inviteToken" TEXT,
ADD COLUMN     "patientGlobalId" TEXT,
ADD COLUMN     "patientUserId" TEXT,
ADD COLUMN     "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "PatientFile" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime" TEXT,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "uploadedByType" "ActorType" NOT NULL DEFAULT 'SYSTEM',
    "uploadedByClinicId" TEXT,
    "uploadedByDoctorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDataGrant" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "granteeType" "ActorType" NOT NULL,
    "granteeClinicId" TEXT,
    "granteeDoctorUserId" TEXT,
    "scopes" JSONB NOT NULL DEFAULT '[]',
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientDataGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "actorId" TEXT,
    "patientUserId" TEXT NOT NULL,
    "resourceType" "ResourceType" NOT NULL,
    "resourceId" TEXT,
    "action" "ActionType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientFile_patientUserId_idx" ON "PatientFile"("patientUserId");

-- CreateIndex
CREATE INDEX "PatientFile_uploadedByClinicId_idx" ON "PatientFile"("uploadedByClinicId");

-- CreateIndex
CREATE INDEX "PatientFile_uploadedByDoctorUserId_idx" ON "PatientFile"("uploadedByDoctorUserId");

-- CreateIndex
CREATE INDEX "PatientDataGrant_patientUserId_idx" ON "PatientDataGrant"("patientUserId");

-- CreateIndex
CREATE INDEX "PatientDataGrant_granteeClinicId_idx" ON "PatientDataGrant"("granteeClinicId");

-- CreateIndex
CREATE INDEX "PatientDataGrant_granteeDoctorUserId_idx" ON "PatientDataGrant"("granteeDoctorUserId");

-- CreateIndex
CREATE INDEX "PatientDataGrant_expiresAt_idx" ON "PatientDataGrant"("expiresAt");

-- CreateIndex
CREATE INDEX "AccessLog_patientUserId_timestamp_idx" ON "AccessLog"("patientUserId", "timestamp");

-- CreateIndex
CREATE INDEX "AccessLog_actorType_actorId_idx" ON "AccessLog"("actorType", "actorId");

-- CreateIndex
CREATE INDEX "Appointment_clinicId_idx" ON "Appointment"("clinicId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "AuditLog_clinicId_idx" ON "AuditLog"("clinicId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_timestamp_idx" ON "AuditLog"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "Billing_clinicId_idx" ON "Billing"("clinicId");

-- CreateIndex
CREATE INDEX "Billing_patientId_idx" ON "Billing"("patientId");

-- CreateIndex
CREATE INDEX "ClinicDoctor_userId_idx" ON "ClinicDoctor"("userId");

-- CreateIndex
CREATE INDEX "ClinicDoctor_clinicId_status_idx" ON "ClinicDoctor"("clinicId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicDoctor_clinicId_userId_key" ON "ClinicDoctor"("clinicId", "userId");

-- CreateIndex
CREATE INDEX "ClinicFile_clinicId_idx" ON "ClinicFile"("clinicId");

-- CreateIndex
CREATE INDEX "ClinicFile_patientId_idx" ON "ClinicFile"("patientId");

-- CreateIndex
CREATE INDEX "ClinicMedicalNote_patientId_idx" ON "ClinicMedicalNote"("patientId");

-- CreateIndex
CREATE INDEX "ClinicMedicalNote_doctorId_idx" ON "ClinicMedicalNote"("doctorId");

-- CreateIndex
CREATE INDEX "ClinicPatient_clinicId_email_idx" ON "ClinicPatient"("clinicId", "email");

-- CreateIndex
CREATE INDEX "ClinicPatient_patientUserId_idx" ON "ClinicPatient"("patientUserId");

-- CreateIndex
CREATE INDEX "ClinicPatient_patientGlobalId_idx" ON "ClinicPatient"("patientGlobalId");

-- CreateIndex
CREATE INDEX "ClinicPatient_clinicId_status_idx" ON "ClinicPatient"("clinicId", "status");

-- CreateIndex
CREATE INDEX "Diagnosis_clinicId_idx" ON "Diagnosis"("clinicId");

-- CreateIndex
CREATE INDEX "Diagnosis_patientId_idx" ON "Diagnosis"("patientId");

-- CreateIndex
CREATE INDEX "Diagnosis_doctorId_idx" ON "Diagnosis"("doctorId");

-- CreateIndex
CREATE INDEX "Immunization_clinicId_idx" ON "Immunization"("clinicId");

-- CreateIndex
CREATE INDEX "Immunization_patientId_idx" ON "Immunization"("patientId");

-- CreateIndex
CREATE INDEX "Immunization_doctorId_idx" ON "Immunization"("doctorId");

-- CreateIndex
CREATE INDEX "LabResult_clinicId_idx" ON "LabResult"("clinicId");

-- CreateIndex
CREATE INDEX "LabResult_patientId_idx" ON "LabResult"("patientId");

-- CreateIndex
CREATE INDEX "LabResult_doctorId_idx" ON "LabResult"("doctorId");

-- CreateIndex
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Procedure_clinicId_idx" ON "Procedure"("clinicId");

-- CreateIndex
CREATE INDEX "Procedure_patientId_idx" ON "Procedure"("patientId");

-- CreateIndex
CREATE INDEX "Procedure_doctorId_idx" ON "Procedure"("doctorId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Visit_clinicId_idx" ON "Visit"("clinicId");

-- CreateIndex
CREATE INDEX "Visit_patientId_idx" ON "Visit"("patientId");

-- CreateIndex
CREATE INDEX "Visit_doctorId_idx" ON "Visit"("doctorId");

-- AddForeignKey
ALTER TABLE "ClinicPatient" ADD CONSTRAINT "ClinicPatient_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicPatient" ADD CONSTRAINT "ClinicPatient_patientGlobalId_fkey" FOREIGN KEY ("patientGlobalId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFile" ADD CONSTRAINT "PatientFile_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDataGrant" ADD CONSTRAINT "PatientDataGrant_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
