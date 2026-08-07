import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const userId = (session.user as any).id;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender: { include: { organizerProfile: true } },
      receiver: { include: { organizerProfile: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, any>();

  for (const m of messages) {
    const otherUser = m.senderId === userId ? m.receiver : m.sender;

    if (!map.has(otherUser.id)) {
      map.set(otherUser.id, {
        userId: otherUser.id,
        name: otherUser.name,
        username: otherUser.username,
        role: otherUser.role,
        isVerified: otherUser.organizerProfile?.isVerified || false,
        lastMessage: m.content,
        lastAt: m.createdAt,
        unread: m.receiverId === userId && !m.read,
      });
    }
  }

  return NextResponse.json({ conversations: Array.from(map.values()) });
}