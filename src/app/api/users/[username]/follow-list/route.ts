import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [followers, following] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: user.id },
      include: { follower: { select: { id: true, name: true, username: true, image: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.findMany({
      where: { followerId: user.id },
      include: { followingUser: { select: { id: true, name: true, username: true, image: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    followers: followers.map((f) => f.follower),
    following: following.map((f) => f.followingUser),
  });
}