import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can review submissions" }, { status: 403 });
  }

  const body = await req.json();

  let finalScore: number;
  const criterionScores: { criterionId: string; score: number }[] = body.criterionScores || [];

  if (criterionScores.length > 0) {
    // Average the criterion scores, normalized to a 0-10 scale
    const criteria = await prisma.rubricCriterion.findMany({
      where: { id: { in: criterionScores.map((c) => c.criterionId) } },
    });
    let totalNormalized = 0;
    for (const cs of criterionScores) {
      const crit = criteria.find((c) => c.id === cs.criterionId);
      const max = crit?.maxScore || 10;
      totalNormalized += (cs.score / max) * 10;
    }
    finalScore = Math.round(totalNormalized / criterionScores.length);
  } else {
    finalScore = parseInt(body.score);
  }

  if (isNaN(finalScore) || finalScore < 0 || finalScore > 10) {
    return NextResponse.json({ error: "Score must be between 0 and 10" }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({ where: { submissionId: id } });

  let review;
  if (existing) {
    review = await prisma.review.update({
      where: { submissionId: id },
      data: { score: finalScore, feedback: body.feedback || null },
    });
    await prisma.criterionScore.deleteMany({ where: { reviewId: review.id } });
  } else {
    review = await prisma.review.create({
      data: { submissionId: id, organizerId: user.id, score: finalScore, feedback: body.feedback || null },
    });
  }

  if (criterionScores.length > 0) {
    await prisma.$transaction(
      criterionScores.map((cs) =>
        prisma.criterionScore.create({
          data: { reviewId: review.id, criterionId: cs.criterionId, score: cs.score },
        })
      )
    );
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: { challenge: { select: { title: true } }, team: { include: { members: true } } },
  });
  if (submission) {
    const recipients = submission.userId
      ? [submission.userId]
      : (submission.team?.members.map((m) => m.userId) || []);
    for (const recipientId of recipients) {
      await createNotification({
        userId: recipientId,
        type: "SUBMISSION_REVIEWED",
        title: "Submission reviewed",
        message: `Your submission for "${submission.challenge.title}" was reviewed — Score: ${finalScore}/10`,
        link: "/dashboard/submissions",
      });
    }
  }

  return NextResponse.json({ review });
}