import { requireOnboarded } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DesignerProfileForm, AgencyProfileForm } from "./ProfileForm";

export const metadata = { title: "Edit Profile" };

export default async function ProfilePage() {
  const session = await requireOnboarded();
  const { id: userId, accountType } = session.user;

  if (accountType === "designer") {
    const profile = await prisma.designerProfile.findUniqueOrThrow({ where: { userId } });
    const initial = {
      displayName: profile.displayName,
      title: profile.title,
      bio: profile.bio,
      locationCity: profile.locationCity,
      locationCountry: profile.locationCountry,
      locationCountryCode: profile.locationCountryCode,
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
      <PageWrapper>
        <div className="py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your public designer profile.{" "}
              <a href={`/designers/${profile.slug}`} className="underline hover:no-underline">
                View public page →
              </a>
            </p>
          </div>
          <div className="max-w-2xl">
            <DesignerProfileForm initial={initial} />
          </div>
        </div>
      </PageWrapper>
    );
  }

  const profile = await prisma.agencyProfile.findUniqueOrThrow({ where: { userId } });
  const initial = {
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
    <PageWrapper>
      <div className="py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Agency Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your public agency profile.</p>
        </div>
        <div className="max-w-2xl">
          <AgencyProfileForm initial={initial} />
        </div>
      </div>
    </PageWrapper>
  );
}
