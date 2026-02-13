-- CreateTable
CREATE TABLE "TreatmentReview" (
    "id" TEXT NOT NULL,
    "treatmentId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TreatmentReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TreatmentReview_treatmentId_idx" ON "TreatmentReview"("treatmentId");

-- CreateIndex
CREATE INDEX "TreatmentReview_patientUserId_idx" ON "TreatmentReview"("patientUserId");

-- CreateIndex
CREATE UNIQUE INDEX "TreatmentReview_treatmentId_patientUserId_key" ON "TreatmentReview"("treatmentId", "patientUserId");

-- AddForeignKey
ALTER TABLE "TreatmentReview" ADD CONSTRAINT "TreatmentReview_treatmentId_fkey" FOREIGN KEY ("treatmentId") REFERENCES "TreatmentEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreatmentReview" ADD CONSTRAINT "TreatmentReview_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
