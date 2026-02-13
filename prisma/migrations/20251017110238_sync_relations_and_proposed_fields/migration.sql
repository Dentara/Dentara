-- AlterEnum
ALTER TYPE "AppointmentRequestStatus" ADD VALUE 'proposed';

-- AlterTable
ALTER TABLE "AppointmentRequest" ADD COLUMN     "proposedDate" TIMESTAMP(3),
ADD COLUMN     "proposedEndTime" TEXT,
ADD COLUMN     "proposedTime" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PatientAlbum" ADD COLUMN     "patientId" TEXT;

-- AlterTable
ALTER TABLE "PatientFile" ADD COLUMN     "patientId" TEXT;

-- CreateTable
CREATE TABLE "PatientNotification" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientNotification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientNotification_patientId_isRead_idx" ON "PatientNotification"("patientId", "isRead");

-- CreateIndex
CREATE INDEX "PatientAlbum_patientId_idx" ON "PatientAlbum"("patientId");

-- CreateIndex
CREATE INDEX "PatientFile_patientId_idx" ON "PatientFile"("patientId");

-- AddForeignKey
ALTER TABLE "PatientFile" ADD CONSTRAINT "PatientFile_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAlbum" ADD CONSTRAINT "PatientAlbum_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientNotification" ADD CONSTRAINT "PatientNotification_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
