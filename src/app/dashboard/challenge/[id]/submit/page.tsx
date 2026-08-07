import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import SubmitWorkForm from "@/components/SubmitWorkForm";

export default async function SubmitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  if (user.role !== "STUDENT") redirect("/dashboard");

  const challenge = await prisma.challenge.findUnique({ where: { id }, select: { id: true, title: true, deadline: true } });
  if (!challenge) notFound();

  const myTeam = await prisma.team.findFirst({
    where: { challengeId: id, members: { some: { userId: user.id } } },
  });

  const existingSubmission = await prisma.submission.findFirst({
    where: {
      challengeId: id,
      OR: [{ userId: user.id }, { teamId: myTeam?.id }],
    },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Submit Your Work
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>
        for {challenge.title} · deadline {new Date(challenge.deadline).toLocaleString()}
      </p>
      {myTeam && (
        <div
          style={{
            background: "rgba(109,74,255,0.06)",
            color: "#6D4AFF",
            fontSize: 13,
            fontWeight: 600,
            padding: "10px 16px",
            borderRadius: 10,
            marginBottom: 20,
            maxWidth: 560,
          }}
        >
          👥 Submitting as your team: <strong>{myTeam.name}</strong>
        </div>
      )}
      <SubmitWorkForm
        challengeId={challenge.id}
        teamId={myTeam?.id || null}
        existing={JSON.parse(JSON.stringify(existingSubmission))}
      />
    </DashboardLayout>
  );
}