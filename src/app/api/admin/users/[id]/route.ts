import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Admins only" }, { status: 403 });
  if (id === user.id) return NextResponse.json({ error: "You can't change your own account status" }, { status: 400 });

  const body = await req.json();
  const status = body.status;
  if (!["ACTIVE", "SUSPENDED", "DELETED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { status },
  });

  // Kill all active sessions immediately so the change takes effect right away,
  // not just on their next natural session expiry.
  if (status !== "ACTIVE") {
    await prisma.session.deleteMany({ where: { userId: id } });
  }

  return NextResponse.json({ user: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Admins only" }, { status: 403 });
  if (id === user.id) return NextResponse.json({ error: "You can't delete your own account" }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id },
    data: { status: "DELETED" },
  });

  await prisma.session.deleteMany({ where: { userId: id } });

  return NextResponse.json({ user: updated });
}