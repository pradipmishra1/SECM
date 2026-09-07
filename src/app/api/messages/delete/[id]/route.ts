import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const message = await prisma.message.findUnique({ where: { id } });
  if (!message || message.senderId !== userId) {
    return NextResponse.json({ error: "Message not found or not yours" }, { status: 404 });
  }

  await prisma.message.update({
    where: { id },
    data: { content: "This message was deleted" },
  });

  return NextResponse.json({ success: true });
}