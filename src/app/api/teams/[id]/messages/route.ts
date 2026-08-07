import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const membership = await prisma.teamMember.findFirst({ where: { teamId: id, userId } });
  if (!membership) return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });

  const messages = await prisma.teamMessage.findMany({
    where: { teamId: id },
    include: { sender: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const membership = await prisma.teamMember.findFirst({ where: { teamId: id, userId } });
  if (!membership) return NextResponse.json({ error: "Not a member of this team" }, { status: 403 });

  const body = await req.json();
  if (!body.content?.trim()) return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });

  const message = await prisma.teamMessage.create({
    data: { teamId: id, senderId: userId, content: body.content.trim() },
    include: { sender: true },
  });

  return NextResponse.json({ message });
}