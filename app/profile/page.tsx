import { requireOnboarded } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { DesignerProfileForm, AgencyProfileForm } from "./ProfileForm";

export const metadata = { title: "Edit Profile" };

export default async function ProfilePage() {
  const session = await requireOnboarded();
  const { id: userId, accountType, name, email, image } = session.user;
  const user = { name, email, image, accountType };

  if (accountType === "designer") {
    const profile = await prisma.designerProfile.findUniqueOrThrow({ where: { userId } });
    const initial = {
      avatarUrl: profile.avatarUrl ?? "",
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.bio,
      locationCity: profile.locationCity,
      locationCountry: profile.locationCountry,
      locationCountryCode: profile.locationCountryCode,
      primaryRoles: profile.primaryRoles,
      specialties: profile.specialties,
      tools: profile.tools,
      availability: profile.availability,
      experienceLevel: profile.experienceLevel,
      contactEmail: profile.contactEmail,
      contactWebsite: profile.contactWebsite,
      contactLinkedin: profile.contactLinkedin,
      contactInstagram: profile.contactInstagram,
      contactBehance: profile.contactBehance,
      contactDribbble: profile.contactDribbble,
    };
    return (
      <DashboardShell user={user}>
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your public creative profile.{" "}
            <Link
              href={`/designers/${profile.slug}`}
              className="text-brand underline underline-offset-2 hover:no-underline"
            >
              View public page →
            </Link>
          </p>
        </div>
        <div className="max-w-2xl">
          <DesignerProfileForm initial={initial} />
        </div>
      </DashboardShell>
    );
  }

  const profile = await prisma.agencyProfile.findUniqueOrThrow({ where: { userId } });
  const initial = {
    logoUrl: profile.logoUrl ?? "",
    displayName: profile.displayName,
    bio: profile.bio,
    locationCity: profile.locationCity,
    locationCountry: profile.locationCountry,
    locationCountryCode: profile.locationCountryCode,
    teamSize: profile.teamSize,
    specialties: profile.specialties,
    pastClients: profile.pastClients,
    contactEmail: profile.contactEmail,
    contactWebsite: profile.contactWebsite,
    contactLinkedin: profile.contactLinkedin,
    contactInstagram: profile.contactInstagram,
    contactBehance: profile.contactBehance,
    contactDribbble: profile.contactDribbble,
  };
  return (
    <DashboardShell user={user}>
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Edit Agency Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Your public agency profile.</p>
      </div>
      <div className="max-w-2xl">
        <AgencyProfileForm initial={initial} />
      </div>
    </DashboardShell>
  );
}
