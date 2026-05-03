import { Upload, LayoutGrid, Star, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Service {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    icon: Upload,
    number: "01",
    title: "Submit Your Work",
    description:
      "Upload a design project with full credits — creative name, agency, tools used, and a link back to the source. Your work, properly attributed.",
  },
  {
    icon: LayoutGrid,
    number: "02",
    title: "Creative Profiles",
    description:
      "Build a searchable profile showcasing your portfolio, location, specialties, and availability. Get discovered by brands, studios, and recruiters.",
  },
  {
    icon: Star,
    number: "03",
    title: "Featured Placements",
    description:
      "Stand out with an editorial feature. Featured projects appear at the top of the discovery feed and are promoted across our newsletter and social channels.",
  },
  {
    icon: Handshake,
    number: "04",
    title: "Creative Partnerships",
    description:
      "We connect design studios and independents with brands serious about craft. Partnership listings give both sides a direct line to collaborate.",
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="border-b border-border bg-card py-24 lg:py-36">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:mb-20 lg:grid-cols-2">
          <div>
            <p className="mb-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-10 bg-muted-foreground/40" />
              Services
            </p>
            <h2
              className="font-bold leading-[0.95] tracking-tight text-foreground"
              style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)" }}
            >
              Everything you need
              <br />
              to{" "}
              <span className="italic font-light">grow your reach.</span>
            </h2>
          </div>
          <div className="flex items-end">
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              From submitting a single project to building a full creative presence —
              the directory gives you the tools to be seen by the right people.
            </p>
          </div>
        </div>

        {/* 2×2 card grid with 1px separator lines */}
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.title}
              className="group flex flex-col gap-6 bg-card p-8 transition-colors duration-200 hover:bg-background lg:p-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-all duration-200 group-hover:bg-brand group-hover:border-brand group-hover:text-white">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-semibold tabular-nums text-muted-foreground/40">
                  {s.number}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
