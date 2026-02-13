-- CreateTable
CREATE TABLE "ClinicReview" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClinicReview_clinicId_idx" ON "ClinicReview"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicReview_clinicId_patientUserId_key" ON "ClinicReview"("clinicId", "patientUserId");

-- AddForeignKey
ALTER TABLE "ClinicReview" ADD CONSTRAINT "ClinicReview_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
