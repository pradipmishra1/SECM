import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const invite = await prisma.teamInvite.findUnique({ where: { id } });
  if (!invite || invite.invitedUserId !== userId) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }
  if (invite.status !== "PENDING") {
    return NextResponse.json({ error: "Invite already responded to" }, { status: 400 });
  }

  const body = await req.json();

  if (body.accept) {
    await prisma.teamMember.create({
      data: { teamId: invite.teamId, userId, role: "MEMBER" },
    });
    await prisma.teamInvite.update({ where: { id }, data: { status: "ACCEPTED" } });
  } else {
    await prisma.teamInvite.update({ where: { id }, data: { status: "REJECTED" } });
  }

  return NextResponse.json({ success: true });
}