import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user as any;
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status === "RESOLVED" ? "RESOLVED" : "OPEN";

  const existing = await prisma.supportMessage.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const wasAlreadyResolved = existing.status === "RESOLVED";

  await prisma.supportMessage.update({
    where: { id },
    data: { status },
  });

  if (status === "RESOLVED" && !wasAlreadyResolved) {
    try {
      await sendMail(
        existing.user.email,
        "Your SECM support request has been resolved",
        `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
            <h2 style="color:#14132B; margin-bottom: 8px;">Your issue has been resolved</h2>
            <p style="color:#555; font-size:14px; line-height:1.6;">
              Hi ${existing.user.name}, your support request has been marked as resolved by our team.
            </p>
            <div style="background:#F6F5FB; border-radius:10px; padding:14px 18px; margin-top:16px;">
              <p style="color:#14132B; font-size:13px; font-weight:700; margin:0 0 6px;">${existing.subject}</p>
              <p style="color:#666; font-size:12.5px; margin:0; white-space:pre-wrap;">${existing.message}</p>
            </div>
            <p style="color:#999; font-size:12px; margin-top:24px;">
              If your issue isn't actually fixed, feel free to submit a new request from the Help Center.
            </p>
          </div>
        `
      );
    } catch (err) {
      console.error("Failed to send resolution email:", err);
    }
  }

  return NextResponse.json({ success: true });
}