import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { action } = body; // "accept" | "decline"

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship || friendship.addresseeId !== userId) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  if (action === "accept") {
    const updated = await prisma.friendship.update({
      where: { id },
      data: { status: "ACCEPTED" },
    });

    const addressee = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    await createNotification({
      userId: friendship.requesterId,
      type: "FRIEND_REQUEST_ACCEPTED",
      title: "Friend request accepted",
      message: `${addressee?.name} accepted your friend request`,
      link: "/dashboard/messages",
    });

    return NextResponse.json({ friendship: updated });
  }

  if (action === "decline") {
    await prisma.friendship.delete({ where: { id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// Unfriend
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const userId = (session.user as any).id;

  const friendship = await prisma.friendship.findUnique({ where: { id } });
  if (!friendship || (friendship.requesterId !== userId && friendship.addresseeId !== userId)) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  await prisma.friendship.delete({ where: { id } });
  return NextResponse.json({ success: true });
}