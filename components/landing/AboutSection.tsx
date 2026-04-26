const highlights = [
  {
    stat: "2,400+",
    label: "Projects featured",
    description: "From independent studios to global agencies.",
  },
  {
    stat: "800+",
    label: "Creative profiles",
    description: "Searchable by location, specialty, and availability.",
  },
  {
    stat: "60+",
    label: "Countries represented",
    description: "A truly global view of creative output.",
  },
];

export function AboutSection() {
  return (
    <section
      id="about"
      className="border-b border-border bg-background py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">

          {/* Left — text */}
          <div className="flex flex-col justify-center">
            <p className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              <span className="h-px w-8 bg-foreground/30" />
              About Us
            </p>

            <h2 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              We believe great
              <br />
              design deserves{" "}
              <span className="italic font-light">an audience.</span>
            </h2>

            <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
              <p>
                Rightstar Collective was built to close the gap between remarkable
                creative work and the people who need to find it. Too much
                brilliant work lives only in a creative&apos;s hard drive or
                a studio&apos;s internal portfolio.
              </p>
              <p>
                We created a single, curated place where design projects are
                properly credited — with creative names, agency affiliations,
                and source links — so the people behind the work get the
                recognition and reach they deserve.
              </p>
              <p>
                Whether you&apos;re a creative director scouting talent, a
                brand looking for a partner, or a creative who wants to be
                found: this is where it happens.
              </p>
            </div>
          </div>

          {/* Right — stat cards */}
          <div className="flex flex-col gap-4">
            {highlights.map((h, i) => (
              <div
                key={h.label}
                className="flex items-start gap-6 rounded-xl border border-border bg-muted/40 p-6 transition-colors hover:bg-muted/70"
              >
                {/* Index */}
                <span className="mt-0.5 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground/60">
                  0{i + 1}
                </span>
                {/* Stat */}
                <div>
                  <p className="text-3xl font-bold tracking-tight text-foreground">
                    {h.stat}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {h.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {h.description}
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
