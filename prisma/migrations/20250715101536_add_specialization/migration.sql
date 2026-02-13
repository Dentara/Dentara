-- CreateTable
CREATE TABLE "Specialization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "department" TEXT,
    "status" TEXT,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DoctorSpecialization" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_name_key" ON "Specialization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_DoctorSpecialization_AB_unique" ON "_DoctorSpecialization"("A", "B");

-- CreateIndex
CREATE INDEX "_DoctorSpecialization_B_index" ON "_DoctorSpecialization"("B");

-- AddForeignKey
ALTER TABLE "_DoctorSpecialization" ADD CONSTRAINT "_DoctorSpecialization_A_fkey" FOREIGN KEY ("A") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorSpecialization" ADD CONSTRAINT "_DoctorSpecialization_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
