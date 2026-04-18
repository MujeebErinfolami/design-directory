import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
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
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.accountType = (user as any).accountType ?? null;
      session.user.isAdmin = (user as any).isAdmin ?? false;
      session.user.subscriptionTier = (user as any).subscriptionTier ?? "free";
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
