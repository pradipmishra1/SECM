import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const [followers, following] = await Promise.all([
    prisma.follow.findMany({
      where: { followingId: userId },
      include: { follower: { select: { id: true, name: true, username: true, image: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.follow.findMany({
      where: { followerId: userId },
      include: { followingUser: { select: { id: true, name: true, username: true, image: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    followers: followers.map((f) => f.follower),
    following: following.map((f) => f.followingUser),
  });
}