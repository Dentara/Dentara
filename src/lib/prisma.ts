// src/lib/prisma.ts  (və ya /lib/prisma.ts – layihə strukturuna uyğun)
// Node runtime üçündür (Edge istifadə etmirik)

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prismaClient =
  global.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.__prisma = prismaClient;

// ✅ Həm named, həm default export veririk
export const prisma = prismaClient;
export default prismaClient;
