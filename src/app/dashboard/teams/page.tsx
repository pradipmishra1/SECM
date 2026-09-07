import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import TeamsGrid from "@/components/TeamsGrid";

export default async function TeamsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

   const [teams, invites] = await Promise.all([
    prisma.team.findMany({
      where: { members: { some: { userId: user.id } } },
      include: { members: { include: { user: true } }, challenge: true },
      orderBy: { id: "desc" },
    }),
    prisma.teamInvite.findMany({
      where: { invitedUserId: user.id, status: "PENDING" },
      include: { team: { include: { challenge: true } }, invitedBy: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        My Teams
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>Teams you've created or joined.</p>
      <TeamsGrid
        teams={JSON.parse(JSON.stringify(teams))}
        userId={user.id}
        invites={JSON.parse(JSON.stringify(invites))}
      />
    </DashboardLayout>
  );
}