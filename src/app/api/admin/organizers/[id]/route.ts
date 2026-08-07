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

  const body = await req.json();
  const updated = await prisma.organizerProfile.update({
    where: { id },
    data: { isVerified: !!body.isVerified },
  });

  if (body.isVerified) {
    await prisma.challenge.updateMany({
      where: { organizerId: id, status: "DRAFT" },
      data: { status: "PUBLISHED" },
    });
  }

  return NextResponse.json({ organizer: updated });
}