import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  return session;
}

export async function requireOnboarded() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (!session.user.accountType) redirect("/onboarding");
  return session;
}

export async function requireAdmin() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (!session.user.isAdmin) redirect("/");
  return session;
}
