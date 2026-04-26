import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BackButton } from "@/components/layout/BackButton";
import { NotificationsList } from "./NotificationsList";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Mark all as read
  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  return (
    <PageWrapper>
      <div className="py-12">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        </div>
        <div className="max-w-2xl">
          <NotificationsList notifications={notifications} />
        </div>
      </div>
    </PageWrapper>
  );
}
