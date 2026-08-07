import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ pidx?: string; status?: string }>;
}) {
  const { pidx, status } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  if (!pidx || status !== "Completed") {
    redirect("/dashboard/create?payment=failed");
  }

  const lookupRes = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
    method: "POST",
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  const lookupData = await lookupRes.json();

  if (lookupData.status !== "Completed") {
    redirect("/dashboard/create?payment=failed");
  }

  const organizerProfile = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
  if (!organizerProfile) redirect("/dashboard");

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await prisma.subscription.upsert({
    where: { organizerId: organizerProfile.id },
    create: {
      organizerId: organizerProfile.id,
      status: "ACTIVE",
      plan: "AI_REVIEW_MONTHLY",
      amount: lookupData.total_amount,
      provider: "khalti",
      providerRef: pidx,
      expiresAt,
    },
    update: {
      status: "ACTIVE",
      providerRef: pidx,
      startedAt: new Date(),
      expiresAt,
    },
  });

  redirect("/dashboard/create?payment=success");
}