import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import ChallengeDetail from "@/components/ChallengeDetail";

export default async function ChallengeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      organizer: true,
      tags: true,
      teams: { include: { members: true } },
      participations: true,
    },
  });

  if (!challenge) notFound();

  const myParticipation = await prisma.participation.findFirst({
    where: { challengeId: id, userId: user.id },
  });

  const myTeam = await prisma.team.findFirst({
    where: { challengeId: id, members: { some: { userId: user.id } } },
    include: { members: true },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <ChallengeDetail
        challenge={JSON.parse(JSON.stringify(challenge))}
        role={user.role}
        alreadyJoined={!!myParticipation}
        myTeam={JSON.parse(JSON.stringify(myTeam))}
      />
    </DashboardLayout>
  );
}