/*
  Warnings:

  - Added the required column `alcohol` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `altPhone` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingMethod` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chronicConditions` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentMedications` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diet` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exercise` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `familyHistoryNotes` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `groupNumber` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hospitalizations` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insurancePhone` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pastSurgeries` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `policyHolder` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `relationship` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `smoking` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zip` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "alcohol" TEXT NOT NULL,
ADD COLUMN     "altPhone" TEXT NOT NULL,
ADD COLUMN     "billingMethod" TEXT NOT NULL,
ADD COLUMN     "chronicConditions" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "currentMedications" TEXT NOT NULL,
ADD COLUMN     "diet" TEXT NOT NULL,
ADD COLUMN     "exercise" TEXT NOT NULL,
ADD COLUMN     "familyHistoryNotes" TEXT NOT NULL,
ADD COLUMN     "groupNumber" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "hospitalizations" TEXT NOT NULL,
ADD COLUMN     "insurancePhone" TEXT NOT NULL,
ADD COLUMN     "pastSurgeries" TEXT NOT NULL,
ADD COLUMN     "policyHolder" TEXT NOT NULL,
ADD COLUMN     "relationship" TEXT NOT NULL,
ADD COLUMN     "smoking" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "weight" INTEGER NOT NULL,
ADD COLUMN     "zip" TEXT NOT NULL;
