-- AlterTable
ALTER TABLE "PatientFile" ADD COLUMN     "albumId" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "sizeBytes" INTEGER,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateTable
CREATE TABLE "PatientAlbum" (
    "id" TEXT NOT NULL,
    "patientUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientAlbum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientAlbum_patientUserId_scope_idx" ON "PatientAlbum"("patientUserId", "scope");

-- CreateIndex
CREATE INDEX "PatientFile_albumId_idx" ON "PatientFile"("albumId");

-- AddForeignKey
ALTER TABLE "PatientFile" ADD CONSTRAINT "PatientFile_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "PatientAlbum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAlbum" ADD CONSTRAINT "PatientAlbum_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
