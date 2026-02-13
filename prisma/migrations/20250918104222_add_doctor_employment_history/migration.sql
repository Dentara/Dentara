-- CreateTable
CREATE TABLE "DoctorEmploymentHistory" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3) NOT NULL,
    "statusAtEnd" TEXT NOT NULL,
    "reason" TEXT,

    CONSTRAINT "DoctorEmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorEmploymentHistory_doctorId_clinicId_idx" ON "DoctorEmploymentHistory"("doctorId", "clinicId");

-- AddForeignKey
ALTER TABLE "DoctorEmploymentHistory" ADD CONSTRAINT "DoctorEmploymentHistory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorEmploymentHistory" ADD CONSTRAINT "DoctorEmploymentHistory_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
