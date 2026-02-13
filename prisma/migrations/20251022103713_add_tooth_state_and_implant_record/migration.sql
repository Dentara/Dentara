-- CreateEnum
CREATE TYPE "ToothState" AS ENUM ('NORMAL', 'RESTORED', 'RCT', 'CROWNED', 'EXTRACTED', 'IMPLANTED', 'MISSING', 'OTHER');

-- AlterTable
ALTER TABLE "TreatmentTooth" ADD COLUMN     "stateAfter" "ToothState";

-- CreateTable
CREATE TABLE "ImplantRecord" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "treatmentToothId" TEXT,
    "numberFDI" INTEGER NOT NULL,
    "system" TEXT,
    "size" TEXT,
    "lot" TEXT,
    "manufacturer" TEXT,
    "notes" TEXT,
    "placedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImplantRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImplantRecord_entryId_idx" ON "ImplantRecord"("entryId");

-- CreateIndex
CREATE INDEX "ImplantRecord_treatmentToothId_idx" ON "ImplantRecord"("treatmentToothId");

-- CreateIndex
CREATE INDEX "ImplantRecord_numberFDI_idx" ON "ImplantRecord"("numberFDI");

-- AddForeignKey
ALTER TABLE "ImplantRecord" ADD CONSTRAINT "ImplantRecord_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "TreatmentEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImplantRecord" ADD CONSTRAINT "ImplantRecord_treatmentToothId_fkey" FOREIGN KEY ("treatmentToothId") REFERENCES "TreatmentTooth"("id") ON DELETE SET NULL ON UPDATE CASCADE;
