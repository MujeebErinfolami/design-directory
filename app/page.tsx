import type { Metadata } from "next";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BlogPreviewSection } from "@/components/landing/BlogPreviewSection";

export const metadata: Metadata = {
  title: "Rightstar Collective — Where Creative Work Gets Discovered",
  description:
    "Browse outstanding creative projects. Find talented creatives anywhere in the world and connect with them directly.",
  openGraph: {
    title: "Rightstar Collective — Where Creative Work Gets Discovered",
    description:
      "Browse outstanding creative projects. Find talented creatives anywhere in the world and connect with them directly.",
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
