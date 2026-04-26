import { requireAuth } from "@/lib/auth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BackButton } from "@/components/layout/BackButton";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireAuth();
  const { name, email } = session.user;

  return (
    <PageWrapper>
      <div className="py-12">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>
        </div>
        <div className="max-w-xl">
          <SettingsForm name={name ?? ""} email={email ?? ""} />
        </div>
      </div>
    </PageWrapper>
  );
}
