import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const team = await prisma.team.findUnique({ where: { id }, include: { members: true } });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  if (team.leaderId !== userId) {
    return NextResponse.json({ error: "Only the team leader can invite members" }, { status: 403 });
  }

  const body = await req.json();
  const invitedUser = await prisma.user.findUnique({ where: { username: body.username } });
  if (!invitedUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (team.members.some((m) => m.userId === invitedUser.id)) {
    return NextResponse.json({ error: "This user is already in the team" }, { status: 400 });
  }

  const existingInvite = await prisma.teamInvite.findFirst({
    where: { teamId: id, invitedUserId: invitedUser.id, status: "PENDING" },
  });
  if (existingInvite) {
    return NextResponse.json({ error: "Invite already sent" }, { status: 400 });
  }

  const invite = await prisma.teamInvite.create({
    data: { teamId: id, invitedUserId: invitedUser.id, invitedById: userId },
  });

  return NextResponse.json({ invite });
}