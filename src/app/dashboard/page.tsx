import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { cache } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import { auth } from "@/lib/auth";
import WinnerCelebration from "@/components/WinnerCelebration";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import StudentDashboard from "@/components/StudentDashboard";
import OrganizerDashboard from "@/components/OrganizerDashboard";

const getSession = cache(async () => {
  return await auth.api.getSession({ headers: await headers() });
});

const getOrganizerData = cache(async (userId: string) => {
 const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId },
    select: { id: true, isVerified: true, orgName: true },
  });

  if (!organizerProfile) {
    redirect("/dashboard/setup-profile");
  }

const [challenges, pendingReviews, recentSubmissions, pendingChallenges] = await Promise.all([
    prisma.challenge.findMany({
      where: { organizerId: organizerProfile.id },
      select: {
        id: true,
        title: true,
        type: true,
        deadline: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            participations: true,
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.count({
      where: {
        challenge: { organizerId: organizerProfile.id },
        review: null,
      },
    }),
    prisma.submission.findMany({
      where: { challenge: { organizerId: organizerProfile.id } },
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: { user: true, team: true, challenge: { select: { title: true } } },
    }),
    prisma.submission.findMany({
      where: { challenge: { organizerId: organizerProfile.id }, review: null },
      select: { challengeId: true },
      distinct: ["challengeId"],
    }),
  ]);

  const totalChallenges = challenges.length;
  const activeEvents = challenges.filter((c) => c.status === "PUBLISHED").length;
  const totalSubmissions = challenges.reduce((sum, c) => sum + c._count.submissions, 0);

  const mappedChallenges = challenges.map((c) => ({
    ...c,
    participations: Array(c._count.participations).fill(null),
    teams: Array(c._count.participations).fill(null),
  }));

  const activity = recentSubmissions.map((s) => ({
    text: `${s.user?.name || s.team?.name || "Someone"} submitted to '${s.challenge.title}'`,
    time: new Date(s.submittedAt).toLocaleDateString(),
  }));

  const pendingChallengeIds = pendingChallenges.map((p) => p.challengeId);

  return {
    stats: { totalChallenges, activeEvents, totalSubmissions, pendingReviews },
    challenges: mappedChallenges,
    activity,
    isVerified: organizerProfile.isVerified,
    orgName: organizerProfile.orgName,
    pendingChallengeIds,
  };
});

const getStudentData = cache(async (userId: string) => {
  const [challenges, participations, teamsLed, submissions, wins, studentProfile, mySubmissionDates] = await Promise.all([
    prisma.challenge.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        type: true,
        description: true,
        deadline: true,
        prize: true,
        status: true,
        createdAt: true,
        organizer: {
          select: { orgName: true },
        },
        tags: { select: { id: true, name: true } },
        teams: {
          select: { id: true, name: true, leaderId: true },
        },
        _count: {
          select: { participations: true, submissions: true },
        },
      },
      orderBy: { deadline: "asc" },
    }),
    prisma.participation.findMany({
      where: { userId },
      select: { challengeId: true },
    }),
    prisma.team.count({ where: { leaderId: userId } }),
    prisma.submission.count({ where: { userId } }),
    prisma.winner.count({ where: { submission: { userId } } }),
    prisma.studentProfile.findUnique({ where: { userId }, select: { skills: true, interests: true } }),
    prisma.submission.findMany({ where: { userId }, select: { submittedAt: true }, orderBy: { submittedAt: "desc" } }),
  ]);

  const joinedIds = new Set(participations.map((p) => p.challengeId));

  // Upcoming deadlines: challenges the student has joined, not yet past deadline
  const upcomingDeadlines = challenges
    .filter((c) => joinedIds.has(c.id) && new Date(c.deadline).getTime() > Date.now())
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Recommended: challenges the student hasn't joined, matched by tag name against their skills/interests
  const mySkillWords = [...(studentProfile?.skills || []), ...(studentProfile?.interests || [])].map((s) => s.toLowerCase());
  const recommended = challenges
    .filter((c) => !joinedIds.has(c.id) && new Date(c.deadline).getTime() > Date.now())
    .map((c) => {
      const tagNames = c.tags.map((t) => t.name.toLowerCase());
      const matchCount = mySkillWords.length > 0 ? tagNames.filter((t) => mySkillWords.some((s) => t.includes(s) || s.includes(t))).length : 0;
      return { ...c, matchCount };
    })
    .sort((a, b) => b.matchCount - a.matchCount || new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  // Streak: consecutive days (including today) with at least one submission
  let streak = 0;
  if (mySubmissionDates.length > 0) {
    const daySet = new Set(mySubmissionDates.map((s) => new Date(s.submittedAt).toDateString()));
    let cursor = new Date();
    while (daySet.has(cursor.toDateString())) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return {
    challenges,
    stats: {
      activeChallenges: participations.length,
      teams: teamsLed,
      submissions,
      wins,
    },
    upcomingDeadlines,
    recommended,
    streak,
  };
});

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = session.user as any;

  const { getAccountStatus } = await import("@/lib/getBlockedStatus");
  const status = await getAccountStatus(user.id);
  if (status !== "ACTIVE") {
    redirect(`/account-blocked?status=${status}`);
  }

if (user.role === "ADMIN") {
    return (
      <DashboardLayout role={user.role} userName={user.name}>
        <AdminDashboard userName={user.name} />
      </DashboardLayout>
    );
  }

  if (user.role === "ORGANIZER") {
    const data = await getOrganizerData(user.id);
    return (
      <DashboardLayout role={user.role} userName={user.name}>
        <OrganizerDashboard userName={user.name} stats={data.stats} challenges={data.challenges} activity={data.activity} isVerified={data.isVerified} orgName={data.orgName} pendingChallengeIds={data.pendingChallengeIds} />
      </DashboardLayout>
    );
  }





const data = await getStudentData(user.id);

  const recentSubs = await prisma.submission.findMany({
    orderBy: { submittedAt: "desc" },
    take: 5,
    include: { user: true, team: true, challenge: true },
  });
  const activity = recentSubs.map((s) => ({
    text: `${s.user?.name || s.team?.name || "Someone"} submitted to '${s.challenge.title}'`,
    time: new Date(s.submittedAt).toLocaleDateString(),
  }));

  const { computeLeaderboard } = await import("@/lib/leaderboard");
  const board = await computeLeaderboard();

 return (
  <DashboardLayout role={user.role} userName={user.name}>
    <WinnerCelebration username={user.username} />
    <StudentDashboard
      userName={user.name}
      stats={data.stats}
      challenges={data.challenges}
      leaderboard={board}
      activity={activity}
      upcomingDeadlines={data.upcomingDeadlines}
      recommended={data.recommended}
      streak={data.streak}
    />
  </DashboardLayout>
);
}