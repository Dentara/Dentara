-- CreateTable
CREATE TABLE "AccountSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "AccountSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountSession_userId_idx" ON "AccountSession"("userId");
