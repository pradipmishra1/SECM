import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import MessagesApp from "@/components/MessagesApp";

export default async function MessagesPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <MessagesApp currentUserId={user.id} />
    </DashboardLayout>
  );
}