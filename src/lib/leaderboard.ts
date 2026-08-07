import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const BONUS: Record<number, number> = { 1: 100, 2: 60, 3: 30 };

export async function computeLeaderboard(challengeId?: string) {
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