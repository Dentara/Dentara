-- CreateTable
CREATE TABLE "PublicProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "slug" TEXT,
    "displayName" TEXT,
    "headline" TEXT,
    "avatarUrl" TEXT,
    "coverUrl" TEXT,
    "country" TEXT,
    "city" TEXT,
    "website" TEXT,
    "socialLinks" JSONB,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePrivacySettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "showEmailToClinics" BOOLEAN NOT NULL DEFAULT true,
    "showPhoneToClinics" BOOLEAN NOT NULL DEFAULT true,
    "showCityToClinics" BOOLEAN NOT NULL DEFAULT true,
    "allowClinicProfileAccess" BOOLEAN NOT NULL DEFAULT true,
    "showFullNamePublic" BOOLEAN NOT NULL DEFAULT true,
    "showAvatarPublic" BOOLEAN NOT NULL DEFAULT true,
    "showCityPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfilePrivacySettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicProfile_userId_key" ON "PublicProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PublicProfile_username_key" ON "PublicProfile"("username");

-- CreateIndex
CREATE UNIQUE INDEX "PublicProfile_slug_key" ON "PublicProfile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilePrivacySettings_userId_key" ON "ProfilePrivacySettings"("userId");

-- AddForeignKey
ALTER TABLE "PublicProfile" ADD CONSTRAINT "PublicProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePrivacySettings" ADD CONSTRAINT "ProfilePrivacySettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
