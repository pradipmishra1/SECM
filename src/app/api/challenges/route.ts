import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = session.user as any;

  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can create challenges" }, { status: 403 });
  }

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
  });
  if (!organizerProfile) {
    return NextResponse.json(
      { error: "Please complete your organizer profile first" },
      { status: 400 }
    );
  }

  const isVerified = organizerProfile.isVerified;

  const body = await req.json();
  const { title, type, description, rules, deadline, prizeFirst, prizeSecond, prizeThird, maxTeamSize, tags } = body;
  if (!title || !type || !deadline) {
    return NextResponse.json({ error: "Title, type, and deadline are required" }, { status: 400 });
  }
  const challenge = await prisma.challenge.create({
    data: {
      title,
      type,
      description,
      rules,
      deadline: new Date(deadline),
      prize: prizeFirst || null,
      prizeFirst: prizeFirst || null,
      prizeSecond: prizeSecond || null,
      prizeThird: prizeThird || null,
      maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : null,
      status: isVerified ? "PUBLISHED" : "DRAFT",
      organizerId: organizerProfile.id,
      tags: {
        create: (tags || []).map((name: string) => ({ name })),
      },
    },
  });

  return NextResponse.json({ challenge });
}