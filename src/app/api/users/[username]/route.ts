import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePrizeAmount } from "@/lib/prizeMoney";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const currentUserId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      studentProfile: true,
      organizerProfile: true,
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const isOwner = user.id === currentUserId;

  let stats;
  let history: any = undefined;

  if (user.role === "ORGANIZER" && user.organizerProfile) {
    const [challengesCreated, submissionsReceived, winnersAnnounced] = await Promise.all([
      prisma.challenge.count({ where: { organizerId: user.organizerProfile.id } }),
      prisma.submission.count({ where: { challenge: { organizerId: user.organizerProfile.id } } }),
      prisma.winner.count({ where: { challenge: { organizerId: user.organizerProfile.id } } }),
    ]);
    stats = { challengesCreated, submissionsReceived, winnersAnnounced };

    if (isOwner) {
      const myChallenges = await prisma.challenge.findMany({
        where: { organizerId: user.organizerProfile.id },
        select: { id: true, title: true, type: true, status: true, deadline: true, createdAt: true, _count: { select: { submissions: true } } },
        orderBy: { createdAt: "desc" },
      });
      history = { challengesCreated: myChallenges };
    }
  } else {
    const myTeamIds = (
      await prisma.team.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } })
    ).map((t) => t.id);


    const [winsCount, firstPlaceCount, secondPlaceCount, thirdPlaceCount, submissionsCount, challengesJoined, allWinsForMoney] = await Promise.all([
      prisma.winner.count({ where: { submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } } }),
      prisma.winner.count({ where: { position: 1, submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } } }),
      prisma.winner.count({ where: { position: 2, submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } } }),
      prisma.winner.count({ where: { position: 3, submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } } }),
      prisma.submission.count({ where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } }),
      prisma.participation.count({ where: { userId: user.id } }),
      prisma.winner.findMany({
        where: { submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } },
        include: { challenge: { select: { prizeFirst: true, prizeSecond: true, prizeThird: true } } },
      }),
    ]);

    const totalWinnings = allWinsForMoney.reduce((sum, w) => {
      const prizeStr = w.position === 1 ? w.challenge.prizeFirst : w.position === 2 ? w.challenge.prizeSecond : w.challenge.prizeThird;
      return sum + parsePrizeAmount(prizeStr);
    }, 0);

    stats = { winsCount, submissionsCount, challengesJoined, firstPlaceCount, secondPlaceCount, thirdPlaceCount, totalWinnings };

    if (isOwner) {
      const mySubmissions = await prisma.submission.findMany({
        where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] },
        select: {
          id: true,
          submittedAt: true,
          challenge: { select: { id: true, title: true, type: true } },
          review: { select: { score: true } },
          winner: { select: { position: true } },
        },
        orderBy: { submittedAt: "desc" },
      });
      history = { submissions: mySubmissions };
    }
  }

     let friendStatus = "SELF";
  let followStatus = { isFollowing: false, followsYou: false };
  let followerCount = 0;
  let followingCount = 0;
  let friendshipId: string | null = null;

  if (!isOwner) {
    const { getFriendStatus, getFollowStatus } = await import("@/lib/friends");
    [friendStatus, followStatus] = await Promise.all([
      getFriendStatus(currentUserId, user.id),
      getFollowStatus(currentUserId, user.id),
    ]);

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: currentUserId, addresseeId: user.id },
          { requesterId: user.id, addresseeId: currentUserId },
        ],
      },
      select: { id: true },
    });
    friendshipId = friendship?.id || null;
  }

  [followerCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: user.id } }),
    prisma.follow.count({ where: { followerId: user.id } }),
  ]);

  const isMutualFollow = !!followStatus.isFollowing && !!followStatus.followsYou;

  return NextResponse.json({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    image: user.image,
    status: user.status,
    createdAt: user.createdAt,
      education: user.studentProfile?.education || null,
    skills: user.studentProfile?.skills || [],
    interests: user.studentProfile?.interests || [],
    bio: user.studentProfile?.bio || user.organizerProfile?.description || null,
    orgName: user.organizerProfile?.orgName || null,
    isVerified: user.organizerProfile?.isVerified || false,
    githubUrl: user.studentProfile?.githubUrl || user.organizerProfile?.githubUrl || null,
    linkedinUrl: user.studentProfile?.linkedinUrl || user.organizerProfile?.linkedinUrl || null,
    stats,
    isOwner,
    history,
       friendStatus,
    followStatus,
    followerCount,
    followingCount,
    friendshipId,
    isMutualFollow,
  });
}