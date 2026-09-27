import { prisma } from "@/lib/prisma";

export async function isMutualFollow(userIdA: string, userIdB: string): Promise<boolean> {
  const [aFollowsB, bFollowsA] = await Promise.all([
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userIdA, followingId: userIdB } },
    }),
    prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: userIdB, followingId: userIdA } },
    }),
  ]);
  return !!aFollowsB && !!bFollowsA;
}

export async function getMutualFollowers(userId: string) {
  const [following, followers] = await Promise.all([
    prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } }),
    prisma.follow.findMany({ where: { followingId: userId }, select: { followerId: true } }),
  ]);

  const followingIds = new Set(following.map((f) => f.followingId));
  const mutualIds = followers
    .map((f) => f.followerId)
    .filter((id) => followingIds.has(id));

  if (mutualIds.length === 0) return [];

  return prisma.user.findMany({
    where: { id: { in: mutualIds } },
    select: { id: true, name: true, username: true, image: true },
  });
}