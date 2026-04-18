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
      "Upload a design project and have it listed with full credits — designer name, agency, tools used, and a link back to the source. Your work, properly attributed.",
  },
  {
    icon: LayoutGrid,
    number: "02",
    title: "Designer Profiles",
    description:
      "Build a searchable profile showcasing your portfolio, location, specialties, and availability. Get discovered by brands, studios, and recruiters looking for exactly your skills.",
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
      "We connect design studios and independent creatives with brands that are serious about craft. Partnership listings give both sides a direct line to collaborate.",
  },
];

export function ServicesSection() {
  return (
    <section
      id="services"
      className="border-b border-border bg-muted/30 py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" />
              Services
            </p>
            <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Everything you need
              <br />
              to{" "}
              <span className="italic font-light">grow your reach.</span>
            </h2>
          </div>
          <div className="flex items-end">
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
              From submitting a single project to building a full presence,
              the directory gives designers and agencies the tools to be seen
              by the right people.
            </p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.title}
              className="group flex flex-col gap-5 bg-background p-8 transition-colors hover:bg-muted/50 lg:p-10"
            >
              {/* Icon + number row */}
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted/60 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold tabular-nums text-muted-foreground/50">
                  {s.number}
                </span>
              </div>

              {/* Text */}
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
