import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/slugify";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session.user.accountType) {
      return NextResponse.json({ error: "Onboarding not complete" }, { status: 400 });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { title, subtitle, excerpt, coverImageUrl, category, contentBlocks, readTime } =
      body as any;

    if (!title?.trim()) {
      return NextResponse.json({ error: "title required" }, { status: 400 });
    }
    if (!contentBlocks || !Array.isArray(contentBlocks) || contentBlocks.length === 0) {
      return NextResponse.json({ error: "at least one content block required" }, { status: 400 });
    }

    // Derive excerpt from first paragraph block if not supplied
    const derivedExcerpt =
      excerpt?.trim() ||
      (contentBlocks.find((b: any) => b.type === "paragraph")?.content ?? "").slice(0, 200);

    // Determine author name from profile
    const userId = session.user.id;
    const profile =
      session.user.accountType === "designer"
        ? await prisma.designerProfile.findUnique({ where: { userId }, select: { displayName: true, title: true } })
        : await prisma.agencyProfile.findUnique({ where: { userId }, select: { displayName: true } });

    const authorName = profile?.displayName ?? session.user.name ?? "Anonymous";
    const authorTitle =
      session.user.accountType === "designer" && "title" in (profile ?? {})
        ? (profile as any).title ?? ""
        : "";

    const slug = await uniqueSlug(title, "blogPost");

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title: title.trim(),
        subtitle: subtitle?.trim() ?? "",
        excerpt: derivedExcerpt,
        body: "",
        coverImageUrl: coverImageUrl ?? "",
        contentBlocks: contentBlocks,
        category: category ?? "Process",
        authorName,
        authorTitle,
        readTime: readTime ?? "",
        featured: false,
        status: "pending",
        submittedById: userId,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error("[blog] POST error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
