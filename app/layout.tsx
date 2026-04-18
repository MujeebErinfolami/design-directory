import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { auth } from "@/auth";
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
    default: "Design Directory",
    template: "%s | Design Directory",
  },
  description:
    "Discover the world's best design projects and find talented designers by location, specialty, and availability.",
  openGraph: {
    siteName: "Design Directory",
    type: "website",
    title: "Design Directory",
    description:
      "Discover the world's best design projects and find talented designers by location, specialty, and availability.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Design Directory",
    description:
      "Discover the world's best design projects and find talented designers by location, specialty, and availability.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? null,
      }
    : null;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader user={user} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
