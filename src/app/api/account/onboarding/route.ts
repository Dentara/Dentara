// app/api/account/onboarding/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

/**
 * GET  /api/account/onboarding
 *  -> { authenticated, hasCompletedOnboarding, role }
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      id: true,
      role: true,
      hasCompletedOnboarding: true,
    },
  });

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    role: user.role,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
  });
}

/**
 * POST /api/account/onboarding
 *  Body: { completed?: boolean }   // default: true
 *  -> { ok: true, hasCompletedOnboarding }
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let completed = true;
  try {
    const body = (await req.json()) as { completed?: boolean };
    if (typeof body?.completed === "boolean") {
      completed = body.completed;
    }
  } catch {
    // body olmaya bilər – default: true
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id as string },
    data: { hasCompletedOnboarding: completed },
    select: { hasCompletedOnboarding: true },
  });

  return NextResponse.json({
    ok: true,
    hasCompletedOnboarding: updated.hasCompletedOnboarding,
  });
}
