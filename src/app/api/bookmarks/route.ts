import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    select: { challengeId: true },
  });

  return NextResponse.json({ challengeIds: bookmarks.map((b) => b.challengeId) });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { challengeId } = await req.json();
  if (!challengeId) return NextResponse.json({ error: "challengeId required" }, { status: 400 });

  const existing = await prisma.bookmark.findUnique({
    where: { userId_challengeId: { userId: session.user.id, challengeId } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  } else {
    await prisma.bookmark.create({ data: { userId: session.user.id, challengeId } });
    return NextResponse.json({ bookmarked: true });
  }
}