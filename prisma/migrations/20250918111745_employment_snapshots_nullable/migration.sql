-- DropForeignKey
ALTER TABLE "DoctorEmploymentHistory" DROP CONSTRAINT "DoctorEmploymentHistory_clinicId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorEmploymentHistory" DROP CONSTRAINT "DoctorEmploymentHistory_doctorId_fkey";

-- AlterTable
ALTER TABLE "DoctorEmploymentHistory" ADD COLUMN     "clinicName" TEXT,
ADD COLUMN     "doctorName" TEXT,
ALTER COLUMN "doctorId" DROP NOT NULL,
ALTER COLUMN "clinicId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "DoctorEmploymentHistory" ADD CONSTRAINT "DoctorEmploymentHistory_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorEmploymentHistory" ADD CONSTRAINT "DoctorEmploymentHistory_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
