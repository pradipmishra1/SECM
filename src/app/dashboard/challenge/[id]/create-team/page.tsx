import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import CreateTeamForm from "@/components/CreateTeamForm";

export default async function CreateTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  if (user.role !== "STUDENT") redirect("/dashboard");

  const challenge = await prisma.challenge.findUnique({ where: { id }, select: { id: true, title: true, maxTeamSize: true } });
  if (!challenge) notFound();

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: "#14132B", marginBottom: 6 }}>
        Create a Team
      </h1>
      <p style={{ color: "rgba(20,19,43,0.5)", fontSize: 14, marginBottom: 24 }}>
        for {challenge.title}{challenge.maxTeamSize ? ` · max ${challenge.maxTeamSize} members` : ""}
      </p>
      <CreateTeamForm challengeId={challenge.id} />
    </DashboardLayout>
  );
}