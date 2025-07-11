/*
  Warnings:

  - You are about to drop the column `avatar` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `specialty` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "avatar",
DROP COLUMN "bio",
DROP COLUMN "image",
DROP COLUMN "specialty",
ADD COLUMN     "accessBilling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accessPatients" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accessPrescriptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "accessReports" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "certifications" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "dob" TIMESTAMP(3),
ADD COLUMN     "education" TEXT,
ADD COLUMN     "emailAccount" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "licenseExpiryDate" TIMESTAMP(3),
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "notifyAppointments" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyPatients" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySystem" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "password" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "qualifications" TEXT,
ADD COLUMN     "secondarySpecialization" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "zip" TEXT,
ALTER COLUMN "status" SET DEFAULT 'Active',
ALTER COLUMN "department" DROP DEFAULT,
ALTER COLUMN "specialization" DROP DEFAULT;
