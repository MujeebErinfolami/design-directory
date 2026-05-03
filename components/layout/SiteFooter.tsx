import Link from "next/link";
import { getAllProjects } from "@/lib/data/projects";
import { FooterParallaxStrip } from "./FooterParallaxStrip";

const footerLinks = {
  Discover: [
    { href: "/projects", label: "Projects" },
    { href: "/designers", label: "Creatives" },
    { href: "/blog", label: "Blog" },
  ],
  Company: [
    { href: "/", label: "Home" },
    { href: "/#about", label: "About" },
    { href: "/#services", label: "Services" },
    { href: "/submit", label: "Submit Project" },
  ],
};

const socialLinks = [
  { href: "https://twitter.com", label: "Twitter" },
  { href: "https://instagram.com", label: "Instagram" },
  { href: "https://linkedin.com", label: "LinkedIn" },
];

export async function SiteFooter() {
  const allProjects = await getAllProjects();
  const stripProjects = allProjects.slice(0, 10);

  return (
    <footer className="mt-auto border-t border-border bg-background">
      {/* Horizontal parallax strip */}
      <FooterParallaxStrip projects={stripProjects} />

      {/* Footer links */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="text-lg font-bold text-foreground">
              Rightstar Collective
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Discover the world&apos;s best creative work. Browse projects,
              find creatives, and connect with talent everywhere.
            </p>
            <div className="mt-5 flex gap-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
                {group}
              </p>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Rightstar Collective. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
