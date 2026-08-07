import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const [totalUsers, totalStudents, totalOrganizers, pendingVerifications, totalChallenges, totalSubmissions, totalWinners] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.organizerProfile.count({ where: { isVerified: false } }),
    prisma.challenge.count(),
    prisma.submission.count(),
    prisma.winner.count(),
  ]);

  return NextResponse.json({
    totalUsers,
    totalStudents,
    totalOrganizers,
    pendingVerifications,
    totalChallenges,
    totalSubmissions,
    totalWinners,
  });
}