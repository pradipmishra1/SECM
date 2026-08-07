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
    return NextResponse.json({ error: "Only students can join challenges" }, { status: 403 });
  }

  const existing = await prisma.participation.findFirst({
    where: { challengeId: id, userId: user.id },
  });

  if (existing) {
    return NextResponse.json({ error: "Already joined" }, { status: 400 });
  }

  const body = await req.json();

  const participation = await prisma.participation.create({
    data: {
      challengeId: id,
      userId: user.id,
      joinType: body.joinType || "SOLO",
      status: "ACTIVE",
    },
  });

  return NextResponse.json({ participation });
}