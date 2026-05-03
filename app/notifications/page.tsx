import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { NotificationsList } from "./NotificationsList";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await requireAuth();
  const { id: userId, name, email, image, accountType } = session.user;
  const user = { name, email, image, accountType };

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Notifications
        </h1>
      </div>
      <div className="max-w-2xl">
        <NotificationsList notifications={notifications} />
      </div>
    </DashboardShell>
  );
}
