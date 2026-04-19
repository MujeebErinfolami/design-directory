import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const accountType = session.user.accountType;

    if (accountType === "designer") {
      const profile = await prisma.designerProfile.findUnique({ where: { userId } });
      if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      return NextResponse.json(profile);
    }

    if (accountType === "agency") {
      const profile = await prisma.agencyProfile.findUnique({ where: { userId } });
      if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      return NextResponse.json(profile);
    }

    return NextResponse.json({ error: "Onboarding not complete" }, { status: 400 });
  } catch (err) {
    console.error("[profile] GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userId = session.user.id;
    const accountType = session.user.accountType;

    if (accountType === "designer") {
      const {
        displayName, title, bio, locationCity, locationCountry, locationCountryCode,
        primaryRoles, specialties, tools, availability, experienceLevel,
        contactEmail, contactWebsite, contactLinkedin, contactInstagram,
        contactBehance, contactDribbble,
      } = body as any;

      const updated = await prisma.designerProfile.update({
        where: { userId },
        data: {
          ...(displayName !== undefined && { displayName }),
          ...(title !== undefined && { title }),
          ...(bio !== undefined && { bio }),
          ...(locationCity !== undefined && { locationCity }),
          ...(locationCountry !== undefined && { locationCountry }),
          ...(locationCountryCode !== undefined && { locationCountryCode }),
          ...(Array.isArray(primaryRoles) && { primaryRoles }),
          ...(Array.isArray(specialties) && { specialties }),
          ...(Array.isArray(tools) && { tools }),
          ...(availability !== undefined && { availability }),
          ...(experienceLevel !== undefined && { experienceLevel }),
          ...(contactEmail !== undefined && { contactEmail }),
          ...(contactWebsite !== undefined && { contactWebsite }),
          ...(contactLinkedin !== undefined && { contactLinkedin }),
          ...(contactInstagram !== undefined && { contactInstagram }),
          ...(contactBehance !== undefined && { contactBehance }),
          ...(contactDribbble !== undefined && { contactDribbble }),
        },
      });
      return NextResponse.json(updated);
    }

    if (accountType === "agency") {
      const {
        displayName, bio, locationCity, locationCountry, locationCountryCode,
        teamSize, specialties, pastClients,
        contactEmail, contactWebsite, contactLinkedin, contactInstagram,
        contactBehance, contactDribbble,
      } = body as any;

      const updated = await prisma.agencyProfile.update({
        where: { userId },
        data: {
          ...(displayName !== undefined && { displayName }),
          ...(bio !== undefined && { bio }),
          ...(locationCity !== undefined && { locationCity }),
          ...(locationCountry !== undefined && { locationCountry }),
          ...(locationCountryCode !== undefined && { locationCountryCode }),
          ...(teamSize !== undefined && { teamSize }),
          ...(Array.isArray(specialties) && { specialties }),
          ...(Array.isArray(pastClients) && { pastClients }),
          ...(contactEmail !== undefined && { contactEmail }),
          ...(contactWebsite !== undefined && { contactWebsite }),
          ...(contactLinkedin !== undefined && { contactLinkedin }),
          ...(contactInstagram !== undefined && { contactInstagram }),
          ...(contactBehance !== undefined && { contactBehance }),
          ...(contactDribbble !== undefined && { contactDribbble }),
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Onboarding not complete" }, { status: 400 });
  } catch (err) {
    console.error("[profile] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
