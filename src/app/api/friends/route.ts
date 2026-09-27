import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { getMutualFollowers } from "@/lib/mutualFollow";

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


// List mutual followers ("friends") with a shared challenge if any
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const friendsList = await getMutualFollowers(userId);

  const myChallengeIds = (
    await prisma.participation.findMany({
      where: { userId },
      select: { challengeId: true },
    })
  ).map((p) => p.challengeId);

  const enriched = await Promise.all(
    friendsList.map(async (f: any) => {
      if (myChallengeIds.length === 0) return { ...f, mutualChallenge: null };
      const shared = await prisma.participation.findFirst({
        where: { userId: f.id, challengeId: { in: myChallengeIds } },
        select: { challenge: { select: { title: true } } },
      });
      return { ...f, mutualChallenge: shared?.challenge.title || null };
    })
  );

  return NextResponse.json({ incoming: [], friends: enriched });
}