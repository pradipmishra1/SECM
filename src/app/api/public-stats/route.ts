import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalChallenges, totalStudents, totalSubmissions, reviewedSubmissions, totalOrganizers] =
    await Promise.all([
      prisma.challenge.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.submission.count(),
      prisma.review.count(),
      prisma.organizerProfile.count(),
    ]);

  const reviewRate = totalSubmissions > 0 ? Math.round((reviewedSubmissions / totalSubmissions) * 100) : 0;

  return NextResponse.json({ totalChallenges, totalStudents, reviewRate, totalOrganizers });
}