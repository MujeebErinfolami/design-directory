import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BlogPreviewSection } from "@/components/landing/BlogPreviewSection";

export const metadata: Metadata = {
  title: "Design Directory — Where Great Design Gets Discovered",
  description:
    "Browse thousands of credited design projects. Find talented designers anywhere in the world and connect with them directly.",
  openGraph: {
    title: "Design Directory — Where Great Design Gets Discovered",
    description:
      "Browse thousands of credited design projects. Find talented designers anywhere in the world and connect with them directly.",
  },
};

export default function Home() {
  return (
    <main id="main-content" className="flex-1">
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <BlogPreviewSection />
    </main>
  );
}
