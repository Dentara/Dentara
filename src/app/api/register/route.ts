import { prisma } from "@/libs/prisma";
import { sendVerificationEmail } from "@/libs/emails";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const formData = await req.formData();

  const fullName = formData.get("fullName")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const role = formData.get("role")?.toString() || "patient";

  const token = randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h

  const files: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (value instanceof File && value.size > 0) {
      const buffer = Buffer.from(await value.arrayBuffer());
      const filePath = path.join(process.cwd(), "public/uploads", value.name);
      await writeFile(filePath, buffer);
      files.push(value.name);
    }
  }

  await prisma.user.create({
    data: {
      fullName,
      email,
      password, // TODO: hash if needed
      role,
      documents: files,
      verificationToken: token,
      tokenExpires: expires,
    },
  });

  await sendVerificationEmail(email, token);

  return NextResponse.json({ message: "User registered and verification email sent." });
}
