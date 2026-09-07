import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { sendMail } from "@/lib/mailer";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can announce winners" }, { status: 403 });
  }
  const body = await req.json();
  const position = parseInt(body.position);
  if (![1, 2, 3].includes(position)) {
    return NextResponse.json({ error: "Position must be 1, 2, or 3" }, { status: 400 });
  }
  const existingAtPosition = await prisma.winner.findFirst({
    where: { challengeId: body.challengeId, position },
  });
  if (existingAtPosition && existingAtPosition.submissionId !== id) {
    return NextResponse.json({ error: "That position is already taken for this challenge" }, { status: 400 });
  }
    const existingForSubmission = await prisma.winner.findUnique({ where: { submissionId: id } });
  const isNewWinner = !existingForSubmission;
  let winner;
  if (existingForSubmission) {
    winner = await prisma.winner.update({
      where: { submissionId: id },
      data: { position },
    });
  } else {
    winner = await prisma.winner.create({
      data: { challengeId: body.challengeId, submissionId: id, position },
    });
  }

  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      challenge: { select: { title: true, prizeFirst: true, prizeSecond: true, prizeThird: true } },
      team: { include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
  if (submission && isNewWinner) {
    const recipients = submission.userId && submission.user
      ? [submission.user]
      : (submission.team?.members.map((m) => m.user) || []);

    const medal = position === 1 ? "🏆" : position === 2 ? "🥈" : "🥉";
    const positionLabel = position === 1 ? "1st" : position === 2 ? "2nd" : "3rd";
    const prizeAmount = position === 1 ? submission.challenge.prizeFirst : position === 2 ? submission.challenge.prizeSecond : submission.challenge.prizeThird;
    const prizeLine = prizeAmount ? ` You've won ${prizeAmount}!` : "";

    for (const recipient of recipients) {
      await createNotification({
        userId: recipient.id,
        type: "WINNER_ANNOUNCED",
        title: `${medal} You won ${positionLabel} place!`,
        message: `Congrats! You placed #${position} in "${submission.challenge.title}".${prizeLine}`,
        link: "/dashboard/wins",
      });
      await prisma.message.create({
        data: {
          senderId: user.id,
          receiverId: recipient.id,
          content: `Congratulations! Your submission to "${submission.challenge.title}" has been selected as the ${positionLabel} place winner.${prizeLine} Great work, and thank you for participating!`,
        },
      });


      if (recipient.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        await sendMail(
          recipient.email,
          `${medal} You won ${positionLabel} place in "${submission.challenge.title}"!`,
          `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; max-width: 520px; margin: 0 auto; background:#F6F5FB; padding: 40px 20px;">
            <div style="background:#ffffff; border-radius:20px; overflow:hidden; box-shadow: 0 4px 20px rgba(20,19,43,0.06);">

              <div style="background: linear-gradient(135deg,#6D4AFF,#8B5CF6); padding: 36px 32px 30px; text-align:center;">
                <div style="font-size: 44px; margin-bottom: 10px; line-height:1;">${medal}</div>
                <p style="color:rgba(255,255,255,0.85); font-size:13px; font-weight:700; letter-spacing:1px; text-transform:uppercase; margin:0 0 6px;">${positionLabel} Place Winner</p>
                <h1 style="color:#ffffff; font-size:22px; font-weight:700; margin:0; font-family: 'Segoe UI', Arial, sans-serif;">Congratulations, ${recipient.name}!</h1>
              </div>

              <div style="padding: 32px;">
                <p style="color:#14132B; font-size:15px; line-height:1.7; margin:0 0 20px;">
                  Your submission to <strong>${submission.challenge.title}</strong> stood out among the competition and has been selected as the <strong>${positionLabel} place</strong> winner. Well deserved!
                </p>

                ${prizeAmount ? `
                <table role="presentation" width="100%" style="background:#FFF7E8; border:1px solid rgba(217,119,6,0.2); border-radius:14px; margin: 0 0 24px;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="color:#92400E; font-size:12px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase; margin:0 0 4px;">Your Prize</p>
                      <p style="color:#14132B; font-size:20px; font-weight:800; margin:0; font-family: 'Segoe UI', Arial, sans-serif;">🎁 ${prizeAmount}</p>
                    </td>
                  </tr>
                </table>
                ` : ""}

                <p style="color:rgba(20,19,43,0.6); font-size:14px; line-height:1.7; margin:0 0 26px;">
                  Thank you for putting in the effort and creativity that made this possible. Log in to SECM to view your win and coordinate with the organizer about receiving your prize.
                </p>

                <table role="presentation" width="100%">
                  <tr>
                    <td align="center">
                      <a href="${appUrl}/dashboard/wins" style="display:inline-block; background: linear-gradient(135deg,#6D4AFF,#8B5CF6); color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:12px; font-weight:700; font-size:14px; font-family: 'Segoe UI', Arial, sans-serif;">
                        View My Wins
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <div style="padding: 18px 32px; border-top:1px solid rgba(15,23,42,0.06); text-align:center;">
                <p style="color:rgba(20,19,43,0.35); font-size:11.5px; margin:0;">SECM — Student Engagement & Challenge Management</p>
              </div>

            </div>
          </div>
          `
        );
      }
    }
  }
  return NextResponse.json({ winner });}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can remove winners" }, { status: 403 });
  }

  const existing = await prisma.winner.findUnique({ where: { submissionId: id } });
  if (!existing) {
    return NextResponse.json({ error: "No winner record found" }, { status: 404 });
  }

  await prisma.winner.delete({ where: { submissionId: id } });
  return NextResponse.json({ success: true });
}