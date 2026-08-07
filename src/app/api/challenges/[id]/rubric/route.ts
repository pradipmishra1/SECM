import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const criteria = await prisma.rubricCriterion.findMany({
    where: { challengeId: id },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ criteria });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;

  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can set rubric criteria" }, { status: 403 });
  }

  const body = await req.json();
  const criteriaList: { name: string; maxScore: number }[] = body.criteria || [];

  await prisma.rubricCriterion.deleteMany({ where: { challengeId: id } });

  const created = await prisma.$transaction(
    criteriaList.map((c, i) =>
      prisma.rubricCriterion.create({
        data: { challengeId: id, name: c.name, maxScore: c.maxScore || 10, order: i },
      })
    )
  );

  return NextResponse.json({ criteria: created });
}