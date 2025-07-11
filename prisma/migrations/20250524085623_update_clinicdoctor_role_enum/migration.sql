/*
  Warnings:

  - The `role` column on the `ClinicDoctor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('DOCTOR', 'HYGIENIST', 'ASSISTANT', 'NURSE');

-- AlterTable
ALTER TABLE "ClinicDoctor" DROP COLUMN "role",
ADD COLUMN     "role" "StaffRole" NOT NULL DEFAULT 'DOCTOR';
