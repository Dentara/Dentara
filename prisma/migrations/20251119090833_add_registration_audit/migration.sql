-- CreateTable
CREATE TABLE "RegistrationAudit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "meta" JSONB,

    CONSTRAINT "RegistrationAudit_pkey" PRIMARY KEY ("id")
);
