import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "STUDENT") {
    return NextResponse.json({ error: "Only students can submit" }, { status: 403 });
  }
  const body = await req.json();
  if (!body.fileUrl) {
    return NextResponse.json({ error: "A project link or file URL is required" }, { status: 400 });
  }
  const existing = await prisma.submission.findFirst({
    where: {
      challengeId: id,
      OR: [{ userId: user.id }, { teamId: body.teamId || undefined }],
    },
  });
  let submission;
  if (existing) {
    submission = await prisma.submission.update({
      where: { id: existing.id },
      data: { fileUrl: body.fileUrl, description: body.description },
    });
  } else {
    submission = await prisma.submission.create({
      data: {
        challengeId: id,
        userId: body.teamId ? null : user.id,
        teamId: body.teamId || null,
        fileUrl: body.fileUrl,
        description: body.description,
      },
    });
  }
  return NextResponse.json({ submission });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const submissions = await prisma.submission.findMany({
    where: { challengeId: id },
    include: {
      user: true,
      team: true,
      review: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}