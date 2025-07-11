import { prisma } from "@/app/libs/prismaDB";
import { NextResponse } from "next/server";

export async function GET() {
  const email = "drsiatagizade@gmail.com";

  try {
    const deleted = await prisma.user.delete({
      where: { email },
    });

    return NextResponse.json({
      message: `User with email ${email} successfully deleted.`,
      userId: deleted.id,
    });
  } catch (error) {
    return NextResponse.json({ message: "User not found or already deleted." }, { status: 404 });
  }
}
