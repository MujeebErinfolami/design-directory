import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";
import type { ProjectCategory } from "@prisma/client";

const VALID_CATEGORIES: ProjectCategory[] = ["Branding", "Web", "Motion", "Print", "Product", "UX"];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!session.user.accountType) return NextResponse.json({ error: "Onboarding not complete" }, { status: 400 });

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      title,
      tagline,
      description,
      category,
      tags,
      year,
      layoutType,
      thumbnailUrl,
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

    if (!title?.trim()) return NextResponse.json({ error: "title required" }, { status: 400 });
    if (status !== "draft") {
      if (!description?.trim()) return NextResponse.json({ error: "description required" }, { status: 400 });
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
      }
    }

    const initialStatus = status === "draft" ? "draft" : "pending";
    const layout = layoutType ?? "editor";

    const slug = await uniqueSlug(title, "project");

    const project = await prisma.project.create({
      data: {
        slug,
        title: title.trim(),
        tagline: tagline?.trim() ?? "",
        description: description?.trim() ?? "",
        body: "",
        layoutType: layout,
        thumbnailUrl: thumbnailUrl ?? "",
        contentBlocks: Array.isArray(contentBlocks) ? contentBlocks : [],
        galleryUrls: Array.isArray(galleryUrls) ? galleryUrls : [],
        category: category ?? "Branding",
        tags: Array.isArray(tags) ? tags : [],
        year: year ? parseInt(year, 10) : new Date().getFullYear(),
        agencyName: agencyName ?? "",
        agencyUrl: agencyUrl ?? "",
        sourceUrl: sourceUrl ?? "",
        theme: theme ?? "light",
        externalLink: externalLink ?? "",
        externalLinkLabel: externalLinkLabel ?? "View Project",
        attachments: Array.isArray(attachments) ? attachments : [],
        status: initialStatus,
        submittedById: session.user.id,
        credits: {
          create: Array.isArray(credits)
            ? credits.map((c: { creditName: string; role?: string }) => ({
                creditName: c.creditName,
                role: c.role ?? null,
              }))
            : [],
        },
      },
      include: { credits: true },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    console.error("[projects] POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
