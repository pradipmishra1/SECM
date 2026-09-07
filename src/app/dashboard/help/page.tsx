import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import HelpCenterView from "@/components/HelpCenterView";

export default async function HelpPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  return (
    <DashboardLayout role={user.role} userName={user.name} userImage={user.image} userEmail={user.email} emailVerified={user.emailVerified}>
      <HelpCenterView />
    </DashboardLayout>
  );
}