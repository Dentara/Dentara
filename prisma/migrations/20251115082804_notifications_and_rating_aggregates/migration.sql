-- AlterTable
ALTER TABLE "Clinic" ADD COLUMN     "ratingAvg" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Doctor" ADD COLUMN     "ratingAvg" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "userId" TEXT,
    "doctorId" TEXT,
    "clinicId" TEXT,
    "treatmentId" TEXT,
    "reviewId" TEXT,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_scope_doctorId_idx" ON "Notification"("scope", "doctorId");

-- CreateIndex
CREATE INDEX "Notification_scope_clinicId_idx" ON "Notification"("scope", "clinicId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
