import { prisma } from "@/lib/prisma";

export async function getFriendStatus(currentUserId: string, otherUserId: string) {
  if (currentUserId === otherUserId) return "SELF";

  const friendship = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: currentUserId, addresseeId: otherUserId },
        { requesterId: otherUserId, addresseeId: currentUserId },
      ],
    },
  });

  if (!friendship) return "NONE";
  if (friendship.status === "ACCEPTED") return "FRIENDS";
  if (friendship.status === "PENDING" && friendship.requesterId === currentUserId) return "REQUEST_SENT";
  if (friendship.status === "PENDING" && friendship.addresseeId === currentUserId) return "REQUEST_RECEIVED";
  return "NONE";
}

export async function getFollowStatus(currentUserId: string, otherUserId: string) {
  if (currentUserId === otherUserId) return { isFollowing: false, followsYou: false };

  const [following, followedBy] = await Promise.all([
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: currentUserId, followingId: otherUserId } } }),
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: otherUserId, followingId: currentUserId } } }),
  ]);

  return { isFollowing: !!following, followsYou: !!followedBy };
}