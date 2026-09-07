import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// Send a friend request
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { targetUserId } = body;
  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
  }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userId, addresseeId: targetUserId },
        { requesterId: targetUserId, addresseeId: userId },
      ],
    },
  });
  if (existing) {
    return NextResponse.json({ error: "A friend request already exists" }, { status: 400 });
  }

  const friendship = await prisma.friendship.create({
    data: { requesterId: userId, addresseeId: targetUserId, status: "PENDING" },
  });

  const requester = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await createNotification({
    userId: targetUserId,
    type: "FRIEND_REQUEST",
    title: "New friend request",
    message: `${requester?.name} sent you a friend request`,
    link: "/dashboard/friends",
  });

  return NextResponse.json({ friendship });
}

// List incoming pending requests + current friends
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const [incoming, friends] = await Promise.all([
    prisma.friendship.findMany({
      where: { addresseeId: userId, status: "PENDING" },
      include: { requester: { select: { id: true, name: true, username: true, image: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendship.findMany({
      where: { status: "ACCEPTED", OR: [{ requesterId: userId }, { addresseeId: userId }] },
      include: {
        requester: { select: { id: true, name: true, username: true, image: true } },
        addressee: { select: { id: true, name: true, username: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const friendsList = friends.map((f) => (f.requesterId === userId ? f.addressee : f.requester));

  return NextResponse.json({ incoming, friends: friendsList });
}