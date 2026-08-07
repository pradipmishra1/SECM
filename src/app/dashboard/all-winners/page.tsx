import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import AdminAllWinners from "@/components/AdminAllWinners";

export default async function AllWinnersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <AdminAllWinners />
    </DashboardLayout>
  );
}