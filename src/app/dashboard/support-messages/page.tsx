import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import SupportMessagesView from "@/components/SupportMessagesView";

export default async function SupportMessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <DashboardLayout role={user.role} userName={user.name} userImage={user.image} userEmail={user.email} emailVerified={user.emailVerified}>
      <SupportMessagesView />
    </DashboardLayout>
  );
}