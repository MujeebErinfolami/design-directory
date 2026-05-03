"use client";

import { useEffect, useRef } from "react";
import type { Project } from "@/lib/data/projects";

interface Props {
  projects: Project[];
}

export function FooterParallaxStrip({ projects }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const strip = stripRef.current;
    if (!section || !strip) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;
      const progress = 1 - rect.bottom / (windowH + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      strip.style.transform = `translateX(-${clamped * 22}%)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (projects.length === 0) return null;

  return (
    <div ref={sectionRef} className="overflow-hidden border-b border-border py-14">
      <p className="mb-6 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:px-6 lg:px-8">
        Featured Work
      </p>
      <div
        ref={stripRef}
        className="flex gap-4 will-change-transform"
        style={{
          width: `${projects.length * 424}px`,
          paddingLeft: "1rem",
          paddingRight: "1rem",
          transition: "transform 80ms linear",
        }}
      >
        {projects.map((project) => (
          <a
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group relative flex-none overflow-hidden rounded-xl"
            style={{
              width: "400px",
              height: "260px",
              backgroundColor: project.thumbnailColor,
            }}
          >
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/65" />

            {/* Content revealed on hover */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-white/60">
                {project.category}
              </span>
              <h3 className="text-xl font-bold leading-snug text-white">
                {project.title}
              </h3>
            </div>

            {/* Year chip always visible */}
            <span className="absolute right-4 top-4 rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white/70 backdrop-blur-sm">
              {project.year}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
