import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const myTeamIds = (await prisma.team.findMany({ where: { members: { some: { userId } } }, select: { id: true } })).map((t) => t.id);

  const unseenWins = await prisma.winner.findMany({
    where: { seen: false, submission: { OR: [{ userId }, { teamId: { in: myTeamIds } }] } },
    include: { challenge: { include: { organizer: true } } },
    orderBy: { announcedAt: "desc" },
  });

  return NextResponse.json({ wins: unseenWins });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json();
  await prisma.winner.update({ where: { id: body.winnerId }, data: { seen: true } });

  return NextResponse.json({ success: true });
}