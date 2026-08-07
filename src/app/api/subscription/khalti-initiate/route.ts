import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const AI_REVIEW_PRICE_NPR = 99;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Only organizers can subscribe" }, { status: 403 });
  }

  const organizerProfile = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
  if (!organizerProfile) {
    return NextResponse.json({ error: "Complete your organizer profile first" }, { status: 400 });
  }

  const amountPaisa = AI_REVIEW_PRICE_NPR * 100; // Khalti uses paisa

  const khaltiRes = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: `${process.env.BETTER_AUTH_URL}/dashboard/billing/verify`,
      website_url: process.env.BETTER_AUTH_URL,
      amount: amountPaisa,
      purchase_order_id: `ai_review_${organizerProfile.id}_${Date.now()}`,
      purchase_order_name: "SECM AI Review — Monthly",
      customer_info: {
        name: user.name,
        email: user.email,
      },
    }),
  });

  if (!khaltiRes.ok) {
    const errText = await khaltiRes.text();
    console.error("Khalti initiate failed:", errText);
    return NextResponse.json({ error: "Payment initiation failed. Try again." }, { status: 500 });
  }

  const khaltiData = await khaltiRes.json();
  return NextResponse.json({ paymentUrl: khaltiData.payment_url, pidx: khaltiData.pidx });
}