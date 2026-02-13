// app/api/auth/[...nextauth]/route.ts
export const runtime = "nodejs";

import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import * as bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        accountType: { label: "Account Type", type: "text" }, // "clinic" | "doctor" | "patient"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const emailLower = credentials.email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
          where: { email: emailLower },
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            emailVerified: true,
          },
        });

        if (!user) throw new Error("Invalid credentials");

        const requestedRole = (credentials.accountType || "").toLowerCase();
        if (requestedRole && user.role !== requestedRole) {
          throw new Error("Wrong account type");
        }

        if (!user.emailVerified) {
          throw new Error("verify_required");
        }

        const ok = await bcrypt.compare(credentials.password || "", user.password || "");
        if (!ok) throw new Error("Invalid credentials");

        return {
          id: user.id,
          name: user.name || undefined,
          email: user.email || undefined,
          role: user.role,
        } as any;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string | undefined;
        (session.user as any).role = token.role as string | undefined;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        const cb = target.searchParams.get("callbackUrl");
        if (cb) return new URL(cb, baseUrl).toString();
        return new URL("/redirect", baseUrl).toString();
      } catch {
        return new URL("/redirect", baseUrl).toString();
      }
    },
  },
};

// NextAuth handler-ı
const nextAuthHandler = NextAuth(authOptions);

/**
 * GET → eyni qalır (signIn səhifəsi və s.)
 */
export const GET = nextAuthHandler;

/**
 * POST → burda login üçün rate-limit tətbiq edirik.
 * IP başına 5 dəqiqədə max 20 cəhd.
 */
export async function POST(req: Request, ctx: any) {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown";

  const rl = checkRateLimit({
    key: `signin:${ip}`,
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });

  if (!rl.allowed) {
    return new Response(
      JSON.stringify({
        error:
          "Too many login attempts from this device. Please wait a few minutes and try again.",
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return nextAuthHandler(req, ctx);
}
