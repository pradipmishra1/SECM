import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const flags = await prisma.featureFlag.findMany({ select: { key: true, enabled: true } });
  return NextResponse.json({ flags });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const user = session.user as any;
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const body = await req.json();
  const { key, enabled } = body;

  if (!key || typeof enabled !== "boolean") {
    return NextResponse.json({ error: "key and enabled are required" }, { status: 400 });
  }

  const flag = await prisma.featureFlag.upsert({
    where: { key },
    create: { key, enabled },
    update: { enabled },
  });

  return NextResponse.json({ flag });
}