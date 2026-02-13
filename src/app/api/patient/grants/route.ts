// app/api/patient/grants/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * NOTE:
 * Köhnə implementasiyada schema-da olmayan sütunlar (məs. granteeEmail) `select`-ə salındığı üçün
 * Prisma 500 qaytarırdı. Bu versiyada:
 *  - session.user.email -> User.id (patientUserId) tapılır,
 *  - findMany() üzərində xüsusi select istifadə edilmir (schema ilə avtomatik uyğun gəlir),
 *  - cavab olduğu kimi (JSON) qaytarılır.
 */

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // User.id tap
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) {
    return new NextResponse("User not found", { status: 404 });
  }

  // Schema-safe: select İSTİFADƏ ETMİRİK
  const grants = await prisma.patientDataGrant.findMany({
    where: { patientUserId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ grants });
}
