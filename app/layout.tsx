import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://design-directory.vercel.app"),
  title: {
    default: "Rightstar Collective",
    template: "%s | Rightstar Collective",
  },
  description:
    "Rightstar Collective — discover outstanding creative work and connect with talented creatives by location, discipline, and availability.",
  openGraph: {
    siteName: "Rightstar Collective",
    type: "website",
    title: "Rightstar Collective",
    description:
      "Rightstar Collective — discover outstanding creative work and connect with talented creatives by location, discipline, and availability.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rightstar Collective",
    description:
      "Rightstar Collective — discover outstanding creative work and connect with talented creatives by location, discipline, and availability.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>
          <SiteHeader />
          {children}
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
