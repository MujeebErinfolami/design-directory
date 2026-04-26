import Link from "next/link";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "2,400+", label: "Projects" },
  { value: "800+", label: "Creatives" },
  { value: "60+", label: "Countries" },
];

const mockProjects = [
  { category: "Branding", title: "Helvetica Identity System", bg: "bg-stone-100" },
  { category: "UX", title: "Mindful App Redesign", bg: "bg-zinc-200" },
  { category: "Motion", title: "Sequence 01 Showreel", bg: "bg-slate-100" },
  { category: "Web", title: "Atlas Studio Site", bg: "bg-neutral-200" },
  { category: "Print", title: "Annual Report 2025", bg: "bg-stone-200" },
  { category: "Product", title: "FORM Chair Collection", bg: "bg-zinc-100" },
];

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden border-b border-border bg-background"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-0">

        {/* Left — copy */}
        <div className="flex flex-col justify-center">
          {/* Eyebrow */}
          <p className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-px w-8 bg-foreground/30" />
            Rightstar Collective
          </p>

          {/* Headline */}
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Where bold
            <br />
            <span className="italic font-light">creative work</span>
            <br />
            finds its people.
          </h1>

          {/* Sub */}
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Browse outstanding creative projects. Find talented creatives
            anywhere in the world and connect with them directly.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
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

          {/* Stats strip */}
          <div className="mt-14 flex gap-10 border-t border-border pt-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — project mosaic (hidden on mobile, shown from lg) */}
        <div className="hidden items-center justify-end lg:flex">
          <div className="grid w-full max-w-md grid-cols-2 gap-3 lg:max-w-none">
            {mockProjects.map((p, i) => (
              <div
                key={p.title}
                className={`group relative overflow-hidden rounded-xl ${p.bg} transition-transform duration-300 hover:-translate-y-1`}
                style={{ aspectRatio: i % 3 === 0 ? "4/5" : "4/3" }}
              >
                {/* Category badge */}
                <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
                  {p.category}
                </span>
                {/* Project title */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent p-3">
                  <p className="text-xs font-semibold text-foreground/80">
                    {p.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
