-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "IDNumber" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "birthDate" TIMESTAMP(3),
ADD COLUMN     "certificates" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "country" TEXT,
ADD COLUMN     "diplomaAdditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "diplomaFile" TEXT,
ADD COLUMN     "fatherName" TEXT,
ADD COLUMN     "licenseFile" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "primarySpecialization" TEXT,
ADD COLUMN     "workplaces" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "experience" SET DATA TYPE TEXT;
