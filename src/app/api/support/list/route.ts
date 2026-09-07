import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const messages = await prisma.supportMessage.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, username: true, role: true } } },
  });

  return NextResponse.json({ messages });
}