import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      studentProfile: true,
      organizerProfile: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const myTeamIds = (
    await prisma.team.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } })
  ).map((t) => t.id);

  const winsCount = await prisma.winner.count({
    where: { submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } },
  });

  const submissionsCount = await prisma.submission.count({
    where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] },
  });

  const challengesJoined = await prisma.participation.count({ where: { userId: user.id } });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    education: user.studentProfile?.education || null,
    skills: user.studentProfile?.skills || [],
    interests: user.studentProfile?.interests || [],
    bio: user.studentProfile?.bio || user.organizerProfile?.description || null,
    orgName: user.organizerProfile?.orgName || null,
    isVerified: user.organizerProfile?.isVerified || false,
    stats: { winsCount, submissionsCount, challengesJoined },
  });
}