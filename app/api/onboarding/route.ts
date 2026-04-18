import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";
import type { AccountType } from "@prisma/client";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.accountType) {
    return NextResponse.json({ error: "Already onboarded" }, { status: 400 });
  }

  const body = await request.json();
  const { accountType, ...fields } = body as { accountType: AccountType; [k: string]: unknown };

  if (accountType !== "designer" && accountType !== "agency") {
    return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
  }

  const userId = session.user.id;

  if (accountType === "designer") {
    const { displayName, title, bio, locationCity, locationCountry, locationCountryCode,
            specialties, tools, availability, experienceLevel } = fields as any;
    if (!displayName) return NextResponse.json({ error: "displayName required" }, { status: 400 });
    const slug = await uniqueSlug(displayName, "designerProfile");
    await prisma.designerProfile.create({
      data: {
        userId,
        slug,
        displayName,
        title: title ?? "",
        bio: bio ?? "",
        locationCity: locationCity ?? "",
        locationCountry: locationCountry ?? "",
        locationCountryCode: locationCountryCode ?? "",
        specialties: Array.isArray(specialties) ? specialties : [],
        tools: Array.isArray(tools) ? tools : [],
        availability: availability ?? "unavailable",
        experienceLevel: experienceLevel ?? "mid",
      },
    });
  } else {
    const { displayName, bio, locationCity, locationCountry, locationCountryCode,
            teamSize, specialties, pastClients } = fields as any;
    if (!displayName) return NextResponse.json({ error: "displayName required" }, { status: 400 });
    const slug = await uniqueSlug(displayName, "agencyProfile");
    await prisma.agencyProfile.create({
      data: {
        userId,
        slug,
        displayName,
        bio: bio ?? "",
        locationCity: locationCity ?? "",
        locationCountry: locationCountry ?? "",
        locationCountryCode: locationCountryCode ?? "",
        teamSize: teamSize ?? "",
        specialties: Array.isArray(specialties) ? specialties : [],
        pastClients: Array.isArray(pastClients) ? pastClients : [],
      },
    });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountType },
  });

  return NextResponse.json({ success: true });
}
