-- CreateTable
CREATE TABLE "ClinicMedicalNote" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "doctorId" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "complaint" TEXT,
    "diagnosis" TEXT,
    "prescription" TEXT,
    "plan" TEXT,
    "procedure" TEXT,
    "fileUrl" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClinicMedicalNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClinicMedicalNote" ADD CONSTRAINT "ClinicMedicalNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "ClinicPatient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicMedicalNote" ADD CONSTRAINT "ClinicMedicalNote_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicMedicalNote" ADD CONSTRAINT "ClinicMedicalNote_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
