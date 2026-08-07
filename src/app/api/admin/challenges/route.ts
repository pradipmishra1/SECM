import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const challenges = await prisma.challenge.findMany({
    include: {
      organizer: { select: { orgName: true, isVerified: true } },
      _count: { select: { submissions: true, participations: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ challenges });
}