/*
  Warnings:

  - You are about to drop the column `IDNumber` on the `Doctor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "IDNumber",
ADD COLUMN     "passportNumber" TEXT;
