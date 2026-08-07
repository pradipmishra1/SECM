import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import WinsGrid from "@/components/WinsGrid";

export default async function WinsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  const myTeamIds = (await prisma.team.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } })).map((t) => t.id);

  const wins = await prisma.winner.findMany({
    where: { submission: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] } },
    include: { challenge: true },
    orderBy: { announcedAt: "desc" },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>My Wins</h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>Your victories across challenges.</p>
      <WinsGrid wins={JSON.parse(JSON.stringify(wins))} />
    </DashboardLayout>
  );
}