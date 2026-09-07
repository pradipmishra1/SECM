import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

// Follow a user
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { targetUserId } = body;
  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
  }

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId: targetUserId } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already following" }, { status: 400 });
  }

  await prisma.follow.create({
    data: { followerId: userId, followingId: targetUserId },
  });

  const follower = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
  await createNotification({
    userId: targetUserId,
    type: "NEW_FOLLOWER",
    title: "New follower",
    message: `${follower?.name} started following you`,
    link: "/dashboard/friends",
  });

  return NextResponse.json({ success: true });
}

// Unfollow a user
export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("targetUserId");
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
  }

  await prisma.follow.deleteMany({
    where: { followerId: userId, followingId: targetUserId },
  });

  return NextResponse.json({ success: true });
}