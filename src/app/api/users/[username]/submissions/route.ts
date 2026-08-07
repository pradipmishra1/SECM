import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const myTeamIds = (await prisma.team.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } })).map((t) => t.id);

  const submissions = await prisma.submission.findMany({
    where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] },
    include: { challenge: true },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json({ submissions });
}