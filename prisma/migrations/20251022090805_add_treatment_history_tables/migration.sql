-- CreateEnum
CREATE TYPE "TreatmentStatus" AS ENUM ('PLANNED', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TreatmentCategory" AS ENUM ('EXAM', 'PREVENTIVE', 'RESTORATIVE', 'ENDODONTIC', 'PERIODONTIC', 'PROSTHETIC', 'ORTHODONTIC', 'SURGICAL', 'IMPLANT', 'OTHER');

-- CreateTable
CREATE TABLE "TreatmentEntry" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT,
    "doctorId" TEXT,
    "patientId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "TreatmentStatus" NOT NULL DEFAULT 'PLANNED',
    "category" "TreatmentCategory" NOT NULL,
    "procedureCode" TEXT NOT NULL,
    "procedureName" TEXT NOT NULL,
    "notes" TEXT,
    "price" DECIMAL(12,2),
    "surfaces" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentTooth" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "arch" TEXT NOT NULL,
    "quadrant" INTEGER NOT NULL,
    "numberFDI" INTEGER NOT NULL,

    CONSTRAINT "TreatmentTooth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TreatmentAttachment" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "patientFileId" TEXT NOT NULL,

    CONSTRAINT "TreatmentAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TreatmentEntry_clinicId_idx" ON "TreatmentEntry"("clinicId");

-- CreateIndex
CREATE INDEX "TreatmentEntry_doctorId_idx" ON "TreatmentEntry"("doctorId");

-- CreateIndex
CREATE INDEX "TreatmentEntry_patientId_idx" ON "TreatmentEntry"("patientId");

-- CreateIndex
CREATE INDEX "TreatmentEntry_patientUserId_idx" ON "TreatmentEntry"("patientUserId");

-- CreateIndex
CREATE INDEX "TreatmentEntry_date_idx" ON "TreatmentEntry"("date");

-- CreateIndex
CREATE INDEX "TreatmentTooth_entryId_idx" ON "TreatmentTooth"("entryId");

-- CreateIndex
CREATE INDEX "TreatmentTooth_numberFDI_idx" ON "TreatmentTooth"("numberFDI");

-- CreateIndex
CREATE INDEX "TreatmentAttachment_entryId_idx" ON "TreatmentAttachment"("entryId");

-- CreateIndex
CREATE INDEX "TreatmentAttachment_patientFileId_idx" ON "TreatmentAttachment"("patientFileId");

-- AddForeignKey
ALTER TABLE "TreatmentEntry" ADD CONSTRAINT "TreatmentEntry_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEntry" ADD CONSTRAINT "TreatmentEntry_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEntry" ADD CONSTRAINT "TreatmentEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentEntry" ADD CONSTRAINT "TreatmentEntry_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentTooth" ADD CONSTRAINT "TreatmentTooth_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TreatmentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentAttachment" ADD CONSTRAINT "TreatmentAttachment_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TreatmentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentAttachment" ADD CONSTRAINT "TreatmentAttachment_patientFileId_fkey" FOREIGN KEY ("patientFileId") REFERENCES "PatientFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
