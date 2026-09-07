import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = (session.user as any).id;

  const otherUser = await prisma.user.findUnique({
    where: { username },
    include: { organizerProfile: true },
  });

  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUser.id },
        { senderId: otherUser.id, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { senderId: otherUser.id, receiverId: userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({
    messages,
    otherUser: {
      id: otherUser.id,
      name: otherUser.name,
      username: otherUser.username,
      role: otherUser.role,
      image: otherUser.image,
      status: otherUser.status,
      isVerified: otherUser.organizerProfile?.isVerified || false,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = (session.user as any).id;

  const otherUser = await prisma.user.findUnique({ where: { username } });

  if (!otherUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();

  if (!body.content?.trim()) {
    return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { senderId: userId, receiverId: otherUser.id, content: body.content.trim() },
  });

  return NextResponse.json({ message });
}