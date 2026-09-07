import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import SubmissionsListView from "@/components/SubmissionsListView";
export default async function SubmissionsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  const myTeamIds = (await prisma.team.findMany({ where: { members: { some: { userId: user.id } } }, select: { id: true } })).map((t) => t.id);
  const submissions = await prisma.submission.findMany({
    where: { OR: [{ userId: user.id }, { teamId: { in: myTeamIds } }] },
    include: { challenge: true, review: true },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>My Submissions</h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>Track your submitted work and feedback.</p>
      <SubmissionsListView submissions={JSON.parse(JSON.stringify(submissions))} />
    </DashboardLayout>
  );
}