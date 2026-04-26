import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import type { AccountType } from "@prisma/client";

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
      // After onboarding, refresh accountType from DB
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { accountType: true, isAdmin: true, subscriptionTier: true },
        });
        token.accountType = dbUser?.accountType ?? null;
        token.isAdmin = dbUser?.isAdmin ?? false;
        token.subscriptionTier = dbUser?.subscriptionTier ?? "free";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.accountType = (token.accountType as AccountType) ?? null;
      session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      session.user.subscriptionTier = (token.subscriptionTier as string) ?? "free";
      return session;
    },
  },
});
