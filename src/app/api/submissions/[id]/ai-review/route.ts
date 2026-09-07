import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runAiReviewForSubmission, checkOrganizerAiAccess } from "@/lib/aiReview";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can run AI review" }, { status: 403 });
  }

  const { allowed, organizerProfile } = await checkOrganizerAiAccess(user.id);
  if (!organizerProfile) {
    return NextResponse.json({ error: "Organizer profile not found" }, { status: 404 });
  }
  if (!allowed) {
    return NextResponse.json({ error: "AI Review is not enabled for your account" }, { status: 403 });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { challenge: { select: { organizerId: true, title: true } } },
  });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.challenge.organizerId !== organizerProfile.id) {
    return NextResponse.json({ error: "This submission doesn't belong to your challenge" }, { status: 403 });
  }
  if (!submission.fileUrl) {
    return NextResponse.json({ error: "This submission has no file to review" }, { status: 400 });
  }

  try {
    const result = await runAiReviewForSubmission(id, submission.challenge.title, submission.fileUrl);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI review failed" }, { status: 500 });
  }
}