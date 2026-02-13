-- CreateTable
CREATE TABLE "SecurityEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "email" TEXT,
    "targetUserId" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,

    CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);
