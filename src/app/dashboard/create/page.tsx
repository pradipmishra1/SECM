import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardLayout from "@/components/DashboardLayout";
import CreateChallengeForm from "@/components/CreateChallengeForm";

export default async function CreateChallengePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ORGANIZER") {
    redirect("/dashboard");
  }

  const organizerProfile = await prisma.organizerProfile.findUnique({
    where: { userId: user.id },
    select: { isVerified: true },
  });

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <CreateChallengeForm isVerified={!!organizerProfile?.isVerified} />
    </DashboardLayout>
  );
}