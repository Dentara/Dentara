-- CreateTable
CREATE TABLE "DoctorPrivatePatient" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorPrivatePatient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DoctorPrivatePatient_doctorId_idx" ON "DoctorPrivatePatient"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorPrivatePatient_patientId_idx" ON "DoctorPrivatePatient"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorPrivatePatient_doctorId_patientId_key" ON "DoctorPrivatePatient"("doctorId", "patientId");

-- AddForeignKey
ALTER TABLE "DoctorPrivatePatient" ADD CONSTRAINT "DoctorPrivatePatient_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorPrivatePatient" ADD CONSTRAINT "DoctorPrivatePatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
