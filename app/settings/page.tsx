import { requireAuth } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireAuth();
  const { name, email, image, accountType } = session.user;
  const user = { name, email, image, accountType };

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>
      <div className="max-w-xl">
        <SettingsForm name={name ?? ""} email={email ?? ""} />
      </div>
    </DashboardShell>
  );
}
