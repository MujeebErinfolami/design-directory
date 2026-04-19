import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./OnboardingForm";
import { BackButton } from "@/components/layout/BackButton";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.accountType) redirect("/dashboard");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <BackButton href="/auth/signin" label="Sign in" />
        </div>
        <OnboardingForm userName={session.user.name ?? ""} />
      </div>
    </main>
  );
}
