import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import type { AccountType } from "@prisma/client";

// Auth.js v5 reads AUTH_URL (not NEXTAUTH_URL). On Vercel, bootstrap it from
// VERCEL_PROJECT_PRODUCTION_URL so the OAuth callback URI is always correct,
// even if NEXTAUTH_URL was previously set in the Vercel dashboard.
if (process.env.VERCEL && !process.env.AUTH_URL) {
  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL; // e.g. "design-directory.vercel.app"
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
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account }) {
      const base = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "(auto-detected)";
      console.log(`[auth] signIn provider=${account?.provider} AUTH_URL=${base} callback=${base}/api/auth/callback/${account?.provider}`);
      return true;
    },
    async jwt({ token, user, trigger }) {
      // On sign-in, load platform fields from DB
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { accountType: true, isAdmin: true, subscriptionTier: true },
        });
        token.accountType = dbUser?.accountType ?? null;
        token.isAdmin = dbUser?.isAdmin ?? false;
        token.subscriptionTier = dbUser?.subscriptionTier ?? "free";
      }
      // After onboarding or profile update, refresh fields from DB
      if (trigger === "update" || user) {
        const uid = (user?.id ?? token.sub) as string;
        const dbUser = await prisma.user.findUnique({
          where: { id: uid },
          select: {
            accountType: true, isAdmin: true, subscriptionTier: true,
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
