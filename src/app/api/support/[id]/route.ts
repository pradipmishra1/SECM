import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status === "RESOLVED" ? "RESOLVED" : "OPEN";

  await prisma.supportMessage.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ success: true });
}