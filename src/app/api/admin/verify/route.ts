import { NextResponse } from "next/server";
import { prisma } from "@/libs/prisma";

export async function POST(req: Request) {
  const { id, status } = await req.json();

  if (!id || !["verified", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { status },
    });

    r