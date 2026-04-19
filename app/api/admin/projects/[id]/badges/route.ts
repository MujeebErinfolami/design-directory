import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { BadgeType } from "@prisma/client";

const VALID_BADGES: BadgeType[] = ["featured", "editors_pick", "best_of_year"];

interface Params { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: projectId } = await params;

    let body: { badge: BadgeType; action: "grant" | "revoke" };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { badge, action } = body;

    if (!VALID_BADGES.includes(badge)) {
      return NextResponse.json({ error: `badge must be one of: ${VALID_BADGES.join(", ")}` }, { status: 400 });
    }
    if (action !== "grant" && action !== "revoke") {
      return NextResponse.json({ error: "action must be grant or revoke" }, { status: 400 });
    }

    if (action === "grant") {
      await prisma.projectBadge.upsert({
        where: { projectId_badge: { projectId, badge } },
        create: { projectId, badge, grantedById: session.user.id },
        update: { grantedById: session.user.id, grantedAt: new Date() },
      });
    } else {
      await prisma.projectBadge.deleteMany({ where: { projectId, badge } });
    }

    const badges = await prisma.projectBadge.findMany({
      where: { projectId },
      select: { badge: true },
    });

    return NextResponse.json({ projectId, badges: badges.map((b) => b.badge) });
  } catch (err) {
    console.error("[admin/projects/badges] POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
