import { requireOnboarded } from "@/lib/auth";
import { PageWrapper } from "@/components/layout/PageWrapper";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireOnboarded();
  const { name, email, accountType, image } = session.user;

  return (
    <PageWrapper>
      <div className="py-12">
        <div className="mb-8 flex items-center gap-4">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={name}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-xl font-semibold">
              {name?.[0] ?? "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {name?.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground capitalize">{accountType} account</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DashCard title="Submit a Project" href="/submit" description="Share your work with the community." cta="Get started →" />
          <DashCard title="Edit Profile" href="/profile" description="Update your bio, skills, and contact info." cta="Open settings →" />
          <DashCard title="My Submissions" href="/submissions" description="Track the status of your submitted projects." cta="View all →" />
        </div>
      </div>
    </PageWrapper>
  );
}

function DashCard({ title, href, description, cta }: {
  title: string;
  href: string;
  description: string;
  cta: string;
}) {
  return (
    <a
      href={href}
      className="group rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
    >
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-4 text-sm font-medium text-foreground">{cta}</p>
    </a>
  );
}
