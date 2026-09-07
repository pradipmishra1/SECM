import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeLeaderboard } from "@/lib/leaderboard";
import DashboardLayout from "@/components/DashboardLayout";
import LeaderboardView from "@/components/LeaderboardView";
export default async function LeaderboardPage() {  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  const globalBoard = await computeLeaderboard();
  const challenges = await prisma.challenge.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
  });
  return (
        <DashboardLayout role={user.role} userName={user.name}>
      <LeaderboardView globalBoard={globalBoard} challenges={challenges} currentUserName={user.name} />
    </DashboardLayout>
  );
}