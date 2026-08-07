import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const announcements = await prisma.announcement.findMany({
    include: { organizer: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ announcements });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;

  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can post announcements" }, { status: 403 });
  }

  const organizerProfile = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
  if (!organizerProfile) return NextResponse.json({ error: "Organizer profile not found" }, { status: 400 });

  const body = await req.json();
  if (!body.title?.trim() || !body.message?.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: { organizerId: organizerProfile.id, title: body.title.trim(), message: body.message.trim() },
  });

  return NextResponse.json({ announcement });
}