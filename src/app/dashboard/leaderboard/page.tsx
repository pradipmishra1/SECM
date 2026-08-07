import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import LeaderboardView from "@/components/LeaderboardView";

const BONUS = { 1: 100, 2: 60, 3: 30 } as Record<number, number>;

async function computeLeaderboard(challengeId?: string) {
  const submissions = await prisma.submission.findMany({
    where: challengeId ? { challengeId } : {},
    include: {
      user: true,
      team: { include: { members: { include: { user: true } } } },
      review: true,
      winner: true,
    },
  });

  const points: Record<string, { name: string; points: number }> = {};

  for (const s of submissions) {
    const base = s.review?.score || 0;
    const bonus = s.winner ? BONUS[s.winner.position] || 0 : 0;
    const total = base + bonus;

    if (s.user) {
      points[s.user.id] = points[s.user.id] || { name: s.user.name, points: 0 };
      points[s.user.id].points += total;
    } else if (s.team) {
      for (const m of s.team.members) {
        points[m.user.id] = points[m.user.id] || { name: m.user.name, points: 0 };
        points[m.user.id].points += total;
      }
    }
  }

  return Object.values(points).sort((a, b) => b.points - a.points);
}

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  const globalBoard = await computeLeaderboard();

  const challenges = await prisma.challenge.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Leaderboard
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>
        Ranked by review scores plus winner bonuses (+100 / +60 / +30).
      </p>
      <LeaderboardView globalBoard={globalBoard} challenges={challenges} currentUserName={user.name} />
    </DashboardLayout>
  );
}