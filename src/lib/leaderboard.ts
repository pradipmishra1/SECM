import { prisma } from "@/lib/prisma";
const BONUS: Record<number, number> = { 1: 100, 2: 60, 3: 30 };
export async function computeLeaderboard(challengeId?: string) {


   const baseWhere = challengeId ? { challengeId } : {};
  const submissions = await prisma.submission.findMany({
    where: {
      ...baseWhere,
      OR: [{ review: { isNot: null } }, { winner: { isNot: null } }],
    },
    select: {
      user: { select: { id: true, name: true, image: true, username: true } },
      team: { select: { members: { select: { user: { select: { id: true, name: true, image: true, username: true } } } } } },
      review: { select: { score: true } },
      winner: { select: { position: true } },
    },
  });
  const points: Record<string, { name: string; points: number; image: string | null; username: string | null }> = {};
  for (const s of submissions) {
    const base = s.review?.score || 0;
    const bonus = s.winner ? BONUS[s.winner.position] || 0 : 0;
    const total = base + bonus;
    if (s.user) {
      points[s.user.id] = points[s.user.id] || { name: s.user.name, points: 0, image: s.user.image, username: s.user.username };
      points[s.user.id].points += total;
    } else if (s.team) {
      for (const m of s.team.members) {
        points[m.user.id] = points[m.user.id] || { name: m.user.name, points: 0, image: m.user.image, username: m.user.username };
        points[m.user.id].points += total;
      }
    }
  }
  return Object.values(points).sort((a, b) => b.points - a.points);
}