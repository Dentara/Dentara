import { prisma } from "@/app/libs/prismaDB";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const formData = await req.formData();

  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const phone = formData.get("phone") as string;
  const idDocument = formData.get("idDocument") as File;
  const diploma = formData.get("diploma") as File;

  if (!fullName || !email || !password || !idDocument || !diploma) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "doctors");
  await mkdir(uploadsDir, { recursive: true });

  const idDocBuffer = Buffer.from(await idDocument.arrayBuffer());
  const diplomaBuffer = Buffer.from(await diploma.arrayBuffer());

  const idDocName = `id_${Date.now()}_${idDocument.name}`;
  const diplomaName = `diploma_${Date.now()}_${diploma.name}`;

  await writeFile(path.join(uploadsDir, idDocName), idDocBuffer);
  await writeFile(path.join(uploadsDir, diplomaName), diplomaBuffer);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: "doctor",
      status: "pending",
      emailConfirmed: false,
    },
  });

  await prisma.doctorRequest.create({
    data: {
      dentistId: user.id,
      fullName,
      phone,
      message: `ID: ${idDocName}, Diploma: ${diplomaName}`,
      status: "new",
    },
  });

  return NextResponse.json({ success: true });
}
