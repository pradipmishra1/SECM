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
    return NextResponse.json({ error: "Only students can create teams" }, { status: 403 });
  }

  const existingParticipation = await prisma.participation.findFirst({
    where: { challengeId: id, userId: user.id },
  });

  if (existingParticipation) {
    return NextResponse.json({ error: "You've already joined this challenge" }, { status: 400 });
  }

  const body = await req.json();

  if (!body.name) {
    return NextResponse.json({ error: "Team name is required" }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      challengeId: id,
      leaderId: user.id,
      name: body.name,
      members: {
        create: { userId: user.id, role: "LEADER" },
      },
    },
  });

  await prisma.participation.create({
    data: { challengeId: id, userId: user.id, joinType: "TEAM", status: "ACTIVE" },
  });

  return NextResponse.json({ team });
}