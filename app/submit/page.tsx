"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
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

  // Project editor is full-screen — no shell chrome
  if (chosen === "project") {
    return <ProjectEditor />;
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    accountType: session.user.accountType,
  };

  return (
    <DashboardShell user={user}>
      {!chosen ? (
        <>
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What would you like to share?
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              All submissions are reviewed before publishing.
            </p>
          </div>

          <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setChosen("project")}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 text-left transition-all hover:border-brand/40 hover:shadow-md hover:shadow-black/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-2xl">
                🖼️
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-foreground">Project</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Portfolio work — build a rich case study with images, text, video, and more.
                </p>
              </div>
            </button>

            <button
              onClick={() => setChosen("blog")}
              className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-7 text-left transition-all hover:border-brand/40 hover:shadow-md hover:shadow-black/10"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-2xl">
                ✍️
              </div>
              <div>
                <p className="text-base font-semibold tracking-tight text-foreground">Article</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  A written piece — craft essay, process breakdown, or creative opinion.
                </p>
              </div>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-8">
            <button
              onClick={() => setChosen(null)}
              className="mb-4 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Change type
            </button>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Submit an Article
            </h1>
          </div>
          <div className="max-w-2xl">
            <BlogPostForm />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
