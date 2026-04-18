import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Remove default horizontal padding (e.g. for full-bleed sections) */
  flush?: boolean;
}

export function PageWrapper({ children, className, flush = false }: PageWrapperProps) {
  return (
    <main
      id="main-content"
      className={cn(
        "mx-auto w-full max-w-7xl flex-1",
        !flush && "px-4 sm:px-6 lg:px-8",
        "py-12 md:py-16",
        className
      )}
    >
      {children}
    </main>
  );
}
