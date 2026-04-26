import Link from "next/link";
import { auth } from "@/auth";
import { ClientNav } from "./ClientNav";

export async function SiteHeader() {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground"
          >
            <span className="text-xl font-bold">Rightstar Collective</span>
          </Link>

          <ClientNav user={user} />
        </div>
      </header>
    </>
  );
}
