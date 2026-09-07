import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const subject = (body.subject || "").trim();
  const message = (body.message || "").trim();

  if (!subject || !message) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  const created = await prisma.supportMessage.create({
    data: {
      userId: session.user.id,
      subject,
      message,
    },
  });

  return NextResponse.json({ success: true, id: created.id });
}