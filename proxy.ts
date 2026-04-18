import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/submit", "/settings"];
const ADMIN_ONLY = ["/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAdmin = ADMIN_ONLY.some((p) => pathname.startsWith(p));
  const isOnboarding = pathname.startsWith("/onboarding");
  const isAuthRoute = pathname.startsWith("/api/auth") || pathname.startsWith("/auth");

  if (!isProtected && !isAdmin && !isOnboarding) {
    return NextResponse.next();
  }

  const session = await auth();

  // Not signed in — send to sign-in for protected routes
  if (!session && (isProtected || isAdmin)) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in but no account type — gate everything except onboarding to /onboarding
  if (session && !session.user.accountType && !isOnboarding && !isAuthRoute) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Onboarding page: if already set up, redirect to dashboard
  if (session && session.user.accountType && isOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin-only routes
  if (isAdmin && !session?.user.isAdmin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
