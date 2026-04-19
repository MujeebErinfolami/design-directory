import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";
import type { AccountType } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.accountType) {
      return NextResponse.json({ error: "Already onboarded" }, { status: 400 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { accountType, ...fields } = body as { accountType: AccountType; [k: string]: unknown };

    if (accountType !== "designer" && accountType !== "agency") {
      return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
    }

    const userId = session.user.id;

    if (accountType === "designer") {
      const { displayName, title, bio, locationCity, locationCountry, locationCountryCode,
              primaryRoles, specialties, tools, availability, experienceLevel } = fields as any;
      if (!displayName) return NextResponse.json({ error: "displayName required" }, { status: 400 });
      const existing = await prisma.designerProfile.findUnique({ where: { userId } });
      const slug = existing?.slug ?? await uniqueSlug(displayName, "designerProfile");
      const roles = Array.isArray(primaryRoles) ? primaryRoles : [];
      const profileData = {
        displayName,
        title: title ?? "",
        bio: bio ?? "",
        locationCity: locationCity ?? "",
        locationCountry: locationCountry ?? "",
        locationCountryCode: locationCountryCode ?? "",
        primaryRoles: roles,
        specialties: Array.isArray(specialties) ? specialties : roles,
        tools: Array.isArray(tools) ? tools : [],
        availability: availability ?? "unavailable",
        experienceLevel: experienceLevel ?? "mid",
      };
      await prisma.designerProfile.upsert({
        where:  { userId },
        create: { userId, slug, ...profileData },
        update: profileData,
      });
    } else {
      const { displayName, bio, locationCity, locationCountry, locationCountryCode,
              teamSize, specialties, pastClients } = fields as any;
      if (!displayName) return NextResponse.json({ error: "displayName required" }, { status: 400 });
      const existing = await prisma.agencyProfile.findUnique({ where: { userId } });
      const slug = existing?.slug ?? await uniqueSlug(displayName, "agencyProfile");
      const profileData = {
        displayName,
        bio: bio ?? "",
        locationCity: locationCity ?? "",
        locationCountry: locationCountry ?? "",
        locationCountryCode: locationCountryCode ?? "",
        teamSize: teamSize ?? "",
        specialties: Array.isArray(specialties) ? specialties : [],
        pastClients: Array.isArray(pastClients) ? pastClients : [],
      };
      await prisma.agencyProfile.upsert({
        where:  { userId },
        create: { userId, slug, ...profileData },
        update: profileData,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { accountType },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[onboarding] POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
