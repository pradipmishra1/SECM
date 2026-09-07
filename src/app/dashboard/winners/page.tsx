import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import WinnersManager from "@/components/WinnersManager";

export default async function WinnersPage({
  searchParams,
}: {
  searchParams: Promise<{ challenge?: string }>;
}) {
  const { challenge: challengeIdParam } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  if (user.role !== "ORGANIZER") redirect("/dashboard");

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    include: { subscription: true },
  });
  if (!organizerProfile) redirect("/dashboard/setup-profile");

  const aiReviewFlag = await prisma.featureFlag.findUnique({ where: { key: "AI_REVIEW" } });
  const hasActiveSubscription =
    organizerProfile.subscription?.status === "ACTIVE" &&
    new Date(organizerProfile.subscription.expiresAt) > new Date();
  const aiReviewEnabled = !!aiReviewFlag?.enabled && hasActiveSubscription;

  const myChallenges = await prisma.challenge.findMany({
    where: { organizerId: organizerProfile.id },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });

  const filterChallengeId = challengeIdParam || myChallenges[0]?.id;

  const submissions = filterChallengeId
    ? await prisma.submission.findMany({
        where: { challengeId: filterChallengeId },
        include: {
          user: true,
          team: true,
          review: true,
          winner: true,
        },
        orderBy: [{ review: { score: "desc" } }],
      })
    : [];

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Winners
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>
        Announce 1st, 2nd, and 3rd place for your challenges.
      </p>
           <WinnersManager
        challenges={myChallenges}
        selectedChallengeId={filterChallengeId || ""}
        submissions={JSON.parse(JSON.stringify(submissions))}
        aiReviewEnabled={aiReviewEnabled}
      />
    </DashboardLayout>
  );
}