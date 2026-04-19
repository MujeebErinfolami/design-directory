import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// Routes that require a signed-in session
const PROTECTED = ["/dashboard", "/onboarding", "/profile", "/submit", "/submissions", "/api/submit", "/api/profile", "/api/projects"];
const ADMIN_ONLY = ["/admin", "/api/admin"];

// Subset of PROTECTED that also require a completed profile (accountType set)
const REQUIRES_ONBOARDING = ["/dashboard", "/profile", "/submit", "/submissions", "/api/submit", "/api/profile", "/api/projects"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NextAuth endpoints and sign-in pages are always public
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAdmin     = ADMIN_ONLY.some((p) => pathname.startsWith(p));

  // Public routes — no auth checks at all
  if (!isProtected && !isAdmin) {
    return NextResponse.next();
  }

  const session = await auth();

  // Not signed in — send to sign-in with a callback
  if (!session) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but onboarding not complete — only block routes that need a full profile
  if (!session.user.accountType && REQUIRES_ONBOARDING.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Already onboarded — skip the onboarding page
  if (session.user.accountType && pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin-only routes
  if (isAdmin && !session.user.isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
