import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Lightweight config — no Prisma adapter, safe for Edge/proxy.ts
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request }) {
      return true; // Actual route protection is done in proxy.ts
    },
    session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.accountType = (token as any).accountType ?? null;
        session.user.isAdmin = (token as any).isAdmin ?? false;
        session.user.subscriptionTier = (token as any).subscriptionTier ?? "free";
      }
      return session;
    },
    jwt({ token, user }) {
      if (user) {
        token.accountType = (user as any).accountType ?? null;
        token.isAdmin = (user as any).isAdmin ?? false;
        token.subscriptionTier = (user as any).subscriptionTier ?? "free";
      }
      return token;
    },
  },
};
