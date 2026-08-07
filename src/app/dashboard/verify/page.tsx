import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";
import VerifyOrganizers from "@/components/VerifyOrganizers";

export default async function VerifyPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const user = session.user as any;
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <DashboardLayout role={user.role} userName={user.name}>
      <VerifyOrganizers />
    </DashboardLayout>
  );
}