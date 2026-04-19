import { requireOnboarded } from "@/lib/auth";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BackButton } from "@/components/layout/BackButton";
import { SubmitForm } from "./SubmitForm";

export const metadata = { title: "Submit a Project" };

export default async function SubmitPage() {
  await requireOnboarded();
  return (
    <PageWrapper>
      <div className="py-12">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Dashboard" />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Submit a Project</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share your work with the design community. All submissions are reviewed before publishing.
          </p>
        </div>
        <div className="max-w-2xl">
          <SubmitForm />
        </div>
      </div>
    </PageWrapper>
  );
}
