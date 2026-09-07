import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import AnalyticsView from "@/components/AnalyticsView";

export default async function AnalyticsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ORGANIZER") redirect("/dashboard");

  const organizerProfile = await prisma.organizerProfile.findUnique({ where: { userId: user.id } });
  if (!organizerProfile) redirect("/dashboard/setup-profile");

  const challenges = await prisma.challenge.findMany({
    where: { organizerId: organizerProfile.id },
    select: {
      id: true,
      title: true,
      type: true,
      status: true,
      createdAt: true,
      deadline: true,
      _count: { select: { submissions: true, participations: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const submissions = await prisma.submission.findMany({
    where: { challenge: { organizerId: organizerProfile.id } },
    select: { submittedAt: true, challengeId: true, review: { select: { score: true } } },
  });

  const winners = await prisma.winner.count({
    where: { challenge: { organizerId: organizerProfile.id } },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name} emailVerified={user.emailVerified}>
      <AnalyticsView challenges={JSON.parse(JSON.stringify(challenges))} submissions={JSON.parse(JSON.stringify(submissions))} totalWinners={winners} />
    </DashboardLayout>
  );
}