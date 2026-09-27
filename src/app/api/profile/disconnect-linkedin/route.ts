import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;

  await prisma.account.deleteMany({
    where: { userId: user.id, providerId: "linkedin" },
  });

  if (user.role === "STUDENT") {
    await prisma.studentProfile.updateMany({
      where: { userId: user.id },
      data: { linkedinUrl: null },
    });
  } else if (user.role === "ORGANIZER") {
    await prisma.organizerProfile.updateMany({
      where: { userId: user.id },
      data: { linkedinUrl: null },
    });
  }

  return NextResponse.json({ success: true });
}