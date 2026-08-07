import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminProfile from "@/components/AdminProfile";
import DashboardLayout from 
"@/components/DashboardLayout";
import ProfileEditor from "@/components/ProfileEditor";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  const studentProfile = user.role === "STUDENT" ? await prisma.studentProfile.findUnique({ where: { userId: user.id } }) : null;
  const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { image: true } });
  const organizerProfile = user.role === "ORGANIZER" ? await prisma.organizerProfile.findUnique({ where: { userId: user.id } }) : null;

  let stats: any = { wins: 0, submissions: 0, challengesJoined: 0, teamsCount: 0 };
  let teams: any[] = [];
  let recentActivity: any[] = [];
  let recentChallenges: any[] = [];

  if (user.role === "STUDENT") {
    const myTeams = await prisma.team.findMany({
      where: { members: { some: { userId: user.id } } },
      include: { members: { include: { user: true } }, challenge: true },
    });
    const myTeamIds = myTeams.map((t) => t.id);

    const allWins = await prisma.winner.findMany({ where: { submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } } });
    const winsCount = allWins.length;
    const firstPlaceCount = allWins.filter((w) => w.position === 1).length;
    const secondPlaceCount = allWins.filter((w) => w.position === 2).length;
    const thirdPlaceCount = allWins.filter((w) => w.position === 3).length;
    const submissionsCount = await prisma.submission.count({ where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } });
    const challengesJoined = await prisma.participation.count({ where: { userId: user.id } });

    stats = { wins: winsCount, submissions: submissionsCount, challengesJoined, teamsCount: myTeams.length, firstPlaceCount, secondPlaceCount, thirdPlaceCount };
    teams = myTeams;

    const recentSubs = await prisma.submission.findMany({
      where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] },
      orderBy: { submittedAt: "desc" },
      take: 4,
      include: { challenge: true },
    });
    const recentWins = await prisma.winner.findMany({
      where: { submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } },
      orderBy: { announcedAt: "desc" },
      take: 3,
      include: { challenge: true },
    });

    recentActivity = [
      ...recentSubs.map((s) => ({ type: "submission", text: `Submitted to ${s.challenge.title}`, time: s.submittedAt })),
      ...recentWins.map((w) => ({ type: "win", text: `Won ${w.position === 1 ? "1st" : w.position === 2 ? "2nd" : "3rd"} place in ${w.challenge.title}`, time: w.announcedAt })),
    ]
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }

  if (user.role === "ORGANIZER" && organizerProfile) {
    const [totalChallenges, activeChallenges, totalSubmissions, totalParticipations, myChallenges] = await Promise.all([
      prisma.challenge.count({ where: { organizerId: organizerProfile.id } }),
      prisma.challenge.count({ where: { organizerId: organizerProfile.id, status: "PUBLISHED" } }),
      prisma.submission.count({ where: { challenge: { organizerId: organizerProfile.id } } }),
      prisma.participation.count({ where: { challenge: { organizerId: organizerProfile.id } } }),
      prisma.challenge.findMany({
        where: { organizerId: organizerProfile.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { _count: { select: { submissions: true, participations: true } } },
      }),
    ]);

    stats = {
      totalChallenges,
      activeChallenges,
      totalSubmissions,
      totalParticipations,
    };
    recentChallenges = myChallenges;
  }

 if (user.role === "ADMIN") {
    return (
      <DashboardLayout role={user.role} userName={user.name}>
        <AdminProfile user={{ name: user.name, email: user.email, username: user.username, image: fullUser?.image || null }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <ProfileEditor
        user={{ name: user.name, email: user.email, username: user.username, image: fullUser?.image || null }}
        role={user.role}
        studentProfile={JSON.parse(JSON.stringify(studentProfile))}
        organizerProfile={JSON.parse(JSON.stringify(organizerProfile))}
        stats={stats}
        teams={JSON.parse(JSON.stringify(teams))}
        recentActivity={JSON.parse(JSON.stringify(recentActivity))}
        recentChallenges={JSON.parse(JSON.stringify(recentChallenges))}
        currentUserId={user.id}
      />
    </DashboardLayout>
  );
}