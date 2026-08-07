import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q") || "";

  if (q.length < 2) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q, mode: "insensitive" },
      NOT: { id: (session.user as any).id },
    },
    select: { id: true, name: true, username: true, role: true, organizerProfile: { select: { isVerified: true } } },
    take: 10,
  });

  const mapped = users.map((u) => ({
    id: u.id,
    name: u.name,
    username: u.username,
    role: u.role,
    isVerified: u.organizerProfile?.isVerified || false,
  }));

  return NextResponse.json({ users: mapped });
}