-- AlterTable
ALTER TABLE "_DoctorSpecialization" ADD CONSTRAINT "_DoctorSpecialization_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_DoctorSpecialization_AB_unique";
