import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    let body: { isVerified: boolean };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (typeof body.isVerified !== "boolean") {
      return NextResponse.json({ error: "isVerified must be a boolean" }, { status: 400 });
    }

    const profile = await prisma.designerProfile.update({
      where: { id },
      data: { isVerified: body.isVerified },
      select: { id: true, displayName: true, isVerified: true, userId: true },
    });

    if (body.isVerified) {
      await prisma.notification.create({
        data: {
          userId: profile.userId,
          type: "badge_verified",
          title: "Your profile has been verified",
          body: "You've earned a verification badge on Rightstar Collective.",
          link: "/profile",
        },
      });
    }

    return NextResponse.json(profile);
  } catch (err) {
    console.error("[admin/designers] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
