import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can announce winners" }, { status: 403 });
  }
  const body = await req.json();
  const position = parseInt(body.position);
  if (![1, 2, 3].includes(position)) {
    return NextResponse.json({ error: "Position must be 1, 2, or 3" }, { status: 400 });
  }
  const existingAtPosition = await prisma.winner.findFirst({
    where: { challengeId: body.challengeId, position },
  });
  if (existingAtPosition && existingAtPosition.submissionId !== id) {
    return NextResponse.json({ error: "That position is already taken for this challenge" }, { status: 400 });
  }
  const existingForSubmission = await prisma.winner.findUnique({ where: { submissionId: id } });
  let winner;
  if (existingForSubmission) {
    winner = await prisma.winner.update({
      where: { submissionId: id },
      data: { position },
    });
  } else {
    winner = await prisma.winner.create({
      data: { challengeId: body.challengeId, submissionId: id, position },
    });
  }
  return NextResponse.json({ winner });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can remove winners" }, { status: 403 });
  }

  const existing = await prisma.winner.findUnique({ where: { submissionId: id } });
  if (!existing) {
    return NextResponse.json({ error: "No winner record found" }, { status: 404 });
  }

  await prisma.winner.delete({ where: { submissionId: id } });
  return NextResponse.json({ success: true });
}