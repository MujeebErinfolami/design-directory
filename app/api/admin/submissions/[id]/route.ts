import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ProjectStatus } from "@prisma/client";

interface Params { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    let body: { action: "approve" | "reject"; reason?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { action, reason } = body;
    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "action must be approve or reject" }, { status: 400 });
    }

    const status: ProjectStatus = action === "approve" ? "approved" : "rejected";

    const project = await prisma.project.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedById: session.user.id,
        rejectionReason: action === "reject" ? (reason ?? null) : null,
      },
      select: { id: true, title: true, status: true, submittedById: true, slug: true },
    });

    // Notify the submitter
    await prisma.notification.create({
      data: {
        userId: project.submittedById,
        type: action === "approve" ? "submission_approved" : "submission_rejected",
        title: action === "approve"
          ? `"${project.title}" has been approved`
          : `"${project.title}" was not approved`,
        body: action === "approve"
          ? "Your project is now live on Rightstar Collective."
          : reason
          ? `Reason: ${reason}`
          : "Your project did not meet the submission guidelines.",
        link: action === "approve" ? `/projects/${project.slug}` : "/submissions",
      },
    });

    return NextResponse.json(project);
  } catch (err) {
    console.error("[admin/submissions] PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
