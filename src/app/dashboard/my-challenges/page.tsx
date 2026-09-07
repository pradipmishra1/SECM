import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import MyChallengesList from "@/components/MyChallengesList";

export default async function MyChallengesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  let challenges: any[] = [];
  let joinedIds: string[] = [];
  let organizersWithChallenges: any[] = [];

  if (user.role === "ORGANIZER") {
    const organizerProfile = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
    challenges = organizerProfile
      ? await prisma.challenge.findMany({
          where: { organizerId: organizerProfile.id },
          include: {
            organizer: true,
            teams: true,
            participations: true,
            _count: { select: { submissions: true, participations: true } },
          },
          orderBy: { createdAt: "desc" },
        })
      : [];


  } else {
    const myBookmarkIds = (
      await prisma.bookmark.findMany({ where: { userId: user.id }, select: { challengeId: true } })
    ).map((b) => b.challengeId);

    const [rawChallenges, myParticipations, myTeamsPerChallenge] = await Promise.all([
      prisma.challenge.findMany({
        where: {
          OR: [{ status: "PUBLISHED" }, { id: { in: myBookmarkIds } }],
        },
        include: { organizer: true, teams: true },
        orderBy: { deadline: "asc" },
      }),
      prisma.participation.findMany({
        where: { userId: user.id },
        select: { challengeId: true },
      }),
      prisma.team.findMany({
        where: { members: { some: { userId: user.id } } },
        select: { id: true, name: true, challengeId: true },
      }),
    ]);

    organizersWithChallenges = Array.from(
      new Map(
        rawChallenges.map((c: any) => [
          c.organizer.id,
          { id: c.organizer.id, orgName: c.organizer.orgName, isVerified: c.organizer.isVerified },
        ])
      ).values()
    );
    joinedIds = myParticipations.map((p) => p.challengeId);
    const myTeamIds = myTeamsPerChallenge.map((t) => t.id);

    const mySubmissions = await prisma.submission.findMany({
      where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] },
      select: { challengeId: true },
    });
    const submittedIds = new Set(mySubmissions.map((s) => s.challengeId));
    const teamByChallengeId = new Map(myTeamsPerChallenge.map((t) => [t.challengeId, t]));
    challenges = rawChallenges.map((c: any) => ({
      ...c,
      hasSubmitted: submittedIds.has(c.id),
      myTeamForThisChallenge: teamByChallengeId.get(c.id) || null,
    }));
  }

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        My Challenges
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>
        {user.role === "ORGANIZER" ? "Manage the challenges you've created." : "Browse and manage your challenges."}
      </p>
      <MyChallengesList
  challenges={JSON.parse(JSON.stringify(challenges))}
  role={user.role}
  joinedIds={joinedIds}
  currentUserId={user.id}
/>
    </DashboardLayout>
  );
}