import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;

  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "linkedin" },
  });

  return NextResponse.json({ connected: !!account });
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;

  const account = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "linkedin" },
  });
  if (!account) {
    return NextResponse.json({ error: "No LinkedIn account linked" }, { status: 400 });
  }

  return NextResponse.json({ connected: true });
}