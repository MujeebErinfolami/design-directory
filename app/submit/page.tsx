"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { BackButton } from "@/components/layout/BackButton";
import { ProjectEditor } from "@/components/editor/ProjectEditor";
import { BlogPostForm } from "./BlogPostForm";

type SubmitType = "project" | "blog";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [chosen, setChosen] = useState<SubmitType | null>(null);

  if (status === "loading") return null;
  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }
  if (!session.user.accountType) {
    router.push("/onboarding");
    return null;
  }

  // Project editor is full-screen — no PageWrapper or SiteHeader chrome
  if (chosen === "project") {
    return <ProjectEditor />;
  }

  return (
    <PageWrapper>
      <div className="py-12">
        <div className="mb-6">
          <BackButton href="/dashboard" label="Dashboard" />
        </div>

        {!chosen ? (
          <>
            <div className="mb-10">
              <h1 className="text-3xl font-bold tracking-tight">What would you like to share?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                All submissions are reviewed before publishing.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => setChosen("project")}
                className="group flex flex-col gap-4 rounded-2xl border-2 border-border bg-background p-7 text-left transition-all hover:border-foreground hover:shadow-md"
              >
                <span className="text-3xl">🖼️</span>
                <div>
                  <p className="text-lg font-semibold tracking-tight">Project</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Portfolio work — build a rich case study with images, text, video, and more.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setChosen("blog")}
                className="group flex flex-col gap-4 rounded-2xl border-2 border-border bg-background p-7 text-left transition-all hover:border-foreground hover:shadow-md"
              >
                <span className="text-3xl">✍️</span>
                <div>
                  <p className="text-lg font-semibold tracking-tight">Article</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    A written piece — craft essay, process breakdown, or creative opinion.
                  </p>
                </div>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-4">
              <button
                onClick={() => setChosen(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Change type
              </button>
              <h1 className="text-3xl font-bold tracking-tight">Submit an Article</h1>
            </div>

            <div className="max-w-2xl">
              <BlogPostForm />
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
