import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectCategory } from "@prisma/client";

const VALID_CATEGORIES: ProjectCategory[] = ["Branding", "Web", "Motion", "Print", "Product", "UX"];

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only owner or admin may update
    if (project.submittedById !== session.user.id && !session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Cannot edit an approved/rejected project unless admin
    if (!session.user.isAdmin && (project.status === "approved" || project.status === "rejected")) {
      return NextResponse.json({ error: "Cannot edit a reviewed project" }, { status: 400 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const {
      title,
      tagline,
      description,
      category,
      tags,
      year,
      layoutType,
      thumbnailUrl,
      thumbnailColor,
      contentBlocks,
      galleryUrls,
      agencyName,
      agencyUrl,
      sourceUrl,
      theme,
      externalLink,
      externalLinkLabel,
      attachments,
      status,
      credits,
    } = body as any;

    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = String(title).trim();
    if (tagline !== undefined) data.tagline = String(tagline).trim();
    if (description !== undefined) data.description = String(description).trim();
    if (category !== undefined && VALID_CATEGORIES.includes(category as ProjectCategory)) {
      data.category = category;
    }
    if (Array.isArray(tags)) data.tags = tags;
    if (year !== undefined) data.year = parseInt(String(year), 10);
    if (layoutType !== undefined) data.layoutType = String(layoutType);
    if (thumbnailUrl !== undefined) data.thumbnailUrl = String(thumbnailUrl);
    if (thumbnailColor !== undefined) data.thumbnailColor = String(thumbnailColor);
    if (Array.isArray(contentBlocks)) data.contentBlocks = contentBlocks;
    if (Array.isArray(galleryUrls)) data.galleryUrls = galleryUrls;
    if (agencyName !== undefined) data.agencyName = String(agencyName);
    if (agencyUrl !== undefined) data.agencyUrl = String(agencyUrl);
    if (sourceUrl !== undefined) data.sourceUrl = String(sourceUrl);
    if (theme !== undefined) data.theme = String(theme);
    if (externalLink !== undefined) data.externalLink = String(externalLink);
    if (externalLinkLabel !== undefined) data.externalLinkLabel = String(externalLinkLabel);
    if (Array.isArray(attachments)) data.attachments = attachments;

    // Status transitions: only allow draft→pending (submit for review); admins can do anything
    if (status !== undefined) {
      if (session.user.isAdmin) {
        data.status = status;
      } else if (status === "pending" && project.status === "draft") {
        data.status = "pending";
      }
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        ...(Array.isArray(credits) && {
          credits: {
            deleteMany: {},
            create: credits.map((c: { creditName: string; role?: string }) => ({
              creditName: c.creditName,
              role: c.role ?? null,
            })),
          },
        }),
      },
      include: { credits: true },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[projects/[id]] PATCH error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
