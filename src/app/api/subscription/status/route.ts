import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    include: { subscription: true },
  });

  const sub = organizerProfile?.subscription;
  const active = !!sub && sub.status === "ACTIVE" && sub.expiresAt > new Date();

  return NextResponse.json({ active });
}