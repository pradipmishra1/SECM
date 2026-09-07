import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ challenges: [], users: [] });
  }

  const [challenges, users] = await Promise.all([
    prisma.challenge.findMany({
      where: {
        status: "PUBLISHED",
        title: { contains: q, mode: "insensitive" },
      },
      select: { id: true, title: true, type: true },
      take: 5,
    }),
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { username: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, username: true, image: true },
      take: 5,
    }),
  ]);

  return NextResponse.json({ challenges, users });
}