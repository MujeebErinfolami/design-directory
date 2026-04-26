import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import type { AccountType } from "@prisma/client";

// Auth.js v5 reads AUTH_URL (not NEXTAUTH_URL). On Vercel, derive it from
// VERCEL_PROJECT_PRODUCTION_URL when AUTH_URL is not explicitly set.
if (process.env.VERCEL && !process.env.AUTH_URL) {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) process.env.AUTH_URL = `https://${prod}`;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: string | null;
      accountType: AccountType | null;
      isAdmin: boolean;
      subscriptionTier: string;
    };
  }
  interface User {
    accountType?: AccountType | null;
    isAdmin?: boolean;
    subscriptionTier?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  callbacks: {
    // Keep the edge-safe authorized check from authConfig
    authorized: authConfig.callbacks!.authorized,

    async jwt({ token, user, trigger }) {
      // Run on sign-in (user defined) or explicit session update (trigger="update")
      if (user || trigger === "update") {
        const uid = (user?.id ?? token.sub) as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: uid },
          select: {
            accountType: true,
            isAdmin: true,
            subscriptionTier: true,
            designerProfile: { select: { avatarUrl: true } },
            agencyProfile: { select: { logoUrl: true } },
          },
        });
        if (dbUser) {
          token.accountType = dbUser.accountType ?? null;
          token.isAdmin = dbUser.isAdmin ?? false;
          token.subscriptionTier = dbUser.subscriptionTier ?? "free";
          token.avatarUrl =
            dbUser.designerProfile?.avatarUrl ??
            dbUser.agencyProfile?.logoUrl ??
            null;
        }
      }
      return token;
    },

    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.accountType = (token.accountType as AccountType) ?? null;
      session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      session.user.subscriptionTier = (token.subscriptionTier as string) ?? "free";
      // Prefer uploaded profile photo over Google OAuth image
      if (token.avatarUrl) session.user.image = token.avatarUrl as string;
      return session;
    },
  },
});
