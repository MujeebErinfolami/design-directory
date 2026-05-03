import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Projects" },
  { value: "800+", label: "Creatives" },
  { value: "60+", label: "Countries" },
];

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100dvh] flex-col justify-between overflow-hidden border-b border-border bg-background px-4 sm:px-6 lg:px-8"
    >
      {/* Main copy — vertically centered */}
      <div className="flex flex-1 flex-col justify-center">
        <div className="mx-auto w-full max-w-7xl py-20">
          {/* Eyebrow */}
          <p className="mb-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px w-10 bg-muted-foreground/40" />
            Rightstar Collective
          </p>

          {/* Oversized headline */}
          <h1
            className="font-bold leading-[0.92] tracking-tight text-foreground"
            style={{ fontSize: "clamp(3.25rem, 9.5vw, 9.5rem)" }}
          >
            Where bold
            <br />
            <span className="italic font-light">creative work</span>
            <br />
            finds its people.
          </h1>

          {/* Sub + CTAs */}
          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Browse outstanding creative projects. Find talented creatives
              anywhere in the world and connect directly.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-md bg-foreground px-6 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80"
              >
                Browse Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/designers"
                className="inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Find a Creative
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip — pinned to bottom */}
      <div className="mx-auto w-full max-w-7xl">
        <div className="flex gap-10 border-t border-border py-8">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
