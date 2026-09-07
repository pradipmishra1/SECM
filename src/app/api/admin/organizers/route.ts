import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Admins only" }, { status: 403 });

  const organizers = await prisma.organizerProfile.findMany({
    include: {
            user: { select: { id: true, name: true, email: true, username: true, image: true, createdAt: true } },
      _count: { select: { challenges: true } },
    },
    orderBy: { user: { createdAt: "desc" } },
  });

  return NextResponse.json({ organizers });
}